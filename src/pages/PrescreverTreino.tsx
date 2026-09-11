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
  FileDown,
  Check,
  AlertTriangle,
  MapPin,
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CircleDashed,
  Send,
  Smartphone,
} from "lucide-react";
import { Card, Pill, buttonClasses, SectionHeader } from "@/components/ui/primitives";
import { rascunhoDoAluno } from "@/lib/publicacao";
import { PaywallCard } from "@/components/ui/PaywallCard";
import { SeloRCD } from "@/components/rcd/SeloRCD";
import {
  ControlesDaSemana,
  EfeitoDaEdicaoCard,
  GraficoProgressao,
  MesocicloCard,
  MesocicloCompacto,
  ModeloExplicacao,
  PainelDoBloco,
  SessaoBloco,
  tetosDoPlano,
  chaveDaFase,
  corDaFase,
  indicesDeCorDasFases,
  nomeDaFase,
  type ContextoFaixa,
} from "@/components/treino/PlanoEditor";
import { efeitoDaEdicao, type EfeitoDaEdicao } from "@/lib/gps/efeitoDaEdicao";
import { getParam } from "@/data/monitoringParameters";
import { DeOndeVemOLimite } from "@/components/treino/DeOndeVemOLimite";
import { TresCamadas, GrupoRecolhivel, ItemRecolhivel } from "@/components/ui/camadas";
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
  rotuloFrequencia,
  sessoesPrincipais,
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
import { bibliografia, getReferencia } from "@/data/referencias";
import { exportPlanoPDF } from "@/lib/exportPlano";
import { diferencaDePlano } from "@/lib/gps/diffPlano";
import { ConfirmarPublicacao } from "@/components/treino/ConfirmarPublicacao";
import { useAlunos, useUser, isPremiumUnlocked, marcaDoUsuario, uid } from "@/lib/store";
import { prontidaoParaPrescrever } from "@/lib/gps/prontidao";
import { dataReavaliacao } from "@/lib/gps/proximoPasso";
import { blocoCompleto, type Execucao, type SessaoFeedback } from "@/data/execucao";
import { ProntidaoAviso } from "@/components/alunos/ProntidaoAviso";
import { groupGpsRules } from "@/lib/gps/groupRules";
import { rotuloRestricao } from "@/lib/gps/restricoes";
import { getSemaforo } from "@/data/semaforo";
import { intervaloDe } from "@/lib/gps/faixasParse";
import { ObjetivoDuplo } from "@/components/gps/ObjetivoDuplo";
import { parValido, linhaObjetivos } from "@/lib/gps/objetivos";
import { useDialog } from "@/lib/useDialog";
import { toast, toastDesfazer } from "@/lib/toast";
import { AvatarAluno } from "@/components/alunos/FotoAluno";

const NIVEIS: Nivel[] = ["Iniciante", "Intermediário", "Avançado"];
// A lista vive em src/data/periodizacao.ts: o PDF e o cabeçalho do plano nomeiam o mesmo
// horizonte que este botão escolheu. `gerarPlano` segue recebendo semanas.
const HORIZONTES = HORIZONTES_PLANO;
const FREQUENCIAS = [2, 3, 4, 5, 6];

const fmtDataCurta = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(ts));

/*
 * RASCUNHO DE PLANO: UM POR ALUNO, VISÍVEL NA CARTEIRA INTEIRA (src/lib/publicacao.ts).
 *
 * Até 10/09/2026 ele ficava na sessão do navegador e só esta tela sabia dele. O profissional
 * gerava o treino, saía, e a lista e a ficha diziam "Sem treino" de quem tinha um pronto
 * esperando um clique; o Filipe achou a publicação "pouco clara", e era isso. Agora o rascunho
 * mora na store (neste aparelho, nunca na tabela de planos que o aluno lê), a lista e a ficha
 * mostram "Não publicado" com o botão ao lado, e esta tela o devolve ao voltar. Guardar por
 * aluno segue evitando o pior erro possível aqui: devolver o rascunho de um aluno na tela de
 * outro.
 */
const rascunhoGuardado = (alunoId?: string | null): PlanoTreino | undefined =>
  alunoId ? rascunhoDoAluno(useAlunos.getState().rascunhos, alunoId) : undefined;

/** Em que pé está a publicação do plano aberto nesta tela. */
type EstadoNoEditor = "avulso" | "nao-publicado" | "substitui" | "alteracoes" | "publicado";

/* ------------------------------- Página ------------------------------- */

export function PrescreverTreino() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const alunos = useAlunos((s) => s.alunos);
  const planosSalvos = useAlunos((s) => s.planos);
  const execucoes = useAlunos((s) => s.execucoes);
  const sessaoFeedbacks = useAlunos((s) => s.sessaoFeedbacks);
  const rascunhos = useAlunos((s) => s.rascunhos);
  const prescricoes = useAlunos((s) => s.prescricoes);
  const avaliacoes = useAlunos((s) => s.avaliacoes);
  // A lista de alunos do formulário: busca e "ver todos" (ver o comentário da lista).
  const [buscaAluno, setBuscaAluno] = React.useState("");
  const [verTodosAlunos, setVerTodosAlunos] = React.useState(false);
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
  // Abrir o plano salvo (`?plano=`) devolve as ALTERAÇÕES não publicadas dele, se houver: sem
  // isso, editar o treino em uso, sair e voltar perdia a edição. Abrir pelo aluno devolve o
  // treino novo que ficou por publicar.
  const [inicial] = React.useState(() => {
    const r = rascunhoGuardado(planoPre?.alunoId ?? params.get("aluno"));
    if (planoPre) return r && r.id === planoPre.id ? { plano: r, recuperado: true } : { plano: planoPre, recuperado: false };
    return r ? { plano: r, recuperado: true } : { plano: null, recuperado: false };
  });
  const [plano, setPlano] = React.useState<PlanoTreino | null>(inicial.plano);
  const [salvo, setSalvo] = React.useState(Boolean(planoPre) && !inicial.recuperado);
  const [rascunhoRecuperado, setRascunhoRecuperado] = React.useState(inicial.recuperado);
  const guardarRascunho = useAlunos((s) => s.guardarRascunho);
  const descartarRascunho = useAlunos((s) => s.descartarRascunho);
  const publicarPlano = useAlunos((s) => s.publicarPlano);

  /*
   * O PLANO NÃO PODE SUMIR SÓ PORQUE O PROFISSIONAL SAIU DA TELA.
   *
   * Medido no app: gerar a periodização, tocar em qualquer item do menu e voltar. O plano
   * some, e `planos` no armazenamento segue em 0. Ele vivia SÓ no estado deste componente, e
   * a pílula da tela dizia "Rascunho" o tempo todo, o que promete uma guarda que não existia.
   * Quem editou meia dúzia de semanas na mão perdia o trabalho num toque, sem aviso nenhum.
   *
   * O rascunho sobrevive à navegação (na store, por aluno) e volta com um aviso dizendo que
   * ele ainda não está no app do aluno. Publicar continua sendo o único gesto que o entrega.
   */
  React.useEffect(() => {
    if (!plano || salvo || !plano.alunoId) return;
    guardarRascunho(plano);
  }, [plano, salvo, guardarRascunho]);

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
    if (inicial.plano) irParaResultado();
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
    // O aluno escolhido pode ter um treino pronto esperando: ele volta, com o aviso.
    const r = rascunhoGuardado(id);
    setPlano(r ?? null);
    setSalvo(false);
    setRascunhoRecuperado(Boolean(r));
    if (r) irParaResultado();
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

  // O que o aluno vê em relação ao plano aberto (src/lib/publicacao.ts, na versão da tela).
  const publicadoNoApp = plano ? planosSalvos.find((p) => p.id === plano.id && p.status === "ativo") : undefined;
  const estadoPub: EstadoNoEditor = !aluno
    ? "avulso"
    : publicadoNoApp
      ? salvo
        ? "publicado"
        : "alteracoes"
      : planoAtivoDoAluno
        ? "substitui"
        : "nao-publicado";

  // Descartar a EDIÇÃO de um treino em uso volta à versão publicada; descartar um treino
  // novo volta ao formulário.
  const descartar = () => {
    if (alunoId) descartarRascunho(alunoId);
    setRascunhoRecuperado(false);
    if (publicadoNoApp) {
      setPlano(publicadoNoApp);
      setSalvo(true);
    } else {
      setPlano(null);
    }
    toast(publicadoNoApp ? "Alterações descartadas. Voltou a versão publicada." : "Rascunho descartado.");
  };

  const salvar = () => {
    if (!plano || !aluno) return;
    const jaExiste = planosSalvos.some((p) => p.id === plano.id);
    // A porta única de publicação: grava, arquiva o anterior, fecha o pedido de treino,
    // apaga o rascunho e carimba a data em que o aluno começa (src/lib/publicacao.ts).
    const publicado = publicarPlano({ ...plano, alunoId: aluno.id });
    setRascunhoRecuperado(false);
    if (jaExiste) {
      setPlano(publicado);
      setSalvo(true);
      toast(`Alterações publicadas no app de ${aluno.nome.split(" ")[0]}.`);
    } else {
      // Primeira publicação: leva à ficha, onde o aviso diz se o treino de fato CHEGA (o
      // aluno já entrou no app?) e oferece o convite quando não. A aba Treino vai junto:
      // quem acabou de publicar quer ver o treino.
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

  /*
   * A LINHA DE APOIO DE CADA ALUNO DIZ O ESTADO QUE IMPORTA PARA PRESCREVER.
   *
   * Era "{objetivo} · {nível}", o que o cartão do perfil já diz. O protótipo escreve o que
   * decide aqui: se o aluno tem treino rodando, se há um pronto esperando publicação, ou se
   * não tem nada. Tudo sai de dado desta tela (planos publicados e rascunhos da store), no
   * vocabulário que a lista de alunos já usa.
   */
  const estadoParaPrescrever = (a: Aluno): string => {
    const ativo = planosSalvos
      .filter((p) => p.alunoId === a.id && p.status === "ativo")
      .sort((x, y) => y.data - x.data)[0];
    const r = rascunhoDoAluno(rascunhos, a.id);
    if (r && ativo) return r.id === ativo.id ? "Alterações não publicadas" : "Treino novo não publicado";
    if (r) return "Não publicado";
    if (ativo) return `Plano ativo · S${semanaAtual(ativo)}`;
    return "Sem treino ativo";
  };

  /*
   * A LISTA CURTA DO CELULAR. Com a carteira inteira em cartões, 30 alunos passavam de 2000
   * px antes da primeira pergunta de verdade. Ficam à vista o escolhido e quem mais precisa de
   * treino (sem plano ou com rascunho parado), até quatro, e o resto atrás de "Ver todos". Com
   * mais de oito alunos entra a busca, que filtra a lista inteira. No desktop, em duas
   * colunas ao lado do cartão navy, a lista inteira continua à vista.
   */
  const alunosDaLista = React.useMemo(() => {
    const prioridade = (a: Aluno) => {
      if (a.id === alunoId) return 0;
      const temAtivo = planosSalvos.some((p) => p.alunoId === a.id && p.status === "ativo");
      const temRascunho = Boolean(rascunhoDoAluno(rascunhos, a.id));
      return temRascunho || !temAtivo ? 1 : 2;
    };
    const ordenados = alunos.map((a, i) => ({ a, i })).sort((x, y) => prioridade(x.a) - prioridade(y.a) || x.i - y.i).map((x) => x.a);
    const termo = buscaAluno.trim().toLocaleLowerCase("pt-BR");
    return termo ? ordenados.filter((a) => a.nome.toLocaleLowerCase("pt-BR").includes(termo)) : ordenados;
  }, [alunos, alunoId, planosSalvos, rascunhos, buscaAluno]);
  const ALUNOS_A_VISTA = 4;
  const encurtarLista = !verTodosAlunos && !buscaAluno.trim() && alunosDaLista.length > ALUNOS_A_VISTA;

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
                <h1 className="font-display text-[26px] font-bold leading-[1.05] tracking-[-0.03em] text-ink lg:text-4xl">
                  Para quem é este plano?
                </h1>
                {/* No celular o protótipo não tem subtítulo: o atalho do Treino do dia desce
                    para o pé do formulário, onde fica a pergunta "é só o treino de hoje?". */}
                <p className="mt-2 hidden text-ink-2 lg:block">
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
                      <Link to={`/prescrever-treino?plano=${planoAtivoDoAluno.id}`} className={cn(buttonClasses("primary", "sm"), "h-11 lg:h-9")}>
                        <Pencil className="h-4 w-4" /> Editar este treino
                      </Link>
                      <Link to={`/alunos/${aluno?.id}?aba=treino`} className={cn(buttonClasses("secondary", "sm"), "h-11 lg:h-9")}>
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
                {/* O MESMO ÂMBAR do CTA do cartão navy: são o mesmo gesto, e o mesmo gesto com
                    duas cores na mesma tela parece duas ações diferentes. Cor fixa de propósito,
                    como o cartão navy: o texto navy sobre âmbar vale nos dois temas. */}
                <button
                  onClick={gerar}
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-control bg-[#E8A317] px-5 text-sm font-bold text-[#0B1628] transition-colors hover:bg-[#F0B429] active:translate-y-px"
                >
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
          <Card variant="raised" className="p-4 lg:p-6">
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
                {alunos.length > 8 && (
                  <input
                    type="search"
                    value={buscaAluno}
                    onChange={(e) => setBuscaAluno(e.target.value)}
                    placeholder={`Buscar entre ${alunos.length} alunos`}
                    aria-label="Buscar aluno pelo nome"
                    className="input mt-3 min-h-[44px] w-full"
                  />
                )}
                {/* Selecionado com borda de 2 px, como o protótipo; o padding perde 1 px para
                    o cartão não pular quando a borda engrossa. */}
                <div role="group" aria-label="Aluno" className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:gap-2">
                  <button
                    type="button"
                    aria-pressed={!alunoId}
                    onClick={() => escolherAluno(undefined)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-control text-left transition-colors",
                      !alunoId ? "border-2 border-primary bg-primary-tint p-[11px]" : "border border-border p-3 hover:bg-surface-soft",
                    )}
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] border border-dashed border-border bg-surface text-ink-3">
                      <Users className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <b className="block truncate text-sm font-semibold text-ink">Plano avulso</b>
                      <span className="block truncate text-xs text-ink-2">sem aluno</span>
                    </span>
                  </button>
                  {alunosDaLista.map((a, i) => {
                    const sel = a.id === alunoId;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        aria-pressed={sel}
                        onClick={() => escolherAluno(a.id)}
                        className={cn(
                          "flex items-center gap-2.5 rounded-control text-left transition-colors",
                          sel ? "border-2 border-primary bg-primary-tint p-[11px]" : "border border-border p-3 hover:bg-surface-soft",
                          encurtarLista && i >= ALUNOS_A_VISTA && "hidden lg:flex",
                        )}
                      >
                        <AvatarAluno
                          aluno={a}
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] font-display text-xs font-bold"
                          style={{ background: "#0B1628", color: "#F3F1EA" }}
                        />
                        <span className="min-w-0">
                          <b className="block truncate text-sm font-semibold text-ink">{a.nome}</b>
                          <span className="block truncate text-xs text-ink-2">
                            {a.objetivo} · {estadoParaPrescrever(a)}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                {buscaAluno.trim() && alunosDaLista.length === 0 && (
                  <p className="mt-2 text-sm text-ink-3">Nenhum aluno com esse nome.</p>
                )}
                {encurtarLista && (
                  <button
                    type="button"
                    onClick={() => setVerTodosAlunos(true)}
                    className="mt-1 inline-flex min-h-[44px] items-center rounded-control text-sm font-semibold text-primary hover:underline lg:hidden"
                  >
                    Ver todos os {alunosDaLista.length} alunos
                  </button>
                )}
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
                <Card variant="raised" className="p-4 lg:p-6">
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
                <Card variant="raised" className="p-4 lg:p-6">
                  <Campo label="Duração do plano">
                    <div className="flex flex-wrap gap-1.5">
                      {HORIZONTES.map((h) => (
                        <button
                          key={h.id}
                          onClick={() => setSemanas(h.semanas)}
                          aria-pressed={semanas === h.semanas}
                          title={`${h.rotulo}: ${h.semanas} semanas`}
                          className={cn(
                            // 13,5 px e peso 600 nas duas, como o protótipo; a altura de 44 fica.
                            "inline-flex min-h-[44px] items-center justify-center rounded-full border px-4 py-1.5 text-[13.5px] font-semibold leading-tight transition-colors",
                            semanas === h.semanas
                              ? "border-ink bg-ink text-surface"
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

                <Card variant="raised" className="p-4 lg:p-6">
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

              {/* O pé do protótipo no celular: o atalho do Treino do dia, que no desktop mora no
                  subtítulo do cabeçalho. "Descartar e recomeçar" não entra: no formulário não há
                  o que descartar, e o descarte do rascunho mora na faixa de publicação. */}
              <div className="flex flex-col items-start gap-1">
                <Link
                  to="/gps"
                  className="inline-flex min-h-[44px] items-center gap-1.5 text-[13.5px] font-semibold text-primary hover:underline lg:hidden"
                >
                  Só o treino de hoje? Use o Treino do dia <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
                <button
                  onClick={carregarExemplo}
                  className="text-sm text-ink-3 underline decoration-dotted underline-offset-4 hover:text-primary"
                >
                  Não sabe por onde começar? Ver um exemplo pronto
                </button>
              </div>
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
              planoAtivo={planoAtivoDoAluno}
              ultimaAvaliacaoEm={
                alunoId
                  ? avaliacoes.filter((a) => a.alunoId === alunoId).sort((a, b) => b.data - a.data)[0]?.data
                  : undefined
              }
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
          {/* Só no desktop: no celular o cabeçalho do plano já diz onde se está, e os passos
              empurravam o plano 38 px para baixo (o protótipo não os tem na periodização). */}
          <div className="mb-3 hidden justify-end lg:flex">
            <PassosDaPrescricao atual={3} />
          </div>
          {/* QUEM VÊ O QUÊ, em uma linha, enquanto houver algo por publicar. Substitui o
              antigo "rascunho recuperado", que dizia que o trabalho voltou mas não dizia o
              que importa: se o aluno está vendo. */}
          {aluno && (estadoPub === "nao-publicado" || estadoPub === "substitui" || estadoPub === "alteracoes") && (
            <div
              role="status"
              className="mb-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 rounded-card border border-cta/40 bg-cta-tint px-4 py-3 text-sm text-ink"
            >
              <CircleDashed aria-hidden className="h-4 w-4 shrink-0 text-cta-text" />
              <span className="min-w-0 flex-1">
                {rascunhoRecuperado ? <span className="font-semibold">Você voltou ao rascunho. </span> : null}
                {estadoPub === "nao-publicado"
                  ? `${aluno.nome.split(" ")[0]} ainda não vê este treino. Ele fica guardado, e a lista de alunos avisa "Não publicado" até você publicar.`
                  : estadoPub === "substitui"
                    ? `${aluno.nome.split(" ")[0]} continua com o treino atual. Este só entra no lugar dele quando você publicar, e antes disso você vê o que muda.`
                    : `${aluno.nome.split(" ")[0]} continua vendo a versão publicada. Suas alterações ficam guardadas até você publicar.`}
              </span>
              {/* 44 px de toque, e no celular numa linha própria: sublinhado de 20 px colado ao
                  fim de uma frase de três linhas era alvo pequeno para um gesto que apaga. */}
              <button
                type="button"
                onClick={descartar}
                className="inline-flex min-h-[44px] shrink-0 basis-full items-center rounded-control font-semibold text-ink-2 underline underline-offset-4 hover:text-ink sm:basis-auto"
              >
                {estadoPub === "alteracoes" ? "Descartar alterações" : "Descartar rascunho"}
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
            execucoes={execucoes}
            sessaoFeedbacks={sessaoFeedbacks}
            fcRepouso={fcRepousoDoAluno}
            prescricaoData={prescricaoData}
            podeSalvar={Boolean(aluno)}
            salvo={salvo}
            onSalvar={salvar}
            onExportar={exportar}
            onPublicar={publicar}
            estadoPublicacao={estadoPub}
            onEditarContexto={() => { if (alunoId) descartarRascunho(alunoId); setRascunhoRecuperado(false); setPlano(null); }}
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
          {/* 44 px no celular: é uma folha que sobe de baixo, e o polegar é o ponteiro. */}
          <button onClick={onClose} className={cn(buttonClasses("secondary", "sm"), "h-11 sm:h-9")}>
            Cancelar
          </button>
          <button onClick={onConfirm} className={cn(buttonClasses("primary", "sm"), "h-11 sm:h-9")}>
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
    <ol aria-label="Etapas da prescrição" className="flex list-none items-center gap-2 p-0 text-[13px] font-semibold sm:text-sm">
      {passos.map((rotulo, i) => {
        const n = i + 1;
        const alcancado = n <= atual;
        return (
          <li
            key={rotulo}
            aria-current={n === atual ? "step" : undefined}
            className={cn("flex items-center gap-2", alcancado ? "text-ink" : "text-ink-3")}
          >
            {i > 0 && <span aria-hidden className="h-0.5 w-7 rounded-full bg-border" />}
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

/** Uma linha do painel "O que o Mapa já sabe": marcador colorido e o texto. No nível do
 *  módulo, e não dentro do painel, para não remontar a cada render (ver check:foco). */
function Linha({ marcador, cor, children }: { marcador: string; cor: string; children: React.ReactNode }) {
  return (
    <p className="m-0 flex gap-2.5">
      <span aria-hidden style={{ color: cor }}>
        {marcador}
      </span>
      <span className="min-w-0">{children}</span>
    </p>
  );
}


/**
 * O cartão navy fixo do protótipo: "O que o Mapa já sabe".
 *
 * Substitui o card "O motor propõe, você decide" com a MESMA informação derivada: as
 * restrições vêm do perfil, as estruturais vêm da condição (`restricoesEstruturais`
 * em groupRules, as mesmas que o `check:condicao` trava), o texto do efeito vem do
 * catálogo de restrições, e os equipamentos vêm do cadastro. A reavaliação vencida entra
 * só quando a data dela (a mesma da lista de alunos) já passou; as referências continuam de
 * fora de propósito, porque só existem depois de gerar. Superfície fixa fora do tema
 * claro/escuro, como o herói do aluno.
 */
function MapaJaSabe({
  aluno,
  grupoSlug,
  objetivo,
  objetivoSecundario,
  nivel,
  modeloPreferidoNome,
  planoAtivo,
  ultimaAvaliacaoEm,
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
  /** o treino que o aluno segue hoje: a data de reavaliação dele manda (dataReavaliacao) */
  planoAtivo?: PlanoTreino;
  /** data da avaliação mais recente do aluno, para dizer de quando são os dados */
  ultimaAvaliacaoEm?: number;
  podeGerar: boolean;
  rotuloGerar: string;
  onGerar: () => void;
}) {
  /*
   * A LINHA VERMELHA DO PROTÓTIPO, com dado real e só quando é verdade: a reavaliação do
   * aluno (a do plano em curso, senão a do calendário do cadastro) já passou. É a mesma data
   * que a lista de alunos usa para o chip "Reavaliação vencida", então as duas telas não têm
   * como discordar. Sem data marcada ou com a data no futuro, a linha não existe.
   */
  const reavaliacao = aluno ? dataReavaliacao(aluno, planoAtivo) : null;
  const reavaliacaoVencida = reavaliacao != null && reavaliacao.em < Date.now();
  const diasDaAvaliacao =
    ultimaAvaliacaoEm != null ? Math.max(0, Math.floor((Date.now() - ultimaAvaliacaoEm) / 86_400_000)) : undefined;
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

  return (
    <aside
      aria-label="O que o Mapa já sabe"
      className="relative overflow-hidden rounded-card p-[22px] lg:sticky lg:top-20"
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
      <div className="relative mt-3.5 space-y-3 text-[13.5px] leading-[1.5]" style={{ color: "#D6DFEA" }}>
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
        {reavaliacaoVencida && (
          <Linha marcador="■" cor="#E5484D">
            <b style={{ color: "#fff" }}>Reavaliação vencida</b>
            {diasDaAvaliacao != null
              ? `: o plano nasce com os dados de uma avaliação de ${diasDaAvaliacao} ${diasDaAvaliacao === 1 ? "dia" : "dias"} atrás.`
              : `: estava marcada para ${fmtDataCurta(reavaliacao!.em)}.`}
          </Linha>
        )}
      </div>
      <p className="relative mt-4 text-xs" style={{ color: "#8FA0B5" }}>
        O motor propõe, você decide: dá para editar tudo depois de gerar.
      </p>
      {podeGerar && (
        <button
          onClick={onGerar}
          className="relative mt-4 inline-flex h-[46px] w-full items-center justify-center gap-2 rounded-control bg-[#E8A317] text-[14.5px] font-bold text-[#0B1628] transition-colors hover:bg-[#F0B429] active:translate-y-px"
        >
          <Sparkles className="h-4 w-4" /> {rotuloGerar}
        </button>
      )}
    </aside>
  );
}

/* ------------------------------- Resultado ------------------------------- */

/**
 * O SELO DIZ SE O ALUNO VÊ. Era "Salvo" ou "Rascunho", duas palavras do lado de quem escreve;
 * o que o profissional precisa saber é o lado de quem recebe.
 */
function SeloPublicacao({ estado, aluno, desde }: { estado: EstadoNoEditor; aluno?: string; desde: number }) {
  const nome = aluno?.split(" ")[0];
  switch (estado) {
    case "publicado":
      return (
        <Pill tone="success" icon={<Smartphone className="h-3 w-3" aria-hidden />}>
          No app de {nome} desde {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(desde))}
        </Pill>
      );
    case "alteracoes":
      return <Pill tone="cta" icon={<CircleDashed className="h-3 w-3" aria-hidden />}>Alterações não publicadas</Pill>;
    case "substitui":
      return <Pill tone="cta" icon={<CircleDashed className="h-3 w-3" aria-hidden />}>Treino novo não publicado</Pill>;
    case "nao-publicado":
      return <Pill tone="cta" icon={<CircleDashed className="h-3 w-3" aria-hidden />}>Não publicado</Pill>;
    default:
      return <Pill tone="neutral">Plano avulso</Pill>;
  }
}

/**
 * O BOTÃO DIZ O QUE VAI ACONTECER. "Publicar no app de Júlia" com o treino já publicado e
 * nada mudado prometia uma ação que não fazia nada; agora ele vira "Publicado" (sem o
 * gradiente, que é só do gesto de publicar) e "Publicar alterações" quando há o que mandar.
 */
function BotaoPublicarPlano({
  estado,
  aluno,
  podeSalvar,
  onPublicar,
  className,
}: {
  estado: EstadoNoEditor;
  aluno?: string;
  podeSalvar: boolean;
  onPublicar: () => void;
  /** tamanho e lugar na grade de ações de quem o usa (44 px no celular) */
  className?: string;
}) {
  const nome = aluno?.split(" ")[0];
  if (estado === "publicado") {
    return (
      <span className={cn(buttonClasses("secondary", "sm"), "cursor-default text-success", className)} aria-live="polite">
        <Check className="h-4 w-4" aria-hidden /> Publicado
      </span>
    );
  }
  return (
    <button
      onClick={onPublicar}
      disabled={!podeSalvar}
      className={cn(buttonClasses("primary", "sm"), "gradient-publicar text-white", !podeSalvar && "cursor-not-allowed opacity-50", className)}
    >
      <Send className="h-4 w-4" aria-hidden />
      {estado === "alteracoes" ? "Publicar alterações" : nome ? `Publicar no app de ${nome}` : "Publicar no app do aluno"}
    </button>
  );
}

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
  estadoPublicacao,
  execucoes,
  sessaoFeedbacks,
}: {
  /** se o aluno vê este plano, e o que falta para ver (selo e botão do cabeçalho) */
  estadoPublicacao: EstadoNoEditor;
  plano: PlanoTreino;
  onChange: (p: PlanoTreino) => void;
  premium: boolean;
  aluno?: string;
  /** objeto do aluno (perfil) para a troca segura no editor; ausente = plano avulso */
  alunoObj?: Aluno;
  /** registro por série do aluno: diz qual sessão da semana já foi feita (nunca o calendário) */
  execucoes: Execucao[];
  /** o fecho de cada sessão feita pelo aluno: é dele que sai o dia do "feita · seg" */
  sessaoFeedbacks: SessaoFeedback[];
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
  const [params, setParams] = useSearchParams();
  const [aba, setAba] = React.useState<"principal" | "alternativa">("principal");

  /*
   * O EDITOR É UMA TELA, NÃO UM RODAPÉ (protótipo: "Periodização" e "Editor de treino" são
   * dois `data-screen-label` diferentes).
   *
   * Aqui as duas viviam empilhadas: abaixo do plano inteiro vinha o paredão de edição da
   * semana, com abas de sessão, campos rotulados de cada exercício, método de série e os
   * botões de agrupar. Mil e trezentos pixels de formulário embaixo de uma tela de leitura,
   * e a leitura espremida numa coluna porque o trilho ocupava a direita da página inteira.
   *
   * Agora a periodização responde "para onde este plano vai" em largura cheia, e editar a
   * semana é ir para a tela de editar a semana.
   *
   * O modo vive na URL de propósito: entrar EMPILHA e sair SUBSTITUI, então o voltar do
   * navegador volta para a periodização em vez de sair do site (o defeito que a rodada do
   * app do aluno já tinha custado caro).
   */
  const editando = params.get("editar") === "1";

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
  // A cor de cada bloco é a da FASE dele, da mesma fonte do gráfico e do calendário.
  const corDosBlocos = React.useMemo(() => indicesDeCorDasFases(macro.mesociclos), [macro]);
  const gradeCompacta = macro.mesociclos.length > 3;

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
  const [semanaFoco, setSemanaFoco] = React.useState(
    () => Number(params.get("semana")) || semanaCorrente,
  );
  React.useEffect(() => setSemanaFoco(Number(params.get("semana")) || semanaCorrente), [semanaCorrente]);

  /*
   * O FOCO VAI ATRÁS DO CLIQUE, E CADA CLIQUE TEM O SEU DESTINO.
   *
   * Clicar numa semana do calendário mudava o painel do bloco e o cartão da semana, os dois
   * bem mais abaixo, sem nenhum sinal de que algo tinha acontecido: em tela de notebook o
   * que mudava estava fora da vista.
   *
   * A primeira versão disto mandava os dois cliques para a MESMA região, e a região começa
   * no painel do bloco: quem clicava numa semana caía nas regras da fase, não na semana.
   * Agora são dois destinos, um por pergunta. Clique em semana leva à semana; clique em
   * bloco leva às regras do bloco.
   *
   * `block: "nearest"` não rola nada quando o destino já está visível, então clicar em duas
   * semanas seguidas não sacode a página.
   */
  const alvoDaSemana = React.useRef<HTMLDivElement>(null);
  const alvoDoBloco = React.useRef<HTMLDivElement>(null);

  const levarAte = (ref: React.RefObject<HTMLDivElement>, alinhamento: "start" | "nearest") => {
    requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      el.scrollIntoView({ block: alinhamento, behavior: "smooth" });
      el.focus({ preventScroll: true });
    });
  };

  const focarSemana = (n: number) => {
    setSemanaFoco(n);
    // "start": a semana clicada encosta no topo e é a primeira coisa que se lê.
    levarAte(alvoDaSemana, "start");
  };

  // Clicar num bloco leva às regras dele. Se a semana em foco JÁ está dentro do bloco, a
  // semana não muda: trocar a semana debaixo do dedo de quem só quis ler as regras da fase
  // seria perder o lugar sem ter pedido.
  const focarBloco = (meso: Mesociclo) => {
    if (!(semanaFoco >= meso.semanaInicio && semanaFoco <= meso.semanaFim)) setSemanaFoco(meso.semanaInicio);
    // "nearest": basta revelar o painel; os cartões continuam à vista para trocar de bloco.
    levarAte(alvoDoBloco, "nearest");
  };

  const irParaEditor = (n: number) => {
    const proximos = new URLSearchParams(params);
    proximos.set("semana", String(n));
    proximos.set("editar", "1");
    setSemanaFoco(n);
    setParams(proximos);
  };
  const sairDoEditor = () => {
    const proximos = new URLSearchParams(params);
    proximos.delete("editar");
    setParams(proximos, { replace: true });
  };

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

  // Copia as sessões desta semana para as demais semanas de CARGA do mesmo bloco (ids
  // novos, senão duas semanas apontariam para o mesmo bloco e a execução do aluno grudaria
  // nas duas). O meso ANTES vai inteiro para o desfazer: esta ação reescreve várias semanas
  // de ajuste manual de uma vez, e é a mais cara de refazer à mão.
  const duplicarSemana = () => {
    if (!emFoco) return;
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
  };

  // O EDITOR É OUTRA TELA. O desvio vem depois de todos os hooks, que é o que a regra dos
  // hooks exige, e antes de qualquer JSX da periodização: as duas nunca aparecem juntas.
  if (editando && emFoco) {
    return (
      <EditorDaSemana
        plano={plano}
        micro={emFoco.micro}
        meso={emFoco.meso}
        semanas={semanas}
        ctx={ctx}
        editavel={premium}
        aluno={aluno}
        podeSalvar={podeSalvar}
        salvo={salvo}
        onChange={trocarMicro}
        onDuplicar={duplicarSemana}
        onFocar={irParaEditor}
        onVoltar={sairDoEditor}
        onExportar={onExportar}
        onPublicar={onPublicar}
        estadoPublicacao={estadoPublicacao}
      />
    );
  }

  /*
   * O SUBTÍTULO DO PLANO, com o que o plano de fato declara (protótipo: "3× por semana ·
   * iniciado em 21 jul · reavaliação ao fim de cada fase").
   *
   * "Iniciado em" só existe com o plano publicado: `plano.data` é carimbada no gesto de
   * publicar, e antes dele o treino não começou, então a frase é "começa quando você publicar".
   * A reavaliação só diz "cada" quando TODO bloco a pede; senão diz em que semanas ela cai.
   */
  const publicadoNoApp = estadoPublicacao === "publicado" || estadoPublicacao === "alteracoes";
  const semanasDeReavaliacao = macro.mesociclos.filter((m) => m.reavaliacao).map((m) => m.semanaFim);
  const todosReavaliam = macro.mesociclos.length > 1 && semanasDeReavaliacao.length === macro.mesociclos.length;
  const partesDoSubtitulo = [
    `${plano.objetivo}${plano.objetivoSecundario ? ` com ênfase em ${plano.objetivoSecundario.toLowerCase()}` : ""}`,
    rotuloFrequencia(plano),
    publicadoNoApp ? `iniciado em ${fmtDataCurta(plano.data)}` : aluno ? "começa quando você publicar" : "",
    estadoPublicacao === "publicado" ? `semana ${semanaCorrente} de ${plano.semanas}` : "",
    todosReavaliam
      ? `reavaliação ao fim de cada ${macro.mesociclos.every((m) => m.faseJornada) ? "fase" : "bloco"}`
      : semanasDeReavaliacao.length === 1
        ? `reavaliação na semana ${semanasDeReavaliacao[0]}`
        : semanasDeReavaliacao.length > 1
          ? `reavaliação nas semanas ${eLista(semanasDeReavaliacao.map(String))}`
          : "",
  ].filter(Boolean);
  const horizonte = rotuloHorizonte(plano.semanas);
  // "Periodização linear" vira "Linear" no segmentado do celular, onde cabe metade da tela.
  const nomeCurtoDoModelo = (id: Parameters<typeof getModelo>[0]) =>
    comInicialMaiuscula(getModelo(id).nome.replace(/^Periodização (?:em )?/i, ""));

  return (
    <div className="space-y-5 motion-safe:animate-entra">
      {/*
        CABEÇALHO DO PLANO no vocabulário do protótipo: sobrelinha com o aluno e o horizonte,
        título pelo MODELO (é o que esta tela mostra: a forma do plano), subtítulo com o que o
        plano declara e, numa linha só, os selos. O objetivo desceu do título para o
        subtítulo. O selo de publicação continua o mesmo, com os cinco estados.
      */}
      <div className="lg:flex lg:flex-wrap lg:items-start lg:justify-between lg:gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            {aluno ?? "Plano avulso"} · {horizonte ? `Plano ${horizonte.toLowerCase()}` : `${plano.semanas} semanas`}
          </p>
          <h2 className="mt-2 font-display text-[26px] font-bold leading-[1.05] tracking-[-0.03em] text-ink lg:text-3xl">
            {modelo.nome} · {plano.semanas} semanas
          </h2>
          <p className="mt-2 text-sm text-ink-2">
            {partesDoSubtitulo.join(" · ")}
            {" · "}
            {/* Sem esta saída o formulário fica inalcançável depois de gerar, e
                trocar frequência ou duração exigiria recarregar a página. O plano
                já salvo continua no perfil; o que se descarta é o rascunho da tela. */}
            <button onClick={onEditarContexto} className="rounded-control font-semibold text-primary hover:underline">
              editar contexto
            </button>
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <SeloPublicacao estado={estadoPublicacao} aluno={aluno} desde={plano.data} />
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
        </div>

        {/*
          AS AÇÕES NO CELULAR EM GRADE DE DUAS COLUNAS, com Publicar em largura cheia embaixo:
          o rótulo "Publicar no app de {nome}" cabe inteiro, e os três alvos têm 44 px. O
          protótipo pinta "Editar semana" de azul cheio; aqui a ação forte é Publicar (o único
          gradiente da casa), e um segundo botão cheio disputaria com ela.
        */}
        <div className="mt-4 space-y-2 lg:mt-0 lg:flex lg:flex-col lg:items-end lg:gap-2 lg:space-y-0">
          {plano.alternativa && plano.modeloAltId && premium && (
            // A escolha de modelo vira o segmentado do protótipo abaixo de `lg`; os cartões
            // com as mini-barras de volume real ficam para quem tem largura (logo abaixo).
            <div
              role="group"
              aria-label="Modelo exibido"
              className="flex gap-0.5 rounded-[12px] border border-border bg-surface p-[3px] lg:hidden"
            >
              {(
                [
                  { alt: false, rotulo: nomeCurtoDoModelo(plano.modeloId), dica: "Sugerido pelo motor para este contexto" },
                  { alt: true, rotulo: `Alternativa · ${nomeCurtoDoModelo(plano.modeloAltId)}`, dica: "A outra opção que o motor montou" },
                ] as const
              ).map((s) => {
                const ativo = s.alt === naAlternativa;
                return (
                  <button
                    key={String(s.alt)}
                    type="button"
                    onClick={() => setAba(s.alt ? "alternativa" : "principal")}
                    aria-pressed={ativo}
                    title={s.dica}
                    aria-label={`${s.rotulo}${s.alt ? "" : " (sugerido pelo motor)"}`}
                    className={cn(
                      // 36 px de desenho e 44 de toque: o `before:` estende a área.
                      "relative h-9 min-w-0 flex-1 truncate rounded-control px-3 text-[12.5px] transition-colors before:absolute before:inset-x-0 before:-inset-y-1 before:content-['']",
                      ativo ? "bg-ink font-bold text-surface" : "font-semibold text-ink-2 hover:text-ink",
                    )}
                  >
                    {s.rotulo}
                  </button>
                );
              })}
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 lg:flex lg:flex-wrap lg:items-center">
            {/* A porta do editor, do lado das outras saídas do plano (protótipo:
                "Editar semana 7 →" como ação de destaque do cabeçalho). */}
            <button
              onClick={() => irParaEditor(semanaFoco)}
              className={cn(buttonClasses("secondary", "sm"), "h-11 px-3 lg:order-2 lg:h-9 lg:px-4")}
              aria-label={`Editar semana ${semanaFoco}`}
            >
              <Pencil className="h-4 w-4" aria-hidden />
              {/* Rótulo curto no celular (protótipo de 24 semanas: "Editar S14"); o completo
                  fica no aria-label e volta a aparecer onde há largura. */}
              <span className="sm:hidden">Editar S{semanaFoco}</span>
              <span className="hidden sm:inline">Editar semana {semanaFoco}</span>
            </button>
            <button
              onClick={() => onExportar()}
              disabled={!podeSalvar}
              className={cn(buttonClasses("secondary", "sm"), "h-11 px-3 lg:order-1 lg:h-9 lg:px-4", !podeSalvar && "cursor-not-allowed opacity-50")}
            >
              <FileDown className="h-4 w-4" /> Plano completo
            </button>
            <BotaoPublicarPlano
              estado={estadoPublicacao}
              aluno={aluno}
              podeSalvar={podeSalvar}
              onPublicar={onPublicar}
              className="col-span-2 h-11 lg:order-3 lg:h-9"
            />
          </div>
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
          segue no aviso logo abaixo. Só a partir de `lg`: no celular os dois cartões
          empilhados somavam 295 px e empurravam o gráfico para 679 px do topo, e a mesma
          escolha já está no segmentado do cabeçalho. */}
      {plano.alternativa && plano.modeloAltId && premium && (
        <div className="hidden gap-2.5 lg:grid lg:grid-cols-2">
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
          <button onClick={promoverAlternativa} className={cn(buttonClasses("secondary", "sm"), "h-11 lg:h-9")}>
            Usar esta como principal
          </button>
        </Card>
      )}

      {/* ONDE O PLANO ESTÁ (protótipo de 24 semanas): só com o plano PUBLICADO. Num rascunho
          nada começou, e "semana 1 de 24, 4% do plano" afirmaria um andamento que não existe. */}
      {salvo && mesoAtual && plano.semanas >= 8 && (
        <OndeOPlanoEsta macro={macro} meso={mesoAtual} semana={semanaCorrente} total={plano.semanas} />
      )}

      {/*
        LARGURA CHEIA para o que é leitura do plano (curva, calendário, blocos), como no
        protótipo. Antes tudo isso morava na coluna da esquerda de um grid de duas colunas,
        e o trilho comia 320px da página inteira: os quatro cartões de bloco caíam em três
        colunas de 210px, com o quarto órfão embaixo e o texto quebrando em cinco linhas.
        O trilho passa a acompanhar só a semana em foco, que é do que ele fala.
      */}
      {/* "Você está aqui" só com plano SALVO: num plano recém-gerado, que ainda
          não começou, a bandeira afirmaria uma semana corrente que não existe. */}
      <GraficoProgressao
        macro={macro}
        nivel={plano.nivel}
        modeloId={naAlternativa ? plano.modeloAltId : plano.modeloId}
        semanaAtual={salvo ? semanaCorrente : undefined}
        semanaFoco={semanaFoco}
      />

      {/* O calendário do plano: a ESTRUTURA (fase, descarga, reavaliação, sessões)
          logo abaixo da curva, e cada semana é a porta para editá-la. */}
      <CalendarioDoPlano
        semanas={semanas}
        foco={semanaFoco}
        corrente={salvo ? semanaCorrente : undefined}
        onFocar={focarSemana}
      />

      {/*
        A SEMANA EM FOCO VEM LOGO DEPOIS DO CALENDÁRIO, e não no fim da página.

        Não é gosto de ordem, é geometria: a semana era a última coisa do documento, então
        clicar nela rolava a página até o fim e ela parava a 291px do topo, com o painel do
        bloco ocupando a faixa de cima. O clique ia para a semana e a tela dizia "bloco em
        foco", que foi exatamente a queixa. Com conteúdo abaixo dela, a semana encosta no
        topo e é a primeira coisa que se lê.

        A leitura melhora junto: o gráfico e o calendário mostram o plano inteiro, esta caixa
        mostra o ponto onde você está, e os blocos, abaixo, são a camada de referência.

        As duas caixas que mudam com o clique (esta e a do bloco) são grupos com nome, com
        `tabIndex` para receber o foco de teclado e `scroll-mt-24` para descontar a barra fixa
        do topo na hora de encostar o destino no alto da tela.
      */}
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-5">
        {emFoco && (
          <div
            ref={alvoDaSemana}
            tabIndex={-1}
            role="group"
            aria-label={`Semana ${emFoco.micro.semana} em foco`}
            className="min-w-0 scroll-mt-24 focus:outline-none"
          >
            <ResumoDaSemana
              micro={emFoco.micro}
              meso={emFoco.meso}
              semanas={semanas}
              podeEditar={premium}
              onFocar={focarSemana}
              onEditar={() => irParaEditor(emFoco.micro.semana)}
              // Execução só existe em plano que o aluno recebeu: num rascunho, nada foi feito.
              registro={publicadoNoApp ? { planoId: plano.id, execucoes, sessaoFeedbacks } : undefined}
            />
          </div>
        )}
          {/*
            O PLANO BLOCO A BLOCO SOBE PARA A COLUNA DA ESQUERDA, embaixo da semana em foco.
            Na largura inteira, embaixo das duas colunas, ele deixava meia tela vazia ao lado do
            trilho (pedido do Dilton, 10/09/2026). Aqui ele preenche esse espaço, e os cartões
            vêm enxutos (nome, semanas e as barras que comparam os blocos): a frase do bloco, os
            selos e o critério de progressão seguem no painel do bloco em foco, logo abaixo.
          */}
          <section aria-label="O plano bloco a bloco">
          <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-display text-base font-bold text-ink">O plano bloco a bloco</h3>
            <span className="text-xs text-ink-3">as barras comparam os blocos deste plano</span>
          </div>
          {/*
            MAIS DE TRÊS BLOCOS NO CELULAR VIRAM A GRADE COMPACTA do protótipo de 24 semanas.
            Num plano de 24 semanas com seis blocos, os cartões completos somavam uns 1500 px de
            rolagem só de cartões. A compacta é o mesmo seletor (mesmo toque, mesmo foco), e as
            barras de magnitude que ela não tem passam para o painel do bloco em foco, logo
            abaixo, para a comparação entre blocos não sumir.
          */}
          <div
            className={cn(
              // Colunas pelo número de fases, para nenhuma sobrar sozinha numa linha: quatro viram
              // 2 × 2, três ficam lado a lado, e cinco ou mais usam três colunas na tela larga.
              "grid-cols-1 gap-3",
              macro.mesociclos.length === 3
                ? "sm:grid-cols-3"
                : macro.mesociclos.length <= 4
                  ? "sm:grid-cols-2"
                  : "sm:grid-cols-2 xl:grid-cols-3",
              gradeCompacta ? "hidden lg:grid" : "grid",
            )}
          >
            {macro.mesociclos.map((m, i) => (
              <MesocicloCard
                enxuto
                key={m.id}
                meso={m}
                indice={i}
                cor={corDosBlocos.get(chaveDaFase(m)) ?? i}
                emFoco={m.id === emFoco?.meso.id}
                atual={m.id === mesoAtual?.id}
                semanaCorrente={salvo ? semanaCorrente : undefined}
                tetos={tetos}
                onFocar={focarBloco}
              />
            ))}
          </div>
          {gradeCompacta && (
            <div className="grid grid-cols-2 gap-2 lg:hidden">
              {macro.mesociclos.map((m, i) => (
                <MesocicloCompacto
                  key={m.id}
                  meso={m}
                  indice={i}
                  cor={corDosBlocos.get(chaveDaFase(m)) ?? i}
                  emFoco={m.id === emFoco?.meso.id}
                  atual={m.id === mesoAtual?.id}
                  semanaCorrente={salvo ? semanaCorrente : undefined}
                  onFocar={focarBloco}
                />
              ))}
            </div>
          )}
          </section>
        </div>

        {/* TRILHO: por que o PLANO é assim. O que é do bloco vive no painel do bloco e o que
            é da semana, no cartão ao lado; sem isso a mesma frase saía em três lugares da
            mesma tela. */}
        <TrilhoDoPlano plano={plano} modelo={modelo} alunoObj={alunoObj} refIds={plano.refIds} />
      </div>

      {/*
        O PLANO BLOCO A BLOCO: a fileira é o SELETOR, e o detalhe é um painel só, colado
        embaixo dela, sempre no mesmo lugar. Ver o comentário de MesocicloCard: o cartão que
        abria no próprio lugar mudava de posição conforme qual deles fosse aberto.

        Clicar num cartão não joga a página para o topo do painel: basta revelá-lo, com os
        cartões ainda à vista para comparar e trocar. Por isso este destino rola pelo "mais
        perto", e o da semana, "pelo começo".
      */}
      <section>

        {emFoco && (
          <div
            ref={alvoDoBloco}
            tabIndex={-1}
            role="group"
            aria-label={`Bloco em foco: ${rotuloMeso(emFoco.meso)}`}
            className="mt-3 scroll-mt-24 focus:outline-none"
          >
            <PainelDoBloco
              meso={emFoco.meso}
              indice={macro.mesociclos.findIndex((m) => m.id === emFoco.meso.id)}
              ctx={ctx}
              editavel={premium}
              onChange={trocarMeso}
              reavaliarHref={reavaliarHref}
              semanaCorrente={semanaCorrente}
              tetosNoCelular={gradeCompacta ? tetos : undefined}
            />
          </div>
        )}

        <div className="mt-3">
          <ModeloExplicacao modelo={modelo} />
        </div>
      </section>

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

/* --------------------------- Onde o plano está --------------------------- */

/**
 * ONDE O PLANO ESTÁ (protótipo da periodização de 24 semanas), só no plano publicado.
 *
 * Responde de relance o que o gráfico responde depois de uma leitura: em que semana, em que
 * bloco (ou fase), quanto falta do bloco e quando vem a próxima descarga. Tudo do calendário
 * do plano: a semana é `semanaAtual`, e o percentual é essa semana sobre o total.
 *
 * A barra é SÓLIDA. O protótipo a pinta com um gradiente teal para azul, e na casa o único
 * gradiente é o de publicar: um segundo gradiente na tela tiraria dele a exclusividade.
 */
function OndeOPlanoEsta({
  macro,
  meso,
  semana,
  total,
}: {
  macro: Macrociclo;
  meso: Mesociclo;
  semana: number;
  total: number;
}) {
  const i = macro.mesociclos.findIndex((m) => m.id === meso.id);
  // "Fase 2 de 4" quando o bloco nasce de uma fase da jornada; senão "Bloco 3 de 6".
  const nFases = Math.max(0, ...macro.mesociclos.map((m) => m.faseJornada ?? 0));
  const posicao = meso.faseJornada ? `Fase ${meso.faseJornada} de ${nFases}` : `Bloco ${i + 1} de ${macro.mesociclos.length}`;
  const k = semana - meso.semanaInicio + 1;
  const len = meso.semanaFim - meso.semanaInicio + 1;
  const proxDescarga = macro.mesociclos
    .flatMap((m) => m.microciclos)
    .find((w) => w.tipo === "deload" && w.semana >= semana)?.semana;
  const pct = Math.round((semana / total) * 100);
  return (
    <section
      aria-label="Onde o plano está"
      className="relative overflow-hidden rounded-card p-[14px] lg:p-5"
      style={{ background: "#0B1628", color: "#F3F1EA" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(32,100,236,.4), rgba(32,100,236,0) 65%)" }}
      />
      <div className="relative flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-2xs font-semibold uppercase tracking-[0.12em]" style={{ color: "#9DBAFF" }}>
            Onde o plano está
          </p>
          <p className="mt-1 font-display text-xl font-bold leading-tight">
            Semana {semana} · {posicao}
          </p>
          <p className="mt-0.5 text-[12.5px]" style={{ color: "#B9C6D6" }}>
            {rotuloMeso(meso).replace(/^Fase \d+:\s*/, "")} · semana {k} de {len}
            {proxDescarga != null ? ` · descarga na S${proxDescarga}` : ""}
          </p>
        </div>
        <p className="shrink-0 text-right">
          <span className="tabular block font-display text-[30px] font-bold leading-none">{pct}%</span>
          <span className="text-2xs" style={{ color: "#8FA0B5" }}>
            do plano
          </span>
        </p>
      </div>
      <div
        className="relative mt-3 h-1.5 overflow-hidden rounded-full"
        style={{ background: "rgba(255,255,255,.1)" }}
        role="img"
        aria-label={`Semana ${semana} de ${total}`}
      >
        <span className="block h-full origin-left rounded-full bg-analysis-fill motion-safe:animate-cresce" style={{ width: `${pct}%` }} />
      </div>
    </section>
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
/**
 * O CALENDÁRIO DO PLANO (protótipo da periodização).
 *
 * ## O que ele substitui, e por quê
 *
 * Aqui morava a "régua de semanas": barras cuja ALTURA era o volume relativo de cada semana.
 * Ela ficava logo abaixo do gráfico do macrociclo, que plota volume por semana. Ou seja, o
 * mesmo dado, na mesma tela, duas vezes seguidas, e a segunda vez sem os outros dois eixos.
 *
 * O calendário responde o que o gráfico NÃO responde: em que fase cada semana cai, qual é de
 * descarga, quantas sessões ela tem, onde a reavaliação está marcada e onde estou agora. É a
 * estrutura do plano, não a curva dele.
 *
 * Cada célula abre a semana para edição, que era a função da régua e continua sendo.
 */
function CalendarioDoPlano({
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
  // A cor é da FASE, a mesma do gráfico (fonte única em PlanoEditor): quem viu a fase 2 em
  // azul na curva encontra a semana da fase 2 em azul aqui, e a continuação da Fase 4 fica
  // na cor da Fase 4.
  const mesos = [...new Map(semanas.map(({ meso }) => [meso.id, meso])).values()];
  const corPorFase = indicesDeCorDasFases(mesos);
  const familia = (meso: Mesociclo) => {
    const i = corPorFase.get(chaveDaFase(meso)) ?? 0;
    const c = corDaFase(i);
    // Sobre a cor CHEIA da fase, o texto que dá contraste: navy no teal e no âmbar (branco
    // neles fica abaixo de 3:1), branco no azul e no roxo.
    const tintaCheia = i % 4 === 0 || i % 4 === 2 ? "#0B1628" : "#FFFFFF";
    return { bg: `rgba(${c.rgb},.13)`, ponto: c.forte, tintaCheia };
  };
  // Legenda: uma entrada por FASE, com o nome sem "(continuação)".
  const fases = [...new Map(mesos.map((m) => [chaveDaFase(m), m])).values()];
  const hachura = "repeating-linear-gradient(135deg, rgba(255,255,255,.55) 0 1.5px, transparent 1.5px 4px)";

  /*
   * NO MÁXIMO DOZE SEMANAS POR LINHA (protótipo das 24 semanas).
   *
   * O calendário punha o plano INTEIRO numa linha. Com 12 semanas, doze quadrados; com um
   * ano, 48 colunas de 36px, e "S12" virava "S1", "S:" e "S", a última célula vazava do
   * cartão com o ponto de reavaliação do lado de fora. Doze por linha é um trimestre por
   * linha, que é também como o profissional pensa um plano anual. Com mais de uma linha a
   * célula deixa de ser quadrada (quatro linhas de quadrados de 140px seriam 600px de
   * calendário) e fica baixa, com o mesmo alvo de toque.
   */
  const colunas = Math.min(semanas.length, 12);
  const variasLinhas = semanas.length > 12;

  const focoSeparado = foco !== corrente;

  return (
    <Card className="p-[14px] lg:p-4">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="font-display text-base font-bold text-ink">Calendário do plano</h3>
        <span className="text-xs text-ink-2">toque numa semana para abrir</span>
      </div>

      {/* Seis por linha no celular, e o plano INTEIRO numa linha so a partir de sm: e a
          leitura que o calendario existe para dar, ver o ciclo completo de um golpe. */}
      <div
        className={cn(
          // Seis por linha no celular (alvo de toque preservado) e o plano INTEIRO numa
          // linha so a partir de sm: e a leitura que o calendario existe para dar, ver o
          // ciclo completo de um golpe. A contagem vem do plano, que tem 4, 8, 12 ou 24.
          "grid grid-cols-6 gap-1.5",
          "sm:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))]",
        )}
        style={{ ["--cols" as string]: String(colunas) } as React.CSSProperties}
      >
        {semanas.map(({ micro, meso }) => {
          const fam = familia(meso);
          const descarga = micro.tipo === "deload";
          const emFoco = micro.semana === foco;
          const ehCorrente = micro.semana === corrente;
          // A reavaliação do plano cai na ÚLTIMA semana do bloco que a pede.
          const reavalia = Boolean(meso.reavaliacao) && micro.semana === meso.semanaFim;
          const nSessoes = sessoesPrincipais(micro.sessoes).length;
          /*
           * TRÊS ESTADOS, COMO NO PROTÓTIPO, e todos pelo CALENDÁRIO do plano publicado: a
           * semana que já passou vem na cor cheia da fase, a de hoje em papel com borda
           * navy, as que vêm em cor apagada. "Passou" é data, não execução: a célula não
           * diz "feita". Num rascunho (`corrente` ausente) nada passou, e todas são futuras.
           * As futuras escrevem em tinta do tema, e não na cor escura de cada fase, para a
           * célula continuar legível no tema escuro.
           */
          const passou = corrente != null && micro.semana < corrente;
          const tinta = passou ? (descarga ? "#0B1628" : fam.tintaCheia) : undefined;
          return (
            <button
              key={micro.id}
              type="button"
              onClick={() => onFocar(micro.semana)}
              aria-pressed={emFoco}
              title={`Semana ${micro.semana} · ${meso.nome}${descarga ? " · descarga" : ""}${
                reavalia ? " · reavaliação" : ""
              } · ${nSessoes} ${nSessoes === 1 ? "sessão" : "sessões"}${ehCorrente ? " · semana atual" : ""}`}
              className={cn(
                "relative flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-control border-2 transition-colors",
                variasLinhas ? "aspect-square sm:aspect-auto sm:h-[52px]" : "aspect-square",
                ehCorrente ? "border-ink bg-surface text-ink" : "border-transparent",
                !passou && !ehCorrente && "text-ink",
                // A semana aberta abaixo, quando não é a de hoje, ganha um anel azul: são duas
                // perguntas ("onde o plano está" e "o que estou lendo") e duas marcas.
                emFoco && focoSeparado && "ring-2 ring-primary ring-offset-1 ring-offset-surface",
              )}
              style={{
                ...(ehCorrente
                  ? null
                  : {
                      background: descarga
                        ? passou
                          ? "var(--warning-fill)"
                          : "var(--warning-tint)"
                        : passou
                          ? fam.ponto
                          : fam.bg,
                      color: tinta,
                    }),
                // A descarga é hachurada, e não só de outra cor: no plano ela é uma exceção
                // de forma, e a hachura sobrevive ao daltonismo e à impressão em cinza.
                backgroundImage: descarga && !ehCorrente ? hachura : undefined,
                backgroundSize: descarga && !ehCorrente ? "6px 6px" : undefined,
              }}
            >
              <span className="tabular text-2xs font-bold leading-none lg:text-xs">S{micro.semana}</span>
              {/* Um ponto por sessão da semana: a densidade se lê sem contar. */}
              <span className="flex h-1 items-center gap-0.5">
                {Array.from({ length: Math.min(nSessoes, 5) }, (_, k) => (
                  <span key={k} className="h-1 w-1 rounded-full" style={{ background: tinta ?? fam.ponto }} />
                ))}
              </span>
              {reavalia && (
                <span
                  aria-hidden
                  className="absolute right-1 top-1 h-[7px] w-[7px] rounded-full border-[1.5px] border-surface"
                  style={{ background: "var(--danger-fill)" }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* A legenda diz o que cada marca significa. Sem ela as cores viram enfeite. */}
      <div className="mt-3 flex flex-wrap gap-x-3.5 gap-y-1.5 text-2xs text-ink-2">
        {fases.map((meso) => (
          <span key={chaveDaFase(meso)} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: familia(meso).ponto }} />
            {nomeDaFase(meso)}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-[3px]"
            style={{ background: "var(--warning-fill)", backgroundImage: hachura, backgroundSize: "6px 6px" }}
          />
          Descarga
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--danger-fill)" }} />
          Reavaliação
        </span>
        {corrente != null && (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-[3px] border-2 border-ink bg-surface" />
            Atual
          </span>
        )}
        {focoSeparado && (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-[3px] ring-2 ring-primary" />
            Aberta abaixo
          </span>
        )}
      </div>
    </Card>
  );
}

/* --------------------------- Semana em foco --------------------------- */

/** A semana escolhida, com as sessões em abas e cada sessão aberta no editor. */
/**
 * A TIRA DE QUATRO MÉTRICAS da semana em foco (protótipo da periodização).
 *
 * Responde, sem abrir nada, as quatro perguntas que se faz ao olhar uma semana: mudou o
 * quanto em relação à anterior, em que esforço ela está, quando vem o alívio e quando é a
 * próxima reavaliação. Tudo derivado do plano (`agregadoSemana` é a mesma fonte do gráfico
 * e das barras dos blocos); nenhum número aqui é digitado.
 *
 * Cada campo some quando não há o que dizer: a primeira semana não tem "vs a anterior", e um
 * plano sem descarga nem reavaliação não inventa uma.
 */
/** A reserva de repetições da semana quando TODO exercício de força pede a mesma; senão null. */
function rirUnicoDaSemana(micro: Microciclo): number | null {
  const forca = micro.sessoes.flatMap((s) => s.blocos).filter((b) => b.tipo === "forca");
  const rirs = forca.map((b) => b.rirAlvo).filter((r): r is number => r != null);
  return rirs.length > 0 && rirs.length === forca.length && rirs.every((r) => r === rirs[0]) ? rirs[0] : null;
}

function TiraDaSemana({
  micro,
  semanas,
}: {
  micro: Microciclo;
  semanas: { micro: Microciclo; meso: Mesociclo }[];
}) {
  const idx = semanas.findIndex((x) => x.micro.id === micro.id);
  const anterior = idx > 0 ? semanas[idx - 1].micro : undefined;
  const agora = agregadoSemana(micro);
  const antes = anterior ? agregadoSemana(anterior) : undefined;

  const deltaVolume =
    antes && antes.volume > 0 ? Math.round(((agora.volume - antes.volume) / antes.volume) * 100) : null;
  const proxDescarga = semanas.slice(idx + 1).find((x) => x.micro.tipo === "deload")?.micro.semana;
  const proxReavaliacao = semanas.slice(idx).find((x) => x.meso.reavaliacao)?.meso.semanaFim;

  const campos: { rotulo: string; valor: string; cor?: string }[] = [];
  if (deltaVolume != null && anterior) {
    campos.push({
      rotulo: `vs semana ${anterior.semana}`,
      valor: `Volume ${deltaVolume > 0 ? "+" : ""}${deltaVolume}%`,
      cor: deltaVolume > 0 ? "text-analysis" : deltaVolume < 0 ? "text-warning" : undefined,
    });
  }
  // O esforço entra como VARIAÇÃO, e não como número solto: `intensidade` é um valor
  // relativo sem unidade (o próprio gráfico declara isso logo acima), e "80,4" cravado num
  // azulejo é lido como %1RM por quem passa o olho. A variação diz a mesma coisa sem
  // sugerir uma escala que não existe.
  //
  // A EXCEÇÃO É A RESERVA ÚNICA (protótipo: "RIR 3 → 3"). Quando todo exercício de força das
  // duas semanas pede a MESMA reserva, ela é um número que existe em cada sessão, e dizê-la é
  // mais concreto que o percentual. Com reservas diferentes, uma média seria um RIR que
  // nenhuma sessão prescreve, e aí fica a variação.
  const rirAntes = anterior ? rirUnicoDaSemana(anterior) : null;
  const rirAgora = rirUnicoDaSemana(micro);
  if (rirAntes != null && rirAgora != null) {
    campos.push({
      rotulo: "Reserva de repetições",
      valor: `RIR ${rirAntes} → ${rirAgora}`,
      cor: rirAgora < rirAntes ? "text-warning" : rirAgora > rirAntes ? "text-analysis" : undefined,
    });
  } else if (antes?.intensidade != null && agora.intensidade != null && antes.intensidade > 0) {
    const d = Math.round(((agora.intensidade - antes.intensidade) / antes.intensidade) * 100);
    campos.push({
      rotulo: "Esforço médio",
      valor: `${d > 0 ? "+" : ""}${d}%`,
      cor: d > 0 ? "text-warning" : d < 0 ? "text-analysis" : undefined,
    });
  }
  if (proxDescarga != null) campos.push({ rotulo: "Próxima descarga", valor: `S${proxDescarga}` });
  if (proxReavaliacao != null) campos.push({ rotulo: "Reavaliação", valor: `fim da S${proxReavaliacao}` });
  if (campos.length === 0) return null;

  return (
    <div className="mt-3 grid gap-3 border-t border-border pt-3 [grid-template-columns:repeat(auto-fit,minmax(120px,1fr))]">
      {campos.map((c) => (
        <div key={c.rotulo}>
          <span className="block text-2xs font-semibold uppercase tracking-[0.08em] text-ink-3">{c.rotulo}</span>
          <b className={cn("tabular font-display text-lg font-bold", c.cor ?? "text-ink")}>{c.valor}</b>
        </div>
      ))}
    </div>
  );
}

/**
 * A SEMANA EM FOCO, na periodização: LEITURA (protótipo, coluna esquerda do rodapé).
 *
 * Aqui vivia o editor inteiro: abas de sessão, campos rotulados de cada exercício, método
 * de série, botões de agrupar. Mil e trezentos pixels de formulário no pé de uma tela cuja
 * pergunta é "para onde este plano vai". Agora esta caixa responde o que dá para responder
 * de relance (o que mudou em relação à semana anterior, quantas sessões, que tamanho tem
 * cada uma) e oferece a porta: editar é a tela de editar.
 *
 * Nenhum número aqui é digitado: sessões e séries saem dos blocos, e a tira de quatro
 * métricas sai de `agregadoSemana`, a mesma fonte do gráfico.
 */
function ResumoDaSemana({
  micro,
  meso,
  semanas,
  podeEditar,
  onFocar,
  onEditar,
  registro,
}: {
  micro: Microciclo;
  meso: Mesociclo;
  semanas: { micro: Microciclo; meso: Mesociclo }[];
  podeEditar: boolean;
  onFocar: (n: number) => void;
  onEditar: () => void;
  /** o que o aluno registrou, só em plano publicado (num rascunho nada foi feito) */
  registro?: RegistroDoAluno;
}) {
  /*
   * O PASSO DE SEMANA, aqui e não só no calendário.
   *
   * O calendário fica uma tela inteira acima desta caixa: clicar nele traz o olho para cá,
   * e trocar de semana de novo exigiria subir a página toda de volta. Duas setas resolvem o
   * caminho de ida e volta sem repetir o calendário (que continua sendo o mapa; estas são
   * só o próximo e o anterior).
   */
  const idx = semanas.findIndex((x) => x.micro.semana === micro.semana);
  const anterior = idx > 0 ? semanas[idx - 1].micro.semana : undefined;
  const proxima = idx >= 0 && idx < semanas.length - 1 ? semanas[idx + 1].micro.semana : undefined;

  return (
    <Card variant="raised" className="min-w-0 p-4 md:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="font-display text-lg font-bold text-ink">Semana {micro.semana} em foco</h3>
        <div className="flex items-center gap-1">
          <span className="mr-1 text-xs text-ink-3">
            {rotuloMeso(meso)}
            {micro.tipo === "deload" ? " · descarga" : ""}
          </span>
          <button
            type="button"
            onClick={() => anterior != null && onFocar(anterior)}
            disabled={anterior == null}
            aria-label={anterior != null ? `Ir para a semana ${anterior}` : "Não há semana anterior"}
            className={cn(
              // 44px: o piso de alvo de toque da casa. Com 36 a seta cabia no desenho e não no dedo.
              "grid h-11 w-11 place-items-center rounded-control border border-border text-ink-2",
              anterior == null ? "cursor-not-allowed opacity-40" : "hover:bg-surface-soft hover:text-ink",
            )}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => proxima != null && onFocar(proxima)}
            disabled={proxima == null}
            aria-label={proxima != null ? `Ir para a semana ${proxima}` : "Não há próxima semana"}
            className={cn(
              // 44px: o piso de alvo de toque da casa. Com 36 a seta cabia no desenho e não no dedo.
              "grid h-11 w-11 place-items-center rounded-control border border-border text-ink-2",
              proxima == null ? "cursor-not-allowed opacity-40" : "hover:bg-surface-soft hover:text-ink",
            )}
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
      {/* O objetivo declarado DA SEMANA quando o plano o tem (protótipo: "Objetivo: subir a
          carga mantendo 3 repetições em reserva"); senão, o foco do bloco. */}
      {micro.objetivo ? (
        <p className="mt-1 text-[12.5px] text-ink-2">
          <span className="font-semibold text-ink">Objetivo:</span> {comInicialMinuscula(micro.objetivo)}
        </p>
      ) : (
        meso.foco && <p className="mt-1 text-sm text-ink-2">{meso.foco}</p>
      )}

      {/* As sessões primeiro e a tira de métricas depois, como no protótipo: o que se veio
          ver é o que a semana tem; a comparação com a anterior é o rodapé dela. */}
      {micro.sessoes.length === 0 ? (
        <p className="mt-3 rounded-control border border-dashed border-border p-3 text-sm text-ink-3">
          Esta semana não tem sessão. Ajuste no plano bloco a bloco.
        </p>
      ) : (
        <ul className="mt-3 grid gap-2.5 [grid-template-columns:repeat(auto-fit,minmax(14rem,1fr))]">
          {micro.sessoes.map((s) => (
            <CartaoDaSessao key={s.id} sessao={s} semana={micro.semana} registro={registro} />
          ))}
        </ul>
      )}

      <TiraDaSemana micro={micro} semanas={semanas} />

      <button
        onClick={onEditar}
        className={cn(buttonClasses("primary", "sm"), "mt-3 h-11 w-full lg:h-9 lg:w-auto")}
        title={podeEditar ? undefined : "No plano gratuito o editor abre em leitura"}
      >
        <Pencil className="h-4 w-4" /> Editar semana {micro.semana}
      </button>
    </Card>
  );
}

/**
 * O cartão de uma sessão, no resumo da semana (protótipo: "Sessão A · Inferiores, 5
 * exercícios · 14 séries · RIR 3").
 *
 * O que NÃO entra: o dia AGENDADO ("hoje · qua", "sex"). O protótipo tem, e o produto não
 * mantém agenda; imprimir um dia aqui seria fingir uma agenda que não existe, que é
 * exatamente o que o app do aluno é proibido de fazer.
 *
 * O que entra, e só com plano publicado: o que o aluno REGISTROU. A barra tem um segmento por
 * exercício, cheio quando todas as séries dele foram registradas naquela semana
 * (`blocoCompleto`, a mesma regra do app do aluno), e o selo "feita" só aparece com todos
 * cheios. O dia do selo é o do fecho da sessão que o próprio aluno enviou; sem fecho, o selo
 * sai sem dia em vez de inventar um.
 */
interface RegistroDoAluno {
  planoId: string;
  execucoes: Execucao[];
  sessaoFeedbacks: SessaoFeedback[];
}

const fmtDiaDaSemana = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(new Date(ts)).replace(/\.$/, "");

function CartaoDaSessao({ sessao, semana, registro }: { sessao: Sessao; semana: number; registro?: RegistroDoAluno }) {
  const forca = sessao.blocos.filter((b) => b.tipo !== "aerobio");
  const series = forca.reduce(
    (n, b) => n + (b.seriesAlvo ?? Number(/(\d+)/.exec(b.series ?? "")?.[1] ?? 0)),
    0,
  );
  const minutos = sessao.blocos
    .filter((b) => b.tipo === "aerobio")
    .reduce((n, b) => n + Number(/(\d+)/.exec(String(b.duracaoAlvoMin ?? b.duracao ?? ""))?.[1] ?? 0), 0);
  // A reserva de repetições só é dita quando TODOS os blocos de força concordam: uma média
  // de reservas diferentes seria um número que não existe em sessão nenhuma.
  const rirs = forca.map((b) => b.rirAlvo).filter((r): r is number => r != null);
  const rirUnico = rirs.length === forca.length && rirs.length > 0 && rirs.every((r) => r === rirs[0]) ? rirs[0] : null;

  // A dose em texto corrido, como o protótipo ("5 exercícios · 14 séries · RIR 3"): cada
  // número vem colado à própria palavra, então o par rótulo e valor continua junto.
  const dose = [
    `${forca.length} ${forca.length === 1 ? "exercício" : "exercícios"}`,
    series > 0 ? `${series} ${series === 1 ? "série" : "séries"}` : "",
    rirUnico != null ? `RIR ${rirUnico}` : "",
    minutos > 0 ? `aeróbio ${minutos} min` : "",
  ].filter(Boolean);

  const feitos = registro ? sessao.blocos.map((b) => blocoCompleto(b, registro.execucoes, semana)) : [];
  const feita = feitos.length > 0 && feitos.every(Boolean);
  const fecho = feita
    ? registro!.sessaoFeedbacks.find((f) => f.planoId === registro!.planoId && f.sessaoRef === sessao.id && f.semana === semana)
    : undefined;

  return (
    <li className="rounded-[16px] border border-border p-3.5">
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 text-[14.5px] font-bold text-ink">{sessao.nome}</p>
        {feita && (
          <Pill tone="success" className="shrink-0">
            feita{fecho ? ` · ${fmtDiaDaSemana(fecho.concluidaEm)}` : ""}
          </Pill>
        )}
      </div>
      {sessao.foco && <p className="text-xs text-ink-2">{sessao.foco}</p>}
      <p className="tabular mt-1.5 text-[12.5px] text-ink-2">{dose.join(" · ")}</p>
      {/* A barra do registro fica colada à linha da dose (é a mesma sessão em número e em
          andamento), antes da lista de exercícios. */}
      {registro && sessao.blocos.length > 0 && (
        <div
          className="mt-2.5 flex gap-1"
          role="img"
          aria-label={`${feitos.filter(Boolean).length} de ${feitos.length} exercícios registrados nesta semana`}
        >
          {feitos.map((ok, i) => (
            <span key={i} className={cn("h-[5px] flex-1 rounded-full", ok ? "bg-analysis-fill" : "bg-border")} />
          ))}
        </div>
      )}
    </li>
  );
}

/* ============================= Editor da semana ============================= */

/**
 * A tela de EDITAR A SEMANA (protótipo: \`data-screen-label="Editor de treino"\`).
 *
 * Não é função nova: é o mesmo \`SessaoBloco\` de sempre, com as mesmas trocas, os mesmos
 * agrupamentos e os mesmos campos, tirado de baixo da tela de leitura e posto numa tela onde
 * ele cabe em largura inteira. O que ele ganha é contexto: cabeçalho dizendo qual semana e
 * de qual bloco, régua para pular de semana sem voltar, e um trilho que fala do que está
 * sendo editado (o equilíbrio da semana e o aviso de concentração, que na periodização
 * comentavam uma semana que nem estava à vista).
 */
function EditorDaSemana({
  plano,
  micro,
  meso,
  semanas,
  ctx,
  editavel,
  aluno,
  podeSalvar,
  salvo,
  onChange,
  onDuplicar,
  onFocar,
  onVoltar,
  onExportar,
  onPublicar,
  estadoPublicacao,
}: {
  estadoPublicacao: EstadoNoEditor;
  plano: PlanoTreino;
  micro: Microciclo;
  meso: Mesociclo;
  semanas: { micro: Microciclo; meso: Mesociclo }[];
  ctx: ContextoFaixa;
  editavel: boolean;
  aluno?: string;
  podeSalvar: boolean;
  salvo: boolean;
  onChange: (m: Microciclo) => void;
  onDuplicar: () => void;
  onFocar: (n: number) => void;
  onVoltar: () => void;
  onExportar: (somenteSemana?: number) => void;
  onPublicar: () => void;
}) {
  const [sessaoIdx, setSessaoIdx] = React.useState(0);
  const [renomeando, setRenomeando] = React.useState(false);
  React.useEffect(() => {
    setSessaoIdx(0);
    setRenomeando(false);
  }, [micro.id]);
  const sessao = micro.sessoes[Math.min(sessaoIdx, micro.sessoes.length - 1)];

  /*
   * O EFEITO DA EDIÇÃO acompanha o gesto, e o gesto é aqui.
   *
   * Ele vivia dentro do cartão do bloco, na periodização, onde a edição não acontece mais.
   * Sem ele, a única resposta a mexer numa dose seria a curva se redesenhar noutra tela, e
   * ninguém guarda de memória onde ela estava dois segundos atrás.
   */
  const [efeito, setEfeito] = React.useState<EfeitoDaEdicao | null>(null);
  React.useEffect(() => setEfeito(null), [micro.id]);
  const trocarMicro = (novo: Microciclo) => {
    setEfeito(efeitoDaEdicao(micro, novo));
    onChange(novo);
  };

  const trocarSessao = (nova: Sessao) =>
    trocarMicro({ ...micro, sessoes: micro.sessoes.map((s) => (s.id === nova.id ? nova : s)) });

  /*
   * ADICIONAR SESSÃO ABRE A SESSÃO. Ela nascia como a última pílula do trilho, não
   * selecionada, e a tela continuava mostrando a sessão anterior: o único sinal de que o
   * clique funcionou era uma pílula a mais no meio de outras seis. O nome sai numerado pelas
   * PRINCIPAIS, senão a semana com três complementos criava a "Sessão 7" logo depois da 3.
   */
  const addSessao = () => {
    trocarMicro({
      ...micro,
      sessoes: [
        ...micro.sessoes,
        { id: `ses-${uid()}`, nome: `Sessão ${sessoesPrincipais(micro.sessoes).length + 1}`, blocos: [] },
      ],
      // Frequência é quantas sessões a semana tem. Guardar o número separado das sessões
      // deixaria o plano dizer "4x" e entregar 3.
      frequencia: micro.sessoes.length + 1,
    });
    setSessaoIdx(micro.sessoes.length);
  };

  // A semana anterior DO MESMO BLOCO: é contra ela que "o que mudou" compara.
  const anteriorNoBloco = (() => {
    const i = meso.microciclos.findIndex((w) => w.id === micro.id);
    return i > 0 ? meso.microciclos[i - 1] : undefined;
  })();

  // A semana anterior DO PLANO: é ela que o selo de decisão de cada exercício compara. A
  // próxima saiu daqui junto com o segmentado do cabeçalho; quem anda entre semanas agora é
  // a régua, que já sabe onde está.
  const idx = semanas.findIndex((x) => x.micro.semana === micro.semana);
  const anterior = idx > 0 ? semanas[idx - 1] : undefined;

  /*
   * DESCARTAR ALTERAÇÕES (protótipo, ao lado de "aplicar às outras semanas").
   *
   * Cada gesto destrutivo já tinha desfazer, mas quem mexeu em cinco doses e se arrependeu do
   * conjunto não tinha volta: teria que desfazer de memória, um a um, na ordem certa. A base
   * é a semana COMO ELA ESTAVA ao abrir o editor, guardada por semana (trocar de semana troca
   * a base). A comparação é por identidade porque toda edição cria um objeto novo.
   */
  const baseRef = React.useRef<{ id: string; micro: Microciclo }>({ id: micro.id, micro });
  if (baseRef.current.id !== micro.id) baseRef.current = { id: micro.id, micro };
  const base = baseRef.current.micro;
  const temEdicao = base !== micro;
  const descartar = () => {
    const antes = micro;
    onChange(base);
    toastDesfazer(`Edições da semana ${micro.semana} descartadas.`, () => onChange(antes));
  };

  return (
    <div className="space-y-5 motion-safe:animate-entra">
      {/*
        O CABEÇALHO NÃO SE MEXE AO TROCAR DE SEMANA.

        Ele era `flex-wrap` com `justify-between`, e três coisas mudavam de largura a cada
        troca de semana: o título (de "Semana 8 · Fase 3: Desenvolvimento" a "Semana 1 · Fase
        1: Entrada · segurança · adaptação"), e o segmentado das três semanas vizinhas, que
        tinha ora dois ora três botões e ganhava " · descarga" em alguns. Resultado: os botões
        de ação escorregavam para o lado e às vezes pulavam para outra linha, na mesma largura
        de tela, só por clicar numa semana.

        Agora as ações moram na linha do "voltar", cuja altura é a de um botão e não muda
        nunca, e o título ocupa a largura inteira embaixo. É isso que torna a posição delas
        INDEPENDENTE do texto do título: nome de fase comprido, pílula de descarga ou título
        em duas linhas deixam de ser capazes de mover o que quer que seja. Alinhá-las pela
        base do título, que foi a primeira tentativa, ainda deixava a semana de descarga
        empurrar tudo 24 px para baixo.
      */}
      <div className="space-y-3">
        {/*
          `flex-wrap` VOLTA AQUI, e agora ele é seguro. Ele era o que fazia os botões pularem
          de linha quando o TÍTULO crescia, porque o título dividia a linha com eles. Do outro
          lado deste par está o "voltar", que tem sempre a mesma largura: a quebra passa a
          depender só da largura da tela, que é o que ela deve significar. Sem ele, o celular
          de 390 px cortava o "Publicar" fora da tela.
        */}
        {/*
          NO CELULAR, A ORDEM DO PROTÓTIPO: voltar, sobrelinha, título e as ações embaixo, em
          largura cheia. A regra acima continua valendo: o título não divide LINHA com os
          botões (eles ficam numa linha própria, abaixo dele), então nome de fase comprido
          não empurra nada para o lado. No desktop nada muda: as ações seguem na linha do
          voltar. A troca é por `order`, com os mesmos nós, e não duplicando os botões.
        */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
          <button
            onClick={onVoltar}
            className="order-1 inline-flex min-h-[44px] shrink-0 basis-full items-center gap-1 text-[13px] font-medium text-ink-2 hover:text-ink lg:min-h-0 lg:basis-auto lg:text-sm lg:font-semibold"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden /> Periodização
          </button>
          <div className="order-3 flex w-full flex-wrap items-center gap-2 lg:order-2 lg:ml-auto lg:w-auto lg:justify-end">
            <button
              onClick={() => onExportar(micro.semana)}
              disabled={!podeSalvar}
              className={cn(buttonClasses("secondary", "sm"), "h-11 shrink-0 lg:h-9", !podeSalvar && "cursor-not-allowed opacity-50")}
              // O número da semana saiu do RÓTULO e foi para o title. Ele fazia o botão mudar
              // de largura entre "Folha da semana 1" e "Folha da semana 12", e como o par de
              // ações é ancorado à direita, os 11 px de diferença empurravam este botão a cada
              // troca de semana. Qual semana é já está dito no título logo abaixo, em corpo 30.
              title={`Uma página com a semana ${micro.semana}, com espaço para o aluno anotar a carga`}
            >
              <FileDown className="h-4 w-4" /> Folha da semana
            </button>
            <BotaoPublicarPlano
              estado={estadoPublicacao}
              aluno={aluno}
              podeSalvar={podeSalvar}
              onPublicar={onPublicar}
              // Ocupa o resto da linha e, se o rótulo inteiro não couber ao lado (o botão não
              // quebra texto), desce para uma linha própria em largura cheia.
              className="h-11 flex-1 lg:h-9 lg:flex-none"
            />
          </div>
        <div className="order-2 min-w-0 basis-full lg:order-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            {aluno ? `${aluno} · ` : ""}
            {getModelo(plano.modeloId).nome} · {plano.semanas} semanas
          </p>
          {/*
            A descarga é uma PÍLULA ao lado do nome, e não um parágrafo embaixo dele. Como
            parágrafo, ela acrescentava uma linha ao título só em algumas semanas, e com as
            duas colunas alinhadas pela base os botões de ação desciam 14 px ao entrar numa
            semana de descarga e subiam ao sair. O que ela dizia ("menos carga, de propósito")
            já está dito duas vezes logo abaixo: na barra hachurada da régua e no segmentado
            "Descarga" do tipo da semana, que é onde a descarga se explica e se desfaz.
          */}
          <h2 className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-display text-[26px] font-bold leading-[1.05] tracking-[-0.03em] text-ink lg:text-3xl">
            <span>
              Semana {micro.semana} · {rotuloMeso(meso)}
            </span>
            {micro.tipo === "deload" && <Pill tone="warning">descarga</Pill>}
          </h2>
        </div>
        </div>

        {/* A navegação entre semanas também saiu daqui: ela vivia como segmentado das três
            vizinhas EM CIMA da régua de doze semanas que vem logo abaixo, dois controles
            para o mesmo trabalho, um colado no outro. A régua ficou com o trabalho inteiro e
            ganhou os passos anterior e próximo em lugares fixos. */}
      </div>

      <ReguaDoEditor
        semanas={semanas}
        atual={micro.semana}
        corrente={salvo ? semanaAtual(plano) : undefined}
        onFocar={onFocar}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-3">
          <ControlesDaSemana
            micro={micro}
            microAnterior={anteriorNoBloco}
            ctx={ctx}
            editavel={editavel}
            onChange={trocarMicro}
          />

          {efeito && <EfeitoDaEdicaoCard efeito={efeito} onDispensar={() => setEfeito(null)} />}

          {micro.sessoes.length === 0 ? (
            /* Mandava "ajuste na periodização" numa tela que tem o botão de criar sessão. A
               saída existe aqui; o vazio passa a mostrá-la em vez de mandar embora. */
            <div className="rounded-control border border-dashed border-border p-4 text-center">
              <p className="text-sm text-ink-3">Esta semana ainda não tem sessão.</p>
              {editavel && (
                <button onClick={addSessao} className={cn(buttonClasses("secondary", "sm"), "mt-2")}>
                  <Plus className="h-4 w-4" aria-hidden /> Criar a primeira sessão
                </button>
              )}
            </div>
          ) : (
            <>
              <SeletorDeSessoes
                sessoes={micro.sessoes}
                idx={sessaoIdx}
                editavel={editavel}
                renomeando={renomeando}
                onEscolher={setSessaoIdx}
                onRenomear={() => setRenomeando(true)}
                onFecharRenomear={() => setRenomeando(false)}
                onNome={(nome) => sessao && trocarSessao({ ...sessao, nome })}
                onAdicionar={addSessao}
                onRemover={() => {
                  if (!sessao) return;
                  const antes = micro;
                  trocarMicro({ ...micro, sessoes: micro.sessoes.filter((s) => s.id !== sessao.id) });
                  setSessaoIdx((i) => Math.max(0, Math.min(i, micro.sessoes.length - 2)));
                  toastDesfazer(`${sessao.nome} removida da semana ${micro.semana}.`, () => onChange(antes));
                }}
              />

              {sessao && (
                <SessaoBloco
                  sessao={sessao}
                  ctx={ctx}
                  editavel={editavel}
                  microAnterior={anterior?.micro}
                  tipoSemana={micro.tipo}
                  ocultarCabecalho
                  onChange={trocarSessao}
                />
              )}
            </>
          )}

          {/* "Adicionar sessão" subiu para o fim do trilho de sessões, que é onde as sessões
              se escolhem. Aqui embaixo ele ficava depois da lista inteira de exercícios,
              longe do controle que ele alimenta, e competia em peso com "Adicionar
              exercício", que é o gesto de dentro da sessão aberta. */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            {editavel && micro.tipo !== "deload" ? (
              // Botão, e não link como no protótipo: reescreve várias semanas de uma vez (com
              // desfazer). No celular em largura cheia e 44 px.
              <button onClick={onDuplicar} className={cn(buttonClasses("secondary", "sm"), "h-11 w-full sm:h-9 sm:w-auto")}>
                Aplicar às outras semanas do bloco
              </button>
            ) : (
              <span />
            )}
            {/* A navegação entre semanas subiu para o cabeçalho; aqui fica só o desfazer do
                conjunto, que é a outra metade do par do protótipo. */}
            {editavel && temEdicao && (
              <button
                onClick={descartar}
                className="inline-flex min-h-[44px] items-center rounded-control text-sm font-semibold text-ink-3 hover:text-ink hover:underline"
              >
                Descartar alterações da semana
              </button>
            )}
          </div>
        </div>

        <TrilhoDoEditor micro={micro} meso={meso} sessao={sessao} ctx={ctx} />
      </div>
    </div>
  );
}

/**
 * A ESCOLHA DA SESSÃO: um trilho de pílulas do mesmo tamanho, e a identidade embaixo.
 *
 * ## O que estava errado
 *
 * A pílula carregava `nome` MAIS `foco`, e o foco é a frase que o motor escreve para a
 * sessão: "Condicionamento aeróbio", "Isométrico para o controle da pressão arterial". Numa
 * semana de emagrecimento com hipertensão isso dava seis pílulas de larguras completamente
 * diferentes, entre 150 e 400 px, embrulhando em quatro fileiras, com a MESMA frase repetida
 * três vezes seguidas. Um monte irregular no lugar de um controle.
 *
 * Pior: renomear e remover ficavam num par de ícones depois do monte todo, agindo sobre a
 * sessão selecionada sem nenhuma ligação visual com ela. O alvo do gesto estava a quatro
 * fileiras de distância do gesto.
 *
 * ## O desenho
 *
 * A pílula fica com o que a distingue das outras (o nome) e com o que se quer saber ao
 * escolher entre elas (quantos exercícios tem). Larguras parecidas, uma fileira só.
 *
 * O `foco` não sumiu: ele é do que está aberto, não de cada opção da lista, então desce para
 * a linha de identidade logo abaixo, onde aparece UMA vez, ao lado das ações que agem
 * exatamente sobre aquela sessão. Renomear acontece ali, e não dentro da pílula: um campo
 * dentro do trilho fazia as outras pílulas escorregarem a cada letra digitada.
 *
 * Os COMPLEMENTOS ficam num grupo à parte, atrás de um traço. Eles não são mais um dia de
 * treino (é o que o campo `complemento` significa: acontecem no mesmo dia de uma principal),
 * e misturados no meio das outras faziam a semana parecer ter seis treinos quando tem três.
 */
function SeletorDeSessoes({
  sessoes,
  idx,
  editavel,
  renomeando,
  onEscolher,
  onRenomear,
  onFecharRenomear,
  onNome,
  onRemover,
  onAdicionar,
}: {
  sessoes: Sessao[];
  idx: number;
  editavel: boolean;
  renomeando: boolean;
  onEscolher: (i: number) => void;
  onRenomear: () => void;
  onFecharRenomear: () => void;
  onNome: (nome: string) => void;
  onRemover: () => void;
  onAdicionar: () => void;
}) {
  const itens = sessoes.map((s, i) => ({ s, i }));
  const principais = itens.filter((x) => !x.s.complemento);
  const complementos = itens.filter((x) => x.s.complemento);
  const atual = sessoes[idx];

  const pilula = ({ s, i }: { s: Sessao; i: number }) => (
    <button
      key={s.id}
      role="tab"
      aria-selected={i === idx}
      onClick={() => onEscolher(i)}
      title={s.foco ? `${s.nome} · ${s.foco}` : s.nome}
      className={cn(
        "inline-flex min-h-[44px] max-w-[14rem] items-center gap-2 rounded-full border px-3.5 text-[13px] font-semibold transition-colors",
        i === idx
          ? "border-ink bg-ink font-bold text-surface"
          : s.complemento
            ? "border-dashed border-border text-ink-2 hover:bg-surface-soft hover:text-ink"
            : "border-border text-ink-2 hover:bg-surface-soft hover:text-ink",
      )}
    >
      <span className="truncate">{s.nome}</span>
      {/*
        Quantos exercícios a sessão tem. É o dado que decide entre uma sessão e outra ao
        escolher, e ele não existia em lugar nenhum do trilho. Herda a cor da pílula (opacidade
        em cima de `currentColor`), então funciona igual na escura e na clara sem depender de
        um token para cada estado.
      */}
      <span className="tabular text-2xs font-semibold opacity-60" aria-label={`${s.blocos.length} exercícios`}>
        {s.blocos.length}
      </span>
    </button>
  );

  return (
    <div className="space-y-2">
      {/*
        DUAS FILEIRAS POR DESENHO, e não por transbordo.

        Com tudo numa fileira só, seis sessões embrulhavam em três linhas conforme a largura
        da janela, e a quebra caía onde calhasse: "Sessão isométrica 1" podia terminar a
        primeira linha e a 2 começar a segunda. Separadas, cada grupo cabe folgado na sua
        (medido em 773 px de coluna: 409 px as principais com o botão de acrescentar, 529 px
        os complementos), e o rótulo diz o que antes era só um traço vertical.
      */}
      <div role="tablist" aria-label="Sessões da semana" className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {principais.map(pilula)}
          {editavel && (
            <button
              type="button"
              onClick={onAdicionar}
              title="Adicionar uma sessão nesta semana"
              className="inline-flex min-h-[44px] shrink-0 items-center gap-1 rounded-full border border-dashed border-border px-3 text-sm font-semibold text-ink-3 transition-colors hover:border-primary hover:text-primary"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden /> Sessão
            </button>
          )}
        </div>
        {complementos.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <span
              className="text-2xs font-semibold uppercase tracking-[0.08em] text-ink-3"
              title="Acontecem no mesmo dia de uma sessão principal, não num dia a mais"
            >
              No mesmo dia
            </span>
            {complementos.map(pilula)}
          </div>
        )}
      </div>

      {atual && (
        <div className="flex min-h-[32px] flex-wrap items-center gap-x-2 gap-y-1">
          {renomeando && editavel ? (
            <input
              autoFocus
              value={atual.nome}
              aria-label="Nome da sessão"
              onChange={(e) => onNome(e.target.value)}
              onBlur={onFecharRenomear}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "Escape") onFecharRenomear();
              }}
              className="min-h-[32px] min-w-0 flex-1 rounded-control border border-primary bg-surface px-2 text-sm font-semibold text-ink focus:outline-none"
            />
          ) : (
            <p className="min-w-0 flex-1 text-sm text-ink-2">
              <b className="font-semibold text-ink">{atual.nome}</b>
              {atual.complemento && <span className="text-ink-3"> · complemento</span>}
              {atual.foco && <span> · {atual.foco}</span>}
            </p>
          )}
          {editavel && !renomeando && (
            <span className="inline-flex shrink-0 items-center gap-0.5">
              <button
                onClick={onRenomear}
                aria-label={`Renomear ${atual.nome}`}
                title="Renomear sessão"
                className="rounded-control p-2 text-ink-3 transition-colors hover:bg-surface-soft hover:text-ink"
              >
                <Pencil className="h-4 w-4" aria-hidden />
              </button>
              <button
                onClick={onRemover}
                aria-label={`Remover ${atual.nome}`}
                title="Remover sessão"
                className="rounded-control p-2 text-ink-3 transition-colors hover:bg-surface-soft hover:text-[color:var(--cta-text)]"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * A RÉGUA DE SEMANAS do editor (protótipo). Uma barra por semana, na cor da fase, a atual
 * marcada e a descarga hachurada: é o calendário da periodização achatado, porque aqui o
 * que se precisa saber é só onde estou e o que vem antes e depois.
 *
 * ELA É O ÚNICO CONTROLE DE SEMANA DESTA TELA. O segmentado das três vizinhas que ficava no
 * cabeçalho dizia a mesma coisa em pior resolução e mudava de largura conforme a semana, o
 * que empurrava os botões de ação para o lado a cada clique. Os passos anterior e próximo
 * vieram para cá, em lugares FIXOS nas pontas: eles ficam desabilitados na primeira e na
 * última semana em vez de sumirem, senão a régua inteira mudaria de largura nas pontas, que é
 * exatamente o defeito que este arranjo existe para não ter.
 */
function ReguaDoEditor({
  semanas,
  atual,
  corrente,
  onFocar,
}: {
  semanas: { micro: Microciclo; meso: Mesociclo }[];
  atual: number;
  /** semana de hoje do plano PUBLICADO: as que vêm depois dela saem em cor apagada */
  corrente?: number;
  onFocar: (n: number) => void;
}) {
  const mesos = [...new Map(semanas.map(({ meso }) => [meso.id, meso])).values()];
  const corPorFase = indicesDeCorDasFases(mesos);
  // Num plano longo, "S37" não cabe numa barra de 22px: o rótulo sai a cada quatro semanas
  // (e sempre na semana aberta), e a barra continua lá para ser tocada.
  const longo = semanas.length > 24;
  const posicao = semanas.findIndex((s) => s.micro.semana === atual);
  const passoAnterior = posicao > 0 ? semanas[posicao - 1] : undefined;
  const passoProximo = posicao >= 0 && posicao < semanas.length - 1 ? semanas[posicao + 1] : undefined;

  /*
   * UMA LINHA SÓ NO CELULAR (protótipo), e não duas fileiras de seis: a leitura desta régua é
   * "onde estou no plano", e ela se perde quando o plano quebra em duas linhas. Até 12
   * semanas cabem as 12 colunas; num plano mais longo aparece a janela de 12 que contém a
   * semana aberta, a mesma divisão do gráfico da periodização, e as setas atravessam a janela
   * sozinhas. A partir de `sm` a régua volta a mostrar o plano inteiro.
   */
  const POR_JANELA = 12;
  const inicioJanela =
    semanas.length > POR_JANELA
      ? Math.max(0, Math.min(Math.floor(Math.max(posicao, 0) / POR_JANELA) * POR_JANELA, semanas.length - POR_JANELA))
      : 0;
  const naJanela = (i: number) => i >= inicioJanela && i < inicioJanela + POR_JANELA;

  const passo = (alvo: typeof passoAnterior, dir: "anterior" | "próxima") => (
    <button
      type="button"
      onClick={() => alvo && onFocar(alvo.micro.semana)}
      disabled={!alvo}
      aria-label={alvo ? `Semana ${alvo.micro.semana}` : `Sem semana ${dir}`}
      title={
        alvo
          ? `Semana ${alvo.micro.semana}${alvo.micro.tipo === "deload" ? " · descarga" : ""}`
          : undefined
      }
      className={cn(
        "grid h-9 w-9 shrink-0 place-items-center rounded-control border border-border text-ink-2 transition-colors",
        alvo ? "hover:bg-surface-soft hover:text-ink" : "cursor-not-allowed opacity-40",
      )}
    >
      {dir === "anterior" ? (
        <ChevronLeft className="h-4 w-4" aria-hidden />
      ) : (
        <ChevronRight className="h-4 w-4" aria-hidden />
      )}
    </button>
  );

  return (
    <div
      className="flex items-center gap-2"
      style={{
        ["--cols" as string]: String(semanas.length),
        ["--cols-janela" as string]: String(Math.min(semanas.length, POR_JANELA)),
      }}
    >
      {passo(passoAnterior, "anterior")}
      <div className="grid min-w-0 flex-1 gap-0.5 [grid-template-columns:repeat(var(--cols-janela),minmax(0,1fr))] sm:gap-1 sm:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))]">
        {semanas.map(({ micro, meso }, i) => {
          const ehAtual = micro.semana === atual;
          const c = corDaFase(corPorFase.get(chaveDaFase(meso)) ?? 0);
          // Com o plano publicado, o que ainda vem sai em cor apagada (protótipo, alpha 55).
          const futura = corrente != null && micro.semana > corrente;
          return (
            <button
              key={micro.id}
              type="button"
              onClick={() => onFocar(micro.semana)}
              aria-pressed={ehAtual}
              title={`Semana ${micro.semana} · ${rotuloMeso(meso)}${micro.tipo === "deload" ? " · descarga" : ""}`}
              className={cn(
                "min-h-[44px] flex-col items-center justify-center gap-1.5 rounded-control",
                naJanela(i) ? "flex" : "hidden sm:flex",
              )}
            >
              <span
                className={cn("block h-2.5 w-full rounded-full", ehAtual && "ring-2 ring-ink ring-offset-2 ring-offset-bg")}
                style={{
                  background: futura ? `rgba(${c.rgb},.33)` : c.forte,
                  backgroundImage:
                    micro.tipo === "deload"
                      ? "repeating-linear-gradient(135deg, rgba(255,255,255,.55) 0 1.5px, transparent 1.5px 4px)"
                      : undefined,
                }}
              />
              <span className={cn("tabular text-2xs", ehAtual ? "font-bold text-ink" : "text-ink-3")}>
                {/* Na janela do celular cabe o r\u00f3tulo de toda semana; o "a cada quatro" \u00e9 do
                    plano longo inteiro numa linha, a partir de `sm`. */}
                <span className="sm:hidden">S{micro.semana}</span>
                <span className="hidden sm:inline">
                  {!longo || ehAtual || (micro.semana - 1) % 4 === 0 ? `S${micro.semana}` : "\u00a0"}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      {passo(passoProximo, "próxima")}
    </div>
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
  // Sem estas duas, o equilíbrio em um pé (Tornozelo e pé) caía em "Corpo todo" e uma idosa
  // com 2 sessões via 26% de "Corpo todo" numa semana que não tinha nenhum exercício de
  // corpo todo (medido em 09/09/2026, cenário de validação 3).
  "Tornozelo e pé": "Inferiores",
  Pescoço: "Superiores",
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
/**
 * Nome curto de uma referência para a linha "Base" do trilho: sobrenome do primeiro autor,
 * ou a sigla quando quem assina é uma instituição.
 *
 * `refCurta` existe para citação no meio do texto e sai grande demais numa coluna de 320px:
 * a de 2009 do ACSM vira "American College of Sports Medicine (Ratamess NA et al.) (2009)",
 * que sozinha ocupa três linhas. Nada é inventado aqui: a sigla é feita das iniciais do
 * próprio nome, e a lista completa continua na aba Ciência, logo abaixo.
 */
function nomeCurtoDaRef(id: string): string {
  const r = getReferencia(id);
  if (!r) return "";
  const primeiro = r.autores.replace(/\s*\(.*$/, "").split(/,| e /)[0].trim();
  const palavras = primeiro.split(/\s+/);
  // Instituição: várias palavras e nenhuma delas é inicial de nome próprio ("Schoenfeld BJ").
  const instituicao = palavras.length >= 3 && palavras.every((w) => !/^[A-Z]{1,3}$/.test(w));
  const nome = instituicao
    ? palavras.filter((w) => w.length > 3).map((w) => w[0]).join("")
    : palavras[0];
  return nome ? `${nome} ${r.ano}` : "";
}

/** Maiúscula só na inicial. (text-transform:capitalize maiusculiza cada palavra, e "Volume E Esforço" não é português.) */
function comInicialMaiuscula(t: string): string {
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
}

/** Minúscula na inicial, depois de dois-pontos ("Objetivo: subir a carga"); sigla fica como está. */
function comInicialMinuscula(t: string): string {
  if (!t || /^[A-ZÀ-Ý]{2}/.test(t)) return t;
  return t.charAt(0).toLowerCase() + t.slice(1);
}

/** "a", "a e b", "a, b e c": o "e" do último par, que uma lista de três itens pede. */
function eLista(itens: string[]): string {
  if (itens.length <= 1) return itens[0] ?? "";
  return `${itens.slice(0, -1).join(", ")} e ${itens[itens.length - 1]}`;
}

function listaCurta(nomes: string[], max = 3): string {
  if (nomes.length <= max) return nomes.join(", ");
  return `${nomes.slice(0, max).join(", ")} e mais ${nomes.length - max}`;
}

/**
 * O TRILHO responde POR QUE O PLANO É ASSIM, e mais nada.
 *
 * Ele já falou de três coisas ao mesmo tempo: o modelo, a trava do bloco e os parâmetros do
 * bloco, enquanto o painel do bloco, logo à esquerda, falava dos mesmos parâmetros e trazia
 * o botão da mesma trava. Controle de um lado da tela e explicação do outro: quem ligava não
 * lia, e quem lia não sabia onde desligar. O que é do bloco voltou para o painel do bloco.
 */
function TrilhoDoPlano({
  plano,
  modelo,
  alunoObj,
  refIds,
}: {
  plano: PlanoTreino;
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

  const resumo = (
    <GrupoRecolhivel>
    <ul className="space-y-1.5">
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
    </GrupoRecolhivel>
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
      <GrupoRecolhivel>
        <ul className="space-y-1.5">
          {topicos.map((t, i) => (
            // Sem título próprio, o tópico usa a primeira oração como título da linha.
            <ItemRecolhivel key={i} titulo={t.titulo || t.texto.split(/[.:;]/)[0]}>
              {t.texto}
            </ItemRecolhivel>
          ))}
        </ul>
      </GrupoRecolhivel>
      {/* Saiu daqui o item "Este bloco" e o aviso sobre onde a edição vale: o painel do
          bloco em foco diz a mesma coisa logo acima, com mais detalhe, e a edição deixou
          de acontecer nesta tela. */}
    </div>
  );

  // Até três nomes, e o resto vira contagem: a bibliografia inteira já está na aba Ciência.
  const baseCitada = listaCurta(refIds.map(nomeCurtoDaRef).filter(Boolean), 3);

  /*
   * TRILHO CURTO, SEM ROLAGEM PRÓPRIA.
   *
   * Ele já teve seis cartões e passou de mil pixels, o que obrigava a uma rolagem dentro da
   * coluna: uma barra a mais na tela, e conteúdo que só aparece se a pessoa descobrir que
   * aquela coluna rola. A saída não era a barra, era a lista: o equilíbrio da semana e o
   * aviso de concentração falam de UMA semana e foram para o trilho do editor, ao lado da
   * semana que está sendo mexida. O que sobra aqui responde a pergunta desta tela, e cabe.
   */
  return (
    <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
      {/*
        POR QUE ESTE MODELO (protótipo da periodização, cartão navy do trilho).

        A resposta já existia: era o segundo item de uma lista de tópicos dentro de "Por que
        estes números", do mesmo tamanho e do mesmo peso que os outros quatro. Só que ela não
        é um item entre iguais: é a pergunta que o profissional leva para a consulta, e a que
        ele precisa saber responder quando o aluno perguntar por que o treino é assim.

        Por isso ela sobe para o topo do trilho, no mesmo navy do gráfico ao lado: as duas
        peças respondem a mesma coisa, uma em curva e a outra em frase. O navy é fixo nos dois
        temas, como no gráfico e na casca, porque é superfície imersiva e não papel.

        Nada aqui é informação nova: a frase é a direção MEDIDA das semanas de carga deste
        plano, e a base citada é `plano.refIds`, cuja lista completa segue no cartão logo
        abaixo. O que muda é a hierarquia.
      */}
      <section
        className="relative overflow-hidden rounded-card p-[14px] lg:p-4"
        style={{ background: "#0B1628", color: "#F3F1EA" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-14 -top-20 h-52 w-52 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(20,179,186,.35), rgba(20,179,186,0) 65%)" }}
        />
        <div className="relative">
          <p className="text-2xs font-semibold uppercase tracking-[0.12em]" style={{ color: "#7FE3D8" }}>
            Por que {modelo.nome.replace(/^Periodização (?:em )?/i, "").toLowerCase()}
          </p>
          <p className="mt-2 text-[13.5px] leading-[1.55]" style={{ color: "#D6DFEA" }}>
            {direcaoReal.frase} {modelo.resumo}
          </p>
          {baseCitada && (
            <p className="mt-3 text-xs" style={{ color: "#8FA0B5" }}>
              Base: {baseCitada}
            </p>
          )}
        </div>
      </section>

      <Card className="p-4">
        <TresCamadas resumo={resumo} pratica={pratica} refs={refIds} ariaLabel="Por que estes números" />
      </Card>

      {/*
        DE ONDE VEM CADA LIMITE. Vive aqui, colado em "Por que estes números", porque é a
        resposta mais literal a essa pergunta: o teto de carga e a reserva de repetições eram
        aplicados pelo motor e não apareciam em tela nenhuma do produto. O componente some
        sozinho quando o aluno não tem condição nem idade declarada.
      */}
      <DeOndeVemOLimite
        grupoEspecial={alunoObj?.grupoEspecial ?? plano.grupoEspecial}
        condicoesAtencao={alunoObj?.condicoesAtencao}
        idade={alunoObj?.idade}
      />

    </aside>
  );
}

/**
 * O TRILHO DO EDITOR (protótipo: "Volume da sessão" e os avisos, à direita do editor).
 *
 * O equilíbrio da semana e o aviso de concentração moram AQUI, e não na periodização, por um
 * motivo simples: os dois falam de UMA semana, e na periodização a semana de que eles
 * falavam nem estava aberta. Ao lado do editor, cada série acrescentada ou tirada move a
 * barra na hora, que é o que faz deles ferramenta em vez de enfeite.
 */
function TrilhoDoEditor({
  micro,
  meso,
  sessao,
  ctx,
}: {
  micro: Microciclo;
  meso: Mesociclo;
  /** a sessão aberta: o volume do protótipo é da SESSÃO, não da semana */
  sessao?: Sessao;
  ctx: ContextoFaixa;
}) {
  /*
   * VOLUME DA SESSÃO (protótipo: o primeiro cartão do trilho do editor).
   *
   * O trilho respondia só pela SEMANA (equilíbrio por região), e quem está editando uma
   * sessão precisa antes da pergunta menor: quantas séries eu acabei de montar aqui, e isso
   * é muito ou pouco? Sem ela, acrescentar um exercício não tem resposta na tela.
   *
   * A FAIXA DA SESSÃO NÃO É NÚMERO NOVO: é aritmética sobre a faixa de séries que o objetivo
   * já cita ("2 a 3 séries por exercício" com 4 exercícios de força dá 8 a 12 na sessão), e o
   * rodapé do cartão mostra a conta para ninguém precisar confiar no total. Sem faixa legível
   * no texto do objetivo, o cartão mostra só o total, sem inventar um teto.
   */
  const volume = React.useMemo(() => {
    if (!sessao) return null;
    const porRegiao = new Map<string, number>();
    let series = 0;
    let exercicios = 0;
    for (const b of sessao.blocos) {
      if (b.tipo === "aerobio") continue;
      // Protocolo isométrico de condição tem dose fechada e não entra na conta de volume,
      // pela mesma regra do equilíbrio da semana; o sustentado (prancha) entra.
      if (b.tipo === "isometrico" && !b.sustentado) continue;
      const n = b.seriesAlvo ?? Number(/(\d+)/.exec(b.series ?? "")?.[1] ?? 0);
      if (!n) continue;
      exercicios++;
      series += n;
      const ex = b.exercicioSlug ? exercises.find((e) => e.slug === b.exercicioSlug) : undefined;
      const regiao = ex ? (REGIAO[ex.grupoMuscular] ?? "Corpo todo") : "Sem classificação";
      porRegiao.set(regiao, (porRegiao.get(regiao) ?? 0) + n);
    }
    if (!series) return null;
    const porExercicio = intervaloDe(getFaixa(ctx.objetivo).series.valor);
    const faixa =
      porExercicio && Number.isFinite(porExercicio.max)
        ? { min: Math.round(porExercicio.min * exercicios), max: Math.round(porExercicio.max * exercicios) }
        : null;
    return {
      series,
      exercicios,
      faixa,
      textoPorExercicio: getFaixa(ctx.objetivo).series.valor,
      linhas: [...porRegiao.entries()].map(([regiao, n]) => ({ regiao, n })).sort((a, b) => b.n - a.n),
    };
  }, [sessao, ctx.objetivo]);

  // O checklist do dia que a condição deste plano liga, com o tamanho real dele.
  const semaforo = ctx.grupoEspecial ? getSemaforo(ctx.grupoEspecial) : undefined;
  const nomeDaCondicao = ctx.grupoEspecial ? getSpecialGroup(ctx.grupoEspecial)?.nome : undefined;
  // Equilíbrio: séries de força DINÂMICA por região, a partir dos blocos da semana em foco.
  // O isométrico de condição fica fora deste denominador pela mesma regra que tirou o
  // aeróbio: série de 2 minutos sustentados não é série dinâmica, e a dose dele é protocolo
  // clínico fechado, não escolha de distribuição. Ele sai numa linha própria, em sessões.
  const equilibrio = React.useMemo(() => {
    const porRegiao = new Map<string, number>();
    let series = 0;
    let minutosAerobio = 0;
    let sessoesIso = 0;
    let sessoesAssoalho = 0;
    let sessoesEquilibrio = 0;
    for (const s of micro.sessoes) {
      for (const b of s.blocos) {
        // O assoalho pélvico é indicação clínica com dose própria, não distribuição de volume
        // entre regiões: contá-lo como "Core" faria a semana da gestante parecer concentrada
        // em tronco por desenho. Sai numa linha própria, como o isométrico de condição.
        if (b.assoalho) {
          sessoesAssoalho++;
          continue;
        }
        // O equilíbrio por indicação é da mesma natureza: 3 séries curtas em um pé não são
        // volume de perna, e contá-las inflava "Inferiores" (ou "Corpo todo") por desenho.
        if (b.equilibrio) {
          sessoesEquilibrio++;
          continue;
        }
        if (b.tipo === "aerobio") {
          const m = /(\d+)/.exec(b.duracaoAlvoMin != null ? String(b.duracaoAlvoMin) : (b.duracao ?? ""));
          if (m) minutosAerobio += Number(m[1]);
          continue;
        }
        // Prancha e equilíbrio (sustentados) são trabalho da semana e contam pela região, com as
        // séries declaradas; só o protocolo isométrico de CONDIÇÃO (sessão-complemento) fica fora.
        if (b.tipo === "isometrico" && !b.sustentado) {
          if (s.complemento) sessoesIso++;
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
      sessoesAssoalho,
      sessoesEquilibrio,
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

  return (
    <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
      {volume && (
        <Card className="p-4">
          <h3 className="text-2xs font-semibold uppercase tracking-wide text-ink-3">Volume da sessão</h3>
          <div className="mt-1.5 flex flex-wrap items-end gap-x-2 gap-y-1">
            <p className="font-display text-4xl font-bold leading-none tracking-[-0.03em] text-ink">
              <span className="tabular">{volume.series}</span>
              <span className="ml-1.5 font-sans text-sm font-medium tracking-normal text-ink-3">séries</span>
            </p>
            {volume.faixa && (
              <span
                className={cn(
                  "mb-0.5 text-[12.5px] font-bold",
                  volume.series >= volume.faixa.min && volume.series <= volume.faixa.max ? "text-success" : "text-warning",
                )}
              >
                {volume.series >= volume.faixa.min && volume.series <= volume.faixa.max ? "dentro da faixa" : "fora da faixa"}{" "}
                <span className="tabular">
                  {volume.faixa.min} a {volume.faixa.max}
                </span>
              </span>
            )}
          </div>
          {/* A barra mostra a FAIXA como banda e o total como preenchimento: a leitura é a
              posição do total dentro da faixa, e não um percentual de coisa nenhuma. */}
          {volume.faixa && (
            <div className="relative mt-3 h-2.5 overflow-hidden rounded-full bg-surface-mute">
              {(() => {
                const escala = Math.max(volume.faixa.max, volume.series) || 1;
                const pct = (n: number) => `${Math.min(100, (n / escala) * 100)}%`;
                return (
                  <>
                    <span
                      className="absolute inset-y-0 bg-success-tint"
                      style={{ left: pct(volume.faixa.min), width: pct(volume.faixa.max - volume.faixa.min) }}
                      aria-hidden
                    />
                    <span
                      className="absolute inset-y-0 left-0 origin-left rounded-full bg-primary motion-safe:animate-cresce"
                      style={{ width: pct(volume.series) }}
                      aria-hidden
                    />
                  </>
                );
              })()}
            </div>
          )}
          <ul className="mt-3 space-y-2">
            {/* RÓTULO COLADO AO VALOR ("Superiores 6 séries"), regra da casa: o protótipo
                separa os dois pelas bordas da coluna, e o olho precisa atravessar o cartão
                para ligar a região ao número. A barra fica na linha de baixo. */}
            {volume.linhas.map((l) => (
              <li key={l.regiao}>
                <p className="flex items-baseline gap-1.5 text-xs">
                  <span className="text-ink-2">{l.regiao}</span>
                  <b className="tabular font-semibold text-ink">
                    {l.n} {l.n === 1 ? "série" : "séries"}
                  </b>
                </p>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-mute">
                  <div
                    className="h-full origin-left rounded-full bg-primary motion-safe:animate-cresce"
                    style={{ width: `${(l.n / volume.series) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-2xs leading-snug text-ink-3">
            {volume.exercicios} {volume.exercicios === 1 ? "exercício" : "exercícios"} de força nesta sessão
            {volume.faixa
              ? `, e a faixa do objetivo pede ${volume.textoPorExercicio} séries em cada um.`
              : "."}
          </p>
        </Card>
      )}

      {/* O objetivo declarado da semana: é contra ele que se dosa o resto. */}
      {micro.objetivo && (
        <Card className="p-4">
          <h3 className="text-2xs font-semibold uppercase tracking-wide text-ink-3">Objetivo da semana</h3>
          <p className="mt-1.5 text-sm text-ink-2">{micro.objetivo}</p>
          <p className="mt-1.5 text-2xs text-ink-3">Bloco {rotuloMeso(meso)}.</p>
        </Card>
      )}

      {equilibrio.series > 0 && (
        <Card className="p-4">
          <h3 className="text-2xs font-semibold uppercase tracking-wide text-ink-3">Equilíbrio da semana</h3>
          <ul className="mt-2 space-y-2">
            {equilibrio.linhas.map((l) => (
              <li key={l.regiao}>
                <p className="flex items-baseline gap-1.5 text-sm">
                  <span className="text-ink-2">{l.regiao}</span>
                  <b className="tabular font-semibold text-ink">{l.pct}%</b>
                </p>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-mute">
                  <div className="h-full origin-left rounded-full bg-primary motion-safe:animate-cresce" style={{ width: `${l.pct}%` }} />
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
            {equilibrio.sessoesAssoalho > 0 &&
              ` O assoalho pélvico entra por indicação, com dose própria, fora desta conta: ${equilibrio.sessoesAssoalho} ${equilibrio.sessoesAssoalho === 1 ? "sessão" : "sessões"} na semana.`}
            {equilibrio.sessoesEquilibrio > 0 &&
              ` O equilíbrio entra por indicação, com dose própria, fora desta conta: ${equilibrio.sessoesEquilibrio} ${equilibrio.sessoesEquilibrio === 1 ? "sessão" : "sessões"} na semana.`}
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
      {/* "Motivo registrado" do protótipo: a nota que o motor escreveu para esta semana
          (a descarga, por exemplo, explica por que ela é mais leve de propósito). Vivia
          dentro do cartão do bloco, atrás de dois cliques, e some quando não há nota. */}
      {micro.nota && (
        <Card tone="warning" className="p-4">
          <h3 className="text-2xs font-bold uppercase tracking-[0.12em] text-warning">Nota da semana</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{micro.nota}</p>
        </Card>
      )}

      {/*
        SEMÁFORO VINCULADO (protótipo). A condição do plano liga um checklist próprio antes da
        sessão, e quem edita a semana não tinha como saber disso sem sair da tela.

        O texto diz o que o produto FAZ, e não o que o protótipo prometia: o checklist devolve
        a conduta recomendada para cada resposta fora do verde; ele não muda a dose sozinho.
      */}
      {semaforo && nomeDaCondicao && (
        <Card className="p-4">
          <h3 className="text-2xs font-semibold uppercase tracking-wide text-ink-3">Semáforo vinculado</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-2">
            O checklist de <span className="font-semibold text-ink">{nomeDaCondicao}</span> tem{" "}
            {semaforo.itens.length} {semaforo.itens.length === 1 ? "pergunta" : "perguntas"} antes de cada sessão.
            Resposta fora do verde traz a conduta recomendada; quem decide seguir é você.
          </p>
          <Link to="/semaforo" className="mt-2 inline-flex text-xs font-semibold text-primary hover:underline">
            Abrir o semáforo do dia
          </Link>
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
  // Recolhível como a Ciência: título e a primeira linha à vista, a seta abre o resto.
  return (
    <ItemRecolhivel tom={tom} titulo={titulo}>
      {children}
    </ItemRecolhivel>
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
            "inline-flex min-h-[44px] items-center justify-center rounded-full border px-4 py-1.5 text-[13.5px] font-semibold transition-colors",
            valor === o ? "border-ink bg-ink text-surface" : "border-border text-ink-2 hover:bg-surface-soft",
          )}
        >
          {o}
          {sufixo}
        </button>
      ))}
    </div>
  );
}
