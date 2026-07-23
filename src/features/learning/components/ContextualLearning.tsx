import { Link } from "react-router-dom";
import { GraduationCap, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Ponte Atender → Aprender: card discreto de recomendação contextual, pronto
 * para ser colocado no cadastro do aluno, avaliação, prescrição, grupos, semáforo
 * ou evolução. Não altera o fluxo do Atender; apenas oferece um caminho de estudo
 * relacionado ao que o profissional está fazendo.
 */
export function ContextualLearning({
  title,
  description,
  href,
  cta = "Entender no Aprender",
  className,
}: {
  title: string;
  description: string;
  href: string;
  cta?: string;
  className?: string;
}) {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-start gap-3 rounded-card border border-[#0e7c8a]/30 bg-analysis-tint p-4 transition-colors hover:border-analysis",
        className,
      )}
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-analysis-tint text-analysis">
        <GraduationCap className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold uppercase tracking-wide text-analysis">Aprender</div>
        <div className="font-semibold text-ink">{title}</div>
        <p className="mt-0.5 text-sm text-ink-2">{description}</p>
        <span className="mt-1.5 inline-flex items-center gap-1 text-sm font-semibold text-analysis">
          {cta} <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
