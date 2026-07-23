import * as React from "react";
import { cn } from "@/lib/utils";
import type { Execucao } from "@/data/execucao";
import type { Liberacao } from "@/data/alunos";
import { semaforoPorDiaDaSemana } from "@/lib/gps/semaforoDiario";

const DIA_MS = 86_400_000;
const DIAS_CURTO = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];
const DIAS_LONGO = ["segunda", "terça", "quarta", "quinta", "sexta", "sábado", "domingo"];

// Cor do ponto do semáforo por resultado, na mesma linguagem da régua do
// profissional (COR_SEMAFORO em AlunoDetail): verde/amarelo/vermelho por token.
const SEMAFORO_DOT: Record<Liberacao["resultado"], string> = {
  verde: "bg-success",
  amarelo: "bg-warning",
  vermelho: "bg-danger-fill",
};
const SEMAFORO_ROTULO: Record<Liberacao["resultado"], string> = {
  verde: "semáforo liberado",
  amarelo: "semáforo com ajuste",
  vermelho: "semáforo não liberado",
};

/** Início da semana civil (segunda 00:00) que contém `agora`. */
function inicioSemanaCivil(agora: number): number {
  const diaSemana = (new Date(agora).getDay() + 6) % 7;
  return new Date(agora).setHours(0, 0, 0, 0) - diaSemana * DIA_MS;
}

/**
 * Faixa SEG a DOM da semana civil de hoje: marca o que ACONTECEU no dia, nunca uma
 * agenda inventada. Por dia, um ponto de TREINO (quando há execução registrada
 * naquele dia) e um ponto de SEMÁFORO na cor do resultado (quando houve liberação
 * naquele dia). O dia de hoje ganha realce na cor da marca; dias futuros esmaecem.
 *
 * Componente de apresentação puro, alimentado por execuções e liberações já em mãos.
 * `compacto` encolhe a faixa e some com a legenda, para reuso no lado do profissional.
 */
export function SemanaStrip({
  alunoId,
  execucoes,
  liberacoes,
  cor,
  agora = Date.now(),
  compacto = false,
}: {
  alunoId: string;
  execucoes: Execucao[];
  liberacoes: Liberacao[];
  /** cor da marca do profissional, para o anel do dia de hoje */
  cor: string;
  agora?: number;
  /** versão menor e sem legenda (lado do profissional) */
  compacto?: boolean;
}) {
  const inicio = inicioSemanaCivil(agora);
  const hojeIdx = (new Date(agora).getDay() + 6) % 7;
  const semaforo = semaforoPorDiaDaSemana(alunoId, liberacoes, agora);

  // Dias com execução registrada do aluno (concluidoEm dentro da janela do dia).
  const doAluno = execucoes.filter((e) => e.alunoId === alunoId);
  const temTreino = (i: number): boolean => {
    const ini = inicio + i * DIA_MS;
    const fim = ini + DIA_MS;
    return doAluno.some((e) => e.concluidoEm >= ini && e.concluidoEm < fim);
  };

  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5">
        {DIAS_CURTO.map((lbl, i) => {
          const diaNum = new Date(inicio + i * DIA_MS).getDate();
          const ehHoje = i === hojeIdx;
          const futuro = i > hojeIdx;
          const treino = temTreino(i);
          const sem = semaforo[i];

          // aria-label descritivo: dia, número, o que aconteceu.
          const partes: string[] = [DIAS_LONGO[i], String(diaNum)];
          if (ehHoje) partes.push("hoje");
          if (treino) partes.push("treino registrado");
          if (sem) partes.push(SEMAFORO_ROTULO[sem]);
          if (!treino && !sem) partes.push(futuro ? "ainda por vir" : "sem registro");
          const rotulo = partes.join(", ");

          const dot = compacto ? "h-1 w-1" : "h-1.5 w-1.5";

          return (
            <div
              key={lbl}
              role="img"
              aria-label={rotulo}
              className={cn(
                "flex flex-col items-center rounded-lg border border-border bg-surface",
                compacto ? "gap-0 px-0.5 py-1" : "gap-0.5 px-1 py-1.5",
                futuro && "opacity-50",
              )}
              // Anel na cor da marca via box-shadow (não empurra o layout como mudar a borda faria).
              style={ehHoje ? { boxShadow: `0 0 0 2px ${cor}` } : undefined}
            >
              <span
                aria-hidden
                className={cn("font-semibold uppercase tracking-wide", compacto ? "text-2xs" : "text-2xs", !ehHoje && "text-ink-3")}
                style={ehHoje ? { color: cor } : undefined}
              >
                {lbl}
              </span>
              <span aria-hidden className={cn("tabular font-bold text-ink", compacto ? "text-xs" : "text-sm")}>
                {diaNum}
              </span>
              <div aria-hidden className={cn("flex items-center gap-1", compacto ? "mt-0.5 h-1.5" : "mt-1 h-2")}>
                {treino && <span className={cn("shrink-0 rounded-full bg-success", dot)} />}
                {sem && <span className={cn("shrink-0 rounded-full", dot, SEMAFORO_DOT[sem])} />}
              </div>
            </div>
          );
        })}
      </div>

      {!compacto && (
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-2xs text-ink-3">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
            Treino
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="inline-flex items-center gap-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              <span className="h-1.5 w-1.5 rounded-full bg-warning" />
              <span className="h-1.5 w-1.5 rounded-full bg-danger-fill" />
            </span>
            Semáforo
          </span>
        </div>
      )}
    </div>
  );
}
