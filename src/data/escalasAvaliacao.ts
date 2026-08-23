/**
 * As ESCALAS de referência dos parâmetros da avaliação.
 *
 * Pedido do fundador: "na parte de Avaliações, seria interessante ter um
 * hiperlink com as escalas dos parâmetros. Por exemplo, relação cintura-quadril
 * de 0,82 é bom, ruim ou muito ruim? Qual é a escala?"
 *
 * Ele tem razão sobre o problema: o app registrava número e não dizia onde
 * aquele número cai. Só que a solução tem uma regra dura, e ela é a mesma do
 * resto do produto: **escala sem fonte verificada não existe aqui**. Inventar
 * uma tabela de faixas é pior do que não ter tabela, porque o profissional
 * assina embaixo. Por isso cada escala carrega `refIds` de referências que
 * existem em src/data/referencias.ts com DOI conferido, e o guardrail
 * check:escalas reprova qualquer faixa sem fonte.
 *
 * Consequência honesta: parâmetros cuja escala eu não consegui ancorar em fonte
 * verificada (percentual de gordura e relação cintura-quadril, entre eles)
 * simplesmente NÃO aparecem com faixa. A tela mostra o número medido e a
 * evolução dele, sem fingir um veredito.
 *
 * `classificar` é puro: mesmo valor, mesma faixa, sempre.
 */

import type { Sexo } from "@/data/alunos";

/** Como a faixa deve ser lida em cor e em palavra (nunca só em cor). */
export type TomFaixa = "bom" | "atencao" | "alerta";

export interface FaixaEscala {
  /** Limite INFERIOR inclusivo da faixa. A primeira faixa costuma usar -Infinity. */
  de: number;
  /** Limite SUPERIOR exclusivo. A última faixa usa Infinity. */
  ate: number;
  rotulo: string;
  tom: TomFaixa;
  /** O que fazer com essa leitura, quando há algo a dizer. */
  conduta?: string;
}

export interface EscalaAvaliacao {
  /** Chave da medida em Avaliacao.medidas, ou id derivado (ex.: "imc"). */
  id: string;
  nome: string;
  unidade: string;
  /**
   * Faixas por sexo, quando o corte é diferente, ou `geral` quando não é. Sem
   * `geral` e sem o sexo do aluno declarado, a escala NÃO classifica: um corte de
   * homem aplicado a uma mulher é um erro clínico silencioso.
   */
  faixas: { geral?: FaixaEscala[]; masculino?: FaixaEscala[]; feminino?: FaixaEscala[] };
  /** O que a escala mede e para que serve, em uma frase. */
  oQueMede: string;
  /** O limite dela: toda escala tem um, e escondê-lo é vender certeza falsa. */
  limite: string;
  /** Ids de src/data/referencias.ts. Obrigatório: sem fonte, sem escala. */
  refIds: string[];
}

export const escalasAvaliacao: EscalaAvaliacao[] = [
  {
    id: "imc",
    nome: "Índice de massa corporal (IMC)",
    unidade: "kg/m²",
    oQueMede:
      "Peso corrigido pela altura. Serve de TRIAGEM populacional de excesso de peso, e é o corte que o classificador usa para sugerir o direcionamento por obesidade.",
    limite:
      "Não distingue massa magra de gordura nem diz onde a gordura está. Pessoa muito musculosa cai em faixa alta sem excesso de gordura, e pessoa magra com pouca massa muscular pode cair em faixa normal. O IMC sugere, quem confirma é a avaliação inteira.",
    refIds: ["seidell-flegal-1997", "who-imc-2004"],
    faixas: {
      geral: [
        { de: -Infinity, ate: 18.5, rotulo: "Abaixo do peso", tom: "atencao" },
        { de: 18.5, ate: 25, rotulo: "Peso adequado", tom: "bom" },
        { de: 25, ate: 30, rotulo: "Sobrepeso", tom: "atencao" },
        {
          de: 30,
          ate: 35,
          rotulo: "Obesidade grau I",
          tom: "alerta",
          conduta: "Faixa que dispara a sugestão de direcionamento por obesidade grau I.",
        },
        {
          de: 35,
          ate: 40,
          rotulo: "Obesidade grau II",
          tom: "alerta",
          conduta: "Faixa que dispara a sugestão de direcionamento por obesidade grau II.",
        },
        {
          de: 40,
          ate: Infinity,
          rotulo: "Obesidade grau III",
          tom: "alerta",
          conduta: "Faixa que dispara a sugestão de direcionamento por obesidade grau III.",
        },
      ],
    },
  },
  {
    id: "pressaoSistolica",
    nome: "Pressão arterial sistólica",
    unidade: "mmHg",
    oQueMede:
      "A pressão no momento em que o coração ejeta o sangue. Junto da diastólica, classifica a pressão de consultório em adultos.",
    limite:
      "Uma medida isolada não classifica ninguém: a diretriz classifica por medidas repetidas, em condições padronizadas. E quem define o estágio é o MAIOR dos dois valores, sistólico ou diastólico, então ler a sistólica sozinha subestima parte dos casos.",
    refIds: ["sbc-2020"],
    faixas: {
      geral: [
        { de: -Infinity, ate: 140, rotulo: "Não caracteriza hipertensão", tom: "bom" },
        { de: 140, ate: 160, rotulo: "Faixa de estágio 1", tom: "atencao" },
        { de: 160, ate: 180, rotulo: "Faixa de estágio 2", tom: "alerta" },
        {
          de: 180,
          ate: Infinity,
          rotulo: "Faixa de estágio 3",
          tom: "alerta",
          conduta:
            "A partir de 180 por 110 mmHg a orientação é adiar a sessão e recomendar avaliação médica, não prescrever treino.",
        },
      ],
    },
  },
  {
    id: "pressaoDiastolica",
    nome: "Pressão arterial diastólica",
    unidade: "mmHg",
    oQueMede: "A pressão entre as contrações, com o coração enchendo de novo.",
    limite:
      "Vale a mesma ressalva da sistólica: medida isolada não classifica, e o estágio é dado pelo MAIOR dos dois valores.",
    refIds: ["sbc-2020"],
    faixas: {
      geral: [
        { de: -Infinity, ate: 90, rotulo: "Não caracteriza hipertensão", tom: "bom" },
        { de: 90, ate: 100, rotulo: "Faixa de estágio 1", tom: "atencao" },
        { de: 100, ate: 110, rotulo: "Faixa de estágio 2", tom: "alerta" },
        {
          de: 110,
          ate: Infinity,
          rotulo: "Faixa de estágio 3",
          tom: "alerta",
          conduta:
            "A partir de 180 por 110 mmHg a orientação é adiar a sessão e recomendar avaliação médica, não prescrever treino.",
        },
      ],
    },
  },
];

export function getEscala(id: string): EscalaAvaliacao | undefined {
  return escalasAvaliacao.find((e) => e.id === id);
}

/**
 * Em que faixa o valor cai, para o sexo declarado.
 *
 * Devolve `undefined` quando a escala exige sexo e o aluno não o declarou: dizer
 * "bom" com o corte errado é pior do que não dizer nada.
 */
export function faixasDe(escala: EscalaAvaliacao, sexo?: Sexo): FaixaEscala[] | undefined {
  return (
    escala.faixas.geral ??
    (sexo === "M" ? escala.faixas.masculino : sexo === "F" ? escala.faixas.feminino : undefined)
  );
}

export function classificarNaEscala(
  escala: EscalaAvaliacao,
  valor: number,
  sexo?: Sexo,
): FaixaEscala | undefined {
  const porSexo = faixasDe(escala, sexo);
  if (!porSexo) return undefined;
  return porSexo.find((f) => valor >= f.de && valor < f.ate);
}

/** IMC a partir de peso (kg) e altura (cm ou m). Sem os dois, não há IMC. */
export function calcularImc(pesoKg?: number, altura?: number): number | undefined {
  if (!pesoKg || !altura) return undefined;
  // A altura é digitada ora em cm (170), ora em metros (1,70). Normaliza sem chutar.
  const m = altura > 3 ? altura / 100 : altura;
  if (m <= 0) return undefined;
  return +(pesoKg / (m * m)).toFixed(1);
}
