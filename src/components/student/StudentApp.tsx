import * as React from "react";
import { CalendarDays, Dumbbell, TrendingUp, LogOut, ChevronDown, Clock, HeartPulse, CheckCircle2, Wallet, AlertTriangle } from "lucide-react";
import { Card, Pill, LinhaDeTokens, TokenRotulado, ParDado } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { BrandProvider, type Marca } from "@/lib/brand/BrandContext";
import { aplicarTema, PALETA_PADRAO } from "@/lib/theme/palettes";
import { Logo } from "@/components/brand/Logo";
import { GamificacaoView } from "@/components/student/GamificacaoView";
import { estadoSemaforo } from "@/lib/gps/semaforoDiario";
import { exercises } from "@/data/exercises";
import type { Aluno, Avaliacao, Liberacao } from "@/data/alunos";
import type { Execucao } from "@/data/execucao";
import { formatBRL, statusEfetivo, ROTULO_STATUS_COBRANCA } from "@/data/cobranca";
import {
  type PlanoTreino,
  type Microciclo,
  type Sessao,
  type BlocoSessao,
  semanaAtual,
  mesocicloAtual,
  rotuloMeso,
  rotuloPosicao,
  getMetodo,
  agruparBlocosPorMetodo,
} from "@/data/periodizacao";

const nomeDoBloco = (b: BlocoSessao): string => {
  if (b.exercicioSlug) return exercises.find((e) => e.slug === b.exercicioSlug)?.nome ?? b.nome ?? b.exercicioSlug;
  return b.nome ?? b.modalidade ?? "Exercício";
};

// Encurta valores de dose verbosos que quebram no mobile ("moderada a alta"
// vira "mod. a alta"). Só o texto muda; o número da dose segue intocado e colado
// ao exercício (mover dose para rodapé é VETADO).
const abrevDose = (v: string): string => v.replace(/moderada a alta/gi, "mod. a alta");

// A sessão tem algum bloco com intensidade prescrita? Governa a nota educacional
// única no rodapé do card da Sessão (antes repetida por exercício).
const temIntensidadeNaSessao = (s: Sessao): boolean =>
  s.blocos.some((b) => b.intensidade != null && String(b.intensidade).trim() !== "" && String(b.intensidade).trim() !== "-");

const TIPO_SEMANA: Record<Microciclo["tipo"], { label: string; tone: "neutral" | "warning" | "success" }> = {
  carga: { label: "Semana de carga", tone: "success" },
  deload: { label: "Semana de descarga", tone: "warning" },
  teste: { label: "Semana de teste", tone: "neutral" },
};

type Aba = "hoje" | "semana" | "evolucao";

/**
 * Portal do aluno: o app com a marca do PROFISSIONAL, onde o aluno vê o próprio
 * treino e a periodização. Componente de apresentação puro, alimentado por
 * (aluno, plano, marca). Serve tanto para a prévia do profissional ("ver como o
 * aluno vê") quanto para a produção, quando o aluno logado carrega os próprios
 * dados via Supabase.
 */
export function StudentApp({
  aluno,
  plano,
  marca,
  avaliacoes = [],
  execucoes = [],
  liberacoes = [],
  onRegistrar,
  onDesfazer,
  preview = false,
  onSair,
}: {
  aluno: Aluno;
  plano?: PlanoTreino;
  marca: Marca;
  avaliacoes?: Avaliacao[];
  /** o que o aluno já registrou (para marcar sessões feitas) */
  execucoes?: Execucao[];
  /** liberações do aluno: alimentam o alerta de "treino em pausa" na aba Hoje */
  liberacoes?: Liberacao[];
  /** registra uma execução; ausente = portal só-leitura */
  onRegistrar?: (e: Execucao) => void;
  /** desfaz uma execução registrada; ausente = sem desfazer */
  onDesfazer?: (execId: string) => void;
  preview?: boolean;
  onSair?: () => void;
}) {
  const [aba, setAba] = React.useState<Aba>("hoje");
  const cor = marca.corPrimaria || "var(--primary)";

  // O portal do aluno herda a paleta + aparência do profissional (e a cor de
  // marca sobrepõe a primária). Aplica no container do portal, não na raiz do
  // documento, para não vazar para uma eventual prévia dentro do app.
  const rootRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (rootRef.current) {
      aplicarTema(rootRef.current, marca.paleta || PALETA_PADRAO, marca.modo || "claro", marca.corPrimaria);
    }
  }, [marca.paleta, marca.modo, marca.corPrimaria]);

  // Financeiro visível na porta de entrada: um selo tocável no cabeçalho quando a
  // mensalidade não está em dia leva direto ao card de pagamento (aba Semana).
  const cobranca = aluno.cobranca;
  const cobrancaPendente = cobranca ? statusEfetivo(cobranca) === "pendente" : false;

  return (
    <BrandProvider marca={marca}>
      <div ref={rootRef} className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col bg-bg">
        {preview && (
          <div className="px-4 py-1.5 text-center text-xs font-semibold text-white" style={{ background: cor }}>
            Prévia: é assim que o seu aluno vê o app
          </div>
        )}

        {/* Palco de marca: faixa tintada com a cor do profissional (hex+alpha
            LITERAL, jamais /NN sobre token). Pior caso verificado (preto a 8%
            sobre branco = #ebebeb) mantém o ink em 12.27:1. A saudação mora dentro. */}
        <header
          className="border-b border-border px-4 py-3"
          style={{ background: (marca.corPrimaria || "#1b4b66") + "14" }}
        >
          <div className="flex items-center justify-between gap-3">
            <Logo />
            <div className="flex items-center gap-1.5">
              {cobrancaPendente && (
                <button
                  onClick={() => setAba("semana")}
                  className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-white"
                  style={{ background: "var(--warning)" }}
                >
                  <Wallet className="h-3.5 w-3.5" /> Mensalidade pendente
                </button>
              )}
              {onSair && (
                <button
                  onClick={onSair}
                  className="rounded-lg p-2 text-ink-3 hover:bg-surface-soft hover:text-ink"
                  aria-label={preview ? "Fechar prévia" : "Sair da conta"}
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <div className="mt-3">
            <p className="text-sm text-ink-3">Olá, {aluno.nome.split(" ")[0]}</p>
            <h1 className="font-display text-2xl font-bold text-ink">
              {aba === "hoje" ? "Hoje" : aba === "semana" ? "Sua semana" : "Sua evolução"}
            </h1>
          </div>
        </header>

        <main className="flex-1 space-y-4 p-4 pb-24">
          {aba === "hoje" && (
            <AbaHoje plano={plano} cor={cor} aluno={aluno} execucoes={execucoes} liberacoes={liberacoes} onRegistrar={onRegistrar} onDesfazer={onDesfazer} preview={preview} />
          )}
          {aba === "semana" && <AbaPlano plano={plano} cor={cor} aluno={aluno} />}
          {aba === "evolucao" && (
            <AbaEvolucao aluno={aluno} avaliacoes={avaliacoes} execucoes={execucoes} cor={cor} />
          )}
        </main>

        {/* Barra inferior */}
        <nav
          className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-md border-t border-border bg-[#ffffff]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
          aria-label="Navegação"
        >
          {(
            [
              { id: "hoje", label: "Hoje", Icon: Dumbbell },
              { id: "semana", label: "Semana", Icon: CalendarDays },
              { id: "evolucao", label: "Evolução", Icon: TrendingUp },
            ] as const
          ).map(({ id, label, Icon }) => {
            const ativo = aba === id;
            return (
              <button
                key={id}
                onClick={() => setAba(id)}
                aria-current={ativo ? "page" : undefined}
                className="flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 py-2 text-2xs font-medium leading-none transition-colors"
                style={ativo ? { color: cor } : undefined}
              >
                <Icon className={cn("h-5 w-5", !ativo && "text-ink-3")} />
                <span className={cn(!ativo && "text-ink-3")}>{label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </BrandProvider>
  );
}

/* ------------------------------- Aba: Hoje -------------------------------- */

function AbaHoje({
  plano,
  cor,
  aluno,
  execucoes,
  liberacoes,
  onRegistrar,
  onDesfazer,
  preview,
}: {
  plano?: PlanoTreino;
  cor: string;
  aluno: Aluno;
  execucoes: Execucao[];
  liberacoes: Liberacao[];
  onRegistrar?: (e: Execucao) => void;
  onDesfazer?: (execId: string) => void;
  preview?: boolean;
}) {
  // Alerta persistente de "treino em pausa": aparece antes de tudo quando o último
  // semáforo do aluno foi "não liberado" e não houve um novo depois. Linguagem digna
  // e não clínica; sai sozinho quando o profissional registra um novo semáforo.
  const pausa = estadoSemaforo(aluno.id, liberacoes).vermelhoPendente;
  const alerta = pausa ? <AlertaPausa desde={pausa.data} /> : null;

  if (!plano)
    return (
      <div className="space-y-4">
        {alerta}
        <SemPlano />
      </div>
    );
  const semana = semanaAtual(plano);
  const meso = mesocicloAtual(plano);
  const micro = plano.macrociclo.mesociclos.flatMap((m) => m.microciclos).find((mc) => mc.semana === semana);
  const sessoes = micro?.sessoes ?? [];

  // "Hoje" = a primeira sessão ainda não concluída; se todas foram feitas, a
  // primeira da semana. Ela abre expandida; as demais ficam recolhidas como
  // "Próxima", para o aluno cair direto no que treina agora.
  const sessaoConcluida = (s: Sessao) =>
    s.blocos.length > 0 && s.blocos.every((b) => execucoes.some((e) => e.semana === semana && e.blocoRef === b.id));
  const idxHoje = (() => {
    const i = sessoes.findIndex((s) => !sessaoConcluida(s));
    return i === -1 ? 0 : i;
  })();

  return (
    <div className="space-y-4">
      {alerta}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone="primary">Semana {semana} de {plano.semanas}</Pill>
          {micro && <Pill tone={TIPO_SEMANA[micro.tipo].tone}>{TIPO_SEMANA[micro.tipo].label}</Pill>}
        </div>
        {sessoes[idxHoje] && (
          <p className="mt-2 text-sm text-ink">Treino de hoje: <strong>{sessoes[idxHoje].nome}</strong></p>
        )}
        {meso && (
          <p className="mt-1 text-sm text-ink-2">
            {/* Vírgula (não ":") entre posição e nome: rotuloMeso já traz "Fase N: ..."
                e o dois-pontos duplo lia "Fase atual: Fase 2: ...". Helpers intocados. */}
            {rotuloPosicao(meso)}, <strong className="text-ink">{rotuloMeso(meso)}</strong>. {meso.foco}
          </p>
        )}
      </Card>

      {sessoes.length === 0 ? (
        <Card className="p-6 text-center text-sm text-ink-2">Sem sessões nesta semana.</Card>
      ) : (
        sessoes.map((s, i) => (
          <SessaoCard
            key={s.id}
            sessao={s}
            cor={cor}
            semana={semana}
            plano={plano}
            aluno={aluno}
            execucoes={execucoes}
            onRegistrar={onRegistrar}
            onDesfazer={onDesfazer}
            preview={preview}
            inicialAberto={i === idxHoje}
            rotulo={i === idxHoje ? "Hoje" : "Próxima"}
          />
        ))
      )}
    </div>
  );
}

// Alerta de "treino em pausa" no topo da aba Hoje. Tom danger, texto digno e não
// clínico: diz que a sessão está pausada por orientação do professor e o que fazer.
function AlertaPausa({ desde }: { desde: number }) {
  const dd = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(desde));
  return (
    <div className="flex items-start gap-3 rounded-card border border-danger/40 bg-danger-tint p-4">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
      <div className="min-w-0">
        <div className="font-display font-bold text-danger">Treino em pausa</div>
        <p className="mt-0.5 text-sm text-ink-2">
          Seu treino está em pausa desde {dd} por orientação do seu professor. Fale com ele antes da
          próxima sessão.
        </p>
      </div>
    </div>
  );
}

function SessaoCard({
  sessao,
  cor,
  semana,
  plano,
  aluno,
  execucoes,
  onRegistrar,
  onDesfazer,
  preview,
  inicialAberto = false,
  rotulo,
}: {
  sessao: Sessao;
  cor: string;
  semana: number;
  plano: PlanoTreino;
  aluno: Aluno;
  execucoes: Execucao[];
  onRegistrar?: (e: Execucao) => void;
  onDesfazer?: (execId: string) => void;
  preview?: boolean;
  inicialAberto?: boolean;
  rotulo?: "Hoje" | "Próxima";
}) {
  const [aberto, setAberto] = React.useState(inicialAberto);
  const feitas = sessao.blocos.filter((b) => execucoes.some((e) => e.semana === semana && e.blocoRef === b.id)).length;
  return (
    <Card className="overflow-hidden p-0" style={rotulo === "Hoje" ? { borderColor: cor, borderWidth: 2 } : undefined}>
      <button
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display font-bold text-ink">{sessao.nome}</span>
            {rotulo === "Hoje" ? (
              <span className="rounded-full px-2 py-0.5 text-2xs font-bold uppercase tracking-wide text-white" style={{ background: cor }}>Hoje</span>
            ) : rotulo === "Próxima" ? (
              <span className="rounded-full bg-surface-soft px-2 py-0.5 text-2xs font-semibold uppercase tracking-wide text-ink-3 ring-1 ring-inset ring-border">Próxima</span>
            ) : null}
          </div>
          {sessao.foco && <div className="text-xs text-ink-3">{sessao.foco}</div>}
        </div>
        <div className="flex items-center gap-2">
          {feitas > 0 && <span className="text-xs font-semibold" style={{ color: cor }}>{feitas}/{sessao.blocos.length} exercícios</span>}
          <ChevronDown className={cn("h-5 w-5 shrink-0 text-ink-3 transition-transform", aberto && "rotate-180")} />
        </div>
      </button>
      {aberto && (
        <div className="space-y-2 border-t border-border p-3">
          {agruparBlocosPorMetodo(sessao.blocos).map((seg) => {
            const linhaBloco = (b: BlocoSessao, emGrupo?: boolean) => (
              <BlocoRow
                key={b.id}
                bloco={b}
                cor={cor}
                semana={semana}
                planoId={plano.id}
                alunoId={aluno.id}
                sessaoRef={sessao.id}
                execFeita={execucoes.find((e) => e.semana === semana && e.blocoRef === b.id)}
                onRegistrar={onRegistrar}
                onDesfazer={onDesfazer}
                preview={preview}
                emGrupo={emGrupo}
              />
            );
            if (seg.tipo === "grupo") {
              // Bi/tri/super-set: o par (ou trio) aparece numa moldura única, com a
              // instrução do catálogo uma vez ("faça em sequência, sem descanso entre eles").
              const info = getMetodo(seg.metodo);
              return (
                <div key={seg.grupoId} className="rounded-xl border-2 p-1.5" style={{ borderColor: cor }}>
                  <div className="mb-1 flex flex-wrap items-center gap-2 px-1.5 pt-0.5">
                    <span className="rounded-full px-2 py-0.5 text-2xs font-bold text-white" style={{ background: cor }}>
                      {info?.nome}
                    </span>
                    {info?.descricao && <span className="min-w-0 flex-1 text-2xs leading-tight text-ink-2">{info.descricao}</span>}
                  </div>
                  <div className="space-y-2">{seg.blocos.map((b) => linhaBloco(b, true))}</div>
                </div>
              );
            }
            return linhaBloco(seg.bloco);
          })}

          {/* Rodapé da Sessão: o boilerplate aparece UMA vez por sessão (antes
              repetido por exercício); a dose continua colada a cada exercício. */}
          {(temIntensidadeNaSessao(sessao) || preview) && (
            <div className="space-y-1 pt-0.5">
              {temIntensidadeNaSessao(sessao) && (
                <p className="text-2xs text-ink-3">
                  Intensidade é a porcentagem da sua carga máxima estimada para cada exercício.
                </p>
              )}
              {preview && (
                <p className="text-xs text-ink-3">Aqui o seu aluno registra carga, repetições e esforço.</p>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function BlocoRow({
  bloco,
  cor,
  semana,
  planoId,
  alunoId,
  sessaoRef,
  execFeita,
  onRegistrar,
  onDesfazer,
  preview,
  emGrupo,
}: {
  bloco: BlocoSessao;
  cor: string;
  semana: number;
  planoId: string;
  alunoId: string;
  sessaoRef: string;
  execFeita?: Execucao;
  onRegistrar?: (e: Execucao) => void;
  onDesfazer?: (execId: string) => void;
  preview?: boolean;
  /** o bloco está numa moldura de bi/tri/super-set: o método já vem no cabeçalho do grupo */
  emGrupo?: boolean;
}) {
  const aerobio = bloco.tipo === "aerobio";
  // Cada número com o próprio rótulo (Intensidade 75%, Intervalo 90s), em vez de
  // uma string crua "3 x 12 · 75% · Intervalo: 90s" onde o 75% fica solto.
  const limpo = (v?: string | number | null) =>
    v != null && String(v).trim() && String(v).trim() !== "-" ? String(v) : "";
  const tokensDose: { label: string; value: string }[] = (
    aerobio
      ? [
          { label: "Formato", value: limpo(bloco.formato) },
          { label: "Duração", value: limpo(bloco.duracao) },
          { label: "Intensidade", value: abrevDose(limpo(bloco.intensidade)) },
          { label: "Recuperação", value: limpo(bloco.recuperacao) },
        ]
      : [
          {
            label: "Série",
            value: bloco.series && bloco.reps ? `${bloco.series} x ${bloco.reps}` : limpo(bloco.series) || limpo(bloco.reps),
          },
          { label: "Intensidade", value: abrevDose(limpo(bloco.intensidade)) },
          { label: "Intervalo", value: limpo(bloco.intervalo) },
        ]
  ).filter((t) => t.value);
  const metodo = getMetodo(bloco.metodo);
  // Num grupo, o método (badge + instrução) já vem no cabeçalho da moldura: não repete aqui.
  const metodoVisivel = metodo && metodo.id !== "tradicional" && !emGrupo ? metodo : undefined;

  // Pré-preenche só o que o plano prescreve de forma objetiva E numérica: as Reps.
  // A dose vem como FAIXA textual ("6 a 12", "acima de 15"), que num campo numérico
  // seria truncada (parseInt("6 a 12")=6) ou viraria NaN. Então só pré-preenche
  // quando é um número puro; do contrário, deixa vazio. Carga e RPE não têm alvo
  // numérico (a intensidade é relativa), então entram vazios com âncora.
  const repsPrescrito = /^\d+$/.test(String(bloco.reps ?? "").trim()) ? String(bloco.reps).trim() : "";
  const [editando, setEditando] = React.useState(false);
  const [carga, setCarga] = React.useState(execFeita?.cargaFeita != null ? String(execFeita.cargaFeita) : "");
  const [reps, setReps] = React.useState(execFeita?.repsFeitas != null ? String(execFeita.repsFeitas) : repsPrescrito);
  const [rpe, setRpe] = React.useState(execFeita?.rpe != null ? String(execFeita.rpe) : "");
  const podeRegistrar = !!onRegistrar;
  // Id estável por bloco+semana: registrar de novo SOBRESCREVE (o store faz upsert),
  // então editar não duplica e desfazer tem um alvo certo.
  const execId = `ex-${bloco.id}-s${semana}`;

  // Só grava número quando é número de verdade; texto ("6 a 12") vira undefined
  // em vez de piso truncado ou NaN, que envenenaria o histórico do aluno.
  const numOuUndef = (v: string, f: (s: string) => number): number | undefined => {
    const n = f(v.replace(",", "."));
    return Number.isFinite(n) ? n : undefined;
  };
  const registrar = () => {
    if (!onRegistrar) return;
    onRegistrar({
      id: execId,
      alunoId,
      planoId,
      semana,
      sessaoRef,
      blocoRef: bloco.id,
      exercicioSlug: bloco.exercicioSlug,
      cargaFeita: carga ? numOuUndef(carga, parseFloat) : undefined,
      repsFeitas: reps ? numOuUndef(reps, (s) => parseInt(s, 10)) : undefined,
      rpe: rpe ? numOuUndef(rpe, (s) => parseInt(s, 10)) : undefined,
      concluidoEm: Date.now(),
    });
    setEditando(false);
  };
  const concluirAerobio = () => {
    if (!onRegistrar) return;
    onRegistrar({ id: execId, alunoId, planoId, semana, sessaoRef, blocoRef: bloco.id, exercicioSlug: bloco.exercicioSlug, concluidoEm: Date.now() });
  };
  const desfazer = () => {
    if (execFeita && onDesfazer) onDesfazer(execFeita.id);
    setEditando(false);
  };

  return (
    <div className="rounded-xl border border-border bg-surface-soft p-3">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white" style={{ background: cor }}>
          {aerobio ? <HeartPulse className="h-4 w-4" /> : <Dumbbell className="h-4 w-4" />}
        </span>
        <span className="min-w-0 flex-1 font-semibold text-ink">{nomeDoBloco(bloco)}</span>
        {metodoVisivel && (
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-2xs font-bold text-white"
            style={{ background: cor }}
          >
            {metodoVisivel.nome}
          </span>
        )}
      </div>
      {tokensDose.length > 0 && (
        <LinhaDeTokens className="mt-1.5">
          {tokensDose.map((t) => (
            <TokenRotulado key={t.label} label={t.label} value={t.value} />
          ))}
        </LinhaDeTokens>
      )}
      {/* A nota educacional da intensidade e o aviso de prévia sobem para UMA
          ocorrência no rodapé do card da Sessão; aqui fica só a dose colada. */}
      {metodoVisivel && <p className="mt-1.5 text-xs font-medium text-ink-2">Como fazer: {metodoVisivel.descricao}</p>}
      {bloco.observacao && <p className="mt-1 text-xs text-ink-3">{bloco.observacao}</p>}

      {!preview && podeRegistrar ? (
        execFeita && !editando ? (
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: cor }}>
              <CheckCircle2 className="h-4 w-4" />
              {aerobio
                ? "Concluído"
                : `Feito: ${execFeita.cargaFeita != null ? `${execFeita.cargaFeita} kg` : "sem carga"}${execFeita.repsFeitas != null ? ` x ${execFeita.repsFeitas}` : ""}${execFeita.rpe != null ? ` · RPE ${execFeita.rpe}` : ""}`}
            </span>
            {!aerobio && (
              <button
                onClick={() => setEditando(true)}
                className="inline-flex min-h-[44px] items-center px-1 text-xs font-semibold text-ink-2 underline-offset-2 hover:underline"
              >
                Editar
              </button>
            )}
            {onDesfazer && (
              <button
                onClick={desfazer}
                className="inline-flex min-h-[44px] items-center px-1 text-xs font-medium text-ink-3 underline-offset-2 hover:underline"
              >
                Desfazer
              </button>
            )}
          </div>
        ) : aerobio ? (
          <button
            onClick={concluirAerobio}
            className="mt-2 inline-flex h-11 items-center gap-1.5 rounded-lg px-4 text-sm font-bold text-white"
            style={{ background: cor }}
          >
            <CheckCircle2 className="h-4 w-4" /> Concluí
          </button>
        ) : (
          <div className="mt-2 space-y-1.5">
            <div className="flex flex-wrap items-end gap-2">
              <CampoNum label="Carga (kg)" value={carga} onChange={setCarga} placeholder="kg" />
              <CampoNum label="Reps" value={reps} onChange={setReps} />
              <RpeSelect value={rpe} onChange={setRpe} />
              {/* Abaixo de sm o botão desce para a própria linha (w-full): o
                  flex-wrap antigo o quebrava de forma imprevisível ao lado do RPE. */}
              <button
                onClick={registrar}
                className="inline-flex h-11 w-full items-center justify-center rounded-lg px-4 text-sm font-bold text-white sm:w-auto"
                style={{ background: cor }}
              >
                {editando ? "Salvar" : "Registrar"}
              </button>
              {editando && (
                <button
                  onClick={() => setEditando(false)}
                  className="inline-flex h-11 items-center px-2 text-sm font-medium text-ink-3 hover:text-ink"
                >
                  Cancelar
                </button>
              )}
            </div>
            <p className="text-2xs text-ink-3">RPE é o seu esforço de 0 a 10 (7 = difícil, 9 = quase a falha).</p>
          </div>
        )
      ) : null}
    </div>
  );
}

// Seletor de RPE de 0 a 10 (esforço percebido), com âncoras nas notas que mais
// importam. Substitui o campo livre para o aluno não digitar um valor sem sentido.
function RpeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const id = React.useId();
  const ancora: Record<number, string> = { 5: "moderado", 7: "difícil", 9: "quase a falha", 10: "falha" };
  return (
    <div className="w-24">
      <label htmlFor={id} className="mb-0.5 block text-xs font-semibold uppercase tracking-wide text-ink-3">
        RPE
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-md border border-border bg-surface px-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">-</option>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <option key={n} value={n}>
            {n}
            {ancora[n] ? ` · ${ancora[n]}` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}

function CampoNum({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const id = React.useId();
  return (
    <div className="w-20">
      <label htmlFor={id} className="mb-0.5 block text-xs font-semibold uppercase tracking-wide text-ink-3">
        {label}
      </label>
      <input
        id={id}
        inputMode="decimal"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-md border border-border bg-surface px-2 text-sm text-ink placeholder:text-ink-3/60 focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}

/* ------------------------------- Aba: Plano ------------------------------- */

function AbaPlano({ plano, cor, aluno }: { plano?: PlanoTreino; cor: string; aluno: Aluno }) {
  const semana = plano ? semanaAtual(plano) : 0;
  if (!plano) {
    return (
      <div className="space-y-3">
        <MensalidadeCard aluno={aluno} cor={cor} />
        <SemPlano />
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <MensalidadeCard aluno={aluno} cor={cor} />
      <Card className="p-4">
        <div className="font-display font-bold text-ink">{plano.titulo}</div>
        <p className="mt-1 text-sm text-ink-2">{plano.semanas} semanas · {plano.frequenciaSemanal}x por semana</p>
      </Card>
      {plano.macrociclo.mesociclos.map((m) => {
        const atual = semana >= m.semanaInicio && semana <= m.semanaFim;
        return (
          <Card key={m.id} className="p-4" style={atual ? { borderColor: cor, borderWidth: 2 } : undefined}>
            <div className="flex items-center justify-between gap-2">
              <div className="font-display font-bold text-ink">{rotuloMeso(m)}</div>
              {atual && <Pill tone="primary">{rotuloPosicao(m)}</Pill>}
            </div>
            <p className="mt-1 text-xs text-ink-3">Semanas {m.semanaInicio} a {m.semanaFim}</p>
            <p className="mt-1.5 text-sm text-ink-2">{m.foco}</p>
          </Card>
        );
      })}
    </div>
  );
}

function MensalidadeCard({ aluno, cor }: { aluno: Aluno; cor: string }) {
  const c = aluno.cobranca;
  if (!c) return null;
  const efetivo = statusEfetivo(c);
  const tone: Record<string, "success" | "warning" | "neutral"> = { pago: "success", pendente: "warning", isento: "neutral" };
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white" style={{ background: cor }}>
          <Wallet className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-display font-bold text-ink">Mensalidade {formatBRL(c.valorCentavos)}</div>
          <div className="text-xs text-ink-3">Vence dia {c.diaVencimento}</div>
        </div>
        <Pill tone={tone[efetivo]}>{ROTULO_STATUS_COBRANCA[efetivo]}</Pill>
      </div>
      {efetivo !== "pago" && efetivo !== "isento" && (
        <div className="mt-3">
          {c.linkPagamento ? (
            /^https?:\/\//i.test(c.linkPagamento) ? (
              <a
                href={c.linkPagamento}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-lg py-2 text-center text-sm font-bold text-white"
                style={{ background: cor }}
              >
                Pagar mensalidade
              </a>
            ) : (
              <PixCopia chave={c.linkPagamento} cor={cor} />
            )
          ) : (
            <p className="text-xs text-ink-3">Combine o pagamento com o seu profissional.</p>
          )}
        </div>
      )}
    </Card>
  );
}

function PixCopia({ chave, cor }: { chave: string; cor: string }) {
  const [copiado, setCopiado] = React.useState(false);
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(chave);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 1800);
    } catch {
      /* sem clipboard: a chave segue visível abaixo */
    }
  };
  return (
    <div>
      <button
        onClick={copiar}
        className="block w-full rounded-lg py-2 text-center text-sm font-bold text-white"
        style={{ background: cor }}
      >
        {copiado ? "Chave PIX copiada" : "Copiar chave PIX"}
      </button>
      <p className="mt-1.5 break-all text-center text-2xs text-ink-3">{chave}</p>
    </div>
  );
}

/* ------------------------------ Aba: Evolução ----------------------------- */

function AbaEvolucao({
  aluno,
  avaliacoes,
  execucoes,
  cor,
}: {
  aluno: Aluno;
  avaliacoes: Avaliacao[];
  execucoes: Execucao[];
  cor: string;
}) {
  const doAluno = avaliacoes.filter((a) => a.alunoId === aluno.id).sort((a, b) => b.data - a.data);
  const fmt = (ts: number) => new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(ts));
  return (
    <div className="space-y-4">
      {/* Liga, conquistas e feed a partir dos treinos registrados */}
      <GamificacaoView alunoId={aluno.id} execucoes={execucoes} cor={cor} />

      {/* Avaliações registradas pelo profissional */}
      <section className="space-y-2">
        <h2 className="font-display text-base font-bold text-ink">Avaliações</h2>
        {doAluno.length === 0 ? (
          <Card className="p-6 text-center">
            <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-card bg-surface-soft text-ink-3">
              <Clock className="h-5 w-5" />
            </span>
            <p className="text-sm text-ink-2">Suas avaliações vão aparecer aqui conforme o seu profissional registrar.</p>
          </Card>
        ) : (
          doAluno.map((a) => (
            <Card key={a.id} className="p-4">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <div className="font-display font-bold text-ink">{fmt(a.data)}</div>
                {a.medidas.peso != null && <ParDado layout="inline" label="Peso" value={`${a.medidas.peso} kg`} />}
              </div>
              {a.observacoes && <p className="mt-1.5 text-sm text-ink-2">{a.observacoes}</p>}
            </Card>
          ))
        )}
      </section>
    </div>
  );
}

function SemPlano() {
  return (
    <Card className="p-6 text-center">
      <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-card bg-surface-soft text-ink-3">
        <CalendarDays className="h-5 w-5" />
      </span>
      <p className="text-sm text-ink-2">Seu profissional ainda não publicou um plano de treino para você.</p>
    </Card>
  );
}
