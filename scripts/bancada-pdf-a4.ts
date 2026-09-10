/**
 * BANCADA DOS DOCUMENTOS EM A4.
 *
 * Gera TODOS os documentos que o produto imprime, com dados reais do motor e da demo, e
 * grava o HTML de cada um. Depois `imprimir-a4.mjs` passa cada HTML pelo Chrome sem cabeça
 * e produz o PDF em A4, que é o que o profissional leva para a impressora e o que o aluno
 * recebe. Olhar o PDF página a página é a única verificação que responde "ficou bom no papel".
 *
 * Os geradores abrem o documento por `abrirDocumento`, que monta um Blob e chama
 * `window.open`. Aqui o Blob é interceptado e o HTML vai para o disco.
 *
 * Roda à mão: npx tsx scripts/bancada-pdf-a4.ts <pasta-de-saida>
 */
import fs from "node:fs";
import path from "node:path";

const saida = process.argv[2] ?? "pdf-a4";
fs.mkdirSync(saida, { recursive: true });

/* ---------- captura do HTML: o Blob que abrirDocumento cria vira arquivo ---------- */
let capturado: string | null = null;
const BlobReal = globalThis.Blob;
// @ts-expect-error substituição de propósito, só nesta bancada
globalThis.Blob = class extends BlobReal {
  constructor(partes: BlobPart[], opts?: BlobPropertyBag) {
    super(partes, opts);
    if (opts?.type?.startsWith("text/html")) capturado = partes.map(String).join("");
  }
};
// @ts-expect-error janela mínima para abrirDocumento
globalThis.window = {
  open: () => ({}),
  location: { assign: () => {} },
  setTimeout: () => 0,
};
URL.createObjectURL = () => "blob:bancada";
URL.revokeObjectURL = () => {};

function gravar(nome: string, gerar: () => void) {
  capturado = null;
  try {
    gerar();
  } catch (e) {
    console.error(`  x ${nome}: ${String(e).slice(0, 200)}`);
    return;
  }
  if (!capturado) {
    console.error(`  x ${nome}: o gerador não produziu HTML`);
    return;
  }
  fs.writeFileSync(path.join(saida, `${nome}.html`), capturado);
  console.log(`  ok ${nome} (${Math.round((capturado as string).length / 1024)} KB)`);
}

async function main() {
  const { semearDemoVSL } = await import("@/data/semearDemo");
  const { gerarPlano } = await import("@/lib/gps/periodizacao");
  const { exportPlanoPDF } = await import("@/lib/exportPlano");
  const { exportEvolucaoPDF } = await import("@/lib/exportEvolucao");
  const { exportProntuarioPDF } = await import("@/lib/exportProntuario");
  const { exportPrescricaoPDF } = await import("@/lib/exportPrescricao");
  const { exportPosturalPDF } = await import("@/lib/exportPostural");
  const { printFichaParametro } = await import("@/lib/printFicha");
  const { printSemaforo } = await import("@/lib/printSemaforo");
  const { montarProntuario } = await import("@/lib/gps/prontuario");
  const { rankExercises } = await import("@/lib/gps/engine");
  const { regraDoPerfil } = await import("@/lib/gps/farmacos");
  const { recommendModalidades } = await import("@/lib/gps/modalidadeRules");
  const { exercises } = await import("@/data/exercises");
  const { monitoringParameters } = await import("@/data/monitoringParameters");
  const { getSemaforo, avaliarSemaforo } = await import("@/data/semaforo");
  const { CHECKPOINTS_POSTURAIS } = await import("@/data/postural");
  const { getSpecialGroup } = await import("@/data/specialGroups");

  const demo = semearDemoVSL();
  const aluno = demo.alunos.find((a) => /Ant/.test(a.nome)) ?? demo.alunos[0];
  const profissional = "Filipe Rocha";
  const cref = "012345-G/SP";
  const marca = {
    nome: profissional,
    cref,
    empresa: "MacroGrowth",
    site: "macrogrowth.com.br",
    email: "contato@macrogrowth.com.br",
    telefone: "(11) 99999-0000",
    corPrimaria: "#E35B46",
  };

  /* --- 1. plano: trimestral e ANUAL (o anual é o que quebrava a tela) --- */
  for (const semanas of [12, 48]) {
    const g = gerarPlano({
      objetivo: aluno.objetivo as never,
      nivel: aluno.nivel,
      semanas,
      frequencia: 3,
      grupoEspecial: aluno.grupoEspecial,
      condicoesAtencao: aluno.condicoesAtencao,
      idade: aluno.idade,
      equipamentos: aluno.equipamentos,
      restricoes: aluno.restricoes,
    });
    const plano = {
      id: `plano-${semanas}`,
      alunoId: aluno.id,
      data: Date.parse("2026-09-01"),
      titulo: g.titulo,
      objetivo: aluno.objetivo,
      nivel: aluno.nivel,
      semanas,
      frequenciaSemanal: 3,
      modeloId: g.modeloId,
      modeloAltId: g.modeloAltId,
      macrociclo: g.principal,
      alternativa: g.alternativa,
      grupoEspecial: aluno.grupoEspecial,
      condicoesAtencao: aluno.condicoesAtencao,
      raciocinio: g.raciocinio,
      refIds: g.refIds,
      status: "ativo",
    };
    gravar(`plano-${semanas}sem`, () => exportPlanoPDF({ aluno, plano: plano as never, profissional, cref, marca }));
    gravar(`plano-${semanas}sem-folha-semana`, () =>
      exportPlanoPDF({ aluno, plano: plano as never, profissional, cref, marca, somenteSemana: 2 }),
    );
  }

  /* --- 2. evolução (avaliações da demo) --- */
  const avs = demo.avaliacoes.filter((a) => a.alunoId === aluno.id);
  gravar("evolucao", () => exportEvolucaoPDF({ aluno, avaliacoes: avs, profissional, cref, marca }));

  /* --- 3. prescrição e prontuário: o mesmo caminho que o Treino do dia percorre --- */
  const answers = {
    objetivo: aluno.objetivo as never,
    grupoMuscular: "Membros inferiores",
    nivel: aluno.nivel,
    restricoes: aluno.restricoes ?? [],
    equipamentos: aluno.equipamentos ?? [],
  };
  const grupos = [aluno.grupoEspecial, ...(aluno.condicoesAtencao ?? [])].filter(Boolean) as string[];
  const rule = regraDoPerfil({ grupos, farmacos: aluno.farmacos, farmacosNaoInformado: aluno.farmacosNaoInformado });
  const results = rankExercises(exercises, answers as never, rule);
  const grupo = aluno.grupoEspecial ? getSpecialGroup(aluno.grupoEspecial) : undefined;
  const faseObj = grupo?.fases?.[1];
  const modRecs = recommendModalidades({ answers: answers as never, grupo, faseObj } as never);
  const prontuario = montarProntuario({
    results,
    series: "3 séries · 10 a 12 reps",
    rule,
    modalidades: modRecs,
    parametros: faseObj?.parametros ?? ["p-rpe", "p-dor"],
    objetivo: answers.objetivo,
  });
  const presc = {
    id: "presc-bancada-0001",
    alunoId: aluno.id,
    data: Date.parse("2026-09-10T10:00:00"),
    titulo: grupo ? `${grupo.rotuloAluno} · Fase 2` : `${answers.objetivo} · Membros inferiores`,
    answers,
    prontuario,
    itens: results.slice(0, 3).map((x) => ({ slug: x.exercise.slug, score: x.score, series: "3 séries · 10 a 12 reps" })),
    status: "ativa",
    grupoEspecial: grupo?.slug,
    modalidadePrincipal: faseObj?.modalidades?.[0] ?? modRecs[0]?.modalidade.id,
    modalidadesSecundarias: faseObj?.modalidades?.slice(1) ?? modRecs.slice(1).map((r) => r.modalidade.id),
    faseJornada: grupo ? 2 : undefined,
    parametrosControle: faseObj?.parametros,
    criteriosProgressao: faseObj?.criteriosAvancar,
    criteriosRegressao: faseObj?.criteriosRegredir,
    raciocinio: faseObj?.justificativa,
  };
  gravar("prontuario", () => exportProntuarioPDF({ aluno, presc: presc as never, prontuario, profissional, cref, marca }));
  gravar("prescricao", () => exportPrescricaoPDF({ aluno, presc: presc as never, profissional, cref, marca }));

  /* --- 4. avaliação postural (achados fora do padrão em cada vista) --- */
  const observacoes = CHECKPOINTS_POSTURAIS.map((cp, i) => ({
    checkpointId: cp.id,
    achado: cp.opcoes[i % 3 === 0 ? 1 : 0] ?? cp.opcoes[0],
    nota: i % 5 === 0 ? "Observado em pé, relaxado, sem calçado." : undefined,
  }));
  gravar("postural", () =>
    exportPosturalPDF({
      aluno,
      avaliacao: { id: "pos-1", alunoId: aluno.id, data: Date.parse("2026-09-05"), observacoes } as never,
      profissional,
      cref,
      marca,
    }),
  );

  /* --- 5. semáforo do dia --- */
  const slugSem = aluno.grupoEspecial ?? "hipertensao-estagio-1";
  const checklist = getSemaforo(slugSem);
  if (checklist) {
    const respostas = Object.fromEntries(
      checklist.itens.map((it, i) => [it.id, it.opcoes[i === 1 && it.opcoes.length > 1 ? 1 : 0].valor]),
    );
    const resultado = avaliarSemaforo(checklist, respostas);
    gravar("semaforo", () =>
      printSemaforo(grupo?.nome ?? slugSem, checklist, respostas, resultado, aluno.nome, profissional, cref, undefined, marca.corPrimaria),
    );
  }

  /* --- 6. fichas de parâmetro: uma de escala e a de adesão --- */
  const escala = monitoringParameters.find((p) => p.ficha !== "adesao" && (p.escala?.length ?? 0) > 0);
  const adesao = monitoringParameters.find((p) => p.ficha === "adesao");
  const ident = { nome: profissional, cref, logoDataUrl: undefined, corPrimaria: marca.corPrimaria };
  if (escala) gravar("ficha-escala", () => printFichaParametro(escala, { alunoNome: aluno.nome, objetivo: aluno.objetivo }, ident));
  if (adesao) gravar("ficha-adesao", () => printFichaParametro(adesao, { alunoNome: aluno.nome, objetivo: aluno.objetivo }, ident));
}

main().then(() => console.log(`\n[bancada:pdf-a4] HTML em ${saida}`));
