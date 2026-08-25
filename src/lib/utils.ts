import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formata número com separador de milhar pt-BR. */
export function fmt(n: number) {
  return new Intl.NumberFormat("pt-BR").format(n);
}

/**
 * Prefixa um caminho de asset em `public/` com o base do Vite, para funcionar
 * tanto em "/" (o caso de hoje: Cloudflare Pages serve na raiz do domínio) quanto num
 * host que sirva o app em subcaminho. Use em
 * `<img src>` de imagens vindas dos dados (que guardam caminho root-absoluto).
 */
export function withBase(path: string) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return base + (path.startsWith("/") ? path : `/${path}`);
}
