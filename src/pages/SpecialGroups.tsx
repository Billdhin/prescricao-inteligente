import { Link } from "react-router-dom";
import { HeartPulse, ArrowRight, Lock, Crown } from "lucide-react";
import { Card, Pill, SectionHeader } from "@/components/ui/primitives";
import { ModalidadePills, ParametroPills } from "@/components/special/SpecialUI";
import { specialGroups, complexidadeTone, AVISO_SEGURANCA } from "@/data/specialGroups";
import { useUser, isPremiumUnlocked } from "@/lib/store";
import { cn } from "@/lib/utils";

export function SpecialGroups() {
  const plan = useUser((s) => s.plan);
  const unlocked = isPremiumUnlocked(plan);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <SectionHeader
        eyebrow="Jornadas de Prescrição"
        icon={<HeartPulse className="h-3 w-3" />}
        title="Grupos Especiais"
        subtitle="Como conduzir diferentes perfis de alunos (por modalidades, parâmetros e fases) de forma segura, progressiva e justificada."
      />

      <div className="flex items-start gap-2 rounded-xl border border-border bg-surface-soft px-3 py-2 text-xs text-ink-2">
        <span className="mt-0.5">ℹ️</span>
        {AVISO_SEGURANCA}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {specialGroups.map((g) => {
          const locked = g.premium && !unlocked;
          return (
            <Card key={g.slug} className="flex flex-col p-5">
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="font-display text-lg font-bold text-ink">{g.nome}</h3>
                {g.premium ? (
                  <Pill tone="cta" icon={<Crown className="h-3 w-3" />}>
                    Premium
                  </Pill>
                ) : (
                  <Pill tone="success">Gratuito</Pill>
                )}
              </div>
              <p className="text-sm text-ink-2">{g.descricaoCurta}</p>

              <div className="mt-3 space-y-2.5">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-3">Objetivo principal</span>
                  <p className="text-sm text-ink">{g.objetivos[0]}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone={complexidadeTone[g.complexidade]}>Complexidade {g.complexidade}</Pill>
                </div>
                <div>
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-3">
                    Modalidades recomendadas
                  </span>
                  <ModalidadePills ids={g.modalidadesIndicadas.slice(0, 3)} />
                </div>
                <div>
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-3">
                    Parâmetros de monitoramento
                  </span>
                  <ParametroPills ids={g.parametros.slice(0, 4)} />
                </div>
              </div>

              <Link
                to={`/special-groups/${g.slug}`}
                className={cn(
                  "mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-control font-semibold text-white",
                  "gradient-brand hover:opacity-95",
                )}
              >
                {locked && <Lock className="h-4 w-4" />}
                Abrir jornada <ArrowRight className="h-4 w-4" />
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
