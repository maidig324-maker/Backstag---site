/**
 * TIMELINE DE ROLAGEM — uma única linha do tempo para todo o hero.
 *
 * Tudo depende de um só número: p (0 → 1), o quanto o visitante já rolou
 * dentro do hero. Abertura, camadas, linhas, textos e encaixe final são
 * fatias dessa mesma linha, por isso nunca saem de sincronia. Rolar de volta
 * devolve cada camada à posição anterior, no mesmo ritmo.
 *
 * Saída: variáveis CSS (números puros, em unidades do viewBox) aplicadas no
 * palco. O CSS só usa transform e opacity, sem recalcular layout.
 */
import { ARQ_GAP_PX, ARQ_LAYERS } from "./layers.generated";

export const LAYER_IDS = ["gestao", "marketing", "estrutura", "tecnologia", "automacao"] as const;
export type LayerId = (typeof LAYER_IDS)[number];

/** Enquadramento da construção para cada tamanho de tela. */
export type Frame = {
  /** viewBox "x y largura altura" — mesmo sistema de coordenadas das camadas */
  vb: [number, number, number, number];
  /** afastamento entre camadas na vista explodida */
  gap: number;
  /** quanto a camada desce de cima ao entrar */
  drop: number;
  /** deslocamento lateral ao entrar (sem giro) */
  drift: number;
  /** onde as linhas de identificação terminam (esquerda, direita) */
  lineEnd: [number, number];
};

export const FRAMES: Record<"compact" | "wide", Frame> = {
  // celular e tablet em pé: construção ocupa a largura, textos fora dela
  compact: { vb: [165, 115, 470, 615], gap: ARQ_GAP_PX * 0.8, drop: 100, drift: 16, lineEnd: [172, 628] },
  // telas largas: espaço lateral para nome e descrição de cada camada
  wide: { vb: [-140, 60, 1080, 740], gap: ARQ_GAP_PX, drop: 130, drift: 26, lineEnd: [150, 650] },
};

/** Fatias da linha do tempo (frações da rolagem do hero). */
export const PHASE = {
  logo: [0, 0.12] as const, // a logo se aproxima do observador
  logoOut: [0.055, 0.13] as const, // e desaparece sem corte
  headline: [0.09, 0.17] as const, // etapa 1: mensagem + base da composição
  ground: [0.1, 0.2] as const,
  layer: (i: number) => [0.18 + i * 0.12, 0.28 + i * 0.12] as const, // etapas 2–6
  label: (i: number) => [0.22 + i * 0.12, 0.31 + i * 0.12] as const,
  settle: [0.18, 0.78] as const, // as camadas se aproximam continuamente
  join: [0.78, 0.88] as const, // etapa 7: encaixe, separações somem
  labelsOut: [0.77, 0.85] as const,
  headlineOut: [0.83, 0.89] as const,
  final: [0.86, 0.95] as const,
};

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const seg = (p: number, [a, b]: readonly [number, number]) => clamp01((p - a) / (b - a));
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// altura do topo de cada camada (unidades isométricas) e a base do prédio
const TOP_Z = [0, ...LAYER_IDS.map((id) => ARQ_LAYERS[id].z[1])];
const FOOT_TOP = 492.5; // canto mais alto da planta no nível 0 (py)
const FOOT_BOTTOM = 747.5; // canto mais baixo da planta (py)

export type TimelineState = {
  vars: Record<string, number>;
  /** última camada que já entrou (−1 = nenhuma) — para a legenda do celular */
  step: number;
  /** logo ainda em cena (o cabeçalho espera) */
  opening: boolean;
  /** composição final visível (botões recebem foco) */
  ready: boolean;
};

export function computeTimeline(p: number, frame: Frame): TimelineState {
  const vars: Record<string, number> = {};
  const [, vy, , vh] = frame.vb;

  // abertura
  vars["--lp"] = easeInOut(seg(p, PHASE.logo));
  vars["--lf"] = seg(p, PHASE.logoOut);
  vars["--sc"] = p; // o ambiente se aproxima devagar durante todo o hero
  vars["--hd"] = easeOut(seg(p, PHASE.headline)) * (1 - seg(p, PHASE.headlineOut));
  vars["--gd"] = easeOut(seg(p, PHASE.ground));

  // afastamento entre camadas: diminui sem parar e zera no encaixe
  const join = easeInOut(seg(p, PHASE.join));
  const gap = frame.gap * (1 - 0.35 * seg(p, PHASE.settle)) * (1 - join);

  // câmera: mantém a parte já construída no centro do enquadramento
  let built = 0;
  const enter = LAYER_IDS.map((_, i) => {
    const e = easeOut(seg(p, PHASE.layer(i)));
    built += e;
    return e;
  });
  const k = Math.min(4, Math.floor(built));
  const topZ = lerp(TOP_Z[k], TOP_Z[Math.min(5, k + 1)], built - k);
  const top = FOOT_TOP - 30 * topZ - gap * Math.max(0, built - 1);
  const cam = vy + vh / 2 - (top + FOOT_BOTTOM) / 2;
  vars["--cam"] = cam;

  let step = -1;
  LAYER_IDS.forEach((id, i) => {
    const e = enter[i];
    const side = ARQ_LAYERS[id].side === "left" ? -1 : 1;
    const x = side * frame.drift * (1 - e);
    const y = cam - gap * i - frame.drop * (1 - e);
    vars[`--x${i}`] = x;
    vars[`--y${i}`] = y;
    vars[`--o${i}`] = clamp01(e * 1.5);
    // linha se estende, depois o ponto e o texto aparecem
    const l = seg(p, PHASE.label(i));
    const out = 1 - seg(p, PHASE.labelsOut);
    vars[`--l${i}`] = easeOut(clamp01(l * 1.6)) * out;
    vars[`--t${i}`] = easeOut(clamp01((l - 0.35) * 1.6)) * out;
    if (e > 0.55) step = i;
  });

  vars["--sm"] = 1 - seg(p, PHASE.join); // linhas de separação desaparecem
  vars["--jn"] = join;
  vars["--lb"] = 1 - seg(p, PHASE.labelsOut);
  const fin = easeOut(seg(p, PHASE.final));
  vars["--fn"] = fin;

  return { vars, step: p >= PHASE.labelsOut[1] ? -1 : step, opening: p < PHASE.logoOut[1], ready: fin > 0.5 };
}

/** Estado estático para quem prefere movimento reduzido: composição final. */
export const STATIC_P = 1;
