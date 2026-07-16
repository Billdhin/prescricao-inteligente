import { BookOpen } from "lucide-react";
import { getExercicioRefs } from "@/data/exercise-referencias";
import { bibliografia } from "@/data/referencias";
import { cn } from "@/lib/utils";

/**
 * Bloco "Base científica" reutilizado nas abas Biomecânica/Fisiologia e no
 * comparador. Torna os números respaldados e citáveis (nome + ano + fonte),
 * com a nota metodológica honesta: são ativações RELATIVAS ESTIMADAS da
 * literatura de EMG/biomecânica, não medições do aluno.
 */
export function BaseCientifica({
  slug,
  contexto = "ativacao",
  className,
}: {
  slug: string;
  /** ajusta a nota metodológica ao que está sendo respaldado */
  contexto?: "ativacao" | "indice";
  className?: string;
}) {
  const biblio = bibliografia(getExercicioRefs(slug));
  if (biblio.length === 0) return null;

  const nota =
    contexto === "indice"
      ? "O Índice de Eficiência e as barras de demanda são estimativas relativas, sintetizadas da literatura de EMG e biomecânica abaixo para comparar exercícios; não são medições do seu aluno. Ajuste ao caso e à diretriz vigente."
      : "Os valores vão de 0 a 100 e são de ativação relativa ESTIMADA: cada músculo é comparado com o máximo dele mesmo, sintetizado da literatura de EMG e biomecânica abaixo. Não somam 100 e não são fatia do esforço total, nem medição do seu aluno; servem para comparar a ênfase entre exercícios.";

  return (
    <section className={cn("rounded-xl border border-border bg-surface-soft p-4", className)}>
      <div className="mb-2 flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#e6f7f9] text-[#0e7c8a]">
          <BookOpen className="h-4 w-4" />
        </span>
        <h4 className="font-display text-sm font-bold text-ink">Base científica</h4>
      </div>
      <p className="mb-3 text-xs leading-relaxed text-ink-2">{nota}</p>
      <ol className="space-y-1.5">
        {biblio.map((b) => (
          <li key={b.ref.id} className="flex gap-2 text-xs text-ink-2">
            <span className="tabular font-semibold text-[#0e7c8a]">{b.n}.</span>
            <span>
              <span className="font-medium text-ink">
                {b.ref.autores} ({b.ref.ano}).
              </span>{" "}
              {b.ref.titulo}. <span className="italic">{b.ref.fonte}</span>.
              {b.ref.nota ? <span className="block text-ink-3">{b.ref.nota}</span> : null}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
