import * as React from "react";
import { LogIn, UserPlus, Mail, CheckCircle2, Cloud } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { buttonClasses } from "@/components/ui/primitives";
import { signIn, signUp, resetPassword } from "@/lib/backend/supabaseAuth";
import { cn } from "@/lib/utils";

/**
 * Portão de login em nuvem (Fase 5 — login real com Supabase Auth).
 *
 * Substitui a proteção por senha local quando o backend está configurado. Cada
 * profissional cria conta e entra; a sessão é do Supabase (sincroniza entre
 * aparelhos). O AppLayout só mostra este portão quando não há sessão.
 */

type Aba = "entrar" | "criar";

/** Traduz as mensagens mais comuns do Supabase para um português claro. */
function traduzErro(msg: string | undefined): string {
  if (!msg) return "Não foi possível concluir. Tente de novo.";
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "E-mail ou senha incorretos.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Este e-mail já tem conta. Tente entrar.";
  if (m.includes("password should be at least"))
    return "A senha precisa de pelo menos 6 caracteres.";
  if (m.includes("email not confirmed"))
    return "Confirme seu e-mail antes de entrar (veja sua caixa de entrada).";
  if (m.includes("unable to validate email") || m.includes("invalid email"))
    return "E-mail inválido.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Muitas tentativas. Espere um instante e tente de novo.";
  return msg;
}

export function CloudAuthGate() {
  const [aba, setAba] = React.useState<Aba>("entrar");
  const [nome, setNome] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [senha, setSenha] = React.useState("");
  const [carregando, setCarregando] = React.useState(false);
  const [erro, setErro] = React.useState("");
  const [aviso, setAviso] = React.useState("");

  const limpar = () => {
    setErro("");
    setAviso("");
  };

  const submeter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (carregando) return;
    limpar();
    if (!email || !senha || (aba === "criar" && !nome)) {
      setErro("Preencha todos os campos.");
      return;
    }
    setCarregando(true);
    try {
      if (aba === "entrar") {
        const r = await signIn(email.trim(), senha);
        if (r.error) setErro(traduzErro(r.error));
        // sucesso: onAuthChange fecha o portão automaticamente
      } else {
        const r = await signUp(email.trim(), senha, nome.trim());
        if (r.error) {
          setErro(traduzErro(r.error));
        } else if (!r.session) {
          // projeto com confirmação de e-mail ligada: sem sessão até confirmar
          setAviso(
            "Conta criada. Enviamos um e-mail de confirmação: confirme para entrar. (Se preferir entrar direto, o administrador pode desligar a confirmação de e-mail no painel.)",
          );
        }
        // com sessão: onAuthChange fecha o portão
      }
    } finally {
      setCarregando(false);
    }
  };

  const esqueci = async () => {
    limpar();
    if (!email) {
      setErro("Digite seu e-mail acima para receber o link de redefinição.");
      return;
    }
    const r = await resetPassword(email.trim());
    if (r.error) setErro(traduzErro(r.error));
    else setAviso("Enviamos um link de redefinição de senha para o seu e-mail.");
  };

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-bg p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-card border border-border bg-surface p-6 shadow-elevated md:p-8">
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-surface-soft p-1" role="tablist" aria-label="Entrar ou criar conta">
            {(["entrar", "criar"] as Aba[]).map((v) => (
              <button
                key={v}
                role="tab"
                aria-selected={aba === v}
                onClick={() => {
                  setAba(v);
                  limpar();
                }}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-semibold transition",
                  aba === v ? "bg-surface text-ink shadow-soft" : "text-ink-2 hover:text-ink",
                )}
              >
                {v === "entrar" ? "Entrar" : "Criar conta"}
              </button>
            ))}
          </div>

          <form onSubmit={submeter} className="space-y-3">
            {aba === "criar" && (
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-ink">Seu nome</span>
                <input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="input"
                  autoComplete="name"
                  placeholder="Como aparece nos documentos"
                />
              </label>
            )}
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink">E-mail</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                autoComplete="email"
                placeholder="voce@exemplo.com"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink">Senha</span>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="input"
                autoComplete={aba === "entrar" ? "current-password" : "new-password"}
                placeholder={aba === "criar" ? "Pelo menos 6 caracteres" : ""}
              />
            </label>

            {erro && (
              <p className="rounded-lg bg-[#fef2f2] px-3 py-2 text-xs font-medium text-[#b91c1c]">{erro}</p>
            )}
            {aviso && (
              <p className="flex items-start gap-2 rounded-lg bg-[#f0fdf4] px-3 py-2 text-xs font-medium text-[#15803d]">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {aviso}
              </p>
            )}

            <button
              type="submit"
              disabled={carregando}
              className={cn(buttonClasses("primary"), "w-full", carregando && "opacity-60")}
            >
              {aba === "entrar" ? (
                <>
                  <LogIn className="h-4 w-4" /> {carregando ? "Entrando…" : "Entrar"}
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" /> {carregando ? "Criando…" : "Criar conta"}
                </>
              )}
            </button>
          </form>

          {aba === "entrar" && (
            <button
              onClick={esqueci}
              className="mt-4 flex w-full items-center justify-center gap-1.5 text-center text-xs font-medium text-ink-3 hover:text-ink"
            >
              <Mail className="h-3 w-3" /> Esqueci a senha
            </button>
          )}
        </div>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-ink-3">
          <Cloud className="h-3 w-3" /> Seus alunos e prescrições ficam salvos na sua conta, em qualquer aparelho.
        </p>
      </div>
    </div>
  );
}
