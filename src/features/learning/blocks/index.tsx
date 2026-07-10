import * as React from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  ArrowRight,
  ArrowDown,
  Lightbulb,
  Target,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  XCircle,
  BookOpen,
  ExternalLink,
  Sparkles,
  GitCompare,
  Layers,
  Calculator as CalcIcon,
  Unlock,
} from "lucide-react";
import { Card, Pill, buttonClasses } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { getLearningRepository } from "../repository";
import { referenceSourceLabel, lessonTypeMeta } from "../constants";
import { iconByName } from "../icons";
import { useAprender } from "../store";
import type { Lesson, LessonBlock, QuizQuestion } from "../types";

const repo = getLearningRepository();

/* ------------------------------- Renderer ------------------------------- */

export function LessonRenderer({ lesson, onApply }: { lesson: Lesson; onApply: (summary: string) => void }) {
  const blocks = [...lesson.blocks].sort((a, b) => a.order - b.order);
  return (
    <div className="space-y-5">
      {blocks.map((blk) => (
        <BlockSwitch key={blk.id} block={blk} lesson={lesson} onApply={onApply} />
      ))}
    </div>
  );
}

function BlockSwitch({ block, lesson, onApply }: { block: LessonBlock; lesson: Lesson; onApply: (s: string) => void }) {
  const c = block.content as any;
  switch (block.type) {
    case "hero":
      return <HeroBlock kicker={c.kicker} text={c.text} />;
    case "prescription_question":
      return <PrescriptionQuestion question={c.question} cta={c.cta} />;
    case "short_text":
      return <ShortText title={block.title} variant={c.variant} text={c.text} items={c.items} />;
    case "key_concept":
      return <KeyConcept title={block.title} term={c.term} definition={c.definition} />;
    case "interactive_figure":
      return <InteractiveFigure title={block.title} content={c} />;
    case "image_hotspots":
      return <ImageHotspots title={block.title} content={c} />;
    case "mechanism_flow":
      return <MechanismFlow title={block.title} steps={c.steps} />;
    case "comparison":
      return <Comparison title={block.title} content={c} />;
    case "timeline":
      return <Timeline title={block.title} items={c.items} />;
    case "decision_tree":
      return <DecisionTree title={block.title} content={c} />;
    case "chart_explainer":
      return <ChartExplainer title={block.title} content={c} />;
    case "calculator":
      return <CalculatorBlock title={block.title} kind={c.kind} />;
    case "professional_case":
      return <ProfessionalCase title={block.title} lessonId={lesson.id} content={c} />;
    case "quiz":
      return <QuizBlock title={block.title} questions={c.questions} />;
    case "practical_application":
      return <PracticalApplication title={block.title} text={c.text} />;
    case "common_mistake":
      return <CommonMistake title={block.title} mistake={c.mistake} instead={c.instead} />;
    case "scientific_uncertainty":
      return <ScientificUncertainty title={block.title} text={c.text} />;
    case "references":
      return <ReferencesBlock title={block.title} ids={c.ids} />;
    case "related_content":
      return <RelatedContent title={block.title} items={c.items} />;
    case "apply_to_prescription":
      return <ApplyToPrescription title={block.title} summary={c.summary} onApply={onApply} />;
    default:
      return (
        <Card className="p-4 text-sm text-ink-3">Bloco não reconhecido ({block.type}).</Card>
      );
  }
}

function BlockTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 font-display text-xl font-bold text-ink">{children}</h2>;
}

/* -------------------------------- Blocos -------------------------------- */

function HeroBlock({ kicker, text }: { kicker?: string; text: string }) {
  return (
    <Card variant="raised" className="border-l-4 border-primary p-5 md:p-6">
      {kicker && <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">{kicker}</div>}
      <p className="font-display text-lg leading-relaxed text-ink md:text-xl">{text}</p>
    </Card>
  );
}

function PrescriptionQuestion({ question, cta }: { question: string; cta?: string }) {
  return (
    <Card tone="primary" className="p-5">
      <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
        <HelpCircle className="h-3.5 w-3.5" /> Pergunta de prescrição
      </div>
      <p className="text-ink">{question}</p>
      {cta && (
        <a href="#figura" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
          {cta} <ArrowDown className="h-4 w-4" />
        </a>
      )}
    </Card>
  );
}

function ShortText({
  title,
  variant,
  text,
  items,
}: {
  title?: string;
  variant?: string;
  text?: string;
  items?: string[];
}) {
  return (
    <section>
      {title && <BlockTitle>{title}</BlockTitle>}
      {items ? (
        <ul className="space-y-2">
          {items.map((it, i) => (
            <li key={i} className="flex items-start gap-2.5 rounded-xl border border-border bg-surface p-3 text-sm text-ink-2">
              <Eye className="mt-0.5 h-4 w-4 shrink-0 text-analysis" />
              {it}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-ink-2">{text}</p>
      )}
    </section>
  );
}

function KeyConcept({ title, term, definition }: { title?: string; term: string; definition: string }) {
  return (
    <section>
      {title && <BlockTitle>{title}</BlockTitle>}
      <Card className="flex gap-3 p-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-tint text-primary">
          <Lightbulb className="h-5 w-5" />
        </span>
        <div>
          <div className="font-display font-bold text-ink">{term}</div>
          <p className="text-sm text-ink-2">{definition}</p>
        </div>
      </Card>
    </section>
  );
}

/** Figura interativa (placeholder profissional com camadas alternáveis). */
function InteractiveFigure({
  title,
  content,
}: {
  title?: string;
  content: { leftLabel: string; rightLabel: string; caption?: string; layers: { id: string; label: string }[] };
}) {
  const [on, setOn] = React.useState<Record<string, boolean>>({});
  const toggle = (id: string) => setOn((s) => ({ ...s, [id]: !s[id] }));
  return (
    <section id="figura">
      {title && <BlockTitle>{title}</BlockTitle>}
      <Card className="overflow-hidden p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {[content.leftLabel, content.rightLabel].map((label, idx) => (
            <div key={idx} className="rounded-xl border border-border bg-surface-soft p-3">
              <div className="mb-2 text-center text-sm font-semibold text-ink">{label}</div>
              <FiguraEsquema variante={idx === 0 ? "avanco" : "recuo"} camadas={on} />
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {content.layers.map((l) => (
            <button
              key={l.id}
              onClick={() => toggle(l.id)}
              aria-pressed={!!on[l.id]}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                on[l.id] ? "border-primary bg-primary-tint text-primary" : "border-border text-ink-2 hover:bg-surface-soft",
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
        {content.caption && <p className="mt-3 text-xs text-ink-3">{content.caption}</p>}
      </Card>
    </section>
  );
}

/** Diagrama esquemático (não anatomia realista): tronco/coxa/perna como segmentos. */
function FiguraEsquema({ variante, camadas }: { variante: "avanco" | "recuo"; camadas: Record<string, boolean> }) {
  const recuo = variante === "recuo";
  // pontos esquemáticos (viewBox 100x120): quadril, joelho, tornozelo, ombro
  const quadril = { x: recuo ? 42 : 50, y: 60 };
  const joelho = { x: recuo ? 55 : 66, y: 90 };
  const tornozelo = { x: 55, y: 116 };
  const ombro = { x: recuo ? 34 : 46, y: 26 };
  return (
    <svg viewBox="0 0 100 120" className="mx-auto h-40 w-auto" role="img" aria-label={`Esquema: ${variante === "avanco" ? "maior" : "menor"} avanço do joelho`}>
      {/* base */}
      <line x1="30" y1="118" x2="80" y2="118" stroke="var(--border)" strokeWidth="1.5" />
      {/* segmentos */}
      <polyline points={`${ombro.x},${ombro.y} ${quadril.x},${quadril.y} ${joelho.x},${joelho.y} ${tornozelo.x},${tornozelo.y}`} fill="none" stroke="var(--ink-3)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {/* tronco destacado */}
      {camadas.tronco && <line x1={ombro.x} y1={ombro.y} x2={quadril.x} y2={quadril.y} stroke="var(--cta)" strokeWidth="4" strokeLinecap="round" />}
      {/* articulações */}
      <circle cx={quadril.x} cy={quadril.y} r="3.4" fill={camadas.quadril ? "var(--cta)" : "var(--analysis)"} />
      <circle cx={joelho.x} cy={joelho.y} r="3.4" fill={camadas.joelho ? "var(--cta)" : "var(--primary)"} />
      <circle cx={tornozelo.x} cy={tornozelo.y} r="3" fill="var(--analysis)" />
      {/* vetores de força (peso) */}
      {camadas.vetores && (
        <>
          <line x1={quadril.x} y1={quadril.y} x2={quadril.x} y2={quadril.y + 16} stroke="var(--primary)" strokeWidth="1.5" strokeDasharray="3 2" />
          <path d={`M${quadril.x - 2},${quadril.y + 13} L${quadril.x},${quadril.y + 17} L${quadril.x + 2},${quadril.y + 13}`} fill="none" stroke="var(--primary)" strokeWidth="1.5" />
        </>
      )}
      {/* braços de momento (linha vertical do peso até joelho/quadril) */}
      {camadas.momentos && (
        <>
          <line x1={joelho.x} y1={joelho.y} x2={joelho.x} y2={joelho.y - 24} stroke="var(--cta)" strokeWidth="1" strokeDasharray="2 2" />
          <line x1={joelho.x} y1={joelho.y - 24} x2={quadril.x} y2={joelho.y - 24} stroke="var(--cta)" strokeWidth="1" strokeDasharray="2 2" />
        </>
      )}
    </svg>
  );
}

function ImageHotspots({ title, content }: { title?: string; content: { caption: string; hotspots: { x: number; y: number; label: string; detail: string }[] } }) {
  const [active, setActive] = React.useState<number | null>(null);
  return (
    <section>
      {title && <BlockTitle>{title}</BlockTitle>}
      <Card className="p-4">
        <div className="relative mx-auto aspect-video max-w-lg rounded-xl border border-dashed border-border bg-surface-soft">
          <div className="absolute inset-0 grid place-items-center text-xs text-ink-3">
            <span className="flex items-center gap-1.5"><Layers className="h-4 w-4" /> Ilustração didática (área preparada para imagem final)</span>
          </div>
          {content.hotspots.map((h, i) => (
            <button
              key={i}
              onClick={() => setActive(active === i ? null : i)}
              aria-label={h.label}
              className="absolute grid h-6 w-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-primary text-[10px] font-bold text-white shadow"
              style={{ left: `${h.x}%`, top: `${h.y}%` }}
            >
              {i + 1}
            </button>
          ))}
        </div>
        {active != null && (
          <div className="mt-3 rounded-xl bg-primary-tint p-3 text-sm text-ink">
            <span className="font-semibold">{content.hotspots[active].label}. </span>
            {content.hotspots[active].detail}
          </div>
        )}
        <p className="mt-3 text-xs text-ink-3">{content.caption}</p>
      </Card>
    </section>
  );
}

function MechanismFlow({ title, steps }: { title?: string; steps: { label: string; detail: string }[] }) {
  const [open, setOpen] = React.useState<number | null>(0);
  return (
    <section>
      {title && <BlockTitle>{title}</BlockTitle>}
      <div className="flex flex-col gap-2">
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                open === i ? "border-primary bg-primary-tint" : "border-border bg-surface hover:bg-surface-soft",
              )}
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-white">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-ink">{s.label}</div>
                {open === i && <div className="mt-0.5 text-sm text-ink-2">{s.detail}</div>}
              </div>
            </button>
            {i < steps.length - 1 && <ArrowDown className="mx-auto h-4 w-4 text-ink-3" aria-hidden />}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}

function Comparison({
  title,
  content,
}: {
  title?: string;
  content: { leftTitle: string; rightTitle: string; leftItems: string[]; rightItems: string[]; note?: string };
}) {
  const Col = ({ head, items, tone }: { head: string; items: string[]; tone: "primary" | "analysis" }) => (
    <div className={cn("rounded-xl border p-4", tone === "primary" ? "border-primary/30 bg-primary-tint/50" : "border-analysis/30 bg-[#f0fbfc]")}>
      <div className={cn("mb-2 font-display font-bold", tone === "primary" ? "text-primary" : "text-analysis")}>{head}</div>
      <ul className="space-y-1.5 text-sm text-ink-2">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", tone === "primary" ? "bg-primary" : "bg-analysis")} />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <section>
      {title && (
        <BlockTitle>
          <span className="inline-flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-ink-3" /> {title}
          </span>
        </BlockTitle>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <Col head={content.leftTitle} items={content.leftItems} tone="primary" />
        <Col head={content.rightTitle} items={content.rightItems} tone="analysis" />
      </div>
      {content.note && (
        <p className="mt-3 rounded-xl bg-surface-soft p-3 text-sm text-ink-2">{content.note}</p>
      )}
    </section>
  );
}

function Timeline({ title, items }: { title?: string; items: { time: string; title: string; detail: string }[] }) {
  return (
    <section>
      {title && <BlockTitle>{title}</BlockTitle>}
      <ol className="relative ml-3 space-y-4 border-l-2 border-border pl-5">
        {items.map((it, i) => (
          <li key={i} className="relative">
            <span className="absolute -left-[27px] top-1 grid h-4 w-4 place-items-center rounded-full bg-primary text-white" />
            <div className="text-xs font-semibold uppercase tracking-wide text-primary">{it.time}</div>
            <div className="font-semibold text-ink">{it.title}</div>
            <p className="text-sm text-ink-2">{it.detail}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function DecisionTree({ title, content }: { title?: string; content: { root: string; branches: { condition: string; outcome: string }[] } }) {
  return (
    <section>
      {title && <BlockTitle>{title}</BlockTitle>}
      <Card className="p-4">
        <div className="mb-3 rounded-xl bg-primary-tint p-3 text-center font-semibold text-primary">{content.root}</div>
        <div className="grid gap-2 sm:grid-cols-2">
          {content.branches.map((b, i) => (
            <div key={i} className="rounded-xl border border-border p-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-ink-3">Se</div>
              <div className="text-sm font-semibold text-ink">{b.condition}</div>
              <div className="mt-1 flex items-start gap-1 text-sm text-ink-2">
                <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-analysis" /> {b.outcome}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}

function ChartExplainer({ title, content }: { title?: string; content: { title: string; points: { label: string; value: number }[]; explanation: string } }) {
  const max = Math.max(...content.points.map((p) => p.value), 1);
  return (
    <section>
      {title && <BlockTitle>{title}</BlockTitle>}
      <Card className="p-4">
        <div className="mb-3 text-sm font-semibold text-ink">{content.title}</div>
        <div className="space-y-2">
          {content.points.map((p, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-28 shrink-0 text-sm text-ink-2">{p.label}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-surface-soft">
                <div className="h-full rounded-full bg-primary" style={{ width: `${(p.value / max) * 100}%` }} />
              </div>
              <span className="tabular w-8 text-right text-sm font-semibold text-ink">{p.value}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-ink-2">{content.explanation}</p>
      </Card>
    </section>
  );
}

/** Calculadora contextual simples: estimativa de 1RM (Epley) + tabela de %. */
function CalculatorBlock({ title }: { title?: string; kind?: string }) {
  const [carga, setCarga] = React.useState("");
  const [reps, setReps] = React.useState("");
  const c = Number(carga.replace(",", "."));
  const r = Number(reps);
  const rm = c > 0 && r > 0 ? c * (1 + r / 30) : undefined;
  const percents = [60, 70, 80, 90];
  return (
    <section>
      {title && (
        <BlockTitle>
          <span className="inline-flex items-center gap-2"><CalcIcon className="h-5 w-5 text-ink-3" /> {title}</span>
        </BlockTitle>
      )}
      <Card className="p-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-ink">Carga (kg)</span>
            <input value={carga} onChange={(e) => setCarga(e.target.value)} inputMode="decimal" placeholder="Ex.: 60" className="input" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-ink">Repetições</span>
            <input value={reps} onChange={(e) => setReps(e.target.value.replace(/[^\d]/g, "").slice(0, 2))} inputMode="numeric" placeholder="Ex.: 8" className="input" />
          </label>
        </div>
        {rm != null && (
          <div className="mt-3">
            <div className="rounded-xl bg-primary-tint p-3 text-sm">
              <span className="font-semibold text-primary">1RM estimado (Epley): </span>
              <span className="font-bold text-ink">{rm.toFixed(1).replace(".", ",")} kg</span>
            </div>
            <div className="mt-2 grid grid-cols-4 gap-2 text-center">
              {percents.map((p) => (
                <div key={p} className="rounded-lg border border-border p-2">
                  <div className="text-xs text-ink-3">{p}%</div>
                  <div className="text-sm font-semibold text-ink">{((rm * p) / 100).toFixed(0)} kg</div>
                </div>
              ))}
            </div>
          </div>
        )}
        <p className="mt-3 text-xs text-ink-3">Estimativa educacional; a carga real depende da execução e do contexto do aluno.</p>
      </Card>
    </section>
  );
}

function ProfessionalCase({
  title,
  lessonId,
  content,
}: {
  title?: string;
  lessonId: string;
  content: { prompt: string; choices: { id: string; label: string; feedback: string; tone: "recomendada" | "aceitavel" | "cautela" }[] };
}) {
  const key = `${lessonId}:minicaso`;
  const setChoice = useAprender((s) => s.setCaseChoice);
  const saved = useAprender((s) => s.cases[key]?.choices?.["mini"]);
  const [pick, setPick] = React.useState<string | undefined>(saved);
  const chosen = content.choices.find((c) => c.id === pick);
  const toneMap = { recomendada: "success", aceitavel: "analysis", cautela: "warning" } as const;
  const toneLabel = { recomendada: "Recomendada", aceitavel: "Aceitável", cautela: "Requer cautela" } as const;

  const choose = (id: string) => {
    setPick(id);
    setChoice(key, "mini", id);
  };

  return (
    <section>
      {title && <BlockTitle>{title}</BlockTitle>}
      <Card className="p-5">
        <p className="mb-3 text-ink">{content.prompt}</p>
        <div className="space-y-2" role="radiogroup" aria-label="Escolha sua decisão">
          {content.choices.map((c) => (
            <button
              key={c.id}
              role="radio"
              aria-checked={pick === c.id}
              onClick={() => choose(c.id)}
              className={cn(
                "flex w-full items-start gap-2 rounded-xl border p-3 text-left text-sm transition-colors",
                pick === c.id ? "border-primary bg-primary-tint" : "border-border hover:bg-surface-soft",
              )}
            >
              <span className={cn("mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border", pick === c.id ? "border-primary" : "border-ink-3")}>
                {pick === c.id && <span className="h-2 w-2 rounded-full bg-primary" />}
              </span>
              <span className="text-ink">{c.label}</span>
            </button>
          ))}
        </div>
        {chosen && (
          <div className="mt-3 rounded-xl border border-border bg-surface-soft p-3">
            <Pill tone={toneMap[chosen.tone]}>{toneLabel[chosen.tone]}</Pill>
            <p className="mt-2 text-sm text-ink-2">{chosen.feedback}</p>
            <button onClick={() => choose("")} className="mt-2 text-xs font-semibold text-primary hover:underline">
              Alterar resposta
            </button>
          </div>
        )}
      </Card>
    </section>
  );
}

function QuizBlock({ title, questions }: { title?: string; questions: QuizQuestion[] }) {
  const answer = useAprender((s) => s.answerQuiz);
  return (
    <section>
      {title && (
        <BlockTitle>
          <span className="inline-flex items-center gap-2"><Sparkles className="h-5 w-5 text-ink-3" /> {title}</span>
        </BlockTitle>
      )}
      <div className="space-y-3">
        {questions.map((q) => (
          <QuizItem key={q.id} q={q} onAnswer={answer} />
        ))}
      </div>
    </section>
  );
}

function QuizItem({ q, onAnswer }: { q: QuizQuestion; onAnswer: (id: string, a: string, ok: boolean) => void }) {
  const stored = useAprender((s) => s.quizAnswers[q.id]);
  const [pick, setPick] = React.useState<string | undefined>(stored?.answer);
  const answered = pick != null;
  const correct = pick === q.correctAnswer;
  const choose = (id: string) => {
    if (answered) return;
    setPick(id);
    onAnswer(q.id, id, id === q.correctAnswer);
  };
  return (
    <Card className="p-4">
      <p className="mb-2 font-semibold text-ink">{q.prompt}</p>
      <div className="space-y-2">
        {q.options.map((o) => {
          const isPick = pick === o.id;
          const isRight = o.id === q.correctAnswer;
          return (
            <button
              key={o.id}
              onClick={() => choose(o.id)}
              disabled={answered}
              className={cn(
                "flex w-full items-center gap-2 rounded-xl border p-2.5 text-left text-sm transition-colors",
                !answered && "hover:bg-surface-soft",
                answered && isRight && "border-success bg-[#e7f8ee]",
                answered && isPick && !isRight && "border-warning bg-[#fef4e2]",
                !answered && "border-border",
                answered && !isRight && !isPick && "border-border opacity-70",
              )}
            >
              {answered && isRight ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
              ) : answered && isPick ? (
                <XCircle className="h-4 w-4 shrink-0 text-warning" />
              ) : (
                <span className="h-4 w-4 shrink-0 rounded-full border border-ink-3" />
              )}
              <span className="text-ink">{o.label}</span>
            </button>
          );
        })}
      </div>
      {answered && (
        <p className={cn("mt-2 text-sm", correct ? "text-success" : "text-ink-2")}>
          {correct ? "Correto. " : "Vale revisar. "}
          {q.feedback}
        </p>
      )}
    </Card>
  );
}

function PracticalApplication({ title, text }: { title?: string; text: string }) {
  return (
    <section>
      {title && <BlockTitle>{title}</BlockTitle>}
      <Card tone="success" className="flex gap-3 p-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-success">
          <Target className="h-5 w-5" />
        </span>
        <p className="text-sm text-ink">{text}</p>
      </Card>
    </section>
  );
}

function CommonMistake({ title, mistake, instead }: { title?: string; mistake: string; instead: string }) {
  return (
    <section>
      {title && <BlockTitle>{title}</BlockTitle>}
      <Card tone="warning" className="p-4">
        <div className="flex gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <div className="text-sm">
            <div className="text-ink"><span className="font-semibold">Comum: </span>{mistake}</div>
            <div className="mt-1 text-ink-2"><span className="font-semibold text-ink">Em vez disso: </span>{instead}</div>
          </div>
        </div>
      </Card>
    </section>
  );
}

function ScientificUncertainty({ title, text }: { title?: string; text: string }) {
  return (
    <section>
      {title && <BlockTitle>{title}</BlockTitle>}
      <Card className="border-dashed p-4">
        <div className="flex gap-2 text-sm text-ink-2">
          <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-ink-3" />
          <span>{text}</span>
        </div>
      </Card>
    </section>
  );
}

function ReferencesBlock({ title, ids }: { title?: string; ids: string[] }) {
  const refs = ids.map((id) => repo.getReference(id)).filter(Boolean);
  return (
    <section>
      {title && <BlockTitle>{title}</BlockTitle>}
      <ol className="space-y-2">
        {refs.map((r, i) =>
          !r ? null : (
            <li key={r.id} className="rounded-xl border border-border bg-surface p-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-semibold text-ink-3">{i + 1}.</span>
                <Pill tone="neutral">{referenceSourceLabel[r.sourceType]}</Pill>
                {r.openAccess && <Pill tone="success" icon={<Unlock className="h-3 w-3" />}>Acesso aberto</Pill>}
                {r.validationStatus === "a-validar" && <Pill tone="warning">A validar (editorial)</Pill>}
              </div>
              <div className="mt-1 text-sm text-ink">
                {r.validationStatus === "a-validar" ? (
                  <span className="italic text-ink-2">Referência a ser validada pela equipe editorial.</span>
                ) : (
                  <>
                    {r.authors} ({r.year}). <span className="italic">{r.title}</span>. {r.journalOrPublisher}.
                  </>
                )}
              </div>
              <p className="mt-0.5 text-xs text-ink-3">{r.abstractSummary}</p>
            </li>
          ),
        )}
      </ol>
    </section>
  );
}

function RelatedContent({ title, items }: { title?: string; items: { title: string; href: string; type: string }[] }) {
  return (
    <section>
      {title && <BlockTitle>{title}</BlockTitle>}
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((it, i) => {
          const meta = lessonTypeMeta[it.type as keyof typeof lessonTypeMeta];
          const Icon = iconByName(meta?.icon);
          return (
            <Link key={i} to={it.href} className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:border-primary hover:bg-primary-tint/40">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-soft text-ink-2">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-ink">{it.title}</div>
                <div className="text-xs text-ink-3">{meta?.label ?? it.type}</div>
              </div>
              <ExternalLink className="ml-auto h-4 w-4 shrink-0 text-ink-3" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function ApplyToPrescription({ title, summary, onApply }: { title?: string; summary: string; onApply: (s: string) => void }) {
  return (
    <section>
      {title && <BlockTitle>{title}</BlockTitle>}
      <Card tone="primary" className="p-5">
        <p className="text-sm text-ink">{summary}</p>
        <button onClick={() => onApply(summary)} className={cn(buttonClasses("primary", "sm"), "mt-3")}>
          <Target className="h-4 w-4" /> Aplicar no atendimento
        </button>
      </Card>
    </section>
  );
}
