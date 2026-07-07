import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Clock, LifeBuoy, CheckCircle2 } from "lucide-react";
import { Card, Pill, buttonClasses } from "@/components/ui/primitives";
import { TutorialScene } from "@/components/tutorial/TutorialScene";
import { tutorials, getTutorial } from "@/data/tutorials";
import { cn } from "@/lib/utils";

export function TutorialDetail() {
  const { slug = "" } = useParams();
  const t = getTutorial(slug);

  if (!t) {
    return (
      <div className="mx-auto max-w-3xl py-16 text-center">
        <p className="text-ink-2">Tutorial não encontrado.</p>
        <Link to="/tutorial" className={cn(buttonClasses("secondary"), "mt-4")}>
          Ver tutoriais
        </Link>
      </div>
    );
  }

  const Icon = t.icon;
  const idx = tutorials.findIndex((x) => x.slug === t.slug);
  const proximo = tutorials[(idx + 1) % tutorials.length];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/tutorial" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-2 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Tutoriais
      </Link>

      {/* Cabeçalho */}
      <div className="flex flex-wrap items-start gap-4">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary-tint text-primary">
          <Icon className="h-7 w-7" />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">{t.titulo}</h1>
          <p className="mt-1 text-ink-2">{t.resumo}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Pill tone="neutral" icon={<Clock className="h-3 w-3" />}>{t.duracao}</Pill>
            <Pill tone="neutral">{t.steps.length} passos</Pill>
            <Pill tone="neutral">{t.nivel}</Pill>
          </div>
        </div>
      </div>

      {/* Passos */}
      <ol className="space-y-4">
        {t.steps.map((s, i) => (
          <li key={i}>
            <Card className="overflow-hidden p-5 md:p-6">
              <div className="flex items-start gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full gradient-brand text-sm font-bold text-white">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-lg font-bold text-ink">{s.titulo}</h2>
                  <p className="mt-1 text-sm text-ink-2">{s.descricao}</p>
                </div>
              </div>

              {/* Ilustração do passo */}
              <div className="mt-4 rounded-xl border border-border bg-surface-soft p-3 sm:p-4">
                <div className="mx-auto max-w-md">
                  <TutorialScene id={s.scene} navLabel={s.navLabel} label={`Passo ${i + 1}: ${s.titulo}`} />
                </div>
              </div>

              {s.cta && (
                <div className="mt-4">
                  <Link to={s.cta.to} className={buttonClasses("primary", "sm")}>
                    {s.cta.label} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </Card>
          </li>
        ))}
      </ol>

      {/* Conclusão */}
      <Card tone="success" className="flex flex-wrap items-center gap-3 p-5">
        <CheckCircle2 className="h-6 w-6 shrink-0 text-success" />
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-ink">Pronto! Você já sabe {t.titulo.toLowerCase()}.</div>
          <p className="text-sm text-ink-2">Continue com o próximo guia ou volte para a lista.</p>
        </div>
        <Link to={`/tutorial/${proximo.slug}`} className={cn(buttonClasses("primary", "sm"), "shrink-0")}>
          Próximo: {proximo.titulo} <ArrowRight className="h-4 w-4" />
        </Link>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Link to="/tutorial" className={buttonClasses("secondary", "sm")}>
          <ArrowLeft className="h-4 w-4" /> Todos os tutoriais
        </Link>
        <Link to="/suporte" className={buttonClasses("secondary", "sm")}>
          <LifeBuoy className="h-4 w-4" /> Falar com o suporte
        </Link>
      </div>

      <p className="pt-2 text-xs text-ink-3">
        Conteúdo educacional e de apoio à decisão — não substitui avaliação profissional
        individualizada nem prescrição clínica.
      </p>
    </div>
  );
}
