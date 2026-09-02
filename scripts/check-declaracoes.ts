/**
 * check:declaracoes — o aluno declara, o profissional confirma, e a ficha só muda pela porta certa.
 *
 * O aluno passou a preencher os próprios dados no app (01/09/2026, pedido de campo). As
 * invariantes que fazem isso ser seguro num produto de prescrição:
 *
 *  1. A ÚNICA porta para a ficha (`aplicarDeclaracao`) nunca escreve o que é decisão do
 *     profissional: nível, condição clínica confirmada, restrição estruturada, objetivo
 *     secundário. O aluno diz "pressão alta"; quem declara hipertensão estágio 1 é o CREF.
 *  2. Tudo que entra pela porta carrega a origem ("informado pelo aluno em DD/MM"): se um
 *     plano for questionado, o registro diz o que veio de quem.
 *  3. Remédio pelo nome só vira classe quando o catálogo reconhece. Nome desconhecido vira
 *     nota para classificar, nunca classe inventada.
 *  4. "Não sei" é resposta: entra nas notas como "não soube informar", distinto de vazio.
 *  5. Declaração pendente vira parada na rota do dia, com a ação ao lado, pela mesma fonte
 *     única do próximo passo.
 *  6. A tela do aluno tem "Pular por agora" em toda tela e "Não sei informar" onde cabe, e
 *     nunca mostra rótulo clínico ao aluno.
 *
 * Roda em `npm run check`.
 */
import fs from "node:fs";
import path from "node:path";
import type { Aluno } from "@/data/alunos";
import type { PlanoTreino } from "@/data/periodizacao";
import { aplicarDeclaracao, classesDosRemedios, idDeclaracao, type DeclaracaoAluno } from "@/data/declaracoes";
import { proximoPasso, type CicloCtx } from "@/lib/gps/proximoPasso";
import { rotaDoDia } from "@/lib/gps/rotaDoDia";
import { gerarPlano } from "@/lib/gps/periodizacao";

const falhas: string[] = [];
const ok = (m: string) => console.log(`[check:declaracoes] ok: ${m}`);
const falha = (m: string) => falhas.push(m);

const aluno = {
  id: "a1",
  nome: "Aluno de teste",
  iniciais: "AT",
  objetivo: "Hipertrofia",
  nivel: "Iniciante",
  restricoes: [],
  equipamentos: ["Máquina"],
  status: "ativo",
  criadoEm: Date.now(),
} as unknown as Aluno;

const decl = (campo: DeclaracaoAluno["campo"], valor: string, naoSei?: boolean): DeclaracaoAluno => ({
  id: idDeclaracao("a1", campo),
  alunoId: "a1",
  campo,
  valor,
  naoSei,
  status: "pendente",
  declaradaEm: new Date("2026-09-01T12:00:00").getTime(),
});

/* 1. A porta nunca decide pelo profissional. */
{
  const PROIBIDOS = ["nivel", "grupoEspecial", "condicoesAtencao", "restricoes", "objetivoSecundario", "faseJornada"];
  const todas: DeclaracaoAluno[] = [
    decl("idade", "58"),
    decl("sexo", "F"),
    decl("telefone", "11 99999-0000"),
    decl("objetivo", "Emagrecimento"),
    decl("disponibilidade", "3 dias, 45 min"),
    decl("equipamentos", JSON.stringify(["Halter", "Elástico"])),
    decl("remedios", "atenolol, losartana, remedinho-que-nao-existe"),
    decl("saude", "pressão alta desde 2022; dor no joelho direito; parei há 8 meses"),
    decl("liberacao", "Tenho liberação do médico para treinar"),
  ];
  const tocou = new Set<string>();
  for (const d of todas) for (const k of Object.keys(aplicarDeclaracao(aluno, d))) tocou.add(k);
  const invasao = PROIBIDOS.filter((k) => tocou.has(k));
  if (invasao.length) falha(`aplicarDeclaracao escreveu decisão do profissional: ${invasao.join(", ")}`);
  else ok(`a porta para a ficha nunca toca ${PROIBIDOS.join(", ")}`);

  /* "pressão alta" e "dor no joelho" ficam como nota, não viram condição nem restrição. */
  const saude = aplicarDeclaracao(aluno, decl("saude", "pressão alta desde 2022; dor no joelho direito"));
  if (!saude.observacoes || Object.keys(saude).length !== 1)
    falha(`saúde relatada deveria virar só nota; virou ${Object.keys(saude).join(", ")}`);
  else ok("saúde relatada vira nota para o profissional decidir na seção certa");
}

/* 2. Tudo carrega a origem. */
{
  const n = aplicarDeclaracao(aluno, decl("saude", "dor lombar"));
  if (!/informado pelo aluno em 01\/09/.test(n.observacoes ?? "")) falha("a nota entrou sem a origem e a data");
  else ok("a nota carrega “informado pelo aluno em DD/MM”");
  const r = aplicarDeclaracao(aluno, decl("remedios", "atenolol"));
  if (!r.farmacos?.every((f) => f.fonte === "relato_aluno")) falha("o fármaco confirmado não ficou com fonte “relato_aluno”");
  else ok("o fármaco confirmado nasce com a fonte “relato do aluno”");
}

/* 3. Remédio pelo nome: só o que o catálogo reconhece vira classe. */
{
  const { reconhecidos, desconhecidos } = classesDosRemedios("Atenolol, losartana, xarope da vovó");
  const classes = reconhecidos.map((r) => r.classe);
  if (!classes.includes("betabloqueador")) falha("atenolol não virou betabloqueador");
  else if (!desconhecidos.includes("xarope da vovó")) falha("nome desconhecido não ficou como desconhecido");
  else ok(`atenolol → betabloqueador, losartana → ${classes[1] ?? "?"}, e “xarope da vovó” fica para classificar`);
  const p = aplicarDeclaracao(aluno, decl("remedios", "xarope da vovó"));
  if (p.farmacos && p.farmacos.length) falha("nome desconhecido virou classe de fármaco");
  else if (!/classificar/.test(p.observacoes ?? "")) falha("nome desconhecido não virou nota para classificar");
  else ok("nome desconhecido vira nota, nunca classe inventada");
}

/* 4. "Não sei" é resposta. */
{
  const p = aplicarDeclaracao(aluno, decl("remedios", "", true));
  if (!/não soube informar/.test(p.observacoes ?? "")) falha("“não sei” sumiu em vez de virar “não soube informar”");
  else ok("“não sei” entra como “não soube informar”, distinto de vazio");
}

/* 5. Pendente vira parada na rota do dia. */
{
  const agora = Date.now();
  const DIA = 86_400_000;
  const macro = gerarPlano({ objetivo: "Hipertrofia", nivel: "Iniciante", semanas: 12, frequencia: 3 }).principal;
  const plano = { id: "p1", alunoId: "a1", status: "ativo", data: agora - 10 * DIA, frequenciaSemanal: 3, semanas: 12, macrociclo: macro } as unknown as PlanoTreino;
  const ctx: CicloCtx = {
    avaliacoes: [{ alunoId: "a1", data: agora - 5 * DIA } as never],
    prescricoes: [],
    planos: [plano],
    liberacoes: [{ alunoId: "a1", data: agora, resultado: "liberado" } as never],
    execucoes: [{ alunoId: "a1", concluidoEm: agora - DIA }],
    declaracoes: [decl("saude", "pressão alta")],
  };
  const passo = proximoPasso(aluno, ctx);
  if (!passo.chip || !/informou/i.test(passo.chip.label)) falha(`declaração pendente não gerou chip (chip: ${passo.chip?.label ?? "nenhum"})`);
  else ok(`declaração pendente gera o chip “${passo.chip.label}”`);
  const rota = rotaDoDia([aluno], ctx);
  const parada = rota.paradas.find((x) => x.aluno.id === "a1");
  if (!parada) falha("o aluno com declaração pendente não entrou na rota do dia");
  else ok(`entra na rota do dia com a ação “${parada.acao}”`);
  const semPendencia = proximoPasso(aluno, { ...ctx, declaracoes: [{ ...decl("saude", "x"), status: "confirmada" }] });
  if (semPendencia.chip && /informou/i.test(semPendencia.chip.label)) falha("declaração já confirmada continuou gerando chip");
  else ok("declaração confirmada não gera mais chip");
}

/* 6. A tela do aluno: pular sempre, não sei onde cabe, nada de rótulo clínico. */
{
  const tela = fs.readFileSync(path.resolve(process.cwd(), "src/components/student/SobreVoce.tsx"), "utf8");
  if (!/Pular por agora/.test(tela)) falha("a tela do aluno perdeu o “Pular por agora”");
  else ok("a tela do aluno tem “Pular por agora”");
  if (!/Não sei informar/.test(tela)) falha("a tela do aluno perdeu o “Não sei informar”");
  else ok("a tela do aluno tem “Não sei informar”");
  if (/estágio|hipertens[aã]o estágio|risco cardiovascular|contraindica/i.test(tela)) falha("a tela do aluno mostra rótulo clínico ao aluno");
  else ok("a tela do aluno não mostra rótulo clínico");
  if (!/Nada entra no seu treino sem ele confirmar/.test(tela)) falha("o fim da tela não diz que nada entra sem o professor confirmar");
  else ok("o fim da tela diz que nada entra no treino sem o professor confirmar");
}

if (falhas.length) {
  console.error(`\n[check:declaracoes] ${falhas.length} falha(s):`);
  for (const f of falhas) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log("[check:declaracoes] tudo certo.");
