import { Link } from "react-router-dom";
import { Construction } from "lucide-react";
import { Card, buttonClasses, SectionHeader } from "@/components/ui/primitives";

export function ComingSoon({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <SectionHeader title={title} subtitle={subtitle} />
      <Card className="grid place-items-center p-12 text-center">
        <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl gradient-brand text-white">
          <Construction className="h-6 w-6" />
        </span>
        <h2 className="font-display text-xl font-bold text-ink">Em breve</h2>
        <p className="mx-auto mt-2 max-w-md text-ink-2">
          Esta área está em construção. Estamos priorizando o Laboratório Visual, o GPS da
          Prescrição e os Casos práticos nesta versão.
        </p>
        <Link to="/dashboard" className={buttonClasses("secondary") + " mt-5"}>
          Voltar ao dashboard
        </Link>
      </Card>
    </div>
  );
}
