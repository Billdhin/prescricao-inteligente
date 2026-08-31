/**
 * GUARDRAIL: os alunos de demonstração do VSL contam a história que o vídeo conta.
 *
 * O clique em "Carregar exemplos" gera os dois casos do VSL na hora, com o motor de verdade
 * (src/data/semearDemo.ts). Isso é a força do desenho e também o risco dele: qualquer
 * mudança no motor muda a demo, e uma demo quebrada seria descoberta no meio de uma
 * apresentação, que é o pior lugar. Este check conta a história ANTES, a cada alteração.
 *
 * O que trava:
 *
 *   1. AS DUAS CENAS DO VSL EXISTEM. Helena (58, hipertensa, artrose, betabloqueador) sai
 *      SEM zona de FC em todos os aeróbios e sem exercício que a restrição de joelho
 *      excluiria. Antônio (72, hipertenso) sai COM zona de FC (tem idade e FCrep medida) e
 *      com a disputa da reserva vencida pela idade, que é o painel do bloco 6.
 *   2. O HISTÓRICO É ÍNTEGRO. Toda execução aponta para sessão e bloco que existem no plano
 *      do próprio aluno, dentro das semanas vividas, sem data no futuro e sem id repetido.
 *   3. OS SEMÁFOROS SÃO REAIS. Cada liberação responde TODOS os itens do checklist do grupo
 *      e o resultado gravado é o que `avaliarSemaforo` recomputa das mesmas respostas.
 *   4. TEM VOLUME PARA OS GRÁFICOS. Avaliações em série e execuções suficientes para as
 *      curvas de evolução não nascerem vazias.
 *
 * Roda com `npm run check:demo`.
 */
import { semearDemoVSL } from "../src/data/semearDemo";
import { avaliarSemaforo, montarChecklist } from "../src/data/semaforo";
import { exercises } from "../src/data/exercises";
import { EFEITO_POR_TAG, criarRestricao } from "../src/lib/gps/restricoes";

const falhas: string[] = [];
const ok = (m: string) => console.log(`[check:demo] ok: ${m}`);

const d = semearDemoVSL();
const helena = d.alunos.find((a) => a.id === "al-vsl-helena");
const antonio = d.alunos.find((a) => a.id === "al-vsl-antonio");
const planoDe = (alunoId: string) => d.planos.find((p) => p.alunoId === alunoId);

if (!helena || !antonio) {
  console.error("[check:demo] REPROVADO: os dois alunos do VSL não existem no seed.");
  process.exit(1);
}

/* ---------------- 1. As duas cenas do VSL ---------------- */
type BlocoLido = { tipo?: string; exercicioSlug?: string; nome?: string; zonaFC?: string };
const blocosDe = (alunoId: string): BlocoLido[] => {
  const p = planoDe(alunoId);
  return p ? p.macrociclo.mesociclos.flatMap((m) => m.microciclos.flatMap((w) => w.sessoes.flatMap((s) => s.blocos as BlocoLido[]))) : [];
};

const aerH = blocosDe(helena.id).filter((b) => b.tipo === "aerobio");
const comZonaH = aerH.filter((b) => b.zonaFC != null).length;
if (comZonaH > 0)
  falhas.push(`Helena usa betabloqueador e ${comZonaH} bloco(s) aeróbio(s) saíram com zona de FC. A cena de abertura do VSL morreu.`);
else ok(`Helena: ${aerH.length} blocos aeróbios, nenhum com zona de FC (betabloqueador declarado)`);

// O exercício da Helena não pode ser um que a restrição de joelho EXCLUIRIA. A régua é a
// mesma do produto (EFEITO_POR_TAG), não uma lista de nomes que envelhece.
const avaliarJoelho = EFEITO_POR_TAG.joelho_dor;
const selJoelho = criarRestricao("joelho_dor");
const excluidos = blocosDe(helena.id)
  .filter((b) => b.tipo !== "aerobio" && b.exercicioSlug)
  .filter((b) => {
    const ex = exercises.find((e) => e.slug === b.exercicioSlug);
    return ex && avaliarJoelho && avaliarJoelho(ex, selJoelho).acao === "excluir";
  })
  .map((b) => b.nome ?? b.exercicioSlug);
if (excluidos.length) falhas.push(`Helena recebeu exercício que a restrição de joelho exclui: ${[...new Set(excluidos)].join(", ")}`);
else ok("Helena: nenhum exercício que a restrição de joelho excluiria");

const aerA = blocosDe(antonio.id).filter((b) => b.tipo === "aerobio");
const comZonaA = aerA.filter((b) => b.zonaFC != null).length;
if (comZonaA === 0)
  falhas.push("Antônio tem idade e FCrep medida e nenhum aeróbio saiu com zona de FC: o contraste com a Helena sumiu.");
else ok(`Antônio: ${comZonaA}/${aerA.length} aeróbios com zona de FC personalizada`);

/* ---------------- 2. Histórico íntegro ---------------- */
const agora = Date.now();
const ids = new Set<string>();
let orfas = 0, futuras = 0, duplicadas = 0;
for (const e of d.execucoes) {
  if (ids.has(e.id)) duplicadas++;
  ids.add(e.id);
  if (e.concluidoEm > agora) futuras++;
  const p = planoDe(e.alunoId);
  const micro = p?.macrociclo.mesociclos.flatMap((m) => m.microciclos).find((w) => w.semana === e.semana);
  const sessao = micro?.sessoes.find((s) => s.id === e.sessaoRef);
  const bloco = sessao?.blocos.find((b) => b.id === e.blocoRef);
  if (!bloco) orfas++;
}
if (orfas) falhas.push(`${orfas} execução(ões) apontam para sessão/bloco que não existem no plano`);
if (futuras) falhas.push(`${futuras} execução(ões) com data no futuro`);
if (duplicadas) falhas.push(`${duplicadas} execução(ões) com id repetido`);
if (!orfas && !futuras && !duplicadas) ok(`${d.execucoes.length} execuções íntegras (sem órfã, sem futuro, sem id repetido)`);

/* ---------------- 3. Semáforos reais ---------------- */
let semaforosRuins = 0;
for (const l of d.liberacoes) {
  const aluno = d.alunos.find((a) => a.id === l.alunoId);
  const checklist = montarChecklist(l.grupoSlug, aluno?.farmacos);
  if (!checklist) { semaforosRuins++; continue; }
  const semResposta = checklist.itens.filter((i) => !(i.id in l.respostas)).length;
  const recomputado = avaliarSemaforo(checklist, l.respostas);
  if (semResposta > 0 || recomputado.cor !== l.resultado) semaforosRuins++;
}
if (semaforosRuins) falhas.push(`${semaforosRuins} liberação(ões) com item sem resposta ou resultado divergente do motor`);
else ok(`${d.liberacoes.length} semáforos completos, resultado idêntico ao recomputado pelo motor`);

/* ---------------- 4. Volume para os gráficos ---------------- */
const avalH = d.avaliacoes.filter((a) => a.alunoId === helena.id).length;
if (avalH < 3) falhas.push(`Helena tem ${avalH} avaliações; a curva de evolução precisa de pelo menos 3`);
if (d.execucoes.length < 100) falhas.push(`só ${d.execucoes.length} execuções; o histórico ficaria ralo demais`);
if (d.feedbacks.some((f) => f.pse != null && (f.pse! < 0 || f.pse! > 10))) falhas.push("PSE fora da escala 0 a 10");
if (!falhas.some((f) => f.includes("avaliações") || f.includes("execuções") || f.includes("PSE")))
  ok(`${avalH} avaliações da Helena, ${d.feedbacks.length} PSEs de sessão, tudo em escala`);

if (falhas.length) {
  console.error(`\n[check:demo] REPROVADO (${falhas.length})`);
  for (const f of falhas) console.error("  - " + f);
  process.exit(1);
}
console.log("[check:demo] tudo certo.");
