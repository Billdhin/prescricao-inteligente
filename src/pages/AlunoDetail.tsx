import * as React from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Navigation,
  CalendarPlus,
  Smartphone,
  Target,
  Dumbbell,
  Activity,
  AlertTriangle,
  Clock,
  CalendarClock,
  TrendingUp,
  UserMinus,
  UserCheck,
  LayoutGrid,
  FlaskConical,
  HeartPulse,
  FileDown,
  FileText,
  Lock,
  Route as RouteIcon,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  CalendarRange,
  CalendarCheck,
  Wallet,
} from "lucide-react";
import { Card, Pill, buttonClasses, ParDado, LinhaDeDose, LinhaDeTokens, TokenRotulado, Eyebrow } from "@/components/ui/primitives";
import { TokenDose } from "@/components/gps/TermoDoseInfo";
import { useAlunos, useUser, isPremiumUnlocked, marcaDoUsuario, prescricaoAplicadaEm } from "@/lib/store";
import { AplicarNoTreinoDialog } from "@/components/treino/AplicarNoTreinoDialog";
import { ExecucaoPanel, PseBadge } from "@/components/treino/ExecucaoPanel";
import { FinanceiroCard } from "@/components/treino/FinanceiroCard";
import { PosturalCard } from "@/components/treino/PosturalCard";
import { LinhaDoCuidado } from "@/components/treino/LinhaDoCuidado";
import { SugestaoGrupoCard } from "@/components/treino/SugestaoGrupoCard";
import { classificarGrupos } from "@/lib/gps/classificador";
import { ListaChips } from "@/components/treino/PlanoEditor";
import { proximoPasso, estadoDoCiclo, dataReavaliacao, type CicloCtx, type ProximoPasso } from "@/lib/gps/proximoPasso";
import { prontidaoParaPrescrever, type Prontidao } from "@/lib/gps/prontidao";
import { ProntidaoAviso } from "@/components/alunos/ProntidaoAviso";
import { linhaObjetivos } from "@/lib/gps/objetivos";
import { estadoSemaforo, semaforoPorDiaDaSemana, type EstadoSemaforo } from "@/lib/gps/semaforoDiario";
import { sequenciaDias } from "@/lib/gamificacao";
import { SemaforoLiberacao } from "@/components/rcd/SemaforoLiberacao";
import { useCloudAuth } from "@/lib/backend/cloudAuth";
import { statusAcessoAluno, type ConviteAluno } from "@/lib/backend/supabaseRepo";
import { rotuloRestricao } from "@/lib/gps/restricoes";
import { exportPrescricaoPDF } from "@/lib/exportPrescricao";
import { exportProntuarioPDF, idDocumento } from "@/lib/exportProntuario";
import { ProntuarioView } from "@/components/rcd/ProntuarioView";
import { exercises } from "@/data/exercises";
import type { Aluno, Prescricao, Liberacao, Avaliacao } from "@/data/alunos";
import type { SessaoFeedback, Execucao } from "@/data/execucao";
import { nomeDoBloco, tokensDoBloco } from "@/components/student/blocoRegistro";
import { tempoDesde, sugestaoProgressao } from "@/data/alunos";
import { ROTULO_STATUS_COBRANCA } from "@/data/cobranca";
import { getSpecialGroup } from "@/data/specialGroups";
import { getModelo, rotuloMeso, semanaAtual, mesocicloAtual, proximaReavaliacao, sessoesDeHoje, sessaoDeHojeIndex, parametrosPadraoTreino, type PlanoTreino } from "@/data/periodizacao";
import { ModalidadePills, ParametroPills, CriteriosLista } from "@/components/special/SpecialUI";
import { ConviteAlunoModal } from "@/components/app/ConviteAlunoModal";
import { AvaliacaoModal } from "@/components/app/AvaliacaoModal";
import { EvolucaoMini, TabelaEvolucao } from "@/components/app/EvolucaoMini";
import { exportEvolucaoPDF } from "@/lib/exportEvolucao";
import { useDialog } from "@/lib/useDialog";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

const DIA = 86_400_000;
const fmtData = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(ts));
const diasAte = (ts: number) => Math.round((ts - Date.now()) / DIA);
const nomeEx = (slug: string) => exercises.find((e) => e.slug === slug)?.nome ?? slug;

const TIPO_AVAL_LABEL: Record<string, string> = {
  inicial: "Inicial",
  reavaliacao: "Reavaliação",
  pontual: "Pontual",
  retorno: "Retorno",
};

// A ordem do mockup: a Visão geral abre a tela, e o resto continua onde estava.
// O design desenha 6 abas (com Evolução e Cobrança soltas); aqui são 5, porque
// Evolução já é o topo de Avaliações e Cobrança é um card de "App do aluno".
// Quebrar as duas em abas próprias numa tela desta altura custaria mais navegação
// do que entrega.
type Aba = "visao" | "treino" | "avaliacoes" | "semaforo" | "conta";
const ABAS: { id: Aba; label: string; Icon: typeof UserCheck }[] = [
  { id: "visao", label: "Visão geral", Icon: LayoutGrid },
  { id: "avaliacoes", label: "Avaliações", Icon: Activity },
  { id: "treino", label: "Treino", Icon: Dumbbell },
  { id: "semaforo", label: "Semáforo", Icon: ShieldCheck },
  { id: "conta", label: "App do aluno", Icon: Smartphone },
];
const ABA_IDS = new Set<string>(ABAS.map((a) => a.id));

/** Vocabulário único do resultado do semáforo (mesmo de src/data/semaforo.ts). */
const rotuloResultado = (r: "verde" | "amarelo" | "vermelho") =>
  r === "verde" ? "Liberado" : r === "amarelo" ? "Liberado com ajuste" : "Não liberado hoje";

/** Acabamento por cor do semáforo, com os tokens success/warning/danger. */
const COR_SEMAFORO: Record<
  "verde" | "amarelo" | "vermelho",
  { bg: string; border: string; text: string; dot: string; Icon: typeof CheckCircle2 }
> = {
  verde: { bg: "bg-success-tint", border: "border-success/40", text: "text-success", dot: "bg-success", Icon: CheckCircle2 },
  amarelo: { bg: "bg-warning-tint", border: "border-warning/40", text: "text-warning", dot: "bg-warning", Icon: AlertTriangle },
  vermelho: { bg: "bg-danger-tint", border: "border-danger/40", text: "text-danger", dot: "bg-danger-fill", Icon: XCircle },
};

/** "há N dias" a partir de uma data (0 = hoje), para a faixa de estado. */
const registradoHa = (ts: number) => {
  const dias = Math.floor((Date.now() - ts) / DIA);
  if (dias <= 0) return "registrado hoje";
  return `registrado há ${dias} ${dias === 1 ? "dia" : "dias"}`;
};

/** Tira de abas da tela do aluno: agrupa o que antes eram 8 cards soltos em
 *  poucos destinos claros, no espírito do painel de atleta do ION. */
function AlunoTabs({ aba, onAba }: { aba: Aba; onAba: (a: Aba) => void }) {
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const n = ABAS.length;
    let alvo = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") alvo = (i + 1) % n;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") alvo = (i - 1 + n) % n;
    else if (e.key === "Home") alvo = 0;
    else if (e.key === "End") alvo = n - 1;
    if (alvo < 0) return;
    e.preventDefault();
    onAba(ABAS[alvo].id);
    refs.current[alvo]?.focus();
  };
  return (
    <div
      role="tablist"
      aria-label="Seções do aluno"
      className="flex gap-1 overflow-x-auto rounded-control border border-border bg-surface-soft p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {ABAS.map(({ id, label, Icon }, i) => {
        const ativo = id === aba;
        return (
          <button
            key={id}
            ref={(el) => (refs.current[i] = el)}
            role="tab"
            id={`aba-tab-${id}`}
            aria-selected={ativo}
            aria-controls={`aba-painel-${id}`}
            tabIndex={ativo ? 0 : -1}
            onClick={() => onAba(id)}
            onKeyDown={(e) => onKey(e, i)}
            className={cn(
              "inline-flex flex-none items-center justify-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
              ativo ? "bg-surface text-primary shadow-soft" : "text-ink-2 hover:bg-surface hover:text-ink",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * CTA primário roteado pelo ciclo (proximoPasso), sempre com o prefixo
 * "Próximo passo:". Mesmo mapa de destino do CtaPasso da Linha do cuidado:
 * avaliar/reavaliar abrem o modal de avaliação, planejar vai ao Prescrever treino,
 * liberar ao Semáforo, acompanhar ancora na execução. Os CTAs diretos dos cards
 * (Montar treino, Nova prescrição) continuam existindo (decisão travada 12).
 */
function CtaProximoPasso({
  aluno,
  passo,
  onAvaliar,
  onAcompanhar,
  onLiberar,
  variant = "primary",
  size,
  eyebrow = false,
}: {
  aluno: Aluno;
  passo: ProximoPasso;
  onAvaliar: () => void;
  onAcompanhar: () => void;
  /** liberar abre a aba Semáforo do próprio aluno (nunca sai para /semaforo) */
  onLiberar: () => void;
  variant?: Parameters<typeof buttonClasses>[0];
  size?: Parameters<typeof buttonClasses>[1];
  eyebrow?: boolean;
}) {
  const cls = buttonClasses(variant, size);
  // O rótulo carrega só a ação; o contexto "Próximo passo" vira eyebrow acima do
  // botão (evita rótulo longo que estoura o nowrap a 390px).
  const label = (
    <>
      {passo.cta.label} <ArrowRight className="h-4 w-4" />
    </>
  );
  let botao: React.ReactNode;
  if (passo.cta.to) {
    // Destino explícito do passo manda em tudo: é por ele que "planejar" leva ao
    // PERFIL quando é o perfil que trava, em vez de levar a uma tela bloqueada.
    botao = (
      <Link to={passo.cta.to} className={cls}>
        {label}
      </Link>
    );
  } else {
    switch (passo.cta.kind) {
    case "planejar":
      botao = (
        <Link to={`/prescrever-treino?aluno=${aluno.id}`} className={cls}>
          {label}
        </Link>
      );
      break;
    case "liberar":
      botao = (
        <button onClick={onLiberar} className={cls}>
          {label}
        </button>
      );
      break;
    case "avaliar":
    case "reavaliar":
      botao = (
        <button onClick={onAvaliar} className={cls}>
          {label}
        </button>
      );
      break;
    case "acompanhar":
    default:
      botao = (
        <button onClick={onAcompanhar} className={cls}>
          {label}
        </button>
      );
      break;
    }
  }
  if (!eyebrow) return <>{botao}</>;
  return (
    <div className="flex flex-col gap-1">
      <Eyebrow>Próximo passo</Eyebrow>
      {botao}
    </div>
  );
}

export function AlunoDetail() {
  const { id = "" } = useParams();
  const { alunos, avaliacoes, prescricoes, planos, liberacoes, execucoes, sessaoFeedbacks, addAvaliacao, updateAluno, updatePlano, removeAluno, archivePrescricao } =
    useAlunos();
  const navigate = useNavigate();
  const [confirmarExclusao, setConfirmarExclusao] = React.useState(false);
  const usuario = useUser();
  const { name: profNome, plan, cref } = usuario;
  const premium = isPremiumUnlocked(plan);
  const [avaliar, setAvaliar] = React.useState(false);
  const [prontuarioDe, setProntuarioDe] = React.useState<string | null>(null);
  const location = useLocation();
  const recemCriado = Boolean((location.state as { recemCriado?: boolean } | null)?.recemCriado);
  // "Salvei, e agora?": o retorno do Prescrever traz este sinal para dar o fecho do fluxo.
  const prescricaoSalva = Boolean((location.state as { prescricaoSalva?: boolean } | null)?.prescricaoSalva);
  // Retorno do "Prescrever treino" após o primeiro salvamento de um plano novo.
  const planoSalvo = Boolean((location.state as { planoSalvo?: boolean } | null)?.planoSalvo);
  // Retorno do tubo "Aplicar no treino": {n} exercícios aplicados na Sessão X até o fim do bloco.
  const aplicado = (location.state as { aplicado?: { n: number; sessao: string; bloco: number; semanas: number } } | null)?.aplicado;
  // A aba "Plano e treino" é o core e abre por padrão (o retorno do plano/aplicado cai
  // nela). O deep-link `?aba=semaforo` (ex.: do aviso "não liberado" no Painel) abre a
  // aba pedida; o param é limpo logo em seguida para não fixar a aba ao navegar.
  const [aba, setAba] = React.useState<Aba>(() => {
    const p = new URLSearchParams(window.location.search).get("aba");
    return p && ABA_IDS.has(p) ? (p as Aba) : "visao";
  });
  // "Acompanhar" do próximo passo: garante a aba do treino e ancora na execução.
  const irParaExecucao = React.useCallback(() => {
    setAba("treino");
    requestAnimationFrame(() =>
      document.getElementById("execucao-card")?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }, []);
  // "Liberar" / "Fazer o semáforo de hoje": abre a aba Semáforo aqui mesmo na página
  // (nunca sai para /semaforo, que virou o painel do dia).
  const irParaSemaforo = React.useCallback(() => {
    setAba("semaforo");
    requestAnimationFrame(() =>
      document.getElementById("aba-painel-semaforo")?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }, []);
  // Prescrição escolhida para o diálogo "Colocar no treino".
  const [aplicarPresc, setAplicarPresc] = React.useState<Prescricao | null>(null);
  // Modal de convite: o ciclo de acesso do aluno (link, senha dele, status) num só lugar.
  const [convidar, setConvidar] = React.useState(false);
  const [params, setParams] = useSearchParams();

  // ?avaliar=1 (vindo de Avaliações) abre o modal de registrar avaliação; ?aba= já foi
  // consumido no estado inicial. Ambos os params são limpos aqui.
  React.useEffect(() => {
    let mudou = false;
    if (params.get("avaliar") === "1") {
      setAvaliar(true);
      params.delete("avaliar");
      mudou = true;
    }
    if (params.get("aba")) {
      params.delete("aba");
      mudou = true;
    }
    if (mudou) setParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const aluno = alunos.find((a) => a.id === id);
  if (!aluno) {
    return (
      <div className="mx-auto max-w-3xl py-16 text-center">
        <p className="text-ink-2">Aluno não encontrado.</p>
        <Link to="/alunos" className={cn(buttonClasses("secondary"), "mt-4")}>
          Voltar para Alunos
        </Link>
      </div>
    );
  }

  const avals = avaliacoes.filter((a) => a.alunoId === id).sort((a, b) => a.data - b.data);
  const avalsDesc = [...avals].reverse();
  const prescs = prescricoes.filter((p) => p.alunoId === id).sort((a, b) => b.data - a.data);
  const planosDoAluno = planos.filter((p) => p.alunoId === id).sort((a, b) => b.data - a.data);
  const planoAtivo = planosDoAluno.find((p) => p.status === "ativo");
  const execucoesDoAluno = execucoes.filter((e) => e.alunoId === id);
  // Feedbacks de sessão do aluno (PSE + recado), do mais recente para o mais antigo:
  // o painel de execução lista os últimos; a aba "App do aluno" mostra o resumo do topo.
  const feedbacksDoAluno = sessaoFeedbacks.filter((f) => f.alunoId === id).sort((a, b) => b.concluidaEm - a.concluidaEm);
  // Fonte única do ciclo (avaliar, planejar, liberar, acompanhar, reavaliar).
  const ctx: CicloCtx = { avaliacoes, prescricoes, planos, liberacoes, execucoes };
  const passo = proximoPasso(aluno, ctx);
  // GATE DURO, agora completo: a avaliação era só o primeiro dos oito bloqueios.
  // `podeTreino` mantém a forma {ok, motivo} que os cards desta tela consomem, mas o
  // veredito vem da prontidão inteira, e o motivo é o PRIMEIRO bloqueio de verdade.
  const prontidao = prontidaoParaPrescrever(aluno, ctx);
  const podeTreino = {
    ok: prontidao.ok,
    motivo: prontidao.primeiro
      ? `${prontidao.primeiro.titulo}. ${prontidao.primeiro.porque}`
      : undefined,
  };
  const temAvaliacao = avals.length > 0;
  const estado = estadoDoCiclo(aluno, ctx);
  // Reavaliação reconciliada: com plano, o macrociclo manda; senão o calendário.
  const reav = dataReavaliacao(aluno, planoAtivo);
  const reavaliacaoVencida = reav ? reav.em < Date.now() : false;
  // Semáforo diário: histórico completo (desc) para a aba. O card compacto da aba
  // de treino mostra só a linha de estado, derivada da fonte única.
  const libsAlunoDesc = liberacoes.filter((l) => l.alunoId === id).sort((a, b) => b.data - a.data);
  const estadoSem = estadoSemaforo(id, liberacoes);
  const prescAberta = prontuarioDe ? prescs.find((p) => p.id === prontuarioDe) : undefined;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link to="/alunos" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-2 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Alunos
      </Link>

      {recemCriado && (
        <Card tone="success" className="flex flex-wrap items-center gap-3 p-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface text-success">
            <CalendarPlus className="h-4 w-4" />
          </span>
          <p className="min-w-0 flex-1 text-sm text-ink">
            <span className="font-semibold">{aluno.nome} cadastrado(a).</span> Comece pela avaliação
            inicial para acompanhar a evolução; ela abre o resto do ciclo de cuidado.
          </p>
          <CtaProximoPasso aluno={aluno} passo={passo} onAvaliar={() => setAvaliar(true)} onAcompanhar={irParaExecucao} onLiberar={irParaSemaforo} size="sm" />
        </Card>
      )}

      {prescricaoSalva && (
        <Card tone="success" className="flex flex-wrap items-center gap-3 p-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface text-success">
            <CheckCircle2 className="h-4 w-4" />
          </span>
          <p className="min-w-0 flex-1 text-sm text-ink">
            <span className="font-semibold">Prescrição salva no perfil de {aluno.nome.split(" ")[0]}.</span> Ela
            já está no histórico abaixo, com o raciocínio registrado para o prontuário.
          </p>
          <a href="#prescricoes-card" className={buttonClasses("secondary", "sm")}>
            Ver prescrição
          </a>
        </Card>
      )}

      {planoSalvo && (
        <Card tone="success" className="flex flex-wrap items-center gap-3 p-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface text-success">
            <CalendarRange className="h-4 w-4" />
          </span>
          <p className="min-w-0 flex-1 text-sm text-ink">
            <span className="font-semibold">Treino montado para {aluno.nome.split(" ")[0]}.</span> Já está no
            perfil, com a periodização e a progressão organizadas.
          </p>
          <a href="#treino-card" className={buttonClasses("secondary", "sm")}>
            Ver o treino
          </a>
        </Card>
      )}

      {aplicado && (
        <Card tone="success" className="flex flex-wrap items-center gap-3 p-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface text-success">
            <CalendarRange className="h-4 w-4" />
          </span>
          <p className="min-w-0 flex-1 text-sm text-ink">
            <span className="font-semibold">
              {aplicado.n} {aplicado.n === 1 ? "exercício aplicado" : "exercícios aplicados"} na Sessão {aplicado.sessao} até o
              fim do bloco {aplicado.bloco}.
            </span>{" "}
            As doses seguem a faixa do plano; o raciocínio da escolha fica no prontuário da prescrição.
          </p>
          <a href="#treino-card" className={buttonClasses("secondary", "sm")}>
            Ver o treino
          </a>
        </Card>
      )}

      {/* Cabeçalho: identidade, KPIs e ações (sem espremer o nome nem empilhar restrições) */}
      <AlunoHeader
        aluno={aluno}
        planoAtivo={planoAtivo}
        passo={passo}
        reav={reav}
        reavaliacaoVencida={reavaliacaoVencida}
        temAvaliacao={temAvaliacao}
        onEditar={() => navigate(`/alunos/${aluno.id}/perfil`)}
        onAvaliar={() => setAvaliar(true)}
        onAcompanhar={irParaExecucao}
        onLiberar={irParaSemaforo}
        onConvidar={() => setConvidar(true)}
        onToggleStatus={() => {
          const ativo = aluno.status === "ativo";
          updateAluno(aluno.id, { status: ativo ? "inativo" : "ativo" });
          toast(ativo ? `${aluno.nome} marcado(a) como inativo(a)` : `${aluno.nome} reativado(a)`);
        }}
      />

      {/* A espinha do cuidado: onde o aluno está e qual o próximo passo, em qualquer aba */}
      <LinhaDoCuidado
        aluno={aluno}
        passo={passo}
        estado={estado}
        onAvaliar={() => setAvaliar(true)}
        onAcompanhar={() => setAba("treino")}
        onLiberar={irParaSemaforo}
      />

      <AlunoTabs aba={aba} onAba={setAba} />

      {/* VISÃO GERAL: os quatro cartões do mockup, na ordem dele. Cada um é um
          resumo do que já existe nas outras abas, com o CTA que leva pra lá. */}
      {aba === "visao" && (
        <div role="tabpanel" id="aba-painel-visao" aria-labelledby="aba-tab-visao" className="grid gap-4 lg:grid-cols-2">
          <VisaoSemaforo estado={estadoSem} historico={libsAlunoDesc} onFazer={irParaSemaforo} />
          <VisaoTreino plano={planoAtivo} alunoId={aluno.id} onVer={() => setAba("treino")} podeTreino={podeTreino} />
          <VisaoAvaliacao avals={avals} reav={reav} vencida={reavaliacaoVencida} onVer={() => setAba("avaliacoes")} onAvaliar={() => setAvaliar(true)} />
          <VisaoNoApp
            aluno={aluno}
            execucoes={execucoesDoAluno}
            feedbacks={feedbacksDoAluno}
            onVer={() => setAba("conta")}
          />
        </div>
      )}

      {/* AVALIAÇÕES: evolução, histórico e a análise postural por foto no mesmo lugar. */}
      {aba === "avaliacoes" && (
        <div role="tabpanel" id="aba-painel-avaliacoes" aria-labelledby="aba-tab-avaliacoes" className="space-y-4">
          <Card className="p-5 md:p-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-analysis-tint text-analysis">
                  <Activity className="h-4 w-4" />
                </span>
                <h2 className="font-display text-lg font-bold text-ink">Evolução</h2>
              </div>
              {avals.length > 0 && (
                <button
                  onClick={() =>
                    exportEvolucaoPDF({ aluno, avaliacoes: avals, profissional: profNome, cref: cref || undefined, marca: marcaDoUsuario(usuario) })
                  }
                  className={buttonClasses("secondary", "sm")}
                >
                  <FileDown className="h-4 w-4" /> Exportar evolução (PDF)
                </button>
              )}
            </div>
            <EvolucaoMini avals={avals} />
            {avals.length > 0 && (
              <div className="mt-5 border-t border-border pt-4">
                <h3 className="mb-3 text-sm font-semibold text-ink-2">Tabela comparativa por data</h3>
                <TabelaEvolucao avals={avals} />
              </div>
            )}
          </Card>

          <Card className="p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-ink">Avaliações</h2>
              <button onClick={() => setAvaliar(true)} className={buttonClasses("secondary", "sm")}>
                <CalendarPlus className="h-4 w-4" /> {temAvaliacao ? "Reavaliar" : "Registrar"}
              </button>
            </div>
            {avalsDesc.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-2">Nenhuma avaliação registrada ainda.</p>
            ) : (
              <ol className="space-y-3">
                {avalsDesc.map((av) => (
                  <li key={av.id} className="flex gap-3 rounded-xl border border-border p-3">
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-soft text-ink-2">
                      <Clock className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                        <span className="font-semibold text-ink">{fmtData(av.data)}</span>
                        {av.tipo && <Pill tone="neutral">{TIPO_AVAL_LABEL[av.tipo]}</Pill>}
                        {av.medidas.peso != null && <Medida label="Peso" value={`${av.medidas.peso} kg`} />}
                        {av.medidas.percentualGordura != null && (
                          <Medida label="% gordura" value={`${av.medidas.percentualGordura}%`} />
                        )}
                        {av.medidas.cintura != null && <Medida label="Cintura" value={`${av.medidas.cintura} cm`} />}
                        {av.dorEscala != null && <Medida label="Dor" value={`${av.dorEscala}/10`} />}
                      </div>
                      {(av.testes?.length || av.fotos?.length || av.regioesDor?.length) && (
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {av.testes?.length ? (
                            <Pill tone="analysis">{av.testes.length} teste{av.testes.length > 1 ? "s" : ""}</Pill>
                          ) : null}
                          {av.fotos?.length ? <Pill tone="primary">{av.fotos.length} foto{av.fotos.length > 1 ? "s" : ""}</Pill> : null}
                          {av.regioesDor?.length ? (
                            <Pill tone="warning">dor: {av.regioesDor.slice(0, 2).join(", ")}{av.regioesDor.length > 2 ? "..." : ""}</Pill>
                          ) : null}
                        </div>
                      )}
                      {av.observacoes && <p className="mt-1 text-sm text-ink-2">{av.observacoes}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Card>

          {/* Análise postural por foto: é um tipo de avaliação, então vive aqui. */}
          <PosturalCard aluno={aluno} />
        </div>
      )}

      {/* SEMÁFORO: estado do dia, o checklist inline e o histórico completo por aluno. */}
      {aba === "semaforo" && (
        <div role="tabpanel" id="aba-painel-semaforo" aria-labelledby="aba-tab-semaforo">
          <SemaforoAba aluno={aluno} planoAtivo={planoAtivo} estado={estadoSem} historico={libsAlunoDesc} />
        </div>
      )}

      {/* APP DO ALUNO: prévia, convite e financeiro num só lugar (como o aluno usa e paga). */}
      {aba === "conta" && (
        <div role="tabpanel" id="aba-painel-conta" aria-labelledby="aba-tab-conta">
          <AppDoAlunoPanel
            aluno={aluno}
            ultimoFeedback={feedbacksDoAluno[0]}
            onVerExecucao={irParaExecucao}
            onConvidar={() => setConvidar(true)}
            onUpdate={(patch) => updateAluno(aluno.id, patch)}
          />
        </div>
      )}

      {/* PLANO E TREINO: o core, na ordem do ciclo. Fase, periodização, prescrição, execução. */}
      {aba === "treino" && (
        <div role="tabpanel" id="aba-painel-treino" aria-labelledby="aba-tab-treino" className="space-y-4">
          {/* Direcionamento sugerido: perto da Linha do cuidado, no topo do core. */}
          <SugestaoGrupoCard aluno={aluno} avaliacoes={avals} onUpdate={(patch) => updateAluno(aluno.id, patch)} />

          <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <SugestaoNivel aluno={aluno} onUpdate={(patch) => updateAluno(aluno.id, patch)} />

            <JornadaCard aluno={aluno} planoAtivo={planoAtivo} onFase={(n) => updateAluno(aluno.id, { faseJornada: n })} />

            <PlanoCard aluno={aluno} planos={planosDoAluno} execucoes={execucoesDoAluno} podeTreino={podeTreino} prontidao={prontidao} onAvaliar={() => setAvaliar(true)} onIrParaSemaforo={irParaSemaforo} />

            <div id="execucao-card" className="scroll-mt-24">
              <ExecucaoPanel
                plano={planoAtivo}
                execucoes={execucoesDoAluno}
                sessaoFeedbacks={feedbacksDoAluno}
                liberacoes={liberacoes}
                alunoId={aluno.id}
                aluno={aluno}
                estadoSemaforo={estadoSem}
                ultimaAvaliacao={avalsDesc[0]}
                onAplicarPlano={(planoId, patch) => updatePlano(planoId, patch)}
              />
            </div>

          <Card id="prescricoes-card" className="scroll-mt-24 p-5 md:p-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-ink">Prescrições</h2>
              {/* Com plano ativo, a prescrição do exercício é o "personalizar o treino do
                  dia" (entra na sessão da semana). Sem plano, é a prescrição avulsa. */}
              {podeTreino.ok ? (
                <Link
                  to={planoAtivo ? `/gps?aluno=${aluno.id}&modo=dia` : `/gps?aluno=${aluno.id}`}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  {planoAtivo ? "Personalizar o treino do dia" : "Nova prescrição"}
                </Link>
              ) : (
                <span className="text-sm font-semibold text-ink-3" aria-disabled>
                  {planoAtivo ? "Personalizar o treino do dia" : "Nova prescrição"}
                </span>
              )}
            </div>
            {/* Gate duro: o que falta para prescrever, com o atalho de cada item. */}
            {!podeTreino.ok && (
              <ProntidaoAviso aluno={aluno} prontidao={prontidao} onAvaliar={() => setAvaliar(true)} />
            )}
            {prescs.length === 0 ? (
              podeTreino.ok && (
                <div className="rounded-xl border border-dashed border-border p-4 text-center">
                  <p className="text-sm text-ink-2">Sem prescrição ainda.</p>
                  <Link
                    to={planoAtivo ? `/gps?aluno=${aluno.id}&modo=dia` : `/gps?aluno=${aluno.id}`}
                    className={cn(buttonClasses("secondary", "sm"), "mt-3")}
                  >
                    <Navigation className="h-4 w-4" /> {planoAtivo ? "Personalizar o treino do dia" : "Prescrever agora"}
                  </Link>
                </div>
              )
            ) : (
              <div className="space-y-3">
                {prescs.map((p) => {
                  // Vínculo reverso DERIVADO: onde (se) esta prescrição já entrou no plano.
                  const local = prescricaoAplicadaEm(planosDoAluno, p.id);
                  const podeColocar = Boolean(planoAtivo) && p.status === "ativa" && !local;
                  return (
                  <div key={p.id} className="rounded-xl border border-border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-semibold text-ink">{p.titulo}</span>
                      <Pill tone={p.status === "ativa" ? "success" : "neutral"}>{p.status}</Pill>
                    </div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="tabular text-xs text-ink-3">Prescrita em {fmtData(p.data)}</span>
                      {local && (
                        <TokenRotulado label="No treino" value={`Semana ${local.semana} · Sessão ${local.sessao}`} tone="analysis" />
                      )}
                    </div>
                    {/* Nome e dose vinculados: a dose fica logo abaixo do exercicio, nao empurrada
                        para a borda oposta. A lista vira um bloco unico, com divisorias. */}
                    <ul className="overflow-hidden rounded-lg border border-border">
                      {p.itens.map((it) => (
                        <LinhaDeDose
                          key={it.slug}
                          icon={<FlaskConical className="h-3.5 w-3.5" />}
                          nome={
                            <Link to={`/movement-lab/${it.slug}`} className="hover:text-primary">
                              {nomeEx(it.slug)}
                            </Link>
                          }
                        >
                          {it.series ? (
                            <>
                              <span className="text-ink-3">Dose: </span>
                              {it.series}
                            </>
                          ) : null}
                        </LinhaDeDose>
                      ))}
                    </ul>
                    {p.observacoes && <p className="mt-2 text-xs text-ink-2">{p.observacoes}</p>}
                    {p.raciocinio && (
                      <p className="mt-1 text-xs text-ink-3">
                        <span className="font-semibold">Raciocínio: </span>
                        {p.raciocinio}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-2.5">
                      {podeColocar && (
                        <button
                          onClick={() => setAplicarPresc(p)}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                        >
                          <CalendarRange className="h-4 w-4" /> Colocar no treino
                        </button>
                      )}
                      {p.prontuario && (
                        <button
                          onClick={() => setProntuarioDe(p.id)}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-analysis hover:underline"
                        >
                          <FileText className="h-4 w-4" /> Ver prontuário ({idDocumento(p.id)})
                        </button>
                      )}
                      {premium ? (
                        <button
                          onClick={() =>
                            p.prontuario
                              ? exportProntuarioPDF({ aluno, presc: p, prontuario: p.prontuario, profissional: profNome, cref, marca: marcaDoUsuario(usuario) })
                              : exportPrescricaoPDF({ aluno, presc: p, profissional: profNome, cref, marca: marcaDoUsuario(usuario) })
                          }
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                        >
                          <FileDown className="h-4 w-4" />
                          {p.prontuario ? "Exportar prontuário assinável" : "Exportar PDF (com sua marca)"}
                        </button>
                      ) : (
                        <Link
                          to="/pricing"
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-3 hover:text-ink"
                        >
                          <Lock className="h-3.5 w-3.5" /> Exportar PDF para o aluno: plano Profissional
                        </Link>
                      )}
                      {p.status === "ativa" && (
                        <button
                          onClick={() => {
                            archivePrescricao(p.id);
                            toast("Prescrição arquivada");
                          }}
                          className="ml-auto text-sm font-medium text-ink-3 hover:text-ink"
                        >
                          Arquivar
                        </button>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </Card>
          </div>

          <div className="space-y-4">
            {/* Gate pré-sessão vale para TODO aluno: sem grupo especial, usa o checklist geral.
                Este card é o RESUMO; a aba Semáforo tem o estado, o checklist e o histórico. */}
            <Card className="p-5">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-ink">Semáforo de Liberação</h2>
              </div>
              {/* Uma linha de estado: a aba Semáforo tem o checklist, a régua da semana
                  e o histórico completo (sem repetir a lista aqui). */}
              <ResumoSemaforoLinha estado={estadoSem} />
              <button onClick={() => setAba("semaforo")} className={cn(buttonClasses("secondary", "sm"), "mt-3")}>
                <ShieldCheck className="h-4 w-4" /> Fazer o semáforo de hoje
              </button>
            </Card>
          </div>
          </div>
        </div>
      )}

      {/* Ação administrativa: excluir (o status ativo/saiu fica em Acompanhamento) */}
      <div className="flex flex-wrap items-center gap-4 border-t border-border pt-4 text-sm">
        <button onClick={() => setConfirmarExclusao(true)} className="font-medium text-danger hover:underline">
          Excluir aluno
        </button>
      </div>

      {convidar && <ConviteAlunoModal aluno={aluno} onClose={() => setConvidar(false)} />}


      {confirmarExclusao && (
        <ConfirmarExclusaoModal
          nome={aluno.nome}
          onClose={() => setConfirmarExclusao(false)}
          onConfirm={() => {
            removeAluno(aluno.id);
            toast(`${aluno.nome} excluído(a)`);
            navigate("/alunos");
          }}
        />
      )}

      {avaliar && (
        <AvaliacaoModal
          onClose={() => setAvaliar(false)}
          onSave={(av) => {
            addAvaliacao(av);
            setAvaliar(false);
            toast(`Avaliação registrada para ${aluno.nome}`);
            // Se a nova avaliação faz surgir um direcionamento que antes não existia,
            // avisa de leve (o card já aparece no perfil; não abre modal).
            const antes = classificarGrupos(aluno, avals).map((s) => s.grupoSlug);
            const surgiu = classificarGrupos(aluno, [...avals, av]).some(
              (s) => s.fonte === "avaliacao" && !antes.includes(s.grupoSlug),
            );
            if (surgiu) toast("A avaliação indica possível grupo especial. Veja a sugestão no perfil.");
          }}
          alunoId={aluno.id}
          alunoNome={aluno.nome}
          alunoSexo={aluno.sexo}
          anterior={avalsDesc[0]}
          historico={avals}
        />
      )}

      {prescAberta?.prontuario && (
        <ProntuarioView
          prontuario={prescAberta.prontuario}
          titulo={prescAberta.titulo}
          docId={idDocumento(prescAberta.id)}
          onExportar={() =>
            exportProntuarioPDF({
              aluno,
              presc: prescAberta,
              prontuario: prescAberta.prontuario!,
              profissional: profNome,
              cref,
              marca: marcaDoUsuario(usuario),
            })
          }
          podeExportar={premium}
          onClose={() => setProntuarioDe(null)}
        />
      )}

      {aplicarPresc && planoAtivo && (
        <AplicarNoTreinoDialog
          prescricao={aplicarPresc}
          plano={planoAtivo}
          execucoes={execucoesDoAluno}
          dataDaPrescricao={(pid) => {
            const pp = prescricoes.find((x) => x.id === pid);
            return pp ? fmtData(pp.data) : undefined;
          }}
          onDecidirDepois={() => setAplicarPresc(null)}
          onAplicar={(planoAtualizado, resumo) => {
            updatePlano(planoAtualizado.id, planoAtualizado);
            setAplicarPresc(null);
            // Reusa o banner de retorno: atualiza o state da própria rota.
            navigate(`/alunos/${id}`, { state: { aplicado: resumo }, replace: true });
          }}
        />
      )}
    </div>
  );
}

/**
 * Cabeçalho do aluno: identidade + KPIs + ações, em zonas empilhadas.
 * Empilha no mobile (flex-col) e só vira linha no desktop, com as ações em
 * `shrink-0`, para o nome nunca ser espremido e as restrições fluírem numa
 * linha própria (com colapso +N) em vez de empilhar uma por linha.
 */
function AlunoHeader({
  aluno,
  planoAtivo,
  passo,
  reav,
  reavaliacaoVencida,
  temAvaliacao,
  onEditar,
  onAvaliar,
  onAcompanhar,
  onLiberar,
  onConvidar,
  onToggleStatus,
}: {
  aluno: Aluno;
  planoAtivo?: PlanoTreino;
  passo: ProximoPasso;
  reav: { em: number; semana?: number } | null;
  reavaliacaoVencida: boolean;
  /** aluno já tem ao menos uma avaliação: o botão vira "Reavaliar" */
  temAvaliacao: boolean;
  onEditar: () => void;
  onAvaliar: () => void;
  onAcompanhar: () => void;
  onLiberar: () => void;
  /** abre o ciclo de acesso ao app (link, senha do aluno, status) */
  onConvidar: () => void;
  onToggleStatus: () => void;
}) {
  const ativo = aluno.status === "ativo";
  const grupo = aluno.grupoEspecial ? getSpecialGroup(aluno.grupoEspecial) : undefined;
  const restr = aluno.restricoes;
  const planoTxt = planoAtivo ? `Semana ${semanaAtual(planoAtivo)} de ${planoAtivo.semanas}` : "Sem plano";
  const reavTxt = reav ? (reavaliacaoVencida ? "Vencida" : `em ${Math.max(0, diasAte(reav.em))} dias`) : "A definir";
  const financeiroTxt = aluno.cobranca ? ROTULO_STATUS_COBRANCA[aluno.cobranca.statusAtual] : "Sem cobrança";

  return (
    <Card variant="raised" className="p-5 md:p-6">
      {/* Zona 1: identidade | ações */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-card gradient-brand font-display text-xl font-bold text-white">
            {aluno.iniciais}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">{aluno.nome}</h1>
              <Pill tone={ativo ? "success" : "neutral"}>{ativo ? "Ativo" : "Inativo"}</Pill>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Pill tone="primary">{aluno.objetivo}</Pill>
              {aluno.objetivoSecundario && (
                <Pill tone="neutral">2º: {aluno.objetivoSecundario}</Pill>
              )}
              <Pill tone="neutral">{aluno.nivel}</Pill>
              {aluno.idade ? <Pill tone="neutral">{aluno.idade} anos</Pill> : null}
              {grupo && (
                <Pill tone="analysis">
                  {grupo.nome} · Fase {aluno.faseJornada ?? 1}
                </Pill>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-end gap-2 md:justify-end">
          <button onClick={onEditar} className={buttonClasses("outline")}>
            Editar
          </button>
          {/* "Convidar para o app" vive no cabeçalho, como no design: é a ação que
              coloca o aluno dentro do produto, não um detalhe de uma aba. */}
          <button onClick={onConvidar} className={buttonClasses("outline")}>
            <Smartphone className="h-4 w-4" /> Convidar para o app
          </button>
          <button onClick={onAvaliar} className={buttonClasses("secondary")}>
            <CalendarPlus className="h-4 w-4" /> {temAvaliacao ? "Reavaliar" : "Registrar avaliação"}
          </button>
          <CtaProximoPasso aluno={aluno} passo={passo} onAvaliar={onAvaliar} onAcompanhar={onAcompanhar} onLiberar={onLiberar} eyebrow />
        </div>
      </div>

      {/* Zona 2: restrições fluem em linha própria, com colapso +N */}
      {restr.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <span className="text-2xs font-semibold uppercase tracking-wide text-ink-3">Restrições</span>
          {restr.slice(0, 4).map((r) => (
            <Pill key={r.tag} tone="warning" icon={<AlertTriangle className="h-3 w-3" />}>
              {rotuloRestricao(r.tag)}
            </Pill>
          ))}
          {restr.length > 4 && (
            <Pill tone="warning" className="cursor-default">
              <span title={restr.map((r) => rotuloRestricao(r.tag)).join(", ")}>+{restr.length - 4}</span>
            </Pill>
          )}
        </div>
      )}

      {/* Zona 3: KPIs preenchem o espaço, absorvem o antigo card de Acompanhamento */}
      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 sm:grid-cols-4">
        <MiniStat icon={<CalendarClock className="h-4 w-4" />} rotulo="Na casa" valor={tempoDesde(aluno.criadoEm).texto} />
        <MiniStat icon={<CalendarRange className="h-4 w-4" />} rotulo="Plano" valor={planoTxt} />
        <MiniStat
          icon={<CalendarCheck className="h-4 w-4" />}
          rotulo="Próxima reavaliação"
          valor={reavTxt}
          tone={reavaliacaoVencida ? "warning" : undefined}
        />
        <MiniStat icon={<Wallet className="h-4 w-4" />} rotulo="Financeiro" valor={financeiroTxt} />
      </dl>

      {/* Ficha completa recolhida: perfil de treino + situação */}
      <details className="mt-3">
        <summary className="cursor-pointer list-none text-sm font-semibold text-primary hover:underline">
          Ver ficha completa
        </summary>
        <div className="mt-3 space-y-3">
          <PerfilTreinoCard aluno={aluno} reavaliacaoVencida={reavaliacaoVencida} />
          <div className="flex justify-end">
            <button onClick={onToggleStatus} className={buttonClasses("secondary", "sm")}>
              {ativo ? <UserMinus className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
              {ativo ? "Inativar aluno" : "Reativar aluno"}
            </button>
          </div>
        </div>
      </details>
    </Card>
  );
}

/** Sugestão de avançar de nível (a decisão é do profissional). Vive no topo do plano. */
function SugestaoNivel({ aluno, onUpdate }: { aluno: Aluno; onUpdate: (patch: Partial<Aluno>) => void }) {
  const sug = aluno.status === "ativo" ? sugestaoProgressao(aluno) : null;
  if (!sug) return null;
  return (
    <Card tone="primary" className="flex flex-wrap items-center justify-between gap-3 p-4">
      <div className="flex items-start gap-2">
        <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-sm text-ink">
          <span className="font-semibold">
            {aluno.nome.split(" ")[0]} está há {sug.mesesNoNivel} {sug.mesesNoNivel === 1 ? "mês" : "meses"} como {aluno.nivel}.
          </span>{" "}
          Considere avançar para {sug.proximo} e revisar toda a prescrição. A decisão é sua; avance quando a técnica e a
          resposta ao treino indicarem.
        </p>
      </div>
      <button
        onClick={() => {
          onUpdate({ nivel: sug.proximo, nivelDesde: Date.now() });
          toast(`${aluno.nome} avançou para ${sug.proximo}. Revise a prescrição.`);
        }}
        className={buttonClasses("secondary", "sm")}
      >
        Avançar para {sug.proximo}
      </button>
    </Card>
  );
}

/**
 * "App do aluno": um só lugar responde "é isto que o aluno vê, e é assim que você
 * dá acesso". A prévia é local e sempre funciona; o convite depende do Supabase
 * configurado (sem ele, explica o que falta, nunca promete acesso que não existe).
 */
function AppDoAlunoPanel({
  aluno,
  ultimoFeedback,
  onVerExecucao,
  onConvidar,
  onUpdate,
}: {
  aluno: Aluno;
  /** feedback mais recente do aluno (se houver): motivo para abrir o painel de execução */
  ultimoFeedback?: SessaoFeedback;
  onVerExecucao: () => void;
  /** abre o modal com o ciclo de acesso (link, senha do aluno, status) */
  onConvidar: () => void;
  onUpdate: (patch: Partial<Aluno>) => void;
}) {
  const configured = useCloudAuth((s) => s.configured);
  return (
    <div className="space-y-4">
      <Card className="p-5 md:p-6">
        <div className="mb-1 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary-tint text-primary">
            <Smartphone className="h-5 w-5" />
          </span>
          <h2 className="font-display text-lg font-bold text-ink">Como o aluno acompanha</h2>
        </div>
        <p className="text-sm text-ink-2">
          É esta a tela que abre no celular do aluno, com a sua marca. Ele registra as séries e a periodização se ajusta
          pela execução.
        </p>

        {/* Último feedback em UMA linha (data + PSE) + link. O recado completo e o
            histórico de PSE vivem no ExecucaoPanel da aba Plano e treino. */}
        {ultimoFeedback && (
          <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1.5 rounded-xl border border-border bg-surface-soft px-3 py-2.5">
            <span className="text-2xs font-semibold uppercase tracking-wide text-ink-3">Último feedback</span>
            <span className="tabular text-xs text-ink-3">{fmtData(ultimoFeedback.concluidaEm)}</span>
            {ultimoFeedback.pse != null && <PseBadge pse={ultimoFeedback.pse} />}
            <button
              type="button"
              onClick={onVerExecucao}
              className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              Ver execução <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {/* 1) Prévia: render local, funciona mesmo sem conta online */}
          <div className="rounded-xl border border-border bg-surface-soft p-4">
            <div className="text-sm font-semibold text-ink">Ver a prévia</div>
            <p className="mt-1 text-sm text-ink-2">
              Abra a mesma tela que o aluno vê, aqui no seu aparelho. Funciona mesmo sem conta online.
            </p>
            <Link to={`/alunos/${aluno.id}/preview`} className={cn(buttonClasses("secondary", "sm"), "mt-3")}>
              <Smartphone className="h-4 w-4" /> Ver como o aluno vê
            </Link>
          </div>

          {/* 2) Acesso real: o estado de agora (entrou, convite pendente ou nada
              ainda) e uma porta só para o ciclo inteiro. */}
          <div className="rounded-xl border border-border bg-surface-soft p-4">
            <div className="text-sm font-semibold text-ink">Dar acesso ao aluno</div>
            {configured ? (
              <>
                <AcessoStatusLinha aluno={aluno} />
                <button onClick={onConvidar} className={cn(buttonClasses("secondary", "sm"), "mt-3")}>
                  <Smartphone className="h-4 w-4" /> Convidar para o app
                </button>
              </>
            ) : (
              <>
                <p className="mt-1 text-sm text-ink-2">
                  O acesso online ainda não está ligado neste aparelho. A prévia mostra exatamente o que o aluno verá.
                </p>
                <Link to={`/alunos/${aluno.id}/preview`} className={cn(buttonClasses("secondary", "sm"), "mt-3")}>
                  <Smartphone className="h-4 w-4" /> Ver a prévia
                </Link>
              </>
            )}
          </div>
        </div>
      </Card>

      <FinanceiroCard aluno={aluno} onUpdate={onUpdate} />
    </div>
  );
}

/**
 * Aba SEMÁFORO do aluno: o estado do dia (verde/amarelo/não liberado pendente), o
 * checklist inline (sem sair para /semaforo), a régua da semana e o histórico
 * completo. Reusa o `SemaforoLiberacao` já existente e a fonte única `estadoSemaforo`.
 */
const DIAS_SEMANA = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
function SemaforoAba({
  aluno,
  planoAtivo,
  estado,
  historico,
}: {
  aluno: Aluno;
  planoAtivo?: PlanoTreino;
  estado: EstadoSemaforo;
  /** liberações do aluno, da mais recente para a mais antiga */
  historico: Liberacao[];
}) {
  const [fazendo, setFazendo] = React.useState(false);
  const grupoSlug = aluno.grupoEspecial ?? "geral";

  // Régua da semana (início na segunda, como o Painel): marca os dias com semáforo
  // registrado nesta semana, com a cor do resultado (o mais recente do dia vence).
  // Fonte única compartilhada com a faixa do app do aluno (semaforoPorDiaDaSemana).
  const agora = Date.now();
  const diaSemana = (new Date(agora).getDay() + 6) % 7;
  const porDia = semaforoPorDiaDaSemana(aluno.id, historico, agora);

  return (
    <div className="space-y-4">
      {/* Estado atual + ação */}
      <Card className="p-5 md:p-6">
        <h2 className="mb-3 font-display text-lg font-bold text-ink">Semáforo de hoje</h2>
        <FaixaEstado estado={estado} />
        <div className="mt-4">
          <button onClick={() => setFazendo((v) => !v)} className={buttonClasses("primary", "sm")}>
            <ShieldCheck className="h-4 w-4" /> {estado.hoje ? "Refazer o semáforo de hoje" : "Fazer o semáforo de hoje"}
          </button>
          {estado.hoje && !fazendo && (
            <p className="mt-2 text-xs text-ink-3">O semáforo de hoje já foi registrado; refazer substitui o registro do dia.</p>
          )}
        </div>
      </Card>

      {/* Checklist inline (o próprio componente é um Card, então fica como irmão). */}
      {fazendo && (
        <SemaforoLiberacao
          grupoSlug={grupoSlug}
          alunoId={aluno.id}
          alunoNome={aluno.nome}
          fase={aluno.faseJornada}
          planoAtivoId={planoAtivo?.id}
          onRegistrado={() => setFazendo(false)}
        />
      )}

      {/* Régua da semana */}
      <Card className="p-5 md:p-6">
        <h2 className="mb-1 font-display text-lg font-bold text-ink">Dias da semana</h2>
        <p className="mb-3 text-sm text-ink-2">
          {planoAtivo
            ? `Plano de ${planoAtivo.frequenciaSemanal}x por semana. Os pontos marcam os dias com semáforo registrado nesta semana.`
            : "Monte o treino para ver os dias planejados. Por enquanto, os pontos marcam os dias com semáforo registrado nesta semana."}
        </p>
        <div className="grid grid-cols-7 gap-1.5">
          {DIAS_SEMANA.map((lbl, i) => {
            const r = porDia[i];
            const atual = i === diaSemana;
            return (
              <div
                key={lbl}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-lg border bg-surface p-2",
                  atual ? "border-primary" : "border-border",
                )}
              >
                <span className="text-2xs font-semibold uppercase tracking-wide text-ink-3">{lbl}</span>
                <span
                  aria-hidden
                  className={cn(
                    "h-2.5 w-2.5 rounded-full",
                    r ? COR_SEMAFORO[r].dot : "bg-surface-soft ring-1 ring-inset ring-border",
                  )}
                />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Histórico completo */}
      <Card className="p-5 md:p-6">
        <h2 className="mb-3 font-display text-lg font-bold text-ink">Histórico</h2>
        {historico.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-2">Nenhum semáforo registrado ainda.</p>
        ) : (
          <ol className="space-y-3">
            {historico.map((l) => {
              const c = COR_SEMAFORO[l.resultado];
              return (
                <li key={l.id} className="rounded-xl border border-border p-3">
                  <div className="flex items-center gap-2">
                    <span aria-hidden className={cn("h-2.5 w-2.5 shrink-0 rounded-full", c.dot)} />
                    <span className="font-semibold text-ink">{rotuloResultado(l.resultado)}</span>
                    <span className="tabular ml-auto text-xs text-ink-3">{fmtData(l.data)}</span>
                  </div>
                  {l.ajustes.length > 0 && (
                    <ul className="mt-2 space-y-1.5 border-t border-border pt-2">
                      {l.ajustes.map((a) => (
                        <li key={a.pergunta} className="flex gap-2 text-sm text-ink-2">
                          <span aria-hidden className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", c.dot)} />
                          <span>
                            <span className="font-semibold text-ink">{a.acao}</span>{" "}
                            <span className="text-xs text-ink-3">({a.pergunta})</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </Card>
    </div>
  );
}

/** Faixa do estado atual do semáforo, com a cor do resultado. */
function FaixaEstado({ estado }: { estado: EstadoSemaforo }) {
  if (estado.vermelhoPendente) {
    const c = COR_SEMAFORO.vermelho;
    const l = estado.vermelhoPendente;
    return (
      <div className={cn("flex items-start gap-3 rounded-xl border p-4", c.bg, c.border)}>
        <c.Icon className={cn("mt-0.5 h-6 w-6 shrink-0", c.text)} />
        <div className="min-w-0">
          <div className={cn("font-display text-lg font-bold", c.text)}>Não liberado</div>
          <p className="text-sm text-ink-2">
            Em {fmtData(l.data)} · {registradoHa(l.data)}. Sem novo semáforo desde então; a pendência
            segue até um novo registro.
          </p>
        </div>
      </div>
    );
  }
  if (estado.ultimo) {
    const c = COR_SEMAFORO[estado.ultimo.resultado];
    const l = estado.ultimo;
    return (
      <div className={cn("flex items-start gap-3 rounded-xl border p-4", c.bg, c.border)}>
        <c.Icon className={cn("mt-0.5 h-6 w-6 shrink-0", c.text)} />
        <div className="min-w-0">
          <div className={cn("font-display text-lg font-bold", c.text)}>{rotuloResultado(l.resultado)}</div>
          <p className="text-sm text-ink-2">
            {fmtData(l.data)} · {registradoHa(l.data)}.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-surface-soft p-4">
      <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-ink-3" />
      <div className="min-w-0">
        <div className="font-display text-lg font-bold text-ink">Sem semáforo registrado</div>
        <p className="text-sm text-ink-2">
          Faça o semáforo de hoje antes da sessão. Registrar por dia é opcional; a ausência não gera
          alerta.
        </p>
      </div>
    </div>
  );
}

/**
 * Uma linha do estado atual do semáforo, para o resumo na aba de treino: Pill do
 * estado + "há N dias" quando há registro. Sem lista de liberações (a aba Semáforo
 * é a fonte do estado, do checklist, da régua e do histórico).
 */
function ResumoSemaforoLinha({ estado }: { estado: EstadoSemaforo }) {
  if (estado.vermelhoPendente) {
    const l = estado.vermelhoPendente;
    return (
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-2">
        <Pill tone="danger" icon={<XCircle className="h-3 w-3" />}>Não liberado</Pill>
        <span>
          em {fmtData(l.data)} · {registradoHa(l.data)}. Faça o semáforo de hoje para reabrir a sessão.
        </span>
      </div>
    );
  }
  if (estado.ultimo) {
    const r = estado.ultimo.resultado;
    const tone = r === "verde" ? "success" : r === "amarelo" ? "warning" : "danger";
    return (
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-2">
        <Pill tone={tone}>{rotuloResultado(r)}</Pill>
        <span>{registradoHa(estado.ultimo.data)}.</span>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-2">
      <Pill tone="neutral">Sem semáforo registrado</Pill>
      <span>Faça o semáforo de hoje antes da sessão.</span>
    </div>
  );
}

/** Exclusão é irreversível (apaga avaliações, prescrições e liberações): confirma antes. */
function ConfirmarExclusaoModal({
  nome,
  onClose,
  onConfirm,
}: {
  nome: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const dialogRef = useDialog<HTMLDivElement>(onClose);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`Excluir ${nome}`}
        className="w-full max-w-sm rounded-card bg-surface p-6 text-center shadow-elevated outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-lg font-bold text-ink">Excluir {nome}?</h2>
        <p className="mt-2 text-sm text-ink-2">
          Isso apaga o aluno com todas as avaliações, prescrições e liberações registradas. Esta ação
          não pode ser desfeita. Se quiser só tirar da lista ativa, prefira arquivar.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <button onClick={onClose} className={buttonClasses("secondary", "sm")}>
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-danger px-4 text-sm font-semibold text-white hover:bg-[#991b1b]"
          >
            Excluir definitivamente
          </button>
        </div>
      </div>
    </div>
  );
}

/** Perfil de treino (objetivo, nível, equipamentos, reavaliação). Vive na Visão geral. */
function PerfilTreinoCard({ aluno, reavaliacaoVencida }: { aluno: Aluno; reavaliacaoVencida: boolean }) {
  return (
    <Card className="p-5 md:p-6">
      <h2 className="mb-3 font-display text-lg font-bold text-ink">Perfil de treino</h2>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <Info icon={<Target className="h-4 w-4 text-primary" />} label="Objetivo" value={aluno.objetivo} />
        {/* Dois objetivos: o par e o que ele implica, com a mesma frase que vai ao prontuário. */}
        {aluno.objetivoSecundario && (
          <div className="sm:col-span-2">
            <dt className="mb-1 flex items-center gap-2 text-ink-3">
              <Target className="h-4 w-4" /> Objetivo secundário
            </dt>
            <dd className="text-ink-2">
              <span className="font-semibold text-ink">{aluno.objetivoSecundario}.</span>{" "}
              {linhaObjetivos(aluno.objetivo, aluno.objetivoSecundario)}
            </dd>
          </div>
        )}
        <Info icon={<Activity className="h-4 w-4 text-analysis" />} label="Nível" value={aluno.nivel} />
        <div className="sm:col-span-2">
          <dt className="mb-1 flex items-center gap-2 text-ink-3">
            <Dumbbell className="h-4 w-4" /> Equipamentos
          </dt>
          <dd className="flex flex-wrap gap-1.5">
            {aluno.equipamentos.map((eq) => (
              <Pill key={eq} tone="neutral">
                {eq}
              </Pill>
            ))}
          </dd>
        </div>
        {aluno.proximaReavaliacaoEm && (
          <Info
            icon={<CalendarPlus className={cn("h-4 w-4", reavaliacaoVencida ? "text-warning" : "text-ink-3")} />}
            label="Reavaliação"
            value={
              reavaliacaoVencida
                ? `vencida (${fmtData(aluno.proximaReavaliacaoEm)})`
                : `em ${diasAte(aluno.proximaReavaliacaoEm)} dias`
            }
          />
        )}
      </dl>
      {aluno.observacoes && (
        <p className="mt-3 rounded-xl border border-border bg-surface-soft p-3 text-sm text-ink-2">
          {aluno.observacoes}
        </p>
      )}
    </Card>
  );
}

function JornadaCard({
  aluno,
  planoAtivo,
  onFase,
}: {
  aluno: Aluno;
  planoAtivo?: PlanoTreino;
  onFase: (n: 1 | 2 | 3 | 4) => void;
}) {
  const grupo = aluno.grupoEspecial ? getSpecialGroup(aluno.grupoEspecial) : undefined;

  if (!grupo) {
    return (
      <Card className="flex flex-wrap items-center gap-3 p-5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-tint text-primary">
          <HeartPulse className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-display font-bold text-ink">Jornada de Prescrição</div>
          <p className="text-sm text-ink-2">
            Associe um grupo especial para guiar modalidades, parâmetros e progressão deste aluno.
          </p>
        </div>
        <Link to="/special-groups" className={buttonClasses("secondary", "sm")}>
          Escolher grupo <ArrowRight className="h-4 w-4" />
        </Link>
      </Card>
    );
  }

  // Modalidades/parâmetros seguem a FASE selecionada (evita dessincronizar ao trocar de fase).
  const fase = (Math.min(4, Math.max(1, aluno.faseJornada ?? 1))) as 1 | 2 | 3 | 4;
  const faseObj = grupo.fases[fase - 1] ?? grupo.fases[0];
  const modalidades = faseObj.modalidades;
  const parametros = faseObj.parametros;

  // Reconciliação (sem auto-sync, decisão travada 13): a fase clínica é julgamento manual;
  // a fase do plano é aritmética de calendário. Quando o mesociclo corrente nasceu de uma
  // fase diferente da avaliação do profissional, mostramos as duas e oferecemos UMA ação.
  const mesoCorrente = planoAtivo ? mesocicloAtual(planoAtivo) : undefined;
  const fasePlano = mesoCorrente?.faseJornada;
  const faseDivergente = fasePlano != null && fasePlano !== fase;

  return (
    <Card className="p-5 md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-tint text-primary">
            <RouteIcon className="h-4 w-4" />
          </span>
          <h2 className="font-display text-lg font-bold text-ink">Jornada de Prescrição</h2>
        </div>
        <Link
          to={`/special-groups/${grupo.slug}?aluno=${aluno.id}&fase=${fase}&origem=aluno`}
          className="text-sm font-semibold text-primary hover:underline"
        >
          Ver jornada completa
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <div>
            <RotuloJ>Grupo especial</RotuloJ>
            <div className="font-semibold text-ink">{grupo.nome}</div>
          </div>
          <div>
            <RotuloJ>Fase da jornada (avança por critério)</RotuloJ>
            <div className="mb-2 flex gap-1.5">
              {([1, 2, 3, 4] as const).map((n) => (
                <button
                  key={n}
                  onClick={() => onFase(n)}
                  aria-label={`Definir fase ${n}`}
                  className={cn(
                    // 44px: acionado com o celular na mão, ao lado do aluno
                    "h-11 w-11 rounded-full text-sm font-bold transition-colors",
                    n === fase ? "gradient-brand text-white" : "bg-surface-soft text-ink-2 hover:bg-primary-tint",
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="text-sm font-semibold text-ink">{faseObj.nome}</div>
            <p className="text-sm text-ink-2">{faseObj.objetivo}</p>
          </div>
          <div>
            <RotuloJ>Modalidades recomendadas</RotuloJ>
            <ModalidadePills ids={modalidades} />
          </div>
          <div>
            <RotuloJ>Parâmetros a acompanhar</RotuloJ>
            <ParametroPills ids={parametros} />
          </div>
        </div>

        <div className="space-y-3">
          <CriteriosLista titulo="Próximos critérios para avançar" itens={faseObj.criteriosAvancar} tipo="avancar" />
          <div className="rounded-xl border border-warning/30 bg-warning-tint/40 p-3">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-warning">Cautelas</div>
            <ul className="space-y-1">
              {grupo.riscosCautelas.slice(0, 3).map((c) => (
                <li key={c} className="flex gap-2 text-sm text-ink-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <Link
            to={`/gps?aluno=${aluno.id}&grupo=${grupo.slug}&fase=${fase}`}
            className={cn(buttonClasses("secondary"), "w-full")}
          >
            <Navigation className="h-4 w-4" /> Escolher exercícios desta fase
          </Link>
        </div>
      </div>

      {faseDivergente && (
        <div className="mt-4 rounded-xl border border-analysis/40 bg-primary-tint p-3 text-sm">
          <p className="text-ink-2">
            <span className="font-semibold text-ink">Sua avaliação: fase {fase}.</span> O plano está na fase {fasePlano}{" "}
            pelo calendário. A fase clínica é decisão sua; o plano não muda sozinho.
          </p>
          <Link
            to={`/gps?aluno=${aluno.id}&grupo=${grupo.slug}&fase=${fase}`}
            className={cn(buttonClasses("secondary", "sm"), "mt-2")}
          >
            <Navigation className="h-4 w-4" /> Escolher exercícios para a fase {fase}
          </Link>
        </div>
      )}
    </Card>
  );
}

/**
 * O plano de treino do aluno, do jeito que o profissional pergunta: em que fase ele está
 * hoje e quando é a próxima reavaliação.
 *
 * A semana é contada pelo calendário, desde a data em que o plano foi montado, e o texto
 * diz isso. O sistema não registra presença, então afirmar "o aluno está na semana 6"
 * como fato seria inventar o que não foi medido.
 */
function PlanoCard({
  aluno,
  planos,
  execucoes,
  podeTreino,
  prontidao,
  onAvaliar,
  onIrParaSemaforo,
}: {
  aluno: Aluno;
  planos: PlanoTreino[];
  /** execuções do aluno: derivam a "sessão de hoje" com os MESMOS helpers do app do aluno */
  execucoes: Execucao[];
  /** gate duro do trilho: sem prontidão, "Montar treino" fica desabilitado */
  podeTreino: { ok: boolean; motivo?: string };
  /** o detalhe do que falta, para o card explicar em vez de só desabilitar */
  prontidao: Prontidao;
  onAvaliar: () => void;
  /** abre a aba Semáforo do aluno (nunca sai para /semaforo) */
  onIrParaSemaforo: () => void;
}) {
  const ativo = planos.find((p) => p.status === "ativo");
  const arquivados = planos.filter((p) => p.status === "arquivado");

  if (!ativo) {
    return (
      <Card id="treino-card" className="scroll-mt-24 p-5 md:p-6">
        <h2 className="mb-3 font-display text-lg font-bold text-ink">Treino do aluno</h2>
        <div className="rounded-xl border border-dashed border-border p-4 text-center">
          <p className="text-sm text-ink-2">
            Sem treino montado ainda. O treino organiza os meses de {aluno.nome.split(" ")[0]} em macrociclo,
            mesociclos e semanas, com a progressão justificada.
          </p>
          {podeTreino.ok ? (
            <Link to={`/prescrever-treino?aluno=${aluno.id}`} className={cn(buttonClasses("secondary", "sm"), "mt-3")}>
              <CalendarRange className="h-4 w-4" /> Montar treino
            </Link>
          ) : (
            <>
              {/* NÃO esconder o CTA: mostrar desabilitado e explicar por quê, com o atalho. */}
              <button disabled className={cn(buttonClasses("secondary", "sm"), "mt-3")}>
                <CalendarRange className="h-4 w-4" /> Montar treino
              </button>
              <div className="mt-3">
                <ProntidaoAviso aluno={aluno} prontidao={prontidao} onAvaliar={onAvaliar} />
              </div>
            </>
          )}
        </div>
        {arquivados.length > 0 && (
          <p className="mt-3 text-xs text-ink-3">
            {arquivados.length} plano(s) arquivado(s) no histórico.
          </p>
        )}
      </Card>
    );
  }

  const semana = semanaAtual(ativo);
  const meso = mesocicloAtual(ativo);
  const reav = proximaReavaliacao(ativo);
  const chegou = reav ? reav.em <= Date.now() + 7 * 86_400_000 : false;
  const modelo = getModelo(ativo.modeloId);
  const pct = Math.round((semana / ativo.semanas) * 100);

  // Treino de hoje: a MESMA sessão que o app do aluno abre (helpers puros compartilhados,
  // nunca reimplementados), para o profissional e o aluno nunca divergirem sobre "hoje".
  const sessaoHoje = sessoesDeHoje(ativo)[sessaoDeHojeIndex(ativo, execucoes)];

  // Escalas de monitoramento acopladas ao treino do dia: com grupo, seguem a fase da jornada
  // (mesma derivação do JornadaCard); sem grupo, fallback seguro por objetivo (id real, nunca
  // inventado).
  const grupo = aluno.grupoEspecial ? getSpecialGroup(aluno.grupoEspecial) : undefined;
  const faseAluno = (Math.min(4, Math.max(1, aluno.faseJornada ?? 1))) as 1 | 2 | 3 | 4;
  const idsParametros = grupo
    ? (grupo.fases[faseAluno - 1] ?? grupo.fases[0]).parametros
    : parametrosPadraoTreino(ativo.objetivo);

  return (
    <Card id="treino-card" className="scroll-mt-24 p-5 md:p-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-ink">Treino do aluno</h2>
        <Link to={`/prescrever-treino?aluno=${aluno.id}`} className="text-sm font-semibold text-primary hover:underline">
          Novo
        </Link>
      </div>

      <div className="rounded-xl border border-border p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate font-semibold text-ink">{ativo.titulo}</span>
          <Pill tone="success">ativo</Pill>
          <Pill tone="neutral">{modelo.nome}</Pill>
        </div>
        <p className="tabular mt-0.5 text-xs text-ink-3">
          Montado em {fmtData(ativo.data)} · {ativo.frequenciaSemanal}x por semana
        </p>

        {/* Onde o plano está, contando do calendário */}
        <div className="mt-3">
          <div className="mb-1 flex items-baseline justify-between text-sm">
            <span className="font-semibold text-ink">
              Semana {semana} de {ativo.semanas}
            </span>
            <span className="text-xs text-ink-3">contando desde {fmtData(ativo.data)}</span>
          </div>
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-surface-soft"
            role="progressbar"
            aria-valuenow={semana}
            aria-valuemin={1}
            aria-valuemax={ativo.semanas}
            aria-label={`Semana ${semana} de ${ativo.semanas} do plano`}
          >
            <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {meso && (
          <div className="mt-3 rounded-lg bg-surface-soft p-2.5">
            <p className="text-2xs font-semibold uppercase tracking-wide text-ink-3">Bloco atual do plano (pelo calendário)</p>
            <p className="text-sm font-semibold text-ink">{rotuloMeso(meso)}</p>
            <p className="text-xs text-ink-2">{meso.foco}</p>
            {meso.capacidades.length > 0 && (
              <div className="mt-2">
                <ListaChips titulo="Capacidades priorizadas" itens={meso.capacidades} />
              </div>
            )}
          </div>
        )}

        {/* Treino de hoje: o conteúdo da sessão que o aluno abre hoje, aqui mesmo no perfil,
            sem precisar da prévia ou do editor. O semáforo é recomendado, não bloqueia isto. */}
        {sessaoHoje && (
          <div className="mt-3 rounded-lg border border-border p-3">
            <div className="mb-1.5 flex items-center gap-1.5">
              <Dumbbell className="h-3.5 w-3.5 text-primary" />
              <p className="text-2xs font-semibold uppercase tracking-wide text-ink-3">Treino de hoje</p>
            </div>
            <p className="text-sm font-semibold text-ink">{sessaoHoje.nome}</p>
            {sessaoHoje.foco && <p className="text-xs text-ink-3">{sessaoHoje.foco}</p>}
            {sessaoHoje.blocos.length > 0 && (
              <ul className="mt-2 overflow-hidden rounded-xl border border-border">
                {sessaoHoje.blocos.map((b) => {
                  const tokens = tokensDoBloco(b);
                  return (
                    <LinhaDeDose
                      key={b.id}
                      nome={nomeDoBloco(b)}
                      icon={b.tipo === "aerobio" ? <HeartPulse className="h-4 w-4" /> : <Dumbbell className="h-4 w-4" />}
                    >
                      {tokens.length > 0 && (
                        <LinhaDeTokens>
                          {tokens.map((t) => (
                            <TokenDose key={t.label} label={t.label} value={t.value} />
                          ))}
                        </LinhaDeTokens>
                      )}
                    </LinhaDeDose>
                  );
                })}
              </ul>
            )}
            {/* Fecho de flexibilidade da sessão (onda F), quando o plano o traz. */}
            {sessaoHoje.fecho && (
              <div className="mt-2 rounded-lg border border-l-2 border-border border-l-primary bg-surface-soft p-2.5">
                <p className="text-xs text-ink-2">{sessaoHoje.fecho}</p>
              </div>
            )}
            {/* Escalas de monitoramento acopladas ao treino do dia (item 3): toque para ver
                como aplicar, escala e ficha. */}
            {idsParametros.length > 0 && (
              <div className="mt-2.5 border-t border-border pt-2.5">
                <p className="mb-1.5 text-2xs font-semibold uppercase tracking-wide text-ink-3">
                  Escalas para acompanhar hoje
                </p>
                <ParametroPills ids={idsParametros} contexto={{ alunoNome: aluno.nome, objetivo: ativo.objetivo }} />
              </div>
            )}
          </div>
        )}

        {/* A reavaliação é o ponto em que o plano pede uma decisão: progredir, manter ou
            regredir. Quando ela chega, o caminho para registrar a avaliação fica aqui. */}
        {reav && (
          <div
            className={cn(
              "mt-3 flex flex-wrap items-center gap-2 rounded-lg p-2.5 text-sm",
              chegou ? "border border-analysis/40 bg-primary-tint" : "",
            )}
          >
            <CalendarCheck className="h-4 w-4 shrink-0 text-analysis" />
            <span className="min-w-0 flex-1 text-ink-2">
              {chegou ? (
                <>
                  <span className="font-semibold text-ink">Reavaliação da semana {reav.semana} chegou.</span> Registre
                  as medidas para decidir entre progredir, manter ou ajustar.
                </>
              ) : (
                <>Próxima reavaliação prevista na semana {reav.semana}, por volta de {fmtData(reav.em)}.</>
              )}
            </span>
            {chegou && (
              <button onClick={onAvaliar} className={buttonClasses("secondary", "sm")}>
                <Activity className="h-4 w-4" /> Reavaliar
              </button>
            )}
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-2.5">
          <Link
            to={`/prescrever-treino?plano=${ativo.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            <CalendarRange className="h-4 w-4" /> Abrir e editar o plano
          </Link>
          {/* Exceção diária: personalizar a sessão desta semana sem remontar o treino. */}
          <Link
            to={`/gps?aluno=${aluno.id}&modo=dia`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            <Navigation className="h-4 w-4" /> Personalizar o treino do dia
          </Link>
          <button
            onClick={onIrParaSemaforo}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-2 hover:text-ink"
          >
            <ShieldCheck className="h-4 w-4" /> Fazer o semáforo de hoje
          </button>
        </div>
      </div>

      {arquivados.length > 0 && (
        <p className="mt-3 text-xs text-ink-3">{arquivados.length} plano(s) anterior(es) arquivado(s).</p>
      )}
    </Card>
  );
}

function RotuloJ({ children }: { children: React.ReactNode }) {
  return <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-3">{children}</div>;
}

/**
 * Uma linha honesta sobre o acesso deste aluno, consultada na hora: já entrou,
 * tem convite pendente, ou ainda não recebeu nada. O botão de convidar fica ao
 * lado; aqui é só o estado, porque "gerar link" sem saber se o aluno já entrou é
 * o que fazia o profissional gerar link atrás de link sem entender o ciclo.
 */
function AcessoStatusLinha({ aluno }: { aluno: Aluno }) {
  const [st, setSt] = React.useState<{ vinculado: boolean; vinculadoEm?: number; convite?: ConviteAluno } | null>(null);
  const [falhou, setFalhou] = React.useState(false);
  React.useEffect(() => {
    let vivo = true;
    statusAcessoAluno(aluno.id)
      .then((r) => vivo && setSt(r))
      .catch(() => vivo && setFalhou(true));
    return () => {
      vivo = false;
    };
  }, [aluno.id]);

  if (falhou) return <p className="mt-1 text-sm text-ink-2">Não consegui consultar o acesso agora.</p>;
  if (!st) return <p className="mt-1 text-sm text-ink-3">Consultando o acesso...</p>;
  if (st.vinculado)
    return (
      <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-ink-2">
        <Pill tone="success" icon={<CheckCircle2 className="h-3.5 w-3.5" />}>
          Já está no app
        </Pill>
        {st.vinculadoEm ? `desde ${fmtData(st.vinculadoEm)}` : null}
      </p>
    );
  if (st.convite)
    return (
      <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-ink-2">
        <Pill tone="warning">Convite enviado</Pill>
        vale até {fmtData(st.convite.expiraEm)}, ainda não usado
      </p>
    );
  return <p className="mt-1 text-sm text-ink-2">Ainda sem acesso. Gere o link e envie pelo WhatsApp.</p>;
}

function MiniStat({
  icon,
  rotulo,
  valor,
  tone,
}: {
  icon: React.ReactNode;
  rotulo: string;
  valor: string;
  tone?: "warning";
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border p-3 sm:items-center">
      {/* Mobile: sem o quadrado de 36px (comia a largura e amputava o valor); o
          ícone volta inline, 16px, junto ao rótulo. Desktop mantém o quadrado. */}
      <span
        className={cn(
          "hidden h-9 w-9 shrink-0 place-items-center rounded-lg sm:grid",
          tone === "warning" ? "bg-warning-tint text-warning" : "bg-surface-soft text-ink-2",
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-xs text-ink-3">
          <span className="shrink-0 sm:hidden">{icon}</span>
          {rotulo}
        </div>
        <div
          className={cn(
            "mt-0.5 text-sm font-semibold leading-snug sm:truncate",
            tone === "warning" ? "text-warning" : "text-ink",
          )}
        >
          {valor}
        </div>
      </div>
    </div>
  );
}

function Medida({ label, value }: { label: string; value: string }) {
  return (
    <span className="text-ink-2">
      {label}: <span className="font-semibold text-ink">{value}</span>
    </span>
  );
}

// Rótulo em cima do valor (ParDado stack): a versão antiga usava justify-between
// e o par se afastava até as bordas da célula. Mantém a assinatura antiga.
function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <ParDado icon={icon} label={label} value={value} />;
}

/**
 * Bloco de bloqueio do trilho, inline e visível (nunca tooltip): sem avaliação, o
 * treino e a prescrição não nascem. Diz o porquê e leva direto a registrar a
 * avaliação, ao lado do CTA que fica desabilitado.
 */
/* ------------------------ Visão geral: os 4 cartões ----------------------- */

/**
 * A VISÃO GERAL do aluno, na forma do mockup: quatro cartões que respondem, sem
 * clique nenhum, "como ele está hoje". Cada cartão é RESUMO do que já existe nas
 * outras abas e leva para lá; nenhum deles calcula nada por conta própria.
 */

/** 1) Semáforo de hoje: o estado do dia e os últimos 7 dias em uma linha. */
function VisaoSemaforo({
  estado,
  historico,
  onFazer,
}: {
  estado: EstadoSemaforo;
  /** liberações do aluno, da mais recente para a mais antiga */
  historico: Liberacao[];
  onFazer: () => void;
}) {
  const DIA = 86_400_000;
  const seteDias = historico.filter((l) => Date.now() - l.data <= 7 * DIA);
  const conta = (r: Liberacao["resultado"]) => seteDias.filter((l) => l.resultado === r).length;
  const pendente = estado.vermelhoPendente;

  return (
    <Card className="flex flex-col p-5">
      <Eyebrow>Semáforo · hoje</Eyebrow>
      {estado.hoje ? (
        <>
          <div className="mt-1 font-display text-lg font-bold text-ink">
            {estado.hoje.resultado === "verde"
              ? "Liberado hoje"
              : estado.hoje.resultado === "amarelo"
                ? "Liberado com ajuste"
                : "Não liberado hoje"}
          </div>
          <p className="mt-0.5 text-sm text-ink-2">
            Registrado às{" "}
            {new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(estado.hoje.data))}.
          </p>
        </>
      ) : pendente ? (
        <>
          <div className="mt-1 font-display text-lg font-bold text-danger">
            Não liberado em {fmtData(pendente.data)}
          </div>
          <p className="mt-0.5 text-sm text-ink-2">Refaça o semáforo hoje antes da sessão.</p>
        </>
      ) : (
        <>
          <div className="mt-1 font-display text-lg font-bold text-ink">Sem semáforo hoje</div>
          <p className="mt-0.5 text-sm text-ink-2">Faça antes da sessão para liberar, ajustar ou segurar o treino.</p>
        </>
      )}

      {seteDias.length > 0 && (
        <p className="mt-3 border-t border-border pt-3 text-xs text-ink-2">
          <span className="font-semibold uppercase tracking-wide text-ink-3">Últimos 7 dias</span>{" "}
          <span className="tabular">
            {conta("verde")} liberado{conta("verde") === 1 ? "" : "s"} · {conta("amarelo")} com ajuste ·{" "}
            {conta("vermelho")} não liberado{conta("vermelho") === 1 ? "" : "s"}
          </span>
        </p>
      )}

      <button onClick={onFazer} className={cn(buttonClasses("primary", "sm"), "mt-4 self-start")}>
        <ShieldCheck className="h-4 w-4" /> {estado.hoje ? "Refazer o semáforo" : "Fazer semáforo agora"}
      </button>
    </Card>
  );
}

/** 2) Treino ativo: plano, fase, sessões da semana e o atalho para o plano. */
function VisaoTreino({
  plano,
  alunoId,
  onVer,
  podeTreino,
}: {
  plano?: PlanoTreino;
  alunoId: string;
  onVer: () => void;
  podeTreino: { ok: boolean; motivo?: string };
}) {
  if (!plano) {
    return (
      <Card className="flex flex-col p-5">
        <Eyebrow>Treino ativo</Eyebrow>
        <div className="mt-1 font-display text-lg font-bold text-ink">Sem treino montado</div>
        <p className="mt-0.5 text-sm text-ink-2">
          {podeTreino.ok ? "A avaliação já está pronta; o próximo passo é montar o plano." : podeTreino.motivo}
        </p>
        {podeTreino.ok && (
          <Link to={`/prescrever-treino?aluno=${alunoId}`} className={cn(buttonClasses("primary", "sm"), "mt-4 self-start")}>
            <CalendarRange className="h-4 w-4" /> Montar treino
          </Link>
        )}
      </Card>
    );
  }

  const semana = semanaAtual(plano);
  const meso = mesocicloAtual(plano);
  const micro = plano.macrociclo.mesociclos.flatMap((m) => m.microciclos).find((mc) => mc.semana === semana);
  const sessoes = micro?.sessoes ?? [];

  return (
    <Card className="flex flex-col p-5">
      <Eyebrow>Treino ativo</Eyebrow>
      <div className="mt-1 font-display text-lg font-bold text-ink">Plano de {plano.semanas} semanas</div>
      <p className="mt-0.5 text-sm text-ink-2">
        {meso ? `${rotuloMeso(meso)} · ` : ""}semana {semana} · {plano.frequenciaSemanal}x por semana
      </p>

      {/* Trilho de fases, como no mockup: a atual em sólido. */}
      <div className="mt-3 flex gap-1.5">
        {plano.macrociclo.mesociclos.map((m) => {
          const atual = semana >= m.semanaInicio && semana <= m.semanaFim;
          return (
            <span
              key={m.id}
              className={cn(
                "min-w-0 flex-1 truncate rounded-full px-2 py-1 text-center text-2xs font-bold",
                atual ? "bg-ink text-surface" : "bg-surface-soft text-ink-2",
              )}
            >
              {rotuloMeso(m)}
            </span>
          );
        })}
      </div>

      {sessoes.length > 0 && (
        <p className="mt-2.5 truncate text-sm text-ink-2">{sessoes.map((s) => s.nome).join(" · ")}</p>
      )}

      <button onClick={onVer} className={cn(buttonClasses("secondary", "sm"), "mt-4 self-start")}>
        Ver treino completo <ArrowRight className="h-4 w-4" />
      </button>
    </Card>
  );
}

/** 3) Última avaliação: as medidas em grade e a data da próxima. */
function VisaoAvaliacao({
  avals,
  reav,
  vencida,
  onVer,
  onAvaliar,
}: {
  /** avaliações do aluno em ordem crescente de data */
  avals: Avaliacao[];
  reav: { em: number; semana?: number } | null;
  vencida: boolean;
  onVer: () => void;
  onAvaliar: () => void;
}) {
  const ultima = avals[avals.length - 1];
  if (!ultima) {
    return (
      <Card className="flex flex-col p-5">
        <Eyebrow>Última avaliação</Eyebrow>
        <div className="mt-1 font-display text-lg font-bold text-ink">Nenhuma avaliação ainda</div>
        <p className="mt-0.5 text-sm text-ink-2">A avaliação inicial abre o resto do ciclo de cuidado.</p>
        <button onClick={onAvaliar} className={cn(buttonClasses("primary", "sm"), "mt-4 self-start")}>
          <CalendarPlus className="h-4 w-4" /> Registrar avaliação
        </button>
      </Card>
    );
  }

  const anterior = avals[avals.length - 2];
  const delta = (a?: number, b?: number) => (a != null && b != null ? a - b : undefined);
  const dPeso = delta(ultima.medidas.peso, anterior?.medidas.peso);
  const m = ultima.medidas;
  // Só as medidas que EXISTEM nesta avaliação entram na grade.
  const celulas: { valor: string; rotulo: string; delta?: number }[] = [];
  if (m.peso != null) celulas.push({ valor: `${m.peso} kg`, rotulo: "peso", delta: dPeso });
  if (m.paSistolica != null && m.paDiastolica != null)
    celulas.push({ valor: `${m.paSistolica}/${m.paDiastolica}`, rotulo: "PA repouso" });
  if (m.percentualGordura != null) celulas.push({ valor: `${m.percentualGordura}%`, rotulo: "gordura" });
  if (m.cintura != null) celulas.push({ valor: `${m.cintura} cm`, rotulo: "cintura" });
  if (m.fcRepouso != null) celulas.push({ valor: String(m.fcRepouso), rotulo: "FC repouso" });

  return (
    <Card className="flex flex-col p-5">
      <Eyebrow>Última avaliação · {fmtData(ultima.data)}</Eyebrow>
      <dl className="mt-2 grid grid-cols-3 gap-x-3 gap-y-2.5">
        {celulas.map((c) => (
          <div key={c.rotulo}>
            <dt className="text-2xs text-ink-2">{c.rotulo}</dt>
            <dd className="tabular font-display text-base font-bold text-ink">
              {c.valor}
              {c.delta != null && c.delta !== 0 && (
                // Em linha própria: grudado no valor, "69 kg" e "menos 1,5" viravam
                // uma palavra só para quem lê por leitor de tela.
                <span
                  className={cn("block text-2xs font-bold", c.delta < 0 ? "text-success" : "text-warning")}
                >
                  {c.delta < 0 ? "menos" : "mais"}{" "}
                  {Math.abs(Number(c.delta.toFixed(1))).toLocaleString("pt-BR")} desde a anterior
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>

      {reav && (
        <p className={cn("mt-3 border-t border-border pt-3 text-xs", vencida ? "text-warning" : "text-ink-2")}>
          <span className="font-semibold">Reavaliação {vencida ? "vencida" : "marcada"}:</span> {fmtData(reav.em)}
          {reav.semana ? ` · fim da semana ${reav.semana}` : ""}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={onAvaliar} className={buttonClasses("primary", "sm")}>
          <CalendarPlus className="h-4 w-4" /> Reavaliar
        </button>
        <button onClick={onVer} className={buttonClasses("secondary", "sm")}>
          Histórico <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}

/** 4) No app do aluno: sequência, treinos da semana, esforço médio e o recado. */
function VisaoNoApp({
  aluno,
  execucoes,
  feedbacks,
  onVer,
}: {
  aluno: Aluno;
  execucoes: Execucao[];
  /** feedbacks do aluno, do mais recente para o mais antigo */
  feedbacks: SessaoFeedback[];
  onVer: () => void;
}) {
  const DIA = 86_400_000;
  const streak = sequenciaDias(execucoes);
  const diaSemana = (new Date().getDay() + 6) % 7;
  const inicio = new Date().setHours(0, 0, 0, 0) - diaSemana * DIA;
  const naSemana = new Set(
    execucoes.filter((e) => e.concluidoEm >= inicio).map((e) => Math.floor(e.concluidoEm / DIA)),
  ).size;
  const notas = feedbacks.map((f) => f.pse).filter((n): n is number => n != null);
  const media = notas.length ? Math.round(notas.reduce((s, n) => s + n, 0) / notas.length) : null;
  const recado = feedbacks.find((f) => f.observacao);
  const semNada = execucoes.length === 0 && feedbacks.length === 0;

  return (
    <Card className="flex flex-col p-5">
      <Eyebrow>No app de {aluno.nome.split(" ")[0]}</Eyebrow>
      {semNada ? (
        <>
          <div className="mt-1 font-display text-lg font-bold text-ink">Ainda sem registro</div>
          <p className="mt-0.5 text-sm text-ink-2">
            Quando o aluno registrar o treino no celular, a sequência e o esforço aparecem aqui.
          </p>
        </>
      ) : (
        <>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            {streak.atual > 0 && (
              <span className="tabular font-display text-lg font-bold text-ink">
                {streak.atual} {streak.atual === 1 ? "dia" : "dias"} de sequência
              </span>
            )}
            {media != null && (
              <span className="text-sm text-ink-2">
                esforço médio <strong className="text-ink">{media}</strong> (Borg)
              </span>
            )}
          </div>
          <p className="tabular mt-0.5 text-sm text-ink-2">
            {naSemana} {naSemana === 1 ? "treino" : "treinos"} nesta semana
          </p>
          {recado?.observacao && (
            <p className="mt-3 rounded-card border border-border bg-surface-soft p-3 text-sm italic text-ink-2">
              {recado.observacao} <span className="not-italic text-xs">· {fmtData(recado.concluidaEm)}</span>
            </p>
          )}
        </>
      )}
      <button onClick={onVer} className={cn(buttonClasses("secondary", "sm"), "mt-4 self-start")}>
        <Smartphone className="h-4 w-4" /> Ver o app do aluno
      </button>
    </Card>
  );
}
