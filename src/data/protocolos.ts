import type { GpsObjetivo, GpsPrioridade } from "@/lib/gps/engine";
import type { Nivel } from "./types";

/**
 * Modelos de protocolo prontos para aplicar a um aluno. Cada modelo carrega o
 * RESPALDO (por que é indicado, com referências reais de referencias.ts), a
 * estrutura da semana, os parâmetros a monitorar e o critério de progressão.
 *
 * Famílias progressivas (mesmo `familia`) representam uma jornada por tempo de
 * treino: iniciante → intermediário → avançado, com os meses que caracterizam
 * cada fase. São ponto de partida; o profissional ajusta ao contexto do aluno.
 *
 * Regra de linguagem do produto: nada de travessão em texto visível; linguagem
 * prudente (apoia a decisão do profissional habilitado, não substitui avaliação).
 */

export type ProtocoloCategoria =
  | "Emagrecimento"
  | "Cardiorrespiratório"
  | "Hipertrofia"
  | "Força"
  | "Resistência muscular"
  | "Idoso e autonomia"
  | "Reabilitação e retorno";

export interface ProtocoloItem {
  slug: string;
  /** prescrição do item: séries x reps para força, tempo/zona para aeróbio */
  series: string;
}

export interface Protocolo {
  id: string;
  titulo: string;
  categoria: ProtocoloCategoria;
  /** objetivo do GPS gravado na prescrição ao aplicar */
  objetivo: GpsObjetivo;
  /** só para emagrecimento: prioridade física da fase */
  prioridade?: GpsPrioridade;
  nivelIndicado: Nivel;
  tone: "primary" | "analysis" | "cta" | "success" | "warning";
  /** família progressiva (ex.: "Emagrecimento") para agrupar as fases na UI */
  familia?: string;
  /** rótulo da fase (ex.: "Fase 1 · Iniciante"); ordem controla a sequência */
  fase?: string;
  ordemFase?: number;
  /** tempo de treino que caracteriza a fase (ex.: "0 a 3 meses de treino") */
  tempoTreino?: string;
  /** uma linha: o que é */
  resumo: string;
  /** para quem/quando é indicado */
  indicacao: string;
  /** respaldo científico: por que este arranjo é indicado (1 a 2 frases) */
  base: string;
  /** ids de referencias.ts que sustentam o protocolo */
  refIds: string[];
  frequencia: string;
  estruturaSemanal: string;
  itens: ProtocoloItem[];
  /** ids de monitoringParameters.ts a acompanhar */
  parametros?: string[];
  /** critério para avançar de fase ou progredir a carga */
  progressao?: string;
  cautelas?: string[];
}

export const protocolos: Protocolo[] = [
  /* ============================ EMAGRECIMENTO (3 fases) ============================ */
  {
    id: "emag-1",
    titulo: "Emagrecimento em progressão",
    categoria: "Emagrecimento",
    objetivo: "Emagrecimento",
    prioridade: "Cardio + força (misto)",
    nivelIndicado: "Iniciante",
    tone: "cta",
    familia: "Emagrecimento",
    fase: "Fase 1 · Iniciante",
    ordemFase: 1,
    tempoTreino: "0 a 3 meses de treino",
    resumo: "Base aeróbia contínua confortável somada a força de corpo todo em máquinas guiadas.",
    indicacao: "Início do acompanhamento, pessoa destreinada ou retornando após tempo parada. Foco em adesão, técnica e criar o hábito da sessão.",
    base: "O emagrecimento tem no volume aeróbio o eixo do gasto calórico, com força para preservar massa magra; o começo prioriza intensidade confortável (teste da fala) para garantir adesão e regularidade.",
    refIds: ["donnelly-2009", "oms-2020", "garber-2011", "persinger-2004"],
    frequencia: "3 a 4 sessões por semana",
    estruturaSemanal: "2 sessões de força de corpo todo somadas a 2 sessões aeróbias contínuas em ritmo confortável.",
    itens: [
      { slug: "caminhada-esteira", series: "20 a 30 min em ritmo de conversa" },
      { slug: "bicicleta-ergometrica", series: "15 a 20 min em carga leve" },
      { slug: "leg-press-45", series: "2 x 12 a 15" },
      { slug: "remada-maquina", series: "2 x 12 a 15" },
      { slug: "supino-maquina", series: "2 x 12 a 15" },
    ],
    parametros: ["p-fala", "p-rpe", "p-adesao"],
    progressao: "Completa 4 semanas com boa adesão, esforço confortável e sem dores novas antes de avançar de fase.",
    cautelas: ["Priorizar constância antes de intensidade.", "Ajustar amplitude e cargas ao conforto articular."],
  },
  {
    id: "emag-2",
    titulo: "Emagrecimento em progressão",
    categoria: "Emagrecimento",
    objetivo: "Emagrecimento",
    prioridade: "Cardio + força (misto)",
    nivelIndicado: "Intermediário",
    tone: "cta",
    familia: "Emagrecimento",
    fase: "Fase 2 · Intermediário",
    ordemFase: 2,
    tempoTreino: "3 a 6 meses de treino",
    resumo: "Aumento do volume aeróbio e da força multiarticular, com um bloco intervalado leve.",
    indicacao: "Aluno que já tolera bem a Fase 1, com técnica estável e boa adesão. Momento de elevar o gasto e o estímulo de força.",
    base: "Com base estabelecida, elevar o volume semanal e introduzir intervalos amplia o gasto energético e a aptidão cardiorrespiratória, mantendo a força como preservação de massa magra.",
    refIds: ["donnelly-2009", "garber-2011", "borg-1982"],
    frequencia: "4 a 5 sessões por semana",
    estruturaSemanal: "2 a 3 sessões de força multiarticular somadas a 2 sessões aeróbias, sendo uma contínua mais longa e uma com intervalos leves.",
    itens: [
      { slug: "eliptico", series: "25 a 35 min contínuo, ritmo moderado" },
      { slug: "bicicleta-ergometrica", series: "6 a 8 tiros de 1 min forte / 2 min leve" },
      { slug: "leg-press-45", series: "3 x 12" },
      { slug: "puxada-alta", series: "3 x 12" },
      { slug: "supino-maquina", series: "3 x 12" },
      { slug: "hip-thrust", series: "3 x 12" },
    ],
    parametros: ["p-rpe", "p-fc", "p-adesao", "p-recuperacao"],
    progressao: "Sustenta o volume por 4 a 6 semanas com recuperação adequada antes de progredir para a Fase 3.",
    cautelas: ["Introduzir intervalos de forma gradual.", "Respeitar a recuperação entre sessões intensas."],
  },
  {
    id: "emag-3",
    titulo: "Emagrecimento em progressão",
    categoria: "Emagrecimento",
    objetivo: "Emagrecimento",
    prioridade: "Cardio + força (misto)",
    nivelIndicado: "Avançado",
    tone: "cta",
    familia: "Emagrecimento",
    fase: "Fase 3 · Avançado",
    ordemFase: 3,
    tempoTreino: "6 meses ou mais de treino",
    resumo: "Combinação de treino intervalado e força com progressão de carga, preservando massa magra.",
    indicacao: "Aluno condicionado, com boa técnica e recuperação. Fase de otimizar o gasto e manter a massa magra em déficit.",
    base: "Em praticantes condicionados, alternar estímulos intervalados de maior intensidade com força progressiva mantém o gasto elevado e protege a massa magra ao longo do processo.",
    refIds: ["donnelly-2009", "garber-2011", "foster-2001"],
    frequencia: "5 sessões por semana",
    estruturaSemanal: "3 sessões de força com progressão de carga somadas a 2 sessões aeróbias, sendo uma intervalada de maior intensidade.",
    itens: [
      { slug: "caminhada-esteira", series: "8 a 10 tiros em rampa / recuperação ativa" },
      { slug: "eliptico", series: "30 a 40 min ritmo moderado a forte" },
      { slug: "leg-press-45", series: "4 x 8 a 10" },
      { slug: "levantamento-terra-romeno", series: "3 x 8 a 10" },
      { slug: "puxada-alta", series: "4 x 10" },
      { slug: "desenvolvimento-maquina", series: "3 x 10" },
    ],
    parametros: ["p-rpe", "p-fc", "p-recuperacao", "p-volume"],
    progressao: "Ajustar carga e volume a cada 2 a 3 semanas conforme desempenho, recuperação e evolução das medidas.",
    cautelas: ["Monitorar sinais de fadiga acumulada.", "Manter ingestão proteica adequada para preservar massa magra."],
  },

  /* ============================ CARDIORRESPIRATÓRIO ============================ */
  {
    id: "cardio-1",
    titulo: "Base cardiorrespiratória",
    categoria: "Cardiorrespiratório",
    objetivo: "Emagrecimento",
    prioridade: "Condicionamento cardiorrespiratório",
    nivelIndicado: "Iniciante",
    tone: "analysis",
    familia: "Cardiorrespiratório",
    fase: "Fase 1 · Base contínua",
    ordemFase: 1,
    tempoTreino: "0 a 2 meses de treino",
    resumo: "Construção da base aeróbia por tempo, em intensidade confortável guiada pelo teste da fala.",
    indicacao: "Quem quer ganhar fôlego e condicionamento, com pouca ou nenhuma base aeróbia. Constrói volume antes de intensidade.",
    base: "A recomendação de 150 a 300 min semanais de atividade moderada orienta o volume; começar contínuo e confortável desenvolve a base aeróbia com segurança, usando o teste da fala como guia prático de intensidade.",
    refIds: ["oms-2020", "garber-2011", "persinger-2004"],
    frequencia: "3 a 4 sessões por semana",
    estruturaSemanal: "Sessões aeróbias contínuas, aumentando o tempo antes do ritmo. Alternar equipamentos para poupar articulações.",
    itens: [
      { slug: "caminhada-esteira", series: "20 a 30 min em ritmo de conversa" },
      { slug: "bicicleta-ergometrica", series: "20 min em carga leve a moderada" },
      { slug: "eliptico", series: "15 a 20 min contínuo" },
    ],
    parametros: ["p-fala", "p-fc", "p-rpe"],
    progressao: "Aumentar 5 min por semana até 30 a 40 min contínuos, mantendo o ritmo de conversa, antes de acrescentar intervalos.",
    cautelas: ["Evoluir o tempo antes da intensidade.", "Interromper diante de dor no peito, tontura ou falta de ar desproporcional."],
  },
  {
    id: "cardio-2",
    titulo: "Cardiorrespiratório intervalado",
    categoria: "Cardiorrespiratório",
    objetivo: "Emagrecimento",
    prioridade: "Condicionamento cardiorrespiratório",
    nivelIndicado: "Intermediário",
    tone: "analysis",
    familia: "Cardiorrespiratório",
    fase: "Fase 2 · Intervalado",
    ordemFase: 2,
    tempoTreino: "2 meses ou mais de base aeróbia",
    resumo: "Introdução de intervalos de maior intensidade sobre uma base contínua já consolidada.",
    indicacao: "Aluno com base aeróbia estabelecida que quer melhorar a aptidão cardiorrespiratória e a frequência cardíaca de recuperação.",
    base: "Com base aeróbia consolidada, o treino intervalado é um estímulo eficiente para a aptidão cardiorrespiratória; a resposta e a recuperação da frequência cardíaca guiam a progressão.",
    refIds: ["garber-2011", "foster-2001", "borg-1982"],
    frequencia: "3 a 4 sessões por semana",
    estruturaSemanal: "1 a 2 sessões intervaladas somadas a sessões contínuas de recuperação em ritmo confortável.",
    itens: [
      { slug: "bicicleta-ergometrica", series: "8 tiros de 1 min forte / 2 min leve" },
      { slug: "caminhada-esteira", series: "6 a 8 tiros em rampa / recuperação ativa" },
      { slug: "eliptico", series: "25 a 30 min contínuo de recuperação" },
    ],
    parametros: ["p-fc", "p-rpe", "p-recuperacao"],
    progressao: "Aumentar o número de tiros ou a intensidade a cada 2 semanas conforme a frequência cardíaca de recuperação melhora.",
    cautelas: ["Aplicar intervalos apenas sobre base aeróbia estabelecida.", "Respeitar a recuperação entre sessões intensas."],
  },

  /* ============================ HIPERTROFIA / FORÇA (com respaldo) ============================ */
  {
    id: "hipertrofia-quadriceps",
    titulo: "Hipertrofia de quadríceps",
    categoria: "Hipertrofia",
    objetivo: "Hipertrofia",
    nivelIndicado: "Intermediário",
    tone: "primary",
    resumo: "Ênfase em quadríceps combinando cadeia fechada e aberta em faixa de repetições de hipertrofia.",
    indicacao: "Objetivo estético ou de volume de coxa, em aluno com técnica estável e sem restrição relevante de joelho.",
    base: "A hipertrofia responde a tensão mecânica e volume adequado; alternar leg press (cadeia fechada) e cadeira extensora (cadeia aberta) distribui o estímulo sobre o quadríceps com demandas articulares distintas.",
    refIds: ["schoenfeld-2010", "escamilla-1998", "garber-2011"],
    frequencia: "2 sessões de inferiores por semana",
    estruturaSemanal: "Multiarticular de maior carga seguido de exercícios de ênfase e finalização; 48h entre sessões do mesmo grupo.",
    itens: [
      { slug: "leg-press-45", series: "4 x 10 a 12" },
      { slug: "cadeira-extensora", series: "3 x 12 a 15" },
      { slug: "afundo-passada", series: "3 x 10 por perna" },
    ],
    parametros: ["p-rpe", "p-volume"],
    progressao: "Progredir carga quando completar o topo da faixa de repetições com técnica em 2 sessões seguidas.",
  },
  {
    id: "forca-cadeia-posterior",
    titulo: "Força de cadeia posterior",
    categoria: "Força",
    objetivo: "Força",
    nivelIndicado: "Intermediário",
    tone: "success",
    resumo: "Padrão de quadril dominante para glúteos e isquiotibiais em baixas repetições e maior carga.",
    indicacao: "Ganho de força de cadeia posterior e ênfase glútea, em aluno com boa técnica de dobradiça de quadril.",
    base: "O hip thrust gera alta ativação de glúteo máximo em comparação ao agachamento, e o levantamento terra romeno recruta fortemente os isquiotibiais; juntos cobrem o padrão de quadril em faixa de força.",
    refIds: ["contreras-2015", "garber-2011"],
    frequencia: "2 sessões por semana",
    estruturaSemanal: "Exercício principal de força seguido de acessórios de isquiotibiais; foco em técnica antes de carga.",
    itens: [
      { slug: "levantamento-terra-romeno", series: "4 x 6 a 8" },
      { slug: "hip-thrust", series: "3 x 8 a 10" },
      { slug: "mesa-flexora", series: "3 x 10" },
    ],
    parametros: ["p-rpe", "p-dor"],
    progressao: "Adicionar carga quando as repetições saírem com boa técnica e sem compensações lombares.",
  },
  {
    id: "superiores-poupando-ombro",
    titulo: "Superiores poupando o ombro",
    categoria: "Resistência muscular",
    objetivo: "Resistência muscular",
    nivelIndicado: "Iniciante",
    tone: "warning",
    resumo: "Trabalho de braços e dorsais em amplitude confortável, evitando estresse do ombro sensível.",
    indicacao: "Aluno com desconforto de ombro em empurrar acima da cabeça ou em amplitude final do supino. Mantém estímulo poupando a articulação.",
    base: "Priorizar puxadas e trabalho de braços em amplitude tolerada reduz o estresse no ombro sensível, mantendo estímulo de resistência muscular sem provocar dor.",
    refIds: ["rodriguez-ridao-2020", "garber-2011"],
    frequencia: "2 sessões de superiores por semana",
    estruturaSemanal: "Puxadas e exercícios de braços em amplitude confortável; evitar carga que provoque dor no ombro.",
    itens: [
      { slug: "puxada-alta", series: "3 x 12" },
      { slug: "rosca-direta", series: "3 x 15" },
      { slug: "triceps-polia", series: "3 x 15" },
    ],
    parametros: ["p-dor", "p-rpe"],
    progressao: "Ampliar amplitude e carga apenas enquanto o ombro permanecer sem dor durante e após a sessão.",
    cautelas: ["Interromper qualquer exercício que gere dor no ombro.", "Evitar amplitude final que provoque desconforto."],
  },

  /* ============================ IDOSO E AUTONOMIA ============================ */
  {
    id: "idoso-autonomia",
    titulo: "Força, equilíbrio e autonomia",
    categoria: "Idoso e autonomia",
    objetivo: "Reabilitação/retorno",
    nivelIndicado: "Iniciante",
    tone: "success",
    resumo: "Força de membros inferiores, padrão de levantar e trabalho de tronco para funcionalidade diária.",
    indicacao: "Pessoa idosa ou destreinada com foco em autonomia, marcha e prevenção de quedas. Técnica antes de carga.",
    base: "O treino de força é prioridade em idosos para função e autonomia; padrões como sentar e levantar e o fortalecimento de quadril e tronco sustentam marcha, equilíbrio e independência nas atividades diárias.",
    refIds: ["chodzko-2009", "fragala-2019", "ekstrom-2007"],
    frequencia: "2 a 3 sessões por semana",
    estruturaSemanal: "Força de inferiores e tronco em máquinas ou peso corporal, com progressões pequenas e frequentes.",
    itens: [
      { slug: "sentar-levantar", series: "3 x 8 a 10 (apoio se necessário)" },
      { slug: "leg-press-45", series: "2 x 12 leve a moderado" },
      { slug: "ponte-gluteos", series: "3 x 12" },
      { slug: "panturrilha-em-pe", series: "2 x 15" },
    ],
    parametros: ["p-rpe", "p-dor", "p-adesao"],
    progressao: "Reduzir apoio e aumentar carga em pequenos incrementos conforme segurança e ausência de dor.",
    cautelas: ["Garantir apoio disponível nos exercícios em pé.", "Progredir devagar, priorizando técnica e equilíbrio."],
  },

  /* ============================ REABILITAÇÃO E RETORNO ============================ */
  {
    id: "retorno-joelho",
    titulo: "Retorno pós-lesão de joelho",
    categoria: "Reabilitação e retorno",
    objetivo: "Reabilitação/retorno",
    nivelIndicado: "Iniciante",
    tone: "warning",
    resumo: "Carga controlada de quadríceps e isquiotibiais em amplitude tolerada, respeitando a dor.",
    indicacao: "Aluno liberado por profissional de saúde para carga leve após lesão de joelho. Reintroduz carga sem provocar dor ou edema.",
    base: "No manejo não cirúrgico do joelho, o exercício com carga controlada é central e deve ser modulado pela dor e por sinais inflamatórios; a amplitude parcial no leg press reduz a demanda articular na reintrodução.",
    refIds: ["oarsi-2019", "acr-2019", "escamilla-1998"],
    frequencia: "2 a 3 sessões por semana",
    estruturaSemanal: "Reintrodução em amplitude parcial e carga leve, progredindo conforme resposta articular sem dor crescente.",
    itens: [
      { slug: "leg-press-45", series: "3 x 15 em amplitude parcial" },
      { slug: "cadeira-extensora", series: "3 x 15 leve" },
      { slug: "mesa-flexora", series: "3 x 12" },
    ],
    parametros: ["p-dor", "p-rpe"],
    progressao: "Ampliar amplitude e carga somente sem dor durante e após a sessão e sem edema no dia seguinte.",
    cautelas: ["Seguir a liberação e as orientações do profissional de saúde responsável.", "Interromper diante de dor crescente ou inchaço."],
  },
];

export const PROTOCOLO_CATEGORIAS: ProtocoloCategoria[] = [
  "Emagrecimento",
  "Cardiorrespiratório",
  "Hipertrofia",
  "Força",
  "Resistência muscular",
  "Idoso e autonomia",
  "Reabilitação e retorno",
];

export function getProtocolo(id: string) {
  return protocolos.find((p) => p.id === id);
}
