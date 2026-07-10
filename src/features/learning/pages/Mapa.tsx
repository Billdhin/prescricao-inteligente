import * as React from "react";
import { Link } from "react-router-dom";
import { Network, ArrowRight } from "lucide-react";
import { Card, Pill, SectionHeader } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { getLearningRepository } from "../repository";
import { MACROAREAS } from "../constants";
import { KnowledgeMap } from "../components/KnowledgeMap";
import { DisciplineCard } from "../components/shared";
import { disciplineStatFrom } from "../progress";
import { useAprender } from "../store";
import type { Macroarea, ProgressoStatus } from "../types";
import { iconByName } from "../icons";

const repo = getLearningRepository();

type Filtro = "todas" | Macroarea | ProgressoStatus;

export function MapaConhecimento() {
  const [filtro, setFiltro] = React.useState<Filtro>("todas");
  const lessons = useAprender((s) => s.lessons);
  const disciplines = repo.getDisciplines();
  const statusFiltro: ProgressoStatus | null =
    filtro === "em-andamento" || filtro === "nao-iniciado" || filtro === "concluido" ? filtro : null;

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <SectionHeader
        eyebrow="Aprender"
        icon={<Network className="h-3 w-3" />}
        title="Mapa do conhecimento"
        subtitle="Explore como as ciências se conectam a uma decisão de prescrição e encontre por onde começar."
      />

      <KnowledgeMap />

      {/* Filtros */}
      <div className="flex flex-wrap gap-1.5">
        <FiltroChip ativo={filtro === "todas"} onClick={() => setFiltro("todas")}>Todas</FiltroChip>
        {MACROAREAS.map((m) => (
          <FiltroChip key={m.id} ativo={filtro === m.id} onClick={() => setFiltro(m.id)}>{m.short}</FiltroChip>
        ))}
        <span className="mx-1 w-px self-stretch bg-border" aria-hidden />
        <FiltroChip ativo={filtro === "em-andamento"} onClick={() => setFiltro("em-andamento")}>Em andamento</FiltroChip>
        <FiltroChip ativo={filtro === "nao-iniciado"} onClick={() => setFiltro("nao-iniciado")}>Não iniciado</FiltroChip>
        <FiltroChip ativo={filtro === "concluido"} onClick={() => setFiltro("concluido")}>Concluído</FiltroChip>
      </div>

      {/* Macroáreas com disciplinas */}
      {MACROAREAS.map((macro) => {
        const doGrupo = disciplines.filter((d) => d.category === macro.id);
        if (filtro !== "todas" && filtro !== macro.id && (filtro === "fundamentais" || filtro === "aplicadas" || filtro === "integracao")) {
          return null;
        }
        const Icon = iconByName(macro.icon);
        const comStat = doGrupo
          .map((d) => ({ d, stat: disciplineStatFrom(d, lessons) }))
          .filter(({ stat }) => !statusFiltro || stat.status === statusFiltro);
        if (comStat.length === 0) return null;
        return (
          <section key={macro.id}>
            <div className="mb-3 flex items-center gap-2">
              <span className={cn("grid h-9 w-9 place-items-center rounded-xl", macro.colorToken === "primary" ? "bg-primary-tint text-primary" : macro.colorToken === "analysis" ? "bg-[#e0f7f9] text-analysis" : "bg-[#fff1e6] text-[color:var(--cta-text)]")}>
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-xl font-bold text-ink">{macro.label}</h2>
                <p className="text-sm text-ink-2">{macro.description}</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {comStat.map(({ d, stat }) => (
                <DisciplineCard key={d.id} disc={d} progress={stat.progress} status={stat.status} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function FiltroChip({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={ativo}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        ativo ? "border-primary bg-primary-tint text-primary" : "border-border text-ink-2 hover:bg-surface-soft",
      )}
    >
      {children}
    </button>
  );
}

/** Painel lateral usado na home/atalhos: destaque de "começar por aqui". */
export function ComecarPorAqui() {
  const disc = repo.getDiscipline("biomecanica-do-treinamento");
  if (!disc) return null;
  return (
    <Card tone="primary" className="p-5">
      <Pill tone="primary">Começar por aqui</Pill>
      <h3 className="mt-2 font-display text-lg font-bold text-ink">{disc.title}</h3>
      <p className="mt-1 text-sm text-ink-2">{disc.description}</p>
      <Link to={`/aprender/disciplinas/${disc.slug}`} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
        Abrir disciplina <ArrowRight className="h-4 w-4" />
      </Link>
    </Card>
  );
}
