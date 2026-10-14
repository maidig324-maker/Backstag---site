"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { services, servicesIntro } from "@/content/services";
import { sectionNumber } from "@/lib/visibility";
import { panels } from "@/components/hero-lab/Panels";
import { EASE, Reveal } from "@/components/ui/motion";
import { SectionIntro, splitLines } from "@/components/ui/SectionIntro";

/**
 * 03 — CAPACIDADES
 * Console interativo dos quatro pilares: a lista seleciona o pilar e o
 * painel 3D ao lado mostra o sistema correspondente (o mesmo do hero),
 * com o escopo de atuação logo abaixo.
 */
export function Services() {
  const [active, setActive] = useState(0);
  const s = services[active];
  const Panel = panels[active];

  return (
    <section id="solucoes" aria-label={servicesIntro.label} className="relative bg-ink-2 py-28 md:py-40">
      <div className="container-x">
        <div className="grid gap-10 md:grid-cols-12">
          <SectionIntro
            className="md:col-span-7"
            index={sectionNumber("solucoes")}
            label={servicesIntro.label}
            titleLines={splitLines(servicesIntro.title, 24)}
          />
          <Reveal className="md:col-span-4 md:col-start-9 md:self-end" delay={0.15}>
            <p className="leading-relaxed text-mute">{servicesIntro.text}</p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-8 md:mt-24 md:grid-cols-12 md:gap-10">
          {/* Seletor de pilares */}
          <div role="tablist" aria-label="Pilares" className="grid grid-cols-2 gap-2 md:col-span-5 md:grid-cols-1 md:gap-0">
            {services.map((item, i) => {
              const on = i === active;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  id={`tab-${item.id}`}
                  aria-selected={on}
                  aria-controls="painel-pilar"
                  onClick={() => setActive(i)}
                  className={`group relative flex min-h-14 items-start gap-3 rounded-md border px-3 py-3 text-left transition-colors md:rounded-none md:border-0 md:border-t md:px-0 md:py-6 ${
                    on ? "border-gold bg-gold/10 md:bg-transparent" : "border-line-strong md:border-line"
                  }`}
                >
                  <span className={`label-tech pt-1 ${on ? "text-gold" : "text-paper/45"}`}>{item.number}</span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-sm font-medium leading-tight transition-colors md:text-[clamp(1.4rem,2.2vw,2rem)] md:tracking-tight ${
                        on ? "text-paper" : "text-paper/60 group-hover:text-paper"
                      }`}
                    >
                      {item.title}
                    </span>
                    <span className="mt-2 hidden max-w-md text-sm leading-relaxed text-mute md:block">{item.summary}</span>
                  </span>
                  {/* trilho de seleção (desktop) */}
                  <span
                    aria-hidden
                    className={`absolute left-0 top-0 hidden h-px bg-gold transition-[width] duration-700 ease-[var(--ease-stage)] md:block ${
                      on ? "w-full" : "w-0"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Painel do pilar */}
          <div
            id="painel-pilar"
            role="tabpanel"
            aria-labelledby={`tab-${s.id}`}
            className="md:col-span-7 [perspective:1600px]"
          >
            <motion.div
              key={s.id}
              data-reveal
              className="bs-on overflow-hidden rounded-md border border-gold/70 text-gold-light shadow-[0_30px_80px_-30px_rgb(215_168_62/0.35)]"
              style={{ background: "linear-gradient(180deg, #1c1c1e 0%, #121214 100%)", transformOrigin: "50% 100%" }}
              initial={{ opacity: 0, rotateX: 14, y: 24 }}
              animate={{ opacity: 1, rotateX: 4, y: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <div className="flex items-center justify-between border-b border-line px-4 py-3 md:px-6">
                <span className="label-tech text-gold">
                  {s.number} · {s.title}
                </span>
                <span className="size-1.5 rounded-full bg-gold" />
              </div>
              <div className="relative aspect-[160/96] px-[3%] py-[2%]" aria-hidden>
                <Panel />
                <span className="bs-sweep pointer-events-none absolute inset-y-0 w-1/3" />
              </div>
            </motion.div>

            <p className="mt-6 leading-relaxed text-paper/80 md:hidden">{s.summary}</p>
            <ul className="mt-6 grid gap-x-6 sm:grid-cols-2">
              {s.scope.map((item, i) => (
                <motion.li
                  key={`${s.id}-${item}`}
                  data-reveal
                  className="flex gap-3 border-t border-line py-4 text-sm leading-snug text-paper/85"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.25 + i * 0.07, ease: EASE }}
                >
                  <span aria-hidden className="mt-[0.5em] h-px w-3 shrink-0 bg-gold" />
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
