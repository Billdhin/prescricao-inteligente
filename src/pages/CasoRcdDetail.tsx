import * as React from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, ShieldAlert, Search } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Card, Pill, buttonClasses } from "@/components/ui/primitives";
import { SeloRCD } from "@/components/rcd/SeloRCD";
import { getCasoDocumentado } from "@/data/casosDocumentados";
import { exercises } from "@/data/exercises";
import { rankExercises } from "@/lib/gps/engine";
import { getGroupRule } from "@/lib/gps/groupRules";
import { recommendModalidades } from "@/lib/gps/modalidadeRules";
import { montarProntuario } from "@/lib/gps/prontuario";
import { getSpecialGroup, AVISO_SEGURANCA } from "@/data/specialGroups";
import { getSemaforo } from "@/data/semaforo";
import { bibliografia } from "@/data/referencias";

/**
 * /casos-rcd/:slug — página pública de um caso documentado. IMPORTANTE: o
 * resultado exibido NÃO é texto estático — é o motor real do produto rodando
 * ao vivo com o perfil do caso (rankExercises + regras de grupo + modalidades
 * + montagem de prontuário). Se o motor evoluir, todos os casos evoluem juntos.
 */
export function CasoRcdDetail() {
  const { slug = "" } = useParams();
  const caso = getCasoDocumentado(slug);

  React.useEffect(() => {
    if (caso) document.title = `${caso.titulo}: caso documentado pelo Motor RCD`;
  }, [caso]);

  const dados = React.useMemo(() => {
    if (!caso) return null;
    const grupo = caso.grupoSlug ? getSpecialGroup(caso.grupoSlug) : undefined;
    const faseObj = grupo ? grupo.fases[(caso.fase ?? 1) - 1] : undefined;
    const rule = caso.grupoSlug ? getGroupRule(caso.grupoSlug) : undefined;
    const results = rankExercises(exercises, caso.answers, rule);
    const modalidades = recommendModalidades({ answers: caso.answers, grupo, faseObj });
    const prontuario = montarProntuario({
      results,
      rule,
      modalidades,
      parametros: faseObj?.parametros ?? ["p-rpe", "p-dor", "p-adesao"],
    });
    const semaforo = caso.grupoSlug ? getSemaforo(caso.grupoSlug) : undefined;
    return { grupo, faseObj, results, modalidades, prontuario, semaforo };
  }, [caso]);

  if (!caso || !dados) return <Navigate to="/casos-rcd" replace />;

  const { grupo, results, modalidades, prontuario, semaforo } = dados;
  const biblio = bibliografia(prontuario.refIds);
  const ctaGps = `/gps?${new URLSearchParams({
    ...(caso.grupoSlug ? { grupo: caso.grupoSlug, fase: String(caso.fase ?? 1) } : {}),
    objetivo: caso.answers.objetivo,
    nivel: caso.answers.nivel,
  }).toString()}`;

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-surface/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 md:px-6">
          <Link to="/">
            <Logo />
          </Link>
          <Link to="/casos-rcd" className="inline-flex items-center gap-2 text-sm font-medium text-ink-2 hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> Todos os casos
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-12 md:px-6">
        {/* Contexto do caso */}
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Pill tone="primary" icon={<Search className="h-3 w-3" />}>
              “{caso.buscaTipica}”
            </Pill>
            {grupo && <Pill tone="warning">{grupo.nome}</Pill>}
          </div>
          <h1 className="font-display text-3xl font-bold text-ink">{caso.titulo}</h1>
          <p className="mt-3 text-ink-2">{caso.contexto}</p>
          <p className="mt-2 text-sm font-semibold text-ink">A decisão: {caso.decisao}</p>
        </div>

        <div className="flex items-center gap-2">
          <SeloRCD />
          <span className="text-xs text-ink-3">o resultado abaixo é gerado ao vivo pelo motor do produto.</span>
        </div>

        {/* Base da semana */}
        {modalidades.length > 0 && (
          <Card className="p-5">
            <h2 className="mb-1 font-display text-lg font-bold text-ink">Base da semana: modalidades</h2>
            <p className="mb-3 text-sm text-ink-2">
              {grupo
                ? `Neste perfil (${grupo.nome}), os exercícios de força entram como complemento; a base é o baixo atrito.`
                : "A base da semana vem antes dos exercícios isolados."}
            </p>
            <ul className="space-y-1.5 text-sm">
              {modalidades.map((m) => (
                <li key={m.modalidade.id} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-analysis" />
                  <span className="text-ink-2">
                    <span className="font-semibold text-ink">{m.modalidade.nome}</span>: {m.motivo}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Escolhidos */}
        <Card variant="raised" className="overflow-hidden">
          <div className="gradient-brand px-5 py-2 text-xs font-bold uppercase tracking-wider text-white">
            O que o motor escolheu, e por quê
          </div>
          <div className="space-y-3 p-5">
            {prontuario.escolhidos.map((e, i) => (
              <div key={e.slug} className="rounded-xl border border-border p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="tabular grid h-6 w-6 place-items-center rounded-full bg-analysis text-xs font-bold text-on-analysis">
                    {i + 1}
                  </span>
                  <span className="font-display font-bold text-ink">{e.nome}</span>
                  <span className="tabular ml-auto text-sm font-bold text-success">adequação {e.score}/100</span>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {e.reasons.map((r) => (
                    <Pill key={r} tone="primary">
                      {r}
                    </Pill>
                  ))}
                </div>
                {e.cautions.length > 0 && (
                  <p className="mt-2 text-xs text-[color:var(--cta-text)]">{e.cautions.join(" · ")}</p>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Descartados — o diferencial que ninguém mostra */}
        <Card className="p-5">
          <h2 className="mb-1 font-display text-lg font-bold text-ink">
            O que foi considerado e descartado, e por quê
          </h2>
          <p className="mb-3 text-sm text-ink-2">
            É esta metade do raciocínio que um treino genérico esconde de você.
          </p>
          <div className="space-y-2">
            {prontuario.descartados.slice(0, 4).map((d) => (
              <div key={d.slug} className="flex gap-2.5 rounded-lg bg-surface-soft px-3 py-2 text-sm">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-ink-3" />
                <span className="text-ink-2">
                  <span className="font-semibold text-ink">{d.nome}</span>{" "}
                  <span className="tabular text-xs text-ink-3">({d.score}/100)</span>: {d.motivoPrincipal}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Semáforo (amostra) */}
        {semaforo && (
          <Card className="p-5">
            <div className="mb-1 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-warning" />
              <h2 className="font-display text-lg font-bold text-ink">Antes de cada sessão: o Semáforo</h2>
            </div>
            <p className="mb-3 text-sm text-ink-2">
              Para este perfil, o profissional responde em ~30s antes de liberar o treino do dia.
              Exemplos do checklist de {grupo?.nome}:
            </p>
            <ul className="space-y-1.5 text-sm text-ink-2">
              {semaforo.itens.slice(0, 3).map((item) => (
                <li key={item.id} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                  {item.pergunta}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Referências */}
        {biblio.length > 0 && (
          <Card variant="soft" className="p-5">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-analysis">
              Base científica deste caso
            </h2>
            <ol className="list-decimal space-y-1 pl-5 text-xs text-ink-2">
              {biblio.slice(0, 6).map((b) => (
                <li key={b.ref.id}>
                  {b.ref.autores}. {b.ref.titulo}. {b.ref.fonte}, {b.ref.ano}.
                </li>
              ))}
            </ol>
          </Card>
        )}

        {/* CTA */}
        <Card variant="raised" className="p-6 text-center">
          <h2 className="font-display text-xl font-bold text-ink">
            O seu próximo aluno não é este caso.
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-ink-2">
            Rode o Motor RCD com o perfil DELE e saia com a decisão documentada, o semáforo do
            dia e o prontuário pronto para assinar.
          </p>
          <Link to={ctaGps} className={buttonClasses("primary") + " mt-4"}>
            Resolver o caso do meu aluno <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>

        <p className="text-xs text-ink-3">{AVISO_SEGURANCA}</p>
      </div>
    </div>
  );
}
