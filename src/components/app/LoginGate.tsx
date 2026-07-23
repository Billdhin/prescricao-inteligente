import * as React from "react";
import { Lock, LogIn } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { buttonClasses } from "@/components/ui/primitives";
import { useUser } from "@/lib/store";
import { hashSenha, abrirSessao } from "@/lib/auth";
import { cn } from "@/lib/utils";

/**
 * Tela de entrada quando há senha de acesso definida (Configurações > Acesso).
 * Proteção LOCAL deste dispositivo; a decisão de exibir é do AppLayout
 * (senhaHash definida e sessão não aberta).
 */
export function LoginGate({ onEntrar }: { onEntrar: () => void }) {
  const { name, fotoDataUrl, senhaHash, senhaSalt, limparSenha } = useUser();
  const [senha, setSenha] = React.useState("");
  const [erro, setErro] = React.useState(false);
  const [verificando, setVerificando] = React.useState(false);
  const [esqueci, setEsqueci] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => inputRef.current?.focus(), []);

  const entrar = async () => {
    if (!senha || verificando) return;
    setVerificando(true);
    const h = await hashSenha(senha, senhaSalt);
    setVerificando(false);
    if (h === senhaHash) {
      abrirSessao();
      onEntrar();
    } else {
      setErro(true);
      setSenha("");
      inputRef.current?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-bg p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-card border border-border bg-surface p-6 shadow-elevated md:p-8">
          <div className="flex flex-col items-center text-center">
            {fotoDataUrl ? (
              <img
                src={fotoDataUrl}
                alt=""
                className="h-16 w-16 rounded-full object-cover ring-2 ring-[#1b4b66]/20"
              />
            ) : (
              <span className="grid h-16 w-16 place-items-center rounded-full gradient-brand text-xl font-bold text-white">
                {name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </span>
            )}
            <h1 className="mt-3 font-display text-xl font-bold text-ink">{name}</h1>
            <p className="mt-1 text-sm text-ink-2">Digite sua senha de acesso para continuar.</p>
          </div>

          <label className="mt-5 block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">Senha</span>
            <input
              ref={inputRef}
              type="password"
              value={senha}
              onChange={(e) => {
                setSenha(e.target.value);
                setErro(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && entrar()}
              className={cn("input", erro && "border-danger-fill focus-visible:border-danger-fill")}
              autoComplete="current-password"
            />
            {erro && <span className="mt-1 block text-xs font-medium text-danger">Senha incorreta. Tente de novo.</span>}
          </label>

          <button
            onClick={entrar}
            disabled={!senha || verificando}
            className={cn(buttonClasses("primary"), "mt-4 w-full", (!senha || verificando) && "opacity-60")}
          >
            <LogIn className="h-4 w-4" /> Entrar
          </button>

          {!esqueci ? (
            <button
              onClick={() => setEsqueci(true)}
              className="mt-4 w-full text-center text-xs font-medium text-ink-3 hover:text-ink"
            >
              Esqueci a senha
            </button>
          ) : (
            <div className="mt-4 rounded-xl bg-surface-soft p-3 text-xs leading-relaxed text-ink-2">
              <p>
                A senha protege o acesso neste dispositivo. Sem ela, a única saída é remover a
                proteção: seus alunos e prescrições deste navegador continuam intactos.
              </p>
              <button
                onClick={() => {
                  limparSenha();
                  abrirSessao();
                  onEntrar();
                }}
                className="mt-2 font-semibold text-danger hover:underline"
              >
                Remover a senha e entrar
              </button>
            </div>
          )}
        </div>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-ink-3">
          <Lock className="h-3 w-3" /> Proteção de acesso local deste dispositivo.
        </p>
      </div>
    </div>
  );
}
