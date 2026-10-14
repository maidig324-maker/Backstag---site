"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { methodologyIntro, methodologySteps } from "@/content/methodology";
import { EASE } from "@/components/ui/motion";
import { SectionIntro, splitLines } from "@/components/ui/SectionIntro";

export function Methodology() {
  const listRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 75%", "end 55%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  return (
    <section id="metodo" aria-label={methodologyIntro.label} className="relative border-y border-line bg-ink-2/40 py-28 md:py-44">
      <div className="container-x grid gap-16 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-5">
          <div className="md:sticky md:top-32">
            <SectionIntro
              label={methodologyIntro.label}
              titleLines={splitLines(methodologyIntro.title, 20)}
              size="md"
            />
          </div>
        </div>

        <ol ref={listRef} className="relative min-w-0 md:col-span-6 md:col-start-7">
          {/* Linha do tempo: trilho + preenchimento dourado ligado ao scroll */}
          <span aria-hidden className="absolute bottom-0 left-[0.6875rem] top-2 w-px bg-line" />
          <motion.span
            aria-hidden
            className="absolute bottom-0 left-[0.6875rem] top-2 w-px origin-top bg-gold"
            style={{ scaleY: fill }}
          />

          {methodologySteps.map((step, i) => (
            <li key={step.number} className="relative pb-20 pl-14 last:pb-0 md:pb-28 md:pl-20">
              <motion.span
                aria-hidden
                className="absolute left-0 top-2 flex size-6 items-center justify-center rounded-full border bg-ink-2"
                initial={{ borderColor: "rgb(245 245 242 / 0.22)" }}
                whileInView={{ borderColor: "rgb(215 168 62 / 1)" }}
                viewport={{ margin: "0px 0px -45% 0px", once: true }}
                transition={{ duration: 0.5 }}
              >
                <motion.span
                  className="size-2 rounded-full bg-gold"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ margin: "0px 0px -45% 0px", once: true }}
                  transition={{ duration: 0.5, ease: EASE }}
                />
              </motion.span>

              <motion.div
                data-reveal
                initial={{ opacity: 0.25, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ margin: "0px 0px -35% 0px", once: true }}
                transition={{ duration: 0.9, delay: i === 0 ? 0 : 0.05, ease: EASE }}
              >
                <h3 className="display text-[clamp(2rem,5vw,4.25rem)] hyphens-auto">{step.title}</h3>
                <p className="mt-5 max-w-md leading-relaxed text-mute md:text-lg">{step.text}</p>
              </motion.div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
