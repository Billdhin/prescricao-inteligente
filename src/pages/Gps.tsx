import * as React from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  Navigation,
  ArrowRight,
  ArrowLeft,
  Info,
  Lock,
  Sparkles,
  Crown,
  X,
  Check,
  Plus,
  UserCheck,
  Users,
  Save,
  HeartPulse,
  ShieldAlert,
  ShieldCheck,
  Target,
  CheckCircle2,
  Activity,
  SlidersHorizontal,
  CalendarRange,
} from "lucide-react";
import { Card, Pill, ScoreRing, SectionHeader, buttonClasses, Progress, TokenRotulado } from "@/components/ui/primitives";
import {
  rankExercises,
  OBJETIVOS,
  GRUPOS_MUSCULARES,
  EQUIPAMENTOS,
  PRIORIDADES,
  adequacaoLabel,
  type GpsAnswers,
  type GpsPrioridade,
  type Recommendation,
} from "@/lib/gps/engine";
import { RestricoesSelector } from "@/components/gps/RestricoesSelector";
import { criarRestricao, condicionaisPendentes, avaliarSeguranca, rotuloRestricao } from "@/lib/gps/restricoes";
import { combineRules, type GroupGpsRule } from "@/lib/gps/groupRules";
import { recommendModalidades, type ModalidadeRec } from "@/lib/gps/modalidadeRules";
import { modalidadeImagem, impactoTone } from "@/data/modalities";
import { exercises } from "@/data/exercises";
import type { Nivel } from "@/data/types";
import {
  useUser,
  useGps,
  useProgress,
  useAlunos,
  isPremiumUnlocked,
  marcaDoUsuario,
  FREE_GPS_LIMIT,
  uid,
} from "@/lib/store";
import {
  specialGroups,
  getSpecialGroup,
  complexidadeTone,
  AVISO_SEGURANCA,
  type SpecialGroup,
  type JourneyPhase,
} from "@/data/specialGroups";
import { ParametroPills } from "@/components/special/SpecialUI";
import { AplicarNoTreinoDialog } from "@/components/treino/AplicarNoTreinoDialog";
import type { PlanoTreino } from "@/data/periodizacao";
import type { Prescricao } from "@/data/alunos";
import { montarProntuario } from "@/lib/gps/prontuario";
import { exportProntuarioPDF, idDocumento } from "@/lib/exportProntuario";
import { ProntuarioView } from "@/components/rcd/ProntuarioView";
import { SeloRCD } from "@/components/rcd/SeloRCD";
import type { ProntuarioSnapshot } from "@/data/alunos";
import { marcarAtivacao } from "@/lib/ativacao";
import { toast } from "@/lib/toast";
import { descricaoOpcao } from "@/data/opcoes-wizard";
import { MetricaInfo } from "@/components/metrica/MetricaInfo";
import { MetricaBar } from "@/components/metrica/MetricaBar";
import { FAIXAS_ETARIAS, getFaixaEtaria } from "@/data/faixasEtarias";
import { useDialog } from "@/lib/useDialog";
import { cn, withBase } from "@/lib/utils";
import { FileDown, FileText, Lock as LockIcon } from "lucide-react";

const NIVEIS: Nivel[] = ["Iniciante", "Intermediário", "Avançado"];

// Faixa de séries/reps sugerida por objetivo (educacional — ponto de partida, ajuste ao contexto).
const SERIES_POR_OBJETIVO: Record<string, string> = {
  Emagrecimento: "2–3 séries · 12–15 reps · descanso curto (30–60s), formato circuito",
  Hipertrofia: "3–4 séries · 8–12 reps",
  Força: "4–5 séries · 3–6 reps",
  "Resistência muscular": "2–3 séries · 15–20 reps",
  "Reabilitação/retorno": "2–3 séries · 12–15 reps · carga leve",
  "Aprendizado técnico": "2–3 séries · 8–10 reps · foco na execução",
};
const seriesSugerida = (objetivo: string) => SERIES_POR_OBJETIVO[objetivo] ?? "3 séries · 10–12 reps";

// A etapa 2 se adapta ao objetivo: no Emagrecimento pergunta a PRIORIDADE
// física (cardiorrespiratória/força/misto), não um músculo-alvo.
const stepLabels = (emagrecimento: boolean) => [
  "Qual é o objetivo?",
  emagrecimento ? "Qual a prioridade física?" : "Qual grupo/músculo-alvo?",
  "Qual o nível?",
  "Alguma restrição?",
  "Equipamentos disponíveis",
];

export function Gps() {
  const usuario = useUser();
  const { name: nome, plan, cref } = usuario;
  const unlocked = isPremiumUnlocked(plan);
  const { consultations, increment, reset } = useGps();
  const addActivity = useProgress((s) => s.addActivity);
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { alunos, addPrescricao, liberacoes, avaliacoes, planos, prescricoes, execucoes, updatePlano } = useAlunos();
  // Diálogo "Aplicar no treino" aberto pós-salvar quando o aluno já tem plano ativo.
  const [aplicarDe, setAplicarDe] = React.useState<{ presc: Prescricao; plano: PlanoTreino } | null>(null);

  // Passo 0 — contexto editável (para quem / grupo / fase). Absorve a antiga
  // "Decisão rápida": lê ?aluno / ?grupo / ?fase e deixa o usuário ajustar.
  const [alunoId, setAlunoId] = React.useState<string>(params.get("aluno") ?? "");
  const alunoInicial = alunoId ? alunos.find((a) => a.id === alunoId) : undefined;
  const [grupoSlug, setGrupoSlug] = React.useState<string>(
    alunoInicial?.grupoEspecial ?? params.get("grupo") ?? "",
  );
  const [fase, setFase] = React.useState<number>(
    Math.min(4, Math.max(1, alunoInicial?.faseJornada ?? (Number(params.get("fase")) || 1))),
  );
  // Faixa etária: só na PRESCRIÇÃO GERAL (sem aluno). Orientação contextual.
  const [faixaEtaria, setFaixaEtaria] = React.useState<string>("");
  // Condições associadas: além da condição principal (que dirige a jornada), o
  // profissional pode somar outras condições e os cuidados de todas se combinam.
  const [condicoesExtras, setCondicoesExtras] = React.useState<string[]>([]);

  const aluno = alunoId ? alunos.find((a) => a.id === alunoId) : undefined;
  const grupo = grupoSlug ? getSpecialGroup(grupoSlug) : undefined;
  const faseObj = grupo ? grupo.fases[fase - 1] ?? grupo.fases[0] : undefined;
  const grupoLocked = !!grupo && grupo.premium && !unlocked;
  // Condições cujos cuidados/adaptações valem para esta prescrição: a principal
  // (se não estiver bloqueada) + as associadas liberadas. O motor combina todas.
  const condicoesAtivas = React.useMemo(() => {
    const lista: string[] = [];
    if (grupo && !grupoLocked) lista.push(grupo.slug);
    for (const s of condicoesExtras) {
      if (!s || s === grupoSlug || lista.includes(s)) continue;
      const g = getSpecialGroup(s);
      if (g && (!g.premium || unlocked)) lista.push(s);
    }
    return lista;
  }, [grupo, grupoLocked, condicoesExtras, grupoSlug, unlocked]);
  // Cuidados combinados interligados ao ranqueamento (etapa 4 + motor)
  const rule = React.useMemo(() => combineRules(condicoesAtivas), [condicoesAtivas]);

  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<GpsAnswers>(() => ({
    objetivo: "Hipertrofia",
    grupoMuscular: "Membros inferiores",
    nivel: "Iniciante",
    restricoes: [],
    equipamentos: [...EQUIPAMENTOS],
  }));
  const [results, setResults] = React.useState<Recommendation[] | null>(null);
  const [justify, setJustify] = React.useState<Recommendation | null>(null);
  const [compare, setCompare] = React.useState<string[]>([]);
  const [prontuarioAberto, setProntuarioAberto] = React.useState<ProntuarioSnapshot | null>(null);
  const primeiroCaso = params.get("primeiro-caso") === "1";

  // A última avaliação INFORMA a decisão (senão o registro fica solto do prescrever)
  const ultimaAval = React.useMemo(() => {
    if (!aluno) return undefined;
    return [...avaliacoes].filter((a) => a.alunoId === aluno.id).sort((a, b) => b.data - a.data)[0];
  }, [avaliacoes, aluno]);
  const reavaliacaoVencida = aluno?.proximaReavaliacaoEm ? aluno.proximaReavaliacaoEm < Date.now() : false;

  // Última liberação do Semáforo aplicável (últimas 24h).
  // Com aluno, a pergunta é "ESTE aluno foi liberado hoje?": exigir também que o
  // slug do checklist batesse fazia o semáforo nunca chegar ao prontuário nas
  // condições que usam o checklist geral (a liberação era gravada com outro slug).
  const liberacaoDoDia = React.useMemo(() => {
    const corte = Date.now() - 24 * 3_600_000;
    return liberacoes.find(
      (l) =>
        l.data >= corte && (aluno ? l.alunoId === aluno.id : !l.alunoId && l.grupoSlug === grupoSlug),
    );
  }, [liberacoes, aluno, grupoSlug]);

  // O ranking exibido vale para UM contexto. Se aluno/grupo/fase mudam com
  // resultados abertos, o ranking congelado seria de OUTRO perfil e poderia ser
  // salvo assim no prontuário (incoerência grave num produto de decisão
  // documentada). Invalida e pede para gerar de novo.
  const [contextoAlterado, setContextoAlterado] = React.useState(false);
  const invalidarResultados = () => {
    if (results) {
      setResults(null);
      setCompare([]);
      setStep(0);
      setContextoAlterado(true);
    }
  };

  // Ao escolher um aluno, herda o grupo/fase dele (se tiver) e pré-preenche o perfil.
  const onAluno = (id: string) => {
    invalidarResultados();
    setAlunoId(id);
    if (id) setFaixaEtaria(""); // com aluno, a idade dele já é conhecida
    const a = alunos.find((x) => x.id === id);
    if (a?.grupoEspecial) setGrupoSlug(a.grupoEspecial);
    if (a?.faseJornada) setFase(a.faseJornada);
  };
  const mudarGrupo = (s: string) => {
    invalidarResultados();
    setGrupoSlug(s);
    setCondicoesExtras((prev) => prev.filter((x) => x !== s)); // a principal sai das associadas
  };
  const alternarCondicaoExtra = (slug: string) => {
    invalidarResultados();
    // updater funcional: dois cliques seguidos nunca perdem uma seleção
    setCondicoesExtras((prev) => (prev.includes(slug) ? prev.filter((x) => x !== slug) : [...prev, slug]));
  };
  const mudarFase = (n: number) => {
    invalidarResultados();
    setFase(n);
  };

  React.useEffect(() => {
    if (!aluno) return;
    setAnswers((a) => ({
      ...a,
      objetivo: aluno.objetivo,
      nivel: aluno.nivel,
      restricoes: aluno.restricoes,
      equipamentos: aluno.equipamentos.length ? aluno.equipamentos : a.equipamentos,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aluno?.id]);

  // O grupo já indica a própria restrição (ex.: dor lombar inespecífica →
  // "Dor lombar" pré-selecionada). O usuário pode trocar na etapa 4.
  React.useEffect(() => {
    if (!rule?.restricaoSugerida) return;
    setAnswers((a) =>
      a.restricoes.length === 0 ? { ...a, restricoes: [criarRestricao(rule.restricaoSugerida!)] } : a,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rule?.slug]);

  // Plano composto: modalidades como base da semana (jornada do grupo ou
  // emagrecimento) + exercícios de força como complemento.
  const modRecs = React.useMemo<ModalidadeRec[]>(
    () =>
      recommendModalidades({
        answers,
        grupo: grupoLocked ? undefined : grupo,
        faseObj: grupoLocked ? undefined : faseObj,
      }),
    [answers, grupo, faseObj, grupoLocked],
  );

  // Prontuário de Decisão: snapshot completo do raciocínio (Motor RCD)
  const gerarProntuario = React.useCallback(
    () =>
      results
        ? montarProntuario({
            results,
            series: seriesSugerida(answers.objetivo),
            rule,
            liberacao: liberacaoDoDia,
            modalidades: modRecs,
            parametros:
              faseObj?.parametros ??
              (answers.objetivo === "Emagrecimento" ? ["p-rpe", "p-fala", "p-adesao", "p-volume"] : ["p-rpe", "p-dor"]),
          })
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [results, answers, rule, liberacaoDoDia, faseObj],
  );

  const salvarPrescricao = () => {
    if (!aluno || !results) return;
    marcarAtivacao("primeiroSalvo");
    const presc: Prescricao = {
      id: uid(),
      alunoId: aluno.id,
      data: Date.now(),
      titulo: grupo ? `${grupo.rotuloAluno} · Fase ${fase}` : `${answers.objetivo} · ${answers.grupoMuscular}`,
      answers,
      prontuario: gerarProntuario() ?? undefined,
      itens: results.slice(0, 3).map((r) => ({
        slug: r.exercise.slug,
        score: r.score,
        series: seriesSugerida(answers.objetivo),
      })),
      status: "ativa",
      grupoEspecial: grupo?.slug,
      modalidadePrincipal: faseObj?.modalidades[0] ?? modRecs[0]?.modalidade.id,
      modalidadesSecundarias: faseObj?.modalidades.slice(1) ?? modRecs.slice(1).map((r) => r.modalidade.id),
      faseJornada: grupo ? fase : undefined,
      parametrosControle:
        faseObj?.parametros ??
        (answers.objetivo === "Emagrecimento" ? ["p-rpe", "p-fala", "p-adesao", "p-volume"] : undefined),
      criteriosProgressao: faseObj?.criteriosAvancar,
      criteriosRegressao: faseObj?.criteriosRegredir,
      raciocinio: faseObj?.justificativa,
    };
    addPrescricao(presc);
    addActivity(`Prescrição salva para ${aluno.nome}`);
    // Aluno com plano ativo: em vez de só voltar, oferece levar os exercícios para as
    // sessões do plano (o tubo). Sem plano ativo, o comportamento é o de sempre.
    const planoAtivo = planos.find((p) => p.alunoId === aluno.id && p.status === "ativo");
    if (planoAtivo) {
      setAplicarDe({ presc, plano: planoAtivo });
      return;
    }
    toast(`Prescrição salva no perfil de ${aluno.nome}`);
    navigate(`/alunos/${aluno.id}`, { state: { prescricaoSalva: true } });
  };

  // Exporta o PRONTUÁRIO DE DECISÃO direto da tela de resultados.
  const exportarPDF = () => {
    if (!aluno || !results) return;
    const prontuario = gerarProntuario();
    if (!prontuario) return;
    exportProntuarioPDF({
      aluno,
      profissional: nome,
      cref,
      marca: marcaDoUsuario(usuario),
      prontuario,
      presc: {
        id: uid(),
        alunoId: aluno.id,
        data: Date.now(),
        titulo: grupo ? `${grupo.rotuloAluno} · Fase ${fase}` : `${answers.objetivo} · ${answers.grupoMuscular}`,
        answers,
        itens: results.slice(0, 3).map((r) => ({
          slug: r.exercise.slug,
          score: r.score,
          series: seriesSugerida(answers.objetivo),
        })),
        status: "ativa",
        grupoEspecial: grupo?.slug,
        modalidadePrincipal: faseObj?.modalidades[0] ?? modRecs[0]?.modalidade.id,
        faseJornada: grupo ? fase : undefined,
        parametrosControle:
          faseObj?.parametros ??
          (answers.objetivo === "Emagrecimento" ? ["p-rpe", "p-fala", "p-adesao", "p-volume"] : undefined),
        criteriosProgressao: faseObj?.criteriosAvancar,
        raciocinio: faseObj?.justificativa,
      },
    });
  };

  const gerar = () => {
    addActivity(`Prescrição: ${answers.grupoMuscular}`);
    const rank = rankExercises(exercises, answers, rule);
    if (!rank.length) return;
    setResults(rank);
    setCompare([rank[0].exercise.slug]);
    setContextoAlterado(false);
    marcarAtivacao("primeiroResultado");
  };

  // Volta ao wizard PRESERVANDO as respostas (para ajustar só uma variável).
  const ajustarRespostas = () => {
    setResults(null);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div>
        {/* Vim de um aluno: caminho de volta sempre visível (não fica perdido). */}
        {aluno && (
          <Link
            to={`/alunos/${aluno.id}`}
            className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-ink-2 hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para {aluno.nome}
          </Link>
        )}
        <SectionHeader
          eyebrow="Assistente de decisão"
          icon={<Navigation className="h-3 w-3" />}
          title="Prescrever exercício"
          subtitle="Diga para quem e receba exercícios ranqueados: cada decisão documentada com o porquê."
          right={<SeloRCD compacto />}
        />
      </div>

      {/* Onboarding "Primeiro Caso Real": o gatilho de compra é situacional */}
      {primeiroCaso && !results && (
        <Card tone="primary" className="flex flex-wrap items-center gap-3 p-4">
          <Sparkles className="h-5 w-5 shrink-0 text-primary" />
          <p className="min-w-0 flex-1 text-sm text-ink-2">
            <span className="font-semibold text-ink">Seu primeiro caso real.</span> Confirme o
            perfil abaixo (ou pule direto), veja as recomendações documentadas e abra o
            prontuário da decisão, em menos de 10 minutos.
          </p>
        </Card>
      )}

      {/* Mapa do fluxo: onde estou, o que falta */}
      <FlowSteps atual={results ? 3 : alunoId || grupoSlug ? 2 : 1} />

      {/* Passo 0 — Para quem? */}
      <ContextoCard
        alunos={alunos}
        alunoId={alunoId}
        onAluno={onAluno}
        grupoSlug={grupoSlug}
        setGrupoSlug={mudarGrupo}
        condicoesExtras={condicoesExtras}
        toggleCondicaoExtra={alternarCondicaoExtra}
        fase={fase}
        setFase={mudarFase}
        unlocked={unlocked}
        faixaEtaria={faixaEtaria}
        setFaixaEtaria={setFaixaEtaria}
      />

      {/* Orientação por faixa etária (só na prescrição geral) */}
      {!aluno && faixaEtaria && <FaixaEtariaCard id={faixaEtaria} />}

      {/* Contexto clínico-funcional do aluno: a avaliação registrada alimenta a decisão */}
      {aluno && ultimaAval && (
        <Card variant="soft" className="flex flex-wrap items-center gap-x-2 gap-y-1.5 p-3 text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-3">Última avaliação</span>
          {/* Cada medida como token rotulado: o número carrega o próprio nome e o
              par sobrevive à quebra de linha, sem virar uma fila de valores soltos. */}
          {ultimaAval.medidas.peso != null && <TokenRotulado label="Peso" value={`${ultimaAval.medidas.peso} kg`} />}
          {ultimaAval.medidas.percentualGordura != null && (
            <TokenRotulado label="Gordura" value={`${ultimaAval.medidas.percentualGordura}%`} />
          )}
          {ultimaAval.dorEscala != null && (
            <TokenRotulado label="Dor" value={`${ultimaAval.dorEscala}/10`} tone={ultimaAval.dorEscala >= 4 ? "warning" : "neutral"} />
          )}
          <TokenRotulado
            label="Registrada"
            value={`há ${Math.max(0, Math.round((Date.now() - ultimaAval.data) / 86_400_000))} dias`}
          />
          {reavaliacaoVencida && (
            <Link to={`/alunos/${aluno.id}?avaliar=1`} className="font-semibold text-warning hover:underline">
              Reavaliação vencida: registrar agora
            </Link>
          )}
          {ultimaAval.dorEscala != null && ultimaAval.dorEscala >= 4 && (
            <span className="basis-full text-xs text-ink-2">
              Dor {ultimaAval.dorEscala}/10 na última avaliação: considere o Semáforo do dia antes de
              prescrever e ajuste amplitude e carga à tolerância.
            </span>
          )}
        </Card>
      )}
      {aluno && !ultimaAval && (
        <Card variant="soft" className="flex flex-wrap items-center gap-3 p-3 text-sm">
          <span className="text-ink-2">
            Sem avaliação registrada para {aluno.nome}: a decisão fica mais forte com medidas de base.
          </span>
          <Link to={`/alunos/${aluno.id}?avaliar=1`} className="font-semibold text-primary hover:underline">
            Registrar avaliação
          </Link>
        </Card>
      )}

      {contextoAlterado && !results && (
        <Card tone="warning" className="flex flex-wrap items-center gap-3 p-4">
          <Info className="h-5 w-5 shrink-0 text-warning" />
          <p className="min-w-0 flex-1 text-sm text-ink-2">
            <span className="font-semibold text-ink">Contexto alterado.</span> As recomendações
            anteriores valiam para outro perfil e foram descartadas. Revise as etapas abaixo e gere
            novamente para este contexto.
          </p>
        </Card>
      )}

      {/* Foco agora — a decisão rápida, inline (quando há grupo em contexto) */}
      {grupo && faseObj && !grupoLocked && (
        <FocoAgora
          grupo={grupo}
          faseObj={faseObj}
          fase={fase}
          liberacao={liberacaoDoDia}
          contexto={{ alunoNome: aluno?.nome, alunoId: aluno?.id, objetivo: answers.objetivo }}
        />
      )}
      {grupo && grupoLocked && <JornadaLockedNote grupo={grupo} />}

      {!results ? (
        <Wizard
          step={step}
          setStep={setStep}
          answers={answers}
          setAnswers={setAnswers}
          onFinish={gerar}
          aluno={aluno}
          rule={rule}
        />
      ) : (
        <Results
          answers={answers}
          results={results}
          onRefazer={ajustarRespostas}
          onJustify={setJustify}
          compare={compare}
          setCompare={setCompare}
          alunoNome={aluno?.nome}
          alunoId={aluno?.id}
          planoAtivoId={aluno ? planos.find((p) => p.alunoId === aluno.id && p.status === "ativo")?.id : undefined}
          onSalvar={aluno ? salvarPrescricao : undefined}
          onExportar={aluno ? exportarPDF : undefined}
          podeExportar={unlocked}
          modRecs={modRecs}
          grupoNome={grupoLocked ? undefined : grupo?.nome}
          faseNum={grupoLocked ? undefined : grupo ? fase : undefined}
          faseJustificativa={grupoLocked ? undefined : faseObj?.justificativa}
          onProntuario={() => {
            const p = gerarProntuario();
            if (p) setProntuarioAberto(p);
          }}
        />
      )}

      {aplicarDe && (
        <AplicarNoTreinoDialog
          prescricao={aplicarDe.presc}
          plano={aplicarDe.plano}
          execucoes={execucoes.filter((e) => e.alunoId === aplicarDe.plano.alunoId)}
          dataDaPrescricao={(pid) => {
            const p = prescricoes.find((x) => x.id === pid);
            return p ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(p.data)) : undefined;
          }}
          onDecidirDepois={() => {
            const id = aplicarDe.plano.alunoId;
            setAplicarDe(null);
            toast("Prescrição salva. Você pode aplicar no treino depois, pela linha da prescrição.");
            navigate(`/alunos/${id}`, { state: { prescricaoSalva: true } });
          }}
          onAplicar={(planoAtualizado, resumo) => {
            updatePlano(planoAtualizado.id, planoAtualizado);
            const id = planoAtualizado.alunoId;
            setAplicarDe(null);
            navigate(`/alunos/${id}`, { state: { aplicado: resumo } });
          }}
        />
      )}
      {justify && <JustifyDialog rec={justify} onClose={() => setJustify(null)} />}
      {prontuarioAberto && (
        <ProntuarioView
          prontuario={prontuarioAberto}
          titulo={
            grupo ? `${grupo.nome} · Fase ${fase}` : `${answers.objetivo} · ${answers.grupoMuscular}`
          }
          onExportar={aluno ? exportarPDF : undefined}
          podeExportar={unlocked}
          onClose={() => setProntuarioAberto(null)}
        />
      )}

      <p className="pt-2 text-xs text-ink-3">
        Conteúdo educacional; não substitui avaliação profissional individualizada nem prescrição
        clínica.
      </p>
    </div>
  );
}

/* ------------------------- Mapa do fluxo (stepper) ------------------------ */
// Torna o macro-caminho visível: 1 Para quem → 2 Perfil → 3 Recomendações.
function FlowSteps({ atual }: { atual: 1 | 2 | 3 }) {
  const steps = ["Para quem?", "Perfil de treino", "Recomendações"];
  return (
    <ol aria-label="Etapas da prescrição" className="flex flex-wrap items-center gap-x-1 gap-y-2">
      {steps.map((label, i) => {
        const n = (i + 1) as 1 | 2 | 3;
        const done = n < atual;
        const current = n === atual;
        return (
          <li key={label} className="flex items-center gap-1">
            <span
              aria-current={current ? "step" : undefined}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                current ? "bg-primary-tint text-primary" : done ? "text-ink-2" : "text-ink-3",
              )}
            >
              {done ? (
                <Check className="h-3.5 w-3.5 text-success" />
              ) : (
                <span
                  className={cn(
                    "tabular grid h-4 w-4 place-items-center rounded-full text-2xs font-bold",
                    current ? "bg-primary text-on-primary" : "bg-surface-soft text-ink-3",
                  )}
                >
                  {n}
                </span>
              )}
              {label}
            </span>
            {i < steps.length - 1 && <ArrowRight aria-hidden className="h-3.5 w-3.5 text-ink-3/60" />}
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------ Passo 0 / contexto ------------------------ */

function ContextoCard({
  alunos,
  alunoId,
  onAluno,
  grupoSlug,
  setGrupoSlug,
  condicoesExtras,
  toggleCondicaoExtra,
  fase,
  setFase,
  unlocked,
  faixaEtaria,
  setFaixaEtaria,
}: {
  alunos: { id: string; nome: string }[];
  alunoId: string;
  onAluno: (id: string) => void;
  grupoSlug: string;
  setGrupoSlug: (s: string) => void;
  condicoesExtras: string[];
  toggleCondicaoExtra: (slug: string) => void;
  fase: number;
  setFase: (n: number) => void;
  unlocked: boolean;
  faixaEtaria: string;
  setFaixaEtaria: (s: string) => void;
}) {
  const [trocando, setTrocando] = React.useState(false);
  const alunoNome = alunos.find((a) => a.id === alunoId)?.nome;
  const temGrupo = grupoSlug !== "";
  const prescricaoGeral = alunoId === "";
  // Nome e foco de cada fase vêm da própria condição: o seletor deixa de ser "1,2,3,4" sem sentido.
  const fasesDoGrupo = (temGrupo ? getSpecialGroup(grupoSlug)?.fases : undefined) ?? [];
  const faseAtualObj = fasesDoGrupo[fase - 1];
  const grupoNome = specialGroups.find((g) => g.slug === grupoSlug)?.nome;
  // O que já está definido aparece no resumo, sem precisar abrir os ajustes.
  const contextoResumo = [
    grupoNome ? `${grupoNome}, Fase ${fase}` : null,
    prescricaoGeral && faixaEtaria ? getFaixaEtaria(faixaEtaria)?.label : null,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <Card className="p-5">
      {alunoId && !trocando ? (
        /* Já vim de um aluno: mostra o contexto, não um seletor que convida a re-escolher. */
        <div className="flex flex-wrap items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-tint text-primary">
            <UserCheck className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="text-xs text-ink-3">Prescrevendo para</div>
            <div className="font-display font-bold text-ink">{alunoNome}</div>
          </div>
          <button
            type="button"
            onClick={() => setTrocando(true)}
            className="ml-auto text-sm font-semibold text-primary hover:underline"
          >
            Trocar aluno
          </button>
        </div>
      ) : (
        <>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-tint text-primary">
              <UserCheck className="h-4 w-4" />
            </span>
            <h2 className="font-display text-base font-bold text-ink">Para quem?</h2>
            <span className="text-xs text-ink-3">Escolha o aluno. Sem aluno, é uma prescrição geral.</span>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">Aluno</span>
            <select
              value={alunoId}
              onChange={(e) => {
                onAluno(e.target.value);
                setTrocando(false);
              }}
              className="input"
            >
              <option value="">Prescrição geral (sem aluno)</option>
              {alunos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome}
                </option>
              ))}
            </select>
          </label>
        </>
      )}

      {/* Grupo, fase e idade são herdados do aluno; ficam num ajuste opcional para
          não competir com a única escolha que importa aqui (o aluno). */}
      <details className="mt-4 rounded-control border border-border bg-surface-soft">
        <summary className="flex cursor-pointer select-none items-center gap-2 p-3 text-sm font-semibold text-ink-2">
          <SlidersHorizontal className="h-4 w-4 text-ink-3" />
          Ajustar contexto (opcional)
          {contextoResumo && <span className="ml-1 font-normal text-ink-3">· {contextoResumo}</span>}
        </summary>
        <div className="border-t border-border p-3">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink">Grupo / condição</span>
              <select value={grupoSlug} onChange={(e) => setGrupoSlug(e.target.value)} className="input">
                <option value="">Nenhum (geral)</option>
                {specialGroups.map((g) => (
                  <option key={g.slug} value={g.slug}>
                    {g.nome}
                    {g.premium && !unlocked ? " (Premium)" : ""}
                  </option>
                ))}
              </select>
            </label>
            <div>
              <span className="mb-1.5 block text-sm font-semibold text-ink">Fase da jornada</span>
              <div role="group" aria-label="Fase da jornada" className="flex gap-1.5">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    onClick={() => temGrupo && setFase(n)}
                    title={fasesDoGrupo[n - 1]?.nome}
                    aria-label={fasesDoGrupo[n - 1] ? `Fase ${n}: ${fasesDoGrupo[n - 1].nome}` : `Fase ${n}`}
                    aria-pressed={n === fase}
                    disabled={!temGrupo}
                    className={cn(
                      "h-11 flex-1 rounded-control text-sm font-bold transition-colors disabled:opacity-40",
                      n === fase && temGrupo
                        ? "gradient-brand text-white"
                        : "bg-surface-soft text-ink-2 hover:bg-primary-tint disabled:hover:bg-surface-soft",
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
              {/* O número sozinho não diz nada: mostra o que a fase escolhida significa. */}
              {temGrupo && faseAtualObj ? (
                <p className="mt-1.5 text-xs leading-snug text-ink-2">
                  <span className="font-semibold text-ink">
                    Fase {fase}, {faseAtualObj.nome}.
                  </span>{" "}
                  {faseAtualObj.foco}{" "}
                  <span className="text-ink-3">A fase avança por critério atingido, não por tempo de treino.</span>
                </p>
              ) : (
                <p className="mt-1.5 text-xs text-ink-3">Escolha uma condição para habilitar a jornada.</p>
              )}
            </div>
          </div>

          {/* Condições associadas: some cuidados de várias condições numa prescrição. */}
          {temGrupo && (
            <div className="mt-4">
              <span className="mb-1 block text-sm font-semibold text-ink">Condições associadas (opcional)</span>
              <p className="mb-2 text-xs text-ink-3">
                Some outras condições do aluno. Os cuidados de todas se combinam na prescrição; a condição principal continua guiando a jornada.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {specialGroups
                  .filter((g) => g.slug !== grupoSlug)
                  .map((g) => {
                    const on = condicoesExtras.includes(g.slug);
                    const lock = g.premium && !unlocked;
                    return (
                      <button
                        key={g.slug}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleCondicaoExtra(g.slug)}
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors",
                          on ? "border-primary bg-primary-tint text-primary" : "border-border text-ink-2 hover:bg-surface-soft",
                        )}
                      >
                        {on ? "✓ " : "+ "}
                        {g.nome}
                        {lock ? " (Premium)" : ""}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Faixa etária: só na prescrição geral (sem aluno). */}
          {prescricaoGeral && (
            <label className="mt-4 block">
              <span className="mb-1.5 block text-sm font-semibold text-ink">Faixa etária</span>
              <select value={faixaEtaria} onChange={(e) => setFaixaEtaria(e.target.value)} className="input">
                <option value="">Todas as idades</option>
                {FAIXAS_ETARIAS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label} ({f.faixa})
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-xs text-ink-3">
                Sem aluno selecionado. A idade ajusta cuidados e ênfases; com aluno, a idade dele já é usada.
              </span>
            </label>
          )}
        </div>
      </details>
    </Card>
  );
}

/** Orientação prudente por faixa etária na prescrição geral. */
function FaixaEtariaCard({ id }: { id: string }) {
  const f = getFaixaEtaria(id);
  if (!f) return null;
  return (
    <Card tone="primary" className="p-5">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-primary">
          <Users className="h-4 w-4" />
        </span>
        <h2 className="font-display text-base font-bold text-ink">
          Faixa etária: {f.label} <span className="font-normal text-ink-3">({f.faixa})</span>
        </h2>
      </div>
      <p className="text-sm text-ink-2">
        <span className="font-semibold text-ink">Foco. </span>
        {f.foco}
      </p>
      <ul className="mt-2 space-y-1.5">
        {f.orientacoes.map((o) => (
          <li key={o} className="flex items-start gap-2 text-sm text-ink-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            {o}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-ink-3">
        Orientação geral por faixa etária; a decisão final considera o contexto individual do aluno.
      </p>
    </Card>
  );
}

/* Foco agora — resumo de decisão condensado (substitui a antiga Decisão rápida
   e o painel de jornada gigante que existia nos resultados). */
function FocoAgora({
  grupo,
  faseObj,
  fase,
  liberacao,
  contexto,
}: {
  grupo: SpecialGroup;
  faseObj: JourneyPhase;
  fase: number;
  /** liberação do Semáforo registrada hoje (para não repetir o CTA e dar o fecho) */
  liberacao?: { resultado: string };
  contexto?: { alunoNome?: string; alunoId?: string; objetivo?: string };
}) {
  const semaforoHref = `/semaforo?grupo=${grupo.slug}&fase=${fase}${
    contexto?.alunoId ? `&aluno=${contexto.alunoId}` : ""
  }`;
  return (
    <Card className="border-l-4 border-l-primary p-5 md:p-6">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-tint text-primary">
          <HeartPulse className="h-4 w-4" />
        </span>
        <h2 className="font-display text-xl font-bold text-ink">{grupo.nome}</h2>
        <Pill tone="primary">Fase {fase} · {faseObj.nome}</Pill>
        <Pill tone={complexidadeTone[grupo.complexidade]}>{grupo.complexidade}</Pill>
        <Link
          to={`/special-groups/${grupo.slug}?fase=${fase}${contexto?.alunoId ? `&aluno=${contexto.alunoId}` : ""}&origem=gps`}
          className="ml-auto text-sm font-semibold text-primary hover:underline"
        >
          Ver jornada completa
        </Link>
      </div>

      <div className="rounded-xl bg-primary-tint p-4">
        <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
          <Target className="h-3.5 w-3.5" /> Objetivo desta fase
        </div>
        <p className="text-base font-medium text-ink">{faseObj.objetivo}</p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border p-3">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-3">
            <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Avançar quando
          </div>
          <ul className="space-y-1 text-sm text-ink">
            {faseObj.criteriosAvancar.slice(0, 2).map((c) => (
              <li key={c} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                {c}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-border p-3">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-3">
            <ShieldAlert className="h-3.5 w-3.5 text-warning" /> Cautela principal
          </div>
          <p className="text-sm text-ink">{grupo.riscosCautelas[0]}</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-surface-soft p-3">
        <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-3">
          <Activity className="h-3.5 w-3.5" /> Monitore principalmente
          <span className="font-normal normal-case tracking-normal text-ink-3">
            toque num parâmetro para ver como aplicar
          </span>
        </div>
        <ParametroPills ids={faseObj.parametros} contexto={contexto} />
      </div>

      <div className="mt-4">
        {liberacao ? (
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone={liberacao.resultado === "vermelho" ? "warning" : "success"} icon={<ShieldCheck className="h-3 w-3" />}>
              Semáforo de hoje:{" "}
              {liberacao.resultado === "verde"
                ? "liberado"
                : liberacao.resultado === "amarelo"
                  ? "liberado com ajuste"
                  : "não liberado"}
            </Pill>
            <Link to={semaforoHref} className="text-sm font-semibold text-primary hover:underline">
              Refazer o semáforo
            </Link>
          </div>
        ) : (
          <Link to={semaforoHref} className={buttonClasses("secondary", "sm")}>
            <ShieldAlert className="h-4 w-4" /> Semáforo de hoje: libere a sessão em 30s
          </Link>
        )}
      </div>

      <p className="mt-3 text-xs text-ink-3">{AVISO_SEGURANCA}</p>
    </Card>
  );
}

function JornadaLockedNote({ grupo }: { grupo: SpecialGroup }) {
  return (
    <Card tone="warning" className="flex flex-wrap items-center gap-3 p-4">
      <ShieldAlert className="h-5 w-5 shrink-0 text-warning" />
      <p className="min-w-0 flex-1 text-sm text-ink-2">
        A jornada de <span className="font-semibold text-ink">{grupo.nome}</span> é do plano
        Profissional. Você ainda pode gerar uma prescrição geral abaixo.
      </p>
      <Link to="/pricing" className={buttonClasses("secondary", "sm")}>
        <Crown className="h-4 w-4" /> Assinar
      </Link>
    </Card>
  );
}

/* --------------------------------- Wizard -------------------------------- */

function Wizard({
  step,
  setStep,
  answers,
  setAnswers,
  onFinish,
  aluno,
  rule,
}: {
  step: number;
  setStep: (n: number) => void;
  answers: GpsAnswers;
  setAnswers: React.Dispatch<React.SetStateAction<GpsAnswers>>;
  onFinish: () => void;
  aluno?: { nome: string };
  rule?: GroupGpsRule;
}) {
  const emagrecimento = answers.objetivo === "Emagrecimento";
  const STEP_LABELS = stepLabels(emagrecimento);
  const pct = Math.round(((step + 1) / 5) * 100);
  const last = step === 4;
  // Gating de segurança das restrições (etapa 4): cirurgia sem liberação ou lesão com
  // dor importante bloqueiam a geração automática. E o botão só avança da etapa de
  // restrições com ao menos uma seleção e os campos condicionais obrigatórios preenchidos.
  const seguranca = avaliarSeguranca(answers.restricoes);
  const restricaoStepOk =
    answers.restricoes.length > 0 && !condicionaisPendentes(answers.restricoes) && !seguranca.bloqueado;
  const geracaoBloqueada = answers.equipamentos.length === 0 || seguranca.bloqueado;
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const first = React.useRef(true);
  React.useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  return (
    <Card className="p-6 md:p-8">
      <div className="mb-1 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-ink-3">
        <span aria-live="polite">Etapa {step + 1} de 5</span>
        <span className="tabular">{pct}%</span>
      </div>
      <Progress value={pct} className="mb-6" />

      <h2 ref={headingRef} tabIndex={-1} className="font-display text-2xl font-bold text-ink focus-visible:outline-none">
        {STEP_LABELS[step]}
      </h2>
      <p className="mt-1 text-sm text-ink-2">
        {aluno
          ? `Perfil pré-preenchido a partir de ${aluno.nome}; ajuste se precisar.`
          : "Defina o perfil que orienta o ranqueamento."}
      </p>

      <div className="mt-6">
        {step === 0 && (
          <Choices
            ariaLabel={STEP_LABELS[0]}
            options={OBJETIVOS}
            value={answers.objetivo}
            onChange={(v) =>
              setAnswers((a) => ({
                ...a,
                objetivo: v as GpsAnswers["objetivo"],
                // Emagrecimento trabalha o corpo todo; a etapa 2 vira prioridade física.
                ...(v === "Emagrecimento"
                  ? { grupoMuscular: "Corpo todo", prioridade: a.prioridade ?? "Cardio + força (misto)" }
                  : {}),
              }))
            }
          />
        )}
        {step === 1 &&
          (emagrecimento ? (
            <Choices
              ariaLabel={STEP_LABELS[1]}
              options={PRIORIDADES}
              value={answers.prioridade ?? "Cardio + força (misto)"}
              onChange={(v) =>
                setAnswers((a) => ({ ...a, prioridade: v as GpsPrioridade, grupoMuscular: "Corpo todo" }))
              }
            />
          ) : (
            <Choices
              ariaLabel={STEP_LABELS[1]}
              options={[...GRUPOS_MUSCULARES]}
              value={answers.grupoMuscular}
              onChange={(v) => setAnswers((a) => ({ ...a, grupoMuscular: v }))}
            />
          ))}
        {step === 2 && (
          <Choices
            ariaLabel={STEP_LABELS[2]}
            options={NIVEIS}
            value={answers.nivel}
            onChange={(v) => setAnswers((a) => ({ ...a, nivel: v as Nivel }))}
          />
        )}
        {step === 3 && (
          <div className="space-y-4">
            {rule && (
              <div className="rounded-xl border border-primary/25 bg-primary-tint p-4">
                <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                  <ShieldAlert className="h-3.5 w-3.5" /> Já considerado pelo grupo: {rule.nome}
                </div>
                <ul className="space-y-1 text-sm text-ink">
                  {rule.cuidados.map((c) => (
                    <li key={c} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {c}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-ink-2">
                  Essas cautelas são aplicadas automaticamente no ranqueamento (aparecem na
                  justificativa). Abaixo, marque restrições musculoesqueléticas adicionais.
                </p>
              </div>
            )}
            {/* Seleção estruturada: 30 restrições em 4 grupos, com perguntas condicionais.
                O aluno com joelho E ombro tem os dois considerados; por exercício vale a
                restrição mais estrita, e a incompatibilidade clara exclui do ranking. */}
            <RestricoesSelector
              value={answers.restricoes}
              onChange={(next) => setAnswers((a) => ({ ...a, restricoes: next }))}
              observacao={answers.observacaoRestricoes}
              onObservacao={(v) => setAnswers((a) => ({ ...a, observacaoRestricoes: v }))}
            />
          </div>
        )}
        {step === 4 && (
          <MultiChoices
            ariaLabel={STEP_LABELS[4]}
            options={[...EQUIPAMENTOS]}
            values={answers.equipamentos}
            onToggle={(v) =>
              setAnswers((a) => ({
                ...a,
                equipamentos: a.equipamentos.includes(v)
                  ? a.equipamentos.filter((x) => x !== v)
                  : [...a.equipamentos, v],
              }))
            }
          />
        )}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className={buttonClasses("ghost")}
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        {last ? (
          <button onClick={onFinish} disabled={geracaoBloqueada} className={buttonClasses("primary")}>
            <Sparkles className="h-4 w-4" /> Ver exercícios recomendados
          </button>
        ) : (
          <button
            onClick={() => setStep(step + 1)}
            disabled={step === 3 && !restricaoStepOk}
            className={buttonClasses("primary")}
          >
            Próximo <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {!last && (
        <button
          onClick={onFinish}
          disabled={geracaoBloqueada}
          className="mt-3 block w-full text-right text-xs font-medium text-ink-3 hover:text-ink-2 disabled:opacity-50"
        >
          Pular para as recomendações →
        </button>
      )}
    </Card>
  );
}

function Choices({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  ariaLabel: string;
}) {
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const onKeyDown = (e: React.KeyboardEvent) => {
    const i = options.indexOf(value);
    if (i < 0) return;
    let next = i;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (i + 1) % options.length;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = (i - 1 + options.length) % options.length;
    else return;
    e.preventDefault();
    onChange(options[next]);
    refs.current[next]?.focus();
  };
  return (
    <div role="radiogroup" aria-label={ariaLabel} onKeyDown={onKeyDown} className="grid gap-3 sm:grid-cols-2">
      {options.map((o, idx) => {
        const selected = o === value;
        const desc = descricaoOpcao(o);
        return (
          <button
            key={o}
            ref={(el) => (refs.current[idx] = el)}
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(o)}
            className={cn(
              "flex items-start gap-3 rounded-control border px-4 py-3.5 text-left text-sm font-medium transition-colors",
              selected
                ? "border-primary bg-primary-tint text-primary"
                : "border-border bg-surface text-ink hover:bg-surface-soft",
            )}
          >
            <span
              className={cn(
                "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border-2",
                selected ? "border-primary bg-primary text-on-primary" : "border-ink-3",
              )}
            >
              {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
            </span>
            <span className="min-w-0">
              {o}
              {desc && (
                <span className={cn("mt-0.5 block text-xs font-normal leading-snug", selected ? "text-primary/80" : "text-ink-3")}>
                  {desc}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function MultiChoices({
  options,
  values,
  onToggle,
  ariaLabel,
}: {
  options: string[];
  values: string[];
  onToggle: (v: string) => void;
  ariaLabel: string;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className="grid gap-3 sm:grid-cols-2">
      {options.map((o) => {
        const selected = values.includes(o);
        const desc = descricaoOpcao(o);
        return (
          <button
            key={o}
            aria-pressed={selected}
            onClick={() => onToggle(o)}
            className={cn(
              "flex items-start gap-3 rounded-control border px-4 py-3.5 text-left text-sm font-medium transition-colors",
              selected
                ? "border-primary bg-primary-tint text-primary"
                : "border-border bg-surface text-ink hover:bg-surface-soft",
            )}
          >
            <span
              className={cn(
                "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-2",
                selected ? "border-primary bg-primary text-on-primary" : "border-ink-3",
              )}
            >
              {selected && <Check className="h-3.5 w-3.5" />}
            </span>
            <span className="min-w-0">
              {o}
              {desc && (
                <span className={cn("mt-0.5 block text-xs font-normal leading-snug", selected ? "text-primary/80" : "text-ink-3")}>
                  {desc}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------- Results -------------------------------- */

function Results({
  answers,
  results,
  onRefazer,
  onJustify,
  compare,
  setCompare,
  alunoNome,
  alunoId,
  planoAtivoId,
  onSalvar,
  onExportar,
  podeExportar,
  onProntuario,
  modRecs,
  grupoNome,
  faseNum,
  faseJustificativa,
}: {
  answers: GpsAnswers;
  results: Recommendation[];
  onRefazer: () => void;
  onJustify: (r: Recommendation) => void;
  compare: string[];
  setCompare: React.Dispatch<React.SetStateAction<string[]>>;
  alunoNome?: string;
  alunoId?: string;
  /** plano de treino já ativo do aluno, quando houver */
  planoAtivoId?: string;
  onSalvar?: () => void;
  onExportar?: () => void;
  podeExportar?: boolean;
  onProntuario: () => void;
  modRecs: ModalidadeRec[];
  grupoNome?: string;
  faseNum?: number;
  faseJustificativa?: string;
}) {
  const best = results[0];
  const others = results.slice(1);
  const composto = modRecs.length > 0;
  const [verTodas, setVerTodas] = React.useState(false);
  // vínculo equipamento -> exercício visível: separa o que dá para prescrever com o
  // que o aluno tem, do que exigiria comprar/ir a outro lugar.
  const disponiveis = others.filter((r) => r.equipDisponivel);
  const foraEquip = others.filter((r) => !r.equipDisponivel);
  const alvoEspecifico = answers.grupoMuscular !== "Corpo todo" && answers.objetivo !== "Emagrecimento";
  const semAlvoDisponivel =
    alvoEspecifico && !results.some((r) => r.grupoCompativel && r.equipDisponivel);
  const disponiveisVisiveis = verTodas ? disponiveis : disponiveis.slice(0, 6);
  const toggleCompare = (slug: string) =>
    setCompare((c) =>
      c.includes(slug) ? c.filter((x) => x !== slug) : c.length < 3 ? [...c, slug] : c,
    );

  const renderOption = (r: Recommendation) => {
    const inCompare = compare.includes(r.exercise.slug);
    return (
      <Card key={r.exercise.slug} className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-display font-bold text-ink">{r.exercise.nome}</h4>
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <Pill tone="neutral">{r.exercise.grupoMuscular}</Pill>
              <Pill tone={r.equipDisponivel ? "success" : "warning"}>{r.exercise.equipamento}</Pill>
            </div>
          </div>
          <div className="text-right">
            <div className="tabular font-display text-xl font-bold text-primary">
              {/* uma casa decimal desempata visualmente exercicios que arredondariam para o mesmo inteiro (M4) */}
              {r.scoreExato.toFixed(1)}
              <span className="text-xs font-semibold text-ink-3">/100</span>
            </div>
            <div className="text-2xs uppercase text-ink-3">adequação</div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button onClick={() => onJustify(r)} className="text-sm font-semibold text-primary hover:underline">
            Justificativa
          </button>
          <button
            onClick={() => toggleCompare(r.exercise.slug)}
            disabled={!inCompare && compare.length >= 3}
            aria-pressed={inCompare}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors",
              inCompare
                ? "border-primary bg-primary-tint text-primary"
                : !inCompare && compare.length >= 3
                  ? "cursor-not-allowed border-border text-ink-3 opacity-50"
                  : "border-border text-ink-2 hover:bg-surface-soft",
            )}
          >
            {inCompare ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            Comparar
          </button>
          <Link
            to={`/movement-lab/${r.exercise.slug}`}
            className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-ink-2 hover:text-ink"
          >
            Abrir <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {onSalvar && alunoNome ? (
        <Card tone="success" className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <UserCheck className="h-5 w-5 shrink-0 text-success" />
            <div className="min-w-0">
              <div className="font-semibold text-ink">Último passo: concluir a prescrição de {alunoNome}</div>
              <p className="text-sm text-ink-2">
                Salvar registra no perfil do aluno e volta para ele. O PDF com a sua marca é opcional.
              </p>
            </div>
            <div className="ml-auto flex flex-wrap gap-2">
              <button onClick={onSalvar} className={buttonClasses("primary")}>
                <Save className="h-4 w-4" /> Salvar no perfil de {alunoNome}
              </button>
              {podeExportar ? (
                <button onClick={onExportar} className={buttonClasses("secondary", "sm")}>
                  <FileDown className="h-4 w-4" /> Exportar PDF
                </button>
              ) : (
                <Link to="/pricing" className={buttonClasses("secondary", "sm")}>
                  <LockIcon className="h-3.5 w-3.5" /> PDF (Profissional)
                </Link>
              )}
            </div>
          </div>
          {/* Esta tela resolve a sessão. Com plano ativo, salvar oferece levar estes
              exercícios para as sessões dele (o tubo); sem plano, o convite é montar o treino. */}
          {alunoId && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3 text-sm">
              <CalendarRange className="h-4 w-4 shrink-0 text-primary" />
              {planoAtivoId ? (
                <span className="text-ink-2">
                  {alunoNome} já tem um plano ativo. Ao salvar, você pode aplicar estes exercícios nas sessões dele.
                </span>
              ) : (
                <>
                  <span className="text-ink-2">Estes exercícios são a sessão. Para organizar os próximos meses:</span>
                  <Link to={`/prescrever-treino?aluno=${alunoId}`} className="font-semibold text-primary hover:underline">
                    Montar o treino agora
                  </Link>
                </>
              )}
            </div>
          )}
        </Card>
      ) : (
        <Card tone="primary" className="flex flex-wrap items-center gap-3 p-4">
          <Info className="h-5 w-5 shrink-0 text-primary" />
          <p className="min-w-0 flex-1 text-sm text-ink-2">
            <span className="font-semibold text-ink">Prescrição avulsa.</span> Selecione um aluno no
            topo para salvar no perfil e exportar em PDF com sua marca.
          </p>
        </Card>
      )}

      {semAlvoDisponivel && (
        <Card tone="warning" className="flex flex-wrap items-start gap-3 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <p className="min-w-0 flex-1 text-sm text-ink-2">
            <span className="font-semibold text-ink">
              Nenhum exercício de {answers.grupoMuscular} está disponível com os equipamentos marcados.
            </span>{" "}
            As opções abaixo trabalham outros grupos ou exigem um equipamento a mais. Marque outro
            equipamento na etapa 5, ou considere a seção "Exigem equipamento não marcado".
          </p>
        </Card>
      )}

      {/* Suas respostas — o vínculo entre o perfil e o ranking fica explícito */}
      <Card variant="soft" className="flex flex-wrap items-center gap-2 p-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-3">Perfil</span>
        {alunoNome && <Pill tone="success">Para: {alunoNome}</Pill>}
        <Pill tone="primary">{answers.objetivo}</Pill>
        <Pill tone="primary">
          {answers.objetivo === "Emagrecimento" && answers.prioridade ? answers.prioridade : answers.grupoMuscular}
        </Pill>
        <Pill tone="neutral">{answers.nivel}</Pill>
        <Pill tone={answers.restricoes.length === 0 ? "success" : "warning"}>
          {answers.restricoes.length === 0
            ? "Sem restrição"
            : answers.restricoes.map((r) => rotuloRestricao(r.tag)).join(" · ")}
        </Pill>
        <Pill tone="neutral">
          <span title={answers.equipamentos.join(", ")}>
            {answers.equipamentos.length >= EQUIPAMENTOS.length
              ? "Todos os equipamentos"
              : `${answers.equipamentos.length} equipamentos`}
          </span>
        </Pill>
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <button
            onClick={onProntuario}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-analysis hover:underline"
          >
            <FileText className="h-4 w-4" /> Ver prontuário desta decisão
          </button>
          <button onClick={onRefazer} className="inline-flex items-center gap-1 text-sm font-medium text-ink-2 hover:text-ink">
            <ArrowLeft className="h-3.5 w-3.5" /> Ajustar respostas
          </button>
        </div>
      </Card>

      {/* Base da semana — modalidades (plano composto: a musculação isolada não
          é a porta de entrada de todo perfil) */}
      {composto && (
        <Card variant="raised" className="overflow-hidden">
          <div className="bg-analysis px-5 py-2 text-xs font-bold uppercase tracking-wider text-on-analysis">
            <span className="inline-flex items-center gap-1">
              <HeartPulse className="h-3.5 w-3.5" /> Base da semana: modalidades
            </span>
          </div>
          <div className="p-5">
            <p className="mb-4 text-sm text-ink-2">
              {grupoNome
                ? `Neste perfil (${grupoNome}${faseNum ? `, fase ${faseNum}` : ""}), as modalidades abaixo são a base; os exercícios de força entram como complemento.`
                : "Para emagrecimento, a base da semana é o volume nas modalidades abaixo; os exercícios de força entram como complemento para preservar massa magra."}
              {faseJustificativa ? ` ${faseJustificativa}` : ""}
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {modRecs.map((r) => (
                <div key={r.modalidade.id} className="overflow-hidden rounded-xl border border-border">
                  <img
                    src={withBase(modalidadeImagem(r.modalidade.id))}
                    alt=""
                    loading="lazy"
                    className="h-24 w-full object-cover"
                    onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                  />
                  <div className="p-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-display text-sm font-bold text-ink">{r.modalidade.nome}</span>
                      {r.principal && <Pill tone="primary">principal</Pill>}
                      <Pill tone={impactoTone[r.modalidade.impacto]}>impacto {r.modalidade.impacto}</Pill>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-ink-2">{r.motivo}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Melhor recomendação — âncora */}
      <Card variant="raised" className="overflow-hidden">
        <div className="gradient-brand px-5 py-2 text-xs font-bold uppercase tracking-wider text-white">
          <span className="inline-flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5" />
            {composto ? "Força complementar: melhor exercício" : "Melhor recomendação"}
          </span>
        </div>
        <div className="p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="flex flex-col items-center">
              <ScoreRing value={best.score} size={112} label="de 100" />
              <span className="mt-1 text-xs font-semibold text-ink-2">
                Adequação: {adequacaoLabel(best.score)}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-2xl font-bold text-ink">{best.exercise.nome}</h3>
              </div>
              <p className="mt-2 text-ink-2">{best.exercise.resumoPratico}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Pill tone={best.equipDisponivel ? "success" : "warning"} icon={best.equipDisponivel ? <Check className="h-3 w-3" /> : undefined}>
                  {best.exercise.equipamento}{best.equipDisponivel ? " disponível" : " (não marcado)"}
                </Pill>
                {best.reasons.map((r) => (
                  <Pill key={r} tone="primary">
                    {r}
                  </Pill>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => onJustify(best)} className={buttonClasses("primary", "sm")}>
                  <Info className="h-4 w-4" /> Ver justificativa
                </button>
                <Link to={`/movement-lab/${best.exercise.slug}`} className={buttonClasses("outline", "sm")}>
                  Ver no Laboratório <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => toggleCompare(best.exercise.slug)}
                  disabled={!compare.includes(best.exercise.slug) && compare.length >= 3}
                  aria-pressed={compare.includes(best.exercise.slug)}
                  className={cn(
                    buttonClasses(compare.includes(best.exercise.slug) ? "secondary" : "outline", "sm"),
                    !compare.includes(best.exercise.slug) && compare.length >= 3 && "cursor-not-allowed opacity-50",
                  )}
                >
                  {compare.includes(best.exercise.slug) ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  Comparar
                </button>
              </div>
              {best.cautions.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {best.cautions.map((c) => (
                    <li key={c} className="flex gap-2 text-xs text-warning">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-warning" />
                      {c}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* O que a nota significa — evita a leitura errada de "% match" */}
      <p className="text-xs leading-relaxed text-ink-3">
        A <span className="font-semibold text-ink-2">nota de adequação (0–100)</span> mede o quanto cada
        opção atende a <span className="font-semibold text-ink-2">este perfil</span>: objetivo, nível,
        restrição e equipamentos. Notas próximas indicam alternativas igualmente válidas: o desempate
        está nos critérios da <span className="font-semibold text-ink-2">justificativa</span>.
      </p>

      {/* Outras opções COM o equipamento marcado */}
      {disponiveis.length > 0 && (
        <div>
          <h3 className="font-display text-base font-bold text-ink">Outras opções com o equipamento disponível</h3>
          <p className="mb-3 text-xs text-ink-3">
            Tudo aqui pode ser prescrito com o que {alunoNome ?? "o aluno"} já tem.
          </p>
          <div className="grid gap-4 md:grid-cols-2">{disponiveisVisiveis.map(renderOption)}</div>
          {disponiveis.length > 6 && (
            <button
              onClick={() => setVerTodas((v) => !v)}
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              {verTodas ? "Mostrar menos" : `Mostrar mais ${disponiveis.length - 6} opções`}
            </button>
          )}
        </div>
      )}

      {/* Opções que EXIGEM equipamento não marcado (nota limitada a 65) */}
      {foraEquip.length > 0 && (
        <div>
          <h3 className="font-display text-base font-bold text-ink">Exigem equipamento não marcado</h3>
          <p className="mb-3 text-xs text-ink-3">
            Estes exercícios pedem algo fora da lista marcada; a nota fica limitada a 65 até o
            equipamento entrar. Úteis se você puder adaptar o ambiente.
          </p>
          <div className="grid gap-4 md:grid-cols-2">{foraEquip.slice(0, 4).map(renderOption)}</div>
        </div>
      )}

      {/* só os mais recomendados no picker — o pool inteiro viraria um paredão de chips */}
      <Comparador compare={compare} setCompare={setCompare} candidatos={[best, ...others].slice(0, 6)} />
    </div>
  );
}

function Comparador({
  compare,
  setCompare,
  candidatos = [],
}: {
  compare: string[];
  setCompare: React.Dispatch<React.SetStateAction<string[]>>;
  /** recomendações da tela — o painel se basta: dá para escolher aqui mesmo */
  candidatos?: Recommendation[];
}) {
  const selected = compare
    .map((slug) => exercises.find((e) => e.slug === slug))
    .filter(Boolean) as (typeof exercises)[number][];
  // Sem fallback inventado: dado ausente vira `undefined` e a tela diz que falta,
  // igual o motor já fazia. Preencher com 20 ou 30 fazia esta tabela contradizer
  // a justificativa do próprio exercício na tela ao lado.
  const metric = (ex: (typeof exercises)[number], nome: string) =>
    ex.indiceEficiencia.metrics.find((m) => m.nome === nome)?.valor;

  const rows: {
    label: string;
    get: (e: (typeof exercises)[number]) => number | undefined;
    /** nome do músculo daquela linha, quando o valor é relativo a um músculo específico */
    alvo?: (e: (typeof exercises)[number]) => string | undefined;
  }[] = [
    {
      label: "Ativação relativa",
      get: (e) => e.ativacao[0]?.percentual,
      // Cada exercício tem o SEU alvo principal, e o valor é relativo ao próprio
      // músculo. Sem dizer qual é, a linha parecia comparar 95 com 92 quando um é
      // glúteo e o outro é quadríceps.
      alvo: (e) => e.ativacao[0]?.musculo,
    },
    { label: "Índice de eficiência", get: (e) => e.indiceEficiencia.score },
    { label: "Demanda lombar", get: (e) => metric(e, "Demanda lombar") },
    { label: "Complexidade técnica", get: (e) => metric(e, "Complexidade técnica") },
  ];
  const tones = ["primary", "analysis", "cta"] as const;

  return (
    <Card className="p-6">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="font-display text-base font-bold text-ink">Comparar lado a lado</h3>
        <span className="text-xs text-ink-3">{selected.length}/3 selecionados</span>
      </div>
      <p className="mb-3 text-sm text-ink-2">
        Escolha até 3 exercícios recomendados para ver os trade-offs lado a lado.
      </p>

      {/* Seleção AQUI MESMO — o painel não depende de botões em outros cards */}
      {candidatos.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {candidatos.map((c) => {
            const on = compare.includes(c.exercise.slug);
            const full = !on && compare.length >= 3;
            return (
              <button
                key={c.exercise.slug}
                onClick={() =>
                  setCompare((cur) =>
                    cur.includes(c.exercise.slug)
                      ? cur.filter((x) => x !== c.exercise.slug)
                      : cur.length < 3
                        ? [...cur, c.exercise.slug]
                        : cur,
                  )
                }
                aria-disabled={full}
                aria-pressed={on}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors",
                  on
                    ? "border-primary bg-primary-tint text-primary"
                    : full
                      ? "cursor-not-allowed border-border text-ink-3 opacity-50"
                      : "border-border text-ink-2 hover:bg-surface-soft",
                )}
              >
                {on ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                {c.exercise.nome}
              </button>
            );
          })}
        </div>
      )}

      {selected.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-4 text-sm text-ink-3">
          Nenhum exercício selecionado ainda; toque numa opção acima para começar.
        </p>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {selected.map((e, i) => (
              <span
                key={e.slug}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                  i === 0 ? "bg-primary-tint text-primary" : i === 1 ? "bg-analysis-tint text-analysis" : "bg-cta-tint text-cta-text",
                )}
              >
                {e.nome}
                <button onClick={() => setCompare((c) => c.filter((x) => x !== e.slug))} aria-label={`Remover ${e.nome}`}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="space-y-5">
            {rows.map((r) => (
              <div key={r.label}>
                {/* Clicável: abre o que é, a escala, relativo a quê e o que o valor
                    significa na prática. O rótulo sozinho não dizia nada. */}
                <MetricaInfo nome={r.label} valor={r.get(selected[0])} className="mb-1 text-xs font-semibold text-ink-2" />
                <div className="space-y-2">
                  {selected.map((e, i) => {
                    const alvo = r.alvo?.(e);
                    return (
                      <MetricaBar
                        key={e.slug}
                        nome={r.label}
                        valor={r.get(e)}
                        tone={tones[i]}
                        rotuloTexto={alvo ? `${e.nome} · ${alvo}` : e.nome}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

/* ------------------------------ Justificativa ---------------------------- */

function JustifyDialog({ rec, onClose }: { rec: Recommendation; onClose: () => void }) {
  const dialogRef = useDialog<HTMLDivElement>(onClose);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`Justificativa: ${rec.exercise.nome}`}
        className="max-h-modal w-full max-w-lg overflow-auto rounded-card bg-surface p-5 shadow-overlay outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-3">Justificativa</div>
            <h3 className="font-display text-lg font-bold text-ink">{rec.exercise.nome}</h3>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="rounded-md p-2.5 text-ink-3 hover:bg-surface-soft">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mb-3 text-sm text-ink-2">
          Adequação de {rec.score}/100 a este perfil ({adequacaoLabel(rec.score)}). Como cada
          critério pesou no ranqueamento:
        </p>
        <ul className="space-y-2">
          {rec.breakdown.map((b) => {
            const ratio = b.pontosPossiveis > 0 ? b.peso / b.pontosPossiveis : 0;
            const tone =
              b.peso < 0 ? "text-[color:var(--cta-text)]" : ratio >= 0.85 ? "text-success" : ratio >= 0.4 ? "text-ink" : "text-warning";
            return (
              <li key={b.criterio} className="rounded-lg border border-border bg-surface-soft p-3">
                <div className="flex items-baseline gap-2 text-sm">
                  <span className="font-semibold text-ink">{b.criterio}</span>
                  <span className={cn("tabular text-sm font-bold", tone)}>
                    {b.peso > 0 ? `+${b.peso.toFixed(1)}` : b.peso.toFixed(1)}
                    <span className="ml-1 text-xs font-medium text-ink-3">/ {b.pontosPossiveis.toFixed(1)} pts</span>
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink-2">{b.detalhe}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

