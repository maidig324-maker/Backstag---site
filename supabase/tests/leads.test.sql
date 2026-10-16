-- Testes da migração de leads. Executar como superusuário num banco
-- descartável, depois de 00_emulacao_supabase.sql e da migração.
-- Qualquer falha interrompe com "FALHOU: ...".
\set ON_ERROR_STOP on
set client_min_messages = notice;

create or replace function pg_temp.ok(cond boolean, nome text) returns void language plpgsql as $$
begin
  if cond is not true then raise exception 'FALHOU: %', nome; end if;
  raise notice 'ok - %', nome;
end $$;

create or replace function pg_temp.payload(envio uuid, ip text, tel text, nome text default 'Maria Teste') returns jsonb language sql as $$
  select jsonb_build_object(
    'envio_id', envio, 'envio_hash', encode(sha256(convert_to(envio::text || nome, 'UTF8')), 'hex'),
    'ip_hash', encode(sha256(convert_to('ip' || ip, 'UTF8')), 'hex'),
    'telefone_hash', encode(sha256(convert_to('tel' || tel, 'UTF8')), 'hex'),
    'notificar', 'backstagsuporte@gmail.com', 'ambiente', 'homologacao', 'versao_politica', '2026-10',
    'lead', jsonb_build_object('nome', nome, 'empresa', 'Empresa Teste', 'whatsapp', '5521' || tel,
      'servico', 'Gestão Empresarial', 'necessidade', 'Preciso organizar a operação da empresa.',
      'origem', 'instagram', 'referencia', 'instagram.com', 'pagina_envio', '/', 'pagina_entrada', '/',
      'utm_source', 'instagram'));
$$;

create or replace function pg_temp.lead(n int) returns uuid language sql as $$
  select id from crm.leads order by numero offset n - 1 limit 1;
$$;

create or replace function pg_temp.negado(papel text, sql text) returns boolean language plpgsql as $$
begin
  execute format('set local role %I', papel);
  begin
    execute sql;
  exception when insufficient_privilege then
    reset role; return true;
  end;
  reset role; return false;
end $$;

-- ---------------------------------------------------------------- acesso
begin;
select pg_temp.ok(pg_temp.negado('anon', 'select * from crm.leads'), 'anon não lê leads');
select pg_temp.ok(pg_temp.negado('anon', 'select * from crm.vw_leads_exportacao'), 'anon não lê exportação');
select pg_temp.ok(pg_temp.negado('authenticated', 'select * from crm.leads'), 'authenticated não lê leads');
select pg_temp.ok(pg_temp.negado('anon', $q$select public.leads_registrar('{}'::jsonb)$q$), 'anon não executa registrar');
select pg_temp.ok(pg_temp.negado('authenticated', $q$select public.leads_registrar('{}'::jsonb)$q$), 'authenticated não executa registrar');
select pg_temp.ok(pg_temp.negado('anon', $q$select public.leads_reservar_notificacoes('{}'::jsonb)$q$), 'anon não reserva notificações');
select pg_temp.ok(pg_temp.negado('anon', $q$select public.leads_consultar_envio('{"envio_id":"00000000-0000-0000-0000-000000000000"}'::jsonb)$q$), 'anon não consulta envio');
select pg_temp.ok(pg_temp.negado('anon', $q$insert into crm.leads (envio_id) values (gen_random_uuid())$q$), 'anon não insere direto');
select pg_temp.ok(pg_temp.negado('anon', 'select crm.aplicar_retencao()'), 'anon não executa retenção');
select pg_temp.ok(not exists (select 1 from pg_namespace n where n.nspname = 'crm' and has_schema_privilege('anon', n.oid, 'USAGE')), 'esquema crm fechado para anon');
select pg_temp.ok((select bool_and(relrowsecurity and relforcerowsecurity) from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'crm' and c.relkind = 'r'), 'RLS forçada em todas as tabelas');
commit;

-- ---------------------------------------------------------------- registro
set role service_role;
select pg_temp.ok((public.leads_registrar(pg_temp.payload('11111111-1111-4111-8111-111111111111', 'A', '987654321')) ->> 'resultado') = 'criado', 'service_role registra lead');
reset role;
select pg_temp.ok((select protocolo from crm.leads) = 'BKS-000001', 'protocolo sequencial BKS-000001');
select pg_temp.ok((select status::text from crm.leads) = 'novo', 'status inicial Novo lead');
select pg_temp.ok((select excluir_apos::date from crm.leads) = (now() + interval '12 months')::date, 'retenção de 12 meses calculada');
select pg_temp.ok((select count(*) from crm.lead_notificacoes where status = 'pendente') = 1, 'notificação nasce pendente junto com o lead');
select pg_temp.ok((select destinatario from crm.lead_notificacoes) = 'backstagsuporte@gmail.com', 'destinatário backstagsuporte@gmail.com');

set role service_role;
select pg_temp.ok((public.leads_registrar(pg_temp.payload('11111111-1111-4111-8111-111111111111', 'A', '987654321')) ->> 'protocolo') = 'BKS-000001', 'mesmo envio_id devolve o mesmo protocolo');
select pg_temp.ok((public.leads_registrar(pg_temp.payload('11111111-1111-4111-8111-111111111111', 'A', '987654321', 'Outro Nome')) ->> 'resultado') = 'conflito', 'mesmo envio_id com dados diferentes = conflito');
select pg_temp.ok((public.leads_consultar_envio(pg_temp.payload('11111111-1111-4111-8111-111111111111', 'A', '987654321')) ->> 'protocolo') = 'BKS-000001', 'consulta por envio_id encontra o protocolo');
select pg_temp.ok((public.leads_consultar_envio(pg_temp.payload('22222222-2222-4222-8222-222222222222', 'A', '987654321')) ->> 'resultado') = 'nao_encontrado', 'consulta de envio inexistente');
reset role;
select pg_temp.ok((select count(*) from crm.leads) = 1, 'repetições não duplicaram o lead');
select pg_temp.ok((select count(*) from crm.lead_notificacoes) = 1, 'repetições não duplicaram a notificação');

-- dados inválidos são barrados pelo próprio banco
do $$ begin
  set local role service_role;
  begin
    perform public.leads_registrar(jsonb_set(pg_temp.payload(gen_random_uuid(), 'X', '911112222'), '{lead,whatsapp}', '"123"'));
    raise exception 'FALHOU: whatsapp inválido aceito';
  exception when check_violation then raise notice 'ok - banco recusa WhatsApp inválido';
  end;
end $$;
do $$ begin
  set local role service_role;
  begin
    perform public.leads_registrar(jsonb_set(pg_temp.payload(gen_random_uuid(), 'X', '911112222'), '{lead,necessidade}', to_jsonb(repeat('a', 2001))));
    raise exception 'FALHOU: texto longo aceito';
  exception when check_violation then raise notice 'ok - banco recusa texto acima de 2000 caracteres';
  end;
end $$;

-- ---------------------------------------------------------------- limites
set role service_role;
select public.leads_registrar(pg_temp.payload(gen_random_uuid(), 'B', '9000000' || lpad(i::text, 2, '0'))) from generate_series(1, 5) i;
select pg_temp.ok((public.leads_registrar(pg_temp.payload(gen_random_uuid(), 'B', '900000099')) ->> 'resultado') = 'limitado', '6º envio da mesma rede em 10 min é limitado');
select public.leads_registrar(pg_temp.payload(gen_random_uuid(), 'C' || i, '955554444')) from generate_series(1, 3) i;
select pg_temp.ok((public.leads_registrar(pg_temp.payload(gen_random_uuid(), 'D', '955554444')) ->> 'resultado') = 'limitado', '4º envio do mesmo telefone no dia é limitado');
reset role;
select pg_temp.ok((select count(*) from crm.leads) = 9, 'envios limitados não foram gravados');
select pg_temp.ok((select count(*) from crm.controle_envios where chave_hash ~ '^[0-9a-f]{64}$' or chave_hash = 'global') = (select count(*) from crm.controle_envios), 'controle guarda só códigos embaralhados');

-- ---------------------------------------------------------------- notificações
-- isola: só a notificação do primeiro lead participa
update crm.lead_notificacoes set status = 'cancelada' where lead_id <> pg_temp.lead(1);

set role service_role;
select pg_temp.ok(jsonb_array_length(public.leads_reservar_notificacoes('{"limite":5}')) = 1, 'reserva a notificação pendente');
select pg_temp.ok(jsonb_array_length(public.leads_reservar_notificacoes('{"limite":5}')) = 0, 'notificação reservada não é entregue a outro processo');
reset role;
select pg_temp.ok((select tentativas from crm.lead_notificacoes where status = 'enviando') = 1, 'tentativa contada');

-- falha conhecida → nova tentativa com espera
select id as nid from crm.lead_notificacoes where status = 'enviando' \gset
set role service_role;
select public.leads_falhar_notificacao(jsonb_build_object('notificacao_id', :'nid', 'erro', 'resend_500'));
reset role;
select pg_temp.ok((select status::text from crm.lead_notificacoes where lead_id = pg_temp.lead(1)) = 'falhou', 'falha registrada');
select pg_temp.ok((select proxima_tentativa_em > now() from crm.lead_notificacoes where status = 'falhou'), 'próxima tentativa agendada no futuro');
set role service_role;
select pg_temp.ok(jsonb_array_length(public.leads_reservar_notificacoes('{"limite":5}')) = 0, 'não reenvia antes da hora');
reset role;
update crm.lead_notificacoes set proxima_tentativa_em = now() - interval '1 second' where status = 'falhou';
set role service_role;
select pg_temp.ok(jsonb_array_length(public.leads_reservar_notificacoes('{"limite":5}')) = 1, 'reenvia quando chega a hora');
select public.leads_concluir_notificacao(jsonb_build_object('notificacao_id', :'nid', 'provedor_id', 're_123'));
reset role;
select pg_temp.ok((select status::text from crm.lead_notificacoes where lead_id = pg_temp.lead(1)) = 'enviada', 'confirmação marca como enviada');

-- controle persistente: enviada nunca volta para a fila, mesmo muito tempo depois
update crm.lead_notificacoes set enviado_em = now() - interval '30 days', primeira_tentativa_em = now() - interval '30 days',
       proxima_tentativa_em = now() - interval '30 days', reservado_ate = now() - interval '30 days' where status = 'enviada';
set role service_role;
select pg_temp.ok(jsonb_array_length(public.leads_reservar_notificacoes('{"limite":25}')) = 0, 'enviada não é reenviada após 30 dias');
select pg_temp.ok((public.leads_concluir_notificacao(jsonb_build_object('notificacao_id', :'nid', 'provedor_id', 'x')) ->> 'resultado') = 'ignorado', 'confirmação repetida é ignorada');
reset role;
select pg_temp.ok((select count(*) from crm.lead_eventos where tipo = 'notificacao_enviada') = 1, 'evento de envio registrado uma vez');

-- resultado incerto: reserva vence sem confirmação
update crm.lead_notificacoes set status = 'pendente', tentativas = 0, primeira_tentativa_em = null, proxima_tentativa_em = now(),
       chave_idempotencia = chave_idempotencia || 'b' where lead_id = pg_temp.lead(2);
set role service_role;
select pg_temp.ok(jsonb_array_length(public.leads_reservar_notificacoes('{"limite":5}')) = 1, 'reserva lead 2');
reset role;
update crm.lead_notificacoes set reservado_ate = now() - interval '1 second' where status = 'enviando';
set role service_role;
select pg_temp.ok((public.leads_reservar_notificacoes('{"limite":5}') -> 0 ->> 'tentativa') = '2', 'reserva vencida é retomada dentro da janela (mesma chave)');
reset role;
select pg_temp.ok((select houve_incerteza from crm.lead_notificacoes where status = 'enviando'), 'retomada marcada como incerta');
update crm.lead_notificacoes set reservado_ate = now() - interval '1 second', primeira_tentativa_em = now() - interval '24 hours' where status = 'enviando';
set role service_role;
select pg_temp.ok(jsonb_array_length(public.leads_reservar_notificacoes('{"limite":5}')) = 0, 'incerta fora da janela de 23 h não é reenviada');
reset role;
select pg_temp.ok((select status::text from crm.lead_notificacoes where lead_id = pg_temp.lead(2)) = 'verificar', 'incerta fora da janela vai para verificar');

-- esgotamento após o máximo de tentativas
update crm.lead_notificacoes set status = 'pendente', tentativas = 0, houve_incerteza = false, primeira_tentativa_em = null,
       proxima_tentativa_em = now(), max_tentativas = 3, chave_idempotencia = chave_idempotencia || 'c'
 where lead_id = pg_temp.lead(3);
do $$ declare i int; n jsonb; begin
  set local role service_role;
  for i in 1..3 loop
    n := public.leads_reservar_notificacoes('{"limite":5}');
    if jsonb_array_length(n) <> 1 then raise exception 'FALHOU: tentativa % não reservada', i; end if;
    perform public.leads_falhar_notificacao(jsonb_build_object('notificacao_id', n -> 0 ->> 'notificacao_id', 'erro', 'resend_503'));
    reset role;
    update crm.lead_notificacoes set proxima_tentativa_em = now() - interval '1 second' where status = 'falhou';
    set local role service_role;
  end loop;
  if jsonb_array_length(public.leads_reservar_notificacoes('{"limite":5}')) <> 0 then raise exception 'FALHOU: esgotada foi reservada'; end if;
  raise notice 'ok - para após o máximo de tentativas';
end $$;
select pg_temp.ok((select status::text from crm.lead_notificacoes where lead_id = pg_temp.lead(3)) = 'esgotada', 'status esgotada');
select id as eid from crm.lead_notificacoes where status = 'esgotada' \gset
set role service_role;
select pg_temp.ok((public.leads_reabrir_notificacao(jsonb_build_object('notificacao_id', :'eid', 'ator', 'teste')) ->> 'resultado') = 'ok', 'reabertura manual');
reset role;
select pg_temp.ok((select chave_idempotencia ~ '-2$' from crm.lead_notificacoes where lead_id = pg_temp.lead(3)), 'reabertura usa nova chave');
select pg_temp.ok((select count(*) = 0 from crm.lead_eventos e where e.detalhe::text ~* '(maria|empresa teste|5521|gmail)'), 'auditoria sem dados pessoais');

-- ---------------------------------------------------------------- status e retenção
update crm.leads set status = 'em_contato' where id = pg_temp.lead(4);
update crm.leads set status = 'cliente' where id = pg_temp.lead(5);
select pg_temp.ok((select count(*) from crm.lead_eventos where tipo = 'status_alterado') = 2, 'mudanças de status registradas');
select pg_temp.ok((select convertido_em is not null and excluir_apos is null from crm.leads where id = pg_temp.lead(5)), 'cliente: data de conversão e fora da exclusão automática');
update crm.leads set ultima_interacao_em = now() - interval '13 months' where id in (pg_temp.lead(5), pg_temp.lead(6));
select pg_temp.ok((select crm.aplicar_retencao() ->> 'leads_removidos') = '1', 'retenção remove só o não convertido vencido');
select pg_temp.ok((select count(*) from crm.leads where status = 'cliente') = 1 and (select count(*) from crm.leads where ultima_interacao_em < now() - interval '12 months' and status <> 'cliente') = 0, 'cliente preservado, vencido removido');
select pg_temp.ok((select count(*) from crm.vw_leads_exportacao) = (select count(*) from crm.leads), 'visão de exportação');
select pg_temp.ok((select "Status" from crm.vw_leads_exportacao where "Protocolo" = 'BKS-000001') = 'Novo lead', 'exportação com status em português');
update crm.leads set ambiente = 'producao';
select pg_temp.ok((select taxa_conversao_pct from crm.vw_funil_origem limit 1) is not null, 'funil calcula taxa de conversão');

\echo TODOS_OS_TESTES_SQL_PASSARAM
