/**
 * Modelo de dados do módulo APRENDER: o corpo científico do produto.
 *
 * Tudo aqui é tipado e desacoplado da apresentação. Os mocks (features/learning/
 * mocks) preenchem estas interfaces; o repository (features/learning/repository)
 * é a camada trocável por Supabase no futuro (F5). As páginas nunca conhecem a
 * origem dos dados.
 *
 * Linguagem do produto: prudente, científica, sem diagnóstico/prescrição médica,
 * e NUNCA travessão em texto visível (o fundador considera "cara de IA").
 */

export type Nivel = "fundamental" | "intermediario" | "avancado";
export type ProgressoStatus = "nao-iniciado" | "em-andamento" | "concluido";

/** As três macroáreas do conhecimento da prescrição. */
export type Macroarea = "fundamentais" | "aplicadas" | "integracao";

/** Tipos de conteúdo (informam o ícone e o selo na lista). */
export type LessonType =
  | "conceito"
  | "comparacao"
  | "mecanismo"
  | "laboratorio"
  | "caso"
  | "quiz"
  | "aplicacao";

/* --------------------------------- Disciplina --------------------------------- */

export interface Discipline {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  category: Macroarea;
  /** nome do ícone lucide (mapeado na UI) */
  icon: string;
  /** token de cor da UI: primary | analysis | cta | success */
  colorToken: "primary" | "analysis" | "cta" | "success";
  level: string;
  estimatedHours: number;
  /** duração real derivada (soma dos minutos das aulas autoradas); repository preenche */
  estimatedMinutes?: number;
  moduleCount: number;
  lessonCount: number;
  caseCount: number;
  /** 0..100; derivado do progresso persistido em runtime (valor inicial = mock) */
  progress: number;
  status: ProgressoStatus;
  /** data ISO da última revisão científica (mock) */
  reviewedAt?: string;
  reviewedBy?: string;
  tags: string[];
  /** perguntas que a disciplina ajuda o profissional a responder */
  helpsAnswer?: string[];
  /** destaque na home */
  featured?: boolean;
}

/* ---------------------------------- Módulo ----------------------------------- */

export interface Module {
  id: string;
  disciplineId: string;
  slug: string;
  title: string;
  description: string;
  objective: string;
  order: number;
  level: Nivel;
  estimatedMinutes: number;
  lessonCount: number;
  progress: number;
  prerequisites?: string[];
  status: ProgressoStatus;
  /** slugs de aulas deste módulo (na ordem) */
  lessonSlugs: string[];
  /** aplicações práticas relacionadas */
  applications?: string[];
}

/* ----------------------------- Blocos de conteúdo ---------------------------- */

export type LessonBlockType =
  | "hero"
  | "prescription_question"
  | "short_text"
  | "key_concept"
  | "interactive_figure"
  | "image_hotspots"
  | "mechanism_flow"
  | "comparison"
  | "timeline"
  | "decision_tree"
  | "chart_explainer"
  | "calculator"
  | "professional_case"
  | "quiz"
  | "practical_application"
  | "common_mistake"
  | "scientific_uncertainty"
  | "references"
  | "related_content"
  | "apply_to_prescription";

/** Bloco genérico. O `content` é tipado por bloco na renderização (ver blocks/). */
export interface LessonBlock {
  id: string;
  type: LessonBlockType;
  order: number;
  title?: string;
  /** conteúdo específico do tipo (o renderer faz o narrowing) */
  content: unknown;
  settings?: Record<string, unknown>;
  isOptional?: boolean;
  metadata?: Record<string, unknown>;
}

/* ----------------------------------- Aula ------------------------------------ */

export interface Lesson {
  id: string;
  moduleId: string;
  disciplineSlug: string;
  moduleSlug: string;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  level: Nivel;
  estimatedMinutes: number;
  type: LessonType;
  status: ProgressoStatus;
  progress: number;
  reviewedAt?: string;
  reviewedBy?: string;
  tags: string[];
  blocks: LessonBlock[];
  references?: string[];
  relatedContent?: string[];
}

/* ------------------------------ Referência científica ------------------------ */

export type ReferenceSourceType =
  | "livro"
  | "capitulo"
  | "diretriz"
  | "consenso"
  | "position-stand"
  | "revisao-sistematica"
  | "meta-analise"
  | "ensaio-clinico"
  | "observacional"
  | "mecanistico"
  | "institucional";

export interface ScientificReference {
  id: string;
  title: string;
  authors: string;
  year: number;
  sourceType: ReferenceSourceType;
  journalOrPublisher: string;
  doi?: string;
  pubmedUrl?: string;
  officialUrl?: string;
  openAccess: boolean;
  abstractSummary: string;
  topics: string[];
  /** "validada" = referência real da base RCD; "a-validar" = placeholder editorial */
  validationStatus: "validada" | "a-validar";
  /** onde a referência é usada (aulas/prescrições), para rastreabilidade */
  usedIn?: string[];
}

/* ------------------------------- Caso de prescrição -------------------------- */

export interface CaseChoice {
  id: string;
  label: string;
  /** consequência/raciocínio ao escolher (linguagem prudente) */
  feedback: string;
  /** classificação pedagógica (não "certo/errado" absoluto) */
  tone: "recomendada" | "aceitavel" | "cautela";
}

export interface CaseStep {
  id: string;
  order: number;
  type: "contexto" | "dados" | "decisao" | "consequencia" | "feedback";
  title: string;
  content: string;
  choices?: CaseChoice[];
}

export interface LearningCase {
  id: string;
  slug: string;
  title: string;
  description: string;
  profile: string;
  conditions: string[];
  goals: string[];
  level: Nivel;
  estimatedMinutes: number;
  /** slugs de disciplinas envolvidas */
  disciplines: string[];
  complexity: "baixa" | "media" | "alta";
  region?: string;
  steps: CaseStep[];
  references?: string[];
  status: ProgressoStatus;
}

/* ---------------------------------- Quiz ------------------------------------- */

export interface QuizQuestion {
  id: string;
  type: "verdadeiro-falso" | "conduta" | "variavel";
  prompt: string;
  options: { id: string; label: string }[];
  correctAnswer: string;
  feedback: string;
  explanation?: string;
}

export interface Quiz {
  id: string;
  lessonId: string;
  questions: QuizQuestion[];
  passingScore: number;
}

/* --------------------------- Recomendação contextual ------------------------- */

export interface LearningRecommendation {
  id: string;
  sourceType: "aluno" | "avaliacao" | "prescricao" | "grupo" | "geral";
  sourceLabel: string;
  contentType: LessonType;
  contentTitle: string;
  /** rota de destino no Aprender */
  href: string;
  discipline: string;
  estimatedMinutes: number;
  level: Nivel;
  reason: string;
  priority: number;
}

/* ------------------------------- Mapa do conhecimento ------------------------ */

export interface KnowledgeNode {
  id: string;
  label: string;
  layer: 1 | 2 | 3;
  tooltip: string;
  /** rota de destino (disciplina/tema/grupo) */
  href?: string;
  colorToken: "primary" | "analysis" | "cta" | "success";
}

/* --------------------------------- Competências ------------------------------ */

export interface Competency {
  id: string;
  label: string;
  description: string;
  /** 0..100 (derivado em runtime; mock = valor inicial) */
  value: number;
}

/* ------------------------ Consulta rápida (respostas mock) ------------------- */

export interface QuickAnswer {
  id: string;
  question: string;
  /** termos que ativam a resposta na busca */
  keywords: string[];
  summary: string;
  keyPoints: string[];
  observe: string[];
  application: string;
  limits: string;
  relatedLessons?: string[];
  relatedCases?: string[];
  references?: string[];
}

/* ------------------------------ Objetivos de estudo -------------------------- */

export interface StudyObjective {
  id: string;
  label: string;
  icon: string;
  description: string;
  count: number;
  href: string;
}

/* ----------------------- Aplicação de conhecimento (Aprender→Atender) -------- */

export interface KnowledgeApplication {
  id: string;
  lessonId: string;
  lessonTitle: string;
  studentId?: string;
  studentName?: string;
  prescriptionId?: string;
  justification: string;
  createdAt: number;
}
