import * as React from "react";
import {
  Sparkles,
  Dumbbell,
  Trophy,
  CalendarCheck,
  CalendarRange,
  TrendingUp,
  Flame,
  Medal,
  Lock,
  Scale,
  Gauge,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { corDeContraste } from "@/lib/theme/palettes";
import { rotuloFaixaPse } from "@/lib/pse";
import type { Avaliacao } from "@/data/alunos";
import type { Execucao, SessaoFeedback } from "@/data/execucao";
import { resumoGamificacao } from "@/lib/gamificacao";

const ICONES: Record<string, LucideIcon> = {
  Sparkles,
  Dumbbell,
  Trophy,
  CalendarCheck,
  CalendarRange,
  TrendingUp,
  Flame,
};

/**
 * O PROGRESSO do aluno, na leitura do mockup: liga, sequência em dias, pontos,
 * o gráfico de treinos por semana, os dois números que ele acompanha (peso e
 * esforço médio) e as conquistas.
 *
 * Tudo derivado do que o próprio aluno registrou e do que o profissional mediu.
 * Não existe ponto inventado, sequência arredondada nem conquista fictícia: se
 * um dado não existe, o bloco correspondente simplesmente não aparece.
 */
export function GamificacaoView({
  alunoId,
  execucoes,
  cor,
  avaliacoes = [],
  feedbacks = [],
}: {
  alunoId: string;
  execucoes: Execucao[];
  cor: string;
  /** avaliações do aluno: alimentam o card de peso (medida do profissional) */
  avaliacoes?: Avaliacao[];
  /** feedbacks de sessão: alimentam o esforço médio (PSE que o aluno registrou) */
  feedbacks?: SessaoFeedback[];
}) {
  const r = React.useMemo(() => resumoGamificacao(alunoId, execucoes), [alunoId, execucoes]);
  const tinta = corDeContraste(cor);

  if (r.totalTreinos === 0) {
    return (
      <Card className="p-6 text-center">
        <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-card bg-surface-soft text-ink-2">
          <Medal className="h-5 w-5" />
        </span>
        <p className="text-sm text-ink-2">
          Comece o treino de hoje na aba <strong className="text-ink">Hoje</strong>. A partir do primeiro registro
          aparecem aqui a sua sequência e as suas conquistas.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Aderência do aluno: exercícios registrados e sequência em DIAS (contada
          de verdade). Pontos e liga saíram a pedido do Filipe: a proposta é
          registro clínico, não jogo. O que fica são números do próprio aluno. */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-card bg-surface-soft text-ink-2">
            <Medal className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-display text-lg font-bold text-ink">Seu histórico</div>
            <div className="text-xs text-ink-2">{r.totalTreinos} exercícios registrados</div>
          </div>
        </div>

        <div className="mt-4 rounded-card bg-surface-soft p-3">
          <div className="flex items-baseline gap-1.5">
            <span className="tabular font-display text-2xl font-bold text-ink">{r.sequencia.atual}</span>
            <span className="text-sm text-ink-2">{r.sequencia.atual === 1 ? "dia" : "dias"}</span>
            <Flame className="h-4 w-4 text-warning" aria-hidden />
          </div>
          <div className="text-2xs text-ink-2">de sequência · recorde: {r.sequencia.recorde}</div>
        </div>
      </Card>

      <GraficoSemanas dados={r.porSemana} cor={cor} />

      <div className="grid grid-cols-2 gap-3">
        <PesoCard avaliacoes={avaliacoes} cor={cor} />
        <EsforcoCard feedbacks={feedbacks} cor={cor} />
      </div>

      {/* Conquistas */}
      <Card className="p-4">
        <h3 className="mb-3 font-display text-base font-bold text-ink">Conquistas</h3>
        <div className="grid grid-cols-2 gap-2">
          {r.badges.map(({ badge, conquistada }) => {
            const Icon = ICONES[badge.icone] ?? Sparkles;
            return (
              <div
                key={badge.id}
                className="flex items-start gap-2.5 rounded-card border p-2.5"
                style={
                  conquistada
                    ? { borderColor: cor, background: "var(--surface)" }
                    : { borderColor: "var(--border)", background: "var(--surface-soft)" }
                }
              >
                <span
                  className={cn(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-control",
                    !conquistada && "bg-surface-mute text-ink-2",
                  )}
                  style={conquistada ? { background: cor, color: tinta } : undefined}
                >
                  {conquistada ? <Icon className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                </span>
                <div className="min-w-0">
                  <div className={`text-sm font-bold ${conquistada ? "text-ink" : "text-ink-2"}`}>{badge.nome}</div>
                  <div className="text-2xs leading-tight text-ink-2">{badge.descricao}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/**
 * Treinos por semana nas últimas 6 semanas. O eixo cresce até o maior valor
 * REAL (nunca uma escala inventada) e a semana sem treino aparece como traço
 * rente à base, não como buraco. A semana atual é a última e vem destacada.
 */
function GraficoSemanas({ dados, cor }: { dados: { rotulo: string; treinos: number }[]; cor: string }) {
  const max = Math.max(1, ...dados.map((d) => d.treinos));
  const total = dados.reduce((s, d) => s + d.treinos, 0);
  if (total === 0) return null;
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h3 className="font-display text-base font-bold text-ink">Treinos por semana</h3>
        <span className="text-2xs text-ink-2">últimas {dados.length}</span>
      </div>
      <div
        className="flex h-24 items-end gap-2"
        role="img"
        aria-label={dados.map((d, i) => `semana ${i + 1}: ${d.treinos} treinos`).join(", ")}
      >
        {dados.map((d, i) => {
          const atual = i === dados.length - 1;
          const alturaPct = Math.max(6, (d.treinos / max) * 100);
          return (
            <div key={d.rotulo} className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <span className="tabular text-2xs font-bold text-ink-2">{d.treinos}</span>
              <div
                aria-hidden
                className="w-full rounded-t-control"
                style={{ height: `${alturaPct}%`, background: atual ? cor : "var(--surface-mute)" }}
              />
              <span className="text-2xs text-ink-2">{d.rotulo}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/** Peso: a última medida do profissional e a diferença desde a primeira. Sem
 *  avaliação com peso, o card não aparece (não existe peso estimado). */
function PesoCard({ avaliacoes, cor }: { avaliacoes: Avaliacao[]; cor: string }) {
  const comPeso = avaliacoes.filter((a) => a.medidas.peso != null).sort((a, b) => a.data - b.data);
  if (comPeso.length === 0) return null;
  const ultimo = comPeso[comPeso.length - 1].medidas.peso as number;
  const primeiro = comPeso[0].medidas.peso as number;
  const delta = ultimo - primeiro;
  return (
    <Card className="p-3.5">
      <div className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wider text-ink-2">
        <Scale className="h-3.5 w-3.5" style={{ color: cor }} aria-hidden /> Peso
      </div>
      <div className="tabular mt-1 font-display text-xl font-bold text-ink">{ultimo.toLocaleString("pt-BR")} kg</div>
      {comPeso.length > 1 && (
        <div className="tabular text-2xs text-ink-2">
          {delta === 0
            ? "estável desde o início"
            : `${delta < 0 ? "menos" : "mais"} ${Math.abs(delta).toLocaleString("pt-BR")} kg desde o início`}
        </div>
      )}
    </Card>
  );
}

/** Esforço médio: a média dos PSE que o próprio aluno registrou ao fechar cada
 *  sessão, com o rótulo oficial da faixa. Sem feedback com PSE, não aparece. */
function EsforcoCard({ feedbacks, cor }: { feedbacks: SessaoFeedback[]; cor: string }) {
  const notas = feedbacks.map((f) => f.pse).filter((n): n is number => n != null);
  if (notas.length === 0) return null;
  const media = notas.reduce((s, n) => s + n, 0) / notas.length;
  const arredondada = Math.round(media);
  const faixa = rotuloFaixaPse(arredondada);
  return (
    <Card className="p-3.5">
      <div className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wider text-ink-2">
        <Gauge className="h-3.5 w-3.5" style={{ color: cor }} aria-hidden /> Esforço médio
      </div>
      <div className="tabular mt-1 font-display text-xl font-bold text-ink">{arredondada}</div>
      <div className="text-2xs text-ink-2">
        {faixa.rotulo || "de 0 a 10"} · {notas.length} {notas.length === 1 ? "treino" : "treinos"}
      </div>
    </Card>
  );
}
