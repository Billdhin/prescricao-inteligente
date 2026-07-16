/**
 * Catálogo de restrições físicas do aluno (etapa 4 do Prescrever) e a semântica que o
 * motor usa para ajustar o ranqueamento.
 *
 * Princípios, herdados das regras do produto:
 * - Linguagem PRUDENTE e NÃO diagnóstica: dor/sensibilidade/limitação/insegurança, nunca
 *   "você tem lesão/tendinite/artrose" nem "este exercício trata/reabilita". A ferramenta
 *   APOIA a decisão do profissional habilitado; não é fisioterapia.
 * - Nada de número biomecânico inventado. Onde a decisão precisa de carga articular fina,
 *   o motor lê as demandas JÁ MEDIDAS (Demanda lombar/joelho/ombro, Requisito de
 *   mobilidade, Complexidade técnica). O resto vem de FATOS estruturais do exercício
 *   (`restricaoPerfil`), autorados por inspeção.
 * - Adaptar/substituir antes de excluir. Excluir só quando há incompatibilidade clara
 *   (ex.: "dificuldade para ajoelhar" com exercício que exige ajoelhar).
 * - Segurança separada do ranqueamento: alguns cenários (cirurgia sem liberação, lesão
 *   com dor importante) bloqueiam a geração automática e orientam confirmar a liberação.
 */

import type { Exercise } from "@/data/types";
import { exercises } from "@/data/exercises";

/* ------------------------------- Tags ------------------------------------ */

export type RestricaoTag =
  | "cervical_sensivel"
  | "toracica_sensivel"
  | "lombar_sensivel"
  | "ombro_sensivel"
  | "cotovelo_sensivel"
  | "punho_mao_sensivel"
  | "quadril_virilha_sensivel"
  | "joelho_dor"
  | "tornozelo_pe_sensivel"
  | "mobilidade_limitada"
  | "dificuldade_agachar"
  | "dificuldade_escadas"
  | "dificuldade_ajoelhar"
  | "dificuldade_sentar_levantar"
  | "dificuldade_chao"
  | "dificuldade_elevar_bracos"
  | "dificuldade_apoio_bracos"
  | "baixa_tolerancia_impacto"
  | "joelho_instavel"
  | "equilibrio_reduzido"
  | "medo_cair"
  | "assimetria_funcional"
  | "caibras_frequentes"
  | "fadiga_precoce"
  | "lesao_recente"
  | "retorno_pos_lesao"
  | "cirurgia_recente"
  | "dispositivo_apoio"
  | "nenhuma_restricao"
  | "outra_restricao";

export type RestricaoGrupo = "dor_regiao" | "limitacao_movimento" | "impacto_equilibrio" | "historico";

export type Lado = "direito" | "esquerdo" | "ambos_um_pior" | "nao_sei";
export type Gravidade = "leve" | "moderada" | "importante";
export type TempoEvento = "menos_2sem" | "2_6sem" | "6_12sem" | "mais_12sem";
export type Liberacao = "sim" | "nao" | "nao_sei";

/** Uma restrição marcada pelo aluno, com os detalhes condicionais que se aplicam a ela. */
export interface RestricaoSelecionada {
  tag: RestricaoTag;
  /** movimentos/situações em que o desconforto aparece (gatilhos) */
  gatilhos?: string[];
  lado?: Lado;
  regiao?: string;
  gravidade?: Gravidade;
  /** lesão recente: ainda há dor ou perda de função? ("nao" = não há) */
  dorFuncao?: "nao" | Gravidade;
  tempoEvento?: TempoEvento;
  liberacaoMedica?: Liberacao;
  restricaoProfissional?: string;
  dispositivo?: string;
  /** texto livre (Outra restrição, ou detalhe de cirurgia) */
  texto?: string;
  criadoEm: string;
  atualizadoEm: string;
}

/* --------------------------- Perguntas condicionais ----------------------- */

export type CampoCondicional =
  | "gatilhos"
  | "lado_regiao"
  | "lesao"
  | "cirurgia"
  | "dispositivo"
  | "texto_obrigatorio";

export const GATILHOS_OPCOES: Record<string, string> = {
  durante: "Durante o exercício",
  apos: "Após o exercício",
  caminhar: "Ao caminhar",
  correr: "Ao correr",
  escadas: "Ao subir escadas",
  agachar: "Ao agachar",
  empurrar: "Ao empurrar",
  puxar: "Ao puxar",
  elevar_bracos: "Ao elevar os braços",
  girar_tronco: "Ao girar o tronco",
  sentado: "Ao permanecer muito tempo sentado",
  em_pe: "Ao permanecer muito tempo em pé",
  outro: "Outro movimento",
};

/** Quais gatilhos fazem sentido por região (não mostrar todos para todas). */
const GATILHOS_POR_TAG: Partial<Record<RestricaoTag, string[]>> = {
  cervical_sensivel: ["durante", "apos", "girar_tronco", "elevar_bracos", "sentado", "outro"],
  toracica_sensivel: ["durante", "apos", "empurrar", "puxar", "girar_tronco", "sentado", "outro"],
  lombar_sensivel: ["durante", "apos", "agachar", "girar_tronco", "sentado", "em_pe", "outro"],
  ombro_sensivel: ["durante", "apos", "empurrar", "puxar", "elevar_bracos", "outro"],
  cotovelo_sensivel: ["durante", "apos", "empurrar", "puxar", "outro"],
  punho_mao_sensivel: ["durante", "apos", "empurrar", "puxar", "outro"],
  quadril_virilha_sensivel: ["durante", "apos", "caminhar", "agachar", "escadas", "outro"],
  joelho_dor: ["durante", "apos", "caminhar", "correr", "escadas", "agachar", "outro"],
  tornozelo_pe_sensivel: ["durante", "apos", "caminhar", "correr", "em_pe", "outro"],
};

export function gatilhosDaTag(tag: RestricaoTag): { id: string; rotulo: string }[] {
  return (GATILHOS_POR_TAG[tag] ?? []).map((id) => ({ id, rotulo: GATILHOS_OPCOES[id] }));
}

export const LADO_OPCOES: { id: Lado; rotulo: string }[] = [
  { id: "direito", rotulo: "Direito" },
  { id: "esquerdo", rotulo: "Esquerdo" },
  { id: "ambos_um_pior", rotulo: "Ambos, mas um lado é pior" },
  { id: "nao_sei", rotulo: "Não sei informar" },
];

export const REGIAO_OPCOES = ["Braço", "Ombro", "Tronco", "Quadril", "Perna", "Joelho", "Tornozelo ou pé", "Outra"];

export const TEMPO_OPCOES: { id: TempoEvento; rotulo: string }[] = [
  { id: "menos_2sem", rotulo: "Menos de 2 semanas" },
  { id: "2_6sem", rotulo: "Entre 2 e 6 semanas" },
  { id: "6_12sem", rotulo: "Entre 6 e 12 semanas" },
  { id: "mais_12sem", rotulo: "Mais de 12 semanas" },
];

export const GRAVIDADE_OPCOES: { id: Gravidade; rotulo: string }[] = [
  { id: "leve", rotulo: "Leve" },
  { id: "moderada", rotulo: "Moderada" },
  { id: "importante", rotulo: "Importante" },
];

export const LIBERACAO_OPCOES: { id: Liberacao; rotulo: string }[] = [
  { id: "sim", rotulo: "Sim" },
  { id: "nao", rotulo: "Não" },
  { id: "nao_sei", rotulo: "Ainda não sei" },
];

export const DISPOSITIVO_OPCOES = ["Bengala", "Andador", "Muleta", "Prótese", "Órtese", "Joelheira", "Tornozeleira", "Outro"];

/* ------------------------------- Catálogo -------------------------------- */

export interface RestricaoCatalogoItem {
  tag: RestricaoTag;
  grupo: RestricaoGrupo;
  titulo: string;
  descricao: string;
  /** efeito esperado no ranqueamento, em linguagem do profissional (exibido no card) */
  efeitos: string[];
  campos?: CampoCondicional[];
  /** comportamento especial de segurança/obrigatoriedade */
  comportamento?: "alerta" | "campo_obrigatorio" | "bloqueio_condicional";
  /** entra entre as opções mais frequentes exibidas com destaque */
  destaque?: boolean;
}

export const GRUPOS_RESTRICAO: { id: RestricaoGrupo; titulo: string; abertoInicial: boolean }[] = [
  { id: "dor_regiao", titulo: "Dor ou sensibilidade por região", abertoInicial: true },
  { id: "limitacao_movimento", titulo: "Limitações de movimento", abertoInicial: false },
  { id: "impacto_equilibrio", titulo: "Impacto, equilíbrio e estabilidade", abertoInicial: false },
  { id: "historico", titulo: "Histórico recente e necessidades especiais", abertoInicial: false },
];

export const CATALOGO_RESTRICOES: RestricaoCatalogoItem[] = [
  /* GRUPO 1 — dor ou sensibilidade por região */
  {
    tag: "cervical_sensivel",
    grupo: "dor_regiao",
    titulo: "Pescoço sensível",
    descricao: "Dor, rigidez ou desconforto ao movimentar a cabeça ou sustentar determinadas posições.",
    efeitos: [
      "Evita movimentos bruscos do pescoço",
      "Reduz exercícios que exijam sustentação cervical prolongada",
      "Prioriza posição neutra da cabeça",
    ],
    campos: ["gatilhos"],
  },
  {
    tag: "toracica_sensivel",
    grupo: "dor_regiao",
    titulo: "Parte média ou alta das costas",
    descricao: "Desconforto entre as escápulas ou na região torácica ao puxar, empurrar ou girar o tronco.",
    efeitos: ["Reduz rotações intensas", "Ajusta puxadas e empurradas", "Prefere exercícios apoiados"],
    campos: ["gatilhos"],
  },
  {
    tag: "lombar_sensivel",
    grupo: "dor_regiao",
    titulo: "Dor lombar",
    descricao: "Dor ou sensibilidade na região lombar, especialmente ao inclinar, girar ou sustentar cargas.",
    efeitos: [
      "Evita alta demanda de coluna",
      "Reduz flexão de tronco com carga",
      "Prioriza estabilidade e exercícios apoiados",
    ],
    campos: ["gatilhos"],
    destaque: true,
  },
  {
    tag: "ombro_sensivel",
    grupo: "dor_regiao",
    titulo: "Ombro sensível",
    descricao: "Dor ou desconforto ao elevar o braço, empurrar, puxar ou movimentar os braços acima da cabeça.",
    efeitos: ["Evita alta demanda de ombro", "Reduz exercícios acima da cabeça", "Prefere pegadas neutras"],
    campos: ["gatilhos"],
    destaque: true,
  },
  {
    tag: "cotovelo_sensivel",
    grupo: "dor_regiao",
    titulo: "Cotovelo sensível",
    descricao: "Desconforto ao empurrar, puxar, segurar pesos ou estender completamente o braço.",
    efeitos: ["Ajusta pegadas", "Reduz extensão completa sob carga", "Prefere cargas leves a moderadas"],
    campos: ["gatilhos"],
  },
  {
    tag: "punho_mao_sensivel",
    grupo: "dor_regiao",
    titulo: "Punho ou mão sensível",
    descricao: "Dor ou dificuldade para apoiar as mãos, segurar pesos ou manter o punho dobrado.",
    efeitos: ["Evita apoio excessivo sobre as mãos", "Prioriza pegadas neutras", "Permite máquinas, faixas ou apoio nos antebraços"],
    campos: ["gatilhos"],
  },
  {
    tag: "quadril_virilha_sensivel",
    grupo: "dor_regiao",
    titulo: "Quadril ou virilha sensível",
    descricao: "Desconforto ao caminhar, agachar, subir degraus ou afastar as pernas.",
    efeitos: ["Ajusta profundidade do agachamento", "Evita mudanças bruscas de direção", "Prioriza movimentos controlados"],
    campos: ["gatilhos"],
  },
  {
    tag: "joelho_dor",
    grupo: "dor_regiao",
    titulo: "Dor no joelho",
    descricao: "Dor ao agachar, subir escadas, correr, saltar ou levantar-se.",
    efeitos: ["Reduz carga e amplitude exigidas do joelho", "Evita impacto quando necessário", "Prefere exercícios guiados e progressivos"],
    campos: ["gatilhos"],
    destaque: true,
  },
  {
    tag: "tornozelo_pe_sensivel",
    grupo: "dor_regiao",
    titulo: "Tornozelo ou pé sensível",
    descricao: "Desconforto ao caminhar, correr, saltar, permanecer em pé ou apoiar o peso corporal.",
    efeitos: ["Reduz impacto", "Prioriza exercícios sentados, apoiados ou de baixo impacto", "Ajusta o equilíbrio em um pé"],
    campos: ["gatilhos"],
  },

  /* GRUPO 2 — limitações de movimento */
  {
    tag: "mobilidade_limitada",
    grupo: "limitacao_movimento",
    titulo: "Mobilidade limitada",
    descricao: "Dificuldade para alcançar amplitudes como agachar, elevar os braços ou alcançar os pés.",
    efeitos: ["Prioriza amplitude ajustável", "Prefere exercícios guiados", "Aplica progressão gradual de movimento"],
    destaque: true,
  },
  {
    tag: "dificuldade_agachar",
    grupo: "limitacao_movimento",
    titulo: "Dificuldade para agachar",
    descricao: "Dor, limitação ou insegurança ao abaixar e levantar o corpo.",
    efeitos: ["Reduz profundidade", "Usa banco, caixa ou apoio", "Ajusta carga e estabilidade"],
  },
  {
    tag: "dificuldade_escadas",
    grupo: "limitacao_movimento",
    titulo: "Dificuldade para subir escadas",
    descricao: "Dor, fraqueza ou dificuldade ao subir ou descer degraus.",
    efeitos: ["Reduz exercícios em degrau", "Ajusta altura do step", "Prioriza fortalecimento progressivo"],
  },
  {
    tag: "dificuldade_ajoelhar",
    grupo: "limitacao_movimento",
    titulo: "Dificuldade para ajoelhar",
    descricao: "Incômodo ou impossibilidade de permanecer apoiado sobre os joelhos.",
    efeitos: ["Substitui exercícios ajoelhados ou em quatro apoios", "Prioriza variações em pé, sentadas ou deitadas"],
  },
  {
    tag: "dificuldade_sentar_levantar",
    grupo: "limitacao_movimento",
    titulo: "Dificuldade para sentar e levantar",
    descricao: "Necessidade de apoio ou dificuldade para levantar-se de cadeiras, bancos ou superfícies baixas.",
    efeitos: ["Usa superfícies mais altas", "Permite apoio das mãos", "Prioriza progressões funcionais"],
  },
  {
    tag: "dificuldade_chao",
    grupo: "limitacao_movimento",
    titulo: "Dificuldade para deitar ou levantar do chão",
    descricao: "Limitação para iniciar ou finalizar exercícios realizados no solo ou em colchonete.",
    efeitos: ["Evita exercícios no chão", "Prioriza banco, cadeira, máquinas ou exercícios em pé", "Evita transições frequentes solo/pé"],
  },
  {
    tag: "dificuldade_elevar_bracos",
    grupo: "limitacao_movimento",
    titulo: "Dificuldade para elevar os braços",
    descricao: "Limitação ou desconforto ao alcançar objetos ou realizar movimentos acima da cabeça.",
    efeitos: ["Adapta exercícios acima da cabeça", "Limita amplitude de elevação", "Prioriza movimentos abaixo da linha dos ombros"],
  },
  {
    tag: "dificuldade_apoio_bracos",
    grupo: "limitacao_movimento",
    titulo: "Dificuldade para apoiar o peso nos braços",
    descricao: "Dor ou desconforto em pranchas, flexões, exercícios em quatro apoios ou apoio sobre as mãos.",
    efeitos: ["Evita apoio das mãos", "Usa apoio nos antebraços quando possível", "Substitui por máquinas, cabos ou exercícios sentados"],
  },

  /* GRUPO 3 — impacto, equilíbrio e estabilidade */
  {
    tag: "baixa_tolerancia_impacto",
    grupo: "impacto_equilibrio",
    titulo: "Baixa tolerância ao impacto",
    descricao: "Dor, desconforto ou insegurança ao correr, saltar ou realizar movimentos com aterrissagem.",
    efeitos: ["Reduz ou retira saltos e corrida", "Prioriza caminhada, bicicleta, elíptico ou baixo impacto", "Não prioriza pliometria"],
    destaque: true,
  },
  {
    tag: "joelho_instavel",
    grupo: "impacto_equilibrio",
    titulo: "Joelho instável",
    descricao: "Sensação de que o joelho falha, cede ou não sustenta adequadamente o corpo.",
    efeitos: ["Evita mudanças rápidas de direção e saltos", "Prioriza apoio, máquinas e exercícios estáveis", "Progressão gradual de força"],
  },
  {
    tag: "equilibrio_reduzido",
    grupo: "impacto_equilibrio",
    titulo: "Equilíbrio reduzido",
    descricao: "Instabilidade ao ficar em um pé, caminhar, mudar de direção ou realizar exercícios sem apoio.",
    efeitos: ["Prioriza exercícios com apoio", "Evita superfícies instáveis", "Adia unilaterais avançados"],
  },
  {
    tag: "medo_cair",
    grupo: "impacto_equilibrio",
    titulo: "Medo de cair",
    descricao: "Insegurança para realizar exercícios em pé, caminhar rapidamente ou treinar sem um apoio próximo.",
    efeitos: ["Prioriza exercícios sentados ou com apoio", "Evita deslocamentos rápidos", "Progressão de equilíbrio supervisionada"],
  },
  {
    tag: "assimetria_funcional",
    grupo: "impacto_equilibrio",
    titulo: "Limitação maior em um lado do corpo",
    descricao: "Um braço ou uma perna apresenta força, mobilidade ou controle claramente menores que o outro lado.",
    efeitos: ["Permite unilaterais controlados", "Reduz carga do lado limitado", "Evita exigir simetria forçada"],
    campos: ["lado_regiao"],
  },
  {
    tag: "caibras_frequentes",
    grupo: "impacto_equilibrio",
    titulo: "Cãibras frequentes",
    descricao: "Episódios recorrentes de contração muscular involuntária durante ou após o esforço.",
    efeitos: ["Evita progressões abruptas", "Reduz volume e intensidade inicial", "Aumenta intervalos"],
  },
  {
    tag: "fadiga_precoce",
    grupo: "impacto_equilibrio",
    titulo: "Fadiga muscular muito precoce",
    descricao: "Os músculos deixam de sustentar movimentos simples após pouco tempo de exercício.",
    efeitos: ["Sessões curtas e menos séries", "Aumenta intervalos", "Prioriza baixa complexidade e progressão lenta"],
  },

  /* GRUPO 4 — histórico recente e necessidades especiais */
  {
    tag: "lesao_recente",
    grupo: "historico",
    titulo: "Lesão recente ainda sintomática",
    descricao: "Entorse, distensão, contusão ou outro problema recente que ainda causa dor ou limitação.",
    efeitos: ["Não prescreve exercício para tratar a lesão", "Solicita confirmação de liberação quando aplicável", "Orienta avaliação profissional se houver dor importante ou perda de função"],
    campos: ["lesao"],
    comportamento: "alerta",
  },
  {
    tag: "retorno_pos_lesao",
    grupo: "historico",
    titulo: "Retorno após afastamento por dor ou lesão",
    descricao: "Está retomando o exercício após semanas ou meses sem treinar por causa de dor ou limitação.",
    efeitos: ["Retorno gradual: reduz volume, intensidade e complexidade", "Evita máximos, falha e impacto elevado", "Prioriza adaptação e adesão"],
  },
  {
    tag: "cirurgia_recente",
    grupo: "historico",
    titulo: "Cirurgia recente ou restrição médica de movimento",
    descricao: "Está em recuperação de cirurgia ou recebeu orientação para evitar determinados movimentos ou esforços.",
    efeitos: ["Não gera treino sem liberação para atividade física", "A prescrição não contraria a restrição informada", "Reforça que o sistema não substitui a equipe de saúde"],
    campos: ["cirurgia"],
    comportamento: "bloqueio_condicional",
  },
  {
    tag: "dispositivo_apoio",
    grupo: "historico",
    titulo: "Uso de órtese, prótese ou dispositivo de apoio",
    descricao: "Utiliza joelheira, tornozeleira, bengala, prótese ou outro recurso que influencia a realização do exercício.",
    efeitos: ["Prioriza exercícios estáveis e ajustáveis", "Não presume incapacidade", "Permite adaptação individual pelo profissional"],
    campos: ["dispositivo"],
  },

  /* opções obrigatórias */
  {
    tag: "nenhuma_restricao",
    grupo: "historico",
    titulo: "Nenhuma restrição física",
    descricao: "Não apresenta dor, limitação ou necessidade de adaptação física relevante no momento.",
    efeitos: [],
  },
  {
    tag: "outra_restricao",
    grupo: "historico",
    titulo: "Outra restrição",
    descricao: "Existe outra dor, limitação ou necessidade de adaptação que não aparece na lista.",
    efeitos: ["Registra a descrição para o profissional avaliar manualmente"],
    campos: ["texto_obrigatorio"],
  },
];

const POR_TAG = new Map(CATALOGO_RESTRICOES.map((i) => [i.tag, i]));
export function itemDaTag(tag: RestricaoTag): RestricaoCatalogoItem | undefined {
  return POR_TAG.get(tag);
}
export function rotuloRestricao(tag: RestricaoTag): string {
  return POR_TAG.get(tag)?.titulo ?? tag;
}

/* ---------------------- Efeito de cada tag no motor ---------------------- */

export type AcaoRestricao = "excluir" | "penalizar_forte" | "penalizar_moderado" | "adaptar" | "preferir";

export interface EfeitoResultado {
  acao: AcaoRestricao;
  /** texto para o breakdown/justificativa; vazio = não comenta */
  motivo: string;
  /** dado necessário não existe na base: declara em vez de fingir que avaliou */
  dadoAusente?: boolean;
}

export type AvaliadorEfeito = (ex: Exercise, sel: RestricaoSelecionada) => EfeitoResultado;

const NEUTRO: EfeitoResultado = { acao: "adaptar", motivo: "" };

const metric = (ex: Exercise, nome: string): number | undefined =>
  ex.indiceEficiencia.metrics.find((m) => m.nome.toLowerCase() === nome.toLowerCase())?.valor;

/**
 * Maior valor que cada demanda de fato atinge nesta base. As demandas são escala
 * COMPARATIVA (ver metricasGlossario), e nem todas usam o topo 0-100: a Demanda de
 * joelho vai só até 58. Com um corte fixo de 60, a restrição de joelho nunca chegava
 * a "alta" e o exercício mais exigente de joelho (leg extension, afundo) só recebia
 * penalidade moderada. "Alta" passa a ser o teto que a região realmente tem na base.
 */
const maxDemanda = (nome: string): number => {
  let m = 0;
  for (const e of exercises) {
    const v = metric(e, nome);
    if (v !== undefined && v > m) m = v;
  }
  return m || 60;
};

/** Restrição de demanda articular: lê a métrica JÁ MEDIDA e mapeia para ação. */
const porDemanda = (nome: string, label: string): AvaliadorEfeito => {
  // "alta" relativa ao teto real da região (limitada a 60): quem já usa a faixa 0-100
  // cheia (lombar/ombro/mobilidade, teto 68-70) segue com corte 60; joelho (teto 58)
  // passa a marcar como alta o que está no seu próprio topo.
  const alta = Math.min(60, maxDemanda(nome));
  return (ex) => {
    const v = metric(ex, nome);
    if (v === undefined)
      return { acao: "adaptar", motivo: `Sem dado medido de ${label}: confirme a tolerância do aluno antes de progredir.`, dadoAusente: true };
    if (v >= alta) return { acao: "penalizar_forte", motivo: `Alta demanda de ${label} (${v}/100) para quem tem essa queixa.` };
    if (v >= 40) return { acao: "penalizar_moderado", motivo: `Demanda moderada de ${label} (${v}/100): progressão gradual.` };
    return { acao: "preferir", motivo: `Baixa demanda de ${label} (${v}/100).` };
  };
};

/**
 * Combina avaliadores pela ação mais estrita, ignorando os que NÃO têm opinião
 * (adaptar com motivo vazio). Sem isso, um check neutro (ex.: "não é alto impacto")
 * engolia um "preferir" de outro check (ex.: "baixa demanda de joelho") e a bicicleta
 * virava "adaptar" em vez de "preferir".
 */
const ORDEM_ACAO: AcaoRestricao[] = ["preferir", "adaptar", "penalizar_moderado", "penalizar_forte", "excluir"];
const semOpiniao = (r: EfeitoResultado) => r.acao === "adaptar" && !r.motivo && !r.dadoAusente;
const maisEstrita = (...avs: AvaliadorEfeito[]): AvaliadorEfeito => (ex, sel) => {
  const res = avs.map((a) => a(ex, sel)).filter((r) => !semOpiniao(r));
  if (res.length === 0) return NEUTRO;
  return res.reduce((pior, r) => (ORDEM_ACAO.indexOf(r.acao) > ORDEM_ACAO.indexOf(pior.acao) ? r : pior), res[0]);
};

/** Predicado estrutural: se `pred`, aplica `acao` com `motivo`; senão neutro. */
const seEstrutural =
  (pred: (ex: Exercise) => boolean, acao: AcaoRestricao, motivo: string): AvaliadorEfeito =>
  (ex) => {
    if (!ex.restricaoPerfil) return NEUTRO;
    return pred(ex) ? { acao, motivo } : NEUTRO;
  };

const p = (ex: Exercise) => ex.restricaoPerfil!;

export const EFEITO_POR_TAG: Partial<Record<RestricaoTag, AvaliadorEfeito>> = {
  cervical_sensivel: seEstrutural(
    (ex) => p(ex).movimentoAcimaCabeca,
    "penalizar_moderado",
    "Exige sustentação acima da cabeça: mantenha a cabeça neutra e reduza a amplitude.",
  ),
  toracica_sensivel: NEUTRO_AVALIADOR("Ajuste puxadas, empurradas e rotações conforme a tolerância do aluno."),
  lombar_sensivel: porDemanda("Demanda lombar", "coluna lombar"),
  ombro_sensivel: maisEstrita(
    porDemanda("Demanda de ombro", "ombro"),
    seEstrutural((ex) => p(ex).movimentoAcimaCabeca, "penalizar_forte", "Movimento acima da cabeça sob carga, que comprime o espaço subacromial."),
  ),
  cotovelo_sensivel: NEUTRO_AVALIADOR("Ajuste a pegada e evite extensão completa sob carga."),
  punho_mao_sensivel: seEstrutural(
    (ex) => p(ex).apoioNasMaos,
    "penalizar_forte",
    "Leva o peso do corpo às mãos e ao punho: prefira apoio nos antebraços, máquina ou halteres.",
  ),
  quadril_virilha_sensivel: maisEstrita(
    porDemanda("Demanda de joelho", "joelho e quadril"),
    seEstrutural((ex) => p(ex).impacto === "alto", "penalizar_moderado", "Impacto e mudança de direção pedem controle na região do quadril."),
  ),
  joelho_dor: maisEstrita(
    porDemanda("Demanda de joelho", "joelho"),
    seEstrutural((ex) => p(ex).impacto === "alto", "penalizar_forte", "Alto impacto sobre o joelho."),
  ),
  tornozelo_pe_sensivel: maisEstrita(
    seEstrutural((ex) => p(ex).impacto === "alto", "penalizar_forte", "Alto impacto sobre o tornozelo e o pé."),
    seEstrutural((ex) => p(ex).unilateral && p(ex).posicao === "em pé" && !p(ex).possuiApoio, "penalizar_moderado", "Equilíbrio em um pé sob o peso do corpo."),
    seEstrutural((ex) => p(ex).possuiApoio || p(ex).posicao === "sentado", "preferir", "Apoiado e de baixo impacto."),
  ),

  // Só 15 dos 35 exercícios têm "Requisito de mobilidade" medido. Onde existe, manda
  // ele; onde falta, NÃO fica em silêncio: usa o fato estrutural (amplitude ajustável
  // ou apoio deixam trabalhar dentro do confortável). Assim a restrição de mobilidade
  // opera na base inteira sem inventar um número de amplitude.
  mobilidade_limitada: (ex) => {
    const efeitoMetrica = porDemanda("Requisito de mobilidade", "amplitude")(ex, {} as RestricaoSelecionada);
    if (!efeitoMetrica.dadoAusente) return efeitoMetrica;
    if (!ex.restricaoPerfil)
      return { acao: "adaptar", motivo: "Sem dado de amplitude: ajuste o setup ao que o aluno alcança com conforto." };
    if (p(ex).amplitudeAjustavel || p(ex).possuiApoio)
      return { acao: "preferir", motivo: "Amplitude ajustável ou apoiado: dá para trabalhar dentro do confortável." };
    return { acao: "adaptar", motivo: "Ajuste a amplitude ao que o aluno alcança com conforto." };
  },
  dificuldade_agachar: maisEstrita(
    porDemanda("Demanda de joelho", "joelho"),
    seEstrutural((ex) => p(ex).amplitudeAjustavel || p(ex).possuiApoio, "preferir", "Permite reduzir a profundidade com apoio."),
  ),
  dificuldade_escadas: NEUTRO_AVALIADOR("Ajuste altura de step e volume de subidas ao ritmo do aluno."),
  dificuldade_ajoelhar: seEstrutural(
    (ex) => p(ex).exigeAjoelhar,
    "excluir",
    "Exige apoiar-se sobre os joelhos: substitua por variação em pé, sentada ou deitada.",
  ),
  dificuldade_sentar_levantar: seEstrutural(
    (ex) => p(ex).possuiApoio || p(ex).posicao === "sentado" || p(ex).posicao === "deitado",
    "preferir",
    "Apoiado ou já na superfície: menos transições de sentar e levantar.",
  ),
  dificuldade_chao: seEstrutural(
    (ex) => p(ex).exigeIrAoChao,
    "excluir",
    "Começa ou termina no solo: prefira banco, cadeira, máquina ou exercícios em pé.",
  ),
  dificuldade_elevar_bracos: seEstrutural(
    (ex) => p(ex).movimentoAcimaCabeca,
    "penalizar_forte",
    "Leva os braços acima da cabeça: limite a amplitude ou troque por movimento abaixo dos ombros.",
  ),
  dificuldade_apoio_bracos: seEstrutural(
    (ex) => p(ex).apoioNasMaos,
    "penalizar_forte",
    "Apoia o peso nas mãos: use apoio nos antebraços ou troque por máquina, cabo ou sentado.",
  ),

  baixa_tolerancia_impacto: (ex) => {
    if (!ex.restricaoPerfil) return NEUTRO;
    if (p(ex).impacto === "alto") return { acao: "excluir", motivo: "Alto impacto retirado enquanto a tolerância for baixa." };
    if (p(ex).impacto === "moderado") return { acao: "penalizar_moderado", motivo: "Impacto moderado: prefira as opções de baixo impacto primeiro." };
    return { acao: "preferir", motivo: "Baixo impacto." };
  },
  joelho_instavel: maisEstrita(
    porDemanda("Demanda de joelho", "joelho"),
    seEstrutural((ex) => p(ex).unilateral && p(ex).impacto !== "baixo", "penalizar_forte", "Unilateral com impacto pede estabilidade que o joelho ainda não sustenta."),
    seEstrutural((ex) => p(ex).possuiApoio, "preferir", "Apoiado e estável."),
  ),
  equilibrio_reduzido: maisEstrita(
    seEstrutural((ex) => p(ex).possuiApoio, "preferir", "Oferece apoio estável."),
    seEstrutural((ex) => p(ex).unilateral && p(ex).posicao === "em pé" && !p(ex).possuiApoio, "penalizar_forte", "Exige equilíbrio em um pé sem apoio."),
  ),
  medo_cair: maisEstrita(
    seEstrutural((ex) => p(ex).possuiApoio || p(ex).posicao === "sentado" || p(ex).posicao === "deitado", "preferir", "Sentado ou apoiado, transmite segurança."),
    seEstrutural((ex) => p(ex).posicao === "em pé" && !p(ex).possuiApoio && p(ex).impacto !== "baixo", "penalizar_moderado", "Em pé, sem apoio e com deslocamento."),
  ),
  assimetria_funcional: seEstrutural(
    (ex) => p(ex).unilateral,
    "preferir",
    "Unilateral: dá para dosar a carga do lado limitado. Registre o lado afetado.",
  ),
  caibras_frequentes: NEUTRO_AVALIADOR("Reduza volume e intensidade inicial e amplie os intervalos; oriente interromper se as cãibras forem intensas."),
  fadiga_precoce: maisEstrita(
    porDemanda("Complexidade técnica", "exigência técnica"),
    seEstrutural((ex) => p(ex).possuiApoio, "preferir", "Apoiado: sobra atenção para a musculatura-alvo em sessões curtas."),
  ),

  lesao_recente: NEUTRO_AVALIADOR("Não trata a lesão: confirme a liberação e evite carregar a região sintomática."),
  retorno_pos_lesao: maisEstrita(
    porDemanda("Complexidade técnica", "exigência técnica"),
    seEstrutural((ex) => p(ex).impacto === "alto", "penalizar_moderado", "Impacto elevado fica para depois no retorno gradual."),
  ),
  cirurgia_recente: NEUTRO_AVALIADOR("Respeite a restrição de movimento informada; não gere treino sem liberação."),
  dispositivo_apoio: seEstrutural(
    (ex) => p(ex).possuiApoio || p(ex).amplitudeAjustavel,
    "preferir",
    "Estável e ajustável: acomoda o dispositivo de apoio.",
  ),
  // nenhuma_restricao / outra_restricao: sem efeito no ranking
};

/** Avaliador que nunca muda o ranking, só registra uma nota de adaptação. */
function NEUTRO_AVALIADOR(nota: string): AvaliadorEfeito {
  return () => ({ acao: "adaptar", motivo: nota });
}

/* ------------------------------- Segurança ------------------------------- */

export interface SegurancaResultado {
  bloqueado: boolean;
  motivos: string[];
  orientacao: string;
}

const ORIENTACAO_SEGURANCA =
  "Pelas informações fornecidas, é importante confirmar a liberação e as restrições de movimento antes de gerar o treino. O sistema não substitui avaliação médica ou fisioterapêutica.";

/**
 * Bloqueia a geração automática só nos cenários de risco claro (spec, Regras de
 * segurança): não bloquear por dor leve ou limitação funcional.
 */
export function avaliarSeguranca(restricoes: RestricaoSelecionada[]): SegurancaResultado {
  const motivos: string[] = [];
  for (const r of restricoes) {
    if (r.tag === "cirurgia_recente" && r.liberacaoMedica !== "sim") {
      motivos.push("Cirurgia recente ou restrição médica sem liberação confirmada para atividade física.");
    }
    if (r.tag === "lesao_recente" && r.dorFuncao === "importante") {
      motivos.push("Lesão recente com dor ou perda de função importante ainda sem avaliação.");
    }
  }
  return { bloqueado: motivos.length > 0, motivos, orientacao: ORIENTACAO_SEGURANCA };
}

/** Restrições que pedem um alerta de cautela visível, mesmo sem bloquear. */
export function pedeAlertaCautela(restricoes: RestricaoSelecionada[]): boolean {
  return restricoes.some((r) => r.tag === "lesao_recente" || r.tag === "cirurgia_recente");
}

/* ----------------------------- Utilidades -------------------------------- */

export function agora(): string {
  return new Date().toISOString();
}

export function criarRestricao(tag: RestricaoTag, extras: Partial<RestricaoSelecionada> = {}): RestricaoSelecionada {
  const ts = agora();
  return { tag, criadoEm: ts, atualizadoEm: ts, ...extras };
}

/** Tags realmente ativas (exclui "nenhuma_restricao"). */
export function restricoesAtivas(restricoes: RestricaoSelecionada[]): RestricaoSelecionada[] {
  return restricoes.filter((r) => r.tag !== "nenhuma_restricao");
}

/**
 * Validação dos campos condicionais obrigatórios (controla o botão Continuar):
 * "Outra" exige texto; "Cirurgia recente" exige resposta de liberação.
 */
export function condicionaisPendentes(restricoes: RestricaoSelecionada[]): boolean {
  return restricoes.some(
    (r) =>
      (r.tag === "outra_restricao" && !r.texto?.trim()) ||
      (r.tag === "cirurgia_recente" && !r.liberacaoMedica),
  );
}

/**
 * Converte o formato legado (`string[]` do GpsRestricao antigo) para o novo modelo.
 * Idempotente: se já vier estruturado (objeto com `tag`), preserva.
 */
const LEGADO_PARA_TAG: Record<string, RestricaoTag> = {
  "Dor lombar": "lombar_sensivel",
  "Dor no joelho": "joelho_dor",
  "Ombro sensível": "ombro_sensivel",
  "Mobilidade limitada": "mobilidade_limitada",
};

export function migrarRestricoesLegado(valor: unknown): RestricaoSelecionada[] {
  if (!Array.isArray(valor)) return [];
  const out: RestricaoSelecionada[] = [];
  for (const item of valor) {
    if (typeof item === "string") {
      if (item === "Nenhuma") continue;
      const tag = LEGADO_PARA_TAG[item];
      if (tag) out.push(criarRestricao(tag));
    } else if (item && typeof item === "object" && "tag" in item) {
      out.push(item as RestricaoSelecionada);
    }
  }
  return out;
}
