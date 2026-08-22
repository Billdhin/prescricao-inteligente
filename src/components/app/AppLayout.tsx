import * as React from "react";
import { createPortal } from "react-dom";
import { Link, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Bell, ChevronDown, CheckCheck, MoreHorizontal, Search, Eye, Plus, LogOut } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
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
    const t = TITULOS_ROTA.find(([re]) => re.test(pathname))?.[1];
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
          {/* A barra global (busca, notificações, cadastrar) vive SÓ no Meu dia: é o
              painel do dia, onde faz sentido ter tudo à mão. Nas outras telas cada
              página é dona do próprio cabeçalho, como no desenho da tela do aluno. */}
          {pathname === "/dashboard" && <Topbar />}
          <main className="mx-auto w-full min-w-0 max-w-[1400px] flex-1 p-4 pb-24 md:p-6 lg:p-8 lg:pb-10">
            <ErrorBoundary chaveDeReset={pathname}>
              <React.Suspense fallback={<RouteFallback />}>
                <Outlet />
              </React.Suspense>
            </ErrorBoundary>
          </main>
        </div>
      </div>
      <BottomBar />
      {mostrarOnboarding && <OnboardingGate onDone={() => setOnboarding(false)} />}
      <Toasts />
    </div>
  );
}

/** Tela cheia enquanto o Supabase confere se há sessão ativa (login em nuvem). */
function SplashCarregando() {
  return (
    <div className="fixed inset-0 grid place-items-center bg-bg">
      <div className="flex flex-col items-center gap-3">
        <Logo />
        <div className="h-1 w-24 overflow-hidden rounded-full bg-surface-soft">
          <div className="h-full w-1/2 animate-pulse rounded-full gradient-brand" />
        </div>
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
 * A CASCA: uma barra superior, e só. A barra lateral (rail de ícones + drawer
 * mobile + grupos comprimíveis) saiu inteira: eram 3 estados de menu para o
 * mesmo menu, e a preferência de cada um ficava salva, então dois profissionais
 * viam produtos diferentes. Agora são 5 pílulas na linha e um "Mais" com os 8
 * destinos de referência, iguais para todo mundo.
 *
 * Abaixo de xl a busca vira botão com painel, porque a 1280px a linha não
 * comporta logo + 5 rótulos + Mais + campo de busca + sino + avatar.
 */
/**
 * A BARRA LATERAL, de volta por decisão do fundador (mockup de 28/07/2026).
 *
 * A rodada anterior tinha trocado a lateral por pílulas na barra superior. O
 * desenho novo devolve a lateral, e com duas coisas que a topbar não conseguia:
 * CONTADORES por destino (12 alunos, 2 para avaliar, 3 para liberar) e um card
 * de ação fixo no rodapé. Um menu que já diz quanto trabalho tem em cada porta
 * dispensa abrir porta por porta para descobrir.
 *
 * A lateral é ESCURA por decisão de contraste do design: ela é casca, não
 * conteúdo, e o papel claro do miolo fica com o trabalho. Os valores são fixos
 * (não seguem o tema claro/escuro do profissional) pelo mesmo motivo do app do
 * aluno: é uma superfície com identidade própria, verificada uma vez.
 *
 * Contraste medido sobre o navy #0D1524: o texto inativo #9DB2D6 dá 7,4:1 e o
 * ativo é papel sobre tinta (o inverso do miolo). Os dois passam AA com folga.
 */
const CASCA = {
  fundo: "#0D1524",
  fundoTopo: "#0A0D14",
  borda: "rgba(148,170,210,.12)",
  tinta: "#F2F6FC",
  tinta2: "#9DB2D6",
  ativoFundo: "#FFFDF9",
  ativoTinta: "#17202E",
} as const;

/** Largura da lateral. Vive aqui e no padding da coluna de conteúdo. */
function Sidebar() {
  const { pathname } = useLocation();
  const { alunos, avaliacoes, prescricoes, planos, liberacoes, execucoes } = useAlunos();
  const ctx: CicloCtx = { avaliacoes, prescricoes, planos, liberacoes, execucoes };
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
      style={{ background: CASCA.fundo, borderRight: `1px solid ${CASCA.borda}` }}
    >
      <Link
        to="/dashboard"
        aria-label="Mapa da Prescrição, ir para Meu dia"
        className="flex items-center gap-3 px-5 pb-5 pt-6"
      >
        <Logo showWord={false} />
        <span className="font-display text-base font-bold leading-tight" style={{ color: CASCA.tinta }}>
          Mapa da
          <br />
          Prescrição
        </span>
      </Link>

      <nav className="px-3">
        <ul className="space-y-1">
          {PRIMARIOS.map((item) => (
            <li key={item.to}>
              <ItemLateral item={item} ativo={itemAtivo(item, pathname)} badge={badgeDe(item.to)} />
            </li>
          ))}
        </ul>

        <div
          className="px-3 pb-2 pt-6 text-2xs font-bold uppercase tracking-[0.14em]"
          style={{ color: CASCA.tinta2 }}
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
                <ItemLateral item={item} ativo={grupoAtivo} />
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

      {/* Empurra o rodapé para baixo sem depender de altura fixa. A lateral fica
          com nav + rodapé e nada mais: os cartões "Este aluno" e "Semáforo do dia"
          moravam aqui e empurravam o conteúdo além da altura da tela, o que ligava
          um scroll feio na barra. O contexto do aluno agora vive na PRÓPRIA tela do
          aluno (ciclo do cuidado) e o semáforo já tem o destino com contador no menu. */}
      <div className="flex-1" />

      <RodapeUsuario />
    </aside>
  );
}

/**
 * "ESTE ALUNO": o contexto da lateral quando o profissional está dentro de um.
 *
 * Ele é DERIVADO da rota (`/alunos/:id`), não de um estado que alguma página
 * precise lembrar de setar e de limpar. Estado paralelo para dizer "onde estou"
 * é a receita conhecida do bloco que fica aceso na tela errada.
 *
 * O que ele mostra é a régua única do perfil (`completudeAluno`), a mesma que o
 * trilho de seções usa, e o que falta em palavras. E ele diz, em toda visita, que
 * perfil incompleto não impede avaliar: o gate duro é a avaliação, não o cadastro.
 */
function CardAlunoLateral({ alunos, pathname }: { alunos: Aluno[]; pathname: string }) {
  const id = pathname.match(/^\/alunos\/([^/]+)/)?.[1];
  const aluno = id ? alunos.find((a) => a.id === id) : undefined;
  if (!aluno) return null;

  const { pct, faltaTexto } = completudeAluno(aluno);
  const completo = !faltaTexto;
  const noPerfil = pathname.endsWith("/perfil");

  return (
    <div className="px-3 pb-1 pt-6">
      <div className="px-3 pb-2 text-2xs font-bold uppercase tracking-[0.14em]" style={{ color: CASCA.tinta2 }}>
        Este aluno
      </div>
      <Link
        to={noPerfil ? `/alunos/${aluno.id}` : `/alunos/${aluno.id}/perfil`}
        className="block rounded-card p-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        style={{ background: "rgba(148,170,210,.08)", border: `1px solid ${CASCA.borda}` }}
      >
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold"
            style={{ background: "var(--primary)", color: "var(--on-primary)" }}
          >
            {aluno.iniciais}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold" style={{ color: CASCA.tinta }}>
              {aluno.nome}
            </span>
            <span className="block truncate text-2xs" style={{ color: CASCA.tinta2 }}>
              {[aluno.idade ? `${aluno.idade} anos` : null, aluno.nivel.toLowerCase()].filter(Boolean).join(" · ")}
            </span>
          </span>
        </div>

        <div className="mt-3 flex items-baseline justify-between gap-2">
          <span className="text-2xs font-semibold" style={{ color: CASCA.tinta2 }}>
            Perfil
          </span>
          <span className="tabular text-xs font-bold" style={{ color: completo ? "#14B3BA" : CASCA.tinta }}>
            {pct}%
          </span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full" style={{ background: "rgba(148,170,210,.16)" }}>
          <div
            className="h-full rounded-full transition-[width] duration-300"
            style={{ width: `${pct}%`, background: completo ? "#14B3BA" : "var(--primary)" }}
          />
        </div>
        <p className="mt-2 text-2xs leading-relaxed" style={{ color: CASCA.tinta2 }}>
          {completo ? (
            noPerfil ? (
              "Perfil completo. Voltar para o aluno."
            ) : (
              "Perfil completo. Abrir para editar."
            )
          ) : (
            <>
              Falta: {faltaTexto}. Dá para{" "}
              <span className="font-bold" style={{ color: CASCA.tinta }}>
                avaliar já
              </span>
              .
            </>
          )}
        </p>
      </Link>
    </div>
  );
}

/** Uma linha da lateral: ícone, rótulo e o contador. O ATIVO é papel sólido com
 *  tinta escura, o inverso da lateral, que é a forma mais legível de dizer
 *  "você está aqui" numa superfície escura. */
function ItemLateral({
  item,
  ativo,
  badge,
}: {
  item: { to: string; label: string; short?: string; icon: React.ComponentType<{ className?: string }> };
  ativo: boolean;
  badge?: { n: number; tom: "neutro" | "atencao" | "urgente" };
}) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      aria-current={ativo ? "page" : undefined}
      className="flex min-h-[44px] items-center gap-3 rounded-card px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      style={
        ativo
          ? { background: CASCA.ativoFundo, color: CASCA.ativoTinta, boxShadow: "0 1px 3px rgba(13,21,36,.28)" }
          : { color: CASCA.tinta2 }
      }
    >
      <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
      <span className="min-w-0 flex-1 truncate">{item.short ?? item.label}</span>
      {badge && <BadgeLateral n={badge.n} tom={badge.tom} rotulo={item.short ?? item.label} />}
    </Link>
  );
}

/** Um filho da lateral: mesma linha, um degrau abaixo. Peso menor e ícone menor
 *  para a hierarquia se ler de relance, e alvo de 40px, que continua confortável
 *  num item secundário de desktop. */
function FilhoLateral({
  filho,
  ativo,
}: {
  filho: { to: string; label: string; icon: React.ComponentType<{ className?: string }> };
  ativo: boolean;
}) {
  const Icon = filho.icon;
  return (
    <Link
      to={filho.to}
      aria-current={ativo ? "page" : undefined}
      className="flex min-h-[40px] items-center gap-2.5 rounded-card px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      style={ativo ? { background: CASCA.ativoFundo, color: CASCA.ativoTinta } : { color: CASCA.tinta2 }}
    >
      <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
      <span className="min-w-0 flex-1 truncate">{filho.label}</span>
    </Link>
  );
}

/** O contador ao lado do destino. Cor por urgência, com o número sempre legível
 *  e um rótulo acessível que diz de que se trata (o número sozinho não diz). */
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
      ? { background: "var(--danger-fill)", color: "#17202E" }
      : tom === "atencao"
        ? { background: "var(--warning-tint)", color: "var(--warning)" }
        : { background: "rgba(148,170,210,.16)", color: CASCA.tinta2 };
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

/**
 * O cartão de ação no pé da lateral: quantos alunos ainda não têm o semáforo de
 * hoje e o botão para resolver. Some quando não há ninguém pendente, porque o
 * card existe para pedir uma ação, não para ocupar espaço.
 */
function CardSemaforoLateral({ quantos }: { quantos: number }) {
  if (quantos === 0) return null;
  return (
    <div className="px-3 pb-3">
      <div
        className="rounded-card p-4"
        style={{ background: "rgba(148,170,210,.08)", border: `1px solid ${CASCA.borda}` }}
      >
        <div className="flex items-center gap-1.5">
          <span aria-hidden className="flex gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            <span className="h-1.5 w-1.5 rounded-full bg-warning" />
            <span className="h-1.5 w-1.5 rounded-full bg-danger-fill" />
          </span>
          <span className="text-2xs font-semibold" style={{ color: CASCA.tinta2 }}>
            Semáforo do dia
          </span>
        </div>
        <div className="tabular mt-1 font-display text-lg font-bold" style={{ color: CASCA.tinta }}>
          {quantos} para liberar
        </div>
        <Link
          to="/semaforo"
          className="mt-3 grid h-10 place-items-center rounded-full text-sm font-bold"
          style={{ background: "var(--analysis-fill)", color: "var(--on-analysis-fill)" }}
        >
          Liberar agora
        </Link>
      </div>
    </div>
  );
}

/** Rodapé da lateral: quem está logado e a saída. */
function RodapeUsuario() {
  const { name, plan, fotoDataUrl } = useUser();
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
          <span className="block truncate text-2xs" style={{ color: CASCA.tinta2 }}>
            {planLabel[plan]}
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
  const { alunos, avaliacoes, prescricoes, planos, liberacoes, execucoes } = useAlunos();
  const ctx: CicloCtx = { avaliacoes, prescricoes, planos, liberacoes, execucoes };
  const previa = alunoParaPrevia(alunos, ctx);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/85 backdrop-blur">
      <div className="flex h-16 w-full items-center gap-2 px-3 md:gap-3 md:px-6">
        {/* A marca só aparece no mobile: em lg+ ela vive no topo da lateral. */}
        <Link to="/dashboard" aria-label="Mapa da Prescrição, ir para Meu dia" className="shrink-0 lg:hidden">
          <Logo />
        </Link>

        <div className="hidden min-w-0 flex-1 md:block md:max-w-md">
          <GlobalSearch />
        </div>
        <button
          onClick={() => setBusca((v) => !v)}
          aria-label="Buscar"
          aria-expanded={busca}
          className="grid h-11 w-11 place-items-center rounded-full text-ink-2 hover:bg-surface-soft md:hidden"
        >
          <Search className="h-[18px] w-[18px]" />
        </button>

        <div className="ml-auto flex shrink-0 items-center gap-1 md:gap-2">
          {previa && (
            <Link
              to={`/alunos/${previa.id}/preview`}
              className="hidden h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold text-ink-2 hover:bg-surface-soft hover:text-ink lg:inline-flex"
            >
              <Eye className="h-[18px] w-[18px]" aria-hidden /> Ver como aluno
            </Link>
          )}
          {/* O "Mais" segue existindo no mobile, onde não há lateral. */}
          <MaisMenu />
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
            ? "flex min-h-[56px] min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 py-2 text-2xs font-medium leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary " +
              (algumAtivo || open ? "text-ink" : "text-ink-2 hover:text-ink")
            : "inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold " +
              (algumAtivo ? "bg-ink text-surface" : "text-ink-2 hover:bg-surface-soft hover:text-ink"),
        )}
      >
        {variante === "barra-inferior" ? (
          <>
            <span
              className={cn(
                "grid h-6 w-12 place-items-center rounded-full transition-colors",
                (algumAtivo || open) && "bg-ink text-surface",
              )}
            >
              <MoreHorizontal className="h-5 w-5 shrink-0" aria-hidden />
            </span>
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
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      {BOTTOM.map((item) => {
        const Icon = item.icon;
        const ativo = itemAtivo(item, pathname);
        return (
          <Link
            key={item.to}
            to={item.to}
            aria-current={ativo ? "page" : undefined}
            className={cn(
              "flex min-h-[56px] min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 py-2 text-2xs font-medium leading-none transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
              ativo ? "text-ink" : "text-ink-2 hover:text-ink",
            )}
          >
            <span className={cn("grid h-6 w-12 place-items-center rounded-full transition-colors", ativo && "bg-ink text-surface")}>
              <Icon className="h-5 w-5 shrink-0" aria-hidden />
            </span>
            <span className="max-w-full">{item.short ?? item.label}</span>
          </Link>
        );
      })}
      {/* Sexto item: o desenho da casca sempre foi "5 pílulas mais Mais", e no celular
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
        className="relative grid h-11 w-11 place-items-center rounded-full text-ink-2 hover:bg-surface-soft"
      >
        <Bell className="h-[18px] w-[18px]" />
        {/* O contador é danger-fill (o vermelho de preenchimento da identidade),
            com a tinta escolhida para ele; era bg-cta com branco, herança do coral. */}
        {unseen > 0 && (
          <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-danger-fill px-1 text-2xs font-bold text-ink">
            {unseen}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[336px] max-w-[calc(100vw-1.5rem)] rounded-card border border-border bg-surface p-1.5 shadow-overlay">
          <div className="flex items-center justify-between px-2 py-1.5">
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
                      n.tone === "danger" ? "bg-danger-fill" : n.tone === "warning" ? "bg-warning" : "bg-analysis-fill",
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

function UserMenu() {
  const { name, plan, setPlan, fotoDataUrl, senhaHash } = useUser();
  const cloudConfigured = useCloudAuth((s) => s.configured);
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

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

  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("");

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Menu do usuário"
        aria-expanded={open}
        className="ml-1 flex min-h-[44px] items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-surface-soft md:pr-3"
      >
        {fotoDataUrl ? (
          <img src={fotoDataUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
        ) : (
          <span className="grid h-9 w-9 place-items-center rounded-full gradient-brand text-sm font-bold text-white">
            {initials}
          </span>
        )}
        <span className="hidden text-left leading-tight md:block">
          <span className="block text-sm font-semibold text-ink">{name}</span>
          <span className="block text-xs text-ink-2">{planLabel[plan]}</span>
        </span>
        <ChevronDown className="hidden h-4 w-4 text-ink-3 md:block" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 rounded-card border border-border bg-surface p-1.5 shadow-elevated">
          <Link to="/account" className="block rounded-lg px-2 py-1.5 text-sm text-ink hover:bg-surface-soft">
            Configurações
          </Link>
          {cloudConfigured ? (
            <button
              onClick={async () => {
                await signOut();
                window.location.reload();
              }}
              className="block w-full rounded-full px-2 py-1.5 text-left text-sm text-ink hover:bg-surface-soft"
            >
              Sair da conta
            </button>
          ) : senhaHash ? (
            <button
              onClick={() => {
                encerrarSessao();
                window.location.reload();
              }}
              className="block w-full rounded-full px-2 py-1.5 text-left text-sm text-ink hover:bg-surface-soft"
            >
              Sair (bloquear acesso)
            </button>
          ) : (
            <Link to="/" className="block rounded-lg px-2 py-1.5 text-sm text-ink hover:bg-surface-soft">
              Sair
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
