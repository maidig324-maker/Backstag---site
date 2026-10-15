"use client";

import { useEffect, useRef } from "react";

/**
 * Rede de partículas do cenário: pontos de luz que flutuam devagar e se
 * conectam com linhas finas quando se aproximam. Leve para o celular:
 * poucas partículas, ~30 fps, resolução limitada, pausa com a aba oculta
 * e quadro estático com redução de movimento.
 */
export function AmbientParticles() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0, H = 0, raf = 0, last = 0;
    type P = { x: number; y: number; vx: number; vy: number; z: number; r: number; gold: boolean };
    let pts: P[] = [];

    const resize = () => {
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = W < 768 ? 16 : 40;
      pts = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.12,
        vy: -0.04 - Math.random() * 0.1,
        z: 0.3 + Math.random() * 0.7, // profundidade: parallax e brilho
        r: 0.6 + Math.random() * 1.1,
        gold: Math.random() < 0.55,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const sy = window.scrollY;
      const link = W < 768 ? 95 : 130;
      const pos = pts.map((p) => {
        // parallax suave com a rolagem (mais perto = move mais)
        let y = (p.y - sy * 0.06 * p.z) % H;
        if (y < 0) y += H;
        return { x: p.x, y, p };
      });
      ctx.lineWidth = 0.6;
      for (let i = 0; i < pos.length; i++) {
        for (let j = i + 1; j < pos.length; j++) {
          const dx = pos[i].x - pos[j].x, dy = pos[i].y - pos[j].y;
          const d = Math.hypot(dx, dy);
          if (d < link) {
            ctx.strokeStyle = `rgba(215,168,62,${(0.13 * (1 - d / link) * Math.min(pos[i].p.z, pos[j].p.z)).toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(pos[i].x, pos[i].y);
            ctx.lineTo(pos[j].x, pos[j].y);
            ctx.stroke();
          }
        }
      }
      for (const { x, y, p } of pos) {
        ctx.fillStyle = p.gold ? `rgba(240,199,102,${(0.25 + p.z * 0.45).toFixed(2)})` : `rgba(245,245,242,${(0.15 + p.z * 0.3).toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(x, y, p.r * (0.7 + p.z * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = (t: number) => {
      raf = requestAnimationFrame(step);
      if (t - last < 33) return; // ~30 fps
      last = t;
      for (const p of pts) {
        p.x += p.vx * p.z * 2;
        p.y += p.vy * p.z * 2;
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
      }
      draw();
    };

    resize();
    if (reduced) draw();
    else raf = requestAnimationFrame(step);

    const onResize = () => {
      resize();
      if (reduced) draw();
    };
    const onScroll = () => reduced && draw();
    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduced) raf = requestAnimationFrame(step);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="absolute inset-0" />;
}
