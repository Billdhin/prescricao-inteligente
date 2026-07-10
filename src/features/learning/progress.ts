import { useAprender } from "./store";
import { getLearningRepository } from "./repository";
import type { Discipline, Module, ProgressoStatus } from "./types";

const repo = getLearningRepository();

export type LessonsState = Record<string, { status: ProgressoStatus; progress: number }>;
export interface Stat {
  status: ProgressoStatus;
  progress: number;
  done: number;
  tracked: number;
}

/** ids das aulas autoradas de uma disciplina (via módulos → lessonSlugs). */
function disciplineLessonIds(disc: Discipline): string[] {
  const mods = repo.getModulesOf(disc.id);
  const ids: string[] = [];
  for (const m of mods) for (const l of repo.getLessonsOfModule(m.id)) ids.push(l.id);
  return ids;
}

/** Estatística pura de disciplina a partir de um snapshot do estado de aulas. */
export function disciplineStatFrom(disc: Discipline, lessons: LessonsState): Stat {
  const ids = disciplineLessonIds(disc);
  if (ids.length === 0) return { status: disc.status, progress: disc.progress, done: 0, tracked: 0 };
  const done = ids.filter((id) => lessons[id]?.status === "concluido").length;
  const anyStarted = ids.some((id) => (lessons[id]?.progress ?? 0) > 0);
  const progress = Math.round((done / ids.length) * 100);
  const status: ProgressoStatus = progress >= 100 ? "concluido" : anyStarted ? "em-andamento" : "nao-iniciado";
  return { status, progress, done, tracked: ids.length };
}

/** Estatística pura de módulo. */
export function moduleStatFrom(mod: Module, lessons: LessonsState): Stat {
  const ids = repo.getLessonsOfModule(mod.id).map((l) => l.id);
  if (ids.length === 0) return { status: mod.status, progress: mod.progress, done: 0, tracked: 0 };
  const done = ids.filter((id) => lessons[id]?.status === "concluido").length;
  const anyStarted = ids.some((id) => (lessons[id]?.progress ?? 0) > 0);
  const progress = Math.round((done / ids.length) * 100);
  const status: ProgressoStatus = progress >= 100 ? "concluido" : anyStarted ? "em-andamento" : "nao-iniciado";
  return { status, progress, done, tracked: ids.length };
}

/* --------------------------------- hooks ---------------------------------- */

export function useLessonState(lessonId: string): { status: ProgressoStatus; progress: number } {
  return useAprender((s) => s.lessons[lessonId] ?? { status: "nao-iniciado", progress: 0 });
}

export function useDisciplineStat(disc: Discipline): Stat {
  const lessons = useAprender((s) => s.lessons);
  return disciplineStatFrom(disc, lessons);
}

export function useModuleStat(mod: Module): Stat {
  const lessons = useAprender((s) => s.lessons);
  return moduleStatFrom(mod, lessons);
}
