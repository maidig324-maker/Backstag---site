"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { methodologyIntro, methodologySteps } from "@/content/methodology";
import { EASE } from "@/components/ui/motion";
import { NodeConnector } from "@/components/ui/NodeConnector";
import { SectionIntro, splitSentences } from "@/components/ui/SectionIntro";

export function Methodology() {
  const listRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 75%", "end 55%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  return (
    <section id="metodo" aria-label={methodologyIntro.label} className="relative py-28 md:py-44">
      <div className="container-x grid gap-16 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-6">
          <div className="md:sticky md:top-32 md:[&_h2]:text-[clamp(2rem,3.2vw,3.1rem)]">
            <NodeConnector className="mb-6 md:mx-0 md:mb-8" />
            <SectionIntro
              label={methodologyIntro.label}
              titleLines={splitSentences(methodologyIntro.title)}
              align="center-mobile"
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
            <li key={step.number} className="relative pb-14 pl-10 last:pb-0 md:pb-20 md:pl-16">
              <motion.span
                aria-hidden
                className="absolute left-0 top-2 flex size-6 items-center justify-center rounded-full border bg-ink-2"
                initial={{ borderColor: "rgb(128 128 128 / 0.4)" }}
                whileInView={{ borderColor: "rgb(20 20 20 / 1)" }}
                viewport={{ margin: "0px 0px -45% 0px", once: true }}
                transition={{ duration: 0.5 }}
              >
                <motion.span
                  className="size-2 rounded-full bg-sun"
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
                <h3 className="display t-h3">{step.title}</h3>
                <p className="mt-3 max-w-xl leading-relaxed text-mute md:text-lg">{step.text}</p>
              </motion.div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
