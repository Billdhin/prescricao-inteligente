import * as React from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Clock, Layers, Stethoscope, HelpCircle, PlayCircle, Network, CalendarCheck } from "lucide-react";
import { Card, Pill, Progress, buttonClasses } from "@/components/ui/primitives";
import { Tabs } from "@/components/ui/disclosure";
import { cn } from "@/lib/utils";
import { getLearningRepository } from "../repository";
import { macroareaLabel } from "../constants";
import { iconByName } from "../icons";
import { tokenTile, BookmarkButton, ModuleCard, StatusPill, disciplineDurationLabel } from "../components/shared";
import { useAprender } from "../store";
import { disciplineStatFrom, moduleStatFrom } from "../progress";

const repo = getLearningRepository();

export function DisciplinaDetail() {
  const { disciplineSlug = "" } = useParams();
  const disc = repo.getDiscipline(disciplineSlug);
  const lessons = useAprender((s) => s.lessons);
  const pushHistory = useAprender((s) => s.pushHistory);

  React.useEffect(() => {
    if (disc) pushHistory({ type: "disciplina", title: disc.title, href: `/aprender/disciplinas/${disc.slug}` });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disciplineSlug]);

  if (!disc) {
    return (
      <div className="mx-auto max-w-3xl py-16 text-center">
        <p className="text-ink-2">Disciplina não encontrada.</p>
        <Link to="/aprender/disciplinas" className={cn(buttonClasses("secondary"), "mt-4")}>
          Voltar para Disciplinas
        </Link>
      </div>
    );
  }

  const Icon = iconByName(disc.icon);
  const mods = repo.getModulesOf(disc.id);
  const stat = disciplineStatFrom(disc, lessons);
  const primeiraAula = mods[0] && repo.getLessonsOfModule(mods[0].id)[0];

  const abas = [
    {
      id: "modulos",
      label: "Módulos",
      content:
        mods.length === 0 ? (
          <Card className="p-6 text-center text-sm text-ink-2">Módulos em construção editorial.</Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {mods.map((m) => {
              const ms = moduleStatFrom(m, lessons);
              return <ModuleCard key={m.id} mod={m} disciplineSlug={disc.slug} progress={ms.progress} status={ms.status} />;
            })}
          </div>
        ),
    },
    {
      id: "visao",
      label: "Visão geral",
      content: <VisaoGeral disc={disc} />,
    },
    {
      id: "aplicacoes",
      label: "Aplicações",
      content: <Aplicacoes disc={disc} />,
    },
    {
      id: "casos",
      label: "Casos",
      content: <CasosRelacionados disciplinaTitle={disc.title} />,
    },
    {
      id: "refs",
      label: "Referências",
      content: <ReferenciasDaDisciplina disc={disc} />,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link to="/aprender/disciplinas" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-2 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Disciplinas
      </Link>

      {/* Cabeçalho */}
      <Card className="p-5 md:p-6">
        <div className="flex flex-wrap items-start gap-4">
          <span className={cn("grid h-14 w-14 shrink-0 place-items-center rounded-2xl", tokenTile[disc.colorToken])}>
            <Icon className="h-7 w-7" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-3">{macroareaLabel[disc.category]}</div>
            <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">{disc.title}</h1>
            <p className="mt-1 max-w-2xl text-ink-2">{disc.description}</p>
          </div>
          <BookmarkButton type="disciplina" targetId={disc.slug} title={disc.title} href={`/aprender/disciplinas/${disc.slug}`} />
        </div>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
          <Meta icon={<Layers className="h-4 w-4" />}>{disc.moduleCount} módulos</Meta>
          <Meta icon={<PlayCircle className="h-4 w-4" />}>{disc.lessonCount} conteúdos</Meta>
          {disc.caseCount > 0 && <Meta icon={<Stethoscope className="h-4 w-4" />}>{disc.caseCount} casos</Meta>}
          {disciplineDurationLabel(disc) && (
            <Meta icon={<Clock className="h-4 w-4" />}>{disciplineDurationLabel(disc)}</Meta>
          )}
          <Meta icon={<Network className="h-4 w-4" />}>{disc.level}</Meta>
          {disc.reviewedAt && (
            <Meta icon={<CalendarCheck className="h-4 w-4" />}>
              Revisão: {new Date(disc.reviewedAt).toLocaleDateString("pt-BR")} · {disc.reviewedBy}
            </Meta>
          )}
        </div>

        {stat.progress > 0 && (
          <div className="mt-4 flex items-center gap-3">
            <Progress value={stat.progress} className="max-w-xs flex-1" />
            <span className="tabular text-sm font-semibold text-ink-2">{stat.progress}%</span>
            <StatusPill status={stat.status} />
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {primeiraAula && (
            <Link to={`/aprender/conteudos/${primeiraAula.slug}`} className={buttonClasses("primary", "sm")}>
              {stat.progress > 0 ? "Continuar" : "Começar disciplina"}
            </Link>
          )}
          <Link to="/aprender/mapa" className={buttonClasses("secondary", "sm")}>
            <Network className="h-4 w-4" /> Ver mapa
          </Link>
        </div>
      </Card>

      <Tabs items={abas} />
    </div>
  );
}

function VisaoGeral({ disc }: { disc: ReturnType<typeof repo.getDiscipline> }) {
  if (!disc) return null;
  return (
    <div className="space-y-4">
      {disc.helpsAnswer && disc.helpsAnswer.length > 0 && (
        <Card className="p-5">
          <h2 className="mb-3 font-display text-lg font-bold text-ink">O que esta disciplina ajuda você a responder?</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {disc.helpsAnswer.map((q, i) => (
              <div key={i} className="flex items-start gap-2 rounded-xl border border-border p-3 text-sm text-ink-2">
                <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {q}
              </div>
            ))}
          </div>
        </Card>
      )}
      <Card className="p-5">
        <div className="flex flex-wrap gap-1.5">
          {disc.tags.map((t) => (
            <Pill key={t} tone="neutral">{t}</Pill>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Aplicacoes({ disc }: { disc: ReturnType<typeof repo.getDiscipline> }) {
  if (!disc) return null;
  const mods = repo.getModulesOf(disc.id);
  const apps = mods.flatMap((m) => m.applications ?? []);
  if (apps.length === 0) {
    return <Card className="p-6 text-center text-sm text-ink-2">Aplicações práticas em construção editorial.</Card>;
  }
  return (
    <div className="space-y-2">
      {apps.map((a, i) => (
        <Card key={i} className="flex items-start gap-3 p-4">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#e7f8ee] text-success">
            <PlayCircle className="h-4 w-4" />
          </span>
          <p className="text-sm text-ink-2">{a}</p>
        </Card>
      ))}
    </div>
  );
}

function CasosRelacionados({ disciplinaTitle }: { disciplinaTitle: string }) {
  const casos = repo.getCases().filter((c) => c.disciplines.includes(disciplinaTitle));
  if (casos.length === 0) {
    return <Card className="p-6 text-center text-sm text-ink-2">Nenhum caso vinculado ainda. Veja todos em Casos de prescrição.</Card>;
  }
  return (
    <div className="space-y-2">
      {casos.map((c) => (
        <Link key={c.id} to={`/aprender/casos/${c.slug}`} className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:border-primary hover:bg-primary-tint">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface-soft text-ink-2">
            <Stethoscope className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold text-ink">{c.title}</div>
            <div className="text-xs text-ink-3">{c.profile} · {c.estimatedMinutes} min</div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function ReferenciasDaDisciplina({ disc }: { disc: ReturnType<typeof repo.getDiscipline> }) {
  if (!disc) return null;
  // Referências efetivamente citadas pelas aulas desta disciplina (não a lista
  // global). Sem duplicatas e sem placeholders "a-validar".
  const ids = new Set<string>();
  for (const m of repo.getModulesOf(disc.id)) {
    for (const l of repo.getLessonsOfModule(m.id)) {
      for (const b of l.blocks) {
        if (b.type === "references") {
          for (const id of (b.content as { ids?: string[] }).ids ?? []) ids.add(id);
        }
      }
    }
  }
  const refs = [...ids]
    .map((id) => repo.getReference(id))
    .filter((r): r is NonNullable<typeof r> => Boolean(r) && r!.validationStatus !== "a-validar")
    .slice(0, 8);

  if (refs.length === 0) {
    return (
      <Card className="p-6 text-center text-sm text-ink-2">
        As referências desta disciplina aparecem dentro de cada conteúdo.{" "}
        <Link to="/aprender/biblioteca" className="font-semibold text-primary hover:underline">
          Abrir biblioteca científica
        </Link>
      </Card>
    );
  }
  return (
    <div className="space-y-2">
      {refs.map((r) => (
        <Card key={r.id} className="p-4 text-sm">
          <span className="text-ink">
            {r.authors} ({r.year}). <span className="italic">{r.title}</span>. {r.journalOrPublisher}.
          </span>
          <div className="mt-1 text-xs text-ink-3">{r.abstractSummary}</div>
        </Card>
      ))}
      <Link to="/aprender/biblioteca" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
        Abrir biblioteca científica
      </Link>
    </div>
  );
}

function Meta({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-ink-2">
      <span className="text-ink-3">{icon}</span>
      {children}
    </span>
  );
}
