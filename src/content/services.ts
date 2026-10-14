export type Service = {
  id: string;
  number: string;
  title: string;
  summary: string;
  /** Entregas concretas exibidas ao expandir a área. */
  scope: string[];
};

export const servicesIntro = {
  label: "Capacidades",
  title: "Quatro frentes conectadas por uma mesma lógica.",
  text: "A operação precisa sustentar o crescimento. Atuamos de forma integrada. Uma melhoria no site pode depender de um processo de atendimento; uma automação só faz sentido quando a rotina está organizada.",
};

export const services: Service[] = [
  {
    id: "gestao",
    number: "01",
    title: "Gestão Empresarial",
    summary:
      "Organização de rotinas, processos administrativos, apoio logístico, fornecedores e acompanhamento operacional.",
    scope: [
      "Mapeamento e organização de rotinas e processos",
      "Apoio à gestão operacional e logística",
      "Cotações e análise de fornecedores",
      "Suporte burocrático-administrativo",
    ],
  },
  {
    id: "estrategia",
    number: "02",
    title: "Estratégia e Marketing",
    summary:
      "Posicionamento digital, planejamento comercial, conteúdo estratégico, campanhas e desenvolvimento de oportunidades.",
    scope: [
      "Posicionamento e comunicação da marca",
      "Planejamento comercial e de conteúdo",
      "Campanhas e tráfego pago",
      "Desenvolvimento de novas oportunidades",
    ],
  },
  {
    id: "digital",
    number: "03",
    title: "Desenvolvimento Digital",
    summary:
      "Sites institucionais, páginas comerciais, catálogos, estruturação de canais digitais e melhorias de experiência do cliente.",
    scope: [
      "Sites institucionais e landing pages",
      "Catálogos e páginas comerciais",
      "Estruturação de canais digitais",
      "Melhorias na experiência do cliente",
    ],
  },
  {
    id: "ia",
    number: "04",
    title: "Inteligência Artificial e Automação",
    summary:
      "Análise de processos, automação de tarefas, integração de ferramentas e implementação de soluções tecnológicas adequadas às necessidades do negócio.",
    scope: [
      "Análise de processos com potencial de automação",
      "Automação de tarefas com inteligência artificial",
      "Integração entre ferramentas e sistemas",
      "Implementação acompanhada da equipe",
    ],
  },
];
