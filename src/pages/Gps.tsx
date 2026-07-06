import * as React from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  Navigation,
  ArrowRight,
  ArrowLeft,
  Info,
  Lock,
  Sparkles,
  Crown,
  X,
  Check,
  Plus,
  UserCheck,
  Save,
} from "lucide-react";
import { Card, Pill, ScoreRing, StatBar, buttonClasses, Progress } from "@/components/ui/primitives";
import {
  rankExercises,
  OBJETIVOS,
  GRUPOS_MUSCULARES,
  RESTRICOES,
  EQUIPAMENTOS,
  type GpsAnswers,
  type Recommendation,
} from "@/lib/gps/engine";
import { exercises } from "@/data/exercises";
import type { Nivel } from "@/data/types";
import {
  useUser,
  useGps,
  useProgress,
  useAlunos,
  isPremiumUnlocked,
  FREE_GPS_LIMIT,
  uid,
} from "@/lib/store";
import { cn } from "@/lib/utils";

const NIVEIS: Nivel[] = ["Iniciante", "Intermediário", "Avançado"];

const STEP_LABELS = [
  "Qual é o objetivo?",
  "Qual grupo/músculo-alvo?",
  "Qual o nível?",
  "Alguma restrição?",
  "Equipamentos disponíveis",
];

export function Gps() {
  const plan = useUser((s) => s.plan);
  const unlocked = isPremiumUnlocked(plan);
  const { consultations, increment, reset } = useGps();
  const addActivity = useProgress((s) => s.addActivity);

  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<GpsAnswers>({
    objetivo: "Hipertrofia",
    grupoMuscular: "Membros inferiores",
    nivel: "Iniciante",
    restricao: "Nenhuma",
    equipamentos: [...EQUIPAMENTOS],
  });
  const [results, setResults] = React.useState<Recommendation[] | null>(null);
  const [justify, setJustify] = React.useState<Recommendation | null>(null);
  const [compare, setCompare] = React.useState<string[]>([]);

  // Prescrever para um aluno: pré-preenche o perfil e permite salvar no aluno.
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { alunos, addPrescricao } = useAlunos();
  const alunoId = params.get("aluno");
  const aluno = alunoId ? alunos.find((a) => a.id === alunoId) : undefined;

  React.useEffect(() => {
    if (!aluno) return;
    setAnswers((a) => ({
      ...a,
      objetivo: aluno.objetivo,
      nivel: aluno.nivel,
      restricao: aluno.restricoes[0] ?? "Nenhuma",
      equipamentos: aluno.equipamentos.length ? aluno.equipamentos : a.equipamentos,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aluno?.id]);

  const salvarPrescricao = () => {
    if (!aluno || !results) return;
    addPrescricao({
      id: uid(),
      alunoId: aluno.id,
      data: Date.now(),
      titulo: `${answers.objetivo} · ${answers.grupoMuscular}`,
      answers,
      itens: results.slice(0, 3).map((r) => ({ slug: r.exercise.slug, score: r.score })),
      status: "ativa",
    });
    navigate(`/alunos/${aluno.id}`);
  };

  const restantes = Math.max(0, FREE_GPS_LIMIT - consultations);
  const bloqueado = !unlocked && restantes <= 0;

  const gerar = () => {
    if (bloqueado) return;
    if (!unlocked) increment();
    addActivity(`Consulta ao GPS: ${answers.grupoMuscular}`);
    const rank = rankExercises(exercises, answers);
    setResults(rank);
    setCompare([rank[0].exercise.slug]);
  };

  const refazer = () => {
    setResults(null);
    setStep(0);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Pill tone="primary" icon={<Navigation className="h-3 w-3" />} className="mb-3">
            Assistente de decisão
          </Pill>
          <h1 className="font-display text-3xl font-bold text-ink md:text-4xl">GPS da Prescrição</h1>
          <p className="mt-2 max-w-2xl text-ink-2">
            Responda 5 perguntas rápidas e receba recomendações de exercícios ranqueadas por
            critérios transparentes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unlocked ? (
            <Pill tone="success" icon={<Crown className="h-3 w-3" />}>
              Análises ilimitadas
            </Pill>
          ) : (
            <Pill tone={restantes > 0 ? "primary" : "warning"}>
              {restantes} de {FREE_GPS_LIMIT} análises gratuitas restantes
            </Pill>
          )}
          <button onClick={reset} className="text-sm font-medium text-ink-2 hover:text-ink">
            Zerar contador
          </button>
        </div>
      </div>

      {aluno && (
        <Card className="flex flex-wrap items-center gap-3 border-primary/30 bg-primary-tint/40 p-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full gradient-brand text-sm font-bold text-white">
            {aluno.iniciais}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-ink">
              <UserCheck className="h-4 w-4 text-primary" /> Prescrevendo para {aluno.nome}
            </div>
            <p className="text-xs text-ink-2">
              Perfil pré-preenchido ({aluno.objetivo} · {aluno.nivel}
              {aluno.restricoes.length ? ` · ${aluno.restricoes.join(", ")}` : ""}). Escolha o
              grupo-alvo e gere as opções.
            </p>
          </div>
          <Link to={`/alunos/${aluno.id}`} className="ml-auto text-sm font-medium text-ink-2 hover:text-ink">
            Ver aluno
          </Link>
        </Card>
      )}

      {bloqueado ? (
        <Paywall />
      ) : !results ? (
        <Wizard
          step={step}
          setStep={setStep}
          answers={answers}
          setAnswers={setAnswers}
          onFinish={gerar}
        />
      ) : (
        <Results
          answers={answers}
          results={results}
          onRefazer={refazer}
          onJustify={setJustify}
          compare={compare}
          setCompare={setCompare}
          alunoNome={aluno?.nome}
          onSalvar={aluno ? salvarPrescricao : undefined}
        />
      )}

      {justify && <JustifyDialog rec={justify} onClose={() => setJustify(null)} />}

      <p className="pt-2 text-xs text-ink-3">
        Conteúdo educacional — não substitui avaliação profissional individualizada nem prescrição
        clínica.
      </p>
    </div>
  );
}

/* --------------------------------- Wizard -------------------------------- */

function Wizard({
  step,
  setStep,
  answers,
  setAnswers,
  onFinish,
}: {
  step: number;
  setStep: (n: number) => void;
  answers: GpsAnswers;
  setAnswers: React.Dispatch<React.SetStateAction<GpsAnswers>>;
  onFinish: () => void;
}) {
  const pct = Math.round(((step + 1) / 5) * 100);
  const last = step === 4;

  return (
    <Card className="p-6 md:p-8">
      <div className="mb-1 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-ink-3">
        <span>Etapa {step + 1} de 5</span>
        <span className="tabular">{pct}%</span>
      </div>
      <Progress value={pct} className="mb-6" />

      <h2 className="font-display text-2xl font-bold text-ink">{STEP_LABELS[step]}</h2>
      <p className="mt-1 text-sm text-ink-2">
        Respostas educacionais para ajudar na tomada de decisão — não substituem avaliação
        individualizada.
      </p>

      <div className="mt-6">
        {step === 0 && (
          <Choices
            options={OBJETIVOS}
            value={answers.objetivo}
            onChange={(v) => setAnswers((a) => ({ ...a, objetivo: v as GpsAnswers["objetivo"] }))}
          />
        )}
        {step === 1 && (
          <Choices
            options={[...GRUPOS_MUSCULARES]}
            value={answers.grupoMuscular}
            onChange={(v) => setAnswers((a) => ({ ...a, grupoMuscular: v }))}
          />
        )}
        {step === 2 && (
          <Choices
            options={NIVEIS}
            value={answers.nivel}
            onChange={(v) => setAnswers((a) => ({ ...a, nivel: v as Nivel }))}
          />
        )}
        {step === 3 && (
          <Choices
            options={RESTRICOES}
            value={answers.restricao}
            onChange={(v) => setAnswers((a) => ({ ...a, restricao: v as GpsAnswers["restricao"] }))}
          />
        )}
        {step === 4 && (
          <MultiChoices
            options={[...EQUIPAMENTOS]}
            values={answers.equipamentos}
            onToggle={(v) =>
              setAnswers((a) => ({
                ...a,
                equipamentos: a.equipamentos.includes(v)
                  ? a.equipamentos.filter((x) => x !== v)
                  : [...a.equipamentos, v],
              }))
            }
          />
        )}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className={buttonClasses("ghost")}
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        {last ? (
          <button
            onClick={onFinish}
            disabled={answers.equipamentos.length === 0}
            className={buttonClasses("primary")}
          >
            <Sparkles className="h-4 w-4" /> Ver recomendações
          </button>
        ) : (
          <button onClick={() => setStep(step + 1)} className={buttonClasses("primary")}>
            Próximo <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </Card>
  );
}

function Choices({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((o) => {
        const selected = o === value;
        return (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={cn(
              "flex items-center gap-3 rounded-control border px-4 py-3.5 text-left text-sm font-medium transition-colors",
              selected
                ? "border-primary bg-primary-tint text-primary"
                : "border-border bg-surface text-ink hover:bg-surface-soft",
            )}
          >
            <span
              className={cn(
                "grid h-4 w-4 shrink-0 place-items-center rounded-full border-2",
                selected ? "border-primary bg-primary text-white" : "border-ink-3",
              )}
            >
              {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
            </span>
            {o}
          </button>
        );
      })}
    </div>
  );
}

function MultiChoices({
  options,
  values,
  onToggle,
}: {
  options: string[];
  values: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((o) => {
        const selected = values.includes(o);
        return (
          <button
            key={o}
            onClick={() => onToggle(o)}
            className={cn(
              "flex items-center gap-3 rounded-control border px-4 py-3.5 text-left text-sm font-medium transition-colors",
              selected
                ? "border-primary bg-primary-tint text-primary"
                : "border-border bg-surface text-ink hover:bg-surface-soft",
            )}
          >
            <span
              className={cn(
                "grid h-5 w-5 shrink-0 place-items-center rounded-md border-2",
                selected ? "border-primary bg-primary text-white" : "border-ink-3",
              )}
            >
              {selected && <Check className="h-3.5 w-3.5" />}
            </span>
            {o}
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------- Results -------------------------------- */

function Results({
  answers,
  results,
  onRefazer,
  onJustify,
  compare,
  setCompare,
  alunoNome,
  onSalvar,
}: {
  answers: GpsAnswers;
  results: Recommendation[];
  onRefazer: () => void;
  onJustify: (r: Recommendation) => void;
  compare: string[];
  setCompare: React.Dispatch<React.SetStateAction<string[]>>;
  alunoNome?: string;
  onSalvar?: () => void;
}) {
  const best = results[0];
  const others = results.slice(1);
  const toggleCompare = (slug: string) =>
    setCompare((c) =>
      c.includes(slug) ? c.filter((x) => x !== slug) : c.length < 3 ? [...c, slug] : c,
    );

  return (
    <div className="space-y-6">
      {onSalvar && alunoNome && (
        <Card className="flex flex-wrap items-center gap-3 border-success/30 bg-[#e7f8ed]/50 p-4">
          <UserCheck className="h-5 w-5 shrink-0 text-success" />
          <div className="min-w-0">
            <div className="font-semibold text-ink">Prescrição para {alunoNome}</div>
            <p className="text-sm text-ink-2">
              Salva as 3 melhores opções no perfil do aluno, com o raciocínio por trás.
            </p>
          </div>
          <button onClick={onSalvar} className={cn(buttonClasses("primary"), "ml-auto")}>
            <Save className="h-4 w-4" /> Salvar prescrição
          </button>
        </Card>
      )}
      {/* Suas respostas */}
      <Card className="flex flex-wrap items-center gap-2 p-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-3">Suas respostas</span>
        <Pill tone="primary">{answers.objetivo}</Pill>
        <Pill tone="primary">{answers.grupoMuscular}</Pill>
        <Pill tone="neutral">{answers.nivel}</Pill>
        <Pill tone={answers.restricao === "Nenhuma" ? "success" : "warning"}>{answers.restricao}</Pill>
        <Pill tone="neutral">{answers.equipamentos.length} equipamentos</Pill>
        <button onClick={onRefazer} className="ml-auto text-sm font-medium text-ink-2 hover:text-ink">
          Refazer análise
        </button>
      </Card>

      {/* Melhor recomendação */}
      <Card className="overflow-hidden">
        <div className="gradient-brand px-5 py-2 text-xs font-bold uppercase tracking-wider text-white">
          <span className="inline-flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5" /> Melhor recomendação
          </span>
        </div>
        <div className="p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="flex flex-col items-center">
              <ScoreRing value={best.score} size={112} />
              <span className="mt-1 text-xs font-semibold text-ink-2">{best.score}% match</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-2xl font-bold text-ink">{best.exercise.nome}</h3>
                {best.exercise.premium ? <Pill tone="cta">Premium</Pill> : <Pill tone="success">Gratuito</Pill>}
              </div>
              <p className="mt-2 text-ink-2">{best.exercise.resumoPratico}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {best.reasons.map((r) => (
                  <Pill key={r} tone="primary">
                    {r}
                  </Pill>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => onJustify(best)} className={buttonClasses("outline", "sm")}>
                  <Info className="h-4 w-4" /> Ver justificativa
                </button>
                <Link to={`/movement-lab/${best.exercise.slug}`} className={buttonClasses("primary", "sm")}>
                  Ver no Laboratório Visual <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              {best.cautions.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {best.cautions.map((c) => (
                    <li key={c} className="flex gap-2 text-xs text-warning">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-warning" />
                      {c}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Outras opções */}
      <div>
        <h3 className="mb-3 font-display text-lg font-bold text-ink">Outras opções</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {others.map((r) => {
            const inCompare = compare.includes(r.exercise.slug);
            return (
              <Card key={r.exercise.slug} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-display font-bold text-ink">{r.exercise.nome}</h4>
                      {r.exercise.premium && <Pill tone="cta">Premium</Pill>}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      <Pill tone="neutral">{r.exercise.grupoMuscular}</Pill>
                      <Pill tone="neutral">{r.exercise.equipamento}</Pill>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="tabular font-display text-xl font-bold text-primary">{r.score}%</div>
                    <div className="text-[10px] uppercase text-ink-3">match</div>
                  </div>
                </div>
                <p className="mt-2 text-sm text-ink-2">Objetivo: {answers.objetivo}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button onClick={() => onJustify(r)} className="text-sm font-semibold text-primary hover:underline">
                    Justificativa
                  </button>
                  <button
                    onClick={() => toggleCompare(r.exercise.slug)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors",
                      inCompare
                        ? "border-primary bg-primary-tint text-primary"
                        : "border-border text-ink-2 hover:bg-surface-soft",
                    )}
                  >
                    {inCompare ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                    Comparar
                  </button>
                  <Link
                    to={`/movement-lab/${r.exercise.slug}`}
                    className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-ink-2 hover:text-ink"
                  >
                    Abrir <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <Comparador compare={compare} setCompare={setCompare} />
    </div>
  );
}

function Comparador({
  compare,
  setCompare,
}: {
  compare: string[];
  setCompare: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const selected = compare
    .map((slug) => exercises.find((e) => e.slug === slug))
    .filter(Boolean) as (typeof exercises)[number][];
  const metric = (ex: (typeof exercises)[number], nome: string, fb = 0) =>
    ex.indiceEficiencia.metrics.find((m) => m.nome === nome)?.valor ?? fb;

  const rows = [
    { label: "Ativação primária", get: (e: (typeof exercises)[number]) => e.ativacao[0]?.percentual ?? 0 },
    { label: "Índice de eficiência", get: (e: (typeof exercises)[number]) => e.indiceEficiencia.score },
    { label: "Demanda lombar", get: (e: (typeof exercises)[number]) => metric(e, "Demanda lombar", 20) },
    { label: "Complexidade técnica", get: (e: (typeof exercises)[number]) => metric(e, "Complexidade técnica", 30) },
  ];
  const tones = ["primary", "analysis", "cta"] as const;

  return (
    <Card className="p-6">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-ink">Comparador</h3>
        <span className="text-xs text-ink-3">{selected.length}/3 selecionados</span>
      </div>
      <p className="mb-4 text-sm text-ink-2">
        Selecione até 3 exercícios (botão “Comparar”) para ver os trade-offs lado a lado.
      </p>
      {selected.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-4 text-sm text-ink-3">
          Nenhum exercício selecionado ainda.
        </p>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {selected.map((e, i) => (
              <span
                key={e.slug}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                  i === 0 ? "bg-primary-tint text-primary" : i === 1 ? "bg-[#e0f7f9] text-analysis" : "bg-[#fff1e6] text-cta",
                )}
              >
                {e.nome}
                <button onClick={() => setCompare((c) => c.filter((x) => x !== e.slug))} aria-label="Remover">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="space-y-5">
            {rows.map((r) => (
              <div key={r.label}>
                <div className="mb-1 text-xs font-semibold text-ink-2">{r.label}</div>
                <div className="space-y-1.5">
                  {selected.map((e, i) => (
                    <StatBar key={e.slug} label={e.nome} value={r.get(e)} tone={tones[i]} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

/* ------------------------------ Justificativa ---------------------------- */

function JustifyDialog({ rec, onClose }: { rec: Recommendation; onClose: () => void }) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="max-h-[85vh] w-full max-w-lg overflow-auto rounded-card bg-surface p-5 shadow-elevated" onClick={(e) => e.stopPropagation()}>
        <div className="mb-1 flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-3">Justificativa</div>
            <h3 className="font-display text-lg font-bold text-ink">{rec.exercise.nome}</h3>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="rounded-md p-1 text-ink-3 hover:bg-surface-soft">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mb-3 text-sm text-ink-2">
          Match de {rec.score}%. Como cada critério pesou no ranqueamento:
        </p>
        <ul className="space-y-2">
          {rec.breakdown.map((b) => {
            const ratio = b.pontosPossiveis > 0 ? b.peso / b.pontosPossiveis : 0;
            const tone =
              b.peso < 0 ? "text-cta" : ratio >= 0.85 ? "text-success" : ratio >= 0.4 ? "text-ink" : "text-warning";
            return (
              <li key={b.criterio} className="rounded-lg border border-border bg-surface-soft p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-ink">{b.criterio}</span>
                  <span className={cn("tabular text-sm font-bold", tone)}>
                    {b.peso > 0 ? `+${b.peso.toFixed(1)}` : b.peso.toFixed(1)}
                    <span className="ml-1 text-xs font-medium text-ink-3">/ {b.pontosPossiveis.toFixed(1)} pts</span>
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink-2">{b.detalhe}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/* --------------------------------- Paywall ------------------------------- */

function Paywall() {
  return (
    <Card className="overflow-hidden">
      <div className="gradient-brand p-8 text-center text-white">
        <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white/15">
          <Lock className="h-6 w-6" />
        </span>
        <h2 className="font-display text-2xl font-bold">Você usou suas 3 análises gratuitas do GPS</h2>
        <p className="mx-auto mt-2 max-w-md text-white/85">
          Assine o plano Profissional para análises ilimitadas, comparador e todos os casos e
          exercícios.
        </p>
        <Link
          to="/pricing"
          className="mt-5 inline-flex rounded-control bg-white px-5 py-2.5 font-semibold text-primary hover:bg-white/90"
        >
          Assinar Profissional
        </Link>
        <p className="mt-3 text-xs text-white/70">
          (Dica de teste: troque o plano no menu do usuário ou use “Zerar contador”.)
        </p>
      </div>
    </Card>
  );
}
