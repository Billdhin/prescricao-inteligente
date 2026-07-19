/**
 * Guardrail: as pranchas de atlas dos núcleos mecanísticos não regridem para texto corrido.
 *
 * Roda com `npm run check:nucleos`.
 *
 * O manual de Fisiologia estrutura cada núcleo em seis partes (descrição, sequência de
 * quatro passos, relação, aplicação ao exercício, como medir, erro frequente). O app
 * mostra isso como prancha de atlas parseando o texto (features/learning/nucleos). Se um
 * dia alguém editar um núcleo e quebrar o padrão, o bloco cairia calado no acordeão antigo
 * (o "texto corrido" que o Filipe pediu para acabar). Esta checagem falha nesse caso.
 */
import { fisiologiaHumanaLessons } from "../src/features/learning/mocks/fisiologia-humana";
import { parseNucleo, ehBlocoDeNucleos } from "../src/features/learning/nucleos";
import { hasFigure } from "../src/features/learning/figures/scientific";

type Step = { label: string; detail: string; figureId?: string };
const erros: string[] = [];
let blocosAtlas = 0;
let nucleos = 0;
let nucleosComFigura = 0;

for (const lesson of fisiologiaHumanaLessons) {
  for (const b of lesson.blocks) {
    if (b.type !== "mechanism_flow") continue;
    const steps = ((b.content as { steps?: Step[] }).steps ?? []) as Step[];
    // Um passo que TENTA ser núcleo (tem os marcadores) obriga o bloco inteiro a virar atlas.
    const tentamSerNucleo = steps.filter((s) => s.detail.includes("Sequência:") && s.detail.includes("Relação:"));
    if (tentamSerNucleo.length === 0) continue; // bloco de mecanismo simples: ok, fica acordeão.
    if (!ehBlocoDeNucleos(steps)) {
      erros.push(`${lesson.slug}: bloco de mecanismo tem passo com marcadores de núcleo, mas nem todos parseiam; cairia no acordeão (texto corrido).`);
      continue;
    }
    blocosAtlas += 1;
    steps.forEach((s, i) => {
      const n = parseNucleo(s.detail);
      if (!n) {
        erros.push(`${lesson.slug} / núcleo ${i + 1} (${s.label}): não parseou.`);
        return;
      }
      nucleos += 1;
      // Figura por núcleo (padrão da fábrica): opcional, mas se declarada tem que existir.
      if (s.figureId) {
        if (!hasFigure(s.figureId)) {
          erros.push(`${lesson.slug} / núcleo ${i + 1} (${s.label}): figureId "${s.figureId}" não existe na biblioteca de figuras.`);
        } else {
          nucleosComFigura += 1;
        }
      }
      if (n.passos.length !== 4) {
        erros.push(`${lesson.slug} / núcleo ${i + 1} (${s.label}): ${n.passos.length} passos na Sequência, o manual usa 4.`);
      }
      const partes: Record<string, string> = {
        descrição: n.descricao,
        relação: n.relacao,
        "aplicação ao exercício": n.aplicacao,
        "como medir": n.comoMedir,
        "erro frequente": n.erroFrequente,
      };
      for (const [nome, valor] of Object.entries(partes)) {
        if (!valor || valor.length < 3) erros.push(`${lesson.slug} / núcleo ${i + 1} (${s.label}): parte "${nome}" vazia ou curta demais.`);
      }
    });
  }
}

if (blocosAtlas < 11) {
  erros.push(`Esperava ao menos 11 pranchas de núcleos (os 11 capítulos), encontrei ${blocosAtlas}.`);
}

if (erros.length > 0) {
  console.error(`[check:nucleos] FALHOU (${erros.length} problema(s)):`);
  for (const e of erros) console.error("  - " + e);
  process.exit(1);
}
const pct = nucleos > 0 ? Math.round((nucleosComFigura / nucleos) * 100) : 0;
console.log(`[check:nucleos] ok: ${blocosAtlas} pranchas de atlas, ${nucleos} núcleos, todos com 4 passos e as 6 partes do manual.`);
console.log(`[check:nucleos] figura por núcleo: ${nucleosComFigura}/${nucleos} (${pct}%). Meta da fábrica: 100%.`);
