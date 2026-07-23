import * as React from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useCloudAuth, recarregarSessao } from "@/lib/backend/cloudAuth";
import { signIn, signUp, signOut } from "@/lib/backend/supabaseAuth";
import { reivindicarConvite, salvarExecucao, apagarExecucao } from "@/lib/backend/supabaseRepo";
import { useAlunos } from "@/lib/store";
import { StudentApp } from "@/components/student/StudentApp";
import { Logo } from "@/components/brand/Logo";
import { buttonClasses } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

/**
 * Portal do aluno (/aluno). Entrada única do lado do aluno: gate de cadastro/login
 * pelo convite, e depois o StudentApp carregado com os dados da conta do aluno via
 * Supabase (RLS garante que ele só vê o próprio treino). Depende de Supabase
 * configurado; a marca exibida é a do profissional dono.
 */
export function AlunoPortal() {
  const cloud = useCloudAuth();
  const [params] = useSearchParams();
  const convite = params.get("convite") ?? undefined;

  if (!cloud.configured) {
    return (
      <Centro>
        <p className="max-w-sm text-center text-sm text-ink-2">
          O portal do aluno precisa do aplicativo configurado com backend. Fale com o seu profissional.
        </p>
      </Centro>
    );
  }
  if (cloud.status === "loading" || cloud.hydrating) return <Splash />;
  if (cloud.status === "signed-out") return <StudentAuthGate convite={convite} />;
  if (cloud.role === "profissional") return <Navigate to="/dashboard" replace />;
  if (cloud.role !== "aluno") return <Splash />;
  return <PortalApp />;
}

function PortalApp() {
  const alunos = useAlunos((s) => s.alunos);
  const planos = useAlunos((s) => s.planos);
  const avaliacoes = useAlunos((s) => s.avaliacoes);
  const execucoes = useAlunos((s) => s.execucoes);
  const addExecucao = useAlunos((s) => s.addExecucao);
  const removeExecucao = useAlunos((s) => s.removeExecucao);
  const { marca, professionalId } = useCloudAuth();

  const aluno = alunos[0];
  if (!aluno) {
    return (
      <Centro>
        <p className="max-w-sm text-center text-sm text-ink-2">
          Ainda não há um treino vinculado à sua conta. Assim que o seu profissional publicar, ele aparece aqui.
        </p>
      </Centro>
    );
  }
  const plano = planos.find((p) => p.alunoId === aluno.id && p.status === "ativo");

  const registrar = (e: Parameters<typeof addExecucao>[0]) => {
    addExecucao(e);
    if (professionalId) void salvarExecucao(e, professionalId).catch(() => {});
  };
  const desfazer = (execId: string) => {
    removeExecucao(execId);
    void apagarExecucao(execId).catch(() => {});
  };

  return (
    <StudentApp
      aluno={aluno}
      plano={plano}
      // Fallback de marca NEUTRO: nunca o nome do aluno (seria estranho o app do
      // aluno se chamar como ele). Sem marca do profissional, um rótulo genérico.
      marca={marca ?? { nome: "Seu treino" }}
      avaliacoes={avaliacoes}
      execucoes={execucoes}
      onRegistrar={registrar}
      onDesfazer={desfazer}
      onSair={() => void signOut()}
    />
  );
}

/* ------------------------------ Auth do aluno ----------------------------- */

function StudentAuthGate({ convite }: { convite?: string }) {
  // Só se cria conta com um convite válido do profissional. Sem convite, o único
  // caminho é entrar numa conta já vinculada (o cadastro solto criaria uma conta
  // órfã que o RPC de convite não conseguiria vincular).
  const [modo, setModo] = React.useState<"entrar" | "criar">(convite ? "criar" : "entrar");
  const [nome, setNome] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [senha, setSenha] = React.useState("");
  const [erro, setErro] = React.useState<string | null>(null);
  const [aviso, setAviso] = React.useState<string | null>(null);
  const [carregando, setCarregando] = React.useState(false);

  const enviar = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setErro(null);
    setAviso(null);
    // Guarda dura: criar exige convite. (A UI já esconde o botão, mas trava aqui também.)
    if (modo === "criar" && !convite) {
      setErro("Peça o link de convite ao seu profissional para criar a conta.");
      return;
    }
    setCarregando(true);
    try {
      const r = modo === "criar" ? await signUp(email, senha, nome) : await signIn(email, senha);
      if (r.error) {
        setErro(r.error);
        return;
      }
      // Confirmação de e-mail ligada no Supabase: signUp volta SEM sessão. O convite
      // usa auth.uid() e falharia; então não tenta reivindicar agora, orienta a
      // confirmar e entrar depois (o convite fica pendente e é reivindicado no login).
      if (modo === "criar" && !r.session) {
        setAviso("Conta criada. Confirme o seu e-mail e depois entre para vincular o seu treino.");
        setModo("entrar");
        return;
      }
      if (convite) {
        try {
          await reivindicarConvite(convite);
        } catch (e) {
          // Convite falhou: NÃO recarrega a sessão (entraria sem papel de aluno,
          // caindo num limbo). Mostra o erro e deixa o aluno tentar de novo.
          setErro((e as Error)?.message ?? "Não consegui validar o convite. Confira o link com o seu profissional.");
          return;
        }
      }
      await recarregarSessao();
    } catch (e) {
      setErro((e as Error)?.message ?? "Algo deu errado.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="grid min-h-[100dvh] place-items-center bg-bg p-4">
      <form onSubmit={enviar} className="w-full max-w-sm space-y-4 rounded-card border border-border bg-surface p-6 shadow-elevated">
        <div className="flex justify-center">
          <Logo />
        </div>
        <h1 className="text-center font-display text-xl font-bold text-ink">
          {modo === "criar" ? "Criar a sua conta" : "Entrar"}
        </h1>
        {convite && modo === "criar" && (
          <p className="text-center text-xs text-ink-3">Você foi convidado pelo seu profissional. Crie a conta para ver o seu treino.</p>
        )}
        {modo === "criar" && (
          <Campo label="Seu nome" value={nome} onChange={setNome} type="text" />
        )}
        <Campo label="E-mail" value={email} onChange={setEmail} type="email" />
        <Campo label="Senha" value={senha} onChange={setSenha} type="password" />
        {aviso && <p className="rounded-lg bg-primary-tint px-3 py-2 text-sm text-ink">{aviso}</p>}
        {erro && <p className="text-sm text-[color:var(--cta-text,#b91c1c)]">{erro}</p>}
        <button type="submit" disabled={carregando} className={cn(buttonClasses("primary"), "w-full justify-center")}>
          {carregando ? "Aguarde..." : modo === "criar" ? "Criar conta" : "Entrar"}
        </button>
        {convite ? (
          // Com convite, o aluno pode alternar entre criar e entrar.
          <button
            type="button"
            onClick={() => setModo((m) => (m === "criar" ? "entrar" : "criar"))}
            className="w-full text-center text-sm font-semibold text-primary hover:underline"
          >
            {modo === "criar" ? "Já tenho conta, entrar" : "Não tenho conta, criar"}
          </button>
        ) : (
          // Sem convite, só entrar. Criar conta depende do link do profissional.
          <p className="text-center text-xs text-ink-3">
            Para começar, peça o link de convite ao seu profissional.
          </p>
        )}
      </form>
    </div>
  );
}

function Campo({
  label,
  value,
  onChange,
  type,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type: string;
}) {
  const id = React.useId();
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1 block text-sm font-semibold text-ink">{label}</span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        autoComplete={type === "password" ? "current-password" : type === "email" ? "email" : "name"}
        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </label>
  );
}

function Centro({ children }: { children: React.ReactNode }) {
  return <div className="grid min-h-[100dvh] place-items-center bg-bg p-4">{children}</div>;
}

function Splash() {
  // Timeout de segurança: se a sessão/hidratação travar, o aluno não fica preso
  // numa barra pulsando para sempre. Depois de alguns segundos, oferece recarregar
  // ou sair.
  const [demorou, setDemorou] = React.useState(false);
  React.useEffect(() => {
    const t = window.setTimeout(() => setDemorou(true), 8000);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="grid min-h-[100dvh] place-items-center bg-bg p-4">
      {demorou ? (
        <div className="max-w-sm space-y-3 text-center">
          <p className="text-sm text-ink-2">Está demorando mais que o normal para carregar o seu treino.</p>
          <div className="flex justify-center gap-2">
            <button onClick={() => window.location.reload()} className={buttonClasses("primary", "sm")}>
              Recarregar
            </button>
            <button onClick={() => void signOut()} className={buttonClasses("ghost", "sm")}>
              Sair
            </button>
          </div>
        </div>
      ) : (
        <div className="h-1 w-24 overflow-hidden rounded-full bg-surface-soft">
          <div className="h-full w-1/2 animate-pulse rounded-full gradient-brand" />
        </div>
      )}
    </div>
  );
}
