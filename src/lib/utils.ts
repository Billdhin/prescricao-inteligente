import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formata número com separador de milhar pt-BR. */
export function fmt(n: number) {
  return new Intl.NumberFormat("pt-BR").format(n);
}
