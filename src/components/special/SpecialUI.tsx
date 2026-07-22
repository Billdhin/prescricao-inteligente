import { useState, type ReactNode } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  ArrowUpCircle,
  ArrowDownCircle,
  Activity,
  Dumbbell,
  ChevronDown,
  Waves,
  X,
  Printer,
  BookOpen,
} from "lucide-react";
import { Card, Pill, buttonClasses } from "@/components/ui/primitives";
import { getModalidade, impactoTone, modalidadeImagem } from "@/data/modalities";
import { getParam, paramCategoriaTone, type MonitoringParameter } from "@/data/monitoringParameters";
import type { JourneyPhase } from "@/data/specialGroups";
import { printFichaParametro } from "@/lib/printFicha";
import { useUser } from "@/lib/store";
import { useDialog } from "@/lib/useDialog";
import { cn, withBase } from "@/lib/utils";

/** Contexto opcional para personalizar fichas imprimíveis (ex.: ficha de adesão). */
export interface ParametroContexto {
  alunoNome?: string;
  objetivo?: string;
}

/* ------------------------- chips de modalidade/parâmetro ------------------- */

export function ModalidadePills({ ids }: { ids: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {ids.map((id) => {
        const m = getModalidade(id);
        if (!m) return null;
        return (
          <Pill key={id} tone="neutral" icon={<Dumbbell className="h-3 w-3" />}>
            {m.nome}
          </Pill>
        );
      })}
    </div>
  );
}

// Cada chip de parâmetro abre o guia de aplicação (como fazer o teste, escala,
// referência e ficha para imprimir) — o chip deixa de ser só um rótulo.
export function ParametroPills({ ids, contexto }: { ids: string[]; contexto?: ParametroContexto }) {
  const [aberto, setAberto] = useState<MonitoringParameter | null>(null);
  return (
    <div className="flex flex-wrap gap-1.5">
      {ids.map((id) => {
        const p = getParam(id);
        if (!p) return null;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setAberto(p)}
            aria-haspopup="dialog"
            aria-label={`Como aplicar: ${p.nome}`}
            title="Ver como aplicar, escala e ficha"
            className="rounded-full transition-transform hover:scale-[1.03] focus-visible:scale-[1.03]"
          >
            <Pill tone={paramCategoriaTone[p.categoria]} icon={<Activity className="h-3 w-3" />}>
              {p.sigla ?? p.nome}
              <BookOpen aria-hidden className="ml-1 inline h-3 w-3 opacity-70" />
            </Pill>
          </button>
        );
      })}
      {aberto && <ParametroDialog param={aberto} contexto={contexto} onClose={() => setAberto(null)} />}
    </div>
  );
}

/* --------------------- guia do parâmetro (como aplicar) -------------------- */

export function ParametroDialog({
  param: p,
  contexto,
  onClose,
}: {
  param: MonitoringParameter;
  contexto?: ParametroContexto;
  onClose: () => void;
}) {
  const dialogRef = useDialog<HTMLDivElement>(onClose);
  // a ficha impressa vai para a mão do aluno: sai com a identidade do profissional
  const { name: profNome, cref, logoDataUrl } = useUser();
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`Como aplicar: ${p.nome}`}
        className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-card bg-surface shadow-elevated outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border p-5 pb-3">
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <Pill tone={paramCategoriaTone[p.categoria]}>{p.categoria}</Pill>
              {p.sigla && <Pill tone="neutral">{p.sigla}</Pill>}
            </div>
            <h3 className="font-display text-lg font-bold text-ink">{p.nome}</h3>
            <p className="mt-0.5 text-sm text-ink-2">{p.resumo}</p>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="rounded-md p-2.5 text-ink-3 hover:bg-surface-soft">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-auto p-5">
          {p.comoAplicar && p.comoAplicar.length > 0 && (
            <section>
              <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-primary">Como aplicar</h4>
              <ol className="space-y-1.5">
                {p.comoAplicar.map((s, i) => (
                  <li key={s} className="flex gap-2.5 text-sm text-ink">
                    <span className="tabular grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary-tint text-[11px] font-bold text-primary">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {p.escala && p.escala.length > 0 && (
            <section>
              <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-primary">Escala de referência</h4>
              {/* Grid de 2 colunas: o valor cola no seu significado. A coluna de valor
                  auto-dimensiona (nao mais w-24 fixo), entao numeros curtos nao abrem
                  vao e significados longos deixam de espremer em 3 linhas. */}
              <div className="grid grid-cols-[auto_1fr] overflow-hidden rounded-xl border border-border text-sm">
                {p.escala.flatMap((e, i) => [
                  <span
                    key={`${e.valor}-v`}
                    className={cn("tabular py-1.5 pl-3 pr-4 font-bold text-primary", i % 2 === 0 && "bg-surface-soft")}
                  >
                    {e.valor}
                  </span>,
                  <span
                    key={`${e.valor}-r`}
                    className={cn("py-1.5 pr-3 text-ink", i % 2 === 0 && "bg-surface-soft")}
                  >
                    {e.rotulo}
                  </span>,
                ])}
              </div>
            </section>
          )}

          <section>
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">Como interpretar</h4>
            <p className="text-sm text-ink-2">{p.comoInterpretar}</p>
          </section>
          <section>
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">Se estiver alterado</h4>
            <p className="text-sm text-ink-2">{p.seAlterado}</p>
          </section>
          <section>
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">Quando é menos confiável</h4>
            <p className="text-sm text-ink-2">{p.menosConfiavel}</p>
          </section>

          {p.referencia && (
            <p className="border-t border-border pt-3 text-xs text-ink-3">Referência: {p.referencia}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border p-4">
          {p.ficha && (
            <button onClick={() => printFichaParametro(p, contexto, { nome: profNome, cref, logoDataUrl: logoDataUrl || undefined })} className={buttonClasses("primary", "sm")}>
              <Printer className="h-4 w-4" />
              {p.ficha === "adesao" ? "Imprimir ficha de adesão" : "Imprimir escala (PDF)"}
            </button>
          )}
          <button onClick={onClose} className={buttonClasses("ghost", "sm")}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ cartão modalidade -------------------------- */

export function ModalidadeCard({ id, cautela }: { id: string; cautela?: boolean }) {
  const m = getModalidade(id);
  if (!m) return null;
  return (
    <Card className={cn("p-4", cautela && "border-warning/40")}>
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <h4 className="font-display font-bold text-ink">{m.nome}</h4>
        <Pill tone={impactoTone[m.impacto]}>impacto {m.impacto}</Pill>
        {cautela && <Pill tone="warning" icon={<AlertTriangle className="h-3 w-3" />}>cautela</Pill>}
      </div>
      <p className="text-sm text-ink-2">{m.resumo}</p>
      <div className="mt-3 space-y-1.5 text-sm">
        <Linha rotulo="Como início" texto={m.quandoInicio} />
        <Linha rotulo="Sem FC confiável" texto={m.monitorarSemFC} />
      </div>
    </Card>
  );
}

function Linha({ rotulo, texto }: { rotulo: string; texto: string }) {
  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-wider text-ink-3">{rotulo}: </span>
      <span className="text-ink-2">{texto}</span>
    </div>
  );
}

/* ------------------- cartão VISUAL de modalidade (foto + selos) ------------- */

export function VisualModalidadeCard({ id, cautela }: { id: string; cautela?: boolean }) {
  const m = getModalidade(id);
  const [open, setOpen] = useState(false);
  const [imgOk, setImgOk] = useState(true);
  if (!m) return null;
  const FallbackIcon = m.ambiente === "aquático" ? Waves : Dumbbell;
  return (
    <Card className={cn("flex flex-col overflow-hidden", cautela && "border-warning/40")}>
      <div className="relative h-40 bg-surface-soft">
        {imgOk ? (
          <img
            src={withBase(modalidadeImagem(m.id))}
            alt=""
            onError={() => setImgOk(false)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-primary-tint to-[#e0f7f9] text-analysis">
            <FallbackIcon className="h-9 w-9" />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <Pill tone={impactoTone[m.impacto]} className="bg-white/90 shadow-soft">
            impacto {m.impacto}
          </Pill>
        </div>
        {cautela && (
          <div className="absolute right-3 top-3">
            <Pill tone="warning" className="bg-white/90 shadow-soft" icon={<AlertTriangle className="h-3 w-3" />}>
              cautela
            </Pill>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <h4 className="font-display font-bold text-ink">{m.nome}</h4>
          <span className="text-xs text-ink-3">· {m.ambiente}</span>
        </div>
        <p className="mt-1 text-sm text-ink-2">{m.resumo}</p>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="mt-3 inline-flex items-center gap-1 self-start text-sm font-semibold text-primary hover:underline"
        >
          {open ? "Ocultar detalhes" : "Ver detalhes"}
          <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
        </button>
        {open && (
          <div className="mt-3 space-y-2 border-t border-border pt-3 text-sm">
            <Linha rotulo="Como início" texto={m.quandoInicio} />
            <Linha rotulo="Como progressão" texto={m.quandoProgressao} />
            <Linha rotulo="Evitar / adaptar" texto={m.quandoEvitar} />
            <Linha rotulo="Sem FC confiável" texto={m.monitorarSemFC} />
            <div className="pt-1">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-3">
                Parâmetros úteis
              </div>
              <ParametroPills ids={m.parametrosUteis} />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

/* ------------------------------ cartão parâmetro --------------------------- */

export function ParametroCard({ id }: { id: string }) {
  const p = getParam(id);
  const [aberto, setAberto] = useState(false);
  if (!p) return null;
  return (
    <Card className="p-4">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <h4 className="font-display font-bold text-ink">{p.nome}</h4>
        <Pill tone={paramCategoriaTone[p.categoria]}>{p.categoria}</Pill>
      </div>
      <p className="text-sm text-ink-2">{p.resumo}</p>
      <div className="mt-3 space-y-1.5 text-sm">
        <Linha rotulo="Quando usar" texto={p.quandoUsar} />
        <Linha rotulo="Menos confiável" texto={p.menosConfiavel} />
        <Linha rotulo="Interpretar" texto={p.comoInterpretar} />
        <Linha rotulo="Se alterado" texto={p.seAlterado} />
      </div>
      {(p.comoAplicar || p.ficha) && (
        <button
          onClick={() => setAberto(true)}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          <BookOpen className="h-4 w-4" /> Como aplicar{p.ficha ? " + ficha para imprimir" : ""}
        </button>
      )}
      {aberto && <ParametroDialog param={p} onClose={() => setAberto(false)} />}
    </Card>
  );
}

/* ------------------------------ sinais de alerta --------------------------- */

export function SafetyFlags({ sinais, aviso }: { sinais: string[]; aviso?: string }) {
  return (
    <Card tone="warning" className="p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#fef4e2] text-warning">
          <ShieldAlert className="h-4 w-4" />
        </span>
        <h3 className="font-display text-lg font-bold text-ink">Sinais de alerta</h3>
      </div>
      <ul className="space-y-1.5">
        {sinais.map((s) => (
          <li key={s} className="flex gap-2 text-sm text-ink">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            {s}
          </li>
        ))}
      </ul>
      {aviso && <p className="mt-3 border-t border-warning/30 pt-3 text-xs text-ink-2">{aviso}</p>}
    </Card>
  );
}

/* ------------------------------ jornada (timeline) ------------------------- */

export function FaseCard({ fase, atual }: { fase: JourneyPhase; atual?: boolean }) {
  const [maisDetalhes, setMaisDetalhes] = useState(false);
  return (
    <Card className={cn("p-5", atual && "border-primary shadow-elevated")}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-bold",
            atual ? "gradient-brand text-white" : "bg-primary-tint text-primary",
          )}
        >
          {fase.numero}
        </span>
        <h4 className="font-display font-bold text-ink">{fase.nome}</h4>
        {atual && <Pill tone="primary">fase atual</Pill>}
      </div>
      <p className="text-sm text-ink-2">{fase.foco}</p>

      <div className="mt-3 space-y-3">
        <Bloco titulo="Objetivo">{fase.objetivo}</Bloco>
        <div>
          <Rotulo>Modalidades prioritárias</Rotulo>
          <ModalidadePills ids={fase.modalidades} />
        </div>
        <div>
          <Rotulo>Parâmetros a monitorar</Rotulo>
          <ParametroPills ids={fase.parametros} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <CriteriosLista titulo="Critérios para avançar" itens={fase.criteriosAvancar} tipo="avancar" />
          <CriteriosLista titulo="Critérios para regredir" itens={fase.criteriosRegredir} tipo="regredir" />
        </div>

        <button
          onClick={() => setMaisDetalhes((v) => !v)}
          aria-expanded={maisDetalhes}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          {maisDetalhes ? "Ocultar estrutura e justificativa" : "Ver estrutura semanal e justificativa"}
          <ChevronDown className={cn("h-4 w-4 transition-transform", maisDetalhes && "rotate-180")} />
        </button>
        {maisDetalhes && (
          <div className="space-y-3 border-t border-border pt-3">
            <Bloco titulo="Exemplo de estrutura semanal">{fase.estruturaSemanal}</Bloco>
            <div className="rounded-xl bg-surface-soft p-3 text-sm text-ink-2">
              <span className="font-semibold text-ink">Por quê: </span>
              {fase.justificativa}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export function JourneyTimeline({ fases, faseAtual }: { fases: JourneyPhase[]; faseAtual?: number }) {
  return (
    <div className="space-y-3">
      {fases.map((f) => (
        <FaseCard key={f.numero} fase={f} atual={f.numero === faseAtual} />
      ))}
    </div>
  );
}

export function CriteriosLista({
  titulo,
  itens,
  tipo,
}: {
  titulo: string;
  itens: string[];
  tipo: "avancar" | "regredir";
}) {
  const Icon = tipo === "avancar" ? ArrowUpCircle : ArrowDownCircle;
  const color = tipo === "avancar" ? "text-success" : "text-[color:var(--cta-text)]";
  return (
    <div className="rounded-xl border border-border p-3">
      <div className={cn("mb-1.5 flex items-center gap-1.5 text-sm font-semibold", color)}>
        <Icon className="h-4 w-4" /> {titulo}
      </div>
      <ul className="space-y-1">
        {itens.map((it) => (
          <li key={it} className="flex gap-2 text-sm text-ink-2">
            <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", tipo === "avancar" ? "bg-success" : "bg-cta")} />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Rotulo({ children }: { children: ReactNode }) {
  return <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-3">{children}</div>;
}

function Bloco({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div>
      <Rotulo>{titulo}</Rotulo>
      <p className="text-sm text-ink">{children}</p>
    </div>
  );
}
