import * as React from "react";
import { createPortal } from "react-dom";
import { Link, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Bell, ChevronDown, CheckCheck, MoreHorizontal, Search } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { GlobalSearch } from "@/components/app/GlobalSearch";
import { PRIMARIOS, MAIS, BOTTOM, itemAtivo } from "@/components/app/nav";
import { notificacoes } from "@/lib/notificacoes";
import { LoginGate } from "@/components/app/LoginGate";
import { CloudAuthGate } from "@/components/app/CloudAuthGate";
import { Toasts } from "@/components/app/Toasts";
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
    if (cloud.status === "loading") return <SplashCarregando />;
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
      <div className="flex min-h-screen w-full flex-col" {...(onboarding ? ({ inert: "" } as any) : {})}>
        <Topbar />
        <main className="mx-auto w-full min-w-0 max-w-[1400px] flex-1 p-4 pb-24 md:p-6 lg:p-8 lg:pb-10">
          <React.Suspense fallback={<RouteFallback />}>
            <Outlet />
          </React.Suspense>
        </main>
      </div>
      <BottomBar />
      {onboarding && <OnboardingGate onDone={() => setOnboarding(false)} />}
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
      "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
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
function Topbar() {
  const [busca, setBusca] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center gap-2 px-3 md:gap-3 md:px-6">
        <Link to="/dashboard" aria-label="Mapa da Prescrição, ir para Meu dia" className="shrink-0">
          <Logo />
        </Link>

        <TopbarNav />

        <div className="ml-auto flex shrink-0 items-center gap-1">
          <div className="hidden w-full min-w-[260px] max-w-md xl:block">
            <GlobalSearch />
          </div>
          <button
            onClick={() => setBusca((v) => !v)}
            aria-label="Buscar"
            aria-expanded={busca}
            className="grid h-11 w-11 place-items-center rounded-full text-ink-2 hover:bg-surface-soft xl:hidden"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>
          <MaisMenu />
          <NotificationsMenu />
          <UserMenu />
        </div>
      </div>

      {busca && (
        <div className="border-t border-border px-3 pb-3 pt-2 md:px-6 xl:hidden">
          <GlobalSearch />
        </div>
      )}
    </header>
  );
}

/**
 * Os 5 primários como pílulas, com o ativo em INK SÓLIDO (literal do Design
 * System: a ação e o lugar atual são a tinta escura, e o azul fica reservado ao
 * pino da rota e ao anel de foco). Some no mobile, onde a barra inferior faz o
 * mesmo papel com os mesmos 5 itens.
 */
function TopbarNav() {
  const { pathname } = useLocation();
  return (
    <nav aria-label="Menu principal" className="hidden min-w-0 items-center gap-1 lg:flex">
      {PRIMARIOS.map((item) => {
        const ativo = itemAtivo(item, pathname);
        return (
          <Link
            key={item.to}
            to={item.to}
            aria-current={ativo ? "page" : undefined}
            className={cn(
              "inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-full px-3.5 text-sm font-semibold transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
              ativo ? "bg-ink text-surface" : "text-ink-2 hover:bg-surface-soft hover:text-ink",
            )}
          >
            <item.icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
            <span className="hidden xl:inline">{item.label}</span>
            <span className="xl:hidden">{item.short ?? item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * "Mais": popover no desktop, folha de baixo no mobile (é onde o polegar
 * alcança). Toda opção traz a descrição de uma linha que o Design System pede,
 * porque um menu de 8 destinos sem descrição obriga a abrir para descobrir.
 */
function MaisMenu() {
  const [open, setOpen] = React.useState(false);
  const { pathname } = useLocation();
  const ref = React.useRef<HTMLDivElement>(null);
  const botaoRef = React.useRef<HTMLButtonElement>(null);

  // Fecha ao trocar de rota (o destino já foi alcançado).
  React.useEffect(() => setOpen(false), [pathname]);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const alvo = e.target as Node;
      if (ref.current?.contains(alvo)) return;
      // A folha do mobile mora num PORTAL, fora deste ref: sem esta checagem o
      // primeiro toque dentro dela fecharia o menu antes do clique chegar ao link.
      if ((alvo as Element)?.closest?.('[role="menu"][aria-label="Mais destinos"]')) return;
      setOpen(false);
    };
    // Esc fecha E DEVOLVE O FOCO ao botão, senão o foco cai no início da página.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      botaoRef.current?.focus();
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const algumAtivo = MAIS.some((i) => itemAtivo(i, pathname));

  const lista = (
    <ul className="space-y-0.5">
      {MAIS.map((item) => {
        const ativo = itemAtivo(item, pathname);
        return (
          <li key={item.to}>
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
    </ul>
  );

  return (
    <div className="relative" ref={ref}>
      <button
        ref={botaoRef}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-colors",
          algumAtivo ? "bg-ink text-surface" : "text-ink-2 hover:bg-surface-soft hover:text-ink",
        )}
      >
        <MoreHorizontal className="h-[18px] w-[18px]" aria-hidden />
        <span className="hidden sm:inline">Mais</span>
      </button>

      {/* Desktop: popover ancorado no botão. */}
      {open && (
        <div
          role="menu"
          aria-label="Mais destinos"
          className="absolute right-0 top-[calc(100%+8px)] z-50 hidden w-[320px] rounded-card border border-border bg-surface p-2 shadow-overlay lg:block"
        >
          {lista}
        </div>
      )}

      {/* Mobile: folha de baixo, POR PORTAL. A barra superior tem backdrop-blur,
          e um ancestral com backdrop-filter vira bloco de contenção de
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
              {lista}
            </div>
          </>,
          document.body,
        )}
    </div>
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
