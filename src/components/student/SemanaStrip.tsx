import * as React from "react";
import { Check } from "lucide-react";
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
  amarelo: "bg-warning-fill",
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
  semLegenda = false,
}: {
  alunoId: string;
  execucoes: Execucao[];
  liberacoes: Liberacao[];
  /** cor da marca do profissional, para o anel do dia de hoje */
  cor: string;
  agora?: number;
  /** versão menor e sem legenda (lado do profissional) */
  compacto?: boolean;
  /**
   * Faixa de RECAPITULAÇÃO (protótipo, telas 06 e 13): no fim do Hoje, depois do treino ou
   * durante a pausa, a faixa só lembra a semana. A legenda já foi lida no topo da tela nos
   * outros dias; repetida aqui, ela disputaria a leitura com o que importa naquele estado.
   */
  semLegenda?: boolean;
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
      <div className={cn("grid grid-cols-7", compacto ? "gap-1.5" : "gap-1")}>
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

          const dot = compacto ? "h-1 w-1" : "h-[5px] w-[5px]";

          return (
            <div
              key={lbl}
              role="img"
              aria-label={rotulo}
              className={cn(
                "flex flex-col items-center border border-border bg-surface",
                compacto ? "gap-0 rounded-lg px-0.5 py-1" : "gap-0.5 rounded-[10px] px-0.5 py-1.5",
                futuro && "opacity-50",
              )}
              // Anel na cor da marca via box-shadow (não empurra o layout como mudar a borda faria).
              style={ehHoje ? { boxShadow: `0 0 0 2px ${cor}` } : undefined}
            >
              {/* O rótulo de hoje ESCREVE na cor da marca, então usa a versão dela puxada até
                  4,5:1 (`--primary-texto`). O anel logo acima continua na cor de preenchimento,
                  que só precisa de 3:1 por não ser texto. */}
              <span
                aria-hidden
                className={cn(
                  "uppercase",
                  compacto ? "text-2xs font-semibold tracking-wide" : "text-2xs font-bold tracking-[0.04em]",
                  ehHoje ? "text-primary-texto" : compacto ? "text-ink-3" : "text-ink-2",
                )}
              >
                {lbl}
              </span>
              <span aria-hidden className={cn("tabular font-bold text-ink", compacto ? "text-xs" : "text-xs leading-tight")}>
                {diaNum}
              </span>
              {/* O treino é TIQUE e o semáforo é PONTO. Antes os dois eram ponto verde, e
                  no mesmo dia apareciam lado a lado sem como distinguir um do outro. */}
              <div aria-hidden className={cn("flex items-center gap-1", compacto ? "mt-0.5 h-2.5" : "h-2")}>
                {treino && <Check className={cn("shrink-0", compacto ? "h-2.5 w-2.5" : "h-2.5 w-2.5")} strokeWidth={3} style={{ color: cor }} />}
                {sem && <span className={cn("shrink-0 rounded-full", dot, SEMAFORO_DOT[sem])} />}
              </div>
            </div>
          );
        })}
      </div>

      {/* A LEGENDA NUMA LINHA SÓ (protótipo, tela 01). Em duas linhas, com o prefixo
          "Semáforo do dia:", ela pesava quase o mesmo que a própria faixa. O tique continua
          separado dos pontos pela forma, e os três pontos seguem na ordem do semáforo. */}
      {!compacto && !semLegenda && (
        <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-2xs leading-tight text-ink-2">
          <span className="inline-flex items-center gap-1">
            <Check aria-hidden className="h-3 w-3 shrink-0" strokeWidth={3} style={{ color: cor }} />
            treino registrado
          </span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <span aria-hidden className="h-[5px] w-[5px] rounded-full bg-success" />
            liberado
          </span>
          <span className="inline-flex items-center gap-1">
            <span aria-hidden className="h-[5px] w-[5px] rounded-full bg-warning-fill" />
            com ajuste
          </span>
          <span className="inline-flex items-center gap-1">
            <span aria-hidden className="h-[5px] w-[5px] rounded-full bg-danger-fill" />
            não liberado
          </span>
        </div>
      )}
    </div>
  );
}
