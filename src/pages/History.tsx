import { Link } from "react-router-dom";
import { History as HistoryIcon, Flame, Trophy, Target, Star, Clock } from "lucide-react";
import { Card, Pill, SectionHeader } from "@/components/ui/primitives";
import { useProgress, useFavorites, nivelDoXp } from "@/lib/store";
import { cases } from "@/data/cases";

function fmtData(ts: number) {
  const d = new Date(ts);
  const dia = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(d);
  const hora = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(d);
  return `${dia}, ${hora}`;
}

export function History() {
  const { xp, streak, activities, casosResolvidos } = useProgress();
  const favs = useFavorites((s) => s.slugs);
  const nivel = nivelDoXp(xp);
  const resolvidos = cases.filter((c) => casosResolvidos.includes(c.id));

  const stats = [
    { icon: <Trophy className="h-4 w-4 text-primary" />, value: `Nível ${nivel}`, label: `${xp} XP` },
    { icon: <Flame className="h-4 w-4 text-cta" />, value: `${streak}`, label: "dias seguidos" },
    { icon: <Target className="h-4 w-4 text-analysis" />, value: `${casosResolvidos.length}`, label: "casos resolvidos" },
    { icon: <Star className="h-4 w-4 text-warning" />, value: `${favs.length}`, label: "favoritos" },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <SectionHeader
        eyebrow="Seu percurso"
        icon={<HistoryIcon className="h-3 w-3" />}
        title="Histórico"
        subtitle="O que você já estudou, decidiu e resolveu na plataforma."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4 text-center">
            <div className="flex items-center justify-center">{s.icon}</div>
            <div className="tabular mt-1 font-display text-lg font-bold text-ink">{s.value}</div>
            <div className="text-xs text-ink-3">{s.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-ink-2" />
            <h3 className="font-display text-lg font-bold text-ink">Atividades recentes</h3>
          </div>
          <ul className="space-y-3">
            {activities.map((a) => (
              <li key={a.id} className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div>
                  <div className="text-sm text-ink">{a.label}</div>
                  <div className="tabular text-xs text-ink-3">{fmtData(a.ts)}</div>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 font-display text-lg font-bold text-ink">Casos resolvidos</h3>
          {resolvidos.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-5 text-center">
              <p className="text-sm text-ink-2">Você ainda não resolveu nenhum caso.</p>
              <Link
                to="/cases"
                className="mt-3 inline-flex text-sm font-semibold text-primary hover:underline"
              >
                Resolver o primeiro caso →
              </Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {resolvidos.map((c) => (
                <li key={c.id}>
                  <Link
                    to={`/cases/${c.slug}`}
                    className="flex items-center justify-between rounded-xl border border-border p-3 hover:bg-surface-soft"
                  >
                    <span className="text-sm font-medium text-ink">{c.titulo}</span>
                    <Pill tone="success">Resolvido</Pill>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <p className="pt-2 text-xs text-ink-3">
        Conteúdo educacional — não substitui avaliação profissional individualizada.
      </p>
    </div>
  );
}
