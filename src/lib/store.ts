import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Aluno, Avaliacao, Prescricao } from "@/data/alunos";
import { seedAlunos, seedAvaliacoes, seedPrescricoes } from "@/data/alunos";

/* ----------------------------- Usuário / plano ---------------------------- */

export type Plan = "free" | "assinante" | "admin";

export const planLabel: Record<Plan, string> = {
  free: "Plano Free",
  assinante: "Profissional",
  admin: "Admin",
};

interface UserState {
  name: string;
  plan: Plan;
  setPlan: (p: Plan) => void;
}

export const useUser = create<UserState>()(
  persist(
    (set) => ({
      name: "Rafael Trainer",
      plan: "assinante",
      setPlan: (plan) => set({ plan }),
    }),
    { name: "pi-user" },
  ),
);

/** true quando o plano libera recursos premium. */
export function isPremiumUnlocked(plan: Plan) {
  return plan === "assinante" || plan === "admin";
}

/* ------------------------------- UI (shell) ------------------------------- */

interface UIState {
  mobileOpen: boolean;
  collapsed: boolean;
  setMobileOpen: (v: boolean) => void;
  toggleMobile: () => void;
  toggleCollapsed: () => void;
}

export const useUI = create<UIState>((set) => ({
  mobileOpen: false,
  collapsed: false,
  setMobileOpen: (v) => set({ mobileOpen: v }),
  toggleMobile: () => set((s) => ({ mobileOpen: !s.mobileOpen })),
  toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),
}));

/* ------------------------------- Favoritos -------------------------------- */

interface FavState {
  slugs: string[];
  toggle: (slug: string) => void;
}

export const useFavorites = create<FavState>()(
  persist(
    (set) => ({
      slugs: [],
      toggle: (slug) =>
        set((s) => ({
          slugs: s.slugs.includes(slug)
            ? s.slugs.filter((x) => x !== slug)
            : [...s.slugs, slug],
        })),
    }),
    { name: "pi-favorites" },
  ),
);

/* -------------------------------- Progresso ------------------------------- */

export interface Activity {
  id: string;
  label: string;
  ts: number;
}

interface ProgressState {
  xp: number;
  streak: number;
  casosResolvidos: string[];
  activities: Activity[];
  addActivity: (label: string) => void;
  solveCase: (id: string) => void;
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export const XP_POR_NIVEL = 200;
export function nivelDoXp(xp: number) {
  return Math.floor(xp / XP_POR_NIVEL) + 1;
}

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      xp: 120,
      streak: 3,
      casosResolvidos: [],
      activities: [
        { id: "seed-1", label: "Estudo do Leg press 45°", ts: Date.now() - 86_400_000 },
      ],
      addActivity: (label) =>
        set((s) => ({
          activities: [{ id: uid(), label, ts: Date.now() }, ...s.activities].slice(0, 8),
        })),
      solveCase: (id) =>
        set((s) =>
          s.casosResolvidos.includes(id)
            ? s
            : {
                casosResolvidos: [...s.casosResolvidos, id],
                xp: s.xp + 40,
                activities: [
                  { id: uid(), label: "Caso prático resolvido", ts: Date.now() },
                  ...s.activities,
                ].slice(0, 8),
              },
        ),
    }),
    { name: "pi-progress" },
  ),
);

/* ---------------------------------- GPS ----------------------------------- */

interface GpsState {
  consultations: number;
  increment: () => void;
  reset: () => void;
}

export const useGps = create<GpsState>()(
  persist(
    (set) => ({
      consultations: 0,
      increment: () => set((s) => ({ consultations: s.consultations + 1 })),
      reset: () => set({ consultations: 0 }),
    }),
    { name: "pi-gps" },
  ),
);

export const FREE_GPS_LIMIT = 3;
export const FREE_CASES_LIMIT = 2;

/* ---------------------------------- Modo ---------------------------------- */
// "atender" = ferramenta profissional (alunos/avaliações/prescrições) ·
// "aprender" = estudo (trilhas/casos/gamificação). Persistido.

export type AppMode = "atender" | "aprender";

interface ModeState {
  mode: AppMode;
  setMode: (m: AppMode) => void;
}

export const useMode = create<ModeState>()(
  persist(
    (set) => ({
      mode: "atender",
      setMode: (mode) => set({ mode }),
    }),
    { name: "pi-mode" },
  ),
);

/* --------------------------------- Alunos --------------------------------- */

export const FREE_ALUNOS_LIMIT = 3;
/** intervalo padrão sugerido entre reavaliações (dias) */
export const REAVALIACAO_DIAS = 60;

interface AlunosState {
  alunos: Aluno[];
  avaliacoes: Avaliacao[];
  prescricoes: Prescricao[];
  addAluno: (a: Aluno) => void;
  updateAluno: (id: string, patch: Partial<Aluno>) => void;
  removeAluno: (id: string) => void;
  addAvaliacao: (av: Avaliacao) => void;
  addPrescricao: (p: Prescricao) => void;
  archivePrescricao: (id: string) => void;
}

export const useAlunos = create<AlunosState>()(
  persist(
    (set) => ({
      alunos: seedAlunos,
      avaliacoes: seedAvaliacoes,
      prescricoes: seedPrescricoes,
      addAluno: (a) => set((s) => ({ alunos: [a, ...s.alunos] })),
      updateAluno: (id, patch) =>
        set((s) => ({ alunos: s.alunos.map((a) => (a.id === id ? { ...a, ...patch } : a)) })),
      removeAluno: (id) =>
        set((s) => ({
          alunos: s.alunos.filter((a) => a.id !== id),
          avaliacoes: s.avaliacoes.filter((a) => a.alunoId !== id),
          prescricoes: s.prescricoes.filter((p) => p.alunoId !== id),
        })),
      addAvaliacao: (av) =>
        set((s) => ({
          avaliacoes: [av, ...s.avaliacoes],
          alunos: s.alunos.map((a) =>
            a.id === av.alunoId
              ? {
                  ...a,
                  ultimaAvaliacaoEm: av.data,
                  proximaReavaliacaoEm: av.data + REAVALIACAO_DIAS * 86_400_000,
                }
              : a,
          ),
        })),
      addPrescricao: (p) => set((s) => ({ prescricoes: [p, ...s.prescricoes] })),
      archivePrescricao: (id) =>
        set((s) => ({
          prescricoes: s.prescricoes.map((p) =>
            p.id === id ? { ...p, status: "arquivada" as const } : p,
          ),
        })),
    }),
    { name: "pi-alunos", version: 1 },
  ),
);
