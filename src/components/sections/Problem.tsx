"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { problem } from "@/content/site";
import { sectionNumber } from "@/lib/visibility";
import { EASE, Reveal } from "@/components/ui/motion";
import { SectionIntro, splitLines } from "@/components/ui/SectionIntro";

/**
 * 02 — DESCOBERTA
 * Seção fixa (sticky) ativada pela rolagem nativa: cada desafio entra em
 * cena e, conforme o visitante continua rolando, uma máscara revela como
 * a Backstag aborda aquele ponto. Sem bloqueio de rolagem.
 */
export function Problem() {
  const trackRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const items = problem.items;
  const n = items.length;
  const [index, setIndex] = useState(0);

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const seg = Math.min(n - 0.0001, Math.max(0, p * n));
    const i = Math.floor(seg);
    if (i !== index) setIndex(i);
    // progresso dentro do desafio atual: controla a máscara de revelação
    const local = Math.min(1, Math.max(0, (seg - i - 0.15) / 0.5));
    panelRef.current?.style.setProperty("--reveal", local.toFixed(3));
  });

  const item = items[index];

  return (
    <section id="desafios" aria-label={problem.label} className="relative">
      <div className="container-x pt-28 md:pt-40">
        <SectionIntro
          index={sectionNumber("desafios")}
          label={problem.label}
          titleLines={splitLines(problem.title, 26)}
          text={problem.intro}
        />
      </div>

      {/* Trilho de rolagem: altura proporcional ao número de desafios */}
      <div ref={trackRef} className="relative" style={{ height: `${n * 75 + 25}svh` }}>
        <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
          <div className="container-x grid w-full gap-8 md:grid-cols-12 md:items-center md:gap-10">
            {/* Desafio atual */}
            <div className="md:col-span-5">
              <div className="flex items-center gap-4">
                <span className="label-tech text-gold">Desafio</span>
                <span className="label-tech tabular-nums text-paper/50">
                  {String(index + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
                </span>
              </div>
              {/* indicador de progresso por desafio */}
              <div className="mt-4 flex gap-1.5" aria-hidden>
                {items.map((_, i) => (
                  <span
                    key={i}
                    className={`h-0.5 flex-1 transition-colors duration-500 ${i <= index ? "bg-gold" : "bg-line-strong"}`}
                  />
                ))}
              </div>
              <div className="relative mt-8 min-h-[9.5rem] md:min-h-[13rem]">
                <motion.h3
                  key={item.title}
                  data-reveal
                  className="display text-[clamp(2rem,4.6vw,4rem)]"
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: EASE }}
                >
                  {item.title}
                </motion.h3>
                <motion.p
                  key={item.text}
                  data-reveal
                  className="mt-5 max-w-md leading-relaxed text-mute"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                >
                  {item.text}
                </motion.p>
              </div>
            </div>

            {/* Painel de diagnóstico: a abordagem é revelada pela máscara */}
            <div className="md:col-span-6 md:col-start-7">
              <div
                ref={panelRef}
                className="relative overflow-hidden rounded-md border border-line-strong"
                style={{ background: "linear-gradient(180deg, #1c1c1e 0%, #121214 100%)", ["--reveal" as string]: 0 }}
              >
                <div className="flex items-center justify-between border-b border-line px-5 py-3">
                  <span className="label-tech text-paper/55">Diagnóstico Backstag</span>
                  <span className="size-1.5 rounded-full bg-gold" />
                </div>
                <div className="relative min-h-[13rem] p-5 md:min-h-[17rem] md:p-8">
                  {/* camada base: o problema como ele aparece */}
                  <p className="label-tech text-paper/40">Situação</p>
                  <p className="mt-3 text-lg leading-snug text-paper/40 md:text-xl">{item.title}</p>
                  {/* camada revelada: como abordamos */}
                  <div
                    className="absolute inset-0 p-5 md:p-8"
                    style={{
                      background: "linear-gradient(180deg, #1f1b12 0%, #141210 100%)",
                      clipPath: "inset(0 calc((1 - var(--reveal)) * 100%) 0 0)",
                    }}
                  >
                    <p className="label-tech text-gold">Como abordamos</p>
                    <p key={item.approach} className="mt-3 text-lg leading-snug text-paper md:text-2xl md:leading-snug">
                      {item.approach}
                    </p>
                  </div>
                  {/* borda da máscara */}
                  <span
                    aria-hidden
                    className="absolute inset-y-0 w-px bg-gold-light shadow-[0_0_18px_2px_rgb(240_199_102/0.45)]"
                    style={{ left: "calc(var(--reveal) * 100%)", opacity: "calc(var(--reveal) * (1 - var(--reveal)) * 4)" }}
                  />
                </div>
              </div>
              <p className="label-tech mt-4 text-paper/40">Continue rolando para revelar</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ponte: a Backstag entra em cena */}
      <div className="container-x pb-28 md:pb-40">
        <Reveal className="grid gap-6 border-t border-gold/40 pt-10 md:grid-cols-12 md:pt-14">
          <p className="label-tech text-gold md:col-span-3">A Backstag</p>
          <p className="display text-[clamp(1.6rem,3.2vw,2.75rem)] leading-[1.1] md:col-span-9">{problem.bridge}</p>
        </Reveal>
      </div>
    </section>
  );
}
