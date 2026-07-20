import * as React from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Navigation,
  CalendarRange,
  FlaskConical,
  BookOpen,
  Library,
  History,
  ClipboardList,
  BarChart3,
  Settings,
  Crown,
  ChevronsLeft,
  X,
  PanelLeft,
  Bell,
  ChevronDown,
  Check,
  CheckCheck,
  Users,
  Briefcase,
  GraduationCap,
  HeartPulse,
  LifeBuoy,
  HelpCircle,
  ShieldCheck,
  Stethoscope,
  Search,
  Bookmark,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { GlobalSearch } from "@/components/app/GlobalSearch";
import { LoginGate } from "@/components/app/LoginGate";
import { CloudAuthGate } from "@/components/app/CloudAuthGate";
import { Toasts } from "@/components/app/Toasts";
import { sessaoAtiva, encerrarSessao } from "@/lib/auth";
import { useCloudAuth } from "@/lib/backend/cloudAuth";
import { signOut } from "@/lib/backend/supabaseAuth";
import { buttonClasses } from "@/components/ui/primitives";
import { specialGroups } from "@/data/specialGroups";
import { OBJETIVOS } from "@/lib/gps/engine";
import { marcarAtivacao } from "@/lib/ativacao";
import { useDialog } from "@/lib/useDialog";
import {
  useUI,
  useUser,
  useProgress,
  useMode,
  useAlunos,
  planLabel,
  type Plan,
  type AppMode,
} from "@/lib/store";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  // Prefixos extra que também acendem este item (ex.: "Estudar" acende nas
  // rotas irmãs de trilhas e mapa, que são abas da mesma porta).
  match?: string[];
  // Rótulo curto para a barra inferior do mobile (onde o espaço é apertado).
  short?: string;
};
// collapsible: entra no grupo recolhível "Mais recursos" (descoberta progressiva:
// o 1º acesso vê só o caminho do aha; o resto abre quando o usuário quiser).
type NavSection = { label?: string; items: NavItem[]; collapsible?: boolean };

// Navegação enxuta e agrupada: poucos destinos no topo (o trabalho do dia) e o
// resto em "Referência" / "Avançado" / "Sua conta".
const navByMode: Record<AppMode, NavSection[]> = {
  atender: [
    {
      // Os 5 destinos do dia a dia: onde estou, meus alunos, os dois níveis de
      // prescrição e o cuidado de segurança. O resto mora em "Mais".
      items: [
        { to: "/dashboard", label: "Painel", icon: LayoutDashboard, short: "Painel" },
        { to: "/alunos", label: "Alunos", icon: Users, short: "Alunos" },
        { to: "/gps", label: "Prescrever exercício", icon: Navigation, short: "Exercício" },
        { to: "/prescrever-treino", label: "Prescrever treino", icon: CalendarRange, short: "Treino" },
        { to: "/semaforo", label: "Semáforo", icon: ShieldCheck, short: "Semáforo" },
      ],
    },
    {
      label: "Ferramentas da sessão",
      collapsible: true,
      items: [
        { to: "/assessments", label: "Avaliações", icon: BarChart3 },
        { to: "/protocols", label: "Protocolos", icon: ClipboardList },
      ],
    },
    {
      label: "Referência",
      collapsible: true,
      items: [
        { to: "/special-groups", label: "Grupos Especiais", icon: HeartPulse },
        { to: "/movement-lab", label: "Laboratório Visual", icon: FlaskConical },
        { to: "/library", label: "Glossário", icon: Library },
      ],
    },
    {
      label: "Ajuda",
      collapsible: true,
      items: [
        { to: "/tutorial", label: "Tutoriais", icon: GraduationCap },
        { to: "/suporte", label: "Suporte", icon: LifeBuoy },
      ],
    },
    { label: "Sua conta", items: [{ to: "/account", label: "Configurações", icon: Settings }] },
  ],
  aprender: [
    {
      // 5 destinos: início, a porta única "Estudar" (disciplinas/trilhas/mapa em
      // abas), aplicar em casos, consultar e acompanhar o progresso.
      items: [
        { to: "/aprender", label: "Início", icon: LayoutDashboard, short: "Início" },
        {
          to: "/aprender/disciplinas",
          label: "Estudar",
          icon: Library,
          match: ["/tracks", "/aprender/mapa"],
          short: "Estudar",
        },
        { to: "/aprender/casos", label: "Casos de prescrição", icon: Stethoscope, short: "Casos" },
        { to: "/aprender/consulta", label: "Consulta rápida", icon: Search, short: "Consulta" },
        { to: "/aprender/progresso", label: "Meu progresso", icon: BarChart3, short: "Progresso" },
      ],
    },
    {
      label: "Conteúdo",
      collapsible: true,
      items: [
        { to: "/aprender/biblioteca", label: "Biblioteca científica", icon: BookOpen },
        { to: "/aprender/salvos", label: "Salvos", icon: Bookmark },
      ],
    },
    {
      label: "Referência",
      collapsible: true,
      items: [
        { to: "/special-groups", label: "Grupos Especiais", icon: HeartPulse },
        { to: "/movement-lab", label: "Laboratório Visual", icon: FlaskConical },
      ],
    },
    {
      label: "Ajuda",
      collapsible: true,
      items: [
        { to: "/tutorial", label: "Tutoriais", icon: GraduationCap },
        { to: "/suporte", label: "Suporte", icon: LifeBuoy },
      ],
    },
    { label: "Sua conta", items: [{ to: "/account", label: "Configurações", icon: Settings }] },
  ],
};

// Rotas exclusivas de cada modo (não compartilhadas). Ao trocar de modo, só
// redireciona à home do novo modo se a rota atual pertencer só ao modo que sai.
const ATENDER_ONLY = ["/alunos", "/assessments", "/protocols", "/gps", "/prescrever-treino", "/semaforo", "/dashboard"];
const APRENDER_ONLY = ["/aprender", "/tracks"];
const HOME_POR_MODO: Record<AppMode, string> = { atender: "/dashboard", aprender: "/aprender" };

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
  [/^\/semaforo/, "Semáforo de Liberação"],
  [/^\/special-groups/, "Grupos Especiais"],
  [/^\/movement-lab/, "Laboratório Visual"],
  [/^\/library/, "Glossário"],
  [/^\/assessments/, "Avaliações"],
  [/^\/protocols/, "Protocolos"],
  [/^\/comparador/, "Comparador"],
  [/^\/cases/, "Casos"],
  [/^\/tracks/, "Trilhas"],
  [/^\/favorites/, "Favoritos"],
  [/^\/history/, "Histórico"],
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
    // sessão ativa: segue para o app (a hidratação roda em segundo plano)
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
  const setMode = useMode((s) => s.setMode);
  const loadExamples = useAlunos((s) => s.loadExamples);
  const navigate = useNavigate();
  const dialogRef = useDialog<HTMLDivElement>(() => {});
  // Onboarding caso-primeiro: o gatilho de uso é situacional (o aluno com condição
  // chegou HOJE). Uma condição já vem escolhida para o primeiro caso cair direto no
  // fluxo que mostra o valor. A prescrição vem antes; o Semáforo aparece no resultado.
  const [caso, setCaso] = React.useState({ grupo: "hipertensao", objetivo: "Emagrecimento", nivel: "Iniciante" });

  const finish = () => {
    localStorage.setItem("pi-onboarded", "1");
    onDone();
  };
  const resolverCaso = () => {
    setMode("atender");
    marcarAtivacao("inicio");
    finish();
    const q = new URLSearchParams({ "primeiro-caso": "1", objetivo: caso.objetivo, nivel: caso.nivel });
    if (caso.grupo) q.set("grupo", caso.grupo);
    navigate(`/gps?${q.toString()}`);
  };
  const explorar = () => {
    setMode("atender");
    loadExamples();
    finish();
    navigate("/dashboard");
  };
  const irAprender = () => {
    setMode("aprender");
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

        <h2 className="font-display text-2xl font-bold text-ink">Vamos resolver um caso de verdade</h2>
        <p className="mx-auto mt-1 max-w-sm text-ink-2">
          Pense num aluno que você tem agora. Em poucos minutos você sai com a decisão documentada;
          não é demonstração, é o caso de verdade.
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
          Ver a decisão deste caso →
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

function Sidebar() {
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useUI();
  const { mode, setMode } = useMode();
  const navigate = useNavigate();
  const location = useLocation();
  const asideRef = React.useRef<HTMLElement>(null);
  const nav = navByMode[mode];
  // "Mais recursos" recolhido por padrão (fica só o caminho do aha à vista); a
  // preferência do usuário persiste depois que ele abre uma vez.
  const [maisAberto, setMaisAberto] = React.useState(
    () => typeof window !== "undefined" && localStorage.getItem("pi-nav-mais") === "1",
  );
  const toggleMais = () =>
    setMaisAberto((v) => {
      const next = !v;
      localStorage.setItem("pi-nav-mais", next ? "1" : "0");
      return next;
    });

  const changeMode = (m: AppMode) => {
    setMode(m);
    setMobileOpen(false);
    // Preserva a rota atual, exceto quando ela é exclusiva do modo que está saindo
    // (aí não faz sentido no novo contexto → vai para a home do novo modo).
    const exclusive = m === "atender" ? APRENDER_ONLY : ATENDER_ONLY;
    if (exclusive.some((prefix) => location.pathname.startsWith(prefix))) {
      navigate(HOME_POR_MODO[m]);
    }
  };

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

        <ModeSwitch mode={mode} onChange={changeMode} collapsed={collapsed && !mobileOpen} />

        <nav aria-label="Menu principal" className="flex-1 space-y-5 overflow-y-auto px-3 pb-4 pt-2">
          {nav.map((section, i) => {
            const iconOnly = collapsed && !mobileOpen;
            // No modo icon-only não há rótulos: mostra tudo (é só uma tira de ícones).
            // Fora dele, seções "collapsible" ficam sob o toggle "Mais recursos".
            const dentroDoMais = !!section.collapsible && !iconOnly;
            if (dentroDoMais && !maisAberto) {
              // Renderiza o toggle uma única vez, antes da primeira seção recolhível.
              const primeiraColl = !nav.slice(0, i).some((s) => s.collapsible);
              return primeiraColl ? <MaisRecursosToggle key="mais-toggle" aberto={maisAberto} onToggle={toggleMais} /> : null;
            }
            const showLabel = !!section.label && !iconOnly;
            const labelId = showLabel ? `navsec-${i}` : undefined;
            const primeiraColl = dentroDoMais && !nav.slice(0, i).some((s) => s.collapsible);
            return (
              <React.Fragment key={section.label ?? `sec-${i}`}>
                {primeiraColl && <MaisRecursosToggle aberto={maisAberto} onToggle={toggleMais} />}
                <div role={labelId ? "group" : undefined} aria-labelledby={labelId}>
                  {showLabel && (
                    <div id={labelId} className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
                      {section.label}
                    </div>
                  )}
                  <NavGroup items={section.items} collapsed={iconOnly} />
                </div>
              </React.Fragment>
            );
          })}
        </nav>

        {(!collapsed || mobileOpen) && (
          <div className="p-4">
            <div className="rounded-2xl gradient-brand p-4 text-white shadow-elevated">
              <div className="mb-2 flex items-center gap-2">
                <Crown className="h-4 w-4" />
                <span className="font-display font-bold">Plano Profissional</span>
              </div>
              <p className="mb-3 text-xs leading-relaxed text-white/85">
                Aproveite todos os recursos avançados da plataforma.
              </p>
              <Link
                to="/pricing"
                className="block rounded-control bg-white py-2 text-center text-sm font-semibold text-primary hover:bg-white/90"
              >
                Ver plano
              </Link>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

function ModeSwitch({
  mode,
  onChange,
  collapsed,
}: {
  mode: AppMode;
  onChange: (m: AppMode) => void;
  collapsed: boolean;
}) {
  if (collapsed) {
    const next: AppMode = mode === "atender" ? "aprender" : "atender";
    const Icon = mode === "atender" ? Briefcase : GraduationCap;
    return (
      <div className="px-3 pt-3">
        <button
          onClick={() => onChange(next)}
          title={`Modo: ${mode === "atender" ? "Atender" : "Aprender"} · clique para trocar`}
          aria-label="Alternar modo"
          className="grid h-10 w-full place-items-center rounded-xl bg-surface-soft text-primary hover:bg-primary-tint"
        >
          <Icon className="h-5 w-5" />
        </button>
      </div>
    );
  }
  const opts: { value: AppMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { value: "atender", label: "Atender", icon: Briefcase },
    { value: "aprender", label: "Aprender", icon: GraduationCap },
  ];
  return (
    <div className="px-3 pt-3">
      <div
        role="group"
        aria-label="Modo do aplicativo"
        className="grid grid-cols-2 gap-1 rounded-xl bg-surface-soft p-1"
      >
        {opts.map((o) => {
          const active = mode === o.value;
          const Icon = o.icon;
          return (
            <button
              key={o.value}
              aria-pressed={active}
              onClick={() => onChange(o.value)}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold transition-colors",
                active ? "bg-surface text-ink shadow-soft" : "text-ink-2 hover:text-ink",
              )}
            >
              <Icon className="h-4 w-4" />
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MaisRecursosToggle({ aberto, onToggle }: { aberto: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={aberto}
      className="flex w-full items-center justify-between rounded-control px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-ink-3 transition-colors hover:bg-surface-soft hover:text-ink-2"
    >
      <span>Mais recursos</span>
      <ChevronDown className={cn("h-4 w-4 transition-transform", aberto && "rotate-180")} />
    </button>
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
 * Barra inferior do mobile: os mesmos ~5 destinos primários do modo, sempre à
 * mão com o polegar. Some no desktop (lg+), onde a barra lateral cumpre o papel.
 * São links de rota com aria-current; o "Estudar" acende também nas rotas irmãs.
 */
function BottomBar() {
  const { mode } = useMode();
  const { pathname } = useLocation();
  const itens = navByMode[mode][0].items;
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
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
                "flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-medium leading-none transition-colors",
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
    <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-border bg-white/85 px-3 backdrop-blur md:gap-3 md:px-6">
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
          <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-cta px-1 text-[9px] font-bold text-white">
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
  const options: { value: Plan; label: string }[] = [
    { value: "free", label: "Free" },
    { value: "assinante", label: "Assinante" },
    { value: "admin", label: "Admin" },
  ];

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
          <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
            Plano (dev toggle)
          </div>
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => setPlan(o.value)}
              className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm text-ink hover:bg-surface-soft"
            >
              {o.label}
              {plan === o.value && <Check className="h-4 w-4 text-primary" />}
            </button>
          ))}
          <div className="my-1 border-t border-border" />
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
