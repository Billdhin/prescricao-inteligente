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
  return rankExercises(exercises, answers, rule);
}
