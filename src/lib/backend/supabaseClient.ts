import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase (Fase 5 — backend real).
 *
 * O app roda 100% local por padrão. Quando `VITE_SUPABASE_URL` e
 * `VITE_SUPABASE_ANON_KEY` estão definidas (ver .env.example), `getSupabase()`
 * passa a devolver um cliente autenticado e as camadas de auth/repo podem ler e
 * gravar nas tabelas de supabase/migrations. Sem as variáveis, nada quebra: o
 * app continua no armazenamento local (Zustand + localStorage).
 */

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

/** true quando há credenciais do Supabase no ambiente. */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

let client: SupabaseClient | null = null;

/** Cliente singleton. Lança se as credenciais não estiverem definidas. */
export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (ver .env.example) e rode as migrations em supabase/migrations.",
    );
  }
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
  }
  return client;
}

/** Cliente opcional: devolve null quando não configurado (para checagens seguras). */
export function tryGetSupabase(): SupabaseClient | null {
  return isSupabaseConfigured() ? getSupabase() : null;
}
