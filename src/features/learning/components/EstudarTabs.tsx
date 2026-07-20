import { NavLink } from "react-router-dom";
import { Library, Route as RouteIcon, Network } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Tira de abas da porta única "Estudar". Reúne as três superfícies de estudo
 * (disciplinas, trilhas, mapa) num só lugar, para o Aprender ter poucos destinos
 * e o usuário trocar de vista sem voltar ao menu. São links de rota (cada aba é
 * uma página), então a semântica correta é navegação com aria-current, não um
 * widget de tabs.
 */
const ABAS = [
  { id: "disciplinas", to: "/aprender/disciplinas", label: "Disciplinas", Icon: Library },
  { id: "trilhas", to: "/tracks", label: "Trilhas", Icon: RouteIcon },
  { id: "mapa", to: "/aprender/mapa", label: "Mapa", Icon: Network },
] as const;

export type EstudarAba = (typeof ABAS)[number]["id"];

export function EstudarTabs({ active }: { active: EstudarAba }) {
  return (
    <nav
      aria-label="Estudar"
      className="flex flex-wrap gap-1.5 rounded-control border border-border bg-surface-soft p-1"
    >
      {ABAS.map(({ id, to, label, Icon }) => {
        const ativo = id === active;
        return (
          <NavLink
            key={id}
            to={to}
            aria-current={ativo ? "page" : undefined}
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors sm:flex-none",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
              ativo
                ? "bg-surface text-primary shadow-soft"
                : "text-ink-2 hover:bg-surface hover:text-ink",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </NavLink>
        );
      })}
    </nav>
  );
}
