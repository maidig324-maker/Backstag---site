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
      <main id="conteudo">
        <HeroStrata />
        <Problem />
        <Projects />
        <Methodology />
        {/* Provas sociais só entram com material real e verificado */}
        {publishableProofs.length > 0 && <Proofs />}
        <Founder />
        <Contact />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
