import type { Exercise } from "@/data/types";
import { cn, withBase } from "@/lib/utils";

/**
 * Mapa muscular — écorché fotorrealista (frente + costas, gerado por IA, no mesmo estilo
 * do "homem de músculos" da análise do herói) com DESTAQUE data-driven: cada músculo
 * ativado recebe um brilho azul (mix-blend screen: só acende sobre o músculo, não no fundo),
 * com intensidade proporcional à ativação (0–100). Tudo conectado e coerente com a imagem
 * grande do exercício.
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

/** Elipses de brilho por músculo, em espaço 0–100 (x) × 0–150 (y) sobre o écorché 2:3.
 *  [cx, cy, rx, ry]. Uma ou duas por músculo (esquerda/direita). */
type Ell = [number, number, number, number];
const FRONT: Partial<Record<MuscleKey, Ell[]>> = {
  deltoides: [[37, 36, 5, 5.5], [63, 36, 5, 5.5]],
  peitoral: [[44, 43, 7, 6], [56, 43, 7, 6]],
  biceps: [[31, 49, 4.5, 8], [69, 49, 4.5, 8]],
  antebracos: [[28, 65, 4, 9], [72, 65, 4, 9]],
  abdomen: [[50, 55, 8, 12]],
  obliquos: [[42, 58, 3, 7], [58, 58, 3, 7]],
  quadriceps: [[44, 83, 6.5, 15], [56, 83, 6.5, 15]],
  adutores: [[50, 80, 4.5, 12]],
  panturrilhas: [[45, 113, 4.5, 10], [55, 113, 4.5, 10]],
};
const BACK: Partial<Record<MuscleKey, Ell[]>> = {
  trapezio: [[50, 37, 12, 8]],
  deltoides: [[38, 35, 5, 5.5], [62, 35, 5, 5.5]],
  dorsais: [[43, 48, 7, 9], [57, 48, 7, 9]],
  triceps: [[31, 48, 4.5, 8], [69, 48, 4.5, 8]],
  antebracos: [[28, 64, 4, 9], [72, 64, 4, 9]],
  lombar: [[50, 59, 6, 6]],
  gluteos: [[44, 68, 6, 7], [56, 68, 6, 7]],
  isquiotibiais: [[45, 85, 6, 14], [55, 85, 6, 14]],
  panturrilhas: [[45, 113, 5, 11], [55, 113, 5, 11]],
};

function Ecorche({
  src,
  regions,
  activation,
  caption,
  className,
}: {
  src: string;
  regions: Partial<Record<MuscleKey, Ell[]>>;
  activation: Activation;
  caption?: string;
  className?: string;
}) {
  const keys = (Object.keys(regions) as MuscleKey[]).filter((k) => (activation[k] ?? 0) > 0);
  return (
    <figure className={className}>
      <div className="relative overflow-hidden rounded-xl bg-white ring-1 ring-border">
        <img src={withBase(src)} alt={caption ? `Écorché — ${caption}` : "Écorché muscular"} className="block w-full" loading="lazy" />
        <svg
          viewBox="0 0 100 150"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{ mixBlendMode: "screen" }}
          aria-hidden
        >
          <defs>
            <radialGradient id="mm-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#bcd6ff" />
              <stop offset="45%" stopColor="#4f8cf7" />
              <stop offset="100%" stopColor="#4f8cf7" stopOpacity="0" />
            </radialGradient>
          </defs>
          {keys.map((k) => {
            const v = activation[k] ?? 0;
            const op = Math.min(0.9, 0.34 + 0.6 * (v / 100));
            return (regions[k] as Ell[]).map((e, i) => (
              <ellipse key={`${k}-${i}`} cx={e[0]} cy={e[1]} rx={e[2]} ry={e[3]} fill="url(#mm-glow)" opacity={op} />
            ));
          })}
        </svg>
      </div>
      {caption && <figcaption className="mt-1 text-center text-[11px] font-medium text-ink-3">{caption}</figcaption>}
    </figure>
  );
}

export function MuscleMap({ activation, className }: { activation: Activation; className?: string }) {
  const ativos = (Object.keys(activation) as MuscleKey[])
    .filter((k) => (activation[k] ?? 0) > 0)
    .sort((a, b) => (activation[b] ?? 0) - (activation[a] ?? 0));

  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-3">
        <Ecorche src="/anatomy/ecorche-front.webp" regions={FRONT} activation={activation} caption="Frente" />
        <Ecorche src="/anatomy/ecorche-back.webp" regions={BACK} activation={activation} caption="Costas" />
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

/** Miniatura para cards — écorché frente ou costas conforme a maior ativação. */
export function MuscleThumb({ activation, className }: { activation: Activation; className?: string }) {
  const backSum = BACK_KEYS.reduce((s, k) => s + (activation[k] ?? 0), 0);
  const frontSum = (Object.keys(activation) as MuscleKey[])
    .filter((k) => !BACK_KEYS.includes(k))
    .reduce((s, k) => s + (activation[k] ?? 0), 0);
  const back = backSum > frontSum;
  return (
    <Ecorche
      src={back ? "/anatomy/ecorche-back.webp" : "/anatomy/ecorche-front.webp"}
      regions={back ? BACK : FRONT}
      activation={activation}
      className={cn("h-full w-full", className)}
    />
  );
}
