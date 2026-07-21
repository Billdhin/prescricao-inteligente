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
  /** carga levantada, em kg (ausente em bloco sem carga) */
  cargaFeita?: number;
  repsFeitas?: number;
  /** esforço percebido (RPE 6 a 10) */
  rpe?: number;
  concluidoEm: number;
}
