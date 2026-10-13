import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Problem } from "@/components/sections/Problem";
import { Services } from "@/components/sections/Services";
import { Projects } from "@/components/sections/Projects";
import { Methodology } from "@/components/sections/Methodology";
import { Proofs } from "@/components/sections/Proofs";
import { Founder } from "@/components/sections/Founder";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Header />
      <main id="conteudo">
        <Hero />
        <Problem />
        <Services />
        <Projects />
        <Methodology />
        <Proofs />
        <Founder />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
