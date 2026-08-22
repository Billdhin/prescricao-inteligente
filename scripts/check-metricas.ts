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
import type { Exercise } from "../src/data/types";
import { compararMusculos, LIMIAR_ATIVA_MAIS } from "../src/lib/movement-lab/compararMusculos";
import { readFileSync } from "fs";

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

// 4. todo exercício tem perfil de restrição (etapa 4 do Prescrever depende dele para
//    ajustar o ranking; sem ele os avaliadores estruturais ficam neutros em silêncio).
for (const e of exercises) {
  if (!e.restricaoPerfil) erro(`SEM restricaoPerfil: ${e.slug} (ver src/data/restricao-perfis.ts).`);
}

/* ---------- 5. A COMPARAÇÃO MÚSCULO A MÚSCULO DA ABA COMPARAR ---------- */
/*
 * A aba Comparar do Laboratório confrontava o ALVO PRINCIPAL de um exercício com o alvo
 * principal do outro, que quase sempre é um músculo diferente, e explicava embaixo que os dois
 * números não se comparavam. O Filipe pediu duas vezes a lista de MÚSCULOS no lugar dos três
 * parâmetros, com a pergunta que define o desenho: "será que a marcha aquática ativa mais o
 * glúteo máximo do que o leg press 45°?".
 *
 * As regras abaixo travam as três formas de a correção se desfazer: músculo sumindo da tela,
 * ausência virando número, e selo de "ativa mais" coroando vencedor por diferença de ruído.
 */
{
  const pares: [Exercise, Exercise][] = [];
  for (const a of exercises) for (const b of exercises) if (a.slug !== b.slug) pares.push([a, b]);

  let comparacoesReais = 0;
  let selosEmitidos = 0;
  let linhasSoEmUm = 0;

  for (const [a, b] of pares) {
    const { nosDois, soEmUm } = compararMusculos(a, b);
    const uniao = new Set([...a.ativacao.map((m) => m.musculo), ...b.ativacao.map((m) => m.musculo)]);
    const saida = [...nosDois, ...soEmUm].map((l) => l.musculo);

    // Nada some e nada duplica: a tela mostra todo músculo que algum dos dois declara.
    if (saida.length !== uniao.size || new Set(saida).size !== saida.length)
      erro(
        `COMPARAÇÃO PERDE OU DUPLICA MÚSCULO (${a.slug} vs ${b.slug}): a união declara ${uniao.size} músculos e a saída tem ${saida.length} linhas (${new Set(saida).size} distintas).`,
      );
    for (const m of saida)
      if (!uniao.has(m)) erro(`MÚSCULO INVENTADO (${a.slug} vs ${b.slug}): "${m}" não é declarado por nenhum dos dois.`);

    for (const l of nosDois) {
      if (!l.a || !l.b)
        erro(`LINHA DE CONFRONTO SEM OS DOIS LADOS (${a.slug} vs ${b.slug}, ${l.musculo}): entrou em "nos dois" com um lado vazio.`);
      comparacoesReais++;
      const dif = Math.abs((l.a?.valor ?? 0) - (l.b?.valor ?? 0));
      if (l.diferenca !== dif)
        erro(`DIFERENÇA ERRADA (${a.slug} vs ${b.slug}, ${l.musculo}): a linha diz ${l.diferenca} e os valores dão ${dif}.`);
      // O selo só pode existir acima do limiar, e tem que apontar para o MAIOR.
      if (l.maisAtivado && dif < LIMIAR_ATIVA_MAIS)
        erro(
          `SELO ABAIXO DO LIMIAR (${a.slug} vs ${b.slug}, ${l.musculo}): coroou por ${dif} pontos e o limiar declarado é ${LIMIAR_ATIVA_MAIS}. Valor estimado de literatura não decide nada nessa margem.`,
        );
      if (!l.maisAtivado && dif >= LIMIAR_ATIVA_MAIS)
        erro(`SELO FALTANDO (${a.slug} vs ${b.slug}, ${l.musculo}): a diferença é de ${dif} pontos e a linha não diz quem ativa mais.`);
      if (l.maisAtivado) {
        selosEmitidos++;
        const maior = (l.a?.valor ?? 0) >= (l.b?.valor ?? 0) ? "a" : "b";
        if (l.maisAtivado !== maior)
          erro(`SELO NO LADO ERRADO (${a.slug} vs ${b.slug}, ${l.musculo}): apontou "${l.maisAtivado}" e o maior valor é o "${maior}".`);
      }
    }

    for (const l of soEmUm) {
      linhasSoEmUm++;
      if (Boolean(l.a) === Boolean(l.b))
        erro(`LINHA DE UM LADO SÓ COM OS DOIS (OU NENHUM) (${a.slug} vs ${b.slug}, ${l.musculo}).`);
      // AUSÊNCIA NÃO É ZERO: o lado que falta tem que ser ausente, nunca um número.
      if (l.a?.valor === 0 || l.b?.valor === 0)
        erro(`AUSÊNCIA VIROU ZERO (${a.slug} vs ${b.slug}, ${l.musculo}): músculo não declarado apareceu como 0, e 0 é uma afirmação que o dado não sustenta.`);
      if (l.maisAtivado)
        erro(`SELO SEM CONFRONTO (${a.slug} vs ${b.slug}, ${l.musculo}): coroou vencedor numa linha em que só um dos dois tem dado.`);
    }

    // Ordem decrescente pelo pico da linha, para o músculo mais trabalhado abrir a lista.
    const pico = (l: { a?: { valor: number }; b?: { valor: number } }) => Math.max(l.a?.valor ?? -1, l.b?.valor ?? -1);
    for (const lista of [nosDois, soEmUm])
      for (let k = 1; k < lista.length; k++)
        if (pico(lista[k]) > pico(lista[k - 1]))
          erro(`ORDEM FORA DE DECRESCENTE (${a.slug} vs ${b.slug}): "${lista[k].musculo}" (${pico(lista[k])}) veio depois de "${lista[k - 1].musculo}" (${pico(lista[k - 1])}).`);
  }

  /*
   * Um exercício contra ELE MESMO é o controle negativo: nenhum músculo pode ficar de fora do
   * confronto e ninguém pode ser coroado. Se isto passar a emitir selo, o limiar quebrou.
   */
  for (const e of exercises) {
    const { nosDois, soEmUm } = compararMusculos(e, e);
    if (soEmUm.length) erro(`ESPELHO COM LADO VAZIO (${e.slug}): comparado com ele mesmo, ${soEmUm.length} músculo(s) ficaram sem par.`);
    for (const l of nosDois)
      if (l.maisAtivado) erro(`ESPELHO COROOU VENCEDOR (${e.slug}, ${l.musculo}): o exercício ativa mais que ele mesmo.`);
  }

  // Controles positivos: sem eles as regras acima passam num resultado vazio.
  if (comparacoesReais < 1000) erro(`CONTROLE POSITIVO DA COMPARAÇÃO: só ${comparacoesReais} linhas de confronto no acervo inteiro.`);
  if (selosEmitidos < 100) erro(`CONTROLE POSITIVO DO SELO: só ${selosEmitidos} selos em todo o acervo; a regra do limiar perdeu o sentido.`);
  if (linhasSoEmUm < 100) erro(`CONTROLE POSITIVO DA AUSÊNCIA: só ${linhasSoEmUm} linhas de um lado só; a regra de ausência perdeu o sentido.`);

  /*
   * A tela precisa usar ESTA função. Sem isto, alguém reescreve a aba comparando ativacao[0]
   * com ativacao[0] de novo e o guardrail continua verde, medindo código que ninguém chama.
   */
  const tela = readFileSync("src/pages/MovementLabDetail.tsx", "utf8");
  // Procura a CHAMADA (com o parêntese), não o nome: a primeira versão desta regra passava
  // porque o comentário do componente citava "compararMusculos" em prosa, e o guardrail ficava
  // verde medindo texto em vez de código.
  if (!tela.includes("compararMusculos("))
    erro("ABA COMPARAR SEM A COMPARAÇÃO POR MÚSCULO: MovementLabDetail não chama compararMusculos, então a lógica travada aqui não é a que vai à tela.");
}

if (falhas) {
  console.error(`\n${falhas} problema(s) de clareza de dados.\n`);
  process.exit(1);
}
console.log(
  `ok: ${exercises.length} exercícios. Toda métrica exibida tem definição, o vocabulário de músculos é único, ` +
    `os rótulos de ativação batem com ativacao[] e todos têm perfil de restrição. A comparação músculo a músculo não perde músculo, não transforma ausência em zero e só coroa acima do limiar.`,
);
