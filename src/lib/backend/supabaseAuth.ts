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

/**
 * Cria a conta. `name` e `cref` viajam nos METADADOS da conta porque o gatilho que cria a
 * linha de perfil (migração 0001) roda antes de existir sessão e só sabe ler dali. O nome é
 * copiado pelo próprio gatilho; o CREF é gravado no perfil pelo cloudAuth na primeira
 * hidratação, que é quando já existe sessão para escrever em `profiles`.
 */
export async function signUp(email: string, password: string, name?: string, cref?: string): Promise<AuthResult> {
  const meta: Record<string, string> = {};
  if (name) meta.name = name;
  if (cref) meta.cref = cref;
  const { data, error } = await getSupabase().auth.signUp({
    email,
    password,
    options: { data: Object.keys(meta).length ? meta : undefined },
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

/**
 * Grava a senha nova de quem chegou pelo link de redefinição. O link só abre a sessão; sem
 * esta chamada a pessoa entrava e continuava sem saber a própria senha, e na próxima vez
 * precisava pedir outro link.
 */
export async function atualizarSenha(senha: string): Promise<{ error?: string }> {
  const { error } = await getSupabase().auth.updateUser({ password: senha });
  return { error: error?.message };
}

/**
 * O e-mail como o teclado do celular entrega: com espaço no fim (a sugestão do teclado põe),
 * às vezes com maiúscula no começo. O Supabase compara o endereço exato, e o aluno recebia
 * "e-mail ou senha incorretos" digitando certo.
 */
export const limparEmail = (email: string) => email.trim().toLowerCase();

/** Traduz as mensagens mais comuns do Supabase para um português claro. */
export function traduzErroAuth(msg: string | undefined): string {
  if (!msg) return "Não foi possível concluir. Tente de novo.";
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "E-mail ou senha incorretos.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Este e-mail já tem conta. Tente entrar.";
  if (m.includes("password should be at least")) return "A senha precisa de pelo menos 6 caracteres.";
  if (m.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar (veja sua caixa de entrada).";
  if (m.includes("unable to validate email") || m.includes("invalid email")) return "E-mail inválido.";
  if (m.includes("rate limit") || m.includes("too many") || m.includes("security purposes"))
    return "Muitas tentativas. Espere um instante e tente de novo.";
  if (m.includes("same") && m.includes("password")) return "A senha nova precisa ser diferente da anterior.";
  if (m.includes("failed to fetch") || m.includes("network")) return "Sem conexão com a internet. Confira a rede e tente de novo.";
  return msg;
}
