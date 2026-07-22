import type { Aluno } from "@/data/alunos";
import { proximaReavaliacao, type PlanoTreino } from "@/data/periodizacao";

/**
 * Fonte única de "onde este aluno está e qual o próximo movimento".
 *
 * O ciclo de cuidado (avaliar, planejar, liberar, acompanhar, reavaliar) já existe
 * no produto, mas estava fatiado em banners e abas soltas. Este seletor puro
 * calcula o próximo passo e o estado de cada etapa, e é reusado em três lugares:
 * o chip do card na lista, a faixa no topo da tela do aluno e o painel. Assim a
 * pergunta "qual o próximo passo deste aluno?" tem sempre a mesma resposta.
 *
 * Generaliza a lógica de atenção que vivia só no painel do profissional.
 */

const DIA = 86_400_000;

function mesmoDia(a: number, b: number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}

export type EtapaCiclo = "avaliar" | "planejar" | "liberar" | "acompanhar" | "reavaliar";
export type PassoTone = "primary" | "warning" | "cta" | "success";
export type ChipTone = "primary" | "warning" | "cta" | "success";

export interface ProximoPasso {
  etapa: EtapaCiclo;
  frase: string;
  cta: { label: string; kind: EtapaCiclo };
  tone: PassoTone;
  /** rótulo curto para o chip da lista; null quando o aluno está em dia */
  chip: { label: string; tone: ChipTone } | null;
}

export interface CicloCtx {
  avaliacoes: { alunoId?: string; data: number }[];
  prescricoes: { alunoId?: string; status: string }[];
  planos: PlanoTreino[];
  liberacoes: { alunoId?: string; data: number }[];
  execucoes: { alunoId?: string }[];
}

/** Data única de reavaliação: com plano ativo, o macrociclo manda; senão o calendário. */
export function dataReavaliacao(aluno: Aluno, planoAtivo?: PlanoTreino): { em: number; semana?: number } | null {
  if (planoAtivo) {
    const r = proximaReavaliacao(planoAtivo);
    if (r) return { em: r.em, semana: r.semana };
  }
  if (aluno.proximaReavaliacaoEm != null) return { em: aluno.proximaReavaliacaoEm };
  return null;
}

export function proximoPasso(aluno: Aluno, ctx: CicloCtx): ProximoPasso {
  const avals = ctx.avaliacoes.filter((a) => a.alunoId === aluno.id);
  const planoAtivo = ctx.planos.find((p) => p.alunoId === aluno.id && p.status === "ativo");
  const libs = ctx.liberacoes.filter((l) => l.alunoId === aluno.id);
  const agora = Date.now();

  // 1) Sem avaliação: o ciclo ainda nem começou.
  if (avals.length === 0) {
    return {
      etapa: "avaliar",
      tone: "primary",
      frase: "Comece pela avaliação inicial. Ela abre o resto do ciclo.",
      cta: { label: "Registrar avaliação", kind: "avaliar" },
      chip: { label: "Sem avaliação", tone: "cta" },
    };
  }

  // 2) Sem plano ativo: o core (periodização) ainda não foi montado. Precede a
  //    reavaliação, porque não se reavalia um plano que nunca foi montado.
  if (!planoAtivo) {
    return {
      etapa: "planejar",
      tone: "primary",
      frase: "Avaliação pronta. O próximo passo é montar o plano.",
      cta: { label: "Montar plano", kind: "planejar" },
      chip: { label: "Sem plano ativo", tone: "cta" },
    };
  }

  // 3) Reavaliação vencida (já há plano): hora de decidir progredir, manter ou ajustar.
  const reav = dataReavaliacao(aluno, planoAtivo);
  if (reav && reav.em < agora) {
    const dias = Math.floor((agora - reav.em) / DIA);
    return {
      etapa: "reavaliar",
      tone: "warning",
      frase: reav.semana
        ? `Chegou o ponto de reavaliação da semana ${reav.semana}. Registre para reabrir o ciclo.`
        : `Reavaliação vencida há ${dias} ${dias === 1 ? "dia" : "dias"}. Registre para reabrir o ciclo.`,
      cta: { label: "Registrar reavaliação", kind: "reavaliar" },
      chip: { label: "Reavaliação vencida", tone: "warning" },
    };
  }

  // 4) Plano ativo, mas a sessão de hoje ainda não foi liberada.
  const liberadoHoje = libs.some((l) => mesmoDia(l.data, agora));
  if (!liberadoHoje) {
    return {
      etapa: "liberar",
      tone: "primary",
      frase: "Antes da sessão de hoje, faça o semáforo de liberação.",
      cta: { label: "Fazer o semáforo", kind: "liberar" },
      chip: null,
    };
  }

  // 5) Tudo em dia: acompanhar a execução.
  return {
    etapa: "acompanhar",
    tone: "success",
    frase: "Tudo em dia. Acompanhe a execução do aluno.",
    cta: { label: "Ver execução", kind: "acompanhar" },
    chip: null,
  };
}

export type EstadoEtapa = "feito" | "atual" | "pendente";

export const ETAPAS: EtapaCiclo[] = ["avaliar", "planejar", "liberar", "acompanhar", "reavaliar"];

/**
 * Estado de cada nó do stepper, MONOTÔNICO pela posição no ciclo: tudo que vem
 * antes do passo atual está "feito", o passo atual é "atual" e o que vem depois
 * é "pendente". Deriva do próprio próximoPasso (fonte única), então o stepper
 * nunca mostra um passo posterior concluído antes do atual, nem um nó futuro
 * marcado como feito antes de acontecer.
 */
export function estadoDoCiclo(aluno: Aluno, ctx: CicloCtx): Record<EtapaCiclo, EstadoEtapa> {
  const passo = proximoPasso(aluno, ctx);
  const atual = ETAPAS.indexOf(passo.etapa);
  const out = {} as Record<EtapaCiclo, EstadoEtapa>;
  ETAPAS.forEach((e, i) => {
    out[e] = i < atual ? "feito" : i === atual ? "atual" : "pendente";
  });
  return out;
}

export const ROTULO_ETAPA: Record<EtapaCiclo, string> = {
  avaliar: "Avaliar",
  planejar: "Planejar",
  liberar: "Liberar",
  acompanhar: "Acompanhar",
  reavaliar: "Reavaliar",
};

export const AJUDA_ETAPA: Record<EtapaCiclo, string> = {
  avaliar: "Mediu o ponto de partida do aluno.",
  planejar: "Montou o plano e a prescrição, com o porquê.",
  liberar: "Conferiu se o aluno pode treinar hoje.",
  acompanhar: "Acompanhou carga, repetições e esforço.",
  reavaliar: "Comparou com o começo e ajustou o rumo.",
};
