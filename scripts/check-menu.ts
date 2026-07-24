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
import { NAV, BOTTOM } from "../src/components/app/nav";

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

const landing = ler("src/pages/Landing.tsx");
for (const label of ["Avaliar e reavaliar", "Semáforo do dia", "Treino do dia", "Prescrever treino"])
  ok(landing.includes(`label: "${label}"`), `MODULOS da Landing sem o nome novo "${label}" (espelha o menu de propósito)`);
for (const velho of ['label: "Avaliações"', 'label: "Semáforo",', 'label: "Prescrever exercício"'])
  ok(!landing.includes(velho), `MODULOS da Landing ainda usa o nome antigo: ${velho}`);

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
