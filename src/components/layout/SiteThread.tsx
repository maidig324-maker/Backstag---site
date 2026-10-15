"use client";

import { useEffect, useRef } from "react";

/**
 * Fio da rede (só em telas largas): uma linha fina na lateral com um ponto
 * para cada parte do site. Conforme a rolagem avança, a linha se preenche
 * de amarelo e os pontos já percorridos acendem — a mesma ideia da rede do
 * topo, ligando as seções. Sem texto e sem clique: só acompanha.
 */
const SECTIONS = ["topo", "projetos", "desafios", "metodo", "sobre", "contato"];

export function SiteThread() {
  const fillRef = useRef<HTMLSpanElement>(null);
  const dotsRef = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    let raf = 0;
    let tops: number[] = [];
    const measure = () => {
      tops = SECTIONS.map((id) => {
        const el = document.getElementById(id);
        return el ? el.getBoundingClientRect().top + window.scrollY : Infinity;
      });
    };
    const update = () => {
      raf = 0;
      const y = window.scrollY + window.innerHeight * 0.4;
      // posição contínua entre um ponto e o próximo
      let pos = 0;
      for (let i = 0; i < tops.length; i++) {
        const a = tops[i], b = tops[i + 1] ?? document.documentElement.scrollHeight;
        if (y >= a) pos = i + Math.min(1, (y - a) / Math.max(1, b - a));
      }
      const t = pos / (SECTIONS.length - 1);
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${Math.min(1, t).toFixed(4)})`;
      dotsRef.current.forEach((d, i) => d?.classList.toggle("on", pos >= i - 0.02));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      onScroll();
    };
    measure();
    update();
    const ro = new ResizeObserver(onResize);
    ro.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div aria-hidden className="site-thread">
      <span className="st-line" />
      <span ref={fillRef} className="st-fill" />
      {SECTIONS.map((id, i) => (
        <span
          key={id}
          ref={(el) => {
            dotsRef.current[i] = el;
          }}
          className="st-dot"
          style={{ top: `${(i / (SECTIONS.length - 1)) * 100}%` }}
        />
      ))}
    </div>
  );
}
