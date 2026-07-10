import type { GpsObjetivo, GpsPrioridade } from "@/lib/gps/engine";
import type { Nivel } from "./types";

/**
 * Modelos de protocolo prontos para aplicar a um aluno. Cada modelo carrega o
 * RESPALDO (por que é indicado, com referências reais de referencias.ts), o
 * PÚBLICO-ALVO, a estrutura da semana, os parâmetros a monitorar e o critério
 * de progressão.
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
  /** público-alvo em uma linha (para quem este protocolo é indicado) */
  publico: string;
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
    publico: "Pessoa destreinada ou retornando, com objetivo de emagrecer, iniciando o acompanhamento.",
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
    publico: "Aluno com base já estabelecida na Fase 1, tolerando bem volume e técnica.",
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
    publico: "Aluno condicionado, com boa técnica e recuperação, em processo de emagrecimento.",
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
    publico: "Quem quer ganhar fôlego e condicionamento, com pouca ou nenhuma base aeróbia.",
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
    publico: "Aluno com base aeróbia estabelecida que quer melhorar a aptidão cardiorrespiratória.",
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

  /* ================================ HIPERTROFIA (por região) ================================ */
  {
    id: "hipertrofia-quadriceps",
    titulo: "Hipertrofia de quadríceps",
    categoria: "Hipertrofia",
    objetivo: "Hipertrofia",
    nivelIndicado: "Intermediário",
    publico: "Aluno com técnica estável e sem restrição relevante de joelho, buscando volume de coxa.",
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
    id: "hipertrofia-peitoral",
    titulo: "Hipertrofia de peitoral",
    categoria: "Hipertrofia",
    objetivo: "Hipertrofia",
    nivelIndicado: "Intermediário",
    publico: "Aluno sem desconforto de ombro, buscando volume de peitoral no padrão de empurrar.",
    tone: "primary",
    resumo: "Empurrar horizontal com barra e halteres em faixa de hipertrofia, cobrindo peitoral e sinergistas.",
    indicacao: "Objetivo de volume de peitoral, em aluno com controle escapular e sem dor de ombro na amplitude de trabalho.",
    base: "A ativação do peitoral maior varia com a inclinação do banco; alternar supino reto e variações permite distribuir o estímulo sobre as porções do peitoral com tensão mecânica adequada.",
    refIds: ["rodriguez-ridao-2020", "schoenfeld-2010", "garber-2011"],
    frequencia: "2 sessões de superiores por semana",
    estruturaSemanal: "Empurrar de maior carga seguido de variação com halteres e finalização; controle escapular como base.",
    itens: [
      { slug: "supino-reto-barra", series: "4 x 8 a 12" },
      { slug: "supino-halteres", series: "3 x 10 a 12" },
      { slug: "mergulho-no-banco", series: "3 x 10 a 12" },
    ],
    parametros: ["p-rpe", "p-volume"],
    progressao: "Progredir carga mantendo controle escapular e amplitude sem dor no ombro.",
    cautelas: ["Manter as escápulas estáveis (encaixadas).", "Evitar amplitude final que gere desconforto no ombro."],
  },
  {
    id: "hipertrofia-dorsais",
    titulo: "Hipertrofia de dorsais (costas)",
    categoria: "Hipertrofia",
    objetivo: "Hipertrofia",
    nivelIndicado: "Intermediário",
    publico: "Aluno buscando volume e largura de costas no padrão de puxar.",
    tone: "primary",
    resumo: "Puxadas vertical e horizontal em faixa de hipertrofia, cobrindo latíssimo e sinergistas.",
    indicacao: "Objetivo de volume de dorsais, em aluno com boa técnica de puxada e controle de tronco.",
    base: "A pegada e a direção da puxada modulam o recrutamento de latíssimo e bíceps; combinar puxada vertical e remada horizontal cobre a região das costas com estímulo de hipertrofia.",
    refIds: ["andersen-2014", "boeckh-behrens-2000", "schoenfeld-2010", "garber-2011"],
    frequencia: "2 sessões de superiores por semana",
    estruturaSemanal: "Puxada vertical seguida de remada horizontal e variação; foco em amplitude e conexão.",
    itens: [
      { slug: "puxada-alta", series: "4 x 10 a 12" },
      { slug: "remada-baixa", series: "3 x 10 a 12" },
      { slug: "remada-curvada-halteres", series: "3 x 10" },
    ],
    parametros: ["p-rpe", "p-volume"],
    progressao: "Progredir carga quando as repetições saírem com amplitude completa e sem compensar com o tronco.",
  },
  {
    id: "hipertrofia-ombros",
    titulo: "Hipertrofia de ombros",
    categoria: "Hipertrofia",
    objetivo: "Hipertrofia",
    nivelIndicado: "Intermediário",
    publico: "Aluno sem dor de ombro, buscando volume de deltoides no empurrar acima da cabeça.",
    tone: "primary",
    resumo: "Empurrar acima da cabeça e elevações laterais para cobrir as porções do deltoide.",
    indicacao: "Objetivo de volume de ombros, em aluno com boa mobilidade e sem desconforto no empurrar acima da cabeça.",
    base: "O deltoide tem porções com funções distintas; aplicando os princípios gerais de hipertrofia ao ombro, combinar um padrão de empurrar acima da cabeça (que envolve mais as porções anterior e média) com a elevação lateral (que enfatiza a porção média) tende a distribuir o volume sobre o deltoide.",
    refIds: ["schoenfeld-2010", "schoenfeld-2017-volume"],
    frequencia: "2 sessões de superiores por semana",
    estruturaSemanal: "Desenvolvimento de maior carga seguido de elevações e variação em máquina.",
    itens: [
      { slug: "desenvolvimento-ombros", series: "4 x 8 a 12" },
      { slug: "elevacao-lateral-halteres", series: "3 x 12 a 15" },
      { slug: "desenvolvimento-maquina", series: "3 x 10" },
    ],
    parametros: ["p-rpe", "p-volume"],
    progressao: "Progredir carga mantendo controle e sem elevar demais os ombros (trapézio dominando).",
    cautelas: ["Respeitar a amplitude tolerada acima da cabeça."],
  },
  {
    id: "hipertrofia-bracos",
    titulo: "Hipertrofia de braços",
    categoria: "Hipertrofia",
    objetivo: "Hipertrofia",
    nivelIndicado: "Intermediário",
    publico: "Aluno buscando volume de bíceps e tríceps com trabalho localizado.",
    tone: "primary",
    resumo: "Trabalho direto de bíceps e tríceps em faixa de hipertrofia, com controle da execução.",
    indicacao: "Ênfase em braços, complementando o trabalho de empurrar e puxar. Cargas que permitam técnica.",
    base: "Bíceps e tríceps respondem a volume localizado com tensão adequada; alternar flexão de cotovelo e extensões cobre os dois grupos com estímulo de hipertrofia.",
    refIds: ["schoenfeld-2010", "schoenfeld-2017-volume", "garber-2011"],
    frequencia: "2 sessões por semana (pode acoplar a superiores)",
    estruturaSemanal: "Alternar bíceps e tríceps; controlar a fase excêntrica para aumentar o tempo sob tensão.",
    itens: [
      { slug: "rosca-direta", series: "3 x 10 a 12" },
      { slug: "triceps-polia", series: "3 x 10 a 12" },
      { slug: "triceps-frances-halter", series: "3 x 10" },
    ],
    parametros: ["p-rpe", "p-volume"],
    progressao: "Progredir carga quando a execução permanecer controlada em toda a série.",
  },
  {
    id: "hipertrofia-posterior-gluteos",
    titulo: "Hipertrofia de posteriores e glúteos",
    categoria: "Hipertrofia",
    objetivo: "Hipertrofia",
    nivelIndicado: "Intermediário",
    publico: "Aluno com boa técnica de dobradiça de quadril, buscando volume de glúteos e isquiotibiais.",
    tone: "primary",
    resumo: "Padrão de quadril dominante para glúteos e isquiotibiais em faixa de hipertrofia.",
    indicacao: "Ênfase em cadeia posterior e glúteos, em aluno com dobradiça de quadril estável.",
    base: "O hip thrust gera alta ativação de glúteo máximo e o levantamento terra romeno recruta fortemente os isquiotibiais; juntos cobrem a cadeia posterior com estímulo de hipertrofia.",
    refIds: ["contreras-2015", "boeckh-behrens-2000", "schoenfeld-2010"],
    frequencia: "2 sessões de inferiores por semana",
    estruturaSemanal: "Dobradiça de quadril e ênfase glútea seguidas de isquiotibiais; técnica antes de carga.",
    itens: [
      { slug: "levantamento-terra-romeno", series: "4 x 8 a 10" },
      { slug: "hip-thrust", series: "3 x 10 a 12" },
      { slug: "mesa-flexora", series: "3 x 12" },
    ],
    parametros: ["p-rpe", "p-volume", "p-dor"],
    progressao: "Progredir carga sem compensações lombares e sem dor.",
    cautelas: ["Manter a coluna neutra na dobradiça de quadril."],
  },
  {
    id: "hipertrofia-panturrilha",
    titulo: "Hipertrofia de panturrilha",
    categoria: "Hipertrofia",
    objetivo: "Hipertrofia",
    nivelIndicado: "Iniciante",
    publico: "Aluno buscando volume de panturrilha, que costuma responder a frequência e amplitude.",
    tone: "primary",
    resumo: "Trabalho de panturrilha em amplitude completa, com boa frequência semanal.",
    indicacao: "Ênfase em panturrilha, região que costuma tolerar e responder a maior frequência e amplitude.",
    base: "Aplicando os princípios gerais de hipertrofia à panturrilha: volume adequado e amplitude completa tendem a favorecer o estímulo; controlar a fase de alongamento e a pausa no topo ajuda a manter o trabalho em toda a amplitude.",
    refIds: ["schoenfeld-2010", "schoenfeld-grgic-adm-2020", "schoenfeld-2017-volume"],
    frequencia: "2 a 3 sessões por semana",
    estruturaSemanal: "Séries em amplitude completa, variando pé neutro; controle da descida.",
    itens: [
      { slug: "panturrilha-em-pe", series: "4 x 12 a 15 em amplitude completa" },
    ],
    parametros: ["p-rpe", "p-volume"],
    progressao: "Aumentar carga ou repetições mantendo a amplitude completa e a pausa no topo.",
  },

  /* ================================ FORÇA (por padrão) ================================ */
  {
    id: "forca-agachamento",
    titulo: "Força de agachamento",
    categoria: "Força",
    objetivo: "Força",
    nivelIndicado: "Intermediário",
    publico: "Aluno com técnica de agachamento estável, buscando força de membros inferiores.",
    tone: "success",
    resumo: "Padrão de agachar em baixas repetições e maior carga, com acessório unilateral.",
    indicacao: "Ganho de força de membros inferiores em aluno com boa técnica de agachamento e sem restrição relevante.",
    base: "O agachamento envolve quadril, joelho e tronco de forma coordenada; treinar em faixa de força (baixas repetições, maior carga) desenvolve a força do padrão com boa transferência.",
    refIds: ["gullett-2009", "escamilla-2001", "garber-2011"],
    frequencia: "2 sessões de inferiores por semana",
    estruturaSemanal: "Agachamento principal em baixas repetições seguido de acessório unilateral; foco em técnica.",
    itens: [
      { slug: "agachamento-livre", series: "5 x 5" },
      { slug: "leg-press-45", series: "3 x 8" },
      { slug: "afundo-passada", series: "3 x 8 por perna" },
    ],
    parametros: ["p-rpe", "p-dor"],
    progressao: "Adicionar carga quando completar as séries com boa técnica e velocidade mantida.",
    cautelas: ["Priorizar técnica antes de carga.", "Interromper diante de dor articular."],
  },
  {
    id: "forca-supino",
    titulo: "Força de supino (empurrar)",
    categoria: "Força",
    objetivo: "Força",
    nivelIndicado: "Intermediário",
    publico: "Aluno com controle escapular e sem dor de ombro, buscando força de empurrar.",
    tone: "success",
    resumo: "Padrão de empurrar horizontal em baixas repetições e maior carga.",
    indicacao: "Ganho de força de empurrar horizontal, em aluno com boa técnica de supino e ombro sem dor.",
    base: "A força de empurrar depende de peitoral, deltoide e tríceps com boa estabilidade escapular; treinar em faixa de força desenvolve o padrão com transferência para outros empurrares.",
    refIds: ["rodriguez-ridao-2020", "garber-2011"],
    frequencia: "2 sessões de superiores por semana",
    estruturaSemanal: "Supino principal em baixas repetições seguido de acessórios de tríceps.",
    itens: [
      { slug: "supino-reto-barra", series: "5 x 5" },
      { slug: "supino-halteres", series: "3 x 8" },
      { slug: "triceps-polia", series: "3 x 10" },
    ],
    parametros: ["p-rpe", "p-dor"],
    progressao: "Adicionar carga mantendo a estabilidade escapular e a amplitude sem dor.",
    cautelas: ["Manter as escápulas estáveis.", "Usar segurança/observador em cargas altas."],
  },
  {
    id: "forca-cadeia-posterior",
    titulo: "Força de cadeia posterior",
    categoria: "Força",
    objetivo: "Força",
    nivelIndicado: "Intermediário",
    publico: "Aluno com boa técnica de dobradiça de quadril, buscando força de glúteos e isquiotibiais.",
    tone: "success",
    resumo: "Padrão de quadril dominante para glúteos e isquiotibiais em baixas repetições e maior carga.",
    indicacao: "Ganho de força de cadeia posterior e ênfase glútea, em aluno com boa técnica de dobradiça de quadril.",
    base: "O hip thrust gera alta ativação de glúteo máximo em comparação ao agachamento, e o levantamento terra romeno recruta fortemente os isquiotibiais; juntos cobrem o padrão de quadril em faixa de força.",
    refIds: ["contreras-2015", "boeckh-behrens-2000", "garber-2011"],
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
    id: "forca-puxada",
    titulo: "Força de puxada (superiores)",
    categoria: "Força",
    objetivo: "Força",
    nivelIndicado: "Intermediário",
    publico: "Aluno buscando força de puxar (dorsais e bíceps) com boa técnica de tronco.",
    tone: "success",
    resumo: "Padrão de puxar vertical e horizontal em baixas repetições e maior carga.",
    indicacao: "Ganho de força de puxar, em aluno com controle de tronco e boa técnica de remada e puxada.",
    base: "A força de puxar depende de latíssimo, romboides e flexores do cotovelo; treinar puxada e remada em faixa de força desenvolve o padrão com estabilidade de tronco.",
    refIds: ["andersen-2014", "garber-2011"],
    frequencia: "2 sessões de superiores por semana",
    estruturaSemanal: "Puxada e remada em baixas repetições seguidas de acessório de bíceps.",
    itens: [
      { slug: "puxada-alta", series: "4 x 6" },
      { slug: "remada-baixa", series: "4 x 6" },
      { slug: "rosca-direta", series: "3 x 10" },
    ],
    parametros: ["p-rpe"],
    progressao: "Adicionar carga mantendo a amplitude completa e sem compensar com o tronco.",
  },

  /* ============================ RESISTÊNCIA MUSCULAR ============================ */
  {
    id: "superiores-poupando-ombro",
    titulo: "Superiores poupando o ombro",
    categoria: "Resistência muscular",
    objetivo: "Resistência muscular",
    nivelIndicado: "Iniciante",
    publico: "Aluno com desconforto de ombro em empurrar acima da cabeça ou na amplitude final do supino.",
    tone: "warning",
    resumo: "Trabalho de braços e dorsais em amplitude confortável, evitando estresse do ombro sensível.",
    indicacao: "Aluno com desconforto de ombro em empurrar acima da cabeça ou em amplitude final do supino. Mantém estímulo poupando a articulação.",
    base: "Priorizar puxadas e trabalho de braços em amplitude tolerada tende a manter o estímulo de resistência muscular respeitando o ombro sensível; a progressão gradual e individualizada guia a evolução da amplitude e da carga sem provocar dor.",
    refIds: ["garber-2011", "acsm-getp11"],
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
  {
    id: "resistencia-corpo-todo",
    titulo: "Resistência muscular de corpo todo",
    categoria: "Resistência muscular",
    objetivo: "Resistência muscular",
    nivelIndicado: "Iniciante",
    publico: "Aluno focado em saúde geral e condicionamento, com pouco tempo por sessão.",
    tone: "warning",
    resumo: "Circuito de corpo todo em repetições altas e intervalos curtos, para condicionamento geral.",
    indicacao: "Foco em saúde, tônus e condicionamento geral, em aluno que prefere sessões objetivas de corpo todo.",
    base: "Repetições mais altas com intervalos curtos favorecem a resistência muscular local e o condicionamento; um circuito de corpo todo cobre os principais padrões de forma eficiente.",
    refIds: ["garber-2011", "borg-1982"],
    frequencia: "2 a 3 sessões por semana",
    estruturaSemanal: "Circuito com um exercício por padrão (empurrar, puxar, inferiores, core), com intervalos curtos.",
    itens: [
      { slug: "leg-press-45", series: "2 a 3 x 15" },
      { slug: "remada-maquina", series: "2 a 3 x 15" },
      { slug: "supino-maquina", series: "2 a 3 x 15" },
      { slug: "prancha-frontal", series: "3 x 20 a 40 s" },
    ],
    parametros: ["p-rpe", "p-adesao"],
    progressao: "Reduzir o intervalo ou adicionar uma volta ao circuito conforme o condicionamento melhora.",
  },

  /* ============================ IDOSO E AUTONOMIA ============================ */
  {
    id: "idoso-autonomia",
    titulo: "Força, equilíbrio e autonomia",
    categoria: "Idoso e autonomia",
    objetivo: "Reabilitação/retorno",
    nivelIndicado: "Iniciante",
    publico: "Pessoa idosa ou destreinada com foco em autonomia, marcha e prevenção de quedas.",
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
    publico: "Aluno liberado por profissional de saúde para carga leve após lesão de joelho.",
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

/** Metadados de cada categoria para a navegação em dois níveis. */
export const PROTOCOLO_CATEGORIA_META: Record<ProtocoloCategoria, { descricao: string; icon: string; tone: "primary" | "analysis" | "cta" | "success" | "warning" }> = {
  Emagrecimento: { descricao: "Base aeróbia e força em progressão por tempo de treino.", icon: "Flame", tone: "cta" },
  Cardiorrespiratório: { descricao: "Fôlego e condicionamento: contínuo e intervalado.", icon: "Wind", tone: "analysis" },
  Hipertrofia: { descricao: "Volume muscular por região do corpo.", icon: "Dumbbell", tone: "primary" },
  Força: { descricao: "Força por padrão de movimento, em baixas repetições.", icon: "Zap", tone: "success" },
  "Resistência muscular": { descricao: "Condicionamento local e trabalho poupando articulações.", icon: "Repeat", tone: "warning" },
  "Idoso e autonomia": { descricao: "Força, equilíbrio e funcionalidade para a vida diária.", icon: "HeartPulse", tone: "success" },
  "Reabilitação e retorno": { descricao: "Reintrodução de carga após lesão, liberada por profissional de saúde.", icon: "ShieldCheck", tone: "warning" },
};

export function getProtocolo(id: string) {
  return protocolos.find((p) => p.id === id);
}
