import type { Session, User } from "@supabase/supabase-js";
import { getSupabase } from "./supabaseClient";

/**
 * Autenticação em nuvem (Fase 5). Substitui, quando o Supabase está configurado,
 * a proteção local por senha (auth.ts) por um login real com acesso de qualquer
 * dispositivo. As telas de conta chamam estas funções apenas se
 * `isSupabaseConfigured()` for true.
 */

export interface AuthResult {
  user: User | null;
  session: Session | null;
  error?: string;
}

export async function signUp(email: string, password: string, name?: string): Promise<AuthResult> {
  const { data, error } = await getSupabase().auth.signUp({
    email,
    password,
    options: { data: name ? { name } : undefined },
  });
  return { user: data.user, session: data.session, error: error?.message };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
  return { user: data.user, session: data.session, error: error?.message };
}

export async function signOut(): Promise<void> {
  await getSupabase().auth.signOut();
}

export async function getSession(): Promise<Session | null> {
  const { data } = await getSupabase().auth.getSession();
  return data.session;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data } = await getSupabase().auth.getUser();
  return data.user;
}

/** Assina mudanças de sessão (login/logout/refresh). Devolve a função de unsubscribe. */
export function onAuthChange(cb: (session: Session | null) => void): () => void {
  const { data } = getSupabase().auth.onAuthStateChange((_event, session) => cb(session));
  return () => data.subscription.unsubscribe();
}

/** Envia e-mail de redefinição de senha. */
export async function resetPassword(email: string): Promise<{ error?: string }> {
  const { error } = await getSupabase().auth.resetPasswordForEmail(email);
  return { error: error?.message };
}
