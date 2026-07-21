import * as React from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useCloudAuth, recarregarSessao } from "@/lib/backend/cloudAuth";
import { signIn, signUp, signOut } from "@/lib/backend/supabaseAuth";
import { reivindicarConvite, salvarExecucao } from "@/lib/backend/supabaseRepo";
import { useAlunos } from "@/lib/store";
import { StudentApp } from "@/components/student/StudentApp";
import { Logo } from "@/components/brand/Logo";
import { buttonClasses } from "@/components/ui/primitives";

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

  return (
    <StudentApp
      aluno={aluno}
      plano={plano}
      marca={marca ?? { nome: aluno.nome }}
      avaliacoes={avaliacoes}
      execucoes={execucoes}
      onRegistrar={registrar}
      onSair={() => void signOut()}
    />
  );
}

/* ------------------------------ Auth do aluno ----------------------------- */

function StudentAuthGate({ convite }: { convite?: string }) {
  const [modo, setModo] = React.useState<"entrar" | "criar">(convite ? "criar" : "entrar");
  const [nome, setNome] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [senha, setSenha] = React.useState("");
  const [erro, setErro] = React.useState<string | null>(null);
  const [carregando, setCarregando] = React.useState(false);

  const enviar = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      const r = modo === "criar" ? await signUp(email, senha, nome) : await signIn(email, senha);
      if (r.error) {
        setErro(r.error);
        return;
      }
      if (convite) {
        await reivindicarConvite(convite).catch((e) => setErro(e?.message ?? "Não consegui validar o convite."));
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
      <form onSubmit={enviar} className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-elevated">
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
        {erro && <p className="text-sm text-[color:var(--cta-text,#b91c1c)]">{erro}</p>}
        <button type="submit" disabled={carregando} className={buttonClasses("primary") + " w-full justify-center"}>
          {carregando ? "Aguarde..." : modo === "criar" ? "Criar conta" : "Entrar"}
        </button>
        <button
          type="button"
          onClick={() => setModo((m) => (m === "criar" ? "entrar" : "criar"))}
          className="w-full text-center text-sm font-semibold text-primary hover:underline"
        >
          {modo === "criar" ? "Já tenho conta, entrar" : "Não tenho conta, criar"}
        </button>
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
        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
    </label>
  );
}

function Centro({ children }: { children: React.ReactNode }) {
  return <div className="grid min-h-[100dvh] place-items-center bg-bg p-4">{children}</div>;
}

function Splash() {
  return (
    <div className="grid min-h-[100dvh] place-items-center bg-bg">
      <div className="h-1 w-24 overflow-hidden rounded-full bg-surface-soft">
        <div className="h-full w-1/2 animate-pulse rounded-full gradient-brand" />
      </div>
    </div>
  );
}
