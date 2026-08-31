/**
 * GUARDRAIL: nenhum limite chega ao plano sem dizer de onde veio.
 *
 * O motor sempre fundiu certo (teto de carga pelo menor, reserva de repetições pela maior),
 * mas a fusão era um `Math.min` que devolvia número órfão: no instante do cálculo, a
 * informação de qual condição impôs o limite ia embora. Nenhuma tela pode mostrar o que o
 * motor não guardou, e era por isso que "qual condição impôs qual teto" não existia em lugar
 * nenhum do produto, mesmo sendo a diferença que ele vende.
 *
 * O que este check trava:
 *
 *   1. TODO limite declarado tem procedência, e a origem é um slug de condição real (ou
 *      "idade"). Um teto atribuído a "não declarado" é pior que nenhum teto: parece rastreável
 *      e não é.
 *   2. A procedência COMPÕE através de fusões aninhadas. A cadeia real é condição + condição,
 *      depois esse resultado + idade. Se a origem não sobreviver aos dois saltos, a tela
 *      passa a dizer o slug concatenado da fusão, que não responde a pergunta de ninguém.
 *   3. O PRETERIDO aparece quando duas regras pedem números diferentes. É a linha que
 *      transforma o painel de lista em raciocínio, e sem ela o produto volta a só afirmar.
 *   4. O número da procedência é o MESMO que o motor aplica. Procedência que diverge do valor
 *      efetivo é uma tela mentindo com cara de transparência.
 *   5. Autoverificação: com a lei de fusão invertida, o cenário-controle REPROVA.
 *
 * Roda com `npm run check:procedencia`.
 */
import { combineRules, fundirModDose, getGroupRule, groupGpsRules, doseDoPerfil } from "../src/lib/gps/groupRules";
import { doseDoPerfilComIdade } from "../src/lib/gps/esforco";

const falhas: string[] = [];
const ok = (m: string) => console.log(`[check:procedencia] ok: ${m}`);
const SLUGS = Object.keys(groupGpsRules);
const ORIGENS_VALIDAS = new Set([...SLUGS, "idade"]);

/* ---------- 1. Todo limite declarado tem origem, e a origem é real ---------- */
let comLimite = 0;
for (const slug of SLUGS) {
  const dose = doseDoPerfil(getGroupRule(slug));
  if (!dose) continue;
  for (const campo of ["cargaRelativaMax", "rirMinimo"] as const) {
    if (typeof dose[campo] !== "number") continue;
    comLimite++;
    const o = dose.procedencia?.[campo];
    if (!o) {
      falhas.push(`${slug}: ${campo} = ${dose[campo]} sem procedência`);
      continue;
    }
    if (!ORIGENS_VALIDAS.has(o.de)) falhas.push(`${slug}: ${campo} atribuído a origem inexistente "${o.de}"`);
    if (o.valor !== dose[campo])
      falhas.push(`${slug}: procedência diz ${campo}=${o.valor} e o motor aplica ${dose[campo]}`);
  }
}
if (!falhas.length) ok(`${comLimite} limites declarados, todos com origem rastreável`);

/* ---------- 2 e 3. A origem sobrevive à cadeia, e o preterido aparece ---------- */
/*
 * O caso é real e é o do VSL: hipertensão define teto de carga e reserva; a idade avançada
 * pede reserva ainda maior. Quem vence a reserva é a idade, e a hipertensão tem que aparecer
 * como preterida, com o número que ela pedia.
 */
const doisSaltos = doseDoPerfilComIdade(combineRules(["hipertensao-estagio-1", "osteoartrite-joelho"]), 72);
const carga = doisSaltos?.procedencia?.cargaRelativaMax;
const rir = doisSaltos?.procedencia?.rirMinimo;

if (!carga || !rir) {
  falhas.push("hipertensão + artrose + 72 anos não produziu procedência para carga e reserva");
} else {
  if (carga.de.includes("+"))
    falhas.push(`a origem da carga virou o slug concatenado da fusão ("${carga.de}"), e não a condição que declarou`);
  if (!ORIGENS_VALIDAS.has(carga.de)) falhas.push(`origem da carga inválida: "${carga.de}"`);
  if (rir.de !== "idade")
    falhas.push(`aos 72 anos a reserva deveria vir da idade (a mais conservadora), veio de "${rir.de}"`);
  if (!rir.preteridos.length)
    falhas.push("a condição preterida sumiu: sem ela o painel afirma o limite sem mostrar a disputa");
  if (rir.preteridos.some((p) => p.valorPedido >= rir.valor))
    falhas.push("um preterido pedia valor igual ou mais conservador que o vencedor: a lei de fusão inverteu");
  if (!falhas.length)
    ok(
      `cadeia de duas fusões preserva a origem: reserva ${rir.valor} de "${rir.de}", ` +
        `com ${rir.preteridos.map((p) => `${p.de} pedindo ${p.valorPedido}`).join(", ")} preterido`,
    );
}

/* ---------- 4. A composição sobrevive a uma fusão DE DUAS DOSES ---------- */
/*
 * MEDIDO EM 31/08/2026: hoje só `hipertensao-estagio-1` e `hipertensao-estagio-2` declaram
 * teto numérico, e as duas são mutuamente exclusivas (ninguém tem os dois estágios). Ou seja,
 * a disputa entre DUAS CONDIÇÕES pelo mesmo número ainda não acontece com dados reais; a que
 * acontece é condição contra idade, coberta acima.
 *
 * Este bloco protege a composição com um par sintético, para a garantia não depender de um
 * acidente do catálogo. No dia em que uma segunda condição declarar `modDose`, o caminho já
 * estará testado, em vez de estrear em produção.
 */
const sintetico = fundirModDose([
  { de: "condicao-a", cargaRelativaMax: 85, rirMinimo: 1, motivo: "sintético A", refId: ["ref-a"] },
  { de: "condicao-b", cargaRelativaMax: 70, rirMinimo: 3, motivo: "sintético B", refId: ["ref-b"] },
]);
const comIdade = fundirModDose([
  sintetico!,
  { de: "idade", rirMinimo: 4, motivo: "sintético idade", refId: ["ref-idade"] },
]);
const cargaSint = comIdade?.procedencia?.cargaRelativaMax;
const rirSint = comIdade?.procedencia?.rirMinimo;
if (cargaSint?.de !== "condicao-b")
  falhas.push(`composição: a carga deveria vir de condicao-b (a menor, 70), veio de "${cargaSint?.de}"`);
if (cargaSint && !cargaSint.preteridos.some((p) => p.de === "condicao-a" && p.valorPedido === 85))
  falhas.push("composição: condicao-a pedia 85 e não aparece como preterida depois de duas fusões");
if (rirSint?.de !== "idade")
  falhas.push(`composição: a reserva deveria vir da idade (a maior, 4), veio de "${rirSint?.de}"`);
if (rirSint && rirSint.preteridos.length !== 2)
  falhas.push(
    `composição: as duas condições preteridas na reserva deveriam sobreviver aos dois saltos, sobraram ${rirSint.preteridos.length}`,
  );
if (!falhas.length) ok("composição sobrevive a duas fusões encadeadas, com todos os preteridos preservados");

/* ---------- 5. Autoverificação: a lei de fusão é mesmo a conservadora ---------- */
const so = doseDoPerfilComIdade(getGroupRule("hipertensao-estagio-1"), undefined);
const com = doseDoPerfilComIdade(getGroupRule("hipertensao-estagio-1"), 72);
if (!(so?.rirMinimo != null && com?.rirMinimo != null && com.rirMinimo > so.rirMinimo))
  falhas.push(
    `autoverificação: acrescentar 72 anos deveria APERTAR a reserva (${so?.rirMinimo} para algo maior), ` +
      `veio ${com?.rirMinimo}. Se isto passa, a fusão não está sendo pela mais conservadora.`,
  );
else ok(`autoverificação: a idade aperta a reserva de ${so.rirMinimo} para ${com.rirMinimo}`);

if (falhas.length) {
  console.error(`\n[check:procedencia] REPROVADO (${falhas.length})`);
  for (const f of falhas) console.error("  - " + f);
  process.exit(1);
}
console.log("[check:procedencia] tudo certo.");
