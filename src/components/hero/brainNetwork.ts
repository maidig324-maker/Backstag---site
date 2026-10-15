/**
 * REDE VIVA DE INTELIGÊNCIA EMPRESARIAL — desenho em <canvas>.
 *
 * Não é um cérebro literal: são nós e conexões em profundidade leve que,
 * ao final, se organizam em dois "hemisférios" ligados por um núcleo
 * central. Cinco centros de comando representam as áreas da empresa.
 *
 * Tudo depende de dois números:
 *  - p (0 → 1): o quanto o visitante rolou dentro do topo (a história);
 *  - t (segundos): o tempo, só para a rede "respirar" e os fluxos andarem.
 * Rolar de volta desfaz cada etapa no mesmo ritmo.
 */

export const HUBS = [
  { name: "Gestão", pos: [-0.64, -0.2, 0.14] },
  { name: "Operação", pos: [-0.4, 0.38, -0.1] },
  { name: "Automação", pos: [0.0, -0.6, 0.06] },
  { name: "Marketing", pos: [0.6, -0.28, 0.1] },
  { name: "Tecnologia", pos: [0.44, 0.36, -0.12] },
] as const;

type V3 = [number, number, number];
type Node = { p: V3; off: V3; r: number; delay: number; phase: number; hub: number };
type Edge = { a: number; b: number; delay: number; main: boolean; ring?: boolean };
type Flow = { e: number; speed: number; phase: number; dir: 1 | -1 };

export type Network = { nodes: Node[]; edges: Edge[]; flows: Flow[]; core: number };

/** gerador pseudoaleatório com semente: a rede é sempre a mesma */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const dist = (a: V3, b: V3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

export function buildNetwork(count: number): Network {
  const rand = rng(20261015);
  const nodes: Node[] = [];
  // núcleo central + cinco centros de comando
  nodes.push({ p: [0, 0.02, 0], off: [0, 0, 0], r: 1, delay: 0.06, phase: 0, hub: -2 });
  HUBS.forEach((h, i) => nodes.push({ p: [...h.pos] as V3, off: [(rand() - 0.5) * 0.5, (rand() - 0.5) * 0.4, (rand() - 0.5) * 0.4], r: 1, delay: 0.03 + i * 0.025, phase: rand() * 6.28, hub: i }));
  // pontos menores dentro de dois "hemisférios" com um sulco no meio
  let guard = 0;
  while (nodes.length < count + 6 && guard++ < 20000) {
    const x = rand() * 2.2 - 1.1, y = rand() * 1.5 - 0.75, z = rand() * 1.1 - 0.55;
    const inA = ((x + 0.44) / 0.6) ** 2 + (y / 0.68) ** 2 + (z / 0.5) ** 2 < 1;
    const inB = ((x - 0.44) / 0.6) ** 2 + (y / 0.68) ** 2 + (z / 0.5) ** 2 < 1;
    if (!(inA || inB) || Math.abs(x) < 0.07 || y > 0.56) continue;
    const p: V3 = [x, y, z];
    if (nodes.some((n) => dist(n.p, p) < 0.12)) continue;
    nodes.push({ p, off: [(rand() - 0.5) * 0.9, (rand() - 0.5) * 0.7, (rand() - 0.5) * 0.6], r: 0.35 + rand() * 0.45, delay: 0, phase: rand() * 6.28, hub: -1 });
  }
  const hubIdx = HUBS.map((_, i) => i + 1);
  const nearestHub = (p: V3) => hubIdx.reduce((best, h) => (dist(nodes[h].p, p) < dist(nodes[best].p, p) ? h : best), hubIdx[0]);
  // os pontos aparecem a partir dos centros, de dentro para fora
  for (const n of nodes) if (n.hub === -1) n.delay = 0.1 + Math.min(1, dist(n.p, nodes[nearestHub(n.p)].p) / 0.7) * 0.22 + rand() * 0.04;

  const edges: Edge[] = [];
  const seen = new Set<string>();
  const add = (a: number, b: number, main: boolean, delay: number) => {
    const k = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (a === b || seen.has(k)) return;
    seen.add(k);
    edges.push({ a, b, main, delay });
  };
  // núcleo ↔ centros e o anel entre os centros
  hubIdx.forEach((h, i) => add(0, h, true, 0.16 + i * 0.03));
  [[1, 3], [3, 4], [4, 5], [5, 2], [2, 1]].forEach(([a, b], i) => {
    add(a, b, true, 0.3 + i * 0.025);
    edges[edges.length - 1].ring = true;
  });
  // cada ponto liga aos vizinhos mais próximos; parte deles ao centro mais próximo
  for (let i = 6; i < nodes.length; i++) {
    const near = nodes
      .map((n, j) => ({ j, d: dist(n.p, nodes[i].p) }))
      .filter((o) => o.j !== i && o.j >= 6)
      .sort((a, b) => a.d - b.d)
      .slice(0, 3);
    const base = nodes[i].delay + 0.08;
    near.forEach((o, k) => o.d < (k < 2 ? 0.42 : 0.3) && add(i, o.j, false, base + rand() * 0.06));
    const h = nearestHub(nodes[i].p);
    if (dist(nodes[h].p, nodes[i].p) < 0.5 && rand() < 0.55) add(i, h, false, base + 0.04);
  }
  // fluxos: pulsos de luz que percorrem as conexões (os principais vão ao núcleo)
  const flows: Flow[] = [];
  edges.forEach((e, i) => {
    const n = e.main ? 2 : rand() < 0.28 ? 1 : 0;
    for (let k = 0; k < n; k++) flows.push({ e: i, speed: 0.18 + rand() * 0.22, phase: rand(), dir: e.a === 0 ? -1 : 1 });
  });
  return { nodes, edges, flows, core: 0 };
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const ease = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/** Etapas da história, em frações da rolagem do topo. */
export function stages(p: number) {
  return {
    hubs: ease(seg(p, 0.0, 0.2)), // 1. os pontos principais aparecem
    links: p, // 2. as conexões se formam (cada uma no seu atraso)
    flow: ease(seg(p, 0.3, 0.55)), // 3. fluxos percorrem as conexões
    core: ease(seg(p, 0.48, 0.78)), // 4. núcleos ganham força
    order: easeInOut(seg(p, 0.5, 0.92)), // 5. a rede se organiza e se integra
    whole: ease(seg(p, 0.86, 1)), // 6. o cérebro empresarial completo
  };
}

export type Frame = { cx: number; cy: number; scale: number; dpr: number };
export type HubPoint = { x: number; y: number; a: number };

let glow: HTMLCanvasElement | null = null;
function glowSprite() {
  if (glow) return glow;
  glow = document.createElement("canvas");
  glow.width = glow.height = 128;
  const g = glow.getContext("2d")!;
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, "rgba(255,236,190,1)");
  grd.addColorStop(0.18, "rgba(240,199,102,0.55)");
  grd.addColorStop(0.5, "rgba(215,168,62,0.12)");
  grd.addColorStop(1, "rgba(215,168,62,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  return glow;
}

/** Desenha um quadro e devolve a posição na tela de cada centro (para os nomes). */
export function drawNetwork(ctx: CanvasRenderingContext2D, net: Network, f: Frame, p: number, t: number, w: number, h: number): HubPoint[] {
  const s = stages(p);
  const { dpr } = f;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w * dpr, h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // rotação lenta: a profundidade aparece sem parecer objeto 3D
  const ay = -0.32 + p * 0.5 + Math.sin(t * 0.12) * 0.035;
  const ax = 0.14;
  const cy_ = Math.cos(ay), sy_ = Math.sin(ay), cx_ = Math.cos(ax), sx_ = Math.sin(ax);
  const loose = 1 - s.order;
  const pts = net.nodes.map((n) => {
    const b = 0.012 + loose * 0.02; // a rede respira
    const x = n.p[0] + n.off[0] * loose + Math.sin(t * 0.6 + n.phase) * b;
    const y = n.p[1] + n.off[1] * loose + Math.cos(t * 0.5 + n.phase) * b;
    const z = n.p[2] + n.off[2] * loose;
    const X = x * cy_ - z * sy_;
    let Z = x * sy_ + z * cy_;
    const Y = y * cx_ - Z * sx_;
    Z = y * sx_ + Z * cx_;
    const k = 2.8 / (2.8 + Z);
    return { x: f.cx + X * f.scale * k, y: f.cy + Y * f.scale * k, k, depth: clamp01(0.55 + (0.5 - Z) * 0.6) };
  });

  // conexões
  ctx.lineCap = "round";
  net.edges.forEach((e) => {
    const g = ease(seg(s.links, e.delay, e.delay + 0.16));
    if (g <= 0) return;
    const A = pts[e.a], B = pts[e.b];
    const x2 = A.x + (B.x - A.x) * g, y2 = A.y + (B.y - A.y) * g;
    const d = (A.depth + B.depth) / 2;
    if (e.main) {
      const k = e.ring ? 0.45 : 1;
      ctx.strokeStyle = `rgba(226,186,92,${(0.22 + s.core * 0.3 + s.whole * 0.1) * d * k})`;
      ctx.lineWidth = e.ring ? 0.7 : 0.9 + s.core * 0.4;
    } else {
      ctx.strokeStyle = `rgba(232,230,224,${(0.07 + s.order * 0.07 + s.whole * 0.04) * d})`;
      ctx.lineWidth = 0.7;
    }
    ctx.beginPath();
    ctx.moveTo(A.x, A.y);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  });

  // pontos
  const spr = glowSprite();
  const hubPts: HubPoint[] = [];
  net.nodes.forEach((n, i) => {
    const P = pts[i];
    if (n.hub === -1) {
      // pontos menores: poeira discreta no início, nítidos quando conectados
      const on = ease(seg(p, n.delay, n.delay + 0.12));
      const a = (0.3 + on * 0.55) * P.depth;
      ctx.fillStyle = `rgba(245,245,242,${a})`;
      ctx.beginPath();
      ctx.arc(P.x, P.y, (0.9 + n.r * 1.4 * on) * P.k, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    // centros de comando e núcleo
    // já visíveis (discretos) ao abrir; acendem com a rolagem
    const lit = s.hubs * ease(seg(p, n.delay, n.delay + 0.12));
    const on = 0.42 + 0.58 * lit;
    const isCore = n.hub === -2;
    const power = isCore ? 0.6 + s.core * 1.4 + s.whole * 0.5 : 0.7 + s.core * 0.6;
    const pulse = 1 + Math.sin(t * 1.6 + n.phase) * 0.06 * on;
    const R = (isCore ? 3.2 : 2.6) * P.k * pulse;
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = Math.min(1, on * (isCore ? 0.35 + s.core * 0.55 : 0.5) * P.depth);
    const gs = R * (isCore ? 10 + s.core * 10 : 9) * power * 0.6;
    ctx.drawImage(spr, P.x - gs / 2, P.y - gs / 2, gs, gs);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = isCore ? `rgba(255,240,205,${on})` : `rgba(240,199,102,${on})`;
    ctx.beginPath();
    ctx.arc(P.x, P.y, R, 0, Math.PI * 2);
    ctx.fill();
    // anel fino em volta dos centros
    ctx.strokeStyle = `rgba(240,199,102,${0.35 * on})`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(P.x, P.y, R * 2.6, 0, Math.PI * 2);
    ctx.stroke();
    if (n.hub >= 0) hubPts[n.hub] = { x: P.x, y: P.y, a: lit };
  });

  // fluxos de luz percorrendo as conexões
  if (s.flow > 0) {
    ctx.globalCompositeOperation = "lighter";
    net.flows.forEach((fl) => {
      const e = net.edges[fl.e];
      const g = seg(s.links, e.delay, e.delay + 0.16);
      if (g < 1) return;
      let u = (t * fl.speed + fl.phase) % 1;
      if (fl.dir < 0) u = 1 - u;
      const A = pts[e.a], B = pts[e.b];
      const x = A.x + (B.x - A.x) * u, y = A.y + (B.y - A.y) * u;
      const a = s.flow * Math.sin(Math.PI * u) * (e.main ? 0.9 : 0.55) * ((A.depth + B.depth) / 2);
      const size = (e.main ? 14 : 9) * ((A.k + B.k) / 2);
      ctx.globalAlpha = a;
      ctx.drawImage(spr, x - size / 2, y - size / 2, size, size);
    });
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  // integração final: uma onda suave sai do núcleo
  if (s.whole > 0) {
    const C = pts[net.core];
    const wave = (t * 0.35) % 1;
    ctx.strokeStyle = `rgba(240,199,102,${0.22 * s.whole * (1 - wave)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(C.x, C.y, f.scale * (0.15 + wave * 0.95), 0, Math.PI * 2);
    ctx.stroke();
  }
  return hubPts;
}
