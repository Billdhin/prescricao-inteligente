/**
 * Rulepack de progressão do motor de periodização (fonte única versionada).
 *
 * Cada RegraProgressao é a ÚNICA origem autorizada de um corte, incremento, limite
 * ou zona usado pela geração e pela progressão do treino. Nenhum número entra aqui
 * sem um refId apontando para uma referência real em referencias.ts (verificada no
 * PubMed). Onde a evidência é fraca, a regra é DECLARADA (aprovacao "pendente") e o
 * número NÃO é cravado (limites e incremento ficam null); a decisão fica com o
 * profissional.
 *
 * Versionamento: toda regra nasce com versao 1. Ao mudar QUALQUER número, faixa ou
 * critério de uma regra, faça bump de versao (e registre a evidência no refId). O
 * campo ano guarda o ano de curadoria da regra neste rulepack, não o ano da
 * referência: cada referência carrega o próprio ano em referencias.ts.
 *
 * Guardrail: scripts/check-regras.ts (npm run check:regras) trava regra sem
 * referência real, regra aprovada sem refId, versao inválida e regra aprovada com
 * confiança fraca (evidência fraca é declarada como "pendente", nunca vendida como
 * aprovada).
 *
 * Fonte das regras e dos números desta versão: dossiê de evidências verificadas
 * (.claude/plans/motor-periodizacao-evidencias.md). Não adicionar número fora dele.
 */

/** Variável de treino que a regra governa. */
export type VariavelRegra =
  | "carga"
  | "volume"
  | "volumeAerobio"
  | "fcMaxEstimada"
  | "intensidadeAerobia";

/** Força da evidência por trás do número da regra. */
export type Confianca = "forte" | "moderada" | "fraca";

/** Estado de aprovação: "aprovada" vai ao ar com número; "pendente" é declarada sem cravar. */
export type Aprovacao = "aprovada" | "pendente";

/** Limite (piso e/ou teto) de um número, com a sua unidade. */
export interface LimitesRegra {
  min?: number;
  max?: number;
  unidade: string;
}

/** Passo de incremento concreto (usado pelas ondas de progressão; nesta versão sempre null). */
export interface IncrementoRegra {
  valor: number;
  unidade: "%" | "kg" | "rep" | "serie" | "min";
  arredondar?: number;
}

export interface RegraProgressao {
  /** id estável, referenciado por origemRegraId nos blocos e pelos checks. */
  id: string;
  variavel: VariavelRegra;
  /** perfis clínicos aos quais a regra se aplica (vazio = geral). */
  perfil?: string[];
  /** fases da periodização em que vale (vazio = todas). */
  fase?: (1 | 2 | 3 | 4)[];
  /** critério de aplicação, em linguagem do profissional. */
  criterios: string;
  /** piso/teto do número; null quando o dossiê manda NÃO cravar. */
  limites: LimitesRegra | null;
  /** passo de incremento; null quando é intervalo ou quando não se crava o ponto. */
  incremento: IncrementoRegra | null;
  /** número de sessões que dispara a regra (quando aplicável). */
  nSessoes?: number;
  /** sinais que pedem cautela ou freio. */
  sinaisAlerta: string[];
  aprovacao: Aprovacao;
  /** ao menos um id de referencias.ts; obrigatório em regra aprovada. */
  refId: string[];
  /** ano de curadoria da regra neste rulepack (ver cabeçalho). */
  ano: number;
  /** versão da regra; sobe a cada mudança de número. */
  versao: number;
  confianca: Confianca;
  /** ressalva de honestidade científica quando o número tem limite de evidência. */
  observacao?: string;

  /* ---- campos específicos por tipo de regra (opcionais e tipados) ---- */
  /** fórmula fechada, quando a regra é um cálculo (FCmax, zona de Karvonen). */
  formula?: string;
  /** ponto de partida sugerido, quando o número é partida prudente e não comprovado. */
  sugestaoPartida?: string;
  /** duração em semanas, quando a regra é uma janela (taper, deload). */
  duracaoSemanas?: { min?: number; max?: number };
  /** true quando a regra mantém a intensidade e mexe só no volume (taper). */
  intensidadeMantida?: boolean;
}

export const REGRAS_PROGRESSAO: RegraProgressao[] = [
  /* ============ Regras APROVADAS (vão ao ar com número) ============ */
  {
    id: "forca-dupla-progressao-carga",
    variavel: "carga",
    criterios:
      "Subir a carga de 2 a 10% quando fizer 1 a 2 repetições acima do topo da faixa em todas as séries, com técnica e RIR dentro do alvo; enquanto isso não acontece, manter a carga e somar repetições.",
    limites: { min: 2, max: 10, unidade: "%" },
    incremento: null,
    sinaisAlerta: ["falha técnica", "RIR abaixo do alvo", "dor articular"],
    aprovacao: "aprovada",
    refId: ["acsm-progressao-2009", "zourdos-rir-2016"],
    ano: 2026,
    versao: 1,
    confianca: "forte",
    observacao:
      "A convenção prática 2-for-2 (subir a carga após duas sessões consecutivas atingindo o alvo) é adotada por muitos profissionais, mas é convenção, não regra do ACSM, e não está cravada nesta versão.",
  },
  {
    id: "aerobio-fcmax-estimada",
    variavel: "fcMaxEstimada",
    criterios:
      "Estimar a FCmax por 208 - 0.7*idade; preferir a FCmax medida em teste quando houver.",
    limites: null,
    incremento: null,
    sinaisAlerta: ["A conta 220 - idade subestima a FCmax em idosos."],
    aprovacao: "aprovada",
    refId: ["tanaka-fcmax-2001"],
    ano: 2026,
    versao: 1,
    confianca: "forte",
    formula: "FCmax = 208 - 0.7*idade",
  },
  {
    id: "aerobio-zona-karvonen",
    variavel: "intensidadeAerobia",
    criterios:
      "Zona-alvo em bpm a partir do percentual da FCmáx citado pela diretriz, e a fração EQUIVALENTE da reserva de frequência cardíaca derivada dela: FCR = FCmax - FCrep, fração = (bpm - FCrep) / FCR. Exige a FCrep medida. A zona NAO e calculada pelo metodo de Karvonen: a reserva aqui e leitura, nao origem.",
    limites: null,
    incremento: null,
    sinaisAlerta: ["Exige a FCrep (repouso) medida; sem ela, não aplicar a zona.", "Com FCrep medida muito alta, o piso da zona pode cair abaixo do repouso: nesse caso a zona nao vale e a intensidade guia por duração e percepção de esforço."],
    aprovacao: "aprovada",
    refId: ["karvonen-1957", "garber-2011"],
    ano: 2026,
    versao: 1,
    confianca: "forte",
    formula: "zona = [%inf*FCmax, %sup*FCmax]; fração de reserva equivalente = (bpm - FCrep) / (FCmax - FCrep)",
  },
  {
    id: "objetivo-hipertrofia-prioriza-volume",
    variavel: "volume",
    criterios:
      "Para hipertrofia, o volume é o principal driver; cerca de 10 ou mais séries por grupo muscular por semana serve de alvo prático na relação dose-resposta.",
    limites: null,
    incremento: null,
    sinaisAlerta: [],
    aprovacao: "aprovada",
    refId: ["schoenfeld-2017-volume"],
    ano: 2026,
    versao: 1,
    confianca: "forte",
    observacao:
      "Alvo prático, NÃO limiar: o corte de cerca de 10 séries por grupo por semana veio de análise categórica apenas com tendência (P=0,074).",
  },
  {
    id: "objetivo-forca-prioriza-carga",
    variavel: "carga",
    criterios:
      "Para força máxima, priorizar carga alta (acima de 60% de 1RM); o volume é secundário.",
    limites: { min: 60, unidade: "% de 1RM" },
    incremento: null,
    sinaisAlerta: [],
    aprovacao: "aprovada",
    refId: ["schoenfeld-carga-2017", "acsm-progressao-2009"],
    ano: 2026,
    versao: 2,
    confianca: "forte",
    // O "tipicamente 80 a 90%" que estava aqui NÃO existe na fonte: a metanálise citada só
    // compara dois braços, carga baixa (até 60% de 1RM) e carga alta (acima de 60%), e nem
    // estratificou o que acontece acima de 60%. Era número da casa dentro de uma regra marcada
    // como evidência FORTE, que é exatamente o que o cabeçalho deste arquivo proíbe. O que
    // sobra é o corte de 60%, esse sim da fonte. Para quem quiser a ponta pesada em número, o
    // ACSM 2009 fala em 1 a 6 RM, e por isso ele entra no refId.
    observacao:
      "O corte de 60% de 1RM é da metanálise citada, que compara carga baixa (até 60%) com carga alta (acima de 60%) e conclui que a força máxima vem da carga pesada. A metanálise NÃO estratifica faixas acima de 60%: qualquer número mais fino que isso é escolha do profissional, não da fonte.",
  },
  {
    id: "taper-pico-forca",
    variavel: "volume",
    // "a duração de fato testada nos ensaios citados", no plural, era falso: só Seppänen 2022
    // testou 2 semanas. Izquierdo 2007 testou QUATRO, e o resumo dele nem informa a magnitude
    // da redução de volume, então ele sustenta a DIREÇÃO (reduzir volume mantendo intensidade)
    // e não a duração nem o multiplicador.
    criterios:
      "Antes de um teste ou objetivo, cortar o volume para cerca de 0,5 (0,4 a 0,6) mantendo a carga, por 2 semanas, que é a janela testada em Seppänen 2022.",
    limites: { min: 0.4, max: 0.6, unidade: "multiplicador de volume" },
    incremento: null,
    sinaisAlerta: [],
    aprovacao: "aprovada",
    refId: ["seppanen-hakkinen-2022", "izquierdo-tapering-2007"],
    ano: 2026,
    versao: 2,
    confianca: "moderada",
    observacao:
      "A magnitude (multiplicador de 0,4 a 0,6) vem do braço em degrau de UM ensaio, com 14 homens de 21 a 30 anos, e não se transfere para o aluno de consultoria. Izquierdo 2007 testou 4 semanas e sustenta a direção, não a duração.",
    duracaoSemanas: { min: 2, max: 2 },
    intensidadeMantida: true,
  },

  /* ============ Regras DECLARADAS (evidência fraca; pendente; sem cravar número) ============ */
  {
    id: "deload-rotina-gestao-fadiga",
    variavel: "volume",
    criterios:
      "Prática comum de gestão de fadiga: cerca de 1 semana reduzindo séries, repetições e esforço, mantendo a frequência e a seleção de exercícios.",
    limites: null,
    incremento: null,
    sinaisAlerta: [],
    aprovacao: "pendente",
    refId: ["rogerson-deload-2024", "coleman-deload-2024"],
    ano: 2026,
    versao: 1,
    confianca: "fraca",
    observacao:
      "magnitude ideal com evidência limitada, sem ganho comprovado em treino recreativo; exibir como prática comum, decisão do profissional",
  },
  {
    id: "aerobio-progressao-fittvp",
    variavel: "volumeAerobio",
    criterios:
      "Avançar uma variável FITT-VP por vez, de forma gradual, volume e duração antes da intensidade, ajustando pela resposta.",
    limites: null,
    incremento: null,
    sinaisAlerta: [],
    aprovacao: "pendente",
    refId: ["garber-2011", "buist-gronorun-2007"],
    ano: 2026,
    versao: 1,
    confianca: "moderada",
    observacao: "Direção sólida, número fraco.",
    sugestaoPartida: "~5 a 10%/semana como PARTIDA, não número comprovado",
  },
  {
    id: "forca-incremento-por-segmento",
    variavel: "carga",
    criterios:
      "Dentro da faixa de 2 a 10%, usar a parte baixa (2 a 5%) em membros superiores e exercícios monoarticulares, e a alta (5 a 10%) em membros inferiores e multiarticulares.",
    limites: { min: 2, max: 10, unidade: "%" },
    incremento: null,
    sinaisAlerta: [],
    aprovacao: "pendente",
    refId: ["acsm-progressao-2009"],
    ano: 2026,
    versao: 1,
    confianca: "fraca",
    observacao:
      "convenção de campo, sem fonte primária anexada: a única parte citável é a faixa de 2 a 10% do position stand de 2009, que NÃO divide o incremento por segmento corporal. Não apresentar como evidência forte",
  },
];

/** Busca uma regra pelo id. */
export function getRegra(id: string): RegraProgressao | undefined {
  return REGRAS_PROGRESSAO.find((r) => r.id === id);
}

/** Todas as regras que governam uma variável de treino. */
export function regrasPorVariavel(variavel: VariavelRegra): RegraProgressao[] {
  return REGRAS_PROGRESSAO.filter((r) => r.variavel === variavel);
}
