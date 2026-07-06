import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Navigation,
  FlaskConical,
  ArrowRight,
  Flame,
  Trophy,
  Target,
  Crown,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  ShieldAlert,
  AlertTriangle,
  Repeat2,
  Lock,
  Box,
  TrendingUp,
  ClipboardList,
  GitCompare,
  BookOpen,
} from "lucide-react";
import { Card, Pill, ScoreRing, Progress, StatBar, buttonClasses } from "@/components/ui/primitives";
import { VisualCompareSlider } from "@/components/movement-lab/VisualCompareSlider";
import { AnalysisOverlay } from "@/components/movement-lab/AnalysisOverlay";
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
import { analysisOverlays } from "@/data/analysis-overlays";
import { withBase } from "@/lib/utils";
import { cn } from "@/lib/utils";

function qualitativo(score: number) {
  if (score >= 85) return "Excelente";
  if (score >= 75) return "Muito bom";
  if (score >= 60) return "Bom";
  if (score >= 45) return "Razoável";
  return "Limitado";
}

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

  const featured = exercises.find((e) => e.slug === "leg-press-45") ?? exercises[0];
  const overlay = analysisOverlays[featured.slug];
  const caso = cases[0];
  const comparaveis = ["agachamento-livre", "leg-press-45", "cadeira-extensora"]
    .map((s) => exercises.find((e) => e.slug === s))
    .filter(Boolean) as typeof exercises;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* -------------------------------- Header ------------------------------- */}
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
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone={premium ? "success" : "neutral"} icon={<Crown className="h-3 w-3" />}>
            {planLabel[plan]}
          </Pill>
          <Link to="/movement-lab" className={buttonClasses("secondary")}>
            Continuar estudo
          </Link>
          <Link to="/gps" className={buttonClasses("primary")}>
            <Navigation className="h-4 w-4" /> Nova prescrição
          </Link>
        </div>
      </div>

      {/* --------------------------------- Hero -------------------------------- */}
      <div className="grid gap-4 xl:grid-cols-3">
        {/* Laboratório Visual (slider) */}
        <Card className="p-4 shadow-elevated md:p-5 xl:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg font-bold text-ink md:text-xl">
                Laboratório Visual do Movimento
              </h2>
              <Pill tone="primary">{featured.nome}</Pill>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-control border border-border bg-surface px-3 py-1.5 text-sm font-semibold text-ink-3">
              <Box className="h-4 w-4" /> Ver em 3D
              <span className="rounded-full bg-cta/10 px-1.5 text-[10px] font-bold text-cta">
                em breve
              </span>
            </span>
          </div>

          <VisualCompareSlider
            initialPosition={52}
            before={
              featured.imagem ? (
                <img
                  src={withBase(featured.imagem)}
                  alt={`Execução: ${featured.nome}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-ink-3">Execução</div>
              )
            }
            after={
              featured.imagemAnalise ? (
                <div className="relative h-full w-full">
                  <img
                    src={withBase(featured.imagemAnalise)}
                    alt={`Análise: ${featured.nome}`}
                    className="h-full w-full object-cover"
                  />
                  {overlay && <AnalysisOverlay overlay={overlay} />}
                </div>
              ) : (
                <div className="grid h-full w-full place-items-center text-ink-3">Análise</div>
              )
            }
            hotspots={featured.hotspots}
          />

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <Legend swatch="bg-[#ef4444]" label="Músculo trabalhado" />
            <Legend swatch="bg-cta" label="Ângulo articular" />
            <Legend swatch="bg-primary" label="Linha de força" />
            <Link
              to={`/movement-lab/${featured.slug}`}
              className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              Abrir no Laboratório <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Card>

        {/* Índice de Eficiência */}
        <Card className="p-5 shadow-elevated md:p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-ink">Índice de Eficiência</h3>
            <Pill tone="analysis">do movimento</Pill>
          </div>
          <div className="mt-4 flex items-center gap-5">
            <ScoreRing value={featured.indiceEficiencia.score} size={104} />
            <div>
              <div className="text-xs uppercase tracking-wider text-ink-3">Avaliação geral</div>
              <div className="font-display text-xl font-bold text-ink">
                {qualitativo(featured.indiceEficiencia.score)}
              </div>
              <div className="text-xs text-ink-2">
                {featured.indiceEficiencia.score}/100 · {featured.grupoMuscular}
              </div>
            </div>
          </div>
          <div className="mt-5 space-y-2.5">
            {featured.indiceEficiencia.metrics.map((m) => (
              <StatBar
                key={m.nome}
                label={m.nome}
                value={m.valor}
                tone={m.tipo === "positivo" ? "primary" : "cta"}
              />
            ))}
          </div>
          <div className="mt-5 flex gap-3 rounded-xl bg-primary-tint p-3">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-sm text-ink">
              <span className="font-semibold">Resumo: </span>
              {featured.resumoPratico}
            </p>
          </div>
        </Card>
      </div>

      {/* ---------------------- Faixa de atalhos/mini-cards --------------------- */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* GPS */}
        <Card className="flex flex-col p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-display font-bold text-ink">GPS da Prescrição</h3>
            <Pill tone="primary" icon={<Sparkles className="h-3 w-3" />}>
              Assistente
            </Pill>
          </div>
          <p className="text-sm text-ink-2">Responda 5 perguntas e receba as melhores opções.</p>
          <div className="mt-3 rounded-xl border border-border p-3">
            <div className="flex items-center justify-between text-xs text-ink-3">
              <span>Melhor recomendação</span>
              <span className="rounded-full bg-success/10 px-1.5 font-bold text-success">82% match</span>
            </div>
            <div className="mt-1 font-semibold text-ink">{featured.nome}</div>
            <div className="text-xs text-ink-2">Ênfase: {featured.grupoMuscular}</div>
          </div>
          <Link to="/gps" className={cn(buttonClasses("primary", "sm"), "mt-3")}>
            Abrir GPS <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>

        {/* Caso prático */}
        <Card className="flex flex-col p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-display font-bold text-ink">Caso prático</h3>
            <Pill tone="cta">Desafio</Pill>
          </div>
          <p className="line-clamp-3 text-sm text-ink-2">{caso.contexto}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Pill tone="neutral">{caso.tema}</Pill>
            <Pill tone={caso.dificuldade === "Iniciante" ? "success" : "warning"}>
              {caso.dificuldade}
            </Pill>
          </div>
          <Link to={`/cases/${caso.slug}`} className={cn(buttonClasses("secondary", "sm"), "mt-auto pt-3")}>
            <BookOpen className="h-4 w-4" /> Resolver caso
          </Link>
        </Card>

        {/* Progresso */}
        <Card className="p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-display font-bold text-ink">Progresso</h3>
            <Pill tone="neutral">Este mês</Pill>
          </div>
          <div className="flex items-center gap-4">
            <ScoreRing value={ringPct} size={84} label={`Nível ${nivel}`} />
            <div className="space-y-1.5 text-sm">
              <Row icon={<Trophy className="h-4 w-4 text-primary" />} label="XP total" value={`${xp}`} />
              <Row icon={<Flame className="h-4 w-4 text-cta" />} label="Sequência" value={`${streak} d`} />
              <Row
                icon={<Target className="h-4 w-4 text-analysis" />}
                label="Casos"
                value={`${casosResolvidos.length}`}
              />
            </div>
          </div>
          <div className="mt-3 text-xs text-ink-3">Faltam {faltam} XP para o nível {nivel + 1}</div>
          <Link
            to="/history"
            className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            Ver meu progresso <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Card>

        {/* Comparador (mini) */}
        <Card className="flex flex-col p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-display font-bold text-ink">Comparador</h3>
            <Pill tone="analysis" icon={<GitCompare className="h-3 w-3" />}>
              vs
            </Pill>
          </div>
          <p className="text-sm text-ink-2">Confronte a eficiência entre variações.</p>
          <div className="mt-3 space-y-2">
            {comparaveis.slice(0, 2).map((e) => (
              <div key={e.slug}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="truncate font-medium text-ink">{e.nome}</span>
                  <span className="tabular shrink-0 pl-2 font-semibold text-ink">
                    {e.indiceEficiencia.score}
                  </span>
                </div>
                <Progress value={e.indiceEficiencia.score} />
              </div>
            ))}
          </div>
          <Link to="/gps" className={cn(buttonClasses("secondary", "sm"), "mt-auto pt-3")}>
            Comparar exercícios
          </Link>
        </Card>
      </div>

      {/* ------------------------------ 4 blocos ------------------------------- */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="font-display text-lg font-bold text-ink">Decisão em foco: {featured.nome}</h2>
          <Pill tone="neutral">guia rápido</Pill>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <BlockCard title="Quando usar" items={featured.blocos.quandoUsar} icon={<CheckCircle2 className="h-4 w-4" />} tone="success" />
          <BlockCard title="Quando evitar" items={featured.blocos.quandoEvitar} icon={<ShieldAlert className="h-4 w-4" />} tone="cta" />
          <BlockCard title="Erros comuns" items={featured.blocos.errosComuns} icon={<AlertTriangle className="h-4 w-4" />} tone="warning" />
          <BlockCard title="Variações" items={featured.blocos.variacoes} icon={<Repeat2 className="h-4 w-4" />} tone="primary" />
        </div>
      </div>

      {/* --------------------- Área do Profissional (premium) ------------------ */}
      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <Pill tone="cta" icon={<Crown className="h-3 w-3" />} className="mb-2">
              Exclusivo Profissional
            </Pill>
            <h2 className="font-display text-xl font-bold text-ink">Área do Profissional</h2>
            <p className="mt-1 text-ink-2">
              Recursos avançados para quem prescreve no dia a dia.
            </p>
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
            {/* Comparador avançado */}
            <Card className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-tint text-primary">
                  <GitCompare className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-display font-bold text-ink">Comparador avançado</h3>
                  <p className="text-xs text-ink-3">Ranqueie variações por eficiência</p>
                </div>
              </div>
              <div className="space-y-2.5">
                {comparaveis.map((e) => (
                  <div key={e.slug}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="truncate font-medium text-ink">{e.nome}</span>
                      <span className="tabular shrink-0 pl-2 font-semibold text-primary">
                        {e.indiceEficiencia.score}
                      </span>
                    </div>
                    <Progress value={e.indiceEficiencia.score} />
                  </div>
                ))}
              </div>
            </Card>

            {/* Protocolos prontos */}
            <Card className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e0f7f9] text-analysis">
                  <ClipboardList className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-display font-bold text-ink">Protocolos prontos</h3>
                  <p className="text-xs text-ink-3">Modelos editáveis por objetivo</p>
                </div>
              </div>
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
            </Card>

            {/* Insights de evolução */}
            <Card className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e7f8ed] text-success">
                  <TrendingUp className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-display font-bold text-ink">Insights de evolução</h3>
                  <p className="text-xs text-ink-3">Adesão e tendência de estudo</p>
                </div>
              </div>
              <div className="flex items-end gap-1.5">
                {[40, 55, 48, 70, 62, 85, 78].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-primary/80"
                    style={{ height: `${h}px` }}
                    title={`Dia ${i + 1}`}
                  />
                ))}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <Insight label="Adesão semanal" value="5/7 dias" />
                <Insight label="Sequência" value={`${streak} dias`} />
                <Insight label="Favoritos" value={`${favSlugs.length}`} />
                <Insight label="Casos resolvidos" value={`${casosResolvidos.length}`} />
              </div>
            </Card>
          </div>

          {!premium && (
            <div className="absolute inset-0 z-10 grid place-items-center p-4">
              <div className="max-w-sm rounded-card border border-border bg-surface/95 p-6 text-center shadow-elevated backdrop-blur">
                <span className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-full gradient-cta text-white">
                  <Lock className="h-5 w-5" />
                </span>
                <h3 className="font-display text-lg font-bold text-ink">Recursos do Profissional</h3>
                <p className="mt-1 text-sm text-ink-2">
                  Comparador avançado, protocolos prontos e insights de evolução liberam com o
                  plano Profissional.
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

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-ink-2">
      <span className={cn("h-2.5 w-2.5 rounded-full", swatch)} />
      {label}
    </span>
  );
}

function Row({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-ink-2">{label}</span>
      <span className="tabular ml-auto font-bold text-ink">{value}</span>
    </div>
  );
}

function Insight({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-soft p-2">
      <div className="text-[11px] text-ink-3">{label}</div>
      <div className="tabular font-bold text-ink">{value}</div>
    </div>
  );
}

const blockTones: Record<string, { pill: string; dot: string }> = {
  success: { pill: "bg-[#e7f8ed] text-success", dot: "bg-success" },
  cta: { pill: "bg-[#fff1e6] text-cta", dot: "bg-cta" },
  warning: { pill: "bg-[#fef4e2] text-warning", dot: "bg-warning" },
  primary: { pill: "bg-primary-tint text-primary", dot: "bg-primary" },
};

function BlockCard({
  title,
  items,
  icon,
  tone,
}: {
  title: string;
  items: string[];
  icon: ReactNode;
  tone: "success" | "cta" | "warning" | "primary";
}) {
  const t = blockTones[tone];
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className={cn("grid h-8 w-8 place-items-center rounded-lg", t.pill)}>{icon}</span>
        <h3 className="font-display font-bold text-ink">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it} className="flex gap-2 text-sm text-ink-2">
            <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", t.dot)} />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
