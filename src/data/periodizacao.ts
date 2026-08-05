/**
 * PERIODIZAÇÃO ("Prescrever treino"): modelo de dados do planejamento longitudinal
 * e a biblioteca de modelos, com base científica citada.
 *
 * Regras do produto que valem aqui:
 * - Nunca inventar número. Séries, repetições, intensidade, intervalo e deload saem de
 *   diretrizes CITADAS (ACSM 2009, Garber 2011, Schoenfeld) como FAIXAS; onde a evidência é
 *   fraca, o texto declara. Cada faixa carrega o `refId` que a sustenta.
 * - Linguagem prudente e NÃO diagnóstica: a ferramenta APOIA a decisão do profissional
 *   habilitado, não substitui a conduta clínica do profissional de saúde. Sem travessão em texto visível.
 */

import type { GpsObjetivo } from "@/lib/gps/engine";
import type { Nivel } from "@/data/types";
import type { Execucao } from "@/data/execucao";

/* ============================ Árvore do plano (persistida) ============================ */

/** Um exercício ou modalidade dentro de uma sessão, com os parâmetros editáveis. */
/**
 * Método de série (técnica de intensidade). São definições consagradas de
 * treinamento; a descrição diz apenas COMO executar, sem inventar número. O
 * profissional escolhe o método por bloco; o aluno vê a instrução no portal.
 */
export type MetodoSerie =
  | "tradicional"
  | "bi-set"
  | "tri-set"
  | "super-set"
  | "drop-set"
  | "rest-pause"
  | "piramide"
  | "myo-reps"
  | "cluster"
  | "pre-exaustao";

export interface MetodoInfo {
  id: MetodoSerie;
  nome: string;
  /** instrução curta de execução (sem número inventado) */
  descricao: string;
}

export const METODOS_SERIE: MetodoInfo[] = [
  { id: "tradicional", nome: "Tradicional", descricao: "Séries com descanso completo entre elas." },
  { id: "bi-set", nome: "Bi-set", descricao: "Dois exercícios em sequência, sem descanso entre eles; descanso só ao fim do par." },
  { id: "tri-set", nome: "Tri-set", descricao: "Três exercícios em sequência, sem descanso entre eles." },
  { id: "super-set", nome: "Super-set", descricao: "Dois exercícios de músculos antagonistas em sequência, sem descanso entre eles." },
  { id: "drop-set", nome: "Drop-set", descricao: "Ao chegar à falha, reduz a carga e continua sem descanso, por um ou mais estágios." },
  { id: "rest-pause", nome: "Rest-pause", descricao: "Leva a série próximo da falha, faz pausas curtas e retoma, acumulando repetições." },
  { id: "piramide", nome: "Pirâmide", descricao: "A carga sobe (ou desce) a cada série, ajustando as repetições na direção oposta." },
  { id: "myo-reps", nome: "Myo-reps", descricao: "Uma série de ativação até perto da falha, seguida de mini-séries com pausas curtas." },
  { id: "cluster", nome: "Cluster", descricao: "Divide a série em blocos curtos com pausas intra-série, mantendo a qualidade das repetições." },
  { id: "pre-exaustao", nome: "Pré-exaustão", descricao: "Um exercício de isolamento antes do composto, para fatigar o músculo-alvo primeiro." },
];

export const getMetodo = (id?: MetodoSerie): MetodoInfo | undefined =>
  id ? METODOS_SERIE.find((m) => m.id === id) : undefined;

export interface BlocoSessao {
  id: string;
  /** técnica de série do bloco (bi-set, drop-set...); ausente = tradicional */
  metodo?: MetodoSerie;
  /** agrupa blocos que se executam juntos (bi-set/super-set/tri-set) */
  grupoMetodo?: string;
  /**
   * Que tipo de trabalho o bloco carrega. Força e aeróbio se prescrevem por variáveis
   * DIFERENTES: força por séries × repetições × carga × intervalo; aeróbio por formato,
   * duração e intensidade (percentual da FCmáx, watts ou pace). Por isso cada tipo usa o
   * seu conjunto de campos abaixo, e não os da musculação para tudo.
   */
  tipo?: "forca" | "aerobio";
  /** slug de exercício (src/data/exercises) OU id de modalidade (src/data/modalities) */
  exercicioSlug?: string;
  modalidade?: string;
  /** rótulo livre quando não vem de um exercício catalogado (ex.: "Mobilidade de quadril") */
  nome?: string;
  /**
   * Quando o bloco nasceu de uma Prescricao (tubo "Aplicar no treino"), guarda o id dela.
   * Aditivo e opcional: alimenta o selo "da prescrição de {data}" e o vínculo reverso
   * DERIVADO (nunca gravado na Prescricao). Ver src/lib/gps/semear.ts.
   */
  origemPrescricaoId?: string;
  // --- Força (tipo "forca"): faixas como texto ("3 a 4", "8 a 12", "60 a 75% 1RM ou RPE 7-8", "60 a 90 s") ---
  series?: string;
  reps?: string;
  intensidade?: string;
  intervalo?: string;
  /**
   * ALVO CONCRETO da semana (onda MP-3), sempre DENTRO da faixa-texto acima, que permanece
   * como referência ao lado. Todos opcionais e aditivos: um plano antigo (sem alvo) cai na
   * faixa por fallback (`seriesAlvo ?? meio(series)`), e nada aqui muda os campos-texto nem a
   * conferência de faixa. A DIREÇÃO do alvo vem da tendência do mesociclo; nenhum número é
   * inventado (ver src/lib/gps/alvo.ts e o rulepack src/data/regrasProgressao.ts).
   */
  /** número de séries-alvo da semana (dentro da faixa `series`) */
  seriesAlvo?: number;
  /** repetições-alvo da semana (dentro da faixa `reps`) */
  repsAlvo?: number;
  /** repetições de reserva alvo (RIR); menor = mais perto da falha */
  rirAlvo?: number;
  /** carga relativa alvo em %1RM, quando a faixa expressa isso (ex.: resistência 40 a 60%) */
  cargaRelativaAlvo?: number;
  /** intervalo-alvo entre séries, em segundos (dentro da faixa `intervalo`) */
  intervaloAlvoSeg?: number;
  /** id da RegraProgressao (src/data/regrasProgressao.ts) que fundamenta a direção do alvo */
  origemRegraId?: string;
  // --- Aeróbio (tipo "aerobio"): a intensidade acima é reaproveitada (percentual da FCmáx, RPE ou zona) ---
  /** "Contínuo" ou "Intervalado" */
  formato?: string;
  /** tempo total do trabalho ("20 a 40 min") */
  duracao?: string;
  /** recuperação entre tiros no intervalado ("2 min em ritmo leve"); "-" no contínuo */
  recuperacao?: string;
  observacao?: string;
  /**
   * ALVO CONCRETO do aeróbio na semana (onda MP-4), sempre DENTRO das faixas-texto acima
   * (duração e intensidade), que permanecem como referência ao lado. Todos opcionais e
   * aditivos: um plano antigo (sem alvo) cai na faixa por fallback, e nada aqui muda os
   * campos-texto. A DIREÇÃO vem da tendência do mesociclo; o VOLUME (duração) progride antes
   * da intensidade (regra declarada aerobio-progressao-fittvp). A zona de FC só entra quando
   * há idade e FCrep medida (regras aerobio-fcmax-estimada e aerobio-zona-karvonen); sem esses
   * dados, o alvo guia por duração + esforço percebido (PSE), sem inventar zona.
   * Ver src/lib/gps/alvo.ts (alvoAerobioSemana) e o rulepack src/data/regrasProgressao.ts.
   */
  /** duração-alvo da semana, em minutos (dentro da faixa `duracao`) */
  duracaoAlvoMin?: number;
  /** esforço percebido alvo (PSE), escala 0 a 10, dentro da faixa citada na intensidade */
  rpeAlvo?: number;
  /** zona-alvo de frequência cardíaca em bpm ("129 a 153 bpm"); só com idade + FCrep medida */
  zonaFC?: string;
  /**
   * A fração da reserva de FC EQUIVALENTE à zona em bpm, derivada dela para leitura.
   *
   * Não é uma prescrição por Karvonen: a zona nasce do percentual da FCmáx citado pela
   * diretriz, e esta fração é a conversão. Os dois métodos discordam quando a FCrep é alta,
   * e chamar isto de "zona de Karvonen" era rótulo errado num documento assinável.
   * Só existe com idade e FCrep MEDIDA.
   */
  percentFCRAlvo?: { min: number; max: number };
  /** velocidade-alvo (esteira/corrida), quando o profissional a define; não derivada pelo motor */
  velocidade?: string;
  /** inclinação-alvo (esteira), quando o profissional a define; não derivada pelo motor */
  inclinacao?: string;
}

export interface Sessao {
  id: string;
  /** rótulo do dia/sessão (ex.: "Sessão A - inferiores", "Cardio contínuo") */
  nome: string;
  foco?: string;
  blocos: BlocoSessao[];
  /**
   * Fecho de flexibilidade da sessão (onda F, princípio da variabilidade): um alongamento
   * curto dos principais grupos trabalhados, ao final. Texto de exibição (sem número
   * inventado além do citado por garber-2011), NÃO é um BlocoSessao: não entra em
   * séries/repetições/carga nem nos guardrails de faixa/progressão, é só o fecho da sessão.
   * Aditivo e opcional: sessões antigas ficam sem ele. Renderizado no editor, no PDF e no
   * app do aluno, ao lado dos blocos.
   */
  fecho?: string;
}

/**
 * Segmento de blocos para desenhar: um GRUPO (bi/tri/super-set) que se executa junto, ou
 * um bloco SOLO. Fonte única de agrupamento visual para a tela, o PDF e o app do aluno,
 * para os três lerem o mesmo par "faça em dupla, sem descanso entre eles".
 */
export type SegmentoBlocos =
  | { tipo: "grupo"; grupoId: string; metodo: MetodoSerie; blocos: BlocoSessao[] }
  | { tipo: "solo"; bloco: BlocoSessao };

/**
 * Agrupa blocos CONSECUTIVOS que compartilham o mesmo `grupoMetodo` (o par de um bi-set,
 * o trio de um tri-set); os demais saem soltos. Um grupo de um bloco só (dado inconsistente)
 * vira solo, para nunca desenhar um colchete de item único.
 */
export function agruparBlocosPorMetodo(blocos: BlocoSessao[]): SegmentoBlocos[] {
  const segmentos: SegmentoBlocos[] = [];
  let i = 0;
  while (i < blocos.length) {
    const grupoId = blocos[i].grupoMetodo;
    if (grupoId) {
      const grupo: BlocoSessao[] = [];
      while (i < blocos.length && blocos[i].grupoMetodo === grupoId) {
        grupo.push(blocos[i]);
        i++;
      }
      if (grupo.length >= 2) {
        segmentos.push({ tipo: "grupo", grupoId, metodo: grupo[0].metodo ?? "bi-set", blocos: grupo });
        continue;
      }
      segmentos.push({ tipo: "solo", bloco: grupo[0] });
      continue;
    }
    segmentos.push({ tipo: "solo", bloco: blocos[i] });
    i++;
  }
  return segmentos;
}

export type TipoMicrociclo = "carga" | "deload" | "teste";

/** Uma semana do plano. */
export interface Microciclo {
  id: string;
  semana: number;
  tipo: TipoMicrociclo;
  frequencia: number;
  sessoes: Sessao[];
  nota?: string;
  /**
   * Objetivo declarado da semana (onda MP-3), em uma frase curta derivada da fase, da
   * tendência do mesociclo e do tipo da semana (carga/descarga). Aditivo e opcional: planos
   * antigos ficam sem ele. É texto de exibição, sem travessão.
   */
  objetivo?: string;
}

export type Tendencia = "sobe" | "estavel" | "reduz" | "varia";

/** Variável de treino que o profissional pode TRAVAR num mesociclo (não deixa progredir). */
export type VariavelTravavel = "volume" | "intensidade" | "complexidade";

/** Rótulos de exibição das tendências (fonte única; "estável" com acento, nunca o enum cru). */
export const TEND_LABEL: Record<Tendencia, string> = { sobe: "sobe", reduz: "reduz", estavel: "estável", varia: "varia" };

/** Um bloco de semanas com um foco. Vira mesociclo do macrociclo. */
export interface Mesociclo {
  id: string;
  nome: string;
  foco: string;
  semanaInicio: number;
  semanaFim: number;
  capacidades: string[];
  tiposExercicio: string[];
  /** ids de modalidades (src/data/modalities) em foco na fase; alimenta os ícones do gráfico */
  modalidades?: string[];
  tendenciaVolume: Tendencia;
  tendenciaIntensidade: Tendencia;
  tendenciaComplexidade: Tendencia;
  /**
   * Fase da jornada de um grupo especial que originou este mesociclo (1 a 4). Só existe
   * quando o bloco NASCE de uma fase (montarMacrocicloGrupo); ausente nos mesociclos
   * genéricos. É o que autoriza a palavra "Fase" na tela (decisão travada 17).
   * `fase.numero` já é tipado 1|2|3|4 em specialGroups.ts.
   */
  faseJornada?: 1 | 2 | 3 | 4;
  /**
   * Variáveis que o profissional TRAVOU neste bloco (critérios 15 e 16 do motor). Uma variável
   * travada NÃO progride: o motor do alvo (src/lib/gps/alvo.ts) a congela no patamar da primeira
   * semana de carga e as sugestões responsivas (src/lib/gps/renovarMicrociclo.ts) não a fazem
   * subir. Aditivo e opcional: ausente = nada travado, e o alvo fica byte-idêntico ao gerado (a
   * geração e os guardrails nunca passam travas). Recálculo do bloco em src/lib/gps/travas.ts.
   */
  variaveisTravadas?: VariavelTravavel[];
  /** semana de recuperação/descarga ao final do bloco, quando houver */
  deload?: boolean;
  /** ponto de reavaliação sugerido ao final do bloco */
  reavaliacao?: boolean;
  criteriosProgressao: string[];
  criteriosRegressao: string[];
  /** ids de monitoringParameters a acompanhar no bloco */
  parametros: string[];
  microciclos: Microciclo[];
}

export interface Macrociclo {
  objetivoGeral: string;
  semanas: number;
  mesociclos: Mesociclo[];
}

export interface PlanoTreino {
  id: string;
  alunoId: string;
  data: number;
  titulo: string;
  objetivo: GpsObjetivo;
  /**
   * Segundo objetivo do aluno, quando ele tem um (src/lib/gps/objetivos.ts). O primario
   * continua mandando na faixa e na dose; o secundario so DESEMPATA a selecao de
   * exercicios e aparece no documento. Ausente = plano byte-identico ao de antes.
   */
  objetivoSecundario?: GpsObjetivo;
  nivel: Nivel;
  semanas: number;
  frequenciaSemanal: number;
  /** disponibilidade descrita pelo profissional (ex.: "seg/qua/sex, 60 min") */
  disponibilidade?: string;
  modeloId: ModeloPeriodizacaoId;
  /** modelo alternativo, quando a evidência sustenta mais de uma estratégia */
  modeloAltId?: ModeloPeriodizacaoId;
  grupoEspecial?: string;
  /**
   * As demais condições declaradas do aluno no momento da geração. Fica GRAVADA no plano,
   * e não só no aluno, porque o plano é um documento assinável: seis meses depois é preciso
   * saber o que o motor considerou quando gerou, mesmo que o perfil do aluno tenha mudado.
   */
  condicoesAtencao?: string[];
  macrociclo: Macrociclo;
  /** alternativa gerada (opção 2), quando existir */
  alternativa?: Macrociclo;
  /** rastro do raciocínio (por que este modelo, faixas, cuidados) */
  raciocinio: string;
  /** ids de referências (src/data/referencias) que sustentam o plano */
  refIds: string[];
  status: "ativo" | "arquivado";
}

/* ========================= Onde o plano está hoje (derivado) ========================= */

const SEMANA_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Em que semana o plano está, contando desde a data em que ele foi montado.
 *
 * É uma contagem de calendário, não um registro de presença: o sistema não sabe se o
 * aluno treinou. Por isso a tela sempre diz "desde tal data", em vez de afirmar que o
 * aluno cumpriu N semanas.
 */
/**
 * Os horizontes de calendário oferecidos ao montar um plano.
 *
 * O profissional pensa em "trimestral", não em "12". Vive na camada de dados, e não na
 * página, porque o PDF e o cabeçalho do plano precisam nomear o mesmo horizonte que o botão
 * escolheu: quando isso morava só na tela, o documento saía dizendo "48 semanas" onde o
 * profissional tinha escolhido "Anual".
 *
 * O BIMESTRAL entrou por pedido de campo: um professor que trabalha com consultoria monta
 * ciclos de 8 semanas, e o produto só ia de 4 para 12.
 */
export const HORIZONTES_PLANO = [
  { id: "mensal", rotulo: "Mensal", semanas: 4 },
  { id: "bimestral", rotulo: "Bimestral", semanas: 8 },
  { id: "trimestral", rotulo: "Trimestral", semanas: 12 },
  { id: "semestral", rotulo: "Semestral", semanas: 24 },
  { id: "anual", rotulo: "Anual", semanas: 48 },
] as const;

/**
 * O nome do horizonte de um plano pela duração dele. Devolve `undefined` quando a duração
 * não corresponde a nenhum horizonte nomeado (plano editado à mão), e aí a tela mostra só
 * as semanas, sem inventar um nome que não é verdade.
 */
export function rotuloHorizonte(semanas: number): string | undefined {
  return HORIZONTES_PLANO.find((h) => h.semanas === semanas)?.rotulo;
}

export function semanaAtual(plano: PlanoTreino, agora = Date.now()): number {
  const passadas = Math.floor((agora - plano.data) / SEMANA_MS);
  return Math.min(plano.semanas, Math.max(1, passadas + 1));
}

/** O mesociclo que cobre a semana de hoje. */
export function mesocicloAtual(plano: PlanoTreino, agora = Date.now()): Mesociclo | undefined {
  const s = semanaAtual(plano, agora);
  return plano.macrociclo.mesociclos.find((m) => s >= m.semanaInicio && s <= m.semanaFim);
}

/** As sessões da semana em que o plano está hoje (semana pelo calendário). */
export function sessoesDeHoje(plano: PlanoTreino, agora = Date.now()): Sessao[] {
  const semana = semanaAtual(plano, agora);
  const micro = plano.macrociclo.mesociclos.flatMap((m) => m.microciclos).find((mc) => mc.semana === semana);
  return micro?.sessoes ?? [];
}

/**
 * Índice da "sessão de hoje" dentro da semana atual: a primeira sessão ainda não
 * concluída (todos os blocos registrados nesta semana). Se todas foram feitas (ou
 * não há registro), cai na primeira. É a MESMA regra que o app do aluno usa para
 * abrir o treino do dia; extraída aqui para que o "personalizar o treino do dia"
 * mire exatamente a sessão que o aluno vê aberta, sem os dois divergirem.
 */
export function sessaoDeHojeIndex(plano: PlanoTreino, execucoes: Execucao[], agora = Date.now()): number {
  const semana = semanaAtual(plano, agora);
  const sessoes = sessoesDeHoje(plano, agora);
  const concluida = (s: Sessao) =>
    s.blocos.length > 0 && s.blocos.every((b) => execucoes.some((e) => e.semana === semana && e.blocoRef === b.id));
  const i = sessoes.findIndex((s) => !concluida(s));
  return i === -1 ? 0 : i;
}

/**
 * Rótulo de EXIBIÇÃO de um mesociclo (nunca toca o nome persistido).
 *
 * Mesociclo nascido de uma fase da jornada (com `faseJornada`) já traz "Fase N: ..."
 * no nome e a palavra "Fase" é verdadeira: vale como está. Um mesociclo genérico não
 * pode exibir a palavra "Fase" como se fosse fase clínica; onde um plano antigo de
 * grupo gravou o prefixo "Fase N:", ele é limpo só para exibir. O PDF continua
 * imprimindo o nome como está gravado.
 */
export function rotuloMeso(meso: Mesociclo, _indice?: number): string {
  // Mesociclo nascido de fase (com `faseJornada`) já traz "Fase N: ..." verdadeiro no nome.
  if (meso.faseJornada) return meso.nome;
  return meso.nome.replace(/^Fase \d+:\s*/, "");
}

/**
 * Rótulo de EXIBIÇÃO do "onde estou" (eyebrow do bloco corrente): mesociclo nascido de
 * uma fase da jornada é "Fase atual" (a palavra é verdadeira); um bloco genérico não pode
 * exibir "Fase" como se fosse fase clínica, então diz "Bloco atual". Fonte única usada no
 * portal do aluno e onde mais o eyebrow aparecer.
 */
export function rotuloPosicao(meso: Mesociclo): string {
  return meso.faseJornada ? "Fase atual" : "Bloco atual";
}

/** A próxima reavaliação marcada no plano que ainda não passou. */
export function proximaReavaliacao(
  plano: PlanoTreino,
  agora = Date.now(),
): { semana: number; em: number } | undefined {
  const s = semanaAtual(plano, agora);
  const meso = plano.macrociclo.mesociclos.find((m) => m.reavaliacao && m.semanaFim >= s);
  if (!meso) return undefined;
  return { semana: meso.semanaFim, em: plano.data + meso.semanaFim * SEMANA_MS };
}

/* ============================== Biblioteca de modelos ============================== */

export type ModeloPeriodizacaoId =
  | "linear"
  | "ondulatoria"
  | "blocos"
  | "flexivel"
  | "autorregulada";

export interface ModeloPeriodizacao {
  id: ModeloPeriodizacaoId;
  nome: string;
  resumo: string;
  comoFunciona: string;
  racionalCientifico: string;
  perfisIndicados: string[];
  variaveisControladas: string[];
  pontosFortes: string[];
  limitacoes: string[];
  errosComuns: string[];
  /** ids de referências (src/data/referencias) */
  refIds: string[];
  /** aula do Aprender que aprofunda o modelo */
  aprenderHref?: string;
}

export const MODELOS_PERIODIZACAO: ModeloPeriodizacao[] = [
  {
    id: "linear",
    nome: "Periodização linear",
    resumo: "Progressão gradual de mais volume e menos intensidade para menos volume e mais intensidade ao longo de blocos.",
    comoFunciona:
      "O plano parte de um bloco com mais volume e intensidade menor e caminha, ao longo de semanas a meses, para menos volume e intensidade maior, com uma descarga ao final de cada bloco. A ênfase muda aos poucos, de forma previsível.",
    racionalCientifico:
      "Segue a lógica de acumular capacidade primeiro e intensificar depois. Meta-análises mostram que treino periodizado supera o não periodizado para força; entre os modelos, as diferenças costumam ser pequenas quando o volume é equiparado.",
    perfisIndicados: [
      "Iniciantes, pela simplicidade e clareza",
      "Objetivos com um pico definido no tempo",
      "Quem prefere uma estrutura fácil de comunicar e acompanhar",
    ],
    variaveisControladas: ["Volume ao longo dos blocos", "Intensidade ao longo dos blocos", "Descarga entre blocos"],
    pontosFortes: [
      "Estrutura simples e previsível",
      "Fácil de comunicar ao aluno e de acompanhar",
      "Boa porta de entrada para quem está começando",
    ],
    limitacoes: [
      "Menos variação dentro da semana pode subestimular pessoas já treinadas",
      "Trabalha um objetivo principal por vez",
    ],
    errosComuns: [
      "Seguir o modelo à risca, ignorando a resposta e a rotina real do aluno",
      "Esquecer a semana de descarga ao final dos blocos",
    ],
    refIds: ["acsm-progressao-2009", "moesgaard-periodizacao-2022"],
    aprenderHref: "/aprender/conteudos/planejamento-e-periodizacao--linear-ondulatoria",
  },
  {
    id: "ondulatoria",
    nome: "Periodização ondulatória",
    resumo: "Varia volume e intensidade com frequência, muitas vezes dentro da mesma semana, alternando ênfases.",
    comoFunciona:
      "Em vez de mudar aos poucos, o plano alterna sessões com ênfases diferentes (por exemplo, um dia mais pesado, outro mais moderado, outro mais controlado), variando volume e intensidade ao longo da semana ou entre semanas.",
    racionalCientifico:
      "A variação frequente permite estimular força e hipertrofia em paralelo. Em pessoas já treinadas, a ondulatória tende a superar a linear para força máxima; em iniciantes essa vantagem não aparece, e para hipertrofia, com volume equiparado, os modelos se equivalem.",
    perfisIndicados: [
      "Intermediários e avançados",
      "Quem busca força e hipertrofia em paralelo",
      "Rotinas com poucos dias na semana, para aproveitar cada sessão",
    ],
    variaveisControladas: ["Ênfase por sessão", "Volume e intensidade dentro da semana", "Distribuição das qualidades"],
    pontosFortes: [
      "Estimula força e hipertrofia ao mesmo tempo",
      "Reduz a monotonia e sustenta a adesão",
      "Aproveita bem semanas com poucos dias",
    ],
    limitacoes: [
      "Pede um pouco mais de organização e entendimento do aluno",
      "A vantagem sobre a linear não aparece em iniciantes",
    ],
    errosComuns: [
      "Variar sem uma lógica clara de ênfases",
      "Não equiparar o volume total ao comparar com outro modelo",
    ],
    refIds: ["moesgaard-periodizacao-2022", "acsm-progressao-2009"],
    aprenderHref: "/aprender/conteudos/planejamento-e-periodizacao--linear-ondulatoria",
  },
  {
    id: "blocos",
    nome: "Periodização em blocos",
    resumo: "Blocos sequenciais com foco concentrado em uma qualidade por vez (acúmulo, transformação, realização).",
    comoFunciona:
      "O plano concentra o estímulo em uma qualidade por bloco: primeiro acúmulo de capacidade e volume, depois transformação em força ou potência, depois realização e pico, com manutenção mínima das demais qualidades entre os blocos.",
    racionalCientifico:
      "Concentrar a carga em poucas qualidades por vez busca um estímulo mais potente e uma gestão de fadiga entre blocos. É consagrado no esporte de rendimento; a evidência comparativa direta com outros modelos ainda é limitada e vem sobretudo de atletas.",
    perfisIndicados: [
      "Avançados com boa base",
      "Atletas com calendário de competição",
      "Quem precisa de um pico em um momento definido",
    ],
    variaveisControladas: ["Qualidade enfatizada por bloco", "Concentração de carga", "Fadiga entre blocos"],
    pontosFortes: [
      "Concentra o estímulo em uma qualidade por vez",
      "Ajuda a organizar picos de desempenho",
      "Gestão clara da fadiga entre blocos",
    ],
    limitacoes: [
      "Evidência sobretudo em atletas; comparações diretas ainda limitadas",
      "Mais complexo de montar e comunicar",
      "Risco de destreinar a qualidade que não está em foco",
    ],
    errosComuns: [
      "Blocos longos demais, que deixam cair as outras qualidades",
      "Ignorar a manutenção mínima do que não está sendo enfatizado",
    ],
    refIds: ["issurin-blocos-2016", "issurin-periodizacao-2010", "moesgaard-periodizacao-2022"],
    aprenderHref: "/aprender/conteudos/planejamento-e-periodizacao--blocos",
  },
  {
    id: "flexivel",
    nome: "Periodização flexível",
    resumo: "A ênfase de cada sessão é escolhida conforme a disponibilidade e a vida real do aluno, dentro do plano.",
    comoFunciona:
      "O plano define as ênfases possíveis da semana, mas a ordem e a escolha da sessão do dia se ajustam ao que é viável (dias disponíveis, sono, agenda). Quando falta um dia, o profissional escolhe a ênfase que mais protege o resultado.",
    racionalCientifico:
      "Prioriza a adesão e a realidade do aluno, que são determinantes do resultado no longo prazo. É uma variação organizada da ondulatória, com a ordem ajustável; a evidência específica está em crescimento.",
    perfisIndicados: [
      "Rotinas imprevisíveis, com dias que variam",
      "Alunos da população geral, fora do alto rendimento",
      "Quem falha treinos com frequência por agenda",
    ],
    variaveisControladas: ["Ênfase escolhida por sessão", "Ordem das sessões", "Ajuste à disponibilidade real"],
    pontosFortes: [
      "Protege o resultado quando faltam dias",
      "Favorece a adesão e o realismo do plano",
      "Mantém estímulo mesmo com agenda instável",
    ],
    limitacoes: [
      "Exige critério do profissional para a escolha do dia",
      "Menos previsível de acompanhar",
    ],
    errosComuns: [
      "Virar 'treinar por impulso' e perder a estrutura",
      "Não garantir o estímulo mínimo de cada qualidade na semana",
    ],
    refIds: ["mcnamara-flexivel-2010", "acsm-progressao-2009"],
    aprenderHref: "/aprender/conteudos/planejamento-e-periodizacao--flexivel",
  },
  {
    id: "autorregulada",
    nome: "Periodização autorregulada",
    resumo: "A carga do dia se ajusta à prontidão do aluno, usando percepção de esforço e repetições de reserva.",
    comoFunciona:
      "As faixas de carga e proximidade da falha são planejadas, mas a carga de cada série é ajustada no dia pela resposta do aluno (percepção de esforço, repetições de reserva, velocidade), respeitando um teto de esforço definido.",
    racionalCientifico:
      "Ajustar a carga ao estado diário individualiza o estímulo e ajuda a manter a proximidade da falha desejada sem exigir sempre a carga máxima. A percepção de esforço e as repetições de reserva são ferramentas úteis de controle de carga; a evidência de superioridade ainda é limitada, e a própria revisão que a mapeia aponta terminologia inconsistente entre os estudos.",
    perfisIndicados: [
      "Quem já entende e sabe usar percepção de esforço ou repetições de reserva",
      "Intermediários e avançados",
      "Fases com fadiga e sono variáveis",
    ],
    variaveisControladas: ["Carga ajustada por percepção de esforço ou repetições de reserva", "Proximidade da falha", "Fadiga do dia"],
    pontosFortes: [
      "Individualiza a carga ao estado diário",
      "Ajuda a gerir fadiga sem depender de carga fixa",
      "Ensina o aluno a ler o próprio esforço",
    ],
    limitacoes: [
      "Exige aprender e calibrar a escala de esforço",
      "Menos determinístico e previsível",
    ],
    errosComuns: [
      "Usar percepção de esforço sem calibrar com o aluno",
      "Confundir autorregulação com treinar sempre até a falha",
    ],
    refIds: ["greig-autorregulacao-2020", "zourdos-rir-2016", "acsm-progressao-2009"],
    aprenderHref: "/aprender/conteudos/planejamento-e-periodizacao--autorregulada",
  },
];

export function getModelo(id: ModeloPeriodizacaoId): ModeloPeriodizacao {
  return MODELOS_PERIODIZACAO.find((m) => m.id === id) ?? MODELOS_PERIODIZACAO[0];
}

/* ===================== Faixas de treino por objetivo (ACSM 2009 + Garber 2011) ===================== */

/**
 * Uma variável da diretriz (séries, repetições, intensidade, intervalo).
 *
 * `valor` é curto porque ele nasce dentro do campo editável do plano: o profissional
 * precisa enxergar "3 a 4" no campo, não um parágrafo. O que a diretriz diz além do
 * número vive em `nota`, que aparece ao lado como referência e não vira prescrição.
 */
export interface FaixaVar {
  /** faixa curta e editável, nunca um número solto (ex.: "3 a 4") */
  valor: string;
  /** quando a diretriz separa por nível (ex.: repetições na Força) */
  porNivel?: Record<Nivel, string>;
  /** complemento da diretriz que não cabe no campo */
  nota?: string;
}

/** Variação de repetições/intensidade entre as sessões da semana (ondulatória). */
export interface EnfaseSessao {
  rotulo: string;
  reps: string;
  intensidade: string;
}

/**
 * Componente aeróbio COMPLEMENTAR do objetivo (onda F, princípio da variabilidade). TODOS os
 * objetivos recebem um aeróbio complementar em 1 a 2 sessões da semana, com dose MENOR que a
 * base do Emagrecimento; o foco do objetivo não muda (força prioriza carga, resistência
 * prioriza reps). O Emagrecimento é a exceção: ali o aeróbio é BASE (não complemento), então
 * ele não usa este campo. O alvo por semana progride via alvoAerobioSemana, dentro da faixa
 * citada. Nenhum número sem referência real.
 */
export interface ComplementoAerobio {
  /** faixa de duração citada, menor que a base do Emagrecimento (ex.: "15 a 25 min") */
  duracao: string;
  /** texto de intensidade (percentual da FCmáx + PSE), citado, no mesmo padrão da base */
  intensidade: string;
  /** id/rótulo de modalidade (ex.: "caminhada"); baixo impacto e universal por padrão */
  modalidade: string;
  /** sessões da semana que recebem o complemento (1 a 2), para não competir com o foco */
  sessoesPorSemana: 1 | 2;
  /** ids de referências (src/data/referencias) que sustentam o complemento */
  refIds: string[];
  /** nota de aplicação prudente; declara o que é cautela nossa (a divisão por sessão) */
  nota: string;
}

/** Fecho de flexibilidade do objetivo (onda F): o texto do fecho da sessão, citado. */
export interface ComplementoFlexibilidade {
  /** texto do fecho, sem número inventado além do citado por garber-2011 */
  texto: string;
  /** ids de referências (src/data/referencias) que sustentam a flexibilidade */
  refIds: string[];
}

/** Faixas por objetivo, expressas como TEXTO (nunca um número solto inventado). */
export interface FaixaObjetivo {
  objetivo: GpsObjetivo;
  capacidades: string[];
  tiposExercicio: string[];
  series: FaixaVar;
  reps: FaixaVar;
  intensidade: FaixaVar;
  intervalo: FaixaVar;
  /** frequência semanal sugerida por nível (faixa textual) */
  frequencia: Record<Nivel, string>;
  /**
   * Ênfases da semana ondulatória, dentro da faixa do PRÓPRIO objetivo. Só existem onde
   * a variação diária faz sentido (força e hipertrofia em quem já treina). Sem isto, um
   * plano de emagrecimento herdaria repetições de força, que não é o que a diretriz diz.
   */
  enfases?: EnfaseSessao[];
  /** parâmetros de monitoringParameters a acompanhar */
  parametros: string[];
  refIds: string[];
  /** ressalva honesta do que a evidência sustenta ou não */
  ressalva: string;
  /**
   * Aeróbio complementar do objetivo (variabilidade). Ausente no Emagrecimento, que já tem
   * o aeróbio como BASE. O gerador entra com um bloco `tipo: "aerobio"` progressivo por
   * semana; a fonte é a mesma dos aeróbios de hoje (assinaturaSemana/agregadoSemana).
   */
  complementoAerobio?: ComplementoAerobio;
  /** Fecho de flexibilidade da sessão, presente em todos os objetivos. */
  flexibilidade?: ComplementoFlexibilidade;
}

/**
 * Fecho de flexibilidade padrão (onda F): mesmo texto para todos os objetivos, porque a
 * recomendação (alongar os grupos trabalhados na própria sessão) é geral. Cortes de tempo e
 * frequência são os da diretriz do ACSM (garber-2011), não inventados.
 */
export const FLEX_FECHO: ComplementoFlexibilidade = {
  texto:
    "Fecho de flexibilidade: ao final, alongue os principais grupos trabalhados na sessão, cerca de 60 s por grupo, com respiração contínua e sem forçar amplitude com dor. Diretriz do ACSM (Garber, 2011): flexibilidade em pelo menos 2 dias por semana, para manter a amplitude articular.",
  refIds: ["garber-2011"],
};

/**
 * Complemento aeróbio padrão (onda F): dose MENOR que a base do Emagrecimento ("20 a 40 min"),
 * em 1 a 2 sessões da semana. O alvo semanal de referência (>= 150 min moderados) é do ACSM
 * (garber-2011); a divisão em uma dose menor por sessão é escolha prudente de complemento,
 * declarada como cautela, para somar ao foco do objetivo sem competir com ele.
 */
export function complementoAerobioPadrao(sessoesPorSemana: 1 | 2): ComplementoAerobio {
  return {
    duracao: "15 a 25 min",
    intensidade: "Moderada: cerca de 64 a 76% da FCmáx (teste da conversa; RPE 5 a 6 de 10)",
    // Id CANONICO da modalidade. Sem o prefixo, getModalidade nao resolve, e o mesmo bloco
    // saia como "Caminhada" no app do aluno e como "Aerobio" no PDF e no editor.
    modalidade: "m-caminhada",
    sessoesPorSemana,
    refIds: ["garber-2011"],
    nota: "Componente aeróbio complementar (princípio da variabilidade). O alvo semanal de referência é o do ACSM (Garber, 2011): pelo menos 150 min por semana de intensidade moderada. A dose menor por sessão, em 1 a 2 sessões, é escolha prudente de complemento, para somar ao foco do objetivo sem competir com ele; a duração progride antes da intensidade.",
  };
}

/** O valor que vale para este nível (a diretriz às vezes separa iniciante do resto). */
export function valorFaixa(v: FaixaVar, nivel: Nivel): string {
  return v.porNivel?.[nivel] ?? v.valor;
}

export const FAIXAS_TREINO: Record<GpsObjetivo, FaixaObjetivo> = {
  Hipertrofia: {
    objetivo: "Hipertrofia",
    capacidades: ["Hipertrofia", "Força de base", "Tolerância ao volume"],
    tiposExercicio: ["Multiarticulares primeiro", "Uniarticulares como complemento"],
    series: { valor: "3 a 4", nota: "por exercício; volume maior tende a favorecer, dentro da tolerância" },
    // A nota é lida pelo conferidor de faixa como UNIÃO numérica (ver src/lib/gps/faixas.ts),
    // então ela não pode conter dígito que não seja dose: ano de publicação aqui vira faixa.
    // O nome do autor sozinho também não bastava, porque a bibliografia tem DOIS Schoenfeld de
    // 2017 e a citação ficava ambígua; quem identifica o trabalho é o refId da faixa.
    reps: { valor: "6 a 12", nota: "a zona de 6 a 12 RM é a do position stand citado; a metanálise de carga baixa contra alta mostra que a hipertrofia se iguala num amplo espectro de cargas quando as séries vão perto da falha, o que amplia a faixa útil para 6 a 20 repetições. A ponta superior é leitura prudente da casa, não número dos estudos" },
    intensidade: { valor: "moderada a alta", nota: "próxima da falha; a escala de repetições de reserva (Zourdos, 2016) é o instrumento de controle. A faixa de 1 a 3 de reserva é escolha prudente da casa, não número de diretriz" },
    intervalo: { valor: "1 a 2 min" },
    frequencia: { Iniciante: "2 a 3x/sem", Intermediário: "3 a 4x/sem", Avançado: "4 a 5x/sem" },
    enfases: [
      { rotulo: "pesado", reps: "6 a 8", intensidade: "alta, 1 a 2 repetições de reserva" },
      { rotulo: "moderado", reps: "8 a 12", intensidade: "moderada a alta, 1 a 3 repetições de reserva" },
      { rotulo: "controlado", reps: "12 a 15", intensidade: "moderada, com controle" },
    ],
    parametros: ["p-rpe", "p-volume"],
    refIds: ["acsm-progressao-2009", "schoenfeld-2017-volume", "schoenfeld-2010", "zourdos-rir-2016", "schoenfeld-carga-2017"],
    ressalva:
      "As faixas são referência; o volume ideal varia entre pessoas. Progrida por tolerância e resposta, não por buscar dor.",
    complementoAerobio: complementoAerobioPadrao(1),
    flexibilidade: FLEX_FECHO,
  },
  Força: {
    objetivo: "Força",
    capacidades: ["Força máxima", "Coordenação intermuscular"],
    tiposExercicio: ["Multiarticulares principais", "Cargas mais altas com técnica"],
    series: { valor: "3 a 5", nota: "nas séries principais" },
    reps: {
      valor: "1 a 6",
      porNivel: { Iniciante: "8 a 12", Intermediário: "1 a 6", Avançado: "1 a 6" },
      nota: "quem está começando fica em 8 a 12; carga alta vem depois da técnica consolidada",
    },
    intensidade: { valor: "alta", nota: "com boa técnica e margem de segurança" },
    intervalo: {
      valor: "3 a 5 min",
      // O NÍVEL JÁ MUDAVA AS REPETIÇÕES E NÃO MUDAVA O DESCANSO.
      //
      // O campo `reps` acima declara `porNivel` e move o iniciante de "1 a 6" para "8 a 12",
      // que é a decisão certa e é o que a nota dele explica. O intervalo ficava em "3 a 5 min"
      // para todo mundo, que é descanso de série de 1 a 6 repetições. O resultado medido, num
      // plano de 12 semanas de Força para iniciante: 5 séries de 12 repetições com 180 s de
      // descanso, em 720 blocos do produto cartesiano. Com condição que declara cautela o
      // alvo vai a 240 s, e uma idosa com osteoporose recebia 5x12 com 4 minutos entre séries,
      // o que estica a sessão para mais de uma hora e meia sem nenhum ganho.
      //
      // O intervalo do iniciante NÃO é número novo: é exatamente a faixa que este mesmo
      // arquivo já cita para a zona de 8 a 12 repetições, no objetivo Hipertrofia. Reusar a
      // faixa já citada para a zona de repetição que o aluno de fato vai executar é o que
      // mantém a prescrição coerente sem inventar recomendação.
      porNivel: { Iniciante: "1 a 2 min", Intermediário: "3 a 5 min", Avançado: "3 a 5 min" },
      nota: "nas séries principais; quem está em 8 a 12 repetições descansa na faixa dessa zona, não na de carga máxima",
    },
    frequencia: { Iniciante: "2 a 3x/sem", Intermediário: "3 a 4x/sem", Avançado: "4 a 5x/sem" },
    enfases: [
      { rotulo: "pesado", reps: "3 a 5", intensidade: "alta, com técnica e margem" },
      { rotulo: "moderado", reps: "5 a 8", intensidade: "moderada a alta" },
      { rotulo: "controlado", reps: "8 a 12", intensidade: "moderada, foco na execução" },
    ],
    parametros: ["p-rpe", "p-fadiga"],
    refIds: ["acsm-progressao-2009", "moesgaard-periodizacao-2022"],
    ressalva:
      "Cargas altas pedem técnica consolidada e progressão gradual; a autorregulação ajuda a respeitar o dia.",
    complementoAerobio: complementoAerobioPadrao(1),
    flexibilidade: FLEX_FECHO,
  },
  "Resistência muscular": {
    objetivo: "Resistência muscular",
    capacidades: ["Resistência muscular localizada", "Controle técnico em fadiga"],
    tiposExercicio: ["Multiarticulares e uniarticulares", "Circuitos quando fizer sentido"],
    series: { valor: "2 a 3" },
    reps: { valor: "acima de 15" },
    intensidade: { valor: "leve a moderada", nota: "cerca de 40 a 60% de 1RM" },
    intervalo: { valor: "até 90 s", nota: "intervalo curto sustenta a densidade da sessão" },
    frequencia: { Iniciante: "2 a 3x/sem", Intermediário: "3x/sem", Avançado: "3 a 4x/sem" },
    parametros: ["p-rpe"],
    refIds: ["acsm-progressao-2009"],
    ressalva: "Cargas leves com muitas repetições; a técnica em fadiga merece atenção.",
    complementoAerobio: complementoAerobioPadrao(2),
    flexibilidade: FLEX_FECHO,
  },
  Emagrecimento: {
    objetivo: "Emagrecimento",
    capacidades: ["Condicionamento aeróbio", "Força geral", "Gasto energético sustentável"],
    tiposExercicio: ["Aeróbio contínuo ou intervalado", "Força de corpo todo"],
    series: { valor: "2 a 3", nota: "na força de corpo todo" },
    reps: { valor: "10 a 15", nota: "na força; o aeróbio é contado em minutos, não em repetições" },
    intensidade: { valor: "moderada", nota: "no aeróbio, guie pela conversa e pela percepção de esforço" },
    intervalo: { valor: "30 a 90 s", nota: "curto a moderado, para manter a densidade" },
    frequencia: { Iniciante: "3x/sem", Intermediário: "3 a 5x/sem", Avançado: "4 a 5x/sem" },
    parametros: ["p-fc", "p-rpe", "p-adesao"],
    refIds: ["garber-2011", "oms-2020", "acsm-progressao-2009"],
    ressalva:
      "A meta semanal de atividade (150 a 300 min moderada) e a adesão pesam mais que qualquer detalhe da série. Emagrecimento depende sobretudo do contexto de energia, que é conduta multiprofissional.",
    // Sem complementoAerobio: aqui o aeróbio é a BASE (montado em toda sessão), não complemento.
    flexibilidade: FLEX_FECHO,
  },
  "Retorno ao treino": {
    objetivo: "Retorno ao treino",
    capacidades: ["Tolerância à carga", "Amplitude confortável", "Controle e confiança"],
    tiposExercicio: ["Movimentos controlados e progressivos", "Baixo impacto no início"],
    series: { valor: "2 a 3", nota: "conforme tolerância" },
    // "10 a 15" NÃO está no ACSM 2009, cujo alvo para novato é 8 a 12 RM. O número vem da
    // recomendação de força para adultos de meia idade e idosos iniciando, do Garber 2011, que
    // por isso passa a constar nos refIds desta faixa.
    reps: { valor: "10 a 15", nota: "em amplitude confortável; faixa de quem está reiniciando, do position stand de 2011, não do alvo de novato de 8 a 12 RM de 2009" },
    intensidade: { valor: "leve a moderada", nota: "guiada por dor e função" },
    intervalo: { valor: "confortável", nota: "sem pressa entre as séries" },
    frequencia: { Iniciante: "2 a 3x/sem", Intermediário: "3x/sem", Avançado: "3 a 4x/sem" },
    parametros: ["p-rpe"],
    refIds: ["acsm-progressao-2009", "garber-2011", "acsm-getp11"],
    ressalva:
      "Retorno após lesão ou condição é conduta compartilhada com o profissional de saúde. A ferramenta apoia a progressão do treino; não substitui a liberação nem a conduta clínica do profissional de saúde.",
    complementoAerobio: complementoAerobioPadrao(1),
    flexibilidade: FLEX_FECHO,
  },
  "Aprendizado técnico": {
    objetivo: "Aprendizado técnico",
    capacidades: ["Qualidade de movimento", "Coordenação", "Consistência técnica"],
    tiposExercicio: ["Padrões fundamentais", "Carga leve com foco na execução"],
    // APRENDIZADO MOTOR NÃO É OBJETIVO TRATADO PELO POSITION STAND CITADO. Séries de prática e
    // a faixa de 5 a 10 repetições não aparecem nele, e a frequência de iniciante estava em
    // "2 a 4x/sem", acima do teto de 2 a 3 dias por semana que o próprio documento recomenda
    // para novato. A frequência foi alinhada à fonte; os outros dois números continuam, agora
    // DECLARADOS como escolha prudente da casa na ressalva.
    series: { valor: "2 a 4", nota: "de prática, com qualidade acima da carga; escolha prudente da casa" },
    reps: { valor: "5 a 10", nota: "com boa execução; escolha prudente da casa, não faixa de diretriz" },
    intensidade: { valor: "leve a moderada", nota: "a técnica manda, não a carga" },
    intervalo: { valor: "suficiente para manter a qualidade" },
    frequencia: { Iniciante: "2 a 3x/sem", Intermediário: "3 a 4x/sem", Avançado: "3 a 4x/sem" },
    parametros: ["p-rpe"],
    refIds: ["acsm-progressao-2009"],
    ressalva:
      "Prática frequente com qualidade consolida o padrão; repetir com erro consolida o erro. As séries de prática e a faixa de 5 a 10 repetições são escolha prudente da casa: o position stand citado sustenta a FREQUÊNCIA e a progressão de carga, e não trata aprendizado motor como objetivo próprio.",
    complementoAerobio: complementoAerobioPadrao(1),
    flexibilidade: FLEX_FECHO,
  },
};

export function getFaixa(objetivo: GpsObjetivo): FaixaObjetivo {
  return FAIXAS_TREINO[objetivo];
}

/**
 * Escalas de monitoramento seguras para acoplar ao treino do dia quando o aluno NÃO tem
 * grupo especial (com grupo, a fase da jornada já define os parâmetros). São ids reais de
 * monitoringParameters, alinhados às faixas do objetivo; nunca um id inventado. O
 * Emagrecimento acompanha frequência cardíaca, esforço e adesão (os mesmos de
 * FAIXAS_TREINO.Emagrecimento.parametros); os demais objetivos guiam pelo esforço percebido
 * (PSE), que é universal e não exige aparelho. Fonte única do fallback, para o perfil do
 * aluno e o "treino do dia" do /gps nunca divergirem.
 */
export function parametrosPadraoTreino(objetivo: GpsObjetivo): string[] {
  return objetivo === "Emagrecimento" ? ["p-fc", "p-rpe", "p-adesao"] : ["p-rpe"];
}
