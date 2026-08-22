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
 * SEGUNDA RODADA (22/08/2026), também do Filipe: banda e recuperação já mudavam, mas a
 * DURAÇÃO continuava dizendo só o tempo total. Um intervalado sem número de tiros e sem tempo
 * por tiro não é um intervalado prescrito, é um contínuo com aviso. Buchheit e Laursen (2013)
 * listam NOVE variáveis que a prescrição precisa manipular, e a duração e o número do tiro
 * estão entre elas; escrever só o total deixa a sessão indefinida. Então o formato passa a
 * carregar a ANATOMIA DO TIRO, e o número de tiros é DERIVADO do tempo de trabalho, nunca
 * digitado à mão em lugar nenhum do motor.
 *
 * A DIVISÃO ENTRE CURTO E LONGO É DA LITERATURA, NÃO DA CASA. Buchheit e Laursen definem o
 * intervalado como repetições que vão de CURTAS (menos de 45 s) a LONGAS (2 a 4 min), e
 * registram os dois formatos clássicos: 30 s de esforço com 30 s de descanso, e repetições de
 * 2 a 4 min em intensidade alta mas submáxima. Helgerud (2007) dá os dois protocolos com
 * número: 15/15 e 4 x 4 min a 90 a 95% da FCmáx, com recuperação ATIVA a 70%. É de onde saem
 * os tiros de 30 s do HIIT curto e os de 4 min do HIIT longo.
 *
 * O QUE É DA DIRETRIZ E O QUE É DA CASA, declarado item a item:
 *
 * - A banda vigorosa (77 a 95% da FCmáx, RPE 7 a 8) é a do próprio catálogo de bandas, citada
 *   ao ACSM (Garber, 2011). O TETO da banda não é acidente: Kemi (2019) mediu que o tiro longo
 *   a 100% do VO2máx é insustentável (44% do previsto completado) e que 95% é o limite.
 * - A queda do tempo total pela metade vem da equivalência que a mesma diretriz publica: pelo
 *   menos 150 min por semana de intensidade moderada OU pelo menos 75 min de vigorosa.
 * - A duração do tiro e a da recuperação de cada formato saem dos protocolos citados acima.
 * - O PISO de tiros de cada formato é escolha prudente da casa, e existe porque um "HIIT longo
 *   de 1 tiro" não é o formato que o cartão promete. Quando o piso levanta o tempo acima da
 *   equivalência do ACSM, a observação do bloco diz isso em voz alta.
 * - O aviso de supervisão do HIIT é da revisão Cochrane que o produto já cita.
 * - NENHUM dos dois HIIT é declarado superior ao outro. Rønnestad (2021) achou vantagem do
 *   curto em ciclistas bem treinados; Appelhans (2025) mostrou que ela some quando o esforço é
 *   autorregulado. Público diferente, controle diferente, resultado diferente.
 */

import { BANDAS_AEROBIAS, type BandaAerobia, type BlocoSessao } from "@/data/periodizacao";

export type FormatoAerobioId = "continuo" | "intervalado" | "hiitCurto" | "hiitLongo" | "fartlek" | "circuito";

/** A anatomia de um tiro: quanto dura o esforço, quanto dura a recuperação e o piso de tiros. */
export interface AnatomiaTiro {
  /** duração de CADA tiro de esforço, em segundos */
  trabalhoSeg: number;
  /** duração de CADA recuperação entre tiros, em segundos */
  recuperacaoSeg: number;
  /**
   * Menor número de tiros que ainda entrega o formato prometido. Escolha prudente da casa:
   * abaixo dele o cartão diria "HIIT longo" e prescreveria uma corrida só.
   */
  minTiros: number;
  /** o que sustenta o par trabalho/recuperação; sai escrito na recuperação do bloco */
  origem: string;
}

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
  /** ausente nos formatos sem tiro cronometrado: contínuo, fartlek e circuito */
  tiro?: AnatomiaTiro;
  /** texto do campo `recuperacao` quando o formato NÃO tem tiro; com tiro, ele é derivado */
  recuperacao: string;
  /** o que o profissional precisa ler antes de assinar este formato */
  nota: string;
  refIds: string[];
}

const NOTA_METADE =
  "O tempo escrito é o tempo TOTAL de trabalho, sem contar as recuperações, e ele parte da metade do tempo do contínuo porque o ACSM (Garber, 2011) equipara 150 min por semana de intensidade moderada a 75 min de vigorosa.";

const NOTA_PISO =
  "O número de tiros é DERIVADO do tempo de trabalho, não digitado: é o tempo total dividido pela duração do tiro. O piso de tiros de cada formato é escolha prudente da casa.";

const CAUTELA_HIIT =
  "CAUTELA ANTES DA ADAPTAÇÃO: na revisão Cochrane de 58 ensaios com adultos sedentários (Strauss, 2026), a diferença de aptidão contra o contínuo moderado é pequena e de baixa certeza, e TODOS os ensaios incluídos usaram intervalado SUPERVISIONADO. Os autores registram que nenhum estudo relatou eventos adversos e que não têm certeza de que eles foram monitorados. Prescreva com supervisão e com a liberação do dia em ordem.";

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
    nome: "Intervalado (tiros de 2 min)",
    banda: "vigorosa",
    metadeDoTempo: true,
    tiro: {
      trabalhoSeg: 120,
      recuperacaoSeg: 120,
      minTiros: 3,
      origem:
        "o tiro de 2 min é o piso da faixa LONGA descrita por Buchheit e Laursen (2013) para repetições em intensidade alta mas ainda SUBMÁXIMA; a razão 1 para 1 entre tiro e recuperação é escolha prudente da casa",
    },
    recuperacao: "-",
    nota: `Tiros de 2 min em intensidade vigorosa submáxima, separados por recuperação ativa de mesma duração. É o formato do meio: mais exigente que o contínuo e menos que os dois HIIT. ${NOTA_METADE} ${NOTA_PISO}`,
    refIds: ["garber-2011", "buchheit-hiit-2013"],
  },
  hiitCurto: {
    id: "hiitCurto",
    nome: "HIIT curto (tiros de 30 s)",
    banda: "vigorosa",
    metadeDoTempo: true,
    tiro: {
      trabalhoSeg: 30,
      recuperacaoSeg: 30,
      minTiros: 6,
      origem:
        "30 s de esforço com 30 s de descanso é um dos dois formatos clássicos registrados por Buchheit e Laursen (2013), que definem o tiro CURTO como o de menos de 45 s; o 15/15 de Helgerud (2007), com recuperação ATIVA a 70% da FCmáx, é a mesma família e rendeu 5,5% de VO2máx em 8 semanas",
    },
    recuperacao: "-",
    nota: `Muitos tiros curtos com recuperação curta entre eles. O esforço acumula sem que nenhum tiro isolado fique longo, e por isso costuma pesar menos por tiro que o HIIT longo. ${NOTA_METADE} ${NOTA_PISO} ${CAUTELA_HIIT}`,
    refIds: ["garber-2011", "buchheit-hiit-2013", "helgerud-intervalos-2007", "strauss-sedentario-2026"],
  },
  hiitLongo: {
    id: "hiitLongo",
    nome: "HIIT longo (tiros de 4 min)",
    banda: "vigorosa",
    metadeDoTempo: true,
    tiro: {
      trabalhoSeg: 240,
      recuperacaoSeg: 180,
      minTiros: 4,
      origem:
        "é o 4 x 4 min de Helgerud (2007), escrito como o estudo prescreveu: 4 min a 90 a 95% da FCmáx seguidos de 3 min de recuperação ATIVA a 70% da FCmáx, 3 vezes por semana, que rendeu 7,2% de VO2máx em 8 semanas",
    },
    recuperacao: "-",
    nota: `Tiros longos, de 4 min, com recuperação ativa de 3 min. Cada tiro sozinho já é exigente, e o esforço percebido no fim dele é alto. FIQUE ABAIXO DO TOPO DA BANDA: Kemi (2019) mediu que o mesmo 4 x 4 a 100% do VO2máx é insustentável (os participantes completaram 44% do previsto, com o lactato em 9,3 mM), enquanto de 80 a 95% ele foi 100% sustentável. A recuperação é ATIVA em ritmo leve, não parada. ${NOTA_METADE} ${NOTA_PISO} ${CAUTELA_HIIT}`,
    refIds: [
      "garber-2011",
      "buchheit-hiit-2013",
      "helgerud-intervalos-2007",
      "kemi-4x4-2019",
      "strauss-sedentario-2026",
    ],
  },
  fartlek: {
    id: "fartlek",
    nome: "Fartlek",
    banda: "moderada",
    metadeDoTempo: false,
    recuperacao: "Sem recuperação cronometrada: o trecho em ritmo leve é a própria recuperação",
    nota:
      "Ritmo variado por sensação, alternando trechos fortes e leves sem cronômetro. Por não ter tiro cronometrado, não tem número de tiros: é essa a diferença dele para o intervalado. A banda segue moderada porque o tempo em esforço alto não é controlado; quem quer dose vigorosa controlada usa o intervalado. Formato de organização da sessão, escolha da casa, sem número de diretriz.",
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

/**
 * Nomes ANTIGOS gravados em planos que já existem, mapeados para o formato atual.
 *
 * Sem isto, um plano salvo com "Intervalado de alta intensidade (HIIT)" deixaria de casar com
 * a lista: o seletor mostraria o texto solto, e trocar de formato e voltar devolveria outra
 * coisa. O HIIT antigo prometia "tiros curtos", então ele cai no HIIT curto.
 */
const APELIDOS: Record<string, FormatoAerobioId> = {
  intervalado: "intervalado",
  "intervalado de alta intensidade (hiit)": "hiitCurto",
  hiit: "hiitCurto",
};

/** Acha o formato pelo texto gravado no bloco; devolve undefined para texto fora da lista. */
export function formatoPeloNome(texto?: string): FormatoAerobio | undefined {
  const t = (texto ?? "").trim().toLowerCase();
  if (!t) return undefined;
  const exato = FORMATOS_AEROBIOS_LISTA.find((f) => f.nome.toLowerCase() === t);
  if (exato) return exato;
  const apelido = APELIDOS[t];
  return apelido ? FORMATOS_AEROBIOS[apelido] : undefined;
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

/** "30 s", "2 min", "1 min 30 s". Sem número inventado: é só formatação de segundos. */
export function textoDeSegundos(seg: number): string {
  if (seg < 60) return `${seg} s`;
  const min = Math.floor(seg / 60);
  const resto = seg % 60;
  return resto ? `${min} min ${resto} s` : `${min} min`;
}

/** Piso da faixa de RPE citada no texto da banda ("RPE 7 a 8 de 10" -> 7). */
function pisoRPE(texto: string): number | undefined {
  const m = texto.match(/RPE\s*(\d+)/i);
  return m ? Number(m[1]) : undefined;
}

/** "4 tiros de 4 min" ou "10 a 20 tiros de 30 s". */
function textoDeTiros(iv: { min: number; max: number }, trabalhoSeg: number): string {
  const quantos = iv.min === iv.max ? `${iv.min} tiros` : `${iv.min} a ${iv.max} tiros`;
  return `${quantos} de ${textoDeSegundos(trabalhoSeg)}`;
}

/**
 * Quantos tiros cabem no tempo de trabalho, com o piso do formato aplicado nas duas pontas.
 *
 * `pisou` é verdadeiro quando o piso levantou o número, porque nesse caso o tempo em
 * intensidade vigorosa passa do que a equivalência do ACSM daria, e o profissional precisa ler
 * isso na observação do bloco em vez de descobrir sozinho.
 */
function contarTiros(trabalhoIv: { min: number; max: number }, tiro: AnatomiaTiro) {
  const cabe = (min: number) => Math.round((min * 60) / tiro.trabalhoSeg);
  const cruMin = cabe(trabalhoIv.min);
  const cruMax = cabe(trabalhoIv.max);
  const min = Math.max(tiro.minTiros, cruMin);
  return { min, max: Math.max(min, Math.max(tiro.minTiros, cruMax)), pisou: cruMin < tiro.minTiros };
}

/**
 * Quantos tiros a DURAÇÃO-ALVO DESTA SEMANA vale, quando o bloco tem tiro cronometrado.
 *
 * O campo `tiros` guarda a FAIXA ("20 a 40 tiros de 30 s"), que é a referência do bloco. Mas o
 * alvo concreto da semana é um minuto só, e sem esta conversão o aluno recebia "14 min" ao
 * lado de "20 a 40 tiros" e tinha que dividir de cabeça para saber quantos fazer hoje.
 *
 * Null quando falta qualquer um dos dois dados: número ausente é melhor que número inventado.
 */
export function tirosDaSemana(bloco: BlocoSessao): { quantos: number; texto: string } | null {
  if (!bloco.tiroSeg || bloco.duracaoAlvoMin == null) return null;
  const quantos = Math.round((bloco.duracaoAlvoMin * 60) / bloco.tiroSeg);
  if (quantos < 1) return null;
  return { quantos, texto: `${quantos} tiros de ${textoDeSegundos(bloco.tiroSeg)}` };
}

/**
 * Aplica o formato ao bloco aeróbio, reescrevendo o que o formato de fato muda.
 *
 * A ida e a volta fecham: quando o bloco JÁ está num formato de tempo pela metade, a função
 * lê a faixa cheia de `duracaoBase` antes de decidir a nova, então voltar para "Contínuo"
 * devolve o tempo cheio em vez de metade da metade. O guardrail cobra isso.
 *
 * O TEMPO PASSA A SER FILHO DOS TIROS, e não o contrário. Nos formatos com tiro, a duração
 * final é recalculada como número de tiros vezes duração do tiro, para que os dois campos não
 * possam se contradizer: um cartão que diz "4 tiros de 4 min" ao lado de "12 min de trabalho"
 * seria a mesma doença que este arquivo existe para curar.
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
  const veioDeFormatoEncurtado = anterior != null && (anterior.metadeDoTempo || anterior.tiro != null);
  const cheia = veioDeFormatoEncurtado
    ? (minutosDoTexto(bloco.duracaoBase) ?? (atual ? { min: atual.min * 2, max: atual.max * 2 } : null))
    : atual;

  const base = cheia ? (formato.metadeDoTempo ? metade(cheia) : cheia) : null;
  const tiro = formato.tiro;
  const contagem = base && tiro ? contarTiros(base, tiro) : null;
  const alvoIv =
    contagem && tiro
      ? { min: (contagem.min * tiro.trabalhoSeg) / 60, max: (contagem.max * tiro.trabalhoSeg) / 60 }
      : base;

  const intensidade = BANDAS_AEROBIAS[formato.banda].intensidade;
  const rpe = pisoRPE(intensidade);
  const guardaBase = cheia != null && (formato.metadeDoTempo || tiro != null);

  /*
   * O CAMPO DA RECUPERAÇÃO É UM INPUT, e input não é lugar de citação.
   *
   * A primeira versão colava a origem do protocolo dentro dele, e o profissional recebia uma
   * caixa de edição com três linhas de referência para atravessar antes de trocar um número. O
   * campo fica com a DOSE, aberto pelo tempo, e a origem desce para a observação, que é onde
   * as citações deste produto já moram.
   */
  const recuperacao =
    tiro != null
      ? `${textoDeSegundos(tiro.recuperacaoSeg)} de recuperação ATIVA em ritmo leve entre os tiros`
      : formato.recuperacao;

  const origemDoTiro = tiro
    ? ` DE ONDE VÊM OS NÚMEROS DO TIRO: tiro de ${textoDeSegundos(tiro.trabalhoSeg)} e recuperação de ${textoDeSegundos(tiro.recuperacaoSeg)}, porque ${tiro.origem}.`
    : "";

  const avisoDoPiso =
    contagem?.pisou && tiro
      ? ` ATENÇÃO AO TEMPO: com a metade do tempo do contínuo caberiam menos de ${tiro.minTiros} tiros, e menos que isso não é o formato que o cartão promete. O plano subiu para o piso de ${tiro.minTiros} tiros, então o tempo em intensidade vigorosa ficou ACIMA da equivalência do ACSM. Se for demais para este aluno, reduza a duração base no formato Contínuo antes de trocar, ou escolha um formato de tiro mais curto.`
      : "";

  return {
    ...bloco,
    formato: formato.nome,
    duracao: alvoIv ? textoDeMinutos(alvoIv) : bloco.duracao,
    duracaoBase: guardaBase && cheia ? textoDeMinutos(cheia) : undefined,
    tiros: contagem && tiro ? textoDeTiros(contagem, tiro.trabalhoSeg) : undefined,
    tiroSeg: contagem && tiro ? tiro.trabalhoSeg : undefined,
    intensidade,
    recuperacao,
    observacao: formato.nota + origemDoTiro + avisoDoPiso,
    // Os alvos concretos seguem a faixa nova, senão o alvo contradiz o texto ao lado dele.
    duracaoAlvoMin: alvoIv ? alvoIv.min : bloco.duracaoAlvoMin,
    rpeAlvo: rpe ?? bloco.rpeAlvo,
    zonaFC: bandaMudou ? undefined : bloco.zonaFC,
    percentFCRAlvo: bandaMudou ? undefined : bloco.percentFCRAlvo,
  };
}
