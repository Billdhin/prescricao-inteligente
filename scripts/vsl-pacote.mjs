/**
 * Monta a pasta do "Player de VSL (modelo VTurb)" para qualquer pessoa usar fora deste
 * projeto: o player em um arquivo, página de exemplo, painel de métricas, banco, ferramenta de
 * conversão, código-fonte e o guia. Tudo sai do código que está no ar, então a pasta nunca
 * fica velha em relação ao site: mudou o player, rode de novo.
 *
 *   npm run vsl:pacote                       -> Documentos/Player de VSL (VTurb recriado) + .zip
 *   node scripts/vsl-pacote.mjs "<pasta>"
 */
import { build } from "esbuild";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { homedir } from "node:os";

const raiz = join(import.meta.dirname, "..");
const destino = process.argv[2] || join(homedir(), "Documents", "Player de VSL (VTurb recriado)");
const de = (p) => join(raiz, p);
const para = (p) => join(destino, p);
const copiar = (a, b) => {
  mkdirSync(dirname(para(b)), { recursive: true });
  cpSync(de(a), para(b));
};

rmSync(destino, { recursive: true, force: true });
mkdirSync(destino, { recursive: true });

// Registro de vídeos VAZIO no pacote: o do site traz a configuração do VSL do Mapa.
const REGISTRO_VAZIO = `import type { ConfigVsl } from "./tipos";
/** Registro dos vídeos: preenchido por MapaVsl.configurar (ou à mão, num projeto com bundler). */
export const VIDEOS: Record<string, ConfigVsl> = {};
`;
const registroVazio = {
  name: "registro-vazio",
  setup(b) {
    b.onResolve({ filter: /^\.\/videos$/ }, () => ({ path: "videos", namespace: "vazio" }));
    b.onLoad({ filter: /.*/, namespace: "vazio" }, () => ({ contents: REGISTRO_VAZIO, loader: "ts", resolveDir: de("src/vsl") }));
  },
};

const versao = "1.0.0";
const cabecalho = `/*! Player de VSL (modelo VTurb) ${versao} · código aberto · inclui hls.js (Apache 2.0, https://github.com/video-dev/hls.js) */`;
for (const minify of [false, true]) {
  await build({
    entryPoints: [de("src/vsl/independente.ts")],
    bundle: true,
    format: "iife",
    target: ["es2019", "safari13"],
    minify,
    legalComments: "none",
    banner: { js: cabecalho },
    define: { "import.meta.env": "undefined" },
    plugins: [registroVazio],
    outfile: para(`player/mapa-vsl${minify ? ".min" : ""}.js`),
    logLevel: "warning",
  });
}

// Exemplo, painel e guia
copiar("scripts/pacote-vsl/pagina-de-vendas.html", "exemplo/pagina-de-vendas.html");
copiar("scripts/pacote-vsl/painel.html", "painel/painel.html");
copiar("scripts/pacote-vsl/LEIA-ME.md", "LEIA-ME.md");

// Banco: as duas migrações em um arquivo só, na ordem
const sql = ["0014_vsl_metricas.sql", "0015_vsl_metricas_completas.sql"]
  .map((f) => `-- ===================== ${f} =====================\n\n` + readFileSync(de(`supabase/migrations/${f}`), "utf8").replace(/\r\n/g, "\n"))
  .join("\n\n");
mkdirSync(para("banco"), { recursive: true });
writeFileSync(
  para("banco/supabase-completo.sql"),
  `-- Banco das métricas do Player de VSL. Rode UMA vez no SQL Editor do seu projeto Supabase.\n` +
    `-- Depois cadastre quem vê o painel:\n--   insert into public.vsl_admins (email) values ('seu-email@exemplo.com');\n\n` +
    sql,
);

// Ferramenta de conversão do vídeo
copiar("scripts/vsl-hls.mjs", "ferramentas/gerar-hls.mjs");

// Código-fonte
for (const f of ["tipos.ts", "regras.ts", "metricas.ts", "player.ts", "independente.ts", "hls-light.d.ts"]) copiar(`src/vsl/${f}`, `codigo-fonte/vsl/${f}`);
writeFileSync(para("codigo-fonte/vsl/videos.ts"), REGISTRO_VAZIO);
copiar("src/vsl/videos.ts", "codigo-fonte/vsl/exemplo-configuracao-mapa-da-prescricao.ts");
copiar("src/vsl/VslPlayer.tsx", "codigo-fonte/react/VslPlayer.tsx");
copiar("src/pages/Apresentacao.tsx", "codigo-fonte/react/Apresentacao.tsx");
copiar("src/pages/PainelVsl.tsx", "codigo-fonte/react/PainelVsl.tsx");
writeFileSync(
  para("codigo-fonte/construir.mjs"),
  `// Constrói o player a partir do código-fonte: npm install hls.js@1 esbuild && node construir.mjs
import { build } from "esbuild";
for (const minify of [false, true])
  await build({
    entryPoints: ["vsl/independente.ts"],
    bundle: true,
    format: "iife",
    target: ["es2019", "safari13"],
    minify,
    define: { "import.meta.env": "undefined" },
    outfile: \`mapa-vsl\${minify ? ".min" : ""}.js\`,
  });
console.log("pronto: mapa-vsl.js e mapa-vsl.min.js");
`,
);
writeFileSync(
  para("codigo-fonte/package.json"),
  JSON.stringify({ name: "player-vsl", version: versao, private: true, type: "module", scripts: { construir: "node construir.mjs" }, dependencies: { "hls.js": "^1.7.3" }, devDependencies: { esbuild: "^0.21.5" } }, null, 2) + "\n",
);

// Zip ao lado da pasta (para mandar para outra pessoa)
const zip = `${destino}.zip`;
if (existsSync(zip)) rmSync(zip);
if (process.platform === "win32")
  execFileSync("powershell", ["-NoProfile", "-Command", `Compress-Archive -Path '${destino}\\*' -DestinationPath '${zip}' -Force`], { stdio: "inherit" });
else execFileSync("zip", ["-rq", zip, "."], { cwd: destino, stdio: "inherit" });

console.log(`pacote pronto em ${destino}\nzip: ${zip}`);
