/**
 * Guardrail da fábrica de conteúdo do Aprender.
 *
 * Roda com `npm run check:aprender`. Automatiza os itens verificáveis da "definição de
 * pronto" (ver src/features/learning/authoring/PLAYBOOK.md, seção 6):
 *   - nenhum travessão (—) em texto visível de aula (o fundador considera "cara de IA");
 *   - toda figura referenciada por uma aula existe na biblioteca (SVG ou webp);
 *   - toda referência (refId) citada por uma aula existe em references.ts;
 *   - nenhum marcador de placeholder esquecido (TODO, FIXME, lorem ipsum, XXXX).
 *
 * O julgamento científico e pedagógico é do agente revisor; isto é a rede de segurança
 * mecânica, no mesmo espírito de check:metricas / check:nucleos.
 */
import { lessons, references } from "../src/features/learning/mocks";
import { hasFigure } from "../src/features/learning/figures/scientific";

const refIds = new Set(references.map((r) => r.id));
const erros: string[] = [];

const TRAVESSAO = "—"; // — (em dash)
const PLACEHOLDERS = [/lorem ipsum/i, /\bTODO\b/, /\bFIXME\b/, /\bXXXX+\b/];

let comFigura = 0;
let refsAValidar = 0;

for (const lesson of lessons) {
  const onde = lesson.slug;
  const texto = JSON.stringify(lesson);

  if (texto.includes(TRAVESSAO)) {
    erros.push(`${onde}: usa travessão (—) em texto visível; troque por vírgula, dois-pontos ou ponto.`);
  }
  for (const re of PLACEHOLDERS) {
    if (re.test(texto)) {
      erros.push(`${onde}: marcador de placeholder esquecido (${re}).`);
      break;
    }
  }

  for (const b of lesson.blocks) {
    const c = (b.content ?? {}) as Record<string, unknown>;
    if (b.type === "figure") {
      const id = c.figureId as string | undefined;
      if (!id || !hasFigure(id)) {
        erros.push(`${onde}: figura "${id ?? "(vazia)"}" não existe na biblioteca (figures/scientific).`);
      } else {
        comFigura += 1;
      }
    }
    if (b.type === "references") {
      const ids = (c.ids as string[] | undefined) ?? [];
      for (const id of ids) {
        if (id.startsWith("ref-a-validar")) {
          refsAValidar += 1;
          continue; // placeholder honesto declarado; não é erro estrutural
        }
        if (!refIds.has(id)) {
          erros.push(`${onde}: referência "${id}" citada não existe em references.ts.`);
        }
      }
    }
  }

  for (const id of lesson.references ?? []) {
    if (!id.startsWith("ref-a-validar") && !refIds.has(id)) {
      erros.push(`${onde}: lesson.references aponta para "${id}", que não existe em references.ts.`);
    }
  }
}

if (erros.length > 0) {
  console.error(`[check:aprender] FALHOU (${erros.length} problema(s)):`);
  for (const e of erros) console.error("  - " + e);
  process.exit(1);
}
console.log(
  `[check:aprender] ok: ${lessons.length} aulas, ${comFigura} com figura, ${references.length} referências. ` +
    `Sem travessão, sem figura/refid quebrado, sem placeholder. (${refsAValidar} citações "a-validar" declaradas.)`,
);
