import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  BookOpen,
  FlaskConical,
  Lightbulb,
} from "lucide-react";
import { Card, Pill, Progress, SectionHeader, buttonClasses, type PillTone } from "@/components/ui/primitives";
import { getTrack } from "@/data/tracks";
import type { Lesson, LessonTipo } from "@/data/types";
import { cn } from "@/lib/utils";

const tipoInfo: Record<LessonTipo, { label: string; tone: PillTone; icon: React.ReactNode }> = {
  conceito: { label: "Conceito", tone: "neutral", icon: <Lightbulb className="h-4 w-4" /> },
  lab: { label: "Laboratório", tone: "primary", icon: <FlaskConical className="h-4 w-4" /> },
  caso: { label: "Caso", tone: "analysis", icon: <BookOpen className="h-4 w-4" /> },
};

function lessonHref(l: Lesson): string | null {
  if (l.tipo === "lab" && l.ref) return `/movement-lab/${l.ref}`;
  if (l.tipo === "caso" && l.ref) return `/aprender/casos/${l.ref}`;
  return null;
}

export function TrackDetail() {
  const { slug = "" } = useParams();
  const track = getTrack(slug);

  if (!track) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card className="p-10 text-center">
          <h1 className="font-display text-2xl font-bold text-ink">Trilha não encontrada</h1>
          <Link to="/tracks" className={buttonClasses("secondary") + " mt-4"}>
            Voltar às trilhas
          </Link>
        </Card>
      </div>
    );
  }

  const pct = Math.round((track.concluidas / track.lessons.length) * 100);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link to="/tracks" className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-ink-2 hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Voltar às trilhas
        </Link>
        <SectionHeader
          title={track.nome}
          subtitle={track.descricao}
          right={<Pill tone={track.nivel === "Iniciante" ? "success" : "warning"}>{track.nivel}</Pill>}
        />
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-ink-2">
              {track.concluidas} de {track.lessons.length} lições concluídas
            </span>
            <span className="tabular font-semibold text-ink">{pct}%</span>
          </div>
          <Progress value={pct} />
        </div>
      </div>

      <ol className="space-y-2">
        {track.lessons.map((l, i) => {
          const done = i < track.concluidas;
          const isNext = i === track.concluidas;
          const href = lessonHref(l);
          const info = tipoInfo[l.tipo];
          const inner = (
            <div
              className={cn(
                "flex items-center gap-3 rounded-card border p-4 transition-colors",
                done
                  ? "border-border bg-surface"
                  : isNext
                    ? "border-primary bg-primary-tint"
                    : "border-border bg-surface",
                href && "hover:bg-surface-soft",
              )}
            >
              <span
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold",
                  done ? "bg-success text-white" : isNext ? "bg-primary text-white" : "bg-surface-soft text-ink-2",
                )}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-ink">{l.titulo}</div>
                <div className="mt-1 flex items-center gap-2">
                  <Pill tone={info.tone}>{info.label}</Pill>
                  <span className="text-xs text-ink-3">{l.duracao}</span>
                </div>
              </div>
              {href && <ArrowRight className="h-4 w-4 shrink-0 text-ink-3" />}
            </div>
          );
          return (
            <li key={l.id}>
              {href ? (
                <Link to={href}>{inner}</Link>
              ) : (
                inner
              )}
            </li>
          );
        })}
      </ol>

      <p className="pt-2 text-xs text-ink-3">
        Conteúdo educacional; não substitui avaliação profissional individualizada.
      </p>
    </div>
  );
}
