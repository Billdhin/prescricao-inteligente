/**
 * Motor do ALVO da semana (onda MP-3, o coração do redesenho da progressão).
 *
 * A faixa científica citada (ex.: séries "3 a 4", repetições "6 a 12") continua sendo a
 * REFERÊNCIA exibida ao lado. Aqui ela vira um ALVO CONCRETO por semana, sempre DENTRO
 * dela, que PROGRIDE ao longo das semanas de carga do mesociclo conforme a TENDÊNCIA
 * declarada do bloco. Assim o "mesmo treino toda semana" acaba para a força: a semana 1
 * parte do piso e a última de carga chega ao teto, sem que nenhum número seja inventado.
 *
 * Regra de ouro respeitada:
 * - A DIREÇÃO do alvo vem da tendência do mesociclo (sobe/reduz/estável/varia), não de um
 *   palpite; o alvo nunca sai da faixa citada (check:faixas continua verde).
 * - A DIREÇÃO da descarga é a regra DECLARADA `deload-rotina-gestao-fadiga`, que é "pendente"
 *   e de evidência fraca justamente porque a literatura não fixa magnitude: uma das fontes é
 *   levantamento de PRÁTICA em atletas e a outra não achou benefício. A MAGNITUDE aplicada
 *   aqui (uma série a menos, uma repetição de reserva a mais e carga relativa a 60% do nível
 *   da última semana de carga) é escolha prudente DA CASA, e não sai daquela regra. O bloco
 *   grava `origemRegraId` para rastrear a direção; ele não transforma a casa em diretriz.
 * - Determinístico e puro: as mesmas entradas dão sempre o mesmo alvo.
 *
 * Este módulo é a fonte ÚNICA do alvo: `doseForca` (periodizacao.ts) delega a ele, e o
 * guardrail check:progressao lê os mesmos campos que ele grava.
 */

import { intervaloDe, unidade, type Intervalo } from "@/lib/gps/faixasParse";
import type { GpsObjetivo } from "@/lib/gps/engine";
import type { Nivel } from "@/data/types";
import type { ParamMonitorId } from "@/data/monitoringParameters";
import type { Tendencia, TipoMicrociclo, VariavelTravavel } from "@/data/periodizacao";

/** Os campos de alvo que o motor grava no bloco de força. Todos opcionais e dentro da faixa. */
export interface AlvoForca {
  seriesAlvo?: number;
  repsAlvo?: number;
  rirAlvo?: number;
  cargaRelativaAlvo?: number;
  intervaloAlvoSeg?: number;
  origemRegraId?: string;
}

/** Contexto da posição da semana no mesociclo, mais as tendências e o perfil do plano. */
export interface CtxAlvo {
  /** posição 1-based desta semana entre as semanas de CARGA do mesociclo */
  semanaNoMeso: number;
  /** total de semanas de carga do mesociclo (a descarga fica fora desta conta) */
  semanasDeCargaNoMeso: number;
  /**
   * Posição 1-based desta semana entre as semanas de carga do MACROCICLO inteiro, e o total
   * delas. Só o modelo LINEAR passa estes dois campos, e é o que transforma a progressão
   * numa rampa única do começo ao fim do plano, em vez de uma rampa que reinicia a cada
   * bloco. Ausentes = fração por mesociclo, exatamente como antes.
   */
  semanaNoMacro?: number;
  semanasDeCargaNoMacro?: number;
  /**
   * PISO (0..1) a partir do qual o nível desta semana é lido, usado pelo modelo de BLOCOS.
   *
   * O modelo de blocos organiza o plano em ondas de acúmulo, intensificação e realização. A
   * intenção declarada sempre foi que "a cada onda o programa retoma a fase num patamar mais
   * alto", mas só a complexidade subia: a DOSE reiniciava do zero em cada onda, e um plano de
   * 24 semanas saía com as semanas 13 a 24 idênticas às semanas 1 a 12. A onda existia, o
   * patamar não.
   *
   * Com o piso, a segunda onda lê o mesmo desenho de nível dentro de um trecho mais alto da
   * MESMA faixa citada: nível 0 da onda 2 já vale mais que o nível 0 da onda 1. A forma do
   * bloco (sobe, estável, reduz) fica igual; o chão dela é que sobe. Nenhum número novo entra:
   * o piso é uma posição dentro do intervalo que a diretriz já define.
   */
  pisoDoCiclo?: number;
  /**
   * FRAÇÃO DO PASSO DE PROGRESSÃO deste perfil clínico (0 a 1), vinda de
   * `GroupGpsRule.modProgressao.fatorIncremento` já FUNDIDA de todas as condições do aluno.
   *
   * O campo existia no catálogo de regras, era fundido pelo mais conservador, aparecia no
   * raciocínio e não chegava a lugar nenhum da geração: idoso com hipertensão e obesidade
   * grau III recebia exatamente a mesma rampa semanal de um adulto saudável. A cautela estava
   * declarada e não era aplicada, que é o defeito mais comum deste motor.
   *
   * Aplica-se comprimindo a rampa em torno do PONTO DE PARTIDA dela: o plano começa no mesmo
   * lugar e caminha menos dentro da MESMA faixa citada. Nenhum número novo, nenhuma dose fora
   * da faixa, e o sentido da tendência é preservado. Ausente = passo cheio, como sempre foi.
   */
  fatorProgressao?: number;
  /**
   * TETO DE PSE do perfil clínico, já fundido de todas as condições do aluno
   * (`GroupGpsRule.modProgressao.pseTeto`, o menor entre elas).
   *
   * Era mais um caso da assinatura recorrente deste motor: a cautela declarada e nada
   * a aplicando. O teto existia e chegava a DOIS lugares, o texto do semáforo e a
   * autorregulação da execução (autorregulacao.ts), mas não ao alvo PRESCRITO. Medido
   * num plano de 12 semanas para hipertensão estágio 2, cujo teto é 5: 15 dos 33 blocos
   * aeróbios saíam com PSE-alvo 6. O semáforo do mesmo aluno, na mesma tela, dizia
   * "intensidade moderada, PSE ≤5".
   *
   * Só REBAIXA, nunca levanta: um teto que aumentasse o esforço não seria um teto.
   */
  pseTeto?: number;
  /**
   * DOSE MODIFICADA PELO PERFIL CLÍNICO (ver GroupGpsRule.modDose e doseDoPerfil).
   *
   * É o que faltava para a dose nascer do perfil e não só do objetivo. Antes disto, um
   * hipertenso estágio 2 iniciante e um adulto sem condição nenhuma recebiam, no mesmo
   * objetivo, exatamente 3x15 com intervalo de 30 s, que é o PISO da faixa citada e o
   * extremo mais metabólico dela.
   *
   * Nenhum destes campos inventa faixa: `cargaRelativaMax` carrega número publicado
   * (`henkin-2023`), e `intervaloFolgado` e `rirMinimo` só movem o alvo DENTRO da faixa
   * que o objetivo já cita, por consistência com o teto de esforço já declarado.
   */
  cargaRelativaMax?: number;
  intervaloFolgado?: boolean;
  rirMinimo?: number;
  /** a rampa parte do PISO da faixa citada (ver ModDose.partirDoPiso) */
  partirDoPiso?: boolean;
  /**
   * SEGURA A DOSE NO PATAMAR QUE A RAMPA ALCANÇOU, em vez de recomeçar.
   *
   * Existe para as fases de CONTINUAÇÃO do caminho clínico: quando o horizonte é longo
   * demais para as fases autoradas da jornada, a última fase se repete para sustentar os
   * ganhos. Essas repetições eram marcadas "estavel", e "estavel" lê o MEIO da faixa, que
   * não tem relação nenhuma com o ponto a que o plano tinha chegado.
   *
   * Medido antes da correção, em 48 semanas de hipertrofia para intermediário:
   *
   *   obesidade grau 2   fim da Fase 4: 4x7 RIR 1   fim da continuação: 4x7 RIR 2
   *   diabetes tipo 2    fim da Fase 4: 4x6 RIR 1   fim da continuação: 4x7 RIR 2
   *
   * Ou seja, a fase cujo cartão diz "sustentar os ganhos" entregava dose MENOR que a fase
   * que ela continua, e o plano terminava mais leve do que estava na semana 32. De quebra,
   * as duas continuações saíam idênticas entre si semana a semana: as semanas 33 a 40 se
   * repetiam em 41 a 48.
   *
   * A correção não troca a dose por um número novo: ela CONGELA a posição na rampa no fim
   * dela (`t = 1`), e deixa todo o resto do caminho igual. Assim "patamar alcançado" é
   * literalmente onde o plano chegou, seja qual for o modelo e seja qual for a direção da
   * tendência: com "sobe" o topo, com "reduz" o piso, com "varia" a base da última onda.
   * A compressão do perfil clínico (`fatorProgressao`) continua valendo por cima, então
   * quem progride devagar segura no patamar devagar que alcançou, e não no de outro aluno.
   */
  patamarCongelado?: boolean;
  tipoSemana: TipoMicrociclo;
  tendenciaVolume: Tendencia;
  tendenciaIntensidade: Tendencia;
  nivel: Nivel;
  objetivo: GpsObjetivo;
  /**
   * Idade do aluno, quando a geração tem aluno em mãos. Só serve à zona de FC do aeróbio
   * (FCmax = 208 - 0.7*idade). Ausente no uso avulso/estudo e nos guardrails: sem ela, o
   * aeróbio guia por duração + PSE, sem inventar zona.
   */
  idade?: number;
  /** FC de repouso MEDIDA do aluno (bpm). Exigida pela zona de Karvonen; ausente = sem zona. */
  fcRepouso?: number;
  /**
   * Parâmetros de monitoramento que DEIXAM de guiar a intensidade neste aluno (o perfil clínico
   * mais as classes de medicação declaradas decidem isso em src/lib/gps/farmacos.ts). Com
   * "p-fc" na lista, a zona de frequência cardíaca simplesmente NÃO é calculada: o alvo cai no
   * caminho honesto que já existia (duração mais percepção de esforço), em vez de corrigir a
   * frequência cardíaca por um fator que nenhuma referência sustenta. Ausente/vazio = tudo
   * guia como sempre, e o alvo é byte-idêntico ao de antes desta camada.
   */
  parametrosInvalidos?: ParamMonitorId[];
  /**
   * Variáveis TRAVADAS pelo profissional neste mesociclo (critérios 15/16, onda MP-6). Uma
   * variável travada não progride: o nível dela fica CONGELADO no patamar da primeira semana de
   * carga (sobe -> piso, reduz -> teto) ou no meio (estável/varia), constante em todas as
   * semanas. Ausente/vazio = nada travado, e o alvo é byte-idêntico ao de antes (a geração e os
   * guardrails não passam travas). Só volume e intensidade mexem nos números do alvo aqui;
   * "complexidade" é respeitada fora deste módulo (seleção de exercício e método de série).
   */
  variaveisTravadas?: VariavelTravavel[];
}

/** As faixas-texto da dose (já com nível e ênfase aplicados) que o alvo vai concretizar. */
export interface DoseTextos {
  series: string;
  reps: string;
  intensidade: string;
  intervalo: string;
  /** nota da intensidade da faixa, onde muitas vezes vivem o %1RM e o RIR (ex.: "1 a 3 RIR") */
  intensidadeNota?: string;
}

const n = (s: string) => Number(s.replace(",", "."));

/* --------------------------- Leitura de %1RM e RIR do texto --------------------------- */

/**
 * Extrai o intervalo de %1RM de um texto ("cerca de 40 a 60% de 1RM" -> {40,60}). Só quando
 * o texto realmente fala de 1RM: assim a intensidade textual ("moderada a alta") não vira
 * número inventado. Ignora o "% da FCmáx" do aeróbio (não menciona 1RM).
 */
function faixaPct1RM(texto: string): Intervalo | null {
  if (!/1\s*RM/i.test(texto)) return null;
  const range = texto.match(/(\d+(?:[.,]\d+)?)\s*(?:a|até)\s*(\d+(?:[.,]\d+)?)\s*%/i);
  if (range) return { min: n(range[1]), max: n(range[2]) };
  const solo = texto.match(/(\d+(?:[.,]\d+)?)\s*%/i);
  if (solo) return { min: n(solo[1]), max: n(solo[1]) };
  return null;
}

/**
 * Extrai o intervalo de repetições de reserva (RIR) de um texto ("1 a 3 repetições de
 * reserva" -> {1,3}; "alta, 1 a 2 repetições de reserva" -> {1,2}). Só quando o texto fala
 * de reserva/RIR, para não confundir com repetições de trabalho.
 */
function faixaRIR(texto: string): Intervalo | null {
  if (!/reserva|\bRIR\b/i.test(texto)) return null;
  const range = texto.match(/(\d+(?:[.,]\d+)?)\s*(?:a|até)\s*(\d+(?:[.,]\d+)?)\s*(?:repeti|rir|de\s+reserva)/i);
  if (range) return { min: n(range[1]), max: n(range[2]) };
  const solo = texto.match(/(\d+(?:[.,]\d+)?)\s*(?:repeti|rir|de\s+reserva)/i);
  if (solo) return { min: n(solo[1]), max: n(solo[1]) };
  return null;
}

/**
 * Faixa de %1RM lida da intensidade (e da nota, quando dada). Exposta para o tubo responsivo
 * (renovarMicrociclo) clampear o alvo dentro da faixa citada, com a MESMA leitura do motor.
 */
export function lerFaixaPct1RM(intensidade: string, nota?: string): Intervalo | null {
  return faixaPct1RM(intensidade) ?? (nota ? faixaPct1RM(nota) : null);
}

/** Faixa de RIR lida da intensidade (e da nota, quando dada). Exposta para o tubo responsivo. */
export function lerFaixaRIR(intensidade: string, nota?: string): Intervalo | null {
  return faixaRIR(intensidade) ?? (nota ? faixaRIR(nota) : null);
}

/* --------------------------------- Rampa determinística --------------------------------- */

/**
 * Fração 0..1 desta semana de carga dentro do mesociclo: a primeira semana de carga fica em
 * 0 (piso), a última em 1 (teto). Um único bloco de carga fica em 0 (não há para onde rampar).
 *
 * ## A exceção do modelo linear
 *
 * Quando o ciclo traz `semanaNoMacro`/`semanasDeCargaNoMacro`, a fração passa a ser medida no
 * MACROCICLO inteiro, e não em cada bloco. É o que faz a periodização linear ser de fato uma
 * rampa contínua do começo ao fim do plano.
 *
 * Sem isso, "reduz" reiniciava a cada mesociclo: dentro do bloco a curva descia, e no bloco
 * seguinte voltava ao topo. O gráfico virava um serrote, e foi assim que o fundador escolheu
 * "linear" e viu ondulação na tela. Os demais modelos não recebem estes campos, então a
 * fração deles continua por mesociclo, byte-idêntica.
 */
function fracaoCarga(ctx: CtxAlvo): number {
  // Fase de continuação: a rampa não recomeça, ela para onde parou. Ver CtxAlvo.patamarCongelado.
  if (ctx.patamarCongelado) return 1;
  if (ctx.semanaNoMacro != null && ctx.semanasDeCargaNoMacro != null) {
    const totalM = ctx.semanasDeCargaNoMacro;
    if (totalM <= 1) return 0;
    const posM = Math.min(Math.max(ctx.semanaNoMacro, 1), totalM);
    return (posM - 1) / (totalM - 1);
  }
  const total = ctx.semanasDeCargaNoMeso;
  if (total <= 1) return 0;
  const pos = Math.min(Math.max(ctx.semanaNoMeso, 1), total);
  return (pos - 1) / (total - 1);
}

/**
 * O NÍVEL (0..1) que uma tendência pede nesta semana:
 * - "sobe": rampa do piso (0) ao teto (1) ao longo das semanas de carga (monotônica);
 * - "reduz": rampa inversa (teto ao piso);
 * - "estavel": mantém no meio;
 * - "varia" (ondulatória): alterna semana a semana, de forma determinística e sem sair da
 *   faixa (ímpares mais leves, pares mais fortes), MAS em torno de uma linha de base que
 *   anda com `t`. A onda pura, em torno de um centro fixo, fazia a semana 4 sair idêntica à
 *   semana 1: um plano de seis meses virava a mesma quinzena repetida. Ondular é variar em
 *   torno de uma base que progride, e a amplitude continua a mesma de antes (±0,16).
 */
/**
 * Remapeia um nível 0..1 para o trecho [piso, 1] da faixa. É o que faz a onda seguinte do
 * modelo de blocos começar mais alto que a anterior sem mudar o desenho dela. Sem piso
 * (todos os outros modelos), devolve o nível intacto.
 */
function comPiso(nivel: number, piso?: number): number {
  if (!piso) return nivel;
  const p = Math.min(Math.max(piso, 0), 0.5); // teto de meia faixa: a onda nunca some
  return p + nivel * (1 - p);
}

/**
 * Comprime a rampa em torno do ponto de partida dela, na fração que o perfil clínico pede
 * (ver CtxAlvo.fatorProgressao). O começo é o mesmo; o quanto se caminha é que encolhe.
 * Piso de 0,2 para que "progride devagar" nunca vire "não progride", que seria trocar um
 * defeito por outro: um plano que não muda em 12 semanas é a queixa que abriu esta obra.
 */
function comPasso(nivel: number, inicial: number, fator?: number): number {
  if (fator == null || fator >= 1) return nivel;
  const f = Math.min(1, Math.max(0.2, fator));
  return inicial + (nivel - inicial) * f;
}

/**
 * MENOR NÍVEL QUE AS SEMANAS DE CARGA DESTE MESOCICLO ALCANÇAM.
 *
 * A descarga ancorava em `nivelDaTendencia(tend, 1, ...)`, ou seja, na suposição de que a
 * ÚLTIMA semana de carga é o teto do mesociclo. Isso vale para "sobe" e "reduz", e NÃO vale
 * para "varia": ali o nível oscila ±0,16 em torno de uma base, e a última semana pode ser
 * justamente um vale. Medido num plano de 12 semanas de hipertrofia para intermediário, com
 * o volume por sessão em séries x repetições:
 *
 *   ondulatória  96 112 84 [84] 84 112 84 [84] 84 96 112 [84]
 *   flexível     96 112 84 [84] 84 112 84 [84] 84 96 112 [84]
 *   linear      192 176 176 [72] 160 144 96 [72] 96 84 72 [72]
 *   blocos      108 144 144 [108] 192 144 96 [72] 192 144 72 [72]
 *
 * Os colchetes são as descargas. Na ondulatória e na flexível a semana de descarga tem
 * EXATAMENTE o mesmo volume de várias semanas de carga, e o mesmo de quem veio antes dela.
 * "Descarga" virou rótulo do cartão, e não redução na dose que o aluno executa.
 *
 * Ancorar no MENOR nível de carga do próprio mesociclo resolve para qualquer formato de
 * tendência, incluindo os que ainda não existem: seja qual for a onda, a descarga fica
 * abaixo da semana mais leve do bloco.
 */
function niveisDaCargaMaisLeve(
  ctx: CtxAlvo,
  seriesIv: { min: number; max: number } | null,
  repsIv: { min: number; max: number } | null,
): { nv: number; ni: number } {
  const n = Math.max(1, ctx.semanasDeCargaNoMeso);
  // A fração precisa vir da MESMA fonte que as semanas de carga usam: quando a rampa é no
  // macrociclo, a posição é a do macro, e não a do mesociclo. Reconstruir errado aqui faria
  // a descarga do modelo linear mirar num nível que nenhuma semana daquele bloco teve.
  const usaMacro = ctx.semanaNoMacro != null && ctx.semanasDeCargaNoMacro != null;
  const totalM = ctx.semanasDeCargaNoMacro ?? 0;
  const primeiraNoMacro = (ctx.semanaNoMacro ?? 0) - n;
  const fracao = (s: number) =>
    // No patamar congelado todas as semanas de carga estão no mesmo ponto da rampa, então a
    // busca pela mais leve tem que olhar esse ponto, e não reconstruir uma rampa que não
    // existe naquele bloco. Sem isto a descarga ancoraria abaixo do patamar que ela deveria
    // aliviar. Ver CtxAlvo.patamarCongelado.
    ctx.patamarCongelado
      ? 1
      : usaMacro
        ? totalM <= 1
          ? 0
          : (Math.min(Math.max(primeiraNoMacro + s, 1), totalM) - 1) / (totalM - 1)
        : n <= 1
          ? 0
          : (s - 1) / (n - 1);

  let melhor = { nv: 0, ni: 0, vol: Infinity };
  for (let s = 1; s <= n; s++) {
    const t = fracao(s);
    const nv = comPasso(
      comPiso(nivelDaTendencia(ctx.tendenciaVolume, t, s), ctx.pisoDoCiclo),
      comPiso(nivelDaTendencia(ctx.tendenciaVolume, 0, s), ctx.pisoDoCiclo),
      ctx.fatorProgressao,
    );
    const ni = comPasso(
      comPiso(nivelDaTendencia(ctx.tendenciaIntensidade, t, s), ctx.pisoDoCiclo),
      comPiso(nivelDaTendencia(ctx.tendenciaIntensidade, 0, s), ctx.pisoDoCiclo),
      ctx.fatorProgressao,
    );
    // O par (séries, repetições) desta semana de carga, calculado do mesmo jeito que o ramo
    // de carga calcula. É por isso que o volume comparado aqui é o volume REAL da semana, e
    // não uma aproximação: séries seguem o volume e repetições seguem a intensidade, e os
    // dois mínimos caem em semanas DIFERENTES quando as tendências andam em sentidos opostos.
    const series = seriesIv ? ponto(seriesIv, nv, true) : 1;
    const reps = repsIv ? ponto(repsIv, 1 - ni, true) : 1;
    const vol = series * reps;
    if (vol < melhor.vol) melhor = { nv, ni, vol };
  }
  return { nv: melhor.nv, ni: melhor.ni };
}

function nivelDaTendencia(tend: Tendencia, t: number, semanaNoMeso: number): number {
  switch (tend) {
    case "sobe":
      return t;
    case "reduz":
      return 1 - t;
    case "estavel":
      return 0.5;
    case "varia": {
      const onda = semanaNoMeso % 2 === 1 ? -0.16 : 0.16;
      const base = 0.34 + 0.32 * t;
      return Math.min(1, Math.max(0, base + onda));
    }
  }
}

/**
 * O nível do AERÓBIO nesta semana. Igual ao da força em tudo, menos num ponto: "estável".
 *
 * ## Por que existe
 *
 * Feedback de campo: "o trem tava montando o cardio tudo igual pra ele, não tava variando o
 * tempo, o volume, a intensidade". Estava certo, e a causa era literal: `nivelDaTendencia`
 * devolve 0,5 fixo para "estavel", e o macrociclo de grupo especial marca a primeira fase e
 * as fases de manutenção como estáveis. Resultado: duração e PSE idênticos, semana após
 * semana, no plano inteiro de quem tem condição declarada.
 *
 * ## O que muda
 *
 * Em bloco estável, a duração passa a fazer uma micro-oscilação DENTRO da mesma faixa já
 * citada, em torno do meio (0,38 a 0,62), em vez de travar no centro. É variabilidade de
 * dose, que é o princípio que o aeróbio complementar já invoca, e continua sendo o que
 * "estável" quer dizer: **não muda de patamar**, e não "é sempre igual".
 *
 * Nada de número novo: a oscilação anda dentro do intervalo que a diretriz citada define.
 * A força NÃO usa esta função: manter carga estável entre semanas é decisão clínica em fase
 * de adaptação, e mexer nela quebraria o `check:progressao`.
 */
function nivelAerobio(tend: Tendencia, t: number, semanaNoMeso: number, congelado?: boolean): number {
  /*
   * PATAMAR CONGELADO SEM CHAPAR O CARDIO.
   *
   * Congelar a rampa resolve a força, e sozinho reintroduziria no aeróbio exatamente o
   * defeito que esta função existe para consertar: com `t` fixo em 1, uma tendência "sobe"
   * ou "reduz" devolveria o mesmo número em todas as semanas da continuação, e o feedback de
   * campo que abriu esta função foi literalmente "o cardio tava tudo igual pra ele".
   *
   * Então a continuação mantém a MESMA variabilidade de sempre, só que em torno do patamar
   * alcançado em vez do meio da faixa. A amplitude é a mesma do ciclo estável (±0,12) e
   * segue dentro da faixa citada. Com "varia" nada é somado: a ondulatória já oscila por
   * conta própria, e empilhar as duas ondas só deixaria o número nervoso à toa.
   */
  if (congelado) {
    const base = nivelDaTendencia(tend, 1, semanaNoMeso);
    if (tend === "varia") return base;
    const ondaDoPatamar = [-0.12, 0, 0.12, 0];
    return Math.min(1, Math.max(0, base + ondaDoPatamar[(Math.max(1, semanaNoMeso) - 1) % ondaDoPatamar.length]));
  }
  if (tend !== "estavel") return nivelDaTendencia(tend, t, semanaNoMeso);
  // Ciclo de 4 semanas em torno do meio: leve, médio, mais longo, médio.
  const passo = [0.38, 0.5, 0.62, 0.5];
  return passo[(Math.max(1, semanaNoMeso) - 1) % passo.length];
}

/**
 * Nível CONGELADO de uma variável TRAVADA (onda MP-6): fica no patamar da primeira semana de
 * carga (sobe -> piso 0, reduz -> teto 1) ou no meio (estável/varia -> 0,5), constante em todas
 * as semanas. Assim uma variável travada pelo profissional não progride ao longo do mesociclo.
 */
function nivelCongelado(tend: Tendencia): number {
  return tend === "reduz" ? 1 : tend === "sobe" ? 0 : 0.5;
}

/** Colapsa a ponta aberta ("acima de 15" -> só tem piso) para poder posicionar dentro dela. */
function intervaloFechado(iv: Intervalo): Intervalo {
  const max = iv.max === Infinity ? iv.min : iv.max;
  const min = iv.min === 0 ? iv.max : iv.min; // "até N": progressão só teria teto
  return { min: Math.min(min, max), max: Math.max(min, max) };
}

/** Posiciona um ponto dentro de [min,max] pela fração `frac`, arredondando (inteiro ou 1 casa). */
function ponto(iv: Intervalo, frac: number, inteiro: boolean): number {
  const { min, max } = intervaloFechado(iv);
  const v = min + Math.min(Math.max(frac, 0), 1) * (max - min);
  if (inteiro) return Math.min(Math.max(Math.round(v), Math.round(min)), Math.round(max));
  return Math.round(v * 10) / 10;
}

/* ------------------------------------- origemRegraId ------------------------------------- */

/**
 * Qual RegraProgressao fundamenta a direção do alvo desta semana:
 * - descarga: `deload-rotina-gestao-fadiga` (magnitude declarada, evidência fraca);
 * - força: `objetivo-forca-prioriza-carga` (progressão liderada pela carga/intensidade);
 * - hipertrofia: `objetivo-hipertrofia-prioriza-volume` (progressão liderada pelo volume).
 * Nos demais objetivos, fica sem regra (não atribui uma regra que não os fundamenta).
 */
function origemRegra(ctx: CtxAlvo): string | undefined {
  if (ctx.tipoSemana === "deload") return "deload-rotina-gestao-fadiga";
  if (ctx.objetivo === "Força") return "objetivo-forca-prioriza-carga";
  if (ctx.objetivo === "Hipertrofia") return "objetivo-hipertrofia-prioriza-volume";
  return undefined;
}

/* ------------------------------------- Alvo da semana ------------------------------------- */

/**
 * Devolve o alvo concreto da semana, dentro da faixa citada, progredindo pela tendência.
 *
 * Levers, por construção, sem se atrapalharem:
 * - VOLUME anda em séries e repetições (sobe = mais, reduz = menos), pela tendenciaVolume;
 * - INTENSIDADE anda em carga relativa (%1RM, quando a faixa expressa) e em RIR (mais perto
 *   da falha), pela tendenciaIntensidade, sem depender das repetições (para não brigar com o
 *   volume quando as duas tendências sobem juntas);
 * - na descarga, o alvo REDUZ de verdade: menos séries que a última carga e RIR mais folgado,
 *   com carga relativa mais baixa, na magnitude modesta da regra declarada de descarga.
 */
export function alvoSemana(dose: DoseTextos, ctx: CtxAlvo): AlvoForca {
  const seriesIv = intervaloDe(dose.series);
  const repsIv = intervaloDe(dose.reps);
  const pctIv = faixaPct1RM(dose.intensidade) ?? (dose.intensidadeNota ? faixaPct1RM(dose.intensidadeNota) : null);
  const rirIv = faixaRIR(dose.intensidade) ?? (dose.intensidadeNota ? faixaRIR(dose.intensidadeNota) : null);
  const intervaloIv = intervaloDe(dose.intervalo);
  const intervaloUn = unidade(dose.intervalo);

  const alvo: AlvoForca = { origemRegraId: origemRegra(ctx) };
  const t = fracaoCarga(ctx);

  // Travas do profissional (onda MP-6): uma variável travada tem o nível CONGELADO (não progride).
  const travas = ctx.variaveisTravadas ?? [];
  const volTravado = travas.includes("volume");
  const intTravado = travas.includes("intensidade");

  // Níveis de volume e intensidade desta semana de CARGA (0..1). Travado = congelado. O perfil
  // clínico comprime a rampa em torno do ponto de partida dela (ver `comPasso`).
  const nivelVolume = comPasso(
    comPiso(volTravado ? nivelCongelado(ctx.tendenciaVolume) : nivelDaTendencia(ctx.tendenciaVolume, t, ctx.semanaNoMeso), ctx.pisoDoCiclo),
    comPiso(nivelDaTendencia(ctx.tendenciaVolume, 0, ctx.semanaNoMeso), ctx.pisoDoCiclo),
    volTravado ? undefined : ctx.fatorProgressao,
  );
  const nivelInt = comPasso(
    comPiso(intTravado ? nivelCongelado(ctx.tendenciaIntensidade) : nivelDaTendencia(ctx.tendenciaIntensidade, t, ctx.semanaNoMeso), ctx.pisoDoCiclo),
    comPiso(nivelDaTendencia(ctx.tendenciaIntensidade, 0, ctx.semanaNoMeso), ctx.pisoDoCiclo),
    intTravado ? undefined : ctx.fatorProgressao,
  );

  if (ctx.tipoSemana === "deload") {
    // A descarga parte do alvo da ÚLTIMA semana de carga (teto do meso) e reduz honestamente. Se a
    // variável está travada, o "teto" dela é o próprio nível congelado (a descarga reduz a partir daí).
    // Ancoragem na semana de carga MAIS LEVE do bloco (ver nivelMinimoDeCarga), e não na
    // última. Com a última, na ondulatória a descarga saía idêntica a semanas de carga.
    const maisLeveDoBloco = niveisDaCargaMaisLeve(ctx, seriesIv, repsIv);
    const nvUltima = comPiso(volTravado ? nivelCongelado(ctx.tendenciaVolume) : maisLeveDoBloco.nv, ctx.pisoDoCiclo);
    const niUltima = comPiso(intTravado ? nivelCongelado(ctx.tendenciaIntensidade) : maisLeveDoBloco.ni, ctx.pisoDoCiclo);
    if (seriesIv) {
      const maisLeve = ponto(seriesIv, nvUltima, true);
      const piso = Math.round(intervaloFechado(seriesIv).min);
      alvo.seriesAlvo = Math.max(piso, maisLeve - 1); // menos uma série que a carga mais leve
    }
    // As repetições acompanham a última carga (a redução de volume vem das séries e da
    // frequência). Elas seguem a INTENSIDADE, como na semana de carga: a descarga mantém a
    // mesma repetição do fim do bloco e alivia por séries, RIR e carga relativa.
    if (repsIv) {
      const acompanhando = ponto(repsIv, 1 - niUltima, true);
      // Se as séries já estavam no piso da faixa, elas não tinham como cair, e a descarga
      // sairia com o MESMO volume da semana de carga mais leve. Nesse caso a redução tem
      // que vir das repetições, senão a semana de descarga não descarrega nada.
      const seriesNaoCairam =
        seriesIv != null && alvo.seriesAlvo === Math.round(intervaloFechado(seriesIv).min) &&
        alvo.seriesAlvo === ponto(seriesIv, nvUltima, true);
      const pisoReps = Math.round(intervaloFechado(repsIv).min);
      alvo.repsAlvo = seriesNaoCairam ? Math.max(pisoReps, acompanhando - 1) : acompanhando;
    }
    if (pctIv) {
      // Carga relativa mais baixa na descarga (esforço menor), sem sair da faixa.
      alvo.cargaRelativaAlvo = ponto(pctIv, Math.max(0, niUltima * 0.6), false);
    }
    if (rirIv) {
      // RIR mais folgado: uma reserva a mais que a última carga, sem passar do teto da faixa.
      const ultimoRir = ponto(rirIv, 1 - niUltima, true);
      const teto = Math.round(intervaloFechado(rirIv).max);
      alvo.rirAlvo = Math.min(teto, ultimoRir + 1);
    }
    if (intervaloIv && intervaloUn) {
      const seg = intervaloFechado({ min: intervaloIv.min * intervaloUn, max: (intervaloIv.max === Infinity ? intervaloIv.min : intervaloIv.max) * intervaloUn });
      alvo.intervaloAlvoSeg = arredonda5(ponto(seg, niUltima, false));
    }
    return aplicarDoseDoPerfil(alvo, ctx, { rirIv, pctIv, intervaloIv, intervaloUn });
  }

  /*
   * REPETIÇÃO É DOSE DE CARGA, NÃO DE VOLUME.
   *
   * Ela seguia o nível de VOLUME, e a leitura era coerente na aritmética (mais repetição =
   * mais volume) e incoerente na sala. Num mesociclo de "Acúmulo" do modelo de blocos, o
   * volume sobe, então a repetição partia do PISO da faixa citada: um plano de Força para
   * avançado abria a semana 1 com "3 séries de 1 repetição, intensidade alta, 3 a 5 min de
   * descanso". Isso não é acúmulo, é teste de carga máxima, e ninguém assina isso.
   *
   * O piso de uma faixa de repetições é sempre a ponta MAIS PESADA, não a mais leve. Então a
   * repetição passa a andar com a INTENSIDADE, invertida, junto com o RIR: intensidade sobe,
   * repetição cai, carga sobe. O volume continua subindo pelas SÉRIES, que é onde ele de fato
   * mora. O efeito nos três blocos clássicos é o que o professor espera:
   *   - acúmulo (volume sobe, intensidade estável): mesma repetição, mais séries;
   *   - intensificação (volume estável, intensidade sobe): menos repetição, mesmas séries;
   *   - realização (volume reduz, intensidade sobe): menos repetição e menos séries.
   * Nenhum número novo entra: a repetição continua dentro da mesma faixa citada.
   */
  /*
   * PERFIL COM CAUTELA DECLARADA COMEÇA NO PISO DAS SÉRIES E SOBE DE LÁ.
   *
   * Mesmo `partirDoPiso` que já valia para a duração do aeróbio, agora também no volume de
   * força. Duas coisas se resolvem com isto, e as duas foram medidas.
   *
   * A primeira é a ESTAGNAÇÃO. Em 36 dos 432 planos do produto cartesiano, todos de
   * Resistência muscular com iniciante e condição declarada, a dose de força saía
   * "3x15, 90 s" em TODAS as 12 semanas de carga. A causa: a faixa cita repetições "acima
   * de 15" e intervalo "até 90 s", que são pontas abertas e degeneram num valor único, então
   * a única variável livre era a série, e ela já nascia no TETO de "2 a 3". Sem piso para
   * subir, o plano prometia progressão e entregava a mesma semana doze vezes.
   *
   * A segunda é a DOSE INICIAL. Uma idosa de 72 anos com osteoporose, iniciante, recebia 5
   * séries por exercício já na semana 1, que é o teto de "3 a 5". Começar no piso e caminhar
   * até o teto é o que a própria condição declara em `cuidados` como progressão gradual.
   *
   * Nenhum número novo: o piso e o teto são os da faixa que o objetivo já cita.
   */
  /*
   * SÓ QUANDO A TENDÊNCIA NÃO É "reduz".
   *
   * `partirDoPiso` multiplica o nível por `t`, o que para uma tendência que SOBE ou que fica
   * estável significa "comece embaixo e chegue lá". Para a tendência "reduz", cujo nível já
   * é `1 - t`, o produto vira `(1 - t) * t`: zero no começo, pico no meio, zero no fim. Uma
   * CORCOVA. O check:core pegou na hora, em 12 planos: "LINEAR ONDULOU (grupo obesidade
   * grau III): o bloco 3 tem MAIS volume (455,0) que o anterior (413,5)". O modelo linear
   * anunciava rampa e entregava onda, que é exatamente o defeito que o Filipe apontou e que
   * eu acabaria reintroduzindo por outra porta.
   *
   * Numa tendência que reduz, o bloco já termina no piso: forçar o início no piso não é
   * cautela, é contradizer a própria tendência declarada.
   *
   * CONSEQUÊNCIA HONESTA, para o parágrafo da idosa acima não parecer mais do que é: nas
   * jornadas cujo modelo é o LINEAR (tendência de volume "reduz"), este `partirDoPiso` das
   * séries NÃO age, e a semana 1 continua no teto de séries da faixa (5 de "3 a 5" para a
   * osteoporose), com a cautela expressa só pela intensidade (RIR alto). Fazer a cautela
   * vencer a direção do modelo é decisão de produto, escalada ao Filipe, porque muda a
   * identidade do modelo prescrito.
   */
  const nvSeries = ctx.partirDoPiso && ctx.tendenciaVolume !== "reduz" ? nivelVolume * t : nivelVolume;
  if (seriesIv) alvo.seriesAlvo = ponto(seriesIv, nvSeries, true);
  if (repsIv) alvo.repsAlvo = ponto(repsIv, 1 - nivelInt, true);
  if (pctIv) alvo.cargaRelativaAlvo = ponto(pctIv, nivelInt, false);
  // RIR anda ao contrário da intensidade: mais intensidade = menos reserva (mais perto da falha).
  if (rirIv) alvo.rirAlvo = ponto(rirIv, 1 - nivelInt, true);
  if (intervaloIv && intervaloUn) {
    const seg = intervaloFechado({ min: intervaloIv.min * intervaloUn, max: (intervaloIv.max === Infinity ? intervaloIv.min : intervaloIv.max) * intervaloUn });
    // Mais intensidade pede mais descanso: o intervalo-alvo acompanha a intensidade.
    alvo.intervaloAlvoSeg = arredonda5(ponto(seg, nivelInt, false));
  }
  return aplicarDoseDoPerfil(alvo, ctx, { rirIv, pctIv, intervaloIv, intervaloUn });
}

/**
 * O PERFIL CLÍNICO ENTRA DEPOIS DE ESCOLHER O PONTO NA FAIXA, E SÓ APERTA.
 *
 * Roda no ramo de carga E no de descarga, de propósito: uma cautela que valesse só na
 * semana de carga deixaria a descarga com o intervalo mais curto que a carga, que é o
 * contrário do que descarga quer dizer.
 *
 * Todos os três limites são de UMA MÃO SÓ. `Math.min` no %1RM e `Math.max` no RIR e no
 * intervalo garantem que o perfil clínico nunca torne a dose MAIS agressiva: no pior caso
 * ele não muda nada. É a mesma regra do teto de PSE, e existe porque um "modificador" que
 * pudesse subir carga seria uma porta para o motor endurecer a prescrição de quem tem
 * condição, que é o inverso do produto.
 */
function aplicarDoseDoPerfil(
  alvo: AlvoForca,
  ctx: CtxAlvo,
  faixas: {
    rirIv: { min: number; max: number } | null;
    pctIv: { min: number; max: number } | null;
    intervaloIv: { min: number; max: number } | null;
    intervaloUn: number | null;
  },
): AlvoForca {
  // Carga relativa: teto do perfil, onde a faixa do objetivo expressa %1RM.
  if (alvo.cargaRelativaAlvo != null && ctx.cargaRelativaMax != null)
    alvo.cargaRelativaAlvo = Math.min(alvo.cargaRelativaAlvo, ctx.cargaRelativaMax);

  // RIR mínimo: nunca mais perto da falha que o perfil admite, sem passar do teto da faixa.
  if (alvo.rirAlvo != null && ctx.rirMinimo != null) {
    const teto = faixas.rirIv ? Math.round(intervaloFechado(faixas.rirIv).max) : ctx.rirMinimo;
    alvo.rirAlvo = Math.min(teto, Math.max(alvo.rirAlvo, ctx.rirMinimo));
  }

  // Intervalo: a metade SUPERIOR da faixa que o objetivo já cita. Não é número clínico
  // novo, é consistência: quem declara teto de esforço não pode receber o descanso que
  // maximiza o esforço para a mesma carga.
  if (ctx.intervaloFolgado && faixas.intervaloIv && faixas.intervaloUn) {
    const seg = intervaloFechado({
      min: faixas.intervaloIv.min * faixas.intervaloUn,
      max: (faixas.intervaloIv.max === Infinity ? faixas.intervaloIv.min : faixas.intervaloIv.max) * faixas.intervaloUn,
    });
    const meio = (seg.min + seg.max) / 2;
    const atual = alvo.intervaloAlvoSeg ?? seg.min;
    // Reescala o ponto atual para a metade de cima, preservando a progressão relativa que a
    // tendência de intensidade já tinha imprimido nele.
    const fracao = seg.max > seg.min ? (atual - seg.min) / (seg.max - seg.min) : 0;
    alvo.intervaloAlvoSeg = Math.max(atual, arredonda5(meio + fracao * (seg.max - meio)));
  }
  return alvo;
}

/** Arredonda segundos para o múltiplo de 5 mais próximo (intervalos são anotados em passos). */
function arredonda5(seg: number): number {
  return Math.max(0, Math.round(seg / 5) * 5);
}

/* =============================== Alvo aeróbio da semana (MP-4) =============================== */

/**
 * Os campos de alvo que o motor grava no bloco AERÓBIO. Todos opcionais e dentro das faixas
 * citadas. A zona de FC (zonaFC/percentFCRAlvo) só aparece quando há idade + FCrep medida.
 */
export interface AlvoAerobio {
  duracaoAlvoMin?: number;
  rpeAlvo?: number;
  zonaFC?: string;
  percentFCRAlvo?: { min: number; max: number };
  velocidade?: string;
  inclinacao?: string;
  origemRegraId?: string;
}

/** As faixas-texto do aeróbio (duração e intensidade citadas) que o alvo vai concretizar. */
export interface DoseAerobioTextos {
  /** faixa de duração citada, ex.: "20 a 40 min" */
  duracao: string;
  /** texto de intensidade, ex.: "Moderada: cerca de 64 a 76% da FCmáx (...; RPE 4 a 6 de 10)" */
  intensidade: string;
}

/**
 * Extrai o intervalo de PSE (RPE, escala 0 a 10) de um texto ("RPE 4 a 6 de 10" -> {4,6}).
 * Só quando o texto fala de RPE, para não confundir com o percentual de FC.
 */
function faixaRPE(texto: string): Intervalo | null {
  if (!/\bRPE\b/i.test(texto)) return null;
  const range = texto.match(/RPE\s*(\d+(?:[.,]\d+)?)\s*(?:a|até)\s*(\d+(?:[.,]\d+)?)/i);
  if (range) return { min: n(range[1]), max: n(range[2]) };
  const solo = texto.match(/RPE\s*(\d+(?:[.,]\d+)?)/i);
  if (solo) return { min: n(solo[1]), max: n(solo[1]) };
  return null;
}

/**
 * Extrai o intervalo de percentual da FCmáx de um texto ("64 a 76% da FCmáx" -> {64,76}). Só
 * quando o texto realmente fala de FCmáx: assim o RPE ("RPE 4 a 6") não vira percentual.
 */
function faixaPctFCmax(texto: string): Intervalo | null {
  if (!/FC\s*m[aá]x/i.test(texto)) return null;
  const range = texto.match(/(\d+(?:[.,]\d+)?)\s*(?:a|até)\s*(\d+(?:[.,]\d+)?)\s*%/i);
  if (range) return { min: n(range[1]), max: n(range[2]) };
  const solo = texto.match(/(\d+(?:[.,]\d+)?)\s*%/i);
  if (solo) return { min: n(solo[1]), max: n(solo[1]) };
  return null;
}

/**
 * Devolve o alvo concreto do aeróbio na semana, dentro das faixas citadas, progredindo pela
 * posição no mesociclo. Espelha a rampa da força, com as leituras próprias do cardio:
 *
 * - duracaoAlvoMin (VOLUME): rampa determinística dentro da faixa de duração, guiada pela
 *   tendência de volume do bloco (a primeira semana de carga parte do piso, a última chega ao
 *   teto); na descarga, cai para o piso citado (a dose mais leve). É a variável que progride
 *   primeiro (regra declarada aerobio-progressao-fittvp: volume/duração antes da intensidade).
 * - rpeAlvo (ESFORÇO): PSE-alvo dentro da faixa de RPE citada, guiado pela tendência de
 *   INTENSIDADE do bloco. Como as tendências do mesociclo são escalonadas (uma sobe por vez),
 *   enquanto a duração sobe o RPE fica estável, e vice-versa: uma variável por vez.
 * - zonaFC/percentFCRAlvo: SÓ quando há idade E FCrep medida. Sem esses dados, não inventa
 *   zona; o alvo guia por duração + PSE, que é como o produto já orienta o aeróbio.
 *
 * Determinístico e puro: as mesmas entradas dão sempre o mesmo alvo.
 */
export function alvoAerobioSemana(dose: DoseAerobioTextos, ctx: CtxAlvo): AlvoAerobio {
  const durIv = intervaloDe(dose.duracao);
  const rpeIv = faixaRPE(dose.intensidade);
  const pctFCmaxIv = faixaPctFCmax(dose.intensidade);

  // A magnitude da duração progride como PARTIDA prudente (regra declarada), nunca como número
  // comprovado; por isso o bloco aeróbio aponta para a regra da progressão FITT-VP.
  const alvo: AlvoAerobio = { origemRegraId: "aerobio-progressao-fittvp" };
  const t = fracaoCarga(ctx);

  if (ctx.tipoSemana === "deload") {
    // Descarga: a dose mais leve das faixas citadas (piso de duração e de esforço), sempre
    // abaixo da última semana de carga. Reduzir de verdade, sem sair da faixa.
    if (durIv) alvo.duracaoAlvoMin = Math.round(intervaloFechado(durIv).min);
    if (rpeIv) alvo.rpeAlvo = Math.round(intervaloFechado(rpeIv).min);
  } else {
    /*
     * A DURAÇÃO DO CARDIO NUNCA HERDA O "reduz" DA FORÇA.
     *
     * Na força, "reduz volume + sobe intensidade" é o linear clássico: menos repetições com
     * a mesma reserva é mais carga na barra, uma coisa compensa a outra. No cardio não
     * existe essa compensação: a variável de dose é a própria duração, e a regra que este
     * bloco cita (aerobio-progressao-fittvp: duração progride ANTES da intensidade) manda a
     * rampa partir do piso e subir. O código fazia o contrário, medido em dois sabores:
     *
     *   - sem partirDoPiso (ansiedade/depressão, linear): 40 min na SEMANA 1 de um
     *     iniciante, o teto da faixa "20 a 40", caindo para 20 no fim. Um plano de
     *     emagrecimento cuja dose aeróbia só encolhe, contradizendo o próprio raciocínio
     *     impresso ("a meta semanal de atividade pesa mais que qualquer detalhe").
     *   - com partirDoPiso (hipertensão estágio 2, linear): (1 - t) * t, a CORCOVA que o
     *     check:core já tinha flagrado nas séries de força: 20, 25, 20. O plano "linear"
     *     começava e terminava na mesma duração.
     *
     * "reduz" vira "sobe" SÓ para a duração; o PSE segue a tendência de intensidade, a
     * ondulatória segue variando e a continuação congela no patamar (agora o teto real
     * alcançado, coerente com "manutenção sustenta o pico").
     */
    const tendDuracao = ctx.tendenciaVolume === "reduz" ? "sobe" : ctx.tendenciaVolume;
    // Travas do profissional (onda MP-6): volume congela a duração; intensidade congela o PSE-alvo.
    const travas = ctx.variaveisTravadas ?? [];
    const nivelVolume = comPiso(travas.includes("volume") ? nivelCongelado(tendDuracao) : nivelAerobio(tendDuracao, t, ctx.semanaNoMeso, ctx.patamarCongelado), ctx.pisoDoCiclo);
    const nivelInt = comPiso(travas.includes("intensidade") ? nivelCongelado(ctx.tendenciaIntensidade) : nivelAerobio(ctx.tendenciaIntensidade, t, ctx.semanaNoMeso, ctx.patamarCongelado), ctx.pisoDoCiclo);
    // Perfil com cautela declarada parte do PISO da faixa citada e sobe de la (ver
    // ModDose.partirDoPiso). Sem isto, obesidade grau III recebia 40 min continuos na
    // semana 1, o teto da faixa "20 a 40 min", igual a um adulto sem condicao nenhuma.
    const nvDur = ctx.partirDoPiso ? nivelVolume * t : nivelVolume;
    if (durIv) alvo.duracaoAlvoMin = Math.round(ponto(durIv, nvDur, false));
    if (rpeIv) alvo.rpeAlvo = ponto(rpeIv, nivelInt, true);
  }

  // O teto do perfil clínico entra DEPOIS de escolher o ponto na faixa, e só rebaixa. Fica
  // aqui, e não dentro de cada ramo, para valer também na descarga: se o piso da faixa
  // citada já estiver acima do teto do aluno, quem manda é o teto.
  if (alvo.rpeAlvo != null && ctx.pseTeto != null) alvo.rpeAlvo = Math.min(alvo.rpeAlvo, ctx.pseTeto);

  /*
   * ZONA DE FC. Duas correções vieram da auditoria de evidência, e as duas eram de
   * ROTULAGEM e de domínio, não de aritmética.
   *
   * 1. A zona é calculada por PERCENTUAL DA FCMÁX, e não por Karvonen. O comentário antigo
   *    creditava a conta à regra `aerobio-zona-karvonen`, cujo critério é literalmente
   *    "FC = intensidade x (FCmax - FCrep) + FCrep". São métodos diferentes e discordam
   *    quando a FCrep é alta, que é justamente o idoso destreinado e o obeso, a população
   *    que este produto existe para servir. A fração de reserva que sai daqui é DERIVADA da
   *    zona em bpm, não a origem dela, e agora o nome diz isso.
   * 2. Com FCrep muito alta, o piso da zona podia cair ABAIXO do repouso do aluno: uma
   *    prescrição para treinar numa frequência que ele tem sentado. O clamp antigo escondia
   *    a fração negativa e deixava a zona impossível impressa no documento. Agora a zona
   *    inteira é suprimida nesse caso, e o alvo cai no caminho honesto que já existia
   *    (duração mais percepção de esforço), o mesmo destino de quem usa betabloqueador.
   *
   * FCmax por Tanaka (PMID 11153730, verificado: "208 - 0.7 x age"), regra
   * `aerobio-fcmax-estimada`. Nenhum número novo entra aqui.
   */
  const fcGuiaEsteAluno = !(ctx.parametrosInvalidos ?? []).includes("p-fc");
  if (fcGuiaEsteAluno && pctFCmaxIv && ctx.idade != null && ctx.fcRepouso != null) {
    const fcMax = 208 - 0.7 * ctx.idade;
    const fcRep = ctx.fcRepouso;
    const fcr = fcMax - fcRep; // reserva de frequência cardíaca
    const bpmMin = Math.round((pctFCmaxIv.min / 100) * fcMax);
    const bpmMax = Math.round((pctFCmaxIv.max / 100) * fcMax);
    // A zona só existe se ela for treinável: acima do repouso medido e com reserva positiva.
    if (fcr > 0 && fcMax > 0 && bpmMin > fcRep) {
      alvo.zonaFC = `${bpmMin} a ${bpmMax} bpm`;
      const pMin = Math.round(((bpmMin - fcRep) / fcr) * 100);
      const pMax = Math.round(((bpmMax - fcRep) / fcr) * 100);
      alvo.percentFCRAlvo = { min: Math.min(pMin, pMax), max: Math.max(pMin, pMax) };
    }
  }

  return alvo;
}

/* -------------------------------- Objetivo da semana (texto) -------------------------------- */

/**
 * Frase curta do objetivo da semana, derivada do tipo (carga/descarga) e das tendências do
 * mesociclo. Texto de exibição, sem travessão, sob o critério do profissional.
 */
export function objetivoDaSemana(tipo: TipoMicrociclo, tv: Tendencia, ti: Tendencia): string {
  if (tipo === "deload") return "Semana de descarga: aliviar a dose para recuperar e assimilar o estímulo.";
  if (tipo === "teste") return "Semana de teste: aferir o progresso com o volume mais enxuto.";
  if (tv === "varia" || ti === "varia") return "Alternar as ênfases ao longo da semana, dentro da faixa.";
  const sobeVol = tv === "sobe";
  const sobeInt = ti === "sobe";
  if (sobeVol && sobeInt) return "Progredir volume e intensidade juntos, dentro da faixa.";
  if (sobeVol) return "Somar volume aos poucos, mantendo a técnica.";
  if (sobeInt) return "Elevar a intensidade, mantendo a técnica e a margem.";
  if (tv === "reduz") return "Enxugar o volume para render a intensidade.";
  return "Consolidar a dose da semana, sem mudanças bruscas.";
}
