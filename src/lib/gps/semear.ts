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
import { getFaixa, type BlocoSessao, type Microciclo, type PlanoTreino, type Sessao } from "@/data/periodizacao";
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

/** Os campos de ALVO de um bloco de força (o número concreto da semana, dentro da faixa). */
const CAMPOS_ALVO = ["seriesAlvo", "repsAlvo", "rirAlvo", "cargaRelativaAlvo", "intervaloAlvoSeg", "origemRegraId"] as const;

/**
 * O ALVO QUE ESTA SEMANA JÁ TEM, herdado do bloco vizinho.
 *
 * A prescrição troca QUAIS exercícios a sessão tem, não em que ponto da periodização ela
 * está. Então o alvo concreto do bloco novo é o mesmo que o motor já calculou para aquela
 * semana, e a fonte mais fiel dele é o bloco de força que já estava ali.
 *
 * Reconstruir o contexto do alvo aqui seria a alternativa óbvia e é a errada: exigiria
 * repetir, fora do gerador, a rampa no macrociclo, o piso da onda do modelo de blocos e o
 * passo do perfil clínico. Na primeira tentativa foi exatamente o que aconteceu, e a sessão
 * aplicada saiu com 3x8 onde o plano dizia 3x7. Herdar não tem como divergir.
 *
 * A sessão vem primeiro que a semana de propósito: na ondulatória, a sessão "(pesado)" e a
 * "(moderado)" da mesma semana têm alvos diferentes, e o certo é herdar o da sessão-alvo.
 */
function alvoHerdado(micro: Microciclo, sessaoIndex: number): Partial<BlocoSessao> {
  const daSessao = micro.sessoes[sessaoIndex]?.blocos.find((b) => b.tipo === "forca" && b.repsAlvo != null);
  const daSemana = micro.sessoes.flatMap((s) => s.blocos).find((b) => b.tipo === "forca" && b.repsAlvo != null);
  const ref = daSessao ?? daSemana;
  if (!ref) return {};
  const alvo: Record<string, unknown> = {};
  for (const campo of CAMPOS_ALVO) if (ref[campo] != null) alvo[campo] = ref[campo];
  return alvo as Partial<BlocoSessao>;
}

/**
 * Mapeia os itens de uma prescrição para blocos de força, com o exercício real, o nome
 * colado ao slug (sem drift) e a dose REDERIVADA da faixa do plano.
 *
 * ## O ALVO DA SEMANA VEM JUNTO
 *
 * Até uma bateria de testes de fluxo apontar, esta função devolvia só o TEXTO da faixa
 * ("3 a 4 x 6 a 8") e nenhum alvo concreto. O efeito era invisível na geração e visível na
 * sessão: aplicar uma prescrição na semana 5 trocava quatro blocos que diziam "3x7, RIR 2"
 * por dois que diziam apenas "3 a 4 x 6 a 8". A sessão editada pelo profissional voltava a
 * ser faixa, enquanto as vizinhas seguiam com número, dentro do mesmo plano e da mesma
 * semana. Era a onda inteira do alvo semanal sendo desfeita por um clique de "Aplicar no
 * treino".
 *
 * Por isso `alvo` existe: quem chama passa o alvo que aquela semana do plano já tem (ver
 * `alvoHerdado`). Sem ele o bloco sai só com a faixa, que é o certo para uma
 * pré-visualização fora do plano.
 */
export function blocosDePrescricao(
  prescricao: Prescricao,
  ctx: CtxDose,
  _semana: number,
  // Ênfase da sessão-alvo (ondulatória): faz a dose seguir "(pesado)/(moderado)" em
  // vez da base, para o nome da sessão não prometer o que a dose não entrega.
  enfase?: Parameters<typeof doseForca>[2],
  /** alvo concreto da semana, herdado do plano; ausente = bloco só com a faixa */
  alvo?: Partial<BlocoSessao>,
): BlocoSessao[] {
  const dose = doseForca(getFaixa(ctx.objetivo), ctx.nivel, enfase);
  return prescricao.itens.map((it) => {
    const ex = exercises.find((e) => e.slug === it.slug);
    return {
      id: nid(),
      tipo: "forca" as const,
      exercicioSlug: ex?.slug ?? it.slug,
      nome: ex?.nome ?? it.slug,
      origemPrescricaoId: prescricao.id,
      ...dose,
      ...alvo,
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
 * Grava UMA sessão editada à mão de volta no plano, na semana e no índice dados.
 *
 * É o caminho do "Personalizar treino": o profissional mexe nos exercícios e nas
 * variáveis da sessão de hoje e o resultado vale para HOJE, não para o bloco inteiro
 * (a periodização das outras semanas continua sendo do motor). Imutável, e não toca
 * em nenhuma outra semana ou sessão. Semana inexistente ou índice fora da semana
 * devolvem o plano intacto, em vez de inventar sessão.
 */
export function substituirSessaoNaSemana(
  plano: PlanoTreino,
  semana: number,
  sessaoIndex: number,
  sessao: Sessao,
): PlanoTreino {
  const mesociclos = plano.macrociclo.mesociclos.map((m) => ({
    ...m,
    microciclos: m.microciclos.map((w) => {
      if (w.semana !== semana || sessaoIndex >= w.sessoes.length) return w;
      return { ...w, sessoes: w.sessoes.map((s, i) => (i === sessaoIndex ? sessao : s)) };
    }),
  }));
  return { ...plano, macrociclo: { ...plano.macrociclo, mesociclos } };
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
  // Mesmo gate do gerador: iniciante não recebe ênfase, nem por plano antigo.
  // O gerador já parou de pôr o sufixo "(pesado)" no nome da sessão de iniciante, então em
  // plano NOVO isto nunca dispara. Existe pelos planos SALVOS antes daquela correção, que
  // ainda carregam o sufixo: sem esta linha, aplicar uma prescrição neles ressuscitaria a
  // dose de 3 a 5 repetições que o ACSM 2009 não recomenda para quem está começando.
  const enfases = plano.nivel === "Iniciante" ? undefined : getFaixa(plano.objetivo).enfases;

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
        // A sessão declara a ênfase no próprio nome ("Sessão 1 (pesado)"); casa a
        // dose com esse rótulo. Sem sufixo (modelo linear), fica a dose base.
        const rotulo = s.nome.match(/\(([^)]+)\)\s*$/)?.[1];
        const enfase = rotulo ? enfases?.find((e) => e.rotulo === rotulo) : undefined;
        // A posição desta semana DENTRO do mesociclo é o que transforma a faixa em alvo. Sem
        // ela, a sessão aplicada perdia o número e voltava a ser faixa (ver blocosDePrescricao).
        const semeados = blocosDePrescricao(prescricao, ctxDose, w.semana, enfase, alvoHerdado(w, sessaoIndex));
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
