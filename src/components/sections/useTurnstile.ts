"use client";

import { useCallback, useEffect, useRef } from "react";

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let loader: Promise<void> | null = null;
function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (!loader) {
    loader = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = SRC;
      s.async = true;
      s.defer = true;
      s.onload = () => resolve();
      s.onerror = () => {
        loader = null;
        reject(new Error("turnstile"));
      };
      document.head.appendChild(s);
    });
  }
  return loader;
}

/**
 * Cloudflare Turnstile (verificação anti-robô, invisível na maioria dos
 * casos). O script só é carregado quando o formulário se aproxima da tela.
 * Cada token vale uma vez: depois de usado, o widget gera outro.
 */
export function useTurnstile(siteKey: string | undefined) {
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const token = useRef<string | null>(null);
  const waiters = useRef<((t: string | null) => void)[]>([]);

  const settle = (t: string | null) => {
    token.current = t;
    if (t) waiters.current.splice(0).forEach((w) => w(t));
  };

  useEffect(() => {
    const el = box.current;
    if (!siteKey || !el) return;
    let cancelled = false;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        loadScript()
          .then(() => {
            if (cancelled || !window.turnstile || widget.current) return;
            widget.current = window.turnstile.render(el, {
              sitekey: siteKey,
              action: "lead",
              appearance: "interaction-only",
              theme: "light",
              language: "pt-br",
              callback: (t: string) => settle(t),
              "expired-callback": () => settle(null),
              "error-callback": () => settle(null),
            });
          })
          .catch(() => settle(null));
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
      if (widget.current && window.turnstile) window.turnstile.remove(widget.current);
      widget.current = null;
    };
  }, [siteKey]);

  /** Entrega um token válido, esperando a verificação terminar se preciso. */
  const take = useCallback(async (): Promise<string | null> => {
    if (!siteKey) return null;
    // widget pronto: até 30 s (pode pedir um clique); script não carregou: até 6 s
    const wait = widget.current ? 30000 : 6000;
    const t =
      token.current ??
      (await new Promise<string | null>((resolve) => {
        waiters.current.push(resolve);
        setTimeout(() => resolve(token.current), wait);
      }));
    // token de uso único: pede o próximo para uma eventual nova tentativa
    token.current = null;
    if (widget.current && window.turnstile) window.turnstile.reset(widget.current);
    return t;
  }, [siteKey]);

  return { box, take };
}
