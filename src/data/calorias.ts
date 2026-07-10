/**
 * Gasto calórico das modalidades aeróbicas para o COMPARADOR: cálculo AO VIVO.
 *
 * Antes, o comparador mostrava um valor fixo (30 min, esforço moderado, ~70 kg).
 * Aqui o gasto passa a ser recalculado conforme dois parâmetros flexíveis:
 *   1) INTENSIDADE (leve, moderado, intenso): cada nível tem um MET de referência
 *      próprio por atividade (a literatura já separa faixas leve/moderada/vigorosa).
 *   2) TEMPO (15, 20, 30, 45, 60, 90 min): livre para escolher a escala.
 * O peso corporal também é ajustável (padrão de referência: 70 kg).
 *
 * FÓRMULA (ACSM / Compendium):
 *   kcal = MET × 3,5 × peso(kg) / 200 × minutos
 *   (equivalente a MET × peso(kg) × horas; o VO2 de repouso vale 3,5 mL/kg/min,
 *    e ~5 kcal são liberadas por litro de O2 consumido).
 *
 * FONTES DOS METs (educacional, ESTIMATIVA, não medição do aluno):
 * - Compendium of Physical Activities, Ainsworth et al., 2011 (atualização do
 *   compêndio original de 1993/2000). Os METs abaixo aproximam as faixas de
 *   intensidade tabeladas para cada atividade (leve/moderada/vigorosa).
 * - Convenção de faixas de intensidade do ACSM: leve < 3 MET em atividades muito
 *   suaves, moderada ~3 a 6 MET, vigorosa > 6 MET. Nem toda modalidade tem faixa
 *   "leve" abaixo de 3 MET (correr ou pular corda já partem de valores altos): aqui
 *   "leve" significa a MENOR intensidade praticável daquela atividade, não < 3 MET.
 *
 * Referências de código do Compendium (2011) usadas como âncora, por atividade:
 *   Caminhada 17150/17190/17220 · Corrida 12020/12050/12070 ·
 *   Ciclismo 01015/01020/01040 · Natação 18240/18230/18220 ·
 *   Patins 15591/15590 · Remo 02068/02071/02072 · Elíptico 02048 ·
 *   Pular corda 15551/15552/15550 · Marcha aquática 03080/03090 ·
 *   Subir escadas 17130/17133.
 */

export type Intensidade = "leve" | "moderado" | "intenso";

/** Intensidades na ordem de exibição, com rótulo e descrição curta para a UI. */
export const INTENSIDADES: {
  id: Intensidade;
  label: string;
  /** microcópia de apoio (percebido pelo praticante). */
  descricao: string;
}[] = [
  { id: "leve", label: "Leve", descricao: "conversa fácil, ritmo confortável" },
  { id: "moderado", label: "Moderado", descricao: "respiração acelerada, ainda dá para falar" },
  { id: "intenso", label: "Intenso", descricao: "respiração forte, fala entrecortada" },
];

/** Tempos de sessão disponíveis (em minutos). Substitui os 30 min fixos. */
export const TEMPOS_MIN = [15, 20, 30, 45, 60, 90] as const;
export type TempoMin = (typeof TEMPOS_MIN)[number];

/** Peso corporal de referência quando o usuário não informa outro (kg). */
export const PESO_PADRAO_KG = 70;

/**
 * Tabela de MET por modalidade e por intensidade.
 * A chave é o `id` da modalidade em src/data/cardio.ts (ex.: "c-caminhada"),
 * assim o comparador continua funcionando mesmo para modalidades sem `slug`.
 */
export const MET_POR_INTENSIDADE: Record<string, Record<Intensidade, number>> = {
  // Caminhada: 3,2 km/h (leve) · 5,5 km/h firme (moderado) · 6,4+ km/h / subida (intenso)
  "c-caminhada": { leve: 2.8, moderado: 4.3, intenso: 6.3 },
  // Corrida: trote (leve) · ~9,7 km/h (moderado) · ~11-12 km/h (intenso)
  "c-corrida": { leve: 7.0, moderado: 9.8, intenso: 11.8 },
  // Ciclismo: lazer <16 km/h (leve) · 19-22 km/h (moderado) · 23-26 km/h (intenso)
  "c-ciclismo": { leve: 5.8, moderado: 8.0, intenso: 10.0 },
  // Natação: recreativa (leve) · nado livre moderado · nado livre vigoroso
  "c-natacao": { leve: 6.0, moderado: 8.3, intenso: 9.8 },
  // Patins / inline: recreativo (leve) · 15590 geral (moderado) · vigoroso ~22 km/h
  "c-patins": { leve: 5.5, moderado: 7.5, intenso: 9.8 },
  // Remo ergômetro: ~50 W (leve) · ~100 W (moderado) · ~150-200 W (intenso)
  "c-remo": { leve: 4.8, moderado: 7.0, intenso: 8.5 },
  // Elíptico: cadência suave (leve) · geral (moderado) · carga alta (intenso)
  "c-eliptico": { leve: 4.6, moderado: 5.0, intenso: 7.0 },
  // Pular corda: lento <100/min (leve) · 100-120/min (moderado) · >120/min (intenso)
  "c-corda": { leve: 8.8, moderado: 11.8, intenso: 12.3 },
  // Marcha aquática: rasa/lenta (leve) · moderada · vigorosa (água funda)
  "c-marcha-aquatica": { leve: 4.5, moderado: 5.5, intenso: 6.8 },
  // Subir escadas: ritmo lento (leve) · geral (moderado) · rápido/contínuo (intenso)
  "c-escada": { leve: 5.0, moderado: 8.0, intenso: 9.0 },
};

/**
 * MET de referência de uma modalidade em dada intensidade.
 * Se a modalidade não estiver na tabela, cai no `fallbackMet` (o MET moderado
 * já presente em cardio.ts), ajustado por um fator aproximado de intensidade,
 * para nunca quebrar caso surja uma modalidade nova sem tabela dedicada.
 */
export function metDe(id: string, intensidade: Intensidade, fallbackMet: number): number {
  const linha = MET_POR_INTENSIDADE[id];
  if (linha) return linha[intensidade];
  const fator: Record<Intensidade, number> = { leve: 0.7, moderado: 1, intenso: 1.25 };
  return Math.round(fallbackMet * fator[intensidade] * 10) / 10;
}

/**
 * Gasto calórico estimado (kcal), fórmula ACSM.
 * kcal = MET × 3,5 × peso(kg) / 200 × minutos
 */
export function kcalEstimado(met: number, pesoKg: number, minutos: number): number {
  return Math.round((met * 3.5 * pesoKg / 200) * minutos);
}

/**
 * Atalho: kcal de uma modalidade a partir do seu id, intensidade, peso e tempo.
 * Usa `fallbackMet` quando a modalidade não tem tabela por intensidade.
 */
export function kcalModalidade(
  id: string,
  intensidade: Intensidade,
  pesoKg: number,
  minutos: number,
  fallbackMet: number,
): { kcal: number; met: number } {
  const met = metDe(id, intensidade, fallbackMet);
  return { kcal: kcalEstimado(met, pesoKg, minutos), met };
}
