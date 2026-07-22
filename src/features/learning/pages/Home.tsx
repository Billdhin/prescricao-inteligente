import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Search,
  Stethoscope,
  PlayCircle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  BookMarked,
  Sparkles,
} from "lucide-react";
import { Card, Pill, buttonClasses } from "@/components/ui/primitives";
import { useUser } from "@/lib/store";
import { cn } from "@/lib/utils";
import { getLearningRepository } from "../repository";
import { useAprender } from "../store";
import { studyObjectives } from "../mocks";
import { KnowledgeMap } from "../components/KnowledgeMap";
import {
  DisciplineCard,
  RecommendationCard,
  StudyObjectiveCard,
} from "../components/shared";
import { useDisciplineStat } from "../progress";

const repo = getLearningRepository();

const SUGESTOES = [
  "Por que o joelho avança no agachamento?",
  "Leg press ou agachamento?",
  "O que limita o VO2máx?",
  "Como adaptar o treino para hipertensão?",
  "O que significa insuficiência ativa?",
  "Como interpretar a dor durante o exercício?",
];

export function AprenderHome() {
  const name = useUser((s) => s.name);
  const firstName = name.split(" ")[0] || "Rafael";
  const consultMode = useAprender((s) => s.consultMode);
  const setConsultMode = useAprender((s) => s.setConsultMode);
  const lessonsState = useAprender((s) => s.lessons);
  const casesState = useAprender((s) => s.cases);

  const disciplines = repo.getDisciplines();
  const featured = disciplines.filter((d) => d.featured).slice(0, 6);
  const recommendations = repo.getRecommendations();

  // Indicadores compactos (progresso profissional, não gamificação)
  const mecanismos = Object.values(lessonsState).filter((v) => v.status === "concluido").length;
  const casos = Object.values(casesState).filter((c) => c.status === "concluido").length;

  const continuar = useContinuar();

  const acoes: React.ReactNode[] = [
    <ContinuarCard key="cont" continuar={continuar} />,
    <DecisaoDoDia key="dec" />,
    <ConsultaCard key="cons" />,
  ];
  if (consultMode === "consultar") acoes.reverse();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* 7.1 Cabeçalho */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Pill tone="primary" icon={<GraduationCap className="h-3 w-3" />} className="mb-3">
            Profissional · Aprender
          </Pill>
          <h1 className="font-display text-3xl font-bold text-ink md:text-4xl">Olá, {firstName}</h1>
          <p className="mt-2 max-w-xl text-ink-2">
            Entenda os mecanismos. Compare possibilidades. Prescreva com justificativa.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <div className="text-xs text-ink-3">Seu desenvolvimento</div>
            <div className="tabular text-sm font-semibold text-ink">
              {mecanismos} mecanismos · {casos} casos
            </div>
          </div>
          <Link to="/aprender/casos" className={buttonClasses("primary")}>
            <Stethoscope className="h-4 w-4" /> Resolver um caso
          </Link>
        </div>
      </div>

      {/* 7.2 Busca contextual + 19 seletor de modo */}
      <ContextualSearch mode={consultMode} onMode={setConsultMode} />

      {/* 7.3 Ações imediatas */}
      <div className="grid gap-4 md:grid-cols-3">{acoes}</div>

      {/* 7.4 Mapa das Ciências da Prescrição */}
      <section>
        <SectionTitle
          title="Mapa das Ciências da Prescrição"
          subtitle="Veja como as diferentes áreas se conectam a uma decisão profissional."
          action={{ label: "Explorar o mapa", href: "/aprender/mapa" }}
        />
        <KnowledgeMap compact />
      </section>

      {/* 7.5 Recomendado pelos atendimentos */}
      <section>
        <SectionTitle
          title="Recomendado pelos seus atendimentos"
          subtitle="Conteúdos relacionados aos perfis e situações que você acompanha."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recommendations.slice(0, 6).map((r) => (
            <RecommendationCard key={r.id} rec={r} />
          ))}
        </div>
      </section>

      {/* 7.6 Estudar por objetivo */}
      <section>
        <SectionTitle title="Estudar por objetivo" subtitle="Comece pelo que você precisa resolver agora." />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {studyObjectives.map((o) => (
            <StudyObjectiveCard key={o.id} obj={o} />
          ))}
        </div>
      </section>

      {/* 7.7 Disciplinas em destaque */}
      <section>
        <SectionTitle
          title="Disciplinas em destaque"
          subtitle="A base científica que sustenta suas decisões."
          action={{ label: "Ver todas as disciplinas", href: "/aprender/disciplinas" }}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((d) => (
            <FeaturedDisciplineCard key={d.id} slug={d.slug} />
          ))}
        </div>
      </section>
    </div>
  );
}

/* --------------------------- helpers de progresso --------------------------- */

function useContinuar() {
  const history = useAprender((s) => s.history);
  const last = history.find((h) => h.type === "conteudo");
  return last;
}

/* -------------------------------- sub-UI --------------------------------- */

function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 className="font-display text-xl font-bold text-ink">{title}</h2>
        {subtitle && <p className="text-sm text-ink-2">{subtitle}</p>}
      </div>
      {action && (
        <Link to={action.href} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
          {action.label} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

function ContextualSearch({ mode, onMode }: { mode: "estudar" | "consultar"; onMode: (m: "estudar" | "consultar") => void }) {
  const navigate = useNavigate();
  const [q, setQ] = React.useState("");
  const [focus, setFocus] = React.useState(false);
  const history = useAprender((s) => s.searchHistory);
  const pushSearch = useAprender((s) => s.pushSearch);

  const go = (text: string) => {
    const t = text.trim();
    if (!t) return;
    pushSearch(t);
    navigate(`/consultar?q=${encodeURIComponent(t)}`);
  };

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="inline-flex rounded-xl bg-surface-soft p-1" role="group" aria-label="Modo de uso">
          {(["estudar", "consultar"] as const).map((m) => (
            <button
              key={m}
              aria-pressed={mode === m}
              onClick={() => onMode(m)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
                mode === m ? "bg-surface text-ink shadow-soft" : "text-ink-2 hover:text-ink",
              )}
            >
              {m === "estudar" ? "Estudar" : "Consultar rapidamente"}
            </button>
          ))}
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(q);
        }}
        className="relative"
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setTimeout(() => setFocus(false), 150)}
          placeholder="Busque uma dúvida, conceito, exercício, condição ou decisão..."
          aria-label="Busca contextual do Aprender"
          className="input pl-9"
        />
      </form>
      {(focus || !q) && (
        <div className="mt-3">
          {history.length > 0 && (
            <div className="mb-2">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-3">Buscas recentes</div>
              <div className="flex flex-wrap gap-1.5">
                {history.slice(0, 5).map((h) => (
                  <button key={h} onMouseDown={() => go(h)} className="rounded-full border border-border px-2.5 py-1 text-xs text-ink-2 hover:bg-surface-soft">
                    {h}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-3">Perguntas populares</div>
          <div className="flex flex-wrap gap-1.5">
            {SUGESTOES.map((s) => (
              <button key={s} onMouseDown={() => go(s)} className="rounded-full bg-surface-soft px-2.5 py-1 text-xs text-ink-2 hover:bg-primary-tint hover:text-primary">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function ContinuarCard({ continuar }: { continuar?: { title: string; href: string } }) {
  const alvo = continuar ?? { title: "Por que o joelho ultrapassar a ponta do pé não é um erro?", href: "/aprender/conteudos/por-que-joelho-ultrapassa-o-pe" };
  // Subtítulo = disciplina real da aula retomada (antes ficava fixo em Biomecânica).
  const slug = alvo.href.split("/").pop() || "";
  const lessonRef = repo.getLesson(slug);
  const disc = lessonRef ? repo.getDiscipline(lessonRef.disciplineSlug) : undefined;
  const sub = disc?.shortTitle ?? disc?.title ?? "Conteúdo do Aprender";
  return (
    <Card className="flex flex-col p-5">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
        <PlayCircle className="h-3.5 w-3.5" /> Continuar estudando
      </div>
      <div className="font-display font-bold text-ink">{alvo.title}</div>
      <div className="mt-1 text-sm text-ink-2">{sub}</div>
      <Link to={alvo.href} className={cn(buttonClasses("secondary", "sm"), "mt-3 self-start")}>
        Continuar <ArrowRight className="h-4 w-4" />
      </Link>
    </Card>
  );
}

function DecisaoDoDia() {
  const [resp, setResp] = React.useState<null | boolean>(null);
  return (
    <Card tone="primary" className="flex flex-col p-5">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
        <Sparkles className="h-3.5 w-3.5" /> Decisão do dia
      </div>
      <p className="text-sm text-ink">
        Você reduziria a amplitude do agachamento de um aluno com dor anterior no joelho por padrão?
      </p>
      {resp == null ? (
        <div className="mt-3 flex gap-2">
          <button onClick={() => setResp(true)} className={buttonClasses("secondary", "sm")}>Reduziria</button>
          <button onClick={() => setResp(false)} className={buttonClasses("secondary", "sm")}>Depende</button>
        </div>
      ) : (
        <div className="mt-3 rounded-xl bg-surface p-3 text-sm text-ink-2">
          {resp ? (
            <span className="flex items-start gap-1.5"><XCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" /> Reduzir por padrão retira estímulo sem necessidade. A amplitude depende da tolerância e do objetivo.</span>
          ) : (
            <span className="flex items-start gap-1.5"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> Isso mesmo. A decisão depende da tolerância, da execução e do objetivo, não de uma regra fixa.</span>
          )}
          <Link to="/aprender/conteudos/por-que-joelho-ultrapassa-o-pe" className="mt-2 inline-block font-semibold text-primary hover:underline">
            Entender o mecanismo
          </Link>
        </div>
      )}
    </Card>
  );
}

function ConsultaCard() {
  return (
    <Card className="flex flex-col p-5">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-analysis">
        <BookMarked className="h-3.5 w-3.5" /> Consulta rápida
      </div>
      <p className="text-sm text-ink-2">Encontre uma explicação visual para aplicar no atendimento.</p>
      <Link to="/consultar" className={cn(buttonClasses("secondary", "sm"), "mt-auto self-start pt-3")}>
        Pesquisar <Search className="h-4 w-4" />
      </Link>
    </Card>
  );
}

function FeaturedDisciplineCard({ slug }: { slug: string }) {
  const disc = repo.getDiscipline(slug)!;
  const stat = useDisciplineStat(disc);
  return <DisciplineCard disc={disc} progress={stat.progress} status={stat.status} />;
}

