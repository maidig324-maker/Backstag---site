"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { FRAMES, STATIC_P, computeTimeline, type Frame, type TimelineState } from "./timeline";

/**
 * Liga a linha do tempo à rolagem: lê a posição uma vez por quadro
 * (requestAnimationFrame) e escreve as variáveis no palco. Sem biblioteca
 * extra: a rolagem nativa conduz, inclusive a inércia do iPhone.
 * Medidas do trilho só são lidas ao abrir e ao redimensionar.
 */
export function useScrollTimeline(trackRef: RefObject<HTMLElement | null>, stageRef: RefObject<HTMLElement | null>) {
  const [frameKey, setFrameKey] = useState<keyof typeof FRAMES>("compact");
  const [reduced, setReduced] = useState(false);
  const [step, setStep] = useState(-1);
  const [ready, setReady] = useState(false);
  const frameRef = useRef<Frame>(FRAMES.compact);

  useEffect(() => {
    const track = trackRef.current!;
    const stage = stageRef.current!;
    const html = document.documentElement;
    const wideQ = window.matchMedia("(min-width: 1024px)");
    const motionQ = window.matchMedia("(prefers-reduced-motion: reduce)");

    let top = 0;
    let run = 1;
    let last = -1;
    let raf = 0;

    const write = (s: TimelineState) => {
      for (const k in s.vars) stage.style.setProperty(k, s.vars[k].toFixed(3));
      setStep((v) => (v === s.step ? v : s.step));
      setReady((v) => (v === s.ready ? v : s.ready));
      if (s.opening) html.dataset.opening = "1";
      else delete html.dataset.opening;
    };

    const measure = () => {
      const key = wideQ.matches ? "wide" : "compact";
      frameRef.current = FRAMES[key];
      setFrameKey(key);
      setReduced(motionQ.matches);
      top = track.getBoundingClientRect().top + window.scrollY;
      run = Math.max(1, track.offsetHeight - stage.offsetHeight);
      last = -1;
    };

    const frame = () => {
      raf = 0;
      if (motionQ.matches) {
        write(computeTimeline(STATIC_P, frameRef.current));
        return;
      }
      const p = Math.min(1, Math.max(0, (window.scrollY - top) / run));
      if (Math.abs(p - last) < 0.0004) return;
      last = p;
      write(computeTimeline(p, frameRef.current));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const onResize = () => {
      measure();
      schedule();
    };

    measure();
    frame();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    wideQ.addEventListener("change", onResize);
    motionQ.addEventListener("change", onResize);
    // fontes e imagens podem mudar a altura da página depois da abertura
    const ro = new ResizeObserver(onResize);
    ro.observe(track);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      wideQ.removeEventListener("change", onResize);
      motionQ.removeEventListener("change", onResize);
      ro.disconnect();
      delete html.dataset.opening;
    };
  }, [trackRef, stageRef]);

  return { frame: FRAMES[frameKey], frameKey, reduced, step, ready };
}
