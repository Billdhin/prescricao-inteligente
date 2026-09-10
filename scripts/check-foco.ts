/**
 * GUARDRAIL: CAMPO QUE PERDE O FOCO A CADA LETRA.
 *
 * Relato de um aluno (10/09/2026): "toda vez que eu digitava uma letra, o teclado sumia e
 * eu tinha que tocar na caixa de novo". A causa, no "Conte sobre você", era um componente
 * DECLARADO DENTRO de outro (`const Campo = () => ...` no corpo de `SobreVoce`) e usado como
 * tag (`<Campo />`). A cada render o React recebe uma função nova, entende que é outro tipo
 * de componente, desmonta o antigo e monta um novo: o <input> é outro elemento, o foco some
 * e no celular o teclado fecha. No computador passa quase despercebido, porque o cursor
 * volta com um clique; no celular é um app que não deixa escrever.
 *
 * A trava lê a árvore sintática de todo .tsx de src/ e acusa qualquer função com nome de
 * componente (Maiúscula) declarada dentro de outra função e usada como TAG JSX nela.
 * Chamada como função (`{campo(c)}`) não é acusada: aí não há componente, só JSX inline.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";

const problemas: string[] = [];

function arquivos(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) return arquivos(p);
    return p.endsWith(".tsx") ? [p] : [];
  });
}

const ehFuncao = (n: ts.Node) =>
  ts.isFunctionDeclaration(n) || ts.isFunctionExpression(n) || ts.isArrowFunction(n) || ts.isMethodDeclaration(n);

/** Nome de componente declarado por este nó, se ele declarar um (função com Maiúscula). */
function nomeDeComponente(n: ts.Node): string | undefined {
  if (ts.isFunctionDeclaration(n) && n.name && /^[A-Z]/.test(n.name.text)) return n.name.text;
  if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && /^[A-Z]/.test(n.name.text) && n.initializer) {
    const i = n.initializer;
    const embrulho = ts.isCallExpression(i) ? i.arguments[0] : undefined; // React.memo(() => ...)
    if (ehFuncao(i) || (embrulho && ehFuncao(embrulho))) return n.name.text;
  }
  return undefined;
}

/** Tags JSX usadas dentro de um nó. */
function tagsUsadas(n: ts.Node, acc = new Set<string>()): Set<string> {
  if ((ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) && ts.isIdentifier(n.tagName)) acc.add(n.tagName.text);
  // Corpo em bloco de propósito: `forEachChild` PARA no primeiro retorno verdadeiro, e
  // devolver o Set aqui fazia a varredura ler só o primeiro filho de cada nó. A primeira
  // versão desta trava passou verde com o defeito à vista por causa disso.
  n.forEachChild((c) => {
    tagsUsadas(c, acc);
  });
  return acc;
}

for (const arquivo of arquivos("src")) {
  const fonte = ts.createSourceFile(arquivo, readFileSync(arquivo, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const visitar = (n: ts.Node, funcaoExterna?: ts.Node) => {
    const nome = funcaoExterna ? nomeDeComponente(n) : undefined;
    if (nome && funcaoExterna && tagsUsadas(funcaoExterna).has(nome)) {
      const { line } = fonte.getLineAndCharacterOfPosition(n.getStart());
      problemas.push(`${arquivo}:${line + 1} <${nome}> é declarado dentro de outro componente e usado como tag: remonta a cada render e o campo perde o foco.`);
    }
    n.forEachChild((c) => visitar(c, ehFuncao(n) ? n : funcaoExterna));
  };
  visitar(fonte);
}

if (problemas.length) {
  console.error(`[check:foco] FALHOU: ${problemas.length} componente(s) declarados dentro de outro.`);
  for (const p of problemas) console.error("  • " + p);
  process.exit(1);
}
console.log("[check:foco] ok: nenhum componente é declarado dentro de outro e usado como tag.");
