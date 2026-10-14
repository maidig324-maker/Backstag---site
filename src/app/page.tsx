import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { HeroStrata } from "@/components/hero-lab/HeroStrata";
import { Problem } from "@/components/sections/Problem";
import { Projects } from "@/components/sections/Projects";
import { Methodology } from "@/components/sections/Methodology";
import { Proofs } from "@/components/sections/Proofs";
import { Founder } from "@/components/sections/Founder";
import { Contact } from "@/components/sections/Contact";
import { publishableProofs } from "@/lib/visibility";

/**
 * BACKSTAG 2026 — Behind Business Evolution
 * Impacto · Descoberta (pilares e transformação) · Projetos ·
 * Metodologia · Conexão humana · Conversão
 */
export default function Home() {
  return (
    <>
      <Header />
      <main id="conteudo" className="relative">
        <HeroStrata />
        <Problem />
        {/* zona clara: projetos e método (fundo nasce em degradê, sem divisão) */}
        <div className="zone tone-light">
          <Projects />
          <Methodology />
        </div>
        {/* Provas sociais só entram com material real e verificado */}
        {publishableProofs.length > 0 && <Proofs />}
        <Founder />
        {/* zona clara: conversão */}
        <div className="zone tone-light">
          <Contact />
        </div>
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
