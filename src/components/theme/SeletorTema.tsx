import * as React from "react";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { CORES_DE_MARCA, corDeContraste, type Modo } from "@/lib/theme/palettes";
import { useUser } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * Aparência do app (claro/escuro/sistema) e a cor de marca que o ALUNO vê.
 *
 * Antes daqui saía também uma grade de 12 paletas mais um seletor de cor livre
 * que repintava o app inteiro do profissional. As duas coisas foram aposentadas
 * na reestruturação: o produto passou a ter uma identidade só, e a cor que o
 * profissional escolhe deixou de repintar o app dele para virar o acento do
 * portal do aluno, que é onde ela tem função. O que sobrou é o que o mockup de
 * Configurações desenha.
 */
export function SeletorTema() {
  const modo = (useUser((s) => s.modo) || "claro") as Modo;
  const corPrimaria = useUser((s) => s.corPrimaria);
  const setPerfil = useUser((s) => s.setPerfil);

  const modos: { id: Modo; label: string; Icon: typeof Sun }[] = [
    { id: "claro", label: "Claro", Icon: Sun },
    { id: "escuro", label: "Escuro", Icon: Moon },
    { id: "sistema", label: "Sistema", Icon: Monitor },
  ];

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-1 text-sm font-semibold text-ink">Sua cor no app do aluno</div>
        <p className="mb-2.5 text-xs text-ink-2">A cor que os seus alunos veem no portal deles.</p>
        <div className="flex flex-wrap gap-2">
          {CORES_DE_MARCA.map((c) => {
            const on = (corPrimaria || CORES_DE_MARCA[0].hex).toUpperCase() === c.hex.toUpperCase();
            return (
              <button
                key={c.hex}
                type="button"
                onClick={() => setPerfil({ corPrimaria: c.hex })}
                aria-pressed={on}
                title={c.nome}
                className={cn(
                  "grid h-11 w-11 place-items-center rounded-full ring-1 ring-black/10 transition-shadow",
                  // O anel de selecionado é a borda 2px azul do Design System, e
                  // o check dentro garante que o estado não seja só cor.
                  on && "outline outline-2 outline-offset-2 outline-primary",
                )}
                style={{ background: c.hex }}
              >
                {on && <Check className="h-5 w-5" style={{ color: corDeContraste(c.hex) }} />}
                <span className="sr-only">{c.nome}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-2 text-sm font-semibold text-ink">Aparência</div>
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
      </div>

      <p className="text-xs text-ink-3">
        A aparência vale só para você. A cor de marca aparece no portal do aluno e nos documentos
        que você exporta, com o texto sempre legível por cima dela.
      </p>
    </div>
  );
}
