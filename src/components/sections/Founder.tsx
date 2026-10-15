"use client";

import { useEffect, useRef } from "react";
import { founder } from "@/content/founder";
import { motion } from "motion/react";
import { EASE, LineReveal, Reveal } from "@/components/ui/motion";
import { FounderVisual } from "./FounderVisual";

/**
 * FUNDADOR — a rolagem para na foto.
 * O palco fica preso na tela enquanto o nome e as informações sobem pela
 * lateral, no mesmo ritmo do dedo (1:1, sem atraso). Quando o texto chega
 * ao lugar, a rolagem do site volta ao normal.
 * Celular: a foto fica no alto e o texto sobe por cima, com a foto
 * escurecendo para a leitura. Movimento reduzido: layout normal, sem prender.
 */
export function Founder() {
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const dimRef = useRef<HTMLSpanElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current!;
    const stage = stageRef.current!;
    const text = textRef.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let top = 0;
    let start = 0;
    let travel = 0;
    let raf = 0;
    let wide = false;

    const update = () => {
      raf = 0;
      if (reduced.matches) return;
      const moved = Math.min(travel, Math.max(0, window.scrollY - top));
      text.style.transform = `translate3d(0, ${(start - moved).toFixed(1)}px, 0)`;
      // celular: a foto escurece conforme o texto passa por cima dela
      if (dimRef.current) dimRef.current.style.opacity = wide || !travel ? "0" : (Math.min(1, moved / Math.max(1, travel * 0.45)) * 0.9).toFixed(3);
    };
    const measure = () => {
      if (reduced.matches) {
        track.style.height = "";
        text.style.transform = "";
        return;
      }
      wide = window.matchMedia("(min-width: 768px)").matches;
      const vh = stage.offsetHeight;
      const h = text.offsetHeight;
      // de onde o texto parte e onde para (celular: até o fim do texto aparecer)
      // celular: o texto nasce logo abaixo da foto, sem cobri-la no início
      const photoBottom = photoRef.current ? photoRef.current.offsetTop + photoRef.current.offsetHeight : vh * 0.6;
      start = wide ? vh * 0.62 : Math.min(vh * 0.72, photoBottom + 18);
      const end = wide ? Math.max(vh * 0.12, (vh - h) / 2 + vh * 0.04) : Math.min(start, vh - h - 28);
      travel = Math.max(0, start - end);
      // trilho = uma tela + o caminho do texto + um respiro com tudo no lugar
      track.style.height = `${Math.round(vh + travel + vh * 0.3)}px`;
      top = track.getBoundingClientRect().top + window.scrollY;
      update();
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    reduced.addEventListener("change", measure);
    // fontes e imagens podem mudar a altura do texto ou da página
    const ro = new ResizeObserver(measure);
    ro.observe(text);
    ro.observe(document.body);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      reduced.removeEventListener("change", measure);
      ro.disconnect();
    };
  }, []);

  return (
    <section ref={trackRef} id="sobre" aria-label={founder.label} data-pin className="fd-track relative">
      <div ref={stageRef} className="fd-stage sticky top-0 h-[100svh] overflow-hidden">
        <div className="container-x relative grid h-full md:grid-cols-12 md:gap-x-10">
          {/* a foto fica parada enquanto as informações sobem */}
          <div ref={photoRef} className="fd-photo absolute z-0 inset-x-5 top-[4.75rem] md:relative md:inset-auto md:top-auto md:col-span-6 md:self-center md:pt-16">
            {founder.photo && <FounderVisual photo={founder.photo} />}
            <span ref={dimRef} aria-hidden className="pointer-events-none absolute -inset-x-5 -bottom-[14%] -top-6 z-40 bg-gradient-to-b from-[#09090b] from-80% to-transparent opacity-0 md:hidden" />
          </div>

          <div className="relative z-10 md:col-span-6 md:col-start-7">
            <div ref={textRef} className="fd-text absolute inset-x-0 top-0 text-center md:text-left">
              <LineReveal as="h2" lines={[founder.name]} className="display t-h2" />
              <Reveal delay={0.1}>
                <p className="mt-3 text-sm uppercase tracking-[0.16em] text-mute">{founder.role}</p>
              </Reveal>

              <div className="mt-8 space-y-5 text-left md:mt-10">
                {founder.paragraphs.map((t, i) => (
                  <Reveal key={i} delay={0.06 * i}>
                    <p className={i === 0 ? "text-lg leading-relaxed text-paper md:text-xl" : "leading-relaxed text-mute md:text-lg"}>{t}</p>
                  </Reveal>
                ))}
              </div>

              {/* Da visão à execução: os princípios como um fluxo conectado */}
              <ol className="relative mt-10 grid gap-6 text-left sm:grid-cols-3 sm:gap-4 md:mt-12">
                <motion.span
                  aria-hidden
                  data-reveal
                  className="absolute left-[5px] top-2 h-[calc(100%-1rem)] w-px origin-top bg-gold sm:left-0 sm:right-0 sm:top-[5px] sm:h-px sm:w-full sm:origin-left"
                  initial={{ scaleX: 0, scaleY: 0 }}
                  whileInView={{ scaleX: 1, scaleY: 1 }}
                  viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                  transition={{ duration: 1.4, ease: EASE }}
                />
                {founder.principles.map((p, i) => (
                  <li key={p} className="relative pl-7 sm:pl-0 sm:pt-7">
                    <span aria-hidden className="absolute left-0 top-1 size-[11px] rounded-full border border-gold bg-ink sm:top-0" />
                    <Reveal delay={0.2 + i * 0.15} y={10}>
                      <p className="label-tech text-gold">{["Visão", "Execução", "Evolução"][i]}</p>
                      <p className="mt-2 text-sm text-paper/85">{p}</p>
                    </Reveal>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
