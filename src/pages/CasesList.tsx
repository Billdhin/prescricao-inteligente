import * as React from "react";
import { Link } from "react-router-dom";
import { BookOpen, ArrowRight, Lock, Crown, SlidersHorizontal, Sparkles } from "lucide-react";
import { Card, Pill } from "@/components/ui/primitives";
import { cases } from "@/data/cases";
import { useUser, useProgress, isPremiumUnlocked, FREE_CASES_LIMIT } from "@/lib/store";
import { cn } from "@/lib/utils";

const DIFS = ["Todos", "Iniciante", "Intermediário", "Avançado"];

export function CasesList() {
  const plan = useUser((s) => s.plan);
  const unlocked = isPremiumUnlocked(plan);
  const resolvidos = useProgress((s) => s.casosResolvidos);

  const temas = ["Todos os temas", ...Array.from(new Set(cases.map((c) => c.tema)))];
  const [dif, setDif] = React.useState("Todos");
  const [tema, setTema] = React.useState("Todos os temas");

  const filtered = cases.filter(
    (c) =>
      (dif === "Todos" || c.dificuldade === dif) &&
      (tema === "Todos os temas" || c.tema === tema),
  );

  const restantes = Math.max(0, FREE_CASES_LIMIT - resolvidos.length);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Pill tone="primary" icon={<BookOpen className="h-3 w-3" />} className="mb-3">
            Treino de decisão
          </Pill>
          <h1 className="font-display text-3xl font-bold text-ink md:text-4xl">Casos práticos</h1>
          <p className="mt-2 max-w-2xl text-ink-2">
            Escolha uma alternativa e receba feedback do raciocínio — o que funciona, qual critério
            foi ignorado e o que levar para a próxima situação.
          </p>
        </div>
        {unlocked ? (
          <Pill tone="success" icon={<Crown className="h-3 w-3" />}>
            Casos ilimitados
          </Pill>
        ) : (
          <Pill tone={restantes > 0 ? "primary" : "warning"}>
            {restantes} de {FREE_CASES_LIMIT} casos gratuitos restantes
          </Pill>
        )}
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
            <SlidersHorizontal className="h-4 w-4 text-ink-2" /> Filtros
          </span>
          <Chips options={DIFS} value={dif} onChange={setDif} />
          <span className="text-ink-3">·</span>
          <Chips options={temas} value={tema} onChange={setTema} />
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((c) => {
          const locked = c.premium && !unlocked;
          return (
            <Card key={c.id} className="flex flex-col p-5">
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="font-display text-lg font-bold text-ink">{c.titulo}</h3>
                {c.premium ? (
                  <Pill tone="cta" icon={<Sparkles className="h-3 w-3" />}>
                    Premium
                  </Pill>
                ) : (
                  <Pill tone="success">Gratuito</Pill>
                )}
              </div>
              <div className="mb-3 flex flex-wrap gap-1.5">
                <Pill tone="neutral">{c.tema}</Pill>
                <Pill tone={c.dificuldade === "Iniciante" ? "success" : "warning"}>{c.dificuldade}</Pill>
              </div>
              <p className="flex-1 text-sm text-ink-2">{c.contexto}</p>
              <Link
                to={`/cases/${c.slug}`}
                className={cn(
                  "mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-control font-semibold text-white",
                  "gradient-brand hover:opacity-95",
                )}
              >
                {locked ? <Lock className="h-4 w-4" /> : null}
                Resolver <ArrowRight className="h-4 w-4" />
              </Link>
            </Card>
          );
        })}
      </div>

      <p className="pt-2 text-xs text-ink-3">
        Casos educacionais dependem da avaliação individual e não substituem julgamento profissional.
        Use como treino de raciocínio.
      </p>
    </div>
  );
}

function Chips({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={cn(
            "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
            o === value
              ? "border-primary bg-primary-tint text-primary"
              : "border-border text-ink-2 hover:bg-surface-soft",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
