import type { BlocoSessao } from "@/data/periodizacao";

/**
 * O que o aluno REALMENTE executou numa sessão. É o dado que faltava para a
 * periodização deixar de ser estática: o aluno registra carga, repetições e
 * esforço, e o motor de autorregulação usa isso para a próxima semana.
 */
export interface Execucao {
  id: string;
  alunoId: string;
  planoId: string;
  /** semana do plano em que a sessão foi feita */
  semana: number;
  /** id da Sessao e do BlocoSessao a que a execução se refere */
  sessaoRef: string;
  blocoRef: string;
  exercicioSlug?: string;
  /**
   * Número da série dentro do bloco, de 1 até o total prescrito.
   *
   * Existe desde 01/09/2026. Antes disso o modelo guardava UMA execução por exercício e o
   * contador de séries da tela era só estado da sessão em curso: o aluno tocava "Registrar
   * série 2" e nada era gravado até a última, quando os valores que estivessem nos campos
   * viravam o registro do exercício inteiro. Quem baixasse a carga na última série apagava
   * as duas primeiras, e essa é exatamente a cena que o produto se propõe a resolver
   * (prescrito x executado só tem sentido se o executado for o que aconteceu em cada série).
   *
   * Ausente = registro de exercício inteiro: todo dado gravado antes desta data, e os blocos
   * sem contagem de séries (aeróbio, e força com dose textual do tipo "3 a 4", onde contar
   * série seria inventar número que o plano não deu).
   */
  serie?: number;
  /** carga levantada, em kg (ausente em bloco sem carga) */
  cargaFeita?: number;
  repsFeitas?: number;
  /** esforço percebido (RPE 6 a 10) */
  rpe?: number;
  concluidoEm: number;
}

/**
 * Como o aluno sentiu a SESSÃO inteira (não um exercício): o esforço percebido do
 * treino como um todo e, se ele quiser, um recado para o professor. Nasce ao concluir
 * o treino guiado.
 *
 * `pse` é a percepção de esforço da sessão de 0 a 10 (mesma escala de Borg usada nos
 * parâmetros; base do sRPE de Foster para estimar a carga interna da sessão). É
 * opcional: enviar sem nota só fecha a sessão. `duracaoMin` só existe quando foi
 * MEDIDA de verdade (cronômetro do modo guiado, do início ao fim); nunca é estimada.
 */
export interface SessaoFeedback {
  id: string;
  alunoId: string;
  planoId: string;
  /** semana do plano em que a sessão foi feita */
  semana: number;
  /** id da Sessao a que o feedback se refere */
  sessaoRef: string;
  /** percepção de esforço da sessão, 0 a 10 (opcional) */
  pse?: number;
  /** duração medida pelo cronômetro do modo guiado, em minutos (só quando medida) */
  duracaoMin?: number;
  /** recado opcional do aluno para o professor */
  observacao?: string;
  concluidaEm: number;
}

/* ----------------------- Leitura do registro por série ----------------------- */
/*
 * Estas quatro funções são a ÚNICA resposta do produto para "este exercício está feito?"
 * depois que o registro passou a ser por série (01/09/2026). Antes, cinco lugares
 * respondiam com `execucoes.some(blocoRef)`, que com o modelo novo significa "começou",
 * não "terminou": o cartão dizia "1 de 4 feitos" com uma série de três registrada, e a
 * gamificação dava três vezes os pontos de antes. Vivem em `data/` porque a periodização
 * (sessão de hoje) e o app do aluno precisam da mesma regra, e `data/` não pode importar
 * componente.
 */

/**
 * Quantas séries este bloco pede. Só conta quando o plano dá número: o alvo da semana
 * (`seriesAlvo`) ou uma série textual que seja número puro. Dose em faixa ("3 a 4")
 * devolve 1, e o exercício se registra de uma vez, porque contar série que o plano não
 * prescreveu seria inventar número. Aeróbio também é 1: ele se conclui, não se dosa.
 */
export const totalSeriesDe = (bloco: Pick<BlocoSessao, "tipo" | "seriesAlvo" | "series">): number => {
  if (bloco.tipo === "aerobio") return 1;
  if (bloco.seriesAlvo != null) return Math.max(1, bloco.seriesAlvo);
  const puro = String(bloco.series ?? "").trim();
  return /^\d+$/.test(puro) ? Math.max(1, Number(puro)) : 1;
};

/** As séries já registradas de um bloco naquela semana, da primeira para a última. */
export const seriesFeitas = (execucoes: Execucao[], semana: number, blocoId: string): Execucao[] =>
  execucoes
    .filter((e) => e.semana === semana && e.blocoRef === blocoId)
    .sort((a, b) => (a.serie ?? 1) - (b.serie ?? 1) || a.concluidoEm - b.concluidoEm);

/**
 * O bloco está fechado? Todas as séries prescritas registradas. Registro antigo (sem
 * série) fecha o bloco sozinho: ele nasceu de um modelo em que a última série era o
 * exercício inteiro, e reabrir esses blocos transformaria histórico em pendência.
 */
export const blocoCompleto = (
  bloco: Pick<BlocoSessao, "id" | "tipo" | "seriesAlvo" | "series">,
  execucoes: Execucao[],
  semana: number,
): boolean => {
  const feitas = seriesFeitas(execucoes, semana, bloco.id);
  if (feitas.some((e) => e.serie == null)) return true;
  return feitas.length >= totalSeriesDe(bloco);
};

/**
 * Um registro por EXERCÍCIO (bloco + semana), ficando a última série de cada um.
 *
 * É a lente para quem conta "treinos", "pontos" e "itens do feed": essas contagens
 * nasceram com um registro por exercício, e com o modelo por série passariam a valer o
 * triplo para o mesmo trabalho. Um aluno com histórico antigo e novo veria os dois pesos
 * misturados. Esta função devolve a granularidade de antes sem apagar as séries de onde
 * elas importam (prescrito x executado, autorregulação).
 */
export const porExercicio = (execucoes: Execucao[]): Execucao[] => {
  const ultimo = new Map<string, Execucao>();
  for (const e of execucoes) {
    const k = `${e.planoId ?? ""}|${e.semana}|${e.blocoRef}`;
    const atual = ultimo.get(k);
    if (!atual || (e.serie ?? 0) > (atual.serie ?? 0) || ((e.serie ?? 0) === (atual.serie ?? 0) && e.concluidoEm > atual.concluidoEm))
      ultimo.set(k, e);
  }
  return [...ultimo.values()];
};
