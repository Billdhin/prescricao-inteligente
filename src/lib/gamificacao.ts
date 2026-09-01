/**
 * Gamificação do portal do aluno: liga, conquistas (badges) e feed.
 *
 * Tudo aqui é DERIVADO da execução real que o aluno registrou. Não existe ponto
 * inventado nem conquista fictícia: cada número sai da contagem dos treinos que
 * o próprio aluno lançou. É motivação honesta, não teatro.
 */
import { porExercicio, type Execucao } from "@/data/execucao";

const DIA = 86_400_000;
const SEMANA = 7 * DIA;

/** Cada treino registrado (bloco concluído) vale este tanto de pontos. */
export const PONTOS_POR_REGISTRO = 10;

export interface Liga {
  id: string;
  nome: string;
  /** pontos mínimos para entrar nesta liga */
  min: number;
  cor: string;
}

/** Ligas por faixa de pontos. Determinístico, sem número mágico escondido. */
export const LIGAS: Liga[] = [
  { id: "bronze", nome: "Bronze", min: 0, cor: "#a1691f" },
  { id: "prata", nome: "Prata", min: 300, cor: "#7c828c" },
  { id: "ouro", nome: "Ouro", min: 800, cor: "#c99a2e" },
  { id: "platina", nome: "Platina", min: 1600, cor: "#2f9aa1" },
  { id: "diamante", nome: "Diamante", min: 3000, cor: "#5b7cfa" },
];

export interface EstadoLiga {
  atual: Liga;
  proxima?: Liga;
  /** pontos que ainda faltam para a próxima liga (0 se já na última) */
  faltam: number;
  /** progresso 0..1 dentro da liga atual rumo à próxima */
  progresso: number;
}

export function ligaDosPontos(pontos: number): EstadoLiga {
  let idx = 0;
  for (let i = 0; i < LIGAS.length; i++) {
    if (pontos >= LIGAS[i].min) idx = i;
  }
  const atual = LIGAS[idx];
  const proxima = LIGAS[idx + 1];
  if (!proxima) return { atual, faltam: 0, progresso: 1 };
  const faltam = Math.max(0, proxima.min - pontos);
  const faixa = proxima.min - atual.min;
  const progresso = faixa > 0 ? Math.min(1, (pontos - atual.min) / faixa) : 0;
  return { atual, proxima, faltam, progresso };
}

/* --------------------------------- Badges --------------------------------- */

export type BadgeId =
  | "estreia"
  | "dez-treinos"
  | "cinquenta-treinos"
  | "semana-cheia"
  | "mes-constante"
  | "carga-em-alta"
  | "tres-semanas";

export interface Badge {
  id: BadgeId;
  nome: string;
  descricao: string;
  /** nome do ícone lucide, resolvido na UI */
  icone: string;
}

export const BADGES: Badge[] = [
  { id: "estreia", nome: "Estreia", descricao: "Registrou o primeiro treino", icone: "Sparkles" },
  { id: "dez-treinos", nome: "Dez treinos", descricao: "Registrou 10 treinos", icone: "Dumbbell" },
  { id: "cinquenta-treinos", nome: "Cinquenta treinos", descricao: "Registrou 50 treinos", icone: "Trophy" },
  { id: "semana-cheia", nome: "Semana cheia", descricao: "Treinou em 3 dias na mesma semana", icone: "CalendarCheck" },
  { id: "mes-constante", nome: "Mês constante", descricao: "Treinou em 4 semanas diferentes", icone: "CalendarRange" },
  { id: "carga-em-alta", nome: "Carga em alta", descricao: "Subiu a carga em algum exercício", icone: "TrendingUp" },
  { id: "tres-semanas", nome: "Ritmo firme", descricao: "3 semanas seguidas com treino", icone: "Flame" },
];


function diaBucket(ts: number): number {
  return Math.floor(ts / DIA);
}
function semanaBucket(ts: number): number {
  return Math.floor(ts / SEMANA);
}

/**
 * SEQUÊNCIA EM DIAS (o "streak" que o app do aluno mostra).
 *
 * Existe porque o design pede dias e o código só tinha semanas. Relabelar
 * `sequenciaSemanas` como "dias" seria mentir por um fator de sete; então a
 * contagem em dias é feita de verdade, a partir dos mesmos registros.
 *
 * Regra: conta dias CONSECUTIVOS com pelo menos um registro, andando para trás
 * a partir do último dia treinado. A sequência só é a ATUAL se o último dia
 * treinado for hoje ou ontem; se o aluno parou há mais tempo, a sequência atual
 * é 0 (e o recorde continua guardado). Ontem entra na janela porque quem treina
 * de manhã não deve ver a sequência zerar à meia-noite do mesmo dia.
 */
export function sequenciaDias(execs: Execucao[], agora = Date.now()): { atual: number; recorde: number } {
  const dias = [...new Set(execs.map((e) => diaBucket(e.concluidoEm)))].sort((a, b) => a - b);
  if (dias.length === 0) return { atual: 0, recorde: 0 };

  let recorde = 1;
  let corrida = 1;
  for (let i = 1; i < dias.length; i++) {
    corrida = dias[i] === dias[i - 1] + 1 ? corrida + 1 : 1;
    if (corrida > recorde) recorde = corrida;
  }

  const hoje = diaBucket(agora);
  const ultimo = dias[dias.length - 1];
  // `corrida` terminou valendo o comprimento da última sequência da lista, que é
  // exatamente a que termina em `ultimo`.
  const atual = ultimo === hoje || ultimo === hoje - 1 ? corrida : 0;
  return { atual, recorde };
}

/**
 * Treinos por semana civil nas últimas `n` semanas, da mais antiga para a mais
 * recente: alimenta o gráfico de barras do Progresso. Cada valor é a contagem de
 * DIAS treinados naquela semana (não de exercícios registrados), que é o que a
 * palavra "treinos" significa para o aluno.
 */
export function treinosPorSemana(execs: Execucao[], n = 6, agora = Date.now()): { rotulo: string; treinos: number }[] {
  const diaDaSemana = (new Date(agora).getDay() + 6) % 7; // segunda = 0
  const inicioDestaSemana = new Date(agora).setHours(0, 0, 0, 0) - diaDaSemana * DIA;
  const out: { rotulo: string; treinos: number }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const ini = inicioDestaSemana - i * SEMANA;
    const fim = ini + SEMANA;
    const dias = new Set(
      execs.filter((e) => e.concluidoEm >= ini && e.concluidoEm < fim).map((e) => diaBucket(e.concluidoEm)),
    );
    out.push({ rotulo: `s${n - i}`, treinos: dias.size });
  }
  return out;
}

/** Maior sequência de semanas consecutivas com pelo menos um treino. */
export function maiorSequenciaSemanas(execs: Execucao[]): number {
  const semanas = [...new Set(execs.map((e) => semanaBucket(e.concluidoEm)))].sort((a, b) => a - b);
  let melhor = 0;
  let atual = 0;
  let anterior: number | undefined;
  for (const s of semanas) {
    atual = anterior !== undefined && s === anterior + 1 ? atual + 1 : 1;
    if (atual > melhor) melhor = atual;
    anterior = s;
  }
  return melhor;
}

/** Houve aumento de carga em algum exercício ao longo do tempo? */
function subiuCarga(execs: Execucao[]): boolean {
  const porExercicio = new Map<string, { ts: number; carga: number }[]>();
  for (const e of execs) {
    if (!e.exercicioSlug || e.cargaFeita == null) continue;
    const arr = porExercicio.get(e.exercicioSlug) ?? [];
    arr.push({ ts: e.concluidoEm, carga: e.cargaFeita });
    porExercicio.set(e.exercicioSlug, arr);
  }
  for (const arr of porExercicio.values()) {
    arr.sort((a, b) => a.ts - b.ts);
    let min = Infinity;
    for (const p of arr) {
      if (p.carga > min) return true;
      if (p.carga < min) min = p.carga;
    }
  }
  return false;
}

export function badgesConquistadas(execs: Execucao[]): Set<BadgeId> {
  const total = execs.length;
  const diasPorSemana = new Map<number, Set<number>>();
  for (const e of execs) {
    const sem = semanaBucket(e.concluidoEm);
    const set = diasPorSemana.get(sem) ?? new Set<number>();
    set.add(diaBucket(e.concluidoEm));
    diasPorSemana.set(sem, set);
  }
  const semanaCheia = [...diasPorSemana.values()].some((s) => s.size >= 3);
  const semanasDistintas = diasPorSemana.size;

  const conquistadas = new Set<BadgeId>();
  if (total >= 1) conquistadas.add("estreia");
  if (total >= 10) conquistadas.add("dez-treinos");
  if (total >= 50) conquistadas.add("cinquenta-treinos");
  if (semanaCheia) conquistadas.add("semana-cheia");
  if (semanasDistintas >= 4) conquistadas.add("mes-constante");
  if (subiuCarga(execs)) conquistadas.add("carga-em-alta");
  if (maiorSequenciaSemanas(execs) >= 3) conquistadas.add("tres-semanas");
  return conquistadas;
}

/* ---------------------------------- Feed ---------------------------------- */

export interface FeedItem {
  /** dia (bucket) para agrupar */
  dia: number;
  /** momento representativo (o mais recente do dia) */
  ts: number;
  /** quantos blocos foram registrados no dia */
  quantidade: number;
}

/** Feed pessoal: um cartão por dia treinado, do mais recente ao mais antigo. */
export function feedDoAluno(execs: Execucao[], limite = 12): FeedItem[] {
  const porDia = new Map<number, { ts: number; quantidade: number }>();
  for (const e of execs) {
    const dia = diaBucket(e.concluidoEm);
    const atual = porDia.get(dia) ?? { ts: 0, quantidade: 0 };
    atual.quantidade += 1;
    if (e.concluidoEm > atual.ts) atual.ts = e.concluidoEm;
    porDia.set(dia, atual);
  }
  return [...porDia.entries()]
    .map(([dia, v]) => ({ dia, ts: v.ts, quantidade: v.quantidade }))
    .sort((a, b) => b.ts - a.ts)
    .slice(0, limite);
}

/* ------------------------------- Agregação -------------------------------- */

export interface ResumoGamificacao {
  pontos: number;
  liga: EstadoLiga;
  totalTreinos: number;
  sequenciaSemanas: number;
  /** sequencia em DIAS (atual e recorde), que e o streak que o app do aluno mostra */
  sequencia: { atual: number; recorde: number };
  /** treinos por semana civil nas ultimas 6 semanas (grafico do Progresso) */
  porSemana: { rotulo: string; treinos: number }[];
  badges: { badge: Badge; conquistada: boolean }[];
  feed: FeedItem[];
}

export function resumoGamificacao(alunoId: string, execucoes: Execucao[]): ResumoGamificacao {
  // Um registro por EXERCÍCIO: pontos, treinos e feed nasceram nessa granularidade, e
  // com o registro por série (01/09/2026) o mesmo trabalho passaria a valer o triplo.
  const execs = porExercicio(execucoes.filter((e) => e.alunoId === alunoId));
  const pontos = execs.length * PONTOS_POR_REGISTRO;
  const conquistadas = badgesConquistadas(execs);
  return {
    pontos,
    liga: ligaDosPontos(pontos),
    totalTreinos: execs.length,
    sequenciaSemanas: maiorSequenciaSemanas(execs),
    sequencia: sequenciaDias(execs),
    porSemana: treinosPorSemana(execs),
    badges: BADGES.map((badge) => ({ badge, conquistada: conquistadas.has(badge.id) })),
    feed: feedDoAluno(execs),
  };
}
