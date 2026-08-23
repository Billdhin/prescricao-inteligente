import { Link, useSearchParams } from "react-router-dom";
import { HeartPulse, ArrowRight, ArrowLeft, Lock, Crown } from "lucide-react";
import { Card, Pill, SectionHeader, buttonClasses } from "@/components/ui/primitives";
import { ModalidadePills, ParametroPills } from "@/components/special/SpecialUI";
import { specialGroups, complexidadeTone, AVISO_SEGURANCA } from "@/data/specialGroups";
import { useUser, useAlunos, isPremiumUnlocked } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useListaProgressiva, VerMais } from "@/components/ui/ListaProgressiva";

export function SpecialGroups() {
  const plan = useUser((s) => s.plan);
  const unlocked = isPremiumUnlocked(plan);
  // Contexto de quem chegou aqui a partir do perfil de um aluno. A lista não muda de
  // conteúdo por causa disso, mas ela para de fingir que a pergunta é abstrata: quem
  // está escolhendo, está escolhendo PARA ALGUÉM.
  const [sp] = useSearchParams();
  const alunoCtx = sp.get("aluno");
  const alunos = useAlunos((s) => s.alunos);
  const alunoDoFluxo = alunoCtx ? alunos.find((a) => a.id === alunoCtx) : undefined;
  // REPASSA a origem que chegou, em vez de chumbar "aluno": a lista é passagem, e quem
  // decide para onde o voltar aponta é a tela que abriu o fluxo. Chumbar aqui mandaria
  // de volta ao perfil quem tinha vindo do Prescrever.
  const origemCtx = sp.get("origem") ?? "aluno";
  const sufixo = alunoDoFluxo ? `?aluno=${alunoDoFluxo.id}&origem=${origemCtx}` : "";
  // As 23 jornadas de uma vez davam 12.510px de altura no celular. Ver ListaProgressiva.
  const lista = useListaProgressiva(specialGroups, 8);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <SectionHeader
        eyebrow="Jornadas de Prescrição"
        icon={<HeartPulse className="h-3 w-3" />}
        title="Grupos Especiais"
        subtitle="Como conduzir diferentes perfis de alunos (por modalidades, parâmetros e fases) de forma segura, progressiva e justificada."
      />

      {alunoDoFluxo && (
        <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full gradient-brand text-xs font-bold text-white">
              {alunoDoFluxo.iniciais}
            </span>
            <span className="text-ink-2">Escolhendo a jornada de</span>
            <span className="font-semibold text-ink">{alunoDoFluxo.nome}</span>
          </div>
          <Link to={`/alunos/${alunoDoFluxo.id}?aba=treino`} className={buttonClasses("secondary", "sm")}>
            <ArrowLeft className="h-4 w-4" /> Voltar sem escolher
          </Link>
        </Card>
      )}

      <div className="flex items-start gap-2 rounded-xl border border-border bg-surface-soft px-3 py-2 text-xs text-ink-2">
        <span className="mt-0.5">ℹ️</span>
        {AVISO_SEGURANCA}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {lista.visiveis.map((g) => {
          const locked = g.premium && !unlocked;
          return (
            <Card key={g.slug} className="flex flex-col p-5">
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="font-display text-lg font-bold text-ink">{g.nome}</h3>
              </div>
              <p className="text-sm text-ink-2">{g.descricaoCurta}</p>

              <div className="mt-3 space-y-2.5">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-3">Objetivo principal</span>
                  <p className="text-sm text-ink">{g.objetivos[0]}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone={complexidadeTone[g.complexidade]}>Complexidade {g.complexidade}</Pill>
                </div>
                <div>
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-3">
                    Modalidades recomendadas
                  </span>
                  <ModalidadePills ids={g.modalidadesIndicadas.slice(0, 3)} />
                </div>
                <div>
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-3">
                    Parâmetros de monitoramento
                  </span>
                  <ParametroPills ids={g.parametros.slice(0, 4)} />
                </div>
              </div>

              <Link
                to={`/special-groups/${g.slug}${sufixo}`}
                className={cn(
                  "mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-control font-semibold text-white",
                  "gradient-brand hover:opacity-95",
                )}
              >
                {locked && <Lock className="h-4 w-4" />}
                Abrir jornada <ArrowRight className="h-4 w-4" />
              </Link>
            </Card>
          );
        })}
      </div>
      <VerMais
        faltam={lista.faltam}
        total={lista.total}
        mostrando={lista.visiveis.length}
        onVerMais={lista.verMais}
        rotulo="jornadas"
      />
    </div>
  );
}
