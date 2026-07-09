import { Link } from "react-router-dom";
import { GraduationCap, ArrowRight, Clock, LifeBuoy, PlayCircle } from "lucide-react";
import { Card, Pill, SectionHeader, buttonClasses } from "@/components/ui/primitives";
import { tutorials, type Tutorial } from "@/data/tutorials";

const modoPill: Record<Tutorial["modo"], { label: string; tone: "primary" | "analysis" | "neutral" }> = {
  atender: { label: "Atender", tone: "primary" },
  aprender: { label: "Aprender", tone: "analysis" },
  ambos: { label: "Atender e Aprender", tone: "neutral" },
};

export function Tutorial() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <SectionHeader
        eyebrow="Aprenda a usar"
        icon={<GraduationCap className="h-3 w-3" />}
        title="Tutoriais"
        subtitle="Guias visuais, passo a passo, para dominar as ações principais da plataforma. Cada passo tem um atalho para você fazer na hora."
        right={
          <Link to="/suporte" className={buttonClasses("secondary")}>
            <LifeBuoy className="h-4 w-4" /> Precisa de ajuda?
          </Link>
        }
      />

      {/* Guia em destaque */}
      <Card variant="raised" className="flex flex-col gap-4 border-l-4 border-l-primary p-5 md:flex-row md:items-center md:p-6">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary-tint text-primary">
          <PlayCircle className="h-7 w-7" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl font-bold text-ink">Comece por aqui</h2>
          <p className="mt-1 text-ink-2">
            Se é seu primeiro contato, o guia <span className="font-semibold text-ink">“Prescreva para um aluno”</span> mostra
            o fluxo completo (do cadastro à prescrição em PDF) em poucos minutos.
          </p>
        </div>
        <Link to={`/tutorial/${tutorials[0].slug}`} className={buttonClasses("primary")}>
          Começar <ArrowRight className="h-4 w-4" />
        </Link>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {tutorials.map((t) => {
          const Icon = t.icon;
          const m = modoPill[t.modo];
          return (
            <Link
              key={t.slug}
              to={`/tutorial/${t.slug}`}
              className="group flex flex-col rounded-card border border-border bg-surface p-5 shadow-soft transition-colors hover:bg-surface-soft"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-tint text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-display text-lg font-bold text-ink">{t.titulo}</h3>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-3">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {t.duracao}
                    </span>
                    <span>·</span>
                    <span>{t.steps.length} passos</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5" />
              </div>
              <p className="mt-3 flex-1 text-sm text-ink-2">{t.resumo}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Pill tone={m.tone}>{m.label}</Pill>
                <Pill tone="neutral">{t.nivel}</Pill>
              </div>
            </Link>
          );
        })}
      </div>

      <Card className="flex flex-wrap items-center gap-3 p-4">
        <LifeBuoy className="h-5 w-5 shrink-0 text-primary" />
        <p className="min-w-0 flex-1 text-sm text-ink-2">
          Não encontrou o que procurava? Fale com o suporte, respondemos rápido.
        </p>
        <Link to="/suporte" className={buttonClasses("secondary", "sm")}>
          Ir para o Suporte <ArrowRight className="h-4 w-4" />
        </Link>
      </Card>
    </div>
  );
}
