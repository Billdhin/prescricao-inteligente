/**
 * NENHUMA ROTA PODE SER EMBRULHADA EM lazy() DUAS VEZES.
 *
 * As onze rotas do Aprender ficaram MORTAS em produção por causa disto, e nada pegou:
 *
 *   App.tsx:   pagina(() => import("@/features/learning/pages"), "AprenderHome")
 *   o barrel:  export const AprenderHome = lazy(() => import("./Home")...)
 *
 * O `pagina()` embrulha em `React.lazy`, e o que ele encontrou já era um lazy. React.lazy
 * resolvido para outro lazy não é componente, é objeto, e a tela caía inteira com
 * "Element type is invalid... Did you wrap a component in React.lazy() more than once?".
 * Clicar em Aprender dava página em branco.
 *
 * O TYPESCRIPT NÃO TEM COMO PEGAR ISSO, e é por isso que este guardrail existe em vez de um
 * tipo mais apertado: `LazyExoticComponent<T>` É um `ComponentType`, então o duplo embrulho
 * tipa perfeitamente. O erro só aparece em tempo de execução, na hora em que a rota monta,
 * ou seja no clique do usuário. `npx tsc --noEmit` passava com o Aprender morto, e o
 * `npm run build` também: nenhum dos dois monta rota nenhuma.
 *
 * O que este script faz: lê cada `pagina(() => import(M), "N")` do App.tsx, abre o módulo M
 * e cobra que o export N exista e NÃO seja um lazy.
 */
import fs from "node:fs";
import path from "node:path";

const RAIZ = process.cwd();
const APP = path.join(RAIZ, "src/App.tsx");

/** "@/features/learning/pages" -> o arquivo real, resolvendo index e extensão. */
function resolverModulo(spec: string): string | null {
  if (!spec.startsWith("@/")) return null;
  const base = path.join(RAIZ, "src", spec.slice(2));
  for (const tentativa of [`${base}.tsx`, `${base}.ts`, path.join(base, "index.tsx"), path.join(base, "index.ts")])
    if (fs.existsSync(tentativa)) return tentativa;
  return null;
}

const app = fs.readFileSync(APP, "utf8");
const falhas: string[] = [];

const chamadas = [...app.matchAll(/pagina\(\s*\(\)\s*=>\s*import\(\s*"([^"]+)"\s*\)\s*,\s*"([^"]+)"\s*\)/g)];
if (chamadas.length === 0) falhas.push("src/App.tsx: nenhuma chamada de pagina() encontrada; o guardrail ficaria sem alvo.");

for (const [, spec, nome] of chamadas) {
  const arquivo = resolverModulo(spec);
  if (!arquivo) {
    falhas.push(`src/App.tsx: pagina() aponta para "${spec}", que não resolve para nenhum arquivo em src/.`);
    continue;
  }
  const fonte = fs.readFileSync(arquivo, "utf8");
  const rel = path.relative(RAIZ, arquivo).replace(/\\/g, "/");

  // O export precisa existir. Sem ele, `(await carregar())[nome]` é undefined e a rota
  // quebra do mesmo jeito, só com outra mensagem.
  const declara = new RegExp(
    `export\\s+(?:const|function|class)\\s+${nome}\\b|export\\s*\\{[^}]*\\b${nome}\\b[^}]*\\}`,
  );
  if (!declara.test(fonte)) {
    falhas.push(`${rel}: não exporta "${nome}", pedido por pagina() no App.tsx.`);
    continue;
  }

  // E não pode já ser um lazy: seria o duplo embrulho que matou o Aprender.
  const jaEhLazy = new RegExp(`export\\s+const\\s+${nome}\\s*(?::[^=]+)?=\\s*lazy\\s*\\(`);
  if (jaEhLazy.test(fonte))
    falhas.push(
      `${rel}: "${nome}" já é um lazy(), e o App.tsx embrulha de novo com pagina(). ` +
        `React.lazy dentro de React.lazy não resolve para componente, e a rota morre em branco no clique. ` +
        `Importe "${nome}" direto do módulo em vez de passar pelo pagina().`,
    );
}

if (falhas.length) {
  console.error("[check:rotas] FALHOU\n");
  for (const f of falhas) console.error("  - " + f);
  console.error(`\n${falhas.length} problema(s) de rota.`);
  process.exit(1);
}

console.log(
  `[check:rotas] ok: ${chamadas.length} rotas carregadas por pagina(), todas com o export existindo e nenhuma embrulhada em lazy() duas vezes.`,
);
