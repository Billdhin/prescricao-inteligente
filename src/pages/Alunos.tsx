import * as React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Users, UserPlus, Search, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, Pill, buttonClasses, SectionHeader } from "@/components/ui/primitives";
import { useAlunos } from "@/lib/store";
import { rotuloRestricao } from "@/lib/gps/restricoes";
import { AlunoFormModal } from "@/components/app/AlunoFormModal";
import { tempoDesde } from "@/data/alunos";
import type { Aluno } from "@/data/alunos";
import { getSpecialGroup } from "@/data/specialGroups";
import { proximoPasso, dataReavaliacao, type CicloCtx, type ProximoPasso } from "@/lib/gps/proximoPasso";
import { cn } from "@/lib/utils";

const DIA = 86_400_000;

/** Prioridade de triagem: atenção primeiro (vencida > pendência de rotina > em dia). */
function prioridade(chip: ProximoPasso["chip"]): number {
  if (!chip) return 3;
  if (chip.tone === "warning") return 0;
  if (chip.tone === "cta") return 1;
  return 2;
}

export function Alunos() {
  const { alunos, addAluno, loadExamples, avaliacoes, prescricoes, planos, liberacoes, execucoes } = useAlunos();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = React.useState("");
  const [novo, setNovo] = React.useState(params.get("novo") === "1");

  React.useEffect(() => {
    if (params.get("novo") === "1") {
      setNovo(true);
      params.delete("novo");
      setParams(params, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ctx: CicloCtx = { avaliacoes, prescricoes, planos, liberacoes, execucoes };

  // Deriva o próximo passo de cada aluno uma vez, para chip + ordenação + resumo.
  const comPasso = React.useMemo(
    () =>
      alunos.map((a) => ({
        aluno: a,
        passo: proximoPasso(a, ctx),
        temPlanoAtivo: planos.some((p) => p.alunoId === a.id && p.status === "ativo"),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [alunos, avaliacoes, prescricoes, planos, liberacoes, execucoes],
  );

  const ativos = comPasso.filter((x) => x.aluno.status === "ativo").length;
  const comAtencao = comPasso.filter((x) => x.aluno.status === "ativo" && x.passo.chip && x.passo.chip.tone !== "success").length;
  const semPlano = comPasso.filter((x) => x.aluno.status === "ativo" && !x.temPlanoAtivo).length;

  const filtrados = comPasso
    .filter(({ aluno: a }) =>
      [a.nome, a.objetivo, a.nivel, ...a.restricoes.map((r) => rotuloRestricao(r.tag))]
        .join(" ")
        .toLowerCase()
        .includes(q.toLowerCase()),
    )
    .sort((x, y) => {
      // inativos ao fim; depois por atenção; depois por nome
      if ((x.aluno.status === "ativo") !== (y.aluno.status === "ativo")) return x.aluno.status === "ativo" ? -1 : 1;
      const p = prioridade(x.passo.chip) - prioridade(y.passo.chip);
      if (p !== 0) return p;
      return x.aluno.nome.localeCompare(y.aluno.nome);
    });

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <SectionHeader
        eyebrow="Atendimento"
        icon={<Users className="h-3 w-3" />}
        title="Alunos"
        subtitle="Cadastre seus alunos, prescreva com justificativa e acompanhe a evolução."
        right={
          <button onClick={() => setNovo(true)} className={buttonClasses("primary")}>
            <UserPlus className="h-4 w-4" /> Cadastrar aluno
          </button>
        }
      />

      {alunos.length === 0 ? (
        <EmptyAlunos onNovo={() => setNovo(true)} onExemplos={loadExamples} />
      ) : (
        <>
          {/* Resumo de triagem: quantos estão em dia e quantos pedem uma ação */}
          <Card variant="soft" className="flex flex-wrap items-center gap-x-8 gap-y-2 px-5 py-3">
            <ResumoItem valor={ativos} rotulo={ativos === 1 ? "aluno ativo" : "alunos ativos"} />
            <ResumoItem valor={comAtencao} rotulo="precisam de atenção" tone={comAtencao > 0 ? "warning" : "neutro"} />
            <ResumoItem valor={semPlano} rotulo="sem plano ativo" tone={semPlano > 0 ? "warning" : "neutro"} />
          </Card>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar aluno por nome, objetivo, restrição..."
              aria-label="Buscar aluno"
              className="h-11 w-full rounded-full border border-border bg-surface pl-10 pr-4 text-sm outline-none focus-visible:border-primary"
            />
          </div>

          {filtrados.length === 0 ? (
            <Card className="grid place-items-center p-10 text-center">
              <p className="text-ink-2">Nenhum aluno encontrado para “{q}”.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtrados.map(({ aluno, passo }) => (
                <AlunoRow key={aluno.id} aluno={aluno} passo={passo} planoAtivo={planos.find((p) => p.alunoId === aluno.id && p.status === "ativo")} />
              ))}
            </div>
          )}
        </>
      )}

      {novo && (
        <AlunoFormModal
          onClose={() => setNovo(false)}
          onSave={(a) => {
            addAluno(a);
            setNovo(false);
            navigate(`/alunos/${a.id}`, { state: { recemCriado: true } });
          }}
        />
      )}
    </div>
  );
}

function ResumoItem({ valor, rotulo, tone = "neutro" }: { valor: number; rotulo: string; tone?: "neutro" | "warning" | "cta" }) {
  const cor = tone === "warning" ? "text-warning" : tone === "cta" ? "text-[color:var(--cta-text)]" : "text-ink";
  return (
    <div className="flex items-baseline gap-1.5">
      <span className={cn("tabular font-display text-xl font-bold", cor)}>{valor}</span>
      <span className="text-sm text-ink-2">{rotulo}</span>
    </div>
  );
}

function AlunoRow({ aluno, passo, planoAtivo }: { aluno: Aluno; passo: ProximoPasso; planoAtivo?: import("@/data/periodizacao").PlanoTreino }) {
  const restr = aluno.restricoes;
  const grupo = aluno.grupoEspecial ? getSpecialGroup(aluno.grupoEspecial) : undefined;
  const reav = dataReavaliacao(aluno, planoAtivo);
  const reavTexto = reav ? textoReav(reav.em) : null;

  return (
    <Card variant="base" className="group flex items-center gap-4 p-4 transition-shadow hover:shadow-elevated">
      <Link to={`/alunos/${aluno.id}`} className="flex min-w-0 flex-1 items-center gap-4 outline-none">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl gradient-brand font-display font-bold text-white">
          {aluno.iniciais}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-display font-semibold text-ink group-hover:text-primary">{aluno.nome}</p>
            {aluno.status !== "ativo" && <Pill tone="neutral">Saiu</Pill>}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Pill tone="primary">{aluno.objetivo}</Pill>
            <Pill tone="neutral">{aluno.nivel}</Pill>
            {grupo && <Pill tone="analysis">{grupo.nome}</Pill>}
            {restr.length > 0 && (
              <Pill
                tone="warning"
                icon={<AlertTriangle className="h-3 w-3" />}
                className="cursor-default"
              >
                <span title={restr.map((r) => rotuloRestricao(r.tag)).join(", ")}>
                  {restr.length} {restr.length === 1 ? "restrição" : "restrições"}
                </span>
              </Pill>
            )}
          </div>
          <p className="tabular mt-1 truncate text-xs text-ink-3">
            {aluno.ultimaAvaliacaoEm ? `Última avaliação ${tempoDesde(aluno.ultimaAvaliacaoEm).texto}` : "Sem avaliação"}
            {reavTexto ? ` · próxima reavaliação ${reavTexto}` : ""}
          </p>
        </div>
      </Link>

      {/* Estado (some no mobile para não apertar) */}
      <div className="hidden shrink-0 sm:block">
        {passo.chip ? (
          <Pill tone={passo.chip.tone}>{passo.chip.label}</Pill>
        ) : (
          <Pill tone="success" icon={<CheckCircle2 className="h-3 w-3" />}>
            Em dia
          </Pill>
        )}
      </div>
    </Card>
  );
}

function textoReav(em: number): string {
  const dias = Math.round((em - Date.now()) / DIA);
  if (dias < 0) return "vencida";
  if (dias === 0) return "hoje";
  return `em ${dias} ${dias === 1 ? "dia" : "dias"}`;
}

function EmptyAlunos({ onNovo, onExemplos }: { onNovo: () => void; onExemplos: () => void }) {
  return (
    <Card variant="raised" className="flex flex-col items-center gap-4 p-8 text-center md:p-12">
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-primary-tint text-primary">
        <UserPlus className="h-8 w-8" />
      </span>
      <div>
        <h2 className="font-display text-xl font-bold text-ink">Comece pelo seu primeiro aluno</h2>
        <p className="mx-auto mt-1 max-w-md text-ink-2">
          Cadastre um aluno para avaliar, prescrever com justificativa e acompanhar a evolução: cada
          decisão com o raciocínio científico por trás.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <button onClick={onNovo} className={buttonClasses("primary")}>
          <UserPlus className="h-4 w-4" /> Cadastrar aluno
        </button>
        <button onClick={onExemplos} className={buttonClasses("secondary")}>
          Carregar exemplos
        </button>
      </div>
      <p className="text-xs text-ink-3">Os exemplos são dados de demonstração; você pode removê-los depois.</p>
    </Card>
  );
}
