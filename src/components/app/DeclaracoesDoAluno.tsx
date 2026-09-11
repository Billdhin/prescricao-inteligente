import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Send } from "lucide-react";
import { Card, Pill } from "@/components/ui/primitives";
import type { Aluno } from "@/data/alunos";
import {
  aplicarDeclaracao,
  declaracoesDe,
  pedidoTreinoEmAberto,
  valorLegivel,
  ROTULO_CAMPO,
  type CampoDeDado,
  type DeclaracaoAluno,
} from "@/data/declaracoes";
import { cn } from "@/lib/utils";

/**
 * "O QUE O ALUNO INFORMOU": a fila de revisão do profissional.
 *
 * Mesma forma que as sugestões do classificador já têm: o item chega, e o profissional
 * confirma, ajusta ou dispensa. Confirmar passa pela única porta que escreve na ficha
 * (`aplicarDeclaracao`), que carimba de onde veio e nunca toca no que é decisão dele
 * (nível, condição confirmada, restrição). Ajustar leva para a seção do perfil já com a
 * declaração visível no bloco, porque uma resposta como "pressão alta desde 2022" é
 * informação para ele declarar a condição na seção Saúde, não um campo para copiar.
 *
 * Confirmadas ficam num histórico dobrado, com a data: é o registro de que o dado veio do
 * aluno e de quando o profissional o aceitou.
 */
const fmt = (ts: number) => new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(ts));

/** Para onde "Ajustar" leva, por campo: a seção do perfil que decide sobre aquilo. */
const SECAO_DE: Record<CampoDeDado, string> = {
  idade: "basicos",
  sexo: "basicos",
  telefone: "basicos",
  objetivo: "objetivo",
  disponibilidade: "notas",
  equipamentos: "equipamentos",
  remedios: "medicamentos",
  saude: "saude",
  liberacao: "saude",
};

export function DeclaracoesDoAluno({
  aluno,
  declaracoes,
  temPlanoAtivo = false,
  onConfirmar,
  onDispensar,
}: {
  aluno: Aluno;
  declaracoes: DeclaracaoAluno[];
  /** com plano ativo, o pedido de treino já foi atendido e a faixa não aparece */
  temPlanoAtivo?: boolean;
  /** aplica o patch na ficha e marca a declaração como confirmada */
  onConfirmar: (d: DeclaracaoAluno, patch: Partial<Aluno>) => void;
  onDispensar: (d: DeclaracaoAluno) => void;
}) {
  const minhas = declaracoesDe(declaracoes, aluno.id);
  const pendentes = minhas.filter((d) => d.status === "pendente");
  const revisadas = minhas.filter((d) => d.status !== "pendente");
  const pedido = pedidoTreinoEmAberto(declaracoes, aluno.id, temPlanoAtivo);
  const [historico, setHistorico] = React.useState(false);
  if (!minhas.length && !pedido) return null;

  return (
    <Card className="p-3.5 md:p-5">
      {/* O PEDIDO DE TREINO abre o cartão: é a razão de o aluno ter preenchido tudo, e o
          que ele espera de volta. A ordem do trabalho fica escrita na própria faixa:
          revisar as respostas, depois montar. Na régua âmbar do "Próximo passo". */}
      {pedido && (
        <div className={cn("rounded-[14px] border border-warning-fill/40 bg-warning-tint p-3", minhas.length > 0 && "mb-4")}>
          <div className="flex items-start gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-surface text-cta-text">
              <Send className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-ink">
                {aluno.nome.split(" ")[0]} pediu o treino em {fmt(pedido.declaradaEm)}
              </div>
              <p className="mt-0.5 text-[12.5px] leading-snug text-ink-2">
                {pendentes.length > 0
                  ? `Revise ${pendentes.length === 1 ? "a resposta abaixo" : `as ${pendentes.length} respostas abaixo`} e monte o plano. Ele aparece no app do aluno assim que você publicar.`
                  : "Monte o plano quando puder. Ele aparece no app do aluno assim que você publicar."}
              </p>
              {pedido.valor && (
                <p className="mt-2 rounded-control bg-surface px-2.5 py-1.5 text-xs italic text-ink">“{pedido.valor}”</p>
              )}
            </div>
          </div>
          {/* No celular os botões ocupam a largura toda da faixa: recuados para alinhar ao
              texto, os dois não cabiam lado a lado em 326 px. */}
          <div className="mt-3 flex flex-wrap gap-2 sm:pl-[46px]">
            <Link
              to={`/prescrever-treino?aluno=${aluno.id}`}
              className="inline-flex h-10 items-center gap-1.5 rounded-control bg-ink px-4 text-[13.5px] font-semibold text-surface transition-[filter] hover:brightness-[1.15]"
            >
              Montar o treino <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <button
              onClick={() => onDispensar(pedido)}
              className="inline-flex h-10 items-center rounded-control border border-border bg-surface px-3.5 text-[13px] font-semibold text-ink-2 transition-colors hover:text-ink"
            >
              Dispensar o pedido
            </button>
          </div>
        </div>
      )}

      {minhas.length > 0 && (
        <>
      <div className="mb-1.5 flex flex-wrap items-center gap-2">
        <h3 className="font-display text-[17px] font-bold text-ink">O que o aluno informou</h3>
        {pendentes.length > 0 && <Pill tone="cta">{pendentes.length} a revisar</Pill>}
      </div>
      <p className="mb-3 text-[12.5px] leading-snug text-ink-2">
        Respostas do próprio aluno no app. Nada entra na ficha sem você confirmar; nível, condição e restrição continuam sendo decisão sua.
      </p>

      {pendentes.length > 0 && (
        <ul className="space-y-2">
          {pendentes.map((d) => {
            const patch = aplicarDeclaracao(aluno, d);
            const mudaFicha = Object.keys(patch).some((k) => k !== "observacoes");
            return (
              <li key={d.id} className="rounded-[14px] border border-border bg-surface-soft px-3.5 py-3">
                <div className="text-2xs font-bold uppercase tracking-wider text-ink-3">
                  {ROTULO_CAMPO[d.campo]} · {fmt(d.declaradaEm)}
                </div>
                <div className={cn("mt-0.5 text-sm text-ink", d.naoSei && "italic text-ink-2")}>{valorLegivel(d)}</div>
                {!mudaFicha && !d.naoSei && (
                  <div className="mt-1 text-2xs text-ink-3">Confirmar guarda isto nas notas com a origem; a decisão sobre o que muda no plano é na seção do perfil.</div>
                )}
                {/* "Confirmar" no primário escuro da casa: o azul fica para o pino da rota e o
                    anel de foco. Os três com 34 px, o tamanho das ações de linha do protótipo. */}
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <button
                    onClick={() => onConfirmar(d, patch)}
                    className="inline-flex h-[34px] items-center gap-1 rounded-control bg-ink px-3 text-[12.5px] font-semibold text-surface transition-[filter] hover:brightness-[1.15]"
                  >
                    <Check className="h-3.5 w-3.5" aria-hidden /> Confirmar
                  </button>
                  <Link
                    to={`/alunos/${aluno.id}/perfil?secao=${SECAO_DE[d.campo as CampoDeDado]}`}
                    className="inline-flex h-[34px] items-center rounded-control border border-border bg-surface px-3 text-[12.5px] font-semibold text-ink-2 transition-colors hover:text-ink"
                  >
                    Ajustar no perfil
                  </Link>
                  <button
                    onClick={() => onDispensar(d)}
                    className="inline-flex h-[34px] items-center rounded-control px-3 text-[12.5px] font-medium text-ink-3 transition-colors hover:text-ink"
                  >
                    Dispensar
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {revisadas.length > 0 && (
        <div className={cn(pendentes.length > 0 && "mt-3 border-t border-border pt-3")}>
          <button onClick={() => setHistorico((v) => !v)} className="min-h-[36px] text-xs font-semibold text-ink-2 underline-offset-2 hover:underline">
            {historico ? "Ocultar" : "Ver"} {revisadas.length} {revisadas.length === 1 ? "resposta revisada" : "respostas revisadas"}
          </button>
          {historico && (
            <ul className="mt-2 space-y-1.5">
              {revisadas.map((d) => (
                <li key={d.id} className="flex flex-wrap items-baseline gap-x-2 text-xs">
                  <span className="font-semibold text-ink">{ROTULO_CAMPO[d.campo]}:</span>
                  <span className="text-ink-2">{valorLegivel(d)}</span>
                  <span className="text-ink-3">
                    {d.status === "confirmada" ? "confirmada" : "dispensada"}
                    {d.revisadaEm ? ` em ${fmt(d.revisadaEm)}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
        </>
      )}
    </Card>
  );
}
