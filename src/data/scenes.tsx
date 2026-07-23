/**
 * Cenas SVG próprias e estilizadas (placeholders originais — nada copiado de terceiros).
 * ExecutionScene = silhueta neutra do movimento.
 * AnalysisScene  = overlay biomecânico (linhas articulares, ângulo, linha de força, ativação).
 */

export function ExecutionScene() {
  return (
    <svg
      viewBox="0 0 400 300"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Ilustração da execução do movimento"
    >
      <defs>
        <linearGradient id="execBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#eef1f6" />
          <stop offset="1" stopColor="#e2e8f0" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#execBg)" />
      {/* piso */}
      <line x1="20" y1="250" x2="380" y2="250" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
      {/* plataforma / banco */}
      <rect x="120" y="120" width="90" height="26" rx="8" fill="#94a3b8" />
      <rect x="60" y="235" width="120" height="16" rx="6" fill="#cbd5e1" />
      {/* silhueta (pose reclinada tipo leg press) */}
      <g fill="none" stroke="#1e293b" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
        {/* tronco */}
        <line x1="95" y1="210" x2="175" y2="185" />
        {/* coxa */}
        <line x1="175" y1="185" x2="215" y2="150" />
        {/* perna */}
        <line x1="215" y1="150" x2="255" y2="180" />
      </g>
      {/* cabeça */}
      <circle cx="88" cy="205" r="20" fill="#1e293b" />
      {/* braço */}
      <line x1="120" y1="200" x2="150" y2="230" stroke="#334155" strokeWidth="9" strokeLinecap="round" />
    </svg>
  );
}

export function AnalysisScene({ angle = "95°" }: { angle?: string }) {
  return (
    <svg
      viewBox="0 0 400 300"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Análise biomecânica do movimento"
    >
      <defs>
        <linearGradient id="anaBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ecfeff" />
          <stop offset="1" stopColor="#f0fdfa" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#anaBg)" />
      <line x1="20" y1="250" x2="380" y2="250" stroke="#a5f3fc" strokeWidth="3" strokeLinecap="round" />
      <rect x="120" y="120" width="90" height="26" rx="8" fill="#cbd5e1" opacity="0.6" />

      {/* ativação muscular (coxa) */}
      <line x1="175" y1="185" x2="215" y2="150" stroke="#ef4444" strokeWidth="14" strokeLinecap="round" opacity="0.55" />

      {/* silhueta em contorno claro */}
      <g fill="none" stroke="#334155" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.5">
        <line x1="95" y1="210" x2="175" y2="185" />
        <line x1="175" y1="185" x2="215" y2="150" />
        <line x1="215" y1="150" x2="255" y2="180" />
      </g>
      <circle cx="88" cy="205" r="18" fill="none" stroke="#334155" strokeWidth="4" opacity="0.5" />

      {/* linhas articulares (tracejado análise) */}
      <g stroke="#0e7c8a" strokeWidth="2.5" strokeDasharray="6 6" fill="none">
        <line x1="175" y1="185" x2="215" y2="150" />
        <line x1="215" y1="150" x2="255" y2="180" />
      </g>
      {/* nós articulares */}
      <g fill="#0e7c8a">
        <circle cx="175" cy="185" r="6" />
        <circle cx="215" cy="150" r="6" />
        <circle cx="255" cy="180" r="6" />
      </g>

      {/* ângulo articular (arco laranja) */}
      <path d="M 235 150 A 25 25 0 0 1 227 175" fill="none" stroke="#f97316" strokeWidth="3" />
      <text x="250" y="168" fill="#f97316" fontSize="18" fontWeight="700" fontFamily="Inter, sans-serif">
        {angle}
      </text>

      {/* linha de força (seta petróleo) */}
      <g stroke="#1b4b66" strokeWidth="3" fill="#1b4b66">
        <line x1="215" y1="150" x2="215" y2="95" />
        <path d="M 215 88 L 209 100 L 221 100 Z" />
      </g>

      {/* mini barras de ativação */}
      <g>
        <text x="300" y="70" fill="#64748b" fontSize="11" fontFamily="Inter, sans-serif">Quadríceps</text>
        <rect x="300" y="76" width="80" height="7" rx="3.5" fill="#e2e8f0" />
        <rect x="300" y="76" width="72" height="7" rx="3.5" fill="#1b4b66" />
        <text x="300" y="100" fill="#64748b" fontSize="11" fontFamily="Inter, sans-serif">Glúteos</text>
        <rect x="300" y="106" width="80" height="7" rx="3.5" fill="#e2e8f0" />
        <rect x="300" y="106" width="58" height="7" rx="3.5" fill="#1b4b66" />
      </g>
    </svg>
  );
}
