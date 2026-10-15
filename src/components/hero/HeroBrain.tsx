"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import { site } from "@/content/site";
import { opening } from "@/content/opening";
import { whatsappLink, primaryContact } from "@/lib/contact";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { HUBS, buildNetwork, drawNetwork, type Frame } from "./brainNetwork";

const LOGO = site.logo.src ?? "/brand/backstag-logo.png";

/**
 * TOPO — "o cérebro por trás do negócio".
 * Ao abrir: a logo original, que se aproxima e some (≈2 s; tocar ou rolar
 * pula). Depois, a mensagem e uma rede viva de inteligência empresarial.
 * Com a rolagem (o palco fica preso por pouco mais de uma tela):
 * os centros acendem, as conexões se formam, fluxos percorrem a rede,
 * o núcleo ganha força e tudo se organiza num cérebro empresarial.
 * Canvas leve (um desenho por quadro, só com o topo na tela).
 * Movimento reduzido: a rede completa, parada, sem prender a rolagem.
 */
export function HeroBrain() {
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const cueRef = useRef<HTMLDivElement>(null);
  const main = primaryContact();
  const diagnosis = whatsappLink(opening.diagnosisMessage) ?? main.href;

  // abertura com a logo (CSS); o cabeçalho espera a logo sair
  useEffect(() => {
    const el = trackRef.current!;
    const html = document.documentElement;
    let timer = 0;
    const events = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    const stop = () => {
      events.forEach((e) => window.removeEventListener(e, finish));
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
    };
    const finish = () => {
      el.classList.add("hs-skip");
      delete html.dataset.opening;
      stop();
    };
    const onScroll = () => window.scrollY > 4 && finish();
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

  // a rede: um quadro por vez, guiado pela rolagem
  useEffect(() => {
    const track = trackRef.current!;
    const stage = stageRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let w = 0, h = 0, top = 0, run = 1, raf = 0, visible = true;
    let frame: Frame = { cx: 0, cy: 0, scale: 1, dpr: 1 };
    let net = buildNetwork(window.innerWidth < 1024 ? 60 : 110);
    const t0 = performance.now();

    const measure = () => {
      w = stage.clientWidth;
      h = stage.clientHeight;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const wide = w >= 1024;
      frame = wide
        ? { cx: w * 0.69, cy: h * 0.5, scale: Math.min(w * 0.27, h * 0.44), dpr }
        : { cx: w * 0.5, cy: h * 0.29, scale: Math.min(w * 0.46, h * 0.25), dpr };
      net = buildNetwork(wide ? 110 : 60);
      top = track.getBoundingClientRect().top + window.scrollY;
      run = Math.max(1, track.offsetHeight - h);
    };
    const draw = (now: number) => {
      const p = reduced.matches ? 1 : Math.min(1, Math.max(0, (window.scrollY - top) / run));
      const t = reduced.matches ? 0 : (now - t0) / 1000;
      const hubs = drawNetwork(ctx, net, frame, p, t, w, h);
      hubs.forEach((hp, i) => {
        const el = labelsRef.current[i];
        if (!el || !hp) return;
        // telas largas: nome ao lado do centro; celular: acima dele (cabe na tela)
        const right = HUBS[i].pos[0] >= 0;
        const place = w >= 1024 ? `${right ? "14px" : "calc(-100% - 14px)"}, -50%` : "-50%, calc(-100% - 12px)";
        el.style.transform = `translate3d(${hp.x.toFixed(1)}px, ${hp.y.toFixed(1)}px, 0) translate(${place})`;
        el.style.opacity = hp.a.toFixed(3);
      });
      if (cueRef.current) cueRef.current.style.opacity = String(Math.max(0, 1 - p * 8));
    };
    const loop = (now: number) => {
      draw(now);
      raf = visible && !reduced.matches ? requestAnimationFrame(loop) : 0;
    };
    const start = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onResize = () => {
      measure();
      draw(performance.now());
    };
    measure();
    draw(performance.now());
    start();
    // fora da tela, a rede para de desenhar (bateria e rolagem leves)
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
    });
    io.observe(stage);
    window.addEventListener("resize", onResize);
    reduced.addEventListener("change", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(document.body);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      reduced.removeEventListener("change", onResize);
    };
  }, []);

  return (
    <section ref={trackRef} id="topo" aria-label="Apresentação" data-pin className="hb-track relative">
      <div ref={stageRef} className="hb-stage sticky top-0 h-[100svh] overflow-hidden">
        {/* fundo escuro com profundidade e luz que atravessa devagar */}
        <div aria-hidden className="hb-scene absolute inset-0">
          <span className="hs-depth absolute inset-0" />
          <span className="hs-beam hs-beam-a" />
          <span className="hs-veil absolute inset-0" />
        </div>

        {/* a rede viva de inteligência */}
        <div aria-hidden className="hs-in absolute inset-0" style={{ ["--d" as string]: "0s" } as CSSProperties}>
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
          {HUBS.map((hub, i) => (
            <span
              key={hub.name}
              ref={(el) => {
                labelsRef.current[i] = el;
              }}
              className="hb-label"
              style={{ opacity: 0 }}
            >
              {hub.name}
            </span>
          ))}
        </div>

        {/* abertura: a logo original */}
        <div className="hs-logo pointer-events-none absolute left-1/2 top-[46%] z-20 w-[min(76vw,34rem)]">
          <Image src={LOGO} alt={site.fullName} width={2033} height={570} priority sizes="(min-width: 640px) 34rem, 76vw" className="h-auto w-full" />
          <Image src={LOGO} alt="" aria-hidden width={2033} height={570} sizes="(min-width: 640px) 34rem, 76vw" className="hs-reflex h-auto w-full" />
        </div>

        {/* mensagem */}
        <div className="container-x relative z-10 flex h-full flex-col justify-end pb-16 lg:grid lg:grid-cols-12 lg:items-center lg:pb-0">
          <div className="hb-copy text-center lg:col-span-5 lg:text-left">
            <h1 className="hs-in display hb-title" style={{ ["--d" as string]: "0.1s" } as CSSProperties}>
              {opening.headline[0]} <span className="accent">{opening.headline[1]}</span>
            </h1>
            <p className="hs-in mx-auto mt-4 max-w-md text-[0.92rem] leading-relaxed text-paper/75 lg:mx-0 lg:mt-6 lg:text-lg" style={{ ["--d" as string]: "0.22s" } as CSSProperties}>
              {opening.subheadline}
            </p>
            <div className="hs-in mt-6 flex flex-col items-center gap-1 lg:mt-9 lg:flex-row lg:gap-3" style={{ ["--d" as string]: "0.34s" } as CSSProperties}>
              <ButtonLink href={diagnosis} external icon={<ArrowRight className="size-4" strokeWidth={1.5} />}>
                {opening.cta.label}
              </ButtonLink>
              <span className="lg:hidden">
                <ButtonLink href={opening.secondary.href} variant="text">
                  {opening.secondary.label}
                </ButtonLink>
              </span>
              <span className="hidden lg:block">
                <ButtonLink href={opening.secondary.href} variant="ghost">
                  {opening.secondary.label}
                </ButtonLink>
              </span>
            </div>
          </div>
        </div>

        {/* indicação discreta para rolar */}
        <div aria-hidden className="hs-in hb-cue" style={{ ["--d" as string]: "0.6s" } as CSSProperties}>
          <div ref={cueRef} className="flex flex-col items-center gap-2">
            <span>{opening.scrollCue}</span>
            <i />
          </div>
        </div>
      </div>
    </section>
  );
}
