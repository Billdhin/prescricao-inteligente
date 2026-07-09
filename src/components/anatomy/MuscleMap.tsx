import type { ReactNode } from "react";
import type { Exercise } from "@/data/types";
import { cn } from "@/lib/utils";

/**
 * Mapa muscular anatômico — ilustração vetorial própria (frente + costas).
 * Cada região é preenchida por intensidade de ativação (0–100). Figura desenhada
 * de forma coesa e SIMÉTRICA (metade esquerda + espelho), com leve profundidade.
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

const SCALE = ["#EEF2F7", "#CBDDFB", "#93B7F7", "#5B8DEF", "#2E6BEA", "#1D4ED8"];
function fillFor(v?: number) {
  if (!v || v <= 0) return SCALE[0];
  if (v < 40) return SCALE[1];
  if (v < 60) return SCALE[2];
  if (v < 75) return SCALE[3];
  if (v < 90) return SCALE[4];
  return SCALE[5];
}

const MUSCLE_STROKE = "#C4D0DF";

/** Desenha os filhos e o espelho deles em torno de x=100 (simetria perfeita). */
function Sym({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <g transform="translate(200 0) scale(-1 1)">{children}</g>
    </>
  );
}

/* Contorno do corpo (pele) — coeso e simétrico, com leve gradiente de profundidade. */
function Silhouette() {
  return (
    <g>
      {/* cabeça + pescoço */}
      <ellipse cx="100" cy="30" rx="15" ry="18" fill="url(#mm-skin)" stroke="#CBD5E1" strokeWidth="1.4" />
      <path d="M90 45 Q100 41 110 45 L112 60 Q100 67 88 60 Z" fill="url(#mm-skin)" stroke="#CBD5E1" strokeWidth="1.4" />
      {/* tronco */}
      <path
        d="M72 66 C61 69 56 80 59 95 C61 114 66 134 72 153 C75 169 80 183 91 191 C96 196 104 196 109 191 C120 183 125 169 128 153 C134 134 139 114 141 95 C144 80 139 69 128 66 C114 60 86 60 72 66 Z"
        fill="url(#mm-skin)"
        stroke="#CBD5E1"
        strokeWidth="1.4"
      />
      {/* quadril */}
      <path d="M76 184 C74 199 79 214 92 217 L108 217 C121 214 126 199 124 184 Z" fill="url(#mm-skin)" stroke="#CBD5E1" strokeWidth="1.4" />
      <Sym>
        {/* braço esquerdo */}
        <path
          d="M59 90 C49 101 46 120 46 140 C45 162 46 182 49 198 C51 206 60 206 61 197 C64 179 65 159 68 139 C70 121 72 105 73 94 C69 90 64 89 59 90 Z"
          fill="url(#mm-skin)"
          stroke="#CBD5E1"
          strokeWidth="1.4"
        />
        {/* perna esquerda */}
        <path
          d="M80 212 C74 242 75 272 80 300 C83 324 86 346 88 362 C94 368 100 365 100 356 L100 220 C99 214 98 211 96 210 C90 208 84 209 80 212 Z"
          fill="url(#mm-skin)"
          stroke="#CBD5E1"
          strokeWidth="1.4"
        />
      </Sym>
    </g>
  );
}

function FrontMuscles({ F }: { F: (k: MuscleKey) => string }) {
  return (
    <g stroke={MUSCLE_STROKE} strokeWidth="1" strokeLinejoin="round">
      {/* abdômen (central) com segmentação sutil */}
      <path d="M89 124 Q100 121 111 124 L110 172 Q100 178 90 172 Z" fill={F("abdomen")} />
      <g stroke="#ffffff" strokeOpacity="0.55" strokeWidth="1">
        <line x1="100" y1="126" x2="100" y2="172" />
        <line x1="91" y1="138" x2="109" y2="138" />
        <line x1="91" y1="152" x2="109" y2="152" />
      </g>
      <Sym>
        <ellipse cx="61" cy="86" rx="13" ry="15" fill={F("deltoides")} />
        <path d="M74 84 C88 79 96 82 98 84 L98 118 C89 123 78 121 73 110 C71 98 72 90 74 84 Z" fill={F("peitoral")} />
        <ellipse cx="55" cy="120" rx="8.5" ry="20" fill={F("biceps")} />
        <ellipse cx="50" cy="166" rx="7" ry="21" fill={F("antebracos")} />
        <path d="M80 126 C84 148 86 165 84 175 L78 171 C74 152 75 137 77 126 Z" fill={F("obliquos")} />
        <path d="M83 214 C78 244 80 275 87 298 L98 294 L98 212 C92 210 87 211 83 214 Z" fill={F("quadriceps")} />
        <path d="M99 214 L99 290 L92 288 C92 256 95 232 97 214 Z" fill={F("adutores")} />
        <ellipse cx="88" cy="322" rx="8" ry="22" fill={F("panturrilhas")} />
      </Sym>
    </g>
  );
}

function BackMuscles({ F }: { F: (k: MuscleKey) => string }) {
  return (
    <g stroke={MUSCLE_STROKE} strokeWidth="1" strokeLinejoin="round">
      {/* trapézio (kite central) + lombar (central) */}
      <path d="M100 68 L119 84 L100 118 L81 84 Z" fill={F("trapezio")} />
      <path d="M90 138 Q100 135 110 138 L108 172 Q100 177 92 172 Z" fill={F("lombar")} />
      <Sym>
        <ellipse cx="61" cy="86" rx="13" ry="15" fill={F("deltoides")} />
        <path d="M74 106 C65 132 72 158 89 168 L96 122 C92 112 82 106 74 106 Z" fill={F("dorsais")} />
        <ellipse cx="55" cy="120" rx="8.5" ry="20" fill={F("triceps")} />
        <ellipse cx="50" cy="166" rx="7" ry="21" fill={F("antebracos")} />
        <path d="M80 188 C73 191 71 206 80 217 C91 221 99 214 99 199 C97 189 88 186 80 188 Z" fill={F("gluteos")} />
        <path d="M83 220 C78 250 80 281 87 302 L98 298 L98 218 C92 216 87 217 83 220 Z" fill={F("isquiotibiais")} />
        <ellipse cx="88" cy="324" rx="8" ry="22" fill={F("panturrilhas")} />
      </Sym>
    </g>
  );
}

function Defs() {
  return (
    <defs>
      <linearGradient id="mm-skin" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#F6F9FD" />
        <stop offset="1" stopColor="#E7EDF5" />
      </linearGradient>
    </defs>
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
            <Defs />
            <Silhouette />
            <FrontMuscles F={F} />
          </svg>
          <figcaption className="mt-1 text-center text-[11px] font-medium text-ink-3">Frente</figcaption>
        </figure>
        <figure className="rounded-xl bg-surface-soft p-2">
          <svg viewBox="0 0 200 380" className="mx-auto h-64 w-full" role="img" aria-label="Vista posterior dos músculos ativados">
            <Defs />
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
      <Defs />
      <Silhouette />
      {back ? <BackMuscles F={F} /> : <FrontMuscles F={F} />}
    </svg>
  );
}
