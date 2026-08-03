import * as React from "react";
import { CheckCircle2, Footprints, Bike, Waves, HeartPulse } from "lucide-react";
import { exercises, getExercise } from "@/data/exercises";
import { corDeContraste } from "@/lib/theme/palettes";
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

/**
 * A dose em UMA linha, do jeito que o app do aluno mostra sob o nome do
 * exercício na lista do dia: "3 x 12 · 60s" na força, "25 min · zona 2" no
 * aeróbio. É o resumo; a dose completa com rótulo colado (TokenRotulado) segue
 * existindo logo abaixo, para intensidade e intervalo.
 *
 * Nunca inventa: sai dos mesmos campos de `tokensDoBloco`, só que abreviada.
 */
export function doseCurta(bloco: BlocoSessao): string {
  const limpo = (v?: string | number | null) =>
    v != null && String(v).trim() && String(v).trim() !== "-" ? String(v).trim() : "";
  const partes: string[] = [];
  if (bloco.tipo === "aerobio") {
    // Duração + formato. A intensidade do aeróbio é uma FRASE inteira ("cerca de
    // 64 a 76% da FCmáx, teste da conversa...") e não cabe numa linha de resumo;
    // ela fica nos tokens abaixo, com o rótulo colado.
    if (limpo(bloco.duracao)) partes.push(limpo(bloco.duracao));
    if (limpo(bloco.formato)) partes.push(limpo(bloco.formato).toLowerCase());
  } else {
    if (bloco.series && bloco.reps) partes.push(`${bloco.series} x ${bloco.reps}`);
    else if (limpo(bloco.series) || limpo(bloco.reps)) partes.push(limpo(bloco.series) || limpo(bloco.reps));
    if (limpo(bloco.intervalo)) partes.push(limpo(bloco.intervalo));
  }
  return partes.join(" · ");
}

/**
 * O que a linha curta NÃO disse. A lista do dia mostra a `doseCurta` sob o nome
 * ("3 x 12 · 60s"); repetir a dose inteira logo abaixo em TokenRotulado era
 * ruído. Aqui ficam só os rótulos que sobraram (tipicamente a Intensidade, que
 * não cabe na linha curta), com o rótulo colado ao valor.
 */
const NA_LINHA_CURTA = new Set(["Série", "Intervalo", "Duração"]);
export function tokensExtras(bloco: BlocoSessao): { label: string; value: string }[] {
  const naCurta = bloco.tipo === "aerobio" ? new Set(["Duração", "Formato"]) : NA_LINHA_CURTA;
  return tokensDoBloco(bloco).filter((t) => !naCurta.has(t.label));
}

/**
 * Minutos DECLARADOS de uma sessão: a soma do alvo dos blocos aeróbios. Existe
 * porque o mockup mostra "45 min" ao lado da contagem de exercícios, e o modelo
 * não tem duração de sessão. Somar tempo de musculação seria número inventado
 * (não existe descanso nem tempo sob tensão declarados), então só entra o que o
 * plano de fato declarou. Sem aeróbio com alvo, devolve undefined e a tela
 * simplesmente não mostra minutos.
 */
export function minutosDeclarados(sessao: Sessao): number | undefined {
  const total = sessao.blocos.reduce((soma, b) => soma + (b.tipo === "aerobio" ? (b.duracaoAlvoMin ?? 0) : 0), 0);
  return total > 0 ? total : undefined;
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
  const tintaDaCor = corDeContraste(cor);

  // Séries prescritas: só conta quando o plano traz um número puro. Dose textual
  // ("3 a 4") não vira contador inventado; nesse caso o exercício se registra de
  // uma vez, como antes.
  const totalSeries = /^\d+$/.test(String(bloco.series ?? "").trim()) ? Number(bloco.series) : 1;
  const [serie, setSerie] = React.useState(1);
  const ultimaSerie = serie >= totalSeries;

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
    setSerie(1);
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
          className="inline-flex h-11 items-center gap-1.5 rounded-full px-4 text-sm font-bold text-on-primary"
          style={{ background: cor }}
        >
          <CheckCircle2 className="h-4 w-4" /> Concluí
        </button>
      ) : (
        <div className="space-y-3">
          {/* SÉRIES: um disco por série prescrita, marcando onde o aluno está.
              É estado da SESSÃO em curso, não dado persistido: o modelo grava uma
              execução por exercício (carga, reps, RPE), e é a última série que
              fecha o exercício. Marcar cada série no banco seria outro modelo de
              dados; contar as séries na tela é o que o aluno precisa para não se
              perder no meio do exercício. */}
          {totalSeries > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-2xs font-bold uppercase tracking-wider text-ink-2">Séries</span>
              <div className="flex flex-wrap gap-1.5" role="img" aria-label={`Série ${serie} de ${totalSeries}`}>
                {Array.from({ length: totalSeries }, (_, i) => {
                  const n = i + 1;
                  const feita = n < serie;
                  const atual = n === serie;
                  return (
                    <span
                      key={n}
                      aria-hidden
                      className="tabular grid h-9 w-9 place-items-center rounded-full text-sm font-bold"
                      style={
                        feita
                          ? { background: "var(--analysis-fill)", color: "var(--on-analysis-fill)" }
                          : atual
                            ? { background: cor, color: tintaDaCor }
                            : { boxShadow: "inset 0 0 0 1.5px var(--border)", color: "var(--ink-2)" }
                      }
                    >
                      {feita ? <CheckCircle2 className="h-4 w-4" /> : n}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Stepper label="kg" value={carga} onChange={setCarga} passo={2.5} />
            <Stepper label="repetições" value={reps} onChange={setReps} passo={1} inteiro />
          </div>

          <RpeSelect value={rpe} onChange={setRpe} />

          <button
            onClick={ultimaSerie ? registrar : () => setSerie((s) => s + 1)}
            className="inline-flex h-12 w-full items-center justify-center rounded-full px-4 text-base font-bold"
            style={{ background: cor, color: tintaDaCor }}
          >
            {editando ? "Salvar" : totalSeries > 1 ? `Registrar série ${serie}` : "Registrar"}
          </button>
          {editando && (
            <button
              onClick={() => setEditando(false)}
              className="inline-flex h-11 w-full items-center justify-center text-sm font-medium text-ink-2 hover:text-ink"
            >
              Cancelar
            </button>
          )}
          <p className="text-2xs text-ink-2">RPE é o seu esforço de 0 a 10 (7 = difícil, 9 = quase a falha).</p>
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


/**
 * Controle de número em passo (menos, valor, mais), como no mockup: o aluno na
 * academia ajusta com o polegar, sem abrir o teclado. O campo continua digitável
 * para quem prefere escrever; os botões apenas somam e subtraem o passo.
 *
 * Alvos de 44px nos dois botões (regra de toque do Design System).
 */
function Stepper({
  label,
  value,
  onChange,
  passo,
  inteiro,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  passo: number;
  /** repetições são inteiras; carga aceita meio quilo */
  inteiro?: boolean;
}) {
  const id = React.useId();
  const num = () => {
    const n = parseFloat(value.replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  };
  const aplica = (delta: number) => {
    const bruto = Math.max(0, num() + delta);
    const v = inteiro ? String(Math.round(bruto)) : String(Number(bruto.toFixed(1)));
    onChange(v);
  };
  return (
    <div className="flex min-w-0 flex-1 items-center gap-1 rounded-card border border-border bg-surface-soft p-1.5">
      <button
        type="button"
        onClick={() => aplica(-passo)}
        aria-label={`Diminuir ${label}`}
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface text-lg font-bold text-ink"
      >
        &minus;
      </button>
      <div className="min-w-0 flex-1 text-center">
        <input
          id={id}
          inputMode="decimal"
          value={value}
          placeholder="0"
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className="tabular w-full bg-transparent text-center font-display text-xl font-bold text-ink placeholder:text-ink-2 focus:outline-none"
        />
        <label htmlFor={id} className="block text-2xs text-ink-2">
          {label}
        </label>
      </div>
      <button
        type="button"
        onClick={() => aplica(passo)}
        aria-label={`Aumentar ${label}`}
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface text-lg font-bold text-ink"
      >
        +
      </button>
    </div>
  );
}
