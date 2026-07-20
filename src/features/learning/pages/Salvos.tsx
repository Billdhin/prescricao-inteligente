import * as React from "react";
import { Link } from "react-router-dom";
import { Bookmark, Trash2, BookOpen, Library as LibIcon, Stethoscope, GraduationCap, Target, Dumbbell } from "lucide-react";
import { Card, Pill, SectionHeader } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { EmptyState } from "../components/shared";
import { useAprender, type BookmarkType } from "../store";
import { useFavorites } from "@/lib/store";
import { exercises } from "@/data/exercises";

const TIPO_META: Record<BookmarkType, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  conteudo: { label: "Conteúdos", icon: BookOpen },
  disciplina: { label: "Disciplinas", icon: GraduationCap },
  caso: { label: "Casos", icon: Stethoscope },
  referencia: { label: "Referências", icon: LibIcon },
  justificativa: { label: "Justificativas", icon: Target },
  comparacao: { label: "Comparações", icon: Target },
};

const ORDEM: BookmarkType[] = ["conteudo", "disciplina", "caso", "referencia", "justificativa", "comparacao"];

export function Salvos() {
  const bookmarks = useAprender((s) => s.bookmarks);
  const applications = useAprender((s) => s.applications);
  const removeBookmark = useAprender((s) => s.removeBookmark);
  // Favoritos de exercício (antes numa tela separada) agora vivem aqui, como
  // mais um tipo de item salvo, para o usuário ter um lugar só de "guardei isso".
  const favSlugs = useFavorites((s) => s.slugs);
  const toggleFav = useFavorites((s) => s.toggle);
  const favExercicios = exercises.filter((e) => favSlugs.includes(e.slug));
  const [filtro, setFiltro] = React.useState<"todos" | BookmarkType | "aplicacoes" | "exercicios">("todos");

  const grupos = ORDEM.map((t) => ({ t, items: bookmarks.filter((b) => b.type === t) })).filter((g) => g.items.length > 0);
  const total = bookmarks.length + applications.length + favExercicios.length;

  const mostrarAplic = filtro === "todos" || filtro === "aplicacoes";
  const mostrarExercicios = filtro === "todos" || filtro === "exercicios";
  const gruposFiltrados = filtro === "todos" ? grupos : filtro === "aplicacoes" || filtro === "exercicios" ? [] : grupos.filter((g) => g.t === filtro);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <SectionHeader
        eyebrow="Aprender"
        icon={<Bookmark className="h-3 w-3" />}
        title="Salvos"
        subtitle="Exercícios, conteúdos, disciplinas, casos, referências e justificativas que você guardou para consultar depois."
      />

      {total === 0 ? (
        <EmptyState
          icon={<Bookmark className="h-5 w-5" />}
          title="Você ainda não salvou nada"
          description="Salve conteúdos, disciplinas, casos e referências para encontrá-los aqui."
          actionLabel="Explorar disciplinas"
          actionHref="/aprender/disciplinas"
        />
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5">
            <Chip ativo={filtro === "todos"} onClick={() => setFiltro("todos")}>Todos</Chip>
            {favExercicios.length > 0 && <Chip ativo={filtro === "exercicios"} onClick={() => setFiltro("exercicios")}>Exercícios</Chip>}
            {grupos.map((g) => (
              <Chip key={g.t} ativo={filtro === g.t} onClick={() => setFiltro(g.t)}>{TIPO_META[g.t].label}</Chip>
            ))}
            {applications.length > 0 && <Chip ativo={filtro === "aplicacoes"} onClick={() => setFiltro("aplicacoes")}>Aplicações no atendimento</Chip>}
          </div>

          {mostrarExercicios && favExercicios.length > 0 && (
            <section>
              <h2 className="mb-2 flex items-center gap-2 font-display text-lg font-bold text-ink">
                <Dumbbell className="h-5 w-5 text-ink-3" /> Exercícios
              </h2>
              <div className="space-y-2">
                {favExercicios.map((e) => (
                  <div key={e.slug} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
                    <Link to={`/movement-lab/${e.slug}`} className="min-w-0 flex-1 font-medium text-ink hover:text-primary">
                      <span className="block truncate">{e.nome}</span>
                    </Link>
                    <button
                      onClick={() => toggleFav(e.slug)}
                      aria-label={`Remover ${e.nome} dos salvos`}
                      className="rounded-md p-2 text-ink-3 hover:bg-surface-soft hover:text-[color:var(--cta-text)]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {gruposFiltrados.map((g) => {
            const Icon = TIPO_META[g.t].icon;
            return (
              <section key={g.t}>
                <h2 className="mb-2 flex items-center gap-2 font-display text-lg font-bold text-ink">
                  <Icon className="h-5 w-5 text-ink-3" /> {TIPO_META[g.t].label}
                </h2>
                <div className="space-y-2">
                  {g.items.map((b) => (
                    <div key={b.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
                      <Link to={b.href} className="min-w-0 flex-1 font-medium text-ink hover:text-primary">
                        <span className="block truncate">{b.title}</span>
                      </Link>
                      <button onClick={() => removeBookmark(b.id)} aria-label="Remover dos salvos" className="rounded-md p-2 text-ink-3 hover:bg-surface-soft hover:text-[color:var(--cta-text)]">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}

          {mostrarAplic && applications.length > 0 && (
            <section>
              <h2 className="mb-2 flex items-center gap-2 font-display text-lg font-bold text-ink">
                <Target className="h-5 w-5 text-ink-3" /> Aplicações no atendimento
              </h2>
              <div className="space-y-2">
                {applications.map((a) => (
                  <Card key={a.id} className="p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill tone="analysis">{a.lessonTitle.length > 48 ? a.lessonTitle.slice(0, 48) + "..." : a.lessonTitle}</Pill>
                      {a.studentName && <Pill tone="neutral">{a.studentName}</Pill>}
                    </div>
                    <p className="mt-2 text-sm text-ink-2">{a.justification}</p>
                    {a.studentId && (
                      <Link to={`/alunos/${a.studentId}`} className="mt-1 inline-block text-xs font-semibold text-primary hover:underline">
                        Abrir perfil do aluno
                      </Link>
                    )}
                  </Card>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function Chip({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={ativo}
      className={cn("rounded-full border px-3 py-1.5 text-sm font-medium transition-colors", ativo ? "border-primary bg-primary-tint text-primary" : "border-border text-ink-2 hover:bg-surface-soft")}
    >
      {children}
    </button>
  );
}
