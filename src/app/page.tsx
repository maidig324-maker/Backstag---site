import type { CSSProperties, ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { SiteThread } from "@/components/layout/SiteThread";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { HeroBrain } from "@/components/hero/HeroBrain";
import { Problem } from "@/components/sections/Problem";
import { Projects } from "@/components/sections/Projects";
import { Methodology } from "@/components/sections/Methodology";
import { Proofs } from "@/components/sections/Proofs";
import { Founder } from "@/components/sections/Founder";
import { Contact } from "@/components/sections/Contact";
import { publishableProofs } from "@/lib/visibility";

/**
 * BACKSTAG 2026 — Behind Business Evolution
 * Topo (o cérebro por trás do negócio) · Projetos · Desafios (empresa em construção) ·
 * Metodologia · Provas · Fundador · Conversão
 */
const WHITE = "255 255 255";
const SNOW = "247 247 245";
const BUTTER = "255 241 184";
const SUN = "244 196 0";
const RGB = { white: WHITE, snow: SNOW, butter: BUTTER, sun: SUN } as const;

/** Faixa de fundo de uma seção: cor cheia, entrada suave vinda da seção anterior. */
function Band({ tone, prev, className = "", children }: { tone: keyof typeof RGB; prev?: string; className?: string; children: ReactNode }) {
  return (
    <div
      className={`band tone-day tone-${tone} ${className}`}
      data-surface="light"
      data-rgb={RGB[tone]}
      style={prev ? ({ ["--prev" as string]: prev } as CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Header />
      <SiteThread />
      {/*
        Sistema de fundos BACKSTAG 2026: o topo tem o fundo conceitual (amarelo
        suave + rede); as demais seções têm cor cheia e limpa (branco, branco
        suave, amarelo suave), com uma passagem curta da cor anterior. A única
        seção escura é o Desafio, um bloco preto de contraste.
      */}
      <div className="tone-day tone-white bg-ink">
        <main id="conteudo" className="relative">
          {/* abertura com a logo + rede viva de inteligência empresarial */}
          <HeroBrain />
          <Band tone="white" prev={BUTTER}>
            <Projects />
          </Band>
          {/* bloco preto de contraste, com margem branca em volta */}
          <Band tone="white" className="px-2 pb-2 md:px-4 md:pb-4">
            <Problem />
          </Band>
          <Band tone="snow" prev={WHITE}>
            <Methodology />
          </Band>
          {/* Provas sociais só entram com material real e verificado */}
          {publishableProofs.length > 0 && (
            <Band tone="white" prev={SNOW}>
              <Proofs />
            </Band>
          )}
          <Band tone="white" prev={publishableProofs.length > 0 ? WHITE : SNOW}>
            <Founder />
          </Band>
          <Band tone="sun" prev={WHITE}>
            <Contact />
          </Band>
        </main>
        <Band tone="snow" prev={SUN}>
          <Footer />
        </Band>
      </div>
      <FloatingWhatsApp />
    </>
  );
}
