import { timingSafeEqual } from "node:crypto";
import type { LeadsConfig } from "./config";
import { logEvent } from "./log";
import { processQueue } from "./notify";
import type { Mailer } from "./resend";
import type { Rpc } from "./supabase";

const eq = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

function bearer(req: Request): string {
  const h = req.headers.get("authorization") ?? "";
  return h.startsWith("Bearer ") ? h.slice(7).trim() : "";
}

/**
 * Reprocessamento da fila de notificações.
 * - GET: chamado pelo agendamento da Vercel (só em Production), com CRON_SECRET.
 * - POST: acionamento manual seguro (homologação ou produção), com
 *   LEADS_REPROCESS_SECRET. Corpo: {"modo":"resumo"} só conta a fila;
 *   {"modo":"processar","limite":N} envia até N avisos.
 * Respostas nunca contêm dados pessoais.
 */
export async function handleReprocess(
  req: Request,
  deps: { config: LeadsConfig; rpc: Rpc; mailer: Mailer },
): Promise<{ status: number; body: Record<string, unknown> }> {
  const { config: cfg } = deps;
  const token = bearer(req);
  const isCron = req.method === "GET";
  const secret = isCron ? cfg.cronSecret : cfg.reprocessSecret;
  if (!secret || secret.length < 32 || !token || !eq(token, secret)) {
    logEvent("reprocesso_negado", { etapa: isCron ? "cron" : "manual", ambiente: cfg.ambiente }, "warn");
    return { status: 401, body: { ok: false } };
  }

  let modo = "processar";
  let limite = 10;
  if (!isCron) {
    try {
      const b = (await req.json()) as { modo?: unknown; limite?: unknown };
      if (b.modo === "resumo") modo = "resumo";
      if (typeof b.limite === "number") limite = Math.min(25, Math.max(1, Math.floor(b.limite)));
    } catch {
      return { status: 400, body: { ok: false } };
    }
  }

  const before = await deps.rpc<Record<string, number>>("leads_resumo_notificacoes", {});
  if (!before.ok) return { status: 503, body: { ok: false, erro: "banco_indisponivel" } };
  if (modo === "resumo") return { status: 200, body: { ok: true, ambiente: cfg.ambiente, fila: before.data } };

  const sum = await processQueue({ rpc: deps.rpc, mailer: deps.mailer, from: cfg.notifyFrom }, { limite, etapa: isCron ? "cron" : "manual" });
  const after = await deps.rpc<Record<string, number>>("leads_resumo_notificacoes", {});
  logEvent("reprocesso", { etapa: isCron ? "cron" : "manual", quantidade: sum.reservadas, ambiente: cfg.ambiente });
  return { status: 200, body: { ok: true, ambiente: cfg.ambiente, ...sum, fila_antes: before.data, fila_depois: after.ok ? after.data : null } };
}
