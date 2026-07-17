import type { Macroarea, Nivel, LessonType, ReferenceSourceType } from "./types";

/** Rótulos e metadados das três macroáreas (usados na sidebar, mapa e filtros). */
export const MACROAREAS: {
  id: Macroarea;
  label: string;
  short: string;
  description: string;
  icon: string;
  colorToken: "primary" | "analysis" | "cta";
}[] = [
  {
    id: "fundamentais",
    label: "Ciências fundamentais",
    short: "Fundamentais",
    description: "A base que explica como o corpo se organiza e responde ao movimento.",
    icon: "Atom",
    colorToken: "primary",
  },
  {
    id: "aplicadas",
    label: "Ciências aplicadas ao treinamento",
    short: "Aplicadas",
    description: "Como transformar o conhecimento básico em estímulos e progressões.",
    icon: "Dumbbell",
    colorToken: "analysis",
  },
  {
    id: "integracao",
    label: "Integração e decisão profissional",
    short: "Integração",
    description: "Onde ciência, aluno e contexto se encontram para decidir e justificar.",
    icon: "Workflow",
    colorToken: "cta",
  },
];

export const macroareaLabel: Record<Macroarea, string> = {
  fundamentais: "Ciências fundamentais",
  aplicadas: "Ciências aplicadas",
  integracao: "Integração e decisão",
};

export const nivelLabel: Record<Nivel, string> = {
  fundamental: "Fundamental",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

export const lessonTypeMeta: Record<LessonType, { label: string; icon: string }> = {
  conceito: { label: "Conceito", icon: "Lightbulb" },
  comparacao: { label: "Comparação", icon: "GitCompare" },
  mecanismo: { label: "Mecanismo", icon: "Workflow" },
  laboratorio: { label: "Laboratório visual", icon: "FlaskConical" },
  caso: { label: "Caso", icon: "Stethoscope" },
  quiz: { label: "Quiz", icon: "CircleHelp" },
  aplicacao: { label: "Aplicação", icon: "Target" },
};

export const referenceSourceLabel: Record<ReferenceSourceType, string> = {
  livro: "Livro",
  capitulo: "Capítulo",
  diretriz: "Diretriz",
  consenso: "Consenso",
  "position-stand": "Position stand",
  "revisao-sistematica": "Revisão sistemática",
  "meta-analise": "Meta-análise",
  "ensaio-clinico": "Ensaio clínico",
  observacional: "Estudo observacional",
  mecanistico: "Estudo mecanístico",
  institucional: "Documento institucional",
};

/** Chave de persistência e versão do estado do Aprender. */
export const APRENDER_STORE_KEY = "pi-aprender";
// v2: as respostas de quiz passaram a ser gravadas por aula ("<lessonId>:<qId>").
// Antes a chave era só o id da pergunta ("q1"), que se repete em ~100 aulas, então
// responder numa aula marcava a mesma pergunta em todas as outras. A migração
// descarta as respostas antigas (sem ":"), que não têm como ser atribuídas a uma aula.
export const APRENDER_STORE_VERSION = 2;
