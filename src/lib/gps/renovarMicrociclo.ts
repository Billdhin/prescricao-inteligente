/**
 * TUBO RESPONSIVO (onda MP-6, critério 12): da execução real de uma semana para uma SUGESTÃO de
 * alvo da próxima semana.
 *
 * Dada a execução da semana-base (Execucao[] + SessaoFeedback), roda a dupla progressão por
 * exercício (ajustarCarga) e propõe, para cada um, o que muda no ALVO da semana seguinte, sempre
 * DENTRO da faixa citada:
 * - subir  -> aproxima da falha (RIR -1) ou soma uma repetição (reps +1), o que couber na faixa;
 * - descarregar -> alivia (RIR +1) ou tira uma série;
 * - manter/encaminhar -> não mexe no plano.
 *
 * SEGURANÇA E DECISÃO: a sugestão RESPEITA o gate de segurança (nada sobe com vermelho/dor) e as
 * VARIÁVEIS TRAVADAS do mesociclo-alvo (uma variável travada não progride). E ela NUNCA se aplica
 * sozinha: `renovarMicrociclo` só CALCULA; a gravação no plano acontece por `aplicarRenovacao` sob
 * o clique de "Aplicar" do profissional. Determinístico e puro.
 *
 * Escopo honesto: hoje o app captura carga/reps/RPE (Execucao) e PSE/duração/recado
 * (SessaoFeedback); a progressão responsiva de FORÇA usa isso. O aeróbio responsivo e sinais que o
 * app ainda não coleta (velocidade, FC, cadência, sono) ficam como extensão de captura futura.
 */

import {
  getFaixa,
  type BlocoSessao,
  type Macrociclo,
  type Microciclo,
  type Mesociclo,
  type PlanoTreino,
  type VariavelTravavel,
} from "@/data/periodizacao";
import type { Execucao, SessaoFeedback } from "@/data/execucao";
import { intervaloDe } from "@/lib/gps/faixasParse";
import { lerFaixaRIR } from "@/lib/gps/alvo";
import {
  ajustarCarga,
  faixaDeReps,
  incrementoDoExercicio,
  type AjusteCarga,
  type CtxSeguranca,
  type ModProgressaoAjuste,
} from "@/lib/gps/autorregulacao";

// PSE da SESSÃO (escala 0 a 10 do SessaoFeedback) a partir do qual a semana é tratada como
// exaustiva: não se sugere subir em cima de uma sessão sentida como quase máxima. Limiar de
// cautela declarado (decisão do profissional), não um número de dose.
const PSE_SESSAO_EXAUSTIVA = 9;

/** Campos de alvo de força que a renovação pode mexer na próxima semana. */
type MudancaAlvo = Partial<Pick<BlocoSessao, "seriesAlvo" | "repsAlvo" | "rirAlvo" | "cargaRelativaAlvo">>;

export interface SugestaoRenovacao {
  slug: string;
  nomeExercicio: string;
  /** id do bloco correspondente na próxima semana (quando existe) */
  blocoRef?: string;
  ajuste: AjusteCarga;
  /** o que a aplicação mudaria no alvo da próxima semana; ausente = nada muda no plano */
  mudancaAlvo?: MudancaAlvo;
  /** variáveis que a trava do mesociclo-alvo impediu de progredir */
  travadas?: VariavelTravavel[];
}

export interface RenovacaoSugerida {
  planoId: string;
  /** semana executada que originou a sugestão */
  semanaBase: number;
  /** próxima semana no plano; ausente quando a base é a última semana */
  semanaAlvo?: number;
  sugestoes: SugestaoRenovacao[];
  /** true quando ao menos uma sugestão muda o alvo da próxima semana (habilita "Aplicar") */
  temAplicavel: boolean;
}

export interface OpcoesRenovacao {
  /** modificador de progressão do perfil clínico do aluno (teto de esforço, passo reduzido) */
  modPerfil?: ModProgressaoAjuste;
}

const blocosDoMicro = (m: Microciclo) => m.sessoes.flatMap((s) => s.blocos);

function microDaSemana(plano: PlanoTreino, semana: number): Microciclo | undefined {
  return plano.macrociclo.mesociclos.flatMap((m) => m.microciclos).find((mc) => mc.semana === semana);
}

function mesoDaSemana(plano: PlanoTreino, semana: number): Mesociclo | undefined {
  return plano.macrociclo.mesociclos.find((m) => semana >= m.semanaInicio && semana <= m.semanaFim);
}

/**
 * O que a aplicação mudaria no alvo da próxima semana, dado o veredito da dupla progressão, o
 * bloco-alvo, a faixa de reps e as travas. Usa passos DISCRETOS e naturais (RIR -1, reps +1, RIR
 * +1, série -1), sempre clampeados na faixa citada: nenhum número novo, e nada sai da faixa.
 */
function mudancaAlvoDe(
  acao: AjusteCarga["acao"],
  bloco: BlocoSessao | undefined,
  nota: string | undefined,
  travas: VariavelTravavel[],
  existeAlvo: boolean,
): { mudanca?: MudancaAlvo; travadas?: VariavelTravavel[] } {
  if (!existeAlvo || !bloco || (acao !== "subir" && acao !== "descarregar")) return {};
  const volTravado = travas.includes("volume");
  const intTravado = travas.includes("intensidade");
  const rirFaixa = lerFaixaRIR(bloco.intensidade ?? "", nota);
  const repsFaixa = intervaloDe(bloco.reps ?? "");

  if (acao === "subir") {
    // Intensidade primeiro: menos RIR (mais perto da falha), dentro da faixa.
    const podeInt = bloco.rirAlvo != null && rirFaixa != null && bloco.rirAlvo > rirFaixa.min;
    if (podeInt && !intTravado) return { mudanca: { rirAlvo: (bloco.rirAlvo as number) - 1 } };
    // Volume depois: mais uma repetição, dentro da faixa.
    const tetoReps = repsFaixa ? (repsFaixa.max === Infinity ? (bloco.repsAlvo ?? 0) + 1 : repsFaixa.max) : undefined;
    const podeVol = bloco.repsAlvo != null && tetoReps != null && bloco.repsAlvo < tetoReps;
    if (podeVol && !volTravado) return { mudanca: { repsAlvo: (bloco.repsAlvo as number) + 1 } };
    // Nada mudou: registra quais alavancas viáveis a trava barrou.
    const travadas: VariavelTravavel[] = [];
    if (podeInt && intTravado) travadas.push("intensidade");
    if (podeVol && volTravado) travadas.push("volume");
    return { travadas: travadas.length ? travadas : undefined };
  }

  // descarregar: mais RIR (mais folga), dentro da faixa; senão tira uma série.
  const podeAliviarInt = bloco.rirAlvo != null && rirFaixa != null && bloco.rirAlvo < rirFaixa.max;
  if (podeAliviarInt && !intTravado) return { mudanca: { rirAlvo: (bloco.rirAlvo as number) + 1 } };
  const pisoSeries = intervaloDe(bloco.series ?? "")?.min ?? 1;
  const podeAliviarVol = bloco.seriesAlvo != null && bloco.seriesAlvo > pisoSeries;
  if (podeAliviarVol && !volTravado) return { mudanca: { seriesAlvo: (bloco.seriesAlvo as number) - 1 } };
  const travadas: VariavelTravavel[] = [];
  if (podeAliviarInt && intTravado) travadas.push("intensidade");
  if (podeAliviarVol && volTravado) travadas.push("volume");
  return { travadas: travadas.length ? travadas : undefined };
}

/**
 * Calcula a sugestão de renovação da próxima semana a partir da execução da semana-base. NÃO grava
 * nada: a aplicação é por `aplicarRenovacao`, sob o clique do profissional.
 */
export function renovarMicrociclo(
  plano: PlanoTreino,
  semanaBase: number,
  execucoes: Execucao[],
  feedbacks: SessaoFeedback[],
  seguranca?: CtxSeguranca,
  opts: OpcoesRenovacao = {},
): RenovacaoSugerida {
  const semanaAlvoNum = semanaBase + 1;
  const microAlvo = microDaSemana(plano, semanaAlvoNum);
  const travas = mesoDaSemana(plano, semanaAlvoNum)?.variaveisTravadas ?? [];
  const nota = getFaixa(plano.objetivo).intensidade.nota;

  // A semana-base foi sentida como exaustiva? (PSE de sessão alto) -> nenhuma subida em cima dela.
  const exaustiva = feedbacks.some((f) => f.semana === semanaBase && (f.pse ?? 0) >= PSE_SESSAO_EXAUSTIVA);

  const daBase = execucoes.filter((e) => e.semana === semanaBase && e.exercicioSlug);
  const slugs = [...new Set(daBase.map((e) => e.exercicioSlug as string))];

  // Bloco de força correspondente ao slug: procura na próxima semana (alvo) e, se não houver, na base.
  const blocoDoSlug = (slug: string): BlocoSessao | undefined => {
    for (const semana of [semanaAlvoNum, semanaBase]) {
      const mc = microDaSemana(plano, semana);
      const b = mc && blocosDoMicro(mc).find((x) => x.exercicioSlug === slug && x.tipo !== "aerobio");
      if (b) return b;
    }
    return undefined;
  };

  const sugestoes: SugestaoRenovacao[] = slugs.map((slug) => {
    const execs = daBase.filter((e) => e.exercicioSlug === slug);
    const bloco = blocoDoSlug(slug);
    const faixa = faixaDeReps(bloco?.reps) ?? { min: 8, max: 12 };
    let ajuste = ajustarCarga(execs, faixa, {
      seguranca,
      incrementoPct: incrementoDoExercicio(slug).pct,
      modPerfil: opts.modPerfil,
    });
    // Sessão exaustiva rebaixa "subir" para "manter" (fadiga da sessão), sem tocar nos casos de
    // segurança/descarga (mais conservadores) que o gate já decidiu.
    if (exaustiva && ajuste.acao === "subir") {
      ajuste = {
        cargaBase: ajuste.cargaBase,
        proximaCarga: ajuste.cargaBase,
        delta: 0,
        acao: "manter",
        motivo: "A sessão foi sentida como muito intensa (PSE alto): consolidar antes de subir.",
      };
    }
    const { mudanca, travadas } = mudancaAlvoDe(ajuste.acao, bloco, nota, travas, microAlvo != null);
    return { slug, nomeExercicio: bloco?.nome ?? slug, blocoRef: bloco?.id, ajuste, mudancaAlvo: mudanca, travadas };
  });

  const temAplicavel = microAlvo != null && sugestoes.some((s) => s.mudancaAlvo && Object.keys(s.mudancaAlvo).length > 0);
  return { planoId: plano.id, semanaBase, semanaAlvo: microAlvo ? semanaAlvoNum : undefined, sugestoes, temAplicavel };
}

/**
 * Aplica a renovação aprovada ao plano: grava as mudanças de alvo nos blocos correspondentes da
 * próxima semana (por slug), em todas as sessões dela. Puro e imutável; devolve o patch de
 * macrociclo pronto para `updatePlano`. Sem sugestão aplicável, devolve o macrociclo intacto.
 */
export function aplicarRenovacao(plano: PlanoTreino, renovacao: RenovacaoSugerida): { macrociclo: Macrociclo } {
  if (renovacao.semanaAlvo == null) return { macrociclo: plano.macrociclo };
  const porSlug = new Map<string, MudancaAlvo>();
  for (const s of renovacao.sugestoes) {
    if (s.mudancaAlvo && Object.keys(s.mudancaAlvo).length > 0) porSlug.set(s.slug, s.mudancaAlvo);
  }
  if (porSlug.size === 0) return { macrociclo: plano.macrociclo };

  const mesociclos = plano.macrociclo.mesociclos.map((m) => ({
    ...m,
    microciclos: m.microciclos.map((mc) => {
      if (mc.semana !== renovacao.semanaAlvo) return mc;
      return {
        ...mc,
        sessoes: mc.sessoes.map((s) => ({
          ...s,
          blocos: s.blocos.map((b) => {
            if (b.tipo === "aerobio" || !b.exercicioSlug) return b;
            const mud = porSlug.get(b.exercicioSlug);
            return mud ? { ...b, ...mud } : b;
          }),
        })),
      };
    }),
  }));

  return { macrociclo: { ...plano.macrociclo, mesociclos } };
}
