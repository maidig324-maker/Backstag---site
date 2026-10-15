/**
 * Fundo do site com cara de fotografia, não de tela: luz quente difusa,
 * vinheta nas bordas e granulação de filme. Fixo atrás do conteúdo,
 * só transform nas luzes, parado com redução de movimento.
 */
export function AmbientBackground() {
  return (
    <div aria-hidden className="amb">
      <span className="amb-glow amb-glow-a" />
      <span className="amb-glow amb-glow-b" />
      <span className="amb-vignette" />
      <span className="amb-grain" />
    </div>
  );
}
