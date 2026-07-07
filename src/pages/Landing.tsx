import { Link } from "react-router-dom";
import {
  ArrowRight,
  Navigation,
  FlaskConical,
  BookOpen,
  Check,
  CheckCircle2,
  ShieldAlert,
  GraduationCap,
  Dumbbell,
  UserCheck,
  Users,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Card, Pill, ScoreRing, StatBar, buttonClasses } from "@/components/ui/primitives";
import { VisualCompareSlider } from "@/components/movement-lab/VisualCompareSlider";
import { ExecutionScene, AnalysisScene } from "@/data/scenes";

function Section({ id, className = "", children }: { id?: string; className?: string; children: React.ReactNode }) {
  return (
    <section id={id} className={`mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-16 ${className}`}>
      {children}
    </section>
  );
}

export function Landing() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm font-medium text-ink-2 md:flex">
            <a href="#solucao" className="hover:text-ink">Como funciona</a>
            <a href="#para-quem" className="hover:text-ink">Para quem é</a>
            <a href="#planos" className="hover:text-ink">Planos</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="hidden text-sm font-medium text-ink-2 hover:text-ink sm:block">
              Entrar
            </Link>
            <Link to="/dashboard" className={buttonClasses("primary", "sm")}>
              Começar gratuitamente
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <Section className="!pt-10 md:!pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Pill tone="analysis" className="mb-4">Educação em Ciências do Exercício</Pill>
            <h1 className="font-display text-4xl font-extrabold leading-[1.05] text-ink md:text-5xl">
              Aprenda a prescrever com <span className="text-primary">raciocínio</span>, não com
              decoreba.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-ink-2">
              Não é um atlas de exercícios nem um gerador genérico de treino. É uma plataforma para
              <span className="font-semibold text-ink"> raciocinar a prescrição</span> — biomecânica,
              fisiologia, grupos especiais e progressão — para você{" "}
              <span className="font-semibold text-ink">aprender a decidir e levar isso direto para o
              atendimento dos seus alunos</span>.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/dashboard" className={buttonClasses("primary")}>
                Começar gratuitamente <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/movement-lab" className={buttonClasses("secondary")}>
                Ver demonstração
              </Link>
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-ink-3">
              <ShieldCheck className="h-3.5 w-3.5" />
              Conteúdo educacional. Não substitui avaliação profissional individualizada.
            </p>
          </div>
          <Card className="p-3 shadow-elevated">
            <VisualCompareSlider
              before={<ExecutionScene />}
              after={<AnalysisScene angle="95°" />}
              className="aspect-[4/3]"
            />
            <p className="px-2 py-2 text-center text-xs text-ink-3">
              Arraste o divisor para comparar execução × análise biomecânica.
            </p>
          </Card>
        </div>
      </Section>

      {/* Dor */}
      <Section id="dor">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <Pill tone="cta" className="mb-3">A dor</Pill>
            <h2 className="font-display text-3xl font-bold text-ink">
              Você sabe o nome dos exercícios, mas trava na hora de justificar a escolha.
            </h2>
            <p className="mt-3 text-ink-2">
              Decorar séries e planilhas não resolve quando o aluno pergunta “por que esse e não
              aquele?”. Falta clareza para responder com segurança científica.
            </p>
          </div>
          <div className="space-y-3">
            {[
              "“Isso pega mais reto ou vasto lateral?”",
              "“Posso trocar por leg press?”",
              "“Por que evitar em quem tem desconforto lombar?”",
            ].map((q) => (
              <Card key={q} className="flex items-center gap-3 p-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-tint text-primary">?</span>
                <span className="text-ink">{q}</span>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* Solução */}
      <Section id="solucao" className="text-center">
        <Pill tone="primary" className="mb-3">A solução</Pill>
        <h2 className="font-display text-3xl font-bold text-ink">Três camadas que se conversam</h2>
        <p className="mx-auto mt-2 max-w-2xl text-ink-2">
          Do conceito ao caso real, você aprende a decidir com critério — e a defender a decisão.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <SolCard icon={<Navigation className="h-5 w-5" />} eyebrow="O cérebro" title="GPS da Prescrição" text="Recomendações justificadas para cada objetivo e restrição." />
          <SolCard icon={<FlaskConical className="h-5 w-5" />} eyebrow="A vitrine" title="Laboratório Visual" text="Compare execução e análise biomecânica lado a lado." />
          <SolCard icon={<BookOpen className="h-5 w-5" />} eyebrow="A aprendizagem" title="Casos práticos" text="Situações reais que treinam o seu julgamento clínico-esportivo." />
        </div>
      </Section>

      {/* Da avaliação à progressão */}
      <Section id="jornada" className="text-center">
        <Pill tone="analysis" className="mb-3">Da avaliação à progressão</Pill>
        <h2 className="font-display text-3xl font-bold text-ink">Um fluxo de decisão, não um treino avulso</h2>
        <p className="mx-auto mt-2 max-w-2xl text-ink-2">
          Da avaliação do aluno até a reavaliação — passando por grupo especial, modalidade,
          parâmetros e progressão. É assim que se conduz diferentes perfis com segurança.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {["Perfil do aluno", "Grupo especial", "Modalidade", "Parâmetros", "Prescrição", "Progressão", "Reavaliação"].map(
            (step, i, arr) => (
              <span key={step} className="flex items-center gap-2">
                <span className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-ink shadow-soft">
                  {step}
                </span>
                {i < arr.length - 1 && <ArrowRight className="h-4 w-4 text-ink-3" />}
              </span>
            ),
          )}
        </div>
        <p className="mx-auto mt-6 max-w-2xl rounded-card border border-border bg-surface p-4 text-sm text-ink-2">
          Exemplo real: “Como treino alguém com obesidade grave que caminha pouco? Se começar na
          hidroginástica, o que monitoro sem frequência cardíaca? Quando troco para caminhada ou
          musculação?” — a plataforma apoia esse raciocínio, passo a passo.
        </p>
      </Section>

      {/* GPS exemplo */}
      <Section id="gps">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <Card className="p-6">
            <div className="flex items-center gap-5">
              <ScoreRing value={84} size={104} label="Aderência" />
              <div>
                <div className="text-xs uppercase tracking-wider text-ink-3">Recomendação</div>
                <div className="font-display text-lg font-bold text-ink">Leg press 45°</div>
                <Pill tone="success" className="mt-1">Ênfase em quadríceps</Pill>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <MiniList tone="success" icon={<CheckCircle2 className="h-4 w-4" />} title="Quando usar" items={["Aprendizado inicial", "Menor demanda lombar"]} />
              <MiniList tone="cta" icon={<ShieldAlert className="h-4 w-4" />} title="Quando evitar" items={["Dor no joelho não controlada", "Foco em barra livre"]} />
            </div>
          </Card>
          <div>
            <Pill tone="primary" className="mb-3">GPS da Prescrição</Pill>
            <h2 className="font-display text-3xl font-bold text-ink">Escolhas defendidas com critério.</h2>
            <p className="mt-3 text-ink-2">
              Um assistente educacional que ajuda você a raciocinar sobre objetivo, contexto e
              restrições — tende a orientar melhores decisões, sem prometer prescrição clínica.
            </p>
            <div className="mt-5 space-y-2.5 rounded-card border border-border bg-surface p-4">
              <StatBar label="Quadríceps" value={92} tone="primary" />
              <StatBar label="Demanda lombar" value={34} tone="cta" />
              <StatBar label="Complexidade técnica" value={41} tone="cta" />
            </div>
          </div>
        </div>
      </Section>

      {/* Casos */}
      <Section id="casos" className="text-center">
        <Pill tone="analysis" className="mb-3">Casos práticos</Pill>
        <h2 className="font-display text-3xl font-bold text-ink">Corrige o raciocínio, não só a resposta.</h2>
        <p className="mx-auto mt-2 max-w-2xl text-ink-2">
          Cada caso mostra por que uma escolha pode favorecer o objetivo — ou merecer cautela.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { n: "Iniciante", t: "Iniciante quer glúteo", d: "Sequência com menor demanda técnica." },
            { n: "Intermediário", t: "Aluno relata desconforto lombar", d: "Ajuste de carga, técnica e alternativa." },
            { n: "Avançado", t: "Atleta em fase de força", d: "Prioriza padrões livres bem executados." },
          ].map((c) => (
            <Card key={c.t} className="p-5 text-left">
              <Pill tone={c.n === "Iniciante" ? "success" : "warning"} className="mb-2">{c.n}</Pill>
              <div className="font-display font-bold text-ink">{c.t}</div>
              <p className="mt-1 text-sm text-ink-2">{c.d}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Para quem */}
      <Section id="para-quem" className="text-center">
        <Pill tone="primary" className="mb-3">Para quem é</Pill>
        <h2 className="font-display text-3xl font-bold text-ink">Feito para quem estuda o movimento.</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { icon: <GraduationCap className="h-5 w-5" />, t: "Estudantes de EF" },
            { icon: <UserCheck className="h-5 w-5" />, t: "Personais recém-formados" },
            { icon: <Dumbbell className="h-5 w-5" />, t: "Professores de musculação" },
            { icon: <ShieldCheck className="h-5 w-5" />, t: "Quem quer justificar com segurança" },
            { icon: <Users className="h-5 w-5" />, t: "Professores universitários" },
          ].map((p) => (
            <Card key={p.t} className="flex flex-col items-center p-5 text-center">
              <span className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-primary-tint text-primary">
                {p.icon}
              </span>
              <span className="text-sm font-medium text-ink">{p.t}</span>
            </Card>
          ))}
        </div>
      </Section>

      {/* Planos */}
      <Section id="planos" className="text-center">
        <Pill tone="primary" className="mb-3">Planos</Pill>
        <h2 className="font-display text-3xl font-bold text-ink">Comece grátis, evolua quando quiser.</h2>
        <div className="mx-auto mt-8 grid max-w-3xl gap-4 md:grid-cols-2">
          <PlanCard
            nome="Grátis"
            preco="R$ 0"
            desc="Para começar a explorar."
            items={["Acesso ao Laboratório Visual (parcial)", "3 análises no GPS", "2 casos práticos", "Biblioteca essencial"]}
            cta="Criar conta gratuita"
          />
          <PlanCard
            destaque
            nome="Profissional"
            preco="R$ 39"
            desc="Para atuar com segurança."
            items={["Laboratório Visual completo", "GPS ilimitado + comparador", "Todos os casos com feedback", "Trilhas e progresso"]}
            cta="Assinar Profissional"
          />
        </div>
      </Section>

      {/* CTA final */}
      <Section>
        <div className="rounded-card gradient-brand p-10 text-center text-white shadow-elevated md:p-14">
          <h2 className="font-display text-3xl font-bold">Pare de decorar exercícios. Comece a entender o porquê.</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">
            Em minutos você já experimenta o Laboratório Visual e o GPS da Prescrição.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-control bg-white px-5 py-2.5 font-semibold text-primary hover:bg-white/90">
              Começar gratuitamente <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/movement-lab" className="inline-flex items-center gap-2 rounded-control border border-white/40 px-5 py-2.5 font-semibold text-white hover:bg-white/10">
              Ver demonstração
            </Link>
          </div>
        </div>
      </Section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 md:flex-row md:items-center md:justify-between md:px-6">
          <Logo />
          <p className="max-w-md text-xs text-ink-3">
            Conteúdo educacional em ciências do exercício. Não substitui avaliação e prescrição
            profissional individualizada.
          </p>
          <div className="flex gap-4 text-sm text-ink-2">
            <Link to="/planos" className="hover:text-ink">Planos</Link>
            <a href="#" className="hover:text-ink">Termos</a>
            <a href="#" className="hover:text-ink">Privacidade</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SolCard({ icon, eyebrow, title, text }: { icon: React.ReactNode; eyebrow: string; title: string; text: string }) {
  return (
    <Card className="p-6 text-left">
      <span className="mb-3 inline-grid h-10 w-10 place-items-center rounded-xl bg-primary-tint text-primary">{icon}</span>
      <div className="text-xs font-semibold uppercase tracking-wider text-analysis">{eyebrow}</div>
      <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
      <p className="mt-1 text-sm text-ink-2">{text}</p>
    </Card>
  );
}

function MiniList({ tone, icon, title, items }: { tone: "success" | "cta"; icon: React.ReactNode; title: string; items: string[] }) {
  const c = tone === "success" ? "bg-[#e7f8ed] text-success" : "bg-[#fff1e6] text-[color:var(--cta-text)]";
  return (
    <div className="rounded-xl border border-border p-3">
      <div className="mb-2 flex items-center gap-2">
        <span className={`grid h-7 w-7 place-items-center rounded-lg ${c}`}>{icon}</span>
        <span className="text-sm font-semibold text-ink">{title}</span>
      </div>
      <ul className="space-y-1 text-xs text-ink-2">
        {items.map((i) => <li key={i}>• {i}</li>)}
      </ul>
    </div>
  );
}

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
    <Card className={`relative p-6 text-left ${destaque ? "border-primary shadow-elevated" : ""}`}>
      {destaque && (
        <span className="absolute -top-3 left-6 rounded-full gradient-cta px-3 py-0.5 text-xs font-bold text-white">
          Mais escolhido
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
