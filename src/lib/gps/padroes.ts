/**
 * PADRÃO DE MOVIMENTO, derivado do que o catálogo já sabe.
 *
 * ## Por que esta camada existe
 *
 * `grupoMuscular` é rótulo de REGIÃO, não de movimento, e a diferença aparece no plano.
 * "Membros inferiores" junta num só rótulo o agachamento (dominante de joelho) e o levantamento
 * terra (dominante de quadril); "Braços" junta rosca (puxar), tríceps (empurrar) e flexão de
 * punho (acessório menor). Cobrir FAMÍLIAS, então, não é cobrir o corpo: medido em 09/09/2026,
 * numa grade de 576 planos, 24% das semanas saíam sem nenhum exercício dominante de quadril
 * (nenhum glúteo, nenhum posterior de coxa) e 23% tinham desequilíbrio de empurrar contra puxar
 * acima de 2 para 1. Todos passavam nos guardrails de cobertura, porque a família "Membros
 * inferiores" estava lá e a família "Costas" também.
 *
 * ## Por que derivar em vez de autorar um campo
 *
 * A versão anterior deste raciocínio (comentário de `COTA_POR_RODADA`) registrou que
 * `articulacaoPredominante` não serve: ela traz "Joelho e quadril" e "Quadril e joelho" como
 * rótulos distintos para a mesma ideia, e inferir dominância da ORDEM DAS PALAVRAS seria
 * adivinhar num motor clínico. A conclusão de lá foi "enquanto o catálogo não tiver o padrão de
 * movimento como campo próprio, a cota é a aproximação honesta".
 *
 * O catálogo TEM o dado, em outro lugar: `ativacao[]`, com o papel de cada músculo declarado e
 * o percentual vindo de EMG comparada. O músculo PRIMÁRIO de um exercício é curado, é validado
 * pelo `check:metricas` e não depende de ordem de palavras. Quadríceps primário é dominante de
 * joelho; glúteo máximo ou isquiotibiais primários são dominante de quadril. Isso é
 * biomecânica de livro-texto lida de um dado que já existe, não é palpite novo.
 *
 * A derivação é PURA e determinística: mesmo exercício, mesmo padrão, sempre. Se um dia o
 * catálogo ganhar o campo autorado, esta função vira uma linha lendo o campo, e nada mais no
 * motor muda.
 */
import type { Exercise } from "@/data/types";

export type PadraoMovimento =
  /** dominante de joelho: agachar, avançar, extensão de joelho */
  | "joelho"
  /** dominante de quadril: dobradiça, ponte, extensão de quadril, flexão de joelho */
  | "quadril"
  /** panturrilha e tornozelo */
  | "panturrilha"
  /** empurrar: supino, desenvolvimento, flexão de braço */
  | "empurrar"
  /** puxar: remada, puxada, rosca, posterior de ombro */
  | "puxar"
  /** tronco: prancha, anti-rotação, anti-extensão, flexão de tronco */
  | "core"
  /** carregamento e corpo todo */
  | "carregamento"
  /** abdução de ombro e manguito rotador: nem empurra nem puxa */
  | "ombro-acessorio"
  /** punho, antebraço, pescoço, tibial: trabalho miúdo, último na fila de prioridade */
  | "acessorio-menor"
  /** quadril em plano frontal (abdução, adução): não substitui a cadeia posterior */
  | "quadril-acessorio"
  /** equilíbrio (apoio unipodal): bloco de indicação clínica, nunca trabalho miúdo */
  | "equilibrio";

/** Os padrões que uma semana de corpo inteiro precisa tocar para ser um treino completo. */
export const PADROES_ESSENCIAIS: readonly PadraoMovimento[] = ["joelho", "quadril", "empurrar", "puxar", "core"];

const JOELHO = new Set(["Quadríceps", "Reto femoral"]);
const QUADRIL = new Set(["Glúteo máximo", "Isquiotibiais"]);
const QUADRIL_ACESSORIO = new Set(["Glúteo médio", "Adutores", "Rotadores externos do quadril", "Estabilizadores do quadril", "Iliopsoas"]);
const PANTURRILHA = new Set(["Panturrilha", "Gastrocnêmio", "Sóleo"]);
const EMPURRAR = new Set(["Peitoral maior", "Deltoide", "Deltoide anterior", "Tríceps braquial", "Ancôneo"]);
const PUXAR = new Set([
  "Latíssimo do dorso",
  "Trapézio médio",
  "Trapézio inferior",
  "Trapézio superior",
  "Romboides",
  "Bíceps braquial",
  "Braquial",
  // Flexor de cotovelo como os outros dois: a rosca martelo é exercício de braço de verdade,
  // e cair no balaio de "acessório menor" a mandaria para o fim da fila junto da flexão de punho.
  "Braquiorradial",
  "Deltoide posterior",
]);
/**
 * Trabalho escapular e de manguito: NEM empurra NEM puxa.
 *
 * O serrátil entra aqui, e não em "empurrar", por consequência prática: o deslizamento na
 * parede é trabalho de escápula, e deixá-lo contar como o movimento de empurrar da semana faria
 * um plano fechar sem nenhum supino, nenhuma flexão de braço e nenhum desenvolvimento, com o
 * guardrail satisfeito.
 */
const OMBRO_ACESSORIO = new Set(["Deltoide médio", "Supraespinal", "Infraespinal", "Redondo menor", "Subescapular", "Serrátil anterior"]);
/**
 * MÚSCULO MIÚDO, e por que ele precisa de um nome próprio.
 *
 * Flexão de punho é o único exercício de "Braços" que o catálogo marca para "Retorno ao
 * treino". Como a garantia de cobertura pega o PRIMEIRO da família e a fila ordena por
 * segurança (e não há nada mais seguro que uma flexão de punho), um homem de 62 anos
 * destreinado, treinando 2x por semana, recebia flexão de punho como um dos OITO exercícios
 * da semana dele. Isso não é erro de segurança, é erro de PERTINÊNCIA: o guardrail estava
 * verde e o plano estava errado.
 */
const ACESSORIO_MENOR = new Set([
  "Flexores do punho",
  "Extensores do punho",
  "Flexores profundos do pescoço",
  "Tibial anterior",
  "Fibulares (estabilizadores do tornozelo)",
]);
const CORE = new Set(["Core", "Reto abdominal", "Oblíquos", "Transverso do abdome", "Quadrado lombar", "Eretores da espinha", "Diafragma"]);

/** O músculo primário de maior ativação. É o que decide o padrão. */
export function musculoPrimario(ex: Exercise): string | undefined {
  return ex.ativacao
    .filter((a) => a.papel === "primário")
    .sort((a, b) => b.percentual - a.percentual)[0]?.musculo;
}

/**
 * O padrão de movimento do exercício.
 *
 * A REGIÃO decide primeiro, o músculo primário decide dentro dela. A ordem importa: a prancha
 * tem "Core" primário e vive na família Core; a caminhada do fazendeiro tem "Flexores do punho"
 * primário e vive em "Corpo todo", e é carregamento, não trabalho de antebraço.
 */
export function padraoDe(ex: Exercise): PadraoMovimento {
  const prim = musculoPrimario(ex) ?? "";
  switch (ex.grupoMuscular) {
    case "Core (tronco)":
      return "core";
    case "Corpo todo":
      /*
       * A FAMÍLIA DIZ "CORPO TODO", O MOVIMENTO DIZ DOBRADIÇA.
       *
       * O levantamento terra convencional mora em "Corpo todo" e é a dobradiça de quadril mais
       * clássica que existe. Tratá-lo como carregamento faria a semana que o prescreve continuar
       * contando como semana sem trabalho de cadeia posterior, e o motor iria buscar outro
       * quadril que já estava ali.
       */
      return QUADRIL.has(prim) ? "quadril" : "carregamento";
    case "Membros inferiores":
      if (JOELHO.has(prim)) return "joelho";
      if (QUADRIL.has(prim)) return "quadril";
      if (PANTURRILHA.has(prim)) return "panturrilha";
      if (QUADRIL_ACESSORIO.has(prim)) return "quadril-acessorio";
      if (CORE.has(prim)) return "core";
      return "quadril-acessorio";
    case "Tornozelo e pé":
      // O apoio unipodal é EQUILÍBRIO, com padrão próprio: entra por indicação clínica (idoso,
      // osteoporose) e não pode ser rebaixado como trabalho miúdo. A dorsiflexão segue miúda.
      return /Fibulares|estabilizadores/i.test(prim) ? "equilibrio" : "acessorio-menor";
    case "Pescoço":
      return "acessorio-menor";
    default: {
      // Tronco e braços: o músculo primário separa empurrar de puxar.
      if (ACESSORIO_MENOR.has(prim)) return "acessorio-menor";
      if (OMBRO_ACESSORIO.has(prim)) return "ombro-acessorio";
      if (EMPURRAR.has(prim)) return "empurrar";
      if (PUXAR.has(prim)) return "puxar";
      if (CORE.has(prim)) return "core";
      return "ombro-acessorio";
    }
  }
}

/**
 * Trabalho miúdo: entra no plano quando sobra vaga, nunca ocupando a vaga de cobertura de uma
 * família nem competindo com um padrão essencial.
 */
export function ehAcessorioMenor(ex: Exercise): boolean {
  return padraoDe(ex) === "acessorio-menor";
}
