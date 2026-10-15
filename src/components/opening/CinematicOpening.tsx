"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { MessageCircle } from "lucide-react";
import { site } from "@/content/site";
import { opening } from "@/content/opening";
import { primaryContact } from "@/lib/contact";
import { ButtonLink } from "@/components/ui/ButtonLink";

/**
 * ABERTURA CINEMATOGRÁFICA + HERO
 * Toca sozinha ao abrir o site, como um filme de ~10 s, sem prender a rolagem:
 *  1. a logo no centro, diante de um ambiente real desfocado em movimento
 *     (luzes cruzando, sombras se deslocando, reflexo no piso);
 *  2. a logo cresce como se o visitante entrasse na cena e some;
 *  3. o foco "puxa" e o mesmo ambiente vira o fundo do hero com a mensagem;
 *  4. Gestão, Marketing, Tecnologia e Automação entram como peças de um
 *     quebra-cabeça com a foto real de uma operação e se encaixam;
 *  5. a operação completa revela a mensagem final e os botões.
 * Se o visitante rolar ou tocar antes do fim, a abertura acelera até o final.
 * Linha do tempo em variáveis CSS num único requestAnimationFrame (sem
 * biblioteca extra); só transform e opacity animam. Movimento reduzido:
 * a composição final aparece parada.
 */

const LOGO = site.logo.src ?? "/brand/backstag-logo.png";

// linha do tempo, em segundos
const PH = {
  logo: [1.2, 3.6],
  fade: [2.8, 3.8],
  focus: [2.4, 4.4],
  hero: [3.6, 4.6],
  piece: (i: number) => [4.9 + i * 1.05, 5.8 + i * 1.05],
  final: [9.1, 10.1],
} as const;
const END = 10.2;
/** Velocidade ao acelerar quando o visitante rola ou toca antes do fim. */
const SKIP = 7;

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const seg = (p: number, [a, b]: readonly number[]) => clamp((p - a) / (b - a));
const ease = (x: number) => 1 - Math.pow(1 - x, 3);
// aproximação da câmera: começa devagar e acelera, como quem entra na cena
const approach = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

/* ---------- quebra-cabeça 2×2 com encaixes ---------- */
const PW = 200;
const CW = PW / 2;
type Pt = [number, number];
const KNOB: [Pt, Pt, Pt][] = [
  [[0.37, 0], [0.4, 0.05], [0.38, 0.1]],
  [[0.34, 0.2], [0.42, 0.27], [0.5, 0.27]],
  [[0.58, 0.27], [0.66, 0.2], [0.62, 0.1]],
  [[0.6, 0.05], [0.63, 0], [0.66, 0]],
];
const f = (n: number) => +n.toFixed(2);
function edge(p0: Pt, p1: Pt, s: number): string {
  if (!s) return ` L ${f(p1[0])} ${f(p1[1])}`;
  const dx = p1[0] - p0[0], dy = p1[1] - p0[1], L = Math.hypot(dx, dy);
  const nx = (dy / L) * s, ny = (-dx / L) * s;
  const at = ([t, k]: Pt) => `${f(p0[0] + dx * t + nx * k * L * 0.8)} ${f(p0[1] + dy * t + ny * k * L * 0.8)}`;
  let d = ` L ${at([0.34, 0])}`;
  for (const [a, b, c] of KNOB) d += ` C ${at(a)} ${at(b)} ${at(c)}`;
  return d + ` L ${f(p1[0])} ${f(p1[1])}`;
}
// encaixes internos: vertical por linha, horizontal por coluna (+1 = dente para direita/baixo)
const V = [1, -1];
const HZ = [-1, 1];
function piecePath(r: number, c: number) {
  const x0 = c * CW, y0 = r * CW, x1 = x0 + CW, y1 = y0 + CW;
  const top = r === 0 ? 0 : -HZ[c];
  const bottom = r === 1 ? 0 : HZ[c];
  const right = c === 1 ? 0 : V[r];
  const left = c === 0 ? 0 : -V[r];
  return `M ${x0} ${y0}` + edge([x0, y0], [x1, y0], top) + edge([x1, y0], [x1, y1], right) + edge([x1, y1], [x0, y1], bottom) + edge([x0, y1], [x0, y0], left) + " Z";
}
const PIECES = [0, 1, 2, 3].map((i) => {
  const r = Math.floor(i / 2), c = i % 2;
  return { d: piecePath(r, c), cx: c * 50 + 25, cy: r * 50 + 25, dx: c ? 1 : -1, dy: r ? 1 : -1, rot: [-14, 11, 9, -12][i] };
});

export function CinematicOpening() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(-1); // último pilar encaixado
  const main = primaryContact();

  useEffect(() => {
    const stage = stageRef.current!;
    const html = document.documentElement;
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const apply = (p: number) => {
      const v = (k: string, x: number) => stage.style.setProperty(k, x.toFixed(4));
      v("--lp", approach(seg(p, PH.logo)));
      v("--lf", seg(p, PH.fade));
      v("--fp", ease(seg(p, PH.focus)));
      v("--hp", ease(seg(p, PH.hero)));
      let s = -1;
      for (let i = 0; i < 4; i++) {
        const q = ease(seg(p, PH.piece(i)));
        v(`--q${i}`, q);
        if (q > 0.6) s = i;
      }
      const fin = ease(seg(p, PH.final));
      v("--fn", fin);
      setStep((prev) => (prev === s ? prev : s));
      // o cabeçalho só entra depois que a logo da abertura sai de cena
      if (p < PH.fade[1]) html.dataset.opening = "1";
      else delete html.dataset.opening;
      // botões finais só recebem foco/toque quando estão visíveis
      stage.querySelectorAll<HTMLElement>(".op-cta").forEach((cta) => {
        if (fin > 0.5) cta.removeAttribute("inert");
        else cta.setAttribute("inert", "");
      });
    };

    if (isReduced) {
      apply(END);
      delete html.dataset.opening;
      return;
    }

    // a abertura toca sozinha; rolar, tocar ou usar o teclado acelera até o fim
    let raf = 0;
    let t = 0;
    let rate = 1;
    let last = performance.now();
    const tick = (now: number) => {
      t = Math.min(END, t + ((now - last) / 1000) * rate);
      last = now;
      apply(t);
      raf = t < END ? requestAnimationFrame(tick) : 0;
      if (!raf) stop();
    };
    const hurry = () => {
      rate = SKIP;
    };
    const events = ["wheel", "touchmove", "keydown", "pointerdown"] as const;
    const onScroll = () => {
      if (window.scrollY > 4) hurry();
    };
    const stop = () => {
      events.forEach((e) => window.removeEventListener(e, hurry));
      window.removeEventListener("scroll", onScroll);
    };
    events.forEach((e) => window.addEventListener(e, hurry, { passive: true }));
    window.addEventListener("scroll", onScroll, { passive: true });
    // quem chega no meio da página (link, voltar) vê o topo já pronto
    if (window.scrollY > window.innerHeight * 0.5) t = END;
    apply(t);
    raf = requestAnimationFrame((now) => {
      last = now;
      tick(now);
    });
    return () => {
      cancelAnimationFrame(raf);
      stop();
      delete html.dataset.opening;
    };
  }, []);

  const caption = step >= 0 ? opening.pillars[step] : null;

  return (
    <section id="topo" aria-label="Apresentação" className="relative h-[100svh] min-h-[34rem]">
      <div ref={stageRef} className="op-stage relative h-full overflow-hidden">
        {/* ---------- cenário: ambiente real, desfocado e em movimento ---------- */}
        <div aria-hidden className="op-scene absolute inset-0">
          {/* camada desfocada (vídeo em loop, mudo; imagem parada como alternativa) */}
          <div className="op-blur absolute inset-0">
            <SceneVideo />
          </div>
          {/* camada em foco: o mesmo ambiente nítido, que entra quando o visitante "chega" */}
          <div className="op-sharp absolute inset-0">
            <Image src="/scenes/bastidores-mobile.webp" alt="" fill sizes="100vw" className="object-cover lg:hidden" />
            <Image src="/scenes/bastidores-desktop.webp" alt="" fill sizes="100vw" className="hidden object-cover lg:block" />
          </div>
          {/* luz atravessando o ambiente e sombras se deslocando */}
          <span className="op-beam op-beam-a" />
          <span className="op-beam op-beam-b" />
          <span className="op-shade op-shade-a" />
          <span className="op-shade op-shade-b" />
          {/* escurecimento para leitura e vinheta de lente */}
          <span className="op-veil absolute inset-0" />
        </div>

        {/* ---------- 1–2 · a logo e o reflexo no piso ---------- */}
        <div className="op-logo pointer-events-none absolute left-1/2 top-[44%] w-[min(76vw,34rem)]">
          <Image
            src={LOGO}
            alt={site.fullName}
            width={2033}
            height={570}
            priority
            sizes="(min-width: 640px) 34rem, 76vw"
            className="h-auto w-full"
          />
          <Image src={LOGO} alt="" aria-hidden width={2033} height={570} sizes="(min-width: 640px) 34rem, 76vw" className="op-reflex h-auto w-full" />
        </div>

        {/* ---------- 3–5 · hero ---------- */}
        <div className="container-x op-hero relative flex h-full flex-col pb-8 pt-24 lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-12 lg:pb-12 lg:pt-24">
          <div className="relative lg:col-span-6">
            <div className="grid">
              <h1 className="op-h1 display col-start-1 row-start-1 text-[clamp(2.1rem,8vw,4.6rem)] leading-[0.98]">
                {opening.headline[0]} <span className="accent">{opening.headline[1]}</span>
              </h1>
              <p aria-hidden={step < 3} className="op-final display col-start-1 row-start-1 self-start text-[clamp(2.1rem,8vw,4.6rem)] leading-[0.98]">
                {opening.closing[0]} <span className="accent">{opening.closing[1]}</span>
              </p>
            </div>
            <div className="op-cta mt-7 hidden flex-col gap-3 sm:flex-row lg:flex">
              <ButtonLink href={main.href} external icon={<MessageCircle className="size-4" strokeWidth={1.5} />}>
                {main.channel === "whatsapp" ? "Conversar pelo WhatsApp" : "Fale com a Backstag"}
              </ButtonLink>
              <ButtonLink href="/#projetos" variant="ghost">
                Conhecer projetos
              </ButtonLink>
            </div>
          </div>

          {/* quebra-cabeça da operação */}
          <div className="mt-auto flex flex-col items-center lg:col-span-6 lg:mt-0">
            <div className="op-puzzle relative">
              <svg viewBox={`0 0 ${PW} ${PW}`} className="op-slots absolute inset-0 overflow-visible" aria-hidden>
                {PIECES.map((p, i) => (
                  <path key={i} d={p.d} />
                ))}
              </svg>
              {PIECES.map((p, i) => (
                <div
                  key={i}
                  className="op-piece absolute inset-0"
                  style={{ "--q": `var(--q${i})`, "--dx": p.dx, "--dy": p.dy, "--rot": `${p.rot}deg` } as CSSProperties}
                >
                  <svg viewBox={`0 0 ${PW} ${PW}`} className="h-full w-full overflow-visible" aria-hidden>
                    <defs>
                      <clipPath id={`op-p${i}`}>
                        <path d={p.d} />
                      </clipPath>
                    </defs>
                    <g clipPath={`url(#op-p${i})`}>
                      <image href="/scenes/operacao-integrada.webp" width={PW} height={PW} preserveAspectRatio="xMidYMid slice" />
                      <rect width={PW} height={PW} className="op-piece-veil" />
                    </g>
                    <path d={p.d} className="op-edge" />
                    <path d={p.d} className="op-seam" />
                  </svg>

                </div>
              ))}
              {/* nomes por cima de todas as peças */}
              {PIECES.map((p, i) => (
                <span
                  key={i}
                  aria-hidden
                  className="op-label"
                  style={{ left: `${p.cx}%`, top: `${p.cy}%`, "--q": `var(--q${i})` } as CSSProperties}
                >
                  {opening.pillars[i].name}
                </span>
              ))}
            </div>
            {/* cada encaixe vira informação */}
            <p aria-live="polite" className="op-caption mt-6 min-h-[3.2rem] max-w-sm text-center text-sm leading-relaxed text-paper/85 lg:max-w-md lg:text-base">
              {caption && (
                <span key={caption.name} className="op-caption-in block">
                  <strong className="font-semibold text-gold-light">{caption.name}.</strong> {caption.text}
                </span>
              )}
            </p>
            {/* celular: botões abaixo do quebra-cabeça */}
            <div className="op-cta mt-2 flex w-full flex-col gap-3 sm:flex-row sm:justify-center lg:hidden">
              <ButtonLink href={main.href} external icon={<MessageCircle className="size-4" strokeWidth={1.5} />}>
                {main.channel === "whatsapp" ? "Conversar pelo WhatsApp" : "Fale com a Backstag"}
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Vídeo do ambiente: mudo, em loop, só toca com a abertura na tela. */
function SceneVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<{ v: string; p: string } | null>(null);
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1024px)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const p = wide ? "/scenes/cena-desktop.webp" : "/scenes/cena-mobile.webp";
    setSrc({ v: reduced ? "" : wide ? "/scenes/cena-desktop.mp4" : "/scenes/cena-mobile.mp4", p });
  }, []);
  useEffect(() => {
    const v = ref.current;
    if (!v || !src?.v) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()));
    io.observe(v);
    return () => io.disconnect();
  }, [src]);
  return (
    <>
      {/* imagem parada: aparece antes do vídeo e em aparelhos sem suporte */}
      <Image src="/scenes/cena-mobile.webp" alt="" fill priority sizes="100vw" className="object-cover lg:hidden" />
      <Image src="/scenes/cena-desktop.webp" alt="" fill sizes="100vw" className="hidden object-cover lg:block" />
      {src?.v && (
        <video
          ref={ref}
          className="op-video absolute inset-0 h-full w-full object-cover"
          src={src.v}
          poster={src.p}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
        />
      )}
    </>
  );
}
