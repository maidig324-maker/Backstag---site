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

export type ProjectStatus = "publicado" | "em-andamento" | "em-documentacao";

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
