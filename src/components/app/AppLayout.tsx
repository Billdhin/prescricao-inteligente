import * as React from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
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
  Search,
  Bell,
  MessageCircle,
  ChevronDown,
  Check,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useUI, useUser, planLabel, type Plan } from "@/lib/store";
import { cn } from "@/lib/utils";

const primary = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/gps", label: "GPS da Prescrição", icon: Navigation },
  { to: "/movement-lab", label: "Laboratório Visual", icon: FlaskConical },
  { to: "/cases", label: "Casos", icon: BookOpen },
  { to: "/tracks", label: "Trilhas", icon: RouteIcon },
  { to: "/library", label: "Biblioteca", icon: Library },
];

const secondary = [
  { to: "/favorites", label: "Favoritos", icon: Star },
  { to: "/history", label: "Histórico", icon: History },
  { to: "/protocols", label: "Protocolos", icon: ClipboardList },
  { to: "/assessments", label: "Avaliações", icon: BarChart3 },
  { to: "/account", label: "Configurações", icon: Settings },
];

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

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-4">
          <NavGroup items={primary} collapsed={collapsed && !mobileOpen} />
          {(!collapsed || mobileOpen) && (
            <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
              Sua conta
            </div>
          )}
          <NavGroup items={secondary} collapsed={collapsed && !mobileOpen} />
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

      <div className="relative mx-auto w-full min-w-0 max-w-2xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
        <input
          placeholder="Buscar exercícios, músculos, casos..."
          aria-label="Buscar"
          className="h-11 w-full rounded-full border border-transparent bg-surface-soft pl-10 pr-4 text-sm outline-none focus-visible:border-primary/40 sm:pr-16"
        />
        <kbd className="tabular absolute right-3 top-1/2 hidden -translate-y-1/2 items-center rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-ink-2 sm:inline-flex">
          ⌘K
        </kbd>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1">
        <button
          aria-label="Notificações"
          className="relative hidden h-9 w-9 place-items-center rounded-full text-ink-2 hover:bg-surface-soft sm:grid"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-cta" />
        </button>
        <button
          aria-label="Mensagens"
          className="hidden h-9 w-9 place-items-center rounded-full text-ink-2 hover:bg-surface-soft sm:grid"
        >
          <MessageCircle className="h-4 w-4" />
        </button>
        <UserMenu />
      </div>
    </header>
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
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
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
