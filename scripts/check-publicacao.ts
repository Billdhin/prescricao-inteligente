/**
 * check:publicacao — o treino gerado e não publicado aparece, e publicar faz o que promete.
 *
 * Pedido do Filipe (10/09/2026): "a parte de publicar o treino para o aluno não está muito
 * clara". O rascunho vivia na sessão do navegador, só a tela de prescrição sabia dele, e a
 * carteira dizia "Sem treino" de quem tinha um pronto esperando. As invariantes:
 *
 *  1. Publicar carimba a data em que o aluno COMEÇA: treino novo (ou refeito) começa na hora da
 *     publicação; edição do treino em uso mantém o calendário dele. A semana do aluno é contada
 *     dessa data, e o rascunho esperando dias chegava ao aluno já na semana 2.
 *  2. Os três estados (não publicado, alterações, publicado) saem de uma função só.
 *  3. Com rascunho e sem treino, o próximo passo é PUBLICAR: chip "Não publicado", destino no
 *     editor, verbo curto "Publicar" na rota do dia; o pedido de treino não apaga o chip.
 *  4. O rascunho nunca vai à nuvem nem ao aluno: nenhuma função de sync ou do portal o toca.
 *  5. O editor publica só pela porta única (`publicarPlano`) e não guarda mais rascunho na sessão.
 *
 * Roda em `npm run check`.
 */
import fs from "node:fs";
import path from "node:path";
import type { Aluno } from "@/data/alunos";
import type { PlanoTreino } from "@/data/periodizacao";
import { gerarPlano } from "@/lib/gps/periodizacao";
import { planoParaPublicar, situacaoDoTreino } from "@/lib/publicacao";
import { proximoPasso, CHIP_NAO_PUBLICADO, type CicloCtx } from "@/lib/gps/proximoPasso";
import { rotaDoDia, verboDaParada } from "@/lib/gps/rotaDoDia";

const falhas: string[] = [];
const ok = (m: string) => console.log(`[check:publicacao] ok: ${m}`);
const falha = (m: string) => falhas.push(m);
const ler = (rel: string) => fs.readFileSync(path.resolve(process.cwd(), rel), "utf8");

const DIA = 86_400_000;
const agora = Date.now();
const aluno = {
  id: "a1",
  nome: "Aluna de teste",
  iniciais: "AT",
  objetivo: "Hipertrofia",
  nivel: "Iniciante",
  idade: 30,
  semCondicaoDeclarada: true,
  restricoes: [{ tag: "nenhuma" }],
  farmacosNaoInformado: true,
  equipamentos: ["Máquina"],
  status: "ativo",
  criadoEm: agora - 30 * DIA,
} as unknown as Aluno;

const macro = gerarPlano({ objetivo: "Hipertrofia", nivel: "Iniciante", semanas: 12, frequencia: 3 }).principal;
const plano = (id: string, data: number, status: PlanoTreino["status"] = "ativo") =>
  ({ id, alunoId: "a1", status, data, titulo: "t", objetivo: "Hipertrofia", nivel: "Iniciante", frequenciaSemanal: 3, semanas: 12, macrociclo: macro, modeloId: "linear", raciocinio: "", refIds: [] }) as unknown as PlanoTreino;

/* 1. A data da publicação. */
{
  const gerado = plano("p-novo", agora - 4 * DIA);
  const novo = planoParaPublicar(gerado, undefined, agora);
  if (novo.data !== agora) falha("treino novo publicado manteve a data de GERAÇÃO: o aluno começaria dias atrasado");
  else ok("treino novo começa na hora da publicação, não na hora em que foi gerado");

  const emUso = plano("p1", agora - 20 * DIA);
  const edicao = planoParaPublicar({ ...emUso, titulo: "editado" }, emUso, agora);
  if (edicao.data !== emUso.data) falha("editar o treino em uso reiniciou o calendário do aluno");
  else ok("edição do treino em uso mantém a semana em que o aluno está");

  const refeito = planoParaPublicar(plano("p1", agora - DIA), emUso, agora);
  if (refeito.data !== agora) falha("treino refeito por cima do atual (mesmo id) não recomeçou na publicação");
  else ok("treino refeito por cima do atual recomeça na publicação");
  if (novo.status !== "ativo") falha("o publicado não saiu como ativo");
}

/* 2. Os estados. */
{
  const r = plano("p-r", agora);
  const casos: [string, ReturnType<typeof situacaoDoTreino>["estado"]][] = [
    ["sem nada", situacaoDoTreino("a1", [], []).estado],
    ["rascunho sem treino", situacaoDoTreino("a1", [], [r]).estado],
    ["treino + rascunho", situacaoDoTreino("a1", [plano("p1", agora - DIA)], [r]).estado],
    ["só treino", situacaoDoTreino("a1", [plano("p1", agora - DIA)], []).estado],
  ];
  const esperado = ["sem-treino", "nao-publicado", "alteracoes", "publicado"];
  const errados = casos.filter(([, e], i) => e !== esperado[i]);
  if (errados.length) falha(`estado errado: ${errados.map(([n, e]) => `${n} → ${e}`).join("; ")}`);
  else ok("sem treino, não publicado, alterações e publicado saem da mesma função");
  if (situacaoDoTreino("a1", [], [{ ...r, alunoId: "outro" }]).estado !== "sem-treino") falha("rascunho de outro aluno apareceu neste");
  else ok("rascunho de um aluno nunca aparece na ficha de outro");
}

/* 3. O próximo passo é publicar. */
{
  const base: CicloCtx = {
    avaliacoes: [{ alunoId: "a1", data: agora - 5 * DIA, medidas: {} } as never],
    prescricoes: [],
    planos: [],
    liberacoes: [],
    execucoes: [],
    rascunhos: [{ alunoId: "a1", data: agora - 2 * DIA }],
  };
  const passo = proximoPasso(aluno, base);
  if (passo.chip?.label !== CHIP_NAO_PUBLICADO) falha(`com rascunho e sem treino, o chip foi "${passo.chip?.label ?? "nenhum"}" e não "${CHIP_NAO_PUBLICADO}"`);
  else ok(`com rascunho e sem treino, o chip é "${CHIP_NAO_PUBLICADO}"`);
  if (!passo.cta.to?.startsWith("/prescrever-treino?aluno=a1")) falha(`o passo leva a ${passo.cta.to}, e não ao rascunho no editor`);
  else ok("o passo leva ao rascunho no editor");
  const verbo = verboDaParada(passo, "a1");
  if (verbo !== "Publicar") falha(`a rota do dia diz "${verbo}" para um treino pronto`);
  else ok('a rota do dia diz "Publicar"');
  if (!rotaDoDia([aluno], base).paradas.some((p) => p.aluno.id === "a1")) falha("o aluno com treino por publicar não entrou na rota do dia");
  else ok("o treino por publicar entra na rota do dia");

  const comPedido = proximoPasso(aluno, {
    ...base,
    declaracoes: [{ alunoId: "a1", campo: "pedido_treino", status: "pendente", declaradaEm: agora - DIA }],
  });
  if (comPedido.chip?.label !== CHIP_NAO_PUBLICADO || !comPedido.pediuTreino) falha("com pedido de treino, o chip deixou de dizer o clique que falta (ou perdeu o pedido)");
  else ok("com pedido de treino, o chip segue \"Não publicado\" e o pedido fica marcado na parada");

  const comTreino = proximoPasso(aluno, { ...base, planos: [plano("p1", agora - DIA)], liberacoes: [{ alunoId: "a1", data: agora, resultado: "liberado" } as never] });
  if (comTreino.chip?.label === CHIP_NAO_PUBLICADO) falha("com treino no app, o passo continuou cobrando publicação");
  else ok("com treino no app, o passo volta ao ciclo normal");
}

/* 4. O rascunho não sai do aparelho do profissional. */
{
  const onde = ["src/lib/backend/cloudSync.ts", "src/lib/backend/supabaseRepo.ts", "src/pages/AlunoPortal.tsx", "src/components/student/StudentApp.tsx"];
  const vazou = onde.filter((f) => /rascunho/i.test(ler(f)));
  if (vazou.length) falha(`o rascunho aparece em código de nuvem ou do aluno: ${vazou.join(", ")}`);
  else ok("o rascunho não passa pela nuvem nem pelo app do aluno");
  const store = ler("src/lib/store.ts");
  const bloco = store.match(/guardarRascunho: \(p\) => \{[\s\S]*?\n {6}\},/)?.[0] ?? "";
  if (!bloco) falha("não achei guardarRascunho na store");
  else if (/cloud/i.test(bloco)) falha("guardarRascunho espelha na nuvem");
  else ok("guardarRascunho fica só na store local");
}

/* 5. O editor publica pela porta única e esqueceu a sessão. */
{
  const tela = ler("src/pages/PrescreverTreino.tsx");
  if (/sessionStorage/.test(tela)) falha("o editor voltou a guardar rascunho na sessão do navegador (invisível para a carteira)");
  else ok("o editor não guarda rascunho na sessão");
  if (/\baddPlano\(|\bupdatePlano\(/.test(tela)) falha("o editor grava plano por fora de publicarPlano (pula data, pedido e rascunho)");
  else if (!/publicarPlano\(/.test(tela)) falha("o editor não publica por publicarPlano");
  else ok("o editor publica só por publicarPlano");
  if (/<Pill tone="success">Salvo<\/Pill>/.test(tela)) falha('o selo "Salvo" voltou: ele não diz se o aluno vê');
  else ok("o selo do editor diz se o aluno vê, e não só se está salvo");
}

if (falhas.length) {
  console.error(`\n[check:publicacao] ${falhas.length} falha(s):`);
  for (const f of falhas) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log("[check:publicacao] tudo certo.");
