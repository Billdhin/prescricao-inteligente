import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowDown,
  Check,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  AlertTriangle,
  GraduationCap,
  Dumbbell,
  UserCheck,
  FileDown,
  HeartPulse,
  FlaskConical,
  BookOpen,
  Users,
  GitCompare,
  Navigation,
  Info,
  ChevronDown,
} from "lucide-react";
import * as React from "react";
import { Logo } from "@/components/brand/Logo";
import { Card, Pill, buttonClasses } from "@/components/ui/primitives";
import { SeloRCD } from "@/components/rcd/SeloRCD";
import { TutorialScene } from "@/components/tutorial/TutorialScene";
import { muscleRegions } from "@/data/muscle-regions";
import { analysisOverlays } from "@/data/analysis-overlays";
import { getExercise } from "@/data/exercises";
import { withBase } from "@/lib/utils";

// Slider carregado sob demanda (abaixo do primeiro paint): o LCP da landing
// continua sendo texto do hero, e o processamento de máscara do canvas não
// entra no caminho crítico.
const BiomechanicsComparisonSlider = React.lazy(() =>
  import("@/components/movement-lab/BiomechanicsComparisonSlider").then((m) => ({
    default: m.BiomechanicsComparisonSlider,
  })),
);

/* ---------------------------------- base --------------------------------- */

function Section({ id, className = "", children }: { id?: string; className?: string; children: React.ReactNode }) {
  return (
    <section id={id} className={`mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20 ${className}`}>
      {children}
    </section>
  );
}

/* Kicker editorial: filete + versalete espaçado (etiqueta de prancha científica),
   no lugar do pill-bolha genérico. */
function Kicker({ children, tone = "primary" }: { children: React.ReactNode; tone?: "primary" | "analysis" | "cta" }) {
  const text =
    tone === "analysis" ? "text-analysis" : tone === "cta" ? "text-[color:var(--cta-text)]" : "text-primary";
  const rule = tone === "analysis" ? "bg-analysis/50" : tone === "cta" ? "bg-cta/50" : "bg-primary/50";
  return (
    <span className={`mb-3 inline-flex items-center gap-2.5 text-2xs font-bold uppercase tracking-[0.18em] ${text}`}>
      <span aria-hidden className={`h-px w-7 ${rule}`} />
      {children}
      <span aria-hidden className={`h-px w-7 ${rule}`} />
    </span>
  );
}

/* --------------------------------- página -------------------------------- */

export function Landing() {
  return (
    <div className="min-h-screen bg-bg">
      {/* ------------------------------- Header ------------------------------ */}
      <header className="sticky top-0 z-30 border-b border-border bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          <Logo />
          <nav aria-label="Seções da página" className="hidden items-center gap-6 text-sm font-medium text-ink-2 md:flex">
            <a href="#como-funciona" className="hover:text-ink">Como funciona</a>
            <a href="#recursos" className="hover:text-ink">Recursos</a>
            <a href="#planos" className="hover:text-ink">Planos</a>
            <a href="#faq" className="hover:text-ink">Dúvidas</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="hidden text-sm font-medium text-ink-2 hover:text-ink sm:block">
              Entrar
            </Link>
            <Link to="/dashboard" className={buttonClasses("primary", "sm")}>
              Começar agora
            </Link>
          </div>
        </div>
      </header>

      {/* -------------------------------- Hero ------------------------------- */}
      <Section className="!pb-10 !pt-10 md:!pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Kicker tone="analysis">Para profissionais de Educação Física</Kicker>
            <h1 className="font-display text-4xl font-extrabold leading-[1.08] text-ink md:text-[3.05rem]">
              Aluno com hipertensão, diabetes ou dor lombar? Monte um treino{" "}
              <span className="relative inline-block whitespace-nowrap text-primary">
                seguro,
                <svg
                  aria-hidden
                  className="absolute -bottom-2 left-0 h-2.5 w-full"
                  viewBox="0 0 120 10"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2 7 C 28 10.5, 62 2.5, 118 6.5"
                    fill="none"
                    stroke="var(--cta)"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{" "}
              com o porquê documentado.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-ink-2">
              Para alunos com hipertensão, diabetes, obesidade, dor lombar ou idade avançada: veja o
              treino recomendado, o porquê de cada exercício e as cautelas de segurança no mesmo
              lugar. A decisão é sempre sua; a plataforma organiza e documenta o raciocínio.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/dashboard" className={buttonClasses("primary")}>
                Resolver meu primeiro caso <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/casos-rcd" className={buttonClasses("secondary")}>
                Ver um caso decidido <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-ink-2">
              {["Acesso completo", "Sem versão limitada", "Feito por doutor em Educação Física"].map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-success" /> {t}
                </li>
              ))}
            </ul>
          </div>

          {/* O fosso à vista: a decisão documentada (não a commodity biomecânica) */}
          <DecisaoDemoCard />
        </div>
      </Section>

      {/* --------------------------- Faixa da dor ---------------------------- */}
      <div className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-[1.2fr_1fr] md:items-center md:px-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">
              Treino para aluno saudável, todo mundo monta. A conta aperta quando ele chega com{" "}
              <span className="text-[color:var(--cta-text)]">pressão alta, diabetes, uma hérnia ou 68 anos</span>.
            </h2>
            <p className="mt-2 max-w-xl text-ink-2">
              Aí a decisão é sua, e precisa ser segura e defensável. A plataforma pensa junto e deixa
              o porquê documentado, do jeito que você pode mostrar e guardar.
            </p>
          </div>
          <div className="space-y-2">
            {["“Pode treinar pesado com a pressão descontrolada?”", "“Esse exercício é seguro para a hérnia dele?”", "“Se acontecer algo, como eu me explico?”"].map((q) => (
              <div key={q} className="flex items-center gap-3 rounded-xl border border-border bg-bg px-4 py-2.5 text-sm text-ink">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-tint text-xs font-bold text-primary">?</span>
                {q}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ----- Prova visual (posição 2): foto real × análise, o "uau" -------- */}
      <Section className="!py-12">
        <div className="mx-auto max-w-4xl text-center">
          <Kicker tone="analysis">Execução × análise</Kicker>
          <h2 className="font-display text-3xl font-bold text-ink md:text-4xl">
            Entenda o movimento por dentro.
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-ink-2">
            Arraste o divisor e revele a análise biomecânica sobre a foto real de execução: músculos
            ativados, ângulos e linha de força.
          </p>
        </div>
        <div className="mx-auto mt-8 max-w-4xl">
          <Card variant="raised" className="p-3">
            <React.Suspense
              fallback={<div className="aspect-[4/3] w-full animate-pulse rounded-card bg-surface-soft" />}
            >
              <BiomechanicsComparisonSlider
                baseSrc={withBase("/exercises/leg-press-45.webp")}
                analysisSrc={withBase("/exercises/leg-press-45-analysis.webp")}
                alt="Leg press 45°, execução real"
                regions={muscleRegions["leg-press-45"] ?? []}
                ativacao={getExercise("leg-press-45")?.ativacao ?? []}
                overlay={analysisOverlays["leg-press-45"]}
              />
            </React.Suspense>
            <p className="px-2 py-2 text-center text-xs text-ink-3">
              Arraste: execução real e análise na mesma imagem.
            </p>
          </Card>
        </div>
      </Section>

      {/* --------------------------- Como funciona --------------------------- */}
      <Section id="como-funciona" className="text-center">
        <Kicker>Simples assim</Kicker>
        <h2 className="font-display text-3xl font-bold text-ink md:text-4xl">Três passos. Só isso.</h2>
        <p className="mx-auto mt-2 max-w-2xl text-ink-2">
          Sem planilhas, sem adivinhação. Um caminho guiado do perfil do aluno até a entrega.
        </p>

        <div className="relative mt-10 grid gap-6 md:grid-cols-3">
          {/* linha conectora (desktop) */}
          <div aria-hidden className="absolute left-[16.6%] right-[16.6%] top-6 hidden border-t-2 border-dashed border-border md:block" />
          {[
            {
              n: 1,
              t: "Diga a condição do aluno",
              d: "Escolha a condição (hipertensão, diabetes, dor lombar e mais), o objetivo e o nível. Leva menos de um minuto.",
              scene: "wizard" as const,
            },
            {
              n: 2,
              t: "Receba o treino, com o porquê",
              d: "Exercícios ranqueados por critério, com as cautelas de segurança da condição já embutidas. Toque em “Ver justificativa” e entenda cada escolha.",
              scene: "recomendacao" as const,
            },
            {
              n: 3,
              t: "Documente a decisão",
              d: "O raciocínio vira um registro com referências, o seu nome e o seu CREF. No Profissional, você ainda exporta em PDF com a sua marca.",
              scene: "pdf" as const,
            },
          ].map((s) => (
            <div key={s.n} className="relative">
              <span className="relative z-10 mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full gradient-brand font-display text-lg font-bold text-white shadow-elevated">
                {s.n}
              </span>
              <Card className="p-5 text-left">
                <div className="mb-3 overflow-hidden rounded-xl border border-border bg-surface-soft p-2">
                  <TutorialScene id={s.scene} label={`Passo ${s.n}: ${s.t}`} />
                </div>
                <h3 className="font-display text-lg font-bold text-ink">{s.t}</h3>
                <p className="mt-1 text-sm text-ink-2">{s.d}</p>
              </Card>
            </div>
          ))}
        </div>

        <Link to="/dashboard" className={buttonClasses("primary") + " mt-10"}>
          Dar o primeiro passo <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="mt-3 text-xs text-ink-3">
          Prefere ver antes? <Link to="/tutorial" className="font-semibold text-primary hover:underline">Abra os tutoriais visuais</Link>.
        </p>
      </Section>

      {/* -------------------- O mecanismo: Motor RCD ------------------------- */}
      <div className="border-y border-border bg-surface">
        <Section id="rcd" className="!py-14">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <div className="mb-3">
                <SeloRCD />
              </div>
              <h2 className="font-display text-3xl font-bold text-ink">
                Não é um gerador de treino. É{" "}
                <span className="text-primary">Raciocínio Clínico Documentado</span>.
              </h2>
              <p className="mt-3 text-ink-2">
                O Motor RCD acompanha a decisão inteira, do sinal verde para treinar hoje ao
                documento que você pode assinar. Em três atos:
              </p>
              <ol className="mt-5 space-y-3">
                {[
                  {
                    t: "Semáforo de Liberação",
                    d: "30 segundos antes da sessão: liberado, liberado com ajuste ou não liberado hoje, com o porquê.",
                  },
                  {
                    t: "Decisão justificada",
                    d: "Exercícios ranqueados critério a critério, inclusive o que foi DESCARTADO, e por quê.",
                  },
                  {
                    t: "Prontuário assinável",
                    d: "O raciocínio vira um documento com referências numeradas, seu nome e seu CREF. Sua defesa técnica.",
                  },
                ].map((p, i) => (
                  <li key={p.t} className="flex gap-3">
                    <span className="tabular grid h-7 w-7 shrink-0 place-items-center rounded-full bg-analysis text-sm font-bold text-on-analysis">
                      {i + 1}
                    </span>
                    <span>
                      <span className="font-display font-bold text-ink">{p.t}</span>
                      <span className="block text-sm text-ink-2">{p.d}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <JustifyMock />
          </div>

          {/* ChatGPT × RCD — o hábito real do público, endereçado de frente */}
          <div className="mx-auto mt-12 max-w-3xl">
            <h3 className="text-center font-display text-xl font-bold text-ink">
              “Mas eu já uso o ChatGPT pra montar treino…”
            </h3>
            <p className="mx-auto mt-1 max-w-xl text-center text-sm text-ink-2">
              Ótimo para rascunhar. Mas quando o aluno chega com uma condição de saúde, a diferença aparece:
            </p>
            <p className="mx-auto mt-3 max-w-xl text-center font-display text-xl font-bold text-ink">
              O ChatGPT não assina embaixo. Você sim.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Card variant="soft" className="p-5">
                <div className="mb-2 text-sm font-bold uppercase tracking-wider text-ink-3">IA genérica</div>
                <ul className="space-y-2 text-sm text-ink-2">
                  <li>Entrega um treino, sem rastro do porquê</li>
                  <li>Não checa se o aluno pode treinar HOJE</li>
                  <li>Não cita a base científica de cada escolha</li>
                  <li>Não gera registro que você assine embaixo</li>
                </ul>
              </Card>
              <Card className="border-analysis/40 p-5">
                <div className="mb-2"><SeloRCD compacto /></div>
                <ul className="space-y-2 text-sm text-ink">
                  {[
                    "Escolhidos E descartados, com o porquê de cada um",
                    "Semáforo pré-sessão específico por condição",
                    "Referências numeradas em cada decisão",
                    "Prontuário em PDF com seu nome e CREF",
                  ].map((t) => (
                    <li key={t} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      {t}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
            <p className="mt-4 text-center text-xs text-ink-3">
              Em ambos os casos, quem decide é o profissional habilitado (CREF). A diferença é o
              que sobra documentado depois da decisão.
            </p>
          </div>
        </Section>
      </div>

      {/* -------------------- Vale escuro: o Semáforo em cores ---------------- */}
      {/* Único respiro escuro da página: um beat de contraste que encena o gesto
          mais distintivo do produto (o sinal verde/amarelo/vermelho antes de treinar).
          Não é dark mode nem repintura: é uma seção-assinatura. Cores e rótulos são
          os reais do Semáforo de Liberação; a decisão continua sendo do profissional. */}
      <div className="relative overflow-hidden bg-primary text-on-primary">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_75%_at_50%_-10%,rgba(255,255,255,0.09),transparent_60%)]"
        />
        <Section className="relative">
          <div className="mx-auto max-w-2xl text-center">
            <span className="mb-3 inline-flex items-center gap-2.5 text-2xs font-bold uppercase tracking-[0.18em] text-[#8fd3dd]">
              <span aria-hidden className="h-px w-7 bg-[#8fd3dd]/60" />
              Segurança em 30 segundos
            </span>
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              Antes da sessão, o sinal verde. Ou o motivo para esperar.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-primary-tint">
              O <span className="font-semibold text-white">Semáforo de Liberação</span> lê a condição do aluno e
              responde em 30 segundos, com o porquê e a referência de cada resposta.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-3xl items-center gap-8 md:grid-cols-[auto_1fr]">
            {/* Farol: as três luzes acesas, lidas como legenda dos desfechos possíveis */}
            <div
              aria-hidden
              className="mx-auto flex w-fit flex-col gap-3.5 rounded-[30px] border border-white/10 bg-[#0f2e3d] p-4 shadow-xl"
            >
              {[
                { c: "#22c55e", g: "rgba(34,197,94,0.45)" },
                { c: "#f59e0b", g: "rgba(245,158,11,0.45)" },
                { c: "#ef4444", g: "rgba(239,68,68,0.45)" },
              ].map((l) => (
                <span
                  key={l.c}
                  className="h-14 w-14 rounded-full"
                  style={{ backgroundColor: l.c, boxShadow: `0 0 22px 3px ${l.g}` }}
                />
              ))}
            </div>

            {/* Legenda: rótulo real de cada estado + o que ele significa na prática */}
            <ul className="space-y-5">
              {[
                {
                  icon: <CheckCircle2 className="h-5 w-5" style={{ color: "#4ade80" }} />,
                  rotulo: "Liberado",
                  cor: "#86efac",
                  d: "Nenhum sinal de alerta nos itens do dia. Siga para a sessão.",
                },
                {
                  icon: <AlertTriangle className="h-5 w-5" style={{ color: "#fbbf24" }} />,
                  rotulo: "Liberado com ajuste",
                  cor: "#fcd34d",
                  d: "A sessão acontece com os ajustes indicados. O racional fica registrado.",
                },
                {
                  icon: <XCircle className="h-5 w-5" style={{ color: "#f87171" }} />,
                  rotulo: "Não liberado hoje",
                  cor: "#fca5a5",
                  d: "Os sinais pedem reavaliação antes de treinar; se persistirem, encaminhe.",
                },
              ].map((s) => (
                <li key={s.rotulo} className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0">{s.icon}</span>
                  <div>
                    <div className="font-display text-lg font-bold" style={{ color: s.cor }}>
                      {s.rotulo}
                    </div>
                    <p className="mt-0.5 text-sm text-primary-tint">{s.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="mx-auto mt-8 max-w-xl text-center text-xs text-primary-tint/75">
            Quem libera, ajusta ou adia é sempre o profissional habilitado. O Semáforo documenta o racional dessa
            decisão e ele entra no prontuário.
          </p>
        </Section>
      </div>

      {/* -------------------- Casos documentados + ROI ------------------------ */}
      <Section className="!py-14 text-center">
        <Kicker tone="analysis">Prova, não promessa</Kicker>
        <h2 className="font-display text-3xl font-bold text-ink">Veja o motor decidir um caso real, agora.</h2>
        <p className="mx-auto mt-2 max-w-2xl text-ink-2">
          Sem cadastro: escolha um caso típico (hipertenso, dor lombar em idoso, obesidade grave…)
          e veja o Motor RCD rodar ao vivo: escolhas, descartes e referências.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link to="/casos-rcd" className={buttonClasses("primary")}>
            Abrir casos documentados <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/roi" className={buttonClasses("outline")}>
            Quanto vale sua especialização? (calculadora)
          </Link>
        </div>
      </Section>

      {/* ------------------------------ Recursos ----------------------------- */}
      <Section id="recursos" className="text-center">
        <Kicker>Tudo no mesmo lugar</Kicker>
        <h2 className="font-display text-3xl font-bold text-ink">O consultório e a sala de aula, juntos.</h2>
        <p className="mx-auto mt-2 max-w-2xl text-ink-2">
          Modo <span className="font-semibold text-ink">Atender</span> para o dia a dia com alunos; modo{" "}
          <span className="font-semibold text-ink">Aprender</span> para treinar sua decisão. Você alterna quando quiser.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: <Navigation className="h-5 w-5" />, t: "Prescrever com raciocínio", d: "Exercícios ranqueados + justificativa por critério, em 3 passos." },
            { icon: <FileDown className="h-5 w-5" />, t: "PDF com a sua marca", d: "A prescrição vira um documento profissional para entregar ao aluno." },
            { icon: <Users className="h-5 w-5" />, t: "Alunos e evolução", d: "Avaliações na linha do tempo, gráfico de evolução e reavaliações em dia." },
            { icon: <HeartPulse className="h-5 w-5" />, t: "Grupos especiais", d: "Jornadas em 4 fases para obesidade, hipertensão, idosos, dor e mais." },
            { icon: <FlaskConical className="h-5 w-5" />, t: "Laboratório Visual", d: "Foto real × análise biomecânica no divisor interativo, com hotspots." },
            { icon: <BookOpen className="h-5 w-5" />, t: "Casos práticos", d: "Cenários reais com feedback do raciocínio, não só certo ou errado." },
          ].map((f) => (
            <Card key={f.t} className="p-5 text-left">
              <span className="mb-3 inline-grid h-11 w-11 place-items-center rounded-xl bg-primary-tint text-primary">
                {f.icon}
              </span>
              <h3 className="font-display text-lg font-bold text-ink">{f.t}</h3>
              <p className="mt-1 text-sm text-ink-2">{f.d}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* ------------------------------ Para quem ---------------------------- */}
      <div className="border-y border-border bg-surface">
        <Section className="!py-14 text-center">
          <Kicker tone="analysis">Para quem é</Kicker>
          <h2 className="font-display text-3xl font-bold text-ink">Feito para quem leva o movimento a sério.</h2>
          <div className="mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-3">
            {[
              {
                icon: <GraduationCap className="h-6 w-6" />,
                t: "Estudante de EF",
                d: "Treine a decisão com casos e trilhas; chegue no estágio sabendo o porquê.",
              },
              {
                icon: <UserCheck className="h-6 w-6" />,
                t: "Personal recém-formado",
                d: "Prescreva com segurança desde o primeiro aluno e mostre profissionalismo no PDF.",
              },
              {
                icon: <Dumbbell className="h-6 w-6" />,
                t: "Professor de musculação",
                d: "Conduza perfis diferentes (do iniciante ao grupo especial) com critério e progressão.",
              },
            ].map((p) => (
              <Card key={p.t} className="p-6 text-left">
                <span className="mb-3 inline-grid h-12 w-12 place-items-center rounded-xl bg-primary-tint text-primary">
                  {p.icon}
                </span>
                <h3 className="font-display text-lg font-bold text-ink">{p.t}</h3>
                <p className="mt-1 text-sm text-ink-2">{p.d}</p>
              </Card>
            ))}
          </div>
        </Section>
      </div>

      {/* ------------------------------- Planos ------------------------------ */}
      <Section id="planos" className="text-center">
        <Kicker>Plano</Kicker>
        <h2 className="font-display text-3xl font-bold text-ink">Um plano, tudo liberado.</h2>
        <p className="mx-auto mt-2 max-w-xl text-ink-2">
          O Motor RCD completo, sem versão limitada: todos os grupos, casos e ferramentas em um só lugar.
        </p>
        <div className="mx-auto mt-8 max-w-md">
          <PlanCard
            destaque
            nome="Profissional"
            preco="R$ 59"
            desc="O Motor RCD completo: decisão documentada e assinável."
            items={[
              "Prontuário de Decisão exportável e assinável",
              "Semáforo de Liberação para todos os grupos",
              "Prescrições e alunos ilimitados",
              "Laboratório, casos, comparador e trilhas completos",
              "Portal do aluno com a sua marca, avaliação postural e gamificação",
            ]}
            cta="Começar agora"
          />
        </div>
      </Section>

      {/* --------------------------------- FAQ ------------------------------- */}
      <div className="border-y border-border bg-surface">
        <Section id="faq" className="!py-14">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <Kicker tone="analysis">Dúvidas rápidas</Kicker>
              <h2 className="font-display text-3xl font-bold text-ink">Perguntas frequentes</h2>
            </div>
            <div className="mt-8 space-y-2">
              {[
                {
                  q: "Isso substitui minha avaliação profissional?",
                  a: "Não, e nem deveria. Todo o conteúdo é educacional e de apoio à decisão. A plataforma organiza o raciocínio; a avaliação individualizada e a decisão final são suas.",
                },
                {
                  q: "Como funciona o acesso?",
                  a: "É um plano único, com tudo liberado: você cria a conta e usa o Motor RCD completo, sem versão limitada e sem recurso escondido atrás de upgrade.",
                },
                {
                  q: "Funciona no celular?",
                  a: "Sim. É uma plataforma web responsiva: funciona no celular, no tablet e no computador, sem instalar nada.",
                },
                {
                  q: "O que o meu aluno recebe?",
                  a: "Um PDF profissional com a sua marca: os exercícios recomendados, as séries sugeridas e a justificativa de cada escolha, algo que nenhuma planilha genérica entrega.",
                },
              ].map((f) => (
                <FaqItem key={f.q} q={f.q} a={f.a} />
              ))}
            </div>
            <p className="mt-6 text-center text-sm text-ink-2">
              Outras dúvidas?{" "}
              <Link to="/suporte" className="font-semibold text-primary hover:underline">
                Fale com o suporte
              </Link>{" "}
              ou veja os{" "}
              <Link to="/tutorial" className="font-semibold text-primary hover:underline">
                tutoriais passo a passo
              </Link>
              .
            </p>
          </div>
        </Section>
      </div>

      {/* ------------------------------ CTA final ---------------------------- */}
      <Section>
        <div className="rounded-card gradient-brand p-10 text-center text-white shadow-elevated md:p-14">
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Seu primeiro aluno, prescrito em minutos.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">
            Três passos, o porquê de cada exercício e um PDF pronto para entregar. Comece agora.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-control bg-white px-6 py-3 font-semibold text-primary hover:bg-white/90"
            >
              Começar agora <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/tutorial"
              className="inline-flex items-center gap-2 rounded-control border border-white/40 px-6 py-3 font-semibold text-white hover:bg-white/10"
            >
              Ver os tutoriais
            </Link>
          </div>
          <p className="mt-5 inline-flex items-center gap-2 text-xs text-white/70">
            <ShieldCheck className="h-3.5 w-3.5" />
            Conteúdo educacional e de apoio à decisão; não substitui avaliação profissional individualizada.
          </p>
        </div>
      </Section>

      {/* -------------------------------- Footer ----------------------------- */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 md:flex-row md:items-center md:justify-between md:px-6">
          <Logo />
          <p className="max-w-md text-xs text-ink-3">
            Conteúdo educacional em ciências do exercício. Não substitui avaliação e prescrição
            profissional individualizada.
          </p>
          <div className="flex gap-4 text-sm text-ink-2">
            <Link to="/tutorial" className="hover:text-ink">Tutoriais</Link>
            <Link to="/suporte" className="hover:text-ink">Suporte</Link>
            <Link to="/pricing" className="hover:text-ink">Planos</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ------ cartão-herói: a decisão documentada (o fosso), estático e prudente ---- */

function DecisaoDemoCard() {
  return (
    <Card variant="raised" className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-border bg-surface-soft px-4 py-2.5">
        <SeloRCD compacto />
        <span className="rounded-full bg-ink/5 px-2 py-0.5 text-2xs font-bold uppercase tracking-wider text-ink-3">
          Exemplo
        </span>
      </div>
      <div className="space-y-3 p-4">
        <div>
          <div className="mb-1.5 text-2xs font-bold uppercase tracking-wider text-ink-3">Condição do aluno</div>
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full border border-primary bg-primary-tint px-2.5 py-1 text-xs font-semibold text-primary">
              Hipertensão
            </span>
            {["Diabetes", "Dor lombar", "Idoso"].map((c) => (
              <span key={c} className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-ink-3">
                {c}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl border border-warning/40 bg-warning-tint px-3 py-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-warning/15">
            <AlertTriangle className="h-4 w-4 text-warning" />
          </span>
          <div>
            <div className="text-sm font-bold text-warning">Pode treinar hoje, com ajuste</div>
            <div className="text-xs text-ink-2">Checklist de segurança da condição, respondido antes da sessão.</div>
          </div>
        </div>

        <div className="rounded-xl border border-border p-3">
          <div className="flex items-center justify-between">
            <span className="font-display text-sm font-bold text-ink">Leg press 45°</span>
            <span className="rounded-full bg-success-tint px-2 py-0.5 text-2xs font-bold text-success">Recomendado</span>
          </div>
          <p className="mt-1 text-xs text-ink-2">
            Tronco apoiado e cadeia fechada: a pressão sobe menos que no agachamento livre. Evitar
            apneia (Valsalva); respiração contínua nas séries.
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-2xs text-ink-3">
            <span className="rounded bg-ink/5 px-1.5 py-0.5 font-bold text-ink-2">1</span>
            <span className="rounded bg-ink/5 px-1.5 py-0.5 font-bold text-ink-2">2</span>
            <span>referências citadas na decisão</span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-surface-soft px-3 py-2.5">
          <FileDown className="h-4 w-4 shrink-0 text-analysis" />
          <span className="text-xs text-ink-2">
            Vira um registro com o seu nome e CREF, para guardar e assinar. A decisão é sempre sua.
          </span>
        </div>
      </div>
    </Card>
  );
}

/* ----------------------- mock da justificativa (o "aha") ------------------ */

function JustifyMock() {
  const rows = [
    { c: "Compatível com o objetivo (Hipertrofia)", v: "+30,0", max: "30", tone: "text-success" },
    { c: "Adequado ao nível Iniciante", v: "+20,0", max: "20", tone: "text-success" },
    { c: "Equipamento disponível", v: "+15,0", max: "20", tone: "text-ink" },
    { c: "Cautela: desconforto lombar", v: "−8,0", max: "—", tone: "text-[color:var(--cta-text)]" },
  ];
  return (
    <Card variant="raised" className="p-5 md:p-6">
      <div className="mb-1 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-ink-3">Justificativa</div>
          <h3 className="font-display text-lg font-bold text-ink">Leg press 45°</h3>
        </div>
        <Pill tone="success">adequação 82/100</Pill>
      </div>
      <p className="mb-3 text-sm text-ink-2">Como cada critério pesou no ranqueamento:</p>
      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.c} className="rounded-lg border border-border bg-surface-soft p-3">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold text-ink">{r.c}</span>
              <span className={`tabular shrink-0 font-bold ${r.tone}`}>
                {r.v}
                {r.max !== "—" && <span className="ml-1 text-xs font-medium text-ink-3">/ {r.max}</span>}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-ink-3">
        <Info className="h-3.5 w-3.5" /> Exemplo real de como a recomendação é explicada dentro da plataforma.
      </p>
    </Card>
  );
}

/* --------------------------------- FAQ item ------------------------------- */

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-bg">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
      >
        <span className="font-semibold text-ink">{q}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-ink-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="px-4 pb-4 text-sm text-ink-2">{a}</p>}
    </div>
  );
}

/* --------------------------------- planos --------------------------------- */

function PlanCard({
  nome,
  preco,
  desc,
  items,
  cta,
  destaque,
}: {
  nome: string;
  preco: string;
  desc: string;
  items: string[];
  cta: string;
  destaque?: boolean;
}) {
  return (
    <Card className="relative p-6 text-left">
      {destaque && (
        <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-0.5 text-xs font-bold text-on-primary">
          Acesso completo
        </span>
      )}
      <div className="font-display text-lg font-bold text-ink">{nome}</div>
      <p className="text-sm text-ink-2">{desc}</p>
      <div className="mt-3 font-display text-3xl font-extrabold text-ink">
        {preco} <span className="text-sm font-medium text-ink-3">/mês</span>
      </div>
      <ul className="mt-4 space-y-2 text-sm text-ink">
        {items.map((i) => (
          <li key={i} className="flex gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {i}
          </li>
        ))}
      </ul>
      <Link to="/dashboard" className={buttonClasses(destaque ? "primary" : "secondary") + " mt-5 w-full"}>
        {cta}
      </Link>
    </Card>
  );
}
