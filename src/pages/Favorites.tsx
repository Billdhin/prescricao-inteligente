import { Link } from "react-router-dom";
import { Star, ArrowRight, FlaskConical } from "lucide-react";
import { Card, Pill, SectionHeader, buttonClasses } from "@/components/ui/primitives";
import { useFavorites } from "@/lib/store";
import { exercises } from "@/data/exercises";

export function Favorites() {
  const slugs = useFavorites((s) => s.slugs);
  const favs = exercises.filter((e) => slugs.includes(e.slug));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <SectionHeader
        eyebrow="Referências salvas"
        icon={<Star className="h-3 w-3" />}
        title="Exercícios favoritos"
        subtitle="Seus exercícios de referência para consulta rápida."
      />

      {favs.length === 0 ? (
        <Card className="grid place-items-center p-12 text-center">
          <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary-tint text-primary">
            <Star className="h-6 w-6" />
          </span>
          <h2 className="font-display text-xl font-bold text-ink">Nada favoritado ainda</h2>
          <p className="mx-auto mt-2 max-w-md text-ink-2">
            Toque no coração dentro do Laboratório Visual para salvar exercícios de referência.
          </p>
          <Link to="/movement-lab" className={buttonClasses("secondary") + " mt-5"}>
            <FlaskConical className="h-4 w-4" /> Ir para o Laboratório
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {favs.map((e) => (
            <Card key={e.slug} className="flex flex-col p-5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="font-display text-lg font-bold text-ink">{e.nome}</h3>
                {e.premium ? <Pill tone="cta">Premium</Pill> : <Pill tone="success">Gratuito</Pill>}
              </div>
              <div className="mb-3 flex flex-wrap gap-1.5">
                <Pill tone="primary">{e.grupoMuscular}</Pill>
                <Pill tone="neutral">{e.equipamento}</Pill>
              </div>
              <Link
                to={`/movement-lab/${e.slug}`}
                className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                Abrir análise <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
