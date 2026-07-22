/**
 * PERIODIZAÇÃO ("Prescrever treino"): modelo de dados do planejamento longitudinal
 * e a biblioteca de modelos, com base científica citada.
 *
 * Regras do produto que valem aqui:
 * - Nunca inventar número. Séries, repetições, intensidade, intervalo e deload saem de
 *   diretrizes CITADAS (ACSM 2009, Garber 2011, Schoenfeld) como FAIXAS; onde a evidência é
 *   fraca, o texto declara. Cada faixa carrega o `refId` que a sustenta.
 * - Linguagem prudente e NÃO diagnóstica: a ferramenta APOIA a decisão do profissional
 *   habilitado, não prescreve nem reabilita. Sem travessão em texto visível.
 */

import type { GpsObjetivo } from "@/lib/gps/engine";
import type { Nivel } from "@/data/types";

/* ============================ Árvore do plano (persistida) ============================ */

/** Um exercício ou modalidade dentro de uma sessão, com os parâmetros editáveis. */
/**
 * Método de série (técnica de intensidade). São definições consagradas de
 * treinamento; a descrição diz apenas COMO executar, sem inventar número. O
 * profissional escolhe o método por bloco; o aluno vê a instrução no portal.
 */
export type MetodoSerie =
  | "tradicional"
  | "bi-set"
  | "tri-set"
  | "super-set"
  | "drop-set"
  | "rest-pause"
  | "piramide"
  | "myo-reps"
  | "cluster"
  | "pre-exaustao";

export interface MetodoInfo {
  id: MetodoSerie;
  nome: string;
  /** instrução curta de execução (sem número inventado) */
  descricao: string;
}

export const METODOS_SERIE: MetodoInfo[] = [
  { id: "tradicional", nome: "Tradicional", descricao: "Séries com descanso completo entre elas." },
  { id: "bi-set", nome: "Bi-set", descricao: "Dois exercícios em sequência, sem descanso entre eles; descanso só ao fim do par." },
  { id: "tri-set", nome: "Tri-set", descricao: "Três exercícios em sequência, sem descanso entre eles." },
  { id: "super-set", nome: "Super-set", descricao: "Dois exercícios de músculos antagonistas em sequência, sem descanso entre eles." },
  { id: "drop-set", nome: "Drop-set", descricao: "Ao chegar à falha, reduz a carga e continua sem descanso, por um ou mais estágios." },
  { id: "rest-pause", nome: "Rest-pause", descricao: "Leva a série próximo da falha, faz pausas curtas e retoma, acumulando repetições." },
  { id: "piramide", nome: "Pirâmide", descricao: "A carga sobe (ou desce) a cada série, ajustando as repetições na direção oposta." },
  { id: "myo-reps", nome: "Myo-reps", descricao: "Uma série de ativação até perto da falha, seguida de mini-séries com pausas curtas." },
  { id: "cluster", nome: "Cluster", descricao: "Divide a série em blocos curtos com pausas intra-série, mantendo a qualidade das repetições." },
  { id: "pre-exaustao", nome: "Pré-exaustão", descricao: "Um exercício de isolamento antes do composto, para fatigar o músculo-alvo primeiro." },
];

export const getMetodo = (id?: MetodoSerie): MetodoInfo | undefined =>
  id ? METODOS_SERIE.find((m) => m.id === id) : undefined;

export interface BlocoSessao {
  id: string;
  /** técnica de série do bloco (bi-set, drop-set...); ausente = tradicional */
  metodo?: MetodoSerie;
  /** agrupa blocos que se executam juntos (bi-set/super-set/tri-set) */
  grupoMetodo?: string;
  /**
   * Que tipo de trabalho o bloco carrega. Força e aeróbio se prescrevem por variáveis
   * DIFERENTES: força por séries × repetições × carga × intervalo; aeróbio por formato,
   * duração e intensidade (percentual da FCmáx, watts ou pace). Por isso cada tipo usa o
   * seu conjunto de campos abaixo, e não os da musculação para tudo.
   */
  tipo?: "forca" | "aerobio";
  /** slug de exercício (src/data/exercises) OU id de modalidade (src/data/modalities) */
  exercicioSlug?: string;
  modalidade?: string;
  /** rótulo livre quando não vem de um exercício catalogado (ex.: "Mobilidade de quadril") */
  nome?: string;
  // --- Força (tipo "forca"): faixas como texto ("3 a 4", "8 a 12", "60 a 75% 1RM ou RPE 7-8", "60 a 90 s") ---
  series?: string;
  reps?: string;
  intensidade?: string;
  intervalo?: string;
  // --- Aeróbio (tipo "aerobio"): a intensidade acima é reaproveitada (percentual da FCmáx, RPE ou zona) ---
  /** "Contínuo" ou "Intervalado" */
  formato?: string;
  /** tempo total do trabalho ("20 a 40 min") */
  duracao?: string;
  /** recuperação entre tiros no intervalado ("2 min em ritmo leve"); "-" no contínuo */
  recuperacao?: string;
  observacao?: string;
}

export interface Sessao {
  id: string;
  /** rótulo do dia/sessão (ex.: "Sessão A - inferiores", "Cardio contínuo") */
  nome: string;
  foco?: string;
  blocos: BlocoSessao[];
}

export type TipoMicrociclo = "carga" | "deload" | "teste";

/** Uma semana do plano. */
export interface Microciclo {
  id: string;
  semana: number;
  tipo: TipoMicrociclo;
  frequencia: number;
  sessoes: Sessao[];
  nota?: string;
}

export type Tendencia = "sobe" | "estavel" | "reduz" | "varia";

/** Rótulos de exibição das tendências (fonte única; "estável" com acento, nunca o enum cru). */
export const TEND_LABEL: Record<Tendencia, string> = { sobe: "sobe", reduz: "reduz", estavel: "estável", varia: "varia" };

/** Um bloco de semanas com um foco. Vira mesociclo do macrociclo. */
export interface Mesociclo {
  id: string;
  nome: string;
  foco: string;
  semanaInicio: number;
  semanaFim: number;
  capacidades: string[];
  tiposExercicio: string[];
  /** ids de modalidades (src/data/modalities) em foco na fase; alimenta os ícones do gráfico */
  modalidades?: string[];
  tendenciaVolume: Tendencia;
  tendenciaIntensidade: Tendencia;
  tendenciaComplexidade: Tendencia;
  /** semana de recuperação/descarga ao final do bloco, quando houver */
  deload?: boolean;
  /** ponto de reavaliação sugerido ao final do bloco */
  reavaliacao?: boolean;
  criteriosProgressao: string[];
  criteriosRegressao: string[];
  /** ids de monitoringParameters a acompanhar no bloco */
  parametros: string[];
  microciclos: Microciclo[];
}

export interface Macrociclo {
  objetivoGeral: string;
  semanas: number;
  mesociclos: Mesociclo[];
}

export interface PlanoTreino {
  id: string;
  alunoId: string;
  data: number;
  titulo: string;
  objetivo: GpsObjetivo;
  nivel: Nivel;
  semanas: number;
  frequenciaSemanal: number;
  /** disponibilidade descrita pelo profissional (ex.: "seg/qua/sex, 60 min") */
  disponibilidade?: string;
  modeloId: ModeloPeriodizacaoId;
  /** modelo alternativo, quando a evidência sustenta mais de uma estratégia */
  modeloAltId?: ModeloPeriodizacaoId;
  grupoEspecial?: string;
  macrociclo: Macrociclo;
  /** alternativa gerada (opção 2), quando existir */
  alternativa?: Macrociclo;
  /** rastro do raciocínio (por que este modelo, faixas, cuidados) */
  raciocinio: string;
  /** ids de referências (src/data/referencias) que sustentam o plano */
  refIds: string[];
  status: "ativo" | "arquivado";
}

/* ========================= Onde o plano está hoje (derivado) ========================= */

const SEMANA_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Em que semana o plano está, contando desde a data em que ele foi montado.
 *
 * É uma contagem de calendário, não um registro de presença: o sistema não sabe se o
 * aluno treinou. Por isso a tela sempre diz "desde tal data", em vez de afirmar que o
 * aluno cumpriu N semanas.
 */
export function semanaAtual(plano: PlanoTreino, agora = Date.now()): number {
  const passadas = Math.floor((agora - plano.data) / SEMANA_MS);
  return Math.min(plano.semanas, Math.max(1, passadas + 1));
}

/** O mesociclo que cobre a semana de hoje. */
export function mesocicloAtual(plano: PlanoTreino, agora = Date.now()): Mesociclo | undefined {
  const s = semanaAtual(plano, agora);
  return plano.macrociclo.mesociclos.find((m) => s >= m.semanaInicio && s <= m.semanaFim);
}

/**
 * Rótulo de EXIBIÇÃO de um mesociclo (nunca toca o nome persistido).
 *
 * Mesociclo nascido de uma fase da jornada (com `faseJornada`) já traz "Fase N: ..."
 * no nome e a palavra "Fase" é verdadeira: vale como está. Um mesociclo genérico não
 * pode exibir a palavra "Fase" como se fosse fase clínica; onde um plano antigo de
 * grupo gravou o prefixo "Fase N:", ele é limpo só para exibir. O PDF continua
 * imprimindo o nome como está gravado.
 */
export function rotuloMeso(meso: Mesociclo, _indice?: number): string {
  // `faseJornada` é aditivo (nasce na integração do ciclo); acesso tolerante para
  // não depender do campo existir no tipo ainda.
  const temFase = Boolean((meso as { faseJornada?: number }).faseJornada);
  if (temFase) return meso.nome;
  return meso.nome.replace(/^Fase \d+:\s*/, "");
}

/** A próxima reavaliação marcada no plano que ainda não passou. */
export function proximaReavaliacao(
  plano: PlanoTreino,
  agora = Date.now(),
): { semana: number; em: number } | undefined {
  const s = semanaAtual(plano, agora);
  const meso = plano.macrociclo.mesociclos.find((m) => m.reavaliacao && m.semanaFim >= s);
  if (!meso) return undefined;
  return { semana: meso.semanaFim, em: plano.data + meso.semanaFim * SEMANA_MS };
}

/* ============================== Biblioteca de modelos ============================== */

export type ModeloPeriodizacaoId =
  | "linear"
  | "ondulatoria"
  | "blocos"
  | "flexivel"
  | "autorregulada";

export interface ModeloPeriodizacao {
  id: ModeloPeriodizacaoId;
  nome: string;
  resumo: string;
  comoFunciona: string;
  racionalCientifico: string;
  perfisIndicados: string[];
  variaveisControladas: string[];
  pontosFortes: string[];
  limitacoes: string[];
  errosComuns: string[];
  /** ids de referências (src/data/referencias) */
  refIds: string[];
  /** aula do Aprender que aprofunda o modelo */
  aprenderHref?: string;
}

export const MODELOS_PERIODIZACAO: ModeloPeriodizacao[] = [
  {
    id: "linear",
    nome: "Periodização linear",
    resumo: "Progressão gradual de mais volume e menos intensidade para menos volume e mais intensidade ao longo de blocos.",
    comoFunciona:
      "O plano parte de um bloco com mais volume e intensidade menor e caminha, ao longo de semanas a meses, para menos volume e intensidade maior, com uma descarga ao final de cada bloco. A ênfase muda aos poucos, de forma previsível.",
    racionalCientifico:
      "Segue a lógica de acumular capacidade primeiro e intensificar depois. Meta-análises mostram que treino periodizado supera o não periodizado para força; entre os modelos, as diferenças costumam ser pequenas quando o volume é equiparado.",
    perfisIndicados: [
      "Iniciantes, pela simplicidade e clareza",
      "Objetivos com um pico definido no tempo",
      "Quem prefere uma estrutura fácil de comunicar e acompanhar",
    ],
    variaveisControladas: ["Volume ao longo dos blocos", "Intensidade ao longo dos blocos", "Descarga entre blocos"],
    pontosFortes: [
      "Estrutura simples e previsível",
      "Fácil de comunicar ao aluno e de acompanhar",
      "Boa porta de entrada para quem está começando",
    ],
    limitacoes: [
      "Menos variação dentro da semana pode subestimular pessoas já treinadas",
      "Trabalha um objetivo principal por vez",
    ],
    errosComuns: [
      "Seguir o modelo à risca, ignorando a resposta e a rotina real do aluno",
      "Esquecer a semana de descarga ao final dos blocos",
    ],
    refIds: ["acsm-progressao-2009", "moesgaard-periodizacao-2022"],
    aprenderHref: "/aprender/conteudos/planejamento-e-periodizacao--linear-ondulatoria",
  },
  {
    id: "ondulatoria",
    nome: "Periodização ondulatória",
    resumo: "Varia volume e intensidade com frequência, muitas vezes dentro da mesma semana, alternando ênfases.",
    comoFunciona:
      "Em vez de mudar aos poucos, o plano alterna sessões com ênfases diferentes (por exemplo, um dia mais pesado, outro mais moderado, outro mais controlado), variando volume e intensidade ao longo da semana ou entre semanas.",
    racionalCientifico:
      "A variação frequente permite estimular força e hipertrofia em paralelo. Em pessoas já treinadas, a ondulatória tende a superar a linear para força máxima; em iniciantes essa vantagem não aparece, e para hipertrofia, com volume equiparado, os modelos se equivalem.",
    perfisIndicados: [
      "Intermediários e avançados",
      "Quem busca força e hipertrofia em paralelo",
      "Rotinas com poucos dias na semana, para aproveitar cada sessão",
    ],
    variaveisControladas: ["Ênfase por sessão", "Volume e intensidade dentro da semana", "Distribuição das qualidades"],
    pontosFortes: [
      "Estimula força e hipertrofia ao mesmo tempo",
      "Reduz a monotonia e sustenta a adesão",
      "Aproveita bem semanas com poucos dias",
    ],
    limitacoes: [
      "Pede um pouco mais de organização e entendimento do aluno",
      "A vantagem sobre a linear não aparece em iniciantes",
    ],
    errosComuns: [
      "Variar sem uma lógica clara de ênfases",
      "Não equiparar o volume total ao comparar com outro modelo",
    ],
    refIds: ["moesgaard-periodizacao-2022", "acsm-progressao-2009"],
    aprenderHref: "/aprender/conteudos/planejamento-e-periodizacao--linear-ondulatoria",
  },
  {
    id: "blocos",
    nome: "Periodização em blocos",
    resumo: "Blocos sequenciais com foco concentrado em uma qualidade por vez (acúmulo, transformação, realização).",
    comoFunciona:
      "O plano concentra o estímulo em uma qualidade por bloco: primeiro acúmulo de capacidade e volume, depois transformação em força ou potência, depois realização e pico, com manutenção mínima das demais qualidades entre os blocos.",
    racionalCientifico:
      "Concentrar a carga em poucas qualidades por vez busca um estímulo mais potente e uma gestão de fadiga entre blocos. É consagrado no esporte de rendimento; a evidência comparativa direta com outros modelos ainda é limitada e vem sobretudo de atletas.",
    perfisIndicados: [
      "Avançados com boa base",
      "Atletas com calendário de competição",
      "Quem precisa de um pico em um momento definido",
    ],
    variaveisControladas: ["Qualidade enfatizada por bloco", "Concentração de carga", "Fadiga entre blocos"],
    pontosFortes: [
      "Concentra o estímulo em uma qualidade por vez",
      "Ajuda a organizar picos de desempenho",
      "Gestão clara da fadiga entre blocos",
    ],
    limitacoes: [
      "Evidência sobretudo em atletas; comparações diretas ainda limitadas",
      "Mais complexo de montar e comunicar",
      "Risco de destreinar a qualidade que não está em foco",
    ],
    errosComuns: [
      "Blocos longos demais, que deixam cair as outras qualidades",
      "Ignorar a manutenção mínima do que não está sendo enfatizado",
    ],
    refIds: ["issurin-blocos-2016", "issurin-periodizacao-2010", "moesgaard-periodizacao-2022"],
    aprenderHref: "/aprender/conteudos/planejamento-e-periodizacao--blocos",
  },
  {
    id: "flexivel",
    nome: "Periodização flexível",
    resumo: "A ênfase de cada sessão é escolhida conforme a disponibilidade e a vida real do aluno, dentro do plano.",
    comoFunciona:
      "O plano define as ênfases possíveis da semana, mas a ordem e a escolha da sessão do dia se ajustam ao que é viável (dias disponíveis, sono, agenda). Quando falta um dia, o profissional escolhe a ênfase que mais protege o resultado.",
    racionalCientifico:
      "Prioriza a adesão e a realidade do aluno, que são determinantes do resultado no longo prazo. É uma variação organizada da ondulatória, com a ordem ajustável; a evidência específica está em crescimento.",
    perfisIndicados: [
      "Rotinas imprevisíveis, com dias que variam",
      "Alunos da população geral, fora do alto rendimento",
      "Quem falha treinos com frequência por agenda",
    ],
    variaveisControladas: ["Ênfase escolhida por sessão", "Ordem das sessões", "Ajuste à disponibilidade real"],
    pontosFortes: [
      "Protege o resultado quando faltam dias",
      "Favorece a adesão e o realismo do plano",
      "Mantém estímulo mesmo com agenda instável",
    ],
    limitacoes: [
      "Exige critério do profissional para a escolha do dia",
      "Menos previsível de acompanhar",
    ],
    errosComuns: [
      "Virar 'treinar por impulso' e perder a estrutura",
      "Não garantir o estímulo mínimo de cada qualidade na semana",
    ],
    refIds: ["mcnamara-flexivel-2010", "acsm-progressao-2009"],
    aprenderHref: "/aprender/conteudos/planejamento-e-periodizacao--flexivel",
  },
  {
    id: "autorregulada",
    nome: "Periodização autorregulada",
    resumo: "A carga do dia se ajusta à prontidão do aluno, usando percepção de esforço e repetições de reserva.",
    comoFunciona:
      "As faixas de carga e proximidade da falha são planejadas, mas a carga de cada série é ajustada no dia pela resposta do aluno (percepção de esforço, repetições de reserva, velocidade), respeitando um teto de esforço definido.",
    racionalCientifico:
      "Ajustar a carga ao estado diário individualiza o estímulo e ajuda a manter a proximidade da falha desejada sem exigir sempre a carga máxima. A percepção de esforço e as repetições de reserva são ferramentas úteis de controle de carga; a evidência de superioridade é crescente e ainda não fechada.",
    perfisIndicados: [
      "Quem já entende e sabe usar percepção de esforço ou repetições de reserva",
      "Intermediários e avançados",
      "Fases com fadiga e sono variáveis",
    ],
    variaveisControladas: ["Carga ajustada por percepção de esforço ou repetições de reserva", "Proximidade da falha", "Fadiga do dia"],
    pontosFortes: [
      "Individualiza a carga ao estado diário",
      "Ajuda a gerir fadiga sem depender de carga fixa",
      "Ensina o aluno a ler o próprio esforço",
    ],
    limitacoes: [
      "Exige aprender e calibrar a escala de esforço",
      "Menos determinístico e previsível",
    ],
    errosComuns: [
      "Usar percepção de esforço sem calibrar com o aluno",
      "Confundir autorregulação com treinar sempre até a falha",
    ],
    refIds: ["greig-autorregulacao-2020", "zourdos-rir-2016", "acsm-progressao-2009"],
    aprenderHref: "/aprender/conteudos/planejamento-e-periodizacao--autorregulada",
  },
];

export function getModelo(id: ModeloPeriodizacaoId): ModeloPeriodizacao {
  return MODELOS_PERIODIZACAO.find((m) => m.id === id) ?? MODELOS_PERIODIZACAO[0];
}

/* ===================== Faixas de treino por objetivo (ACSM 2009 + Garber 2011) ===================== */

/**
 * Uma variável da diretriz (séries, repetições, intensidade, intervalo).
 *
 * `valor` é curto porque ele nasce dentro do campo editável do plano: o profissional
 * precisa enxergar "3 a 4" no campo, não um parágrafo. O que a diretriz diz além do
 * número vive em `nota`, que aparece ao lado como referência e não vira prescrição.
 */
export interface FaixaVar {
  /** faixa curta e editável, nunca um número solto (ex.: "3 a 4") */
  valor: string;
  /** quando a diretriz separa por nível (ex.: repetições na Força) */
  porNivel?: Record<Nivel, string>;
  /** complemento da diretriz que não cabe no campo */
  nota?: string;
}

/** Variação de repetições/intensidade entre as sessões da semana (ondulatória). */
export interface EnfaseSessao {
  rotulo: string;
  reps: string;
  intensidade: string;
}

/** Faixas por objetivo, expressas como TEXTO (nunca um número solto inventado). */
export interface FaixaObjetivo {
  objetivo: GpsObjetivo;
  capacidades: string[];
  tiposExercicio: string[];
  series: FaixaVar;
  reps: FaixaVar;
  intensidade: FaixaVar;
  intervalo: FaixaVar;
  /** frequência semanal sugerida por nível (faixa textual) */
  frequencia: Record<Nivel, string>;
  /**
   * Ênfases da semana ondulatória, dentro da faixa do PRÓPRIO objetivo. Só existem onde
   * a variação diária faz sentido (força e hipertrofia em quem já treina). Sem isto, um
   * plano de emagrecimento herdaria repetições de força, que não é o que a diretriz diz.
   */
  enfases?: EnfaseSessao[];
  /** parâmetros de monitoringParameters a acompanhar */
  parametros: string[];
  refIds: string[];
  /** ressalva honesta do que a evidência sustenta ou não */
  ressalva: string;
}

/** O valor que vale para este nível (a diretriz às vezes separa iniciante do resto). */
export function valorFaixa(v: FaixaVar, nivel: Nivel): string {
  return v.porNivel?.[nivel] ?? v.valor;
}

export const FAIXAS_TREINO: Record<GpsObjetivo, FaixaObjetivo> = {
  Hipertrofia: {
    objetivo: "Hipertrofia",
    capacidades: ["Hipertrofia", "Força de base", "Tolerância ao volume"],
    tiposExercicio: ["Multiarticulares primeiro", "Uniarticulares como complemento"],
    series: { valor: "3 a 4", nota: "por exercício; volume maior tende a favorecer, dentro da tolerância" },
    reps: { valor: "6 a 12", nota: "a faixa útil vai de 6 a 20 quando o esforço é parecido" },
    intensidade: { valor: "moderada a alta", nota: "próxima da falha, por 1 a 3 repetições de reserva" },
    intervalo: { valor: "1 a 2 min" },
    frequencia: { Iniciante: "2 a 3x/sem", Intermediário: "3 a 4x/sem", Avançado: "4 a 5x/sem" },
    enfases: [
      { rotulo: "pesado", reps: "6 a 8", intensidade: "alta, 1 a 2 repetições de reserva" },
      { rotulo: "moderado", reps: "8 a 12", intensidade: "moderada a alta, 1 a 3 repetições de reserva" },
      { rotulo: "controlado", reps: "12 a 15", intensidade: "moderada, com controle" },
    ],
    parametros: ["p-rpe", "p-volume"],
    refIds: ["acsm-progressao-2009", "schoenfeld-2017-volume", "schoenfeld-2010"],
    ressalva:
      "As faixas são referência; o volume ideal varia entre pessoas. Progrida por tolerância e resposta, não por buscar dor.",
  },
  Força: {
    objetivo: "Força",
    capacidades: ["Força máxima", "Coordenação intermuscular"],
    tiposExercicio: ["Multiarticulares principais", "Cargas mais altas com técnica"],
    series: { valor: "3 a 5", nota: "nas séries principais" },
    reps: {
      valor: "1 a 6",
      porNivel: { Iniciante: "8 a 12", Intermediário: "1 a 6", Avançado: "1 a 6" },
      nota: "quem está começando fica em 8 a 12; carga alta vem depois da técnica consolidada",
    },
    intensidade: { valor: "alta", nota: "com boa técnica e margem de segurança" },
    intervalo: { valor: "3 a 5 min", nota: "nas séries principais" },
    frequencia: { Iniciante: "2 a 3x/sem", Intermediário: "3 a 4x/sem", Avançado: "4 a 5x/sem" },
    enfases: [
      { rotulo: "pesado", reps: "3 a 5", intensidade: "alta, com técnica e margem" },
      { rotulo: "moderado", reps: "5 a 8", intensidade: "moderada a alta" },
      { rotulo: "controlado", reps: "8 a 12", intensidade: "moderada, foco na execução" },
    ],
    parametros: ["p-rpe", "p-fadiga"],
    refIds: ["acsm-progressao-2009", "moesgaard-periodizacao-2022"],
    ressalva:
      "Cargas altas pedem técnica consolidada e progressão gradual; a autorregulação ajuda a respeitar o dia.",
  },
  "Resistência muscular": {
    objetivo: "Resistência muscular",
    capacidades: ["Resistência muscular localizada", "Controle técnico em fadiga"],
    tiposExercicio: ["Multiarticulares e uniarticulares", "Circuitos quando fizer sentido"],
    series: { valor: "2 a 3" },
    reps: { valor: "acima de 15" },
    intensidade: { valor: "leve a moderada", nota: "cerca de 40 a 60% de 1RM" },
    intervalo: { valor: "até 90 s", nota: "intervalo curto sustenta a densidade da sessão" },
    frequencia: { Iniciante: "2 a 3x/sem", Intermediário: "3x/sem", Avançado: "3 a 4x/sem" },
    parametros: ["p-rpe"],
    refIds: ["acsm-progressao-2009"],
    ressalva: "Cargas leves com muitas repetições; a técnica em fadiga merece atenção.",
  },
  Emagrecimento: {
    objetivo: "Emagrecimento",
    capacidades: ["Condicionamento aeróbio", "Força geral", "Gasto energético sustentável"],
    tiposExercicio: ["Aeróbio contínuo ou intervalado", "Força de corpo todo"],
    series: { valor: "2 a 3", nota: "na força de corpo todo" },
    reps: { valor: "10 a 15", nota: "na força; o aeróbio é contado em minutos, não em repetições" },
    intensidade: { valor: "moderada", nota: "no aeróbio, guie pela conversa e pela percepção de esforço" },
    intervalo: { valor: "30 a 90 s", nota: "curto a moderado, para manter a densidade" },
    frequencia: { Iniciante: "3x/sem", Intermediário: "3 a 5x/sem", Avançado: "4 a 5x/sem" },
    parametros: ["p-fc", "p-rpe", "p-adesao"],
    refIds: ["garber-2011", "oms-2020", "acsm-progressao-2009"],
    ressalva:
      "A meta semanal de atividade (150 a 300 min moderada) e a adesão pesam mais que qualquer detalhe da série. Emagrecimento depende sobretudo do contexto de energia, que é conduta multiprofissional.",
  },
  "Reabilitação/retorno": {
    objetivo: "Reabilitação/retorno",
    capacidades: ["Tolerância à carga", "Amplitude confortável", "Controle e confiança"],
    tiposExercicio: ["Movimentos controlados e progressivos", "Baixo impacto no início"],
    series: { valor: "2 a 3", nota: "conforme tolerância" },
    reps: { valor: "10 a 15", nota: "em amplitude confortável" },
    intensidade: { valor: "leve a moderada", nota: "guiada por dor e função" },
    intervalo: { valor: "confortável", nota: "sem pressa entre as séries" },
    frequencia: { Iniciante: "2 a 3x/sem", Intermediário: "3x/sem", Avançado: "3 a 4x/sem" },
    parametros: ["p-rpe"],
    refIds: ["acsm-progressao-2009", "acsm-getp11"],
    ressalva:
      "Retorno após lesão ou condição é conduta compartilhada com o profissional de saúde. A ferramenta apoia a progressão, não substitui liberação nem reabilitação.",
  },
  "Aprendizado técnico": {
    objetivo: "Aprendizado técnico",
    capacidades: ["Qualidade de movimento", "Coordenação", "Consistência técnica"],
    tiposExercicio: ["Padrões fundamentais", "Carga leve com foco na execução"],
    series: { valor: "2 a 4", nota: "de prática, com qualidade acima da carga" },
    reps: { valor: "5 a 10", nota: "com boa execução" },
    intensidade: { valor: "leve a moderada", nota: "a técnica manda, não a carga" },
    intervalo: { valor: "suficiente para manter a qualidade" },
    frequencia: { Iniciante: "2 a 4x/sem", Intermediário: "3 a 4x/sem", Avançado: "3 a 4x/sem" },
    parametros: ["p-rpe"],
    refIds: ["acsm-progressao-2009"],
    ressalva: "Prática frequente com qualidade consolida o padrão; repetir com erro consolida o erro.",
  },
};

export function getFaixa(objetivo: GpsObjetivo): FaixaObjetivo {
  return FAIXAS_TREINO[objetivo];
}
