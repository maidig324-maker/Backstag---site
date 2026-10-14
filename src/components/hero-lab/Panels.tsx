/**
 * Ilustrações dos quatro pilares (viewBox 160×96), usadas no hero e em
 * Capacidades. São esquemáticas: nenhum número, cliente ou resultado.
 * As animações (classes bs-*) só rodam dentro de um elemento .bs-on.
 */
/* ---------- Conteúdo de cada painel (viewBox 160×96) ---------- */

export function PanelGestao() {
  const steps = [12, 50, 88, 126];
  return (
    <svg viewBox="0 0 160 96" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="0.8">
      {/* fluxo de processo */}
      {steps.map((x, i) => (
        <g key={x} className="bs-step" style={{ ["--d" as string]: `${i * 0.22}s` }}>
          <rect x={x} y="14" width="24" height="16" rx="3" />
          <path d={`M${x + 8} 22.5l3 3 5-6`} strokeWidth="1.1" className="bs-check" />
          {i < steps.length - 1 && <path d={`M${x + 26} 22h10m-3-2.5l3 2.5-3 2.5`} strokeOpacity="0.6" />}
        </g>
      ))}
      {/* lista de rotinas */}
      {[44, 58, 72].map((y, i) => (
        <g key={y} className="bs-row" style={{ ["--d" as string]: `${0.9 + i * 0.18}s` }}>
          <rect x="12" y={y} width="7" height="7" rx="1.5" />
          <line x1="26" y1={y + 3.5} x2={110 - i * 18} y2={y + 3.5} strokeOpacity="0.55" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="128" y1={y + 3.5} x2="148" y2={y + 3.5} strokeOpacity="0.35" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      ))}
    </svg>
  );
}

export function PanelEstrategia() {
  const d = "M12 76 C 34 72, 44 64, 60 60 S 88 50, 100 40 S 130 24, 148 16";
  return (
    <svg viewBox="0 0 160 96" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="0.8">
      {[28, 48, 68].map((y) => (
        <line key={y} x1="12" y1={y} x2="148" y2={y} strokeOpacity="0.18" />
      ))}
      <line x1="12" y1="84" x2="148" y2="84" strokeOpacity="0.5" />
      <path d={`${d} L148 84 L12 84 Z`} fill="currentColor" fillOpacity="0.08" stroke="none" />
      <path d={d} strokeWidth="1.6" className="bs-draw" pathLength={1} />
      <circle cx="148" cy="16" r="3" fill="currentColor" className="bs-pop" />
      {/* meta */}
      <line x1="12" y1="12" x2="148" y2="12" strokeDasharray="2 3" strokeOpacity="0.45" />
      {[26, 56, 86, 116].map((x, i) => (
        <rect key={x} x={x} y={84 - (10 + i * 6)} width="8" height={10 + i * 6} fill="currentColor" fillOpacity="0.14" stroke="none" className="bs-bar" style={{ ["--d" as string]: `${i * 0.12}s` }} />
      ))}
    </svg>
  );
}

export function PanelDigital() {
  return (
    <svg viewBox="0 0 160 96" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="0.8">
      <rect x="8" y="8" width="144" height="80" rx="4" />
      <line x1="8" y1="18" x2="152" y2="18" />
      <rect x="40" y="11" width="80" height="4" rx="2" strokeOpacity="0.5" />
      {/* hero do site */}
      <line x1="18" y1="30" x2="80" y2="30" strokeWidth="3" strokeLinecap="round" className="bs-row" style={{ ["--d" as string]: "0s" }} />
      <line x1="18" y1="38" x2="64" y2="38" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.6" className="bs-row" style={{ ["--d" as string]: "0.15s" }} />
      <rect x="18" y="45" width="26" height="8" rx="4" fill="currentColor" fillOpacity="0.25" className="bs-pop" />
      <rect x="96" y="26" width="46" height="28" rx="2" strokeOpacity="0.6" />
      <path d="M100 50l10-10 8 7 6-5 14 8" strokeOpacity="0.6" />
      {/* cards */}
      {[18, 62, 106].map((x, i) => (
        <rect key={x} x={x} y="62" width="36" height="18" rx="2" className="bs-step" style={{ ["--d" as string]: `${0.4 + i * 0.15}s` }} />
      ))}
    </svg>
  );
}

export function PanelIA() {
  const sat = [
    [24, 22], [24, 74], [80, 12], [80, 84], [136, 22], [136, 74],
  ];
  return (
    <svg viewBox="0 0 160 96" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="0.8">
      {sat.map(([x, y], i) => (
        <g key={i}>
          <path d={`M80 48 L${x} ${y}`} strokeDasharray="2 3" strokeOpacity="0.6" className="bs-flow" />
          <rect x={x - 5} y={y - 5} width="10" height="10" rx="2" className="bs-step" style={{ ["--d" as string]: `${i * 0.12}s` }} />
        </g>
      ))}
      <rect x="62" y="30" width="36" height="36" rx="7" fill="#151517" stroke="none" />
      <rect x="66" y="34" width="28" height="28" rx="5" fill="currentColor" fillOpacity="0.12" strokeWidth="1.2" />
      <rect x="62" y="30" width="36" height="36" rx="7" strokeOpacity="0.4" className="bs-pulse" />
      <text x="80" y="52" textAnchor="middle" fontSize="11" fill="currentColor" stroke="none" fontFamily="inherit" fontWeight="600">
        IA
      </text>
    </svg>
  );
}

export const panels = [PanelGestao, PanelEstrategia, PanelDigital, PanelIA];
