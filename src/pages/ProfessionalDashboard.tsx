import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  UserPlus,
  Navigation,
  CalendarPlus,
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
import { rotaDoDia, type RotaDoDia, type ParadaDoDia } from "@/lib/gps/rotaDoDia";
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
  // "Não liberado" pendente é a pendência mais grave (tone "danger"): esses alunos
  // sobem para o topo da lista de atenção. Ordenação estável mantém o resto na
  // ordem original.
  const temAlertaVermelho = (motivos: ReturnType<typeof avisosDoAluno>) =>
    motivos.some((m) => m.tone === "danger");
  // Pendência de LIBERAÇÃO (vermelho pendente ou a etapa "liberar") abre direto na
  // aba Semáforo do aluno, onde se faz o semáforo de hoje. Antes só o vermelho
  // roteava; a etapa "liberar" caía na aba padrão.
  const precisaSemaforo = (motivos: ReturnType<typeof avisosDoAluno>) =>
    motivos.some((m) => m.etapa === "liberar");
  const atencao = ativos
    .map((a) => ({ aluno: a, motivos: avisosDoAluno(a, ctx) }))
    .filter((x) => x.motivos.length > 0)
    .sort((a, b) => Number(temAlertaVermelho(b.motivos)) - Number(temAlertaVermelho(a.motivos)));

  // A rota do dia: as paradas do profissional, da mesma fonte única que alimenta
  // o chip da lista de alunos e a Linha do cuidado. Sem fonte única, a rota
  // contradiria a lista na mesma tela.
  const rota = rotaDoDia(alunos, ctx);
  // Deduplicação na CAMADA DE APRESENTAÇÃO (motor intocado): cada aluno aparece
  // uma vez, na sua pendência mais forte. Precedência: rota/atenção > reativar > seus.
  const atencaoIds = new Set(atencao.map((x) => x.aluno.id));
  // Quem está numa parada da rota de hoje (inclui a etapa "liberar", que não gera
  // aviso porque tem chip null) NÃO pode reaparecer em "Em dia": era a contradição
  // de o mesmo aluno estar na rota e listado como em dia na mesma tela.
  const rotaIds = new Set(rota.paradas.map((p) => p.aluno.id));
  const alunosSemAtencao = alunos.filter((a) => !atencaoIds.has(a.id) && !rotaIds.has(a.id));
  const reativarIds = new Set(alunosParaReativar(alunosSemAtencao, execucoes).map((s) => s.aluno.id));
  const seusAlunos = ativos.filter((a) => !atencaoIds.has(a.id) && !rotaIds.has(a.id) && !reativarIds.has(a.id));

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
          {/* Só no mobile: a topbar já traz "Cadastrar aluno" a partir de sm. */}
          <Link to="/alunos?novo=1" className={cn(buttonClasses("secondary"), "sm:hidden")}>
            <UserPlus className="h-4 w-4" /> Cadastrar aluno
          </Link>
          {/* O início do trilho no topo: avaliar é a etapa 1 e o hub /assessments já
              lista quem precisa. Prescrever exercício vive na nav e no contexto do aluno. */}
          <Link to="/assessments" className={buttonClasses("primary")}>
            <CalendarPlus className="h-4 w-4" /> Registrar avaliação
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

      {/* OS TRÊS NÚMEROS DO DIA, na ordem do mockup: carteira, cobertura de
          treino e dinheiro parado. O terceiro slot prefere o financeiro (que é o
          que o design pede) e cai para as avaliações do mês quando não há nada
          pendente: um "R$ 0 pendentes" seria mobília, não informação. */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <NumeroDoDia valor={String(ativos.length)} rotulo={ativos.length === 1 ? "aluno ativo" : "alunos ativos"} to="/alunos" />
        <NumeroDoDia valor={String(comTreino)} rotulo="com treino ativo" to="/alunos" />
        {pendentesCentavos > 0 ? (
          <NumeroDoDia valor={formatBRL(pendentesCentavos)} rotulo="pendentes" to="/alunos" tone="warning" />
        ) : (
          <NumeroDoDia valor={String(avaliacoesMes)} rotulo="avaliações em 30 dias" to="/assessments" />
        )}
      </div>

      {/* ÂNCORA: Sua rota de hoje (o bloco-assinatura do Meu dia no design). */}
      <RotaDeHojeCard rota={rota} reavaliamSemana={reavaliamSemana} />

      {/* Atalhos de referência, na linha do mockup: três portas, um clique. */}
      <div className="grid gap-3 sm:grid-cols-3">
        <AtalhoRef to="/comparador" icon={<GitCompare className="h-4 w-4" />} titulo="Comparador" hint="decidir entre dois" />
        <AtalhoRef to="/protocols" icon={<ClipboardList className="h-4 w-4" />} titulo="Protocolos" hint="pontos de partida" />
        <AtalhoRef to="/aprender" icon={<Crown className="h-4 w-4" />} titulo="Estudar" hint="trilhas e casos" />
      </div>

      {/* Semana dos seus alunos: quantos treinos aconteceram por dia, e a
          variação contra a semana anterior. Tudo contado das execuções reais. */}
      <SemanaDosAlunos execucoes={execucoes} />

      {/* Reativar alunos: retenção a partir da execução real (só aparece se houver quem
          reativar). Recebe já sem os que estão em "Precisam de atenção" (dedup). */}
      <RetencaoPanel alunos={alunosSemAtencao} execucoes={execucoes} nomeProfissional={name || undefined} />

      {/* Seus alunos (apoio): quem NÃO está na rota, ou seja, quem está em dia. */}
      {seusAlunos.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-ink">Em dia</h2>
            <Link to="/alunos" className="text-sm font-semibold text-primary hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {seusAlunos.slice(0, 4).map((a) => (
              <AlunoCard key={a.id} aluno={a} temTreino={temTreinoAtivo(a.id)} />
            ))}
          </div>
        </section>
      )}
        </>
      )}

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
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-success/30 bg-success-tint/50 p-3">
          <PartyPopper className="h-5 w-5 shrink-0 text-success" />
          <p className="min-w-0 flex-1 text-sm text-ink-2">
            <span className="font-semibold text-ink">
              Primeiro caso real resolvido{min ? ` em ${min} min` : ""}.
            </span>{" "}
            Vincule a um aluno para salvar e exportar o prontuário; é assim que cada caso vira defesa
            técnica sua.
          </p>
          <button onClick={fecharCelebracao} aria-label="Fechar" className="rounded-full p-2.5 text-ink-3 hover:bg-surface-soft">
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
                      atual ? "bg-primary text-on-primary" : "bg-surface-soft text-ink-3",
                    )}
                  >
                    {i + 1}
                  </span>
                )}
                <span className={cn(feito && "line-through decoration-ink-3/50")}>{p.label}</span>
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


/**
 * "Sua rota de hoje": o contador de paradas, a próxima parada em destaque e a
 * lista das restantes, cada uma com o VERBO da ação (nunca "ver" genérico).
 *
 * Substitui o antigo "Precisam de atenção", que mostrava as mesmas pessoas com
 * pílulas de diagnóstico e um botão sem nome. A diferença que importa: aqui o
 * profissional lê o que FAZER, e o rótulo vem da mesma fonte que decide o
 * próximo passo, então a tela nunca sugere uma coisa e a lista outra.
 */
function RotaDeHojeCard({ rota, reavaliamSemana }: { rota: RotaDoDia; reavaliamSemana: number }) {
  if (rota.total === 0) return null;

  if (rota.paradas.length === 0) {
    return (
      <Card className="flex items-center gap-3 p-5">
        <CheckCircle2 className="h-6 w-6 shrink-0 text-success" />
        <p className="text-sm text-ink-2">
          <span className="font-semibold text-ink">Rota de hoje concluída.</span> Os {rota.feitas} alunos ativos estão
          em dia: avaliação registrada, treino ativo e semáforo do dia feito.
        </p>
      </Card>
    );
  }

  // Os chips do topo do mockup ("Semáforo · 3 alunos", "Avaliar João"): as
  // paradas AGRUPADAS por ação. Com um aluno só, o chip diz o nome dele; com
  // vários, diz quantos. Derivado da mesma lista abaixo, nunca de outra conta.
  const grupos = new Map<string, ParadaDoDia[]>();
  for (const p of rota.paradas) {
    const atual = grupos.get(p.acao) ?? [];
    atual.push(p);
    grupos.set(p.acao, atual);
  }

  return (
    <Card variant="raised" className="p-5 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">Sua rota de hoje</h2>
          <p className="tabular text-sm text-ink-2">
            {rota.feitas} de {rota.total} paradas feitas
          </p>
        </div>
        {rota.agora && (
          <Link to={destinoDaParada(rota.agora)} className={buttonClasses("primary", "sm")}>
            Abrir o dia <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {/* Trilho de progresso: uma marca por parada, acesa nas já feitas. */}
      <div className="mt-3 flex gap-1.5" role="img" aria-label={`${rota.feitas} de ${rota.total} paradas feitas`}>
        {Array.from({ length: rota.total }, (_, i) => (
          <span
            key={i}
            aria-hidden
            className={cn("h-1.5 flex-1 rounded-full", i < rota.feitas ? "bg-analysis-fill" : "bg-surface-mute")}
          />
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {[...grupos.entries()].map(([acao, ps]) => (
          <span
            key={acao}
            className="rounded-full bg-surface-soft px-3 py-1 text-xs font-semibold text-ink-2 ring-1 ring-inset ring-border"
          >
            {acao} · {ps.length === 1 ? ps[0].aluno.nome.split(" ")[0] : `${ps.length} alunos`}
          </span>
        ))}
      </div>

      {reavaliamSemana > 0 && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-2">
          <CalendarCheck className="h-3.5 w-3.5 text-analysis" aria-hidden />
          Ritual de segunda: {reavaliamSemana}{" "}
          {reavaliamSemana === 1 ? "reavaliação marcada" : "reavaliações marcadas"} para esta semana.
        </p>
      )}

      <ol className="mt-4 space-y-2.5">
        {rota.paradas.map((p) => (
          <li key={p.aluno.id}>
            <Link
              to={destinoDaParada(p)}
              className="flex items-center gap-3 rounded-card border border-border bg-surface p-3 transition-colors hover:bg-surface-soft"
              // Borda esquerda na cor da urgência: regra de linha de lista com
              // pendência, do Design System.
              style={{ borderLeftWidth: 4, borderLeftColor: `var(--${p.tone === "cta" ? "warning" : p.tone})` }}
            >
              <Avatar iniciais={p.aluno.iniciais} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold text-ink">{p.aluno.nome}</div>
                <div className="truncate text-sm text-ink-2">{p.frase}</div>
              </div>
              <span className={cn(buttonClasses("secondary", "sm"), "shrink-0")}>{p.acao}</span>
            </Link>
          </li>
        ))}
      </ol>
    </Card>
  );
}

/** Onde cada parada abre. Liberar cai direto na aba Semáforo do aluno; avaliar
 *  abre o modal de avaliação pelo deep-link; o resto abre a ficha. */
function destinoDaParada(p: ParadaDoDia): string {
  // O destino explícito do passo manda: com o perfil travando a prescrição, a
  // parada leva à seção do perfil que destrava, não à tela bloqueada.
  if (p.to) return p.to;
  if (p.etapa === "liberar") return `/alunos/${p.aluno.id}?aba=semaforo`;
  if (p.etapa === "avaliar" || p.etapa === "reavaliar") return `/alunos/${p.aluno.id}?avaliar=1`;
  if (p.etapa === "planejar") return `/prescrever-treino?aluno=${p.aluno.id}`;
  return `/alunos/${p.aluno.id}`;
}

/** Um dos três números do topo do Meu dia: valor grande, rótulo colado, e a
 *  tela para onde ele leva. Card clicável inteiro (alvo generoso). */
function NumeroDoDia({
  valor,
  rotulo,
  to,
  tone = "neutro",
}: {
  valor: string;
  rotulo: string;
  to: string;
  tone?: "neutro" | "warning";
}) {
  return (
    <Link
      to={to}
      className="rounded-card border border-border bg-surface p-4 transition-colors hover:bg-surface-soft"
    >
      <div className={cn("tabular font-display text-2xl font-bold", tone === "warning" ? "text-warning" : "text-ink")}>
        {valor}
      </div>
      <div className="text-sm text-ink-2">{rotulo}</div>
    </Link>
  );
}

/** Atalho de referência do rodapé do Meu dia: ícone, nome e a descrição de uma
 *  linha que o Design System exige em toda opção clicável. */
function AtalhoRef({ to, icon, titulo, hint }: { to: string; icon: ReactNode; titulo: string; hint: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-card border border-border bg-surface p-4 transition-colors hover:bg-surface-soft"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-primary-tint text-primary">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-ink">{titulo}</span>
        <span className="block truncate text-xs text-ink-2">{hint}</span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-ink-2" aria-hidden />
    </Link>
  );
}

/**
 * "Semana dos seus alunos": quantos treinos aconteceram por dia da semana civil,
 * o total e a variação contra a semana anterior.
 *
 * Um treino = um DIA em que o aluno registrou alguma coisa (a mesma definição do
 * app do aluno). Contar execuções soltas inflaria o número: seis exercícios num
 * dia não são seis treinos. A variação só aparece quando a semana anterior teve
 * movimento; percentual sobre zero não existe.
 */
function SemanaDosAlunos({ execucoes }: { execucoes: { alunoId?: string; concluidoEm: number }[] }) {
  const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const agora = Date.now();
  const diaSemana = (new Date(agora).getDay() + 6) % 7;
  const inicio = new Date(agora).setHours(0, 0, 0, 0) - diaSemana * DIA;

  // Um "treino" por aluno por dia: chave aluno+dia, contada uma vez.
  const contaJanela = (de: number, ate: number) =>
    new Set(
      execucoes
        .filter((e) => e.concluidoEm >= de && e.concluidoEm < ate)
        .map((e) => `${e.alunoId ?? "?"}#${Math.floor(e.concluidoEm / DIA)}`),
    ).size;

  const porDia = DIAS.map((_, i) => contaJanela(inicio + i * DIA, inicio + (i + 1) * DIA));
  const total = porDia.reduce((s, n) => s + n, 0);
  const anterior = contaJanela(inicio - 7 * DIA, inicio);
  const variacao = anterior > 0 ? Math.round(((total - anterior) / anterior) * 100) : null;
  const max = Math.max(1, ...porDia);
  if (total === 0 && anterior === 0) return null;

  return (
    <Card className="p-5">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-base font-bold text-ink">Semana dos seus alunos</h2>
        <div className="flex items-baseline gap-2">
          <span className="tabular font-display text-lg font-bold text-ink">
            {total} {total === 1 ? "treino" : "treinos"}
          </span>
          {variacao != null && variacao !== 0 && (
            <span className={cn("tabular text-xs font-bold", variacao > 0 ? "text-success" : "text-warning")}>
              {variacao > 0 ? "+" : ""}
              {variacao}% vs semana passada
            </span>
          )}
        </div>
      </div>
      <div
        className="flex h-20 items-end gap-2"
        role="img"
        aria-label={DIAS.map((d, i) => `${d}: ${porDia[i]}`).join(", ")}
      >
        {DIAS.map((d, i) => (
          <div key={d} className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <span className="tabular text-2xs font-bold text-ink-2">{porDia[i] || ""}</span>
            <div
              aria-hidden
              className={cn("w-full rounded-t-control", i === diaSemana ? "bg-primary" : "bg-surface-mute")}
              style={{ height: `${Math.max(4, (porDia[i] / max) * 100)}%` }}
            />
            <span className={cn("text-2xs", i === diaSemana ? "font-bold text-ink" : "text-ink-2")}>{d}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
