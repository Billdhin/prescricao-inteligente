/**
 * O REGISTRO DE UM ALUNO DE EXEMPLO, DO JEITO QUE O APP GRAVARIA.
 *
 * Dois geradores escrevem treino de aluno de exemplo: a demo do VSL (semearDemo.ts) e o
 * histórico dos exemplos (historicoExemplos.ts). Cada um tinha a sua versão do "o que o aluno
 * registra", e as duas mentiam de jeitos diferentes, medidos em 10/09/2026:
 *
 * - quilos em flexão de braço, dead bug e elevação de quadril de peso do corpo (37 registros
 *   na demo), e o motor de ajuste respondia "Flexão de braço: progredir para 31 kg";
 * - prancha e agachamento isométrico na parede com "30 kg x 10" (105 registros nas duas);
 * - o aeróbio nunca registrado na demo, então toda sessão aparecia como "registro parcial";
 * - na demo, um registro por exercício em vez de um por série, e a sessão isométrica
 *   empurrada para a semana seguinte (18 registros datados fora da própria semana).
 *
 * Aqui mora a regra única, e ela é a MESMA do app: `modoDeRegistro` decide o que cada bloco
 * pede (conclusão, tempo, repetições, ou quilos e repetições), e a agenda põe cada sessão num
 * dia da semana do plano, com o complemento no dia de uma sessão principal.
 */
import type { BlocoSessao, Microciclo, Sessao } from "@/data/periodizacao";
import { modoDeRegistro, semCargaExterna, totalSeriesDe, type Execucao } from "@/data/execucao";
import { getExercise } from "@/data/exercises";

const MIN = 60_000;

/** Hash pequeno e estável: o mesmo bloco na mesma semana sempre tropeça do mesmo jeito. */
const hash = (s: string) => {
  let h = 5381;
  for (const c of s) h = ((h * 33) ^ c.charCodeAt(0)) >>> 0;
  return h;
};
const entre = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const numeroDaFaixa = (txt?: string) => {
  const m = /(\d+)/.exec(txt ?? "");
  return m ? Number(m[1]) : undefined;
};

/** Dias da semana (a partir do primeiro dia da semana do plano) em que cada sessão principal cai. */
const DIAS_DA_SESSAO: Record<number, number[]> = { 1: [0], 2: [0, 3], 3: [0, 2, 4], 4: [0, 1, 3, 4], 5: [0, 1, 2, 3, 4] };

/**
 * A sessão é complemento do dia? Plano novo marca em `complemento`; plano gerado antes do campo
 * não marca, e a sessão isométrica da pressão (só blocos isométricos de protocolo) é
 * reconhecida pela mesma regra de `rotuloFrequencia` em periodizacao.ts.
 */
export const ehComplemento = (s: Sessao): boolean =>
  Boolean(s.complemento) || (s.blocos.length > 0 && s.blocos.every((b) => b.tipo === "isometrico" && !b.sustentado));

/**
 * Onde cada sessão da semana acontece: o dia (0 a 6, contado do início da semana do plano) e
 * os minutos depois do horário do aluno. O k-ésimo complemento cabe no dia da k-ésima sessão
 * principal, logo depois dela, e nunca num dia só dele nem na semana seguinte.
 */
export function agendaDaSemana(micro: Microciclo): Map<string, { dia: number; depoisMin: number; complemento: boolean }> {
  const principais = micro.sessoes.filter((s) => !ehComplemento(s));
  const dias = DIAS_DA_SESSAO[principais.length] ?? principais.map((_, i) => Math.min(6, i));
  const agenda = new Map<string, { dia: number; depoisMin: number; complemento: boolean }>();
  let k = 0;
  for (const s of micro.sessoes) {
    if (!ehComplemento(s)) {
      agenda.set(s.id, { dia: dias[principais.indexOf(s)] ?? 0, depoisMin: 0, complemento: false });
    } else {
      const junto = principais.length ? k % principais.length : 0;
      agenda.set(s.id, { dia: dias[junto] ?? 0, depoisMin: 70, complemento: true });
      k++;
    }
  }
  return agenda;
}

/**
 * A carga de trabalho plausível de um aluno de exemplo num exercício, em kg, estável por aluno e
 * exercício (derivada do id). Peso do corpo e elástico não têm kg. É dado de aluno fictício,
 * nunca afirmação do produto: o motor não prescreve carga absoluta.
 */
export function cargaPlausivel(
  a: { id: string; sexo?: string; nivel?: string; idade?: number },
  slug: string,
  equipamento?: string,
): number | undefined {
  if (!equipamento || semCargaExterna(equipamento)) return undefined;
  const f = a.sexo === "F";
  const escala = (f ? 0.7 : 1) * (a.nivel === "Intermediário" ? 1.3 : a.nivel === "Avançado" ? 1.6 : 1) * ((a.idade ?? 40) > 60 ? 0.8 : 1);
  const h = hash(`${a.id}|${slug}`);
  const faixa: Record<string, [number, number]> = { Máquina: [25, 60], Barra: [20, 50], Halter: [6, 16], Polia: [10, 30] };
  const [min, max] = faixa[equipamento] ?? [8, 24];
  return (min + (h % (max - min + 1))) * escala;
}

/** A carga da semana relativa à base: 85% na descarga, +2% a cada semana de carga já vivida. */
export const fatorDaSemana = (descarga: boolean, cargasVividas: number) => (descarga ? 0.85 : 1 + 0.02 * Math.max(0, cargasVividas - 1));

/** O passo com que a carga anda, pelo equipamento (o halter vem de 1 em 1 kg, a máquina de 5 em 5). */
export const passoDaCarga = (equipamento?: string) => (equipamento === "Halter" ? 1 : equipamento === "Máquina" ? 5 : 2.5);

/**
 * As séries que o aluno de exemplo registraria neste bloco, com os mesmos campos do app:
 * aeróbio vira uma conclusão; isométrico e sustentado, uma linha por série com o esforço;
 * peso do corpo e elástico, repetições e esforço; o resto, quilos, repetições e esforço.
 *
 * `carga` é a carga da semana em kg, antes de arredondar ao passo do equipamento; ela só é
 * gravada onde existe carga externa. `idBase` é o prefixo do id, que cada gerador escolhe
 * (a série entra como `-r<n>`, como no app).
 */
export function registrosDoBloco(o: {
  bloco: BlocoSessao;
  alunoId: string;
  planoId: string;
  semana: number;
  sessaoRef: string;
  idBase: string;
  inicio: number;
  descarga: boolean;
  carga?: number;
}): { execucoes: Execucao[]; rpes: number[] } {
  const { bloco: b, descarga } = o;
  const ex = b.exercicioSlug ? getExercise(b.exercicioSlug) : undefined;
  const modo = modoDeRegistro(b, ex?.equipamento);
  const comum = { alunoId: o.alunoId, planoId: o.planoId, semana: o.semana, sessaoRef: o.sessaoRef, blocoRef: b.id, exercicioSlug: b.exercicioSlug };

  if (modo === "conclusao") {
    return { execucoes: [{ id: o.idBase, ...comum, concluidoEm: o.inicio + 20 * MIN }], rpes: [descarga ? 5 : 6] };
  }
  if (!b.exercicioSlug) return { execucoes: [], rpes: [] };

  // A mesma contagem do app: dose em faixa se registra de uma vez, sem série inventada.
  const series = totalSeriesDe(b);
  const reps = b.repsAlvo ?? numeroDaFaixa(b.reps) ?? 10;
  const passo = passoDaCarga(ex?.equipamento);
  const execucoes: Execucao[] = [];
  const rpes: number[] = [];
  for (let s = 1; s <= series; s++) {
    const ultima = s === series;
    const tropeco = ultima && hash(`${b.id}|${o.semana}`) % 4 === 0 ? 1 : 0;
    // O esforço segue a folga prescrita (RIR) e sobe um ponto na última série. Por tempo, o
    // esforço é o de uma contração sustentada moderada, que é o que o protocolo pede.
    const rpe =
      modo === "tempo"
        ? entre((descarga ? 5 : 6) + (ultima ? 1 : 0), 5, 10)
        : entre(10 - (b.rirAlvo ?? 3) + (ultima ? 1 : 0) - (descarga ? 1 : 0), 5, 10);
    rpes.push(rpe);
    execucoes.push({
      id: o.idBase + (series > 1 ? `-r${s}` : ""),
      ...comum,
      serie: series > 1 ? s : undefined,
      cargaFeita: modo === "carga-e-reps" && o.carga != null ? Math.max(passo, Math.round(o.carga / passo) * passo) : undefined,
      repsFeitas: modo === "tempo" ? undefined : Math.max(1, reps - tropeco),
      rpe,
      concluidoEm: o.inicio + s * 2 * MIN,
    });
  }
  return { execucoes, rpes };
}
