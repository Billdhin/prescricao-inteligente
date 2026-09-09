import { gerarPlano } from "@/lib/gps/periodizacao";
import { getExercise, exercises } from "@/data/exercises";
import { consequenciasDoPlano } from "@/lib/gps/periodizacao";

const casos = [
  { rot: "Mulher 40 dor lombar hipertrofia 4x", objetivo: "Hipertrofia", nivel: "Intermediário", frequencia: 4, idade: 40, grupoEspecial: "dor-lombar-inespecifica" },
  { rot: "Homem 62 idoso+diabetes retorno 2x", objetivo: "Retorno ao treino", nivel: "Iniciante", frequencia: 2, idade: 62, grupoEspecial: "idoso-destreinado", condicoesAtencao: ["diabetes-tipo-2"] },
  { rot: "Homem 38 obesidade2+apneia emagrec 3x", objetivo: "Emagrecimento", nivel: "Iniciante", frequencia: 3, idade: 38, grupoEspecial: "obesidade-grau-2", condicoesAtencao: ["apneia-sono"] },
];
for (const c of casos) {
  const g = gerarPlano({ ...c, semanas: 12 } as never);
  const w = g.principal.mesociclos.flatMap((m) => m.microciclos).find((x) => x.tipo === "carga")!;
  console.log("\n=== " + c.rot + " ===");
  for (const s of w.sessoes) {
    console.log(` ${s.nome}${(s as never as { complemento?: boolean }).complemento ? " [complemento]" : ""}`);
    for (const b of s.blocos as never as { tipo: string; nome?: string; exercicioSlug?: string; seriesAlvo?: number }[]) {
      const ex = b.exercicioSlug ? getExercise(b.exercicioSlug) : undefined;
      const prim = ex?.ativacao.filter((a) => a.papel === "primário").sort((x, y) => y.percentual - x.percentual)[0]?.musculo;
      console.log(`   ${b.tipo.padEnd(10)} ${(b.nome ?? "").slice(0, 34).padEnd(35)} ${(ex?.grupoMuscular ?? "-").padEnd(20)} prim=${prim ?? "-"} séries=${b.seriesAlvo ?? "-"}`);
    }
  }
  // o que o filtro deixou disponível de core e de posterior
  const cons = consequenciasDoPlano({
    objetivo: c.objetivo as never, nivel: c.nivel as never, semanas: 12, frequencia: c.frequencia,
    grupoEspecial: c.grupoEspecial, condicoesAtencao: (c as { condicoesAtencao?: string[] }).condicoesAtencao,
  } as never);
  const excl = new Set((cons as never as { excluidos?: { slug: string }[] }).excluidos?.map((x) => x.slug) ?? []);
  const coreDisp = exercises.filter((e) => e.grupoMuscular === "Core (tronco)" && !excl.has(e.slug));
  const postDisp = exercises.filter((e) => e.grupoMuscular === "Membros inferiores" && !excl.has(e.slug) &&
    ["Glúteo máximo", "Isquiotibiais"].includes(e.ativacao.filter((a) => a.papel === "primário").sort((x, y) => y.percentual - x.percentual)[0]?.musculo ?? ""));
  console.log(`   >> core disponível após filtros: ${coreDisp.length} (${coreDisp.slice(0, 6).map((e) => e.nome).join(", ")})`);
  console.log(`   >> posterior/glúteo disponível: ${postDisp.length} (${postDisp.slice(0, 6).map((e) => e.nome).join(", ")})`);
}
