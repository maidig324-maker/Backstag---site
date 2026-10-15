/**
 * Conector da rede (linguagem gráfica BACKSTAG 2026): uma linha fina que
 * desce e termina num ponto amarelo — liga visualmente uma seção à outra,
 * como os nós da rede do topo. Puro SVG + CSS, decorativo.
 */
export function NodeConnector({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 88" className={`nc mx-auto block h-[4.5rem] w-6 md:h-[5.5rem] ${className}`} fill="none">
      <line x1="12" y1="0" x2="12" y2="70" className="nc-line" pathLength={1} />
      <circle cx="12" cy="76" r="9" className="nc-halo" />
      <circle cx="12" cy="76" r="4.5" className="nc-dot" />
    </svg>
  );
}
