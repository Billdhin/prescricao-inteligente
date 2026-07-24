/**
 * A curva de progressão do plano, num lugar só.
 *
 * A tela desenha em SVG do React e o PDF desenha em SVG de texto. Se cada um calculasse
 * a própria curva, o documento que o profissional assina mostraria uma progressão e o
 * app mostraria outra. Os dois pedem a mesma geometria daqui.
 *
 * A curva agora é CONSEQUÊNCIA dos alvos reais (onda MP-5): `serieSemanal` AGREGA os blocos
 * de cada semana (Σ séries×reps + minutos de aeróbio para o volume; esforço médio para a
 * intensidade; métodos avançados para a complexidade). Editar uma sessão (subir seriesAlvo)
 * move a curva de verdade; a descarga cai porque os alvos caíram, não por um multiplicador
 * fixo. O eixo segue sem número (as três séries são normalizadas para a mesma banda de
 * plotagem, comparável, preservando a forma da progressão): prometer uma carga em quilos onde
 * só há a dose relativa da diretriz seria inventar dado. As faixas ao pé dão a fase e quantas
 * semanas nela.
 */

import { intervaloDe } from "@/lib/gps/faixasParse";
import {
  rotuloMeso,
  type Macrociclo,
  type Microciclo,
  type BlocoSessao,
  type Tendencia,
  type TipoMicrociclo,
} from "@/data/periodizacao";
import type { Nivel } from "@/data/types";

export interface PontoSemana {
  semana: number;
  vol: number;
  int: number;
  cpx: number;
  /** semana que não é de carga (descarga ou teste) */
  aliviada: boolean;
}

/* --------------------------- Agregação dos alvos reais (MP-5) --------------------------- */

/** Meio de uma faixa-texto ("3 a 4" -> 3.5; "acima de 15" -> 15; "até 90" -> 90). null sem número. */
function meioFaixa(texto?: string): number | null {
  if (!texto) return null;
  const iv = intervaloDe(texto);
  if (!iv) return null;
  if (iv.max === Infinity) return iv.min; // "acima de N": progressão só teria piso
  if (iv.min === 0) return iv.max; // "até N": progressão só teria teto
  return (iv.min + iv.max) / 2;
}

const ehForca = (b: BlocoSessao) => b.tipo !== "aerobio";
const ehAerobio = (b: BlocoSessao) => b.tipo === "aerobio";
const blocosDe = (m: Microciclo) => m.sessoes.flatMap((s) => s.blocos);

/**
 * Índice de esforço 0..100 de um bloco (maior = mais intenso), lendo o ALVO quando houver:
 * carga relativa (%1RM) direto; o inverso do RIR (menos reserva = mais intenso); a PSE do
 * aeróbio em décimos; ou o meio da intensidade textual quando ela é parseável (ex.: "40 a
 * 60% de 1RM"). Sem nenhum desses, devolve null (não inventa número para intensidade textual).
 */
function esforcoDoBloco(b: BlocoSessao): number | null {
  if (b.cargaRelativaAlvo != null) return b.cargaRelativaAlvo;
  if (b.rirAlvo != null) return Math.max(0, 100 - b.rirAlvo * 10);
  if (b.rpeAlvo != null) return b.rpeAlvo * 10;
  return meioFaixa(b.intensidade);
}

/** O agregado de uma semana: volume (dose total) e intensidade (esforço médio) reais. */
export interface AgregadoSemana {
  /** Σ (séries×reps) da força + Σ minutos do aeróbio. Lê o alvo; cai na faixa sem ele. */
  volume: number;
  /** esforço médio (ponderado pelo volume) da semana; null quando nada é parseável. */
  intensidade: number | null;
}

/**
 * Agrega os blocos REAIS de uma semana em (volume, intensidade). Fonte ÚNICA lida pelo
 * gráfico (serieSemanal), pelo selo de estado (estadoSemana) e pelo PDF. É a prova de que a
 * visualização é consequência dos alvos: subir seriesAlvo de um bloco sobe o volume aqui, e
 * por isso move a curva. O número absoluto não vale nada sozinho; o que importa é COMPARAR
 * semanas do mesmo plano (por isso serieSemanal normaliza, e o selo compara vizinhas).
 */
export function agregadoSemana(m: Microciclo): AgregadoSemana {
  let volume = 0;
  let somaEsforco = 0;
  let pesoEsforco = 0;
  for (const b of blocosDe(m)) {
    if (ehForca(b)) {
      const series = b.seriesAlvo ?? meioFaixa(b.series) ?? 0;
      const reps = b.repsAlvo ?? meioFaixa(b.reps) ?? 0;
      volume += series * reps;
      const e = esforcoDoBloco(b);
      if (e != null) {
        const peso = Math.max(series, 1);
        somaEsforco += e * peso;
        pesoEsforco += peso;
      }
    } else if (ehAerobio(b)) {
      // Minutos de aeróbio somam ao volume (coerente com o produto: a dose total da semana).
      const min = b.duracaoAlvoMin ?? meioFaixa(b.duracao) ?? 0;
      volume += min;
      const e = esforcoDoBloco(b);
      if (e != null) {
        somaEsforco += e;
        pesoEsforco += 1;
      }
    }
  }
  return { volume, intensidade: pesoEsforco > 0 ? somaEsforco / pesoEsforco : null };
}

/**
 * Densidade de complexidade REAL de uma semana: cada método avançado (drop-set, rest-pause,
 * pirâmide...) e cada agrupamento (bi/tri/super-set) conta uma vez. É o único sinal de
 * complexidade que existe por bloco hoje; quando ele não muda de semana para semana (o caso
 * comum dos planos gerados), a FORMA vem da tendência declarada da fase (ver cpxRaw abaixo).
 */
function complexidadeReal(m: Microciclo): number {
  let d = 0;
  const gruposVistos = new Set<string>();
  for (const b of blocosDe(m)) {
    if (b.grupoMetodo) {
      if (!gruposVistos.has(b.grupoMetodo)) {
        gruposVistos.add(b.grupoMetodo);
        d += 1;
      }
      continue; // o método do grupo conta uma vez pelo grupo, não por bloco
    }
    if (b.metodo && b.metodo !== "tradicional") d += 1;
  }
  return d;
}

/* --------------------- Contexto de tendência (fallback qualitativo) --------------------- */

interface SemanaCtx {
  micro: Microciclo;
  tendVol: Tendencia;
  tendInt: Tendencia;
  tendCpx: Tendencia;
  mesoIdx: number;
  /** posição entre as semanas de CARGA do meso (a descarga usa a última) */
  posCarga: number;
  cargasNoMeso: number;
  deload: boolean;
}

function contextoDasSemanas(macro: Macrociclo): SemanaCtx[] {
  const out: SemanaCtx[] = [];
  macro.mesociclos.forEach((meso, mesoIdx) => {
    const cargasNoMeso = Math.max(1, meso.microciclos.filter((w) => w.tipo === "carga").length);
    let pos = 0;
    meso.microciclos.forEach((w) => {
      const deload = w.tipo !== "carga";
      if (!deload) pos++;
      out.push({
        micro: w,
        tendVol: meso.tendenciaVolume,
        tendInt: meso.tendenciaIntensidade,
        tendCpx: meso.tendenciaComplexidade,
        mesoIdx,
        posCarga: deload ? cargasNoMeso : pos,
        cargasNoMeso,
        deload,
      });
    });
  });
  return out;
}

const passoTend: Record<Tendencia, number> = { sobe: 1, reduz: -1, estavel: 0, varia: 0 };

/**
 * Curva qualitativa por semana a partir da TENDÊNCIA declarada da fase, usada como FALLBACK
 * quando não há sinal real para uma série (ex.: intensidade textual "alta", sem %1RM/RIR) e
 * como forma-base da complexidade. Reproduz o espírito da curva antiga (a fase desloca a base;
 * "sobe" rampa dentro do meso; "varia" ondula; a descarga cai), mas só entra onde o agregado
 * real não tem o que dizer.
 */
function nivelPorTendencia(ctx: SemanaCtx[], pick: (c: SemanaCtx) => Tendencia): number[] {
  let base = 0;
  let mesoAtual = -1;
  return ctx.map((c) => {
    const tend = pick(c);
    if (c.mesoIdx !== mesoAtual) {
      mesoAtual = c.mesoIdx;
      base += passoTend[tend];
    }
    const frac = c.cargasNoMeso > 1 ? (c.posCarga - 1) / (c.cargasNoMeso - 1) : 0;
    let v: number;
    if (tend === "sobe") v = base - 1 + frac;
    else if (tend === "reduz") v = base - frac;
    else if (tend === "varia") v = base + (c.posCarga % 2 === 1 ? -0.34 : 0.34);
    else v = base;
    if (c.deload) v -= 1;
    return v;
  });
}

/* ------------------------------ Normalização para a banda ------------------------------ */

// A banda de plotagem que o eixo já usa (y = f(v) mapeia ~[0.5, 4]). As três séries são
// normalizadas para DENTRO dela, preservando a forma: coexistem no mesmo eixo em escala
// comparável, sem prometer uma unidade absoluta.
const BANDA_LO = 1.0;
const BANDA_HI = 3.5;
const BANDA_MEIO = (BANDA_LO + BANDA_HI) / 2;
const clampPlot = (v: number) => Math.max(0.5, Math.min(4, v));

/**
 * Normaliza uma série (min->BANDA_LO, max->BANDA_HI), preservando a FORMA (transformação
 * afim, monotônica). Uma série praticamente chata (variação relativa < 1%, ruído de
 * arredondamento) é desenhada plana no meio da banda, para não amplificar um zero em onda.
 */
function normalizar(xs: number[]): number[] {
  if (!xs.length) return xs;
  const lo = Math.min(...xs);
  const hi = Math.max(...xs);
  const span = hi - lo;
  const ref = Math.max(Math.abs(hi), Math.abs(lo), 1e-9);
  if (span / ref < 0.01) return xs.map(() => BANDA_MEIO);
  return xs.map((x) => BANDA_LO + ((x - lo) / span) * (BANDA_HI - BANDA_LO));
}

/** Preenche buracos (null) de uma série carregando o vizinho conhecido, para a curva não cortar. */
function preencher(xs: (number | null)[]): number[] {
  const out: number[] = new Array(xs.length).fill(0);
  let ultimo: number | null = null;
  for (let i = 0; i < xs.length; i++) {
    if (xs[i] != null) {
      out[i] = xs[i]!;
      ultimo = xs[i]!;
    } else {
      out[i] = ultimo ?? 0;
    }
  }
  // Buracos iniciais (antes do primeiro valor conhecido) herdam o primeiro valor conhecido.
  const idxPrimeiro = xs.findIndex((v) => v != null);
  if (idxPrimeiro > 0) for (let i = 0; i < idxPrimeiro; i++) out[i] = xs[idxPrimeiro]!;
  return out;
}

/**
 * A curva é o AGREGADO dos alvos reais, normalizado para a banda de plotagem.
 *
 * - VOLUME: sempre real (Σ séries×reps da força + minutos do aeróbio). Editar seriesAlvo move
 *   esta curva; a descarga cai porque a dose caiu, não por um multiplicador fixo.
 * - INTENSIDADE: esforço médio real quando há %1RM/RIR/PSE; sem esses (intensidade só textual),
 *   cai na tendência declarada da fase, para o plano ainda mostrar a direção prevista.
 * - COMPLEXIDADE: a tendência declarada dá a forma; os métodos avançados dão um empurrão real
 *   (adicionar um drop-set levanta a linha um pouco), que é o único sinal por bloco disponível.
 *
 * `nivel` é aceito por compatibilidade de assinatura; a curva agora sai da dose real (que já
 * depende do nível, via as faixas por nível), não de um deslocamento por nível.
 */
export function serieSemanal(macro: Macrociclo, _nivel?: Nivel): PontoSemana[] {
  const ctx = contextoDasSemanas(macro);
  if (!ctx.length) return [];

  const volRaw = ctx.map((c) => agregadoSemana(c.micro).volume);

  const intAgg = ctx.map((c) => agregadoSemana(c.micro).intensidade);
  const temIntReal = intAgg.some((v) => v != null);
  const intRaw = temIntReal ? preencher(intAgg) : nivelPorTendencia(ctx, (c) => c.tendInt);

  const cpxTend = nivelPorTendencia(ctx, (c) => c.tendCpx);
  const cpxRaw = ctx.map((c, i) => cpxTend[i] + complexidadeReal(c.micro) * 0.25);

  const vol = normalizar(volRaw);
  const int = normalizar(intRaw);
  const cpx = normalizar(cpxRaw);

  return ctx.map((c, i) => ({
    semana: c.micro.semana,
    vol: clampPlot(vol[i]),
    int: clampPlot(int[i]),
    cpx: clampPlot(cpx[i]),
    aliviada: c.micro.tipo !== "carga",
  }));
}

/* ------------------------------ Estado da semana (selo) ------------------------------ */

/** Estado de uma semana em relação à anterior, derivado (nunca inventado). */
export type EstadoSemana = "progressao" | "manutencao" | "regressao" | "descarga" | "teste" | "inicio";

/** Rótulo de exibição de cada estado (fonte única para a tela e o PDF). */
export const ESTADO_LABEL: Record<EstadoSemana, string> = {
  progressao: "Progressão",
  manutencao: "Manutenção",
  regressao: "Regressão",
  descarga: "Descarga",
  teste: "Teste",
  inicio: "Início do bloco",
};

/**
 * O estado da semana sai do TIPO (descarga/teste vêm do microciclo) e, para as semanas de
 * carga, do delta agregado de volume e intensidade vs a semana anterior: as duas subindo (ou
 * uma subindo sem a outra cair) é progressão; as duas paradas é manutenção; alguma caindo sem
 * a outra compensar é regressão. Sem semana anterior (início do bloco), fica "inicio". É
 * derivado do agregado real; não crava juízo onde não há dado (intensidade textual não conta).
 */
export function estadoSemana(atual: Microciclo, anterior?: Microciclo): EstadoSemana {
  if (atual.tipo === "deload") return "descarga";
  if (atual.tipo === "teste") return "teste";
  if (!anterior) return "inicio";
  const a = agregadoSemana(anterior);
  const b = agregadoSemana(atual);
  let s = 0;
  if (b.volume > a.volume + 1e-6) s++;
  else if (b.volume < a.volume - 1e-6) s--;
  if (a.intensidade != null && b.intensidade != null) {
    if (b.intensidade > a.intensidade + 1e-6) s++;
    else if (b.intensidade < a.intensidade - 1e-6) s--;
  }
  return s > 0 ? "progressao" : s < 0 ? "regressao" : "manutencao";
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
