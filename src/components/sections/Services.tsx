"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { services, servicesIntro } from "@/content/services";
import { EASE, Reveal } from "@/components/ui/motion";
import { SectionIntro, splitLines } from "@/components/ui/SectionIntro";
import { sectionNumber } from "@/lib/visibility";

export function Services() {
  const [open, setOpen] = useState<string | null>(services[0]?.id ?? null);

  return (
    <section id="solucoes" aria-label={servicesIntro.label} className="relative bg-ink-2 py-28 md:py-44">
      <div className="container-x">
        <div className="grid gap-10 md:grid-cols-12">
          <SectionIntro
            className="md:col-span-8"
            index={sectionNumber("solucoes")}
            label={servicesIntro.label}
            titleLines={splitLines(servicesIntro.title, 30)}
          />
          <Reveal className="md:col-span-4 md:self-end" delay={0.2}>
            <p className="leading-relaxed text-mute">{servicesIntro.text}</p>
          </Reveal>
        </div>

        {/* Índice editorial das áreas — linhas, não cards */}
        <ul className="mt-20 border-b border-line md:mt-28">
          {services.map((s, i) => {
            const isOpen = open === s.id;
            const panelId = `servico-${s.id}`;
            return (
              <li key={s.id} className="border-t border-line">
                <Reveal delay={i * 0.06} y={20}>
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpen(isOpen ? null : s.id)}
                      className="group grid w-full grid-cols-[2.5rem_1fr_auto] items-start gap-x-4 py-8 text-left md:grid-cols-[5rem_minmax(0,5fr)_minmax(0,5fr)_3rem] md:items-center md:gap-x-8 md:py-11"
                    >
                      <span className="cue pt-3 md:pt-0">{s.number}</span>
                      <span
                        className={`display text-[clamp(1.9rem,4.2vw,3.75rem)] transition-[color,transform] duration-500 ease-[var(--ease-stage)] md:group-hover:translate-x-2 ${
                          isOpen ? "text-gold-light" : "text-paper"
                        }`}
                      >
                        {s.title}
                      </span>
                      <span className="col-start-2 row-start-2 mt-3 max-w-md text-[0.95rem] leading-relaxed text-mute md:col-start-3 md:row-start-1 md:mt-0">
                        {s.summary}
                      </span>
                      <span
                        aria-hidden
                        className={`col-start-3 row-start-1 mt-2 inline-flex size-11 items-center justify-center rounded-full border transition-all duration-500 ease-[var(--ease-stage)] md:col-start-4 md:mt-0 ${
                          isOpen
                            ? "rotate-45 border-gold bg-gold text-ink"
                            : "border-line-strong text-paper group-hover:border-gold"
                        }`}
                      >
                        <Plus className="size-4" strokeWidth={1.75} />
                      </span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={panelId}
                        key="panel"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.6, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <ul className="grid gap-x-8 pb-10 pl-[3.5rem] sm:grid-cols-2 md:pl-[calc(5rem+2rem)] md:pb-14 lg:grid-cols-4">
                          {s.scope.map((item) => (
                            <li
                              key={item}
                              className="flex gap-3 border-t border-line py-4 text-sm leading-snug text-paper/85"
                            >
                              <span aria-hidden className="mt-[0.45em] h-px w-3 shrink-0 bg-gold" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
