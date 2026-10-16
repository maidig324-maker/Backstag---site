import { callJson, type CallResult } from "./http";
import type { LeadsConfig } from "./config";

/**
 * Chama uma função (RPC) do Supabase com a chave secreta do servidor.
 * As tabelas não são acessíveis pela API; só estas funções existem.
 */
export type RpcName =
  | "leads_consultar_envio"
  | "leads_registrar"
  | "leads_reservar_notificacoes"
  | "leads_concluir_notificacao"
  | "leads_falhar_notificacao"
  | "leads_resumo_notificacoes";

export type Rpc = <T>(fn: RpcName, p: Record<string, unknown>, timeoutMs?: number) => Promise<CallResult<T>>;

export function supabaseRpc(cfg: Pick<LeadsConfig, "supabaseUrl" | "supabaseKey">): Rpc {
  return (fn, p, timeoutMs = 8000) => {
    const headers: Record<string, string> = {
      apikey: cfg.supabaseKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    // Chave antiga (JWT service_role) também precisa ir no Authorization.
    if (cfg.supabaseKey.startsWith("eyJ")) headers.Authorization = `Bearer ${cfg.supabaseKey}`;
    return callJson(`${cfg.supabaseUrl}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers,
      body: JSON.stringify({ p }),
      timeoutMs,
    });
  };
}
