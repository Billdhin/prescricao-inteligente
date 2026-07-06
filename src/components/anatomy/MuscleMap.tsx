import type { Exercise } from "@/data/types";
import { cn } from "@/lib/utils";

/**
 * Mapa muscular anatômico — ilustração vetorial própria (frente + costas).
 * Cada região é preenchida por intensidade de ativação (0–100).
 * Nada copiado de terceiros.
 */

export type MuscleKey =
  | "trapezio"
  | "deltoides"
  | "peitoral"
  | "biceps"
  | "triceps"
  | "antebracos"
  | "abdomen"
  | "obliquos"
  | "dorsais"
  | "lombar"
  | "gluteos"
  | "quadriceps"
  | "isquiotibiais"
  | "adutores"
  | "panturrilhas";

export const MUSCLE_LABEL: Record<MuscleKey, string> = {
  trapezio: "Trapézio",
  deltoides: "Deltoides",
  peitoral: "Peitoral",
  biceps: "Bíceps",
  triceps: "Tríceps",
  antebracos: "Antebraços",
  abdomen: "Abdômen",
  obliquos: "Oblíquos",
  dorsais: "Dorsais",
  lombar: "Lombar",
  gluteos: "Glúteos",
  quadriceps: "Quadríceps",
  isquiotibiais: "Isquiotibiais",
  adutores: "Adutores",
  panturrilhas: "Panturrilhas",
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

const SCALE = ["#E7ECF3", "#CBDDFB", "#93B7F7", "#5B8DEF", "#2E6BEA", "#1D4ED8"];
function fillFor(v?: number) {
  if (!v || v <= 0) return SCALE[0];
  if (v < 40) return SCALE[1];
  if (v < 60) return SCALE[2];
  if (v < 75) return SCALE[3];
  if (v < 90) return SCALE[4];
  return SCALE[5];
}

const BODY_STROKE = "#CBD5E1";
const SKIN = "#F1F5F9";

function Silhouette() {
  return (
    <g fill={SKIN} stroke={BODY_STROKE} strokeWidth="1.5">
      <circle cx="100" cy="34" r="20" />
      <rect x="92" y="52" width="16" height="14" rx="5" />
      <path d="M62 74 Q100 62 138 74 L150 150 Q140 176 130 176 L70 176 Q60 176 50 150 Z" />
      <path d="M62 78 Q46 92 44 130 L40 196 Q46 202 54 198 L64 140 Q68 104 70 92 Z" />
      <path d="M138 78 Q154 92 156 130 L160 196 Q154 202 146 198 L136 140 Q132 104 130 92 Z" />
      <path d="M72 176 Q66 250 74 300 L78 360 Q86 366 92 360 L96 260 Q100 210 100 190 Z" />
      <path d="M128 176 Q134 250 126 300 L122 360 Q114 366 108 360 L104 260 Q100 210 100 190 Z" />
    </g>
  );
}

function FrontMuscles({ F }: { F: (k: MuscleKey) => string }) {
  return (
    <g stroke="#fff" strokeWidth="1">
      <ellipse cx="64" cy="88" rx="12" ry="14" fill={F("deltoides")} />
      <ellipse cx="136" cy="88" rx="12" ry="14" fill={F("deltoides")} />
      <path d="M74 90 Q98 84 98 84 L98 118 Q84 124 72 116 Q70 100 74 90 Z" fill={F("peitoral")} />
      <path d="M126 90 Q102 84 102 84 L102 118 Q116 124 128 116 Q130 100 126 90 Z" fill={F("peitoral")} />
      <ellipse cx="52" cy="118" rx="8" ry="18" fill={F("biceps")} />
      <ellipse cx="148" cy="118" rx="8" ry="18" fill={F("biceps")} />
      <ellipse cx="46" cy="164" rx="7" ry="20" fill={F("antebracos")} />
      <ellipse cx="154" cy="164" rx="7" ry="20" fill={F("antebracos")} />
      <rect x="88" y="122" width="24" height="42" rx="7" fill={F("abdomen")} />
      <path d="M78 124 Q84 148 86 164 L80 162 Q74 144 74 128 Z" fill={F("obliquos")} />
      <path d="M122 124 Q116 148 114 164 L120 162 Q126 144 126 128 Z" fill={F("obliquos")} />
      <path d="M74 182 Q70 232 80 272 L92 268 Q96 220 96 188 Z" fill={F("quadriceps")} />
      <path d="M126 182 Q130 232 120 272 L108 268 Q104 220 104 188 Z" fill={F("quadriceps")} />
      <path d="M98 190 L98 250 L92 250 Q92 214 96 190 Z" fill={F("adutores")} />
      <path d="M102 190 L102 250 L108 250 Q108 214 104 190 Z" fill={F("adutores")} />
      <ellipse cx="82" cy="312" rx="7" ry="20" fill={F("panturrilhas")} />
      <ellipse cx="118" cy="312" rx="7" ry="20" fill={F("panturrilhas")} />
    </g>
  );
}

function BackMuscles({ F }: { F: (k: MuscleKey) => string }) {
  return (
    <g stroke="#fff" strokeWidth="1">
      <path d="M84 78 L100 72 L116 78 L110 104 L100 110 L90 104 Z" fill={F("trapezio")} />
      <ellipse cx="64" cy="88" rx="12" ry="14" fill={F("deltoides")} />
      <ellipse cx="136" cy="88" rx="12" ry="14" fill={F("deltoides")} />
      <path d="M76 104 Q70 140 90 158 L96 120 Q92 108 88 104 Z" fill={F("dorsais")} />
      <path d="M124 104 Q130 140 110 158 L104 120 Q108 108 112 104 Z" fill={F("dorsais")} />
      <ellipse cx="52" cy="118" rx="8" ry="18" fill={F("triceps")} />
      <ellipse cx="148" cy="118" rx="8" ry="18" fill={F("triceps")} />
      <ellipse cx="46" cy="164" rx="7" ry="20" fill={F("antebracos")} />
      <ellipse cx="154" cy="164" rx="7" ry="20" fill={F("antebracos")} />
      <rect x="90" y="140" width="20" height="30" rx="6" fill={F("lombar")} />
      <path d="M76 178 Q72 200 88 208 Q98 204 98 186 Q90 178 82 178 Z" fill={F("gluteos")} />
      <path d="M124 178 Q128 200 112 208 Q102 204 102 186 Q110 178 118 178 Z" fill={F("gluteos")} />
      <path d="M76 212 Q72 252 82 280 L92 276 Q94 236 92 210 Z" fill={F("isquiotibiais")} />
      <path d="M124 212 Q128 252 118 280 L108 276 Q106 236 108 210 Z" fill={F("isquiotibiais")} />
      <ellipse cx="82" cy="314" rx="8" ry="22" fill={F("panturrilhas")} />
      <ellipse cx="118" cy="314" rx="8" ry="22" fill={F("panturrilhas")} />
    </g>
  );
}

export function MuscleMap({ activation, className }: { activation: Activation; className?: string }) {
  const F = (k: MuscleKey) => fillFor(activation[k]);
  const ativos = (Object.keys(activation) as MuscleKey[])
    .filter((k) => (activation[k] ?? 0) > 0)
    .sort((a, b) => (activation[b] ?? 0) - (activation[a] ?? 0));

  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-2">
        <figure className="rounded-xl bg-surface-soft p-2">
          <svg viewBox="0 0 200 380" className="mx-auto h-64 w-full" role="img" aria-label="Vista frontal dos músculos ativados">
            <Silhouette />
            <FrontMuscles F={F} />
          </svg>
          <figcaption className="mt-1 text-center text-[11px] font-medium text-ink-3">Frente</figcaption>
        </figure>
        <figure className="rounded-xl bg-surface-soft p-2">
          <svg viewBox="0 0 200 380" className="mx-auto h-64 w-full" role="img" aria-label="Vista posterior dos músculos ativados">
            <Silhouette />
            <BackMuscles F={F} />
          </svg>
          <figcaption className="mt-1 text-center text-[11px] font-medium text-ink-3">Costas</figcaption>
        </figure>
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

      {ativos.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {ativos.map((k) => (
            <span key={k} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-medium text-ink">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: fillFor(activation[k]) }} />
              {MUSCLE_LABEL[k]} · {activation[k]}%
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

const BACK_KEYS: MuscleKey[] = ["trapezio", "dorsais", "triceps", "lombar", "gluteos", "isquiotibiais"];

/** Miniatura para cards — escolhe frente ou costas conforme a maior ativação. */
export function MuscleThumb({ activation, className }: { activation: Activation; className?: string }) {
  const F = (k: MuscleKey) => fillFor(activation[k]);
  const backSum = BACK_KEYS.reduce((s, k) => s + (activation[k] ?? 0), 0);
  const frontSum = (Object.keys(activation) as MuscleKey[])
    .filter((k) => !BACK_KEYS.includes(k))
    .reduce((s, k) => s + (activation[k] ?? 0), 0);
  const back = backSum > frontSum;
  return (
    <svg
      viewBox="0 0 200 380"
      className={cn("h-full w-full", className)}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Músculos predominantes do exercício (vista ${back ? "posterior" : "frontal"})`}
    >
      <Silhouette />
      {back ? <BackMuscles F={F} /> : <FrontMuscles F={F} />}
    </svg>
  );
}
