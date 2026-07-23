import * as React from "react";
import { CheckCircle2, Footprints, Bike, Waves, HeartPulse } from "lucide-react";
import { exercises, getExercise } from "@/data/exercises";
import { getFasePose } from "@/data/fase-poses";
import { getMuscleMapPose } from "@/data/muscle-map-images";
import { getModalidade } from "@/data/modalities";
import type { BlocoSessao, Sessao } from "@/data/periodizacao";
import type { Execucao } from "@/data/execucao";

/**
 * Núcleo compartilhado do bloco do app do aluno: os helpers de apresentação (nome,
 * doses, exercício de catálogo, folha visual, modalidade) e o MIOLO DE REGISTRO
 * (carga/reps/RPE, com o id estável e o upsert). Vive aqui, e não no StudentApp, para
 * o registro inline (BlocoRow) e o registro do modo guiado (TreinoGuiado) usarem
 * exatamente a mesma lógica e nunca divergirem no id nem no que gravam.
 */

export const nomeDoBloco = (b: BlocoSessao): string => {
  if (b.exercicioSlug) return exercises.find((e) => e.slug === b.exercicioSlug)?.nome ?? b.nome ?? b.exercicioSlug;
  return b.nome ?? b.modalidade ?? "Exercício";
};

// Encurta valores de dose verbosos que quebram no mobile ("moderada a alta"
// vira "mod. a alta"). Só o texto muda; o número da dose segue intocado.
const abrevDose = (v: string): string => v.replace(/moderada a alta/gi, "mod. a alta");

// Os tokens de dose de um bloco (Série, Intensidade, Intervalo para força; Formato,
// Duração, Intensidade, Recuperação para aeróbio), com o rótulo colado ao valor.
// Fonte única lida pelo registro e pela leitura, para os dois nunca divergirem.
export function tokensDoBloco(bloco: BlocoSessao): { label: string; value: string }[] {
  const aerobio = bloco.tipo === "aerobio";
  const limpo = (v?: string | number | null) =>
    v != null && String(v).trim() && String(v).trim() !== "-" ? String(v) : "";
  return (
    aerobio
      ? [
          { label: "Formato", value: limpo(bloco.formato) },
          { label: "Duração", value: limpo(bloco.duracao) },
          { label: "Intensidade", value: abrevDose(limpo(bloco.intensidade)) },
          { label: "Recuperação", value: limpo(bloco.recuperacao) },
        ]
      : [
          {
            label: "Série",
            value: bloco.series && bloco.reps ? `${bloco.series} x ${bloco.reps}` : limpo(bloco.series) || limpo(bloco.reps),
          },
          { label: "Intensidade", value: abrevDose(limpo(bloco.intensidade)) },
          { label: "Intervalo", value: limpo(bloco.intervalo) },
        ]
  ).filter((t) => t.value);
}

// Resolve o exercício de catálogo de um bloco (undefined quando o bloco não aponta
// para um slug catalogado). Governa o thumb e a folha do exercício.
export const exercicioDoBloco = (b: BlocoSessao) => (b.exercicioSlug ? getExercise(b.exercicioSlug) : undefined);

// O exercício tem conteúdo visual/instrutivo para abrir a folha? (foto, movimento em
// fases, boneco muscular posado ou passo a passo). Sem isso, o nome segue como texto.
export const temFolhaExercicio = (ex?: ReturnType<typeof getExercise>): boolean =>
  !!ex && (!!ex.imagem || getFasePose(ex.slug, 1) != null || getMuscleMapPose(ex.slug) != null || ex.fases.length > 0);

// Ícone lucide coerente com a modalidade aeróbia quando não há foto de modalidade.
export const iconeModalidade = (raw?: string, ambiente?: string) => {
  const s = (raw ?? "").toLowerCase();
  if (ambiente === "aquático" || /aqua|hidro|nata|nado/.test(s)) return Waves;
  if (/bike|bicicleta|ciclo|spinning/.test(s)) return Bike;
  if (/caminh|marcha|corr|esteira|trote/.test(s)) return Footprints;
  return HeartPulse;
};

// Resolve a modalidade de um bloco aeróbio: aceita o id canônico ("m-bike") e o
// rótulo curto que os planos usam ("bike"/"caminhada").
export const modalidadeDoBloco = (b: BlocoSessao) =>
  b.modalidade ? getModalidade(b.modalidade) ?? getModalidade(`m-${b.modalidade}`) : undefined;

// A sessão está concluída na semana dada? Todos os blocos com uma Execucao daquela
// semana batendo o blocoRef. Mesma regra que sessaoDeHojeIndex usa para a semana atual.
export const sessaoConcluida = (sessao: Sessao, semana: number, execucoes: Execucao[]): boolean =>
  sessao.blocos.length > 0 && sessao.blocos.every((b) => execucoes.some((e) => e.semana === semana && e.blocoRef === b.id));

/**
 * O miolo de registro de um bloco: os mesmos campos e a mesma gravação do BlocoRow,
 * extraídos para o modo guiado reusar sem duplicar. O id é estável por bloco+semana
 * (`ex-<bloco>-s<semana>`); registrar de novo SOBRESCREVE (o store faz upsert), então
 * o registro guiado e o inline apontam para a mesma execução e nunca divergem.
 *
 * Portal só-leitura (sem onRegistrar): não mostra nada. Na prévia, o registro inline
 * some (a nota do rodapé da sessão explica); o modo guiado pede os campos visíveis
 * (`sempreMostrar`), e aí o registrar segue no-op, como hoje.
 */
export function RegistroBloco({
  bloco,
  cor,
  semana,
  planoId,
  alunoId,
  sessaoRef,
  execFeita,
  onRegistrar,
  onDesfazer,
  preview,
  sempreMostrar,
}: {
  bloco: BlocoSessao;
  cor: string;
  semana: number;
  planoId: string;
  alunoId: string;
  sessaoRef: string;
  execFeita?: Execucao;
  onRegistrar?: (e: Execucao) => void;
  onDesfazer?: (execId: string) => void;
  preview?: boolean;
  /** modo guiado mostra os campos mesmo em preview (o registrar segue no-op) */
  sempreMostrar?: boolean;
}) {
  const aerobio = bloco.tipo === "aerobio";
  // Pré-preenche só o que o plano prescreve de forma objetiva E numérica: as Reps.
  // A dose textual ("6 a 12") num campo numérico truncaria; então só pré-preenche
  // número puro. Carga e RPE entram vazios (a intensidade é relativa).
  const repsPrescrito = /^\d+$/.test(String(bloco.reps ?? "").trim()) ? String(bloco.reps).trim() : "";
  const [editando, setEditando] = React.useState(false);
  const [carga, setCarga] = React.useState(execFeita?.cargaFeita != null ? String(execFeita.cargaFeita) : "");
  const [reps, setReps] = React.useState(execFeita?.repsFeitas != null ? String(execFeita.repsFeitas) : repsPrescrito);
  const [rpe, setRpe] = React.useState(execFeita?.rpe != null ? String(execFeita.rpe) : "");
  const podeRegistrar = !!onRegistrar;
  const execId = `ex-${bloco.id}-s${semana}`;

  // Só grava número quando é número de verdade; texto ("6 a 12") vira undefined
  // em vez de piso truncado ou NaN, que envenenaria o histórico do aluno.
  const numOuUndef = (v: string, f: (s: string) => number): number | undefined => {
    const n = f(v.replace(",", "."));
    return Number.isFinite(n) ? n : undefined;
  };
  const registrar = () => {
    if (!onRegistrar) return;
    onRegistrar({
      id: execId,
      alunoId,
      planoId,
      semana,
      sessaoRef,
      blocoRef: bloco.id,
      exercicioSlug: bloco.exercicioSlug,
      cargaFeita: carga ? numOuUndef(carga, parseFloat) : undefined,
      repsFeitas: reps ? numOuUndef(reps, (s) => parseInt(s, 10)) : undefined,
      rpe: rpe ? numOuUndef(rpe, (s) => parseInt(s, 10)) : undefined,
      concluidoEm: Date.now(),
    });
    setEditando(false);
  };
  const concluirAerobio = () => {
    if (!onRegistrar) return;
    onRegistrar({ id: execId, alunoId, planoId, semana, sessaoRef, blocoRef: bloco.id, exercicioSlug: bloco.exercicioSlug, concluidoEm: Date.now() });
  };
  const desfazer = () => {
    if (execFeita && onDesfazer) onDesfazer(execFeita.id);
    setEditando(false);
  };

  if (!podeRegistrar) return null;
  if (preview && !sempreMostrar) return null;

  return (
    <div className="mt-2">
      {execFeita && !editando ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: cor }}>
            <CheckCircle2 className="h-4 w-4" />
            {aerobio
              ? "Concluído"
              : `Feito: ${execFeita.cargaFeita != null ? `${execFeita.cargaFeita} kg` : "sem carga"}${execFeita.repsFeitas != null ? ` x ${execFeita.repsFeitas}` : ""}${execFeita.rpe != null ? ` · RPE ${execFeita.rpe}` : ""}`}
          </span>
          {!aerobio && (
            <button
              onClick={() => setEditando(true)}
              className="inline-flex min-h-[44px] items-center px-1 text-xs font-semibold text-ink-2 underline-offset-2 hover:underline"
            >
              Editar
            </button>
          )}
          {onDesfazer && (
            <button
              onClick={desfazer}
              className="inline-flex min-h-[44px] items-center px-1 text-xs font-medium text-ink-3 underline-offset-2 hover:underline"
            >
              Desfazer
            </button>
          )}
        </div>
      ) : aerobio ? (
        <button
          onClick={concluirAerobio}
          className="inline-flex h-11 items-center gap-1.5 rounded-lg px-4 text-sm font-bold text-white"
          style={{ background: cor }}
        >
          <CheckCircle2 className="h-4 w-4" /> Concluí
        </button>
      ) : (
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-end gap-2">
            <CampoNum label="Carga (kg)" value={carga} onChange={setCarga} placeholder="kg" />
            <CampoNum label="Reps" value={reps} onChange={setReps} />
            <RpeSelect value={rpe} onChange={setRpe} />
            {/* Abaixo de sm o botão desce para a própria linha (w-full). */}
            <button
              onClick={registrar}
              className="inline-flex h-11 w-full items-center justify-center rounded-lg px-4 text-sm font-bold text-white sm:w-auto"
              style={{ background: cor }}
            >
              {editando ? "Salvar" : "Registrar"}
            </button>
            {editando && (
              <button
                onClick={() => setEditando(false)}
                className="inline-flex h-11 items-center px-2 text-sm font-medium text-ink-3 hover:text-ink"
              >
                Cancelar
              </button>
            )}
          </div>
          <p className="text-2xs text-ink-3">RPE é o seu esforço de 0 a 10 (7 = difícil, 9 = quase a falha).</p>
        </div>
      )}
    </div>
  );
}

// Seletor de RPE de 0 a 10 (esforço percebido), com âncoras nas notas que mais
// importam. Substitui o campo livre para o aluno não digitar um valor sem sentido.
function RpeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const id = React.useId();
  const ancora: Record<number, string> = { 5: "moderado", 7: "difícil", 9: "quase a falha", 10: "falha" };
  return (
    <div className="w-24">
      <label htmlFor={id} className="mb-0.5 block text-xs font-semibold uppercase tracking-wide text-ink-3">
        RPE
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-md border border-border bg-surface px-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">-</option>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <option key={n} value={n}>
            {n}
            {ancora[n] ? ` · ${ancora[n]}` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}

function CampoNum({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const id = React.useId();
  return (
    <div className="w-20">
      <label htmlFor={id} className="mb-0.5 block text-xs font-semibold uppercase tracking-wide text-ink-3">
        {label}
      </label>
      <input
        id={id}
        inputMode="decimal"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-md border border-border bg-surface px-2 text-sm text-ink placeholder:text-ink-3/60 focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}
