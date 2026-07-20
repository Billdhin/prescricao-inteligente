import * as React from "react";
import { Search, Library } from "lucide-react";
import { SectionHeader } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { getLearningRepository } from "../repository";
import { MACROAREAS } from "../constants";
import { DisciplineCard, EmptyState } from "../components/shared";
import { EstudarTabs } from "../components/EstudarTabs";
import { disciplineStatFrom } from "../progress";
import { useAprender } from "../store";
import type { Discipline, Macroarea, ProgressoStatus } from "../types";
import { normalizar } from "../utils";

const repo = getLearningRepository();

type Filtro = "todas" | "fundamentais" | "aplicadas" | "integracao" | "nao-iniciado" | "em-andamento" | "concluido" | "recomendadas";

const FILTROS: { id: Filtro; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "fundamentais", label: "Fundamentais" },
  { id: "aplicadas", label: "Aplicadas" },
  { id: "integracao", label: "Integração" },
  { id: "em-andamento", label: "Em andamento" },
  { id: "nao-iniciado", label: "Não iniciadas" },
  { id: "concluido", label: "Concluídas" },
  { id: "recomendadas", label: "Recomendadas" },
];

export function Disciplinas() {
  const [busca, setBusca] = React.useState("");
  const [filtro, setFiltro] = React.useState<Filtro>("todas");
  const disciplines = repo.getDisciplines();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <SectionHeader
        eyebrow="Estudar"
        icon={<Library className="h-3 w-3" />}
        title="Disciplinas"
        subtitle="Construa a base científica que sustenta suas decisões de treinamento."
      />
      <EstudarTabs active="disciplinas" />

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar disciplina, tema ou tag..."
          aria-label="Buscar disciplina"
          className="input pl-9"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFiltro(f.id)}
            aria-pressed={filtro === f.id}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              filtro === f.id ? "border-primary bg-primary-tint text-primary" : "border-border text-ink-2 hover:bg-surface-soft",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <DisciplinasGrid disciplines={disciplines} busca={busca} filtro={filtro} />
    </div>
  );
}

function DisciplinasGrid({ disciplines, busca, filtro }: { disciplines: Discipline[]; busca: string; filtro: Filtro }) {
  const lessons = useAprender((s) => s.lessons);
  const macroFilter: Macroarea | null =
    filtro === "fundamentais" || filtro === "aplicadas" || filtro === "integracao" ? filtro : null;
  const statusFilter: ProgressoStatus | null =
    filtro === "nao-iniciado" || filtro === "em-andamento" || filtro === "concluido" ? filtro : null;
  const q = normalizar(busca);

  const visiveis = disciplines
    .map((d) => ({ d, stat: disciplineStatFrom(d, lessons) }))
    .filter(({ d, stat }) => {
      if (macroFilter && d.category !== macroFilter) return false;
      if (statusFilter && stat.status !== statusFilter) return false;
      if (filtro === "recomendadas" && !d.featured) return false;
      if (q && !normalizar(`${d.title} ${d.description} ${d.tags.join(" ")}`).includes(q)) return false;
      return true;
    });

  if (visiveis.length === 0) {
    return (
      <EmptyState
        icon={<Search className="h-5 w-5" />}
        title="Não encontramos disciplinas para este filtro"
        description="Ajuste a busca ou remova os filtros para ver todas as disciplinas."
      />
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {visiveis.map(({ d, stat }) => (
        <DisciplineCard key={d.id} disc={d} progress={stat.progress} status={stat.status} />
      ))}
    </div>
  );
}
