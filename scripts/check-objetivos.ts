/**
 * GUARDRAIL: a matriz de objetivo primário e secundário é completa, honesta e citável.
 *
 * O fundador pediu para poder escolher dois objetivos "com regras que façam sentido,
 * validadas cientificamente". O risco não é a matriz estar vazia hoje; é ela ganhar
 * uma linha nova amanhã sem referência, ou perder um par no meio de um refactor e
 * passar a aceitar em silêncio o que antes ela recusava.
 *
 * O que este check trava:
 *   1. COBERTURA: todo par ordenado (primário, secundário) do catálogo tem veredito.
 *   2. CITABILIDADE: todo par "condicional" cita pelo menos uma referência, e toda
 *      referência citada EXISTE em src/data/referencias.ts com DOI verificado.
 *   3. CONTEÚDO: "condicional" traz condição, "incompativel" traz o que fazer no lugar.
 *      Um veredito que só diz "não pode" não ajuda ninguém.
 *   4. SIMETRIA DECLARADA: o par é orientado de propósito, mas se A com B soma e B com
 *      A é incompatível, isso é bug, não decisão. Um lado pode ser mais exigente que o
 *      outro (soma vs condicional); pular de "soma" direto para "incompativel" não.
 *   5. VOZ: nada de travessão no texto visível (regra da casa).
 *   6. Autoverificação: um par que o produto REPROVA de fato existe, e um par que ele
 *      APROVA de fato existe. Matriz que aprova tudo não é regra, é enfeite.
 *
 * Roda com `npm run check:objetivos`.
 */
import { OBJETIVOS, type GpsObjetivo } from "../src/lib/gps/engine";
import {
  compatibilidadeObjetivos,
  parValido,
  secundariosDe,
  DE_TRANSICAO,
  type EstadoCompat,
} from "../src/lib/gps/objetivos";
import { getReferencia } from "../src/data/referencias";

const problemas: string[] = [];
let pares = 0;
const contagem: Record<EstadoCompat, number> = { soma: 0, condicional: 0, incompativel: 0 };

const ORDEM: Record<EstadoCompat, number> = { soma: 0, condicional: 1, incompativel: 2 };

for (const primario of OBJETIVOS) {
  for (const secundario of OBJETIVOS) {
    const c = compatibilidadeObjetivos(primario, secundario);
    pares++;

    // 1) cobertura
    if (!c) {
      problemas.push(`${primario} + ${secundario}: sem veredito na matriz.`);
      continue;
    }
    contagem[c.estado]++;

    // 5) voz
    const texto = [c.resumo, c.condicao ?? "", c.emVezDisso ?? ""].join(" ");
    if (texto.includes("—")) {
      problemas.push(`${primario} + ${secundario}: travessao no texto visivel.`);
    }
    if (!c.resumo.trim()) {
      problemas.push(`${primario} + ${secundario}: resumo vazio.`);
    }

    // 3) conteúdo por estado
    if (c.estado === "condicional" && !c.condicao?.trim()) {
      problemas.push(`${primario} + ${secundario}: "condicional" sem dizer QUAL e a condicao.`);
    }
    if (c.estado === "incompativel" && !c.emVezDisso?.trim()) {
      problemas.push(`${primario} + ${secundario}: "incompativel" sem dizer o que fazer no lugar.`);
    }

    // 2) citabilidade
    if (c.estado === "condicional" && c.refIds.length === 0) {
      problemas.push(
        `${primario} + ${secundario}: "condicional" sem referencia. Toda condicao afirmada precisa de fonte.`,
      );
    }
    for (const id of c.refIds) {
      const ref = getReferencia(id);
      if (!ref) {
        problemas.push(`${primario} + ${secundario}: referencia "${id}" nao existe em referencias.ts.`);
      } else if (!ref.doi) {
        problemas.push(
          `${primario} + ${secundario}: referencia "${id}" nao tem DOI verificado. Citacao precisa ser conferivel.`,
        );
      }
    }
  }
}

// 4) simetria declarada: os dois sentidos não podem discordar em dois degraus.
// Os objetivos de TRANSIÇÃO ficam de fora, e não por conveniência: a assimetria
// deles é a regra, e é verificada logo abaixo em vez de ser tolerada.
for (const a of OBJETIVOS) {
  for (const b of OBJETIVOS) {
    if (a === b) continue;
    if (DE_TRANSICAO.includes(a) || DE_TRANSICAO.includes(b)) continue;
    const ida = compatibilidadeObjetivos(a, b);
    const volta = compatibilidadeObjetivos(b, a);
    if (!ida || !volta) continue;
    if (Math.abs(ORDEM[ida.estado] - ORDEM[volta.estado]) > 1) {
      problemas.push(
        `${a} + ${b} e "${ida.estado}" mas ${b} + ${a} e "${volta.estado}": salto de dois degraus entre os sentidos.`,
      );
    }
  }
}

// 4b) a assimetria PROPOSITAL: objetivo de transição vale como primário e nunca
// como secundário. Se um dia ele passar a ser aceito como secundário, isto reprova.
for (const t of DE_TRANSICAO) {
  for (const outro of OBJETIVOS) {
    if (outro === t) continue;
    const comoSecundario = compatibilidadeObjetivos(outro, t);
    if (comoSecundario?.estado !== "incompativel") {
      problemas.push(
        `"${t}" e objetivo de transicao e nao pode ser aceito como secundario de "${outro}" (veredito atual: ${comoSecundario?.estado}).`,
      );
    }
    const comoPrimario = compatibilidadeObjetivos(t, outro);
    if (comoPrimario?.estado === "incompativel") {
      problemas.push(
        `"${t}" e objetivo de transicao e precisa aceitar secundario: "${outro}" foi recusado.`,
      );
    }
  }
}

/* ----------------------------- Autoverificação ----------------------------- */
// A matriz precisa ter dentes: pelo menos um par que ela RECUSA e pelo menos um que
// ela aceita com condição. Sem isso, o formulário aceitaria qualquer coisa e este
// check passaria feliz.
const recusados: string[] = [];
const condicionados: string[] = [];
for (const a of OBJETIVOS) {
  for (const b of OBJETIVOS) {
    const c = compatibilidadeObjetivos(a, b);
    if (!c) continue;
    if (c.estado === "incompativel" && !parValido(a, b)) recusados.push(`${a} + ${b}`);
    if (c.estado === "condicional") condicionados.push(`${a} + ${b}`);
  }
}
if (recusados.length === 0) {
  console.error(
    "check:objetivos FALHOU na autoverificacao: a matriz nao recusa par nenhum, entao o formulario aceita qualquer combinacao.",
  );
  process.exit(1);
}
if (condicionados.length === 0) {
  console.error(
    "check:objetivos FALHOU na autoverificacao: nenhum par e condicional, entao o produto nao declara custo nenhum de combinar objetivos.",
  );
  process.exit(1);
}

// O seletor de secundário nunca pode oferecer opção que o salvar vai recusar.
for (const primario of OBJETIVOS) {
  for (const { objetivo, compat } of secundariosDe(primario, OBJETIVOS)) {
    if (compat.estado === "incompativel") {
      problemas.push(
        `${primario}: o seletor oferece "${objetivo}" como secundario, mas o veredito e incompativel.`,
      );
    }
  }
}

if (problemas.length > 0) {
  console.error(`\ncheck:objetivos FALHOU (${problemas.length} ocorrencia(s)):`);
  for (const p of problemas.slice(0, 20)) console.error("  - " + p);
  if (problemas.length > 20) console.error(`  ... e mais ${problemas.length - 20}.`);
  process.exit(1);
}

console.log(
  `[check:objetivos] autoverificacao OK: a matriz recusa ${recusados.length} par(es) (ex.: ${recusados[0]}) e condiciona ${condicionados.length} (ex.: ${condicionados[0]}).`,
);
console.log(
  `[check:objetivos] ok: ${pares} pares com veredito (${contagem.soma} somam, ${contagem.condicional} com condicao, ${contagem.incompativel} recusados), toda condicao com referencia de DOI verificado.`,
);
