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
  peitoral: [{ d: "M30 24.5 C26 23.5 21.5 25 21.5 29.5 C21.5 33 26 34 30 33 Z" }],
  deltoides: [{ d: "M21.5 22 C17.5 22.5 16.5 27 19 30 C22 31 24.5 29 24.5 25.5 C24.5 23 23 22 21.5 22 Z" }],
  biceps: [{ e: [18, 32, 2.3, 4.5] }],
  antebracos: [{ e: [15.2, 45, 2.3, 5.2] }],
  obliquos: [{ d: "M26 32 C24 37 24 42 25.5 44.5 L27 42.5 L27 32.5 Z" }],
  quadriceps: [{ d: "M24 48 C20.5 56 21.5 64.5 26 67.5 L29 65.5 L29 48 C27 47 25.2 47 24 48 Z" }],
  adutores: [{ d: "M29 48.5 L29 64 L26.5 62 C26.5 55 27.5 50.5 28.3 48.5 Z" }],
  panturrilhas: [{ e: [26, 79, 2.6, 6.2] }],
};
const FRONT_MID: Partial<Record<MuscleKey, Shape[]>> = {
  abdomen: [{ d: "M26.5 31 L33.5 31 L33 44 Q30 46 27 44 Z" }],
};
const BACK_PAIR: Partial<Record<MuscleKey, Shape[]>> = {
  deltoides: [{ d: "M21.5 22 C17.5 22.5 16.5 27 19 30 C22 31 24.5 29 24.5 25.5 C24.5 23 23 22 21.5 22 Z" }],
  dorsais: [{ d: "M29 29 C23 31 21 38.5 25 42.5 L29 40.5 L29 29 Z" }],
  triceps: [{ e: [18, 32, 2.3, 4.5] }],
  antebracos: [{ e: [15.2, 45, 2.3, 5.2] }],
  gluteos: [{ d: "M25 45 C20.8 46 20 51 25 53.2 C29 54 30.5 51 30.5 47 C29 45 27 44.5 25 45 Z" }],
  isquiotibiais: [{ d: "M24 54 C20.8 60 21.8 66.5 26 68.5 L29 66.5 L29 54 C27 53 25.2 53 24 54 Z" }],
  panturrilhas: [{ e: [26, 79, 2.9, 7] }],
};
const BACK_MID: Partial<Record<MuscleKey, Shape[]>> = {
  trapezio: [{ d: "M30 20 L38 27 L30 35 L22 27 Z" }],
  lombar: [{ d: "M27 36 L33 36 L32.5 44 Q30 45.5 27.5 44 Z" }],
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
  const common = { fill, fillOpacity: 0.9, stroke: "#1E40AF", strokeOpacity: 0.35, strokeWidth: 0.25 };
  return "d" in shape ? <path key={key} d={shape.d} {...common} /> : (
    <ellipse key={key} cx={shape.e[0]} cy={shape.e[1]} rx={shape.e[2]} ry={shape.e[3]} {...common} />
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
        <svg viewBox="0 0 60 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          {(Object.keys(mid) as MuscleKey[]).map((k) =>
            (activation[k] ?? 0) > 0 ? (mid[k] as Shape[]).map((s, i) => shapesFor(s, fillFor(activation[k]), `${k}-${i}`)) : null,
          )}
          <Sym>
            {(Object.keys(pair) as MuscleKey[]).map((k) =>
              (activation[k] ?? 0) > 0 ? (pair[k] as Shape[]).map((s, i) => shapesFor(s, fillFor(activation[k]), `${k}-${i}`)) : null,
            )}
          </Sym>
        </svg>
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
      <svg viewBox="0 0 60 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        {(Object.keys(back ? BACK_MID : FRONT_MID) as MuscleKey[]).map((k) =>
          (activation[k] ?? 0) > 0 ? ((back ? BACK_MID : FRONT_MID)[k] as Shape[]).map((s, i) => shapesFor(s, fillFor(activation[k]), `${k}-${i}`)) : null,
        )}
        <Sym>
          {(Object.keys(back ? BACK_PAIR : FRONT_PAIR) as MuscleKey[]).map((k) =>
            (activation[k] ?? 0) > 0 ? ((back ? BACK_PAIR : FRONT_PAIR)[k] as Shape[]).map((s, i) => shapesFor(s, fillFor(activation[k]), `${k}-${i}`)) : null,
          )}
        </Sym>
      </svg>
    </div>
  );
}
