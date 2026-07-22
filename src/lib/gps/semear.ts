/**
 * Tubo Prescricao > sessões do plano ("Aplicar no treino"), puro e testável.
 *
 * Uma Prescricao (escolha de exercícios do Prescrever exercício) vira blocos de força de
 * uma sessão do plano de periodização. Duas regras travadas mandam aqui:
 *
 * - As doses são SEMPRE rederivadas da faixa do plano (`doseForca`), nunca copiadas de
 *   `PrescricaoItem.series`: aquela string combinada ("3 x 12 · 75% · 90s") envenena
 *   `conferirFaixa`/`faixaDeReps`. O raciocínio da escolha fica no prontuário, não no bloco.
 * - O vínculo Prescricao > plano é DERIVADO (`prescricaoAplicadaEm` no store), nunca gravado
 *   na Prescricao. Aqui só marcamos `origemPrescricaoId` no bloco (rastro de exibição).
 */

import { doseForca } from "@/lib/gps/periodizacao";
import type { GpsObjetivo } from "@/lib/gps/engine";
import type { Nivel } from "@/data/types";
import { getFaixa, type BlocoSessao, type PlanoTreino } from "@/data/periodizacao";
import type { Prescricao } from "@/data/alunos";
import { exercises } from "@/data/exercises";

// Módulo puro: id local (mesma forma do `uid` do store) para não arrastar os efeitos de
// carga do store/cloudSync (Supabase) para dentro de um utilitário de dados.
const nid = () => `blk-${Math.random().toString(36).slice(2, 10)}`;

/** Objetivo/nível que definem a faixa das doses (a faixa do PLANO, não a da prescrição). */
export interface CtxDose {
  objetivo: GpsObjetivo;
  nivel: Nivel;
}

/** Letra da sessão pela posição na semana (0 -> "A", 1 -> "B", ...), convenção de treino. */
export function letraSessao(index: number): string {
  return String.fromCharCode(65 + Math.max(0, index));
}

/**
 * Mapeia os itens de uma prescrição para blocos de força, com o exercício real, o nome
 * colado ao slug (sem drift) e a dose REDERIVADA da faixa do plano. Ids novos por chamada,
 * então cada semana recebe blocos únicos. `semana` faz parte da assinatura para futura
 * variação por semana; a dose base já passa `conferirFaixa` por construção.
 */
export function blocosDePrescricao(prescricao: Prescricao, ctx: CtxDose, _semana: number): BlocoSessao[] {
  const dose = doseForca(getFaixa(ctx.objetivo), ctx.nivel);
  return prescricao.itens.map((it) => {
    const ex = exercises.find((e) => e.slug === it.slug);
    return {
      id: nid(),
      tipo: "forca" as const,
      exercicioSlug: ex?.slug ?? it.slug,
      nome: ex?.nome ?? it.slug,
      origemPrescricaoId: prescricao.id,
      ...dose,
    };
  });
}

export interface OpcoesAplicacao {
  /** semana em que o plano está hoje (semanaAtual do plano) */
  semanaCorrente: number;
  /** índice da sessão-alvo dentro da semana (0-based) */
  sessaoIndex: number;
  /** "bloco" = até o fim do mesociclo corrente; "semana" = só a semana corrente */
  escopo: "bloco" | "semana";
  /** "substituir" = remove todos os blocos de força da sessão; "adicionar" = mantém e soma */
  modo: "substituir" | "adicionar";
}

export interface ResumoAplicacao {
  /** exercícios inseridos por sessão */
  n: number;
  /** letra da sessão-alvo (A, B, ...) */
  sessao: string;
  /** índice 1-based do mesociclo corrente */
  bloco: number;
  /** quantas semanas foram afetadas */
  semanas: number;
}

/** Os blocos de força que uma substituição REMOVERIA da sessão-alvo na semana corrente. */
export function blocosForcaAtuais(plano: PlanoTreino, semanaCorrente: number, sessaoIndex: number): BlocoSessao[] {
  const micro = plano.macrociclo.mesociclos
    .flatMap((m) => m.microciclos)
    .find((w) => w.semana === semanaCorrente);
  const sessao = micro?.sessoes[sessaoIndex];
  return (sessao?.blocos ?? []).filter((b) => b.tipo === "forca");
}

/** Quantas sessões tem a semana corrente (para montar o seletor de sessão). */
export function sessoesDaSemana(plano: PlanoTreino, semanaCorrente: number) {
  const micro = plano.macrociclo.mesociclos
    .flatMap((m) => m.microciclos)
    .find((w) => w.semana === semanaCorrente);
  return micro?.sessoes ?? [];
}

/**
 * Aplica a prescrição às sessões do plano, na semântica travada (decisões 7 e 8):
 * da semana corrente até o fim do mesociclo (ou só a semana corrente), na sessão de MESMO
 * índice; semanas com menos sessões são puladas; ids novos. Devolve um plano novo (imutável)
 * e o resumo para o banner de retorno.
 */
export function aplicarPrescricaoNoPlano(
  plano: PlanoTreino,
  prescricao: Prescricao,
  opcoes: OpcoesAplicacao,
): { plano: PlanoTreino; resumo: ResumoAplicacao } {
  const { semanaCorrente, sessaoIndex, escopo, modo } = opcoes;
  const ctxDose: CtxDose = { objetivo: plano.objetivo, nivel: plano.nivel };

  const mesoIdx = plano.macrociclo.mesociclos.findIndex(
    (m) => semanaCorrente >= m.semanaInicio && semanaCorrente <= m.semanaFim,
  );
  const meso = plano.macrociclo.mesociclos[mesoIdx] ?? plano.macrociclo.mesociclos[0];
  const semanaFim = escopo === "semana" ? semanaCorrente : meso?.semanaFim ?? semanaCorrente;

  let semanasAfetadas = 0;
  const mesociclos = plano.macrociclo.mesociclos.map((m) => {
    if (!meso || m.id !== meso.id) return m;
    const microciclos = m.microciclos.map((w) => {
      if (w.semana < semanaCorrente || w.semana > semanaFim) return w;
      // Semana com menos sessões que o índice-alvo: pulada, sem inventar sessão.
      if (sessaoIndex >= w.sessoes.length) return w;
      const sessoes = w.sessoes.map((s, si) => {
        if (si !== sessaoIndex) return s;
        const semeados = blocosDePrescricao(prescricao, ctxDose, w.semana);
        // Substituir remove TODOS os blocos de força (inclui semeados de fases anteriores).
        const mantidos = modo === "substituir" ? s.blocos.filter((b) => b.tipo !== "forca") : s.blocos;
        return { ...s, blocos: [...mantidos, ...semeados] };
      });
      semanasAfetadas++;
      return { ...w, sessoes };
    });
    return { ...m, microciclos };
  });

  return {
    plano: { ...plano, macrociclo: { ...plano.macrociclo, mesociclos } },
    resumo: {
      n: prescricao.itens.length,
      sessao: letraSessao(sessaoIndex),
      bloco: mesoIdx >= 0 ? mesoIdx + 1 : 1,
      semanas: semanasAfetadas,
    },
  };
}
