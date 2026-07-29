import * as React from "react";
import { createPortal } from "react-dom";
import { HelpCircle, X, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { buttonClasses, TokenRotulado } from "@/components/ui/primitives";
import { getTermoDose, termoDoRotulo, type TermoDose, type TermoDoseId } from "@/data/termosDose";
import { bibliografia } from "@/data/referencias";
import { useDialog } from "@/lib/useDialog";
import { cn } from "@/lib/utils";

/**
 * O rótulo da dose que explica a si mesmo ("RIR 2" deixa de ser sigla).
 *
 * Mesma forma do MetricaInfo, e pelo mesmo motivo: a dúvida nasce olhando o número,
 * então a resposta mora no número, não num glossário do outro lado do app.
 *
 * O diálogo vai por PORTAL para o document.body. A linha de dose vive dentro de
 * cards que usam backdrop-filter, e backdrop-filter cria containing block para
 * position:fixed: sem o portal, o "fixed inset-0" preencheria o card em vez do
 * viewport. Lição já paga uma vez neste repositório.
 */
export function TermoDoseInfo({
  termo,
  children,
  className,
}: {
  termo: TermoDoseId;
  /** O rótulo a exibir; por padrão, o rótulo do próprio termo. */
  children?: React.ReactNode;
  className?: string;
}) {
  const [aberto, setAberto] = React.useState(false);
  const def = getTermoDose(termo);
  if (!def) return <>{children}</>;

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setAberto(true);
        }}
        className={cn(
          "inline-flex items-center gap-0.5 rounded text-left underline decoration-dotted underline-offset-2 transition-colors hover:decoration-solid",
          className,
        )}
        aria-label={`${def.rotulo} (${def.porExtenso}): o que e e como aplicar`}
      >
        {children ?? def.rotulo}
        <HelpCircle aria-hidden className="h-3 w-3 shrink-0 opacity-70" />
      </button>
      {aberto && <TermoDialog def={def} onClose={() => setAberto(false)} />}
    </>
  );
}

/**
 * Token de dose que explica o próprio rótulo quando ele é um termo do catálogo.
 * Substitui o TokenRotulado nas superfícies do PROFISSIONAL (o app do aluno segue
 * com o token puro: lá o número precisa ser óbvio, não virar aula de sigla).
 */
export function TokenDose({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: React.ReactNode;
  tone?: React.ComponentProps<typeof TokenRotulado>["tone"];
}) {
  const termo = termoDoRotulo(label);
  return (
    <TokenRotulado
      label={label}
      value={value}
      tone={tone}
      rotulo={
        termo ? (
          <TermoDoseInfo termo={termo.id} className="font-medium opacity-70">
            {label}
          </TermoDoseInfo>
        ) : undefined
      }
    />
  );
}

function TermoDialog({ def, onClose }: { def: TermoDose; onClose: () => void }) {
  const ref = useDialog<HTMLDivElement>(onClose);
  const refs = bibliografia(def.refIds);

  return createPortal(
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={def.porExtenso}
        className="max-h-modal w-full max-w-md overflow-auto rounded-card bg-surface p-5 shadow-overlay outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-2xs font-bold uppercase tracking-wider text-analysis">{def.rotulo}</p>
            <h2 className="font-display text-lg font-bold text-ink">{def.porExtenso}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-full p-2.5 text-ink-3 hover:bg-surface-soft"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-2xs font-semibold uppercase tracking-wide text-ink-3">O que é</dt>
            <dd className="mt-0.5 text-ink-2">{def.oQueE}</dd>
          </div>
          <div>
            <dt className="text-2xs font-semibold uppercase tracking-wide text-ink-3">Como aplicar</dt>
            <dd className="mt-0.5 text-ink-2">{def.comoAplicar}</dd>
          </div>
          <div className="rounded-control border border-warning/30 bg-warning-tint p-3">
            <dt className="text-2xs font-semibold uppercase tracking-wide text-warning">
              A confusão comum
            </dt>
            <dd className="mt-0.5 text-ink-2">{def.armadilha}</dd>
          </div>
        </dl>

        {refs.length > 0 && (
          <ul className="mt-3 space-y-0.5 border-t border-border pt-3">
            {refs.map(({ n, ref: r }) => (
              <li key={r.id} className="text-2xs text-ink-3">
                [{n}] {r.autores.split(",")[0]} ({r.ano}), {r.fonte}.{" "}
                {r.doi && (
                  <a
                    href={`https://doi.org/${r.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-primary hover:underline"
                  >
                    doi:{r.doi}
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}

        {def.aula && (
          <Link to={def.aula} onClick={onClose} className={cn(buttonClasses("secondary", "sm"), "mt-4 w-full")}>
            <GraduationCap className="h-4 w-4" /> Aprofundar no Aprender
          </Link>
        )}
      </div>
    </div>,
    document.body,
  );
}
