import { after } from "next/server";
import { handleCreateLead } from "@/server/leads/create";
import { liveDeps, readConfig } from "@/server/leads";
import { logEvent } from "@/server/leads/log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;
export const preferredRegion = "gru1"; // São Paulo, perto do banco

const NO_STORE = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

export async function POST(req: Request) {
  const cfg = readConfig();
  if (!cfg.ok) {
    // configuração ausente ou ambiente trocado: nada é gravado
    logEvent("configuracao_incompleta", { quantidade: cfg.missing.length }, "error");
    return Response.json({ ok: false, erro: "indisponivel", incerto: false }, { status: 503, headers: NO_STORE });
  }
  const r = await handleCreateLead(req, liveDeps(cfg.config));
  if (r.after) {
    const task = r.after;
    // depois da resposta HTTP; falhas ficam registradas na fila do banco
    after(() =>
      task().catch(() => logEvent("notificacao_erro_inesperado", { etapa: "after" }, "error")),
    );
  }
  return Response.json(r.body, { status: r.status, headers: { ...NO_STORE, ...(r.headers ?? {}) } });
}
