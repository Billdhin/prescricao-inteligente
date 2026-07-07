import * as React from "react";
import { createPortal } from "react-dom";
import type { MuscleActivation } from "@/data/types";
import type { MuscleRegion } from "@/data/muscle-regions";
import { cn } from "@/lib/utils";

/**
 * Camada interativa sobre a imagem de ANÁLISE: passe o mouse (ou toque) numa
 * região muscular e veja nome, % de ativação estimada e papel no movimento.
 * - Desktop: hover mostra o tooltip; clique fixa/solta.
 * - Toque: 1º toque mostra, toque fora fecha.
 * - Teclado: cada músculo é focável (Tab); Enter/Espaço fixa, Esc fecha.
 * Coordenadas em % (viewBox 0 0 100 100, esticado na caixa 4:3 da foto).
 */

const PAPEL_META: Record<string, { label: string; color: string }> = {
  primário: { label: "músculo primário", color: "#ef4444" },
  sinergista: { label: "sinergista", color: "var(--warning)" },
  estabilizador: { label: "estabilizador", color: "var(--analysis)" },
};

export function MuscleRegions({
  regions,
  ativacao,
}: {
  regions: MuscleRegion[];
  ativacao: MuscleActivation[];
}) {
  const [active, setActive] = React.useState<string | null>(null);
  const [pinned, setPinned] = React.useState(false);
  const [touched, setTouched] = React.useState(false);
  const svgRef = React.useRef<SVGSVGElement>(null);

  // Fecha ao rolar (o tooltip é fixo na viewport; rolar desalinharia).
  React.useEffect(() => {
    if (!active) return;
    const close = () => {
      setPinned(false);
      setActive(null);
    };
    window.addEventListener("scroll", close, { passive: true });
    return () => window.removeEventListener("scroll", close);
  }, [active]);

  // Junta região autorada + dados científicos do seed (percentual/papel).
  const enriched = React.useMemo(
    () =>
      regions
        .map((r) => {
          const a = ativacao.find((x) => x.musculo === r.musculo);
          return a ? { ...r, percentual: a.percentual, papel: a.papel } : null;
        })
        .filter(Boolean) as (MuscleRegion & { percentual: number; papel: string })[],
    [regions, ativacao],
  );

  if (enriched.length === 0) return null;

  const current = active ? enriched.find((r) => r.musculo === active) : null;

  const show = (m: string) => {
    setActive(m);
    setTouched(true);
  };
  const leave = () => {
    if (!pinned) setActive(null);
  };
  const togglePin = (m: string) => {
    setTouched(true);
    if (pinned && active === m) {
      setPinned(false);
      setActive(null);
    } else {
      setActive(m);
      setPinned(true);
    }
  };

  // Tooltip ancorado na 1ª elipse do músculo; acima dela (ou abaixo, se perto do
  // topo). Renderizado via portal (position: fixed) para ficar acima dos hotspots —
  // o clip-path do lado de análise cria um stacking context que prenderia o z-index.
  const anchor = current?.shapes[0];
  const box = svgRef.current?.getBoundingClientRect();
  const tipAbove = anchor ? anchor.cy - anchor.ry > 26 : true;
  const tipLeftPct = anchor ? Math.max(20, Math.min(80, anchor.cx)) : 50;
  const tipTopPct = anchor ? (tipAbove ? anchor.cy - anchor.ry - 2 : anchor.cy + anchor.ry + 2) : 0;
  const tipX = box ? box.left + (tipLeftPct / 100) * box.width : 0;
  const tipY = box ? box.top + (tipTopPct / 100) * box.height : 0;

  return (
    <>
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-label="Regiões musculares interativas"
        className="absolute inset-0 h-full w-full"
      >
        {enriched.map((r) => {
          const isActive = active === r.musculo;
          const meta = PAPEL_META[r.papel] ?? PAPEL_META["sinergista"];
          return (
            <g
              key={r.musculo}
              role="button"
              tabIndex={0}
              aria-label={`${r.musculo}: ${r.percentual}% de ativação estimada, ${meta.label}`}
              className="muscle-region cursor-pointer"
              onMouseEnter={() => show(r.musculo)}
              onMouseLeave={leave}
              onFocus={() => {
                setActive(r.musculo);
                setPinned(true);
                setTouched(true);
              }}
              onBlur={() => {
                setPinned(false);
                setActive(null);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                togglePin(r.musculo);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  togglePin(r.musculo);
                } else if (e.key === "Escape") {
                  setPinned(false);
                  setActive(null);
                }
              }}
            >
              {r.shapes.map((s, i) => (
                <ellipse
                  key={i}
                  cx={s.cx}
                  cy={s.cy}
                  rx={s.rx}
                  ry={s.ry}
                  transform={s.rot ? `rotate(${s.rot} ${s.cx} ${s.cy})` : undefined}
                  vectorEffect="non-scaling-stroke"
                  className="transition-[fill,stroke-opacity] duration-150"
                  style={{
                    fill: isActive ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.01)",
                    stroke: "#fff",
                    strokeWidth: isActive ? 2 : 1.25,
                    strokeOpacity: isActive ? 0.95 : 0.45,
                    strokeDasharray: isActive ? "none" : "4 4",
                    filter: isActive ? "drop-shadow(0 0 4px rgba(255,255,255,0.7))" : undefined,
                  }}
                />
              ))}
            </g>
          );
        })}
      </svg>

      {/* Tooltip científico (portal: acima de hotspots/divisor) */}
      {current &&
        box &&
        createPortal(
        <div
          role="status"
          className="pointer-events-none fixed z-50 w-52"
          style={{
            left: tipX,
            top: tipY,
            transform: `translate(-50%, ${tipAbove ? "-100%" : "0"})`,
          }}
        >
          <div className="rounded-xl border border-border bg-white/95 p-3 shadow-elevated backdrop-blur">
            <div className="flex items-baseline justify-between gap-2">
              <span className="min-w-0 truncate text-sm font-bold text-ink">{current.musculo}</span>
              <span className="tabular shrink-0 font-display text-base font-extrabold text-ink">
                {current.percentual}%
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-soft">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${current.percentual}%`,
                  background: (PAPEL_META[current.papel] ?? PAPEL_META["sinergista"]).color,
                }}
              />
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: (PAPEL_META[current.papel] ?? PAPEL_META["sinergista"]).color }}
              />
              {(PAPEL_META[current.papel] ?? PAPEL_META["sinergista"]).label} · ativação estimada
            </div>
          </div>
        </div>,
        document.body,
      )}

      {/* Dica até a primeira interação */}
      {!touched && (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full",
            "bg-black/55 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm",
          )}
        >
          Passe o mouse (ou toque) nos músculos destacados
        </div>
      )}
    </>
  );
}
