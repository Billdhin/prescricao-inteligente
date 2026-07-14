import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  UserPlus,
  Navigation,
  AlertTriangle,
  ArrowRight,
  Crown,
  GitCompare,
  TrendingUp,
  CheckCircle2,
  Activity,
  Dumbbell,
  ClipboardList,
  PartyPopper,
  X,
} from "lucide-react";
import { Card, Pill, buttonClasses } from "@/components/ui/primitives";
import { useUser, useAlunos, isPremiumUnlocked, planLabel } from "@/lib/store";
import { getAtivacao, marcarCelebrado, minutosPrimeiroCaso } from "@/lib/ativacao";
import type { Aluno } from "@/data/alunos";
import { cn } from "@/lib/utils";

const DIA = 86_400_000;
const fmtData = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(ts));
const diasAte = (ts: number) => Math.round((ts - Date.now()) / DIA);

export function ProfessionalDashboard() {
  const { name, plan } = useUser();
  const { alunos, avaliacoes, prescricoes, loadExamples } = useAlunos();
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
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Pill tone="primary" icon={<Users className="h-3 w-3" />} className="mb-3">
            {planLabel[plan]} · Atendimento
          </Pill>
          <h1 className="font-display text-3xl font-bold text-ink md:text-4xl">Olá, {firstName}</h1>
          <p className="mt-2 max-w-xl text-ink-2">
            Comece pelo que precisa de atenção e prescreva com justificativa.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/alunos?novo=1" className={buttonClasses("secondary")}>
            <UserPlus className="h-4 w-4" /> Cadastrar aluno
          </Link>
          <Link to="/gps" className={buttonClasses("primary")}>
            <Navigation className="h-4 w-4" /> Prescrever
          </Link>
        </div>
      </div>

      {alunos.length === 0 ? (
        <EmptyPro onExemplos={loadExamples} />
      ) : (
        <>
      {/* Passo a passo guiado (some sozinho quando o fluxo está dominado) */}
      <CelebracaoPrimeiroCaso />

      <ProximosPassos
        temAluno={alunos.length > 0}
        temAvaliacao={avaliacoes.length > 0}
        temPrescricao={prescricoes.length > 0}
        temEvolucao={avaliacoes.length >= 2}
        primeiroAlunoId={ativos[0]?.id ?? alunos[0]?.id}
      />

      {/* Faixa de contexto (apoio, de-enfatizada) */}
      <Card variant="soft" className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3">
        <StatInline icon={<Users className="h-4 w-4 text-primary" />} value={ativos.length} label="alunos ativos" to="/alunos" />
        <StatInline icon={<Activity className="h-4 w-4 text-analysis" />} value={avaliacoesMes} label="avaliações (30d)" to="/assessments" />
        <StatInline icon={<Dumbbell className="h-4 w-4 text-ink-3" />} value={prescricoesAtivas.length} label="prescrições ativas" to="/protocols" />
      </Card>

      {/* ÂNCORA: Precisam de atenção */}
      {atencao.length > 0 ? (
        <Card variant="raised" className="border-l-4 border-l-warning p-5 md:p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#fef4e2] text-warning">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-xl font-bold text-ink">Precisam de atenção</h2>
              <p className="text-sm text-ink-3">{atencao.length} aluno{atencao.length > 1 ? "s" : ""} com pendências</p>
            </div>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {atencao.map(({ aluno, motivos }) => (
              <Link
                key={aluno.id}
                to={`/alunos/${aluno.id}`}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 transition-colors hover:bg-surface-soft"
              >
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
              </Link>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="flex items-center gap-3 p-5">
          <CheckCircle2 className="h-6 w-6 shrink-0 text-success" />
          <p className="text-sm text-ink-2">
            <span className="font-semibold text-ink">Tudo em dia.</span> Nenhum aluno com reavaliação
            vencida ou sem prescrição ativa.
          </p>
        </Card>
      )}

      {/* Seus alunos (apoio) */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-ink">Seus alunos</h2>
          <Link to="/alunos" className="text-sm font-semibold text-primary hover:underline">
            Ver todos
          </Link>
        </div>
        {ativos.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 p-8 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-primary-tint text-primary">
              <UserPlus className="h-6 w-6" />
            </span>
            <p className="max-w-sm text-sm text-ink-2">
              Cadastre seu primeiro aluno para avaliar, prescrever com justificativa e acompanhar a
              evolução.
            </p>
            <Link to="/alunos?novo=1" className={buttonClasses("primary", "sm")}>
              <UserPlus className="h-4 w-4" /> Cadastrar aluno
            </Link>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {ativos.slice(0, 4).map((a) => (
              <AlunoCard key={a.id} aluno={a} temPrescricao={temPrescricaoAtiva(a.id)} />
            ))}
          </div>
        )}
      </section>
        </>
      )}

      {/* Ferramentas do Profissional (compacto, fora do fluxo principal) */}
      <ProTools premium={premium} />

      <p className="pt-2 text-xs text-ink-3">
        Conteúdo educacional e de apoio à decisão; não substitui avaliação profissional
        individualizada nem prescrição clínica.
      </p>
    </div>
  );
}

/* ------------------------------- Auxiliares ------------------------------- */

/* Checklist guiado do fluxo de trabalho: 4 passos com estado real. Some quando
   tudo está feito (o usuário "formou") ou quando o profissional oculta. */
/* Celebra a ativação (1x): o primeiro caso real resolvido — a métrica-mãe. */
function CelebracaoPrimeiroCaso() {
  const [visivel, setVisivel] = useState(() => {
    const a = getAtivacao();
    return !!a.primeiroSalvo && !a.celebrado;
  });
  if (!visivel) return null;
  const min = minutosPrimeiroCaso();
  const fechar = () => {
    marcarCelebrado();
    setVisivel(false);
  };
  return (
    <Card tone="success" className="flex flex-wrap items-center gap-3 p-4">
      <PartyPopper className="h-5 w-5 shrink-0 text-success" />
      <p className="min-w-0 flex-1 text-sm text-ink-2">
        <span className="font-semibold text-ink">
          Primeiro caso real resolvido{min ? ` em ${min} min` : ""}.
        </span>{" "}
        A decisão ficou documentada no prontuário do aluno; é assim que cada caso vira defesa
        técnica sua.
      </p>
      <button onClick={fechar} aria-label="Fechar" className="rounded-md p-2.5 text-ink-3 hover:bg-surface-soft">
        <X className="h-4 w-4" />
      </button>
    </Card>
  );
}

function ProximosPassos({
  temAluno,
  temAvaliacao,
  temPrescricao,
  temEvolucao,
  primeiroAlunoId,
}: {
  temAluno: boolean;
  temAvaliacao: boolean;
  temPrescricao: boolean;
  temEvolucao: boolean;
  primeiroAlunoId?: string;
}) {
  const [oculto, setOculto] = useState(
    () => typeof window !== "undefined" && localStorage.getItem("pi-passos-ocultos") === "1",
  );

  const passos = [
    { done: temAluno, label: "Cadastre um aluno", to: "/alunos?novo=1" },
    { done: temAvaliacao, label: "Registre uma avaliação", to: primeiroAlunoId ? `/alunos/${primeiroAlunoId}` : "/alunos" },
    { done: temPrescricao, label: "Prescreva com justificativa", to: primeiroAlunoId ? `/gps?aluno=${primeiroAlunoId}` : "/gps" },
    { done: temEvolucao, label: "Acompanhe a evolução", to: "/assessments" },
  ];
  const feitos = passos.filter((p) => p.done).length;
  const atualIdx = passos.findIndex((p) => !p.done);

  if (oculto || feitos === passos.length) return null;

  const ocultar = () => {
    localStorage.setItem("pi-passos-ocultos", "1");
    setOculto(true);
  };

  return (
    <Card className="p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h2 className="font-display text-base font-bold text-ink">Seu passo a passo</h2>
        <Pill tone="primary">{feitos} de {passos.length}</Pill>
        <button onClick={ocultar} className="ml-auto text-xs font-medium text-ink-3 hover:text-ink">
          Ocultar
        </button>
      </div>
      <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {passos.map((p, i) => {
          const atual = i === atualIdx;
          return (
            <li key={p.label}>
              <Link
                to={p.to}
                aria-current={atual ? "step" : undefined}
                className={cn(
                  "flex h-full items-center gap-2.5 rounded-xl border p-3 text-sm transition-colors",
                  p.done
                    ? "border-border bg-surface-soft text-ink-3"
                    : atual
                      ? "border-primary bg-primary-tint font-semibold text-ink hover:bg-primary-tint/70"
                      : "border-border bg-surface text-ink-2 hover:bg-surface-soft",
                )}
              >
                {p.done ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                ) : (
                  <span
                    className={cn(
                      "tabular grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold",
                      atual ? "bg-primary text-white" : "bg-surface-soft text-ink-3",
                    )}
                  >
                    {i + 1}
                  </span>
                )}
                <span className={cn(p.done && "line-through decoration-ink-3/50")}>{p.label}</span>
                {atual && <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-primary" />}
              </Link>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

function EmptyPro({ onExemplos }: { onExemplos: () => void }) {
  return (
    <Card variant="raised" className="flex flex-col items-center gap-4 p-8 text-center md:p-12">
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-primary-tint text-primary">
        <Navigation className="h-8 w-8" />
      </span>
      <div>
        <h2 className="font-display text-xl font-bold text-ink">Comece resolvendo um caso de verdade</h2>
        <p className="mx-auto mt-1 max-w-md text-ink-2">
          Pense num aluno que você tem agora, com hipertensão, diabetes, dor lombar ou idade
          avançada. Em poucos minutos você sai com a decisão documentada e o porquê de cada escolha.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Link to="/gps?primeiro-caso=1" className={buttonClasses("primary")}>
          <Navigation className="h-4 w-4" /> Resolver um caso agora
        </Link>
        <Link to="/alunos?novo=1" className={buttonClasses("secondary")}>
          <UserPlus className="h-4 w-4" /> Cadastrar um aluno
        </Link>
        <button onClick={onExemplos} className={buttonClasses("ghost")}>
          Carregar exemplos
        </button>
      </div>
    </Card>
  );
}

function Avatar({ iniciais }: { iniciais: string }) {
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full gradient-brand text-sm font-bold text-white">
      {iniciais}
    </span>
  );
}

function StatInline({ icon, value, label, to }: { icon: ReactNode; value: number; label: string; to: string }) {
  return (
    <Link to={to} className="inline-flex items-center gap-2 text-sm hover:text-ink">
      {icon}
      <span className="tabular font-display text-lg font-bold text-ink">{value}</span>
      <span className="text-ink-2">{label}</span>
    </Link>
  );
}

function AlunoCard({ aluno, temPrescricao }: { aluno: Aluno; temPrescricao: boolean }) {
  const dias = aluno.proximaReavaliacaoEm ? diasAte(aluno.proximaReavaliacaoEm) : null;
  // Teto de 1 pill de restrição (+N) para não competir com o flag acionável.
  const restr = aluno.restricoes;
  return (
    <Link to={`/alunos/${aluno.id}`} className="block rounded-xl border border-border bg-surface p-3.5 transition-colors hover:bg-surface-soft">
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
        {!temPrescricao && <Pill tone="cta">Sem prescrição</Pill>}
        {restr.length > 0 && <Pill tone="warning">{restr[0]}{restr.length > 1 ? ` +${restr.length - 1}` : ""}</Pill>}
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

function ProTools({ premium }: { premium: boolean }) {
  const tools = [
    { icon: GitCompare, label: "Comparador avançado", sub: "Ranqueie variações por eficiência", to: "/comparador" },
    { icon: ClipboardList, label: "Protocolos prontos", sub: "Modelos por objetivo", to: "/protocols" },
    { icon: TrendingUp, label: "Evolução dos alunos", sub: "Visão agregada da saúde e das medidas", to: "/assessments" },
  ];

  if (!premium) {
    return (
      <Card className="flex flex-wrap items-center gap-4 p-5">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-tint text-primary">
          <Crown className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-base font-bold text-ink">Ferramentas do Profissional</h2>
          <p className="text-sm text-ink-2">
            Comparador avançado, protocolos prontos e evolução dos alunos.
          </p>
        </div>
        <Link to="/pricing" className={buttonClasses("primary", "sm")}>
          <Crown className="h-4 w-4" /> Assinar
        </Link>
      </Card>
    );
  }

  return (
    <section>
      <h2 className="mb-3 font-display text-base font-bold text-ink">Ferramentas do Profissional</h2>
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
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-ink">{t.label}</div>
                <div className="truncate text-xs text-ink-3">{t.sub}</div>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-ink-3" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
