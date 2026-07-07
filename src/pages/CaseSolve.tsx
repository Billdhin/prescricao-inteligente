import * as React from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  CheckCircle2,
  RefreshCcw,
  Target,
  Sparkles,
  Info,
  Brain,
} from "lucide-react";
import { Card, Pill, buttonClasses, type PillTone } from "@/components/ui/primitives";
import { cases, getCase } from "@/data/cases";
import type { PracticeCase, CaseOption, TrustLevel } from "@/data/types";
import { useUser, useProgress, isPremiumUnlocked, FREE_CASES_LIMIT } from "@/lib/store";
import { cn } from "@/lib/utils";

const trustTone: Record<TrustLevel, PillTone> = {
  "princípio biomecânico": "analysis",
  "tendência prática": "primary",
  "regra pedagógica": "success",
  "cuidado de segurança": "warning",
  "depende do contexto": "neutral",
};

export function CaseSolve() {
  const { slug = "" } = useParams();
  const caso = getCase(slug);
  const plan = useUser((s) => s.plan);
  const unlocked = isPremiumUnlocked(plan);
  const resolvidos = useProgress((s) => s.casosResolvidos);

  if (!caso) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card className="p-10 text-center">
          <h1 className="font-display text-2xl font-bold text-ink">Caso não encontrado</h1>
          <Link to="/cases" className={buttonClasses("secondary") + " mt-4"}>
            Voltar aos casos
          </Link>
        </Card>
      </div>
    );
  }

  const jaResolvido = resolvidos.includes(caso.id);
  const premiumLock = caso.premium && !unlocked;
  const limiteLock = !unlocked && !jaResolvido && resolvidos.length >= FREE_CASES_LIMIT;

  if (premiumLock || limiteLock) {
    return <CaseLocked premiumLock={premiumLock} />;
  }

  return <Solve caso={caso} />;
}

function CaseLocked({ premiumLock }: { premiumLock: boolean }) {
  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/cases" className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-ink-2 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Voltar aos casos
      </Link>
      <Card className="overflow-hidden">
        <div className="gradient-brand p-8 text-center text-white">
          <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white/15">
            <Lock className="h-6 w-6" />
          </span>
          <h2 className="font-display text-2xl font-bold">
            {premiumLock ? "Caso do plano Profissional" : "Você usou seus 2 casos gratuitos"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-white/85">
            Assine o plano Profissional para resolver todos os casos, com feedback de raciocínio
            ilimitado.
          </p>
          <Link
            to="/pricing"
            className="mt-5 inline-flex rounded-control bg-white px-5 py-2.5 font-semibold text-primary hover:bg-white/90"
          >
            Assinar Profissional
          </Link>
        </div>
      </Card>
    </div>
  );
}

function Solve({ caso }: { caso: PracticeCase }) {
  const solveCase = useProgress((s) => s.solveCase);
  const [choiceId, setChoiceId] = React.useState<string | null>(null);
  const [revealed, setRevealed] = React.useState(false);

  const chosen = caso.opcoes.find((o) => o.id === choiceId);
  const melhor = caso.opcoes.find((o) => o.id === caso.melhorOpcaoId)!;
  const idx = cases.findIndex((c) => c.id === caso.id);
  const proximo = cases[(idx + 1) % cases.length];

  const confirmar = () => {
    if (!chosen) return;
    setRevealed(true);
    solveCase(caso.id);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link to="/cases" className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-ink-2 hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Voltar aos casos
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">{caso.titulo}</h1>
          <Pill tone="neutral">{caso.tema}</Pill>
          <Pill tone={caso.dificuldade === "Iniciante" ? "success" : "warning"}>{caso.dificuldade}</Pill>
        </div>
      </div>

      {/* Cenário */}
      <Card className="p-5">
        <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-3">Cenário</div>
        <p className="text-ink">{caso.contexto}</p>
      </Card>

      {/* Pergunta + alternativas */}
      <Card className="p-5">
        <h2 className="font-display text-lg font-bold text-ink">{caso.pergunta}</h2>
        <div className="mt-4 space-y-2">
          {caso.opcoes.map((o) => {
            const selected = o.id === choiceId;
            const isBest = o.id === caso.melhorOpcaoId;
            const state = revealed
              ? isBest
                ? "best"
                : selected
                  ? "wrong"
                  : "muted"
              : selected
                ? "selected"
                : "idle";
            return (
              <button
                key={o.id}
                onClick={() => !revealed && setChoiceId(o.id)}
                disabled={revealed}
                className={cn(
                  "flex w-full items-center gap-3 rounded-control border px-4 py-3 text-left text-sm transition-colors",
                  state === "idle" && "border-border bg-surface hover:bg-surface-soft",
                  state === "selected" && "border-primary bg-primary-tint",
                  state === "best" && "border-success bg-[#e7f8ed]",
                  state === "wrong" && "border-cta bg-[#fff1e6]",
                  state === "muted" && "border-border bg-surface opacity-70",
                )}
              >
                <span
                  className={cn(
                    "grid h-5 w-5 shrink-0 place-items-center rounded-full border-2",
                    state === "best" ? "border-success bg-success text-white" : selected ? "border-primary bg-primary text-white" : "border-ink-3",
                  )}
                >
                  {(state === "best" || selected) && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
                <span className="text-ink">{o.texto}</span>
                {revealed && isBest && (
                  <Pill tone="success" className="ml-auto shrink-0">
                    Mais prudente
                  </Pill>
                )}
              </button>
            );
          })}
        </div>

        {!revealed && (
          <button onClick={confirmar} disabled={!choiceId} className={buttonClasses("primary") + " mt-5 w-full"}>
            Confirmar resposta
          </button>
        )}
      </Card>

      {/* Feedback de raciocínio */}
      {revealed && chosen && (
        <Feedback caso={caso} chosen={chosen} melhor={melhor} proximoSlug={proximo.slug} />
      )}

      <p className="pt-2 text-xs text-ink-3">
        Casos educacionais dependem da avaliação individual e não substituem julgamento profissional.
      </p>
    </div>
  );
}

function Feedback({
  caso,
  chosen,
  melhor,
  proximoSlug,
}: {
  caso: PracticeCase;
  chosen: CaseOption;
  melhor: CaseOption;
  proximoSlug: string;
}) {
  const acertou = chosen.correta;
  return (
    <div className="space-y-4">
      {/* Banner */}
      <Card className={cn("flex items-center gap-3 p-5", acertou ? "border-success" : "border-cta")}>
        <span
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-full text-white",
            acertou ? "bg-success" : "bg-cta",
          )}
        >
          {acertou ? <CheckCircle2 className="h-5 w-5" /> : <Brain className="h-5 w-5" />}
        </span>
        <div>
          <div className="font-display text-lg font-bold text-ink">
            {acertou ? "Escolha adequada" : "Vamos revisar o raciocínio"}
          </div>
          <div className="text-sm text-ink-2">
            {acertou
              ? "Sua decisão coincide com a alternativa mais prudente para este contexto."
              : "Não é 'errado' — é uma oportunidade de afinar o critério de decisão."}
          </div>
        </div>
        <Pill tone={trustTone[caso.trustLevel]} icon={<Info className="h-3 w-3" />} className="ml-auto hidden sm:inline-flex">
          {caso.trustLevel}
        </Pill>
      </Card>

      {/* 4 blocos de raciocínio */}
      <div className="grid gap-4 md:grid-cols-2">
        <FeedbackBlock
          tone={acertou ? "success" : "cta"}
          icon={<Target className="h-4 w-4" />}
          title={acertou ? "Por que funciona" : "Por que não é a melhor"}
          text={chosen.analise}
        />
        <FeedbackBlock
          tone="primary"
          icon={<Info className="h-4 w-4" />}
          title="Critério de decisão"
          text={chosen.criterio}
        />
        {!acertou && (
          <FeedbackBlock
            tone="success"
            icon={<CheckCircle2 className="h-4 w-4" />}
            title="Escolha mais prudente"
            text={`${melhor.texto} — ${melhor.analise}`}
          />
        )}
        <FeedbackBlock
          tone="analysis"
          icon={<Sparkles className="h-4 w-4" />}
          title="O que lembrar"
          text={chosen.lembrar}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Link to={`/cases/${proximoSlug}`} className={buttonClasses("primary")}>
          Próximo caso <ArrowRight className="h-4 w-4" />
        </Link>
        <Link to="/cases" className={buttonClasses("secondary")}>
          <RefreshCcw className="h-4 w-4" /> Todos os casos
        </Link>
      </div>
    </div>
  );
}

function FeedbackBlock({
  tone,
  icon,
  title,
  text,
}: {
  tone: "success" | "cta" | "primary" | "analysis";
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  const bg: Record<string, string> = {
    success: "bg-[#e7f8ed] text-success",
    cta: "bg-[#fff1e6] text-[color:var(--cta-text)]",
    primary: "bg-primary-tint text-primary",
    analysis: "bg-[#e0f7f9] text-analysis",
  };
  return (
    <Card className="p-5">
      <div className="mb-2 flex items-center gap-2">
        <span className={cn("grid h-8 w-8 place-items-center rounded-lg", bg[tone])}>{icon}</span>
        <h4 className="font-display text-base font-bold text-ink">{title}</h4>
      </div>
      <p className="text-sm text-ink">{text}</p>
    </Card>
  );
}
