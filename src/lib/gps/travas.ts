/**
 * Trava de variável por mesociclo (onda MP-6, critérios 15 e 16): quando o profissional trava
 * uma variável (volume ou intensidade) de um bloco, este módulo CONGELA aquela variável no
 * patamar da primeira semana de carga, para o plano exibido refletir que ela não progride mais.
 *
 * Determinístico e puro (não toca o store). Preserva tudo o que a trava não pede para mudar,
 * e por isso não depende de nenhum contexto do gerador: sem trava, devolve o mesociclo
 * intacto. Ver o comentário de `recalcularAlvosDoMeso` para o defeito que essa mudança
 * corrigiu.
 *
 * Única exceção à preservação: quando a frequência cardíaca deixou de guiar este aluno
 * (`parametrosInvalidos` com "p-fc"), a zona de FC sai do bloco aeróbio, porque preservá-la
 * seria ressuscitar num travar de variável o número que o sistema decidiu que não guia.
 */

import type { BlocoSessao, Mesociclo } from "@/data/periodizacao";
import type { GpsObjetivo } from "@/lib/gps/engine";
import type { Nivel } from "@/data/types";
import type { ParamMonitorId } from "@/data/monitoringParameters";

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

/**
 * Campos de alvo que cada variável travável congela.
 *
 * A REPETIÇÃO ENTRA NAS DUAS, e isso é decisão, não descuido. Para o professor, volume é
 * séries vezes repetições, e travar volume tem que parar as duas. Para o motor, a repetição
 * segue a INTENSIDADE desde a correção que acabou com o "3 séries de 1 repetição" na semana
 * 1 de acúmulo: menos repetição com o mesmo esforço é mais carga na barra. Travar qualquer
 * uma das duas leituras precisa congelar a repetição, senão a trava mente para um dos dois.
 */
const CAMPOS_DA_VARIAVEL = {
  volume: ["seriesAlvo", "repsAlvo"],
  intensidade: ["rirAlvo", "cargaRelativaAlvo", "intervaloAlvoSeg", "repsAlvo"],
} as const;

/**
 * TRAVAR UMA VARIÁVEL CONGELA AQUELA VARIÁVEL, E SÓ ELA.
 *
 * ## O que estava errado
 *
 * Esta função re-derivava o alvo de TODAS as semanas do bloco a partir dos textos-faixa, e o
 * cabeçalho do arquivo prometia que, sem trava e em plano recém-gerado, o resultado seria
 * byte-idêntico ao do gerador. A promessa era verdadeira quando foi escrita e deixou de ser
 * quando o gerador ganhou contexto que `CtxRecalculo` não carrega: a rampa contínua no
 * macrociclo, o piso da onda do modelo de blocos e o passo de progressão do perfil clínico.
 *
 * O resultado, medido numa bateria funcional: num plano de hipertensão estágio 2 com
 * obesidade grau II, a fase de entrada saía do gerador como "4x12 RIR 3 · 4x12 RIR 3 · 4x11
 * RIR 3" e voltava desta função como "4x12 RIR 3 · 4x9 RIR 2 · 3x6 RIR 1". Ou seja, o
 * profissional travava (ou destravava) uma variável e o bloco inteiro era reescrito numa
 * progressão muito mais agressiva, terminando a terceira semana da fase de ADAPTAÇÃO perto da
 * falha. Sem aviso, sem erro, e no perfil que menos comporta isso.
 *
 * ## O que passa a valer
 *
 * A função para de recalcular o que ninguém pediu. Ela CONGELA a variável travada no valor da
 * primeira semana de carga (que é a definição de "não progride mais") e PRESERVA todo o resto
 * exatamente como está. Assim ela não depende de contexto nenhum do gerador e, por
 * construção, não tem como divergir dele: a promessa do cabeçalho volta a ser verdade porque
 * sem trava a função devolve o mesociclo intacto.
 *
 * A descarga fica de fora do congelamento de propósito: ela é a exceção declarada do bloco, e
 * congelá-la no patamar da primeira semana de carga tiraria dela justamente o alívio.
 */
export function recalcularAlvosDoMeso(meso: Mesociclo, ctx: CtxRecalculo): Mesociclo {
  const travas = meso.variaveisTravadas ?? [];
  const semFC = (ctx.parametrosInvalidos ?? []).includes("p-fc");

  // Nada travado e a frequência cardíaca ainda guia: não há o que recalcular.
  if (!travas.length && !semFC) return meso;

  // O patamar do congelamento é a PRIMEIRA semana de carga do bloco, por sessão e por posição
  // do bloco dentro dela, para que a ênfase da ondulatória ("pesado"/"moderado") seja
  // respeitada em vez de achatada.
  const primeiraCarga = meso.microciclos.find((m) => m.tipo === "carga");

  const congelar = (b: BlocoSessao, si: number, bi: number): BlocoSessao => {
    if (b.tipo === "aerobio") return b;
    const ref = primeiraCarga?.sessoes[si]?.blocos[bi];
    if (!ref || ref.tipo === "aerobio") return b;
    const out: Record<string, unknown> = { ...b };
    for (const v of travas) {
      for (const campo of CAMPOS_DA_VARIAVEL[v as keyof typeof CAMPOS_DA_VARIAVEL] ?? []) {
        if (ref[campo] != null) out[campo] = ref[campo];
      }
    }
    return out as unknown as BlocoSessao;
  };

  const microciclos = meso.microciclos.map((mic) => ({
    ...mic,
    sessoes: mic.sessoes.map((s, si) => ({
      ...s,
      blocos: s.blocos.map((b, bi) => {
        // A zona de frequência cardíaca sai quando ela deixou de guiar este aluno. Preservá-la
        // seria ressuscitar, num simples travar de variável, o número que o sistema acabou de
        // decidir que não guia.
        const semZona = semFC && b.tipo === "aerobio" ? { ...b, zonaFC: undefined, percentFCRAlvo: undefined } : b;
        // A descarga mantém o alívio dela; o congelamento vale para as semanas de carga.
        return mic.tipo === "deload" ? semZona : congelar(semZona, si, bi);
      }),
    })),
  }));

  return { ...meso, microciclos };
}
