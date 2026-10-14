import { LineReveal, Reveal } from "./motion";

type Props = {
  label?: string;
  /** Título já quebrado em linhas para a animação. */
  titleLines: string[];
  text?: string;
  className?: string;
  /** "md" para colunas estreitas (títulos laterais fixos). */
  size?: "lg" | "md";
};

export function SectionIntro({ titleLines, text, className = "", size = "lg" }: Props) {
  return (
    <div className={className}>
      <LineReveal
        as="h2"
        lines={titleLines}
        className={`display ${size === "lg" ? "text-[clamp(2.6rem,6vw,5.5rem)]" : "text-[clamp(2.4rem,4.2vw,4rem)]"}`}
      />
      {text && (
        <Reveal delay={0.15}>
          <p className="mt-7 max-w-xl text-base leading-relaxed text-mute md:text-lg">{text}</p>
        </Reveal>
      )}
    </div>
  );
}

/** Quebra um título em linhas de ~N caracteres, respeitando palavras. */
export function splitLines(text: string, max = 28): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = (cur + " " + w).trim();
    }
  }
  if (cur) lines.push(cur);
  return lines;
}
