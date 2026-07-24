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
 * - A MAGNITUDE da descarga é a regra DECLARADA `deload-rotina-gestao-fadiga` (evidência
 *   fraca): reduz de forma honesta e modesta, sem vender a magnitude como ótima.
 * - Determinístico e puro: as mesmas entradas dão sempre o mesmo alvo.
 *
 * Este módulo é a fonte ÚNICA do alvo: `doseForca` (periodizacao.ts) delega a ele, e o
 * guardrail check:progressao lê os mesmos campos que ele grava.
 */

import { intervaloDe, unidade, type Intervalo } from "@/lib/gps/faixasParse";
import type { GpsObjetivo } from "@/lib/gps/engine";
import type { Nivel } from "@/data/types";
import type { Tendencia, TipoMicrociclo } from "@/data/periodizacao";

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

/* --------------------------------- Rampa determinística --------------------------------- */

/**
 * Fração 0..1 desta semana de carga dentro do mesociclo: a primeira semana de carga fica em
 * 0 (piso), a última em 1 (teto). Um único bloco de carga fica em 0 (não há para onde rampar).
 */
function fracaoCarga(ctx: CtxAlvo): number {
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
 * - "varia" (ondulatória): alterna semana a semana, de forma determinística, sem sair da
 *   faixa (semanas ímpares mais leves, pares mais fortes, dentro do intervalo).
 */
function nivelDaTendencia(tend: Tendencia, t: number, semanaNoMeso: number): number {
  switch (tend) {
    case "sobe":
      return t;
    case "reduz":
      return 1 - t;
    case "estavel":
      return 0.5;
    case "varia":
      return semanaNoMeso % 2 === 1 ? 0.34 : 0.66;
  }
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

  // Níveis de volume e intensidade desta semana de CARGA (0..1).
  const nivelVolume = nivelDaTendencia(ctx.tendenciaVolume, t, ctx.semanaNoMeso);
  const nivelInt = nivelDaTendencia(ctx.tendenciaIntensidade, t, ctx.semanaNoMeso);

  if (ctx.tipoSemana === "deload") {
    // A descarga parte do alvo da ÚLTIMA semana de carga (teto do meso) e reduz honestamente.
    const nvUltima = nivelDaTendencia(ctx.tendenciaVolume, 1, ctx.semanaNoMeso);
    const niUltima = nivelDaTendencia(ctx.tendenciaIntensidade, 1, ctx.semanaNoMeso);
    if (seriesIv) {
      const ultima = ponto(seriesIv, nvUltima, true);
      const piso = Math.round(intervaloFechado(seriesIv).min);
      alvo.seriesAlvo = Math.max(piso, ultima - 1); // menos uma série que a última carga
    }
    // As repetições acompanham a última carga (a redução de volume vem das séries e da frequência).
    if (repsIv) alvo.repsAlvo = ponto(repsIv, nvUltima, true);
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
    return alvo;
  }

  // Semana de carga: volume nas séries/reps, intensidade na carga relativa e no RIR.
  if (seriesIv) alvo.seriesAlvo = ponto(seriesIv, nivelVolume, true);
  if (repsIv) alvo.repsAlvo = ponto(repsIv, nivelVolume, true);
  if (pctIv) alvo.cargaRelativaAlvo = ponto(pctIv, nivelInt, false);
  // RIR anda ao contrário da intensidade: mais intensidade = menos reserva (mais perto da falha).
  if (rirIv) alvo.rirAlvo = ponto(rirIv, 1 - nivelInt, true);
  if (intervaloIv && intervaloUn) {
    const seg = intervaloFechado({ min: intervaloIv.min * intervaloUn, max: (intervaloIv.max === Infinity ? intervaloIv.min : intervaloIv.max) * intervaloUn });
    // Mais intensidade pede mais descanso: o intervalo-alvo acompanha a intensidade.
    alvo.intervaloAlvoSeg = arredonda5(ponto(seg, nivelInt, false));
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
    const nivelVolume = nivelDaTendencia(ctx.tendenciaVolume, t, ctx.semanaNoMeso);
    const nivelInt = nivelDaTendencia(ctx.tendenciaIntensidade, t, ctx.semanaNoMeso);
    if (durIv) alvo.duracaoAlvoMin = Math.round(ponto(durIv, nivelVolume, false));
    if (rpeIv) alvo.rpeAlvo = ponto(rpeIv, nivelInt, true);
  }

  // Zona de FC: só com idade + FCrep medida. FCmax por Tanaka (regra aerobio-fcmax-estimada);
  // a zona em bpm sai do percentual da FCmáx citado, personalizada pela FCmax do aluno; a
  // percentFCRAlvo é a fração de reserva equivalente (Karvonen, regra aerobio-zona-karvonen),
  // que usa a FCrep medida. Nenhum número novo: só o percentual já citado, a idade e a FCrep.
  if (pctFCmaxIv && ctx.idade != null && ctx.fcRepouso != null) {
    const fcMax = 208 - 0.7 * ctx.idade;
    const fcRep = ctx.fcRepouso;
    const fcr = fcMax - fcRep; // reserva de FC (Karvonen)
    if (fcr > 0 && fcMax > 0) {
      const bpmMin = Math.round((pctFCmaxIv.min / 100) * fcMax);
      const bpmMax = Math.round((pctFCmaxIv.max / 100) * fcMax);
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
