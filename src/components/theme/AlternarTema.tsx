import { Sun, Moon } from "lucide-react";
import { modoEfetivo, type Modo } from "@/lib/theme/palettes";
import { useUser } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * CLARO OU ESCURO A UM TOQUE, na barra de cima (protótipo de 10/09/2026).
 *
 * O tema só mudava em Configurações, três telas de distância de onde a pessoa percebe que a
 * luz da academia pede o outro. O botão mostra o estado ATUAL (sol no claro, lua no escuro),
 * como o protótipo, e o rótulo acessível diz para onde ele leva. Tocar sai do "sistema" e
 * fixa o oposto do que se vê; a escolha fina (incluindo voltar ao "sistema") segue em
 * Configurações.
 */
export function AlternarTema({ className }: { className?: string }) {
  const modo = (useUser((s) => s.modo) || "claro") as Modo;
  const setPerfil = useUser((s) => s.setPerfil);
  const escuro = modoEfetivo(modo);
  const titulo = modo === "sistema" ? `Sistema (${escuro ? "escuro" : "claro"})` : escuro ? "Escuro" : "Claro";

  return (
    <button
      type="button"
      onClick={() => setPerfil({ modo: escuro ? "claro" : "escuro" })}
      aria-label={escuro ? "Usar tema claro" : "Usar tema escuro"}
      title={titulo}
      className={cn(
        "grid h-[42px] w-[42px] shrink-0 place-items-center rounded-control border border-border bg-surface text-ink-2 transition-colors hover:text-ink",
        className,
      )}
    >
      {escuro ? <Moon className="h-4 w-4" aria-hidden /> : <Sun className="h-4 w-4" aria-hidden />}
    </button>
  );
}
