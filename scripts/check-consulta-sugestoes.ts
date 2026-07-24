/**
 * Guardrail das sugestões de pergunta do Aprender.
 *
 * Roda com `npm run check:consulta`. Trava a regressão que o Filipe reportou:
 * sugestões de pergunta que, ao serem clicadas, caíam no EmptyState "não
 * encontramos uma resposta". A fonte única das sugestões é `SUGESTOES` de
 * `src/features/learning/pages/Consulta.tsx`; a Home reusa a mesma lista.
 *
 * Regra: TODO termo de `SUGESTOES` precisa produzir ao menos uma "Resposta
 * visual" (score > 0) contra os QuickAnswers atuais, usando o MESMO `pontuar`
 * que a UI usa. Se algum termo não achar resposta, o check falha e a publicação
 * trava (mesmo espírito de check:aprender / check:metricas).
 */
import { SUGESTOES, pontuar } from "../src/features/learning/pages/Consulta";
import { getLearningRepository } from "../src/features/learning/repository";

const answers = getLearningRepository().getQuickAnswers();
const erros: string[] = [];

for (const termo of SUGESTOES) {
  const matches = answers.filter((a) => pontuar(a, termo) > 0);
  if (matches.length === 0) {
    erros.push(
      `Sugestão "${termo}" não produz nenhuma Resposta visual (score > 0). ` +
        `Ajuste o termo ou os keywords/question/summary do QuickAnswer correspondente.`,
    );
  }
}

if (erros.length > 0) {
  console.error(`[check:consulta] FALHOU (${erros.length} sugestão(ões) sem resposta):`);
  for (const e of erros) console.error("  - " + e);
  process.exit(1);
}

console.log(
  `[check:consulta] ok: ${SUGESTOES.length} sugestões, ${answers.length} respostas rápidas. ` +
    `Toda sugestão acha ao menos uma Resposta visual.`,
);
