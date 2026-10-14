/**
 * Símbolos 3D da Descoberta — um por desafio, só CSS 3D.
 * Cada símbolo começa no estado "problema" e, quando a tela fica ativa
 * (classe .sym-on num ancestral), transforma-se no estado "solução".
 * Palco fixo de 200×200 px, escalado por --k.
 */
import type { CSSProperties, ReactNode } from "react";

type BoxProps = { w: number; h: number; d: number; style?: CSSProperties; className?: string; faceClass?: string };

/** Caixa 3D com seis faces. */
function Box({ w, h, d, style, className = "", faceClass = "" }: BoxProps) {
  const face = (fw: number, fh: number, t: string) => (
    <span
      className={`sym-face ${faceClass}`}
      style={{ width: fw, height: fh, left: (w - fw) / 2, top: (h - fh) / 2, transform: t }}
    />
  );
  return (
    <span className={`sym-box ${className}`} style={{ width: w, height: h, marginLeft: -w / 2, marginTop: -h / 2, ...style }}>
      {face(w, h, `translateZ(${d / 2}px)`)}
      {face(w, h, `rotateY(180deg) translateZ(${d / 2}px)`)}
      {face(d, h, `rotateY(90deg) translateZ(${w / 2}px)`)}
      {face(d, h, `rotateY(-90deg) translateZ(${w / 2}px)`)}
      {face(w, d, `rotateX(90deg) translateZ(${h / 2}px)`)}
      {face(w, d, `rotateX(-90deg) translateZ(${h / 2}px)`)}
    </span>
  );
}

const v = (o: Record<string, string | number>) => o as CSSProperties;

function Stage({ children, tilt = true }: { children: ReactNode; tilt?: boolean }) {
  return (
    <div className="sym" aria-hidden>
      <div className="sym-scale">
        <div className={tilt ? "sym-stage sym-sway" : "sym-stage"}>{children}</div>
      </div>
    </div>
  );
}

/* 01 · Organização: peças soltas se encaixam num bloco sólido */
const scatter = [
  [-70, -55, 30, 40], [62, -66, -20, -35], [-58, 48, -40, 25], [74, 40, 35, -50],
  [-15, -80, -55, 70], [10, 70, 55, -20], [-84, 0, 0, 60], [84, -6, -10, -70],
];
function SymOrganize() {
  const c = 34;
  const o = c / 2 + 2;
  return (
    <Stage>
      {scatter.map(([x, y, z, r], i) => {
        const tx = i & 1 ? o : -o, ty = i & 2 ? o : -o, tz = i & 4 ? o : -o;
        return (
          <Box
            key={i}
            w={c}
            h={c}
            d={c}
            className="sym-move"
            style={v({
              "--off": `translate3d(${x}px, ${y}px, ${z}px) rotateX(${r}deg) rotateY(${r * 1.3}deg)`,
              "--on": `translate3d(${tx}px, ${ty}px, ${tz}px) rotateX(0deg) rotateY(0deg)`,
              "--d": `${0.15 + i * 0.07}s`,
            })}
          />
        );
      })}
    </Stage>
  );
}

/* 02 · Retrabalho → fluxo: o círculo vicioso se abre numa linha de produção */
function SymFlow() {
  const n = 12;
  return (
    <Stage>
      {Array.from({ length: n }, (_, i) => (
        <span
          key={i}
          className="sym-tile sym-move"
          style={v({
            "--off": `rotateY(${i * (360 / n)}deg) translateZ(66px) translateX(0px)`,
            "--on": `rotateY(0deg) translateZ(0px) translateX(${(i - (n - 1) / 2) * 15}px)`,
            "--d": `${0.1 + i * 0.04}s`,
            "--p": `${i * 0.12}s`,
          })}
        />
      ))}
      {/* seta de saída do fluxo */}
      <span className="sym-arrow" />
    </Stage>
  );
}

/* 03 · Presença digital: camadas desalinhadas viram um site estruturado */
function SymSite() {
  const layers = [
    { r: 10, x: -14, y: 8 },
    { r: -8, x: 12, y: -10 },
    { r: 14, x: 8, y: 12 },
    { r: -12, x: -10, y: -6 },
  ];
  return (
    <Stage>
      <div className="sym-plane" style={{ transform: "scale(0.82) rotateX(58deg) rotateZ(-32deg)" }}>
        {layers.map((l, i) => (
          <span
            key={i}
            className="sym-layer sym-move"
            style={v({
              "--off": `translate3d(${l.x}px, ${l.y}px, ${i * 3}px) rotateZ(${l.r}deg)`,
              "--on": `translate3d(0px, 0px, ${i * 30}px) rotateZ(0deg)`,
              "--d": `${0.15 + i * 0.12}s`,
            })}
          >
            {i === 1 && <span className="sym-ui" style={{ inset: "8% 8% auto 8%", height: "10%" }} />}
            {i === 2 && (
              <>
                <span className="sym-ui" style={{ left: "8%", top: "26%", width: "46%", height: "10%" }} />
                <span className="sym-ui sym-ui-gold" style={{ left: "8%", top: "44%", width: "24%", height: "10%" }} />
              </>
            )}
            {i === 3 &&
              [8, 38, 68].map((x) => (
                <span key={x} className="sym-ui" style={{ left: `${x}%`, top: "64%", width: "24%", height: "24%" }} />
              ))}
          </span>
        ))}
      </div>
    </Stage>
  );
}

/* 04 · Áreas desconectadas: três frentes distantes se aproximam e se ligam */
function SymConnect() {
  const ang = [-90, 30, 150].map((a) => (a * Math.PI) / 180);
  const near = 54, far = 88;
  const pts = ang.map((a) => [Math.cos(a) * near, Math.sin(a) * near]);
  const lines = [0, 1, 2].map((i) => {
    const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % 3];
    return { x: x1, y: y1, len: Math.hypot(x2 - x1, y2 - y1), rot: (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI };
  });
  return (
    <Stage tilt={false}>
      <div className="sym-plane sym-orbit" style={{ transform: "rotateX(62deg)" }}>
        <span className="sym-ring" />
        {lines.map((l, i) => (
          <span
            key={i}
            className="sym-link"
            style={v({ left: 100 + l.x, top: 100 + l.y, width: l.len, transform: `rotateZ(${l.rot}deg)`, "--d": `${0.9 + i * 0.15}s` })}
          />
        ))}
        {ang.map((a, i) => (
          <Box
            key={i}
            w={24}
            h={24}
            d={24}
            className="sym-move"
            style={v({
              left: 100,
              top: 100,
              "--off": `translate3d(${Math.cos(a) * far}px, ${Math.sin(a) * far}px, 12px)`,
              "--on": `translate3d(${pts[i][0]}px, ${pts[i][1]}px, 12px)`,
              "--d": `${0.15 + i * 0.1}s`,
            })}
          />
        ))}
        {/* núcleo de informação compartilhada */}
        <Box
          w={18}
          h={18}
          d={18}
          className="sym-move"
          faceClass="sym-face-gold"
          style={v({ left: 100, top: 100, "--off": "translate3d(0px, 0px, -40px) scale(0.2)", "--on": "translate3d(0px, 0px, 34px) scale(1)", "--d": "1.2s" })}
        />
      </div>
    </Stage>
  );
}

/* 05 · Acompanhamento: barras irregulares viram uma evolução consistente */
function SymGrowth() {
  const off = [0.55, 0.25, 0.7, 0.35, 0.45];
  const on = [0.3, 0.45, 0.6, 0.78, 1];
  return (
    <Stage>
      <div className="sym-plane" style={{ transform: "translateY(40px) rotateX(90deg)" }}>
        <span className="sym-grid" />
      </div>
      {off.map((k, i) => (
        <Box
          key={i}
          w={20}
          h={110}
          d={20}
          className="sym-move sym-bar"
          faceClass={i === 4 ? "sym-face-accent" : ""}
          style={v({
            left: 100 + (i - 2) * 30,
            top: 100 + 40 - 55,
            "--off": `translateZ(${(i - 2) * -6}px) scaleY(${k})`,
            "--on": `translateZ(${(i - 2) * -6}px) scaleY(${on[i]})`,
            "--d": `${0.2 + i * 0.1}s`,
          })}
        />
      ))}
    </Stage>
  );
}

export const discoverySymbols = [SymOrganize, SymFlow, SymSite, SymConnect, SymGrowth];
