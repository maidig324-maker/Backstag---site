import { ARQ_LAYERS } from "./layers.generated";
import type { Frame, LayerId } from "./timeline";

/**
 * LINHA DE IDENTIFICAÇÃO
 * Ponto preso à borda da camada e linha fina que se estende para a lateral
 * (lados alternados). Fica fora do desenho da camada, mas se move junto com
 * ela: é desenhada dentro do mesmo quadro que a camada desloca.
 */
export function IdentificationLine({ id, frame }: { id: LayerId; frame: Frame }) {
  const { anchor, side } = ARQ_LAYERS[id];
  const [ax, ay] = anchor;
  const end = side === "left" ? frame.lineEnd[0] : frame.lineEnd[1];
  return (
    <g className="hx-id" aria-hidden>
      <line x1={ax} y1={ay} x2={end} y2={ay} pathLength={1} className="hx-id-line" />
      <circle cx={end} cy={ay} r={1.8} className="hx-id-end" />
      <circle cx={ax} cy={ay} r={7} className="hx-id-halo" />
      <circle cx={ax} cy={ay} r={3} className="hx-id-dot" />
    </g>
  );
}
