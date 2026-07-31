/**
 * check:menu — sincronia do menu do ciclo do cuidado.
 *
 * O menu é a fonte única (nav.ts) e três superfícies o ESPELHAM em texto:
 * TITULOS_ROTA (AppLayout), MODULOS (Landing) e os CTAs/navLabels dos tutoriais.
 * Nada valida esse espelho em runtime, então a divergência é silenciosa: este
 * guardrail trava no CI o que a onda do menu (jul/2026) fixou:
 *  1. rótulos do Dia a dia dizem a AÇÃO (fim de "Hoje", "Alunos", "Avaliações",
 *     "Semáforo" e "Prescrever exercício" soltos);
 *  2. "Cadastrar aluno" visível como filho de Meus alunos (deep-link ?novo=1);
 *  3. "Treino do dia" (/gps) vive DENTRO de Prescrever treino;
 *  4. barra inferior mobile: 5 abas, shorts curtos sem truncar, Treino acende /gps;
 *  5. superfícies espelhadas usam OS MESMOS nomes;
 *  6. nenhum travessão em rótulo visível.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NAV, BOTTOM, PRIMARIOS, MAIS, CONTA } from "../src/components/app/nav";

const erros: string[] = [];
const ok = (cond: boolean, msg: string) => {
  if (!cond) erros.push(msg);
};

const ler = (rel: string) => readFileSync(join(process.cwd(), rel), "utf8");

/* ----------------------------- 1. NAV estrutural ---------------------------- */

const diaADia = NAV.find((s) => s.label === "Dia a dia");
ok(!!diaADia, 'NAV precisa ter o grupo "Dia a dia"');

const labelsDia = diaADia?.items.map((i) => i.label) ?? [];
const ESPERADO_DIA = ["Meu dia", "Meus alunos", "Avaliar e reavaliar", "Prescrever treino", "Fazer o semáforo do dia"];
ok(
  JSON.stringify(labelsDia) === JSON.stringify(ESPERADO_DIA),
  `Grupo "Dia a dia" fora do ciclo do cuidado. Esperado ${JSON.stringify(ESPERADO_DIA)}, veio ${JSON.stringify(labelsDia)}`,
);

const meusAlunos = diaADia?.items.find((i) => i.to === "/alunos");
const filhoCadastrar = meusAlunos?.children?.find((c) => c.label === "Cadastrar aluno");
ok(!!filhoCadastrar, '"Meus alunos" precisa do filho "Cadastrar aluno"');
ok(filhoCadastrar?.to === "/alunos?novo=1", '"Cadastrar aluno" deve apontar para /alunos?novo=1 (deep-link do modal)');
ok(filhoCadastrar?.acao === true, '"Cadastrar aluno" é link de AÇÃO (acao: true), nunca acende como ativo');

const prescreverTreino = diaADia?.items.find((i) => i.to === "/prescrever-treino");
const filhoDia = prescreverTreino?.children?.find((c) => c.to === "/gps");
ok(!!filhoDia, "O /gps precisa viver DENTRO de Prescrever treino (filho)");
ok(filhoDia?.label === "Treino do dia", `Filho do /gps deve chamar "Treino do dia", veio "${filhoDia?.label}"`);

// Rótulos rejeitados pelo fundador não podem voltar como label de item.
const PROIBIDOS = ["Hoje", "Alunos", "Avaliações", "Semáforo", "Prescrever exercício"];
for (const sec of NAV)
  for (const it of sec.items) {
    ok(!PROIBIDOS.includes(it.label), `Label proibido no menu (substantivo solto que o fundador rejeitou): "${it.label}"`);
    for (const c of it.children ?? [])
      ok(!PROIBIDOS.includes(c.label), `Label proibido em filho do menu: "${c.label}"`);
  }

// Travessão em rótulo visível: nunca.
for (const sec of NAV)
  for (const it of sec.items) {
    ok(!/—/.test(it.label + (it.short ?? "")), `Travessão no rótulo "${it.label}"`);
    for (const c of it.children ?? []) ok(!/—/.test(c.label), `Travessão no filho "${c.label}"`);
  }

/* --------------------- 1b. Casca da reestruturação (5 + Mais) --------------- */

// A barra superior mostra PRIMARIOS e a inferior mostra BOTTOM. Elas têm que ser
// o MESMO array, não duas listas iguais por coincidência: antes eram paralelas e
// já tinham divergido (o /gps era filho de um lado e `match` do outro).
ok(BOTTOM === PRIMARIOS, "BOTTOM precisa ser a MESMA referência de PRIMARIOS (identidade, não cópia)");
ok(PRIMARIOS.length === 5, `PRIMARIOS deve ter 5 destinos, veio ${PRIMARIOS.length}`);
// O "Mais" virou TRÊS portas com filhos, em vez de oito itens soltos na mesma
// altura visual dos cinco do dia a dia. Nada foi apagado: Grupos Especiais e
// Consultar são filhos de Estudar, o Comparador é filho do Laboratório, e Ajuda
// e Configurações foram para o menu do usuário (CONTA).
ok(MAIS.length === 3, `MAIS deve ter 3 portas de referência, veio ${MAIS.length}`);

// Descrição de uma linha em TODA opção do "Mais", INCLUSIVE nos filhos: um menu
// sem descrição obriga a abrir cada item para descobrir o que é (Design System).
for (const it of MAIS) {
  ok(!!it.hint, `Destino do "Mais" sem descrição de uma linha: "${it.label}"`);
  ok(!/—/.test(it.hint ?? ""), `Travessão na descrição de "${it.label}"`);
  for (const c of it.children ?? []) {
    ok(!!c.hint, `Filho do "Mais" sem descrição de uma linha: "${c.label}"`);
    ok(!/—/.test(c.hint ?? ""), `Travessão na descrição do filho "${c.label}"`);
  }
}
for (const it of CONTA) {
  ok(!!it.hint, `Item de conta sem descrição de uma linha: "${it.label}"`);
}

// Nenhum destino em dois lugares, contando pai, filho e conta: dois itens
// acendendo na mesma rota fariam o menu mentir sobre onde o usuário está.
const todosDestinos = [...PRIMARIOS, ...MAIS, ...CONTA].flatMap((i) => [
  i.to,
  ...(i.children ?? []).map((c) => c.to),
]);
const vistos = new Set<string>();
for (const to of todosDestinos) {
  ok(!vistos.has(to), `Destino repetido no menu: ${to}`);
  vistos.add(to);
}

// Todo `to` resolve para uma rota real de App.tsx (deep-link e query fora).
const app = ler("src/App.tsx");
for (const to of todosDestinos.map((t) => t.split("?")[0])) {
  const seg = to.replace(/^\//, "");
  ok(
    app.includes(`path="${seg}"`) || app.includes(`path="/${seg}"`) || app.includes(`path="${seg}/`),
    `Destino do menu sem rota em App.tsx: ${to}`,
  );
}

// O Comparador NÃO pode voltar a ser um `match` do Laboratório: enquanto era,
// o menu acendia "Laboratório Visual" numa tela chamada Comparador. Como filho
// declarado, ele acende sozinho e o pai acende como grupo que o contém.
const lab = MAIS.find((i) => i.to === "/movement-lab");
ok(!(lab?.match ?? []).includes("/comparador"), "O Comparador não pode ser `match` do Laboratório");
ok(
  !!lab?.children?.some((c) => c.to === "/comparador"),
  "O Comparador precisa ser filho declarado do Laboratório Visual",
);

const estudar = MAIS.find((i) => i.to === "/aprender");
for (const rota of ["/special-groups", "/consultar"]) {
  ok(
    !!estudar?.children?.some((c) => c.to === rota),
    `"${rota}" precisa ser filho de Estudar (saiu da lista de primeiro nível, não do produto)`,
  );
}

// Tutoriais e Suporte seguem sendo uma porta só ("Ajuda"), agora no menu do
// usuário. O rótulo tem que bater com o título da página, e o menu do rodapé
// tem que desenhar essa lista, senão os dois destinos ficariam inalcançáveis.
const ajuda = CONTA.find((i) => i.label === "Ajuda");
ok(!!ajuda, 'A área de conta precisa do destino "Ajuda" (Tutoriais + Suporte fundidos)');
ok((ajuda?.match ?? []).includes("/suporte"), '"Ajuda" deve acender também em /suporte');
ok(ler("src/pages/Tutorial.tsx").includes('title="Ajuda"'), 'A página de /tutorial deve se chamar "Ajuda" (espelha o menu)');
ok(!!CONTA.find((i) => i.to === "/account"), "A área de conta precisa de Configurações");
const layout = ler("src/components/app/AppLayout.tsx");
ok(
  layout.includes("CONTA.map("),
  "O menu do usuário precisa DESENHAR a lista CONTA (senão Ajuda e Configurações ficam sem porta)",
);
ok(
  /item\.children[\s\S]{0,400}FilhoLateral/.test(layout),
  "A lateral precisa desenhar os FILHOS do Mais (senão Comparador, Consultar e Grupos Especiais ficam órfãos)",
);

// O TÍTULO DA TELA repete o rótulo do menu. Clicar em "Meus alunos" e chegar
// numa página chamada "Alunos" é a mesma dessincronização de vocabulário que o
// menu do ciclo do cuidado resolveu, só que um nível abaixo.
const TITULO_DA_TELA: [string, string][] = [
  ["src/pages/Alunos.tsx", "Meus alunos"],
  ["src/pages/Avaliacoes.tsx", "Avaliar e reavaliar"],
  ["src/pages/Gps.tsx", "Treino do dia"],
];
// O título pode estar como prop (`title="Meus alunos"` do SectionHeader) OU como
// texto direto num heading (`<h1 ...>Meus alunos`). As duas formas satisfazem o
// contrato, que é sobre o VOCABULÁRIO na tela, não sobre qual componente o
// desenha: quando a página de alunos trocou o SectionHeader por um cabeçalho
// próprio (título + contagem + busca na mesma linha, como no design), só a
// grafia mudou; o rótulo continuou o mesmo.
for (const [arq, titulo] of TITULO_DA_TELA) {
  const fonte = ler(arq);
  const comoProp = fonte.includes(`"${titulo}"`);
  const comoTexto = new RegExp(`>\\s*${titulo}\\b`).test(fonte);
  ok(comoProp || comoTexto, `${arq} deve usar o título "${titulo}" (o mesmo rótulo do menu)`);
}

/* ------------------------- 2. Barra inferior (mobile) ----------------------- */

ok(BOTTOM.length === 5, `BOTTOM deve ter 5 abas (cabem a 320px sem truncar), veio ${BOTTOM.length}`);
for (const it of BOTTOM) {
  const short = it.short ?? it.label;
  ok(short.length <= 10, `Short da barra inferior longo demais (trunca): "${short}" (${short.length} chars)`);
}
const abaTreino = BOTTOM.find((i) => i.to === "/prescrever-treino");
ok(
  abaTreino?.match?.includes("/gps") ?? false,
  'A aba "Treino" da barra inferior deve acender também em /gps (match: ["/gps"])',
);
// Toda aba da barra é um destino que também existe na sidebar (fonte única).
const rotasNav = new Set(NAV.flatMap((s) => s.items.map((i) => i.to)));
for (const it of BOTTOM) ok(rotasNav.has(it.to), `Aba da barra inferior sem correspondente na sidebar: ${it.to}`);

/* ----------------------- 3. TITULOS_ROTA (AppLayout) ------------------------ */

const appLayout = ler("src/components/app/AppLayout.tsx");
const TITULOS_ESPERADOS: [string, string][] = [
  ["/^\\/dashboard/", "Meu dia"],
  ["/^\\/alunos/", "Meus alunos"],
  ["/^\\/assessments/", "Avaliar e reavaliar"],
  ["/^\\/gps/", "Treino do dia"],
  ["/^\\/semaforo/", "Semáforo do dia"],
  ["/^\\/prescrever-treino/", "Prescrever treino"],
];
for (const [re, titulo] of TITULOS_ESPERADOS) {
  const linha = `[${re}, "${titulo}"]`;
  ok(appLayout.includes(linha), `TITULOS_ROTA dessincronizado do menu: esperava ${linha}`);
}

/* -------------------------- 4. Landing (MODULOS) ---------------------------- */

// O redesign de 31/07/2026 (protótipo "Mapa da Prescrição") trocou o catálogo de
// 8 módulos por uma narrativa de marketing (ciclo do cuidado, por dentro, semáforo,
// planos). Se o catálogo MODULOS existir, ele DEVE espelhar os nomes novos do menu;
// se a Landing não o tiver mais, não há o que sincronizar e a checagem é pulada.
const landing = ler("src/pages/Landing.tsx");
if (landing.includes("const MODULOS")) {
  for (const label of ["Avaliar e reavaliar", "Semáforo do dia", "Treino do dia", "Prescrever treino"])
    ok(landing.includes(`label: "${label}"`), `MODULOS da Landing sem o nome novo "${label}" (espelha o menu de propósito)`);
  for (const velho of ['label: "Avaliações"', 'label: "Semáforo",', 'label: "Prescrever exercício"'])
    ok(!landing.includes(velho), `MODULOS da Landing ainda usa o nome antigo: ${velho}`);
}

/* ----------------------------- 5. Tutoriais --------------------------------- */

const tuts = ler("src/data/tutorials.ts");
ok(!tuts.includes("atender-aprender"), "Tutorial obsoleto atender-aprender (toggle de modos morto) deve ficar removido");
ok(!tuts.includes('navLabel: "Painel"'), 'navLabel "Painel" morreu junto com o nome antigo do painel');
for (const cta of ['"Ir para Prescrever"', '"Abrir Prescrever"', '"Ver Avaliações"'])
  ok(!tuts.includes(cta), `CTA de tutorial com nome antigo do menu: ${cta}`);

/* --------------------------------- Veredito -------------------------------- */

if (erros.length > 0) {
  console.error(`check:menu FALHOU (${erros.length} problema(s)):`);
  for (const e of erros) console.error(`  - ${e}`);
  process.exit(1);
}
console.log("check:menu OK: menu do ciclo do cuidado sincronizado (nav, títulos, landing, tutoriais).");
