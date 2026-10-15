"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { founder } from "@/content/founder";
import { Reveal } from "@/components/ui/motion";
import { NetCorner } from "@/components/ui/NetCorner";

/**
 * FUNDADOR — composição editorial integrada.
 * A foto real (PNG transparente) já traz o braço apoiado num bloco escuro.
 * A caixa de informações é a continuação desse bloco: mesma posição, mesmas
 * cores (topo mais claro + face frontal em degradê), sem borda nem segunda
 * caixa por cima. As bordas da foto que encostam na caixa se dissolvem nela.
 *
 * Coordenadas do bloco na foto (1122×1402): borda esquerda em 61,3% da
 * largura, topo em 75,75% da altura, faixa superior clara até 81,7%.
 * Celular: a caixa continua por baixo da foto, de ponta a ponta, e recebe
 * o nome — o rosto fica livre e o braço continua apoiado.
 */
export function Founder() {
  const compRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -18% 0px" },
    );
    io.observe(compRef.current!);
    return () => io.disconnect();
  }, []);

  const photo = founder.photo;

  return (
    <section id="sobre" aria-label={founder.label} className="fd2 relative overflow-clip pb-24 pt-24 md:pb-36 md:pt-32">
      <NetCorner corner="tr" className="top-10" />

      <div className="container-x relative">
        {/* título e composição */}
        <div ref={compRef} className={`fd2-comp ${inView ? "is-in" : ""}`}>
          <div className="fd2-head">
            <span className="sec-chip">
              <i aria-hidden />
              {founder.label}
            </span>
            <h2 className="display fd2-title mt-5">
              {founder.headline[0]} <span className="accent">{founder.headline[1]}</span>
            </h2>
          </div>

          <div className="fd2-stage">
            {/* detalhe amarelo atrás do retrato */}
            <span aria-hidden className="fd2-ring" />
            {/* caixa = continuação do bloco da foto */}
            <div className="fd2-box tone-night">
              <NetCorner corner="br" className="fd2-net" />
              <div className="fd2-id fd2-id-wide">
                <Identity />
              </div>
            </div>
            {/* celular: o bloco segue por baixo da foto e recebe o nome */}
            <div className="fd2-base tone-night">
              <div className="fd2-id">
                <Identity />
              </div>
            </div>
            {photo && (
              <div className="fd2-photo">
                <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1024px) 30rem, 92vw" className="object-contain" />
              </div>
            )}
          </div>
        </div>

        {/* história: revelada ao continuar a rolagem */}
        <div className="fd2-story mt-14 grid gap-10 md:mt-20 md:grid-cols-12 md:gap-x-10">
          <div className="min-w-0 md:col-span-7">
            <Reveal>
              <p className="label-tech text-mute">História</p>
            </Reveal>
            <div className="mt-4 space-y-5">
              {founder.paragraphs.map((t, i) => (
                <Reveal key={i} delay={0.06 * i}>
                  <p className={i === 0 ? "text-lg leading-relaxed text-paper md:text-xl" : "leading-relaxed text-mute md:text-lg"}>{t}</p>
                </Reveal>
              ))}
            </div>
          </div>
          <div className="min-w-0 md:col-span-5">
            <Reveal delay={0.1}>
              <blockquote className="fd-vision">
                <p className="label-tech">Nossa visão</p>
                <p className="mt-2">{founder.vision}</p>
              </blockquote>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Nome, função e as três frentes, dentro da caixa preta. */
function Identity() {
  return (
    <>
      <p className="display fd2-name">{founder.name}</p>
      <p className="fd2-role">{founder.role}</p>
      <p className="fd2-company">{founder.company}</p>
      <p className="fd2-pillars">
        {founder.pillars.map((p, i) => (
          <span key={p}>
            {i > 0 && <i aria-hidden>•</i>}
            {p}
          </span>
        ))}
      </p>
    </>
  );
}
