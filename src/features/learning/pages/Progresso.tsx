import * as React from "react";
import { Link } from "react-router-dom";
import { TrendingUp, BrainCircuit, Stethoscope, Compass, BookOpen, Clock, Target, Trophy, Flame } from "lucide-react";
import { Card, SectionHeader } from "@/components/ui/primitives";
import { getLearningRepository } from "../repository";
import { competencies } from "../mocks";
import { CompetencyBars, EmptyState } from "../components/shared";
import { useAprender } from "../store";
import { useProgress, nivelDoXp } from "@/lib/store";
import { disciplineStatFrom } from "../progress";

const repo = getLearningRepository();

const fmtRel = (ts: number) => {
  const min = Math.round((Date.now() - ts) / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  return `há ${Math.round(h / 24)} d`;
};

export function Progresso() {
  const lessons = useAprender((s) => s.lessons);
  const casesState = useAprender((s) => s.cases);
  const applications = useAprender((s) => s.applications);
  const history = useAprender((s) => s.history);
  // Gamificacao (antes vivia na tela "Historico", agora consolidada aqui).
  const { xp, streak } = useProgress();
  const nivel = nivelDoXp(xp);

  const disciplines = repo.getDisciplines();
  const iniciadas = disciplines.filter((d) => disciplineStatFrom(d, lessons).status !== "nao-iniciado" || d.progress > 0);
  const concluidas = disciplines.filter((d) => disciplineStatFrom(d, lessons).status === "concluido");
  const aulasConcluidas = Object.values(lessons).filter((l) => l.status === "concluido").length;
  const casosResolvidos = Object.values(casesState).filter((c) => c.status === "concluido").length;
  const decisoesTreinadas = Object.values(casesState).reduce((n, c) => n + Object.keys(c.choices ?? {}).length, 0);

  const metrics = [
    { label: "Disciplinas iniciadas", value: iniciadas.length, icon: <Compass className="h-4 w-4" /> },
    { label: "Disciplinas concluídas", value: concluidas.length, icon: <BookOpen className="h-4 w-4" /> },
    { label: "Conteúdos concluídos", value: aulasConcluidas, icon: <BrainCircuit className="h-4 w-4" /> },
    { label: "Casos resolvidos", value: casosResolvidos, icon: <Stethoscope className="h-4 w-4" /> },
    { label: "Decisões treinadas", value: decisoesTreinadas, icon: <Target className="h-4 w-4" /> },
    { label: "Aplicações no atendimento", value: applications.length, icon: <TrendingUp className="h-4 w-4" /> },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <SectionHeader
        eyebrow="Aprender"
        icon={<TrendingUp className="h-3 w-3" />}
        title="Meu progresso"
        subtitle="Seu desenvolvimento profissional: o que você já consegue fazer, não apenas quantos conteúdos concluiu."
      />

      {/* Nível e sequência (gamificação) */}
      <div className="grid grid-cols-2 gap-3 sm:max-w-md">
        <Card className="flex items-center gap-3 p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-tint text-primary">
            <Trophy className="h-4 w-4" />
          </span>
          <div>
            <div className="tabular font-display text-xl font-bold text-ink">Nível {nivel}</div>
            <div className="text-xs text-ink-3">{xp} XP acumulados</div>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface-soft text-cta">
            <Flame className="h-4 w-4" />
          </span>
          <div>
            <div className="tabular font-display text-xl font-bold text-ink">{streak}</div>
            <div className="text-xs text-ink-3">dias seguidos</div>
          </div>
        </Card>
      </div>

      {/* Métricas */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m) => (
          <Card key={m.label} className="flex items-center gap-3 p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-tint text-primary">{m.icon}</span>
            <div>
              <div className="tabular font-display text-2xl font-bold text-ink">{m.value}</div>
              <div className="text-xs text-ink-3">{m.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Competências */}
      <Card className="p-5 md:p-6">
        <h2 className="mb-4 font-display text-lg font-bold text-ink">Desenvolvimento por competências</h2>
        <CompetencyBars items={competencies} />
        <p className="mt-3 text-xs text-ink-3">
          As competências combinam conteúdos, casos e aplicações. Evoluem conforme você estuda e leva o raciocínio para o atendimento.
        </p>
      </Card>

      {/* Histórico */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-ink">
          <Clock className="h-5 w-5 text-ink-3" /> Histórico recente
        </h2>
        {history.length === 0 ? (
          <EmptyState
            icon={<Clock className="h-5 w-5" />}
            title="Sem histórico ainda"
            description="Conteúdos, disciplinas e casos que você abrir aparecem aqui."
            actionLabel="Começar a estudar"
            actionHref="/aprender/disciplinas"
          />
        ) : (
          <div className="space-y-2">
            {history.slice(0, 12).map((h) => (
              <Link key={h.id} to={h.href} className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-surface-soft">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-soft text-ink-2">
                  {h.type === "caso" ? <Stethoscope className="h-4 w-4" /> : h.type === "disciplina" ? <Compass className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
                </span>
                <span className="min-w-0 flex-1 truncate font-medium text-ink">{h.title}</span>
                <span className="shrink-0 text-xs text-ink-3">{fmtRel(h.ts)}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
