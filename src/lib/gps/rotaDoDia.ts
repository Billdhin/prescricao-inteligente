import type { Aluno } from "@/data/alunos";
import { proximoPasso, type CicloCtx, type EtapaCiclo } from "./proximoPasso";

/**
 * "SUA ROTA DE HOJE": as paradas que o profissional tem pela frente neste dia, em
 * ordem, com quantas já foram feitas.
 *
 * É o bloco-assinatura do Meu dia no design, e é seletor PURO: não inventa nada e
 * não tem estado próprio. Cada parada é o próximo passo de um aluno, calculado
 * pela MESMA fonte única (`proximoPasso`) que alimenta o chip da lista de alunos
 * e a Linha do cuidado na tela do aluno. Essa fonte única é o ponto: se a rota
 * fosse calculada por conta própria, ela contradiria "Precisam de atenção" na
 * mesma tela, e o profissional não saberia em qual acreditar.
 *
 * O que conta como PARADA FEITA: o aluno cujo próximo passo é só "acompanhar",
 * ou seja, quem está em dia. O que conta como parada PENDENTE: qualquer outro
 * passo (avaliar, planejar, liberar, reavaliar). A soma dos dois é a carteira
 * ativa, e por isso "2 de 4" nunca é um número solto.
 */

/** As etapas que exigem ação do profissional hoje. "acompanhar" é a etapa de
 *  quem já está em dia: aparece como parada CONCLUÍDA, nunca como pendência. */
const ETAPAS_PENDENTES: ReadonlySet<EtapaCiclo> = new Set<EtapaCiclo>([
  "liberar",
  "avaliar",
  "reavaliar",
  "planejar",
]);

/** Ordem de urgência das paradas: liberar a sessão de hoje vem antes de tudo,
 *  porque é a decisão que trava (ou libera) o treino que vai acontecer agora. */
const ORDEM: Record<EtapaCiclo, number> = {
  liberar: 0,
  avaliar: 1,
  reavaliar: 2,
  planejar: 3,
  acompanhar: 4,
};

export interface ParadaDoDia {
  aluno: Aluno;
  etapa: EtapaCiclo;
  /** o que fazer, na frase da fonte única */
  frase: string;
  /** rótulo do botão, também da fonte única (nunca um verbo genérico) */
  acao: string;
  /**
   * Destino explícito do passo, quando ele tem um. Existe porque a parada precisa
   * levar ao lugar que DESTRAVA: com o perfil bloqueando a prescrição, mandar o
   * profissional para a tela de prescrição é mandá-lo para uma porta fechada.
   */
  to?: string;
  tone: "primary" | "warning" | "cta" | "success";
}

export interface RotaDoDia {
  /** paradas ainda por fazer, da mais urgente para a menos */
  paradas: ParadaDoDia[];
  /** alunos que já estão em dia hoje */
  feitas: number;
  /** total de paradas do dia (feitas + pendentes) */
  total: number;
  /** a próxima parada, ou undefined quando o dia está limpo */
  agora?: ParadaDoDia;
}

/**
 * Monta a rota do dia a partir da carteira ATIVA (aluno inativo não entra numa
 * rota de trabalho). Alunos sem pendência viram "parada feita" e não ocupam
 * espaço na lista.
 */
export function rotaDoDia(alunos: Aluno[], ctx: CicloCtx): RotaDoDia {
  const ativos = alunos.filter((a) => a.status === "ativo");
  const paradas: ParadaDoDia[] = [];
  let feitas = 0;

  for (const aluno of ativos) {
    const passo = proximoPasso(aluno, ctx);
    /*
     * PENDENTE É A ETAPA DO CICLO **OU** O CHIP DE ATENÇÃO.
     *
     * A etapa sozinha bastava enquanto "acompanhar" significava só "em dia". Desde que o
     * silêncio de registro virou sinal (01/09/2026), existe aluno em "acompanhar" que NÃO
     * está em dia, e ele precisa entrar na fila. O chip é o discriminador certo porque
     * ele já é, por definição, "null quando o aluno está em dia".
     *
     * O caminho inverso continua valendo: a etapa "liberar" do semáforo de hoje é parada
     * mesmo sem chip, e por isso a etapa continua na conta.
     */
    if (!ETAPAS_PENDENTES.has(passo.etapa) && !passo.chip) {
      feitas += 1;
      continue;
    }
    paradas.push({
      aluno,
      etapa: passo.etapa,
      frase: passo.frase,
      acao: passo.cta.label,
      to: passo.cta.to,
      tone: passo.tone,
    });
  }

  paradas.sort((a, b) => ORDEM[a.etapa] - ORDEM[b.etapa] || a.aluno.nome.localeCompare(b.aluno.nome, "pt-BR"));
  return { paradas, feitas, total: feitas + paradas.length, agora: paradas[0] };
}
