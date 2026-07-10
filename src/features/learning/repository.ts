import type {
  Discipline,
  Module,
  Lesson,
  LearningCase,
  ScientificReference,
  LearningRecommendation,
  QuickAnswer,
} from "./types";
import {
  disciplines as disciplinesRaw,
  modules,
  lessons,
  learningCases,
  references,
  recommendations,
  quickAnswers,
} from "./mocks";

/**
 * Contagens reais de módulos/aulas por disciplina, derivadas do que está de fato
 * autorado. Sobrepõem os números de catálogo do mock para que o cabeçalho da
 * disciplina não prometa mais do que existe (Filipe: "6 módulos, mas nada aparece").
 */
const disciplines = disciplinesRaw.map((d) => {
  const mods = modules.filter((m) => m.disciplineId === d.id);
  if (mods.length === 0) return d;
  const lessonCount = mods.reduce((n, m) => n + m.lessonSlugs.length, 0);
  return { ...d, moduleCount: mods.length, lessonCount };
});

/**
 * Camada de acesso a dados do Aprender. Hoje serve os mocks locais de forma
 * síncrona; a interface está pronta para uma implementação Supabase (F5) sem que
 * as páginas mudem. As páginas SEMPRE consomem o repository, nunca os mocks direto.
 */

export interface LearningRepository {
  getDisciplines(): Discipline[];
  getDiscipline(slug: string): Discipline | undefined;
  getModulesOf(disciplineId: string): Module[];
  getModuleBySlug(disciplineSlug: string, moduleSlug: string): Module | undefined;
  getLessonsOfModule(moduleId: string): Lesson[];
  getLesson(slug: string): Lesson | undefined;
  getLessonById(id: string): Lesson | undefined;
  getCases(): LearningCase[];
  getCase(slug: string): LearningCase | undefined;
  getReferences(): ScientificReference[];
  getReference(id: string): ScientificReference | undefined;
  getRecommendations(): LearningRecommendation[];
  getQuickAnswers(): QuickAnswer[];
}

const localRepository: LearningRepository = {
  getDisciplines: () => disciplines,
  getDiscipline: (slug) => disciplines.find((d) => d.slug === slug),
  getModulesOf: (disciplineId) =>
    modules.filter((m) => m.disciplineId === disciplineId).sort((a, b) => a.order - b.order),
  getModuleBySlug: (disciplineSlug, moduleSlug) => {
    const disc = disciplines.find((d) => d.slug === disciplineSlug);
    if (!disc) return undefined;
    return modules.find((m) => m.disciplineId === disc.id && m.slug === moduleSlug);
  },
  getLessonsOfModule: (moduleId) => {
    const mod = modules.find((m) => m.id === moduleId);
    if (!mod) return [];
    return mod.lessonSlugs
      .map((slug) => lessons.find((l) => l.slug === slug))
      .filter((l): l is Lesson => Boolean(l));
  },
  getLesson: (slug) => lessons.find((l) => l.slug === slug),
  getLessonById: (id) => lessons.find((l) => l.id === id),
  getCases: () => learningCases,
  getCase: (slug) => learningCases.find((c) => c.slug === slug),
  getReferences: () => references,
  getReference: (id) => references.find((r) => r.id === id),
  getRecommendations: () => recommendations,
  getQuickAnswers: () => quickAnswers,
};

/** Ponto de troca para a implementação Supabase no futuro. */
export function getLearningRepository(): LearningRepository {
  return localRepository;
}
