"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { ArrowRight, MessageCircle } from "lucide-react";
import { site } from "@/content/site";
import { opening } from "@/content/opening";
import { primaryContact } from "@/lib/contact";
import { ButtonLink } from "@/components/ui/ButtonLink";

const LOGO = site.logo.src ?? "/brand/backstag-logo.png";

/**
 * TOPO — fixo, sem prender a rolagem.
 * Abre com a logo original em destaque, que se aproxima e some (≈2 s,
 * pura animação CSS; qualquer toque ou rolagem pula direto para o fim).
 * Depois: a mensagem e as cinco áreas de uma empresa sólida, com pontos
 * dourados que brilham em sequência ao longo de uma linha, como as etapas
 * de uma construção. A montagem em camadas acontece na seção Desafios.
 */
export function HeroStages() {
  const ref = useRef<HTMLElement>(null);
  const main = primaryContact();
  const bg = opening.background;

  useEffect(() => {
    const el = ref.current!;
    const html = document.documentElement;
    let timer = 0;
    const finish = () => {
      el.classList.add("hs-skip");
      delete html.dataset.opening;
      stop();
    };
    const events = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    const stop = () => {
      events.forEach((e) => window.removeEventListener(e, finish));
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
    };
    const onScroll = () => window.scrollY > 4 && finish();
    // quem chega no meio da página (voltar, link) não vê a abertura de novo
    if (window.scrollY > 4 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish();
      return;
    }
    html.dataset.opening = "1";
    timer = window.setTimeout(() => {
      delete html.dataset.opening;
      stop();
    }, 2300);
    events.forEach((e) => window.addEventListener(e, finish, { passive: true }));
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      stop();
      delete html.dataset.opening;
    };
  }, []);

  return (
    <section ref={ref} id="topo" aria-label="Apresentação" className="hs relative isolate overflow-hidden">
      {/* fundo empresarial (foto ou vídeo quando aprovados) sobre o ambiente escuro */}
      <div aria-hidden className="hs-scene absolute inset-0 -z-10">
        <span className="hs-depth absolute inset-0" />
        {bg.image && (
          <>
            <Image src={bg.mobileImage ?? bg.image} alt="" fill priority sizes="100vw" className="hs-photo object-cover lg:hidden" />
            <Image src={bg.image} alt="" fill sizes="100vw" className="hs-photo hidden object-cover lg:block" />
          </>
        )}
        {bg.video && <video className="hs-photo absolute inset-0 h-full w-full object-cover" src={bg.video} muted loop playsInline autoPlay preload="metadata" />}
        <span className="hs-floor absolute inset-x-0 bottom-0" />
        <span className="hs-beam hs-beam-a" />
        <span className="hs-beam hs-beam-b" />
        <span className="hs-veil absolute inset-0" />
      </div>

      {/* abertura: a logo original, que se aproxima e desaparece */}
      <div className="hs-logo pointer-events-none absolute left-1/2 top-[46%] z-20 w-[min(76vw,34rem)]">
        <Image src={LOGO} alt={site.fullName} width={2033} height={570} priority sizes="(min-width: 640px) 34rem, 76vw" className="h-auto w-full" />
        <Image src={LOGO} alt="" aria-hidden width={2033} height={570} sizes="(min-width: 640px) 34rem, 76vw" className="hs-reflex h-auto w-full" />
      </div>

      <div className="hs-content container-x grid min-h-[100svh] content-center gap-10 pb-14 pt-28 lg:grid-cols-12 lg:items-center lg:gap-x-12 lg:pb-16 lg:pt-28">
        <div className="text-center lg:col-span-6 lg:text-left">
          <h1 className="hs-in display text-[clamp(1.9rem,7.6vw,4.1rem)] leading-[0.98]" style={{ ["--d" as string]: "0s" } as CSSProperties}>
            {opening.headline[0]} <span className="accent">{opening.headline[1]}</span>
          </h1>
          <p className="hs-in mx-auto mt-5 max-w-md text-[0.95rem] leading-relaxed text-paper/75 lg:mx-0 lg:text-lg" style={{ ["--d" as string]: "0.12s" } as CSSProperties}>
            {opening.concept}
          </p>
          <div className="hs-in mt-8 hidden flex-wrap gap-3 lg:flex" style={{ ["--d" as string]: "0.24s" } as CSSProperties}>
            <ButtonLink href={opening.cta.href} icon={<ArrowRight className="size-4" strokeWidth={1.5} />}>
              {opening.cta.label}
            </ButtonLink>
            <ButtonLink href={main.href} external variant="ghost" icon={<MessageCircle className="size-4" strokeWidth={1.5} />}>
              {main.channel === "whatsapp" ? "Conversar pelo WhatsApp" : "Fale com a Backstag"}
            </ButtonLink>
          </div>
        </div>

        {/* as cinco áreas: pontos que brilham em sequência sobre uma linha */}
        <div className="lg:col-span-6 lg:flex lg:justify-end">
          <ul className="hs-steps relative mx-auto w-full max-w-[22rem] lg:mx-0 lg:max-w-md" aria-label="O que sustenta uma empresa sólida">
            <span aria-hidden className="hs-in hs-rail" style={{ ["--d" as string]: "0.2s" } as CSSProperties} />
            {opening.layers.map((l, i) => (
              <li key={l.id} className="hs-in hs-step relative" style={{ ["--d" as string]: `${0.2 + i * 0.1}s`, ["--i" as string]: i } as CSSProperties}>
                <span aria-hidden className="hs-dot" />
                <p className="hs-name">{l.title}</p>
                <p className="hs-text">{l.text}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* celular: botões depois das áreas */}
        <div className="hs-in flex flex-col items-center gap-3 lg:hidden" style={{ ["--d" as string]: "0.7s" } as CSSProperties}>
          <ButtonLink href={opening.cta.href} icon={<ArrowRight className="size-4" strokeWidth={1.5} />}>
            {opening.cta.label}
          </ButtonLink>
          <ButtonLink href={main.href} external variant="ghost" icon={<MessageCircle className="size-4" strokeWidth={1.5} />}>
            {main.channel === "whatsapp" ? "Conversar pelo WhatsApp" : "Fale com a Backstag"}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
