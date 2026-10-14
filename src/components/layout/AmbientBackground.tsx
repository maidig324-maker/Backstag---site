import { AmbientParticles } from "./AmbientParticles";

/**
 * Cenário de fundo do site: rede de partículas, luzes difusas em movimento lento, piso em
 * grade em perspectiva e granulação fina. Fixo atrás do conteúdo, sem
 * filtros pesados (só transform), e parado com redução de movimento.
 */
export function AmbientBackground() {
  return (
    <div aria-hidden className="amb">
      <span className="amb-glow amb-glow-a" />
      <span className="amb-glow amb-glow-b" />
      <div className="amb-floor">
        <span className="amb-grid" />
      </div>
      <AmbientParticles />
      <span className="amb-grain" />
    </div>
  );
}
