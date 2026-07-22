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
  FlaskConical,
  HeartPulse,
  FileDown,
  FileText,
  Lock,
  Route as RouteIcon,
  ShieldCheck,
  CheckCircle2,
  CalendarRange,
  CalendarCheck,
  Wallet,
} from "lucide-react";
import { Card, Pill, buttonClasses, ParDado, LinhaDeDose, TokenRotulado } from "@/components/ui/primitives";
import { useAlunos, useUser, isPremiumUnlocked, marcaDoUsuario, prescricaoAplicadaEm } from "@/lib/store";
import { AplicarNoTreinoDialog } from "@/components/treino/AplicarNoTreinoDialog";
import { ExecucaoPanel } from "@/components/treino/ExecucaoPanel";
import { FinanceiroCard } from "@/components/treino/FinanceiroCard";
import { PosturalCard } from "@/components/treino/PosturalCard";
import { LinhaDoCuidado } from "@/components/treino/LinhaDoCuidado";
import { ListaChips } from "@/components/treino/PlanoEditor";
import { proximoPasso, estadoDoCiclo, dataReavaliacao, type CicloCtx, type ProximoPasso } from "@/lib/gps/proximoPasso";
import { useCloudAuth } from "@/lib/backend/cloudAuth";
import { criarConvite } from "@/lib/backend/supabaseRepo";
import { rotuloRestricao } from "@/lib/gps/restricoes";
import { exportPrescricaoPDF } from "@/lib/exportPrescricao";
import { exportProntuarioPDF, idDocumento } from "@/lib/exportProntuario";
import { ProntuarioView } from "@/components/rcd/ProntuarioView";
import { exercises } from "@/data/exercises";
import type { Aluno, Avaliacao, Prescricao } from "@/data/alunos";
import { tempoDesde, sugestaoProgressao } from "@/data/alunos";
import { ROTULO_STATUS_COBRANCA } from "@/data/cobranca";
import { getSpecialGroup } from "@/data/specialGroups";
import { getModelo, rotuloMeso, semanaAtual, mesocicloAtual, proximaReavaliacao, type PlanoTreino } from "@/data/periodizacao";
import { ModalidadePills, ParametroPills, CriteriosLista } from "@/components/special/SpecialUI";
import { AlunoFormModal } from "@/components/app/AlunoFormModal";
import { AvaliacaoModal } from "@/components/app/AvaliacaoModal";
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

type Aba = "treino" | "avaliacoes" | "conta";
const ABAS: { id: Aba; label: string; Icon: typeof UserCheck }[] = [
  { id: "treino", label: "Plano e treino", Icon: Dumbbell },
  { id: "avaliacoes", label: "Avaliações", Icon: Activity },
  { id: "conta", label: "App do aluno", Icon: Smartphone },
];

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
      className="flex flex-wrap gap-1 rounded-control border border-border bg-surface-soft p-1"
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
              "inline-flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors sm:flex-none",
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
  variant = "primary",
  size,
}: {
  aluno: Aluno;
  passo: ProximoPasso;
  onAvaliar: () => void;
  onAcompanhar: () => void;
  variant?: Parameters<typeof buttonClasses>[0];
  size?: Parameters<typeof buttonClasses>[1];
}) {
  const cls = buttonClasses(variant, size);
  const label = (
    <>
      Próximo passo: {passo.cta.label} <ArrowRight className="h-4 w-4" />
    </>
  );
  switch (passo.cta.kind) {
    case "planejar":
      return (
        <Link to={`/prescrever-treino?aluno=${aluno.id}`} className={cls}>
          {label}
        </Link>
      );
    case "liberar":
      return (
        <Link to={`/semaforo?grupo=${aluno.grupoEspecial ?? "geral"}&aluno=${aluno.id}`} className={cls}>
          {label}
        </Link>
      );
    case "avaliar":
    case "reavaliar":
      return (
        <button onClick={onAvaliar} className={cls}>
          {label}
        </button>
      );
    case "acompanhar":
    default:
      return (
        <button onClick={onAcompanhar} className={cls}>
          {label}
        </button>
      );
  }
}

export function AlunoDetail() {
  const { id = "" } = useParams();
  const { alunos, avaliacoes, prescricoes, planos, liberacoes, execucoes, addAvaliacao, updateAluno, updatePlano, removeAluno, archivePrescricao } =
    useAlunos();
  const navigate = useNavigate();
  const [editar, setEditar] = React.useState(false);
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
  // A aba "Plano e treino" é o core e abre por padrão (o retorno do plano/aplicado cai nela).
  const [aba, setAba] = React.useState<Aba>("treino");
  // "Acompanhar" do próximo passo: garante a aba do treino e ancora na execução.
  const irParaExecucao = React.useCallback(() => {
    setAba("treino");
    requestAnimationFrame(() =>
      document.getElementById("execucao-card")?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }, []);
  // Prescrição escolhida para o diálogo "Colocar no treino".
  const [aplicarPresc, setAplicarPresc] = React.useState<Prescricao | null>(null);
  const [params, setParams] = useSearchParams();

  // ?avaliar=1 (vindo de Avaliações) abre o modal de registrar avaliação e limpa o param.
  React.useEffect(() => {
    if (params.get("avaliar") === "1") {
      setAvaliar(true);
      params.delete("avaliar");
      setParams(params, { replace: true });
    }
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
  // Fonte única do ciclo (avaliar, planejar, liberar, acompanhar, reavaliar).
  const ctx: CicloCtx = { avaliacoes, prescricoes, planos, liberacoes, execucoes };
  const passo = proximoPasso(aluno, ctx);
  const estado = estadoDoCiclo(aluno, ctx);
  // Reavaliação reconciliada: com plano, o macrociclo manda; senão o calendário.
  const reav = dataReavaliacao(aluno, planoAtivo);
  const reavaliacaoVencida = reav ? reav.em < Date.now() : false;
  const libsDoAluno = liberacoes.filter((l) => l.alunoId === id).slice(0, 3);
  const prescAberta = prontuarioDe ? prescs.find((p) => p.id === prontuarioDe) : undefined;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link to="/alunos" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-2 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Alunos
      </Link>

      {recemCriado && (
        <Card tone="success" className="flex flex-wrap items-center gap-3 p-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-success">
            <CalendarPlus className="h-4 w-4" />
          </span>
          <p className="min-w-0 flex-1 text-sm text-ink">
            <span className="font-semibold">{aluno.nome} cadastrado(a).</span> Comece pela avaliação
            inicial para acompanhar a evolução; ela abre o resto do ciclo de cuidado.
          </p>
          <CtaProximoPasso aluno={aluno} passo={passo} onAvaliar={() => setAvaliar(true)} onAcompanhar={irParaExecucao} size="sm" />
        </Card>
      )}

      {prescricaoSalva && (
        <Card tone="success" className="flex flex-wrap items-center gap-3 p-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-success">
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
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-success">
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
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-success">
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
        onEditar={() => setEditar(true)}
        onAvaliar={() => setAvaliar(true)}
        onAcompanhar={irParaExecucao}
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
      />

      <AlunoTabs aba={aba} onAba={setAba} />

      {/* AVALIAÇÕES: evolução, histórico e a análise postural por foto no mesmo lugar. */}
      {aba === "avaliacoes" && (
        <div role="tabpanel" id="aba-painel-avaliacoes" aria-labelledby="aba-tab-avaliacoes" className="space-y-4">
          <Card className="p-5 md:p-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#e0f7f9] text-analysis">
                <Activity className="h-4 w-4" />
              </span>
              <h2 className="font-display text-lg font-bold text-ink">Evolução</h2>
            </div>
            <Evolucao avals={avals} />
          </Card>

          <Card className="p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-ink">Avaliações</h2>
              <button onClick={() => setAvaliar(true)} className={buttonClasses("secondary", "sm")}>
                <CalendarPlus className="h-4 w-4" /> Registrar
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

      {/* APP DO ALUNO: prévia, convite e financeiro num só lugar (como o aluno usa e paga). */}
      {aba === "conta" && (
        <div role="tabpanel" id="aba-painel-conta" aria-labelledby="aba-tab-conta">
          <AppDoAlunoPanel aluno={aluno} onUpdate={(patch) => updateAluno(aluno.id, patch)} />
        </div>
      )}

      {/* PLANO E TREINO: o core, na ordem do ciclo. Fase, periodização, prescrição, execução. */}
      {aba === "treino" && (
        <div role="tabpanel" id="aba-painel-treino" aria-labelledby="aba-tab-treino" className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <SugestaoNivel aluno={aluno} onUpdate={(patch) => updateAluno(aluno.id, patch)} />

            <JornadaCard aluno={aluno} planoAtivo={planoAtivo} onFase={(n) => updateAluno(aluno.id, { faseJornada: n })} />

            <PlanoCard aluno={aluno} planos={planosDoAluno} onAvaliar={() => setAvaliar(true)} />

            <div id="execucao-card" className="scroll-mt-24">
              <ExecucaoPanel plano={planosDoAluno.find((p) => p.status === "ativo")} execucoes={execucoesDoAluno} />
            </div>

          <Card id="prescricoes-card" className="scroll-mt-24 p-5 md:p-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-ink">Prescrições</h2>
              <Link to={`/gps?aluno=${aluno.id}`} className="text-sm font-semibold text-primary hover:underline">
                Nova
              </Link>
            </div>
            {prescs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-4 text-center">
                <p className="text-sm text-ink-2">Sem prescrição ainda.</p>
                <Link to={`/gps?aluno=${aluno.id}`} className={cn(buttonClasses("primary", "sm"), "mt-3")}>
                  <Navigation className="h-4 w-4" /> Prescrever agora
                </Link>
              </div>
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
                        <TokenRotulado label="No plano" value={`Sessão ${local.sessao} · semana ${local.semana}`} tone="analysis" />
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
            {/* Gate pré-sessão vale para TODO aluno: sem grupo especial, usa o checklist geral */}
            <Card className="p-5">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-ink">Semáforo de Liberação</h2>
              </div>
              <p className="mb-3 text-sm text-ink-2">
                Antes da sessão: libere o treino de hoje em 30 segundos, com o porquê registrado.
              </p>
              {libsDoAluno.length > 0 && (
                <ul className="mb-3 space-y-1.5">
                  {libsDoAluno.map((l) => (
                    <li key={l.id} className="flex items-center gap-2 text-sm">
                      <span
                        aria-hidden
                        className={cn(
                          "h-2.5 w-2.5 shrink-0 rounded-full",
                          l.resultado === "verde" && "bg-success",
                          l.resultado === "amarelo" && "bg-warning",
                          l.resultado === "vermelho" && "bg-[#ef4444]",
                        )}
                      />
                      <span className="text-ink">
                        {l.resultado === "verde"
                          ? "Liberado"
                          : l.resultado === "amarelo"
                            ? "Liberado com ajuste"
                            : "Não liberado"}
                      </span>
                      <span className="tabular ml-auto text-xs text-ink-3">{fmtData(l.data)}</span>
                    </li>
                  ))}
                </ul>
              )}
              <Link
                to={`/semaforo?grupo=${aluno.grupoEspecial ?? "geral"}&aluno=${aluno.id}`}
                className={buttonClasses("secondary", "sm")}
              >
                <ShieldCheck className="h-4 w-4" /> Fazer o semáforo de hoje
              </Link>
            </Card>
          </div>
        </div>
      )}

      {/* Ação administrativa: excluir (o status ativo/saiu fica em Acompanhamento) */}
      <div className="flex flex-wrap items-center gap-4 border-t border-border pt-4 text-sm">
        <button onClick={() => setConfirmarExclusao(true)} className="font-medium text-[#b91c1c] hover:underline">
          Excluir aluno
        </button>
      </div>

      {editar && (
        <AlunoFormModal
          inicial={aluno}
          onClose={() => setEditar(false)}
          onSave={(a) => {
            updateAluno(aluno.id, a);
            setEditar(false);
            toast(`Dados de ${a.nome} atualizados`);
          }}
        />
      )}

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
          }}
          alunoId={aluno.id}
          anterior={avalsDesc[0]}
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
  onEditar,
  onAvaliar,
  onAcompanhar,
  onToggleStatus,
}: {
  aluno: Aluno;
  planoAtivo?: PlanoTreino;
  passo: ProximoPasso;
  reav: { em: number; semana?: number } | null;
  reavaliacaoVencida: boolean;
  onEditar: () => void;
  onAvaliar: () => void;
  onAcompanhar: () => void;
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
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl gradient-brand font-display text-xl font-bold text-white">
            {aluno.iniciais}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">{aluno.nome}</h1>
              <Pill tone={ativo ? "success" : "neutral"}>{ativo ? "Ativo" : "Inativo"}</Pill>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Pill tone="primary">{aluno.objetivo}</Pill>
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

        <div className="flex shrink-0 flex-wrap gap-2 md:justify-end">
          <button onClick={onEditar} className={buttonClasses("outline")}>
            Editar
          </button>
          <button onClick={onAvaliar} className={buttonClasses("secondary")}>
            <CalendarPlus className="h-4 w-4" /> Registrar avaliação
          </button>
          <CtaProximoPasso aluno={aluno} passo={passo} onAvaliar={onAvaliar} onAcompanhar={onAcompanhar} />
        </div>
      </div>

      {/* Zona 2: restrições fluem em linha própria, com colapso +N */}
      {restr.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-3">Restrições</span>
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
        className={buttonClasses("primary", "sm")}
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
function AppDoAlunoPanel({ aluno, onUpdate }: { aluno: Aluno; onUpdate: (patch: Partial<Aluno>) => void }) {
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

          {/* 2) Acesso: convite quando há nuvem; senão, o que falta */}
          <div>
            {configured ? (
              <ConvidarAlunoCard alunoId={aluno.id} alunoNome={aluno.nome} />
            ) : (
              <Card tone="primary" className="h-full p-4">
                <div className="text-sm font-semibold text-ink">O acesso online do aluno ainda não está disponível</div>
                <p className="mt-1 text-sm text-ink-2">A prévia mostra exatamente o que ele verá.</p>
                <Link to={`/alunos/${aluno.id}/preview`} className={cn(buttonClasses("secondary", "sm"), "mt-3")}>
                  <Smartphone className="h-4 w-4" /> Ver a prévia
                </Link>
              </Card>
            )}
          </div>
        </div>
      </Card>

      <FinanceiroCard aluno={aluno} onUpdate={onUpdate} />
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
            className="inline-flex h-9 items-center gap-1.5 rounded-control bg-[#b91c1c] px-4 text-sm font-semibold text-white hover:bg-[#991b1b]"
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
  const unlocked = isPremiumUnlocked(useUser((s) => s.plan));
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

  if (grupo.premium && !unlocked) {
    return (
      <Card className="flex flex-wrap items-center gap-3 p-5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#fff1e6] text-[color:var(--cta-text)]">
          <HeartPulse className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-display font-bold text-ink">Jornada de Prescrição · {grupo.nome}</div>
          <p className="text-sm text-ink-2">Este grupo faz parte do plano Profissional. Assine para ver a jornada.</p>
        </div>
        <Link to="/pricing" className={buttonClasses("primary", "sm")}>
          Assinar
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
          <div className="rounded-xl border border-[#b45309]/30 bg-[#fef4e2]/40 p-3">
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
            className={cn(buttonClasses("primary"), "w-full")}
          >
            <Navigation className="h-4 w-4" /> Escolher exercícios para esta fase
          </Link>
        </div>
      </div>

      {faseDivergente && (
        <div className="mt-4 rounded-xl border border-[#0e7c8a]/40 bg-primary-tint p-3 text-sm">
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
function PlanoCard({ aluno, planos, onAvaliar }: { aluno: Aluno; planos: PlanoTreino[]; onAvaliar: () => void }) {
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
          <Link to={`/prescrever-treino?aluno=${aluno.id}`} className={cn(buttonClasses("primary", "sm"), "mt-3")}>
            <CalendarRange className="h-4 w-4" /> Montar treino
          </Link>
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
            <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-3">Bloco atual do plano (pelo calendário)</p>
            <p className="text-sm font-semibold text-ink">{rotuloMeso(meso)}</p>
            <p className="text-xs text-ink-2">{meso.foco}</p>
            {meso.capacidades.length > 0 && (
              <div className="mt-2">
                <ListaChips titulo="Capacidades priorizadas" itens={meso.capacidades} />
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
              chegou ? "border border-[#0e7c8a]/40 bg-primary-tint" : "",
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
                <Activity className="h-4 w-4" /> Registrar avaliação
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
          <Link
            to={`/semaforo?grupo=${aluno.grupoEspecial ?? "geral"}&aluno=${aluno.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-2 hover:text-ink"
          >
            <ShieldCheck className="h-4 w-4" /> Semáforo antes da sessão
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

/** Card de convite do aluno para o app (com a marca do profissional). Só aparece
 *  quando há backend configurado (o portal do aluno depende do Supabase). */
function ConvidarAlunoCard({ alunoId, alunoNome }: { alunoId: string; alunoNome: string }) {
  const configured = useCloudAuth((s) => s.configured);
  const [link, setLink] = React.useState<string | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);
  const [carregando, setCarregando] = React.useState(false);
  const [copiado, setCopiado] = React.useState(false);
  if (!configured) return null;

  const gerar = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const token = await criarConvite(alunoId);
      const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
      setLink(`${window.location.origin}${base}/aluno?convite=${token}`);
    } catch (e) {
      setErro((e as Error)?.message ?? "Não consegui gerar o convite agora.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Card className="h-full p-5">
      <h3 className="font-display text-lg font-bold text-ink">Convidar pelo celular</h3>
      <p className="mt-1 text-sm text-ink-2">
        Gere o link de acesso, envie a {alunoNome.split(" ")[0]} pelo WhatsApp e ele entra no próprio treino, com a sua
        marca.
      </p>
      <ol className="mt-3 space-y-1 text-sm text-ink-2">
        <li>1. Gere o link de acesso.</li>
        <li>2. Envie ao aluno pelo WhatsApp.</li>
        <li>3. Ele entra no próprio treino pelo celular.</li>
      </ol>
      {link ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            readOnly
            value={link}
            aria-label="Link de convite do aluno"
            onFocus={(e) => e.currentTarget.select()}
            className="min-w-0 flex-1 rounded-lg border border-border bg-surface-soft px-3 py-2 text-xs text-ink-2"
          />
          <button
            onClick={() => {
              navigator.clipboard?.writeText(link);
              setCopiado(true);
            }}
            className={buttonClasses("secondary", "sm")}
          >
            {copiado ? "Copiado" : "Copiar link"}
          </button>
        </div>
      ) : (
        <button onClick={gerar} disabled={carregando} className={cn(buttonClasses("primary", "sm"), "mt-3")}>
          {carregando ? "Gerando..." : "Gerar convite do aluno"}
        </button>
      )}
      {erro && <p className="mt-2 text-xs text-warning">{erro}</p>}
    </Card>
  );
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
    <div className="flex items-center gap-3 rounded-xl border border-border p-3">
      <span
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-lg",
          tone === "warning" ? "bg-[#fef4e2] text-warning" : "bg-surface-soft text-ink-2",
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-xs text-ink-3">{rotulo}</div>
        <div className={cn("truncate font-semibold", tone === "warning" ? "text-warning" : "text-ink")}>{valor}</div>
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

// `dir` = direção desejável da métrica: "menor" (cair é bom), "maior" (subir é
// bom), "neutro" (sem juízo de valor). Colore o delta pela direção certa, então
// ganhar massa muscular aparece como positivo, não como alerta.
type DirMetrica = "menor" | "maior" | "neutro";
const METRICAS_EVOLUCAO: { key: string; label: string; unit: string; dir: DirMetrica }[] = [
  { key: "peso", label: "Peso", unit: "kg", dir: "neutro" },
  { key: "percentualGordura", label: "% gordura", unit: "%", dir: "menor" },
  { key: "cintura", label: "Cintura", unit: "cm", dir: "menor" },
  { key: "quadril", label: "Quadril", unit: "cm", dir: "neutro" },
  { key: "massaMuscular", label: "Massa muscular", unit: "kg", dir: "maior" },
  { key: "imc", label: "IMC", unit: "", dir: "neutro" },
  { key: "fcRepouso", label: "FC repouso", unit: "bpm", dir: "menor" },
  { key: "pressaoSistolica", label: "PA sistólica", unit: "mmHg", dir: "menor" },
];

/** Classe de cor do delta segundo a direção desejável da métrica. */
function corDelta(dir: DirMetrica, delta: number): string {
  if (dir === "neutro" || delta === 0) return "text-ink-2";
  const bom = dir === "menor" ? delta < 0 : delta > 0;
  return bom ? "text-success" : "text-[color:var(--cta-text)]";
}

function Evolucao({ avals }: { avals: Avaliacao[] }) {
  const metrics = METRICAS_EVOLUCAO;
  const disponiveis = metrics.filter((m) => avals.some((a) => a.medidas[m.key] != null));
  const [metric, setMetric] = React.useState(disponiveis[0]?.key ?? "peso");

  if (avals.length === 0) {
    return <p className="py-6 text-center text-sm text-ink-2">Registre avaliações para ver a evolução.</p>;
  }

  const cfg = metrics.find((m) => m.key === metric) ?? metrics[0];
  const serie = avals.map((a) => a.medidas[cfg.key]).filter((v): v is number => v != null);
  const primeiro = serie[0];
  const ultimo = serie[serie.length - 1];
  const delta = ultimo != null && primeiro != null ? +(ultimo - primeiro).toFixed(1) : 0;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5">
          {disponiveis.map((m) => (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
              className={cn(
                "rounded-full px-3 py-1 text-sm font-medium",
                metric === m.key ? "bg-primary-tint text-primary" : "text-ink-2 hover:bg-surface-soft",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        {serie.length >= 2 && (
          <span className="text-sm text-ink-2">
            {cfg.label}: {ultimo}
            {cfg.unit} ·{" "}
            <span className={cn("font-semibold", corDelta(cfg.dir, delta))}>
              {delta > 0 ? "+" : ""}
              {delta}
              {cfg.unit}
            </span>{" "}
            no período
          </span>
        )}
      </div>
      {serie.length < 2 ? (
        <p className="py-4 text-center text-sm text-ink-3">Ao menos duas avaliações para traçar a curva.</p>
      ) : (
        <MiniLine values={serie} />
      )}
    </div>
  );
}

function MiniLine({ values }: { values: number[] }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const coord = (v: number, i: number) => {
    const x = (i / (values.length - 1)) * 100;
    const y = 40 - ((v - min) / range) * 34 - 3;
    return { x, y };
  };
  const pts = values.map((v, i) => {
    const c = coord(v, i);
    return `${c.x},${c.y}`;
  });
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-28 w-full">
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      {values.map((v, i) => {
        const c = coord(v, i);
        return <circle key={i} cx={c.x} cy={c.y} r={3} fill="var(--primary)" vectorEffect="non-scaling-stroke" />;
      })}
    </svg>
  );
}
