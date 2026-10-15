/**
 * SOBRE O FUNDADOR
 * Texto escrito sem certificações, anos de experiência, formação ou
 * resultados não informados. Revise e complemente apenas com fatos.
 */
export const founder = {
  label: "Fundador",
  name: "Douglas Nascimento",
  role: "Fundador da BACKSTAG",
  /**
   * SUBSTITUIR: salve a fotografia real em /public/founder/ e preencha.
   * Proporção recomendada: retrato 4:5 (ex.: 1200×1500).
   */
  photo: { src: "/images/fundador-backstag.png", alt: "Douglas Nascimento, fundador da Backstag, de blazer preto, com o braço apoiado num bloco escuro", width: 1122, height: 1402 } as null | { src: string; alt: string; width: number; height: number },
  /** Título da seção (sugerido pelo fundador) e assinatura dentro da caixa. */
  headline: ["Por trás da BACKSTAG existe uma visão:", "fazer empresas funcionarem melhor."],
  pillars: ["Gestão", "Estratégia", "Tecnologia"],
  // ex.: { src: "/founder/douglas-nascimento.webp", alt: "Douglas Nascimento, fundador da Backstag", width: 1200, height: 1500 }

  paragraphs: [
    "Douglas Nascimento está à frente da Backstag e atua diretamente nos projetos — do diagnóstico à execução.",
    "Seu trabalho reúne gestão, operações empresariais, marketing digital e desenvolvimento de soluções digitais. Essa combinação permite olhar para a empresa como um todo: entender a rotina, organizar o que precisa ser organizado e só então escolher a tecnologia ou a estratégia certa.",
    "A proposta é simples: estar próximo de quem toca o negócio, participar da implementação e acompanhar a evolução, em vez de entregar recomendações e sair de cena.",
  ],
  principles: ["Visão estratégica", "Envolvimento na execução", "Melhoria contínua de processos"],
};
