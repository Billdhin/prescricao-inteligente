// Guardrail de disciplina do design system (pele clínica).
//
// Roda com `npm run check:design`. Trava as regras que a rodada "design vendável"
// estabeleceu, para que a dívida não volte por descuido de call site:
//   1. Piso tipográfico: nada de text-[9px]/[10px]/[10.5px]/[11px] fora de SVG
//      (o piso é text-2xs = 11px; abaixo disso, só dentro de <svg>).
//   2. Raio: rounded-2xl morreu (sinônimo exato de rounded-card = 16px).
//   3. Peso 800 (font-extrabold) é só display de marketing: Landing e Pricing.
//   4. Tints mortas: as 13 grafias divergentes/typos que a migração de tokens
//      aposentou não podem reaparecer.
//   5. Azul fantasma #2563eb (Lovable) banido de todo o src (cenas de fallback
//      já repintadas para petróleo #1b4b66 na Onda 4).
//   6. Copy proibida: "Mais escolhido" (selo sem prova).
//   7. REGRA DURA do repo: modificador /NN sobre classe de cor-token NÃO compila
//      (tailwind.config sem <alpha-value>); alpha só como hex literal [#...]/NN.
//
// Lê o arquivo inteiro (multiline) porque className quebra linha em JSX.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "src");

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.(ts|tsx)$/.test(name)) out.push(p);
  }
  return out;
}

const files = walk(srcDir);
const violacoes = [];

const posInfo = (conteudo, idx) => {
  const linha = conteudo.slice(0, idx).split("\n").length;
  const ini = conteudo.lastIndexOf("\n", idx - 1) + 1;
  let fim = conteudo.indexOf("\n", idx);
  if (fim === -1) fim = conteudo.length;
  return { linha, trecho: conteudo.slice(ini, fim).trim().slice(0, 110) };
};

// Regiões <svg>...</svg> do arquivo (para a heurística de piso tipográfico).
const regioesSvg = (conteudo) => {
  const regs = [];
  const re = /<svg\b[\s\S]*?<\/svg>/gi;
  let m;
  while ((m = re.exec(conteudo))) regs.push([m.index, m.index + m[0].length]);
  return regs;
};
const dentroDeSvg = (regs, idx) => regs.some(([a, b]) => idx >= a && idx < b);

// Classes de cor-token do tailwind.config (mais específicas primeiro, para a
// alternância casar o token inteiro). Excluir hex-alpha [#...]/NN, que é legítimo.
const COR_TOKENS =
  "primary-tint|analysis-text|analysis-tint|cta-text|cta-tint|success-tint|warning-tint|" +
  "danger-tint|danger-fill|surface-soft|ink-2|ink-3|primary|analysis|success|warning|danger|surface|border|cta|ink|bg";
const PREFIXOS =
  "bg|text|border|ring-offset|ring|fill|stroke|from|via|to|decoration|outline|divide|placeholder|caret|accent|shadow";

const REGRAS = [
  {
    id: "rounded-2xl",
    desc: "rounded-2xl aposentado; use rounded-card (16px).",
    re: /\brounded-2xl\b/g,
  },
  {
    id: "font-extrabold",
    desc: "font-extrabold (peso 800) só em Landing.tsx e Pricing.tsx.",
    re: /\bfont-extrabold\b/g,
    ok: (arq) => /(?:^|[\\/])(Landing|Pricing)\.tsx$/.test(arq),
  },
  {
    id: "tint-morta",
    desc: "grafia de tint morta; use o token canônico (bg-warning-tint, text-danger, etc.).",
    re: /#(?:fef7e8|fdf6ec|fdf3e3|fffaf0|e7f8ee|eafaf0|f0fdf4|e6f7f9|f0fbfc|d6f3f6|fdeceb|dc2626|16a34a)(?![0-9a-fA-F])/gi,
  },
  {
    id: "azul-fantasma",
    desc: "#2563eb (azul Lovable morto); use corMarca || '#1b4b66'.",
    re: /#2563eb(?![0-9a-fA-F])/gi,
  },
  {
    id: "copy-proibida",
    desc: 'copy "Mais escolhido" (selo sem prova) banida.',
    re: /Mais escolhido/g,
  },
  {
    id: "piso-tipografico",
    desc: "text-[≤11px] fora de SVG; o piso é text-2xs. Abaixo disso, só dentro de <svg>.",
    re: /text-\[(?:9|10|10\.5|11)px\]/g,
    svgAware: true,
  },
  {
    id: "alpha-em-token",
    desc: "REGRA DURA: /NN sobre classe de cor-token não compila; use hex literal [#...]/NN.",
    re: new RegExp(`(?:${PREFIXOS})-(?:${COR_TOKENS})\\/\\d`, "g"),
  },
];

for (const arquivo of files) {
  const conteudo = readFileSync(arquivo, "utf8");
  const arqRel = relative(root, arquivo);
  let svgRegs = null;
  for (const regra of REGRAS) {
    if (regra.ok && regra.ok(arqRel)) continue;
    regra.re.lastIndex = 0;
    let m;
    while ((m = regra.re.exec(conteudo))) {
      if (regra.svgAware) {
        if (svgRegs === null) svgRegs = regioesSvg(conteudo);
        if (dentroDeSvg(svgRegs, m.index)) continue;
      }
      const { linha, trecho } = posInfo(conteudo, m.index);
      violacoes.push({ regra: regra.id, desc: regra.desc, arquivo: arqRel, linha, trecho });
    }
  }
}

console.log(`[check:design] ${files.length} arquivos varridos, ${REGRAS.length} regras.`);

if (violacoes.length) {
  const porRegra = {};
  for (const v of violacoes) (porRegra[v.regra] ??= []).push(v);
  console.error(`\n[check:design] FALHOU: ${violacoes.length} violação(ões).\n`);
  for (const [regra, itens] of Object.entries(porRegra)) {
    console.error(`  • ${regra} — ${itens[0].desc}`);
    for (const v of itens) console.error(`      ${v.arquivo}:${v.linha}  ${v.trecho}`);
  }
  console.error("");
  process.exit(1);
}

console.log("[check:design] ok: pele clínica disciplinada (raio, peso, tints, azul, copy e a regra dura do /NN).");
