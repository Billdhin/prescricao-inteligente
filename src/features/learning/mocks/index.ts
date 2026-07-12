import { modules as modulesBio } from "./modules";
import { lessons as lessonsBio } from "./lessons";
import { forcaModules, forcaLessons } from "./forca";
import { fisiologiaExercicioModules, fisiologiaExercicioLessons } from "./fisiologia-exercicio";
import { cardioModules, cardioLessons } from "./cardio";
import { avaliacaoModules, avaliacaoLessons } from "./avaliacao";
import { controleCargaModules, controleCargaLessons } from "./controle-carga";
import { periodizacaoModules, periodizacaoLessons } from "./periodizacao";
import { raciocinioModules, raciocinioLessons } from "./raciocinio";
import { gruposEspeciaisModules, gruposEspeciaisLessons } from "./grupos-especiais";
import { comunicacaoModules, comunicacaoLessons } from "./comunicacao";
import { segurancaModules, segurancaLessons } from "./seguranca";
import { dorModules, dorLessons } from "./dor";
import { evidenciasModules, evidenciasLessons } from "./evidencias";
import { mobilidadeModules, mobilidadeLessons } from "./mobilidade";
import { neurofisiologiaModules, neurofisiologiaLessons } from "./neurofisiologia";
import { cinesiologiaModules, cinesiologiaLessons } from "./cinesiologia";
import { biomecanicaBasicaModules, biomecanicaBasicaLessons } from "./biomecanica-basica";
import { bioquimicaModules, bioquimicaLessons } from "./bioquimica";
import { anatomiaModules, anatomiaLessons } from "./anatomia";
import { fisiologiaHumanaModules, fisiologiaHumanaLessons } from "./fisiologia-humana";
import { curriculoModules, curriculoLessons } from "./curriculo";

/** Módulos e aulas combinados: disciplinas de AUTORIA DEDICADA (padrão livro-texto)
 *  + demais disciplinas (currículo curado). Conforme cada disciplina é autorada em
 *  profundidade, ela sai do currículo curado e entra aqui. */
const autoradas = {
  modules: [
    ...modulesBio, ...forcaModules, ...fisiologiaExercicioModules, ...cardioModules,
    ...avaliacaoModules, ...controleCargaModules, ...periodizacaoModules, ...raciocinioModules,
    ...gruposEspeciaisModules, ...comunicacaoModules, ...segurancaModules, ...dorModules, ...evidenciasModules,
    ...mobilidadeModules, ...neurofisiologiaModules, ...cinesiologiaModules, ...biomecanicaBasicaModules,
    ...bioquimicaModules, ...anatomiaModules, ...fisiologiaHumanaModules,
  ],
  lessons: [
    ...lessonsBio, ...forcaLessons, ...fisiologiaExercicioLessons, ...cardioLessons,
    ...avaliacaoLessons, ...controleCargaLessons, ...periodizacaoLessons, ...raciocinioLessons,
    ...gruposEspeciaisLessons, ...comunicacaoLessons, ...segurancaLessons, ...dorLessons, ...evidenciasLessons,
    ...mobilidadeLessons, ...neurofisiologiaLessons, ...cinesiologiaLessons, ...biomecanicaBasicaLessons,
    ...bioquimicaLessons, ...anatomiaLessons, ...fisiologiaHumanaLessons,
  ],
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
