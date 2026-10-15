import { ARQ_LAYERS } from "./layers.generated";
import type { LayerId } from "./timeline";

/**
 * CAMADA ARQUITETÔNICA
 * Desenho gerado por scripts/architecture/build_layers.py, no mesmo sistema
 * isométrico das outras quatro (mesmo viewBox 800×800, base de uma = topo da
 * anterior). Aqui só se aplica o deslocamento da linha do tempo.
 * Os arquivos isolados também estão em /public/hero/camada-0X-*.svg.
 */
export function ArchitectureLayer({ id }: { id: LayerId }) {
  return (
    <g
      className="hx-layer"
      data-layer={id}
      // marcação estática, gerada a partir do nosso próprio script (sem conteúdo externo)
      dangerouslySetInnerHTML={{ __html: ARQ_LAYERS[id].markup }}
    />
  );
}

/** Planta no chão: aparece primeiro, quando a composição começa. */
export function GroundPlan() {
  return (
    <g className="hx-ground" aria-hidden>
      <ellipse cx="400" cy="626" rx="290" ry="130" className="hx-ground-glow" />
      <polygon points="348.6,451.7 691.5,649.7 451.4,788.3 108.5,590.3" className="hx-ground-plan" />
      <polygon points="356.4,477.2 647.3,645.2 443.6,762.8 152.7,594.8" className="hx-ground-line" />
    </g>
  );
}
