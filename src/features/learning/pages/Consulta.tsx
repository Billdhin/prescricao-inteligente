import * as React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Sparkles, Eye, Target, ShieldAlert, BookOpen, Stethoscope, ArrowRight } from "lucide-react";
import { Card, Pill, SectionHeader, Eyebrow, buttonClasses } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { getLearningRepository } from "../repository";
import { EmptyState } from "../components/shared";
import { useAprender } from "../store";
import { normalizar } from "../utils";
import type { QuickAnswer } from "../types";

const repo = getLearningRepository();

const SUGESTOES = [
  "Joelho avançar no agachamento",
  "Treinar com hipertensão",
  "Dor lombar e levantamento terra",
  "Intervalo para hipertrofia",
  "Fadiga periférica",
  "Diferença entre força e potência",
];

function pontuar(a: QuickAnswer, q: string): number {
  const nq = normalizar(q);
  if (!nq) return 0;
  let score = 0;
  for (const k of a.keywords) if (normalizar(k).includes(nq) || nq.includes(normalizar(k))) score += 2;
  if (normalizar(a.question).includes(nq)) score += 3;
  if (normalizar(a.summary).includes(nq)) score += 1;
  return score;
}

export function Consulta({ embedded = false }: { embedded?: boolean } = {}) {
  const [params, setParams] = useSearchParams();
  const inicial = params.get("q") ?? "";
  const [busca, setBusca] = React.useState(inicial);
  const pushSearch = useAprender((s) => s.pushSearch);
  const answers = repo.getQuickAnswers();

  React.useEffect(() => {
    setBusca(inicial);
  }, [inicial]);

  const resultados = busca.trim()
    ? answers
        .map((a) => ({ a, s: pontuar(a, busca) }))
        .filter((x) => x.s > 0)
        .sort((x, y) => y.s - x.s)
        .map((x) => x.a)
    : [];

  // Estado inicial útil: as MESMAS sugestões, mas as 3 primeiras que casam com uma
  // resposta viram cards clicáveis com a pergunta completa (um toque até o valor),
  // e o resto segue como chip. Não inventa perguntas: reusa SUGESTOES.
  const promovidas = React.useMemo(() => {
    const vistos = new Set<string>();
    const out: { termo: string; answer: QuickAnswer }[] = [];
    for (const termo of SUGESTOES) {
      if (out.length >= 3) break;
      const best = answers.map((a) => ({ a, s: pontuar(a, termo) })).sort((x, y) => y.s - x.s)[0];
      if (best && best.s > 0 && !vistos.has(best.a.id)) {
        vistos.add(best.a.id);
        out.push({ termo, answer: best.a });
      }
    }
    return out;
  }, [answers]);
  const restantes = SUGESTOES.filter((s) => !promovidas.some((p) => p.termo === s));

  const submit = (text: string) => {
    const t = text.trim();
    setBusca(t);
    if (t) pushSearch(t);
    setParams(t ? { q: t } : {});
  };

  return (
    <div className={cn(embedded ? "space-y-6" : "mx-auto max-w-3xl space-y-6")}>
      {!embedded && (
        <SectionHeader
          eyebrow="Aprender"
          icon={<Search className="h-3 w-3" />}
          title="Consulta rápida"
          subtitle="Uma resposta visual e prudente para aplicar no atendimento, com o que observar e os limites."
        />
      )}

      <form onSubmit={(e) => { e.preventDefault(); submit(busca); }} className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Ex.: joelho no agachamento, hipertensão, intervalo para hipertrofia..."
          aria-label="Consulta rápida"
          className="input pl-9"
          autoFocus={!embedded}
        />
      </form>

      {!busca.trim() ? (
        <div>
          <Eyebrow className="mb-2">Perguntas frequentes</Eyebrow>
          <div className="space-y-2">
            {promovidas.map(({ termo, answer }) => (
              <button
                key={termo}
                onClick={() => submit(termo)}
                className="group flex w-full items-start gap-3 rounded-card border border-border bg-surface p-4 text-left shadow-soft transition-shadow hover:shadow-elevated"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-primary-tint text-primary">
                  <Search className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-ink group-hover:text-primary">{answer.question}</span>
                  <span className="mt-0.5 line-clamp-2 block text-sm text-ink-2">{answer.summary}</span>
                </span>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5" />
              </button>
            ))}
          </div>
          {restantes.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {restantes.map((s) => (
                <button key={s} onClick={() => submit(s)} className="rounded-full border border-border px-3 py-1.5 text-sm text-ink-2 hover:bg-surface-soft">
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : resultados.length === 0 ? (
        <EmptyState
          icon={<Search className="h-5 w-5" />}
          title="Não encontramos uma resposta para esta busca"
          description="Tente outros termos, ou explore as disciplinas e os casos para aprofundar."
          actionLabel="Ver disciplinas"
          actionHref="/aprender/disciplinas"
        />
      ) : (
        <div className="space-y-4">
          {resultados.map((a) => (
            <QuickAnswerCard key={a.id} a={a} />
          ))}
        </div>
      )}
    </div>
  );
}

function QuickAnswerCard({ a }: { a: QuickAnswer }) {
  return (
    <Card className="p-5">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
        <Sparkles className="h-3.5 w-3.5" /> Resposta visual
      </div>
      <h2 className="font-display text-lg font-bold text-ink">{a.question}</h2>
      <p className="mt-1 text-ink-2">{a.summary}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Bloco titulo="Pontos centrais" icon={<Target className="h-3.5 w-3.5" />}>
          <ul className="space-y-1">
            {a.keyPoints.map((p, i) => (
              <li key={i} className="flex items-start gap-1.5"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{p}</li>
            ))}
          </ul>
        </Bloco>
        <Bloco titulo="O que observar" icon={<Eye className="h-3.5 w-3.5" />}>
          <ul className="space-y-1">
            {a.observe.map((p, i) => (
              <li key={i} className="flex items-start gap-1.5"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-analysis" />{p}</li>
            ))}
          </ul>
        </Bloco>
      </div>

      <div className="mt-3 rounded-xl bg-success-tint p-3 text-sm text-ink">
        <span className="font-semibold text-success">Aplicação. </span>{a.application}
      </div>
      <div className="mt-2 flex items-start gap-2 rounded-xl bg-warning-tint p-3 text-sm text-ink-2">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--cta-text)]" />
        <span><span className="font-semibold text-ink">Limites. </span>{a.limits}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {(a.relatedLessons ?? []).map((slug) => {
          const l = repo.getLesson(slug);
          if (!l) return null;
          return (
            <Link key={slug} to={`/aprender/conteudos/${slug}`} className={buttonClasses("secondary", "sm")}>
              <BookOpen className="h-4 w-4" /> {l.title.length > 40 ? l.title.slice(0, 40) + "..." : l.title}
            </Link>
          );
        })}
        {(a.relatedCases ?? []).map((slug) => {
          const c = repo.getCase(slug);
          if (!c) return null;
          return (
            <Link key={slug} to={`/aprender/casos/${slug}`} className={buttonClasses("secondary", "sm")}>
              <Stethoscope className="h-4 w-4" /> {c.title}
            </Link>
          );
        })}
      </div>

      {a.references && a.references.length > 0 && (
        <div className="mt-3 text-xs text-ink-3">
          Referência:{" "}
          {a.references.map((rid, i) => {
            const r = repo.getReference(rid);
            if (!r) return null;
            return (
              <span key={rid}>
                {i > 0 && "; "}
                {r.validationStatus === "a-validar" ? "a validar (editorial)" : `${r.authors.split(",")[0]} (${r.year})`}
              </span>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function Bloco({ titulo, icon, children }: { titulo: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border p-3">
      <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-3">{icon}{titulo}</div>
      <div className="text-sm text-ink-2">{children}</div>
    </div>
  );
}
