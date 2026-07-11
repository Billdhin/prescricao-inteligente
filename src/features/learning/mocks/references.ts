import type { ScientificReference } from "../types";

/**
 * Referências do Aprender. As marcadas como "validada" reproduzem entradas reais
 * da base RCD (src/data/referencias.ts); as "a-validar" são PLACEHOLDERS editoriais
 * (sem DOI/URL inventados), exibidas com o rótulo "Referência a ser validada pela
 * equipe editorial", conforme a regra do produto de não inventar ciência.
 */

export const references: ScientificReference[] = [
  {
    id: "ref-escamilla-agachamento",
    title: "Effects of technique variations on knee biomechanics during the squat and leg press",
    authors: "Escamilla RF, Fleisig GS, Zheng N, et al.",
    year: 2001,
    sourceType: "mecanistico",
    journalOrPublisher: "Medicine & Science in Sports & Exercise",
    openAccess: false,
    abstractSummary: "Amplitude e posição do pé alteram a demanda de joelho e quadril no agachamento e no leg press.",
    topics: ["biomecânica", "agachamento", "joelho"],
    validationStatus: "validada",
    usedIn: ["Por que o joelho ultrapassar a ponta do pé não é automaticamente um erro?"],
  },
  {
    id: "ref-diretriz-forca",
    title: "Quantity and quality of exercise (ACSM Position Stand)",
    authors: "Garber CE, Blissmer B, Deschenes MR, et al.",
    year: 2011,
    sourceType: "position-stand",
    journalOrPublisher: "Medicine & Science in Sports & Exercise",
    openAccess: false,
    abstractSummary: "Sustenta faixas de séries e repetições e a progressão gradual por objetivo.",
    topics: ["treinamento de força", "prescrição", "progressão"],
    validationStatus: "validada",
    usedIn: ["Aula de análise do agachamento", "Protocolos de força"],
  },
  {
    id: "ref-oms-atividade",
    title: "Diretrizes de atividade física e comportamento sedentário",
    authors: "Organização Mundial da Saúde",
    year: 2020,
    sourceType: "diretriz",
    journalOrPublisher: "OMS, Genebra",
    openAccess: true,
    abstractSummary: "Base das metas semanais de atividade física usadas como referência de volume.",
    topics: ["saúde", "volume", "atividade física"],
    validationStatus: "validada",
  },
  {
    id: "ref-borg-pse",
    title: "Psychophysical bases of perceived exertion",
    authors: "Borg GA",
    year: 1982,
    sourceType: "mecanistico",
    journalOrPublisher: "Medicine & Science in Sports & Exercise",
    openAccess: false,
    abstractSummary: "Origem da escala de percepção de esforço usada no controle de carga.",
    topics: ["percepção de esforço", "controle de carga"],
    validationStatus: "validada",
  },
  {
    id: "ref-a-validar-antropometria",
    title: "Referência a ser validada pela equipe editorial",
    authors: "A definir",
    year: 0,
    sourceType: "revisao-sistematica",
    journalOrPublisher: "Aguardando curadoria",
    openAccess: false,
    abstractSummary: "Placeholder de demonstração sobre antropometria e escolha de variação de exercício.",
    topics: ["antropometria", "individualização"],
    validationStatus: "a-validar",
  },
  {
    id: "ref-a-validar-dor",
    title: "Referência a ser validada pela equipe editorial",
    authors: "A definir",
    year: 0,
    sourceType: "consenso",
    journalOrPublisher: "Aguardando curadoria",
    openAccess: false,
    abstractSummary: "Placeholder de demonstração sobre interpretação da dor durante o exercício.",
    topics: ["dor", "tolerância", "adaptação"],
    validationStatus: "a-validar",
  },

  /* --------- Base científica do treinamento de força (autoria dedicada) --------- */
  {
    id: "ref-schoenfeld-hipertrofia-2010",
    title: "The mechanisms of muscle hypertrophy and their application to resistance training",
    authors: "Schoenfeld BJ",
    year: 2010,
    sourceType: "mecanistico",
    journalOrPublisher: "Journal of Strength and Conditioning Research",
    openAccess: false,
    abstractSummary:
      "Revisão que organiza os três mecanismos propostos da hipertrofia (tensão mecânica, estresse metabólico e dano muscular) e os liga às variáveis do treino.",
    topics: ["hipertrofia", "tensão mecânica", "volume"],
    validationStatus: "validada",
  },
  {
    id: "ref-schoenfeld-volume-2017",
    title:
      "Dose-response relationship between weekly resistance training volume and increases in muscle mass: a systematic review and meta-analysis",
    authors: "Schoenfeld BJ, Ogborn D, Krieger JW",
    year: 2017,
    sourceType: "meta-analise",
    journalOrPublisher: "Journal of Sports Sciences",
    openAccess: false,
    abstractSummary:
      "Meta-análise que descreve uma relação dose-resposta entre o volume semanal (séries por grupo muscular) e o ganho de massa, com tendência de mais volume, mais hipertrofia dentro de faixas toleradas.",
    topics: ["volume", "hipertrofia", "dose-resposta"],
    validationStatus: "validada",
  },
  {
    id: "ref-schoenfeld-frequencia-2016",
    title:
      "Effects of resistance training frequency on measures of muscle hypertrophy: a systematic review and meta-analysis",
    authors: "Schoenfeld BJ, Ogborn D, Krieger JW",
    year: 2016,
    sourceType: "meta-analise",
    journalOrPublisher: "Sports Medicine",
    openAccess: false,
    abstractSummary:
      "Meta-análise que sugere que, igualado o volume semanal, a frequência por si só tem efeito pequeno sobre a hipertrofia; a frequência importa sobretudo como meio de distribuir o volume.",
    topics: ["frequência", "volume", "hipertrofia"],
    validationStatus: "validada",
  },
  {
    id: "ref-grgic-frequencia-forca-2018",
    title:
      "Effects of resistance training frequency on gains in muscular strength: a systematic review and meta-analysis",
    authors: "Grgic J, Schoenfeld BJ, Davies TB, et al.",
    year: 2018,
    sourceType: "meta-analise",
    journalOrPublisher: "Sports Medicine",
    openAccess: false,
    abstractSummary:
      "Meta-análise indicando que, quando o volume é equiparado, frequências mais altas não são obrigatórias para o ganho de força; a frequência é uma variável de organização.",
    topics: ["frequência", "força", "volume"],
    validationStatus: "validada",
  },
  {
    id: "ref-acsm-progressao-2009",
    title: "Progression models in resistance training for healthy adults (ACSM Position Stand)",
    authors: "Ratamess NA, Alvar BA, Evetoch TK, et al.",
    year: 2009,
    sourceType: "position-stand",
    journalOrPublisher: "Medicine & Science in Sports & Exercise",
    openAccess: false,
    abstractSummary:
      "Posicionamento do ACSM sobre progressão de carga, seleção de intensidade e volume por objetivo (força, hipertrofia, potência, resistência) e organização das sessões.",
    topics: ["progressão", "intensidade", "prescrição"],
    validationStatus: "validada",
  },
  {
    id: "ref-helms-rir-2016",
    title:
      "Application of the Repetitions in Reserve-based Rating of Perceived Exertion scale for resistance training",
    authors: "Helms ER, Cronin J, Storey A, Zourdos MC",
    year: 2016,
    sourceType: "mecanistico",
    journalOrPublisher: "Strength and Conditioning Journal",
    openAccess: false,
    abstractSummary:
      "Propõe o uso das repetições em reserva (RIR) como escala prática de esforço para calibrar a proximidade da falha e autorregular a carga.",
    topics: ["RIR", "percepção de esforço", "autorregulação"],
    validationStatus: "validada",
  },
  {
    id: "ref-grgic-intervalo-2018",
    title:
      "Effects of rest interval duration in resistance training on measures of muscular strength: a systematic review",
    authors: "Grgic J, Schoenfeld BJ, Skrepnik M, et al.",
    year: 2018,
    sourceType: "revisao-sistematica",
    journalOrPublisher: "Sports Medicine",
    openAccess: false,
    abstractSummary:
      "Revisão que associa intervalos mais longos (a partir de cerca de dois minutos em multiarticulares) à melhor preservação de repetições e do desempenho de força ao longo das séries.",
    topics: ["intervalo", "descanso", "força"],
    validationStatus: "validada",
  },
];
