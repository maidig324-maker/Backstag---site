"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type React from "react";
import { hero2026 } from "@/content/hero-2026";
import { ConceptTag, FrameMarks, HeadlineTech, prefersReducedMotion, SubAndCtas } from "./HeroCopy";

/**
 * ALTERNATIVA B — "PAINÉIS" (evolução de "Camadas")
 * A empresa por trás da tela: quatro painéis de sistema em cascata 3D,
 * um por pilar — fluxo de processos, gráfico de crescimento, site e
 * automação com IA. Os painéis chegam em sequência, a estrutura flutua,
 * o cursor inclina, a rolagem abre a cascata e o pilar em destaque
 * anima o próprio conteúdo. Somente CSS 3D + SVG, sem bibliotecas.
 *
 * Os painéis são ilustrativos: nenhum número, cliente ou resultado.
 */

const layers = [...hero2026.pillars];

/* ---------- Conteúdo de cada painel (viewBox 160×96) ---------- */

function PanelGestao() {
  const steps = [12, 50, 88, 126];
  return (
    <svg viewBox="0 0 160 96" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="0.8">
      {/* fluxo de processo */}
      {steps.map((x, i) => (
        <g key={x} className="bs-step" style={{ ["--d" as string]: `${i * 0.22}s` }}>
          <rect x={x} y="14" width="24" height="16" rx="3" />
          <path d={`M${x + 8} 22.5l3 3 5-6`} strokeWidth="1.1" className="bs-check" />
          {i < steps.length - 1 && <path d={`M${x + 26} 22h10m-3-2.5l3 2.5-3 2.5`} strokeOpacity="0.6" />}
        </g>
      ))}
      {/* lista de rotinas */}
      {[44, 58, 72].map((y, i) => (
        <g key={y} className="bs-row" style={{ ["--d" as string]: `${0.9 + i * 0.18}s` }}>
          <rect x="12" y={y} width="7" height="7" rx="1.5" />
          <line x1="26" y1={y + 3.5} x2={110 - i * 18} y2={y + 3.5} strokeOpacity="0.55" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="128" y1={y + 3.5} x2="148" y2={y + 3.5} strokeOpacity="0.35" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      ))}
    </svg>
  );
}

function PanelEstrategia() {
  const d = "M12 76 C 34 72, 44 64, 60 60 S 88 50, 100 40 S 130 24, 148 16";
  return (
    <svg viewBox="0 0 160 96" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="0.8">
      {[28, 48, 68].map((y) => (
        <line key={y} x1="12" y1={y} x2="148" y2={y} strokeOpacity="0.18" />
      ))}
      <line x1="12" y1="84" x2="148" y2="84" strokeOpacity="0.5" />
      <path d={`${d} L148 84 L12 84 Z`} fill="currentColor" fillOpacity="0.08" stroke="none" />
      <path d={d} strokeWidth="1.6" className="bs-draw" pathLength={1} />
      <circle cx="148" cy="16" r="3" fill="currentColor" className="bs-pop" />
      {/* meta */}
      <line x1="12" y1="12" x2="148" y2="12" strokeDasharray="2 3" strokeOpacity="0.45" />
      {[26, 56, 86, 116].map((x, i) => (
        <rect key={x} x={x} y={84 - (10 + i * 6)} width="8" height={10 + i * 6} fill="currentColor" fillOpacity="0.14" stroke="none" className="bs-bar" style={{ ["--d" as string]: `${i * 0.12}s` }} />
      ))}
    </svg>
  );
}

function PanelDigital() {
  return (
    <svg viewBox="0 0 160 96" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="0.8">
      <rect x="8" y="8" width="144" height="80" rx="4" />
      <line x1="8" y1="18" x2="152" y2="18" />
      <rect x="40" y="11" width="80" height="4" rx="2" strokeOpacity="0.5" />
      {/* hero do site */}
      <line x1="18" y1="30" x2="80" y2="30" strokeWidth="3" strokeLinecap="round" className="bs-row" style={{ ["--d" as string]: "0s" }} />
      <line x1="18" y1="38" x2="64" y2="38" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.6" className="bs-row" style={{ ["--d" as string]: "0.15s" }} />
      <rect x="18" y="45" width="26" height="8" rx="4" fill="currentColor" fillOpacity="0.25" className="bs-pop" />
      <rect x="96" y="26" width="46" height="28" rx="2" strokeOpacity="0.6" />
      <path d="M100 50l10-10 8 7 6-5 14 8" strokeOpacity="0.6" />
      {/* cards */}
      {[18, 62, 106].map((x, i) => (
        <rect key={x} x={x} y="62" width="36" height="18" rx="2" className="bs-step" style={{ ["--d" as string]: `${0.4 + i * 0.15}s` }} />
      ))}
    </svg>
  );
}

function PanelIA() {
  const sat = [
    [24, 22], [24, 74], [80, 12], [80, 84], [136, 22], [136, 74],
  ];
  return (
    <svg viewBox="0 0 160 96" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="0.8">
      {sat.map(([x, y], i) => (
        <g key={i}>
          <path d={`M80 48 L${x} ${y}`} strokeDasharray="2 3" strokeOpacity="0.6" className="bs-flow" />
          <rect x={x - 5} y={y - 5} width="10" height="10" rx="2" className="bs-step" style={{ ["--d" as string]: `${i * 0.12}s` }} />
        </g>
      ))}
      <rect x="66" y="34" width="28" height="28" rx="5" fill="currentColor" fillOpacity="0.12" strokeWidth="1.2" />
      <rect x="62" y="30" width="36" height="36" rx="7" strokeOpacity="0.4" className="bs-pulse" />
      <text x="80" y="52" textAnchor="middle" fontSize="11" fill="currentColor" stroke="none" fontFamily="inherit" fontWeight="600">
        IA
      </text>
    </svg>
  );
}

const panels = [PanelGestao, PanelEstrategia, PanelDigital, PanelIA];
const shortTitle = (t: string) => t.replace("Inteligência Artificial e Automação", "IA e Automação");

export function HeroStrata() {
  const sectionRef = useRef<HTMLElement>(null);
  // O texto recua em profundidade ao rolar
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const copyY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);
  const copyO = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const stackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  // Destaque automático: percorre os pilares enquanto ninguém interage
  const [auto, setAuto] = useState(0);
  const [interacted, setInteracted] = useState(false);
  const shown = active ?? (interacted ? null : auto);
  const shownRef = useRef<number | null>(shown);
  shownRef.current = shown;

  useEffect(() => {
    if (prefersReducedMotion() || interacted) return;
    const id = window.setInterval(() => setAuto((a) => (a + 1) % layers.length), 3200);
    return () => window.clearInterval(id);
  }, [interacted]);

  useEffect(() => {
    const section = sectionRef.current!;
    const stack = stackRef.current!;
    const reduced = prefersReducedMotion();
    const target = { rx: 0, ry: 0 };
    const cur = { rx: 0, ry: 0, gap: reduced ? 1 : 0, slot: layers.map((_, i) => i) };
    let raf = 0;
    let running = true;
    const t0 = performance.now();

    const easeOut = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
    const apply = () => {
      const now = performance.now();
      const time = now / 1000;
      const rect = section.getBoundingClientRect();
      const scrolled = Math.min(1, Math.max(0, -rect.top / (rect.height * 0.8)));
      const el = reduced ? 99 : (now - t0) / 1000;
      // painéis chegam um a um, vindos da frente
      for (let i = 0; i < layers.length; i++) {
        const k = easeOut((el - 0.3 - i * 0.22) / 1.1);
        stack.style.setProperty(`--drop-${i}`, (1 - k).toFixed(3));
      }
      // abertura da cascata: entrada + expansão no scroll
      cur.gap = 0.35 + easeOut((el - 0.8) / 1.3) * (0.65 + scrolled * 0.9);
      // flutuação ociosa + inclinação pelo cursor
      const idleX = reduced ? 0 : Math.sin(time * 0.3) * 1.8;
      const idleY = reduced ? 0 : Math.sin(time * 0.22) * 3.5;
      cur.rx += (target.rx + idleX - cur.rx) * 0.06;
      cur.ry += (target.ry + idleY - cur.ry) * 0.06;
      // o painel em destaque desliza para a frente do baralho
      const s = shownRef.current;
      for (let i = 0; i < layers.length; i++) {
        const goal = s == null ? i : (i - s + layers.length) % layers.length;
        cur.slot[i] += (goal - cur.slot[i]) * (reduced ? 1 : 0.075);
        stack.style.setProperty(`--s-${i}`, cur.slot[i].toFixed(3));
      }
      stack.style.setProperty("--gap", cur.gap.toFixed(3));
      stack.style.setProperty("--tilt-x", `${cur.rx.toFixed(2)}deg`);
      stack.style.setProperty("--tilt-y", `${cur.ry.toFixed(2)}deg`);
    };
    const loop = () => {
      apply();
      if (running) raf = requestAnimationFrame(loop);
    };

    if (reduced) apply();
    else raf = requestAnimationFrame(loop);

    const onMove = (e: PointerEvent) => {
      if (reduced || e.pointerType === "touch") return;
      const r = section.getBoundingClientRect();
      target.ry = ((e.clientX - r.left) / r.width - 0.5) * 12;
      target.rx = ((e.clientY - r.top) / r.height - 0.5) * -8;
    };
    const onLeave = () => {
      target.rx = 0;
      target.ry = 0;
    };
    const io = new IntersectionObserver(([en]) => {
      const was = running;
      running = en.isIntersecting && !reduced;
      if (running && !was) raf = requestAnimationFrame(loop);
    });
    io.observe(section);
    section.addEventListener("pointermove", onMove);
    section.addEventListener("pointerleave", onLeave);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  // deslocamento da cascata (em unidades --u, multiplicadas por --gap)
  const offset = (i: number) =>
    `translate3d(calc(var(--s-${i}, ${i}) * 1.7 * var(--u) * var(--gap)), calc(var(--s-${i}, ${i}) * -1.15 * var(--u) * var(--gap)), calc(var(--s-${i}, ${i}) * -2.6 * var(--u) * var(--gap) + var(--drop-${i}, 0) * 420px))`;

  return (
    <section
      id="topo"
      ref={sectionRef}
      aria-label="Apresentação"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden"
    >
      <FrameMarks />

      {/* Composição 3D */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[17%] -z-10 h-[31vh] [--u:20px] [perspective:1400px] md:inset-x-auto md:right-[5%] md:top-[29%] md:h-[46vh] md:w-[42vw] md:[--u:36px]"
      >
        <div
          ref={stackRef}
          className="absolute left-1/2 top-1/2 aspect-[160/104] w-[min(58vw,34vh)] [transform-style:preserve-3d] md:w-[min(24vw,40vh)]"
          style={
            {
              transform:
                "translate(calc(-50% - 2.5 * var(--u) * var(--gap)), calc(-50% + 1.7 * var(--u) * var(--gap))) rotateX(calc(8deg + var(--tilt-x,0deg))) rotateY(calc(-30deg + var(--tilt-y,0deg)))",
              ["--gap" as string]: 0.35,
            } as React.CSSProperties
          }
        >
          {layers.map((l, i) => {
            const on = shown === i;
            const Panel = panels[i];
            return (
              <div
                key={l.code}
                className={`absolute inset-0 flex flex-col overflow-hidden rounded-[6px] border transition-[border-color,color,box-shadow] duration-500 ${
                  on
                    ? "bs-on border-gold/80 text-gold-light shadow-[0_0_0_1px_rgb(215_168_62/0.25),0_24px_60px_-20px_rgb(215_168_62/0.35)]"
                    : "border-line-strong text-paper/35"
                }`}
                style={{
                  transform: offset(i),
                  opacity: `calc((1 - var(--drop-${i}, 0)) * (1 - var(--s-${i}, ${i}) * 0.12))`,
                  background: "linear-gradient(180deg, #1c1c1e 0%, #121214 100%)",
                }}
              >
                {/* barra do painel */}
                <div className="flex items-center justify-between border-b px-[6%] py-[3.5%]" style={{ borderColor: "rgb(245 245 242 / 0.1)" }}>
                  <span className={`label-tech text-[clamp(0.42rem,0.62vw,0.62rem)] ${on ? "text-gold" : "text-paper/55"}`}>
                    {l.code} · {shortTitle(l.title)}
                  </span>
                  <span className={`size-1.5 rounded-full ${on ? "bg-gold" : "bg-paper/25"}`} />
                </div>
                <div className="relative flex-1 px-[3%] pb-[3%]">
                  <Panel />
                  {/* varredura de luz no painel em destaque */}
                  {on && <span className="bs-sweep pointer-events-none absolute inset-y-0 w-1/3" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <motion.div style={{ y: copyY, opacity: copyO }} className="container-x flex flex-1 flex-col pb-10 pt-24 md:pb-14 md:pt-32">
        <ConceptTag />
        <HeadlineTech className="mt-[33vh] text-[clamp(3.4rem,min(11vw,18vh),12.5rem)] md:mt-10" />

        {/* Celular: toque num pilar para destacar o painel correspondente */}
        <div role="group" aria-label="Pilares" className="mt-5 grid grid-cols-2 gap-2 md:hidden">
          {layers.map((l, i) => (
            <button
              key={l.code}
              type="button"
              aria-pressed={shown === i}
              onClick={() => {
                setInteracted(true);
                setActive(active === i ? null : i);
              }}
              className={`label-tech inline-flex min-h-11 items-center gap-2 rounded-full border px-3 text-left text-[0.6rem] leading-tight transition-colors ${
                shown === i ? "border-gold bg-gold/10 text-gold-light" : "border-line-strong text-paper/70"
              }`}
            >
              <span className="text-gold">{l.code}</span>
              {shortTitle(l.title)}
            </button>
          ))}
        </div>

        <div className="mt-auto grid gap-10 pt-6 md:grid-cols-12 md:items-end md:pt-10">
          <SubAndCtas className="md:col-span-5" />
          {/* Legenda dos pilares — interage com os painéis */}
          <ol className="hidden md:col-span-5 md:col-start-8 md:grid md:grid-cols-2 md:gap-x-6">
            {layers.map((l, i) => (
              <li key={l.code}>
                <a
                  href="/#solucoes"
                  onPointerEnter={() => {
                    setInteracted(true);
                    setActive(i);
                  }}
                  onPointerLeave={() => setActive(null)}
                  onFocus={() => {
                    setInteracted(true);
                    setActive(i);
                  }}
                  onBlur={() => setActive(null)}
                  className={`flex min-h-12 items-baseline gap-3 border-t py-3 text-sm transition-colors ${
                    shown === i ? "border-gold text-paper" : "border-line text-paper/65 hover:text-paper"
                  }`}
                >
                  <span className="label-tech text-gold">{l.code}</span>
                  {l.title}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </motion.div>
    </section>
  );
}
