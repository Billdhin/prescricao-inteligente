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
  Check,
  CheckCircle2,
  XCircle,
  CalendarRange,
  CalendarCheck,
  Wallet,
  MoreHorizontal,
  Plus,
  ClipboardList,
} from "lucide-react";
import { Card, Pill, buttonClasses, ParDado, LinhaDeDose, LinhaDeTokens, TokenRotulado, Eyebrow, type PillTone } from "@/components/ui/primitives";
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
import { estadoSemaforo, type EstadoSemaforo } from "@/lib/gps/semaforoDiario";
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
import { ROTULO_STATUS_COBRANCA, formatBRL, statusEfetivo } from "@/data/cobranca";
import { getSpecialGroup } from "@/data/specialGroups";
import { getModelo, rotuloMeso, rotuloFrequencia, semanaAtual, mesocicloAtual, proximaReavaliacao, sessoesDeHoje, sessaoDeHojeIndex, parametrosPadraoTreino, type PlanoTreino } from "@/data/periodizacao";
import { ModalidadePills, ParametroPills, CriteriosLista } from "@/components/special/SpecialUI";
import { ConviteAlunoModal } from "@/components/app/ConviteAlunoModal";
import { AvaliacaoModal } from "@/components/app/AvaliacaoModal";
import { EvolucaoMini, TabelaEvolucao } from "@/components/app/EvolucaoMini";
import { TresCamadas } from "@/components/ui/camadas";
import { montarChecklist } from "@/data/semaforo";
import { exportEvolucaoPDF } from "@/lib/exportEvolucao";
import { useDialog } from "@/lib/useDialog";
import { ConfirmarAcao } from "@/components/app/ConfirmarAcao";
import { toast, toastDesfazer } from "@/lib/toast";
import { cn } from "@/lib/utils";

const DIA = 86_400_000;
const fmtData = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(ts));
const diasAte = (ts: number) => Math.round((ts - Date.now()) / DIA);
const fmtDiaMes = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(ts));
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
  { id: "visao", label: "Visão", Icon: LayoutGrid },
  { id: "avaliacoes", label: "Avaliações", Icon: Activity },
  { id: "treino", label: "Treino", Icon: Dumbbell },
  { id: "semaforo", label: "Semáforo", Icon: ShieldCheck },
  { id: "conta", label: "Cobrança", Icon: Wallet },
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

/** Mês abreviado + ano ("mai/2026"), para "aluno(a) desde" no cabeçalho. */
const MESES_ABREV = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const fmtMesAno = (ts: number) => {
  const d = new Date(ts);
  return `${MESES_ABREV[d.getMonth()]}/${d.getFullYear()}`;
};

/** Menu "..." do cabeçalho do aluno: as ações menos frequentes (editar perfil,
 *  inativar/reativar) num só lugar, para o topo mostrar só Convidar e Exportar. */
function MenuAcoes({ ativo, onEditar, onToggleStatus }: { ativo: boolean; onEditar: () => void; onToggleStatus: () => void }) {
  const [aberto, setAberto] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!aberto) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setAberto(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [aberto]);
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setAberto((o) => !o)}
        aria-label="Mais ações"
        aria-expanded={aberto}
        aria-haspopup="menu"
        className="grid h-10 w-10 place-items-center rounded-full border border-border bg-surface text-ink-2 hover:text-ink"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {aberto && (
        <div role="menu" className="absolute right-0 z-30 mt-2 w-52 rounded-card border border-border bg-surface p-1.5 shadow-elevated">
          <button
            role="menuitem"
            onClick={() => { setAberto(false); onEditar(); }}
            className="block w-full rounded-full px-3 py-1.5 text-left text-sm text-ink hover:bg-surface-soft"
          >
            Editar perfil
          </button>
          <button
            role="menuitem"
            onClick={() => { setAberto(false); onToggleStatus(); }}
            className="block w-full rounded-full px-3 py-1.5 text-left text-sm text-ink hover:bg-surface-soft"
          >
            {ativo ? "Marcar como inativo" : "Reativar aluno"}
          </button>
        </div>
      )}
    </div>
  );
}

/** "há N dias" a partir de uma data (0 = hoje), para a faixa de estado. */
const registradoHa = (ts: number) => {
  const dias = Math.floor((Date.now() - ts) / DIA);
  if (dias <= 0) return "registrado hoje";
  return `registrado há ${dias} ${dias === 1 ? "dia" : "dias"}`;
};

/** Dia relativo ("hoje"/"ontem"/DD/MM) e a hora, para as linhas do tempo. */
const rotuloDiaTempo = (ts: number): { dia: string; hora: string } => {
  const d = new Date(ts);
  const hoje = new Date();
  const zero = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const difDias = Math.round((zero(hoje) - zero(d)) / DIA);
  const dia = difDias === 0 ? "hoje" : difDias === 1 ? "ontem" : new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(d);
  const hora = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(d);
  return { dia, hora };
};

interface EventoTempo {
  ts: number;
  dot: string;
  destaque?: boolean;
  titulo: string;
  sub?: string;
  chip?: { label: string; tone: PillTone };
}

/**
 * LINHA DO TEMPO do aluno: um feed único e cronológico do que aconteceu (semáforos,
 * treinos concluídos no app, treino publicado e avaliações), todos derivados dos
 * mesmos registros que as outras abas usam. Não inventa evento: só reúne e ordena.
 */
function LinhaDoTempo({
  avaliacoes,
  planos,
  feedbacks,
  liberacoes,
}: {
  avaliacoes: Avaliacao[];
  planos: PlanoTreino[];
  feedbacks: SessaoFeedback[];
  liberacoes: Liberacao[];
}) {
  const [tudo, setTudo] = React.useState(false);
  const eventos: EventoTempo[] = [];
  for (const l of liberacoes) {
    eventos.push({
      ts: l.data,
      dot: l.resultado === "verde" ? "bg-success" : l.resultado === "amarelo" ? "bg-warning" : "bg-danger-fill",
      destaque: l.resultado === "vermelho",
      titulo: `Semáforo: ${rotuloResultado(l.resultado)}`,
      sub: l.ajustes.length ? l.ajustes[0].acao : undefined,
    });
  }
  for (const f of feedbacks) {
    eventos.push({
      ts: f.concluidaEm,
      dot: "bg-analysis-fill",
      titulo: "Treino concluído no app",
      sub: f.observacao || undefined,
      chip: f.pse != null ? { label: `esforço ${f.pse}`, tone: "warning" } : undefined,
    });
  }
  for (const p of planos) {
    eventos.push({
      ts: p.data,
      dot: "bg-primary",
      titulo: "Treino publicado no app",
      sub: `Plano de ${p.semanas} semanas · ${rotuloFrequencia(p)}`,
    });
  }
  for (const a of avaliacoes) {
    const partes = [
      a.medidas?.peso != null ? `${a.medidas.peso} kg` : null,
      a.medidas?.percentualGordura != null ? `${a.medidas.percentualGordura}% gordura` : null,
    ].filter(Boolean) as string[];
    eventos.push({
      ts: a.data,
      dot: "bg-ink-3",
      titulo: "Avaliação registrada",
      sub: partes.length ? partes.join(" · ") : a.observacoes || undefined,
    });
  }
  eventos.sort((x, y) => y.ts - x.ts);

  if (eventos.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-sm text-ink-2">Ainda sem histórico. As avaliações, os treinos e os semáforos aparecem aqui em ordem.</p>
      </Card>
    );
  }

  const vis = tudo ? eventos : eventos.slice(0, 6);
  return (
    <div className="space-y-2">
      {vis.map((e, i) => {
        const { dia, hora } = rotuloDiaTempo(e.ts);
        return (
          <div
            key={i}
            className={cn(
              "flex items-start gap-3 rounded-card border border-border bg-surface p-3",
              e.destaque && "border-l-4 border-l-danger-fill",
            )}
          >
            <div className="w-14 shrink-0 pt-0.5 text-right">
              <div className="text-xs font-semibold text-ink">{dia}</div>
              <div className="tabular text-2xs text-ink-3">{hora}</div>
            </div>
            <span aria-hidden className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", e.dot)} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-ink">{e.titulo}</span>
                {e.chip && <Pill tone={e.chip.tone}>{e.chip.label}</Pill>}
              </div>
              {e.sub && <p className="mt-0.5 text-sm text-ink-2">{e.sub}</p>}
            </div>
          </div>
        );
      })}
      {eventos.length > 6 && (
        <button
          type="button"
          onClick={() => setTudo((v) => !v)}
          className="text-sm font-semibold text-primary hover:underline"
        >
          {tudo ? "Ver menos" : `Ver os ${eventos.length} registros`}
        </button>
      )}
    </div>
  );
}

/** Tira de abas da tela do aluno: agrupa o que antes eram 8 cards soltos em
 *  poucos destinos claros, no espírito do painel de atleta do ION. */
function AlunoTabs({ aba, onAba, contagens }: { aba: Aba; onAba: (a: Aba) => void; contagens?: Partial<Record<Aba, number>> }) {
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
            {contagens?.[id] != null && contagens[id]! > 0 && (
              <span className={cn("tabular text-xs font-bold", ativo ? "text-primary" : "text-ink-3")}>{contagens[id]}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// O CTA primário do próximo passo vive numa fonte só: a Linha do cuidado
// (`LinhaDoCuidado`/`CtaPasso`), que é a âncora do ciclo. O antigo `CtaProximoPasso`
// duplicava esse primário no cabeçalho e no banner de recém-criado, empilhando duas
// ações escuras idênticas na mesma dobra. Removido: o cabeçalho fica com Editar,
// Convidar e Avaliar; o banner só contextualiza.

export function AlunoDetail() {
  const { id = "" } = useParams();
  const { alunos, avaliacoes, prescricoes, planos, liberacoes, execucoes, sessaoFeedbacks, addAvaliacao, updateAluno, updatePlano, removeAluno, archivePrescricao, unarchivePrescricao } =
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
  /**
   * Ir a um card que vive DENTRO de uma aba.
   *
   * Estes atalhos já foram `<a href="#treino-card">`, e faziam nada visível: o card
   * mora na aba "Plano e treino", que não está montada enquanto a aba aberta é outra,
   * então não havia elemento para o navegador achar. Pior, a navegação por hash
   * trocava a entrada de histórico e levava junto o `location.state` que segurava o
   * próprio aviso, que sumia. Era exatamente o "só fechou a mensagem e não foi para
   * canto nenhum". Agora troca a aba primeiro e só então rola, no quadro seguinte,
   * quando o card existe de verdade.
   */
  const irParaCard = React.useCallback((destino: Aba, id: string) => {
    setAba(destino);
    requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }),
      ),
    );
  }, []);
  // Prescrição escolhida para o diálogo "Colocar no treino".
  const [aplicarPresc, setAplicarPresc] = React.useState<Prescricao | null>(null);
  // Modal de convite: o ciclo de acesso do aluno (link, senha dele, status) num só lugar.
  const [convidar, setConvidar] = React.useState(false);
  const [params, setParams] = useSearchParams();

  // ?avaliar=1 (vindo de Avaliações) abre o modal de registrar avaliação; ?aba= troca
  // a aba. O estado inicial já consome ambos no primeiro paint, mas o efeito depende de
  // `params` (não de `[]`) por um caso real: clicar numa notificação do PRÓPRIO aluno
  // pelo sino, já estando na ficha dele. O React Router reusa a instância montada, então
  // um efeito só-de-mount ignorava a nova query e o clique parecia não fazer nada. Ambos
  // os params são limpos depois de aplicados.
  React.useEffect(() => {
    let mudou = false;
    const abaParam = params.get("aba");
    if (abaParam) {
      if (ABA_IDS.has(abaParam)) setAba(abaParam as Aba);
      params.delete("aba");
      mudou = true;
    }
    if (params.get("avaliar") === "1") {
      setAvaliar(true);
      params.delete("avaliar");
      mudou = true;
    }
    if (mudou) setParams(params, { replace: true });
  }, [params, setParams]);

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

  // Paginador da carteira: navegar entre alunos na MESMA ordem da lista, sem voltar.
  const idxAluno = alunos.findIndex((a) => a.id === aluno.id);
  const prevAlunoId = idxAluno > 0 ? alunos[idxAluno - 1].id : undefined;
  const nextAlunoId = idxAluno >= 0 && idxAluno < alunos.length - 1 ? alunos[idxAluno + 1].id : undefined;
  const grupo = aluno.grupoEspecial ? getSpecialGroup(aluno.grupoEspecial) : undefined;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Cabeçalho PRÓPRIO da tela (a barra global vive só no Meu dia): voltar,
          trilha, paginação da carteira e as ações do aluno. */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <button
          type="button"
          onClick={() => navigate("/alunos")}
          aria-label="Voltar para Alunos"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-surface text-ink-2 transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <nav aria-label="Trilha" className="flex min-w-0 items-center gap-1.5 text-sm font-medium">
          <Link to="/alunos" className="text-ink-2 hover:text-ink">Alunos</Link>
          <span aria-hidden className="text-ink-3">›</span>
          <span className="truncate font-semibold text-ink">{aluno.nome}</span>
        </nav>
        {alunos.length > 1 && idxAluno >= 0 && (
          <div className="inline-flex items-center gap-0.5 rounded-full border border-border bg-surface p-1 text-xs font-semibold text-ink-2">
            <button
              type="button"
              disabled={!prevAlunoId}
              onClick={() => prevAlunoId && navigate(`/alunos/${prevAlunoId}`)}
              aria-label="Aluno anterior"
              className="grid h-6 w-6 place-items-center rounded-full hover:bg-surface-soft disabled:opacity-30"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>
            <span className="tabular px-1.5">{idxAluno + 1} de {alunos.length}</span>
            <button
              type="button"
              disabled={!nextAlunoId}
              onClick={() => nextAlunoId && navigate(`/alunos/${nextAlunoId}`)}
              aria-label="Próximo aluno"
              className="grid h-6 w-6 place-items-center rounded-full hover:bg-surface-soft disabled:opacity-30"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setConvidar(true)} className={buttonClasses("outline", "sm")}>
            <Smartphone className="h-4 w-4" /> Convidar para o app
          </button>
          <button
            onClick={() =>
              exportEvolucaoPDF({ aluno, avaliacoes: avals, profissional: profNome, cref: cref || undefined, marca: marcaDoUsuario(usuario) })
            }
            className={buttonClasses("outline", "sm")}
          >
            <FileDown className="h-4 w-4" /> Exportar
          </button>
          <MenuAcoes
            ativo={aluno.status === "ativo"}
            onEditar={() => navigate(`/alunos/${aluno.id}/perfil`)}
            onToggleStatus={() => {
              const eraAtivo = aluno.status === "ativo";
              updateAluno(aluno.id, { status: eraAtivo ? "inativo" : "ativo" });
              toast(eraAtivo ? `${aluno.nome} marcado(a) como inativo(a)` : `${aluno.nome} reativado(a)`);
            }}
          />
        </div>
      </div>

      {/* Identidade */}
      <div className="flex items-start gap-4">
        <span
          aria-hidden
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full gradient-brand font-display text-lg font-bold text-white"
        >
          {aluno.iniciais}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">{aluno.nome}</h1>
            {grupo && <Pill tone="danger">{grupo.nome}</Pill>}
            {aluno.status !== "ativo" && <Pill tone="neutral">Inativo</Pill>}
          </div>
          <p className="mt-1 text-sm text-ink-2">
            {[
              aluno.idade ? `${aluno.idade} anos` : null,
              aluno.objetivo,
              aluno.nivel,
              `aluno(a) desde ${fmtMesAno(aluno.criadoEm)}`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      </div>

      {recemCriado && (
        <Card tone="success" className="flex flex-wrap items-center gap-3 p-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface text-success">
            <CalendarPlus className="h-4 w-4" />
          </span>
          <p className="min-w-0 flex-1 text-sm text-ink">
            <span className="font-semibold">{aluno.nome} cadastrado(a).</span> Comece pela avaliação
            inicial para acompanhar a evolução; ela abre o resto do ciclo de cuidado.
          </p>
          {/* Sem CTA próprio: a ação "Registrar avaliação" é o primário da Linha do
              cuidado logo abaixo. O banner só dá as boas-vindas e aponta o começo. */}
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
          <button onClick={() => irParaCard("treino", "prescricoes-card")} className={buttonClasses("secondary", "sm")}>
            Ver prescrição
          </button>
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
          <button onClick={() => irParaCard("treino", "treino-card")} className={buttonClasses("secondary", "sm")}>
            Ver o treino
          </button>
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
          <button onClick={() => irParaCard("treino", "treino-card")} className={buttonClasses("secondary", "sm")}>
            Ver o treino
          </button>
        </Card>
      )}

      {/* A espinha do cuidado: onde o aluno está e qual o próximo passo, em qualquer aba */}
      <LinhaDoCuidado
        aluno={aluno}
        passo={passo}
        estado={estado}
        datas={{
          cadastro: aluno.criadoEm,
          avaliar: avals.length ? Math.min(...avals.map((a) => a.data)) : undefined,
          planejar: planoAtivo?.data,
          reavaliar: reav?.em,
        }}
        onAvaliar={() => setAvaliar(true)}
        onAcompanhar={() => setAba("treino")}
        onLiberar={irParaSemaforo}
      />

      <AlunoTabs
        aba={aba}
        onAba={setAba}
        contagens={{ avaliacoes: avals.length, semaforo: libsAlunoDesc.length }}
      />

      {/* VISÃO: a linha do tempo à esquerda (o que aconteceu, em ordem) e o estado
          atual à direita (treino ativo, medidas e engajamento no app), como no desenho.
          O semáforo do dia não repete aqui: ele é o cartão escuro do ciclo, acima. */}
      {aba === "visao" && (
        <div role="tabpanel" id="aba-painel-visao" aria-labelledby="aba-tab-visao" className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-3">
            <h2 className="text-2xs font-bold uppercase tracking-[0.14em] text-ink-3">Linha do tempo</h2>
            <LinhaDoTempo avaliacoes={avals} planos={planosDoAluno} feedbacks={feedbacksDoAluno} liberacoes={libsAlunoDesc} />
          </div>
          <div className="space-y-4">
            <VisaoTreino aluno={aluno} plano={planoAtivo} alunoId={aluno.id} onVer={() => setAba("treino")} podeTreino={podeTreino} />
            <VisaoAvaliacao aluno={aluno} avals={avals} reav={reav} vencida={reavaliacaoVencida} onVer={() => setAba("avaliacoes")} onAvaliar={() => setAvaliar(true)} />
            <VisaoNoApp
              aluno={aluno}
              execucoes={execucoesDoAluno}
              feedbacks={feedbacksDoAluno}
              metaSemanal={planoAtivo?.frequenciaSemanal}
              onVer={() => navigate(`/alunos/${aluno.id}/preview`)}
            />
          </div>
        </div>
      )}

      {/* AVALIAÇÕES: a evolução e o histórico à esquerda; a ação de registrar, o
          prazo da reavaliação e a leitura da evolução na coluna de apoio à direita. */}
      {aba === "avaliacoes" && (
        <div
          role="tabpanel"
          id="aba-painel-avaliacoes"
          aria-labelledby="aba-tab-avaliacoes"
          className="grid gap-4 lg:grid-cols-[1.6fr_1fr]"
        >
          {/* Coluna principal */}
          <div className="space-y-4">
            <Card className="p-5 md:p-6">
              <div className="mb-3 flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-analysis-tint text-analysis">
                  <Activity className="h-4 w-4" />
                </span>
                <h2 className="font-display text-lg font-bold text-ink">Evolução</h2>
              </div>
              <EvolucaoMini avals={avals} />
            </Card>

            {avals.length > 0 && (
              <Card className="p-5 md:p-6">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-ink-2">Tabela comparativa por data</h3>
                  <button
                    onClick={() =>
                      exportEvolucaoPDF({ aluno, avaliacoes: avals, profissional: profNome, cref: cref || undefined, marca: marcaDoUsuario(usuario) })
                    }
                    className={buttonClasses("secondary", "sm")}
                  >
                    <FileDown className="h-4 w-4" /> Exportar evolução (PDF)
                  </button>
                </div>
                <TabelaEvolucao avals={avals} />
              </Card>
            )}

            <Card className="p-5 md:p-6">
              <h2 className="mb-4 font-display text-lg font-bold text-ink">Histórico de avaliações</h2>
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
                        {/* Os testes por extenso, e não só a contagem. Um 1RM estimado
                            que vira a pílula "1 teste" é um dado que o profissional
                            registrou e não consegue mais ler. A observação carrega a
                            memória de cálculo das estimativas, então fica junto. */}
                        {av.testes?.length ? (
                          <ul className="mt-1.5 space-y-1">
                            {av.testes.map((t, i) => (
                              <li key={i} className="border-l-2 border-border pl-2.5">
                                <span className="tabular text-sm text-ink-2">
                                  {t.nome}
                                  {t.lado && t.lado !== "NA" ? ` (${t.lado})` : ""}:{" "}
                                  <span className="font-semibold text-ink">{t.resultado}</span>
                                  {t.unidade ? ` ${t.unidade}` : ""}
                                </span>
                                {t.obs && <span className="block text-2xs text-ink-3">{t.obs}</span>}
                              </li>
                            ))}
                          </ul>
                        ) : null}
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

          {/* Coluna de apoio */}
          <div className="space-y-4">
            <button
              onClick={() => setAvaliar(true)}
              className="flex w-full items-center justify-center gap-2 rounded-card bg-ink px-5 py-4 text-sm font-bold text-surface shadow-soft transition hover:brightness-[1.15] active:brightness-95"
            >
              <Plus className="h-4 w-4" /> {temAvaliacao ? "Registrar reavaliação" : "Registrar avaliação"}
            </button>

            {reav && (
              <Card tone="warning" className="p-4">
                <div className="flex items-start gap-3">
                  <span aria-hidden className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-warning" />
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">
                      {reavaliacaoVencida ? "Reavaliação vencida" : `Reavaliar em ${fmtDiaMes(reav.em)}`}
                    </p>
                    <p className="mt-0.5 text-sm text-ink-2">{legendaReavaliacao(reav, reavaliacaoVencida, planoAtivo)}</p>
                  </div>
                </div>
              </Card>
            )}

            <LeituraEvolucaoCard avals={avals} />
          </div>
        </div>
      )}

      {/* SEMÁFORO: estado do dia, o checklist inline e o histórico completo por aluno. */}
      {aba === "semaforo" && (
        <div role="tabpanel" id="aba-painel-semaforo" aria-labelledby="aba-tab-semaforo">
          <SemaforoAba aluno={aluno} planoAtivo={planoAtivo} estado={estadoSem} historico={libsAlunoDesc} />
        </div>
      )}

      {/* COBRANÇA: a mensalidade do aluno. A prévia e o convite ao app agora vivem
          no cabeçalho (Convidar) e no cartão "No app" da Visão, então esta aba fica
          só com o financeiro, como no desenho. */}
      {aba === "conta" && (
        <div role="tabpanel" id="aba-painel-conta" aria-labelledby="aba-tab-conta">
          <FinanceiroCard aluno={aluno} onUpdate={(patch) => updateAluno(aluno.id, patch)} />
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

            <PlanoCard aluno={aluno} planos={planosDoAluno} execucoes={execucoesDoAluno} podeTreino={podeTreino} prontidao={prontidao} onAvaliar={() => setAvaliar(true)} />

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
              {/* Sem plano ativo, a porta daqui é a prescrição avulsa ("Nova prescrição").
                  COM plano, "personalizar o treino do dia" vive só no card do plano acima,
                  para não oferecer a mesma ação duas vezes na mesma aba. */}
              {!planoAtivo &&
                (podeTreino.ok ? (
                  <Link
                    to={`/gps?aluno=${aluno.id}`}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Nova prescrição
                  </Link>
                ) : (
                  <span className="text-sm font-semibold text-ink-3" aria-disabled>
                    Nova prescrição
                  </span>
                ))}
            </div>
            {/* Gate duro: o que falta para prescrever, com o atalho de cada item. */}
            {!podeTreino.ok && (
              <ProntidaoAviso aluno={aluno} prontidao={prontidao} onAvaliar={() => setAvaliar(true)} />
            )}
            {prescs.length === 0 ? (
              podeTreino.ok && (
                <div className="rounded-xl border border-dashed border-border p-4 text-center">
                  <p className="text-sm text-ink-2">Sem prescrição ainda.</p>
                  {/* CTA só sem plano: com plano, "personalizar o treino do dia" é do card do plano. */}
                  {!planoAtivo && (
                    <Link
                      to={`/gps?aluno=${aluno.id}`}
                      className={cn(buttonClasses("secondary", "sm"), "mt-3")}
                    >
                      <Navigation className="h-4 w-4" /> Prescrever agora
                    </Link>
                  )}
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
                            // Arquivar tira um documento da lista com um clique. O par
                            // desfazer é o que separa "organizei" de "perdi".
                            toastDesfazer("Prescrição arquivada", () => unarchivePrescricao(p.id));
                          }}
                          className="ml-auto text-sm font-medium text-ink-3 hover:text-ink"
                        >
                          Arquivar esta prescrição
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
          alunoIdade={aluno.idade}
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

/** Sugestão de avançar de nível (a decisão é do profissional). Vive no topo do plano. */
function SugestaoNivel({ aluno, onUpdate }: { aluno: Aluno; onUpdate: (patch: Partial<Aluno>) => void }) {
  const [confirmarNivel, setConfirmarNivel] = React.useState(false);
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
      <button onClick={() => setConfirmarNivel(true)} className={buttonClasses("secondary", "sm")}>
        Avançar para {sug.proximo}
      </button>
      {confirmarNivel && (
        <ConfirmarAcao
          titulo={`Avançar ${aluno.nome.split(" ")[0]} para ${sug.proximo}?`}
          descricao={
            <>
              O nível muda as faixas de série, repetição e esforço que o motor usa, então a
              prescrição atual passa a ser revisada com outra régua. A contagem de tempo no nível
              recomeça hoje.
            </>
          }
          rotuloConfirmar={`Avançar para ${sug.proximo}`}
          onCancelar={() => setConfirmarNivel(false)}
          onConfirmar={() => {
            setConfirmarNivel(false);
            onUpdate({ nivel: sug.proximo, nivelDesde: Date.now() });
            toast(`${aluno.nome} avançou para ${sug.proximo}. Revise a prescrição.`);
          }}
        />
      )}
    </Card>
  );
}

/* -------------------- APOIO DA ABA AVALIAÇÕES -------------------- */

/** Legenda do prazo de reavaliação: quando cai e a fase do plano que fecha. */
function legendaReavaliacao(
  reav: { em: number; semana?: number },
  vencida: boolean,
  planoAtivo?: PlanoTreino,
): string {
  const meso = planoAtivo ? mesocicloAtual(planoAtivo) : undefined;
  const fase = meso ? rotuloMeso(meso) : undefined;
  if (vencida) {
    return fase ? `Fim de ${fase}. Reavalie para reabrir a progressão.` : "Reavalie para retomar a progressão do plano.";
  }
  const dias = Math.max(0, diasAte(reav.em));
  const quando = dias === 0 ? "hoje" : dias === 1 ? "em 1 dia" : `em ${dias} dias`;
  return fase ? `Fim de ${fase} · ${quando}.` : `Próxima reavaliação ${quando}.`;
}

type LeituraTom = "analysis" | "primary" | "warning" | "success";
type LeituraItem = { tom: LeituraTom; texto: React.ReactNode };
const BORDA_LEITURA: Record<LeituraTom, string> = {
  analysis: "border-analysis",
  primary: "border-primary",
  warning: "border-warning",
  success: "border-success",
};

/**
 * Lê a evolução do aluno a partir das medidas REAIS registradas (nunca inventa
 * número): descreve peso, cintura, gordura e PA de repouso do primeiro ao último
 * exame, e junta as referências pertinentes para a camada Ciência.
 */
function leituraEvolucao(avals: Avaliacao[]): { itens: LeituraItem[]; refs: string[] } {
  const itens: LeituraItem[] = [];
  const refs: string[] = [];
  if (avals.length < 2) return { itens, refs };

  const primeiro = avals[0];
  const ultimo = avals[avals.length - 1];
  const meses = Math.max(0, (ultimo.data - primeiro.data) / (DIA * 30.4));

  const peso0 = primeiro.medidas.peso;
  const peso1 = ultimo.medidas.peso;
  if (peso0 != null && peso1 != null) {
    const d = +(peso1 - peso0).toFixed(1);
    const taxa = meses >= 1 ? Math.abs(d / meses) : null;
    const verbo = d < 0 ? "Perda de" : d > 0 ? "Ganho de" : "Manutenção do peso:";
    itens.push({
      tom: "success",
      texto: (
        <>
          {verbo} {d !== 0 && <strong>{Math.abs(d)} kg</strong>}
          {taxa != null ? <> ({taxa.toFixed(1)} kg/mês)</> : null} no período.
        </>
      ),
    });
    refs.push("donnelly-2009");
  }

  const cint0 = primeiro.medidas.cintura;
  const cint1 = ultimo.medidas.cintura;
  if (cint0 != null && cint1 != null && cint1 !== cint0) {
    const dc = +(cint1 - cint0).toFixed(1);
    itens.push({
      tom: "primary",
      texto: dc < 0
        ? <>Cintura caiu <strong>{Math.abs(dc)} cm</strong>: sinal de perda de gordura central.</>
        : <>Cintura subiu <strong>{Math.abs(dc)} cm</strong> no período.</>,
    });
    refs.push("seidell-flegal-1997");
  }

  const g0 = primeiro.medidas.percentualGordura;
  const g1 = ultimo.medidas.percentualGordura;
  if (g0 != null && g1 != null && g1 !== g0) {
    const dg = +(g1 - g0).toFixed(1);
    itens.push({
      tom: "analysis",
      texto: <>Percentual de gordura {dg < 0 ? "caiu" : "subiu"} <strong>{Math.abs(dg)} p.p.</strong> no período.</>,
    });
  }

  const pa0 = primeiro.medidas.pressaoSistolica;
  const pa1 = ultimo.medidas.pressaoSistolica;
  if (pa0 != null && pa1 != null && pa1 !== pa0) {
    itens.push({
      tom: "warning",
      texto: <>PA sistólica de repouso {pa1 < pa0 ? "melhorou" : "subiu"} ({pa0} para {pa1} mmHg): mantenha o semáforo diário.</>,
    });
    refs.push("sbc-2020");
  }

  return { itens, refs: [...new Set(refs)] };
}

/** Cartão de apoio "Leitura da evolução" (Resumo/Na prática/Ciência). */
function LeituraEvolucaoCard({ avals }: { avals: Avaliacao[] }) {
  const { itens, refs } = leituraEvolucao(avals);
  if (itens.length === 0) return null;

  const resumo = (
    <div className="space-y-3">
      <h4 className="font-display text-sm font-bold text-ink">Leitura da evolução</h4>
      <ul className="space-y-2.5">
        {itens.map((it, i) => (
          <li key={i} className={cn("border-l-2 pl-3 text-sm text-ink-2", BORDA_LEITURA[it.tom])}>
            {it.texto}
          </li>
        ))}
      </ul>
    </div>
  );
  const pratica = (
    <p className="text-sm leading-relaxed text-ink-2">
      Leia a tendência, não o valor isolado: compare sempre a mesma medida entre as datas. Combine
      peso, cintura e percentual de gordura antes de mudar o rumo do treino, e deixe a próxima
      reavaliação confirmar o ajuste.
    </p>
  );
  return (
    <Card className="p-4">
      <TresCamadas resumo={resumo} pratica={pratica} refs={refs} initial="resumo" ariaLabel="Leitura da evolução" />
    </Card>
  );
}

/* -------------------- APOIO DA ABA SEMÁFORO -------------------- */

/**
 * Resultado do semáforo por dia nos ÚLTIMOS 30 DIAS (índice 0 = 29 dias atrás,
 * 29 = hoje). O registro mais recente do dia vence; dia sem registro fica vazio.
 */
function ultimos30Dias(
  alunoId: string,
  liberacoes: Liberacao[],
  agora = Date.now(),
): (Liberacao["resultado"] | undefined)[] {
  const hoje0 = new Date(agora).setHours(0, 0, 0, 0);
  const doAluno = liberacoes.filter((l) => l.alunoId === alunoId).sort((a, b) => b.data - a.data);
  const dias: (Liberacao["resultado"] | undefined)[] = Array(30).fill(undefined);
  for (const l of doAluno) {
    const d0 = new Date(l.data).setHours(0, 0, 0, 0);
    const atras = Math.round((hoje0 - d0) / DIA);
    if (atras < 0 || atras > 29) continue;
    const idx = 29 - atras;
    if (dias[idx] === undefined) dias[idx] = l.resultado;
  }
  return dias;
}

/** Distribuição dos resultados do histórico (para o cartão de registros). */
function distribuicaoSemaforo(historico: Liberacao[]) {
  return {
    total: historico.length,
    verde: historico.filter((l) => l.resultado === "verde").length,
    amarelo: historico.filter((l) => l.resultado === "amarelo").length,
    vermelho: historico.filter((l) => l.resultado === "vermelho").length,
  };
}

/** Banner do estado de hoje: escuro com "Fazer semáforo" (pendente) ou colorido (já feito). */
function BannerSemaforo({
  estado,
  nItens,
  grupoNome,
  onFazer,
}: {
  estado: EstadoSemaforo;
  nItens: number;
  grupoNome?: string;
  onFazer: () => void;
}) {
  const [confirmarRefazer, setConfirmarRefazer] = React.useState(false);
  if (estado.hoje) {
    const c = COR_SEMAFORO[estado.hoje.resultado];
    return (
      <div className={cn("flex flex-wrap items-center gap-3 rounded-card border p-4", c.bg, c.border)}>
        <c.Icon className={cn("h-6 w-6 shrink-0", c.text)} />
        <div className="min-w-0 flex-1">
          <div className={cn("font-display text-base font-bold", c.text)}>{rotuloResultado(estado.hoje.resultado)} hoje</div>
          <p className="text-sm text-ink-2">Semáforo de hoje já registrado. Refazer substitui o registro do dia.</p>
        </div>
        <button onClick={() => setConfirmarRefazer(true)} className={buttonClasses("secondary", "sm")}>
          <ShieldCheck className="h-4 w-4" /> Refazer o semáforo de hoje
        </button>
        {confirmarRefazer && (
          <ConfirmarAcao
            titulo="Refazer o semáforo de hoje?"
            descricao={
              <>
                O resultado de hoje ({rotuloResultado(estado.hoje.resultado).toLowerCase()}) sai do
                histórico e é substituído pelo novo. O semáforo entra no prontuário, então o registro
                anterior não fica guardado em lugar nenhum.
              </>
            }
            rotuloConfirmar="Refazer o semáforo"
            tom="destrutivo"
            onCancelar={() => setConfirmarRefazer(false)}
            onConfirmar={() => {
              setConfirmarRefazer(false);
              onFazer();
            }}
          />
        )}
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 rounded-card px-4 py-3.5" style={{ background: "#0D1524" }}>
        <span aria-hidden className="relative grid h-3 w-3 shrink-0 place-items-center">
          <span className="animate-halo absolute inset-0 rounded-full" style={{ background: "rgba(226,84,62,.5)" }} />
          <span className="relative h-2.5 w-2.5 rounded-full" style={{ background: "var(--danger-fill)" }} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold" style={{ color: "#F2F6FC" }}>Você ainda não avaliou hoje</p>
          <p className="mt-0.5 text-2xs" style={{ color: "#8FA1BD" }}>
            {nItens} pergunta{nItens === 1 ? "" : "s"} · cerca de 40 segundos · checklist{" "}
            {grupoNome ? `de ${grupoNome.toLowerCase()}` : "geral"}
          </p>
        </div>
        <button
          onClick={onFazer}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-opacity hover:opacity-90"
          style={{ background: "#14B3BA", color: "#06231F" }}
        >
          <ShieldCheck className="h-4 w-4" /> Fazer semáforo
        </button>
      </div>
      {estado.vermelhoPendente && (
        <div className={cn("flex items-start gap-2.5 rounded-card border p-3", COR_SEMAFORO.vermelho.bg, COR_SEMAFORO.vermelho.border)}>
          <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
          <p className="text-sm text-ink-2">
            <span className="font-semibold text-danger">Não liberado em aberto</span> desde{" "}
            {fmtData(estado.vermelhoPendente.data)}. A pendência segue até um novo semáforo.
          </p>
        </div>
      )}
    </div>
  );
}

/** Régua dos últimos 30 dias, com legenda e o dia de hoje destacado. */
function Ultimos30DiasCard({ dias }: { dias: (Liberacao["resultado"] | undefined)[] }) {
  const legenda: { cor: Liberacao["resultado"]; label: string }[] = [
    { cor: "verde", label: "liberada" },
    { cor: "amarelo", label: "com ajuste" },
    { cor: "vermelho", label: "não liberada" },
  ];
  return (
    <Card className="p-5 md:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <h2 className="text-2xs font-bold uppercase tracking-[0.14em] text-ink-3">Últimos 30 dias</h2>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {legenda.map((l) => (
            <span key={l.cor} className="flex items-center gap-1.5 text-2xs text-ink-2">
              <span aria-hidden className={cn("h-2 w-2 rounded-full", COR_SEMAFORO[l.cor].dot)} />
              {l.label}
            </span>
          ))}
          <span className="flex items-center gap-1.5 text-2xs text-ink-2">
            <span aria-hidden className="h-2 w-2 rounded-full bg-surface-soft ring-1 ring-inset ring-border" />
            sem sessão
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {dias.map((r, i) => {
          const hoje = i === dias.length - 1;
          return (
            <span
              key={i}
              aria-hidden
              className={cn(
                "h-3 w-3 rounded-full",
                r
                  ? COR_SEMAFORO[r].dot
                  : hoje
                    ? "border-2 border-dashed border-ink-3"
                    : "bg-surface-soft ring-1 ring-inset ring-border",
              )}
            />
          );
        })}
      </div>
      <p className="mt-3 text-xs text-ink-3">Cada ponto é um dia; o mais recente é hoje. Registrar por dia é opcional.</p>
    </Card>
  );
}

/** Cartão de registros: distribuição dos resultados do histórico do aluno. */
function RegistrosCard({ dist }: { dist: ReturnType<typeof distribuicaoSemaforo> }) {
  const linhas = [
    { label: "Liberada", n: dist.verde, dot: COR_SEMAFORO.verde.dot, bar: "bg-success" },
    { label: "Com ajuste", n: dist.amarelo, dot: COR_SEMAFORO.amarelo.dot, bar: "bg-warning" },
    { label: "Não liberada", n: dist.vermelho, dot: COR_SEMAFORO.vermelho.dot, bar: "bg-danger-fill" },
  ];
  const max = Math.max(1, dist.total);
  return (
    <Card className="p-5">
      <h2 className="mb-3 text-2xs font-bold uppercase tracking-[0.14em] text-ink-3">
        {dist.total} registro{dist.total === 1 ? "" : "s"}
      </h2>
      <ul className="space-y-3">
        {linhas.map((l) => (
          <li key={l.label}>
            <div className="mb-1 flex items-center gap-2 text-sm">
              <span aria-hidden className={cn("h-2 w-2 rounded-full", l.dot)} />
              <span className="text-ink-2">{l.label}</span>
              <span className="tabular ml-auto font-semibold text-ink">{l.n}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-soft">
              <div className={cn("h-full rounded-full", l.bar)} style={{ width: `${(l.n / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/** Cartão do checklist de hoje (perguntas numeradas + Resumo/Na prática/Ciência). */
function ChecklistHojeCard({ aluno, grupoNome }: { aluno: Aluno; grupoNome?: string }) {
  const checklist = montarChecklist(aluno.grupoEspecial ?? "geral", aluno.farmacos);
  if (!checklist) return null;
  const refs = [...new Set(checklist.itens.flatMap((i) => i.refs ?? []))];

  const resumo = (
    <p className="text-sm leading-relaxed text-ink-2">
      {checklist.itens.length} pergunta{checklist.itens.length === 1 ? "" : "s"} de{" "}
      {grupoNome ? grupoNome.toLowerCase() : "rotina"} antes da sessão. A pior resposta define a cor,
      e um item sem resposta nunca libera direto.
    </p>
  );
  const pratica = (
    <p className="text-sm leading-relaxed text-ink-2">
      O verde libera a sessão como planejada. O amarelo libera com o ajuste sugerido (intensidade,
      volume ou modalidade). O vermelho não libera hoje: reavalie e, se necessário, oriente avaliação
      médica.
    </p>
  );

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-analysis-tint text-analysis">
          <ClipboardList className="h-4 w-4" />
        </span>
        <h2 className="font-display text-base font-bold text-ink">Checklist de hoje</h2>
      </div>
      <ol className="mb-3 space-y-2">
        {checklist.itens.map((it, i) => (
          <li key={it.id} className="flex items-start gap-2.5 text-sm">
            <span className="tabular grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface-soft text-xs font-bold text-ink-2">
              {i + 1}
            </span>
            <span className="line-clamp-2 text-ink">{it.pergunta}</span>
          </li>
        ))}
      </ol>
      <TresCamadas resumo={resumo} pratica={pratica} refs={refs} initial="resumo" ariaLabel="Sobre o checklist" />
    </Card>
  );
}

/**
 * Aba SEMÁFORO do aluno: à esquerda, o banner do estado de hoje, o checklist inline,
 * a régua dos últimos 30 dias e o histórico; à direita, a distribuição dos registros
 * e o cartão do checklist. Reusa o `SemaforoLiberacao` e a fonte única `estadoSemaforo`.
 */
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
  const grupo = aluno.grupoEspecial ? getSpecialGroup(aluno.grupoEspecial) : undefined;

  const dias30 = ultimos30Dias(aluno.id, historico);
  const dist = distribuicaoSemaforo(historico);
  const checklist = montarChecklist(grupoSlug, aluno.farmacos);
  const nItens = checklist?.itens.length ?? 0;

  return (
    <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
      {/* Coluna principal */}
      <div className="space-y-4">
        <BannerSemaforo estado={estado} nItens={nItens} grupoNome={grupo?.nome} onFazer={() => setFazendo((v) => !v)} />

        {estado.hoje && !fazendo && (
          <p className="px-1 text-xs text-ink-3">O semáforo de hoje já foi registrado; refazer substitui o registro do dia.</p>
        )}

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

        <Ultimos30DiasCard dias={dias30} />

        {/* Histórico completo */}
        <Card className="p-5 md:p-6">
          <h2 className="mb-3 font-display text-lg font-bold text-ink">
            Histórico {historico.length > 0 && <span className="text-ink-3">· {historico.length}</span>}
          </h2>
          {historico.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-2">Nenhum semáforo registrado ainda.</p>
          ) : (
            <ol className="space-y-3">
              {historico.map((l) => {
                const c = COR_SEMAFORO[l.resultado];
                const bordaL =
                  l.resultado === "verde" ? "border-l-success" : l.resultado === "amarelo" ? "border-l-warning" : "border-l-danger";
                return (
                  <li key={l.id} className={cn("rounded-xl border border-l-4 border-border p-3", bordaL)}>
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

      {/* Coluna de apoio */}
      <div className="space-y-4">
        {historico.length > 0 && <RegistrosCard dist={dist} />}
        <ChecklistHojeCard aluno={aluno} grupoNome={grupo?.nome} />
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
          não pode ser desfeita. Se quiser só tirar da lista ativa, use "Marcar como inativo",
          no menu do aluno.
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
          Gerar outro plano
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
                  <span className="font-semibold text-ink">Reavaliação da semana {reav.semana}.</span> Registre
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
          {/* Exceção diária: personalizar a sessão desta semana sem remontar o treino.
              É o ÚNICO ponto de entrada para "personalizar o treino do dia" (o card
              Prescrições não repete). O semáforo tem o card-resumo próprio ao lado. */}
          <Link
            to={`/gps?aluno=${aluno.id}&modo=dia`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            <Navigation className="h-4 w-4" /> Personalizar o treino do dia
          </Link>
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

/** 2) Treino ativo: plano, fase, sessões da semana e o atalho para o plano. */
/** Próximo vencimento (DD/MM) a partir do dia do mês, para a linha de mensalidade. */
function proximoVencimento(dia: number): string {
  const hoje = new Date();
  let d = new Date(hoje.getFullYear(), hoje.getMonth(), dia);
  if (d.getTime() < hoje.setHours(0, 0, 0, 0)) d = new Date(hoje.getFullYear(), hoje.getMonth() + 1, dia);
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(d);
}

/** Linha de mensalidade do card "Estado atual": selo verde quando em dia. */
function MensalidadeLinha({ aluno }: { aluno: Aluno }) {
  const c = aluno.cobranca;
  if (!c) return null;
  const st = statusEfetivo(c);
  const emDia = st === "pago" || st === "isento";
  return (
    <div className="mt-3 flex items-center gap-2.5 border-t border-border pt-3">
      <span
        className={cn(
          "grid h-7 w-7 shrink-0 place-items-center rounded-lg",
          emDia ? "bg-success-tint text-success" : "bg-warning-tint text-warning",
        )}
      >
        {emDia ? <Check className="h-4 w-4" strokeWidth={3} /> : <AlertTriangle className="h-4 w-4" />}
      </span>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-ink">{emDia ? "Mensalidade em dia" : ROTULO_STATUS_COBRANCA[st]}</div>
        <div className="tabular text-xs text-ink-2">
          {formatBRL(c.valorCentavos)} · próxima em {proximoVencimento(c.diaVencimento)}
        </div>
      </div>
    </div>
  );
}

/** 2) Estado atual: treino ativo com barra de progresso da semana + mensalidade. */
function VisaoTreino({
  aluno,
  plano,
  alunoId,
  onVer,
  podeTreino,
}: {
  aluno: Aluno;
  plano?: PlanoTreino;
  alunoId: string;
  onVer: () => void;
  podeTreino: { ok: boolean; motivo?: string };
}) {
  if (!plano) {
    return (
      <Card className="flex flex-col p-5">
        <Eyebrow>Estado atual</Eyebrow>
        <div className="mt-1 font-display text-lg font-bold text-ink">Sem treino montado</div>
        <p className="mt-0.5 text-sm text-ink-2">
          {podeTreino.ok ? "A avaliação já está pronta; o próximo passo é montar o plano." : podeTreino.motivo}
        </p>
        {podeTreino.ok && (
          <Link to={`/prescrever-treino?aluno=${alunoId}`} className={cn(buttonClasses("primary", "sm"), "mt-4 self-start")}>
            <CalendarRange className="h-4 w-4" /> Montar treino
          </Link>
        )}
        <MensalidadeLinha aluno={aluno} />
      </Card>
    );
  }

  const semana = semanaAtual(plano);
  const total = plano.semanas;
  const pct = Math.max(6, Math.min(100, Math.round((semana / Math.max(total, 1)) * 100)));
  const meso = mesocicloAtual(plano);
  const micro = plano.macrociclo.mesociclos.flatMap((m) => m.microciclos).find((mc) => mc.semana === semana);
  const sessoes = micro?.sessoes ?? [];
  // Divisão em letras (A/B/C...), o "split" da semana — sem despejar o rótulo de
  // cada mesociclo (era isso que virava "B... · D..." e poluía o card).
  const split = sessoes.length ? sessoes.map((_, i) => String.fromCharCode(65 + i)).join("/") : null;

  return (
    <Card className="flex flex-col p-5">
      <Eyebrow>Estado atual</Eyebrow>
      <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="font-display text-lg font-bold text-ink">Treino ativo</span>
        <span className="tabular text-sm text-ink-2">
          semana {semana} de {total}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-soft">
        <div className="h-full rounded-full gradient-brand transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-sm text-ink-2">
          {meso && <span className="font-semibold text-analysis">{rotuloMeso(meso)}</span>}
          {split ? ` · ${split}` : ""} · {plano.frequenciaSemanal}×/sem
        </p>
        <button onClick={onVer} className="shrink-0 text-sm font-semibold text-primary hover:underline">
          abrir
        </button>
      </div>
      <MensalidadeLinha aluno={aluno} />
    </Card>
  );
}

/** 3) Medidas do aluno: rótulo, valor e a variação desde a avaliação anterior em
 *  pílula (verde quando melhora), no formato do desenho. */
function VisaoAvaliacao({
  aluno,
  avals,
  reav,
  vencida,
  onVer,
  onAvaliar,
}: {
  aluno: Aluno;
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
        <Eyebrow>Medidas</Eyebrow>
        <div className="mt-1 font-display text-lg font-bold text-ink">Nenhuma avaliação ainda</div>
        <p className="mt-0.5 text-sm text-ink-2">A avaliação inicial abre o resto do ciclo de cuidado.</p>
        <button onClick={onAvaliar} className={cn(buttonClasses("primary", "sm"), "mt-4 self-start")}>
          <CalendarPlus className="h-4 w-4" /> Registrar avaliação
        </button>
      </Card>
    );
  }

  const m = ultima.medidas;
  const p = avals[avals.length - 2]?.medidas;
  const num = (v: number) => Math.abs(Number(v.toFixed(1))).toLocaleString("pt-BR");

  // Uma linha por medida presente. "menorMelhora" pinta a variação de verde quando
  // o valor CAI (peso, gordura, cintura, FC de repouso melhoram caindo).
  type Linha = { rotulo: string; valor: string; pill?: React.ReactNode };
  const linhas: Linha[] = [];
  const deltaPill = (atual: number, ant: number | undefined, unidade: string) => {
    if (ant == null || atual === ant) return undefined;
    const desce = atual < ant;
    return (
      <Pill tone={desce ? "success" : "warning"}>
        {desce ? "▼" : "▲"} {num(atual - ant)} {unidade}
      </Pill>
    );
  };
  if (m.peso != null) linhas.push({ rotulo: "Peso", valor: `${num(m.peso)} kg`, pill: deltaPill(m.peso, p?.peso, "kg") });
  if (m.paSistolica != null && m.paDiastolica != null)
    linhas.push({
      rotulo: "PA repouso",
      valor: `${m.paSistolica}/${m.paDiastolica}`,
      pill:
        p?.paSistolica != null && p?.paDiastolica != null ? (
          <Pill tone={m.paSistolica < p.paSistolica ? "success" : "neutral"}>era {p.paSistolica}/{p.paDiastolica}</Pill>
        ) : undefined,
    });
  if (m.percentualGordura != null)
    linhas.push({ rotulo: "Gordura", valor: `${num(m.percentualGordura)}%`, pill: deltaPill(m.percentualGordura, p?.percentualGordura, "p.p.") });
  if (m.cintura != null) linhas.push({ rotulo: "Cintura", valor: `${num(m.cintura)} cm`, pill: deltaPill(m.cintura, p?.cintura, "cm") });
  if (m.fcRepouso != null) linhas.push({ rotulo: "FC repouso", valor: `${m.fcRepouso} bpm`, pill: deltaPill(m.fcRepouso, p?.fcRepouso, "bpm") });

  return (
    <Card className="flex flex-col p-5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-base font-bold text-ink">Medidas de {aluno.nome.split(" ")[0]}</span>
          <span className="tabular text-xs text-ink-3">{fmtData(ultima.data)}</span>
        </div>
        <button onClick={onVer} className="shrink-0 text-sm font-semibold text-primary hover:underline">
          evolução ›
        </button>
      </div>

      <div className="divide-y divide-border">
        {linhas.map((l) => (
          <div key={l.rotulo} className="flex items-center gap-3 py-2">
            <span className="w-24 shrink-0 text-sm text-ink-2">{l.rotulo}</span>
            <span className="tabular font-display text-base font-bold text-ink">{l.valor}</span>
            {l.pill && <span className="ml-auto shrink-0">{l.pill}</span>}
          </div>
        ))}
      </div>

      {reav && (
        <p className={cn("mt-3 border-t border-border pt-3 text-xs", vencida ? "text-warning" : "text-ink-2")}>
          <span className="font-semibold">Reavaliação {vencida ? "vencida" : "marcada"}:</span> {fmtData(reav.em)}
          {reav.semana ? ` · fim da semana ${reav.semana}` : ""}
          {vencida && (
            <button onClick={onAvaliar} className="ml-2 font-semibold text-primary hover:underline">
              Reavaliar agora
            </button>
          )}
        </p>
      )}
    </Card>
  );
}

/** 4) No app do aluno: cartão escuro (navy) com a sequência e três números:
 *  treinos da semana, esforço médio e o último acesso, como no desenho. */
function VisaoNoApp({
  aluno,
  execucoes,
  feedbacks,
  metaSemanal,
  onVer,
}: {
  aluno: Aluno;
  execucoes: Execucao[];
  /** feedbacks do aluno, do mais recente para o mais antigo */
  feedbacks: SessaoFeedback[];
  /** meta de treinos por semana (frequência do plano ativo), para "N/meta" */
  metaSemanal?: number;
  onVer: () => void;
}) {
  const UM_DIA = 86_400_000;
  const streak = sequenciaDias(execucoes);
  const diaSemana = (new Date().getDay() + 6) % 7;
  const inicio = new Date().setHours(0, 0, 0, 0) - diaSemana * UM_DIA;
  const naSemana = new Set(
    execucoes.filter((e) => e.concluidoEm >= inicio).map((e) => Math.floor(e.concluidoEm / UM_DIA)),
  ).size;
  const meta = metaSemanal ?? 3;
  const notas = feedbacks.map((f) => f.pse).filter((n): n is number => n != null);
  const media = notas.length ? Math.round(notas.reduce((s, n) => s + n, 0) / notas.length) : null;
  const ultimoTs = execucoes.length ? Math.max(...execucoes.map((e) => e.concluidoEm)) : null;
  const ultimoAcesso = ultimoTs != null ? rotuloDiaTempo(ultimoTs).dia : "sem registro";
  const recado = feedbacks.find((f) => f.observacao);
  const semNada = execucoes.length === 0 && feedbacks.length === 0;
  const primeiro = aluno.nome.split(" ")[0];

  return (
    <div className="rounded-card p-5" style={{ background: "#0D1524" }}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-2xs font-bold uppercase tracking-[0.14em]" style={{ color: "#8FA1BD" }}>
          No app de {primeiro}
        </span>
        {streak.atual > 0 && (
          <span className="tabular text-sm font-bold" style={{ color: "#E6B03C" }}>
            🔥 {streak.atual} {streak.atual === 1 ? "dia" : "dias"}
          </span>
        )}
      </div>

      {semNada ? (
        <p className="mt-2 text-sm" style={{ color: "#8FA1BD" }}>
          Quando {primeiro} registrar o treino no celular, a sequência e o esforço aparecem aqui.
        </p>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <StatApp valor={`${naSemana}/${meta}`} rotulo="treinos da semana" />
            <StatApp valor={media != null ? String(media) : "sem dado"} rotulo="esforço médio" />
            <StatApp valor={ultimoAcesso} rotulo="último acesso" />
          </div>
          {recado?.observacao && (
            <p
              className="mt-3 rounded-lg p-2.5 text-sm italic"
              style={{ background: "rgba(148,170,210,.10)", color: "#C7D3E8" }}
            >
              {recado.observacao} <span className="not-italic text-xs">· {fmtData(recado.concluidaEm)}</span>
            </p>
          )}
        </>
      )}

      <button
        onClick={onVer}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
        style={{ color: "#14B3BA" }}
      >
        <Smartphone className="h-4 w-4" /> Ver como o aluno vê
      </button>
    </div>
  );
}

/** Um número do cartão escuro "No app": valor grande claro + rótulo apagado. */
function StatApp({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <div className="min-w-0">
      <div className="tabular font-display text-2xl font-bold leading-none" style={{ color: "#F2F6FC" }}>
        {valor}
      </div>
      <div className="mt-1 text-2xs leading-tight" style={{ color: "#8FA1BD" }}>
        {rotulo}
      </div>
    </div>
  );
}
