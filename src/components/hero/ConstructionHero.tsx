"use client";

import { useRef, type CSSProperties } from "react";
import { opening } from "@/content/opening";
import { ARQ_STYLE } from "./layers.generated";
import { LAYER_IDS } from "./timeline";
import { useScrollTimeline } from "./useScrollTimeline";
import { OpeningBackdrop } from "./OpeningBackdrop";
import { ArchitectureLayer, GroundPlan } from "./ArchitectureLayer";
import { IdentificationLine } from "./IdentificationLine";
import { LayerCaption, LayerInfo } from "./LayerInfo";
import { FinalActions, FinalMessage } from "./FinalComposition";

/**
 * HERO — CONSTRUÇÃO PROGRESSIVA DE UMA EMPRESA
 * Vista arquitetônica explodida: Gestão, Marketing, Estrutura, Tecnologia e
 * Automação descem, se aproximam e se encaixam conforme a rolagem, até
 * formar uma única estrutura. "Uma empresa cresce quando todas as suas
 * estruturas trabalham conectadas."
 *
 * O trilho (.hx-track) é alto; o palco (.hx-stage) fica preso na tela
 * enquanto a rolagem avança a linha do tempo (timeline.ts). Cada camada é
 * um quadro próprio, com o mesmo viewBox, e só se move por transform.
 */
export function ConstructionHero() {
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const { frame, step, ready } = useScrollTimeline(trackRef, stageRef);
  const [vx, vy, vw, vh] = frame.vb;
  const vb = `${vx} ${vy} ${vw} ${vh}`;
  const frameStyle = { ["--vbw" as string]: vw, ["--ar" as string]: vw / vh } as CSSProperties;
  const info = step >= 0 ? opening.layers[step] : null;

  return (
    <section ref={trackRef} id="topo" aria-label="Apresentação" data-pin className="hx-track relative">
      <style>{ARQ_STYLE}</style>
      <div ref={stageRef} className="hx-stage sticky top-0 overflow-hidden">
        <OpeningBackdrop />

        <div className="hx-layout container-x relative z-[2]">
          {/* mensagem: abre o hero e dá lugar à mensagem final */}
          <div className="hx-copy">
            <div className="grid">
              <h1 className="hx-h1 display hx-title col-start-1 row-start-1">
                {opening.headline[0]} <span className="accent">{opening.headline[1]}</span>
              </h1>
              <FinalMessage ready={ready} />
            </div>
            <FinalActions ready={ready} className="mt-8 hidden lg:flex" />
            {/* informações essenciais: leitores de tela e movimento reduzido */}
            <ul className="hx-list" aria-label="Como a Backstag estrutura sua empresa">
              {opening.layers.map((l) => (
                <li key={l.id}>
                  <strong>{l.title}.</strong> {l.text}
                </li>
              ))}
            </ul>
          </div>

          {/* a construção */}
          <div className="hx-build" aria-hidden>
            <div className="hx-frame" style={frameStyle}>
              <div className="hx-groundwrap">
                <svg viewBox={vb} className="hx-svg">
                  <GroundPlan />
                </svg>
              </div>
              {LAYER_IDS.map((id, i) => (
                <div
                  key={id}
                  className="hx-slab"
                  style={
                    {
                      zIndex: i + 1,
                      ["--x" as string]: `var(--x${i})`,
                      ["--y" as string]: `var(--y${i})`,
                      ["--o" as string]: `var(--o${i})`,
                      ["--l" as string]: `var(--l${i})`,
                      ["--t" as string]: `var(--t${i})`,
                    } as CSSProperties
                  }
                >
                  <svg viewBox={vb} className="hx-svg">
                    <ArchitectureLayer id={id} />
                    <IdentificationLine id={id} frame={frame} />
                  </svg>
                  <LayerInfo id={id} info={opening.layers[i]} />
                </div>
              ))}
              <span className="hx-joinlight" />
            </div>
          </div>

          {/* celular: descrição da camada que entrou e, no fim, os botões */}
          <div className="hx-foot grid lg:hidden">
            <div className="col-start-1 row-start-1">
              <LayerCaption info={info} />
            </div>
            <FinalActions ready={ready} compact className="col-start-1 row-start-1 self-end" />
          </div>
        </div>
      </div>
    </section>
  );
}
