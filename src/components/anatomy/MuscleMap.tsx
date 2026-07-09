import { cn, withBase } from "@/lib/utils";
import type { Exercise } from "@/data/types";
import { getMuscleMapImages, getMuscleMapPose } from "@/data/muscle-map-images";

/**
 * Mapa muscular — imagem anatômica (frente + costas) com os músculos ativados JÁ MARCADOS
 * na própria figura (gerada por IA sobre a figura cinza, com a intensidade por tom de azul e
 * verificada cientificamente). Quando o exercício ainda não tem imagem, mostra a figura cinza
 * neutra. Layout: figuras + Escala de ativação + Principais músculos, no estilo do sistema.
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
  if (n.includes("eretores") || n.includes("lombar")) return "lombar";
  if (n.includes("oblíquo") || n.includes("obliquo")) return "obliquos";
  if (n.includes("abdominal") || n.includes("abdômen") || n.includes("abdomen") || n.includes("core") || n.includes("transverso")) return "abdomen";
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

const FRONT_BASE = "/anatomy/muscle-front.webp";
const BACK_BASE = "/anatomy/muscle-back.webp";

function Figure({ src, label }: { src: string; label?: string }) {
  return (
    <figure className="rounded-xl bg-surface-soft p-2">
      <div className="relative mx-auto aspect-[3/5] w-full max-w-[180px]">
        <img src={withBase(src)} alt={label ? `Mapa muscular: ${label}` : "Mapa muscular"} className="h-full w-full object-contain" loading="lazy" />
      </div>
      {label && <figcaption className="mt-0.5 text-center text-[11px] font-medium text-ink-3">{label}</figcaption>}
    </figure>
  );
}

/** Boneco anatômico NA POSIÇÃO do exercício (mesma figura cinza + músculos em azul,
 *  reposicionada). Substitui as vistas em pé quando existe. */
function PoseBoneco({ src }: { src: string }) {
  return (
    <figure className="col-span-2 rounded-xl bg-surface-soft p-2 lg:col-span-1">
      <div className="relative mx-auto aspect-square w-full max-w-[250px]">
        <img
          src={withBase(src)}
          alt="Mapa muscular na posição do exercício"
          className="h-full w-full object-contain"
          loading="lazy"
        />
      </div>
      <figcaption className="mt-0.5 text-center text-[11px] font-medium text-ink-3">
        Na posição do exercício
      </figcaption>
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

export function MuscleMap({
  activation,
  slug,
  className,
}: {
  activation: Activation;
  slug?: string;
  className?: string;
}) {
  const imgs = getMuscleMapImages(slug);
  const pose = getMuscleMapPose(slug);
  const ativos = (Object.keys(activation) as MuscleKey[])
    .filter((k) => (activation[k] ?? 0) > 0)
    .sort((a, b) => (activation[b] ?? 0) - (activation[a] ?? 0));

  return (
    <div className={className}>
      <div
        className={cn(
          "grid grid-cols-2 items-stretch gap-3",
          pose ? "lg:grid-cols-[1.3fr_1fr_1.2fr]" : "lg:grid-cols-4",
        )}
      >
        {pose ? (
          // Boneco NA POSIÇÃO do exercício (pedido do prof.) — substitui as vistas em pé
          <PoseBoneco src={pose} />
        ) : (
          <>
            <Figure src={imgs?.front ?? FRONT_BASE} label="Frente" />
            <Figure src={imgs?.back ?? BACK_BASE} label="Costas" />
          </>
        )}

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
            Os valores representam a <span className="font-semibold text-ink">ativação relativa estimada</span> para este exercício; não são medição do aluno.
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

/** Miniatura para cards — frente ou costas conforme a maior ativação. */
export function MuscleThumb({ activation, slug, className }: { activation: Activation; slug?: string; className?: string }) {
  const imgs = getMuscleMapImages(slug);
  const backSum = BACK_KEYS.reduce((s, k) => s + (activation[k] ?? 0), 0);
  const frontSum = (Object.keys(activation) as MuscleKey[])
    .filter((k) => !BACK_KEYS.includes(k))
    .reduce((s, k) => s + (activation[k] ?? 0), 0);
  const back = backSum > frontSum;
  const src = back ? (imgs?.back ?? BACK_BASE) : (imgs?.front ?? FRONT_BASE);
  return (
    <div className={cn("relative aspect-[3/5]", className)}>
      <img src={withBase(src)} alt={`Músculos predominantes (vista ${back ? "posterior" : "frontal"})`} className="h-full w-full object-contain" loading="lazy" />
    </div>
  );
}
