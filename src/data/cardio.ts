/**
 * Modalidades aeróbicas / de locomoção para o COMPARADOR (bloco separado da musculação).
 * Aqui os marcadores de decisão MUDAM em relação ao treino de força: em vez de eficiência/
 * demanda articular de um exercício isolado, comparam-se gasto calórico, abrangência muscular
 * (quais grupos e quantos), impacto articular, demanda de hidratação, exigência técnica e
 * praticidade — os critérios que realmente separam andar, correr, pedalar, nadar, patinar etc.
 *
 * Base dos valores (educacional, ESTIMATIVA — não medição do aluno):
 * - MET (equivalente metabólico) do Compendium of Physical Activities (Ainsworth et al., 2011),
 *   intensidade moderada de referência.
 * - Gasto calórico ≈ MET × 3,5 × peso(kg) / 200 × minutos (ACSM). Aqui: pessoa de ~70 kg, 30 min
 *   contínuos, intensidade moderada → kcal ≈ MET × 36,75. Varia com peso, intensidade e aptidão.
 */

export type CardioNivel = "baixa" | "moderada" | "alta";
export type CardioImpacto = "baixo" | "moderado" | "alto";
export type CardioAbrangencia = "focada" | "regional" | "corpo todo";

export interface CardioModalidade {
  id: string;
  nome: string;
  /** slug do exercício correspondente no Laboratório, quando existe (foto + link). */
  slug?: string;
  /** pictograma da modalidade (fallback visual — o bloco é padronizado por ícone). */
  emoji: string;
  ambiente: string;
  met: number;
  /** kcal em 30 min contínuos p/ ~70 kg, intensidade moderada (derivado do MET). */
  gastoCalorico: number;
  /** grupos musculares recrutados de forma relevante (o nº deles é um marcador). */
  gruposMusculares: string[];
  abrangencia: CardioAbrangencia;
  impacto: CardioImpacto;
  /** demanda de reposição hídrica na sessão. */
  hidratacao: CardioNivel;
  /** exigência técnica / barreira de aprendizado. */
  tecnica: CardioNivel;
  /** praticidade: custo, logística e barreira de entrada (alta = mais acessível). */
  acessibilidade: CardioNivel;
  resumo: string;
  quandoUsar: string[];
  quandoEvitar: string[];
  /** nuance importante (ex.: perda hídrica subestimada na água). */
  observacao?: string;
}

export const cardioModalidades: CardioModalidade[] = [
  {
    id: "c-caminhada",
    nome: "Caminhada",
    slug: "caminhada-esteira",
    emoji: "🚶",
    ambiente: "Ar livre / esteira",
    met: 4.3,
    gastoCalorico: 160,
    gruposMusculares: ["Glúteos", "Quadríceps", "Isquiotibiais", "Panturrilhas", "Core"],
    abrangencia: "regional",
    impacto: "baixo",
    hidratacao: "moderada",
    tecnica: "baixa",
    acessibilidade: "alta",
    resumo: "Aeróbio mais acessível; dose fácil de controlar por tempo, ritmo e inclinação.",
    quandoUsar: ["Iniciantes e retomada de atividade", "Controle metabólico e pressórico com baixo risco"],
    quandoEvitar: ["Quando o objetivo exige alto gasto em pouco tempo", "Dor articular que piora ao caminhar em volume alto"],
  },
  {
    id: "c-corrida",
    nome: "Corrida",
    emoji: "🏃",
    ambiente: "Solo / esteira",
    met: 9.8,
    gastoCalorico: 360,
    gruposMusculares: ["Glúteos", "Quadríceps", "Isquiotibiais", "Panturrilhas", "Flexores do quadril", "Core", "Membros superiores"],
    abrangencia: "regional",
    impacto: "alto",
    hidratacao: "alta",
    tecnica: "baixa",
    acessibilidade: "alta",
    resumo: "Alto gasto por minuto, mas impacto articular elevado: exige base e progressão de volume.",
    quandoUsar: ["Aptidão já estabelecida e articulações tolerantes", "Meta de maior gasto energético em menos tempo"],
    quandoEvitar: ["Obesidade grave, osteoartrite ou dor articular ativa", "Iniciante absoluto sem base de caminhada"],
  },
  {
    id: "c-ciclismo",
    nome: "Ciclismo",
    slug: "bicicleta-ergometrica",
    emoji: "🚴",
    ambiente: "Solo ou ergômetro",
    met: 8.0,
    gastoCalorico: 295,
    gruposMusculares: ["Quadríceps", "Glúteos", "Isquiotibiais", "Panturrilhas"],
    abrangencia: "focada",
    impacto: "baixo",
    hidratacao: "moderada",
    tecnica: "baixa",
    acessibilidade: "moderada",
    resumo: "Bom gasto com baixo impacto articular; intensidade fácil de dosar pela carga.",
    quandoUsar: ["Dor de joelho/lombar que limita a corrida", "Controle fino de intensidade com segurança"],
    quandoEvitar: ["Desconforto por má regulagem do banco (ajuste antes de descartar)", "Objetivo de trabalhar membros superiores"],
  },
  {
    id: "c-natacao",
    nome: "Natação",
    emoji: "🏊",
    ambiente: "Aquático",
    met: 8.3,
    gastoCalorico: 305,
    gruposMusculares: ["Dorsais", "Peitoral", "Deltoides", "Tríceps", "Core", "Glúteos", "Pernas"],
    abrangencia: "corpo todo",
    impacto: "baixo",
    hidratacao: "baixa",
    tecnica: "alta",
    acessibilidade: "baixa",
    resumo: "Aeróbio de corpo todo e baixíssimo impacto, mas com barreira técnica e de acesso.",
    quandoUsar: ["Baixo impacto com alta demanda cardiorrespiratória", "Quem já domina o nado"],
    quandoEvitar: ["Sem base técnica de nado (considere hidroginástica antes)", "Ombro sensível em alguns estilos"],
    observacao: "Perda hídrica é facilmente subestimada na água: oriente hidratação mesmo sem sensação de suor.",
  },
  {
    id: "c-patins",
    nome: "Patins / inline",
    emoji: "🛼",
    ambiente: "Solo (rodas)",
    met: 7.5,
    gastoCalorico: 275,
    gruposMusculares: ["Glúteos", "Quadríceps", "Adutores e abdutores", "Isquiotibiais", "Panturrilhas", "Core"],
    abrangencia: "regional",
    impacto: "moderado",
    hidratacao: "moderada",
    tecnica: "alta",
    acessibilidade: "baixa",
    resumo: "Bom gasto e trabalho de quadril/estabilidade, com exigência de equilíbrio e risco de queda.",
    quandoUsar: ["Quem busca variedade e já tem equilíbrio", "Estímulo de glúteo médio e adutores"],
    quandoEvitar: ["Risco de queda relevante (idoso frágil, iniciante inseguro)", "Sem equipamento de proteção adequado"],
  },
  {
    id: "c-remo",
    nome: "Remo (ergômetro)",
    emoji: "🚣",
    ambiente: "Ergômetro / água",
    met: 7.0,
    gastoCalorico: 255,
    gruposMusculares: ["Dorsais", "Bíceps", "Core", "Quadríceps", "Glúteos", "Isquiotibiais"],
    abrangencia: "corpo todo",
    impacto: "baixo",
    hidratacao: "alta",
    tecnica: "moderada",
    acessibilidade: "moderada",
    resumo: "Aeróbio de corpo todo que soma puxada e empurrão de pernas; baixo impacto.",
    quandoUsar: ["Estímulo cardiorrespiratório com trabalho de membros superiores", "Baixo impacto com gasto elevado"],
    quandoEvitar: ["Técnica de tronco mal controlada (protege a lombar)", "Desconforto lombar ativo sem orientação"],
  },
  {
    id: "c-eliptico",
    nome: "Elíptico",
    slug: "eliptico",
    emoji: "🌀",
    ambiente: "Máquina",
    met: 5.0,
    gastoCalorico: 185,
    gruposMusculares: ["Quadríceps", "Glúteos", "Isquiotibiais", "Panturrilhas", "Peitoral", "Dorsais"],
    abrangencia: "corpo todo",
    impacto: "baixo",
    hidratacao: "moderada",
    tecnica: "baixa",
    acessibilidade: "moderada",
    resumo: "Baixo impacto com braços e pernas juntos; gasto moderado e boa segurança.",
    quandoUsar: ["Baixo impacto com trabalho de corpo todo", "Alternativa quando a corrida incomoda"],
    quandoEvitar: ["Equilíbrio muito limitado (prefira a bicicleta)", "Meta de alto gasto por minuto"],
  },
  {
    id: "c-corda",
    nome: "Pular corda",
    emoji: "🪢",
    ambiente: "Solo",
    met: 11.8,
    gastoCalorico: 435,
    gruposMusculares: ["Panturrilhas", "Quadríceps", "Ombros", "Antebraços", "Core"],
    abrangencia: "regional",
    impacto: "alto",
    hidratacao: "alta",
    tecnica: "moderada",
    acessibilidade: "alta",
    resumo: "Gasto altíssimo por minuto com equipamento barato, porém impacto alto e coordenação.",
    quandoUsar: ["Pouco tempo e articulações tolerantes", "Estímulo intenso e portátil"],
    quandoEvitar: ["Sobrepeso importante, osteoartrite ou dor de joelho/tornozelo", "Iniciante sem coordenação de saltos"],
  },
  {
    id: "c-marcha-aquatica",
    nome: "Marcha aquática",
    slug: "marcha-aquatica",
    emoji: "🌊",
    ambiente: "Aquático",
    met: 5.5,
    gastoCalorico: 200,
    gruposMusculares: ["Quadríceps", "Isquiotibiais", "Glúteos", "Core", "Flexores do quadril"],
    abrangencia: "regional",
    impacto: "baixo",
    hidratacao: "baixa",
    tecnica: "baixa",
    acessibilidade: "baixa",
    resumo: "Porta de entrada de impacto mínimo: a água sustenta o peso e reduz a dor articular.",
    quandoUsar: ["Obesidade grave e dor articular que limita o solo", "Retomada muito cautelosa de atividade"],
    quandoEvitar: ["Sem acesso seguro à piscina", "Quando o objetivo exige alto gasto por sessão"],
    observacao: "A água mascara o suor: a perda hídrica ocorre mesmo assim; oriente hidratação.",
  },
  {
    id: "c-escada",
    nome: "Subir escadas",
    emoji: "🪜",
    ambiente: "Solo",
    met: 8.0,
    gastoCalorico: 295,
    gruposMusculares: ["Glúteos", "Quadríceps", "Isquiotibiais", "Panturrilhas", "Core"],
    abrangencia: "regional",
    impacto: "moderado",
    hidratacao: "alta",
    tecnica: "baixa",
    acessibilidade: "alta",
    resumo: "Alto gasto e forte estímulo de glúteo/quadríceps, disponível em quase qualquer lugar.",
    quandoUsar: ["Gasto elevado sem equipamento", "Estímulo de membros inferiores no aeróbio"],
    quandoEvitar: ["Dor de joelho na descida (priorize só a subida)", "Equilíbrio comprometido sem corrimão"],
  },
];

export function getCardio(id: string) {
  return cardioModalidades.find((m) => m.id === id);
}

/** Foto da modalidade em public/cardio/<slug>.webp (slug = id sem o prefixo "c-"). */
export function cardioImagem(id: string) {
  return `/cardio/${id.replace(/^c-/, "")}.webp`;
}

/** Mapa qualitativo → largura de barra (0..100) para os marcadores de nível. */
export const NIVEL_BAR: Record<CardioNivel, number> = { baixa: 30, moderada: 60, alta: 92 };
export const IMPACTO_BAR: Record<CardioImpacto, number> = { baixo: 28, moderado: 60, alto: 92 };
export const NIVEL_LABEL: Record<CardioNivel, string> = { baixa: "Baixa", moderada: "Moderada", alta: "Alta" };
export const IMPACTO_LABEL: Record<CardioImpacto, string> = { baixo: "Baixo", moderado: "Moderado", alto: "Alto" };
