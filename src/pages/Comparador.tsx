import * as React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { GitCompare, X, Plus, ArrowRight, Trophy, FlaskConical } from "lucide-react";
import { Card, Pill, ScoreRing, StatBar, SectionHeader, buttonClasses } from "@/components/ui/primitives";
import { exercises } from "@/data/exercises";
import type { Exercise } from "@/data/types";
import { cn, withBase } from "@/lib/utils";

const metricVal = (e: Exercise, nome: string, fb: number) =>
  e.indiceEficiencia.metrics.find((m) => m.nome === nome)?.valor ?? fb;

type Metrica = {
  key: string;
  label: string;
  get: (e: Exercise) => number;
  melhor: "maior" | "menor";
  hint?: string;
};

const METRICAS: Metrica[] = [
  { key: "efic", label: "Índice de eficiência", get: (e) => e.indiceEficiencia.score, melhor: "maior" },
  { key: "ativ", label: "Ativação do músculo-alvo", get: (e) => e.ativacao[0]?.percentual ?? 0, melhor: "maior" },
  { key: "estab", label: "Estabilidade", get: (e) => metricVal(e, "Estabilidade", 50), melhor: "maior" },
  { key: "lombar", label: "Demanda lombar", get: (e) => metricVal(e, "Demanda lombar", 20), melhor: "menor", hint: "menor é melhor" },
  { key: "joelho", label: "Demanda de joelho", get: (e) => metricVal(e, "Demanda de joelho", 20), melhor: "menor", hint: "menor é melhor" },
  { key: "complex", label: "Complexidade técnica", get: (e) => metricVal(e, "Complexidade técnica", 30), melhor: "menor", hint: "menor é melhor" },
];

const COL_TONES = ["primary", "analysis", "cta"] as const;
const COL_DOT = ["bg-primary", "bg-analysis", "bg-cta"];

export function Comparador() {
  const [params] = useSearchParams();
  const base = params.get("base");

  const initial = React.useMemo(() => {
    const list: string[] = [];
    if (base && exercises.some((e) => e.slug === base)) list.push(base);
    for (const s of ["leg-press-45", "agachamento-livre"]) {
      if (list.length >= 2) break;
      if (!list.includes(s)) list.push(s);
    }
    return list.slice(0, 3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [sel, setSel] = React.useState<string[]>(initial);
  const selected = sel.map((s) => exercises.find((e) => e.slug === s)).filter(Boolean) as Exercise[];

  const toggle = (slug: string) =>
    setSel((c) => (c.includes(slug) ? c.filter((x) => x !== slug) : c.length < 3 ? [...c, slug] : c));

  // melhor por métrica (índice da coluna vencedora)
  const melhorIdx = (m: Metrica) => {
    if (selected.length === 0) return -1;
    let best = 0;
    selected.forEach((e, i) => {
      const v = m.get(e);
      const bv = m.get(selected[best]);
      if ((m.melhor === "maior" && v > bv) || (m.melhor === "menor" && v < bv)) best = i;
    });
    return best;
  };

  const insightEfic = selected.length >= 2 ? selected[melhorIdx(METRICAS[0])] : null;
  const insightLombar = selected.length >= 2 ? selected[melhorIdx(METRICAS[3])] : null;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <SectionHeader
        eyebrow="Laboratório"
        icon={<GitCompare className="h-3 w-3" />}
        title="Comparador de exercícios"
        subtitle="Escolha até 3 exercícios e veja os trade-offs lado a lado — eficiência, ativação e demandas — para decidir com critério."
      />

      {/* Seleção */}
      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-ink">Escolha os exercícios</span>
          <span className="text-xs text-ink-3">{selected.length}/3 selecionados</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {exercises.map((e) => {
            const on = sel.includes(e.slug);
            const full = !on && sel.length >= 3;
            return (
              <button
                key={e.slug}
                onClick={() => toggle(e.slug)}
                disabled={full}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                  on
                    ? "border-primary bg-primary-tint text-primary"
                    : full
                      ? "cursor-not-allowed border-border text-ink-3 opacity-50"
                      : "border-border text-ink-2 hover:bg-surface-soft",
                )}
              >
                {on ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                {e.nome}
              </button>
            );
          })}
        </div>
      </Card>

      {selected.length === 0 ? (
        <Card className="grid place-items-center p-10 text-center text-ink-2">
          Selecione ao menos um exercício para comparar.
        </Card>
      ) : (
        <>
          {/* Cabeçalhos dos exercícios */}
          <div className={cn("grid gap-4", selected.length === 1 ? "sm:grid-cols-1" : selected.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3")}>
            {selected.map((e, i) => (
              <Card key={e.slug} className="overflow-hidden">
                <div className={cn("h-1.5 w-full", COL_DOT[i])} />
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    {e.imagem && (
                      <img src={withBase(e.imagem)} alt="" className="h-14 w-20 shrink-0 rounded-lg object-cover" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-display font-bold text-ink">{e.nome}</div>
                      <div className="truncate text-xs text-ink-3">{e.grupoMuscular}</div>
                    </div>
                    <button
                      onClick={() => toggle(e.slug)}
                      aria-label={`Remover ${e.nome}`}
                      className="shrink-0 rounded-md p-1 text-ink-3 hover:bg-surface-soft"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <ScoreRing value={e.indiceEficiencia.score} size={64} tone={i === 1 ? "analysis" : "primary"} />
                    <div className="flex flex-wrap gap-1.5">
                      <Pill tone="neutral">{e.equipamento}</Pill>
                      <Pill tone="neutral">{e.nivel}</Pill>
                      {e.premium ? <Pill tone="cta">Premium</Pill> : <Pill tone="success">Gratuito</Pill>}
                    </div>
                  </div>
                  <Link
                    to={`/movement-lab/${e.slug}`}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                  >
                    <FlaskConical className="h-3.5 w-3.5" /> Ver no Laboratório
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          {/* Leitura rápida */}
          {selected.length >= 2 && insightEfic && insightLombar && (
            <Card className="flex flex-wrap items-center gap-x-6 gap-y-2 p-4">
              <span className="inline-flex items-center gap-2 text-sm">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="text-ink-2">Maior eficiência:</span>
                <span className="font-semibold text-ink">{insightEfic.nome}</span>
              </span>
              <span className="inline-flex items-center gap-2 text-sm">
                <Trophy className="h-4 w-4 text-success" />
                <span className="text-ink-2">Menor demanda lombar:</span>
                <span className="font-semibold text-ink">{insightLombar.nome}</span>
              </span>
            </Card>
          )}

          {/* Métricas lado a lado */}
          <Card className="p-5 md:p-6">
            <h3 className="mb-4 font-display text-lg font-bold text-ink">Métricas lado a lado</h3>
            <div className="space-y-5">
              {METRICAS.map((m) => {
                const win = melhorIdx(m);
                return (
                  <div key={m.key}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-sm font-semibold text-ink">{m.label}</span>
                      {m.hint && <span className="text-[11px] text-ink-3">{m.hint}</span>}
                    </div>
                    <div className="space-y-1.5">
                      {selected.map((e, i) => (
                        <div key={e.slug} className="flex items-center gap-2">
                          <StatBar label={e.nome} value={m.get(e)} tone={COL_TONES[i]} className="flex-1" />
                          {selected.length >= 2 && i === win && (
                            <Pill tone="success" className="shrink-0">
                              melhor
                            </Pill>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Quando usar / evitar */}
          <div className={cn("grid gap-4", selected.length === 1 ? "sm:grid-cols-1" : selected.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3")}>
            {selected.map((e, i) => (
              <Card key={e.slug} className="p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className={cn("h-2.5 w-2.5 rounded-full", COL_DOT[i])} />
                  <h4 className="truncate font-display font-bold text-ink">{e.nome}</h4>
                </div>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-success">Quando usar</div>
                <ul className="mb-3 space-y-1">
                  {e.blocos.quandoUsar.slice(0, 2).map((it) => (
                    <li key={it} className="flex gap-2 text-sm text-ink-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                      {it}
                    </li>
                  ))}
                </ul>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-cta">Quando evitar</div>
                <ul className="space-y-1">
                  {e.blocos.quandoEvitar.slice(0, 2).map((it) => (
                    <li key={it} className="flex gap-2 text-sm text-ink-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cta" />
                      {it}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </>
      )}

      <div className="flex flex-wrap gap-2">
        <Link to="/movement-lab" className={buttonClasses("secondary", "sm")}>
          <FlaskConical className="h-4 w-4" /> Ir ao Laboratório
        </Link>
        <Link to="/gps" className={buttonClasses("secondary", "sm")}>
          Usar o GPS da Prescrição <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <p className="pt-2 text-xs text-ink-3">
        Conteúdo educacional — não substitui avaliação profissional individualizada.
      </p>
    </div>
  );
}
