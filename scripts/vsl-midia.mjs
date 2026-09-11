/**
 * Traz a mídia do VSL (ramo `vsl-midia`) para uma pasta: `public/vsl` no desenvolvimento,
 * `dist/vsl` no deploy (ver .github/workflows/deploy-cloudflare.yml).
 *
 *   npm run vsl:midia             -> public/vsl (para o `npm run dev`)
 *   node scripts/vsl-midia.mjs dist/vsl
 *
 * A mídia não mora na main de propósito: são ~280 MB de vídeo que toda clonagem do código
 * baixaria sem precisar. O ramo `vsl-midia` só tem a pasta de cada versão do vídeo.
 */
import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";

const destino = process.argv[2] || "public/vsl";
mkdirSync(destino, { recursive: true });
execSync("git fetch --depth=1 origin vsl-midia", { stdio: "inherit" });
execSync(`git archive FETCH_HEAD | tar -x -C "${destino}"`, { stdio: "inherit", shell: process.platform === "win32" ? "bash" : "/bin/sh" });
console.log(`mídia do VSL em ${destino}`);
