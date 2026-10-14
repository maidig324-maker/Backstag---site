/**
 * RESULTADOS E PROVAS SOCIAIS
 * ------------------------------------------------------------------
 * Somente material real. Nada aqui é exibido sem `verified: true`.
 * Se a lista não tiver nenhum item verificado, a seção inteira é
 * ocultada (ou mostra um aviso de espaço reservado, apenas enquanto
 * `site.showPlaceholders` for true).
 *
 * Arquivos (fotos, prints, vídeos) ficam em /public/proofs/.
 */

type Base = { id: string; verified: boolean };

export type Testimonial = Base & {
  kind: "testimonial";
  quote: string;
  author: string;
  role?: string;
  company?: string;
  /** Confirme que a pessoa autorizou a publicação. */
  authorized: boolean;
};

export type Metric = Base & {
  kind: "metric";
  value: string; // ex.: "-40%"
  label: string; // ex.: "tempo de resposta no atendimento"
  /** Origem do número: período, cliente, como foi medido. Obrigatório. */
  source: string;
};

export type Screenshot = Base & {
  kind: "screenshot";
  src: string;
  alt: string;
  width: number;
  height: number;
  caption: string;
};

export type Video = Base & {
  kind: "video";
  /** Arquivo local em /public/proofs (mp4/webm). */
  src: string;
  poster?: string;
  caption: string;
};

export type Comparison = Base & {
  kind: "comparison";
  title: string;
  before: string;
  after: string;
  source: string;
};

/** Vídeo real da operação de um cliente, com título, texto e canais. */
export type VideoCase = Base & {
  kind: "video-case";
  title: string[];
  text: string;
  tags?: string[];
  src: string;
  poster?: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
};

export type Proof = Testimonial | Metric | Screenshot | Video | Comparison | VideoCase;

export const proofsIntro = {
  label: "Prova social",
  title: "Resultados reais, direto da operação dos clientes.",
};

export const proofs: Proof[] = [
  // Operação de e-commerce estruturada pela Backstag. Vídeo enviado pelo
  // fundador; primeiros segundos cortados e primeiro plano desfocado para
  // proteger nome e endereço dos compradores nas etiquetas.
  {
    id: "ecommerce-marketplaces",
    kind: "video-case",
    verified: true,
    title: ["Estrutura completa", "para vender nos marketplaces."],
    text: "Montamos toda a estrutura para a empresa vender no e-commerce. O resultado aparece na operação: pedidos virando etiquetas de envio, uma atrás da outra.",
    tags: ["Mercado Livre", "Shopee", "Amazon", "e outros canais"],
    src: "/proofs/ecommerce-etiquetas.mp4",
    poster: "/proofs/ecommerce-etiquetas-poster.jpg",
    width: 720,
    height: 960,
    alt: "Impressora térmica imprimindo etiquetas de envio de pedidos em sequência",
    caption: "Gravação real da operação de um cliente. Dados dos compradores desfocados.",
  },

  // Próximas provas. Exemplos de formato:
  //
  // { id: "dep-1", kind: "testimonial", verified: true, authorized: true,
  //   quote: "Texto real do depoimento.", author: "Nome", role: "Cargo", company: "Empresa" },
  //
  // { id: "met-1", kind: "metric", verified: true,
  //   value: "X%", label: "descrição do indicador", source: "Cliente Y, jan–mar/2026, relatório interno" },
];

export function getPublishableProofs(list: Proof[] = proofs): Proof[] {
  return list.filter((p) => p.verified && (p.kind !== "testimonial" || p.authorized));
}
