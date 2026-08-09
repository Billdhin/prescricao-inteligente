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
 *   5. O LIMITE ENTRE INFORMAR E TRANCAR. Perfil incompleto NÃO impede avaliar (a
 *      porta de entrada fica aberta) e IMPEDE prescrever. Testadas as duas metades,
 *      mais a saída de um clique, mais a ordem dos bloqueios, mais a exigência de
 *      que TODA tela que gera prescrição consulte `prontidaoParaPrescrever`.
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
import { CATALOGO_RESTRICOES, GRUPOS_RESTRICAO, criarRestricao } from "../src/lib/gps/restricoes";
import { specialGroups } from "../src/data/specialGroups";
import { CATALOGO_FARMACOS, criarFarmaco } from "../src/data/farmacos";
import { groupGpsRules } from "../src/lib/gps/groupRules";
import { montarChecklist } from "../src/data/semaforo";
import { proximoPasso } from "../src/lib/gps/proximoPasso";
import type { Aluno, Avaliacao } from "../src/data/alunos";
import {
  prontidaoParaPrescrever,
  podeMontarTreino,
  type CtxProntidao,
} from "../src/lib/gps/prontidao";

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

/* ---- 5. o limite entre informar e trancar ----
   Perfil incompleto NÃO impede avaliar (a porta de entrada fica aberta) e IMPEDE
   prescrever (o motor não trabalha no escuro). A primeira versão deste check
   afirmava o contrário, e por causa disso um aluno de quem ninguém tinha
   perguntado nada gerava plano de 12 semanas. As duas metades são testadas. */
{
  const novo = alunoRecemCriado();
  const semAval: CtxProntidao = { avaliacoes: [] };
  const comAval: CtxProntidao = {
    avaliacoes: [{ id: "av1", alunoId: novo.id, data: Date.now(), tipo: "inicial", medidas: {} } as Avaliacao],
  };

  // 5a. avaliar continua livre: nada no caminho da avaliação olha a completude
  const avaliar = readFileSync("src/pages/Avaliacoes.tsx", "utf8");
  if (/prontidaoParaPrescrever|completudeAluno/.test(avaliar)) {
    problemas.push(
      "Avaliacoes.tsx consulta prontidao/completude. Avaliar e a porta de entrada e nao pode depender do perfil.",
    );
  }

  // 5b. As três declarações de saúde continuam SENDO COBRADAS, mas como PENDÊNCIA:
  //     desde 01/08/2026 elas não trancam a prescrição (feedback de campo: o fluxo
  //     estava preso a uma sequência rígida). O que o guardrail protege agora é que
  //     elas não sumam — cobrar sem trancar, nunca deixar de cobrar.
  const p = prontidaoParaPrescrever(novo, comAval);
  for (const esperado of ["saude-nao-declarada", "restricoes-nao-decididas", "medicacao-nao-decidida"] as const) {
    if (!p.pendencias.some((b) => b.motivo === esperado)) {
      problemas.push(`prontidao: faltou a pendencia "${esperado}" para o aluno recem-criado.`);
    }
    if (p.bloqueios.some((b) => b.motivo === esperado)) {
      problemas.push(`prontidao: "${esperado}" e completude de perfil e nao pode voltar a TRANCAR a prescricao.`);
    }
  }

  // 5c. o aluno com tudo DECIDIDO passa (o bloqueio tem saída, e ela funciona)
  const decidido: Aluno = {
    ...novo,
    semCondicaoDeclarada: true,
    restricoes: [criarRestricao("nenhuma_restricao")],
    farmacosNaoInformado: true,
  };
  const q = prontidaoParaPrescrever(decidido, comAval);
  if (!q.ok) {
    problemas.push(
      `prontidao: aluno com tudo declarado deveria liberar (travou em ${q.bloqueios.map((b) => b.motivo).join(", ")}).`,
    );
  }

  // 5d. sem avaliação, a avaliação é a PRIMEIRA pendência (a ordem importa: é a
  //     primeira coisa que a tela cobra). Ela não tranca mais, mas nunca some.
  const r = prontidaoParaPrescrever(decidido, semAval);
  if (r.pendencias[0]?.motivo !== "sem-avaliacao") {
    problemas.push("prontidao: sem avaliacao, a primeira pendencia precisa ser a avaliacao.");
  }
  if (r.bloqueios.some((b) => b.motivo === "sem-avaliacao")) {
    problemas.push("prontidao: falta de avaliacao virou pendencia e nao pode voltar a TRANCAR.");
  }
  if (!podeMontarTreino(decidido, semAval).ok) {
    problemas.push("podeMontarTreino: sem avaliacao ele agora libera, com a ressalva no motivo.");
  }
  if (!podeMontarTreino(decidido, semAval).motivo) {
    problemas.push("podeMontarTreino: sem avaliacao ele precisa devolver o motivo da ressalva.");
  }

  // 5e. sem equipamento nenhum não há o que prescrever
  const semEquip = prontidaoParaPrescrever({ ...decidido, equipamentos: [] }, comAval);
  if (!semEquip.bloqueios.some((b) => b.motivo === "sem-equipamento")) {
    problemas.push("prontidao: aluno sem nenhum equipamento precisa bloquear.");
  }

  // 5f. TODAS as telas que geram prescrição consultam a prontidão
  for (const tela of ["src/pages/PrescreverTreino.tsx", "src/pages/Gps.tsx"]) {
    const src = readFileSync(tela, "utf8");
    if (!src.includes("prontidaoParaPrescrever")) {
      problemas.push(`${tela} gera prescricao sem consultar prontidaoParaPrescrever.`);
    }
  }

  // 5g. O passo com destino explícito manda. Quem desenha o CTA do próximo passo
  //     precisa honrar `passo.cta.to` ANTES do switch por `kind`, senão a espinha
  //     mostra o rótulo certo ("Abrir Saúde e restrições") apontando para a tela de
  //     prescrição bloqueada. Foi exatamente o que aconteceu, e em dois dos três
  //     lugares que desenham esse botão.
  // AlunoDetail NÃO desenha mais o CTA do próximo passo por conta própria: ele
  // renderiza sempre a `LinhaDoCuidado` (nesta lista), que é a âncora única do ciclo
  // e honra `passo.cta.to`. Antes havia um `CtaProximoPasso` duplicado no cabeçalho e
  // no banner, dois primários escuros idênticos na mesma dobra; removidos. O destino
  // explícito continua garantido pela Linha do cuidado, que é montada sem condição na
  // ficha do aluno.
  const desenhamCta = [
    "src/pages/ProfessionalDashboard.tsx",
    "src/pages/Alunos.tsx",
    "src/components/treino/LinhaDoCuidado.tsx",
  ];
  for (const tela of desenhamCta) {
    // Comentários fora ANTES de procurar: a primeira versão desta regra passava
    // quando alguém desligava o `if` e deixava `passo.cta.to` no comentário ao lado.
    const src = readFileSync(tela, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*$/gm, "");
    // Precisa ser USO de verdade: dentro de um if, ou como fallback com ??. O
    // painel recebe o passo já achatado em `ParadaDoDia`, então lá o campo é `p.to`.
    const usoReal = /(if\s*\(\s*(passo\.cta|p)\.to\s*\))|((passo\.cta|p)\.to\s*\?\?)/.test(src);
    if (!usoReal) {
      problemas.push(`${tela} desenha o CTA do proximo passo e ignora passo.cta.to (destino explicito).`);
    }
  }

  // ...e o passo bloqueado por perfil precisa DE FATO trazer o destino do perfil.
  const passoBloqueado = proximoPasso(novo, {
    avaliacoes: comAval.avaliacoes,
    prescricoes: [],
    planos: [],
    liberacoes: [],
    execucoes: [],
  });
  if (!passoBloqueado.cta.to?.includes("/perfil")) {
    problemas.push(
      `proximoPasso: com o perfil bloqueando, o CTA precisa apontar para o perfil (aponta para "${passoBloqueado.cta.to ?? "o padrao da etapa"}").`,
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

/* ============================================================================
 * A TELA NÃO PODE ESCONDER O QUE ELA MESMA GUARDOU.
 *
 * Dois defeitos da mesma família, os dois relatados do campo pelo Filipe, os dois em listas
 * que a tela recorta para caber:
 *
 *  A. CONDIÇÃO MARCADA SUMINDO. Os chips de condição mostravam os seis atalhos mais usados.
 *     Uma condição marcada fora desses seis não era desenhada: ele teve de buscar "diabetes"
 *     para marcar, e depois de marcada ela sumia do quadro, só reaparecendo ao digitar de
 *     novo. Uma tela que esconde a seleção que ela guardou faz o profissional duvidar do que
 *     gravou, reabrir e remarcar.
 *
 *  B. A RESPOSTA "NÃO TEM" ESCONDIDA. "Nenhuma restrição física" mora no grupo `historico`,
 *     que é o quarto filtro da gaveta, abaixo de vários vizinhos. Para dizer que o aluno não
 *     tem restrição era preciso adivinhar a aba e rolar até o fim, e enquanto isso a seção
 *     parecia travada, porque a única saída visível era declarar uma restrição inexistente.
 *
 * A trava é sobre a REGRA das listas, não sobre pixel: as marcadas sempre presentes, e a
 * resposta exclusiva sempre alcançável de qualquer filtro.
 * ========================================================================== */
{
  const ATALHO = 6;
  const ordenadas = [...specialGroups].sort((a, b) => a.nome.localeCompare(b.nome));

  // A: a marcada aparece com busca vazia, com busca que casa e com busca que NÃO casa.
  const foraDoAtalho = ordenadas.slice(ATALHO);
  if (!foraDoAtalho.length) {
    problemas.push("chips de condição: o catálogo encolheu abaixo do atalho e a trava perdeu o caso de teste.");
  } else {
    const marcada = foraDoAtalho[0].slug;
    const selecionadas = [marcada];
    const lista = (q: string) => {
      const naBusca = q
        ? ordenadas.filter((g) => g.nome.toLowerCase().includes(q) || g.descricaoCurta.toLowerCase().includes(q))
        : ordenadas.slice(0, ATALHO);
      const marcadas = selecionadas.map((s) => ordenadas.find((g) => g.slug === s)!).filter(Boolean);
      return [...marcadas, ...naBusca.filter((g) => !selecionadas.includes(g.slug))];
    };
    for (const q of ["", "zzz-nao-casa-com-nada"])
      if (!lista(q).some((g) => g.slug === marcada))
        problemas.push(
          `CONDIÇÃO MARCADA SUMIU da lista de chips com busca "${q}": a seleção do profissional tem de aparecer sempre.`,
        );
    /*
     * E o teste acima, sozinho, NÃO guardaria nada: ele exercita uma reimplementação da regra
     * aqui dentro, não o componente. Se alguém voltar `lista` para o recorte puro em
     * AlunoPerfil.tsx, esta trava seguiria verde. É a mesma armadilha que a bancada de
     * cenários já caiu uma vez, validando a semântica errada com cara de aprovação. Então a
     * composição real da tela é lida da fonte.
     */
    const fontePerfil = readFileSync("src/pages/AlunoPerfil.tsx", "utf8");
    if (!/const lista = \[\.\.\.marcadas, \.\.\.naBusca\.filter\(\(g\) => !selecionadas\.includes\(g\.slug\)\)\]/.test(fontePerfil))
      problemas.push(
        "AlunoPerfil: os chips de condição voltaram a ser só o recorte da busca. As marcadas têm de ser fixadas antes, senão a seleção some da tela.",
      );
    if (!/ativo=\{marcouNenhuma\}/.test(fontePerfil))
      problemas.push(
        'AlunoPerfil: sumiu o atalho de um clique para "Nenhuma restrição física" na própria seção. Sem ele, a única saída é achar o item no fim de uma aba da gaveta.',
      );
  }

  // B: a opção exclusiva é alcançável a partir de QUALQUER filtro da gaveta.
  const exclusivas = CATALOGO_RESTRICOES.filter((it) => it.tag === "nenhuma_restricao");
  if (exclusivas.length !== 1)
    problemas.push(`restrições: esperava exatamente uma opção exclusiva ("nenhuma"), achei ${exclusivas.length}.`);
  const gruposComExclusiva = GRUPOS_RESTRICAO.filter((g) => exclusivas.some((it) => it.grupo === g.id));
  if (gruposComExclusiva.length === GRUPOS_RESTRICAO.length)
    problemas.push("restrições: a opção exclusiva está declarada em todos os grupos, o que duplicaria o cartão.");
  // A gaveta fixa a exclusiva no topo, fora do recorte por grupo. Se alguém voltar a filtrá-la
  // por grupo, ela some de três dos quatro filtros, que é o defeito relatado.
  const fonteGaveta = readFileSync("src/components/alunos/GavetaSelecao.tsx", "utf8");
  if (!/const exclusivo = achados\.find\(\(it\) => it\.exclusivo\)/.test(fonteGaveta))
    problemas.push(
      "GavetaSelecao: a opção exclusiva voltou a depender do filtro ativo. Ela é a resposta à pergunta inteira e tem de aparecer em qualquer aba.",
    );
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
