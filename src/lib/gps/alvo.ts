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
