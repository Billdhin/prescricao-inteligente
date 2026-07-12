import type { Module, Lesson, LessonType, Nivel } from "../types";

/**
 * Currículo das demais disciplinas (fora Biomecânica do treinamento, que tem
 * autoria dedicada). Gera módulos e aulas com conteúdo técnico e embasamento
 * científico a partir de uma especificação curada, para que NENHUMA disciplina
 * abra vazia. Cada aula traz um conceito-chave, aplicação prática, uma nota de
 * prudência científica e referências. Linguagem prudente, sem travessão.
 */

type LessonSpec = {
  slug: string;
  title: string;
  type: LessonType;
  term: string;
  definition: string;
  apply: string;
};
type ModuleSpec = {
  slug: string;
  title: string;
  objective: string;
  level: Nivel;
  lessons: LessonSpec[];
};

/** referência padrão por disciplina (ids de referencias.ts) para a bibliografia. */
const REF_POR_DISCIPLINA: Record<string, string[]> = {
  "anatomia-funcional": ["boeckh-behrens-2000", "ekstrom-2007"],
  "fisiologia-humana": ["garber-2011", "acsm-getp11"],
  "bioquimica-metabolismo": ["garber-2011", "donnelly-2009"],
  cinesiologia: ["boeckh-behrens-2000", "gullett-2009"],
  "biomecanica-basica": ["escamilla-1998", "gullett-2009"],
  "neurofisiologia-do-movimento": ["fragala-2019", "garber-2011"],
  "fisiologia-do-exercicio": ["garber-2011", "oms-2020", "borg-1982"],
  "treinamento-de-forca": ["schoenfeld-2010", "garber-2011"],
  "treinamento-cardiorrespiratorio": ["garber-2011", "oms-2020", "persinger-2004"],
  "mobilidade-e-flexibilidade": ["garber-2011"],
  "avaliacao-fisica-e-funcional": ["borg-1982", "acsm-getp11"],
  "controle-de-carga-e-recuperacao": ["foster-2001", "borg-1982"],
  "planejamento-e-periodizacao": ["garber-2011"],
  "raciocinio-de-prescricao": ["garber-2011", "confef-254"],
  "prescricao-para-grupos-especiais": ["acsm-getp11", "sbc-2020", "colberg-2016"],
  "dor-limitacoes-e-adaptacao": ["nice-ng59", "oarsi-2019"],
  "leitura-critica-de-evidencias": ["garber-2011"],
  "comunicacao-e-adesao": ["borg-1982"],
  "seguranca-e-limites-de-atuacao": ["warburton-2011", "confef-254"],
};

/** Especificação do currículo por disciplina (3 módulos, 2 aulas cada). */
const CURRICULO: Record<string, ModuleSpec[]> = {
  // anatomia-funcional tem AUTORIA DEDICADA em anatomia.ts.
  // fisiologia-humana tem AUTORIA DEDICADA em fisiologia-humana.ts.
  // bioquimica-metabolismo tem AUTORIA DEDICADA em bioquimica.ts.
  // cinesiologia tem AUTORIA DEDICADA em cinesiologia.ts.
  // biomecanica-basica tem AUTORIA DEDICADA em biomecanica-basica.ts.
  // neurofisiologia-do-movimento tem AUTORIA DEDICADA em neurofisiologia.ts.
  // fisiologia-do-exercicio tem AUTORIA DEDICADA em fisiologia-exercicio.ts.
  // treinamento-de-forca tem AUTORIA DEDICADA em forca.ts (padrão livro-texto),
  // por isso NÃO entra no currículo curado (evita duplicar módulos/aulas).
  // treinamento-cardiorrespiratorio tem AUTORIA DEDICADA em cardio.ts.
  // mobilidade-e-flexibilidade tem AUTORIA DEDICADA em mobilidade.ts.
  // avaliacao-fisica-e-funcional tem AUTORIA DEDICADA em avaliacao.ts.
  // controle-de-carga-e-recuperacao tem AUTORIA DEDICADA em controle-carga.ts.
  // planejamento-e-periodizacao tem AUTORIA DEDICADA em periodizacao.ts.
  // raciocinio-de-prescricao tem AUTORIA DEDICADA em raciocinio.ts.
  // prescricao-para-grupos-especiais tem AUTORIA DEDICADA em grupos-especiais.ts.
  // dor-limitacoes-e-adaptacao tem AUTORIA DEDICADA em dor.ts.
  // leitura-critica-de-evidencias tem AUTORIA DEDICADA em evidencias.ts.
  // comunicacao-e-adesao tem AUTORIA DEDICADA em comunicacao.ts.
  // seguranca-e-limites-de-atuacao tem AUTORIA DEDICADA em seguranca.ts.
};

function lessonFromSpec(spec: LessonSpec, discSlug: string, modId: string, modSlug: string): Lesson {
  const refs = REF_POR_DISCIPLINA[discSlug] ?? ["garber-2011"];
  return {
    id: `l-${discSlug}-${spec.slug}`,
    moduleId: modId,
    disciplineSlug: discSlug,
    moduleSlug: modSlug,
    slug: `${discSlug}--${spec.slug}`,
    title: spec.title,
    description: spec.definition,
    level: "fundamental",
    estimatedMinutes: 7,
    type: spec.type,
    status: "nao-iniciado",
    progress: 0,
    tags: [],
    blocks: [
      { id: `b-${discSlug}-${spec.slug}-hero`, type: "hero", order: 1, content: { kicker: "Aprender", text: spec.definition } },
      { id: `b-${discSlug}-${spec.slug}-concept`, type: "key_concept", order: 2, title: "Conceito-chave", content: { term: spec.term, definition: spec.definition } },
      { id: `b-${discSlug}-${spec.slug}-apply`, type: "practical_application", order: 3, title: "Aplicação prática", content: { text: spec.apply } },
      { id: `b-${discSlug}-${spec.slug}-unc`, type: "scientific_uncertainty", order: 4, title: "Nota de prudência", content: { text: "Síntese em construção editorial; trate as tendências como pontos de partida, sempre no contexto do aluno." }, isOptional: true },
      { id: `b-${discSlug}-${spec.slug}-ref`, type: "references", order: 5, title: "Referências", content: { ids: refs }, isOptional: true },
      { id: `b-${discSlug}-${spec.slug}-apply2`, type: "apply_to_prescription", order: 6, title: "Aplicar no atendimento", content: { summary: spec.apply } },
    ],
    references: refs,
  };
}

function build(): { modules: Module[]; lessons: Lesson[] } {
  const modules: Module[] = [];
  const lessons: Lesson[] = [];
  for (const [discSlug, mods] of Object.entries(CURRICULO)) {
    mods.forEach((m, i) => {
      const modId = `m-${discSlug}-${m.slug}`;
      const lessonSlugs = m.lessons.map((l) => `${discSlug}--${l.slug}`);
      modules.push({
        id: modId,
        disciplineId: discIdFromSlug(discSlug),
        slug: m.slug,
        title: m.title,
        description: m.objective,
        objective: m.objective,
        order: i + 1,
        level: m.level,
        estimatedMinutes: m.lessons.length * 8,
        lessonCount: m.lessons.length,
        progress: 0,
        status: "nao-iniciado",
        lessonSlugs,
      });
      for (const l of m.lessons) lessons.push(lessonFromSpec(l, discSlug, modId, m.slug));
    });
  }
  return { modules, lessons };
}

/** slug → id da disciplina (espelha disciplines.ts: id = "d-" + primeiro token). */
const SLUG_TO_ID: Record<string, string> = {
  "anatomia-funcional": "d-anatomia",
  "fisiologia-humana": "d-fisiologia",
  "bioquimica-metabolismo": "d-bioquimica",
  cinesiologia: "d-cinesiologia",
  "biomecanica-basica": "d-biomecanica-basica",
  "neurofisiologia-do-movimento": "d-neurofisiologia",
  "fisiologia-do-exercicio": "d-fisio-exercicio",
  "treinamento-de-forca": "d-forca",
  "treinamento-cardiorrespiratorio": "d-cardio",
  "mobilidade-e-flexibilidade": "d-mobilidade",
  "avaliacao-fisica-e-funcional": "d-avaliacao",
  "controle-de-carga-e-recuperacao": "d-carga",
  "planejamento-e-periodizacao": "d-periodizacao",
  "raciocinio-de-prescricao": "d-raciocinio",
  "prescricao-para-grupos-especiais": "d-grupos-especiais",
  "dor-limitacoes-e-adaptacao": "d-dor",
  "leitura-critica-de-evidencias": "d-evidencias",
  "comunicacao-e-adesao": "d-comunicacao",
  "seguranca-e-limites-de-atuacao": "d-seguranca",
};
function discIdFromSlug(slug: string): string {
  return SLUG_TO_ID[slug] ?? `d-${slug}`;
}

const built = build();
export const curriculoModules = built.modules;
export const curriculoLessons = built.lessons;
