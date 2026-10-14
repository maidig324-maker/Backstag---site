import Image from "next/image";
import { site } from "@/content/site";

const sizes = {
  sm: "h-9 md:h-11", // menu
  lg: "h-16 md:h-20", // rodapé
} as const;

/**
 * Logo oficial da Backstag (arquivo original, sem alterações).
 * Sem arquivo configurado, mostra apenas o nome em texto.
 */
export function Logo({ size = "sm", priority = false }: { size?: keyof typeof sizes; priority?: boolean }) {
  if (site.logo.src) {
    return (
      <Image
        src={site.logo.src}
        alt={site.logo.alt}
        width={site.logo.width}
        height={site.logo.height}
        priority={priority}
        sizes="(min-width: 768px) 300px, 200px"
        className={`w-auto ${sizes[size]}`}
      />
    );
  }
  return <span className="font-sans text-[1.05rem] font-bold tracking-[0.3em] text-paper">{site.name}</span>;
}
