"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { EASE } from "@/components/ui/motion";

type Photo = { src: string; alt: string; width: number; height: number };

/**
 * Fundador em cena: foto recortada (fundo transparente) sobre o cenário,
 * com halo dourado, teclado holográfico sob as mãos e uma tela projetada
 * exibindo o próprio site — "o site faz parte de quem o constrói".
 * Elementos em profundidades diferentes reagem à rolagem.
 */
export function FounderVisual({ photo }: { photo: Photo }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const photoY = useTransform(scrollYProgress, [0, 1], ["4%", "-4%"]);
  const screenY = useTransform(scrollYProgress, [0, 1], ["16%", "-14%"]);
  const haloY = useTransform(scrollYProgress, [0, 1], ["-6%", "8%"]);

  const view = { once: true, margin: "0px 0px -15% 0px" } as const;
  const [on, setOn] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setOn(true), io.disconnect()), { rootMargin: "0px 0px -15% 0px" });
    io.observe(ref.current!);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`fv relative mx-auto aspect-[4/5] w-full max-w-[34rem] ${on ? "fv-on" : ""}`} aria-label={photo.alt} role="img">
      {/* halo e anéis atrás */}
      <motion.div style={{ y: haloY }} aria-hidden className="pointer-events-none absolute inset-0">
        <span className="fv-halo absolute left-[52%] top-[36%] aspect-square w-[92%] -translate-x-1/2 -translate-y-1/2 rounded-full" />
        <span className="fv-ring absolute left-[52%] top-[36%] aspect-square w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full" />
        <span className="fv-ring fv-ring-2 absolute left-[52%] top-[36%] aspect-square w-[100%] -translate-x-1/2 -translate-y-1/2 rounded-full" />
      </motion.div>

      {/* o site se formando atrás: linhas que saem da tela e desenham o layout */}
      <SiteForming />

      {/* teclado holográfico sob as mãos (atrás da foto) */}
      <motion.div
        aria-hidden
        className="fv-deck pointer-events-none absolute -left-[6%] -right-[6%] bottom-[-3%] h-[30%]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={view}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <div className="fv-deck-plane absolute inset-0">
          <span className="fv-keys absolute inset-[8%_6%_4%_6%] rounded-md" />
        </div>
      </motion.div>

      {/* foto revelada por uma varredura de luz */}
      <motion.div style={{ y: photoY }} className="absolute inset-0 z-10">
        <motion.div
          data-reveal
          className="relative h-full w-full"
          initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
          whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
          viewport={view}
          transition={{ duration: 1.4, ease: EASE }}
        >
          <Image
            src={photo.src}
            alt=""
            fill
            sizes="(min-width: 768px) 34rem, 100vw"
            className="fv-photo object-contain object-bottom"
          />
          {/* luz do teclado refletindo nas mãos */}
          <span aria-hidden className="fv-handlight pointer-events-none absolute inset-x-0 bottom-0 h-[34%]" />
        </motion.div>
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 h-px bg-gold-light shadow-[0_0_24px_4px_rgb(240_199_102/0.6)]"
          initial={{ top: "100%", opacity: 1 }}
          whileInView={{ top: "0%", opacity: 0 }}
          viewport={view}
          transition={{ duration: 1.4, ease: EASE }}
        />
      </motion.div>

      {/* feixe do teclado até a tela */}
      <motion.span
        aria-hidden
        className="fv-beam pointer-events-none absolute z-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={view}
        transition={{ duration: 0.8, delay: 1.1 }}
      />

      {/* tela projetada: o próprio site */}
      <motion.div style={{ y: screenY }} aria-hidden className="absolute -left-[6%] top-[47%] z-30 w-[44%] [perspective:900px]">
        <motion.div
          data-reveal
          className="fv-screen relative aspect-[16/11] w-full overflow-hidden rounded-md"
          initial={{ opacity: 0, rotateY: 50, scale: 0.7 }}
          whileInView={{ opacity: 1, rotateY: 26, scale: 1 }}
          viewport={view}
          transition={{ duration: 1.1, delay: 0.9, ease: EASE }}
        >
          <div className="flex items-center justify-between border-b border-gold/30 px-[6%] py-[4%]">
            <span className="text-[clamp(0.35rem,1.4vw,0.55rem)] font-bold tracking-[0.2em] text-gold-light">BACKSTAG</span>
            <span className="flex gap-[3px]">
              <i className="block size-[3px] rounded-full bg-gold/70" />
              <i className="block size-[3px] rounded-full bg-gold/40" />
            </span>
          </div>
          <div className="px-[6%] pt-[6%]">
            <p className="display text-[clamp(0.7rem,3vw,1.15rem)] leading-[0.95] text-paper">
              Sua empresa
              <br />
              pode ir <span className="text-gold-light">além.</span>
            </p>
            <span className="mt-[6%] block h-[0.5rem] w-[38%] rounded-full bg-gold/80 md:h-[0.6rem]" />
            <div className="mt-[8%] grid grid-cols-3 gap-[5%]">
              {[0, 1, 2].map((i) => (
                <span key={i} className="block aspect-[4/3] rounded-[3px] border border-gold/35 bg-gold/[0.06]" />
              ))}
            </div>
          </div>
          <span className="fv-scan pointer-events-none absolute inset-x-0 h-1/3" />
        </motion.div>
      </motion.div>
    </div>
  );
}

/**
 * Esqueleto de um site sendo desenhado no fundo da cena. As linhas partem
 * da tela holográfica (à esquerda) e montam moldura, menu, título, botão e
 * cards. Depois, um fluxo de luz percorre as conexões continuamente.
 */
function SiteForming() {
  // [path, atraso(s)] — viewBox 400×500, mesmo formato do palco (4:5)
  const frame: [string, number][] = [
    ["M150 40 H372 Q384 40 384 52 V300 Q384 312 372 312 H150 Q138 312 138 300 V52 Q138 40 150 40 Z", 0.9], // moldura
    ["M138 66 H384", 1.3], // barra do navegador
    ["M154 53 h6 M166 53 h6 M178 53 h6", 1.35],
    ["M226 50 H330 Q334 50 334 54 V58 Q334 62 330 62 H226 Q222 62 222 58 V54 Q222 50 226 50 Z", 1.45], // endereço
    ["M156 92 H300", 1.6], // título
    ["M156 108 H268", 1.7],
    ["M156 130 H214 Q220 130 220 136 V138 Q220 144 214 144 H156 Q150 144 150 138 V136 Q150 130 156 130 Z", 1.85], // botão
    ["M156 176 H232 V256 H156 Z", 2.0], // cards
    ["M244 176 H310 V256 H244 Z", 2.1],
    ["M322 176 H370 V256 H322 Z", 2.2],
    ["M156 274 H300 M156 288 H250", 2.35], // rodapé
  ];
  // conexões da tela holográfica até o site
  const links: [string, number][] = [
    ["M96 262 C 120 200, 128 130, 138 92", 0.3],
    ["M120 290 C 150 280, 150 210, 156 176", 0.45],
    ["M50 250 C 60 140, 110 60, 150 40", 0.6],
  ];
  const nodes = [
    [138, 92], [156, 176], [150, 40], [384, 52], [384, 300], [244, 176], [322, 176],
  ];
  return (
    <svg aria-hidden viewBox="0 0 400 500" className="fv-site pointer-events-none absolute inset-0 h-full w-full" fill="none">
      {links.map(([d, t], i) => (
        <g key={`l${i}`}>
          <path d={d} pathLength={1} className="fv-draw fv-link" style={{ animationDelay: `${t}s` }} />
          <path d={d} className="fv-flow" style={{ animationDelay: `${2.6 + i * 0.4}s` }} />
        </g>
      ))}
      {frame.map(([d, t], i) => (
        <path key={`f${i}`} d={d} pathLength={1} className="fv-draw" style={{ animationDelay: `${t}s` }} />
      ))}
      {nodes.map(([x, y], i) => (
        <circle key={`n${i}`} cx={x} cy={y} r="2.2" className="fv-node" style={{ animationDelay: `${1 + i * 0.18}s` }} />
      ))}
    </svg>
  );
}
