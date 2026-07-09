import { CheckCircle2, X } from "lucide-react";
import { useToast } from "@/lib/toast";

/** Pilha de toasts (canto inferior central). aria-live para leitores de tela. */
export function Toasts() {
  const { toasts, dismiss } = useToast();
  if (toasts.length === 0) return null;
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 left-1/2 z-[80] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center gap-2.5 rounded-xl bg-ink px-4 py-3 text-sm font-medium text-white shadow-elevated"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
          <span className="min-w-0 flex-1">{t.msg}</span>
          <button
            onClick={() => dismiss(t.id)}
            aria-label="Fechar aviso"
            className="rounded p-1 text-white/70 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
