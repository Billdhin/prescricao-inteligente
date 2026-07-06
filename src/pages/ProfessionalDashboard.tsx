import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  UserPlus,
  Navigation,
  CalendarClock,
  ClipboardList,
  AlertTriangle,
  ArrowRight,
  Crown,
  Lock,
  GitCompare,
  TrendingUp,
  CheckCircle2,
  Activity,
  Dumbbell,
} from "lucide-react";
import { Card, Pill, Progress, buttonClasses } from "@/components/ui/primitives";
import { useUser, useAlunos, isPremiumUnlocked, planLabel } from "@/lib/store";
import { exercises } from "@/data/exercises";
import type { Aluno } from "@/data/alunos";
import { cn } from "@/lib/utils";

const DIA = 86_400_000;
const fmtData = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(ts));
const diasAte = (ts: number) => Math.round((ts - Date.now()) / DIA);

export function ProfessionalDashboard() {
  const { name, plan } = useUser();
  const { alunos, avaliacoes, prescricoes } = useAlunos();
  const premium = isPremiumUnlocked(plan);
  const firstName = name.split(" ")[0];

  const ativos = alunos.filter((a) => a.status === "ativo");
  const avaliacoesMes = avaliacoes.filter((a) => Date.now() - a.data <= 30 * DIA).length;
  const prescricoesAtivas = prescricoes.filter((p) => p.status === "ativa");
  const temPrescricaoAtiva = (id: string) =>
    prescricoes.some((p) => p.alunoId === id && p.status === "ativa");

  const atencao = ativos
    .map((a) => {
      const motivos: { label: string; tone: "warning" | "cta" }[] = [];
      if (a.proximaReavaliacaoEm && a.proximaReavaliacaoEm < Date.now())
        motivos.push({ label: "Reavaliação vencida", tone: "warning" });
      if (!temPrescricaoAtiva(a.id))
        motivos.push({ label: "Sem prescrição ativa", tone: "cta" });
      return { aluno: a, motivos };
    })
    .filter((x) => x.motivos.length > 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Pill tone="primary" icon={<Users className="h-3 w-3" />} className="mb-3">
            {planLabel[plan]} · Atendimento
          </Pill>
          <h1 className="font-display text-3xl font-bold text-ink md:text-4xl">Olá, {firstName}</h1>
          <p className="mt-2 max-w-xl text-ink-2">
            Seu painel de trabalho: acompanhe os alunos, o que precisa de atenção e prescreva com
            justificativa.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/alunos?novo=1" className={buttonClasses("secondary")}>
            <UserPlus className="h-4 w-4" /> Novo aluno
          </Link>
          <Link to="/gps" className={buttonClasses("primary")}>
            <Navigation className="h-4 w-4" /> Nova prescrição
          </Link>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <ResumoTile icon={<Users className="h-4 w-4 text-primary" />} value={`${ativos.length}`} label="alunos ativos" to="/alunos" />
        <ResumoTile icon={<Activity className="h-4 w-4 text-analysis" />} value={`${avaliacoesMes}`} label="avaliações (30d)" to="/assessments" />
        <ResumoTile icon={<Dumbbell className="h-4 w-4 text-success" />} value={`${prescricoesAtivas.length}`} label="prescrições ativas" to="/protocols" />
        <ResumoTile
          icon={<CalendarClock className="h-4 w-4 text-cta" />}
          value={`${atencao.filter((x) => x.motivos.some((m) => m.label.includes("Reavaliação"))).length}`}
          label="reavaliações pendentes"
          to="/assessments"
        />
      </div>

      {/* Precisam de atenção + Seus alunos */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 md:p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#fef4e2] text-warning">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <h2 className="font-display text-lg font-bold text-ink">Precisam de atenção</h2>
          </div>
          {atencao.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <CheckCircle2 className="h-6 w-6 text-success" />
              <p className="text-sm text-ink-2">Tudo em dia com seus alunos ativos.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {atencao.map(({ aluno, motivos }) => (
                <Link
                  key={aluno.id}
                  to={`/alunos/${aluno.id}`}
                  className="block rounded-xl border border-border p-3 transition-colors hover:bg-surface-soft"
                >
                  <div className="flex items-center gap-3">
                    <Avatar iniciais={aluno.iniciais} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-ink">{aluno.nome}</div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {motivos.map((m) => (
                          <Pill key={m.label} tone={m.tone}>
                            {m.label}
                          </Pill>
                        ))}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-ink-3" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5 md:p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink">Seus alunos</h2>
            <Link to="/alunos" className="text-sm font-semibold text-primary hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {ativos.slice(0, 4).map((a) => (
              <AlunoCard key={a.id} aluno={a} temPrescricao={temPrescricaoAtiva(a.id)} />
            ))}
          </div>
        </Card>
      </div>

      {/* Área do Profissional (premium) */}
      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <Pill tone="cta" icon={<Crown className="h-3 w-3" />} className="mb-2">
              Exclusivo Profissional
            </Pill>
            <h2 className="font-display text-xl font-bold text-ink">Ferramentas avançadas</h2>
            <p className="mt-1 text-ink-2">Comparar variações, reaproveitar protocolos e ver a evolução da carteira.</p>
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
            <PremiumCard icon={<GitCompare className="h-4 w-4" />} tone="primary" title="Comparador avançado" sub="Ranqueie variações por eficiência" to="/gps">
              <div className="space-y-2.5">
                {["agachamento-livre", "leg-press-45", "cadeira-extensora"]
                  .map((s) => exercises.find((e) => e.slug === s))
                  .filter(Boolean)
                  .map((e) => (
                    <div key={e!.slug}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="truncate font-medium text-ink">{e!.nome}</span>
                        <span className="tabular shrink-0 pl-2 font-semibold text-primary">{e!.indiceEficiencia.score}</span>
                      </div>
                      <Progress value={e!.indiceEficiencia.score} />
                    </div>
                  ))}
              </div>
            </PremiumCard>

            <PremiumCard icon={<ClipboardList className="h-4 w-4" />} tone="analysis" title="Protocolos prontos" sub="Modelos por objetivo, aplicáveis a um aluno" to="/protocols">
              <ul className="space-y-2">
                {[
                  { t: "Hipertrofia de quadríceps", s: "4 exercícios · 8–12 reps" },
                  { t: "Retorno pós-lesão de joelho", s: "progressão em 3 fases" },
                  { t: "Força de cadeia posterior", s: "dobradiça + acessórios" },
                ].map((p) => (
                  <li key={p.t} className="flex items-center justify-between gap-2 rounded-xl border border-border p-2.5">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-ink">{p.t}</div>
                      <div className="truncate text-xs text-ink-3">{p.s}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-ink-3" />
                  </li>
                ))}
              </ul>
            </PremiumCard>

            <PremiumCard icon={<TrendingUp className="h-4 w-4" />} tone="success" title="Evolução da carteira" sub="Visão agregada dos seus alunos" to="/assessments">
              <div className="flex items-end gap-1.5" aria-hidden>
                {[3, 5, 4, 6, 5, 7, 6].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t bg-primary/80" style={{ height: `${h * 10}px` }} />
                ))}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <MiniTile value={`${ativos.length}`} label="alunos ativos" />
                <MiniTile value={`${avaliacoesMes}`} label="avaliações (30d)" />
              </div>
            </PremiumCard>
          </div>

          {!premium && (
            <div className="absolute inset-0 z-10 grid place-items-center p-4">
              <div className="max-w-sm rounded-card border border-border bg-surface/95 p-6 text-center shadow-elevated backdrop-blur">
                <span className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-full gradient-cta text-white">
                  <Lock className="h-5 w-5" />
                </span>
                <h3 className="font-display text-lg font-bold text-ink">Ferramentas do Profissional</h3>
                <p className="mt-1 text-sm text-ink-2">
                  Comparador avançado, protocolos prontos e evolução da carteira liberam com o plano
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
        Conteúdo educacional e de apoio à decisão — não substitui avaliação profissional
        individualizada nem prescrição clínica.
      </p>
    </div>
  );
}

/* ------------------------------- Auxiliares ------------------------------- */

function Avatar({ iniciais }: { iniciais: string }) {
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full gradient-brand text-sm font-bold text-white">
      {iniciais}
    </span>
  );
}

function ResumoTile({ icon, value, label, to }: { icon: ReactNode; value: string; label: string; to: string }) {
  return (
    <Link to={to} className="rounded-card border border-border bg-surface p-4 shadow-soft transition-colors hover:bg-surface-soft">
      <div className="flex items-center gap-2">
        {icon}
        <span className="tabular font-display text-2xl font-bold text-ink">{value}</span>
      </div>
      <div className="mt-0.5 text-sm text-ink-3">{label}</div>
    </Link>
  );
}

function MiniTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-soft p-2">
      <div className="tabular font-bold text-ink">{value}</div>
      <div className="text-[11px] text-ink-3">{label}</div>
    </div>
  );
}

function AlunoCard({ aluno, temPrescricao }: { aluno: Aluno; temPrescricao: boolean }) {
  const dias = aluno.proximaReavaliacaoEm ? diasAte(aluno.proximaReavaliacaoEm) : null;
  return (
    <Link to={`/alunos/${aluno.id}`} className="block rounded-xl border border-border p-3.5 transition-colors hover:bg-surface-soft">
      <div className="flex items-center gap-3">
        <Avatar iniciais={aluno.iniciais} />
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold text-ink">{aluno.nome}</div>
          <div className="truncate text-xs text-ink-3">
            {aluno.objetivo} · {aluno.nivel}
          </div>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-ink-3" />
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {aluno.restricoes.length > 0 ? (
          aluno.restricoes.map((r) => (
            <Pill key={r} tone="warning">
              {r}
            </Pill>
          ))
        ) : (
          <Pill tone="neutral">Sem restrição</Pill>
        )}
        {!temPrescricao && <Pill tone="cta">Sem prescrição</Pill>}
        {aluno.ultimaAvaliacaoEm && (
          <span className="ml-auto text-xs text-ink-3">
            aval. {fmtData(aluno.ultimaAvaliacaoEm)}
            {dias !== null && dias < 0 ? " · reavaliar" : ""}
          </span>
        )}
      </div>
    </Link>
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
  to,
  children,
}: {
  icon: ReactNode;
  tone: "primary" | "analysis" | "success";
  title: string;
  sub: string;
  to: string;
  children: ReactNode;
}) {
  return (
    <Card className="flex flex-col p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className={cn("grid h-9 w-9 place-items-center rounded-xl", premiumTones[tone])}>{icon}</span>
        <div className="min-w-0">
          <h3 className="truncate font-display font-bold text-ink">{title}</h3>
          <p className="truncate text-xs text-ink-3">{sub}</p>
        </div>
      </div>
      <div className="flex-1">{children}</div>
      <Link to={to} className={cn(buttonClasses("secondary", "sm"), "mt-4")}>
        Abrir <ArrowRight className="h-4 w-4" />
      </Link>
    </Card>
  );
}
