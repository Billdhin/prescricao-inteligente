import * as React from "react";
import { TrendingUp, TrendingDown, Minus, Activity, MessageSquareQuote, AlertTriangle, ArrowUpRight, Check, X, Lock } from "lucide-react";
import { Card, Pill, LinhaDeDose, LinhaDeTokens, TokenRotulado, buttonClasses } from "@/components/ui/primitives";
import { SemanaStrip } from "@/components/student/SemanaStrip";
import { exercises } from "@/data/exercises";
import type { Macrociclo, PlanoTreino, VariavelTravavel } from "@/data/periodizacao";
import type { Execucao, SessaoFeedback } from "@/data/execucao";
import type { Aluno, Avaliacao, Liberacao } from "@/data/alunos";
import { ajustarCarga, faixaDeReps, incrementoDoExercicio, type AcaoCarga, type CtxSeguranca, type ModProgressaoAjuste } from "@/lib/gps/autorregulacao";
import { renovarMicrociclo, aplicarRenovacao } from "@/lib/gps/renovarMicrociclo";
import { modProgressaoDe } from "@/lib/gps/groupRules";
import type { EstadoSemaforo } from "@/lib/gps/semaforoDiario";
import { rotuloFaixaPse, bandaPse, TINT_PSE } from "@/lib/pse";
import { cn } from "@/lib/utils";

const nomeEx = (slug?: string) => (slug ? exercises.find((e) => e.slug === slug)?.nome ?? slug : "Exercício");
const fmtData = (ts: number) => new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(ts));

const VAR_LABEL: Record<VariavelTravavel, string> = { volume: "volume", intensidade: "intensidade", complexidade: "complexidade" };

const ACAO_META: Record<AcaoCarga, { label: string; tone: "success" | "warning" | "neutral" | "danger"; Icon: typeof TrendingUp }> = {
  subir: { label: "Progredir", tone: "success", Icon: TrendingUp },
  descarregar: { label: "Descarregar", tone: "warning", Icon: TrendingDown },
  manter: { label: "Manter", tone: "neutral", Icon: Minus },
  encaminhar: { label: "Encaminhar", tone: "danger", Icon: AlertTriangle },
  "sem-dado": { label: "Sem dado", tone: "neutral", Icon: Minus },
};

/**
 * Selo do PSE da sessão: número + rótulo da faixa (ex.: "7 · Intenso"), com o par
 * tint + texto da mesma família (AA garantido, padrão da onda C). Reusado no resumo
 * do último feedback na aba "App do aluno".
 */
export function PseBadge({ pse, className }: { pse: number; className?: string }) {
  const { familia } = bandaPse(pse);
  const { rotulo } = rotuloFaixaPse(pse);
  return (
    <span className={cn("inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-bold", TINT_PSE[familia], className)}>
      {pse}
      {rotulo && <span className="ml-1 font-semibold">· {rotulo}</span>}
    </span>
  );
}

/** Nome da sessão por id (para resolver "Semana N · Sessão X" a partir do plano). */
function mapaSessoes(plano?: PlanoTreino): Map<string, string> {
  const m = new Map<string, string>();
  plano?.macrociclo.mesociclos
    .flatMap((mc) => mc.microciclos)
    .flatMap((mic) => mic.sessoes)
    .forEach((s) => {
      if (!m.has(s.id)) m.set(s.id, s.nome);
    });
  return m;
}

/** Contexto de segurança do aluno (semáforo do dia + dor/sinais da última avaliação). */
function ctxSeguranca(estado?: EstadoSemaforo, ultimaAvaliacao?: Avaliacao): CtxSeguranca | undefined {
  const vermelhoPendente = Boolean(estado?.vermelhoPendente);
  const amareloHoje = estado?.hoje?.resultado === "amarelo";
  const dor = ultimaAvaliacao?.dorEscala;
  const sintomas = ultimaAvaliacao?.regioesDor;
  if (!vermelhoPendente && !amareloHoje && !dor && !(sintomas && sintomas.length)) return undefined;
  return { vermelhoPendente, amareloHoje, dor, sintomas };
}

/**
 * Painel do profissional: como o aluno SENTIU a sessão (o recado é o item mais valioso, então vem
 * primeiro), a aderência da semana (mesma faixa do app do aluno, em modo compacto e na cor do tema
 * do profissional) e a SUGESTÃO de ajuste da autorregulação por exercício.
 *
 * É apoio, não automatismo: o profissional lê a proposta (com a justificativa) e decide. Agora o
 * GATE DE SEGURANÇA está no caminho de verdade (onda MP-6): com semáforo vermelho/amarelo pendente,
 * dor ou sintoma na última avaliação, nenhuma sugestão de PROGREDIR sai; a dose vira manter,
 * descarregar ou encaminhar. As sugestões respeitam o incremento diferenciado por exercício e o
 * modificador do perfil clínico. A "renovação da próxima semana" só se aplica ao plano SOB clique.
 */
export function ExecucaoPanel({
  plano,
  execucoes,
  sessaoFeedbacks,
  liberacoes,
  alunoId,
  aluno,
  estadoSemaforo,
  ultimaAvaliacao,
  onAplicarPlano,
}: {
  plano?: PlanoTreino;
  execucoes: Execucao[];
  sessaoFeedbacks: SessaoFeedback[];
  liberacoes: Liberacao[];
  alunoId: string;
  /** aluno dono do plano: alimenta o modificador de progressão por perfil clínico */
  aluno?: Aluno;
  /** estado do semáforo diário (gate de segurança) */
  estadoSemaforo?: EstadoSemaforo;
  /** última avaliação (dor/sinais para o gate de segurança) */
  ultimaAvaliacao?: Avaliacao;
  /** aplica a renovação aprovada ao plano (nunca automático; só sob clique) */
  onAplicarPlano?: (planoId: string, patch: { macrociclo: Macrociclo }) => void;
}) {
  const [renovAplicada, setRenovAplicada] = React.useState(false);
  const [renovDispensada, setRenovDispensada] = React.useState(false);

  // Gate de segurança + modificador do perfil clínico do aluno (fonte única para as sugestões).
  const seg = ctxSeguranca(estadoSemaforo, ultimaAvaliacao);
  const mod = aluno ? modProgressaoDe([aluno.grupoEspecial, ...(aluno.condicoesAtencao ?? [])]) : undefined;
  const modPerfil: ModProgressaoAjuste | undefined = mod ? { pseTeto: mod.pseTeto, fatorIncremento: mod.fatorIncremento } : undefined;

  // Faixa de repetições por exercício (do primeiro bloco que o usa no plano).
  const faixaPorSlug = new Map<string, ReturnType<typeof faixaDeReps>>();
  plano?.macrociclo.mesociclos
    .flatMap((m) => m.microciclos)
    .flatMap((mc) => mc.sessoes)
    .flatMap((s) => s.blocos)
    .forEach((b) => {
      if (b.exercicioSlug && !faixaPorSlug.has(b.exercicioSlug)) faixaPorSlug.set(b.exercicioSlug, faixaDeReps(b.reps));
    });

  // Renovação responsiva da próxima semana (execução da última semana -> alvo seguinte). Só CALCULA;
  // aplicar ao plano é sob clique. Sem plano, cai nas sugestões avulsas por exercício.
  const ultimaSemana = execucoes.length ? Math.max(...execucoes.map((e) => e.semana ?? 0)) : 0;
  const renovacao =
    plano && ultimaSemana > 0 ? renovarMicrociclo(plano, ultimaSemana, execucoes, sessaoFeedbacks, seg, { modPerfil }) : undefined;

  // Sugestões para exibir: do tubo (quando há plano, para casar com a semana seguinte) ou avulsas.
  const sugestoes = renovacao
    ? renovacao.sugestoes
        .filter((s) => s.ajuste.acao !== "sem-dado")
        .map((s) => ({ slug: s.slug, nome: s.nomeExercicio, ajuste: s.ajuste, travadas: s.travadas }))
    : [...new Set(execucoes.map((e) => e.exercicioSlug).filter(Boolean) as string[])]
        .map((slug) => {
          const execs = execucoes.filter((e) => e.exercicioSlug === slug);
          const faixa = faixaPorSlug.get(slug) ?? { min: 8, max: 12 };
          return {
            slug,
            nome: nomeEx(slug),
            ajuste: ajustarCarga(execs, faixa, { seguranca: seg, incrementoPct: incrementoDoExercicio(slug).pct, modPerfil }),
            travadas: undefined as VariavelTravavel[] | undefined,
          };
        })
        .filter((s) => s.ajuste.acao !== "sem-dado");

  const podeAplicar = Boolean(renovacao?.temAplicavel && plano && onAplicarPlano && !renovAplicada && !renovDispensada);
  const nAvancam = renovacao?.sugestoes.filter((s) => s.mudancaAlvo && Object.keys(s.mudancaAlvo).length > 0).length ?? 0;
  const travadasResumo = [...new Set((renovacao?.sugestoes ?? []).flatMap((s) => s.travadas ?? []))];

  const recentes = [...execucoes].sort((a, b) => b.concluidoEm - a.concluidoEm).slice(0, 8);
  const feedbacks = [...sessaoFeedbacks].sort((a, b) => b.concluidaEm - a.concluidaEm).slice(0, 5);
  const nomePorSessao = mapaSessoes(plano);

  const aplicar = () => {
    if (!plano || !renovacao || !onAplicarPlano) return;
    onAplicarPlano(renovacao.planoId, aplicarRenovacao(plano, renovacao));
    setRenovAplicada(true);
  };

  return (
    <Card className="p-5">
      <h3 className="mb-1 flex items-center gap-2 font-display text-lg font-bold text-ink">
        <Activity className="h-5 w-5 text-primary" /> Execução do aluno
      </h3>
      <p className="mb-4 text-sm text-ink-2">
        O que o aluno registrou no app e como ele sentiu as sessões. As sugestões de ajuste são apoio; você decide.
      </p>

      {/* Aderência da semana: mesma faixa do app do aluno, em modo compacto e na cor do
          tema do profissional (tokens, não a marca do aluno). */}
      <div className="mb-4">
        <div className="mb-1.5 text-2xs font-semibold uppercase tracking-wide text-ink-3">Aderência da semana</div>
        <SemanaStrip alunoId={alunoId} execucoes={execucoes} liberacoes={liberacoes} cor="var(--primary)" compacto />
      </div>

      {/* Como o aluno sentiu: o recado é o item mais valioso; vem antes das sugestões. */}
      <div className="mb-4">
        <div className="mb-1.5 flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide text-ink-3">
          <MessageSquareQuote className="h-3.5 w-3.5" /> Como o aluno sentiu
        </div>
        {feedbacks.length === 0 ? (
          <p className="text-xs text-ink-3">
            O esforço e os recados do aluno aparecem aqui quando ele concluir sessões no app.
          </p>
        ) : (
          <ul className="space-y-2">
            {feedbacks.map((f) => {
              // Cor da faixa do PSE governa o acento da citação; sem PSE, borda neutra.
              const familia = f.pse != null ? bandaPse(f.pse).familia : null;
              const nomeSessao = nomePorSessao.get(f.sessaoRef);
              const contexto = `Semana ${f.semana}${nomeSessao ? ` · ${nomeSessao}` : ""}`;
              return (
                <li key={f.id} className="rounded-xl border border-border p-3">
                  {/* Data + contexto + PSE + duração colados, sem justify-between. */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="tabular text-xs font-semibold text-ink-2">{fmtData(f.concluidaEm)}</span>
                    <span className="text-xs text-ink-3">{contexto}</span>
                    {f.pse != null && <PseBadge pse={f.pse} />}
                    {f.duracaoMin != null && <TokenRotulado label="Duração" value={`${f.duracaoMin} min`} />}
                  </div>
                  {f.observacao && (
                    <blockquote
                      className={cn("mt-2 border-l-2 pl-3 text-sm text-ink", !familia && "border-border")}
                      style={familia ? { borderColor: `var(--${familia})` } : undefined}
                    >
                      {f.observacao}
                    </blockquote>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Aviso do gate de segurança: quando há bandeira, nenhuma sugestão progride. */}
      {seg && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-warning bg-warning-tint p-3 text-xs text-ink-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
          <span>
            <span className="font-semibold text-ink">Segurança em primeiro lugar.</span> Há sinal de alerta hoje
            {seg.vermelhoPendente ? " (semáforo não liberado)" : seg.amareloHoje ? " (semáforo com ressalva)" : ""}
            {seg.dor ? `, dor ${`${seg.dor}`.replace(".", ",")}/10` : ""}
            {seg.sintomas && seg.sintomas.length ? `, sinais: ${seg.sintomas.join(", ")}` : ""}. Nenhuma sugestão de progredir sai
            enquanto isso: a decisão é manter, regredir ou encaminhar.
          </span>
        </div>
      )}

      {sugestoes.length > 0 && (
        <div className="mb-4 space-y-2">
          <div className="text-2xs font-semibold uppercase tracking-wide text-ink-3">Sugestões de ajuste</div>
          {sugestoes.map(({ slug, nome, ajuste, travadas }) => {
            const meta = ACAO_META[ajuste.acao];
            return (
              <div key={slug} className="rounded-xl border border-border p-3">
                {/* Sugestão colada ao exercício (sem justify-between abrindo vão). */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-ink">{nome}</span>
                  <Pill tone={meta.tone}>
                    <meta.Icon className="h-3.5 w-3.5" />
                    {meta.label}
                    {ajuste.proximaCarga != null && ajuste.acao !== "manter" ? `: ${ajuste.proximaCarga} kg` : ""}
                  </Pill>
                  {travadas && travadas.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-2xs font-medium text-ink-3">
                      <Lock className="h-3 w-3" aria-hidden /> {travadas.map((v) => VAR_LABEL[v]).join(" e ")} travada
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-ink-2">{ajuste.motivo}</p>
              </div>
            );
          })}

          {/* Renovar a próxima semana: aprovar (aplica ao plano) ou dispensar. Nunca automático. */}
          {podeAplicar && (
            <div className="rounded-xl border border-primary bg-primary-tint p-3">
              <p className="flex items-start gap-1.5 text-xs text-ink-2">
                <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                <span>
                  <span className="font-semibold text-ink">Renovar a semana {renovacao!.semanaAlvo}:</span>{" "}
                  {nAvancam} {nAvancam === 1 ? "exercício avança" : "exercícios avançam"} dentro da faixa, pela execução real.
                  {travadasResumo.length > 0 && ` Variável travada mantida: ${travadasResumo.map((v) => VAR_LABEL[v]).join(", ")}.`}{" "}
                  Você pode aplicar ou editar os alvos direto no plano.
                </span>
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button onClick={aplicar} className={buttonClasses("primary", "sm")}>
                  <Check className="h-3.5 w-3.5" /> Aplicar no plano
                </button>
                <button onClick={() => setRenovDispensada(true)} className={buttonClasses("ghost", "sm")}>
                  <X className="h-3.5 w-3.5" /> Dispensar
                </button>
              </div>
            </div>
          )}
          {renovAplicada && (
            <div className="flex items-center gap-1.5 rounded-xl border border-success bg-success-tint p-3 text-xs font-medium text-success">
              <Check className="h-3.5 w-3.5" aria-hidden /> Renovação aplicada ao plano. Confira e ajuste no editor quando quiser.
            </div>
          )}
        </div>
      )}

      {recentes.length > 0 && (
        <>
          <div className="mb-1.5 text-2xs font-semibold uppercase tracking-wide text-ink-3">Últimos registros</div>
          {/* Nome + data no bloco; carga, reps e RPE viram tokens rotulados abaixo,
              cada número com o próprio nome, em vez de "40 kg x 12 · RPE 8" solto na borda. */}
          <ul className="overflow-hidden rounded-lg border border-border">
            {recentes.map((e) => (
              <LinhaDeDose
                key={e.id}
                nome={
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    {nomeEx(e.exercicioSlug)}
                    <span className="text-xs font-normal text-ink-3">{fmtData(e.concluidoEm)}</span>
                  </span>
                }
              >
                <LinhaDeTokens>
                  {e.cargaFeita != null && <TokenRotulado label="Carga" value={`${e.cargaFeita} kg`} />}
                  {e.repsFeitas != null && <TokenRotulado label="Reps" value={e.repsFeitas} />}
                  {e.rpe != null && <TokenRotulado label="RPE" value={e.rpe} />}
                </LinhaDeTokens>
              </LinhaDeDose>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}
