import { callJson } from "./http";
import type { LeadsConfig } from "./config";

export const TURNSTILE_ACTION = "lead";

export type TurnstileCheck = (token: string, ip: string | null, idempotencyKey: string) => Promise<{ ok: boolean; codigo: string }>;

type SiteverifyResponse = {
  success: boolean;
  hostname?: string;
  action?: string;
  "error-codes"?: string[];
};

/**
 * Verificação no servidor do Cloudflare Turnstile. Confere sucesso, ação
 * e (quando configurado) o endereço do site. Cada token vale uma vez.
 */
export function turnstileVerifier(cfg: Pick<LeadsConfig, "turnstileSecret" | "turnstileVerifyUrl" | "turnstileHostnames">): TurnstileCheck {
  return async (token, ip, idempotencyKey) => {
    if (!token || token.length > 2048) return { ok: false, codigo: "turnstile_ausente" };
    const form = new URLSearchParams({ secret: cfg.turnstileSecret, response: token, idempotency_key: idempotencyKey });
    if (ip) form.set("remoteip", ip);
    const r = await callJson<SiteverifyResponse>(cfg.turnstileVerifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
      timeoutMs: 6000,
    });
    if (!r.ok) return { ok: false, codigo: r.kind === "http" ? `turnstile_http_${r.status}` : `turnstile_${r.kind}` };
    const d = r.data;
    if (!d?.success) return { ok: false, codigo: `turnstile_${(d?.["error-codes"]?.[0] ?? "recusado").replace(/[^a-z-]/g, "")}` };
    if (d.action && d.action !== TURNSTILE_ACTION) return { ok: false, codigo: "turnstile_acao" };
    if (cfg.turnstileHostnames.length && !cfg.turnstileHostnames.includes(d.hostname ?? "")) return { ok: false, codigo: "turnstile_hostname" };
    return { ok: true, codigo: "ok" };
  };
}
