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
} from "lucide-react";
import { Card, Pill } from "@/components/ui/primitives";
import { getModalidade, impactoTone, modalidadeImagem } from "@/data/modalities";
import { getParam, paramCategoriaTone } from "@/data/monitoringParameters";
import type { JourneyPhase } from "@/data/specialGroups";
import { cn, withBase } from "@/lib/utils";

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

export function ParametroPills({ ids }: { ids: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {ids.map((id) => {
        const p = getParam(id);
        if (!p) return null;
        return (
          <Pill key={id} tone={paramCategoriaTone[p.categoria]} icon={<Activity className="h-3 w-3" />}>
            {p.sigla ?? p.nome}
          </Pill>
        );
      })}
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
            alt={m.nome}
            onError={() => setImgOk(false)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-primary-tint to-[#e0f7f9] text-analysis">
            <FallbackIcon className="h-9 w-9" />
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <Pill tone={impactoTone[m.impacto]} className="bg-white/85 shadow-soft">
            impacto {m.impacto}
          </Pill>
          <Pill tone="neutral" className="bg-white/85 shadow-soft">
            {m.ambiente}
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
        <h4 className="font-display font-bold text-ink">{m.nome}</h4>
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
    </Card>
  );
}

/* ------------------------------ sinais de alerta --------------------------- */

export function SafetyFlags({ sinais, aviso }: { sinais: string[]; aviso?: string }) {
  return (
    <Card className="border-warning/40 bg-[#fef4e2]/40 p-5">
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
        <Bloco titulo="Exemplo de estrutura semanal">{fase.estruturaSemanal}</Bloco>
        <div className="rounded-xl bg-surface-soft p-3 text-sm text-ink-2">
          <span className="font-semibold text-ink">Por quê: </span>
          {fase.justificativa}
        </div>
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
  const color = tipo === "avancar" ? "text-success" : "text-cta";
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
