import * as React from "react";
import { X } from "lucide-react";
import { buttonClasses } from "@/components/ui/primitives";
import { uid } from "@/lib/store";
import { OBJETIVOS, RESTRICOES, EQUIPAMENTOS, type GpsObjetivo, type GpsRestricao } from "@/lib/gps/engine";
import type { Nivel } from "@/data/types";
import { iniciaisDe, type Aluno } from "@/data/alunos";
import { descricaoOpcao } from "@/data/opcoes-wizard";
import { useDialog } from "@/lib/useDialog";
import { cn } from "@/lib/utils";

const NIVEIS: Nivel[] = ["Iniciante", "Intermediário", "Avançado"];
const RESTRICOES_REAIS = RESTRICOES.filter((r) => r !== "Nenhuma") as Exclude<GpsRestricao, "Nenhuma">[];

/** Kit típico de academia: ponto de partida honesto (o cadastro antigo marcava
 *  os 10, inclusive Piscina, e o perfil nascia dizendo o que o aluno não tem). */
const KIT_PADRAO = ["Máquina", "Barra", "Halter", "Polia", "Peso corporal"];

/** Formulário de aluno para CRIAR (sem `inicial`) e EDITAR (com `inicial`).
 *  O prefill do Prescrever depende destes campos: manter editável é o que
 *  permite o perfil evoluir (nível, equipamentos, restrições novas). */
export function AlunoFormModal({
  inicial,
  onClose,
  onSave,
}: {
  inicial?: Aluno;
  onClose: () => void;
  onSave: (a: Aluno) => void;
}) {
  const editando = Boolean(inicial);
  const [nome, setNome] = React.useState(inicial?.nome ?? "");
  const [idade, setIdade] = React.useState(inicial?.idade ? String(inicial.idade) : "");
  const [objetivo, setObjetivo] = React.useState<GpsObjetivo>((inicial?.objetivo as GpsObjetivo) ?? "Hipertrofia");
  const [nivel, setNivel] = React.useState<Nivel>(inicial?.nivel ?? "Iniciante");
  const [restricoes, setRestricoes] = React.useState<Exclude<GpsRestricao, "Nenhuma">[]>(
    (inicial?.restricoes as Exclude<GpsRestricao, "Nenhuma">[]) ?? [],
  );
  const [equipamentos, setEquipamentos] = React.useState<string[]>(inicial?.equipamentos ?? KIT_PADRAO);
  const [observacoes, setObservacoes] = React.useState(inicial?.observacoes ?? "");
  const dialogRef = useDialog<HTMLDivElement>(onClose);

  const toggle = <T,>(arr: T[], v: T, set: (x: T[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const submit = () => {
    if (!nome.trim()) return;
    onSave({
      ...(inicial ?? { id: uid(), status: "ativo", criadoEm: Date.now() }),
      nome: nome.trim(),
      iniciais: iniciaisDe(nome),
      idade: idade ? Number(idade) : undefined,
      objetivo,
      nivel,
      restricoes,
      equipamentos,
      observacoes: observacoes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={editando ? "Editar aluno" : "Cadastrar aluno"}
        className="max-h-[88vh] w-full max-w-lg overflow-auto rounded-card bg-surface p-5 shadow-elevated outline-none md:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink">{editando ? "Editar aluno" : "Cadastrar aluno"}</h2>
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
            <div className="mb-1.5 flex gap-3 text-xs font-semibold">
              <button type="button" className="text-primary hover:underline" onClick={() => setEquipamentos([...EQUIPAMENTOS])}>
                Marcar todos
              </button>
              <button type="button" className="text-ink-3 hover:underline" onClick={() => setEquipamentos(["Peso corporal"])}>
                Limpar
              </button>
            </div>
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
            {editando ? "Salvar alterações" : "Cadastrar aluno"}
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
  const desc = typeof children === "string" ? descricaoOpcao(children) : undefined;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={desc}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        active ? "border-primary bg-primary-tint text-primary" : "border-border bg-surface text-ink-2 hover:bg-surface-soft",
      )}
    >
      {children}
    </button>
  );
}
