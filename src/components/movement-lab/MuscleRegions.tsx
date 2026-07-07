import * as React from "react";
import type { MuscleActivation } from "@/data/types";
import type { MuscleRegion } from "@/data/muscle-regions";
import { cn } from "@/lib/utils";

/**
 * PRANCHA ANATÔMICA sobre a imagem de análise — estilo atlas: rótulos fixos na
 * margem direita, ligados por linhas-guia finas ao músculo exato. O rótulo já
 * traz nome, % de ativação e papel (ponto colorido). Hover/toque/foco no rótulo
 * (ou no próprio músculo) acende a região correspondente na foto.
 * Nada de tooltips flutuantes nem contornos sempre visíveis: uma linguagem só.
 */

const PAPEL_META: Record<string, { label: string; color: string }> = {
  primário: { label: "músculo primário", color: "#ef4444" },
  sinergista: { label: "sinergista", color: "#f59e0b" },
  estabilizador: { label: "estabilizador", color: "#14b8c4" },
};

const LABEL_X = 96; // % — coluna de rótulos na margem direita (lado da análise)
const MIN_GAP = 12; // % — espaçamento vertical mínimo entre rótulos

export function MuscleRegions({
  regions,
  ativacao,
}: {
  regions: MuscleRegion[];
  ativacao: MuscleActivation[];
}) {
  const [active, setActive] = React.useState<string | null>(null);
  const [pinned, setPinned] = React.useState(false);

  // Junta região autorada + dados científicos do seed e calcula a posição dos
  // rótulos: ordenados pela altura do músculo, com colisões resolvidas.
  const items = React.useMemo(() => {
    const enriched = regions
      .map((r) => {
        const a = ativacao.find((x) => x.musculo === r.musculo);
        return a ? { ...r, percentual: a.percentual, papel: a.papel } : null;
      })
      .filter(Boolean) as (MuscleRegion & { percentual: number; papel: string })[];

    const sorted = [...enriched].sort((a, b) => a.shapes[0].cy - b.shapes[0].cy);
    let prev = -Infinity;
    const withY = sorted.map((r) => {
      let y = Math.max(10, Math.min(88, r.shapes[0].cy));
      if (y < prev + MIN_GAP) y = prev + MIN_GAP;
      prev = y;
      return { ...r, labelY: y };
    });
    // se estourou embaixo, empurra o bloco todo para cima
    const overflow = prev - 92;
    return overflow > 0 ? withY.map((r) => ({ ...r, labelY: r.labelY - overflow })) : withY;
  }, [regions, ativacao]);

  if (items.length === 0) return null;

  const enter = (m: string) => {
    if (!pinned) setActive(m);
  };
  const leaveAll = () => {
    if (!pinned) setActive(null);
  };
  const togglePin = (m: string) => {
    if (pinned && active === m) {
      setPinned(false);
      setActive(null);
    } else {
      setActive(m);
      setPinned(true);
    }
  };

  return (
    <>
      {/* Linhas-guia + regiões (SVG esticado; traços com espessura constante) */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
        className="absolute inset-0 h-full w-full"
      >
        {items.map((r) => {
          const isActive = active === r.musculo;
          const dimmed = active !== null && !isActive;
          const a = r.shapes[0];
          return (
            <g key={r.musculo} className="transition-opacity duration-150" opacity={dimmed ? 0.35 : 1}>
              {/* linha-guia: rótulo → músculo, com ponto na extremidade */}
              <line
                x1={LABEL_X}
                y1={r.labelY}
                x2={a.cx}
                y2={a.cy}
                stroke="#fff"
                strokeOpacity={isActive ? 0.95 : 0.55}
                strokeWidth={isActive ? 1.5 : 1}
                vectorEffect="non-scaling-stroke"
              />
              <circle
                cx={a.cx}
                cy={a.cy}
                r={0.7}
                fill="#fff"
                fillOpacity={isActive ? 1 : 0.75}
              />
              {/* região: invisível em repouso; acende no hover/foco */}
              <g
                onMouseEnter={() => enter(r.musculo)}
                onMouseLeave={leaveAll}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  togglePin(r.musculo);
                }}
                className="cursor-pointer"
                style={{ pointerEvents: "all" }}
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
                    className="transition-[fill-opacity,stroke-opacity] duration-150"
                    style={{
                      fill: "#fff",
                      fillOpacity: isActive ? 0.16 : 0,
                      stroke: "#fff",
                      strokeWidth: 1.5,
                      strokeOpacity: isActive ? 0.9 : 0,
                      filter: isActive ? "drop-shadow(0 0 4px rgba(255,255,255,0.6))" : undefined,
                    }}
                  />
                ))}
              </g>
            </g>
          );
        })}
      </svg>

      {/* Rótulos (HTML: tipografia nítida + alvos de toque/teclado) */}
      {items.map((r) => {
        const isActive = active === r.musculo;
        const dimmed = active !== null && !isActive;
        const meta = PAPEL_META[r.papel] ?? PAPEL_META["sinergista"];
        return (
          <button
            key={r.musculo}
            type="button"
            aria-label={`${r.musculo}: ${r.percentual}% de ativação estimada, ${meta.label}`}
            aria-pressed={pinned && isActive}
            onMouseEnter={() => enter(r.musculo)}
            onMouseLeave={leaveAll}
            onFocus={() => setActive(r.musculo)}
            onBlur={() => {
              setPinned(false);
              setActive(null);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              togglePin(r.musculo);
            }}
            className={cn(
              "absolute z-20 flex max-w-[44%] -translate-y-1/2 items-center gap-1.5 rounded-md",
              "border px-2 py-1 text-left backdrop-blur-sm transition-all duration-150",
              isActive
                ? "border-white/50 bg-slate-900/85 shadow-elevated"
                : "border-white/15 bg-slate-900/65",
              dimmed && "opacity-50",
            )}
            style={{ right: "1.5%", top: `${r.labelY}%` }}
          >
            <span
              aria-hidden
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: meta.color }}
            />
            <span className="truncate text-[10.5px] font-medium leading-tight text-white/95">
              {r.musculo}
            </span>
            <span className="tabular shrink-0 text-[11px] font-bold leading-tight text-white">
              {r.percentual}%
            </span>
          </button>
        );
      })}
    </>
  );
}
