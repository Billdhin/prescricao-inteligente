import type { Exercise } from "@/data/types";
import { GRUPOS_MUSCULARES } from "@/lib/gps/engine";
import type { Recommendation } from "@/lib/gps/engine";

/**
 * O ACERVO AGRUPADO PARA ESCOLHER UM EXERCÍCIO.
 *
 * Pedido de campo (colega do Filipe, personal, 02/09/2026): "tem como criar um filtro por
 * grupamento muscular? Ou ao menos deixar em ordem alfabética". Ele estava olhando uma
 * lista de 101 itens sem cabeçalho nenhum, rolando às cegas.
 *
 * A ordem que ele via NÃO era aleatória: era o ranking de segurança e pertinência daquele
 * aluno (`sugerirTroca`), com o mais adequado no topo. Deixar alfabético resolveria a
 * busca e jogaria fora exatamente a inteligência que o produto vende, então a saída é
 * agrupar por músculo e **preservar o ranking dentro de cada grupo**: quem procura "um
 * exercício de costas" acha a seção, e o primeiro item dela continua sendo o mais indicado
 * para aquele aluno.
 *
 * A varredura para responder ao pedido achou um defeito maior que ele: para uma aluna com
 * halteres e elástico em casa, **41 dos 101 itens da lista eram de equipamento que ela não
 * tem**. Estavam no fim por causa do ranking, mas estavam. Agora eles vão para um grupo
 * próprio no fim, dito com todas as letras, em vez de se misturarem aos disponíveis.
 *
 * Sem perfil de aluno (plano avulso), a ordem dentro do grupo é alfabética, que é a mais
 * previsível quando não há a quem ranquear.
 */

export interface GrupoDoAcervo {
  /** rótulo do <optgroup>: o grupo muscular, ou o aviso de equipamento */
  rotulo: string;
  exercicios: Exercise[];
}

/** O grupo dos que o aluno não tem como executar hoje. Fica no fim, e diz por quê. */
export const ROTULO_SEM_EQUIPAMENTO = "Fora do equipamento declarado";

/**
 * A ordem dos grupos é FIXA (a do catálogo, em GRUPOS_MUSCULARES), e não por relevância.
 * Um seletor que reordena as seções a cada aluno impede a memória de uso: o profissional
 * que abre isto vinte vezes por dia precisa saber onde "Costas" fica. A inteligência do
 * perfil aparece DENTRO da seção, na ordem dos itens.
 */
const ORDEM: string[] = [...GRUPOS_MUSCULARES];
const posicao = (grupo: string) => {
  const i = ORDEM.indexOf(grupo);
  // Grupo fora da lista canônica (Tornozelo e pé, Pescoço) entra depois dos conhecidos,
  // em ordem alfabética entre si, em vez de sumir ou brigar por posição.
  return i === -1 ? ORDEM.length : i;
};

/**
 * Agrupa as recomendações para o seletor, preservando a ordem recebida dentro de cada
 * grupo. `comEquipamento` distingue o que o aluno consegue executar hoje; quando a lista
 * não traz essa informação (plano avulso), todos entram como disponíveis.
 */
export function agruparAcervo(itens: { exercise: Exercise; equipDisponivel?: boolean }[]): GrupoDoAcervo[] {
  const porGrupo = new Map<string, Exercise[]>();
  const semEquip: Exercise[] = [];
  for (const it of itens) {
    if (it.equipDisponivel === false) {
      semEquip.push(it.exercise);
      continue;
    }
    const g = it.exercise.grupoMuscular;
    if (!porGrupo.has(g)) porGrupo.set(g, []);
    porGrupo.get(g)!.push(it.exercise);
  }
  const grupos = [...porGrupo.entries()]
    .sort((a, b) => posicao(a[0]) - posicao(b[0]) || a[0].localeCompare(b[0], "pt-BR"))
    .map(([rotulo, exercicios]) => ({ rotulo, exercicios }));
  if (semEquip.length) grupos.push({ rotulo: ROTULO_SEM_EQUIPAMENTO, exercicios: semEquip });
  return grupos;
}

/** Atalho para o caso sem perfil: agrupa o acervo inteiro, alfabético dentro do grupo. */
export function acervoAlfabeticoAgrupado(exercicios: Exercise[]): GrupoDoAcervo[] {
  return agruparAcervo(
    [...exercicios].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")).map((exercise) => ({ exercise })),
  );
}

/** Agrupa a partir das recomendações do motor, mantendo o ranking dentro de cada grupo. */
export function acervoRanqueadoAgrupado(recs: Recommendation[]): GrupoDoAcervo[] {
  return agruparAcervo(recs.map((r) => ({ exercise: r.exercise, equipDisponivel: r.equipDisponivel })));
}
