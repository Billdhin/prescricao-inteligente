/**
 * Conferência de um valor editado contra a faixa da diretriz ("Prescrever treino").
 *
 * O que este arquivo NÃO faz: travar. O profissional habilitado decide, e há motivo
 * clínico legítimo para sair da faixa. O aviso é apoio, e por isso ele precisa ser
 * conservador: um aviso falso ensina o profissional a ignorar todos os avisos.
 *
 * Três cuidados que evitam avisos falsos:
 * 1. Só compara quando os dois lados têm número. "Confortável, sem pressa" não vira erro.
 * 2. A faixa é a UNIÃO de tudo que a diretriz cita (o valor e a ressalva). A hipertrofia
 *    diz "6 a 12" e completa que a faixa útil vai de 6 a 20: 15 repetições não é erro.
 * 3. Minuto e segundo são normalizados, e um valor sem unidade herda a unidade da
 *    diretriz. Sem isto, "90 s" contra "1 a 2 min" acusaria um erro que não existe.
 *
 * A intensidade fica de fora da conferência numérica de propósito: o mesmo campo aceita
 * %1RM, RPE e repetições de reserva, que são escalas diferentes. Comparar número com
 * número ali acusaria erro onde não há. A faixa aparece ao lado como referência.
 */

import { valorFaixa, type FaixaObjetivo, type FaixaVar } from "@/data/periodizacao";
import type { Nivel } from "@/data/types";

interface Intervalo {
  min: number;
  max: number;
}

const NUM = "(\\d+(?:[.,]\\d+)?)";
const RANGE_RE = new RegExp(`${NUM}\\s*(?:a|até)\\s*${NUM}`, "gi");
const ATE_RE = new RegExp(`(?:até|no máximo|menos de)\\s*${NUM}`, "i");
const ACIMA_RE = new RegExp(`(?:acima de|mais de|a partir de|no mínimo)\\s*${NUM}`, "i");
const NUM_RE = new RegExp(NUM, "g");

const n = (s: string) => Number(s.replace(",", "."));

/** Extrai o intervalo numérico de um texto livre. Sem número, devolve null. */
function intervaloDe(texto: string): Intervalo | null {
  const ranges = [...texto.matchAll(RANGE_RE)].map((m) => [n(m[1]), n(m[2])] as const);
  if (ranges.length) {
    return { min: Math.min(...ranges.map((r) => r[0])), max: Math.max(...ranges.map((r) => r[1])) };
  }
  const ate = ATE_RE.exec(texto);
  if (ate) return { min: 0, max: n(ate[1]) };
  const acima = ACIMA_RE.exec(texto);
  if (acima) return { min: n(acima[1]), max: Infinity };
  const soltos = [...texto.matchAll(NUM_RE)].map((m) => n(m[1]));
  if (soltos.length) return { min: Math.min(...soltos), max: Math.max(...soltos) };
  return null;
}

/** Segundos por unidade citada no texto. null quando o texto não declara unidade. */
function unidade(texto: string): number | null {
  if (/\bmin\b|minuto/i.test(texto)) return 60;
  if (/\bs\b|\bseg\b|segundo/i.test(texto)) return 1;
  return null;
}

/** Tudo que a diretriz cita para a variável, para formar a união da faixa. */
function textoDeReferencia(v: FaixaVar, nivel: Nivel): string {
  return [valorFaixa(v, nivel), v.valor, v.nota].filter(Boolean).join(" · ");
}

/** O que mostrar como faixa sugerida ao lado do campo. */
export function faixaSugerida(v: FaixaVar, nivel: Nivel): string {
  return valorFaixa(v, nivel);
}

export type CampoFaixa = "series" | "reps" | "intervalo";

/**
 * Devolve o aviso quando o valor sai da faixa citada, ou null quando está dentro,
 * quando não há número dos dois lados ou quando o bloco não segue a faixa de força.
 */
export function conferirFaixa(
  campo: CampoFaixa,
  valor: string,
  faixa: FaixaObjetivo,
  nivel: Nivel,
): string | null {
  const bruto = valor.trim();
  if (!bruto) return null;
  const ref = faixa[campo];
  const referencia = textoDeReferencia(ref, nivel);

  const f = intervaloDe(referencia);
  const v = intervaloDe(bruto);
  if (!f || !v) return null;

  // Tempo: o valor sem unidade herda a unidade da diretriz.
  const uf = unidade(referencia) ?? 1;
  const uv = campo === "intervalo" ? unidade(bruto) ?? uf : 1;
  const kf = campo === "intervalo" ? uf : 1;

  const abaixo = v.min * uv < f.min * kf - 1e-9;
  const acima = v.max === Infinity ? f.max !== Infinity : v.max * uv > f.max * kf + 1e-9;
  if (!abaixo && !acima) return null;

  return `Fora da faixa de referência (${faixaSugerida(ref, nivel)}). O plano não trava: a decisão é sua.`;
}
