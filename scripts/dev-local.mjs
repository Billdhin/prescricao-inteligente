/**
 * Sobe o dev server em MODO LOCAL: sem as variáveis do Supabase, o app roda inteiro no
 * armazenamento do navegador, sem tela de login (isSupabaseConfigured() = false).
 *
 * Existe para inspecionar o produto com os dados de demonstração sem tocar em conta de
 * ninguém: o botão "Carregar exemplos" percorre exatamente o mesmo caminho, só com o
 * espelho de nuvem em no-op. Porta separada (4599) para não brigar com o dev normal.
 */
import { spawn } from "node:child_process";

const env = { ...process.env };
delete env.VITE_SUPABASE_URL;
delete env.VITE_SUPABASE_ANON_KEY;
// O vite ainda leria o .env do disco; um modo próprio ("local") faz ele procurar
// .env.local? Não: modos leem .env.[modo]. Passar --mode demolocal evita o .env base?
// Não evita (o .env sem sufixo vale para todos os modos). A supressão real vem das
// variáveis de ambiente VAZIAS abaixo: no Vite, process.env tem precedência sobre .env.
env.VITE_SUPABASE_URL = "";
env.VITE_SUPABASE_ANON_KEY = "";

const p = spawn("npx", ["vite", "--port", "4599", "--strictPort"], {
  env,
  stdio: "inherit",
  shell: process.platform === "win32",
});
p.on("exit", (code) => process.exit(code ?? 0));
