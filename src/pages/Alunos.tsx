import * as React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Users, UserPlus, Search, ArrowRight, X, Crown, Lock } from "lucide-react";
import { Card, Pill, buttonClasses, SectionHeader } from "@/components/ui/primitives";
import {
  useAlunos,
  useUser,
  isPremiumUnlocked,
  FREE_ALUNOS_LIMIT,
  uid,
} from "@/lib/store";
import { OBJETIVOS, RESTRICOES, EQUIPAMENTOS, type GpsObjetivo, type GpsRestricao } from "@/lib/gps/engine";
import type { Nivel } from "@/data/types";
import { iniciaisDe, type Aluno } from "@/data/alunos";
import { useDialog } from "@/lib/useDialog";
import { cn } from "@/lib/utils";

const NIVEIS: Nivel[] = ["Iniciante", "Intermediário", "Avançado"];
const RESTRICOES_REAIS = RESTRICOES.filter((r) => r !== "Nenhuma") as Exclude<GpsRestricao, "Nenhuma">[];

export function Alunos() {
  const { alunos, addAluno, loadExamples } = useAlunos();
  const plan = useUser((s) => s.plan);
  const premium = isPremiumUnlocked(plan);
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
              <UserPlus className="h-4 w-4" /> Novo aluno
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
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {novo && (
        <NovoAlunoModal
          onClose={() => setNovo(false)}
          onCreate={(a) => {
            addAluno(a);
            setNovo(false);
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

function NovoAlunoModal({ onClose, onCreate }: { onClose: () => void; onCreate: (a: Aluno) => void }) {
  const [nome, setNome] = React.useState("");
  const [idade, setIdade] = React.useState("");
  const [objetivo, setObjetivo] = React.useState<GpsObjetivo>("Hipertrofia");
  const [nivel, setNivel] = React.useState<Nivel>("Iniciante");
  const [restricoes, setRestricoes] = React.useState<Exclude<GpsRestricao, "Nenhuma">[]>([]);
  const [equipamentos, setEquipamentos] = React.useState<string[]>([...EQUIPAMENTOS]);
  const [observacoes, setObservacoes] = React.useState("");
  const dialogRef = useDialog<HTMLDivElement>(onClose);

  const toggle = <T,>(arr: T[], v: T, set: (x: T[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const submit = () => {
    if (!nome.trim()) return;
    onCreate({
      id: uid(),
      nome: nome.trim(),
      iniciais: iniciaisDe(nome),
      idade: idade ? Number(idade) : undefined,
      objetivo,
      nivel,
      restricoes,
      equipamentos,
      observacoes: observacoes.trim() || undefined,
      status: "ativo",
      criadoEm: Date.now(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Novo aluno"
        className="max-h-[88vh] w-full max-w-lg overflow-auto rounded-card bg-surface p-5 shadow-elevated outline-none md:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink">Novo aluno</h2>
          <button onClick={onClose} aria-label="Fechar" className="rounded-md p-2.5 text-ink-3 hover:bg-surface-soft">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <Field label="Nome">
            <input
              autoFocus
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Mariana Alves"
              className="input"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Idade">
              <input
                value={idade}
                onChange={(e) => setIdade(e.target.value.replace(/\D/g, "").slice(0, 3))}
                inputMode="numeric"
                placeholder="Ex.: 34"
                className="input"
              />
            </Field>
            <Field label="Nível">
              <select value={nivel} onChange={(e) => setNivel(e.target.value as Nivel)} className="input">
                {NIVEIS.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Objetivo">
            <select value={objetivo} onChange={(e) => setObjetivo(e.target.value as GpsObjetivo)} className="input">
              {OBJETIVOS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </Field>

          <Field label="Restrições / lesões">
            <div className="flex flex-wrap gap-2">
              {RESTRICOES_REAIS.map((r) => (
                <Chip key={r} active={restricoes.includes(r)} onClick={() => toggle(restricoes, r, setRestricoes)}>
                  {r}
                </Chip>
              ))}
            </div>
          </Field>

          <Field label="Equipamentos disponíveis">
            <div className="flex flex-wrap gap-2">
              {EQUIPAMENTOS.map((eq) => (
                <Chip key={eq} active={equipamentos.includes(eq)} onClick={() => toggle(equipamentos, eq, setEquipamentos)}>
                  {eq}
                </Chip>
              ))}
            </div>
          </Field>

          <Field label="Observações">
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={2}
              placeholder="Histórico, contexto, cuidados..."
              className="input"
            />
          </Field>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className={buttonClasses("secondary", "sm")}>
            Cancelar
          </button>
          <button onClick={submit} disabled={!nome.trim()} className={buttonClasses("primary", "sm")}>
            Cadastrar aluno
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      {children}
    </label>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        active ? "border-primary bg-primary-tint text-primary" : "border-border bg-surface text-ink-2 hover:bg-surface-soft",
      )}
    >
      {children}
    </button>
  );
}
