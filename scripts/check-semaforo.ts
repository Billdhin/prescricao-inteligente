/**
 * GUARDRAIL DO SEMÁFORO: toda condição tem porta, e toda porta tem fonte.
 *
 * ## De onde veio
 *
 * Uma auditoria de evidência achou dois defeitos irmãos no gate pré-sessão, e os dois eram
 * do mesmo tipo: SEGURANÇA ESCRITA NO PRODUTO QUE NUNCA CHEGAVA À TELA.
 *
 *   1. Catorze das 23 condições do catálogo caíam no checklist geral. Cada uma delas já
 *      declarava os próprios sinais de alerta em `specialGroups.sinaisAlerta`, e nenhum deles
 *      virava pergunta: a gestante respondia sobre dor nova e sono, e nunca sobre sangramento,
 *      perda de líquido ou contração.
 *   2. No sentido oposto, o excesso: a hipertensão estágio 2 travava a sessão em 160/100, sem
 *      liberação médica e sem a medicação do dia. Somadas, as três travas cancelavam a sessão
 *      de quem tem exatamente a condição declarada, contra a direção do position stand que o
 *      próprio grupo cita (pescatello-2004: enquanto a avaliação formal acontece, é razoável
 *      que a maioria comece exercício moderado, como caminhada).
 *
 * Gate que trava demais e gate que não existe erram do mesmo jeito: os dois fazem o
 * profissional parar de ler o checklist.
 *
 * Roda com `npm run check:semaforo`.
 */
import { semaforos, getSemaforo, avaliarSemaforo, montarChecklist, type ChecklistSemaforo } from "../src/data/semaforo";
import { specialGroups } from "../src/data/specialGroups";
import { getReferencia } from "../src/data/referencias";

const problemas: string[] = [];
const erro = (m: string) => problemas.push(m);

/* ------------------------------------------------------------------ *
 * 1. TODA CONDIÇÃO DO CATÁLOGO TEM CHECKLIST PRÓPRIO.
 *
 * Cair no geral não dá erro nenhum: dá um checklist plausível, com perguntas
 * razoáveis, que simplesmente não pergunta o que aquela condição pede.
 * ------------------------------------------------------------------ */
for (const g of specialGroups) {
  if (!getSemaforo(g.slug)) {
    erro(
      `CONDIÇÃO SEM PORTA: "${g.slug}" (${g.nome}) não tem checklist próprio e cairia no geral, que nunca pergunta pelos sinais de alerta que a própria condição declara.`,
    );
  }
}

/* ------------------------------------------------------------------ *
 * 2. TODO CHECKLIST TEM PELO MENOS UM VERMELHO, E TODO VERMELHO TEM AÇÃO.
 *
 * Checklist sem vermelho é formulário: nada nele pode parar a sessão. E vermelho
 * sem ação deixa o profissional com o problema e sem a conduta.
 * ------------------------------------------------------------------ */
for (const c of semaforos) {
  const temVermelho = c.itens.some((i) => i.opcoes.some((o) => o.cor === "vermelho"));
  if (!temVermelho) {
    erro(`CHECKLIST SEM FREIO: "${c.grupoSlug}" não tem nenhuma opção vermelha: nada nele consegue parar a sessão.`);
  }
  for (const item of c.itens) {
    for (const o of item.opcoes) {
      if (o.cor !== "verde" && !o.acao) {
        erro(`SEM CONDUTA: "${c.grupoSlug}" / item "${item.id}" / opção "${o.valor}" pinta ${o.cor} e não diz o que fazer.`);
      }
    }
    if (!item.opcoes.some((o) => o.cor === "verde")) {
      erro(`SEM SAÍDA VERDE: "${c.grupoSlug}" / item "${item.id}" não tem nenhuma resposta que libere: o item sempre pune.`);
    }
    for (const r of item.refs ?? []) {
      if (!getReferencia(r)) {
        erro(`REFERÊNCIA INEXISTENTE: "${c.grupoSlug}" / item "${item.id}" cita "${r}", que não está em referencias.ts.`);
      }
    }
  }
}

/* ------------------------------------------------------------------ *
 * 3. IDENTIDADE: nenhum slug duplicado e nenhum item repetido dentro do mesmo
 *    checklist (id repetido faz a resposta de um sobrescrever a do outro).
 * ------------------------------------------------------------------ */
const vistos = new Set<string>();
for (const c of semaforos) {
  if (vistos.has(c.grupoSlug)) erro(`SLUG DUPLICADO: existe mais de um checklist para "${c.grupoSlug}".`);
  vistos.add(c.grupoSlug);
  const ids = new Set<string>();
  for (const i of c.itens) {
    if (ids.has(i.id)) erro(`ITEM DUPLICADO: "${c.grupoSlug}" tem dois itens com id "${i.id}": um sobrescreve a resposta do outro.`);
    ids.add(i.id);
  }
}

/* ------------------------------------------------------------------ *
 * 4. HIPERTENSÃO: a decisão clínica do fundador, travada em teste.
 *
 * Depois da auditoria, três coisas passaram a valer nos dois estágios, e é isto
 * que não pode voltar atrás sem alguém reabrir a discussão:
 *   a) pressão ABAIXO de 180/110 não pinta vermelho (é a faixa em que o exercício
 *      moderado é o tratamento, ver pescatello-pa-2019);
 *   b) faltar liberação médica não pinta vermelho (pescatello-2004);
 *   c) faltar a medicação do dia não pinta vermelho.
 * O vermelho fica com sintoma ativo e com a faixa de 180/110 para cima.
 * ------------------------------------------------------------------ */
for (const estagio of [1, 2] as const) {
  const slug = `hipertensao-estagio-${estagio}`;
  const c = getSemaforo(slug);
  if (!c) {
    erro(`Sem checklist para ${slug}: o resto desta verificação não roda.`);
    continue;
  }
  const pa = c.itens.find((i) => i.id === "pa-repouso");
  if (!pa) erro(`${slug}: sumiu o item de pressão de repouso.`);
  else {
    for (const o of pa.opcoes) {
      const abaixoDoCorte = o.valor === "ok" || o.valor === "estagio1" || o.valor === "estagio2";
      if (abaixoDoCorte && o.cor === "vermelho") {
        erro(
          `${slug}: a faixa "${o.rotulo}" está vermelha de novo. Abaixo de 180/110 a sessão acontece com dose ajustada; cancelar é tirar do hipertenso o exercício que trata a hipertensão (pescatello-pa-2019).`,
        );
      }
      if (o.valor === "crise" && o.cor !== "vermelho") {
        erro(`${slug}: a faixa de 180/110 ou acima precisa continuar vermelha (estágio 3 da SBC, ver tocci-emergencia-2018).`);
      }
    }
  }
  const aut = c.itens.find((i) => i.id === "autorizacao");
  const semLiberacao = aut?.opcoes.find((o) => o.valor === "nao");
  if (semLiberacao && semLiberacao.cor === "vermelho") {
    erro(
      `${slug}: falta de liberação médica voltou a travar a sessão. O position stand do ACSM (pescatello-2004) diz que, enquanto a avaliação formal acontece, é razoável a maioria começar exercício de intensidade moderada.`,
    );
  }
  const med = c.itens.find((i) => i.id === "medicacao");
  const semMedicacao = med?.opcoes.find((o) => o.valor === "nao");
  if (semMedicacao && semMedicacao.cor === "vermelho") {
    erro(`${slug}: não ter tomado a medicação do dia voltou a travar a sessão; nenhuma referência do produto sustenta cancelar por isso.`);
  }
  const sintomas = c.itens.find((i) => i.id === "sintomas");
  if (!sintomas?.opcoes.some((o) => o.cor === "vermelho")) {
    erro(`${slug}: o item de SINTOMAS precisa poder travar a sessão. É ele que virou o freio depois que os cortes de pressão foram corrigidos.`);
  }
}

/* ------------------------------------------------------------------ *
 * 5. GESTANTE: as oito contraindicações absolutas e os sinais do dia.
 *
 * A lista curta é a que a revisão sistemática sustenta (meah-contraindicacoes-2020);
 * uma lista maior barraria gestante que se beneficia do exercício, e é justamente
 * o que aquele trabalho mostrou estar errado.
 * ------------------------------------------------------------------ */
const CONTRAINDICACOES_ABSOLUTAS = [
  "descolamento",
  "vasa prévia",
  "insuficiência cervical",
  "parto prematuro",
  "pré-eclâmpsia",
  "crescimento intrauterino",
  "cardiorrespiratória",
  "diabetes tipo 1",
];
const SINAIS_DO_DIA = ["sangramento", "perda de líquido", "contrações", "dor no peito", "tontura", "panturrilha"];

const gest = getSemaforo("gestante");
if (!gest) {
  erro("Sem checklist para gestante.");
} else {
  const texto = gest.itens.map((i) => i.pergunta.toLowerCase()).join(" | ");
  for (const c of CONTRAINDICACOES_ABSOLUTAS) {
    if (!texto.includes(c.toLowerCase())) {
      erro(`GESTANTE: a contraindicação absoluta "${c}" não é perguntada em lugar nenhum do checklist (meah-contraindicacoes-2020).`);
    }
  }
  for (const s of SINAIS_DO_DIA) {
    if (!texto.includes(s.toLowerCase())) {
      erro(`GESTANTE: o sinal de alerta "${s}" não é perguntado no checklist do dia (mottola-gestacao-2019).`);
    }
  }
}

/* ------------------------------------------------------------------ *
 * 6. O SINAL QUE A CONDIÇÃO DECLARA TEM PARA ONDE IR.
 *
 * `specialGroups.sinaisAlerta` diz "interromper" ou "encaminhar" em quase toda
 * condição. Se o checklist daquela condição não tem nenhum vermelho, aquele texto
 * é decoração: ninguém nunca será perguntado sobre ele.
 * ------------------------------------------------------------------ */
for (const g of specialGroups) {
  const declaraParada = (g.sinaisAlerta ?? []).some((s) => /interromp|encaminh|imediat/i.test(s));
  if (!declaraParada) continue;
  const c = getSemaforo(g.slug);
  if (c && !c.itens.some((i) => i.opcoes.some((o) => o.cor === "vermelho"))) {
    erro(`SINAL SEM PORTA: "${g.slug}" declara sinal de alerta que manda interromper ou encaminhar, e o checklist dela não tem nenhum vermelho.`);
  }
}

/* ------------------------------------------------------------------ *
 * 7. AUTOVERIFICAÇÃO: o avaliador ainda sabe reprovar.
 *
 * Sem isto, um bug que fizesse `avaliarSemaforo` devolver verde sempre passaria
 * por todas as verificações acima sem levantar um dedo.
 * ------------------------------------------------------------------ */
function respostasNaCor(c: ChecklistSemaforo, cor: "verde" | "vermelho"): Record<string, string> {
  const r: Record<string, string> = {};
  for (const item of c.itens) {
    const alvo = item.opcoes.find((o) => o.cor === cor) ?? item.opcoes.find((o) => o.cor === "verde");
    if (alvo) r[item.id] = alvo.valor;
  }
  return r;
}

// A amostra é a gestante, mas sem `!`: se ela sumir, quem reclama é a verificação 1, com
// mensagem legível, e não um TypeError que engole a lista inteira de problemas.
const amostra = getSemaforo("gestante");
if (amostra) {
  const tudoVerde = avaliarSemaforo(amostra, respostasNaCor(amostra, "verde"));
  if (tudoVerde.cor !== "verde") {
    erro(`AUTOVERIFICAÇÃO: respondendo tudo na opção verde, o avaliador devolveu "${tudoVerde.cor}".`);
  }
  const comVermelho = avaliarSemaforo(amostra, respostasNaCor(amostra, "vermelho"));
  if (comVermelho.cor !== "vermelho") {
    erro(`AUTOVERIFICAÇÃO: com resposta vermelha presente, o avaliador devolveu "${comVermelho.cor}" em vez de vermelho.`);
  }
  const incompleto = avaliarSemaforo(amostra, {});
  if (incompleto.cor === "verde") {
    erro("AUTOVERIFICAÇÃO: checklist sem resposta nenhuma devolveu verde; o fail-closed quebrou.");
  }
}

// E o montador continua devolvendo o checklist da condição, não o geral.
const montado = montarChecklist("gestante");
if (montado?.grupoSlug !== "gestante") {
  erro(`montarChecklist("gestante") devolveu "${montado?.grupoSlug}": a condição voltou a cair no checklist geral.`);
}

/* --------------------------------- veredito --------------------------------- */

if (problemas.length) {
  console.error(`\n[check:semaforo] REPROVOU (${problemas.length}):`);
  for (const p of problemas) console.error("  - " + p);
  console.error("");
  process.exit(1);
}
console.log(
  `[check:semaforo] ok: ${specialGroups.length} condições, todas com checklist próprio, com freio que funciona, com conduta em todo amarelo e vermelho e com referência que existe. Hipertensão não cancela sessão abaixo de 180/110 nem por falta de liberação, e a gestante é perguntada sobre as 8 contraindicações absolutas e os sinais do dia.`,
);
