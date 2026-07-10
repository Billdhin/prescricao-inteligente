import * as React from "react";
import { Search, Library, Unlock, ExternalLink, Bookmark, BookmarkCheck } from "lucide-react";
import { Card, Pill, SectionHeader } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { getLearningRepository } from "../repository";
import { referenceSourceLabel } from "../constants";
import { EmptyState } from "../components/shared";
import { useAprender } from "../store";
import { normalizar } from "../utils";
import type { ScientificReference } from "../types";

const repo = getLearningRepository();

type Filtro = "todas" | "aberto" | "validadas" | "a-validar" | "salvas";

export function Biblioteca() {
  const [busca, setBusca] = React.useState("");
  const [filtro, setFiltro] = React.useState<Filtro>("todas");
  const refs = repo.getReferences();
  const bookmarks = useAprender((s) => s.bookmarks);
  const q = normalizar(busca);

  const savedIds = new Set(bookmarks.filter((b) => b.type === "referencia").map((b) => b.targetId));

  const visiveis = refs.filter((r) => {
    if (filtro === "aberto" && !r.openAccess) return false;
    if (filtro === "validadas" && r.validationStatus !== "validada") return false;
    if (filtro === "a-validar" && r.validationStatus !== "a-validar") return false;
    if (filtro === "salvas" && !savedIds.has(r.id)) return false;
    if (q && !normalizar(`${r.title} ${r.authors} ${r.topics.join(" ")} ${r.abstractSummary}`).includes(q)) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <SectionHeader
        eyebrow="Aprender"
        icon={<Library className="h-3 w-3" />}
        title="Biblioteca científica"
        subtitle="Referências organizadas por tema, tipo de evidência e acesso. As marcadas 'a validar' são placeholders editoriais."
      />

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por título, autor ou tema..." aria-label="Buscar referência" className="input pl-9" />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(["todas", "aberto", "validadas", "a-validar", "salvas"] as Filtro[]).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            aria-pressed={filtro === f}
            className={cn("rounded-full border px-3 py-1.5 text-sm font-medium transition-colors", filtro === f ? "border-primary bg-primary-tint text-primary" : "border-border text-ink-2 hover:bg-surface-soft")}
          >
            {f === "todas" ? "Todas" : f === "aberto" ? "Acesso aberto" : f === "validadas" ? "Validadas" : f === "a-validar" ? "A validar" : "Salvas"}
          </button>
        ))}
      </div>

      {visiveis.length === 0 ? (
        <EmptyState icon={<Library className="h-5 w-5" />} title="Nenhuma referência para este filtro" description="Ajuste a busca ou os filtros." />
      ) : (
        <div className="space-y-3">
          {visiveis.map((r) => (
            <ReferenceCard key={r.id} r={r} saved={savedIds.has(r.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReferenceCard({ r, saved }: { r: ScientificReference; saved: boolean }) {
  const toggle = useAprender((s) => s.toggleBookmark);
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <Pill tone="neutral">{referenceSourceLabel[r.sourceType]}</Pill>
            {r.year > 0 && <Pill tone="neutral">{r.year}</Pill>}
            {r.openAccess && <Pill tone="success" icon={<Unlock className="h-3 w-3" />}>Acesso aberto</Pill>}
            {r.validationStatus === "a-validar" && <Pill tone="warning">A validar (editorial)</Pill>}
          </div>
          <h3 className="mt-1.5 font-semibold text-ink">
            {r.validationStatus === "a-validar" ? "Referência a ser validada pela equipe editorial" : r.title}
          </h3>
          {r.validationStatus === "validada" && <div className="text-sm text-ink-2">{r.authors}</div>}
          <p className="mt-1 text-sm text-ink-2">{r.abstractSummary}</p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {r.topics.map((t) => (
              <span key={t} className="rounded-full bg-surface-soft px-2 py-0.5 text-xs text-ink-3">{t}</span>
            ))}
          </div>
          {r.usedIn && r.usedIn.length > 0 && (
            <div className="mt-1.5 text-xs text-ink-3">Usada em: {r.usedIn.join(" · ")}</div>
          )}
        </div>
        <button
          onClick={() => toggle({ type: "referencia", targetId: r.id, title: r.validationStatus === "a-validar" ? "Referência a validar" : r.title, href: "/aprender/biblioteca" })}
          aria-label={saved ? "Remover dos salvos" : "Salvar referência"}
          aria-pressed={saved}
          className={cn("shrink-0 rounded-full p-2", saved ? "text-primary" : "text-ink-3 hover:bg-surface-soft hover:text-ink")}
        >
          {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        </button>
      </div>
      {r.validationStatus === "a-validar" ? (
        <div className="mt-2 text-xs italic text-ink-3">Link e DOI serão adicionados pela equipe editorial (sem inventar dados).</div>
      ) : (
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-ink-3">
          <span className="inline-flex items-center gap-1"><ExternalLink className="h-3 w-3" /> DOI e PubMed a vincular pela equipe editorial</span>
        </div>
      )}
    </Card>
  );
}
