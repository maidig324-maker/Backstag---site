/**
 * Hero — construção progressiva de uma empresa (textos aprovados pelo fundador).
 */
export const opening = {
  headline: ["Sua empresa não precisa de soluções isoladas.", "Precisa de tudo funcionando junto."],
  closing: ["Quando tudo se conecta,", "sua empresa avança."],
  signature: "Gestão e Soluções Digitais.",
  cta: { label: "Conheça nossas soluções", href: "/#desafios" },
  concept: "Uma empresa cresce quando todas as suas estruturas trabalham conectadas.",
  layers: [
    { id: "gestao", title: "Gestão", text: "A base para decisões e operações eficientes." },
    { id: "marketing", title: "Marketing", text: "Estratégias que conectam sua empresa ao mercado." },
    { id: "estrutura", title: "Estrutura", text: "Processos organizados para uma operação eficiente." },
    { id: "tecnologia", title: "Tecnologia", text: "Sistemas que conectam informações e operações." },
    { id: "automacao", title: "Automação", text: "Inteligência para simplificar processos e ampliar resultados." },
  ],
} as const;
