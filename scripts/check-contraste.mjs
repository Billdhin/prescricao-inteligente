// Guardrail de contraste do sistema de tema. Roda com `npm run check:contraste`.
// Valida WCAG AA (>=4.5 texto normal, >=3 gráfico/UI) de todos os pares críticos
// em TODA paleta × modo (claro e escuro). Trava se qualquer par reprovar, para
// nenhuma paleta chegar ao profissional com texto ilegível.
import fs from "node:fs";
import path from "node:path";
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
  /*
   * O AMARELO VIVO do semáforo. `warning` foi escurecido até #8E6009 para passar
   * 4,5:1 como TEXTO, e nessa profundidade não é mais amarelo, é marrom: o
   * fundador viu isso no semáforo em 23/08/2026. `warning-fill` é a LUZ, e quem
   * escreve por cima dela é `on-warning-fill`.
   */
  ["on-warning-fill", "warning-fill", 4.5],
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

/*
 * MATRIZ DE HOVER, criada em 23/08/2026 depois do relato do fundador: "algumas
 * palavras somem ao passar o mouse... o contraste fica com a cor quase igual da
 * cor do botão".
 *
 * O guardrail antigo media só o par de REPOUSO. Mas o hover TROCA a superfície
 * debaixo do texto (`hover:bg-surface-soft` aparece 116 vezes no produto), e um
 * texto dimensionado para o papel pode ficar ilegível na superfície nova. Aqui
 * cada cor de texto é medida contra TODA superfície sob a qual ela pode cair,
 * de repouso ou de hover, e não só contra a superfície onde ela nasceu.
 */
const TEXTOS = ["ink", "ink-2", "ink-3", "primary", "success", "warning", "danger", "cta-text", "analysis-text", "analysis"];
const SUPERFICIES = ["bg", "surface", "surface-soft", "surface-mute", "primary-tint", "success-tint", "warning-tint", "danger-tint", "analysis-tint", "cta-tint"];

const falhas = [];
// A skin do app do aluno não está em PALETAS (não é opção de aparência, é a pele
// de uma superfície) e é escura sempre, então entra aqui explicitamente. Se
// ficasse de fora, a única tela que o ALUNO vê seria a única sem guardrail.
for (const paleta of [...PALETAS, PALETA_ALUNO]) {
  for (const escuro of [false, true]) {
    const t = tokensDe(paleta, escuro);
    const modo = escuro ? "escuro" : "claro";
    const matrizHover = [];
    for (const fg of TEXTOS) for (const bg of SUPERFICIES) if (t[fg] && t[bg]) matrizHover.push([fg, bg, 4.5]);
    for (const [fg, bg, min] of [...PARES, ...DECORATIVOS, ...matrizHover]) {
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

/*
 * REGRA ESTRUTURAL 1: o CSS da landing não pode ter regra GLOBAL.
 *
 * É a causa raiz do relato do fundador. `prototipo.css` é importado por
 * `Landing.tsx` mas o bundle é um só, então tudo que ele declara sem escopo vale
 * para o app inteiro. Ele carregava `a:hover{color:#10233A}`, hex fixo quase
 * preto, e a barra lateral do app tem fundo #0D1524: o item de menu ia a 1,15:1
 * contra o próprio fundo no hover, ou seja, a palavra sumia.
 *
 * Um hex não sabe em que superfície vai cair, e este produto tem claro, escuro e
 * uma casca escura DENTRO do tema claro. Por isso a regra é de estrutura e não
 * de valor: na landing, todo seletor fica preso a `.landing-prototipo`.
 */
const CSS_LANDING = "src/pages/landing/prototipo.css";
const LIVRES = new Set(["html", ":root", "*", "body"]);
const cssTexto = fs.readFileSync(path.join(process.cwd(), CSS_LANDING), "utf8");
const semComentario = cssTexto.replace(/\/\*[\s\S]*?\*\//g, "");
const globais = [];
for (const m of semComentario.matchAll(/(^|\})\s*([^{}@]+?)\s*\{/g)) {
  const sel = m[2].trim().replace(/\s+/g, " ");
  if (!sel || sel.startsWith("@") || /^(from|to|\d+%)/.test(sel)) continue;
  const partes = sel.split(",").map((x) => x.trim()).filter(Boolean);
  for (const parte of partes) {
    if (parte.includes(".landing-prototipo")) continue;
    if (LIVRES.has(parte)) continue;
    globais.push(parte);
  }
}
if (globais.length) {
  console.error("\n[check:contraste] FALHOU: regra GLOBAL em " + CSS_LANDING + ":\n");
  for (const g of [...new Set(globais)]) console.error("  • " + g + "  ->  .landing-prototipo " + g);
  console.error("\n  O bundle é um só: sem escopo, isto pinta o app inteiro. Foi assim que");
  console.error("  a:hover{color:#10233A} deixou o menu da casca escura em 1,15:1.\n");
  process.exit(1);
}

/*
 * REGRA ESTRUTURAL 2: `bg-warning` não existe. Preenchimento usa `warning-fill`.
 *
 * Mesmo par que o vermelho já tinha (`danger` escreve, `danger-fill` preenche).
 * Sem isso, a luz do semáforo volta a ser pintada com a cor de TEXTO, que é
 * escura por obrigação de AA e por isso sai marrom.
 */
const usosBgWarning = [];
const anda = (dir) => {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const c = path.join(dir, f.name);
    if (f.isDirectory()) anda(c);
    else if (/\.tsx?$/.test(f.name)) {
      const txt = fs.readFileSync(c, "utf8");
      if (/bg-warning(?![-\w])/.test(txt)) usosBgWarning.push(c.replace(/\\/g, "/"));
    }
  }
};
anda(path.join(process.cwd(), "src"));
if (usosBgWarning.length) {
  console.error("\n[check:contraste] FALHOU: bg-warning usado como preenchimento:\n");
  for (const f of usosBgWarning) console.error("  • " + f);
  console.error("\n  warning é cor de TEXTO (escura por AA, e por isso marrom).");
  console.error("  A luz do semáforo é bg-warning-fill.\n");
  process.exit(1);
}

console.log(`[check:contraste] ${PALETAS.length + 1} paletas × 2 modos × ${PARES.length} pares + ${DECORATIVOS.length} decorativos + ${TEXTOS.length}×${SUPERFICIES.length} de hover.`);
if (falhas.length) {
  console.error(`\n[check:contraste] FALHOU: ${falhas.length} par(es) abaixo do AA:\n`);
  for (const f of falhas) console.error("  • " + f);
  console.error("");
  process.exit(1);
}
console.log("[check:contraste] ok: AA em claro e escuro, hover incluído; landing escopada; nenhum bg-warning.");
