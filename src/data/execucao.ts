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
