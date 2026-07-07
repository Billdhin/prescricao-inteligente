import * as React from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  Sparkles,
  HeartPulse,
  Navigation,
  ArrowRight,
  Crown,
  Lock,
  Activity,
  ShieldAlert,
  Target,
  CheckCircle2,
  UserCheck,
} from "lucide-react";
import { Card, Pill, SectionHeader, buttonClasses } from "@/components/ui/primitives";
import { VisualModalidadeCard, ParametroPills } from "@/components/special/SpecialUI";
import { specialGroups, getSpecialGroup, complexidadeTone, AVISO_SEGURANCA } from "@/data/specialGroups";
import { useUser, useAlunos, isPremiumUnlocked } from "@/lib/store";
import { cn } from "@/lib/utils";

export function DecisaoRapida() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const plan = useUser((s) => s.plan);
  const unlocked = isPremiumUnlocked(plan);
  const { alunos, updateAluno } = useAlunos();

  const alunoParam = params.get("aluno");
  const alunoInicial = alunoParam ? alunos.find((a) => a.id === alunoParam) : undefined;

  const [alunoId, setAlunoId] = React.useState<string>(alunoInicial?.id ?? "");
  const [grupoSlug, setGrupoSlug] = React.useState<string>(
    alunoInicial?.grupoEspecial ?? params.get("grupo") ?? specialGroups[0].slug,
  );
  const [fase, setFase] = React.useState<1 | 2 | 3 | 4>(
    (alunoInicial?.faseJornada ?? (Number(params.get("fase")) || 1)) as 1 | 2 | 3 | 4,
  );

  const aluno = alunoId ? alunos.find((a) => a.id === alunoId) : undefined;
  const grupo = getSpecialGroup(grupoSlug)!;
  const faseObj = grupo.fases[fase - 1] ?? grupo.fases[0];
  const locked = grupo.premium && !unlocked;

  // Ao escolher um aluno, herda o grupo/fase dele (se tiver).
  const onAluno = (id: string) => {
    setAlunoId(id);
    const a = alunos.find((x) => x.id === id);
    if (a?.grupoEspecial) setGrupoSlug(a.grupoEspecial);
    if (a?.faseJornada) setFase(a.faseJornada);
  };

  const aplicarNoAluno = () => {
    if (!aluno) return;
    updateAluno(aluno.id, {
      grupoEspecial: grupo.slug,
      faseJornada: fase,
      modalidadesPreferenciais: faseObj.modalidades,
      parametrosPrioritarios: faseObj.parametros,
      criterioProgressao: faseObj.criteriosAvancar[0],
    });
    navigate(`/alunos/${aluno.id}`);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <SectionHeader
        eyebrow="Decisão em segundos"
        icon={<Sparkles className="h-3 w-3" />}
        title="Decisão rápida"
        subtitle="Escolha o perfil do aluno e receba o essencial: por onde treinar, o que monitorar e o próximo passo. O detalhe fica a um clique."
      />

      {/* -------------------------------- Entrada ------------------------------ */}
      <Card className="p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">Aluno (opcional)</span>
            <select value={alunoId} onChange={(e) => onAluno(e.target.value)} className="input">
              <option value="">— Sem aluno (por perfil) —</option>
              {alunos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">Grupo / condição</span>
            <select
              value={grupoSlug}
              onChange={(e) => setGrupoSlug(e.target.value)}
              className="input"
            >
              {specialGroups.map((g) => (
                <option key={g.slug} value={g.slug}>
                  {g.nome}
                  {g.premium && !unlocked ? " (Premium)" : ""}
                </option>
              ))}
            </select>
          </label>
          <div>
            <span className="mb-1.5 block text-sm font-semibold text-ink">Fase da jornada</span>
            <div className="flex gap-1.5">
              {([1, 2, 3, 4] as const).map((n) => (
                <button
                  key={n}
                  onClick={() => setFase(n)}
                  aria-pressed={n === fase}
                  className={cn(
                    "h-11 flex-1 rounded-control text-sm font-bold transition-colors",
                    n === fase ? "gradient-brand text-white" : "bg-surface-soft text-ink-2 hover:bg-primary-tint",
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {locked ? (
        <Card className="overflow-hidden">
          <div className="gradient-brand p-8 text-center text-white">
            <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white/15">
              <Lock className="h-6 w-6" />
            </span>
            <h2 className="font-display text-2xl font-bold">{grupo.nome} é do plano Profissional</h2>
            <p className="mx-auto mt-2 max-w-md text-white/85">
              Assine para abrir a decisão e a jornada completa deste grupo.
            </p>
            <Link to="/pricing" className="mt-5 inline-flex rounded-control bg-white px-5 py-2.5 font-semibold text-primary hover:bg-white/90">
              Assinar Profissional
            </Link>
          </div>
        </Card>
      ) : (
        <>
          {/* ------------------------------ RESULTADO ---------------------------- */}
          <div className="rounded-card border border-primary/20 bg-primary-tint/30 p-1">
            <div className="rounded-[14px] bg-surface p-5 md:p-6">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-tint text-primary">
                  <HeartPulse className="h-5 w-5" />
                </span>
                <h2 className="font-display text-xl font-bold text-ink">
                  {aluno ? `Plano para ${aluno.nome}` : grupo.nome}
                </h2>
                <Pill tone="primary">Fase {fase} · {faseObj.nome}</Pill>
                <Pill tone={complexidadeTone[grupo.complexidade]}>{grupo.complexidade}</Pill>
                <Link
                  to={`/special-groups/${grupo.slug}`}
                  className="ml-auto text-sm font-semibold text-primary hover:underline"
                >
                  Ver jornada completa
                </Link>
              </div>

              {/* Foco + próximo passo */}
              <div className="grid gap-4 lg:grid-cols-3">
                <ResumoBloco icon={<Target className="h-4 w-4" />} titulo="Foco agora">
                  {faseObj.objetivo}
                </ResumoBloco>
                <ResumoBloco icon={<CheckCircle2 className="h-4 w-4 text-success" />} titulo="Próximo passo (avançar quando)">
                  <ul className="space-y-1">
                    {faseObj.criteriosAvancar.slice(0, 2).map((c) => (
                      <li key={c} className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </ResumoBloco>
                <ResumoBloco icon={<ShieldAlert className="h-4 w-4 text-warning" />} titulo="Cautela principal">
                  {grupo.riscosCautelas[0]}
                </ResumoBloco>
              </div>

              {/* Parâmetros essenciais */}
              <div className="mt-4 rounded-xl border border-border bg-surface-soft p-3">
                <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-3">
                  <Activity className="h-3.5 w-3.5" /> Monitore principalmente
                </div>
                <ParametroPills ids={faseObj.parametros} />
              </div>

              {/* Ações */}
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  to={aluno ? `/gps?aluno=${aluno.id}` : "/gps"}
                  className={buttonClasses("primary")}
                >
                  <Navigation className="h-4 w-4" /> Gerar plano no GPS
                </Link>
                {aluno ? (
                  <button onClick={aplicarNoAluno} className={buttonClasses("secondary")}>
                    <UserCheck className="h-4 w-4" /> Definir esta fase no aluno
                  </button>
                ) : (
                  <Link to="/alunos" className={buttonClasses("secondary")}>
                    Aplicar a um aluno <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* --------------------- Modalidades recomendadas (visual) ------------- */}
          <div>
            <h3 className="mb-3 font-display text-lg font-bold text-ink">Por onde treinar — modalidades desta fase</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {faseObj.modalidades.map((id) => (
                <VisualModalidadeCard key={id} id={id} />
              ))}
            </div>
          </div>

          <p className="text-xs text-ink-3">{AVISO_SEGURANCA}</p>
        </>
      )}
    </div>
  );
}

function ResumoBloco({ icon, titulo, children }: { icon: React.ReactNode; titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border p-3">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-3">
        {icon} {titulo}
      </div>
      <div className="text-sm text-ink">{children}</div>
    </div>
  );
}
