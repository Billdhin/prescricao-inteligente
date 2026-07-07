import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  FlaskConical,
  BookOpen,
  Route as RouteIcon,
  Library as LibraryIcon,
  Navigation,
  LayoutDashboard,
  Star,
  History as HistoryIcon,
  Settings,
  CornerDownLeft,
} from "lucide-react";
import { exercises } from "@/data/exercises";
import { cases } from "@/data/cases";
import { tracks } from "@/data/tracks";
import { biblioteca } from "@/data/library";
import { cn } from "@/lib/utils";

type Group = "Exercícios" | "Casos" | "Trilhas" | "Biblioteca" | "Ir para";

interface SearchItem {
  id: string;
  label: string;
  sub?: string;
  group: Group;
  to: string;
  haystack: string;
  Icon: React.ComponentType<{ className?: string }>;
}

// remove acentos (combining marks U+0300–U+036F) p/ busca acento-insensível
const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/** Índice de busca montado uma vez a partir dos dados mock. */
const INDEX: SearchItem[] = [
  ...exercises.map((e) => ({
    id: `ex-${e.slug}`,
    label: e.nome,
    sub: e.grupoMuscular,
    group: "Exercícios" as Group,
    to: `/movement-lab/${e.slug}`,
    haystack: norm([e.nome, e.grupoMuscular, e.equipamento, ...(e.objetivo || [])].join(" ")),
    Icon: FlaskConical,
  })),
  ...cases.map((c) => ({
    id: `case-${c.slug}`,
    label: c.titulo,
    sub: c.tema,
    group: "Casos" as Group,
    to: `/cases/${c.slug}`,
    haystack: norm([c.titulo, c.tema, c.dificuldade].join(" ")),
    Icon: BookOpen,
  })),
  ...tracks.map((t) => ({
    id: `track-${t.slug}`,
    label: t.nome,
    sub: "Trilha",
    group: "Trilhas" as Group,
    to: `/tracks/${t.slug}`,
    haystack: norm([t.nome, t.descricao || ""].join(" ")),
    Icon: RouteIcon,
  })),
  ...biblioteca.map((b) => ({
    id: `lib-${b.id}`,
    label: b.termo,
    sub: b.categoria,
    group: "Biblioteca" as Group,
    to: b.verExercicio ? `/movement-lab/${b.verExercicio}` : "/library",
    haystack: norm([b.termo, b.categoria, b.resumo].join(" ")),
    Icon: LibraryIcon,
  })),
  {
    id: "nav-dashboard", label: "Dashboard", group: "Ir para", to: "/dashboard",
    haystack: norm("dashboard inicio visao geral"), Icon: LayoutDashboard,
  },
  {
    id: "nav-gps", label: "Prescrever", group: "Ir para", to: "/gps",
    haystack: norm("prescrever gps prescricao recomendacao motor decisao rapida"), Icon: Navigation,
  },
  {
    id: "nav-lab", label: "Laboratório Visual", group: "Ir para", to: "/movement-lab",
    haystack: norm("laboratorio visual movimento exercicios"), Icon: FlaskConical,
  },
  {
    id: "nav-cases", label: "Casos", group: "Ir para", to: "/cases",
    haystack: norm("casos praticos"), Icon: BookOpen,
  },
  {
    id: "nav-tracks", label: "Trilhas", group: "Ir para", to: "/tracks",
    haystack: norm("trilhas licoes"), Icon: RouteIcon,
  },
  {
    id: "nav-library", label: "Biblioteca", group: "Ir para", to: "/library",
    haystack: norm("biblioteca glossario conceitos"), Icon: LibraryIcon,
  },
  {
    id: "nav-favorites", label: "Favoritos", group: "Ir para", to: "/favorites",
    haystack: norm("favoritos salvos"), Icon: Star,
  },
  {
    id: "nav-history", label: "Histórico", group: "Ir para", to: "/history",
    haystack: norm("historico atividades"), Icon: HistoryIcon,
  },
  {
    id: "nav-account", label: "Configurações", group: "Ir para", to: "/account",
    haystack: norm("configuracoes conta perfil plano"), Icon: Settings,
  },
];

const GROUP_ORDER: Group[] = ["Exercícios", "Casos", "Trilhas", "Biblioteca", "Ir para"];

function search(q: string): SearchItem[] {
  const nq = norm(q.trim());
  if (!nq) return [];
  const terms = nq.split(/\s+/);
  const scored = INDEX.map((it) => {
    const hay = norm(it.label) + " " + it.haystack;
    let ok = true;
    let score = 0;
    for (const t of terms) {
      const i = hay.indexOf(t);
      if (i === -1) {
        ok = false;
        break;
      }
      // prefixo do rótulo pontua mais
      score += norm(it.label).startsWith(t) ? 3 : i === 0 ? 2 : 1;
    }
    return ok ? { it, score } : null;
  }).filter(Boolean) as { it: SearchItem; score: number }[];
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 12).map((s) => s.it);
}

export function GlobalSearch() {
  const navigate = useNavigate();
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  const results = React.useMemo(() => search(q), [q]);

  // ⌘K / Ctrl+K foca a busca
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // clique fora fecha
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  React.useEffect(() => setActive(0), [q]);

  const go = (it: SearchItem) => {
    navigate(it.to);
    setOpen(false);
    setQ("");
    inputRef.current?.blur();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const it = results[active];
      if (it) go(it);
    }
  };

  React.useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const showPanel = open && q.trim().length > 0;
  let flatIdx = -1;

  return (
    <div ref={rootRef} className="relative mx-auto w-full min-w-0 max-w-2xl">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
      <input
        ref={inputRef}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Buscar exercícios, músculos, casos..."
        aria-label="Buscar no aplicativo"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls="global-search-list"
        aria-activedescendant={showPanel && results.length ? `gsr-opt-${active}` : undefined}
        autoComplete="off"
        className="h-11 w-full rounded-full border border-transparent bg-surface-soft pl-10 pr-4 text-sm outline-none focus-visible:border-primary/40 sm:pr-16"
      />
      <kbd className="tabular absolute right-3 top-1/2 hidden -translate-y-1/2 items-center rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-ink-2 sm:inline-flex">
        ⌘K
      </kbd>

      {showPanel && (
        <div
          id="global-search-list"
          ref={listRef}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[70vh] overflow-y-auto rounded-card border border-border bg-surface p-2 shadow-elevated"
        >
          {results.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-ink-2">
              Nada encontrado para <span className="font-semibold text-ink">“{q.trim()}”</span>.
            </div>
          ) : (
            GROUP_ORDER.map((group) => {
              const items = results.filter((r) => r.group === group);
              if (items.length === 0) return null;
              return (
                <div key={group} className="mb-1 last:mb-0">
                  <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
                    {group}
                  </div>
                  {items.map((it) => {
                    flatIdx += 1;
                    const idx = flatIdx;
                    const Icon = it.Icon;
                    return (
                      <button
                        key={it.id}
                        id={`gsr-opt-${idx}`}
                        data-idx={idx}
                        role="option"
                        aria-selected={active === idx}
                        onMouseEnter={() => setActive(idx)}
                        onClick={() => go(it)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left",
                          active === idx ? "bg-primary-tint" : "hover:bg-surface-soft",
                        )}
                      >
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-soft text-ink-2">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-ink">{it.label}</span>
                          {it.sub && <span className="block truncate text-xs text-ink-3">{it.sub}</span>}
                        </span>
                        {active === idx && (
                          <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-ink-3" />
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
