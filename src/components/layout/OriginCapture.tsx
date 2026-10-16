"use client";

import { useEffect } from "react";
import { UTM_KEYS, type LeadContext } from "@/lib/leads";

export const ORIGIN_KEY = "bks_origem";

/**
 * Guarda, só nesta sessão do navegador (sem cookies), de onde o visitante
 * chegou: a primeira página, o site de origem e os parâmetros de campanha.
 * Usado apenas se a pessoa enviar o formulário.
 */
export function OriginCapture() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(ORIGIN_KEY)) return;
      const url = new URL(window.location.href);
      const ctx: LeadContext = { pagina_entrada: (url.pathname + url.search).slice(0, 300) };
      if (document.referrer) {
        const ref = new URL(document.referrer);
        if (ref.host !== url.host) ctx.referencia = ref.hostname.replace(/^www\./, "");
      }
      for (const k of UTM_KEYS) {
        const v = url.searchParams.get(k);
        if (v) ctx[k] = v.slice(0, 150);
      }
      sessionStorage.setItem(ORIGIN_KEY, JSON.stringify(ctx));
    } catch {
      // armazenamento indisponível (navegação privada): segue sem origem
    }
  }, []);
  return null;
}

export function readOrigin(): LeadContext {
  try {
    return JSON.parse(sessionStorage.getItem(ORIGIN_KEY) ?? "{}") as LeadContext;
  } catch {
    return {};
  }
}
