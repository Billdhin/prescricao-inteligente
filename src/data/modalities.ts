/**
 * Modalidades de exercício (camada acima de exercícios isolados). Conteúdo educacional e
 * prudente para apoiar a decisão do profissional — não é conduta clínica. Onde caberia um
 * número de diretriz, usar formulação genérica ("validar com diretriz específica").
 */

export type Impacto = "baixo" | "moderado" | "alto";
export type Ambiente = "solo" | "aquático" | "máquina" | "livre";

export interface Modalidade {
  id: string;
  nome: string;
  resumo: string;
  impacto: Impacto;
  ambiente: Ambiente;
  indicacoes: string[];
  cautelas: string[];
  vantagens: string[];
  limitacoes: string[];
  /** ids de monitoringParameters mais úteis nesta modalidade */
  parametrosUteis: string[];
  quandoInicio: string;
  quandoProgressao: string;
  quandoEvitar: string;
  /** como monitorar intensidade quando a FC não é confiável/viável */
  monitorarSemFC: string;
}

export const modalities: Modalidade[] = [
  {
    id: "m-hidro",
    nome: "Hidroginástica",
    resumo: "Exercício em piscina com apoio da água, reduzindo impacto e carga articular.",
    impacto: "baixo",
    ambiente: "aquático",
    indicacoes: [
      "Obesidade grave e baixa tolerância à caminhada",
      "Dor articular (joelho, lombar) que limita o solo",
      "Iniciantes destreinados que precisam de baixo impacto",
    ],
    cautelas: [
      "Acesso à piscina e segurança aquática",
      "Termorregulação e conforto no ambiente",
    ],
    vantagens: ["Baixo impacto articular", "Boa adesão inicial", "Permite volume com menos dor"],
    limitacoes: ["Menor estímulo de força máxima", "FC pouco confiável na água"],
    parametrosUteis: ["p-rpe", "p-fala", "p-dispneia", "p-dor", "p-adesao"],
    quandoInicio: "Ótima porta de entrada quando o solo é doloroso ou o aluno cansa rápido.",
    quandoProgressao: "Aumentar tempo/velocidade e adicionar resistência antes de migrar ao solo.",
    quandoEvitar: "Sem acesso seguro à piscina ou contraindicação ao meio aquático.",
    monitorarSemFC:
      "Na água a FC costuma ser pouco prática — priorize PSE, teste da fala e dispneia percebida.",
  },
  {
    id: "m-natacao",
    nome: "Natação",
    resumo: "Nado contínuo, aeróbio de baixo impacto que exige técnica.",
    impacto: "baixo",
    ambiente: "aquático",
    indicacoes: ["Baixo impacto com maior demanda cardiorrespiratória", "Quem já tem base aquática"],
    cautelas: ["Requer domínio técnico", "Ombro sensível em alguns nados"],
    vantagens: ["Baixo impacto", "Bom estímulo aeróbio"],
    limitacoes: ["Barreira técnica para iniciantes", "FC pouco confiável na água"],
    parametrosUteis: ["p-rpe", "p-fala", "p-dispneia", "p-adesao"],
    quandoInicio: "Só como início se já houver domínio de nado; senão, hidroginástica primeiro.",
    quandoProgressao: "Progredir distância/intervalos conforme tolerância e técnica.",
    quandoEvitar: "Sem base técnica ou com desconforto de ombro relevante em certos nados.",
    monitorarSemFC: "Use PSE e teste da fala nas pausas; observe dispneia entre séries.",
  },
  {
    id: "m-caminhada",
    nome: "Caminhada",
    resumo: "Aeróbio acessível, dose-controlável por tempo e ritmo.",
    impacto: "moderado",
    ambiente: "solo",
    indicacoes: ["Iniciantes", "Hipertensão e risco metabólico", "Progressão a partir do meio aquático"],
    cautelas: ["Dor articular de joelho/lombar com volume alto", "Calçado e terreno"],
    vantagens: ["Acessível e barata", "Fácil de progredir", "Boa adesão"],
    limitacoes: ["Pode gerar dor articular em obesidade grave/osteoartrite se o volume subir rápido"],
    parametrosUteis: ["p-fala", "p-rpe", "p-fc", "p-dor", "p-adesao", "p-volume"],
    quandoInicio: "Bom início para quem tolera o impacto; comece por tempo curto e ritmo confortável.",
    quandoProgressao: "Aumentar duração antes da velocidade; depois incluir inclinação.",
    quandoEvitar: "Dor articular que piora com o passo — considere meio aquático ou bicicleta.",
    monitorarSemFC: "Teste da fala é muito prático ao ar livre; combine com PSE.",
  },
  {
    id: "m-bike",
    nome: "Bicicleta ergométrica",
    resumo: "Aeróbio de baixo impacto articular, com carga ajustável.",
    impacto: "baixo",
    ambiente: "máquina",
    indicacoes: ["Dor de joelho/lombar que limita caminhada", "Obesidade grave", "Controle fino de intensidade"],
    cautelas: ["Ajuste correto do banco", "Conforto do assento em sessões longas"],
    vantagens: ["Baixo impacto", "Intensidade fácil de dosar", "Seguro para iniciantes"],
    limitacoes: ["Menor gasto por sessão que corrida", "Desconforto de assento"],
    parametrosUteis: ["p-rpe", "p-fc", "p-fala", "p-dor", "p-adesao"],
    quandoInicio: "Excelente início quando a caminhada dói; regule a carga para esforço leve.",
    quandoProgressao: "Subir tempo e depois resistência; incluir blocos intervalados leves.",
    quandoEvitar: "Desconforto lombar por má postura no equipamento — ajuste antes de evitar.",
    monitorarSemFC: "PSE e teste da fala funcionam bem; a carga externa (nível) ajuda a dosar.",
  },
  {
    id: "m-eliptico",
    nome: "Elíptico",
    resumo: "Aeróbio de baixo impacto com movimento de membros superiores e inferiores.",
    impacto: "baixo",
    ambiente: "máquina",
    indicacoes: ["Baixo impacto com maior gasto que a bike", "Quem tolera ficar em pé"],
    cautelas: ["Equilíbrio em idosos frágeis", "Coordenação inicial"],
    vantagens: ["Baixo impacto", "Trabalha corpo todo"],
    limitacoes: ["Curva de coordenação", "Menos acessível fora da academia"],
    parametrosUteis: ["p-rpe", "p-fc", "p-fala", "p-adesao"],
    quandoInicio: "Alternativa de baixo impacto quando há equilíbrio e coordenação suficientes.",
    quandoProgressao: "Aumentar tempo/resistência gradualmente.",
    quandoEvitar: "Equilíbrio muito limitado — prefira bicicleta.",
    monitorarSemFC: "PSE e teste da fala; observe estabilidade e conforto.",
  },
  {
    id: "m-musculacao",
    nome: "Musculação / treino de força",
    resumo: "Trabalho de força com máquinas, pesos livres ou peso corporal.",
    impacto: "baixo",
    ambiente: "máquina",
    indicacoes: ["Todos os grupos, com progressão adequada", "Idosos (força e função)", "Metabólico"],
    cautelas: ["Técnica antes de carga", "Manobra de Valsalva em hipertensos"],
    vantagens: ["Ganho de força e função", "Baixo impacto quando bem conduzida", "Efeito metabólico"],
    limitacoes: ["Requer supervisão técnica inicial", "Progressão precisa ser individualizada"],
    parametrosUteis: ["p-rpe", "p-dor", "p-fadiga", "p-recuperacao", "p-pa", "p-fc"],
    quandoInicio: "Começar com máquinas guiadas, amplitude confortável e ênfase técnica.",
    quandoProgressao: "Progredir carga só com técnica estável; aumentar séries/exercícios gradualmente.",
    quandoEvitar: "Não evitar em geral — adaptar amplitude/carga; cuidado com apneia em hipertensos.",
    monitorarSemFC: "PSE por série (repetições em reserva) e dor articular guiam melhor que a FC.",
  },
  {
    id: "m-funcional",
    nome: "Treinamento funcional",
    resumo: "Padrões de movimento (empurrar, puxar, agachar, deslocar) com foco em função.",
    impacto: "moderado",
    ambiente: "livre",
    indicacoes: ["Melhora de autonomia e coordenação", "Fases mais avançadas da jornada"],
    cautelas: ["Complexidade técnica em iniciantes", "Impacto de alguns exercícios"],
    vantagens: ["Transfere para o dia a dia", "Variedade e engajamento"],
    limitacoes: ["Pode ser complexo demais no início", "Controle de intensidade menos preciso"],
    parametrosUteis: ["p-rpe", "p-dor", "p-fadiga", "p-adesao"],
    quandoInicio: "Em geral não é o início ideal para muito destreinados; entra como progressão.",
    quandoProgressao: "Introduzir quando houver base de força e controle motor.",
    quandoEvitar: "Iniciantes frágeis ou com dor não controlada — simplifique antes.",
    monitorarSemFC: "PSE global da sessão e dor articular; observe qualidade do movimento.",
  },
  {
    id: "m-mobilidade",
    nome: "Mobilidade / flexibilidade",
    resumo: "Trabalho de amplitude, controle articular e relaxamento.",
    impacto: "baixo",
    ambiente: "solo",
    indicacoes: ["Complemento em quase todos os grupos", "Dor lombar e rigidez"],
    cautelas: ["Não forçar amplitude com dor", "Não substitui estímulo de força/aeróbio"],
    vantagens: ["Baixo risco", "Ajuda conforto e adesão"],
    limitacoes: ["Estímulo cardiorrespiratório/força baixo isoladamente"],
    parametrosUteis: ["p-dor", "p-rpe", "p-adesao"],
    quandoInicio: "Ótimo componente de aquecimento/volta à calma desde a fase 1.",
    quandoProgressao: "Manter como suporte enquanto força e aeróbio progridem.",
    quandoEvitar: "Como estímulo único quando o objetivo exige força/aeróbio.",
    monitorarSemFC: "Guie por conforto e dor; sem necessidade de FC.",
  },
  {
    id: "m-combinado",
    nome: "Treino combinado (força + aeróbio)",
    resumo: "Sessões que unem trabalho de força e componente cardiorrespiratório.",
    impacto: "moderado",
    ambiente: "livre",
    indicacoes: ["Fases de desenvolvimento e manutenção", "Eficiência de tempo"],
    cautelas: ["Dose total (fadiga acumulada)", "Ordem e recuperação entre estímulos"],
    vantagens: ["Bom custo-benefício de tempo", "Estímulo amplo"],
    limitacoes: ["Maior demanda de recuperação", "Menos indicado no início absoluto"],
    parametrosUteis: ["p-rpe", "p-fadiga", "p-recuperacao", "p-fc", "p-adesao"],
    quandoInicio: "Raramente é o ponto de partida; entra quando há base de força e aeróbio.",
    quandoProgressao: "Ajustar volume total observando fadiga e recuperação.",
    quandoEvitar: "Iniciante absoluto ou recuperação já comprometida.",
    monitorarSemFC: "sRPE (PSE × tempo) para estimar carga interna; observe recuperação.",
  },
];

export function getModalidade(id: string) {
  return modalities.find((m) => m.id === id);
}

/** Caminho da foto da modalidade em public/modalities/<id>.webp (com fallback no componente). */
export function modalidadeImagem(id: string) {
  return `/modalities/${id}.webp`;
}

// Laranja (cta) reservado para AÇÃO/CTA. Impacto alto usa âmbar (warning); moderado, neutro.
export const impactoTone: Record<Impacto, "success" | "neutral" | "warning"> = {
  baixo: "success",
  moderado: "neutral",
  alto: "warning",
};
