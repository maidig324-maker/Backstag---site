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

export type Proof = Testimonial | Metric | Screenshot | Video | Comparison;

export const proofsIntro = {
  label: "Resultados e provas",
  title: "O que os clientes e os números mostram.",
};

export const proofs: Proof[] = [
  // Nenhuma prova cadastrada ainda. Exemplos de formato:
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
