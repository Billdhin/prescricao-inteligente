/**
 * Card de direcionamento sugerido (Onda 3 · TRI-3).
 *
 * Mostra, no topo da aba "Plano e treino" do aluno, as sugestões de grupo especial
 * que o classificador derivou do cadastro e da avaliação. O sistema SUGERE; o
 * profissional confirma. Linguagem prudente, não diagnóstica, sem travessão.
 *
 * "Aplicar": se o aluno ainda não tem grupo principal, o direcionamento vira o
 * grupo principal e semeia a jornada (fase 1, modalidades e parâmetros do grupo);
 * se já tem, entra como condição de atenção adicional (multi-grupo). "Dispensar"
 * registra a dispensa para a sugestão não reaparecer.
 */

import * as React from "react";
import { Sparkles, Check, X, BookOpen } from "lucide-react";
import { Card, Pill, buttonClasses } from "@/components/ui/primitives";
import { classificarGrupos, type SugestaoGrupo } from "@/lib/gps/classificador";
import { getReferencia, refCurta } from "@/data/referencias";
import { toast } from "@/lib/toast";
import { associarGrupoAoAluno, textoDaAssociacao } from "@/lib/gps/associarGrupo";
import { cn } from "@/lib/utils";
import type { Aluno, Avaliacao } from "@/data/alunos";

export function SugestaoGrupoCard({
  aluno,
  avaliacoes,
  onUpdate,
}: {
  aluno: Aluno;
  avaliacoes: Avaliacao[];
  onUpdate: (patch: Partial<Aluno>) => void;
}) {
  const sugestoes = React.useMemo(
    () => classificarGrupos(aluno, avaliacoes),
    [aluno, avaliacoes],
  );
  if (sugestoes.length === 0) return null;

  const primeiroNome = aluno.nome.split(" ")[0];

  const aplicar = (s: SugestaoGrupo) => {
    // Encaminhamento (ex.: PA >= 180/110) NÃO vira grupo de treino: é recomendação
    // de conduta de saúde. A UI só informa; não há o que "aplicar" ao aluno.
    if (s.encaminhamento) return;
    // A regra dos dois ramos (vira principal e semeia a jornada, ou entra como condição
    // de atenção) mora em @/lib/gps/associarGrupo, porque o catálogo de grupos usa a
    // mesma. Duas cópias divergiriam no primeiro campo novo.
    const r = associarGrupoAoAluno(aluno, s.grupoSlug);
    if (r.tipo === "ja-associado") return;
    onUpdate(r.patch);
    toast(textoDaAssociacao(r, s.rotulo, primeiroNome));
  };

  const dispensar = (s: SugestaoGrupo) => {
    const atuais = aluno.sugestoesDispensadas ?? [];
    if (atuais.includes(s.grupoSlug)) return;
    onUpdate({ sugestoesDispensadas: [...atuais, s.grupoSlug] });
    toast(`Sugestão de ${s.rotulo} dispensada.`);
  };

  return (
    <Card tone="primary" className="space-y-3 p-4 md:p-5">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface text-primary">
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-base font-bold text-ink">Direcionamento sugerido</h3>
          <p className="text-xs text-ink-2">
            O sistema sugere pelo cadastro e pela avaliação; você confirma. Não é diagnóstico.
          </p>
        </div>
      </div>

      <ul className="space-y-2.5">
        {sugestoes.map((s) => {
          const ref = getReferencia(s.refId);
          return (
            <li key={s.grupoSlug} className="rounded-xl border border-border bg-surface p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-ink">{s.rotulo}</span>
                <Pill tone="neutral">{s.fonte === "avaliacao" ? "da avaliação" : "do cadastro"}</Pill>
              </div>
              <p className="mt-1 text-sm text-ink-2">
                {s.motivo} Este direcionamento ajusta a validação dos exercícios.
              </p>
              {ref && (
                <p className="mt-1.5 inline-flex flex-wrap items-center gap-1 text-xs text-ink-3">
                  <BookOpen className="h-3 w-3 shrink-0" aria-hidden /> {s.criterio} · {refCurta(s.refId)}
                </p>
              )}
              {s.encaminhamento ? (
                <p className="mt-2.5 rounded-lg border border-warning/40 bg-warning-tint px-3 py-2 text-xs font-medium text-warning">
                  Recomendação de conduta de saúde: oriente avaliação ou liberação médica antes de prescrever treino. Não é um grupo para aplicar.
                </p>
              ) : (
                <div className="mt-2.5 flex flex-wrap gap-2">
                  <button onClick={() => aplicar(s)} className={buttonClasses("secondary", "sm")}>
                    <Check className="h-4 w-4" /> Aplicar
                  </button>
                  <button onClick={() => dispensar(s)} className={cn(buttonClasses("ghost", "sm"))}>
                    <X className="h-4 w-4" /> Dispensar
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
