/**
 * Resumo do ALVO da semana em números/texto, para a tela e o PDF lerem a MESMA leitura do
 * alvo ao lado da faixa (onda MP-5). Sem JSX, sem travessão: só dados e strings, fonte única
 * do "Alvo: 3 x 12, RIR 2", do "o que mudou em relação à semana anterior" e do "por que este
 * número". Nenhum valor é inventado aqui: tudo vem dos campos de alvo que o motor gravou.
 */

import type { BlocoSessao, Microciclo } from "@/data/periodizacao";
import { getRegra } from "@/data/regrasProgressao";
import { refCurta } from "@/data/referencias";
import { tirosDaSemana } from "@/lib/gps/formatoAerobio";
import { volumeDoBloco, esforcoDoBloco } from "@/lib/gps/progressao";

/** Par rótulo -> valor de um pedaço do alvo, para virar TokenRotulado na tela e span no PDF. */
export interface TokenAlvo {
  label: string;
  value: string;
}

const fmtNum = (x: number) => (Number.isInteger(x) ? `${x}` : `${(Math.round(x * 10) / 10).toString().replace(".", ",")}`);

/** Intervalo-alvo em segundos como "90 s" ou "2 min" (múltiplos de minuto viram minutos). */
export function fmtIntervalo(seg: number): string {
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
  // Num bloco de tiros, o alvo da semana é o NÚMERO DE TIROS; os minutos viram o total de
  // trabalho ao lado. Mostrar só "14 min" num HIIT deixa a conta para quem vai treinar.
  const daSemana = tirosDaSemana(b);
  if (daSemana) t.push({ label: "Alvo", value: daSemana.texto });
  if (b.duracaoAlvoMin != null)
    t.push(daSemana ? { label: "Trabalho", value: `${b.duracaoAlvoMin} min` } : { label: "Alvo", value: `${b.duracaoAlvoMin} min` });
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

/* ------------------------- A decisão desta semana, por exercício ------------------------- */

/**
 * O SELO DE DECISÃO DE CADA EXERCÍCIO (protótipo do editor: a etiqueta à direita da linha).
 *
 * O protótipo mostra "Progredir 5%", "Manter" e "Amplitude parcial" ao lado de cada exercício,
 * e a pergunta que ele responde é a mais frequente de quem abre a semana: o que muda aqui em
 * relação à semana passada? A tela tinha a resposta só no agregado ("o que mudou" da semana
 * inteira, e apenas no modo leitura), então quem estava editando o exercício não a via.
 *
 * O NÚMERO NÃO É INVENTADO, e é por isso que o rótulo não diz "5%": ele sai da diferença
 * entre o ALVO desta semana e o da semana anterior no MESMO exercício, campos que o motor já
 * grava (ver `tokensAlvoForca`). Sem semana anterior (primeira do bloco) não há o que
 * comparar e o selo não aparece, em vez de afirmar continuidade que ninguém mediu.
 *
 * A prioridade de qual diferença mostrar é a da prescrição, não a da conta: carga e reserva
 * antes de séries e repetições, porque é a intensidade que decide o estímulo.
 */
export type TomDecisao = "progride" | "mantem" | "alivia" | "ajusta";

export interface DecisaoDoBloco {
  tom: TomDecisao;
  /** rótulo curto do selo */
  rotulo: string;
  /** a diferença que mais importa, em uma expressão curta ("+1 série", "reserva 3 para 2") */
  detalhe?: string;
  /** todas as diferenças, para o title do selo */
  completo?: string;
}

/** O mesmo exercício na semana anterior: a chave é o slug (ou o nome, quando não há slug). */
export function blocoAnteriorDe(anterior: Microciclo | undefined, bloco: BlocoSessao): BlocoSessao | undefined {
  if (!anterior) return undefined;
  const chave = bloco.exercicioSlug ?? bloco.nome ?? bloco.id;
  for (const s of anterior.sessoes)
    for (const b of s.blocos) if ((b.exercicioSlug ?? b.nome ?? b.id) === chave) return b;
  return undefined;
}

const plural = (n: number, um: string, muitos: string) => (Math.abs(n) === 1 ? um : muitos);

export function decisaoDoBloco(
  atual: BlocoSessao,
  anterior: BlocoSessao | undefined,
  tipoSemana: Microciclo["tipo"],
  tipoAnterior?: Microciclo["tipo"],
): DecisaoDoBloco | null {
  if (!temAlvoForca(atual) && !temAlvoAerobio(atual)) return null;

  const difs: string[] = [];
  if (anterior) {
    // Ordem de prioridade da prescrição: intensidade primeiro. As frases dizem "de X para Y",
    // como o "o que mudou" da semana, e nunca "+N": num motor em que a posição das repetições
    // dentro da faixa é sinal de INTENSIDADE, um "+1 repetição" com selo de progressão ao lado
    // se lê como contradição.
    if (atual.cargaRelativaAlvo != null && anterior.cargaRelativaAlvo != null && atual.cargaRelativaAlvo !== anterior.cargaRelativaAlvo)
      difs.push(`${fmtNum(anterior.cargaRelativaAlvo)} para ${fmtNum(atual.cargaRelativaAlvo)}% de 1RM`);
    if (atual.rirAlvo != null && anterior.rirAlvo != null && atual.rirAlvo !== anterior.rirAlvo)
      difs.push(`reserva ${anterior.rirAlvo} para ${atual.rirAlvo}`);
    if (atual.seriesAlvo != null && anterior.seriesAlvo != null && atual.seriesAlvo !== anterior.seriesAlvo)
      difs.push(`${anterior.seriesAlvo} para ${atual.seriesAlvo} ${plural(atual.seriesAlvo, "série", "séries")}`);
    if (atual.repsAlvo != null && anterior.repsAlvo != null && atual.repsAlvo !== anterior.repsAlvo)
      difs.push(`${anterior.repsAlvo} para ${atual.repsAlvo} ${plural(atual.repsAlvo, "repetição", "repetições")}`);
    if (atual.duracaoAlvoMin != null && anterior.duracaoAlvoMin != null && atual.duracaoAlvoMin !== anterior.duracaoAlvoMin)
      difs.push(`${anterior.duracaoAlvoMin} para ${atual.duracaoAlvoMin} min`);
    if (atual.rpeAlvo != null && anterior.rpeAlvo != null && atual.rpeAlvo !== anterior.rpeAlvo)
      difs.push(`PSE ${anterior.rpeAlvo} para ${atual.rpeAlvo}`);
  }

  const completo = difs.length ? difs.join(" · ") : undefined;
  const detalhe = difs[0];

  // A descarga é decisão da SEMANA, e vale mesmo quando a dose de um exercício não mudou:
  // é o rótulo honesto do que aquele bloco está fazendo ali.
  if (tipoSemana === "deload") return { tom: "alivia", rotulo: "Alivia", detalhe, completo };
  if (!anterior) return null;
  /*
   * A SEMANA DEPOIS DA DESCARGA NÃO "PROGRIDE": ELA RETOMA.
   *
   * A comparação é sempre com a semana imediatamente anterior, e depois de uma descarga a dose
   * sobe porque a descarga a tinha baixado de propósito. Chamar isso de progressão faria o selo
   * comemorar a volta ao patamar de duas semanas atrás como se fosse ganho novo.
   */
  if (tipoAnterior === "deload") return { tom: "progride", rotulo: "Retoma", detalhe, completo };
  if (!difs.length) return { tom: "mantem", rotulo: "Mantém" };

  /*
   * A DIREÇÃO SAI DA MESMA RÉGUA DO AGREGADO DA SEMANA (ver estadoSemana): volume por séries
   * x repetições, intensidade pelo esforço do bloco. Uma régua própria aqui produziria um
   * selo dizendo "Progride" embaixo de uma semana marcada como "Regressão", e a tela tem as
   * duas coisas à vista ao mesmo tempo.
   */
  let s = 0;
  const dv = volumeDoBloco(atual) - volumeDoBloco(anterior);
  if (dv > 1e-6) s++;
  else if (dv < -1e-6) s--;
  const ea = esforcoDoBloco(anterior);
  const eb = esforcoDoBloco(atual);
  if (ea != null && eb != null) {
    if (eb > ea + 1e-6) s++;
    else if (eb < ea - 1e-6) s--;
  }
  if (s > 0) return { tom: "progride", rotulo: "Progride", detalhe, completo };
  if (s < 0) return { tom: "alivia", rotulo: "Alivia", detalhe, completo };
  // Volume e esforço se anularam, mas alguma coisa mudou: é ajuste, não manutenção.
  return { tom: "ajusta", rotulo: "Ajusta", detalhe, completo };
}
