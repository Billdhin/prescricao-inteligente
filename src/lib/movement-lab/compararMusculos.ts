/**
 * A COMPARAÇÃO QUE O PROFISSIONAL FAZ DE VERDADE: músculo por músculo.
 *
 * A aba Comparar do Laboratório mostrava três parâmetros lado a lado (ativação relativa do
 * alvo principal, índice de eficiência e complexidade técnica). O Filipe cobrou duas vezes, e
 * a segunda com a pergunta que resolve o desenho: "será que essa marcha aquática ativa mais o
 * glúteo máximo do que o leg press 45°?". Nenhum dos três parâmetros responde isso.
 *
 * O parâmetro "Ativação relativa" respondia ainda menos do que parecia: ele pegava o
 * `ativacao[0]` de cada exercício, que é o ALVO PRINCIPAL de cada um. Comparar o quadríceps de
 * um com o peitoral do outro não é comparação, e a própria tela precisava de um parágrafo para
 * avisar disso. Aqui a linha é o MÚSCULO, e os dois números da linha são sempre do mesmo
 * músculo, então a comparação é legítima por construção, não por ressalva.
 *
 * POR QUE COMPARAR O MESMO MÚSCULO É LEGÍTIMO E COMPARAR MÚSCULOS DIFERENTES NÃO É. A escala
 * de ativação é relativa ao PRÓPRIO músculo (`metricasGlossario`, id "ativacao"): "Quadríceps
 * 78" quer dizer que o quadríceps trabalha perto de 78% da capacidade dele neste exercício.
 * Dois exercícios medidos no mesmo músculo compartilham o referencial; dois músculos
 * diferentes não compartilham nada.
 *
 * AUSÊNCIA NÃO É ZERO. Músculo que não está entre os alvos declarados de um exercício não vira
 * 0 nem "baixa": vira lado sem dado. É a mesma regra que já vale na base inteira, e ela existe
 * porque valor ausente virando número já coroou "melhor" em cima de chute neste produto.
 *
 * O LIMIAR PARA DIZER "ATIVA MAIS" É ESCOLHA DECLARADA DA CASA. Os valores são estimativa a
 * partir de literatura de EMG comparada, não medida do aluno. Coroar um vencedor por 1 ponto
 * de diferença seria precisão falsa. Abaixo do limiar, a linha mostra os dois números e não
 * declara vencedor nenhum, que é a leitura honesta de "os dois ativam parecido".
 */

import type { Exercise, Papel } from "@/data/types";

/**
 * Diferença mínima, em pontos de 0 a 100, para afirmar que um exercício ativa MAIS que o
 * outro. Escolha prudente da casa, não número de estudo: ver o cabeçalho deste arquivo.
 */
export const LIMIAR_ATIVA_MAIS = 10;

export interface LadoMusculo {
  valor: number;
  papel: Papel;
}

export interface LinhaMusculo {
  musculo: string;
  /** ausente = este exercício não declara o músculo entre os alvos dele (NÃO é zero) */
  a?: LadoMusculo;
  b?: LadoMusculo;
  /** só existe quando os DOIS têm dado e a diferença passa de LIMIAR_ATIVA_MAIS */
  maisAtivado?: "a" | "b";
  /** diferença absoluta entre os dois, só quando os dois têm dado */
  diferenca?: number;
}

export interface ComparacaoMuscular {
  /** músculos medidos nos DOIS exercícios: são as comparações legítimas */
  nosDois: LinhaMusculo[];
  /** medidos em apenas um dos dois: aparecem como dado de um só, sem confronto */
  soEmUm: LinhaMusculo[];
}

/** O maior valor da linha, para ordenar. Linha sem nenhum lado não existe. */
function pico(l: LinhaMusculo): number {
  return Math.max(l.a?.valor ?? -1, l.b?.valor ?? -1);
}

/**
 * Compara dois exercícios músculo a músculo.
 *
 * Todo músculo declarado por A ou por B aparece EXATAMENTE UMA VEZ no resultado, em uma das
 * duas listas. Nada é descartado em silêncio: um músculo que só um dos dois trabalha é
 * informação, e some da tela se a função filtrar por conveniência.
 */
export function compararMusculos(a: Exercise, b: Exercise): ComparacaoMuscular {
  const nomes = new Set<string>();
  for (const m of a.ativacao) nomes.add(m.musculo);
  for (const m of b.ativacao) nomes.add(m.musculo);

  const lado = (e: Exercise, musculo: string): LadoMusculo | undefined => {
    const achado = e.ativacao.find((x) => x.musculo === musculo);
    return achado ? { valor: achado.percentual, papel: achado.papel } : undefined;
  };

  const nosDois: LinhaMusculo[] = [];
  const soEmUm: LinhaMusculo[] = [];

  for (const musculo of nomes) {
    const ladoA = lado(a, musculo);
    const ladoB = lado(b, musculo);
    if (ladoA && ladoB) {
      const diferenca = Math.abs(ladoA.valor - ladoB.valor);
      nosDois.push({
        musculo,
        a: ladoA,
        b: ladoB,
        diferenca,
        maisAtivado: diferenca >= LIMIAR_ATIVA_MAIS ? (ladoA.valor > ladoB.valor ? "a" : "b") : undefined,
      });
    } else {
      soEmUm.push({ musculo, a: ladoA, b: ladoB });
    }
  }

  // Maior ativação primeiro; nome como desempate para a ordem não depender da ordem do Set.
  const ordenar = (x: LinhaMusculo, y: LinhaMusculo) => pico(y) - pico(x) || x.musculo.localeCompare(y.musculo, "pt-BR");
  nosDois.sort(ordenar);
  soEmUm.sort(ordenar);
  return { nosDois, soEmUm };
}
