/**
 * check:aluno — o módulo do aluno diz o que ele faz, e o que parece tocável toca.
 *
 * Nasceu do relato de campo do Filipe usando o app: "não está muito claro o que eu já
 * finalizei de exercício, quantos faltam", "não consegui acionar o falar com professor",
 * "cliquei em voltar e saiu da página". Três frases, e cada uma apontava para uma classe
 * de defeito diferente. A varredura que elas provocaram achou mais cinco do mesmo tipo.
 *
 * As regras aqui são as invariantes que sobraram dessas correções. Nenhuma é de estilo:
 * cada uma reproduz um defeito que o Filipe (ou eu, olhando a tela ao lado dele) viu.
 *
 * Roda em `npm run check`.
 */
import fs from "node:fs";
import path from "node:path";

const RAIZ = path.resolve(process.cwd(), "src/components/student");
const falhas: string[] = [];

function arquivos(dir: string): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory() ? arquivos(path.join(dir, e.name)) : /\.tsx?$/.test(e.name) ? [path.join(dir, e.name)] : [],
    );
}

const rel = (f: string) => path.relative(process.cwd(), f).replace(/\\/g, "/");
const linhaDe = (texto: string, idx: number) => texto.slice(0, idx).split("\n").length;

/**
 * O corpo de uma função de topo, do `function Nome(` até a chave que o fecha.
 * Contagem de chaves ingênua serve aqui porque os arquivos do aluno são JSX/TSX comum,
 * sem chave dentro de string crua que desbalanceie o bloco.
 */
function corpoDaFuncao(texto: string, nome: string): string | null {
  const abre = texto.indexOf(`function ${nome}(`);
  if (abre < 0) return null;
  // Pular a ASSINATURA inteira: estes componentes desestruturam props, então a primeira
  // chave depois do nome é a do parâmetro, não a do corpo.
  let par = 0;
  let i = texto.indexOf("(", abre);
  for (; i < texto.length; i++) {
    if (texto[i] === "(") par++;
    else if (texto[i] === ")") {
      par--;
      if (par === 0) break;
    }
  }
  const inicio = texto.indexOf("{", i);
  if (inicio < 0) return null;
  let nivel = 0;
  for (let i = inicio; i < texto.length; i++) {
    if (texto[i] === "{") nivel++;
    else if (texto[i] === "}") {
      nivel--;
      if (nivel === 0) return texto.slice(inicio, i + 1);
    }
  }
  return null;
}

const FONTES = arquivos(RAIZ).map((f) => ({ f, texto: fs.readFileSync(f, "utf8") }));
const acharCorpo = (nome: string) => {
  for (const { f, texto } of FONTES) {
    const c = corpoDaFuncao(texto, nome);
    if (c) return { f, corpo: c };
  }
  return null;
};

/* ------------------------------------------------------------------ A ---- */
/**
 * A: a sessão diz QUANTOS já foram e quantos faltam.
 *
 * O cabeçalho da sessão só sabia dizer "feito" ou nada. No meio do treino, que é quando a
 * pergunta aparece, ele não respondia. A contagem tem que ser DERIVADA das execuções: um
 * número escrito à mão, ou copiado de outro campo, volta a mentir na primeira divergência.
 */
{
  const alvo = acharCorpo("HeroTreinoDeHoje");
  if (!alvo) falhas.push("A: não achei o componente HeroTreinoDeHoje (renomeado? mova a regra junto).");
  else {
    const derivaDasExecucoes = /execucoes\.some\(\s*\(e\)\s*=>[^)]*blocoRef/.test(alvo.corpo);
    const imprimeOPar = /\{nFeitos\}[\s\S]{0,60}\{nExercicios\}/.test(alvo.corpo);
    if (!derivaDasExecucoes)
      falhas.push(`A: ${rel(alvo.f)} · o cabeçalho da sessão não conta os feitos a partir das execuções.`);
    if (!imprimeOPar)
      falhas.push(`A: ${rel(alvo.f)} · o cabeçalho da sessão não imprime o par "feitos de total" na tela.`);
  }
}

/* ------------------------------------------------------------------ B ---- */
/**
 * B: a lista do dia é uma lista, não uma parede de formulários.
 *
 * Cada exercício abria inteiro, com o registro completo embaixo. Cinco exercícios viravam
 * uma tela em que não dava para ver onde se estava. O registro precisa ficar atrás do
 * toque; a linha fechada é o que responde de relance.
 */
{
  const alvo = acharCorpo("BlocoRow");
  if (!alvo) falhas.push("B: não achei o componente BlocoRow (renomeado? mova a regra junto).");
  else {
    const fechadaPorPadrao = /const \[aberto, setAberto\] = React\.useState\(false\)/.test(alvo.corpo);
    const registroAtrasDoToque = /\{aberto && \([\s\S]*<RegistroBloco/.test(alvo.corpo);
    if (!fechadaPorPadrao) falhas.push(`B: ${rel(alvo.f)} · a linha do exercício não nasce fechada.`);
    if (registroAtrasDoToque === false)
      falhas.push(`B: ${rel(alvo.f)} · o formulário de registro voltou a ficar aberto na lista.`);
  }
}

/* ------------------------------------------------------------------ C ---- */
/**
 * C: o nome da sessão é alvo de toque.
 *
 * O cartão da sessão tinha relevo e seta, e só a seta clicava: 40px na borda oposta ao
 * nome. O dedo vai no nome. Mesma classe do "falar com professor", que era um div com cara
 * de cartão tocável e nenhuma ação atrás.
 */
for (const nome of ["CardSessaoPlano", "LinhaSessao"]) {
  const alvo = acharCorpo(nome);
  if (!alvo) {
    falhas.push(`C: não achei o componente ${nome} (renomeado? mova a regra junto).`);
    continue;
  }
  // O nome da sessão precisa aparecer DEPOIS de um <button que ainda não fechou.
  const idxNome = alvo.corpo.indexOf("{sessao.nome}");
  if (idxNome < 0) {
    falhas.push(`C: ${rel(alvo.f)} · ${nome} não imprime mais {sessao.nome}; confira a regra.`);
    continue;
  }
  const antes = alvo.corpo.slice(0, idxNome);
  const aberturas = (antes.match(/<button\b/g) ?? []).length;
  const fechamentos = (antes.match(/<\/button>/g) ?? []).length;
  if (aberturas <= fechamentos)
    falhas.push(`C: ${rel(alvo.f)}:${linhaDe(alvo.corpo, idxNome)} · o nome da sessão em ${nome} não é tocável.`);
}

/* ------------------------------------------------------------------ D ---- */
/**
 * D: número e substantivo concordam.
 *
 * "1 exercícios registrados" apareceu na aba Progresso logo depois do primeiro registro,
 * que é exatamente quando um aluno novo abre essa aba. O padrão é sempre o mesmo: valor
 * interpolado colado a um substantivo escrito no plural, sem a escolha da forma.
 */
// "anos" fica de fora de propósito: a única interpolação com essa palavra é a idade do
// aluno, e aluno de 1 ano não é caso deste produto. Regra que reprova o impossível treina
// quem lê a reprovar o guardrail, não o código.
const PLURAIS = "exercícios|treinos|dias|semanas|séries|sessões|repetições|minutos|vezes";
for (const { f, texto } of FONTES) {
  const re = new RegExp(String.raw`[\{$]\{?[A-Za-z_][\w.?\[\]]*\}\s+(?:${PLURAIS})\b`, "g");
  for (const m of texto.matchAll(re)) {
    // A forma correta escolhe a palavra por perto ("=== 1 ?"); só reprova quem não escolhe.
    const vizinhanca = texto.slice(Math.max(0, m.index - 160), m.index + 160);
    if (/===\s*1\s*\?/.test(vizinhanca)) continue;
    falhas.push(`D: ${rel(f)}:${linhaDe(texto, m.index)} · "${m[0].trim()}" não concorda quando o número é 1.`);
  }
}

/* ------------------------------------------------------------------ E ---- */
/**
 * E: pares de dado inline não se colam.
 *
 * "Última avaliação: 17/06/2026Peso: 69 kg". `ParDado layout="inline"` renderiza um span,
 * feito para conviver com texto corrido; dois deles como irmãos diretos ficam encostados,
 * porque não há espaço entre elementos inline adjacentes no JSX. No fecho do treino o
 * contêiner era `space-y-1`, que aplica margem VERTICAL e um span inline ignora: o código
 * declarava uma separação que o navegador nunca executou.
 */
for (const { f, texto } of FONTES) {
  const linhas = texto.split("\n");
  linhas.forEach((linha, i) => {
    if (!linha.includes('layout="inline"')) return;
    // Contêiner = a div ENVOLVENTE, não a irmã anterior. Subindo, cada </div> encontrado
    // pertence a uma irmã já fechada e consome a próxima abertura que aparecer.
    let container = "";
    let pendentes = 0;
    for (let j = i - 1; j >= 0 && j >= i - 20; j--) {
      pendentes += (linhas[j].match(/<\/(div|dl|section)>/g) ?? []).length;
      const abre = linhas[j].match(/<(div|dl|section)\b/g) ?? [];
      for (const _ of abre) {
        if (pendentes > 0) pendentes--;
        else {
          container = linhas[j];
          break;
        }
      }
      if (container) break;
    }
    const separa = /\bflex\b/.test(container) && /\bgap-x-\d/.test(container);
    if (!separa)
      falhas.push(
        `E: ${rel(f)}:${i + 1} · ParDado inline sem contêiner que separe (precisa de flex + gap-x, como na lista de avaliações).`,
      );
  });
}

/* ------------------------------------------------------------------ F ---- */
/**
 * F: toda modalidade do catálogo tem figura própria no cartão de hoje.
 *
 * MotivoModalidade cai no halter quando não conhece a chave, o que é a queda certa para um
 * plano antigo com id estranho e a queda ERRADA para uma modalidade nova do catálogo: a
 * natação passaria a aparecer desenhada como halter, e ninguém veria, porque não quebra
 * nada. Acrescentar modalidade e esquecer a figura tem que doer aqui.
 */
{
  const cat = fs.readFileSync(path.resolve(process.cwd(), "src/data/modalities.ts"), "utf8");
  const doCatalogo = [...cat.matchAll(/^\s*id: "(m-[\w-]+)"/gm)].map((m) => m[1]);
  const motivo = fs.readFileSync(path.resolve(process.cwd(), RAIZ, "MotivoModalidade.tsx"), "utf8");
  const comFigura = new Set([...motivo.matchAll(/"(m-[\w-]+)":\s*\w+,/g)].map((m) => m[1]));
  if (!doCatalogo.length) falhas.push("F: não achei nenhum id de modalidade em src/data/modalities.ts.");
  for (const id of doCatalogo)
    if (!comFigura.has(id))
      falhas.push(`F: a modalidade ${id} não tem figura em MotivoModalidade e cairia calada no halter.`);
}

/* ------------------------------------------------------------------ G ---- */
/**
 * G: o trilho de semanas sempre mostra o número.
 *
 * A régua antiga era "número até 8 semanas, bolinha lisa daí para cima", e o Filipe abriu um
 * plano de 12 e viu doze bolinhas idênticas. Era o inverso do que o problema pede: quanto
 * mais longo o plano, mais o aluno precisa do número para se localizar nele. O que cede à
 * falta de espaço é o tamanho do disco, e depois o fio contínuo, nunca o número.
 */
{
  const alvo = acharCorpo("TrilhoDeSemanas");
  if (!alvo) falhas.push("G: não achei o componente TrilhoDeSemanas (renomeado? mova a regra junto).");
  else {
    if (!/\{n\}\s*<\/span>/.test(alvo.corpo))
      falhas.push(`G: ${rel(alvo.f)} · o disco do trilho não imprime mais o número da semana.`);
    if (/:\s*null\s*\}/.test(alvo.corpo))
      falhas.push(`G: ${rel(alvo.f)} · voltou um ramo que apaga o número da semana em vez de encolher o disco.`);
  }
}

/* --------------------------------------------------------------------------- */
if (falhas.length) {
  console.error(`\n[check:aluno] FALHOU: ${falhas.length} problema(s).\n`);
  for (const f of falhas) console.error("  • " + f);
  console.error("");
  process.exit(1);
}
console.log(
  "[check:aluno] ok: a sessão diz quantos faltam, a lista do dia nasce fechada, o nome da sessão toca, número e substantivo concordam, par de dado inline não se cola, toda modalidade tem figura própria e o trilho sempre mostra a semana.",
);
