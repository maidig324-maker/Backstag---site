import Image from "next/image";
import { site } from "@/content/site";
import { proofsIntro, type Proof } from "@/content/proofs";
import { publishableProofs, sectionNumber } from "@/lib/visibility";
import { Reveal } from "@/components/ui/motion";
import { SectionIntro, splitLines } from "@/components/ui/SectionIntro";

/**
 * Exibe apenas provas reais e verificadas.
 * Sem material: mostra um aviso de espaço reservado (modo placeholder)
 * ou não renderiza nada (modo publicação).
 */
export function Proofs() {
  const items = publishableProofs;
  if (items.length === 0 && !site.showPlaceholders) return null;

  return (
    <section id="resultados" aria-label={proofsIntro.label} className="relative py-28 md:py-40">
      <div className="container-x">
        <SectionIntro index={sectionNumber("resultados")} label={proofsIntro.label} titleLines={splitLines(proofsIntro.title, 26)} />

        {items.length === 0 ? (
          <Reveal className="placeholder-surface mt-16 grid gap-6 border border-dashed border-line-strong p-6 md:mt-20 md:grid-cols-12 md:p-10">
            <p className="cue md:col-span-3">Placeholder</p>
            <div className="md:col-span-9">
              <p className="display text-2xl md:text-3xl">Espaço reservado para provas reais.</p>
              <p className="mt-4 max-w-2xl leading-relaxed text-mute">
                Depoimentos, vídeos de clientes, capturas de tela e indicadores serão publicados aqui somente
                com material verdadeiro e autorização. Para cadastrar, edite{" "}
                <code className="font-mono text-sm text-paper/80">src/content/proofs.ts</code>. Este aviso
                desaparece quando <code className="font-mono text-sm text-paper/80">showPlaceholders</code> é
                desativado.
              </p>
            </div>
          </Reveal>
        ) : (
          <ul className="mt-16 grid gap-px overflow-hidden border border-line bg-line md:mt-20 md:grid-cols-2">
            {items.map((item, i) => (
              <li key={item.id} className={`bg-ink ${item.kind === "screenshot" || item.kind === "video" ? "md:col-span-2" : ""}`}>
                <Reveal delay={(i % 2) * 0.08} className="h-full p-6 md:p-10">
                  <ProofItem item={item} />
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function ProofItem({ item }: { item: Proof }) {
  switch (item.kind) {
    case "testimonial":
      return (
        <figure className="flex h-full flex-col justify-between gap-10">
          <blockquote className="display text-[clamp(1.6rem,2.6vw,2.4rem)] leading-[1.15]">
            <span aria-hidden className="accent">“</span>
            {item.quote}
            <span aria-hidden className="accent">”</span>
          </blockquote>
          <figcaption className="text-sm">
            <span className="text-paper">{item.author}</span>
            {(item.role || item.company) && (
              <span className="text-mute"> — {[item.role, item.company].filter(Boolean).join(", ")}</span>
            )}
          </figcaption>
        </figure>
      );
    case "metric":
      return (
        <div className="flex h-full flex-col justify-between gap-8">
          <p className="display text-[clamp(3.5rem,8vw,6.5rem)] leading-none text-gold-light">{item.value}</p>
          <div>
            <p className="text-lg text-paper">{item.label}</p>
            <p className="mt-2 text-xs text-mute">Fonte: {item.source}</p>
          </div>
        </div>
      );
    case "comparison":
      return (
        <div>
          <p className="display text-2xl md:text-3xl">{item.title}</p>
          <dl className="mt-8 grid grid-cols-2 gap-6">
            <div>
              <dt className="cue text-mute">Antes</dt>
              <dd className="mt-2 leading-relaxed text-paper/80">{item.before}</dd>
            </div>
            <div>
              <dt className="cue">Depois</dt>
              <dd className="mt-2 leading-relaxed text-paper">{item.after}</dd>
            </div>
          </dl>
          <p className="mt-6 text-xs text-mute">Fonte: {item.source}</p>
        </div>
      );
    case "screenshot":
      return (
        <figure>
          <Image src={item.src} alt={item.alt} width={item.width} height={item.height} className="h-auto w-full" sizes="(min-width: 768px) 80vw, 100vw" />
          <figcaption className="mt-4 text-sm text-mute">{item.caption}</figcaption>
        </figure>
      );
    case "video":
      return (
        <figure>
          <video controls preload="metadata" poster={item.poster} className="w-full">
            <source src={item.src} />
          </video>
          <figcaption className="mt-4 text-sm text-mute">{item.caption}</figcaption>
        </figure>
      );
  }
}
