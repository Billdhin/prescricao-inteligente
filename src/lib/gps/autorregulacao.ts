import type { Execucao } from "@/data/execucao";

/**
 * Motor de autorregulação da periodização (dupla progressão).
 *
 * Dado o que o aluno EXECUTOU num microciclo, calcula a carga sugerida para a
 * próxima semana daquele exercício. A regra é a dupla progressão consagrada:
 * enquanto o aluno acumula repetições dentro da faixa, a carga se mantém; quando
 * ele cumpre o TOPO da faixa em todas as séries com esforço controlado, a carga
 * sobe pelo menor incremento; repetições abaixo da faixa ou esforço muito alto
 * seguram ou descarregam.
 *
 * Nunca inventa um número de partida: trabalha sobre a carga que o aluno de fato
 * levantou. O incremento é percentual e conservador (menor passo prático),
 * arredondado ao 0,5 kg, e sempre acompanhado de uma justificativa. A decisão
 * final continua do profissional (esta é uma sugestão, ver o log de ajustes).
 */

export interface FaixaReps {
  min: number;
  max: number;
}

export type AcaoCarga = "subir" | "manter" | "descarregar" | "sem-dado";

export interface AjusteCarga {
  /** carga sugerida para a próxima semana, em kg; undefined quando falta dado */
  proximaCarga?: number;
  /** carga de referência (a última executada) */
  cargaBase?: number;
  /** variação relativa aplicada (0, +incremento, -descarga) */
  delta: number;
  acao: AcaoCarga;
  motivo: string;
}

const DEFAULTS = {
  /** RPE acima disso, por sessão, indica esforço alto demais para progredir */
  rpeAlvoMax: 8,
  /** menor incremento prático, como fração da carga (progressão gradual) */
  incrementoPct: 0.025,
  /** descarga quando o desempenho pede recuo */
  descargaPct: 0.1,
};

/** Arredonda ao 0,5 kg mais próximo (menor passo prático comum de carga). */
function arredondarMeioKg(kg: number): number {
  return Math.round(kg * 2) / 2;
}

export function ajustarCarga(
  execucoesDoExercicio: Execucao[],
  faixa: FaixaReps,
  opts: Partial<typeof DEFAULTS> = {},
): AjusteCarga {
  const { rpeAlvoMax, incrementoPct, descargaPct } = { ...DEFAULTS, ...opts };

  const comCarga = execucoesDoExercicio
    .filter((e) => e.cargaFeita != null && e.repsFeitas != null)
    .sort((a, b) => a.concluidoEm - b.concluidoEm);

  if (comCarga.length === 0) {
    return { delta: 0, acao: "sem-dado", motivo: "Ainda sem registro de execução para este exercício." };
  }

  // Avalia SÓ o microciclo corrente (a última semana registrada). Um set ruim de
  // semanas atrás não pode prender a sugestão para sempre; a dupla progressão
  // decide sobre o desempenho recente, não sobre o histórico inteiro.
  const ultimaSemana = Math.max(...comCarga.map((e) => e.semana ?? 0));
  const doMicro = comCarga.filter((e) => (e.semana ?? 0) === ultimaSemana);

  const cargaBase = doMicro[doMicro.length - 1].cargaFeita as number;
  const cumpriuTopo = doMicro.every((e) => (e.repsFeitas ?? 0) >= faixa.max);
  // RPE alvo é o teto: acima dele (não "acima+1") já é esforço alto demais.
  const rpeAlto = doMicro.some((e) => (e.rpe ?? 0) > rpeAlvoMax);
  const abaixoDaBase = doMicro.some((e) => (e.repsFeitas ?? 0) < faixa.min);

  if (cumpriuTopo && !rpeAlto) {
    return {
      cargaBase,
      proximaCarga: arredondarMeioKg(cargaBase * (1 + incrementoPct)),
      delta: incrementoPct,
      acao: "subir",
      motivo: `Cumpriu ${faixa.max} repetições em todas as séries com esforço controlado. A carga sobe pelo menor incremento.`,
    };
  }

  if (abaixoDaBase || rpeAlto) {
    return {
      cargaBase,
      proximaCarga: arredondarMeioKg(cargaBase * (1 - descargaPct)),
      delta: -descargaPct,
      acao: "descarregar",
      motivo: abaixoDaBase
        ? `Repetições abaixo de ${faixa.min} em ao menos uma série. Descarga para consolidar antes de progredir.`
        : "Esforço percebido muito alto. Descarga para recuperar antes de progredir.",
    };
  }

  return {
    cargaBase,
    proximaCarga: cargaBase,
    delta: 0,
    acao: "manter",
    motivo: `Dentro da faixa de ${faixa.min} a ${faixa.max}. Mantém a carga para acumular repetições antes de subir.`,
  };
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
