/**
 * Guardrail: nenhuma regra de progressão entra no motor sem referência real.
 *
 * Roda com `npm run check:regras`. O rulepack (src/data/regrasProgressao.ts) é a fonte
 * única de todo número de progressão do treino; este check garante que a fonte não minta:
 *
 * 1. TODO refId aponta para uma referência que existe em referencias.ts. Citar um estudo
 *    que não está na bibliografia é o mesmo que inventar a fonte do número.
 * 2. TODA regra "aprovada" (a que vai ao ar com número) tem ao menos uma referência.
 * 3. TODA regra tem versao >= 1 e confiança válida. O versionamento é o contrato de
 *    "mudou número, subiu versão"; sem ele o rastro de evidência se perde.
 * 4. NENHUMA regra "aprovada" tem confiança "fraca": evidência fraca é DECLARADA como
 *    "pendente" e não cravada, nunca vendida como aprovada.
 *
 * O check também recusa um rulepack vazio: sem regra, as verificações acima passariam
 * por vazio e a proteção sumiria inteira.
 */
import { REGRAS_PROGRESSAO } from "../src/data/regrasProgressao";
import { getReferencia } from "../src/data/referencias";

const CONFIANCAS = ["forte", "moderada", "fraca"];
const erros: string[] = [];

if (REGRAS_PROGRESSAO.length === 0) {
  erros.push("rulepack vazio: sem regra, este guardrail passaria por vazio.");
}

for (const regra of REGRAS_PROGRESSAO) {
  // 1. cada refId aponta para uma referência real
  for (const id of regra.refId) {
    if (!getReferencia(id)) {
      erros.push(`refId inexistente: a regra "${regra.id}" cita "${id}", que não está em referencias.ts.`);
    }
  }
  // 2. regra aprovada tem pelo menos um refId
  if (regra.aprovacao === "aprovada" && regra.refId.length === 0) {
    erros.push(`regra aprovada sem referência: "${regra.id}" está "aprovada" mas não cita nenhum refId.`);
  }
  // 3. versao válida e confiança válida
  if (!(regra.versao >= 1)) {
    erros.push(`versao inválida: a regra "${regra.id}" tem versao ${regra.versao} (esperado >= 1).`);
  }
  if (!CONFIANCAS.includes(regra.confianca)) {
    erros.push(`confiança inválida: a regra "${regra.id}" tem confianca "${regra.confianca}".`);
  }
  // 4. nenhuma regra aprovada com confiança fraca
  if (regra.aprovacao === "aprovada" && regra.confianca === "fraca") {
    erros.push(`aprovada com confiança fraca: "${regra.id}" deve ser declarada como "pendente" enquanto a evidência for fraca.`);
  }
}

if (erros.length) {
  console.error(`\n[check:regras] ${erros.length} problema(s):\n`);
  for (const e of erros) console.error(`  - ${e}`);
  console.error("");
  process.exit(1);
}
console.log(`[check:regras] ok: ${REGRAS_PROGRESSAO.length} regras, todas com referência real.`);
