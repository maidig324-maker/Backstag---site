import { handleReprocess } from "@/server/leads/reprocess";
import { liveDeps, readConfig } from "@/server/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const preferredRegion = "gru1";

async function run(req: Request) {
  const cfg = readConfig();
  if (!cfg.ok) return Response.json({ ok: false }, { status: 503, headers: { "Cache-Control": "no-store" } });
  const r = await handleReprocess(req, liveDeps(cfg.config));
  return Response.json(r.body, { status: r.status, headers: { "Cache-Control": "no-store" } });
}

/** Agendamento da Vercel (somente em Production). */
export const GET = run;
/** Acionamento manual seguro (homologação/produção). */
export const POST = run;
