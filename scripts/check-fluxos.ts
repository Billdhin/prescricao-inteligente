/**
 * GUARDRAIL DE FLUXO: contexto que se manda tem que ser contexto que se lê.
 *
 * Nasceu de uma queixa de campo do Filipe: em "Escolher grupo", dentro do perfil de um
 * aluno, o sistema mandava para o catálogo de grupos SEM dizer de quem era a consulta. Ele
 * escolhia o grupo, a tela seguinte pedia um aluno que ele já tinha escolhido, e o voltar
 * saía em outro lugar. A frase dele: "eu já estou vindo da tela de um aluno".
 *
 * Achando a causa, apareceu a família inteira:
 *   · link mandando `?aluno=` para uma tela que não lê `?aluno=` (promessa vazia, e eu
 *     mesmo tinha criado uma dessas dois dias antes);
 *   · a aba do aluno apagada da URL logo depois de aplicada, o que fazia voltar,
 *     recarregar e trocar de aluno caírem sempre na Visão;
 *   · busca e filtro da lista em estado local, jogados fora ao voltar de uma ficha.
 *
 * O que este arquivo trava:
 *   1. PROMESSA VAZIA. Nenhum link pode enviar um parâmetro de contexto que a tela de
 *      destino nunca lê. É a asserção mais geral, e a que pega a classe inteira.
 *   2. AS PORTAS QUE PRECISAM DE CONTEXTO. Os saltos onde perder o aluno já custou caro.
 *   3. ESTADO QUE TEM QUE SOBREVIVER. A aba do aluno e os filtros da lista vivem na URL.
 *
 * Ele NÃO tenta adivinhar navegação em geral: cobre os parâmetros de contexto declarados
 * abaixo, que são os que carregam identidade de aluno e de origem.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const raiz = join(import.meta.dirname, "..");
const src = join(raiz, "src");
const falhas: string[] = [];
const reprovar = (m: string) => falhas.push(m);

const ler = (p: string) => readFileSync(join(raiz, p), "utf8");

function varrer(dir: string, acc: string[] = []): string[] {
  for (const nome of readdirSync(dir)) {
    const p = join(dir, nome);
    if (statSync(p).isDirectory()) varrer(p, acc);
    else if (/\.tsx?$/.test(nome)) acc.push(p);
  }
  return acc;
}

/** Os parâmetros que carregam CONTEXTO (identidade), não configuração de tela. */
const PARAMS_DE_CONTEXTO = ["aluno", "origem", "fase", "plano", "grupo", "aba", "avaliar", "secao"];

/**
 * Que arquivo atende cada rota. Escrito à mão de propósito: o App.tsx carrega quase tudo
 * por `pagina(() => import(...))`, e resolver isso por análise estática seria um
 * interpretador. Uma tabela curta que alguém precisa atualizar ao criar rota é mais
 * honesta que uma adivinhação que erra em silêncio.
 */
const ROTA_ARQUIVO: Record<string, string> = {
  "/gps": "src/pages/Gps.tsx",
  "/prescrever-treino": "src/pages/PrescreverTreino.tsx",
  "/semaforo": "src/pages/Semaforo.tsx",
  "/assessments": "src/pages/Avaliacoes.tsx",
  "/alunos": "src/pages/Alunos.tsx",
  "/special-groups": "src/pages/SpecialGroups.tsx",
  "/comparador": "src/pages/Comparador.tsx",
  "/consultar": "src/pages/Consultar.tsx",
  "/movement-lab": "src/pages/MovementLabDetail.tsx",
  "/dashboard": "src/pages/ProfessionalDashboard.tsx",
};
/** Rotas com segmento dinâmico: o arquivo que atende `/alunos/:id` e afins. */
const ROTA_DINAMICA: [RegExp, string][] = [
  [/^\/alunos\/[^/]+\/perfil$/, "src/pages/AlunoPerfil.tsx"],
  [/^\/alunos\/[^/]+$/, "src/pages/AlunoDetail.tsx"],
  [/^\/special-groups\/[^/]+$/, "src/pages/SpecialGroupDetail.tsx"],
];

/** Os parâmetros que um arquivo de fato LÊ. */
function paramsLidos(arquivoRel: string): Set<string> {
  let txt: string;
  try {
    txt = ler(arquivoRel);
  } catch {
    return new Set();
  }
  const lidos = new Set<string>();
  for (const m of txt.matchAll(/\.get\(\s*["'`]([a-zA-Z]+)["'`]\s*\)/g)) lidos.add(m[1]);
  return lidos;
}

function arquivoDaRota(caminho: string): string | null {
  if (ROTA_ARQUIVO[caminho]) return ROTA_ARQUIVO[caminho];
  for (const [re, arq] of ROTA_DINAMICA) if (re.test(caminho)) return arq;
  return null;
}

/* ---------------- 1 · promessa vazia: manda o que ninguém lê ---------------- */
{
  const arquivos = varrer(src);
  const cacheLidos = new Map<string, Set<string>>();

  for (const abs of arquivos) {
    const rel = relative(raiz, abs).replace(/\\/g, "/");
    const txt = readFileSync(abs, "utf8");

    // Casa `to="/x?y=z"`, `to={`/x?y=${v}`}` e `navigate("/x?y=z")`.
    for (const m of txt.matchAll(/(?:to=\{?|navigate\(\s*)["'`](\/[^"'`\s]*\?[^"'`\s]*)["'`]/g)) {
      const url = m[1];
      const [caminhoBruto, queryBruta] = url.split("?");
      // Normaliza interpolação: `/alunos/${id}` vira `/alunos/x` só para casar a rota.
      const caminho = caminhoBruto.replace(/\$\{[^}]*\}/g, "x").replace(/\/$/, "") || "/";
      const arq = arquivoDaRota(caminho);
      if (!arq) continue;

      if (!cacheLidos.has(arq)) cacheLidos.set(arq, paramsLidos(arq));
      const lidos = cacheLidos.get(arq)!;

      const enviados = [...queryBruta.matchAll(/(?:^|&)([a-zA-Z]+)=/g)].map((x) => x[1]);
      for (const p of enviados) {
        if (!PARAMS_DE_CONTEXTO.includes(p)) continue;
        if (lidos.has(p)) continue;
        const linha = txt.slice(0, m.index).split("\n").length;
        reprovar(
          `${rel}:${linha} manda "?${p}=" para ${caminho}, e ${arq} nunca lê esse parâmetro. ` +
            `O contexto some no caminho e a tela de destino pede de novo o que o profissional já escolheu.`,
        );
      }
    }
  }
}

/* -------------- 2 · as portas que não podem perder o aluno --------------- */
{
  const detalhe = ler("src/pages/AlunoDetail.tsx");
  if (!/to=\{`\/special-groups\?aluno=\$\{aluno\.id\}&origem=aluno`\}/.test(detalhe))
    reprovar(
      'src/pages/AlunoDetail.tsx: "Escolher grupo" voltou a apontar para o catálogo sem dizer de quem é ' +
        "a consulta. O card promete associar a jornada DESTE aluno; sem o contexto, a tela seguinte pede " +
        "um aluno que ele já escolheu.",
    );

  const lista = ler("src/pages/SpecialGroups.tsx");
  // Cobra o FATO, não a grafia: a lista lê os dois parâmetros de contexto e os anexa ao
  // link de cada cartão. A primeira versão desta asserção cobrava a string "origem=aluno"
  // e reprovou a correção que passou a REPASSAR a origem em vez de chumbá-la, que era
  // justamente a versão certa.
  const repassa =
    lista.includes('sp.get("aluno")') &&
    lista.includes('sp.get("origem")') &&
    lista.includes("/special-groups/${g.slug}${sufixo}");
  if (!repassa)
    reprovar(
      "src/pages/SpecialGroups.tsx: a lista de grupos parou de repassar o aluno para os cartões. " +
        "Ela é passagem, não destino: quem chega com contexto tem que sair com ele.",
    );

  const grupoDetalhe = ler("src/pages/SpecialGroupDetail.tsx");
  if (!/associarGrupoAoAluno/.test(grupoDetalhe))
    reprovar(
      "src/pages/SpecialGroupDetail.tsx: sumiu a ação de associar a jornada ao aluno. Sem ela, quem " +
        'clicou em "Escolher grupo" chega ao destino e não tem como escolher nada.',
    );
}

/* --------- 3 · estado de tela que precisa sobreviver ao ir e voltar --------- */
{
  const detalhe = ler("src/pages/AlunoDetail.tsx");
  if (/params\.delete\(["'`]aba["'`]\)/.test(detalhe))
    reprovar(
      "src/pages/AlunoDetail.tsx: a aba voltou a ser apagada da URL. Isso faz voltar, recarregar e " +
        "trocar de aluno caírem sempre na Visão, e a aba deixa de ser linkável.",
    );
  if (!/const aba: Aba = abaNaUrl/.test(detalhe))
    reprovar("src/pages/AlunoDetail.tsx: a aba deixou de ser derivada da URL e voltou a ser estado que morre.");

  const lista = ler("src/pages/Alunos.tsx");
  if (!/params\.get\(["'`]busca["'`]\)/.test(lista) || !/params\.get\(["'`]filtro["'`]\)/.test(lista))
    reprovar(
      "src/pages/Alunos.tsx: busca ou filtro voltaram a ser estado local. Voltar de uma ficha joga fora " +
        "o que o profissional tinha filtrado, e com carteira grande isso é refazer o trabalho toda vez.",
    );
}

/* ------------------------------- resultado ------------------------------- */

if (falhas.length) {
  console.error(`\n[check:fluxos] REPROVOU com ${falhas.length} problema(s):\n`);
  for (const f of falhas) console.error("  - " + f);
  console.error(
    "\nContexto que se manda tem que ser contexto que se lê, e estado de tela que o\n" +
      "profissional montou não pode morrer ao sair e voltar.\n",
  );
  process.exit(1);
}

console.log(
  "[check:fluxos] ok: nenhum link manda contexto que o destino ignora, as portas do aluno levam o aluno, " +
    "e a aba do aluno e os filtros da lista sobrevivem ao ir e voltar.",
);
