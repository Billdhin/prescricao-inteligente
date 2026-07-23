import * as React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  CalendarRange,
  CalendarPlus,
  Users,
  UserCheck,
  Sparkles,
  ShieldCheck,
  BookOpen,
  Pencil,
  Eye,
  Save,
  FileDown,
  Check,
  AlertTriangle,
} from "lucide-react";
import { Card, Pill, buttonClasses, SectionHeader, LinhaDeTokens, TokenRotulado } from "@/components/ui/primitives";
import { PaywallCard } from "@/components/ui/PaywallCard";
import { SeloRCD } from "@/components/rcd/SeloRCD";
import { GraficoProgressao, MesocicloCard, ModeloExplicacao, type ContextoFaixa } from "@/components/treino/PlanoEditor";
import { cn } from "@/lib/utils";
import { OBJETIVOS, type GpsObjetivo } from "@/lib/gps/engine";
import { gerarPlano } from "@/lib/gps/periodizacao";
import {
  getModelo,
  MODELOS_PERIODIZACAO,
  semanaAtual,
  mesocicloAtual,
  type Macrociclo,
  type Mesociclo,
  type PlanoTreino,
} from "@/data/periodizacao";
import type { Nivel } from "@/data/types";
import type { Aluno } from "@/data/alunos";
import { specialGroups, getSpecialGroup } from "@/data/specialGroups";
import { bibliografia } from "@/data/referencias";
import { exportPlanoPDF } from "@/lib/exportPlano";
import { useAlunos, useUser, isPremiumUnlocked, marcaDoUsuario, uid } from "@/lib/store";
import { podeMontarTreino } from "@/lib/gps/proximoPasso";
import { useDialog } from "@/lib/useDialog";
import { toast } from "@/lib/toast";

const NIVEIS: Nivel[] = ["Iniciante", "Intermediário", "Avançado"];
// Horizontes de calendário no lugar de semanas soltas: o profissional pensa em "trimestral",
// não em "12". `gerarPlano` segue recebendo semanas (o motor não muda de assinatura).
const HORIZONTES = [
  { id: "mensal", rotulo: "Mensal", semanas: 4 },
  { id: "trimestral", rotulo: "Trimestral", semanas: 12 },
  { id: "semestral", rotulo: "Semestral", semanas: 24 },
  { id: "anual", rotulo: "Anual", semanas: 48 },
] as const;
const FREQUENCIAS = [2, 3, 4, 5, 6];

const fmtDataCurta = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(ts));

/* ------------------------------- Página ------------------------------- */

export function PrescreverTreino() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const alunos = useAlunos((s) => s.alunos);
  const addPlano = useAlunos((s) => s.addPlano);
  const updatePlano = useAlunos((s) => s.updatePlano);
  const planosSalvos = useAlunos((s) => s.planos);
  const execucoes = useAlunos((s) => s.execucoes);
  const prescricoes = useAlunos((s) => s.prescricoes);
  const avaliacoes = useAlunos((s) => s.avaliacoes);
  const user = useUser();
  const premium = isPremiumUnlocked(user.plan);
  const [confirmarRegenerar, setConfirmarRegenerar] = React.useState(false);

  // `?plano=` abre um plano salvo para continuar de onde parou; `?aluno=` começa um novo
  // já com o perfil dele. Sem retomar, "abrir plano" no perfil do aluno geraria um plano
  // novo por cima do que o profissional já ajustou.
  const planoPre = planosSalvos.find((p) => p.id === params.get("plano"));
  const alunoInicial = alunos.find((a) => a.id === (planoPre?.alunoId ?? params.get("aluno")));

  const [alunoId, setAlunoId] = React.useState<string | undefined>(alunoInicial?.id);
  const aluno = alunos.find((a) => a.id === alunoId);
  // Gate duro do trilho: sem avaliação, o treino não nasce. Vale quando um aluno está
  // selecionado e não estamos editando um plano salvo dele. Plano avulso (sem aluno)
  // segue 100% livre, por ser uso de estudo/simulação.
  const gate = aluno ? podeMontarTreino(aluno, { avaliacoes }) : { ok: true };
  const bloquearSemAvaliacao = Boolean(aluno) && !gate.ok && !planoPre;

  const [objetivo, setObjetivo] = React.useState<GpsObjetivo>(planoPre?.objetivo ?? alunoInicial?.objetivo ?? "Hipertrofia");
  const [nivel, setNivel] = React.useState<Nivel>(planoPre?.nivel ?? alunoInicial?.nivel ?? "Iniciante");
  const [grupo, setGrupo] = React.useState<string>(planoPre?.grupoEspecial ?? alunoInicial?.grupoEspecial ?? "");
  const [frequencia, setFrequencia] = React.useState(planoPre?.frequenciaSemanal ?? 3);
  const [semanas, setSemanas] = React.useState(planoPre?.semanas ?? 12);
  const [disponibilidade, setDisponibilidade] = React.useState(planoPre?.disponibilidade ?? "");

  // O rascunho já nasce como o plano que vai ser salvo: editar, salvar e exportar
  // trabalham no mesmo objeto, então o PDF nunca mostra uma versão anterior da edição.
  const [plano, setPlano] = React.useState<PlanoTreino | null>(planoPre ?? null);
  const [salvo, setSalvo] = React.useState(Boolean(planoPre));

  // `?modelo=` chega das aulas do Aprender ("aplicar no atendimento"): o profissional
  // acabou de estudar um modelo e quer montar um plano com ele.
  const modeloPreferido = MODELOS_PERIODIZACAO.find((m) => m.id === params.get("modelo"))?.id;

  // Regenerar por cima de um plano JÁ SALVO deste aluno (aberto via ?plano=) é destrutivo:
  // exige confirmação e REUTILIZA o id, senão o Salvar arquiva o plano editado e cria um
  // duplicado. Sem ?plano= (ex.: ?aluno=), gerar é sempre um plano novo.
  const planoSalvoDoAluno = planoPre && planoPre.alunoId === alunoId ? planoPre : undefined;
  const execucoesEmRisco = React.useMemo(() => {
    if (!planoSalvoDoAluno) return false;
    const ids = new Set<string>();
    planoSalvoDoAluno.macrociclo.mesociclos.forEach((m) =>
      m.microciclos.forEach((w) => w.sessoes.forEach((s) => s.blocos.forEach((b) => ids.add(b.id)))),
    );
    return execucoes.some((e) => ids.has(e.blocoRef));
  }, [planoSalvoDoAluno, execucoes]);

  const montar = (
    ctx: {
      objetivo: GpsObjetivo;
      nivel: Nivel;
      semanas: number;
      frequencia: number;
      grupoEspecial?: string;
      disponibilidade?: string;
      alunoId?: string;
    },
    idExistente?: string,
  ): PlanoTreino => {
    // O aluno que já está na fase 3 recebe o macro nascendo na fase 3. Só vale com aluno
    // (e só surte efeito em plano de grupo especial); avulso segue começando na fase 1.
    const g = gerarPlano({
      ...ctx,
      modeloPreferido,
      faseInicial: ctx.alunoId ? aluno?.faseJornada : undefined,
    });
    return {
      // `uid()` e não o relógio: dois planos gerados no mesmo milissegundo receberiam o
      // mesmo id, e salvar o segundo sobrescreveria o primeiro em vez de arquivá-lo.
      // `idExistente` reaproveita o id do plano salvo, para regenerar sem duplicar.
      id: idExistente ?? `plano-${uid()}`,
      alunoId: ctx.alunoId ?? "",
      data: Date.now(),
      titulo: g.titulo,
      objetivo: ctx.objetivo,
      nivel: ctx.nivel,
      semanas: ctx.semanas,
      frequenciaSemanal: ctx.frequencia,
      disponibilidade: ctx.disponibilidade || undefined,
      modeloId: g.modeloId,
      modeloAltId: g.modeloAltId,
      grupoEspecial: ctx.grupoEspecial,
      macrociclo: g.principal,
      alternativa: g.alternativa,
      raciocinio: g.raciocinio,
      refIds: g.refIds,
      status: "ativo",
    };
  };

  const irParaResultado = () =>
    requestAnimationFrame(() => document.getElementById("resultado-treino")?.scrollIntoView({ behavior: "smooth", block: "start" }));

  // Abrir um plano salvo via ?plano= cai direto no resultado, não no formulário vazio:
  // senão "Gerar periodização" fica armado por cima do plano salvo (a armadilha antiga).
  React.useEffect(() => {
    if (planoPre) irParaResultado();
    // roda uma vez, no carregamento
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ao escolher um aluno, herda o perfil (defaults inteligentes).
  const escolherAluno = (id: string | undefined) => {
    setAlunoId(id);
    const a = alunos.find((x) => x.id === id);
    if (a) {
      setObjetivo(a.objetivo);
      setNivel(a.nivel);
      setGrupo(a.grupoEspecial ?? "");
    }
    setPlano(null);
    setSalvo(false);
  };

  const gerarAgora = () => {
    setPlano(
      montar({ objetivo, nivel, semanas, frequencia, grupoEspecial: grupo || undefined, disponibilidade, alunoId }, planoSalvoDoAluno?.id),
    );
    setSalvo(false);
    irParaResultado();
  };

  const gerar = () => {
    // Regenerar por cima de um plano salvo confirma antes; caso contrário, gera direto.
    if (planoSalvoDoAluno) setConfirmarRegenerar(true);
    else gerarAgora();
  };

  const carregarExemplo = () => {
    setAlunoId(undefined);
    setObjetivo("Hipertrofia");
    setNivel("Intermediário");
    setGrupo("");
    setFrequencia(4);
    setSemanas(12);
    setDisponibilidade("Seg, qua, sex e sáb, cerca de 60 min");
    setPlano(montar({ objetivo: "Hipertrofia", nivel: "Intermediário", semanas: 12, frequencia: 4 }));
    setSalvo(false);
    irParaResultado();
  };

  const salvar = () => {
    if (!plano || !aluno) return;
    const jaExiste = planosSalvos.some((p) => p.id === plano.id);
    if (jaExiste) {
      updatePlano(plano.id, plano);
      setSalvo(true);
      toast("Plano atualizado no perfil do aluno.");
    } else {
      addPlano({ ...plano, alunoId: aluno.id });
      // Primeiro salvamento de um plano novo: leva ao perfil, onde o chip "Sem treino"
      // morre na frente do usuário, com o banner e a aba de treino aberta. Salvamentos
      // seguintes (updatePlano) ficam na tela, com o link "Ver no perfil de {nome}".
      navigate(`/alunos/${aluno.id}`, { state: { planoSalvo: true } });
    }
  };

  // Resolve a data de exibição de uma prescrição pela id: alimenta o selo "da prescrição de
  // {data}" nos blocos semeados. Só exibição; o vínculo em si é derivado, nunca gravado.
  const prescricaoData = React.useCallback(
    (pid: string) => {
      const p = prescricoes.find((x) => x.id === pid);
      return p ? fmtDataCurta(p.data) : undefined;
    },
    [prescricoes],
  );

  const exportar = () => {
    if (!plano || !aluno) return;
    exportPlanoPDF({
      aluno,
      plano,
      profissional: user.name,
      cref: user.cref,
      marca: marcaDoUsuario(user),
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Cabeçalho */}
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <SeloRCD compacto />
          <Pill tone="neutral">Planejamento longitudinal</Pill>
        </div>
        <h1 className="flex items-center gap-2 font-display text-3xl font-bold text-ink md:text-4xl">
          <CalendarRange className="h-7 w-7 text-primary" /> Prescrever treino
        </h1>
        <p className="mt-1 text-ink-2">
          Monte a periodização completa do aluno (macrociclo, mesociclos e microciclos) com base científica.
          A ferramenta apoia a sua decisão e organiza a progressão; você edita tudo depois. Para exercícios
          individuais, use{" "}
          <Link to="/gps" className="font-semibold text-primary hover:underline">
            Prescrever exercício
          </Link>
          .
        </p>
      </div>

      {/* Passo 1: contexto */}
      <Card variant="raised" className="p-5">
        <SectionHeader level={2} eyebrow="Passo 1" title="Contexto do aluno" />

        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-semibold text-ink">Aluno</label>
          {alunos.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-3 text-sm text-ink-3">
              Nenhum aluno cadastrado ainda. Você pode gerar um plano avulso abaixo ou{" "}
              <Link to="/alunos" className="font-semibold text-primary hover:underline">
                cadastrar um aluno
              </Link>
              .
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => escolherAluno(undefined)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                  !alunoId ? "border-primary bg-primary-tint text-primary" : "border-border text-ink-2 hover:bg-surface-soft",
                )}
              >
                <Users className="h-3.5 w-3.5" /> Plano avulso
              </button>
              {alunos.map((a) => (
                <button
                  key={a.id}
                  onClick={() => escolherAluno(a.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                    alunoId === a.id ? "border-primary bg-primary-tint text-primary" : "border-border text-ink-2 hover:bg-surface-soft",
                  )}
                >
                  <UserCheck className="h-3.5 w-3.5" /> {a.nome}
                </button>
              ))}
            </div>
          )}
          {aluno && !bloquearSemAvaliacao && (
            <p className="mt-2 text-xs text-ink-3">
              Objetivo, nível e grupo especial vieram do cadastro de {aluno.nome}. Ajuste se quiser.
              {aluno.restricoes.length > 0 && ` ${aluno.restricoes.length} restrição(ões) no perfil: revise os exercícios de cada sessão à luz delas (a periodização organiza volume e intensidade; a seleção segura por restrição fica no Prescrever exercício).`}
            </p>
          )}
        </div>

        {/* Gate duro: aluno selecionado sem avaliação não gera plano; explica e leva a registrar. */}
        {bloquearSemAvaliacao && aluno ? (
          <BlocoAvaliacaoNecessaria aluno={aluno} />
        ) : (
          <>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Campo label="Objetivo">
            <Opcoes valor={objetivo} opcoes={OBJETIVOS} onSelect={(v) => setObjetivo(v as GpsObjetivo)} />
          </Campo>
          <Campo label="Nível de treinamento">
            <Opcoes valor={nivel} opcoes={NIVEIS} onSelect={(v) => setNivel(v as Nivel)} />
          </Campo>
        </div>

        <div className="mt-4">
          <label htmlFor="grupo-especial" className="mb-1.5 block text-sm font-semibold text-ink">
            Condição / grupo especial <span className="font-normal text-ink-3">(opcional)</span>
          </label>
          <select id="grupo-especial" value={grupo} onChange={(e) => setGrupo(e.target.value)} className="input w-full">
            <option value="">Sem condição especial</option>
            {specialGroups.map((g) => (
              <option key={g.slug} value={g.slug}>
                {g.nome}
              </option>
            ))}
          </select>
          {grupo && (
            <p className="mt-1.5 flex items-start gap-1.5 text-xs text-ink-2">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-analysis" />
              A jornada de fases deste grupo será a base do macrociclo, e os cuidados serão sobrepostos.
            </p>
          )}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Campo label="Frequência semanal">
            <Opcoes valor={String(frequencia)} opcoes={FREQUENCIAS.map((f) => `${f}`)} onSelect={(v) => setFrequencia(Number(v))} sufixo="x" />
          </Campo>
          <Campo label="Horizonte do acompanhamento">
            <div className="flex flex-wrap gap-1.5">
              {HORIZONTES.map((h) => (
                <button
                  key={h.id}
                  onClick={() => setSemanas(h.semanas)}
                  aria-pressed={semanas === h.semanas}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition-colors",
                    semanas === h.semanas ? "border-primary bg-primary-tint font-semibold text-primary" : "border-border text-ink-2 hover:bg-surface-soft",
                  )}
                >
                  {h.rotulo} ({h.semanas} semanas)
                </button>
              ))}
            </div>
          </Campo>
        </div>
        <div className="mt-4">
          <label htmlFor="disponibilidade" className="mb-1.5 block text-sm font-semibold text-ink">
            Disponibilidade e observações <span className="font-normal text-ink-3">(opcional)</span>
          </label>
          <input
            id="disponibilidade"
            value={disponibilidade}
            onChange={(e) => setDisponibilidade(e.target.value)}
            placeholder="Ex.: seg/qua/sex à noite, 60 min, academia completa"
            className="input w-full"
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
          <button onClick={gerar} className={buttonClasses(planoSalvoDoAluno ? "secondary" : "primary")}>
            <Sparkles className="h-4 w-4" />
            {planoSalvoDoAluno ? "Gerar de novo (substitui o plano salvo)" : "Gerar periodização"}
          </button>
          {!plano && (
            <button
              onClick={carregarExemplo}
              className="text-sm text-ink-3 underline decoration-dotted underline-offset-4 hover:text-primary"
              title="Preenche o formulário com um caso de demonstração (hipertrofia, intermediário, 12 semanas) e gera o plano."
            >
              Não sabe por onde começar? Ver um exemplo pronto
            </button>
          )}
        </div>
          </>
        )}
      </Card>

      {/* Resultado */}
      {plano && (
        <div id="resultado-treino" className="scroll-mt-24">
          <ResultadoPlano
            plano={plano}
            onChange={(p) => {
              setPlano(p);
              setSalvo(false);
            }}
            premium={premium}
            aluno={aluno?.nome}
            alunoObj={aluno}
            prescricaoData={prescricaoData}
            podeSalvar={Boolean(aluno)}
            salvo={salvo}
            onSalvar={salvar}
            onExportar={exportar}
          />
        </div>
      )}

      {confirmarRegenerar && (
        <ConfirmarRegenerarModal
          execucoesEmRisco={execucoesEmRisco}
          onClose={() => setConfirmarRegenerar(false)}
          onConfirm={() => {
            setConfirmarRegenerar(false);
            gerarAgora();
          }}
        />
      )}
    </div>
  );
}

/** Regenerar por cima de um plano salvo é destrutivo (arquiva a versão editada e pode
 *  desvincular execuções): confirma antes, com um botão primário só. */
function ConfirmarRegenerarModal({
  execucoesEmRisco,
  onClose,
  onConfirm,
}: {
  execucoesEmRisco: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const dialogRef = useDialog<HTMLDivElement>(onClose);
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end bg-black/40 p-0 backdrop-blur-sm sm:place-items-center sm:p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Gerar o plano de novo"
        className="w-full max-w-md rounded-t-card bg-surface p-6 shadow-elevated outline-none sm:rounded-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-warning-tint text-warning">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <h2 className="font-display text-lg font-bold text-ink">Gerar o plano de novo?</h2>
        </div>
        <p className="text-sm text-ink-2">
          Gerar de novo substitui o plano salvo deste aluno.
          {execucoesEmRisco && " O histórico de execução das sessões atuais será desvinculado."}
        </p>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button onClick={onClose} className={buttonClasses("secondary", "sm")}>
            Cancelar
          </button>
          <button onClick={onConfirm} className={buttonClasses("primary", "sm")}>
            Gerar de novo
          </button>
        </div>
      </div>
    </div>
  );
}

/** Gate duro do trilho no Prescrever treino: sem avaliação, o plano não nasce.
 *  Substitui o formulário de geração, explica o porquê e leva a registrar a
 *  avaliação (ou voltar ao plano avulso). */
function BlocoAvaliacaoNecessaria({ aluno }: { aluno: Aluno }) {
  const primeiro = aluno.nome.split(" ")[0];
  return (
    <div className="mt-4 rounded-xl border border-warning/30 bg-warning-tint/50 p-4">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface text-warning">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-base font-bold text-ink">Registre a avaliação primeiro. O treino nasce dela.</h3>
          <p className="mt-1 text-sm text-ink-2">
            A periodização de {primeiro} é montada a partir das medidas de base. Registre a avaliação inicial e o
            plano passa a nascer dela, com a progressão justificada. Para montar um plano de estudo sem aluno,
            selecione "Plano avulso" acima.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link to={`/alunos/${aluno.id}?avaliar=1`} className={buttonClasses("primary", "sm")}>
              <CalendarPlus className="h-4 w-4" /> Registrar avaliação
            </Link>
            <Link to={`/alunos/${aluno.id}`} className={buttonClasses("secondary", "sm")}>
              Ver perfil de {primeiro}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- Resultado ------------------------------- */

function ResultadoPlano({
  plano,
  onChange,
  premium,
  aluno,
  alunoObj,
  prescricaoData,
  podeSalvar,
  salvo,
  onSalvar,
  onExportar,
}: {
  plano: PlanoTreino;
  onChange: (p: PlanoTreino) => void;
  premium: boolean;
  aluno?: string;
  /** objeto do aluno (perfil) para a troca segura no editor; ausente = plano avulso */
  alunoObj?: Aluno;
  prescricaoData?: (id: string) => string | undefined;
  podeSalvar: boolean;
  salvo: boolean;
  onSalvar: () => void;
  onExportar: () => void;
}) {
  const [aba, setAba] = React.useState<"principal" | "alternativa">("principal");
  const [editando, setEditando] = React.useState(false);

  const naAlternativa = aba === "alternativa" && Boolean(plano.alternativa);
  const macro = naAlternativa ? plano.alternativa! : plano.macrociclo;
  const modelo = getModelo(naAlternativa && plano.modeloAltId ? plano.modeloAltId : plano.modeloId);
  const grupoObj = plano.grupoEspecial ? getSpecialGroup(plano.grupoEspecial) : undefined;
  const biblio = bibliografia(plano.refIds);
  // Contexto estendido: leva o perfil do aluno (restrições/equipamentos/grupo) até o editor,
  // para a troca segura ranquear pelo mesmo motor do Prescrever exercício. Sem aluno, o
  // helper interno aplica os defaults do Gps (sem restrição, todos os equipamentos).
  const ctx: ContextoFaixa = {
    objetivo: plano.objetivo,
    nivel: plano.nivel,
    restricoes: alunoObj?.restricoes,
    equipamentos: alunoObj?.equipamentos,
    grupoEspecial: alunoObj?.grupoEspecial ?? plano.grupoEspecial,
    condicoesAtencao: alunoObj?.condicoesAtencao,
    prescricaoData,
  };

  // "Você está aqui": num plano salvo, o mesociclo/semana correntes saem do calendário;
  // num rascunho ainda não salvo, o ponto de partida é o primeiro bloco (semana 1).
  const semanaCorrente = salvo ? semanaAtual(plano) : 1;
  const mesoAtual = naAlternativa
    ? macro.mesociclos.find((m) => semanaCorrente >= m.semanaInicio && semanaCorrente <= m.semanaFim)
    : mesocicloAtual(plano);
  // "Registrar reavaliação" só faz sentido quando há aluno (o destino é o perfil dele).
  const reavaliarHref = podeSalvar && plano.alunoId ? `/alunos/${plano.alunoId}?avaliar=1` : undefined;

  const trocarMacro = (m: Macrociclo) => onChange(naAlternativa ? { ...plano, alternativa: m } : { ...plano, macrociclo: m });
  const trocarMeso = (meso: Mesociclo) =>
    trocarMacro({ ...macro, mesociclos: macro.mesociclos.map((x) => (x.id === meso.id ? meso : x)) });

  // Editar a alternativa e depois salvar guardaria o macrociclo principal, que não é o que
  // está na tela. Promover primeiro deixa claro qual plano é o plano.
  const promoverAlternativa = () => {
    if (!plano.alternativa || !plano.modeloAltId) return;
    onChange({
      ...plano,
      macrociclo: plano.alternativa,
      alternativa: plano.macrociclo,
      modeloId: plano.modeloAltId,
      modeloAltId: plano.modeloId,
    });
    setAba("principal");
  };

  return (
    <div className="space-y-5">
      <SectionHeader level={2} eyebrow="Passo 2" title="Periodização proposta" />

      {/* Resumo + raciocínio */}
      <Card variant="raised" className="border-l-4 border-primary p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Pill tone="primary">{modelo.nome}</Pill>
          <LinhaDeTokens>
            <TokenRotulado label="Objetivo" value={plano.objetivo} />
            <TokenRotulado label="Nível" value={plano.nivel} />
            <TokenRotulado label="Duração" value={`${plano.semanas} semanas`} />
          </LinhaDeTokens>
          {grupoObj && <Pill tone="analysis">{grupoObj.nome}</Pill>}
          {/* O plano nasce de um modelo verificado, mas é ponto de partida do
              profissional, não decisão pronta: enquanto não for salvo, é rascunho. */}
          {!salvo && <Pill tone="warning">Rascunho a revisar</Pill>}
        </div>
        {editando ? (
          <input
            value={plano.titulo}
            onChange={(e) => onChange({ ...plano, titulo: e.target.value })}
            aria-label="Título do plano"
            className="input mb-2 w-full text-sm font-semibold"
          />
        ) : (
          <p className="mb-1 font-display font-bold text-ink">{plano.titulo}</p>
        )}
        <p className="text-sm text-ink">{plano.raciocinio}</p>
      </Card>

      {/* Ações: editar, salvar, PDF (plano Profissional) */}
      {premium && (
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setEditando((v) => !v)} className={buttonClasses(editando ? "primary" : "secondary", "sm")}>
            {editando ? (
              <>
                <Eye className="h-4 w-4" /> Ver como fica
              </>
            ) : (
              <>
                <Pencil className="h-4 w-4" /> Editar o plano
              </>
            )}
          </button>
          <button onClick={onSalvar} disabled={!podeSalvar} className={cn(buttonClasses("secondary", "sm"), !podeSalvar && "cursor-not-allowed opacity-50")}>
            {salvo ? <Check className="h-4 w-4 text-success" /> : <Save className="h-4 w-4" />}
            {salvo ? "Salvo" : "Salvar no perfil"}
          </button>
          {/* Salvo e continuando na tela (update de plano já salvo): o caminho ao perfil
              fica à mão. O primeiro salvamento de plano novo já navega para lá sozinho. */}
          {salvo && podeSalvar && plano.alunoId && (
            <Link to={`/alunos/${plano.alunoId}`} className={buttonClasses("ghost", "sm")}>
              Ver no perfil de {aluno}
            </Link>
          )}
          <button onClick={onExportar} disabled={!podeSalvar} className={cn(buttonClasses("ghost", "sm"), !podeSalvar && "cursor-not-allowed opacity-50")}>
            <FileDown className="h-4 w-4" /> Exportar PDF
          </button>
          {!podeSalvar && (
            <span className="text-xs text-ink-3">Selecione um aluno no passo 1 para salvar no perfil e exportar com a sua marca.</span>
          )}
          {podeSalvar && editando && <span className="text-xs text-ink-3">Editando o plano de {aluno}. As alterações entram ao salvar.</span>}
        </div>
      )}

      {editando && (
        <p className="rounded-xl border border-dashed border-border bg-surface-soft p-3 text-xs text-ink-2">
          Tudo abaixo é seu: séries, repetições, intensidade, intervalo, exercícios, sessões da semana,
          onde cai a descarga e onde entra a reavaliação. As faixas da diretriz aparecem em cada semana
          como referência, e o aviso de fora da faixa não trava nada.
        </p>
      )}

      {/* Opção principal x alternativa (a alternativa faz parte do plano Profissional) */}
      {plano.alternativa && premium && (
        <div className="flex flex-wrap items-center gap-2">
          <div role="tablist" aria-label="Opções de periodização" className="flex gap-1.5">
            {(["principal", "alternativa"] as const).map((k) => {
              const m = k === "alternativa" ? getModelo(plano.modeloAltId!) : getModelo(plano.modeloId);
              return (
                <button
                  key={k}
                  role="tab"
                  aria-selected={aba === k}
                  onClick={() => setAba(k)}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors",
                    aba === k ? "border-primary bg-primary-tint text-primary" : "border-border text-ink-2 hover:bg-surface-soft",
                  )}
                >
                  {k === "principal" ? "Opção principal" : "Alternativa"}: {m.nome}
                </button>
              );
            })}
          </div>
          {naAlternativa && (
            <button onClick={promoverAlternativa} className={buttonClasses("ghost", "sm")}>
              Usar esta como principal
            </button>
          )}
        </div>
      )}

      {/* Gráfico de progressão */}
      <GraficoProgressao macro={macro} nivel={plano.nivel} />

      {/* Timeline macro -> meso -> micro */}
      <div className="space-y-3">
        {macro.mesociclos.map((m, i) => {
          const bloqueado = !premium && i > 0;
          return bloqueado ? (
            i === 1 ? (
              <PaywallCard
                key={m.id}
                titulo="Veja a periodização completa"
                descricao="A prévia mostra o primeiro bloco. Os demais mesociclos, a alternativa, a edição e o PDF fazem parte do plano Profissional."
              />
            ) : null
          ) : (
            <MesocicloCard
              key={m.id}
              meso={m}
              indice={i}
              ctx={ctx}
              editavel={premium && editando}
              onChange={trocarMeso}
              atual={m.id === mesoAtual?.id}
              semanaCorrente={semanaCorrente}
              reavaliarHref={reavaliarHref}
            />
          );
        })}
      </div>

      {/* Área explicativa do modelo */}
      <ModeloExplicacao modelo={modelo} />

      {/* Referências */}
      {biblio.length > 0 && (
        <Card className="p-4">
          <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-analysis">
            <BookOpen className="h-3.5 w-3.5" /> Base científica
          </h3>
          <ol className="list-decimal space-y-1 pl-5 text-xs text-ink-2">
            {biblio.map((b) => (
              <li key={b.ref.id}>
                {b.ref.autores}. {b.ref.titulo}. {b.ref.fonte}, {b.ref.ano}.
                {b.ref.doi && (
                  <>
                    {" "}
                    <a href={`https://doi.org/${b.ref.doi}`} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                      doi:{b.ref.doi}
                    </a>
                  </>
                )}
              </li>
            ))}
          </ol>
        </Card>
      )}

      <p className="rounded-xl bg-surface-soft p-3 text-xs text-ink-3">
        As faixas são referência e não substituem a sua decisão. O plano apoia a organização e a justificativa;
        a conduta é do profissional habilitado. Para condições de saúde, integre a liberação e o acompanhamento
        do profissional de saúde.
      </p>
    </div>
  );
}

/* ------------------------------- Peças ------------------------------- */

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-ink">{label}</label>
      {children}
    </div>
  );
}

function Opcoes({ valor, opcoes, onSelect, sufixo }: { valor: string; opcoes: readonly string[]; onSelect: (v: string) => void; sufixo?: string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {opcoes.map((o) => (
        <button
          key={o}
          onClick={() => onSelect(o)}
          aria-pressed={valor === o}
          className={cn(
            "rounded-full border px-3 py-1.5 text-sm transition-colors",
            valor === o ? "border-primary bg-primary-tint font-semibold text-primary" : "border-border text-ink-2 hover:bg-surface-soft",
          )}
        >
          {o}
          {sufixo}
        </button>
      ))}
    </div>
  );
}
