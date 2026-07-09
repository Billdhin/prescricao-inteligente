import { Link } from "react-router-dom";
import { Route as RouteIcon, ArrowRight, CheckCircle2 } from "lucide-react";
import { Card, Pill, Progress, SectionHeader, buttonClasses } from "@/components/ui/primitives";
import { tracks } from "@/data/tracks";

export function TracksList() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <SectionHeader
        eyebrow="Evolução"
        icon={<RouteIcon className="h-3 w-3" />}
        title="Trilhas"
        subtitle="Sequências guiadas que conectam conceitos, análises no Laboratório e casos práticos."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {tracks.map((t) => {
          const pct = Math.round((t.concluidas / t.lessons.length) * 100);
          const concluida = t.concluidas >= t.lessons.length;
          return (
            <Card key={t.id} className="flex flex-col p-6">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="font-display text-lg font-bold text-ink">{t.nome}</h3>
                <Pill tone={t.nivel === "Iniciante" ? "success" : "warning"}>{t.nivel}</Pill>
              </div>
              <p className="text-sm text-ink-2">{t.descricao}</p>
              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-ink-2">
                    {t.concluidas} de {t.lessons.length} lições
                  </span>
                  <span className="tabular font-semibold text-ink">{pct}%</span>
                </div>
                <Progress value={pct} />
              </div>
              <Link
                to={`/tracks/${t.slug}`}
                className={buttonClasses(concluida ? "secondary" : "primary") + " mt-5"}
              >
                {concluida ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Revisar trilha
                  </>
                ) : t.concluidas > 0 ? (
                  <>
                    Continuar <ArrowRight className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Começar <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Link>
            </Card>
          );
        })}
      </div>

      <p className="pt-2 text-xs text-ink-3">
        Conteúdo educacional; não substitui avaliação profissional individualizada.
      </p>
    </div>
  );
}
