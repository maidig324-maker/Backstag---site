/** Resultado de uma chamada externa, sem expor conteúdo de erro. */
export type CallResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; kind: "http"; status: number; code: string | null }
  | { ok: false; kind: "timeout" | "network" };

/**
 * fetch com limite de tempo. "timeout" e "network" significam resultado
 * DESCONHECIDO: a operação pode ter acontecido do outro lado.
 */
export async function callJson<T>(url: string, init: RequestInit & { timeoutMs: number }): Promise<CallResult<T>> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), init.timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal, cache: "no-store" });
    const text = await res.text();
    let body: unknown = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = null;
    }
    if (!res.ok) {
      const b = body as { code?: unknown; name?: unknown } | null;
      const code = typeof b?.code === "string" ? b.code : typeof b?.name === "string" ? b.name : null;
      return { ok: false, kind: "http", status: res.status, code };
    }
    return { ok: true, status: res.status, data: body as T };
  } catch (e) {
    return { ok: false, kind: (e as { name?: string })?.name === "AbortError" ? "timeout" : "network" };
  } finally {
    clearTimeout(timer);
  }
}
