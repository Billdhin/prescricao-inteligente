/**
 * O QUE PODE SER DIGITADO NUM CAMPO NUMÉRICO, E O QUE SAI DELE.
 *
 * Vive num módulo próprio, e não junto do formulário que precisou disto primeiro, porque a
 * regra vale para toda tela que recebe número: a avaliação, a calculadora de estimativa, o
 * registro do aluno e as calculadoras da carteira. Deixá-la dentro do modal de avaliação
 * obrigaria quem só quer o filtro a carregar o modal inteiro junto.
 *
 * `inputMode="decimal"` NÃO filtra nada. É dica de teclado no celular; no computador o campo
 * engole "abc" inteiro. Era só nisso que a maioria dos campos se apoiava, e o resultado
 * apareceu na tabela comparativa do aluno como "NaNmmHg". Ver `scripts/check-numeros.ts`.
 */

/**
 * Recorta o que foi digitado para dígitos e UM separador decimal.
 *
 * Vírgula e ponto valem os dois, porque o brasileiro digita os dois e a conversão normaliza
 * depois. O segundo separador é descartado, senão "1.2.3" voltaria a virar NaN.
 *
 * `inteiroAte99` é o caso das escalas de 0 a 10 e afins: sem separador e no máximo dois
 * dígitos.
 */
export function soNumero(texto: string, inteiroAte99 = false): string {
  if (inteiroAte99) return texto.replace(/[^\d]/g, "").slice(0, 2);
  const limpo = texto.replace(/[^\d.,]/g, "");
  const i = limpo.search(/[.,]/);
  if (i < 0) return limpo;
  // o primeiro separador fica; do resto sobram só dígitos
  return limpo.slice(0, i + 1) + limpo.slice(i + 1).replace(/[^\d]/g, "");
}

/**
 * Texto para número, com a regra de que o que não é número finito é AUSÊNCIA de medida.
 *
 * É a segunda barreira, para o valor que chega sem passar pelo teclado: colar, preenchimento
 * automático do navegador, dado vindo de fora. NaN não pode existir dentro de uma medida:
 * ele não é null, então passa por todo teste `!= null` do produto, e some sozinho quando o
 * registro atravessa JSON até o banco.
 */
export function numeroOuAusente(texto: string): number | undefined {
  if (texto.trim() === "") return undefined;
  const n = Number(texto.replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
}
