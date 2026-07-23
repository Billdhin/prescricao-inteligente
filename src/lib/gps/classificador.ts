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

/** Grau da obesidade pelo IMC (estratificação convencional da OMS). */
function grauObesidade(imc: number): string {
  if (imc >= 40) return "Obesidade grau III";
  if (imc >= 35) return "Obesidade grau II";
  return "Obesidade grau I";
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

  // --- IMC ≥ 30 → obesidade (com o grau real como rótulo honesto) ---
  const imc = m?.imc;
  if (typeof imc === "number" && imc >= 30) {
    const rotulo = grauObesidade(imc);
    add({
      grupoSlug: "obesidade-grave",
      rotulo,
      motivo: `IMC ${fmt(imc)} kg/m² na faixa de ${rotulo} (obesidade, IMC ≥ 30). Confirme o direcionamento.`,
      criterio: "IMC ≥ 30 kg/m²",
      refId: "seidell-flegal-1997",
      fonte: "avaliacao",
    });
  }

  // --- PA sistólica ≥ 140 ou diastólica ≥ 90 → hipertensão ---
  const sis = m?.pressaoSistolica;
  const dia = m?.pressaoDiastolica;
  if ((typeof sis === "number" && sis >= 140) || (typeof dia === "number" && dia >= 90)) {
    const paTxt = `${typeof sis === "number" ? fmt(sis) : "-"}/${typeof dia === "number" ? fmt(dia) : "-"}`;
    add({
      grupoSlug: "hipertensao",
      rotulo: "Hipertensão",
      motivo: `PA aferida ${paTxt} mmHg; confirme o diagnóstico e a liberação médica.`,
      criterio: "PA sistólica ≥ 140 ou diastólica ≥ 90 mmHg",
      refId: "sbc-2020",
      fonte: "avaliacao",
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
