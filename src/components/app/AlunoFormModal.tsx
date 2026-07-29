import * as React from "react";
import { X } from "lucide-react";
import { buttonClasses } from "@/components/ui/primitives";
import { uid } from "@/lib/store";
import { EQUIPAMENTOS, type GpsObjetivo } from "@/lib/gps/engine";
import { ObjetivoDuplo } from "@/components/gps/ObjetivoDuplo";
import { parValido } from "@/lib/gps/objetivos";
import { RestricoesSelector } from "@/components/gps/RestricoesSelector";
import { specialGroups } from "@/data/specialGroups";
import { FarmacosSelector } from "@/components/gps/FarmacosSelector";
import type { RestricaoSelecionada } from "@/lib/gps/restricoes";
import type { FarmacoSelecionado } from "@/data/farmacos";
import type { Nivel } from "@/data/types";
import { iniciaisDe, type Aluno } from "@/data/alunos";
import { descricaoOpcao } from "@/data/opcoes-wizard";
import { useDialog } from "@/lib/useDialog";
import { cn } from "@/lib/utils";

const NIVEIS: Nivel[] = ["Iniciante", "Intermediário", "Avançado"];

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
  // Padrão alinhado ao posicionamento (condições/emagrecimento), não "Hipertrofia" (L1).
  const [objetivo, setObjetivo] = React.useState<GpsObjetivo>((inicial?.objetivo as GpsObjetivo) ?? "Emagrecimento");
  const [objetivoSecundario, setObjetivoSecundario] = React.useState<GpsObjetivo | undefined>(
    inicial?.objetivoSecundario,
  );
  const [nivel, setNivel] = React.useState<Nivel>(inicial?.nivel ?? "Iniciante");
  const [restricoes, setRestricoes] = React.useState<RestricaoSelecionada[]>(inicial?.restricoes ?? []);
  const [farmacos, setFarmacos] = React.useState<FarmacoSelecionado[]>(inicial?.farmacos ?? []);
  const [farmacosNaoInformado, setFarmacosNaoInformado] = React.useState(Boolean(inicial?.farmacosNaoInformado));
  const [equipamentos, setEquipamentos] = React.useState<string[]>(inicial?.equipamentos ?? KIT_PADRAO);
  const [observacoes, setObservacoes] = React.useState(inicial?.observacoes ?? "");
  const [telefone, setTelefone] = React.useState(inicial?.telefone ?? "");
  const [grupo, setGrupo] = React.useState(inicial?.grupoEspecial ?? "");
  const dialogRef = useDialog<HTMLDivElement>(onClose);

  const toggle = <T,>(arr: T[], v: T, set: (x: T[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const idadeNum = idade ? Number(idade) : undefined;
  const idadeForaDaFaixa = idadeNum != null && (idadeNum < 12 || idadeNum > 100);

  // Par de objetivos incompatível não vira aluno: o veredito já explicou por quê
  // e o que fazer no lugar, então salvar assim mesmo seria guardar uma contradição.
  const objetivosOk = parValido(objetivo, objetivoSecundario);

  const submit = () => {
    if (!nome.trim() || idadeForaDaFaixa || !objetivosOk) return;
    const agora = Date.now();
    const base = inicial ?? { id: uid(), status: "ativo" as const, criadoEm: agora, nivelDesde: agora };
    // Ao trocar o nível (progressão manual), reinicia a contagem de tempo no nível.
    const nivelDesde = inicial && inicial.nivel !== nivel ? agora : base.nivelDesde ?? base.criadoEm;
    onSave({
      ...base,
      nome: nome.trim(),
      iniciais: iniciaisDe(nome),
      idade: idade ? Number(idade) : undefined,
      objetivo,
      objetivoSecundario,
      nivel,
      nivelDesde,
      restricoes,
      // Campo ausente é o estado válido "não declarou": lista vazia e flag falsa voltam a
      // undefined em vez de virarem uma afirmação sobre o aluno.
      farmacos: farmacos.length ? farmacos : undefined,
      farmacosNaoInformado: farmacosNaoInformado || undefined,
      equipamentos,
      // String vazia = "sem condição declarada", que no domínio é ausência do
      // campo, não um grupo chamado "".
      grupoEspecial: grupo || undefined,
      observacoes: observacoes.trim() || undefined,
      telefone: telefone.trim() || undefined,
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
        className="max-h-modal w-full max-w-lg overflow-auto rounded-card bg-surface p-5 shadow-overlay outline-none md:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink">{editando ? "Editar aluno" : "Cadastrar aluno"}</h2>
          <button onClick={onClose} aria-label="Fechar" className="rounded-full p-2.5 text-ink-3 hover:bg-surface-soft">
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
                aria-invalid={idadeForaDaFaixa}
                className="input"
              />
              {idadeForaDaFaixa && (
                <span className="mt-1 block text-xs text-warning">Idade fora da faixa esperada (12 a 100).</span>
              )}
            </Field>
            <Field label="Nível">
              <select value={nivel} onChange={(e) => setNivel(e.target.value as Nivel)} className="input">
                {NIVEIS.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </Field>
          </div>

          {/*
            DOIS OBJETIVOS: o aluno pode perseguir mais de uma coisa, e o sistema
            precisa dizer na hora se elas somam ou se cobram um preço. A matriz de
            compatibilidade (src/lib/gps/objetivos.ts) responde com referência
            verificada; a tela só mostra. Par incompatível não salva.
          */}
          <ObjetivoDuplo
            objetivo={objetivo}
            objetivoSecundario={objetivoSecundario}
            onChange={(o, s) => {
              setObjetivo(o);
              setObjetivoSecundario(s);
            }}
            compacto
          />

          <div className="grid grid-cols-2 gap-3">
            <Field label="WhatsApp">
              <input
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                inputMode="tel"
                placeholder="Ex.: (11) 99999-0000"
                className="input"
              />
            </Field>
          </div>

          {/*
            CONDIÇÃO DE SAÚDE: o campo que faltava. `grupoEspecial` comanda o
            semáforo diário, as regras do motor e o texto do prontuário, mas até
            aqui só chegava por seed ou pelo onboarding: quem cadastrava um aluno
            pelo caminho normal criava um aluno hipertenso que o sistema tratava
            como saudável.

            Opcional de propósito, e sem chute: quem não sabe deixa em branco, e
            o classificador sugere o grupo depois, pela avaliação (IMC, PA,
            idade), que é medição e não palpite.
          */}
          <fieldset>
            <legend className="mb-1.5 text-sm font-semibold text-ink">Condição de saúde (opcional)</legend>
            <p className="mb-2 text-xs text-ink-2">
              Declarar aqui já liga o semáforo daquela condição no dia a dia. Em branco, a avaliação
              sugere depois.
            </p>
            <div className="flex flex-wrap gap-1.5">
              <ChipCondicao ativo={!grupo} onClick={() => setGrupo("")}>
                Sem condição especial
              </ChipCondicao>
              {specialGroups.map((g) => (
                <ChipCondicao key={g.slug} ativo={grupo === g.slug} onClick={() => setGrupo(g.slug)}>
                  {g.nome}
                </ChipCondicao>
              ))}
            </div>
          </fieldset>

          <Field label="Restrições físicas">
            <RestricoesSelector value={restricoes} onChange={setRestricoes} idBase="aluno-restr" />
          </Field>

          <Field label="Medicamentos em uso">
            <FarmacosSelector
              value={farmacos}
              onChange={setFarmacos}
              naoInformado={farmacosNaoInformado}
              onNaoInformado={setFarmacosNaoInformado}
              idBase="aluno-farm"
            />
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
          <button onClick={submit} disabled={!nome.trim() || idadeForaDaFaixa || !objetivosOk} className={buttonClasses("primary", "sm")}>
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

/** Chip de condição: pílula, ativo em ink sólido (forma, não só cor). */
function ChipCondicao({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={cn(
        "min-h-[36px] rounded-full border px-3 text-sm font-medium transition-colors",
        ativo
          ? "border-ink bg-ink font-semibold text-surface"
          : "border-border bg-surface text-ink-2 hover:bg-surface-soft hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
