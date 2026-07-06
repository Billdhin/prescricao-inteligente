/**
 * Ponto único de configuração do Supabase (Fase 5).
 *
 * Enquanto as variáveis de ambiente não estiverem definidas, `isSupabaseConfigured()`
 * retorna false e o app segue 100% no mock local (ver dataProvider.ts). Assim o
 * código de backend pode ser adicionado sem quebrar o build/execução atual.
 *
 * Na Fase 5:
 *   1. `npm i @supabase/supabase-js`
 *   2. Preencher `.env` a partir de `.env.example`.
 *   3. Descomentar `getSupabase()` abaixo e criar a `supabaseProvider` (mesma
 *      interface de ContentProvider) lendo das tabelas de 0001_init.sql.
 */

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

/** true quando há credenciais do Supabase no ambiente. */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/*
 * Fase 5 — cliente singleton (requer `npm i @supabase/supabase-js`):
 *
 * import { createClient, type SupabaseClient } from "@supabase/supabase-js";
 *
 * let client: SupabaseClient | null = null;
 * export function getSupabase(): SupabaseClient {
 *   if (!isSupabaseConfigured()) {
 *     throw new Error("Supabase não configurado — defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.");
 *   }
 *   if (!client) client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
 *   return client;
 * }
 */
