import { lazy } from "react";

/** Páginas do Aprender com lazy loading (code-splitting do módulo). */
export const AprenderHome = lazy(() => import("./Home").then((m) => ({ default: m.AprenderHome })));
export const MapaConhecimento = lazy(() => import("./Mapa").then((m) => ({ default: m.MapaConhecimento })));
export const Disciplinas = lazy(() => import("./Disciplinas").then((m) => ({ default: m.Disciplinas })));
export const DisciplinaDetail = lazy(() => import("./DisciplinaDetail").then((m) => ({ default: m.DisciplinaDetail })));
export const ModuloDetail = lazy(() => import("./ModuloDetail").then((m) => ({ default: m.ModuloDetail })));
export const Conteudo = lazy(() => import("./Conteudo").then((m) => ({ default: m.Conteudo })));
export const Casos = lazy(() => import("./Casos").then((m) => ({ default: m.Casos })));
export const CasoDetail = lazy(() => import("./CasoDetail").then((m) => ({ default: m.CasoDetail })));
export const Biblioteca = lazy(() => import("./Biblioteca").then((m) => ({ default: m.Biblioteca })));
export const Consulta = lazy(() => import("./Consulta").then((m) => ({ default: m.Consulta })));
export const Salvos = lazy(() => import("./Salvos").then((m) => ({ default: m.Salvos })));
export const Progresso = lazy(() => import("./Progresso").then((m) => ({ default: m.Progresso })));
