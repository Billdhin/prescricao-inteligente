import { useAlunos, REAVALIACAO_DIAS } from "@/lib/store";
import { completarHistoricoDosExemplos } from "@/data/historicoExemplos";
import { isCloudOn } from "@/lib/backend/cloudSync";
import { useCloudAuth } from "@/lib/backend/cloudAuth";
import * as repo from "@/lib/backend/supabaseRepo";

export interface ResumoHistorico {
  alunos: number;
  avaliacoes: number;
  planos: number;
  sessoes: number;
  series: number;
  semaforos: number;
  /** "local": sem conta; "ok": tudo na nuvem; "treinos-locais": o resto subiu, os treinos não */
  nuvem: "local" | "ok" | "treinos-locais";
  falhas: number;
}

/** Roda `fn` sobre a lista com no máximo `n` gravações ao mesmo tempo. */
async function emLotes<T>(lista: T[], n: number, fn: (x: T) => Promise<unknown>) {
  for (let i = 0; i < lista.length; i += n) await Promise.all(lista.slice(i, i + n).map(fn));
}

/**
 * Completa o histórico dos alunos de exemplo (src/data/historicoExemplos.ts) no aparelho e,
 * com conta, na nuvem.
 *
 * Mora fora do store de propósito: é uma ação rara, de demonstração, e o store é o arquivo
 * mais disputado do projeto. Aqui ela só lê o estado, mescla por id e grava.
 *
 * Os TREINOS (execuções e PSE) sobem por último e com um teste antes: a regra do banco que
 * deixa o profissional gravá-los é a migração 0012. Sem ela, o primeiro registro volta
 * recusado, e em vez de disparar milhares de gravações que falhariam, o resumo avisa que os
 * treinos ficaram neste aparelho. Rodar de novo depois da migração sobe tudo (ids fixos).
 */
export async function completarHistoricoDosExemplosNaConta(): Promise<ResumoHistorico> {
  const estado = useAlunos.getState();
  const h = completarHistoricoDosExemplos(estado, { reavaliacaoDias: REAVALIACAO_DIAS });

  const porId = <T extends { id: string }>(novos: T[], atuais: T[]): T[] => {
    const m = new Map(atuais.map((x) => [x.id, x] as const));
    for (const n of novos) m.set(n.id, n);
    return [...m.values()];
  };
  useAlunos.setState((s) => ({
    alunos: s.alunos.map((a) => h.alunos.find((x) => x.id === a.id) ?? a),
    avaliacoes: porId(h.avaliacoes, s.avaliacoes).sort((a, b) => b.data - a.data),
    planos: [...h.planos, ...s.planos],
    liberacoes: porId(h.liberacoes, s.liberacoes).sort((a, b) => b.data - a.data),
    execucoes: porId(h.execucoes, s.execucoes)
      .sort((a, b) => b.concluidoEm - a.concluidoEm)
      .slice(0, 6000),
    sessaoFeedbacks: porId(h.feedbacks, s.sessaoFeedbacks)
      .sort((a, b) => b.concluidaEm - a.concluidaEm)
      .slice(0, 1500),
  }));

  const resumo: ResumoHistorico = {
    alunos: h.alunos.length,
    avaliacoes: h.avaliacoes.length,
    planos: h.planos.length,
    sessoes: h.feedbacks.length,
    series: h.execucoes.length,
    semaforos: h.liberacoes.length,
    nuvem: "local",
    falhas: 0,
  };
  if (!isCloudOn()) return resumo;

  const tentar = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
    } catch {
      resumo.falhas++;
    }
  };
  for (const a of h.alunos) await tentar(() => repo.salvarAluno(a));
  await emLotes(h.avaliacoes, 8, (av) => tentar(() => repo.salvarAvaliacao(av)));
  for (const p of h.planos) await tentar(() => repo.salvarPlano(p));
  await emLotes(h.liberacoes, 8, (l) => tentar(() => repo.salvarLiberacao(l)));

  const profissional = useCloudAuth.getState().user?.id;
  const [primeira, ...demais] = h.execucoes;
  let treinosSobem = !primeira;
  if (profissional && primeira) {
    treinosSobem = await repo
      .salvarExecucao(primeira, profissional)
      .then(() => true)
      .catch(() => false);
  }
  if (profissional && treinosSobem) {
    await emLotes(demais, 16, (e) => tentar(() => repo.salvarExecucao(e, profissional)));
    await emLotes(h.feedbacks, 16, (f) => tentar(() => repo.salvarSessaoFeedback(f, profissional)));
  }
  resumo.nuvem = treinosSobem ? "ok" : "treinos-locais";
  return resumo;
}
