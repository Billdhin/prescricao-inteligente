import * as React from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  Star,
  Repeat2,
  Navigation,
  CheckCircle2,
  ShieldAlert,
  AlertTriangle,
  Lightbulb,
  Info,
  Lock,
  ArrowRight,
} from "lucide-react";
import { Card, Pill, ScoreRing, StatBar, buttonClasses, type PillTone } from "@/components/ui/primitives";
import { Tabs, Accordion } from "@/components/ui/disclosure";
import { VisualCompareSlider } from "@/components/movement-lab/VisualCompareSlider";
import { BiomechanicsComparisonSlider } from "@/components/movement-lab/BiomechanicsComparisonSlider";
import { MuscleMap, activationFromExercise } from "@/components/anatomy/MuscleMap";
import { BaseCientifica } from "@/components/movement-lab/BaseCientifica";
import { analysisOverlays } from "@/data/analysis-overlays";
import { muscleRegions } from "@/data/muscle-regions";
import { ExecutionScene, AnalysisScene } from "@/data/scenes";
import { getExercise, exercises } from "@/data/exercises";
import type { Exercise, TrustLevel, HotspotCamadas } from "@/data/types";
import { useUser, useFavorites, useProgress, isPremiumUnlocked } from "@/lib/store";
import { cn, withBase } from "@/lib/utils";

const trustTone: Record<TrustLevel, PillTone> = {
  "princípio biomecânico": "analysis",
  "tendência prática": "primary",
  "regra pedagógica": "success",
  "cuidado de segurança": "warning",
  "depende do contexto": "neutral",
};

function TrustBadge({ level }: { level: TrustLevel }) {
  return (
    <Pill tone={trustTone[level]} icon={<Info className="h-3 w-3" />}>
      {level}
    </Pill>
  );
}

function qualitativo(score: number) {
  if (score >= 85) return "Muito bom";
  if (score >= 70) return "Bom";
  if (score >= 50) return "Regular";
  return "Baixo";
}

export function MovementLabDetail() {
  const { slug = "" } = useParams();
  const exercise = getExercise(slug);

  if (!exercise) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card className="p-10 text-center">
          <h1 className="font-display text-2xl font-bold text-ink">Exercício não encontrado</h1>
          <p className="mt-2 text-ink-2">Verifique o link ou volte para a lista.</p>
          <Link to="/movement-lab" className={buttonClasses("secondary") + " mt-4"}>
            Voltar ao Laboratório
          </Link>
        </Card>
      </div>
    );
  }

  return <Detail exercise={exercise} />;
}

function Detail({ exercise }: { exercise: Exercise }) {
  const plan = useUser((s) => s.plan);
  const locked = exercise.premium && !isPremiumUnlocked(plan);
  const overlay = analysisOverlays[exercise.slug];
  const regions = muscleRegions[exercise.slug];
  const favSlugs = useFavorites((s) => s.slugs);
  const toggleFav = useFavorites((s) => s.toggle);
  const addActivity = useProgress((s) => s.addActivity);
  const isFav = favSlugs.includes(exercise.slug);

  const onFav = () => {
    toggleFav(exercise.slug);
    if (!isFav) addActivity(`Favoritou ${exercise.nome}`);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header enxuto */}
      <div>
        <Link
          to="/movement-lab"
          className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-ink-2 hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-3xl font-bold text-ink md:text-4xl">{exercise.nome}</h1>
          {exercise.premium ? (
            <Pill tone="cta" icon={<Sparkles className="h-3 w-3" />}>
              Premium
            </Pill>
          ) : (
            <Pill tone="success">Gratuito</Pill>
          )}
        </div>
        <p className="mt-2 max-w-2xl text-ink-2">
          Compare a execução real com a análise biomecânica — e aprofunde o que quiser.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            onClick={onFav}
            aria-pressed={isFav}
            className={cn(buttonClasses(isFav ? "primary" : "outline"))}
          >
            <Star className={cn("h-4 w-4", isFav && "fill-current")} />
            {isFav ? "Favorito salvo" : "Salvar favorito"}
          </button>
          <Link to={`/comparador?base=${exercise.slug}`} className={buttonClasses("outline")}>
            <Repeat2 className="h-4 w-4" /> Comparar
          </Link>
          <Link to="/gps" className={buttonClasses("outline")}>
            <Navigation className="h-4 w-4" /> Usar no GPS
          </Link>
        </div>
      </div>

      {/* HERO: execução × análise + Índice de Eficiência (a âncora) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <div className="relative">
            <div className={cn(locked && "pointer-events-none blur-[6px] saturate-50")}>
              {exercise.imagem && exercise.imagemAnalise ? (
                <BiomechanicsComparisonSlider
                  baseSrc={withBase(exercise.imagem)}
                  analysisSrc={withBase(exercise.imagemAnalise)}
                  alt={`Execução: ${exercise.nome}`}
                  regions={regions ?? []}
                  ativacao={exercise.ativacao}
                  overlay={overlay}
                />
              ) : (
                <VisualCompareSlider
                  before={<ExecutionScene />}
                  after={<AnalysisScene angle={exercise.anguloArticular} />}
                />
              )}
            </div>
            {locked && <LockedOverlay />}
          </div>

          <p className="px-1 text-xs text-ink-3">
            Arraste o divisor: a análise é revelada sobre a <span className="font-semibold text-ink-2">mesma imagem</span> —
            músculos em foco, ângulo articular e linha de força.
          </p>
        </div>

        {/* Índice de eficiência — âncora */}
        <Card variant="raised" className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-ink">Índice de Eficiência</h2>
            <TrustBadge level={exercise.trustLevel} />
          </div>
          <div className="mt-4 flex items-center gap-5">
            <ScoreRing value={exercise.indiceEficiencia.score} size={112} />
            <div>
              <div className="text-xs uppercase tracking-wider text-ink-3">Avaliação geral</div>
              <div className="font-display text-xl font-bold text-ink">
                {qualitativo(exercise.indiceEficiencia.score)}
              </div>
              <div className="text-xs text-ink-2">
                {exercise.indiceEficiencia.score}/100 · {exercise.grupoMuscular}
              </div>
            </div>
          </div>
          <div className="mt-5 space-y-2.5">
            {exercise.indiceEficiencia.metrics.map((m) => (
              <StatBar
                key={m.nome}
                label={m.nome}
                value={m.valor}
                tone={m.tipo === "positivo" ? "primary" : "cta"}
              />
            ))}
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-ink-3">
            Índices relativos estimados da literatura de EMG/biomecânica — comparam exercícios, não
            medem o aluno. Fontes na aba <span className="font-semibold text-ink-2">Biomecânica</span>.
          </p>
          <div className="mt-5 border-t border-border pt-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-3">Resumo prático</div>
            <p className="mt-1 text-sm text-ink">{exercise.resumoPratico}</p>
          </div>
          <div className="mt-4 flex gap-3 rounded-xl bg-primary-tint p-3">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-sm text-ink">
              <span className="font-semibold">Dica: </span>
              priorize a fase excêntrica com cadência controlada — em geral favorece o aprendizado
              técnico antes de progredir carga.
            </p>
          </div>
        </Card>
      </div>

      {/* Análise do movimento — tudo o mais recolhido em abas (aprofundar sob demanda) */}
      <Card className="p-4 md:p-6">
        <Tabs
          items={[
            {
              id: "visao",
              label: "Visão geral",
              content: (
                <div className="space-y-5">
                  <Concept text={exercise.conteudo.visaoGeral} ex={exercise} trust={exercise.trustLevel} showHotspots />
                  <QuandoUsarEvitar ex={exercise} />
                </div>
              ),
            },
            {
              id: "bio",
              label: "Biomecânica",
              content: (
                <div className="space-y-5">
                  <Concept text={exercise.conteudo.biomecanica} ex={exercise} trust="princípio biomecânico" />
                  <Timeline ex={exercise} />
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <h4 className="font-display font-bold text-ink">Mapa muscular</h4>
                      <Pill tone="analysis" icon={<Info className="h-3 w-3" />}>
                        ativação relativa estimada
                      </Pill>
                    </div>
                    <p className="mb-2 text-xs text-ink-3">
                      Ênfase relativa entre músculos, sintetizada da literatura de EMG e biomecânica
                      (fontes abaixo) — não é medição do aluno.
                    </p>
                    <MuscleMap activation={activationFromExercise(exercise)} />
                  </div>
                  <BaseCientifica slug={exercise.slug} contexto="ativacao" />
                </div>
              ),
            },
            {
              id: "fis",
              label: "Fisiologia aplicada",
              content: (
                <div className="space-y-5">
                  <Concept text={exercise.conteudo.fisiologia} ex={exercise} trust="tendência prática" />
                  <BaseCientifica slug={exercise.slug} contexto="ativacao" />
                </div>
              ),
            },
            { id: "erros", label: "Erros comuns", content: <Bullets items={exercise.blocos.errosComuns} trust="cuidado de segurança" tone="warning" /> },
            { id: "var", label: "Variações", content: <Bullets items={exercise.blocos.variacoes} trust="regra pedagógica" tone="primary" /> },
            { id: "pres", label: "Prescrição prática", content: <Concept text={exercise.conteudo.prescricaoPratica} ex={exercise} trust="depende do contexto" /> },
            { id: "comp", label: "Comparar", content: <Comparador exercise={exercise} /> },
          ]}
        />
      </Card>

      <p className="pt-2 text-xs text-ink-3">
        Conteúdo educacional — não substitui avaliação profissional individualizada nem prescrição
        clínica.
      </p>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn("h-3 w-3 rounded-full", swatch)} />
      <span className="text-ink-2">{label}</span>
    </div>
  );
}

function LockedOverlay() {
  return (
    <div className="absolute inset-0 z-40 grid place-items-center rounded-card bg-white/70 p-6 text-center backdrop-blur-sm">
      <div>
        <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full gradient-brand text-white shadow-elevated">
          <Lock className="h-5 w-5" />
        </span>
        <div className="font-display text-lg font-bold text-ink">Recurso do plano Profissional</div>
        <p className="mx-auto mt-1 max-w-sm text-sm text-ink-2">
          A análise biomecânica completa deste movimento está disponível para assinantes.
        </p>
        <Link to="/pricing" className={buttonClasses("primary") + " mt-4"}>
          Ver plano
        </Link>
      </div>
    </div>
  );
}

/* Timeline do movimento (compacta, dentro da aba Biomecânica) */
function Timeline({ ex }: { ex: Exercise }) {
  const [phase, setPhase] = React.useState(0);
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <h4 className="font-display font-bold text-ink">Timeline do movimento</h4>
        <Pill tone="neutral">{ex.fases.length} fases</Pill>
      </div>
      <ol className="flex flex-wrap items-center gap-2">
        {ex.fases.map((f, i) => {
          const active = i === phase;
          return (
            <li key={f.nome} className="flex items-center gap-2">
              <button
                onClick={() => setPhase(i)}
                aria-pressed={active}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors",
                  active
                    ? "border-primary bg-primary-tint text-primary"
                    : "border-border bg-surface text-ink-2 hover:bg-surface-soft",
                )}
              >
                <span
                  className={cn(
                    "tabular grid h-5 w-5 place-items-center rounded-full text-[11px]",
                    active ? "bg-primary text-white" : "bg-surface-soft",
                  )}
                >
                  {i + 1}
                </span>
                {f.nome}
              </button>
              {i < ex.fases.length - 1 && <ArrowRight className="h-4 w-4 text-ink-3" />}
            </li>
          );
        })}
      </ol>
      <p className="mt-3 rounded-xl border border-border bg-surface-soft p-3 text-sm text-ink">
        <span className="font-semibold">{ex.fases[phase].nome}: </span>
        {ex.fases[phase].descricao}
      </p>
    </div>
  );
}

/* Quando usar / Quando evitar (dentro da aba Visão geral) */
function QuandoUsarEvitar({ ex }: { ex: Exercise }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <ListaBloco
        title="Quando usar"
        icon={<CheckCircle2 className="h-4 w-4" />}
        items={ex.blocos.quandoUsar}
        iconClass="bg-[#e7f8ed] text-success"
        dot="bg-success"
      />
      <ListaBloco
        title="Quando evitar"
        icon={<ShieldAlert className="h-4 w-4" />}
        items={ex.blocos.quandoEvitar}
        iconClass="bg-[#fff1e6] text-[color:var(--cta-text)]"
        dot="bg-cta"
      />
    </div>
  );
}

function ListaBloco({
  title,
  icon,
  items,
  iconClass,
  dot,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  iconClass: string;
  dot: string;
}) {
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className={cn("grid h-8 w-8 place-items-center rounded-lg", iconClass)}>{icon}</span>
        <h4 className="font-display text-base font-bold text-ink">{title}</h4>
      </div>
      <ul className="space-y-2 text-sm text-ink">
        {items.map((it) => (
          <li key={it} className="flex gap-2">
            <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", dot)} />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const CAMADAS: { key: keyof HotspotCamadas; label: string }[] = [
  { key: "resumo", label: "Resumo" },
  { key: "biomecanica", label: "Biomecânica" },
  { key: "fisiologia", label: "Fisiologia" },
  { key: "evidencia", label: "Evidência" },
  { key: "cuidados", label: "Cuidados" },
];

function Concept({
  text,
  ex,
  trust,
  showHotspots,
}: {
  text: string;
  ex: Exercise;
  trust: TrustLevel;
  showHotspots?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="max-w-3xl text-ink">{text}</p>
        <TrustBadge level={trust} />
      </div>
      {showHotspots && ex.hotspots.length > 0 && (
        <>
          <div className="text-xs font-semibold uppercase tracking-wider text-ink-3">
            Aprofundar por ponto de análise
          </div>
          <Accordion
            items={ex.hotspots.map((h) => ({
              id: h.id,
              title: h.titulo,
              content: (
                <div className="space-y-2">
                  {CAMADAS.map((c, i) => (
                    <div key={c.key} className="rounded-lg border border-border bg-surface-soft p-3">
                      <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
                        <span className="tabular grid h-4 w-4 place-items-center rounded-full bg-primary text-[10px] text-white">
                          {i + 1}
                        </span>
                        {c.label}
                      </div>
                      <p className="text-sm text-ink">{h.camadas[c.key]}</p>
                    </div>
                  ))}
                </div>
              ),
            }))}
          />
        </>
      )}
    </div>
  );
}

function Bullets({
  items,
  trust,
  tone,
}: {
  items: string[];
  trust: TrustLevel;
  tone: "warning" | "primary";
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <TrustBadge level={trust} />
      </div>
      <ul className="grid gap-2 md:grid-cols-2">
        {items.map((it) => (
          <li key={it} className="flex gap-2 rounded-xl border border-border bg-surface p-3 text-sm text-ink">
            <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", tone === "warning" ? "bg-warning" : "bg-primary")} />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Comparador({ exercise }: { exercise: Exercise }) {
  const candidatos = exercises.filter((e) => e.slug !== exercise.slug);
  const inicial =
    candidatos.find((e) => e.grupoMuscular === exercise.grupoMuscular) ?? candidatos[0];
  const [otherSlug, setOtherSlug] = React.useState(inicial.slug);
  const other = exercises.find((e) => e.slug === otherSlug) ?? inicial;
  const metricPair = (nome: string, fallback = 50) => ({
    a: exercise.indiceEficiencia.metrics.find((m) => m.nome === nome)?.valor ?? fallback,
    b: other.indiceEficiencia.metrics.find((m) => m.nome === nome)?.valor ?? fallback,
  });
  const rows = [
    { label: "Ativação primária", ...({ a: exercise.ativacao[0]?.percentual ?? 0, b: other.ativacao[0]?.percentual ?? 0 }) },
    { label: "Índice de eficiência", a: exercise.indiceEficiencia.score, b: other.indiceEficiencia.score },
    { label: "Complexidade técnica", ...metricPair("Complexidade técnica") },
  ];
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-sm">
        <span className="min-w-0 flex-1 truncate font-semibold text-primary">{exercise.nome}</span>
        <span className="rounded-full bg-surface-soft px-2 py-0.5 text-xs font-bold text-ink-2">VS</span>
        <label className="min-w-0 flex-1">
          <span className="sr-only">Comparar com</span>
          <select
            value={otherSlug}
            onChange={(e) => setOtherSlug(e.target.value)}
            className="h-9 w-full rounded-control border border-border bg-surface px-2 text-sm font-semibold text-analysis outline-none focus-visible:border-primary"
          >
            {candidatos.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.nome}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="space-y-4">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="mb-1 flex justify-between text-xs text-ink-2">
              <span>{r.label}</span>
              <span className="tabular font-semibold text-ink">
                {r.a} · {r.b}
              </span>
            </div>
            {/* sem repetir os nomes por linha: o cabeçalho já mapeia cor → exercício
                (azul = exercício atual, ciano = comparado) */}
            <StatBar srLabel={exercise.nome} value={r.a} tone="primary" />
            <div className="h-1" />
            <StatBar srLabel={other.nome} value={r.b} tone="analysis" />
          </div>
        ))}
      </div>
      <Link
        to={`/comparador?base=${exercise.slug}`}
        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
      >
        Comparar até 3 no comparador completo <ArrowRight className="h-3.5 w-3.5" />
      </Link>
      <p className="mt-3 text-[11px] leading-relaxed text-ink-3">
        Valores relativos estimados da literatura de EMG/biomecânica — comparam exercícios, não
        medem o aluno. Fontes na aba Biomecânica de cada exercício.
      </p>
    </div>
  );
}
