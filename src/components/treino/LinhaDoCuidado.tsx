import * as React from "react";
import { Link } from "react-router-dom";
import { Check, ArrowRight, AlertTriangle, CheckCircle2, Target } from "lucide-react";
import { Card, buttonClasses } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import type { Aluno } from "@/data/alunos";
import {
  type ProximoPasso,
  type EtapaCiclo,
  type EstadoEtapa,
  ROTULO_ETAPA,
  AJUDA_ETAPA,
} from "@/lib/gps/proximoPasso";

const ORDEM: EtapaCiclo[] = ["avaliar", "planejar", "liberar", "acompanhar", "reavaliar"];

const TINT: Record<ProximoPasso["tone"], string> = {
  primary: "border-primary/25 bg-primary-tint/50",
  cta: "border-[color:var(--cta-text)]/20 bg-[#fff1e6]",
  warning: "border-warning/30 bg-[#fef4e2]",
  success: "border-success/30 bg-[#e7f8ed]",
};

const ICON_TONE: Record<ProximoPasso["tone"], string> = {
  primary: "text-primary",
  cta: "text-[color:var(--cta-text)]",
  warning: "text-warning",
  success: "text-success",
};

function IconePasso({ tone }: { tone: ProximoPasso["tone"] }) {
  const cls = cn("h-5 w-5 shrink-0", ICON_TONE[tone]);
  if (tone === "warning") return <AlertTriangle className={cls} />;
  if (tone === "success") return <CheckCircle2 className={cls} />;
  return <Target className={cls} />;
}

/**
 * A espinha do cuidado: um stepper de cinco nós (avaliar, planejar, liberar,
 * acompanhar, reavaliar) e a faixa "Próximo passo" com a ação primária. Fica no
 * topo da tela do aluno, em qualquer aba, para o profissional nunca perder de
 * vista onde o aluno está e o que fazer a seguir.
 */
export function LinhaDoCuidado({
  aluno,
  passo,
  estado,
  onAvaliar,
  onAcompanhar,
}: {
  aluno: Aluno;
  passo: ProximoPasso;
  estado: Record<EtapaCiclo, EstadoEtapa>;
  onAvaliar: () => void;
  onAcompanhar: () => void;
}) {
  return (
    <Card variant="raised" className="overflow-hidden p-4 md:p-5">
      {/* Stepper do ciclo: rola no mobile, cabe inteiro no desktop */}
      <ol className="flex items-start gap-1 overflow-x-auto pb-1">
        {ORDEM.map((etapa, i) => (
          <li key={etapa} className="flex min-w-0 flex-1 items-start">
            <div className="flex min-w-[4.5rem] flex-col items-center gap-1 text-center">
              <NoCiclo estado={estado[etapa]} />
              <span
                className={cn(
                  "text-[11px] font-semibold leading-tight",
                  estado[etapa] === "atual" ? "text-ink" : estado[etapa] === "feito" ? "text-ink-2" : "text-ink-3",
                )}
                title={AJUDA_ETAPA[etapa]}
              >
                {ROTULO_ETAPA[etapa]}
              </span>
            </div>
            {i < ORDEM.length - 1 && (
              <span
                aria-hidden
                className={cn("mt-3.5 h-0.5 flex-1 rounded-full", estado[etapa] === "feito" ? "bg-success/50" : "bg-border")}
              />
            )}
          </li>
        ))}
      </ol>

      {/* Faixa do próximo passo */}
      <div className={cn("mt-3 flex flex-wrap items-center gap-3 rounded-xl border p-3", TINT[passo.tone])}>
        <IconePasso tone={passo.tone} />
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-3">Próximo passo</div>
          <p className="text-sm font-medium text-ink">{passo.frase}</p>
        </div>
        <CtaPasso aluno={aluno} passo={passo} onAvaliar={onAvaliar} onAcompanhar={onAcompanhar} />
      </div>
    </Card>
  );
}

function NoCiclo({ estado }: { estado: EstadoEtapa }) {
  if (estado === "feito") {
    return (
      <span className="grid h-7 w-7 place-items-center rounded-full bg-success text-white">
        <Check className="h-4 w-4" />
      </span>
    );
  }
  if (estado === "atual") {
    return <span className="grid h-7 w-7 place-items-center rounded-full gradient-brand text-white ring-4 ring-primary-tint" />;
  }
  return <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-border bg-surface" />;
}

function CtaPasso({
  aluno,
  passo,
  onAvaliar,
  onAcompanhar,
}: {
  aluno: Aluno;
  passo: ProximoPasso;
  onAvaliar: () => void;
  onAcompanhar: () => void;
}) {
  const cls = buttonClasses(passo.tone === "success" ? "secondary" : "primary", "sm");
  const label = (
    <>
      {passo.cta.label} <ArrowRight className="h-4 w-4" />
    </>
  );
  switch (passo.cta.kind) {
    case "planejar":
      return (
        <Link to={`/prescrever-treino?aluno=${aluno.id}`} className={cls}>
          {label}
        </Link>
      );
    case "liberar":
      return (
        <Link to={`/semaforo?grupo=${aluno.grupoEspecial ?? "geral"}&aluno=${aluno.id}`} className={cls}>
          {label}
        </Link>
      );
    case "avaliar":
    case "reavaliar":
      return (
        <button onClick={onAvaliar} className={cls}>
          {label}
        </button>
      );
    case "acompanhar":
    default:
      return (
        <button onClick={onAcompanhar} className={cls}>
          {label}
        </button>
      );
  }
}
