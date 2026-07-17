import * as React from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  Repeat,
  TrendingUp,
  Target,
  Info,
  BookOpen,
  Plus,
  Trash2,
  AlertTriangle,
  CalendarCheck,
} from "lucide-react";
import { Card, Pill, buttonClasses } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import {
  getFaixa,
  getModelo,
  valorFaixa,
  type Macrociclo,
  type Mesociclo,
  type Microciclo,
  type Sessao,
  type BlocoSessao,
  type Tendencia,
  type TipoMicrociclo,
} from "@/data/periodizacao";
import { conferirFaixa, faixaSugerida, type CampoFaixa } from "@/lib/gps/faixas";
import { desenharProgressao } from "@/lib/gps/progressao";
import type { GpsObjetivo } from "@/lib/gps/engine";
import type { Nivel } from "@/data/types";
import { getParam } from "@/data/monitoringParameters";
import { refCurta } from "@/data/referencias";
import { exercises } from "@/data/exercises";
import { uid } from "@/lib/store";

/**
 * Visualização e edição do macrociclo.
 *
 * O mesmo componente mostra e edita: `editavel` liga os campos. Cada nível da árvore
 * recebe o seu pedaço e devolve o pedaço alterado (`onChange`), então a página não
 * precisa saber navegar até uma série dentro de uma sessão dentro de uma semana.
 *
 * As faixas da diretriz aparecem uma vez por semana aberta, e o aviso de fora da faixa
 * é inline e não trava nada: a decisão é do profissional habilitado.
 */

const TEND_LABEL: Record<Tendencia, string> = { sobe: "sobe", reduz: "reduz", estavel: "estável", varia: "varia" };
const TIPO_LABEL: Record<TipoMicrociclo, string> = { carga: "Carga", deload: "Descarga", teste: "Teste" };

const nid = (p: string) => `${p}-${uid()}`;

export interface ContextoFaixa {
  objetivo: GpsObjetivo;
  nivel: Nivel;
}

/* ================================ Gráfico ================================ */

export function GraficoProgressao({ macro }: { macro: Macrociclo }) {
  const g = desenharProgressao(macro);
  const gid = React.useId().replace(/:/g, "");

  return (
    <Card className="p-4">
      <div className="mb-1 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-ink-3" />
        <h3 className="font-display text-base font-bold text-ink">Progressão ao longo das semanas</h3>
      </div>
      <p className="mb-3 text-xs text-ink-3">
        Tendência qualitativa das cargas por semana. As faixas ao pé mostram cada fase e quantas semanas ela dura.
      </p>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${g.largura} ${g.altura}`}
          className="h-56 w-full min-w-[560px]"
          role="img"
          aria-label="Gráfico de progressão de volume, intensidade e complexidade por semana, com as fases do plano"
        >
          <defs>
            <linearGradient id={`vol-${gid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.16" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* faixas de fase: fundo alternado atrás da curva + rótulo ao pé */}
          {g.fases.map((f) => (
            <g key={f.indice}>
              <rect
                x={f.x0}
                y={g.plot.top}
                width={f.x1 - f.x0}
                height={g.faixaBottom - g.plot.top}
                fill={f.indice % 2 === 0 ? "var(--surface-soft)" : "transparent"}
                opacity={0.5}
              />
              {f.indice > 0 && (
                <line x1={f.x0} y1={g.plot.top} x2={f.x0} y2={g.faixaBottom} stroke="var(--border)" strokeWidth={1} strokeDasharray="3 3" />
              )}
              <text x={f.cx} y={g.faixaTop + 12} textAnchor="middle" className="fill-ink" style={{ fontSize: 11, fontWeight: 700 }}>
                {f.nome}
              </text>
              <text x={f.cx} y={g.faixaTop + 26} textAnchor="middle" className="fill-ink-3" style={{ fontSize: 10 }}>
                {f.spanSemanas}
                {f.temDescarga ? " · descarga" : ""}
              </text>
            </g>
          ))}

          {/* semanas de descarga */}
          {g.alivios.map((a, i) => (
            <rect key={i} x={a.x - a.w / 2} y={g.plot.top} width={a.w} height={g.plot.bottom - g.plot.top} fill="var(--warning)" opacity={0.07} rx={2} />
          ))}

          {/* eixo qualitativo */}
          <text x={g.eixo.x} y={g.eixo.maiorY} textAnchor="end" className="fill-ink-3" style={{ fontSize: 9 }}>maior</text>
          <text x={g.eixo.x} y={g.eixo.menorY} textAnchor="end" className="fill-ink-3" style={{ fontSize: 9 }}>menor</text>

          {/* área sob o volume + curvas suaves */}
          <path d={g.areaVolume} fill={`url(#vol-${gid})`} stroke="none" />
          {g.series.map((s) => (
            <path key={s.nome} d={s.d} fill="none" stroke={s.cor} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          ))}

          {/* semanas */}
          {g.rotulos.map((r, i) => (
            <text key={i} x={r.x} y={g.weekLabelY} textAnchor="middle" className="fill-ink-3" style={{ fontSize: 9 }}>
              {r.semana}
            </text>
          ))}
        </svg>
      </div>
      <div className="mt-2 flex flex-wrap gap-3">
        {g.series.map((s) => (
          <span key={s.nome} className="flex items-center gap-1.5 text-xs text-ink-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.cor }} /> {s.nome}
          </span>
        ))}
      </div>
    </Card>
  );
}

/* ================================ Mesociclo ================================ */

export function MesocicloCard({
  meso,
  indice,
  ctx,
  editavel,
  onChange,
}: {
  meso: Mesociclo;
  indice: number;
  ctx: ContextoFaixa;
  editavel: boolean;
  onChange?: (m: Mesociclo) => void;
}) {
  const [aberto, setAberto] = React.useState(indice === 0);

  // A descarga vive na semana (`tipo`), não num campo à parte: mover a descarga de semana
  // tem que mudar o selo do bloco junto, senão o card diz uma coisa e o plano faz outra.
  const trocarMicro = (m: Microciclo) => {
    const microciclos = meso.microciclos.map((w) => (w.id === m.id ? m : w));
    onChange?.({ ...meso, microciclos, deload: microciclos.some((w) => w.tipo === "deload") });
  };

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        className="flex w-full items-start gap-3 p-4 text-left hover:bg-surface-soft"
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary text-sm font-bold text-white">{indice + 1}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display font-bold text-ink">{meso.nome}</span>
            <span className="text-xs text-ink-3">
              semanas {meso.semanaInicio} a {meso.semanaFim}
            </span>
            {meso.deload && <Pill tone="neutral">com descarga</Pill>}
            {meso.reavaliacao && <Pill tone="analysis">reavaliar ao fim</Pill>}
          </div>
          <p className="mt-0.5 text-sm text-ink-2">{meso.foco}</p>
        </div>
        <ChevronDown className={cn("mt-1 h-4 w-4 shrink-0 text-ink-3 transition-transform", aberto && "rotate-180")} />
      </button>

      {aberto && (
        <div className="space-y-4 border-t border-border px-4 pb-4 pt-3">
          <div className="flex flex-wrap gap-2 text-xs">
            <Pill tone="neutral">Volume {TEND_LABEL[meso.tendenciaVolume]}</Pill>
            <Pill tone="neutral">Intensidade {TEND_LABEL[meso.tendenciaIntensidade]}</Pill>
            <Pill tone="neutral">Complexidade {TEND_LABEL[meso.tendenciaComplexidade]}</Pill>
          </div>
          <ListaChips titulo="Capacidades priorizadas" itens={meso.capacidades} />
          <ListaChips titulo="Tipos de exercício" itens={meso.tiposExercicio} />

          {meso.parametros.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-3">Acompanhar</p>
              <div className="flex flex-wrap gap-1.5">
                {meso.parametros.map((id) => {
                  const p = getParam(id);
                  return p ? (
                    <Pill key={id} tone="neutral">
                      {p.sigla ?? p.nome}
                    </Pill>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {editavel && (
            <label className="flex items-center gap-2 rounded-xl bg-surface-soft p-2.5 text-sm text-ink-2">
              <input
                type="checkbox"
                checked={Boolean(meso.reavaliacao)}
                onChange={(e) => onChange?.({ ...meso, reavaliacao: e.target.checked })}
                className="h-4 w-4 accent-[var(--primary)]"
              />
              <CalendarCheck className="h-4 w-4 text-analysis" />
              Reavaliar ao fim deste bloco (semana {meso.semanaFim})
            </label>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <CriterioLista
              titulo="Progredir quando"
              itens={meso.criteriosProgressao}
              tone="success"
              editavel={editavel}
              onChange={(itens) => onChange?.({ ...meso, criteriosProgressao: itens })}
            />
            <CriterioLista
              titulo="Regredir ou revisar se"
              itens={meso.criteriosRegressao}
              tone="warning"
              editavel={editavel}
              onChange={(itens) => onChange?.({ ...meso, criteriosRegressao: itens })}
            />
          </div>

          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-3">Semanas</p>
            <div className="space-y-2">
              {meso.microciclos.map((w) => (
                <MicrocicloRow key={w.id} micro={w} ctx={ctx} editavel={editavel} onChange={trocarMicro} />
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

/* ================================ Microciclo (semana) ================================ */

function MicrocicloRow({
  micro,
  ctx,
  editavel,
  onChange,
}: {
  micro: Microciclo;
  ctx: ContextoFaixa;
  editavel: boolean;
  onChange: (m: Microciclo) => void;
}) {
  const [aberto, setAberto] = React.useState(false);

  // Frequência é quantas sessões a semana tem. Guardar o número separado das sessões
  // deixaria o plano dizer "4x" e entregar 3.
  const trocarSessoes = (sessoes: Sessao[]) => onChange({ ...micro, sessoes, frequencia: sessoes.length });

  const addSessao = () =>
    trocarSessoes([...micro.sessoes, { id: nid("ses"), nome: `Sessão ${micro.sessoes.length + 1}`, blocos: [] }]);

  return (
    <div className="rounded-xl border border-border">
      <button
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        className="flex w-full flex-wrap items-center gap-2 p-2.5 text-left text-sm hover:bg-surface-soft"
      >
        <Pill tone={micro.tipo === "deload" ? "warning" : micro.tipo === "teste" ? "analysis" : "neutral"}>Semana {micro.semana}</Pill>
        <span className="text-ink-2">
          {micro.sessoes.length} {micro.sessoes.length === 1 ? "sessão" : "sessões"} na semana
        </span>
        {micro.tipo !== "carga" && <span className="text-xs text-ink-3">{TIPO_LABEL[micro.tipo]}</span>}
        <ChevronDown className={cn("ml-auto h-4 w-4 text-ink-3 transition-transform", aberto && "rotate-180")} />
      </button>

      {aberto && (
        <div className="space-y-2 border-t border-border p-2.5">
          {editavel && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-3">Tipo da semana</span>
              {(["carga", "deload", "teste"] as TipoMicrociclo[]).map((t) => (
                <button
                  key={t}
                  onClick={() =>
                    onChange({
                      ...micro,
                      tipo: t,
                      nota: t === "deload" ? "Semana de descarga: reduza volume e intensidade para recuperar." : undefined,
                    })
                  }
                  aria-pressed={micro.tipo === t}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs transition-colors",
                    micro.tipo === t ? "border-primary bg-primary-tint font-semibold text-primary" : "border-border text-ink-2 hover:bg-surface",
                  )}
                >
                  {TIPO_LABEL[t]}
                </button>
              ))}
            </div>
          )}

          {micro.nota && <p className="text-xs text-ink-3">{micro.nota}</p>}

          <FaixaReferencia ctx={ctx} />

          {micro.sessoes.map((s) => (
            <SessaoBloco
              key={s.id}
              sessao={s}
              ctx={ctx}
              editavel={editavel}
              onChange={(nova) => trocarSessoes(micro.sessoes.map((x) => (x.id === s.id ? nova : x)))}
              onRemover={() => trocarSessoes(micro.sessoes.filter((x) => x.id !== s.id))}
            />
          ))}

          {editavel && (
            <button onClick={addSessao} className={buttonClasses("ghost", "sm")}>
              <Plus className="h-3.5 w-3.5" /> Adicionar sessão nesta semana
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ================================ Faixa da diretriz ================================ */

function FaixaReferencia({ ctx }: { ctx: ContextoFaixa }) {
  const f = getFaixa(ctx.objetivo);
  const linhas: [string, string, string | undefined][] = [
    ["séries", faixaSugerida(f.series, ctx.nivel), f.series.nota],
    ["repetições", faixaSugerida(f.reps, ctx.nivel), f.reps.nota],
    ["intensidade", faixaSugerida(f.intensidade, ctx.nivel), f.intensidade.nota],
    ["intervalo", faixaSugerida(f.intervalo, ctx.nivel), f.intervalo.nota],
  ];
  const refs = f.refIds.map(refCurta).filter(Boolean).join(" · ");

  return (
    <details className="rounded-lg border border-dashed border-border bg-surface-soft/60 text-xs">
      <summary className="cursor-pointer list-none px-2.5 py-2 font-semibold text-ink-2 [&::-webkit-details-marker]:hidden">
        Faixa de referência ({ctx.objetivo}, {ctx.nivel}): {linhas.map(([r, v]) => `${r} ${v}`).join(" · ")}
      </summary>
      <div className="space-y-1 border-t border-border px-2.5 py-2">
        {linhas.map(([rot, val, nota]) => (
          <p key={rot} className="text-ink-2">
            <span className="font-semibold text-ink">{rot}</span> {val}
            {nota && <span className="text-ink-3"> ({nota})</span>}
          </p>
        ))}
        <p className="text-ink-3">{f.ressalva}</p>
        {refs && <p className="text-ink-3">Base: {refs}.</p>}
      </div>
    </details>
  );
}

/* ================================ Sessão ================================ */

const CAMPOS: { chave: CampoFaixa | "intensidade"; rotulo: string }[] = [
  { chave: "series", rotulo: "Séries" },
  { chave: "reps", rotulo: "Repetições" },
  { chave: "intensidade", rotulo: "Intensidade" },
  { chave: "intervalo", rotulo: "Intervalo" },
];

function SessaoBloco({
  sessao,
  ctx,
  editavel,
  onChange,
  onRemover,
}: {
  sessao: Sessao;
  ctx: ContextoFaixa;
  editavel: boolean;
  onChange: (s: Sessao) => void;
  onRemover: () => void;
}) {
  const faixa = getFaixa(ctx.objetivo);

  const addBloco = (slug: string) => {
    if (!slug) return;
    const ex = exercises.find((e) => e.slug === slug);
    onChange({
      ...sessao,
      blocos: [
        ...sessao.blocos,
        {
          id: nid("blk"),
          tipo: "forca",
          exercicioSlug: ex?.slug,
          nome: ex?.nome ?? "Novo exercício",
          series: faixa.series.valor,
          reps: valorFaixa(faixa.reps, ctx.nivel),
          intensidade: faixa.intensidade.valor,
          intervalo: faixa.intervalo.valor,
        },
      ],
    });
  };

  return (
    <div className="rounded-lg bg-surface-soft p-2.5">
      <div className="mb-1.5 flex items-center gap-1.5">
        <Repeat className="h-3.5 w-3.5 shrink-0 text-primary" />
        {editavel ? (
          <input
            value={sessao.nome}
            onChange={(e) => onChange({ ...sessao, nome: e.target.value })}
            aria-label="Nome da sessão"
            className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-1 py-0.5 text-sm font-semibold text-ink hover:border-border focus:border-primary focus:bg-surface focus:outline-none"
          />
        ) : (
          <span className="flex-1 text-sm font-semibold text-ink">{sessao.nome}</span>
        )}
        {editavel && (
          <button onClick={onRemover} aria-label={`Remover ${sessao.nome}`} className="rounded p-1 text-ink-3 hover:bg-surface hover:text-[color:var(--cta-text)]">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {sessao.blocos.length === 0 && <p className="px-1 py-2 text-xs text-ink-3">Sessão sem exercícios. Adicione abaixo.</p>}

      <ul className="space-y-1.5">
        {sessao.blocos.map((b) => (
          <li key={b.id}>
            <BlocoRow
              bloco={b}
              ctx={ctx}
              editavel={editavel}
              onChange={(nb) => onChange({ ...sessao, blocos: sessao.blocos.map((x) => (x.id === b.id ? nb : x)) })}
              onRemover={() => onChange({ ...sessao, blocos: sessao.blocos.filter((x) => x.id !== b.id) })}
            />
          </li>
        ))}
      </ul>

      {editavel && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <label className="text-xs text-ink-3" htmlFor={`add-${sessao.id}`}>
            Adicionar exercício
          </label>
          <select
            id={`add-${sessao.id}`}
            value=""
            onChange={(e) => {
              addBloco(e.target.value);
              e.target.value = "";
            }}
            className="input h-8 max-w-[220px] py-0 text-xs"
          >
            <option value="">Escolher do acervo</option>
            {[...exercises]
              .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
              .map((e) => (
                <option key={e.slug} value={e.slug}>
                  {e.nome}
                </option>
              ))}
          </select>
        </div>
      )}
    </div>
  );
}

/* ================================ Bloco (exercício) ================================ */

function BlocoRow({
  bloco,
  ctx,
  editavel,
  onChange,
  onRemover,
}: {
  bloco: BlocoSessao;
  ctx: ContextoFaixa;
  editavel: boolean;
  onChange: (b: BlocoSessao) => void;
  onRemover: () => void;
}) {
  const faixa = getFaixa(ctx.objetivo);
  // O bloco aeróbio conta minutos, não repetições: a faixa de força não se aplica a ele.
  const confere = bloco.tipo !== "aerobio";

  if (!editavel) {
    return (
      <div className="flex flex-wrap items-baseline gap-x-2 text-xs text-ink-2">
        <span className="font-semibold text-ink">{bloco.nome}</span>
        {bloco.series && <span>{bloco.series} séries</span>}
        {bloco.reps && <span>· {bloco.reps} reps</span>}
        {bloco.intensidade && <span>· {bloco.intensidade}</span>}
        {bloco.intervalo && bloco.intervalo !== "-" && <span>· intervalo {bloco.intervalo}</span>}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-2">
      <div className="mb-1.5 flex items-center gap-1.5">
        <input
          value={bloco.nome ?? ""}
          onChange={(e) => onChange({ ...bloco, nome: e.target.value })}
          aria-label="Nome do exercício"
          className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-1 py-0.5 text-xs font-semibold text-ink hover:border-border focus:border-primary focus:outline-none"
        />
        {bloco.exercicioSlug && (
          <Link
            to={`/lab/${bloco.exercicioSlug}`}
            className="shrink-0 text-[11px] font-semibold text-primary hover:underline"
            title="Ver a análise deste exercício"
          >
            ver análise
          </Link>
        )}
        <button onClick={onRemover} aria-label={`Remover ${bloco.nome}`} className="shrink-0 rounded p-1 text-ink-3 hover:bg-surface-soft hover:text-[color:var(--cta-text)]">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {CAMPOS.map(({ chave, rotulo }) => {
          const valor = bloco[chave] ?? "";
          const aviso = confere && chave !== "intensidade" ? conferirFaixa(chave, valor, faixa, ctx.nivel) : null;
          return (
            <CampoInline
              key={chave}
              rotulo={rotulo}
              valor={valor}
              aviso={aviso}
              onChange={(v) => onChange({ ...bloco, [chave]: v })}
            />
          );
        })}
      </div>
    </div>
  );
}

function CampoInline({
  rotulo,
  valor,
  aviso,
  onChange,
}: {
  rotulo: string;
  valor: string;
  aviso: string | null;
  onChange: (v: string) => void;
}) {
  const id = React.useId();
  return (
    <div>
      <label htmlFor={id} className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide text-ink-3">
        {rotulo}
      </label>
      <input
        id={id}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={aviso ? `${id}-aviso` : undefined}
        aria-invalid={undefined}
        className={cn(
          "w-full rounded-md border bg-surface px-1.5 py-1 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary/40",
          aviso ? "border-warning bg-[#fef7e8]" : "border-border",
        )}
      />
      {aviso && (
        <p id={`${id}-aviso`} className="mt-0.5 flex items-start gap-1 text-[10px] leading-tight text-warning">
          <AlertTriangle className="mt-px h-3 w-3 shrink-0" />
          {aviso}
        </p>
      )}
    </div>
  );
}

/* ================================ Modelo ================================ */

export function ModeloExplicacao({ modelo }: { modelo: ReturnType<typeof getModelo> }) {
  return (
    <details className="group rounded-card border border-border bg-surface-soft">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-card px-4 py-3 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
        <Info className="h-4 w-4 shrink-0 text-ink-3" />
        Entenda o modelo: {modelo.nome}
        <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-ink-3 transition-transform group-open:rotate-180" />
      </summary>
      <div className="space-y-4 px-4 pb-4">
        <Bloco titulo="Como funciona" texto={modelo.comoFunciona} />
        <Bloco titulo="Racional científico" texto={modelo.racionalCientifico} />
        <div className="grid gap-4 sm:grid-cols-2">
          <ListaChips titulo="Indicado para" itens={modelo.perfisIndicados} />
          <ListaChips titulo="Variáveis a controlar" itens={modelo.variaveisControladas} />
          <CriterioLista titulo="Pontos fortes" itens={modelo.pontosFortes} tone="success" />
          <CriterioLista titulo="Limitações" itens={modelo.limitacoes} tone="warning" />
        </div>
        <CriterioLista titulo="Erros comuns" itens={modelo.errosComuns} tone="warning" />
        {modelo.aprenderHref && (
          <Link to={modelo.aprenderHref} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
            <BookOpen className="h-4 w-4" /> Aprofundar no Aprender
          </Link>
        )}
      </div>
    </details>
  );
}

/* ================================ Peças ================================ */

export function ListaChips({ titulo, itens }: { titulo: string; itens: string[] }) {
  if (!itens.length) return null;
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-3">{titulo}</p>
      <div className="flex flex-wrap gap-1.5">
        {itens.map((it, i) => (
          <span key={i} className="rounded-lg bg-surface px-2 py-1 text-xs text-ink-2">
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}

export function CriterioLista({
  titulo,
  itens,
  tone,
  editavel,
  onChange,
}: {
  titulo: string;
  itens: string[];
  tone: "success" | "warning";
  editavel?: boolean;
  onChange?: (itens: string[]) => void;
}) {
  if (!itens.length && !editavel) return null;
  const dot = tone === "success" ? "bg-success" : "bg-warning";

  if (!editavel) {
    return (
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-3">{titulo}</p>
        <ul className="space-y-1">
          {itens.map((it, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-ink-2">
              <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", dot)} />
              {it}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-3">{titulo}</p>
      <ul className="space-y-1">
        {itens.map((it, i) => (
          <li key={i} className="flex items-start gap-1.5">
            <span className={cn("mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full", dot)} />
            <input
              value={it}
              onChange={(e) => onChange?.(itens.map((x, j) => (j === i ? e.target.value : x)))}
              aria-label={`${titulo}, critério ${i + 1}`}
              className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-1 py-0.5 text-sm text-ink-2 hover:border-border focus:border-primary focus:bg-surface focus:outline-none"
            />
            <button
              onClick={() => onChange?.(itens.filter((_, j) => j !== i))}
              aria-label={`Remover critério ${i + 1}`}
              className="mt-0.5 rounded p-1 text-ink-3 hover:text-[color:var(--cta-text)]"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </li>
        ))}
      </ul>
      <button onClick={() => onChange?.([...itens, ""])} className="mt-1 text-xs font-semibold text-primary hover:underline">
        + adicionar critério
      </button>
    </div>
  );
}

function Bloco({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div>
      <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-analysis">
        <Target className="h-3.5 w-3.5" /> {titulo}
      </p>
      <p className="text-sm text-ink-2">{texto}</p>
    </div>
  );
}
