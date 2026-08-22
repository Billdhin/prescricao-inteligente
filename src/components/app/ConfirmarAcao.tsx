import { createPortal } from "react-dom";
import { useDialog } from "@/lib/useDialog";
import { buttonClasses } from "@/components/ui/primitives";

/**
 * Diálogo de confirmação da casa.
 *
 * Existe por dois motivos, e os dois são de produto, não de estilo.
 *
 * 1. Havia `window.confirm` em telas autoradas (o editor de avaliação e o treino guiado do
 *    aluno). Diálogo do sistema operacional no meio de um produto clínico é uma janela que
 *    não fala a língua da casa, não obedece ao tema e, no celular com as mãos suadas,
 *    aparece onde o navegador quiser.
 *
 * 2. As ações que produzem REGISTRO CLÍNICO não podem ter desfazer barato: refazer o
 *    semáforo do dia sobrescreve um documento, e avançar o nível zera a contagem de tempo
 *    no nível. Para essas, a proteção certa é perguntar antes, dizendo o que se perde.
 *
 * Vai em portal porque cartão com backdrop-filter cria contexto de empilhamento, e o
 * projeto já pagou por isso uma vez.
 */
export function ConfirmarAcao({
  titulo,
  descricao,
  rotuloConfirmar,
  tom = "normal",
  onConfirmar,
  onCancelar,
}: {
  titulo: string;
  descricao: React.ReactNode;
  rotuloConfirmar: string;
  /** "destrutivo" pinta a ação de vermelho; use só quando algo é apagado ou sobrescrito. */
  tom?: "normal" | "destrutivo";
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  const dialogRef = useDialog<HTMLDivElement>(onCancelar);
  return createPortal(
    <div
      className="fixed inset-0 z-[90] grid place-items-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onCancelar}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="w-full max-w-sm rounded-card bg-surface p-6 shadow-elevated outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-lg font-bold text-ink">{titulo}</h2>
        <div className="mt-2 text-sm leading-relaxed text-ink-2">{descricao}</div>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button onClick={onCancelar} className={buttonClasses("secondary", "sm")}>
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className={
              tom === "destrutivo"
                ? "inline-flex h-9 items-center gap-1.5 rounded-full bg-danger px-4 text-sm font-semibold text-white hover:brightness-110"
                : buttonClasses("primary", "sm")
            }
          >
            {rotuloConfirmar}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
