import * as React from "react";
import { CalendarRange, AlertTriangle, Dumbbell } from "lucide-react";
import { buttonClasses } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { useDialog } from "@/lib/useDialog";
import { semanaAtual, mesocicloAtual, rotuloMeso, type PlanoTreino } from "@/data/periodizacao";
import type { Prescricao } from "@/data/alunos";
import type { Execucao } from "@/data/execucao";
import {
  aplicarPrescricaoNoPlano,
  blocosForcaAtuais,
  sessoesDaSemana,
  letraSessao,
  type ResumoAplicacao,
} from "@/lib/gps/semear";

/**
 * "Aplicar no treino": leva os exercícios de uma Prescricao para as sessões do plano.
 *
 * Uma decisão só (decisão travada 9): um botão primário com o escopo default já
 * pré-selecionado (a sessão correspondente em TODAS as semanas restantes do bloco atual),
 * bottom sheet no mobile e modal estreito no desktop. As alternativas (só esta semana,
 * outra sessão, adicionar sem substituir, decidir depois) ficam como links pequenos.
 *
 * As doses são rederivadas da faixa do plano no motor de semeadura; aqui só declaramos isso
 * ("O raciocínio da escolha fica no prontuário"). O componente é compartilhado entre o
 * pós-salvar do Prescrever exercício e o botão "Colocar no treino" no perfil do aluno.
 */
export function AplicarNoTreinoDialog({
  prescricao,
  plano,
  onAplicar,
  onDecidirDepois,
  dataDaPrescricao,
  execucoes = [],
}: {
  prescricao: Prescricao;
  plano: PlanoTreino;
  onAplicar: (planoAtualizado: PlanoTreino, resumo: ResumoAplicacao) => void;
  /** "Decidir depois": a prescrição já está salva; nada é aplicado. */
  onDecidirDepois: () => void;
  /** resolve a data de exibição de uma prescrição pela id (para o alcance de substituição) */
  dataDaPrescricao?: (id: string) => string | undefined;
  /** execuções do aluno, para avisar quando substituir vai desvincular histórico */
  execucoes?: Execucao[];
}) {
  const dialogRef = useDialog<HTMLDivElement>(onDecidirDepois);
  const semanaCorrente = semanaAtual(plano);
  const meso = mesocicloAtual(plano);
  const sessoes = sessoesDaSemana(plano, semanaCorrente);

  const [sessaoIndex, setSessaoIndex] = React.useState(0);
  const [picker, setPicker] = React.useState(false);
  const [adicionar, setAdicionar] = React.useState(false);

  const podeAplicar = sessoes.length > 0;
  const objetivoDivergente = prescricao.answers.objetivo !== plano.objetivo;

  // Alcance nominal do que sai quando substitui a sessão-alvo na semana corrente.
  const atuais = blocosForcaAtuais(plano, semanaCorrente, sessaoIndex);
  const semeadosAntes = atuais.filter((b) => b.origemPrescricaoId);

  // Substituir troca os blocos de força por ids novos, então qualquer execução que
  // o aluno já registrou nesses blocos fica desvinculada. Mesmo guard do regenerar
  // plano (PrescreverTreino): varre as semanas afetadas e avisa antes. Adicionar
  // sem substituir não remove nada, então não há risco.
  const idsEmRisco = React.useMemo(() => {
    const set = new Set<string>();
    const ate = meso ? meso.semanaFim : semanaCorrente;
    for (let w = semanaCorrente; w <= ate; w++) {
      blocosForcaAtuais(plano, w, sessaoIndex).forEach((b) => set.add(b.id));
    }
    return set;
  }, [plano, meso, semanaCorrente, sessaoIndex]);
  const execucoesEmRisco = !adicionar && execucoes.some((e) => idsEmRisco.has(e.blocoRef));
  const dataAntes = (() => {
    const ids = Array.from(new Set(semeadosAntes.map((b) => b.origemPrescricaoId!).filter(Boolean)));
    if (ids.length === 1 && dataDaPrescricao) return dataDaPrescricao(ids[0]);
    return undefined;
  })();

  const aplicar = (escopo: "bloco" | "semana", modo: "substituir" | "adicionar") => {
    const { plano: novo, resumo } = aplicarPrescricaoNoPlano(plano, prescricao, {
      semanaCorrente,
      sessaoIndex,
      escopo,
      modo,
    });
    onAplicar(novo, resumo);
  };

  const letra = letraSessao(sessaoIndex);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end bg-black/40 p-0 backdrop-blur-sm sm:place-items-center sm:p-4"
      onClick={onDecidirDepois}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Aplicar no treino"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-card bg-surface p-6 shadow-elevated outline-none sm:rounded-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-tint text-primary">
            <CalendarRange className="h-4 w-4" />
          </span>
          <h2 className="font-display text-lg font-bold text-ink">Aplicar no treino</h2>
        </div>

        <p className="text-sm text-ink-2">
          Leva os {prescricao.itens.length} exercícios de <span className="font-semibold text-ink">{prescricao.titulo}</span> para
          as sessões do plano de {plano.titulo}.
        </p>

        {meso && (
          <p className="mt-1 text-xs text-ink-3">
            Bloco atual: <span className="font-semibold text-ink-2">{rotuloMeso(meso)}</span> (semanas {meso.semanaInicio} a{" "}
            {meso.semanaFim}) · você está na semana {semanaCorrente}.
          </p>
        )}

        {!podeAplicar ? (
          <div className="mt-4 rounded-lg border border-dashed border-border bg-surface-soft p-3 text-sm text-ink-2">
            A semana corrente do plano não tem sessões para receber os exercícios. Abra o plano e ajuste as sessões
            primeiro.
          </div>
        ) : (
          <>
            {/* Alcance da substituição (o que sai da sessão-alvo). Só quando de fato
                substitui: com "adicionar" marcado, nada sai. */}
            {!adicionar && atuais.length > 0 && (
              <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-surface-soft p-2.5 text-xs text-ink-2">
                <Dumbbell className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                <span>
                  Isto substitui os exercícios de força atuais da Sessão {letra}: {atuais.map((b) => b.nome).join(", ")}
                  {meso && meso.semanaFim > semanaCorrente ? ", e os equivalentes nas semanas seguintes deste bloco" : ""}.
                  {semeadosAntes.length > 0 && (
                    <> Inclui os {semeadosAntes.length} aplicados{dataAntes ? ` em ${dataAntes}` : " antes"}.</>
                  )}
                </span>
              </p>
            )}

            {/* Aviso forte: substituir vai desvincular registros do aluno */}
            {execucoesEmRisco && (
              <p className="mt-2 flex items-start gap-1.5 rounded-lg border border-[#b45309]/30 bg-warning-tint p-2.5 text-xs text-warning">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                O aluno já registrou execução nessas sessões. Substituir vai desvincular esse histórico das sessões atuais.
                Se quiser preservar, use "adicionar sem substituir".
              </p>
            )}

            {/* Aviso de objetivo divergente (não bloqueia) */}
            {objetivoDivergente && (
              <p className="mt-2 flex items-start gap-1.5 rounded-lg border border-[#b45309]/30 bg-warning-tint p-2.5 text-xs text-warning">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                A prescrição foi feita para {prescricao.answers.objetivo} e o plano é de {plano.objetivo}. As doses seguem a
                faixa do plano; confira se os exercícios cabem no objetivo dele.
              </p>
            )}

            {/* Seletor de sessão / adicionar sem substituir (revelado sob demanda) */}
            {picker && (
              <div className="mt-3 space-y-2 rounded-lg border border-border p-3">
                <label className="block text-xs font-semibold text-ink-2" htmlFor="aplicar-sessao">
                  Sessão da semana
                </label>
                <select
                  id="aplicar-sessao"
                  value={sessaoIndex}
                  onChange={(e) => setSessaoIndex(Number(e.target.value))}
                  className="input h-9 w-full py-0 text-sm"
                >
                  {sessoes.map((s, i) => (
                    <option key={s.id} value={i}>
                      Sessão {letraSessao(i)} · {s.nome}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-2 text-sm text-ink-2">
                  <input
                    type="checkbox"
                    checked={adicionar}
                    onChange={(e) => setAdicionar(e.target.checked)}
                    className="h-4 w-4 accent-[var(--primary)]"
                  />
                  Adicionar ao fim, sem substituir os exercícios atuais
                </label>
              </div>
            )}

            {/* Botão primário único, com o escopo default já pré-selecionado */}
            <button
              onClick={() => aplicar("bloco", adicionar ? "adicionar" : "substituir")}
              className={cn(buttonClasses("primary"), "mt-4 w-full")}
            >
              <CalendarRange className="h-4 w-4" />
              {adicionar ? `Adicionar na Sessão ${letra}` : `Aplicar na Sessão ${letra}`}
            </button>

            <p className="mt-2 text-center text-2xs leading-snug text-ink-3">
              Vale até o fim deste bloco. As doses seguem a faixa do seu plano; o raciocínio da escolha
              fica no prontuário.
            </p>

            {/* Alternativas como links pequenos */}
            <div className="mt-3 flex flex-col items-center gap-1.5 border-t border-border pt-3 text-xs">
              <button
                onClick={() => aplicar("semana", adicionar ? "adicionar" : "substituir")}
                className="font-semibold text-primary hover:underline"
              >
                Aplicar só nesta semana
              </button>
              <button
                onClick={() => setPicker((v) => !v)}
                className="font-semibold text-primary hover:underline"
              >
                Escolher outra sessão ou adicionar sem substituir
              </button>
              <button onClick={onDecidirDepois} className="text-ink-3 hover:text-ink">
                Decidir depois (fica em Prescrições)
              </button>
            </div>
          </>
        )}

        {!podeAplicar && (
          <div className="mt-4 flex justify-end">
            <button onClick={onDecidirDepois} className={buttonClasses("secondary", "sm")}>
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
