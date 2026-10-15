/**
 * EMPRESA EM CONSTRUÇÃO — substitui o prédio 3D dos Desafios.
 * Vista arquitetônica isométrica em camadas: a cada desafio, uma camada nova
 * desce do alto e se encaixa sobre as anteriores (Gestão é a base). Cada
 * encaixe ganha um ponto dourado, uma linha fina e o nome do que foi
 * resolvido. No último desafio a empresa está completa e a operação acende.
 *
 * As camadas são os SVGs de /public/hero (mesmo sistema de coordenadas,
 * gerados por scripts/architecture), usados como imagem: o navegador desenha
 * uma vez e só move, o que deixa a troca de cenas leve no celular.
 * Pontos, linhas e nomes ficam num SVG à parte, fora das imagens.
 */
import type { CSSProperties } from "react";
import { ARQ_LAYERS } from "@/components/hero/layers.generated";

const IDS = ["gestao", "marketing", "estrutura", "tecnologia", "automacao"] as const;

// enquadramento no sistema das camadas (cada arquivo tem viewBox 0 0 800 800)
const VX = -120;
const VY = 200;
const VW = 1040;
const VH = 580;
const LINE_END = { left: 150, right: 650 } as const;

/** Quebra o nome em até duas linhas equilibradas. */
function lines(label: string): string[] {
  if (label.length <= 12) return [label];
  const words = label.split(" ");
  let best = [label];
  let diff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(" ");
    const b = words.slice(i).join(" ");
    const d = Math.abs(a.length - b.length);
    if (d < diff) {
      diff = d;
      best = [a, b];
    }
  }
  return best;
}

export function ArchitectureBuild({ step, labels, done }: { step: number; labels: string[]; done?: string }) {
  const last = step >= IDS.length - 1;
  const frame = { ["--ar" as string]: VW / VH } as CSSProperties;
  const place = {
    left: `${((0 - VX) / VW) * 100}%`,
    top: `${((0 - VY) / VH) * 100}%`,
    width: `${(800 / VW) * 100}%`,
    height: `${(800 / VH) * 100}%`,
  };
  return (
    <div className={`ab ${last ? "ab-complete" : ""}`} aria-hidden>
      <div className="ab-frame" style={frame}>
        {/* planta no chão: o terreno onde a empresa é construída */}
        <svg viewBox={`${VX} ${VY} ${VW} ${VH}`} className="ab-svg">
          <ellipse cx="400" cy="640" rx="300" ry="120" className="ab-glow" />
          <polygon points="356.4,477.2 647.3,645.2 443.6,762.8 152.7,594.8" className="ab-plan" />
        </svg>

        {IDS.slice(0, step + 1).map((id, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={id}
            src={ARQ_LAYERS[id].src}
            alt=""
            width={800}
            height={800}
            decoding="async"
            loading="lazy"
            draggable={false}
            className={`ab-layer ${i === step ? "ab-now" : "ab-done"}`}
            style={{ ...place, zIndex: i + 1 }}
          />
        ))}

        {/* identificação: ponto na borda da camada, linha e nome */}
        <svg viewBox={`${VX} ${VY} ${VW} ${VH}`} className="ab-svg ab-ids">
          {IDS.slice(0, step + 1).map((id, i) => {
            const { anchor, side } = ARQ_LAYERS[id];
            const [ax, ay] = anchor;
            const end = LINE_END[side];
            const tx = side === "left" ? end - 14 : end + 14;
            const rows = lines(labels[i] ?? "");
            const lh = 1.18; // entrelinha em em
            return (
              <g key={id} className={`ab-id ${i === step ? "ab-id-now" : "ab-id-done"}`}>
                <line x1={ax} y1={ay} x2={end} y2={ay} pathLength={1} className="ab-line" />
                <circle cx={ax} cy={ay} r={9} className="ab-halo" />
                <circle cx={ax} cy={ay} r={3.6} className="ab-dot" />
                <circle cx={end} cy={ay} r={2.2} className="ab-end" />
                <text x={tx} y={ay} textAnchor={side === "left" ? "end" : "start"} className="ab-name">
                  {rows.map((r, k) => (
                    <tspan key={k} x={tx} dy={k === 0 ? `${0.36 - ((rows.length - 1) * lh) / 2}em` : `${lh}em`}>
                      {r}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          })}
          {/* empresa completa: a operação acende */}
          {last && done && (
            <g className="ab-done-tag">
              <circle cx={400} cy={226} r={4} className="ab-dot ab-ok" />
              <text x={414} y={226} dy="0.36em" className="ab-name ab-name-ok">
                {done}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
