"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { hero2026 } from "@/content/hero-2026";
import { ConceptTag, HeadlineTech, prefersReducedMotion, SubAndCtas } from "./HeroCopy";
import { DeviceShowcase } from "./DeviceShowcase";

/**
 * TOPO — foto real dos bastidores ao fundo, notebook e celular realistas
 * mostrando o trabalho. Cada pilar troca o que aparece nas telas; a troca
 * é automática enquanto ninguém interage. Telas ilustrativas: nenhum
 * número, cliente ou resultado.
 */

const layers = [...hero2026.pillars];

export const shortTitle = (t: string) => t.replace("Inteligência Artificial e Automação", "IA e Automação");

export function HeroStrata() {
  const sectionRef = useRef<HTMLElement>(null);
  // O texto recua em profundidade ao rolar
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const copyY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);
  const copyO = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const [active, setActive] = useState<number | null>(null);
  // Destaque automático: percorre os pilares enquanto ninguém interage
  const [auto, setAuto] = useState(0);
  const [interacted, setInteracted] = useState(false);
  const shown = active ?? (interacted ? null : auto);
  // a mensagem explicativa fica no último pilar destacado
  const [lastShown, setLastShown] = useState(0);
  useEffect(() => {
    if (shown != null) setLastShown(shown);
  }, [shown]);
  const blurb = layers[lastShown];

  // a troca automática só acontece com o topo na tela
  const [heroVisible, setHeroVisible] = useState(true);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setHeroVisible(e.isIntersecting));
    io.observe(sectionRef.current!);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (prefersReducedMotion() || interacted || !heroVisible) return;
    const id = window.setInterval(() => setAuto((a) => (a + 1) % layers.length), 3200);
    return () => window.clearInterval(id);
  }, [interacted, heroVisible]);

  return (
    <section
      id="topo"
      ref={sectionRef}
      aria-label="Apresentação"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden"
    >

      {/* Foto real dos bastidores de uma operação, tratada em tom quente e escurecida */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
        <Image
          src="/scenes/bastidores-mobile.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="hero-photo object-cover opacity-70 lg:hidden"
        />
        <Image
          src="/scenes/bastidores-desktop.webp"
          alt=""
          fill
          sizes="100vw"
          className="hero-photo hidden object-cover opacity-60 lg:block"
        />
        <span className="absolute inset-0 bg-[linear-gradient(180deg,rgb(9_9_11/0.6)_0%,rgb(9_9_11/0.3)_28%,rgb(9_9_11/0.82)_58%,#09090b_100%)] lg:bg-[linear-gradient(90deg,rgb(9_9_11/0.94)_0%,rgb(9_9_11/0.7)_42%,rgb(9_9_11/0.4)_100%)]" />
        <span className="absolute inset-x-0 bottom-0 hidden h-1/3 bg-[linear-gradient(180deg,transparent,#09090b)] lg:block" />
      </div>

      {/* Celular e tablet: notebook e celular no alto, texto embaixo */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[11%] -z-10 aspect-[1.5] w-[min(calc(100%-2.5rem),48vh)] -translate-x-1/2 lg:hidden"
      >
        <DeviceShowcase index={shown ?? lastShown} />
      </div>

      <motion.div
        style={{ y: copyY, opacity: copyO }}
        className="container-x flex flex-1 flex-col pb-8 pt-20 lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-10 lg:pb-16 lg:pt-28"
      >
        {/* coluna do texto: quem fala primeiro */}
        <div className="flex flex-1 flex-col lg:col-span-7 lg:flex-none">
          <ConceptTag />
          <HeadlineTech className="mt-[26vh] text-[clamp(3rem,min(15vw,8.5vh),13.5rem)] md:mt-[36vh] lg:mt-8 lg:text-[clamp(3.4rem,6.2vw,7.4rem)]" />

          {/* Celular e tablet: toque num pilar para trocar o que aparece nas telas */}
          <div role="group" aria-label="Pilares" className="no-scrollbar -mx-5 mt-5 flex gap-2 overflow-x-auto px-5 md:-mx-10 md:px-10 lg:hidden">
            {layers.map((l, i) => (
              <button
                key={l.code}
                type="button"
                aria-pressed={shown === i}
                onClick={() => {
                  setInteracted(true);
                  setActive(active === i ? null : i);
                }}
                className={`label-tech inline-flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3 text-[0.6rem] leading-tight transition-colors ${
                  shown === i ? "border-gold bg-gold/10 text-gold-light" : "border-line-strong text-paper/70"
                }`}
              >
                <span aria-hidden className={`size-1.5 shrink-0 rounded-full ${shown === i ? "bg-gold" : "bg-paper/30"}`} />
                {shortTitle(l.title)}
              </button>
            ))}
          </div>
          <PillarBlurb pillar={blurb} className="mt-4 min-h-[3.4rem] lg:hidden" />

          <SubAndCtas className="mt-auto pt-4 lg:mt-10 lg:pt-0" hideSubMobile />
        </div>

        {/* Computador: as telas e os pilares que as controlam ficam juntos */}
        <div className="hidden lg:col-span-5 lg:block">
          <div aria-hidden className="relative aspect-[1.5] w-full">
            <DeviceShowcase index={shown ?? lastShown} />
          </div>
          <ol className="mt-10 grid grid-cols-2 gap-x-6">
            {layers.map((l, i) => (
              <li key={l.code}>
                <a
                  href="/#desafios"
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
                  className={`flex min-h-11 items-baseline gap-3 border-t py-3 text-sm transition-colors ${
                    shown === i ? "border-gold text-paper" : "border-line text-paper/65 hover:text-paper"
                  }`}
                >
                  <span aria-hidden className={`size-1.5 shrink-0 self-center rounded-full ${shown === i ? "bg-gold" : "bg-paper/30"}`} />
                  {shortTitle(l.title)}
                </a>
              </li>
            ))}
          </ol>
          <PillarBlurb pillar={blurb} className="mt-4 min-h-[3rem]" />
        </div>
      </motion.div>
    </section>
  );
}

/** Mensagem explicativa do pilar em destaque (troca junto com o painel). */
function PillarBlurb({ pillar, className = "" }: { pillar: (typeof layers)[number]; className?: string }) {
  return (
    <div className={className}>
      <motion.div
        key={pillar.code}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="max-w-md border-l border-gold/60 pl-3 text-sm leading-relaxed text-paper/80 md:text-[0.95rem]">{pillar.blurb}</p>
      </motion.div>
    </div>
  );
}
