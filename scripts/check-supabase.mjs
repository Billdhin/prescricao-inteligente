// Verifica o vínculo com o Supabase de ponta a ponta, lendo o .env local.
// Uso: npm run check:supabase
// Não expõe a chave: só reporta se a conexão responde e se as tabelas existem.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function lerEnv() {
  let txt = "";
  try {
    txt = readFileSync(join(root, ".env"), "utf8");
  } catch {
    return {};
  }
  const out = {};
  for (const linha of txt.split(/\r?\n/)) {
    const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !linha.trimStart().startsWith("#")) out[m[1]] = m[2].trim();
  }
  return out;
}

const env = lerEnv();
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;

console.log("== Verificação do vínculo Supabase ==\n");

if (!url) {
  console.error("✗ VITE_SUPABASE_URL não encontrada no .env.");
  process.exit(1);
}
console.log("• Project URL:", url);

if (!key) {
  console.error("\n✗ VITE_SUPABASE_ANON_KEY está vazia no .env.");
  console.error("  Cole a sua anon public key (Project Settings > API) e rode de novo.");
  process.exit(1);
}
console.log("• Anon key:", key.slice(0, 8) + "…(" + key.length + " caracteres)");

const headers = { apikey: key, Authorization: `Bearer ${key}` };

async function tabelaExiste(nome) {
  const r = await fetch(`${url}/rest/v1/${nome}?select=id&limit=1`, { headers });
  if (r.status === 200) return "ok";
  const corpo = await r.text();
  // 404 / PGRST205 = relação não existe (migration não rodou).
  if (r.status === 404 || corpo.includes("PGRST205") || corpo.includes("does not exist")) return "faltando";
  // 401/403 = existe, mas RLS bloqueou (esperado sem sessão): também conta como "existe".
  if (r.status === 401 || r.status === 403) return "ok";
  return `status ${r.status}`;
}

try {
  const saude = await fetch(`${url}/auth/v1/health`, { headers });
  if (!saude.ok) {
    console.error(`\n✗ O projeto respondeu ${saude.status} em /auth/v1/health.`);
    console.error("  Confira se a URL e a anon key são do MESMO projeto.");
    process.exit(1);
  }
  console.log("• Autenticação: online ✓ (a anon key é válida para este projeto)\n");

  const alvos = ["profiles", "alunos", "avaliacoes", "prescricoes", "liberacoes"];
  const res = {};
  for (const t of alvos) res[t] = await tabelaExiste(t);
  for (const t of alvos) console.log(`  ${res[t] === "ok" ? "✓" : "✗"} tabela ${t}: ${res[t]}`);

  const faltando = alvos.filter((t) => res[t] !== "ok");
  if (faltando.length) {
    console.error(`\n✗ Faltam tabelas: ${faltando.join(", ")}.`);
    console.error("  Rode as migrations no SQL Editor (0001_init.sql e depois 0002_domains.sql).");
    process.exit(2);
  }

  console.log("\n✓ Vínculo completo: chave válida e todas as tabelas no lugar. Backend pronto.");
} catch (e) {
  console.error("\n✗ Não consegui falar com o Supabase:", e.message);
  console.error("  Verifique sua conexão e se a URL está correta.");
  process.exit(1);
}
