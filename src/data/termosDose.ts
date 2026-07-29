/**
 * Os TERMOS DA DOSE explicados no lugar onde eles aparecem.
 *
 * Nasce de um recado do fundador: "esse RIR 2 é uma variável importante, mas a
 * maioria dos profissionais nem sabe o que ele é (repetições em reserva). Se puder
 * colocar abaixo ou um hiperlink explicando o conceito e como aplicar esse RIR."
 *
 * O problema é maior que o RIR: a linha de dose de uma sessão mistura Alvo, Carga,
 * RIR e Intervalo, e cada rótulo carrega uma convenção diferente. Um glossário na
 * outra ponta do app não resolve, porque a dúvida nasce olhando o número. Então o
 * rótulo explica a si mesmo, ali.
 *
 * Regras do conteúdo:
 * - `oQueE` define, `comoAplicar` diz o que FAZER com o número, `armadilha` diz o
 *   erro que o número costuma provocar. Três campos, sempre, para o texto não virar
 *   um parágrafo solto.
 * - `refIds` só existe onde há AFIRMAÇÃO empírica. Definição de convenção (o que é
 *   "3 x 12") não precisa de referência, e forçar uma seria citação decorativa.
 * - Onde há aula no Aprender, `aula` leva para ela. O termo não vira um beco.
 */

export type TermoDoseId = "rir" | "carga" | "alvo" | "intervalo" | "pse";

export interface TermoDose {
  id: TermoDoseId;
  /** Rótulo exibido na linha de dose (o que o profissional está olhando). */
  rotulo: string;
  /** Nome por extenso, que é justamente o que costuma faltar. */
  porExtenso: string;
  oQueE: string;
  comoAplicar: string;
  armadilha: string;
  /** Ids de src/data/referencias.ts. Vazio quando o termo é convenção, não afirmação. */
  refIds: string[];
  /** Rota do Aprender que aprofunda, quando existe. */
  aula?: string;
}

export const termosDose: TermoDose[] = [
  {
    id: "rir",
    rotulo: "RIR",
    porExtenso: "Repetições em reserva",
    oQueE:
      "Quantas repetições o aluno ainda conseguiria fazer, com boa técnica, no momento em que encerrou a série. RIR 2 quer dizer que ele parou faltando cerca de duas. É a medida direta de quão perto da falha a série ficou.",
    comoAplicar:
      "Ao fim da série, pergunte: quantas você ainda faria? A resposta é o RIR daquela série. Bateu o alvo, a carga está calibrada. Veio bem acima do alvo em todas as séries, a carga está leve. Veio abaixo, a carga está pesada para o dia, e isso vale mais que o número no papel. Com a escala de Zourdos (2016), RIR 2 equivale a PSE 8.",
    armadilha:
      "Confundir com as repetições prescritas. RIR 2 não é fazer 2 repetições: é sobrar 2. E RIR mais BAIXO significa esforço MAIOR, ao contrário da carga, que sobe junto com o esforço.",
    refIds: ["zourdos-rir-2016"],
    aula: "/aprender/conteudos/forca-repeticoes-em-reserva",
  },
  {
    id: "carga",
    rotulo: "Carga",
    porExtenso: "Percentual de uma repetição máxima (%1RM)",
    oQueE:
      "A carga da série expressa como percentual do maior peso que o aluno levanta uma única vez naquele exercício. 75% de 1RM significa três quartos desse peso.",
    comoAplicar:
      "Serve para transportar a intensidade entre exercícios e entre semanas sem depender do peso absoluto. Quando não há teste de 1RM, use a faixa de repetições e o RIR como guia equivalente, em vez de estimar o 1RM no olho.",
    armadilha:
      "Tratar o percentual como se fosse fixo. O 1RM varia com sono, alimentação e fase do ciclo de treino, e por isso a carga do dia se confirma pelo RIR, não pela tabela.",
    refIds: ["schoenfeld-carga-2017"],
  },
  {
    id: "alvo",
    rotulo: "Alvo",
    porExtenso: "Séries por repetições da semana",
    oQueE:
      "O número concreto desta semana, dentro da faixa citada pela referência. Alvo 3 x 12 quer dizer três séries de doze repetições nesta semana; a faixa continua sendo a mesma.",
    comoAplicar:
      "É o que vai no papel do aluno. Ele muda de semana para semana conforme a tendência do bloco, e é por isso que a sessão não se repete igual.",
    armadilha:
      "Ler o alvo como teto. Ele é o ponto de partida da semana; a execução real (RIR, dor, adesão) é que decide se ele sobe, fica ou desce.",
    refIds: [],
  },
  {
    id: "intervalo",
    rotulo: "Intervalo",
    porExtenso: "Descanso entre as séries",
    oQueE: "O tempo de pausa entre uma série e a seguinte do mesmo exercício.",
    comoAplicar:
      "Conte do fim de uma série ao início da próxima. Intervalos mais curtos aumentam a demanda metabólica e derrubam as repetições da série seguinte; mais longos preservam a carga.",
    armadilha:
      "Deixar o intervalo à deriva e depois estranhar a queda de repetições. Se o número de repetições cai série a série, o intervalo é a primeira variável a conferir, antes da carga.",
    refIds: [],
  },
  {
    id: "pse",
    rotulo: "PSE",
    porExtenso: "Percepção subjetiva de esforço",
    oQueE:
      "O quanto o esforço foi percebido pelo aluno, numa escala. É o instrumento que guia a intensidade quando a frequência cardíaca não serve, e o que o aluno registra ao fim da sessão.",
    comoAplicar:
      "Pergunte logo depois da sessão, sempre com a mesma âncora de escala. A PSE da sessão inteira, multiplicada pela duração, dá a carga interna da sessão (Foster, 2001), que é o que permite comparar semanas.",
    armadilha:
      "Trocar a âncora sem avisar. Perguntar 'de 0 a 10' num dia e 'de 6 a 20' no outro transforma a série histórica em ruído.",
    refIds: ["borg-1982", "foster-2001"],
  },
];

export function getTermoDose(id: TermoDoseId): TermoDose | undefined {
  return termosDose.find((t) => t.id === id);
}

/**
 * O rótulo que aparece na linha de dose tem um termo explicável?
 * Case-insensitive porque o mesmo rótulo aparece com caixas diferentes nas telas.
 */
export function termoDoRotulo(rotulo: string): TermoDose | undefined {
  const alvo = rotulo.trim().toLowerCase();
  return termosDose.find((t) => t.rotulo.toLowerCase() === alvo);
}
