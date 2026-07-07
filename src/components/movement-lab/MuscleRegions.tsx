import * as React from "react";
import type { MuscleActivation } from "@/data/types";
import type { MuscleRegion } from "@/data/muscle-regions";
import { cn } from "@/lib/utils";

/**
 * Padrão da indústria (Muscle&Motion, players de vídeo): NADA flutua sobre a
 * anatomia. A imagem carrega apenas o BRILHO do músculo ativo; a informação
 * vive numa BARRA encaixada na base da imagem, com os músculos como chips
 * (nome · %) ordenados por ativação. O primário abre selecionado. Selecionar
 * um chip (ou passar o mouse na própria região) acende o músculo na foto.
 * Sobreposição é impossível por construção.
 */

const PAPEL_META: Record<string, { label: string; color: string }> = {
  primário: { label: "primário", color: "#ef4444" },
  sinergista: { label: "sinergista", color: "#f59e0b" },
  estabilizador: { label: "estabilizador", color: "#14b8c4" },
};

export function MuscleRegions({
  regions,
  ativacao,
}: {
  regions: MuscleRegion[];
  ativacao: MuscleActivation[];
}) {
  // Junta região autorada + dados do seed, ordenado por ativação (desc).
  const items = React.useMemo(
    () =>
      regions
        .map((r) => {
          const a = ativacao.find((x) => x.musculo === r.musculo);
          return a ? { ...r, percentual: a.percentual, papel: a.papel } : null;
        })
        .filter(Boolean)
        .sort((a, b) => b!.percentual - a!.percentual) as (MuscleRegion & {
        percentual: number;
        papel: string;
      })[],
    [regions, ativacao],
  );

  const padrao = items[0]?.musculo ?? null;
  const [active, setActive] = React.useState<string | null>(padrao);
  React.useEffect(() => setActive(padrao), [padrao]);

  // Vinheta de foco no centroide das regiões (fundo recua, músculo salta).
  const focal = React.useMemo(() => {
    const pts = regions.flatMap((r) => r.shapes.map((s) => ({ x: s.cx, y: s.cy })));
    if (!pts.length) return { x: 50, y: 50 };
    return {
      x: pts.reduce((s, p) => s + p.x, 0) / pts.length,
      y: pts.reduce((s, p) => s + p.y, 0) / pts.length,
    };
  }, [regions]);

  if (items.length === 0) return null;

  return (
    <>
      {/* Vinheta de foco */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 62% 58% at ${focal.x}% ${focal.y}%, transparent 38%, rgba(2,6,23,0.12) 62%, rgba(2,6,23,0.55) 100%)`,
        }}
      />

      {/* Regiões: só o BRILHO do músculo ativo (hover na foto também seleciona) */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
        className="absolute inset-0 h-full w-full"
      >
        {items.map((r) => {
          const isActive = active === r.musculo;
          return (
            <g
              key={r.musculo}
              onMouseEnter={() => setActive(r.musculo)}
              onMouseLeave={() => setActive(padrao)}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setActive(r.musculo);
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
                  className="transition-[fill-opacity,stroke-opacity] duration-200"
                  style={{
                    fill: "#fff",
                    fillOpacity: isActive ? 0.14 : 0,
                    stroke: "#fff",
                    strokeWidth: 1.5,
                    strokeOpacity: isActive ? 0.9 : 0,
                    filter: isActive ? "drop-shadow(0 0 5px rgba(255,255,255,0.6))" : undefined,
                  }}
                />
              ))}
            </g>
          );
        })}
      </svg>

      {/* Barra de músculos encaixada na base (padrão player de vídeo) */}
      <div
        role="tablist"
        aria-label="Músculos ativados neste exercício"
        onPointerDown={(e) => e.stopPropagation()}
        className={cn(
          "absolute inset-x-2 bottom-2 z-20 flex items-center gap-1 overflow-x-auto rounded-xl",
          "border border-white/15 bg-slate-900/75 p-1.5 backdrop-blur-md",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        {items.map((r) => {
          const isActive = active === r.musculo;
          const meta = PAPEL_META[r.papel] ?? PAPEL_META["sinergista"];
          return (
            <button
              key={r.musculo}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`${r.musculo}: ${r.percentual}% de ativação estimada, músculo ${meta.label}`}
              onClick={(e) => {
                e.stopPropagation();
                setActive(r.musculo);
              }}
              onMouseEnter={() => setActive(r.musculo)}
              onFocus={() => setActive(r.musculo)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 transition-colors",
                isActive ? "bg-white/16 ring-1 ring-white/35" : "hover:bg-white/8",
              )}
            >
              <span aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ background: meta.color }} />
              <span className={cn("text-xs font-semibold leading-none", isActive ? "text-white" : "text-white/75")}>
                {r.musculo}
              </span>
              <span className={cn("tabular text-xs font-bold leading-none", isActive ? "text-white" : "text-white/75")}>
                {r.percentual}%
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
