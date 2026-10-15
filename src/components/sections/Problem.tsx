"use client";

import { useEffect, useRef, useState } from "react";
import { problem } from "@/content/site";
import { Reveal } from "@/components/ui/motion";
import { SectionIntro, splitSentences } from "@/components/ui/SectionIntro";
import { ArchitectureBuild } from "./ArchitectureBuild";
import { MessageCircle } from "lucide-react";
import { primaryContact } from "@/lib/contact";
import { ButtonLink } from "@/components/ui/ButtonLink";

/**
 * 02 — DESCOBERTA · "Entre na nossa visão"
 * A tela fica fixa enquanto o visitante rola (rolagem nativa, sem bloqueio).
 * Cada desafio se abre do centro como um portal sobre o anterior, que
 * avança em direção ao visitante e se dissolve, como mergulhar na visão
 * que a Backstag tem da empresa. Rolagem 100% livre: sem encaixe forçado.
 */
/**
 * Distância de rolagem por cena (em svh). Cada cena tem uma zona de
 * descanso: a troca só acontece no miolo do trecho (HOLD de cada lado),
 * então um toque leve não pula duas cenas.
 */
const STEP = 80;
const HOLD = 0.22;

export function Problem() {
  const main = primaryContact();
  const items = problem.items;
  const n = items.length;
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ringRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  const [seen, setSeen] = useState(0); // maior cena já revelada (animações não voltam)

  useEffect(() => {
    const track = trackRef.current!;
    const stage = track.firstElementChild as HTMLElement;
    let raf = 0;
    // medidas lidas só ao abrir e quando a página muda de tamanho (nunca a cada quadro)
    let top = 0;
    let vh = 1;
    let lastActive = -1;
    let lastSeen = -1;
    const measure = () => {
      // o palco é o bloco preto (com margem): mede o próprio palco, não a janela
      vh = stage.clientHeight;
      const w = stage.clientWidth;
      top = track.getBoundingClientRect().top + window.scrollY;
      // raio que cobre a tela a partir do centro do portal (50% · 46%)
      const R = Math.ceil(Math.hypot(w / 2, vh * 0.54)) + 2;
      stage.style.setProperty("--R", `${R}px`);
      stage.style.setProperty("--cx", `${w / 2}px`);
      stage.style.setProperty("--cy", `${vh * 0.46}px`);
      stage.style.setProperty("--vw", `${w}px`);
      stage.style.setProperty("--vh", `${vh}px`);
    };
    const update = () => {
      raf = 0;
      const raw = Math.min(n - 1, Math.max(0, (window.scrollY - top) / (vh * (STEP / 100))));
      const k = Math.floor(raw);
      const f = Math.min(1, Math.max(0, (raw - k - HOLD) / (1 - HOLD * 2)));
      const seg = Math.min(n - 1, k + f);
      let ring = { s: 0, o: 0 };
      for (let i = 0; i < n; i++) {
        const el = slideRefs.current[i];
        if (!el) continue;
        // revelação desta cena (0 → 1) e saída (cena seguinte entrando)
        const reveal = i === 0 ? 1 : Math.min(1, Math.max(0, (seg - (i - 1)) / 0.85));
        const leave = i === n - 1 ? 0 : Math.min(1, Math.max(0, seg - i));
        const eased = 1 - Math.pow(1 - reveal, 2);
        el.style.visibility = reveal <= 0 || leave >= 1 ? "hidden" : "visible";
        // portal: um círculo que cresce (escala) com o conteúdo em escala inversa,
        // tudo na placa de vídeo, sem redesenhar a tela a cada quadro
        const clip = el.firstElementChild as HTMLElement;
        const counter = clip.firstElementChild as HTMLElement;
        const inner = counter.firstElementChild as HTMLElement;
        if (reveal >= 1) {
          clip.style.transform = "";
          counter.style.transform = "";
        } else if (reveal > 0) {
          const sc = Math.max(0.002, eased);
          clip.style.transform = `scale(${sc.toFixed(4)})`;
          counter.style.transform = `scale(${(1 / sc).toFixed(4)})`;
        }
        inner.style.transform = leave > 0 ? `scale(${(1 + leave * 0.35).toFixed(3)})` : "";
        inner.style.opacity = leave > 0 ? (1 - leave).toFixed(3) : "";
        if (i > 0 && reveal > 0 && reveal < 1) ring = { s: eased, o: Math.min(1, reveal * (1 - reveal) * 5) };
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(-50%, -50%) scale(${ring.s.toFixed(4)})`;
        ringRef.current.style.opacity = ring.o.toFixed(3);
      }
      const a = Math.round(seg);
      if (a !== lastActive) setActive((lastActive = a));
      // a cena começa a se transformar assim que o portal se abre
      const opening = Math.min(n - 1, Math.floor(seg + 0.7));
      if (opening > lastSeen) setSeen((lastSeen = opening));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      onScroll();
    };
    measure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    // fotos e vídeos acima podem mudar a altura da página depois de carregar
    const ro = new ResizeObserver(onResize);
    ro.observe(document.body);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [n]);

  // a primeira cena ganha vida quando o trilho entra na tela
  const [entered, setEntered] = useState(false);
  // fora da tela, os símbolos param (economia de bateria e rolagem mais lisa)
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setEntered(true), { rootMargin: "0px 0px -30% 0px" });
    const io2 = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
    io.observe(trackRef.current!);
    io2.observe(trackRef.current!);
    return () => {
      io.disconnect();
      io2.disconnect();
    };
  }, []);

  return (
    <section id="desafios" aria-label={problem.label} data-surface="dark" data-rgb="20 20 20" className="tone-night relative overflow-clip rounded-[1.75rem] bg-ink md:rounded-[2.5rem]">
      {/* o fundo escurece até a cor exata das cenas: nenhuma divisão visível */}
      <div>
      <div className="container-x pb-2 pt-24 md:pb-4 md:pt-32">
        <SectionIntro
          label={problem.label}
          titleLines={splitSentences(problem.vision.title)}
        />
      </div>
      </div>

      {/* Trilho: uma tela de rolagem por cena */}
      <div ref={trackRef} data-pin className="relative" style={{ height: `${(n - 1) * STEP + 100}svh` }}>
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          {items.map((item, i) => {
            const on = entered && i <= seen;
            // só a cena atual e as vizinhas animam; as demais ficam congeladas
            const live = inView && Math.abs(i - active) <= 1;
            return (
              <div
                key={item.title}
                ref={(el) => {
                  slideRefs.current[i] = el;
                }}
                aria-hidden={i !== active}
                className="absolute inset-0"
                style={{ zIndex: i + 1 }}
              >
                <div className="pt-clip">
                <div className="pt-counter bg-ink">
                <div className={`h-full w-full ${live ? "will-change-transform" : "sym-paused"} ${on ? "slide-on sym-on" : ""}`}>
                  {/* fundo da cena: grade técnica + brilho no centro */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(ellipse 60% 45% at 50% 38%, rgb(244 196 0 / 0.07), transparent 70%)",
                    }}
                  />
                  <Scene item={item} index={i} />
                </div>
                </div>
                </div>
              </div>
            );
          })}
          {/* borda luminosa do portal */}
          <span
            ref={ringRef}
            aria-hidden
            className="pt-ring pointer-events-none absolute left-1/2 top-[46%] z-[20] rounded-full border border-gold/50 shadow-[0_0_24px_2px_rgb(0_0_0/0.5)]"
            style={{ opacity: 0 }}
          />
        </div>
      </div>

      {/* Fecho da Descoberta: convite direto, no momento em que o visitante se reconheceu */}
      <div>
      <div className="container-x pb-6 pt-16 md:pb-10 md:pt-24">
        <Reveal className="flex flex-col items-center gap-7 text-center">
          <p className="display t-h2 max-w-3xl">
            Viu a sua empresa em <span className="accent">algum desses desafios?</span>
          </p>
          <ButtonLink href={main.href} external icon={<MessageCircle className="size-4" strokeWidth={1.5} />} className="shrink-0">
            {main.channel === "whatsapp" ? "Conversar pelo WhatsApp" : "Fale com a Backstag"}
          </ButtonLink>
        </Reveal>
      </div>
      </div>
    </section>
  );
}

type Item = (typeof problem.items)[number];

function Scene({ item, index }: { item: Item; index: number }) {
  return (
    <div className="container-x relative grid h-full grid-rows-[auto_minmax(0,1fr)_auto] gap-3 pb-16 pt-[4.75rem] md:grid-cols-12 md:grid-rows-1 md:items-center md:gap-10 md:pb-16 md:pt-20">
      {/* cabeçalho da cena */}
      <div className="rv flex items-center md:hidden" style={{ ["--d" as string]: "0.05s" }}>
        <span className="label-tech rounded-full border border-gold/40 px-3 py-1.5 text-gold-light">{item.front}</span>
      </div>

      {/* empresa em construção: cada desafio encaixa uma camada */}
      <div data-sym-box className="relative min-h-[96px] md:col-span-6 md:h-[66vh]">
        <ArchitectureBuild step={index} labels={[...problem.pieces]} done={problem.pieces[5]} />
      </div>

      {/* narrativa */}
      <div className="md:col-span-6">
        {/* no computador a etiqueta abre o bloco de texto, no mesmo alinhamento */}
        <span className="rv label-tech mb-6 hidden rounded-full border border-gold/40 px-3 py-1.5 text-gold-light md:inline-flex" style={{ ["--d" as string]: "0.05s" }}>
          {item.front}
        </span>
        <p className="rv label-tech text-paper/70" style={{ ["--d" as string]: "0.15s" }}>
          Na sua empresa hoje
        </p>
        <h3 className="rv display t-h3 mt-2" style={{ ["--d" as string]: "0.22s" }}>
          {item.title}
        </h3>
        <p className="rv mt-2 max-w-lg text-[0.8rem] leading-relaxed text-mute [@media(max-height:740px)]:hidden md:mt-4 md:text-base" style={{ ["--d" as string]: "0.3s" }}>
          {item.text}
        </p>

        <span aria-hidden className="rv-line mt-4 block h-px w-full bg-gradient-to-r from-gold to-transparent md:mt-8" style={{ ["--d" as string]: "0.55s" }} />

        <p className="rv label-tech mt-4 text-gold md:mt-8" style={{ ["--d" as string]: "0.8s" }}>
          O que enxergamos
        </p>
        <p className="rv mt-2 max-w-xl text-[0.92rem] leading-snug text-paper [@media(max-height:700px)]:text-[0.86rem] md:text-xl md:leading-snug" style={{ ["--d" as string]: "0.9s" }}>
          {item.approach}
        </p>

        <p className="rv label-tech mt-4 text-paper/70 [@media(max-height:700px)]:hidden md:mt-8" style={{ ["--d" as string]: "1.05s" }}>
          Como chegamos lá
        </p>
        {/* etapas livres, ligadas por uma linha — sem caixas nem números */}
        <ol className="relative mt-3 flex flex-col gap-2.5 [@media(max-height:700px)]:hidden md:mt-4 md:flex-row md:gap-8">
          <span aria-hidden className="rv-line absolute bottom-1.5 left-[3px] top-1.5 w-px origin-top bg-gold/50 md:bottom-auto md:left-0 md:right-0 md:top-[3px] md:h-px md:w-auto md:origin-left" style={{ ["--d" as string]: "1.1s" }} />
          {item.steps.map((s, k) => (
            <li key={s} className="rv relative flex items-center gap-3 md:flex-1 md:flex-col md:items-start md:gap-3" style={{ ["--d" as string]: `${1.2 + k * 0.14}s` }}>
              <span aria-hidden className="relative size-[7px] shrink-0 rounded-full bg-gold shadow-[0_0_10px_rgb(240_199_102/0.7)]" />
              <span className="text-sm font-medium leading-snug text-paper md:text-base">{s}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
