/**
 * Configuração do servidor de leads. Lida apenas no servidor: nenhuma
 * destas variáveis tem prefixo NEXT_PUBLIC_, então nunca vão para o navegador.
 *
 * Separação de ambientes: LEADS_AMBIENTE precisa bater com o ambiente da
 * Vercel (Production → "producao"; Preview/desenvolvimento → "homologacao").
 * Se não bater, a API recusa — assim uma chave de produção colocada por
 * engano na prévia (ou o contrário) não grava nada.
 */
export type Ambiente = "homologacao" | "producao";

export type LeadsConfig = {
  ambiente: Ambiente;
  supabaseUrl: string;
  supabaseKey: string;
  hashSecret: string;
  turnstileSecret: string;
  turnstileVerifyUrl: string;
  turnstileHostnames: string[];
  allowedOrigins: string[];
  resendKey: string | null;
  resendApiUrl: string;
  notifyTo: string;
  notifyFrom: string | null;
  cronSecret: string | null;
  reprocessSecret: string | null;
};

export type ConfigResult = { ok: true; config: LeadsConfig } | { ok: false; missing: string[] };

const list = (v: string | undefined) =>
  (v ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export function readConfig(env: Record<string, string | undefined> = process.env): ConfigResult {
  const missing: string[] = [];
  const need = (k: string) => {
    const v = env[k]?.trim();
    if (!v) missing.push(k);
    return v ?? "";
  };

  const vercelEnv = env.VERCEL_ENV; // production | preview | development | undefined
  const expected: Ambiente = vercelEnv === "production" ? "producao" : "homologacao";
  const declared = env.LEADS_AMBIENTE?.trim();
  if (declared !== expected) missing.push(`LEADS_AMBIENTE=${expected}`);

  const supabaseUrl = need("SUPABASE_URL").replace(/\/+$/, "");
  const supabaseKey = need("SUPABASE_SECRET_KEY");
  const hashSecret = need("LEADS_HASH_SECRET");
  const turnstileSecret = need("TURNSTILE_SECRET_KEY");
  if (hashSecret && hashSecret.length < 32) missing.push("LEADS_HASH_SECRET (mínimo 32 caracteres)");

  // Origens permitidas: as configuradas + os endereços da própria implantação na Vercel.
  const origins = new Set(list(env.LEADS_ALLOWED_ORIGINS));
  for (const host of [env.VERCEL_URL, env.VERCEL_BRANCH_URL, expected === "producao" ? env.VERCEL_PROJECT_PRODUCTION_URL : undefined]) {
    if (host) origins.add(`https://${host}`);
  }
  if (origins.size === 0) missing.push("LEADS_ALLOWED_ORIGINS");

  const turnstileHostnames = list(env.TURNSTILE_HOSTNAMES);
  if (expected === "producao" && turnstileHostnames.length === 0) missing.push("TURNSTILE_HOSTNAMES");

  // Endereços alternativos só existem para testes automáticos — nunca em produção.
  const allowOverride = expected !== "producao";
  const turnstileVerifyUrl =
    (allowOverride && env.LEADS_TEST_TURNSTILE_URL) || "https://challenges.cloudflare.com/turnstile/v0/siteverify";
  const resendApiUrl = (allowOverride && env.LEADS_TEST_RESEND_URL) || "https://api.resend.com";

  if (missing.length) return { ok: false, missing };
  return {
    ok: true,
    config: {
      ambiente: expected,
      supabaseUrl,
      supabaseKey,
      hashSecret,
      turnstileSecret,
      turnstileVerifyUrl,
      turnstileHostnames,
      allowedOrigins: [...origins],
      resendKey: env.RESEND_API_KEY?.trim() || null,
      resendApiUrl,
      notifyTo: (env.LEADS_NOTIFY_TO?.trim() || "backstagsuporte@gmail.com").toLowerCase(),
      notifyFrom: env.LEADS_NOTIFY_FROM?.trim() || null,
      cronSecret: env.CRON_SECRET?.trim() || null,
      reprocessSecret: env.LEADS_REPROCESS_SECRET?.trim() || null,
    },
  };
}
