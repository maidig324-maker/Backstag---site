#!/usr/bin/env bash
# Cliques simultâneos e filas concorrentes.
set -euo pipefail
DB="$1"
q() { psql -qtA -v ON_ERROR_STOP=1 -d "$DB" -c "$1"; }
ENVIO=$(q "select gen_random_uuid()")
P="jsonb_build_object('envio_id','$ENVIO','envio_hash',repeat('a',64),'ip_hash',repeat('b',64),'telefone_hash',repeat('c',64),'notificar','backstagsuporte@gmail.com','ambiente','homologacao','versao_politica','t','lead',jsonb_build_object('nome','Concorrencia','empresa','Empresa X','whatsapp','5521912345678','servico','Gestão','necessidade','Teste de cliques simultâneos.'))"
for i in $(seq 1 12); do q "set role service_role; select public.leads_registrar($P) ->> 'protocolo'" > /tmp/bk_c_$i & done
wait
N=$(q "select count(*) from crm.leads where envio_id = '$ENVIO'")
U=$(cat /tmp/bk_c_* | sort -u | wc -l)
rm -f /tmp/bk_c_*
[ "$N" = "1" ] && [ "$U" = "1" ] && echo "ok - 12 cliques simultâneos geraram 1 cadastro e 1 protocolo" || { echo "FALHOU: concorrência ($N cadastros, $U protocolos)"; exit 1; }
# filas concorrentes: cada notificação reservada uma única vez
q "update crm.lead_notificacoes set status='cancelada' where status <> 'enviada'" >/dev/null
q "update crm.lead_notificacoes set status='pendente', tentativas=0, max_tentativas=8, houve_incerteza=false, primeira_tentativa_em=null, proxima_tentativa_em=now(), reservado_ate=null where lead_id=(select id from crm.leads where envio_id='$ENVIO')" >/dev/null
for i in $(seq 1 8); do q "set role service_role; select jsonb_array_length(public.leads_reservar_notificacoes('{\"limite\":25}'))" > /tmp/bk_r_$i & done
wait
T=$(cat /tmp/bk_r_* | paste -sd+ | bc)
rm -f /tmp/bk_r_*
[ "$T" = "1" ] && echo "ok - 8 filas simultâneas reservaram a notificação 1 vez" || { echo "FALHOU: notificação reservada $T vezes"; exit 1; }
echo TESTES_DE_CONCORRENCIA_PASSARAM
