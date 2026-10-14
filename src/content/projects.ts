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
  label: "Projetos e realizações",
  title: "Trabalho de bastidor, documentado com cuidado.",
  text: "Cada estudo de caso descreve a situação, o desafio, o que foi feito e qual foi exatamente o papel da Backstag. Só publicamos nomes, imagens e resultados com autorização e comprovação.",
};

export const projects: Project[] = [
  {
    // Vídeo enviado pelo fundador; primeiros segundos cortados e primeiro
    // plano desfocado para proteger nome e endereço dos compradores.
    id: "ecommerce-marketplaces",
    clientName: "Operação de e-commerce", // nome do cliente não informado
    anonymousTitle: "Estrutura para vender nos marketplaces",
    sector: "E-commerce",
    status: "em-operacao",
    headline:
      "Montamos toda a estrutura para a empresa vender no e-commerce. O resultado aparece na operação: pedidos virando etiquetas de envio, uma atrás da outra.",
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
    anonymousTitle: "Projeto em varejo pet",
    sector: "Varejo pet",
    status: "em-documentacao",
    headline: null, // SUBSTITUIR
    initialSituation: null,
    challenge: null,
    solution: null,
    backstagRole: null,
    provenResult: null,
    images: [],
    link: null,
    disclosure: { clientNameAuthorized: false, linkAuthorized: false, imagesAuthorized: false },
    featured: true,
  },
  {
    id: "casa-prates",
    clientName: "Casa Prates Alimentos",
    anonymousTitle: "Projeto no setor de alimentos",
    sector: "Alimentos",
    status: "em-documentacao",
    headline: null,
    initialSituation: null,
    challenge: null,
    solution: null,
    backstagRole: null,
    provenResult: null,
    images: [],
    link: null,
    disclosure: { clientNameAuthorized: false, linkAuthorized: false, imagesAuthorized: false },
  },
  {
    id: "sistemas-portais",
    clientName: "Sistemas e portais comerciais",
    anonymousTitle: "Sistemas e portais comerciais",
    sector: "Soluções digitais",
    status: "em-documentacao",
    headline: null,
    initialSituation: null,
    challenge: null,
    solution: null,
    backstagRole: null,
    provenResult: null,
    images: [],
    link: null,
    disclosure: { clientNameAuthorized: true, linkAuthorized: false, imagesAuthorized: false },
  },
  {
    id: "sites-materiais",
    clientName: "Sites e materiais desenvolvidos",
    anonymousTitle: "Sites e materiais desenvolvidos",
    sector: "Presença digital",
    status: "em-documentacao",
    headline: null,
    initialSituation: null,
    challenge: null,
    solution: null,
    backstagRole: null,
    provenResult: null,
    images: [],
    link: null,
    disclosure: { clientNameAuthorized: true, linkAuthorized: false, imagesAuthorized: false },
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
