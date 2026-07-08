import type { Nivel } from "./types";
import type { GpsAnswers, GpsObjetivo, GpsRestricao } from "@/lib/gps/engine";

/**
 * Domínio de trabalho do profissional: seus ALUNOS (clientes), com perfil que alimenta o
 * GPS, avaliações no tempo (evolução) e prescrições geradas com justificativa. Datas em
 * epoch ms para comparação/formatação simples. Mock local (persistido via Zustand).
 */

export type Sexo = "F" | "M" | "Outro";

export interface Aluno {
  id: string;
  nome: string;
  iniciais: string;
  idade?: number;
  sexo?: Sexo;
  objetivo: GpsObjetivo;
  nivel: Nivel;
  /** lesões/limitações relevantes (vazio = sem restrição) */
  restricoes: Exclude<GpsRestricao, "Nenhuma">[];
  /** equipamentos disponíveis no local de treino */
  equipamentos: string[];
  observacoes?: string;
  status: "ativo" | "inativo";
  criadoEm: number;
  ultimaAvaliacaoEm?: number;
  proximaReavaliacaoEm?: number;

  /* ---- Jornada de prescrição (grupos especiais) — todos opcionais ---- */
  /** slug do grupo especial principal (ver src/data/specialGroups.ts) */
  grupoEspecial?: string;
  condicoesAtencao?: string;
  /** ids de modalidades (ver src/data/modalities.ts) */
  modalidadesPreferenciais?: string[];
  modalidadesEvitadas?: string[];
  /** ids de monitoringParameters prioritários */
  parametrosPrioritarios?: string[];
  faseJornada?: 1 | 2 | 3 | 4;
  criterioProgressao?: string;
}

export interface Avaliacao {
  id: string;
  alunoId: string;
  data: number;
  medidas: {
    peso?: number;
    percentualGordura?: number;
    [k: string]: number | undefined;
  };
  /** dor percebida 0–10 (opcional) */
  dorEscala?: number;
  observacoes?: string;
}

export interface PrescricaoItem {
  slug: string;
  score: number;
  series?: string;
}

/* ------------------- Motor RCD: liberação e prontuário ------------------- */

/** Registro de uma passagem pelo Semáforo de Liberação (gate pré-sessão). */
export interface Liberacao {
  id: string;
  alunoId?: string;
  grupoSlug: string;
  data: number;
  /** respostas {itemId: valor} do checklist */
  respostas: Record<string, string>;
  resultado: "verde" | "amarelo" | "vermelho";
  /** ações sugeridas registradas no momento (amarelo/vermelho) */
  ajustes: { pergunta: string; acao: string }[];
}

/** Critério do breakdown do motor (espelha CriterioRacional do engine). */
export interface CriterioSnapshot {
  criterio: string;
  peso: number;
  pontosPossiveis: number;
  detalhe: string;
}

/**
 * PRONTUÁRIO DE DECISÃO TÉCNICA — snapshot completo do raciocínio no momento
 * da prescrição: o que foi escolhido E o que foi descartado, com o porquê de
 * cada um, o semáforo do dia e a bibliografia. É o rastro auditável que o
 * profissional pode mostrar ao aluno/médico ou guardar como defesa técnica.
 */
export interface ProntuarioSnapshot {
  escolhidos: {
    slug: string;
    nome: string;
    score: number;
    series?: string;
    reasons: string[];
    cautions: string[];
    breakdown: CriterioSnapshot[];
  }[];
  descartados: { slug: string; nome: string; score: number; motivoPrincipal: string }[];
  cuidadosGrupo?: { nome: string; cuidados: string[]; refs: string[] };
  semaforo?: { resultado: "verde" | "amarelo" | "vermelho"; data: number; ajustes: string[] };
  modalidades?: { id: string; nome: string; motivo: string }[];
  parametros: string[];
  /** ids de referencias.ts citadas (bibliografia numerada) */
  refIds: string[];
  geradoEm: number;
  motorVersao: string;
}

export interface Prescricao {
  id: string;
  alunoId: string;
  data: number;
  titulo: string;
  /** respostas do GPS que geraram a prescrição (rastreabilidade do raciocínio) */
  answers: GpsAnswers;
  itens: PrescricaoItem[];
  observacoes?: string;
  status: "ativa" | "arquivada";

  /* ---- Camada orientada por jornada (opcional; estrutura pronta p/ evoluir) ---- */
  grupoEspecial?: string;
  /** id de modalidade principal / secundárias */
  modalidadePrincipal?: string;
  modalidadesSecundarias?: string[];
  faseJornada?: number;
  frequenciaSemanal?: string;
  estrutura?: { aquecimento?: string; principal?: string; voltaCalma?: string };
  /** ids de monitoringParameters a controlar */
  parametrosControle?: string[];
  criteriosProgressao?: string[];
  criteriosRegressao?: string[];
  /** explicação do raciocínio (fisiológico/prático) da prescrição */
  raciocinio?: string;
  /** Prontuário de Decisão Técnica — rastro completo do Motor RCD */
  prontuario?: ProntuarioSnapshot;
}

const DIA = 86_400_000;
const now = Date.now();
const dias = (n: number) => now + n * DIA;

export function iniciaisDe(nome: string) {
  return nome
    .trim()
    .split(/\s+/)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

export const seedAlunos: Aluno[] = [
  {
    id: "al1",
    nome: "Mariana Alves",
    iniciais: "MA",
    idade: 34,
    sexo: "F",
    objetivo: "Hipertrofia",
    nivel: "Iniciante",
    restricoes: ["Dor lombar"],
    equipamentos: ["Máquina", "Polia", "Peso corporal"],
    observacoes: "Sedentária há 2 anos. Refere insegurança com agachamento livre.",
    status: "ativo",
    criadoEm: dias(-120),
    ultimaAvaliacaoEm: dias(-20),
    proximaReavaliacaoEm: dias(40),
    grupoEspecial: "dor-lombar-inespecifica",
    faseJornada: 2,
    modalidadesPreferenciais: ["m-musculacao", "m-bike", "m-mobilidade"],
    parametrosPrioritarios: ["p-dor", "p-rpe", "p-adesao"],
    criterioProgressao: "Tolera carga leve sem piora da dor por 2–3 semanas.",
  },
  {
    id: "al2",
    nome: "Carlos Mendes",
    iniciais: "CM",
    idade: 45,
    sexo: "M",
    objetivo: "Reabilitação/retorno",
    nivel: "Iniciante",
    restricoes: ["Dor no joelho"],
    equipamentos: ["Máquina", "Halter"],
    observacoes: "Retorno após entorse de joelho. Liberado pelo fisioterapeuta para carga leve.",
    status: "ativo",
    criadoEm: dias(-90),
    ultimaAvaliacaoEm: dias(-75),
    proximaReavaliacaoEm: dias(-15), // reavaliação vencida → precisa de atenção
    grupoEspecial: "osteoartrite-joelho",
    faseJornada: 1,
    modalidadesPreferenciais: ["m-musculacao", "m-bike"],
    parametrosPrioritarios: ["p-dor", "p-rpe"],
    criterioProgressao: "Força sem dor crescente e sem edema pós-sessão.",
  },
  {
    id: "al3",
    nome: "Júlia Santos",
    iniciais: "JS",
    idade: 27,
    sexo: "F",
    objetivo: "Força",
    nivel: "Intermediário",
    restricoes: [],
    equipamentos: ["Barra", "Halter", "Máquina"],
    observacoes: "Treina há 3 anos. Quer progredir em força de membros inferiores.",
    status: "ativo",
    criadoEm: dias(-40),
    ultimaAvaliacaoEm: dias(-10),
    proximaReavaliacaoEm: dias(50),
    // sem prescrição ativa → precisa de atenção
  },
  {
    id: "al4",
    nome: "Rafael Lima",
    iniciais: "RL",
    idade: 52,
    sexo: "M",
    objetivo: "Resistência muscular",
    nivel: "Iniciante",
    restricoes: ["Ombro sensível"],
    equipamentos: ["Halter", "Polia", "Peso corporal"],
    observacoes: "Foco em saúde geral e condicionamento. Desconforto em ombro no supino.",
    status: "ativo",
    criadoEm: dias(-70),
    ultimaAvaliacaoEm: dias(-30),
    proximaReavaliacaoEm: dias(3), // reavaliação próxima
  },
];

export const seedAvaliacoes: Avaliacao[] = [
  // Mariana — tendência de queda de peso e %gordura
  { id: "av1", alunoId: "al1", data: dias(-80), medidas: { peso: 72, percentualGordura: 31 }, dorEscala: 3, observacoes: "Início do acompanhamento." },
  { id: "av2", alunoId: "al1", data: dias(-50), medidas: { peso: 70.5, percentualGordura: 30 }, dorEscala: 2 },
  { id: "av3", alunoId: "al1", data: dias(-20), medidas: { peso: 69, percentualGordura: 28.5 }, dorEscala: 1, observacoes: "Menos desconforto lombar." },
  // Carlos
  { id: "av4", alunoId: "al2", data: dias(-75), medidas: { peso: 88, percentualGordura: 26 }, dorEscala: 4, observacoes: "Joelho estável em amplitude parcial." },
  // Júlia
  { id: "av5", alunoId: "al3", data: dias(-10), medidas: { peso: 63, percentualGordura: 22 }, dorEscala: 0 },
  // Rafael
  { id: "av6", alunoId: "al4", data: dias(-60), medidas: { peso: 95, percentualGordura: 29 }, dorEscala: 2 },
  { id: "av7", alunoId: "al4", data: dias(-30), medidas: { peso: 93, percentualGordura: 27.5 }, dorEscala: 1 },
];

export const seedPrescricoes: Prescricao[] = [
  {
    id: "pr1",
    alunoId: "al1",
    data: dias(-20),
    titulo: "Membros inferiores — base guiada",
    answers: {
      objetivo: "Hipertrofia",
      grupoMuscular: "Membros inferiores",
      nivel: "Iniciante",
      restricao: "Dor lombar",
      equipamentos: ["Máquina", "Polia", "Peso corporal"],
    },
    itens: [
      { slug: "leg-press-45", score: 88, series: "3 x 12" },
      { slug: "cadeira-extensora", score: 74, series: "3 x 15" },
      { slug: "mesa-flexora", score: 70, series: "3 x 12" },
    ],
    observacoes: "Priorizar amplitude confortável; progressão de carga semanal.",
    status: "ativa",
  },
  {
    id: "pr2",
    alunoId: "al2",
    data: dias(-70),
    titulo: "Retorno de joelho — carga controlada",
    answers: {
      objetivo: "Reabilitação/retorno",
      grupoMuscular: "Membros inferiores",
      nivel: "Iniciante",
      restricao: "Dor no joelho",
      equipamentos: ["Máquina", "Halter"],
    },
    itens: [
      { slug: "leg-press-45", score: 72, series: "3 x 15 (amplitude parcial)" },
      { slug: "cadeira-extensora", score: 66, series: "2 x 15" },
    ],
    observacoes: "Sem dor durante e após. Revisar em 4 semanas.",
    status: "ativa",
  },
  {
    id: "pr3",
    alunoId: "al4",
    data: dias(-30),
    titulo: "Superiores — poupando ombro",
    answers: {
      objetivo: "Resistência muscular",
      grupoMuscular: "Braços",
      nivel: "Iniciante",
      restricao: "Ombro sensível",
      equipamentos: ["Halter", "Polia", "Peso corporal"],
    },
    itens: [
      { slug: "rosca-direta", score: 82, series: "3 x 15" },
      { slug: "triceps-polia", score: 80, series: "3 x 15" },
    ],
    observacoes: "Evitar amplitude que gere desconforto no ombro.",
    status: "ativa",
  },
];
