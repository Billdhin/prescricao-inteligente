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
  CalendarRange,
  CalendarCheck,
  Wallet,
  X,
} from "lucide-react";
import { Card, Pill, buttonClasses } from "@/components/ui/primitives";
import { EspinhaSelo } from "@/components/ui/EspinhaSelo";
import { RetencaoPanel } from "@/components/treino/RetencaoPanel";
import { useUser, useAlunos, isPremiumUnlocked, planLabel } from "@/lib/store";
import { rotuloRestricao } from "@/lib/gps/restricoes";
import { avisosDoAluno, type CicloCtx } from "@/lib/gps/proximoPasso";
import { alunosParaReativar } from "@/lib/retencao";
import { proximaReavaliacao } from "@/data/periodizacao";
import { statusEfetivo, formatBRL } from "@/data/cobranca";
import { getAtivacao, marcarCelebrado, minutosPrimeiroCaso } from "@/lib/ativacao";
import type { Aluno } from "@/data/alunos";
import { cn } from "@/lib/utils";

const DIA = 86_400_000;
const fmtData = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(ts));
const fmtHoje = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).format(new Date(ts));
const diasAte = (ts: number) => Math.round((ts - Date.now()) / DIA);

export function ProfessionalDashboard() {
  const { name, plan } = useUser();
  const { alunos, avaliacoes, prescricoes, planos, liberacoes, execucoes, loadExamples } = useAlunos();
  const premium = isPremiumUnlocked(plan);
  // Fallback quando o nome está vazio (o profissional pode limpar em Configurações):
  // "Olá" seco, sem a vírgula pendurada.
  const firstName = name.split(" ")[0];
  const saudacao = firstName ? `Olá, ${firstName}` : "Olá";

  const ativos = alunos.filter((a) => a.status === "ativo");
  const avaliacoesMes = avaliacoes.filter((a) => Date.now() - a.data <= 30 * DIA).length;
  const planosAtivos = planos.filter((p) => p.status === "ativo");
  // Predicado ÚNICO de "ter treino": o objeto canônico é o plano de treino (a
  // periodização). A prescrição avulsa é insumo, não o treino. Mesma definição
  // usada pela Linha do cuidado (proximoPasso.ts), acaba a discordância antiga.
  const temTreinoAtivo = (id: string) => planosAtivos.some((p) => p.alunoId === id);
  const comTreino = ativos.filter((a) => temTreinoAtivo(a.id)).length;

  // Quem precisa de atenção HOJE vem da MESMA fonte do stepper do aluno
  // (avisosDoAluno), não de uma cópia da lógica: Painel, lista e tela do aluno
  // falam o mesmo "próximo passo".
  const ctx: CicloCtx = { avaliacoes, prescricoes, planos, liberacoes, execucoes };
  const atencao = ativos
    .map((a) => ({ aluno: a, motivos: avisosDoAluno(a, ctx) }))
    .filter((x) => x.motivos.length > 0);

  // Deduplicação na CAMADA DE APRESENTAÇÃO (motor intocado): cada aluno aparece
  // uma vez, na sua pendência mais forte. Precedência: atenção > reativar > seus.
  const atencaoIds = new Set(atencao.map((x) => x.aluno.id));
  const alunosSemAtencao = alunos.filter((a) => !atencaoIds.has(a.id));
  const reativarIds = new Set(alunosParaReativar(alunosSemAtencao, execucoes).map((s) => s.aluno.id));
  const seusAlunos = ativos.filter((a) => !atencaoIds.has(a.id) && !reativarIds.has(a.id));

  // Ritual de segunda (parcial, sem backend): dois agregados deriváveis localmente.
  // Nada é inventado; se os dois forem zero, a linha some.
  const agora = Date.now();
  const diaSemana = (new Date(agora).getDay() + 6) % 7; // 0 = segunda-feira
  const inicioSemana = new Date(agora).setHours(0, 0, 0, 0) - diaSemana * DIA;
  const fimSemana = inicioSemana + 7 * DIA - 1;
  const reavaliamSemana = planosAtivos.filter((p) => {
    const r = proximaReavaliacao(p);
    return r != null && r.em >= inicioSemana && r.em <= fimSemana;
  }).length;
  const pendentesCentavos = alunos.reduce(
    (soma, a) => (a.cobranca && statusEfetivo(a.cobranca) === "pendente" ? soma + a.cobranca.valorCentavos : soma),
    0,
  );

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Pill tone="primary" icon={<CalendarRange className="h-3 w-3" />} className="mb-3 capitalize">
            Hoje · {fmtHoje(Date.now())}
          </Pill>
          <h1 className="font-display text-3xl font-bold text-ink md:text-4xl">{saudacao}</h1>
          <p className="mt-2 max-w-xl text-ink-2">
            Comece pelo que precisa de atenção e resolva o próximo passo de cada aluno.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/alunos?novo=1" className={buttonClasses("secondary")}>
            <UserPlus className="h-4 w-4" /> Cadastrar aluno
          </Link>
          <Link to="/gps" className={buttonClasses("primary")}>
            <Navigation className="h-4 w-4" /> Prescrever exercício
          </Link>
        </div>
      </div>

      {alunos.length === 0 ? (
        <EmptyPro onExemplos={loadExamples} />
      ) : (
        <>
      {/* Moldura única de boas-vindas: celebração do 1º caso + passo a passo,
          encabeçada pela espinha do cuidado; colapsa a uma linha quando termina. */}
      <MolduraBoasVindas
        temAluno={alunos.length > 0}
        temAvaliacao={avaliacoes.length > 0}
        temPrescricao={prescricoes.length > 0}
        temTreino={planos.length > 0}
        temEvolucao={avaliacoes.length >= 2}
        primeiroAlunoId={ativos[0]?.id ?? alunos[0]?.id}
      />

      {/* Faixa de contexto (apoio, de-enfatizada). Stats zerados são suprimidos:
          "0 avaliações (30d)" não vira mobília até existir o primeiro dado real. */}
      {(ativos.length > 0 || comTreino > 0 || avaliacoesMes > 0) && (
        <Card variant="soft" className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3">
          {ativos.length > 0 && (
            <StatInline icon={<Users className="h-4 w-4 text-primary" />} value={ativos.length} label="alunos ativos" to="/alunos" />
          )}
          {comTreino > 0 && (
            <StatInline icon={<CalendarRange className="h-4 w-4 text-primary" />} value={comTreino} label="com treino ativo" to="/alunos" />
          )}
          {avaliacoesMes > 0 && (
            <StatInline icon={<Activity className="h-4 w-4 text-analysis" />} value={avaliacoesMes} label="avaliações (30d)" to="/assessments" />
          )}
        </Card>
      )}

      {/* Ritual de segunda (parcial): reavaliações da semana e mensalidades pendentes.
          Só aparece quando há dado real; nunca mostra zero inventado. */}
      {(reavaliamSemana > 0 || pendentesCentavos > 0) && (
        <Card variant="soft" className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3">
          {reavaliamSemana > 0 && (
            <Link to="/alunos" className="inline-flex items-center gap-2 text-sm hover:text-ink">
              <CalendarCheck className="h-4 w-4 text-analysis" />
              <span className="tabular font-display text-lg font-bold text-ink">{reavaliamSemana}</span>
              <span className="text-ink-2">{reavaliamSemana === 1 ? "reavalia esta semana" : "reavaliam esta semana"}</span>
            </Link>
          )}
          {pendentesCentavos > 0 && (
            <Link to="/alunos" className="inline-flex items-center gap-2 text-sm hover:text-ink">
              <Wallet className="h-4 w-4 text-primary" />
              <span className="tabular font-display text-lg font-bold text-ink">{formatBRL(pendentesCentavos)}</span>
              <span className="text-ink-2">em mensalidades pendentes</span>
            </Link>
          )}
        </Card>
      )}

      {/* ÂNCORA: Precisam de atenção */}
      {atencao.length > 0 ? (
        <Card variant="raised" className="border-l-4 border-l-warning p-5 md:p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-warning-tint text-warning">
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
            <span className="font-semibold text-ink">Tudo em dia.</span> Nenhum aluno sem avaliação,
            sem treino ativo, com reavaliação vencida ou chegando.
          </p>
        </Card>
      )}

      {/* Reativar alunos: retenção a partir da execução real (só aparece se houver quem
          reativar). Recebe já sem os que estão em "Precisam de atenção" (dedup). */}
      <RetencaoPanel alunos={alunosSemAtencao} execucoes={execucoes} nomeProfissional={name || undefined} />

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
        ) : seusAlunos.length === 0 ? (
          // Todos os ativos já apareceram acima (atenção/reativar): não repetir.
          <Card className="p-5 text-sm text-ink-2">
            Todos os seus alunos já aparecem nas seções acima.
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {seusAlunos.slice(0, 4).map((a) => (
              <AlunoCard key={a.id} aluno={a} temTreino={temTreinoAtivo(a.id)} />
            ))}
          </div>
        )}
      </section>
        </>
      )}

      {/* Ferramentas do Profissional (compacto, fora do fluxo principal) */}
      <ProTools />

      <p className="pt-2 text-xs text-ink-3">
        Conteúdo educacional e de apoio à decisão; não substitui avaliação profissional
        individualizada nem prescrição clínica.
      </p>
    </div>
  );
}

/* ------------------------------- Auxiliares ------------------------------- */

/* Moldura única de boas-vindas: funde a celebração do 1º caso (a métrica-mãe) e
   o checklist "Seu passo a passo" num só card, encabeçado pela espinha do cuidado
   (halo de 3 ciclos, 1 por página). Colapsa para uma linha quando o fluxo termina,
   em vez de virar mobília permanente nas aberturas diárias. */
function MolduraBoasVindas({
  temAluno,
  temAvaliacao,
  temPrescricao,
  temTreino,
  temEvolucao,
  primeiroAlunoId,
}: {
  temAluno: boolean;
  temAvaliacao: boolean;
  temPrescricao: boolean;
  temTreino: boolean;
  temEvolucao: boolean;
  primeiroAlunoId?: string;
}) {
  const [oculto, setOculto] = useState(
    () => typeof window !== "undefined" && localStorage.getItem("pi-passos-ocultos") === "1",
  );
  const [celebracaoFechada, setCelebracaoFechada] = useState(() => {
    const a = getAtivacao();
    return !(a.primeiroSalvo && !a.celebrado);
  });
  const min = minutosPrimeiroCaso();
  const mostrarCelebracao = !celebracaoFechada;

  const passos = [
    { done: temAluno, label: "Cadastre um aluno", to: "/alunos?novo=1" },
    { done: temAvaliacao, label: "Registre uma avaliação", to: primeiroAlunoId ? `/alunos/${primeiroAlunoId}?avaliar=1` : "/alunos" },
    { done: temPrescricao, label: "Escolha exercícios com justificativa", to: primeiroAlunoId ? `/gps?aluno=${primeiroAlunoId}` : "/gps" },
    { done: temTreino, label: "Monte o treino do aluno", to: primeiroAlunoId ? `/prescrever-treino?aluno=${primeiroAlunoId}` : "/prescrever-treino" },
    { done: temEvolucao, label: "Acompanhe a evolução", to: "/assessments" },
  ];
  // Estado MONOTÔNICO para exibição: um passo só conta como feito se todos os
  // anteriores também estão. Senão o passo 5 (evolução, já verdadeiro pelos seeds)
  // aparecia com check enquanto o passo 4 ainda era "o próximo", contradição.
  const feitoMono = passos.map((_, i) => passos.slice(0, i + 1).every((x) => x.done));
  const feitos = feitoMono.filter(Boolean).length;
  const atualIdx = feitoMono.indexOf(false);
  const completo = feitos === passos.length;

  const ocultar = () => {
    localStorage.setItem("pi-passos-ocultos", "1");
    setOculto(true);
  };
  const fecharCelebracao = () => {
    marcarCelebrado();
    setCelebracaoFechada(true);
  };

  if (oculto) return null;

  // Colapsado: uma linha quando o fluxo terminou (e não há mais celebração a mostrar).
  if (completo && !mostrarCelebracao) {
    return (
      <Card className="flex items-center gap-4 p-4">
        <EspinhaSelo atual={5} className="hidden w-full max-w-[18rem] sm:flex" />
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
          <p className="min-w-0 flex-1 text-sm text-ink-2">
            <span className="font-semibold text-ink">Fluxo dominado.</span> Você percorreu o ciclo do
            cuidado, do cadastro à evolução.
          </p>
          <button onClick={ocultar} className="shrink-0 text-xs font-medium text-ink-3 hover:text-ink">
            Ocultar
          </button>
        </div>
      </Card>
    );
  }

  const espinhaAtual = completo ? 5 : Math.max(0, Math.min(atualIdx, 4));

  return (
    <Card className="p-5">
      <EspinhaSelo atual={espinhaAtual} halo={!completo} className="mb-4" />

      {mostrarCelebracao && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-[#147a3a]/30 bg-[#e7f8ed]/50 p-3">
          <PartyPopper className="h-5 w-5 shrink-0 text-success" />
          <p className="min-w-0 flex-1 text-sm text-ink-2">
            <span className="font-semibold text-ink">
              Primeiro caso real resolvido{min ? ` em ${min} min` : ""}.
            </span>{" "}
            Vincule a um aluno para salvar e exportar o prontuário; é assim que cada caso vira defesa
            técnica sua.
          </p>
          <button onClick={fecharCelebracao} aria-label="Fechar" className="rounded-md p-2.5 text-ink-3 hover:bg-surface-soft">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h2 className="font-display text-base font-bold text-ink">Seu passo a passo</h2>
        <Pill tone="primary">{feitos} de {passos.length}</Pill>
        <button onClick={ocultar} className="ml-auto text-xs font-medium text-ink-3 hover:text-ink">
          Ocultar
        </button>
      </div>
      <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {passos.map((p, i) => {
          const atual = i === atualIdx;
          const feito = feitoMono[i];
          return (
            <li key={p.label}>
              <Link
                to={p.to}
                aria-current={atual ? "step" : undefined}
                className={cn(
                  "flex h-full items-center gap-2.5 rounded-xl border p-3 text-sm transition-colors",
                  feito
                    ? "border-border bg-surface-soft text-ink-3"
                    : atual
                      ? "border-primary bg-primary-tint font-semibold text-ink hover:bg-primary-tint"
                      : "border-border bg-surface text-ink-2 hover:bg-surface-soft",
                )}
              >
                {feito ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                ) : (
                  <span
                    className={cn(
                      "tabular grid h-5 w-5 shrink-0 place-items-center rounded-full text-2xs font-bold",
                      atual ? "bg-primary text-white" : "bg-surface-soft text-ink-3",
                    )}
                  >
                    {i + 1}
                  </span>
                )}
                <span className={cn(feito && "line-through decoration-[#5b6472]/50")}>{p.label}</span>
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
      <span className="grid h-16 w-16 place-items-center rounded-card bg-primary-tint text-primary">
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

function AlunoCard({ aluno, temTreino }: { aluno: Aluno; temTreino: boolean }) {
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
        {!temTreino && <Pill tone="warning">Sem treino</Pill>}
        {restr.length > 0 && (
          <Pill tone="warning">
            {rotuloRestricao(restr[0].tag)}
            {restr.length > 1 ? ` +${restr.length - 1}` : ""}
          </Pill>
        )}
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

function ProTools() {
  const tools = [
    { icon: GitCompare, label: "Comparador avançado", sub: "Ranqueie variações por eficiência", to: "/comparador" },
    { icon: ClipboardList, label: "Protocolos prontos", sub: "Modelos por objetivo", to: "/protocols" },
    { icon: TrendingUp, label: "Evolução dos alunos", sub: "Visão agregada da saúde e das medidas", to: "/assessments" },
  ];

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
