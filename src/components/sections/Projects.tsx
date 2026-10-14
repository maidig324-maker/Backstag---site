"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";
import { projectsIntro, type Project, type ProjectStatus, type ProjectVideo } from "@/content/projects";
import { projectTitle, visibleProjects } from "@/lib/visibility";
import { EASE, Reveal } from "@/components/ui/motion";
import { SectionIntro, splitSentences } from "@/components/ui/SectionIntro";

const statusLabel: Record<ProjectStatus, string> = {
  publicado: "Projeto realizado",
  "em-operacao": "Em operação",
  "em-andamento": "Em andamento",
  "em-documentacao": "Estudo de caso em documentação",
};

/**
 * PROJETOS — carrossel 3D
 * Os projetos ficam num anel em profundidade: o da frente no centro, os
 * vizinhos menores e girados de cada lado. Arrastar com o dedo gira o anel
 * (contínuo, volta ao primeiro depois do último). Tocar num vizinho traz
 * ele para a frente; tocar no da frente abre o estudo de caso. A legenda
 * do projeto em foco entra em camadas. Rolagem vertical da página livre.
 */
export function Projects() {
  const [active, setActive] = useState<Project | null>(null);
  const items = visibleProjects;
  const n = items.length;
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pos = useRef(0); // posição contínua do anel
  const target = useRef(0);
  const [current, setCurrent] = useState(0);
  const goRef = useRef<(to: number) => void>(() => {});
  const movedRef = useRef(false);

  const wrap = (v: number) => ((v % n) + n) % n;

  useEffect(() => {
    if (n === 0) return;
    const stage = stageRef.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    const paint = () => {
      for (let i = 0; i < n; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        let o = i - pos.current;
        o = ((((o + n / 2) % n) + n) % n) - n / 2; // menor distância no anel
        const ao = Math.abs(o);
        el.style.setProperty("--o", o.toFixed(3));
        el.style.setProperty("--ao", ao.toFixed(3));
        el.style.zIndex = String(100 - Math.round(ao * 10));
        el.style.visibility = ao > 2.2 ? "hidden" : "visible";
      }
      setCurrent(wrap(Math.round(pos.current)));
    };

    const tick = () => {
      const d = target.current - pos.current;
      pos.current += reduced ? d : d * 0.14;
      if (Math.abs(d) < 0.001) pos.current = target.current;
      paint();
      raf = pos.current === target.current ? 0 : requestAnimationFrame(tick);
    };
    const animate = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    goRef.current = (to: number) => {
      target.current = to;
      animate();
    };

    // arraste horizontal (a rolagem vertical continua com o navegador)
    let startX = 0, startY = 0, startPos = 0, dragging = false, decided = false, lastX = 0, lastT = 0, vel = 0;
    const spacing = () => stage.clientWidth * 0.42;
    const down = (e: PointerEvent) => {
      startX = lastX = e.clientX;
      startY = e.clientY;
      startPos = pos.current;
      lastT = performance.now();
      dragging = true;
      decided = false;
      vel = 0;
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX, dy = e.clientY - startY;
      if (!decided) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        decided = true;
        if (Math.abs(dy) > Math.abs(dx)) {
          dragging = false; // gesto vertical: deixa a página rolar
          return;
        }
        stage.setPointerCapture(e.pointerId);
        movedRef.current = true;
      }
      const now = performance.now();
      vel = (e.clientX - lastX) / Math.max(1, now - lastT);
      lastX = e.clientX;
      lastT = now;
      cancelAnimationFrame(raf);
      raf = 0;
      pos.current = startPos - dx / spacing();
      target.current = pos.current;
      paint();
    };
    const up = () => {
      if (!dragging) return;
      dragging = false;
      if (!decided) return;
      // impulso: um gesto rápido avança um projeto mesmo com arraste curto
      const fling = -vel * 260 / spacing();
      goRef.current(Math.round(pos.current + Math.max(-1, Math.min(1, fling))));
      window.setTimeout(() => (movedRef.current = false), 50);
    };
    stage.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);

    // convite: na primeira aparição, o anel gira um pouco e volta
    let t1 = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        if (reduced) return;
        goRef.current(0.35);
        t1 = window.setTimeout(() => goRef.current(0), 600);
      },
      { threshold: 0.6 },
    );
    io.observe(stage);

    paint();
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t1);
      io.disconnect();
      stage.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [n]);

  const step = (dir: 1 | -1) => goRef.current(Math.round(target.current) + dir);

  if (n === 0) return null;
  const front = items[current];

  const onCardClick = (i: number) => {
    if (movedRef.current) return;
    if (i === current) setActive(items[i]);
    else {
      let o = i - Math.round(target.current);
      o = ((((o + n / 2) % n) + n) % n) - n / 2;
      goRef.current(Math.round(target.current) + o);
    }
  };

  return (
    <section id="projetos" aria-label={projectsIntro.label} className="relative overflow-hidden pb-28 pt-16 md:pb-40 md:pt-24">
      <div className="container-x">
        <div className="grid gap-10 md:grid-cols-12">
          <SectionIntro className="md:col-span-7" label={projectsIntro.label} titleLines={splitSentences(projectsIntro.title)} />
        </div>
      </div>

      {/* Palco 3D */}
      <div
        ref={stageRef}
        role="region"
        aria-roledescription="carrossel"
        aria-label="Projetos"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
          if (e.key === "Enter") setActive(front);
        }}
        className="c3-stage relative mx-auto mt-12 h-[min(108vw,34rem)] w-full max-w-[88rem] cursor-grab select-none [--cw:60vw] [--sx:33vw] [--sz:260px] active:cursor-grabbing md:mt-20 md:h-[min(44vw,38rem)] md:[--cw:min(30vw,26rem)] md:[--sx:min(24vw,22rem)] md:[--sz:320px]"
        style={{ touchAction: "pan-y" }}
      >
        {items.map((p, i) => (
          <div
            key={p.id}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="c3-card absolute left-1/2 top-1/2 w-[var(--cw)]"
            aria-hidden={i !== current}
            onClick={() => onCardClick(i)}
          >
            <CardFace project={p} />
          </div>
        ))}
        {/* reflexo/chão do palco */}
        <span aria-hidden className="pointer-events-none absolute inset-x-[10%] bottom-0 h-16 rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgb(215_168_62/0.18),transparent_70%)] blur-md" />
      </div>

      {/* Legenda do projeto da frente, em camadas */}
      <div className="container-x mt-8 md:mt-12">
        {/* altura fixa: trocar de projeto não empurra o resto da página */}
        <div key={front.id} className="min-h-[16rem] max-w-2xl md:min-h-[12.5rem]">
          <motion.p
            data-reveal
            className="label-tech flex flex-wrap items-center gap-x-3 gap-y-1 text-paper/55"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <span>{front.sector}</span>
            <span aria-hidden className="h-px w-4 bg-line-strong" />
            <span className={front.status === "em-documentacao" ? "text-gold" : ""}>{statusLabel[front.status]}</span>
          </motion.p>
          <motion.h3
            data-reveal
            className="display t-h3 mt-3"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: EASE }}
          >
            <button type="button" onClick={() => setActive(front)} aria-haspopup="dialog" className="text-left [text-transform:inherit] hover:text-gold-light">
              {projectTitle(front)}
              <span className="sr-only"> — ver estudo de caso</span>
            </button>
          </motion.h3>
          <motion.p
            data-reveal
            className="mt-3 max-w-xl text-sm leading-relaxed text-mute md:text-base"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16, ease: EASE }}
          >
            {front.headline ?? "Material em preparação. Este estudo de caso será publicado após validação das informações com o cliente."}
          </motion.p>
          {front.tags && (
            <motion.ul
              data-reveal
              className="mt-5 flex flex-wrap gap-2"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.24, ease: EASE }}
            >
              {front.tags.map((t) => (
                <li key={t} className="label-tech rounded-full border border-gold/40 px-3 py-1.5 text-[0.68rem] text-gold-light">
                  {t}
                </li>
              ))}
            </motion.ul>
          )}
        </div>
        {/* setas só no computador */}
        <div className="mt-6 hidden gap-2 md:flex">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Projeto anterior"
            className="inline-flex size-12 items-center justify-center rounded-full border border-line-strong text-paper transition-colors hover:border-gold"
          >
            <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Próximo projeto"
            className="inline-flex size-12 items-center justify-center rounded-full border border-line-strong text-paper transition-colors hover:border-gold"
          >
            <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {active && <CaseStudy project={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </section>
  );
}

/** Vídeo real que toca sozinho (mudo) só enquanto está na tela. */
function LoopVideo({ video, className = "", controls = false }: { video: ProjectVideo; className?: string; controls?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current!;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.3 });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <video
      ref={ref}
      className={className}
      src={video.src}
      poster={video.poster}
      width={video.width}
      height={video.height}
      muted
      loop
      playsInline
      preload="metadata"
      controls={controls}
      aria-label={video.alt}
    />
  );
}

function CardFace({ project: p }: { project: Project }) {
  const cover = p.disclosure.imagesAuthorized ? p.images[0] : undefined;
  const video = p.disclosure.imagesAuthorized ? p.video : undefined;
  return (
    <div className="c3-face tone-dark relative aspect-[4/5] w-full overflow-hidden rounded-lg border border-line-strong">
      {video ? (
        <>
          <LoopVideo video={video} className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
          <span aria-hidden className="fp-scan pointer-events-none absolute inset-x-0 h-1/4" />
          <span aria-hidden className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-gold/40" />
        </>
      ) : cover ? (
        <Image
          src={cover.src}
          alt={cover.alt}
          fill
          sizes="(min-width: 768px) 30vw, 62vw"
          className={`pointer-events-none object-cover ${cover.pan ? "c3-pan" : ""}`}
          style={{ objectPosition: cover.focus ?? "50% 50%" }}
          draggable={false}
        />
      ) : (
        <div className="placeholder-surface flex h-full w-full flex-col justify-between p-5 md:p-6">
          <span className="label-tech text-paper/50">Imagens reais pendentes</span>
          <span className="display text-[clamp(2.4rem,8vw,4.5rem)] leading-[0.9] text-paper/[0.1]">{p.sector}</span>
        </div>
      )}
      <span aria-hidden className="c3-shine pointer-events-none absolute inset-0" />
    </div>
  );
}

const fields: { key: keyof Project; label: string }[] = [
  { key: "initialSituation", label: "Situação inicial" },
  { key: "challenge", label: "Desafio identificado" },
  { key: "solution", label: "Solução executada" },
  { key: "backstagRole", label: "Responsabilidade da Backstag" },
  { key: "provenResult", label: "Resultado comprovado" },
];

function CaseStudy({ project: p, onClose }: { project: Project; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panelRef.current) {
        const items = panelRef.current.querySelectorAll<HTMLElement>("a[href],button");
        const a = items[0];
        const b = items[items.length - 1];
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault();
          b.focus();
        } else if (!e.shiftKey && document.activeElement === b) {
          e.preventDefault();
          a.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, [onClose]);

  const images = p.disclosure.imagesAuthorized ? p.images : [];
  const video = p.disclosure.imagesAuthorized ? p.video : undefined;
  const showLink = p.link && p.disclosure.linkAuthorized;
  const titleId = `caso-${p.id}`;

  return (
    <motion.div
      className="tone-dark fixed inset-0 z-[80] flex justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <button
        type="button"
        aria-label="Fechar estudo de caso"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink/70 backdrop-blur-sm"
      />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative h-full w-full overflow-y-auto border-l border-line bg-ink-2 md:w-[min(46rem,92vw)]"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-ink-2/90 px-5 py-3 backdrop-blur md:px-10">
          <p className="cue">{statusLabel[p.status]}</p>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="-mr-2 inline-flex size-12 items-center justify-center text-paper hover:text-gold-light"
          >
            <X className="size-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="px-5 pb-16 pt-10 md:px-10">
          <p className="text-xs uppercase tracking-[0.16em] text-mute">{p.sector}</p>
          <h3 id={titleId} className="display t-h2 mt-3">
            {projectTitle(p)}
          </h3>
          {p.headline && <p className="mt-5 text-lg leading-relaxed text-paper/80">{p.headline}</p>}
          {p.tags && (
            <ul className="mt-6 flex flex-wrap gap-2">
              {p.tags.map((t) => (
                <li key={t} className="label-tech rounded-full border border-gold/40 px-3.5 py-2 text-gold-light">
                  {t}
                </li>
              ))}
            </ul>
          )}

          {video && (
            <figure className="mt-10">
              <LoopVideo video={video} controls className="mx-auto block max-h-[70svh] w-auto max-w-full rounded-lg" />
              {video.note && <figcaption className="mt-3 text-center text-xs text-mute">{video.note}</figcaption>}
            </figure>
          )}

          {images.length > 0 && (
            <div className="mt-10 grid gap-4">
              {images.map((img) => (
                <Image
                  key={img.src}
                  src={img.src}
                  alt={img.alt}
                  width={img.width}
                  height={img.height}
                  sizes="(min-width: 768px) 46rem, 100vw"
                  className="h-auto w-full"
                />
              ))}
            </div>
          )}

          <dl className="mt-12 border-b border-line">
            {fields.map(({ key, label }) => {
              const value = p[key] as string | null;
              // Resultado só aparece quando existe. Demais campos mostram a pendência.
              if (!value && key === "provenResult") return null;
              return (
                <div key={key} className="grid gap-2 border-t border-line py-6 md:grid-cols-[12rem_1fr] md:gap-8">
                  <dt className="cue pt-1">{label}</dt>
                  <dd className={value ? "leading-relaxed text-paper/85" : "text-sm italic text-mute"}>
                    {value ?? "Informação em documentação."}
                  </dd>
                </div>
              );
            })}
          </dl>

          {showLink && (
            <a
              href={p.link!}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-flex min-h-12 items-center gap-3 rounded-full border border-line-strong px-6 text-sm hover:border-gold hover:text-gold-light"
            >
              Visitar projeto <ArrowUpRight className="size-4" strokeWidth={1.75} aria-hidden />
              <span className="sr-only"> (abre em nova aba)</span>
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
