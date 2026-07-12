import { modules as modulesBio } from "./modules";
import { lessons as lessonsBio } from "./lessons";
import { forcaModules, forcaLessons } from "./forca";
import { fisiologiaExercicioModules, fisiologiaExercicioLessons } from "./fisiologia-exercicio";
import { curriculoModules, curriculoLessons } from "./curriculo";

/** Módulos e aulas combinados: disciplinas de AUTORIA DEDICADA (padrão livro-texto)
 *  + demais disciplinas (currículo curado). Conforme cada disciplina é autorada em
 *  profundidade, ela sai do currículo curado e entra aqui. */
const autoradas = {
  modules: [...modulesBio, ...forcaModules, ...fisiologiaExercicioModules],
  lessons: [...lessonsBio, ...forcaLessons, ...fisiologiaExercicioLessons],
};
export const modules = [...autoradas.modules, ...curriculoModules];
export const lessons = [...autoradas.lessons, ...curriculoLessons];

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
