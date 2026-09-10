/**
 * GUARDRAIL: "Completar o histórico dos exemplos" (src/data/historicoExemplos.ts).
 *
 * A função escreve muito de uma vez só (perfil, avaliações, plano, milhares de séries), e
 * quatro coisas nela quebram em silêncio:
 *
 *  A. tocar aluno que NÃO é de exemplo: seria forjar prontuário de gente de verdade;
 *  B. deixar o exemplo pela metade: o perfil tem de fechar os seis passos, a reavaliação não
 *     pode estar vencida e o plano não pode estar "parado de registrar";
 *  C. duplicar ao rodar de novo: a segunda rodada, logo depois da primeira, não pode gerar
 *     nenhuma avaliação, sessão ou semáforo novo;
 *  D. inventar registro no futuro, ou travessão em texto que aparece na tela.
 */
import { seedAlunos, seedAvaliacoes, type Aluno } from "../src/data/alunos";
import { semearDemoVSL } from "../src/data/semearDemo";
import { completarHistoricoDosExemplos, type EstadoDaCarteira } from "../src/data/historicoExemplos";
import { completudeAluno } from "../src/lib/gps/perfilAluno";
import { proximoPasso } from "../src/lib/gps/proximoPasso";

const problemas: string[] = [];
const DIA = 86_400_000;
const hoje = Date.now();

const demo = semearDemoVSL();
const real: Aluno = {
  id: "aluno-real-1",
  nome: "Aluno Real",
  iniciais: "AR",
  objetivo: "Hipertrofia",
  nivel: "Iniciante",
  restricoes: [],
  equipamentos: ["Máquina"],
  status: "ativo",
  criadoEm: hoje - 200 * DIA,
};
const estado: EstadoDaCarteira = {
  alunos: [...demo.alunos, ...seedAlunos, real],
  avaliacoes: [...demo.avaliacoes, ...seedAvaliacoes],
  planos: demo.planos,
  liberacoes: demo.liberacoes,
  execucoes: demo.execucoes,
  sessaoFeedbacks: demo.feedbacks,
};

/*
 * A mesma verificação em quatro momentos: no dia em que os exemplos foram carregados e
 * semanas depois, que é quando eles envelhecem e a função mais importa. Os exemplos nascem
 * com datas relativas ao carregamento; `agora` anda e eles ficam para trás.
 */
let resumo = "";
for (const diasDepois of [0, 9, 23, 45]) {
  const agora = hoje + diasDepois * DIA;
  const h = completarHistoricoDosExemplos(estado, { reavaliacaoDias: 60, agora });

  /* ---- A. só exemplo ---- */
  const tocouReal =
    h.alunos.some((a) => a.id === real.id) ||
    [...h.avaliacoes, ...h.planos, ...h.liberacoes, ...h.execucoes, ...h.feedbacks].some((x) => x.alunoId === real.id);
  if (tocouReal) problemas.push(`[+${diasDepois}d] A: a função gerou registro para um aluno que não é de exemplo.`);

  /* ---- B. exemplo completo ---- */
  const mescla = <T extends { id: string }>(novos: T[], atuais: T[]) => {
    const m = new Map(atuais.map((x) => [x.id, x] as const));
    for (const n of novos) m.set(n.id, n);
    return [...m.values()];
  };
  const depois: EstadoDaCarteira = {
    alunos: estado.alunos.map((a) => h.alunos.find((x) => x.id === a.id) ?? a),
    avaliacoes: mescla(h.avaliacoes, estado.avaliacoes),
    planos: [...h.planos, ...estado.planos],
    liberacoes: mescla(h.liberacoes, estado.liberacoes),
    execucoes: mescla(h.execucoes, estado.execucoes),
    sessaoFeedbacks: mescla(h.feedbacks, estado.sessaoFeedbacks),
  };
  for (const a of depois.alunos) {
    if (a.id === real.id) continue;
    const c = completudeAluno(a);
    if (c.feitas !== c.total) problemas.push(`[+${diasDepois}d] B: ${a.nome} ficou com o perfil em ${c.feitas} de ${c.total} (falta: ${c.faltaTexto}).`);
    const avs = depois.avaliacoes.filter((x) => x.alunoId === a.id).sort((x, y) => x.data - y.data);
    if (avs.length < 2) problemas.push(`[+${diasDepois}d] B: ${a.nome} tem ${avs.length} avaliação; o histórico pede série.`);
    const ultima = avs[avs.length - 1];
    if (!ultima || agora - ultima.data > 14 * DIA) problemas.push(`[+${diasDepois}d] B: a última avaliação de ${a.nome} tem mais de 14 dias.`);
    if (!a.proximaReavaliacaoEm || a.proximaReavaliacaoEm < agora) problemas.push(`[+${diasDepois}d] B: a reavaliação de ${a.nome} ficou vencida.`);
    for (const av of avs) {
      const m = av.medidas;
      if (!m.peso || !m.altura || !m.percentualGordura || !m.pressaoSistolica || !m.fcRepouso)
        problemas.push(`[+${diasDepois}d] B: avaliação ${av.id} de ${a.nome} sem as medidas básicas.`);
      if (!av.testes?.length || !av.perimetros?.length) problemas.push(`[+${diasDepois}d] B: avaliação ${av.id} de ${a.nome} sem testes ou perímetros.`);
    }
    const plano = depois.planos.find((p) => p.alunoId === a.id && p.status === "ativo");
    if (!plano) problemas.push(`[+${diasDepois}d] B: ${a.nome} ficou sem plano ativo.`);
    const passo = proximoPasso(a, {
      avaliacoes: depois.avaliacoes,
      prescricoes: [],
      planos: depois.planos,
      liberacoes: depois.liberacoes,
      execucoes: depois.execucoes,
      declaracoes: [],
    });
    if (passo.chip?.label === "Parou de registrar") problemas.push(`[+${diasDepois}d] B: ${a.nome} continua "parou de registrar".`);
    if (passo.chip?.label === "Perfil incompleto") problemas.push(`[+${diasDepois}d] B: ${a.nome} continua "perfil incompleto".`);
    const series = depois.execucoes.filter((e) => e.alunoId === a.id);
    if (!series.some((e) => e.cargaFeita != null)) problemas.push(`[+${diasDepois}d] B: ${a.nome} sem treino registrado com carga.`);
  }

  /* ---- C. idempotente ---- */
  const h2 = completarHistoricoDosExemplos(depois, { reavaliacaoDias: 60, agora });
  const novosNaSegunda = {
    avaliacoes: h2.avaliacoes.filter((x) => !depois.avaliacoes.some((y) => y.id === x.id)).length,
    planos: h2.planos.length,
    execucoes: h2.execucoes.length,
    feedbacks: h2.feedbacks.length,
    liberacoes: h2.liberacoes.length,
  };
  for (const [k, n] of Object.entries(novosNaSegunda))
    if (n > 0) problemas.push(`[+${diasDepois}d] C: rodar de novo gerou ${n} ${k} novos; a segunda rodada tem de ser vazia.`);
  const ids = h.execucoes.map((e) => e.id);
  if (new Set(ids).size !== ids.length) problemas.push(`[+${diasDepois}d] C: ids de execução repetidos na mesma rodada.`);

  /* ---- D. nada no futuro, nada de travessão ---- */
  if (h.execucoes.some((e) => e.concluidoEm > agora) || h.feedbacks.some((f) => f.concluidaEm > agora) || h.avaliacoes.some((a) => a.data > agora))
    problemas.push(`[+${diasDepois}d] D: registro com data no futuro.`);
  const textos = JSON.stringify([h.alunos.map((a) => a.observacoes), h.avaliacoes.map((a) => a.observacoes), h.feedbacks.map((f) => f.observacao)]);
  if (textos.includes("—")) problemas.push(`[+${diasDepois}d] D: travessão em texto gerado.`);

  if (diasDepois === 0)
    resumo =
      `${h.alunos.length} exemplos, ${h.avaliacoes.length} avaliações, ${h.planos.length} planos novos, ` +
      `${h.feedbacks.length} sessões, ${h.execucoes.length} séries, ${h.liberacoes.length} semáforos`;
}

if (problemas.length) {
  console.error(`[check:historico] FALHOU: ${problemas.length} problema(s).`);
  for (const p of problemas) console.error("  • " + p);
  process.exit(1);
}
console.log(`[check:historico] ok: ${resumo}; a segunda rodada é vazia, também 9, 23 e 45 dias depois.`);
