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
import { exportPlanoPDF } from "../src/lib/exportPlano";
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

/* ==========================================================================
 * O DOCUMENTO ASSINADO PRECISA IMPRIMIR O TEMPO DE CONTRAÇÃO.
 *
 * Achado ao conferir o PDF depois de integrar o isométrico ao motor: o filtro da tabela de
 * musculação era `tipo !== "aerobio"`, então o bloco isométrico caía lá, a coluna
 * "Repetições" saía VAZIA e o tempo de contração, que é o protocolo inteiro, não aparecia em
 * coluna nenhuma. O profissional assinaria um plano sem o número que define o exercício.
 *
 * Por isso a asserção olha a SAÍDA REAL do PDF (`apenasHtml`), e não o que o motor guarda
 * antes de imprimir: o defeito vivia inteiramente na camada de impressão.
 * ========================================================================== */
{
  const gIso = gerarPlano({ objetivo: "Resistência muscular", nivel: "Iniciante", semanas: 12, frequencia: 3, grupoEspecial: "hipertensao-estagio-2" });
  const blocosIso = gIso.principal.mesociclos
    .flatMap((m) => m.microciclos)
    .flatMap((w) => w.sessoes.flatMap((s) => s.blocos))
    .filter((b) => b.tipo === "isometrico");
  if (!blocosIso.length) {
    erros.push("AUTOVERIFICAÇÃO (isométrico no PDF): o plano de hipertensão não trouxe bloco isométrico; a checagem abaixo passaria por vazio.");
  } else {
    const planoIso = {
      id: "p-iso",
      alunoId: "a",
      data: Date.parse("2026-08-01"),
      titulo: gIso.titulo,
      objetivo: "Resistência muscular" as GpsObjetivo,
      nivel: "Iniciante" as Nivel,
      semanas: 12,
      frequenciaSemanal: 3,
      modeloId: gIso.modeloId,
      macrociclo: gIso.principal,
      refIds: gIso.refIds,
      raciocinio: gIso.raciocinio,
      grupoEspecial: "hipertensao-estagio-2",
    };
    const alunoIso = {
      id: "a",
      nome: "Aluno de Teste",
      iniciais: "AT",
      idade: 60,
      objetivo: "Resistência muscular",
      nivel: "Iniciante",
      restricoes: [],
      equipamentos: ["Máquina", "Peso corporal"],
      status: "ativo",
      criadoEm: 0,
      nivelDesde: 0,
      grupoEspecial: "hipertensao-estagio-2",
    } as unknown as Aluno;
    const html = exportPlanoPDF({ aluno: alunoIso, plano: planoIso as never, profissional: "Profissional de Teste", apenasHtml: true }) as string;
    const nome = blocosIso[0].nome ?? "";
    if (!html.includes("Isométrico")) erros.push("o PDF do plano não tem quadro próprio de Isométrico; o bloco cai na tabela de Musculação, que não tem coluna para tempo de contração.");
    if (!html.includes("Tempo de contração"))
      erros.push("o PDF do plano não imprime o TEMPO DE CONTRAÇÃO do isométrico, que é o número que define o exercício.");
    if (!html.includes("Descanso entre contrações")) erros.push("o PDF do plano não imprime o descanso entre contrações do isométrico.");
    /*
     * A cautela da pressão precisa chegar ao PAPEL, e dentro do quadro do isométrico.
     *
     * A primeira versão desta linha testava do nome do exercício até o FIM do documento, e
     * passava lisa mesmo com a observação removida, porque a palavra "pressão" aparece
     * adiante por outros motivos. Guardrail com janela larga demais é guardrail que não
     * protege: a janela agora é só o quadro isométrico, do título dele até o quadro seguinte.
     */
    const iIso = html.indexOf("Isométrico");
    const iDepois = html.indexOf("Cardio", iIso);
    const quadroIso = html.slice(iIso, iDepois > iIso ? iDepois : iIso + 2000);
    if (!/press[ãa]o/i.test(quadroIso))
      erros.push("o PDF do plano não imprime a cautela de pressão arterial DENTRO do quadro isométrico.");
    // E ele não pode continuar aparecendo na tabela de musculação.
    const tabela = html.slice(html.indexOf("<th>Repetições</th>"), html.indexOf("Isométrico"));
    if (nome && tabela.includes(nome)) erros.push(`o isométrico "${nome}" continua listado na tabela de Musculação, onde a coluna Repetições fica vazia.`);
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
