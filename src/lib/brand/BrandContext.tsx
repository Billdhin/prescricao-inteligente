import * as React from "react";

/**
 * Marca ativa da árvore. `null` significa a marca do PRODUTO (Prescrição
 * Inteligente). Um valor preenchido é white-label: o app assume a logo, o nome e
 * a cor do profissional. Usado pelo portal do aluno, onde o aluno vê a marca do
 * profissional dele, nunca a nossa.
 */
export interface Marca {
  nome: string;
  logoDataUrl?: string;
  corPrimaria?: string;
}

const BrandContext = React.createContext<Marca | null>(null);

export function BrandProvider({ marca, children }: { marca: Marca | null; children: React.ReactNode }) {
  return <BrandContext.Provider value={marca}>{children}</BrandContext.Provider>;
}

/** Marca ativa, ou null quando é a marca do produto. */
export function useBrand(): Marca | null {
  return React.useContext(BrandContext);
}

/** Duas letras a partir do nome, para o selo quando não há logo. */
export function iniciaisDaMarca(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "PI";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}
