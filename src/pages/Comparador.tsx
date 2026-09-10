import * as React from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  X, Plus, ArrowRight, Trophy, Search, Check, FlaskConical,
  Dumbbell, HeartPulse, Flame, Droplets, Info,
} from "lucide-react";
import { Card, Pill, buttonClasses } from "@/components/ui/primitives";
import { MetricaInfo } from "@/components/metrica/MetricaInfo";
import { getMetrica, faixaDe } from "@/data/metricasGlossario";
import { LIMIAR_ATIVA_MAIS } from "@/lib/movement-lab/compararMusculos";
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
  /** a frase que o "O que os números dizem" usa quando este exercício vence o marcador */
  frase?: (v: number, outro: number) => string;
};

/*
 * OS MARCADORES DE DECISÃO (protótipo: coluna da direita).
 *
 * Todos saem de `indiceEficiencia.metrics`, que é a base que o glossário define. Dois
 * entraram agora porque a base já tinha e a tela não mostrava: "Demanda de ombro" (92 dos
 * 108 exercícios) e "Requisito de mobilidade" (88). Um marcador só aparece quando pelo
 * menos um dos exercícios escolhidos tem o dado: comparar Leg press com Cadeira extensora
 * não precisa de uma linha inteira dizendo "sem dado" duas vezes para o ombro.
 */
const METRICAS_FORCA: MetricaForca[] = [
  {
    key: "efic",
    label: "Índice de eficiência",
    get: (e) => e.indiceEficiencia.score,
    melhor: "maior",
    frase: (v, o) => `tem a maior eficiência (${v} contra ${o})`,
  },
  // A linha "Ativação relativa" saiu daqui: ela pegava `ativacao[0]` de cada exercício,
  // que é o alvo principal de CADA UM, e coroava "melhor" comparando 95 de glúteo do
  // hip thrust com 92 de quadríceps do leg press. São músculos diferentes, e cada valor
  // é relativo ao próprio músculo. A "Ativação muscular", ao lado, faz isso do jeito
  // certo, uma linha por músculo.
  {
    key: "estab",
    label: "Apoio do equipamento",
    get: (e) => metricVal(e, "Apoio do equipamento"),
    melhor: "maior",
    frase: (v, o) => `dá mais apoio do equipamento (${v} contra ${o})`,
  },
  {
    key: "lombar",
    label: "Demanda lombar",
    get: (e) => metricVal(e, "Demanda lombar"),
    melhor: "menor",
    frase: (v, o) => `pede menos da lombar (${v} contra ${o})`,
  },
  {
    key: "joelho",
    label: "Demanda de joelho",
    get: (e) => metricVal(e, "Demanda de joelho"),
    melhor: "menor",
    frase: (v, o) => `cobra menos do joelho (${v} contra ${o})`,
  },
  {
    key: "ombro",
    label: "Demanda de ombro",
    get: (e) => metricVal(e, "Demanda de ombro"),
    melhor: "menor",
    frase: (v, o) => `cobra menos do ombro (${v} contra ${o})`,
  },
  {
    key: "complex",
    label: "Complexidade técnica",
    get: (e) => metricVal(e, "Complexidade técnica"),
    melhor: "menor",
    frase: (v, o) => `é mais simples de executar (${v} contra ${o})`,
  },
  {
    key: "mobilidade",
    label: "Requisito de mobilidade",
    get: (e) => metricVal(e, "Requisito de mobilidade"),
    melhor: "menor",
    frase: (v, o) => `exige menos mobilidade (${v} contra ${o})`,
  },
  { key: "controle", label: "Controle motor", get: (e) => metricVal(e, "Controle motor"), melhor: "depende" },
];

/*
 * O LIMIAR PARA DIZER "MELHOR" É O MESMO DA ATIVAÇÃO.
 *
 * `LIMIAR_ATIVA_MAIS` (10 pontos) é escolha declarada da casa para afirmar que um exercício
 * ativa mais que outro: os números são estimativa sintetizada da literatura, e coroar por
 * 3 pontos é precisão falsa. Os marcadores são o mesmo tipo de número (0 a 100, relativo,
 * da mesma síntese), então valem pela mesma régua. O protótipo marcava vencedor por 8
 * pontos (apoio 86 contra 78); aqui, abaixo de 10, a linha mostra os dois números e não
 * aponta ninguém, que é a leitura honesta de "os dois se parecem neste critério".
 */
const LIMIAR_MARCADOR = LIMIAR_ATIVA_MAIS;

// exercícios puramente aeróbicos vivem no bloco Aeróbicos: fora da comparação de força
const CARDIO_EX_SLUGS = new Set(["caminhada-esteira", "bicicleta-ergometrica", "eliptico", "marcha-aquatica"]);
const forcaPool = exercises.filter((e) => !CARDIO_EX_SLUGS.has(e.slug));

/** As cores de cada coluna, na ordem em que os exercícios foram escolhidos. */
const COR_COLUNA = [
  { barra: "bg-primary", texto: "text-primary", tinta: "bg-primary-tint" },
  { barra: "bg-analysis", texto: "text-analysis", tinta: "bg-analysis-tint" },
  { barra: "bg-cta", texto: "text-cta-text", tinta: "bg-cta-tint" },
  { barra: "bg-success", texto: "text-success", tinta: "bg-success-tint" },
] as const;

/** Vencedor de um marcador: só com dado em pelo menos dois e margem acima do limiar. */
function vencedorDoMarcador(m: MetricaForca, selected: Exercise[]): { idx: number; margem: number; outro: number } | null {
  if (m.melhor === "depende") return null;
  const comDado = selected
    .map((e, i) => ({ i, v: m.get(e) }))
    .filter((x): x is { i: number; v: number } => x.v !== undefined);
  if (comDado.length < 2) return null;
  const ordenados = [...comDado].sort((a, b) => (m.melhor === "maior" ? b.v - a.v : a.v - b.v));
  const [primeiro, segundo] = ordenados;
  const margem = Math.abs(primeiro.v - segundo.v);
  if (margem < LIMIAR_MARCADOR) return null;
  return { idx: primeiro.i, margem, outro: segundo.v };
}

/** Faixa do glossário em minúscula ("82 · muito bom"): é a mesma que a MetricaBar mostra. */
function faixaTexto(nome: string, valor: number): string | null {
  const def = getMetrica(nome);
  const f = def ? faixaDe(def, valor) : undefined;
  return f ? f.rotulo.toLowerCase() : null;
}

/** "Joelho e quadril" vira 2 articulações; "Coluna (isometria)" vira 1. */
function articulacoesDe(e: Exercise): string[] {
  const texto = String(e.articulacaoPredominante ?? "").replace(/\([^)]*\)/g, "");
  return texto
    .split(/,|\be\b|\+/i)
    .map((s) => s.trim())
    .filter(Boolean);
}

function ForcaBloco({ base, slugs }: { base: string | null; slugs: string[] }) {
  const initial = React.useMemo(() => {
    const list: string[] = [];
    // `?slugs=` chega do Laboratório Visual: o profissional filtrou, escolheu e
    // mandou comparar. Ele manda na abertura; `?base=` continua valendo para o
    // atalho de um exercício só, vindo da ficha.
    for (const s of slugs) {
      if (list.length >= MAX) break;
      if (forcaPool.some((e) => e.slug === s) && !list.includes(s)) list.push(s);
    }
    if (base && forcaPool.some((e) => e.slug === base) && !list.includes(base)) list.push(base);
    // Sem nada na URL, dois padrões conhecidos abrem a tela com conteúdo real.
    for (const s of ["leg-press-45", "cadeira-extensora"]) {
      if (list.length >= 2) break;
      if (forcaPool.some((e) => e.slug === s) && !list.includes(s)) list.push(s);
    }
    return list.slice(0, MAX);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [sel, setSel] = React.useState<string[]>(initial);
  const selected = sel.map((s) => forcaPool.find((e) => e.slug === s)).filter(Boolean) as Exercise[];
  const toggle = (slug: string) =>
    setSel((c) => (c.includes(slug) ? c.filter((x) => x !== slug) : c.length < MAX ? [...c, slug] : c));

  const buscaRef = React.useRef<HTMLInputElement>(null);
  const colunasCartoes = Math.min(selected.length + (selected.length < MAX ? 1 : 0), MAX);

  return (
    <>
      <BuscaESugestoes pool={forcaPool} selected={selected} sel={sel} onToggle={toggle} inputRef={buscaRef} />

      {selected.length === 0 ? (
        <Card className="p-6 text-sm text-ink-2">
          Escolha um exercício na busca ou nas sugestões acima para começar a comparar.
        </Card>
      ) : (
        <>
          {/* Os cartões dos escolhidos, e a vaga para o próximo (protótipo). */}
          <div
            className={cn(
              "grid gap-4",
              colunasCartoes >= 2 && "sm:grid-cols-2",
              colunasCartoes === 3 && "lg:grid-cols-3",
              colunasCartoes === 4 && "lg:grid-cols-4",
            )}
          >
            {selected.map((e, i) => (
              <CartaoEscolhido key={e.slug} e={e} i={i} onRemover={() => toggle(e.slug)} />
            ))}
            {selected.length < MAX && (
              <button
                type="button"
                onClick={() => buscaRef.current?.focus()}
                className="flex min-h-[140px] items-center gap-4 rounded-card border-2 border-dashed border-border px-6 text-left transition-colors hover:border-primary hover:bg-surface-soft"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-control bg-surface-soft text-ink-2">
                  <Plus className="h-5 w-5" aria-hidden />
                </span>
                <span>
                  <span className="block font-display text-base font-bold text-ink">
                    Adicionar {selected.length + 1}ª opção
                  </span>
                  <span className="block text-sm text-ink-3">até {MAX} lado a lado</span>
                </span>
              </button>
            )}
          </div>

          {selected.length >= 2 && <OQueOsNumerosDizem selected={selected} />}

          <div className="grid items-start gap-5 lg:grid-cols-2">
            <AtivacaoComparada selected={selected} />
            <MarcadoresDeDecisao selected={selected} />
          </div>

          {/* Quando usar / evitar, um cartão por exercício, na cor da coluna dele. */}
          <div
            className={cn(
              "grid gap-4",
              selected.length >= 2 && "sm:grid-cols-2",
              selected.length === 3 && "lg:grid-cols-3",
              selected.length === 4 && "lg:grid-cols-4",
            )}
          >
            {selected.map((e, i) => (
              <Card key={e.slug} className="relative overflow-hidden p-5">
                <span aria-hidden className={cn("absolute inset-x-0 top-0 h-1", COR_COLUNA[i].barra)} />
                <h4 className="font-display text-lg font-bold text-ink">{e.nome}</h4>
                <ListaMini titulo="Quando usar" itens={e.blocos.quandoUsar.slice(0, 2)} tone="success" className="mt-3" />
                <ListaMini titulo="Quando evitar" itens={e.blocos.quandoEvitar.slice(0, 2)} tone="danger" className="mt-4" />
              </Card>
            ))}
          </div>
        </>
      )}
    </>
  );
}

/**
 * BUSCA E SUGESTÕES (protótipo).
 *
 * Antes era uma parede com os 104 exercícios de força em chips, todos de uma vez, para
 * escolher dois. Agora a tela oferece o que faz sentido comparar com o que já está
 * escolhido: exercícios do MESMO grupo muscular, pelos de maior eficiência. A busca acha
 * qualquer um por nome, músculo ou equipamento, e o catálogo inteiro continua a um clique
 * ("ver catálogo"), agrupado por músculo, para quem quer navegar.
 */
function BuscaESugestoes({
  pool,
  selected,
  sel,
  onToggle,
  inputRef,
}: {
  pool: Exercise[];
  selected: Exercise[];
  sel: string[];
  onToggle: (slug: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
}) {
  const [q, setQ] = React.useState("");
  const [catalogo, setCatalogo] = React.useState(false);
  const cheio = sel.length >= MAX;

  const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const resultados = React.useMemo(() => {
    const t = norm(q.trim());
    if (!t) return [];
    return pool
      .filter((e) => !sel.includes(e.slug))
      .filter((e) => norm(`${e.nome} ${e.grupoMuscular} ${e.equipamento} ${e.ativacao.map((a) => a.musculo).join(" ")}`).includes(t))
      .slice(0, 8);
  }, [q, pool, sel]);

  const grupo = selected[0]?.grupoMuscular;
  const sugestoes = React.useMemo(
    () =>
      pool
        .filter((e) => !sel.includes(e.slug) && (!grupo || e.grupoMuscular === grupo))
        .sort((a, b) => b.indiceEficiencia.score - a.indiceEficiencia.score)
        .slice(0, 6),
    [pool, sel, grupo],
  );

  const porGrupo = React.useMemo(() => {
    const m = new Map<string, Exercise[]>();
    for (const e of pool) {
      if (!m.has(e.grupoMuscular)) m.set(e.grupoMuscular, []);
      m.get(e.grupoMuscular)!.push(e);
    }
    return [...m.entries()];
  }, [pool]);

  const escolher = (slug: string) => {
    onToggle(slug);
    setQ("");
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            disabled={cheio}
            placeholder={cheio ? `Limite de ${MAX} alcançado: remova um para trocar` : "Buscar exercício por nome, músculo ou equipamento..."}
            aria-label="Buscar exercício para comparar"
            className="h-12 w-full rounded-card border border-border bg-surface pl-11 pr-4 text-sm text-ink placeholder:text-ink-3 focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          />
          {resultados.length > 0 && (
            <ul className="absolute inset-x-0 top-full z-20 mt-1 max-h-80 overflow-auto rounded-card border border-border bg-surface p-1 shadow-elevated">
              {resultados.map((e) => (
                <li key={e.slug}>
                  <button
                    type="button"
                    onClick={() => escolher(e.slug)}
                    className="flex w-full items-center gap-3 rounded-control px-3 py-2 text-left hover:bg-surface-soft"
                  >
                    <Plus className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink">{e.nome}</span>
                      <span className="block truncate text-xs text-ink-3">
                        {e.grupoMuscular} · {e.equipamento.toLowerCase()}
                      </span>
                    </span>
                    <span className="tabular shrink-0 text-xs text-ink-3">{e.indiceEficiencia.score}/100</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <span className="shrink-0 text-sm text-ink-2">
          <b className="font-semibold text-ink">{sel.length}</b> de {MAX} escolhidos
        </span>
      </div>

      {!cheio && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-ink-2">
            Sugestões{grupo ? ` para ${grupo.toLowerCase()}` : ""}:
          </span>
          {sugestoes.map((e) => (
            <button
              key={e.slug}
              type="button"
              onClick={() => onToggle(e.slug)}
              className="inline-flex min-h-[36px] items-center gap-1 rounded-full border border-border bg-surface px-3 text-sm font-semibold text-ink hover:border-primary hover:text-primary"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden /> {e.nome}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCatalogo((v) => !v)}
            aria-expanded={catalogo}
            className="inline-flex items-center gap-1 rounded-full px-2 text-sm font-semibold text-primary hover:underline"
          >
            {catalogo ? "fechar catálogo" : `ver catálogo (${pool.length})`}
            <ArrowRight className={cn("h-3.5 w-3.5 transition-transform", catalogo && "rotate-90")} aria-hidden />
          </button>
        </div>
      )}

      {catalogo && !cheio && (
        <Card className="max-h-[420px] space-y-4 overflow-auto p-4">
          {porGrupo.map(([g, lista]) => (
            <div key={g}>
              <p className="mb-1.5 text-2xs font-semibold uppercase tracking-wide text-ink-3">{g}</p>
              <div className="flex flex-wrap gap-1.5">
                {lista.map((e) => {
                  const on = sel.includes(e.slug);
                  return (
                    <button
                      key={e.slug}
                      type="button"
                      onClick={() => onToggle(e.slug)}
                      aria-pressed={on}
                      className={cn(
                        "inline-flex min-h-[36px] items-center gap-1 rounded-full border px-3 text-sm transition-colors",
                        on ? "border-primary bg-primary-tint font-semibold text-primary" : "border-border text-ink-2 hover:bg-surface-soft",
                      )}
                    >
                      {on ? <X className="h-3.5 w-3.5" aria-hidden /> : <Plus className="h-3.5 w-3.5" aria-hidden />}
                      {e.nome}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

/** O cartão de um exercício escolhido (protótipo): foto, grupo, eficiência em número e barra. */
function CartaoEscolhido({ e, i, onRemover }: { e: Exercise; i: number; onRemover: () => void }) {
  const cor = COR_COLUNA[i];
  return (
    <Card className="relative overflow-hidden p-4">
      <span aria-hidden className={cn("absolute inset-x-0 top-0 h-1", cor.barra)} />
      <button
        type="button"
        onClick={onRemover}
        aria-label={`Remover ${e.nome}`}
        className="absolute right-3 top-3 rounded-full p-1 text-ink-3 hover:bg-surface-soft hover:text-ink"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
      <div className="flex gap-4">
        {e.imagem ? (
          <img src={withBase(e.imagem)} alt="" className="h-24 w-24 shrink-0 rounded-card object-cover" />
        ) : (
          <span className="grid h-24 w-24 shrink-0 place-items-center rounded-card bg-surface-soft text-ink-3">
            <Dumbbell className="h-6 w-6" aria-hidden />
          </span>
        )}
        <div className="min-w-0 flex-1 pr-6">
          {/* O nome leva ao Laboratório: é onde vivem a análise e as fontes deste exercício. */}
          <Link
            to={`/movement-lab/${e.slug}`}
            className="block font-display text-lg font-bold leading-tight text-ink hover:underline"
          >
            {e.nome}
          </Link>
          <p className="mt-0.5 text-sm text-ink-3">
            {e.grupoMuscular} · {e.equipamento.toLowerCase()}
          </p>
          <p className="mt-2 flex items-baseline gap-1.5">
            <span className={cn("tabular font-display text-3xl font-bold leading-none", cor.texto)}>
              {e.indiceEficiencia.score}
            </span>
            <span className="text-sm text-ink-3">/100 eficiência</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Pill tone="neutral">{e.equipamento}</Pill>
            <Pill tone="neutral">{e.nivel}</Pill>
          </div>
        </div>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-mute">
        <div className={cn("h-full rounded-full", cor.barra)} style={{ width: `${e.indiceEficiencia.score}%` }} />
      </div>
    </Card>
  );
}

/**
 * O QUE OS NÚMEROS DIZEM (protótipo: faixa navy com a leitura em frase e dois destaques).
 *
 * A frase NÃO é escrita à mão: cada pedaço dela é um marcador que aquele exercício vence
 * por pelo menos 10 pontos (o limiar da casa), ou um músculo que ele recruta 10 pontos a
 * mais que o melhor dos outros. Os dois números vêm entre parênteses, porque "cobra menos
 * do joelho" sem o quanto não defende ninguém. Quando nada passa do limiar, a frase diz
 * isso, em vez de inventar uma diferença.
 */
function OQueOsNumerosDizem({ selected }: { selected: Exercise[] }) {
  const fatos = selected.map((e) => {
    const outros = selected.filter((x) => x !== e);
    const lista: { txt: string; margem: number }[] = [];
    for (const m of METRICAS_FORCA) {
      if (m.melhor === "depende" || !m.frase) continue;
      const v = m.get(e);
      if (v === undefined) continue;
      const vs = outros.map((o) => m.get(o)).filter((x): x is number => x !== undefined);
      if (!vs.length) continue;
      const melhorOutro = m.melhor === "maior" ? Math.max(...vs) : Math.min(...vs);
      const margem = m.melhor === "maior" ? v - melhorOutro : melhorOutro - v;
      if (margem >= LIMIAR_MARCADOR) lista.push({ txt: m.frase(v, melhorOutro), margem });
    }
    for (const a of e.ativacao) {
      const vs = outros.map((o) => o.ativacao.find((x) => x.musculo === a.musculo)?.percentual);
      if (vs.some((x) => x === undefined)) continue; // só compara onde todos declaram o músculo
      const melhorOutro = Math.max(...(vs as number[]));
      const margem = a.percentual - melhorOutro;
      if (margem >= LIMIAR_ATIVA_MAIS) {
        lista.push({ txt: `recruta mais ${a.musculo.toLowerCase()} (${a.percentual} contra ${melhorOutro})`, margem });
      }
    }
    lista.sort((a, b) => b.margem - a.margem);
    return { e, frases: lista.slice(0, 2).map((x) => x.txt) };
  });

  const comFato = fatos.filter((f) => f.frases.length);

  const efic = METRICAS_FORCA.find((m) => m.key === "efic")!;
  const vEfic = vencedorDoMarcador(efic, selected);
  // O segundo destaque é a DEMANDA que mais separa os exercícios: é a pergunta de
  // segurança que o profissional faz primeiro.
  const demandas = METRICAS_FORCA.filter((m) => ["lombar", "joelho", "ombro"].includes(m.key))
    .map((m) => ({ m, v: vencedorDoMarcador(m, selected) }))
    .filter((x): x is { m: MetricaForca; v: NonNullable<ReturnType<typeof vencedorDoMarcador>> } => x.v != null)
    .sort((a, b) => b.v.margem - a.v.margem);
  const destaqueDemanda = demandas[0];

  return (
    <section
      className="relative overflow-hidden rounded-card p-5 md:p-6"
      style={{ background: "#0B1628", color: "#F3F1EA" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(20,179,186,.30), rgba(20,179,186,0) 65%)" }}
      />
      <div className="relative grid items-center gap-5 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <p className="text-2xs font-semibold uppercase tracking-[0.12em]" style={{ color: "#7FE3D8" }}>
            O que os números dizem
          </p>
          <p className="mt-2 text-base leading-relaxed md:text-lg" style={{ color: "#D6DFEA" }}>
            {comFato.length ? (
              comFato.map((f, k) => (
                <React.Fragment key={f.e.slug}>
                  {k > 0 && "; "}
                  <b className="font-semibold text-white">{f.e.nome}</b> {f.frases.join(" e ")}
                </React.Fragment>
              ))
            ) : (
              <>
                Em todos os marcadores com dado, as diferenças ficam abaixo de {LIMIAR_MARCADOR} pontos: nestes critérios os
                exercícios se equivalem, e a escolha fica com o contexto do aluno
              </>
            )}
            .
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <DestaqueNavy
            rotulo="Maior eficiência"
            nome={vEfic ? selected[vEfic.idx].nome : "Empate técnico"}
            valor={vEfic ? `${efic.get(selected[vEfic.idx])} · +${vEfic.margem}` : `diferença abaixo de ${LIMIAR_MARCADOR}`}
          />
          {destaqueDemanda && (
            <DestaqueNavy
              rotulo={`Menor ${destaqueDemanda.m.label.toLowerCase()}`}
              nome={selected[destaqueDemanda.v.idx].nome}
              valor={`${destaqueDemanda.m.get(selected[destaqueDemanda.v.idx])} · −${destaqueDemanda.v.margem}`}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function DestaqueNavy({ rotulo, nome, valor }: { rotulo: string; nome: string; valor: string }) {
  return (
    <div
      className="min-w-[13rem] rounded-card p-4"
      style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)" }}
    >
      <p className="text-xs" style={{ color: "#8FA0B5" }}>
        {rotulo}
      </p>
      <p className="mt-1 font-display text-base font-bold text-white">{nome}</p>
      <p className="tabular mt-0.5 text-sm font-semibold" style={{ color: "#7FE3D8" }}>
        {valor}
      </p>
    </div>
  );
}

/**
 * ATIVAÇÃO MUSCULAR (protótipo: coluna da esquerda). Uma linha por MÚSCULO, com a barra de
 * cada exercício empilhada, e um selo que resume a linha:
 *   · "Nome +12": os dois declaram o músculo e um passa o outro por 10 pontos ou mais;
 *   · "parecido": os dois declaram, e a diferença fica abaixo do limiar da casa;
 *   · "apenas Nome": só um deles declara o músculo entre os alvos.
 *
 * O protótipo marcava "Extensora +3". Três pontos numa estimativa sintetizada da
 * literatura não sustentam "ativa mais" (ver `compararMusculos.ts`), então aqui essa linha
 * sai como "parecido".
 */
function AtivacaoComparada({ selected }: { selected: Exercise[] }) {
  const musculos = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const e of selected)
      for (const a of e.ativacao) map.set(a.musculo, Math.max(map.get(a.musculo) ?? 0, a.percentual));
    return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([m]) => m);
  }, [selected]);

  const pctDe = (e: Exercise, m: string) => e.ativacao.find((a) => a.musculo === m)?.percentual;

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 p-5 pb-3">
        <div>
          <h3 className="font-display text-xl font-bold text-ink">Ativação muscular</h3>
          <p className="mt-0.5 text-sm text-ink-3">0 a 100 dentro de cada músculo · não somam entre si</p>
        </div>
        <Legenda selected={selected} />
      </div>

      <ul className="divide-y divide-border border-t border-border">
        {musculos.map((m) => {
          const vals = selected.map((e) => pctDe(e, m));
          const comDado = vals.map((v, i) => ({ v, i })).filter((x): x is { v: number; i: number } => x.v !== undefined);
          let selo: { texto: string; i?: number } | null = null;
          if (selected.length >= 2) {
            if (comDado.length === 1) selo = { texto: `apenas ${selected[comDado[0].i].nome}`, i: comDado[0].i };
            else if (comDado.length >= 2) {
              const ord = [...comDado].sort((a, b) => b.v - a.v);
              const diff = ord[0].v - ord[1].v;
              selo = diff >= LIMIAR_ATIVA_MAIS ? { texto: `${selected[ord[0].i].nome} +${diff}`, i: ord[0].i } : { texto: "parecido" };
            }
          }
          return (
            <li key={m} className="grid grid-cols-[minmax(0,9.5rem)_minmax(0,1fr)] items-center gap-x-4 gap-y-1 px-5 py-3.5">
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight text-ink">{m}</p>
                {selo && (
                  <span
                    className={cn(
                      "mt-1 inline-block max-w-full truncate rounded-full px-2 py-0.5 text-2xs font-semibold",
                      selo.i != null ? cn(COR_COLUNA[selo.i].tinta, COR_COLUNA[selo.i].texto) : "bg-surface-mute text-ink-2",
                    )}
                    title={selo.texto}
                  >
                    {selo.texto}
                  </span>
                )}
              </div>
              <div className="space-y-1.5">
                {selected.map((e, i) => {
                  const v = vals[i];
                  return (
                    <div key={e.slug} className="grid grid-cols-[minmax(0,1fr)_2.5rem] items-center gap-3">
                      {v === undefined ? (
                        // Ausência não é zero: a trilha tracejada diz "sem dado", e não "0".
                        <div className="h-2 rounded-full border border-dashed border-border" aria-hidden />
                      ) : (
                        <div className="h-2 overflow-hidden rounded-full bg-surface-mute">
                          <div className={cn("h-full rounded-full", COR_COLUNA[i].barra)} style={{ width: `${v}%` }} />
                        </div>
                      )}
                      <span
                        className={cn("tabular text-right text-sm font-semibold", v === undefined ? "text-ink-3" : COR_COLUNA[i].texto)}
                        title={v === undefined ? `${e.nome} não declara ${m} entre os alvos (não quer dizer ativação zero)` : `${e.nome}: ${m} ${v} de 100`}
                      >
                        {v ?? "n/d"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ul>

      <p className="border-t border-border px-5 py-3.5 text-xs leading-relaxed text-ink-3">
        Síntese de estudos de EMG comparada (Boeckh-Behrens &amp; Buskies 2000; Contreras et al. 2015; Andersen et al. 2014;
        Rodríguez-Ridao et al. 2020; Ekstrom et al. 2007). Comparam a ênfase entre exercícios; não medem o seu aluno.{" "}
        <b className="font-semibold text-ink-2">n/d</b> quer dizer que o músculo não está entre os alvos declarados daquele
        exercício, e não que a ativação seja zero.
      </p>
    </Card>
  );
}

function Legenda({ selected }: { selected: Exercise[] }) {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1">
      {selected.map((e, i) => (
        <span key={e.slug} className="inline-flex items-center gap-1.5 text-xs text-ink-2">
          <span aria-hidden className={cn("h-2.5 w-2.5 rounded-[3px]", COR_COLUNA[i].barra)} />
          {e.nome}
        </span>
      ))}
    </div>
  );
}

/**
 * MARCADORES DE DECISÃO (protótipo: coluna da direita). Cada marcador diz para que lado o
 * critério pesa ("maior é melhor" ou "menor é melhor"), e o vencedor leva o ✓ na cor dele,
 * só quando passa o limiar da casa. O nome do marcador continua clicável (MetricaInfo):
 * abre a escala, o referencial e as faixas.
 */
function MarcadoresDeDecisao({ selected }: { selected: Exercise[] }) {
  const visiveis = METRICAS_FORCA.filter((m) => selected.some((e) => m.get(e) !== undefined));
  const articulacoes = selected.map(articulacoesDe);
  const mostraCadeia = articulacoes.some((a) => a.length > 0);

  return (
    <Card className="overflow-hidden">
      <div className="p-5 pb-3">
        <h3 className="font-display text-xl font-bold text-ink">Marcadores de decisão</h3>
        <p className="mt-0.5 text-sm text-ink-3">0 a 100 · cada marcador diz para que lado o critério pesa</p>
      </div>

      <ul className="divide-y divide-border border-t border-border">
        {visiveis.map((m) => {
          const win = vencedorDoMarcador(m, selected);
          return (
            <li key={m.key} className="px-5 py-3.5">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <MetricaInfo nome={m.label} valor={m.get(selected[0])} className="text-sm font-semibold text-ink" />
                <span className="text-2xs text-ink-3">
                  {m.melhor === "maior" ? "maior é melhor" : m.melhor === "menor" ? "menor é melhor" : "depende do objetivo"}
                </span>
              </div>
              <div className="mt-2 space-y-1.5">
                {selected.map((e, i) => {
                  const v = m.get(e);
                  const venceu = win?.idx === i;
                  const faixa = v !== undefined ? faixaTexto(m.label, v) : null;
                  return (
                    <div key={e.slug} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                      {v === undefined ? (
                        <div className="h-2 rounded-full border border-dashed border-border" aria-hidden />
                      ) : (
                        <div className="h-2 overflow-hidden rounded-full bg-surface-mute">
                          <div className={cn("h-full rounded-full", COR_COLUNA[i].barra)} style={{ width: `${v}%` }} />
                        </div>
                      )}
                      <span
                        className={cn(
                          "tabular min-w-[7.5rem] text-right text-sm",
                          v === undefined ? "text-ink-3" : venceu ? cn("font-bold", COR_COLUNA[i].texto) : "text-ink-2",
                        )}
                        title={`${e.nome}: ${m.label}${v === undefined ? ", sem dado medido" : ` ${v} de 100`}`}
                      >
                        {v === undefined ? "sem dado" : `${v}${faixa ? ` · ${faixa}` : ""}`}
                        {venceu && <Check className="ml-1 inline h-3.5 w-3.5 align-[-2px]" aria-label="melhor neste critério" />}
                      </span>
                    </div>
                  );
                })}
              </div>
            </li>
          );
        })}

        {/*
          CADEIA ENVOLVIDA. O protótipo mostra este marcador em barra (74 contra 30), mas a
          base não tem esse número: tem as articulações que cada exercício move
          (`articulacaoPredominante`). Então ele sai em TEXTO, que é o dado que existe, e
          sem vencedor, porque isolar um músculo é tão legítimo quanto trabalhar a cadeia:
          depende do objetivo.
        */}
        {mostraCadeia && (
          <li className="px-5 py-3.5">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <span className="text-sm font-semibold text-ink">Cadeia envolvida</span>
              <span className="text-2xs text-ink-3">depende do objetivo</span>
            </div>
            <ul className="mt-2 space-y-1">
              {selected.map((e, i) => {
                const a = articulacoes[i];
                return (
                  <li key={e.slug} className="flex items-center gap-2 text-sm">
                    <span aria-hidden className={cn("h-2.5 w-2.5 shrink-0 rounded-[3px]", COR_COLUNA[i].barra)} />
                    <span className={cn("font-semibold", COR_COLUNA[i].texto)}>
                      {a.length >= 2 ? "multiarticular" : a.length === 1 ? "monoarticular" : "sem dado"}
                    </span>
                    {a.length > 0 && <span className="text-ink-3">{a.join(", ").toLowerCase()}</span>}
                  </li>
                );
              })}
            </ul>
          </li>
        )}
      </ul>
    </Card>
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
                      className="shrink-0 rounded-full p-1 text-ink-3 hover:bg-surface-soft"
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
                      <div className="mt-0.5 text-2xs text-ink-3">
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
                      {m.hint && <span className="text-2xs text-ink-3">{m.hint}</span>}
                    </div>
                    <div className="space-y-1.5">
                      {selected.map((mod, i) => (
                        <div key={mod.id} className="flex items-center gap-2">
                          {/* Nome visivel antes da barra: liga cada barra a sua modalidade,
                              sem depender so da cor (como AtivacaoComparada ja faz). */}
                          <span className="w-24 shrink-0 truncate text-xs text-ink-2 sm:w-32">{mod.nome}</span>
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
                <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">
                  Grupos musculares ({m.gruposMusculares.length})
                </div>
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {m.gruposMusculares.map((g) => (
                    <Pill key={g} tone="primary">{g}</Pill>
                  ))}
                </div>
                <ListaMini titulo="Quando usar" itens={m.quandoUsar} tone="success" />
                <ListaMini titulo="Quando evitar" itens={m.quandoEvitar} tone="cta" className="mt-3" />
                {m.observacao && (
                  <p className="mt-3 flex gap-2 rounded-lg bg-analysis-tint p-2.5 text-2xs leading-relaxed text-analysis-text">
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
      <div className="mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-sm font-semibold text-ink">Escolha para comparar</span>
        <span className="text-xs text-ink-3">
          {sel.length} de {MAX} selecionados
        </span>
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
                "inline-flex min-h-[44px] items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
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
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-cta-tint text-cta-text">
          <Flame className="h-4 w-4" />
        </span>
        <div>
          <h3 className="font-display text-sm font-bold text-ink">Parâmetros do gasto calórico</h3>
          <p className="text-2xs text-ink-3">Ajuste intensidade e tempo: o gasto recalcula na hora.</p>
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
                    "flex-1 rounded-full border px-2 py-2 text-sm font-semibold transition-colors",
                    on
                      ? "border-cta bg-cta-tint text-cta-text"
                      : "border-border text-ink-2 hover:bg-surface-soft",
                  )}
                >
                  {it.label}
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 text-2xs leading-snug text-ink-3">{descricao}.</p>
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
                    "rounded-full border px-3 py-2 text-sm font-semibold tabular transition-colors",
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
          <p id="peso-hint" className="mt-1.5 text-2xs leading-snug text-ink-3">
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

function ListaMini({
  titulo, itens, tone, className,
}: {
  titulo: string;
  itens: string[];
  /** "cta" continua aceito para o bloco de cardio; ele e "danger" são o lado de evitar */
  tone: "success" | "cta" | "danger";
  className?: string;
}) {
  const usar = tone === "success";
  const head = usar ? "text-success" : "text-danger";
  return (
    <div className={className}>
      <div className={cn("mb-1.5 text-2xs font-bold uppercase tracking-[0.12em]", head)}>{titulo}</div>
      <ul className="space-y-1.5">
        {itens.map((it) => (
          <li key={it} className="flex gap-2 text-sm text-ink-2">
            {usar ? (
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
            ) : (
              <X className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden />
            )}
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
  // Seleção vinda do Laboratório Visual (?slugs=a,b,c): comparar o que ele acabou
  // de filtrar era o passo que faltava para o filtro virar decisão.
  const slugs = (params.get("slugs") ?? "").split(",").map((x) => x.trim()).filter(Boolean);
  const [bloco, setBloco] = React.useState<Bloco>("forca");

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/*
        CABEÇALHO DO PROTÓTIPO. A trilha "Laboratório Visual / Comparar" virou o eyebrow, e o
        pedaço do Laboratório continua sendo link: comparar é a aba de decisão do
        Laboratório, não uma ilha. O alternador de bloco sobe para a direita do título, na
        pílula escura do Design System (a ação escolhida é a pílula navy).
      */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 max-w-3xl">
          <p className="text-2xs font-semibold uppercase tracking-[0.12em] text-primary">
            <Link to="/movement-lab" className="hover:underline">
              Laboratório visual
            </Link>{" "}
            · Comparador
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-ink md:text-4xl">
            {bloco === "forca" ? "Dois exercícios, um critério de cada vez" : "Duas modalidades, um critério de cada vez"}
          </h1>
          <p className="mt-2 text-base text-ink-2">
            {bloco === "forca"
              ? "Compare até 4 opções e decida com a evidência à vista: ativação por músculo, eficiência e demandas. Números relativos entre exercícios, não medidas do seu aluno."
              : "Compare até 4 modalidades e decida com a evidência à vista: gasto estimado, impacto, técnica e praticidade. Estimativas de referência, não medidas do seu aluno."}
          </p>
        </div>

        <div role="tablist" aria-label="Bloco de comparação" className="inline-flex shrink-0 rounded-full border border-border bg-surface p-1">
          <BlocoTab ativo={bloco === "forca"} onClick={() => setBloco("forca")}>
            Treino de força
          </BlocoTab>
          <BlocoTab ativo={bloco === "cardio"} onClick={() => setBloco("cardio")}>
            Aeróbicos / cardio
          </BlocoTab>
        </div>
      </div>

      {bloco === "forca" ? <ForcaBloco base={base} slugs={slugs} /> : <CardioBloco />}

      {/* O "como ler" do cardio fica: é onde mora a fórmula do gasto e a origem dos METs,
          e sem ela o número de kcal fica sem defesa. No bloco de força a mesma ressalva já
          está no subtítulo, no rodapé da ativação e na linha abaixo. */}
      {bloco === "cardio" && (
        <Card variant="soft" className="p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-analysis-tint text-analysis">
              <Info className="h-4 w-4" />
            </span>
            <h4 className="font-display text-sm font-bold text-ink">Como ler estes números</h4>
          </div>
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
        </Card>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
        <p className="max-w-2xl text-xs leading-relaxed text-ink-3">
          {bloco === "forca"
            ? "Estimativas relativas sintetizadas da literatura de EMG e biomecânica; as fontes completas de cada exercício ficam na aba Biomecânica do Laboratório. Conteúdo educacional; não substitui avaliação profissional individualizada."
            : "Estimativas de referência; conteúdo educacional. Não substitui avaliação profissional individualizada."}
        </p>
        <div className="flex flex-wrap gap-2">
          <Link to="/movement-lab" className={buttonClasses("secondary", "md")}>
            Ir ao Laboratório
          </Link>
          <Link to="/gps" className={buttonClasses("primary", "md")}>
            Usar no Treino do dia <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function BlocoTab({
  ativo, onClick, children,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      role="tab"
      aria-selected={ativo}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-[44px] items-center rounded-full px-4 text-sm font-semibold transition-colors",
        ativo ? "bg-ink text-surface" : "text-ink-2 hover:bg-surface-soft",
      )}
    >
      {children}
    </button>
  );
}
