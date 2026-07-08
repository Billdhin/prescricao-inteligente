/* Validação de invariantes anatômicos do Laboratório Visual — à prova de erros.
   Roda em CI/local; falha (exit 1) se algum dado anatômico for inconsistente.
   Uso: npx tsx scripts/validate-anatomy.mts */
import { muscleRegions } from "../src/data/muscle-regions";
import { analysisOverlays } from "../src/data/analysis-overlays";
import { exercises } from "../src/data/exercises";

const erros: string[] = [];
const avisos: string[] = [];

for (const ex of exercises) {
  const regs = muscleRegions[ex.slug];
  const nomesAtivacao = new Set(ex.ativacao.map((a) => a.musculo));

  // 1) Todo exercício com imagem de análise precisa de regiões musculares.
  if (ex.imagemAnalise && !regs) {
    erros.push(`${ex.slug}: tem imagemAnalise mas NÃO tem muscleRegions.`);
    continue;
  }
  if (!regs) continue;

  const comRotulo: string[] = [];
  for (const r of regs) {
    // 2) Todo músculo da região precisa existir em ativacao (sem % ele nunca
    //    renderia e um rótulo sem dado seria informação órfã).
    if (!nomesAtivacao.has(r.musculo)) {
      erros.push(`${ex.slug}: região "${r.musculo}" não existe em ativacao (nomes: ${[...nomesAtivacao].join(", ")}).`);
    }
    // 3) Coordenadas dentro da caixa 0–100.
    for (const s of r.shapes) {
      if (s.cx < 0 || s.cx > 100 || s.cy < 0 || s.cy > 100 || s.rx <= 0 || s.ry <= 0) {
        erros.push(`${ex.slug}/"${r.musculo}": shape fora dos limites (cx${s.cx} cy${s.cy} rx${s.rx} ry${s.ry}).`);
      }
    }
    if (r.rotularNoCorpo) {
      comRotulo.push(r.musculo);
      // 4) Músculo rotulável precisa de ao menos um shape (âncora do rótulo).
      if (!r.shapes.length) erros.push(`${ex.slug}/"${r.musculo}": rotularNoCorpo sem shapes.`);
    }
  }

  // 5) Info: exercício sem nenhum rótulo no corpo (ok — card cobre), e teto de 3.
  if (comRotulo.length === 0) avisos.push(`${ex.slug}: sem rótulos no corpo (só card).`);
  if (comRotulo.length > 3) avisos.push(`${ex.slug}: ${comRotulo.length} rótulos marcados (mostra no máx. 2).`);
}

// 6) Overlays: força/ângulo dentro da caixa.
for (const [slug, ov] of Object.entries(analysisOverlays)) {
  const check = (n: string, x?: number, y?: number) => {
    if (x !== undefined && (x < 0 || x > 100)) erros.push(`${slug}: overlay ${n}.x=${x} fora de 0–100.`);
    if (y !== undefined && (y < 0 || y > 100)) erros.push(`${slug}: overlay ${n}.y=${y} fora de 0–100.`);
  };
  if (ov.angle) check("angle", ov.angle.x, ov.angle.y);
  if (ov.force) {
    check("force1", ov.force.x1, ov.force.y1);
    check("force2", ov.force.x2, ov.force.y2);
  }
}

console.log(`Exercícios: ${exercises.length} · com regiões: ${Object.keys(muscleRegions).length}`);
if (avisos.length) {
  console.log("\nAvisos:");
  for (const a of avisos) console.log("  · " + a);
}
if (erros.length) {
  console.error("\n❌ ERROS ANATÔMICOS:");
  for (const e of erros) console.error("  ✗ " + e);
  process.exit(1);
}
console.log("\n✅ Invariantes anatômicos OK.");
