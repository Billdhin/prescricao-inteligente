import { cn } from "@/lib/utils";

/**
 * EspinhaSelo: a assinatura de marca "espinha do cuidado" como SELO decorativo
 * (não o stepper interativo da LinhaDoCuidado, que fica intocado). Cinco discos
 * sobre uma linha, na ordem fixa do ciclo. Concluído = disco petróleo cheio;
 * atual = disco petróleo (halo opcional de 3 ciclos, uma vez por página); futuro
 * = branco com borda. NUNCA coral num nó. Decorativo (aria-hidden nos gráficos);
 * abaixo de sm: só o rótulo do nó atual fica visível, os demais em sr-only (nunca
 * rótulo a 10px para caber os cinco).
 */

const NOS = ["Avaliar", "Planejar", "Liberar", "Acompanhar", "Reavaliar"] as const;

export function EspinhaSelo({
  atual = 0,
  halo = false,
  className,
}: {
  /** índice do nó atual (0-4); anteriores viram "feito", seguintes "futuro". 5 = ciclo completo. */
  atual?: number;
  /** liga o halo pulsante de 3 ciclos no nó atual (regra: no máx. 1 halo por página). */
  halo?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative flex items-start justify-between", className)}>
      {/* linha 1px atrás dos discos */}
      <span aria-hidden className="absolute inset-x-[10%] top-3 h-px bg-border" />
      {NOS.map((nome, i) => {
        const estado = i < atual ? "feito" : i === atual ? "atual" : "futuro";
        return (
          <div key={nome} className="relative z-10 flex min-w-0 flex-1 flex-col items-center gap-1 text-center">
            <Disco estado={estado} halo={halo && estado === "atual"} />
            <span
              className={cn(
                "text-2xs font-semibold leading-tight",
                estado === "atual" ? "text-ink" : estado === "feito" ? "text-ink-2" : "text-ink-3",
                // abaixo de sm: só o nó ativo aparece; os demais ficam para leitor de tela
                estado !== "atual" && "sr-only sm:not-sr-only",
              )}
            >
              {nome}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Disco({ estado, halo }: { estado: "feito" | "atual" | "futuro"; halo: boolean }) {
  const cheio = estado !== "futuro";
  return (
    <span className="relative grid h-6 w-6 place-items-center">
      {halo && <span aria-hidden className="animate-halo-3 absolute inset-0 rounded-full bg-primary/30" />}
      <svg aria-hidden width="24" height="24" viewBox="0 0 24 24" className="relative">
        <circle
          cx="12"
          cy="12"
          r="7"
          fill={cheio ? "var(--primary)" : "var(--surface)"}
          stroke={cheio ? "var(--primary)" : "var(--border)"}
          strokeWidth="1.5"
        />
        {estado === "feito" && (
          <path
            d="M8.5 12.3l2.3 2.3 4.5-4.9"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </span>
  );
}
