import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Hotspot } from "@/data/types";
import { cn } from "@/lib/utils";
import { useDialog } from "@/lib/useDialog";
import { Pill } from "@/components/ui/primitives";

interface Props {
  before: React.ReactNode;
  after: React.ReactNode;
  beforeLabel?: string;
  afterLabel?: string;
  initialPosition?: number;
  hotspots?: Hotspot[];
  className?: string;
}

const clamp = (n: number) => Math.max(0, Math.min(100, n));

export function VisualCompareSlider({
  before,
  after,
  beforeLabel = "Execução",
  afterLabel = "Análise biomecânica",
  initialPosition = 50,
  hotspots = [],
  className,
}: Props) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState(clamp(initialPosition));
  const [dragging, setDragging] = React.useState(false);
  const [openHotspot, setOpenHotspot] = React.useState<Hotspot | null>(null);
  const reduce = useReducedMotion();

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
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setPos((p) => clamp(p - 2));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setPos((p) => clamp(p + 2));
    } else if (e.key === "Home") {
      e.preventDefault();
      setPos(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setPos(100);
    }
  };

  return (
    <>
      <div
        ref={containerRef}
        className={cn(
          "relative aspect-[4/3] w-full touch-none select-none overflow-hidden rounded-card border border-border bg-surface-soft",
          className,
        )}
        onPointerDown={(e) => {
          setDragging(true);
          updateFromClientX(e.clientX);
        }}
      >
        {/* Camada base: execução */}
        <div className="absolute inset-0">{before}</div>

        {/* Camada por cima: análise, revelada da divisória para a direita */}
        <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
          {after}
        </div>

        {/* Labels */}
        <div className="pointer-events-none absolute left-3 top-3">
          <Pill tone="neutral" className="bg-white/85 shadow-soft">
            {beforeLabel}
          </Pill>
        </div>
        <div className="pointer-events-none absolute right-3 top-3">
          <Pill tone="analysis" className="shadow-soft">
            {afterLabel}
          </Pill>
        </div>

        {/* Hotspots (pontos de aprofundamento): anéis discretos de instrumento */}
        {hotspots.map((h) => (
          <button
            key={h.id}
            type="button"
            aria-label={`Abrir análise: ${h.titulo}`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setOpenHotspot(h);
            }}
            className={cn(
              "absolute z-20 grid h-5 w-5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full",
              "border-2 border-white/90 bg-slate-900/40 shadow-soft backdrop-blur-[2px]",
              !reduce && "transition-transform duration-150 hover:scale-125 focus-visible:scale-125",
            )}
            style={{ left: `${h.x}%`, top: `${h.y}%` }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-analysis" />
          </button>
        ))}

        {/* Divisória + alça */}
        <div className="absolute inset-y-0 z-10 w-px bg-white/90 shadow-[0_0_0_1px_rgba(20,184,196,.4)]" style={{ left: `${pos}%` }} />
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
          className="absolute top-1/2 z-20 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize place-items-center rounded-full border border-border bg-surface text-ink shadow-elevated"
          style={{ left: `${pos}%` }}
        >
          <span className="flex items-center text-ink-3">
            <ChevronLeft className="h-3.5 w-3.5" />
            <ChevronRight className="-ml-1 h-3.5 w-3.5" />
          </span>
        </div>
      </div>

      {/* Popover do hotspot: progressive disclosure em camadas */}
      {openHotspot && <HotspotDialog hotspot={openHotspot} onClose={() => setOpenHotspot(null)} />}
    </>
  );
}

const CAMADAS = [
  { key: "resumo", label: "Resumo prático", short: "Resumo" },
  { key: "biomecanica", label: "Biomecânica", short: "Biomecânica" },
  { key: "fisiologia", label: "Fisiologia aplicada", short: "Fisiologia" },
  { key: "evidencia", label: "Evidência / observação", short: "Evidência" },
  { key: "cuidados", label: "Cuidados e exceções", short: "Cuidados" },
] as const;

/**
 * Modal do ponto de análise: altura ESTÁVEL (não cresce a cada clique), uma
 * camada por vez, navegável por segmentos, setas do teclado e Anterior/Próxima.
 */
function HotspotDialog({ hotspot, onClose }: { hotspot: Hotspot; onClose: () => void }) {
  const [idx, setIdx] = React.useState(0);
  const dialogRef = useDialog<HTMLDivElement>(onClose);
  const cam = CAMADAS[idx];

  const onTabsKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setIdx((i) => Math.min(CAMADAS.length - 1, i + 1));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setIdx((i) => Math.max(0, i - 1));
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={hotspot.titulo}
        className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-card bg-surface shadow-elevated outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <div className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
              Ponto de análise
            </div>
            <h3 className="truncate font-display text-lg font-bold text-ink">{hotspot.titulo}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="shrink-0 rounded-md p-2.5 text-ink-3 hover:bg-surface-soft"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Camadas (segmentos) */}
        <div
          role="tablist"
          aria-label="Camadas da análise"
          onKeyDown={onTabsKeyDown}
          className="flex gap-1 overflow-x-auto px-5 pt-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {CAMADAS.map((c, i) => {
            const on = i === idx;
            const visto = i < idx;
            return (
              <button
                key={c.key}
                role="tab"
                aria-selected={on}
                tabIndex={on ? 0 : -1}
                onClick={() => setIdx(i)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                  on
                    ? "bg-primary text-white"
                    : visto
                      ? "bg-primary-tint text-primary hover:bg-primary-tint"
                      : "bg-surface-soft text-ink-2 hover:text-ink",
                )}
              >
                {c.short}
              </button>
            );
          })}
        </div>

        {/* Conteúdo da camada (altura mínima estável) */}
        <div className="min-h-[8.5rem] flex-1 overflow-y-auto px-5 py-4" role="tabpanel">
          <div className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
            {cam.label}
          </div>
          <p className="mt-1.5 text-[15px] leading-relaxed text-ink">{hotspot.camadas[cam.key]}</p>
        </div>

        {/* Navegação */}
        <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3">
          <button
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            disabled={idx === 0}
            className="inline-flex items-center gap-1 rounded-control px-3 py-2 text-sm font-semibold text-ink-2 hover:text-ink disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" /> Anterior
          </button>
          <span className="tabular text-xs font-medium text-ink-3">
            {idx + 1} de {CAMADAS.length}
          </span>
          {idx < CAMADAS.length - 1 ? (
            <button
              onClick={() => setIdx((i) => i + 1)}
              className="inline-flex items-center gap-1 rounded-control bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
            >
              Próxima <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1 rounded-control border border-border bg-surface px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-soft"
            >
              Concluir
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
