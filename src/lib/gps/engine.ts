// Motor de regras do GPS da Prescrição — função pura e testável.
// Ranqueamento ponderado com decomposição transparente por critério.

import type { Exercise, Nivel } from "@/data/types";

export type GpsObjetivo =
  | "Hipertrofia"
  | "Força"
  | "Resistência muscular"
  | "Reabilitação/retorno"
  | "Aprendizado técnico";

export type GpsRestricao =
  | "Nenhuma"
  | "Dor lombar"
  | "Dor no joelho"
  | "Ombro sensível"
  | "Mobilidade limitada";

export interface GpsAnswers {
  objetivo: GpsObjetivo;
  grupoMuscular: string;
  nivel: Nivel;
  restricao: GpsRestricao;
  equipamentos: string[];
}

export interface CriterioRacional {
  criterio: string;
  peso: number; // contribuição líquida em pontos
  pontosPossiveis: number;
  detalhe: string;
}

export interface Recommendation {
  exercise: Exercise;
  score: number; // 0..100
  equipDisponivel: boolean;
  breakdown: CriterioRacional[];
  cautions: string[];
  reasons: string[];
}

const W_GRUPO = 25;
const W_OBJETIVO = 22;
const W_NIVEL = 20;
const W_EQUIP = 18;
const W_RESTRICAO = 15;

// Compressão global: mesmo o "perfeito" não chega a 100 → topo ~88–96%.
const COMPRESS = 0.92;

const NIVEIS: Nivel[] = ["Iniciante", "Intermediário", "Avançado"];
const nivelIdx = (n: Nivel) => NIVEIS.indexOf(n);

function metricValue(ex: Exercise, name: string): number | undefined {
  return ex.indiceEficiencia.metrics.find(
    (m) => m.nome.toLowerCase() === name.toLowerCase(),
  )?.valor;
}

export function scoreExercise(ex: Exercise, ans: GpsAnswers): Recommendation {
  const breakdown: CriterioRacional[] = [];
  const cautions: string[] = [];
  const reasons: string[] = [];

  // 1) Grupo muscular
  const grupoOk = ex.grupoMuscular === ans.grupoMuscular;
  const grupoPts = (grupoOk ? 1 : 0.1) * W_GRUPO;
  breakdown.push({
    criterio: "Grupo muscular",
    peso: +(grupoPts * COMPRESS).toFixed(1),
    pontosPossiveis: +(W_GRUPO * COMPRESS).toFixed(1),
    detalhe: grupoOk
      ? `Trabalha diretamente ${ex.grupoMuscular}.`
      : `Grupo do exercício (${ex.grupoMuscular}) difere do alvo (${ans.grupoMuscular}).`,
  });
  if (grupoOk) reasons.push(ex.grupoMuscular);

  // 2) Objetivo
  const objOk = ex.objetivo.includes(ans.objetivo);
  const objPts = (objOk ? 1 : 0.25) * W_OBJETIVO;
  breakdown.push({
    criterio: "Objetivo",
    peso: +(objPts * COMPRESS).toFixed(1),
    pontosPossiveis: +(W_OBJETIVO * COMPRESS).toFixed(1),
    detalhe: objOk
      ? `Alinhado ao objetivo "${ans.objetivo}".`
      : `Objetivos do exercício: ${ex.objetivo.join(", ")}. Alinhamento parcial com "${ans.objetivo}".`,
  });
  if (objOk) reasons.push(`Objetivo: ${ans.objetivo}`);

  // 3) Adequação de nível + complexidade técnica
  const diff = nivelIdx(ex.nivel) - nivelIdx(ans.nivel);
  let nivelRatio: number;
  let nivelMsg: string;
  if (diff === 0) {
    nivelRatio = 1;
    nivelMsg = `Nível ${ex.nivel} bate com o seu.`;
  } else if (diff < 0) {
    nivelRatio = 0.85;
    nivelMsg = `Mais simples (${ex.nivel}) — seguro, porém pouco desafiador para você.`;
  } else if (diff === 1) {
    nivelRatio = 0.4;
    nivelMsg = `Um nível acima (${ex.nivel}) — exige progressão assistida.`;
    cautions.push(`Classificado como ${ex.nivel}, um nível acima do informado.`);
  } else {
    nivelRatio = 0.05;
    nivelMsg = `Dois níveis acima (${ex.nivel}) — não recomendado sem base técnica.`;
    cautions.push(`${ex.nivel} está muito acima do nível informado — técnica antes de carga.`);
  }
  const complexidade = metricValue(ex, "Complexidade técnica") ?? 30;
  let complexPenalty = 0;
  if (ans.nivel === "Iniciante" && complexidade > 40) {
    complexPenalty = Math.min(0.5, (complexidade - 40) / 100);
  } else if (ans.nivel === "Intermediário" && complexidade > 70) {
    complexPenalty = Math.min(0.25, (complexidade - 70) / 120);
  }
  const nivelRatioFinal = Math.max(0, nivelRatio - complexPenalty);
  const nivelPts = nivelRatioFinal * W_NIVEL;
  breakdown.push({
    criterio: "Adequação de nível",
    peso: +(nivelPts * COMPRESS).toFixed(1),
    pontosPossiveis: +(W_NIVEL * COMPRESS).toFixed(1),
    detalhe:
      nivelMsg +
      (complexPenalty > 0
        ? ` Complexidade técnica ${complexidade}/100 pesa contra o nível ${ans.nivel}.`
        : ""),
  });
  if (diff === 0 && complexPenalty === 0) reasons.push(`Nível ${ex.nivel}`);

  // 4) Equipamento
  const equipOk = ans.equipamentos.includes(ex.equipamento);
  const equipPts = (equipOk ? 1 : 0) * W_EQUIP;
  breakdown.push({
    criterio: "Equipamento",
    peso: +(equipPts * COMPRESS).toFixed(1),
    pontosPossiveis: +(W_EQUIP * COMPRESS).toFixed(1),
    detalhe: equipOk
      ? `${ex.equipamento} está disponível.`
      : `${ex.equipamento} não foi marcado como disponível.`,
  });
  if (!equipOk) cautions.push(`Requer ${ex.equipamento}, fora dos equipamentos disponíveis.`);

  // 5) Restrição
  let restRatio = 1;
  let restDetalhe = "Sem restrição declarada.";
  if (ans.restricao !== "Nenhuma") {
    const map: Record<Exclude<GpsRestricao, "Nenhuma">, { metric: string; label: string }> = {
      "Dor lombar": { metric: "Demanda lombar", label: "coluna lombar" },
      "Dor no joelho": { metric: "Demanda de joelho", label: "joelho" },
      "Ombro sensível": { metric: "Demanda de ombro", label: "ombro" },
      "Mobilidade limitada": { metric: "Requisito de mobilidade", label: "mobilidade" },
    };
    const cfg = map[ans.restricao];
    const val = metricValue(ex, cfg.metric) ?? 30;
    if (val >= 60) {
      restRatio = 0.15;
      restDetalhe = `Alta demanda em ${cfg.label} (${val}/100) — penalizado por "${ans.restricao}".`;
      cautions.push(`Demanda relevante para ${cfg.label} — avalie caso a caso.`);
    } else if (val >= 40) {
      restRatio = 0.55;
      restDetalhe = `Demanda moderada em ${cfg.label} (${val}/100) — cautela recomendada.`;
      cautions.push(`Demanda moderada para ${cfg.label} — progressão gradual.`);
    } else {
      restDetalhe = `Baixa demanda em ${cfg.label} (${val}/100) — favorece "${ans.restricao}".`;
      reasons.push(`Baixa demanda em ${cfg.label}`);
    }
  }
  const restPts = restRatio * W_RESTRICAO;
  breakdown.push({
    criterio: "Restrição",
    peso: +(restPts * COMPRESS).toFixed(1),
    pontosPossiveis: +(W_RESTRICAO * COMPRESS).toFixed(1),
    detalhe: restDetalhe,
  });

  // Score final
  const soma = grupoPts + objPts + nivelPts + equipPts + restPts;
  let score = soma * COMPRESS;

  const efic = ex.indiceEficiencia.score ?? 60;
  const tiebreak = ((efic - 50) / 50) * 2.5;
  score += tiebreak;
  breakdown.push({
    criterio: "Eficiência (desempate)",
    peso: +tiebreak.toFixed(1),
    pontosPossiveis: 2.5,
    detalhe: `Índice de eficiência declarado: ${efic}/100.`,
  });

  if (!equipOk) score = Math.min(score, 65);

  const clamped = Math.max(0, Math.min(100, Math.round(score)));

  return { exercise: ex, score: clamped, equipDisponivel: equipOk, breakdown, cautions, reasons };
}

export function rankExercises(pool: Exercise[], ans: GpsAnswers): Recommendation[] {
  return pool
    .map((ex) => scoreExercise(ex, ans))
    .sort((a, b) => {
      if (a.equipDisponivel !== b.equipDisponivel) return a.equipDisponivel ? -1 : 1;
      return b.score - a.score;
    });
}

export const GRUPOS_MUSCULARES = [
  "Membros inferiores",
  "Peitorais",
  "Costas",
  "Ombros",
  "Braços",
] as const;

export const OBJETIVOS: GpsObjetivo[] = [
  "Hipertrofia",
  "Força",
  "Resistência muscular",
  "Reabilitação/retorno",
  "Aprendizado técnico",
];

export const RESTRICOES: GpsRestricao[] = [
  "Nenhuma",
  "Dor lombar",
  "Dor no joelho",
  "Ombro sensível",
  "Mobilidade limitada",
];

export const EQUIPAMENTOS = [
  "Máquina",
  "Barra",
  "Halter",
  "Polia",
  "Peso corporal",
] as const;
