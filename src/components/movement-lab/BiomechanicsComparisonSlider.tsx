import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { MuscleActivation } from "@/data/types";
import type { MuscleRegion } from "@/data/muscle-regions";
import type { AnalysisOverlayData } from "@/data/analysis-overlays";
import { cn } from "@/lib/utils";

/**
 * Comparador premium "Execução × Análise biomecânica".
 * REGRA CENTRAL: uma ÚNICA imagem-base nos dois lados. O lado direito é uma
 * camada de análise sobre a MESMA imagem (recortada por clip-path):
 *   base → overlay escuro navy + vignette → músculos revelados por MÁSCARA
 *   suave (a imagem de análise img2img, alinhada à base, aparece só nas
 *   regiões musculares autoradas) → poucas anotações finas → card de
 *   contribuição muscular em glass.
 * Alinhamento perfeito por construção; foco visual = o músculo.
 */

interface Props {
  baseSrc: string;
  analysisSrc: string;
  alt: string;
  regions: MuscleRegion[];
  ativacao: MuscleActivation[];
  overlay?: AnalysisOverlayData;
  className?: string;
}

const clamp = (n: number) => Math.max(0, Math.min(100, n));

// Cores por ordem de contribuição (1º quente → 3º ciano), conforme spec.
const BAR_COLORS = [
  "linear-gradient(90deg,#ef4444,#f97316)",
  "linear-gradient(90deg,#f59e0b,#fbbf24)",
  "linear-gradient(90deg,#14b8c4,#22d3ee)",
  "linear-gradient(90deg,#64748b,#94a3b8)",
];
const DOT_COLORS = ["#ef4444", "#f59e0b", "#14b8c4", "#94a3b8"];

export function BiomechanicsComparisonSlider({
  baseSrc,
  analysisSrc,
  alt,
  regions,
  ativacao,
  overlay,
  className,
}: Props) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState(50);
  const [dragging, setDragging] = React.useState(false);

  const updateFromClientX = React.useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos(clamp(((clientX - rect.left) / rect.width) * 100));
  }, []);

  React.useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => updateFromClientX(e.clientX);
    const up = () => setDragging(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [dragging, updateFromClientX]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") setPos((p) => clamp(p - 2));
    else if (e.key === "ArrowRight") setPos((p) => clamp(p + 2));
    else if (e.key === "Home") setPos(0);
    else if (e.key === "End") setPos(100);
    else return;
    e.preventDefault();
  };

  // Máscara suave (união de elipses) que revela a musculatura da imagem de
  // análise sobre a base — integrada à perna, sem contornos duros.
  const mask = React.useMemo(
    () =>
      regions
        .flatMap((r) => r.shapes)
        .map(
          (s) =>
            `radial-gradient(ellipse ${(s.rx * 1.55).toFixed(1)}% ${(s.ry * 1.6).toFixed(1)}% at ${s.cx}% ${s.cy}%, black 52%, transparent 96%)`,
        )
        .join(","),
    [regions],
  );

  // No corpo: apenas os 2 principais músculos como linha fina + rótulo.
  const rotulados = React.useMemo(() => {
    const enriched = regions
      .map((r) => {
        const a = ativacao.find((x) => x.musculo === r.musculo);
        return a ? { nome: r.musculo, pct: a.percentual, s: r.shapes[0] } : null;
      })
      .filter(Boolean) as { nome: string; pct: number; s: MuscleRegion["shapes"][0] }[];
    return enriched.sort((a, b) => b.pct - a.pct).slice(0, 2);
  }, [regions, ativacao]);

  // Card: contribuição muscular (dados reais do seed), até 4 linhas.
  const contribuicoes = React.useMemo(
    () => [...ativacao].sort((a, b) => b.percentual - a.percentual).slice(0, 4),
    [ativacao],
  );

  return (
    <div
      ref={containerRef}
      onPointerDown={(e) => {
        setDragging(true);
        updateFromClientX(e.clientX);
      }}
      className={cn(
        "relative aspect-[4/3] w-full touch-none select-none overflow-hidden rounded-card",
        "border border-slate-800 bg-slate-950",
        dragging ? "cursor-ew-resize" : "cursor-default",
        className,
      )}
    >
      {/* Base única: execução limpa */}
      <img src={baseSrc} alt={alt} draggable={false} className="absolute inset-0 h-full w-full object-cover" />

      {/* Camada de análise — a MESMA imagem, revelada à direita do slider */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
        <img src={baseSrc} alt="" aria-hidden draggable={false} className="absolute inset-0 h-full w-full object-cover" />
        {/* escurecimento navy + vignette */}
        <div className="absolute inset-0 bg-slate-950/55" />
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 75% 70% at 50% 46%, transparent 45%, rgba(2,6,23,0.55) 100%)" }}
        />
        {/* musculatura em foco: imagem de análise mascarada às regiões */}
        {mask && (
          <img
            src={analysisSrc}
            alt=""
            aria-hidden
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              maskImage: mask,
              WebkitMaskImage: mask,
              filter: "saturate(1.15) contrast(1.05) brightness(1.04)",
            }}
          />
        )}

        {/* Anotações mínimas: vetor de força + ângulo + 2 rótulos finos */}
        <svg viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden className="absolute inset-0 h-full w-full">
          <defs>
            <marker id="bio-arrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse">
              <path d="M0,0.8 L7.2,4 L0,7.2 Z" fill="#22d3ee" />
            </marker>
          </defs>
          {overlay?.force && (
            <line
              x1={overlay.force.x1 * 4}
              y1={overlay.force.y1 * 3}
              x2={overlay.force.x2 * 4}
              y2={overlay.force.y2 * 3}
              stroke="#22d3ee"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeDasharray="7 5"
              markerEnd="url(#bio-arrow)"
            />
          )}
          {rotulados.map((r) => {
            const x1 = (r.s.cx + Math.max(r.s.rx, r.s.ry) * 0.55) * 4;
            const y = r.s.cy * 3;
            return (
              <line
                key={r.nome}
                x1={x1}
                y1={y}
                x2={x1 + 34}
                y2={y}
                stroke="rgba(255,255,255,0.75)"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>

        {overlay?.force && (
          <span
            className="absolute -translate-y-1/2 whitespace-nowrap text-[10px] font-medium tracking-wide text-cyan-300/90 [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]"
            style={{ left: `${Math.min(overlay.force.x2 + 2.5, 82)}%`, top: `${overlay.force.y2}%` }}
          >
            Linha de força
          </span>
        )}
        {overlay?.angle && (
          <span
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-md border border-white/15 bg-slate-950/80 px-2 py-0.5 text-[10.5px] font-bold tabular-nums text-white backdrop-blur-sm"
            style={{ left: `${overlay.angle.x}%`, top: `${overlay.angle.y}%` }}
          >
            ≈{overlay.angle.value}
          </span>
        )}
        {rotulados.map((r) => {
          const lx = r.s.cx + Math.max(r.s.rx, r.s.ry) * 0.55 + 9.2;
          return (
            <span
              key={r.nome}
              className="absolute -translate-y-1/2 whitespace-nowrap text-[11px] font-medium text-white/95 [text-shadow:0_1px_3px_rgba(0,0,0,0.85)]"
              style={{ left: `${Math.min(lx, 78)}%`, top: `${r.s.cy}%` }}
            >
              {r.nome}
            </span>
          );
        })}

        {/* Card: contribuição muscular (glass, canto inferior direito) */}
        <div className="absolute bottom-2.5 right-2.5 w-64 max-w-[68%] rounded-xl border border-white/15 bg-slate-950/70 p-2.5 backdrop-blur-md sm:bottom-3 sm:right-3 sm:p-3">
          <div className="mb-2 text-[11px] font-semibold tracking-wide text-white/85">Contribuição muscular</div>
          <div className="space-y-1.5">
            {contribuicoes.map((m, i) => (
              <div key={m.musculo} className="flex items-center gap-1.5">
                <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: DOT_COLORS[i] }} />
                <span className="min-w-0 flex-1 truncate text-[11px] leading-tight text-white/90">{m.musculo}</span>
                <span className="h-1 w-12 shrink-0 overflow-hidden rounded-full bg-white/12 sm:w-16">
                  <span className="block h-full rounded-full" style={{ width: `${m.percentual}%`, background: BAR_COLORS[i] }} />
                </span>
                <span className="tabular w-8 shrink-0 text-right text-[11px] font-bold leading-tight text-white">
                  {m.percentual}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pills */}
      <span className="pointer-events-none absolute left-3 top-3 rounded-full border border-white/15 bg-slate-950/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
        Execução
      </span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full border border-cyan-400/25 bg-slate-950/60 px-3 py-1 text-xs font-semibold text-cyan-300 backdrop-blur-sm">
        Análise biomecânica
      </span>

      {/* Divisor + handle */}
      <div
        aria-hidden
        className="absolute inset-y-0 z-10 w-px bg-cyan-300/90 shadow-[0_0_8px_rgba(34,211,238,0.55)]"
        style={{ left: `${pos}%` }}
      />
      <div
        role="slider"
        tabIndex={0}
        aria-label="Comparar execução e análise biomecânica"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        aria-valuetext={`${Math.round(pos)}% de análise revelada`}
        onKeyDown={onKeyDown}
        onPointerDown={(e) => {
          e.stopPropagation();
          setDragging(true);
        }}
        className={cn(
          "absolute top-1/2 z-20 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize place-items-center",
          "rounded-full border border-cyan-400/40 bg-slate-950/85 text-cyan-300 shadow-elevated backdrop-blur-sm",
          "transition-transform duration-150 hover:scale-105 focus-visible:scale-105",
        )}
        style={{ left: `${pos}%` }}
      >
        <span className="flex items-center">
          <ChevronLeft className="h-3.5 w-3.5" />
          <ChevronRight className="-ml-1 h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  );
}
