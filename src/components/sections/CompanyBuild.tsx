/**
 * Empresa em 3D que se monta — substitui os símbolos dos desafios.
 * Cada desafio encaixa uma parte do prédio (um serviço): base e escritório,
 * ala da fábrica, andar com telão, torre de comunicação e indicadores no
 * telhado. As partes que faltam aparecem como planta tracejada; no último
 * desafio as janelas acendem: a operação está funcionando.
 *
 * Só CSS 3D (sem biblioteca). Palco base de 200×200, escalado por --k.
 */
import type { CSSProperties, ReactNode } from "react";

type Side = "front" | "back" | "left" | "right" | "top" | "bottom";
type Faces = Partial<Record<Side, string>>;

type BoxProps = {
  w: number;
  h: number;
  d: number;
  at: [number, number, number];
  faces?: Faces;
  base?: string;
  className?: string;
  style?: CSSProperties;
  children?: Partial<Record<Side, ReactNode>>;
};

/** Caixa 3D com seis faces, centrada em `at` (y negativo = para cima). */
function Box({ w, h, d, at, faces = {}, base = "", className = "", style, children = {} }: BoxProps) {
  const face = (side: Side, fw: number, fh: number, t: string) => (
    <span
      className={`cb-face cb-${side} ${base} ${faces[side] ?? ""}`}
      style={{ width: fw, height: fh, left: (w - fw) / 2, top: (h - fh) / 2, transform: t }}
    >
      {children[side]}
    </span>
  );
  return (
    <span
      className={`cb-box ${className}`}
      style={{
        width: w,
        height: h,
        marginLeft: -w / 2,
        marginTop: -h / 2,
        ["--at" as string]: `translate3d(${at[0]}px, ${at[1]}px, ${at[2]}px)`,
        ...style,
      }}
    >
      {face("front", w, h, `translateZ(${d / 2}px)`)}
      {face("back", w, h, `rotateY(180deg) translateZ(${d / 2}px)`)}
      {face("right", d, h, `rotateY(90deg) translateZ(${w / 2}px)`)}
      {face("left", d, h, `rotateY(-90deg) translateZ(${w / 2}px)`)}
      {face("top", w, d, `rotateX(90deg) translateZ(${h / 2}px)`)}
      {face("bottom", w, d, `rotateX(-90deg) translateZ(${h / 2}px)`)}
    </span>
  );
}

/** Uma parte do prédio: entra voando quando é a vez, depois fica no lugar. */
function Part({ state, delay = 0, children }: { state: "done" | "now" | "wait"; delay?: number; children: ReactNode }) {
  return (
    <span className={`cb-part cb-${state}`} style={{ ["--d" as string]: `${0.35 + delay}s` }}>
      {children}
    </span>
  );
}

/** Rótulo de informação ancorado num ponto do palco (em %). */
const CHIPS: { x: number; y: number }[] = [
  { x: 30, y: 74 }, // escritório
  { x: 76, y: 70 }, // fábrica
  { x: 28, y: 46 }, // telão
  { x: 22, y: 20 }, // torre
  { x: 74, y: 40 }, // indicadores
];

export function CompanyBuild({ step, labels, done: doneLabel }: { step: number; labels: string[]; done: string }) {
  const st = (i: number) => (i < step ? "done" : i === step ? "now" : "wait") as "done" | "now" | "wait";
  const last = step === 4;
  return (
    <div className={`cb ${last ? "cb-final" : ""}`} aria-hidden>
      <div className="cb-scale">
        <div className="cb-cam">
          {/* sombra e terreno */}
          <span className="cb-ground" />
          <Box w={176} h={8} d={136} at={[0, 66, 0]} base="cb-slab" />

          {/* 1 · Gestão: escritório térreo com porta */}
          <Part state={st(0)}>
            <Box
              w={100}
              h={34}
              d={78}
              at={[-30, 45, 0]}
              base="cb-wall"
              faces={{ front: "cb-glass", right: "cb-glass", top: "cb-roof" }}
              children={{ front: <span className="cb-door" /> }}
            />
          </Part>

          {/* 2 · Automação: ala da fábrica com engrenagem girando */}
          <Part state={st(1)}>
            <Box
              w={58}
              h={26}
              d={74}
              at={[50, 49, 0]}
              base="cb-metal"
              faces={{ top: "cb-roof cb-sawtooth" }}
              children={{
                front: (
                  <span className="cb-gear">
                    <span />
                  </span>
                ),
                right: <span className="cb-conveyor" />,
              }}
            />
          </Part>

          {/* 3 · Presença digital: segundo andar com telão mostrando um site */}
          <Part state={st(2)}>
            <Box
              w={100}
              h={30}
              d={78}
              at={[-30, 13, 0]}
              base="cb-wall"
              faces={{ right: "cb-glass", top: "cb-roof" }}
              children={{
                front: (
                  <span className="cb-screen">
                    <span className="cb-s-bar" />
                    <span className="cb-s-hero" />
                    <span className="cb-s-btn" />
                    <span className="cb-s-cards">
                      <span />
                      <span />
                      <span />
                    </span>
                  </span>
                ),
              }}
            />
          </Part>

          {/* 4 · Atendimento e marketing: torre de comunicação emitindo sinal */}
          <Part state={st(3)}>
            <Box w={5} h={46} d={5} at={[-64, -25, -20]} base="cb-steel" />
            <Box w={16} h={3} d={16} at={[-64, -47, -20]} base="cb-steel" />
            <span className="cb-signal" style={{ ["--at" as string]: "translate3d(-64px, -52px, -20px)" }}>
              <span />
              <span />
              <span />
            </span>
            <Box w={44} h={12} d={3} at={[-24, -8, 30]} base="cb-sign" children={{ front: <span className="cb-sign-txt">SUA MARCA</span> }} />
          </Part>

          {/* 5 · Indicadores: barras crescendo no telhado da fábrica */}
          <Part state={st(4)}>
            {[12, 20, 30].map((h, i) => (
              <Box
                key={h}
                w={10}
                h={h}
                d={10}
                at={[36 + i * 14, 36 - h / 2, 10]}
                base="cb-bar"
                className="cb-grow"
                style={{ ["--p" as string]: `${i * 0.3}s` }}
              />
            ))}
          </Part>
        </div>
      </div>

      {/* cada encaixe vira informação */}
      {CHIPS.map((c, i) =>
        i === step ? (
          <span key={i} className="cb-chip" style={{ left: `${c.x}%`, top: `${c.y}%` }}>
            <span className="cb-dot" />
            {labels[i]}
          </span>
        ) : null,
      )}
      {last && (
        <span className="cb-chip cb-chip-ok" style={{ left: "50%", top: "97%", ["--d" as string]: "2.4s" }}>
          <span className="cb-dot" />
          {doneLabel}
        </span>
      )}
    </div>
  );
}
