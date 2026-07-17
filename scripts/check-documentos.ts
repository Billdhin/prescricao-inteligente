/**
 * Guardrail: o rótulo clínico não entra no documento do aluno.
 *
 * Roda com `npm run check:documentos`.
 *
 * A regra é antiga e custou uma correção inteira (os documentos foram reescritos para
 * falar com dignidade com o aluno): quem recebe o papel impresso é uma pessoa, e o papel
 * dela diz "Fortalecimento com cuidado lombar", não "Dor lombar inespecífica". O rótulo
 * clínico continua à vista do profissional, na tela, no selo do plano e no prontuário.
 *
 * A regra voltou a ser quebrada em três lugares de uma vez quando nasceu o plano de
 * treino (título, raciocínio e objetivo geral do macrociclo), porque cada um deles montava
 * o próprio texto. Por isso a checagem olha TODO texto que o motor gera e que chega ao
 * papel, e não só o campo que quebrou da última vez.
 */
import { gerarPlano } from "../src/lib/gps/periodizacao";
import { specialGroups } from "../src/data/specialGroups";
import { OBJETIVOS } from "../src/lib/gps/engine";
import type { GpsObjetivo } from "../src/lib/gps/engine";
import type { Macrociclo } from "../src/data/periodizacao";
import type { Nivel } from "../src/data/types";

const NIVEIS: Nivel[] = ["Iniciante", "Intermediário", "Avançado"];
const erros: string[] = [];

/** Todo texto do plano que o PDF imprime. */
function textosImpressos(titulo: string, raciocinio: string, macros: (Macrociclo | undefined)[]) {
  const t: { onde: string; texto: string }[] = [
    { onde: "título", texto: titulo },
    { onde: "raciocínio", texto: raciocinio },
  ];
  for (const macro of macros) {
    if (!macro) continue;
    t.push({ onde: "objetivo geral do macrociclo", texto: macro.objetivoGeral });
    for (const meso of macro.mesociclos) {
      t.push({ onde: `mesociclo "${meso.nome}"`, texto: `${meso.nome} ${meso.foco}` });
      t.push({ onde: `critérios do mesociclo "${meso.nome}"`, texto: [...meso.criteriosProgressao, ...meso.criteriosRegressao].join(" ") });
      for (const micro of meso.microciclos) {
        t.push({ onde: `semana ${micro.semana}`, texto: micro.nota ?? "" });
        for (const sessao of micro.sessoes) {
          t.push({ onde: `sessão "${sessao.nome}"`, texto: `${sessao.nome} ${sessao.foco ?? ""}` });
          for (const bloco of sessao.blocos) {
            t.push({ onde: `bloco "${bloco.nome}"`, texto: `${bloco.nome ?? ""} ${bloco.observacao ?? ""}` });
          }
        }
      }
    }
  }
  return t;
}

let planos = 0;
for (const grupo of specialGroups) {
  // Quando o próprio nome de programa cita a condição, não há como distinguir; o grupo
  // decidiu ser explícito e essa decisão é do conteúdo, não deste guardrail.
  if (grupo.rotuloAluno.toLowerCase().includes(grupo.nome.toLowerCase())) continue;

  for (const objetivo of OBJETIVOS as readonly GpsObjetivo[]) {
    for (const nivel of NIVEIS) {
      const p = gerarPlano({ objetivo, nivel, semanas: 12, frequencia: 3, grupoEspecial: grupo.slug });
      planos++;
      for (const { onde, texto } of textosImpressos(p.titulo, p.raciocinio, [p.principal, p.alternativa])) {
        if (texto.toLowerCase().includes(grupo.nome.toLowerCase())) {
          erros.push(
            `rótulo clínico "${grupo.nome}" no documento do aluno (${onde}), em ${objetivo} / ${nivel}` +
              `\n    use "${grupo.rotuloAluno}"; o texto era: "${texto.slice(0, 120)}"`,
          );
        }
      }
    }
  }
}

/* O guardrail precisa acusar de verdade: se o motor parar de citar o programa, a regra
   acima passaria a valer por vazio. */
const amostra = gerarPlano({ objetivo: "Hipertrofia", nivel: "Iniciante", semanas: 12, frequencia: 3, grupoEspecial: specialGroups[0].slug });
if (!amostra.titulo.includes(specialGroups[0].rotuloAluno)) {
  erros.push(`o título do plano de grupo deixou de citar o programa ("${specialGroups[0].rotuloAluno}"); a checagem acima ficaria vazia.`);
}

if (erros.length) {
  console.error(`\n[check:documentos] ${erros.length} problema(s):\n`);
  for (const e of erros) console.error(`  - ${e}`);
  console.error("");
  process.exit(1);
}
console.log(`[check:documentos] ok: ${planos} planos de grupo especial, nenhum rótulo clínico no texto que vai para o papel.`);
