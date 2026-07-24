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
import { montarEvolucaoHtml } from "../src/lib/exportEvolucao";
import type { Aluno, Avaliacao } from "../src/data/alunos";

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
          // Inclui o fecho de flexibilidade (onda F): também vai impresso no documento do aluno.
          t.push({ onde: `sessão "${sessao.nome}"`, texto: `${sessao.nome} ${sessao.foco ?? ""} ${sessao.fecho ?? ""}` });
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

/* A tabela de evolução também pode ir para a mão do aluno. O PDF nunca imprime o
   rótulo clínico do grupo: quando o aluno tem grupo, mostra o `rotuloAluno`. Aqui
   geramos o documento para cada grupo e conferimos que o nome clínico NÃO vaza e
   que o programa (rotuloAluno) aparece de fato (senão a regra valeria por vazio). */
const avaliacoesFake: Avaliacao[] = [
  { id: "e1", alunoId: "aluno-check", data: 1_600_000_000_000, medidas: { peso: 82, imc: 28, percentualGordura: 30, cintura: 98 } },
  { id: "e2", alunoId: "aluno-check", data: 1_610_000_000_000, medidas: { peso: 79, imc: 27, percentualGordura: 28, cintura: 94 } },
];
let docsEvolucao = 0;
for (const grupo of specialGroups) {
  // Mesmo critério do laço acima: se o programa cita a própria condição, não há
  // como distinguir, e é decisão do conteúdo do grupo, não deste guardrail.
  if (grupo.rotuloAluno.toLowerCase().includes(grupo.nome.toLowerCase())) continue;
  const aluno = { id: "aluno-check", nome: "Aluno de Teste", grupoEspecial: grupo.slug } as Aluno;
  const html = montarEvolucaoHtml({ aluno, avaliacoes: avaliacoesFake, profissional: "Profissional de Teste" });
  docsEvolucao++;
  const alvo = html.toLowerCase();
  if (alvo.includes(grupo.nome.toLowerCase())) {
    erros.push(
      `rótulo clínico "${grupo.nome}" na tabela de evolução em PDF (grupo ${grupo.slug}); use "${grupo.rotuloAluno}".`,
    );
  }
  if (!html.includes(grupo.rotuloAluno)) {
    erros.push(
      `a tabela de evolução deixou de imprimir o programa ("${grupo.rotuloAluno}") do grupo ${grupo.slug}; a checagem acima ficaria vazia.`,
    );
  }
}

if (erros.length) {
  console.error(`\n[check:documentos] ${erros.length} problema(s):\n`);
  for (const e of erros) console.error(`  - ${e}`);
  console.error("");
  process.exit(1);
}
console.log(
  `[check:documentos] ok: ${planos} planos de grupo especial e ${docsEvolucao} tabelas de evolução, nenhum rótulo clínico no texto que vai para o papel.`,
);
