import * as React from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ClipboardList, ListChecks, CheckCircle2, Target, BookOpen } from "lucide-react";
import { Card, Pill, buttonClasses, Eyebrow } from "@/components/ui/primitives";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { getLearningRepository } from "../repository";
import { NivelPill } from "../components/shared";
import { ApplyDrawer } from "../components/ApplyDrawer";
import { useAprender } from "../store";
import type { CaseStep } from "../types";

const repo = getLearningRepository();

const toneMap = { recomendada: "success", aceitavel: "analysis", cautela: "warning" } as const;
const toneLabel = { recomendada: "Recomendada", aceitavel: "Aceitável", cautela: "Requer cautela" } as const;

export function CasoDetail() {
  const { caseSlug = "" } = useParams();
  const caso = repo.getCase(caseSlug);
  const setChoice = useAprender((s) => s.setCaseChoice);
  const completeCase = useAprender((s) => s.completeCase);
  const pushHistory = useAprender((s) => s.pushHistory);
  const caseState = useAprender((s) => (caso ? s.cases[caso.id] : undefined));
  const [apply, setApply] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (caso) pushHistory({ type: "caso", title: caso.title, href: `/aprender/casos/${caso.slug}` });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseSlug]);

  if (!caso) {
    return (
      <div className="mx-auto max-w-3xl py-16 text-center">
        <p className="text-ink-2">Caso não encontrado.</p>
        <Link to="/aprender/casos" className={cn(buttonClasses("secondary"), "mt-4")}>Voltar para Casos</Link>
      </div>
    );
  }

  const steps = [...caso.steps].sort((a, b) => a.order - b.order);
  const choices = caseState?.choices ?? {};
  const decisoes = steps.filter((s) => s.type === "decisao");
  const respondidas = decisoes.filter((s) => choices[s.id]).length;
  const completo = caseState?.status === "concluido";

  const escolher = (stepId: string, choiceId: string) => setChoice(caso.id, stepId, choiceId);

  const finalizar = () => {
    completeCase(caso.id);
    toast("Caso concluído. Raciocínio registrado no seu progresso.");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link to="/aprender/casos" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-2 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Casos de prescrição
      </Link>

      {/* Cabeçalho */}
      <Card className="p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <NivelPill nivel={caso.level} />
          {caso.conditions.map((c) => (
            <Pill key={c} tone="warning">{c}</Pill>
          ))}
        </div>
        <h1 className="mt-2 font-display text-2xl font-bold text-ink">{caso.title}</h1>
        <p className="mt-1 text-ink-2">{caso.description}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {caso.goals.map((g) => (
            <Pill key={g} tone="neutral">{g}</Pill>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5 text-xs text-ink-3">
          <span className="font-semibold text-ink-2">Disciplinas:</span> {caso.disciplines.join(" · ")}
        </div>
        {decisoes.length > 0 && (
          <div className="mt-3 text-sm text-ink-2">
            Decisões: <span className="font-semibold text-ink">{respondidas}</span> de {decisoes.length}
          </div>
        )}
      </Card>

      {/* Etapas */}
      <div className="space-y-4">
        {steps.map((step) => (
          <StepCard key={step.id} step={step} chosen={choices[step.id]} onChoose={(cid) => escolher(step.id, cid)} />
        ))}
      </div>

      {/* Evidências */}
      {caso.references && caso.references.length > 0 && (
        <Card className="p-4">
          <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
            <BookOpen className="h-4 w-4 text-ink-3" /> Evidências e referências
          </div>
          <ul className="space-y-1.5 text-sm text-ink-2">
            {caso.references.map((rid) => {
              const r = repo.getReference(rid);
              if (!r) return null;
              return (
                <li key={rid}>
                  {r.validationStatus === "a-validar" ? (
                    <span className="italic">Referência a ser validada pela equipe editorial.</span>
                  ) : (
                    <>{r.authors} ({r.year}). <span className="italic">{r.title}</span>.</>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {/* Aplicação prática + concluir */}
      <Card tone="primary" className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-2">
            <Target className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-sm text-ink">Leve o raciocínio deste caso para um aluno real.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setApply(caso.description)} className={buttonClasses("secondary", "sm")}>
              Aplicar no atendimento
            </button>
            <button onClick={finalizar} className={buttonClasses("primary", "sm")}>
              <CheckCircle2 className="h-4 w-4" /> {completo ? "Concluído" : "Concluir caso"}
            </button>
          </div>
        </div>
      </Card>

      {apply != null && (
        <ApplyDrawer
          lessonId={caso.id}
          lessonSlug={caso.slug}
          lessonTitle={caso.title}
          defaultSummary={apply}
          onClose={() => setApply(null)}
        />
      )}
    </div>
  );
}

function StepCard({ step, chosen, onChoose }: { step: CaseStep; chosen?: string; onChoose: (choiceId: string) => void }) {
  const icon =
    step.type === "contexto" ? <ClipboardList className="h-4 w-4" /> :
    step.type === "dados" ? <ListChecks className="h-4 w-4" /> :
    step.type === "decisao" ? <Target className="h-4 w-4" /> :
    <CheckCircle2 className="h-4 w-4" />;
  const picked = step.choices?.find((c) => c.id === chosen);

  return (
    <Card className="p-5">
      <Eyebrow className="mb-2 flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-lg bg-surface-soft text-ink-2">{icon}</span>
        {step.type === "decisao" ? "Decisão" : step.type === "consequencia" ? "Consequência" : step.type === "feedback" ? "Síntese" : step.type === "dados" ? "Dados" : "Contexto"}
      </Eyebrow>
      <h2 className="font-display text-lg font-bold text-ink">{step.title}</h2>
      <p className="mt-1 text-sm text-ink-2">{step.content}</p>

      {step.choices && (
        <div className="mt-3 space-y-2" role="radiogroup" aria-label={step.title}>
          {step.choices.map((c) => (
            <button
              key={c.id}
              role="radio"
              aria-checked={chosen === c.id}
              onClick={() => onChoose(c.id)}
              className={cn(
                "flex w-full items-start gap-2 rounded-xl border p-3 text-left text-sm transition-colors",
                chosen === c.id ? "border-primary bg-primary-tint" : "border-border hover:bg-surface-soft",
              )}
            >
              <span className={cn("mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border", chosen === c.id ? "border-primary" : "border-ink-3")}>
                {chosen === c.id && <span className="h-2 w-2 rounded-full bg-primary" />}
              </span>
              <span className="text-ink">{c.label}</span>
            </button>
          ))}
          {picked && (
            <div className="rounded-xl border border-border bg-surface-soft p-3">
              <Pill tone={toneMap[picked.tone]}>{toneLabel[picked.tone]}</Pill>
              <p className="mt-2 text-sm text-ink-2">{picked.feedback}</p>
              <button onClick={() => onChoose("")} className="mt-2 text-xs font-semibold text-primary hover:underline">
                Alterar resposta
              </button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
