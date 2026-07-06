import { Link } from "react-router-dom";
import {
  Navigation,
  FlaskConical,
  ArrowRight,
  Flame,
  Trophy,
  Target,
  Star,
  Clock,
  Crown,
  Sparkles,
} from "lucide-react";
import { Card, Pill, ScoreRing, Progress, buttonClasses } from "@/components/ui/primitives";
import {
  useUser,
  useProgress,
  useFavorites,
  isPremiumUnlocked,
  nivelDoXp,
  XP_POR_NIVEL,
} from "@/lib/store";
import { tracks } from "@/data/tracks";
import { cases } from "@/data/cases";
import { exercises } from "@/data/exercises";

function fmtData(ts: number) {
  const d = new Date(ts);
  const dia = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(d);
  const hora = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(d);
  return `${dia}, ${hora}`;
}

export function Dashboard() {
  const { name, plan } = useUser();
  const { xp, streak, casosResolvidos, activities } = useProgress();
  const favSlugs = useFavorites((s) => s.slugs);

  const nivel = nivelDoXp(xp);
  const noNivel = xp % XP_POR_NIVEL;
  const faltam = XP_POR_NIVEL - noNivel;
  const ringPct = Math.round((noNivel / XP_POR_NIVEL) * 100);
  const trilhasConcluidas = tracks.filter((t) => t.concluidas >= t.lessons.length).length;
  const emAndamento = tracks.filter((t) => t.concluidas > 0 && t.concluidas < t.lessons.length);
  const favs = exercises.filter((e) => favSlugs.includes(e.slug));
  const firstName = name.split(" ")[0];
  const premium = isPremiumUnlocked(plan);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Pill tone="primary" icon={<Sparkles className="h-3 w-3" />} className="mb-3">
            Bem-vindo de volta
          </Pill>
          <h1 className="font-display text-3xl font-bold text-ink md:text-4xl">Olá, {firstName}</h1>
          <p className="mt-2 text-ink-2">
            Cada decisão treinada hoje é um raciocínio mais rápido amanhã.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/movement-lab" className={buttonClasses("secondary")}>
            Continuar estudo
          </Link>
          <Link to="/gps" className={buttonClasses("primary")}>
            <Navigation className="h-4 w-4" /> Nova prescrição
          </Link>
        </div>
      </div>

      {/* Progresso + trilhas */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex flex-wrap items-center gap-6">
            <ScoreRing value={ringPct} size={116} label={`Nível ${nivel}`} />
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-wider text-ink-3">
                Progresso
              </div>
              <div className="tabular font-display text-2xl font-bold text-ink">{xp} XP</div>
              <div className="text-sm text-ink-2">Faltam {faltam} XP para o nível {nivel + 1}</div>
              <div className="mt-3 flex gap-3">
                <MiniStat icon={<Flame className="h-4 w-4 text-cta" />} value={`${streak}`} label="dias" />
                <MiniStat
                  icon={<Trophy className="h-4 w-4 text-primary" />}
                  value={`${trilhasConcluidas}/${tracks.length}`}
                  label="trilhas"
                />
                <MiniStat
                  icon={<Target className="h-4 w-4 text-analysis" />}
                  value={`${casosResolvidos.length}`}
                  label="casos"
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-ink">Continue de onde parou</h3>
            <Pill tone="neutral">Trilhas</Pill>
          </div>
          <div className="space-y-4">
            {emAndamento.map((t) => (
              <div key={t.id}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-ink">{t.nome}</span>
                  <span className="tabular text-ink-2">
                    {t.concluidas}/{t.lessons.length}
                  </span>
                </div>
                <Progress value={(t.concluidas / t.lessons.length) * 100} />
              </div>
            ))}
            <Link
              to="/tracks"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              Ver todas as trilhas <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Atalhos */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link
          to="/gps"
          className="group flex items-center justify-between rounded-card gradient-brand p-6 text-white shadow-elevated"
        >
          <div>
            <h3 className="font-display text-xl font-bold">GPS da Prescrição</h3>
            <p className="mt-1 text-sm text-white/85">Responda 5 perguntas e receba recomendações justificadas.</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold">
              Abrir <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
          <Navigation className="h-10 w-10 shrink-0 opacity-80" />
        </Link>
        <Link
          to="/movement-lab"
          className="group flex items-center justify-between rounded-card gradient-cta p-6 text-white shadow-elevated"
        >
          <div>
            <h3 className="font-display text-xl font-bold">Laboratório Visual</h3>
            <p className="mt-1 text-sm text-white/90">Compare execução × análise e explore hotspots.</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold">
              Abrir <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
          <FlaskConical className="h-10 w-10 shrink-0 opacity-90" />
        </Link>
      </div>

      {/* Casos + favoritos */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-ink">Casos recomendados</h3>
              <p className="text-sm text-ink-2">Cenários para treinar julgamento clínico-esportivo.</p>
            </div>
            <Link to="/cases" className="text-sm font-semibold text-primary hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="space-y-3">
            {cases.slice(0, 3).map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium text-ink">{c.titulo}</div>
                  <div className="mt-1 flex gap-1.5">
                    <Pill tone="neutral">{c.tema}</Pill>
                    <Pill tone={c.dificuldade === "Iniciante" ? "success" : "warning"}>
                      {c.dificuldade}
                    </Pill>
                  </div>
                </div>
                <Link
                  to={`/cases/${c.slug}`}
                  className="shrink-0 text-sm font-semibold text-primary hover:underline"
                >
                  Resolver →
                </Link>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-ink">Exercícios favoritos</h3>
            <span className="inline-flex items-center gap-1 text-sm text-ink-2">
              <Star className="h-4 w-4" /> {favs.length}
            </span>
          </div>
          {favs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-5 text-center">
              <p className="text-sm text-ink-2">
                Nada favoritado ainda. Toque no coração no Laboratório para salvar exercícios de
                referência.
              </p>
              <Link
                to="/movement-lab"
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                Ir para o Laboratório <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {favs.map((e) => (
                <Link
                  key={e.slug}
                  to={`/movement-lab/${e.slug}`}
                  className="flex items-center justify-between rounded-xl border border-border p-3 hover:bg-surface-soft"
                >
                  <span className="font-medium text-ink">{e.nome}</span>
                  <ArrowRight className="h-4 w-4 text-ink-3" />
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Atividades + plano */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-ink">Últimas atividades</h3>
            <span className="inline-flex items-center gap-1 text-xs text-ink-3">
              <Clock className="h-3.5 w-3.5" /> Timeline
            </span>
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

        {premium ? (
          <Card className="p-6">
            <div className="mb-2 flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              <h3 className="font-display text-lg font-bold text-ink">Plano Profissional ativo</h3>
            </div>
            <p className="text-ink-2">
              Você tem acesso ilimitado ao GPS, aos casos avançados e a todos os exercícios do
              Laboratório Visual.
            </p>
            <Link to="/account" className={buttonClasses("secondary") + " mt-4"}>
              Gerenciar conta
            </Link>
          </Card>
        ) : (
          <Card className="overflow-hidden p-0">
            <div className="gradient-brand p-6 text-white">
              <div className="mb-2 flex items-center gap-2">
                <Crown className="h-5 w-5" />
                <h3 className="font-display text-lg font-bold">Desbloqueie tudo</h3>
              </div>
              <p className="text-sm text-white/85">
                GPS ilimitado, todos os casos, comparador e Laboratório Visual completo.
              </p>
              <Link
                to="/pricing"
                className="mt-4 inline-flex rounded-control bg-white px-4 py-2 text-sm font-semibold text-primary hover:bg-white/90"
              >
                Assinar Profissional
              </Link>
            </div>
          </Card>
        )}
      </div>

      <p className="pt-2 text-xs text-ink-3">
        Conteúdo educacional — não substitui avaliação profissional individualizada nem prescrição
        clínica.
      </p>
    </div>
  );
}

function MiniStat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-xl border border-border px-3 py-2 text-center">
      <div className="flex items-center justify-center">{icon}</div>
      <div className="tabular mt-0.5 text-sm font-bold text-ink">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-ink-3">{label}</div>
    </div>
  );
}
