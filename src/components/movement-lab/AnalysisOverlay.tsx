import type { AnalysisOverlayData } from "@/data/analysis-overlays";

/**
 * Marcadores biomecânicos sobre a imagem de análise — linguagem de instrumento,
 * coesa com a prancha anatômica: vetor de força fino (linha sólida, ponta
 * discreta, ponto de aplicação) e chip de vidro para o ângulo articular.
 * SVG em viewBox 400×300 (proporção 4:3) => geometria sem distorção.
 */

const X = (x: number) => x * 4;
const Y = (y: number) => y * 3;

export function AnalysisOverlay({ overlay }: { overlay: AnalysisOverlayData }) {
  return (
    <div className="pointer-events-none absolute inset-0">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 400 300"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <marker
            id="force-arrow"
            viewBox="0 0 8 8"
            refX="6"
            refY="4"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M0,0.8 L7.2,4 L0,7.2 Z" fill="#2563eb" stroke="#fff" strokeWidth="0.6" />
          </marker>
        </defs>

        {overlay.force && (
          <>
            {/* halo fino p/ legibilidade sobre a foto */}
            <line
              x1={X(overlay.force.x1)}
              y1={Y(overlay.force.y1)}
              x2={X(overlay.force.x2)}
              y2={Y(overlay.force.y2)}
              stroke="#ffffff"
              strokeOpacity={0.6}
              strokeWidth={4}
              strokeLinecap="round"
            />
            <line
              x1={X(overlay.force.x1)}
              y1={Y(overlay.force.y1)}
              x2={X(overlay.force.x2)}
              y2={Y(overlay.force.y2)}
              stroke="#2563eb"
              strokeWidth={2}
              strokeLinecap="round"
              markerEnd="url(#force-arrow)"
            />
            {/* ponto de aplicação da força */}
            <circle
              cx={X(overlay.force.x1)}
              cy={Y(overlay.force.y1)}
              r={3.5}
              fill="#2563eb"
              stroke="#fff"
              strokeWidth={1.5}
            />
          </>
        )}
      </svg>

      {overlay.angle && (
        <span
          className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-md border border-white/20 bg-slate-900/70 px-2 py-0.5 backdrop-blur-sm"
          style={{ left: `${overlay.angle.x}%`, top: `${overlay.angle.y}%` }}
        >
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[color:var(--cta)]" />
          <span className="tabular text-[10.5px] font-bold text-white">≈{overlay.angle.value}</span>
        </span>
      )}
    </div>
  );
}
