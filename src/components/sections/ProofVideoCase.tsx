"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import type { VideoCase } from "@/content/proofs";
import { EASE, LineReveal, Reveal } from "@/components/ui/motion";

/**
 * Item de prova social em vídeo: gravação real num quadro 3D com brilho
 * dourado, entrada com varredura e inclinação ligada à rolagem.
 * O vídeo só toca quando está na tela (economia de bateria no celular).
 */
export function ProofVideoCase({ item, flip = false }: { item: VideoCase; flip?: boolean }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false);

  const { scrollYProgress } = useScroll({ target: rowRef, offset: ["start end", "end start"] });
  const tilt = useTransform(scrollYProgress, [0, 0.5, 1], flip ? [-16, -6, 4] : [16, 6, -4]);
  const lift = useTransform(scrollYProgress, [0, 1], ["8%", "-8%"]);

  useEffect(() => {
    const r = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(r);
    const v = videoRef.current!;
    const io = new IntersectionObserver(
      ([e]) => {
        if (r) return;
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={rowRef} className="grid items-center gap-14 md:grid-cols-12 md:gap-10">
      <div className={`md:col-span-5 ${flip ? "md:order-2 md:col-start-8" : ""}`}>
        <LineReveal
          as="h3"
          lines={[...item.title]}
          lineClassName={(i) => (i === item.title.length - 1 ? "accent" : "")}
          className="display text-[clamp(2rem,3.6vw,3.5rem)]"
        />
        <Reveal delay={0.15}>
          <p className="mt-6 max-w-md text-base leading-relaxed text-paper/80 md:text-lg">{item.text}</p>
        </Reveal>
        {item.tags && (
          <Reveal delay={0.25}>
            <ul className="mt-8 flex flex-wrap gap-2">
              {item.tags.map((c) => (
                <li key={c} className="label-tech rounded-full border border-gold/40 px-3.5 py-2 text-gold-light">
                  {c}
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </div>

      <div className={`relative [perspective:1400px] md:col-span-6 ${flip ? "md:order-1 md:col-start-1" : "md:col-start-7"}`}>
        {/* halo atrás do quadro */}
        <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[110%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(215_168_62/0.2),transparent_62%)]" />
        <motion.div style={{ rotateY: tilt, y: lift }} className="relative mx-auto w-[78%] max-w-[26rem] [transform-style:preserve-3d] md:w-[72%]">
          <motion.div
            data-reveal
            className="fp-frame relative overflow-hidden rounded-2xl"
            initial={{ clipPath: "inset(100% 0% 0% 0% round 16px)" }}
            whileInView={{ clipPath: "inset(0% 0% 0% 0% round 16px)" }}
            viewport={{ once: true, margin: "0px 0px -15% 0px" }}
            transition={{ duration: 1.3, ease: EASE }}
          >
            <video
              ref={videoRef}
              className="block w-full object-cover"
              style={{ aspectRatio: `${item.width} / ${item.height}` }}
              src={item.src}
              poster={item.poster}
              width={item.width}
              height={item.height}
              muted
              loop
              playsInline
              preload="metadata"
              controls={reduced}
              aria-label={item.alt}
            />
            <span aria-hidden className="fp-scan pointer-events-none absolute inset-x-0 h-1/4" />
            <span aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-gold/40" />
          </motion.div>
          {/* reflexo no chão */}
          <span aria-hidden className="pointer-events-none absolute -bottom-6 left-[8%] right-[8%] h-10 rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgb(215_168_62/0.3),transparent_70%)] blur-md" />
        </motion.div>
        <p className="mt-10 text-center text-xs text-mute">{item.caption}</p>
      </div>
    </div>
  );
}
