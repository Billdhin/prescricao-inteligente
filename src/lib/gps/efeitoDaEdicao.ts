/**
 * O QUE A SUA EDIÇÃO MUDOU, dito em número e na hora.
 *
 * Nasce de um defeito de campo. Um professor acrescentou quatro exercícios de membro
 * superior numa sessão, olhou a linha de intensidade mexer 2,3% e concluiu que o gráfico não
 * estava acompanhando a edição. O gráfico estava certo: o volume daquela semana subiu 23%.
 *
 * O erro não foi dele. Ele fez a pergunta "a minha edição pegou?" e a tela respondia outra
 * coisa: "como volume e esforço evoluem ao longo do mesociclo". São perguntas diferentes, e
 * a segunda não contém a primeira. O gráfico mostra a CURVA; ninguém guarda de memória onde
 * a curva estava dois segundos atrás para calcular a diferença de cabeça.
 *
 * Este módulo responde a pergunta que foi feita: comparar a semana antes e depois do gesto e
 * devolver a diferença nas duas agregações, com a frase que explica por que elas se movem de
 * formas diferentes. Ele NÃO substitui o gráfico, que continua respondendo a pergunta da
 * evolução; ele preenche o vão entre o gesto e a leitura.
 *
 * Irmão de `diffPlano`, que responde "o que muda para o ALUNO" na hora de publicar, por
 * exercício e estrutura. Aqui a pergunta é do PROFESSOR e a unidade é a DOSE da semana.
 */
import type { Microciclo } from "@/data/periodizacao";
import { agregadoSemana } from "@/lib/gps/progressao";

export interface EfeitoDaEdicao {
  semana: number;
  volumeAntes: number;
  volumeDepois: number;
  /** variação percentual do volume; null quando o valor de partida era zero */
  deltaVolume: number | null;
  esforcoAntes: number | null;
  esforcoDepois: number | null;
  deltaEsforco: number | null;
  exerciciosAntes: number;
  exerciciosDepois: number;
  /**
   * A frase que evita a leitura errada. Só existe quando as duas agregações se moveram de
   * formas DESIGUAIS, que é exatamente o caso em que alguém conclui que a tela está quebrada.
   */
  leitura?: string;
}

const contarBlocos = (m: Microciclo) => m.sessoes.reduce((n, s) => n + s.blocos.length, 0);

/** Variação percentual, arredondada a uma casa. Null quando não há base de comparação. */
const variacao = (antes: number | null, depois: number | null): number | null => {
  if (antes == null || depois == null || antes === 0) return null;
  return Math.round(((depois - antes) / antes) * 1000) / 10;
};

/**
 * A DISCORDÂNCIA É PROPORCIONAL, não um número fixo.
 *
 * A primeira versão chamava de "parado" o que variava menos de 1%, e o caso real de campo
 * (volume +18,9%, esforço +1,3%) passava batido justamente na situação que o módulo existe
 * para explicar. Um limiar absoluto não sabe comparar magnitudes: 1,3% ao lado de 19% é
 * "não se mexeu"; 1,3% ao lado de 2% é ruído comum às duas.
 *
 * A regra passou a ser relativa: uma agregação se moveu de verdade (>= 5%) e a outra andou
 * menos de um terço disso. Aí as duas discordaram, e é aí que a tela parece quebrada.
 */
const mexeu = (d: number | null) => d != null && Math.abs(d) >= 5;
const ficouParadoAoLado = (d: number | null, outro: number | null) =>
  outro != null && (d == null || Math.abs(d) < Math.abs(outro) / 3);

/**
 * Compara a mesma semana antes e depois de uma edição.
 *
 * Devolve null quando nada mensurável mudou: um painel que aparece a cada tecla vira ruído e
 * deixa de ser lido justamente quando importa.
 */
export function efeitoDaEdicao(antes: Microciclo, depois: Microciclo): EfeitoDaEdicao | null {
  const a = agregadoSemana(antes);
  const b = agregadoSemana(depois);
  const exAntes = contarBlocos(antes);
  const exDepois = contarBlocos(depois);

  const deltaVolume = variacao(a.volume, b.volume);
  const deltaEsforco = variacao(a.intensidade, b.intensidade);

  const nadaMudou =
    a.volume === b.volume && a.intensidade === b.intensidade && exAntes === exDepois;
  if (nadaMudou) return null;

  /*
   * A LEITURA. Escrita só para os casos em que as duas linhas discordam, porque é aí que a
   * tela parece errada. Quando ambas sobem juntas, o número já se explica sozinho e uma frase
   * a mais seria paternalismo.
   */
  let leitura: string | undefined;
  if (mexeu(deltaVolume) && ficouParadoAoLado(deltaEsforco, deltaVolume)) {
    leitura =
      exDepois > exAntes
        ? "O esforço médio quase não muda porque você acrescentou mais trabalho no mesmo esforço. Volume é soma, esforço é média."
        : "O esforço médio quase não muda porque você tirou trabalho sem mudar o quanto o treino pesa. Volume é soma, esforço é média.";
  } else if (mexeu(deltaEsforco) && ficouParadoAoLado(deltaVolume, deltaEsforco)) {
    leitura =
      "O volume quase não muda porque você mexeu na dose, e não na quantidade de trabalho. Esforço é média, volume é soma.";
  } else if (deltaVolume != null && deltaEsforco != null && deltaVolume * deltaEsforco < 0) {
    leitura =
      "As duas linhas foram para lados opostos: uma soma e uma média reagem de formas diferentes ao mesmo gesto.";
  }

  return {
    semana: depois.semana,
    volumeAntes: a.volume,
    volumeDepois: b.volume,
    deltaVolume,
    esforcoAntes: a.intensidade,
    esforcoDepois: b.intensidade,
    deltaEsforco,
    exerciciosAntes: exAntes,
    exerciciosDepois: exDepois,
    leitura,
  };
}

/** "+23%", "-8%", "sem mudança". Formato único, para a tela e para o teste. */
export function formatarDelta(d: number | null): string {
  if (d == null) return "sem base de comparação";
  if (Math.abs(d) < 1) return "praticamente igual";
  return `${d > 0 ? "+" : ""}${d}%`;
}
