import * as React from "react";
import type { MuscleActivation } from "@/data/types";
import type { MuscleRegion } from "@/data/muscle-regions";
import { cn } from "@/lib/utils";

/**
 * Tags AR DENTRO da imagem de análise — nada de rótulos externos nem linhas:
 * um ponto discreto sobre cada músculo; o músculo ativo mostra o chip de vidro
 * (nome · %) ancorado nele mesmo. O músculo primário já abre selecionado, então
 * a imagem se explica sozinha. Hover/toque em outro ponto troca a seleção;
 * clique fixa. Teclado: Tab percorre os pontos, Enter fixa, Esc solta.
 */

const PAPEL_META: Record<string, { label: string; color: string }> = {
  primário: { label: "músculo primário", color: "#ef4444" },
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

  // O músculo de maior ativação (primário) abre selecionado por padrão.
  const padrao = React.useMemo(
    () => enriched.reduce((m, r) => (r.percentual > (m?.percentual ?? -1) ? r : m), enriched[0])?.musculo ?? null,
    [enriched],
  );

  const [active, setActive] = React.useState<string | null>(padrao);
  const [pinned, setPinned] = React.useState(false);
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

  if (enriched.length === 0) return null;

  const enter = (m: string) => {
    if (!pinned) setActive(m);
  };
  const leave = () => {
    if (!pinned) setActive(padrao);
  };
  const togglePin = (m: string) => {
    if (pinned && active === m) {
      setPinned(false);
      setActive(padrao);
    } else {
      setActive(m);
      setPinned(true);
    }
  };

  const current = active ? enriched.find((r) => r.musculo === active) : null;
  const anchor = current?.shapes[0];
  const meta = current ? (PAPEL_META[current.papel] ?? PAPEL_META["sinergista"]) : null;
  const above = anchor ? anchor.cy - anchor.ry > 20 : true;
  const chipLeft = anchor ? Math.max(16, Math.min(84, anchor.cx)) : 50;
  const chipTop = anchor ? (above ? anchor.cy - anchor.ry - 2 : anchor.cy + anchor.ry + 2) : 0;

  return (
    <>
      {/* Vinheta de foco */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 62% 58% at ${focal.x}% ${focal.y}%, transparent 38%, rgba(2,6,23,0.12) 62%, rgba(2,6,23,0.52) 100%)`,
        }}
      />

      {/* Regiões (hover acende o contorno do músculo ativo) */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
        className="absolute inset-0 h-full w-full"
      >
        {enriched.map((r) => {
          const isActive = active === r.musculo;
          return (
            <g
              key={r.musculo}
              onMouseEnter={() => enter(r.musculo)}
              onMouseLeave={leave}
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
                  className="transition-[fill-opacity,stroke-opacity] duration-200"
                  style={{
                    fill: "#fff",
                    fillOpacity: isActive ? 0.13 : 0,
                    stroke: "#fff",
                    strokeWidth: 1.5,
                    strokeOpacity: isActive ? 0.85 : 0,
                    filter: isActive ? "drop-shadow(0 0 4px rgba(255,255,255,0.55))" : undefined,
                  }}
                />
              ))}
            </g>
          );
        })}
      </svg>

      {/* Pontos AR sobre cada músculo */}
      {enriched.map((r) => {
        const isActive = active === r.musculo;
        const m = PAPEL_META[r.papel] ?? PAPEL_META["sinergista"];
        return r.shapes.map((s, i) => (
          <button
            key={`${r.musculo}-${i}`}
            type="button"
            tabIndex={i === 0 ? 0 : -1}
            aria-hidden={i > 0 || undefined}
            aria-label={
              i === 0 ? `${r.musculo}: ${r.percentual}% de ativação estimada, ${m.label}` : undefined
            }
            aria-pressed={i === 0 ? pinned && isActive : undefined}
            onMouseEnter={() => enter(r.musculo)}
            onMouseLeave={leave}
            onFocus={() => setActive(r.musculo)}
            onBlur={() => {
              setPinned(false);
              setActive(padrao);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              togglePin(r.musculo);
            }}
            className="absolute z-20 grid h-6 w-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full outline-none"
            style={{ left: `${s.cx}%`, top: `${s.cy}%` }}
          >
            <span
              className={cn(
                "block rounded-full ring-2 ring-white/95 shadow-[0_1px_4px_rgba(0,0,0,0.45)] transition-transform duration-150",
                isActive ? "h-3 w-3 scale-110" : "h-2.5 w-2.5",
              )}
              style={{ background: m.color }}
            />
          </button>
        ));
      })}

      {/* Chip do músculo ativo — ancorado NO próprio músculo */}
      {current && anchor && meta && (
        <div
          role="status"
          className="pointer-events-none absolute z-30 transition-all duration-200"
          style={{
            left: `${chipLeft}%`,
            top: `${chipTop}%`,
            transform: `translate(-50%, ${above ? "-100%" : "0"})`,
          }}
        >
          <div className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-white/20 bg-slate-900/80 px-2.5 py-1.5 shadow-elevated backdrop-blur-sm">
            <span aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ background: meta.color }} />
            <span className="text-xs font-semibold text-white">{current.musculo}</span>
            <span className="tabular text-sm font-bold text-white">{current.percentual}%</span>
          </div>
          <div className="mt-0.5 text-center text-[9.5px] font-semibold uppercase tracking-wider text-white/85 [text-shadow:0_1px_2px_rgba(0,0,0,0.7)]">
            {meta.label}
          </div>
        </div>
      )}
    </>
  );
}
