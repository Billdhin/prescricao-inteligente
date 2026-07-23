import * as React from "react";
import { Play, Pause, ArrowUp, ArrowDown, Pause as PauseGlyph } from "lucide-react";
import { withBase, cn } from "@/lib/utils";
import { getFasePose } from "@/data/fase-poses";
import { FaseFigure, faseKind, type FaseKind } from "@/components/movement-lab/FaseFigure";

/**
 * Player do MOVIMENTO: anima a execução do exercício em loop, feito das FOTOS
 * REAIS já verificadas de cada fase (public/fases/<slug>-n.webp, mesma pessoa e
 * câmera, só muda a posição). Não há vídeo gerado por IA nem quadro inventado:
 * é uma sequência das poses reais em ciclo, então o movimento mostrado é o
 * correto. Leve (reusa webp que já está no bundle) e respeita reduced-motion.
 *
 * Sem fotos de fase, cai no esquema vetorial animado do músculo (FaseFigure),
 * que serve para qualquer atividade sem afirmar uma pose que não temos.
 */

type FaseMin = { nome: string; descricao: string };
type ExMin = { slug: string; fases: FaseMin[]; ativacao?: { musculo: string }[] };

const CHIP: Record<FaseKind, string> = { ecc: "Alongando", iso: "Ponto de virada", con: "Encurtando" };
const DirIcon: Record<FaseKind, typeof ArrowUp> = { ecc: ArrowDown, iso: PauseGlyph, con: ArrowUp };

function usaReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function MovimentoPlayer({ ex, className }: { ex: ExMin; className?: string }) {
  const fases = ex.fases;
  const total = fases.length;
  const musculo = ex.ativacao?.[0]?.musculo;

  // Fotos reais das fases (todas presentes = modo foto; senão, esquema vetorial).
  const fotos = React.useMemo(
    () => fases.map((_, i) => getFasePose(ex.slug, i)),
    [ex.slug, fases],
  );
  const temFotos = fotos.every(Boolean);

  const reduced = React.useMemo(usaReducedMotion, []);
  const [frame, setFrame] = React.useState(0);
  const [tocando, setTocando] = React.useState(!reduced);

  // Loop contínuo pelas fases (0,1,2,0,...) = repetições encadeadas.
  React.useEffect(() => {
    if (!tocando || total < 2) return;
    const id = window.setInterval(() => setFrame((f) => (f + 1) % total), 900);
    return () => window.clearInterval(id);
  }, [tocando, total]);

  const kind = faseKind(fases[frame].nome, frame, total);

  return (
    <figure className={cn("select-none", className)}>
      <div className="relative mx-auto aspect-[3/4] w-full max-w-[260px] overflow-hidden rounded-card border border-border bg-surface-soft shadow-soft">
        {temFotos ? (
          // Cross-fade entre as fotos reais empilhadas (movimento suave, sem salto).
          fotos.map((src, i) => (
            <img
              key={i}
              src={withBase(src!)}
              alt={`${ex.slug} fase ${fases[i].nome}`}
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-out",
                i === frame ? "opacity-100" : "opacity-0",
              )}
              loading="lazy"
              draggable={false}
            />
          ))
        ) : (
          // Sem foto real: esquema vetorial do músculo (anima pelo próprio kind).
          <FaseFigure kind={kind} musculo={musculo} className="[&_figcaption]:hidden [&>div]:h-full [&_svg]:h-full" />
        )}

        {/* Selo da fase + sentido do movimento */}
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full border border-[#1b4b66]/20 bg-[#ffffff]/90 px-2 py-0.5 text-2xs font-semibold text-primary backdrop-blur-sm">
          {React.createElement(DirIcon[kind], { className: "h-3 w-3" })}
          {CHIP[kind]}
        </span>

        {/* Play/Pause */}
        <button
          type="button"
          onClick={() => setTocando((t) => !t)}
          aria-label={tocando ? "Pausar movimento" : "Reproduzir movimento"}
          className="absolute bottom-2 left-2 grid h-9 w-9 place-items-center rounded-full bg-slate-900/70 text-white ring-1 ring-white/20 backdrop-blur-sm transition-colors hover:bg-slate-900/85"
        >
          {tocando ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-[1px]" />}
        </button>

        {/* Scrubber por fase: clicar pausa e vai para a fase */}
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-slate-900/60 px-2 py-1 backdrop-blur-sm">
          {fases.map((f, i) => (
            <button
              key={f.nome}
              type="button"
              aria-label={`Ir para a fase ${f.nome}`}
              aria-current={i === frame ? "true" : undefined}
              onClick={() => {
                setTocando(false);
                setFrame(i);
              }}
              className={cn(
                "h-2 rounded-full transition-all",
                i === frame ? "w-5 bg-white" : "w-2 bg-white/45 hover:bg-white/70",
              )}
            />
          ))}
        </div>
      </div>

      {/* Legenda sincronizada com a fase que está na tela */}
      <figcaption className="mx-auto mt-2 max-w-[320px] text-center">
        <span className="text-sm font-semibold text-ink">{fases[frame].nome}</span>
        <span className="mt-0.5 block text-xs leading-snug text-ink-2">{fases[frame].descricao}</span>
      </figcaption>
    </figure>
  );
}
