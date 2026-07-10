import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Aluno, Avaliacao, Prescricao, Liberacao } from "@/data/alunos";
import { seedAlunos, seedAvaliacoes, seedPrescricoes } from "@/data/alunos";

/* ----------------------------- Usuário / plano ---------------------------- */

export type Plan = "free" | "assinante" | "admin";

export const planLabel: Record<Plan, string> = {
  free: "Plano Free",
  assinante: "Profissional",
  admin: "Admin",
};

/** Perfil profissional completo: alimenta a UI e o CABEÇALHO dos documentos
 *  impressos (prontuário, prescrição, semáforo, fichas). */
export interface PerfilCampos {
  name: string;
  /** registro profissional (aparece no cabeçalho/assinatura do Prontuário) */
  cref: string;
  email: string;
  telefone: string;
  /** nome da empresa/estúdio (opcional; entra nos documentos) */
  empresa: string;
  /** site ou rede social principal (entra no rodapé dos documentos) */
  site: string;
  /** foto do profissional (dataURL redimensionada; avatar da UI) */
  fotoDataUrl: string;
  /** logo da marca (dataURL redimensionada; cabeçalho dos documentos) */
  logoDataUrl: string;
}

interface UserState extends PerfilCampos {
  plan: Plan;
  /** hash SHA-256 (hex) da senha local + salt; vazio = sem senha definida */
  senhaHash: string;
  senhaSalt: string;
  setPlan: (p: Plan) => void;
  setName: (n: string) => void;
  setCref: (c: string) => void;
  setPerfil: (patch: Partial<PerfilCampos>) => void;
  setSenha: (hash: string, salt: string) => void;
  limparSenha: () => void;
}

export const useUser = create<UserState>()(
  persist(
    (set) => ({
      name: "Rafael Trainer",
      // Novo usuário começa no plano free (vê o valor + os paywalls no momento
      // certo). O dono alterna via UserMenu (dev toggle) para testar.
      plan: "free",
      cref: "",
      email: "",
      telefone: "",
      empresa: "",
      site: "",
      fotoDataUrl: "",
      logoDataUrl: "",
      senhaHash: "",
      senhaSalt: "",
      setPlan: (plan) => set({ plan }),
      setName: (name) => set({ name }),
      setCref: (cref) => set({ cref }),
      setPerfil: (patch) => set(patch),
      setSenha: (senhaHash, senhaSalt) => set({ senhaHash, senhaSalt }),
      limparSenha: () => set({ senhaHash: "", senhaSalt: "" }),
    }),
    { name: "pi-user" },
  ),
);

/** Dados de marca prontos para os geradores de documento. */
export interface MarcaDocumento {
  nome: string;
  cref?: string;
  empresa?: string;
  site?: string;
  email?: string;
  telefone?: string;
  logoDataUrl?: string;
}

export function marcaDoUsuario(u: Pick<UserState, keyof PerfilCampos>): MarcaDocumento {
  return {
    nome: u.name,
    cref: u.cref || undefined,
    empresa: u.empresa || undefined,
    site: u.site || undefined,
    email: u.email || undefined,
    telefone: u.telefone || undefined,
    logoDataUrl: u.logoDataUrl || undefined,
  };
}

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
      // Novo usuário começa do zero (coerente com a filosofia de "começar vazio").
      xp: 0,
      streak: 0,
      casosResolvidos: [],
      activities: [],
      addActivity: (label) =>
        set((s) => ({
          activities: [{ id: uid(), label, ts: Date.now() }, ...s.activities].slice(0, 50),
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
  /** liberações do Semáforo (gate pré-sessão do Motor RCD) */
  liberacoes: Liberacao[];
  addAluno: (a: Aluno) => void;
  updateAluno: (id: string, patch: Partial<Aluno>) => void;
  removeAluno: (id: string) => void;
  addAvaliacao: (av: Avaliacao) => void;
  addPrescricao: (p: Prescricao) => void;
  archivePrescricao: (id: string) => void;
  addLiberacao: (l: Liberacao) => void;
  /** carrega os alunos de demonstração (para experimentar sem cadastrar) */
  loadExamples: () => void;
}

export const useAlunos = create<AlunosState>()(
  persist(
    (set) => ({
      // Novo usuário começa VAZIO (estado vazio real + "carregar exemplos").
      alunos: [],
      avaliacoes: [],
      prescricoes: [],
      liberacoes: [],
      loadExamples: () =>
        set({ alunos: seedAlunos, avaliacoes: seedAvaliacoes, prescricoes: seedPrescricoes }),
      addAluno: (a) => set((s) => ({ alunos: [a, ...s.alunos] })),
      updateAluno: (id, patch) =>
        set((s) => ({ alunos: s.alunos.map((a) => (a.id === id ? { ...a, ...patch } : a)) })),
      removeAluno: (id) =>
        set((s) => ({
          alunos: s.alunos.filter((a) => a.id !== id),
          avaliacoes: s.avaliacoes.filter((a) => a.alunoId !== id),
          prescricoes: s.prescricoes.filter((p) => p.alunoId !== id),
          liberacoes: s.liberacoes.filter((l) => l.alunoId !== id),
        })),
      addAvaliacao: (av) =>
        set((s) => ({
          avaliacoes: [av, ...s.avaliacoes],
          alunos: s.alunos.map((a) => {
            if (a.id !== av.alunoId) return a;
            // avaliação retroativa (data anterior à última) não reprograma a reavaliação
            if (av.data < (a.ultimaAvaliacaoEm ?? 0)) return a;
            return {
              ...a,
              ultimaAvaliacaoEm: av.data,
              proximaReavaliacaoEm: av.data + REAVALIACAO_DIAS * 86_400_000,
            };
          }),
        })),
      // a NOVA prescrição é a vigente: as anteriores "ativa" do mesmo aluno são
      // arquivadas (senão o aluno acumula 3 prescrições "ativas" e ninguém sabe qual vale)
      addPrescricao: (p) =>
        set((s) => ({
          prescricoes: [
            p,
            ...s.prescricoes.map((x) =>
              x.alunoId === p.alunoId && x.status === "ativa" ? { ...x, status: "arquivada" as const } : x,
            ),
          ],
        })),
      addLiberacao: (l) => set((s) => ({ liberacoes: [l, ...s.liberacoes].slice(0, 200) })),
      archivePrescricao: (id) =>
        set((s) => ({
          prescricoes: s.prescricoes.map((p) =>
            p.id === id ? { ...p, status: "arquivada" as const } : p,
          ),
        })),
    }),
    // v2: seed passou a incluir a jornada (grupoEspecial/fase) em alguns alunos.
    // v3: "Máquina" foi DIVIDIDA — esteira/bicicleta/elíptico viraram equipamentos próprios;
    //     alunos antigos com "Máquina" ganham as máquinas aeróbicas (o significado antigo as incluía).
    // v4: "Peso corporal" passa a ser garantido em todo aluno (o próprio corpo está sempre
    //     disponível); alunos antigos sem esse equipamento recebem-no no backfill.
    // migrate por MERGE: preserva os dados do usuário (alunos/avaliações/prescrições que
    // ele criou) e apenas faz backfill dos campos novos do seed nos alunos-semente por id.
    // Assim, futuros bumps de versão não apagam o trabalho do profissional.
    {
      name: "pi-alunos",
      version: 4,
      migrate: (persisted) => {
        const p = persisted as Partial<AlunosState> | null | undefined;
        // sem estado válido → primeira carga: usa o seed.
        if (!p || !Array.isArray(p.alunos)) {
          return {
            alunos: seedAlunos,
            avaliacoes: seedAvaliacoes,
            prescricoes: seedPrescricoes,
          } as unknown as AlunosState;
        }
        const MAQUINAS_AEROBICAS = ["Esteira", "Bicicleta ergométrica", "Elíptico"];
        const normalizaEquip = (eqs: string[] | undefined): string[] => {
          let out = Array.isArray(eqs) ? [...eqs] : [];
          if (out.includes("Máquina") && !out.some((e) => MAQUINAS_AEROBICAS.includes(e))) {
            out = [...out, ...MAQUINAS_AEROBICAS];
          }
          if (!out.includes("Peso corporal")) out = [...out, "Peso corporal"];
          return out;
        };
        const seedById = new Map(seedAlunos.map((a) => [a.id, a]));
        return {
          ...p,
          // { ...seed, ...usuário }: edições do usuário vencem; campos novos do seed
          // (ex.: jornada, adicionados numa versão posterior) são preenchidos.
          alunos: p.alunos.map((a) => {
            const s = seedById.get(a.id);
            const merged = s ? { ...s, ...a } : a;
            return { ...merged, equipamentos: normalizaEquip(merged.equipamentos) };
          }),
          avaliacoes: Array.isArray(p.avaliacoes) ? p.avaliacoes : seedAvaliacoes,
          prescricoes: Array.isArray(p.prescricoes) ? p.prescricoes : seedPrescricoes,
          liberacoes: Array.isArray(p.liberacoes) ? p.liberacoes : [],
        } as unknown as AlunosState;
      },
    },
  ),
);
