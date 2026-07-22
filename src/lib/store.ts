import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Aluno, Avaliacao, Prescricao, Liberacao } from "@/data/alunos";
import type { PlanoTreino } from "@/data/periodizacao";
import type { Execucao } from "@/data/execucao";
import type { AvaliacaoPostural } from "@/data/postural";
import { seedAlunos, seedAvaliacoes, seedPrescricoes } from "@/data/alunos";
import { migrarRestricoesLegado } from "@/lib/gps/restricoes";
import {
  cloudSaveAluno,
  cloudRemoveAluno,
  cloudSaveAvaliacao,
  cloudSavePrescricao,
  cloudSavePlano,
  cloudRemovePlano,
  cloudSaveLiberacao,
  cloudSavePerfil,
} from "@/lib/backend/cloudSync";

/* ----------------------------- Usuário / plano ---------------------------- */

// O produto é pago para todos. Não existe mais plano gratuito.
export type Plan = "assinante" | "admin";

export const planLabel: Record<Plan, string> = {
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
  /** cor principal da marca (hex, ex.: "#2563EB"); vazio usa a cor do produto.
   *  Tinge o cabeçalho dos documentos e, no portal do aluno, o app inteiro. */
  corPrimaria: string;
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
      // Produto pago para todos: todo usuário nasce Profissional, sem tier grátis.
      plan: "assinante",
      cref: "",
      email: "",
      telefone: "",
      empresa: "",
      site: "",
      fotoDataUrl: "",
      logoDataUrl: "",
      corPrimaria: "",
      senhaHash: "",
      senhaSalt: "",
      setPlan: (plan) => {
        set({ plan });
        cloudSavePerfil({ plan });
      },
      setName: (name) => {
        set({ name });
        cloudSavePerfil({ name });
      },
      setCref: (cref) => {
        set({ cref });
        cloudSavePerfil({ cref });
      },
      setPerfil: (patch) => {
        set(patch);
        cloudSavePerfil(patch);
      },
      setSenha: (senhaHash, senhaSalt) => set({ senhaHash, senhaSalt }),
      limparSenha: () => set({ senhaHash: "", senhaSalt: "" }),
    }),
    {
      name: "pi-user",
      version: 1,
      // v1: fim do tier grátis. Quem estava em "free" vira "assinante".
      migrate: (persisted) => {
        const p = (persisted ?? {}) as Partial<UserState>;
        if (!p.plan || (p.plan as string) === "free") p.plan = "assinante";
        return p as UserState;
      },
    },
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
  corPrimaria?: string;
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
    corPrimaria: u.corPrimaria || undefined,
  };
}

/** Produto pago para todos: não há mais recurso bloqueado por plano. */
export function isPremiumUnlocked(_plan?: Plan) {
  return true;
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
    { name: "pi-favorites", version: 1, migrate: (s) => s as FavState },
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
    { name: "pi-progress", version: 1, migrate: (s) => s as ProgressState },
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
    { name: "pi-mode", version: 1, migrate: (s) => s as ModeState },
  ),
);

/* --------------------------------- Alunos --------------------------------- */

export const FREE_ALUNOS_LIMIT = 3;
/** intervalo padrão sugerido entre reavaliações (dias) */
export const REAVALIACAO_DIAS = 60;

/** Onde uma prescrição foi aplicada no plano (vínculo reverso DERIVADO). */
export interface LocalDaPrescricao {
  /** letra da sessão (A, B, ...) */
  sessao: string;
  /** primeira semana em que aparece */
  semana: number;
  /** índice 1-based do mesociclo */
  bloco: number;
}

/**
 * Vínculo reverso Prescricao > plano: varre os planos ATIVOS por blocos com
 * `origemPrescricaoId === prescricaoId` e devolve o primeiro lugar onde a prescrição foi
 * aplicada, ou null. É DERIVADO por completo (decisão travada 15): nada é gravado na
 * Prescricao. Alimenta o selo "No plano: Sessão B · semana 5".
 */
export function prescricaoAplicadaEm(planos: PlanoTreino[], prescricaoId: string): LocalDaPrescricao | null {
  for (const plano of planos) {
    if (plano.status !== "ativo") continue;
    // Ordem natural (mesociclos -> semanas -> sessões): o primeiro match é o mais cedo.
    for (let mi = 0; mi < plano.macrociclo.mesociclos.length; mi++) {
      const meso = plano.macrociclo.mesociclos[mi];
      for (const micro of meso.microciclos) {
        for (let si = 0; si < micro.sessoes.length; si++) {
          if (micro.sessoes[si].blocos.some((b) => b.origemPrescricaoId === prescricaoId)) {
            return { sessao: String.fromCharCode(65 + si), semana: micro.semana, bloco: mi + 1 };
          }
        }
      }
    }
  }
  return null;
}

interface AlunosState {
  alunos: Aluno[];
  avaliacoes: Avaliacao[];
  prescricoes: Prescricao[];
  /** planos de treino (periodização longitudinal do "Prescrever treino") */
  planos: PlanoTreino[];
  /** liberações do Semáforo (gate pré-sessão do Motor RCD) */
  liberacoes: Liberacao[];
  /** o que o aluno executou de fato (carga/reps/RPE), base da autorregulação */
  execucoes: Execucao[];
  /** rastreios posturais (fotos + observações + laudo); ficam locais (dado sensível) */
  posturais: AvaliacaoPostural[];
  addAluno: (a: Aluno) => void;
  updateAluno: (id: string, patch: Partial<Aluno>) => void;
  removeAluno: (id: string) => void;
  addAvaliacao: (av: Avaliacao) => void;
  addPrescricao: (p: Prescricao) => void;
  archivePrescricao: (id: string) => void;
  addPlano: (p: PlanoTreino) => void;
  updatePlano: (id: string, patch: Partial<PlanoTreino>) => void;
  removePlano: (id: string) => void;
  addLiberacao: (l: Liberacao) => void;
  /** registra uma execução do aluno (uma série concluída de um bloco); faz upsert */
  addExecucao: (e: Execucao) => void;
  /** desfaz uma execução registrada pelo id */
  removeExecucao: (id: string) => void;
  /** salva um rastreio postural (dado local, não vai para a nuvem) */
  addPostural: (a: AvaliacaoPostural) => void;
  /** remove um rastreio postural pelo id */
  removePostural: (id: string) => void;
  /** carrega os alunos de demonstração (para experimentar sem cadastrar) */
  loadExamples: () => void;
}

export const useAlunos = create<AlunosState>()(
  persist(
    (set, get) => ({
      // Novo usuário começa VAZIO (estado vazio real + "carregar exemplos").
      alunos: [],
      avaliacoes: [],
      prescricoes: [],
      planos: [],
      liberacoes: [],
      execucoes: [],
      posturais: [],
      loadExamples: () => {
        set({ alunos: seedAlunos, avaliacoes: seedAvaliacoes, prescricoes: seedPrescricoes });
        // sobe os exemplos p/ a nuvem quando há sessão (no-op no modo local)
        seedAlunos.forEach(cloudSaveAluno);
        seedAvaliacoes.forEach(cloudSaveAvaliacao);
        seedPrescricoes.forEach(cloudSavePrescricao);
      },
      addAluno: (a) => {
        set((s) => ({ alunos: [a, ...s.alunos] }));
        cloudSaveAluno(a);
      },
      updateAluno: (id, patch) => {
        set((s) => ({ alunos: s.alunos.map((a) => (a.id === id ? { ...a, ...patch } : a)) }));
        const atual = get().alunos.find((a) => a.id === id);
        if (atual) cloudSaveAluno(atual);
      },
      removeAluno: (id) => {
        set((s) => ({
          alunos: s.alunos.filter((a) => a.id !== id),
          avaliacoes: s.avaliacoes.filter((a) => a.alunoId !== id),
          prescricoes: s.prescricoes.filter((p) => p.alunoId !== id),
          planos: s.planos.filter((p) => p.alunoId !== id),
          liberacoes: s.liberacoes.filter((l) => l.alunoId !== id),
          execucoes: s.execucoes.filter((e) => e.alunoId !== id),
          posturais: s.posturais.filter((pp) => pp.alunoId !== id),
        }));
        // o repositório apaga em cascata avaliações/prescrições/liberações do aluno
        cloudRemoveAluno(id);
      },
      addAvaliacao: (av) => {
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
        }));
        cloudSaveAvaliacao(av);
        // a reavaliação do aluno pode ter sido reprogramada: espelha o aluno também
        const aluno = get().alunos.find((a) => a.id === av.alunoId);
        if (aluno) cloudSaveAluno(aluno);
      },
      // a NOVA prescrição é a vigente: as anteriores "ativa" do mesmo aluno são
      // arquivadas (senão o aluno acumula 3 prescrições "ativas" e ninguém sabe qual vale)
      addPrescricao: (p) => {
        const arquivarIds = get()
          .prescricoes.filter((x) => x.alunoId === p.alunoId && x.status === "ativa")
          .map((x) => x.id);
        set((s) => ({
          prescricoes: [
            p,
            ...s.prescricoes.map((x) =>
              x.alunoId === p.alunoId && x.status === "ativa" ? { ...x, status: "arquivada" as const } : x,
            ),
          ],
        }));
        cloudSavePrescricao(p);
        // espelha as que passaram a "arquivada"
        const atuais = get().prescricoes;
        arquivarIds.forEach((pid) => {
          const x = atuais.find((y) => y.id === pid);
          if (x) cloudSavePrescricao(x);
        });
      },
      // O NOVO plano é o vigente: os anteriores "ativo" do mesmo aluno são arquivados
      // (mesma regra da prescrição: o aluno não pode ter dois planos "ativos" e ninguém
      // saber qual vale).
      addPlano: (p) => {
        const arquivarIds = get()
          .planos.filter((x) => x.alunoId === p.alunoId && x.status === "ativo")
          .map((x) => x.id);
        set((s) => ({
          planos: [
            p,
            ...s.planos.map((x) =>
              x.alunoId === p.alunoId && x.status === "ativo" ? { ...x, status: "arquivado" as const } : x,
            ),
          ],
        }));
        cloudSavePlano(p);
        const atuais = get().planos;
        arquivarIds.forEach((pid) => {
          const x = atuais.find((y) => y.id === pid);
          if (x) cloudSavePlano(x);
        });
      },
      updatePlano: (id, patch) => {
        set((s) => ({ planos: s.planos.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
        const atual = get().planos.find((p) => p.id === id);
        if (atual) cloudSavePlano(atual);
      },
      removePlano: (id) => {
        set((s) => ({ planos: s.planos.filter((p) => p.id !== id) }));
        cloudRemovePlano(id);
      },
      addLiberacao: (l) => {
        set((s) => ({ liberacoes: [l, ...s.liberacoes].slice(0, 200) }));
        cloudSaveLiberacao(l);
      },
      // Execução do aluno. Espelho na nuvem entra com a conta do aluno (fase de
      // auth do portal); por ora persiste local, base da autorregulação.
      // UPSERT por (aluno, plano, semana, bloco): registrar de novo o mesmo
      // exercício da mesma semana SOBRESCREVE, então editar não duplica.
      addExecucao: (e) => {
        set((s) => ({
          execucoes: [
            e,
            ...s.execucoes.filter(
              (x) => !(x.alunoId === e.alunoId && x.planoId === e.planoId && x.semana === e.semana && x.blocoRef === e.blocoRef),
            ),
          ].slice(0, 2000),
        }));
      },
      removeExecucao: (id) => {
        set((s) => ({ execucoes: s.execucoes.filter((e) => e.id !== id) }));
      },
      // Rastreio postural: contém fotos (data URL, sensível e pesado). Fica LOCAL,
      // sem espelho na nuvem, para respeitar a privacidade e não inchar o Supabase.
      addPostural: (a) => {
        set((s) => ({ posturais: [a, ...s.posturais].slice(0, 200) }));
      },
      removePostural: (id) => {
        set((s) => ({ posturais: s.posturais.filter((p) => p.id !== id) }));
      },
      archivePrescricao: (id) => {
        set((s) => ({
          prescricoes: s.prescricoes.map((p) =>
            p.id === id ? { ...p, status: "arquivada" as const } : p,
          ),
        }));
        const x = get().prescricoes.find((p) => p.id === id);
        if (x) cloudSavePrescricao(x);
      },
    }),
    // v2: seed passou a incluir a jornada (grupoEspecial/fase) em alguns alunos.
    // v3: "Máquina" foi DIVIDIDA — esteira/bicicleta/elíptico viraram equipamentos próprios;
    //     alunos antigos com "Máquina" ganham as máquinas aeróbicas (o significado antigo as incluía).
    // v4: "Peso corporal" passa a ser garantido em todo aluno (o próprio corpo está sempre
    //     disponível); alunos antigos sem esse equipamento recebem-no no backfill.
    // v5: Avaliacao ganhou campos profissionais opcionais (tipo, condição, perímetros, testes,
    //     fotos, personalizadas, sinais fisiológicos). Aditivo: avaliações antigas seguem válidas.
    // v6: Aluno ganhou `nivelDesde` (para sugerir progressão de nível por tempo). Backfill =
    //     criadoEm nos alunos que não têm (assume que estão no nível desde o cadastro).
    // migrate por MERGE: preserva os dados do usuário (alunos/avaliações/prescrições que
    // ele criou) e apenas faz backfill dos campos novos do seed nos alunos-semente por id.
    // Assim, futuros bumps de versão não apagam o trabalho do profissional.
    // v7: restrições deixaram de ser string[] ("Dor lombar"...) e viraram o modelo
    //     estruturado RestricaoSelecionada[] (30 restrições, gatilhos, lado, gravidade,
    //     liberação, dispositivo). migrarRestricoesLegado converte o formato antigo por
    //     merge e é idempotente (mantém o que já vier estruturado).
    // v8: nasce a coleção `planos` (periodização do "Prescrever treino"). Aditivo: o
    //     backfill só garante o array vazio em quem vem de uma versão anterior; nada do
    //     que o profissional já criou é tocado.
    {
      name: "pi-alunos",
      version: 10,
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
            return {
              ...merged,
              equipamentos: normalizaEquip(merged.equipamentos),
              // v6: assume que o aluno está no nível desde o cadastro, se não houver registro
              nivelDesde: merged.nivelDesde ?? merged.criadoEm,
              // v7: restrições string[] legadas → modelo estruturado
              restricoes: migrarRestricoesLegado(merged.restricoes),
            };
          }),
          avaliacoes: Array.isArray(p.avaliacoes) ? p.avaliacoes : seedAvaliacoes,
          // v7: as answers salvas guardavam restricoes string[]: migra o rastro do cálculo
          prescricoes: (Array.isArray(p.prescricoes) ? p.prescricoes : seedPrescricoes).map((pr) => ({
            ...pr,
            answers: { ...pr.answers, restricoes: migrarRestricoesLegado(pr.answers?.restricoes) },
          })),
          liberacoes: Array.isArray(p.liberacoes) ? p.liberacoes : [],
          // v8: coleção nova; quem vem de versão anterior começa sem planos.
          planos: Array.isArray(p.planos) ? p.planos : [],
          // v9: execuções do aluno (base da autorregulação). Aditivo.
          execucoes: Array.isArray(p.execucoes) ? p.execucoes : [],
          // v10: rastreios posturais (locais). Aditivo.
          posturais: Array.isArray(p.posturais) ? p.posturais : [],
        } as unknown as AlunosState;
      },
    },
  ),
);
