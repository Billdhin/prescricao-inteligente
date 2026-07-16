/**
 * Guardrail: nenhum número chega à tela sem definição.
 *
 * Roda com `npm run check:metricas`. Falha (exit 1) quando algum exercício declara
 * uma métrica cujo rótulo não existe em `src/data/metricasGlossario.ts`, direto ou
 * por apelido. Sem isso, a tela mostra "Transferência funcional 88" e não tem como
 * dizer o que é 88, qual a escala nem relativo a quê. Para um produto que vende
 * defesa técnica, número sem definição é passivo.
 *
 * Também acusa sinônimo de músculo: dois nomes para o mesmo músculo fazem o
 * Comparador criar duas linhas, e cada exercício aparece como "não listado" na linha
 * do outro. Já aconteceu com Isquiotibiais x Posteriores de coxa.
 */
import { exercises } from "../src/data/exercises";
import { getMetrica } from "../src/data/metricasGlossario";

let falhas = 0;

const semDef = new Map<string, string[]>();
for (const e of exercises) {
  for (const m of e.indiceEficiencia.metrics) {
    if (!getMetrica(m.nome)) {
      const arr = semDef.get(m.nome) ?? [];
      arr.push(e.slug);
      semDef.set(m.nome, arr);
    }
  }
}
if (semDef.size) {
  falhas += semDef.size;
  console.error(`\nMÉTRICAS SEM DEFINIÇÃO (${semDef.size}):`);
  for (const [nome, slugs] of semDef) {
    console.error(`  "${nome}" em ${slugs.join(", ")}`);
    console.error(`     defina em metricasGlossario.ts (METRICAS) ou aponte para uma existente (APELIDOS).`);
  }
}

// Sinônimos conhecidos: se voltarem à base, o Comparador volta a quebrar a linha.
const SINONIMOS: [string, string][] = [
  ["Posteriores de coxa", "Isquiotibiais"],
  ["Tríceps", "Tríceps braquial"],
  ["Bíceps", "Bíceps braquial"],
  ["Vastos do quadríceps", "Quadríceps"],
  ["Dorsais e romboides", "Latíssimo do dorso"],
];
const usados = new Set(exercises.flatMap((e) => e.ativacao.map((a) => a.musculo)));
for (const [proibido, canonico] of SINONIMOS) {
  if (usados.has(proibido)) {
    falhas++;
    console.error(`\nSINÔNIMO DE MÚSCULO: use "${canonico}" no lugar de "${proibido}" em ativacao[].musculo.`);
  }
}

if (falhas) {
  console.error(`\n${falhas} problema(s) de clareza de dados.\n`);
  process.exit(1);
}
console.log(`ok: ${exercises.length} exercícios, todas as métricas exibidas têm definição e o vocabulário de músculos está unificado.`);
