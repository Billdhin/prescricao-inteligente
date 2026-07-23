/**
 * A curva de progressão do plano, num lugar só.
 *
 * A tela desenha em SVG do React e o PDF desenha em SVG de texto. Se cada um calculasse
 * a própria curva, o documento que o profissional assina mostraria uma progressão e o
 * app mostraria outra. Os dois pedem a mesma geometria daqui.
 *
 * A curva é QUALITATIVA: ela mostra a direção que o plano toma (sobe, mantém, reduz,
 * varia), não uma carga em quilos. Por isso o eixo não tem número, só "maior" e "menor":
 * prometer precisão onde só existe tendência seria inventar dado. As faixas ao pé do
 * gráfico dão o que falta para ler o plano de relance: qual fase, e quantas semanas nela.
 */

import { rotuloMeso, type Macrociclo, type Tendencia, type TipoMicrociclo } from "@/data/periodizacao";
import type { Nivel } from "@/data/types";

export interface PontoSemana {
  semana: number;
  vol: number;
  int: number;
  cpx: number;
  /** semana que não é de carga (descarga ou teste) */
  aliviada: boolean;
}

// O nível desloca a linha de base e a inclinação da progressão: um avançado treina em
// intensidade relativa mais alta e progride mais rápido que um iniciante. Por isso trocar
// o nível muda o gráfico de forma visível, e não só o texto.
const NIVEL_ESCALA: Record<Nivel, { vol: number; int: number; passo: number }> = {
  Iniciante: { vol: -0.25, int: -0.55, passo: 0.75 },
  Intermediário: { vol: 0, int: 0, passo: 1 },
  Avançado: { vol: 0.3, int: 0.55, passo: 1.3 },
};

/**
 * A curva reflete o MODELO e o NÍVEL, não uma forma genérica.
 *
 * A base de cada capacidade caminha de mesociclo a mesociclo pela TENDÊNCIA da fase (sobe,
 * reduz, mantém), então um plano linear traça um trend limpo. Quando a tendência é "varia"
 * (ondulatória, flexível, autorregulada), a carga oscila semana a semana, e o gráfico vira
 * uma onda, visivelmente diferente do linear. A descarga puxa a semana para baixo.
 */
export function serieSemanal(macro: Macrociclo, nivel?: Nivel): PontoSemana[] {
  const esc = NIVEL_ESCALA[nivel ?? "Intermediário"];
  const passo: Record<Tendencia, number> = {
    sobe: 0.5 * esc.passo,
    reduz: -0.5 * esc.passo,
    estavel: 0,
    varia: 0,
  };
  const pontos: PontoSemana[] = [];
  let volBase = 2.4 + esc.vol;
  let intBase = 1.6 + esc.int;
  let cpxBase = 1.7;
  const clamp = (n: number) => Math.max(0.5, Math.min(4, n));
  macro.mesociclos.forEach((m) => {
    // A fase desloca a base; é o que dá o trend do modelo (linear sobe, blocos degraus).
    volBase += passo[m.tendenciaVolume];
    intBase += passo[m.tendenciaIntensidade];
    cpxBase += m.tendenciaComplexidade === "sobe" ? 0.4 : m.tendenciaComplexidade === "reduz" ? -0.4 : 0;
    m.microciclos.forEach((w, wi) => {
      let vol = volBase;
      let int = intBase;
      const cpx = cpxBase;
      // Modelo ondulatório: a carga sobe e desce semana a semana em torno da base.
      if (m.tendenciaVolume === "varia") vol += wi % 2 === 0 ? 0.75 : -0.55;
      if (m.tendenciaIntensidade === "varia") int += wi % 2 === 0 ? -0.55 : 0.75;
      if (w.tipo === "deload") {
        vol *= 0.55;
        int *= 0.65;
      }
      pontos.push({ semana: w.semana, vol: clamp(vol), int: clamp(int), cpx: clamp(cpx), aliviada: w.tipo !== "carga" });
    });
  });
  return pontos;
}

/**
 * Curva suave que passa por todos os pontos (Catmull-Rom convertido em bézier cúbica).
 * A polyline crua deixava o gráfico com cara de rascunho; a curva não inventa precisão,
 * só troca o serrilhado por uma tendência que se lê de relance.
 */
function caminhoSuave(pontos: { x: number; y: number }[]): string {
  if (pontos.length === 0) return "";
  if (pontos.length === 1) return `M${pontos[0].x.toFixed(1)},${pontos[0].y.toFixed(1)}`;
  let d = `M${pontos[0].x.toFixed(1)},${pontos[0].y.toFixed(1)}`;
  for (let i = 0; i < pontos.length - 1; i++) {
    const p0 = pontos[i - 1] ?? pontos[i];
    const p1 = pontos[i];
    const p2 = pontos[i + 1];
    const p3 = pontos[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
}

const truncar = (s: string, max: number) => (s.length <= max ? s : `${s.slice(0, Math.max(1, max - 1)).trimEnd()}…`);

/* ---------------------- Ícones de modalidade em foco por fase ---------------------- */

/**
 * Glifos das modalidades, em SVG puro (paths e círculos, viewBox 24), para desenharem
 * igual na tela e no PDF. Vêm da biblioteca de ícones do projeto (lucide, ISC), copiados
 * como dados porque o PDF é uma string de SVG e não roda React.
 */
export interface Glifo {
  paths: string[];
  circles?: { cx: number; cy: number; r: number }[];
}

const GLIFOS: Record<string, Glifo> = {
  forca: {
    paths: [
      "M14.4 14.4 9.6 9.6",
      "M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z",
      "m21.5 21.5-1.4-1.4",
      "M3.9 3.9 2.5 2.5",
      "M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z",
    ],
  },
  caminhada: {
    paths: [
      "M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z",
      "M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z",
      "M16 17h4",
      "M4 13h4",
    ],
  },
  bike: {
    paths: ["M12 17.5V14l-3-3 4-3 2 3h2"],
    circles: [
      { cx: 18.5, cy: 17.5, r: 3.5 },
      { cx: 5.5, cy: 17.5, r: 3.5 },
      { cx: 15, cy: 5, r: 1 },
    ],
  },
  agua: {
    paths: [
      "M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
      "M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
      "M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
    ],
  },
  mobilidade: {
    paths: ["m9 20 3-6 3 6", "m6 8 6 2 6-2", "M12 10v4"],
    circles: [{ cx: 12, cy: 5, r: 1 }],
  },
};

// Cada modalidade aponta para um glifo (categoria) e mantém o próprio rótulo curto.
const MODALIDADE_FOCO: Record<string, { glifo: keyof typeof GLIFOS; label: string }> = {
  "m-musculacao": { glifo: "forca", label: "Musculação" },
  "m-funcional": { glifo: "forca", label: "Funcional" },
  "m-combinado": { glifo: "forca", label: "Combinado" },
  "m-caminhada": { glifo: "caminhada", label: "Caminhada" },
  "m-bike": { glifo: "bike", label: "Bicicleta" },
  "m-eliptico": { glifo: "bike", label: "Elíptico" },
  "m-hidro": { glifo: "agua", label: "Hidroginástica" },
  "m-natacao": { glifo: "agua", label: "Natação" },
  "m-mobilidade": { glifo: "mobilidade", label: "Mobilidade" },
};

export interface FocoDesenhado {
  glifo: Glifo;
  /** rótulo(s) da(s) modalidade(s) que compartilham este glifo, para o tooltip */
  label: string;
}

/**
 * Os focos de treino de uma fase, prontos para desenhar. Modalidades que compartilham
 * o mesmo glifo (bicicleta e elíptico, por exemplo) viram um ícone só, com os dois nomes
 * no rótulo, para não repetir o mesmo desenho lado a lado. No máximo 3, para caber.
 */
function focosDaFase(modalidades: string[] | undefined): FocoDesenhado[] {
  if (!modalidades?.length) return [];
  const porGlifo = new Map<keyof typeof GLIFOS, string[]>();
  for (const id of modalidades) {
    const f = MODALIDADE_FOCO[id];
    if (!f) continue;
    const atual = porGlifo.get(f.glifo) ?? [];
    if (!atual.includes(f.label)) atual.push(f.label);
    porGlifo.set(f.glifo, atual);
  }
  return [...porGlifo.entries()].slice(0, 3).map(([g, labels]) => ({ glifo: GLIFOS[g], label: labels.join(", ") }));
}

export interface SerieDesenhada {
  /** chave estável da série, para lookup de cor robusto (o PDF chaveia por id, não pelo nome exibido) */
  id: "vol" | "int" | "cpx";
  nome: string;
  cor: string;
  d: string;
}

export interface FaseDesenhada {
  indice: number;
  x0: number;
  x1: number;
  cx: number;
  /** nome curto, já cortado para caber na largura da faixa */
  nome: string;
  /** "sem 1–4" */
  spanSemanas: string;
  /** true quando a fase tem alguma semana de descarga */
  temDescarga: boolean;
  /** ícones das modalidades em foco na fase (o que se treina mais aqui) */
  focos: FocoDesenhado[];
}

export interface DesenhoProgressao {
  largura: number;
  altura: number;
  plot: { top: number; bottom: number; left: number; right: number };
  series: SerieDesenhada[];
  /** área sob a curva de volume, para o preenchimento em gradiente */
  areaVolume: string;
  fases: FaseDesenhada[];
  /** semanas de descarga/teste como faixa vertical (x central + largura) */
  alivios: { x: number; w: number }[];
  /**
   * Régua de semanas (camada micro): um tick por microciclo, colorido pelo tipo da semana
   * (carga, descarga, teste). `rotular` marca quais recebem o rótulo "S1..Sn" espaçado, para
   * um horizonte anual não sobrepor 48 números. Fonte única para a tela e o PDF.
   */
  microTicks: { x: number; semana: number; tipo: TipoMicrociclo; rotular: boolean }[];
  /** y do eixo qualitativo (rótulos "maior" e "menor") e x da coluna */
  eixo: { x: number; maiorY: number; menorY: number };
  /** topo da faixa de fase (inclui a fileira de ícones, acima das curvas) */
  bandTop: number;
  /** y central da fileira de ícones de modalidade */
  iconRowY: number;
  faixaTop: number;
  faixaBottom: number;
  /** régua de semanas: topo e base do tick vertical de cada microciclo */
  weekTickTop: number;
  weekTickBottom: number;
  /** baseline do rótulo "S1..Sn" da régua de semanas */
  weekLabelY: number;
  vazio: boolean;
}

/** Traduz o macrociclo em geometria de gráfico. Serve tanto para o React quanto para o PDF. */
export function desenharProgressao(macro: Macrociclo, largura = 720, altura = 250, nivel?: Nivel): DesenhoProgressao {
  const pts = serieSemanal(macro, nivel);
  const padX = 38;
  // Uma faixa no topo (bandTop..top) fica reservada para os ícones de modalidade da fase,
  // acima das curvas, para eles não colidirem com as linhas.
  const bandTop = 14;
  const iconRowY = 26;
  const top = 46;
  const bottom = 168;
  const left = padX;
  const right = largura - padX;
  // Régua de semanas logo abaixo do plot; a faixa de fase (nome + intervalo) vem depois.
  const weekTickTop = 173;
  const weekTickBottom = 181;
  const weekLabelY = 190;
  const faixaTop = 200;
  const faixaBottom = altura - 6;

  const n = pts.length;
  const x = (i: number) => (n <= 1 ? (left + right) / 2 : left + (i * (right - left)) / (n - 1));
  const y = (v: number) => bottom - ((v - 0.5) / 3.5) * (bottom - top);
  const meio = n > 1 ? (x(1) - x(0)) / 2 : (right - left) / 2;

  const pontosDe = (sel: (p: PontoSemana) => number) => pts.map((p, i) => ({ x: x(i), y: y(sel(p)) }));

  const volPts = pontosDe((p) => p.vol);
  const areaVolume =
    volPts.length > 0
      ? `${caminhoSuave(volPts)} L${x(n - 1).toFixed(1)},${bottom} L${x(0).toFixed(1)},${bottom} Z`
      : "";

  // Faixas de fase: uma por mesociclo, tiladas de ponta a ponta.
  let idx = 0;
  const fases: FaseDesenhada[] = macro.mesociclos.map((m, mi) => {
    const a = idx;
    const b = idx + m.microciclos.length - 1;
    idx = b + 1;
    const x0 = mi === 0 ? left - meio : x(a) - meio;
    const x1 = mi === macro.mesociclos.length - 1 ? right + meio : x(b) + meio;
    const largFaixa = x1 - x0;
    // "Fase 1: Entrada · segurança · adaptação" fica "Fase 1: Entrada"; nomes curtos passam
    // inteiros. rotuloMeso limpa o prefixo "Fase N:" de mesociclo genérico (só exibição).
    const nomeBase = rotuloMeso(m, mi).split(" · ")[0];
    return {
      indice: mi,
      x0,
      x1,
      cx: (x0 + x1) / 2,
      nome: truncar(nomeBase, Math.max(6, Math.floor(largFaixa / 6))),
      spanSemanas: m.semanaInicio === m.semanaFim ? `sem ${m.semanaInicio}` : `sem ${m.semanaInicio}–${m.semanaFim}`,
      temDescarga: m.microciclos.some((w) => w.tipo !== "carga"),
      focos: focosDaFase(m.modalidades),
    };
  });

  // Régua de semanas: um tick por microciclo, na mesma ordem (e mesmo x) das curvas. O
  // rótulo é espaçado (~12 no máximo): num plano anual de 48 semanas, um S a cada 4.
  const microsFlat = macro.mesociclos.flatMap((m) => m.microciclos);
  const passoRotulo = Math.max(1, Math.round(microsFlat.length / 12));
  const microTicks = microsFlat.map((w, i) => ({
    x: x(i),
    semana: w.semana,
    tipo: w.tipo,
    rotular: i % passoRotulo === 0,
  }));

  return {
    largura,
    altura,
    plot: { top, bottom, left, right },
    series: [
      { id: "vol", nome: "Volume", cor: "var(--primary)", d: caminhoSuave(volPts) },
      // Terracota de DADO: o coral --cta é a ação primária e não pode virar cor de série.
      { id: "int", nome: "Intensidade", cor: "var(--data-intensidade)", d: caminhoSuave(pontosDe((p) => p.int)) },
      { id: "cpx", nome: "Complexidade", cor: "var(--analysis)", d: caminhoSuave(pontosDe((p) => p.cpx)) },
    ],
    areaVolume,
    fases,
    alivios: pts.map((p, i) => (p.aliviada ? { x: x(i), w: Math.min(18, meio * 1.4) } : null)).filter((v): v is { x: number; w: number } => v !== null),
    microTicks,
    eixo: { x: left - 8, maiorY: top + 6, menorY: bottom - 2 },
    bandTop,
    iconRowY,
    faixaTop,
    faixaBottom,
    weekTickTop,
    weekTickBottom,
    weekLabelY,
    vazio: n === 0,
  };
}

/**
 * Posições dos ícones de foco de uma fase: uma fileira centrada em `cx`, na faixa do topo.
 * Cada ícone é desenhado num viewBox 24; o `transform` já leva escala e posição prontas.
 */
export function posicoesFocos(fase: FaseDesenhada, iconRowY: number, tam = 15, gap = 6) {
  const n = fase.focos.length;
  if (n === 0) return [];
  const total = n * tam + (n - 1) * gap;
  const x0 = fase.cx - total / 2;
  return fase.focos.map((f, i) => ({
    foco: f,
    x: x0 + i * (tam + gap),
    y: iconRowY - tam / 2,
    tam,
    transform: `translate(${(x0 + i * (tam + gap)).toFixed(1)}, ${(iconRowY - tam / 2).toFixed(1)}) scale(${(tam / 24).toFixed(3)})`,
  }));
}
