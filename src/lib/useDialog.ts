import * as React from "react";

/**
 * Acessibilidade de modal (WCAG 2.4.3 / 4.1.2): ao abrir, move o foco para dentro
 * do diálogo; prende o Tab (foco cíclico); fecha no Escape; e ao desmontar, devolve
 * o foco ao elemento que abriu o modal. Retorna um ref para o container do diálogo.
 */
export function useDialog<T extends HTMLElement = HTMLDivElement>(onClose: () => void) {
  const ref = React.useRef<T>(null);

  React.useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const el = ref.current;

    const focusables = (): HTMLElement[] => {
      if (!el) return [];
      return Array.from(
        el.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
        ),
      ).filter((n) => n.offsetParent !== null || n === document.activeElement);
    };

    // foco inicial dentro do diálogo
    const first = focusables()[0];
    (first ?? el)?.focus?.();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const f = focusables();
      if (f.length === 0) {
        e.preventDefault();
        el?.focus?.();
        return;
      }
      const firstEl = f[0];
      const lastEl = f[f.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && (active === firstEl || active === el)) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && active === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  return ref;
}
