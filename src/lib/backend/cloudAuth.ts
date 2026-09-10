import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { isSupabaseConfigured, getSupabase } from "./supabaseClient";
import { onAuthChange, getSession } from "./supabaseAuth";
import * as repo from "./supabaseRepo";
import { setCloudOn } from "./cloudSync";
import { useAlunos, useUser } from "@/lib/store";
import { toast, toastFalha } from "@/lib/toast";
import type { Aluno } from "@/data/alunos";
import type { DeclaracaoAluno } from "@/data/declaracoes";

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
  useAlunos.setState({ alunos: [], avaliacoes: [], prescricoes: [], planos: [], liberacoes: [], execucoes: [], sessaoFeedbacks: [], posturais: [], declaracoes: [], rascunhos: [] });
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
  /**
   * A pessoa chegou pelo link de "esqueci a senha". O link abre a sessão, mas quem clicou
   * ainda não tem senha que saiba: enquanto isto for true, a tela de senha nova aparece por
   * cima de qualquer rota (ver NovaSenhaPeloLink).
   */
  recuperandoSenha: boolean;
  /**
   * O ESPAÇO EM USO, não a identidade da conta: define qual app renderizar. A mesma conta
   * pode ter os dois vínculos e alternar entre eles sem perder nenhum (ver alternarEspaco).
   */
  role: "profissional" | "aluno" | null;
  /** alguém prescreve para mim: existe ficha de aluno com `auth_user_id` = esta conta */
  temVinculoDeAluno: boolean;
  /** eu prescrevo para alguém: existem fichas com `user_id` = esta conta */
  temCarteiraPropria: boolean;
  /** para o aluno logado: id do registro de aluno e a marca do profissional dele */
  alunoId: string | null;
  professionalId: string | null;
  marca: { nome: string; logoDataUrl?: string; fotoDataUrl?: string; corPrimaria?: string; telefone?: string } | null;
}

export const useCloudAuth = create<CloudAuthState>(() => ({
  configured: isSupabaseConfigured(),
  status: isSupabaseConfigured() ? "loading" : "signed-out",
  session: null,
  user: null,
  hydrating: false,
  // O link de redefinição chega com "type=recovery" no endereço; o cliente do Supabase limpa
  // o endereço ao ler a sessão, então a marca é lida aqui, antes dele.
  recuperandoSenha: typeof window !== "undefined" && /type=recovery/.test(window.location.hash + window.location.search),
  role: null,
  temVinculoDeAluno: false,
  temCarteiraPropria: false,
  alunoId: null,
  professionalId: null,
  marca: null,
}));

let hydratedFor: string | null = null;

/** Carrega os dados do ALUNO logado (o proprio registro, planos, avaliacoes,
 *  execucoes) e a marca do profissional dele. O shell do aluno renderiza a partir
 *  destes stores. */
async function hydrateAluno(professionalId: string | null) {
  const [alunosSemFoto, planos, avaliacoes, execucoes, sessaoFeedbacks, declaracoes, fotos] = await Promise.all([
    repo.listarAlunos("meuTreino"),
    repo.listarPlanos(),
    repo.listarAvaliacoes(),
    repo.listarExecucoes(),
    repo.listarSessaoFeedbacks(),
    repo.listarDeclaracoes(),
    repo.listarFotosAluno(),
  ]);
  const alunos = repo.comFotos(alunosSemFoto, fotos);
  // Liberações do próprio aluno: alimentam o alerta de "treino em pausa" no app.
  // A leitura depende da policy `liberacoes_aluno_read` (migração 0006). Enquanto
  // ela não estiver aplicada, a RLS filtra e o select volta vazio (sem erro), então
  // o portal segue sem alerta. `.catch` blinda contra qualquer falha de policy.
  const liberacoes = await repo.listarLiberacoes().catch(() => []);
  const marca = professionalId
    ? await repo.carregarMarcaProfissional(professionalId).catch(() => null)
    : null;
  useAlunos.setState({ alunos, planos, avaliacoes, execucoes, sessaoFeedbacks, declaracoes, prescricoes: [], liberacoes, posturais: [] });
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

    // As capacidades da conta são DERIVADAS dos dados, nunca declaradas: a carteira são as
    // fichas que eu atendo, o vínculo é a ficha que sou eu. As duas consultas são pequenas
    // e resolvem, de uma vez, quais espaços esta conta pode usar.
    const [carteira, minhaFicha] = await Promise.all([
      repo.listarAlunos("carteira").catch(() => [] as Aluno[]),
      repo.listarAlunos("meuTreino").catch(() => [] as Aluno[]),
    ]);
    useCloudAuth.setState({
      temCarteiraPropria: carteira.length > 0,
      temVinculoDeAluno: minhaFicha.length > 0 || !!perfil?.professionalId,
    });

    // O CREF digitado no cadastro fica nos metadados da conta até aqui, porque o gatilho
    // que cria o perfil (migração 0001) só copia o nome. Só grava quando o perfil ainda não
    // tem CREF: quem já preencheu em Conta manda sobre o que foi digitado uma vez.
    const crefDoCadastro = String(useCloudAuth.getState().user?.user_metadata?.cref ?? "").trim();
    if (crefDoCadastro && !perfil?.cref) {
      await repo.salvarPerfil({ cref: crefDoCadastro }).catch(() => undefined);
    }

    if (perfil?.role === "aluno") {
      await hydrateAluno(perfil.professionalId ?? null);
      setDonoLocal(userId);
      return;
    }
    useCloudAuth.setState({ role: "profissional", alunoId: null, professionalId: null, marca: null });

    const [alunosSemFoto, avaliacoes, prescricoes, planos, liberacoes, execucoes, sessaoFeedbacks, declaracoes, fotos] = await Promise.all([
      repo.listarAlunos("carteira"),
      repo.listarAvaliacoes(),
      repo.listarPrescricoes(),
      repo.listarPlanos(),
      repo.listarLiberacoes(),
      repo.listarExecucoes(),
      repo.listarSessaoFeedbacks(),
      repo.listarDeclaracoes(),
      repo.listarFotosAluno(),
    ]);
    const alunos = repo.comFotos(alunosSemFoto, fotos);

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
      for (const a of local.alunos)
        if (a.fotoDataUrl) await subir(() => repo.salvarFotoAluno(a.id, a.fotoDataUrl!, "profissional"));
      for (const av of local.avaliacoes) await subir(() => repo.salvarAvaliacao(av));
      for (const p of local.prescricoes) await subir(() => repo.salvarPrescricao(p));
      for (const p of local.planos) await subir(() => repo.salvarPlano(p));
      for (const l of local.liberacoes) await subir(() => repo.salvarLiberacao(l));
      if (falhas > 0) {
        toastFalha(
          falhas === 1
            ? "1 registro não subiu para a nuvem. Segue salvo neste aparelho e tentamos de novo."
            : `${falhas} registros não subiram para a nuvem. Seguem salvos neste aparelho e tentamos de novo.`,
        );
      }
      // mantém o store local como está (já é a fonte que acabou de subir)
    } else if (!localEhDesteUsuario) {
      // O local é de OUTRA conta neste aparelho: não sobe nada; usa só a nuvem.
      // Os rascunhos também são da outra conta (ficam só no aparelho): saem junto.
      useAlunos.setState({ alunos, avaliacoes, prescricoes, planos, liberacoes, execucoes, sessaoFeedbacks, declaracoes, rascunhos: [] });
    } else {
      // A nuvem manda, mas RECONCILIA: preserva o que só existe no local (ex.: o
      // que falhou de subir antes) e re-sobe esses registros, em vez de apagá-los.
      const ma = unirPorId(alunos, local.alunos);
      // A nuvem manda na ficha, mas a foto mora em outra tabela: se ela não veio da nuvem e
      // existe aqui (trocada sem rede), fica a daqui e sobe de novo.
      const fotosSoLocais: Aluno[] = [];
      ma.merged = ma.merged.map((a) => {
        if (a.fotoDataUrl) return a;
        const daqui = local.alunos.find((l) => l.id === a.id && l.fotoDataUrl);
        if (!daqui) return a;
        fotosSoLocais.push(daqui);
        return { ...a, fotoDataUrl: daqui.fotoDataUrl };
      });
      for (const a of ma.soLocais) if (a.fotoDataUrl) fotosSoLocais.push(a);
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
        declaracoes,
      });
      for (const a of ma.soLocais) await repo.salvarAluno(a).catch(() => {});
      for (const a of fotosSoLocais) await repo.salvarFotoAluno(a.id, a.fotoDataUrl!, "profissional").catch(() => {});
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

/**
 * ALTERNA O ESPAÇO EM USO da conta (atender alunos x ver o meu treino).
 *
 * A operação inteira é UMA gravação: `profiles.role`. Nada mais é tocado, e isso é
 * deliberado. `profiles.professional_id` continua apontando para quem me atende, e
 * `alunos.auth_user_id` continua apontando para mim: os dois vínculos sobrevivem à troca,
 * nos dois sentidos, quantas vezes for. Por isso alternar não é uma decisão de risco e não
 * pede confirmação dramática.
 *
 * Quem entra na carteira própria pela primeira vez cai num espaço VAZIO, que é o certo: são
 * os alunos dele, não os de quem o atende. Nenhum dado atravessa de um espaço para o outro.
 *
 * Cadastrar-se como profissional aqui é imediato de propósito. Quando a cobrança entrar no
 * ar (COBRANCA_ATIVA em src/data/planos.ts), este é o ponto onde a trava de plano entra:
 * decidir se ativar a carteira exige assinatura é decisão comercial do Filipe, e o gancho
 * fica aqui em vez de espalhado pela interface.
 */
export async function alternarEspaco(destino: "profissional" | "aluno"): Promise<void> {
  const st = useCloudAuth.getState();
  const userId = st.user?.id;
  if (!userId || st.role === destino) return;
  // Não deixa cair num espaço que não existe: sem vínculo não há "meu treino" a ver.
  if (destino === "aluno" && !st.temVinculoDeAluno) return;

  await repo.salvarPerfil({ role: destino });
  hydratedFor = null;
  await hydrate(userId);
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

/**
 * O QUE O OUTRO LADO FEZ CHEGA SEM RECARREGAR A PÁGINA.
 *
 * Os dados vinham só no login. O aluno que terminava "Conte sobre você" e pedia o treino não
 * aparecia para o professor com a tela aberta, e o alerta que existe justamente para isso só
 * chegava no dia seguinte, quando ele recarregasse. Do outro lado, o aluno esperando o treino
 * não o via chegar.
 *
 * Então, ao voltar para a aba e a cada dois minutos com ela visível, busca de novo o que o
 * OUTRO lado escreve: para o profissional, as respostas e os pedidos dos alunos e o fim de
 * cada treino; para o aluno, os planos. Nunca o que este lado escreve, para uma edição em
 * andamento não ser atropelada pela cópia da nuvem.
 */
function unirDeclaracoes(nuvem: DeclaracaoAluno[], local: DeclaracaoAluno[]): DeclaracaoAluno[] {
  const porId = new Map(local.map((d) => [d.id, d]));
  const vencedora = (n: DeclaracaoAluno) => {
    const l = porId.get(n.id);
    if (!l) return n;
    // A resposta mais nova vence; na mesma resposta, vence a revisão mais nova (a daqui pode
    // ainda estar a caminho da nuvem).
    if (l.declaradaEm !== n.declaradaEm) return l.declaradaEm > n.declaradaEm ? l : n;
    return (l.revisadaEm ?? 0) > (n.revisadaEm ?? 0) ? l : n;
  };
  return unirPorId(nuvem.map(vencedora), local).merged;
}

let atualizando = false;
async function atualizarDoOutroLado() {
  if (atualizando || document.visibilityState !== "visible") return;
  const { status, role, hydrating } = useCloudAuth.getState();
  if (status !== "signed-in" || hydrating || !role) return;
  atualizando = true;
  try {
    const declaracoes = await repo.listarDeclaracoes();
    if (role === "profissional") {
      const feedbacks = await repo.listarSessaoFeedbacks();
      const s = useAlunos.getState();
      useAlunos.setState({
        declaracoes: unirDeclaracoes(declaracoes, s.declaracoes),
        sessaoFeedbacks: unirPorId(feedbacks, s.sessaoFeedbacks).merged,
      });
    } else {
      const planos = await repo.listarPlanos().catch(() => []);
      const s = useAlunos.getState();
      useAlunos.setState({ declaracoes: unirDeclaracoes(declaracoes, s.declaracoes), ...(planos.length ? { planos } : {}) });
    }
  } catch {
    /* sem rede: tenta de novo na próxima volta à aba ou no próximo intervalo */
  } finally {
    atualizando = false;
  }
}

// Inicialização única no carregamento do módulo (SPA). Sem credenciais, não faz nada.
if (isSupabaseConfigured() && typeof window !== "undefined") {
  window.setInterval(() => void atualizarDoOutroLado(), 120_000);
  document.addEventListener("visibilitychange", () => void atualizarDoOutroLado());
}
if (isSupabaseConfigured()) {
  getSession()
    .then(aplicarSessao)
    .catch(() => useCloudAuth.setState({ status: "signed-out" }));
  onAuthChange(aplicarSessao);
  getSupabase().auth.onAuthStateChange((evento) => {
    if (evento === "PASSWORD_RECOVERY") useCloudAuth.setState({ recuperandoSenha: true });
  });
}
