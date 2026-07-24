/**
 * Assinatura de uma semana (microciclo): o texto que diz "esta semana é igual àquela".
 *
 * Extraído do `chave()` local do exportPlano.ts para virar fonte única. O PDF usa
 * `assinaturaSemana` para fundir semanas idênticas numa linha só (comportamento
 * byte-idêntico ao anterior); o guardrail check:progressao usa `assinaturaCarga` para
 * detectar "a mesma dose toda semana".
 *
 * As duas assinaturas respondem a perguntas diferentes:
 * - `assinaturaSemana`: a semana INTEIRA se repete? (tipo + nome da sessão + todos os
 *   campos do bloco, inclusive o exercício e a técnica de série). É o que o PDF agrupa.
 * - `assinaturaCarga`: a DOSE se repete? (só séries/reps/intensidade/intervalo da força e
 *   formato/duração do aeróbio, SEM o nome do exercício). Duas semanas com exercícios
 *   diferentes mas a mesma dose contam como "mesma carga".
 */

import type { Microciclo } from "@/data/periodizacao";

/**
 * Semana inteira serializada. `metodo` e `grupoMetodo` entram na chave: semanas que
 * diferem só na técnica de série (um bi-set numa, tradicional noutra) não se fundem.
 *
 * O ALVO da força (seriesAlvo, repsAlvo, rirAlvo, cargaRelativaAlvo, intervaloAlvoSeg) também
 * entra: duas semanas que só diferem no alvo (a dose que PROGREDIU) deixam de ser fundidas
 * pelo PDF, que passa a mostrar a progressão em vez de uma linha só. Comportamento desejado
 * da onda MP-3; planos antigos (sem alvo) mantêm a fusão como antes.
 */
export function assinaturaSemana(m: Microciclo): string {
  return JSON.stringify({
    tipo: m.tipo,
    sessoes: m.sessoes.map((s) => ({
      nome: s.nome,
      blocos: s.blocos.map((b) => [
        b.nome, b.series, b.reps, b.intensidade, b.intervalo, b.formato, b.duracao, b.recuperacao, b.metodo, b.grupoMetodo,
        b.seriesAlvo, b.repsAlvo, b.rirAlvo, b.cargaRelativaAlvo, b.intervaloAlvoSeg,
      ]),
    })),
  });
}

/**
 * Só as variáveis de CARGA, sem o nome do exercício: séries/reps/intensidade/intervalo e o
 * ALVO da força; formato/duração do aeróbio. Detecta "mesma dose" mesmo quando os exercícios
 * mudam. Usada pelo check:progressao (critério "não repetir a dose toda semana"): com o alvo,
 * semanas que progridem passam a ter assinaturas diferentes.
 */
export function assinaturaCarga(m: Microciclo): string {
  return JSON.stringify(
    m.sessoes.map((s) =>
      s.blocos.map((b) =>
        b.tipo === "aerobio"
          ? { a: [b.formato ?? null, b.duracao ?? null] }
          : {
              f: [b.series ?? null, b.reps ?? null, b.intensidade ?? null, b.intervalo ?? null],
              alvo: [b.seriesAlvo ?? null, b.repsAlvo ?? null, b.rirAlvo ?? null, b.cargaRelativaAlvo ?? null, b.intervaloAlvoSeg ?? null],
            },
      ),
    ),
  );
}
