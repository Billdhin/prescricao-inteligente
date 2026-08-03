/**
 * GUARDRAIL: estimativa funcional sem fonte, sem limite e sem conta conferida
 * não entra no produto.
 *
 * O risco de uma calculadora de 1RM e de VO₂ não é ela estar vazia: é ela
 * devolver um número plausível com uma casa decimal, que o profissional copia
 * para a prescrição e assina embaixo. Um coeficiente trocado num refactor não
 * quebra tela nenhuma, não gera erro de tipo, e passa despercebido para sempre.
 * Por isso as três equações são reconferidas aqui contra valores calculados à
 * mão a partir das publicações.
 *
 * O que este check trava:
 *   1. FONTE: toda estimativa cita referência que EXISTE em referencias.ts e é
 *      verificável em um clique (DOI ou PMID).
 *   2. HONESTIDADE: fórmula por extenso e limite declarados, sempre.
 *   3. DOMÍNIO: campos com faixa coerente, e valor fora da faixa NÃO produz
 *      resultado (equação de campo extrapolada mente com confiança).
 *   4. CONTA: regressão numérica das três equações.
 *   5. LIMITE DA PREDIÇÃO DE 1RM: acima de 10 repetições a estimativa avisa
 *      (é o achado de Mayhew 2008, e é o motivo de a referência estar lá).
 *   6. DESTINO: a categoria do teste gerado existe na lista da avaliação, senão
 *      o registro cai numa categoria que o formulário não sabe exibir.
 *   7. VOZ: nada de travessão em texto visível.
 *
 * Roda com `npm run check:estimativas`.
 */
import { readFileSync } from "node:fs";
import { estimativas, memoriaDeCalculo } from "../src/lib/avaliacao/estimativas";
import { getReferencia } from "../src/data/referencias";

const problemas: string[] = [];
const erro = (m: string) => problemas.push(m);

/* ------------------------- 1, 2, 3, 6 e 7: por estimativa ------------------------- */

const modal = readFileSync("src/components/app/AvaliacaoModal.tsx", "utf8");
const blocoCategorias = modal.match(/const TESTE_CATEGORIAS = \[([\s\S]*?)\];/)?.[1] ?? "";
if (!blocoCategorias) erro("Nao achei TESTE_CATEGORIAS em AvaliacaoModal.tsx (o check perdeu o alvo).");
const blocoUnidades = modal.match(/const UNIDADES_TESTE = \[([\s\S]*?)\];/)?.[1] ?? "";

for (const e of estimativas) {
  // 1) fonte
  if (e.refIds.length === 0) erro(`${e.id}: estimativa sem referencia. Conta sem fonte nao entra no produto.`);
  for (const id of e.refIds) {
    const ref = getReferencia(id);
    if (!ref) {
      erro(`${e.id}: refId "${id}" nao existe em referencias.ts.`);
      continue;
    }
    if (!ref.doi && !ref.pmid) {
      erro(`${e.id}: referencia "${id}" nao tem DOI nem PMID, entao ninguem consegue conferir a conta.`);
    }
  }

  // 2) honestidade
  if (!e.formula.trim()) erro(`${e.id}: sem formula por extenso. A conta tem que estar visivel.`);
  if (e.limite.trim().length < 40) erro(`${e.id}: limite ausente ou raso. Toda equacao de campo tem um.`);

  // 3) dominio
  for (const c of e.campos) {
    if (!(c.min < c.max)) erro(`${e.id}/${c.chave}: dominio invalido (min ${c.min}, max ${c.max}).`);
    if (c.vemDe && c.vemDe !== "peso" && c.vemDe !== "idade") erro(`${e.id}/${c.chave}: vemDe desconhecido.`);
  }
  // valor logo acima do maximo do primeiro campo numerico nao pode produzir resultado
  const numerico = e.campos.find((c) => c.tipo === "numero");
  if (numerico) {
    const v: Record<string, number> = {};
    for (const c of e.campos) v[c.chave] = c.tipo === "sexo" ? 1 : (c.min + c.max) / 2;
    v[numerico.chave] = numerico.max + 1;
    if (e.calcular(v).valor != null) {
      erro(`${e.id}: aceitou ${numerico.chave} acima do maximo declarado. Fora do dominio a equacao nao vale.`);
    }
  }
  // faltando um campo, nao estima
  if (e.calcular({}).valor != null) erro(`${e.id}: estimou sem receber dado nenhum.`);

  // 6) destino do registro
  if (!blocoCategorias.includes(`"${e.categoria}"`)) {
    erro(`${e.id}: categoria "${e.categoria}" nao existe em TESTE_CATEGORIAS; o teste cairia numa categoria orfa.`);
  }
  if (blocoUnidades && !blocoUnidades.includes(`"${e.unidade}"`)) {
    erro(`${e.id}: unidade "${e.unidade}" nao existe em UNIDADES_TESTE.`);
  }

  // 7) voz
  const visivel = [e.nome, e.oQueMede, e.nomeTeste, e.formula, e.limite, ...e.campos.map((c) => c.rotulo)].join(" ");
  if (visivel.includes("—")) erro(`${e.id}: travessao em texto visivel.`);
}

/* ---------------------------- 4: regressao da conta ---------------------------- */

/** Valores conferidos a mao a partir das publicacoes. Mudou aqui, quebrou. */
const CASOS: { id: string; entrada: Record<string, number>; esperado: number }[] = [
  // Epley: 100 x (1 + 10/30) = 133,33
  { id: "rm-epley", entrada: { carga: 100, reps: 10 }, esperado: 133.3 },
  // Epley com 1 repeticao devolve a propria carga
  { id: "rm-epley", entrada: { carga: 80, reps: 1 }, esperado: 80 },
  // Cooper: (2400 - 504,9) / 44,73 = 42,4
  { id: "vo2-cooper", entrada: { distancia: 2400 }, esperado: 42.4 },
  // Cooper: (1500 - 504,9) / 44,73 = 22,2
  { id: "vo2-cooper", entrada: { distancia: 1500 }, esperado: 22.2 },
  // Rockport (Kline 1987), homem 70 kg, 40 anos, 13 min, FC 140:
  // 6,9652 + 0,0091x154,3234 - 0,0257x40 + 0,5955 - 0,224x13 - 0,0115x140 = 3,415 L/min
  // 3,415 x 1000 / 70 = 48,8 mL/kg/min
  { id: "vo2-rockport", entrada: { tempo: 13, fc: 140, peso: 70, idade: 40, sexo: 1 }, esperado: 48.8 },
  // mesma pessoa, mulher: cai 0,5955 L/min, ou seja 8,5 mL/kg/min
  { id: "vo2-rockport", entrada: { tempo: 13, fc: 140, peso: 70, idade: 40, sexo: 0 }, esperado: 40.3 },
];

for (const caso of CASOS) {
  const e = estimativas.find((x) => x.id === caso.id);
  if (!e) {
    erro(`caso de regressao aponta para estimativa inexistente "${caso.id}".`);
    continue;
  }
  const r = e.calcular(caso.entrada);
  if (r.valor == null) {
    erro(`${caso.id}: caso de regressao nao produziu resultado (${r.erro}).`);
  } else if (Math.abs(r.valor - caso.esperado) > 0.11) {
    erro(`${caso.id}: conta mudou. Esperado ${caso.esperado}, veio ${r.valor}.`);
  }
}

/* ------------------- 5: o limite de 10 repeticoes (Mayhew 2008) ------------------- */

const rm = estimativas.find((e) => e.id === "rm-epley");
if (!rm) {
  erro("estimativa rm-epley sumiu.");
} else {
  if (!rm.refIds.includes("mayhew-2008")) erro("rm-epley perdeu a referencia que sustenta o limite de 10 repeticoes.");
  if (rm.calcular({ carga: 50, reps: 8 }).ressalva) erro("rm-epley ressalvou com 8 repeticoes, onde a predicao vale.");
  if (!rm.calcular({ carga: 50, reps: 14 }).ressalva) erro("rm-epley NAO avisou acima de 10 repeticoes (Mayhew 2008).");
}

/* ------------------------ memoria de calculo auditavel ------------------------ */

const rock = estimativas.find((e) => e.id === "vo2-rockport");
if (rock) {
  const memoria = memoriaDeCalculo(rock, { tempo: 13, fc: 140, peso: 70, idade: 40, sexo: 0 });
  if (!memoria.includes("feminino")) erro("memoriaDeCalculo nao traduziu o sexo para palavra.");
  if (!memoria.includes(rock.formula)) erro("memoriaDeCalculo nao carrega a formula; o registro ficaria inauditavel.");
}

/* --------------------------------- veredito --------------------------------- */

if (problemas.length > 0) {
  console.error(`check:estimativas reprovou (${problemas.length}):`);
  for (const p of problemas) console.error("  - " + p);
  process.exit(1);
}
console.log(
  `check:estimativas ok: ${estimativas.length} estimativas, ${CASOS.length} casos de regressao, todas com fonte verificavel e limite declarado.`,
);
