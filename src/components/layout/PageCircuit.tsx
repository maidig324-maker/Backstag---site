"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Trilha de circuito que percorre a página inteira por trás do conteúdo,
 * ligando um bloco ao outro (mesma linguagem das linhas da cena do
 * fundador). O traço se desenha conforme a rolagem, faz curvas em 45°
 * alternando os lados, tem nós em cada seção e pulsos de luz correndo
 * pela parte já desenhada.
 */
export function PageCircuit() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const drawRef = useRef<SVGPathElement>(null);
  const maskRef = useRef<SVGPathElement>(null);
  const [geo, setGeo] = useState<{ d: string; w: number; h: number; nodes: [number, number][]; branches: string[] } | null>(null);

  // monta o traçado a partir da posição real das seções
  useEffect(() => {
    const wrap = wrapRef.current!;
    const host = wrap.parentElement!;
    const build = () => {
      const W = host.clientWidth;
      const H = host.scrollHeight;
      const mobile = W < 768;
      const gutter = mobile ? 9 : Math.max(28, (W - 1408) / 2 + 16);
      const L = gutter, R = W - gutter;
      const r = 14; // raio das curvas
      const sections = Array.from(host.querySelectorAll<HTMLElement>(":scope > section"));
      const hostTop = host.getBoundingClientRect().top + window.scrollY;
      const ys = sections.map((s) => s.getBoundingClientRect().top + window.scrollY - hostTop);

      let x = L, y = mobile ? 90 : 120;
      let d = `M ${x} ${y}`;
      const nodes: [number, number][] = [[x, y]];
      const branches: string[] = [];
      ys.forEach((sy, i) => {
        if (i === 0) return; // o hero já tem a sua própria composição
        const side = i % 2 === 1 ? R : L;
        const yTurn = Math.max(y + 60, sy - (mobile ? 70 : 110));
        const dx = Math.abs(side - x);
        // desce, faz a diagonal de 45° para o outro lado, segue descendo
        if (dx > 1) {
          const dir = side > x ? 1 : -1;
          const diag = Math.min(dx, mobile ? 60 : 160);
          const flat = dx - diag;
          d += ` L ${x} ${yTurn - r}`;
          d += ` Q ${x} ${yTurn} ${x + dir * r} ${yTurn}`;
          d += ` L ${x + dir * flat} ${yTurn}`;
          d += ` L ${side} ${yTurn + diag}`;
          y = yTurn + diag;
          x = side;
        }
        const yNode = Math.max(y + 30, sy + (mobile ? 40 : 64));
        d += ` L ${x} ${yNode}`;
        nodes.push([x, yNode]);
        // ramal curto apontando para dentro do bloco
        const inward = x === L ? 1 : -1;
        const len = mobile ? 22 : 56;
        branches.push(`M ${x} ${yNode} L ${x + inward * len} ${yNode} L ${x + inward * (len + 10)} ${yNode - 10}`);
        y = yNode;
      });
      d += ` L ${x} ${H - (mobile ? 140 : 200)}`;
      nodes.push([x, H - (mobile ? 140 : 200)]);
      setGeo({ d, w: W, h: H, nodes, branches });
    };
    build();
    const ro = new ResizeObserver(() => build());
    ro.observe(host);
    window.addEventListener("load", build);
    return () => {
      ro.disconnect();
      window.removeEventListener("load", build);
    };
  }, []);

  // desenho acompanhando a rolagem
  useEffect(() => {
    if (!geo) return;
    const path = drawRef.current!;
    const len = path.getTotalLength();
    const mask = maskRef.current!;
    path.style.strokeDasharray = `${len}`;
    mask.style.strokeDasharray = `${len}`;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const update = () => {
      raf = 0;
      if (reduced) {
        path.style.strokeDashoffset = "0";
        mask.style.strokeDashoffset = "0";
        return;
      }
      const host = wrapRef.current!.parentElement!;
      const top = host.getBoundingClientRect().top + window.scrollY;
      const reach = window.scrollY + window.innerHeight * 0.85 - top; // até onde a trilha já chegou
      const p = Math.min(1, Math.max(0, reach / geo.h));
      path.style.strokeDashoffset = `${len * (1 - p)}`;
      mask.style.strokeDashoffset = `${len * (1 - p)}`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [geo]);

  return (
    <div ref={wrapRef} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {geo && (
        <svg width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`} className="absolute left-0 top-0" fill="none">
          <defs>
            <mask id="circuit-drawn" maskUnits="userSpaceOnUse">
              <path ref={maskRef} d={geo.d} stroke="#fff" strokeWidth="6" />
            </mask>
          </defs>
          {/* trilho apagado (o caminho completo, bem sutil) */}
          <path d={geo.d} stroke="rgb(245 245 242 / 0.05)" strokeWidth="1" />
          {/* traço dourado que se desenha com a rolagem */}
          <path ref={drawRef} d={geo.d} stroke="rgb(215 168 62 / 0.6)" strokeWidth="1.3" strokeLinejoin="round" className="pc-draw" />
          {/* pulsos de luz correndo pela parte desenhada */}
          <g mask="url(#circuit-drawn)">
            <path d={geo.d} className="pc-pulse" />
            <path d={geo.d} className="pc-pulse pc-pulse-2" />
          </g>
          {geo.branches.map((b, i) => (
            <path key={i} d={b} stroke="rgb(215 168 62 / 0.55)" strokeWidth="1.1" />
          ))}
          {geo.nodes.map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="7" fill="rgb(215 168 62 / 0.08)" />
              <circle cx={x} cy={y} r="2.6" className="pc-node" />
            </g>
          ))}
        </svg>
      )}
    </div>
  );
}
