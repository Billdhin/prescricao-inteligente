import * as React from "react";
import { Sun, Moon, Monitor, Check, Palette } from "lucide-react";
import { PALETAS, PALETA_PADRAO, MARCA_ID, type Modo } from "@/lib/theme/palettes";
import { useUser } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * Seletor de tema do profissional: paleta + aparência (claro/escuro/sistema).
 * Além dos presets, "Minha marca" gera a paleta a partir de qualquer cor que o
 * profissional escolher, para encaixar na identidade dele. Aplica ao vivo (o
 * ThemeApplier reage à store) e persiste no perfil, valendo também no portal do
 * aluno.
 */
export function SeletorTema() {
  const paleta = useUser((s) => s.paleta) || PALETA_PADRAO;
  const modo = (useUser((s) => s.modo) || "claro") as Modo;
  const corPrimaria = useUser((s) => s.corPrimaria);
  const setPerfil = useUser((s) => s.setPerfil);
  const corMarca = corPrimaria || "#3a4a72";

  const modos: { id: Modo; label: string; Icon: typeof Sun }[] = [
    { id: "claro", label: "Claro", Icon: Sun },
    { id: "escuro", label: "Escuro", Icon: Moon },
    { id: "sistema", label: "Sistema", Icon: Monitor },
  ];

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 text-sm font-semibold text-ink">Paleta de cores</div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PALETAS.map((p) => {
            const on = p.id === paleta;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPerfil({ paleta: p.id })}
                aria-pressed={on}
                className={cn(
                  "flex items-center gap-2.5 rounded-control border p-2.5 text-left transition-colors",
                  on ? "border-primary bg-primary-tint" : "border-border bg-surface hover:bg-surface-soft",
                )}
              >
                <span
                  aria-hidden
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full ring-1 ring-black/10"
                  style={{ background: p.amostra }}
                >
                  {on && <Check className="h-4 w-4 text-white" />}
                </span>
                <span className="min-w-0 truncate text-sm font-semibold text-ink">{p.nome}</span>
              </button>
            );
          })}

          {/* Minha marca: gera a paleta de QUALQUER cor do profissional */}
          <label
            className={cn(
              "flex cursor-pointer items-center gap-2.5 rounded-control border p-2.5 transition-colors",
              paleta === MARCA_ID ? "border-primary bg-primary-tint" : "border-border bg-surface hover:bg-surface-soft",
            )}
          >
            <span
              aria-hidden
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full ring-1 ring-black/10"
              style={{ background: corMarca }}
            >
              {paleta === MARCA_ID ? <Check className="h-4 w-4 text-white" /> : <Palette className="h-3.5 w-3.5 text-white" />}
            </span>
            <span className="min-w-0 truncate text-sm font-semibold text-ink">Minha marca</span>
            <input
              type="color"
              aria-label="Cor da minha marca"
              value={corMarca}
              onChange={(e) => setPerfil({ corPrimaria: e.target.value, paleta: MARCA_ID })}
              onClick={() => setPerfil({ paleta: MARCA_ID })}
              className="ml-auto h-7 w-9 shrink-0 cursor-pointer rounded border border-border bg-transparent p-0.5"
            />
          </label>
        </div>
      </div>

      <div>
        <div className="mb-2 text-sm font-semibold text-ink">Aparência</div>
        <div className="inline-flex flex-wrap rounded-control border border-border bg-surface p-1">
          {modos.map(({ id, label, Icon }) => {
            const on = id === modo;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setPerfil({ modo: id })}
                aria-pressed={on}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-[7px] px-3 py-1.5 text-sm font-medium transition-colors",
                  on ? "bg-primary text-on-primary" : "text-ink-2 hover:text-ink",
                )}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-ink-3">
        A paleta e a aparência valem no seu app e na visão que o aluno tem do seu portal. Todas
        mantêm o texto legível no claro e no escuro. "Minha marca" gera as cores a partir da cor
        que você escolher.
      </p>
    </div>
  );
}
