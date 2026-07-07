import * as React from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Navigation,
  FlaskConical,
  BookOpen,
  Route as RouteIcon,
  Library,
  Star,
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
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { GlobalSearch } from "@/components/app/GlobalSearch";
import {
  useUI,
  useUser,
  useProgress,
  useMode,
  planLabel,
  type Plan,
  type AppMode,
} from "@/lib/store";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: React.ComponentType<{ className?: string }> };

const navByMode: Record<AppMode, { primary: NavItem[]; secondary: NavItem[] }> = {
  atender: {
    primary: [
      { to: "/dashboard", label: "Painel", icon: LayoutDashboard },
      { to: "/decisao", label: "Decisão rápida", icon: Sparkles },
      { to: "/alunos", label: "Alunos", icon: Users },
      { to: "/special-groups", label: "Grupos Especiais", icon: HeartPulse },
      { to: "/gps", label: "GPS da Prescrição", icon: Navigation },
      { to: "/assessments", label: "Avaliações", icon: BarChart3 },
      { to: "/protocols", label: "Protocolos", icon: ClipboardList },
      { to: "/movement-lab", label: "Laboratório Visual", icon: FlaskConical },
      { to: "/library", label: "Biblioteca", icon: Library },
    ],
    secondary: [{ to: "/account", label: "Configurações", icon: Settings }],
  },
  aprender: {
    primary: [
      { to: "/dashboard", label: "Painel", icon: LayoutDashboard },
      { to: "/tracks", label: "Trilhas", icon: RouteIcon },
      { to: "/cases", label: "Casos", icon: BookOpen },
      { to: "/special-groups", label: "Grupos Especiais", icon: HeartPulse },
      { to: "/movement-lab", label: "Laboratório Visual", icon: FlaskConical },
      { to: "/library", label: "Biblioteca", icon: Library },
    ],
    secondary: [
      { to: "/favorites", label: "Favoritos", icon: Star },
      { to: "/history", label: "Histórico", icon: History },
      { to: "/account", label: "Configurações", icon: Settings },
    ],
  },
};

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

export function AppLayout() {
  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-bg">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="min-w-0 flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
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

  const changeMode = (m: AppMode) => {
    setMode(m);
    navigate("/dashboard");
    setMobileOpen(false);
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
        aria-label="Menu principal"
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

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-4 pt-2">
          <NavGroup items={nav.primary} collapsed={collapsed && !mobileOpen} />
          {(!collapsed || mobileOpen) && (
            <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
              Sua conta
            </div>
          )}
          <NavGroup items={nav.secondary} collapsed={collapsed && !mobileOpen} />
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
          title={`Modo: ${mode === "atender" ? "Atender" : "Aprender"} — clique para trocar`}
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

function NavGroup({
  items,
  collapsed,
}: {
  items: { to: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
  collapsed: boolean;
}) {
  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <li key={item.to}>
            <NavLink
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
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
  const { name, plan, setPlan } = useUser();
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
        <span className="grid h-9 w-9 place-items-center rounded-full gradient-brand text-sm font-bold text-white">
          {initials}
        </span>
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
          <Link to="/" className="block rounded-lg px-2 py-1.5 text-sm text-ink hover:bg-surface-soft">
            Sair
          </Link>
        </div>
      )}
    </div>
  );
}
