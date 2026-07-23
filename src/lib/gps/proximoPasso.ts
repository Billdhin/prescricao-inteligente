import type { Aluno, Liberacao } from "@/data/alunos";
import { proximaReavaliacao, type PlanoTreino } from "@/data/periodizacao";
import { estadoSemaforo } from "./semaforoDiario";

export type AvisoTone = "primary" | "warning" | "cta" | "success" | "analysis" | "danger";

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
const fmtDDMM = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(ts));

/**
 * Gate duro do trilho: sem NENHUMA avaliação registrada, o aluno não tem base para
 * montar treino nem prescrever exercício vinculado. O treino nasce da avaliação
 * (decisão do fundador), então os CTAs de treino ficam desabilitados até existir ao
 * menos uma avaliação. Uso avulso (sem aluno) não passa por aqui, por definição.
 */
export function podeMontarTreino(
  aluno: Aluno,
  ctx: { avaliacoes: { alunoId?: string }[] },
): { ok: boolean; motivo?: string } {
  const temAvaliacao = ctx.avaliacoes.some((a) => a.alunoId === aluno.id);
  if (!temAvaliacao) {
    return { ok: false, motivo: "Registre a avaliação primeiro. O treino nasce dela." };
  }
  return { ok: true };
}

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
  /** liberações completas (com `resultado`): o semáforo diário deriva daqui */
  liberacoes: Liberacao[];
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
      chip: { label: "Sem avaliação", tone: "warning" },
    };
  }

  // 2) Sem plano ativo: o core (periodização) ainda não foi montado. Precede a
  //    reavaliação, porque não se reavalia um plano que nunca foi montado.
  if (!planoAtivo) {
    return {
      etapa: "planejar",
      tone: "primary",
      frase: "Avaliação pronta. O próximo passo é montar o treino.",
      cta: { label: "Montar treino", kind: "planejar" },
      chip: { label: "Sem treino", tone: "warning" },
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
      cta: { label: "Reavaliar", kind: "reavaliar" },
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

export interface AvisoAluno {
  label: string;
  tone: AvisoTone;
  /** a etapa do ciclo a que o aviso pertence, quando é o passo bloqueante */
  etapa?: EtapaCiclo;
}

/**
 * Motivos pelos quais um aluno precisa de atenção HOJE, derivados da MESMA fonte
 * do stepper (`proximoPasso`), para o Painel e a tela do aluno nunca discordarem.
 *
 * Estende o próximo passo com o que o stepper sozinho não mostra: a antecedência
 * de 7 dias da reavaliação do plano (o stepper só acusa quando já vencida). O
 * passo bloqueante do ciclo (sem avaliação, sem treino, reavaliação vencida) vem
 * do `chip` do próprio `proximoPasso`; quando o aluno está em dia (liberar /
 * acompanhar), não há aviso. Vazio = nada pendente.
 */
export function avisosDoAluno(aluno: Aluno, ctx: CicloCtx): AvisoAluno[] {
  const avisos: AvisoAluno[] = [];
  const passo = proximoPasso(aluno, ctx);
  const planoAtivo = ctx.planos.find((p) => p.alunoId === aluno.id && p.status === "ativo");

  // Semáforo diário: um "não liberado" segue pendente até um novo semáforo (de
  // qualquer cor) depois dele. A AUSÊNCIA de semáforo não alerta (a etapa `liberar`
  // do próprio ciclo mantém `chip: null`); só o vermelho pendente vira alerta, e é
  // o mais forte da lista, entrando no topo (unshift, mais adiante).
  const semaforo = estadoSemaforo(aluno.id, ctx.liberacoes);

  // Prescrição guardada, mas sem treino montado: o campo `prescricoes` do ctx (antes
  // declarado e nunca usado) serve só a este aviso. Não vira segunda moeda de "tem treino"
  // (decisão travada 11): `temTreinoAtivo` segue o único predicado; isto é só o lembrete de
  // fechar o ciclo levando os exercícios para dentro do plano.
  const temPrescricao = ctx.prescricoes.some((p) => p.alunoId === aluno.id && p.status === "ativa");
  const prescricaoSemTreino = !planoAtivo && temPrescricao;

  // O aviso específico ("prescrição guardada sem treino") SUBSTITUI o chip genérico
  // "Sem treino" da etapa planejar: os dois apontam para a mesma ação (montar o
  // treino) e mostrá-los juntos era ruído, não informação.
  if (passo.chip && !(prescricaoSemTreino && passo.etapa === "planejar")) {
    avisos.push({ label: passo.chip.label, tone: passo.chip.tone, etapa: passo.etapa });
  }
  if (prescricaoSemTreino) {
    avisos.push({ label: "Prescrição guardada sem treino montado", tone: "analysis", etapa: "planejar" });
  }

  // Antecedência: reavaliação do plano chegando em até 7 dias (ainda não vencida,
  // então o passo bloqueante não é "reavaliar"). Só faz sentido com plano ativo.
  if (planoAtivo) {
    const reav = proximaReavaliacao(planoAtivo);
    const agora = Date.now();
    if (reav && reav.em > agora && reav.em - agora <= 7 * DIA) {
      avisos.push({ label: `Reavaliação do plano: semana ${reav.semana}`, tone: "analysis", etapa: "reavaliar" });
    }
  }

  // Vermelho pendente é a pendência mais grave: entra na frente de tudo, com o dia
  // do "não liberado" e o CTA (via `etapa: "liberar"`) apontando para o semáforo.
  if (semaforo.vermelhoPendente) {
    avisos.unshift({
      label: `Não liberado em ${fmtDDMM(semaforo.vermelhoPendente.data)} e sem novo semáforo desde então`,
      tone: "danger",
      etapa: "liberar",
    });
  }
  return avisos;
}
