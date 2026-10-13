"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowDown } from "lucide-react";
import { hero, site } from "@/content/site";
import { showProjects } from "@/lib/visibility";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EASE, LineReveal } from "@/components/ui/motion";

const toneClass = {
  base: "text-paper",
  dim: "text-paper/45",
  accent: "accent",
} as const;

const pillars = site.tagline.split(" ").filter(Boolean); // ["Gestão.", "Estratégia.", "Tecnologia."]

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // Saída em profundidade: o palco recua enquanto o visitante entra nos bastidores.
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const lightScale = useTransform(scrollYProgress, [0, 1], [1, 1.35]);

  return (
    <section
      id="topo"
      ref={ref}
      aria-label="Apresentação"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden pt-24 md:pt-28"
    >
      {/* Luz de palco — único foco de luz da página, ligado ao conceito */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-[30%] left-1/2 -z-10 h-[120vh] w-[120vw] -translate-x-1/2 md:left-[62%] md:w-[80vw]"
        style={{
          scale: lightScale,
          background:
            "radial-gradient(ellipse 45% 55% at 50% 30%, rgb(215 168 62 / 0.13), rgb(215 168 62 / 0.03) 45%, transparent 70%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.4, ease: EASE }}
      />
      {/* Fios verticais: marcação de palco, alinhados às colunas dos pilares */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="container-x h-full">
          <div className="relative h-full">
            {[0, 1, 2, 3].map((i) => (
              <motion.span
                key={i}
                className="absolute bottom-0 top-20 hidden w-px origin-top bg-line md:block"
                style={{ left: `${(100 / 3) * i}%` }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 1.8, delay: 0.1 * i, ease: EASE }}
              />
            ))}
          </div>
        </div>
      </div>

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="container-x flex flex-1 flex-col justify-between gap-12"
      >
        <motion.p
          className="cue flex items-center gap-3 pt-6 md:pt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <span aria-hidden className="inline-block size-1.5 rounded-full bg-gold" />
          {hero.eyebrow}
        </motion.p>

        <div>
          <LineReveal
            as="h1"
            trigger="mount"
            delay={0.35}
            stagger={0.11}
            lines={hero.headline.map((l) => l.text)}
            lineClassName={(i) => toneClass[hero.headline[i].tone]}
            className="display text-[clamp(2.7rem,min(7.8vw,11.5vh),8.75rem)] leading-[0.94]"
          />

          <div className="mt-10 grid gap-8 md:mt-12 md:grid-cols-12 md:items-end">
            <motion.p
              className="max-w-md text-base leading-relaxed text-paper/75 md:col-span-5 md:text-lg"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.0, ease: EASE }}
            >
              {hero.sub}
            </motion.p>
            <motion.div
              className="flex flex-col gap-3 sm:flex-row sm:items-center md:col-span-7 md:justify-end"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.15, ease: EASE }}
            >
              <ButtonLink href={hero.primaryCta.href}>{hero.primaryCta.label}</ButtonLink>
              {showProjects && (
                <ButtonLink
                  href={hero.secondaryCta.href}
                  variant="ghost"
                  icon={<ArrowDown className="size-4" strokeWidth={1.75} />}
                >
                  {hero.secondaryCta.label}
                </ButtonLink>
              )}
            </motion.div>
          </div>
        </div>

        {/* Rodapé do hero: os três pilares da frase institucional */}
        <motion.div
          className="grid grid-cols-3 border-t border-line pb-6 pt-5 md:pb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.4 }}
        >
          {pillars.map((p, i) => (
            <p key={p} className="flex items-baseline gap-2 text-sm text-paper/80 md:gap-4 md:text-base">
              <span className="cue hidden text-[0.65rem] sm:inline">0{i + 1}</span>
              {p}
            </p>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
