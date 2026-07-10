import * as React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Users, UserPlus, Search, ArrowRight, Crown, Lock } from "lucide-react";
import { Card, Pill, buttonClasses, SectionHeader } from "@/components/ui/primitives";
import { useAlunos, useUser, isPremiumUnlocked, FREE_ALUNOS_LIMIT } from "@/lib/store";
import { AlunoFormModal } from "@/components/app/AlunoFormModal";
import { tempoDesde, sugestaoProgressao } from "@/data/alunos";

export function Alunos() {
  const { alunos, addAluno, loadExamples } = useAlunos();
  const plan = useUser((s) => s.plan);
  const premium = isPremiumUnlocked(plan);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = React.useState("");
  const [novo, setNovo] = React.useState(params.get("novo") === "1");

  const canAdd = premium || alunos.length < FREE_ALUNOS_LIMIT;

  React.useEffect(() => {
    if (params.get("novo") === "1") {
      setNovo(true);
      params.delete("novo");
      setParams(params, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtrados = alunos.filter((a) =>
    [a.nome, a.objetivo, a.nivel, ...a.restricoes].join(" ").toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <SectionHeader
        eyebrow="Atendimento"
        icon={<Users className="h-3 w-3" />}
        title="Alunos"
        subtitle="Cadastre seus alunos, prescreva com justificativa e acompanhe a evolução."
        right={
          canAdd ? (
            <button onClick={() => setNovo(true)} className={buttonClasses("primary")}>
              <UserPlus className="h-4 w-4" /> Cadastrar aluno
            </button>
          ) : (
            <Link to="/pricing" className={buttonClasses("primary")}>
              <Crown className="h-4 w-4" /> Assinar p/ mais alunos
            </Link>
          )
        }
      />

      {alunos.length === 0 ? (
        <EmptyAlunos onNovo={() => setNovo(true)} onExemplos={loadExamples} />
      ) : (
        <>
          {!premium && (
            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-soft px-3 py-2 text-sm text-ink-2">
              <Lock className="h-4 w-4 text-ink-3" />
              Plano free: até {FREE_ALUNOS_LIMIT} alunos ({alunos.length}/{FREE_ALUNOS_LIMIT} usados).
              <Link to="/pricing" className="font-semibold text-primary hover:underline">
                Assinar Profissional
              </Link>
            </div>
          )}

          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar aluno por nome, objetivo, restrição..."
              aria-label="Buscar aluno"
              className="h-11 w-full rounded-full border border-border bg-surface pl-10 pr-4 text-sm outline-none focus-visible:border-primary/40"
            />
          </div>

          {filtrados.length === 0 ? (
            <Card className="grid place-items-center p-10 text-center">
              <p className="text-ink-2">Nenhum aluno encontrado para “{q}”.</p>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtrados.map((a) => (
            <Link
              key={a.id}
              to={`/alunos/${a.id}`}
              className="flex flex-col rounded-card border border-border bg-surface p-4 shadow-soft transition-colors hover:bg-surface-soft"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full gradient-brand text-sm font-bold text-white">
                  {a.iniciais}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-ink">{a.nome}</div>
                  <div className="truncate text-xs text-ink-3">
                    {a.idade ? `${a.idade} anos · ` : ""}
                    {a.objetivo} · {a.nivel}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-ink-3" />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {a.status !== "ativo" && <Pill tone="neutral">Saiu</Pill>}
                {a.status === "ativo" && sugestaoProgressao(a) && (
                  <Pill tone="primary">Pode avançar de nível</Pill>
                )}
                {a.restricoes.length > 0 ? (
                  a.restricoes.map((r) => (
                    <Pill key={r} tone="warning">
                      {r}
                    </Pill>
                  ))
                ) : (
                  <Pill tone="neutral">Sem restrição</Pill>
                )}
              </div>
              <div className="mt-2 text-xs text-ink-3">Cadastro {tempoDesde(a.criadoEm).texto}</div>
                </Link>
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
            // abre direto o perfil do aluno recém-criado (pedido do Filipe)
            navigate(`/alunos/${a.id}`, { state: { recemCriado: true } });
          }}
        />
      )}
    </div>
  );
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
      <p className="text-xs text-ink-3">
        Os exemplos são dados de demonstração; você pode removê-los depois.
      </p>
    </Card>
  );
}

