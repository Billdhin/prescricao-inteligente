/**
 * O FORMATO DO CARDIO MUDA O TREINO, NÃO SÓ O RÓTULO.
 *
 * O seletor de formato do editor gravava só o texto do campo `formato`. Trocar "Contínuo"
 * por "Intervalado de alta intensidade (HIIT)" deixava a duração, a intensidade e a
 * recuperação exatamente como estavam: o cartão dizia HIIT e prescrevia "15 a 25 min,
 * moderada, recuperação -", que é a prescrição do contínuo com outro nome. Foi o Filipe quem
 * pegou, e é a assinatura de sempre deste motor: a tela dizendo uma coisa e a dose fazendo
 * outra.
 *
 * Treino intervalado é série de esforço alto separada por recuperação, passiva ou ativa.
 * Então o formato precisa mexer em quatro coisas ao mesmo tempo: a BANDA de intensidade, o
 * TEMPO TOTAL de trabalho, a RECUPERAÇÃO entre os tiros e os ALVOS derivados (PSE, duração e
 * zona de FC), que ficariam contradizendo o texto novo.
 *
 * O QUE É DA DIRETRIZ E O QUE É DA CASA, declarado item a item:
 *
 * - A banda vigorosa (77 a 95% da FCmáx, RPE 7 a 8) é a do próprio catálogo de bandas, citada
 *   ao ACSM (Garber, 2011).
 * - A queda do tempo total pela metade vem da equivalência que a mesma diretriz publica: pelo
 *   menos 150 min por semana de intensidade moderada OU pelo menos 75 min de vigorosa.
 * - A DIVISÃO em tiros e a RAZÃO entre tiro e recuperação são escolha prudente da casa. A
 *   literatura usa razões que vão de 1 para 1 a 1 para 8 conforme a duração do tiro, então
 *   cravar um número como se fosse de diretriz seria invenção. O campo fica escrito, editável
 *   e declarado como ponto de partida.
 * - O aviso de supervisão do HIIT é da revisão Cochrane que o produto já cita.
 */

import { BANDAS_AEROBIAS, type BandaAerobia, type BlocoSessao } from "@/data/periodizacao";

export type FormatoAerobioId = "continuo" | "intervalado" | "hiit" | "fartlek" | "circuito";

export interface FormatoAerobio {
  id: FormatoAerobioId;
  /** rótulo exibido e gravado no campo `formato` (texto livre no modelo) */
  nome: string;
  /** banda de intensidade que este formato pede */
  banda: BandaAerobia;
  /**
   * O tempo do campo `duracao` passa a ser o tempo TOTAL DE TRABALHO (sem as recuperações) e
   * cai pela metade. Só nos formatos que sobem a banda para vigorosa, porque a equivalência
   * citada é entre moderada e vigorosa, e não entre formatos.
   */
  metadeDoTempo: boolean;
  /** texto do campo `recuperacao`; "-" quando o formato não tem recuperação programada */
  recuperacao: string;
  /** o que o profissional precisa ler antes de assinar este formato */
  nota: string;
  refIds: string[];
}

const NOTA_TIROS =
  "A divisão em tiros e a razão entre tiro e recuperação são escolha prudente da casa, não número de diretriz: a literatura usa razões que vão de 1 para 1 a 1 para 8 conforme a duração do tiro. Ajuste ao condicionamento do aluno.";

const NOTA_METADE =
  "O tempo escrito é o tempo TOTAL de trabalho, sem contar as recuperações, e ele cai pela metade porque o ACSM (Garber, 2011) equipara 150 min por semana de intensidade moderada a 75 min de vigorosa.";

export const FORMATOS_AEROBIOS: Record<FormatoAerobioId, FormatoAerobio> = {
  continuo: {
    id: "continuo",
    nome: "Contínuo",
    banda: "moderada",
    metadeDoTempo: false,
    recuperacao: "-",
    nota: "Ritmo sustentado do começo ao fim, sem tiros. É o formato padrão do motor.",
    refIds: ["garber-2011"],
  },
  intervalado: {
    id: "intervalado",
    nome: "Intervalado",
    banda: "vigorosa",
    metadeDoTempo: true,
    recuperacao: "Recuperação ATIVA em ritmo leve entre os tiros, na mesma duração do tiro (1 para 1)",
    nota: `Tiros em intensidade vigorosa separados por recuperação. ${NOTA_METADE} ${NOTA_TIROS}`,
    refIds: ["garber-2011"],
  },
  hiit: {
    id: "hiit",
    nome: "Intervalado de alta intensidade (HIIT)",
    banda: "vigorosa",
    metadeDoTempo: true,
    recuperacao: "Recuperação ATIVA em ritmo leve entre os tiros, de duração igual ou maior que a do tiro",
    nota:
      `Tiros curtos perto do teto da banda vigorosa, com recuperação entre eles. ${NOTA_METADE} ${NOTA_TIROS} ` +
      "CAUTELA ANTES DA ADAPTAÇÃO: na revisão Cochrane de 58 ensaios com adultos sedentários (Strauss, 2026), a diferença de aptidão contra o contínuo moderado é pequena e de baixa certeza, e TODOS os ensaios incluídos usaram intervalado SUPERVISIONADO. Os autores registram que nenhum estudo relatou eventos adversos e que não têm certeza de que eles foram monitorados. Prescreva com supervisão e com a liberação do dia em ordem.",
    refIds: ["garber-2011", "strauss-sedentario-2026"],
  },
  fartlek: {
    id: "fartlek",
    nome: "Fartlek",
    banda: "moderada",
    metadeDoTempo: false,
    recuperacao: "Sem recuperação cronometrada: o trecho em ritmo leve é a própria recuperação",
    nota:
      "Ritmo variado por sensação, alternando trechos fortes e leves sem cronômetro. A banda segue moderada porque o tempo em esforço alto não é controlado; quem quer dose vigorosa controlada usa o intervalado. Formato de organização da sessão, escolha da casa, sem número de diretriz.",
    refIds: ["garber-2011"],
  },
  circuito: {
    id: "circuito",
    nome: "Circuito",
    banda: "moderada",
    metadeDoTempo: false,
    recuperacao: "Transição entre estações, sem parada programada",
    nota:
      "Estações em sequência com transição curta. A banda segue moderada: o esforço é distribuído entre estações e não sustentado num tiro. Formato de organização da sessão, escolha da casa, sem número de diretriz.",
    refIds: ["garber-2011"],
  },
};

export const FORMATOS_AEROBIOS_LISTA = Object.values(FORMATOS_AEROBIOS);

/** Acha o formato pelo texto gravado no bloco; devolve undefined para texto fora da lista. */
export function formatoPeloNome(texto?: string): FormatoAerobio | undefined {
  const t = (texto ?? "").trim().toLowerCase();
  return FORMATOS_AEROBIOS_LISTA.find((f) => f.nome.toLowerCase() === t);
}

/** Lê "15 a 25 min" (ou "20 min") em minutos. Null quando o texto não traz número. */
function minutosDoTexto(texto?: string): { min: number; max: number } | null {
  if (!texto) return null;
  const faixa = texto.match(/(\d+(?:[.,]\d+)?)\s*(?:a|até)\s*(\d+(?:[.,]\d+)?)/i);
  if (faixa) return { min: Number(faixa[1].replace(",", ".")), max: Number(faixa[2].replace(",", ".")) };
  const solo = texto.match(/(\d+(?:[.,]\d+)?)/);
  return solo ? { min: Number(solo[1].replace(",", ".")), max: Number(solo[1].replace(",", ".")) } : null;
}

/**
 * Metade do tempo, arredondada PARA BAIXO em passos de 5 min e nunca abaixo de 5.
 *
 * Para baixo porque é a direção conservadora: menos tempo em intensidade vigorosa. O passo de
 * 5 min é o mesmo em que as faixas de duração deste produto já são escritas.
 */
function metade(iv: { min: number; max: number }): { min: number; max: number } {
  const corta = (v: number) => Math.max(5, Math.floor(v / 2 / 5) * 5);
  const min = corta(iv.min);
  return { min, max: Math.max(min, corta(iv.max)) };
}

function textoDeMinutos(iv: { min: number; max: number }): string {
  return iv.min === iv.max ? `${iv.min} min` : `${iv.min} a ${iv.max} min`;
}

/** Piso da faixa de RPE citada no texto da banda ("RPE 7 a 8 de 10" -> 7). */
function pisoRPE(texto: string): number | undefined {
  const m = texto.match(/RPE\s*(\d+)/i);
  return m ? Number(m[1]) : undefined;
}

/**
 * Aplica o formato ao bloco aeróbio, reescrevendo o que o formato de fato muda.
 *
 * A ida e a volta fecham: quando o bloco JÁ está num formato de tempo pela metade, a função
 * dobra a faixa antes de decidir a nova, então voltar para "Contínuo" devolve o tempo cheio
 * em vez de metade da metade. É a operação inversa exata do corte, e o guardrail cobra isso.
 *
 * A ZONA DE FC SAI quando a banda muda, e isso é de propósito. Ela é derivada do percentual
 * da FCmáx da banda ANTIGA, com a idade e a FCrep medidas do aluno; mantê-la ao lado de um
 * texto vigoroso seria mostrar uma zona moderada num bloco que pede esforço alto. Recalcular
 * exige dados que o editor não tem em mãos, e zona ausente é melhor que zona errada.
 */
export function aplicarFormatoAerobio(bloco: BlocoSessao, formato: FormatoAerobio): BlocoSessao {
  const anterior = formatoPeloNome(bloco.formato);
  const bandaMudou = BANDAS_AEROBIAS[formato.banda].intensidade !== bloco.intensidade;

  /*
   * Faixa de tempo CHEIA (a do contínuo). Vem de `duracaoBase`, gravada quando o bloco saiu do
   * contínuo; só quando ela falta (bloco antigo) é que a função dobra a faixa atual, e aí o
   * arredondamento do corte não é recuperável, o que está declarado em duracaoBase.
   */
  const atual = minutosDoTexto(bloco.duracao);
  const cheia = anterior?.metadeDoTempo
    ? (minutosDoTexto(bloco.duracaoBase) ?? (atual ? { min: atual.min * 2, max: atual.max * 2 } : null))
    : atual;
  const alvoIv = cheia ? (formato.metadeDoTempo ? metade(cheia) : cheia) : null;

  const intensidade = BANDAS_AEROBIAS[formato.banda].intensidade;
  const rpe = pisoRPE(intensidade);

  return {
    ...bloco,
    formato: formato.nome,
    duracao: alvoIv ? textoDeMinutos(alvoIv) : bloco.duracao,
    duracaoBase: formato.metadeDoTempo && cheia ? textoDeMinutos(cheia) : undefined,
    intensidade,
    recuperacao: formato.recuperacao,
    observacao: formato.nota,
    // Os alvos concretos seguem a faixa nova, senão o alvo contradiz o texto ao lado dele.
    duracaoAlvoMin: alvoIv ? alvoIv.min : bloco.duracaoAlvoMin,
    rpeAlvo: rpe ?? bloco.rpeAlvo,
    zonaFC: bandaMudou ? undefined : bloco.zonaFC,
    percentFCRAlvo: bandaMudou ? undefined : bloco.percentFCRAlvo,
  };
}
