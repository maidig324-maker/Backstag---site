import { LineReveal, Reveal } from "./motion";

type Props = {
  label?: string;
  /** Título já quebrado em linhas para a animação. */
  titleLines: string[];
  text?: string;
  className?: string;
  /** "md" para colunas estreitas (títulos laterais fixos). */
  size?: "lg" | "md";
  /** "center" (padrão) ou "left"; "center-mobile" centraliza só no celular. */
  align?: "center" | "left" | "center-mobile";
};

const alignClass = {
  center: "mx-auto text-center [&_p]:mx-auto",
  left: "",
  "center-mobile": "mx-auto text-center [&_p]:mx-auto md:mx-0 md:text-left md:[&_p]:mx-0",
};

export function SectionIntro({ label, titleLines, text, className = "", align = "center" }: Props) {
  return (
    <div className={`${alignClass[align]} ${className}`}>
      {/* nome da seção: pílula preta com amarelo (no bloco escuro, o inverso) */}
      {label && (
        <Reveal className="mb-5 md:mb-6" y={10}>
          <span className="sec-chip">
            <i aria-hidden />
            {label}
          </span>
        </Reveal>
      )}
      <LineReveal
        as="h2"
        lines={titleLines}
        className={`display t-h2 max-w-4xl ${align === "center" ? "mx-auto" : align === "center-mobile" ? "mx-auto md:mx-0" : ""}`}
      />
      {text && (
        <Reveal delay={0.15}>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-mute md:text-lg">{text}</p>
        </Reveal>
      )}
    </div>
  );
}

/** Uma linha por frase; dentro dela o texto quebra naturalmente (fica alinhado em qualquer tela). */
export function splitSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).filter(Boolean);
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
