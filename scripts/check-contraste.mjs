// Guardrail de contraste do sistema de tema. Roda com `npm run check:contraste`.
// Valida WCAG AA (>=4.5 texto normal, >=3 gráfico/UI) de todos os pares críticos
// em TODA paleta × modo (claro e escuro). Trava se qualquer par reprovar, para
// nenhuma paleta chegar ao profissional com texto ilegível.
import { PALETAS, tokensDe } from "../src/lib/theme/palettes.ts";

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
];

const falhas = [];
for (const paleta of PALETAS) {
  for (const escuro of [false, true]) {
    const t = tokensDe(paleta, escuro);
    const modo = escuro ? "escuro" : "claro";
    for (const [fg, bg, min] of PARES) {
      const cfg = fg === "white" ? WHITE : t[fg];
      const cbg = bg === "white" ? WHITE : t[bg];
      const r = ratio(cfg, cbg);
      if (r < min) {
        falhas.push(`${paleta.id}/${modo}: ${fg}(${cfg}) sobre ${bg}(${cbg}) = ${r.toFixed(2)} < ${min}`);
      }
    }
  }
}

console.log(`[check:contraste] ${PALETAS.length} paletas × 2 modos × ${PARES.length} pares.`);
if (falhas.length) {
  console.error(`\n[check:contraste] FALHOU: ${falhas.length} par(es) abaixo do AA:\n`);
  for (const f of falhas) console.error("  • " + f);
  console.error("");
  process.exit(1);
}
console.log("[check:contraste] ok: todas as paletas passam AA em claro e escuro.");
