/**
 * SISTEMA DE TEMA — paletas geradas + claro/escuro.
 *
 * Cada token existe em dois formatos no CSS: `--x` (hex, para usos crus em SVG)
 * e `--x-rgb` (canais "R G B", que o tailwind.config lê como
 * rgb(var(--x-rgb) / <alpha-value>) para habilitar alpha E o tema).
 *
 * Uma paleta é DERIVADA de UMA cor primária (a marca): `gerarCore(hex, modo)`
 * produz os neutros (tingidos de leve para a cor) e a primária ajustada para
 * AA. Os presets são só uma lista de cores; "Minha marca" gera a paleta da cor
 * que o profissional escolheu. Os acentos (analysis, cta) e semânticas
 * (success/warning/danger) + tints são COMPARTILHADOS e só mudam por modo, para
 * o significado não mudar ao trocar de paleta.
 *
 * Contraste: `npm run check:contraste` valida AA de todos os pares em toda
 * paleta × modo. Não editar cor sem rodar.
 */

export type Modo = "claro" | "escuro" | "sistema";

export interface PaletaCore {
  bg: string; surface: string; surfaceSoft: string; border: string;
  ink: string; ink2: string; ink3: string; primary: string; primaryTint: string;
}

export interface Compartilhado {
  onPrimary: string; onAnalysis: string;
  analysis: string; analysisText: string; cta: string; ctaText: string;
  success: string; warning: string; danger: string; dangerFill: string;
  successTint: string; warningTint: string; ctaTint: string; analysisTint: string; dangerTint: string;
  dataIntensidade: string;
}

export interface Paleta {
  id: string; nome: string; amostra: string;
  claro: PaletaCore; escuro: PaletaCore;
}

/* ----------------------------- cor: utilidades ---------------------------- */

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0; const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60; if (h < 0) h += 360;
  }
  return [h, s * 100, l * 100];
}
function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
}
function lum(hex: string): number {
  const c = hexToRgb(hex).map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function contraste(a: string, b: string): number {
  const l1 = lum(a), l2 = lum(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Escurece/clareia a primária (mexendo só em L) até bater AA no fundo dado. */
function primariaAA(h: number, s: number, lInicial: number, fundo: string, escurecer: boolean): string {
  let l = lInicial;
  for (let i = 0; i < 60; i++) {
    const hex = hslToHex(h, s, l);
    if (contraste(hex, fundo) >= 4.6) return hex;
    l += escurecer ? -1.5 : 1.5;
    if (l < 6 || l > 94) break;
  }
  return hslToHex(h, s, clamp(l, 6, 94));
}

/** Gera os neutros + a primária de um modo, a partir de UMA cor de marca. A
 *  primária é ajustada em L até bater AA no fundo mais CLARO em que ela vira
 *  texto (a tint no claro; a tint/surface no escuro), que é o pior caso. */
function gerarCore(hex: string, escuro: boolean): PaletaCore {
  const [h, s, l] = rgbToHsl(...hexToRgb(hex));
  const sat = clamp(s, 0, 60);
  if (!escuro) {
    const primaryTint = hslToHex(h, clamp(s * 0.5, 22, 55), 95);
    return {
      bg: hslToHex(h, clamp(sat * 0.28, 5, 12), 97.5),
      surface: "#ffffff",
      surfaceSoft: hslToHex(h, clamp(sat * 0.28, 5, 12), 95),
      border: hslToHex(h, clamp(sat * 0.32, 7, 16), 89),
      ink: hslToHex(h, clamp(sat * 0.5, 8, 26), 13),
      ink2: hslToHex(h, clamp(sat * 0.22, 4, 12), 38),
      ink3: hslToHex(h, clamp(sat * 0.22, 4, 12), 38),
      primary: primariaAA(h, clamp(s, 30, 85), Math.min(44, l), primaryTint, true),
      primaryTint,
    };
  }
  const primaryTint = hslToHex(h, clamp(s * 0.55, 26, 58), 13);
  const surface = hslToHex(h, clamp(sat * 0.28, 7, 14), 12.5);
  const bindBg = lum(primaryTint) > lum(surface) ? primaryTint : surface;
  return {
    bg: hslToHex(h, clamp(sat * 0.32, 8, 16), 8),
    surface,
    surfaceSoft: hslToHex(h, clamp(sat * 0.26, 6, 13), 17),
    border: hslToHex(h, clamp(sat * 0.24, 6, 13), 26),
    ink: hslToHex(h, 9, 93),
    ink2: hslToHex(h, 8, 69),
    ink3: hslToHex(h, 8, 69),
    primary: primariaAA(h, clamp(s, 35, 80), Math.max(64, l), bindBg, false),
    primaryTint,
  };
}

/* ------------------------- acentos/semânticas ------------------------- */

const COMPART_CLARO: Compartilhado = {
  onPrimary: "#ffffff", onAnalysis: "#ffffff",
  analysis: "#0e7c8a", analysisText: "#0c6b77", cta: "#e0663b", ctaText: "#b24a28",
  success: "#147a3a", warning: "#b45309", danger: "#b91c1c", dangerFill: "#ef4444",
  successTint: "#e7f8ed", warningTint: "#fef4e2", ctaTint: "#fff1e6", analysisTint: "#e0f7f9", dangerTint: "#fdecec",
  dataIntensidade: "#9a4f2e",
};
const COMPART_ESCURO: Compartilhado = {
  onPrimary: "#12151b", onAnalysis: "#12151b",
  analysis: "#45b6c6", analysisText: "#63c6d4", cta: "#ef7a50", ctaText: "#f2895f",
  success: "#3bbf6d", warning: "#e2952f", danger: "#f07070", dangerFill: "#ef4444",
  successTint: "#123020", warningTint: "#322510", ctaTint: "#331d13", analysisTint: "#123239", dangerTint: "#331717",
  dataIntensidade: "#d9926a",
};

/* -------------------------------- paletas ------------------------------- */

/** Constrói uma paleta completa a partir de uma cor primária. */
export function paletaDeHex(id: string, nome: string, hex: string): Paleta {
  return { id, nome, amostra: hex, claro: gerarCore(hex, false), escuro: gerarCore(hex, true) };
}

/** Presets: uma boa gama de matizes. "Minha marca" é gerada da cor do perfil. */
const PRESETS: { id: string; nome: string; hex: string }[] = [
  { id: "grafite", nome: "Grafite", hex: "#3a4a72" },
  { id: "petroleo", nome: "Petróleo", hex: "#17506b" },
  { id: "oceano", nome: "Oceano", hex: "#2563a8" },
  { id: "turquesa", nome: "Turquesa", hex: "#0f7d8c" },
  { id: "esmeralda", nome: "Esmeralda", hex: "#1f7a4d" },
  { id: "oliva", nome: "Oliva", hex: "#5f6f1c" },
  { id: "ambar", nome: "Âmbar", hex: "#9a6212" },
  { id: "terracota", nome: "Terracota", hex: "#b1502f" },
  { id: "vinho", nome: "Vinho", hex: "#9e2a4f" },
  { id: "magenta", nome: "Magenta", hex: "#b23a86" },
  { id: "violeta", nome: "Violeta", hex: "#6a3fc0" },
  { id: "ardosia", nome: "Ardósia", hex: "#4a5568" },
];

export const PALETAS: Paleta[] = PRESETS.map((p) => paletaDeHex(p.id, p.nome, p.hex));
export const PALETA_PADRAO = "grafite";
export const MARCA_ID = "marca";

/** Resolve a paleta por id; `marca` + corMarca gera a paleta da cor do perfil. */
export function getPaleta(id?: string, corMarca?: string): Paleta {
  if (id === MARCA_ID && corMarca && /^#[0-9a-fA-F]{6}$/.test(corMarca)) {
    return paletaDeHex(MARCA_ID, "Minha marca", corMarca);
  }
  return PALETAS.find((p) => p.id === id) ?? PALETAS[0];
}

/* ------------------------------ aplicação ------------------------------- */

export function hexParaCanais(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  return `${r} ${g} ${b}`;
}

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

export function modoEfetivo(modo: Modo): boolean {
  if (modo === "escuro") return true;
  if (modo === "claro") return false;
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
}

/**
 * Aplica paleta + modo num elemento (raiz do app ou do portal do aluno).
 * `corMarca` é usada quando a paleta é "marca" (paleta gerada da cor do perfil).
 */
export function aplicarTema(el: HTMLElement, paletaId: string, modo: Modo, corMarca?: string): void {
  const paleta = getPaleta(paletaId, corMarca);
  const escuro = modoEfetivo(modo);
  const tokens = tokensDe(paleta, escuro);
  for (const [nome, hex] of Object.entries(tokens)) {
    el.style.setProperty(`--${nome}`, hex);
    el.style.setProperty(`--${nome}-rgb`, hexParaCanais(hex));
  }
  el.setAttribute("data-theme", escuro ? "escuro" : "claro");
  el.setAttribute("data-paleta", paleta.id);
}
