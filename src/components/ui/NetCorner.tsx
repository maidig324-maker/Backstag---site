/**
 * Fragmento da rede do topo (BACKSTAG 2026): poucos pontos e linhas finas
 * num canto da seção, com um fluxo de luz passando devagar. Decorativo,
 * discreto e leve (SVG + CSS). A rede do topo continua pelo site sem
 * virar fundo.
 */
const NODES: [number, number, number][] = [
  [18, 30, 3.2], [74, 14, 2.2], [120, 48, 4.2], [168, 22, 2.4], [212, 58, 2.8],
  [62, 82, 2.4], [146, 104, 3], [236, 120, 2.2], [102, 150, 2.6], [190, 170, 3.4],
];
const EDGES: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 2], [2, 6], [6, 4], [4, 7], [6, 8], [8, 9], [6, 9], [9, 7]];
const FLOW = [[0, 5], [5, 2], [2, 6], [6, 9]] as const; // caminho do pulso

type Corner = "tl" | "tr" | "bl" | "br";

export function NetCorner({ corner = "tr", className = "" }: { corner?: Corner; className?: string }) {
  const flip = `${corner.includes("l") ? "scale(-1," : "scale(1,"}${corner.includes("b") ? "-1)" : "1)"}`;
  const pos = { tl: "left-0 top-0", tr: "right-0 top-0", bl: "left-0 bottom-0", br: "right-0 bottom-0" }[corner];
  const path = FLOW.map(([a, b], i) => `${i === 0 ? `M${NODES[a][0]} ${NODES[a][1]}` : ""} L${NODES[b][0]} ${NODES[b][1]}`).join(" ");
  return (
    <svg aria-hidden viewBox="0 0 260 200" className={`nc-net pointer-events-none absolute ${pos} ${className}`} style={{ transform: flip }} fill="none">
      {EDGES.map(([a, b], i) => (
        <line key={i} x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]} className="nn-edge" />
      ))}
      <path d={path} pathLength={1} className="nn-flow" />
      {NODES.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} className={i % 3 === 0 ? "nn-node nn-hub" : "nn-node"} style={{ animationDelay: `${i * 0.45}s` }} />
      ))}
    </svg>
  );
}
