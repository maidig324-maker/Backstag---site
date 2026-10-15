import Image from "next/image";
import { site } from "@/content/site";

const sizes = {
  sm: "h-9 md:h-11", // menu
  lg: "h-16 md:h-20", // rodapé
} as const;

/** Variante de aplicação para fundos claros: a mesma construção, em preto. */
const LOGO_ON_LIGHT = "/brand/backstag-logo-preta.png";

/**
 * Logo oficial da Backstag. Sobre fundo escuro: o arquivo original.
 * Sobre fundo claro (algum ancestral com data-surface="light"): a
 * variante preta, sem redesenho. Sem arquivo, mostra o nome em texto.
 */
export function Logo({ size = "sm", priority = false }: { size?: keyof typeof sizes; priority?: boolean }) {
  if (site.logo.src) {
    const common = { alt: site.logo.alt, width: site.logo.width, height: site.logo.height, priority, sizes: "(min-width: 768px) 300px, 200px" };
    return (
      <>
        <Image src={site.logo.src} {...common} className={`logo-on-dark w-auto ${sizes[size]}`} />
        <Image src={LOGO_ON_LIGHT} {...common} alt="" aria-hidden className={`logo-on-light w-auto ${sizes[size]}`} />
      </>
    );
  }
  return <span className="font-sans text-[1.05rem] font-bold tracking-[0.3em] text-paper">{site.name}</span>;
}
