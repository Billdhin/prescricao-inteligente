import * as React from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  GitCompare, X, Plus, ArrowRight, Trophy, FlaskConical, BookOpen,
  Dumbbell, HeartPulse, Flame, Droplets, Info,
} from "lucide-react";
import { Card, Pill, ScoreRing, StatBar, SectionHeader, buttonClasses } from "@/components/ui/primitives";
import { exercises } from "@/data/exercises";
import type { Exercise } from "@/data/types";
import {
  cardioModalidades, type CardioModalidade,
  NIVEL_BAR, IMPACTO_BAR, NIVEL_LABEL, IMPACTO_LABEL,
} from "@/data/cardio";
import { cn, withBase } from "@/lib/utils";

const MAX = 4;
const COL_TONES = ["primary", "analysis", "cta", "success"] as const;
const COL_DOT = ["bg-primary", "bg-analysis", "bg-cta", "bg-success"];
const RING_TONES = ["primary", "analysis", "primary", "analysis"] as const;

function gridColsFor(n: number) {
  if (n <= 1) return "sm:grid-cols-1";
  if (n === 2) return "sm:grid-cols-2";
  if (n === 3) return "sm:grid-cols-3";
  return "sm:grid-cols-2 lg:grid-cols-4";
}

/* ============================ Bloco: Força ============================= */

const metricVal = (e: Exercise, nome: string, fb: number) =>
  e.indiceEficiencia.metrics.find((m) => m.nome === nome)?.valor ?? fb;

type MetricaForca = {
  key: string;
  label: string;
  get: (e: Exercise) => number;
  melhor: "maior" | "menor";
  hint?: string;
};

const METRICAS_FORCA: MetricaForca[] = [
  { key: "efic", label: "Índice de eficiência", get: (e) => e.indiceEficiencia.score, melhor: "maior" },
  { key: "ativ", label: "Ativação do músculo-alvo", get: (e) => e.ativacao[0]?.percentual ?? 0, melhor: "maior" },
  { key: "estab", label: "Estabilidade", get: (e) => metricVal(e, "Estabilidade", 50), melhor: "maior" },
  { key: "lombar", label: "Demanda lombar", get: (e) => metricVal(e, "Demanda lombar", 20), melhor: "menor", hint: "menor é melhor" },
  { key: "joelho", label: "Demanda de joelho", get: (e) => metricVal(e, "Demanda de joelho", 20), melhor: "menor", hint: "menor é melhor" },
  { key: "complex", label: "Complexidade técnica", get: (e) => metricVal(e, "Complexidade técnica", 30), melhor: "menor", hint: "menor é melhor" },
];

// exercícios puramente aeróbicos vivem no bloco Aeróbicos — fora da comparação de força
const CARDIO_EX_SLUGS = new Set(["caminhada-esteira", "bicicleta-ergometrica", "eliptico", "marcha-aquatica"]);
const forcaPool = exercises.filter((e) => !CARDIO_EX_SLUGS.has(e.slug));

function ForcaBloco({ base }: { base: string | null }) {
  const initial = React.useMemo(() => {
    const list: string[] = [];
    if (base && forcaPool.some((e) => e.slug === base)) list.push(base);
    for (const s of ["leg-press-45", "agachamento-livre"]) {
      if (list.length >= 2) break;
      if (!list.includes(s)) list.push(s);
    }
    return list.slice(0, MAX);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [sel, setSel] = React.useState<string[]>(initial);
  const selected = sel.map((s) => forcaPool.find((e) => e.slug === s)).filter(Boolean) as Exercise[];
  const toggle = (slug: string) =>
    setSel((c) => (c.includes(slug) ? c.filter((x) => x !== slug) : c.length < MAX ? [...c, slug] : c));

  const melhorIdx = (m: MetricaForca) => {
    if (selected.length === 0) return -1;
    let best = 0;
    selected.forEach((e, i) => {
      const v = m.get(e);
      const bv = m.get(selected[best]);
      if ((m.melhor === "maior" && v > bv) || (m.melhor === "menor" && v < bv)) best = i;
    });
    return best;
  };

  const insightEfic = selected.length >= 2 ? selected[melhorIdx(METRICAS_FORCA[0])] : null;
  const insightLombar = selected.length >= 2 ? selected[melhorIdx(METRICAS_FORCA[3])] : null;

  return (
    <>
      <Chips
        pool={forcaPool.map((e) => ({ id: e.slug, nome: e.nome }))}
        sel={sel}
        onToggle={toggle}
        vazio="Selecione ao menos um exercício para comparar."
      />

      {selected.length > 0 && (
        <>
          {/* Cabeçalhos */}
          <div className={cn("grid gap-4", gridColsFor(selected.length))}>
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
                    <ScoreRing value={e.indiceEficiencia.score} size={64} tone={RING_TONES[i]} />
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

          {/* Métricas */}
          <Card className="p-5 md:p-6">
            <h3 className="mb-4 font-display text-lg font-bold text-ink">Métricas lado a lado</h3>
            <div className="space-y-5">
              {METRICAS_FORCA.map((m) => {
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
                          <StatBar srLabel={e.nome} value={m.get(e)} tone={COL_TONES[i]} className="flex-1" />
                          {selected.length >= 2 && i === win && (
                            <Pill tone="success" className="shrink-0">melhor</Pill>
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
          <div className={cn("grid gap-4", gridColsFor(selected.length))}>
            {selected.map((e, i) => (
              <Card key={e.slug} className="p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className={cn("h-2.5 w-2.5 rounded-full", COL_DOT[i])} />
                  <h4 className="truncate font-display font-bold text-ink">{e.nome}</h4>
                </div>
                <ListaMini titulo="Quando usar" itens={e.blocos.quandoUsar.slice(0, 2)} tone="success" />
                <ListaMini titulo="Quando evitar" itens={e.blocos.quandoEvitar.slice(0, 2)} tone="cta" className="mt-3" />
              </Card>
            ))}
          </div>
        </>
      )}
    </>
  );
}

/* =========================== Bloco: Aeróbicos ========================== */

type MetricaCardio = {
  key: string;
  label: string;
  hint?: string;
  melhor: "maior" | "menor" | null;
  bar: (m: CardioModalidade) => number;
  display: (m: CardioModalidade) => string;
  sort: (m: CardioModalidade) => number;
};

const clamp100 = (n: number) => Math.max(0, Math.min(100, n));

const METRICAS_CARDIO: MetricaCardio[] = [
  {
    key: "kcal", label: "Gasto calórico", hint: "≈ 30 min · pessoa de ~70 kg", melhor: "maior",
    bar: (m) => clamp100((m.gastoCalorico / 450) * 100),
    display: (m) => `≈ ${m.gastoCalorico} kcal`,
    sort: (m) => m.gastoCalorico,
  },
  {
    key: "grupos", label: "Abrangência muscular", hint: "nº de grupos recrutados", melhor: "maior",
    bar: (m) => clamp100((m.gruposMusculares.length / 8) * 100),
    display: (m) => `${m.gruposMusculares.length} grupos`,
    sort: (m) => m.gruposMusculares.length,
  },
  {
    key: "impacto", label: "Impacto articular", hint: "menor poupa as articulações", melhor: "menor",
    bar: (m) => IMPACTO_BAR[m.impacto],
    display: (m) => IMPACTO_LABEL[m.impacto],
    sort: (m) => IMPACTO_BAR[m.impacto],
  },
  {
    key: "hidratacao", label: "Demanda de hidratação", hint: "reposição de líquidos (informativo)", melhor: null,
    bar: (m) => NIVEL_BAR[m.hidratacao],
    display: (m) => NIVEL_LABEL[m.hidratacao],
    sort: (m) => NIVEL_BAR[m.hidratacao],
  },
  {
    key: "tecnica", label: "Exigência técnica", hint: "menor = mais fácil de aprender", melhor: "menor",
    bar: (m) => NIVEL_BAR[m.tecnica],
    display: (m) => NIVEL_LABEL[m.tecnica],
    sort: (m) => NIVEL_BAR[m.tecnica],
  },
  {
    key: "acesso", label: "Praticidade e acesso", hint: "custo e logística", melhor: "maior",
    bar: (m) => NIVEL_BAR[m.acessibilidade],
    display: (m) => NIVEL_LABEL[m.acessibilidade],
    sort: (m) => NIVEL_BAR[m.acessibilidade],
  },
];

function CardioBloco() {
  const [sel, setSel] = React.useState<string[]>(["c-caminhada", "c-corrida"]);
  const selected = sel.map((s) => cardioModalidades.find((m) => m.id === s)).filter(Boolean) as CardioModalidade[];
  const toggle = (id: string) =>
    setSel((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length < MAX ? [...c, id] : c));

  const melhorIdx = (m: MetricaCardio) => {
    if (m.melhor === null || selected.length === 0) return -1;
    let best = 0;
    selected.forEach((mod, i) => {
      const v = m.sort(mod);
      const bv = m.sort(selected[best]);
      if ((m.melhor === "maior" && v > bv) || (m.melhor === "menor" && v < bv)) best = i;
    });
    return best;
  };

  const insightKcal = selected.length >= 2 ? selected[melhorIdx(METRICAS_CARDIO[0])] : null;
  const insightImpacto = selected.length >= 2 ? selected[melhorIdx(METRICAS_CARDIO[2])] : null;

  return (
    <>
      <Chips
        pool={cardioModalidades.map((m) => ({ id: m.id, nome: m.nome, emoji: m.emoji }))}
        sel={sel}
        onToggle={toggle}
        vazio="Selecione ao menos uma modalidade aeróbica para comparar."
      />

      {selected.length > 0 && (
        <>
          {/* Cabeçalhos */}
          <div className={cn("grid gap-4", gridColsFor(selected.length))}>
            {selected.map((m, i) => (
              <Card key={m.id} className="overflow-hidden">
                <div className={cn("h-1.5 w-full", COL_DOT[i])} />
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-surface-soft text-3xl" aria-hidden>
                      {m.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-display font-bold text-ink">{m.nome}</div>
                      <div className="truncate text-xs text-ink-3">{m.ambiente}</div>
                    </div>
                    <button
                      onClick={() => toggle(m.id)}
                      aria-label={`Remover ${m.nome}`}
                      className="shrink-0 rounded-md p-1 text-ink-3 hover:bg-surface-soft"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-end justify-between gap-2">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <Flame className="h-4 w-4 text-cta" />
                        <span className="font-display text-2xl font-bold text-ink tabular">{m.gastoCalorico}</span>
                        <span className="text-xs text-ink-3">kcal/30min</span>
                      </div>
                      <div className="mt-0.5 text-[11px] text-ink-3">{m.met} MET · esforço moderado</div>
                    </div>
                    <Pill tone={m.impacto === "alto" ? "warning" : m.impacto === "moderado" ? "neutral" : "success"}>
                      Impacto {IMPACTO_LABEL[m.impacto].toLowerCase()}
                    </Pill>
                  </div>
                  {m.slug && (
                    <Link
                      to={`/movement-lab/${m.slug}`}
                      className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                    >
                      <FlaskConical className="h-3.5 w-3.5" /> Ver no Laboratório
                    </Link>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Leitura rápida */}
          {selected.length >= 2 && insightKcal && insightImpacto && (
            <Card className="flex flex-wrap items-center gap-x-6 gap-y-2 p-4">
              <span className="inline-flex items-center gap-2 text-sm">
                <Flame className="h-4 w-4 text-cta" />
                <span className="text-ink-2">Maior gasto calórico:</span>
                <span className="font-semibold text-ink">{insightKcal.nome}</span>
              </span>
              <span className="inline-flex items-center gap-2 text-sm">
                <Trophy className="h-4 w-4 text-success" />
                <span className="text-ink-2">Menor impacto articular:</span>
                <span className="font-semibold text-ink">{insightImpacto.nome}</span>
              </span>
            </Card>
          )}

          {/* Métricas */}
          <Card className="p-5 md:p-6">
            <h3 className="mb-4 font-display text-lg font-bold text-ink">Marcadores lado a lado</h3>
            <div className="space-y-5">
              {METRICAS_CARDIO.map((m) => {
                const win = melhorIdx(m);
                return (
                  <div key={m.key}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-sm font-semibold text-ink">{m.label}</span>
                      {m.hint && <span className="text-[11px] text-ink-3">{m.hint}</span>}
                    </div>
                    <div className="space-y-1.5">
                      {selected.map((mod, i) => (
                        <div key={mod.id} className="flex items-center gap-2">
                          <CardioBar
                            srLabel={mod.nome}
                            value={m.bar(mod)}
                            display={m.display(mod)}
                            tone={COL_TONES[i]}
                            className="flex-1"
                          />
                          {selected.length >= 2 && i === win && (
                            <Pill tone="success" className="shrink-0">melhor</Pill>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Grupos musculares + quando usar/evitar */}
          <div className={cn("grid gap-4", gridColsFor(selected.length))}>
            {selected.map((m, i) => (
              <Card key={m.id} className="p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className={cn("h-2.5 w-2.5 rounded-full", COL_DOT[i])} />
                  <h4 className="truncate font-display font-bold text-ink">{m.nome}</h4>
                </div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Grupos musculares
                  </span>
                  <span className="text-[11px] font-semibold text-ink-3">{m.gruposMusculares.length}</span>
                </div>
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {m.gruposMusculares.map((g) => (
                    <Pill key={g} tone="primary">{g}</Pill>
                  ))}
                </div>
                <ListaMini titulo="Quando usar" itens={m.quandoUsar} tone="success" />
                <ListaMini titulo="Quando evitar" itens={m.quandoEvitar} tone="cta" className="mt-3" />
                {m.observacao && (
                  <p className="mt-3 flex gap-2 rounded-lg bg-[#e6f7f9] p-2.5 text-[11px] leading-relaxed text-[#0e7c8a]">
                    <Droplets className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{m.observacao}</span>
                  </p>
                )}
              </Card>
            ))}
          </div>
        </>
      )}
    </>
  );
}

/* =========================== UI compartilhada ========================== */

function Chips({
  pool, sel, onToggle, vazio,
}: {
  pool: { id: string; nome: string; emoji?: string }[];
  sel: string[];
  onToggle: (id: string) => void;
  vazio: string;
}) {
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-ink">Escolha para comparar</span>
        <span className="text-xs text-ink-3">{sel.length}/{MAX} selecionados</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {pool.map((it) => {
          const on = sel.includes(it.id);
          const full = !on && sel.length >= MAX;
          return (
            <button
              key={it.id}
              onClick={() => onToggle(it.id)}
              disabled={full}
              aria-pressed={on}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                on
                  ? "border-primary bg-primary-tint text-primary"
                  : full
                    ? "cursor-not-allowed border-border text-ink-3 opacity-50"
                    : "border-border text-ink-2 hover:bg-surface-soft",
              )}
            >
              {on ? <X className="h-3.5 w-3.5" /> : it.emoji ? <span aria-hidden>{it.emoji}</span> : <Plus className="h-3.5 w-3.5" />}
              {it.nome}
            </button>
          );
        })}
      </div>
      {sel.length === 0 && <p className="mt-4 text-sm text-ink-2">{vazio}</p>}
    </Card>
  );
}

function CardioBar({
  value, display, tone, srLabel, className,
}: {
  value: number;
  display: string;
  tone: (typeof COL_TONES)[number];
  srLabel: string;
  className?: string;
}) {
  const v = clamp100(value);
  const fill: Record<string, string> = {
    primary: "bg-primary", cta: "bg-cta", analysis: "bg-analysis", success: "bg-success",
  };
  return (
    <div className={cn("flex items-center gap-3", className)} aria-label={`${srLabel}: ${display}`}>
      <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-surface-soft">
        <div className={cn("h-full rounded-full transition-[width] duration-500", fill[tone])} style={{ width: `${v}%` }} />
      </div>
      <span className="w-24 shrink-0 text-right text-sm font-semibold text-ink tabular">{display}</span>
    </div>
  );
}

function ListaMini({
  titulo, itens, tone, className,
}: {
  titulo: string;
  itens: string[];
  tone: "success" | "cta";
  className?: string;
}) {
  const dot = tone === "success" ? "bg-success" : "bg-cta";
  const head = tone === "success" ? "text-success" : "text-[color:var(--cta-text)]";
  return (
    <div className={className}>
      <div className={cn("mb-1 text-xs font-semibold uppercase tracking-wider", head)}>{titulo}</div>
      <ul className="space-y-1">
        {itens.map((it) => (
          <li key={it} className="flex gap-2 text-sm text-ink-2">
            <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", dot)} />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* =============================== Página =============================== */

type Bloco = "forca" | "cardio";

export function Comparador() {
  const [params] = useSearchParams();
  const base = params.get("base");
  // deep link ?base= aponta para um exercício de força → abre nesse bloco
  const [bloco, setBloco] = React.useState<Bloco>("forca");

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <SectionHeader
        eyebrow="Laboratório"
        icon={<GitCompare className="h-3 w-3" />}
        title="Comparador de exercícios"
        subtitle="Compare até 4 opções lado a lado e decida com critério. Dois blocos: treino de força e modalidades aeróbicas — cada um com os marcadores que realmente importam para aquela escolha."
      />

      {/* Seletor de bloco */}
      <div role="tablist" aria-label="Bloco de comparação" className="inline-flex rounded-control border border-border bg-surface p-1">
        <BlocoTab ativo={bloco === "forca"} onClick={() => setBloco("forca")} icon={<Dumbbell className="h-4 w-4" />}>
          Treino de força
        </BlocoTab>
        <BlocoTab ativo={bloco === "cardio"} onClick={() => setBloco("cardio")} icon={<HeartPulse className="h-4 w-4" />}>
          Aeróbicos / cardio
        </BlocoTab>
      </div>

      {bloco === "forca" ? <ForcaBloco base={base} /> : <CardioBloco />}

      <div className="flex flex-wrap gap-2">
        <Link to="/movement-lab" className={buttonClasses("secondary", "sm")}>
          <FlaskConical className="h-4 w-4" /> Ir ao Laboratório
        </Link>
        <Link to="/gps" className={buttonClasses("secondary", "sm")}>
          Usar o GPS da Prescrição <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <Card variant="soft" className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#e6f7f9] text-[#0e7c8a]">
            {bloco === "forca" ? <BookOpen className="h-4 w-4" /> : <Info className="h-4 w-4" />}
          </span>
          <h4 className="font-display text-sm font-bold text-ink">Como ler estes números</h4>
        </div>
        {bloco === "forca" ? (
          <p className="text-xs leading-relaxed text-ink-2">
            Eficiência, ativação e demandas são <span className="font-semibold text-ink">estimativas
            relativas</span> sintetizadas da literatura de EMG e biomecânica (ex.: Boeckh-Behrens &amp;
            Buskies 2000; Escamilla et al. 1998/2001; Contreras et al. 2015; Andersen et al. 2014;
            Ekstrom et al. 2007). Servem para comparar a ênfase entre exercícios — não são medições do
            seu aluno. As fontes completas ficam na aba <span className="font-semibold text-ink">Biomecânica</span> do Laboratório.
          </p>
        ) : (
          <p className="text-xs leading-relaxed text-ink-2">
            O gasto calórico é uma <span className="font-semibold text-ink">estimativa</span> para uma pessoa
            de ~70 kg em 30 min de esforço moderado, derivada do valor de MET de cada atividade (Compendium
            of Physical Activities — Ainsworth et al., 2011; fórmula ACSM). Varia com peso, intensidade e
            aptidão. Impacto, hidratação, técnica e praticidade são leituras qualitativas para apoiar a
            escolha — não são medições do seu aluno. Ajuste sempre ao caso e à diretriz vigente.
          </p>
        )}
      </Card>

      <p className="pt-2 text-xs text-ink-3">
        Conteúdo educacional — não substitui avaliação profissional individualizada.
      </p>
    </div>
  );
}

function BlocoTab({
  ativo, onClick, icon, children,
}: {
  ativo: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      role="tab"
      aria-selected={ativo}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-[7px] px-3.5 py-2 text-sm font-semibold transition-colors",
        ativo ? "gradient-brand text-white shadow-elevated" : "text-ink-2 hover:bg-surface-soft",
      )}
    >
      {icon}
      {children}
    </button>
  );
}
