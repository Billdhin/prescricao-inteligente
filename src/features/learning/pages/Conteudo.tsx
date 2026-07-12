import * as React from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, ChevronRight, CheckCircle2, Share2, ThumbsUp, ThumbsDown } from "lucide-react";
import { Card, Pill, buttonClasses } from "@/components/ui/primitives";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { getLearningRepository } from "../repository";
import { nivelLabel } from "../constants";
import { LessonRenderer } from "../blocks";
import { ApplyDrawer } from "../components/ApplyDrawer";
import { BookmarkButton } from "../components/shared";
import { useAprender } from "../store";

const repo = getLearningRepository();

export function Conteudo() {
  const { lessonSlug = "" } = useParams();
  const navigate = useNavigate();
  const lesson = repo.getLesson(lessonSlug);
  const markProgress = useAprender((s) => s.markLessonProgress);
  const completeLesson = useAprender((s) => s.completeLesson);
  const pushHistory = useAprender((s) => s.pushHistory);
  const lessonState = useAprender((s) => (lesson ? s.lessons[lesson.id] : undefined));
  const [apply, setApply] = React.useState<string | null>(null);
  const [util, setUtil] = React.useState<null | boolean>(null);

  React.useEffect(() => {
    if (!lesson) return;
    pushHistory({ type: "conteudo", title: lesson.title, href: `/aprender/conteudos/${lesson.slug}` });
    markProgress(lesson.id, 40); // abrir a aula já conta como em andamento
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonSlug]);

  if (!lesson) {
    return (
      <div className="mx-auto max-w-3xl py-16 text-center">
        <p className="text-ink-2">Conteúdo não encontrado.</p>
        <Link to="/aprender/disciplinas" className={cn(buttonClasses("secondary"), "mt-4")}>
          Voltar para Disciplinas
        </Link>
      </div>
    );
  }

  const disc = repo.getDiscipline(lesson.disciplineSlug);
  const mod = repo.getModuleBySlug(lesson.disciplineSlug, lesson.moduleSlug);
  const siblings = mod ? repo.getLessonsOfModule(mod.id) : [];
  const idx = siblings.findIndex((l) => l.id === lesson.id);
  const prev = idx > 0 ? siblings[idx - 1] : undefined;
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : undefined;
  const concluida = lessonState?.status === "concluido";

  const concluir = () => {
    completeLesson(lesson.id);
    toast("Conteúdo concluído");
    if (next) navigate(`/aprender/conteudos/${next.slug}`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* 12.1 Barra superior */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Trilha" className="flex min-w-0 flex-wrap items-center gap-1 text-xs text-ink-3">
          <Link to="/aprender" className="hover:text-ink">Aprender</Link>
          <ChevronRight className="h-3 w-3" />
          {disc && (
            <>
              <Link to={`/aprender/disciplinas/${disc.slug}`} className="hover:text-ink">{disc.shortTitle}</Link>
              <ChevronRight className="h-3 w-3" />
            </>
          )}
          {mod &&
            (disc ? (
              <Link to={`/aprender/disciplinas/${disc.slug}/${mod.slug}`} className="truncate text-ink-2 hover:text-ink">
                {mod.title}
              </Link>
            ) : (
              <span className="truncate text-ink-2">{mod.title}</span>
            ))}
        </nav>
        <div className="flex items-center gap-1">
          <BookmarkButton type="conteudo" targetId={lesson.slug} title={lesson.title} href={`/aprender/conteudos/${lesson.slug}`} />
          <button
            onClick={() => toast("Link do conteúdo copiado para compartilhar com a equipe")}
            aria-label="Compartilhar internamente"
            className="rounded-full p-2 text-ink-3 hover:bg-surface-soft hover:text-ink"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Título */}
      <header>
        {lesson.subtitle && <div className="text-xs font-semibold uppercase tracking-wider text-primary">{lesson.subtitle}</div>}
        <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">{lesson.title}</h1>
        <p className="mt-2 max-w-2xl text-ink-2">{lesson.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Pill tone="neutral">{lesson.estimatedMinutes} min</Pill>
          <Pill tone="analysis">{nivelLabel[lesson.level]}</Pill>
        </div>
      </header>

      {/* Blocos */}
      <LessonRenderer lesson={lesson} onApply={(s) => setApply(s)} />

      {/* 12.11 Rodapé da aula */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-ink-2">
            <span>Este conteúdo foi útil?</span>
            <button
              onClick={() => { setUtil(true); toast("Obrigado pelo retorno"); }}
              aria-pressed={util === true}
              aria-label="Foi útil"
              className={cn("rounded-full p-2 hover:bg-surface-soft", util === true ? "text-success" : "text-ink-3")}
            >
              <ThumbsUp className="h-4 w-4" />
            </button>
            <button
              onClick={() => { setUtil(false); toast("Obrigado pelo retorno"); }}
              aria-pressed={util === false}
              aria-label="Não foi útil"
              className={cn("rounded-full p-2 hover:bg-surface-soft", util === false ? "text-[color:var(--cta-text)]" : "text-ink-3")}
            >
              <ThumbsDown className="h-4 w-4" />
            </button>
          </div>
          <button onClick={concluir} className={buttonClasses("primary", "sm")}>
            <CheckCircle2 className="h-4 w-4" /> {concluida ? "Concluída" : "Marcar como concluída"}
          </button>
        </div>
      </Card>

      {/* Navegação anterior/próximo */}
      <div className="flex items-center justify-between gap-3">
        {prev ? (
          <Link to={`/aprender/conteudos/${prev.slug}`} className={cn(buttonClasses("secondary", "sm"), "min-w-0")}>
            <ArrowLeft className="h-4 w-4 shrink-0" /> <span className="truncate">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/aprender/conteudos/${next.slug}`} className={cn(buttonClasses("primary", "sm"), "min-w-0")}>
            <span className="truncate">{next.title}</span> <ArrowRight className="h-4 w-4 shrink-0" />
          </Link>
        ) : mod && disc ? (
          <Link to={`/aprender/disciplinas/${disc.slug}/${mod.slug}`} className={buttonClasses("secondary", "sm")}>
            Voltar ao módulo <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <span />
        )}
      </div>

      {apply != null && (
        <ApplyDrawer lessonId={lesson.id} lessonTitle={lesson.title} defaultSummary={apply} onClose={() => setApply(null)} />
      )}
    </div>
  );
}
