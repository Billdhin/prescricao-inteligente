/**
 * Guardrail: nenhum número chega à tela sem definição, e o mesmo número não pode
 * aparecer com dois nomes diferentes.
 *
 * Roda com `npm run check:metricas`. Cada regra aqui nasceu de um bug real:
 *
 * 1. MÉTRICA SEM DEFINIÇÃO. A tela mostrava "Transferência funcional 88" e não tinha
 *    como dizer o que é 88, qual a escala nem relativo a quê. Para um produto que
 *    vende defesa técnica, número sem definição é passivo.
 * 2. SINÔNIMO DE MÚSCULO em `ativacao[].musculo`. Isquiotibiais e Posteriores de coxa
 *    eram o mesmo músculo com dois nomes; o Comparador criava duas linhas e cada
 *    exercício aparecia como "não listado" na linha do outro.
 * 3. RÓTULO DE MÚSCULO EM `metrics[]` QUE NÃO BATE COM `ativacao[]`. O card dizia
 *    "Posteriores 92" enquanto o mapa, na mesma tela, dizia "Isquiotibiais 92".
 *    Esta é a regra que faltava: a primeira versão do guardrail só varria `ativacao`
 *    e por isso deixou 31 rótulos desalinhados passarem.
 */
import { exercises } from "../src/data/exercises";
import { getMetrica } from "../src/data/metricasGlossario";

let falhas = 0;
const erro = (msg: string) => {
  falhas++;
  console.error(msg);
};

// 1. toda métrica exibida tem definição
for (const e of exercises) {
  for (const m of e.indiceEficiencia.metrics) {
    if (!getMetrica(m.nome)) {
      erro(
        `SEM DEFINIÇÃO: "${m.nome}" em ${e.slug}.\n` +
          `   Defina em metricasGlossario.ts (METRICAS) ou aponte para uma existente (APELIDOS).`,
      );
    }
  }
}

// 2. vocabulário único de músculo
const SINONIMOS: [string, string][] = [
  ["Posteriores de coxa", "Isquiotibiais"],
  ["Tríceps", "Tríceps braquial"],
  ["Bíceps", "Bíceps braquial"],
  ["Vastos do quadríceps", "Quadríceps"],
  ["Dorsais e romboides", "Latíssimo do dorso"],
  ["Glúteos", "Glúteo máximo"],
  ["Peitoral", "Peitoral maior"],
  ["Dorsais", "Latíssimo do dorso"],
  ["Costas", "Latíssimo do dorso"],
  ["Costas (espessura)", "Latíssimo do dorso"],
  ["Deltoides", "Deltoide"],
  ["Posteriores", "Isquiotibiais"],
];
for (const e of exercises) {
  const nomes = [...e.ativacao.map((a) => a.musculo), ...e.indiceEficiencia.metrics.map((m) => m.nome)];
  for (const [proibido, canonico] of SINONIMOS) {
    if (nomes.includes(proibido)) erro(`SINÔNIMO em ${e.slug}: use "${canonico}" no lugar de "${proibido}".`);
  }
}

// 3. rótulo de métrica que é músculo tem de existir, com o mesmo nome, em ativacao
for (const e of exercises) {
  const porNome = new Map(e.ativacao.map((a) => [a.musculo, a.percentual]));
  for (const m of e.indiceEficiencia.metrics) {
    if (getMetrica(m.nome)?.id !== "ativacao") continue;
    if (!porNome.has(m.nome)) {
      const mesmoValor = e.ativacao.find((a) => a.percentual === m.valor)?.musculo;
      erro(
        `RÓTULO DESALINHADO em ${e.slug}: métrica "${m.nome}" ${m.valor} não existe em ativacao[].` +
          (mesmoValor ? ` O mesmo valor está lá como "${mesmoValor}": use esse nome.` : ""),
      );
    } else if (porNome.get(m.nome) !== m.valor) {
      erro(
        `VALOR DIVERGENTE em ${e.slug}: métrica "${m.nome}" = ${m.valor}, mas ativacao diz ${porNome.get(m.nome)}.`,
      );
    }
  }
}

if (falhas) {
  console.error(`\n${falhas} problema(s) de clareza de dados.\n`);
  process.exit(1);
}
console.log(
  `ok: ${exercises.length} exercícios. Toda métrica exibida tem definição, o vocabulário de músculos é único ` +
    `e os rótulos de ativação batem com ativacao[].`,
);
