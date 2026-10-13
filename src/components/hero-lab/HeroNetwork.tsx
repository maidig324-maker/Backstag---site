"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef } from "react";
import { hero2026 } from "@/content/hero-2026";
import { ConceptTag, FrameMarks, HeadlineTech, prefersReducedMotion, SubAndCtas } from "./HeroCopy";

/**
 * ALTERNATIVA A — "REDE"
 * Pontos dispersos se organizam numa estrutura conectada (do caos à
 * estrutura). Pulsos dourados percorrem as conexões como processos em
 * execução. O cursor/toque ilumina e conecta os pontos próximos.
 *
 * Canvas 2D puro, sem bibliotecas: pausa fora da tela e com a aba oculta,
 * resolução limitada a 2x e versão estática com redução de movimento.
 */

type Node = {
  sx: number; sy: number; // posição inicial (dispersa)
  tx: number; ty: number; // posição na estrutura
  x: number; y: number;
  phase: number;
  z: number; // profundidade para a travessia no scroll
  hub: string | null;
  glow: number;
};
type Edge = { a: number; b: number; delay: number };
type Packet = { e: number; t: number; speed: number; dir: 1 | -1 };

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const ease = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

function buildGraph(W: number, H: number) {
  const r = rng(2026);
  const desktop = W >= 768;
  const cols = desktop ? 8 : 5;
  const rows = desktop ? 5 : 5;
  const x0 = desktop ? W * 0.42 : W * 0.08;
  const x1 = desktop ? W - Math.max(48, W * 0.05) : W * 0.92;
  const y0 = desktop ? H * 0.17 : H * 0.2;
  const y1 = desktop ? H * 0.52 : H * 0.47;
  const dx = (x1 - x0) / (cols - 1);
  const dy = (y1 - y0) / (rows - 1);

  const grid: (number | null)[][] = [];
  const nodes: Node[] = [];
  // Hubs: posições fixas e bem distribuídas para os rótulos.
  const hubCells = desktop
    ? [[1, 1], [5, 0], [3, 2], [7, 2], [2, 4], [6, 4]]
    : [[1, 0], [3, 1], [0, 2], [4, 3], [2, 3], [1, 4]];

  for (let c = 0; c < cols; c++) {
    grid[c] = [];
    for (let rr = 0; rr < rows; rr++) {
      const hubIdx = hubCells.findIndex(([hc, hr]) => hc === c && hr === rr);
      if (hubIdx < 0 && r() > 0.8) {
        grid[c][rr] = null;
        continue;
      }
      const tx = x0 + c * dx + (r() - 0.5) * dx * 0.16;
      const ty = y0 + rr * dy + (r() - 0.5) * dy * 0.16;
      nodes.push({
        sx: r() * W,
        sy: r() * H,
        tx,
        ty,
        x: 0,
        y: 0,
        phase: r() * Math.PI * 2,
        z: r(),
        hub: hubIdx >= 0 ? hero2026.networkLabels[hubIdx] ?? null : null,
        glow: 0,
      });
      grid[c][rr] = nodes.length - 1;
    }
  }

  const edges: Edge[] = [];
  const add = (a: number | null | undefined, b: number | null | undefined, p: number) => {
    if (a == null || b == null || r() > p) return;
    edges.push({ a, b, delay: r() * 0.5 });
  };
  for (let c = 0; c < cols; c++)
    for (let rr = 0; rr < rows; rr++) {
      const n = grid[c][rr];
      add(n, grid[c + 1]?.[rr], 0.88);
      add(n, grid[c]?.[rr + 1], 0.74);
      add(n, grid[c + 1]?.[rr + 1], 0.16);
    }

  const packets: Packet[] = Array.from({ length: desktop ? 14 : 7 }, () => ({
    e: Math.floor(r() * edges.length),
    t: r(),
    speed: 0.25 + r() * 0.35,
    dir: r() > 0.5 ? 1 : -1,
  }));
  return { nodes, edges, packets, desktop, x0, x1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
}

export function HeroNetwork() {
  const sectionRef = useRef<HTMLElement>(null);
  // O texto recua em profundidade ao rolar
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const copyY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);
  const copyO = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const section = sectionRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    let W = 0, H = 0, dpr = 1;
    let graph = buildGraph(1, 1);
    let start = performance.now();
    let raf = 0;
    let monoFont = "monospace";
    let visible = true;
    const pointer = { x: -9999, y: -9999, active: false };
    // Toques no celular: anel de pulso que acende a estrutura
    const ripples: { x: number; y: number; t0: number }[] = [];
    let touchTimer = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      graph = buildGraph(W, H);
      monoFont = (getComputedStyle(document.documentElement).getPropertyValue("--font-geist-mono").trim() || "ui-monospace") + ", monospace";
    };

    const draw = (now: number) => {
      const { nodes, edges, packets, desktop, x0, x1, cx, cy } = graph;
      const t = reduced ? 1 : ease((now - start) / 2600);
      const time = now / 1000;
      ctx.clearRect(0, 0, W, H);

      // Travessia em profundidade: ao rolar, a estrutura se abre em direção ao visitante
      const rect = section.getBoundingClientRect();
      const p = reduced ? 0 : Math.min(1, Math.max(0, -rect.top / (rect.height * 0.9)));
      ctx.globalAlpha = 1 - p * 0.85;

      // Varredura de diagnóstico: uma linha percorre a estrutura em ciclos
      const cycle = 7;
      const sweep = (time % cycle) / cycle;
      const scanX = x0 - 40 + sweep * (x1 - x0 + 80);
      const scanOn = !reduced && t > 0.95 && sweep < 0.92;
      if (scanOn) {
        const grad = ctx.createLinearGradient(scanX - 60, 0, scanX, 0);
        grad.addColorStop(0, "rgba(215,168,62,0)");
        grad.addColorStop(1, "rgba(215,168,62,0.07)");
        ctx.fillStyle = grad;
        ctx.fillRect(scanX - 60, desktop ? H * 0.12 : H * 0.15, 60, (desktop ? H * 0.45 : H * 0.37));
        ctx.fillStyle = "rgba(240,199,102,0.35)";
        ctx.fillRect(scanX, desktop ? H * 0.12 : H * 0.15, 1, desktop ? H * 0.45 : H * 0.37);
      }

      // anéis de toque
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        const k = (now - rp.t0) / 1100;
        if (k >= 1) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.strokeStyle = `rgba(240,199,102,${0.6 * (1 - k)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, 12 + ease(k) * 170, 0, Math.PI * 2);
        ctx.stroke();
      }

      // posições: interpolação dispersão → estrutura + respiração sutil
      for (const n of nodes) {
        const drift = reduced ? 0 : 2.2;
        let x = n.sx + (n.tx - n.sx) * t + Math.sin(time * 0.6 + n.phase) * drift;
        let y = n.sy + (n.ty - n.sy) * t + Math.cos(time * 0.5 + n.phase) * drift;
        // abertura em profundidade conforme o scroll
        if (p > 0) {
          const f = 1 + p * (0.5 + n.z * 1.6);
          x = cx + (x - cx) * f;
          y = cy + (y - cy) * f - p * 60 * n.z;
        }
        let target = 0;
        if (scanOn && Math.abs(x - scanX) < 26) target = Math.max(target, 0.55 * (1 - Math.abs(x - scanX) / 26));
        for (const rp of ripples) {
          const k = (now - rp.t0) / 1100;
          const radius = 12 + ease(k) * 170;
          const d = Math.abs(Math.hypot(x - rp.x, y - rp.y) - radius);
          if (d < 24) target = Math.max(target, 1 - d / 24);
        }
        if (pointer.active) {
          const ddx = x - pointer.x, ddy = y - pointer.y;
          const d = Math.hypot(ddx, ddy);
          const R = desktop ? 190 : 130;
          if (d < R) {
            const f = 1 - d / R;
            x += (ddx / (d || 1)) * f * 14;
            y += (ddy / (d || 1)) * f * 14;
            target = Math.max(target, f);
          }
        }
        n.glow += (target - n.glow) * 0.12;
        n.x = x;
        n.y = y;
      }

      // conexões
      ctx.lineWidth = 1;
      for (const e of edges) {
        const a = nodes[e.a], b = nodes[e.b];
        const k = Math.max(0, Math.min(1, (t - 0.35 - e.delay * 0.6) / 0.4));
        if (k <= 0) continue;
        const g = Math.max(a.glow, b.glow);
        ctx.strokeStyle = g > 0.02 ? `rgba(215,168,62,${0.12 + g * 0.5})` : `rgba(245,245,242,${0.09 * k})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k);
        ctx.stroke();
      }

      // ligações do cursor aos pontos próximos
      if (pointer.active) {
        const near = nodes
          .map((n, i) => ({ i, d: Math.hypot(n.x - pointer.x, n.y - pointer.y) }))
          .filter((o) => o.d < (desktop ? 220 : 150))
          .sort((p, q) => p.d - q.d)
          .slice(0, 3);
        for (const o of near) {
          const n = nodes[o.i];
          ctx.strokeStyle = `rgba(240,199,102,${0.45 * (1 - o.d / 220)})`;
          ctx.setLineDash([3, 4]);
          ctx.beginPath();
          ctx.moveTo(pointer.x, pointer.y);
          ctx.lineTo(n.x, n.y);
          ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.strokeStyle = "rgba(240,199,102,0.7)";
        ctx.strokeRect(pointer.x - 4, pointer.y - 4, 8, 8);
      }

      // pulsos: processos percorrendo a estrutura
      if (t > 0.85 && edges.length) {
        for (const p of packets) {
          if (!reduced) p.t += (p.speed / 60) * p.dir;
          if (p.t > 1 || p.t < 0) {
            p.e = Math.floor(Math.random() * edges.length);
            p.t = p.dir === 1 ? 0 : 1;
          }
          const e = edges[p.e];
          const a = nodes[e.a], b = nodes[e.b];
          const px = a.x + (b.x - a.x) * p.t;
          const py = a.y + (b.y - a.y) * p.t;
          const tail = 0.12 * p.dir;
          const qx = a.x + (b.x - a.x) * Math.max(0, Math.min(1, p.t - tail));
          const qy = a.y + (b.y - a.y) * Math.max(0, Math.min(1, p.t - tail));
          const grad = ctx.createLinearGradient(qx, qy, px, py);
          grad.addColorStop(0, "rgba(215,168,62,0)");
          grad.addColorStop(1, "rgba(240,199,102,0.95)");
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(qx, qy);
          ctx.lineTo(px, py);
          ctx.stroke();
          ctx.fillStyle = "#F0C766";
          ctx.fillRect(px - 1.5, py - 1.5, 3, 3);
        }
        ctx.lineWidth = 1;
      }

      // pontos e rótulos
      ctx.font = `500 10px ${monoFont}`;
      if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "1.5px";
      for (const n of nodes) {
        const g = n.glow;
        if (n.hub) {
          ctx.strokeStyle = `rgba(215,168,62,${0.55 + g * 0.45})`;
          ctx.strokeRect(n.x - 5, n.y - 5, 10, 10);
          ctx.fillStyle = "#D7A83E";
          ctx.fillRect(n.x - 2, n.y - 2, 4, 4);
          if (t > 0.9) {
            ctx.fillStyle = `rgba(245,245,242,${0.5 + g * 0.5})`;
            const label = n.hub.toUpperCase();
            const w = ctx.measureText(label).width;
            // rótulo vira para a esquerda perto da borda direita
            const lx = n.x + 10 + w > W - 16 ? n.x - 10 - w : n.x + 10;
            ctx.fillText(label, lx, n.y - 8);
          }
        } else {
          const s = 2 + g * 2;
          ctx.fillStyle = g > 0.05 ? `rgba(240,199,102,${0.6 + g * 0.4})` : "rgba(245,245,242,0.42)";
          ctx.fillRect(n.x - s / 2, n.y - s / 2, s, s);
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      draw(now);
      if (!reduced && visible) raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
    };

    resize();
    start = performance.now();
    kick();

    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) draw(performance.now());
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && !document.hidden;
      if (visible) kick();
    });
    io.observe(section);
    const onVis = () => {
      visible = !document.hidden;
      if (visible) kick();
    };
    document.addEventListener("visibilitychange", onVis);

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      const rect = canvas.getBoundingClientRect();
      ripples.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, t0: performance.now() });
      if (ripples.length > 4) ripples.shift();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
      window.clearTimeout(touchTimer);
      touchTimer = window.setTimeout(() => (pointer.active = false), 1400);
      if (reduced) draw(performance.now());
    };
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
      if (reduced) draw(performance.now());
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.active = false;
      if (reduced) draw(performance.now());
    };
    section.addEventListener("pointerdown", onDown);
    section.addEventListener("pointermove", onMove);
    section.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      section.removeEventListener("pointerdown", onDown);
      section.removeEventListener("pointermove", onMove);
      window.clearTimeout(touchTimer);
      section.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <section
      id="topo"
      ref={sectionRef}
      aria-label="Apresentação"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        className="absolute inset-0 -z-10 h-full w-full touch-pan-y"
      />
      <FrameMarks />

      <motion.div style={{ y: copyY, opacity: copyO }} className="container-x flex flex-1 flex-col justify-between pb-10 pt-24 md:pb-14 md:pt-32">
        <ConceptTag />
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <HeadlineTech className="text-[clamp(3.6rem,min(10.5vw,17vh),11.5rem)] md:col-span-8" />
          <SubAndCtas className="md:col-span-4 md:pb-3" stacked />
        </div>
      </motion.div>
    </section>
  );
}
