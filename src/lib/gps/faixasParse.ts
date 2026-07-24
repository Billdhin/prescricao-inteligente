/**
 * Leitura numérica de uma faixa escrita em texto livre ("3 a 4", "6 a 12", "até 90 s",
 * "acima de 15", "20 a 40 min").
 *
 * Extraído de faixas.ts para virar módulo compartilhado: além da conferência de faixa
 * (conferirFaixa), o guardrail check:progressao precisa dos MESMOS parsers para derivar os
 * proxies de volume e intensidade por semana. Uma leitura só, num lugar só, para a
 * conferência e o proxy nunca divergirem. Comportamento byte-idêntico ao que vivia em
 * faixas.ts (check:faixas continua verde).
 */

export interface Intervalo {
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
export function intervaloDe(texto: string): Intervalo | null {
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
export function unidade(texto: string): number | null {
  if (/\bmin\b|minuto/i.test(texto)) return 60;
  if (/\bs\b|\bseg\b|segundo/i.test(texto)) return 1;
  return null;
}
