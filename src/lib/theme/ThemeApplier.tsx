import * as React from "react";
import { useUser } from "@/lib/store";
import { aplicarTema, PALETA_PADRAO, type Modo } from "./palettes";

/**
 * Aplica a paleta + modo escolhidos pelo profissional na raiz do app. Renderiza
 * nada; só roda o efeito. Reage à troca de paleta/modo e, no modo "sistema", à
 * preferência do SO. A visão do aluno (StudentApp) aplica o tema no próprio
 * container, com a cor de marca do profissional. Ver src/lib/theme/palettes.ts.
 */
export function ThemeApplier() {
  const paleta = useUser((s) => s.paleta) || PALETA_PADRAO;
  const modo = (useUser((s) => s.modo) || "claro") as Modo;
  const corMarca = useUser((s) => s.corPrimaria);

  React.useEffect(() => {
    aplicarTema(document.documentElement, paleta, modo, corMarca);
    try {
      localStorage.setItem("pi-tema", JSON.stringify({ paleta, modo }));
    } catch {
      /* localStorage indisponível: sem persistência anti-flash, tudo bem */
    }
  }, [paleta, modo, corMarca]);

  React.useEffect(() => {
    if (modo !== "sistema" || typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const on = () => aplicarTema(document.documentElement, paleta, modo, corMarca);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [modo, paleta, corMarca]);

  return null;
}
