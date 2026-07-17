/**
 * A curva de progressão do plano, num lugar só.
 *
 * A tela desenha em SVG do React e o PDF desenha em SVG de texto. Se cada um calculasse
 * a própria curva, o documento que o profissional assina mostraria uma progressão e o
 * app mostraria outra. Os dois pedem os mesmos pontos daqui.
 *
 * A curva é QUALITATIVA: ela mostra a direção que o plano toma (sobe, mantém, reduz,
 * varia), não uma carga em quilos. Por isso o eixo não tem número: prometer precisão
 * onde só existe tendência seria inventar dado.
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

export interface SerieDesenhada {
  nome: string;
  cor: string;
  d: string;
}

export interface DesenhoProgressao {
  largura: number;
  altura: number;
  series: SerieDesenhada[];
  /** x das semanas de descarga/teste, para a barra de fundo */
  alivios: number[];
  rotulos: { x: number; semana: number }[];
  vazio: boolean;
}

/** Traduz os pontos em caminhos SVG. Serve tanto para o React quanto para o PDF. */
export function desenharProgressao(macro: Macrociclo, largura = 640, altura = 180): DesenhoProgressao {
  const pts = serieSemanal(macro);
  const padX = 28;
  const padY = 18;
  const n = pts.length;
  const x = (i: number) => padX + (i * (largura - padX * 2)) / Math.max(1, n - 1);
  const y = (v: number) => padY + (altura - padY * 2) * (1 - (v - 0.5) / 3.5);
  const caminho = (sel: (p: PontoSemana) => number) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(sel(p)).toFixed(1)}`).join(" ");

  return {
    largura,
    altura,
    series: [
      { nome: "Volume", cor: "var(--primary)", d: caminho((p) => p.vol) },
      { nome: "Intensidade", cor: "var(--cta)", d: caminho((p) => p.int) },
      { nome: "Complexidade", cor: "var(--analysis)", d: caminho((p) => p.cpx) },
    ],
    alivios: pts.map((p, i) => (p.aliviada ? x(i) : -1)).filter((v) => v >= 0),
    rotulos: pts.map((p, i) => ({ x: x(i), semana: p.semana })),
    vazio: n === 0,
  };
}
