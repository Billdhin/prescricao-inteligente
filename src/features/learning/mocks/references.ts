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
];
