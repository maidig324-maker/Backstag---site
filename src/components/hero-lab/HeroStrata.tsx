"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type React from "react";
import { hero2026 } from "@/content/hero-2026";
import { ConceptTag, FrameMarks, HeadlineTech, prefersReducedMotion, SubAndCtas } from "./HeroCopy";

/**
 * ALTERNATIVA B — "CAMADAS"
 * A empresa vista por dentro: quatro planos empilhados em perspectiva —
 * um por pilar, com Gestão como fundação. O cursor inclina a estrutura,
 * a rolagem afasta as camadas (vista explodida) e passar sobre um pilar
 * o destaca. Somente CSS 3D + um laço leve de interpolação.
 */

const layers = [...hero2026.pillars]; // 01 (base) → 04 (topo)

function Pattern({ kind }: { kind: number }) {
  const stroke = "currentColor";
  switch (kind) {
    case 0: // Gestão — grade ortogonal: rotinas e processos
      return (
        <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke={stroke} strokeWidth="0.25">
          {Array.from({ length: 9 }, (_, i) => (
            <g key={i}>
              <line x1={(i + 1) * 10} y1="0" x2={(i + 1) * 10} y2="100" />
              <line x1="0" y1={(i + 1) * 10} x2="100" y2={(i + 1) * 10} />
            </g>
          ))}
          <rect x="20" y="20" width="20" height="10" strokeWidth="0.6" />
          <rect x="50" y="40" width="30" height="10" strokeWidth="0.6" />
          <rect x="30" y="60" width="20" height="20" strokeWidth="0.6" />
        </svg>
      );
    case 1: // Estratégia — vetores e direção
      return (
        <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke={stroke} strokeWidth="0.35">
          {[18, 32, 46].map((r) => (
            <circle key={r} cx="30" cy="70" r={r} strokeDasharray="1.5 2.5" />
          ))}
          <path d="M30 70 L82 22" strokeWidth="0.7" />
          <path d="M76 22 L82 22 L82 28" strokeWidth="0.7" />
        </svg>
      );
    case 2: // Digital — interfaces e módulos
      return (
        <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke={stroke} strokeWidth="0.4">
          <rect x="12" y="14" width="76" height="52" />
          <line x1="12" y1="22" x2="88" y2="22" />
          <rect x="18" y="28" width="30" height="32" />
          <line x1="54" y1="30" x2="82" y2="30" />
          <line x1="54" y1="36" x2="76" y2="36" />
          <line x1="54" y1="42" x2="80" y2="42" />
          <rect x="22" y="72" width="22" height="16" />
          <rect x="50" y="72" width="28" height="16" />
        </svg>
      );
    default: // IA — rede de decisões
      return (
        <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke={stroke} strokeWidth="0.35">
          {[
            [20, 25, 50, 50], [20, 50, 50, 50], [20, 75, 50, 50],
            [50, 50, 80, 30], [50, 50, 80, 70], [20, 25, 50, 20], [50, 20, 80, 30],
          ].map(([a, b, c, d], i) => (
            <line key={i} x1={a} y1={b} x2={c} y2={d} />
          ))}
          {[[20, 25], [20, 50], [20, 75], [50, 50], [50, 20], [80, 30], [80, 70]].map(([x, y], i) => (
            <rect key={i} x={x - 2} y={y - 2} width="4" height="4" fill="currentColor" />
          ))}
        </svg>
      );
  }
}

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

  useEffect(() => {
    if (prefersReducedMotion() || interacted) return;
    const id = window.setInterval(() => setAuto((a) => (a + 1) % layers.length), 2600);
    return () => window.clearInterval(id);
  }, [interacted]);

  useEffect(() => {
    const section = sectionRef.current!;
    const stack = stackRef.current!;
    const reduced = prefersReducedMotion();
    const target = { rx: 0, ry: 0 };
    const cur = { rx: 0, ry: 0, gap: reduced ? 1 : 0 };
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
      // camadas pousam uma a uma, de baixo para cima
      for (let i = 0; i < layers.length; i++) {
        const k = easeOut((el - 0.25 - i * 0.2) / 1.1);
        stack.style.setProperty(`--drop-${i}`, (1 - k).toFixed(3));
      }
      // abertura das camadas: entrada + vista explodida no scroll
      cur.gap = easeOut((el - 0.9) / 1.2) * (1 + scrolled * 1.1);
      // movimento ocioso + inclinação pelo cursor
      const idleX = reduced ? 0 : Math.sin(time * 0.27) * 2;
      const idleZ = reduced ? 0 : Math.sin(time * 0.35) * 4;
      cur.rx += (target.rx + idleX - cur.rx) * 0.06;
      cur.ry += (target.ry + idleZ - cur.ry) * 0.06;
      stack.style.setProperty("--gap", cur.gap.toFixed(3));
      stack.style.setProperty("--tilt-x", `${cur.rx.toFixed(2)}deg`);
      stack.style.setProperty("--tilt-z", `${cur.ry.toFixed(2)}deg`);
      // plano de varredura percorrendo a estrutura
      const scan = reduced ? 0 : ((time % 4.8) / 4.8);
      stack.style.setProperty("--scan", (scan * (layers.length - 1)).toFixed(3));
      stack.style.setProperty("--scan-o", el < 2.4 ? "0" : Math.sin(scan * Math.PI).toFixed(3));
    };
    const loop = () => {
      apply();
      if (running) raf = requestAnimationFrame(loop);
    };

    if (reduced) {
      apply();
    } else {
      raf = requestAnimationFrame(loop);
    }

    const onMove = (e: PointerEvent) => {
      if (reduced || e.pointerType === "touch") return;
      const r = section.getBoundingClientRect();
      target.ry = ((e.clientX - r.left) / r.width - 0.5) * 10;
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

  return (
    <section
      id="topo"
      ref={sectionRef}
      aria-label="Apresentação"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden"
    >
      <FrameMarks />
      {/* Linha de horizonte técnica */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[62%] -z-10 hidden h-px bg-line md:block" />

      {/* Composição 3D */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[20%] -z-10 h-[28vh] [perspective:1800px] md:inset-x-auto md:right-[-2%] md:top-[14%] md:h-[88vh] md:w-[56vw]"
      >
        <div
          ref={stackRef}
          className="absolute left-1/2 top-1/2 size-[min(50vw,28vh)] [transform-style:preserve-3d] md:size-[min(34vw,52vh)]"
          style={{
            transform:
              "translate(-50%,-50%) rotateX(calc(58deg + var(--tilt-x,0deg))) rotateZ(calc(-38deg + var(--tilt-z,0deg)))",
            ["--gap" as string]: 0,
          } as React.CSSProperties}
        >
          {layers.map((l, i) => {
            const on = shown === i;
            return (
              <div
                key={l.code}
                className={`absolute inset-0 border transition-[border-color,background-color,color] duration-500 [transform-style:preserve-3d] ${
                  on ? "border-gold bg-ink/95 text-gold" : "border-line-strong bg-ink/[0.93] text-paper/30"
                }`}
                style={{
                  transform: `translateZ(calc(${i} * var(--gap) * clamp(46px, 7vh, 92px) + var(--drop-${i}, 0) * 520px))`,
                  opacity: `calc(1 - var(--drop-${i}, 0))`,
                }}
              >
                <div className="absolute inset-[6%]">
                  <Pattern kind={i} />
                </div>
                <span
                  className={`label-tech absolute -bottom-6 left-0 whitespace-nowrap ${on ? "text-gold-light" : "text-paper/55"}`}
                >
                  {l.code} — {l.title}
                </span>
                {/* conectores verticais entre camadas */}
                {i < layers.length - 1 && (
                  <>
                    {[
                      ["0%", "0%"],
                      ["100%", "100%"],
                    ].map(([x, y], k) => (
                      <span
                        key={k}
                        className="absolute w-px origin-top bg-gold/50"
                        style={{
                          left: x,
                          top: y,
                          height: `calc(var(--gap) * clamp(46px, 7vh, 92px))`,
                          transform: "rotateX(-90deg)",
                        }}
                      />
                    ))}
                  </>
                )}
              </div>
            );
          })}
          {/* plano de varredura: a inteligência atravessando a empresa */}
          <div
            className="absolute inset-[-4%] border border-gold-light/70"
            style={{
              transform: "translateZ(calc(var(--scan, 0) * var(--gap) * clamp(46px, 7vh, 92px) + 6px))",
              opacity: "var(--scan-o, 0)",
              boxShadow: "inset 0 0 0 1px rgb(215 168 62 / 0.15)",
            }}
          />
        </div>
      </div>

      <motion.div style={{ y: copyY, opacity: copyO }} className="container-x flex flex-1 flex-col pb-10 pt-24 md:pb-14 md:pt-32">
        <ConceptTag />
        <HeadlineTech className="mt-[32vh] text-[clamp(3.4rem,min(11vw,18vh),12.5rem)] md:mt-10" />

        {/* Celular: toque num pilar para destacar a camada correspondente */}
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
              {l.title.replace("Inteligência Artificial e Automação", "IA e Automação")}
            </button>
          ))}
        </div>

        <div className="mt-auto grid gap-10 pt-6 md:grid-cols-12 md:items-end md:pt-10">
          <SubAndCtas className="md:col-span-5" />
          {/* Legenda acessível dos pilares — interage com as camadas */}
          <ol className="hidden md:col-span-5 md:col-start-8 md:grid md:grid-cols-2 md:gap-x-6">
            {[...layers].reverse().map((l) => {
              const i = layers.indexOf(l);
              return (
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
              );
            })}
          </ol>
        </div>
      </motion.div>
    </section>
  );
}
