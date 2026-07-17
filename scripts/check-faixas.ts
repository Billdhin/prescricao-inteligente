/**
 * Guardrail: o motor não pode acusar a própria sugestão, e o aviso precisa acusar de verdade.
 *
 * Roda com `npm run check:faixas`. As duas regras nasceram do mesmo lugar:
 *
 * 1. MOTOR CONTRA SI MESMO. As ênfases da semana ondulatória eram uma lista fixa de
 *    força ("3 a 6" repetições) aplicada a qualquer objetivo. Um plano de emagrecimento
 *    para iniciante herdava repetições de força, e o editor marcava em amarelo a
 *    sugestão que o próprio sistema tinha acabado de escrever. Um aviso falso ensina o
 *    profissional a ignorar todos os avisos, inclusive os verdadeiros. Agora cada
 *    objetivo carrega as próprias ênfases, dentro da própria faixa citada.
 * 2. AVISO QUE NUNCA AVISA. Um verificador quebrado que devolve "está tudo dentro" passa
 *    calado pela regra 1 e some com a proteção inteira. Por isso os casos abaixo exigem
 *    que o aviso apareça onde tem que aparecer.
 */
import { gerarPlano } from "../src/lib/gps/periodizacao";
import { conferirFaixa, type CampoFaixa } from "../src/lib/gps/faixas";
import { getFaixa } from "../src/data/periodizacao";
import { OBJETIVOS } from "../src/lib/gps/engine";
import { specialGroups } from "../src/data/specialGroups";
import type { GpsObjetivo } from "../src/lib/gps/engine";
import type { Nivel } from "../src/data/types";

const NIVEIS: Nivel[] = ["Iniciante", "Intermediário", "Avançado"];
const CAMPOS: CampoFaixa[] = ["series", "reps", "intervalo"];
const erros: string[] = [];

/* 1. Nenhum bloco gerado pelo motor pode cair fora da faixa do próprio objetivo. */
let blocos = 0;
for (const objetivo of OBJETIVOS as readonly GpsObjetivo[]) {
  for (const nivel of NIVEIS) {
    for (const grupoEspecial of [undefined, ...specialGroups.map((g) => g.slug)]) {
      for (const semanas of [8, 12, 24]) {
        const plano = gerarPlano({ objetivo, nivel, semanas, frequencia: 4, grupoEspecial });
        const macros = [plano.principal, plano.alternativa].filter(Boolean);
        for (const macro of macros) {
          for (const meso of macro!.mesociclos) {
            for (const micro of meso.microciclos) {
              for (const sessao of micro.sessoes) {
                for (const bloco of sessao.blocos) {
                  // O bloco aeróbio guarda minutos em `reps`; a faixa fala de repetições.
                  if (bloco.tipo === "aerobio") continue;
                  blocos++;
                  for (const campo of CAMPOS) {
                    const valor = bloco[campo];
                    if (!valor) continue;
                    const aviso = conferirFaixa(campo, valor, getFaixa(objetivo), nivel);
                    if (aviso) {
                      erros.push(
                        `motor fora da própria faixa: ${objetivo} / ${nivel} / ${grupoEspecial ?? "sem grupo"} / ${semanas} sem` +
                          `\n    ${campo} = "${valor}" -> ${aviso}`,
                      );
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

/* 2. O verificador precisa avisar onde tem que avisar, e calar onde tem que calar. */
const casos: { campo: CampoFaixa; valor: string; objetivo: GpsObjetivo; nivel: Nivel; avisa: boolean; porque: string }[] = [
  { campo: "reps", valor: "25 a 30", objetivo: "Hipertrofia", nivel: "Intermediário", avisa: true, porque: "acima de toda a faixa citada (6 a 20)" },
  { campo: "series", valor: "8", objetivo: "Hipertrofia", nivel: "Intermediário", avisa: true, porque: "o dobro do teto de séries (3 a 4)" },
  { campo: "intervalo", valor: "10 min", objetivo: "Hipertrofia", nivel: "Intermediário", avisa: true, porque: "muito acima de 1 a 2 min" },
  { campo: "reps", valor: "10", objetivo: "Resistência muscular", nivel: "Iniciante", avisa: true, porque: "abaixo de 'acima de 15'" },
  { campo: "reps", valor: "15", objetivo: "Hipertrofia", nivel: "Intermediário", avisa: false, porque: "dentro da faixa útil de 6 a 20" },
  { campo: "intervalo", valor: "90 s", objetivo: "Hipertrofia", nivel: "Intermediário", avisa: false, porque: "90 s cabe em 1 a 2 min" },
  { campo: "intervalo", valor: "60 s", objetivo: "Resistência muscular", nivel: "Iniciante", avisa: false, porque: "'até 90 s' aceita menos" },
  { campo: "reps", valor: "20", objetivo: "Resistência muscular", nivel: "Iniciante", avisa: false, porque: "'acima de 15' aceita mais" },
  { campo: "intervalo", valor: "confortável", objetivo: "Reabilitação/retorno", nivel: "Iniciante", avisa: false, porque: "sem número dos dois lados, não há o que comparar" },
];
for (const c of casos) {
  const aviso = conferirFaixa(c.campo, c.valor, getFaixa(c.objetivo), c.nivel);
  if (c.avisa && !aviso) erros.push(`o aviso deveria aparecer: ${c.objetivo} / ${c.campo} = "${c.valor}" (${c.porque})`);
  if (!c.avisa && aviso) erros.push(`aviso falso: ${c.objetivo} / ${c.campo} = "${c.valor}" (${c.porque})`);
}

if (erros.length) {
  console.error(`\n[check:faixas] ${erros.length} problema(s):\n`);
  for (const e of erros) console.error(`  - ${e}`);
  console.error("");
  process.exit(1);
}
console.log(`[check:faixas] ok: ${blocos} blocos gerados dentro da faixa citada, ${casos.length} casos do verificador conferem.`);
