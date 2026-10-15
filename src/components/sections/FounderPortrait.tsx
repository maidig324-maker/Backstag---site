import Image from "next/image";
import { NetCorner } from "@/components/ui/NetCorner";
import { Reveal } from "@/components/ui/motion";

type Photo = { src: string; alt: string; width: number; height: number };

/**
 * Fundador em composição editorial: a foto real recortada, levemente
 * inclinada, apoiada sobre um bloco preto (a mesa), com um cartão amarelo
 * atrás e um fragmento da rede do topo. O nome e a função ficam na frente
 * do bloco, em amarelo e branco.
 */
export function FounderPortrait({ photo, name, role }: { photo: Photo; name: string; role: string }) {
  return (
    <div className="fp relative mx-auto aspect-[5/6] w-full max-w-[22rem] md:max-w-[34rem]">
      {/* cartão amarelo atrás, inclinado no sentido oposto */}
      <span aria-hidden className="fp-card" />
      <NetCorner corner="tr" className="fp-net" />

      {/* a foto, levemente inclinada, apoiada na mesa */}
      <div className="fp-photo">
        <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 768px) 34rem, 22rem" className="object-contain object-bottom" />
      </div>

      {/* a mesa: bloco preto com a borda amarela, o nome e a função */}
      <div className="fp-desk">
        <span aria-hidden className="fp-desk-top" />
        <div className="fp-desk-front">
          <Reveal y={14}>
            <h2 className="display fp-name">{name}</h2>
            <p className="fp-role">{role}</p>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
