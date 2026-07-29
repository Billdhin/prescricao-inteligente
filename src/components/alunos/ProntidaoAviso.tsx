import * as React from "react";
import { Link } from "react-router-dom";
import { Lock, Info, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/primitives";
import type { Prontidao } from "@/lib/gps/prontidao";
import type { Aluno } from "@/data/alunos";

/**
 * O que falta para prescrever, dito onde a prescrição seria feita.
 *
 * Um bloqueio que só diz "não pode" é obstáculo; um que diz o que falta, POR QUE
 * aquilo muda a prescrição e leva com um clique ao lugar de resolver é parte do
 * método. Por isso cada linha traz o motivo em linguagem clínica e o atalho para a
 * seção do perfil que a resolve.
 *
 * Os avisos ficam abaixo e NÃO travam: eles reduzem a qualidade do plano (sem idade
 * não há zona de FC), não a segurança. Misturar os dois faria o profissional
 * aprender a ignorar os dois.
 */
export function ProntidaoAviso({
  aluno,
  prontidao,
  onAvaliar,
}: {
  aluno: Aluno;
  prontidao: Prontidao;
  /** quando existe, o bloqueio da avaliação vira botão em vez de link */
  onAvaliar?: () => void;
}) {
  const { bloqueios, avisos } = prontidao;
  if (bloqueios.length === 0 && avisos.length === 0) return null;

  return (
    <div className="space-y-3">
      {bloqueios.length > 0 && (
        <Card tone="warning" className="p-4 sm:p-5" role="alert">
          <div className="mb-1 flex items-center gap-2">
            <Lock aria-hidden className="h-4 w-4 shrink-0 text-warning-text" />
            <h3 className="font-display font-bold text-ink">
              {bloqueios.length === 1
                ? "Falta uma definição antes de prescrever"
                : `Faltam ${bloqueios.length} definições antes de prescrever`}
            </h3>
          </div>
          <p className="mb-3 text-sm text-ink-2">
            O perfil incompleto não impede avaliar. Impede prescrever: sem estas respostas o motor
            trabalha no escuro e o plano sai como se não houvesse nada a considerar.
          </p>
          <ul className="space-y-2.5">
            {bloqueios.map((b) => (
              <li key={b.motivo} className="border-l-2 border-warning pl-3">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <span className="font-semibold text-ink">{b.titulo}</span>
                  {b.secao ? (
                    <Link
                      to={`/alunos/${aluno.id}/perfil?secao=${b.secao}`}
                      className="inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap text-sm font-bold text-primary hover:underline"
                    >
                      {b.acao} <ChevronRight aria-hidden className="h-3.5 w-3.5" />
                    </Link>
                  ) : b.motivo === "sem-avaliacao" && onAvaliar ? (
                    <button
                      type="button"
                      onClick={onAvaliar}
                      className="shrink-0 whitespace-nowrap text-sm font-bold text-primary hover:underline"
                    >
                      {b.acao}
                    </button>
                  ) : null}
                </div>
                <p className="mt-0.5 text-sm leading-relaxed text-ink-2">{b.porque}</p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {avisos.length > 0 && (
        <Card variant="soft" className="p-4 sm:p-5">
          <div className="mb-1 flex items-center gap-2">
            <Info aria-hidden className="h-4 w-4 shrink-0 text-ink-3" />
            <h3 className="font-semibold text-ink">
              {bloqueios.length > 0 ? "E mais, sem travar" : "Dá para prescrever, com uma ressalva"}
            </h3>
          </div>
          <ul className="space-y-2">
            {avisos.map((a) => (
              <li key={a.motivo}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <span className="text-sm font-semibold text-ink">{a.titulo}</span>
                  {a.secao && (
                    <Link
                      to={`/alunos/${aluno.id}/perfil?secao=${a.secao}`}
                      className="shrink-0 whitespace-nowrap text-sm font-semibold text-ink-2 underline decoration-border underline-offset-4 hover:text-ink"
                    >
                      {a.acao}
                    </Link>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-ink-2">{a.porque}</p>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
