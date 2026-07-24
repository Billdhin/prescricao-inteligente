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
import { intervaloDe, unidade } from "./faixasParse";

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
