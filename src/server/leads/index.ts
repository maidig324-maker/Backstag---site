import { readConfig, type LeadsConfig } from "./config";
import { resendMailer } from "./resend";
import { supabaseRpc } from "./supabase";
import { turnstileVerifier } from "./turnstile";

/** Monta as dependências reais a partir das variáveis de ambiente do servidor. */
export function liveDeps(config: LeadsConfig) {
  return {
    config,
    rpc: supabaseRpc(config),
    turnstile: turnstileVerifier(config),
    mailer: resendMailer(config),
  };
}

export { readConfig };
