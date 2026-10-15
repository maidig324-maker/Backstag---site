/**
 * PORTFÓLIO / ESTUDOS DE CASO
 * ------------------------------------------------------------------
 * Para adicionar, remover ou atualizar um projeto, edite somente este
 * arquivo. Nenhum componente precisa ser alterado.
 *
 * Regras de honestidade aplicadas pelo componente:
 *  - O nome do cliente só aparece se `disclosure.clientNameAuthorized` for true.
 *    Caso contrário, é exibido `anonymousTitle` (ex.: "Varejo pet").
 *  - `link` só vira um link clicável se `disclosure.linkAuthorized` for true.
 *  - Projetos com `status: "em-documentacao"` são placeholders editoriais:
 *    aparecem identificados como tal e somem quando
 *    `site.showPlaceholders` for false.
 *  - Campos vazios (`null`) nunca são preenchidos com texto inventado.
 *
 * Imagens: salve em /public/projects/<id>/ e referencie como
 * "/projects/<id>/arquivo.webp". Não use URLs remotas.
 */

export type ProjectImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Ponto de foco no recorte do card (object-position), ex.: "30% 50%". */
  focus?: string;
};

export type ProjectStatus = "publicado" | "em-operacao" | "em-andamento" | "em-documentacao";

/** Vídeo real do projeto (arquivo local em /public/projects/<id>/ ou /public/proofs/). */
export type ProjectVideo = {
  src: string;
  poster?: string;
  alt: string;
  width: number;
  height: number;
  /** Observação exibida junto ao vídeo (ex.: dados desfocados). */
  note?: string;
  /** Vídeo ilustrativo (não é gravação do cliente): nunca vale como prova de resultado. */
  illustrative?: boolean;
};

export type Project = {
  id: string;
  /** Nome real do cliente/projeto (exibido apenas com autorização). */
  clientName: string;
  /** Título usado quando o nome não está autorizado. */
  anonymousTitle: string;
  sector: string;
  status: ProjectStatus;
  /** Linha curta exibida no card. Deve ser factual. */
  headline: string | null;
  initialSituation: string | null;
  challenge: string | null;
  solution: string | null;
  /** O que exatamente a Backstag fez — sem atribuir trabalho de terceiros. */
  backstagRole: string | null;
  /** Somente resultados comprovados/documentados. */
  provenResult: string | null;
  images: ProjectImage[];
  /** Vídeo real: vira a capa do card no carrossel (exige imagesAuthorized). */
  video?: ProjectVideo;
  /** Canais/frentes do projeto, exibidos como etiquetas. */
  tags?: string[];
  link: string | null;
  disclosure: {
    clientNameAuthorized: boolean;
    linkAuthorized: boolean;
    imagesAuthorized: boolean;
  };
  /** Destaque ocupa mais espaço no layout assimétrico. */
  featured?: boolean;
};

export const projectsIntro = {
  label: "BACKSTAG em ação",
  title: "Não mostramos apenas ideias. Mostramos o trabalho colocado em prática.",
  text: "Cada negócio tem seus desafios. Conheça algumas das soluções e atividades que desenvolvemos em diferentes operações empresariais.",
  cta: "Conhecer o trabalho",
};

export const projects: Project[] = [
  {
    // Vídeo enviado pelo fundador; primeiros segundos cortados e primeiro
    // plano desfocado para proteger nome e endereço dos compradores.
    id: "ecommerce-marketplaces",
    clientName: "Operação de e-commerce", // nome do cliente não informado
    anonymousTitle: "Por trás de cada pedido existe uma operação que precisa funcionar.",
    sector: "E-commerce",
    status: "em-operacao",
    headline:
      "Estruturação de canais de venda online e processos comerciais. O registro da expedição demonstra uma das etapas reais dessa operação.",
    initialSituation: null,
    challenge: null,
    solution: "Estrutura completa para a empresa vender nos marketplaces: Mercado Livre, Shopee, Amazon e outros canais.",
    backstagRole: "Montagem de toda a estrutura de desenvolvimento da empresa para vender no e-commerce.",
    provenResult: null,
    images: [],
    video: {
      src: "/proofs/ecommerce-etiquetas.mp4",
      poster: "/proofs/ecommerce-etiquetas-poster.jpg",
      alt: "Impressora térmica imprimindo etiquetas de envio de pedidos em sequência",
      width: 720,
      height: 960,
      note: "Gravação real da operação de um cliente. Dados dos compradores desfocados.",
    },
    tags: ["Mercado Livre", "Shopee", "Amazon", "e outros canais"],
    link: null,
    disclosure: { clientNameAuthorized: false, linkAuthorized: false, imagesAuthorized: true },
    featured: true,
  },
  {
    id: "petshop-palmares",
    clientName: "Petshop Palmares", // exibido somente após autorização
    anonymousTitle: "Muito além das redes sociais. Uma operação comercial conectada.",
    sector: "Varejo pet",
    status: "publicado",
    headline:
      "Desenvolvimento digital, posicionamento de mercado, apoio à gestão comercial, cotações e logística. Uma atuação que conecta a presença online aos desafios do dia a dia.",
    initialSituation: null,
    challenge: null,
    solution:
      "Reposicionamento da empresa no mercado, ampliação das redes de venda junto com o e-commerce e um site forte, estruturado para gerar vendas todos os meses, com foco em aumentar o faturamento.",
    backstagRole:
      "Posicionamento de mercado, expansão dos canais de venda e do e-commerce, desenvolvimento do site, melhoria da gestão comercial e apoio nas cotações e na logística.",
    provenResult: null,
    images: [],
    video: {
      src: "/projects/varejo-atacado-pet/operacao.mp4",
      poster: "/projects/varejo-atacado-pet/operacao-poster.jpg",
      alt: "Centro de distribuição de produtos pet: prateleiras abastecidas, empilhadeira, leitura de código de barras e caixas na esteira",
      width: 540,
      height: 960,
      note: "Vídeo ilustrativo da operação de varejo e atacado pet.",
      illustrative: true,
    },
    tags: ["Posicionamento", "E-commerce", "Site de vendas", "Gestão comercial", "Cotações e logística"],
    link: null,
    disclosure: { clientNameAuthorized: false, linkAuthorized: false, imagesAuthorized: true },
  },
  {
    id: "casa-prates",
    clientName: "Casa Prates Alimentos",
    anonymousTitle: "Da produção ao mercado: organização, estratégia e presença de marca.",
    sector: "Indústria alimentícia",
    status: "publicado",
    headline:
      "Apoio à logística, fornecedores, cotações, portfólio comercial e comunicação digital de uma indústria de alimentos congelados.",
    initialSituation: null,
    challenge: null,
    solution:
      "Apoio na logística e na relação com fornecedores, cotações negociadas para brigar por preço e ganhar margem de lucro, construção de um portfólio forte e estudo de mercado para ganhar competitividade frente à concorrência.",
    backstagRole:
      "Logística, cotações e negociação com fornecedores, portfólio de produtos, pesquisa de mercado e construção de autoridade no digital, com o objetivo de tornar a marca conhecida nacionalmente.",
    provenResult: null,
    images: [],
    video: {
      src: "/projects/casa-prates/linha-producao.mp4",
      poster: "/projects/casa-prates/linha-producao-poster.jpg",
      alt: "Linha de produção de pão de queijo: esteira, balança automática com painel digital e máquina de embalagem",
      width: 540,
      height: 960,
      note: "Gravação real da linha de produção de um cliente.",
    },
    tags: ["Logística", "Cotações e fornecedores", "Margem de lucro", "Portfólio", "Pesquisa de mercado", "Autoridade digital"],
    link: null,
    disclosure: { clientNameAuthorized: false, linkAuthorized: false, imagesAuthorized: true },
  },
  {
    id: "delivery-street-food",
    clientName: "Delivery de street food",
    anonymousTitle: "Produtos bem apresentados. Comunicação pensada para despertar interesse.",
    sector: "Gastronomia e delivery",
    status: "publicado",
    headline:
      "Desenvolvimento de conteúdos, identidade visual aplicada às campanhas e apresentação comercial de produtos para redes sociais.",
    initialSituation: null,
    challenge: null,
    solution: null,
    backstagRole: null,
    provenResult: null,
    images: [],
    video: {
      src: "/projects/delivery-street-food/cozinha.mp4",
      poster: "/projects/delivery-street-food/cozinha-poster.jpg",
      alt: "Cozinha de hamburgueria: carne na chapa, pães, ingredientes frescos, clientes no salão e o hambúrguer pronto",
      width: 540,
      height: 960,
      note: "Vídeo ilustrativo de uma operação de gastronomia e delivery.",
      illustrative: true,
    },
    link: null,
    disclosure: { clientNameAuthorized: false, linkAuthorized: false, imagesAuthorized: true },
  },
];

/* Modelo para copiar ao documentar um projeto real:

  {
    id: "nome-do-projeto",
    clientName: "Nome do Cliente",
    anonymousTitle: "Projeto no setor X",
    sector: "Setor",
    status: "publicado",
    headline: "Frase curta e factual sobre o projeto.",
    initialSituation: "Como a empresa estava antes.",
    challenge: "O desafio identificado.",
    solution: "O que foi executado.",
    backstagRole: "Responsabilidade específica da Backstag.",
    provenResult: null, // preencha só com resultado documentado
    images: [
      { src: "/projects/nome-do-projeto/capa.webp", alt: "Descrição da imagem", width: 1600, height: 1000 },
    ],
    link: "https://site-do-cliente.com.br",
    disclosure: { clientNameAuthorized: true, linkAuthorized: true, imagesAuthorized: true },
    featured: false,
  },
*/
