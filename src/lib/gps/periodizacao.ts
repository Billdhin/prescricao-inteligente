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

  // Reabilitação/retorno ou grupo especial: progressão conservadora e previsível.
  if (objetivo === "Reabilitação/retorno" || grupoEspecial) {
    return { principal: "linear", alternativa: "flexivel" };
  }
  // Iniciante: a progressão linear simples costuma bastar (a ondulatória não rende mais).
  if (!treinado) {
    return { principal: "linear", alternativa: "flexivel" };
  }
  // Força/hipertrofia em treinados: ondulatória tende a render mais para força.
  if (objetivo === "Hipertrofia" || objetivo === "Força") {
    return { principal: "ondulatoria", alternativa: nivel === "Avançado" ? "blocos" : "linear" };
  }
  // Demais objetivos em treinados: linear como base, ondulatória como alternativa.
  return { principal: "linear", alternativa: "ondulatoria" };
}

/* ------------------------------ Seleção de exercícios ------------------------------ */

function selecionarExercicios(objetivo: GpsObjetivo, nivel: Nivel, n: number) {
  const teto = NIVEL_ORDEM[nivel];
  let pool = exercises.filter(
    (e) => e.objetivo?.includes(objetivo) && NIVEL_ORDEM[(e.nivel as Nivel) ?? "Iniciante"] <= teto,
  );
  if (pool.length < n) {
    pool = exercises.filter((e) => NIVEL_ORDEM[(e.nivel as Nivel) ?? "Iniciante"] <= teto);
  }
  return pool.slice(0, Math.max(n, 1)).map((e) => ({ slug: e.slug, nome: (e as { nome?: string }).nome ?? e.slug }));
}

/* --------------------------------- Dose de força --------------------------------- */

/**
 * Dose de um bloco de força (séries, repetições, intensidade, intervalo) a partir da faixa
 * citada do objetivo. Com `enfase` (semana ondulatória), repetições e intensidade seguem a
 * ênfase do dia; sem ela, seguem a base do objetivo/nível.
 *
 * Helper puro extraído de `montarSessoes` para ser reusado na semeadura de blocos vindos de
 * uma Prescricao (src/lib/gps/semear.ts) SEM copiar `PrescricaoItem.series`. A saída aqui é
 * idêntica à do trecho original (check:faixas byte-idêntico).
 */
export interface DoseForca {
  series: string;
  reps: string;
  intensidade: string;
  intervalo: string;
}
export function doseForca(faixa: FaixaObjetivo, nivel: Nivel, enfase?: EnfaseSessao): DoseForca {
  return {
    series: faixa.series.valor,
    reps: enfase?.reps ?? valorFaixa(faixa.reps, nivel),
    intensidade: enfase?.intensidade ?? faixa.intensidade.valor,
    intervalo: faixa.intervalo.valor,
  };
}

/* --------------------------------- Sessões da semana --------------------------------- */

function montarSessoes(
  objetivo: GpsObjetivo,
  nivel: Nivel,
  frequencia: number,
  modelo: ModeloPeriodizacaoId,
): Sessao[] {
  const faixa = getFaixa(objetivo);
  const escolhidos = selecionarExercicios(objetivo, nivel, Math.max(4, frequencia + 2));
  const sessoes: Sessao[] = [];

  // A variação diária só entra quando o modelo pede E o objetivo tem ênfases autoradas
  // dentro da própria faixa. Emagrecimento e reabilitação não herdam repetições de força.
  const ondula = modelo === "ondulatoria" || modelo === "flexivel";
  const enfases = ondula ? faixa.enfases : undefined;

  for (let i = 0; i < frequencia; i++) {
    const enfase = enfases?.[i % enfases.length];
    const blocos: BlocoSessao[] = [];

    // Aeróbio entra quando o objetivo é emagrecimento (força de corpo todo + cardio).
    // Cardio se prescreve por formato, duração e intensidade, não por séries e carga.
    // Zona moderada e teste da conversa seguem a diretriz do ACSM (garber-2011, acsm-getp11).
    if (objetivo === "Emagrecimento") {
      blocos.push({
        id: nid("blk"),
        tipo: "aerobio",
        modalidade: "caminhada",
        nome: "Aeróbio",
        formato: "Contínuo",
        duracao: "20 a 40 min",
        intensidade: "Moderada: cerca de 64 a 76% da FCmáx (teste da conversa; RPE 4 a 6 de 10)",
        recuperacao: "-",
        observacao:
          "Ajuste a intensidade pelo recurso do equipamento: FCmáx na esteira, watts na bike ou pace na corrida. Alternativa intervalada: alterne 1 a 2 min mais forte com 2 a 3 min leves, mantendo o tempo total.",
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
        ...doseForca(faixa, nivel, enfase),
      });
    }

    sessoes.push({
      id: nid("ses"),
      nome: enfase ? `Sessão ${i + 1} (${enfase.rotulo})` : `Sessão ${i + 1}`,
      foco: enfase ? `Ênfase ${enfase.rotulo}` : faixa.capacidades[0],
      blocos,
    });
  }
  return sessoes;
}

/* ---------------------------------- Microciclos ---------------------------------- */

function montarMicrociclos(
  objetivo: GpsObjetivo,
  nivel: Nivel,
  modelo: ModeloPeriodizacaoId,
  frequencia: number,
  semanaInicio: number,
  duracao: number,
  comDeload: boolean,
): Microciclo[] {
  const semanas: Microciclo[] = [];
  for (let s = 0; s < duracao; s++) {
    const semana = semanaInicio + s;
    const ehDeload = comDeload && s === duracao - 1;
    semanas.push({
      id: nid("mic"),
      semana,
      tipo: ehDeload ? "deload" : "carga",
      frequencia: ehDeload ? Math.max(1, frequencia - 1) : frequencia,
      sessoes: montarSessoes(objetivo, nivel, ehDeload ? Math.max(1, frequencia - 1) : frequencia, modelo),
      nota: ehDeload ? "Semana de descarga: reduza volume e intensidade para recuperar." : undefined,
    });
  }
  return semanas;
}

/* ------------------------- Macrociclo por objetivo/nível ------------------------- */

// Foco dos blocos por posição (progressão da base à intensificação). Prática comum de
// periodização; a divisão exata é ajustável pelo profissional.
const FOCO_BLOCO_LINEAR = [
  { nome: "Base e adaptação", foco: "Construir tolerância ao volume e consolidar a técnica.", tv: "sobe" as Tendencia, ti: "estavel" as Tendencia },
  { nome: "Desenvolvimento", foco: "Aumentar a carga de trabalho e a qualidade do estímulo.", tv: "estavel" as Tendencia, ti: "sobe" as Tendencia },
  { nome: "Intensificação", foco: "Priorizar a intensidade, reduzindo o volume para render o pico.", tv: "reduz" as Tendencia, ti: "sobe" as Tendencia },
  { nome: "Consolidação", foco: "Sustentar os ganhos e preparar a próxima etapa.", tv: "estavel" as Tendencia, ti: "estavel" as Tendencia },
];

// As modalidades em foco do plano genérico refletem o que `montarSessoes` de fato monta:
// musculação em todo plano; caminhada entra quando o objetivo é emagrecimento (força + cardio).
function modalidadesDoObjetivo(objetivo: GpsObjetivo): string[] {
  return objetivo === "Emagrecimento" ? ["m-musculacao", "m-caminhada"] : ["m-musculacao"];
}

function montarMacrocicloGenerico(
  input: GerarPlanoInput,
  modelo: ModeloPeriodizacaoId,
): Macrociclo {
  const { objetivo, nivel, semanas, frequencia } = input;
  const faixa = getFaixa(objetivo);

  // Blocos de ~4 semanas (mínimo 3), no máximo 4 mesociclos.
  const nMeso = Math.min(4, Math.max(1, Math.round(semanas / 4)));
  const base = Math.floor(semanas / nMeso);
  const resto = semanas - base * nMeso;

  const mesociclos: Mesociclo[] = [];
  let cursor = 1;
  for (let m = 0; m < nMeso; m++) {
    const dur = base + (m < resto ? 1 : 0);
    const ini = cursor;
    const fim = cursor + dur - 1;
    cursor = fim + 1;
    const foco = FOCO_BLOCO_LINEAR[Math.min(m, FOCO_BLOCO_LINEAR.length - 1)];
    const ondul = modelo === "ondulatoria" || modelo === "flexivel" || modelo === "autorregulada";
    const comDeload = dur >= 4;

    mesociclos.push({
      id: nid("mes"),
      nome: foco.nome,
      foco: foco.foco,
      semanaInicio: ini,
      semanaFim: fim,
      capacidades: faixa.capacidades,
      tiposExercicio: faixa.tiposExercicio,
      modalidades: modalidadesDoObjetivo(objetivo),
      tendenciaVolume: ondul ? "varia" : foco.tv,
      tendenciaIntensidade: ondul ? "varia" : foco.ti,
      tendenciaComplexidade: m === 0 ? "estavel" : "sobe",
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
      microciclos: montarMicrociclos(objetivo, nivel, modelo, frequencia, ini, dur, comDeload),
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
  const nMeso = fasesUsadas.length;
  const base = Math.floor(semanas / nMeso);
  const resto = semanas - base * nMeso;

  const mesociclos: Mesociclo[] = [];
  let cursor = 1;
  fasesUsadas.forEach((fase, m) => {
    const dur = base + (m < resto ? 1 : 0);
    const ini = cursor;
    const fim = cursor + dur - 1;
    cursor = fim + 1;
    const comDeload = dur >= 4;
    mesociclos.push({
      id: nid("mes"),
      nome: `Fase ${fase.numero}: ${fase.nome}`,
      foco: fase.foco,
      semanaInicio: ini,
      semanaFim: fim,
      capacidades: [fase.objetivo, ...faixa.capacidades].slice(0, 4),
      tiposExercicio: faixa.tiposExercicio,
      // As modalidades em foco vêm da jornada já autorada do grupo, que varia por fase.
      modalidades: fase.modalidades,
      // `faseJornada` autoriza a palavra "Fase" na tela e alimenta a reconciliação com a
      // fase clínica do aluno (o número real da fase, não a posição no macro recortado).
      faseJornada: fase.numero,
      tendenciaVolume: m === 0 ? "estavel" : "sobe",
      tendenciaIntensidade: m === 0 ? "estavel" : "sobe",
      tendenciaComplexidade: m === 0 ? "estavel" : "sobe",
      deload: comDeload,
      reavaliacao: true,
      criteriosProgressao: fase.criteriosAvancar,
      criteriosRegressao: fase.criteriosRegredir,
      parametros: fase.parametros?.length ? fase.parametros : faixa.parametros,
      microciclos: montarMicrociclos(objetivo, nivel, modelo, frequencia, ini, dur, comDeload),
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

  const refIds = Array.from(new Set([...modP.refIds, ...faixa.refIds]));

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
