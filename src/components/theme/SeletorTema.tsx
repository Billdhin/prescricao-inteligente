import * as React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import type { Modo } from "@/lib/theme/palettes";
import { useUser } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * Aparência do app: claro, escuro ou o que o sistema estiver usando.
 *
 * A COR DE MARCA NÃO MORA MAIS AQUI. Ela estava neste componente E de novo no
 * card "Sua marca nos documentos", duas grades idênticas mexendo no MESMO campo
 * (`corPrimaria`), com dois títulos diferentes ("Sua cor no app do aluno" e "Cor
 * da marca") como se fossem coisas distintas. Quem clicasse numa via a outra
 * mudar sozinha, o que é a definição de configuração confusa. Agora existe uma
 * escolha só, no card da marca, ao lado da prévia que mostra onde ela aparece.
 *
 * Aqui fica o que de fato é do profissional e de mais ninguém: como o app dele
 * se parece na tela dele.
 */
export function SeletorTema() {
  const modo = (useUser((s) => s.modo) || "claro") as Modo;
  const setPerfil = useUser((s) => s.setPerfil);

  const modos: { id: Modo; label: string; Icon: typeof Sun }[] = [
    { id: "claro", label: "Claro", Icon: Sun },
    { id: "escuro", label: "Escuro", Icon: Moon },
    { id: "sistema", label: "Sistema", Icon: Monitor },
  ];

  return (
    <div>
      <div className="inline-flex flex-wrap rounded-full border border-border bg-surface p-1">
        {modos.map(({ id, label, Icon }) => {
          const on = id === modo;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setPerfil({ modo: id })}
              aria-pressed={on}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                on ? "bg-ink text-surface" : "text-ink-2 hover:text-ink",
              )}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          );
        })}
      </div>
      <p className="mt-2.5 text-xs text-ink-3">
        Vale só para você, neste navegador. Não muda nada do que o aluno vê.
      </p>
    </div>
  );
}
