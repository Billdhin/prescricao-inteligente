import * as React from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Target,
  Dumbbell,
  Activity,
  PlayCircle,
  Lightbulb,
  ShieldAlert,
  Sparkles,
  UserPlus,
  Crown,
  X,
  ArrowRight,
  ChevronsDownUp,
} from "lucide-react";
import { Card, Pill, buttonClasses } from "@/components/ui/primitives";
import { PaywallCard } from "@/components/ui/PaywallCard";
import { Accordion } from "@/components/ui/disclosure";
import {
  VisualModalidadeCard,
  ParametroCard,
  ParametroPills,
  SafetyFlags,
  JourneyTimeline,
  FaseCard,
} from "@/components/special/SpecialUI";
import { getSpecialGroup, complexidadeTone, AVISO_SEGURANCA } from "@/data/specialGroups";
import { getCase } from "@/data/cases";
import { useUser, useAlunos, isPremiumUnlocked } from "@/lib/store";
import { useDialog } from "@/lib/useDialog";
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
        <>
          {/* Prévia (teaser): resumo + Fase 1 abertos, resto atrás do paywall */}
          <ResumoDecisao g={g} locked />

          {g.fases[0] && (
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-tint text-primary">
                  <Sparkles className="h-5 w-5" />
                </span>
                <h2 className="font-display text-lg font-bold text-ink">Prévia da jornada — Fase 1</h2>
                <Pill tone="neutral">amostra grátis</Pill>
              </div>
              <FaseCard fase={g.fases[0]} />
            </div>
          )}

          <PaywallCard
            titulo="Jornada completa do plano Profissional"
            descricao="Você viu a Fase 1. Assine para abrir as 4 fases, as modalidades visuais, os parâmetros de monitoramento e a aplicação a alunos reais."
          />
        </>
      ) : (
        <>
          {/* -------- RESUMO DE DECISÃO (resultado primeiro) -------- */}
          <ResumoDecisao g={g} />

          {/* -------- Modalidades indicadas (visual) -------- */}
          <div>
            <TituloBloco icon={<Dumbbell className="h-5 w-5" />} texto="Por onde treinar — modalidades indicadas" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {g.modalidadesIndicadas.map((id) => (
                <VisualModalidadeCard key={id} id={id} />
              ))}
            </div>
          </div>

          {/* -------- Detalhes sob demanda (accordion) -------- */}
          <div>
            <TituloBloco icon={<ChevronsDownUp className="h-5 w-5" />} texto="Aprofundar" />
            <Accordion
              items={[
                {
                  id: "jornada",
                  title: "Jornada de progressão (4 fases)",
                  content: <JourneyTimeline fases={g.fases} />,
                },
                {
                  id: "parametros",
                  title: "Parâmetros — quando usar e como interpretar",
                  content: (
                    <div className="grid gap-4 md:grid-cols-2">
                      {g.parametros.map((id) => (
                        <ParametroCard key={id} id={id} />
                      ))}
                    </div>
                  ),
                },
                ...(g.modalidadesCautela.length
                  ? [
                      {
                        id: "cautela",
                        title: "Modalidades que exigem cautela",
                        content: (
                          <div className="grid gap-4 sm:grid-cols-2">
                            {g.modalidadesCautela.map((id) => (
                              <VisualModalidadeCard key={id} id={id} cautela />
                            ))}
                          </div>
                        ),
                      },
                    ]
                  : []),
                {
                  id: "alerta",
                  title: "Sinais de alerta e segurança",
                  content: <SafetyFlags sinais={g.sinaisAlerta} aviso={AVISO_SEGURANCA} />,
                },
                {
                  id: "erros",
                  title: "Erros comuns",
                  content: (
                    <ul className="space-y-1.5">
                      {g.errosComuns.map((e) => (
                        <li key={e} className="flex gap-2 text-sm text-ink-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cta" />
                          {e}
                        </li>
                      ))}
                    </ul>
                  ),
                },
                ...(relacionados.length
                  ? [
                      {
                        id: "casos",
                        title: "Casos práticos relacionados",
                        content: (
                          <div className="grid gap-3 md:grid-cols-2">
                            {relacionados.map((c) => (
                              <Link
                                key={c!.slug}
                                to={`/cases/${c!.slug}`}
                                className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 transition-colors hover:bg-surface-soft"
                              >
                                <PlayCircle className="h-5 w-5 shrink-0 text-cta" />
                                <div className="min-w-0 flex-1">
                                  <div className="truncate font-semibold text-ink">{c!.titulo}</div>
                                  <div className="truncate text-xs text-ink-3">
                                    {c!.tema} · {c!.dificuldade}
                                  </div>
                                </div>
                                <ArrowRight className="h-4 w-4 shrink-0 text-ink-3" />
                              </Link>
                            ))}
                          </div>
                        ),
                      },
                    ]
                  : []),
              ]}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => setAplicar(true)} className={buttonClasses("primary")}>
              <UserPlus className="h-4 w-4" /> Aplicar a um aluno
            </button>
            <Link to={`/gps?grupo=${g.slug}`} className={buttonClasses("secondary")}>
              Prescrever <ArrowRight className="h-4 w-4" />
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
  const dialogRef = useDialog<HTMLDivElement>(onClose);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Aplicar a um aluno"
        className="w-full max-w-md rounded-card bg-surface p-5 shadow-elevated outline-none md:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink">Aplicar jornada a um aluno</h2>
          <button onClick={onClose} aria-label="Fechar" className="rounded-md p-2.5 text-ink-3 hover:bg-surface-soft">
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

function ResumoDecisao({
  g,
  locked,
}: {
  g: NonNullable<ReturnType<typeof getSpecialGroup>>;
  locked?: boolean;
}) {
  return (
    <Card variant="raised" className="space-y-4 border-l-4 border-l-primary p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-tint text-primary">
            <Sparkles className="h-4 w-4" />
          </span>
          <h2 className="font-display text-xl font-bold text-ink">Resumo de decisão</h2>
        </div>
        {!locked && (
          <Link to={`/gps?grupo=${g.slug}`} className={buttonClasses("secondary", "sm")}>
            Prescrever <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="flex gap-3 rounded-xl bg-primary-tint/60 p-3">
        <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <p className="text-sm text-ink">
          <span className="font-semibold">Como começar: </span>
          {g.comoComecar}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <Rotulo icon={<Target className="h-3.5 w-3.5" />}>Objetivos do treino</Rotulo>
          <ul className="space-y-1">
            {g.objetivos.map((o) => (
              <li key={o} className="flex gap-2 text-sm text-ink-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {o}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <Rotulo icon={<Activity className="h-3.5 w-3.5" />}>Parâmetros essenciais</Rotulo>
          <ParametroPills ids={g.parametros} />
          <p className="mt-3 text-sm text-ink-2">{g.perfil}</p>
        </div>
      </div>
    </Card>
  );
}

function TituloBloco({ icon, texto }: { icon: React.ReactNode; texto: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-tint text-primary">{icon}</span>
      <h2 className="font-display text-lg font-bold text-ink">{texto}</h2>
    </div>
  );
}

function Rotulo({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-3">
      {icon} {children}
    </div>
  );
}
