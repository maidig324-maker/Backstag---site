import type { CSSProperties } from "react";
import { ARQ_LAYERS } from "./layers.generated";
import { FRAMES, type LayerId } from "./timeline";

type Info = { title: string; text: string };

/**
 * TEXTO INFORMATIVO (telas largas)
 * Nome e descrição ao fim da linha de identificação, em HTML de verdade
 * (legível, selecionável, acessível). A posição é a mesma coordenada do
 * viewBox, convertida em porcentagem do quadro, e acompanha a camada.
 */
export function LayerInfo({ id, info }: { id: LayerId; info: Info }) {
  const f = FRAMES.wide;
  const [vx, vy, vw, vh] = f.vb;
  const { anchor, side } = ARQ_LAYERS[id];
  const end = side === "left" ? f.lineEnd[0] : f.lineEnd[1];
  const gapU = 12; // respiro entre o fim da linha e o texto
  const style = {
    top: `${((anchor[1] - vy) / vh) * 100}%`,
    ...(side === "left"
      ? { right: `${((vx + vw - (end - gapU)) / vw) * 100}%` }
      : { left: `${((end + gapU - vx) / vw) * 100}%` }),
  } as CSSProperties;
  return (
    <div className={`hx-info ${side === "left" ? "text-right" : "text-left"}`} style={style} aria-hidden>
      <p className="hx-info-title">{info.title}</p>
      <p className="hx-info-text">{info.text}</p>
    </div>
  );
}

/**
 * TEXTO INFORMATIVO (celular)
 * Em telas estreitas o texto não cabe ao lado da construção sem cobri-la:
 * a camada que acabou de entrar é descrita logo abaixo do desenho.
 */
export function LayerCaption({ info }: { info: Info | null }) {
  return (
    <div className="hx-caption" aria-hidden>
      {info && (
        <p key={info.title} className="hx-caption-in">
          <span className="hx-info-title block">{info.title}</span>
          <span className="hx-info-text block">{info.text}</span>
        </p>
      )}
    </div>
  );
}
