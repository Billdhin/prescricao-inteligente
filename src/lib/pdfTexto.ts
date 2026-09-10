/**
 * TEXTO DO PAPEL: como número e referência se escrevem nos documentos impressos.
 *
 * O papel vai para a mão do aluno e para a pasta do profissional, em português. Três
 * coisas escapavam disso em 10/09/2026, medidas nos PDFs gerados:
 *
 * - número com ponto decimal: "80.4kg", "27.5%", "+23.0 / 23.0". \`String(80.4)\` e
 *   \`toFixed\` escrevem no formato americano, e cada gerador fazia o seu;
 * - unidade grudada no número: "81kg", "64bpm". Em português se separa ("81 kg"), com a
 *   exceção de uso do "%", que fica colado;
 * - "et al.." e "ed..": autor e título às vezes já terminam em ponto ("et al.", "11ª ed."), e o
 *   gerador somava outro ponto de separação.
 */

/** 80.4 vira "80,4"; inteiro fica inteiro. `casas` fixa as casas decimais quando pedido. */
export function numeroBR(v: number, casas?: number): string {
  const texto = casas != null ? v.toFixed(casas) : String(v);
  return texto.replace(".", ",");
}

/** "80,4 kg", "27,5%", "64 bpm": a unidade separada por espaço, menos o por cento. */
export function comUnidade(v: string, unidade: string): string {
  if (!unidade) return v;
  return unidade.trim() === "%" ? `${v}%` : `${v} ${unidade.trim()}`;
}

/** Sem o ponto final, para o gerador pôr o dele: "et al." não vira "et al.." e "11ª ed." não vira "ed..". */
export function semPontoFinal(texto: string): string {
  return texto.replace(/\.+\s*$/, "");
}
