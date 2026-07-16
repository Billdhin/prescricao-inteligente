import * as React from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  GitCompare, X, Plus, ArrowRight, Trophy, FlaskConical, BookOpen,
  Dumbbell, HeartPulse, Flame, Droplets, Info, Activity,
} from "lucide-react";
import { Card, Pill, ScoreRing, StatBar, SectionHeader, buttonClasses } from "@/components/ui/primitives";
import { MetricaInfo } from "@/components/metrica/MetricaInfo";
import { MetricaBar } from "@/components/metrica/MetricaBar";
import { exercises } from "@/data/exercises";
import type { Exercise } from "@/data/types";
import {
  cardioModalidades, type CardioModalidade, cardioImagem,
  NIVEL_BAR, IMPACTO_BAR, NIVEL_LABEL, IMPACTO_LABEL,
} from "@/data/cardio";
import {
  INTENSIDADES, type Intensidade, TEMPOS_MIN, type TempoMin,
  PESO_PADRAO_KG, PESO_MIN_KG, PESO_MAX_KG, kcalModalidade,
} from "@/data/calorias";
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

/**
 * Sem fallback: dado ausente é `undefined`, não um número inventado.
 *
 * Antes, "Demanda lombar" ausente virava 20 e o exercício era COROADO como o de
 * menor demanda lombar com um número que não existia. Enquanto isso o motor
 * (engine.ts) se recusava a chutar e avisava "falta dado". Duas telas afirmavam
 * coisas opostas sobre o mesmo exercício.
 */
const metricVal = (e: Exercise, nome: string) => e.indiceEficiencia.metrics.find((m) => m.nome === nome)?.valor;

type MetricaForca = {
  key: string;
  label: string;
  get: (e: Exercise) => number | undefined;
  /** "depende" não elege campeão: não existe melhor sem saber o objetivo do aluno. */
  melhor: "maior" | "menor" | "depende";
  hint?: string;
};

const METRICAS_FORCA: MetricaForca[] = [
  { key: "efic", label: "Índice de eficiência", get: (e) => e.indiceEficiencia.score, melhor: "maior" },
  // A linha "Ativação relativa" saiu daqui: ela pegava `ativacao[0]` de cada exercício,
  // que é o alvo principal de CADA UM, e coroava "melhor" comparando 95 de glúteo do
  // hip thrust com 92 de quadríceps do leg press. São músculos diferentes, e cada valor
  // é relativo ao próprio músculo: não há o que comparar. A seção "Ativação muscular
  // comparada", abaixo, faz isso do jeito certo, uma linha por músculo.
  {
    key: "estab",
    label: "Apoio do equipamento",
    get: (e) => metricVal(e, "Apoio do equipamento"),
    melhor: "maior",
    hint: "apoio que a máquina dá",
  },
  { key: "controle", label: "Controle motor", get: (e) => metricVal(e, "Controle motor"), melhor: "depende" },
  { key: "lombar", label: "Demanda lombar", get: (e) => metricVal(e, "Demanda lombar"), melhor: "menor", hint: "menor é melhor" },
  { key: "joelho", label: "Demanda de joelho", get: (e) => metricVal(e, "Demanda de joelho"), melhor: "menor", hint: "menor é melhor" },
  { key: "complex", label: "Complexidade técnica", get: (e) => metricVal(e, "Complexidade técnica"), melhor: "menor", hint: "menor é melhor" },
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

  // Só existe campeão quando há dado nos dois lados. Com um lado sem dado,
  // apontar vencedor seria comparar um número com um chute.
  const melhorIdx = (m: MetricaForca) => {
    const comDado = selected
      .map((e, i) => ({ i, v: m.get(e) }))
      .filter((x): x is { i: number; v: number } => x.v !== undefined);
    if (comDado.length < 2 || m.melhor === "depende") return -1;
    return comDado.reduce((best, x) => ((m.melhor === "maior" ? x.v > best.v : x.v < best.v) ? x : best), comDado[0]).i;
  };

  // Busca por chave, não por posição: `METRICAS_FORCA[3]` fazia o insight de lombar
  // apontar para outra métrica assim que alguém inserisse uma linha no meio do array.
  const porChave = (k: string) => METRICAS_FORCA.find((m) => m.key === k)!;
  const insightEfic = selected.length >= 2 ? selected[melhorIdx(porChave("efic"))] : null;
  const insightLombar = selected.length >= 2 ? selected[melhorIdx(porChave("lombar"))] : null;

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
                    {/* o anel mostrava só "82", sem escala e sem o que 82 quer dizer */}
                    <ScoreRing value={e.indiceEficiencia.score} size={64} tone={RING_TONES[i]} label="de 100" />
                    <div className="min-w-0">
                      <MetricaInfo
                        nome="Índice de eficiência"
                        valor={e.indiceEficiencia.score}
                        className="text-xs font-semibold text-ink-2"
                      />
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        <Pill tone="neutral">{e.equipamento}</Pill>
                        <Pill tone="neutral">{e.nivel}</Pill>
                        {e.premium ? <Pill tone="cta">Premium</Pill> : <Pill tone="success">Gratuito</Pill>}
                      </div>
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

          {/* Ativação muscular comparada: o que os profissionais mais buscam. */}
          <AtivacaoComparada selected={selected} />

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

          {/* Outros marcadores de decisão (secundários à ativação) */}
          <Card className="p-5 md:p-6">
            <h3 className="mb-4 font-display text-lg font-bold text-ink">Outros marcadores de decisão</h3>
            <div className="space-y-5">
              {METRICAS_FORCA.map((m) => {
                const win = melhorIdx(m);
                return (
                  <div key={m.key}>
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      {/* O rótulo explica a si mesmo: escala, referencial e o que o valor
                          quer dizer na prática. Sem isso, "Complexidade 12" não defende ninguém. */}
                      <MetricaInfo nome={m.label} valor={m.get(selected[0])} className="text-sm font-semibold text-ink" />
                      {m.hint && <span className="shrink-0 text-[11px] text-ink-3">{m.hint}</span>}
                    </div>
                    <div className="space-y-1.5">
                      {selected.map((e, i) => (
                        // Dado ausente é dito, não preenchido com chute (a MetricaBar
                        // resolve os dois casos). O nome do exercício fica escrito em
                        // cada linha: ler a cor da barra para descobrir de quem é o
                        // número é trabalho que o leitor não deveria ter.
                        <div key={e.slug} className="flex items-center gap-2">
                          <MetricaBar
                            nome={m.label}
                            valor={m.get(e)}
                            tone={COL_TONES[i]}
                            rotuloTexto={e.nome}
                            className="flex-1"
                          />
                          {i === win && <Pill tone="success" className="shrink-0">melhor</Pill>}
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

/** kcal e MET já calculados por modalidade (dependem de intensidade/tempo/peso). */
type CardioCalc = Record<string, { kcal: number; met: number }>;

type MetricaCardio = {
  key: string;
  label: string;
  hint?: string;
  melhor: "maior" | "menor" | null;
  bar: (m: CardioModalidade, c: CardioCalc) => number;
  display: (m: CardioModalidade, c: CardioCalc) => string;
  sort: (m: CardioModalidade, c: CardioCalc) => number;
};

const clamp100 = (n: number) => Math.max(0, Math.min(100, n));

const METRICAS_CARDIO: MetricaCardio[] = [
  {
    // O gasto é recalculado ao vivo: a barra escala pela maior estimativa da tela.
    key: "kcal", label: "Gasto calórico", hint: "conforme intensidade e tempo", melhor: "maior",
    bar: (m, c) => {
      const vals = Object.values(c).map((x) => x.kcal);
      const max = Math.max(1, ...vals);
      return clamp100(((c[m.id]?.kcal ?? 0) / max) * 100);
    },
    // "≈ 0 kcal" dava a entender que a modalidade não gasta nada, quando na verdade
    // é a estimativa que não existe para ela.
    display: (m, c) => (c[m.id]?.kcal === undefined ? "sem estimativa" : `≈ ${c[m.id].kcal} kcal`),
    sort: (m, c) => c[m.id]?.kcal ?? 0,
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
  const [intensidade, setIntensidade] = React.useState<Intensidade>("moderado");
  const [minutos, setMinutos] = React.useState<TempoMin>(30);
  const [pesoKg, setPesoKg] = React.useState<number>(PESO_PADRAO_KG);
  const selected = sel.map((s) => cardioModalidades.find((m) => m.id === s)).filter(Boolean) as CardioModalidade[];
  const toggle = (id: string) =>
    setSel((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length < MAX ? [...c, id] : c));

  // Gasto calórico recalculado ao vivo conforme intensidade, tempo e peso.
  const calc = React.useMemo<CardioCalc>(() => {
    const out: CardioCalc = {};
    for (const m of selected) out[m.id] = kcalModalidade(m.id, intensidade, pesoKg, minutos, m.met);
    return out;
  }, [selected, intensidade, pesoKg, minutos]);

  const melhorIdx = (m: MetricaCardio) => {
    if (m.melhor === null || selected.length === 0) return -1;
    let best = 0;
    selected.forEach((mod, i) => {
      const v = m.sort(mod, calc);
      const bv = m.sort(selected[best], calc);
      if ((m.melhor === "maior" && v > bv) || (m.melhor === "menor" && v < bv)) best = i;
    });
    return best;
  };

  const insightKcal = selected.length >= 2 ? selected[melhorIdx(METRICAS_CARDIO[0])] : null;
  const insightImpacto = selected.length >= 2 ? selected[melhorIdx(METRICAS_CARDIO[2])] : null;
  const intensidadeLabel = INTENSIDADES.find((x) => x.id === intensidade)?.label.toLowerCase() ?? "";

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
          {/* Parâmetros do gasto calórico: intensidade + tempo + peso, ao vivo. */}
          <CardioParametros
            intensidade={intensidade}
            onIntensidade={setIntensidade}
            minutos={minutos}
            onMinutos={setMinutos}
            pesoKg={pesoKg}
            onPeso={setPesoKg}
          />

          {/* Cabeçalhos */}
          <div className={cn("grid gap-4", gridColsFor(selected.length))}>
            {selected.map((m, i) => (
              <Card key={m.id} className="overflow-hidden">
                <div className={cn("h-1.5 w-full", COL_DOT[i])} />
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={withBase(cardioImagem(m.id))}
                      alt=""
                      className="h-14 w-20 shrink-0 rounded-lg object-cover"
                      loading="lazy"
                    />
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
                        <span className="font-display text-2xl font-bold text-ink tabular">
                          {calc[m.id]?.kcal ?? 0}
                        </span>
                        <span className="text-xs text-ink-3">kcal/{minutos}min</span>
                      </div>
                      <div className="mt-0.5 text-[11px] text-ink-3">
                        {calc[m.id]?.met ?? m.met} MET · esforço {intensidadeLabel}
                      </div>
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
                            value={m.bar(mod, calc)}
                            display={m.display(mod, calc)}
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

/** Painel de parâmetros do gasto calórico: intensidade (leve/moderado/intenso),
 *  tempo (15..90 min) e peso corporal opcional. Recalcula o kcal ao vivo. */
function CardioParametros({
  intensidade, onIntensidade, minutos, onMinutos, pesoKg, onPeso,
}: {
  intensidade: Intensidade;
  onIntensidade: (v: Intensidade) => void;
  minutos: TempoMin;
  onMinutos: (v: TempoMin) => void;
  pesoKg: number;
  onPeso: (v: number) => void;
}) {
  const descricao = INTENSIDADES.find((x) => x.id === intensidade)?.descricao ?? "";
  // O campo guarda TEXTO enquanto o profissional digita. Corrigir o valor a cada
  // tecla travava o input: com 70 no campo, digitar "8" virava 708 e o limite
  // jogava para 200 (e apagar o campo caía para 30). Só ajusta ao sair do campo.
  const [pesoTexto, setPesoTexto] = React.useState(String(pesoKg));
  React.useEffect(() => setPesoTexto(String(pesoKg)), [pesoKg]);
  const confirmarPeso = () => {
    const n = Number(pesoTexto);
    const valido = pesoTexto.trim() !== "" && Number.isFinite(n);
    const final = valido ? Math.max(PESO_MIN_KG, Math.min(PESO_MAX_KG, Math.round(n))) : pesoKg;
    setPesoTexto(String(final));
    onPeso(final);
  };
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#fff1e6] text-[color:var(--cta-text)]">
          <Flame className="h-4 w-4" />
        </span>
        <div>
          <h3 className="font-display text-sm font-bold text-ink">Parâmetros do gasto calórico</h3>
          <p className="text-[11px] text-ink-3">Ajuste intensidade e tempo: o gasto recalcula na hora.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.4fr,1.4fr,1fr]">
        {/* Intensidade */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink-2" id="lbl-intensidade">
            Intensidade
          </label>
          <div role="radiogroup" aria-labelledby="lbl-intensidade" className="flex gap-1.5">
            {INTENSIDADES.map((it) => {
              const on = it.id === intensidade;
              return (
                <button
                  key={it.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => onIntensidade(it.id)}
                  className={cn(
                    "flex-1 rounded-control border px-2 py-2 text-sm font-semibold transition-colors",
                    on
                      ? "border-cta bg-[#fff1e6] text-[color:var(--cta-text)]"
                      : "border-border text-ink-2 hover:bg-surface-soft",
                  )}
                >
                  {it.label}
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 text-[11px] leading-snug text-ink-3">{descricao}.</p>
        </div>

        {/* Tempo */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink-2" id="lbl-tempo">
            Tempo de sessão
          </label>
          <div role="radiogroup" aria-labelledby="lbl-tempo" className="flex flex-wrap gap-1.5">
            {TEMPOS_MIN.map((t) => {
              const on = t === minutos;
              return (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => onMinutos(t)}
                  className={cn(
                    "rounded-control border px-3 py-2 text-sm font-semibold tabular transition-colors",
                    on
                      ? "border-primary bg-primary-tint text-primary"
                      : "border-border text-ink-2 hover:bg-surface-soft",
                  )}
                >
                  {t} min
                </button>
              );
            })}
          </div>
        </div>

        {/* Peso corporal (opcional) */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink-2" htmlFor="peso-corporal">
            Peso corporal
          </label>
          <div className="flex items-center gap-2">
            <input
              id="peso-corporal"
              type="number"
              inputMode="numeric"
              min={PESO_MIN_KG}
              max={PESO_MAX_KG}
              step={1}
              value={pesoTexto}
              onChange={(e) => {
                const txt = e.target.value;
                setPesoTexto(txt);
                // recalcula ao vivo só enquanto o que foi digitado já é um peso plausível
                const n = Number(txt);
                if (txt.trim() !== "" && Number.isFinite(n) && n >= PESO_MIN_KG && n <= PESO_MAX_KG) {
                  onPeso(Math.round(n));
                }
              }}
              onBlur={confirmarPeso}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
              className="input w-24 tabular"
              aria-describedby="peso-hint"
            />
            <span className="text-sm text-ink-3">kg</span>
          </div>
          <p id="peso-hint" className="mt-1.5 text-[11px] leading-snug text-ink-3">
            De {PESO_MIN_KG} a {PESO_MAX_KG} kg. Padrão de referência: {PESO_PADRAO_KG} kg.
          </p>
        </div>
      </div>
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

/** Comparação de ATIVAÇÃO MUSCULAR: qual exercício recruta mais cada músculo.
 *  É a comparação que os profissionais mais buscam (com respaldo de EMG). */
function AtivacaoComparada({ selected }: { selected: Exercise[] }) {
  const musculos = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const e of selected)
      for (const a of e.ativacao) map.set(a.musculo, Math.max(map.get(a.musculo) ?? 0, a.percentual));
    return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([m]) => m);
  }, [selected]);

  const pctDe = (e: Exercise, m: string) => e.ativacao.find((a) => a.musculo === m)?.percentual ?? null;

  return (
    <Card className="p-5 md:p-6">
      <div className="mb-1 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-tint text-primary">
          <Activity className="h-4 w-4" />
        </span>
        <h3 className="font-display text-lg font-bold text-ink">Ativação muscular comparada</h3>
      </div>
      <p className="mb-4 text-sm text-ink-2">
        Qual exercício recruta mais cada músculo. Cada valor vai de 0 a 100 e é relativo ao próprio músculo, não uma
        fatia do esforço total: os números de uma coluna não somam 100. Em cada linha, a maior ativação recebe o selo.{" "}
        <span className="font-semibold text-ink">Não listado</span> quer dizer que o músculo não está entre os alvos
        declarados daquele exercício, e não que a ativação seja zero.
      </p>
      <div className="space-y-4">
        {musculos.map((m) => {
          const vals = selected.map((e) => pctDe(e, m));
          const max = Math.max(...vals.map((v) => v ?? -1));
          return (
            <div key={m}>
              <div className="mb-1.5 text-sm font-semibold text-ink">{m}</div>
              <div className="space-y-1.5">
                {selected.map((e, i) => {
                  const v = vals[i];
                  const win = v != null && v > 0 && v === max && selected.length >= 2;
                  return (
                    <div key={e.slug} className="flex items-center gap-2">
                      <span className="w-24 shrink-0 truncate text-xs text-ink-2 sm:w-32" title={e.nome}>
                        {e.nome}
                      </span>
                      {v == null ? (
                        // Dizia "baixa", que é uma afirmação que o dado não sustenta: o
                        // exercício apenas não lista este músculo entre os alvos dele.
                        <div className="flex flex-1 items-center gap-2">
                          <div className="h-2 flex-1 rounded-full border border-dashed border-border" />
                          <span className="w-20 shrink-0 text-right text-xs text-ink-3">não listado</span>
                        </div>
                      ) : (
                        <StatBar srLabel={`${e.nome}: ${m}`} value={v} tone={COL_TONES[i]} className="flex-1" />
                      )}
                      {win ? (
                        <Pill tone="success" className="shrink-0">mais recruta</Pill>
                      ) : (
                        <span className="w-[76px] shrink-0" aria-hidden />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-ink-3">
        Base científica: atlas e estudos de EMG comparado (Boeckh-Behrens &amp; Buskies 2000; Contreras et al. 2015;
        Andersen et al. 2014; Rodríguez-Ridao et al. 2020; Ekstrom et al. 2007). Comparam a ênfase entre exercícios;
        não medem o seu aluno.
      </p>
    </Card>
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
        subtitle="Compare até 4 opções lado a lado e decida com critério. Dois blocos: treino de força e modalidades aeróbicas, cada um com os marcadores que realmente importam para aquela escolha."
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
            Ekstrom et al. 2007). Servem para comparar a ênfase entre exercícios; não são medições do
            seu aluno. As fontes completas ficam na aba <span className="font-semibold text-ink">Biomecânica</span> do Laboratório.
          </p>
        ) : (
          <p className="text-xs leading-relaxed text-ink-2">
            O gasto calórico é uma <span className="font-semibold text-ink">estimativa</span> recalculada a
            partir da intensidade, do tempo e do peso que você escolher. Cada atividade tem um valor de MET
            de referência por intensidade (leve, moderado, intenso), e o cálculo segue a fórmula do ACSM (kcal
            = MET × 3,5 × peso em kg ÷ 200 × minutos). Os METs vêm do Compendium of Physical Activities
            (Ainsworth et al., 2011). O resultado varia com aptidão, terreno e economia de movimento, então
            trate o número como ordem de grandeza. Impacto, hidratação, técnica e praticidade são leituras
            qualitativas para apoiar a escolha; não são medições do seu aluno. Ajuste sempre ao caso e à
            diretriz vigente.
          </p>
        )}
      </Card>

      <p className="pt-2 text-xs text-ink-3">
        Conteúdo educacional; não substitui avaliação profissional individualizada.
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
