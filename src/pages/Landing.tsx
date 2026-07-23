import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowDown,
  Check,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  AlertTriangle,
  Info,
  ChevronDown,
  FileDown,
  FileCheck,
  Users,
  BarChart3,
  CalendarRange,
  Navigation,
  Smartphone,
  GraduationCap,
  FlaskConical,
  ClipboardList,
  Compass,
  Route,
  HeartPulse,
  UserCheck,
  Dumbbell,
  TrendingUp,
} from "lucide-react";
import * as React from "react";
import { Logo } from "@/components/brand/Logo";
import { Card, Pill, buttonClasses, SectionHeader, Eyebrow, ParDado } from "@/components/ui/primitives";
import { SeloRCD } from "@/components/rcd/SeloRCD";
import { EspinhaSelo } from "@/components/ui/EspinhaSelo";
import { TutorialScene } from "@/components/tutorial/TutorialScene";
import { muscleRegions } from "@/data/muscle-regions";
import { analysisOverlays } from "@/data/analysis-overlays";
import { getExercise } from "@/data/exercises";
import { cn, withBase } from "@/lib/utils";

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

/* Item de pilar: ícone quadrado + título + linha. Base dos três pilares. */
function FeatureItem({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-tint text-primary">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="font-display font-bold text-ink">{title}</div>
        <p className="mt-0.5 text-sm text-ink-2">{children}</p>
      </div>
    </li>
  );
}

/* Os três pilares, usados nos chips do hero e no cartão-sistema. */
const TRIADE = [
  { id: "registro", label: "Registro", icon: ClipboardList, linha: "Aluno, avaliação, semáforo e treino, registrados.", tone: "primary" as const },
  { id: "acompanhamento", label: "Acompanhamento", icon: Route, linha: "Do cadastro à reavaliação, com histórico.", tone: "analysis" as const },
  { id: "direcionamento", label: "Direcionamento", icon: Compass, linha: "Grupo, objetivo e avaliação guiam a prescrição.", tone: "primary" as const },
];

/* Catálogo de módulos: cada porta aponta para uma rota real do app; os rótulos
   espelham os nomes usados na navegação. */
const MODULOS: { icon: React.ComponentType<{ className?: string }>; label: string; to: string; d: string }[] = [
  { icon: Users, label: "Alunos", to: "/alunos", d: "Cadastro, avaliações e evolução de cada aluno." },
  { icon: BarChart3, label: "Avaliações", to: "/assessments", d: "Medidas, IMC e RCQ derivados; reavalie e compare." },
  { icon: ShieldCheck, label: "Semáforo", to: "/semaforo", d: "Libere, ajuste ou adie a sessão do dia, com o porquê." },
  { icon: CalendarRange, label: "Prescrever treino", to: "/prescrever-treino", d: "Periodização mensal a anual, do mesociclo ao microciclo." },
  { icon: Navigation, label: "Prescrever exercício", to: "/gps", d: "Personalize o treino do dia do aluno pela avaliação, ou prescreva uma sessão avulsa." },
  { icon: Smartphone, label: "App do aluno", to: "/alunos", d: "O que o aluno vê: treino, semáforo e registro de execução." },
  { icon: GraduationCap, label: "Aprender", to: "/aprender", d: "Disciplinas, casos e biblioteca com referências reais." },
  { icon: FlaskConical, label: "Laboratório Visual", to: "/movement-lab", d: "Foto real e análise biomecânica no divisor interativo." },
];

/* --------------------------------- página -------------------------------- */

export function Landing() {
  return (
    <div className="min-h-screen bg-bg">
      {/* ------------------------------- Header ------------------------------ */}
      <header className="sticky top-0 z-30 border-b border-border bg-surface/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          <Logo />
          <nav aria-label="Seções da página" className="hidden items-center gap-6 text-sm font-medium text-ink-2 md:flex">
            <a href="#pilares" className="hover:text-ink">A tríade</a>
            <a href="#modulos" className="hover:text-ink">Módulos</a>
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
            <Kicker tone="analysis">Sistema completo para profissionais de Educação Física</Kicker>
            <h1 className="font-display text-4xl font-extrabold leading-[1.05] text-ink md:text-[3.1rem]">
              Registre. Acompanhe.{" "}
              <span className="relative inline-block whitespace-nowrap text-primary">
                Direcione.
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
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-ink-2">
              Cadastro, avaliação, semáforo e treino no mesmo lugar. O sistema conduz o
              acompanhamento do primeiro dia à reavaliação e ajusta a prescrição ao objetivo e à
              condição de cada aluno. A decisão é sempre sua.
            </p>

            {/* Os três pilares como âncoras: cada chip rola até o pilar correspondente. */}
            <div className="mt-6 flex flex-wrap gap-2">
              {TRIADE.map((t) => {
                const Icon = t.icon;
                return (
                  <a
                    key={t.id}
                    href={`#${t.id}`}
                    className="group inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-2 text-sm font-semibold text-ink shadow-soft transition-colors hover:border-primary hover:bg-primary-tint hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    {t.label}
                    <ArrowDown className="h-3.5 w-3.5 text-ink-3 transition-transform group-hover:translate-y-0.5" />
                  </a>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/dashboard" className={buttonClasses("primary")}>
                Começar agora <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#modulos" className={buttonClasses("secondary")}>
                Ver os módulos <ArrowDown className="h-4 w-4" />
              </a>
            </div>
            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-ink-2">
              {["Acesso completo", "Sem versão limitada", "Feito por doutor em Educação Física"].map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-success" /> {t}
                </li>
              ))}
            </ul>
          </div>

          {/* A tese à vista: o sistema (a tríade), não um aluno. */}
          <SistemaCard />
        </div>
      </Section>

      {/* ------------------ Bridge: por que um sistema ---------------------- */}
      <div className="border-y border-border bg-surface">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center md:px-6">
          <Kicker>Por que um sistema, e não uma planilha</Kicker>
          <h2 className="font-display text-2xl font-bold text-ink md:text-3xl">
            Registrar, acompanhar e direcionar são o mesmo trabalho. O sistema mantém as três peças
            juntas.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-ink-2">
            Cada peça alimenta a próxima: a avaliação libera a prescrição, o semáforo acompanha o
            dia, a reavaliação recomeça o ciclo. Nada solto entre planilhas, nada perdido no caminho.
          </p>
        </div>
      </div>

      {/* ================================ PILARES =========================== */}
      <div id="pilares">
        {/* ------------------------ Pilar 01 · Registro -------------------- */}
        <Section id="registro" className="scroll-mt-20">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <SectionHeader
                level={2}
                eyebrow="Pilar 01 · Registro"
                icon={<ClipboardList className="h-4 w-4" />}
                title="Tudo registrado, num só lugar."
                subtitle="Cadastro do aluno, avaliação completa e histórico que não se perde entre planilhas."
              />
              <ul className="mt-6 space-y-4">
                <FeatureItem icon={<Users className="h-4 w-4" />} title="Cadastro do aluno">
                  Perfil, objetivo, nível, restrições e equipamentos disponíveis.
                </FeatureItem>
                <FeatureItem icon={<BarChart3 className="h-4 w-4" />} title="Avaliação completa">
                  Medidas, IMC e RCQ derivados, pressão e sinais. As contas são do sistema.
                </FeatureItem>
                <FeatureItem icon={<TrendingUp className="h-4 w-4" />} title="Reavaliação com evolução">
                  Os campos já vêm com a avaliação anterior e o gráfico mostra o antes e o depois.
                </FeatureItem>
                <FeatureItem icon={<FileCheck className="h-4 w-4" />} title="Prontuário assinável e PDF com a sua marca">
                  A decisão vira documento com o seu nome e o seu CREF, para guardar e entregar.
                </FeatureItem>
              </ul>
            </div>
            <Card variant="raised" className="p-3">
              <div className="overflow-hidden rounded-xl border border-border bg-surface-soft p-2">
                <TutorialScene id="avaliar" label="Registrar a avaliação do aluno" />
              </div>
              <p className="px-2 py-2 text-center text-xs text-ink-3">
                A avaliação abre o registro: o treino nasce dela.
              </p>
            </Card>
          </div>
        </Section>

        {/* --------------------- Pilar 02 · Acompanhamento ----------------- */}
        <div className="border-y border-border bg-surface">
          <Section id="acompanhamento" className="scroll-mt-20">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <AcompanhamentoVisual />
              <div className="lg:order-2">
                <SectionHeader
                  level={2}
                  eyebrow="Pilar 02 · Acompanhamento"
                  icon={<Route className="h-4 w-4" />}
                  title="Um caminho, do cadastro à reavaliação."
                  subtitle="O sistema aponta o próximo passo e guarda o histórico de cada etapa."
                />
                <ul className="mt-6 space-y-4">
                  <FeatureItem icon={<Route className="h-4 w-4" />} title="A linha do cuidado">
                    Avaliar, planejar, liberar, acompanhar e reavaliar, sempre com o próximo passo à
                    vista.
                  </FeatureItem>
                  <FeatureItem icon={<ShieldCheck className="h-4 w-4" />} title="Semáforo diário com histórico">
                    Libere, ajuste ou adie a sessão do dia. O histórico fica completo, dia a dia.
                  </FeatureItem>
                  <FeatureItem icon={<AlertTriangle className="h-4 w-4" />} title="Alerta que persiste">
                    Um "não liberado" sem novo semáforo avisa você e o aluno até ser resolvido.
                  </FeatureItem>
                  <FeatureItem icon={<Smartphone className="h-4 w-4" />} title="App do aluno">
                    O aluno vê o treino, consulta o semáforo e registra a execução.
                  </FeatureItem>
                </ul>
              </div>
            </div>
          </Section>
        </div>

        {/* ------------ Vale escuro: o Semáforo em cores (assinatura) -------- */}
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

        {/* --------------------- Pilar 03 · Direcionamento ----------------- */}
        <Section id="direcionamento" className="scroll-mt-20">
          <SectionHeader
            level={2}
            eyebrow="Pilar 03 · Direcionamento"
            icon={<Compass className="h-4 w-4" />}
            title="A prescrição que se ajusta ao aluno."
            subtitle="Grupo, objetivo e características definem o treino. A condição de saúde vira critério, não obstáculo."
          />

          {/* A: os critérios do direcionamento + a decisão documentada */}
          <div className="mt-8 grid items-start gap-10 lg:grid-cols-2">
            <div>
              <ul className="space-y-4">
                <FeatureItem icon={<HeartPulse className="h-4 w-4" />} title="Classificação de grupo especial">
                  O sistema indica o grupo pelo critério citado (IMC, pressão, idade). Você confirma.
                </FeatureItem>
                <FeatureItem icon={<Compass className="h-4 w-4" />} title="Motor que valida pela avaliação">
                  Cada exercício é ranqueado e as cautelas da condição já entram na conta.
                </FeatureItem>
                <FeatureItem icon={<CalendarRange className="h-4 w-4" />} title="Periodização mensal a anual">
                  Do mesociclo ao microciclo, com métodos de série (bi-set, drop-set) na semana.
                </FeatureItem>
              </ul>
              <ClassificadorCallout />
            </div>
            <DecisaoDemoCard />
          </div>

          {/* B: o mecanismo (Motor RCD) e o "aha" da justificativa */}
          <div className="mt-14 grid items-center gap-10 lg:grid-cols-2">
            <div>
              <div className="mb-3">
                <SeloRCD />
              </div>
              <h3 className="font-display text-xl font-bold text-ink">
                Não é um gerador de treino. É{" "}
                <span className="text-primary">Raciocínio Clínico Documentado</span>.
              </h3>
              <p className="mt-3 text-ink-2">
                O Motor RCD acompanha a decisão inteira, do critério de escolha ao documento que você
                pode assinar. Em três atos:
              </p>
              <ol className="mt-5 space-y-3">
                {[
                  {
                    t: "Semáforo de Liberação",
                    d: "Antes da sessão: liberado, liberado com ajuste ou não liberado hoje, com o porquê.",
                  },
                  {
                    t: "Decisão justificada",
                    d: "Exercícios ranqueados critério a critério, inclusive o que foi descartado, e por quê.",
                  },
                  {
                    t: "Prontuário assinável",
                    d: "O raciocínio vira documento com referências numeradas, seu nome e seu CREF.",
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

          {/* C: ChatGPT × RCD, o hábito real do público, resumido */}
          <div className="mx-auto mt-14 max-w-3xl">
            <h3 className="text-center font-display text-xl font-bold text-ink">
              "Mas eu já uso o ChatGPT para montar treino."
            </h3>
            <p className="mx-auto mt-1 max-w-xl text-center text-sm text-ink-2">
              Ótimo para rascunhar. Quando o aluno tem uma condição de saúde, a diferença aparece: o
              ChatGPT não assina embaixo. Você sim.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Card variant="soft" className="p-5">
                <div className="mb-2 text-sm font-bold uppercase tracking-wider text-ink-3">IA genérica</div>
                <ul className="space-y-2 text-sm text-ink-2">
                  <li>Entrega um treino, sem rastro do porquê</li>
                  <li>Não checa se o aluno pode treinar hoje</li>
                  <li>Não cita a base científica de cada escolha</li>
                  <li>Não gera registro que você assine embaixo</li>
                </ul>
              </Card>
              <Card className="border-analysis/40 p-5">
                <div className="mb-2">
                  <SeloRCD compacto />
                </div>
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
              Em ambos os casos, quem decide é o profissional habilitado (CREF). A diferença é o que
              sobra documentado depois da decisão.
            </p>
          </div>
        </Section>
      </div>

      {/* ----- Prova visual: foto real × análise, o motor por dentro -------- */}
      <div className="border-y border-border bg-surface">
        <Section className="!py-12">
          <div className="mx-auto max-w-4xl text-center">
            <Kicker tone="analysis">Execução × análise</Kicker>
            <h2 className="font-display text-3xl font-bold text-ink md:text-4xl">
              Entenda o movimento por dentro.
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-ink-2">
              Arraste o divisor e revele a análise biomecânica sobre a foto real de execução: músculos
              ativados, ângulos e linha de força. É o que o motor lê para validar cada exercício.
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
      </div>

      {/* --------------------- Catálogo de módulos -------------------------- */}
      <Section id="modulos" className="scroll-mt-20">
        <SectionHeader
          level={2}
          eyebrow="O catálogo"
          title="Oito módulos, um sistema."
          subtitle="Cada porta abre uma parte do trabalho, e todas conversam entre si."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MODULOS.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.label}
                to={m.to}
                className="group flex flex-col rounded-card border border-border bg-surface p-5 shadow-soft transition-[box-shadow,transform,border-color] duration-150 hover:border-primary hover:shadow-lift motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
              >
                <span className="mb-3 inline-grid h-11 w-11 place-items-center rounded-xl bg-primary-tint text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display text-base font-bold text-ink">{m.label}</h3>
                  <ArrowRight className="h-4 w-4 text-ink-3 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
                <p className="mt-1 text-sm text-ink-2">{m.d}</p>
              </Link>
            );
          })}
        </div>
      </Section>

      {/* -------------------- Casos documentados + ROI ---------------------- */}
      <Section className="!py-14 text-center">
        <Kicker tone="analysis">Prova, não promessa</Kicker>
        <h2 className="font-display text-3xl font-bold text-ink">Veja o motor decidir um caso real, agora.</h2>
        <p className="mx-auto mt-2 max-w-2xl text-ink-2">
          Sem cadastro: escolha um caso típico (hipertenso, dor lombar em idoso, obesidade grave) e
          veja o Motor RCD rodar ao vivo: escolhas, descartes e referências.
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

      {/* ------------------------------ Para quem --------------------------- */}
      <div className="border-y border-border bg-surface">
        <Section className="!py-14 text-center">
          <Kicker tone="analysis">Para quem é</Kicker>
          <h2 className="font-display text-3xl font-bold text-ink">Do estágio à academia cheia.</h2>
          <div className="mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-3">
            {[
              {
                icon: <GraduationCap className="h-6 w-6" />,
                t: "Estudante de EF",
                d: "Treine a decisão com casos e disciplinas; chegue ao estágio sabendo o porquê.",
              },
              {
                icon: <UserCheck className="h-6 w-6" />,
                t: "Personal recém-formado",
                d: "Prescreva com segurança desde o primeiro aluno e mostre profissionalismo no PDF.",
              },
              {
                icon: <Dumbbell className="h-6 w-6" />,
                t: "Professor de musculação",
                d: "Conduza perfis diferentes, do iniciante ao grupo especial, com critério e progressão.",
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

      {/* ------------------------------- Planos ----------------------------- */}
      <Section id="planos" className="scroll-mt-20 text-center">
        <Kicker>Plano</Kicker>
        <h2 className="font-display text-3xl font-bold text-ink">Um plano, tudo liberado.</h2>
        <p className="mx-auto mt-2 max-w-xl text-ink-2">
          O sistema completo, sem versão limitada: registro, acompanhamento e direcionamento em um só
          lugar, para todos os grupos e casos.
        </p>
        <div className="mx-auto mt-8 max-w-md">
          <PlanCard
            destaque
            nome="Profissional"
            preco="R$ 59"
            desc="O sistema da tríade completo: decisão documentada e assinável."
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

      {/* --------------------------------- FAQ ------------------------------ */}
      <div className="border-y border-border bg-surface">
        <Section id="faq" className="scroll-mt-20 !py-14">
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
                  q: "Preciso avaliar antes de montar o treino?",
                  a: "Sim. O treino nasce da avaliação: sem ela, o sistema não monta a prescrição. É o que mantém a decisão direcionada e defensável.",
                },
                {
                  q: "Como funciona o acesso?",
                  a: "É um plano único, com tudo liberado: você cria a conta e usa o sistema completo, sem versão limitada e sem recurso escondido atrás de upgrade.",
                },
                {
                  q: "Funciona no celular?",
                  a: "Sim. É uma plataforma web responsiva: funciona no celular, no tablet e no computador, sem instalar nada.",
                },
                {
                  q: "O que o meu aluno recebe?",
                  a: "Um PDF profissional com a sua marca e o app do aluno, onde ele vê o treino, consulta o semáforo e registra a execução.",
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

      {/* ------------------------------ CTA final --------------------------- */}
      <Section>
        <div className="rounded-card gradient-brand p-10 text-center text-white shadow-elevated md:p-14">
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Comece a registrar, acompanhar e direcionar.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">
            Crie a conta e conduza o primeiro aluno pela linha do cuidado, do cadastro à reavaliação.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-control bg-surface px-6 py-3 font-semibold text-primary hover:bg-surface/90"
            >
              Começar agora <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/tutorial"
              className="inline-flex items-center gap-2 rounded-control border border-white/40 px-6 py-3 font-semibold text-white hover:bg-surface/10"
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

      {/* -------------------------------- Footer ---------------------------- */}
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

/* ---- cartão-tese do hero: o sistema (a tríade), não um aluno ------------- */

function SistemaCard() {
  return (
    <Card variant="raised" className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-border bg-surface-soft px-4 py-2.5">
        <span className="text-2xs font-bold uppercase tracking-wider text-ink-3">Um sistema, três pilares</span>
        <SeloRCD compacto />
      </div>
      <div className="space-y-2.5 p-4">
        {TRIADE.map((t) => {
          const Icon = t.icon;
          const tile = t.tone === "analysis" ? "bg-analysis-tint text-analysis-text" : "bg-primary-tint text-primary";
          return (
            <div key={t.id} className="flex items-start gap-3 rounded-xl border border-border bg-surface p-3">
              <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", tile)}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="font-display text-sm font-bold text-ink">{t.label}</div>
                <p className="text-xs text-ink-2">{t.linha}</p>
              </div>
            </div>
          );
        })}
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 rounded-xl bg-surface-soft px-3 py-2.5 text-2xs font-semibold text-ink-2">
          {["Cadastro", "Avaliação", "Prescrição", "Semáforo", "Reavaliação"].map((s, i) => (
            <React.Fragment key={s}>
              {i > 0 && (
                <span aria-hidden className="text-ink-3">
                  ›
                </span>
              )}
              <span>{s}</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </Card>
  );
}

/* ---- visual do Acompanhamento: a espinha do cuidado + histórico ---------- */

function AcompanhamentoVisual() {
  const historico = [
    { dot: "bg-success", rotulo: "Liberado", data: "22/07" },
    { dot: "bg-warning", rotulo: "Liberado com ajuste", data: "20/07" },
    { dot: "bg-danger", rotulo: "Não liberado", data: "17/07" },
  ];
  return (
    <Card variant="raised" className="order-2 p-5 lg:order-1">
      <Eyebrow className="mb-3">A linha do cuidado</Eyebrow>
      <EspinhaSelo atual={3} halo className="mb-4" />
      <div className="rounded-xl border border-primary/25 bg-primary-tint px-3 py-2.5">
        <ParDado label="Próximo passo" value="Reavaliar" layout="inline" />
      </div>
      <div className="mt-4">
        <Eyebrow className="mb-2">Histórico do semáforo</Eyebrow>
        <ul className="space-y-1.5">
          {historico.map((h) => (
            <li
              key={h.data}
              className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm"
            >
              <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", h.dot)} />
              <span className="font-medium text-ink">{h.rotulo}</span>
              <span aria-hidden className="text-ink-3">
                ·
              </span>
              <span className="tabular text-xs text-ink-3">{h.data}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

/* ---- classificador: a comorbidade como força do Direcionamento ----------- */

function ClassificadorCallout() {
  return (
    <div className="mt-6 rounded-card border border-primary/25 bg-primary-tint p-4">
      <div className="flex items-center gap-2 text-2xs font-bold uppercase tracking-wider text-primary">
        <HeartPulse className="h-3.5 w-3.5" /> Direcionamento sugerido
        <span className="ml-auto rounded-full bg-ink/5 px-2 py-0.5 text-ink-3">Exemplo</span>
      </div>
      <ul className="mt-2.5 space-y-1.5 text-sm text-ink">
        <li>
          IMC 31,2 indica <span className="font-semibold">obesidade grau I</span> (critério OMS).
        </li>
        <li>
          PA 148/96 pede <span className="font-semibold">atenção</span>; confirme o diagnóstico e a
          liberação.
        </li>
      </ul>
      <p className="mt-2.5 text-xs text-ink-2">
        Você confirma o direcionamento; o motor passa a validar os exercícios por esses fatos.
      </p>
    </div>
  );
}

/* ------ cartão exemplo: a decisão documentada (o fosso), estático e prudente ---- */

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
  const rows: { c: string; v: string; max: string | null; tone: string }[] = [
    { c: "Compatível com o objetivo (Hipertrofia)", v: "+30,0", max: "30", tone: "text-success" },
    { c: "Adequado ao nível Iniciante", v: "+20,0", max: "20", tone: "text-success" },
    { c: "Equipamento disponível", v: "+15,0", max: "20", tone: "text-ink" },
    { c: "Cautela: desconforto lombar", v: "−8,0", max: null, tone: "text-[color:var(--cta-text)]" },
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
                {r.max && <span className="ml-1 text-xs font-medium text-ink-3">/ {r.max}</span>}
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
