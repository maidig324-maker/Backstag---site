"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";
import { projectsIntro, type Project, type ProjectStatus } from "@/content/projects";
import { projectTitle, visibleProjects, sectionNumber } from "@/lib/visibility";
import { EASE, Reveal } from "@/components/ui/motion";
import { SectionIntro, splitLines } from "@/components/ui/SectionIntro";

const statusLabel: Record<ProjectStatus, string> = {
  publicado: "Publicado",
  "em-andamento": "Em andamento",
  "em-documentacao": "Estudo de caso em documentação",
};

/**
 * 04 — EXPERIÊNCIA E PROJETOS
 * Galeria imersiva em trilho horizontal com rolagem nativa (snap), pronta
 * para imagens, demonstrações e comparativos reais. O quadro em foco ganha
 * destaque; os demais recuam. Cada quadro abre o estudo de caso completo.
 */
export function Projects() {
  const [active, setActive] = useState<Project | null>(null);
  const [focus, setFocus] = useState(0);
  const trackRef = useRef<HTMLUListElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const items = Array.from(track.children) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setFocus(items.indexOf(e.target as HTMLElement));
      },
      { root: track, threshold: 0.6 },
    );
    items.forEach((el) => io.observe(el));
    const onScroll = () => {
      const max = track.scrollWidth - track.clientWidth;
      setProgress(max > 0 ? track.scrollLeft / max : 0);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      track.removeEventListener("scroll", onScroll);
    };
  }, []);

  const go = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const next = Math.min(visibleProjects.length - 1, Math.max(0, focus + dir));
    (track.children[next] as HTMLElement)?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  if (visibleProjects.length === 0) return null;

  return (
    <section id="projetos" aria-label={projectsIntro.label} className="relative overflow-hidden py-28 md:py-40">
      <div className="container-x">
        <div className="grid gap-10 md:grid-cols-12">
          <SectionIntro
            className="md:col-span-7"
            index={sectionNumber("projetos")}
            label={projectsIntro.label}
            titleLines={splitLines(projectsIntro.title, 24)}
          />
          <Reveal className="md:col-span-4 md:col-start-9 md:self-end" delay={0.15}>
            <p className="leading-relaxed text-mute">{projectsIntro.text}</p>
          </Reveal>
        </div>

        {/* Controles da galeria */}
        <div className="mt-14 flex items-center justify-between gap-6 md:mt-20">
          <p className="label-tech tabular-nums text-paper/60" aria-live="polite">
            <span className="text-gold">{String(focus + 1).padStart(2, "0")}</span> / {String(visibleProjects.length).padStart(2, "0")}
          </p>
          <div className="relative mx-2 h-px flex-1 bg-line-strong" aria-hidden>
            <span className="absolute inset-y-0 left-0 bg-gold" style={{ width: `${Math.max(8, progress * 100)}%` }} />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={focus === 0}
              aria-label="Projeto anterior"
              className="inline-flex size-12 items-center justify-center rounded-full border border-line-strong text-paper transition-colors hover:border-gold disabled:opacity-30"
            >
              <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              disabled={focus === visibleProjects.length - 1}
              aria-label="Próximo projeto"
              className="inline-flex size-12 items-center justify-center rounded-full border border-line-strong text-paper transition-colors hover:border-gold disabled:opacity-30"
            >
              <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
            </button>
          </div>
        </div>
      </div>

      {/* Trilho horizontal */}
      <ul
        ref={trackRef}
        className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [--gx:1.25rem] md:gap-8 md:[--gx:2.5rem]"
        style={{
          // alinha o primeiro quadro à grade do site em qualquer largura
          paddingInline: "max(var(--gx), calc((100vw - 88rem) / 2 + var(--gx)))",
          scrollPaddingInline: "var(--gx)",
        }}
      >
        {visibleProjects.map((p, i) => (
          <li
            key={p.id}
            className={`w-[84vw] shrink-0 snap-center transition-[opacity,transform] duration-700 ease-[var(--ease-stage)] md:w-[min(62vw,56rem)] ${
              i === focus ? "opacity-100" : "scale-[0.96] opacity-45"
            }`}
          >
            <ProjectFrame project={p} index={i} onOpen={() => setActive(p)} />
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {active && <CaseStudy project={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </section>
  );
}

function ProjectFrame({ project: p, index, onOpen }: { project: Project; index: number; onOpen: () => void }) {
  const cover = p.disclosure.imagesAuthorized ? p.images[0] : undefined;
  const isPlaceholder = p.status === "em-documentacao";

  return (
    <article className="group relative cursor-pointer" onClick={onOpen}>
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md border border-line-strong sm:aspect-[16/10]">
        {cover ? (
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            sizes="(min-width: 768px) 62vw, 84vw"
            className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-stage)] group-hover:scale-[1.03]"
          />
        ) : (
          <div className="placeholder-surface flex h-full w-full flex-col justify-between p-5 md:p-8">
            <span className="label-tech text-paper/50">Placeholder · imagens reais pendentes</span>
            <span className="display text-[clamp(5rem,14vw,12rem)] leading-none text-paper/[0.07]">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
        )}
        {/* marcações de canto */}
        <span aria-hidden className="absolute left-3 top-3 size-3 border-l border-t border-gold/60" />
        <span aria-hidden className="absolute bottom-3 right-3 size-3 border-b border-r border-gold/60" />
        <span
          aria-hidden
          className="absolute right-4 top-4 inline-flex size-11 items-center justify-center rounded-full bg-ink/70 text-paper backdrop-blur transition-colors duration-500 group-hover:bg-gold group-hover:text-ink"
        >
          <ArrowUpRight className="size-4" strokeWidth={1.75} />
        </span>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <p className="label-tech flex flex-wrap items-center gap-x-3 gap-y-1 text-paper/55">
          <span>{p.sector}</span>
          <span aria-hidden className="h-px w-4 bg-line-strong" />
          <span className={isPlaceholder ? "text-gold" : ""}>{statusLabel[p.status]}</span>
        </p>
        <h3 className="display text-[clamp(1.6rem,3vw,2.5rem)] transition-colors duration-500 group-hover:text-gold-light">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            aria-haspopup="dialog"
            className="text-left"
          >
            {projectTitle(p)}
            <span className="sr-only"> — ver estudo de caso</span>
          </button>
        </h3>
        <p className="max-w-lg text-sm leading-relaxed text-mute md:text-base">
          {p.headline ?? "Material em preparação. Este estudo de caso será publicado após validação das informações com o cliente."}
        </p>
      </div>
    </article>
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
  const showLink = p.link && p.disclosure.linkAuthorized;
  const titleId = `caso-${p.id}`;

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex justify-end"
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
          <h3 id={titleId} className="display mt-3 text-[clamp(2.4rem,6vw,4rem)]">
            {projectTitle(p)}
          </h3>
          {p.headline && <p className="mt-5 text-lg leading-relaxed text-paper/80">{p.headline}</p>}

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
