import type { Lesson, LessonBlock, Module, Nivel, LessonType, QuizQuestion } from "../types";

/**
 * Motor de autoria das disciplinas em profundidade (padrão livro-texto).
 *
 * `deepLesson` monta a sequência COMPLETA de blocos exigida pelo projeto pedagógico
 * (pergunta de prescrição, conceitos, mecanismo/comparação/gráfico/linha do tempo,
 * aplicação, populações especiais, erro comum, caso, quiz comentado, incerteza,
 * conexões entre disciplinas, referências e aplicar no atendimento) a partir de uma
 * especificação compacta. Cada disciplina autora suas aulas com esta função, sem
 * repetir a montagem de blocos.
 *
 * Os `content` de cada bloco espelham o renderer em features/learning/blocks.
 * Linguagem prudente, científica, sem travessão.
 */

type Choice = { id: string; label: string; feedback: string; tone: "recomendada" | "aceitavel" | "cautela" };

export type DeepLessonSpec = {
  disciplineSlug: string;
  moduleId: string;
  moduleSlug: string;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  level: Nivel;
  minutes: number;
  type: LessonType;
  kicker: string;
  tags?: string[];
  /** frase de abertura (hero) */
  hero: string;
  /** pergunta de prescrição que a aula responde */
  question?: string;
  /** 1 ou 2 conceitos-chave */
  concepts: { term: string; definition: string; title?: string }[];
  /** um recurso visual/explicativo principal (escolha o que melhor serve ao tema) */
  mechanism?: { title?: string; steps: { label: string; detail: string }[] };
  comparison?: { title?: string; leftTitle: string; rightTitle: string; leftItems: string[]; rightItems: string[]; note?: string };
  chart?: { blockTitle?: string; title: string; points: { label: string; value: number }[]; explanation: string };
  timeline?: { title?: string; items: { time: string; title: string; detail: string }[] };
  decisionTree?: { title?: string; root: string; branches: { condition: string; outcome: string }[] };
  /** aplicação à prescrição (obrigatória) */
  apply: string;
  /** aplicações a populações especiais (short_text) */
  special?: string[];
  specialTitle?: string;
  /** erro comum */
  mistake: { mistake: string; instead: string };
  /** mini caso profissional */
  professionalCase: { prompt: string; choices: Choice[] };
  /** quiz comentado */
  quiz: QuizQuestion[];
  /** o que ainda é incerto */
  uncertainty?: string;
  /** conexões com outras disciplinas/casos */
  related: { title: string; href: string; type: string }[];
  /** ids de referências (references.ts) */
  refs: string[];
  /** resumo para aplicar no atendimento */
  applyRx: string;
};

export function deepLesson(s: DeepLessonSpec): Lesson {
  let order = 0;
  const blocks: LessonBlock[] = [];
  const push = (type: LessonBlock["type"], content: unknown, extra: Partial<LessonBlock> = {}) => {
    order += 1;
    blocks.push({ id: `blk-${s.slug}-${order}`, type, order, content, ...extra });
  };

  push("hero", { kicker: s.kicker, text: s.hero });
  if (s.question) push("prescription_question", { question: s.question });
  s.concepts.forEach((c, i) =>
    push(
      "key_concept",
      { term: c.term, definition: c.definition },
      { title: c.title ?? (s.concepts.length > 1 ? `Conceito ${i + 1}` : "Conceito-chave") },
    ),
  );
  if (s.mechanism) push("mechanism_flow", { steps: s.mechanism.steps }, { title: s.mechanism.title ?? "Entenda o mecanismo" });
  if (s.chart)
    push(
      "chart_explainer",
      { title: s.chart.title, points: s.chart.points, explanation: s.chart.explanation },
      { title: s.chart.blockTitle ?? s.chart.title },
    );
  if (s.comparison)
    push(
      "comparison",
      {
        leftTitle: s.comparison.leftTitle,
        rightTitle: s.comparison.rightTitle,
        leftItems: s.comparison.leftItems,
        rightItems: s.comparison.rightItems,
        note: s.comparison.note,
      },
      { title: s.comparison.title ?? "Compare" },
    );
  if (s.timeline) push("timeline", { items: s.timeline.items }, { title: s.timeline.title ?? "Na prática" });
  if (s.decisionTree)
    push("decision_tree", { root: s.decisionTree.root, branches: s.decisionTree.branches }, { title: s.decisionTree.title ?? "Como decidir" });
  push("practical_application", { text: s.apply }, { title: "Aplicação à prescrição" });
  if (s.special?.length) push("short_text", { variant: "observe", items: s.special }, { title: s.specialTitle ?? "Em populações especiais" });
  push("common_mistake", { mistake: s.mistake.mistake, instead: s.mistake.instead }, { title: "Erro frequente" });
  push("professional_case", { prompt: s.professionalCase.prompt, choices: s.professionalCase.choices }, { title: "Mini caso" });
  push("quiz", { questions: s.quiz }, { title: "Verifique seu entendimento" });
  if (s.uncertainty) push("scientific_uncertainty", { text: s.uncertainty }, { title: "O que ainda é incerto" });
  push("related_content", { items: s.related }, { title: "Revise também" });
  push("references", { ids: s.refs }, { title: "Referências", isOptional: true });
  push("apply_to_prescription", { summary: s.applyRx }, { title: "Aplicar no atendimento" });

  return {
    id: `l-${s.slug}`,
    moduleId: s.moduleId,
    disciplineSlug: s.disciplineSlug,
    moduleSlug: s.moduleSlug,
    slug: s.slug,
    title: s.title,
    subtitle: s.subtitle,
    description: s.description,
    level: s.level,
    estimatedMinutes: s.minutes,
    type: s.type,
    status: "nao-iniciado",
    progress: 0,
    reviewedAt: "2026-07-11",
    reviewedBy: "Equipe editorial",
    tags: s.tags ?? [],
    blocks,
    references: s.refs.filter((r) => !r.startsWith("ref-a-validar")).slice(0, 3),
    relatedContent: s.related.map((r) => r.href.split("/").pop() || "").filter(Boolean),
  };
}

export function deepModule(m: {
  id: string;
  disciplineId: string;
  slug: string;
  title: string;
  objective: string;
  order: number;
  level: Nivel;
  prerequisites?: string[];
  lessons: Lesson[];
  applications?: string[];
}): Module {
  return {
    id: m.id,
    disciplineId: m.disciplineId,
    slug: m.slug,
    title: m.title,
    description: m.objective,
    objective: m.objective,
    order: m.order,
    level: m.level,
    estimatedMinutes: m.lessons.reduce((n, l) => n + l.estimatedMinutes, 0),
    lessonCount: m.lessons.length,
    progress: 0,
    status: "nao-iniciado",
    prerequisites: m.prerequisites,
    lessonSlugs: m.lessons.map((l) => l.slug),
    applications: m.applications,
  };
}

/** helper de quiz para reduzir verbosidade nas aulas. */
export function q(
  id: string,
  type: QuizQuestion["type"],
  prompt: string,
  options: { id: string; label: string }[],
  correctAnswer: string,
  feedback: string,
): QuizQuestion {
  return { id, type, prompt, options, correctAnswer, feedback };
}
