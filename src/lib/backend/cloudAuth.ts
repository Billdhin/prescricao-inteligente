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
}

export const useCloudAuth = create<CloudAuthState>(() => ({
  configured: isSupabaseConfigured(),
  status: isSupabaseConfigured() ? "loading" : "signed-out",
  session: null,
  user: null,
  hydrating: false,
}));

let hydratedFor: string | null = null;

/** Traz o perfil e os dados do profissional da nuvem para os stores locais. */
async function hydrate(userId: string) {
  if (hydratedFor === userId) return;
  hydratedFor = userId;
  useCloudAuth.setState({ hydrating: true });
  try {
    const [perfil, alunos, avaliacoes, prescricoes, liberacoes] = await Promise.all([
      repo.carregarPerfil(),
      repo.listarAlunos(),
      repo.listarAvaliacoes(),
      repo.listarPrescricoes(),
      repo.listarLiberacoes(),
    ]);

    const nuvemVazia = alunos.length === 0;
    const local = useAlunos.getState();

    if (nuvemVazia && local.alunos.length > 0) {
      // Primeiro login com dados só neste aparelho: sobe o que existe (uma vez).
      for (const a of local.alunos) await repo.salvarAluno(a).catch(() => {});
      for (const av of local.avaliacoes) await repo.salvarAvaliacao(av).catch(() => {});
      for (const p of local.prescricoes) await repo.salvarPrescricao(p).catch(() => {});
      for (const l of local.liberacoes) await repo.salvarLiberacao(l).catch(() => {});
      // mantém o store local como está (já é a fonte que acabou de subir)
    } else {
      // A nuvem manda: substitui o store local pelos dados do usuário.
      useAlunos.setState({ alunos, avaliacoes, prescricoes, liberacoes });
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

function aplicarSessao(session: Session | null) {
  if (session?.user) {
    setCloudOn(true);
    useCloudAuth.setState({ status: "signed-in", session, user: session.user });
    void hydrate(session.user.id);
  } else {
    setCloudOn(false);
    hydratedFor = null;
    useCloudAuth.setState({ status: "signed-out", session: null, user: null });
  }
}

// Inicialização única no carregamento do módulo (SPA). Sem credenciais, não faz nada.
if (isSupabaseConfigured()) {
  getSession()
    .then(aplicarSessao)
    .catch(() => useCloudAuth.setState({ status: "signed-out" }));
  onAuthChange(aplicarSessao);
}
