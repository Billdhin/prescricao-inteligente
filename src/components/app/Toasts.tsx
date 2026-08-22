import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import { useToast } from "@/lib/toast";

/** Pilha de toasts (canto inferior central).
 *
 *  O ícone e o aria vêm do TOM, não são fixos. Antes tudo saía com CheckCircle2 verde,
 *  inclusive "Não consegui sincronizar": o aviso de falha chegava vestido de confirmação.
 *  Falha também sobe para aria-live="assertive" e role="alert", porque quem não olha a tela
 *  precisa ser interrompido quando a gravação não aconteceu.
 */
export function Toasts() {
  const { toasts, dismiss } = useToast();
  if (toasts.length === 0) return null;
  const temFalha = toasts.some((t) => t.tom === "falha");
  return (
    <div
      aria-live={temFalha ? "assertive" : "polite"}
      className="pointer-events-none fixed bottom-4 left-1/2 z-[80] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4"
    >
      {toasts.map((t) => {
        const falha = t.tom === "falha";
        return (
          <div
            key={t.id}
            role={falha ? "alert" : undefined}
            className={`pointer-events-auto flex items-center gap-2.5 rounded-xl bg-ink px-4 py-3 text-sm font-medium text-white shadow-elevated ${
              falha ? "ring-2 ring-danger-fill/70" : ""
            }`}
          >
            {falha ? (
              <AlertTriangle className="h-4 w-4 shrink-0 text-danger-fill" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
            )}
            <span className="min-w-0 flex-1">{t.msg}</span>
            {t.acao && (
              <button
                onClick={() => {
                  t.acao?.onClick();
                  dismiss(t.id);
                }}
                className="shrink-0 rounded-full border border-white/35 px-2.5 py-1 text-xs font-semibold text-white hover:bg-white/15"
              >
                {t.acao.label}
              </button>
            )}
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Fechar aviso"
              className="rounded p-1 text-white/70 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
