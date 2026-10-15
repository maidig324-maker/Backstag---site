"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/contact";

/**
 * Atalho fixo para o WhatsApp comercial. Aparece depois do hero (onde já
 * existe o botão principal) e some na seção de contato.
 */
export function FloatingWhatsApp() {
  const href = whatsappLink();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const contact = document.getElementById("contato");
      const pastHero = window.scrollY > window.innerHeight * 0.9;
      const atContact = contact ? contact.getBoundingClientRect().top < window.innerHeight * 0.6 : false;
      // some durante as cenas fixas (elas têm o próprio indicador no rodapé)
      const pins = Array.from(document.querySelectorAll<HTMLElement>("[data-pin]"));
      const pinned = pins.some((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= 2 && r.bottom >= window.innerHeight - 2;
      });
      setShow(pastHero && !atContact && !pinned);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conversar pelo WhatsApp (abre em nova aba)"
      tabIndex={show ? 0 : -1}
      className={`fixed right-4 z-[58] inline-flex min-h-12 items-center gap-2 rounded-full bg-gold px-5 text-sm font-medium text-ink shadow-[0_12px_40px_-10px_rgb(215_168_62/0.6)] transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97] md:right-6 ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
      style={{ bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
    >
      <MessageCircle className="size-4" strokeWidth={1.5} aria-hidden />
      WhatsApp
    </a>
  );
}
