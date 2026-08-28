/**
 * Bancada de medição: como o motor distribui GRUPO MUSCULAR entre os blocos de força.
 *
 * Nasceu do relato de um professor amigo do Filipe, testando a plataforma: em 4 ou 5 planos
 * montados, a saída puxava para membros inferiores (ele estimou 70%), em perfis muito
 * diferentes entre si, inclusive homens. O catálogo NÃO explica isso, porque ele tem 31
 * exercícios de inferiores contra 47 de superiores.
 *
 * Este script não corrige nada. Ele só mede, para a conversa passar de impressão a número.
 */
import { gerarPlano } from "@/lib/gps/periodizacao";
import { getExercise } from "@/data/exercises";
import type { Sessao } from "@/data/periodizacao";

type Perfil = {
  rotulo: string;
  objetivo: string;
  nivel: string;
  idade?: number;
  grupoEspecial?: string;
  equipamentos?: string[];
};

const PERFIS: Perfil[] = [
  { rotulo: "Homem 28, hipertrofia, intermediário", objetivo: "Hipertrofia", nivel: "Intermediário", idade: 28 },
  { rotulo: "Homem 35, emagrecimento, iniciante", objetivo: "Emagrecimento", nivel: "Iniciante", idade: 35 },
  { rotulo: "Mulher 30, hipertrofia, intermediário", objetivo: "Hipertrofia", nivel: "Intermediário", idade: 30 },
  { rotulo: "Mulher 45, emagrecimento, iniciante", objetivo: "Emagrecimento", nivel: "Iniciante", idade: 45 },
  { rotulo: "Homem 52, resistência muscular", objetivo: "Resistência muscular", nivel: "Iniciante", idade: 52 },
  { rotulo: "Homem 22, aprendizado técnico", objetivo: "Aprendizado técnico", nivel: "Iniciante", idade: 22 },
  { rotulo: "Mulher 60, retorno ao treino", objetivo: "Retorno ao treino", nivel: "Iniciante", idade: 60 },
  { rotulo: "Homem 40, hipertrofia, avançado", objetivo: "Hipertrofia", nivel: "Avançado", idade: 40 },
  { rotulo: "Homem 45, hipertensão est. 1", objetivo: "Emagrecimento", nivel: "Iniciante", idade: 45, grupoEspecial: "hipertensao-estagio-1" },
  { rotulo: "Mulher 55, osteoartrite joelho", objetivo: "Emagrecimento", nivel: "Iniciante", idade: 55, grupoEspecial: "osteoartrite-joelho" },
  { rotulo: "Homem 33, só peso do corpo", objetivo: "Hipertrofia", nivel: "Iniciante", idade: 33, equipamentos: ["Peso do corpo"] },
  { rotulo: "Homem 38, halteres em casa", objetivo: "Hipertrofia", nivel: "Intermediário", idade: 38, equipamentos: ["Halteres"] },
];

/** Agrupa os grupos musculares do catálogo em segmentos, para a leitura ficar direta. */
function segmento(grupo: string): "inferiores" | "superiores" | "core" | "corpo todo" | "outros" {
  if (grupo === "Membros inferiores") return "inferiores";
  if (["Peitorais", "Costas", "Ombros", "Braços"].includes(grupo)) return "superiores";
  if (grupo === "Core (tronco)") return "core";
  if (grupo === "Corpo todo") return "corpo todo";
  return "outros";
}

const sessoesDe = (macro: { mesociclos: { microciclos: { sessoes: Sessao[] }[] }[] }): Sessao[] =>
  macro.mesociclos.flatMap((m) => m.microciclos.flatMap((w) => w.sessoes));

const pct = (n: number, t: number) => (t ? ((100 * n) / t).toFixed(0).padStart(3) + "%" : "  0%");

console.log("\nDISTRIBUIÇÃO DE GRUPO MUSCULAR NOS BLOCOS DE FORÇA");
console.log("Catálogo de referência: 31 exercícios de inferiores, 47 de superiores, 12 de core.\n");
console.log(
  "perfil".padEnd(42) + "força  infer  super  core  corpo  " + "| exercícios distintos",
);
console.log("-".repeat(100));

let totInf = 0;
let totSup = 0;
let totForca = 0;

for (const p of PERFIS) {
  let g;
  try {
    g = gerarPlano({
      objetivo: p.objetivo as never,
      nivel: p.nivel as never,
      semanas: 8,
      frequencia: 3,
      idade: p.idade,
      grupoEspecial: p.grupoEspecial,
      equipamentos: p.equipamentos,
    } as never);
  } catch (e) {
    console.log(p.rotulo.padEnd(42) + "ERRO: " + (e as Error).message.slice(0, 40));
    continue;
  }

  const conta: Record<string, number> = { inferiores: 0, superiores: 0, core: 0, "corpo todo": 0, outros: 0 };
  const distintos = new Set<string>();
  let forca = 0;

  // Só a PRIMEIRA semana de cada plano: é o que o professor olhou na tela.
  const sessoes = sessoesDe(g.principal).slice(0, 3);
  for (const s of sessoes)
    for (const b of s.blocos) {
      if (b.tipo === "aerobio") continue;
      const ex = b.exercicioSlug ? getExercise(b.exercicioSlug) : undefined;
      if (!ex) continue;
      forca++;
      distintos.add(ex.slug);
      conta[segmento(ex.grupoMuscular)]++;
    }

  totInf += conta.inferiores;
  totSup += conta.superiores;
  totForca += forca;

  console.log(
    p.rotulo.padEnd(42) +
      String(forca).padStart(4) +
      "  " +
      pct(conta.inferiores, forca) +
      "  " +
      pct(conta.superiores, forca) +
      "  " +
      pct(conta.core, forca) +
      "  " +
      pct(conta["corpo todo"], forca) +
      "   | " +
      distintos.size,
  );
}

console.log("-".repeat(100));
console.log(
  "AGREGADO".padEnd(42) +
    String(totForca).padStart(4) +
    "  " +
    pct(totInf, totForca) +
    "  " +
    pct(totSup, totForca),
);
console.log("\nReferência do catálogo: inferiores seriam ~31% se a escolha fosse proporcional à oferta.\n");
