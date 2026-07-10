import { modules as modulesBio } from "./modules";
import { lessons as lessonsBio } from "./lessons";
import { curriculoModules, curriculoLessons } from "./curriculo";

/** Módulos e aulas combinados: Biomecânica (autoria dedicada) + demais disciplinas
 *  (currículo curado). Assim nenhuma disciplina abre vazia. */
export const modules = [...modulesBio, ...curriculoModules];
export const lessons = [...lessonsBio, ...curriculoLessons];

export { disciplines } from "./disciplines";
export { demoLessonSlug } from "./lessons";
export { references } from "./references";
export { learningCases } from "./cases";
export {
  recommendations,
  knowledgeNodes,
  knowledgeCenter,
  competencies,
  studyObjectives,
  quickAnswers,
} from "./misc";
