import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Aluno, Avaliacao, Prescricao, Liberacao } from "@/data/alunos";
import type { PlanoTreino } from "@/data/periodizacao";
import type { Execucao, SessaoFeedback } from "@/data/execucao";
import type { AvaliacaoPostural } from "@/data/postural";
import type { Modo } from "@/lib/theme/palettes";
import { seedAlunos, seedAvaliacoes, seedPrescricoes } from "@/data/alunos";
import { semearDemoVSL } from "@/data/semearDemo";
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
  /** cor principal da marca (hex, ex.: "#1b4b66"); vazio usa a cor do produto.
   *  Tinge o cabeçalho dos documentos e, no portal do aluno, o app inteiro. */
  corPrimaria: string;
  /** paleta do sistema escolhida pelo profissional (id em palettes.ts). Vazio
   *  usa o padrão. Adapta o app inteiro e a visão do aluno. */
  paleta: string;
  /** claro | escuro | sistema (segue o SO). */
  modo: Modo;
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
      paleta: "rota",
      modo: "claro",
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
      version: 2,
      // v1: fim do tier grátis. Quem estava em "free" vira "assinante".
      // v2: a identidade "Rota" virou a do produto. A paleta era GRAVADA
      //     explicitamente no perfil (nunca ficava indefinida), então sem este
      //     remapeamento quem já usava o app continuaria em Grafite para
      //     sempre. O modo claro/escuro é preservado: é escolha de conforto,
      //     não de marca.
      migrate: (persisted) => {
        const p = (persisted ?? {}) as Partial<UserState>;
        if (!p.plan || (p.plan as string) === "free") p.plan = "assinante";
        p.paleta = "rota";
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

/**
 * A casca não tem mais PREFERÊNCIA de menu. A barra lateral saiu na
 * reestruturação (uma barra superior de 5 pílulas + "Mais"), e com ela morreram
 * os três campos que viviam aqui: `collapsed` (rail de ícones), `mobileOpen`
 * (drawer) e `gruposComprimidos` (grupos do menu, chaveados por LABEL LITERAL,
 * uma dívida que obrigava a migrar o persist a cada renomeação de grupo).
 *
 * A fatia continua existindo VAZIA de propósito, em `version: 2`, para o
 * migrate apagar o objeto antigo do localStorage de quem já usava o app; deletar
 * o `create` deixaria a chave `pi-ui` órfã para sempre. Quando um estado de
 * casca voltar a ser necessário, ele nasce aqui, sem herdar nada.
 */
interface UIState {
  _vazio?: never;
}

export const useUI = create<UIState>()(
  persist(() => ({}), {
    name: "pi-ui",
    version: 2,
    // v1 guardava collapsed + gruposComprimidos, campos de uma sidebar que não
    // existe mais. Descartar é o certo: manter reviveria preferência de um menu
    // que ninguém mais vê.
    migrate: () => ({}),
    partialize: () => ({}),
  }),
);

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
// Tipo herdado dos antigos dois modos (atender/aprender). O store useMode e o
// persist "pi-mode" foram APOSENTADOS junto com a sidebar de modo único (era
// código morto: ninguém lia o estado). O TIPO fica porque os tutoriais ainda o
// usam como rótulo opcional de escopo (tutorials.ts).
export type AppMode = "atender" | "aprender";

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
  /** como o aluno sentiu a sessão (PSE + duração medida + recado ao professor) */
  sessaoFeedbacks: SessaoFeedback[];
  /** rastreios posturais (fotos + observações + laudo); ficam locais (dado sensível) */
  posturais: AvaliacaoPostural[];
  addAluno: (a: Aluno) => void;
  updateAluno: (id: string, patch: Partial<Aluno>) => void;
  removeAluno: (id: string) => void;
  addAvaliacao: (av: Avaliacao) => void;
  addPrescricao: (p: Prescricao) => void;
  archivePrescricao: (id: string) => void;
  /** volta uma prescrição arquivada para ativa; existe para o "Desfazer" do toast */
  unarchivePrescricao: (id: string) => void;
  addPlano: (p: PlanoTreino) => void;
  updatePlano: (id: string, patch: Partial<PlanoTreino>) => void;
  removePlano: (id: string) => void;
  addLiberacao: (l: Liberacao) => void;
  /** registra a conduta do profissional quando ela diverge do semáforo (com justificativa) */
  registrarDecisaoContraria: (liberacaoId: string, justificativa: string) => void;
  /** registra uma execução do aluno (uma série concluída de um bloco); faz upsert */
  addExecucao: (e: Execucao) => void;
  /** desfaz uma execução registrada pelo id */
  removeExecucao: (id: string) => void;
  /** registra o feedback da sessão (PSE + duração + recado); faz upsert por sessão/semana */
  addSessaoFeedback: (f: SessaoFeedback) => void;
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
      sessaoFeedbacks: [],
      posturais: [],
      loadExamples: () => {
        /*
         * Os exemplos incluem os DOIS CASOS DO VSL com a história inteira (plano de 12
         * semanas gerado pelo motor na hora, execuções série a série, PSE, semáforos e
         * avaliações em série). Gerar na hora, e não de um literal, é o que garante que a
         * demo mostra o comportamento ATUAL do motor (ver src/data/semearDemo.ts).
         */
        const demo = semearDemoVSL();
        /*
         * MESCLA, nunca substitui. O botão nasceu na carteira vazia, onde trocar a lista
         * inteira era inofensivo; agora ele também existe para carteiras com alunos reais
         * (o estúdio carrega a demo na conta de verdade), e apagar dados reais para exibir
         * exemplo seria o pior negócio possível. A regra: o que já existe com o mesmo id
         * fica como está; ids são fixos, então clicar duas vezes não duplica nada.
         */
        const mesclar = <T extends { id: string }>(novos: T[], atuais: T[]): T[] => {
          const ids = new Set(atuais.map((x) => x.id));
          return [...novos.filter((n) => !ids.has(n.id)), ...atuais];
        };
        set((s) => ({
          alunos: mesclar([...demo.alunos, ...seedAlunos], s.alunos),
          avaliacoes: mesclar([...demo.avaliacoes, ...seedAvaliacoes], s.avaliacoes),
          prescricoes: mesclar(seedPrescricoes, s.prescricoes),
          planos: mesclar(demo.planos, s.planos),
          liberacoes: mesclar(demo.liberacoes, s.liberacoes),
          execucoes: mesclar(demo.execucoes, s.execucoes),
          sessaoFeedbacks: mesclar(demo.feedbacks, s.sessaoFeedbacks),
        }));
        // sobe os exemplos p/ a nuvem quando há sessão (no-op no modo local)
        [...demo.alunos, ...seedAlunos].forEach(cloudSaveAluno);
        [...demo.avaliacoes, ...seedAvaliacoes].forEach(cloudSaveAvaliacao);
        seedPrescricoes.forEach(cloudSavePrescricao);
        demo.planos.forEach(cloudSavePlano);
        demo.liberacoes.forEach(cloudSaveLiberacao);
        // Execuções e PSE ficam locais de propósito: o espelho deles na nuvem entra pela
        // conta do ALUNO (portal), que um aluno de demonstração não tem.
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
          sessaoFeedbacks: s.sessaoFeedbacks.filter((f) => f.alunoId !== id),
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
      // A conduta do profissional quando ela diverge do semáforo. Não altera o RESULTADO
      // do checklist, que é o fato medido; acrescenta o que ele decidiu diante dele, que é
      // o fato clínico. Os dois convivem no prontuário, e é a distância entre eles que
      // documenta a decisão.
      registrarDecisaoContraria: (liberacaoId, justificativa) => {
        const texto = justificativa.trim();
        if (!texto) return;
        set((s) => ({
          liberacoes: s.liberacoes.map((l) =>
            l.id === liberacaoId ? { ...l, decisaoContraria: { justificativa: texto, em: Date.now() } } : l,
          ),
        }));
        const alvo = get().liberacoes.find((l) => l.id === liberacaoId);
        if (alvo) cloudSaveLiberacao(alvo);
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
      // Feedback da sessão. UPSERT por (aluno, plano, semana, sessão): reenviar o
      // esforço/recado da mesma sessão SOBRESCREVE, então não duplica. Espelho na
      // nuvem entra com a conta do aluno (o AlunoPortal chama salvarSessaoFeedback).
      addSessaoFeedback: (f) => {
        set((s) => ({
          sessaoFeedbacks: [
            f,
            ...s.sessaoFeedbacks.filter(
              (x) => !(x.alunoId === f.alunoId && x.planoId === f.planoId && x.semana === f.semana && x.sessaoRef === f.sessaoRef),
            ),
          ].slice(0, 500),
        }));
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
      // Arquivar é um clique só, sem diálogo, e some com a prescrição da lista. Sem volta,
      // isso é perda de documento num produto de prontuário. O desfazer do toast precisa
      // deste par para existir.
      unarchivePrescricao: (id) => {
        set((s) => ({
          prescricoes: s.prescricoes.map((p) =>
            p.id === id ? { ...p, status: "ativa" as const } : p,
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
    // v11: `condicoesAtencao` deixou de ser string livre e virou `string[]` (grupos
    //      especiais adicionais confirmados, combinados no motor de validação); nasce
    //      `sugestoesDispensadas` (grupos que o profissional dispensou). Aditivo por
    //      merge: normaliza o campo legado sem tocar no que o profissional criou.
    // v12: nasce a coleção `sessaoFeedbacks` (PSE + duração medida + recado da sessão,
    //      base do lado "como o aluno sentiu"). Aditivo: quem vem de versão anterior
    //      começa com a lista vazia; nada do que já existe é tocado.
    // v13: o objetivo "Reabilitação/retorno" foi renomeado para "Retorno ao treino"
    //      (a palavra "Reabilitação" saiu do produto). Remapeia o valor persistido em
    //      Aluno.objetivo, PlanoTreino.objetivo e Prescricao.answers.objetivo; todo o
    //      resto é preservado (migrate por merge).
    // v14: obesidade e hipertensão foram fragmentadas por NÍVEL. O slug único
    //      "obesidade-grave" virou grau I/II/III e "hipertensao" virou estágio 1/2.
    //      Remapeia todo slug morto em Aluno.grupoEspecial/condicoesAtencao/
    //      sugestoesDispensadas, PlanoTreino.grupoEspecial e Liberacao.grupoSlug:
    //      obesidade recalcula pelo IMC da última avaliação (fallback conservador
    //      obesidade-grau-1 quando não há IMC) e hipertensão pela última PA (fallback
    //      hipertensao-estagio-1 sem PA). Nenhum registro pode apontar para slug morto.
    // v15: o Aluno passa a poder declarar as CLASSES de medicação em uso (`farmacos`) e o
    //      estado "não sei ou prefiro não informar" (`farmacosNaoInformado`). Aditivo e SEM
    //      backfill de propósito: campo ausente é o estado válido "não declarou", que é
    //      diferente de "nenhuma" (lista vazia) e de "não informou" (a flag). Inventar um
    //      valor no backfill seria afirmar sobre o aluno algo que ninguém perguntou.
    {
      name: "pi-alunos",
      version: 15,
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
        // v13: renomeação do objetivo (a palavra "Reabilitação" saiu do produto).
        const remapObjetivo = (o: unknown): unknown =>
          o === "Reabilitação/retorno" ? "Retorno ao treino" : o;

        // v14: obesidade/hipertensão por NÍVEL. Recalcula o slug pelo dado medido na
        // ÚLTIMA avaliação do aluno; sem o dado, cai no fallback conservador (grau 1 /
        // estágio 1), documentado. Um grupo persistido nunca vira slug de encaminhamento:
        // o teto do mapeamento é grau III / estágio 2 (o mais conservador que É grupo).
        const avaliacoesV14 = Array.isArray(p.avaliacoes) ? p.avaliacoes : [];
        type MedidasV14 = {
          imc?: number; peso?: number; altura?: number;
          pressaoSistolica?: number; pressaoDiastolica?: number;
        };
        const ultimaMedidaDe = (alunoId?: string): MedidasV14 | undefined =>
          !alunoId
            ? undefined
            : (avaliacoesV14
                .filter((a) => a?.alunoId === alunoId)
                .sort((a, b) => (b?.data ?? 0) - (a?.data ?? 0))[0]?.medidas as MedidasV14 | undefined);
        const imcDe = (med?: MedidasV14): number | undefined =>
          typeof med?.imc === "number"
            ? med.imc
            : typeof med?.peso === "number" && typeof med?.altura === "number" && med.altura > 0
              ? med.peso / (med.altura / 100) ** 2
              : undefined;
        const grauPorImc = (imc?: number): string =>
          typeof imc !== "number" ? "obesidade-grau-1" : imc >= 40 ? "obesidade-grau-3" : imc >= 35 ? "obesidade-grau-2" : "obesidade-grau-1";
        const estagioPorPa = (sis?: number, dia?: number): string => {
          const s = typeof sis === "number" ? sis : -1;
          const d = typeof dia === "number" ? dia : -1;
          if (s < 0 && d < 0) return "hipertensao-estagio-1"; // fallback conservador (sem PA)
          return s >= 160 || d >= 100 ? "hipertensao-estagio-2" : "hipertensao-estagio-1";
        };
        // Remapeia UM slug: só age nos dois slugs mortos; o resto passa intacto.
        const remapGrupo = (slug: unknown, alunoId?: string): unknown => {
          if (slug !== "obesidade-grave" && slug !== "hipertensao") return slug;
          const med = ultimaMedidaDe(alunoId);
          return slug === "obesidade-grave"
            ? grauPorImc(imcDe(med))
            : estagioPorPa(med?.pressaoSistolica, med?.pressaoDiastolica);
        };
        // Remapeia uma LISTA de slugs (condicoesAtencao/sugestoesDispensadas), sem duplicar.
        const remapGrupos = (slugs: unknown, alunoId?: string): string[] | undefined => {
          if (!Array.isArray(slugs)) return undefined;
          const out: string[] = [];
          for (const s of slugs) {
            const novo = remapGrupo(s, alunoId) as string;
            if (!out.includes(novo)) out.push(novo);
          }
          return out;
        };
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
              // v13: objetivo renomeado ("Reabilitação/retorno" → "Retorno ao treino").
              objetivo: remapObjetivo(merged.objetivo) as Aluno["objetivo"],
              equipamentos: normalizaEquip(merged.equipamentos),
              // v6: assume que o aluno está no nível desde o cadastro, se não houver registro
              nivelDesde: merged.nivelDesde ?? merged.criadoEm,
              // v7: restrições string[] legadas → modelo estruturado
              restricoes: migrarRestricoesLegado(merged.restricoes),
              // v14: grupo principal por nível (obesidade grau / hipertensão estágio).
              grupoEspecial: remapGrupo(merged.grupoEspecial, merged.id) as string | undefined,
              // v11: condicoesAtencao virou string[] (grupos adicionais). Blobs antigos
              // podiam trazer uma string livre (nunca era slug de grupo): normaliza para
              // array, descartando o texto legado que não classificava nada.
              // v14: remapeia os slugs mortos (obesidade-grave/hipertensao) por nível.
              condicoesAtencao: remapGrupos(
                (merged as { condicoesAtencao?: unknown }).condicoesAtencao,
                merged.id,
              ),
              // v14: idem para as sugestões que o profissional dispensou (não reexibir).
              sugestoesDispensadas: remapGrupos(
                (merged as { sugestoesDispensadas?: unknown }).sugestoesDispensadas,
                merged.id,
              ),
            };
          }),
          avaliacoes: Array.isArray(p.avaliacoes) ? p.avaliacoes : seedAvaliacoes,
          // v7: as answers salvas guardavam restricoes string[]: migra o rastro do cálculo
          prescricoes: (Array.isArray(p.prescricoes) ? p.prescricoes : seedPrescricoes).map((pr) => ({
            ...pr,
            // v13: objetivo renomeado no rastro do cálculo salvo.
            answers: {
              ...pr.answers,
              objetivo: remapObjetivo(pr.answers?.objetivo) as Prescricao["answers"]["objetivo"],
              restricoes: migrarRestricoesLegado(pr.answers?.restricoes),
            },
          })),
          // v14: o semáforo salvo guardava o grupo; remapeia o slug morto por nível
          // (usa a última avaliação do aluno; historial nunca fica com slug morto).
          liberacoes: (Array.isArray(p.liberacoes) ? p.liberacoes : []).map((l) => ({
            ...l,
            grupoSlug: remapGrupo(l.grupoSlug, l.alunoId) as string,
          })),
          // v8: coleção nova; quem vem de versão anterior começa sem planos.
          // v13: remapeia o objetivo renomeado nos planos já salvos.
          // v14: remapeia o grupoEspecial do plano por nível (o rotuloAluno impresso é
          // o mesmo por condição, então o texto já salvo do plano segue coerente).
          planos: (Array.isArray(p.planos) ? p.planos : []).map((pl) => ({
            ...pl,
            objetivo: remapObjetivo(pl.objetivo) as PlanoTreino["objetivo"],
            grupoEspecial: remapGrupo(pl.grupoEspecial, pl.alunoId) as string | undefined,
          })),
          // v9: execuções do aluno (base da autorregulação). Aditivo.
          execucoes: Array.isArray(p.execucoes) ? p.execucoes : [],
          // v12: feedback da sessão (PSE + duração + recado). Aditivo.
          sessaoFeedbacks: Array.isArray(p.sessaoFeedbacks) ? p.sessaoFeedbacks : [],
          // v10: rastreios posturais (locais). Aditivo.
          posturais: Array.isArray(p.posturais) ? p.posturais : [],
        } as unknown as AlunosState;
      },
    },
  ),
);
