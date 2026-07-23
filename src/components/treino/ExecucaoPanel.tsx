import { TrendingUp, TrendingDown, Minus, Activity, MessageSquareQuote } from "lucide-react";
import { Card, Pill, LinhaDeDose, LinhaDeTokens, TokenRotulado } from "@/components/ui/primitives";
import { SemanaStrip } from "@/components/student/SemanaStrip";
import { exercises } from "@/data/exercises";
import type { PlanoTreino } from "@/data/periodizacao";
import type { Execucao, SessaoFeedback } from "@/data/execucao";
import type { Liberacao } from "@/data/alunos";
import { ajustarCarga, faixaDeReps, type AcaoCarga } from "@/lib/gps/autorregulacao";
import { rotuloFaixaPse, bandaPse, TINT_PSE } from "@/lib/pse";
import { cn } from "@/lib/utils";

const nomeEx = (slug?: string) => (slug ? exercises.find((e) => e.slug === slug)?.nome ?? slug : "Exercício");
const fmtData = (ts: number) => new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(ts));

const ACAO_META: Record<AcaoCarga, { label: string; tone: "success" | "warning" | "neutral"; Icon: typeof TrendingUp }> = {
  subir: { label: "Progredir", tone: "success", Icon: TrendingUp },
  descarregar: { label: "Descarregar", tone: "warning", Icon: TrendingDown },
  manter: { label: "Manter", tone: "neutral", Icon: Minus },
  "sem-dado": { label: "Sem dado", tone: "neutral", Icon: Minus },
};

/**
 * Selo do PSE da sessão: número + rótulo da faixa (ex.: "7 · Intenso"), com o par
 * tint + texto da mesma família (AA garantido, padrão da onda C). Reusado no resumo
 * do último feedback na aba "App do aluno".
 */
export function PseBadge({ pse, className }: { pse: number; className?: string }) {
  const { familia } = bandaPse(pse);
  const { rotulo } = rotuloFaixaPse(pse);
  return (
    <span className={cn("inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-bold", TINT_PSE[familia], className)}>
      {pse}
      {rotulo && <span className="ml-1 font-semibold">· {rotulo}</span>}
    </span>
  );
}

/** Nome da sessão por id (para resolver "Semana N · Sessão X" a partir do plano). */
function mapaSessoes(plano?: PlanoTreino): Map<string, string> {
  const m = new Map<string, string>();
  plano?.macrociclo.mesociclos
    .flatMap((mc) => mc.microciclos)
    .flatMap((mic) => mic.sessoes)
    .forEach((s) => {
      if (!m.has(s.id)) m.set(s.id, s.nome);
    });
  return m;
}

/**
 * Painel do profissional: como o aluno SENTIU a sessão (o recado é o item mais
 * valioso, então vem primeiro), a aderência da semana (mesma faixa do app do aluno,
 * em modo compacto e na cor do tema do profissional) e a SUGESTÃO de ajuste da
 * autorregulação por exercício. É apoio, não automatismo: o profissional lê a
 * proposta (com a justificativa) e decide. A camada de segurança do plano
 * (Semáforo, restrições) continua no caminho.
 */
export function ExecucaoPanel({
  plano,
  execucoes,
  sessaoFeedbacks,
  liberacoes,
  alunoId,
}: {
  plano?: PlanoTreino;
  execucoes: Execucao[];
  sessaoFeedbacks: SessaoFeedback[];
  liberacoes: Liberacao[];
  alunoId: string;
}) {
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
  const feedbacks = [...sessaoFeedbacks].sort((a, b) => b.concluidaEm - a.concluidaEm).slice(0, 5);
  const nomePorSessao = mapaSessoes(plano);

  return (
    <Card className="p-5">
      <h3 className="mb-1 flex items-center gap-2 font-display text-lg font-bold text-ink">
        <Activity className="h-5 w-5 text-primary" /> Execução do aluno
      </h3>
      <p className="mb-4 text-sm text-ink-2">
        O que o aluno registrou no app e como ele sentiu as sessões. As sugestões de ajuste são apoio; você decide.
      </p>

      {/* Aderência da semana: mesma faixa do app do aluno, em modo compacto e na cor do
          tema do profissional (tokens, não a marca do aluno). */}
      <div className="mb-4">
        <div className="mb-1.5 text-2xs font-semibold uppercase tracking-wide text-ink-3">Aderência da semana</div>
        <SemanaStrip alunoId={alunoId} execucoes={execucoes} liberacoes={liberacoes} cor="var(--primary)" compacto />
      </div>

      {/* Como o aluno sentiu: o recado é o item mais valioso; vem antes das sugestões. */}
      <div className="mb-4">
        <div className="mb-1.5 flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide text-ink-3">
          <MessageSquareQuote className="h-3.5 w-3.5" /> Como o aluno sentiu
        </div>
        {feedbacks.length === 0 ? (
          <p className="text-xs text-ink-3">
            O esforço e os recados do aluno aparecem aqui quando ele concluir sessões no app.
          </p>
        ) : (
          <ul className="space-y-2">
            {feedbacks.map((f) => {
              // Cor da faixa do PSE governa o acento da citação; sem PSE, borda neutra.
              const familia = f.pse != null ? bandaPse(f.pse).familia : null;
              const nomeSessao = nomePorSessao.get(f.sessaoRef);
              const contexto = `Semana ${f.semana}${nomeSessao ? ` · ${nomeSessao}` : ""}`;
              return (
                <li key={f.id} className="rounded-xl border border-border p-3">
                  {/* Data + contexto + PSE + duração colados, sem justify-between. */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="tabular text-xs font-semibold text-ink-2">{fmtData(f.concluidaEm)}</span>
                    <span className="text-xs text-ink-3">{contexto}</span>
                    {f.pse != null && <PseBadge pse={f.pse} />}
                    {f.duracaoMin != null && <TokenRotulado label="Duração" value={`${f.duracaoMin} min`} />}
                  </div>
                  {f.observacao && (
                    <blockquote
                      className={cn("mt-2 border-l-2 pl-3 text-sm text-ink", !familia && "border-border")}
                      style={familia ? { borderColor: `var(--${familia})` } : undefined}
                    >
                      {f.observacao}
                    </blockquote>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {sugestoes.length > 0 && (
        <div className="mb-4 space-y-2">
          {sugestoes.map(({ slug, ajuste }) => {
            const meta = ACAO_META[ajuste.acao];
            return (
              <div key={slug} className="rounded-xl border border-border p-3">
                {/* Sugestão colada ao exercício (sem justify-between abrindo vão). */}
                <div className="flex flex-wrap items-center gap-2">
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

      {recentes.length > 0 && (
        <>
          <div className="mb-1.5 text-2xs font-semibold uppercase tracking-wide text-ink-3">Últimos registros</div>
          {/* Nome + data no bloco; carga, reps e RPE viram tokens rotulados abaixo,
              cada número com o próprio nome, em vez de "40 kg x 12 · RPE 8" solto na borda. */}
          <ul className="overflow-hidden rounded-lg border border-border">
            {recentes.map((e) => (
              <LinhaDeDose
                key={e.id}
                nome={
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    {nomeEx(e.exercicioSlug)}
                    <span className="text-xs font-normal text-ink-3">{fmtData(e.concluidoEm)}</span>
                  </span>
                }
              >
                <LinhaDeTokens>
                  {e.cargaFeita != null && <TokenRotulado label="Carga" value={`${e.cargaFeita} kg`} />}
                  {e.repsFeitas != null && <TokenRotulado label="Reps" value={e.repsFeitas} />}
                  {e.rpe != null && <TokenRotulado label="RPE" value={e.rpe} />}
                </LinhaDeTokens>
              </LinhaDeDose>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}
