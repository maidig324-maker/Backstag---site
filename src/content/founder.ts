/**
 * SOBRE O FUNDADOR
 * Texto escrito sem certificações, anos de experiência, formação ou
 * resultados não informados. Revise e complemente apenas com fatos.
 */
export const founder = {
  label: "Quem está por trás da BACKSTAG",
  name: "Douglas Nascimento",
  role: "Fundador da BACKSTAG",
  company: "Gestão e Soluções Digitais",
  /**
   * SUBSTITUIR: salve a fotografia real em /public/founder/ e preencha.
   * Proporção recomendada: retrato 4:5 (ex.: 1200×1500).
   */
  photo: { src: "/images/fundador-backstag.png", alt: "Douglas Nascimento, fundador da Backstag, de blazer preto, com o braço apoiado num bloco escuro", width: 1122, height: 1402 } as null | { src: string; alt: string; width: number; height: number },
  /** Título da seção (sugerido pelo fundador) e assinatura dentro da caixa. */
  headline: ["Negócios são feitos de pessoas.", "E boas soluções começam entendendo suas necessidades."],
  pillars: ["Gestão", "Estratégia", "Tecnologia"],
  // ex.: { src: "/founder/douglas-nascimento.webp", alt: "Douglas Nascimento, fundador da Backstag", width: 1200, height: 1500 }

  paragraphs: [
    "A Backstag foi criada com um propósito: conectar gestão, estratégia e tecnologia para ajudar empresas a funcionar melhor.",
    "À frente da empresa, Douglas participa de projetos que envolvem organização operacional, desenvolvimento de soluções digitais, planejamento comercial e melhorias nos processos empresariais.",
    "A proposta vai além de recomendar ferramentas. É entender a realidade do negócio, identificar o que precisa mudar e participar da construção de soluções que façam sentido para aquela operação.",
  ],
  vision: "A tecnologia deve servir à empresa. A estratégia precisa orientar as decisões. E a gestão deve transformar planejamento em execução.",
};
