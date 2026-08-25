import * as React from "react";
import { useNavegacaoAluno } from "@/components/student/navegacaoAluno";
import { MotivoModalidade } from "@/components/student/MotivoModalidade";
import { rotuloObjetivoPar } from "@/lib/gps/objetivos";
import {
  Home,
  Dumbbell,
  TrendingUp,
  User,
  LogOut,
  ChevronRight,
  Clock,
  CheckCircle2,
  Wallet,
  AlertTriangle,
  Sparkles,
  Play,
  Flame,
  MessageCircle,
  CalendarDays,
  Info,
} from "lucide-react";
import { Card, Pill, LinhaDeTokens, TokenRotulado, ParDado } from "@/components/ui/primitives";
import { cn, withBase } from "@/lib/utils";
import { BrandProvider, type Marca } from "@/lib/brand/BrandContext";
import { aplicarPaleta, PALETA_ALUNO, corDeContraste } from "@/lib/theme/palettes";
import { GamificacaoView } from "@/components/student/GamificacaoView";
import { SemanaStrip } from "@/components/student/SemanaStrip";
import { ExercicioSheet } from "@/components/student/ExercicioSheet";
import { TreinoGuiado } from "@/components/student/TreinoGuiado";
import {
  nomeDoBloco,
  tokensDoBloco,
  exercicioDoBloco,
  temFolhaExercicio,
  iconeModalidade,
  modalidadeDoBloco,
  sessaoConcluida,
  modalidadeDaSessao,
  doseCurta,
  tokensExtras,
  minutosDeclarados,
  RegistroBloco,
} from "@/components/student/blocoRegistro";
import { estadoSemaforo } from "@/lib/gps/semaforoDiario";
import { modalidadeImagem } from "@/data/modalities";
import { iniciaisDe, type Aluno, type Avaliacao, type Liberacao } from "@/data/alunos";
import type { Execucao, SessaoFeedback } from "@/data/execucao";
import { formatBRL, statusEfetivo, ROTULO_STATUS_COBRANCA } from "@/data/cobranca";
import { sequenciaDias } from "@/lib/gamificacao";
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
  sessaoDeHojeIndex,
  rotuloFrequencia,
} from "@/data/periodizacao";

// A sessão tem algum bloco com intensidade prescrita? Governa a nota educacional
// única no rodapé do card da Sessão (antes repetida por exercício).
const temIntensidadeNaSessao = (s: Sessao): boolean =>
  s.blocos.some((b) => b.intensidade != null && String(b.intensidade).trim() !== "" && String(b.intensidade).trim() !== "-");

// O rótulo da faixa de PSE de uma sessão, para o estado "Concluída" mostrar o esforço
// registrado ("Esforço: 7 · Intenso"). Rótulos EXATOS de p-rpe; hífen, nunca travessão.
const PSE_ROTULOS: [number, number, string][] = [
  [0, 0, "Repouso"],
  [1, 1, "Muito leve"],
  [2, 3, "Leve"],
  [4, 5, "Moderado"],
  [6, 7, "Intenso"],
  [8, 9, "Muito intenso"],
  [10, 10, "Máximo"],
];
const rotuloPse = (n: number): string => PSE_ROTULOS.find(([a, b]) => n >= a && n <= b)?.[2] ?? "";

/**
 * O nome da semana NA LÍNGUA DO ALUNO. "Carga" e "descarga" são vocabulário de
 * periodização: para quem treina, o que importa é se a semana pede o de sempre, se ela
 * vem mais leve de propósito, ou se é semana de medir. Mesmo espírito do `rotuloAluno`
 * que o produto já usa nos documentos.
 */
const TIPO_SEMANA: Record<Microciclo["tipo"], { label: string; tone: "neutral" | "warning" | "success" }> = {
  carga: { label: "Semana normal", tone: "success" },
  deload: { label: "Semana mais leve", tone: "warning" },
  teste: { label: "Semana de teste", tone: "neutral" },
};

/**
 * Como chamar o profissional numa frase. Normalmente é o primeiro nome da marca
 * ("Ricardo Costa Personal" vira "Ricardo"), mas quando a marca ainda é o rótulo
 * neutro de fallback o primeiro nome sairia "Seu", e a tela dizia "Falar com
 * Seu". Nesse caso a frase usa o substantivo.
 */
const MARCA_NEUTRA = "Seu treino";
const apelidoProfissional = (marca: Marca): string =>
  marca.nome === MARCA_NEUTRA ? "o seu professor" : marca.nome.split(" ")[0];

/** As 4 abas do design do app do aluno: Hoje, Treinos, Progresso, Perfil. */
type Aba = "hoje" | "treinos" | "progresso" | "perfil";
const ABAS: { id: Aba; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "hoje", label: "Hoje", Icon: Home },
  { id: "treinos", label: "Treinos", Icon: Dumbbell },
  { id: "progresso", label: "Progresso", Icon: TrendingUp },
  { id: "perfil", label: "Perfil", Icon: User },
];

/**
 * Portal do aluno: o app com a marca do PROFISSIONAL, onde o aluno vê o próprio
 * treino e a periodização. Componente de apresentação puro, alimentado por
 * (aluno, plano, marca). Serve tanto para a prévia do profissional ("ver como o
 * aluno vê") quanto para a produção, quando o aluno logado carrega os próprios
 * dados via Supabase.
 *
 * A forma segue o mockup do app do aluno: pele navy escura, cabeçalho com o
 * profissional e a saudação, faixa da semana em segmentos, hero do treino de
 * hoje em gradiente com a lista de exercícios logo abaixo, e as 4 abas fixas.
 */
export function StudentApp({
  aluno,
  plano,
  marca,
  avaliacoes = [],
  execucoes = [],
  sessaoFeedbacks = [],
  liberacoes = [],
  onRegistrar,
  onDesfazer,
  onFeedback,
  dataDaPrescricao,
  preview = false,
  onSair,
}: {
  aluno: Aluno;
  plano?: PlanoTreino;
  marca: Marca;
  avaliacoes?: Avaliacao[];
  /** o que o aluno já registrou (para marcar sessões feitas) */
  execucoes?: Execucao[];
  /** como o aluno sentiu cada sessão (PSE + duração + recado); alimenta o estado "Concluída" */
  sessaoFeedbacks?: SessaoFeedback[];
  /** liberações do aluno: alimentam o alerta de "treino em pausa" na aba Hoje */
  liberacoes?: Liberacao[];
  /** registra uma execução; ausente = portal só-leitura */
  onRegistrar?: (e: Execucao) => void;
  /** desfaz uma execução registrada; ausente = sem desfazer */
  onDesfazer?: (execId: string) => void;
  /** grava o feedback da sessão (fim do treino guiado); ausente = sem gravação */
  onFeedback?: (f: SessaoFeedback) => void;
  /** resolve a data de exibição de uma prescrição pela id (selo "Personalizado em …") */
  dataDaPrescricao?: (id: string) => string | undefined;
  preview?: boolean;
  onSair?: () => void;
}) {
  // A navegação vive na URL: ver @/components/student/navegacaoAluno. Antes eram três
  // `useState` e o voltar do navegador (e o gesto do Android) saía do app.
  const nav = useNavegacaoAluno();
  const aba = nav.aba;
  const cor = marca.corPrimaria || "#2064EC";
  const tintaDaMarca = corDeContraste(cor);

  const semanaGuiado = plano ? semanaAtual(plano) : 1;

  // As sessões vêm da URL, não de estado: o id é o que sobrevive ao voltar e ao recarregar.
  // Um id que não existe mais (plano trocado, link velho) simplesmente não resolve, e a
  // tela cai na aba, em vez de quebrar.
  const sessoesDaSemana = React.useMemo(() => {
    if (!plano) return [] as Sessao[];
    const mesos = plano.macrociclo?.mesociclos ?? [];
    return mesos.flatMap((m) => m.microciclos.flatMap((w) => w.sessoes));
  }, [plano]);
  const acharSessao = React.useCallback(
    (id: string | null) => (id ? sessoesDaSemana.find((s) => s.id === id) ?? null : null),
    [sessoesDaSemana],
  );
  const guiado = acharSessao(nav.guiadoId);
  const sessaoAberta = acharSessao(nav.sessaoId);
  const setGuiado = (s: Sessao | null) => (s ? nav.comecarGuiado(s.id) : nav.sairDoGuiado());
  const setSessaoAberta = (s: Sessao | null) => (s ? nav.abrirSessao(s.id) : nav.fecharSessao());
  const feedbackGuiado = guiado
    ? sessaoFeedbacks.find(
        (f) => f.alunoId === aluno.id && f.planoId === plano?.id && f.semana === semanaGuiado && f.sessaoRef === guiado.id,
      )
    : undefined;

  // O portal do aluno tem PELE PRÓPRIA: navy escuro, sempre. Ele não herda a
  // aparência do profissional, porque quem abre esta tela é o aluno, na
  // academia, e o design aprovado desenhou este lado escuro. O que o
  // profissional controla é a COR DE MARCA, que entra como acento sobre o navy.
  // Aplica no container do portal, não na raiz do documento, para não vazar para
  // a prévia que roda dentro do app do profissional.
  const rootRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (rootRef.current) aplicarPaleta(rootRef.current, PALETA_ALUNO, true, marca.corPrimaria);
  }, [marca.corPrimaria]);

  const cobranca = aluno.cobranca;
  const cobrancaPendente = cobranca ? statusEfetivo(cobranca) === "pendente" : false;
  const execucoesDoAluno = execucoes.filter((e) => e.alunoId === aluno.id);
  const streak = sequenciaDias(execucoesDoAluno);

  return (
    <BrandProvider marca={marca}>
      <div ref={rootRef} className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col bg-bg">
        {guiado && plano ? (
          <TreinoGuiado
            sessao={guiado}
            semana={semanaGuiado}
            cor={cor}
            planoId={plano.id}
            alunoId={aluno.id}
            execucoes={execucoes}
            marcaNome={marca.nome}
            streakAtual={streak.atual}
            onRegistrar={onRegistrar}
            onDesfazer={onDesfazer}
            onFeedback={onFeedback}
            feedbackExistente={feedbackGuiado}
            preview={preview}
            onSair={() => setGuiado(null)}
          />
        ) : (
          <>
            {/* A moldura de celular e o chrome do profissional (AlunoPreview) já
                sinalizam que isto é prévia. Uma tarja aqui dentro contradizia o "é
                exatamente o que o aluno vê", já que o aluno real nunca a vê. */}
            <CabecalhoAluno
              aluno={aluno}
              marca={marca}
              cor={cor}
              tinta={tintaDaMarca}
              streak={streak.atual}
              plano={plano}
              execucoes={execucoesDoAluno}
              cobrancaPendente={cobrancaPendente}
              onCobranca={() => nav.irParaAba("perfil")}
              onSair={onSair}
              preview={preview}
            />

            <main className="flex-1 space-y-4 px-4 pb-28 pt-1">
              {/* Sessão aberta pela aba Treinos: a MESMA visão da de hoje (ver a
                  sessão inteira e então começar), em vez de saltar direto para o
                  modo guiado. É o que dá o início, meio e fim consistente. */}
              {sessaoAberta && plano ? (
                <>
                  <button
                    onClick={() => setSessaoAberta(null)}
                    className="-ml-1 inline-flex items-center gap-1 rounded-full px-1 py-1 text-sm font-semibold text-ink-2 hover:text-ink"
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" aria-hidden /> Voltar aos treinos
                  </button>
                  <VisaoSessao
                    sessao={sessaoAberta}
                    plano={plano}
                    semana={semanaGuiado}
                    aluno={aluno}
                    cor={cor}
                    tinta={tintaDaMarca}
                    execucoes={execucoes}
                    sessaoFeedbacks={sessaoFeedbacks}
                    onRegistrar={onRegistrar}
                    onDesfazer={onDesfazer}
                    onIniciar={() => {
                      setGuiado(sessaoAberta);
                      setSessaoAberta(null);
                    }}
                    dataDaPrescricao={dataDaPrescricao}
                    preview={preview}
                  />
                </>
              ) : (
                <>
              {aba === "hoje" && (
                <AbaHoje
                  plano={plano}
                  cor={cor}
                  tinta={tintaDaMarca}
                  aluno={aluno}
                  marca={marca}
                  execucoes={execucoes}
                  sessaoFeedbacks={sessaoFeedbacks}
                  liberacoes={liberacoes}
                  onRegistrar={onRegistrar}
                  onDesfazer={onDesfazer}
                  onIniciar={setGuiado}
                  onAbrir={setSessaoAberta}
                  dataDaPrescricao={dataDaPrescricao}
                  preview={preview}
                />
              )}
              {aba === "treinos" && (
                <AbaTreinos
                  plano={plano}
                  cor={cor}
                  tinta={tintaDaMarca}
                  aluno={aluno}
                  marca={marca}
                  execucoes={execucoes}
                  onIniciar={setSessaoAberta}
                />
              )}
              {aba === "progresso" && (
                <AbaProgresso
                  aluno={aluno}
                  avaliacoes={avaliacoes}
                  execucoes={execucoesDoAluno}
                  feedbacks={sessaoFeedbacks.filter((f) => f.alunoId === aluno.id)}
                  cor={cor}
                />
              )}
              {aba === "perfil" && (
                <AbaPerfil
                  aluno={aluno}
                  marca={marca}
                  cor={cor}
                  tinta={tintaDaMarca}
                  plano={plano}
                  avaliacoes={avaliacoes}
                  onSair={onSair}
                  preview={preview}
                />
              )}
                </>
              )}
            </main>

            {/* Trocar de aba fecha a sessão aberta: sem isso ela continuaria na
                tela por cima da aba escolhida. */}
            <BarraDeAbas
              aba={aba}
              onAba={nav.irParaAba}
              cor={cor}
              tinta={tintaDaMarca}
            />
          </>
        )}
      </div>
    </BrandProvider>
  );
}

/* ------------------------------- Cabeçalho -------------------------------- */

/**
 * Cabeçalho do design: o disco com as iniciais do PROFISSIONAL, o nome dele como
 * sobrenome da tela, a saudação em display e o streak em pílula âmbar. Abaixo, a
 * faixa da semana em segmentos e a linha "Semana N · X dias treinados".
 *
 * Nada aqui é inventado: o streak vem de `sequenciaDias`, a semana vem do plano e
 * a contagem de dias treinados vem das execuções registradas.
 */
function CabecalhoAluno({
  aluno,
  marca,
  cor,
  tinta,
  streak,
  plano,
  execucoes,
  cobrancaPendente,
  onCobranca,
  onSair,
  preview,
}: {
  aluno: Aluno;
  marca: Marca;
  cor: string;
  tinta: string;
  streak: number;
  plano?: PlanoTreino;
  execucoes: Execucao[];
  cobrancaPendente: boolean;
  onCobranca: () => void;
  onSair?: () => void;
  preview?: boolean;
}) {
  const semana = plano ? semanaAtual(plano) : undefined;

  // As SESSÕES da semana corrente e quantas já fecharam. Mesma regra da aba Treinos
  // (`sessaoConcluida`), para as duas telas nunca discordarem sobre o que é treino feito.
  const treinosDaSemana = React.useMemo(() => {
    if (!plano || semana == null) return null;
    const micro = plano.macrociclo.mesociclos.flatMap((m) => m.microciclos).find((mc) => mc.semana === semana);
    const sessoes = micro?.sessoes ?? [];
    if (!sessoes.length) return null;
    return { total: sessoes.length, feitos: sessoes.filter((s) => sessaoConcluida(s, semana, execucoes)).length };
  }, [plano, semana, execucoes]);

  return (
    <header className="px-4 pb-2 pt-4">
      <div className="flex items-center gap-3">
        {marca.logoDataUrl ? (
          // object-CONTAIN sobre papel branco, nunca cover: a logo do
          // profissional costuma ser horizontal (símbolo + nome por extenso), e
          // o cover num quadrado comia as pontas dela.
          <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-control border border-border bg-white p-1">
            <img src={marca.logoDataUrl} alt="" className="max-h-full max-w-full object-contain" />
          </span>
        ) : (
          <span
            className="grid h-11 w-11 shrink-0 place-items-center rounded-control font-display text-sm font-bold"
            style={{ background: cor, color: tinta }}
          >
            {iniciaisDe(marca.nome)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-ink-2">{marca.nome}</p>
          <h1 className="truncate font-display text-2xl font-bold text-ink">Oi, {aluno.nome.split(" ")[0]}!</h1>
        </div>
        {/* Streak só aparece quando existe de verdade: zero dias não vira medalha. */}
        {streak > 0 && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-warning-tint px-2.5 py-1 text-sm font-bold text-warning">
            <Flame className="h-4 w-4" aria-hidden />
            <span className="tabular">{streak}</span>
            <span className="sr-only">dias seguidos de treino</span>
          </span>
        )}
        {onSair && (
          <button
            onClick={onSair}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-ink-2 hover:bg-surface-soft hover:text-ink"
            aria-label={preview ? "Fechar prévia" : "Sair da conta"}
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>

      {cobrancaPendente && (
        <button
          onClick={onCobranca}
          className="mt-3 flex w-full items-center gap-2 rounded-full bg-warning-tint px-3 py-2 text-sm font-bold text-warning"
        >
          <Wallet className="h-4 w-4" /> Mensalidade pendente
          <ChevronRight className="ml-auto h-4 w-4" />
        </button>
      )}

      <p className="mt-1 text-sm text-ink-2">
        {semana && plano ? `Semana ${semana} de ${plano.semanas}` : ""}
        {semana && plano && treinosDaSemana ? " · " : ""}
        {treinosDaSemana
          ? `${treinosDaSemana.feitos} de ${treinosDaSemana.total} ${treinosDaSemana.total === 1 ? "treino concluído" : "treinos concluídos"}`
          : ""}
      </p>
      {/* Trilho do PLANO: uma semana por parada, a atual em destaque. Vem DEPOIS da frase
          que o descreve, para o desenho confirmar o que se acabou de ler. A leitura por
          DIA vive na seção "Seus dias" desta mesma tela e não se repete aqui. */}
      {plano && <TrilhoDeSemanas plano={plano} cor={cor} tinta={tinta} />}
    </header>
  );
}

/**
 * O TRILHO DO PLANO: uma semana por parada, a de hoje em destaque.
 *
 * O número aparece quando cabe (até 8 semanas a 320px de tela); acima disso o trilho vira
 * só segmento, porque número ilegível não é número. Em ambos os casos o rótulo acessível
 * diz a mesma frase por extenso, e a linha logo abaixo do trilho já escreve "Semana N".
 */
function TrilhoDeSemanas({ plano, cor, tinta }: { plano: PlanoTreino; cor: string; tinta: string }) {
  const total = Math.max(1, plano.semanas);
  const atual = Math.min(semanaAtual(plano), total);
  const semanas = Array.from({ length: total }, (_, i) => i + 1);

  // Medidas apertadas contra 320px de tela (288px úteis dentro do px-4 do cabeçalho), e
  // MEDIDAS no navegador, não estimadas: 12 discos de 20px mais 11 fios de 3px dão 273px e
  // cabem; 13 dariam 296px e estouram. Até 10 semanas o disco fica no tamanho maior
  // (10 x 24 + 9 x 3 = 267px); de 11 a 12 ele encolhe; de 13 em diante o trilho quebra.
  const emLinha = total <= 12;
  const grande = total <= 10;
  const classeDisco = grande ? "h-6 w-6 text-2xs" : "h-5 w-5 text-[0.625rem]";

  // O estado de cada semana. Passada: contorno. Atual: sólido MAIS o traço embaixo.
  // O traço existe porque estado não pode depender só de cor (regra do Design System),
  // e porque num trilho de 12 paradas a atual precisa saltar sem precisar comparar tons.
  const disco = (n: number) => (
    <span className="relative flex shrink-0 flex-col items-center">
      <span
        aria-hidden
        className={cn(
          "tabular grid shrink-0 place-items-center rounded-full font-bold leading-none",
          classeDisco,
          n > atual && "bg-surface-mute text-ink-3",
        )}
        style={
          n === atual
            ? { background: cor, color: tinta }
            : n < atual
              ? { boxShadow: `inset 0 0 0 1.5px ${cor}`, color: cor }
              : undefined
        }
      >
        {n}
      </span>
      {n === atual && (
        <span aria-hidden className="mt-1 h-0.5 w-4 rounded-full" style={{ background: cor }} />
      )}
    </span>
  );

  const rotulo = `Semana ${atual} de ${total} do plano.`;

  // Plano longo: sem o fio, em linhas que quebram. O número é o que não se abre mão.
  if (!emLinha) {
    return (
      <div className="mt-3 flex flex-wrap gap-1" role="img" aria-label={rotulo}>
        {semanas.map((n) => (
          <React.Fragment key={n}>{disco(n)}</React.Fragment>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-3 flex items-center" role="img" aria-label={rotulo}>
      {semanas.map((n, i) => (
        <React.Fragment key={n}>
          {i > 0 && (
            <span
              aria-hidden
              className="h-0.5 min-w-[3px] flex-1 bg-surface-mute"
              style={n <= atual ? { background: cor, opacity: 0.55 } : undefined}
            />
          )}
          {disco(n)}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ------------------------------ Barra de abas ----------------------------- */

/** As 4 abas fixas do design. O ativo mostra FORMA (pílula tintada), não só cor,
 *  como o Design System exige para estado nunca depender de cor sozinha. */
function BarraDeAbas({
  aba,
  onAba,
  cor,
  tinta,
}: {
  aba: Aba;
  onAba: (a: Aba) => void;
  cor: string;
  tinta: string;
}) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-md gap-1 border-t border-border bg-surface/95 px-2 pb-[env(safe-area-inset-bottom)] pt-1.5 backdrop-blur"
      aria-label="Navegação do app"
    >
      {ABAS.map(({ id, label, Icon }) => {
        const ativo = aba === id;
        return (
          <button
            key={id}
            onClick={() => onAba(id)}
            aria-current={ativo ? "page" : undefined}
            className={cn(
              "flex min-h-[52px] flex-1 flex-col items-center justify-center gap-1 rounded-full py-1.5 text-2xs font-semibold leading-none transition-colors",
              !ativo && "text-ink-2",
            )}
            style={ativo ? { background: cor, color: tinta } : undefined}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/* ------------------------------- Aba: Hoje -------------------------------- */

function AbaHoje({
  plano,
  cor,
  tinta,
  aluno,
  marca,
  execucoes,
  sessaoFeedbacks,
  liberacoes,
  onRegistrar,
  onDesfazer,
  onIniciar,
  onAbrir,
  dataDaPrescricao,
  preview,
}: {
  plano?: PlanoTreino;
  cor: string;
  tinta: string;
  aluno: Aluno;
  marca: Marca;
  execucoes: Execucao[];
  sessaoFeedbacks: SessaoFeedback[];
  liberacoes: Liberacao[];
  onRegistrar?: (e: Execucao) => void;
  onDesfazer?: (execId: string) => void;
  /** inicia o modo guiado para uma sessão (abre o treino guiado no lugar das abas) */
  onIniciar?: (sessao: Sessao) => void;
  /** abre a visão de OUTRA sessão da semana (mesma tela da de hoje, não o guiado) */
  onAbrir?: (sessao: Sessao) => void;
  dataDaPrescricao?: (id: string) => string | undefined;
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
        <FalarComProfessor marca={marca} cor={cor} />
      </div>
    );

  const semana = semanaAtual(plano);
  const micro = plano.macrociclo.mesociclos.flatMap((m) => m.microciclos).find((mc) => mc.semana === semana);
  const sessoes = micro?.sessoes ?? [];
  // "Hoje" = a primeira sessão ainda não concluída; se todas foram feitas, a
  // primeira da semana. Helper compartilhado com o "personalizar o treino do
  // dia" do profissional, para os dois nunca mirarem sessões diferentes.
  const idxHoje = sessaoDeHojeIndex(plano, execucoes);
  const sessaoHoje = sessoes[idxHoje];
  const outras = sessoes.filter((_, i) => i !== idxHoje);

  return (
    <div className="space-y-4">
      {alerta}

      {sessaoHoje ? (
        <VisaoSessao
          sessao={sessaoHoje}
          plano={plano}
          semana={semana}
          aluno={aluno}
          cor={cor}
          tinta={tinta}
          execucoes={execucoes}
          sessaoFeedbacks={sessaoFeedbacks}
          onRegistrar={onRegistrar}
          onDesfazer={onDesfazer}
          onIniciar={onIniciar ? () => onIniciar(sessaoHoje) : undefined}
          dataDaPrescricao={dataDaPrescricao}
          preview={preview}
        />
      ) : (
        <Card className="p-6 text-center text-sm text-ink-2">Sem sessões nesta semana.</Card>
      )}

      {/* O par de portas do rodapé da sessão: a orientação escrita e o canal com o
          professor. Substitui o parágrafo solto que ficava no meio da lista e o cartão de
          contato de largura inteira. */}
      <PortasDaSessao
        fecho={sessaoHoje?.fecho}
        notaIntensidade={
          sessaoHoje && temIntensidadeNaSessao(sessaoHoje)
            ? "Intensidade é a porcentagem da sua carga máxima estimada para cada exercício."
            : undefined
        }
        marca={marca}
        cor={cor}
      />

      {/* A semana e o que vem depois ficam abaixo da dobra: o topo pertence ao
          treino de hoje. */}
      {outras.length > 0 && (
        <section>
          <h2 className="mb-2 text-2xs font-bold uppercase tracking-wider text-analysis-text">Próximos treinos</h2>
          <div className="space-y-2">
            {outras.map((s) => (
              <LinhaSessao
                key={s.id}
                sessao={s}
                ordem={sessoes.findIndex((x) => x.id === s.id) + 1}
                concluida={sessaoConcluida(s, semana, execucoes)}
                cor={cor}
                onIniciar={onAbrir ? () => onAbrir(s) : undefined}
              />
            ))}
          </div>
        </section>
      )}

      <Card className="p-4">
        <h2 className="mb-2.5 text-2xs font-bold uppercase tracking-wider text-analysis-text">Sua semana</h2>
        <SemanaStrip alunoId={aluno.id} execucoes={execucoes} liberacoes={liberacoes} cor={cor} />
      </Card>
    </div>
  );
}

/**
 * A VISÃO DE UMA SESSÃO: o hero com "Começar treino" + a lista de exercícios (+
 * o fecho, quando já concluída).
 *
 * Existe para que TODA sessão abra do mesmo jeito. Antes, a de hoje mostrava a
 * lista e as outras pulavam direto para o modo guiado — o mesmo objeto tinha
 * duas aberturas diferentes, e foi o que o Herivaldo leu como "a aba do aluno
 * não segue início, meio e fim". Agora o caminho é sempre: ver a sessão inteira
 * (início) → Começar treino, um exercício por vez (meio) → conclusão (fim).
 */
function VisaoSessao({
  sessao,
  plano,
  semana,
  aluno,
  cor,
  tinta,
  execucoes,
  sessaoFeedbacks,
  onRegistrar,
  onDesfazer,
  onIniciar,
  dataDaPrescricao,
  preview,
}: {
  sessao: Sessao;
  plano: PlanoTreino;
  semana: number;
  aluno: Aluno;
  cor: string;
  tinta: string;
  execucoes: Execucao[];
  sessaoFeedbacks: SessaoFeedback[];
  onRegistrar?: (e: Execucao) => void;
  onDesfazer?: (execId: string) => void;
  onIniciar?: () => void;
  dataDaPrescricao?: (id: string) => string | undefined;
  preview?: boolean;
}) {
  const concluida = sessaoConcluida(sessao, semana, execucoes);
  return (
    <>
      <HeroTreinoDeHoje
        sessao={sessao}
        plano={plano}
        cor={cor}
        concluida={concluida}
        semana={semana}
        execucoes={execucoes}
        dataDaPrescricao={dataDaPrescricao}
        onIniciar={onIniciar}
      />
      {/* A lista começava colada no cartão de hoje, sem nome. O título separa as duas
          coisas e dá ao olho onde voltar depois de rolar. */}
      <h2 className="pt-1 text-2xs font-bold uppercase tracking-wider text-analysis-text">Sua sessão</h2>
      <ListaExerciciosDoDia
        sessao={sessao}
        semana={semana}
        plano={plano}
        aluno={aluno}
        cor={cor}
        tinta={tinta}
        execucoes={execucoes}
        onRegistrar={onRegistrar}
        onDesfazer={onDesfazer}
        preview={preview}
      />
      {concluida && (
        <ConcluidaHoje
          feedback={sessaoFeedbacks.find(
            (f) => f.alunoId === aluno.id && f.planoId === plano.id && f.semana === semana && f.sessaoRef === sessao.id,
          )}
          cor={cor}
        />
      )}
    </>
  );
}

/**
 * O HERO do treino de hoje: card em gradiente da marca, com o rótulo, o nome da
 * sessão, três números e o botão claro de começar. É a única superfície com
 * gradiente do app do aluno, exatamente como o design reserva.
 */
/**
 * A forma CURTA do rótulo de fase, para a pílula do cartão de hoje.
 *
 * Mesociclo nascido de fase da jornada traz "Fase N: nome longo"; o prefixo já é o
 * identificador e cabe na pílula. Bloco genérico não tem prefixo (rotuloMeso o remove de
 * propósito, porque a palavra "Fase" ali não seria verdadeira) e vai inteiro.
 */
function faseCurta(rotulo: string): string {
  return rotulo.match(/^(Fase \d+)\s*:/)?.[1] ?? rotulo;
}

function HeroTreinoDeHoje({
  sessao,
  plano,
  cor,
  concluida,
  semana,
  execucoes,
  dataDaPrescricao,
  onIniciar,
}: {
  sessao: Sessao;
  plano: PlanoTreino;
  cor: string;
  concluida: boolean;
  /** semana e execuções: sem elas não dá para dizer QUANTOS já foram feitos */
  semana: number;
  execucoes: Execucao[];
  dataDaPrescricao?: (id: string) => string | undefined;
  onIniciar?: () => void;
}) {
  const nExercicios = sessao.blocos.length;
  const nFeitos = sessao.blocos.filter((b) =>
    execucoes.some((e) => e.semana === semana && e.blocoRef === b.id),
  ).length;
  const pctFeito = nExercicios ? Math.round((nFeitos / nExercicios) * 100) : 0;
  // Minutos DECLARADOS (soma do alvo aeróbio). Sem aeróbio com alvo, não há
  // minuto nenhum a mostrar: somar tempo de musculação seria número inventado.
  const minutos = minutosDeclarados(sessao);
  const origemIds = Array.from(new Set(sessao.blocos.map((b) => b.origemPrescricaoId).filter(Boolean) as string[]));
  const personalizadoData = origemIds.length === 1 ? dataDaPrescricao?.(origemIds[0]) : undefined;
  const meso = mesocicloAtual(plano);

  return (
    <div
      className="relative isolate overflow-hidden rounded-card p-5 text-white"
      style={{ backgroundImage: `linear-gradient(135deg, ${cor} 0%, var(--brand-turquesa) 100%)` }}
    >
      {/* Brilho e figura do equipamento: decoração, atrás de tudo e sem alcançar o texto.
          O conteúdo reserva a faixa da figura com o padding à direita do cabeçalho. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-14 -z-10 h-56 w-56 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 68%)" }}
      />
      <MotivoModalidade
        modalidade={modalidadeDaSessao(sessao)}
        className="pointer-events-none absolute -right-3 -top-3 -z-10 h-44 w-44 text-white/30"
      />

{/* Todo o bloco superior reserva a faixa da figura, não só o cabeçalho. */}
      <div className="pr-24">
        <div className="text-2xs font-bold uppercase tracking-wider text-white/80">
          {concluida ? "Treino de hoje · feito" : "Treino de hoje"}
        </div>
        <h2 className="mt-0.5 font-display text-2xl font-bold leading-tight">{sessao.nome}</h2>
        {sessao.foco && <p className="mt-1 text-sm text-white/85">{sessao.foco}</p>}
      </div>

      {/* A linha dos FATOS da sessão: quanto tem, quanto dura, e em que fase do plano ela
          cai. A fase é fato como os outros e não precisa de linha própria. */}
      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm text-white/90">
        <span>
          <span className="tabular font-bold">{nExercicios}</span> {nExercicios === 1 ? "exercício" : "exercícios"}
        </span>
        {minutos ? (
          <>
            <span aria-hidden>·</span>
            <span>
              <span className="tabular font-bold">{minutos}</span> min
            </span>
          </>
        ) : null}
        {personalizadoData && (
          <>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" aria-hidden /> feito pra você {personalizadoData}
            </span>
          </>
        )}
        {/* A fase na forma CURTA. O nome inteiro tem linha própria na aba Treinos; aqui
            inteiro ele viraria o elemento mais pesado de um cartão cujo assunto é o
            treino de hoje. */}
        {meso && (
          <span
            className="rounded-full bg-white/20 px-2.5 py-0.5 text-2xs font-bold uppercase tracking-wider"
            title={rotuloMeso(meso)}
          >
            {faseCurta(rotuloMeso(meso))}
          </span>
        )}
      </div>

      {/* QUANTOS JÁ FORAM E QUANTOS FALTAM, dito de uma vez. A barra é a mesma
          informação em forma, para responder de relance no meio do treino. */}
      {nExercicios > 0 && (
        <div className="mt-2">
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span className="font-semibold">
              <span className="tabular">{nFeitos}</span> de <span className="tabular">{nExercicios}</span> feitos
            </span>
            {nFeitos > 0 && nFeitos < nExercicios && (
              <span className="text-xs text-white/80">
                {nExercicios - nFeitos} {nExercicios - nFeitos === 1 ? "restante" : "restantes"}
              </span>
            )}
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/25">
            <div
              className="h-full rounded-full bg-white transition-[width] duration-500"
              style={{ width: `${pctFeito}%` }}
            />
          </div>
        </div>
      )}

      {onIniciar && (
        <button
          onClick={onIniciar}
          className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white text-base font-bold shadow-lg shadow-black/10"
          style={{ color: "#17202E" }}
        >
          {concluida ? (
            <>
              <CheckCircle2 className="h-5 w-5" aria-hidden /> Revisar o treino
            </>
          ) : (
            <>
              <Play className="h-5 w-5" aria-hidden /> Começar treino
            </>
          )}
        </button>
      )}
    </div>
  );
}

/**
 * Lista de exercícios do dia: linha fechada com estado, ordem, foto, nome, dose e
 * o número da ordem à direita (feito = disco cheio na cor da marca). Tocar abre
 * a folha do exercício; o registro fica dentro do bloco expandido.
 */
function ListaExerciciosDoDia({
  sessao,
  semana,
  plano,
  aluno,
  cor,
  tinta,
  execucoes,
  onRegistrar,
  onDesfazer,
  preview,
}: {
  sessao: Sessao;
  semana: number;
  plano: PlanoTreino;
  aluno: Aluno;
  cor: string;
  tinta: string;
  execucoes: Execucao[];
  onRegistrar?: (e: Execucao) => void;
  onDesfazer?: (execId: string) => void;
  preview?: boolean;
}) {
  return (
    <div className="space-y-2">
      {agruparBlocosPorMetodo(sessao.blocos).map((seg) => {
        const ordemDe = (b: BlocoSessao) => sessao.blocos.findIndex((x) => x.id === b.id) + 1;
        const linha = (b: BlocoSessao, emGrupo?: boolean) => (
          <BlocoRow
            key={b.id}
            bloco={b}
            ordem={ordemDe(b)}
            cor={cor}
            tinta={tinta}
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
          const info = getMetodo(seg.metodo);
          return (
            <div key={seg.grupoId} className="rounded-card border-2 p-1.5" style={{ borderColor: cor }}>
              <div className="mb-1 flex flex-wrap items-center gap-2 px-1.5 pt-0.5">
                <span className="rounded-full px-2 py-0.5 text-2xs font-bold" style={{ background: cor, color: tinta }}>
                  {info?.nome}
                </span>
                {info?.descricao && <span className="min-w-0 flex-1 text-2xs leading-tight text-ink-2">{info.descricao}</span>}
              </div>
              <div className="space-y-2">{seg.blocos.map((b) => linha(b, true))}</div>
            </div>
          );
        }
        return linha(seg.bloco);
      })}

      {preview && <p className="px-1 text-xs text-ink-2">Aqui o seu aluno registra carga, repetições e esforço.</p>}
    </div>
  );
}

/**
 * O par de portas do rodapé da sessão: a orientação escrita e o canal com o professor.
 *
 * As duas eram tratadas de formas diferentes, e nenhuma delas certa. A orientação era um
 * parágrafo solto no meio da lista, que empurra tudo para baixo e ninguém lê no meio do
 * treino; o contato era um cartão de largura inteira para uma ação só. Lado a lado, cada
 * uma cabe numa linha, e o texto longo só aparece quando o aluno pede.
 */
function PortasDaSessao({
  fecho,
  notaIntensidade,
  marca,
  cor,
}: {
  fecho?: string;
  notaIntensidade?: string;
  marca: Marca;
  cor: string;
}) {
  const [orientacaoAberta, setOrientacaoAberta] = React.useState(false);
  const temOrientacao = !!fecho || !!notaIntensidade;
  const primeiro = apelidoProfissional(marca);
  const digitos = (marca.telefone ?? "").replace(/\D/g, "");
  const numero = digitos.length >= 10 ? (digitos.startsWith("55") ? digitos : `55${digitos}`) : "";
  const texto = encodeURIComponent(`Oi, ${primeiro}! Falando pelo meu app de treino.`);

  if (!temOrientacao && !numero) return null;

  const molde =
    "flex min-h-[60px] w-full items-center gap-2.5 rounded-card border border-border bg-surface p-3 text-left transition-colors hover:bg-surface-soft";
  const selo = (Icone: typeof MessageCircle) => (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-surface-soft" style={{ color: cor }}>
      <Icone className="h-4 w-4" aria-hidden />
    </span>
  );

  return (
    <div className="space-y-2">
      <div className="space-y-2">
        {temOrientacao && (
          <button
            type="button"
            onClick={() => setOrientacaoAberta((v) => !v)}
            aria-expanded={orientacaoAberta}
            className={molde}
          >
            {selo(Info)}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-ink">Orientações da sessão</span>
              <span className="block truncate text-2xs text-ink-2">Diretrizes e informações</span>
            </span>
            <ChevronRight
              className={cn("h-4 w-4 shrink-0 text-ink-3 transition-transform", orientacaoAberta && "rotate-90")}
              aria-hidden
            />
          </button>
        )}
        {/* Colado no botão que o abre: painel que flutua longe do gatilho faz o leitor
            conferir de onde aquele texto saiu. */}
        {orientacaoAberta && (
          <div
            className="rounded-card border border-border bg-surface-soft p-3.5"
            style={{ borderLeftColor: cor, borderLeftWidth: 3 }}
          >
            {fecho && <p className="text-sm leading-relaxed text-ink-2">{fecho}</p>}
            {notaIntensidade && (
              <p className={cn("text-sm leading-relaxed text-ink-2", fecho && "mt-3")}>{notaIntensidade}</p>
            )}
          </div>
        )}
        {/* A APARÊNCIA ACOMPANHA A DISPONIBILIDADE: sem telefone cadastrado não existe porta
            nenhuma aqui, em vez de um cartão que não faz nada ao ser tocado. */}
        {numero && (
          <a
            href={`https://wa.me/${numero}?text=${texto}`}
            target="_blank"
            rel="noopener noreferrer"
            className={molde}
          >
            {selo(MessageCircle)}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-ink">Falar com {primeiro}</span>
              <span className="block truncate text-2xs text-ink-2">Tire dúvidas e receba apoio</span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-ink-3" aria-hidden />
          </a>
        )}
      </div>
    </div>
  );
}

/** Sessão da semana que não é a de hoje: linha compacta com letra, nome, dose e
 *  a seta. Espelha o card A/B/C da aba Treinos do mockup. */
function LinhaSessao({
  sessao,
  ordem,
  concluida,
  cor,
  onIniciar,
}: {
  sessao: Sessao;
  /** posição da sessão na semana, usada quando o nome não traz letra */
  ordem: number;
  concluida: boolean;
  cor: string;
  onIniciar?: () => void;
}) {
  const nExercicios = sessao.blocos.length;
  const letra = selo(sessao, ordem);
  return (
    <button
      onClick={onIniciar}
      disabled={!onIniciar}
      className="flex w-full items-center gap-3 rounded-card border border-border bg-surface p-3 text-left disabled:cursor-default"
    >
      <span
        className="grid h-11 w-11 shrink-0 place-items-center rounded-control font-display text-base font-bold"
        style={concluida ? { background: cor, color: corDeContraste(cor) } : { boxShadow: `inset 0 0 0 1.5px ${cor}`, color: cor }}
      >
        {concluida ? <CheckCircle2 className="h-5 w-5" /> : letra}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold text-ink">{sessao.nome}</span>
        <span className="block truncate text-xs text-ink-2">
          {sessao.foco ? `${sessao.foco} · ` : ""}
          {nExercicios} {nExercicios === 1 ? "exercício" : "exercícios"}
          {minutosDeclarados(sessao) ? ` · ${minutosDeclarados(sessao)} min` : ""}
          {concluida ? " · concluído" : ""}
        </span>
      </span>
      {onIniciar && <ChevronRight className="h-5 w-5 shrink-0 text-ink-2" aria-hidden />}
    </button>
  );
}

/** Depois do treino feito: o esforço que o aluno registrou e o recado enviado. */
function ConcluidaHoje({ feedback, cor }: { feedback?: SessaoFeedback; cor: string }) {
  if (!feedback) return null;
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: cor }} aria-hidden />
        <span className="font-display font-bold text-ink">Treino concluído</span>
      </div>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm text-ink-2">
        {feedback.pse != null && (
          <ParDado layout="inline" label="Seu esforço" value={`${feedback.pse}${rotuloPse(feedback.pse) ? ` · ${rotuloPse(feedback.pse)}` : ""}`} />
        )}
        {feedback.duracaoMin != null && <ParDado layout="inline" label="Duração" value={`${feedback.duracaoMin} min`} />}
        {feedback.observacao && (
          <p className="w-full text-xs text-ink-2">Recado registrado. Seu professor vê no próximo acesso.</p>
        )}
      </div>
    </Card>
  );
}

/**
 * "Falar com o {professor}".
 *
 * A APARÊNCIA ACOMPANHA A DISPONIBILIDADE. Antes isto era um `<div>` sem ação nenhuma
 * com cara de cartão tocável, e o Filipe reportou exatamente isso: clicou e não aconteceu
 * nada. Agora, com telefone cadastrado, é um link de verdade para o WhatsApp, com seta.
 * Sem telefone, some a seta e some o realce: vira linha de informação, que é o que ele é.
 */
function FalarComProfessor({ marca, cor }: { marca: Marca; cor: string }) {
  const primeiro = apelidoProfissional(marca);
  // Só dígitos: o número pode vir com máscara do perfil ("(61) 99999-0000").
  const digitos = (marca.telefone ?? "").replace(/\D/g, "");
  // O wa.me exige o país. Número brasileiro sem o 55 não abre conversa nenhuma.
  const numero = digitos.length >= 10 ? (digitos.startsWith("55") ? digitos : `55${digitos}`) : "";
  const texto = encodeURIComponent(`Oi, ${primeiro}! Falando pelo meu app de treino.`);

  const miolo = (
    <>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-control bg-surface-soft" style={{ color: cor }}>
        <MessageCircle className="h-5 w-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1 text-left">
        <div className="truncate font-semibold text-ink">Falar com {primeiro}</div>
        <div className="text-xs text-ink-2">
          {numero
            ? "Tire dúvidas, peça ajustes e mantenha seu treino no caminho certo."
            : "Ao terminar o treino você registra o esforço e manda um recado."}
        </div>
      </div>
    </>
  );

  if (!numero) {
    return <div className="flex items-center gap-3 rounded-card border border-border bg-surface p-3.5">{miolo}</div>;
  }

  return (
    <a
      href={`https://wa.me/${numero}?text=${texto}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex min-h-[56px] items-center gap-3 rounded-card border border-border bg-surface p-3.5 transition-colors hover:bg-surface-soft"
    >
      {miolo}
      <ChevronRight className="h-5 w-5 shrink-0 text-ink-3" aria-hidden />
    </a>
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
          Seu treino está em pausa desde {dd} por orientação do seu professor. Fale com ele antes da próxima sessão.
        </p>
      </div>
    </div>
  );
}

function BlocoRow({
  bloco,
  ordem,
  cor,
  tinta,
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
  /** posição do exercício na sessão (o número do círculo à direita) */
  ordem: number;
  cor: string;
  tinta: string;
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
  const tokensDose = tokensDoBloco(bloco);
  const metodo = getMetodo(bloco.metodo);
  const metodoVisivel = metodo && metodo.id !== "tradicional" && !emGrupo ? metodo : undefined;

  const ex = exercicioDoBloco(bloco);
  const temFolha = !aerobio && temFolhaExercicio(ex);
  const [sheetAberto, setSheetAberto] = React.useState(false);
  const [thumbOk, setThumbOk] = React.useState(true);
  const gatilhoRef = React.useRef<HTMLButtonElement>(null);
  const fecharSheet = () => {
    setSheetAberto(false);
    gatilhoRef.current?.focus();
  };
  const modalidade = aerobio ? modalidadeDoBloco(bloco) : undefined;
  const [modImgOk, setModImgOk] = React.useState(true);
  const IconeAerobio = iconeModalidade(bloco.modalidade, modalidade?.ambiente);

  // Miniatura 48px: foto real do exercício, foto da modalidade no
  // aeróbio, ou o selo de ícone quando não há imagem (nunca empresta a foto de
  // outro exercício).
  const leading =
    !aerobio && ex?.imagem && thumbOk ? (
      <img
        src={withBase(ex.imagem)}
        alt=""
        loading="lazy"
        onError={() => setThumbOk(false)}
        className="h-12 w-12 shrink-0 rounded-control border border-border object-cover"
      />
    ) : aerobio && modalidade && modImgOk ? (
      <img
        src={withBase(modalidadeImagem(modalidade.id))}
        alt=""
        loading="lazy"
        onError={() => setModImgOk(false)}
        className="h-12 w-12 shrink-0 rounded-control border border-border object-cover"
      />
    ) : (
      <span
        className="grid h-12 w-12 shrink-0 place-items-center rounded-control bg-surface-soft"
        style={{ color: cor }}
      >
        {aerobio ? <IconeAerobio className="h-6 w-6" /> : <Dumbbell className="h-6 w-6" />}
      </span>
    );

  const feito = !!execFeita;
  const dose = doseCurta(bloco);
  // Fechada por padrão. Quem já registrou não precisa reabrir; quem vai registrar
  // toca uma vez. O padrão serve à leitura da lista, que é para o que ela existe.
  const [aberto, setAberto] = React.useState(false);
  const extras = tokensExtras(bloco);
  // A pílula de intensidade preenche a LACUNA da linha fechada, não duplica o que ela já
  // diz. Bloco de força com RIR já carrega o esforço por extenso ("pare com 3 repetições de
  // sobra"), e ali a pílula só roubaria largura de uma linha que já trunca. Onde a dose é
  // curta e não fala de esforço (aeróbio, isométrico, força sem RIR), ela é o dado que
  // falta: "20 min · contínuo" não diz se é leve ou pesado.
  const intensidadeCrua = bloco.rirAlvo == null ? (bloco.intensidade ?? "").trim() : "";
  // A CABEÇA da frase é o rótulo ("Moderada: cerca de 64 a 76% da FCmáx..." vira
  // "Moderada"). Cabeça que não cabe numa pílula não vira pílula nenhuma.
  const rotuloIntensidade = intensidadeCrua.split(":")[0].trim();
  const intensidade =
    rotuloIntensidade && rotuloIntensidade !== "-" && rotuloIntensidade.length <= 16
      ? rotuloIntensidade.charAt(0).toUpperCase() + rotuloIntensidade.slice(1)
      : undefined;

  return (
    <div className="overflow-hidden rounded-card border border-border bg-surface">
      {/* A LINHA FECHADA. Estado e ordem à esquerda (o disco responde "este já foi?"
          sem precisar abrir nada), nome e dose no meio, seta à direita. */}
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        className="flex min-h-[64px] w-full items-center gap-3 p-3 text-left transition-colors hover:bg-surface-soft"
      >
        <span
          aria-hidden
          className="tabular grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold"
          style={feito ? { background: cor, color: tinta } : { boxShadow: `inset 0 0 0 1.5px ${cor}`, color: cor }}
        >
          {feito ? <CheckCircle2 className="h-4 w-4" /> : ordem}
        </span>
        {leading}
        <span className="min-w-0 flex-1">
          <span className={cn("block truncate font-semibold", feito ? "text-ink-2" : "text-ink")}>
            {nomeDoBloco(bloco)}
          </span>
          {dose && <span className="tabular block truncate text-xs text-ink-2">{dose}</span>}
          {feito && (
            <span className="block text-2xs font-bold uppercase tracking-wider" style={{ color: cor }}>
              Feito
            </span>
          )}
        </span>
        {/* A intensidade é o terceiro fato da dose, ao lado de série e repetição, e decide
            COMO fazer. Fechar a linha não pode escondê-la: sem ela, "3 x 15" não diz se é
            leve ou pesado, e o aluno teria de abrir só para descobrir. */}
        {intensidade && (
          <span
            title={intensidadeCrua}
            className="shrink-0 rounded-full bg-surface-soft px-2 py-0.5 text-2xs font-semibold text-ink-2"
          >
            {intensidade}
          </span>
        )}
        <ChevronRight
          className={cn("h-5 w-5 shrink-0 text-ink-3 transition-transform", aberto && "rotate-90")}
          aria-hidden
        />
      </button>

      {aberto && (
        <div className="border-t border-border p-3">
          {metodoVisivel && (
            <span
              className="inline-block rounded-full px-2 py-0.5 text-2xs font-bold"
              style={{ background: cor, color: tinta }}
            >
              {metodoVisivel.nome}
            </span>
          )}
          {/* Só o que a linha curta NÃO disse (tipicamente a Intensidade). Repetir a
              dose inteira logo abaixo do resumo é ruído, não informação. */}
          {extras.length > 0 && (
            <LinhaDeTokens className={metodoVisivel ? "mt-2" : undefined}>
              {extras.map((t) => (
                <TokenRotulado key={t.label} label={t.label} value={t.value} />
              ))}
            </LinhaDeTokens>
          )}
          {metodoVisivel && (
            <p className="mt-1.5 text-xs font-medium text-ink-2">Como fazer: {metodoVisivel.descricao}</p>
          )}
          {bloco.observacao && <p className="mt-1 text-xs text-ink-2">{bloco.observacao}</p>}

          {/* A folha do exercício era alcançada tocando o nome, gesto que agora é o de
              abrir a linha. Aqui ela vira porta declarada, com nome em vez de adivinhação. */}
          {temFolha && (
            <button
              ref={gatilhoRef}
              type="button"
              onClick={() => setSheetAberto(true)}
              aria-haspopup="dialog"
              className="mt-2.5 inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-border px-4 text-sm font-semibold text-ink transition-colors hover:bg-surface-soft"
            >
              <Sparkles className="h-4 w-4" aria-hidden style={{ color: cor }} />
              Como executar
            </button>
          )}

          <RegistroBloco
            bloco={bloco}
            cor={cor}
            semana={semana}
            planoId={planoId}
            alunoId={alunoId}
            sessaoRef={sessaoRef}
            execFeita={execFeita}
            onRegistrar={onRegistrar}
            onDesfazer={onDesfazer}
            preview={preview}
          />
        </div>
      )}

      {sheetAberto && ex && (
        <ExercicioSheet
          exercicioSlug={ex.slug}
          nome={nomeDoBloco(bloco)}
          tokens={tokensDose}
          cor={cor}
          onClose={fecharSheet}
        />
      )}
    </div>
  );
}

/* ------------------------------ Aba: Treinos ------------------------------ */

/**
 * "Seus treinos": o plano da semana, as fases como trilho e as sessões A/B/C,
 * exatamente na leitura do mockup. Substitui a antiga aba "Semana", que abria
 * num seletor de semana antes de dizer o que o aluno treina.
 */
function AbaTreinos({
  plano,
  cor,
  tinta,
  aluno,
  marca,
  execucoes,
  onIniciar,
}: {
  plano?: PlanoTreino;
  cor: string;
  tinta: string;
  aluno: Aluno;
  marca: Marca;
  execucoes: Execucao[];
  onIniciar?: (s: Sessao) => void;
}) {
  if (!plano) return <SemPlano />;

  const semana = semanaAtual(plano);
  const meso = mesocicloAtual(plano);
  const micro = plano.macrociclo.mesociclos.flatMap((m) => m.microciclos).find((mc) => mc.semana === semana);
  const sessoes = micro?.sessoes ?? [];
  const idxHoje = sessaoDeHojeIndex(plano, execucoes);
  const concluidasNaSemana = sessoes.filter((s) => sessaoConcluida(s, semana, execucoes)).length;
  const semanaFechada = sessoes.length > 0 && concluidasNaSemana === sessoes.length;
  // Próxima fase, para a nota do fim da semana. Só existe se houver mesociclo
  // depois do atual; sem isso, a frase não aparece (nada de fase inventada).
  const mesos = plano.macrociclo.mesociclos;
  const idxMeso = meso ? mesos.findIndex((m) => m.id === meso.id) : -1;
  const proxMeso = idxMeso >= 0 ? mesos[idxMeso + 1] : undefined;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-bold text-ink">Seus treinos</h2>
        <p className="mt-0.5 text-sm text-ink-2">
          Plano de {plano.semanas} {plano.semanas === 1 ? "semana" : "semanas"} · semana {semana}
        </p>
      </div>

      {/* Trilho de fases: a POSIÇÃO em cada parada, a atual em sólido, as passadas em
          contorno. O nome por extenso vem embaixo, porque é lá que ele cabe. */}
      <div>
        <div className="flex gap-1.5">
          {mesos.map((m, i) => {
            const atual = semana >= m.semanaInicio && semana <= m.semanaFim;
            const passada = semana > m.semanaFim;
            return (
              <span
                key={m.id}
                title={rotuloMeso(m)}
                aria-label={`${rotuloMeso(m)}, semanas ${m.semanaInicio} a ${m.semanaFim}${atual ? " (a atual)" : ""}`}
                className={cn(
                  "tabular min-w-0 flex-1 rounded-full py-1.5 text-center text-2xs font-bold",
                  !atual && !passada && "bg-surface-soft text-ink-2",
                )}
                style={
                  atual
                    ? { background: cor, color: tinta }
                    : passada
                      ? { boxShadow: `inset 0 0 0 1.5px ${cor}`, color: cor }
                      : undefined
                }
              >
                {i + 1}
              </span>
            );
          })}
        </div>
        {meso && <p className="mt-1.5 text-sm font-semibold text-ink">{rotuloMeso(meso)}</p>}
      </div>

      {micro && (
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone={TIPO_SEMANA[micro.tipo].tone}>{TIPO_SEMANA[micro.tipo].label}</Pill>
        </div>
      )}

      {sessoes.length === 0 ? (
        <Card className="p-6 text-center text-sm text-ink-2">Sem sessões nesta semana.</Card>
      ) : (
        <div className="space-y-2">
          {sessoes.map((s, i) => (
            <CardSessaoPlano
              key={s.id}
              sessao={s}
              ordem={i + 1}
              cor={cor}
              tinta={tinta}
              hoje={i === idxHoje}
              concluida={sessaoConcluida(s, semana, execucoes)}
              onIniciar={onIniciar ? () => onIniciar(s) : undefined}
            />
          ))}
        </div>
      )}

      {semanaFechada && (
        <div className="rounded-card border border-border bg-surface-soft p-4">
          <p className="text-sm text-ink-2">
            Semana {semana} concluída. {apelidoProfissional(marca)} revisa o seu registro
            {proxMeso ? ` e libera a fase ${rotuloMeso(proxMeso)}.` : " e ajusta o próximo passo."}
          </p>
        </div>
      )}

      <ProfessorCard marca={marca} cor={cor} tinta={tinta} />

      {/* As fases inteiras, com semanas e foco, ficam recolhidas: quem quer o
          mapa do ciclo abre; quem quer treinar já viu tudo acima. */}
      <FasesDoPlano plano={plano} cor={cor} />

      <p className="px-1 text-xs text-ink-2">
        Aluno: {aluno.nome} · {rotuloObjetivoPar(aluno.objetivo, aluno.objetivoSecundario)} · {aluno.nivel}
      </p>
    </div>
  );
}

/** Sessão do plano na aba Treinos: letra, foco, dose de tempo e o CTA da de hoje. */
function CardSessaoPlano({
  sessao,
  ordem,
  cor,
  tinta,
  hoje,
  concluida,
  onIniciar,
}: {
  sessao: Sessao;
  /** posição da sessão na semana, usada quando o nome não traz letra */
  ordem: number;
  cor: string;
  tinta: string;
  hoje: boolean;
  concluida: boolean;
  onIniciar?: () => void;
}) {
  const letra = selo(sessao, ordem);
  const n = sessao.blocos.length;
  const comecarAgora = hoje && !concluida;


  return (
    <div
      className="flex items-center gap-3 rounded-card border border-border bg-surface p-3.5"
      style={hoje ? { borderColor: cor, borderWidth: 2 } : undefined}
    >
      <button
        type="button"
        onClick={onIniciar}
        disabled={!onIniciar}
        aria-label={onIniciar ? `Abrir ${sessao.nome}` : undefined}
        className="flex min-h-[44px] min-w-0 flex-1 items-center gap-3 text-left disabled:cursor-default"
      >
        {/* Selo + nome + dose: UM alvo só, do tamanho do cartão. */}
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-control font-display text-base font-bold"
          style={concluida ? { background: cor, color: tinta } : { boxShadow: `inset 0 0 0 1.5px ${cor}`, color: cor }}
        >
          {concluida ? <CheckCircle2 className="h-5 w-5" /> : letra}
        </span>
        <span className="min-w-0 flex-1 text-left">
          <span className="block truncate font-semibold text-ink">{sessao.nome}</span>
          <span className="block truncate text-xs text-ink-2">
            {sessao.foco ? `${sessao.foco} · ` : ""}
            {n} {n === 1 ? "exercício" : "exercícios"}
            {minutosDeclarados(sessao) ? ` · ${minutosDeclarados(sessao)} min` : ""}
            {hoje ? " · hoje" : ""}
          </span>
        </span>
        {/* Sem "Começar" ao lado, a seta é a marca de que o cartão abre. Com ele, a
            seta sairia competindo com a ação principal. */}
        {onIniciar && !comecarAgora && <ChevronRight className="h-5 w-5 shrink-0 text-ink-2" aria-hidden />}
      </button>
      {onIniciar && comecarAgora && (
        <button
          type="button"
          onClick={onIniciar}
          className="inline-flex h-10 shrink-0 items-center rounded-full px-4 text-sm font-bold"
          style={{ background: cor, color: tinta }}
        >
          Começar
        </button>
      )}
    </div>
  );
}

/** O card do professor: quem acompanha, com as iniciais da marca. */
function ProfessorCard({ marca, cor, tinta }: { marca: Marca; cor: string; tinta: string }) {
  return (
    <div className="flex items-center gap-3 rounded-card border border-border bg-surface p-3.5">
      {marca.logoDataUrl ? (
        <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-control border border-border bg-white p-1">
          <img src={marca.logoDataUrl} alt="" className="max-h-full max-w-full object-contain" />
        </span>
      ) : (
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-control font-display text-sm font-bold"
          style={{ background: cor, color: tinta }}
        >
          {iniciaisDe(marca.nome)}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate font-semibold text-ink">{marca.nome}</div>
        <div className="text-xs text-ink-2">quem monta e acompanha o seu treino</div>
      </div>
    </div>
  );
}

/* ----------------------------- Aba: Progresso ----------------------------- */

function AbaProgresso({
  aluno,
  avaliacoes,
  execucoes,
  feedbacks,
  cor,
}: {
  aluno: Aluno;
  avaliacoes: Avaliacao[];
  execucoes: Execucao[];
  /** feedbacks de sessão do aluno: alimentam o esforço médio */
  feedbacks: SessaoFeedback[];
  cor: string;
}) {
  const doAluno = avaliacoes.filter((a) => a.alunoId === aluno.id).sort((a, b) => b.data - a.data);
  const fmt = (ts: number) => new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(ts));

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold text-ink">Seu progresso</h2>

      {/* Liga, sequência, pontos, gráfico por semana e conquistas: tudo derivado
          dos registros do próprio aluno (GamificacaoView). */}
      <GamificacaoView
        alunoId={aluno.id}
        execucoes={execucoes}
        cor={cor}
        avaliacoes={doAluno}
        feedbacks={feedbacks}
      />

      <section className="space-y-2">
        <h3 className="font-display text-base font-bold text-ink">Avaliações</h3>
        {doAluno.length === 0 ? (
          <Card className="p-6 text-center">
            <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-card bg-surface-soft text-ink-2">
              <Clock className="h-5 w-5" />
            </span>
            <p className="text-sm text-ink-2">Suas avaliações vão aparecer aqui conforme o seu professor registrar.</p>
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

/* ------------------------------ Aba: Perfil ------------------------------- */

/**
 * "Perfil": quem acompanha, o plano em curso, a mensalidade e a saída. É a aba
 * que o design pede e que antes não existia; a mensalidade morava escondida na
 * aba de plano, onde ninguém procura por ela.
 */
function AbaPerfil({
  aluno,
  marca,
  cor,
  tinta,
  plano,
  avaliacoes,
  onSair,
  preview,
}: {
  aluno: Aluno;
  marca: Marca;
  cor: string;
  tinta: string;
  plano?: PlanoTreino;
  avaliacoes: Avaliacao[];
  onSair?: () => void;
  preview?: boolean;
}) {
  const ultima = avaliacoes
    .filter((a) => a.alunoId === aluno.id)
    .sort((a, b) => b.data - a.data)[0];
  const fmt = (ts: number) => new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(ts));

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold text-ink">Perfil</h2>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <span
            className="grid h-12 w-12 shrink-0 place-items-center rounded-control font-display text-base font-bold"
            style={{ background: cor, color: tinta }}
          >
            {aluno.iniciais}
          </span>
          <div className="min-w-0">
            <div className="truncate font-display text-lg font-bold text-ink">{aluno.nome}</div>
            <div className="text-sm text-ink-2">
              {rotuloObjetivoPar(aluno.objetivo, aluno.objetivoSecundario)} · {aluno.nivel}
              {aluno.idade ? ` · ${aluno.idade} anos` : ""}
            </div>
          </div>
        </div>
        {ultima && (
          <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-border pt-3">
            <ParDado layout="inline" label="Última avaliação" value={fmt(ultima.data)} />
            {ultima.medidas.peso != null && <ParDado layout="inline" label="Peso" value={`${ultima.medidas.peso} kg`} />}
          </div>
        )}
      </Card>

      <ProfessorCard marca={marca} cor={cor} tinta={tinta} />

      {plano && (
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-control bg-surface-soft" style={{ color: cor }}>
              <CalendarDays className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <div className="truncate font-semibold text-ink">{plano.titulo}</div>
              <div className="text-xs text-ink-2">
                {plano.semanas} {plano.semanas === 1 ? "semana" : "semanas"} · {rotuloFrequencia(plano)}
              </div>
            </div>
          </div>
        </Card>
      )}

      <MensalidadeCard aluno={aluno} cor={cor} tinta={tinta} />

      {onSair && (
        <button onClick={onSair} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border text-sm font-semibold text-ink-2 hover:text-ink">
          <LogOut className="h-4 w-4" /> {preview ? "Fechar prévia" : "Sair da conta"}
        </button>
      )}
    </div>
  );
}

/* -------------------------- Peças compartilhadas -------------------------- */

/**
 * O selo redondo da sessão: a letra do nome quando existe ("Treino A", "A ·
 * Inferiores") e o número de ordem quando não existe ("Sessão 1"). Nunca inventa
 * uma letra que o nome não tem, que era o que fazia três sessões diferentes
 * aparecerem todas como "S".
 */
function selo(sessao: Sessao, ordem: number): string {
  const letra = sessao.nome.match(/([A-Z])/)?.[1];
  return letra ? letra.toUpperCase() : String(ordem);
}

// Fases do plano (mesociclos) recolhidas: rótulo, posição, semanas e foco.
function FasesDoPlano({ plano, cor }: { plano: PlanoTreino; cor: string }) {
  const [aberto, setAberto] = React.useState(false);
  const semana = semanaAtual(plano);
  return (
    <Card className="overflow-hidden p-0">
      <button
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        className="flex min-h-[52px] w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="font-display font-bold text-ink">Fases do plano</span>
        <ChevronRight className={cn("h-5 w-5 shrink-0 text-ink-2 transition-transform", aberto && "rotate-90")} />
      </button>
      {aberto && (
        <div className="space-y-3 border-t border-border p-3">
          {plano.macrociclo.mesociclos.map((m) => {
            const atual = semana >= m.semanaInicio && semana <= m.semanaFim;
            return (
              <div
                key={m.id}
                className="rounded-card border border-border bg-surface p-4"
                style={atual ? { borderColor: cor, borderWidth: 2 } : undefined}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-display font-bold text-ink">{rotuloMeso(m)}</div>
                  {atual && <Pill tone="primary">{rotuloPosicao(m)}</Pill>}
                </div>
                <p className="mt-1 text-xs text-ink-2">Semanas {m.semanaInicio} a {m.semanaFim}</p>
                <p className="mt-1.5 text-sm text-ink-2">{m.foco}</p>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function MensalidadeCard({ aluno, cor, tinta }: { aluno: Aluno; cor: string; tinta: string }) {
  const c = aluno.cobranca;
  if (!c) return null;
  const efetivo = statusEfetivo(c);
  const tone: Record<string, "success" | "warning" | "neutral"> = { pago: "success", pendente: "warning", isento: "neutral" };
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-control" style={{ background: cor, color: tinta }}>
          <Wallet className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-display font-bold text-ink">Mensalidade {formatBRL(c.valorCentavos)}</div>
          <div className="text-xs text-ink-2">Vence dia {c.diaVencimento}</div>
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
                className="block w-full rounded-full py-2.5 text-center text-sm font-bold"
                style={{ background: cor, color: tinta }}
              >
                Pagar mensalidade
              </a>
            ) : (
              <PixCopia chave={c.linkPagamento} cor={cor} tinta={tinta} />
            )
          ) : (
            <p className="text-xs text-ink-2">Combine o pagamento com o seu professor.</p>
          )}
        </div>
      )}
    </Card>
  );
}

function PixCopia({ chave, cor, tinta }: { chave: string; cor: string; tinta: string }) {
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
        className="block w-full rounded-full py-2.5 text-center text-sm font-bold"
        style={{ background: cor, color: tinta }}
      >
        {copiado ? "Chave PIX copiada" : "Copiar chave PIX"}
      </button>
      <p className="mt-1.5 break-all text-center text-2xs text-ink-2">{chave}</p>
    </div>
  );
}

function SemPlano() {
  return (
    <Card className="p-6 text-center">
      <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-card bg-surface-soft text-ink-2">
        <CalendarDays className="h-5 w-5" />
      </span>
      <p className="text-sm text-ink-2">Seu professor ainda não publicou um plano de treino para você.</p>
    </Card>
  );
}
