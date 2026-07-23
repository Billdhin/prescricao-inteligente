import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "./supabaseClient";
import { onAuthChange, getSession } from "./supabaseAuth";
import * as repo from "./supabaseRepo";
import { setCloudOn } from "./cloudSync";
import { useAlunos, useUser } from "@/lib/store";
import { toast } from "@/lib/toast";

// Marcador de "dono" dos stores locais: a conta a que os dados neste navegador
// pertencem. Impede que a base de um profissional suba para a conta de outro que
// logue no mesmo aparelho (N2).
const CHAVE_DONO = "pi-cloud-owner";
const donoLocal = () => {
  try {
    return localStorage.getItem(CHAVE_DONO);
  } catch {
    return null;
  }
};
const setDonoLocal = (id: string | null) => {
  try {
    if (id) localStorage.setItem(CHAVE_DONO, id);
    else localStorage.removeItem(CHAVE_DONO);
  } catch {
    /* ignore */
  }
};

/** Zera os stores locais (na troca/saida de conta), para o proximo usuario nao
 *  ver os dados do anterior. */
function limparStoresLocais() {
  useAlunos.setState({ alunos: [], avaliacoes: [], prescricoes: [], planos: [], liberacoes: [], execucoes: [], sessaoFeedbacks: [], posturais: [] });
  useUser.setState({ name: "", cref: "", email: "", telefone: "", empresa: "", site: "", fotoDataUrl: "", logoDataUrl: "", corPrimaria: "" });
}

/** Une por id: a nuvem e a base, e os registros que so existem no local (ex.: os
 *  que falharam de subir) sao preservados em vez de sumir. */
function unirPorId<T extends { id: string }>(nuvem: T[], local: T[]): { merged: T[]; soLocais: T[] } {
  const ids = new Set(nuvem.map((x) => x.id));
  const soLocais = local.filter((x) => !ids.has(x.id));
  return { merged: [...nuvem, ...soLocais], soLocais };
}

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
  const [alunos, planos, avaliacoes, execucoes, sessaoFeedbacks] = await Promise.all([
    repo.listarAlunos(),
    repo.listarPlanos(),
    repo.listarAvaliacoes(),
    repo.listarExecucoes(),
    repo.listarSessaoFeedbacks(),
  ]);
  // Liberações do próprio aluno: alimentam o alerta de "treino em pausa" no app.
  // A leitura depende da policy `liberacoes_aluno_read` (migração 0006). Enquanto
  // ela não estiver aplicada, a RLS filtra e o select volta vazio (sem erro), então
  // o portal segue sem alerta. `.catch` blinda contra qualquer falha de policy.
  const liberacoes = await repo.listarLiberacoes().catch(() => []);
  const marca = professionalId
    ? await repo.carregarMarcaProfissional(professionalId).catch(() => null)
    : null;
  useAlunos.setState({ alunos, planos, avaliacoes, execucoes, sessaoFeedbacks, prescricoes: [], liberacoes, posturais: [] });
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
      setDonoLocal(userId);
      return;
    }
    useCloudAuth.setState({ role: "profissional", alunoId: null, professionalId: null, marca: null });

    const [alunos, avaliacoes, prescricoes, planos, liberacoes, execucoes, sessaoFeedbacks] = await Promise.all([
      repo.listarAlunos(),
      repo.listarAvaliacoes(),
      repo.listarPrescricoes(),
      repo.listarPlanos(),
      repo.listarLiberacoes(),
      repo.listarExecucoes(),
      repo.listarSessaoFeedbacks(),
    ]);

    const nuvemVazia = alunos.length === 0;
    const local = useAlunos.getState();
    const dono = donoLocal();
    // O local só "pertence" a esta conta quando o marcador é dela ou está vazio
    // (primeira vez). Se for de OUTRO usuário, não subimos nada dele (N2).
    const localEhDesteUsuario = dono === userId || dono === null;

    if (nuvemVazia && localEhDesteUsuario && local.alunos.length > 0) {
      // Primeiro login com dados só neste aparelho: sobe o que existe (uma vez).
      // Sem catch silencioso: conta as falhas e avisa; o local segue como fonte (N3).
      let falhas = 0;
      const subir = async (fn: () => Promise<unknown>) => {
        try {
          await fn();
        } catch {
          falhas++;
        }
      };
      for (const a of local.alunos) await subir(() => repo.salvarAluno(a));
      for (const av of local.avaliacoes) await subir(() => repo.salvarAvaliacao(av));
      for (const p of local.prescricoes) await subir(() => repo.salvarPrescricao(p));
      for (const p of local.planos) await subir(() => repo.salvarPlano(p));
      for (const l of local.liberacoes) await subir(() => repo.salvarLiberacao(l));
      if (falhas > 0) {
        toast(`${falhas} registro(s) não subiram para a nuvem; seguem salvos neste aparelho e tentaremos de novo.`);
      }
      // mantém o store local como está (já é a fonte que acabou de subir)
    } else if (!localEhDesteUsuario) {
      // O local é de OUTRA conta neste aparelho: não sobe nada; usa só a nuvem.
      useAlunos.setState({ alunos, avaliacoes, prescricoes, planos, liberacoes, execucoes, sessaoFeedbacks });
    } else {
      // A nuvem manda, mas RECONCILIA: preserva o que só existe no local (ex.: o
      // que falhou de subir antes) e re-sobe esses registros, em vez de apagá-los.
      const ma = unirPorId(alunos, local.alunos);
      const mav = unirPorId(avaliacoes, local.avaliacoes);
      const mp = unirPorId(prescricoes, local.prescricoes);
      const mpl = unirPorId(planos, local.planos);
      const ml = unirPorId(liberacoes, local.liberacoes);
      useAlunos.setState({
        alunos: ma.merged,
        avaliacoes: mav.merged,
        prescricoes: mp.merged,
        planos: mpl.merged,
        liberacoes: ml.merged,
        execucoes,
        sessaoFeedbacks,
      });
      for (const a of ma.soLocais) await repo.salvarAluno(a).catch(() => {});
      for (const av of mav.soLocais) await repo.salvarAvaliacao(av).catch(() => {});
      for (const p of mp.soLocais) await repo.salvarPrescricao(p).catch(() => {});
      for (const p of mpl.soLocais) await repo.salvarPlano(p).catch(() => {});
      for (const l of ml.soLocais) await repo.salvarLiberacao(l).catch(() => {});
    }
    setDonoLocal(userId);

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
    // Ao sair, zera os stores e o marcador de dono, para o proximo login neste
    // aparelho comecar limpo (nao ver os dados do usuario anterior) (N2).
    limparStoresLocais();
    setDonoLocal(null);
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
