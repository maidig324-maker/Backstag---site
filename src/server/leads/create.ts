import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import {
  POLICY_VERSION,
  UTM_KEYS,
  UUID_V4,
  validateLead,
  type LeadApiResponse,
  type LeadContext,
  type LeadFields,
} from "@/lib/leads";
import type { LeadsConfig } from "./config";
import { logEvent } from "./log";
import { processQueue } from "./notify";
import type { Mailer } from "./resend";
import type { Rpc } from "./supabase";
import type { TurnstileCheck } from "./turnstile";

export const MAX_BODY_BYTES = 8 * 1024;
export const MIN_FILL_MS = 2500;

export type HandlerResult = {
  status: number;
  body: LeadApiResponse;
  headers?: Record<string, string>;
  /** Trabalho para depois da resposta (after() do Next.js). */
  after?: () => Promise<unknown>;
};

export type CreateDeps = {
  config: LeadsConfig;
  rpc: Rpc;
  turnstile: TurnstileCheck;
  mailer: Mailer;
};

const hmac = (secret: string, kind: string, v: string) => createHmac("sha256", secret).update(`${kind}:${v}`).digest("hex");

/** Impressão digital do conteúdo do envio (detecta reuso do envio_id com outros dados). */
export function envioHash(envioId: string, d: LeadFields): string {
  return createHash("sha256")
    .update(JSON.stringify([envioId, d.nome, d.empresa, d.whatsapp, d.servico, d.necessidade]))
    .digest("hex");
}

/** IP do visitante informado pela Vercel (o primeiro da lista é o cliente). */
export function clientIp(h: Headers): string | null {
  const v = h.get("x-vercel-forwarded-for") ?? h.get("x-forwarded-for") ?? h.get("x-real-ip");
  const ip = v?.split(",")[0]?.trim();
  return ip && ip.length <= 64 ? ip : null;
}

const ORIGIN_RULES: [RegExp, string][] = [
  [/(^|\.)google\./, "google"],
  [/(^|\.)(instagram\.com|l\.instagram\.com)$/, "instagram"],
  [/(^|\.)(facebook\.com|fb\.com|m\.facebook\.com|l\.facebook\.com)$/, "facebook"],
  [/(^|\.)(linkedin\.com|lnkd\.in)$/, "linkedin"],
  [/(^|\.)(whatsapp\.com|wa\.me)$/, "whatsapp"],
  [/(^|\.)tiktok\.com$/, "tiktok"],
  [/(^|\.)(youtube\.com|youtu\.be)$/, "youtube"],
  [/(^|\.)(mail\.google\.com|outlook\.live\.com|mail\.yahoo\.com)$/, "email"],
];

/** Classifica a origem pela campanha (utm_source) ou pelo site de origem. */
export function classifyOrigin(referencia: string | undefined, utmSource: string | undefined): string {
  const src = (utmSource ?? "").toLowerCase();
  if (src) {
    for (const k of ["google", "instagram", "facebook", "linkedin", "whatsapp", "tiktok", "youtube"]) if (src.includes(k)) return k;
    if (src === "ig") return "instagram";
    if (src === "fb" || src === "meta") return "facebook";
    if (src.includes("mail") || src === "newsletter") return "email";
  }
  if (!referencia) return "direto";
  for (const [re, name] of ORIGIN_RULES) if (re.test(referencia)) return name;
  return "outro";
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, max) : "");

/** Contexto de origem, reduzido ao mínimo: só caminhos e o domínio de origem. */
function cleanContext(raw: unknown, ownHosts: string[]): Required<Pick<LeadContext, "pagina_envio" | "pagina_entrada" | "referencia">> &
  Record<(typeof UTM_KEYS)[number], string> {
  const c = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const path = (v: unknown) => {
    const s = str(v, 300);
    return s.startsWith("/") && !s.startsWith("//") ? s.split("#")[0] : "";
  };
  let ref = str(c.referencia, 200).toLowerCase().replace(/^www\./, "");
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(ref) || ownHosts.includes(ref)) ref = "";
  const out = { pagina_envio: path(c.pagina_envio), pagina_entrada: path(c.pagina_entrada), referencia: ref } as ReturnType<typeof cleanContext>;
  for (const k of UTM_KEYS) out[k] = str(c[k], 150);
  return out;
}

function sameOrigin(origin: string | null, allowed: string[]): boolean {
  if (!origin) return false;
  return allowed.some((a) => {
    const x = Buffer.from(a);
    const y = Buffer.from(origin);
    return x.length === y.length && timingSafeEqual(x, y);
  });
}

const json = (status: number, body: LeadApiResponse, extra?: Partial<HandlerResult>): HandlerResult => ({ status, body, ...extra });

/**
 * POST /api/leads — registra o lead antes de qualquer outra coisa.
 * Só responde "ok" depois que o banco confirma a gravação.
 */
export async function handleCreateLead(req: Request, deps: CreateDeps): Promise<HandlerResult> {
  const { config: cfg } = deps;
  const t0 = Date.now();

  // 1) origem, tipo e tamanho
  if (!sameOrigin(req.headers.get("origin"), cfg.allowedOrigins)) {
    logEvent("lead_recusado", { codigo: "origem", ambiente: cfg.ambiente }, "warn");
    return json(403, { ok: false, erro: "origem" });
  }
  if (!(req.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) {
    return json(415, { ok: false, erro: "invalido" });
  }
  const declared = Number(req.headers.get("content-length") ?? "0");
  if (declared > MAX_BODY_BYTES) return json(413, { ok: false, erro: "invalido" });
  const raw = await req.text();
  if (Buffer.byteLength(raw) > MAX_BODY_BYTES) return json(413, { ok: false, erro: "invalido" });

  let body: Record<string, unknown>;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    body = parsed as Record<string, unknown>;
  } catch {
    return json(400, { ok: false, erro: "invalido" });
  }

  // 2) formato e regras (as mesmas do navegador, aplicadas de novo)
  const envioId = typeof body.envio_id === "string" ? body.envio_id.toLowerCase() : "";
  if (!UUID_V4.test(envioId)) return json(400, { ok: false, erro: "invalido" });

  const lead = (body.lead && typeof body.lead === "object" ? body.lead : {}) as Record<string, unknown>;
  const v = validateLead(lead);
  if (!v.ok) return json(400, { ok: false, erro: "invalido", campos: v.errors });
  if (body.ciencia_politica !== true) return json(400, { ok: false, erro: "invalido" });

  // 3) sinais de robô (complementares ao Turnstile; nunca usados sozinhos)
  const trap = (body.armadilha && typeof body.armadilha === "object" ? body.armadilha : {}) as Record<string, unknown>;
  const tempo = typeof trap.tempo_ms === "number" ? trap.tempo_ms : 0;
  if ((typeof trap.site === "string" && trap.site.length > 0) || tempo < MIN_FILL_MS) {
    logEvent("lead_recusado", { codigo: "sinal_robo", ambiente: cfg.ambiente }, "warn");
    return json(400, { ok: false, erro: "verificacao" });
  }

  const hash = envioHash(envioId, v.data);

  // 4) reenvio após resultado incerto: o mesmo envio já foi gravado?
  //    (antes do Turnstile, porque o token anterior já pode ter sido usado)
  const prior = await deps.rpc<{ resultado: string; protocolo?: string }>("leads_consultar_envio", { envio_id: envioId, envio_hash: hash });
  if (prior.ok && prior.data?.resultado === "existente" && prior.data.protocolo) {
    logEvent("lead_repetido", { protocolo: prior.data.protocolo, etapa: "consulta", ambiente: cfg.ambiente });
    return json(200, { ok: true, protocolo: prior.data.protocolo, repetido: true });
  }
  if (prior.ok && prior.data?.resultado === "conflito") return json(409, { ok: false, erro: "conflito" });
  if (!prior.ok) {
    logEvent("banco_indisponivel", { codigo: prior.kind === "http" ? `http_${prior.status}` : prior.kind, etapa: "consulta" }, "error");
    return json(503, { ok: false, erro: "indisponivel", incerto: false });
  }

  // 5) Turnstile, verificado no servidor
  const ip = clientIp(req.headers);
  const ts = await deps.turnstile(typeof body.turnstile_token === "string" ? body.turnstile_token : "", ip, envioId);
  if (!ts.ok) {
    logEvent("lead_recusado", { codigo: ts.codigo, ambiente: cfg.ambiente }, "warn");
    return json(403, { ok: false, erro: "verificacao" });
  }

  // 6) gravação atômica (limites + lead + notificação pendente + auditoria)
  let host = "";
  try {
    host = new URL(cfg.allowedOrigins[0]).host.replace(/^www\./, "");
  } catch {}
  const ctx = cleanContext(body.contexto, [host]);
  const reg = await deps.rpc<{ resultado: string; protocolo?: string; lead_id?: string; tentar_apos_segundos?: number }>(
    "leads_registrar",
    {
      envio_id: envioId,
      envio_hash: hash,
      ip_hash: hmac(cfg.hashSecret, "ip", ip ?? "desconhecido"),
      telefone_hash: hmac(cfg.hashSecret, "tel", v.data.whatsapp),
      notificar: cfg.notifyTo,
      ambiente: cfg.ambiente,
      versao_politica: POLICY_VERSION,
      lead: { ...v.data, ...ctx, origem: classifyOrigin(ctx.referencia, ctx.utm_source) },
    },
    9000,
  );

  if (!reg.ok) {
    // tempo esgotado ou queda de rede: a gravação PODE ter acontecido.
    const incerto = reg.kind !== "http";
    logEvent("banco_indisponivel", { codigo: reg.kind === "http" ? `http_${reg.status}` : reg.kind, etapa: "registro", incerto }, "error");
    if (reg.kind === "http" && reg.status === 400) return json(400, { ok: false, erro: "invalido" });
    return json(503, { ok: false, erro: "indisponivel", incerto });
  }

  const d = reg.data;
  switch (d?.resultado) {
    case "criado":
    case "existente": {
      const created = d.resultado === "criado";
      logEvent(created ? "lead_registrado" : "lead_repetido", {
        protocolo: d.protocolo,
        lead_id: d.lead_id,
        ambiente: cfg.ambiente,
        duracao_ms: Date.now() - t0,
        etapa: "registro",
      });
      return json(
        created ? 201 : 200,
        { ok: true, protocolo: d.protocolo!, ...(created ? {} : { repetido: true }) },
        created && d.lead_id
          ? {
              after: async () => {
                const deps2 = { rpc: deps.rpc, mailer: deps.mailer, from: cfg.notifyFrom };
                // primeiro o aviso deste lead; depois, até 3 avisos antigos pendentes
                await processQueue(deps2, { limite: 1, leadId: d.lead_id, etapa: "imediata" });
                await processQueue(deps2, { limite: 3, etapa: "carona" });
              },
            }
          : undefined,
      );
    }
    case "limitado": {
      const s = Math.max(60, Number(d.tentar_apos_segundos) || 600);
      logEvent("lead_limitado", { ambiente: cfg.ambiente }, "warn");
      return json(429, { ok: false, erro: "limitado", tentar_apos_segundos: s }, { headers: { "Retry-After": String(s) } });
    }
    case "conflito":
      return json(409, { ok: false, erro: "conflito" });
    default:
      return json(400, { ok: false, erro: "invalido" });
  }
}
