/**
 * SISTEMA DE TEMA: uma identidade, dois modos.
 *
 * Cada token existe em dois formatos no CSS: `--x` (hex, para usos crus em SVG)
 * e `--x-rgb` (canais "R G B", que o tailwind.config lê como
 * rgb(var(--x-rgb) / <alpha-value>) para habilitar alpha E o tema).
 *
 * A paleta é AUTORADA (a "Rota", do Design System aprovado), não derivada de uma
 * cor. O gerador que existia aqui, que produzia 12 presets e um white-label a
 * partir de qualquer hex, foi removido na reestruturação: ele derivava os
 * neutros de uma matiz só e sempre devolvia surface branco, e a identidade nova
 * tem neutros quentes desacoplados da primária e duas matizes de marca.
 *
 * A cor do profissional continua existindo, com outro papel: é ACENTO do portal
 * do aluno (ver `CORES_DE_MARCA` e `corDeContraste`), não repinta o app dele.
 *
 * Contraste: `npm run check:contraste` valida AA de todos os pares em cada
 * modo. Não editar cor sem rodar.
 */

export type Modo = "claro" | "escuro" | "sistema";

export interface PaletaCore {
  bg: string; surface: string; surfaceSoft: string; border: string;
  ink: string; ink2: string; ink3: string; primary: string; primaryTint: string;
  /**
   * Quarto nível de superfície (chip, trilho de progresso, fundo de campo). O design tem quatro degraus de papel; ausente, cai em `surfaceSoft`.
   */
  surfaceMute?: string;
  /**
   * Cinza DECORATIVO: traço de ícone, tracejado da rota, régua. Nunca texto.
   * Ausente = cai em `ink3`. O guardrail token-nao-textual proibe usa-lo como cor de texto.
   */
  ink4?: string;
}

export interface Compartilhado {
  onPrimary: string; onAnalysis: string;
  analysis: string; analysisText: string; cta: string; ctaText: string;
  success: string; warning: string; danger: string; dangerFill: string;
  successTint: string; warningTint: string; ctaTint: string; analysisTint: string; dangerTint: string;
  dataIntensidade: string;
  /**
   * Turquesa VIVO da marca (#14B3BA na Rota): bolinha da rota feita, ícone de
   * check, gradiente do avatar. Dá 2,52:1 sobre papel, então é preenchimento e
   * nunca texto; quem escreve em turquesa usa `analysis`, que é mais escuro.
   * Ausente = cai em `analysis`.
   */
  analysisFill?: string;
  /** o que vai POR CIMA do turquesa vivo (ink na Rota; branco daria 2,57) */
  onAnalysisFill?: string;
  /**
   * AMARELO VIVO da sinalização: a luz do semáforo, o ponto de alerta.
   *
   * Existe porque `warning` foi escurecido até #8E6009 para passar 4,5:1 como
   * TEXTO sobre a tinta, e nessa profundidade ele já não é amarelo, é marrom.
   * O fundador viu isso no semáforo: "o amarelo está marrom". É o mesmo par que
   * o vermelho já tinha (`danger` escreve, `dangerFill` preenche).
   *
   * Ausente = cai em `warning`, e nada muda de aparência.
   */
  warningFill?: string;
  /** o que vai POR CIMA do amarelo vivo. Ausente = cai em `onPrimary`. */
  onWarningFill?: string;
  /** cores fixas do logo, para o gradiente da marca. Não seguem a paleta. */
  brandBlue?: string;
  brandTurquesa?: string;
}

export interface Paleta {
  id: string; nome: string; amostra: string;
  claro: PaletaCore; escuro: PaletaCore;
  /**
   * Acentos e semânticas PRÓPRIOS desta paleta. Ausentes = usa os
   * compartilhados. A "Rota" declara os seus porque o design fixa a família
   * inteira, não só a primária.
   */
  compartClaro?: Compartilhado;
  compartEscuro?: Compartilhado;
}

/* ----------------------------- cor: utilidades ---------------------------- */

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
/** Luminância relativa (WCAG), para escolher a tinta que vai por cima de uma cor. */
function lum(hex: string): number {
  const c = hexToRgb(hex)
    .map((v) => v / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function contraste(a: string, b: string): number {
  const l1 = lum(a);
  const l2 = lum(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
/* ------------------------- acentos/semânticas ------------------------- */

const COMPART_CLARO: Compartilhado = {
  onPrimary: "#ffffff", onAnalysis: "#ffffff",
  analysis: "#0e7c8a", analysisText: "#0c6b77", cta: "#e0663b", ctaText: "#b24a28",
  success: "#147a3a", warning: "#b45309", danger: "#b91c1c", dangerFill: "#ef4444",
  warningFill: "#E0A12A", onWarningFill: "#12151b",
  successTint: "#e7f8ed", warningTint: "#fef4e2", ctaTint: "#fff1e6", analysisTint: "#e0f7f9", dangerTint: "#fdecec",
  dataIntensidade: "#9a4f2e",
};
const COMPART_ESCURO: Compartilhado = {
  onPrimary: "#12151b", onAnalysis: "#12151b",
  analysis: "#45b6c6", analysisText: "#63c6d4", cta: "#ef7a50", ctaText: "#f2895f",
  success: "#3bbf6d", warning: "#e2952f", danger: "#f07070", dangerFill: "#ef4444",
  warningFill: "#F0B429", onWarningFill: "#12151b",
  successTint: "#123020", warningTint: "#322510", ctaTint: "#331d13", analysisTint: "#123239", dangerTint: "#331717",
  dataIntensidade: "#d9926a",
};

/* ------------------------- a paleta autorada "Rota" ----------------------- */

/**
 * A identidade da direção "1c Rota", aprovada pelo fundador no Design System.
 *
 * É AUTORADA: o design pede neutros QUENTES desacoplados da primária (papel
 * #FFFDF9 com azul frio #2064EC) mais uma SEGUNDA matiz de marca (o turquesa),
 * e nenhuma das duas coisas cabia no gerador que existia aqui.
 *
 * Seis valores literais do mockup reprovariam AA e foram DERIVADOS, com a razão
 * medida ao lado. Trocar qualquer um deles sem rodar `npm run check:contraste`
 * é como o produto perde acessibilidade sem ninguém perceber.
 */
const ROTA_CLARO: PaletaCore = {
  bg: "#F7F6F2",
  surface: "#FFFDF9",
  surfaceSoft: "#F0EFE9",
  surfaceMute: "#EEECE5",
  border: "#E8E6DF",
  ink: "#17202E",
  // literal do design era #6A7180, que dá 4,14 sobre surface-soft. Escurecer
  // ~5% de L é imperceptível e sobe para 4,87.
  ink2: "#616874",
  ink3: "#616874",
  // o #9AA1AC do design dá 2,56 como texto: é cinza decorativo, e vive aqui.
  ink4: "#9AA1AC",
  // O literal da marca (#2064EC) dá 4,45 sobre surface-soft e 4,34 sobre
  // surface-mute, e `hover:bg-surface-soft` aparece 116 vezes no produto: um link
  // primário que o mouse toca cairia abaixo de AA. Escurecer 3% resolve os quatro
  // pares (pior fica 4,56) e é imperceptível. O azul EXATO da marca continua em
  // `brandBlue`, que é quem pinta o logo.
  primary: "#1F61E5",
  primaryTint: "#EEF3FE",
};

const ROTA_ESCURO: PaletaCore = {
  bg: "#0A0D14",
  surface: "#0D1524",
  surfaceSoft: "#1A2537",
  surfaceMute: "#232F45",
  border: "#2A3648",
  ink: "#F2F6FC",
  ink2: "#9DB2D6",
  ink3: "#9DB2D6",
  ink4: "#6E819F",
  primary: "#7FA3EF",
  primaryTint: "#16233C",
};

const ROTA_COMPART_CLARO: Compartilhado = {
  onPrimary: "#ffffff",
  onAnalysis: "#ffffff",
  // o turquesa da marca (#14B3BA) dá 2,52 sobre papel: NÃO é cor de texto.
  // Quem escreve usa este tom escuro, que é literal do mockup e dá 6,17.
  analysis: "#0C6B70",
  analysisText: "#0C6B70",
  analysisTint: "#E0F5F4",
  analysisFill: "#14B3BA",
  onAnalysisFill: "#17202E",
  // a família coral (cta) não existe no design novo: por ora é ALIAS do âmbar,
  // então tudo compila e nada muda de significado. O codemod apaga depois.
  cta: "#8E6009",
  ctaText: "#8E6009",
  ctaTint: "#FBF1DC",
  success: "#177A4C",
  successTint: "#E3F4EA",
  // #96650A sobre a tint dá 4,4999 e reprovaria por arredondamento. Este tom
  // escreve; quem acende a luz do semáforo é o warningFill logo abaixo.
  warning: "#8E6009",
  warningTint: "#FBF1DC",
  warningFill: "#E8A317",
  onWarningFill: "#17202E",
  danger: "#C0361F",
  dangerTint: "#FCEAE6",
  dangerFill: "#E2543E",
  dataIntensidade: "#8E6009",
  brandBlue: "#2064EC",
  brandTurquesa: "#14B3BA",
};

const ROTA_COMPART_ESCURO: Compartilhado = {
  onPrimary: "#0A0D14",
  onAnalysis: "#0A0D14",
  analysis: "#9FDCD8",
  analysisText: "#9FDCD8",
  analysisTint: "#123239",
  analysisFill: "#14B3BA",
  onAnalysisFill: "#06231F",
  cta: "#E6B03C",
  ctaText: "#E6B03C",
  ctaTint: "#322510",
  success: "#3ECF8E",
  successTint: "#10301F",
  warning: "#E6B03C",
  warningTint: "#322510",
  warningFill: "#F0B429",
  onWarningFill: "#0A0D14",
  danger: "#FF9D8C",
  dangerTint: "#331717",
  dangerFill: "#E2543E",
  dataIntensidade: "#E6B03C",
  brandBlue: "#2064EC",
  brandTurquesa: "#14B3BA",
};

export const PALETA_ROTA: Paleta = {
  id: "rota",
  nome: "Rota",
  amostra: "#2064EC",
  claro: ROTA_CLARO,
  escuro: ROTA_ESCURO,
  compartClaro: ROTA_COMPART_CLARO,
  compartEscuro: ROTA_COMPART_ESCURO,
};

/**
 * UMA paleta, que é a identidade do produto.
 *
 * Antes daqui saíam 12 presets gerados mais "Minha marca", que produzia uma 13ª
 * de qualquer hex. Foram aposentados na reestruturação por três motivos, e não
 * por gosto: (1) o mockup de Configurações do design aprovado não tem aba
 * Aparência nem grade de paletas, e a única cor configurável está sob "a cor que
 * os seus alunos veem"; (2) `gerarCore()` era incapaz de produzir esta paleta,
 * porque derivava os neutros de uma matiz só e sempre devolvia surface branco,
 * enquanto o design tem neutros quentes desacoplados da primária e DUAS matizes
 * de marca; (3) 12 paletas × 2 modos é uma superfície que ninguém consegue
 * auditar a olho, e o produto passava a ter 13 identidades e nenhuma.
 *
 * A personalização que importava sobreviveu, e num lugar mais honesto: a cor do
 * profissional agora é ACENTO no app do aluno (`corDeContraste` abaixo), que é
 * onde ela tem função, em vez de repintar o app que ele mesmo usa.
 */
export const PALETAS: Paleta[] = [PALETA_ROTA];
export const PALETA_PADRAO = "rota";

/**
 * SKIN DO APP DO ALUNO. Escura sempre, e por decisão de design, não por gosto.
 *
 * O aluno abre o app no vestiário e na academia, com pouca luz e o celular na
 * mão; o design aprovado desenhou esse lado em navy escuro e energético,
 * enquanto o lado do profissional é papel claro e quente. São dois produtos com
 * duas peles, e por isso o portal PAROU de herdar o claro/escuro do
 * profissional: se ele usasse o app no claro, o aluno via um portal branco que
 * nenhum mockup previu.
 *
 * O delta em relação ao escuro da Rota é só a rampa de neutro (o design pede o
 * navy um degrau mais claro, para o cartão descolar do fundo no celular) e o
 * cinza de texto. Todo o resto (semáforo, turquesa de ação positiva, âmbar de
 * sequência) é o mesmo `ROTA_COMPART_ESCURO`, para o aluno e o professor nunca
 * verem o mesmo estado em cores diferentes.
 *
 * Fica FORA de `PALETAS` de propósito: não é uma opção de aparência, é a pele de
 * uma superfície. `check:contraste` valida esta paleta à parte, no modo escuro.
 */
const ALUNO_ESCURO: PaletaCore = {
  bg: "#0D1524",
  surface: "#131D31",
  surfaceSoft: "#232F45",
  surfaceMute: "#2C3A54",
  border: "#2E3E5A",
  ink: "#F2F6FC",
  // o literal do design era #8FA1BD, que dá 4,47 sobre o trilho (#232F45) e
  // reprovaria por arredondamento; #97A9C5 sobe para 4,90 sem mudar a cor.
  ink2: "#97A9C5",
  ink3: "#97A9C5",
  ink4: "#6E819F",
  // azul claro legível no navy. O #2064EC do logo vive no gradiente do herói e
  // como cor de marca do profissional, nunca como texto sobre este fundo.
  primary: "#7FA3EF",
  primaryTint: "#1B2A45",
};

export const PALETA_ALUNO: Paleta = {
  id: "aluno",
  nome: "App do aluno",
  amostra: "#0D1524",
  claro: ALUNO_ESCURO,
  escuro: ALUNO_ESCURO,
  compartClaro: ROTA_COMPART_ESCURO,
  compartEscuro: ROTA_COMPART_ESCURO,
};

/** Resolve a paleta por id. Id desconhecido cai no padrão. */
export function getPaleta(id?: string): Paleta {
  return PALETAS.find((p) => p.id === id) ?? PALETAS[0];
}

/* --------------------- a cor de marca do profissional --------------------- */

/**
 * As cinco cores que o profissional pode escolher, literais do mockup de
 * Configurações. É lista FECHADA, e não um seletor livre, por uma razão
 * medível: com cinco valores o contraste de cada um é conhecido e verificável
 * no CI; com um seletor livre, o profissional pode escolher um amarelo em que
 * nenhum texto passa, e o app do aluno fica ilegível sem ninguém perceber.
 */
export const CORES_DE_MARCA: { hex: string; nome: string }[] = [
  { hex: "#2064EC", nome: "Azul do mapa" },
  { hex: "#14B3BA", nome: "Turquesa" },
  { hex: "#E2543E", nome: "Coral" },
  { hex: "#7C3AED", nome: "Violeta" },
  { hex: "#17202E", nome: "Grafite" },
];

/**
 * Qual tinta usar POR CIMA de uma cor de marca. Calculada por luminância, nunca
 * fixada em branco: das cinco amostras, o turquesa e o coral pedem tinta escura
 * (branco sobre turquesa dá 2,57) e as outras pedem branca. Fixar branco, que é
 * o que o compartilhado fazia, deixaria dois dos cinco ilegíveis.
 */
export function corDeContraste(hex: string): string {
  const escura = "#17202E";
  const clara = "#FFFFFF";
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return clara;
  return contraste(clara, hex) >= contraste(escura, hex) ? clara : escura;
}

/* ------------------------------ aplicação ------------------------------- */

export function hexParaCanais(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  return `${r} ${g} ${b}`;
}

export function tokensDe(paleta: Paleta, escuro: boolean): Record<string, string> {
  const core = escuro ? paleta.escuro : paleta.claro;
  // Acento próprio da paleta quando ela declara (a Rota declara); senão o
  // compartilhado, que é o que mantém as 12 geradas idênticas ao de antes.
  const comp = escuro
    ? paleta.compartEscuro ?? COMPART_ESCURO
    : paleta.compartClaro ?? COMPART_CLARO;
  return {
    bg: core.bg, surface: core.surface, "surface-soft": core.surfaceSoft, border: core.border,
    // Tokens novos com fallback: paleta sem quarto degrau de papel usa o
    // terceiro, e sem cinza decorativo usa o ink-3. Ninguém muda de aparência.
    "surface-mute": core.surfaceMute ?? core.surfaceSoft,
    ink: core.ink, "ink-2": core.ink2, "ink-3": core.ink3, "ink-4": core.ink4 ?? core.ink3,
    primary: core.primary, "primary-tint": core.primaryTint,
    "on-primary": comp.onPrimary, "on-analysis": comp.onAnalysis,
    analysis: comp.analysis, "analysis-text": comp.analysisText,
    "analysis-fill": comp.analysisFill ?? comp.analysis,
    "on-analysis-fill": comp.onAnalysisFill ?? comp.onAnalysis,
    "brand-blue": comp.brandBlue ?? core.primary,
    "brand-turquesa": comp.brandTurquesa ?? comp.analysis,
    cta: comp.cta, "cta-text": comp.ctaText,
    success: comp.success, warning: comp.warning, danger: comp.danger, "danger-fill": comp.dangerFill,
    "warning-fill": comp.warningFill ?? comp.warning,
    "on-warning-fill": comp.onWarningFill ?? comp.onPrimary,
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
 *
 * `corMarca` NÃO repinta mais a paleta: ela entra só como ACENTO, e só onde o
 * chamador pedir (o app do aluno). O app do profissional é sempre a identidade
 * do produto, porque é o produto que ele comprou; a marca dele existe para o
 * aluno ver, não para ele mesmo.
 */
export function aplicarTema(el: HTMLElement, paletaId: string, modo: Modo, corMarca?: string): void {
  aplicarPaleta(el, getPaleta(paletaId), modoEfetivo(modo), corMarca);
}

/**
 * Mesma coisa com a paleta e o modo já resolvidos. É por aqui que entra a skin
 * do app do aluno, que não está em `PALETAS` (logo `getPaleta` não a acha) e é
 * escura sempre, sem consultar preferência nenhuma.
 */
export function aplicarPaleta(el: HTMLElement, paleta: Paleta, escuro: boolean, corMarca?: string): void {
  const tokens = tokensDe(paleta, escuro);
  for (const [nome, hex] of Object.entries(tokens)) {
    el.style.setProperty(`--${nome}`, hex);
    el.style.setProperty(`--${nome}-rgb`, hexParaCanais(hex));
  }
  // Acento de marca: quem passa `corMarca` (hoje só o portal do aluno) troca a
  // primária e a tinta que vai por cima dela, sobre a MESMA base neutra.
  if (corMarca && /^#[0-9a-fA-F]{6}$/.test(corMarca)) {
    el.style.setProperty("--primary", corMarca);
    el.style.setProperty("--primary-rgb", hexParaCanais(corMarca));
    const tinta = corDeContraste(corMarca);
    el.style.setProperty("--on-primary", tinta);
    el.style.setProperty("--on-primary-rgb", hexParaCanais(tinta));
  }
  el.setAttribute("data-theme", escuro ? "escuro" : "claro");
  el.setAttribute("data-paleta", paleta.id);
}
