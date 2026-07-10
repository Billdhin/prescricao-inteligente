import type { LearningCase } from "../types";

/**
 * Casos de prescrição do Aprender. O primeiro é totalmente funcional (etapas com
 * decisões e feedback prudente). Os demais existem com estrutura para receber os
 * passos completos pelo editorial. Linguagem sem diagnóstico.
 */

export const learningCases: LearningCase[] = [
  {
    id: "case-lombar",
    slug: "iniciante-dor-lombar",
    title: "Iniciante com histórico de dor lombar",
    description:
      "Aluna iniciante, sedentária há dois anos, com episódios de dor lombar e insegurança com agachamento. Objetivo: começar a treinar com segurança e adesão.",
    profile: "Mulher, 34 anos, iniciante",
    conditions: ["Dor lombar inespecífica recorrente"],
    goals: ["Iniciar treino de força", "Construir adesão", "Reduzir insegurança"],
    level: "intermediario",
    estimatedMinutes: 12,
    disciplines: ["Dor, limitações e adaptação", "Biomecânica do treinamento", "Raciocínio de prescrição"],
    complexity: "media",
    region: "Coluna lombar",
    status: "nao-iniciado",
    references: ["ref-a-validar-dor", "ref-diretriz-forca"],
    steps: [
      {
        id: "s1",
        order: 1,
        type: "contexto",
        title: "Contexto",
        content:
          "A aluna relata dor lombar que aparece em alguns movimentos e melhora com o tempo. Foi liberada para atividade física e não apresenta sinais de alerta. Refere insegurança específica com o agachamento livre.",
      },
      {
        id: "s2",
        order: 2,
        type: "dados",
        title: "Dados disponíveis",
        content:
          "Sem sinais de alerta. Boa disposição para treinar. Equipamentos: máquinas, polia, peso corporal. Sem dor em repouso. Tolera caminhada e bicicleta sem desconforto.",
      },
      {
        id: "s3",
        order: 3,
        type: "decisao",
        title: "Qual sua primeira decisão para a sessão inicial?",
        content: "Escolha o ponto de partida que melhor equilibra estímulo, segurança e adesão.",
        choices: [
          {
            id: "c1",
            label: "Começar com padrões guiados tolerados e construir confiança antes do agachamento livre.",
            tone: "recomendada",
            feedback:
              "Coerente: exercícios tolerados em máquina e peso corporal permitem estímulo de força e construção de confiança, reduzindo a insegurança antes de progredir para o agachamento livre.",
          },
          {
            id: "c2",
            label: "Insistir no agachamento livre desde a primeira sessão para não perder o padrão.",
            tone: "cautela",
            feedback:
              "A insegurança relatada tende a reduzir a adesão e a qualidade da execução. O padrão pode ser reintroduzido depois, com base tolerada; forçar agora troca adesão por pressa.",
          },
          {
            id: "c3",
            label: "Evitar qualquer exercício de membros inferiores por causa da dor lombar.",
            tone: "cautela",
            feedback:
              "Retirar todo estímulo de membros inferiores esvazia o objetivo sem necessidade. A aluna foi liberada e tolera vários movimentos; adaptar é diferente de evitar.",
          },
        ],
      },
      {
        id: "s4",
        order: 4,
        type: "consequencia",
        title: "Consequência",
        content:
          "Com padrões guiados tolerados, a aluna realiza a sessão sem piora da dor e relata mais confiança. Isso abre espaço para progredir amplitude e carga nas próximas semanas.",
      },
      {
        id: "s5",
        order: 5,
        type: "decisao",
        title: "Como progredir nas próximas semanas?",
        content: "Ela vem tolerando bem os estímulos, sem piora da dor. Qual o próximo passo mais coerente?",
        choices: [
          {
            id: "c1",
            label: "Introduzir o agachamento em amplitude confortável e progredir conforme a tolerância.",
            tone: "recomendada",
            feedback:
              "Boa progressão: reintroduzir o padrão em amplitude tolerada aproveita a confiança construída e mantém o objetivo, ajustando conforme a resposta.",
          },
          {
            id: "c2",
            label: "Manter apenas os exercícios guiados indefinidamente para evitar risco.",
            tone: "aceitavel",
            feedback:
              "É seguro, mas pode limitar a evolução se a aluna já tolera mais. A decisão depende do objetivo dela e do conforto observado.",
          },
          {
            id: "c3",
            label: "Adicionar carga máxima rapidamente para acelerar resultados.",
            tone: "cautela",
            feedback:
              "Progressão abrupta aumenta o risco de desconforto e de perda de adesão. A progressão gradual sustenta melhor o processo.",
          },
        ],
      },
      {
        id: "s6",
        order: 6,
        type: "feedback",
        title: "Síntese do raciocínio",
        content:
          "Adaptar é diferente de evitar. Com liberação e sem sinais de alerta, o caminho foi estimular o que é tolerado, construir confiança e reintroduzir o padrão de forma progressiva, sempre observando a resposta da dor e a adesão.",
      },
    ],
  },
  {
    id: "case-idoso",
    slug: "idoso-baixa-forca-mmii",
    title: "Pessoa idosa com baixa força de membros inferiores",
    description:
      "Foco em autonomia, marcha e prevenção de quedas. Técnica antes de carga, com progressões pequenas e frequentes.",
    profile: "Homem, 72 anos, destreinado",
    conditions: ["Baixa força de membros inferiores"],
    goals: ["Autonomia", "Equilíbrio", "Força funcional"],
    level: "intermediario",
    estimatedMinutes: 10,
    disciplines: ["Prescrição para grupos especiais", "Treinamento de força"],
    complexity: "media",
    region: "Membros inferiores",
    status: "nao-iniciado",
    references: ["ref-diretriz-forca"],
    steps: [
      { id: "s1", order: 1, type: "contexto", title: "Contexto", content: "Pessoa idosa com dificuldade para levantar da cadeira e subir escadas. Sem contraindicações conhecidas para exercício." },
      { id: "s2", order: 2, type: "dados", title: "Dados disponíveis", content: "Marcha lenta, receio de quedas. Consegue sentar e levantar com apoio. Motivada a ganhar autonomia." },
      { id: "s3", order: 3, type: "feedback", title: "Estrutura do caso", content: "Este caso está em construção editorial. O padrão de decisão priorizará força de inferiores, padrão de levantar e trabalho de equilíbrio com progressões pequenas." },
    ],
  },
  {
    id: "case-obesidade",
    slug: "obesidade-baixa-tolerancia",
    title: "Obesidade e baixa tolerância cardiorrespiratória",
    description:
      "Início do acompanhamento com foco em adesão, conforto articular e construção da base aeróbia.",
    profile: "Mulher, 41 anos, destreinada",
    conditions: ["Obesidade", "Baixa tolerância cardiorrespiratória"],
    goals: ["Emagrecimento", "Condicionamento", "Adesão"],
    level: "intermediario",
    estimatedMinutes: 10,
    disciplines: ["Fisiologia do exercício", "Prescrição para grupos especiais"],
    complexity: "media",
    status: "nao-iniciado",
    references: ["ref-oms-atividade"],
    steps: [
      { id: "s1", order: 1, type: "contexto", title: "Contexto", content: "Aluna com dispneia aos esforços leves e desconforto de joelho ao caminhar longos períodos. Motivada a começar." },
      { id: "s2", order: 2, type: "dados", title: "Dados disponíveis", content: "Tolera bicicleta melhor que caminhada. Sem sinais de alerta. Prefere sessões curtas no início." },
      { id: "s3", order: 3, type: "feedback", title: "Estrutura do caso", content: "Caso em construção editorial. O padrão priorizará modalidades de baixo impacto, volume antes de intensidade e reforço da adesão." },
    ],
  },
];
