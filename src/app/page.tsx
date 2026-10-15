import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { ConstructionHero } from "@/components/hero/ConstructionHero";
import { Problem } from "@/components/sections/Problem";
import { Projects } from "@/components/sections/Projects";
import { Methodology } from "@/components/sections/Methodology";
import { Proofs } from "@/components/sections/Proofs";
import { Founder } from "@/components/sections/Founder";
import { Contact } from "@/components/sections/Contact";
import { publishableProofs } from "@/lib/visibility";

/**
 * BACKSTAG 2026 — Behind Business Evolution
 * Abertura e construção · Projetos · Desafios ·
 * Metodologia · Provas · Fundador · Conversão
 */
export default function Home() {
  return (
    <>
      <Header />
      <main id="conteudo" className="relative">
        {/* abertura cinematográfica + construção progressiva da empresa */}
        <ConstructionHero />
        {/* zona clara: carrossel de projetos logo após a construção (degradê, sem divisão) */}
        <div className="zone tone-light">
          <Projects />
        </div>
        <Problem />
        <div className="zone tone-light">
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
