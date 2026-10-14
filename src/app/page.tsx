import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { PageCircuit } from "@/components/layout/PageCircuit";
import { HeroStrata } from "@/components/hero-lab/HeroStrata";
import { Problem } from "@/components/sections/Problem";
import { Projects } from "@/components/sections/Projects";
import { Methodology } from "@/components/sections/Methodology";
import { FeaturedProof } from "@/components/sections/FeaturedProof";
import { Founder } from "@/components/sections/Founder";
import { Contact } from "@/components/sections/Contact";

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
        {/* trilha de circuito ligando os blocos (atrás do conteúdo) */}
        <PageCircuit />
        <HeroStrata />
        <Problem />
        {/* prova real logo depois dos desafios */}
        <FeaturedProof />
        <Projects />
        <Methodology />
        <Founder />
        <Contact />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
