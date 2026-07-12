import * as React from "react";
import { Link } from "react-router-dom";
import { Bookmark, BookmarkCheck, Clock, Layers, Stethoscope, CircleDot, CheckCircle2, Circle } from "lucide-react";
import { Card, Pill, Progress, buttonClasses } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { iconByName } from "../icons";
import { nivelLabel, macroareaLabel, lessonTypeMeta } from "../constants";
import { useAprender, type BookmarkType } from "../store";
import type { Discipline, Module, Lesson, ProgressoStatus, Nivel, LearningRecommendation, StudyObjective, Competency } from "../types";

/* ------------------------------ átomos visuais ------------------------------ */

export const tokenTile: Record<string, string> = {
  primary: "bg-primary-tint text-primary",
  analysis: "bg-[#e0f7f9] text-analysis",
  success: "bg-[#e7f8ee] text-success",
  cta: "bg-[#fff1e6] text-[color:var(--cta-text)]",
};

/** Duração da disciplina a partir da duração real derivada (minutos), com
 *  fallback para as horas de catálogo. Mostra minutos abaixo de 1 h. */
export function disciplineDurationLabel(d: { estimatedMinutes?: number; estimatedHours: number }): string {
  const min = d.estimatedMinutes ?? d.estimatedHours * 60;
  if (min <= 0) return "";
  if (min < 60) return `${Math.max(1, Math.round(min))} min`;
  const h = min / 60;
  return `${h % 1 === 0 ? h : h.toFixed(1)} h`;
}

export function StatusPill({ status }: { status: ProgressoStatus }) {
  if (status === "concluido")
    return <Pill tone="success" icon={<CheckCircle2 className="h-3 w-3" />}>Concluído</Pill>;
  if (status === "em-andamento")
    return <Pill tone="primary" icon={<CircleDot className="h-3 w-3" />}>Em andamento</Pill>;
  return <Pill tone="neutral" icon={<Circle className="h-3 w-3" />}>Não iniciado</Pill>;
}

export function NivelPill({ nivel }: { nivel: Nivel }) {
  const tone = nivel === "fundamental" ? "analysis" : nivel === "intermediario" ? "primary" : "cta";
  return <Pill tone={tone}>{nivelLabel[nivel]}</Pill>;
}

export function MetaItem({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-ink-3">
      {icon}
      {children}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}) {
  return (
    <Card className="flex flex-col items-center gap-2 p-8 text-center">
      {icon && <span className="grid h-11 w-11 place-items-center rounded-full bg-surface-soft text-ink-3">{icon}</span>}
      <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
      {description && <p className="max-w-sm text-sm text-ink-2">{description}</p>}
      {actionLabel && actionHref && (
        <Link to={actionHref} className={cn(buttonClasses("primary", "sm"), "mt-2")}>
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <button onClick={onAction} className={cn(buttonClasses("primary", "sm"), "mt-2")}>
          {actionLabel}
        </button>
      )}
    </Card>
  );
}

/* ------------------------------ Bookmark button ----------------------------- */

export function BookmarkButton({
  type,
  targetId,
  title,
  href,
  variant = "icon",
}: {
  type: BookmarkType;
  targetId: string;
  title: string;
  href: string;
  variant?: "icon" | "button";
}) {
  const toggle = useAprender((s) => s.toggleBookmark);
  const saved = useAprender((s) => s.bookmarks.some((b) => b.id === `${type}:${targetId}`));
  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle({ type, targetId, title, href });
  };
  if (variant === "button") {
    return (
      <button onClick={onClick} className={buttonClasses(saved ? "primary" : "secondary", "sm")}>
        {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        {saved ? "Salvo" : "Salvar"}
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      aria-label={saved ? "Remover dos salvos" : "Salvar"}
      aria-pressed={saved}
      className={cn("rounded-full p-2 transition-colors", saved ? "text-primary" : "text-ink-3 hover:bg-surface-soft hover:text-ink")}
    >
      {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
    </button>
  );
}

/* -------------------------------- Cards ---------------------------------- */

export function DisciplineCard({
  disc,
  progress,
  status,
}: {
  disc: Discipline;
  progress: number;
  status: ProgressoStatus;
}) {
  const Icon = iconByName(disc.icon);
  return (
    <Card className="flex h-full flex-col p-5 transition-shadow hover:shadow-elevated">
      <div className="mb-3 flex items-start gap-3">
        <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl", tokenTile[disc.colorToken])}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display font-bold leading-snug text-ink">{disc.title}</h3>
          <div className="mt-0.5 text-xs text-ink-3">{macroareaLabel[disc.category]}</div>
        </div>
        <BookmarkButton type="disciplina" targetId={disc.slug} title={disc.title} href={`/aprender/disciplinas/${disc.slug}`} />
      </div>
      <p className="mb-3 text-sm text-ink-2">{disc.description}</p>
      <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1">
        <MetaItem icon={<Layers className="h-3.5 w-3.5" />}>{disc.moduleCount} módulos</MetaItem>
        {disciplineDurationLabel(disc) && (
          <MetaItem icon={<Clock className="h-3.5 w-3.5" />}>{disciplineDurationLabel(disc)}</MetaItem>
        )}
        {disc.caseCount > 0 && (
          <MetaItem icon={<Stethoscope className="h-3.5 w-3.5" />}>{disc.caseCount} casos</MetaItem>
        )}
      </div>
      <div className="mt-auto space-y-3">
        {progress > 0 && (
          <div className="flex items-center gap-2">
            <Progress value={progress} className="flex-1" />
            <span className="tabular text-xs font-semibold text-ink-2">{progress}%</span>
          </div>
        )}
        <div className="flex items-center justify-between gap-2">
          <StatusPill status={status} />
          <Link to={`/aprender/disciplinas/${disc.slug}`} className={buttonClasses("secondary", "sm")}>
            Explorar
          </Link>
        </div>
      </div>
    </Card>
  );
}

export function ModuleCard({
  mod,
  disciplineSlug,
  progress,
  status,
}: {
  mod: Module;
  disciplineSlug: string;
  progress: number;
  status: ProgressoStatus;
}) {
  return (
    <Card className="flex flex-col p-5">
      <div className="mb-1 flex items-center gap-2">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary-tint text-xs font-bold text-primary">
          {mod.order}
        </span>
        <h3 className="min-w-0 flex-1 font-display font-bold text-ink">{mod.title}</h3>
      </div>
      <p className="mb-3 text-sm text-ink-2">{mod.description}</p>
      <div className="mb-3 rounded-xl bg-surface-soft p-2.5 text-xs text-ink-2">
        <span className="font-semibold text-ink">Objetivo. </span>
        {mod.objective}
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <NivelPill nivel={mod.level} />
        <MetaItem icon={<Clock className="h-3.5 w-3.5" />}>{mod.estimatedMinutes} min</MetaItem>
        <MetaItem icon={<Layers className="h-3.5 w-3.5" />}>{mod.lessonCount} conteúdos</MetaItem>
      </div>
      {progress > 0 && (
        <div className="mb-3 flex items-center gap-2">
          <Progress value={progress} className="flex-1" />
          <span className="tabular text-xs font-semibold text-ink-2">{progress}%</span>
        </div>
      )}
      <div className="mt-auto flex items-center justify-between gap-2">
        <StatusPill status={status} />
        <Link
          to={`/aprender/disciplinas/${disciplineSlug}/${mod.slug}`}
          className={buttonClasses("secondary", "sm")}
        >
          Abrir módulo
        </Link>
      </div>
    </Card>
  );
}

export function LessonRow({ lesson, status }: { lesson: Lesson; status: ProgressoStatus }) {
  const meta = lessonTypeMeta[lesson.type];
  const TypeIcon = iconByName(meta.icon);
  return (
    <Link
      to={`/aprender/conteudos/${lesson.slug}`}
      className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:border-primary hover:bg-primary-tint/40"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface-soft text-ink-2">
        <TypeIcon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate font-semibold text-ink">{lesson.title}</div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ink-3">
          <span>{meta.label}</span>
          <span aria-hidden>·</span>
          <span>{lesson.estimatedMinutes} min</span>
          <span aria-hidden>·</span>
          <span>{nivelLabel[lesson.level]}</span>
        </div>
      </div>
      {status === "concluido" ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
      ) : status === "em-andamento" ? (
        <CircleDot className="h-4 w-4 shrink-0 text-primary" />
      ) : (
        <Circle className="h-4 w-4 shrink-0 text-ink-3" />
      )}
    </Link>
  );
}

export function RecommendationCard({ rec }: { rec: LearningRecommendation }) {
  const meta = lessonTypeMeta[rec.contentType];
  const Icon = iconByName(meta.icon);
  return (
    <Card className="flex h-full flex-col p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary-tint text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-3">{meta.label}</span>
      </div>
      <h3 className="font-display font-bold leading-snug text-ink">{rec.contentTitle}</h3>
      <p className="mt-1 text-xs text-ink-2">{rec.reason}</p>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-3">
        <span>{rec.discipline}</span>
        <span aria-hidden>·</span>
        <span>{rec.estimatedMinutes} min</span>
      </div>
      <Link to={rec.href} className={cn(buttonClasses("secondary", "sm"), "mt-3 self-start")}>
        Acessar
      </Link>
    </Card>
  );
}

export function StudyObjectiveCard({ obj }: { obj: StudyObjective }) {
  const Icon = iconByName(obj.icon);
  return (
    <Link
      to={obj.href}
      className="flex items-start gap-3 rounded-card border border-border bg-surface p-4 shadow-soft transition-colors hover:border-primary hover:bg-primary-tint/40"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-tint text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <div className="font-display font-bold text-ink">{obj.label}</div>
        <div className="text-sm text-ink-2">{obj.description}</div>
        <div className="mt-1 text-xs text-ink-3">{obj.count} conteúdos</div>
      </div>
    </Link>
  );
}

export function CompetencyBars({ items }: { items: Competency[] }) {
  return (
    <div className="space-y-3">
      {items.map((c) => (
        <div key={c.id}>
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-ink" title={c.description}>
              {c.label}
            </span>
            <span className="tabular text-xs font-semibold text-ink-2">{c.value}%</span>
          </div>
          <Progress value={c.value} tone={c.value >= 50 ? "primary" : "analysis"} />
        </div>
      ))}
    </div>
  );
}
