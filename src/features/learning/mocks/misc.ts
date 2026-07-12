import type {
  LearningRecommendation,
  KnowledgeNode,
  Competency,
  QuickAnswer,
  StudyObjective,
} from "../types";

/* --------------------------- Recomendações (Atender → Aprender) -------------- */
// Mock: derivadas dos perfis de alunos acompanhados. O repository permite
// substituir esta fonte por uma consulta real aos alunos no futuro.

export const recommendations: LearningRecommendation[] = [
  {
    id: "rec-1",
    sourceType: "aluno",
    sourceLabel: "Alunos com histórico de dor lombar",
    contentType: "conceito",
    contentTitle: "Como avaliar uma queixa de dor antes do treino",
    href: "/aprender/consulta?q=dor%20antes%20do%20treino",
    discipline: "Dor, limitações e adaptação",
    estimatedMinutes: 7,
    level: "intermediario",
    reason: "Recomendado porque você acompanha alunos com histórico de dor lombar.",
    priority: 1,
  },
  {
    id: "rec-2",
    sourceType: "grupo",
    sourceLabel: "Grupo especial: dor lombar",
    contentType: "mecanismo",
    contentTitle: "Flexão de coluna: risco, contexto e tolerância",
    href: "/aprender/conteudos/amplitude-e-demanda",
    discipline: "Biomecânica do treinamento",
    estimatedMinutes: 8,
    level: "intermediario",
    reason: "Recomendado porque há alunos com carga na coluna a considerar.",
    priority: 2,
  },
  {
    id: "rec-3",
    sourceType: "prescricao",
    sourceLabel: "Prescrições recentes",
    contentType: "aplicacao",
    contentTitle: "Como adaptar exercícios sem retirar estímulos desnecessariamente",
    href: "/aprender/conteudos/por-que-joelho-ultrapassa-o-pe",
    discipline: "Raciocínio de prescrição",
    estimatedMinutes: 8,
    level: "intermediario",
    reason: "Recomendado porque você tem adaptado exercícios nas últimas prescrições.",
    priority: 3,
  },
  {
    id: "rec-4",
    sourceType: "aluno",
    sourceLabel: "Iniciante com dor lombar recorrente",
    contentType: "caso",
    contentTitle: "Caso: iniciante com dor lombar recorrente",
    href: "/aprender/casos/iniciante-dor-lombar",
    discipline: "Dor, limitações e adaptação",
    estimatedMinutes: 12,
    level: "intermediario",
    reason: "Recomendado porque combina com um perfil que você acompanha.",
    priority: 4,
  },
  {
    id: "rec-5",
    sourceType: "grupo",
    sourceLabel: "Grupo especial: hipertensão",
    contentType: "conceito",
    contentTitle: "Como a hipertensão modifica intensidade e monitoramento",
    href: "/aprender/consulta?q=hipertens%C3%A3o",
    discipline: "Prescrição para grupos especiais",
    estimatedMinutes: 9,
    level: "intermediario",
    reason: "Recomendado porque você atende alunos com pressão a monitorar.",
    priority: 5,
  },
  {
    id: "rec-6",
    sourceType: "avaliacao",
    sourceLabel: "Avaliações com queixa de dor",
    contentType: "mecanismo",
    contentTitle: "Como interpretar a dor durante o exercício",
    href: "/aprender/consulta?q=dor%20durante%20o%20exerc%C3%ADcio",
    discipline: "Dor, limitações e adaptação",
    estimatedMinutes: 7,
    level: "intermediario",
    reason: "Recomendado porque avaliações recentes registraram dor.",
    priority: 6,
  },
];

/* ------------------------------ Mapa do conhecimento ------------------------ */

export const knowledgeCenter = { id: "centro", label: "Decisão de prescrição" };

export const knowledgeNodes: KnowledgeNode[] = [
  // Camada 1: ciências fundamentais
  { id: "km-anatomia", label: "Anatomia", layer: 1, colorToken: "primary", tooltip: "Anatomia: quais estruturas realmente atuam em cada movimento.", href: "/aprender/disciplinas/anatomia-funcional" },
  { id: "km-fisiologia", label: "Fisiologia", layer: 1, colorToken: "analysis", tooltip: "Fisiologia: como os sistemas respondem e se adaptam ao esforço.", href: "/aprender/disciplinas/fisiologia-humana" },
  { id: "km-bioquimica", label: "Bioquímica", layer: 1, colorToken: "success", tooltip: "Bioquímica: as vias energéticas que sustentam o exercício.", href: "/aprender/disciplinas/bioquimica-metabolismo" },
  { id: "km-cinesiologia", label: "Cinesiologia", layer: 1, colorToken: "primary", tooltip: "Cinesiologia: planos, eixos e ações que descrevem o movimento.", href: "/aprender/disciplinas/cinesiologia" },
  { id: "km-biomecanica", label: "Biomecânica", layer: 1, colorToken: "analysis", tooltip: "Biomecânica: como forças, momentos, posições e equipamentos modificam uma tarefa.", href: "/aprender/disciplinas/biomecanica-do-treinamento" },
  // Camada 2: aplicadas
  { id: "km-avaliacao", label: "Avaliação", layer: 2, colorToken: "primary", tooltip: "Avaliação: medir e interpretar para decidir.", href: "/aprender/disciplinas/avaliacao-fisica-e-funcional" },
  { id: "km-forca", label: "Treino de força", layer: 2, colorToken: "cta", tooltip: "Força: variáveis e progressões para o objetivo.", href: "/aprender/disciplinas/treinamento-de-forca" },
  { id: "km-cardio", label: "Cardiorrespiratório", layer: 2, colorToken: "analysis", tooltip: "Cardio: construir aptidão aeróbia com segurança.", href: "/aprender/disciplinas/treinamento-cardiorrespiratorio" },
  { id: "km-mobilidade", label: "Mobilidade", layer: 2, colorToken: "success", tooltip: "Mobilidade: amplitude útil e função articular.", href: "/aprender/disciplinas/mobilidade-e-flexibilidade" },
  { id: "km-carga", label: "Controle de carga", layer: 2, colorToken: "cta", tooltip: "Carga: dose, resposta e recuperação.", href: "/aprender/disciplinas/controle-de-carga-e-recuperacao" },
  { id: "km-periodizacao", label: "Periodização", layer: 2, colorToken: "analysis", tooltip: "Periodização: organizar estímulos no tempo.", href: "/aprender/disciplinas/planejamento-e-periodizacao" },
  // Camada 3: perfis e condições
  { id: "km-obesidade", label: "Obesidade", layer: 3, colorToken: "primary", tooltip: "Como o objetivo e a tolerância orientam o início.", href: "/special-groups" },
  { id: "km-diabetes", label: "Diabetes", layer: 3, colorToken: "analysis", tooltip: "Cuidados glicêmicos e progressão segura.", href: "/special-groups" },
  { id: "km-hipertensao", label: "Hipertensão", layer: 3, colorToken: "cta", tooltip: "Intensidade, respiração e monitoramento.", href: "/special-groups" },
  { id: "km-idoso", label: "Pessoa idosa", layer: 3, colorToken: "success", tooltip: "Força, equilíbrio e autonomia.", href: "/special-groups" },
  { id: "km-osteoartrite", label: "Osteoartrite", layer: 3, colorToken: "primary", tooltip: "Carga controlada e modulação pela dor.", href: "/special-groups" },
  { id: "km-lombar", label: "Dor lombar", layer: 3, colorToken: "analysis", tooltip: "Exercício como aliado, com atenção a sinais de alerta.", href: "/aprender/casos/iniciante-dor-lombar" },
  { id: "km-iniciantes", label: "Iniciantes", layer: 3, colorToken: "cta", tooltip: "Técnica antes de carga e construção do hábito.", href: "/aprender/disciplinas/treinamento-de-forca" },
  { id: "km-desempenho", label: "Desempenho", layer: 3, colorToken: "success", tooltip: "Otimizar o treino para metas de rendimento.", href: "/aprender/disciplinas/planejamento-e-periodizacao" },
];

/* ------------------------------ Competências -------------------------------- */

export const competencies: Competency[] = [
  { id: "comp-fundamentos", label: "Fundamentos", description: "Domínio das ciências básicas do movimento.", value: 55 },
  { id: "comp-analise", label: "Análise do movimento", description: "Ler um exercício em termos de forças, momentos e demandas.", value: 42 },
  { id: "comp-avaliacao", label: "Avaliação", description: "Transformar medidas em decisões.", value: 30 },
  { id: "comp-prescricao", label: "Prescrição", description: "Escolher e justificar estímulos.", value: 48 },
  { id: "comp-adaptacao", label: "Adaptação", description: "Ajustar sem retirar o objetivo.", value: 38 },
  { id: "comp-grupos", label: "Grupos especiais", description: "Cuidados por condição e população.", value: 25 },
  { id: "comp-evidencia", label: "Evidência científica", description: "Ler estudos e diretrizes com senso crítico.", value: 20 },
  { id: "comp-comunicacao", label: "Comunicação profissional", description: "Explicar decisões e sustentar adesão.", value: 33 },
];

/* --------------------------- Estudar por objetivo --------------------------- */

export const studyObjectives: StudyObjective[] = [
  { id: "obj-mecanismo", label: "Entender um mecanismo", icon: "Workflow", description: "Como e por que algo acontece no corpo.", count: 18, href: "/aprender/disciplinas/biomecanica-do-treinamento" },
  { id: "obj-comparar", label: "Comparar exercícios", icon: "GitCompare", description: "Ver o que muda entre opções parecidas.", count: 12, href: "/comparador" },
  { id: "obj-avaliar", label: "Avaliar um aluno", icon: "ClipboardCheck", description: "Escolher e interpretar testes e medidas.", count: 9, href: "/aprender/disciplinas/avaliacao-fisica-e-funcional" },
  { id: "obj-adaptar", label: "Adaptar para uma condição", icon: "HeartPulse", description: "Ajustar cuidados por perfil e condição.", count: 14, href: "/special-groups" },
  { id: "obj-progressao", label: "Montar uma progressão", icon: "TrendingUp", description: "Organizar estímulos no tempo.", count: 11, href: "/aprender/disciplinas/planejamento-e-periodizacao" },
  { id: "obj-evidencia", label: "Interpretar evidências", icon: "BookOpenCheck", description: "Ler estudos e diretrizes com critério.", count: 7, href: "/aprender/biblioteca" },
  { id: "obj-caso", label: "Resolver um caso", icon: "Stethoscope", description: "Treinar a decisão em situações reais.", count: 12, href: "/aprender/casos" },
];

/* ------------------------- Consulta rápida (respostas) ---------------------- */

export const quickAnswers: QuickAnswer[] = [
  {
    id: "qa-joelho",
    question: "O joelho pode ultrapassar a ponta do pé no agachamento?",
    keywords: ["joelho", "ponta do pe", "agachamento", "joelho avancar", "tibia"],
    summary:
      "Restringir o avanço do joelho não elimina a demanda: ela migra para o quadril e o tronco. A posição deve servir ao objetivo e à alavanca do aluno.",
    keyPoints: [
      "A demanda é redistribuída, não retirada.",
      "Antropometria (comprimento do fêmur) muda a estratégia ideal.",
      "Não existe posição universalmente certa ou errada.",
    ],
    observe: ["Objetivo do exercício", "Mobilidade de tornozelo", "Tolerância e desconforto relatado"],
    application: "Permita o avanço natural quando tolerado; use restrições como adaptação pontual, não como regra.",
    limits: "A relação com carga articular foi estudada em contextos específicos; ainda há incerteza para generalizar.",
    relatedLessons: ["por-que-joelho-ultrapassa-o-pe", "braco-de-momento"],
    relatedCases: ["iniciante-dor-lombar"],
    references: ["ref-escamilla-agachamento"],
  },
  {
    id: "qa-hipertensao",
    question: "Como treinar um aluno com hipertensão?",
    keywords: ["hipertensao", "pressao alta", "pressao", "treinar hipertenso"],
    summary:
      "O foco é intensidade controlada, respiração contínua (evitar apneia) e monitoramento. A liberação e os limites seguem o profissional de saúde do aluno.",
    keyPoints: [
      "Cargas leves a moderadas com respiração contínua.",
      "Evitar manobra de Valsalva.",
      "Monitorar sintomas e a resposta ao esforço.",
    ],
    observe: ["Pressão de repouso", "Sintomas (tontura, falta de ar)", "Medicação e autorização"],
    application: "Prefira progressão gradual e use o Semáforo de Liberação antes de sessões mais intensas.",
    limits: "Valores de referência orientam, mas a conduta clínica é do profissional de saúde responsável.",
    relatedCases: [],
    references: ["ref-oms-atividade"],
  },
  {
    id: "qa-lombar-terra",
    question: "Dor lombar e levantamento terra: pode?",
    keywords: ["dor lombar", "levantamento terra", "terra", "lombar", "coluna"],
    summary:
      "Dor lombar não contraindica automaticamente a dobradiça de quadril. A tolerância, a amplitude e a carga guiam a decisão; sinais de alerta pedem avaliação de profissional de saúde.",
    keyPoints: [
      "Exercício costuma ser aliado na lombalgia inespecífica.",
      "Amplitude e carga são ajustáveis.",
      "Sinais de alerta pedem encaminhamento.",
    ],
    observe: ["Intensidade e comportamento da dor", "Sinais de alerta (dor noturna, déficit neurológico)", "Tolerância à carga"],
    application: "Comece com amplitude e carga confortáveis; progrida conforme a resposta, sem retirar o padrão por padrão.",
    limits: "A leitura da dor é individual; este conteúdo não substitui avaliação de profissional de saúde.",
    relatedLessons: ["amplitude-e-demanda"],
    references: ["ref-a-validar-dor"],
  },
  {
    id: "qa-intervalo",
    question: "Qual intervalo usar para hipertrofia?",
    keywords: ["intervalo", "descanso", "hipertrofia", "pausa entre series"],
    summary:
      "Intervalos moderados a longos (em geral de 1 a 3 minutos) tendem a sustentar melhor o volume com carga, que é um motor central da hipertrofia.",
    keyPoints: [
      "O volume com boa carga importa mais que encurtar o intervalo.",
      "Intervalos muito curtos podem reduzir o desempenho nas séries seguintes.",
      "Ajuste ao exercício e ao nível do aluno.",
    ],
    observe: ["Recuperação entre séries", "Qualidade das repetições", "Objetivo do bloco"],
    application: "Use intervalos que preservem a qualidade das séries; não sacrifique carga por pressa.",
    limits: "Faixas são orientações; a resposta individual varia.",
    references: ["ref-diretriz-forca"],
  },
  {
    id: "qa-fadiga",
    question: "O que é fadiga periférica?",
    keywords: ["fadiga periferica", "fadiga", "cansaco muscular"],
    summary:
      "É a queda de desempenho por fatores no próprio músculo (acúmulo de metabólitos, alterações na contração), distinta da fadiga central (sistema nervoso).",
    keyPoints: [
      "Origem no músculo, não no comando central.",
      "Influencia repetições e qualidade da série.",
      "Recuperação adequada a modula.",
    ],
    observe: ["Queda de repetições", "Percepção de esforço", "Recuperação entre sessões"],
    application: "Distribua o volume e a recuperação para manter a qualidade do estímulo.",
    limits: "Os mecanismos ainda são objeto de estudo; use os conceitos como guia prático.",
    references: ["ref-borg-pse"],
  },
  {
    id: "qa-forca-potencia",
    question: "Qual a diferença entre força e potência?",
    keywords: ["forca e potencia", "potencia", "diferenca forca potencia"],
    summary:
      "Força é a capacidade de gerar tensão; potência é força aplicada com velocidade (trabalho por tempo). Objetivos diferentes pedem métodos diferentes.",
    keyPoints: [
      "Força: quanto se produz de tensão.",
      "Potência: força x velocidade.",
      "Treinos enfatizam variáveis distintas.",
    ],
    observe: ["Objetivo do aluno", "Velocidade de execução", "Carga relativa"],
    application: "Defina o objetivo antes de escolher carga, velocidade e volume.",
    limits: "A transferência entre capacidades depende do contexto e da especificidade.",
    references: ["ref-diretriz-forca"],
  },
];
