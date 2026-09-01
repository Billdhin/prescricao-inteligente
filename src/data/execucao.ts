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
