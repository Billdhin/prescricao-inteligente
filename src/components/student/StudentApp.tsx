import * as React from "react";
import { useNavegacaoAluno } from "@/components/student/navegacaoAluno";
import { rotuloObjetivoPar } from "@/lib/gps/objetivos";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  CalendarDays,
  Download,
  Dumbbell,
  FileText,
  Flame,
  Map as IconeMapa,
  MessageCircle,
  Moon,
  PauseCircle,
  Play,
  Sparkles,
  Sun,
  UserRound,
  Wallet,
} from "lucide-react";
import { Card, LinhaDeTokens, TokenRotulado } from "@/components/ui/primitives";
import { cn, withBase } from "@/lib/utils";
import { BrandProvider, type Marca } from "@/lib/brand/BrandContext";
import { SobreVoce, resumoSobreVoce, LinhaDoTempo, etapasDoPedido } from "@/components/student/SobreVoce";
import { pedidoTreinoEmAberto, type DeclaracaoAluno } from "@/data/declaracoes";
import { exportEvolucaoPDF } from "@/lib/exportEvolucao";
import {
  aplicarPaleta,
  PALETA_ALUNO,
  parDeMarca,
  ajustarParaContraste,
  temaAlunoSalvo,
  salvarTemaAluno,
  type TemaAluno,
} from "@/lib/theme/palettes";
import { GamificacaoView, ConquistasAluno } from "@/components/student/GamificacaoView";
import { EvolucaoExercicio } from "@/components/app/EvolucaoExercicio";
import { SemanaStrip } from "@/components/student/SemanaStrip";
import { getExercise } from "@/data/exercises";
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
  sessaoConcluidaHoje,
  ultimoRegistroDaSessao,
  doseCurta,
  tokensExtras,
  minutosDeclarados,
  RegistroBloco,
  seriesFeitas,
  blocoCompleto,
  totalSeriesDe,
} from "@/components/student/blocoRegistro";
import { estadoSemaforo } from "@/lib/gps/semaforoDiario";
import { modalidadeImagem } from "@/data/modalities";
import { iniciaisDe, type Aluno, type Avaliacao, type Liberacao } from "@/data/alunos";
import type { Execucao, SessaoFeedback } from "@/data/execucao";
import { formatBRL, statusEfetivo, type CobrancaAluno } from "@/data/cobranca";
import { sequenciaDias } from "@/lib/gamificacao";
import { AvatarAluno, TrocarFotoAluno } from "@/components/alunos/FotoAluno";
import {
  type PlanoTreino,
  type Sessao,
  type BlocoSessao,
  semanaAtual,
  mesocicloAtual,
  rotuloMeso,
  getMetodo,
  getModelo,
  agruparBlocosPorMetodo,
  sessaoDeHojeIndex,
  rotuloFrequencia,
  sessoesPrincipais,
  complementosDe,
} from "@/data/periodizacao";

// A sessão tem algum bloco com intensidade prescrita? Governa a nota educacional
// única no rodapé do card da Sessão (antes repetida por exercício).
const temIntensidadeNaSessao = (s: Sessao): boolean =>
  s.blocos.some((b) => b.intensidade != null && String(b.intensidade).trim() !== "" && String(b.intensidade).trim() !== "-");

/**
 * Como chamar o profissional numa frase. Normalmente é o primeiro nome da marca
 * ("Ricardo Costa Personal" vira "Ricardo"), mas quando a marca ainda é o rótulo
 * neutro de fallback o primeiro nome sairia "Seu", e a tela dizia "Falar com
 * Seu". Nesse caso a frase usa o substantivo.
 */
const MARCA_NEUTRA = "Seu treino";
const apelidoProfissional = (marca: Marca): string =>
  marca.nome === MARCA_NEUTRA ? "o seu professor" : marca.nome.split(" ")[0];
const maiuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/*
 * AS DATAS DO APP DO ALUNO NUM FORMATO SÓ: "07 set" (protótipo). Antes conviviam "07/09",
 * "7 de set." e "07/09/2026" na mesma tela, e cada um fazia o aluno ler de um jeito.
 */
const mesCurto = (d: Date) => new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(d).replace(".", "");
const fmtDiaMes = (ts: number): string => {
  const d = new Date(ts);
  return `${String(d.getDate()).padStart(2, "0")} ${mesCurto(d)}`;
};
/** "07 set", e com o ano quando não é o ano corrente ("07 set 2025"). */
const fmtDiaMesAno = (ts: number): string =>
  new Date(ts).getFullYear() === new Date().getFullYear() ? fmtDiaMes(ts) : `${fmtDiaMes(ts)} ${new Date(ts).getFullYear()}`;
const DIAS_CURTOS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
/** O dia da semana de um momento REGISTRADO ("seg"). Nunca um dia de agenda: o plano não tem. */
const diaCurto = (ts: number) => DIAS_CURTOS[new Date(ts).getDay()];

/** "5 exercícios", com a concordância escolhida pelo número. */
const contarExercicios = (n: number) => `${n} ${n === 1 ? "exercício" : "exercícios"}`;

/** O telefone do profissional como se escreve no Brasil ("(11) 99999-0000"). */
function telefoneLegivel(tel: string): string {
  let d = tel.replace(/\D/g, "");
  if (d.length >= 12 && d.startsWith("55")) d = d.slice(2);
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return tel.trim();
}

/**
 * O canal de WhatsApp do profissional, quando existe. Só dígitos (o número pode vir com
 * máscara do perfil) e com o país: o wa.me exige o 55, e número brasileiro sem ele não abre
 * conversa nenhuma. Sem telefone cadastrado não há canal, e quem chama isto não desenha porta.
 */
function whatsDoProfissional(marca: Marca): { href: string; legivel: string } | null {
  const digitos = (marca.telefone ?? "").replace(/\D/g, "");
  const numero = digitos.length >= 10 ? (digitos.startsWith("55") ? digitos : `55${digitos}`) : "";
  if (!numero) return null;
  const texto = encodeURIComponent(`Oi, ${apelidoProfissional(marca)}! Falando pelo meu app de treino.`);
  return { href: `https://wa.me/${numero}?text=${texto}`, legivel: telefoneLegivel(marca.telefone ?? "") };
}

/** As 4 abas do design do app do aluno: Hoje, Treinos, Progresso, Perfil. */
type Aba = "hoje" | "treinos" | "progresso" | "perfil";
const ABAS: { id: Aba; label: string }[] = [
  { id: "hoje", label: "Hoje" },
  { id: "treinos", label: "Treinos" },
  { id: "progresso", label: "Progresso" },
  { id: "perfil", label: "Perfil" },
];

/**
 * O DIA NO PLANO: a semana, as sessões que ocupam dia, os complementos, a sessão de hoje e
 * a que fechou hoje. Calculado uma vez no topo, porque o cabeçalho (a saudação "Boa, ...")
 * e a aba Hoje precisam da MESMA resposta; calculado em dois lugares, os dois discordariam
 * no primeiro registro que caísse entre um render e outro.
 */
function diaDoPlano(plano: PlanoTreino, execucoes: Execucao[], feedbacks: SessaoFeedback[]) {
  const semana = semanaAtual(plano);
  const micro = plano.macrociclo.mesociclos.flatMap((m) => m.microciclos).find((mc) => mc.semana === semana);
  const todas = micro?.sessoes ?? [];
  // As sessões que ocupam um dia, e os complementos (isométricos) que cabem no dia de
  // uma delas. Listados separados: o aluno que declarou 3 dias não pode ler 6 treinos.
  const sessoes = sessoesPrincipais(micro?.sessoes ?? []);
  const complementos = complementosDe(todas);
  // "Hoje" = a primeira sessão ainda não concluída; se todas foram feitas, a
  // primeira da semana. Helper compartilhado com o "personalizar o treino do
  // dia" do profissional, para os dois nunca mirarem sessões diferentes. Se o
  // índice cair num complemento (todas as principais feitas), hoje é a primeira.
  const idx = sessaoDeHojeIndex(plano, execucoes);
  const sessaoHoje: Sessao | undefined = todas[idx]?.complemento ? sessoes[0] : todas[idx];
  const concluidaHoje = sessaoConcluidaHoje(
    sessoes,
    semana,
    execucoes,
    feedbacks.filter((f) => f.planoId === plano.id),
  );
  return { semana, micro, sessoes, complementos, sessaoHoje, concluidaHoje };
}

/**
 * Portal do aluno: o app com a marca do PROFISSIONAL, onde o aluno vê o próprio
 * treino e a periodização. Componente de apresentação puro, alimentado por
 * (aluno, plano, marca). Serve tanto para a prévia do profissional ("ver como o
 * aluno vê") quanto para a produção, quando o aluno logado carrega os próprios
 * dados via Supabase.
 *
 * A forma segue o protótipo mobile de 10/09/2026: a faixa da marca e a saudação só na aba
 * Hoje, as outras abas abrindo direto no título da página, a sessão aberta e o treino
 * guiado como telas empurradas (sem a barra de abas), e a barra de abas sem ícone, com o
 * traço da marca sobre a aba ativa.
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
  rodapeDoPerfil,
  declaracoes = [],
  onDeclarar,
  onFoto,
  abrirSobreVoce = false,
}: {
  aluno: Aluno;
  plano?: PlanoTreino;
  marca: Marca;
  /** o que o aluno já informou sobre si (pré-preenche a tela e mostra o status no Perfil) */
  declaracoes?: DeclaracaoAluno[];
  /** grava uma resposta do aluno; ausente = prévia (a tela mostra, não grava) */
  onDeclarar?: (d: DeclaracaoAluno) => void;
  /** o aluno põe, troca ou tira (null) a própria foto; ausente = prévia (a câmera não aparece) */
  onFoto?: (foto: string | null) => void;
  /** primeiro acesso: abre "Conte sobre você" por cima do app */
  abrirSobreVoce?: boolean;
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
  /** peça extra no fim do Perfil (a troca de espaço da conta). Ver AlternarEspaco. */
  rodapeDoPerfil?: React.ReactNode;
  onSair?: () => void;
}) {
  // A navegação vive na URL: ver @/components/student/navegacaoAluno. Antes eram três
  // `useState` e o voltar do navegador (e o gesto do Android) saía do app.
  const nav = useNavegacaoAluno();
  const aba = nav.aba;
  /*
   * A APARÊNCIA É DO ALUNO, não do produto (redesign mobile de 09/09/2026).
   *
   * O escuro continua sendo o padrão pela razão de sempre (vestiário, academia, pouca luz),
   * mas quem treina de manhã na rua lia mal o navy. A escolha fica no aparelho dele, e não na
   * conta do professor: é o aluno que está com o celular na mão.
   */
  const [tema, setTema] = React.useState<TemaAluno>(() => temaAlunoSalvo());
  const trocarTema = React.useCallback((t: TemaAluno) => {
    salvarTemaAluno(t);
    setTema(t);
  }, []);

  /*
   * A COR DA MARCA, AJUSTADA AO TEMA. A cor crua do profissional não serve nos dois lados:
   * um dourado some no papel claro e um grafite some no navy. `parDeMarca` puxa o
   * preenchimento até 3:1 contra o fundo e garante que a tinta escrita nele passe 4,5.
   *
   * Quando a marca ESCREVE (o rótulo do dia de hoje, "F2 · S7", "ver como fazer", a aba
   * ativa), o texto usa o token `--primary-texto`, que `aplicarPaleta` calcula a partir da
   * MESMA cor puxada até 4,5. Até 10/09 esse valor era calculado aqui e nunca usado, e todo
   * texto na cor da marca saía com o preenchimento de 3:1, que reprova texto pequeno.
   */
  const corMarca = marca.corPrimaria || "#2064EC";
  const fundoDoTema = tema === "escuro" ? PALETA_ALUNO.escuro.bg : PALETA_ALUNO.claro.bg;
  const { preenche: cor, tinta: tintaDaMarca } = React.useMemo(
    () => parDeMarca(corMarca, fundoDoTema),
    [corMarca, fundoDoTema],
  );
  // A letra da marca mora sobre PAPEL BRANCO (o quadro da logo), e não sobre o fundo do
  // tema: a cor precisa ser puxada contra o branco, senão um turquesa ajustado para o navy
  // some no papel.
  const corSobreBranco = React.useMemo(() => ajustarParaContraste(corMarca, "#FFFFFF", 4.5), [corMarca]);

  // "Conte sobre você": abre sozinha no primeiro acesso, e depois pelo cartão do Perfil e
  // pelo início, enquanto não houver treino. A ORIGEM vira o rótulo do voltar da tela.
  const [sobreVoce, setSobreVoce] = React.useState(abrirSobreVoce);
  const [origemSobreVoce, setOrigemSobreVoce] = React.useState<string | undefined>(undefined);
  const abrirConteSobreVoce = (origem: string) => {
    setOrigemSobreVoce(origem);
    setSobreVoce(true);
  };
  // O pedido de treino ainda sem resposta. Com ele aberto, a tela não pede de novo; sem
  // treino e sem pedido, o envio final da tela também pede o treino.
  const pedidoAberto = pedidoTreinoEmAberto(declaracoes, aluno.id, !!plano);
  const pedirTreino = !plano && !pedidoAberto;

  const semanaGuiado = plano ? semanaAtual(plano) : 1;

  // As sessões vêm da URL, não de estado: o id é o que sobrevive ao voltar e ao recarregar.
  // Um id que não existe mais (plano trocado, link velho) simplesmente não resolve, e a
  // tela cai na aba, em vez de quebrar.
  const sessoesDoPlano = React.useMemo(() => {
    if (!plano) return [] as Sessao[];
    const mesos = plano.macrociclo?.mesociclos ?? [];
    return mesos.flatMap((m) => m.microciclos.flatMap((w) => w.sessoes));
  }, [plano]);
  const acharSessao = React.useCallback(
    (id: string | null) => (id ? sessoesDoPlano.find((s) => s.id === id) ?? null : null),
    [sessoesDoPlano],
  );
  const guiado = acharSessao(nav.guiadoId);
  const sessaoAberta = acharSessao(nav.sessaoId);
  const feedbackGuiado = guiado
    ? sessaoFeedbacks.find(
        (f) => f.alunoId === aluno.id && f.planoId === plano?.id && f.semana === semanaGuiado && f.sessaoRef === guiado.id,
      )
    : undefined;

  // O portal do aluno tem PELE PRÓPRIA (escura por padrão, clara se o aluno pedir).
  // Ele não herda a aparência do profissional: quem abre esta tela é o aluno. O que o
  // profissional controla é a COR DE MARCA, que entra como acento sobre a pele.
  // Aplica no container do portal, não na raiz do documento, para não vazar para
  // a prévia que roda dentro do app do profissional. Recebe a MESMA cor que os inline
  // styles usam (com o azul do produto quando a marca não tem cor), senão o token e o
  // estilo divergiriam na mesma tela.
  const rootRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (rootRef.current) aplicarPaleta(rootRef.current, PALETA_ALUNO, tema === "escuro", corMarca);
  }, [corMarca, tema]);

  const cobranca = aluno.cobranca;
  const cobrancaPendente = cobranca ? statusEfetivo(cobranca) === "pendente" : false;
  const execucoesDoAluno = execucoes.filter((e) => e.alunoId === aluno.id);
  const feedbacksDoAluno = sessaoFeedbacks.filter((f) => f.alunoId === aluno.id);
  const streak = sequenciaDias(execucoesDoAluno);
  const dia = React.useMemo(
    () => (plano ? diaDoPlano(plano, execucoes, feedbacksDoAluno) : null),
    // feedbacksDoAluno é derivado a cada render; a dependência real são as listas de origem.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [plano, execucoes, sessaoFeedbacks, aluno.id],
  );
  const pausa = estadoSemaforo(aluno.id, liberacoes).vermelhoPendente;

  // A SAUDAÇÃO DIZ O ESTADO DO DIA (protótipo, telas 06, 12 e 13): "Boa" depois do treino,
  // "Olá" quando não há treino a fazer (sem plano, ou em pausa) e a do relógio nos outros.
  const primeiroNome = aluno.nome.split(" ")[0];
  const saudacao = dia?.concluidaHoje
    ? `Boa, ${primeiroNome}`
    : !plano || pausa
      ? `Olá, ${primeiroNome}`
      : `${saudacaoDoDia()}, ${primeiroNome}`;

  // ABAS SEM CONTEÚDO FICAM APAGADAS (protótipo, tela 12). Sem plano, Treinos não tem o que
  // mostrar; Progresso só tem se já houver avaliação ou registro (há aluno avaliado antes do
  // primeiro plano, e aí o Progresso já conta a história dele). Perfil sempre abre.
  const temAvaliacao = avaliacoes.some((a) => a.alunoId === aluno.id);
  const abasApagadas = new Set<Aba>(
    plano ? [] : temAvaliacao || execucoesDoAluno.length > 0 ? ["treinos"] : ["treinos", "progresso"],
  );

  return (
    <BrandProvider marca={marca}>
      {/* Na prévia o app vive dentro da tela de um celular com altura fixa: 100dvh ali seria
          a altura da JANELA do profissional, e sobrava uma faixa vazia no fim do conteúdo. */}
      <div ref={rootRef} className={cn("mx-auto flex w-full max-w-md flex-col bg-bg", preview ? "min-h-full" : "min-h-[100dvh]")}>
        {guiado && plano ? (
          <TreinoGuiado
            sessao={guiado}
            semana={semanaGuiado}
            cor={cor}
            tinta={tintaDaMarca}
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
            onSair={nav.sairDoGuiado}
          />
        ) : (
          <>
            {/* A moldura de celular e o chrome do profissional (AlunoPreview) já
                sinalizam que isto é prévia. Uma tarja aqui dentro contradizia o "é
                exatamente o que o aluno vê", já que o aluno real nunca a vê. */}
            {sobreVoce && (
              <SobreVoce
                aluno={aluno}
                cor={cor}
                tinta={tintaDaMarca}
                marca={marca}
                professor={apelidoProfissional(marca)}
                declaracoes={declaracoes}
                onDeclarar={onDeclarar}
                onFechar={() => setSobreVoce(false)}
                primeiraVez={abrirSobreVoce}
                origem={origemSobreVoce}
                pedirTreino={pedirTreino}
                pedidoEnviadoEm={pedidoAberto?.declaradaEm}
              />
            )}

            {sessaoAberta && plano ? (
              /*
               * A SESSÃO ABERTA É TELA EMPURRADA (protótipo, tela 02): sem a faixa da marca e
               * sem a barra de abas. Com as abas embaixo, o aluno lia a sessão como "uma aba a
               * mais" e tocava em Hoje esperando voltar; o voltar aqui diz para onde vai, pela
               * aba que continua na URL por baixo da sessão.
               */
              <main className="flex-1 px-3.5 pb-8 pt-3">
                <button
                  type="button"
                  onClick={nav.fecharSessao}
                  className="-ml-1 inline-flex min-h-[44px] items-center gap-0.5 rounded-full pl-0.5 pr-2 text-xs text-ink-2 hover:text-ink"
                >
                  <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
                  {aba === "treinos" ? "Treinos" : "Hoje"}
                </button>
                <VisaoSessao
                  sessao={sessaoAberta}
                  plano={plano}
                  semana={semanaGuiado}
                  aluno={aluno}
                  marca={marca}
                  cor={cor}
                  tinta={tintaDaMarca}
                  execucoes={execucoes}
                  sessaoFeedbacks={sessaoFeedbacks}
                  onRegistrar={onRegistrar}
                  onDesfazer={onDesfazer}
                  ehHoje={dia?.sessaoHoje?.id === sessaoAberta.id}
                  /* COMEÇAR EMPILHA O GUIADO POR CIMA DA SESSÃO. Antes o botão também fechava a
                     sessão no mesmo toque, e as duas escritas na URL partiam do mesmo endereço:
                     a segunda apagava a primeira, e o guiado nunca abria a partir daqui. Assim,
                     sair do guiado devolve a sessão, que é o que o voltar do celular promete. */
                  onIniciar={() => nav.comecarGuiado(sessaoAberta.id)}
                  dataDaPrescricao={dataDaPrescricao}
                  preview={preview}
                />
              </main>
            ) : (
              <>
                {/* A faixa da marca e a saudação são da aba Hoje (protótipo, telas 01, 06, 12 e
                    13). Em Treinos, Progresso e Perfil elas empurravam o título da página para
                    o meio da tela e repetiam, em quatro abas, o que só importa na primeira. */}
                {aba === "hoje" && (
                  <CabecalhoAluno
                    aluno={aluno}
                    marca={marca}
                    cor={cor}
                    tinta={tintaDaMarca}
                    corSobreBranco={corSobreBranco}
                    streak={streak.atual}
                    plano={plano}
                    execucoes={execucoesDoAluno}
                    saudacao={saudacao}
                    cobranca={cobrancaPendente ? cobranca : undefined}
                    onCobranca={() => nav.irParaAba("perfil")}
                  />
                )}

                <main className={cn("flex flex-1 flex-col px-3.5 pb-28", aba === "hoje" ? "pt-1" : "pt-4")}>
                  {aba === "hoje" && (
                    <AbaHoje
                      plano={plano}
                      dia={dia}
                      cor={cor}
                      tinta={tintaDaMarca}
                      aluno={aluno}
                      marca={marca}
                      execucoes={execucoes}
                      sessaoFeedbacks={sessaoFeedbacks}
                      liberacoes={liberacoes}
                      pausa={pausa}
                      onIniciar={(s) => nav.comecarGuiado(s.id)}
                      onAbrir={(s) => nav.abrirSessao(s.id)}
                      dataDaPrescricao={dataDaPrescricao}
                      declaracoes={declaracoes}
                      pedidoAberto={pedidoAberto}
                      ultimaAvaliacao={avaliacoes.filter((a) => a.alunoId === aluno.id).sort((a, b) => b.data - a.data)[0]?.data}
                      onSobreVoce={() => abrirConteSobreVoce("Hoje")}
                    />
                  )}
                  {aba === "treinos" && (
                    <AbaTreinos
                      plano={plano}
                      cor={cor}
                      tinta={tintaDaMarca}
                      marca={marca}
                      execucoes={execucoes}
                      feedbacks={feedbacksDoAluno}
                      onAbrir={(s) => nav.abrirSessao(s.id)}
                    />
                  )}
                  {aba === "progresso" && (
                    <AbaProgresso
                      aluno={aluno}
                      avaliacoes={avaliacoes}
                      execucoes={execucoesDoAluno}
                      feedbacks={feedbacksDoAluno}
                      cor={cor}
                      tinta={tintaDaMarca}
                      marca={marca}
                      plano={plano}
                    />
                  )}
                  {aba === "perfil" && (
                    <AbaPerfil
                      aluno={aluno}
                      marca={marca}
                      cor={cor}
                      tinta={tintaDaMarca}
                      plano={plano}
                      onSair={onSair}
                      rodapeDoPerfil={rodapeDoPerfil}
                      preview={preview}
                      declaracoes={declaracoes}
                      pedidoAberto={pedidoAberto}
                      onSobreVoce={() => abrirConteSobreVoce("Perfil")}
                      onFoto={preview ? undefined : onFoto}
                      tema={tema}
                      onTema={trocarTema}
                    />
                  )}
                </main>

                {/* Trocar de aba fecha a sessão aberta: sem isso ela continuaria na
                    tela por cima da aba escolhida. */}
                <BarraDeAbas aba={aba} onAba={nav.irParaAba} cor={cor} tema={tema} apagadas={abasApagadas} />
              </>
            )}
          </>
        )}
      </div>
    </BrandProvider>
  );
}

/* ------------------------------- Cabeçalho -------------------------------- */

/** "Bom dia" / "Boa tarde" / "Boa noite", pelo relógio do aparelho do aluno. */
function saudacaoDoDia(agora = new Date()): string {
  const h = agora.getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

/** "Quarta", com inicial maiúscula, para a linha de contexto. */
function diaDaSemanaPorExtenso(agora = new Date()): string {
  const d = new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(agora).replace(/-feira$/, "");
  return d.charAt(0).toUpperCase() + d.slice(1);
}

/**
 * O VENCIMENTO DA MENSALIDADE, dito como o calendário diz. `statusEfetivo` marca pendente o
 * mês inteiro, antes e depois do dia de vencimento; a frase precisa saber qual dos dois:
 * "vence dia 10" no dia 5 e "venceu dia 10" no dia 12 são avisos diferentes.
 */
function vencimentoDa(c: CobrancaAluno, agora = new Date()): { data: number; passou: boolean } {
  const efetivo = statusEfetivo(c, agora.getTime());
  const competenciaAtual = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}`;
  let ano = agora.getFullYear();
  let mes = agora.getMonth();
  if (efetivo === "pendente" && c.statusAtual === "pendente" && c.competencia && c.competencia < competenciaAtual) {
    // pendência de um mês que já passou: o vencimento é o daquele mês
    const [a, m] = c.competencia.split("-").map(Number);
    ano = a;
    mes = m - 1;
  } else if (efetivo === "pago" && (c.competencia === competenciaAtual || agora.getDate() > c.diaVencimento)) {
    // em dia: o próximo vencimento é o do mês seguinte
    mes += 1;
  }
  const data = new Date(ano, mes, c.diaVencimento).getTime();
  const fimDoDia = new Date(ano, mes, c.diaVencimento, 23, 59, 59).getTime();
  return { data, passou: efetivo === "pendente" && fimDoDia < agora.getTime() };
}

/**
 * O aviso de mensalidade pendente (protótipo, tela 14). No Hoje ele é um botão que leva ao
 * Perfil; no topo do Perfil ele é informação, porque a ação está logo abaixo dele, e uma
 * seta ali apontaria para a própria tela.
 */
function AvisoMensalidade({ cobranca, onClick }: { cobranca: CobrancaAluno; onClick?: () => void }) {
  const { passou } = vencimentoDa(cobranca);
  const miolo = (
    <>
      <Wallet className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="min-w-0 flex-1 text-left">
        Mensalidade pendente · {passou ? "venceu" : "vence"} dia {cobranca.diaVencimento}
      </span>
      {onClick && <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />}
    </>
  );
  const classe =
    "flex min-h-[40px] w-full items-center gap-2 rounded-control border border-warning/35 bg-warning-tint px-3 py-[9px] text-xs font-semibold text-warning";
  return onClick ? (
    <button type="button" onClick={onClick} className={classe}>
      {miolo}
    </button>
  ) : (
    <div className={classe}>{miolo}</div>
  );
}

/**
 * O CABEÇALHO DA ABA HOJE: a faixa da marca do professor, a saudação e a linha de contexto.
 *
 * Nada aqui é inventado: o streak vem de `sequenciaDias`, a semana vem do plano e a contagem
 * de treinos vem das execuções registradas.
 */
function CabecalhoAluno({
  aluno,
  marca,
  cor,
  tinta,
  corSobreBranco,
  streak,
  plano,
  execucoes,
  saudacao,
  cobranca,
  onCobranca,
}: {
  aluno: Aluno;
  marca: Marca;
  cor: string;
  tinta: string;
  /** a cor da marca puxada até 4,5:1 contra o papel branco da logo */
  corSobreBranco: string;
  streak: number;
  plano?: PlanoTreino;
  execucoes: Execucao[];
  saudacao: string;
  /** a mensalidade, quando pendente (o aviso só existe nesse caso) */
  cobranca?: CobrancaAluno;
  onCobranca: () => void;
}) {
  const semana = plano ? semanaAtual(plano) : undefined;

  // As SESSÕES da semana corrente e quantas já fecharam. Mesma regra da aba Treinos
  // (`sessaoConcluida`), para as duas telas nunca discordarem sobre o que é treino feito.
  const treinosDaSemana = React.useMemo(() => {
    if (!plano || semana == null) return null;
    const micro = plano.macrociclo.mesociclos.flatMap((m) => m.microciclos).find((mc) => mc.semana === semana);
    // Só as sessões que ocupam um dia: o complemento isométrico cabe no dia de uma delas,
    // e contá-lo faria quem declarou 3 dias ler "6 treinos" (ver Sessao.complemento).
    const sessoes = sessoesPrincipais(micro?.sessoes ?? []);
    if (!sessoes.length) return null;
    return { total: sessoes.length, feitos: sessoes.filter((s) => sessaoConcluida(s, semana, execucoes)).length };
  }, [plano, semana, execucoes]);

  // A FASE e a semana, do plano, para a linha de contexto sob a saudação. Sem plano a linha
  // SOME: o dia da semana sozinho ("Quarta") não informa nada a quem ainda não tem treino.
  const meso = plano ? mesocicloAtual(plano) : undefined;
  const contexto = plano
    ? [
        diaDaSemanaPorExtenso(),
        // "Fase 2", não "Fase 2: Progressão de carga · construir base": o rótulo cheio do
        // mesociclo não cabe numa linha de celular e empurrava a semana para fora da tela.
        meso ? faseCurta(rotuloMeso(meso)) : null,
        semana != null ? `semana ${semana} de ${plano.semanas}` : null,
        treinosDaSemana
          ? `${treinosDaSemana.feitos} de ${treinosDaSemana.total} ${treinosDaSemana.total === 1 ? "treino" : "treinos"}`
          : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : "";

  return (
    <header className="px-3.5 pb-3.5 pt-4">
      {/*
        O CARTÃO DA MARCA (protótipo mobile de 09/09/2026): a identidade do professor ocupa
        a primeira faixa da tela, na cor dele, com a logo sobre papel branco. A saudação saiu
        de dentro dele e desceu: quem assina o treino é o professor, quem é saudado é o aluno,
        e empilhar as duas coisas na mesma faixa disputava a leitura.

        O "Sair" que morava aqui saiu: ele disputava a faixa com a marca e ficava a um toque
        acidental do polegar. Sair da conta está no fim do Perfil, que é onde se procura.
      */}
      <div className="flex items-center gap-3 rounded-card p-3.5" style={{ background: cor, color: tinta }}>
        {marca.logoDataUrl ? (
          // object-CONTAIN sobre papel branco, nunca cover: a logo do profissional costuma
          // ser horizontal (símbolo + nome por extenso), e o cover num quadrado comia as
          // pontas dela. O papel branco é fixo porque a logo foi desenhada para ele.
          <span className="grid h-12 min-w-[48px] shrink-0 place-items-center overflow-hidden rounded-control bg-white px-2 py-1">
            <img src={marca.logoDataUrl} alt="" className="max-h-10 max-w-[96px] object-contain" />
          </span>
        ) : (
          <span
            aria-hidden
            className="grid h-12 w-12 shrink-0 place-items-center rounded-control bg-white font-display text-lg font-bold"
            style={{ color: corSobreBranco }}
          >
            {marca.nome.trim().charAt(0).toUpperCase()}
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block text-2xs opacity-[.85]">Seu treino com</span>
          <b className="block truncate text-[15px] font-bold leading-tight">{marca.nome}</b>
        </span>
        {/* Streak só aparece quando existe de verdade: zero dias não vira medalha. */}
        {streak > 0 && (
          <span
            className="inline-flex shrink-0 items-center gap-1 rounded-full px-[9px] py-[5px] text-xs font-bold"
            style={{ background: tinta, color: cor }}
          >
            <Flame className="h-3.5 w-3.5" aria-hidden />
            <span className="tabular">{streak}</span>
            <span className="sr-only">{streak === 1 ? "dia seguido de treino" : "dias seguidos de treino"}</span>
          </span>
        )}
      </div>

      <h1 className="mt-3.5 truncate font-display text-[22px] font-bold leading-[1.1] tracking-[-0.02em] text-ink">{saudacao}</h1>
      {contexto && <p className="mt-1 text-[12.5px] leading-snug text-ink-2">{contexto}</p>}

      {cobranca && (
        <div className="mt-3">
          <AvisoMensalidade cobranca={cobranca} onClick={onCobranca} />
        </div>
      )}
    </header>
  );
}

/**
 * O TRILHO DO PLANO (protótipo, tela 07): uma barra segmentada, um segmento por semana.
 *
 * O cabeçalho diz a fase e "semana N de M"; o segmento da atual ganha um contorno (forma, não
 * só cor), e embaixo de cada segmento vai o número da semana, porque número é o que se lê
 * para se localizar num plano de 12 semanas (a lição da régua de bolinhas idênticas). Plano
 * com mais de 16 semanas quebra em linhas, e o número continua embaixo de cada segmento.
 *
 * O "feitas" do protótipo pintava as semanas PASSADAS. Aqui a cor cheia é semana passada
 * COMPLETA (todas as sessões principais fechadas, pela régua `sessaoConcluida`); a passada
 * incompleta fica na cor apagada. A descarga vem do tipo da semana no plano, nunca da posição.
 */
function TrilhoDeSemanas({ plano, cor, execucoes }: { plano: PlanoTreino; cor: string; execucoes: Execucao[] }) {
  const total = Math.max(1, plano.semanas);
  const atual = Math.min(semanaAtual(plano), total);
  const semanas = Array.from({ length: total }, (_, i) => i + 1);
  const micros = plano.macrociclo.mesociclos.flatMap((m) => m.microciclos);
  const microDa = (n: number) => micros.find((mc) => mc.semana === n);
  const completa = (n: number) => {
    const s = sessoesPrincipais(microDa(n)?.sessoes ?? []);
    return s.length > 0 && s.every((x) => sessaoConcluida(x, n, execucoes));
  };
  const meso = mesocicloAtual(plano);
  const tipoAtual = microDa(atual)?.tipo;
  const porLinha = total > 16 ? Math.ceil(total / Math.ceil(total / 16)) : total;
  const linhas: number[][] = [];
  for (let i = 0; i < semanas.length; i += porLinha) linhas.push(semanas.slice(i, i + porLinha));
  const colunas = { gridTemplateColumns: `repeat(${porLinha}, minmax(0, 1fr))` };

  const fundoDo = (n: number): React.CSSProperties => {
    const descarga = microDa(n)?.tipo === "deload";
    if (n === atual) return { background: "var(--border)", boxShadow: "inset 0 0 0 1.5px var(--ink)" };
    if (descarga) return { background: "var(--warning-fill)", opacity: n < atual ? 1 : 0.3 };
    if (n < atual) return { background: cor, opacity: completa(n) ? 1 : 0.35 };
    return { background: "var(--border)" };
  };

  return (
    <div className="rounded-[16px] border border-border bg-surface px-3.5 py-3">
      <div className="flex items-baseline justify-between gap-2 text-2xs text-ink-2">
        <span className="min-w-0 truncate">{meso ? rotuloMeso(meso) : "Seu plano"}</span>
        <span className="shrink-0">
          <b className="font-bold text-ink">
            semana {atual} de {total}
          </b>
          {tipoAtual === "deload" ? " · mais leve" : tipoAtual === "teste" ? " · de teste" : ""}
        </span>
      </div>
      <div className="mt-2 space-y-1.5" role="img" aria-label={`Semana ${atual} de ${total} do plano.`}>
        {linhas.map((linha) => (
          <div key={linha[0]}>
            <div className="grid gap-[3px]" style={colunas}>
              {linha.map((n) => (
                <span key={n} aria-hidden className="h-2 rounded-[4px]" style={fundoDo(n)} />
              ))}
            </div>
            <div className="mt-1 grid gap-[3px]" style={colunas}>
              {linha.map((n) => (
                <span
                  key={n}
                  aria-hidden
                  className={cn("tabular text-center text-2xs leading-none", n === atual ? "font-bold text-ink" : "text-ink-2")}
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div aria-hidden className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs text-ink-2">
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-[2px]" style={{ background: cor }} /> completas
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-[2px] bg-warning-fill" /> descarga
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-[2px]" style={{ boxShadow: "inset 0 0 0 1.5px var(--ink)" }} /> atual
        </span>
      </div>
    </div>
  );
}

/* ------------------------------ Barra de abas ----------------------------- */

/**
 * A BARRA DE ABAS DO PROTÓTIPO (tela 01): quatro rótulos, sem ícone, com um traço curto
 * acima de cada um. O traço da ativa acende na cor da marca e o rótulo dela escreve na
 * versão da marca que passa 4,5:1; nas outras o traço fica cinza, visível, para a barra ler
 * como quatro lugares e não como um texto solto. Estado nunca só por cor: a ativa tem traço
 * aceso E rótulo em outra cor, e o leitor de tela recebe `aria-current`.
 *
 * O fundo é mais escuro que a tela no tema escuro (e papel branco no claro), como no
 * protótipo: a barra se destaca do conteúdo sem precisar de sombra.
 */
function BarraDeAbas({
  aba,
  onAba,
  cor,
  tema,
  apagadas,
}: {
  aba: Aba;
  onAba: (a: Aba) => void;
  cor: string;
  tema: TemaAluno;
  /** abas sem conteúdo (sem plano): aparecem apagadas e não navegam */
  apagadas: Set<Aba>;
}) {
  const fundo = tema === "escuro" ? "#0A0F18" : "#FFFFFF";
  // #6E819F sobre #0A0F18 dá 4,8:1; no claro o cinza de texto da paleta já passa.
  const tintaInativa = tema === "escuro" ? "#6E819F" : "var(--ink-2)";
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 mx-auto grid max-w-md grid-cols-4 border-t border-border pb-[env(safe-area-inset-bottom)]"
      style={{ background: fundo }}
      aria-label="Navegação do app"
    >
      {ABAS.map(({ id, label }) => {
        const ativo = aba === id;
        const apagada = apagadas.has(id);
        return (
          <button
            key={id}
            type="button"
            onClick={apagada ? undefined : () => onAba(id)}
            aria-current={ativo ? "page" : undefined}
            aria-disabled={apagada || undefined}
            title={apagada ? "Disponível quando o seu treino estiver pronto" : undefined}
            className={cn(
              "flex h-[60px] flex-col items-center justify-center pb-1.5 text-2xs font-semibold leading-none",
              ativo && "text-primary-texto",
              apagada && "cursor-default opacity-50",
            )}
            style={ativo ? undefined : { color: tintaInativa }}
          >
            <span
              aria-hidden
              className={cn("mb-[5px] h-[3px] w-[18px] rounded-[2px]", !ativo && "bg-surface-soft")}
              style={ativo ? { background: cor } : undefined}
            />
            {label}
          </button>
        );
      })}
    </nav>
  );
}

/* ------------------------------- Aba: Hoje -------------------------------- */

/** Rótulo de seção do protótipo: 11 px, caixa alta, espaçado. */
function RotuloSecao({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn("mb-1.5 text-2xs font-bold uppercase tracking-[0.1em] text-ink-2", className)}>{children}</h2>;
}

function AbaHoje({
  plano,
  dia,
  cor,
  tinta,
  aluno,
  marca,
  execucoes,
  sessaoFeedbacks,
  liberacoes,
  pausa,
  onIniciar,
  onAbrir,
  dataDaPrescricao,
  declaracoes = [],
  pedidoAberto,
  ultimaAvaliacao,
  onSobreVoce,
}: {
  plano?: PlanoTreino;
  dia: ReturnType<typeof diaDoPlano> | null;
  cor: string;
  tinta: string;
  aluno: Aluno;
  marca: Marca;
  execucoes: Execucao[];
  sessaoFeedbacks: SessaoFeedback[];
  liberacoes: Liberacao[];
  /** o "não liberado" ainda em aberto, se houver */
  pausa?: Liberacao;
  /** o que o aluno já respondeu (o cartão sem treino sabe se ele parou no meio) */
  declaracoes?: DeclaracaoAluno[];
  /** o pedido de treino ainda sem resposta, se houver */
  pedidoAberto?: DeclaracaoAluno;
  /** data da avaliação mais recente, para o "recebeu a sua avaliação de ..." */
  ultimaAvaliacao?: number;
  /** abre "Conte sobre você" */
  onSobreVoce?: () => void;
  /** inicia o modo guiado para uma sessão (abre o treino guiado no lugar das abas) */
  onIniciar?: (sessao: Sessao) => void;
  /** abre a visão de uma sessão (a tela empurrada, não o guiado) */
  onAbrir?: (sessao: Sessao) => void;
  dataDaPrescricao?: (id: string) => string | undefined;
}) {
  // Alerta persistente de "treino em pausa": aparece antes de tudo quando o último
  // semáforo do aluno foi "não liberado" e não houve um novo depois. Linguagem digna
  // e não clínica; sai sozinho quando o profissional registra um novo semáforo.
  const alerta = pausa ? (
    <>
      <AlertaPausa desde={pausa.data} professor={maiuscula(apelidoProfissional(marca))} />
      <SemaforoNaoLiberado liberacao={pausa} />
    </>
  ) : null;

  if (!plano || !dia)
    return (
      <div className="flex flex-1 flex-col gap-2.5">
        {alerta}
        <TreinoACaminho
          aluno={aluno}
          marca={marca}
          cor={cor}
          tinta={tinta}
          declaracoes={declaracoes}
          pedidoAberto={pedidoAberto}
          ultimaAvaliacao={ultimaAvaliacao}
          onSobreVoce={onSobreVoce}
        />
        <FalarComProfessor marca={marca} />
      </div>
    );

  const { semana, sessoes, complementos, sessaoHoje, concluidaHoje } = dia;
  /*
   * DEPOIS DO TREINO, A TELA É OUTRA (protótipo, tela 06). Antes o início pulava para a
   * próxima sessão no instante em que a de hoje fechava, e a primeira coisa que o aluno lia
   * depois de terminar era "Começar treino". Agora: o "feito" do que ele acabou de fazer no
   * lugar do cartão de hoje, o canal com o professor, o que vem a seguir e a semana no fim.
   * Na pausa a faixa da semana também desce: ali ela é recapitulação, não o ponto de partida.
   */
  const recapitulacao = !!concluidaHoje || !!pausa;
  const destaque = concluidaHoje ?? sessaoHoje;
  const outras = sessoes.filter((s) => s.id !== destaque?.id);
  const pendentes = outras.filter((s) => !sessaoConcluida(s, semana, execucoes));
  const feitasNaSemana = outras.filter((s) => sessaoConcluida(s, semana, execucoes));
  const proximas = [...pendentes, ...feitasNaSemana];
  const feedbackDe = (s: Sessao) =>
    sessaoFeedbacks.find((f) => f.alunoId === aluno.id && f.planoId === plano.id && f.semana === semana && f.sessaoRef === s.id);
  const faixa = (semLegenda: boolean) => (
    <SemanaStrip alunoId={aluno.id} execucoes={execucoes} liberacoes={liberacoes} cor={cor} semLegenda={semLegenda} />
  );

  return (
    <div className="space-y-2.5">
      {alerta}

      {/*
        A SEMANA DO ALUNO abre a tela (protótipo, tela 01): "em que ponto da semana eu estou"
        é a pergunta que vem ANTES de "o que eu faço hoje".
      */}
      {!recapitulacao && faixa(false)}

      {!pausa && <SemaforoDoDia hoje={estadoSemaforo(aluno.id, liberacoes).hoje} />}

      {concluidaHoje ? (
        <ConcluidaHoje sessao={concluidaHoje} feedback={feedbackDe(concluidaHoje)} />
      ) : sessaoHoje ? (
        <HeroTreinoDeHoje
          sessao={sessaoHoje}
          plano={plano}
          cor={cor}
          tinta={tinta}
          variante="neutro"
          concluida={sessaoConcluida(sessaoHoje, semana, execucoes)}
          semana={semana}
          execucoes={execucoes}
          dataDaPrescricao={dataDaPrescricao}
          onIniciar={onIniciar ? () => onIniciar(sessaoHoje) : undefined}
          onAbrir={onAbrir ? () => onAbrir(sessaoHoje) : undefined}
        />
      ) : (
        <Card className="p-6 text-center text-sm text-ink-2">Sem sessões nesta semana.</Card>
      )}

      {recapitulacao && <FalarComProfessor marca={marca} />}

      {proximas.length > 0 && (
        <section className="pt-1">
          <RotuloSecao>Próximos treinos</RotuloSecao>
          <div className="space-y-1.5">
            {proximas.map((s) => {
              const feita = sessaoConcluida(s, semana, execucoes);
              return (
                <LinhaSessao
                  key={s.id}
                  sessao={s}
                  ordem={sessoes.findIndex((x) => x.id === s.id) + 1}
                  concluida={feita}
                  aSeguir={!feita && s.id === pendentes[0]?.id}
                  feitaEm={feita ? ultimoRegistroDaSessao(s, semana, execucoes) : undefined}
                  onIniciar={onAbrir ? () => onAbrir(s) : undefined}
                />
              );
            })}
          </div>
        </section>
      )}

      {complementos.length > 0 && (
        <section className="pt-1">
          <RotuloSecao>Complementos da semana</RotuloSecao>
          <div className="space-y-1.5">
            {complementos.map((s, i) => {
              const feito = sessaoConcluida(s, semana, execucoes);
              return (
                <LinhaSessao
                  key={s.id}
                  sessao={s}
                  ordem={i + 1}
                  concluida={feito}
                  complemento
                  feitaEm={feito ? ultimoRegistroDaSessao(s, semana, execucoes) : undefined}
                  onIniciar={onAbrir ? () => onAbrir(s) : undefined}
                />
              );
            })}
          </div>
        </section>
      )}

      {recapitulacao && (
        <section className="pt-1">
          <RotuloSecao>Sua semana</RotuloSecao>
          {faixa(true)}
        </section>
      )}
    </div>
  );
}

/**
 * A VISÃO DE UMA SESSÃO (protótipo, tela 02): o herói na cor da marca com "Começar treino",
 * a lista de exercícios e, no pé, as portas da sessão (orientações e o professor).
 *
 * Existe para que TODA sessão abra do mesmo jeito. Antes, a de hoje mostrava a
 * lista e as outras pulavam direto para o modo guiado: o mesmo objeto tinha
 * duas aberturas diferentes, e foi o que o Herivaldo leu como "a aba do aluno
 * não segue início, meio e fim". Agora o caminho é sempre: ver a sessão inteira
 * (início), Começar treino, um exercício por vez (meio), conclusão (fim).
 */
function VisaoSessao({
  sessao,
  plano,
  semana,
  aluno,
  marca,
  cor,
  tinta,
  execucoes,
  sessaoFeedbacks,
  onRegistrar,
  onDesfazer,
  onIniciar,
  dataDaPrescricao,
  preview,
  ehHoje,
}: {
  sessao: Sessao;
  plano: PlanoTreino;
  semana: number;
  aluno: Aluno;
  marca: Marca;
  cor: string;
  tinta: string;
  execucoes: Execucao[];
  sessaoFeedbacks: SessaoFeedback[];
  onRegistrar?: (e: Execucao) => void;
  onDesfazer?: (execId: string) => void;
  onIniciar?: () => void;
  dataDaPrescricao?: (id: string) => string | undefined;
  preview?: boolean;
  /** é a sessão de hoje? Só ela pode dizer "Hoje" no rótulo do herói */
  ehHoje: boolean;
}) {
  const concluida = sessaoConcluida(sessao, semana, execucoes);
  return (
    <div className="mt-1 space-y-2.5">
      <HeroTreinoDeHoje
        sessao={sessao}
        plano={plano}
        cor={cor}
        tinta={tinta}
        variante="marca"
        ehHoje={ehHoje}
        concluida={concluida}
        semana={semana}
        execucoes={execucoes}
        dataDaPrescricao={dataDaPrescricao}
        onIniciar={onIniciar}
      />
      <section className="pt-1">
        {/* A lista começava colada no cartão, sem nome. O título separa as duas coisas e dá
            ao olho onde voltar depois de rolar. */}
        <RotuloSecao>Sua sessão</RotuloSecao>
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
      </section>
      {concluida && (
        <ConcluidaHoje
          sessao={sessao}
          feedback={sessaoFeedbacks.find(
            (f) => f.alunoId === aluno.id && f.planoId === plano.id && f.semana === semana && f.sessaoRef === sessao.id,
          )}
        />
      )}
      {/* As portas moram AQUI, no pé da sessão (protótipo, tela 02), e não mais no início:
          a orientação é da sessão, e quem a procura está olhando a sessão. */}
      <PortasDaSessao
        fecho={sessao.fecho}
        notaIntensidade={
          temIntensidadeNaSessao(sessao)
            ? "Intensidade é a porcentagem da sua carga máxima estimada para cada exercício."
            : undefined
        }
        marca={marca}
        cor={cor}
      />
    </div>
  );
}

/**
 * A forma CURTA do rótulo de fase.
 *
 * Mesociclo nascido de fase da jornada traz "Fase N: nome longo"; o prefixo já é o
 * identificador e cabe na pílula. Bloco genérico não tem prefixo (rotuloMeso o remove de
 * propósito, porque a palavra "Fase" ali não seria verdadeira) e vai inteiro.
 */
function faseCurta(rotulo: string): string {
  return rotulo.match(/^(Fase \d+)\s*:/)?.[1] ?? rotulo;
}

/** Um azulejo do cartão de hoje: número em display e o rótulo colado embaixo. */
function AzulejoDaSessao({ valor, rotulo }: { valor: number; rotulo: string }) {
  return (
    <span className="block rounded-[10px] bg-surface-soft px-1.5 py-2 text-center">
      <b className="tabular block font-display text-base font-bold leading-none">{valor}</b>
      <span className="mt-1 block text-2xs leading-none text-ink-2">{rotulo}</span>
    </span>
  );
}

/**
 * O CARTÃO DA SESSÃO, nas duas peles do protótipo.
 *
 * "neutro" (aba Hoje, tela 01) é papel, com o botão na cor da marca: no Hoje a marca já ocupa
 * a faixa do topo, e um segundo bloco na mesma cor logo abaixo disputaria a leitura. O CORPO
 * do cartão abre a sessão inteira; o BOTÃO abre o guiado direto, no exercício em que o aluno
 * parou. São dois alvos irmãos, nunca um dentro do outro.
 *
 * "marca" (sessão aberta, tela 02) é o herói na cor do professor, sem brilho nem figura: a
 * decoração empurrava o texto para a esquerda (`pr-24`) e competia com o nome da sessão.
 *
 * Cada número só aparece com dado real: séries só quando TODO bloco de força declara a sua, e
 * minutos só quando o aeróbio traz alvo. O "~45 minutos" do protótipo não entra: somar tempo
 * de musculação seria número inventado.
 */
function HeroTreinoDeHoje({
  sessao,
  plano,
  cor,
  tinta,
  concluida,
  semana,
  execucoes,
  dataDaPrescricao,
  onIniciar,
  onAbrir,
  ehHoje = true,
  variante = "marca",
}: {
  sessao: Sessao;
  plano: PlanoTreino;
  cor: string;
  tinta: string;
  concluida: boolean;
  /** semana e execuções: sem elas não dá para dizer QUANTOS já foram feitos */
  semana: number;
  execucoes: Execucao[];
  dataDaPrescricao?: (id: string) => string | undefined;
  /** abre o treino guiado */
  onIniciar?: () => void;
  /** abre a sessão inteira (só no cartão neutro do Hoje) */
  onAbrir?: () => void;
  /** a sessão é a de hoje (o rótulo só diz "Hoje" quando é verdade) */
  ehHoje?: boolean;
  variante?: "marca" | "neutro";
}) {
  const nExercicios = sessao.blocos.length;
  // Feito = todas as séries registradas (blocoCompleto), não "tem algum registro".
  const nFeitos = sessao.blocos.filter((b) => blocoCompleto(b, execucoes, semana)).length;
  const parcial = nFeitos > 0 && nFeitos < nExercicios;
  // Minutos DECLARADOS (soma do alvo aeróbio). Sem aeróbio com alvo, não há
  // minuto nenhum a mostrar: somar tempo de musculação seria número inventado.
  const minutos = minutosDeclarados(sessao);
  // SÉRIES da sessão: só quando todo bloco de força declara a sua. Um total parcial
  // ("13 séries" contando 3 de 5 exercícios) seria pior que não mostrar.
  const blocosForca = sessao.blocos.filter((b) => b.tipo === "forca");
  const seriesDeclaradas = blocosForca.every((b) => (b as { seriesAlvo?: number }).seriesAlvo != null)
    ? blocosForca.reduce((n, b) => n + ((b as { seriesAlvo?: number }).seriesAlvo ?? 0), 0)
    : null;
  const numeros: { valor: number; rotulo: string }[] = [
    { valor: nExercicios, rotulo: nExercicios === 1 ? "exercício" : "exercícios" },
    ...(seriesDeclaradas != null && seriesDeclaradas > 0
      ? [{ valor: seriesDeclaradas, rotulo: seriesDeclaradas === 1 ? "série" : "séries" }]
      : []),
    ...(minutos ? [{ valor: minutos, rotulo: minutos === 1 ? "minuto" : "minutos" }] : []),
  ];
  const origemIds = Array.from(new Set(sessao.blocos.map((b) => b.origemPrescricaoId).filter(Boolean) as string[]));
  const personalizadoData = origemIds.length === 1 ? dataDaPrescricao?.(origemIds[0]) : undefined;
  // "Fase 2" só quando a fase é verdadeira (mesociclo nascido de fase da jornada); bloco
  // genérico não ganha uma fase inventada, e o selo fica só com a semana.
  const meso = mesocicloAtual(plano);
  const fase = meso ? faseCurta(rotuloMeso(meso)) : "";
  const temFase = /^Fase \d+$/.test(fase);

  const botao = onIniciar && (
    <button
      type="button"
      onClick={onIniciar}
      // Sobre a cor da marca o botao e papel; sobre papel ele e a cor da marca. Nos dois
      // casos a tinta vem do par verificado, nunca de um branco fixo.
      className="mt-3 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-full px-4 text-sm font-bold"
      style={variante === "marca" ? { background: tinta, color: cor } : { background: cor, color: tinta }}
    >
      {concluida ? (
        <>
          <Check className="h-4 w-4" strokeWidth={3} aria-hidden /> Revisar o treino
        </>
      ) : parcial ? (
        /* QUANTOS JÁ FORAM, no próprio botão: "Continuar · 1 de 5 feitos". O "2 de 5" do
           protótipo era ambíguo (exercício atual ou feitos?); "feitos" diz qual. */
        <>
          <Play className="h-4 w-4" aria-hidden /> Continuar · {nFeitos} de {nExercicios} feitos
        </>
      ) : (
        <>
          <Play className="h-4 w-4" aria-hidden /> Começar treino
        </>
      )}
    </button>
  );

  const selo = personalizadoData && (
    <p className={cn("mt-2 inline-flex items-center gap-1 text-2xs", variante === "marca" ? "opacity-90" : "text-ink-2")}>
      <Sparkles className="h-3 w-3" aria-hidden /> feito pra você {personalizadoData}
    </p>
  );

  if (variante === "marca") {
    const rotulo = [ehHoje ? "Hoje" : null, temFase ? fase : null, `semana ${semana}`, concluida ? "feito" : null]
      .filter(Boolean)
      .join(" · ");
    return (
      <div className="rounded-card p-4" style={{ background: cor, color: tinta }}>
        <div className="text-2xs font-bold uppercase tracking-[0.1em] opacity-[.85]">{rotulo}</div>
        <h1 className="mt-1 font-display text-[21px] font-bold leading-[1.1] tracking-[-0.02em]">{sessao.nome}</h1>
        {sessao.foco && !sessao.nome.toLowerCase().includes(sessao.foco.toLowerCase()) && (
          <p className="mt-0.5 text-xs opacity-[.85]">{sessao.foco}</p>
        )}
        {/* Os números EM LINHA (protótipo, tela 02): na sessão aberta a lista vem logo
            abaixo, e os azulejos do Hoje repetiriam o que ela já mostra. */}
        <p className="mt-2.5 flex flex-wrap gap-x-3.5 gap-y-1 text-xs">
          {numeros.map((n) => (
            <span key={n.rotulo}>
              <b className="tabular font-display text-lg font-bold">{n.valor}</b> {n.rotulo}
            </span>
          ))}
        </p>
        {selo}
        {botao}
      </div>
    );
  }

  // As MINIATURAS da sessão, na ordem: foto do catálogo na força e a foto da modalidade no
  // aeróbio. Feito ganha borda verde, o próximo ganha borda na cor da marca, o resto fica
  // apagado, e o que não cabe vira "+N". Fotos próprias, nunca emprestadas.
  const miniaturas = sessao.blocos
    .map((b) => {
      if (b.tipo === "aerobio") {
        const m = modalidadeDoBloco(b);
        return m ? { bloco: b, src: modalidadeImagem(m.id) } : null;
      }
      const ex = b.exercicioSlug ? getExercise(b.exercicioSlug) : undefined;
      return ex?.imagem ? { bloco: b, src: ex.imagem } : null;
    })
    .filter((x): x is { bloco: BlocoSessao; src: string } => !!x)
    .slice(0, 4);
  const sobrando = sessao.blocos.length - miniaturas.length;
  const primeiroPendente = sessao.blocos.find((b) => !blocoCompleto(b, execucoes, semana))?.id;

  return (
    <div className="rounded-[18px] border border-border bg-surface p-3.5 text-ink">
      <button
        type="button"
        onClick={onAbrir}
        disabled={!onAbrir}
        aria-label={onAbrir ? `Ver a sessão inteira: ${sessao.nome}` : undefined}
        className="block w-full rounded-control text-left disabled:cursor-default"
      >
        <span className="flex items-center justify-between gap-2">
          <span className="text-2xs font-semibold uppercase tracking-[0.1em] text-ink-2">
            {concluida ? "Treino de hoje · feito" : "Treino de hoje"}
          </span>
          {/* A fase e a semana na forma CURTA ("F2 · S7"), escritas na marca que passa 4,5:1.
              O nome inteiro da fase fica no título, para quem parar o dedo em cima. */}
          <span className="tabular shrink-0 text-2xs font-bold text-primary-texto" title={meso ? rotuloMeso(meso) : undefined}>
            {temFase ? `${fase.replace("Fase ", "F")} · ` : ""}S{semana}
          </span>
        </span>
        <span className="mt-1.5 block font-display text-lg font-bold leading-tight tracking-[-0.01em]">{sessao.nome}</span>
        {sessao.foco && !sessao.nome.toLowerCase().includes(sessao.foco.toLowerCase()) && (
          <span className="mt-0.5 block text-xs text-ink-2">{sessao.foco}</span>
        )}

        {/* A grade tem o número REAL de colunas: com dois números, duas colunas. Três colunas
            fixas deixavam um buraco onde o número não existia. */}
        <span
          className="mt-2.5 grid gap-1.5"
          style={{ gridTemplateColumns: `repeat(${numeros.length}, minmax(0, 1fr))` }}
        >
          {numeros.map((n) => (
            <AzulejoDaSessao key={n.rotulo} valor={n.valor} rotulo={n.rotulo} />
          ))}
        </span>

        {miniaturas.length > 0 && (
          <span className="mt-2.5 flex gap-[5px]" aria-hidden>
            {miniaturas.map(({ bloco, src }, i) => {
              const feito = blocoCompleto(bloco, execucoes, semana);
              const proximo = !feito && bloco.id === primeiroPendente;
              return (
                <img
                  key={bloco.id + "-" + i}
                  src={withBase(src)}
                  alt=""
                  loading="lazy"
                  className={cn(
                    "h-11 w-11 shrink-0 rounded-[10px] bg-surface-soft object-cover",
                    (feito || proximo) && "border-2",
                    !feito && !proximo && "opacity-60",
                  )}
                  style={feito ? { borderColor: "var(--success-fill)" } : proximo ? { borderColor: cor } : undefined}
                />
              );
            })}
            {sobrando > 0 && (
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[10px] bg-surface-soft text-2xs font-bold text-ink-2">
                +{sobrando}
              </span>
            )}
          </span>
        )}
        {selo}
      </button>
      {botao}
    </div>
  );
}

/**
 * Lista de exercícios do dia: linha fechada com foto, nome, dose e o estado à direita
 * ("feito", "série 2 de 3"). Tocar abre a linha, com o registro e a porta da folha.
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
    <div className="space-y-1.5">
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
            feitas={seriesFeitas(execucoes, semana, b.id)}
            onRegistrar={onRegistrar}
            onDesfazer={onDesfazer}
            preview={preview}
            emGrupo={emGrupo}
          />
        );
        if (seg.tipo === "grupo") {
          const info = getMetodo(seg.metodo);
          return (
            <div key={seg.grupoId} className="rounded-[16px] border-2 p-1.5" style={{ borderColor: cor }}>
              <div className="mb-1 flex flex-wrap items-center gap-2 px-1.5 pt-0.5">
                <span className="rounded-full px-2 py-0.5 text-2xs font-bold" style={{ background: cor, color: tinta }}>
                  {info?.nome}
                </span>
                {info?.descricao && <span className="min-w-0 flex-1 text-2xs leading-tight text-ink-2">{info.descricao}</span>}
              </div>
              <div className="space-y-1.5">{seg.blocos.map((b) => linha(b, true))}</div>
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
 * O par de portas do pé da sessão: a orientação escrita e o canal com o professor.
 *
 * Lado a lado, em grade de dois (protótipo, tela 02): cada uma cabe num quadrado, e o texto
 * longo da orientação só aparece quando o aluno pede, abrindo embaixo das duas.
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
  const whats = whatsDoProfissional(marca);
  if (!temOrientacao && !whats) return null;

  const molde =
    "flex min-h-[64px] w-full flex-col items-start rounded-control border border-border bg-surface px-3 py-2.5 text-left transition-colors hover:bg-surface-soft";
  const duas = temOrientacao && !!whats;

  return (
    <div className={cn("grid gap-1.5 pt-0.5", duas ? "grid-cols-2" : "grid-cols-1")}>
      {temOrientacao && (
        <button type="button" onClick={() => setOrientacaoAberta((v) => !v)} aria-expanded={orientacaoAberta} className={molde}>
          <ClipboardList className="h-4 w-4 text-primary-texto" aria-hidden />
          <span className="mt-1 text-xs font-bold text-ink">Orientações da sessão</span>
          <span className="text-2xs text-ink-2">{orientacaoAberta ? "Toque para fechar" : "Diretrizes e informações"}</span>
        </button>
      )}
      {/* A APARÊNCIA ACOMPANHA A DISPONIBILIDADE: sem telefone cadastrado não existe porta
          nenhuma aqui, em vez de um cartão que não faz nada ao ser tocado. */}
      {whats && (
        <a href={whats.href} target="_blank" rel="noopener noreferrer" className={molde}>
          <MessageCircle className="h-4 w-4 text-primary-texto" aria-hidden />
          <span className="mt-1 text-xs font-bold text-ink">Falar com {apelidoProfissional(marca)}</span>
          <span className="text-2xs text-ink-2">Tire dúvidas e receba apoio</span>
        </a>
      )}
      {/* Colado às portas e ocupando as duas colunas: painel que flutua longe do gatilho faz
          o leitor conferir de onde aquele texto saiu. */}
      {orientacaoAberta && (
        <div
          className={cn("rounded-control border border-border bg-surface-soft p-3", duas && "col-span-2")}
          style={{ borderLeftColor: cor, borderLeftWidth: 3 }}
        >
          {fecho && <p className="text-xs leading-relaxed text-ink-2">{fecho}</p>}
          {notaIntensidade && <p className={cn("text-xs leading-relaxed text-ink-2", fecho && "mt-2")}>{notaIntensidade}</p>}
        </div>
      )}
    </div>
  );
}

/**
 * Uma sessão da semana na lista do Hoje (protótipo, tela 01): selo com a letra, nome e a meta.
 *
 * A meta nunca inventa dia: o plano não tem dia da semana por sessão, então o "sexta" do
 * protótipo vira "a seguir" na próxima pendente, e o dia só aparece onde ele é FATO, na sessão
 * feita ("feita · seg", do último registro). O complemento diz a dose e "no dia de um treino",
 * que é o que o modelo diz dele (o "em qualquer dia" do protótipo contradiz o plano).
 */
function LinhaSessao({
  sessao,
  ordem,
  concluida,
  aSeguir,
  feitaEm,
  complemento,
  onIniciar,
}: {
  sessao: Sessao;
  /** posição da sessão na semana, usada quando o nome não traz letra */
  ordem: number;
  concluida: boolean;
  aSeguir?: boolean;
  /** quando a sessão fechou (último registro), para o dia da semana verdadeiro */
  feitaEm?: number;
  complemento?: boolean;
  onIniciar?: () => void;
}) {
  const n = sessao.blocos.length;
  const iso = !!complemento && n > 0 && sessao.blocos.every((b) => b.tipo === "isometrico");
  const letra = selo(sessao, ordem);
  const minutos = minutosDeclarados(sessao);
  const meta = concluida
    ? ["feita", feitaEm != null ? diaCurto(feitaEm) : null].filter(Boolean).join(" · ")
    : complemento
      ? [n === 1 ? doseCurta(sessao.blocos[0]) : contarExercicios(n), "no dia de um treino"].filter(Boolean).join(" · ")
      : [aSeguir ? "a seguir" : null, contarExercicios(n), minutos ? `${minutos} min` : null].filter(Boolean).join(" · ");
  return (
    <button
      onClick={onIniciar}
      disabled={!onIniciar}
      className="flex w-full items-center gap-2.5 rounded-control border border-border bg-surface px-3 py-[9px] text-left transition-colors hover:bg-surface-soft disabled:cursor-default disabled:hover:bg-surface"
    >
      <span
        className={cn(
          "grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[9px] font-bold",
          concluida
            ? "bg-success-tint text-success"
            : iso
              ? "bg-analysis-tint text-2xs text-analysis-text"
              : "bg-surface-soft text-xs text-ink-2",
        )}
      >
        {concluida ? <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden /> : iso ? "ISO" : letra}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12.5px] font-bold text-ink">{sessao.nome}</span>
        <span className="block truncate text-2xs text-ink-2">{meta}</span>
      </span>
      {onIniciar && <ChevronRight className="h-4 w-4 shrink-0 text-ink-2" aria-hidden />}
    </button>
  );
}

/**
 * O "FEITO" DO QUE ELE ACABOU DE FAZER (protótipo, tela 06): borda verde, o nome da sessão e,
 * de cada número, só o que foi registrado (a duração é a do cronômetro, o esforço é o que
 * ele marcou). Aparece mesmo sem o fechamento do guiado: quem registrou tudo pela lista
 * também terminou o treino, e antes nunca via isso.
 */
function ConcluidaHoje({ sessao, feedback }: { sessao: Sessao; feedback?: SessaoFeedback }) {
  const partes = [
    sessao.nome,
    feedback?.duracaoMin != null ? `${feedback.duracaoMin} min` : null,
    feedback?.pse != null ? `esforço ${feedback.pse}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <div className="animate-entra rounded-[18px] border bg-surface p-3.5" style={{ borderColor: "var(--success)" }}>
      <div className="flex items-center gap-2.5">
        <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full bg-success-tint text-success">
          <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
        </span>
        <span className="min-w-0">
          <b className="block font-display text-[15px] font-bold leading-tight text-ink">Treino concluído</b>
          <span className="block truncate text-[11.5px] text-ink-2">{partes}</span>
        </span>
      </div>
      {feedback?.observacao && (
        <p className="mt-2.5 border-t border-border pt-2.5 text-[11.5px] leading-[1.45] text-ink-2">
          Recado registrado. Seu professor vê no próximo acesso.
        </p>
      )}
    </div>
  );
}

/**
 * "Falar com o {professor}" (protótipo, telas 06, 12 e 13).
 *
 * A APARÊNCIA ACOMPANHA A DISPONIBILIDADE. Antes isto era um `<div>` sem ação nenhuma
 * com cara de cartão tocável, e o Filipe reportou exatamente isso: clicou e não aconteceu
 * nada. Com telefone cadastrado, é um link de verdade para o WhatsApp, com o número escrito
 * (é dado real, e ajuda quem prefere ligar) e a seta. Sem telefone, some a seta e some o
 * realce: vira linha de informação, que é o que ele é.
 */
function FalarComProfessor({ marca }: { marca: Marca }) {
  const primeiro = apelidoProfissional(marca);
  const whats = whatsDoProfissional(marca);

  const miolo = (
    <>
      <span className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-control bg-success-tint text-success">
        <MessageCircle className="h-4 w-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block truncate text-[13px] font-bold text-ink">Falar com {primeiro}</span>
        <span className="block text-2xs text-ink-2">
          {whats ? `WhatsApp · ${whats.legivel}` : "Ao terminar o treino você registra o esforço e manda um recado."}
        </span>
      </span>
    </>
  );

  if (!whats) {
    return <div className="flex items-center gap-3 rounded-[16px] border border-border bg-surface px-3.5 py-3">{miolo}</div>;
  }

  return (
    <a
      href={whats.href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex min-h-[56px] items-center gap-3 rounded-[16px] border border-border bg-surface px-3.5 py-3 transition-colors hover:bg-surface-soft"
    >
      {miolo}
      <ArrowRight className="h-4 w-4 shrink-0 text-primary-texto" aria-hidden />
    </a>
  );
}

/**
 * O SEMÁFORO DO DIA na tela do aluno (protótipo, tela 01).
 *
 * O app só mostrava o estado VERMELHO (o `AlertaPausa`), então o aluno liberado abria a
 * tela sem nenhuma confirmação de que podia treinar: o silêncio servia de "sim", e é
 * justamente o que o semáforo existe para não fazer. Os três estados aparecem, com a
 * mesma fonte do painel do professor (`estadoSemaforo`), e o subtítulo carrega o que foi de
 * fato registrado (hora do check-in e os ajustes anotados), nunca uma frase genérica.
 *
 * O "Refazer" do protótipo não entra: quem registra o semáforo é o profissional, e o aluno
 * não tem fluxo de check-in. Um "Refazer" sem ação atrás seria o cartão com cara de tocável
 * que não faz nada. O vermelho tem cartão próprio (`SemaforoNaoLiberado`).
 */
function SemaforoDoDia({ hoje }: { hoje?: Liberacao }) {
  if (!hoje || hoje.resultado === "vermelho") return null;
  const verde = hoje.resultado === "verde";
  const hora = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(hoje.data));
  // Os ajustes ANOTADOS no amarelo: é o que muda a sessão dele hoje, e é dado registrado.
  const ajustes = hoje.ajustes.map((a) => a.acao).filter(Boolean);
  return (
    <div className="flex items-center gap-2.5 rounded-[16px] border border-border bg-surface px-3.5 py-3">
      <span
        aria-hidden
        className="h-3 w-3 shrink-0 rounded-full"
        style={{
          background: verde ? "var(--success-fill)" : "var(--warning-fill)",
          boxShadow: `0 0 0 4px ${verde ? "var(--success-tint)" : "var(--warning-tint)"}`,
        }}
      />
      <span className="min-w-0 flex-1">
        <b className="block text-[13px] text-ink">{verde ? "Liberado para treinar hoje" : "Liberado com ajuste"}</b>
        <span className="block truncate text-[11.5px] text-ink-2">
          Check-in {hora}
          {ajustes.length > 0 ? ` · ${ajustes[0]}` : ""}
        </span>
      </span>
    </div>
  );
}

/**
 * O SEMÁFORO VERMELHO (protótipo, tela 13): borda e título no tom de perigo e o ponto que
 * pulsa, para o "não liberado" não passar por mais um cartão da lista. O subtítulo é o que
 * o profissional registrou (o primeiro ajuste anotado), nunca uma medida inventada como a
 * "pressão 160/100" do protótipo; o pulso é neutralizado pelo movimento reduzido do aparelho.
 */
function SemaforoNaoLiberado({ liberacao }: { liberacao: Liberacao }) {
  const motivo = liberacao.ajustes.map((a) => a.acao).filter(Boolean)[0];
  return (
    <div className="flex items-center gap-2.5 rounded-[16px] border bg-surface px-3.5 py-3" style={{ borderColor: "var(--danger)" }}>
      <span
        aria-hidden
        className="h-3 w-3 shrink-0 animate-pulso rounded-full"
        style={{ background: "var(--danger-fill)", boxShadow: "0 0 0 4px var(--danger-tint)" }}
      />
      <span className="min-w-0 flex-1">
        <b className="block text-[13px] text-danger">Não liberado em {fmtDiaMes(liberacao.data)}</b>
        <span className="line-clamp-2 block text-[11.5px] leading-snug text-ink-2">
          {motivo ? `${motivo} · ` : ""}procure orientação antes de treinar
        </span>
      </span>
    </div>
  );
}

/*
 * O ALERTA DE TREINO PAUSADO (protótipo, tela 13), em âmbar e não em vermelho: é uma pausa
 * combinada, e o vermelho fica para o cartão do semáforo logo abaixo, que é o fato clínico.
 * Texto digno e não clínico. Ele NÃO promete "o treino volta a aparecer": nesta versão o
 * treino continua visível durante a pausa (bloquear é conduta, e é decisão do Filipe), então
 * a frase pede a conversa antes do próximo treino, que é o que ela sempre pediu.
 */
function AlertaPausa({ desde, professor }: { desde: number; professor: string }) {
  return (
    <div className="rounded-[16px] border border-warning/35 bg-warning-tint px-3.5 py-3">
      <div className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-[0.1em] text-warning">
        <PauseCircle className="h-3 w-3" aria-hidden /> Treino pausado
      </div>
      <p className="mt-1 text-[12.5px] leading-[1.45] text-ink">
        Por orientação de {professor}, seu treino está pausado desde {fmtDiaMes(desde)} até a próxima conversa. Fale com ele
        antes do próximo treino.
      </p>
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
  feitas,
  onRegistrar,
  onDesfazer,
  preview,
  emGrupo,
}: {
  bloco: BlocoSessao;
  /** posição do exercício na sessão (vai para o leitor de tela) */
  ordem: number;
  cor: string;
  tinta: string;
  semana: number;
  planoId: string;
  alunoId: string;
  sessaoRef: string;
  feitas: Execucao[];
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

  // Miniatura 46px: foto real do exercício, foto da modalidade no aeróbio, ou o selo de
  // ícone quando não há imagem (nunca empresta a foto de outro exercício).
  const leading =
    !aerobio && ex?.imagem && thumbOk ? (
      <img
        src={withBase(ex.imagem)}
        alt=""
        loading="lazy"
        onError={() => setThumbOk(false)}
        className="h-[46px] w-[46px] shrink-0 rounded-[10px] bg-surface-soft object-cover"
      />
    ) : aerobio && modalidade && modImgOk ? (
      <img
        src={withBase(modalidadeImagem(modalidade.id))}
        alt=""
        loading="lazy"
        onError={() => setModImgOk(false)}
        className="h-[46px] w-[46px] shrink-0 rounded-[10px] bg-surface-soft object-cover"
      />
    ) : (
      <span className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-[10px] bg-surface-soft" style={{ color: cor }}>
        {aerobio ? <IconeAerobio className="h-5 w-5" /> : <Dumbbell className="h-5 w-5" />}
      </span>
    );

  const feito = blocoCompleto(bloco, feitas, semana);
  const total = totalSeriesDe(bloco);
  const parcial = !feito && feitas.length > 0;
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
    <div
      className="overflow-hidden rounded-[14px] border bg-surface"
      // Em andamento, a linha inteira ganha a borda da marca (protótipo): é o exercício em
      // que o aluno está, e ele precisa achá-lo de relance numa lista de cinco.
      style={{ borderColor: parcial ? cor : "var(--border)" }}
    >
      {/* A LINHA FECHADA. Foto, nome e dose; à direita, o ESTADO em palavra ("feito",
          "série 2 de 3"), que não depende só de cor. A seta pequena existe porque a linha
          abre: sem ela, o toque vira adivinhação. */}
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        className="flex min-h-[62px] w-full items-center gap-2.5 p-2 text-left transition-colors hover:bg-surface-soft"
      >
        {leading}
        <span className="min-w-0 flex-1">
          <span className={cn("block truncate text-[12.5px] font-bold", feito ? "text-ink-2" : "text-ink")}>
            <span className="sr-only">Exercício {ordem}: </span>
            {nomeDoBloco(bloco)}
          </span>
          {dose && <span className="tabular block truncate text-2xs text-ink-2">{dose}</span>}
        </span>
        {feito ? (
          <span className="inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap text-2xs font-bold text-success">
            feito <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
          </span>
        ) : parcial ? (
          <span className="tabular shrink-0 whitespace-nowrap text-2xs font-bold text-primary-texto">
            série {Math.min(feitas.length + 1, total)} de {total}
          </span>
        ) : intensidade ? (
          <span
            title={intensidadeCrua}
            className="shrink-0 whitespace-nowrap rounded-full bg-surface-soft px-2 py-0.5 text-2xs font-semibold text-ink-2"
          >
            {intensidade}
          </span>
        ) : null}
        <ChevronDown
          className={cn("h-3.5 w-3.5 shrink-0 text-ink-2 transition-transform", aberto && "rotate-180")}
          aria-hidden
        />
      </button>

      {aberto && (
        <div className="border-t border-border px-2.5 pb-2.5 pt-2">
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
              className="mt-2 inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-border px-3.5 text-xs font-semibold text-ink transition-colors hover:bg-surface-soft"
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden style={{ color: cor }} />
              Como executar
            </button>
          )}

          <RegistroBloco
            bloco={bloco}
            cor={cor}
            tinta={tinta}
            semana={semana}
            planoId={planoId}
            alunoId={alunoId}
            sessaoRef={sessaoRef}
            feitas={feitas}
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
          tinta={tinta}
          observacao={bloco.observacao}
          onClose={fecharSheet}
        />
      )}
    </div>
  );
}

/* ------------------------------ Aba: Treinos ------------------------------ */

/**
 * "Seus treinos" (protótipo, tela 07): o plano em uma linha, o trilho das semanas, as sessões
 * desta semana, os complementos e quem monta o treino.
 *
 * O trilho de fases em pílulas e a pílula de tipo de semana saíram: o cabeçalho do trilho
 * já diz a fase e "semana N de M · mais leve". As fases inteiras moram no Perfil, e o rodapé
 * "Aluno: objetivo · nível" saiu porque isso é o "Sobre você".
 */
function AbaTreinos({
  plano,
  cor,
  tinta,
  marca,
  execucoes,
  feedbacks,
  onAbrir,
}: {
  plano?: PlanoTreino;
  cor: string;
  tinta: string;
  marca: Marca;
  execucoes: Execucao[];
  feedbacks: SessaoFeedback[];
  onAbrir?: (s: Sessao) => void;
}) {
  if (!plano) return <SemPlano />;

  const semana = semanaAtual(plano);
  const meso = mesocicloAtual(plano);
  const micro = plano.macrociclo.mesociclos.flatMap((m) => m.microciclos).find((mc) => mc.semana === semana);
  const sessoes = sessoesPrincipais(micro?.sessoes ?? []);
  const complementos = complementosDe(micro?.sessoes ?? []);
  const idxHoje = sessaoDeHojeIndex(plano, execucoes);
  const hojeId = (micro?.sessoes ?? [])[idxHoje]?.id;
  const concluidasNaSemana = sessoes.filter((s) => sessaoConcluida(s, semana, execucoes)).length;
  const semanaFechada = sessoes.length > 0 && concluidasNaSemana === sessoes.length;
  // Próxima fase, para a nota do fim da semana. Só existe se houver mesociclo
  // depois do atual; sem isso, a frase não aparece (nada de fase inventada).
  const mesos = plano.macrociclo.mesociclos;
  const idxMeso = meso ? mesos.findIndex((m) => m.id === meso.id) : -1;
  const proxMeso = idxMeso >= 0 ? mesos[idxMeso + 1] : undefined;
  // O MODELO por nome curto ("Linear"), só quando o plano o declara: um plano antigo sem
  // `modeloId` cairia no primeiro modelo da lista, que seria um rótulo falso.
  const modelo = plano.modeloId ? maiuscula(getModelo(plano.modeloId).nome.replace(/^Periodização\s+/i, "")) : null;
  const subtitulo = [
    modelo,
    `${plano.semanas} ${plano.semanas === 1 ? "semana" : "semanas"}`,
    rotuloFrequencia(plano),
  ]
    .filter(Boolean)
    .join(" · ");

  const metaDa = (s: Sessao, hoje: boolean, feita: boolean): string => {
    const n = s.blocos.length;
    const minutos = minutosDeclarados(s);
    if (feita) {
      const fb = feedbacks.find((f) => f.planoId === plano.id && f.semana === semana && f.sessaoRef === s.id);
      const quando = ultimoRegistroDaSessao(s, semana, execucoes);
      const partes = [
        quando != null ? diaCurto(quando) : null,
        fb?.duracaoMin != null ? `${fb.duracaoMin} min` : null,
        fb?.pse != null ? `esforço ${fb.pse}` : null,
      ].filter(Boolean);
      return partes.length ? partes.join(" · ") : contarExercicios(n);
    }
    return [hoje ? "hoje" : null, contarExercicios(n), minutos ? `${minutos} min` : null].filter(Boolean).join(" · ");
  };

  return (
    <div className="space-y-2.5">
      <div>
        <h1 className="font-display text-[22px] font-bold leading-[1.1] tracking-[-0.02em] text-ink">Seus treinos</h1>
        <p className="mt-1 text-[12.5px] text-ink-2">{subtitulo}</p>
      </div>

      <TrilhoDeSemanas plano={plano} cor={cor} execucoes={execucoes} />

      <section className="pt-1.5">
        <RotuloSecao className="font-semibold">Esta semana</RotuloSecao>
        {sessoes.length === 0 ? (
          <Card className="p-6 text-center text-sm text-ink-2">Sem sessões nesta semana.</Card>
        ) : (
          <div className="space-y-2">
            {sessoes.map((s, i) => {
              const feita = sessaoConcluida(s, semana, execucoes);
              const hoje = s.id === hojeId;
              return (
                <CardSessaoPlano
                  key={s.id}
                  sessao={s}
                  ordem={i + 1}
                  cor={cor}
                  tinta={tinta}
                  hoje={hoje}
                  concluida={feita}
                  meta={metaDa(s, hoje, feita)}
                  onIniciar={onAbrir ? () => onAbrir(s) : undefined}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Os complementos aparecem aqui também: esta é a aba do plano da semana, e eles fazem
          parte dela. Contados como complemento, nunca como dia a mais. */}
      {complementos.length > 0 && (
        <section className="pt-1">
          <RotuloSecao className="font-semibold">Complementos</RotuloSecao>
          <div className="space-y-1.5">
            {complementos.map((s, i) => {
              const feito = sessaoConcluida(s, semana, execucoes);
              return (
                <LinhaSessao
                  key={s.id}
                  sessao={s}
                  ordem={i + 1}
                  concluida={feito}
                  complemento
                  feitaEm={feito ? ultimoRegistroDaSessao(s, semana, execucoes) : undefined}
                  onIniciar={onAbrir ? () => onAbrir(s) : undefined}
                />
              );
            })}
          </div>
        </section>
      )}

      {semanaFechada && (
        <div className="rounded-[16px] border border-border bg-surface-soft px-3.5 py-3">
          <p className="text-xs leading-relaxed text-ink-2">
            Semana {semana} concluída. {maiuscula(apelidoProfissional(marca))} revisa o seu registro
            {proxMeso ? ` e libera a fase ${rotuloMeso(proxMeso)}.` : " e ajusta o próximo passo."}
          </p>
        </div>
      )}

      <div className="pt-1">
        <ProfessorCard marca={marca} cor={cor} tinta={tinta} />
      </div>
    </div>
  );
}

/**
 * Sessão da semana na aba Treinos (protótipo, tela 07): selo com a letra, nome, a meta e o
 * estado à direita. A de hoje tem selo e borda na cor da marca e a pílula "Começar"; a feita
 * tem a pílula "feita"; a que falta tem a seta, no lugar do dia da semana que o plano não tem.
 */
function CardSessaoPlano({
  sessao,
  ordem,
  cor,
  tinta,
  hoje,
  concluida,
  meta,
  onIniciar,
}: {
  sessao: Sessao;
  /** posição da sessão na semana, usada quando o nome não traz letra */
  ordem: number;
  cor: string;
  tinta: string;
  hoje: boolean;
  concluida: boolean;
  /** a linha de baixo, só com dado real */
  meta: string;
  onIniciar?: () => void;
}) {
  const letra = selo(sessao, ordem);
  const comecarAgora = hoje && !concluida;

  return (
    <div
      className="flex items-center gap-3 rounded-[16px] border bg-surface px-3.5 py-3"
      style={{ borderColor: comecarAgora ? cor : "var(--border)" }}
    >
      <button
        type="button"
        onClick={onIniciar}
        disabled={!onIniciar}
        aria-label={onIniciar ? `Abrir ${sessao.nome}` : undefined}
        className="flex min-h-[44px] min-w-0 flex-1 items-center gap-3 rounded-control text-left disabled:cursor-default"
      >
        {/* Selo + nome + meta: UM alvo só, do tamanho do cartão. */}
        <span
          className={cn(
            "grid h-[38px] w-[38px] shrink-0 place-items-center rounded-control font-display text-[15px] font-bold",
            !comecarAgora && "bg-surface-soft text-ink-2",
          )}
          style={comecarAgora ? { background: cor, color: tinta } : undefined}
        >
          {letra}
        </span>
        <span className="min-w-0 flex-1 text-left">
          <span className="block truncate text-[13px] font-bold text-ink">{sessao.nome}</span>
          <span className="block truncate text-2xs text-ink-2">{meta}</span>
        </span>
        {/* Sem "Começar" nem "feita" ao lado, a seta é a marca de que o cartão abre. */}
        {onIniciar && !comecarAgora && !concluida && <ChevronRight className="h-4 w-4 shrink-0 text-ink-2" aria-hidden />}
      </button>
      {concluida && (
        <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-success-tint px-[9px] py-[5px] text-2xs font-bold text-success">
          feita <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
        </span>
      )}
      {onIniciar && comecarAgora && (
        <button type="button" onClick={onIniciar} className="-my-1 inline-flex min-h-[44px] shrink-0 items-center rounded-full">
          <span className="rounded-full px-3 py-1.5 text-xs font-bold" style={{ background: cor, color: tinta }}>
            Começar
          </span>
        </button>
      )}
    </div>
  );
}

/**
 * QUEM MONTA O TREINO (protótipo, telas 07 e 09).
 *
 * Três coisas na mesma linha, e cada uma responde a uma pergunta diferente: a FOTO diz quem
 * é a pessoa, o NOME com o CREF diz quem responde tecnicamente, e a LOGO diz sob que marca.
 * O nome é o da marca: a `Marca` não tem o nome pessoal do profissional separado, e escrever
 * um nome de pessoa que o dado não tem seria inventar.
 *
 * `rotulo` muda por tela porque o contexto muda: na aba Treinos ele apresenta quem montou
 * aquele plano; no Perfil ele é a ficha de contato do profissional.
 */
function ProfessorCard({
  marca,
  cor,
  tinta,
  rotulo = "Quem monta o seu treino",
}: {
  marca: Marca;
  cor: string;
  tinta: string;
  rotulo?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[16px] border border-border bg-surface px-3.5 py-3">
      {marca.fotoDataUrl ? (
        <img src={marca.fotoDataUrl} alt="" className="h-10 w-10 shrink-0 rounded-control object-cover" />
      ) : (
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-control font-display text-sm font-bold"
          style={{ background: cor, color: tinta }}
        >
          {iniciaisDe(marca.nome)}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="text-2xs text-ink-2">{rotulo}</div>
        <div className="truncate text-[13px] font-bold text-ink">
          {marca.nome}
          {marca.cref ? ` · CREF ${marca.cref}` : ""}
        </div>
      </div>
      {/* A logo fecha a linha, sobre papel branco: ela foi desenhada para esse fundo, e o
          object-contain existe porque logo de professor costuma ser horizontal. */}
      {marca.logoDataUrl && (
        <span className="grid h-8 min-w-[32px] shrink-0 place-items-center overflow-hidden rounded-[9px] bg-white px-1.5 py-0.5">
          <img src={marca.logoDataUrl} alt="" className="max-h-6 max-w-16 object-contain" />
        </span>
      )}
    </div>
  );
}

/**
 * Um cartão de AÇÃO com selo à esquerda e seta à direita ("Sobre você", "Meu documento").
 * O raio mora no invólucro e o botão vai dentro dele: a régua da casa só aceita botão em
 * pílula, controle ou cartão, e o cartão de ação do protótipo tem 16 px.
 */
function CartaoAcao({
  onClick,
  selo: seloDoCartao,
  titulo,
  sub,
  seta,
}: {
  onClick: () => void;
  selo: React.ReactNode;
  titulo: string;
  sub: React.ReactNode;
  seta: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[16px] border border-border bg-surface">
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-surface-soft"
      >
        {seloDoCartao}
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-bold text-ink">{titulo}</span>
          <span className="block text-2xs leading-snug text-ink-2">{sub}</span>
        </span>
        {seta}
      </button>
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
  tinta,
  marca,
  plano,
}: {
  aluno: Aluno;
  avaliacoes: Avaliacao[];
  execucoes: Execucao[];
  /** feedbacks de sessão do aluno: alimentam o esforço médio */
  feedbacks: SessaoFeedback[];
  cor: string;
  tinta: string;
  /** marca do profissional: identifica o documento que o aluno leva daqui */
  marca: Marca;
  /** plano ativo: dá as semanas e as fases do gráfico de carga por exercício */
  plano?: PlanoTreino;
}) {
  const doAluno = avaliacoes.filter((a) => a.alunoId === aluno.id).sort((a, b) => b.data - a.data);
  // A mais ANTIGA é a avaliação inicial; as outras são reavaliações, pela ordem real.
  const maisAntiga = doAluno[doAluno.length - 1]?.id;

  return (
    <div className="space-y-2.5">
      <h1 className="font-display text-[22px] font-bold leading-[1.1] tracking-[-0.02em] text-ink">Seu progresso</h1>

      {/* Sequência, treinos feitos, gráfico por semana, peso, esforço e dor: tudo derivado
          dos registros do próprio aluno (GamificacaoView). */}
      <GamificacaoView
        alunoId={aluno.id}
        execucoes={execucoes}
        cor={cor}
        avaliacoes={doAluno}
        feedbacks={feedbacks}
        plano={plano}
      />

      {/*
        A CARGA QUE ELE LEVANTOU, exercício por exercício. O protótipo não tem este bloco, e
        ele fica: é o que o aluno registrou série a série, e é o MESMO componente do
        profissional (mesma agregação), então os dois leem o mesmo número.
      */}
      <EvolucaoExercicio plano={plano} execucoes={execucoes} primeiroNome={aluno.nome.split(" ")[0]} />

      {/*
        O DOCUMENTO DE EVOLUÇÃO NA MÃO DO ALUNO. Com duas avaliações registradas há o que
        comparar, e o papel sai identificado com o nome e o CREF de quem acompanha. O
        "assinado por" do protótipo não entra: o PDF leva nome e CREF, não uma assinatura.
        Com uma avaliação só, o botão não aparece: não existe evolução de um ponto.
      */}
      {doAluno.length >= 2 && (
        <CartaoAcao
          onClick={() =>
            exportEvolucaoPDF({
              aluno,
              avaliacoes: doAluno,
              profissional: marca.nome,
              cref: marca.cref,
              marca: { nome: marca.nome, cref: marca.cref, logoDataUrl: marca.logoDataUrl, corPrimaria: marca.corPrimaria },
            })
          }
          selo={
            <span className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-control bg-primary-tint text-primary-texto">
              <FileText className="h-4 w-4" aria-hidden />
            </span>
          }
          titulo="Meu documento de evolução"
          sub={`PDF com o nome e o CREF de ${maiuscula(apelidoProfissional(marca))} · até ${fmtDiaMes(doAluno[0].data)}`}
          seta={<Download className="h-4 w-4 shrink-0 text-primary-texto" aria-hidden />}
        />
      )}

      <section className="space-y-1.5 pt-1">
        <h3 className="font-display text-sm font-bold text-ink">Avaliações</h3>
        {doAluno.length === 0 ? (
          <Card className="p-6 text-center">
            <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-card bg-surface-soft text-ink-2">
              <Clock className="h-5 w-5" />
            </span>
            <p className="text-sm text-ink-2">Suas avaliações vão aparecer aqui conforme o seu professor registrar.</p>
          </Card>
        ) : (
          doAluno.map((a) => {
            const medidas = [
              fmtDiaMesAno(a.data),
              a.medidas.peso != null ? `${a.medidas.peso.toLocaleString("pt-BR")} kg` : null,
              a.medidas.percentualGordura != null ? `${a.medidas.percentualGordura.toLocaleString("pt-BR")}% de gordura` : null,
            ].filter(Boolean);
            return (
              <div key={a.id} className="rounded-control border border-border bg-surface px-3 py-2.5">
                <div className="text-xs font-bold text-ink">{a.id === maisAntiga ? "Avaliação inicial" : "Reavaliação"}</div>
                <div className="tabular text-2xs text-ink-2">{medidas.join(" · ")}</div>
                {a.observacoes && <p className="mt-1 text-xs text-ink-2">{a.observacoes}</p>}
              </div>
            );
          })
        )}
      </section>

      <div className="pt-1">
        <ConquistasAluno alunoId={aluno.id} execucoes={execucoes} cor={cor} tinta={tinta} />
      </div>
    </div>
  );
}

/* ------------------------------ Aba: Perfil ------------------------------- */

/** Como a mensalidade se chama PARA O ALUNO: "Em dia" é o que ele quer saber, não "Pago". */
const ESTADO_PARA_O_ALUNO: Record<"pago" | "pendente" | "isento", string> = {
  pago: "Em dia",
  pendente: "Pendente",
  isento: "Isento",
};

/**
 * "Perfil" (protótipo, tela 09): quem ele é, quem acompanha, as fases do plano, o que ele
 * contou sobre si, a mensalidade, a aparência e a saída.
 */
function AbaPerfil({
  aluno,
  marca,
  cor,
  tinta,
  plano,
  onSair,
  rodapeDoPerfil,
  preview,
  declaracoes = [],
  pedidoAberto,
  onSobreVoce,
  onFoto,
  tema,
  onTema,
}: {
  /** o aluno troca a própria foto; ausente na prévia do profissional */
  onFoto?: (foto: string | null) => void;
  /** tema escolhido pelo aluno, e como trocar (a escolha vive no aparelho dele) */
  tema: TemaAluno;
  onTema: (t: TemaAluno) => void;
  aluno: Aluno;
  marca: Marca;
  cor: string;
  tinta: string;
  plano?: PlanoTreino;
  onSair?: () => void;
  declaracoes?: DeclaracaoAluno[];
  /** o pedido de treino ainda sem resposta, se houver */
  pedidoAberto?: DeclaracaoAluno;
  /** abre a tela "Conte sobre você" (o aluno atualiza o que informou) */
  onSobreVoce?: () => void;
  /** peça extra no fim do Perfil (a troca de espaço). Vem por PROP para a prévia do
   *  profissional não herdar a conta dele dentro da simulação do aluno. */
  rodapeDoPerfil?: React.ReactNode;
  preview?: boolean;
}) {
  const cobrancaPendente = aluno.cobranca ? statusEfetivo(aluno.cobranca) === "pendente" : false;
  // "45 anos · desde 25 jun": os dois são dados da ficha, e cada um só entra se existir.
  // Objetivo e nível moram no "Sobre você"; a última avaliação, no Progresso.
  const linha = [aluno.idade ? `${aluno.idade} anos` : null, aluno.criadoEm ? `desde ${fmtDiaMesAno(aluno.criadoEm)}` : null]
    .filter(Boolean)
    .join(" · ");
  const Prof = maiuscula(apelidoProfissional(marca));
  const avatar = (
    <AvatarAluno
      aluno={aluno}
      className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-[16px] font-display text-xl font-bold"
      style={{ background: cor, color: tinta }}
    />
  );

  return (
    <div className="space-y-2.5">
      <h1 className="font-display text-[22px] font-bold leading-[1.1] tracking-[-0.02em] text-ink">Perfil</h1>

      {cobrancaPendente && aluno.cobranca && <AvisoMensalidade cobranca={aluno.cobranca} />}

      <div className="flex items-center gap-3 py-0.5">
        {/* O aluno põe a própria foto aqui, e ela aparece para o professor na carteira. Na
            prévia do profissional a câmera não aparece: a prévia mostra, não grava. */}
        {onFoto ? (
          <TrocarFotoAluno aluno={aluno} onFoto={onFoto}>
            {avatar}
          </TrocarFotoAluno>
        ) : (
          avatar
        )}
        <div className="min-w-0">
          <div className="truncate font-display text-lg font-bold leading-tight text-ink">{aluno.nome}</div>
          {linha && <div className="mt-0.5 text-xs text-ink-2">{linha}</div>}
          {/* O objetivo fica, numa linha discreta (o protótipo não tem): é o que o plano
              persegue, e o par primário + secundário sai pela mesma função das outras saídas. */}
          {aluno.objetivo && (
            <div className="truncate text-xs text-ink-2">{rotuloObjetivoPar(aluno.objetivo, aluno.objetivoSecundario)}</div>
          )}
        </div>
      </div>

      <ProfessorCard marca={marca} cor={cor} tinta={tinta} rotulo="Seu profissional" />

      {plano && <FasesDoPlano plano={plano} cor={cor} />}

      {/* SOBRE VOCÊ: o aluno conta e atualiza os próprios dados; o professor confirma. */}
      {onSobreVoce &&
        (() => {
          const r = resumoSobreVoce(declaracoes, aluno.id);
          const sub =
            r.respondidas === 0
              ? `Conte sobre você para ${apelidoProfissional(marca)} montar o seu treino. Leva uns 3 minutos.`
              : [
                  `${r.respondidas} de ${r.total} respondidas`,
                  `${r.confirmadas} ${r.confirmadas === 1 ? "confirmada" : "confirmadas"} por ${Prof}`,
                  pedidoAberto ? `pedido enviado em ${fmtDiaMes(pedidoAberto.declaradaEm)}` : null,
                ]
                  .filter(Boolean)
                  .join(" · ");
          return (
            <CartaoAcao
              onClick={onSobreVoce}
              selo={
                <span className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-control bg-analysis-tint text-analysis-text">
                  <UserRound className="h-4 w-4" aria-hidden />
                </span>
              }
              titulo="Sobre você"
              sub={sub}
              seta={<ChevronRight className="h-4 w-4 shrink-0 text-primary-texto" aria-hidden />}
            />
          );
        })()}

      <MensalidadeCard aluno={aluno} marca={marca} cor={cor} tinta={tinta} />

      {/*
        APARÊNCIA: a escolha é do aluno e vive no aparelho dele, não na conta do professor.
        Uma caixa só: a de "Lembretes" do protótipo não entra, porque o app não manda lembrete
        nenhum, e "Ativos" seria mentira. Dois botões explícitos, e não um interruptor que
        obriga a adivinhar para que lado ele vai.
      */}
      <div className="flex items-center gap-2 rounded-control border border-border bg-surface py-1 pl-3 pr-1 text-xs">
        {tema === "escuro" ? <Moon className="h-3.5 w-3.5 text-ink-2" aria-hidden /> : <Sun className="h-3.5 w-3.5 text-ink-2" aria-hidden />}
        <span className="text-ink-2">Aparência</span>
        <span role="group" aria-label="Aparência" className="ml-auto flex">
          {([
            ["escuro", "Escuro"],
            ["claro", "Claro"],
          ] as [TemaAluno, string][]).map(([id, rotulo]) => {
            const ativo = tema === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onTema(id)}
                aria-pressed={ativo}
                className="inline-flex min-h-[44px] items-center rounded-full px-0.5"
              >
                <span
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                    ativo ? "bg-ink text-surface" : "text-ink-2",
                  )}
                >
                  {rotulo}
                </span>
              </button>
            );
          })}
        </span>
      </div>

      {rodapeDoPerfil}

      {onSair && (
        <button
          type="button"
          onClick={onSair}
          className="mx-auto mt-1 flex min-h-[44px] items-center justify-center rounded-full px-4 text-xs text-ink-2 hover:text-ink"
        >
          {preview ? "Fechar prévia" : "Sair da conta"}
        </button>
      )}
    </div>
  );
}

/* -------------------------- Peças compartilhadas -------------------------- */

/**
 * O selo da sessão: a LETRA quando o nome tem uma letra solta ("Treino A", "Sessão B",
 * "A · Inferiores"), o NÚMERO quando o nome é numerado ("Sessão 1") e a ordem na semana
 * quando não tem nenhum dos dois. A regra antiga pegava a primeira maiúscula do nome, e
 * "Sessão 1", "Sessão 2" e "Sessão 3" saíam todas como "S": três selos iguais para três
 * sessões diferentes, que é justamente o que o selo existe para distinguir.
 */
function selo(sessao: Sessao, ordem: number): string {
  const letraSolta = sessao.nome.match(/(?:^|\s)([A-Z])(?=$|[\s·:,-])/)?.[1];
  if (letraSolta) return letraSolta;
  const numero = sessao.nome.match(/\b(\d{1,2})\b/)?.[1];
  return numero ?? String(ordem);
}

/**
 * AS FASES DO PLANO (protótipo, tela 09), no Perfil: uma linha por mesociclo, com o ponto do
 * estado, o nome e o foco, e à direita o estado por extenso ("concluída", "semana 7 · atual",
 * "S9 a S12"). Nasce ABERTA: as linhas são curtas, e esconder atrás de um toque o mapa do
 * ciclo não economizava nada.
 */
/** A primeira oração do foco, em caixa baixa quando não começa por sigla ("tolerância ao exercício"). */
function focoCurto(foco: string): string {
  const s = foco.split(/[,;.]/)[0].trim();
  return /^[A-ZÀ-Ý]{2}/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1);
}

function FasesDoPlano({ plano, cor }: { plano: PlanoTreino; cor: string }) {
  const [aberto, setAberto] = React.useState(true);
  const semana = semanaAtual(plano);
  return (
    <div className="rounded-[16px] border border-border bg-surface px-3.5 py-1.5">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        className="flex min-h-[44px] w-full items-center gap-2 rounded-control text-left"
      >
        <span className="flex-1 font-display text-sm font-bold text-ink">Fases do plano</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-ink-2 transition-transform", aberto && "rotate-180")} aria-hidden />
      </button>
      {aberto && (
        <ul className="space-y-1.5 pb-2">
          {plano.macrociclo.mesociclos.map((m) => {
            const atual = semana >= m.semanaInicio && semana <= m.semanaFim;
            const passada = semana > m.semanaFim;
            return (
              <li key={m.id} className="grid grid-cols-[8px_1fr_auto] items-center gap-2.5 text-[11.5px]">
                <span
                  aria-hidden
                  className="h-2 w-2 rounded-full"
                  style={{ background: passada ? "var(--success-fill)" : atual ? cor : "var(--border)" }}
                />
                {/* O foco CURTO (a primeira oração): o foco inteiro tem quatro ideias e fazia
                    cada fase ocupar quatro linhas. A frase completa fica no título. */}
                <span className="min-w-0 text-ink" title={m.foco || undefined}>
                  <b>{rotuloMeso(m)}</b>
                  {m.foco ? <span className="text-ink-2"> · {focoCurto(m.foco)}</span> : null}
                </span>
                <span
                  className={cn(
                    "tabular inline-flex items-center gap-0.5 whitespace-nowrap text-2xs font-bold",
                    passada ? "text-success" : atual ? "text-primary-texto" : "text-ink-2",
                  )}
                >
                  {passada ? (
                    <>
                      concluída <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                    </>
                  ) : atual ? (
                    `semana ${semana} · atual`
                  ) : (
                    `S${m.semanaInicio} a S${m.semanaFim}`
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/**
 * A MENSALIDADE (protótipo, telas 09 e 14). Em dia: o valor, o estado ao lado do título e o
 * próximo vencimento. Pendente: borda âmbar, "venceu" ou "vence" pelo calendário, e a ação
 * que o dado permite (o link de pagamento OU a chave PIX, porque o modelo tem um campo só).
 */
function MensalidadeCard({ aluno, marca, cor, tinta }: { aluno: Aluno; marca: Marca; cor: string; tinta: string }) {
  const c = aluno.cobranca;
  if (!c) return null;
  const efetivo = statusEfetivo(c);
  const pendente = efetivo === "pendente";
  const { data, passou } = vencimentoDa(c);
  const ehUrl = !!c.linkPagamento && /^https?:\/\//i.test(c.linkPagamento);
  const ehPix = !!c.linkPagamento && !ehUrl;
  const tom =
    efetivo === "pago" ? "bg-success-tint text-success" : pendente ? "bg-warning-tint text-warning" : "bg-surface-soft text-ink-2";
  const sub = pendente
    ? `${passou ? "Venceu em" : "Vence em"} ${fmtDiaMes(data)}${ehPix ? ` · Pix para ${marca.nome}` : ""}`
    : efetivo === "pago"
      ? `Próximo vencimento ${fmtDiaMes(data)}${ehPix ? " · Pix" : ""}`
      : null;
  return (
    <div
      className={cn("rounded-[16px] border bg-surface", pendente ? "p-3.5" : "px-3.5 py-3")}
      style={{ borderColor: pendente ? "var(--warning)" : "var(--border)" }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <b className={cn("font-display font-bold text-ink", pendente ? "text-[15px]" : "text-sm")}>
          Mensalidade {formatBRL(c.valorCentavos)}
        </b>
        <span className={cn("rounded-full px-2 py-1 text-2xs font-bold leading-none", tom)}>{ESTADO_PARA_O_ALUNO[efetivo]}</span>
      </div>
      {sub && <p className="mt-1 text-[11.5px] text-ink-2">{sub}</p>}
      {pendente && (
        <>
          {ehUrl && (
            <a
              href={c.linkPagamento}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex h-11 w-full items-center justify-center rounded-full text-[13.5px] font-bold"
              style={{ background: cor, color: tinta }}
            >
              Pagar mensalidade
            </a>
          )}
          {ehPix && <PixCopia chave={c.linkPagamento!} />}
          <p className="mt-2 text-2xs text-ink-2">Combine o pagamento com o seu professor.</p>
        </>
      )}
    </div>
  );
}

/**
 * A chave PIX numa caixa tracejada, em letra de máquina, com o "Copiar" ao lado. A chave
 * aparece INTEIRA (quebra linha, nunca reticências): sem área de transferência no aparelho,
 * o aluno ainda precisa conseguir lê-la e digitá-la.
 */
function PixCopia({ chave }: { chave: string }) {
  const [copiado, setCopiado] = React.useState(false);
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(chave);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 1800);
    } catch {
      /* sem clipboard: a chave segue visível ao lado */
    }
  };
  return (
    <div className="mt-3 flex items-center gap-2 rounded-[10px] border border-dashed border-border bg-bg px-2.5 py-[9px]">
      <span className="min-w-0 flex-1 break-all font-mono text-2xs text-ink-2">{chave}</span>
      <button
        type="button"
        onClick={copiar}
        className="-my-2 inline-flex min-h-[44px] shrink-0 items-center rounded-full px-1 text-2xs font-bold text-primary-texto"
        aria-live="polite"
      >
        {copiado ? "Chave PIX copiada" : "Copiar chave PIX"}
      </button>
    </div>
  );
}

/**
 * O INÍCIO SEM TREINO (protótipo, tela 12): em que ponto o aluno está e o que fazer agora,
 * no centro da tela, com o canal do professor no pé.
 *
 * Era uma frase ("Seu professor ainda não publicou um plano") e nenhuma ação: quem acabava de
 * entrar não sabia se devia esperar, avisar alguém ou fazer algo. Sem pedido: contar sobre si
 * e pedir o treino, com as três etapas do combinado. Com pedido: a data em que ele saiu, que
 * é a vez do professor, e a porta para atualizar as respostas enquanto espera. O "você recebe
 * um aviso" do protótipo não entra: o app não manda aviso ao aluno quando o plano sai.
 */
function TreinoACaminho({
  aluno,
  marca,
  cor,
  tinta,
  declaracoes,
  pedidoAberto,
  ultimaAvaliacao,
  onSobreVoce,
}: {
  aluno: Aluno;
  marca: Marca;
  cor: string;
  tinta: string;
  declaracoes: DeclaracaoAluno[];
  pedidoAberto?: DeclaracaoAluno;
  ultimaAvaliacao?: number;
  onSobreVoce?: () => void;
}) {
  const professor = apelidoProfissional(marca);
  const Prof = maiuscula(professor);
  const r = resumoSobreVoce(declaracoes, aluno.id);
  const enviadoEm = pedidoAberto ? fmtDiaMes(pedidoAberto.declaradaEm) : null;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-2.5 py-6 text-center">
      <span className="grid h-[72px] w-[72px] place-items-center rounded-full border border-border bg-surface">
        <IconeMapa className="h-7 w-7 text-primary-texto" aria-hidden />
      </span>
      <h2 className="mt-4 font-display text-lg font-bold leading-tight tracking-[-0.01em] text-ink">
        {enviadoEm ? "Seu treino está sendo montado" : "Conte sobre você e peça o seu treino"}
      </h2>
      <p className="mt-1.5 max-w-[34ch] text-[12.5px] leading-[1.5] text-ink-2">
        {enviadoEm
          ? `${Prof} recebeu o seu pedido de ${enviadoEm}${ultimaAvaliacao ? ` e a sua avaliação de ${fmtDiaMes(ultimaAvaliacao)}` : ""} e está preparando o plano. Quando ficar pronto, ele aparece aqui.`
          : `${Prof} precisa te conhecer para montar o treino. São 5 passos rápidos.`}
      </p>

      {enviadoEm ? (
        <>
          {onSobreVoce && (
            <div className="mt-4 w-full">
              <CartaoAcao
                onClick={onSobreVoce}
                selo={
                  <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[10px] bg-analysis-tint text-analysis-text">
                    <UserRound className="h-4 w-4" aria-hidden />
                  </span>
                }
                titulo="Enquanto espera, atualize suas respostas"
                sub={`${r.respondidas} de ${r.total} respondidas`}
                seta={<ChevronRight className="h-4 w-4 shrink-0 text-primary-texto" aria-hidden />}
              />
            </div>
          )}
          <div className="mt-3 w-full rounded-[14px] border border-border bg-surface p-3 text-left">
            <LinhaDoTempo etapas={etapasDoPedido(Prof)} feitas={1} cor={cor} tinta={tinta} professor={Prof} />
          </div>
        </>
      ) : (
        <>
          {onSobreVoce && (
            <button
              type="button"
              onClick={onSobreVoce}
              className="mt-4 inline-flex h-11 w-full items-center justify-center gap-1 rounded-full text-sm font-bold"
              style={{ background: cor, color: tinta }}
            >
              {r.respondidas > 0 ? "Continuar e pedir o treino" : "Começar agora"} <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          )}
          <div className="mt-4 w-full rounded-[14px] border border-border bg-surface p-3 text-left">
            <LinhaDoTempo etapas={etapasDoPedido(Prof)} feitas={0} cor={cor} tinta={tinta} professor={Prof} />
          </div>
        </>
      )}
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
