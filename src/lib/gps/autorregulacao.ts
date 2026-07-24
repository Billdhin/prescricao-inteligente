import type { Execucao } from "@/data/execucao";
import { exercises } from "@/data/exercises";

/**
 * Motor de autorregulação da periodização (dupla progressão) COM gate de segurança (onda MP-6).
 *
 * Dado o que o aluno EXECUTOU num microciclo, calcula a carga sugerida para a próxima semana
 * daquele exercício. A regra é a dupla progressão consagrada: enquanto o aluno acumula
 * repetições dentro da faixa, a carga se mantém; quando ele cumpre o TOPO da faixa em todas as
 * séries com esforço controlado, a carga sobe pelo menor incremento; repetições abaixo da faixa
 * ou esforço muito alto seguram ou descarregam.
 *
 * PRINCÍPIO DE SEGURANÇA (acima de tudo): toda progressão é uma SUGESTÃO que o profissional
 * aprova, edita, rejeita ou bloqueia. E nenhuma sugestão de PROGREDIR sai quando há dor, sintoma
 * ou semáforo vermelho/amarelo: aí a decisão é MANTER, REGREDIR ou ENCAMINHAR. O gate abaixo
 * cruza o semáforo diário, a dor da última avaliação e os sinais relatados, e NUNCA deixa passar
 * um "subir" com bandeira levantada.
 *
 * Nunca inventa um número de partida: trabalha sobre a carga que o aluno de fato levantou. O
 * incremento é percentual e conservador, DIFERENCIADO por padrão do exercício (regra declarada
 * forca-incremento-por-segmento: multiarticular/MMII na parte alta da faixa 2 a 10%, mono/MMSS na
 * parte baixa), arredondado ao 0,5 kg, e sempre com justificativa. A decisão final é do profissional.
 */

export interface FaixaReps {
  min: number;
  max: number;
}

export type AcaoCarga = "subir" | "manter" | "descarregar" | "encaminhar" | "sem-dado";

export interface AjusteCarga {
  /** carga sugerida para a próxima semana, em kg; undefined quando falta dado ou é encaminhar */
  proximaCarga?: number;
  /** carga de referência (a última executada) */
  cargaBase?: number;
  /** variação relativa aplicada (0, +incremento, -descarga) */
  delta: number;
  acao: AcaoCarga;
  motivo: string;
}

/**
 * Contexto de SEGURANÇA cruzado com a dupla progressão. Com qualquer sinal aqui, "subir" está
 * proibido: o gate rebaixa para manter, ou força descarregar/encaminhar conforme a gravidade.
 */
export interface CtxSeguranca {
  /** o último semáforo do aluno é "não liberado" e segue pendente (estadoSemaforo.vermelhoPendente) */
  vermelhoPendente?: boolean;
  /** há um semáforo "amarelo" (liberado com ressalva) registrado hoje */
  amareloHoje?: boolean;
  /** dor 0 a 10 relatada na última avaliação */
  dor?: number;
  /** sinais/regiões de dor relatados na última avaliação (nomes livres) */
  sintomas?: string[];
}

/** Modificador de progressão por perfil clínico (teto de esforço menor e passo reduzido). */
export interface ModProgressaoAjuste {
  /** teto de RPE (mesma escala do registro, 6 a 10) para autorizar a progressão */
  pseTeto?: number;
  /** fração do incremento normal (0..1): perfil que progride num passo menor */
  fatorIncremento?: number;
}

export interface OpcoesAjuste {
  rpeAlvoMax?: number;
  incrementoPct?: number;
  descargaPct?: number;
  /** contexto de segurança (semáforo, dor, sintoma): proíbe progredir e pode encaminhar */
  seguranca?: CtxSeguranca;
  /** modificador do perfil clínico do aluno (teto de esforço menor, passo reduzido) */
  modPerfil?: ModProgressaoAjuste;
}

const DEFAULTS = {
  /** RPE acima disso, por sessão, indica esforço alto demais para progredir */
  rpeAlvoMax: 8,
  /** menor incremento prático, como fração da carga (progressão gradual) */
  incrementoPct: 0.025,
  /** descarga quando o desempenho pede recuo */
  descargaPct: 0.1,
};

// Gatilhos de SEGURANÇA na escala de dor 0 a 10 da avaliação. São limiares de CAUTELA do
// produto (não doses): qualquer dor já proíbe progredir (progredir com dor é vedado), dor
// moderada pede recuo e dor forte pede reavaliação/encaminhamento. Conservadores por decisão;
// a palavra final é sempre do profissional.
const DOR_MIN = 1; // qualquer dor relatada bloqueia a progressão
const DOR_DESCARGA = 4; // dor moderada: recuar (descarregar)
const DOR_ENCAMINHA = 7; // dor forte: reavaliar/encaminhar antes de mexer na carga

/* ---------------------------- Incremento por padrão de exercício ---------------------------- */

// Repartição DECLARADA da faixa 2 a 10% do ACSM por padrão de exercício (regra
// forca-incremento-por-segmento, confiança fraca/consenso NSCA, sem RCT comparando incrementos
// por segmento): multiarticular / grande massa usa a parte ALTA (piso 5%); mono / MMSS usa a
// parte BAIXA (piso 2%). Usamos o PISO de cada sub-banda (o menor passo, mais conservador); os
// números 2/5/10 saem da faixa do rulepack, nenhum número novo é inventado.
export const INCREMENTO_MMII = 0.05; // parte alta (5 a 10%): multiarticular / membros inferiores
export const INCREMENTO_MMSS = 0.02; // parte baixa (2 a 5%): monoarticular / membros superiores

// Heurística documentada por GRUPO MUSCULAR (não há campo "multi/mono" no acervo): grande massa
// / multiarticular usa a parte alta; ombro/braço/core usam a parte baixa. Como reforço, um grupo
// desconhecido cai na articulação predominante (duas articulações citadas = multiarticular).
const GRUPOS_GRANDES = ["inferior", "perna", "coxa", "glúteo", "gluteo", "costas", "dorsal", "peito", "peitor", "corpo todo"];
const GRUPOS_PEQUENOS = ["ombro", "braço", "braco", "bíceps", "biceps", "tríceps", "triceps", "antebraço", "antebraco", "core", "tronco", "panturrilha"];

export interface IncrementoSegmento {
  /** fração da carga a somar quando a dupla progressão manda subir */
  pct: number;
  /** classificação usada (grande = multiarticular/MMII; pequeno = mono/MMSS) */
  segmento: "grande" | "pequeno";
  /** regra declarada que reparte a faixa 2 a 10% por segmento */
  regraId: string;
}

/**
 * Incremento de carga do exercício pela regra declarada por segmento. Deriva o padrão do grupo
 * muscular do acervo (src/data/exercises); sem grupo reconhecido, cai na articulação predominante.
 */
export function incrementoDoExercicio(slug?: string): IncrementoSegmento {
  const ex = slug ? exercises.find((e) => e.slug === slug) : undefined;
  const g = (ex?.grupoMuscular ?? "").toLowerCase();
  let grande: boolean;
  if (GRUPOS_GRANDES.some((k) => g.includes(k))) grande = true;
  else if (GRUPOS_PEQUENOS.some((k) => g.includes(k))) grande = false;
  else grande = / e /i.test(ex?.articulacaoPredominante ?? ""); // desconhecido: duas articulações = multi
  return {
    pct: grande ? INCREMENTO_MMII : INCREMENTO_MMSS,
    segmento: grande ? "grande" : "pequeno",
    regraId: "forca-incremento-por-segmento",
  };
}

/* --------------------------------------- Utilidades --------------------------------------- */

/** Arredonda ao 0,5 kg mais próximo (menor passo prático comum de carga). */
function arredondarMeioKg(kg: number): number {
  return Math.round(kg * 2) / 2;
}

/** Percentual legível de uma fração ("0,05" -> "5%", "0,025" -> "2,5%"). */
function fmtPct(frac: number): string {
  const p = frac * 100;
  const n = Number.isInteger(p) ? p : Math.round(p * 10) / 10;
  return `${`${n}`.replace(".", ",")}%`;
}

const fmtDor = (x: number) => `${x}`.replace(".", ",");

// Escala de conservadorismo das ações (maior = mais conservador). O gate nunca deixa a
// sugestão MENOS conservadora que a decisão-base, e "subir" some quando há bandeira.
const ORDEM: Record<AcaoCarga, number> = { "sem-dado": 0, subir: 1, manter: 2, descarregar: 3, encaminhar: 4 };
const maisConservador = (a: AcaoCarga, b: AcaoCarga): AcaoCarga => (ORDEM[a] >= ORDEM[b] ? a : b);

/* ------------------------------------ Gate de segurança ------------------------------------ */

/**
 * Cruza o contexto de segurança com a decisão-base da dupla progressão. Com qualquer sinal de
 * alerta, "subir" é PROIBIDO: a ação vira manter, descarregar ou encaminhar (a mais conservadora
 * entre o piso da gravidade e a decisão-base sem o "subir"). Sem sinal, devolve a decisão-base.
 */
function aplicarGateSeguranca(base: AjusteCarga, seg: CtxSeguranca | undefined, descargaPct: number): AjusteCarga {
  if (!seg || base.acao === "sem-dado") return base;
  const dor = seg.dor ?? 0;
  const temSintoma = (seg.sintomas?.length ?? 0) > 0;

  const alertas: string[] = [];
  if (seg.vermelhoPendente) alertas.push("semáforo do dia em vermelho (não liberado)");
  if (seg.amareloHoje) alertas.push("semáforo do dia em amarelo (liberado com ressalva)");
  if (dor >= DOR_MIN) alertas.push(`dor relatada (${fmtDor(dor)} de 10) na última avaliação`);
  if (temSintoma) alertas.push(`sinal relatado: ${seg.sintomas!.join(", ")}`);
  if (alertas.length === 0) return base; // sem bandeira: segue a dupla progressão normal

  // Piso de conservadorismo pela gravidade. Encaminhar quando a dor é forte, ou quando o "não
  // liberado" vem acompanhado de dor/sintoma (o quadro passou do ajuste de carga).
  const grave = dor >= DOR_ENCAMINHA || (Boolean(seg.vermelhoPendente) && (dor >= DOR_MIN || temSintoma));
  const piso: AcaoCarga = grave
    ? "encaminhar"
    : seg.vermelhoPendente || dor >= DOR_DESCARGA
      ? "descarregar"
      : "manter";

  const baseSemSubir: AcaoCarga = base.acao === "subir" ? "manter" : base.acao;
  const acao = maisConservador(baseSemSubir, piso);
  const aviso = `Progressão bloqueada por segurança: ${alertas.join("; ")}. A decisão fica com você: manter, regredir ou encaminhar.`;

  if (acao === "encaminhar") {
    return { cargaBase: base.cargaBase, delta: 0, acao, motivo: `${aviso} O quadro pede reavaliação antes de mexer na carga.` };
  }
  if (acao === "descarregar") {
    const prox =
      base.acao === "descarregar"
        ? base.proximaCarga
        : base.cargaBase != null
          ? arredondarMeioKg(base.cargaBase * (1 - descargaPct))
          : undefined;
    return { cargaBase: base.cargaBase, proximaCarga: prox, delta: -descargaPct, acao, motivo: aviso };
  }
  return { cargaBase: base.cargaBase, proximaCarga: base.cargaBase, delta: 0, acao, motivo: aviso };
}

/* ------------------------------------- Ajuste da carga ------------------------------------- */

export function ajustarCarga(
  execucoesDoExercicio: Execucao[],
  faixa: FaixaReps,
  opts: OpcoesAjuste = {},
): AjusteCarga {
  // O modificador do perfil clínico aperta o gate ANTES da decisão: teto de esforço menor e
  // passo reduzido (idoso/obeso/hipertenso progridem mais devagar e com margem maior).
  const rpeAlvoMax = Math.min(opts.rpeAlvoMax ?? DEFAULTS.rpeAlvoMax, opts.modPerfil?.pseTeto ?? Infinity);
  const incrementoPct = (opts.incrementoPct ?? DEFAULTS.incrementoPct) * (opts.modPerfil?.fatorIncremento ?? 1);
  const descargaPct = opts.descargaPct ?? DEFAULTS.descargaPct;

  const comCarga = execucoesDoExercicio
    .filter((e) => e.cargaFeita != null && e.repsFeitas != null)
    .sort((a, b) => a.concluidoEm - b.concluidoEm);

  if (comCarga.length === 0) {
    return { delta: 0, acao: "sem-dado", motivo: "Ainda sem registro de execução para este exercício." };
  }

  // Avalia SÓ o microciclo corrente (a última semana registrada). Um set ruim de semanas atrás
  // não pode prender a sugestão para sempre; a dupla progressão decide sobre o desempenho recente.
  const ultimaSemana = Math.max(...comCarga.map((e) => e.semana ?? 0));
  const doMicro = comCarga.filter((e) => (e.semana ?? 0) === ultimaSemana);

  const cargaBase = doMicro[doMicro.length - 1].cargaFeita as number;
  const cumpriuTopo = doMicro.every((e) => (e.repsFeitas ?? 0) >= faixa.max);
  // RPE alvo é o teto: acima dele (não "acima+1") já é esforço alto demais.
  const rpeAlto = doMicro.some((e) => (e.rpe ?? 0) > rpeAlvoMax);
  const abaixoDaBase = doMicro.some((e) => (e.repsFeitas ?? 0) < faixa.min);

  let base: AjusteCarga;
  if (cumpriuTopo && !rpeAlto) {
    base = {
      cargaBase,
      proximaCarga: arredondarMeioKg(cargaBase * (1 + incrementoPct)),
      delta: incrementoPct,
      acao: "subir",
      motivo: `Cumpriu ${faixa.max} repetições em todas as séries com esforço controlado. A carga sobe pelo menor incremento (${fmtPct(incrementoPct)}).`,
    };
  } else if (abaixoDaBase || rpeAlto) {
    base = {
      cargaBase,
      proximaCarga: arredondarMeioKg(cargaBase * (1 - descargaPct)),
      delta: -descargaPct,
      acao: "descarregar",
      motivo: abaixoDaBase
        ? `Repetições abaixo de ${faixa.min} em ao menos uma série. Descarga para consolidar antes de progredir.`
        : "Esforço percebido muito alto. Descarga para recuperar antes de progredir.",
    };
  } else {
    base = {
      cargaBase,
      proximaCarga: cargaBase,
      delta: 0,
      acao: "manter",
      motivo: `Dentro da faixa de ${faixa.min} a ${faixa.max}. Mantém a carga para acumular repetições antes de subir.`,
    };
  }

  return aplicarGateSeguranca(base, opts.seguranca, descargaPct);
}

/** Extrai a faixa de repetições de um texto como "8 a 12" ou "8-12". */
export function faixaDeReps(texto?: string): FaixaReps | undefined {
  if (!texto) return undefined;
  const nums = texto.match(/\d+/g);
  if (!nums || nums.length === 0) return undefined;
  const a = parseInt(nums[0], 10);
  const b = nums[1] ? parseInt(nums[1], 10) : a;
  return { min: Math.min(a, b), max: Math.max(a, b) };
}
