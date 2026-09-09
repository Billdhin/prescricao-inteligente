import * as React from "react";
import { createPortal } from "react-dom";
import { Link, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Bell, CheckCheck, MoreHorizontal, Search, Eye, Plus, LogOut } from "lucide-react";
import { Logo, MarcaPino } from "@/components/brand/Logo";
import { GlobalSearch } from "@/components/app/GlobalSearch";
import { PRIMARIOS, MAIS, BOTTOM, CONTA, itemAtivo } from "@/components/app/nav";
import { notificacoes } from "@/lib/notificacoes";
import { contagensDoMenu, alunoParaPrevia } from "@/lib/gps/pendencias";
import type { CicloCtx } from "@/lib/gps/proximoPasso";
import { LoginGate } from "@/components/app/LoginGate";
import { CloudAuthGate } from "@/components/app/CloudAuthGate";
import { Toasts } from "@/components/app/Toasts";
import { ErrorBoundary } from "@/components/app/ErrorBoundary";
import { sessaoAtiva, encerrarSessao } from "@/lib/auth";
import { useCloudAuth } from "@/lib/backend/cloudAuth";
import { signOut } from "@/lib/backend/supabaseAuth";
import { buttonClasses } from "@/components/ui/primitives";
import { specialGroups, getSpecialGroup } from "@/data/specialGroups";
import { OBJETIVOS, type GpsObjetivo } from "@/lib/gps/engine";
import { marcarAtivacao } from "@/lib/ativacao";
import { useDialog } from "@/lib/useDialog";
import { useUser, useAlunos, planLabel, uid } from "@/lib/store";
import { VAGAS_FUNDADOR, VAGAS_FUNDADOR_OCUPADAS } from "@/data/planos";
import { iniciaisDe, type Aluno } from "@/data/alunos";
import { completudeAluno } from "@/lib/gps/perfilAluno";
import type { Nivel } from "@/data/types";
import { cn } from "@/lib/utils";

// A navegação vive em nav.ts (PRIMARIOS + MAIS, com NAV e BOTTOM derivados):
// fonte única que a busca global e o check:menu também consomem.

function tempoRelativo(ts: number) {
  const diff = Date.now() - ts;
  const min = Math.round(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.round(h / 24);
  return `há ${d} d`;
}

const TITULOS_ROTA: [RegExp, string][] = [
  [/^\/aprender\/mapa/, "Mapa do conhecimento"],
  [/^\/aprender\/disciplinas\/[^/]+\/[^/]+/, "Módulo"],
  [/^\/aprender\/disciplinas\/./, "Disciplina"],
  [/^\/aprender\/disciplinas/, "Disciplinas"],
  [/^\/aprender\/conteudos/, "Conteúdo"],
  [/^\/aprender\/casos\/./, "Caso de prescrição"],
  [/^\/aprender\/casos/, "Casos de prescrição"],
  [/^\/aprender\/biblioteca/, "Biblioteca científica"],
  [/^\/aprender\/consulta/, "Consulta rápida"],
  [/^\/aprender\/salvos/, "Salvos"],
  [/^\/aprender\/progresso/, "Meu progresso"],
  [/^\/aprender/, "Aprender"],
  [/^\/dashboard/, "Meu dia"],
  [/^\/alunos\/./, "Aluno"],
  [/^\/alunos/, "Meus alunos"],
  [/^\/prescrever-treino/, "Prescrever treino"],
  [/^\/gps/, "Treino do dia"],
  [/^\/semaforo/, "Semáforo do dia"],
  [/^\/special-groups/, "Grupos Especiais"],
  [/^\/movement-lab/, "Laboratório Visual"],
  [/^\/consultar/, "Consultar"],
  [/^\/library/, "Consultar"],
  [/^\/assessments/, "Avaliar e reavaliar"],
  [/^\/protocols/, "Protocolos"],
  [/^\/comparador/, "Comparador"],
  [/^\/tracks/, "Trilhas"],
  [/^\/account/, "Configurações"],
  [/^\/tutorial/, "Ajuda"],
  [/^\/suporte/, "Ajuda"],
];

/** O nome da tela atual, da MESMA tabela que nomeia a aba do navegador. */
function tituloDaRota(pathname: string): string | undefined {
  return TITULOS_ROTA.find(([re]) => re.test(pathname))?.[1];
}

export function AppLayout() {
  const [onboarding, setOnboarding] = React.useState(
    () => typeof window !== "undefined" && !localStorage.getItem("pi-onboarded"),
  );
  /*
   * O ONBOARDING DE PRIMEIRO ALUNO SÓ VALE PARA QUEM NÃO TEM ALUNO.
   *
   * A condição era só a marca `pi-onboarded` no localStorage, que é POR NAVEGADOR, enquanto
   * a carteira de alunos vive na conta. As duas coisas se separam com facilidade: entrar num
   * segundo aparelho, numa janela anônima, ou depois de limpar os dados do navegador. Em
   * qualquer um desses casos o profissional recebia "Vamos começar pelo seu primeiro aluno"
   * em tela cheia, por cima de uma carteira que já existe.
   *
   * E não é um cartaz que dá para ignorar: o diálogo é `fixed inset-0` e deixa todo o fundo
   * `inert`, ou seja o app inteiro fica sem clique até ele sair. Medido no app rodando: com
   * dois alunos cadastrados, o modal aparecia por cima de "Prescrever treino", que é a tela
   * do core.
   *
   * A carteira chega depois da hidratação do store, então a checagem é feita no render e não
   * no estado inicial: assim que os alunos aparecem, o convite some sozinho.
   */
  const totalAlunos = useAlunos((s) => s.alunos.length);
  const mostrarOnboarding = onboarding && totalAlunos === 0;

  // Acesso local: com senha definida (Configurações > Acesso), o app pede a
  // senha uma vez por sessão do navegador. Páginas públicas (landing, /roi,
  // /casos-rcd) ficam fora deste layout e seguem abertas.
  const senhaHash = useUser((s) => s.senhaHash);
  const [logado, setLogado] = React.useState(() => sessaoAtiva());

  // Acesso em nuvem (Supabase): quando configurado, o login real substitui a
  // senha local. Sem credenciais no ambiente, `configured` é false e nada muda.
  const cloud = useCloudAuth();

  // Título da aba por rota (as páginas públicas definem o próprio e este efeito
  // "des-vaza" o título delas ao voltar para o app).
  const { pathname } = useLocation();
  React.useEffect(() => {
    const t = tituloDaRota(pathname);
    document.title = t ? `${t} | Mapa da Prescrição` : "Mapa da Prescrição";
  }, [pathname]);

  // depois de TODOS os hooks (regras de hooks): o gate substitui o shell inteiro
  if (cloud.configured) {
    // Espera TAMBÉM a hidratação, e não só o auth. Sem isso, o primeiro frame de todo
    // login mostrava o estado vazio ("Comece resolvendo um caso de verdade") e a lateral
    // zerada por cima de uma carteira cheia: a primeira coisa que o produto dizia a um
    // cliente pagante, todos os dias, era falsa. O portal do aluno já esperava.
    if (cloud.status === "loading" || cloud.hydrating) return <SplashCarregando />;
    if (cloud.status === "signed-out") return <CloudAuthGate />;
    // Conta de aluno: o portal do aluno é o lugar dela, não o shell do profissional.
    if (cloud.role === "aluno") return <Navigate to="/aluno" replace />;
    // sessão ativa (profissional): segue para o app (a hidratação roda em segundo plano)
  } else if (senhaHash && !logado) {
    return <LoginGate onEntrar={() => setLogado(true)} />;
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-bg">
      {/* Fundo fica inerte enquanto o onboarding está aberto (foco/leitura presos no diálogo) */}
      <div className="flex min-h-screen w-full" {...(mostrarOnboarding ? ({ inert: "" } as any) : {})}>
        <Sidebar />
        {/* A coluna de conteúdo abre espaço para a barra fixa em lg+; no mobile a
            barra lateral não existe e o espaço é zero. */}
        <div className="flex min-w-0 flex-1 flex-col lg:pl-[248px]">
          {/* A barra global (busca, prévia do aluno, sino, cadastrar) vive em TODAS
              as telas no redesign (protótipo de 08/09/2026): é ferramenta, não
              navegação, e cada página continua dona do próprio cabeçalho. */}
          <Topbar />
          <main className="mx-auto w-full min-w-0 max-w-[1180px] flex-1 p-4 pb-24 md:p-6 lg:p-8 lg:pb-10">
            <ErrorBoundary chaveDeReset={pathname}>
              <React.Suspense fallback={<RouteFallback />}>
                <Outlet />
              </React.Suspense>
            </ErrorBoundary>
          </main>
        </div>
      </div>
      <BotaoCadastrarAluno />
      <BottomBar />
      {mostrarOnboarding && <OnboardingGate onDone={() => setOnboarding(false)} />}
      <Toasts />
    </div>
  );
}

/**
 * Tela cheia enquanto o Supabase confere se há sessão ativa (login em nuvem).
 *
 * A espera é da própria marca: a rota se traça de um nó ao outro, no lugar da barrinha
 * pulsante que servia a qualquer produto. `role="status"` e `aria-live` ficam no wrapper,
 * porque quem usa leitor de tela precisa ouvir que há uma espera, e não ver uma animação.
 */
function SplashCarregando() {
  return (
    <div className="fixed inset-0 grid place-items-center bg-bg">
      <div role="status" aria-live="polite" className="flex flex-col items-center gap-4">
        <MarcaPino animado className="h-16 w-16" />
        <span className="font-display text-base font-bold leading-none text-ink">
          Mapa da{" "}
          <span className="relative inline-block">
            Prescrição
            <span aria-hidden className="absolute inset-x-0 -bottom-[0.18em] h-[0.1em] rounded-full bg-[#10B7C0]" />
          </span>
        </span>
        <span className="sr-only">Carregando</span>
      </div>
    </div>
  );
}

/** Fallback de carregamento das páginas lazy (Aprender). */
function RouteFallback() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse space-y-4" aria-busy="true" aria-label="Carregando">
      <div className="h-8 w-64 rounded-lg bg-surface-soft" />
      <div className="h-4 w-96 max-w-full rounded bg-surface-soft" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-40 rounded-card bg-surface-soft" />
        ))}
      </div>
    </div>
  );
}

/* Boas-vindas no primeiro acesso: define o modo E, para o profissional, abre
   direto o "Primeiro Caso Real" — o gatilho de uso é situacional (o aluno com
   comorbidade chegou HOJE), então o onboarding espelha exatamente isso. */
function OnboardingGate({ onDone }: { onDone: () => void }) {
  const loadExamples = useAlunos((s) => s.loadExamples);
  const addAluno = useAlunos((s) => s.addAluno);
  const navigate = useNavigate();
  const dialogRef = useDialog<HTMLDivElement>(() => {});
  // Onboarding de trilho único: o profissional entra pela ESPINHA, não pelo menu.
  // Ele descreve o primeiro aluno (condição, objetivo, nível), o sistema cria esse
  // aluno de verdade e o larga na tela dele com a Linha do cuidado apontando o
  // primeiro passo (avaliar). Ensina o fluxo do cuidado, não os botões.
  const [caso, setCaso] = React.useState({ nome: "", grupo: "hipertensao-estagio-1", objetivo: "Emagrecimento", nivel: "Iniciante" });

  const finish = () => {
    localStorage.setItem("pi-onboarded", "1");
    onDone();
  };
  const resolverCaso = () => {
    marcarAtivacao("inicio");
    const agora = Date.now();
    // O profissional dá o nome real do aluno; sem nome digitado, cai num rótulo
    // provisório (ele edita depois). O grupo NÃO entra no nome (fica em grupoEspecial).
    const nomeDigitado = caso.nome.trim();
    const nome = nomeDigitado || "Meu primeiro aluno";
    // Só fatos que o profissional declarou; nenhuma restrição física inventada
    // (o grupo carrega o contexto clínico, a restrição estrutural ele adiciona).
    const aluno: Aluno = {
      id: uid(),
      nome,
      iniciais: iniciaisDe(nome),
      objetivo: caso.objetivo as GpsObjetivo,
      nivel: caso.nivel as Nivel,
      restricoes: [],
      equipamentos: [],
      status: "ativo",
      criadoEm: agora,
      nivelDesde: agora,
      grupoEspecial: caso.grupo || undefined,
      // Sem nome digitado é um rótulo provisório; com nome real, é um aluno de verdade.
      observacoes: nomeDigitado
        ? undefined
        : "Rótulo provisório. Edite o nome do aluno quando quiser.",
    };
    addAluno(aluno);
    finish();
    navigate(`/alunos/${aluno.id}`, { state: { recemCriado: true } });
  };
  const explorar = () => {
    loadExamples();
    finish();
    navigate("/dashboard");
  };
  const irAprender = () => {
    finish();
    navigate("/aprender");
  };

  const chip = (ativo: boolean) =>
    cn(
      "inline-flex min-h-[44px] items-center justify-center rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
      ativo ? "border-primary bg-primary-tint text-primary font-semibold" : "border-border bg-surface text-ink-2 hover:bg-surface-soft",
    );

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Bem-vindo"
        className="w-full max-w-lg rounded-card bg-surface p-6 text-center shadow-elevated outline-none md:p-8"
      >
        <div className="mx-auto mb-4 w-fit">
          <Logo />
        </div>

        <h2 className="font-display text-2xl font-bold text-ink">Vamos começar pelo seu primeiro aluno</h2>
        <p className="mx-auto mt-1 max-w-sm text-ink-2">
          Prescreva e defenda o treino de qualquer aluno, mesmo com comorbidade, em minutos.
          Descreva quem chegou hoje: a gente cria esse aluno e abre a Linha do cuidado no
          primeiro passo.
        </p>

        <div className="mt-5 space-y-4 text-left">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">Nome do aluno</span>
            <input
              type="text"
              value={caso.nome}
              onChange={(e) => setCaso((c) => ({ ...c, nome: e.target.value }))}
              placeholder="Ex.: Maria Souza"
              autoComplete="off"
              autoCapitalize="words"
              enterKeyHint="done"
              className="input"
            />
          </label>
          <fieldset>
            <legend className="mb-1.5 text-sm font-semibold text-ink">Qual condição o seu aluno tem?</legend>
            <div className="flex flex-wrap gap-1.5">
              <button type="button" onClick={() => setCaso((c) => ({ ...c, grupo: "" }))} className={chip(caso.grupo === "")} aria-pressed={caso.grupo === ""}>
                Sem condição especial
              </button>
              {specialGroups.map((g) => (
                <button
                  key={g.slug}
                  type="button"
                  onClick={() => setCaso((c) => ({ ...c, grupo: g.slug }))}
                  className={chip(caso.grupo === g.slug)}
                  aria-pressed={caso.grupo === g.slug}
                >
                  {g.nome}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink">Objetivo</span>
              <select value={caso.objetivo} onChange={(e) => setCaso((c) => ({ ...c, objetivo: e.target.value }))} className="input">
                {OBJETIVOS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink">Nível</span>
              <select value={caso.nivel} onChange={(e) => setCaso((c) => ({ ...c, nivel: e.target.value }))} className="input">
                {["Iniciante", "Intermediário", "Avançado"].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <button
          onClick={resolverCaso}
          disabled={!caso.nome.trim()}
          className={cn(buttonClasses("primary"), "mt-5 w-full disabled:cursor-not-allowed disabled:opacity-50")}
        >
          Criar este aluno →
        </button>
        {!caso.nome.trim() && (
          <p className="mt-1.5 text-xs text-ink-3">Escreva o nome do aluno para continuar.</p>
        )}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm">
          <button onClick={explorar} className="font-medium text-ink-2 hover:text-ink">
            Não tenho um caso agora? Use um exemplo
          </button>
          <span aria-hidden className="text-ink-3">·</span>
          <button onClick={irAprender} className="font-medium text-ink-2 hover:text-ink">
            Na verdade, só quero estudar
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * A BARRA LATERAL no desenho do redesign (protótipo de 08/09/2026).
 *
 * Continua ESCURA e com valores fixos (é casca com identidade própria, fora do
 * tema claro/escuro), mas o vocabulário mudou: o item ativo é um véu claro
 * translúcido com PONTO âmbar (não mais a pílula de papel), os destinos são
 * marcados por ponto em vez de ícone, e o rodapé ganhou o card do plano
 * fundador com a barra de vagas real.
 *
 * Contraste medido sobre o navy #0B1628: o inativo #B9C6D6 dá 9,5:1, o
 * secundário #8FA0B5 dá 6,4:1 e o rótulo de seção #5F6F85 dá 3,1:1 (caixa alta
 * decorativa de 11px, mesmo papel do ink-4). Todos verificados uma vez aqui.
 */
const CASCA = {
  fundo: "#0B1628",
  borda: "rgba(255,255,255,.08)",
  tinta: "#F3F1EA",
  tinta2: "#B9C6D6",
  tinta3: "#8FA0B5",
  rotulo: "#5F6F85",
  ativoFundo: "rgba(255,255,255,.1)",
  ativoTinta: "#FFFFFF",
  ponto: "#E8A317",
  pontoInativo: "rgba(255,255,255,.25)",
} as const;

/** Largura da lateral. Vive aqui e no padding da coluna de conteúdo. */
function Sidebar() {
  const { pathname } = useLocation();
  const { alunos, avaliacoes, prescricoes, planos, liberacoes, execucoes, declaracoes } = useAlunos();
  const ctx: CicloCtx = { avaliacoes, prescricoes, planos, liberacoes, execucoes, declaracoes };
  const contagens = contagensDoMenu(alunos, ctx);

  // O contador de cada destino, quando existe. `undefined` não desenha nada: um
  // badge "0" é ruído, e um badge inventado é pior.
  const badgeDe = (to: string): { n: number; tom: "neutro" | "atencao" | "urgente" } | undefined => {
    if (to === "/alunos" && contagens.alunos > 0) return { n: contagens.alunos, tom: "neutro" };
    if (to === "/assessments" && contagens.avaliar > 0) return { n: contagens.avaliar, tom: "atencao" };
    if (to === "/semaforo" && contagens.semaforo > 0) return { n: contagens.semaforo, tom: "urgente" };
    return undefined;
  };

  return (
    <aside
      aria-label="Menu principal"
      className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col overflow-y-auto lg:flex"
      style={
        {
          background: CASCA.fundo,
          borderRight: `1px solid ${CASCA.borda}`,
          // A casca publica os próprios valores como variáveis para o hover dos
          // itens ler daqui, e não de um hex repetido na classe. Fonte única.
          "--casca-tinta": CASCA.ativoTinta,
          "--casca-hover": "rgba(255,255,255,.08)",
        } as React.CSSProperties
      }
    >
      {/* Textura de pontos do protótipo: nasce no rodapé e some subindo. É
          decoração pura (pointer-events none, aria-hidden). */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-y-0 left-0 hidden w-[248px] lg:block"
        style={{
          backgroundImage: "radial-gradient(rgba(190,214,232,.18) 1.2px,transparent 1.3px)",
          backgroundSize: "22px 22px",
          maskImage: "radial-gradient(ellipse 80% 40% at 50% 100%,#000 0%,transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 40% at 50% 100%,#000 0%,transparent 100%)",
        }}
      />
      <Link
        to="/dashboard"
        aria-label="Mapa da Prescrição, ir para Meu dia"
        className="relative flex items-center gap-3 px-5 pb-5 pt-6"
      >
        <Logo showWord={false} />
        {/* O logotipo como ele foi desenhado: nome em duas linhas e o traço da rota sob
            "Prescrição". A lateral é o único lugar do produto que reproduz o lockup inteiro,
            porque é o único com o pino e o nome empilhado lado a lado. */}
        <span className="font-display text-base font-bold leading-tight" style={{ color: CASCA.tinta }}>
          Mapa da
          <br />
          <span className="relative inline-block">
            Prescrição
            <span aria-hidden className="absolute inset-x-0 -bottom-[0.16em] h-[0.09em] rounded-full bg-[#10B7C0]" />
          </span>
        </span>
      </Link>

      <nav className="relative px-3">
        <div
          className="px-3 pb-2 text-2xs font-semibold uppercase tracking-[0.14em]"
          style={{ color: CASCA.rotulo }}
        >
          Dia a dia
        </div>
        <ul className="space-y-1">
          {PRIMARIOS.map((item) => {
            const grupoAtivo = itemAtivo(item, pathname);
            return (
              <li key={item.to}>
                <ItemLateral item={item} ativo={grupoAtivo} badge={badgeDe(item.to)} />
                {/* "Treino do dia" aninhado sob Prescrever quando o profissional
                    está nesse fluxo, como no protótipo. */}
                {grupoAtivo && item.children && item.children.length > 0 && (
                  <ul className="mt-1 space-y-1 pl-5">
                    {item.children.map((filho) => (
                      <li key={filho.to}>
                        <FilhoLateral filho={filho} ativo={pathname === filho.to} />
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>

        <div
          className="px-3 pb-2 pt-5 text-2xs font-semibold uppercase tracking-[0.14em]"
          style={{ color: CASCA.rotulo }}
        >
          Mais
        </div>
        {/* Três portas, e nada mais em repouso. Os filhos aparecem indentados só
            quando o grupo é o lugar onde o usuário está: assim a lateral tem três
            linhas de referência (como no desenho) sem nenhum destino virar órfão.
            O filho acende sozinho; o pai acende como grupo que o contém. */}
        <ul className="space-y-1 pb-4">
          {MAIS.map((item) => {
            const grupoAtivo = itemAtivo(item, pathname);
            return (
              <li key={item.to}>
                <ItemLateral item={item} ativo={grupoAtivo} anel hint={item.hint} />
                {grupoAtivo && item.children && item.children.length > 0 && (
                  <ul className="mt-1 space-y-1 pl-5">
                    {item.children.map((filho) => (
                      <li key={filho.to}>
                        <FilhoLateral filho={filho} ativo={pathname === filho.to} />
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex-1" />

      <CardFundador />
      <RodapeUsuario />
    </aside>
  );
}

/**
 * O card do plano fundador no rodapé da lateral, como no protótipo, com os
 * NÚMEROS REAIS de planos.ts (nunca um "7 de 10" decorativo). Enquanto a fase
 * fundador estiver aberta ele mostra as vagas ocupadas; quando as 30 fecharem
 * (ou a fase acabar), remova o card junto com a oferta da landing.
 */
function CardFundador() {
  const ocupadas = VAGAS_FUNDADOR_OCUPADAS;
  const total = VAGAS_FUNDADOR;
  const pct = Math.max(4, Math.round((ocupadas / total) * 100));
  return (
    <div
      className="relative mx-3 mb-2 rounded-card border p-3.5"
      style={{ background: "linear-gradient(135deg,#13233B,#0F1B30)", borderColor: CASCA.borda }}
    >
      <p className="m-0 text-2xs font-semibold uppercase tracking-[0.12em]" style={{ color: "#7FE3D8" }}>
        Plano fundador
      </p>
      <p className="m-0 mt-1.5 text-[13px] leading-snug" style={{ color: CASCA.tinta2 }}>
        Alunos ilimitados e preço travado.
      </p>
      <div className="mt-2.5 h-[5px] overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,.08)" }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: "linear-gradient(90deg,#14B3BA,#7FE3D8)" }}
        />
      </div>
      <p className="m-0 mt-1.5 text-xs" style={{ color: CASCA.tinta3 }}>
        {ocupadas} de {total} fundadores ·{" "}
        <a href="/#preco" target="_blank" rel="noreferrer" className="font-semibold" style={{ color: "#F0B429" }}>
          convide um colega
        </a>
      </p>
    </div>
  );
}

/** Uma linha da lateral: PONTO, rótulo e o contador. O ATIVO é o véu claro
 *  translúcido com o ponto âmbar aceso, vocabulário do protótipo; os itens do
 *  "Mais" usam um ANEL vazado no lugar do ponto cheio. */
function ItemLateral({
  item,
  ativo,
  badge,
  anel,
  hint,
}: {
  item: { to: string; label: string; short?: string };
  ativo: boolean;
  badge?: { n: number; tom: "neutro" | "atencao" | "urgente" };
  anel?: boolean;
  hint?: string;
}) {
  return (
    <Link
      to={item.to}
      title={hint}
      aria-current={ativo ? "page" : undefined}
      className={cn(
        "flex min-h-[44px] items-center gap-3 rounded-control px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        anel && !ativo ? "font-medium" : "font-semibold",
        !ativo && "hover:bg-[var(--casca-hover)] hover:text-[var(--casca-tinta)]",
      )}
      style={
        ativo
          ? { background: CASCA.ativoFundo, color: CASCA.ativoTinta }
          : { color: anel ? CASCA.tinta3 : CASCA.tinta2 }
      }
    >
      <span
        aria-hidden
        className="h-2 w-2 shrink-0 rounded-full"
        style={
          ativo
            ? { background: CASCA.ponto }
            : anel
              ? { border: `1.5px solid ${CASCA.rotulo}` }
              : { background: CASCA.pontoInativo }
        }
      />
      {/* A lateral tem 248px: cabe o rótulo inteiro, que é o que nav.ts declara. O
          `short` é da barra de 320px e continua lá embaixo, onde faz sentido. */}
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {badge && <BadgeLateral n={badge.n} tom={badge.tom} rotulo={item.label} />}
    </Link>
  );
}

/** Um filho da lateral: mesma linha, um degrau abaixo e um ponto menor, como o
 *  "Treino do dia" aninhado do protótipo. Alvo de 40px, confortável em desktop. */
function FilhoLateral({
  filho,
  ativo,
}: {
  filho: { to: string; label: string };
  ativo: boolean;
}) {
  return (
    <Link
      to={filho.to}
      aria-current={ativo ? "page" : undefined}
      className={cn(
        "flex min-h-[40px] items-center gap-2.5 rounded-control px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        !ativo && "hover:bg-[var(--casca-hover)] hover:text-[var(--casca-tinta)]",
      )}
      style={ativo ? { background: CASCA.ativoFundo, color: CASCA.ativoTinta } : { color: CASCA.tinta3 }}
    >
      <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
      <span className="min-w-0 flex-1 truncate">{filho.label}</span>
    </Link>
  );
}

/** O contador ao lado do destino. O protótipo pinta o badge de âmbar sólido; o
 *  vermelho fica para o que é URGENTE (semáforo vencido), com a tinta escura
 *  que passa AA sobre os dois preenchimentos. */
function BadgeLateral({
  n,
  tom,
  rotulo,
}: {
  n: number;
  tom: "neutro" | "atencao" | "urgente";
  rotulo: string;
}) {
  const estilo =
    tom === "urgente"
      ? { background: "#E5484D", color: "#0B1628" }
      : tom === "atencao"
        ? { background: "#E8A317", color: "#0B1628" }
        : { background: "rgba(255,255,255,.1)", color: CASCA.tinta2 };
  return (
    <span
      className="tabular grid h-6 min-w-[24px] shrink-0 place-items-center rounded-full px-1.5 text-2xs font-bold"
      style={estilo}
    >
      {n}
      <span className="sr-only"> em {rotulo}</span>
    </span>
  );
}

/** Rodapé da lateral: quem está logado e a saída. */
function RodapeUsuario() {
  const { name, plan, cref, fotoDataUrl } = useUser();
  const cloud = useCloudAuth();
  const navigate = useNavigate();
  const [aberto, setAberto] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!aberto) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setAberto(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [aberto]);

  const sair = async () => {
    if (cloud.configured) await signOut();
    else {
      encerrarSessao();
      window.location.reload();
    }
  };

  return (
    <div ref={ref} className="relative border-t px-3 py-3" style={{ borderColor: CASCA.borda }}>
      <button
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        aria-haspopup="menu"
        className="flex min-h-[48px] w-full items-center gap-3 rounded-card px-2 text-left"
      >
        {/* A FOTO, quando existe. O rodapé mostrava as iniciais mesmo com foto de
            perfil carregada em Configurações: quem subiu a própria foto via um "P"
            genérico e concluía, com razão, que o upload não tinha funcionado. */}
        {fotoDataUrl ? (
          <img
            src={fotoDataUrl}
            alt=""
            className="h-9 w-9 shrink-0 rounded-full object-cover"
            style={{ boxShadow: `0 0 0 1px ${CASCA.borda}` }}
          />
        ) : (
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold"
            style={{ background: "var(--primary)", color: "var(--on-primary)" }}
          >
            {iniciaisDe(name || "Profissional")}
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold" style={{ color: CASCA.tinta }}>
            {name || "Seu perfil"}
          </span>
          <span className="block truncate text-2xs" style={{ color: CASCA.tinta3 }}>
            {planLabel[plan]}
            {cref ? ` · CREF ${cref}` : ""}
          </span>
        </span>
        <MoreHorizontal className="h-4 w-4 shrink-0" style={{ color: CASCA.tinta2 }} aria-hidden />
      </button>

      {aberto && (
        <div
          role="menu"
          className="absolute inset-x-3 bottom-[calc(100%-0.25rem)] z-50 rounded-card border border-border bg-surface p-1.5 shadow-overlay"
        >
          {/* Conta e ajuda vivem aqui, e só aqui: era o segundo lugar de
              "Configurações" (o primeiro era a lista de destinos) e é onde todo
              mundo procura suporte. A lista vem de nav.ts para a busca global e o
              check:menu enxergarem os mesmos itens que o menu desenha. */}
          {CONTA.map((item) => (
            <button
              key={item.to}
              role="menuitem"
              onClick={() => {
                setAberto(false);
                navigate(item.to);
              }}
              className="flex min-h-[40px] w-full items-center rounded-full px-2.5 text-sm font-semibold text-ink hover:bg-surface-soft"
            >
              {item.label}
            </button>
          ))}
          <button
            role="menuitem"
            onClick={() => void sair()}
            className="flex min-h-[40px] w-full items-center rounded-full px-2.5 text-sm font-semibold text-ink-2 hover:bg-surface-soft hover:text-ink"
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * A barra superior ficou com o que é FERRAMENTA, não navegação: busca, a prévia
 * do app do aluno, o sino e a ação primária de cadastrar. Os destinos moraram na
 * lateral (e, no mobile, na barra inferior).
 */
function Topbar() {
  const [busca, setBusca] = React.useState(false);
  const { pathname } = useLocation();
  const { alunos, avaliacoes, prescricoes, planos, liberacoes, execucoes, declaracoes } = useAlunos();
  const ctx: CicloCtx = { avaliacoes, prescricoes, planos, liberacoes, execucoes, declaracoes };
  const previa = alunoParaPrevia(alunos, ctx);
  const titulo = tituloDaRota(pathname);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/85 backdrop-blur">
      <div className="flex h-16 w-full items-center gap-2 px-3 md:gap-3 md:px-6">
        {/*
          NO MOBILE, A BARRA DIZ ONDE VOCÊ ESTÁ (protótipo mobile de 09/09/2026).
          No desktop a lateral responde isso com o item aceso; no celular ela não existe, e
          a barra trazia só a marca, então a tela não se identificava. Agora vem o pino, a
          marca como sobrelinha e o NOME DA TELA, da mesma tabela que nomeia a aba do
          navegador (uma fonte só para os dois).
        */}
        <Link
          to="/dashboard"
          aria-label="Mapa da Prescrição, ir para Meu dia"
          className="flex min-w-0 flex-1 items-center gap-2.5 lg:hidden"
        >
          <Logo showWord={false} />
          <span className="min-w-0">
            <span className="block text-2xs font-semibold uppercase leading-none tracking-[0.12em] text-ink-3">
              Mapa da Prescrição
            </span>
            <b className="block truncate font-display text-base font-bold tracking-[-0.02em] text-ink">
              {titulo ?? "Meu dia"}
            </b>
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 md:block md:max-w-xl">
          <GlobalSearch />
        </div>
        <button
          onClick={() => setBusca((v) => !v)}
          aria-label="Buscar"
          aria-expanded={busca}
          className="grid h-11 w-11 place-items-center rounded-control text-ink-2 hover:bg-surface-soft md:hidden"
        >
          <Search className="h-[18px] w-[18px]" />
        </button>

        <div className="ml-auto flex shrink-0 items-center gap-1 md:gap-2">
          {previa && (
            <Link
              to={`/alunos/${previa.id}/preview`}
              className="hidden h-10 items-center gap-2 rounded-control border border-border bg-surface px-3.5 text-sm font-semibold text-ink-2 transition-colors hover:text-ink lg:inline-flex"
            >
              <Eye className="h-[18px] w-[18px]" aria-hidden /> Ver como aluno
            </Link>
          )}
          {/*
            O "Mais" saiu daqui. Ele existia na barra superior para o mobile, onde não há
            lateral, mas a barra INFERIOR passou a ter o próprio "Mais" (6º slot), e os dois
            conviviam na mesma tela abrindo a mesma folha. Duas portas para o mesmo lugar,
            a dois centímetros uma da outra.
          */}
          <NotificationsMenu />
          <Link to="/alunos?novo=1" className={cn(buttonClasses("primary", "sm"), "hidden sm:inline-flex")}>
            <Plus className="h-4 w-4" /> Cadastrar aluno
          </Link>
        </div>
      </div>

      {busca && (
        <div className="border-t border-border px-3 pb-3 pt-2 md:hidden">
          <GlobalSearch />
        </div>
      )}
    </header>
  );
}

/**
 * "Mais" no MOBILE: folha de baixo com os destinos que não cabem na barra
 * inferior de 5. No desktop ele não existe, porque a lateral já lista tudo.
 */
/**
 * "Mais" existe em duas superfícies porque o gatilho vivia SÓ dentro da Topbar, e a Topbar
 * só renderiza no Meu dia. Fora dele, no celular, ficavam inalcançáveis Estudar, Laboratório
 * Visual, Protocolos, Comparador, Consultar, Grupos Especiais, Ajuda, Configurações e o
 * próprio SAIR. Num produto usado entre atendimentos, isso é a maior parte das sessões.
 * A folha é a mesma; o que muda é só a casca do botão.
 */
function MaisMenu({ variante = "topbar" }: { variante?: "topbar" | "barra-inferior" }) {
  const [open, setOpen] = React.useState(false);
  const { pathname } = useLocation();
  const botaoRef = React.useRef<HTMLButtonElement>(null);
  const cloud = useCloudAuth();
  const sairDaConta = async () => {
    if (cloud.configured) await signOut();
    else {
      encerrarSessao();
      window.location.reload();
    }
  };

  // Fecha ao trocar de rota (o destino já foi alcançado).
  React.useEffect(() => setOpen(false), [pathname]);

  React.useEffect(() => {
    if (!open) return;
    // Esc fecha E DEVOLVE O FOCO ao botão, senão o foco cai no início da página.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      botaoRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const algumAtivo = MAIS.some((i) => itemAtivo(i, pathname));

  return (
    <>
      <button
        ref={botaoRef}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "transition-colors lg:hidden",
          variante === "barra-inferior"
            ? "flex min-h-[56px] min-w-0 flex-1 flex-col items-center justify-center gap-1.5 px-1 py-2 text-2xs font-semibold leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
            : "inline-flex h-10 items-center gap-1.5 rounded-control px-3 text-sm font-semibold " +
              (algumAtivo ? "bg-ink text-surface" : "text-ink-2 hover:bg-surface-soft hover:text-ink"),
        )}
        style={
          variante === "barra-inferior"
            ? { color: algumAtivo || open ? CASCA.ativoTinta : CASCA.tinta2 }
            : undefined
        }
      >
        {variante === "barra-inferior" ? (
          <>
            <span
              aria-hidden
              className="h-1 w-[22px] rounded-full transition-colors"
              style={{ background: algumAtivo || open ? CASCA.ponto : CASCA.pontoInativo }}
            />
            <span className="max-w-full">Mais</span>
          </>
        ) : (
          <>
            <MoreHorizontal className="h-[18px] w-[18px]" aria-hidden />
            <span className="hidden sm:inline">Mais</span>
          </>
        )}
      </button>

      {/* Folha de baixo POR PORTAL. A barra superior tem backdrop-blur, e um
          ancestral com backdrop-filter vira bloco de contenção de
          `position: fixed`: sem o portal a folha ancorava dentro do cabeçalho de
          64px em vez do rodapé da tela (a mesma armadilha do popover de métrica). */}
      {open &&
        createPortal(
          <>
            <div
              aria-hidden
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden"
            />
            <div
              role="menu"
              aria-label="Mais destinos"
              className="fixed inset-x-0 bottom-0 z-50 max-h-[80dvh] overflow-y-auto rounded-t-card border-t border-border bg-surface p-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] shadow-overlay lg:hidden"
            >
              <div className="px-2.5 pb-1 pt-1.5 text-2xs font-semibold uppercase tracking-wider text-ink-2">
                Mais destinos
              </div>
              {/* No mobile a folha lista os destinos e os FILHOS logo abaixo do pai,
                  mais a conta e a ajuda: aqui não existe rodapé de usuário para
                  abrigá-las, e destino sem porta é destino perdido. */}
              <ul className="space-y-0.5">
                {[...MAIS.flatMap((i) => [i, ...(i.children ?? []).map((c) => ({ ...c, filho: true }))]), ...CONTA].map((item: any) => {
                  const ativo = item.filho ? pathname === item.to : itemAtivo(item, pathname);
                  return (
                    <li key={item.to} className={item.filho ? "pl-6" : undefined}>
                      <Link
                        to={item.to}
                        aria-current={ativo ? "page" : undefined}
                        className={cn(
                          "flex min-h-[44px] items-start gap-3 rounded-control px-2.5 py-2 transition-colors",
                          ativo ? "bg-surface-soft" : "hover:bg-surface-soft",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full",
                            ativo ? "bg-ink text-surface" : "bg-surface-mute text-ink-2",
                          )}
                        >
                          <item.icon className="h-[18px] w-[18px]" aria-hidden />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-ink">{item.label}</span>
                          {item.hint && <span className="block text-xs leading-tight text-ink-2">{item.hint}</span>}
                        </span>
                      </Link>
                    </li>
                  );
                })}
                <li>
                  <button
                    onClick={() => void sairDaConta()}
                    className="flex min-h-[44px] w-full items-start gap-3 rounded-card px-2.5 py-2 text-left transition-colors hover:bg-surface-soft"
                  >
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-mute text-ink-2">
                      <LogOut className="h-[18px] w-[18px]" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-ink">Sair</span>
                      <span className="block text-xs leading-tight text-ink-2">
                        Encerra a sessão neste aparelho.
                      </span>
                    </span>
                  </button>
                </li>
              </ul>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}

/**
 * O BOTÃO FLUTUANTE DE CADASTRAR ALUNO (protótipo mobile de 09/09/2026).
 *
 * No celular a ação primária do produto ficava escondida: a barra superior só mostra
 * "Cadastrar aluno" a partir de sm, e abaixo disso ela sumia inteira. O botão âmbar resolve
 * isso onde a ação de fato cabe, que é onde se olha para a carteira: o Meu dia e a lista de
 * alunos. Em qualquer outra tela ele não aparece, porque ali a ação primária é outra e um
 * botão flutuante permanente vira mobília por cima do conteúdo.
 *
 * Ele fica acima da barra inferior (bottom-[86px]) para não cobrir os destinos.
 */
function BotaoCadastrarAluno() {
  const { pathname } = useLocation();
  // Só nas duas telas da carteira, e nunca sobre a ficha de um aluno (/alunos/:id).
  const cabe = pathname === "/dashboard" || pathname === "/alunos";
  if (!cabe) return null;
  return (
    <Link
      to="/alunos?novo=1"
      aria-label="Cadastrar aluno"
      className="fixed bottom-[86px] right-4 z-30 grid place-items-center rounded-card lg:hidden"
      style={{
        width: 52,
        height: 52,
        background: "var(--warning-fill)",
        color: "var(--on-warning-fill)",
        boxShadow: "0 14px 28px -12px rgba(232,163,23,.8)",
      }}
    >
      <Plus className="h-6 w-6" aria-hidden />
    </Link>
  );
}

/**
 * Barra inferior do mobile: os MESMOS 5 primários da barra superior (identidade
 * referencial em nav.ts), na ordem do ciclo do cuidado, à mão com o polegar.
 * SEM truncate no rótulo: overflow aqui é bug visível de propósito, conferido a
 * 320px. O ativo se vê pela FORMA (pílula atrás do ícone), não só pela cor.
 */
function BottomBar() {
  const { pathname } = useLocation();
  return (
    <nav
      aria-label="Atalhos do dia"
      className="fixed inset-x-0 bottom-0 z-30 flex border-t pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      style={{ background: "rgba(11,22,40,.96)", borderColor: CASCA.borda }}
    >
      {BOTTOM.map((item) => {
        const ativo = itemAtivo(item, pathname);
        return (
          <Link
            key={item.to}
            to={item.to}
            aria-current={ativo ? "page" : undefined}
            className={cn(
              "flex min-h-[56px] min-w-0 flex-1 flex-col items-center justify-center gap-1.5 px-1 py-2 text-2xs font-semibold leading-none transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
            )}
            style={{ color: ativo ? CASCA.ativoTinta : CASCA.tinta2 }}
          >
            {/* O indicador do protótipo: uma barra de 4px acesa em âmbar no ativo. */}
            <span
              aria-hidden
              className="h-1 w-[22px] rounded-full transition-colors"
              style={{ background: ativo ? CASCA.ponto : CASCA.pontoInativo }}
            />
            <span className="max-w-full">{item.short ?? item.label}</span>
          </Link>
        );
      })}
      {/* Sexto item: o desenho da casca sempre foi "5 destinos mais Mais", e no celular
          era justamente o "Mais" que faltava fora do Meu dia. */}
      <MaisMenu variante="barra-inferior" />
    </nav>
  );
}

/**
 * O sino mostra O QUE ACONTECEU COM OS ALUNOS, tudo derivado (src/lib/notificacoes.ts).
 * Antes ele listava o histórico de ESTUDO (`useProgress.activities`): o
 * profissional abria esperando "o Pedro ficou sem liberação" e via "você
 * concluiu uma aula".
 */
function NotificationsMenu() {
  const alunos = useAlunos((s) => s.alunos);
  const planos = useAlunos((s) => s.planos);
  const liberacoes = useAlunos((s) => s.liberacoes);
  const sessaoFeedbacks = useAlunos((s) => s.sessaoFeedbacks);
  const [open, setOpen] = React.useState(false);
  // "Lidas até": o carimbo de quando o sino foi aberto pela última vez. Como o
  // id da notificação é determinístico e o `ts` é o do fato, comparar por tempo
  // basta e não precisa guardar lista de ids.
  const [seenAt, setSeenAt] = React.useState<number>(() =>
    Number(localStorage.getItem("pi-notif-seen") || 0),
  );
  const ref = React.useRef<HTMLDivElement>(null);

  const itens = React.useMemo(
    () => notificacoes({ alunos, planos, liberacoes, sessaoFeedbacks }),
    [alunos, planos, liberacoes, sessaoFeedbacks],
  );
  const unseen = itens.filter((n) => n.ts > seenAt).length;

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const openMenu = () => {
    setOpen((o) => !o);
    const now = Date.now();
    setSeenAt(now);
    localStorage.setItem("pi-notif-seen", String(now));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={openMenu}
        aria-label={`Notificações${unseen ? ` (${unseen} novas)` : ""}`}
        aria-expanded={open}
        className="relative grid h-10 w-10 place-items-center rounded-control border border-border bg-surface text-ink-2 transition-colors hover:text-ink"
      >
        <Bell className="h-[18px] w-[18px]" />
        {/* O contador é danger-fill (o vermelho de preenchimento da identidade),
            com a tinta escolhida para ele; era bg-cta com branco, herança do coral. */}
        {unseen > 0 && (
          <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-danger-fill px-1 text-2xs font-bold text-ink">
            {unseen}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[336px] max-w-[calc(100vw-1.5rem)] rounded-card border border-border bg-surface p-1.5 shadow-overlay">
          <div data-par-dado="cabecalho-com-escopo" className="flex items-center justify-between px-2 py-1.5">
            <span className="text-sm font-semibold text-ink">O que aconteceu</span>
            <span className="text-xs text-ink-2">Últimos 7 dias</span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {itens.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-3 py-8 text-center">
                <CheckCheck className="h-6 w-6 text-success" />
                <p className="text-sm text-ink-2">Você está em dia. Nada pendente por aqui.</p>
              </div>
            ) : (
              itens.map((n) => (
                <Link
                  key={n.id}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="flex gap-3 rounded-control px-2 py-2 hover:bg-surface-soft"
                >
                  {/* Filete de urgência à esquerda, na cor da família: o Design
                      System usa a borda de 4px para "esta linha pede atenção". */}
                  <span
                    className={cn(
                      "mt-0.5 w-1 shrink-0 self-stretch rounded-full",
                      n.tone === "danger" ? "bg-danger-fill" : n.tone === "warning" ? "bg-warning-fill" : "bg-analysis-fill",
                    )}
                  />
                  <div className="min-w-0">
                    <div className="text-sm leading-snug text-ink">{n.texto}</div>
                    <div className="tabular text-xs text-ink-2">{tempoRelativo(n.ts)}</div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
