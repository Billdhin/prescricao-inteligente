import React from "react";
import { registrarVsl, type MapaVsl } from "./player";

/**
 * O <mapa-vsl> dentro de React. O elemento é criado à mão (e não como JSX) para que o React
 * nunca o recrie numa re-renderização: recriar o nó reinicia o vídeo.
 */
export function VslPlayer({
  video,
  className,
  style,
  aoFicarPronto,
}: {
  video: string;
  className?: string;
  style?: React.CSSProperties;
  aoFicarPronto?: (player: MapaVsl) => void;
}) {
  const caixa = React.useRef<HTMLDivElement>(null);
  const pronto = React.useRef(aoFicarPronto);
  pronto.current = aoFicarPronto;

  React.useEffect(() => {
    registrarVsl();
    const el = document.createElement("mapa-vsl") as MapaVsl;
    el.setAttribute("video", video);
    el.tabIndex = 0;
    const aoPronto = () => pronto.current?.(el);
    el.addEventListener("player:ready", aoPronto);
    caixa.current?.appendChild(el);
    return () => {
      el.removeEventListener("player:ready", aoPronto);
      el.remove();
    };
  }, [video]);

  return <div ref={caixa} className={className} style={style} />;
}
