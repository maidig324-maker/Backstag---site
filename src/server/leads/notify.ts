import { leadEmail, type QueuedLead } from "./email";
import { logEvent } from "./log";
import type { Mailer } from "./resend";
import type { Rpc } from "./supabase";

type Reserved = {
  notificacao_id: string;
  destinatario: string;
  chave_idempotencia: string;
  tentativa: number;
  lead: QueuedLead;
};

export type QueueSummary = { reservadas: number; enviadas: number; falhas: number; erro_fila?: string };

/**
 * Processa a fila persistente de notificações:
 * reserva no banco → envia pelo Resend (com chave de idempotência) →
 * confirma ou registra a falha. Uma notificação confirmada nunca volta
 * para a fila, independentemente do tempo (controle no banco, não só no
 * provedor).
 */
export async function processQueue(
  deps: { rpc: Rpc; mailer: Mailer; from: string | null },
  opts: { limite: number; leadId?: string; etapa: string },
): Promise<QueueSummary> {
  const sum: QueueSummary = { reservadas: 0, enviadas: 0, falhas: 0 };
  const r = await deps.rpc<Reserved[]>("leads_reservar_notificacoes", {
    limite: opts.limite,
    reserva_segundos: 120,
    ...(opts.leadId ? { lead_id: opts.leadId } : {}),
  });
  if (!r.ok) {
    sum.erro_fila = r.kind === "http" ? `fila_http_${r.status}` : `fila_${r.kind}`;
    logEvent("fila_indisponivel", { codigo: sum.erro_fila, etapa: opts.etapa }, "error");
    return sum;
  }
  const items = Array.isArray(r.data) ? r.data : [];
  sum.reservadas = items.length;

  for (const n of items) {
    const started = Date.now();
    const result = deps.from
      ? await deps.mailer({ ...leadEmail(n.lead), from: deps.from, to: n.destinatario, idempotencyKey: n.chave_idempotencia })
      : ({ ok: false, codigo: "remetente_nao_configurado", incerto: false, definitivo: false } as const);

    if (result.ok) {
      const c = await deps.rpc("leads_concluir_notificacao", { notificacao_id: n.notificacao_id, provedor_id: result.id });
      sum.enviadas++;
      // Se a confirmação não gravar, a reserva vence e a próxima tentativa
      // usa a mesma chave: o provedor reconhece e não envia de novo.
      logEvent("notificacao_enviada", {
        protocolo: n.lead.protocolo,
        notificacao_id: n.notificacao_id,
        tentativa: n.tentativa,
        duracao_ms: Date.now() - started,
        status: c.ok ? "confirmada" : "confirmacao_pendente",
        etapa: opts.etapa,
      });
    } else {
      sum.falhas++;
      await deps.rpc("leads_falhar_notificacao", {
        notificacao_id: n.notificacao_id,
        erro: result.codigo,
        incerto: result.incerto,
        definitivo: result.definitivo,
      });
      logEvent(
        "notificacao_falhou",
        {
          protocolo: n.lead.protocolo,
          notificacao_id: n.notificacao_id,
          tentativa: n.tentativa,
          codigo: result.codigo,
          incerto: result.incerto,
          etapa: opts.etapa,
        },
        "warn",
      );
    }
  }
  return sum;
}
