/**
 * Gera supabase/seed.sql a partir dos dados mock (src/data/*), fazendo o seed do
 * conteúdo (exercises, analysis_overlays, cases, tracks, library_entries) das
 * tabelas de supabase/migrations/0001_init.sql.
 *
 * Rodar: npx tsx scripts/gen-seed-sql.ts   (ou `npm run gen:seed`)
 * Aplicar no Supabase: SQL Editor / `supabase db execute -f supabase/seed.sql`.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { exercises } from "../src/data/exercises";
import { cases } from "../src/data/cases";
import { tracks } from "../src/data/tracks";
import { biblioteca } from "../src/data/library";
import { analysisOverlays } from "../src/data/analysis-overlays";

const q = (v: unknown): string => {
  if (v === null || v === undefined) return "null";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return String(v);
  if (typeof v === "string") return `'${v.replace(/'/g, "''")}'`;
  // objetos/arrays -> jsonb
  return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
};

const row = (vals: unknown[]) => `(${vals.map(q).join(", ")})`;

function insert(table: string, cols: string[], rows: unknown[][], conflict: string) {
  if (rows.length === 0) return "";
  return (
    `insert into public.${table} (${cols.join(", ")}) values\n  ` +
    rows.map(row).join(",\n  ") +
    `\non conflict (${conflict}) do nothing;\n`
  );
}

const blocks: string[] = [
  "-- Seed de CONTEÚDO gerado por scripts/gen-seed-sql.ts — não editar à mão.",
  "-- Executar depois de 0001_init.sql. Idempotente (on conflict do nothing).",
  "begin;",
];

blocks.push(
  insert(
    "exercises",
    ["id","slug","nome","grupo_muscular","equipamento","nivel","articulacao_predominante","objetivo","restricoes","premium","resumo_pratico","angulo_articular","imagem","imagem_analise","ativacao","indice_eficiencia","fases","hotspots","blocos","conteudo","trust_level","tem_cena","ordem"],
    exercises.map((e, i) => [
      e.id, e.slug, e.nome, e.grupoMuscular, e.equipamento, e.nivel, e.articulacaoPredominante,
      e.objetivo, e.restricoes, e.premium, e.resumoPratico, e.anguloArticular ?? null,
      e.imagem ?? null, e.imagemAnalise ?? null, e.ativacao, e.indiceEficiencia, e.fases,
      e.hotspots, e.blocos, e.conteudo, e.trustLevel, e.temCena, i,
    ]),
    "id",
  ),
);

blocks.push(
  insert(
    "analysis_overlays",
    ["slug","angle","force"],
    Object.entries(analysisOverlays).map(([slug, o]) => [slug, o.angle ?? null, o.force ?? null]),
    "slug",
  ),
);

blocks.push(
  insert(
    "cases",
    ["id","slug","titulo","tema","dificuldade","premium","contexto","pergunta","opcoes","melhor_opcao_id","trust_level"],
    cases.map((c) => [
      c.id, c.slug, c.titulo, c.tema, c.dificuldade, c.premium, c.contexto, c.pergunta,
      c.opcoes, c.melhorOpcaoId, c.trustLevel,
    ]),
    "id",
  ),
);

blocks.push(
  insert(
    "tracks",
    ["id","slug","nome","descricao","nivel","lessons"],
    tracks.map((t) => [t.id, t.slug, t.nome, t.descricao, t.nivel, t.lessons]),
    "id",
  ),
);

blocks.push(
  insert(
    "library_entries",
    ["id","termo","categoria","resumo","detalhe","ver_exercicio"],
    biblioteca.map((b) => [b.id, b.termo, b.categoria, b.resumo, b.detalhe, b.verExercicio ?? null]),
    "id",
  ),
);

blocks.push("commit;");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "supabase");
mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "seed.sql");
writeFileSync(outPath, blocks.filter(Boolean).join("\n\n") + "\n");

console.log(
  `seed.sql gerado: ${exercises.length} exercícios, ${Object.keys(analysisOverlays).length} overlays, ${cases.length} casos, ${tracks.length} trilhas, ${biblioteca.length} verbetes.`,
);
