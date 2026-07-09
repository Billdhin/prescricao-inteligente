import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Lock, SlidersHorizontal, Sparkles, FlaskConical, GitCompare } from "lucide-react";
import { Card, Pill, SectionHeader, buttonClasses } from "@/components/ui/primitives";
import { MuscleThumb, activationFromExercise } from "@/components/anatomy/MuscleMap";
import { exercises } from "@/data/exercises";
import { useUser, isPremiumUnlocked } from "@/lib/store";
import { cn, withBase } from "@/lib/utils";

const ALL = "Todos";

function uniq(list: string[]) {
  return Array.from(new Set(list));
}

export function MovementLabList() {
  const plan = useUser((s) => s.plan);
  const unlocked = isPremiumUnlocked(plan);

  const [grupo, setGrupo] = React.useState(ALL);
  const [equip, setEquip] = React.useState(ALL);
  const [objetivo, setObjetivo] = React.useState(ALL);
  const [nivel, setNivel] = React.useState(ALL);

  const grupos = uniq(exercises.map((e) => e.grupoMuscular));
  const equipamentos = uniq(exercises.map((e) => e.equipamento));
  const objetivos = uniq(exercises.flatMap((e) => e.objetivo));
  const niveis = ["Iniciante", "Intermediário", "Avançado"];

  const filtered = exercises.filter(
    (e) =>
      (grupo === ALL || e.grupoMuscular === grupo) &&
      (equip === ALL || e.equipamento === equip) &&
      (objetivo === ALL || e.objetivo.includes(objetivo)) &&
      (nivel === ALL || e.nivel === nivel),
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <SectionHeader
        eyebrow="Vitrine do produto"
        icon={<FlaskConical className="h-3 w-3" />}
        title="Laboratório Visual"
        subtitle="Compare a execução do movimento com uma análise biomecânica lado a lado. Explore hotspots interativos para aprofundar da observação prática à evidência."
        right={
          <Link to="/comparador" className={buttonClasses("secondary")}>
            <GitCompare className="h-4 w-4" /> Comparador
          </Link>
        }
      />

      {/* Filtros */}
      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
          <SlidersHorizontal className="h-4 w-4 text-ink-2" /> Filtros
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Filter label="Grupo muscular" value={grupo} onChange={setGrupo} options={grupos} />
          <Filter label="Equipamento" value={equip} onChange={setEquip} options={equipamentos} />
          <Filter label="Objetivo" value={objetivo} onChange={setObjetivo} options={objetivos} />
          <Filter label="Nível" value={nivel} onChange={setNivel} options={niveis} />
        </div>
      </Card>

      {/* Grid */}
      {filtered.length === 0 ? (
        <Card className="p-10 text-center text-ink-2">
          Nenhum exercício encontrado com esses filtros.
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((e) => {
            const locked = e.premium && !unlocked;
            return (
              <Card key={e.slug} className="flex flex-col overflow-hidden">
                <div className="relative h-44 border-b border-border bg-surface-soft">
                  {e.imagem ? (
                    <img src={withBase(e.imagem)} alt={`Execução: ${e.nome}`} className="h-full w-full object-cover" />
                  ) : (
                    <MuscleThumb activation={activationFromExercise(e)} slug={e.slug} className="py-2" />
                  )}
                  <div className="absolute left-3 top-3">
                    {e.premium ? (
                      <Pill tone="cta" icon={<Sparkles className="h-3 w-3" />}>
                        Premium
                      </Pill>
                    ) : (
                      <Pill tone="success">Gratuito</Pill>
                    )}
                  </div>
                  <div className="absolute right-3 top-3">
                    <Pill tone="neutral" className="bg-white/85">
                      {e.nivel}
                    </Pill>
                  </div>
                  {locked && (
                    <div className="absolute inset-0 grid place-items-center bg-white/50 backdrop-blur-[1px]">
                      <span className="grid h-9 w-9 place-items-center rounded-full gradient-brand text-white shadow-elevated">
                        <Lock className="h-4 w-4" />
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-lg font-bold text-ink">{e.nome}</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Pill tone="primary">{e.grupoMuscular}</Pill>
                    <Pill tone="neutral">{e.equipamento}</Pill>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-ink-2">{e.resumoPratico}</p>
                  <Link
                    to={`/movement-lab/${e.slug}`}
                    className={cn(
                      "mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-control font-semibold text-white",
                      "gradient-brand hover:opacity-95",
                    )}
                  >
                    Analisar movimento <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <p className="pt-2 text-xs text-ink-3">
        Conteúdo educacional — não substitui avaliação profissional individualizada.
      </p>
    </div>
  );
}

function Filter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-ink-3">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-control border border-border bg-surface px-3 text-sm text-ink outline-none focus-visible:border-primary/50"
      >
        <option value={ALL}>Todos</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
