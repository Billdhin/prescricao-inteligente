import * as React from "react";
import { Link } from "react-router-dom";
import { Info } from "lucide-react";
import { Card } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { knowledgeNodes, knowledgeCenter } from "../mocks";
import type { KnowledgeNode } from "../types";

/**
 * Mapa das Ciências da Prescrição: composição visual em camadas com o centro
 * "Decisão de prescrição" e três faixas conectadas (fundamentais, aplicadas,
 * perfis/condições). Nós clicáveis, tooltip no hover/foco, e a mesma informação
 * em lista no mobile (não depende só de cor). Preparado para virar grafo radial.
 */

const BANDS: { layer: 1 | 2 | 3; label: string }[] = [
  { layer: 1, label: "Ciências fundamentais" },
  { layer: 2, label: "Ciências aplicadas" },
  { layer: 3, label: "Perfis e condições" },
];

const nodeTone: Record<string, string> = {
  primary: "border-[#1b4b66]/30 bg-primary-tint text-primary hover:border-primary",
  analysis: "border-[#0e7c8a]/30 bg-[#e0f7f9] text-analysis hover:border-analysis",
  success: "border-[#16a34a]/30 bg-[#e7f8ee] text-success hover:border-success",
  cta: "border-[color:var(--cta-text)]/25 bg-[#fff1e6] text-[color:var(--cta-text)] hover:border-[color:var(--cta-text)]",
};

export function KnowledgeMap({ compact = false }: { compact?: boolean }) {
  const [active, setActive] = React.useState<KnowledgeNode | null>(null);

  return (
    <Card className="overflow-hidden p-5 md:p-6">
      {/* Centro */}
      <div className="flex justify-center">
        <div className="rounded-full gradient-brand px-5 py-2.5 text-center text-sm font-bold text-white shadow-elevated">
          {knowledgeCenter.label}
        </div>
      </div>
      <div className="mx-auto h-5 w-px bg-border" aria-hidden />

      {/* Faixas por camada */}
      <div className={cn("space-y-4", compact && "space-y-3")}>
        {BANDS.map((band) => {
          const nodes = knowledgeNodes.filter((n) => n.layer === band.layer);
          return (
            <div key={band.layer}>
              <div className="mb-1.5 text-center text-[11px] font-semibold uppercase tracking-wider text-ink-3">
                {band.label}
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {nodes.map((n) => {
                  const inner = (
                    <>
                      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
                      {n.label}
                    </>
                  );
                  const cls = cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                    nodeTone[n.colorToken],
                    active?.id === n.id && "ring-2 ring-[#1b4b66]/40",
                  );
                  const events = {
                    onMouseEnter: () => setActive(n),
                    onFocus: () => setActive(n),
                    onMouseLeave: () => setActive((cur) => (cur?.id === n.id ? null : cur)),
                    title: n.tooltip,
                  };
                  return n.href ? (
                    <Link key={n.id} to={n.href} className={cls} aria-label={`${n.label}. ${n.tooltip}`} {...events}>
                      {inner}
                    </Link>
                  ) : (
                    <span key={n.id} className={cls} tabIndex={0} {...events}>
                      {inner}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info do nó em foco (não depende só de cor) */}
      <div className="mt-4 flex min-h-[2.5rem] items-start gap-2 rounded-xl bg-surface-soft p-3 text-sm text-ink-2">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink-3" />
        {active ? (
          <span>
            <span className="font-semibold text-ink">{active.label}. </span>
            {active.tooltip}
          </span>
        ) : (
          <span>Passe o mouse ou navegue por teclado sobre uma área para ver como ela se conecta à decisão.</span>
        )}
      </div>
    </Card>
  );
}
