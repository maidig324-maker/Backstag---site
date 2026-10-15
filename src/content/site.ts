/**
 * CONFIGURAÇÃO CENTRAL DO SITE
 * ------------------------------------------------------------------
 * Todo dado institucional mora aqui. Componentes visuais nunca devem
 * conter textos de negócio, telefones ou links fixos.
 *
 * ⚠️ PONTOS DE SUBSTITUIÇÃO estão marcados com  // SUBSTITUIR
 */

export const site = {
  name: "BACKSTAG",
  fullName: "BACKSTAG | Gestão e Soluções Digitais",
  positioning: "Gestão e Soluções Digitais",
  tagline: "Gestão. Estratégia. Tecnologia.",
  valueProposition:
    "Ajudamos empresas a organizar processos, desenvolver sua presença digital e implementar soluções para melhorar a operação e criar oportunidades de crescimento.",

  /** URL pública. Defina NEXT_PUBLIC_SITE_URL na Vercel. */
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),

  /**
   * Logo oficial.
   * SUBSTITUIR: salve o arquivo original em /public/brand/ e preencha `src`.
   * Enquanto `src` for null, o site exibe apenas o nome em texto
   * (não é um símbolo substituto, apenas a grafia do nome).
   */
  logo: {
    src: "/brand/backstag-logo.png" as string | null, // arquivo original, só com as margens vazias recortadas
    width: 2033,
    height: 570,
    alt: "BACKSTAG — Gestão e Soluções Digitais",
  },

  /**
   * Exibe placeholders editoriais (projetos sem material, espaço de provas,
   * foto do fundador). Mude para `false` quando quiser publicar apenas
   * conteúdo real: blocos sem material são ocultados automaticamente.
   */
  showPlaceholders: true as boolean,

  /**
   * Indexação por buscadores. Desligada por padrão: o site fica fora de
   * divulgação até a aprovação do design e a inclusão dos projetos reais.
   * Para liberar, defina NEXT_PUBLIC_SITE_INDEXING=true na Vercel e faça novo deploy.
   */
  indexing: process.env.NEXT_PUBLIC_SITE_INDEXING === "true",
} as const;

export const contact = {
  /**
   * WhatsApp comercial — só dígitos, com 55 + DDD.
   * SUBSTITUIR via variável NEXT_PUBLIC_WHATSAPP_NUMBER (nunca inventar número).
   */
  // (21) 98608-4118 — pode ser sobrescrito por NEXT_PUBLIC_WHATSAPP_NUMBER na Vercel
  whatsappNumber: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5521986084118").replace(/\D/g, ""),
  whatsappDisplay: "(21) 98608-4118",
  whatsappGreeting:
    "Olá! Conheci a Backstag pelo site e gostaria de conversar sobre os desafios da minha empresa e entender como vocês podem ajudar.",

  instagramHandle: "@backstagmarketing",
  instagramUrl: "https://www.instagram.com/backstagmarketing/",
  /** Link oficial do Instagram para abrir o Direct da conta. */
  instagramDirectUrl: "https://ig.me/m/backstagmarketing",
} as const;

export const navigation = [
  { label: "Soluções", href: "#desafios" },
  { label: "Projetos", href: "#projetos" },
  { label: "Método", href: "#metodo" },
  { label: "Sobre", href: "#sobre" },
  { label: "Contato", href: "#contato" },
] as const;

export const hero = {
  eyebrow: "Gestão e Soluções Digitais",
  // Cada item é uma linha animada. `tone`: "base" | "dim" | "accent" (itálico dourado).
  headline: [
    { text: "Sua empresa não precisa", tone: "base" },
    { text: "apenas aparecer.", tone: "dim" },
    { text: "Precisa funcionar,", tone: "accent" },
    { text: "evoluir e crescer.", tone: "accent" },
  ],
  sub: "Unimos gestão empresarial, estratégia digital e tecnologia para transformar desafios operacionais em soluções práticas.",
  primaryCta: { label: "Solicitar diagnóstico", href: "#contato" },
  secondaryCta: { label: "Conhecer nossos projetos", href: "#projetos" },
} as const;

export const problem = {
  label: "O que acontece nos bastidores",
  // Abertura da seção: o título e a explicação antes das cenas
  vision: {
    title: "Sua empresa pode estar perdendo dinheiro sem perceber onde.",
    text: "Vender mais é importante. Mas, quando atendimento, processos e operação não funcionam juntos, parte do esforço pode se transformar em atrasos, retrabalho e desperdício.",
    emphasis: "É aqui que começamos a enxergar o que precisa mudar.",
  },
  /** Rótulos dentro de cada cena */
  sceneLabels: { now: "Na sua empresa hoje", action: "Nossa atuação" },
  items: [
    {
      front: "Gestão",
      title: "Sua empresa funciona por processos ou depende de você para tudo?",
      text: "Quando as informações ficam espalhadas e as responsabilidades não estão claras, pequenos problemas passam a consumir tempo todos os dias.",
      approach: "Mapeamos processos, organizamos rotinas, definimos responsabilidades e criamos controles para facilitar a gestão.",
    },
    {
      front: "Automação",
      title: "Quantas horas sua equipe perde fazendo tarefas que poderiam ser automatizadas?",
      text: "Copiar informações, conferir planilhas e repetir atividades manuais ocupa tempo que poderia ser dedicado aos clientes e à operação.",
      approach: "Identificamos tarefas repetitivas e implementamos automações viáveis para simplificar o trabalho.",
    },
    {
      front: "Presença digital",
      title: "Seu negócio está na internet. Mas o cliente consegue chegar até a compra?",
      text: "Estar nas redes sociais não é suficiente quando a comunicação não apresenta a oferta com clareza e dificulta o contato comercial.",
      approach: "Desenvolvemos sites, páginas comerciais, estratégias digitais e jornadas que facilitam o caminho entre interesse e atendimento.",
    },
    {
      front: "Marketing e atendimento",
      title: "Sua empresa atrai clientes, mas consegue acompanhar cada oportunidade?",
      text: "Mensagens sem resposta, falta de acompanhamento e informações desconectadas podem fazer oportunidades comerciais desaparecerem.",
      approach: "Estruturamos a comunicação e os processos de atendimento, conectando marketing, vendas e operação.",
    },
    {
      front: "Indicadores",
      title: "Você sabe quais números realmente mostram se sua empresa está evoluindo?",
      text: "Sem acompanhar custos, vendas, prazos e produtividade, fica difícil reconhecer problemas e decidir onde investir.",
      approach: "Organizamos indicadores e rotinas de acompanhamento para apoiar decisões mais seguras.",
    },
  ],
  /** Peças da empresa em construção: cada encaixe vira esta informação. */
  pieces: [
    "Processos organizados",
    "Tarefas automatizadas",
    "Site e vendas online",
    "Atendimento conectado",
    "Indicadores no painel",
    "Operação funcionando",
  ],
  /** Mensagem de transição ao fim da seção */
  closing: ["O crescimento não depende apenas de fazer mais.", "Depende de fazer cada parte funcionar melhor."],
} as const;

export const contactSection = {
  label: "Vamos conversar sobre sua empresa",
  title: ["Qual parte do seu negócio", "precisa funcionar melhor?"],
  text: [
    "Talvez seja o atendimento. A gestão. A presença digital. Ou processos que consomem mais tempo do que deveriam.",
    "Conte qual é o seu principal desafio. Vamos entender sua necessidade e avaliar por onde começar.",
  ],
  whatsappCta: "Quero conversar sobre minha empresa",
  instagramCta: "Conhecer a Backstag no Instagram",
  support: "Uma boa solução começa com as perguntas certas.",
} as const;
