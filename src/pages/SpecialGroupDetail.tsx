import * as React from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Target,
  Dumbbell,
  Activity,
  Route as RouteIcon,
  PlayCircle,
  Lightbulb,
  ShieldAlert,
  BookOpen,
  UserPlus,
  Crown,
  Lock,
  X,
  ArrowRight,
} from "lucide-react";
import { Card, Pill, buttonClasses } from "@/components/ui/primitives";
import {
  ModalidadeCard,
  ParametroCard,
  SafetyFlags,
  JourneyTimeline,
} from "@/components/special/SpecialUI";
import { getSpecialGroup, complexidadeTone, AVISO_SEGURANCA } from "@/data/specialGroups";
import { getCase } from "@/data/cases";
import { useUser, useAlunos, isPremiumUnlocked } from "@/lib/store";
import { cn } from "@/lib/utils";

export function SpecialGroupDetail() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const plan = useUser((s) => s.plan);
  const unlocked = isPremiumUnlocked(plan);
  const { alunos, updateAluno } = useAlunos();
  const [aplicar, setAplicar] = React.useState(false);

  const g = getSpecialGroup(slug);
  if (!g) {
    return (
      <div className="mx-auto max-w-3xl py-16 text-center">
        <p className="text-ink-2">Grupo especial não encontrado.</p>
        <Link to="/special-groups" className={cn(buttonClasses("secondary"), "mt-4")}>
          Voltar
        </Link>
      </div>
    );
  }

  const locked = g.premium && !unlocked;
  const relacionados = g.casosRelacionados.map((s) => getCase(s)).filter(Boolean);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link to="/special-groups" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-2 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Grupos Especiais
      </Link>

      {/* Cabeçalho */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl font-bold text-ink md:text-4xl">{g.nome}</h1>
            <Pill tone={complexidadeTone[g.complexidade]}>Complexidade {g.complexidade}</Pill>
            {g.premium ? <Pill tone="cta" icon={<Crown className="h-3 w-3" />}>Premium</Pill> : <Pill tone="success">Gratuito</Pill>}
          </div>
          <p className="mt-2 max-w-2xl text-ink-2">{g.descricaoCurta}</p>
        </div>
        {!locked && (
          <button onClick={() => setAplicar(true)} className={buttonClasses("primary")}>
            <UserPlus className="h-4 w-4" /> Aplicar a um aluno
          </button>
        )}
      </div>

      {locked ? (
        <Card className="overflow-hidden">
          <div className="gradient-brand p-8 text-center text-white">
            <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white/15">
              <Lock className="h-6 w-6" />
            </span>
            <h2 className="font-display text-2xl font-bold">Jornada do plano Profissional</h2>
            <p className="mx-auto mt-2 max-w-md text-white/85">
              Assine para abrir a jornada completa deste grupo — modalidades, parâmetros, fases de
              progressão e aplicação a alunos reais.
            </p>
            <Link to="/pricing" className="mt-5 inline-flex rounded-control bg-white px-5 py-2.5 font-semibold text-primary hover:bg-white/90">
              Assinar Profissional
            </Link>
          </div>
        </Card>
      ) : (
        <>
          {/* Visão geral + objetivos */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Secao icon={<Target className="h-4 w-4" />} titulo="Visão geral">
              <p className="text-sm text-ink">{g.perfil}</p>
            </Secao>
            <Secao icon={<Target className="h-4 w-4" />} titulo="Objetivos do treino">
              <ul className="space-y-1.5">
                {g.objetivos.map((o) => (
                  <li key={o} className="flex gap-2 text-sm text-ink-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {o}
                  </li>
                ))}
              </ul>
            </Secao>
          </div>

          {/* Como começar */}
          <Card className="flex gap-3 border-primary/20 bg-primary-tint/40 p-5">
            <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <div className="font-display font-bold text-ink">Como começar (aluno iniciante)</div>
              <p className="mt-1 text-sm text-ink">{g.comoComecar}</p>
            </div>
          </Card>

          {/* Modalidades */}
          <div>
            <TituloBloco icon={<Dumbbell className="h-5 w-5" />} texto="Modalidades indicadas" />
            <div className="grid gap-4 md:grid-cols-2">
              {g.modalidadesIndicadas.map((id) => (
                <ModalidadeCard key={id} id={id} />
              ))}
            </div>
            {g.modalidadesCautela.length > 0 && (
              <>
                <TituloBloco icon={<ShieldAlert className="h-5 w-5 text-warning" />} texto="Modalidades que exigem cautela" className="mt-6" />
                <div className="grid gap-4 md:grid-cols-2">
                  {g.modalidadesCautela.map((id) => (
                    <ModalidadeCard key={id} id={id} cautela />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Parâmetros */}
          <div>
            <TituloBloco icon={<Activity className="h-5 w-5" />} texto="Parâmetros a monitorar" />
            <div className="grid gap-4 md:grid-cols-2">
              {g.parametros.map((id) => (
                <ParametroCard key={id} id={id} />
              ))}
            </div>
          </div>

          {/* Sinais de alerta */}
          <SafetyFlags sinais={g.sinaisAlerta} aviso={AVISO_SEGURANCA} />

          {/* Jornada de progressão */}
          <div>
            <TituloBloco icon={<RouteIcon className="h-5 w-5" />} texto="Jornada de progressão" />
            <JourneyTimeline fases={g.fases} />
          </div>

          {/* Erros comuns */}
          <Secao icon={<ShieldAlert className="h-4 w-4 text-cta" />} titulo="Erros comuns">
            <ul className="space-y-1.5">
              {g.errosComuns.map((e) => (
                <li key={e} className="flex gap-2 text-sm text-ink-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cta" />
                  {e}
                </li>
              ))}
            </ul>
          </Secao>

          {/* Casos relacionados */}
          {relacionados.length > 0 && (
            <div>
              <TituloBloco icon={<BookOpen className="h-5 w-5" />} texto="Casos práticos relacionados" />
              <div className="grid gap-3 md:grid-cols-2">
                {relacionados.map((c) => (
                  <Link
                    key={c!.slug}
                    to={`/cases/${c!.slug}`}
                    className="flex items-center gap-3 rounded-card border border-border bg-surface p-4 shadow-soft transition-colors hover:bg-surface-soft"
                  >
                    <PlayCircle className="h-5 w-5 shrink-0 text-cta" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-ink">{c!.titulo}</div>
                      <div className="truncate text-xs text-ink-3">{c!.tema} · {c!.dificuldade}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-ink-3" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button onClick={() => setAplicar(true)} className={buttonClasses("primary")}>
              <UserPlus className="h-4 w-4" /> Aplicar a um aluno
            </button>
            <Link to="/gps" className={buttonClasses("secondary")}>
              Abrir GPS da Prescrição <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </>
      )}

      {aplicar && (
        <AplicarModal
          onClose={() => setAplicar(false)}
          alunos={alunos.filter((a) => a.status === "ativo")}
          onAplicar={(alunoId) => {
            updateAluno(alunoId, {
              grupoEspecial: g.slug,
              faseJornada: 1,
              modalidadesPreferenciais: g.modalidadesIndicadas,
              parametrosPrioritarios: g.parametros.slice(0, 4),
              criterioProgressao: g.fases[0]?.criteriosAvancar[0],
            });
            setAplicar(false);
            navigate(`/alunos/${alunoId}`);
          }}
        />
      )}
    </div>
  );
}

function AplicarModal({
  onClose,
  alunos,
  onAplicar,
}: {
  onClose: () => void;
  alunos: { id: string; nome: string; iniciais: string; objetivo: string }[];
  onAplicar: (id: string) => void;
}) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true" aria-label="Aplicar a um aluno">
      <div className="w-full max-w-md rounded-card bg-surface p-5 shadow-elevated md:p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink">Aplicar jornada a um aluno</h2>
          <button onClick={onClose} aria-label="Fechar" className="rounded-md p-1 text-ink-3 hover:bg-surface-soft">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mb-3 text-sm text-ink-2">
          Define o grupo especial, inicia na Fase 1 e sugere modalidades e parâmetros no perfil do
          aluno. Você pode ajustar tudo depois.
        </p>
        {alunos.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-ink-2">
            Cadastre um aluno primeiro.
          </p>
        ) : (
          <div className="max-h-72 space-y-2 overflow-auto">
            {alunos.map((a) => (
              <button
                key={a.id}
                onClick={() => onAplicar(a.id)}
                className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left transition-colors hover:bg-surface-soft"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full gradient-brand text-xs font-bold text-white">
                  {a.iniciais}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-ink">{a.nome}</div>
                  <div className="truncate text-xs text-ink-3">{a.objetivo}</div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-ink-3" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TituloBloco({ icon, texto, className }: { icon: React.ReactNode; texto: string; className?: string }) {
  return (
    <div className={cn("mb-3 flex items-center gap-2", className)}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-tint text-primary">{icon}</span>
      <h2 className="font-display text-lg font-bold text-ink">{texto}</h2>
    </div>
  );
}

function Secao({ icon, titulo, children }: { icon: React.ReactNode; titulo: string; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <div className="mb-2 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-tint text-primary">{icon}</span>
        <h3 className="font-display font-bold text-ink">{titulo}</h3>
      </div>
      {children}
    </Card>
  );
}
