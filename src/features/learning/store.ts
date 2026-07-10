import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProgressoStatus, KnowledgeApplication } from "./types";
import { APRENDER_STORE_KEY, APRENDER_STORE_VERSION } from "./constants";

/**
 * Estado do Aprender, persistido em localStorage (pi-aprender). Guarda apenas
 * dados de valor duradouro (progresso, salvos, histórico, respostas, casos,
 * aplicações e a preferência de modo). Nada de estado visual transitório.
 */

export type ConsultMode = "estudar" | "consultar";
export type BookmarkType = "conteudo" | "disciplina" | "caso" | "referencia" | "justificativa" | "comparacao";

export interface Bookmark {
  id: string; // `${type}:${targetId}`
  type: BookmarkType;
  targetId: string;
  title: string;
  href: string;
  createdAt: number;
}

export interface HistoryEntry {
  id: string;
  type: "conteudo" | "disciplina" | "caso" | "modulo";
  title: string;
  href: string;
  ts: number;
}

interface LessonState {
  status: ProgressoStatus;
  progress: number;
  completedAt?: number;
}

interface CaseState {
  status: ProgressoStatus;
  choices: Record<string, string>;
  completedAt?: number;
}

interface AprenderState {
  consultMode: ConsultMode;
  lessons: Record<string, LessonState>;
  cases: Record<string, CaseState>;
  quizAnswers: Record<string, { answer: string; correct: boolean }>;
  bookmarks: Bookmark[];
  history: HistoryEntry[];
  applications: KnowledgeApplication[];
  lastLessonSlug?: string;
  searchHistory: string[];

  setConsultMode: (m: ConsultMode) => void;
  markLessonProgress: (lessonId: string, progress: number) => void;
  completeLesson: (lessonId: string) => void;
  setCaseChoice: (caseId: string, stepId: string, choiceId: string) => void;
  completeCase: (caseId: string) => void;
  answerQuiz: (questionId: string, answer: string, correct: boolean) => void;
  toggleBookmark: (b: Omit<Bookmark, "createdAt" | "id">) => void;
  isBookmarked: (type: BookmarkType, targetId: string) => boolean;
  pushHistory: (e: Omit<HistoryEntry, "id" | "ts">) => void;
  addApplication: (a: Omit<KnowledgeApplication, "id" | "createdAt">) => void;
  pushSearch: (q: string) => void;
  removeBookmark: (id: string) => void;
  resetLearning: () => void;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export const useAprender = create<AprenderState>()(
  persist(
    (set, get) => ({
      consultMode: "estudar",
      lessons: {},
      cases: {},
      quizAnswers: {},
      bookmarks: [],
      history: [],
      applications: [],
      searchHistory: [],

      setConsultMode: (consultMode) => set({ consultMode }),

      markLessonProgress: (lessonId, progress) =>
        set((s) => {
          const prev = s.lessons[lessonId];
          const status: ProgressoStatus =
            progress >= 100 ? "concluido" : progress > 0 ? "em-andamento" : "nao-iniciado";
          return {
            lessons: {
              ...s.lessons,
              [lessonId]: {
                status: prev?.status === "concluido" ? "concluido" : status,
                progress: Math.max(prev?.progress ?? 0, progress),
                completedAt: prev?.completedAt,
              },
            },
          };
        }),

      completeLesson: (lessonId) =>
        set((s) => ({
          lessons: {
            ...s.lessons,
            [lessonId]: { status: "concluido", progress: 100, completedAt: Date.now() },
          },
          lastLessonSlug: s.lastLessonSlug,
        })),

      setCaseChoice: (caseId, stepId, choiceId) =>
        set((s) => {
          const prev = s.cases[caseId] ?? { status: "em-andamento" as ProgressoStatus, choices: {} };
          return {
            cases: {
              ...s.cases,
              [caseId]: {
                ...prev,
                status: prev.status === "concluido" ? "concluido" : "em-andamento",
                choices: { ...prev.choices, [stepId]: choiceId },
              },
            },
          };
        }),

      completeCase: (caseId) =>
        set((s) => {
          const prev = s.cases[caseId] ?? { status: "em-andamento" as ProgressoStatus, choices: {} };
          return { cases: { ...s.cases, [caseId]: { ...prev, status: "concluido", completedAt: Date.now() } } };
        }),

      answerQuiz: (questionId, answer, correct) =>
        set((s) => ({ quizAnswers: { ...s.quizAnswers, [questionId]: { answer, correct } } })),

      toggleBookmark: (b) =>
        set((s) => {
          const id = `${b.type}:${b.targetId}`;
          const exists = s.bookmarks.some((x) => x.id === id);
          return {
            bookmarks: exists
              ? s.bookmarks.filter((x) => x.id !== id)
              : [{ ...b, id, createdAt: Date.now() }, ...s.bookmarks],
          };
        }),

      isBookmarked: (type, targetId) => get().bookmarks.some((x) => x.id === `${type}:${targetId}`),

      removeBookmark: (id) => set((s) => ({ bookmarks: s.bookmarks.filter((x) => x.id !== id) })),

      pushHistory: (e) =>
        set((s) => {
          const rest = s.history.filter((h) => h.href !== e.href);
          return {
            history: [{ ...e, id: uid(), ts: Date.now() }, ...rest].slice(0, 30),
            lastLessonSlug: e.type === "conteudo" ? e.href.split("/").pop() : s.lastLessonSlug,
          };
        }),

      addApplication: (a) =>
        set((s) => ({
          applications: [{ ...a, id: uid(), createdAt: Date.now() }, ...s.applications].slice(0, 50),
        })),

      pushSearch: (q) =>
        set((s) => {
          const t = q.trim();
          if (!t) return s;
          return { searchHistory: [t, ...s.searchHistory.filter((x) => x !== t)].slice(0, 8) };
        }),

      resetLearning: () =>
        set({
          lessons: {},
          cases: {},
          quizAnswers: {},
          bookmarks: [],
          history: [],
          applications: [],
          searchHistory: [],
          lastLessonSlug: undefined,
        }),
    }),
    { name: APRENDER_STORE_KEY, version: APRENDER_STORE_VERSION },
  ),
);
