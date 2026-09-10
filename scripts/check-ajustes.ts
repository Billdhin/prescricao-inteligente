/**
 * GUARDRAIL: o que o aluno registra e o que o ajuste da semana faz com isso.
 *
 * Nasceu de três telas estranhas na aba Treino (10/09/2026): "Flexão de braço: progredir para
 * 31 kg", "Prancha alta: reduzir para 25 kg" e "Aplicar muda a semana 6 para RIR 4" numa
 * semana de descarga. Nenhuma era defeito de tela. O app pedia kg e repetições em todo bloco
 * que não fosse aeróbio, os dois geradores de exemplo gravavam quilos onde não existe carga
 * externa, o ajuste da força usava o teto de esforço do AERÓBIO, e a renovação progredia por
 * cima da descarga. Cada bloco abaixo trava um desses:
 *
 *  A. os dois geradores de exemplo registram como o app (modoDeRegistro): nada de kg em peso
 *     do corpo ou elástico, nada de kg nem repetição em isométrico, o aeróbio registrado em
 *     toda sessão feita, um registro por série e cada registro dentro da própria semana;
 *  B. sem carga externa, o ajuste decide por repetições e não devolve quilo, mesmo com kg
 *     antigo no histórico;
 *  C. isométrico não recebe sugestão de carga, e a renovação nunca mira semana de descarga
 *     nem parte dela;
 *  D. o teto de esforço da força é o da dose de força do perfil: quem tem hipertensão e cumpre
 *     a folga prescrita não é mandado descarregar;
 *  E. "progredir" sobe a carga e "reduzir" desce, sempre: em carga leve o incremento de 1,2%
 *     arredondava de volta ao mesmo número ("Elevação lateral: progredir para 6 kg" nos 6 kg).
 */
import { semearDemoVSL } from "../src/data/semearDemo";
import { completarHistoricoDosExemplos } from "../src/data/historicoExemplos";
import { seedAlunos, seedAvaliacoes } from "../src/data/alunos";
import { getExercise } from "../src/data/exercises";
import { modoDeRegistro, totalSeriesDe, type Execucao } from "../src/data/execucao";
import type { BlocoSessao, PlanoTreino } from "../src/data/periodizacao";
import { ajustarCarga } from "../src/lib/gps/autorregulacao";
import { renovarMicrociclo } from "../src/lib/gps/renovarMicrociclo";
import { modAjusteDaForca } from "../src/lib/gps/farmacos";

const falhas: string[] = [];
const ok = (m: string) => console.log(`[check:ajustes] ok: ${m}`);
const DIA = 86_400_000;
const SEMANA = 7 * DIA;

const demo = semearDemoVSL();
const estado = {
  alunos: [...demo.alunos, ...seedAlunos],
  avaliacoes: [...demo.avaliacoes, ...seedAvaliacoes],
  planos: demo.planos,
  liberacoes: demo.liberacoes,
  execucoes: demo.execucoes,
  sessaoFeedbacks: demo.feedbacks,
};
const hist = completarHistoricoDosExemplos(estado, { reavaliacaoDias: 30 });
const planos: PlanoTreino[] = [...estado.planos, ...hist.planos];
const blocoPorId = new Map<string, { b: BlocoSessao; p: PlanoTreino }>();
for (const p of planos)
  for (const m of p.macrociclo.mesociclos)
    for (const mc of m.microciclos) for (const s of mc.sessoes) for (const b of s.blocos) blocoPorId.set(b.id, { b, p });

/* ---------------- A. os geradores registram como o app ---------------- */
function conferirGerador(nome: string, execs: Execucao[], feedbacks: { planoId: string; semana: number; sessaoRef: string }[]) {
  const erros: Record<string, string[]> = {};
  const marca = (k: string, ex: string) => (erros[k] ??= []).push(ex);
  for (const e of execs) {
    const reg = blocoPorId.get(e.blocoRef);
    if (!reg) { marca("registro sem bloco no plano", e.id); continue; }
    const { b, p } = reg;
    const modo = modoDeRegistro(b, e.exercicioSlug ? getExercise(e.exercicioSlug)?.equipamento : undefined);
    if (modo !== "carga-e-reps" && e.cargaFeita != null) marca(`kg onde não há carga externa (${modo})`, `${e.exercicioSlug} ${e.cargaFeita} kg`);
    if ((modo === "tempo" || modo === "conclusao") && e.repsFeitas != null) marca(`repetição em bloco de ${modo}`, `${e.exercicioSlug} x${e.repsFeitas}`);
    if (modo !== "conclusao" && totalSeriesDe(b) > 1 && e.serie == null) marca("registro sem série num bloco de várias séries", e.id);
    const inicio = new Date(p.data).setHours(0, 0, 0, 0) + (e.semana - 1) * SEMANA;
    if (e.concluidoEm < inicio || e.concluidoEm >= inicio + SEMANA) marca("registro fora da própria semana", `${e.exercicioSlug} s${e.semana}`);
  }
  // Sessão com PSE registrada e aeróbio no plano: o aeróbio tem de ter o seu registro.
  for (const f of feedbacks) {
    const p = planos.find((x) => x.id === f.planoId);
    const sessao = p?.macrociclo.mesociclos.flatMap((m) => m.microciclos).find((mc) => mc.semana === f.semana)?.sessoes.find((s) => s.id === f.sessaoRef);
    for (const b of sessao?.blocos.filter((x) => x.tipo === "aerobio") ?? [])
      if (!execs.some((e) => e.blocoRef === b.id && e.semana === f.semana)) marca("sessão feita com o aeróbio sem registro", `${sessao!.nome} s${f.semana}`);
  }
  const tipos = Object.keys(erros);
  if (tipos.length)
    for (const k of tipos) falhas.push(`A (${nome}): ${erros[k].length} ${k}, por exemplo ${erros[k].slice(0, 2).join(" | ")}`);
  else ok(`${nome}: ${execs.length} registros com os mesmos campos do app, cada um na sua semana`);
}
conferirGerador("demo do VSL", demo.execucoes, demo.feedbacks);
conferirGerador("histórico dos exemplos", hist.execucoes, hist.feedbacks);

/* ---------------- B. sem carga externa, o ajuste não fala em quilo ---------------- */
{
  const serie = (s: number, reps: number, rpe: number, kg?: number): Execucao => ({
    id: `x-${s}`, alunoId: "a", planoId: "p", semana: 3, sessaoRef: "s", blocoRef: "b", exercicioSlug: "flexao-de-braco",
    serie: s, repsFeitas: reps, rpe, cargaFeita: kg, concluidoEm: 1000 + s,
  });
  // Histórico antigo com quilo digitado numa flexão: o quilo não pode voltar como conduta.
  const comKgAntigo = [serie(1, 12, 7, 28), serie(2, 12, 7, 28)];
  const r = ajustarCarga(comKgAntigo, { min: 8, max: 12 }, { semCargaExterna: true });
  if (r.proximaCarga != null || r.cargaBase != null) falhas.push(`B: flexão de braço com kg antigo devolveu ${r.proximaCarga} kg; peso do corpo não tem carga a sugerir.`);
  else if (r.acao !== "subir") falhas.push(`B: 12 de 12 repetições com esforço controlado deveria progredir por repetição, e saiu "${r.acao}".`);
  else ok(`peso do corpo progride por repetição, sem quilo ("${r.motivo.slice(0, 60)}...")`);
  // E sem nenhum quilo registrado (o registro novo), o ajuste não pode ficar mudo.
  const semKg = ajustarCarga([serie(1, 7, 7), serie(2, 6, 8)], { min: 8, max: 12 }, { semCargaExterna: true });
  if (semKg.acao !== "descarregar" || semKg.proximaCarga != null) falhas.push(`B: repetições abaixo da faixa sem carga saiu "${semKg.acao}" com ${semKg.proximaCarga} kg.`);
  else ok("sem quilo nenhum no registro, o ajuste ainda lê as repetições");
}

/* ---------------- C. isométrico fora, descarga respeitada ---------------- */
{
  let isoComSugestao = 0;
  let alvoNaDescarga = 0;
  let baseNaDescarga = 0;
  let casos = 0;
  const tipoDa = (p: PlanoTreino, w?: number) => p.macrociclo.mesociclos.flatMap((m) => m.microciclos).find((mc) => mc.semana === w)?.tipo;
  for (const p of demo.planos) {
    // Registro de isométrico com quilo e repetição, como o app antigo deixava gravar.
    const iso = p.macrociclo.mesociclos.flatMap((m) => m.microciclos).flatMap((mc) => mc.sessoes.flatMap((s) => s.blocos.map((b) => ({ b, semana: mc.semana, s }))))
      .filter((x) => x.b.tipo === "isometrico" && x.b.exercicioSlug);
    const legado: Execucao[] = iso.map((x, i) => ({
      id: `leg-${i}`, alunoId: p.alunoId, planoId: p.id, semana: x.semana, sessaoRef: x.s.id, blocoRef: x.b.id,
      exercicioSlug: x.b.exercicioSlug, cargaFeita: 30, repsFeitas: 10, rpe: 7, concluidoEm: p.data + x.semana * SEMANA,
    }));
    const execs = [...demo.execucoes.filter((e) => e.planoId === p.id), ...legado];
    for (let w = 1; w <= p.semanas; w++) {
      const r = renovarMicrociclo(p, w, execs, [], undefined, {});
      casos++;
      if (r.sugestoes.some((s) => iso.some((x) => x.b.exercicioSlug === s.slug))) isoComSugestao++;
      if (r.semanaAlvo != null && tipoDa(p, r.semanaAlvo) !== "carga") alvoNaDescarga++;
      if (execs.some((e) => e.semana === r.semanaBase) && tipoDa(p, r.semanaBase) !== "carga" &&
        [...Array(r.semanaBase).keys()].some((k) => tipoDa(p, k + 1) === "carga" && execs.some((e) => e.semana === k + 1))) baseNaDescarga++;
    }
  }
  if (isoComSugestao) falhas.push(`C: ${isoComSugestao} renovação(ões) sugeriram carga para exercício isométrico.`);
  if (alvoNaDescarga) falhas.push(`C: ${alvoNaDescarga} renovação(ões) miraram uma semana de descarga ou teste; a folga do plano seria desfeita.`);
  if (baseNaDescarga) falhas.push(`C: ${baseNaDescarga} renovação(ões) partiram de uma semana de descarga, com cargas de 85%.`);
  if (!isoComSugestao && !alvoNaDescarga && !baseNaDescarga) ok(`${casos} renovações: nenhuma sugere carga ao isométrico, parte da descarga ou mira nela`);
}

/* ---------------- D. o teto da força é o da força ---------------- */
{
  // Hipertensão estágio 1 declara teto de esforço para o AERÓBIO e nenhum piso de reserva para
  // a força. Quem cumpre RIR 4 (esforço 6, e 7 na última série) está dentro do prescrito.
  const mod = modAjusteDaForca({ grupos: ["hipertensao-estagio-1"], idade: 50 });
  const serie = (s: number, rpe: number): Execucao => ({
    id: `h-${s}`, alunoId: "a", planoId: "p", semana: 2, sessaoRef: "s", blocoRef: "b", exercicioSlug: "leg-press-45",
    serie: s, repsFeitas: 12, rpe, cargaFeita: 60, concluidoEm: 1000 + s,
  });
  const r = ajustarCarga([serie(1, 6), serie(2, 7)], { min: 10, max: 15 }, { modPerfil: mod });
  if (r.acao === "descarregar") falhas.push(`D: hipertensão com esforço 6 e 7 foi mandada descarregar (teto da força ${mod?.rpeTeto}); o teto usado é o do aeróbio.`);
  else ok(`hipertensão cumprindo a folga prescrita não é mandada descarregar (teto da força ${mod?.rpeTeto ?? "geral"})`);
  // E o piso de reserva da idade continua valendo: aos 72 anos, esforço 9 é alto demais.
  const idoso = modAjusteDaForca({ grupos: [], idade: 72 });
  const r2 = ajustarCarga([serie(1, 8), serie(2, 9)], { min: 10, max: 15 }, { modPerfil: idoso });
  if (r2.acao !== "descarregar") falhas.push(`D: aos 72 anos, esforço 9 não pediu mais folga (teto ${idoso?.rpeTeto}).`);
  else ok(`o piso de reserva da idade continua apertando o teto (72 anos: teto ${idoso?.rpeTeto})`);
}

/* ---------------- E. o passo não some no arredondamento ---------------- */
{
  const serie = (s: number, kg: number, reps: number, rpe: number): Execucao => ({
    id: `e-${s}`, alunoId: "a", planoId: "p", semana: 1, sessaoRef: "s", blocoRef: "b", exercicioSlug: "elevacao-lateral",
    serie: s, cargaFeita: kg, repsFeitas: reps, rpe, concluidoEm: 1000 + s,
  });
  const sobe = ajustarCarga([serie(1, 6, 15, 6), serie(2, 6, 15, 7)], { min: 10, max: 15 }, { incrementoPct: 0.012 });
  const desce = ajustarCarga([serie(1, 2, 8, 7), serie(2, 2, 7, 8)], { min: 10, max: 15 }, { descargaPct: 0.1 });
  let parados = 0;
  for (const p of demo.planos) {
    const execs = demo.execucoes.filter((e) => e.planoId === p.id);
    for (let w = 1; w <= p.semanas; w++)
      for (const s of renovarMicrociclo(p, w, execs, [], undefined, {}).sugestoes) {
        const a = s.ajuste;
        if (a.cargaBase == null || a.proximaCarga == null) continue;
        if ((a.acao === "subir" && a.proximaCarga <= a.cargaBase) || (a.acao === "descarregar" && a.proximaCarga >= a.cargaBase)) parados++;
      }
  }
  if (sobe.proximaCarga == null || sobe.proximaCarga <= 6) falhas.push(`E: 6 kg com 15 de 15 repetições "progrediu" para ${sobe.proximaCarga} kg.`);
  if (desce.proximaCarga == null || desce.proximaCarga >= 2) falhas.push(`E: 2 kg abaixo da faixa "reduziu" para ${desce.proximaCarga} kg.`);
  if (parados) falhas.push(`E: ${parados} sugestão(ões) da demo mandam mudar a carga para o mesmo número.`);
  if (sobe.proximaCarga! > 6 && desce.proximaCarga! < 2 && !parados)
    ok(`progredir sobe e reduzir desce, também em carga leve (6 kg vira ${sobe.proximaCarga} kg)`);
}

/* ---------------- F. o app pede só o que o bloco mede ----------------
   A origem de tudo: o registro do app. Renderizado de verdade, com os blocos do plano da demo. */
{
  const React = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { RegistroBloco } = await import("../src/components/student/blocoRegistro");
  const todos = demo.planos.flatMap((p) => p.macrociclo.mesociclos.flatMap((m) => m.microciclos.flatMap((mc) => mc.sessoes.flatMap((s) => s.blocos))));
  const achar = (modo: string) =>
    todos.find((b) => modoDeRegistro(b, b.exercicioSlug ? getExercise(b.exercicioSlug)?.equipamento : undefined) === modo && b.exercicioSlug);
  const campos = (b: BlocoSessao) => {
    const html = renderToStaticMarkup(
      React.createElement(RegistroBloco, { bloco: b, cor: "#2064EC", semana: 1, planoId: "p", alunoId: "a", sessaoRef: "s", onRegistrar: () => {} }),
    );
    return { kg: />kg</.test(html) || /aria-label="[^"]*kg/.test(html), reps: /repetições/.test(html) };
  };
  const esperado: [string, { kg: boolean; reps: boolean }][] = [
    ["tempo", { kg: false, reps: false }],
    ["reps", { kg: false, reps: true }],
    ["carga-e-reps", { kg: true, reps: true }],
  ];
  let certos = 0;
  for (const [modo, quer] of esperado) {
    const b = achar(modo);
    if (!b) { falhas.push(`F: a demo não tem bloco de registro "${modo}" para conferir.`); continue; }
    const tem = campos(b);
    if (tem.kg !== quer.kg || tem.reps !== quer.reps)
      falhas.push(`F: ${b.nome ?? b.exercicioSlug} (${modo}) pede kg=${tem.kg} e repetições=${tem.reps}; devia pedir kg=${quer.kg} e repetições=${quer.reps}.`);
    else certos++;
  }
  if (certos === esperado.length) ok("o registro do app pede kg só com carga externa e repetição só onde a dose não é tempo");
}

if (falhas.length) {
  console.error(`\n[check:ajustes] REPROVADO (${falhas.length})`);
  for (const f of falhas) console.error("  - " + f);
  process.exit(1);
}
console.log("[check:ajustes] tudo certo.");
