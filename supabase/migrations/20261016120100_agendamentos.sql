-- =====================================================================
-- BACKSTAG — Tarefa diária de retenção (LGPD), dentro do próprio banco.
-- Requer a extensão pg_cron (Supabase: Database → Extensions → pg_cron).
-- Não serve para manter o projeto ativo: apenas aplica o prazo de guarda
-- (12 meses para leads não convertidos) e limpa o controle anti-abuso.
-- =====================================================================
create extension if not exists pg_cron;

select cron.unschedule(jobid) from cron.job where jobname = 'backstag-retencao-leads';
select cron.schedule('backstag-retencao-leads', '17 6 * * *', $$select crm.aplicar_retencao()$$);
