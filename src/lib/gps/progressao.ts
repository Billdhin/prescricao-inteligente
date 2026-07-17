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

import type { Macrociclo, Tendencia } from "@/data/periodizacao";

const NIVEL_TENDENCIA: Record<Tendencia, number> = { reduz: -0.6, estavel: 0, sobe: 0.6, varia: 0 };

export interface PontoSemana {
  semana: number;
  vol: number;
  int: number;
  cpx: number;
  /** semana que não é de carga (descarga ou teste) */
  aliviada: boolean;
}

export function serieSemanal(macro: Macrociclo): PontoSemana[] {
  const pontos: PontoSemana[] = [];
  macro.mesociclos.forEach((m, mi) => {
    m.microciclos.forEach((w, wi) => {
      let vol = 2 + mi * 0.35 + NIVEL_TENDENCIA[m.tendenciaVolume];
      let int = 1.6 + mi * 0.5 + NIVEL_TENDENCIA[m.tendenciaIntensidade];
      const cpx = 1.6 + mi * 0.4 + NIVEL_TENDENCIA[m.tendenciaComplexidade];
      if (m.tendenciaVolume === "varia") vol += wi % 2 === 0 ? 0.4 : -0.4;
      if (m.tendenciaIntensidade === "varia") int += wi % 2 === 0 ? -0.4 : 0.5;
      if (w.tipo === "deload") {
        vol *= 0.6;
        int *= 0.7;
      }
      const clamp = (n: number) => Math.max(0.5, Math.min(4, n));
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

export interface SerieDesenhada {
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
  rotulos: { x: number; semana: number }[];
  /** y do eixo qualitativo (rótulos "maior" e "menor") e x da coluna */
  eixo: { x: number; maiorY: number; menorY: number };
  faixaTop: number;
  faixaBottom: number;
  weekLabelY: number;
  vazio: boolean;
}

/** Traduz o macrociclo em geometria de gráfico. Serve tanto para o React quanto para o PDF. */
export function desenharProgressao(macro: Macrociclo, largura = 720, altura = 250): DesenhoProgressao {
  const pts = serieSemanal(macro);
  const padX = 38;
  const top = 18;
  const bottom = 168;
  const left = padX;
  const right = largura - padX;
  const weekLabelY = 184;
  const faixaTop = 198;
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
    // "Fase 1: Entrada · segurança · adaptação" fica "Fase 1: Entrada"; nomes curtos passam inteiros.
    const nomeBase = m.nome.split(" · ")[0];
    return {
      indice: mi,
      x0,
      x1,
      cx: (x0 + x1) / 2,
      nome: truncar(nomeBase, Math.max(6, Math.floor(largFaixa / 6))),
      spanSemanas: m.semanaInicio === m.semanaFim ? `sem ${m.semanaInicio}` : `sem ${m.semanaInicio}–${m.semanaFim}`,
      temDescarga: m.microciclos.some((w) => w.tipo !== "carga"),
    };
  });

  return {
    largura,
    altura,
    plot: { top, bottom, left, right },
    series: [
      { nome: "Volume", cor: "var(--primary)", d: caminhoSuave(volPts) },
      { nome: "Intensidade", cor: "var(--cta)", d: caminhoSuave(pontosDe((p) => p.int)) },
      { nome: "Complexidade", cor: "var(--analysis)", d: caminhoSuave(pontosDe((p) => p.cpx)) },
    ],
    areaVolume,
    fases,
    alivios: pts.map((p, i) => (p.aliviada ? { x: x(i), w: Math.min(18, meio * 1.4) } : null)).filter((v): v is { x: number; w: number } => v !== null),
    rotulos: pts.map((p, i) => ({ x: x(i), semana: p.semana })),
    eixo: { x: left - 8, maiorY: top + 6, menorY: bottom - 2 },
    faixaTop,
    faixaBottom,
    weekLabelY,
    vazio: n === 0,
  };
}
