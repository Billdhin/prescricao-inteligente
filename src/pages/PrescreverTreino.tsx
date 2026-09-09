import * as React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  CalendarRange,
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
  MapPin,
  ArrowLeft,
} from "lucide-react";
import { Card, Pill, buttonClasses, SectionHeader, LinhaDeTokens, TokenRotulado } from "@/components/ui/primitives";
import { PaywallCard } from "@/components/ui/PaywallCard";
import { SeloRCD } from "@/components/rcd/SeloRCD";
import { GraficoProgressao, MesocicloCard, ModeloExplicacao, SessaoBloco, tetosDoPlano, type ContextoFaixa } from "@/components/treino/PlanoEditor";
import { DeOndeVemOLimite } from "@/components/treino/DeOndeVemOLimite";
import { TresCamadas } from "@/components/ui/camadas";
import { letraSessao } from "@/lib/gps/semear";
import { exercises } from "@/data/exercises";
import { cn } from "@/lib/utils";
import { OBJETIVOS, type GpsObjetivo } from "@/lib/gps/engine";
import { gerarPlano, slugsClinicosDoPlano, consequenciasDoPlano } from "@/lib/gps/periodizacao";
import { topicosDoRaciocinio } from "@/lib/gps/raciocinioTopicos";
import { parametrosInvalidosDe } from "@/lib/gps/farmacos";
import { agregadoSemana } from "@/lib/gps/progressao";
import {
  getModelo,
  MODELOS_PERIODIZACAO,
  semanaAtual,
  HORIZONTES_PLANO,
  rotuloHorizonte,
  mesocicloAtual,
  rotuloMeso,
  getFaixa,
  type Macrociclo,
  type Mesociclo,
  type Microciclo,
  type Sessao,
  type PlanoTreino,
} from "@/data/periodizacao";
import type { Nivel } from "@/data/types";
import type { Aluno } from "@/data/alunos";
import { specialGroups, getSpecialGroup } from "@/data/specialGroups";
import { bibliografia } from "@/data/referencias";
import { exportPlanoPDF } from "@/lib/exportPlano";
import { diferencaDePlano } from "@/lib/gps/diffPlano";
import { ConfirmarPublicacao } from "@/components/treino/ConfirmarPublicacao";
import { useAlunos, useUser, isPremiumUnlocked, marcaDoUsuario, uid } from "@/lib/store";
import { prontidaoParaPrescrever } from "@/lib/gps/prontidao";
import { ProntidaoAviso } from "@/components/alunos/ProntidaoAviso";
import { groupGpsRules } from "@/lib/gps/groupRules";
import { rotuloRestricao } from "@/lib/gps/restricoes";
import { ObjetivoDuplo } from "@/components/gps/ObjetivoDuplo";
import { parValido, linhaObjetivos } from "@/lib/gps/objetivos";
import { useDialog } from "@/lib/useDialog";
import { toast, toastDesfazer } from "@/lib/toast";

const NIVEIS: Nivel[] = ["Iniciante", "Intermediário", "Avançado"];
// A lista vive em src/data/periodizacao.ts: o PDF e o cabeçalho do plano nomeiam o mesmo
// horizonte que este botão escolheu. `gerarPlano` segue recebendo semanas.
const HORIZONTES = HORIZONTES_PLANO;
const FREQUENCIAS = [2, 3, 4, 5, 6];

const fmtDataCurta = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(ts));

/*
 * RASCUNHO DE PLANO QUE SOBREVIVE À NAVEGAÇÃO.
 *
 * Fica na sessão do navegador, e não no armazenamento persistido do app, de propósito: um
 * rascunho é do atendimento de agora, não da carteira. Fechou o navegador, ele vai embora,
 * que é o que a palavra promete. Guardar por aluno evita o pior erro possível aqui, que seria
 * devolver o rascunho de um aluno na tela de outro.
 */
const CHAVE_RASCUNHO = "pi-rascunho-plano";

function lerRascunho(alunoId?: string): PlanoTreino | null {
  if (typeof window === "undefined" || !alunoId) return null;
  try {
    const bruto = sessionStorage.getItem(CHAVE_RASCUNHO);
    if (!bruto) return null;
    const p = JSON.parse(bruto) as PlanoTreino;
    return p?.alunoId === alunoId && p?.macrociclo ? p : null;
  } catch {
    return null;
  }
}

function gravarRascunho(plano: PlanoTreino) {
  if (typeof window === "undefined" || !plano.alunoId) return;
  try {
    sessionStorage.setItem(CHAVE_RASCUNHO, JSON.stringify(plano));
  } catch {
    /* cota cheia ou sessão indisponível: o rascunho segue só em memória, como antes */
  }
}

function limparRascunho() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(CHAVE_RASCUNHO);
  } catch {
    /* nada a fazer */
  }
}

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
  const [confirmarPublicacao, setConfirmarPublicacao] = React.useState(false);

  // `?plano=` abre um plano salvo para continuar de onde parou; `?aluno=` começa um novo
  // já com o perfil dele. Sem retomar, "abrir plano" no perfil do aluno geraria um plano
  // novo por cima do que o profissional já ajustou.
  const planoPre = planosSalvos.find((p) => p.id === params.get("plano"));
  const alunoInicial = alunos.find((a) => a.id === (planoPre?.alunoId ?? params.get("aluno")));

  const [alunoId, setAlunoId] = React.useState<string | undefined>(alunoInicial?.id);
  const aluno = alunos.find((a) => a.id === alunoId);
  // GATE COMPLETO, não só a avaliação. Antes daqui, um aluno avaliado de quem
  // ninguém tinha perguntado condição, restrição nem medicação gerava macrociclo de
  // 12 semanas sem uma linha de ressalva. O gate agora é `prontidaoParaPrescrever`,
  // que junta os oito bloqueios numa resposta só. Plano avulso (sem aluno) segue
  // 100% livre, por ser uso de estudo, e editar plano JÁ SALVO também: o bloqueio é
  // sobre criar prescrição nova no escuro, não sobre mexer no que já existe.
  const prontidao = React.useMemo(
    () => (aluno ? prontidaoParaPrescrever(aluno, { avaliacoes }) : null),
    [aluno, avaliacoes],
  );
  const bloquearPorPerfil = Boolean(aluno) && Boolean(prontidao && !prontidao.ok) && !planoPre;

  const [objetivo, setObjetivo] = React.useState<GpsObjetivo>(planoPre?.objetivo ?? alunoInicial?.objetivo ?? "Hipertrofia");
  // O segundo objetivo do aluno (onda 3) chega ate o PLANO: sem isto, o cadastro
  // prometia "entra como enfase" e a periodizacao ignorava em silencio.
  const [objetivoSecundario, setObjetivoSecundario] = React.useState<GpsObjetivo | undefined>(
    planoPre?.objetivoSecundario ?? alunoInicial?.objetivoSecundario,
  );
  const [nivel, setNivel] = React.useState<Nivel>(planoPre?.nivel ?? alunoInicial?.nivel ?? "Iniciante");
  const [grupo, setGrupo] = React.useState<string>(planoPre?.grupoEspecial ?? alunoInicial?.grupoEspecial ?? "");
  const [frequencia, setFrequencia] = React.useState(planoPre?.frequenciaSemanal ?? 3);
  const [semanas, setSemanas] = React.useState(planoPre?.semanas ?? 12);
  const [disponibilidade, setDisponibilidade] = React.useState(planoPre?.disponibilidade ?? "");
  // Disponibilidade é exceção, não regra: fica recolhida para o botão de gerar não sair
  // da primeira dobra. Já preenchida (plano retomado), abre sozinha.
  const [maisOpcoes, setMaisOpcoes] = React.useState(Boolean(planoPre?.disponibilidade));

  // O rascunho já nasce como o plano que vai ser salvo: editar, salvar e exportar
  // trabalham no mesmo objeto, então o PDF nunca mostra uma versão anterior da edição.
  const [plano, setPlano] = React.useState<PlanoTreino | null>(
    () => planoPre ?? lerRascunho(params.get("aluno") ?? undefined),
  );
  const [salvo, setSalvo] = React.useState(Boolean(planoPre));
  const [rascunhoRecuperado, setRascunhoRecuperado] = React.useState(
    () => !planoPre && Boolean(lerRascunho(params.get("aluno") ?? undefined)),
  );

  /*
   * O PLANO NÃO PODE SUMIR SÓ PORQUE O PROFISSIONAL SAIU DA TELA.
   *
   * Medido no app: gerar a periodização, tocar em qualquer item do menu e voltar. O plano
   * some, e `planos` no armazenamento segue em 0. Ele vivia SÓ no estado deste componente, e
   * a pílula da tela dizia "Rascunho" o tempo todo, o que promete uma guarda que não existia.
   * Quem editou meia dúzia de semanas na mão perdia o trabalho num toque, sem aviso nenhum.
   *
   * Isto NÃO decide o que "publicar" significa, que é uma decisão de produto ainda em aberto:
   * o único botão que persiste de verdade continua sendo o de publicar no app do aluno. O que
   * muda é que o rascunho passa a sobreviver à navegação, guardado na sessão do navegador e
   * devolvido ao voltar, com um aviso dizendo que ele foi recuperado e ainda não está salvo.
   */
  React.useEffect(() => {
    if (!plano || salvo) return;
    gravarRascunho(plano);
  }, [plano, salvo]);

  // `?modelo=` chega das aulas do Aprender ("aplicar no atendimento"): o profissional
  // acabou de estudar um modelo e quer montar um plano com ele.
  const modeloPreferido = MODELOS_PERIODIZACAO.find((m) => m.id === params.get("modelo"))?.id;

  // Regenerar por cima de um plano JÁ SALVO deste aluno (aberto via ?plano=) é destrutivo:
  // exige confirmação e REUTILIZA o id, senão o Salvar arquiva o plano editado e cria um
  // duplicado. Sem ?plano= (ex.: ?aluno=), gerar é sempre um plano novo.
  // FCrep MEDIDA na avaliação mais recente do aluno selecionado. Vive aqui porque o editor
  // também precisa dela: recalcular o alvo ao travar uma variável sem idade e sem FCrep era
  // perda silenciosa, que a preservação da zona antiga mascarava.
  const fcRepousoDoAluno = React.useMemo(
    () =>
      alunoId
        ? avaliacoes.filter((a) => a.alunoId === alunoId).sort((a, b) => b.data - a.data)[0]?.medidas.fcRepouso
        : undefined,
    [alunoId, avaliacoes],
  );

  /*
   * DUAS PERGUNTAS DIFERENTES, QUE ESTAVAM COLADAS NA MESMA VARIÁVEL.
   *
   *   "sobre qual plano eu escrevo?"  -> `planoSalvoDoAluno`, e a resposta só pode vir de
   *   uma intenção explícita de editar (`?plano=`). É ela que reaproveita o id, e reaproveitar
   *   id sem ser pedido é sobrescrever plano alheio.
   *
   *   "este aluno já tem treino?"     -> `planoAtivoDoAluno`, que é um fato do aluno e não
   *   depende de como se chegou aqui.
   *
   * As duas eram a mesma linha, e o efeito foi o que o Filipe descreveu: escolhendo o aluno
   * pela lista, sem vir de um link de plano, o sistema não sabia que ele já tinha treino.
   * Gerava um plano novo em silêncio, e o antigo só era arquivado no momento de salvar, sem
   * ninguém nunca ter dito que existia.
   */
  const planoSalvoDoAluno = planoPre && planoPre.alunoId === alunoId ? planoPre : undefined;
  const planoAtivoDoAluno = React.useMemo(
    () =>
      alunoId
        ? planosSalvos.filter((x) => x.alunoId === alunoId && x.status === "ativo").sort((a, b) => b.data - a.data)[0]
        : undefined,
    [alunoId, planosSalvos],
  );
  /** O aluno tem treino, e o profissional NÃO disse que veio editar justamente esse. */
  const treinoNaoAnunciado = Boolean(planoAtivoDoAluno) && planoAtivoDoAluno?.id !== planoPre?.id;
  const planoEmRisco = planoSalvoDoAluno ?? planoAtivoDoAluno;
  const execucoesEmRisco = React.useMemo(() => {
    if (!planoEmRisco) return false;
    const ids = new Set<string>();
    planoEmRisco.macrociclo.mesociclos.forEach((m) =>
      m.microciclos.forEach((w) => w.sessoes.forEach((s) => s.blocos.forEach((b) => ids.add(b.id)))),
    );
    return execucoes.some((e) => ids.has(e.blocoRef));
  }, [planoEmRisco, execucoes]);

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
    // Idade e FCrep MEDIDA (da avaliação mais recente) personalizam a zona de FC do aeróbio
    // (MP-4); sem aluno ou sem FCrep, o aeróbio guia só por duração + PSE, sem inventar zona.
    const ultimaAval = ctx.alunoId
      ? avaliacoes
          .filter((a) => a.alunoId === ctx.alunoId)
          .sort((a, b) => b.data - a.data)[0]
      : undefined;
    const g = gerarPlano({
      ...ctx,
      modeloPreferido,
      faseInicial: ctx.alunoId ? aluno?.faseJornada : undefined,
      idade: ctx.alunoId ? aluno?.idade : undefined,
      // Os equipamentos do aluno moldam a escolha do cardio: a modalidade que a evidência
      // coloca à frente só vence se houver como executá-la (hidro exige Piscina). Sem aluno,
      // sem filtro, e a preferida da condição escolhida à mão vale cheia.
      equipamentos: ctx.alunoId ? aluno?.equipamentos : undefined,
      fcRepouso: ultimaAval?.medidas.fcRepouso,
      // As restrições do PERFIL do aluno entram na geração: elas somam com as que a
      // condição impõe e filtram a seleção de exercícios do plano inteiro. Sem aluno
      // (plano avulso), só as da condição valem.
      restricoes: ctx.alunoId ? aluno?.restricoes : undefined,
      // As DEMAIS condições do aluno chegam ao motor. Sem esta linha, confirmar uma
      // condição pelo card de sugestão (que grava em `condicoesAtencao`) não mudava nada
      // no plano: foi o que o Filipe viu com a hipertensão estágio 2.
      condicoesAtencao: ctx.alunoId ? aluno?.condicoesAtencao : undefined,
      objetivoSecundario,
      // O perfil clínico mais as classes de medicação declaradas decidem se a frequência
      // cardíaca ainda guia a intensidade deste aluno. Sem aluno (plano avulso) ou sem
      // declaração, a lista sai vazia e o plano é o de sempre.
      parametrosInvalidos: ctx.alunoId
        ? parametrosInvalidosDe(aluno?.farmacos, {
            farmacosNaoInformado: aluno?.farmacosNaoInformado,
            grupos: [ctx.grupoEspecial, ...(aluno?.condicoesAtencao ?? [])],
          })
        : undefined,
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
      objetivoSecundario,
      nivel: ctx.nivel,
      semanas: ctx.semanas,
      frequenciaSemanal: ctx.frequencia,
      disponibilidade: ctx.disponibilidade || undefined,
      modeloId: g.modeloId,
      modeloAltId: g.modeloAltId,
      grupoEspecial: ctx.grupoEspecial,
      condicoesAtencao: ctx.alunoId ? aluno?.condicoesAtencao : undefined,
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
      // O SEGUNDO objetivo vem junto. Sem esta linha, escolher o aluno herdava objetivo e
      // nível e descartava o secundário em silêncio, e o plano saía prometendo menos do que
      // o perfil dele declara.
      setObjetivoSecundario(a.objetivoSecundario);
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
    // Confirma antes de gerar por cima de qualquer treino existente, e não só do que veio
    // por link: era essa a diferença que deixava o plano do aluno ser trocado em silêncio.
    if (planoSalvoDoAluno || treinoNaoAnunciado) setConfirmarRegenerar(true);
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

  /*
   * PUBLICAR PASSA POR UMA ANTESSALA quando o aluno JÁ TEM treino.
   *
   * O Filipe: "o sistema deveria apresentar um modal indicando o que muda do plano anterior...
   * para que o professor não fique totalmente no escuro sobre o que está prescrevendo". O
   * diálogo só existe quando há com o que comparar: na primeira publicação não há diferença a
   * mostrar, e confirmação sem conteúdo é o que ensina alguém a clicar sem ler a próxima.
   */
  const diferenca = React.useMemo(() => {
    if (!plano || !planoAtivoDoAluno || planoAtivoDoAluno.id === plano.id) return undefined;
    return diferencaDePlano(planoAtivoDoAluno, plano);
  }, [plano, planoAtivoDoAluno]);

  const publicar = () => {
    if (diferenca) setConfirmarPublicacao(true);
    else salvar();
  };

  const salvar = () => {
    if (!plano || !aluno) return;
    const jaExiste = planosSalvos.some((p) => p.id === plano.id);
    if (jaExiste) {
      updatePlano(plano.id, plano);
      setSalvo(true);
      limparRascunho();
      setRascunhoRecuperado(false);
      toast("Plano atualizado no perfil do aluno.");
    } else {
      addPlano({ ...plano, alunoId: aluno.id });
      limparRascunho();
      // Primeiro salvamento de um plano novo: leva ao perfil, onde o chip "Sem treino"
      // morre na frente do usuário, com o banner e a aba de treino aberta. Salvamentos
      // seguintes (updatePlano) ficam na tela, com o link "Ver no perfil de {nome}".
      // A aba vai junto: quem acabou de montar o treino quer VER o treino. Sem `?aba=`, o
      // destino abre na Visão e o plano recém-salvo fica a mais um clique, atrás de um
      // banner. É a mesma classe do link de avaliação que caía na Visão.
      navigate(`/alunos/${aluno.id}?aba=treino`, { state: { planoSalvo: true } });
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

  /*
   * Dois documentos do mesmo plano, e a diferença é de uso, não de conteúdo.
   *
   * O PLANO COMPLETO é o que se assina e arquiva, e segue sendo o padrão do botão. A FOLHA DA
   * SEMANA é o que vai à academia: uma semana só, com a coluna de carga em branco para o
   * aluno anotar. Medido no arquivo gerado, o plano de 12 semanas imprimia 180 linhas de
   * exercício; a folha imprime as da semana.
   */
  const exportar = (somenteSemana?: number) => {
    if (!plano || !aluno) return;
    exportPlanoPDF({
      aluno,
      plano,
      profissional: user.name,
      cref: user.cref,
      marca: marcaDoUsuario(user),
      somenteSemana,
    });
  };

  return (
    // Duas larguras, porque são duas telas: o formulário tem o trilho navy fixo à
    // direita (protótipo de 08/09) e precisa de duas colunas; o plano gerado tem
    // gráfico, semana, sessão e trilho lateral, e sufoca em menos que isso.
    <div className={cn("mx-auto space-y-6", plano ? "max-w-[1200px]" : "max-w-[1100px]")}>
      {/*
        PASSO ÚNICO: contexto e gerar.
        Antes eram dois cards ("Passo 1" e um "Passo 2" que ficava vazio embaixo até
        alguém gerar), e o formulário empurrava a página inteira para baixo. O plano
        gerado ocupa a tela toda quando existe; enquanto não existe, a tela é o
        formulário curto e mais nada.
      */}
      {!plano && (
        <>
          <div>
            {/*
              DE ONDE EU VIM. O Filipe: "eu entrei em prescrever treino atraves de um aluno,
              agora nao tenho um botao voltar... nao consigo mais voltar". Quando a tela é
              aberta a partir de um aluno (por `?aluno=` ou por `?plano=`), a volta é a ficha
              dele, e ela precisa estar escrita. `navigate(-1)` não serve: recarregar a página
              ou chegar por link colado deixa o histórico vazio, e o botão vira um beco.
            */}
            {aluno && (
              <Link
                to={`/alunos/${aluno.id}?aba=treino`}
                className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-2 hover:text-ink"
              >
                <ArrowLeft className="h-4 w-4" /> Voltar para {aluno.nome.split(" ")[0]}
              </Link>
            )}
            {/* Cabeçalho no vocabulário do protótipo: sobrelinha azul em caixa alta,
                H1 display e o passo a passo 1-2-3 à direita. O passo atual é DERIVADO
                do estado real: sem aluno decidido, a pergunta da tela é "para quem";
                com aluno escolhido, o que se ajusta é o perfil. */}
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-1.5 flex flex-wrap items-center gap-2.5">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Prescrever treino</p>
                  <SeloRCD compacto explicavel />
                </div>
                <h1 className="font-display text-3xl font-bold tracking-[-0.03em] text-ink md:text-4xl">
                  Para quem é este plano?
                </h1>
                <p className="mt-2 text-ink-2">
                  6 respostas rápidas. Você edita tudo depois. Exercício avulso?{" "}
                  <Link to="/gps" className="font-semibold text-primary hover:underline">
                    Use o Treino do dia
                  </Link>
                  .
                </p>
              </div>
              <PassosDaPrescricao atual={aluno ? 2 : 1} />
            </div>

            {/*
              QUANDO JÁ ESTÁ TUDO RESPONDIDO, A AÇÃO VEM ANTES DO FORMULÁRIO.

              Medido no app a 320px de largura, com um aluno selecionado: a página tem 1737px
              e o botão "Gerar periodização" fica a 1333px do topo, quase duas telas de
              rolagem. E as seis perguntas do caminho já vêm TODAS preenchidas do perfil do
              aluno (objetivo, nível, condição). O profissional rolava seis blocos de opções
              para confirmar o que ele mesmo já tinha cadastrado.

              Com aluno escolhido, o formulário deixa de ser um formulário e vira uma
              confirmação: o resumo do que vai ser gerado e o botão, no alto. Os seis campos
              continuam logo abaixo, inteiros, para quem quiser mudar algo nesta prescrição
              sem mexer no perfil. Sem aluno (plano avulso) nada muda, porque ali as respostas
              de fato começam vazias.
            */}
            {/*
              ESTE ALUNO JÁ TEM TREINO, E O SISTEMA PRECISA DIZER ISSO ANTES DE GERAR OUTRO.

              O Filipe: "ao selecionar prescrever treino e selecionar um aluno que ja possui
              treino, deveria ser dado um indicativo deixando claro que o aluno ja possui um
              treino e se quer editar esse treino ou continuar para gerar um novo".

              O aviso existia, mas só para quem chegava por um link de plano. Escolhendo o
              aluno pela lista, o sistema não sabia de nada: gerava plano novo em silêncio, e
              o treino que estava rodando só era arquivado lá na hora de salvar.

              O cartão diz em que semana o treino está, porque é isso que decide: arquivar um
              plano na semana 2 é diferente de arquivar um na semana 11. E os dois caminhos
              ficam escritos, sem esconder nenhum: editar o que existe, ou seguir e gerar novo.
            */}
            {treinoNaoAnunciado && planoAtivoDoAluno && !plano && (
              <Card tone="warning" className="mt-4 p-4">
                <div className="flex flex-wrap items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface text-warning">
                    <AlertTriangle className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">
                      {aluno?.nome.split(" ")[0]} já tem um treino em andamento.
                    </p>
                    <p className="mt-0.5 text-sm text-ink-2">
                      {planoAtivoDoAluno.titulo}, na semana {semanaAtual(planoAtivoDoAluno)} de{" "}
                      {planoAtivoDoAluno.semanas}. Gerar um novo aqui arquiva este, e o aluno passa a ver o
                      plano novo no app dele.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link to={`/prescrever-treino?plano=${planoAtivoDoAluno.id}`} className={buttonClasses("primary", "sm")}>
                        <Pencil className="h-4 w-4" /> Editar este treino
                      </Link>
                      <Link to={`/alunos/${aluno?.id}?aba=treino`} className={buttonClasses("secondary", "sm")}>
                        Ver no perfil
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {aluno && !plano && !bloquearPorPerfil && (
              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-card border border-border bg-surface-soft p-3">
                <p className="min-w-0 flex-1 text-sm text-ink-2">
                  <span className="font-semibold text-ink">{aluno.nome.split(" ")[0]}</span>, {objetivo.toLowerCase()},{" "}
                  {nivel.toLowerCase()}, {rotuloHorizonte(semanas) ?? `${semanas} semanas`}, {frequencia}x por semana
                  {grupo ? `, ${getSpecialGroup(grupo)?.nome ?? ""}` : ""}. Dá para ajustar abaixo.
                </p>
                <button onClick={gerar} className={cn(buttonClasses("primary"), "shrink-0")}>
                  <Sparkles className="h-4 w-4" />{" "}
                  {/* Mesmo rótulo do botão de baixo: dois botões que fazem a mesma coisa não
                      podem prometer coisas diferentes na mesma tela. */}
                  {planoSalvoDoAluno || treinoNaoAnunciado ? "Gerar de novo" : "Gerar periodização"}
                </button>
              </div>
            )}
          </div>

          {/* Duas colunas no desktop, como o protótipo: o formulário à esquerda e o
              cartão navy fixo "O que o Mapa já sabe" à direita, com o CTA de gerar. */}
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0 space-y-5">
          <Card variant="raised" className="p-5 md:p-6">
            <p className="text-sm font-semibold text-ink">Aluno</p>
            {alunos.length === 0 ? (
              <p className="mt-3 rounded-control border border-dashed border-border p-3 text-sm text-ink-3">
                Nenhum aluno cadastrado.{" "}
                <Link to="/alunos?novo=1" className="font-semibold text-primary hover:underline">
                  Cadastrar aluno
                </Link>{" "}
                ou siga com um plano avulso.
              </p>
            ) : (
              <>
                {/* O seletor virou os cartões do protótipo: avatar navy quadrado com as
                    iniciais, nome e o perfil numa linha. O plano avulso segue sendo a
                    primeira opção, como era no select. */}
                <div role="group" aria-label="Aluno" className="mt-3 grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    aria-pressed={!alunoId}
                    onClick={() => escolherAluno(undefined)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-control border p-3 text-left transition-colors",
                      !alunoId ? "border-primary bg-primary-tint" : "border-border hover:bg-surface-soft",
                    )}
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-control border border-dashed border-border bg-surface text-ink-3">
                      <Users className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <b className="block truncate text-sm font-semibold text-ink">Plano avulso</b>
                      <span className="block truncate text-xs text-ink-2">sem aluno</span>
                    </span>
                  </button>
                  {alunos.map((a) => {
                    const sel = a.id === alunoId;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        aria-pressed={sel}
                        onClick={() => escolherAluno(a.id)}
                        className={cn(
                          "flex items-center gap-2.5 rounded-control border p-3 text-left transition-colors",
                          sel ? "border-primary bg-primary-tint" : "border-border hover:bg-surface-soft",
                        )}
                      >
                        <span
                          className="grid h-10 w-10 shrink-0 place-items-center rounded-control font-display text-xs font-bold"
                          style={{ background: "#0B1628", color: "#F3F1EA" }}
                        >
                          {a.iniciais}
                        </span>
                        <span className="min-w-0">
                          <b className="block truncate text-sm font-semibold text-ink">{a.nome}</b>
                          <span className="block truncate text-xs text-ink-2">
                            {a.objetivo} · {a.nivel}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                {/* O perfil dele numa linha, colado à escolha: é o que diz se o
                    contexto herdado abaixo faz sentido, sem abrir o cadastro. */}
                {aluno && (
                  <span className="mt-2 block truncate text-xs text-ink-2">
                    {[aluno.nivel.toLowerCase(), ...aluno.restricoes.map((r) => rotuloRestricao(r.tag).toLowerCase())]
                      .slice(0, 3)
                      .join(" · ")}
                  </span>
                )}
              </>
            )}

            <div className="mt-4 border-t border-border pt-4">
              <Campo label="Condição / grupo especial">
                <select
                  id="grupo-especial"
                  value={grupo}
                  onChange={(e) => setGrupo(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Sem condição especial</option>
                  {specialGroups.map((g) => (
                    <option key={g.slug} value={g.slug}>
                      {g.nome}
                    </option>
                  ))}
                </select>
                {grupo && (
                  <span className="mt-1 flex items-start gap-1.5 text-xs text-ink-2">
                    <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-analysis" />
                    A jornada de fases deste grupo vira a base do macrociclo.
                  </span>
                )}
              </Campo>
            </div>
          </Card>

            {/* Gate duro: aluno selecionado sem o que decide a prescrição não gera plano. */}
            {bloquearPorPerfil && aluno && prontidao ? (
              <ProntidaoAviso aluno={aluno} prontidao={prontidao} />
            ) : (
              <>
                <Card variant="raised" className="p-5 md:p-6">
                <div>
                  <Campo label="Objetivo">
                    <Opcoes
                      valor={objetivo}
                      opcoes={OBJETIVOS}
                      onSelect={(v) => {
                        const novo = v as GpsObjetivo;
                        setObjetivo(novo);
                        // Trocar o principal pode invalidar o secundário guardado.
                        if (!parValido(novo, objetivoSecundario) || objetivoSecundario === novo) {
                          setObjetivoSecundario(undefined);
                        }
                      }}
                    />
                  </Campo>
                  {/* O segundo objetivo do aluno vem do cadastro e pode ser ajustado aqui,
                      com o veredito do par na hora. Ele desempata a seleção de exercícios
                      DEPOIS da segurança, e viaja com o plano até o documento. */}
                  <div className="mt-3 border-t border-border pt-3">
                    <ObjetivoDuplo
                      objetivo={objetivo}
                      objetivoSecundario={objetivoSecundario}
                      onChange={(o, s) => {
                        setObjetivo(o);
                        setObjetivoSecundario(s);
                      }}
                      somenteSecundario
                    />
                  </div>
                </div>

                <div className="mt-4 border-t border-border pt-4">
                  <Campo label="Nível">
                    <Opcoes valor={nivel} opcoes={NIVEIS} onSelect={(v) => setNivel(v as Nivel)} />
                  </Campo>
                </div>
                </Card>

                {/* Horizonte em card próprio, como no protótipo, com as pílulas ativas
                    em navy (bg-ink) em vez do tint azul. */}
                <Card variant="raised" className="p-5 md:p-6">
                  <Campo label="Duração do plano">
                    <div className="flex flex-wrap gap-1.5">
                      {HORIZONTES.map((h) => (
                        <button
                          key={h.id}
                          onClick={() => setSemanas(h.semanas)}
                          aria-pressed={semanas === h.semanas}
                          title={`${h.rotulo}: ${h.semanas} semanas`}
                          className={cn(
                            "inline-flex min-h-[44px] items-center justify-center rounded-full border px-4 py-1.5 text-sm leading-tight transition-colors",
                            semanas === h.semanas
                              ? "border-ink bg-ink font-semibold text-surface"
                              : "border-border text-ink-2 hover:bg-surface-soft",
                          )}
                        >
                          {/* O NOME do horizonte é o texto principal, e as semanas viram a
                              legenda. Antes o botão mostrava só "12 sem" e o nome ficava
                              escondido no title, então o profissional escolhia um horizonte
                              sem nunca ver o nome dele. */}
                          {h.rotulo} <span className="opacity-70">· {h.semanas} sem</span>
                        </button>
                      ))}
                    </div>
                  </Campo>
                </Card>

                <Card variant="raised" className="p-5 md:p-6">
                  <Campo label="Sessões por semana">
                    <Opcoes
                      valor={String(frequencia)}
                      opcoes={FREQUENCIAS.map((f) => `${f}`)}
                      sufixo="×/sem"
                      onSelect={(v) => setFrequencia(Number(v))}
                    />
                  </Campo>

                  {/* Campo opcional recolhido: ele é a exceção, não a regra, e aberto
                      empurrava a página inteira para baixo. O botão de gerar mora no
                      cartão navy ao lado (e na faixa de resumo, com aluno escolhido). */}
                  <div className="mt-4 border-t border-border pt-4">
                    {maisOpcoes ? (
                      <Campo label="Disponibilidade e observações (opcional)">
                        <input
                          id="disponibilidade"
                          autoFocus
                          value={disponibilidade}
                          onChange={(e) => setDisponibilidade(e.target.value)}
                          placeholder="Ex.: seg/qua/sex à noite, 60 min, academia completa"
                          className="input w-full"
                        />
                      </Campo>
                    ) : (
                      <button
                        onClick={() => setMaisOpcoes(true)}
                        className="text-sm font-semibold text-primary hover:underline"
                      >
                        + disponibilidade e observações
                      </button>
                    )}
                  </div>
                </Card>
              </>
            )}

              <button
                onClick={carregarExemplo}
                className="text-sm text-ink-3 underline decoration-dotted underline-offset-4 hover:text-primary"
              >
                Não sabe por onde começar? Ver um exemplo pronto
              </button>
            </div>

            {/* O cartão navy fixo do protótipo: "O que o Mapa já sabe". O antigo card
                "O motor propõe, você decide" vive aqui agora, com o mesmo conteúdo
                derivado, e o CTA âmbar é o MESMO gerar de sempre. */}
            <MapaJaSabe
              aluno={aluno}
              grupoSlug={grupo}
              objetivo={objetivo}
              objetivoSecundario={objetivoSecundario}
              nivel={nivel}
              modeloPreferidoNome={modeloPreferido ? getModelo(modeloPreferido).nome : undefined}
              podeGerar={!bloquearPorPerfil}
              rotuloGerar={planoSalvoDoAluno || treinoNaoAnunciado ? "Gerar de novo" : "Gerar periodização"}
              onGerar={gerar}
            />
          </div>
        </>
      )}

      {/* Resultado */}
      {plano && (
        <div id="resultado-treino" className="scroll-mt-24">
          {/* O mesmo passo a passo do formulário, agora com o passo 3 aceso: o plano existe. */}
          <div className="mb-3 flex justify-end">
            <PassosDaPrescricao atual={3} />
          </div>
          {/* O rascunho voltou da sessão: o profissional precisa saber que é o trabalho dele
              de volta, e que ele ainda não está guardado no perfil do aluno. */}
          {rascunhoRecuperado && !salvo && (
            <div
              role="status"
              className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-card border border-warning/40 bg-warning-tint px-4 py-3 text-sm text-warning-text"
            >
              <AlertTriangle aria-hidden className="h-4 w-4 shrink-0" />
              <span className="min-w-0 flex-1">
                Rascunho recuperado com as suas edições. Ele ainda não está no perfil do aluno.
              </span>
              <button
                type="button"
                onClick={() => {
                  limparRascunho();
                  setRascunhoRecuperado(false);
                  setPlano(null);
                }}
                className="shrink-0 font-semibold underline underline-offset-4"
              >
                Descartar e recomeçar
              </button>
            </div>
          )}
          <ResultadoPlano
            plano={plano}
            onChange={(p) => {
              setPlano(p);
              setSalvo(false);
            }}
            premium={premium}
            aluno={aluno?.nome}
            alunoObj={aluno}
            fcRepouso={fcRepousoDoAluno}
            prescricaoData={prescricaoData}
            podeSalvar={Boolean(aluno)}
            salvo={salvo}
            onSalvar={salvar}
            onExportar={exportar}
            onPublicar={publicar}
            onEditarContexto={() => { limparRascunho(); setRascunhoRecuperado(false); setPlano(null); }}
          />
        </div>
      )}

      {confirmarPublicacao && diferenca && aluno && (
        <ConfirmarPublicacao
          nomeAluno={aluno.nome}
          diferenca={diferenca}
          onCancelar={() => setConfirmarPublicacao(false)}
          onConfirmar={() => {
            setConfirmarPublicacao(false);
            salvar();
          }}
        />
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
/** O passo a passo 1-2-3 do protótipo: número em círculo, o atual (e os já passados)
 *  em navy, os futuros em cinza. O passo vem do estado real da tela, nunca de um
 *  contador solto. */
function PassosDaPrescricao({ atual }: { atual: 1 | 2 | 3 }) {
  const passos = ["Para quem", "Perfil", "Plano"];
  return (
    <ol aria-label="Etapas da prescrição" className="flex list-none items-center gap-2 p-0 text-xs font-semibold sm:text-sm">
      {passos.map((rotulo, i) => {
        const n = i + 1;
        const alcancado = n <= atual;
        return (
          <li
            key={rotulo}
            aria-current={n === atual ? "step" : undefined}
            className={cn("flex items-center gap-2", alcancado ? "text-ink" : "text-ink-3")}
          >
            {i > 0 && <span aria-hidden className="h-0.5 w-6 rounded-full bg-border" />}
            <span
              className={cn(
                "grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full text-xs",
                !alcancado && "border-2 border-border",
              )}
              style={alcancado ? { background: "#0B1628", color: "#F3F1EA" } : undefined}
            >
              {n}
            </span>
            {rotulo}
          </li>
        );
      })}
    </ol>
  );
}

/**
 * O cartão navy fixo do protótipo: "O que o Mapa já sabe".
 *
 * Substitui o card "O motor propõe, você decide" com a MESMA informação derivada: as
 * restrições vêm do perfil, as estruturais vêm da condição (`restricoesEstruturais`
 * em groupRules, as mesmas que o `check:condicao` trava), o texto do efeito vem do
 * catálogo de restrições, e os equipamentos vêm do cadastro. As linhas do protótipo
 * sem dado real nesta etapa (reavaliação em dias, referências) ficaram de fora de
 * propósito: as referências só existem depois de gerar. Superfície fixa fora do tema
 * claro/escuro, como o herói do aluno.
 */
function MapaJaSabe({
  aluno,
  grupoSlug,
  objetivo,
  objetivoSecundario,
  nivel,
  modeloPreferidoNome,
  podeGerar,
  rotuloGerar,
  onGerar,
}: {
  aluno?: Aluno;
  grupoSlug: string;
  objetivo: GpsObjetivo;
  objetivoSecundario?: GpsObjetivo;
  nivel: Nivel;
  modeloPreferidoNome?: string;
  podeGerar: boolean;
  rotuloGerar: string;
  onGerar: () => void;
}) {
  // TODAS as condições do aluno, não só a principal: é a mesma lista que o motor recebe.
  const slugs = React.useMemo(
    () => slugsClinicosDoPlano({ grupoEspecial: grupoSlug || undefined, condicoesAtencao: aluno?.condicoesAtencao }),
    [grupoSlug, aluno?.condicoesAtencao],
  );
  const tags = React.useMemo(() => {
    const declaradas = (aluno?.restricoes ?? []).map((r) => r.tag);
    const daCondicao = slugs.flatMap((s) => groupGpsRules[s]?.restricoesEstruturais ?? []);
    return [...new Set([...declaradas, ...daCondicao])];
  }, [aluno?.restricoes, slugs]);
  const nome = aluno ? aluno.nome.split(" ")[0] : "Plano avulso";
  const nomesCondicoes = slugs.map((s) => groupGpsRules[s]?.nome ?? s);

  const Linha = ({ marcador, cor, children }: { marcador: string; cor: string; children: React.ReactNode }) => (
    <p className="m-0 flex gap-2.5">
      <span aria-hidden style={{ color: cor }}>
        {marcador}
      </span>
      <span className="min-w-0">{children}</span>
    </p>
  );

  return (
    <aside
      aria-label="O que o Mapa já sabe"
      className="relative overflow-hidden rounded-card p-5 lg:sticky lg:top-20"
      style={{ background: "#0B1628", color: "#F3F1EA" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-20 h-[260px] w-[260px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(20,179,186,.35), rgba(20,179,186,0) 65%)" }}
      />
      <p className="text-2xs font-semibold uppercase tracking-[0.12em]" style={{ color: "#7FE3D8" }}>
        O que o Mapa já sabe
      </p>
      <div className="relative mt-3.5 space-y-3 text-sm leading-relaxed" style={{ color: "#D6DFEA" }}>
        <Linha marcador="●" cor="#7FE3D8">
          <b style={{ color: "#fff" }}>{nome}</b>: {objetivo.toLowerCase()}
          {objetivoSecundario ? ` com ênfase em ${objetivoSecundario.toLowerCase()}` : ""}, nível{" "}
          {nivel.toLowerCase()}.
        </Linha>
        {nomesCondicoes.length > 0 && (
          <Linha marcador="▲" cor="#F0B429">
            <b style={{ color: "#fff" }}>{nomesCondicoes.join(", ")}</b>:{" "}
            {/* Com mais de uma condição, a tela diz qual é a lei da combinação. Sem isto,
                o profissional não tem como saber qual delas mandou em cada limite. */}
            {slugs.length > 1
              ? "onde as condições divergem, o plano aplica sempre a mais conservadora."
              : grupoSlug
                ? "a jornada de fases deste grupo vira a base do macrociclo."
                : "esta condição chega ao motor e ajusta o plano."}
          </Linha>
        )}
        {tags.length > 0 && (
          <Linha marcador="▲" cor="#F0B429">
            {/* "Rebaixado" segue fora daqui. É palavra do motor (peso na ordenação da
                fila), não do profissional; o que interessa dizer é o efeito. */}
            <b style={{ color: "#fff" }}>{tags.length === 1 ? "Restrição" : "Restrições"}</b>:{" "}
            {tags.map((t) => rotuloRestricao(t).toLowerCase()).join(", ")}. Os exercícios incompatíveis ficam de
            fora do plano, e os parecidos que sobram entram no lugar.
          </Linha>
        )}
        {aluno && aluno.equipamentos.length > 0 && (
          <Linha marcador="●" cor="#7FE3D8">
            <b style={{ color: "#fff" }}>Equipamentos</b>:{" "}
            {listaCurta(aluno.equipamentos.map((e) => e.toLowerCase()), 4)}.
          </Linha>
        )}
        {modeloPreferidoNome && (
          <Linha marcador="●" cor="#7FE3D8">
            <b style={{ color: "#fff" }}>Modelo escolhido no Aprender</b>: {modeloPreferidoNome}.
          </Linha>
        )}
      </div>
      <p className="relative mt-4 text-xs" style={{ color: "#8FA0B5" }}>
        O motor propõe, você decide: dá para editar tudo depois de gerar.
      </p>
      {podeGerar && (
        <button
          onClick={onGerar}
          className="relative mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-control text-sm font-bold transition-[filter] hover:brightness-110 active:translate-y-px"
          style={{ background: "#E8A317", color: "#0B1628" }}
        >
          <Sparkles className="h-4 w-4" /> {rotuloGerar}
        </button>
      )}
    </aside>
  );
}

/* ------------------------------- Resultado ------------------------------- */

function ResultadoPlano({
  plano,
  onChange,
  premium,
  aluno,
  alunoObj,
  fcRepouso,
  prescricaoData,
  podeSalvar,
  salvo,
  onSalvar,
  onPublicar,
  onExportar,
  onEditarContexto,
}: {
  plano: PlanoTreino;
  onChange: (p: PlanoTreino) => void;
  premium: boolean;
  aluno?: string;
  /** objeto do aluno (perfil) para a troca segura no editor; ausente = plano avulso */
  alunoObj?: Aluno;
  /** FCrep MEDIDA na avaliação mais recente; o editor precisa dela para recalcular o alvo */
  fcRepouso?: number;
  prescricaoData?: (id: string) => string | undefined;
  podeSalvar: boolean;
  salvo: boolean;
  onSalvar: () => void;
  /** publicar passa pela antessala de diferencas quando ha plano anterior */
  onPublicar: () => void;
  onExportar: (somenteSemana?: number) => void;
  /** Volta ao formulário preservando as respostas (o plano salvo segue no perfil). */
  onEditarContexto: () => void;
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
    // Classes declaradas, idade e FCrep viajam até o editor porque o recálculo ao travar uma
    // variável precisa das três: sem elas, travar reconstruía o alvo sem a personalização e
    // ainda preservava a zona antiga, que é a perda silenciosa que esta onda fecha.
    farmacos: alunoObj?.farmacos,
    farmacosNaoInformado: alunoObj?.farmacosNaoInformado,
    idade: alunoObj?.idade,
    fcRepouso,
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

  // Os tetos do macrociclo EXIBIDO (o principal ou a alternativa): é contra o maior bloco
  // deste plano que as barras dos cartões se medem. Trocar de aba troca a régua junto.
  const tetos = React.useMemo(() => tetosDoPlano(macro), [macro]);

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

  // Semana em foco: o plano deixou de ser uma pilha de mesociclos e virou
  // "mapa -> semana -> sessão". A semana corrente é o ponto de partida, e clicar
  // num chip do gráfico troca o foco sem sair da tela.
  const [semanaFoco, setSemanaFoco] = React.useState(semanaCorrente);
  React.useEffect(() => setSemanaFoco(semanaCorrente), [semanaCorrente]);

  const semanas = React.useMemo(
    () =>
      macro.mesociclos.flatMap((m) =>
        m.microciclos.map((w) => ({ micro: w, meso: m })),
      ),
    [macro],
  );
  const emFoco = semanas.find((x) => x.micro.semana === semanaFoco) ?? semanas[0];

  const trocarMicro = (novo: Microciclo) => {
    if (!emFoco) return;
    trocarMeso({
      ...emFoco.meso,
      microciclos: emFoco.meso.microciclos.map((w) => (w.id === novo.id ? novo : w)),
    });
  };

  return (
    <div className="space-y-5">
      {/* CABEÇALHO DO PLANO: o que é, em que estado está e as duas saídas.
          Substitui o "Passo 2" e o card de resumo: o título já diz objetivo e
          duração, e o estado (rascunho x salvo) fica ao lado, não num card à parte. */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-2xl font-bold text-ink md:text-3xl">
              {/* O NOME do horizonte, e não só o número: era o que o profissional escolheu
                  no formulário e o que ele sumia de vista assim que o plano era gerado. */}
              {plano.objetivo} · {rotuloHorizonte(plano.semanas) ?? `${plano.semanas} semanas`}
            </h2>
            {salvo ? <Pill tone="success">Salvo</Pill> : <Pill tone="warning">Rascunho</Pill>}
            {grupoObj && <Pill tone="analysis">{grupoObj.nome}</Pill>}
            {/* As DEMAIS condições ao lado da principal: o profissional vê, num relance,
                tudo o que o motor considerou. Aqui vale o rótulo clínico, porque esta tela
                é dele; o documento do aluno usa o rótulo de programa. */}
            {(plano.condicoesAtencao ?? []).map((slug) => (
              <Pill key={slug} tone="analysis">
                {getSpecialGroup(slug)?.nome ?? groupGpsRules[slug]?.nome ?? slug}
              </Pill>
            ))}
          </div>
          <p className="mt-0.5 text-sm text-ink-2">
            {modelo.nome}
            {" · "}
            {/* Sem esta saída o formulário fica inalcançável depois de gerar, e
                trocar frequência ou duração exigiria recarregar a página. O plano
                já salvo continua no perfil; o que se descarta é o rascunho da tela. */}
            <button onClick={onEditarContexto} className="font-semibold text-primary hover:underline">
              editar contexto
            </button>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {salvo && <span className="text-xs text-ink-3">Salvo no perfil</span>}
          <button
            onClick={() => onExportar()}
            disabled={!podeSalvar}
            className={cn(buttonClasses("secondary", "sm"), !podeSalvar && "cursor-not-allowed opacity-50")}
          >
            <FileDown className="h-4 w-4" /> Plano completo
          </button>
          <button
            onClick={() => onExportar(semanaFoco)}
            disabled={!podeSalvar}
            className={cn(buttonClasses("secondary", "sm"), !podeSalvar && "cursor-not-allowed opacity-50")}
            title="Uma pagina com a semana aberta, com espaco para o aluno anotar a carga"
          >
            <FileDown className="h-4 w-4" /> Folha da semana {semanaFoco}
          </button>
          {/* O ÚNICO gradiente do produto, por regra do Design System: publicar é o
              momento em que o plano deixa de ser rascunho do profissional e vira o
              treino que o aluno vê. */}
          <button
            onClick={onPublicar}
            disabled={!podeSalvar}
            className={cn(
              buttonClasses("primary", "sm"),
              "gradient-publicar text-white",
              !podeSalvar && "cursor-not-allowed opacity-50",
            )}
          >
            {salvo ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {aluno ? `Publicar no app de ${aluno.split(" ")[0]}` : "Publicar no app do aluno"}
          </button>
        </div>
      </div>

      {!podeSalvar && (
        <p className="text-xs text-ink-3">
          Plano avulso: escolha um aluno para publicar no app dele e exportar com a sua marca.
        </p>
      )}

      {/* Os cartões de modelo do protótipo: o principal com o selo "Sugerido" (é o que o
          motor escolheu para este contexto) e a alternativa ao lado. As mini-barras não
          são enfeite inventado: cada barra é o volume REAL de uma semana daquele
          macrociclo, via agregadoSemana, a mesma fonte do gráfico e da régua. Clicar
          troca a aba, o que o antigo link "trocar modelo" fazia; promover a alternativa
          segue no aviso logo abaixo. */}
      {plano.alternativa && plano.modeloAltId && premium && (
        <div className="grid gap-2.5 sm:grid-cols-2">
          <ModeloCardEscolha
            nome={getModelo(plano.modeloId).nome}
            resumo={getModelo(plano.modeloId).resumo}
            macro={plano.macrociclo}
            sugerido
            ativo={!naAlternativa}
            onClick={() => setAba("principal")}
          />
          <ModeloCardEscolha
            nome={getModelo(plano.modeloAltId).nome}
            resumo={getModelo(plano.modeloAltId).resumo}
            macro={plano.alternativa}
            ativo={naAlternativa}
            onClick={() => setAba("alternativa")}
          />
        </div>
      )}

      {naAlternativa && (
        <Card tone="warning" className="flex flex-wrap items-center gap-3 p-3">
          <p className="min-w-0 flex-1 text-sm text-ink-2">
            Você está vendo a <span className="font-semibold text-ink">alternativa</span> ({getModelo(plano.modeloAltId!).nome}).
            Publicar guarda a opção principal.
          </p>
          <button onClick={promoverAlternativa} className={buttonClasses("secondary", "sm")}>
            Usar esta como principal
          </button>
        </Card>
      )}

      {/* Duas colunas: o plano à esquerda, o porquê à direita. Empilha no mobile. */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-5">
          {/* "Você está aqui" só com plano SALVO: num plano recém-gerado, que ainda
              não começou, a bandeira afirmaria uma semana corrente que não existe.
              Mesmo critério da régua de semanas logo abaixo. */}
          <GraficoProgressao
            macro={macro}
            nivel={plano.nivel}
            modeloId={naAlternativa ? plano.modeloAltId : plano.modeloId}
            semanaAtual={salvo ? semanaCorrente : undefined}
          />

          {/* Régua de semanas: o mapa do plano vira navegação. */}
          <ReguaDeSemanas
            semanas={semanas}
            foco={semanaFoco}
            corrente={salvo ? semanaCorrente : undefined}
            onFocar={setSemanaFoco}
          />

          {emFoco && (
            <SemanaEmFoco
              micro={emFoco.micro}
              meso={emFoco.meso}
              ctx={ctx}
              editavel={premium}
              onChange={trocarMicro}
              onDuplicar={() => {
                // Copia as sessões desta semana para as demais semanas de CARGA do
                // mesmo bloco (ids novos, senão duas semanas apontariam para o mesmo
                // bloco e a execução do aluno grudaria nas duas).
                // O meso ANTES vai inteiro para o desfazer: esta ação reescreve várias
                // semanas de ajuste manual de uma vez, e é a mais cara de refazer à mão.
                const mesoAntes = emFoco.meso;
                trocarMeso({
                  ...emFoco.meso,
                  microciclos: emFoco.meso.microciclos.map((w) =>
                    w.id === emFoco.micro.id || w.tipo === "deload"
                      ? w
                      : {
                          ...w,
                          sessoes: emFoco.micro.sessoes.map((s) => ({
                            ...s,
                            id: `ses-${uid()}`,
                            blocos: s.blocos.map((b) => ({ ...b, id: `blk-${uid()}` })),
                          })),
                        },
                  ),
                });
                const nReescritas = emFoco.meso.microciclos.filter(
                  (w) => w.id !== emFoco.micro.id && w.tipo !== "deload",
                ).length;
                toastDesfazer(
                  nReescritas === 1
                    ? `Semana ${emFoco.micro.semana} copiada para 1 semana de carga do bloco.`
                    : `Semana ${emFoco.micro.semana} copiada para ${nReescritas} semanas de carga do bloco.`,
                  () => trocarMeso(mesoAntes),
                );
              }}
            />
          )}

          {/*
            O PLANO BLOCO A BLOCO, lado a lado e sempre visível (protótipo do editor).
            Ele morava dentro de um <details>: a camada que responde "para onde este plano
            está indo" ficava atrás de um clique, enquanto a semana solta ficava na frente.
            Agora cada cartão traz a assinatura do bloco na face (as duas barras e as três
            direções) e abre só para o detalhe fino das semanas.
          */}
          <section>
            <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-display text-base font-bold text-ink">O plano bloco a bloco</h3>
              <span className="text-xs text-ink-3">as barras comparam os blocos deste plano</span>
            </div>
            <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(15rem,1fr))]">
              {macro.mesociclos.map((m, i) => (
                <MesocicloCard
                  key={m.id}
                  meso={m}
                  indice={i}
                  ctx={ctx}
                  editavel={premium}
                  onChange={trocarMeso}
                  atual={m.id === mesoAtual?.id}
                  semanaCorrente={semanaCorrente}
                  reavaliarHref={reavaliarHref}
                  tetos={tetos}
                />
              ))}
            </div>
            <div className="mt-3">
              <ModeloExplicacao modelo={modelo} />
            </div>
          </section>
        </div>

        {/* TRILHO: por que estes números, equilíbrio da semana e avisos. */}
        <TrilhoDoPlano
          plano={plano}
          micro={emFoco?.micro}
          meso={emFoco?.meso}
          modelo={modelo}
          alunoObj={alunoObj}
          refIds={plano.refIds}
        />
      </div>

      <p className="rounded-card bg-surface-soft p-3 text-xs text-ink-3">
        As faixas são referência e não substituem a sua decisão. O plano apoia a organização e a justificativa;
        a conduta é do profissional habilitado. Para condições de saúde, integre a liberação e o acompanhamento
        do profissional de saúde.
      </p>
    </div>
  );
}

/* --------------------------- Cartões de modelo --------------------------- */

/**
 * Cartão de modelo do protótipo, no resultado: nome, resumo do catálogo e mini-barras.
 * Cada barra é o volume real de uma semana do macrociclo (`agregadoSemana`, a mesma
 * fonte do gráfico), com a descarga em âmbar: nada desenhado à mão. O selo "Sugerido"
 * marca o principal, que é o modelo que o motor escolheu para este contexto.
 */
function ModeloCardEscolha({
  nome,
  resumo,
  macro,
  sugerido,
  ativo,
  onClick,
}: {
  nome: string;
  resumo: string;
  macro: Macrociclo;
  sugerido?: boolean;
  ativo: boolean;
  onClick: () => void;
}) {
  const barras = React.useMemo(() => {
    const micros = macro.mesociclos.flatMap((m) => m.microciclos);
    const vols = micros.map((w) => ({ id: w.id, deload: w.tipo === "deload", vol: agregadoSemana(w).volume }));
    const teto = Math.max(1, ...vols.map((v) => v.vol));
    return vols.map((v) => ({ ...v, h: Math.max(3, Math.round((v.vol / teto) * 20)) }));
  }, [macro]);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={cn(
        "relative rounded-control border p-4 text-left transition-colors",
        ativo ? "border-primary bg-primary-tint" : "border-border bg-surface hover:bg-surface-soft",
      )}
    >
      {sugerido && (
        <Pill tone="primary" className="absolute right-3 top-3">
          Sugerido
        </Pill>
      )}
      <b className={cn("block font-display text-base font-bold text-ink", sugerido && "pr-20")}>{nome}</b>
      <p className="mt-1 text-xs leading-relaxed text-ink-2">{resumo}</p>
      <div aria-hidden className="mt-3 flex items-end gap-px" style={{ height: 20 }}>
        {barras.map((b) => (
          <span
            key={b.id}
            className={cn("flex-1 rounded-sm", b.deload ? "bg-warning-fill" : "bg-primary")}
            style={{ height: b.h }}
          />
        ))}
      </div>
    </button>
  );
}

/* --------------------------- Régua de semanas --------------------------- */

/**
 * A FITA DAS SEMANAS MOSTRA A DOSE, e não só o número da semana.
 *
 * O Filipe: "a visualização das edições das semanas na prescrição do treino está bem ruim e
 * confusa". Estava: eram círculos idênticos, um por semana, e nenhum deles dizia o que a
 * semana prescrevia. Num plano de 24 semanas isso vira uma parede de vinte e quatro
 * bolinhas. A progressão, que é a razão de existir de uma periodização, não aparecia em
 * lugar nenhum do instrumento com que se navega o plano.
 *
 * Agora a altura da barra é o VOLUME RELATIVO da semana, lido de `agregadoSemana`, que é a
 * MESMA função de onde sai a curva do gráfico logo acima. Fonte única de propósito: fita e
 * gráfico não têm como se contradizer, que é a armadilha clássica deste produto.
 *
 * A descarga ganhou HACHURA além da cor âmbar. Cor sozinha não sobrevive ao daltonismo nem à
 * impressão em preto e branco, e a legenda em texto ("âmbar = descarga") era a confissão de
 * que a forma não estava dizendo nada.
 *
 * A descarga vem do TIPO do microciclo (dado do plano), não de uma convenção visual
 * inventada aqui: se um dia o motor mudar onde ela cai, a barra acompanha.
 */
function ReguaDeSemanas({
  semanas,
  foco,
  corrente,
  onFocar,
}: {
  semanas: { micro: Microciclo; meso: Mesociclo }[];
  foco: number;
  corrente?: number;
  onFocar: (n: number) => void;
}) {
  // Agrupa preservando a ordem de chegada: a régua espelha o plano, não reordena nada.
  const porBloco = React.useMemo(() => {
    const grupos: { meso: Mesociclo; itens: Microciclo[] }[] = [];
    for (const { micro, meso } of semanas) {
      const ultimo = grupos[grupos.length - 1];
      if (ultimo && ultimo.meso.id === meso.id) ultimo.itens.push(micro);
      else grupos.push({ meso, itens: [micro] });
    }
    return grupos;
  }, [semanas]);

  /*
   * O teto da escala é o maior volume do plano inteiro, e não o do bloco: barra alta num
   * bloco tem que significar a mesma coisa que barra alta em outro, senão a fita compara
   * cada bloco consigo mesmo e some justamente a progressão entre blocos.
   */
  const volumes = React.useMemo(
    () => new Map(semanas.map(({ micro }) => [micro.id, agregadoSemana(micro).volume])),
    [semanas],
  );
  const teto = Math.max(1, ...volumes.values());
  const ALTURA = 60;
  const PISO = 10; // barra de volume zero ainda precisa ser clicável e visível

  return (
    <Card className="p-4">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <div>
          <p className="text-2xs font-semibold uppercase tracking-wide text-ink-3">Semanas do plano</p>
          <p className="text-xs text-ink-3">A altura é o volume relativo da semana. Clique para editar.</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs text-ink-2">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-3.5 rounded-sm bg-primary" /> Carga
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-3.5 rounded-sm border border-warning/45 bg-warning-tint [background-image:repeating-linear-gradient(135deg,transparent,transparent_3px,rgb(var(--warning-rgb)/0.3)_3px,rgb(var(--warning-rgb)/0.3)_6px)]" />{" "}
            Descarga
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-3.5 rounded-sm bg-primary ring-2 ring-ink ring-offset-1 ring-offset-surface" /> Em edição
          </span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {porBloco.map(({ meso, itens }) => (
          <div key={meso.id} className="rounded-control border border-border p-3">
            <p className="mb-2 text-2xs font-semibold uppercase tracking-wide text-ink-3">
              {rotuloMeso(meso)}
              {meso.foco ? <span className="font-normal normal-case tracking-normal"> · {meso.foco}</span> : null}
            </p>
            <div className="flex items-end gap-1.5" style={{ height: ALTURA + 22 }}>
              {itens.map((micro) => {
                const ativo = micro.semana === foco;
                const descarga = micro.tipo === "deload";
                const vol = volumes.get(micro.id) ?? 0;
                const h = Math.max(PISO, Math.round((vol / teto) * ALTURA));
                return (
                  <button
                    key={micro.id}
                    onClick={() => onFocar(micro.semana)}
                    aria-pressed={ativo}
                    aria-label={`Semana ${micro.semana}, ${rotuloMeso(meso)}${descarga ? ", descarga" : ""}`}
                    className="group flex flex-1 flex-col items-center justify-end gap-1"
                    style={{ height: ALTURA + 22 }}
                  >
                    <span
                      style={{ height: h }}
                      className={cn(
                        "w-full rounded-t-md rounded-b-sm transition-colors",
                        descarga
                          ? "border border-warning/45 bg-warning-tint [background-image:repeating-linear-gradient(135deg,transparent,transparent_3px,rgb(var(--warning-rgb)/0.3)_3px,rgb(var(--warning-rgb)/0.3)_6px)]"
                          : "bg-primary group-hover:brightness-110",
                        !descarga && !ativo && "opacity-70",
                        ativo && "ring-2 ring-ink ring-offset-1 ring-offset-surface",
                      )}
                    />
                    <span
                      className={cn(
                        "tabular text-xs",
                        ativo ? "font-bold text-ink" : descarga ? "font-semibold text-warning" : "font-semibold text-ink-2",
                      )}
                    >
                      {micro.semana}
                      {micro.semana === corrente && (
                        <span aria-hidden className="ml-0.5 inline-block h-1.5 w-1.5 rounded-full bg-primary align-middle" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {corrente != null && (
        <p className="mt-2.5 text-2xs text-ink-3">
          <span aria-hidden className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-primary align-middle" />
          O ponto marca a semana de hoje.
        </p>
      )}
    </Card>
  );
}

/* --------------------------- Semana em foco --------------------------- */

/** A semana escolhida, com as sessões em abas e cada sessão aberta no editor. */
function SemanaEmFoco({
  micro,
  meso,
  ctx,
  editavel,
  onChange,
  onDuplicar,
}: {
  micro: Microciclo;
  meso: Mesociclo;
  ctx: ContextoFaixa;
  editavel: boolean;
  onChange: (m: Microciclo) => void;
  onDuplicar: () => void;
}) {
  const [sessaoIdx, setSessaoIdx] = React.useState(0);
  React.useEffect(() => setSessaoIdx(0), [micro.id]);
  const sessao = micro.sessoes[Math.min(sessaoIdx, micro.sessoes.length - 1)];

  const trocarSessao = (nova: Sessao) =>
    onChange({ ...micro, sessoes: micro.sessoes.map((s) => (s.id === nova.id ? nova : s)) });

  return (
    <Card variant="raised" className="p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-bold text-ink">
            Semana {micro.semana}{" "}
            <span className="font-sans text-sm font-normal text-ink-2">
              {rotuloMeso(meso)}
              {micro.tipo === "deload" ? " · descarga" : ""}
              {meso.foco ? ` · ${meso.foco}` : ""}
            </span>
          </h3>
        </div>
        {editavel && micro.tipo !== "deload" && (
          <button onClick={onDuplicar} className={buttonClasses("secondary", "sm")}>
            Aplicar às outras semanas do bloco
          </button>
        )}
      </div>

      {micro.sessoes.length === 0 ? (
        <p className="mt-3 rounded-control border border-dashed border-border p-3 text-sm text-ink-3">
          Esta semana não tem sessão. Ajuste no plano bloco a bloco.
        </p>
      ) : (
        <>
          <div role="tablist" aria-label="Sessões da semana" className="mt-3 flex flex-wrap gap-1.5 border-b border-border">
            {micro.sessoes.map((s, i) => (
              <button
                key={s.id}
                role="tab"
                aria-selected={i === sessaoIdx}
                onClick={() => setSessaoIdx(i)}
                className={cn(
                  "-mb-px border-b-2 px-3 py-2 text-sm font-semibold transition-colors",
                  i === sessaoIdx
                    ? "border-ink text-ink"
                    : "border-transparent text-ink-2 hover:text-ink",
                )}
              >
                {s.nome}
                {s.foco && <span className="ml-1 font-normal text-ink-3">{s.foco}</span>}
              </button>
            ))}
          </div>

          {sessao && (
            <div className="mt-3">
              <SessaoBloco
                sessao={sessao}
                ctx={ctx}
                editavel={editavel}
                onChange={trocarSessao}
                onRemover={() => {
                  const antes = micro;
                  onChange({ ...micro, sessoes: micro.sessoes.filter((s) => s.id !== sessao.id) });
                  toastDesfazer(`${sessao.nome} removida da semana ${micro.semana}.`, () => onChange(antes));
                }}
              />
            </div>
          )}
        </>
      )}
    </Card>
  );
}


/* ------------------------------ Trilho lateral ----------------------------- */

/** Onde as regiões do corpo caem no equilíbrio da semana. */
const REGIAO: Record<string, "Inferiores" | "Superiores" | "Core" | "Corpo todo"> = {
  "Membros inferiores": "Inferiores",
  Peitorais: "Superiores",
  Costas: "Superiores",
  Ombros: "Superiores",
  Braços: "Superiores",
  "Core (tronco)": "Core",
  "Corpo todo": "Corpo todo",
};

/**
 * O porquê ao lado do plano: as três camadas da casa (Resumo, Na prática, Ciência),
 * o equilíbrio da semana e os avisos.
 *
 * Duas regras de honestidade aqui:
 *  - o equilíbrio conta SÉRIES de força, e a legenda diz isso. Percentual de "blocos"
 *    mente (um bloco de 5 séries pesa igual a um de 2), e misturar minuto de aeróbio
 *    com série de força no mesmo denominador mente mais ainda: o aeróbio sai numa
 *    linha própria, em minutos.
 *  - o aviso só existe quando a contagem de fato dispara. Card de aviso vazio ensina
 *    o leitor a pular a seção justamente no dia em que ela tem conteúdo.
 */
/**
 * Uma lista de nomes que cabe numa frase: até três, e o resto vira contagem. O bloco de
 * consequências pode receber dez exercícios, e dez nomes numa linha não se lê.
 */
function listaCurta(nomes: string[], max = 3): string {
  if (nomes.length <= max) return nomes.join(", ");
  return `${nomes.slice(0, max).join(", ")} e mais ${nomes.length - max}`;
}

function TrilhoDoPlano({
  plano,
  micro,
  meso,
  modelo,
  alunoObj,
  refIds,
}: {
  plano: PlanoTreino;
  micro?: Microciclo;
  meso?: Mesociclo;
  modelo: ReturnType<typeof getModelo>;
  alunoObj?: Aluno;
  refIds: string[];
}) {
  const faixa = getFaixa(plano.objetivo);

  /*
   * O que a condição e as restrições fizeram COM O CATÁLOGO deste aluno.
   *
   * A seleção de exercícios é determinística e idêntica em todas as semanas, então roda uma
   * vez aqui, com as mesmas entradas com que o plano foi gerado. Sem aluno (plano avulso),
   * só as restrições que a própria condição impõe entram, que é o mesmo que a geração faz.
   */
  const consequencias = React.useMemo(
    () =>
      consequenciasDoPlano({
        objetivo: plano.objetivo,
        nivel: plano.nivel,
        semanas: plano.semanas,
        frequencia: plano.frequenciaSemanal,
        grupoEspecial: alunoObj?.grupoEspecial ?? plano.grupoEspecial,
        condicoesAtencao: alunoObj?.condicoesAtencao,
        objetivoSecundario: plano.objetivoSecundario,
        restricoes: alunoObj?.restricoes,
        // O mesmo filtro de equipamentos da geração, senão o bloco "Sobram N compatíveis"
        // contaria exercícios que o plano não tem como usar.
        equipamentos: alunoObj?.equipamentos,
      }),
    [plano, alunoObj],
  );

  /**
   * A DIREÇÃO QUE ESTE PLANO DE FATO TOMOU, medida das semanas de CARGA.
   *
   * As descargas ficam de fora da conta de propósito: elas caem por desenho, e incluí-las
   * faria qualquer plano parecer ondulado. O que se mede é o que acontece entre a primeira e
   * a última semana em que o aluno carrega.
   */
  const direcaoReal = React.useMemo(() => {
    const cargas = plano.macrociclo.mesociclos
      .flatMap((m) => m.microciclos)
      .filter((w) => w.tipo === "carga");
    const soma = (w: (typeof cargas)[number]) => {
      let vol = 0;
      let carga = 0;
      let n = 0;
      for (const s of w.sessoes)
        for (const b of s.blocos) {
          if (b.tipo !== "forca") continue;
          if (b.seriesAlvo != null && b.repsAlvo != null) vol += b.seriesAlvo * b.repsAlvo;
          // Intensidade do jeito que o aluno sente: menos reserva é mais esforço.
          if (b.rirAlvo != null) {
            carga += -b.rirAlvo;
            n++;
          } else if (b.cargaRelativaAlvo != null) {
            carga += b.cargaRelativaAlvo;
            n++;
          }
        }
      return { vol, int: n ? carga / n : null };
    };
    if (cargas.length < 2) return { frase: "" };
    const a = soma(cargas[0]);
    const z = soma(cargas[cargas.length - 1]);
    const dir = (ini: number | null, fim: number | null) =>
      ini == null || fim == null || Math.abs(fim - ini) < Math.max(1, Math.abs(ini) * 0.02)
        ? "estavel"
        : fim > ini
          ? "sobe"
          : "reduz";
    const dv = dir(a.vol, z.vol);
    const di = dir(a.int, z.int);
    const rot: Record<string, string> = { sobe: "sobe", reduz: "reduz", estavel: "fica estável" };
    if (dv === "estavel" && di === "estavel")
      return { frase: "Neste plano, volume e intensidade ficam estáveis nas semanas de carga: a progressão acontece na carga que o aluno consegue levantar dentro da mesma faixa." };
    if (dv === "estavel")
      return { frase: `Neste plano, o volume fica estável e a intensidade ${rot[di]} ao longo das semanas de carga.` };
    if (di === "estavel")
      return { frase: `Neste plano, o volume ${rot[dv]} e a intensidade fica estável ao longo das semanas de carga.` };
    return { frase: `Neste plano, o volume ${rot[dv]} e a intensidade ${rot[di]} ao longo das semanas de carga.` };
  }, [plano]);

  // Equilíbrio: séries de força DINÂMICA por região, a partir dos blocos da semana em foco.
  // O isométrico de condição fica fora deste denominador pela mesma regra que tirou o
  // aeróbio: série de 2 minutos sustentados não é série dinâmica, e a dose dele é protocolo
  // clínico fechado, não escolha de distribuição. Ele sai numa linha própria, em sessões.
  const equilibrio = React.useMemo(() => {
    const porRegiao = new Map<string, number>();
    let series = 0;
    let minutosAerobio = 0;
    let sessoesIso = 0;
    for (const s of micro?.sessoes ?? []) {
      for (const b of s.blocos) {
        if (b.tipo === "aerobio") {
          const m = /(\d+)/.exec(b.duracaoAlvoMin != null ? String(b.duracaoAlvoMin) : (b.duracao ?? ""));
          if (m) minutosAerobio += Number(m[1]);
          continue;
        }
        if (b.tipo === "isometrico") {
          sessoesIso++;
          continue;
        }
        const ex = b.exercicioSlug ? exercises.find((e) => e.slug === b.exercicioSlug) : undefined;
        const regiao = ex ? (REGIAO[ex.grupoMuscular] ?? "Corpo todo") : "Sem classificação";
        // Séries do ALVO da semana quando existe; senão, o piso da faixa escrita.
        const n = b.seriesAlvo ?? Number(/(\d+)/.exec(b.series ?? "")?.[1] ?? 0);
        if (!n) continue;
        series += n;
        porRegiao.set(regiao, (porRegiao.get(regiao) ?? 0) + n);
      }
    }
    return {
      series,
      minutosAerobio,
      sessoesIso,
      linhas: [...porRegiao.entries()]
        .map(([regiao, n]) => ({ regiao, n, pct: series ? Math.round((n / series) * 100) : 0 }))
        .sort((a, b) => b.n - a.n),
    };
  }, [micro]);

  // Aviso: concentração de uma região só. O corte é declarado, não mágico, e é POR REGIÃO:
  // "Superiores" agrega 4 famílias (peito, costas, ombro, braço), então 60% ali é uma semana
  // normal; o corte dele fica em 75. Inferiores e Core são famílias únicas: 60.
  const CONCENTRACAO: Record<string, number> = { Superiores: 75 };
  const concentrada = equilibrio.linhas.find(
    (l) => l.pct >= (CONCENTRACAO[l.regiao] ?? 60) && l.regiao !== "Corpo todo",
  );

  const resumo = (
    <ul className="space-y-2.5">
      <ItemPorque tom="analysis" titulo={`${faixa.reps.valor}, ${faixa.intensidade.valor}`}>
        A faixa de {plano.objetivo.toLowerCase()} para nível {plano.nivel.toLowerCase()}. O alvo de cada
        semana sai de dentro dela, nunca fora.
      </ItemPorque>
      {/*
        O MODELO DIZ O QUE ELE FEZ NESTE PLANO, E NÃO O QUE ELE FAZ EM GERAL.

        O `resumo` do catálogo é a definição do modelo ("progressão de mais volume e menos
        intensidade para menos volume e mais intensidade"). Impresso cru, ele vira uma
        promessa sobre ESTE plano, e o Filipe pegou a contradição no gráfico: cartão dizendo
        linear e a curva sem descer volume nenhum.

        Medido no plano do print (resistência muscular, iniciante, osteoartrite, 24 semanas),
        olhando só as semanas de carga: a intensidade sobe de 40,5 para 50,5, monotônica, e o
        volume fica em 570 a 576, ou seja parado. O que oscila no desenho são as descargas,
        que derrubam o volume para 270 a cada quatro semanas.

        E o volume parado NÃO é defeito do motor: é a faixa citada. Segundo o PubMed, o
        posicionamento do ACSM sobre progressão (PMID 19204579) recomenda, para resistência
        muscular local, "high repetitions (>15)" com carga de 40 a 60% de 1RM. A fonte não
        fixa teto de repetição, e séries têm só dois valores (2 a 3). Não há onde o volume
        descer sem inventar número, e inventar número é justamente o que este produto não faz.

        Então quem se corrige é a FRASE: ela passa a descrever a direção que este plano de
        fato tomou, medida das semanas de carga, e diz onde a progressão aconteceu.
      */}
      <ItemPorque tom="primary" titulo={modelo.nome}>
        {direcaoReal.frase} {modelo.resumo}
      </ItemPorque>
      {plano.objetivoSecundario && (
        <ItemPorque tom="analysis" titulo={`Dois objetivos: ${plano.objetivo} e ${plano.objetivoSecundario}`}>
          {linhaObjetivos(plano.objetivo, plano.objetivoSecundario)}
        </ItemPorque>
      )}
      {/*
        O QUE ISTO MOSTRA MUDOU, E O FILIPE ESTAVA CERTO NAS DUAS CRÍTICAS.
        Antes: `alunoObj.restricoes.map(rotuloRestricao)`, ou seja o ECO do campo que o
        profissional preencheu. Para um aluno de 70 anos com obesidade, diabetes e
        hipertensão estágio 2, e sem restrição física declarada, o bloco saía
        "Restrição de Erbênio: Nenhuma restrição física. Os exercícios incompatíveis ficam
        fora do plano; os limítrofes entram rebaixados". Duas coisas erradas ao mesmo tempo:
        a frase afirmava exclusão e rebaixamento sem ter QUALQUER dado sobre isso, e o assunto
        do bloco era o corpo do aluno quando o que interessa ali é o EXERCÍCIO, o que as
        condições dele impedem ou pedem para evitar na hora de executar.
        Agora sai o que o motor de fato fez com o catálogo (ver `consequenciasDoPlano`).
      */}
      <ItemPorque
        tom={consequencias.evitados.length ? "warning" : "analysis"}
        titulo={
          consequencias.evitados.length
            ? `${consequencias.evitados.length} exercício${consequencias.evitados.length === 1 ? "" : "s"} evitado${consequencias.evitados.length === 1 ? "" : "s"}`
            : "Nenhum exercício precisou ser evitado"
        }
      >
        {consequencias.restricoes.length > 0 && (
          <>
            <span className="font-semibold text-ink">Considerado:</span>{" "}
            {listaCurta(consequencias.restricoes, 4)}.{" "}
          </>
        )}
        {consequencias.evitados.length > 0 ? (
          <>
            Ficaram fora do plano: {listaCurta(consequencias.evitados.map((x) => x.nome))}.{" "}
            {/* O motivo do primeiro basta na linha. A lista completa nao vive em lugar
                nenhum ainda (a primeira versao deste comentario dizia "no Prontuario", e era
                falso): repetir seis motivos aqui viraria paragrafo que ninguem le, entao os
                demais ficam por trás do numero do titulo ate existir uma superficie propria. */}
            {consequencias.evitados[0].nome}, por exemplo, saiu por{" "}
            {consequencias.evitados[0].motivo.replace(/^[^:]+:\s*/, "").toLowerCase()}{" "}
          </>
        ) : (
          <>Nada no catálogo deste aluno precisou ficar de fora. </>
        )}
        Sobram {consequencias.elegiveis} exercícios compatíveis.
        {consequencias.faltouCatalogo &&
          " O catálogo não tem exercícios seguros suficientes para esta frequência: vale rever equipamentos ou restrições."}
      </ItemPorque>
    </ul>
  );

  /*
   * O RACIOCÍNIO SAI EM TÓPICOS, NÃO EM BLOCO CORRIDO.
   *
   * O texto sempre foi uma lista de assuntos independentes (o modelo, o perfil de cuidado, o
   * cardio, o isométrico, a duração, a dose por idade), mas chegava aqui como um parágrafo
   * único de vinte linhas. O Filipe pegou: "está tudo correto, mas texto corridão". Conteúdo
   * certo que ninguém consegue varrer com o olho é conteúdo que não chega.
   *
   * Nenhuma palavra muda. O que muda é que cada assunto ganha a mesma marca de tópico da aba
   * Resumo ao lado (`ItemPorque`), para as duas camadas se lerem do mesmo jeito.
   */
  const topicos = React.useMemo(() => topicosDoRaciocinio(plano.raciocinio), [plano.raciocinio]);

  const pratica = (
    <div className="space-y-3 text-sm text-ink-2">
      <ul className="space-y-2.5">
        {topicos.map((t, i) => (
          <li key={i} className="border-l-2 border-analysis pl-3">
            {t.titulo && <p className="text-sm font-semibold text-ink">{t.titulo}</p>}
            <p className="text-sm text-ink-2">{t.texto}</p>
          </li>
        ))}
        {meso && (
          <li className="border-l-2 border-primary pl-3">
            <p className="text-sm font-semibold text-ink">Este bloco</p>
            <p className="text-sm text-ink-2">
              {rotuloMeso(meso)}
              {meso.foco ? `, ${meso.foco}` : ""}.
            </p>
          </li>
        )}
      </ul>
      <p className="text-xs text-ink-3">
        O que você editar aqui vale para a semana escolhida. Para mexer na tendência do bloco inteiro,
        use o plano bloco a bloco.
      </p>
    </div>
  );

  return (
    <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
      <Card className="p-4">
        <TresCamadas resumo={resumo} pratica={pratica} refs={refIds} ariaLabel="Por que estes números" />
      </Card>

      {/*
        DE ONDE VEM CADA LIMITE. Vive aqui, colado em "Por que estes números", porque é a
        resposta mais literal a essa pergunta: o teto de carga e a reserva de repetições eram
        aplicados pelo motor e não apareciam em tela nenhuma do produto. O componente some
        sozinho quando o aluno não tem condição nem idade declarada.
      */}
      <Card className="p-4">
        <DeOndeVemOLimite
          grupoEspecial={alunoObj?.grupoEspecial ?? plano.grupoEspecial}
          condicoesAtencao={alunoObj?.condicoesAtencao}
          idade={alunoObj?.idade}
        />
      </Card>

      {equilibrio.series > 0 && (
        <Card className="p-4">
          <h3 className="text-2xs font-semibold uppercase tracking-wide text-ink-3">Equilíbrio da semana</h3>
          <ul className="mt-2 space-y-2">
            {equilibrio.linhas.map((l) => (
              <li key={l.regiao}>
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="text-ink-2">{l.regiao}</span>
                  <span className="tabular font-semibold text-ink">{l.pct}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-mute">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${l.pct}%` }} />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-2xs leading-snug text-ink-3">
            Percentual sobre as {equilibrio.series} séries de força da semana.
            {equilibrio.minutosAerobio > 0 &&
              ` O aeróbio entra em minutos, fora desta conta: ${equilibrio.minutosAerobio} min.`}
            {equilibrio.sessoesIso > 0 &&
              ` O isométrico de condição é protocolo próprio, fora desta conta: ${equilibrio.sessoesIso} ${equilibrio.sessoesIso === 1 ? "sessão" : "sessões"} na semana.`}
          </p>
        </Card>
      )}

      {concentrada && (
        <Card tone="warning" className="p-4">
          <p className="text-sm text-ink-2">
            <span className="font-semibold text-ink">1 aviso.</span> {concentrada.pct}% das séries desta
            semana são de {concentrada.regiao.toLowerCase()}. Acima de {CONCENTRACAO[concentrada.regiao] ?? 60}%
            nessa região, vale conferir se o resto do corpo está coberto no bloco.
          </p>
        </Card>
      )}
    </aside>
  );
}

function ItemPorque({
  tom,
  titulo,
  children,
}: {
  tom: "analysis" | "primary" | "warning";
  titulo: string;
  children: React.ReactNode;
}) {
  const cor = tom === "analysis" ? "border-analysis" : tom === "primary" ? "border-primary" : "border-warning";
  return (
    <li className={cn("border-l-2 pl-3", cor)}>
      <p className="text-sm font-semibold text-ink">{titulo}</p>
      <p className="text-sm text-ink-2">{children}</p>
    </li>
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
            // Pílula do protótipo: a ativa fica navy (bg-ink) com texto claro.
            "inline-flex min-h-[44px] items-center justify-center rounded-full border px-4 py-1.5 text-sm transition-colors",
            valor === o ? "border-ink bg-ink font-semibold text-surface" : "border-border text-ink-2 hover:bg-surface-soft",
          )}
        >
          {o}
          {sufixo}
        </button>
      ))}
    </div>
  );
}
