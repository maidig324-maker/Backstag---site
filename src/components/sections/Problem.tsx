import { problem } from "@/content/site";
import { Reveal } from "@/components/ui/motion";
import { SectionIntro, splitLines } from "@/components/ui/SectionIntro";
import { sectionNumber } from "@/lib/visibility";

export function Problem() {
  return (
    <section id="problema" aria-label={problem.label} className="relative py-28 md:py-44">
      <div className="container-x grid gap-16 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-5">
          <div className="md:sticky md:top-32">
            <SectionIntro
              index={sectionNumber("problema")}
              label={problem.label}
              titleLines={splitLines(problem.title, 20)}
              size="md"
              text={problem.intro}
            />
          </div>
        </div>

        <ol className="md:col-span-6 md:col-start-7 md:pt-24">
          {problem.items.map((item, i) => (
            <li key={item.title}>
              <Reveal className="grid grid-cols-[3rem_1fr] gap-x-4 border-t border-line py-8 md:grid-cols-[4.5rem_1fr] md:py-10">
                <span className="cue pt-2">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="display text-[1.75rem] md:text-[2.15rem]">{item.title}</h3>
                  <p className="mt-3 max-w-md leading-relaxed text-mute">{item.text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>

      {/* Ponte: a Backstag entra em cena */}
      <div className="container-x mt-24 md:mt-40">
        <Reveal className="grid gap-8 border-t border-gold/40 pt-10 md:grid-cols-12 md:pt-14">
          <p className="cue md:col-span-3">A Backstag</p>
          <p className="display text-[clamp(1.75rem,3.4vw,3rem)] leading-[1.1] md:col-span-9">
            {problem.bridge}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
