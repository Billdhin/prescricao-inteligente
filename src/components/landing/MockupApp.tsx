import * as React from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CalendarClock,
  CalendarRange,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Clock,
  FileDown,
  FlaskConical,
  GraduationCap,
  MoreHorizontal,
  Save,
  Search,
  ShieldCheck,
  Sunrise,
  TrafficCone,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { MarcaPino } from "@/components/brand/Logo";

/**
 * Mockups do produto para a seção "Por dentro do app" da landing.
 *
 * NÃO é imagem: é a interface real redesenhada em DOM, com os tokens, rótulos e
 * dados verdadeiros do sistema (casca navy de 248px, cabeçalhos, cards, pílulas
 * e o gráfico de progressão). Renderiza sempre em 1180x820 — a medida real de
 * uma janela de trabalho — e é reduzido por `transform: scale` até caber no
 * monitor, então as proporções e a hierarquia tipográfica ficam fiéis em vez de
 * "fonte miúda desenhada à mão". Nítido em qualquer tela, inclusive retina.
 *
 * Fontes da verdade: AppLayout/nav.ts (casca), Semaforo.tsx + SemaforoLiberacao,
 * AlunoPerfil.tsx + OQueIssoMudaPainel, Avaliacoes.tsx e PrescreverTreino.tsx
 * (GraficoProgressao). Os textos são verbatim do app.
 */

/* --------------------------- tokens reais do app -------------------------- */

const T = {
  bg: "#F7F6F2",
  surface: "#FFFDF9",
  surfaceSoft: "#F0EFE9",
  surfaceMute: "#EEECE5",
  border: "#E8E6DF",
  ink: "#17202E",
  ink2: "#616874",
  ink4: "#9AA1AC",
  primary: "#2064EC",
  primaryTint: "#EEF3FE",
  analysis: "#0C6B70",
  analysisTint: "#E0F5F4",
  analysisFill: "#14B3BA",
  success: "#177A4C",
  successTint: "#E3F4EA",
  warning: "#8E6009",
  warningTint: "#FBF1DC",
  danger: "#C0361F",
  dangerFill: "#E2543E",
  dangerTint: "#FCEAE6",
  // casca (valores fixos do AppLayout, não seguem o tema)
  cascaFundo: "#0D1524",
  cascaBorda: "rgba(148,170,210,.12)",
  cascaTinta: "#F2F6FC",
  cascaTinta2: "#9DB2D6",
} as const;

export type MockupTela = "cadastro" | "avaliacoes" | "semaforo" | "periodizacao";

const LARGURA = 1180;
const ALTURA = 820;

/* ------------------------- canvas em escala fiel -------------------------- */

/**
 * Renderiza o filho no tamanho real e o reduz até a largura disponível.
 *
 * A medição sai de um sensor de altura zero, e não do próprio quadro: como a
 * altura do quadro é derivada da escala, observar o quadro criaria um laço de
 * ResizeObserver — e o navegador descarta essas notificações, deixando a escala
 * velha (o mockup ficava cortado à direita ao estreitar a tela). O sensor só
 * muda de largura, então a notificação é sempre entregue.
 */
function CanvasEscalado({ children }: { children: React.ReactNode }) {
  const sensor = React.useRef<HTMLDivElement>(null);
  const [escala, setEscala] = React.useState(0.62);

  React.useEffect(() => {
    const el = sensor.current;
    if (!el) return;
    const medir = () => {
      const l = el.clientWidth;
      if (l > 0) setEscala(l / LARGURA);
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    window.addEventListener("resize", medir);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", medir);
    };
  }, []);

  return (
    <div className="relative w-full">
      <div ref={sensor} aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-0" />
      <div className="relative w-full overflow-hidden" style={{ height: ALTURA * escala }}>
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{ width: LARGURA, height: ALTURA, transform: `scale(${escala})` }}
          aria-hidden
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- monitor -------------------------------- */

/** Moldura de monitor de mesa: bisel, tela, pescoço e base. */
export function MonitorMockup({ tela, url }: { tela: MockupTela; url: string }) {
  return (
    <div className="w-full">
      <div
        className="rounded-[18px] p-2.5 shadow-[0_30px_70px_-32px_rgba(16,35,58,0.45)]"
        style={{ background: "linear-gradient(160deg,#2a3446,#131a27)" }}
      >
        <div className="overflow-hidden rounded-[10px]" style={{ background: T.bg }}>
          {/* barra do navegador */}
          <div
            className="flex items-center gap-1.5 border-b px-3 py-2"
            style={{ background: T.surfaceSoft, borderColor: T.border }}
          >
            <span className="h-2 w-2 rounded-full" style={{ background: "#E3E0DA" }} />
            <span className="h-2 w-2 rounded-full" style={{ background: "#E3E0DA" }} />
            <span className="h-2 w-2 rounded-full" style={{ background: "#E3E0DA" }} />
            <span
              className="ml-2 truncate rounded-full px-2.5 py-0.5 font-mono text-2xs"
              style={{ background: T.surface, color: T.ink4 }}
            >
              {url}
            </span>
          </div>
          <CanvasEscalado>
            <AppMockup tela={tela} />
          </CanvasEscalado>
        </div>
      </div>
      {/* pescoço e base: some no mobile, como pede o briefing */}
      <div className="mx-auto hidden h-4 w-24 sm:block" style={{ background: "linear-gradient(180deg,#222c3d,#18202e)" }} />
      <div
        className="mx-auto hidden h-2 w-52 rounded-b-full sm:block"
        style={{ background: "linear-gradient(180deg,#1c2536,#101724)" }}
      />
    </div>
  );
}

/* ---------------------------- casca do produto ---------------------------- */

const PRIMARIOS = [
  { short: "Meu dia", icon: Sunrise, tela: null },
  { short: "Alunos", icon: Users, tela: "cadastro" as const },
  { short: "Avaliar", icon: ClipboardCheck, tela: "avaliacoes" as const, badge: 2, tom: "warning" as const },
  { short: "Treinos", icon: CalendarRange, tela: "periodizacao" as const },
  { short: "Semáforo", icon: ShieldCheck, tela: "semaforo" as const, badge: 3, tom: "urgente" as const },
];

const MAIS = [
  { label: "Estudar", icon: GraduationCap },
  { label: "Laboratório Visual", icon: FlaskConical },
  { label: "Protocolos", icon: ClipboardList },
];

function Sidebar({ tela }: { tela: MockupTela }) {
  return (
    <aside
      className="flex w-[248px] shrink-0 flex-col border-r"
      style={{ background: T.cascaFundo, borderColor: T.cascaBorda }}
    >
      {/* marca */}
      <div className="flex items-center gap-3 px-5 pb-5 pt-6">
        {/* mesma marca do app: o pino oficial, como o Sidebar real usa */}
        <MarcaPino className="h-8 w-8 shrink-0" />
        <span className="font-display text-base font-bold leading-tight" style={{ color: T.cascaTinta }}>
          Mapa da
          <br />
          Prescrição
        </span>
      </div>

      {/* primários */}
      <nav className="px-3">
        <ul className="space-y-1">
          {PRIMARIOS.map((it) => {
            const Icon = it.icon;
            const ativo = it.tela === tela;
            return (
              <li key={it.short}>
                <div
                  className="flex min-h-[44px] items-center gap-3 rounded-[18px] px-3 text-sm font-semibold"
                  style={
                    ativo
                      ? { background: "#FFFDF9", color: "#17202E", boxShadow: "0 1px 3px rgba(13,21,36,.28)" }
                      : { color: T.cascaTinta2 }
                  }
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  <span className="flex-1 truncate">{it.short}</span>
                  {it.badge && (
                    <span
                      className="grid h-6 min-w-[24px] place-items-center rounded-full px-1.5 text-2xs font-bold"
                      style={
                        it.tom === "urgente"
                          ? { background: T.dangerFill, color: T.ink }
                          : { background: T.warningTint, color: T.warning }
                      }
                    >
                      {it.badge}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* grupo Mais */}
      <div className="px-3 pb-2 pt-6 text-2xs font-bold uppercase tracking-[0.14em]" style={{ color: T.cascaTinta2 }}>
        Mais
      </div>
      <nav className="px-3">
        <ul className="space-y-1">
          {MAIS.map((it) => {
            const Icon = it.icon;
            return (
              <li
                key={it.label}
                className="flex min-h-[44px] items-center gap-3 rounded-[18px] px-3 text-sm font-semibold"
                style={{ color: T.cascaTinta2 }}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span className="flex-1 truncate">{it.label}</span>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex-1" />

      {/* rodapé do usuário */}
      <div className="border-t px-3 py-3" style={{ borderColor: T.cascaBorda }}>
        <div className="flex min-h-[48px] items-center gap-3 rounded-[18px] px-2">
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold"
            style={{ background: T.primary, color: "#fff" }}
          >
            FA
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold" style={{ color: T.cascaTinta }}>
              Filipe Andrade
            </span>
            <span className="block text-2xs" style={{ color: T.cascaTinta2 }}>
              Profissional
            </span>
          </span>
          <MoreHorizontal className="h-4 w-4 shrink-0" style={{ color: T.cascaTinta2 }} />
        </div>
      </div>
    </aside>
  );
}

/* --------------------------- primitivos do app ---------------------------- */

function Card({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`rounded-[18px] border ${className}`}
      style={{
        background: T.surface,
        borderColor: T.border,
        boxShadow: "0 1px 2px rgba(16,24,40,.05), 0 1px 3px rgba(16,24,40,.04)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

type Tom = "primary" | "success" | "warning" | "danger" | "neutral" | "analysis";
const TOM: Record<Tom, { bg: string; fg: string }> = {
  primary: { bg: T.primaryTint, fg: T.primary },
  success: { bg: T.successTint, fg: T.success },
  warning: { bg: T.warningTint, fg: T.warning },
  danger: { bg: T.dangerTint, fg: T.danger },
  neutral: { bg: T.surfaceSoft, fg: T.ink2 },
  analysis: { bg: T.analysisTint, fg: T.analysis },
};

function Pill({ tom = "neutral", children }: { tom?: Tom; children: React.ReactNode }) {
  const c = TOM[tom];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ background: c.bg, color: c.fg }}
    >
      {children}
    </span>
  );
}

function BotaoEscuro({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-semibold"
      style={{ background: T.ink, color: T.surface }}
    >
      {children}
    </span>
  );
}
function BotaoClaro({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold"
      style={{ background: T.surface, borderColor: T.border, color: T.ink }}
    >
      {children}
    </span>
  );
}

function Avatar({ iniciais, gradiente = true }: { iniciais: string; gradiente?: boolean }) {
  return (
    <span
      className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold"
      style={
        gradiente
          ? { background: `linear-gradient(135deg, ${T.primary}, ${T.analysisFill})`, color: "#fff" }
          : { background: T.surfaceSoft, color: T.ink2 }
      }
    >
      {iniciais}
    </span>
  );
}

/** Cabeçalho de página do app (SectionHeader level 1). */
function TituloPagina({
  eyebrow,
  icone,
  titulo,
  subtitulo,
  direita,
}: {
  eyebrow: string;
  icone: React.ReactNode;
  titulo: string;
  subtitulo: string;
  direita?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <span
          className="mb-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
          style={{ background: T.primaryTint, color: T.primary }}
        >
          {icone}
          {eyebrow}
        </span>
        <h1 className="font-display text-4xl font-bold" style={{ color: T.ink }}>
          {titulo}
        </h1>
        <p className="mt-2 max-w-2xl" style={{ color: T.ink2 }}>
          {subtitulo}
        </p>
      </div>
      {direita}
    </div>
  );
}

/* --------------------------------- telas ---------------------------------- */

function AppMockup({ tela }: { tela: MockupTela }) {
  return (
    <div className="flex h-full w-full" style={{ background: T.bg, height: ALTURA }}>
      <Sidebar tela={tela} />
      <main className="min-w-0 flex-1 overflow-hidden p-8">
        {tela === "cadastro" && <TelaCadastro />}
        {tela === "avaliacoes" && <TelaAvaliacoes />}
        {tela === "semaforo" && <TelaSemaforo />}
        {tela === "periodizacao" && <TelaPeriodizacao />}
      </main>
    </div>
  );
}

/* ---- 1 · Cadastro / perfil do aluno (AlunoPerfil.tsx) -------------------- */

const SECOES = ["Básicos", "Objetivo", "Saúde e restrições", "Medicamentos", "Equipamentos", "Notas"];

function TelaCadastro() {
  return (
    <div className="space-y-5">
      {/* cabeçalho */}
      <div className="flex flex-wrap items-center gap-3">
        <span
          className="grid h-10 w-10 place-items-center rounded-full border"
          style={{ background: T.surface, borderColor: T.border, color: T.ink2 }}
        >
          <ChevronLeft className="h-4 w-4" />
        </span>
        <h1 className="font-display text-2xl font-bold" style={{ color: T.ink }}>
          Mariana Alves
        </h1>
        <span className="text-sm" style={{ color: T.ink2 }}>
          Perfil do aluno · <span className="font-semibold" style={{ color: T.ink }}>4 de 6 seções preenchidas</span>
        </span>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold"
          style={{ background: T.successTint, color: T.success }}
        >
          <CheckCheck className="h-3.5 w-3.5" /> Salvo automaticamente
        </span>
        <span className="ml-auto">
          <BotaoEscuro>
            Registrar avaliação <ChevronRight className="h-4 w-4" />
          </BotaoEscuro>
        </span>
      </div>

      {/* trilho das 6 seções */}
      <div className="flex flex-wrap gap-2">
        {SECOES.map((s, i) => {
          const feita = i < 2;
          const ativa = i === 2;
          return (
            <span
              key={s}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border px-4 text-sm"
              style={
                ativa
                  ? { background: T.ink, borderColor: T.ink, color: T.surface, fontWeight: 700 }
                  : feita
                    ? { background: T.successTint, borderColor: "rgba(23,122,76,.4)", color: T.ink, fontWeight: 600 }
                    : { background: T.surface, borderColor: T.border, color: T.ink2 }
              }
            >
              {feita && <Check className="h-4 w-4" style={{ color: T.success }} />}
              {!feita && !ativa && (
                <span
                  className="grid h-5 w-5 place-items-center rounded-full text-2xs font-bold"
                  style={{ background: T.surfaceSoft, color: T.ink2 }}
                >
                  {i + 1}
                </span>
              )}
              {s}
            </span>
          );
        })}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_320px] gap-6">
        {/* coluna esquerda */}
        <div>
          <div className="text-2xs font-bold uppercase tracking-[0.14em]" style={{ color: T.analysis }}>
            Passo 3 de 6
          </div>
          <h2 className="mt-1 font-display text-2xl font-bold" style={{ color: T.ink }}>
            Saúde e restrições
          </h2>
          <p className="mt-1 max-w-[62ch] text-sm leading-relaxed" style={{ color: T.ink2 }}>
            Só o que muda a prescrição. Pode parar quando quiser.
          </p>

          <div className="mt-4 space-y-4">
            {/* condição de saúde */}
            <Card className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display font-bold" style={{ color: T.ink }}>
                    Condição de saúde
                  </h3>
                  <p className="text-sm" style={{ color: T.ink2 }}>
                    Liga o semáforo diário dessa condição.
                  </p>
                </div>
                <span className="text-sm font-semibold underline" style={{ color: T.ink2 }}>
                  Ver as 23
                </span>
              </div>
              <div
                className="mt-3 flex h-12 items-center gap-2 rounded-[12px] border px-3 text-sm"
                style={{ borderColor: T.border, background: T.surface, color: T.ink4 }}
              >
                <Search className="h-4 w-4" />
                Buscar condição (ex.: hipertensão, diabetes...)
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {["Sem condição", "Hipertensão estágio 1", "Obesidade grau I", "Diabetes tipo 2", "Dor lombar inespecífica"].map(
                  (c) => {
                    const ativo = c === "Hipertensão estágio 1";
                    return (
                      <span
                        key={c}
                        className="inline-flex min-h-[44px] items-center rounded-full border px-4 text-sm"
                        style={
                          ativo
                            ? { background: T.primaryTint, borderColor: T.primary, color: T.primary, fontWeight: 700 }
                            : { background: T.surface, borderColor: T.border, color: T.ink2, fontWeight: 500 }
                        }
                      >
                        {ativo ? "✓ " : ""}
                        {c}
                      </span>
                    );
                  },
                )}
              </div>
              <p className="mt-3 text-xs" style={{ color: T.ink2 }}>
                Mais usadas por você. A busca abre a lista completa. Em branco, a avaliação sugere pelo IMC, pressão e
                idade medidos.
              </p>
            </Card>

            {/* restrições físicas */}
            <Card className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold" style={{ color: T.ink }}>
                    Restrições físicas
                  </h3>
                  <Pill tom="warning">2 marcadas</Pill>
                </div>
                <span className="text-sm font-bold" style={{ color: T.primary }}>
                  + Adicionar
                </span>
              </div>
              <p className="text-sm" style={{ color: T.ink2 }}>
                Mudam o que o motor escolhe, a amplitude e o apoio.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["Desconforto lombar", "Ombro direito sensível"].map((r) => (
                  <span
                    key={r}
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold"
                    style={{ background: T.warningTint, borderColor: "rgba(142,96,9,.4)", color: T.ink }}
                  >
                    {r} <span style={{ color: T.ink2 }}>×</span>
                  </span>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* coluna direita: o que isso muda */}
        <aside className="space-y-3">
          <h2 className="text-2xs font-bold uppercase tracking-wider" style={{ color: T.ink2 }}>
            O que isso muda
          </h2>

          <div className="rounded-[18px] border p-4" style={{ background: T.dangerTint, borderColor: "rgba(192,54,31,.3)" }}>
            <div className="flex items-center gap-2 font-display font-bold" style={{ color: T.ink }}>
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: T.danger }} />
              Semáforo diário ligado
            </div>
            <p className="mt-1 text-sm" style={{ color: T.ink2 }}>
              Hipertensão estágio 1: 4 perguntas antes de cada sessão, começando por pressão arterial de repouso medida
              agora.
            </p>
          </div>

          {[
            { fonte: "Hipertensão estágio 1", cor: T.danger, efeitos: ["Sem apneia (Valsalva) nas séries", "Intensidade moderada guiada por esforço"] },
            { fonte: "Desconforto lombar", cor: T.warning, efeitos: ["Exercícios com carga axial entram rebaixados", "Prefere tronco apoiado e cadeia fechada"] },
          ].map((it) => (
            <div key={it.fonte} className="flex gap-3">
              <span className="w-1 shrink-0 rounded-full" style={{ background: it.cor }} />
              <div>
                <div className="text-sm font-bold" style={{ color: T.ink }}>
                  {it.fonte}
                </div>
                <ul className="mt-0.5 space-y-0.5 text-sm" style={{ color: T.ink2 }}>
                  {it.efeitos.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}

          <p className="text-sm" style={{ color: T.ink2 }}>
            O catálogo entra filtrado pelos 5 equipamentos disponíveis.
          </p>

          <div className="rounded-[18px] p-4" style={{ background: T.surfaceSoft }}>
            <div className="text-2xs font-bold uppercase tracking-wider" style={{ color: T.ink2 }}>
              No app do aluno
            </div>
            <ul className="mt-1.5 space-y-1 text-sm" style={{ color: T.ink2 }}>
              <li>O aluno vê o cuidado do dia antes de começar a sessão.</li>
              <li>A zona de frequência cardíaca deixa de guiar a intensidade; entra o esforço percebido.</li>
            </ul>
          </div>

          <div className="flex gap-2 rounded-[18px] p-3 text-xs leading-relaxed" style={{ background: T.analysisTint, color: T.ink2 }}>
            <ShieldCheck className="h-4 w-4 shrink-0" style={{ color: T.analysis }} />
            <span>
              <span className="font-bold uppercase tracking-wide" style={{ color: T.analysis }}>
                Cuidado de segurança
              </span>{" "}
              não é diagnóstico. Apoia a decisão do profissional habilitado e não substitui avaliação de profissional de
              saúde.
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ---- 2 · Avaliações (Avaliacoes.tsx) ------------------------------------- */

function TelaAvaliacoes() {
  const precisam = [
    { n: "Rafael Lima", i: "RL", motivo: "Vencida há 6 dias", cor: T.warning, cta: "Reavaliar" },
    { n: "Carlos Mendes", i: "CM", motivo: "Primeira avaliação pendente", cor: T.warning, cta: "Avaliar" },
  ];
  const ultimas = [
    { n: "Mariana Alves", i: "MA", data: "12 de mai. de 2026", peso: "69 kg", gord: "28,5%", dor: "1/10" },
    { n: "Rafael Lima", i: "RL", data: "28 de abr. de 2026", peso: "93 kg", gord: "27,5%", dor: "3/10" },
  ];
  return (
    <div className="space-y-6">
      <TituloPagina
        eyebrow="Atendimento"
        icone={<BarChart3 className="h-3 w-3" />}
        titulo="Avaliar e reavaliar"
        subtitulo="Acompanhe reavaliações e o histórico de medidas dos seus alunos. Registre novas avaliações no perfil de cada aluno."
      />

      <div className="grid grid-cols-2 gap-4">
        {/* quem precisa agora */}
        <Card className="p-6">
          <div className="mb-3 flex items-center gap-2">
            <span
              className="grid h-8 w-8 place-items-center rounded-[12px]"
              style={{ background: T.warningTint, color: T.warning }}
            >
              <CalendarClock className="h-4 w-4" />
            </span>
            <h2 className="font-display text-lg font-bold" style={{ color: T.ink }}>
              Quem precisa agora
            </h2>
          </div>
          <div className="space-y-2.5">
            {precisam.map((p) => (
              <div
                key={p.n}
                className="flex items-center gap-3 rounded-[18px] border p-3"
                style={{ borderColor: T.border, borderLeft: `4px solid ${p.cor}` }}
              >
                <Avatar iniciais={p.i} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold" style={{ color: T.ink }}>
                    {p.n}
                  </div>
                  <div className="text-xs" style={{ color: T.ink2 }}>
                    {p.motivo}
                  </div>
                </div>
                <BotaoClaro>{p.cta}</BotaoClaro>
              </div>
            ))}
          </div>
        </Card>

        {/* últimas avaliações */}
        <Card className="p-6">
          <div className="mb-3 flex items-center gap-2">
            <span
              className="grid h-8 w-8 place-items-center rounded-[12px]"
              style={{ background: T.analysisTint, color: T.analysis }}
            >
              <Clock className="h-4 w-4" />
            </span>
            <h2 className="font-display text-lg font-bold" style={{ color: T.ink }}>
              Últimas avaliações
            </h2>
          </div>
          <div className="space-y-2.5">
            {ultimas.map((u) => (
              <div key={u.n} className="flex items-center gap-3 rounded-[14px] border p-3" style={{ borderColor: T.border }}>
                <Avatar iniciais={u.i} gradiente={false} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold" style={{ color: T.ink }}>
                    {u.n}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs" style={{ color: T.ink2 }}>
                    <span>{u.data}</span>
                    <TokenRotulado rotulo="Peso" valor={u.peso} />
                    <TokenRotulado rotulo="Gordura" valor={u.gord} />
                    <TokenRotulado rotulo="Dor" valor={u.dor} />
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0" style={{ color: T.ink4 }} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* evolução */}
      <Card className="p-6">
        <div className="mb-3 flex items-center gap-2">
          <span
            className="grid h-8 w-8 place-items-center rounded-[12px]"
            style={{ background: T.primaryTint, color: T.primary }}
          >
            <TrendingDown className="h-4 w-4" />
          </span>
          <h2 className="font-display text-lg font-bold" style={{ color: T.ink }}>
            Evolução dos alunos
          </h2>
        </div>
        <div className="space-y-2.5">
          {[
            { n: "Mariana Alves", i: "MA", sub: "3 avaliações em 60 dias", peso: "−3,0 kg", gord: "−2,5 pp" },
            { n: "Rafael Lima", i: "RL", sub: "2 avaliações em 30 dias", peso: "−2,0 kg", gord: "−1,5 pp" },
          ].map((e) => (
            <div key={e.n} className="flex items-center gap-3 rounded-[14px] border p-3" style={{ borderColor: T.border }}>
              <Avatar iniciais={e.i} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold" style={{ color: T.ink }}>
                  {e.n}
                </div>
                <div className="text-xs" style={{ color: T.ink2 }}>
                  {e.sub}
                </div>
              </div>
              <Pill tom="success">
                <TrendingDown className="h-3 w-3" /> Peso {e.peso}
              </Pill>
              <Pill tom="success">
                <TrendingDown className="h-3 w-3" /> Gordura {e.gord}
              </Pill>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs" style={{ color: T.ink2 }}>
          Delta da primeira à última avaliação registrada. A leitura depende do objetivo: em hipertrofia, ganhar peso
          pode ser o esperado.
        </p>
      </Card>
    </div>
  );
}

function TokenRotulado({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <span
      className="inline-flex items-baseline gap-1 rounded-full px-2 py-0.5 text-xs"
      style={{ background: T.surfaceSoft, color: T.ink2 }}
    >
      <span className="font-medium opacity-70">{rotulo}</span>
      <span className="font-semibold" style={{ color: T.ink }}>
        {valor}
      </span>
    </span>
  );
}

/* ---- 3 · Semáforo (SemaforoLiberacao) ----------------------------------- */

const PERGUNTAS = [
  {
    q: "Sinais de mal-estar agora: febre, tontura, dor no peito, palpitação ou falta de ar em repouso?",
    porque:
      "Sintomas sistêmicos em repouso deixam de ser caso de treino e passam a ser caso de avaliação médica.",
    ref: "[Warburton (2011); ACSM (2021)]",
    opcoes: [
      { t: "Sim", cor: "danger" as const },
      { t: "Não", cor: "success" as const },
    ],
    marcada: "Não",
  },
  {
    q: "Alguma dor nova ou desconforto incomum desde a última sessão?",
    porque: "Dor nova muda a sessão do dia: melhor adaptar cedo do que insistir no padrão que provoca.",
    ref: "",
    opcoes: [
      { t: "Sim", cor: "warning" as const },
      { t: "Não", cor: "success" as const },
    ],
    marcada: "Sim",
  },
  {
    q: "Noite de sono muito ruim, cansaço fora do comum ou dores musculares intensas da sessão anterior?",
    porque: "Recuperação incompleta reduz a qualidade do estímulo e aumenta o risco de erro técnico.",
    ref: "[Foster (2001)]",
    opcoes: [
      { t: "Sim", cor: "warning" as const },
      { t: "Não", cor: "success" as const },
    ],
    marcada: "Não",
  },
  {
    q: "Começou medicação nova ou mudou dose nos últimos dias?",
    porque: "Alguns medicamentos alteram frequência cardíaca, pressão e disposição; a resposta ao esforço muda.",
    ref: "[ACSM (2021)]",
    opcoes: [
      { t: "Sim", cor: "warning" as const },
      { t: "Não", cor: "success" as const },
    ],
    marcada: "Não",
  },
];

function TelaSemaforo() {
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      {/* cabeçalho do aluno + abas do perfil (AlunoDetail) */}
      <div className="flex items-center gap-3">
        <span
          className="grid h-10 w-10 place-items-center rounded-full border"
          style={{ background: T.surface, borderColor: T.border, color: T.ink2 }}
        >
          <ChevronLeft className="h-4 w-4" />
        </span>
        <Avatar iniciais="MA" />
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: T.ink }}>
            Mariana Alves
          </h1>
        </div>
        <span className="ml-auto flex items-center gap-2">
          <Pill tom="analysis">Hipertensão estágio 1</Pill>
          <span
            className="rounded-full px-3 py-1.5 text-sm font-bold"
            style={{ background: T.warningTint, color: T.warning }}
          >
            3 para liberar
          </span>
        </span>
      </div>
      <div className="flex gap-5 border-b" style={{ borderColor: T.border }}>
        {["Visão", "Avaliações", "Treino", "Semáforo", "Cobrança"].map((a) => {
          const ativa = a === "Semáforo";
          return (
            <span
              key={a}
              className="-mb-px flex items-center gap-1.5 border-b-2 px-1 py-2.5 text-sm font-semibold"
              style={ativa ? { borderColor: T.ink, color: T.ink } : { borderColor: "transparent", color: T.ink2 }}
            >
              {ativa && <TrafficCone className="h-4 w-4" />}
              {a}
            </span>
          );
        })}
      </div>

      <Card className="p-6">
        {/* selo RCD */}
        <span
          className="mb-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold"
          style={{ background: T.analysisTint, borderColor: "rgba(12,107,112,.3)", color: T.analysis }}
        >
          <ShieldCheck className="h-3.5 w-3.5" /> Motor RCD
        </span>

        <div className="space-y-3">
          {PERGUNTAS.map((p, i) => (
            <div key={p.q}>
              <div className="mb-0.5 flex gap-2 text-sm font-semibold" style={{ color: T.ink }}>
                <span
                  className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-2xs font-bold"
                  style={{ background: T.primaryTint, color: T.primary }}
                >
                  {i + 1}
                </span>
                {p.q}
              </div>
              <p className="mb-1.5 pl-7 text-xs" style={{ color: T.ink2 }}>
                {p.porque} {p.ref && <span style={{ opacity: 0.8 }}>{p.ref}</span>}
              </p>
              <div className="flex flex-wrap gap-1.5 pl-7">
                {p.opcoes.map((o) => {
                  const sel = o.t === p.marcada;
                  const c = TOM[o.cor];
                  return (
                    <span
                      key={o.t}
                      className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2.5 text-sm"
                      style={
                        sel
                          ? { background: c.bg, borderColor: c.fg + "66", color: c.fg, fontWeight: 600 }
                          : { background: T.surface, borderColor: T.border, color: T.ink2, fontWeight: 500 }
                      }
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: sel ? (o.cor === "danger" ? T.dangerFill : c.fg) : "rgba(154,161,172,.4)" }}
                      />
                      {o.t}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* resultado */}
        <div
          className="mt-4 rounded-[14px] border p-4"
          style={{ background: T.warningTint, borderColor: "rgba(142,96,9,.4)" }}
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-6 w-6 shrink-0" style={{ color: T.warning }} />
            <div>
              <div className="font-display text-lg font-bold" style={{ color: T.warning }}>
                Liberado com ajuste
              </div>
              <p className="text-xs" style={{ color: T.ink2 }}>
                A sessão pode acontecer COM os ajustes abaixo; registre o racional.
              </p>
            </div>
          </div>
          <ul className="mt-3 space-y-1.5 border-t pt-3" style={{ borderColor: "rgba(0,0,0,.05)" }}>
            <li className="flex gap-2 text-sm" style={{ color: T.ink }}>
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: T.warning }} />
              <span>
                <span className="font-semibold">
                  Evite os padrões que provocam a dor, reduza amplitude e carga na região e reavalie ao fim da sessão.
                </span>{" "}
                <span className="text-xs" style={{ color: T.ink2 }}>
                  (Alguma dor nova ou desconforto incomum desde a última sessão?)
                </span>
              </span>
            </li>
          </ul>
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3" style={{ borderColor: "rgba(0,0,0,.05)" }}>
            <BotaoEscuro>
              <Save className="h-4 w-4" /> Registrar liberação
            </BotaoEscuro>
            <span className="text-xs" style={{ color: T.ink2 }}>
              Registre para guardar no histórico e seguir.
            </span>
          </div>
        </div>

      </Card>
    </div>
  );
}

/* ---- 4 · Periodização (PrescreverTreino / GraficoProgressao) ------------- */

const FASES = [
  { nome: "Acúmulo", ini: 0, fim: 4 },
  { nome: "Intensificação", ini: 4, fim: 8 },
  { nome: "Realização", ini: 8, fim: 12 },
];
const VOLUME = [0.55, 0.68, 0.8, 0.42, 0.62, 0.72, 0.84, 0.45, 0.58, 0.66, 0.74, 0.4];
const INTENS = [0.3, 0.36, 0.42, 0.28, 0.46, 0.54, 0.6, 0.4, 0.62, 0.7, 0.78, 0.5];
const COMPLEX = [0.25, 0.3, 0.34, 0.3, 0.4, 0.44, 0.48, 0.44, 0.52, 0.56, 0.6, 0.56];
const DESCARGA = [3, 7, 11];

function TelaPeriodizacao() {
  return (
    <div className="space-y-5">
      {/* cabeçalho do plano */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-3xl font-bold" style={{ color: T.ink }}>
              Hipertrofia · 12 semanas
            </h2>
            <Pill tom="success">Salvo</Pill>
            <Pill tom="analysis">Hipertensão estágio 1</Pill>
          </div>
          <div className="mt-0.5 text-sm" style={{ color: T.ink2 }}>
            Periodização linear · <span className="underline">trocar modelo</span> ·{" "}
            <span className="underline">editar contexto</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <BotaoClaro>
            <FileDown className="h-4 w-4" /> Exportar PDF
          </BotaoClaro>
          <span
            className="inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-white"
            style={{ background: `linear-gradient(120deg, ${T.primary}, ${T.analysisFill})` }}
          >
            <Save className="h-4 w-4" /> Publicar no app de Mariana
          </span>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_320px] gap-5">
        <div className="space-y-5">
          {/* gráfico */}
          <Card className="p-4">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" style={{ color: T.ink2 }} />
              <h3 className="font-display text-base font-bold" style={{ color: T.ink }}>
                Progressão ao longo das semanas
              </h3>
            </div>
            <p className="mb-3 text-xs" style={{ color: T.ink2 }}>
              Volume, intensidade e complexidade relativos, calculados das sessões (sem unidade absoluta). Editar uma
              sessão move a curva. As faixas ao pé mostram cada fase e quantas semanas ela dura.
            </p>
            <GraficoProgressao />
            <div className="mt-2 flex flex-wrap gap-3 text-xs" style={{ color: T.ink2 }}>
              {[
                ["Volume", T.primary],
                ["Intensidade", "#8E6009"],
                ["Complexidade", T.analysis],
              ].map(([l, c]) => (
                <span key={l} className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
                  {l}
                </span>
              ))}
            </div>
          </Card>

          {/* régua de semanas */}
          <Card className="p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-2xs font-semibold uppercase tracking-wide" style={{ color: T.ink2 }}>
                Semanas do plano
              </span>
              <span className="text-xs" style={{ color: T.ink2 }}>
                Clique numa semana para editar. Âmbar = descarga, anel = semana de hoje.
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: 12 }, (_, i) => {
                const foco = i === 4;
                const desc = DESCARGA.includes(i);
                return (
                  <span
                    key={i}
                    className="grid h-9 w-9 place-items-center rounded-full border text-sm font-semibold"
                    style={
                      foco
                        ? { background: T.ink, borderColor: T.ink, color: T.surface, boxShadow: `0 0 0 2px ${T.primary}` }
                        : desc
                          ? { background: T.warningTint, borderColor: "rgba(142,96,9,.4)", color: T.warning }
                          : { background: T.surface, borderColor: T.border, color: T.ink2 }
                    }
                  >
                    {i + 1}
                  </span>
                );
              })}
            </div>
          </Card>

        </div>

        {/* trilho do plano */}
        <aside className="space-y-4">
          <Card className="p-4">
            <div className="mb-3 flex gap-1">
              {["Resumo", "Na prática", "Ciência"].map((a, i) => (
                <span
                  key={a}
                  className="rounded-full px-3 py-1.5 text-xs font-semibold"
                  style={i === 0 ? { background: T.ink, color: T.surface } : { color: T.ink2 }}
                >
                  {a}
                </span>
              ))}
            </div>
            <div className="space-y-3">
              {[
                {
                  t: "6-12 repetições, 67-85% 1RM",
                  d: "A faixa de hipertrofia para nível intermediário. O alvo de cada semana sai de dentro dela, nunca fora.",
                  c: T.analysis,
                },
                {
                  t: "Periodização linear",
                  d: "Progressão gradual de mais volume e menos intensidade para menos volume e mais intensidade ao longo de blocos.",
                  c: T.primary,
                },
                {
                  t: "Restrição de Mariana",
                  d: "Desconforto lombar. Os exercícios incompatíveis ficam fora do plano; os limítrofes entram rebaixados.",
                  c: T.warning,
                },
              ].map((it) => (
                <div key={it.t} className="border-l-2 pl-3" style={{ borderColor: it.c }}>
                  <div className="text-sm font-semibold" style={{ color: T.ink }}>
                    {it.t}
                  </div>
                  <p className="text-sm" style={{ color: T.ink2 }}>
                    {it.d}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-2xs font-semibold uppercase tracking-wide" style={{ color: T.ink2 }}>
              Equilíbrio da semana
            </h3>
            <div className="mt-2 space-y-2">
              {[
                ["Inferiores", 46],
                ["Superiores", 38],
                ["Core", 16],
              ].map(([r, p]) => (
                <div key={r as string}>
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: T.ink2 }}>{r}</span>
                    <span className="font-semibold" style={{ color: T.ink }}>
                      {p}%
                    </span>
                  </div>
                  <span className="mt-1 block h-1.5 w-full rounded-full" style={{ background: T.surfaceMute }}>
                    <span
                      className="block h-full rounded-full"
                      style={{ width: `${p}%`, background: T.primary }}
                    />
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-2xs leading-snug" style={{ color: T.ink2 }}>
              Percentual sobre as 24 séries de força da semana. O aeróbio entra em minutos, fora desta conta: 60 min.
            </p>
          </Card>

        </aside>
      </div>
    </div>
  );
}

/** SVG do gráfico de progressão: 3 séries, faixas de fase e régua de semanas. */
function GraficoProgressao() {
  const W = 836;
  const H = 200;
  const L = 28;
  const R = 8;
  const TOPO = 24;
  const BASE = 150;
  const passo = (W - L - R) / 12;
  const px = (i: number) => L + (i + 0.5) * passo;
  const py = (v: number) => BASE - v * (BASE - TOPO);

  const suave = (vals: number[]) => {
    const pts = vals.map((v, i) => [px(i), py(v)] as const);
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[i + 1];
      const mx = (x1 + x2) / 2;
      d += ` C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
    }
    return d;
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-56 w-full" role="img" aria-label="Gráfico de progressão do plano">
      <defs>
        <linearGradient id="mk-vol" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={T.primary} stopOpacity="0.16" />
          <stop offset="100%" stopColor={T.primary} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* faixas de fase */}
      {FASES.map((f, i) => {
        const x1 = L + f.ini * passo;
        const x2 = L + f.fim * passo;
        return (
          <g key={f.nome}>
            {i % 2 === 0 && (
              <rect x={x1} y={TOPO - 16} width={x2 - x1} height={BASE - TOPO + 16} fill={T.surfaceSoft} opacity={0.5} />
            )}
            {i > 0 && <line x1={x1} y1={TOPO - 16} x2={x1} y2={BASE} stroke={T.border} strokeWidth={1} />}
            <text x={x1 + 8} y={10} fontSize={10} fontWeight={700} fill={T.ink}>
              {f.nome}
            </text>
            <text x={x1 + 8} y={BASE + 14} fontSize={10} fill={T.ink2}>
              sem {f.ini + 1}–{f.fim} · descarga
            </text>
          </g>
        );
      })}

      {/* eixo Y qualitativo */}
      <text x={4} y={TOPO + 4} fontSize={9} fill={T.ink4}>
        maior
      </text>
      <text x={4} y={BASE} fontSize={9} fill={T.ink4}>
        menor
      </text>

      {/* semanas de descarga */}
      {DESCARGA.map((d) => (
        <rect key={d} x={L + d * passo} y={TOPO - 16} width={passo} height={BASE - TOPO + 16} fill={T.warning} opacity={0.07} />
      ))}

      {/* área do volume */}
      <path d={`${suave(VOLUME)} L ${px(11)} ${BASE} L ${px(0)} ${BASE} Z`} fill="url(#mk-vol)" />

      {/* curvas */}
      <path d={suave(COMPLEX)} fill="none" stroke={T.analysis} strokeWidth={2.5} strokeLinecap="round" />
      <path d={suave(INTENS)} fill="none" stroke="#8E6009" strokeWidth={2.5} strokeLinecap="round" />
      <path d={suave(VOLUME)} fill="none" stroke={T.primary} strokeWidth={2.5} strokeLinecap="round" />

      {/* régua de semanas */}
      {Array.from({ length: 12 }, (_, i) => (
        <g key={i}>
          <line
            x1={px(i)}
            y1={BASE + 22}
            x2={px(i)}
            y2={BASE + 30}
            stroke={DESCARGA.includes(i) ? T.warning : T.primary}
            strokeWidth={DESCARGA.includes(i) ? 2.5 : 1.5}
            strokeLinecap="round"
          />
          <text x={px(i)} y={BASE + 44} fontSize={9} fill={T.ink4} textAnchor="middle">
            S{i + 1}
          </text>
        </g>
      ))}
    </svg>
  );
}
