/**
 * Troca segura de exercício DENTRO do editor de plano, pura e testável.
 *
 * Usa o mesmo motor seguro do Prescrever exercício (`rankExercises`), lendo as restrições e
 * os equipamentos do aluno e os cuidados do grupo especial (`combineRules`). Opera SÓ em
 * tempo de edição (Trocar/Adicionar): `rankExercises` nunca entra em `gerarPlano` (decisão
 * travada 14). Não filtra o acervo por conta própria — devolve o ranking inteiro, com os
 * excluídos ao fim, para a UI mostrá-los num grupo separado com o motivo.
 */

import { exercises } from "@/data/exercises";
import {
  rankExercises,
  type GpsAnswers,
  type GpsObjetivo,
  type Recommendation,
} from "@/lib/gps/engine";
import { regraDoPerfil } from "@/lib/gps/farmacos";
import type { Nivel } from "@/data/types";
import type { RestricaoSelecionada } from "@/lib/gps/restricoes";
import type { FarmacoSelecionado } from "@/data/farmacos";

export interface ContextoTroca {
  objetivo: GpsObjetivo;
  nivel: Nivel;
  restricoes: RestricaoSelecionada[];
  equipamentos: string[];
  grupoEspecial?: string;
  /** grupos adicionais confirmados (Aluno.condicoesAtencao); combinam-se ao principal */
  condicoesAtencao?: string[];
  /** classes de medicação declaradas; combinam-se às condições na mesma fusão de cuidados */
  farmacos?: FarmacoSelecionado[];
  farmacosNaoInformado?: boolean;
}

/**
 * Ranqueia o acervo para trocar/adicionar um exercício. `alvo` é o grupo muscular desejado
 * (o do exercício que está saindo, quando for troca); sem alvo, ranqueia de forma geral
 * ("Corpo todo"), útil para "Adicionar exercício".
 */
export function sugerirTroca(ctx: ContextoTroca, alvo?: string): Recommendation[] {
  const grupoMuscular = alvo && alvo.trim() ? alvo : "Corpo todo";
  const answers: GpsAnswers = {
    objetivo: ctx.objetivo,
    grupoMuscular,
    nivel: ctx.nivel,
    restricoes: ctx.restricoes ?? [],
    equipamentos: ctx.equipamentos ?? [],
  };
  // Valida pelo COMBINADO: grupo principal + condições adicionais confirmadas + as classes de
  // medicação declaradas, que entram como mais uma fonte de cuidado na mesma fusão.
  const slugs = [ctx.grupoEspecial, ...(ctx.condicoesAtencao ?? [])].filter(
    (s): s is string => Boolean(s),
  );
  const semPerfil = !slugs.length && !(ctx.farmacos ?? []).length;
  const rule = semPerfil
    ? undefined
    : regraDoPerfil({
        grupos: slugs,
        farmacos: ctx.farmacos,
        farmacosNaoInformado: ctx.farmacosNaoInformado,
      });
  return rebaixarInadequados(rankExercises(exercises, answers, rule), rule);
}

/**
 * REBAIXA, sem esconder, o que não cabe num bloco de FORÇA.
 *
 * Este ranking alimenta o "Trocar" e o "Adicionar" do editor de plano, e o diálogo mostra as
 * DEZ primeiras sugestões. Uma bateria funcional flagrou duas coisas ali:
 *
 * 1. "Caminhada em piso plano" aparecia entre as dez em TODOS os casos testados, inclusive
 *    para substituir um exercício de peitorais. É o mesmo defeito que o gerador de plano
 *    tinha: aparelho de cardio é o mais seguro em todas as métricas, então sobe no ranking
 *    de segurança. Só que o bloco que está sendo trocado se prescreve em série e repetição,
 *    e uma caminhada não.
 * 2. Para uma gestante, as dez traziam quatro exercícios executados deitado, apesar de a
 *    condição declarar "evitar decúbito dorsal prolongado após o 1º trimestre". A correção
 *    que fiz no gerador não alcançava este caminho.
 *
 * Os dois casos recebem tratamentos DIFERENTES de propósito, e a primeira tentativa errou
 * nisso: rebaixar os dois às cegas tirou do topo o ÚNICO exercício de costas disponível para
 * a gestante, e ela ficou com dez sugestões sem nenhuma do grupo pedido. Pior que o defeito.
 *
 *   - APARELHO DE CARDIO: rebaixado. Continua na lista, porque o profissional pode ter razão
 *     para pôr uma caminhada ali, mas sai do topo, porque o bloco se prescreve em série e
 *     repetição.
 *   - POSIÇÃO QUE A CONDIÇÃO PEDE PARA EVITAR: vai para os EXCLUÍDOS, com o motivo escrito.
 *     A tela já tem um grupo separado para eles, e é ali que a informação serve: o
 *     profissional vê o exercício, lê por que a condição desaconselha e decide. Sumir com a
 *     opção sem dizer nada seria decidir por ele.
 */
function rebaixarInadequados(
  recs: Recommendation[],
  rule?: { posicoesEvitar?: readonly string[]; nome?: string },
): Recommendation[] {
  const evitar = new Set(rule?.posicoesEvitar ?? []);
  const tratados = recs.map((r) => {
    const pos = r.exercise.restricaoPerfil?.posicao;
    if (r.excluido || !pos || !evitar.has(pos)) return r;
    return {
      ...r,
      excluido: true,
      motivoExclusao: `Executado na posição "${pos}", que a condição declarada pede para evitar.`,
    };
  });
  const peso = (r: Recommendation) => (r.excluido ? 2 : r.exercise.doseAerobia ? 1 : 0);
  return tratados.map((r, i) => ({ r, i, p: peso(r) })).sort((a, b) => a.p - b.p || a.i - b.i).map((x) => x.r);
}
