import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { Card } from "@/components/ui/primitives";

/**
 * Cartão de bloqueio padrão (gradiente da marca + cadeado + CTA de assinatura).
 * Reutilizado onde um recurso é do plano Profissional (casos, jornadas de grupo, etc.).
 */
export function PaywallCard({
  titulo,
  descricao,
  cta = "Assinar Profissional",
  to = "/pricing",
  className,
}: {
  titulo: string;
  descricao: string;
  cta?: string;
  to?: string;
  className?: string;
}) {
  return (
    <Card className={className ? `overflow-hidden ${className}` : "overflow-hidden"}>
      <div className="gradient-brand p-8 text-center text-white">
        <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-card bg-surface/15">
          <Lock className="h-6 w-6" />
        </span>
        <h2 className="font-display text-2xl font-bold">{titulo}</h2>
        <p className="mx-auto mt-2 max-w-md text-white/85">{descricao}</p>
        <Link
          to={to}
          className="mt-5 inline-flex rounded-control bg-surface px-5 py-2.5 font-semibold text-primary hover:bg-surface/90"
        >
          {cta}
        </Link>
      </div>
    </Card>
  );
}
