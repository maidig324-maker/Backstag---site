import Image from "next/image";
import { site } from "@/content/site";

/**
 * Exibe a logo oficial quando `site.logo.src` estiver configurado.
 * Enquanto isso, mostra apenas o nome da empresa em texto — sem criar
 * símbolo ou versão alternativa da marca.
 */
export function Logo({ className = "" }: { className?: string }) {
  if (site.logo.src) {
    return (
      <Image
        src={site.logo.src}
        alt={site.logo.alt}
        width={site.logo.width}
        height={site.logo.height}
        priority
        className={`h-8 w-auto md:h-9 ${className}`}
      />
    );
  }
  return (
    <span
      className={`font-sans text-[1.05rem] font-bold tracking-[0.3em] text-paper ${className}`}
      title="Logo oficial pendente — configurar em src/content/site.ts"
    >
      {site.name}
    </span>
  );
}
