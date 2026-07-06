import type { AnalysisOverlayData } from "@/data/analysis-overlays";

/**
 * Camada vetorial de biomecânica desenhada por cima da imagem de análise (img2img,
 * musculatura já alinhada à pose). Aqui só entram os marcadores que EU controlo com
 * precisão: linha de força (tracejada) + ângulo articular. Coordenadas em % (0–100).
 * SVG em viewBox 400×300 (mesma proporção 4:3) => geometria sem distorção.
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
            viewBox="0 0 10 10"
            refX="7"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" fill="#2563eb" />
          </marker>
        </defs>

        {overlay.force && (
          <>
            {/* halo p/ legibilidade sobre a imagem */}
            <line
              x1={X(overlay.force.x1)}
              y1={Y(overlay.force.y1)}
              x2={X(overlay.force.x2)}
              y2={Y(overlay.force.y2)}
              stroke="#ffffff"
              strokeOpacity={0.5}
              strokeWidth={5}
              strokeLinecap="round"
            />
            <line
              x1={X(overlay.force.x1)}
              y1={Y(overlay.force.y1)}
              x2={X(overlay.force.x2)}
              y2={Y(overlay.force.y2)}
              stroke="#2563eb"
              strokeWidth={3}
              strokeLinecap="round"
              strokeDasharray="8 5"
              markerEnd="url(#force-arrow)"
            />
          </>
        )}
      </svg>

      {overlay.angle && (
        <span
          className="absolute rounded-full bg-[color:var(--cta)] px-2 py-0.5 text-[11px] font-bold text-white shadow"
          style={{
            left: `${overlay.angle.x}%`,
            top: `${overlay.angle.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          ≈{overlay.angle.value}
        </span>
      )}
    </div>
  );
}
