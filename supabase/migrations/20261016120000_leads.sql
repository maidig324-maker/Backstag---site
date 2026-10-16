-- =====================================================================
-- BACKSTAG — Leads do formulário de diagnóstico
-- Aplicar no SQL Editor do Supabase (um projeto por ambiente:
-- homologação e produção). Idempotente: pode ser executada de novo.
--
-- Princípios:
--  * As tabelas ficam no esquema privado "crm", que NÃO é exposto pela
--    API do Supabase. Nada é lido ou gravado diretamente pela internet.
--  * RLS ligada em todas as tabelas, sem nenhuma permissão pública.
--  * O site grava apenas por funções (RPC) que só o papel do servidor
--    (service_role / chave secreta) pode executar.
--  * Nenhum IP ou telefone em texto puro no controle anti-abuso: o
--    servidor envia apenas códigos embaralhados (HMAC).
-- =====================================================================

create schema if not exists crm;
revoke all on schema crm from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'anon') then execute 'revoke all on schema crm from anon'; end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then execute 'revoke all on schema crm from authenticated'; end if;
end $$;

-- ---------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------
do $$ begin
  create type crm.lead_status as enum ('novo', 'em_contato', 'qualificado', 'proposta_enviada', 'cliente', 'descartado');
exception when duplicate_object then null; end $$;

do $$ begin
  -- pendente: aguardando envio | enviando: reservada por um processo
  -- enviada: confirmada pelo provedor | falhou: tentará de novo
  -- esgotada: atingiu o limite de tentativas | verificar: resultado incerto
  -- fora da janela de idempotência do provedor (exige conferência manual)
  -- cancelada: não será enviada
  create type crm.notificacao_status as enum ('pendente', 'enviando', 'enviada', 'falhou', 'esgotada', 'verificar', 'cancelada');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- Administradores (futuro painel). Vazia até o painel existir.
-- ---------------------------------------------------------------------
create table if not exists crm.administradores (
  user_id   uuid primary key,          -- auth.users.id do Supabase Auth
  nome      text not null check (char_length(nome) between 2 and 120),
  criado_em timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Leads
-- ---------------------------------------------------------------------
create table if not exists crm.leads (
  id                  uuid primary key default gen_random_uuid(),
  numero              bigint generated always as identity unique,
  protocolo           text generated always as ('BKS-' || lpad(numero::text, 6, '0')) stored unique,
  criado_em           timestamptz not null default now(),
  atualizado_em       timestamptz not null default now(),

  -- idempotência: um envio do formulário = um cadastro
  envio_id            uuid not null unique,
  envio_hash          text not null check (envio_hash ~ '^[0-9a-f]{64}$'),

  -- dados informados pelo visitante
  nome                text not null check (char_length(nome) between 2 and 120),
  empresa             text not null check (char_length(empresa) between 2 and 160),
  whatsapp            text not null check (whatsapp ~ '^55[1-9]{2}[0-9]{8,9}$'),
  servico             text not null check (char_length(servico) between 2 and 80),
  necessidade         text not null check (char_length(necessidade) between 10 and 2000),

  -- origem
  canal_entrada       text not null default 'formulario_site' check (canal_entrada in ('formulario_site', 'manual')),
  origem              text not null default 'direto'
                      check (origem in ('google', 'instagram', 'facebook', 'linkedin', 'whatsapp', 'tiktok', 'youtube', 'email', 'direto', 'outro')),
  referencia          text check (char_length(referencia) <= 200),
  pagina_envio        text check (char_length(pagina_envio) <= 300),
  pagina_entrada      text check (char_length(pagina_entrada) <= 300),
  utm_source          text check (char_length(utm_source) <= 150),
  utm_medium          text check (char_length(utm_medium) <= 150),
  utm_campaign        text check (char_length(utm_campaign) <= 150),
  utm_content         text check (char_length(utm_content) <= 150),
  utm_term            text check (char_length(utm_term) <= 150),
  ambiente            text not null check (ambiente in ('homologacao', 'producao')),

  -- gestão comercial
  status              crm.lead_status not null default 'novo',
  status_alterado_em  timestamptz not null default now(),
  convertido_em       timestamptz,
  motivo_descarte     text check (char_length(motivo_descarte) <= 300),
  responsavel         uuid references crm.administradores(user_id) on delete set null,

  -- LGPD: ciência da política (não é consentimento) e retenção
  ciencia_politica_em timestamptz not null,
  versao_politica     text not null check (char_length(versao_politica) between 1 and 40),
  ultima_interacao_em timestamptz not null default now(),
  excluir_apos        timestamptz
);

create index if not exists leads_criado_em_idx on crm.leads (criado_em desc);
create index if not exists leads_status_idx    on crm.leads (status);
create index if not exists leads_origem_idx    on crm.leads (origem, criado_em);
create index if not exists leads_excluir_idx   on crm.leads (excluir_apos) where excluir_apos is not null;

-- ---------------------------------------------------------------------
-- Histórico / auditoria (sem dados pessoais no campo "detalhe")
-- ---------------------------------------------------------------------
create table if not exists crm.lead_eventos (
  id        bigint generated always as identity primary key,
  lead_id   uuid not null references crm.leads(id) on delete cascade,
  tipo      text not null check (tipo in (
              'lead_criado', 'envio_repetido', 'status_alterado',
              'notificacao_enviada', 'notificacao_falhou', 'notificacao_esgotada',
              'notificacao_verificar', 'notificacao_reaberta')),
  detalhe   jsonb not null default '{}'::jsonb,
  ator      text not null default 'sistema' check (char_length(ator) <= 80),
  criado_em timestamptz not null default now()
);
create index if not exists lead_eventos_lead_idx on crm.lead_eventos (lead_id, criado_em);

-- ---------------------------------------------------------------------
-- Notificações: controle persistente (não depende só do provedor)
-- ---------------------------------------------------------------------
create table if not exists crm.lead_notificacoes (
  id                    uuid primary key default gen_random_uuid(),
  lead_id               uuid not null references crm.leads(id) on delete cascade,
  tipo                  text not null default 'novo_lead' check (tipo in ('novo_lead')),
  canal                 text not null default 'email' check (canal in ('email')),
  destinatario          text not null check (destinatario ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  status                crm.notificacao_status not null default 'pendente',
  tentativas            int not null default 0 check (tentativas >= 0),
  max_tentativas        int not null default 8 check (max_tentativas between 1 and 20),
  proxima_tentativa_em  timestamptz default now(),
  reservado_ate         timestamptz,
  primeira_tentativa_em timestamptz,
  ultima_tentativa_em   timestamptz,
  houve_incerteza       boolean not null default false, -- alguma tentativa sem resposta conhecida
  enviado_em            timestamptz,
  provedor_id           text check (char_length(provedor_id) <= 120),
  ultimo_erro           text check (char_length(ultimo_erro) <= 120), -- só código, nunca dados pessoais
  chave_idempotencia    text not null unique,
  criado_em             timestamptz not null default now(),
  atualizado_em         timestamptz not null default now(),
  unique (lead_id, tipo, destinatario)
);
create index if not exists lead_notif_fila_idx on crm.lead_notificacoes (status, proxima_tentativa_em);

-- ---------------------------------------------------------------------
-- Controle anti-abuso (apenas códigos embaralhados; limpo diariamente)
-- ---------------------------------------------------------------------
create table if not exists crm.controle_envios (
  id         bigint generated always as identity primary key,
  chave_tipo text not null check (chave_tipo in ('ip', 'telefone', 'global')),
  chave_hash text not null check (chave_hash ~ '^[0-9a-f]{64}$' or chave_hash = 'global'),
  criado_em  timestamptz not null default now()
);
create index if not exists controle_envios_idx on crm.controle_envios (chave_tipo, chave_hash, criado_em);

create table if not exists crm.registro_retencao (
  id          bigint generated always as identity primary key,
  executado_em timestamptz not null default now(),
  leads_removidos int not null,
  controles_removidos int not null
);

-- ---------------------------------------------------------------------
-- RLS em tudo, sem permissões públicas
-- ---------------------------------------------------------------------
alter table crm.administradores   enable row level security;
alter table crm.leads             enable row level security;
alter table crm.lead_eventos      enable row level security;
alter table crm.lead_notificacoes enable row level security;
alter table crm.controle_envios   enable row level security;
alter table crm.registro_retencao enable row level security;

alter table crm.administradores   force row level security;
alter table crm.leads             force row level security;
alter table crm.lead_eventos      force row level security;
alter table crm.lead_notificacoes force row level security;
alter table crm.controle_envios   force row level security;
alter table crm.registro_retencao force row level security;

revoke all on all tables    in schema crm from public;
revoke all on all sequences in schema crm from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on all tables in schema crm from anon';
    execute 'revoke all on all sequences in schema crm from anon';
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on all tables in schema crm from authenticated';
    execute 'revoke all on all sequences in schema crm from authenticated';
  end if;
end $$;

-- Preparado para o futuro painel: só quem estiver em crm.administradores.
-- (Hoje é inerte: o esquema crm não é exposto e não há permissões.)
create or replace function crm.eh_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from crm.administradores a
    where a.user_id = (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')::uuid
  );
$$;
revoke all on function crm.eh_admin() from public;

do $$ begin
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'drop policy if exists painel_leitura on crm.leads';
    execute 'create policy painel_leitura on crm.leads for select to authenticated using (crm.eh_admin())';
    execute 'drop policy if exists painel_status on crm.leads';
    execute 'create policy painel_status on crm.leads for update to authenticated using (crm.eh_admin()) with check (crm.eh_admin())';
    execute 'drop policy if exists painel_eventos on crm.lead_eventos';
    execute 'create policy painel_eventos on crm.lead_eventos for select to authenticated using (crm.eh_admin())';
    execute 'drop policy if exists painel_notificacoes on crm.lead_notificacoes';
    execute 'create policy painel_notificacoes on crm.lead_notificacoes for select to authenticated using (crm.eh_admin())';
  end if;
end $$;

-- ---------------------------------------------------------------------
-- Gatilhos: datas, retenção (12 meses) e histórico de status
-- ---------------------------------------------------------------------
create or replace function crm.tg_leads_antes() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.atualizado_em := now();
  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    new.status_alterado_em := now();
    new.ultima_interacao_em := now();
    if new.status = 'cliente' and new.convertido_em is null then new.convertido_em := now(); end if;
  end if;
  -- leads não convertidos: excluídos 12 meses após a última interação
  new.excluir_apos := case when new.status = 'cliente' then null
                           else new.ultima_interacao_em + interval '12 months' end;
  return new;
end $$;

drop trigger if exists leads_antes on crm.leads;
create trigger leads_antes before insert or update on crm.leads
  for each row execute function crm.tg_leads_antes();

create or replace function crm.tg_leads_status_depois() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.status is distinct from old.status then
    insert into crm.lead_eventos (lead_id, tipo, detalhe, ator)
    values (new.id, 'status_alterado', jsonb_build_object('de', old.status, 'para', new.status),
            coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub', 'sistema'));
  end if;
  return new;
end $$;

drop trigger if exists leads_status_depois on crm.leads;
create trigger leads_status_depois after update of status on crm.leads
  for each row execute function crm.tg_leads_status_depois();

create or replace function crm.tg_notif_atualizado() returns trigger
language plpgsql set search_path = '' as $$
begin new.atualizado_em := now(); return new; end $$;

drop trigger if exists lead_notif_atualizado on crm.lead_notificacoes;
create trigger lead_notif_atualizado before update on crm.lead_notificacoes
  for each row execute function crm.tg_notif_atualizado();

-- ---------------------------------------------------------------------
-- Funções chamadas pelo servidor do site (RPC)
-- Todas recebem um único parâmetro jsonb "p" e devolvem jsonb.
-- ---------------------------------------------------------------------

-- Consulta um envio pelo envio_id (usada antes do Turnstile em reenvios
-- após falha de conexão). Devolve só o protocolo, nunca dados pessoais.
create or replace function public.leads_consultar_envio(p jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v crm.leads%rowtype;
begin
  select * into v from crm.leads where envio_id = (p ->> 'envio_id')::uuid;
  if not found then return jsonb_build_object('resultado', 'nao_encontrado'); end if;
  if v.envio_hash <> (p ->> 'envio_hash') then return jsonb_build_object('resultado', 'conflito'); end if;
  insert into crm.lead_eventos (lead_id, tipo, detalhe) values (v.id, 'envio_repetido', jsonb_build_object('etapa', 'consulta'));
  return jsonb_build_object('resultado', 'existente', 'protocolo', v.protocolo, 'lead_id', v.id);
end $$;

-- Registra o lead de forma atômica:
-- idempotência por envio_id → limites anti-abuso → gravação →
-- notificação pendente → evento de auditoria.
create or replace function public.leads_registrar(p jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  d          jsonb := p -> 'lead';
  v_envio    uuid := (p ->> 'envio_id')::uuid;
  v_hash     text := p ->> 'envio_hash';
  v_ip       text := p ->> 'ip_hash';
  v_tel      text := p ->> 'telefone_hash';
  v_dest     text := p ->> 'notificar';
  v_exist    crm.leads%rowtype;
  v_lead     crm.leads%rowtype;
  v_notif    uuid;
  v_espera   int;
begin
  if v_envio is null or v_hash is null or v_ip is null or v_tel is null then
    return jsonb_build_object('resultado', 'invalido');
  end if;

  -- 1) mesmo envio já registrado? devolve o mesmo protocolo
  select * into v_exist from crm.leads where envio_id = v_envio;
  if found then
    if v_exist.envio_hash <> v_hash then return jsonb_build_object('resultado', 'conflito'); end if;
    insert into crm.lead_eventos (lead_id, tipo, detalhe) values (v_exist.id, 'envio_repetido', jsonb_build_object('etapa', 'registro'));
    return jsonb_build_object('resultado', 'existente', 'protocolo', v_exist.protocolo, 'lead_id', v_exist.id);
  end if;

  -- 2) limites (bloqueios curtos por chave tornam a contagem atômica)
  perform pg_advisory_xact_lock(hashtextextended('crm.limite.ip.' || v_ip, 0));
  perform pg_advisory_xact_lock(hashtextextended('crm.limite.tel.' || v_tel, 0));

  -- o envio pode ter sido gravado por uma requisição concorrente enquanto esperávamos
  select * into v_exist from crm.leads where envio_id = v_envio;
  if found then
    if v_exist.envio_hash <> v_hash then return jsonb_build_object('resultado', 'conflito'); end if;
    return jsonb_build_object('resultado', 'existente', 'protocolo', v_exist.protocolo, 'lead_id', v_exist.id);
  end if;

  v_espera := null;
  if (select count(*) from crm.controle_envios
        where chave_tipo = 'ip' and chave_hash = v_ip and criado_em > now() - interval '10 minutes') >= 5 then
    v_espera := 600;
  elsif (select count(*) from crm.controle_envios
        where chave_tipo = 'ip' and chave_hash = v_ip and criado_em > now() - interval '24 hours') >= 20 then
    v_espera := 3600;
  elsif (select count(*) from crm.controle_envios
        where chave_tipo = 'telefone' and chave_hash = v_tel and criado_em > now() - interval '24 hours') >= 3 then
    v_espera := 3600;
  elsif (select count(*) from crm.controle_envios
        where chave_tipo = 'global' and criado_em > now() - interval '1 hour') >= 60 then
    v_espera := 900;
  end if;
  if v_espera is not null then
    return jsonb_build_object('resultado', 'limitado', 'tentar_apos_segundos', v_espera);
  end if;

  -- 3) grava (envio_id único: cliques simultâneos resultam em um só cadastro)
  insert into crm.leads (
    envio_id, envio_hash, nome, empresa, whatsapp, servico, necessidade,
    canal_entrada, origem, referencia, pagina_envio, pagina_entrada,
    utm_source, utm_medium, utm_campaign, utm_content, utm_term,
    ambiente, ciencia_politica_em, versao_politica)
  values (
    v_envio, v_hash, d ->> 'nome', d ->> 'empresa', d ->> 'whatsapp', d ->> 'servico', d ->> 'necessidade',
    'formulario_site', coalesce(d ->> 'origem', 'direto'), d ->> 'referencia', d ->> 'pagina_envio', d ->> 'pagina_entrada',
    d ->> 'utm_source', d ->> 'utm_medium', d ->> 'utm_campaign', d ->> 'utm_content', d ->> 'utm_term',
    p ->> 'ambiente', now(), p ->> 'versao_politica')
  on conflict (envio_id) do nothing
  returning * into v_lead;

  if v_lead.id is null then
    select * into v_exist from crm.leads where envio_id = v_envio;
    return jsonb_build_object('resultado', 'existente', 'protocolo', v_exist.protocolo, 'lead_id', v_exist.id);
  end if;

  insert into crm.controle_envios (chave_tipo, chave_hash) values ('ip', v_ip), ('telefone', v_tel), ('global', 'global');

  -- 4) notificação pendente, gravada junto com o lead
  if v_dest is not null then
    v_notif := gen_random_uuid();
    insert into crm.lead_notificacoes (id, lead_id, destinatario, chave_idempotencia)
    values (v_notif, v_lead.id, lower(v_dest), 'bks-lead-' || v_notif::text || '-1');
  end if;

  -- 5) auditoria (sem dados pessoais)
  insert into crm.lead_eventos (lead_id, tipo, detalhe)
  values (v_lead.id, 'lead_criado', jsonb_build_object('origem', v_lead.origem, 'canal', v_lead.canal_entrada, 'ambiente', v_lead.ambiente));

  return jsonb_build_object('resultado', 'criado', 'protocolo', v_lead.protocolo, 'lead_id', v_lead.id, 'notificacao_id', v_notif);
end $$;

-- Reserva notificações para envio (fila com "aluguel" de 2 min).
-- Nunca devolve uma notificação já enviada. Envios com resultado incerto
-- só são repetidos dentro da janela de 23 h (a idempotência do provedor
-- vale 24 h); depois disso vão para "verificar" (conferência manual).
create or replace function public.leads_reservar_notificacoes(p jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_limite  int := least(greatest(coalesce((p ->> 'limite')::int, 5), 1), 25);
  v_reserva interval := make_interval(secs => least(greatest(coalesce((p ->> 'reserva_segundos')::int, 120), 30), 900));
  v_lead    uuid := (p ->> 'lead_id')::uuid;
  v_janela  interval := interval '23 hours';
  r         record;
  saida     jsonb := '[]'::jsonb;
begin
  -- incertos fora da janela → verificar
  for r in
    update crm.lead_notificacoes n
       set status = 'verificar', reservado_ate = null, proxima_tentativa_em = null
     where (n.status = 'enviando' and n.reservado_ate < now()
             and (n.primeira_tentativa_em < now() - v_janela or n.tentativas >= n.max_tentativas))
        or (n.status = 'falhou' and n.houve_incerteza and n.primeira_tentativa_em < now() - v_janela)
    returning n.id, n.lead_id
  loop
    insert into crm.lead_eventos (lead_id, tipo, detalhe)
    values (r.lead_id, 'notificacao_verificar', jsonb_build_object('notificacao_id', r.id, 'motivo', 'resultado_incerto_fora_da_janela'));
  end loop;

  for r in
    with alvo as (
      select n.id from crm.lead_notificacoes n
       where (v_lead is null or n.lead_id = v_lead)
         and n.tentativas < n.max_tentativas
         and ( (n.status in ('pendente', 'falhou') and n.proxima_tentativa_em <= now())
            or (n.status = 'enviando' and n.reservado_ate < now()) )
       order by n.proxima_tentativa_em nulls last, n.criado_em
       limit v_limite
       for update skip locked
    )
    update crm.lead_notificacoes n
       set status = 'enviando',
           tentativas = n.tentativas + 1,
           -- reserva vencida sem confirmação = resultado incerto
           houve_incerteza = n.houve_incerteza or n.status = 'enviando',
           reservado_ate = now() + v_reserva,
           primeira_tentativa_em = coalesce(n.primeira_tentativa_em, now()),
           ultima_tentativa_em = now()
      from alvo where n.id = alvo.id
    returning n.id, n.lead_id, n.destinatario, n.chave_idempotencia, n.tentativas
  loop
    saida := saida || jsonb_build_array((
      select jsonb_build_object(
        'notificacao_id', r.id, 'destinatario', r.destinatario, 'chave_idempotencia', r.chave_idempotencia,
        'tentativa', r.tentativas,
        'lead', jsonb_build_object(
          'protocolo', l.protocolo, 'criado_em', l.criado_em, 'nome', l.nome, 'empresa', l.empresa,
          'whatsapp', l.whatsapp, 'servico', l.servico, 'necessidade', l.necessidade, 'origem', l.origem,
          'referencia', l.referencia, 'pagina_envio', l.pagina_envio, 'pagina_entrada', l.pagina_entrada,
          'utm_source', l.utm_source, 'utm_medium', l.utm_medium, 'utm_campaign', l.utm_campaign,
          'ambiente', l.ambiente))
      from crm.leads l where l.id = r.lead_id));
  end loop;

  -- quem atingiu o limite de tentativas
  for r in
    update crm.lead_notificacoes n
       set status = 'esgotada', proxima_tentativa_em = null, reservado_ate = null
     where n.status = 'falhou' and n.tentativas >= n.max_tentativas
    returning n.id, n.lead_id
  loop
    insert into crm.lead_eventos (lead_id, tipo, detalhe)
    values (r.lead_id, 'notificacao_esgotada', jsonb_build_object('notificacao_id', r.id));
  end loop;

  return saida;
end $$;

-- Confirma o envio (o provedor aceitou a mensagem).
create or replace function public.leads_concluir_notificacao(p jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare r record;
begin
  update crm.lead_notificacoes
     set status = 'enviada', enviado_em = now(), reservado_ate = null, proxima_tentativa_em = null,
         provedor_id = left(p ->> 'provedor_id', 120), ultimo_erro = null
   where id = (p ->> 'notificacao_id')::uuid and status in ('enviando', 'falhou', 'verificar')
  returning id, lead_id, tentativas into r;
  if r.id is null then return jsonb_build_object('resultado', 'ignorado'); end if;
  insert into crm.lead_eventos (lead_id, tipo, detalhe)
  values (r.lead_id, 'notificacao_enviada', jsonb_build_object('notificacao_id', r.id, 'tentativa', r.tentativas));
  return jsonb_build_object('resultado', 'ok');
end $$;

-- Registra uma falha. "incerto" = sem resposta conhecida do provedor.
-- "definitivo" = erro que não adianta repetir (ex.: chave inválida).
create or replace function public.leads_falhar_notificacao(p jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  r record;
  v_incerto boolean := coalesce((p ->> 'incerto')::boolean, false);
  v_definitivo boolean := coalesce((p ->> 'definitivo')::boolean, false);
  v_erro text := left(regexp_replace(coalesce(p ->> 'erro', 'erro'), '[^a-zA-Z0-9_.:-]', '_', 'g'), 120);
begin
  update crm.lead_notificacoes n
     set houve_incerteza = n.houve_incerteza or v_incerto,
         ultimo_erro = v_erro,
         reservado_ate = null,
         status = case when v_definitivo or n.tentativas >= n.max_tentativas then 'esgotada'::crm.notificacao_status
                       else 'falhou'::crm.notificacao_status end,
         -- espera crescente: 1, 5, 15, 30 min, 1 h, 2 h, 4 h, 6 h
         proxima_tentativa_em = case when v_definitivo or n.tentativas >= n.max_tentativas then null
           else now() + (array[1, 5, 15, 30, 60, 120, 240, 360])[least(greatest(n.tentativas, 1), 8)] * interval '1 minute' end
   where n.id = (p ->> 'notificacao_id')::uuid and n.status = 'enviando'
  returning n.id, n.lead_id, n.status, n.tentativas into r;
  if r.id is null then return jsonb_build_object('resultado', 'ignorado'); end if;
  insert into crm.lead_eventos (lead_id, tipo, detalhe)
  values (r.lead_id, case when r.status = 'esgotada' then 'notificacao_esgotada' else 'notificacao_falhou' end,
          jsonb_build_object('notificacao_id', r.id, 'tentativa', r.tentativas, 'erro', v_erro, 'incerto', v_incerto));
  return jsonb_build_object('resultado', 'ok', 'status', r.status);
end $$;

-- Resumo da fila (sem dados pessoais) — usado no teste manual.
create or replace function public.leads_resumo_notificacoes(p jsonb) returns jsonb
language sql security definer set search_path = '' as $$
  select coalesce(jsonb_object_agg(status, total), '{}'::jsonb)
    from (select status::text, count(*) total from crm.lead_notificacoes group by status) s;
$$;

-- Reabre uma notificação esgotada ou em "verificar" (decisão manual do
-- futuro painel). Gera nova chave: quem reabre assume o risco de repetir.
create or replace function public.leads_reabrir_notificacao(p jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare r record;
begin
  update crm.lead_notificacoes n
     set status = 'pendente', tentativas = 0, houve_incerteza = false, primeira_tentativa_em = null,
         proxima_tentativa_em = now(), reservado_ate = null,
         chave_idempotencia = 'bks-lead-' || n.id::text || '-' || (coalesce(substring(n.chave_idempotencia from '-([0-9]+)$')::int, 1) + 1)
   where n.id = (p ->> 'notificacao_id')::uuid and n.status in ('esgotada', 'verificar', 'cancelada')
  returning n.id, n.lead_id into r;
  if r.id is null then return jsonb_build_object('resultado', 'ignorado'); end if;
  insert into crm.lead_eventos (lead_id, tipo, detalhe, ator)
  values (r.lead_id, 'notificacao_reaberta', jsonb_build_object('notificacao_id', r.id), coalesce(p ->> 'ator', 'sistema'));
  return jsonb_build_object('resultado', 'ok');
end $$;

-- Retenção: remove leads não convertidos após o prazo e limpa o controle.
create or replace function crm.aplicar_retencao() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_leads int; v_ctrl int;
begin
  delete from crm.leads where status <> 'cliente' and excluir_apos is not null and excluir_apos < now();
  get diagnostics v_leads = row_count;
  delete from crm.controle_envios where criado_em < now() - interval '2 days';
  get diagnostics v_ctrl = row_count;
  insert into crm.registro_retencao (leads_removidos, controles_removidos) values (v_leads, v_ctrl);
  return jsonb_build_object('leads_removidos', v_leads, 'controles_removidos', v_ctrl);
end $$;

-- Somente o servidor (service_role) executa as funções públicas.
do $$
declare f text;
begin
  foreach f in array array[
    'public.leads_consultar_envio(jsonb)', 'public.leads_registrar(jsonb)',
    'public.leads_reservar_notificacoes(jsonb)', 'public.leads_concluir_notificacao(jsonb)',
    'public.leads_falhar_notificacao(jsonb)', 'public.leads_resumo_notificacoes(jsonb)',
    'public.leads_reabrir_notificacao(jsonb)'] loop
    execute format('revoke all on function %s from public', f);
    if exists (select 1 from pg_roles where rolname = 'anon') then execute format('revoke all on function %s from anon', f); end if;
    if exists (select 1 from pg_roles where rolname = 'authenticated') then execute format('revoke all on function %s from authenticated', f); end if;
    if exists (select 1 from pg_roles where rolname = 'service_role') then execute format('grant execute on function %s to service_role', f); end if;
  end loop;
end $$;
revoke all on function crm.aplicar_retencao() from public;

-- ---------------------------------------------------------------------
-- Visões para consulta, exportação (CSV/Excel) e funil de conversão
-- (acessíveis pelo painel do Supabase; não expostas na internet)
-- ---------------------------------------------------------------------
create or replace view crm.vw_leads_exportacao with (security_invoker = true) as
select
  l.protocolo                                                   as "Protocolo",
  to_char(l.criado_em at time zone 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI') as "Data e hora",
  l.nome                                                        as "Nome",
  l.empresa                                                     as "Empresa",
  '+' || l.whatsapp                                             as "WhatsApp",
  l.servico                                                     as "Serviço de interesse",
  l.necessidade                                                 as "Necessidade",
  case l.status when 'novo' then 'Novo lead' when 'em_contato' then 'Em contato'
                when 'qualificado' then 'Qualificado' when 'proposta_enviada' then 'Proposta enviada'
                when 'cliente' then 'Cliente' when 'descartado' then 'Descartado' end as "Status",
  initcap(l.origem)                                             as "Origem",
  l.referencia                                                  as "Site de origem",
  l.pagina_entrada                                              as "Página de entrada",
  l.pagina_envio                                                as "Página do envio",
  l.utm_source as "utm_source", l.utm_medium as "utm_medium", l.utm_campaign as "utm_campaign",
  (select n.status::text from crm.lead_notificacoes n where n.lead_id = l.id order by n.criado_em limit 1) as "Aviso por e-mail",
  l.ambiente                                                    as "Ambiente"
from crm.leads l
order by l.criado_em desc;

create or replace view crm.vw_funil_origem with (security_invoker = true) as
select
  date_trunc('month', l.criado_em at time zone 'America/Sao_Paulo')::date as mes,
  l.origem,
  count(*)                                              as leads,
  count(*) filter (where l.status = 'novo')             as novos,
  count(*) filter (where l.status = 'em_contato')       as em_contato,
  count(*) filter (where l.status = 'qualificado')      as qualificados,
  count(*) filter (where l.status = 'proposta_enviada') as propostas,
  count(*) filter (where l.status = 'cliente')          as clientes,
  count(*) filter (where l.status = 'descartado')       as descartados,
  round(100.0 * count(*) filter (where l.status = 'cliente') / nullif(count(*), 0), 1) as taxa_conversao_pct
from crm.leads l
where l.ambiente = 'producao'
group by 1, 2
order by 1 desc, 3 desc;

revoke all on crm.vw_leads_exportacao, crm.vw_funil_origem from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on crm.vw_leads_exportacao, crm.vw_funil_origem from anon, authenticated';
  end if;
end $$;
