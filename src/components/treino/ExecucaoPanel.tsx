import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";
import { Card, Pill } from "@/components/ui/primitives";
import { exercises } from "@/data/exercises";
import type { PlanoTreino } from "@/data/periodizacao";
import type { Execucao } from "@/data/execucao";
import { ajustarCarga, faixaDeReps, type AcaoCarga } from "@/lib/gps/autorregulacao";

const nomeEx = (slug?: string) => (slug ? exercises.find((e) => e.slug === slug)?.nome ?? slug : "Exercício");
const fmtData = (ts: number) => new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(ts));

const ACAO_META: Record<AcaoCarga, { label: string; tone: "success" | "warning" | "neutral"; Icon: typeof TrendingUp }> = {
  subir: { label: "Progredir", tone: "success", Icon: TrendingUp },
  descarregar: { label: "Descarregar", tone: "warning", Icon: TrendingDown },
  manter: { label: "Manter", tone: "neutral", Icon: Minus },
  "sem-dado": { label: "Sem dado", tone: "neutral", Icon: Minus },
};

/**
 * Painel do profissional: o que o aluno executou e a SUGESTÃO de ajuste da
 * autorregulação por exercício. É apoio, não automatismo: o profissional lê a
 * proposta (com a justificativa) e decide. A camada de segurança do plano
 * (Semáforo, restrições) continua no caminho.
 */
export function ExecucaoPanel({ plano, execucoes }: { plano?: PlanoTreino; execucoes: Execucao[] }) {
  if (execucoes.length === 0) {
    return (
      <Card className="p-5">
        <h3 className="mb-1 flex items-center gap-2 font-display text-lg font-bold text-ink">
          <Activity className="h-5 w-5 text-primary" /> Execução do aluno
        </h3>
        <p className="text-sm text-ink-2">
          Quando o aluno registrar os treinos no app dele, a execução e as sugestões de ajuste aparecem aqui.
        </p>
      </Card>
    );
  }

  // Faixa de repetições por exercício (do primeiro bloco que o usa no plano).
  const faixaPorSlug = new Map<string, ReturnType<typeof faixaDeReps>>();
  plano?.macrociclo.mesociclos
    .flatMap((m) => m.microciclos)
    .flatMap((mc) => mc.sessoes)
    .flatMap((s) => s.blocos)
    .forEach((b) => {
      if (b.exercicioSlug && !faixaPorSlug.has(b.exercicioSlug)) faixaPorSlug.set(b.exercicioSlug, faixaDeReps(b.reps));
    });

  const slugs = [...new Set(execucoes.map((e) => e.exercicioSlug).filter(Boolean) as string[])];
  const sugestoes = slugs
    .map((slug) => {
      const execs = execucoes.filter((e) => e.exercicioSlug === slug);
      const faixa = faixaPorSlug.get(slug) ?? { min: 8, max: 12 };
      return { slug, ajuste: ajustarCarga(execs, faixa) };
    })
    .filter((s) => s.ajuste.acao !== "sem-dado");

  const recentes = [...execucoes].sort((a, b) => b.concluidoEm - a.concluidoEm).slice(0, 8);

  return (
    <Card className="p-5">
      <h3 className="mb-1 flex items-center gap-2 font-display text-lg font-bold text-ink">
        <Activity className="h-5 w-5 text-primary" /> Execução do aluno
      </h3>
      <p className="mb-4 text-sm text-ink-2">Sugestões de ajuste pela execução real. Você decide; a proposta é apoio.</p>

      {sugestoes.length > 0 && (
        <div className="mb-4 space-y-2">
          {sugestoes.map(({ slug, ajuste }) => {
            const meta = ACAO_META[ajuste.acao];
            return (
              <div key={slug} className="rounded-xl border border-border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-ink">{nomeEx(slug)}</span>
                  <Pill tone={meta.tone}>
                    <meta.Icon className="h-3.5 w-3.5" />
                    {meta.label}
                    {ajuste.proximaCarga != null && ajuste.acao !== "manter" ? `: ${ajuste.proximaCarga} kg` : ""}
                  </Pill>
                </div>
                <p className="mt-1 text-xs text-ink-2">{ajuste.motivo}</p>
              </div>
            );
          })}
        </div>
      )}

      <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-3">Últimos registros</div>
      <div className="mt-1.5 space-y-1">
        {recentes.map((e) => (
          <div key={e.id} className="flex items-center justify-between gap-2 rounded-lg bg-surface-soft px-3 py-2 text-sm">
            <span className="min-w-0 flex-1 truncate text-ink">{nomeEx(e.exercicioSlug)}</span>
            <span className="shrink-0 text-ink-2">
              {e.cargaFeita != null ? `${e.cargaFeita} kg` : ""}
              {e.repsFeitas != null ? ` x ${e.repsFeitas}` : ""}
              {e.rpe != null ? ` · RPE ${e.rpe}` : ""}
            </span>
            <span className="shrink-0 text-xs text-ink-3">{fmtData(e.concluidoEm)}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
