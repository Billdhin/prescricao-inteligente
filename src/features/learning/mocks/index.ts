import { modules as modulesBio } from "./modules";
import { lessons as lessonsBio } from "./lessons";
import { forcaModules, forcaLessons } from "./forca";
import { curriculoModules, curriculoLessons } from "./curriculo";

/** Módulos e aulas combinados: Biomecânica e Treinamento de força (autoria dedicada,
 *  padrão livro-texto) + demais disciplinas (currículo curado). Assim nenhuma
 *  disciplina abre vazia e as disciplinas-carro-chefe têm profundidade real. */
export const modules = [...modulesBio, ...forcaModules, ...curriculoModules];
export const lessons = [...lessonsBio, ...forcaLessons, ...curriculoLessons];

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
