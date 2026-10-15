import Image from "next/image";
import { site } from "@/content/site";

const LOGO = site.logo.src ?? "/brand/backstag-logo.png";

/**
 * ABERTURA CINEMATOGRÁFICA
 * Ambiente abstrato escuro, com profundidade: luz que atravessa devagar,
 * sombras discretas e uma trama arquitetônica quase invisível no piso.
 * Sem fotos de pessoas e sem imagens dos clientes.
 * A logo original fica em destaque e, com a rolagem (--lp / --lf),
 * se aproxima do observador e desaparece sem corte.
 */
export function OpeningBackdrop() {
  return (
    <>
      <div aria-hidden className="hx-scene absolute inset-0">
        <span className="hx-depth absolute inset-0" />
        <span className="hx-floor absolute inset-x-0 bottom-0" />
        <span className="hx-beam hx-beam-a" />
        <span className="hx-beam hx-beam-b" />
        <span className="hx-shade hx-shade-a" />
        <span className="hx-shade hx-shade-b" />
        <span className="hx-veil absolute inset-0" />
      </div>

      <div className="hx-logo pointer-events-none absolute left-1/2 top-[46%] z-[3] w-[min(76vw,34rem)]">
        <Image
          src={LOGO}
          alt={site.fullName}
          width={2033}
          height={570}
          priority
          sizes="(min-width: 640px) 34rem, 76vw"
          className="h-auto w-full"
        />
        <Image src={LOGO} alt="" aria-hidden width={2033} height={570} sizes="(min-width: 640px) 34rem, 76vw" className="hx-reflex h-auto w-full" />
      </div>
    </>
  );
}
