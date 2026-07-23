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
  Dumbbell,
  HeartPulse,
  Replace,
  Search,
  X,
} from "lucide-react";
import { Card, Pill, buttonClasses } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import {
  getFaixa,
  getModelo,
  rotuloMeso,
  TEND_LABEL,
  valorFaixa,
  type Macrociclo,
  type Mesociclo,
  type Microciclo,
  type Sessao,
  type BlocoSessao,
  type TipoMicrociclo,
  type MetodoSerie,
  METODOS_SERIE,
  getMetodo,
} from "@/data/periodizacao";
import { conferirFaixa, faixaSugerida, type CampoFaixa } from "@/lib/gps/faixas";
import { desenharProgressao, posicoesFocos } from "@/lib/gps/progressao";
import { adequacaoLabel, EQUIPAMENTOS, type GpsObjetivo, type Recommendation } from "@/lib/gps/engine";
import { sugerirTroca, type ContextoTroca } from "@/lib/gps/sugerirTroca";
import type { RestricaoSelecionada } from "@/lib/gps/restricoes";
import type { Nivel } from "@/data/types";
import { getParam } from "@/data/monitoringParameters";
import { getModalidade } from "@/data/modalities";
import { refCurta } from "@/data/referencias";
import { exercises } from "@/data/exercises";
import { uid } from "@/lib/store";
import { useDialog } from "@/lib/useDialog";

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

const TIPO_LABEL: Record<TipoMicrociclo, string> = { carga: "Carga", deload: "Descarga", teste: "Teste" };

const nid = (p: string) => `${p}-${uid()}`;

export interface ContextoFaixa {
  objetivo: GpsObjetivo;
  nivel: Nivel;
  /** perfil do aluno para a troca segura (Trocar/Adicionar); ausente = plano avulso */
  restricoes?: RestricaoSelecionada[];
  equipamentos?: string[];
  grupoEspecial?: string;
  /** resolve a data de exibição de uma prescrição pela id (selo "da prescrição de …") */
  prescricaoData?: (id: string) => string | undefined;
}

/** Monta o contexto de ranqueamento a partir do ContextoFaixa (defaults do Gps sem aluno). */
function ctxTrocaDe(ctx: ContextoFaixa): ContextoTroca {
  return {
    objetivo: ctx.objetivo,
    nivel: ctx.nivel,
    restricoes: ctx.restricoes ?? [],
    equipamentos: ctx.equipamentos ?? [...EQUIPAMENTOS],
    grupoEspecial: ctx.grupoEspecial,
  };
}

/** Há perfil de aluno que justifique ranquear (senão a ordem alfabética é mais previsível). */
function temContextoDeAluno(ctx: ContextoFaixa): boolean {
  return Boolean(ctx.grupoEspecial) || (ctx.restricoes?.length ?? 0) > 0;
}

/** Selo pequeno "da prescrição de {data}" para blocos vindos do tubo Aplicar no treino. */
function SeloOrigem({ ctx, bloco }: { ctx: ContextoFaixa; bloco: BlocoSessao }) {
  if (!bloco.origemPrescricaoId) return null;
  const data = ctx.prescricaoData?.(bloco.origemPrescricaoId);
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-surface-soft px-1.5 py-0.5 text-2xs font-medium text-ink-3">
      <Repeat className="h-2.5 w-2.5" aria-hidden />
      da prescrição{data ? ` de ${data}` : ""}
    </span>
  );
}

/* ================================ Gráfico ================================ */

export function GraficoProgressao({ macro, nivel }: { macro: Macrociclo; nivel?: Nivel }) {
  const g = desenharProgressao(macro, undefined, undefined, nivel);
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
      <div className="relative overflow-x-auto">
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

          {/* faixas de fase: fundo alternado (inclui a fileira de ícones no topo) + rótulo ao pé */}
          {g.fases.map((f) => (
            <g key={f.indice}>
              <rect
                x={f.x0}
                y={g.bandTop}
                width={f.x1 - f.x0}
                height={g.faixaBottom - g.bandTop}
                fill={f.indice % 2 === 0 ? "var(--surface-soft)" : "transparent"}
                opacity={0.5}
              />
              {f.indice > 0 && (
                <line x1={f.x0} y1={g.bandTop} x2={f.x0} y2={g.faixaBottom} stroke="var(--border)" strokeWidth={1} strokeDasharray="3 3" />
              )}
              {/* ícones do que se treina mais na fase, no topo */}
              {posicoesFocos(f, g.iconRowY).map((p, i) => (
                <g key={i} transform={p.transform} stroke="var(--ink-2)" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <title>{p.foco.label}</title>
                  {p.foco.glifo.paths.map((d, j) => (
                    <path key={j} d={d} />
                  ))}
                  {p.foco.glifo.circles?.map((c, j) => (
                    <circle key={`c${j}`} cx={c.cx} cy={c.cy} r={c.r} />
                  ))}
                </g>
              ))}
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
        {/* Affordance de rolagem: um fade no canto direito sugere que o gráfico continua. */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-[#ffffff]" />
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
  atual,
  semanaCorrente,
  reavaliarHref,
}: {
  meso: Mesociclo;
  indice: number;
  ctx: ContextoFaixa;
  editavel: boolean;
  onChange?: (m: Mesociclo) => void;
  /** este é o bloco em que o plano está hoje (pelo calendário) */
  atual?: boolean;
  /** semana corrente do plano, para destacar a semana e disparar a reavaliação */
  semanaCorrente?: number;
  /** destino do "Registrar reavaliação" (só quando há aluno com plano) */
  reavaliarHref?: string;
}) {
  // O bloco corrente abre por padrão ("você está aqui"); sem essa informação, o primeiro.
  const [aberto, setAberto] = React.useState(atual ?? indice === 0);

  // A descarga vive na semana (`tipo`), não num campo à parte: mover a descarga de semana
  // tem que mudar o selo do bloco junto, senão o card diz uma coisa e o plano faz outra.
  const trocarMicro = (m: Microciclo) => {
    const microciclos = meso.microciclos.map((w) => (w.id === m.id ? m : w));
    onChange?.({ ...meso, microciclos, deload: microciclos.some((w) => w.tipo === "deload") });
  };

  // "Registrar reavaliação": só quando o bloco pede reavaliação e o calendário já está
  // na última (ou penúltima) semana dele, e só quando há aluno para reavaliar.
  const mostrarReavaliar =
    Boolean(reavaliarHref) && meso.reavaliacao && semanaCorrente != null && semanaCorrente >= meso.semanaFim - 1;

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
            <span className="font-display font-bold text-ink">{rotuloMeso(meso, indice)}</span>
            <span className="text-xs text-ink-3">
              semanas {meso.semanaInicio} a {meso.semanaFim}
            </span>
            {/* Teto de 3 selos: "em curso", "com descarga", "reavaliar ao fim". */}
            {atual && <Pill tone="primary">em curso</Pill>}
            {meso.deload && <Pill tone="neutral">com descarga</Pill>}
            {meso.reavaliacao && <Pill tone="analysis">reavaliar ao fim</Pill>}
          </div>
          <p className="mt-0.5 text-sm text-ink-2">{meso.foco}</p>
        </div>
        <ChevronDown className={cn("mt-1 h-4 w-4 shrink-0 text-ink-3 transition-transform", aberto && "rotate-180")} />
      </button>

      {aberto && (
        <div className="space-y-4 border-t border-border px-4 pb-4 pt-3">
          {/* (1) Semanas primeiro: é o que decide o que fazer AGORA para o professor com pressa. */}
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-3">Semanas</p>
            <div className="space-y-2">
              {meso.microciclos.map((w) => (
                <MicrocicloRow
                  key={w.id}
                  micro={w}
                  ctx={ctx}
                  editavel={editavel}
                  onChange={trocarMicro}
                  atual={semanaCorrente != null && w.semana === semanaCorrente}
                />
              ))}
            </div>
          </div>

          {/* (2) Dinâmica: as três tendências da fase, num cartão só. */}
          <div className="rounded-xl border border-border bg-surface-soft p-3">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="mr-0.5 text-2xs font-semibold uppercase tracking-wide text-ink-3">Dinâmica</span>
              <Pill tone={meso.tendenciaVolume === "sobe" ? "analysis" : "neutral"}>Volume {TEND_LABEL[meso.tendenciaVolume]}</Pill>
              <Pill tone={meso.tendenciaIntensidade === "sobe" ? "analysis" : "neutral"}>Intensidade {TEND_LABEL[meso.tendenciaIntensidade]}</Pill>
              <Pill tone={meso.tendenciaComplexidade === "sobe" ? "analysis" : "neutral"}>Complexidade {TEND_LABEL[meso.tendenciaComplexidade]}</Pill>
            </div>
          </div>

          {/* (3) O que treinar: identidade da fase (capacidades e modalidades). */}
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-3">O que treinar</p>
            <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
              <ListaChips titulo="Capacidades priorizadas" itens={meso.capacidades} />
              <ListaChips
                titulo="Modalidades em foco"
                itens={(meso.modalidades ?? []).map((id) => getModalidade(id)?.nome ?? id)}
              />
            </div>
          </div>

          {/* (4) Reavaliação e critérios de decisão. */}
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

          {mostrarReavaliar && (
            <Link to={reavaliarHref!} className={buttonClasses("secondary", "sm")}>
              <CalendarCheck className="h-4 w-4" /> Registrar reavaliação
            </Link>
          )}

          {/* (5) Detalhes da fase: o que desce da leitura de relance para quem quiser aprofundar. */}
          <details className="rounded-lg border border-dashed border-border bg-surface-soft p-3 text-xs">
            <summary className="cursor-pointer list-none font-semibold text-ink-2 [&::-webkit-details-marker]:hidden">
              Detalhes da fase
            </summary>
            <div className="mt-3 grid gap-x-4 gap-y-3 sm:grid-cols-2">
              <ListaChips titulo="Tipos de exercício" itens={meso.tiposExercicio} />
              {meso.parametros.length > 0 && (
                <div>
                  <p className="mb-1 text-2xs font-semibold uppercase tracking-wide text-ink-3">Acompanhar</p>
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
            </div>
          </details>
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
  atual,
}: {
  micro: Microciclo;
  ctx: ContextoFaixa;
  editavel: boolean;
  onChange: (m: Microciclo) => void;
  /** a semana corrente do plano: ganha destaque e abre por padrão */
  atual?: boolean;
}) {
  const [aberto, setAberto] = React.useState(Boolean(atual));

  // Frequência é quantas sessões a semana tem. Guardar o número separado das sessões
  // deixaria o plano dizer "4x" e entregar 3.
  const trocarSessoes = (sessoes: Sessao[]) => onChange({ ...micro, sessoes, frequencia: sessoes.length });

  const addSessao = () =>
    trocarSessoes([...micro.sessoes, { id: nid("ses"), nome: `Sessão ${micro.sessoes.length + 1}`, blocos: [] }]);

  return (
    <div className={cn("rounded-xl border", atual ? "border-primary bg-primary-tint" : "border-border")}>
      <button
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        className="flex w-full items-start gap-2 p-2.5 text-left text-sm hover:bg-surface-soft"
      >
        {/* Duas linhas: o selo da semana com a contagem em cima, os nomes das sessões embaixo. */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone={micro.tipo === "deload" ? "warning" : micro.tipo === "teste" ? "analysis" : "neutral"}>
              Semana {micro.semana}
              {micro.tipo !== "carga" ? ` · ${TIPO_LABEL[micro.tipo]}` : ""}
            </Pill>
            <span className="text-ink-2">
              {micro.sessoes.length} {micro.sessoes.length === 1 ? "sessão" : "sessões"}
            </span>
          </div>
          {micro.sessoes.length > 0 && (
            <p className="truncate text-xs text-ink-3">{micro.sessoes.map((s) => s.nome).join(" · ")}</p>
          )}
        </div>
        <ChevronDown className={cn("mt-0.5 h-4 w-4 shrink-0 text-ink-3 transition-transform", aberto && "rotate-180")} />
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
    <details className="rounded-lg border border-dashed border-border bg-surface-soft text-xs">
      <summary className="cursor-pointer list-none px-2.5 py-2 text-ink-2 [&::-webkit-details-marker]:hidden">
        <span className="font-semibold">Faixa de referência</span> ({ctx.objetivo}, {ctx.nivel}):{" "}
        {/* Só os valores em negrito: a linha toda em bold virava ruído (o dado é o número). */}
        {linhas.map(([rot, val], i) => (
          <React.Fragment key={rot}>
            {i > 0 ? " · " : ""}
            {rot} <span className="font-semibold text-ink">{val}</span>
          </React.Fragment>
        ))}
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

// Força e aeróbio se editam por variáveis diferentes. `confere` liga o aviso de fora da
// faixa só nos campos de força que a diretriz cobre (séries, repetições, intervalo).
type CampoBloco = {
  chave: "series" | "reps" | "intensidade" | "intervalo" | "formato" | "duracao" | "recuperacao";
  rotulo: string;
  confere?: CampoFaixa;
};
const CAMPOS_FORCA: CampoBloco[] = [
  { chave: "series", rotulo: "Séries", confere: "series" },
  { chave: "reps", rotulo: "Repetições", confere: "reps" },
  { chave: "intensidade", rotulo: "Intensidade" },
  { chave: "intervalo", rotulo: "Intervalo", confere: "intervalo" },
];
const CAMPOS_AEROBIO: CampoBloco[] = [
  { chave: "formato", rotulo: "Formato" },
  { chave: "duracao", rotulo: "Duração" },
  { chave: "intensidade", rotulo: "Intensidade" },
  { chave: "recuperacao", rotulo: "Recuperação" },
];
const camposDoBloco = (b: BlocoSessao): CampoBloco[] => (b.tipo === "aerobio" ? CAMPOS_AEROBIO : CAMPOS_FORCA);

/* ============================ Quadro da sessão (leitura) ============================ */

/**
 * A sessão vira um quadro glanceável: musculação e cardio em blocos separados, cada
 * informação em sua linha. O profissional (ou o aluno) bate o olho e sabe o que fazer,
 * sem ler linhas corridas. Força vai em tabela; cardio vai em ficha com rótulos empilhados,
 * porque as variáveis são outras (formato, duração e intensidade, não séries e carga).
 */
function QuadroForca({ blocos, ctx }: { blocos: BlocoSessao[]; ctx: ContextoFaixa }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex items-center gap-1.5 border-b border-border bg-surface-soft px-2.5 py-1.5">
        <Dumbbell className="h-3.5 w-3.5 text-primary" aria-hidden />
        <span className="text-2xs font-semibold uppercase tracking-wide text-ink-2">Musculação</span>
      </div>
      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-xs">
          <thead>
            <tr className="text-2xs uppercase tracking-wide text-ink-3">
              <th className="px-2.5 py-1 font-semibold">Exercício</th>
              <th className="px-1.5 py-1 font-semibold">Séries</th>
              <th className="px-1.5 py-1 font-semibold">Reps</th>
              <th className="px-1.5 py-1 font-semibold">Intensidade</th>
              <th className="px-1.5 py-1 font-semibold">Intervalo</th>
            </tr>
          </thead>
          <tbody>
            {blocos.map((b) => (
              <tr key={b.id} className="border-t border-border align-top">
                <td className="px-2.5 py-1.5 font-semibold text-ink">
                  <span className="inline-flex flex-wrap items-center gap-1.5">
                    {b.nome}
                    {b.metodo && b.metodo !== "tradicional" && (
                      <span className="rounded-full bg-primary-tint px-1.5 py-0.5 text-2xs font-bold text-primary">
                        {getMetodo(b.metodo)?.nome}
                      </span>
                    )}
                    <SeloOrigem ctx={ctx} bloco={b} />
                  </span>
                </td>
                <td className="px-1.5 py-1.5 text-ink-2">{b.series}</td>
                <td className="px-1.5 py-1.5 text-ink-2">{b.reps}</td>
                <td className="px-1.5 py-1.5 text-ink-2">{b.intensidade}</td>
                <td className="px-1.5 py-1.5 text-ink-2">{b.intervalo && b.intervalo !== "-" ? b.intervalo : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Affordance de rolagem: um fade no canto direito sugere que a tabela continua. */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-[#ffffff]" />
      </div>
    </div>
  );
}

function QuadroCardio({ blocos }: { blocos: BlocoSessao[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex items-center gap-1.5 border-b border-border bg-surface-soft px-2.5 py-1.5">
        <HeartPulse className="h-3.5 w-3.5 text-analysis" aria-hidden />
        <span className="text-2xs font-semibold uppercase tracking-wide text-ink-2">Cardio</span>
      </div>
      <div className="divide-y divide-border">
        {blocos.map((b) => {
          const atividade = b.modalidade ? getModalidade(b.modalidade)?.nome : undefined;
          const linhas: [string, string | undefined][] = [
            ["Formato", b.formato],
            ["Duração", b.duracao],
            ["Intensidade", b.intensidade],
            ["Recuperação", b.recuperacao && b.recuperacao !== "-" ? b.recuperacao : undefined],
          ];
          return (
            <div key={b.id} className="px-2.5 py-2">
              <p className="mb-1 text-xs font-semibold text-ink">{atividade ?? b.nome ?? "Aeróbio"}</p>
              <dl className="space-y-0.5">
                {linhas
                  .filter(([, v]) => v)
                  .map(([rot, v]) => (
                    <div key={rot} className="flex gap-2 text-xs">
                      <dt className="w-24 shrink-0 text-ink-3">{rot}</dt>
                      <dd className="flex-1 font-medium text-ink-2">{v}</dd>
                    </div>
                  ))}
              </dl>
              {b.observacao && <p className="mt-1 text-2xs leading-snug text-ink-3">{b.observacao}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SessaoQuadro({ sessao, ctx }: { sessao: Sessao; ctx: ContextoFaixa }) {
  if (sessao.blocos.length === 0) return <p className="px-1 py-2 text-xs text-ink-3">Sessão sem exercícios definidos.</p>;
  const forca = sessao.blocos.filter((b) => b.tipo !== "aerobio");
  const cardio = sessao.blocos.filter((b) => b.tipo === "aerobio");
  const duasColunas = forca.length > 0 && cardio.length > 0;
  return (
    <div className={cn("grid gap-2", duasColunas && "md:grid-cols-2")}>
      {forca.length > 0 && <QuadroForca blocos={forca} ctx={ctx} />}
      {cardio.length > 0 && <QuadroCardio blocos={cardio} />}
    </div>
  );
}

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

  // Com perfil de aluno, o "Adicionar" segue o mesmo ranking seguro do Prescrever exercício;
  // sem perfil, a ordem alfabética é a mais previsível para o plano avulso.
  const opcoesAdicionar = React.useMemo(
    () =>
      temContextoDeAluno(ctx)
        ? sugerirTroca(ctxTrocaDe(ctx)).map((r) => r.exercise)
        : [...exercises].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
    [ctx],
  );

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

  const addCardio = () => {
    onChange({
      ...sessao,
      blocos: [
        ...sessao.blocos,
        {
          id: nid("blk"),
          tipo: "aerobio",
          modalidade: "caminhada",
          nome: "Aeróbio",
          formato: "Contínuo",
          duracao: "20 a 30 min",
          intensidade: "Moderada (teste da conversa; RPE 4 a 6)",
          recuperacao: "-",
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

      {!editavel ? (
        <SessaoQuadro sessao={sessao} ctx={ctx} />
      ) : (
        <>
          {sessao.blocos.length === 0 && <p className="px-1 py-2 text-xs text-ink-3">Sessão sem exercícios. Adicione abaixo.</p>}

          <ul className="space-y-1.5">
            {sessao.blocos.map((b) => (
              <li key={b.id}>
                <BlocoRow
                  bloco={b}
                  ctx={ctx}
                  onChange={(nb) => onChange({ ...sessao, blocos: sessao.blocos.map((x) => (x.id === b.id ? nb : x)) })}
                  onRemover={() => onChange({ ...sessao, blocos: sessao.blocos.filter((x) => x.id !== b.id) })}
                />
              </li>
            ))}
          </ul>

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
              {opcoesAdicionar.map((e) => (
                <option key={e.slug} value={e.slug}>
                  {e.nome}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addCardio}
              className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-semibold text-ink-2 hover:bg-surface"
            >
              <HeartPulse className="h-3.5 w-3.5 text-analysis" /> Adicionar cardio
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ================================ Bloco (exercício) ================================ */

function BlocoRow({
  bloco,
  ctx,
  onChange,
  onRemover,
}: {
  bloco: BlocoSessao;
  ctx: ContextoFaixa;
  onChange: (b: BlocoSessao) => void;
  onRemover: () => void;
}) {
  const faixa = getFaixa(ctx.objetivo);
  const aerobio = bloco.tipo === "aerobio";
  const [trocar, setTrocar] = React.useState(false);
  const exAtual = bloco.exercicioSlug ? exercises.find((e) => e.slug === bloco.exercicioSlug) : undefined;

  return (
    <div className="rounded-lg border border-border bg-surface p-2">
      <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
        {aerobio && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded bg-[#0e7c8a]/10 px-1.5 py-0.5 text-2xs font-semibold uppercase tracking-wide text-analysis">
            <HeartPulse className="h-3 w-3" aria-hidden /> Cardio
          </span>
        )}
        <input
          value={bloco.nome ?? ""}
          onChange={(e) => onChange({ ...bloco, nome: e.target.value })}
          aria-label={aerobio ? "Nome do bloco de cardio" : "Nome do exercício"}
          className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-1 py-0.5 text-xs font-semibold text-ink hover:border-border focus:border-primary focus:outline-none"
        />
        <SeloOrigem ctx={ctx} bloco={bloco} />
        {!aerobio && (
          <button
            type="button"
            onClick={() => setTrocar(true)}
            className="inline-flex shrink-0 items-center gap-1 text-2xs font-semibold text-primary hover:underline"
            title="Trocar por outro exercício, ranqueado pelo perfil do aluno"
          >
            <Replace className="h-3.5 w-3.5" /> Trocar
          </button>
        )}
        {bloco.exercicioSlug && (
          <Link
            to={`/movement-lab/${bloco.exercicioSlug}`}
            className="shrink-0 text-2xs font-semibold text-primary hover:underline"
            title="Ver a análise deste exercício"
          >
            ver análise
          </Link>
        )}
        <button onClick={onRemover} aria-label={`Remover ${bloco.nome}`} className="shrink-0 rounded p-1 text-ink-3 hover:bg-surface-soft hover:text-[color:var(--cta-text)]">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {trocar && (
        <SeletorExercicioSheet
          ctx={ctx}
          alvo={exAtual?.grupoMuscular}
          titulo="Trocar exercício"
          onClose={() => setTrocar(false)}
          onEscolher={(ex) => {
            // Grava slug E nome juntos: renomear sem trocar o slug fazia "ver análise"
            // apontar para o exercício errado (o drift que isto conserta).
            onChange({ ...bloco, exercicioSlug: ex.slug, nome: ex.nome });
            setTrocar(false);
          }}
        />
      )}
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {camposDoBloco(bloco).map(({ chave, rotulo, confere }) => {
          const valor = (bloco[chave] as string | undefined) ?? "";
          const aviso = confere ? conferirFaixa(confere, valor, faixa, ctx.nivel) : null;
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
      {!aerobio && (
        <div className="mt-1.5">
          <label className="mb-0.5 block text-2xs font-semibold uppercase tracking-wide text-ink-3">Método de série</label>
          <select
            value={bloco.metodo ?? "tradicional"}
            onChange={(e) =>
              onChange({
                ...bloco,
                metodo: e.target.value === "tradicional" ? undefined : (e.target.value as MetodoSerie),
              })
            }
            aria-label="Método de série"
            className="input h-8 max-w-[220px] py-0 text-xs"
          >
            {METODOS_SERIE.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome}
              </option>
            ))}
          </select>
          {bloco.metodo && bloco.metodo !== "tradicional" && (
            <p className="mt-0.5 text-2xs leading-tight text-ink-3">{getMetodo(bloco.metodo)?.descricao}</p>
          )}
        </div>
      )}
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
      <label htmlFor={id} className="mb-0.5 block text-2xs font-semibold uppercase tracking-wide text-ink-3">
        {rotulo}
      </label>
      <input
        id={id}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={aviso ? `${id}-aviso` : undefined}
        aria-invalid={undefined}
        className={cn(
          "w-full rounded-md border bg-surface px-1.5 py-1 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary",
          aviso ? "border-warning bg-warning-tint" : "border-border",
        )}
      />
      {aviso && (
        <p id={`${id}-aviso`} className="mt-0.5 flex items-start gap-1 text-2xs leading-tight text-warning">
          <AlertTriangle className="mt-px h-3 w-3 shrink-0" />
          {aviso}
        </p>
      )}
    </div>
  );
}

/* ============================ Seletor de exercício (troca) ============================ */

/**
 * Lista ranqueada para trocar (ou adicionar) um exercício, com o mesmo motor seguro do
 * Prescrever exercício. Bottom sheet no mobile, modal estreito no desktop. Os excluídos pelo
 * perfil ficam num grupo colapsado ao fim, cada um com o motivo, nunca misturados na lista.
 * Score exibido com `adequacaoLabel`, nunca "%".
 */
function SeletorExercicioSheet({
  ctx,
  alvo,
  titulo,
  onEscolher,
  onClose,
}: {
  ctx: ContextoFaixa;
  /** grupo muscular do exercício que está saindo; sem ele, ranqueia de forma geral */
  alvo?: string;
  titulo: string;
  onEscolher: (ex: { slug: string; nome: string }) => void;
  onClose: () => void;
}) {
  const dialogRef = useDialog<HTMLDivElement>(onClose);
  const [busca, setBusca] = React.useState("");
  const recs = React.useMemo(() => sugerirTroca(ctxTrocaDe(ctx), alvo), [ctx, alvo]);
  const q = busca.trim().toLowerCase();
  const filtra = (r: Recommendation) => !q || r.exercise.nome.toLowerCase().includes(q);
  const incluidos = recs.filter((r) => !r.excluido).filter(filtra);
  const excluidos = recs.filter((r) => r.excluido).filter(filtra);
  // Top 10 quando não há busca; com busca, mostra todos os que casam.
  const topo = q ? incluidos : incluidos.slice(0, 10);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end bg-black/40 p-0 backdrop-blur-sm sm:place-items-center sm:p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-t-card bg-surface shadow-elevated outline-none sm:rounded-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border p-4">
          <h2 className="font-display text-base font-bold text-ink">{titulo}</h2>
          <button onClick={onClose} aria-label="Fechar" className="rounded p-1 text-ink-3 hover:bg-surface-soft hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="border-b border-border p-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5">
            <Search className="h-4 w-4 shrink-0 text-ink-3" aria-hidden />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar exercício"
              aria-label="Buscar exercício"
              className="h-9 w-full bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none"
            />
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {topo.length === 0 && <p className="py-6 text-center text-sm text-ink-3">Nenhum exercício encontrado.</p>}
          <ul className="space-y-1.5">
            {topo.map((r) => (
              <li key={r.exercise.slug}>
                <button
                  onClick={() => onEscolher({ slug: r.exercise.slug, nome: r.exercise.nome })}
                  className="flex w-full items-center gap-2 rounded-lg border border-border bg-surface p-2.5 text-left hover:border-primary hover:bg-surface-soft"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-ink">{r.exercise.nome}</div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-ink-3">
                      <span>{r.exercise.grupoMuscular}</span>
                      <span aria-hidden>·</span>
                      <span>{r.exercise.equipamento}</span>
                    </div>
                  </div>
                  <span className="shrink-0 text-right">
                    <span className="block text-xs font-semibold text-primary">{adequacaoLabel(r.score)}</span>
                    <span className="tabular block text-2xs text-ink-3">{r.score}/100</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {excluidos.length > 0 && (
            <details className="mt-3 rounded-lg border border-dashed border-border">
              <summary className="cursor-pointer list-none px-3 py-2 text-xs font-semibold text-ink-2 [&::-webkit-details-marker]:hidden">
                {excluidos.length} {excluidos.length === 1 ? "excluído" : "excluídos"} pelo perfil
              </summary>
              <ul className="space-y-1.5 border-t border-border p-2.5">
                {excluidos.map((r) => (
                  <li key={r.exercise.slug} className="rounded-lg bg-surface-soft p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink-2">{r.exercise.nome}</span>
                      <button
                        onClick={() => onEscolher({ slug: r.exercise.slug, nome: r.exercise.nome })}
                        className="shrink-0 text-xs font-semibold text-ink-3 hover:text-primary hover:underline"
                      >
                        Usar mesmo assim
                      </button>
                    </div>
                    {r.motivoExclusao && (
                      <p className="mt-1 flex items-start gap-1 text-2xs leading-snug text-warning">
                        <AlertTriangle className="mt-px h-3 w-3 shrink-0" aria-hidden />
                        {r.motivoExclusao}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      </div>
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
      {/* Borda própria: chip sobre fundo soft/branco sem cápsula sumia na
          paleta pele clínica. Conserta MesocicloCard e ModeloExplicacao de uma vez. */}
      <div className="flex flex-wrap gap-1.5">
        {itens.map((it, i) => (
          <span key={i} className="rounded-lg border border-border bg-surface px-2 py-1 text-xs font-medium text-ink">
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
