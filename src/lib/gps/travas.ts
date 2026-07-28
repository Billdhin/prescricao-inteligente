/**
 * Trava de variável por mesociclo (onda MP-6, critérios 15 e 16): quando o profissional trava
 * uma variável (volume, intensidade ou complexidade) de um bloco, este módulo RECALCULA os alvos
 * das semanas do bloco respeitando a decisão, para o plano exibido refletir que a variável não
 * progride mais.
 *
 * O recálculo re-deriva os campos de alvo (seriesAlvo, repsAlvo, rirAlvo, cargaRelativaAlvo,
 * intervaloAlvoSeg e, no aeróbio, duracaoAlvoMin/rpeAlvo) a partir dos MESMOS textos-faixa que já
 * vivem no bloco (mais a nota de intensidade do objetivo, onde muitas vezes está o RIR/%1RM), com
 * as travas do mesociclo passadas ao motor do alvo (que congela a variável travada). Preserva a
 * zona de FC do aeróbio (zonaFC/percentFCRAlvo/velocidade/inclinação), que depende de idade + FCrep
 * e não é recomputada aqui. Sem trava e num plano recém-gerado, o resultado é byte-idêntico ao do
 * gerador (mesmos textos + mesma nota + mesmo contexto -> mesmo alvo).
 */

import { getFaixa, type BlocoSessao, type Mesociclo } from "@/data/periodizacao";
import type { GpsObjetivo } from "@/lib/gps/engine";
import type { Nivel } from "@/data/types";
import type { ParamMonitorId } from "@/data/monitoringParameters";
import { alvoSemana, alvoAerobioSemana, type CtxAlvo } from "@/lib/gps/alvo";

export interface CtxRecalculo {
  objetivo: GpsObjetivo;
  nivel: Nivel;
  /** só personalizam a zona de FC do aeróbio; ausentes = sem zona recomputada (a antiga é preservada) */
  idade?: number;
  fcRepouso?: number;
  /**
   * Parâmetros que DEIXARAM de guiar a intensidade neste aluno (ver src/lib/gps/farmacos.ts).
   * Precisa chegar aqui: sem ele, travar uma variável ressuscitaria a zona de frequência
   * cardíaca que o sistema acabou de decidir que não guia este aluno (ver recalcularBloco).
   */
  parametrosInvalidos?: ParamMonitorId[];
}

/** Re-deriva o alvo de UM bloco a partir dos textos que ele já carrega, sob o contexto (e travas). */
function recalcularBloco(b: BlocoSessao, ctx: CtxAlvo, nota?: string): BlocoSessao {
  if (b.tipo === "aerobio") {
    if (b.duracao == null && b.intensidade == null) return b;
    const alvo = alvoAerobioSemana({ duracao: b.duracao ?? "", intensidade: b.intensidade ?? "" }, ctx);
    // Preserva zonaFC/percentFCRAlvo/velocidade/inclinação (dependem de idade + FCrep, não
    // recomputados aqui): só os campos derivados por posição são reescritos.
    const base: BlocoSessao = {
      ...b,
      duracaoAlvoMin: alvo.duracaoAlvoMin,
      rpeAlvo: alvo.rpeAlvo,
      origemRegraId: alvo.origemRegraId,
    };
    // EXCEÇÃO à preservação: quando a frequência cardíaca não guia mais este aluno, preservar
    // seria ressuscitar, num simples travar de variável, exatamente o número que o sistema
    // decidiu que não guia. A zona sai, e o bloco fica com duração mais percepção de esforço.
    if (!(ctx.parametrosInvalidos ?? []).includes("p-fc")) return base;
    return { ...base, zonaFC: undefined, percentFCRAlvo: undefined };
  }
  if (b.series == null && b.reps == null && b.intensidade == null && b.intervalo == null) return b;
  const alvo = alvoSemana(
    {
      series: b.series ?? "",
      reps: b.reps ?? "",
      intensidade: b.intensidade ?? "",
      intervalo: b.intervalo ?? "",
      intensidadeNota: nota,
    },
    ctx,
  );
  return { ...b, ...alvo };
}

/**
 * Recalcula os alvos de todas as semanas de um mesociclo respeitando suas `variaveisTravadas`.
 * Determinístico e puro (não toca o store). Chamado pelo editor ao travar/destravar uma variável.
 */
export function recalcularAlvosDoMeso(meso: Mesociclo, ctx: CtxRecalculo): Mesociclo {
  const faixa = getFaixa(ctx.objetivo);
  const nota = faixa.intensidade.nota;
  const cargaCount = meso.microciclos.filter((m) => m.tipo === "carga").length;
  const semanasDeCargaNoMeso = Math.max(1, cargaCount || meso.microciclos.length);

  let cargaIdx = 0;
  const microciclos = meso.microciclos.map((mic) => {
    const ehDeload = mic.tipo === "deload";
    // A descarga se ancora no teto do meso; as demais (carga/teste) ocupam a posição corrente.
    const semanaNoMeso = ehDeload ? semanasDeCargaNoMeso : (cargaIdx += 1);
    const cAlvo: CtxAlvo = {
      semanaNoMeso,
      semanasDeCargaNoMeso,
      tipoSemana: mic.tipo,
      tendenciaVolume: meso.tendenciaVolume,
      tendenciaIntensidade: meso.tendenciaIntensidade,
      nivel: ctx.nivel,
      objetivo: ctx.objetivo,
      idade: ctx.idade,
      fcRepouso: ctx.fcRepouso,
      parametrosInvalidos: ctx.parametrosInvalidos,
      variaveisTravadas: meso.variaveisTravadas,
    };
    return {
      ...mic,
      sessoes: mic.sessoes.map((s) => ({ ...s, blocos: s.blocos.map((b) => recalcularBloco(b, cAlvo, nota)) })),
    };
  });

  return { ...meso, microciclos };
}
