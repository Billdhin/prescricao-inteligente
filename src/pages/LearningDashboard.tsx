import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Navigation,
  FlaskConical,
  BookOpen,
  ArrowRight,
  Flame,
  Trophy,
  Target,
  Star,
  Crown,
  Sparkles,
  GitCompare,
  ClipboardList,
  TrendingUp,
  Route as RouteIcon,
  HeartPulse,
} from "lucide-react";
import { Card, Pill, ScoreRing, Progress, buttonClasses } from "@/components/ui/primitives";
import { Accordion } from "@/components/ui/disclosure";
import {
  useUser,
  useProgress,
  useFavorites,
  isPremiumUnlocked,
  nivelDoXp,
  XP_POR_NIVEL,
  planLabel,
} from "@/lib/store";
import { cases } from "@/data/cases";
import { tracks } from "@/data/tracks";
import { cn } from "@/lib/utils";

export function LearningDashboard() {
  const { name, plan } = useUser();
  const { xp, streak, casosResolvidos } = useProgress();
  const favSlugs = useFavorites((s) => s.slugs);

  const premium = isPremiumUnlocked(plan);
  const firstName = name.split(" ")[0];
  const nivel = nivelDoXp(xp);
  const noNivel = xp % XP_POR_NIVEL;
  const ringPct = Math.round((noNivel / XP_POR_NIVEL) * 100);
  const faltam = XP_POR_NIVEL - noNivel;

  const trilhasConcluidas = tracks.filter((t) => t.concluidas >= t.lessons.length).length;
  const emAndamento = tracks.filter((t) => t.concluidas > 0 && t.concluidas < t.lessons.length);
  const continuar = emAndamento.length ? emAndamento : tracks.slice(0, 1);
  const recCaso = cases.find((c) => !casosResolvidos.includes(c.id)) ?? cases[0];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* -------------------------------- Header ------------------------------- */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Pill tone="primary" icon={<Sparkles className="h-3 w-3" />} className="mb-3">
            {planLabel[plan]} · Aprender
          </Pill>
          <h1 className="font-display text-3xl font-bold text-ink md:text-4xl">Olá, {firstName}</h1>
          <p className="mt-2 max-w-xl text-ink-2">
            Treine a decisão de hoje para prescrever com mais clareza amanhã.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm">
            <Flame className="h-4 w-4 text-cta" />
            <span className="font-semibold text-ink">{streak}</span>
            <span className="text-ink-3">·</span>
            <span className="font-semibold text-ink">Nível {nivel}</span>
          </span>
          <Link to="/gps" className={buttonClasses("primary")}>
            <Navigation className="h-4 w-4" /> Prescrever
          </Link>
        </div>
      </div>

      {/* ÂNCORA: Continue de onde parou (ou "Comece por aqui" p/ o novato) */}
      <Card variant="raised" className="p-5 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-ink">
            {casosResolvidos.length === 0 && streak === 0 ? "Comece por aqui" : "Continue de onde parou"}
          </h2>
          <Link to="/tracks" className="text-sm font-semibold text-primary hover:underline">
            Ver trilhas
          </Link>
        </div>

        <div className="space-y-3">
          {continuar.map((t) => {
            const pct = Math.round((t.concluidas / t.lessons.length) * 100);
            const iniciada = t.concluidas > 0;
            return (
              <Link
                key={t.id}
                to={`/tracks/${t.slug}`}
                className="block rounded-xl border border-border bg-surface p-3.5 transition-colors hover:bg-surface-soft"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-tint text-primary">
                    <RouteIcon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-semibold text-ink">{t.nome}</span>
                      <span className="tabular shrink-0 text-sm text-ink-2">
                        {t.concluidas}/{t.lessons.length}
                      </span>
                    </div>
                    <p className="truncate text-sm text-ink-3">{t.descricao}</p>
                  </div>
                  <span className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-primary sm:inline-flex">
                    {iniciada ? "Retomar" : "Começar"} <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-2.5">
                  <Progress value={pct} />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Recomendado: próximo caso p/ treinar julgamento */}
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-dashed border-border p-3.5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#fff1e6] text-[color:var(--cta-text)]">
            <BookOpen className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-3">
              Recomendado para você
            </div>
            <div className="truncate font-semibold text-ink">{recCaso.titulo}</div>
            <div className="truncate text-sm text-ink-3">
              Caso prático · {recCaso.tema} · {recCaso.dificuldade}
            </div>
          </div>
          <Link to={`/cases/${recCaso.slug}`} className={cn(buttonClasses("secondary", "sm"), "shrink-0")}>
            Resolver
          </Link>
        </div>
      </Card>

      {/* Progresso — detalhe sob demanda */}
      <Accordion
        items={[
          {
            id: "progresso",
            title: "Ver meu progresso",
            content: (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-4">
                  <ScoreRing value={ringPct} size={88} label={`Nível ${nivel}`} />
                  <div className="min-w-0">
                    <div className="tabular font-display text-2xl font-bold text-ink">{xp} XP</div>
                    <div className="text-sm text-ink-2">Faltam {faltam} XP para o nível {nivel + 1}</div>
                  </div>
                </div>
                <div className="grid flex-1 grid-cols-2 gap-2.5 sm:grid-cols-4">
                  <StatTile icon={<Flame className="h-4 w-4 text-cta" />} value={`${streak}`} label="dias seguidos" />
                  <StatTile icon={<Target className="h-4 w-4 text-analysis" />} value={`${casosResolvidos.length}`} label="casos resolvidos" />
                  <StatTile icon={<Trophy className="h-4 w-4 text-primary" />} value={`${trilhasConcluidas}/${tracks.length}`} label="trilhas" />
                  <StatTile icon={<Star className="h-4 w-4 text-warning" />} value={`${favSlugs.length}`} label="favoritos" />
                </div>
              </div>
            ),
          },
        ]}
      />

      {/* --------------------------- Explore os módulos ------------------------ */}
      <section>
        <div className="mb-3">
          <h2 className="font-display text-base font-bold text-ink">Explore os módulos</h2>
          <p className="text-sm text-ink-3">Decidir, ver e treinar.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <ModuleCard
            to="/gps"
            icon={<Navigation className="h-5 w-5" />}
            tone="primary"
            title="GPS da Prescrição"
            desc="Responda ao perfil e receba variações ranqueadas, com justificativa por critério."
            cta="Abrir GPS"
          />
          <ModuleCard
            to="/movement-lab"
            icon={<FlaskConical className="h-5 w-5" />}
            tone="analysis"
            title="Laboratório Visual"
            desc="Compare execução × análise biomecânica e explore hotspots sobre a foto real."
            cta="Explorar Laboratório"
          />
          <ModuleCard
            to="/cases"
            icon={<BookOpen className="h-5 w-5" />}
            tone="cta"
            title="Casos práticos"
            desc="Decida em cenários reais e receba feedback do raciocínio — não só certo ou errado."
            cta="Treinar julgamento"
          />
        </div>
      </section>

      {/* Grupos Especiais (educacional) */}
      <Link
        to="/special-groups"
        className="flex flex-wrap items-center gap-4 rounded-card border border-border bg-surface p-5 shadow-soft transition-colors hover:bg-surface-soft"
      >
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#e0f7f9] text-analysis">
          <HeartPulse className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-bold text-ink">Grupos Especiais e Modalidades</h3>
          <p className="text-sm text-ink-2">
            Aprenda a conduzir diferentes perfis — obesidade, hipertensão, idosos, dor — por
            modalidades, parâmetros e fases de progressão.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
          Explorar <ArrowRight className="h-4 w-4" />
        </span>
      </Link>

      {/* Área do Profissional (compacto) */}
      <LearnProTools premium={premium} />

      <p className="pt-2 text-xs text-ink-3">
        Conteúdo educacional — não substitui avaliação profissional individualizada nem prescrição
        clínica.
      </p>
    </div>
  );
}

/* ------------------------------- Auxiliares ------------------------------- */

function StatTile({ icon, value, label }: { icon?: ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-soft p-2.5">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="tabular text-lg font-bold text-ink">{value}</span>
      </div>
      <div className="mt-0.5 text-[11px] leading-tight text-ink-3">{label}</div>
    </div>
  );
}

const moduleTones: Record<string, string> = {
  primary: "bg-primary-tint text-primary",
  analysis: "bg-[#e0f7f9] text-analysis",
  cta: "bg-[#fff1e6] text-[color:var(--cta-text)]",
};

function ModuleCard({
  to,
  icon,
  tone,
  title,
  desc,
  cta,
}: {
  to: string;
  icon: ReactNode;
  tone: "primary" | "analysis" | "cta";
  title: string;
  desc: string;
  cta: string;
}) {
  return (
    <Card className="flex flex-col p-5">
      <span className={cn("mb-3 grid h-11 w-11 place-items-center rounded-xl", moduleTones[tone])}>
        {icon}
      </span>
      <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
      <p className="mt-1 flex-1 text-sm text-ink-2">{desc}</p>
      <Link to={to} className={cn(buttonClasses("secondary", "sm"), "mt-4")}>
        {cta} <ArrowRight className="h-4 w-4" />
      </Link>
    </Card>
  );
}

function LearnProTools({ premium }: { premium: boolean }) {
  const tools = [
    { icon: GitCompare, label: "Comparador avançado", to: "/comparador" },
    { icon: ClipboardList, label: "Protocolos prontos", to: "/protocols" },
    { icon: TrendingUp, label: "Insights de evolução", to: "/assessments" },
  ];

  if (!premium) {
    return (
      <Card className="flex flex-wrap items-center gap-4 p-5">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-tint text-primary">
          <Crown className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-base font-bold text-ink">Área do Profissional</h2>
          <p className="text-sm text-ink-2">Comparador avançado, protocolos prontos e insights de evolução.</p>
        </div>
        <Link to="/pricing" className={buttonClasses("primary", "sm")}>
          <Crown className="h-4 w-4" /> Assinar
        </Link>
      </Card>
    );
  }

  return (
    <section>
      <h2 className="mb-3 font-display text-base font-bold text-ink">Área do Profissional</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {tools.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.to}
              to={t.to}
              className="flex items-center gap-3 rounded-card border border-border bg-surface p-4 transition-colors hover:bg-surface-soft"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-tint text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <span className="truncate text-sm font-semibold text-ink">{t.label}</span>
              <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-ink-3" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
