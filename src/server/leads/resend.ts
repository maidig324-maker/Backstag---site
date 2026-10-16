import { callJson } from "./http";
import type { LeadsConfig } from "./config";

export type EmailMessage = { from: string; to: string; subject: string; text: string; html: string; idempotencyKey: string };

/**
 * enviado: o provedor aceitou (id do e-mail).
 * falha conhecida: o provedor respondeu com erro (não enviou).
 * incerto: sem resposta (tempo esgotado, rede, erro 5xx) — pode ter enviado;
 *          a chave de idempotência evita duplicar se tentarmos de novo em 24 h.
 * definitivo: repetir não adianta (mesma chave com conteúdo diferente).
 */
export type SendResult = { ok: true; id: string } | { ok: false; codigo: string; incerto: boolean; definitivo: boolean };

export type Mailer = (m: EmailMessage) => Promise<SendResult>;

export function resendMailer(cfg: Pick<LeadsConfig, "resendKey" | "resendApiUrl">): Mailer {
  return async (m) => {
    if (!cfg.resendKey) return { ok: false, codigo: "resend_sem_chave", incerto: false, definitivo: false };
    const r = await callJson<{ id?: string }>(`${cfg.resendApiUrl}/emails`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.resendKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": m.idempotencyKey,
      },
      body: JSON.stringify({ from: m.from, to: [m.to], subject: m.subject, text: m.text, html: m.html }),
      timeoutMs: 10000,
    });
    if (r.ok) return r.data?.id ? { ok: true, id: String(r.data.id) } : { ok: false, codigo: "resend_sem_id", incerto: true, definitivo: false };
    if (r.kind !== "http") return { ok: false, codigo: `resend_${r.kind}`, incerto: true, definitivo: false };
    const code = `resend_${r.status}${r.code ? `_${r.code}` : ""}`;
    if (r.status === 409 && r.code === "invalid_idempotent_request") return { ok: false, codigo: code, incerto: false, definitivo: true };
    if (r.status === 409) return { ok: false, codigo: code, incerto: true, definitivo: false }; // outra tentativa em andamento
    return { ok: false, codigo: code, incerto: r.status >= 500, definitivo: false };
  };
}
