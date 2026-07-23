import * as React from "react";
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronsLeft,
  X,
  PanelLeft,
  Bell,
  ChevronDown,
  CheckCheck,
  HelpCircle,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { GlobalSearch } from "@/components/app/GlobalSearch";
import { NAV, BOTTOM, type NavItem } from "@/components/app/nav";
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
import { useUI, useUser, useProgress, useAlunos, planLabel, uid } from "@/lib/store";
import { iniciaisDe, type Aluno } from "@/data/alunos";
import type { Nivel } from "@/data/types";
import { cn } from "@/lib/utils";

// A navegação (NAV/BOTTOM) e seus tipos vivem em nav.ts: fonte única que a busca
// global também consome, para as duas nunca dessincronizarem.

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
  [/^\/dashboard/, "Painel"],
  [/^\/alunos\/./, "Aluno"],
  [/^\/alunos/, "Alunos"],
  [/^\/prescrever-treino/, "Prescrever treino"],
  [/^\/gps/, "Prescrever exercício"],
  [/^\/semaforo/, "Semáforo do dia"],
  [/^\/special-groups/, "Grupos Especiais"],
  [/^\/movement-lab/, "Laboratório Visual"],
  [/^\/consultar/, "Consultar"],
  [/^\/library/, "Consultar"],
  [/^\/assessments/, "Avaliações"],
  [/^\/protocols/, "Protocolos"],
  [/^\/comparador/, "Comparador"],
  [/^\/tracks/, "Trilhas"],
  [/^\/account/, "Configurações"],
  [/^\/tutorial/, "Tutoriais"],
  [/^\/suporte/, "Suporte"],
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
    document.title = t ? `${t} | Prescrição Inteligente` : "Prescrição Inteligente";
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
      <div className="flex min-h-screen w-full" {...(onboarding ? ({ inert: "" } as any) : {})}>
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="min-w-0 flex-1 p-4 pb-24 md:p-6 lg:p-8 lg:pb-8">
            <React.Suspense fallback={<RouteFallback />}>
              <Outlet />
            </React.Suspense>
          </main>
        </div>
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
  const [caso, setCaso] = React.useState({ grupo: "hipertensao", objetivo: "Emagrecimento", nivel: "Iniciante" });

  const finish = () => {
    localStorage.setItem("pi-onboarded", "1");
    onDone();
  };
  const resolverCaso = () => {
    marcarAtivacao("inicio");
    const agora = Date.now();
    const grupo = caso.grupo ? getSpecialGroup(caso.grupo) : undefined;
    const nome = grupo ? `Primeiro aluno (${grupo.nome})` : "Primeiro aluno";
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
      observacoes: "Aluno de exemplo do onboarding, para você percorrer a Linha do cuidado. Edite ou remova quando quiser.",
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

        <button onClick={resolverCaso} className={cn(buttonClasses("primary"), "mt-5 w-full")}>
          Criar este aluno →
        </button>
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

// Rota ativa dentro de um grupo: replica a semântica de acender do NavLink
// (match exato, prefixo de segmento ou os prefixos-irmãos de item.match). Serve
// para NUNCA esconder o grupo onde o usuário está, mesmo que ele esteja comprimido.
function rotaAtivaNoGrupo(items: NavItem[], pathname: string) {
  return items.some(
    (it) =>
      pathname === it.to ||
      pathname.startsWith(it.to + "/") ||
      (it.match?.some((p) => pathname.startsWith(p)) ?? false),
  );
}

function Sidebar() {
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen, gruposComprimidos, toggleGrupo } = useUI();
  const location = useLocation();
  const asideRef = React.useRef<HTMLElement>(null);

  // Fecha o drawer ao trocar de rota
  React.useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, setMobileOpen]);

  // Esc fecha + trava scroll do body no mobile
  React.useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    asideRef.current?.querySelector<HTMLElement>("a,button")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [mobileOpen, setMobileOpen]);

  return (
    <>
      <div
        aria-hidden
        onClick={() => setMobileOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        ref={asideRef}
        aria-label="Barra lateral"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-[100dvh] w-[280px] flex-col border-r border-border bg-surface shadow-elevated transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:sticky lg:top-0 lg:z-30 lg:h-screen lg:translate-x-0 lg:shadow-none",
          collapsed ? "lg:w-[76px]" : "lg:w-[260px]",
        )}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <Logo showWord={!collapsed || mobileOpen} />
          <button
            onClick={toggleCollapsed}
            aria-label="Colapsar menu"
            className="hidden rounded-md p-1.5 text-ink-2 hover:bg-surface-soft lg:inline-flex"
          >
            <ChevronsLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Fechar menu"
            className="rounded-md p-1.5 text-ink-2 hover:bg-surface-soft lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav aria-label="Menu principal" className="flex-1 space-y-5 overflow-y-auto px-3 pb-4 pt-4">
          {NAV.map((section, i) => {
            const iconOnly = collapsed && !mobileOpen;
            const showLabel = !!section.label && !iconOnly;
            const labelId = showLabel ? `navsec-${i}` : undefined;
            const regionId = `navsec-region-${i}`;
            // No rail (iconOnly) o colapso por grupo é ignorado: todos os ícones
            // ficam visíveis (previsível). Fora do rail, o grupo comprimível fecha
            // conforme a preferência salva, MAS nunca quando a rota ativa é dele.
            const ativoNoGrupo = rotaAtivaNoGrupo(section.items, location.pathname);
            const comprimivel = !!section.collapsible && !iconOnly && showLabel;
            const comprimido = comprimivel && gruposComprimidos.includes(section.label!) && !ativoNoGrupo;
            return (
              <div key={section.label ?? `sec-${i}`} role={labelId ? "group" : undefined} aria-labelledby={labelId}>
                {comprimivel ? (
                  <button
                    type="button"
                    onClick={() => toggleGrupo(section.label!)}
                    aria-expanded={!comprimido}
                    aria-controls={regionId}
                    className="mb-1 flex min-h-[44px] w-full items-center justify-between gap-2 rounded-lg px-3 text-2xs font-semibold uppercase tracking-wider text-ink-3 transition-colors hover:bg-surface-soft hover:text-ink-2"
                  >
                    <span id={labelId}>{section.label}</span>
                    <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", comprimido && "-rotate-90")} aria-hidden />
                  </button>
                ) : (
                  showLabel && (
                    <div id={labelId} className="mb-1 px-3 text-2xs font-semibold uppercase tracking-wider text-ink-3">
                      {section.label}
                    </div>
                  )
                )}
                <div id={regionId} hidden={comprimido}>
                  <NavGroup items={section.items} collapsed={iconOnly} />
                </div>
              </div>
            );
          })}
        </nav>

      </aside>
    </>
  );
}

function NavGroup({ items, collapsed }: { items: NavItem[]; collapsed: boolean }) {
  const { pathname } = useLocation();
  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        const forcado = item.match?.some((p) => pathname.startsWith(p)) ?? false;
        return (
          <li key={item.to}>
            <NavLink
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive || forcado
                    ? "bg-primary-tint text-primary"
                    : "text-ink-2 hover:bg-surface-soft hover:text-ink",
                )
              }
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Barra inferior do mobile: os 6 destinos do dia a dia (Hoje, Alunos, Avaliar,
 * Treino, Semáforo, Estudar), sempre à mão com o polegar. Some no desktop (lg+),
 * onde a barra lateral cumpre o papel. São links de rota com aria-current; o
 * "Estudar" acende também nas rotas irmãs.
 */
function BottomBar() {
  const { pathname } = useLocation();
  const itens = BOTTOM;
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-[#ffffff]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      {itens.map((item) => {
        const Icon = item.icon;
        const forcado = item.match?.some((p) => pathname.startsWith(p)) ?? false;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            aria-current={forcado ? "page" : undefined}
            className={({ isActive }) =>
              cn(
                "flex min-h-[56px] min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 py-2 text-2xs font-medium leading-none transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
                isActive || forcado ? "text-primary" : "text-ink-3 hover:text-ink-2",
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden />
            <span className="max-w-full truncate">{item.short ?? item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

function Topbar() {
  const { toggleMobile, toggleCollapsed } = useUI();

  const onMenu = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) toggleMobile();
    else toggleCollapsed();
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-border bg-surface/85 px-3 backdrop-blur md:gap-3 md:px-6">
      <button
        onClick={onMenu}
        aria-label="Alternar menu lateral"
        className="rounded-md p-2 text-ink-2 hover:bg-surface-soft"
      >
        <PanelLeft className="h-4 w-4" />
      </button>

      <GlobalSearch />

      <div className="ml-auto flex shrink-0 items-center gap-1">
        <Link
          to="/tutorial"
          aria-label="Ajuda e tutoriais"
          className="grid h-9 w-9 place-items-center rounded-full text-ink-2 hover:bg-surface-soft"
        >
          <HelpCircle className="h-4 w-4" />
        </Link>
        <NotificationsMenu />
        <UserMenu />
      </div>
    </header>
  );
}

function NotificationsMenu() {
  const activities = useProgress((s) => s.activities);
  const [open, setOpen] = React.useState(false);
  const [seenAt, setSeenAt] = React.useState<number>(() =>
    Number(localStorage.getItem("pi-notif-seen") || 0),
  );
  const ref = React.useRef<HTMLDivElement>(null);

  const unseen = activities.filter((a) => a.ts > seenAt).length;

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
        className="relative grid h-9 w-9 place-items-center rounded-full text-ink-2 hover:bg-surface-soft"
      >
        <Bell className="h-4 w-4" />
        {unseen > 0 && (
          <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-cta px-1 text-2xs font-bold text-white">
            {unseen}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-1.5rem)] rounded-card border border-border bg-surface p-1.5 shadow-elevated">
          <div className="flex items-center justify-between px-2 py-1.5">
            <span className="text-sm font-semibold text-ink">Notificações</span>
            <span className="text-xs text-ink-3">Atividade recente</span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {activities.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-3 py-8 text-center">
                <CheckCheck className="h-6 w-6 text-success" />
                <p className="text-sm text-ink-2">Você está em dia. Nada novo por aqui.</p>
              </div>
            ) : (
              activities.map((a) => (
                <div key={a.id} className="flex gap-3 rounded-lg px-2 py-2 hover:bg-surface-soft">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0">
                    <div className="text-sm text-ink">{a.label}</div>
                    <div className="tabular text-xs text-ink-3">{tempoRelativo(a.ts)}</div>
                  </div>
                </div>
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
        className="ml-1 flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-surface-soft md:pr-3"
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
              className="block w-full rounded-lg px-2 py-1.5 text-left text-sm text-ink hover:bg-surface-soft"
            >
              Sair da conta
            </button>
          ) : senhaHash ? (
            <button
              onClick={() => {
                encerrarSessao();
                window.location.reload();
              }}
              className="block w-full rounded-lg px-2 py-1.5 text-left text-sm text-ink hover:bg-surface-soft"
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
