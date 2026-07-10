import type { Lesson, LessonBlock, Nivel, LessonType } from "../types";

/**
 * Aulas de "Biomecânica do treinamento". A aula-demonstração completa é
 * "por-que-joelho-ultrapassa-o-pe" (renderizada por blocos). As demais são
 * aulas leves (hero + conceito + aplicação + referências) para que todas as
 * rotas de conteúdo existam e sejam coerentes; ganham profundidade no editorial.
 *
 * As formas de `content` de cada bloco são consumidas pelo renderer em
 * features/learning/blocks. Mantê-las em sincronia com os componentes de bloco.
 */

let ordem = 0;
const b = (type: LessonBlock["type"], content: unknown, extra: Partial<LessonBlock> = {}): LessonBlock => ({
  id: `blk-${type}-${++ordem}`,
  type,
  order: ordem,
  content,
  ...extra,
});

/* ----------------------- AULA COMPLETA DE DEMONSTRAÇÃO ----------------------- */

const demoBlocks: LessonBlock[] = [
  b("hero", {
    kicker: "Análise do exercício",
    text: "Restringir uma articulação não elimina a demanda: ela é redistribuída. Entender para onde ela vai é o que permite adaptar sem perder o objetivo.",
  }),
  b("prescription_question", {
    question:
      "Ao limitar deliberadamente o avanço do joelho, o que acontece com o quadril, o tronco e a distribuição das demandas?",
    cta: "Explorar visualmente",
  }),
  b(
    "interactive_figure",
    {
      leftLabel: "Maior avanço do joelho",
      rightLabel: "Menor avanço do joelho",
      caption:
        "Diagrama esquemático de comparação. As posições são ilustrativas; a análise real depende da antropometria e da execução de cada aluno.",
      layers: [
        { id: "vetores", label: "Mostrar vetores" },
        { id: "momentos", label: "Braços de momento" },
        { id: "joelho", label: "Destacar joelho" },
        { id: "quadril", label: "Destacar quadril" },
        { id: "tronco", label: "Comparar tronco" },
      ],
    },
    { title: "Compare as duas estratégias" },
  ),
  b(
    "short_text",
    {
      variant: "observe",
      items: [
        "Restringir o joelho tende a exigir outra estratégia do quadril e do tronco.",
        "A demanda não desaparece; ela é redistribuída.",
        "A decisão depende do objetivo, da tolerância e da execução individual.",
      ],
    },
    { title: "O que observar" },
  ),
  b(
    "mechanism_flow",
    {
      steps: [
        { label: "Restrição do joelho", detail: "A tíbia avança menos sobre o pé." },
        { label: "Deslocamento do quadril", detail: "O quadril tende a recuar para manter o equilíbrio." },
        { label: "Alteração do tronco", detail: "O tronco inclina mais à frente para compensar." },
        { label: "Mudança dos braços de momento", detail: "As distâncias das forças às articulações mudam." },
        { label: "Redistribuição das demandas", detail: "A carga migra entre joelho, quadril e coluna." },
      ],
    },
    { title: "Entenda o mecanismo" },
  ),
  b(
    "comparison",
    {
      leftTitle: "Maior avanço do joelho",
      rightTitle: "Menor avanço do joelho",
      leftItems: [
        "Pode facilitar uma organização mais vertical do tronco.",
        "Pode aumentar a demanda extensora do joelho.",
        "Pode ser compatível com execução segura em diferentes contextos.",
      ],
      rightItems: [
        "Pode aumentar a participação do quadril.",
        "Pode exigir maior inclinação do tronco.",
        "Pode ser utilizado como adaptação em situações específicas.",
      ],
      note: "Nenhuma das colunas é automaticamente certa ou errada; ambas são estratégias com trocas.",
    },
    { title: "Compare decisões" },
  ),
  b(
    "practical_application",
    {
      text: "Em vez de classificar uma execução como certa ou errada, observe objetivo, antropometria, mobilidade, tolerância, carga e estratégia de movimento.",
    },
    { title: "Aplicação prática" },
  ),
  b(
    "professional_case",
    {
      prompt:
        "Aluno iniciante, fêmur relativamente longo, boa mobilidade de tornozelo e desconforto apenas quando tenta manter a tíbia vertical. Qual seria sua primeira decisão?",
      choices: [
        {
          id: "c1",
          label: "Permitir o avanço natural do joelho e observar a tolerância.",
          tone: "recomendada",
          feedback:
            "Coerente: com fêmur longo e boa mobilidade, forçar a tíbia vertical tende a aumentar a inclinação do tronco e o desconforto. Permitir o avanço natural respeita a alavanca do aluno.",
        },
        {
          id: "c2",
          label: "Insistir na tíbia vertical para proteger o joelho.",
          tone: "cautela",
          feedback:
            "A tíbia vertical não é um objetivo em si; para este aluno ela desloca a demanda para o tronco e reproduz o desconforto relatado. A posição deve servir ao aluno, não o contrário.",
        },
        {
          id: "c3",
          label: "Trocar por leg press até reavaliar, mantendo o estímulo de membros inferiores.",
          tone: "aceitavel",
          feedback:
            "É uma adaptação razoável enquanto se ajusta o padrão; apenas evite retirar o agachamento por padrão se ele for tolerado com o avanço natural do joelho.",
        },
      ],
    },
    { title: "Mini caso" },
  ),
  b(
    "quiz",
    {
      questions: [
        {
          id: "q1",
          type: "verdadeiro-falso",
          prompt: "Restringir o avanço do joelho elimina a demanda sobre a articulação.",
          options: [
            { id: "v", label: "Verdadeiro" },
            { id: "f", label: "Falso" },
          ],
          correctAnswer: "f",
          feedback: "A demanda é redistribuída para quadril e tronco, não eliminada.",
        },
        {
          id: "q2",
          type: "conduta",
          prompt: "Um aluno com fêmur longo relata desconforto ao manter a tíbia vertical. Qual conduta é mais coerente?",
          options: [
            { id: "a", label: "Permitir o avanço natural do joelho e observar a tolerância." },
            { id: "b", label: "Proibir o agachamento por risco de lesão." },
          ],
          correctAnswer: "a",
          feedback: "A posição deve respeitar a alavanca do aluno; proibir sem tolerância avaliada retira estímulo sem necessidade.",
        },
      ],
    },
    { title: "Verifique seu entendimento" },
  ),
  b(
    "scientific_uncertainty",
    {
      text: "A relação entre avanço do joelho e carga articular foi estudada em contextos específicos; a extrapolação para todo aluno e objetivo ainda tem incerteza. Trate as tendências como pontos de partida, não como regras absolutas.",
    },
    { title: "O que ainda é incerto" },
  ),
  b(
    "references",
    { ids: ["ref-escamilla-agachamento", "ref-diretriz-forca", "ref-a-validar-antropometria"] },
    { title: "Referências", isOptional: true },
  ),
  b(
    "related_content",
    {
      items: [
        { title: "Braço de momento na prática", href: "/aprender/conteudos/braco-de-momento", type: "conceito" },
        { title: "Amplitude e demanda", href: "/aprender/conteudos/amplitude-e-demanda", type: "mecanismo" },
        { title: "Caso: iniciante com dor lombar recorrente", href: "/aprender/casos/iniciante-dor-lombar", type: "caso" },
      ],
    },
    { title: "Continue por aqui" },
  ),
  b(
    "apply_to_prescription",
    {
      summary:
        "A execução do agachamento deve respeitar a antropometria e a tolerância do aluno; restringir o joelho redistribui a demanda para quadril e tronco.",
    },
    { title: "Aplicar no atendimento" },
  ),
];

const demoLesson: Lesson = {
  id: "l-joelho-agachamento",
  moduleId: "m-bio-3",
  disciplineSlug: "biomecanica-do-treinamento",
  moduleSlug: "analise-do-exercicio",
  slug: "por-que-joelho-ultrapassa-o-pe",
  title: "Por que o joelho ultrapassar a ponta do pé não é automaticamente um erro?",
  subtitle: "Análise do agachamento",
  description:
    "Restringir o avanço do joelho redistribui a demanda para o quadril e o tronco. Entenda o mecanismo para adaptar sem perder o objetivo.",
  level: "fundamental",
  estimatedMinutes: 8,
  type: "mecanismo",
  status: "nao-iniciado",
  progress: 0,
  reviewedAt: "2026-06-18",
  reviewedBy: "Equipe editorial",
  tags: ["agachamento", "joelho", "braço de momento", "adaptação"],
  blocks: demoBlocks,
  references: ["ref-escamilla-agachamento", "ref-diretriz-forca"],
  relatedContent: ["braco-de-momento", "amplitude-e-demanda"],
};

/* ------------------------------ AULAS LEVES ------------------------------ */
// Geradas a partir de uma pequena especificação: existem, são coerentes e
// prontas para receber blocos autorados pelo editorial.

type LeveSpec = {
  slug: string;
  moduleId: string;
  moduleSlug: string;
  title: string;
  description: string;
  type: LessonType;
  level: Nivel;
  minutes: number;
  concept: { term: string; definition: string };
  apply: string;
};

const leveSpecs: LeveSpec[] = [
  { slug: "planos-eixos-e-movimentos", moduleId: "m-bio-1", moduleSlug: "o-movimento-antes-da-carga", title: "Planos, eixos e movimentos", description: "O vocabulário que descreve para onde o corpo se move.", type: "conceito", level: "fundamental", minutes: 7, concept: { term: "Plano de movimento", definition: "Superfície imaginária que organiza a direção do movimento: sagital, frontal e transverso." }, apply: "Classificar um exercício pelo plano ajuda a compor um programa equilibrado." },
  { slug: "cadeias-cineticas", moduleId: "m-bio-1", moduleSlug: "o-movimento-antes-da-carga", title: "Cadeias cinéticas", description: "Quando o segmento final está livre ou fixo, o exercício muda.", type: "conceito", level: "fundamental", minutes: 8, concept: { term: "Cadeia fechada", definition: "O segmento distal está apoiado; as articulações se movem de forma interdependente (ex.: agachamento)." }, apply: "Cadeia aberta e fechada distribuem a demanda de formas diferentes no joelho." },
  { slug: "graus-de-liberdade", moduleId: "m-bio-1", moduleSlug: "o-movimento-antes-da-carga", title: "Graus de liberdade", description: "Quanta liberdade uma tarefa oferece muda o controle exigido.", type: "conceito", level: "fundamental", minutes: 6, concept: { term: "Graus de liberdade", definition: "Número de direções independentes em que um segmento pode se mover em uma tarefa." }, apply: "Reduzir graus de liberdade (guiado) pode facilitar a aprendizagem inicial." },
  { slug: "centro-de-massa-e-base", moduleId: "m-bio-1", moduleSlug: "o-movimento-antes-da-carga", title: "Centro de massa e base de suporte", description: "O que mantém o movimento estável e o que o desafia.", type: "conceito", level: "fundamental", minutes: 7, concept: { term: "Base de suporte", definition: "Área de contato que sustenta o corpo; sua relação com o centro de massa define a estabilidade." }, apply: "Ajustar a base muda a exigência de equilíbrio sem alterar o objetivo principal." },
  { slug: "forca-externa-e-interna", moduleId: "m-bio-2", moduleSlug: "forcas-e-momentos", title: "Força externa e interna", description: "Quem empurra, quem resiste e por que isso importa.", type: "conceito", level: "intermediario", minutes: 8, concept: { term: "Força externa", definition: "Resistência imposta por peso, elástico, polia ou gravidade sobre o corpo." }, apply: "Identificar a fonte da resistência orienta como ela varia ao longo do movimento." },
  { slug: "braco-de-momento", moduleId: "m-bio-2", moduleSlug: "forcas-e-momentos", title: "Braço de momento na prática", description: "A distância que transforma força em exigência articular.", type: "mecanismo", level: "intermediario", minutes: 9, concept: { term: "Braço de momento", definition: "Distância perpendicular entre a linha de força e o eixo articular; quanto maior, maior o torque." }, apply: "Mudar o ângulo ou a posição altera o braço de momento e, com ele, a demanda." },
  { slug: "torque-na-pratica", moduleId: "m-bio-2", moduleSlug: "forcas-e-momentos", title: "Torque na prática", description: "Por que a mesma carga pesa diferente em cada ângulo.", type: "mecanismo", level: "intermediario", minutes: 8, concept: { term: "Torque", definition: "Efeito rotacional de uma força; depende da força e do braço de momento." }, apply: "O ponto de maior torque costuma ser o trecho mais exigente do exercício." },
  { slug: "curvas-de-resistencia", moduleId: "m-bio-2", moduleSlug: "forcas-e-momentos", title: "Curvas de resistência", description: "Como a exigência muda ao longo da amplitude.", type: "comparacao", level: "intermediario", minutes: 8, concept: { term: "Curva de resistência", definition: "Perfil de como a demanda varia ao longo da amplitude de um exercício." }, apply: "Equipamentos (polia, elástico, peso livre) geram curvas diferentes para o mesmo padrão." },
  { slug: "amplitude-e-demanda", moduleId: "m-bio-3", moduleSlug: "analise-do-exercicio", title: "Amplitude e demanda", description: "Quanto mover, e por quê.", type: "mecanismo", level: "intermediario", minutes: 8, concept: { term: "Amplitude útil", definition: "Faixa de movimento que entrega o estímulo desejado com tolerância adequada." }, apply: "Reduzir amplitude é uma adaptação, não uma falha; deve servir a um objetivo." },
  { slug: "posicao-corporal-e-equipamento", moduleId: "m-bio-3", moduleSlug: "analise-do-exercicio", title: "Posição corporal e equipamento", description: "Pequenas mudanças que transformam o exercício.", type: "comparacao", level: "intermediario", minutes: 9, concept: { term: "Posição corporal", definition: "Orientação dos segmentos que determina quais músculos são mais exigidos." }, apply: "Inclinar o banco ou mudar a pegada redireciona a ênfase sem trocar de exercício." },
  { slug: "estabilidade-velocidade-e-fadiga", moduleId: "m-bio-3", moduleSlug: "analise-do-exercicio", title: "Estabilidade, velocidade e fadiga", description: "Variáveis que mudam a exigência sem mudar a carga.", type: "conceito", level: "intermediario", minutes: 8, concept: { term: "Estabilidade da tarefa", definition: "Quanto a tarefa exige de controle; superfícies e apoios alteram a demanda." }, apply: "Aumentar a instabilidade nem sempre aumenta o estímulo do músculo-alvo." },
  { slug: "padrao-agachar", moduleId: "m-bio-4", moduleSlug: "aplicacao-aos-padroes", title: "Padrão agachar", description: "Levar a análise ao padrão de agachar.", type: "aplicacao", level: "avancado", minutes: 10, concept: { term: "Padrão agachar", definition: "Flexão coordenada de quadril, joelho e tornozelo com o tronco controlado." }, apply: "As variações de agachamento distribuem a demanda entre quadril, joelho e tronco." },
  { slug: "padrao-empurrar", moduleId: "m-bio-4", moduleSlug: "aplicacao-aos-padroes", title: "Padrão empurrar", description: "Do supino ao desenvolvimento, o que muda.", type: "aplicacao", level: "avancado", minutes: 9, concept: { term: "Padrão empurrar", definition: "Extensão de cotovelo e ombro afastando a resistência do corpo." }, apply: "A inclinação e o ângulo do ombro redistribuem a ênfase entre peitoral, deltoide e tríceps." },
  { slug: "padrao-puxar", moduleId: "m-bio-4", moduleSlug: "aplicacao-aos-padroes", title: "Padrão puxar", description: "Puxadas verticais e horizontais e a ênfase dorsal.", type: "aplicacao", level: "avancado", minutes: 9, concept: { term: "Padrão puxar", definition: "Aproximação da resistência ao corpo pela ação de dorsais e flexores do cotovelo." }, apply: "A direção da puxada muda a região das costas mais recrutada." },
  { slug: "padrao-levantar-e-avancar", moduleId: "m-bio-4", moduleSlug: "aplicacao-aos-padroes", title: "Padrão levantar e avançar", description: "Dobradiça de quadril e passadas com critério.", type: "aplicacao", level: "avancado", minutes: 10, concept: { term: "Dobradiça de quadril", definition: "Movimento dominante de quadril com joelho relativamente estável, base do levantar." }, apply: "Escolher entre terra, stiff e afundo depende do objetivo e da tolerância do aluno." },
];

function leveLesson(spec: LeveSpec): Lesson {
  return {
    id: `l-${spec.slug}`,
    moduleId: spec.moduleId,
    disciplineSlug: "biomecanica-do-treinamento",
    moduleSlug: spec.moduleSlug,
    slug: spec.slug,
    title: spec.title,
    description: spec.description,
    level: spec.level,
    estimatedMinutes: spec.minutes,
    type: spec.type,
    status: "nao-iniciado",
    progress: 0,
    tags: [],
    blocks: [
      { id: `b-${spec.slug}-hero`, type: "hero", order: 1, content: { kicker: "Biomecânica do treinamento", text: spec.description } },
      { id: `b-${spec.slug}-concept`, type: "key_concept", order: 2, title: "Conceito-chave", content: spec.concept },
      { id: `b-${spec.slug}-apply`, type: "practical_application", order: 3, title: "Aplicação prática", content: { text: spec.apply } },
      { id: `b-${spec.slug}-unc`, type: "scientific_uncertainty", order: 4, title: "Nota de prudência", content: { text: "Conteúdo de síntese em construção editorial; trate as tendências como pontos de partida, sempre no contexto do aluno." }, isOptional: true },
      { id: `b-${spec.slug}-ref`, type: "references", order: 5, title: "Referências", content: { ids: ["ref-diretriz-forca", "ref-a-validar-antropometria"] }, isOptional: true },
      { id: `b-${spec.slug}-apply2`, type: "apply_to_prescription", order: 6, title: "Aplicar no atendimento", content: { summary: spec.apply } },
    ],
    references: ["ref-diretriz-forca"],
  };
}

export const lessons: Lesson[] = [demoLesson, ...leveSpecs.map(leveLesson)];

export const demoLessonSlug = demoLesson.slug;
