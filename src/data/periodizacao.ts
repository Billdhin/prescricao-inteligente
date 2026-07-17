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
export interface BlocoSessao {
  id: string;
  /** slug de exercício (src/data/exercises) OU id de modalidade (src/data/modalities) */
  exercicioSlug?: string;
  modalidade?: string;
  /** rótulo livre quando não vem de um exercício catalogado (ex.: "Mobilidade de quadril") */
  nome?: string;
  /** faixas como texto ("3 a 4", "8 a 12", "60 a 75% 1RM ou RPE 7-8", "60 a 90 s") */
  series?: string;
  reps?: string;
  intensidade?: string;
  intervalo?: string;
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

/** Um bloco de semanas com um foco. Vira mesociclo do macrociclo. */
export interface Mesociclo {
  id: string;
  nome: string;
  foco: string;
  semanaInicio: number;
  semanaFim: number;
  capacidades: string[];
  tiposExercicio: string[];
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
    refIds: ["acsm-progressao-2009", "moesgaard-periodizacao-2022"],
    aprenderHref: "/aprender/conteudos/planejamento-e-periodizacao--mesociclo",
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
    refIds: ["acsm-progressao-2009"],
    aprenderHref: "/aprender/conteudos/planejamento-e-periodizacao--linear-ondulatoria",
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
    refIds: ["acsm-progressao-2009"],
    aprenderHref: "/aprender/conteudos/planejamento-e-periodizacao--linear-ondulatoria",
  },
];

export function getModelo(id: ModeloPeriodizacaoId): ModeloPeriodizacao {
  return MODELOS_PERIODIZACAO.find((m) => m.id === id) ?? MODELOS_PERIODIZACAO[0];
}

/* ===================== Faixas de treino por objetivo (ACSM 2009 + Garber 2011) ===================== */

/** Faixas por objetivo, expressas como TEXTO (nunca um número solto inventado). */
export interface FaixaObjetivo {
  objetivo: GpsObjetivo;
  capacidades: string[];
  tiposExercicio: string[];
  series: string;
  reps: string;
  intensidade: string;
  intervalo: string;
  /** frequência semanal sugerida por nível (faixa textual) */
  frequencia: Record<Nivel, string>;
  /** parâmetros de monitoringParameters a acompanhar */
  parametros: string[];
  refIds: string[];
  /** ressalva honesta do que a evidência sustenta ou não */
  ressalva: string;
}

export const FAIXAS_TREINO: Record<GpsObjetivo, FaixaObjetivo> = {
  Hipertrofia: {
    objetivo: "Hipertrofia",
    capacidades: ["Hipertrofia", "Força de base", "Tolerância ao volume"],
    tiposExercicio: ["Multiarticulares primeiro", "Uniarticulares como complemento"],
    series: "3 a 4 por exercício (volume maior tende a favorecer, dentro da tolerância)",
    reps: "6 a 12 (ênfase), tolerando 6 a 20 conforme a série",
    intensidade: "moderada a alta, próxima da falha por 1 a 3 repetições de reserva",
    intervalo: "1 a 2 min",
    frequencia: { Iniciante: "2 a 3x/sem", Intermediário: "3 a 4x/sem", Avançado: "4 a 5x/sem" },
    parametros: ["p-rpe", "p-volume"],
    refIds: ["acsm-progressao-2009", "schoenfeld-2017-volume", "schoenfeld-2010"],
    ressalva:
      "As faixas são referência; o volume ideal varia entre pessoas. Progrida por tolerância e resposta, não por buscar dor.",
  },
  Força: {
    objetivo: "Força",
    capacidades: ["Força máxima", "Coordenação intermuscular"],
    tiposExercicio: ["Multiarticulares principais", "Cargas mais altas com técnica"],
    series: "3 a 5 nas séries principais",
    reps: "iniciante 8 a 12; intermediário e avançado 1 a 6 com ênfase em carga alta",
    intensidade: "alta, com boa técnica e margem de segurança",
    intervalo: "3 a 5 min nas séries principais",
    frequencia: { Iniciante: "2 a 3x/sem", Intermediário: "3 a 4x/sem", Avançado: "4 a 5x/sem" },
    parametros: ["p-rpe", "p-fadiga"],
    refIds: ["acsm-progressao-2009", "moesgaard-periodizacao-2022"],
    ressalva:
      "Cargas altas pedem técnica consolidada e progressão gradual; a autorregulação ajuda a respeitar o dia.",
  },
  "Resistência muscular": {
    objetivo: "Resistência muscular",
    capacidades: ["Resistência muscular localizada", "Controle técnico em fadiga"],
    tiposExercicio: ["Multiarticulares e uniarticulares", "Circuitos quando fizer sentido"],
    series: "2 a 3",
    reps: "acima de 15",
    intensidade: "leve a moderada (cerca de 40 a 60% de 1RM)",
    intervalo: "curto, até cerca de 90 s",
    frequencia: { Iniciante: "2 a 3x/sem", Intermediário: "3x/sem", Avançado: "3 a 4x/sem" },
    parametros: ["p-rpe"],
    refIds: ["acsm-progressao-2009"],
    ressalva: "Cargas leves com muitas repetições; a técnica em fadiga merece atenção.",
  },
  Emagrecimento: {
    objetivo: "Emagrecimento",
    capacidades: ["Condicionamento aeróbio", "Força geral", "Gasto energético sustentável"],
    tiposExercicio: ["Aeróbio contínuo ou intervalado", "Força de corpo todo"],
    series: "2 a 3 na força de corpo todo",
    reps: "10 a 15 na força",
    intensidade: "moderada; no aeróbio, guie pela conversa e percepção de esforço",
    intervalo: "curto a moderado (30 a 90 s) para manter densidade",
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
    series: "2 a 3, conforme tolerância",
    reps: "10 a 15 em amplitude confortável",
    intensidade: "leve a moderada, guiada por dor e função",
    intervalo: "confortável, sem pressa",
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
    series: "2 a 4 de prática, com qualidade acima da carga",
    reps: "5 a 10 com boa execução",
    intensidade: "leve a moderada; a técnica manda, não a carga",
    intervalo: "suficiente para manter a qualidade",
    frequencia: { Iniciante: "2 a 4x/sem", Intermediário: "3 a 4x/sem", Avançado: "3 a 4x/sem" },
    parametros: ["p-rpe"],
    refIds: ["acsm-progressao-2009"],
    ressalva: "Prática frequente com qualidade consolida o padrão; repetir com erro consolida o erro.",
  },
};

export function getFaixa(objetivo: GpsObjetivo): FaixaObjetivo {
  return FAIXAS_TREINO[objetivo];
}
