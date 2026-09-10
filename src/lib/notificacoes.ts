import type { Aluno, Liberacao } from "@/data/alunos";
import type { SessaoFeedback } from "@/data/execucao";
import type { PlanoTreino } from "@/data/periodizacao";
import { estadoSemaforo } from "@/lib/gps/semaforoDiario";
import { dataReavaliacao, linkDoPasso } from "@/lib/gps/proximoPasso";
import { rotuloFaixaPse } from "@/lib/pse";
import { pedidoTreinoEmAberto, pendentesDe, type DeclaracaoAluno } from "@/data/declaracoes";

/**
 * NOTIFICAÇÕES DO PROFISSIONAL, todas DERIVADAS.
 *
 * O sino mostrava `useProgress.activities`, que é o histórico de ESTUDO: o
 * profissional abria o sino esperando "o que aconteceu com os meus alunos" e via
 * "você concluiu uma aula". Aqui as três coisas que de fato exigem reação são
 * calculadas dos mesmos dados que o resto do app já usa, no espírito do
 * `proximoPasso.ts`: nenhum evento é gravado, nada pode ficar desatualizado, e
 * duas telas nunca discordam sobre o estado de um aluno.
 *
 *   1. vermelho pendente do semáforo (`semaforoDiario.ts`);
 *   2. reavaliação vencida (`dataReavaliacao`, a mesma do macrociclo);
 *   3. sessão concluída pelo aluno, com o esforço FORMATADO por `rotuloFaixaPse`
 *      (nunca um número solto nem um rótulo inventado);
 *   4. pedido de treino do aluno, enquanto ninguém publicou o plano (`declaracoes.ts`).
 *
 * O ÚNICO estado novo é lido/não lido, e ele vive na store (`pi-notificacoes`).
 * Por isso o `id` é determinístico, montado a partir do registro de origem: se
 * fosse sorteado, "lida" não grudaria entre recarregamentos.
 */
export type NotifTipo = "semaforo" | "reavaliacao" | "sessao" | "pedido";

export interface Notificacao {
  /** determinístico: tipo + registro de origem. Nunca sorteado. */
  id: string;
  tipo: NotifTipo;
  alunoId: string;
  alunoNome: string;
  /** frase pronta, na voz da casa (verbo, sem travessão) */
  texto: string;
  /** quando o fato aconteceu (ordena a lista) */
  ts: number;
  /** para onde o clique leva, já na aba certa */
  to: string;
  /** urgência: o vermelho do semáforo é o único que pede ação hoje */
  tone: "danger" | "warning" | "analysis";
}

export interface NotifCtx {
  alunos: Aluno[];
  planos: PlanoTreino[];
  liberacoes: Liberacao[];
  sessaoFeedbacks: SessaoFeedback[];
  /** o que o aluno informou e pediu no app; opcional porque chegou depois */
  declaracoes?: DeclaracaoAluno[];
}

const DIA = 86_400_000;

const diasAtras = (ts: number) => Math.floor((Date.now() - ts) / DIA);

/** "hoje", "ontem" ou "há N dias": data relativa curta, sem biblioteca. */
function quando(ts: number): string {
  const d = diasAtras(ts);
  if (d <= 0) return "hoje";
  if (d === 1) return "ontem";
  return `há ${d} dias`;
}

/**
 * Monta a lista completa, da mais recente para a mais antiga, com o vermelho do
 * semáforo sempre no topo: é o único item que significa "não treine hoje até
 * você olhar", e enterrá-lo na ordem cronológica seria esconder a urgência.
 */
export function notificacoes(ctx: NotifCtx): Notificacao[] {
  const out: Notificacao[] = [];
  const agora = Date.now();

  for (const aluno of ctx.alunos) {
    if (aluno.status !== "ativo") continue;
    const planoAtivo = ctx.planos.find((p) => p.alunoId === aluno.id && p.status === "ativo");

    // 1. Vermelho pendente: segue em aberto até um novo semáforo de qualquer cor.
    const { vermelhoPendente } = estadoSemaforo(aluno.id, ctx.liberacoes);
    if (vermelhoPendente) {
      out.push({
        id: `semaforo:${vermelhoPendente.id}`,
        tipo: "semaforo",
        alunoId: aluno.id,
        alunoNome: aluno.nome,
        texto: `${aluno.nome} ficou sem liberação ${quando(vermelhoPendente.data)}. Refaça o semáforo antes de treinar.`,
        ts: vermelhoPendente.data,
        to: linkDoPasso(aluno.id, "liberar"),
        tone: "danger",
      });
    }

    // 2. Reavaliação vencida. A data sai de `dataReavaliacao`, que já sabe que o
    //    macrociclo manda quando há plano ativo: usar `proximaReavaliacaoEm` cru
    //    aqui faria o sino brigar com a tela do aluno.
    const reav = dataReavaliacao(aluno, planoAtivo);
    if (reav && reav.em < agora) {
      const dias = diasAtras(reav.em);
      out.push({
        id: `reavaliacao:${aluno.id}:${reav.em}`,
        tipo: "reavaliacao",
        alunoId: aluno.id,
        alunoNome: aluno.nome,
        texto:
          dias <= 0
            ? `A reavaliação de ${aluno.nome} vence hoje.`
            : `A reavaliação de ${aluno.nome} venceu ${quando(reav.em)}.`,
        ts: reav.em,
        to: linkDoPasso(aluno.id, "reavaliar"),
        tone: "warning",
      });
    }

    // 4. Pedido de treino em aberto. Fica no sino até o plano ser publicado (o plano
    //    ativo fecha o pedido), e a frase diz se há dados do aluno para revisar antes,
    //    porque é por eles que o treino começa. O id leva a data do pedido: pedir de
    //    novo depois de um plano arquivado vira notificação nova, não uma já lida.
    const pedido = pedidoTreinoEmAberto(ctx.declaracoes ?? [], aluno.id, !!planoAtivo);
    if (pedido) {
      const dados = pendentesDe(ctx.declaracoes ?? [], aluno.id).length;
      out.push({
        id: `pedido:${aluno.id}:${pedido.declaradaEm}`,
        tipo: "pedido",
        alunoId: aluno.id,
        alunoNome: aluno.nome,
        texto:
          dados > 0
            ? `${aluno.nome} preencheu os dados e pediu o treino ${quando(pedido.declaradaEm)}. Revise as respostas e monte o plano.`
            : `${aluno.nome} pediu o treino ${quando(pedido.declaradaEm)}.`,
        ts: pedido.declaradaEm,
        to: `/alunos/${aluno.id}`,
        tone: "warning",
      });
    }
  }

  // 3. Sessões concluídas pelo aluno nos últimos 7 dias. Mais que isso já não é
  //    notícia, é histórico (que vive na aba do aluno).
  const nomePorId = new Map(ctx.alunos.map((a) => [a.id, a.nome]));
  for (const f of ctx.sessaoFeedbacks) {
    if (agora - f.concluidaEm > 7 * DIA) continue;
    const nome = nomePorId.get(f.alunoId);
    if (!nome) continue;
    // O esforço entra pelo rótulo publicado da escala, nunca como número solto:
    // "8" não diz nada a quem não tem a tabela na cabeça.
    const esforco = f.pse != null ? `, esforço ${f.pse} (${rotuloFaixaPse(f.pse).rotulo.toLowerCase()})` : "";
    const recado = f.observacao?.trim() ? " Deixou um recado." : "";
    out.push({
      id: `sessao:${f.id}`,
      tipo: "sessao",
      alunoId: f.alunoId,
      alunoNome: nome,
      texto: `${nome} concluiu o treino ${quando(f.concluidaEm)}${esforco}.${recado}`,
      ts: f.concluidaEm,
      to: linkDoPasso(f.alunoId, "acompanhar"),
      tone: "analysis",
    });
  }

  out.sort((a, b) => b.ts - a.ts);
  // Urgência antes de cronologia: os vermelhos sobem, o resto mantém a ordem.
  return [...out.filter((n) => n.tone === "danger"), ...out.filter((n) => n.tone !== "danger")];
}
