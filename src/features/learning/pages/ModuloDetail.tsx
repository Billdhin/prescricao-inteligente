import * as React from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Clock, Target, Layers, Stethoscope, ListChecks } from "lucide-react";
import { Card, Pill, Progress, buttonClasses } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { getLearningRepository } from "../repository";
import { nivelLabel } from "../constants";
import { LessonRow, NivelPill, StatusPill } from "../components/shared";
import { useAprender } from "../store";
import { moduleStatFrom } from "../progress";

const repo = getLearningRepository();

export function ModuloDetail() {
  const { disciplineSlug = "", moduleSlug = "" } = useParams();
  const disc = repo.getDiscipline(disciplineSlug);
  const mod = repo.getModuleBySlug(disciplineSlug, moduleSlug);
  const lessons = useAprender((s) => s.lessons);

  if (!disc || !mod) {
    return (
      <div className="mx-auto max-w-3xl py-16 text-center">
        <p className="text-ink-2">Módulo não encontrado.</p>
        <Link to="/aprender/disciplinas" className={cn(buttonClasses("secondary"), "mt-4")}>
          Voltar para Disciplinas
        </Link>
      </div>
    );
  }

  const moduleLessons = repo.getLessonsOfModule(mod.id);
  const stat = moduleStatFrom(mod, lessons);
  const prereqs = (mod.prerequisites ?? [])
    .map((id) => repo.getModulesOf(disc.id).find((m) => m.id === id))
    .filter(Boolean);
  const casos = repo.getCases().filter((c) => c.disciplines.includes(disc.title)).slice(0, 3);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link to={`/aprender/disciplinas/${disc.slug}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-2 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> {disc.title}
      </Link>

      <Card className="p-5 md:p-6">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-tint text-sm font-bold text-primary">{mod.order}</span>
          <NivelPill nivel={mod.level} />
        </div>
        <h1 className="mt-2 font-display text-2xl font-bold text-ink">{mod.title}</h1>
        <p className="mt-1 text-ink-2">{mod.description}</p>

        <Card tone="primary" className="mt-4 flex items-start gap-2 p-3">
          <Target className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm text-ink"><span className="font-semibold">Objetivo. </span>{mod.objective}</p>
        </Card>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-ink-2">
          <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4 text-ink-3" /> {mod.estimatedMinutes} min</span>
          <span className="inline-flex items-center gap-1.5"><Layers className="h-4 w-4 text-ink-3" /> {mod.lessonCount} conteúdos</span>
          <span className="inline-flex items-center gap-1.5"><Stethoscope className="h-4 w-4 text-ink-3" /> {nivelLabel[mod.level]}</span>
        </div>

        {stat.progress > 0 && (
          <div className="mt-4 flex items-center gap-3">
            <Progress value={stat.progress} className="max-w-xs flex-1" />
            <span className="tabular text-sm font-semibold text-ink-2">{stat.progress}%</span>
            <StatusPill status={stat.status} />
          </div>
        )}
      </Card>

      {prereqs.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-ink-2">
          <span className="font-semibold text-ink">Pré-requisitos:</span>
          {prereqs.map((p) =>
            !p ? null : (
              <Link key={p.id} to={`/aprender/disciplinas/${disc.slug}/${p.slug}`}>
                <Pill tone="neutral">{p.title}</Pill>
              </Link>
            ),
          )}
        </div>
      )}

      {/* Conteúdos */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-bold text-ink">
          <ListChecks className="h-5 w-5 text-ink-3" /> Conteúdos do módulo
        </h2>
        <div className="space-y-2">
          {moduleLessons.map((l) => {
            const st = lessons[l.id]?.status ?? "nao-iniciado";
            return <LessonRow key={l.id} lesson={l} status={st} />;
          })}
        </div>
      </section>

      {/* Casos relacionados */}
      {casos.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-xl font-bold text-ink">Casos relacionados</h2>
          <div className="space-y-2">
            {casos.map((c) => (
              <Link key={c.id} to={`/aprender/casos/${c.slug}`} className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:border-primary hover:bg-primary-tint">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface-soft text-ink-2">
                  <Stethoscope className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-ink">{c.title}</div>
                  <div className="text-xs text-ink-3">{c.estimatedMinutes} min</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
