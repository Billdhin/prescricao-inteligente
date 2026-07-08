/**
 * Figura da fase do movimento — explica VISUALMENTE (não só por texto) o que acontece
 * com o músculo-alvo em cada fase: alonga sob carga (excêntrica) → ponto de virada
 * (transição/isométrica) → encurta e produz força (concêntrica). Esquema próprio em SVG,
 * reutilizável em todos os exercícios (o conceito é universal), animado com transform
 * (respeita prefers-reduced-motion via motion-safe:).
 */

export type FaseKind = "ecc" | "iso" | "con";

export function faseKind(nome: string, i: number, total: number): FaseKind {
  const n = nome.toLowerCase();
  if (/(excêntr|excentr|descid|desce|alonga|negativ)/.test(n)) return "ecc";
  if (/(concêntr|concentr|subid|sobe|empurr|puxa|elev|ascend)/.test(n)) return "con";
  if (/(isom|transi|pausa|sustenta|topo|contra[çc]|segura)/.test(n)) return "iso";
  if (total >= 3) return i === 0 ? "ecc" : i === total - 1 ? "con" : "iso";
  return i === 0 ? "ecc" : "con";
}

const CFG: Record<
  FaseKind,
  { belly: string; scale: string; loadDy: number; fill: string; glow: boolean; acao: string }
> = {
  // belly scale: (largura, altura) sobre o centro. ecc = longo/fino · iso = mais longo ·
  // con = curto/grosso (contraído). loadDy: posição da carga (desce na excêntrica).
  ecc: { belly: "excêntrica", scale: "scale(0.82,1.16)", loadDy: 20, fill: "#7AA5F2", glow: false, acao: "alonga sob carga" },
  iso: { belly: "transição", scale: "scale(0.74,1.28)", loadDy: 30, fill: "#A9C7F9", glow: false, acao: "tensão no ponto de virada" },
  con: { belly: "concêntrica", scale: "scale(1.55,0.66)", loadDy: -16, fill: "#1D4ED8", glow: true, acao: "encurta e produz força" },
};

export function FaseFigure({
  kind,
  musculo,
  className,
}: {
  kind: FaseKind;
  musculo?: string;
  className?: string;
}) {
  const c = CFG[kind];
  return (
    <figure className={className}>
      <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-b from-surface to-surface-soft">
        <svg viewBox="0 0 240 190" className="mx-auto h-44 w-full" role="img"
          aria-label={`Fase ${c.belly}: o músculo ${musculo ?? "alvo"} ${c.acao}`}>
          <defs>
            <filter id="fase-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#1D4ED8" floodOpacity="0.45" />
            </filter>
          </defs>

          {/* osso/inserção superior (fixo) */}
          <rect x="104" y="16" width="32" height="12" rx="6" fill="#CBD5E1" />
          <rect x="116" y="24" width="8" height="26" rx="4" fill="#E2E8F0" />

          {/* tendões (atrás da barriga do músculo) */}
          <rect x="116" y="40" width="8" height="118" rx="4" fill="#E2E8F0" />

          {/* carga presa na extremidade livre — desce na excêntrica, sobe na concêntrica */}
          <g
            className="motion-safe:transition-transform motion-safe:duration-500 ease-out"
            style={{ transform: `translateY(${c.loadDy}px)` }}
          >
            <rect x="120" y="150" width="0" height="0" />
            <rect x="98" y="150" width="44" height="18" rx="5" fill="#334155" />
            <rect x="94" y="154" width="6" height="10" rx="2" fill="#1E293B" />
            <rect x="140" y="154" width="6" height="10" rx="2" fill="#1E293B" />
          </g>

          {/* barriga do músculo — muda de forma por fase (transform sobre o próprio centro) */}
          <ellipse
            cx="120"
            cy="92"
            rx="15"
            ry="50"
            fill={c.fill}
            filter={c.glow ? "url(#fase-glow)" : undefined}
            className="motion-safe:transition-[transform,fill] motion-safe:duration-500 ease-out"
            style={{ transformBox: "fill-box", transformOrigin: "center", transform: c.scale }}
          />
          {/* fibras (linha central sutil) */}
          <line x1="120" y1="52" x2="120" y2="132" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="1.5"
            className="motion-safe:transition-transform motion-safe:duration-500 ease-out"
            style={{ transformBox: "fill-box", transformOrigin: "center", transform: c.scale }} />

          {/* indicador de movimento à direita */}
          <g transform="translate(196 96)">
            {kind === "iso" ? (
              <g fill="#64748B">
                <rect x="-7" y="-16" width="6" height="32" rx="2" />
                <rect x="3" y="-16" width="6" height="32" rx="2" />
              </g>
            ) : (
              <g
                stroke={kind === "con" ? "#1D4ED8" : "#64748B"}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                className="motion-safe:transition-transform motion-safe:duration-500 ease-out"
                style={{ transform: kind === "con" ? "rotate(180deg)" : "none", transformBox: "fill-box", transformOrigin: "center" }}
              >
                {/* seta para baixo (excêntrica); girada 180° vira para cima (concêntrica) */}
                <line x1="0" y1="-18" x2="0" y2="18" />
                <path d="M-9 7 L0 18 L9 7" />
              </g>
            )}
          </g>
        </svg>

        {/* selo da ação no canto — curtíssimo, o desenho é o protagonista */}
        <span className="absolute left-2 top-2 rounded-full border border-primary/20 bg-surface/90 px-2 py-0.5 text-[11px] font-semibold text-primary backdrop-blur-sm">
          {kind === "ecc" ? "Alongando" : kind === "iso" ? "Ponto de virada" : "Encurtando"}
        </span>
      </div>
      {musculo && (
        <figcaption className="mt-1.5 text-center text-[11px] text-ink-3">
          Músculo-alvo: <span className="font-medium text-ink-2">{musculo}</span> — {c.acao}
        </figcaption>
      )}
    </figure>
  );
}
