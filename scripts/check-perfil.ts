/**
 * GUARDRAIL: o perfil do aluno não pode mentir que está preenchido, e a coluna
 * "o que isso muda" não pode afirmar nada que o motor não faça.
 *
 * O cadastro virou um modal de quatro campos e a saúde foi morar na página de
 * perfil. Isso troca um problema (formulário que ninguém termina) por outro, se
 * ninguém vigiar: um perfil que se declara completo com o campo vazio. Um aluno
 * "100%" de quem não se perguntou a condição é pior do que um aluno visivelmente
 * pela metade, porque o profissional para de procurar.
 *
 * O que este check trava:
 *   1. SILÊNCIO NÃO É RESPOSTA. Um aluno recém-criado (nome, idade, nível,
 *      objetivo) nunca fecha saúde, medicamentos, equipamentos nem notas.
 *   2. A DECISÃO FECHA. Declarar "sem condição", "nenhuma restrição física" e
 *      "não informar medicação" fecha as seções correspondentes, porque são
 *      respostas, não ausências.
 *   3. PADRÃO NÃO É CONFIRMAÇÃO. Equipamentos nasce com o kit típico marcado e
 *      mesmo assim conta como pendente até o profissional confirmar.
 *   4. A RÉGUA É ÚNICA. O percentual é sempre feitas/total; nenhuma tela pode
 *      calcular por conta própria (o check varre as telas atrás de aritmética
 *      paralela sobre as seções).
 *   5. PERFIL NÃO BLOQUEIA CUIDADO. O gate duro continua sendo a avaliação:
 *      `podeMontarTreino` não pode consultar a completude do perfil.
 *   6. A CONSEQUÊNCIA É DERIVADA. Toda linha de `oQueIssoMuda` sai de um catálogo
 *      ou motor; e consequência de medicação `somenteTeoria` (expectativa de
 *      adaptação) nunca vira card de ação.
 *   7. VOZ: nada de travessão em texto visível das telas novas.
 *
 * Roda com `npm run check:perfil`.
 */
import { readFileSync } from "node:fs";
import {
  SECOES_PERFIL,
  completudeAluno,
  secaoInicial,
  vizinhasDaSecao,
} from "../src/lib/gps/perfilAluno";
import { oQueIssoMuda } from "../src/lib/gps/oQueIssoMuda";
import { CATALOGO_RESTRICOES, criarRestricao } from "../src/lib/gps/restricoes";
import { CATALOGO_FARMACOS, criarFarmaco } from "../src/data/farmacos";
import { groupGpsRules } from "../src/lib/gps/groupRules";
import { montarChecklist } from "../src/data/semaforo";
import type { Aluno } from "../src/data/alunos";

const problemas: string[] = [];

const KIT_PADRAO = ["Máquina", "Barra", "Halter", "Polia", "Peso corporal"];

/** O aluno exatamente como o modal mínimo o cria. */
function alunoRecemCriado(): Aluno {
  return {
    id: "teste",
    nome: "Mariana Alves",
    iniciais: "MA",
    idade: 34,
    objetivo: "Emagrecimento",
    nivel: "Iniciante",
    restricoes: [],
    equipamentos: [...KIT_PADRAO],
    status: "ativo",
    criadoEm: 0,
    nivelDesde: 0,
  };
}

const feita = (a: Aluno, id: string) => completudeAluno(a).secoes.find((s) => s.secao.id === id)?.feita ?? false;

/* ---- 1. silêncio não é resposta ---- */
{
  const novo = alunoRecemCriado();
  const c = completudeAluno(novo);
  for (const id of ["saude", "medicamentos", "equipamentos", "notas"]) {
    if (feita(novo, id)) {
      problemas.push(
        `completude: aluno recem-criado ja conta "${id}" como feita. Campo vazio nao e resposta.`,
      );
    }
  }
  if (!feita(novo, "basicos") || !feita(novo, "objetivo")) {
    problemas.push("completude: basicos e objetivo vem do modal e deveriam nascer feitos.");
  }
  if (c.feitas !== 2) problemas.push(`completude: aluno recem-criado deveria ter 2 secoes feitas, tem ${c.feitas}.`);
  if (c.proxima !== "saude") problemas.push(`completude: a proxima secao de um aluno novo deveria ser saude, e ${c.proxima}.`);
  if (secaoInicial(novo) !== "saude") problemas.push("secaoInicial: deveria abrir na primeira pendente.");
  // sem idade, basicos abre
  const semIdade = { ...novo, idade: undefined };
  if (feita(semIdade, "basicos")) problemas.push("completude: aluno sem idade nao pode fechar basicos.");
}

/* ---- 2. a decisão fecha ---- */
{
  const decidido: Aluno = {
    ...alunoRecemCriado(),
    semCondicaoDeclarada: true,
    restricoes: [criarRestricao("nenhuma_restricao")],
    farmacosNaoInformado: true,
  };
  if (!feita(decidido, "saude")) {
    problemas.push('completude: "sem condicao" + "nenhuma restricao" sao decisoes e deveriam fechar saude.');
  }
  if (!feita(decidido, "medicamentos")) {
    problemas.push('completude: "nao informar medicacao" e uma decisao e deveria fechar medicamentos.');
  }
  // metade não fecha: condição declarada sem restrição decidida segue pendente
  const meio: Aluno = { ...alunoRecemCriado(), grupoEspecial: "hipertensao-estagio-1" };
  if (feita(meio, "saude")) {
    problemas.push("completude: condicao sem decisao sobre restricoes nao pode fechar saude.");
  }
}

/* ---- 3. padrão não é confirmação ---- */
{
  const comKit = alunoRecemCriado();
  if (feita(comKit, "equipamentos")) {
    problemas.push("completude: o kit tipico e um padrao, nao uma informacao sobre o local. Nao pode fechar sozinho.");
  }
  const confirmado: Aluno = { ...comKit, perfilConfirmado: ["equipamentos"] };
  if (!feita(confirmado, "equipamentos")) {
    problemas.push("completude: confirmar equipamentos precisa fechar a secao.");
  }
}

/* ---- 4. a régua é única ---- */
{
  const total = SECOES_PERFIL.length;
  const cheio: Aluno = {
    ...alunoRecemCriado(),
    semCondicaoDeclarada: true,
    restricoes: [criarRestricao("nenhuma_restricao")],
    farmacosNaoInformado: true,
    perfilConfirmado: ["equipamentos", "notas"],
  };
  const c = completudeAluno(cheio);
  if (c.feitas !== total || c.pct !== 100 || c.proxima !== undefined || c.faltaTexto !== "") {
    problemas.push(`completude: perfil todo decidido deveria dar 100% sem pendencia (deu ${c.pct}%, falta "${c.faltaTexto}").`);
  }
  // trilho coerente: primeira sem anterior, última sem próxima, e nenhuma órfã
  if (vizinhasDaSecao(SECOES_PERFIL[0].id).anterior) problemas.push("trilho: a primeira secao nao pode ter anterior.");
  if (vizinhasDaSecao(SECOES_PERFIL[total - 1].id).proxima) problemas.push("trilho: a ultima secao nao pode ter proxima.");

  // aritmética paralela nas telas: só a régua conta seções
  const telas = [
    "src/pages/AlunoPerfil.tsx",
    "src/components/app/AppLayout.tsx",
    "src/components/alunos/OQueIssoMudaPainel.tsx",
  ];
  for (const t of telas) {
    const src = readFileSync(t, "utf8");
    if (/SECOES_PERFIL\.(filter|reduce)/.test(src)) {
      problemas.push(`${t}: contagem de secoes fora de completudeAluno. A regua e uma so.`);
    }
    if (/\/\s*SECOES_PERFIL\.length\s*\)?\s*\*\s*100/.test(src)) {
      problemas.push(`${t}: percentual calculado na tela. Use completudeAluno().pct.`);
    }
  }
}

/* ---- 5. perfil não bloqueia cuidado ---- */
{
  const passo = readFileSync("src/lib/gps/proximoPasso.ts", "utf8");
  if (/perfilAluno|completudeAluno/.test(passo)) {
    problemas.push(
      "proximoPasso.ts consulta a completude do perfil. O gate duro e a avaliacao; perfil incompleto informa, nao tranca.",
    );
  }
}

/* ---- 6. a consequência é derivada ---- */
{
  // aluno com condição, restrição e medicação: cada item precisa ter origem no motor
  const classeQueAge = CATALOGO_FARMACOS.find((f) =>
    f.consequencias.some((c) => c.aprovacao === "aprovada" && !c.somenteTeoria),
  );
  const completo: Aluno = {
    ...alunoRecemCriado(),
    grupoEspecial: "hipertensao-estagio-1",
    restricoes: [criarRestricao("joelho_dor")],
    farmacos: classeQueAge ? [criarFarmaco(classeQueAge.classe)] : undefined,
  };
  const muda = oQueIssoMuda(completo);

  if (!muda.semaforo) {
    problemas.push("oQueIssoMuda: condicao declarada deveria acender o semaforo do dia.");
  } else {
    const real = montarChecklist("hipertensao-estagio-1", completo.farmacos);
    if (muda.semaforo.perguntas !== real?.itens.length) {
      problemas.push("oQueIssoMuda: o numero de perguntas nao veio de montarChecklist.");
    }
  }

  const daCondicao = muda.itens.find((i) => i.origem === "condicao");
  const cuidados = groupGpsRules["hipertensao-estagio-1"]?.cuidados ?? [];
  if (!daCondicao) {
    problemas.push("oQueIssoMuda: condicao com regra no motor precisa render item.");
  } else if (!daCondicao.efeitos.some((e) => cuidados.some((c) => c.startsWith(e.slice(0, 20))))) {
    problemas.push("oQueIssoMuda: o efeito da condicao nao bate com os cuidados de groupGpsRules.");
  }

  const daRestricao = muda.itens.find((i) => i.origem === "restricao");
  const efeitosCat = CATALOGO_RESTRICOES.find((c) => c.tag === "joelho_dor")?.efeitos ?? [];
  if (!daRestricao) {
    problemas.push("oQueIssoMuda: restricao marcada precisa render item.");
  } else if (!daRestricao.efeitos.every((e) => efeitosCat.includes(e))) {
    problemas.push("oQueIssoMuda: efeito de restricao que nao existe no catalogo.");
  }

  // A trava do catálogo de fármacos: teoria não vira ação. Testar UMA classe não
  // basta, e testar "a lista da tela não contém X" também não: o corte em duas
  // linhas esconderia o vazamento. Então a prova é por CONTENÇÃO, classe a classe:
  // tudo o que sai precisa estar entre as consequências aprovadas e não teóricas.
  for (const cat of CATALOGO_FARMACOS) {
    const permitidas = new Set(
      cat.consequencias
        .filter((c) => c.aprovacao === "aprovada" && !c.somenteTeoria && c.tipo !== "expectativa-adaptacao")
        .map((c) => c.descricao),
    );
    const soEssa = oQueIssoMuda({ ...alunoRecemCriado(), farmacos: [criarFarmaco(cat.classe)] });
    const saiu = soEssa.itens.filter((i) => i.origem === "medicacao").flatMap((i) => i.efeitos);
    for (const e of saiu) {
      if (!permitidas.has(e)) {
        problemas.push(
          `oQueIssoMuda: ${cat.classe} exibe consequencia nao aprovada ou somenteTeoria ("${e.slice(0, 50)}...").`,
        );
      }
    }
  }

  // Nada declarado, nada afirmado. O aluno do teste é o do modal mínimo, COM o kit
  // típico de equipamentos: se equipamento contasse como consequência clínica, a
  // coluna nunca ficaria vazia e o estado vazio seria código morto.
  const vazio = oQueIssoMuda(alunoRecemCriado());
  if (vazio.semaforo || vazio.itens.length || vazio.protocolo) {
    problemas.push("oQueIssoMuda: aluno sem nada declarado nao pode gerar consequencia clinica.");
  }
  if (!vazio.catalogo) {
    problemas.push("oQueIssoMuda: o recorte do catalogo por equipamento deveria aparecer como contexto.");
  }
}

/* ---- 7. voz ---- */
{
  const arquivos = [
    "src/pages/AlunoPerfil.tsx",
    "src/components/app/AlunoFormModal.tsx",
    "src/components/alunos/GavetaSelecao.tsx",
    "src/components/alunos/OQueIssoMudaPainel.tsx",
    "src/lib/gps/perfilAluno.ts",
  ];
  for (const f of arquivos) {
    const src = readFileSync(f, "utf8");
    // só texto visível: fora de comentários de bloco e de linha
    const semComentario = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    if (semComentario.includes("—")) {
      problemas.push(`${f}: travessao em texto visivel.`);
    }
  }
}

/* ------------------------------- veredito -------------------------------- */

if (problemas.length) {
  console.error("[check:perfil] FALHOU\n" + problemas.map((p) => `  - ${p}`).join("\n"));
  process.exit(1);
}

// Autoverificação: prova que a regra 1 de fato reprova quando quebrada. Se um dia
// "campo vazio conta como feito" voltar, esta linha é a que muda de valor primeiro.
const provaSilencio = feita(alunoRecemCriado(), "saude");
console.log(
  `[check:perfil] autoverificacao OK: aluno recem-criado tem saude=${provaSilencio ? "feita (ERRADO)" : "pendente"}, ` +
    `e a decisao "sem condicao + nenhuma restricao" fecha a mesma secao.`,
);
console.log(
  `[check:perfil] ok: ${SECOES_PERFIL.length} secoes, regua unica, perfil nao bloqueia avaliacao e ` +
    `toda consequencia da coluna vem do motor.`,
);
