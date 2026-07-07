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
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

type Shape = MuscleRegion["shapes"][number];
type Masks = { todos: string; porMusculo: Record<string, string> };

/**
 * Máscara com a SILHUETA REAL dos músculos, extraída da própria imagem de
 * análise por chave de cor (os músculos-alvo são os únicos pixels vermelho-
 * saturados do render), limitada às regiões autoradas. Determinístico, sem IA:
 * o brilho segue o contorno anatômico — nada vaza para o fundo e o músculo
 * acende inteiro, não "círculos" sobre ele.
 */
function buildMasks(img: HTMLImageElement, regions: MuscleRegion[]): Masks {
  const W = 480;
  const H = 360;
  const src = document.createElement("canvas");
  src.width = W;
  src.height = H;
  const sctx = src.getContext("2d", { willReadFrequently: true })!;
  sctx.drawImage(img, 0, 0, W, H);
  const px = sctx.getImageData(0, 0, W, H).data;

  // vermelhidão por pixel: separa músculo em destaque (vermelho saturado) da
  // musculatura pálida/pele/fundo
  const red = new Float32Array(W * H);
  for (let p = 0, i = 0; p < W * H; p++, i += 4) {
    const k = Math.min(px[i] - px[i + 1], px[i] - px[i + 2]);
    red[p] = clamp01((k - 38) / 52);
  }

  const render = (shapes: Shape[]) => {
    const out = new ImageData(W, H);
    const d = out.data;
    for (let y = 0; y < H; y++) {
      const py = (y / H) * 100;
      for (let x = 0; x < W; x++) {
        const p = y * W + x;
        if (red[p] === 0) continue;
        const pxx = (x / W) * 100;
        let gate = 0;
        for (const s of shapes) {
          const rot = (((s as { rot?: number }).rot ?? 0) * Math.PI) / 180;
          const dx = pxx - s.cx;
          const dy = py - s.cy;
          const u = (dx * Math.cos(rot) + dy * Math.sin(rot)) / s.rx;
          const v = (-dx * Math.sin(rot) + dy * Math.cos(rot)) / s.ry;
          const dist = u * u + v * v; // 1 = borda da elipse autorada
          gate = Math.max(gate, clamp01((2.4 - dist) / 1.1));
          if (gate === 1) break;
        }
        const a = red[p] * gate;
        if (a > 0) {
          const q = p * 4;
          d[q] = 255;
          d[q + 1] = 255;
          d[q + 2] = 255;
          d[q + 3] = Math.round(a * 255);
        }
      }
    }
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    c.getContext("2d")!.putImageData(out, 0, 0);
    // borda suavizada = recorte natural
    const blur = document.createElement("canvas");
    blur.width = W;
    blur.height = H;
    const bctx = blur.getContext("2d")!;
    bctx.filter = "blur(1.2px)";
    bctx.drawImage(c, 0, 0);
    return blur.toDataURL();
  };

  return {
    todos: render(regions.flatMap((r) => r.shapes)),
    porMusculo: Object.fromEntries(regions.map((r) => [r.musculo, render(r.shapes)])),
  };
}

function useMuscleMasks(srcUrl: string, regions: MuscleRegion[]) {
  const [masks, setMasks] = React.useState<Masks | null>(null);
  React.useEffect(() => {
    let alive = true;
    setMasks(null);
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      if (alive) setMasks(buildMasks(img, regions));
    };
    img.src = srcUrl;
    return () => {
      alive = false;
    };
  }, [srcUrl, regions]);
  return masks;
}

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

  // Silhueta real dos músculos (chave de cor da própria imagem); enquanto o
  // canvas processa, cai no gradiente de elipses para não piscar.
  const masks = useMuscleMasks(analysisSrc, regions);
  const [foco, setFoco] = React.useState<string | null>(null);
  const maskFallback = React.useMemo(
    () =>
      regions
        .flatMap((r) => r.shapes)
        .map(
          (s) =>
            `radial-gradient(ellipse ${(s.rx * 1.18).toFixed(1)}% ${(s.ry * 1.25).toFixed(1)}% at ${s.cx}% ${s.cy}%, black 44%, transparent 88%)`,
        )
        .join(","),
    [regions],
  );
  const maskAtiva = foco && masks?.porMusculo[foco] ? masks.porMusculo[foco] : masks?.todos;

  // Glifo de ângulo com raios: valor CALCULADO da geometria (unidades reais da
  // imagem 4:3), arredondado a 5° — o número sempre bate com a pose visível.
  const angleGeom = React.useMemo(() => {
    const a = overlay?.angle;
    if (!a?.rays) return null;
    const vx = a.x * 4;
    const vy = a.y * 3;
    const v1 = { x: a.rays.ax * 4 - vx, y: a.rays.ay * 3 - vy };
    const v2 = { x: a.rays.bx * 4 - vx, y: a.rays.by * 3 - vy };
    const n1 = Math.hypot(v1.x, v1.y);
    const n2 = Math.hypot(v2.x, v2.y);
    if (!n1 || !n2) return null;
    const deg = Math.round((Math.acos((v1.x * v2.x + v1.y * v2.y) / (n1 * n2)) * 180) / Math.PI / 5) * 5;
    const a1 = Math.atan2(v1.y, v1.x);
    const a2 = Math.atan2(v2.y, v2.x);
    let diff = a2 - a1;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    const r = 16;
    const arc = {
      x1: vx + r * Math.cos(a1),
      y1: vy + r * Math.sin(a1),
      x2: vx + r * Math.cos(a2),
      y2: vy + r * Math.sin(a2),
      sweep: diff > 0 ? 1 : 0,
    };
    // rótulo na ANTI-bissetriz: do lado de fora da articulação (área livre,
    // nunca sobre o músculo em foco, que fica entre os raios)
    const mid = a1 + diff / 2;
    const label = { x: (vx - 34 * Math.cos(mid)) / 4, y: (vy - 34 * Math.sin(mid)) / 3 };
    return { vx, vy, v1, v2, n1, n2, deg, arc, label };
  }, [overlay]);

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

      {/* Camada de análise, revelada à direita do slider. FOCO NATURAL: uma
          imagem só (a anatômica, alinhada à base) escurecida por inteiro, com
          os músculos mantidos brilhantes por um "spotlight" da MESMA imagem —
          a diferença é apenas de luz, então não existe emenda de montagem. */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
        <img src={analysisSrc} alt="" aria-hidden draggable={false} className="absolute inset-0 h-full w-full object-cover" />
        {/* escurecimento navy + vignette */}
        <div className="absolute inset-0 bg-slate-950/45" />
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 78% 72% at 50% 46%, transparent 48%, rgba(2,6,23,0.5) 100%)" }}
        />
        {/* spotlight: a mesma imagem, em brilho pleno, apenas na SILHUETA dos músculos */}
        <img
          src={analysisSrc}
          alt=""
          aria-hidden
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
          style={
            maskAtiva
              ? {
                  maskImage: `url(${maskAtiva})`,
                  WebkitMaskImage: `url(${maskAtiva})`,
                  maskSize: "100% 100%",
                  WebkitMaskSize: "100% 100%",
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  filter: "saturate(1.08)",
                }
              : {
                  maskImage: maskFallback,
                  WebkitMaskImage: maskFallback,
                  filter: "saturate(1.08)",
                }
          }
        />

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
          {angleGeom && (
            <>
              {/* raios finos ao longo dos segmentos + arco na articulação */}
              <line
                x1={angleGeom.vx}
                y1={angleGeom.vy}
                x2={angleGeom.vx + angleGeom.v1.x * 0.55}
                y2={angleGeom.vy + angleGeom.v1.y * 0.55}
                stroke="rgba(255,255,255,0.65)"
                strokeWidth={1}
                strokeDasharray="3 4"
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1={angleGeom.vx}
                y1={angleGeom.vy}
                x2={angleGeom.vx + angleGeom.v2.x * 0.55}
                y2={angleGeom.vy + angleGeom.v2.y * 0.55}
                stroke="rgba(255,255,255,0.65)"
                strokeWidth={1}
                strokeDasharray="3 4"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d={`M ${angleGeom.arc.x1} ${angleGeom.arc.y1} A 16 16 0 0 ${angleGeom.arc.sweep} ${angleGeom.arc.x2} ${angleGeom.arc.y2}`}
                fill="none"
                stroke="#22d3ee"
                strokeWidth={1.6}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </>
          )}
          {rotulados.map((r) => {
            const side = r.s.cy > 55 ? -1 : 1;
            const x1 = (r.s.cx + side * Math.max(r.s.rx, r.s.ry) * 0.55) * 4;
            const y = r.s.cy * 3;
            const dim = foco !== null && foco !== r.nome;
            return (
              <g key={r.nome} opacity={dim ? 0.3 : 1}>
                <circle cx={x1} cy={y} r={2} fill="#fff" opacity={0.9} />
                <line
                  x1={x1}
                  y1={y}
                  x2={x1 + side * 34}
                  y2={y}
                  stroke="rgba(255,255,255,0.75)"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
              </g>
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
        {overlay?.angle &&
          (angleGeom ? (
            <span
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-md border border-white/15 bg-slate-950/80 px-2 py-0.5 text-[10.5px] font-bold tabular-nums text-white backdrop-blur-sm"
              style={{ left: `${angleGeom.label.x}%`, top: `${angleGeom.label.y}%` }}
            >
              ≈{angleGeom.deg}°
            </span>
          ) : (
            <span
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-md border border-white/15 bg-slate-950/80 px-2 py-0.5 text-[10.5px] font-bold tabular-nums text-white backdrop-blur-sm"
              style={{ left: `${overlay.angle.x}%`, top: `${overlay.angle.y}%` }}
            >
              ≈{overlay.angle.value}
            </span>
          ))}
        {rotulados.map((r) => {
          const side = r.s.cy > 55 ? -1 : 1;
          const lx = clamp(r.s.cx + side * (Math.max(r.s.rx, r.s.ry) * 0.55 + 9.2));
          const dim = foco !== null && foco !== r.nome;
          return (
            // caixa ancorada na borda da imagem (nunca corta o texto)
            <span
              key={r.nome}
              onPointerEnter={() => setFoco(r.nome)}
              onPointerLeave={() => setFoco(null)}
              className={cn(
                "absolute -translate-y-1/2 truncate text-[11px] font-medium text-white/95 [text-shadow:0_1px_3px_rgba(0,0,0,0.85)] transition-opacity",
                dim && "opacity-30",
              )}
              style={
                side === 1
                  ? { left: `${lx}%`, width: `${98 - lx}%`, top: `${r.s.cy}%`, textAlign: "left" }
                  : { left: "2%", width: `${Math.max(lx - 2, 10)}%`, top: `${r.s.cy}%`, textAlign: "right" }
              }
            >
              {r.nome}
            </span>
          );
        })}

        {/* Card: contribuição muscular (glass, canto inferior direito) */}
        {/* Mobile: faixa compacta (o card completo cobriria a imagem) */}
        <div className="absolute inset-x-2 bottom-2 flex items-center gap-2.5 overflow-x-auto rounded-lg border border-white/15 bg-slate-950/70 px-2.5 py-1.5 backdrop-blur-md [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:hidden">
          {contribuicoes.map((m, i) => (
            <button
              key={m.musculo}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFoco((f) => (f === m.musculo ? null : m.musculo));
              }}
              onPointerDown={(e) => e.stopPropagation()}
              aria-pressed={foco === m.musculo}
              aria-label={`Destacar ${m.musculo} na imagem`}
              className={cn(
                "flex shrink-0 items-center gap-1 rounded px-1 py-0.5",
                foco === m.musculo && "bg-white/10",
              )}
            >
              <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: DOT_COLORS[i] }} />
              <span className="text-[10px] font-medium text-white/85">{m.musculo}</span>
              <span className="tabular text-[10px] font-bold text-white">{m.percentual}%</span>
            </button>
          ))}
        </div>

        <div className="absolute bottom-3 right-3 hidden w-64 max-w-[68%] rounded-xl border border-white/15 bg-slate-950/70 p-3 backdrop-blur-md sm:block">
          <div className="mb-2 text-[11px] font-semibold tracking-wide text-white/85">Contribuição muscular</div>
          <div className="space-y-0.5">
            {contribuicoes.map((m, i) => (
              <button
                key={m.musculo}
                type="button"
                onPointerEnter={() => setFoco(m.musculo)}
                onPointerLeave={() => setFoco(null)}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                onFocus={() => setFoco(m.musculo)}
                onBlur={() => setFoco(null)}
                aria-label={`Destacar ${m.musculo} na imagem`}
                className={cn(
                  "-mx-1 flex w-[calc(100%+8px)] items-center gap-1.5 rounded-md px-1 py-1 text-left outline-none transition-colors",
                  foco === m.musculo ? "bg-white/10" : "hover:bg-white/5",
                )}
              >
                <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: DOT_COLORS[i] }} />
                <span className="min-w-0 flex-1 truncate text-[11px] leading-tight text-white/90">{m.musculo}</span>
                <span className="h-1 w-12 shrink-0 overflow-hidden rounded-full bg-white/12 sm:w-16">
                  <span className="block h-full rounded-full" style={{ width: `${m.percentual}%`, background: BAR_COLORS[i] }} />
                </span>
                <span className="tabular w-8 shrink-0 text-right text-[11px] font-bold leading-tight text-white">
                  {m.percentual}%
                </span>
              </button>
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
