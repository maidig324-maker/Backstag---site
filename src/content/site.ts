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
    "Olá! Conheci a Backstag pelo site e gostaria de conversar sobre soluções para minha empresa.",

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
  label: "Desafios",
  // Abertura da experiência "entre na nossa visão"
  vision: {
    title: "Veja a sua empresa pelos nossos olhos.",
    text: "Role a tela e entre na nossa visão: para cada desafio de hoje, mostramos a transformação que enxergamos e como chegamos lá.",
  },
  title: "O crescimento começa quando a estrutura acompanha a ambição.",
  intro:
    "Muitas empresas crescem mais rápido do que a própria organização. O cliente vê o palco — mas, muitas vezes, o que trava o negócio está nos bastidores.",
  items: [
    {
      title: "Gestão e desenvolvimento da sua operação",
      text: "As rotinas dependem da memória de poucas pessoas e a informação fica espalhada entre conversas, planilhas e cadernos. Quando alguém falta, a operação trava.",
      approach: "Desenhamos a sua operação de ponta a ponta: processos mapeados, responsáveis definidos e padrões de execução, com a informação centralizada num só lugar. Sua empresa passa a funcionar pelo processo, não pelo improviso.",
      front: "Gestão Empresarial",
      steps: ["Mapeamento de processos e responsáveis", "Padronização de rotinas", "Informação centralizada"],
    },
    {
      title: "Automação inteligente de processos",
      text: "Sua equipe repete tarefas à mão, copia dados de uma planilha para outra e perde horas corrigindo erros que nem precisariam existir.",
      approach: "Encontramos os gargalos repetitivos e conectamos as suas ferramentas com automações e inteligência artificial. Os dados passam de um sistema para o outro sozinhos, e o seu time fica livre para o que realmente exige pessoas.",
      front: "IA e Automação",
      steps: ["Diagnóstico das tarefas repetitivas", "Integração entre sistemas", "Automação com IA e treinamento"],
    },
    {
      title: "Presença digital que vende",
      text: "Sua empresa está na internet, mas o site, as redes e os marketplaces não mostram com clareza o que você faz nem levam o cliente até a compra.",
      approach: "Estruturamos o seu ecossistema digital: site, redes e lojas nos marketplaces com posicionamento claro, navegação pensada para converter e um caminho direto até o seu atendimento.",
      front: "Desenvolvimento Digital",
      steps: ["Posicionamento e arquitetura dos canais", "Site, e-commerce e marketplaces", "Caminho direto até a venda"],
    },
    {
      title: "Automação de atendimento e marketing",
      text: "O marketing atrai, mas o atendimento demora a responder e a operação nem fica sabendo. Cada área trabalha com a sua própria versão dos fatos, e o seu cliente sente essa distância.",
      approach: "Conectamos marketing, atendimento e operação numa só jornada: cada contato é registrado, respondido no tempo certo e acompanhado até a venda, com todas as áreas olhando a mesma informação.",
      front: "Estratégia e Marketing",
      steps: ["Mapeamento da jornada do cliente", "Atendimento integrado e automatizado", "Mesma informação em todas as áreas"],
    },
    {
      title: "Indicadores e evolução contínua",
      text: "Sem números organizados, as decisões são tomadas no escuro. Fica difícil saber o que está funcionando e por onde começar a mudar.",
      approach: "Definimos os indicadores que importam para o seu negócio e criamos uma rotina de acompanhamento. Você passa a enxergar a sua empresa com dados e decide a próxima melhoria com segurança.",
      front: "Gestão Empresarial",
      steps: ["Indicadores-chave do negócio", "Painel e rotina de acompanhamento", "Ciclos de melhoria contínua"],
    },
  ],
  /** Peças do quebra-cabeça da operação: cada encaixe vira esta informação. */
  pieces: [
    "Processos organizados",
    "Tarefas automatizadas",
    "Site e vendas online",
    "Atendimento conectado",
    "Indicadores no painel",
    "Operação funcionando",
  ],
  bridge:
    "A Backstag entra nos bastidores: avalia como a sua empresa funciona hoje, entende as necessidades reais do negócio e implementa as soluções adequadas a cada caso — da organização interna à presença digital.",
} as const;

export const contactSection = {
  label: "Contato",
  title: "Sua empresa tem desafios. Vamos construir as soluções.",
  text: "Conte o que sua empresa precisa melhorar e descubra como podemos ajudar a estruturar os próximos passos.",
  whatsappCta: "Conversar pelo WhatsApp",
  instagramCta: "Conhecer a Backstag no Instagram",
} as const;
