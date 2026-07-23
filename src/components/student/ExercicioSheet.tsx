import * as React from "react";
import { X, Target } from "lucide-react";
import { withBase } from "@/lib/utils";
import { getExercise } from "@/data/exercises";
import { getFasePose } from "@/data/fase-poses";
import { getMuscleMapPose } from "@/data/muscle-map-images";
import { MovimentoPlayer } from "@/components/movement-lab/MovimentoPlayer";
import { LinhaDeTokens, TokenRotulado } from "@/components/ui/primitives";

/**
 * Folha inferior (bottom-sheet) do exercício, aberta ao tocar no thumb/nome de um
 * bloco de força no app do aluno. Mostra, nesta ordem: o MOVIMENTO (player das poses
 * reais quando o slug tem fases, senão a foto grande de execução), o boneco muscular
 * posado com o músculo primário, o "Como fazer" (resumo + fases) e a DOSE prescrita
 * do bloco. Só usa imagens que existem e foram verificadas (nunca gera nem empresta a
 * de outro exercício); toda imagem entra com loading lazy.
 *
 * Fica DENTRO do container do app (overlay `fixed` centrado em max-w-md, descendente
 * do container temado): sem portal para fora, para o tema white-label do profissional
 * continuar valendo por herança de variáveis CSS. Fecha por X, backdrop e Esc, trava o
 * scroll do fundo, sobe com animação leve (respeitando reduced motion) e leva o foco.
 */
export function ExercicioSheet({
  exercicioSlug,
  nome,
  tokens,
  cor,
  onClose,
}: {
  exercicioSlug: string;
  nome: string;
  /** doses do bloco já calculadas pelo BlocoRow (rótulo colado ao valor) */
  tokens: { label: string; value: string }[];
  cor: string;
  onClose: () => void;
}) {
  const ex = getExercise(exercicioSlug);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const fecharRef = React.useRef<HTMLButtonElement>(null);

  // Trava o scroll do fundo enquanto a folha está aberta.
  React.useEffect(() => {
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = anterior;
    };
  }, []);

  // Foco entra na folha ao abrir (o retorno ao gatilho é responsabilidade de quem
  // abriu). preventScroll: a folha já está no viewport, não empurra o fundo travado.
  React.useEffect(() => {
    fecharRef.current?.focus({ preventScroll: true });
  }, []);

  // Esc fecha; Tab fica preso na folha (focus trap leve).
  React.useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const foco = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => !el.hasAttribute("disabled"));
        if (foco.length === 0) return;
        const primeiro = foco[0];
        const ultimo = foco[foco.length - 1];
        if (e.shiftKey && document.activeElement === primeiro) {
          e.preventDefault();
          ultimo.focus();
        } else if (!e.shiftKey && document.activeElement === ultimo) {
          e.preventDefault();
          primeiro.focus();
        }
      }
    };
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [onClose]);

  // Movimento quando o slug tem fotos de fase; senão, a foto grande de execução.
  const temMovimento = !!ex && ex.fases.length >= 2 && getFasePose(ex.slug, 1) != null;
  const poseMuscular = getMuscleMapPose(exercicioSlug);

  // Músculo primário pelos nomes EXATOS do catálogo (papel "primário"; se nenhum vier
  // marcado, o de maior ativação). Sem número: só o nome, para não afirmar escala.
  const primarios = ex ? ex.ativacao.filter((a) => a.papel === "primário").map((a) => a.musculo) : [];
  const alvo =
    primarios.length > 0
      ? primarios
      : ex && ex.ativacao.length > 0
        ? [ex.ativacao.slice().sort((a, b) => b.percentual - a.percentual)[0].musculo]
        : [];

  return (
    <>
      {/* Backdrop: dentro da coluna do app (mesma largura da barra inferior). */}
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="animate-surgir-backdrop fixed inset-0 z-40 mx-auto max-w-md bg-slate-900/50"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={nome}
        className="animate-subir-folha fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88dvh] w-full max-w-md flex-col rounded-t-card border-t border-border bg-surface shadow-elevated"
      >
        {/* Puxador + cabeçalho fixo */}
        <div className="shrink-0 rounded-t-card border-b border-border bg-surface px-4 pb-3 pt-2">
          <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-border" aria-hidden />
          <div className="flex items-start justify-between gap-3">
            <h2 className="min-w-0 font-display text-lg font-bold leading-tight text-ink">{nome}</h2>
            <button
              ref={fecharRef}
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="-mr-2 grid h-11 w-11 shrink-0 place-items-center rounded-lg text-ink-3 hover:bg-surface-soft hover:text-ink"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
          {/* Mídia: player do movimento (poses reais) ou foto grande de execução */}
          {temMovimento && ex ? (
            <MovimentoPlayer ex={{ slug: ex.slug, fases: ex.fases, ativacao: ex.ativacao }} />
          ) : ex?.imagem ? (
            <figure className="mx-auto max-w-[300px]">
              <div className="aspect-[4/3] w-full overflow-hidden rounded-card border border-border bg-surface-soft">
                <img
                  src={withBase(ex.imagem)}
                  alt={`Execução: ${nome}`}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
            </figure>
          ) : null}

          {/* Boneco muscular posado + músculo(s) primário(s) pelo nome do catálogo */}
          {poseMuscular && (
            <section className="flex items-center gap-3 rounded-card border border-border bg-surface-soft p-3">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface">
                <img
                  src={withBase(poseMuscular)}
                  alt={`Músculos trabalhados em ${nome}`}
                  loading="lazy"
                  className="h-full w-full object-contain"
                />
              </div>
              {alvo.length > 0 && (
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-3">
                    <Target className="h-3.5 w-3.5" aria-hidden />
                    Músculo{alvo.length > 1 ? "s" : ""} principal{alvo.length > 1 ? "is" : ""}
                  </div>
                  <p className="mt-0.5 font-semibold text-ink">{alvo.join(" · ")}</p>
                </div>
              )}
            </section>
          )}

          {/* Como fazer: resumo prático + as fases numeradas */}
          {ex && (ex.resumoPratico || ex.fases.length > 0) && (
            <section>
              <h3 className="font-display text-base font-bold text-ink">Como fazer</h3>
              {ex.resumoPratico && <p className="mt-1 text-sm leading-relaxed text-ink-2">{ex.resumoPratico}</p>}
              {ex.fases.length > 0 && (
                <ol className="mt-3 space-y-2">
                  {ex.fases.map((f, i) => (
                    <li key={f.nome} className="flex gap-3">
                      <span
                        className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold text-white"
                        style={{ background: cor }}
                      >
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-ink">{f.nome}</div>
                        <p className="text-sm leading-snug text-ink-2">{f.descricao}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          )}

          {/* Dose prescrita do bloco (mesma fonte de verdade da linha do treino) */}
          {tokens.length > 0 && (
            <section>
              <h3 className="font-display text-base font-bold text-ink">Sua dose de hoje</h3>
              <LinhaDeTokens className="mt-2">
                {tokens.map((t) => (
                  <TokenRotulado key={t.label} label={t.label} value={t.value} />
                ))}
              </LinhaDeTokens>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
