/**
 * Resumo do ALVO da semana em números/texto, para a tela e o PDF lerem a MESMA leitura do
 * alvo ao lado da faixa (onda MP-5). Sem JSX, sem travessão: só dados e strings, fonte única
 * do "Alvo: 3 x 12, RIR 2", do "o que mudou em relação à semana anterior" e do "por que este
 * número". Nenhum valor é inventado aqui: tudo vem dos campos de alvo que o motor gravou.
 */

import type { BlocoSessao, Microciclo } from "@/data/periodizacao";
import { getRegra } from "@/data/regrasProgressao";
import { refCurta } from "@/data/referencias";

/** Par rótulo -> valor de um pedaço do alvo, para virar TokenRotulado na tela e span no PDF. */
export interface TokenAlvo {
  label: string;
  value: string;
}

const fmtNum = (x: number) => (Number.isInteger(x) ? `${x}` : `${(Math.round(x * 10) / 10).toString().replace(".", ",")}`);

/** Intervalo-alvo em segundos como "90 s" ou "2 min" (múltiplos de minuto viram minutos). */
function fmtIntervalo(seg: number): string {
  if (seg >= 60 && seg % 60 === 0) return `${seg / 60} min`;
  if (seg >= 60) return `${fmtNum(seg / 60)} min`;
  return `${Math.round(seg)} s`;
}

/* --------------------------------- Alvo da força --------------------------------- */

export function temAlvoForca(b: BlocoSessao): boolean {
  return (
    b.seriesAlvo != null ||
    b.repsAlvo != null ||
    b.rirAlvo != null ||
    b.cargaRelativaAlvo != null ||
    b.intervaloAlvoSeg != null
  );
}

/** Tokens do alvo de FORÇA da semana: séries x reps, %1RM ou RIR, intervalo. */
export function tokensAlvoForca(b: BlocoSessao): TokenAlvo[] {
  const t: TokenAlvo[] = [];
  if (b.seriesAlvo != null && b.repsAlvo != null) t.push({ label: "Alvo", value: `${b.seriesAlvo} x ${b.repsAlvo}` });
  else if (b.seriesAlvo != null) t.push({ label: "Séries", value: `${b.seriesAlvo}` });
  else if (b.repsAlvo != null) t.push({ label: "Reps", value: `${b.repsAlvo}` });
  if (b.cargaRelativaAlvo != null) t.push({ label: "Carga", value: `${fmtNum(b.cargaRelativaAlvo)}% 1RM` });
  if (b.rirAlvo != null) t.push({ label: "RIR", value: `${b.rirAlvo}` });
  if (b.intervaloAlvoSeg != null) t.push({ label: "Intervalo", value: fmtIntervalo(b.intervaloAlvoSeg) });
  return t;
}

/* -------------------------------- Alvo do aeróbio -------------------------------- */

export function temAlvoAerobio(b: BlocoSessao): boolean {
  return b.duracaoAlvoMin != null || b.rpeAlvo != null || b.zonaFC != null;
}

/** Tokens do alvo do AERÓBIO da semana: duração-alvo, PSE (RPE) e zona de FC (quando houver). */
export function tokensAlvoAerobio(b: BlocoSessao): TokenAlvo[] {
  const t: TokenAlvo[] = [];
  if (b.duracaoAlvoMin != null) t.push({ label: "Alvo", value: `${b.duracaoAlvoMin} min` });
  if (b.rpeAlvo != null) t.push({ label: "RPE", value: `${b.rpeAlvo}` });
  if (b.zonaFC != null) t.push({ label: "Zona", value: b.zonaFC });
  return t;
}

/* ------------------------------ Por que este número ------------------------------ */

/** A regra da progressão que fundamenta o alvo do bloco, com a referência curta ("Autor (ano)"). */
export function porQueNumero(b: BlocoSessao): { criterio: string; base: string } | null {
  if (!b.origemRegraId) return null;
  const r = getRegra(b.origemRegraId);
  if (!r) return null;
  const base = r.refId.map(refCurta).filter(Boolean).join(" · ");
  return { criterio: r.criterios, base };
}

/** Regras DISTINTAS usadas nos blocos de uma sessão (para uma nota "por quê" única por sessão). */
export function regrasDaSessao(blocos: BlocoSessao[]): { criterio: string; base: string }[] {
  const vistas = new Set<string>();
  const out: { criterio: string; base: string }[] = [];
  for (const b of blocos) {
    if (!b.origemRegraId || vistas.has(b.origemRegraId)) continue;
    const q = porQueNumero(b);
    if (!q) continue;
    vistas.add(b.origemRegraId);
    out.push(q);
  }
  return out;
}

/* --------------------- O que mudou em relação à semana anterior --------------------- */

function primeirosForca(m: Microciclo): Map<string, BlocoSessao> {
  const map = new Map<string, BlocoSessao>();
  for (const s of m.sessoes)
    for (const b of s.blocos) {
      if (b.tipo === "aerobio") continue;
      const key = b.exercicioSlug ?? b.nome ?? b.id;
      if (!map.has(key)) map.set(key, b);
    }
  return map;
}

function primeiroAerobio(m: Microciclo): BlocoSessao | undefined {
  for (const s of m.sessoes) for (const b of s.blocos) if (b.tipo === "aerobio") return b;
  return undefined;
}

/**
 * Lista, em frases curtas, o que mudou no ALVO desta semana vs a anterior, por exercício e no
 * aeróbio (ex.: "Leg press: 2 para 3 séries", "Aeróbio: 20 para 24 min"). Compara a primeira
 * ocorrência de cada exercício (chave slug ou nome). Quando só o volume muda, anota
 * "Intensidade mantida" (e vice-versa), no espírito do exemplo do fundador. Sem mudança, diz
 * que a dose se manteve.
 */
export function compararAlvos(anterior: Microciclo, atual: Microciclo): string[] {
  const frases: string[] = [];
  let mudouVolume = false;
  let mudouIntensidade = false;

  const ant = primeirosForca(anterior);
  const atu = primeirosForca(atual);
  for (const [key, b] of atu) {
    const a = ant.get(key);
    if (!a) continue;
    const nome = b.nome ?? "Exercício";
    if (a.seriesAlvo != null && b.seriesAlvo != null && a.seriesAlvo !== b.seriesAlvo) {
      frases.push(`${nome}: ${a.seriesAlvo} para ${b.seriesAlvo} séries`);
      mudouVolume = true;
    }
    if (a.repsAlvo != null && b.repsAlvo != null && a.repsAlvo !== b.repsAlvo) {
      frases.push(`${nome}: ${a.repsAlvo} para ${b.repsAlvo} repetições`);
      mudouVolume = true;
    }
    if (a.cargaRelativaAlvo != null && b.cargaRelativaAlvo != null && a.cargaRelativaAlvo !== b.cargaRelativaAlvo) {
      frases.push(`${nome}: ${fmtNum(a.cargaRelativaAlvo)}% para ${fmtNum(b.cargaRelativaAlvo)}% de 1RM`);
      mudouIntensidade = true;
    }
    if (a.rirAlvo != null && b.rirAlvo != null && a.rirAlvo !== b.rirAlvo) {
      frases.push(`${nome}: RIR ${a.rirAlvo} para ${b.rirAlvo}`);
      mudouIntensidade = true;
    }
  }

  const aa = primeiroAerobio(anterior);
  const ab = primeiroAerobio(atual);
  if (aa && ab) {
    if (aa.duracaoAlvoMin != null && ab.duracaoAlvoMin != null && aa.duracaoAlvoMin !== ab.duracaoAlvoMin) {
      frases.push(`Aeróbio: ${aa.duracaoAlvoMin} para ${ab.duracaoAlvoMin} min`);
      mudouVolume = true;
    }
    if (aa.rpeAlvo != null && ab.rpeAlvo != null && aa.rpeAlvo !== ab.rpeAlvo) {
      frases.push(`Aeróbio: RPE ${aa.rpeAlvo} para ${ab.rpeAlvo}`);
      mudouIntensidade = true;
    }
  }

  if (!frases.length) return ["Mesma dose da semana anterior."];
  if (mudouVolume && !mudouIntensidade) frases.push("Intensidade mantida.");
  else if (mudouIntensidade && !mudouVolume) frases.push("Volume mantido.");
  return frases;
}
