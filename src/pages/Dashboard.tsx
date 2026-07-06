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
  Lock,
  GitCompare,
  ClipboardList,
  TrendingUp,
  CheckCircle2,
  Route as RouteIcon,
  PlayCircle,
} from "lucide-react";
import { Card, Pill, ScoreRing, Progress, buttonClasses } from "@/components/ui/primitives";
import {
  useUser,
  useProgress,
  useFavorites,
  isPremiumUnlocked,
  nivelDoXp,
  XP_POR_NIVEL,
  planLabel,
} from "@/lib/store";
import { exercises } from "@/data/exercises";
import { cases } from "@/data/cases";
import { tracks } from "@/data/tracks";
import { cn, withBase } from "@/lib/utils";

export function Dashboard() {
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

  const featured = exercises.find((e) => e.slug === "leg-press-45") ?? exercises[0];
  const recCaso = cases.find((c) => !casosResolvidos.includes(c.id)) ?? cases[0];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* -------------------------------- Header ------------------------------- */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Pill tone="primary" icon={<Sparkles className="h-3 w-3" />} className="mb-3">
            {planLabel[plan]}
          </Pill>
          <h1 className="font-display text-3xl font-bold text-ink md:text-4xl">Olá, {firstName}</h1>
          <p className="mt-2 max-w-xl text-ink-2">
            Treine a decisão de hoje para prescrever com mais clareza amanhã. Continue de onde parou
            ou comece uma nova análise.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/gps" className={buttonClasses("primary")}>
            <Navigation className="h-4 w-4" /> Nova prescrição
          </Link>
        </div>
      </div>

      {/* -------------------- Progresso + Continue de onde parou --------------- */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Seu progresso */}
        <Card className="p-5 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink">Seu progresso</h2>
            <Pill tone="neutral">Nível {nivel}</Pill>
          </div>
          <div className="flex items-center gap-4">
            <ScoreRing value={ringPct} size={96} label={`Nível ${nivel}`} />
            <div className="min-w-0">
              <div className="tabular font-display text-2xl font-bold text-ink">{xp} XP</div>
              <div className="text-sm text-ink-2">
                Faltam {faltam} XP para o nível {nivel + 1}
              </div>
              <div className="mt-2">
                <Progress value={ringPct} />
              </div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <StatTile icon={<Flame className="h-4 w-4 text-cta" />} value={`${streak}`} label="dias seguidos" />
            <StatTile icon={<Target className="h-4 w-4 text-analysis" />} value={`${casosResolvidos.length}`} label="casos resolvidos" />
            <StatTile icon={<Trophy className="h-4 w-4 text-primary" />} value={`${trilhasConcluidas}/${tracks.length}`} label="trilhas" />
            <StatTile icon={<Star className="h-4 w-4 text-warning" />} value={`${favSlugs.length}`} label="favoritos" />
          </div>
        </Card>

        {/* Continue de onde parou */}
        <Card className="p-5 md:p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink">Continue de onde parou</h2>
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
                  className="block rounded-xl border border-border p-3.5 transition-colors hover:bg-surface-soft"
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
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#fff1e6] text-cta">
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
      </div>

      {/* --------------------------- Explore os módulos ------------------------ */}
      <section>
        <div className="mb-3">
          <h2 className="font-display text-lg font-bold text-ink">Explore os módulos</h2>
          <p className="text-sm text-ink-2">As três frentes para decidir melhor: decidir, ver e treinar.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <ModuleCard
            to="/gps"
            icon={<Navigation className="h-5 w-5" />}
            tone="primary"
            title="GPS da Prescrição"
            desc="Responda 5 perguntas e receba variações ranqueadas, com justificativa por critério."
            footer={
              <div className="rounded-xl border border-border p-3">
                <div className="flex items-center justify-between text-xs text-ink-3">
                  <span>Exemplo de recomendação</span>
                  <span className="rounded-full bg-success/10 px-1.5 font-bold text-success">82% match</span>
                </div>
                <div className="mt-0.5 truncate font-semibold text-ink">{featured.nome}</div>
              </div>
            }
            cta="Abrir GPS"
          />
          <ModuleCard
            to={`/movement-lab/${featured.slug}`}
            icon={<FlaskConical className="h-5 w-5" />}
            tone="analysis"
            title="Laboratório Visual"
            desc="Compare execução × análise biomecânica e explore hotspots sobre a foto real."
            footer={
              <div className="flex items-center gap-3 rounded-xl border border-border p-2.5">
                {featured.imagem && (
                  <img
                    src={withBase(featured.imagem)}
                    alt=""
                    className="h-12 w-16 shrink-0 rounded-lg object-cover"
                  />
                )}
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-ink">{featured.nome}</div>
                  <div className="truncate text-xs text-ink-3">{featured.grupoMuscular}</div>
                </div>
              </div>
            }
            cta="Explorar Laboratório"
          />
          <ModuleCard
            to="/cases"
            icon={<BookOpen className="h-5 w-5" />}
            tone="cta"
            title="Casos práticos"
            desc="Decida em cenários reais e receba feedback do raciocínio — não só certo ou errado."
            footer={
              <div className="rounded-xl border border-border p-3">
                <div className="flex items-center gap-2">
                  <PlayCircle className="h-4 w-4 text-cta" />
                  <span className="truncate text-sm font-semibold text-ink">{recCaso.titulo}</span>
                </div>
                <div className="mt-0.5 truncate text-xs text-ink-3">{recCaso.tema} · {recCaso.dificuldade}</div>
              </div>
            }
            cta="Treinar julgamento"
          />
        </div>
      </section>

      {/* --------------------- Área do Profissional (premium) ------------------ */}
      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <Pill tone="cta" icon={<Crown className="h-3 w-3" />} className="mb-2">
              Exclusivo Profissional
            </Pill>
            <h2 className="font-display text-xl font-bold text-ink">Área do Profissional</h2>
            <p className="mt-1 text-ink-2">Recursos avançados para quem prescreve no dia a dia.</p>
          </div>
          {premium ? (
            <Pill tone="success" icon={<CheckCircle2 className="h-3 w-3" />}>
              Ativo no seu plano
            </Pill>
          ) : (
            <Link to="/pricing" className={buttonClasses("primary", "sm")}>
              <Crown className="h-4 w-4" /> Assinar Profissional
            </Link>
          )}
        </div>

        <div className="relative">
          <div
            className={cn(
              "grid gap-4 lg:grid-cols-3",
              !premium && "pointer-events-none select-none blur-[5px] saturate-50",
            )}
            aria-hidden={!premium}
          >
            <PremiumCard
              icon={<GitCompare className="h-4 w-4" />}
              tone="primary"
              title="Comparador avançado"
              sub="Ranqueie variações por eficiência"
            >
              <div className="space-y-2.5">
                {["agachamento-livre", "leg-press-45", "cadeira-extensora"]
                  .map((s) => exercises.find((e) => e.slug === s))
                  .filter(Boolean)
                  .map((e) => (
                    <div key={e!.slug}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="truncate font-medium text-ink">{e!.nome}</span>
                        <span className="tabular shrink-0 pl-2 font-semibold text-primary">
                          {e!.indiceEficiencia.score}
                        </span>
                      </div>
                      <Progress value={e!.indiceEficiencia.score} />
                    </div>
                  ))}
              </div>
            </PremiumCard>

            <PremiumCard
              icon={<ClipboardList className="h-4 w-4" />}
              tone="analysis"
              title="Protocolos prontos"
              sub="Modelos editáveis por objetivo"
            >
              <ul className="space-y-2">
                {[
                  { t: "Hipertrofia de quadríceps", s: "4 exercícios · 8–12 reps" },
                  { t: "Retorno pós-lesão de joelho", s: "progressão em 3 fases" },
                  { t: "Força de cadeia posterior", s: "dobradiça + acessórios" },
                ].map((p) => (
                  <li
                    key={p.t}
                    className="flex items-center justify-between gap-2 rounded-xl border border-border p-2.5"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-ink">{p.t}</div>
                      <div className="truncate text-xs text-ink-3">{p.s}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-ink-3" />
                  </li>
                ))}
              </ul>
            </PremiumCard>

            <PremiumCard
              icon={<TrendingUp className="h-4 w-4" />}
              tone="success"
              title="Insights de evolução"
              sub="Adesão e tendência de estudo"
            >
              <div className="flex items-end gap-1.5" aria-hidden>
                {[40, 55, 48, 70, 62, 85, 78].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t bg-primary/80" style={{ height: `${h}px` }} />
                ))}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <StatTile small value="5/7 dias" label="adesão semanal" />
                <StatTile small value={`${streak} dias`} label="sequência" />
              </div>
            </PremiumCard>
          </div>

          {!premium && (
            <div className="absolute inset-0 z-10 grid place-items-center p-4">
              <div className="max-w-sm rounded-card border border-border bg-surface/95 p-6 text-center shadow-elevated backdrop-blur">
                <span className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-full gradient-cta text-white">
                  <Lock className="h-5 w-5" />
                </span>
                <h3 className="font-display text-lg font-bold text-ink">Recursos do Profissional</h3>
                <p className="mt-1 text-sm text-ink-2">
                  Comparador avançado, protocolos prontos e insights de evolução liberam com o plano
                  Profissional.
                </p>
                <Link to="/pricing" className={cn(buttonClasses("primary"), "mt-4")}>
                  <Crown className="h-4 w-4" /> Assinar Profissional
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <p className="pt-2 text-xs text-ink-3">
        Conteúdo educacional — não substitui avaliação profissional individualizada nem prescrição
        clínica.
      </p>
    </div>
  );
}

/* ------------------------------- Auxiliares ------------------------------- */

function StatTile({
  icon,
  value,
  label,
  small,
}: {
  icon?: ReactNode;
  value: string;
  label: string;
  small?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-soft p-2.5">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className={cn("tabular font-bold text-ink", small ? "text-base" : "text-lg")}>{value}</span>
      </div>
      <div className="mt-0.5 text-[11px] leading-tight text-ink-3">{label}</div>
    </div>
  );
}

const moduleTones: Record<string, string> = {
  primary: "bg-primary-tint text-primary",
  analysis: "bg-[#e0f7f9] text-analysis",
  cta: "bg-[#fff1e6] text-cta",
};

function ModuleCard({
  to,
  icon,
  tone,
  title,
  desc,
  footer,
  cta,
}: {
  to: string;
  icon: ReactNode;
  tone: "primary" | "analysis" | "cta";
  title: string;
  desc: string;
  footer: ReactNode;
  cta: string;
}) {
  return (
    <Card className="flex flex-col p-5">
      <span className={cn("mb-3 grid h-11 w-11 place-items-center rounded-xl", moduleTones[tone])}>
        {icon}
      </span>
      <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
      <p className="mt-1 text-sm text-ink-2">{desc}</p>
      <div className="mt-3">{footer}</div>
      <Link to={to} className={cn(buttonClasses("secondary", "sm"), "mt-4")}>
        {cta} <ArrowRight className="h-4 w-4" />
      </Link>
    </Card>
  );
}

const premiumTones: Record<string, string> = {
  primary: "bg-primary-tint text-primary",
  analysis: "bg-[#e0f7f9] text-analysis",
  success: "bg-[#e7f8ed] text-success",
};

function PremiumCard({
  icon,
  tone,
  title,
  sub,
  children,
}: {
  icon: ReactNode;
  tone: "primary" | "analysis" | "success";
  title: string;
  sub: string;
  children: ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className={cn("grid h-9 w-9 place-items-center rounded-xl", premiumTones[tone])}>{icon}</span>
        <div className="min-w-0">
          <h3 className="truncate font-display font-bold text-ink">{title}</h3>
          <p className="truncate text-xs text-ink-3">{sub}</p>
        </div>
      </div>
      {children}
    </Card>
  );
}
