/** Repro temporário: mede o equilíbrio (séries por região, como a tela) numa grade ampla. */
import { gerarPlano } from "@/lib/gps/periodizacao";
import { getExercise } from "@/data/exercises";

const REGIAO: Record<string, string> = {
  "Membros inferiores": "Inferiores",
  Peitorais: "Superiores",
  Costas: "Superiores",
  Ombros: "Superiores",
  Braços: "Superiores",
  "Core (tronco)": "Core",
  "Corpo todo": "Corpo todo",
};

const objetivos = ["Emagrecimento", "Hipertrofia", "Força", "Resistência muscular", "Retorno ao treino", "Aprendizado técnico"] as const;
const niveis = ["Iniciante", "Intermediário", "Avançado"] as const;
const freqs = [2, 3, 4, 5];
const grupos = [undefined, "hipertensao-estagio-1", "diabetes-tipo-2", "osteoartrite-joelho"];

let piores: { rotulo: string; pctInf: number; detalhe: string }[] = [];
let total = 0;
let acima50 = 0;
let acima60 = 0;

for (const objetivo of objetivos)
  for (const nivel of niveis)
    for (const frequencia of freqs)
      for (const grupoEspecial of grupos) {
        let g;
        try {
          g = gerarPlano({ objetivo, nivel, semanas: 8, frequencia, idade: 35, grupoEspecial } as never);
        } catch {
          continue;
        }
        for (const [nomePlano, macro] of [["principal", g.principal], ["alternativa", (g as never as { alternativa?: typeof g.principal }).alternativa]] as const) {
          if (!macro) continue;
          const semana = macro.mesociclos[0]?.microciclos[0];
          if (!semana) continue;
          const porRegiao = new Map<string, number>();
          let series = 0;
          const gruposUsados = new Map<string, number>();
          for (const s of semana.sessoes)
            for (const b of s.blocos) {
              if (b.tipo === "aerobio") continue;
              const ex = b.exercicioSlug ? getExercise(b.exercicioSlug) : undefined;
              const regiao = ex ? (REGIAO[ex.grupoMuscular] ?? "Corpo todo") : "Sem classificação";
              const n = (b as never as { seriesAlvo?: number }).seriesAlvo ?? Number(/(\d+)/.exec((b as never as { series?: string }).series ?? "")?.[1] ?? 0);
              if (!n) continue;
              series += n;
              porRegiao.set(regiao, (porRegiao.get(regiao) ?? 0) + n);
              if (ex) gruposUsados.set(ex.grupoMuscular, (gruposUsados.get(ex.grupoMuscular) ?? 0) + n);
            }
          if (!series) continue;
          total++;
          const pctInf = Math.round(((porRegiao.get("Inferiores") ?? 0) / series) * 100);
          if (pctInf > 50) acima50++;
          if (pctInf >= 60) acima60++;
          if (pctInf >= 55)
            piores.push({
              rotulo: `${objetivo} · ${nivel} · ${frequencia}x · ${grupoEspecial ?? "sem condição"} · ${nomePlano}`,
              pctInf,
              detalhe:
                [...porRegiao.entries()].map(([r, n]) => `${r} ${Math.round((n / series) * 100)}%`).join(", ") +
                ` | ${series} séries | grupos: ` +
                [...gruposUsados.entries()].map(([g2, n]) => `${g2}:${n}`).join(" "),
            });
        }
      }

piores.sort((a, b) => b.pctInf - a.pctInf);
console.log(`casos: ${total} | acima de 50% inferiores: ${acima50} | 60%+: ${acima60}`);
for (const p of piores.slice(0, 25)) console.log(`${String(p.pctInf).padStart(3)}% ${p.rotulo}\n     ${p.detalhe}`);
