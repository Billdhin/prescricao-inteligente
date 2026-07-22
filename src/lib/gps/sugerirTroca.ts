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
import { combineRules } from "@/lib/gps/groupRules";
import type { Nivel } from "@/data/types";
import type { RestricaoSelecionada } from "@/lib/gps/restricoes";

export interface ContextoTroca {
  objetivo: GpsObjetivo;
  nivel: Nivel;
  restricoes: RestricaoSelecionada[];
  equipamentos: string[];
  grupoEspecial?: string;
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
  const rule = ctx.grupoEspecial ? combineRules([ctx.grupoEspecial]) : undefined;
  return rankExercises(exercises, answers, rule);
}
