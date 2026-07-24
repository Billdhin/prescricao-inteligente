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
 */
export function assinaturaSemana(m: Microciclo): string {
  return JSON.stringify({
    tipo: m.tipo,
    sessoes: m.sessoes.map((s) => ({
      nome: s.nome,
      blocos: s.blocos.map((b) => [b.nome, b.series, b.reps, b.intensidade, b.intervalo, b.formato, b.duracao, b.recuperacao, b.metodo, b.grupoMetodo]),
    })),
  });
}

/**
 * Só as variáveis de CARGA, sem o nome do exercício: séries/reps/intensidade/intervalo da
 * força e formato/duração do aeróbio. Detecta "mesma dose" mesmo quando os exercícios
 * mudam. Usada pelo check:progressao (critério "não repetir a dose toda semana").
 */
export function assinaturaCarga(m: Microciclo): string {
  return JSON.stringify(
    m.sessoes.map((s) =>
      s.blocos.map((b) =>
        b.tipo === "aerobio"
          ? { a: [b.formato ?? null, b.duracao ?? null] }
          : { f: [b.series ?? null, b.reps ?? null, b.intensidade ?? null, b.intervalo ?? null] },
      ),
    ),
  );
}
