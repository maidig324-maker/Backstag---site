"use client";

import { founder } from "@/content/founder";
import { site } from "@/content/site";
import { motion } from "motion/react";
import { EASE, ImageReveal, LineReveal, Reveal } from "@/components/ui/motion";
import { FounderVisual } from "./FounderVisual";

export function Founder() {
  const showPhotoSlot = founder.photo || site.showPlaceholders;

  return (
    <section id="sobre" aria-label={founder.label} className="relative overflow-x-clip py-28 md:py-44">
      <div className="container-x grid gap-14 md:grid-cols-12 md:gap-10">
        {showPhotoSlot && (
          <div className="md:col-span-6">
            {founder.photo ? (
              <FounderVisual photo={founder.photo} />
            ) : (
              <ImageReveal className="relative aspect-[4/5] w-full overflow-hidden rounded-md border border-line-strong">
                <div className="placeholder-surface flex h-full w-full flex-col justify-end p-6">
                  <p className="cue text-paper/50">Placeholder</p>
                  <p className="mt-2 text-sm text-mute">
                    Fotografia real de {founder.name} — a ser enviada pelo cliente.
                  </p>
                </div>
              </ImageReveal>
            )}
          </div>
        )}

        <div className={showPhotoSlot ? "md:col-span-6 md:self-center" : "md:col-span-8"}>
          <LineReveal
            as="h2"
            lines={[founder.name]}
            className="display t-h2"
          />
          <Reveal delay={0.1}>
            <p className="mt-3 text-sm uppercase tracking-[0.16em] text-mute">{founder.role}</p>
          </Reveal>

          <div className="mt-10 space-y-5">
            {founder.paragraphs.map((t, i) => (
              <Reveal key={i} delay={0.08 * i}>
                <p className={i === 0 ? "text-lg leading-relaxed text-paper md:text-xl" : "leading-relaxed text-mute md:text-lg"}>
                  {t}
                </p>
              </Reveal>
            ))}
          </div>

          {/* Da visão à execução: os princípios como um fluxo conectado */}
          <ol className="relative mt-12 grid gap-6 sm:grid-cols-3 sm:gap-4">
            <motion.span
              aria-hidden
              data-reveal
              className="absolute left-[5px] top-2 h-[calc(100%-1rem)] w-px origin-top bg-gold sm:left-0 sm:right-0 sm:top-[5px] sm:h-px sm:w-full sm:origin-left"
              initial={{ scaleX: 0, scaleY: 0 }}
              whileInView={{ scaleX: 1, scaleY: 1 }}
              viewport={{ once: true, margin: "0px 0px -15% 0px" }}
              transition={{ duration: 1.4, ease: EASE }}
            />
            {founder.principles.map((p, i) => (
              <li key={p} className="relative pl-7 sm:pl-0 sm:pt-7">
                <span aria-hidden className="absolute left-0 top-1 size-[11px] rounded-full border border-gold bg-ink sm:top-0" />
                <Reveal delay={0.25 + i * 0.2} y={10}>
                  <p className="label-tech text-gold">{["Visão", "Execução", "Evolução"][i]}</p>
                  <p className="mt-2 text-sm text-paper/85">{p}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
