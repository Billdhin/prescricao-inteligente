/**
 * SISTEMA DE TEMA — paletas + claro/escuro.
 *
 * Cada token existe em dois formatos no CSS: `--x` (hex, para usos crus em SVG)
 * e `--x-rgb` (canais "R G B", que o tailwind.config lê como
 * rgb(var(--x-rgb) / <alpha-value>) para habilitar alpha E o tema). O
 * `applyTheme` seta os DOIS a partir do hex de cada token.
 *
 * Uma paleta define só os NEUTROS + a PRIMÁRIA (o que dá identidade). Os acentos
 * (analysis, cta) e as cores semânticas (success/warning/danger) e suas tints são
 * COMPARTILHADOS entre as paletas — só mudam entre claro e escuro — para o
 * significado da cor não mudar quando o profissional troca de paleta.
 *
 * Contraste: `npm run check:contraste` valida AA (>=4.5 texto, >=3 gráfico) de
 * todos os pares críticos em toda paleta × modo. Não editar cor sem rodar.
 */

export type Modo = "claro" | "escuro" | "sistema";

/** Tokens que uma paleta define (neutros + primária). */
export interface PaletaCore {
  bg: string;
  surface: string;
  surfaceSoft: string;
  border: string;
  ink: string;
  ink2: string;
  ink3: string;
  primary: string;
  primaryTint: string;
}

/** Acentos + semânticas + tints, compartilhados; variam só por modo. */
export interface Compartilhado {
  /** cor do TEXTO/ícone sobre um preenchimento `bg-primary`/`bg-analysis`. No
     claro a primária é escura => branco; no escuro a primária é clara => tinta
     escura. Sem isto, `bg-primary text-white` fica ilegível no modo escuro. */
  onPrimary: string;
  onAnalysis: string;
  analysis: string;
  analysisText: string;
  cta: string;
  ctaText: string;
  success: string;
  warning: string;
  danger: string;
  dangerFill: string;
  successTint: string;
  warningTint: string;
  ctaTint: string;
  analysisTint: string;
  dangerTint: string;
  dataIntensidade: string;
}

export interface Paleta {
  id: string;
  nome: string;
  /** cor de amostra para o seletor (a primária do modo claro). */
  amostra: string;
  claro: PaletaCore;
  escuro: PaletaCore;
}

/* ------------------------- acentos/semânticas ------------------------- */

const COMPART_CLARO: Compartilhado = {
  onPrimary: "#ffffff",
  onAnalysis: "#ffffff",
  analysis: "#0e7c8a",
  analysisText: "#0c6b77",
  cta: "#e0663b",
  ctaText: "#b24a28",
  success: "#147a3a",
  warning: "#b45309",
  danger: "#b91c1c",
  dangerFill: "#ef4444",
  successTint: "#e7f8ed",
  warningTint: "#fef4e2",
  ctaTint: "#fff1e6",
  analysisTint: "#e0f7f9",
  dangerTint: "#fdecec",
  dataIntensidade: "#9a4f2e",
};

const COMPART_ESCURO: Compartilhado = {
  onPrimary: "#14171d",
  onAnalysis: "#14171d",
  analysis: "#45b6c6",
  analysisText: "#63c6d4",
  cta: "#ef7a50",
  ctaText: "#f2895f",
  success: "#3bbf6d",
  warning: "#e2952f",
  danger: "#f07070",
  dangerFill: "#ef4444",
  successTint: "#14301f",
  warningTint: "#33260f",
  ctaTint: "#331d13",
  analysisTint: "#123239",
  dangerTint: "#331717",
  dataIntensidade: "#d9926a",
};

/* -------------------------------- paletas ------------------------------- */

export const PALETAS: Paleta[] = [
  {
    id: "grafite",
    nome: "Grafite",
    amostra: "#3a4a72",
    claro: {
      bg: "#f6f7f9", surface: "#ffffff", surfaceSoft: "#edeff3", border: "#e0e3e9",
      ink: "#171b23", ink2: "#565d6b", ink3: "#565d6b",
      primary: "#3a4a72", primaryTint: "#ebedf5",
    },
    escuro: {
      bg: "#14171d", surface: "#1b1f27", surfaceSoft: "#21262f", border: "#2e343f",
      ink: "#e9ecf1", ink2: "#a3abb8", ink3: "#a3abb8",
      primary: "#93a6da", primaryTint: "#232a3d",
    },
  },
  {
    id: "branco",
    nome: "Branco clínico",
    amostra: "#17506b",
    claro: {
      bg: "#f7f9fb", surface: "#ffffff", surfaceSoft: "#eef2f6", border: "#e2e8f0",
      ink: "#16202e", ink2: "#556070", ink3: "#556070",
      primary: "#17506b", primaryTint: "#e5eef3",
    },
    escuro: {
      bg: "#0f141a", surface: "#171d25", surfaceSoft: "#1d242d", border: "#2b333d",
      ink: "#e8edf3", ink2: "#a0aab8", ink3: "#a0aab8",
      primary: "#5aa7c4", primaryTint: "#14303c",
    },
  },
  {
    id: "oceano",
    nome: "Oceano",
    amostra: "#1f5fa8",
    claro: {
      bg: "#f4f8fd", surface: "#ffffff", surfaceSoft: "#e9f1fa", border: "#dae6f2",
      ink: "#12233a", ink2: "#4f5d70", ink3: "#4f5d70",
      primary: "#1f5fa8", primaryTint: "#e4eefb",
    },
    escuro: {
      bg: "#0d1420", surface: "#141d2b", surfaceSoft: "#1a2433", border: "#28374a",
      ink: "#e7edf5", ink2: "#9aabc0", ink3: "#9aabc0",
      primary: "#6fabe9", primaryTint: "#142a44",
    },
  },
  {
    id: "verde",
    nome: "Verde clínica",
    amostra: "#1f7a4d",
    claro: {
      bg: "#f5faf6", surface: "#ffffff", surfaceSoft: "#e8f3ea", border: "#d8e8dc",
      ink: "#15271d", ink2: "#4d5d52", ink3: "#4d5d52",
      primary: "#1f7a4d", primaryTint: "#e3f3e9",
    },
    escuro: {
      bg: "#0f1712", surface: "#16211a", surfaceSoft: "#1c2820", border: "#2a382f",
      ink: "#e7f0ea", ink2: "#9db3a4", ink3: "#9db3a4",
      primary: "#54c184", primaryTint: "#14301f",
    },
  },
];

export const PALETA_PADRAO = "grafite";

export function getPaleta(id?: string): Paleta {
  return PALETAS.find((p) => p.id === id) ?? PALETAS[0];
}

/* ------------------------------ aplicação ------------------------------- */

/** "#1b4b66" -> "27 75 102" (canais para o Tailwind alpha). */
export function hexParaCanais(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

/** Junta os tokens da paleta (core) com os compartilhados, no modo dado. */
export function tokensDe(paleta: Paleta, escuro: boolean): Record<string, string> {
  const core = escuro ? paleta.escuro : paleta.claro;
  const comp = escuro ? COMPART_ESCURO : COMPART_CLARO;
  return {
    bg: core.bg, surface: core.surface, "surface-soft": core.surfaceSoft, border: core.border,
    ink: core.ink, "ink-2": core.ink2, "ink-3": core.ink3,
    primary: core.primary, "primary-tint": core.primaryTint,
    "on-primary": comp.onPrimary, "on-analysis": comp.onAnalysis,
    analysis: comp.analysis, "analysis-text": comp.analysisText,
    cta: comp.cta, "cta-text": comp.ctaText,
    success: comp.success, warning: comp.warning, danger: comp.danger, "danger-fill": comp.dangerFill,
    "success-tint": comp.successTint, "warning-tint": comp.warningTint,
    "cta-tint": comp.ctaTint, "analysis-tint": comp.analysisTint, "danger-tint": comp.dangerTint,
    "data-intensidade": comp.dataIntensidade,
  };
}

/** Resolve "sistema" para claro/escuro pela preferência do SO. */
export function modoEfetivo(modo: Modo): boolean {
  if (modo === "escuro") return true;
  if (modo === "claro") return false;
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
}

/**
 * Aplica a paleta + modo num elemento (raiz do app ou do portal do aluno).
 * Seta `--x` (hex) E `--x-rgb` (canais) para cada token, e o atributo
 * data-theme (claro/escuro) para quem precisar ramificar em CSS.
 * `corMarca` (opcional) sobrepõe a primária pela cor do profissional (white-label).
 */
export function aplicarTema(
  el: HTMLElement,
  paletaId: string,
  modo: Modo,
  corMarca?: string,
): void {
  const paleta = getPaleta(paletaId);
  const escuro = modoEfetivo(modo);
  const tokens = tokensDe(paleta, escuro);
  if (corMarca && /^#[0-9a-fA-F]{6}$/.test(corMarca)) {
    tokens.primary = corMarca;
  }
  for (const [nome, hex] of Object.entries(tokens)) {
    el.style.setProperty(`--${nome}`, hex);
    el.style.setProperty(`--${nome}-rgb`, hexParaCanais(hex));
  }
  el.setAttribute("data-theme", escuro ? "escuro" : "claro");
  el.setAttribute("data-paleta", paleta.id);
}
