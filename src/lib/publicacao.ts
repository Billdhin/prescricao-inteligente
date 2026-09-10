import type { PlanoTreino } from "@/data/periodizacao";

/**
 * PUBLICAR: O MOMENTO EM QUE O TREINO DEIXA DE SER DO PROFISSIONAL E VIRA DO ALUNO.
 *
 * Relato do Filipe (10/09/2026): "a parte de publicar o treino para o aluno não está muito
 * clara". E não estava: o plano gerado vivia na sessão do navegador, só a tela de prescrição
 * sabia dele, e a pílula dizia "Salvo" ou "Rascunho" sem nunca dizer o que importa, que é se o
 * ALUNO está vendo. Quem gerava o treino e saía da tela encontrava, na lista e na ficha, o
 * aluno como "sem treino", sem pista de que havia um pronto esperando um clique.
 *
 * Por isso a publicação tem três estados com nome, lidos da mesma fonte em toda tela:
 *
 *   "nao-publicado"   há um treino pronto e o aluno ainda não tem nenhum
 *   "alteracoes"      o aluno tem um treino e há uma versão nova (editada ou refeita) esperando
 *   "publicado"       o aluno vê exatamente o que está salvo
 *
 * O rascunho mora num lugar próprio (`rascunhos` na store, um por aluno, neste aparelho) e
 * NUNCA na tabela de planos: o aluno lê essa tabela, e o que ainda não foi publicado não é dele.
 */

export type EstadoPublicacao = "sem-treino" | "nao-publicado" | "alteracoes" | "publicado";

export interface SituacaoDoTreino {
  estado: EstadoPublicacao;
  /** o treino que o aluno vê hoje, se houver */
  ativo?: PlanoTreino;
  /** o que está pronto e ainda não chegou ao aluno, se houver */
  rascunho?: PlanoTreino;
  /** o rascunho é um treino NOVO que vai substituir o atual (e não uma edição dele) */
  substitui: boolean;
}

export const rascunhoDoAluno = (rascunhos: PlanoTreino[] | undefined, alunoId: string): PlanoTreino | undefined =>
  (rascunhos ?? []).find((r) => r.alunoId === alunoId);

export function situacaoDoTreino(alunoId: string, planos: PlanoTreino[], rascunhos: PlanoTreino[] | undefined): SituacaoDoTreino {
  const ativo = planos.filter((p) => p.alunoId === alunoId && p.status === "ativo").sort((a, b) => b.data - a.data)[0];
  const rascunho = rascunhoDoAluno(rascunhos, alunoId);
  if (rascunho && !ativo) return { estado: "nao-publicado", rascunho, substitui: false };
  if (rascunho && ativo) return { estado: "alteracoes", ativo, rascunho, substitui: rascunho.id !== ativo.id };
  if (ativo) return { estado: "publicado", ativo, substitui: false };
  return { estado: "sem-treino", substitui: false };
}

/**
 * O plano que vai para o aluno. A DATA é o que decide em que semana ele está (`semanaAtual`
 * conta a partir dela), e até aqui ela era a hora em que o treino foi GERADO: um rascunho
 * gerado na segunda e publicado na quinta chegava ao aluno "na semana 1" já com quatro dias
 * comidos, e um rascunho esquecido por dez dias chegava na semana 2. Agora:
 *
 *   - treino novo (ou refeito por cima do atual): começa na hora da publicação;
 *   - edição do treino que o aluno já tem: o calendário dele segue de onde está.
 *
 * Refeito e editado se distinguem pela própria data: o gerador carimba a hora ao gerar, e a
 * edição preserva a do plano salvo.
 */
export function planoParaPublicar(rascunho: PlanoTreino, existente: PlanoTreino | undefined, agora = Date.now()): PlanoTreino {
  const edicao = !!existente && existente.status === "ativo" && existente.data === rascunho.data;
  return { ...rascunho, status: "ativo", data: edicao ? existente!.data : agora };
}

const fmt = (ts: number) => new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(ts));

/** A frase curta do estado, a mesma na lista, na ficha e no editor. */
export function rotuloDaPublicacao(s: SituacaoDoTreino): string {
  switch (s.estado) {
    case "nao-publicado":
      return "Não publicado";
    case "alteracoes":
      return s.substitui ? "Treino novo não publicado" : "Alterações não publicadas";
    case "publicado":
      return `No app desde ${fmt(s.ativo!.data)}`;
    default:
      return "Sem treino";
  }
}
