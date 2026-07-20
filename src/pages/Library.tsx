import * as React from "react";
import { Link } from "react-router-dom";
import { Library as LibraryIcon, Search, ArrowRight } from "lucide-react";
import { Card, Pill, SectionHeader } from "@/components/ui/primitives";
import { Accordion } from "@/components/ui/disclosure";
import { biblioteca, bibliotecaCategorias } from "@/data/library";
import { ComparadorDefinicoes } from "@/components/library/ComparadorDefinicoes";
import { cn } from "@/lib/utils";

export function Library() {
  const [q, setQ] = React.useState("");
  const [cat, setCat] = React.useState("Todas");

  const termo = q.trim().toLowerCase();
  const filtered = biblioteca.filter(
    (e) =>
      (cat === "Todas" || e.categoria === cat) &&
      (termo === "" ||
        [e.termo, e.definicao, e.resumo, e.detalhe, e.aplicacao ?? "", e.sinonimos ?? "", e.formula ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(termo)),
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <SectionHeader
        eyebrow="Referência"
        icon={<LibraryIcon className="h-3 w-3" />}
        title="Glossário"
        subtitle="Termos técnicos e conceitos-chave de decisão, biomecânica, fisiologia e segurança. Para o estagiário ou profissional relembrar um termo em segundos."
      />

      <Card className="p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar um conceito, termo ou princípio..."
            aria-label="Buscar na biblioteca"
            className="h-11 w-full rounded-control border border-border bg-surface pl-10 pr-4 text-sm outline-none focus-visible:border-primary/50"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {["Todas", ...bibliotecaCategorias].map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                c === cat
                  ? "border-primary bg-primary-tint text-primary"
                  : "border-border text-ink-2 hover:bg-surface-soft",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </Card>

      <ComparadorDefinicoes />

      {filtered.length === 0 ? (
        <Card className="p-10 text-center text-ink-2">Nenhum resultado para “{q}”.</Card>
      ) : (
        <Accordion
          items={filtered.map((e) => ({
            id: e.id,
            title: (
              <span className="flex flex-wrap items-center gap-2">
                {e.termo}
                <Pill tone="neutral">{e.categoria}</Pill>
              </span>
            ),
            content: (
              <div className="space-y-3">
                <p className="border-l-2 border-primary/40 bg-primary-tint/30 py-1.5 pl-3 text-[15px] font-semibold leading-snug text-ink">
                  {e.definicao}
                </p>
                <p className="text-sm text-ink-2">{e.detalhe}</p>
                {e.formula && (
                  <div className="rounded-lg border border-border bg-surface-soft px-3 py-2 text-sm">
                    <span className="text-xs font-semibold uppercase tracking-wide text-ink-3">Fórmula</span>
                    <div className="font-mono text-[13px] text-ink">{e.formula}</div>
                  </div>
                )}
                {e.aplicacao && (
                  <p className="text-sm text-ink-2">
                    <span className="font-semibold text-ink">Na prática. </span>
                    {e.aplicacao}
                  </p>
                )}
                {e.sinonimos && (
                  <p className="text-xs text-ink-3">Também conhecido como: {e.sinonimos}.</p>
                )}
                {e.verExercicio && (
                  <Link
                    to={`/movement-lab/${e.verExercicio}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                  >
                    Ver no Laboratório Visual <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            ),
          }))}
        />
      )}

      <p className="pt-2 text-xs text-ink-3">
        Conteúdo educacional; não substitui avaliação profissional individualizada.
      </p>
    </div>
  );
}
