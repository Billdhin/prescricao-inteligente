import * as React from "react";
import { Link } from "react-router-dom";
import { Search, Stethoscope, Clock, Layers } from "lucide-react";
import { Card, Pill, SectionHeader, buttonClasses } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { getLearningRepository } from "../repository";
import { nivelLabel } from "../constants";
import { StatusPill, NivelPill, EmptyState } from "../components/shared";
import { useAprender } from "../store";
import { normalizar } from "../utils";
import type { LearningCase, Nivel, ProgressoStatus } from "../types";

const repo = getLearningRepository();

const complexidadeTone = { baixa: "success", media: "primary", alta: "cta" } as const;
const complexidadeLabel = { baixa: "Complexidade baixa", media: "Complexidade média", alta: "Complexidade alta" } as const;

type Filtro = "todos" | Nivel | ProgressoStatus;

export function Casos() {
  const [busca, setBusca] = React.useState("");
  const [filtro, setFiltro] = React.useState<Filtro>("todos");
  const casesState = useAprender((s) => s.cases);
  const casos = repo.getCases();
  const q = normalizar(busca);

  const nivelFiltro: Nivel | null = filtro === "fundamental" || filtro === "intermediario" || filtro === "avancado" ? filtro : null;
  const statusFiltro: ProgressoStatus | null = filtro === "nao-iniciado" || filtro === "em-andamento" || filtro === "concluido" ? filtro : null;

  const visiveis = casos.filter((c) => {
    const status = casesState[c.id]?.status ?? c.status;
    if (nivelFiltro && c.level !== nivelFiltro) return false;
    if (statusFiltro && status !== statusFiltro) return false;
    if (q && !normalizar(`${c.title} ${c.description} ${c.profile} ${c.conditions.join(" ")} ${c.goals.join(" ")}`).includes(q)) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <SectionHeader
        eyebrow="Aprender"
        icon={<Stethoscope className="h-3 w-3" />}
        title="Casos de prescrição"
        subtitle="Treine a decisão em situações reais, com feedback prudente e o raciocínio por trás de cada escolha."
      />

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por perfil, condição ou objetivo..." aria-label="Buscar caso" className="input pl-9" />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(["todos", "fundamental", "intermediario", "avancado", "em-andamento", "concluido"] as Filtro[]).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            aria-pressed={filtro === f}
            className={cn("rounded-full border px-3 py-1.5 text-sm font-medium transition-colors", filtro === f ? "border-primary bg-primary-tint text-primary" : "border-border text-ink-2 hover:bg-surface-soft")}
          >
            {f === "todos" ? "Todos" : f === "em-andamento" ? "Em andamento" : f === "concluido" ? "Concluídos" : nivelLabel[f as Nivel]}
          </button>
        ))}
      </div>

      {visiveis.length === 0 ? (
        <EmptyState icon={<Search className="h-5 w-5" />} title="Nenhum caso para este filtro" description="Ajuste a busca ou os filtros." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visiveis.map((c) => (
            <CasoCard key={c.id} caso={c} status={casesState[c.id]?.status ?? c.status} />
          ))}
        </div>
      )}
    </div>
  );
}

function CasoCard({ caso, status }: { caso: LearningCase; status: ProgressoStatus }) {
  return (
    <Card className="flex h-full flex-col p-5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <Pill tone={complexidadeTone[caso.complexity]}>{complexidadeLabel[caso.complexity]}</Pill>
        <NivelPill nivel={caso.level} />
      </div>
      <h3 className="font-display font-bold leading-snug text-ink">{caso.title}</h3>
      <p className="mt-1 text-sm text-ink-2">{caso.profile}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {caso.goals.slice(0, 2).map((g) => (
          <Pill key={g} tone="neutral">{g}</Pill>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-3">
        <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {caso.estimatedMinutes} min</span>
        <span className="inline-flex items-center gap-1"><Layers className="h-3.5 w-3.5" /> {caso.disciplines.length} disciplinas</span>
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        <StatusPill status={status} />
        <Link to={`/aprender/casos/${caso.slug}`} className={buttonClasses("primary", "sm")}>
          {status === "concluido" ? "Rever" : status === "em-andamento" ? "Continuar" : "Resolver"}
        </Link>
      </div>
    </Card>
  );
}
