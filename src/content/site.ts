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
    src: null as string | null, // ex.: "/brand/backstag-logo.svg"
    width: 180,
    height: 40,
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
    "Olá! Conheci a Backstag pelo site e gostaria de conversar sobre soluções para minha empresa.",

  instagramHandle: "@backstagmarketing",
  instagramUrl: "https://www.instagram.com/backstagmarketing/",
  /** Link oficial do Instagram para abrir o Direct da conta. */
  instagramDirectUrl: "https://ig.me/m/backstagmarketing",
} as const;

export const navigation = [
  { label: "Soluções", href: "#solucoes" },
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
  label: "Descoberta",
  title: "O crescimento começa quando a estrutura acompanha a ambição.",
  intro:
    "Muitas empresas crescem mais rápido do que a própria organização. O cliente vê o palco — mas, muitas vezes, o que trava o negócio está nos bastidores.",
  items: [
    {
      title: "Falta de organização operacional",
      text: "Rotinas que dependem da memória de poucas pessoas e informações espalhadas em lugares diferentes.",
      approach: "Mapeamos rotinas e responsabilidades e organizamos a informação num fluxo que a equipe consegue seguir.",
    },
    {
      title: "Processos manuais e retrabalho",
      text: "Tarefas repetidas à mão, planilhas duplicadas e tempo gasto corrigindo o que poderia funcionar sozinho.",
      approach: "Identificamos tarefas repetitivas e avaliamos onde automação e integração entre ferramentas fazem sentido.",
    },
    {
      title: "Presença digital pouco estruturada",
      text: "Canais que existem, mas não comunicam com clareza o que a empresa faz nem facilitam o contato.",
      approach: "Estruturamos site, canais e comunicação para explicar com clareza o que a empresa faz e facilitar o contato.",
    },
    {
      title: "Atendimento, marketing e operação desconectados",
      text: "Cada área trabalha com sua própria versão dos fatos, e o cliente sente essa distância.",
      approach: "Conectamos atendimento, marketing e operação para que as áreas trabalhem com a mesma informação.",
    },
    {
      title: "Dificuldade para acompanhar e melhorar",
      text: "Sem informação organizada, fica difícil saber o que está funcionando e por onde começar a mudar.",
      approach: "Organizamos indicadores simples e rotinas de acompanhamento para orientar as próximas melhorias.",
    },
  ],
  bridge:
    "A Backstag entra nos bastidores: avalia como a sua empresa funciona hoje, entende as necessidades reais do negócio e implementa as soluções adequadas a cada caso — da organização interna à presença digital.",
} as const;

export const contactSection = {
  label: "Conversão",
  title: "Sua empresa tem desafios. Vamos construir as soluções.",
  text: "Conte o que sua empresa precisa melhorar e descubra como podemos ajudar a estruturar os próximos passos.",
  whatsappCta: "Conversar pelo WhatsApp",
  instagramCta: "Conhecer a Backstag no Instagram",
} as const;
