import * as React from "react";
import { Link } from "react-router-dom";
import {
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
  ChevronDown,
  Info,
  KeyRound,
  Gauge,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, Pill, buttonClasses } from "@/components/ui/primitives";
import { cn, withBase } from "@/lib/utils";
import { getLearningRepository } from "../repository";
import { referenceSourceLabel, lessonTypeMeta } from "../constants";
import { iconByName } from "../icons";
import { useAprender } from "../store";
import { FIGURES, type FigureImageDef } from "../figures/scientific";
import { siglasDaLesson } from "../siglas";
import { parseNucleo, ehBlocoDeNucleos } from "../nucleos";
import { RichText, RichInline } from "../richtext";
import type { Lesson, LessonBlock, QuizQuestion } from "../types";

const repo = getLearningRepository();

/* ------------------------------- Renderer ------------------------------- */

/* ----------------------------- Seções da aula ---------------------------- */
// Para dar ritmo e não virar uma parede de cartões, os blocos são agrupados em
// fases nomeadas (Entenda, Aplique, Pratique, Aprofunde) por MARCADORES de início,
// sem reordenar o conteúdo. A varredura é monotônica: a fase só avança, nunca volta.

type SectionId = "entenda" | "aplique" | "pratique" | "aprofunde";

const SECTION_TITLE: Record<SectionId, string> = {
  entenda: "Entenda",
  aplique: "Aplique na prescrição",
  pratique: "Pratique",
  aprofunde: "Aprofunde",
};
const SECTION_ORDER: SectionId[] = ["entenda", "aplique", "pratique", "aprofunde"];
const SECTION_RANK: Record<SectionId, number> = { entenda: 0, aplique: 1, pratique: 2, aprofunde: 3 };
const APROFUNDE_TYPES = new Set<LessonBlock["type"]>([
  "scientific_uncertainty",
  "related_content",
  "references",
]);

function groupIntoSections(blocks: LessonBlock[]) {
  const ordered = [...blocks].sort((a, b) => a.order - b.order);
  const sections: Record<SectionId, LessonBlock[]> = { entenda: [], aplique: [], pratique: [], aprofunde: [] };
  let closing: LessonBlock | null = null;
  let current: SectionId = "entenda";
  const advance = (to: SectionId) => {
    if (SECTION_RANK[current] < SECTION_RANK[to]) current = to;
  };
  for (const blk of ordered) {
    if (blk.type === "apply_to_prescription") {
      closing = blk; // fecha a aula como faixa de ação, fora das seções
      continue;
    }
    if (blk.type === "practical_application") advance("aplique");
    else if (blk.type === "professional_case") advance("pratique");
    else if (APROFUNDE_TYPES.has(blk.type)) advance("aprofunde");
    sections[current].push(blk);
  }
  return { sections, closing };
}

export function LessonRenderer({ lesson, onApply }: { lesson: Lesson; onApply: (summary: string) => void }) {
  const { sections, closing } = React.useMemo(() => groupIntoSections(lesson.blocks), [lesson]);
  const [openAprofunde, setOpenAprofunde] = React.useState(false);

  const visible = SECTION_ORDER.filter((id) => sections[id].length > 0);
  const numberOf = new Map<SectionId, number>();
  visible.forEach((id, i) => numberOf.set(id, i + 1));

  const goto = (id: SectionId) => {
    if (id === "aprofunde") setOpenAprofunde(true);
    requestAnimationFrame(() => {
      document.getElementById(`sec-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const renderBlocks = (list: LessonBlock[]) =>
    list.map((blk) => <BlockSwitch key={blk.id} block={blk} lesson={lesson} onApply={onApply} />);

  return (
    <div className="space-y-8">
      {visible.length > 1 && (
        <nav aria-label="Seções da aula" className="flex flex-wrap gap-1.5">
          {visible.map((id) => (
            <button
              key={id}
              onClick={() => goto(id)}
              className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-ink-2 transition-colors hover:border-primary hover:bg-primary-tint hover:text-primary"
            >
              {numberOf.get(id)}. {SECTION_TITLE[id]}
            </button>
          ))}
        </nav>
      )}

      {visible.map((id) => {
        if (id === "aprofunde") {
          return (
            <details
              key={id}
              id="sec-aprofunde"
              open={openAprofunde}
              onToggle={(e) => setOpenAprofunde((e.currentTarget as HTMLDetailsElement).open)}
              className="group scroll-mt-24 rounded-card border border-border bg-surface-soft"
            >
              <summary className="flex cursor-pointer list-none items-center gap-2 rounded-card px-4 py-3 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
                <BookOpen className="h-4 w-4 shrink-0 text-ink-3" />
                Aprofundar: o que ainda é incerto, revisões e referências
                <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-ink-3 transition-transform group-open:rotate-180" />
              </summary>
              <div className="space-y-5 px-4 pb-4">{renderBlocks(sections[id])}</div>
            </details>
          );
        }
        return (
          <section key={id} id={`sec-${id}`} className="scroll-mt-24 space-y-5">
            <SectionHeading n={numberOf.get(id)!} title={SECTION_TITLE[id]} />
            {/* As siglas da própria aula abrem o Entenda: quem lê "VO₂" ou "EMG" logo
                adiante já sabe o que é, em vez de tropeçar. */}
            {id === "entenda" && <SiglasDaAula lesson={lesson} />}
            {renderBlocks(sections[id])}
          </section>
        );
      })}

      {closing && renderBlocks([closing])}
    </div>
  );
}

function SectionHeading({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-white">
        {n}
      </span>
      <h2 className="font-display text-xl font-bold text-ink">{title}</h2>
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
    case "figure":
      return <ScientificFigureBlock title={block.title} figureId={c.figureId} caption={c.caption} />;
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
      return <QuizBlock title={block.title} lessonId={lesson.id} questions={c.questions} />;
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
  return <h3 className="mb-3 font-display text-lg font-bold text-ink">{children}</h3>;
}

/* -------------------------------- Blocos -------------------------------- */

function HeroBlock({ kicker, text }: { kicker?: string; text: string }) {
  return (
    <Card variant="raised" className="border-l-4 border-primary p-5 md:p-6">
      {kicker && <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">{kicker}</div>}
      <RichText text={text} className="font-display text-lg leading-relaxed text-ink md:text-xl" />
    </Card>
  );
}

function PrescriptionQuestion({ question, cta }: { question: string; cta?: string }) {
  return (
    <Card variant="soft" className="p-5">
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

/** Siglas que aparecem nesta aula, expandidas. Some quando a aula não usa nenhuma. */
function SiglasDaAula({ lesson }: { lesson: Lesson }) {
  const siglas = React.useMemo(() => siglasDaLesson(lesson), [lesson]);
  if (siglas.length === 0) return null;
  return (
    <Card variant="soft" className="p-4">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-analysis">
        <Info className="h-3.5 w-3.5" /> Siglas e termos desta aula
      </div>
      <dl className="grid gap-x-5 gap-y-2 sm:grid-cols-2">
        {siglas.map((s) => (
          <div key={s.sigla} className="flex gap-2">
            <dt className="shrink-0 font-mono text-sm font-bold text-ink">{s.sigla}</dt>
            <dd className="text-sm text-ink-2">{s.significado}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

/**
 * A seção "Medida e interpretação" chega como frases estruturadas ("X representa Y.
 * Limite: Z"). Antes virava texto corrido com um olho decorativo que parecia clicável
 * e não era. Aqui cada variável vira um cartão que separa o que ela informa de onde ela
 * cala, e as duas linhas especiais (regra de ouro, sinal de segurança) viram avisos.
 */
const RE_MEDIDA = /^(.+?)\s+(?:representa|representam)\s+(.+?)\.\s*Limite:\s*(.+)$/i;

function MedidaInterpretacao({ title, items }: { title?: string; items: string[] }) {
  const variaveis = items
    .map((it) => RE_MEDIDA.exec(it))
    .filter((m): m is RegExpExecArray => m !== null)
    .map((m) => ({ variavel: m[1].trim(), informa: m[2].trim(), limite: m[3].trim() }));
  const regra = items.find((it) => /^regra de ouro/i.test(it));
  const seguranca = items.find((it) => /^sinal de segurança/i.test(it));
  // Qualquer item que não casou com os padrões acima ainda precisa aparecer.
  const soltos = items.filter((it) => !RE_MEDIDA.test(it) && !/^regra de ouro/i.test(it) && !/^sinal de segurança/i.test(it));

  return (
    <section>
      {title && <BlockTitle>{title}</BlockTitle>}
      <div className="grid gap-2.5 sm:grid-cols-2">
        {variaveis.map((v) => (
          <div key={v.variavel} className="rounded-xl border border-border bg-surface p-3">
            <div className="mb-1 flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5 shrink-0 text-analysis" />
              <span className="font-semibold text-ink">{v.variavel}</span>
            </div>
            <p className="text-sm text-ink-2">{v.informa}</p>
            <p className="mt-1.5 text-xs text-ink-3">
              <span className="font-semibold text-ink-2">O que não mostra: </span>
              {v.limite}
            </p>
          </div>
        ))}
      </div>

      {soltos.length > 0 && (
        <ul className="mt-2.5 space-y-1.5">
          {soltos.map((it, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-ink-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-analysis" />
              {it}
            </li>
          ))}
        </ul>
      )}

      {regra && (
        <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-primary/30 bg-primary-tint p-3">
          <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm text-ink">{regra}</p>
        </div>
      )}
      {seguranca && (
        <div className="mt-2.5 flex items-start gap-2.5 rounded-xl border border-warning/40 bg-[#fef7e8] p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <p className="text-sm text-ink">{seguranca}</p>
        </div>
      )}
    </section>
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
  if (!items) {
    return (
      <section>
        {title && <BlockTitle>{title}</BlockTitle>}
        <RichText text={text ?? ""} className="leading-relaxed text-ink-2" />
      </section>
    );
  }
  // A seção de medida e interpretação tem estrutura própria; o resto é lista de aplicações.
  if ((title ?? "").toLowerCase().startsWith("medida e interpreta")) {
    return <MedidaInterpretacao title={title} items={items} />;
  }
  // Aplicações a populações especiais: rótulo destacado quando o item vem como "Grupo: texto".
  return (
    <section>
      {title && <BlockTitle>{title}</BlockTitle>}
      <ul className="space-y-1.5">
        {items.map((it, i) => {
          const m = /^([^:]{3,42}):\s+(.+)$/.exec(it);
          return (
            <li key={i} className="flex items-start gap-2.5 rounded-xl border border-border bg-surface p-3 text-sm text-ink-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-analysis" aria-hidden />
              {m ? (
                <span>
                  <span className="font-semibold text-ink">{m[1]}: </span>
                  {m[2]}
                </span>
              ) : (
                it
              )}
            </li>
          );
        })}
      </ul>
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
          <RichText text={definition} className="text-sm leading-relaxed text-ink-2" />
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

/**
 * Prancha de imagem anatômica: render 3D (sem texto embutido) + marcadores
 * numerados posicionados em % + legenda numerada abaixo. Mesmo padrão da camada
 * de hotspots do mapa muscular, para rótulo exato sobre ilustração realista.
 */
function FigureImagePlate({ img }: { img: FigureImageDef }) {
  const markers = img.markers ?? [];
  return (
    <div>
      <div className="relative overflow-hidden rounded-xl border border-border bg-white">
        <img src={withBase(img.src)} alt={img.alt} className="block h-auto w-full" loading="lazy" />
        {markers.length > 0 && (
          <div aria-hidden className="pointer-events-none absolute inset-0">
            {markers.map((m) => (
              <span
                key={m.n}
                className="absolute grid h-6 w-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink text-[11px] font-bold text-white shadow-md ring-2 ring-white"
                style={{ left: `${m.x}%`, top: `${m.y}%` }}
              >
                {m.n}
              </span>
            ))}
          </div>
        )}
      </div>
      {markers.length > 0 && (
        <ol className="mt-3 grid grid-cols-1 gap-x-5 gap-y-1.5 sm:grid-cols-2">
          {markers.map((m) => (
            <li key={m.n} className="flex items-start gap-2 text-sm text-ink-2">
              <span className="mt-px grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ink text-[10px] font-bold text-white">{m.n}</span>
              <span>{m.label}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

/** Figura científica do Aprender: prancha de imagem anatômica ou esquema SVG original. */
function ScientificFigureBlock({ title, figureId, caption }: { title?: string; figureId: string; caption?: string }) {
  const fig = FIGURES[figureId];
  if (!fig) {
    return <Card className="p-4 text-sm text-ink-3">Figura não encontrada ({figureId}).</Card>;
  }
  const { Comp, title: figTitle, subtitle, img } = fig;
  const legenda = caption ?? img?.caption ?? "Esquema didático original. Proporções não anatômicas; prioriza a clareza do mecanismo.";
  return (
    <section>
      {title && <BlockTitle>{title}</BlockTitle>}
      <Card variant="raised" className="overflow-hidden p-4 md:p-5">
        <div className="mb-1 font-display text-base font-bold text-ink">{figTitle}</div>
        {subtitle && <p className="mb-3 text-sm text-ink-2">{subtitle}</p>}
        {img ? (
          <FigureImagePlate img={img} />
        ) : (
          <div className="rounded-xl border border-border bg-surface p-2">
            <Comp />
          </div>
        )}
        <p className="mt-2 text-xs text-ink-3">{legenda}</p>
      </Card>
    </section>
  );
}

function MechanismFlow({ title, steps }: { title?: string; steps: { label: string; detail: string }[] }) {
  // Quando os passos seguem a estrutura de núcleo do manual (descrição, sequência,
  // relação, aplicação, como medir, erro), renderiza como prancha de atlas.
  if (ehBlocoDeNucleos(steps)) return <NucleosAtlas title={title} steps={steps} />;
  return <MechanismAccordion title={title} steps={steps} />;
}

function MechanismAccordion({ title, steps }: { title?: string; steps: { label: string; detail: string }[] }) {
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
                {open === i && <div className="mt-0.5 text-sm leading-relaxed text-ink-2"><RichInline text={s.detail} /></div>}
              </div>
            </button>
            {i < steps.length - 1 && <ArrowDown className="mx-auto h-4 w-4 text-ink-3" aria-hidden />}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}

/** Célula rotulada da tabela do núcleo (aplicação, como medir, erro frequente). */
function AtlasCell({ icon: Icon, label, text, tone = "neutral" }: { icon: LucideIcon; label: string; text: string; tone?: "neutral" | "warning" }) {
  return (
    <div className={cn("rounded-lg border p-3", tone === "warning" ? "border-warning/40 bg-warning/5" : "border-border bg-surface")}>
      <div className={cn("mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide", tone === "warning" ? "text-warning" : "text-ink-3")}>
        <Icon className="h-3.5 w-3.5" aria-hidden />
        {label}
      </div>
      <p className="text-[13px] leading-snug text-ink-2"><RichInline text={text} /></p>
    </div>
  );
}

/**
 * Prancha de atlas dos núcleos mecanísticos: cada núcleo vira um cartão com
 * descrição, a sequência de 4 passos como esquema, a relação em destaque e a
 * tabela aplicação / como medir / erro frequente. Estrutura fiel ao manual; o
 * conteúdo é o mesmo que já existia, só reorganizado (ver features/learning/nucleos).
 */
function NucleosAtlas({ title, steps }: { title?: string; steps: { label: string; detail: string }[] }) {
  return (
    <section>
      {title && <BlockTitle>{title}</BlockTitle>}
      <div className="flex flex-col gap-4">
        {steps.map((s, i) => {
          const n = parseNucleo(s.detail);
          if (!n) return null;
          return (
            <Card key={i} variant="raised" className="p-4 md:p-5">
              <div className="flex items-start gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-white">{i + 1}</span>
                <h4 className="pt-0.5 font-display text-base font-bold text-ink">{s.label}</h4>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink-2"><RichInline text={n.descricao} /></p>

              <div className="mt-4">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-3">Sequência</div>
                <ol className="grid gap-2 sm:grid-cols-2">
                  {n.passos.map((p, j) => (
                    <li key={j} className="flex gap-2 rounded-lg border border-border bg-surface-soft p-2.5">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ink/10 text-[11px] font-bold text-ink">{j + 1}</span>
                      <span className="text-[13px] leading-snug text-ink-2">{p}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 rounded-lg border border-primary/30 bg-primary-tint/50 px-3 py-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-primary">Relação</span>
                <span className="text-sm font-semibold text-ink">{n.relacao}</span>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <AtlasCell icon={Target} label="Aplicação ao exercício" text={n.aplicacao} />
                <AtlasCell icon={Gauge} label="Como medir" text={n.comoMedir} />
                <AtlasCell icon={AlertTriangle} label="Erro frequente" text={n.erroFrequente} tone="warning" />
              </div>
            </Card>
          );
        })}
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

function QuizBlock({ title, lessonId, questions }: { title?: string; lessonId: string; questions: QuizQuestion[] }) {
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
          // A chave do store precisa incluir a aula: os ids de pergunta ("q1", "q2")
          // se repetem em ~100 aulas, então uma chave só com o id fazia a resposta de
          // uma aula aparecer já marcada em todas as outras. Mesmo padrão do mini caso.
          <QuizItem key={q.id} q={q} storeKey={`${lessonId}:${q.id}`} onAnswer={answer} />
        ))}
      </div>
    </section>
  );
}

function QuizItem({
  q,
  storeKey,
  onAnswer,
}: {
  q: QuizQuestion;
  storeKey: string;
  onAnswer: (id: string, a: string, ok: boolean) => void;
}) {
  const stored = useAprender((s) => s.quizAnswers[storeKey]);
  const [pick, setPick] = React.useState<string | undefined>(stored?.answer);
  const answered = pick != null;
  const correct = pick === q.correctAnswer;
  const choose = (id: string) => {
    if (answered) return;
    setPick(id);
    onAnswer(storeKey, id, id === q.correctAnswer);
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
        <div className="min-w-0 flex-1">
          <RichText text={text} className="text-sm leading-relaxed text-ink" />
        </div>
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
            <div className="text-ink"><span className="font-semibold">Comum: </span><RichInline text={mistake} /></div>
            <div className="mt-1 text-ink-2"><span className="font-semibold text-ink">Em vez disso: </span><RichInline text={instead} /></div>
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
          <div className="min-w-0 flex-1">
            <RichText text={text} className="leading-relaxed text-ink-2" />
          </div>
        </div>
      </Card>
    </section>
  );
}

function ReferencesBlock({ title, ids }: { title?: string; ids: string[] }) {
  // Só referências reais da base RCD; placeholders "a-validar" não aparecem no
  // corpo da aula (evita carimbo de "inacabado" em conteúdo já polido).
  const refs = ids
    .map((id) => repo.getReference(id))
    .filter((r): r is NonNullable<typeof r> => Boolean(r) && r!.validationStatus !== "a-validar");
  if (refs.length === 0) return null;
  return (
    <section>
      {title && <BlockTitle>{title}</BlockTitle>}
      <ol className="space-y-2">
        {refs.map((r, i) => (
          <li key={r.id} className="rounded-xl border border-border bg-surface p-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-ink-3">{i + 1}.</span>
              <Pill tone="neutral">{referenceSourceLabel[r.sourceType]}</Pill>
              {r.openAccess && <Pill tone="success" icon={<Unlock className="h-3 w-3" />}>Acesso aberto</Pill>}
            </div>
            <div className="mt-1 text-sm text-ink">
              {r.authors} ({r.year}). <span className="italic">{r.title}</span>. {r.journalOrPublisher}.
            </div>
            <p className="mt-0.5 text-xs text-ink-3">{r.abstractSummary}</p>
          </li>
        ))}
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
    <section id="sec-aplicar" className="scroll-mt-24">
      {title && <BlockTitle>{title}</BlockTitle>}
      <Card variant="soft" className="border-l-4 border-primary p-5">
        <RichText text={summary} className="text-sm leading-relaxed text-ink" />
        <button onClick={() => onApply(summary)} className={cn(buttonClasses("primary", "sm"), "mt-3")}>
          <Target className="h-4 w-4" /> Aplicar no atendimento
        </button>
      </Card>
    </section>
  );
}
