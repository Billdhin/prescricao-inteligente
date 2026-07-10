// Motor de regras do GPS da Prescrição — função pura e testável.
// Ranqueamento ponderado com decomposição transparente por critério.

import type { Exercise, Nivel } from "@/data/types";

export type GpsObjetivo =
  | "Emagrecimento"
  | "Hipertrofia"
  | "Força"
  | "Resistência muscular"
  | "Reabilitação/retorno"
  | "Aprendizado técnico";

/** Prioridade física quando o objetivo é Emagrecimento (substitui músculo-alvo). */
export type GpsPrioridade =
  | "Condicionamento cardiorrespiratório"
  | "Força geral (corpo todo)"
  | "Cardio + força (misto)";

export type GpsRestricao =
  | "Nenhuma"
  | "Dor lombar"
  | "Dor no joelho"
  | "Ombro sensível"
  | "Mobilidade limitada";

export interface GpsAnswers {
  objetivo: GpsObjetivo;
  grupoMuscular: string;
  /** só quando objetivo = Emagrecimento */
  prioridade?: GpsPrioridade;
  nivel: Nivel;
  restricao: GpsRestricao;
  equipamentos: string[];
}

/** Cuidados automáticos de um grupo/condição aplicados ao ranqueamento
 *  (penalização transparente — aparece no breakdown da justificativa). */
export interface GroupRuleInput {
  nome: string;
  penalidades: { metrica: string; limite: number; motivo: string }[];
  /** complexidade técnica acima disso é penalizada para o perfil */
  complexidadeMax?: number;
}

export interface CriterioRacional {
  criterio: string;
  peso: number; // contribuição líquida em pontos
  pontosPossiveis: number;
  detalhe: string;
}

export interface Recommendation {
  exercise: Exercise;
  score: number; // 0..100 (arredondado, para exibição)
  /** nota sem arredondar — usada só para ordenar/desempatar */
  scoreExato: number;
  equipDisponivel: boolean;
  /** o exercício trabalha o grupo-alvo pedido (ou é de corpo todo que o cobre)? */
  grupoCompativel: boolean;
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

// "Corpo todo": pontua por massa muscular envolvida (maior custo energético) —
// usado no Emagrecimento e disponível como alvo geral.
const MASSA_MUSCULAR: Record<string, number> = {
  "Corpo todo": 1,
  "Membros inferiores": 1,
  Costas: 0.9,
  Peitorais: 0.85,
  "Core (tronco)": 0.6,
  Ombros: 0.55,
  Braços: 0.4,
};

export function scoreExercise(ex: Exercise, ans: GpsAnswers, rule?: GroupRuleInput): Recommendation {
  const breakdown: CriterioRacional[] = [];
  const cautions: string[] = [];
  const reasons: string[] = [];

  // 1) Grupo muscular
  const corpoTodo = ans.grupoMuscular === "Corpo todo";
  const exCorpoTodo = ex.grupoMuscular === "Corpo todo";
  const grupoOk = corpoTodo
    ? (MASSA_MUSCULAR[ex.grupoMuscular] ?? 0.5) >= 0.85
    : exCorpoTodo || ex.grupoMuscular === ans.grupoMuscular;
  // exercício de corpo todo cobre parcialmente qualquer alvo específico
  const grupoRatio = corpoTodo
    ? (MASSA_MUSCULAR[ex.grupoMuscular] ?? 0.5)
    : exCorpoTodo
      ? 0.6
      : grupoOk
        ? 1
        : 0.1;
  const grupoPts = grupoRatio * W_GRUPO;
  breakdown.push({
    criterio: "Grupo muscular",
    peso: +(grupoPts * COMPRESS).toFixed(1),
    pontosPossiveis: +(W_GRUPO * COMPRESS).toFixed(1),
    detalhe: corpoTodo
      ? grupoOk
        ? `${ex.grupoMuscular}: grande massa muscular, maior custo energético por série.`
        : `${ex.grupoMuscular}: massa muscular menor, contribui menos para o gasto global.`
      : exCorpoTodo
        ? `Exercício de corpo todo: cobre parcialmente o alvo (${ans.grupoMuscular}).`
        : grupoOk
          ? `Trabalha diretamente ${ex.grupoMuscular}.`
          : `Grupo do exercício (${ex.grupoMuscular}) difere do alvo (${ans.grupoMuscular}).`,
  });
  if (grupoOk && !exCorpoTodo) reasons.push(corpoTodo ? `Grande massa muscular (${ex.grupoMuscular})` : ex.grupoMuscular);

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
    nivelMsg = `Nível ${ex.nivel}, compatível com o informado.`;
  } else if (diff < 0) {
    nivelRatio = 0.85;
    nivelMsg = `Mais simples (${ex.nivel}): seguro, porém abaixo do nível informado.`;
  } else if (diff === 1) {
    nivelRatio = 0.4;
    nivelMsg = `Um nível acima (${ex.nivel}): exige progressão assistida.`;
    cautions.push(`Classificado como ${ex.nivel}, um nível acima do informado.`);
  } else {
    nivelRatio = 0.05;
    nivelMsg = `Dois níveis acima (${ex.nivel}): não recomendado sem base técnica.`;
    cautions.push(`${ex.nivel} está muito acima do nível informado: técnica antes de carga.`);
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

  // 4) Equipamento — o próprio corpo está sempre disponível (todo aluno o tem)
  const equipOk = ex.equipamento === "Peso corporal" || ans.equipamentos.includes(ex.equipamento);
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
    const val = metricValue(ex, cfg.metric);
    if (val === undefined) {
      // Sem dado declarado: não inventa "30/100" nem elogia. Trata com cautela neutra.
      restRatio = 0.7;
      restDetalhe = `Sem dado declarado de ${cfg.label} para este exercício. Avalie a execução caso a caso.`;
      cautions.push(`Falta dado de ${cfg.label}: confirme a tolerância do aluno antes de progredir.`);
    } else if (val >= 60) {
      restRatio = 0.15;
      restDetalhe = `Alta demanda em ${cfg.label} (${val}/100), penalizado por "${ans.restricao}".`;
      cautions.push(`Demanda relevante para ${cfg.label}: avalie caso a caso.`);
    } else if (val >= 40) {
      restRatio = 0.55;
      restDetalhe = `Demanda moderada em ${cfg.label} (${val}/100), cautela recomendada.`;
      cautions.push(`Demanda moderada para ${cfg.label}: progressão gradual.`);
    } else {
      restDetalhe = `Baixa demanda em ${cfg.label} (${val}/100), favorece "${ans.restricao}".`;
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

  // 6) Cuidados do grupo/condição (só penaliza — transparente no breakdown)
  let grupoCondPen = 0;
  if (rule) {
    const motivos: string[] = [];
    for (const p of rule.penalidades) {
      const val = metricValue(ex, p.metrica);
      if (val !== undefined && val >= p.limite) {
        grupoCondPen -= 4;
        motivos.push(`${p.motivo} (${p.metrica.toLowerCase()}: ${val}/100)`);
        cautions.push(p.motivo);
      }
    }
    if (rule.complexidadeMax !== undefined && complexidade > rule.complexidadeMax) {
      grupoCondPen -= 3;
      motivos.push(`Complexidade técnica ${complexidade}/100 acima do recomendado para este perfil.`);
      cautions.push("Técnica exigente para este perfil: simplifique ou supervisione de perto.");
    }
    grupoCondPen = Math.max(grupoCondPen, -12);
    breakdown.push({
      // sem o rótulo clínico: este texto chega ao documento entregue ao aluno
      criterio: "Cuidados do perfil",
      peso: +grupoCondPen.toFixed(1),
      pontosPossiveis: 0,
      detalhe: motivos.length
        ? motivos.join(" ")
        : "Sem conflito com os cuidados típicos deste grupo.",
    });
  }

  // Score final
  const soma = grupoPts + objPts + nivelPts + equipPts + restPts;
  let score = soma * COMPRESS + grupoCondPen;

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
  // grupo incompatível (ratio mínimo 0.1): não pode parecer "Boa" adequação para o alvo pedido.
  const grupoCompativel = grupoRatio >= 0.55;
  if (!grupoCompativel) score = Math.min(score, 55);

  const raw = Math.max(0, Math.min(100, score));
  const clamped = Math.round(raw);

  return { exercise: ex, score: clamped, scoreExato: raw, equipDisponivel: equipOk, grupoCompativel, breakdown, cautions, reasons };
}

export function rankExercises(pool: Exercise[], ans: GpsAnswers, rule?: GroupRuleInput): Recommendation[] {
  return pool
    .map((ex) => scoreExercise(ex, ans, rule))
    .sort((a, b) => {
      if (a.equipDisponivel !== b.equipDisponivel) return a.equipDisponivel ? -1 : 1;
      // ordena pela nota NÃO arredondada: o critério "Eficiência (desempate)" (±2.5)
      // sumia no Math.round e a ordem virava a do array de dados.
      return b.scoreExato - a.scoreExato;
    });
}

export const GRUPOS_MUSCULARES = [
  "Corpo todo",
  "Membros inferiores",
  "Peitorais",
  "Costas",
  "Core (tronco)",
  "Ombros",
  "Braços",
] as const;

export const OBJETIVOS: GpsObjetivo[] = [
  "Emagrecimento",
  "Hipertrofia",
  "Força",
  "Resistência muscular",
  "Reabilitação/retorno",
  "Aprendizado técnico",
];

export const PRIORIDADES: GpsPrioridade[] = [
  "Condicionamento cardiorrespiratório",
  "Força geral (corpo todo)",
  "Cardio + força (misto)",
];

export const RESTRICOES: GpsRestricao[] = [
  "Nenhuma",
  "Dor lombar",
  "Dor no joelho",
  "Ombro sensível",
  "Mobilidade limitada",
];

/** Rótulo qualitativo da nota de adequação (0–100) — evita o "match" em inglês e
 *  dá significado ao número: notas próximas = alternativas igualmente válidas. */
export function adequacaoLabel(score: number): string {
  if (score >= 90) return "Excelente";
  if (score >= 80) return "Muito boa";
  if (score >= 70) return "Boa";
  return "Parcial";
}

export const EQUIPAMENTOS = [
  "Máquina",
  "Barra",
  "Halter",
  "Polia",
  "Peso corporal",
  "Elástico",
  "Esteira",
  "Bicicleta ergométrica",
  "Elíptico",
  "Piscina",
] as const;
