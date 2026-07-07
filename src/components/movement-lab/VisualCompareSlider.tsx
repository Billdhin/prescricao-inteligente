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

        {/* Hotspots (na camada de análise) */}
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
            className="absolute z-20 grid h-6 w-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-analysis text-white shadow-elevated"
            style={{ left: `${h.x}%`, top: `${h.y}%` }}
          >
            {!reduce && (
              <span className="absolute inset-0 animate-pulseDot rounded-full bg-analysis opacity-60" />
            )}
            <span className="relative h-1.5 w-1.5 rounded-full bg-white" />
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
  { key: "resumo", label: "Resumo prático" },
  { key: "biomecanica", label: "Biomecânica" },
  { key: "fisiologia", label: "Fisiologia aplicada" },
  { key: "evidencia", label: "Evidência / observação" },
  { key: "cuidados", label: "Cuidados e exceções" },
] as const;

function HotspotDialog({ hotspot, onClose }: { hotspot: Hotspot; onClose: () => void }) {
  const [level, setLevel] = React.useState(1);
  const dialogRef = useDialog<HTMLDivElement>(onClose);

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
        className="w-full max-w-md rounded-card bg-surface p-5 shadow-elevated outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-bold text-ink">{hotspot.titulo}</h3>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-md p-2.5 text-ink-3 hover:bg-surface-soft"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-2">
          {CAMADAS.slice(0, level).map((c, i) => (
            <div key={c.key} className="rounded-lg border border-border bg-surface-soft p-3">
              <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
                <span className="tabular grid h-4 w-4 place-items-center rounded-full bg-primary text-[10px] text-white">
                  {i + 1}
                </span>
                {c.label}
              </div>
              <p className="text-sm text-ink">{hotspot.camadas[c.key]}</p>
            </div>
          ))}
        </div>
        {level < CAMADAS.length ? (
          <button
            onClick={() => setLevel((n) => n + 1)}
            className="mt-3 rounded-lg bg-primary-tint px-3 py-1.5 text-xs font-semibold text-primary"
          >
            Aprofundar em {CAMADAS[level].label} →
          </button>
        ) : (
          <p className="mt-3 text-xs text-ink-3">Você viu todas as camadas desta análise.</p>
        )}
      </div>
    </div>
  );
}
