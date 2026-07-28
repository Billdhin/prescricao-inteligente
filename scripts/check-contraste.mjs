// Guardrail de contraste do sistema de tema. Roda com `npm run check:contraste`.
// Valida WCAG AA (>=4.5 texto normal, >=3 gráfico/UI) de todos os pares críticos
// em TODA paleta × modo (claro e escuro). Trava se qualquer par reprovar, para
// nenhuma paleta chegar ao profissional com texto ilegível.
import { PALETA_ALUNO, PALETAS, tokensDe } from "../src/lib/theme/palettes.ts";

function lum(hex) {
  const h = hex.replace("#", "");
  const c = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4),
  );
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function ratio(a, b) {
  const l1 = lum(a), l2 = lum(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

const WHITE = "#ffffff";
// [foreground token, background token, min]. "white" = branco literal.
const PARES = [
  ["ink", "bg", 4.5], ["ink", "surface", 4.5], ["ink", "surface-soft", 4.5],
  ["ink-2", "bg", 4.5], ["ink-2", "surface", 4.5], ["ink-2", "surface-soft", 4.5],
  ["ink-3", "surface", 4.5],
  ["primary", "surface", 4.5], ["primary", "bg", 4.5], ["primary", "primary-tint", 4.5],
  ["analysis-text", "analysis-tint", 4.5], ["analysis-text", "surface", 4.5],
  ["cta-text", "cta-tint", 4.5], ["cta-text", "surface", 4.5],
  ["success", "success-tint", 4.5], ["success", "surface", 4.5], ["success", "bg", 4.5],
  ["warning", "warning-tint", 4.5], ["warning", "surface", 4.5],
  ["danger", "danger-tint", 4.5], ["danger", "surface", 4.5],
  ["analysis", "surface", 4.5],
  ["on-primary", "primary", 4.5], ["on-analysis", "analysis", 4.5],
  ["danger-fill", "surface", 3], ["primary", "surface", 3],
  /* Tokens da direção "1c Rota". */
  ["on-analysis-fill", "analysis-fill", 4.5],
  ["ink", "surface-mute", 4.5], ["ink-2", "surface-mute", 4.5],
  ["danger-fill", "bg", 3],
];

/*
 * DECORATIVOS: turquesa vivo da marca (#14B3BA, 2,52:1 sobre papel) e cinza de
 * traço (#9AA1AC, 2,56:1). Os dois REPROVAM o 3:1 de UI e estão aqui de
 * propósito, com a régua que de fato se aplica a eles.
 *
 * Por que não escurecer até passar: são as cores do logo e do traçado
 * aprovadas pelo fundador; mexer nelas descaracteriza a marca.
 *
 * Por que isso não vira problema de acessibilidade: o WCAG 1.4.11 exige 3:1 de
 * objeto gráfico que CARREGUE informação sozinho. Aqui nenhum dos dois carrega:
 * o Design System manda "estado nunca só por cor (forma + rótulo)", então a
 * parada feita da rota é turquesa E preenchida E rotulada, a futura é
 * tracejada, e a atual é o pino azul (#2064EC, que passa). Quem escreve em
 * turquesa usa `analysis` (#0C6B70, 6,17:1), nunca o fill.
 *
 * Os dois controles que substituem o 3:1, e que são mais fortes porque olham o
 * USO e não o par: a regra `token-nao-textual` do check:design proíbe
 * `text-analysis-fill` e `text-ink-4`, e o piso abaixo impede que uma edição
 * futura deixe qualquer um deles invisível no papel.
 */
const DECORATIVOS = [
  ["analysis-fill", "surface", 1.5],
  ["ink-4", "surface", 1.5],
];

const falhas = [];
// A skin do app do aluno não está em PALETAS (não é opção de aparência, é a pele
// de uma superfície) e é escura sempre, então entra aqui explicitamente. Se
// ficasse de fora, a única tela que o ALUNO vê seria a única sem guardrail.
for (const paleta of [...PALETAS, PALETA_ALUNO]) {
  for (const escuro of [false, true]) {
    const t = tokensDe(paleta, escuro);
    const modo = escuro ? "escuro" : "claro";
    for (const [fg, bg, min] of [...PARES, ...DECORATIVOS]) {
      const cfg = fg === "white" ? WHITE : t[fg];
      const cbg = bg === "white" ? WHITE : t[bg];
      const r = ratio(cfg, cbg);
      // O `+1e-9` existe porque o par que dá exatamente 4,4999 imprime "4.50" e
      // reprovaria, fazendo a mensagem de erro mentir para quem depura.
      if (r + 1e-9 < min) {
        falhas.push(`${paleta.id}/${modo}: ${fg}(${cfg}) sobre ${bg}(${cbg}) = ${r.toFixed(2)} < ${min}`);
      }
    }
  }
}

console.log(`[check:contraste] ${PALETAS.length + 1} paletas × 2 modos × ${PARES.length} pares + ${DECORATIVOS.length} decorativos.`);
if (falhas.length) {
  console.error(`\n[check:contraste] FALHOU: ${falhas.length} par(es) abaixo do AA:\n`);
  for (const f of falhas) console.error("  • " + f);
  console.error("");
  process.exit(1);
}
console.log("[check:contraste] ok: todas as paletas passam AA em claro e escuro.");
