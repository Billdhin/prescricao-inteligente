import { useAlunos, REAVALIACAO_DIAS } from "@/lib/store";
import { completarHistoricoDosExemplos, ehAlunoDeExemplo } from "@/data/historicoExemplos";
import { arquivoParaDataUrl } from "@/lib/imagem";
import { withBase } from "@/lib/utils";
import { isCloudOn } from "@/lib/backend/cloudSync";
import { useCloudAuth } from "@/lib/backend/cloudAuth";
import * as repo from "@/lib/backend/supabaseRepo";

export interface ResumoHistorico {
  /** fotos de perfil postas agora (só em exemplo que ainda não tinha foto) */
  fotos: number;
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

/**
 * A FOTO DE PERFIL DE CADA EXEMPLO. São retratos gerados (Lovable, 10/09/2026) de pessoas que
 * não existem, servidos de `public/exemplos/fotos/<id>.jpg`, e passam pelo mesmo caminho da
 * foto posta à mão na ficha: reduzidos ao quadrado de 160 px pela função do app e gravados
 * por `setFotoAluno`, que espelha em `fotos_aluno`.
 *
 * Só entra em exemplo SEM foto: se alguém trocou a foto de um exemplo, a troca manda.
 */
async function porFotosDosExemplos(): Promise<number> {
  const { alunos, setFotoAluno } = useAlunos.getState();
  let postas = 0;
  for (const a of alunos) {
    if (!ehAlunoDeExemplo(a.id) || a.fotoDataUrl) continue;
    try {
      const resposta = await fetch(withBase(`exemplos/fotos/${a.id}.jpg`));
      if (!resposta.ok) continue;
      const blob = await resposta.blob();
      const arquivo = new File([blob], `${a.id}.jpg`, { type: blob.type || "image/jpeg" });
      const foto = await arquivoParaDataUrl(arquivo, { maxW: 160, maxH: 160, modo: "cover-quadrado", qualidade: 0.82 });
      setFotoAluno(a.id, foto);
      postas++;
    } catch {
      // Sem a foto o exemplo segue com as iniciais, que é o que ele sempre teve.
    }
  }
  return postas;
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

  const fotos = await porFotosDosExemplos();

  const resumo: ResumoHistorico = {
    fotos,
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
  // Em LOTE (poucas requisições no total): uma por registro levou 25 minutos numa aba em
  // segundo plano, porque o Chrome segura os temporizadores do cliente do Supabase.
  await emLotes(h.alunos, 6, (a) => tentar(() => repo.salvarAluno(a)));
  await tentar(() => repo.salvarAvaliacoesEmLote(h.avaliacoes));
  await emLotes(h.planos, 4, (p) => tentar(() => repo.salvarPlano(p)));
  await tentar(() => repo.salvarLiberacoesEmLote(h.liberacoes));

  const profissional = useCloudAuth.getState().user?.id;
  const [primeira, ...demais] = h.execucoes;
  let treinosSobem = !primeira;
  if (profissional && primeira) {
    treinosSobem = await repo
      .salvarExecucoesEmLote([primeira], profissional)
      .then(() => true)
      .catch(() => false);
  }
  if (profissional && treinosSobem) {
    await tentar(() => repo.salvarExecucoesEmLote(demais, profissional));
    await tentar(() => repo.salvarSessaoFeedbacksEmLote(h.feedbacks, profissional));
  }
  resumo.nuvem = treinosSobem ? "ok" : "treinos-locais";
  return resumo;
}
