import { gerarPlano } from "@/lib/gps/periodizacao";
import { getExercise } from "@/data/exercises";

for (const caso of [
  { objetivo: "Hipertrofia", nivel: "Intermediário", frequencia: 3, grupoEspecial: undefined as string | undefined },
  { objetivo: "Hipertrofia", nivel: "Iniciante", frequencia: 3, grupoEspecial: "hipertensao-estagio-1" },
  { objetivo: "Resistência muscular", nivel: "Iniciante", frequencia: 2, grupoEspecial: "hipertensao-estagio-1" },
]) {
  const g = gerarPlano({ ...caso, semanas: 8, idade: 35 } as never);
  const semana = g.principal.mesociclos[0].microciclos[0];
  console.log("===", caso.objetivo, caso.nivel, caso.frequencia + "x", caso.grupoEspecial ?? "sem condição");
  for (const s of semana.sessoes) {
    console.log(" sessão:");
    for (const b of s.blocos as never as { tipo: string; nome?: string; exercicioSlug?: string; seriesAlvo?: number; series?: string }[]) {
      const ex = b.exercicioSlug ? getExercise(b.exercicioSlug) : undefined;
      console.log("  ", b.tipo, "|", (b.nome ?? "").slice(0, 42), "|", ex?.grupoMuscular ?? "-", "| séries", b.seriesAlvo ?? b.series ?? "-");
    }
  }
}
