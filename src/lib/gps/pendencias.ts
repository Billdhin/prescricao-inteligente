import type { Aluno } from "@/data/alunos";
import { proximoPasso, dataReavaliacao, type CicloCtx } from "./proximoPasso";
import { estadoSemaforo } from "./semaforoDiario";

/**
 * OS NÚMEROS DA CASCA: os contadores que a barra lateral mostra ao lado de
 * "Alunos", "Avaliar" e "Semáforo".
 *
 * Todos DERIVADOS das mesmas fontes únicas que já mandam nas telas: a carteira
 * ativa, `dataReavaliacao` (a data que respeita o macrociclo) e `estadoSemaforo`.
 * Um contador no menu que não bate com a tela para onde ele leva é pior que
 * contador nenhum: o profissional clica esperando três e encontra cinco, e passa
 * a não confiar em nenhum número do produto.
 *
 * A janela de "avaliar" é a MESMA da tela Avaliar e reavaliar (vencida, ou até
 * 14 dias, ou nunca avaliado). Se ela mudar lá, muda aqui, porque é uma função só.
 */
export interface ContagensDoMenu {
  /** alunos ativos na carteira */
  alunos: number;
  /** quem precisa de avaliação agora (vencida, chegando ou primeira) */
  avaliar: number;
  /** quantos ainda não têm semáforo de hoje, ou seguem com "não liberado" aberto */
  semaforo: number;
}

/** Quantos dias antes da reavaliação ela já entra em "precisa agora". */
export const JANELA_REAVALIACAO_DIAS = 14;
const DIA = 86_400_000;

export function contagensDoMenu(alunos: Aluno[], ctx: CicloCtx): ContagensDoMenu {
  const ativos = alunos.filter((a) => a.status === "ativo");

  const avaliar = ativos.filter((a) => {
    const temAval = ctx.avaliacoes.some((av) => av.alunoId === a.id);
    if (!temAval) return true;
    const planoAtivo = ctx.planos.find((p) => p.alunoId === a.id && p.status === "ativo");
    const reav = dataReavaliacao(a, planoAtivo);
    if (!reav) return false;
    return Math.round((reav.em - Date.now()) / DIA) <= JANELA_REAVALIACAO_DIAS;
  }).length;

  const semaforo = ativos.filter((a) => {
    const e = estadoSemaforo(a.id, ctx.liberacoes);
    return !e.hoje || !!e.vermelhoPendente;
  }).length;

  return { alunos: ativos.length, avaliar, semaforo };
}

/**
 * O primeiro aluno da rota, para o botão "Ver como aluno" da barra superior
 * abrir a prévia de alguém de verdade. Sem aluno ativo, devolve undefined e o
 * botão simplesmente não aparece: um botão que abre uma tela vazia é pior que
 * a ausência dele.
 */
export function alunoParaPrevia(alunos: Aluno[], ctx: CicloCtx): Aluno | undefined {
  const ativos = alunos.filter((a) => a.status === "ativo");
  // Prefere quem já tem treino publicado (a prévia mostra algo), senão o primeiro.
  const comPlano = ativos.find((a) => ctx.planos.some((p) => p.alunoId === a.id && p.status === "ativo"));
  return comPlano ?? ativos[0];
}

/** Reexporta para quem só precisa do passo (evita import duplo nas telas). */
export { proximoPasso };
