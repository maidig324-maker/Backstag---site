"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, X } from "lucide-react";
import { projectsIntro, type Project, type ProjectStatus } from "@/content/projects";
import { projectTitle, visibleProjects, sectionNumber } from "@/lib/visibility";
import { EASE, ImageReveal, Reveal } from "@/components/ui/motion";
import { SectionIntro, splitLines } from "@/components/ui/SectionIntro";

const statusLabel: Record<ProjectStatus, string> = {
  publicado: "Publicado",
  "em-andamento": "Em andamento",
  "em-documentacao": "Estudo de caso em documentação",
};

/** Posições do layout assimétrico, aplicadas em sequência. */
const layout = [
  "md:col-span-7",
  "md:col-span-5 md:mt-40",
  "md:col-span-5 md:col-start-2",
  "md:col-span-6 md:mt-28",
];

const aspect = ["aspect-[4/5] md:aspect-[5/4]", "aspect-[4/5]", "aspect-[4/5]", "aspect-[4/3]"];

export function Projects() {
  const [active, setActive] = useState<Project | null>(null);
  if (visibleProjects.length === 0) return null;

  return (
    <section id="projetos" aria-label={projectsIntro.label} className="relative py-28 md:py-44">
      <div className="container-x">
        <div className="grid gap-10 md:grid-cols-12">
          <SectionIntro
            className="md:col-span-7"
            index={sectionNumber("projetos")}
            label={projectsIntro.label}
            titleLines={splitLines(projectsIntro.title, 24)}
          />
          <Reveal className="md:col-span-4 md:col-start-9 md:self-end" delay={0.2}>
            <p className="leading-relaxed text-mute">{projectsIntro.text}</p>
          </Reveal>
        </div>

        <ul className="mt-20 grid gap-x-10 gap-y-20 md:mt-28 md:grid-cols-12 md:gap-y-28">
          {visibleProjects.map((p, i) => (
            <li key={p.id} className={layout[i % layout.length]}>
              <ProjectCard project={p} index={i} onOpen={() => setActive(p)} />
            </li>
          ))}
        </ul>
      </div>

      <AnimatePresence>
        {active && <CaseStudy project={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </section>
  );
}

function ProjectCard({
  project: p,
  index,
  onOpen,
}: {
  project: Project;
  index: number;
  onOpen: () => void;
}) {
  const cover = p.disclosure.imagesAuthorized ? p.images[0] : undefined;
  const isPlaceholder = p.status === "em-documentacao";

  return (
    // Clique em qualquer ponto do card (mouse); teclado usa o botão do título.
    <article className="group relative cursor-pointer" onClick={onOpen}>
      <ImageReveal className={`relative w-full overflow-hidden ${aspect[index % aspect.length]}`}>
        {cover ? (
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            sizes="(min-width: 768px) 55vw, 100vw"
            className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-stage)] group-hover:scale-[1.03]"
          />
        ) : (
          <div className="placeholder-surface flex h-full w-full flex-col justify-between p-5 md:p-7">
            <span className="cue text-paper/50">Placeholder · imagens reais pendentes</span>
            <span className="display text-[clamp(4rem,10vw,9rem)] leading-none text-paper/[0.07]">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
        )}
        <span aria-hidden className="absolute right-4 top-4 inline-flex size-11 items-center justify-center rounded-full bg-ink/70 text-paper backdrop-blur transition-colors duration-500 group-hover:bg-gold group-hover:text-ink">
          <ArrowUpRight className="size-4" strokeWidth={1.75} aria-hidden />
        </span>
      </ImageReveal>

      <Reveal className="mt-6 flex flex-col gap-3" y={16}>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-[0.16em] text-mute">
          <span>{p.sector}</span>
          <span aria-hidden className="h-px w-4 bg-line-strong" />
          <span className={isPlaceholder ? "text-gold" : ""}>{statusLabel[p.status]}</span>
        </p>
        <h3 className="display text-[clamp(1.9rem,3.4vw,2.9rem)] transition-colors duration-500 group-hover:text-gold-light">
          {/* Botão "esticado": o card inteiro é clicável, com HTML válido */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            aria-haspopup="dialog"
            className="text-left after:absolute after:inset-0 after:content-['']"
          >
            {projectTitle(p)}
            <span className="sr-only"> — ver estudo de caso</span>
          </button>
        </h3>
        <p className="max-w-md leading-relaxed text-mute">
          {p.headline ?? "Material em preparação. Este estudo de caso será publicado após validação das informações com o cliente."}
        </p>
        <span aria-hidden className="mt-1 text-sm text-paper underline decoration-gold/50 underline-offset-[6px] transition-colors group-hover:decoration-gold">
          Ver estudo de caso
        </span>
      </Reveal>
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
