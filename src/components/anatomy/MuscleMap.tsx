import type { ReactNode } from "react";
import { cn, withBase } from "@/lib/utils";
import type { Exercise } from "@/data/types";

/**
 * Mapa muscular — figura anatômica em cinza (frente + costas, ilustração gerada por IA no
 * estilo do sistema) com os músculos ATIVADOS preenchidos em azul por intensidade
 * (data-driven). Layout inspirado num quadro de anatomia profissional: figuras + Escala de
 * ativação + Principais músculos. Compacto, no estilo flat do app.
 */

export type MuscleKey =
  | "trapezio" | "deltoides" | "peitoral" | "biceps" | "triceps" | "antebracos"
  | "abdomen" | "obliquos" | "dorsais" | "lombar" | "gluteos" | "quadriceps"
  | "isquiotibiais" | "adutores" | "panturrilhas";

export const MUSCLE_LABEL: Record<MuscleKey, string> = {
  trapezio: "Trapézio", deltoides: "Deltoides", peitoral: "Peitoral", biceps: "Bíceps",
  triceps: "Tríceps", antebracos: "Antebraços", abdomen: "Abdômen", obliquos: "Oblíquos",
  dorsais: "Dorsais", lombar: "Lombar", gluteos: "Glúteos", quadriceps: "Quadríceps",
  isquiotibiais: "Isquiotibiais", adutores: "Adutores", panturrilhas: "Panturrilhas",
};

function nomeParaChave(nome: string): MuscleKey | null {
  const n = nome.toLowerCase();
  if (n.includes("quadríceps") || n.includes("reto femoral")) return "quadriceps";
  if (n.includes("glúteo") || n.includes("gluteo") || n.includes("estabilizadores do quadril")) return "gluteos";
  if (n.includes("isquiotibiais") || n.includes("posteriores")) return "isquiotibiais";
  if (n.includes("adutores")) return "adutores";
  if (n.includes("panturrilha")) return "panturrilhas";
  if (n.includes("peitoral") || n.includes("serrátil")) return "peitoral";
  if (n.includes("deltoide")) return "deltoides";
  if (n.includes("tríceps") || n.includes("triceps") || n.includes("ancôneo")) return "triceps";
  if (n.includes("bíceps") || n.includes("biceps") || n.includes("braquial")) return "biceps";
  if (n.includes("latíssimo") || n.includes("dorsais")) return "dorsais";
  if (n.includes("romboides") || n.includes("trapézio") || n.includes("trapezio")) return "trapezio";
  if (n.includes("eretores")) return "lombar";
  return null;
}

export type Activation = Partial<Record<MuscleKey, number>>;

export function activationFromExercise(ex: Exercise): Activation {
  const map: Activation = {};
  for (const a of ex.ativacao) {
    const key = nomeParaChave(a.musculo);
    if (key) map[key] = Math.max(map[key] ?? 0, a.percentual);
  }
  return map;
}

const SCALE = ["#DBE7FB", "#A9C7F9", "#6EA0F2", "#3B82F6", "#2563EB", "#1D4ED8"];
function fillFor(v?: number) {
  if (!v || v <= 0) return SCALE[0];
  if (v < 20) return SCALE[1];
  if (v < 40) return SCALE[2];
  if (v < 60) return SCALE[3];
  if (v < 80) return SCALE[4];
  return SCALE[5];
}

/* ---- regiões musculares sobre a figura 60×100 (600×1000, 3:5). Pares desenhados em Sym. --- */
type Shape = { d: string } | { e: [number, number, number, number] };
const FRONT_PAIR: Partial<Record<MuscleKey, Shape[]>> = {
  peitoral: [{ d: "M29.6 24.4 C26 23.2 21.6 24.4 20.8 28 C20.4 30.8 22.4 33.4 26 33.6 C28 33.6 29.4 32.6 29.8 31 Z" }],
  deltoides: [{ d: "M21.8 22 C17.6 22.2 15.8 26 17.8 29.6 C19.6 31.6 22.6 31 24.4 28.8 C25.4 26.6 24.2 23 21.8 22 Z" }],
  biceps: [{ d: "M19.6 27.4 C16.8 28.6 16 33 17.4 37 C18.4 39.4 20.6 39 21.4 36.4 C22 32.6 21.8 28.6 19.6 27.4 Z" }],
  antebracos: [{ d: "M17.2 39.4 C14.4 41 13.6 46.4 14.8 50.4 C15.6 52.6 17.6 52.2 18.2 49.6 C19 45.4 19.4 40.6 17.2 39.4 Z" }],
  obliquos: [{ d: "M26.6 32.4 C24.4 36.6 24.2 41.4 25.8 44 L27 42.2 L27.2 32.6 Z" }],
  quadriceps: [{ d: "M23.4 46.6 C19.8 52.8 19.4 61 23.2 66.8 C24.6 68.4 26.6 67.8 27.4 65.6 C28.8 58.4 29 50.6 28.4 46.8 C27 45.6 25 45.6 23.4 46.6 Z" }],
  adutores: [{ d: "M28.6 47 L28.8 63 C27.4 62 26.6 58 26.8 54 C27 50.4 27.8 48 28.6 47 Z" }],
  panturrilhas: [{ d: "M24.4 72 C21.8 76 21.6 83 24 87.4 C25 89 26.6 88.4 27 85.8 C27.6 80 27.4 74.4 26.4 72 C25.8 71 24.8 71 24.4 72 Z" }],
};
const FRONT_MID: Partial<Record<MuscleKey, Shape[]>> = {
  abdomen: [{ d: "M26.4 31.4 C26.2 35 26 40 26.6 43.6 C27.4 45.6 32.6 45.6 33.4 43.6 C34 40 33.8 35 33.6 31.4 C31.4 30.8 28.6 30.8 26.4 31.4 Z" }],
};
const BACK_PAIR: Partial<Record<MuscleKey, Shape[]>> = {
  deltoides: [{ d: "M21.8 22 C17.6 22.2 15.8 26 17.8 29.6 C19.6 31.6 22.6 31 24.4 28.8 C25.4 26.6 24.2 23 21.8 22 Z" }],
  dorsais: [{ d: "M29.6 29 C22.8 30.6 20 39 24.6 43.4 C26.8 45 29 44 29.6 41.4 C30 37 30 32.6 29.6 29 Z" }],
  triceps: [{ d: "M19.6 27.4 C16.8 28.6 16 33 17.4 37 C18.4 39.4 20.6 39 21.4 36.4 C22 32.6 21.8 28.6 19.6 27.4 Z" }],
  antebracos: [{ d: "M17.2 39.4 C14.4 41 13.6 46.4 14.8 50.4 C15.6 52.6 17.6 52.2 18.2 49.6 C19 45.4 19.4 40.6 17.2 39.4 Z" }],
  gluteos: [{ d: "M25.2 44 C20.4 44.6 18.8 50 23.4 53.8 C27.4 55.4 30.4 52.6 30.6 47.8 C30.4 44.4 28 43.4 25.2 44 Z" }],
  isquiotibiais: [{ d: "M23 54 C20 60.4 20.4 67.2 24.4 69.6 C25.8 70.4 27.6 69.6 28.2 67 C29 61 29 55.6 28.4 54 C27 53 24.6 53 23 54 Z" }],
  panturrilhas: [{ d: "M24 71.5 C21.2 76 21 83.6 23.6 88.2 C24.8 90 26.6 89.2 27 86.4 C27.6 80 27.4 74 26.2 71.6 C25.6 70.6 24.6 70.6 24 71.5 Z" }],
};
const BACK_MID: Partial<Record<MuscleKey, Shape[]>> = {
  trapezio: [{ d: "M30 19.6 C34 21.4 37.4 24.4 38.4 28 C36 30 33 32.6 30 34.6 C27 32.6 24 30 21.6 28 C22.6 24.4 26 21.4 30 19.6 Z" }],
  lombar: [{ d: "M27 35.8 C26.8 39 27 42.4 28 44.4 C29 45.8 31 45.8 32 44.4 C33 42.4 33.2 39 33 35.8 C31 35.2 29 35.2 27 35.8 Z" }],
};

function Sym({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <g transform="translate(60 0) scale(-1 1)">{children}</g>
    </>
  );
}

function shapesFor(shape: Shape, fill: string, key: string) {
  const common = { fill };
  return "d" in shape ? <path key={key} d={shape.d} {...common} /> : (
    <ellipse key={key} cx={shape.e[0]} cy={shape.e[1]} rx={shape.e[2]} ry={shape.e[3]} {...common} />
  );
}

/** Overlay dos músculos ativados: blend "multiply" tinge o músculo preservando o
 *  sombreado/definição da figura (integra, não fica adesivo), com borda levemente suave. */
function MuscleOverlay({
  pair, mid, activation,
}: {
  pair: Partial<Record<MuscleKey, Shape[]>>;
  mid: Partial<Record<MuscleKey, Shape[]>>;
  activation: Activation;
}) {
  return (
    <svg
      viewBox="0 0 60 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ mixBlendMode: "multiply" }}
      aria-hidden
    >
      <defs>
        <filter id="mm-soft" x="-6%" y="-6%" width="112%" height="112%">
          <feGaussianBlur stdDeviation="0.35" />
        </filter>
      </defs>
      <g filter="url(#mm-soft)">
        {(Object.keys(mid) as MuscleKey[]).map((k) =>
          (activation[k] ?? 0) > 0 ? (mid[k] as Shape[]).map((s, i) => shapesFor(s, fillFor(activation[k]), `${k}-${i}`)) : null,
        )}
        <Sym>
          {(Object.keys(pair) as MuscleKey[]).map((k) =>
            (activation[k] ?? 0) > 0 ? (pair[k] as Shape[]).map((s, i) => shapesFor(s, fillFor(activation[k]), `${k}-${i}`)) : null,
          )}
        </Sym>
      </g>
    </svg>
  );
}

function Figure({
  src, pair, mid, activation, label,
}: {
  src: string;
  pair: Partial<Record<MuscleKey, Shape[]>>;
  mid: Partial<Record<MuscleKey, Shape[]>>;
  activation: Activation;
  label?: string;
}) {
  return (
    <figure className="rounded-xl bg-surface-soft p-2">
      <div className="relative mx-auto aspect-[3/5] w-full max-w-[180px]">
        <img src={withBase(src)} alt={label ? `Figura muscular — ${label}` : "Figura muscular"} className="h-full w-full object-contain" loading="lazy" />
        <MuscleOverlay pair={pair} mid={mid} activation={activation} />
      </div>
      {label && <figcaption className="mt-0.5 text-center text-[11px] font-medium text-ink-3">{label}</figcaption>}
    </figure>
  );
}

const NIVEIS = [
  { cor: SCALE[5], nome: "Muito alta", faixa: "≥ 80%" },
  { cor: SCALE[4], nome: "Alta", faixa: "60–79%" },
  { cor: SCALE[3], nome: "Moderada", faixa: "40–59%" },
  { cor: SCALE[2], nome: "Baixa", faixa: "20–39%" },
  { cor: SCALE[1], nome: "Muito baixa", faixa: "< 20%" },
];

export function MuscleMap({ activation, className }: { activation: Activation; className?: string }) {
  const ativos = (Object.keys(activation) as MuscleKey[])
    .filter((k) => (activation[k] ?? 0) > 0)
    .sort((a, b) => (activation[b] ?? 0) - (activation[a] ?? 0));

  return (
    <div className={className}>
      <div className="grid grid-cols-2 items-start gap-3 lg:grid-cols-4">
        <Figure src="/anatomy/muscle-front.webp" pair={FRONT_PAIR} mid={FRONT_MID} activation={activation} label="Frente" />
        <Figure src="/anatomy/muscle-back.webp" pair={BACK_PAIR} mid={BACK_MID} activation={activation} label="Costas" />

        <div className="rounded-xl border border-border bg-surface p-3">
          <div className="mb-2 text-xs font-semibold text-ink">Escala de ativação</div>
          <ul className="space-y-1.5">
            {NIVEIS.map((n) => (
              <li key={n.nome} className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 shrink-0 rounded" style={{ background: n.cor }} />
                <span className="text-xs font-medium text-ink-2">{n.nome}</span>
                <span className="ml-auto text-[11px] tabular-nums text-ink-3">{n.faixa}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-border bg-surface p-3">
            <div className="mb-2 text-xs font-semibold text-ink">Principais músculos</div>
            {ativos.length > 0 ? (
              <ul className="space-y-1.5">
                {ativos.slice(0, 5).map((k) => (
                  <li key={k} className="flex items-center gap-2 text-sm">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: fillFor(activation[k]) }} />
                    <span className="min-w-0 flex-1 truncate text-ink-2">{MUSCLE_LABEL[k]}</span>
                    <span className="tabular-nums font-semibold text-ink">{activation[k]}%</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-ink-3">Sem dados de ativação.</p>
            )}
          </div>
          <div className="rounded-xl bg-primary-tint/50 p-3 text-[11px] leading-relaxed text-ink-2">
            Os valores representam a <span className="font-semibold text-ink">ativação relativa estimada</span> para este exercício — não são medição do aluno.
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 text-[11px] text-ink-3">
        <span>Menos ativado</span>
        <div className="flex h-2 flex-1 overflow-hidden rounded-full">
          {SCALE.map((c) => (
            <span key={c} className="h-full flex-1" style={{ background: c }} />
          ))}
        </div>
        <span>Mais ativado</span>
      </div>
    </div>
  );
}

const BACK_KEYS: MuscleKey[] = ["trapezio", "dorsais", "triceps", "lombar", "gluteos", "isquiotibiais"];

/** Miniatura para cards — figura frente ou costas conforme a maior ativação. */
export function MuscleThumb({ activation, className }: { activation: Activation; className?: string }) {
  const backSum = BACK_KEYS.reduce((s, k) => s + (activation[k] ?? 0), 0);
  const frontSum = (Object.keys(activation) as MuscleKey[])
    .filter((k) => !BACK_KEYS.includes(k))
    .reduce((s, k) => s + (activation[k] ?? 0), 0);
  const back = backSum > frontSum;
  return (
    <div className={cn("relative aspect-[3/5]", className)}>
      <img
        src={withBase(back ? "/anatomy/muscle-back.webp" : "/anatomy/muscle-front.webp")}
        alt={`Músculos predominantes (vista ${back ? "posterior" : "frontal"})`}
        className="h-full w-full object-contain"
        loading="lazy"
      />
      <MuscleOverlay pair={back ? BACK_PAIR : FRONT_PAIR} mid={back ? BACK_MID : FRONT_MID} activation={activation} />
    </div>
  );
}
