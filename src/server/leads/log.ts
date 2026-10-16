/**
 * Registro de eventos SEM dados pessoais. Só os campos desta lista podem
 * ser registrados; qualquer outro é descartado. Nunca registre o corpo da
 * requisição, nome, telefone, empresa, e-mail ou mensagens de erro de
 * terceiros (elas podem repetir valores enviados).
 */
const ALLOWED = new Set([
  "protocolo",
  "lead_id",
  "notificacao_id",
  "codigo",
  "status",
  "http",
  "duracao_ms",
  "tentativa",
  "quantidade",
  "ambiente",
  "etapa",
  "incerto",
]);

type Value = string | number | boolean | null | undefined;

/** Mantém só letras, números e _.:- — remove qualquer coisa que pareça dado. */
function safe(v: Value): Value {
  if (typeof v !== "string") return v;
  return v.replace(/[^a-zA-Z0-9_.:-]/g, "_").slice(0, 80);
}

export function logEvent(evento: string, fields: Record<string, Value> = {}, level: "info" | "warn" | "error" = "info") {
  const out: Record<string, Value> = { app: "backstag-leads", evento: safe(evento) };
  for (const [k, v] of Object.entries(fields)) if (ALLOWED.has(k)) out[k] = safe(v);
  const line = JSON.stringify(out);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}
