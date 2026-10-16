# Leads do formulário de diagnóstico

Fluxo: formulário → `POST /api/leads` (Vercel) → Supabase → resposta com protocolo →
aviso por e-mail (Resend) depois da resposta → botão "Continuar no WhatsApp".

Se a gravação falhar, o visitante vê "Não conseguimos confirmar seu cadastro"
(sem protocolo), com **Tentar novamente** (mesmo envio, sem duplicar) e
**Falar pelo WhatsApp** (mensagem já com os dados preenchidos).

## Ambientes

| | Homologação | Produção |
|---|---|---|
| Vercel | Preview (branch `leads-supabase`) | Production |
| Supabase | projeto de homologação | projeto de produção |
| `LEADS_AMBIENTE` | `homologacao` | `producao` |
| Turnstile | widget com o domínio da prévia | widget com o domínio oficial |
| Reprocessamento da fila | manual (GitHub Actions) | agendamento da Vercel + manual |

A API recusa qualquer envio se `LEADS_AMBIENTE` não corresponder ao ambiente da
Vercel. Variáveis de cada ambiente: ver `.env.example`.

## Banco (Supabase)

1. **Antes de criar projetos, confira as vagas grátis**: o plano gratuito permite
   2 projetos ativos somando todas as organizações em que você é dono/administrador.
2. Crie o projeto na região **South America (São Paulo)**.
3. SQL Editor → cole e execute `supabase/migrations/20261016120000_leads.sql`.
4. (Opcional, retenção automática) Database → Extensions → ative `pg_cron` e
   execute `supabase/migrations/20261016120100_agendamentos.sql`.
5. Project Settings → API Keys → copie a **Secret key** para `SUPABASE_SECRET_KEY`.
   Nunca use a chave secreta em variáveis `NEXT_PUBLIC_`.

As tabelas ficam no esquema privado `crm` (não exposto pela API). Para consultar:
Table Editor → esquema `crm`. Exportar CSV: abra `crm.vw_leads_exportacao` →
Export → CSV (abre no Excel). Funil por origem e taxa de conversão: `crm.vw_funil_origem`.

## Reprocessar avisos na homologação (manual)

A Vercel não executa agendamentos em prévias. Para testar:

1. Vercel → Settings → Deployment Protection → **Protection Bypass for Automation** → gerar segredo.
2. GitHub → Settings → Environments → criar `homologacao` com os segredos
   `LEADS_REPROCESS_SECRET` (o mesmo da Vercel Preview) e `VERCEL_AUTOMATION_BYPASS_SECRET`.
3. GitHub → Actions → **Reprocessar notificações de leads** → Run workflow →
   informe o endereço da prévia e o modo (`resumo` só conta; `processar` envia).

A resposta mostra apenas contagens da fila (sem dados pessoais).

## Estados dos avisos

`pendente` → `enviando` → `enviada` · `falhou` (tenta de novo com espera crescente,
até 8 vezes) · `esgotada` (limite atingido) · `verificar` (resultado incerto há mais
de 23 h — confira na caixa de e-mail antes de reenviar) · `cancelada`.
Um aviso `enviada` nunca é reenviado automaticamente.

## Antes da publicação comercial

- [ ] Vercel Pro e Supabase Pro contratados (com autorização).
- [ ] Em `vercel.json`, trocar o agendamento para `*/10 * * * *` (o plano Hobby só permite 1 por dia).
- [ ] Projeto Supabase de produção com a migração aplicada.
- [ ] Domínio verificado no Resend e `LEADS_NOTIFY_FROM` configurado.
- [ ] Turnstile de produção com `TURNSTILE_HOSTNAMES` do domínio oficial.
- [ ] `LEADS_ALLOWED_ORIGINS` com o domínio oficial.
- [ ] Dados do controlador em `src/content/site.ts` (`legal`) e revisão jurídica da política.
- [ ] Rotina para apagar da caixa de e-mail os avisos com mais de 12 meses.
