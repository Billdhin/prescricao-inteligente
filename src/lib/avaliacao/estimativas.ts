/**
 * ESTIMATIVAS FUNCIONAIS: transformar o que dá para medir em sala no número que
 * a prescrição usa.
 *
 * ## De onde veio
 *
 * Feedback de campo (31/07/2026): "seria interessante ter algumas avaliações
 * funcionais, a estimativa de repetição máxima, a estimativa do VO₂". O contexto
 * dele é consultoria a distância, onde teste direto raramente acontece: ninguém
 * vai levar o aluno a um ergoespirômetro, e testar 1RM de verdade em um iniciante
 * com comorbidade é justamente o que o produto inteiro desaconselha.
 *
 * A avaliação já registrava testes (`AvaliacaoTeste`), inclusive "Teste de Cooper"
 * e "Teste de 1RM" na lista de sugestões. O que faltava era a CONTA: o
 * profissional media a distância percorrida e ficava com uma distância, não com
 * um VO₂.
 *
 * ## A regra dura aqui
 *
 * Estimativa é número derivado, e número derivado sem fonte é chute com casa
 * decimal. Por isso cada estimativa carrega:
 *   - a FÓRMULA escrita por extenso, visível na tela (não escondida no código);
 *   - `refIds` de referências que EXISTEM em `referencias.ts` e foram conferidas
 *     no PubMed uma a uma;
 *   - o LIMITE dela, sempre, porque toda equação de campo tem um;
 *   - `ressalva` quando os valores digitados caem onde a equação perde precisão.
 *
 * O guardrail `check:estimativas` trava fonte ausente, domínio sem validação e
 * regressão de conta (as três equações são reconferidas contra valores conhecidos
 * a cada rodada do CI).
 *
 * ## Por que Epley, e não Brzycki
 *
 * Porque a casa já declara Epley no glossário (`library.ts`, termo "1RM"), e ter
 * duas fórmulas diferentes para o mesmo número no mesmo produto é pior do que ter
 * a fórmula menos famosa. O que a evidência sustenta não é "qual equação", é o
 * LIMITE: a predição de 1RM a partir de repetições até a fadiga é mais precisa
 * abaixo de 10 repetições (Mayhew 2008). É esse limite que o app avisa.
 */

export type EstimativaId = "rm-epley" | "vo2-cooper" | "vo2-rockport";

export type TipoCampo = "numero" | "sexo";

export interface CampoEstimativa {
  chave: string;
  rotulo: string;
  unidade: string;
  placeholder: string;
  tipo: TipoCampo;
  /** domínio aceito. Fora dele a estimativa não sai: equação de campo extrapolada mente. */
  min: number;
  max: number;
  /** de qual medida da própria avaliação este campo pode nascer preenchido */
  vemDe?: "peso" | "idade";
}

export interface ResultadoEstimativa {
  /** null quando falta dado ou algum valor está fora do domínio */
  valor: number | null;
  /** por que não deu, na voz do profissional */
  erro?: string;
  /** deu, mas leia com cuidado */
  ressalva?: string;
}

export interface Estimativa {
  id: EstimativaId;
  nome: string;
  /** o que o profissional mede em sala para alimentar isto */
  oQueMede: string;
  /** categoria do teste gerado, alinhada a TESTE_CATEGORIAS da avaliação */
  categoria: string;
  /** nome do teste gerado no histórico */
  nomeTeste: string;
  unidade: string;
  campos: CampoEstimativa[];
  /** a conta, por extenso, do jeito que é impressa na tela */
  formula: string;
  /** o limite dela. Toda equação de campo tem um, e escondê-lo vende certeza falsa. */
  limite: string;
  /** ids de src/data/referencias.ts. Sem fonte, sem estimativa. */
  refIds: string[];
  calcular: (v: Record<string, number>) => ResultadoEstimativa;
}

const LIBRAS_POR_KG = 2.20462;

/** Arredonda para uma casa, que é a precisão que estas equações comportam. */
const uma = (n: number) => Math.round(n * 10) / 10;

/** Todos os campos preenchidos e dentro do domínio? Devolve o erro da primeira falha. */
function validar(campos: CampoEstimativa[], v: Record<string, number>): string | null {
  for (const c of campos) {
    const x = v[c.chave];
    if (x == null || Number.isNaN(x)) return `Falta ${c.rotulo.toLowerCase()}.`;
    if (x < c.min || x > c.max) {
      return `${c.rotulo} fora da faixa que a equação cobre (${c.min} a ${c.max} ${c.unidade}). Fora dela a estimativa deixa de valer.`;
    }
  }
  return null;
}

export const estimativas: Estimativa[] = [
  {
    id: "rm-epley",
    nome: "Repetição máxima estimada (1RM)",
    oQueMede:
      "Uma série levada até a fadiga com carga submáxima. Serve para prescrever percentual de 1RM sem testar carga máxima.",
    categoria: "Força",
    nomeTeste: "1RM estimado",
    unidade: "kg",
    campos: [
      { chave: "carga", rotulo: "Carga usada", unidade: "kg", placeholder: "Ex.: 40", tipo: "numero", min: 1, max: 500 },
      { chave: "reps", rotulo: "Repetições até a fadiga", unidade: "repetições", placeholder: "Ex.: 8", tipo: "numero", min: 1, max: 20 },
    ],
    formula: "1RM ≈ carga × (1 + repetições ÷ 30)",
    limite:
      "É estimativa de uma série só, no exercício testado: não se transfere para outro exercício nem para outro dia. A precisão cai conforme o número de repetições sobe.",
    refIds: ["mayhew-2008"],
    calcular(v) {
      const erro = validar(this.campos, v);
      if (erro) return { valor: null, erro };
      const { carga, reps } = v;
      // Uma repetição até a fadiga JÁ É o 1RM medido, e a equação não se aplica
      // (ela devolveria 3% a mais que a carga que o aluno de fato levantou).
      if (reps === 1) {
        return {
          valor: uma(carga),
          ressalva: "Com uma repetição até a fadiga, a carga já é o próprio 1RM medido: não há estimativa a fazer.",
        };
      }
      const valor = uma(carga * (1 + reps / 30));
      if (reps > 10) {
        return {
          valor,
          ressalva:
            "Acima de 10 repetições até a fadiga a predição de 1RM perde precisão (Mayhew, 2008). Para prescrever percentual de carga, prefira repetir o teste com carga maior e menos repetições.",
        };
      }
      return { valor };
    },
  },
  {
    id: "vo2-rockport",
    nome: "VO₂ máximo estimado (caminhada de 1 milha)",
    oQueMede:
      "O tempo para caminhar 1.609 metros o mais rápido possível, sem correr, e a frequência cardíaca ao terminar. É o teste de campo viável para quem não corre.",
    categoria: "Capacidade cardiorrespiratória",
    nomeTeste: "VO₂ estimado (caminhada de 1 milha)",
    unidade: "mL/kg/min",
    campos: [
      { chave: "tempo", rotulo: "Tempo da caminhada", unidade: "minutos", placeholder: "Ex.: 13,5", tipo: "numero", min: 8, max: 30 },
      { chave: "fc", rotulo: "Frequência cardíaca ao terminar", unidade: "bpm", placeholder: "Ex.: 140", tipo: "numero", min: 60, max: 220 },
      { chave: "peso", rotulo: "Peso corporal", unidade: "kg", placeholder: "Ex.: 72", tipo: "numero", min: 30, max: 250, vemDe: "peso" },
      { chave: "idade", rotulo: "Idade", unidade: "anos", placeholder: "Ex.: 45", tipo: "numero", min: 18, max: 90, vemDe: "idade" },
      { chave: "sexo", rotulo: "Sexo", unidade: "", placeholder: "", tipo: "sexo", min: 0, max: 1 },
    ],
    formula:
      "VO₂ (L/min) = 6,9652 + (0,0091 × peso em libras) − (0,0257 × idade) + (0,5955 × sexo) − (0,2240 × tempo em minutos) − (0,0115 × FC final), com sexo = 1 para homens e 0 para mulheres. O resultado em L/min é dividido pelo peso para virar mL/kg/min.",
    limite:
      "Foi construída em adultos caminhando, não correndo: se o aluno correr parte do percurso, a estimativa deixa de valer. Betabloqueador altera a frequência cardíaca e derruba a validade da equação, que usa a FC como entrada.",
    refIds: ["kline-1987"],
    calcular(v) {
      const erro = validar(this.campos, v);
      if (erro) return { valor: null, erro };
      const { tempo, fc, peso, idade, sexo } = v;
      const litrosPorMin =
        6.9652 + 0.0091 * (peso * LIBRAS_POR_KG) - 0.0257 * idade + 0.5955 * sexo - 0.224 * tempo - 0.0115 * fc;
      if (litrosPorMin <= 0) {
        return {
          valor: null,
          erro: "Com esses valores a equação devolve consumo negativo, o que significa que a combinação está fora do que ela cobre. Confira tempo e frequência cardíaca.",
        };
      }
      const valor = uma((litrosPorMin * 1000) / peso);
      if (fc < 100) {
        return {
          valor,
          ressalva:
            "Frequência cardíaca final baixa costuma indicar que a caminhada não foi vigorosa o bastante, e aí a estimativa sai otimista. O teste pede caminhar o mais rápido possível.",
        };
      }
      return { valor };
    },
  },
  {
    id: "vo2-cooper",
    nome: "VO₂ máximo estimado (12 minutos)",
    oQueMede:
      "A distância percorrida em 12 minutos, correndo ou caminhando o mais rápido possível. Exige aluno destreinado apto a esforço intenso.",
    categoria: "Capacidade cardiorrespiratória",
    nomeTeste: "VO₂ estimado (teste de 12 minutos)",
    unidade: "mL/kg/min",
    campos: [
      { chave: "distancia", rotulo: "Distância em 12 minutos", unidade: "metros", placeholder: "Ex.: 2200", tipo: "numero", min: 800, max: 5000 },
    ],
    formula: "VO₂ (mL/kg/min) = (distância em metros − 504,9) ÷ 44,73",
    limite:
      "É teste de esforço máximo: não deve ser aplicado antes da liberação, nem em quem o semáforo do dia manda segurar. O trabalho de origem estabeleceu a correlação entre a distância e o VO₂ medido em esteira; a forma da equação em metros circula em versões ligeiramente diferentes, então trate o resultado como faixa, não como medida.",
    refIds: ["cooper-1968"],
    calcular(v) {
      const erro = validar(this.campos, v);
      if (erro) return { valor: null, erro };
      const valor = uma((v.distancia - 504.9) / 44.73);
      if (v.distancia < 1200) {
        return {
          valor,
          ressalva:
            "Distância curta em 12 minutos indica que o teste virou caminhada. Nessa faixa a caminhada de 1 milha estima melhor, porque foi construída exatamente para ela.",
        };
      }
      return { valor };
    },
  },
];

export function getEstimativa(id: EstimativaId): Estimativa | undefined {
  return estimativas.find((e) => e.id === id);
}

/**
 * O texto que vai para a observação do teste registrado. Existe para que a
 * estimativa fique auditável meses depois: quem abrir o histórico vê de onde o
 * número saiu, não só o número.
 */
export function memoriaDeCalculo(e: Estimativa, v: Record<string, number>): string {
  const entradas = e.campos
    .map((c) => {
      const x = v[c.chave];
      if (c.tipo === "sexo") return `sexo ${x === 1 ? "masculino" : "feminino"}`;
      return `${c.rotulo.toLowerCase()} ${String(x).replace(".", ",")}${c.unidade ? " " + c.unidade : ""}`;
    })
    .join(", ");
  return `Estimado a partir de ${entradas}. ${e.formula}`;
}
