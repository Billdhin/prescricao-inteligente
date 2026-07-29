/**
 * Motor de geração da periodização ("Prescrever treino").
 *
 * Determinístico: escolhe o(s) modelo(s) por objetivo, nível, duração e grupo especial, e
 * monta o macrociclo (mesociclos -> microciclos -> sessões) com as FAIXAS citadas de
 * src/data/periodizacao (nunca um número inventado). Quando o aluno tem grupo especial, as
 * fases da jornada já autorada viram o esqueleto do macrociclo, e os cuidados sobrepõem.
 *
 * A ferramenta APOIA a decisão do profissional habilitado; o plano é editável em tudo.
 */

import type { GpsObjetivo } from "@/lib/gps/engine";
import type { Nivel } from "@/data/types";
import {
  getFaixa,
  getModelo,
  valorFaixa,
  type Macrociclo,
  type Mesociclo,
  type Microciclo,
  type ModeloPeriodizacaoId,
  type Sessao,
  type BlocoSessao,
  type Tendencia,
  type FaixaObjetivo,
  type EnfaseSessao,
} from "@/data/periodizacao";
import { exercises } from "@/data/exercises";
import { getSpecialGroup } from "@/data/specialGroups";
import { groupGpsRules } from "@/lib/gps/groupRules";
import {
  restricoesAtivas,
  rotuloRestricao,
  criarRestricao,
  EFEITO_POR_TAG,
  type RestricaoSelecionada,
  type RestricaoTag,
  type AcaoRestricao,
} from "@/lib/gps/restricoes";
import type { ParamMonitorId } from "@/data/monitoringParameters";
import { alvoSemana, alvoAerobioSemana, objetivoDaSemana, type AlvoForca, type CtxAlvo } from "@/lib/gps/alvo";

export interface GerarPlanoInput {
  objetivo: GpsObjetivo;
  nivel: Nivel;
  /** duração total do acompanhamento, em semanas */
  semanas: number;
  /** sessões por semana */
  frequencia: number;
  grupoEspecial?: string;
  disponibilidade?: string;
  /**
   * Modelo escolhido pelo profissional (por exemplo, vindo de uma aula do Aprender).
   * A escolha vale, porque quem decide é ele; mas o que o motor escolheria continua
   * visível como alternativa e é dito no raciocínio, para a decisão ser informada.
   */
  modeloPreferido?: ModeloPeriodizacaoId;
  /**
   * Fase da jornada (grupo especial) em que o macrociclo começa: o aluno que já está na
   * fase 3 recebe o macro nascendo na fase 3, não do zero. Ausente = comportamento
   * byte-idêntico ao atual (o macro genérico ignora; o de grupo começa na fase 1).
   * Ranking nunca entra aqui (decisão travada 14): `rankExercises` só opera em edição.
   */
  faseInicial?: 1 | 2 | 3 | 4;
  /**
   * Dados do aluno usados SÓ para personalizar a zona de FC do aeróbio (MP-4): idade estima
   * a FCmax (208 - 0.7*idade) e a FCrep MEDIDA fecha a zona de Karvonen. Ambos opcionais: o
   * uso avulso/estudo e os guardrails não os passam, e aí o aeróbio guia por duração + PSE,
   * sem inventar zona. Não alteram a força nem o restante da geração (determinismo mantido).
   */
  idade?: number;
  fcRepouso?: number;
  /**
   * Parâmetros de monitoramento que DEIXAM de guiar a intensidade neste aluno, vindos do perfil
   * clínico mais as classes de medicação declaradas (`parametrosInvalidosDe`, em
   * src/lib/gps/farmacos.ts). Com "p-fc" aqui, a zona de frequência cardíaca não é calculada e o
   * bloco aeróbio explica por qual instrumento guiar. Ausente/vazio = plano byte-idêntico ao de
   * antes desta camada.
   */
  parametrosInvalidos?: ParamMonitorId[];
  /**
   * Restrições declaradas no perfil do aluno. Somam com as que a condição impõe
   * (groupRules.restricoesEstruturais) e FILTRAM a seleção de exercícios do plano.
   * Ausente = plano sem filtro por restrição (uso avulso e estudo).
   */
  restricoes?: RestricaoSelecionada[];
}

export interface PlanoGerado {
  principal: Macrociclo;
  alternativa?: Macrociclo;
  modeloId: ModeloPeriodizacaoId;
  modeloAltId?: ModeloPeriodizacaoId;
  /** título padrão do plano, já com linguagem de documento (o profissional pode reescrever) */
  titulo: string;
  raciocinio: string;
  refIds: string[];
}

const NIVEL_ORDEM: Record<Nivel, number> = { Iniciante: 0, "Intermediário": 1, "Avançado": 2 };

let _seq = 0;
const nid = (p: string) => `${p}-${Date.now().toString(36)}-${(_seq++).toString(36)}`;

/* --------------------------- Escolha do(s) modelo(s) --------------------------- */

function escolherModelos(input: GerarPlanoInput): {
  principal: ModeloPeriodizacaoId;
  alternativa?: ModeloPeriodizacaoId;
  /** o que o motor escolheria sozinho, quando o profissional escolheu outro */
  sugeridoPeloMotor?: ModeloPeriodizacaoId;
} {
  // O profissional escolheu: a escolha dele manda, e a do motor vira a alternativa.
  // Trocar a escolha dele em silêncio seria decidir por ele; escondê-la seria pior.
  if (input.modeloPreferido) {
    const { principal: doMotor } = escolherModelos({ ...input, modeloPreferido: undefined });
    return {
      principal: input.modeloPreferido,
      alternativa: doMotor !== input.modeloPreferido ? doMotor : undefined,
      sugeridoPeloMotor: doMotor,
    };
  }

  const { objetivo, nivel, grupoEspecial } = input;
  const treinado = NIVEL_ORDEM[nivel] >= 1;

  /*
   * O MODELO SEGUE OBJETIVO E NÍVEL. A CONDIÇÃO NÃO ESCOLHE O MODELO.
   *
   * Antes, qualquer aluno com condição declarada caía em "linear", fosse ele
   * iniciante ou avançado, com qualquer objetivo. O efeito prático era um aluno
   * intermediário de hipertrofia com obesidade receber linear e a tela anunciar
   * "Periodização linear" onde a decisão correta seria ondulatória.
   *
   * O erro era conceitual: confundir MODELO (como as variáveis se distribuem no
   * tempo) com CAUTELA (quão rápido e até onde progredir). Distribuir ênfase de
   * repetições entre as sessões não é mais arriscado do que subir carga em linha
   * reta. Quem cuida da segurança são as outras camadas, e elas já existem:
   * `modProgressao` (teto de PSE e passo reduzido por perfil), as penalidades de
   * ranqueamento e, desde agora, o filtro de exercícios por condição.
   *
   * O que a condição faz aqui é UMA coisa: entra como a ALTERNATIVA
   * autorregulada, porque tolerância variável dia a dia é justamente o caso em
   * que autorregular ajuda.
   */
  const alternativaDaCondicao = grupoEspecial ? "flexivel" : undefined;

  // Retorno ao treino é uma FASE, não um objetivo de desempenho: o previsível
  // vence, porque o propósito é reconstruir tolerância antes de buscar ganho.
  if (objetivo === "Retorno ao treino") {
    return { principal: "linear", alternativa: "flexivel" };
  }
  // Iniciante: a progressão linear simples costuma bastar (a ondulatória não rende mais).
  if (!treinado) {
    return { principal: "linear", alternativa: alternativaDaCondicao ?? "ondulatoria" };
  }
  // Força/hipertrofia em treinados: ondulatória tende a render mais para força.
  if (objetivo === "Hipertrofia" || objetivo === "Força") {
    return {
      principal: "ondulatoria",
      alternativa: alternativaDaCondicao ?? (nivel === "Avançado" ? "blocos" : "linear"),
    };
  }
  // Demais objetivos em treinados: linear como base, ondulatória como alternativa.
  return { principal: "linear", alternativa: alternativaDaCondicao ?? "ondulatoria" };
}

/* ------------------------------ Seleção de exercícios ------------------------------ */

/**
 * As restrições que valem para ESTE plano: as que o profissional declarou no
 * perfil do aluno MAIS as que a condição impõe por si (groupRules
 * `restricoesEstruturais`). Deduplicadas por tag; a mais estrita manda depois,
 * no avaliador.
 */
function restricoesDoPlano(input: GerarPlanoInput): RestricaoSelecionada[] {
  const declaradas = input.restricoes ?? [];
  const daCondicao = input.grupoEspecial ? (groupGpsRules[input.grupoEspecial]?.restricoesEstruturais ?? []) : [];
  const porTag = new Map<RestricaoTag, RestricaoSelecionada>();
  for (const r of declaradas) porTag.set(r.tag, r);
  for (const tag of daCondicao) if (!porTag.has(tag)) porTag.set(tag, criarRestricao(tag));
  return [...porTag.values()];
}

/**
 * SELEÇÃO DE EXERCÍCIOS DO PLANO, agora ciente da condição.
 *
 * Antes esta função via só objetivo e nível, e por isso um plano de 12 semanas
 * para obesidade grau II podia trazer exercício deitado no banco ou que exige ir
 * ao chão: nada no caminho olhava a condição. O Treino do dia já excluía esses
 * casos; o plano não. Agora os dois passam pelo MESMO avaliador por tag
 * (EFEITO_POR_TAG), que é a fonte única de "este exercício cabe neste aluno".
 *
 * Ordem de preferência: primeiro os que o avaliador PREFERE, depois os neutros,
 * depois os adaptáveis. Excluídos nunca entram, nem para completar a lista.
 *
 * Devolve também quantos foram descartados e por quê, para a tela poder dizer
 * "o catálogo não tem exercício suficiente para este perfil" em vez de completar
 * com o que sobrou (que é como o erro apareceria de novo, só que silencioso).
 */
export interface SelecaoExercicios {
  escolhidos: { slug: string; nome: string }[];
  /** exercícios retirados pela condição/restrição, com o motivo (para o Prontuário) */
  descartados: { slug: string; nome: string; motivo: string }[];
  /** true quando o catálogo não tinha exercícios seguros suficientes para o pedido */
  faltouCatalogo: boolean;
}

function selecionarExercicios(
  objetivo: GpsObjetivo,
  nivel: Nivel,
  n: number,
  restricoes: RestricaoSelecionada[] = [],
): SelecaoExercicios {
  const teto = NIVEL_ORDEM[nivel];
  const noNivel = (e: (typeof exercises)[number]) => NIVEL_ORDEM[(e.nivel as Nivel) ?? "Iniciante"] <= teto;

  // Pool base: do objetivo quando houver o bastante; senão, todo o catálogo no nível.
  const doObjetivo = exercises.filter((e) => e.objetivo?.includes(objetivo) && noNivel(e));
  const pool = doObjetivo.length >= n ? doObjetivo : exercises.filter(noNivel);

  const ativas = restricoesAtivas(restricoes);
  const descartados: SelecaoExercicios["descartados"] = [];
  // Nota por exercício: 0 = excluído, e o resto é a ação mais estrita entre as tags.
  const PESO_ACAO: Record<AcaoRestricao, number> = {
    preferir: 3,
    adaptar: 2,
    penalizar_moderado: 1,
    penalizar_forte: 0.5,
    excluir: 0,
  };

  const avaliados = pool.map((e) => {
    let nota = 2.5; // sem restrição ativa, todos empatam (ordem do catálogo decide)
    let motivo = "";
    for (const sel of ativas) {
      const avaliar = EFEITO_POR_TAG[sel.tag];
      if (!avaliar) continue;
      const efeito = avaliar(e, sel);
      const peso = PESO_ACAO[efeito.acao];
      if (peso < nota) {
        nota = peso;
        motivo = `${rotuloRestricao(sel.tag)}: ${efeito.motivo}`;
      }
    }
    return { e, nota, motivo };
  });

  for (const a of avaliados) {
    if (a.nota === 0) {
      descartados.push({ slug: a.e.slug, nome: a.e.nome ?? a.e.slug, motivo: a.motivo });
    }
  }

  // Ordenação ESTÁVEL: nota decrescente, e o desempate é a ordem do catálogo, para
  // o mesmo input gerar sempre o mesmo plano (a impressão digital depende disso).
  const seguros = avaliados
    .filter((a) => a.nota > 0)
    .map((a, i) => ({ ...a, i }))
    .sort((x, y) => y.nota - x.nota || x.i - y.i)
    .map((a) => ({ slug: a.e.slug, nome: a.e.nome ?? a.e.slug }));

  return {
    escolhidos: seguros.slice(0, Math.max(n, 1)),
    descartados,
    faltouCatalogo: seguros.length < n,
  };
}

/* --------------------------------- Dose de força --------------------------------- */

/**
 * Dose de um bloco de força (séries, repetições, intensidade, intervalo) a partir da faixa
 * citada do objetivo. Com `enfase` (semana ondulatória), repetições e intensidade seguem a
 * ênfase do dia; sem ela, seguem a base do objetivo/nível.
 *
 * Helper puro extraído de `montarSessoes` para ser reusado na semeadura de blocos vindos de
 * uma Prescricao (src/lib/gps/semear.ts) SEM copiar `PrescricaoItem.series`. Os campos-texto
 * são idênticos aos do trecho original (check:faixas byte-idêntico).
 *
 * Com `ctx` (a semeadura não passa), delega a src/lib/gps/alvo.ts e acrescenta o ALVO
 * concreto da semana (seriesAlvo, repsAlvo, rirAlvo, cargaRelativaAlvo, intervaloAlvoSeg,
 * origemRegraId), sempre DENTRO da faixa. Sem `ctx`, devolve só o texto (byte-idêntico).
 */
export interface DoseForca {
  series: string;
  reps: string;
  intensidade: string;
  intervalo: string;
}
export function doseForca(
  faixa: FaixaObjetivo,
  nivel: Nivel,
  enfase?: EnfaseSessao,
  ctx?: CtxAlvo,
): DoseForca & Partial<AlvoForca> {
  const texto: DoseForca = {
    series: faixa.series.valor,
    reps: enfase?.reps ?? valorFaixa(faixa.reps, nivel),
    intensidade: enfase?.intensidade ?? faixa.intensidade.valor,
    intervalo: faixa.intervalo.valor,
  };
  if (!ctx) return texto;
  const alvo = alvoSemana({ ...texto, intensidadeNota: faixa.intensidade.nota }, ctx);
  return { ...texto, ...alvo };
}

/* --------------------------------- Sessões da semana --------------------------------- */

/**
 * Explicação acrescentada à NOTA do bloco aeróbio (o campo `observacao`, que é onde vive a
 * nota do bloco) quando a frequência cardíaca deixou de guiar a intensidade deste aluno. O
 * texto de `intensidade` NÃO é reescrito: ele é a faixa citada da diretriz, lida pelo
 * check:faixas, e continua valendo como referência ao lado.
 *
 * A frase não nomeia classe de medicação nem condição clínica de propósito: este bloco é
 * impresso no documento que chega ao aluno, e o porquê clínico é assunto do profissional, no
 * Prontuário. Ela diz o que fazer, que é o que muda a sessão.
 */
const NOTA_SEM_ZONA_FC =
  "Neste plano a intensidade é guiada pela percepção de esforço e pelo teste da fala, e a zona de frequência cardíaca não entra: use esses dois no lugar dela.";

/**
 * `semFC` existe para a nota não se contradizer: a base sugere ajustar pelo recurso do
 * equipamento, e a FCmáx da esteira é um desses recursos. Mandar usá-la na mesma nota que diz
 * que a frequência cardíaca não guia seria pior que não explicar nada. Sem `semFC`, o texto é
 * o mesmo; e sem "p-fc" invalidado, a nota sai byte-idêntica à de sempre.
 */
function notaAerobio(ctx: CtxAlvo, base: string, semFC: string = base): string {
  return (ctx.parametrosInvalidos ?? []).includes("p-fc") ? `${semFC} ${NOTA_SEM_ZONA_FC}` : base;
}

function montarSessoes(
  objetivo: GpsObjetivo,
  nivel: Nivel,
  frequencia: number,
  modelo: ModeloPeriodizacaoId,
  // Restrições já fundidas (perfil + condição): filtram a seleção de exercícios.
  restricoes: RestricaoSelecionada[],
  // Contexto da semana (posição no meso + tendências): faz a dose de força ganhar o ALVO
  // concreto que progride. Mesmo para todas as sessões da semana; o que muda por sessão é a
  // ênfase (ondulatória), que já entra na dose antes do alvo.
  ctx: CtxAlvo,
): Sessao[] {
  const faixa = getFaixa(objetivo);
  const selecao = selecionarExercicios(objetivo, nivel, Math.max(4, frequencia + 2), restricoes);
  const escolhidos = selecao.escolhidos;
  const sessoes: Sessao[] = [];

  // A variação diária só entra quando o modelo pede E o objetivo tem ênfases autoradas
  // dentro da própria faixa. Emagrecimento e retorno ao treino não herdam repetições de força.
  const ondula = modelo === "ondulatoria" || modelo === "flexivel";
  const enfases = ondula ? faixa.enfases : undefined;

  for (let i = 0; i < frequencia; i++) {
    const enfase = enfases?.[i % enfases.length];
    const blocos: BlocoSessao[] = [];

    // Aeróbio entra quando o objetivo é emagrecimento (força de corpo todo + cardio).
    // Cardio se prescreve por formato, duração e intensidade, não por séries e carga.
    // Zona moderada e teste da conversa seguem a diretriz do ACSM (garber-2011, acsm-getp11).
    if (objetivo === "Emagrecimento") {
      // As faixas-texto (duração e intensidade) seguem como REFERÊNCIA ao lado; o alvo concreto
      // da semana (duração, PSE e, com idade + FCrep, a zona de FC) vem de alvoAerobioSemana,
      // no mesmo padrão da dose de força: alvo dentro da faixa citada, progredindo por posição.
      const doseAero = {
        duracao: "20 a 40 min",
        intensidade: "Moderada: cerca de 64 a 76% da FCmáx (teste da conversa; RPE 4 a 6 de 10)",
      };
      blocos.push({
        id: nid("blk"),
        tipo: "aerobio",
        modalidade: "caminhada",
        nome: "Aeróbio",
        formato: "Contínuo",
        duracao: doseAero.duracao,
        intensidade: doseAero.intensidade,
        recuperacao: "-",
        observacao: notaAerobio(
          ctx,
          "Ajuste a intensidade pelo recurso do equipamento: FCmáx na esteira, watts na bike ou pace na corrida. Alternativa intervalada: alterne 1 a 2 min mais forte com 2 a 3 min leves, mantendo o tempo total.",
          "Ajuste a intensidade pelo recurso do equipamento: watts na bike ou pace na corrida. Alternativa intervalada: alterne 1 a 2 min mais forte com 2 a 3 min leves, mantendo o tempo total.",
        ),
        ...alvoAerobioSemana(doseAero, ctx),
      });
    }

    // 3 a 4 exercícios de força por sessão, girando a lista de escolhidos.
    const porSessao = objetivo === "Emagrecimento" ? 3 : 4;
    for (let j = 0; j < porSessao; j++) {
      const ex = escolhidos[(i * porSessao + j) % escolhidos.length];
      blocos.push({
        id: nid("blk"),
        tipo: "forca",
        exercicioSlug: ex.slug,
        nome: ex.nome,
        ...doseForca(faixa, nivel, enfase, ctx),
      });
    }

    // Aeróbio COMPLEMENTAR (princípio da variabilidade): todos os objetivos MENOS o
    // Emagrecimento (onde o aeróbio já é BASE, acima) ganham um componente aeróbio em 1 a 2
    // sessões da semana, com dose MENOR e ALVO progressivo por semana. Usa a MESMA mecânica da
    // base (alvoAerobioSemana), então entra na assinaturaSemana/agregadoSemana como os aeróbios
    // de hoje (fonte única do gráfico). Fica ao FINAL da sessão: o foco do objetivo (carga na
    // força, reps na resistência) vem primeiro. Dose e frequência saem da faixa citada
    // (garber-2011), nunca inventadas.
    const comp = faixa.complementoAerobio;
    if (comp && i < comp.sessoesPorSemana) {
      const doseAero = { duracao: comp.duracao, intensidade: comp.intensidade };
      blocos.push({
        id: nid("blk"),
        tipo: "aerobio",
        modalidade: comp.modalidade,
        nome: "Aeróbio complementar",
        formato: "Contínuo",
        duracao: doseAero.duracao,
        intensidade: doseAero.intensidade,
        recuperacao: "-",
        observacao: notaAerobio(
          ctx,
          "Complemento aeróbio ao treino principal; o foco da sessão segue o objetivo. Guie a intensidade pelo teste da conversa e pela percepção de esforço.",
        ),
        ...alvoAerobioSemana(doseAero, ctx),
      });
    }

    sessoes.push({
      id: nid("ses"),
      nome: enfase ? `Sessão ${i + 1} (${enfase.rotulo})` : `Sessão ${i + 1}`,
      foco: enfase ? `Ênfase ${enfase.rotulo}` : faixa.capacidades[0],
      blocos,
      // Fecho de flexibilidade da sessão (variabilidade), citado; o texto vem do objetivo.
      fecho: faixa.flexibilidade?.texto,
    });
  }
  return sessoes;
}

/* ---------------------------------- Microciclos ---------------------------------- */

/**
 * Dados do aluno que chegam até o alvo da semana. Todos opcionais: o uso avulso, o estudo e
 * os guardrails não os passam, e o alvo cai no caminho honesto (duração mais PSE) em vez de
 * inventar número.
 */
interface DadosDoAlunoNoAlvo {
  /** estima a FCmax para a zona de FC do aeróbio */
  idade?: number;
  /** FCrep MEDIDA, fecha a zona de Karvonen */
  fcRepouso?: number;
  /** parâmetros que deixaram de guiar a intensidade neste aluno (ver src/lib/gps/farmacos.ts) */
  parametrosInvalidos?: ParamMonitorId[];
  /** restrições já fundidas (perfil + condição): filtram a seleção de exercícios */
  restricoes?: RestricaoSelecionada[];
}

function montarMicrociclos(
  objetivo: GpsObjetivo,
  nivel: Nivel,
  modelo: ModeloPeriodizacaoId,
  frequencia: number,
  semanaInicio: number,
  duracao: number,
  comDeload: boolean,
  // Tendências do mesociclo dono destas semanas: mandam a DIREÇÃO do alvo semana a semana.
  tendenciaVolume: Tendencia,
  tendenciaIntensidade: Tendencia,
  // Dados do aluno que personalizam o alvo. Ficam num objeto, e não em posicionais, porque
  // esta lista cresce: hoje idade e FCrep (zona de FC do aeróbio, MP-4), amanhã o perfil
  // clínico que decide qual parâmetro guia a intensidade. Ausente = comportamento de sempre.
  dadosDoAluno: DadosDoAlunoNoAlvo = {},
): Microciclo[] {
  const { idade, fcRepouso, parametrosInvalidos, restricoes: restricoesPlano = [] } = dadosDoAluno;
  const semanas: Microciclo[] = [];
  // Semanas de carga do meso (a descarga, quando existe, é a última e fica fora desta conta).
  const semanasDeCargaNoMeso = comDeload ? Math.max(1, duracao - 1) : duracao;
  for (let s = 0; s < duracao; s++) {
    const semana = semanaInicio + s;
    const ehDeload = comDeload && s === duracao - 1;
    const freqSemana = ehDeload ? Math.max(1, frequencia - 1) : frequencia;
    const ctx: CtxAlvo = {
      // A descarga se ancora no teto do meso (última carga) e reduz a partir dele.
      semanaNoMeso: ehDeload ? semanasDeCargaNoMeso : s + 1,
      semanasDeCargaNoMeso,
      tipoSemana: ehDeload ? "deload" : "carga",
      tendenciaVolume,
      tendenciaIntensidade,
      nivel,
      objetivo,
      idade,
      fcRepouso,
      parametrosInvalidos,
    };
    semanas.push({
      id: nid("mic"),
      semana,
      tipo: ehDeload ? "deload" : "carga",
      frequencia: freqSemana,
      sessoes: montarSessoes(objetivo, nivel, freqSemana, modelo, restricoesPlano, ctx),
      nota: ehDeload ? "Semana de descarga: reduza volume e intensidade para recuperar." : undefined,
      objetivo: objetivoDaSemana(ctx.tipoSemana, tendenciaVolume, tendenciaIntensidade),
    });
  }
  return semanas;
}

/* ------------------------- Macrociclo por objetivo/nível ------------------------- */

// Arquétipos de FASE de uma onda de treino (progressão da base à realização). Prática comum
// de periodização por blocos; a divisão exata é ajustável pelo profissional. Uma onda é
// acúmulo -> intensificação -> realização: primeiro acumula volume, depois transfere para
// intensidade, depois expressa o ganho com o volume enxuto.
const FASES_ONDA = [
  { nome: "Acúmulo", foco: "Construir a base: acumular volume e consolidar a técnica.", tv: "sobe" as Tendencia, ti: "estavel" as Tendencia },
  { nome: "Intensificação", foco: "Elevar a intensidade sobre a base construída, enxugando um pouco o volume.", tv: "estavel" as Tendencia, ti: "sobe" as Tendencia },
  { nome: "Realização", foco: "Expressar o ganho da fase com o volume mais enxuto e a intensidade em foco.", tv: "reduz" as Tendencia, ti: "sobe" as Tendencia },
];

/**
 * O foco de um mesociclo pela sua POSIÇÃO no ano, para o horizonte anual EVOLUIR em vez de
 * repetir o mesmo quarteto trimestral quatro vezes. O ano se organiza em ONDAS sucessivas
 * (acúmulo -> intensificação -> realização); a cada onda, o programa retoma a fase num
 * patamar mais alto de complexidade. Assim o trimestral (uma onda) segue coerente, e o anual
 * (várias ondas) sobe de nível ao longo do calendário.
 *
 * - `fase = m % 3` escolhe o arquétipo (acúmulo/intensificação/realização);
 * - `ciclo = floor(m / 3)` é a onda do ano (0 = primeira); a partir da 2ª, o nome ganha o
 *   ordinal do ciclo e a complexidade sobe, para os mesociclos do ano não serem idênticos.
 */
function focoDoMeso(m: number): {
  nome: string;
  foco: string;
  tv: Tendencia;
  ti: Tendencia;
  tc: Tendencia;
  ciclo: number;
} {
  const fase = ((m % 3) + 3) % 3;
  const ciclo = Math.floor(m / 3);
  const arq = FASES_ONDA[fase];
  const nome = ciclo === 0 ? arq.nome : `${arq.nome} (${ciclo + 1}º ciclo)`;
  const foco =
    ciclo === 0
      ? arq.foco
      : `${arq.foco} Ciclo ${ciclo + 1} do ano: retoma a fase num patamar de complexidade mais alto.`;
  // A complexidade sobe a cada onda: no primeiro ciclo o acúmulo entra estável (assentar a
  // base) e a realização segura a complexidade para expressar o pico; do 2º ciclo em diante o
  // acúmulo já retoma num patamar maior. É o que faz a média do ano subir, não repetir.
  const tc: Tendencia =
    fase === 2 ? "estavel" : fase === 0 && ciclo === 0 ? "estavel" : "sobe";
  return { nome, foco, tv: arq.tv, ti: arq.ti, tc, ciclo };
}

// As modalidades em foco do plano genérico refletem o que `montarSessoes` de fato monta:
// musculação em todo plano; caminhada entra no Emagrecimento (aeróbio base) e nos demais
// objetivos que agora recebem o aeróbio COMPLEMENTAR (princípio da variabilidade).
function modalidadesDoObjetivo(objetivo: GpsObjetivo): string[] {
  if (objetivo === "Emagrecimento") return ["m-musculacao", "m-caminhada"];
  return getFaixa(objetivo).complementoAerobio ? ["m-musculacao", "m-caminhada"] : ["m-musculacao"];
}

function montarMacrocicloGenerico(
  input: GerarPlanoInput,
  modelo: ModeloPeriodizacaoId,
): Macrociclo {
  const { objetivo, nivel, semanas, frequencia } = input;
  const faixa = getFaixa(objetivo);

  // Blocos de ~4 semanas: um mesociclo a cada 4 semanas, sem teto (o horizonte anual pede
  // ~12). Os focos vêm de `focoDoMeso`: o ano se organiza em ONDAS (acúmulo -> intensificação
  // -> realização) que EVOLUEM de ciclo em ciclo, em vez do quarteto trimestral repetido; cada
  // mesociclo de 4+ semanas fecha com a própria descarga.
  const nMeso = Math.max(1, Math.round(semanas / 4));
  const base = Math.floor(semanas / nMeso);
  const resto = semanas - base * nMeso;

  const mesociclos: Mesociclo[] = [];
  let cursor = 1;
  for (let m = 0; m < nMeso; m++) {
    const dur = base + (m < resto ? 1 : 0);
    const ini = cursor;
    const fim = cursor + dur - 1;
    cursor = fim + 1;
    const foco = focoDoMeso(m);
    const ondul = modelo === "ondulatoria" || modelo === "flexivel" || modelo === "autorregulada";
    const comDeload = dur >= 4;
    // As tendências do meso mandam a direção do alvo; a mesma fonte alimenta o gráfico e o alvo.
    const tv: Tendencia = ondul ? "varia" : foco.tv;
    const ti: Tendencia = ondul ? "varia" : foco.ti;

    mesociclos.push({
      id: nid("mes"),
      nome: foco.nome,
      foco: foco.foco,
      semanaInicio: ini,
      semanaFim: fim,
      capacidades: faixa.capacidades,
      tiposExercicio: faixa.tiposExercicio,
      modalidades: modalidadesDoObjetivo(objetivo),
      tendenciaVolume: tv,
      tendenciaIntensidade: ti,
      // A complexidade sobe a cada onda do ano (ver focoDoMeso): é parte do que faz o anual
      // evoluir, não repetir. No modelo ondulatório o alvo já varia dentro da semana.
      tendenciaComplexidade: foco.tc,
      deload: comDeload,
      reavaliacao: true,
      criteriosProgressao: [
        "Sessões concluídas com boa técnica e esforço dentro do previsto",
        "Sem dor relevante nem sinais de alerta",
        "Recuperação adequada entre as sessões",
      ],
      criteriosRegressao: [
        "Dor, perda de função ou sinais de alerta",
        "Fadiga acumulada ou queda de desempenho persistente",
        "Baixa adesão ou sono ruim mantidos",
      ],
      parametros: faixa.parametros,
      microciclos: montarMicrociclos(objetivo, nivel, modelo, frequencia, ini, dur, comDeload, tv, ti, {
        idade: input.idade,
        fcRepouso: input.fcRepouso,
        parametrosInvalidos: input.parametrosInvalidos,
        restricoes: restricoesDoPlano(input),
      }),
    });
  }

  return { objetivoGeral: `${objetivo} (${nivel})`, semanas, mesociclos };
}

/* --------------------- Macrociclo com jornada do grupo especial --------------------- */

function montarMacrocicloGrupo(input: GerarPlanoInput, modelo: ModeloPeriodizacaoId): Macrociclo | null {
  if (!input.grupoEspecial) return null;
  const grupo = getSpecialGroup(input.grupoEspecial);
  if (!grupo || !grupo.fases?.length) return null;

  const { objetivo, nivel, semanas, frequencia } = input;
  const faixa = getFaixa(objetivo);
  // O aluno que já está na fase 3 recebe o macro nascendo na fase 3: itera das fases a
  // partir de `faseInicial`. Ausente = 1 = todas as fases = comportamento byte-idêntico.
  const inicio = Math.min(grupo.fases.length, Math.max(1, input.faseInicial ?? 1)) - 1;
  const fasesUsadas = grupo.fases.slice(inicio);

  // Um mesociclo por fase basta até ~8 semanas por fase. Num horizonte longo (anual), em
  // que cada fase ficaria com mais de 8 semanas, a ÚLTIMA fase (consolidação/manutenção) se
  // REPETE, sem inventar fase nova: o programa sustenta os ganhos até o fim do calendário.
  const MAX_SEM_POR_FASE = 8;
  const precisaEstender = fasesUsadas.length > 0 && semanas / fasesUsadas.length > MAX_SEM_POR_FASE;
  const nMeso = precisaEstender
    ? Math.max(fasesUsadas.length, Math.ceil(semanas / MAX_SEM_POR_FASE))
    : fasesUsadas.length;
  // Sequência de fases: as reais primeiro; depois repetições honestas da última fase.
  const sequencia = Array.from({ length: nMeso }, (_, m) => {
    const idx = Math.min(m, fasesUsadas.length - 1);
    return { fase: fasesUsadas[idx], estendida: m >= fasesUsadas.length };
  });
  const base = Math.floor(semanas / nMeso);
  const resto = semanas - base * nMeso;

  const mesociclos: Mesociclo[] = [];
  let cursor = 1;
  sequencia.forEach(({ fase, estendida }, m) => {
    const dur = base + (m < resto ? 1 : 0);
    const ini = cursor;
    const fim = cursor + dur - 1;
    cursor = fim + 1;
    const comDeload = dur >= 4;
    // As repetições da última fase são manutenção (estável); as fases reais progridem (sobe).
    const tv: Tendencia = m === 0 || estendida ? "estavel" : "sobe";
    const ti: Tendencia = m === 0 || estendida ? "estavel" : "sobe";
    mesociclos.push({
      id: nid("mes"),
      // A repetição da última fase é nomeada com honestidade ("continuação"): não é uma
      // fase clínica nova, é a mesma fase sustentada ao longo do horizonte.
      nome: estendida ? `Fase ${fase.numero}: ${fase.nome} (continuação)` : `Fase ${fase.numero}: ${fase.nome}`,
      foco: estendida ? `Continuação da fase para sustentar os ganhos ao longo do horizonte. ${fase.foco}` : fase.foco,
      semanaInicio: ini,
      semanaFim: fim,
      capacidades: [fase.objetivo, ...faixa.capacidades].slice(0, 4),
      tiposExercicio: faixa.tiposExercicio,
      // As modalidades em foco vêm da jornada já autorada do grupo, que varia por fase.
      modalidades: fase.modalidades,
      // `faseJornada` autoriza a palavra "Fase" na tela e alimenta a reconciliação com a
      // fase clínica do aluno (o número real da fase, não a posição no macro recortado).
      faseJornada: fase.numero,
      // As repetições da última fase são manutenção: a carga se estabiliza, não sobe sempre.
      tendenciaVolume: tv,
      tendenciaIntensidade: ti,
      tendenciaComplexidade: m === 0 || estendida ? "estavel" : "sobe",
      deload: comDeload,
      reavaliacao: true,
      criteriosProgressao: fase.criteriosAvancar,
      criteriosRegressao: fase.criteriosRegredir,
      parametros: fase.parametros?.length ? fase.parametros : faixa.parametros,
      microciclos: montarMicrociclos(objetivo, nivel, modelo, frequencia, ini, dur, comDeload, tv, ti, {
        idade: input.idade,
        fcRepouso: input.fcRepouso,
        parametrosInvalidos: input.parametrosInvalidos,
        restricoes: restricoesDoPlano(input),
      }),
    });
  });

  // `rotuloAluno` e não `nome`: o macrociclo vai impresso no documento que chega ao aluno,
  // e ali ele é um programa ("Fortalecimento com cuidado lombar"), não um diagnóstico.
  return { objetivoGeral: `${objetivo} (${nivel}): ${grupo.rotuloAluno}`, semanas, mesociclos };
}

/* ----------------------------------- Entrada pública ----------------------------------- */

export function gerarPlano(input: GerarPlanoInput): PlanoGerado {
  const { principal, alternativa, sugeridoPeloMotor } = escolherModelos(input);

  const macroPrincipal =
    montarMacrocicloGrupo(input, principal) ?? montarMacrocicloGenerico(input, principal);
  const macroAlt = alternativa
    ? (montarMacrocicloGrupo(input, alternativa) ?? montarMacrocicloGenerico(input, alternativa))
    : undefined;

  const modP = getModelo(principal);
  const faixa = getFaixa(input.objetivo);
  const grupo = input.grupoEspecial ? getSpecialGroup(input.grupoEspecial) : undefined;

  const refIds = Array.from(
    new Set([
      ...modP.refIds,
      ...faixa.refIds,
      // Onda F: o complemento aeróbio e a flexibilidade citam garber-2011; entram na
      // bibliografia do plano para a referência aparecer resolvida no PDF e na tela.
      ...(faixa.complementoAerobio?.refIds ?? []),
      ...(faixa.flexibilidade?.refIds ?? []),
    ]),
  );

  const raciocinio = [
    `Modelo principal: ${modP.nome}. ${modP.resumo}`,
    // Quando a escolha foi do profissional e difere da do motor, o plano diz as duas.
    // Silenciar a divergência transformaria a ferramenta em carimbo da escolha dele.
    sugeridoPeloMotor && sugeridoPeloMotor !== principal
      ? `Este modelo foi escolhido por você. Pelo objetivo, nível e condição, o ponto de partida do sistema seria ${getModelo(sugeridoPeloMotor).nome}, que fica como alternativa para comparar.`
      : "",
    grupo
      ? // O raciocínio também é impresso para o aluno, então ele nomeia o programa, não a
        // condição. A condição segue à vista do profissional no selo do plano e no perfil.
        `A jornada de fases do programa ${grupo.rotuloAluno} é o esqueleto do macrociclo, e os cuidados e parâmetros dessa jornada são sobrepostos.`
      : `Escolha por objetivo (${input.objetivo}) e nível (${input.nivel}).`,
    `As faixas de séries, repetições, intensidade e intervalo seguem as diretrizes citadas, sempre como faixa e sob o seu critério. ${faixa.ressalva}`,
    alternativa
      ? `Uma alternativa (${getModelo(alternativa).nome}) é oferecida porque a evidência sustenta mais de uma estratégia; as diferenças costumam ser pequenas quando o volume é equiparado.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    principal: macroPrincipal,
    alternativa: macroAlt,
    modeloId: principal,
    modeloAltId: alternativa,
    // O título vive aqui, junto do resto do texto que vai impresso, para que a regra de
    // linguagem do documento (programa, nunca diagnóstico) seja verificável num lugar só.
    titulo: grupo
      ? `${grupo.rotuloAluno}: ${input.semanas} semanas`
      : `${input.objetivo}: ${input.semanas} semanas`,
    raciocinio,
    refIds,
  };
}
