/**
 * Montagem do PRONTUÁRIO DE DECISÃO TÉCNICA — o rastro auditável do Motor RCD.
 * A partir do ranking já computado pelo motor (que inclui o breakdown por
 * critério de TODOS os exercícios, inclusive os que não entraram), congela:
 * escolhidos com o porquê, descartados com o porquê, cuidados do grupo,
 * semáforo do dia, modalidades e a bibliografia citada.
 */

import type { Recommendation } from "./engine";
import type { GroupGpsRule } from "./groupRules";
import type { ModalidadeRec } from "./modalidadeRules";
import type { Liberacao, ProntuarioSnapshot } from "@/data/alunos";
import { getParam } from "@/data/monitoringParameters";
import { getSemaforo } from "@/data/semaforo";

export const MOTOR_VERSAO = "RCD v1";

/** Critério que mais derrubou o score (o "porquê" do descarte). */
function motivoPrincipal(rec: Recommendation): string {
  let pior: { falta: number; texto: string } | null = null;
  for (const b of rec.breakdown) {
    if (b.pontosPossiveis <= 0) {
      // critério penalizante (ex.: Cuidados do grupo) — peso negativo é motivo forte
      if (b.peso < 0) {
        const texto = `${b.criterio}: ${b.detalhe}`;
        if (!pior || -b.peso + 100 > pior.falta) pior = { falta: -b.peso + 100, texto };
      }
      continue;
    }
    const falta = b.pontosPossiveis - b.peso;
    if (!pior || falta > pior.falta) pior = { falta, texto: `${b.criterio}: ${b.detalhe}` };
  }
  return pior?.texto ?? "Pontuação inferior nos critérios do perfil.";
}

export function montarProntuario({
  results,
  topN = 3,
  series,
  rule,
  liberacao,
  modalidades,
  parametros,
}: {
  results: Recommendation[];
  topN?: number;
  /** sugestão de séries por objetivo (aplicada aos escolhidos) */
  series?: string;
  rule?: GroupGpsRule;
  /** última liberação do Semáforo (se houver, entra como contexto do dia) */
  liberacao?: Liberacao;
  modalidades?: ModalidadeRec[];
  parametros?: string[];
}): ProntuarioSnapshot {
  const escolhidos = results.slice(0, topN).map((r) => ({
    slug: r.exercise.slug,
    nome: r.exercise.nome,
    score: r.score,
    series,
    reasons: r.reasons,
    cautions: r.cautions,
    breakdown: r.breakdown.map((b) => ({ ...b })),
  }));

  // Descartados relevantes: os próximos do ranking (o profissional consideraria)
  // — com o critério que mais pesou contra cada um.
  const descartados = results.slice(topN, topN + 5).map((r) => ({
    slug: r.exercise.slug,
    nome: r.exercise.nome,
    score: r.score,
    motivoPrincipal: motivoPrincipal(r),
  }));

  // Bibliografia: regras do grupo + parâmetros monitorados + semáforo do dia.
  const refIds: string[] = [];
  const addRefs = (ids?: string[]) => {
    for (const id of ids ?? []) if (!refIds.includes(id)) refIds.push(id);
  };
  addRefs(rule?.refs);
  for (const pid of parametros ?? []) addRefs(getParam(pid)?.refIds);
  if (liberacao) {
    const checklist = getSemaforo(liberacao.grupoSlug);
    for (const item of checklist?.itens ?? []) addRefs(item.refs);
  }

  return {
    escolhidos,
    descartados,
    cuidadosGrupo: rule ? { nome: rule.nome, cuidados: rule.cuidados, refs: rule.refs ?? [] } : undefined,
    semaforo: liberacao
      ? {
          resultado: liberacao.resultado,
          data: liberacao.data,
          ajustes: liberacao.ajustes.map((a) => a.acao),
        }
      : undefined,
    modalidades: modalidades?.map((m) => ({ id: m.modalidade.id, nome: m.modalidade.nome, motivo: m.motivo })),
    parametros: parametros ?? [],
    refIds,
    geradoEm: Date.now(),
    motorVersao: MOTOR_VERSAO,
  };
}
