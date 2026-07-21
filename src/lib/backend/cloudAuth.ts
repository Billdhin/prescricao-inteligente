import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "./supabaseClient";
import { onAuthChange, getSession } from "./supabaseAuth";
import * as repo from "./supabaseRepo";
import { setCloudOn } from "./cloudSync";
import { useAlunos, useUser } from "@/lib/store";

/**
 * Estado de autenticação em nuvem (Fase 5 — login real).
 *
 * Só entra em ação quando `isSupabaseConfigured()` é true (há credenciais no
 * ambiente). Sem elas, `configured` fica false e o app segue 100% local, com a
 * proteção por senha local de sempre. O AppLayout consulta este estado para
 * decidir se mostra o portão de login em nuvem.
 */

export type CloudStatus = "loading" | "signed-out" | "signed-in";

interface CloudAuthState {
  configured: boolean;
  status: CloudStatus;
  session: Session | null;
  user: User | null;
  /** true enquanto hidrata os dados do usuário logo após o login */
  hydrating: boolean;
  /** papel da conta logada; define qual app renderizar (profissional x aluno) */
  role: "profissional" | "aluno" | null;
  /** para o aluno logado: id do registro de aluno e a marca do profissional dele */
  alunoId: string | null;
  professionalId: string | null;
  marca: { nome: string; logoDataUrl?: string; corPrimaria?: string } | null;
}

export const useCloudAuth = create<CloudAuthState>(() => ({
  configured: isSupabaseConfigured(),
  status: isSupabaseConfigured() ? "loading" : "signed-out",
  session: null,
  user: null,
  hydrating: false,
  role: null,
  alunoId: null,
  professionalId: null,
  marca: null,
}));

let hydratedFor: string | null = null;

/** Carrega os dados do ALUNO logado (o proprio registro, planos, avaliacoes,
 *  execucoes) e a marca do profissional dele. O shell do aluno renderiza a partir
 *  destes stores. */
async function hydrateAluno(professionalId: string | null) {
  const [alunos, planos, avaliacoes, execucoes] = await Promise.all([
    repo.listarAlunos(),
    repo.listarPlanos(),
    repo.listarAvaliacoes(),
    repo.listarExecucoes(),
  ]);
  const marca = professionalId
    ? await repo.carregarMarcaProfissional(professionalId).catch(() => null)
    : null;
  useAlunos.setState({ alunos, planos, avaliacoes, execucoes, prescricoes: [], liberacoes: [] });
  useCloudAuth.setState({ role: "aluno", alunoId: alunos[0]?.id ?? null, professionalId, marca });
}

/** Traz o perfil e os dados da nuvem para os stores locais. Ramifica por papel:
 *  aluno carrega o proprio treino; profissional carrega a carteira dele. */
async function hydrate(userId: string) {
  if (hydratedFor === userId) return;
  hydratedFor = userId;
  useCloudAuth.setState({ hydrating: true });
  try {
    const perfil = await repo.carregarPerfil();

    if (perfil?.role === "aluno") {
      await hydrateAluno(perfil.professionalId ?? null);
      return;
    }
    useCloudAuth.setState({ role: "profissional", alunoId: null, professionalId: null, marca: null });

    const [alunos, avaliacoes, prescricoes, planos, liberacoes, execucoes] = await Promise.all([
      repo.listarAlunos(),
      repo.listarAvaliacoes(),
      repo.listarPrescricoes(),
      repo.listarPlanos(),
      repo.listarLiberacoes(),
      repo.listarExecucoes(),
    ]);

    const nuvemVazia = alunos.length === 0;
    const local = useAlunos.getState();

    if (nuvemVazia && local.alunos.length > 0) {
      // Primeiro login com dados só neste aparelho: sobe o que existe (uma vez).
      for (const a of local.alunos) await repo.salvarAluno(a).catch(() => {});
      for (const av of local.avaliacoes) await repo.salvarAvaliacao(av).catch(() => {});
      for (const p of local.prescricoes) await repo.salvarPrescricao(p).catch(() => {});
      for (const p of local.planos) await repo.salvarPlano(p).catch(() => {});
      for (const l of local.liberacoes) await repo.salvarLiberacao(l).catch(() => {});
      // mantém o store local como está (já é a fonte que acabou de subir)
    } else {
      // A nuvem manda: substitui o store local pelos dados do usuário.
      useAlunos.setState({ alunos, avaliacoes, prescricoes, planos, liberacoes, execucoes });
    }

    // Perfil: se a nuvem tem perfil preenchido, usa; senão, sobe o local.
    const u = useUser.getState();
    const perfilVazio =
      !perfil || (!perfil.cref && !perfil.empresa && !perfil.telefone && !perfil.fotoDataUrl);
    if (perfilVazio) {
      await repo
        .salvarPerfil({
          name: u.name,
          cref: u.cref,
          email: u.email,
          telefone: u.telefone,
          empresa: u.empresa,
          site: u.site,
          fotoDataUrl: u.fotoDataUrl,
          logoDataUrl: u.logoDataUrl,
          plan: u.plan,
        })
        .catch(() => {});
    } else {
      useUser.setState({
        name: perfil.name || u.name,
        cref: perfil.cref ?? "",
        email: perfil.email ?? u.email,
        telefone: perfil.telefone ?? "",
        empresa: perfil.empresa ?? "",
        site: perfil.site ?? "",
        fotoDataUrl: perfil.fotoDataUrl ?? "",
        logoDataUrl: perfil.logoDataUrl ?? "",
        plan: perfil.plan ?? u.plan,
      });
    }
  } finally {
    useCloudAuth.setState({ hydrating: false });
  }
}

/** Re-hidrata a sessão atual do zero. Usado após o aluno reivindicar o convite
 *  (o papel muda para 'aluno' e os dados dele precisam ser recarregados). */
export async function recarregarSessao() {
  const userId = useCloudAuth.getState().user?.id;
  if (!userId) return;
  hydratedFor = null;
  await hydrate(userId);
}

function aplicarSessao(session: Session | null) {
  if (session?.user) {
    setCloudOn(true);
    useCloudAuth.setState({ status: "signed-in", session, user: session.user });
    void hydrate(session.user.id);
  } else {
    setCloudOn(false);
    hydratedFor = null;
    useCloudAuth.setState({ status: "signed-out", session: null, user: null, role: null, alunoId: null, professionalId: null, marca: null });
  }
}

// Inicialização única no carregamento do módulo (SPA). Sem credenciais, não faz nada.
if (isSupabaseConfigured()) {
  getSession()
    .then(aplicarSessao)
    .catch(() => useCloudAuth.setState({ status: "signed-out" }));
  onAuthChange(aplicarSessao);
}
