/**
 * check:conta — a mesma conta pode atender e ser atendida, sem perder nada nem se misturar.
 *
 * O buraco original: uma pessoa cadastrada como aluno não tinha caminho para passar a
 * atender. A correção não foi "migrar de um para o outro", que destruiria um vínculo para
 * criar o outro, e sim reconhecer que são RELAÇÕES diferentes que convivem: `alunos.user_id`
 * é quem atende e `alunos.auth_user_id` é quem é atendido, colunas separadas desde a
 * migração 0005.
 *
 * As três regras aqui são as que, se quebrarem, quebram em silêncio: nenhuma delas derruba
 * a tela, todas produzem dado errado ou vazamento entre espaços.
 *
 * Roda em `npm run check`.
 */
import fs from "node:fs";
import path from "node:path";

const falhas: string[] = [];
const ler = (rel: string) => fs.readFileSync(path.resolve(process.cwd(), rel), "utf8");

/* ------------------------------------------------------------------ A ---- */
/**
 * A: toda leitura de fichas declara o ESCOPO.
 *
 * As policies do 0005 são permissivas e se somam com OU: `select("*")` sem filtro devolve a
 * união de "as fichas que eu atendo" com "a ficha que sou eu". Enquanto cada conta tinha um
 * papel só, a união era inofensiva. Agora ela colocaria o profissional dentro da própria
 * carteira, como aluno de si mesmo. E o pior é que nada quebraria: apareceria só mais uma
 * linha na lista.
 */
{
  const arquivos = ["src/lib/backend/supabaseRepo.ts", "src/lib/backend/cloudAuth.ts"];
  for (const rel of arquivos) {
    const texto = ler(rel);
    for (const m of texto.matchAll(/listarAlunos\(\s*\)/g)) {
      const linha = texto.slice(0, m.index).split("\n").length;
      falhas.push(`A: ${rel}:${linha} · listarAlunos() sem escopo devolve a união das duas policies.`);
    }
  }
  const repo = ler("src/lib/backend/supabaseRepo.ts");
  if (!/function listarAlunos\(escopo: "carteira" \| "meuTreino"\)/.test(repo))
    falhas.push("A: listarAlunos perdeu o parâmetro de escopo; a consulta voltaria a depender só da RLS.");
  if (!/\.eq\(coluna, await uid\(\)\)/.test(repo))
    falhas.push("A: listarAlunos não filtra mais por dono; o escopo virou enfeite.");
}

/* ------------------------------------------------------------------ B ---- */
/**
 * B: alternar de espaço NÃO desfaz vínculo nenhum.
 *
 * É a promessa que o texto do botão faz ao usuário ("você volta quando quiser"). Ela só se
 * sustenta porque a operação inteira é uma gravação de `role`: `professional_id` e
 * `alunos.auth_user_id` ficam intactos. No dia em que alguém "limpar" um deles junto, a
 * troca vira porta de mão única e o aluno perde o acesso ao próprio treino sem aviso.
 */
{
  const texto = ler("src/lib/backend/cloudAuth.ts");
  const i = texto.indexOf("export async function alternarEspaco");
  if (i < 0) falhas.push("B: não achei alternarEspaco (renomeado? mova a regra junto).");
  else {
    const corpo = texto.slice(i, texto.indexOf("\n}", i));
    if (!/salvarPerfil\(\{\s*role: destino\s*\}\)/.test(corpo))
      falhas.push("B: alternarEspaco não grava mais só o papel; confira o que mais ele mexe.");
    for (const proibido of ["professionalId:", "professional_id", "auth_user_id", "removerAluno", "delete"])
      if (corpo.includes(proibido))
        falhas.push(`B: alternarEspaco toca em "${proibido}"; alternar tem que preservar os dois vínculos.`);
  }
}

/* ------------------------------------------------------------------ C ---- */
/**
 * C: o app do aluno continua PURO.
 *
 * O profissional renderiza o StudentApp em modo prévia para ver o que o aluno vê. Se aquele
 * componente ler a sessão direto, a prévia passa a mostrar a conta DO PROFISSIONAL dentro da
 * simulação do aluno, e a troca de espaço apareceria para quem está só espiando. Por isso a
 * peça entra por prop (`rodapeDoPerfil`), e não por import.
 */
{
  const rel = "src/components/student/StudentApp.tsx";
  const texto = ler(rel);
  // Só CÓDIGO conta. A primeira versão desta regra lia o arquivo cru e reprovava o próprio
  // comentário que explica a prop, ensinando a apagar a explicação para o guardrail passar.
  const codigo = texto.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  const importa = (nome: string) => new RegExp(String.raw`import[^;]*\b${nome}\b[^;]*;`).test(codigo);
  const usaEmJsx = (nome: string) => new RegExp(String.raw`<${nome}\b|\b${nome}\(`).test(codigo);
  for (const proibido of ["cloudAuth", "AlternarEspaco", "useCloudAuth"])
    if (importa(proibido) || usaEmJsx(proibido))
      falhas.push(`C: ${rel} importa/usa "${proibido}"; o app do aluno deixaria de ser puro e a prévia mentiria.`);
  if (!/rodapeDoPerfil/.test(texto))
    falhas.push(`C: ${rel} perdeu a prop rodapeDoPerfil, que é como a troca de espaço entra sem quebrar a prévia.`);
}

/* --------------------------------------------------------------------------- */
if (falhas.length) {
  console.error(`\n[check:conta] FALHOU: ${falhas.length} problema(s).\n`);
  for (const f of falhas) console.error("  • " + f);
  console.error("");
  process.exit(1);
}
console.log(
  "[check:conta] ok: leitura de fichas sempre com escopo, alternar de espaço preserva os dois vínculos e o app do aluno segue puro.",
);
