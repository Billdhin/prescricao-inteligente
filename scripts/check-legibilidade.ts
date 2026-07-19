/**
 * Guardrail de legibilidade do Aprender.
 *
 * Roda com `npm run check:legibilidade`. Mede a dimensão 4 da rubrica de excelência
 * (src/features/learning/authoring/RUBRICA.md): texto que vira "parede" (prosa longa sem
 * quebra de parágrafo e sem negrito) é difícil de ler e absorver.
 *
 * Comportamento: LISTA as paredes por disciplina (backlog do agente de leitura) e REPROVA
 * apenas paredes extremas (prosa muito longa sem nenhuma quebra), que são inaceitáveis. O
 * meio-termo é guia de melhoria contínua, não trava, porque onde pôr negrito e quebra é
 * julgamento autoral, não uma regra binária como travessão.
 */
import { lessons } from "../src/features/learning/mocks";

const LIMITE_PAREDE = 320; // acima disto, sem quebra e sem negrito, é parede (advisório)
const LIMITE_EXTREMO = 700; // acima disto, sem nenhuma quebra, reprova

type Campo = { slug: string; disc: string; kind: string; peso: number; temQuebra: boolean; temNegrito: boolean };

const peso = (t: string) => t.replace(/\*\*/g, "").length;
const temQuebra = (t: string) => /\n{2,}/.test(t);
const temNegrito = (t: string) => /\*\*[^*\n]+\*\*/.test(t);

const campos: Campo[] = [];
for (const l of lessons) {
  const add = (t: unknown, kind: string) => {
    if (typeof t !== "string" || !t.length) return;
    campos.push({ slug: l.slug, disc: l.disciplineSlug, kind, peso: peso(t), temQuebra: temQuebra(t), temNegrito: temNegrito(t) });
  };
  for (const b of l.blocks) {
    const c = (b.content ?? {}) as Record<string, unknown>;
    if (b.type === "hero") add(c.text, "hero");
    else if (b.type === "practical_application") add(c.text, "aplicação");
    else if (b.type === "scientific_uncertainty") add(c.text, "incerteza");
    else if (b.type === "apply_to_prescription") add(c.summary, "aplicar-rx");
    else if (b.type === "key_concept") add(c.definition, "conceito");
    else if (b.type === "short_text" && Array.isArray(c.items)) (c.items as unknown[]).forEach((i) => add(i, "item"));
  }
}

const paredes = campos.filter((c) => c.peso > LIMITE_PAREDE && !c.temQuebra && !c.temNegrito);
const extremas = campos.filter((c) => c.peso > LIMITE_EXTREMO && !c.temQuebra);

const porDisc: Record<string, number> = {};
for (const p of paredes) porDisc[p.disc] = (porDisc[p.disc] ?? 0) + 1;

console.log(`[check:legibilidade] ${campos.length} trechos de prosa, ${paredes.length} paredes (> ${LIMITE_PAREDE} sem quebra e sem negrito).`);
if (paredes.length) {
  console.log("  por disciplina:");
  for (const [d, n] of Object.entries(porDisc).sort((a, b) => b[1] - a[1])) console.log(`    ${d}: ${n}`);
  console.log("  piores (para o agente de leitura tratar):");
  for (const p of [...paredes].sort((a, b) => b.peso - a.peso).slice(0, 8)) {
    console.log(`    ${p.peso} car · ${p.kind} · ${p.slug}`);
  }
}

if (extremas.length) {
  console.error(`[check:legibilidade] FALHOU: ${extremas.length} parede(s) extrema(s) (> ${LIMITE_EXTREMO} car sem nenhuma quebra):`);
  for (const e of extremas) console.error(`  - ${e.peso} car · ${e.kind} · ${e.slug}`);
  process.exit(1);
}
console.log("[check:legibilidade] ok: nenhuma parede extrema. As paredes advisórias acima são o backlog de leitura.");
