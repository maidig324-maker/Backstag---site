import Image from "next/image";
import { founder } from "@/content/founder";
import { site } from "@/content/site";
import { ImageReveal, LineReveal, Reveal } from "@/components/ui/motion";
import { sectionNumber } from "@/lib/visibility";

export function Founder() {
  const showPhotoSlot = founder.photo || site.showPlaceholders;

  return (
    <section id="sobre" aria-label={founder.label} className="relative py-28 md:py-44">
      <div className="container-x grid gap-14 md:grid-cols-12 md:gap-10">
        {showPhotoSlot && (
          <div className="md:col-span-5">
            <ImageReveal className="relative aspect-[4/5] w-full overflow-hidden">
              {founder.photo ? (
                <Image
                  src={founder.photo.src}
                  alt={founder.photo.alt}
                  fill
                  sizes="(min-width: 768px) 40vw, 100vw"
                  className="object-cover grayscale-[15%]"
                />
              ) : (
                <div className="placeholder-surface flex h-full w-full flex-col justify-end p-6">
                  <p className="cue text-paper/50">Placeholder</p>
                  <p className="mt-2 text-sm text-mute">
                    Fotografia real de {founder.name} — a ser enviada pelo cliente.
                  </p>
                </div>
              )}
            </ImageReveal>
          </div>
        )}

        <div className={showPhotoSlot ? "md:col-span-6 md:col-start-7 md:self-center" : "md:col-span-8"}>
          <Reveal>
            <p className="cue flex items-center gap-3">
              <span>{sectionNumber("sobre")}</span>
              <span aria-hidden className="h-px w-8 bg-gold/60" />
              <span>{founder.label}</span>
            </p>
          </Reveal>
          <LineReveal
            as="h2"
            lines={[founder.name]}
            className="display mt-6 text-[clamp(2.75rem,6vw,5.25rem)]"
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

          <Reveal delay={0.2}>
            <ul className="mt-12 grid border-t border-line sm:grid-cols-3">
              {founder.principles.map((p) => (
                <li key={p} className="border-b border-line py-4 text-sm text-paper/85 sm:border-b-0 sm:py-5 sm:pr-4">
                  <span aria-hidden className="mr-2 text-gold">—</span>
                  {p}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
