/**
 * Acesso local com senha (SHA-256 + salt via WebCrypto).
 *
 * HONESTIDADE DO MODELO: o app é local-first (sem backend); esta senha protege
 * o acesso casual NESTE dispositivo/navegador (recepção da academia, notebook
 * compartilhado). Não é autenticação em nuvem nem criptografa os dados do
 * localStorage. Quando a fase Supabase (F5) for ativada, esta tela vira o
 * login real sem retrabalho de UI.
 */

const SESSION_KEY = "pi-auth-session";

export async function hashSenha(senha: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${senha}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function novoSalt(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Sessão por aba/navegador: fechar o navegador pede a senha de novo. */
export function sessaoAtiva(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function abrirSessao() {
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    /* storage indisponível: segue sem sessão persistida */
  }
}

export function encerrarSessao() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignora */
  }
}
