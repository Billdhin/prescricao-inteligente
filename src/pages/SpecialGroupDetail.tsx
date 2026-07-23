import * as React from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Target,
  Dumbbell,
  Activity,
  PlayCircle,
  Lightbulb,
  ShieldAlert,
  Sparkles,
  Crown,
  ArrowRight,
  ChevronsDownUp,
  BookOpen,
  Stethoscope,
  Microscope,
  Users,
} from "lucide-react";
import { Card, Pill, buttonClasses } from "@/components/ui/primitives";
import { PaywallCard } from "@/components/ui/PaywallCard";
import { Accordion } from "@/components/ui/disclosure";
import { getTeoriaGrupo, type TeoriaGrupo } from "@/data/specialGroups";
import { bibliografia } from "@/data/referencias";
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
import { cn } from "@/lib/utils";

export function SpecialGroupDetail() {
  const { slug = "" } = useParams();
  const [sp] = useSearchParams();
  const plan = useUser((s) => s.plan);
  const unlocked = isPremiumUnlocked(plan);
  const { alunos } = useAlunos();

  // Contexto vindo do fluxo Prescrever: preserva o aluno e a fase já escolhidos,
  // para não perder o caminho nem pedir de novo o aluno.
  const alunoCtx = sp.get("aluno");
  const faseCtx = sp.get("fase");
  const origem = sp.get("origem");
  const alunoDoFluxo = alunoCtx ? alunos.find((a) => a.id === alunoCtx) : undefined;
  // Se cheguei aqui a partir do PERFIL do aluno, o "voltar" leva de volta ao perfil,
  // não ao wizard (senão o profissional perde o lugar de onde saiu).
  const voltandoParaAluno = origem === "aluno" && !!alunoDoFluxo;
  // Vindo do resultado do Prescrever exercício: o wizard é estado local e zera ao
  // voltar. O rótulo não promete "continuar a prescrição" (seria falso), diz só
  // "Voltar ao Prescrever exercício".
  const voltandoParaGps = origem === "gps";
  const g = getSpecialGroup(slug);
  const voltarPrescricao = alunoDoFluxo
    ? voltandoParaAluno
      ? `/alunos/${alunoDoFluxo.id}`
      : `/gps?aluno=${alunoDoFluxo.id}&grupo=${slug}${faseCtx ? `&fase=${faseCtx}` : ""}`
    : voltandoParaGps
      ? `/gps?grupo=${slug}${faseCtx ? `&fase=${faseCtx}` : ""}`
      : null;
  const primeiroNome = alunoDoFluxo?.nome.split(" ")[0] ?? "";
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
      <Link
        to={voltarPrescricao ?? "/special-groups"}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-2 hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />{" "}
        {voltarPrescricao
          ? voltandoParaAluno
            ? "Voltar ao perfil"
            : voltandoParaGps
              ? "Voltar ao Prescrever exercício"
              : "Voltar à prescrição"
          : "Grupos Especiais"}
      </Link>

      {/* Contexto do fluxo Prescrever — não perde o aluno/fase já escolhidos */}
      {alunoDoFluxo && voltarPrescricao && (
        <Card className="flex flex-wrap items-center justify-between gap-3 border-l-4 border-l-primary p-4">
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full gradient-brand text-xs font-bold text-white">
              {alunoDoFluxo.iniciais}
            </span>
            <span className="text-ink-2">Consultando a jornada para</span>
            <span className="font-semibold text-ink">{alunoDoFluxo.nome}</span>
            {faseCtx && <Pill tone="primary">Fase {faseCtx}</Pill>}
          </div>
          <Link to={voltarPrescricao} className={buttonClasses("primary", "sm")}>
            <ArrowLeft className="h-4 w-4" />{" "}
            {voltandoParaAluno
              ? `Voltar ao perfil de ${primeiroNome}`
              : voltandoParaGps
                ? "Voltar ao Prescrever exercício"
                : "Voltar e continuar a prescrição"}
          </Link>
        </Card>
      )}

      {/* Cabeçalho */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl font-bold text-ink md:text-4xl">{g.nome}</h1>
            <Pill tone={complexidadeTone[g.complexidade]}>Complexidade {g.complexidade}</Pill>
          </div>
          <p className="mt-2 max-w-2xl text-ink-2">{g.descricaoCurta}</p>
        </div>
        {!locked && voltarPrescricao && (
          <Link to={voltarPrescricao} className={buttonClasses("primary")}>
            <ArrowLeft className="h-4 w-4" />{" "}
            {voltandoParaAluno
              ? `Voltar ao perfil de ${primeiroNome}`
              : voltandoParaGps
                ? "Voltar ao Prescrever exercício"
                : `Continuar prescrição de ${primeiroNome}`}
          </Link>
        )}
      </div>

      {/* Página de ESTUDO: o direcionamento de cada aluno nasce no perfil dele, não aqui. */}
      {!locked && !voltarPrescricao && (
        <Card className="flex flex-wrap items-center gap-3 p-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-tint text-primary">
            <Users className="h-4 w-4" />
          </span>
          <p className="min-w-0 flex-1 text-sm text-ink-2">
            Esta página é material de estudo. O direcionamento de cada aluno acontece no perfil
            dele, a partir do cadastro e da avaliação, com a sugestão de grupo especial.
          </p>
          <Link to="/alunos" className={buttonClasses("secondary", "sm")}>
            Ver meus alunos <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>
      )}

      {locked ? (
        <>
          {/* Prévia (teaser): resumo + Fase 1 abertos, resto atrás do paywall */}
          <ResumoDecisao g={g} locked />

          {/* No teaser a ciência ajuda a decidir pela assinatura; fica visível */}
          <TeoriaCard slug={g.slug} nome={g.nome} />

          {g.fases[0] && (
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-tint text-primary">
                  <Sparkles className="h-5 w-5" />
                </span>
                <h2 className="font-display text-lg font-bold text-ink">Prévia da jornada: Fase 1</h2>
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
            <TituloBloco icon={<Dumbbell className="h-5 w-5" />} texto="Por onde treinar: modalidades indicadas" />
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
                  title: "Parâmetros: quando usar e como interpretar",
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
                                to={`/aprender/casos/${c!.slug}`}
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
                {
                  id: "teoria",
                  title: "Conhecimento científico da condição",
                  content: <TeoriaCard slug={g.slug} nome={g.nome} bare />,
                },
              ]}
            />
          </div>

          {voltarPrescricao && (
            <div className="flex flex-wrap gap-2">
              <Link to={voltarPrescricao} className={buttonClasses("primary")}>
                <ArrowLeft className="h-4 w-4" />{" "}
                {voltandoParaAluno
                  ? `Voltar ao perfil de ${primeiroNome}`
                  : voltandoParaGps
                    ? "Voltar ao Prescrever exercício"
                    : `Voltar e continuar a prescrição de ${primeiroNome}`}
              </Link>
            </div>
          )}
        </>
      )}
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

      <div className="flex gap-3 rounded-xl bg-primary-tint p-3">
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
          {/* Rótulo próprio: o texto abaixo é o perfil da condição, não um parâmetro. */}
          <div className="mt-4">
            <Rotulo icon={<Stethoscope className="h-3.5 w-3.5" />}>Perfil da condição</Rotulo>
            <p className="text-sm text-ink-2">{g.perfil}</p>
          </div>
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

/** Conhecimento científico da condição: o que é, fisiologia aplicada ao
 *  exercício e evidência, com referências. É a teoria que fundamenta a decisão. */
function TeoriaCard({ slug, nome, bare }: { slug: string; nome: string; bare?: boolean }) {
  const t: TeoriaGrupo | undefined = getTeoriaGrupo(slug);
  if (!t) return null;
  const refs = bibliografia(t.refIds);
  const corpo = (
    <>
      <div className="space-y-4">
        <TeoriaBloco titulo="O que é" icon={<BookOpen className="h-3.5 w-3.5" />}>{t.oQueE}</TeoriaBloco>
        <TeoriaBloco titulo="Fisiologia aplicada ao exercício" icon={<Activity className="h-3.5 w-3.5" />}>
          {t.fisiologia}
        </TeoriaBloco>
        <TeoriaBloco titulo="O que a evidência sugere" icon={<Stethoscope className="h-3.5 w-3.5" />}>
          {t.evidencia}
        </TeoriaBloco>
        {refs.length > 0 && (
          <div>
            <Rotulo icon={<BookOpen className="h-3.5 w-3.5" />}>Referências</Rotulo>
            <ol className="space-y-1.5 text-xs text-ink-2">
              {refs.map(({ n, ref }) => (
                <li key={ref.id} className="flex gap-2">
                  <span className="font-semibold text-ink-3">{n}.</span>
                  <span>
                    {ref.autores} ({ref.ano}). <span className="italic">{ref.titulo}</span>. {ref.fonte}.
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
      <p className="mt-4 text-2xs leading-relaxed text-ink-3">
        Conteúdo educacional de apoio à decisão do profissional habilitado; não é conduta médica, diagnóstica ou
        terapêutica e não substitui avaliação médica.
      </p>
    </>
  );
  if (bare) return corpo;
  return (
    <Card className="p-5 md:p-6">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-analysis-tint text-analysis">
          <Microscope className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-display text-lg font-bold text-ink">Conhecimento científico</h2>
          <p className="text-sm text-ink-3">A base teórica de {nome} aplicada ao exercício.</p>
        </div>
      </div>
      {corpo}
    </Card>
  );
}

function TeoriaBloco({ titulo, icon, children }: { titulo: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <Rotulo icon={icon}>{titulo}</Rotulo>
      <p className="text-sm leading-relaxed text-ink-2">{children}</p>
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
