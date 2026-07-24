/**
 * Classificador de grupos especiais (Onda 3 · TRI-3).
 *
 * A partir do cadastro e da última avaliação do aluno, SUGERE direcionamentos de
 * grupo especial (obesidade, hipertensão, idoso destreinado). O sistema apenas
 * sugere; o profissional habilitado confirma. Linguagem prudente, NÃO diagnóstica:
 * "IMC 31,2 indica obesidade grau I; confirme o direcionamento", nunca "é obeso".
 *
 * Regra de ouro: só sugere com o dado presente. A ausência de um dado (IMC, PA,
 * idade) simplesmente não gera sugestão para aquele critério. Todo corte citado
 * tem referência REAL verificada no PubMed (ver src/data/referencias.ts); nada é
 * inventado. Não sugere o que o aluno já tem (grupoEspecial ou condicoesAtencao)
 * nem o que o profissional já dispensou (sugestoesDispensadas).
 */

import type { Aluno, Avaliacao } from "@/data/alunos";

export interface SugestaoGrupo {
  /** slug do grupo especial em src/data/specialGroups.ts */
  grupoSlug: string;
  /** rótulo honesto do direcionamento (ex.: "Obesidade grau I", "Hipertensão") */
  rotulo: string;
  /** por que a sugestão apareceu, citando o dado medido, em linguagem prudente */
  motivo: string;
  /** critério objetivo por trás da sugestão (o corte da referência) */
  criterio: string;
  /** id da referência que fundamenta o corte (src/data/referencias.ts) */
  refId: string;
  /** de onde veio o dado que disparou a sugestão */
  fonte: "cadastro" | "avaliacao";
  /** quando true, é uma RECOMENDAÇÃO DE ENCAMINHAMENTO (não um grupo de treino):
   *  o dado medido pede avaliação/liberação médica antes de prescrever treino
   *  (ex.: PA >= 180/110). Não deve virar grupo do aluno; a UI só informa. */
  encaminhamento?: boolean;
}

/**
 * Corte etário de "idoso": 65 anos é a demarcação padrão de pessoa idosa
 * (classificação internacional; MeSH "Aged" = 65+). Os posicionamentos NSCA
 * (fragala-2019) e ACSM (chodzko-2009) sustentam a prioridade de força e
 * equilíbrio nesse perfil; não é um número inventado, é o corte convencional.
 */
export const IDADE_IDOSO = 65;

/** Formata número no padrão pt-BR (vírgula, 1 casa quando fracionário). */
function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".", ",");
}

/**
 * Grau da obesidade pelo IMC (estratificação convencional da OMS): devolve o SLUG
 * do grupo por grau, o rótulo honesto e o corte citável. Chamada só com IMC >= 30.
 * Fonte do corte: seidell-flegal-1997 (reforçada por who-imc-2004).
 */
function grauObesidade(imc: number): { slug: string; rotulo: string; criterio: string } {
  if (imc >= 40) return { slug: "obesidade-grau-3", rotulo: "Obesidade grau III", criterio: "IMC ≥ 40 kg/m²" };
  if (imc >= 35) return { slug: "obesidade-grau-2", rotulo: "Obesidade grau II", criterio: "IMC 35 a 39,9 kg/m²" };
  return { slug: "obesidade-grau-1", rotulo: "Obesidade grau I", criterio: "IMC 30 a 34,9 kg/m²" };
}

/**
 * Estágio da hipertensão pela PA de consultório (Diretriz SBC 2020). O maior valor,
 * sistólico ou diastólico, define o estágio. Devolve null quando nenhum dado de PA
 * está presente ou quando a PA não caracteriza hipertensão (abaixo de 140/90).
 *
 * A partir de 180/110 mmHg NÃO vira grupo de treino: sinaliza ENCAMINHAMENTO
 * (avaliação/liberação médica antes de qualquer prescrição). Regra do produto:
 * PA muito elevada recomenda conduta de saúde, nunca sugestão de treino.
 */
function estagioHipertensao(
  sis?: number,
  dia?: number,
): { slug: string; rotulo: string; criterio: string; encaminhamento?: boolean } | null {
  const s = typeof sis === "number" ? sis : -1;
  const d = typeof dia === "number" ? dia : -1;
  if (s < 0 && d < 0) return null;
  if (s >= 180 || d >= 110)
    return {
      slug: "encaminhamento-pa-elevada",
      rotulo: "Pressão muito elevada: avaliação médica",
      criterio: "PA sistólica ≥ 180 ou diastólica ≥ 110 mmHg (SBC 2020)",
      encaminhamento: true,
    };
  if (s >= 160 || d >= 100)
    return { slug: "hipertensao-estagio-2", rotulo: "Hipertensão estágio 2", criterio: "PA sistólica 160 a 179 ou diastólica 100 a 109 mmHg (SBC 2020)" };
  if (s >= 140 || d >= 90)
    return { slug: "hipertensao-estagio-1", rotulo: "Hipertensão estágio 1", criterio: "PA sistólica 140 a 159 ou diastólica 90 a 99 mmHg (SBC 2020)" };
  return null;
}

/**
 * Retorna TODAS as sugestões de grupo aplicáveis ao aluno (multi-grupo), lendo o
 * cadastro e a avaliação mais recente. Vazio quando nenhum critério dispara.
 */
export function classificarGrupos(aluno: Aluno, avaliacoes: Avaliacao[]): SugestaoGrupo[] {
  const sugestoes: SugestaoGrupo[] = [];

  // O que o aluno já tem ou já dispensou não volta como sugestão.
  const bloqueados = new Set<string>(
    [
      aluno.grupoEspecial ?? "",
      ...(aluno.condicoesAtencao ?? []),
      ...(aluno.sugestoesDispensadas ?? []),
    ].filter(Boolean),
  );

  const add = (s: SugestaoGrupo) => {
    if (bloqueados.has(s.grupoSlug)) return;
    if (sugestoes.some((x) => x.grupoSlug === s.grupoSlug)) return;
    sugestoes.push(s);
  };

  // Última avaliação do aluno (a mais recente por data).
  const ultima = avaliacoes
    .filter((a) => a.alunoId === aluno.id)
    .sort((a, b) => b.data - a.data)[0];
  const m = ultima?.medidas;

  // --- IMC ≥ 30 → obesidade (com o GRAU real: grau I/II/III por faixa) ---
  const imc = m?.imc;
  if (typeof imc === "number" && imc >= 30) {
    const g = grauObesidade(imc);
    add({
      grupoSlug: g.slug,
      rotulo: g.rotulo,
      motivo: `IMC ${fmt(imc)} kg/m² na faixa de ${g.rotulo}. Confirme o direcionamento.`,
      criterio: g.criterio,
      refId: "seidell-flegal-1997",
      fonte: "avaliacao",
    });
  }

  // --- PA → hipertensão por ESTÁGIO (1/2); ≥ 180/110 → encaminhamento, não treino ---
  const sis = m?.pressaoSistolica;
  const dia = m?.pressaoDiastolica;
  const est = estagioHipertensao(sis, dia);
  if (est) {
    const paTxt = `${typeof sis === "number" ? fmt(sis) : "-"}/${typeof dia === "number" ? fmt(dia) : "-"}`;
    add({
      grupoSlug: est.slug,
      rotulo: est.rotulo,
      motivo: est.encaminhamento
        ? `PA aferida ${paTxt} mmHg, muito elevada. Não prescreva treino hoje; oriente avaliação ou liberação médica antes de retomar.`
        : `PA aferida ${paTxt} mmHg na faixa de ${est.rotulo}. Confirme o diagnóstico e a liberação médica.`,
      criterio: est.criterio,
      refId: "sbc-2020",
      fonte: "avaliacao",
      encaminhamento: est.encaminhamento,
    });
  }

  // --- Idade ≥ 65 + nível Iniciante → idoso destreinado ---
  if (typeof aluno.idade === "number" && aluno.idade >= IDADE_IDOSO && aluno.nivel === "Iniciante") {
    add({
      grupoSlug: "idoso-destreinado",
      rotulo: "Idoso destreinado",
      motivo: `Idade ${aluno.idade} anos com nível iniciante: o treino de força e equilíbrio é prioridade neste perfil. Confirme o direcionamento.`,
      criterio: "Idade ≥ 65 anos e nível iniciante",
      refId: "fragala-2019",
      fonte: "cadastro",
    });
  }

  return sugestoes;
}
