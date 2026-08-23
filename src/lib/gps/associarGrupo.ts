import type { Aluno } from "@/data/alunos";
import { getSpecialGroup } from "@/data/specialGroups";

/**
 * ASSOCIAR UMA JORNADA A UM ALUNO, DE UM JEITO SÓ.
 *
 * Esta regra já existia, escrita à mão dentro do card de sugestão do direcionamento. Aí
 * o botão "Escolher grupo" do perfil do aluno passou a precisar dela também, e duas
 * cópias da mesma regra clínica é como se perde a coerência: bastaria alguém acrescentar
 * um campo semeado num lugar e esquecer do outro para o mesmo grupo entrar diferente
 * dependendo da porta por onde o profissional passou.
 *
 * A regra tem dois ramos, e a diferença entre eles é de produto, não de código:
 *
 * - SEM grupo principal ainda: o grupo vira o principal E SEMEIA A JORNADA (fase 1,
 *   modalidades indicadas, parâmetros a monitorar, critério para avançar). É isso que
 *   transforma "escolhi um grupo" em "tenho um caminho".
 * - JÁ COM principal: entra como condição de atenção adicional. O motor combina os
 *   cuidados de forma conservadora, e trocar o principal em silêncio apagaria uma decisão
 *   que alguém tomou antes.
 */
export type ResultadoAssociacao =
  | { tipo: "principal"; patch: Partial<Aluno> }
  | { tipo: "atencao"; patch: Partial<Aluno> }
  | { tipo: "ja-associado" };

export function associarGrupoAoAluno(aluno: Aluno, grupoSlug: string): ResultadoAssociacao {
  if (aluno.grupoEspecial === grupoSlug || (aluno.condicoesAtencao ?? []).includes(grupoSlug)) {
    return { tipo: "ja-associado" };
  }

  const g = getSpecialGroup(grupoSlug);

  if (!aluno.grupoEspecial) {
    return {
      tipo: "principal",
      patch: {
        grupoEspecial: grupoSlug,
        faseJornada: 1,
        modalidadesPreferenciais: g?.modalidadesIndicadas,
        parametrosPrioritarios: g?.parametros.slice(0, 4),
        criterioProgressao: g?.fases[0]?.criteriosAvancar[0],
        // Declarar um grupo é declarar uma condição: o "nada a declarar" deixa de valer,
        // senão o perfil ficaria afirmando duas coisas contrárias ao mesmo tempo.
        semCondicaoDeclarada: undefined,
        sugestoesDispensadas: undefined,
      },
    };
  }

  return {
    tipo: "atencao",
    patch: { condicoesAtencao: [...(aluno.condicoesAtencao ?? []), grupoSlug] },
  };
}

/** A frase que confirma o que aconteceu, na língua de quem prescreve. */
export function textoDaAssociacao(r: ResultadoAssociacao, nomeGrupo: string, primeiroNome: string): string {
  if (r.tipo === "ja-associado") return `${nomeGrupo} já está associado a ${primeiroNome}.`;
  if (r.tipo === "principal") return `${nomeGrupo} agora guia a jornada de ${primeiroNome}. Revise a prescrição.`;
  return `${nomeGrupo} somado às condições de atenção de ${primeiroNome}. O motor combina os cuidados.`;
}
