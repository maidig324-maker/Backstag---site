"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import { problem } from "@/content/site";
import { sectionNumber } from "@/lib/visibility";
import { Reveal } from "@/components/ui/motion";
import { SectionIntro, splitLines } from "@/components/ui/SectionIntro";
import { discoverySymbols } from "./DiscoverySymbols";

/**
 * 02 — DESCOBERTA · "Entre na nossa visão"
 * A tela fica fixa enquanto o visitante rola (rolagem nativa, sem bloqueio).
 * Cada desafio se abre do centro como um portal sobre o anterior, que
 * avança em direção ao visitante e se dissolve, como mergulhar na visão
 * que a Backstag tem da empresa. Pontos de encaixe (snap) fazem cada
 * passada de dedo terminar numa cena completa.
 */
export function Problem() {
  const items = problem.items;
  const n = items.length;
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ringRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  const [seen, setSeen] = useState(0); // maior cena já revelada (animações não voltam)

  useEffect(() => {
    const track = trackRef.current!;
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const w = window.innerWidth;
      const seg = Math.min(n - 1, Math.max(0, -track.getBoundingClientRect().top / vh));
      const R = Math.sqrt((w * w + vh * vh) / 2) * 1.5; // raio que cobre a tela
      let ring = { r: 0, o: 0 };
      for (let i = 0; i < n; i++) {
        const el = slideRefs.current[i];
        if (!el) continue;
        // revelação desta cena (0 → 1) e saída (cena seguinte entrando)
        const reveal = i === 0 ? 1 : Math.min(1, Math.max(0, seg - (i - 1)));
        const leave = i === n - 1 ? 0 : Math.min(1, Math.max(0, seg - i));
        const eased = 1 - Math.pow(1 - reveal, 2);
        el.style.clipPath = i === 0 || reveal >= 1 ? "none" : `circle(${(eased * R).toFixed(1)}px at 50% 46%)`;
        el.style.visibility = reveal <= 0 || leave >= 1 ? "hidden" : "visible";
        const inner = el.firstElementChild as HTMLElement | null;
        if (inner) {
          inner.style.transform = `scale(${(1 + leave * 0.35).toFixed(3)})`;
          inner.style.opacity = (1 - leave).toFixed(3);
          inner.style.filter = leave > 0.02 ? `blur(${(leave * 6).toFixed(1)}px)` : "none";
        }
        if (i > 0 && reveal > 0 && reveal < 1) ring = { r: eased * R, o: Math.min(1, reveal * (1 - reveal) * 5) };
      }
      if (ringRef.current) {
        ringRef.current.style.width = ringRef.current.style.height = `${(ring.r * 2).toFixed(1)}px`;
        ringRef.current.style.opacity = ring.o.toFixed(3);
      }
      setActive(Math.round(seg));
      // a cena começa a se transformar assim que o portal se abre
      const opening = Math.min(n - 1, Math.floor(seg + 0.7));
      setSeen((s) => Math.max(s, opening));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [n]);

  // a primeira cena ganha vida quando o trilho entra na tela
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setEntered(true), { rootMargin: "0px 0px -30% 0px" });
    io.observe(trackRef.current!);
    return () => io.disconnect();
  }, []);

  return (
    <section id="desafios" aria-label={problem.label} className="relative">
      <div className="container-x pb-10 pt-28 md:pb-16 md:pt-40">
        <SectionIntro
          index={sectionNumber("desafios")}
          label={problem.label}
          titleLines={splitLines(problem.vision.title, 22)}
          text={problem.vision.text}
        />
      </div>

      {/* Trilho: uma tela de rolagem por cena */}
      <div ref={trackRef} data-pin className="relative" style={{ height: `${n * 100}svh` }}>
        {/* pontos de encaixe: cada passada de dedo para numa cena inteira */}
        {items.map((_, i) => (
          <span key={i} aria-hidden className="absolute left-0 h-px w-px snap-start" style={{ top: `${i * 100}svh` }} />
        ))}

        <div className="sticky top-0 h-[100svh] overflow-hidden">
          {items.map((item, i) => {
            const Symbol = discoverySymbols[i];
            const on = entered && i <= seen;
            return (
              <div
                key={item.title}
                ref={(el) => {
                  slideRefs.current[i] = el;
                }}
                aria-hidden={i !== active}
                className="absolute inset-0 bg-ink"
                style={{ zIndex: i + 1 }}
              >
                <div className={`h-full w-full will-change-transform ${on ? "slide-on sym-on" : ""}`}>
                  {/* fundo da cena: grade técnica + brilho no centro */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(ellipse 60% 45% at 50% 40%, rgb(215 168 62 / 0.09), transparent 70%), linear-gradient(rgb(245 245 242 / 0.035) 1px, transparent 1px) 0 0 / 100% 56px",
                    }}
                  />
                  <Scene item={item} index={i} total={n} Symbol={Symbol} />
                </div>
              </div>
            );
          })}
          {/* borda luminosa do portal */}
          <span
            ref={ringRef}
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[46%] z-[20] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold-light/80 shadow-[0_0_40px_6px_rgb(240_199_102/0.35),inset_0_0_40px_6px_rgb(240_199_102/0.2)]"
            style={{ opacity: 0 }}
          />
          {/* indicador de progresso fixo */}
          <div className="pointer-events-none absolute inset-x-0 bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] z-[21]">
            <div className="container-x flex items-center gap-3">
              <span className="label-tech tabular-nums text-paper/60">
                <span className="text-gold">{String(active + 1).padStart(2, "0")}</span> / {String(n).padStart(2, "0")}
              </span>
              <div className="flex flex-1 gap-1.5">
                {items.map((_, i) => (
                  <span key={i} className={`h-0.5 flex-1 transition-colors duration-500 ${i <= active ? "bg-gold" : "bg-line-strong"}`} />
                ))}
              </div>
              <span className="label-tech hidden text-paper/40 sm:inline">{active < n - 1 ? "Role para continuar" : "Fim da visão"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ponte: a Backstag entra em cena */}
      <div className="container-x py-24 md:py-36">
        <Reveal className="grid gap-6 border-t border-gold/40 pt-10 md:grid-cols-12 md:pt-14">
          <p className="label-tech text-gold md:col-span-3">A Backstag</p>
          <p className="display text-[clamp(1.6rem,3.2vw,2.75rem)] leading-[1.1] md:col-span-9">{problem.bridge}</p>
        </Reveal>
      </div>
    </section>
  );
}

type Item = (typeof problem.items)[number];

function Scene({ item, index, total, Symbol }: { item: Item; index: number; total: number; Symbol: () => ReactElement }) {
  return (
    <div className="container-x relative grid h-full grid-rows-[auto_minmax(0,1fr)_auto] gap-3 pb-16 pt-[4.75rem] md:grid-cols-12 md:grid-rows-1 md:items-center md:gap-10 md:pb-20 md:pt-24">
      {/* cabeçalho da cena */}
      <div className="rv flex items-center justify-between gap-4 md:absolute md:inset-x-10 md:top-24" style={{ ["--d" as string]: "0.05s" }}>
        <span className="label-tech text-gold">
          Visão Backstag · {String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
        </span>
        <span className="label-tech rounded-full border border-gold/40 px-3 py-1.5 text-gold-light">{item.front}</span>
      </div>

      {/* símbolo 3D: o problema se transforma diante do visitante */}
      <div className="relative min-h-0 [--k:1.2] md:col-span-6 md:h-[62vh] md:[--k:2.3]">
        <Symbol />
      </div>

      {/* narrativa */}
      <div className="md:col-span-6">
        <p className="rv label-tech text-paper/45" style={{ ["--d" as string]: "0.15s" }}>
          Hoje
        </p>
        <h3 className="rv display mt-2 text-[clamp(1.6rem,4.2vw,3.4rem)]" style={{ ["--d" as string]: "0.22s" }}>
          {item.title}
        </h3>
        <p className="rv mt-2 max-w-lg text-sm leading-relaxed text-mute [@media(max-height:720px)]:hidden md:mt-4 md:text-base" style={{ ["--d" as string]: "0.3s" }}>
          {item.text}
        </p>

        <span aria-hidden className="rv-line mt-4 block h-px w-full bg-gradient-to-r from-gold to-transparent md:mt-8" style={{ ["--d" as string]: "0.55s" }} />

        <p className="rv label-tech mt-4 text-gold md:mt-8" style={{ ["--d" as string]: "0.8s" }}>
          O que enxergamos
        </p>
        <p className="rv mt-2 max-w-xl text-[1.05rem] leading-snug text-paper md:text-2xl md:leading-snug" style={{ ["--d" as string]: "0.9s" }}>
          {item.approach}
        </p>

        <p className="rv label-tech mt-4 text-paper/45 md:mt-8" style={{ ["--d" as string]: "1.05s" }}>
          Como chegamos lá
        </p>
        <ol className="mt-2 grid grid-cols-3 gap-2 md:gap-3">
          {item.steps.map((s, k) => (
            <li
              key={s}
              className="rv rounded-md border border-line-strong p-2.5 md:p-4"
              style={{ ["--d" as string]: `${1.15 + k * 0.12}s` }}
            >
              <span className="label-tech text-gold">{String(k + 1).padStart(2, "0")}</span>
              <span className="mt-1.5 block text-[0.72rem] leading-snug text-paper/85 md:text-sm">{s}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
