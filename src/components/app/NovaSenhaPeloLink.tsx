import * as React from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { KeyRound } from "lucide-react";
import { useCloudAuth } from "@/lib/backend/cloudAuth";
import { atualizarSenha, traduzErroAuth } from "@/lib/backend/supabaseAuth";
import { CampoSenha } from "@/components/app/CampoSenha";
import { buttonClasses } from "@/components/ui/primitives";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

/**
 * A SENHA NOVA DE QUEM CHEGOU PELO LINK DE "ESQUECI A SENHA".
 *
 * O link do e-mail só abre a sessão. Antes desta tela a pessoa entrava e seguia sem saber a
 * própria senha: na próxima vez precisava pedir outro link, e o aluno, que nem tinha "esqueci
 * a senha", ficava sem entrar. Ela aparece por cima de qualquer rota (o link cai no endereço
 * do site, que pode ser a página inicial) e some depois de gravar.
 */
export function NovaSenhaPeloLink() {
  const recuperando = useCloudAuth((s) => s.recuperandoSenha);
  const logado = useCloudAuth((s) => s.status === "signed-in");
  const role = useCloudAuth((s) => s.role);
  const navigate = useNavigate();
  const [senha, setSenha] = React.useState("");
  const [confirma, setConfirma] = React.useState("");
  const [erro, setErro] = React.useState<string | null>(null);
  const [salvando, setSalvando] = React.useState(false);
  const idSenha = React.useId();
  const idConfirma = React.useId();

  if (!recuperando || !logado) return null;

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    if (senha.length < 6) return setErro("A senha precisa de pelo menos 6 caracteres.");
    if (senha !== confirma) return setErro("As duas senhas não são iguais.");
    setSalvando(true);
    // Falha de rede não pode deixar o botão preso em "Salvando...": vira erro legível.
    const r = await atualizarSenha(senha).catch((e: unknown) => ({ error: (e as Error)?.message ?? "network" }));
    setSalvando(false);
    if (r.error) return setErro(traduzErroAuth(r.error));
    useCloudAuth.setState({ recuperandoSenha: false });
    toast("Senha nova salva. Use ela da próxima vez que entrar.");
    navigate(role === "aluno" ? "/aluno" : "/dashboard", { replace: true });
  };

  const classe =
    "h-12 w-full rounded-lg border border-border bg-surface px-3 text-base text-ink focus:outline-none focus:ring-2 focus:ring-primary";

  return createPortal(
    <div className="fixed inset-0 z-[90] grid place-items-center bg-bg/95 p-4" role="dialog" aria-modal="true" aria-labelledby="nova-senha-titulo">
      <form onSubmit={salvar} className="w-full max-w-sm space-y-4 rounded-card border border-border bg-surface p-6 shadow-elevated">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary-tint text-primary">
          <KeyRound className="h-6 w-6" aria-hidden />
        </span>
        <div className="space-y-1 text-center">
          <h1 id="nova-senha-titulo" className="font-display text-xl font-bold text-ink">
            Crie uma senha nova
          </h1>
          <p className="text-sm text-ink-2">Você entrou pelo link do e-mail. Escolha a senha que vai usar daqui para frente.</p>
        </div>
        <div>
          <label htmlFor={idSenha} className="mb-1 block text-sm font-semibold text-ink">
            Senha nova
          </label>
          <CampoSenha id={idSenha} value={senha} onChange={setSenha} autoComplete="new-password" placeholder="Pelo menos 6 caracteres" className={classe} required />
        </div>
        <div>
          <label htmlFor={idConfirma} className="mb-1 block text-sm font-semibold text-ink">
            Repita a senha
          </label>
          <CampoSenha id={idConfirma} value={confirma} onChange={setConfirma} autoComplete="new-password" className={classe} required />
        </div>
        {erro && (
          <p className="rounded-lg bg-danger-tint px-3 py-2 text-sm font-medium text-danger" role="alert">
            {erro}
          </p>
        )}
        <button type="submit" disabled={salvando} className={cn(buttonClasses("primary"), "w-full justify-center")}>
          {salvando ? "Salvando..." : "Salvar a senha nova"}
        </button>
      </form>
    </div>,
    document.body,
  );
}
