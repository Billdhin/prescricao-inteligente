/**
 * A GEOMETRIA DA MINICURVA DE EVOLUÇÃO, em fonte única.
 *
 * Nasceu dentro do `Sparkline` da tela (EvolucaoMini). O documento impresso não tinha
 * gráfico nenhum e gastava metade da folha em branco; copiar a matemática para o gerador de
 * PDF seria repetir a conta em dois lugares, que é exatamente o que `pdfCores` existe para
 * impedir no caso da cor. Então a conta mudou de casa e os dois lados chamam esta função: a
 * tela pinta com os tokens do tema, o papel pinta com a paleta de `pdfCores`.
 *
 * As três regras do desenho continuam valendo, e são elas que o tornam honesto:
 *  - X PROPORCIONAL AO TEMPO: duas medidas em três semanas e duas em seis meses não
 *    desenham a mesma coisa.
 *  - SEGMENTOS RETOS entre pontos medidos: curva suave inventaria valor que não houve.
 *  - ESCALA VERTICAL DA PRÓPRIA MEDIDA (mínimo a máximo da série), e série plana no meio da
 *    caixa: colar no topo sugeriria uma variação que a medida não teve.
 */

export interface PontoEvolucao {
  data: number;
  valor: number;
}

export interface DesenhoEvolucao {
  largura: number;
  altura: number;
  /** caminho SVG dos segmentos entre os pontos medidos */
  d: string;
  /** posição de cada ponto, na ordem da série */
  pontos: { x: number; y: number }[];
}

export function desenharEvolucao(
  pontos: PontoEvolucao[],
  { largura = 132, altura = 26, margem = 3.5 }: { largura?: number; altura?: number; margem?: number } = {},
): DesenhoEvolucao {
  const n = pontos.length;
  const vals = pontos.map((p) => p.valor);
  const vmin = Math.min(...vals);
  const vmax = Math.max(...vals);
  const t0 = pontos[0]?.data ?? 0;
  const tN = pontos[n - 1]?.data ?? 0;
  const px = (p: PontoEvolucao, i: number) =>
    tN === t0 ? margem + (i / Math.max(n - 1, 1)) * (largura - 2 * margem) : margem + ((p.data - t0) / (tN - t0)) * (largura - 2 * margem);
  const py = (v: number) => (vmax === vmin ? altura / 2 : altura - margem - ((v - vmin) / (vmax - vmin)) * (altura - 2 * margem));

  const coords = pontos.map((p, i) => ({ x: +px(p, i).toFixed(1), y: +py(p.valor).toFixed(1) }));
  const d = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");
  return { largura, altura, d, pontos: coords };
}
