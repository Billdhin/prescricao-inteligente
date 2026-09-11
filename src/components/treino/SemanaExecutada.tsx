import * as React from "react";
import { AlertTriangle, ChevronDown, ChevronLeft, ChevronRight, Dumbbell, HeartPulse } from "lucide-react";
import { Card, LinhaDeDose, LinhaDeTokens } from "@/components/ui/primitives";
import { TokenDose } from "@/components/gps/TermoDoseInfo";
import { nomeDoBloco, tokensDoBloco } from "@/components/student/blocoRegistro";
import { seriesFeitas, totalSeriesDe, type Execucao, type SessaoFeedback } from "@/data/execucao";
import { complementosDe, semanaAtual, sessaoDeHojeIndex, type BlocoSessao, type PlanoTreino, type Sessao } from "@/data/periodizacao";
import { bandaPse, rotuloFaixaPse, TINT_PSE } from "@/lib/pse";
import { cn } from "@/lib/utils";

/*
 * O QUE O ALUNO EXECUTOU, SEMANA A SEMANA.
 *
 * A aba Treino mostrava a execução como uma lista corrida dos oito últimos registros, cada
 * um solto ("Mesa flexora, 06 set, 17 kg, 14 reps"), com a prescrição às vezes ao lado e às
 * vezes não. Para decidir a próxima semana o profissional precisa da comparação arrumada do
 * jeito que o treino aconteceu: por SESSÃO, e dentro dela cada exercício com o que foi
 * prescrito, o que foi feito e a diferença. É o desenho do protótipo da plataforma.
 *
 * Tudo aqui é leitura do que já existe (o plano e os registros do app do aluno). Nada é
 * estimado: o plano não prescreve quilos, então a diferença é medida em séries e
 * repetições, que é o que a prescrição de fato diz. A carga aparece no executado, como dado.
 */

const SEMANA_MS = 7 * 86_400_000;
const DIAS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const MENOS = "−";

const inicioDoDia = (ts: number) => new Date(ts).setHours(0, 0, 0, 0);
const mesmoDia = (a: number, b: number) => inicioDoDia(a) === inicioDoDia(b);
const fmtVirgula = (n: number) => String(n).replace(".", ",");

/** "10 a 16 set", ou "28 set a 04 out" quando a semana vira o mês. */
function faixaDeDatas(inicio: number, fim: number): string {
  const a = new Date(inicio);
  const b = new Date(fim);
  const dd = (d: Date) => String(d.getDate()).padStart(2, "0");
  return a.getMonth() === b.getMonth()
    ? `${dd(a)} a ${dd(b)} ${MESES[b.getMonth()]}`
    : `${dd(a)} ${MESES[a.getMonth()]} a ${dd(b)} ${MESES[b.getMonth()]}`;
}

/** "quarta, 09 set" */
function diaDaSessao(ts: number): string {
  const d = new Date(ts);
  const semana = new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(d).replace(/-feira$/, "");
  return `${semana}, ${String(d.getDate()).padStart(2, "0")} ${MESES[d.getMonth()]}`;
}

/** O identificador curto da sessão, tirado do NOME dela ("Sessão B · Superiores" vira B, "Sessão 2" vira 2). */
function marcaDaSessao(s: Sessao, i: number): string {
  const m = s.nome.split(/[·(]/)[0].trim().match(/([A-Z]|\d+)$/);
  return m ? m[1] : String(i + 1);
}

const ehSustentado = (b: BlocoSessao) => b.tipo === "isometrico";

/** A dose da semana em uma linha curta, na ordem em que o plano a escreve. */
function prescritoDoBloco(b: BlocoSessao): string {
  if (b.tipo === "aerobio") return b.duracaoAlvoMin != null ? `${b.duracaoAlvoMin} min` : b.duracao?.trim() || "contínuo";
  if (ehSustentado(b)) return [b.series?.trim(), b.duracao?.trim()].filter(Boolean).join(" x ") || "sustentação";
  const base =
    b.seriesAlvo != null && b.repsAlvo != null
      ? `${b.seriesAlvo} x ${b.repsAlvo}`
      : [b.series?.trim(), b.reps?.trim()].filter(Boolean).join(" x ");
  return b.rirAlvo != null ? `${base} · RIR ${b.rirAlvo}` : base;
}

function detalheDoBloco(b: BlocoSessao, complemento: boolean): string {
  if (b.tipo === "aerobio") return complemento ? "aeróbio · complemento" : "aeróbio";
  if (ehSustentado(b)) return b.sustentado ? "por tempo" : "isométrico";
  const total = totalSeriesDe(b);
  return total > 1 ? `${total} séries` : "série única";
}

/** Faixa de valores sem repetir o que é igual: [13,13] vira "13"; [13,12] vira "13/12". */
function valores(ns: number[]): string {
  const unicos = [...new Set(ns)];
  return unicos.length === 1 ? String(unicos[0]) : ns.join("/");
}

export type TomDelta = "ok" | "abaixo" | "falta" | "acima" | "neutro";

export interface LinhaExecutada {
  bloco: BlocoSessao;
  nome: string;
  detalhe: string;
  prescrito: string;
  /** null = nada registrado para este exercício nesta semana */
  executado: string | null;
  delta: { texto: string; tom: TomDelta };
}

export interface SessaoDaSemana {
  sessao: Sessao;
  indice: number;
  marca: string;
  realizada: boolean;
  /** todos os blocos com as séries prescritas registradas */
  completa: boolean;
  quando?: number;
  feedback?: SessaoFeedback;
  linhas: LinhaExecutada[];
  /** exercícios abaixo do prescrito (repetições a menos ou séries faltando) */
  abaixo: number;
  /** a próxima sessão do aluno, a mesma que o app dele abre */
  proxima: boolean;
}

export interface ResumoSemana {
  semana: number;
  inicio: number;
  fim: number;
  sessoes: SessaoDaSemana[];
  principaisFeitas: number;
  principaisTotal: number;
  seriesFeitas: number;
  seriesPrescritas: number;
  /** repetições feitas contra as prescritas nas séries feitas, em %; null sem dado */
  repsPct: number | null;
  pseMedio: number | null;
  abaixoDoPrescrito: string[];
  dias: { ts: number; feito: boolean; hoje: boolean }[];
}

function linhaDoBloco(b: BlocoSessao, execs: Execucao[], semana: number, complemento: boolean): LinhaExecutada & { feitas: number; total: number; repsFeitas: number; repsPrescritas: number } {
  const feitas = seriesFeitas(execs, semana, b.id);
  const total = totalSeriesDe(b);
  const legado = feitas.some((e) => e.serie == null);
  const nFeitas = legado ? total : Math.min(feitas.length, total);
  const base = { bloco: b, nome: nomeDoBloco(b), detalhe: detalheDoBloco(b, complemento), prescrito: prescritoDoBloco(b), feitas: 0, total, repsFeitas: 0, repsPrescritas: 0 };

  if (feitas.length === 0) return { ...base, executado: null, delta: { texto: "sem registro", tom: "neutro" } };

  if (b.tipo === "aerobio" || ehSustentado(b)) {
    const parcial = !legado && total > 1 && nFeitas < total;
    return {
      ...base,
      feitas: nFeitas,
      executado: parcial ? `${nFeitas} de ${total} séries` : "concluído",
      delta: parcial ? { texto: `${nFeitas} de ${total} séries`, tom: "falta" } : { texto: "em dia", tom: "ok" },
    };
  }

  const reps = feitas.map((e) => e.repsFeitas).filter((n): n is number => n != null);
  const cargas = feitas.map((e) => e.cargaFeita).filter((n): n is number => n != null);
  const partes: string[] = [];
  if (reps.length) partes.push(`${valores(reps)} reps`);
  if (cargas.length) {
    const min = Math.min(...cargas);
    const max = Math.max(...cargas);
    partes.push(min === max ? `${fmtVirgula(min)} kg` : `${fmtVirgula(min)} a ${fmtVirgula(max)} kg`);
  }
  const executado = partes.join(" · ") || "registrado";
  const repsFeitas = reps.reduce((s, n) => s + n, 0);
  const repsPrescritas = b.repsAlvo != null && reps.length ? b.repsAlvo * reps.length : 0;

  let delta: LinhaExecutada["delta"];
  if (!legado && nFeitas < total) delta = { texto: `${nFeitas} de ${total} séries`, tom: "falta" };
  else if (b.repsAlvo != null && reps.length) {
    const d = Math.min(...reps) - b.repsAlvo;
    delta =
      d < 0
        ? { texto: `${MENOS}${-d} ${d === -1 ? "rep" : "reps"}`, tom: "abaixo" }
        : d > 0
          ? { texto: `+${d} ${d === 1 ? "rep" : "reps"}`, tom: "acima" }
          : { texto: "em dia", tom: "ok" };
  } else delta = { texto: "em dia", tom: "ok" };

  return { ...base, feitas: nFeitas, executado, delta, repsFeitas, repsPrescritas };
}

/**
 * A SEMANA DO PLANO LIDA A PARTIR DOS REGISTROS: uma função só, para o cartão da execução e
 * para o aviso "Atenção da semana" dizerem a mesma coisa. Recebe só os registros do plano.
 */
export function resumoDaSemana(
  plano: PlanoTreino,
  semana: number,
  execucoes: Execucao[],
  feedbacks: SessaoFeedback[],
  agora = Date.now(),
): ResumoSemana {
  const execs = execucoes.filter((e) => e.planoId === plano.id);
  const fbs = feedbacks.filter((f) => f.planoId === plano.id && f.semana === semana);
  const micro = plano.macrociclo.mesociclos.flatMap((m) => m.microciclos).find((mc) => mc.semana === semana);
  const sessoesMicro = micro?.sessoes ?? [];
  const corrente = semana === semanaAtual(plano, agora);
  const idxProxima = corrente ? sessaoDeHojeIndex(plano, execucoes, agora) : -1;

  let seriesFeitasTot = 0;
  let seriesPrescritas = 0;
  let repsFeitas = 0;
  let repsPrescritas = 0;
  const abaixoDoPrescrito: string[] = [];

  const sessoes: SessaoDaSemana[] = sessoesMicro.map((s, i) => {
    const complemento = Boolean(s.complemento);
    const feedback = fbs.filter((f) => f.sessaoRef === s.id).sort((a, b) => b.concluidaEm - a.concluidaEm)[0];
    const doSessao = execs.filter((e) => e.semana === semana && e.sessaoRef === s.id);
    const realizada = Boolean(feedback) || doSessao.length > 0;
    const brutas = s.blocos.map((b) => linhaDoBloco(b, execs, semana, complemento));
    if (realizada) {
      for (const l of brutas) {
        if (l.bloco.tipo !== "aerobio" && !ehSustentado(l.bloco) && l.total > 1) {
          seriesPrescritas += l.total;
          seriesFeitasTot += l.feitas;
        }
        repsFeitas += l.repsFeitas;
        repsPrescritas += l.repsPrescritas;
        if (l.delta.tom === "abaixo" || l.delta.tom === "falta") abaixoDoPrescrito.push(l.nome);
      }
    }
    const linhas: LinhaExecutada[] = brutas.map(({ bloco, nome, detalhe, prescrito, executado, delta }) => ({ bloco, nome, detalhe, prescrito, executado, delta }));
    const ultimos = doSessao.map((e) => e.concluidoEm);
    return {
      sessao: s,
      indice: i,
      marca: marcaDaSessao(s, i),
      realizada,
      completa: realizada && brutas.every((l) => l.executado != null && l.delta.tom !== "falta"),
      quando: feedback?.concluidaEm ?? (ultimos.length ? Math.max(...ultimos) : undefined),
      feedback,
      linhas,
      abaixo: realizada ? brutas.filter((l) => l.delta.tom === "abaixo" || l.delta.tom === "falta").length : 0,
      proxima: i === idxProxima && !realizada,
    };
  });

  const principais = sessoes.filter((s) => !s.sessao.complemento);
  const notas = fbs.map((f) => f.pse).filter((n): n is number => n != null);
  const inicio = inicioDoDia(plano.data + (semana - 1) * SEMANA_MS);
  const registrosDaSemana = [
    ...execs.filter((e) => e.semana === semana).map((e) => e.concluidoEm),
    ...fbs.map((f) => f.concluidaEm),
  ];
  const dias = Array.from({ length: 7 }, (_, k) => {
    const ts = new Date(inicio).setDate(new Date(inicio).getDate() + k);
    return { ts, feito: registrosDaSemana.some((r) => mesmoDia(r, ts)), hoje: mesmoDia(ts, agora) };
  });

  return {
    semana,
    inicio,
    fim: dias[6].ts,
    sessoes,
    principaisFeitas: principais.filter((s) => s.realizada).length,
    principaisTotal: principais.length,
    seriesFeitas: seriesFeitasTot,
    seriesPrescritas,
    repsPct: repsPrescritas > 0 ? Math.round((repsFeitas / repsPrescritas - 1) * 100) : null,
    pseMedio: notas.length ? Math.round((notas.reduce((s, n) => s + n, 0) / notas.length) * 10) / 10 : null,
    abaixoDoPrescrito: [...new Set(abaixoDoPrescrito)],
    dias,
  };
}

/**
 * Selo do PSE da sessão: número + rótulo da faixa (ex.: "7 · Intenso"), com o par
 * tint + texto da mesma família (AA garantido, padrão da onda C).
 */
export function PseBadge({ pse, prefixo, className }: { pse: number; prefixo?: boolean; className?: string }) {
  const { familia } = bandaPse(pse);
  const { rotulo } = rotuloFaixaPse(pse);
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold", TINT_PSE[familia], className)}>
      {prefixo && <span className="mr-1 font-semibold">PSE</span>}
      {pse}
      {rotulo && <span className="ml-1 font-semibold">· {rotulo.toLowerCase()}</span>}
    </span>
  );
}

const COR_DELTA: Record<TomDelta, string> = {
  ok: "text-success",
  acima: "text-primary",
  abaixo: "text-warning",
  falta: "text-danger",
  neutro: "text-ink-3",
};

function Numero({ rotulo, valor, sufixo, tom }: { rotulo: string; valor: string; sufixo?: string; tom?: string }) {
  return (
    <div className="min-w-0">
      <div className="text-2xs font-semibold uppercase tracking-[0.08em] text-ink-2">{rotulo}</div>
      <div className={cn("tabular font-display text-xl font-bold tracking-tight", tom ?? "text-ink")}>
        {valor}
        {sufixo && <span className="ml-1 font-sans text-[13px] font-medium tracking-normal text-ink-2">{sufixo}</span>}
      </div>
    </div>
  );
}

/** A dose do bloco com os mesmos tokens do app do aluno (o que ele vai ver quando abrir). */
function PrescricaoDaSessao({ sessao, rodape }: { sessao: Sessao; rodape?: React.ReactNode }) {
  return (
    <div className="space-y-2 pb-1">
      {sessao.foco && <p className="text-xs text-ink-2">{sessao.foco}</p>}
      {sessao.blocos.length > 0 && (
        <ul className="overflow-hidden rounded-control border border-border">
          {sessao.blocos.map((b) => {
            const tokens = tokensDoBloco(b);
            return (
              <LinhaDeDose
                key={b.id}
                nome={nomeDoBloco(b)}
                icon={b.tipo === "aerobio" ? <HeartPulse className="h-4 w-4" /> : <Dumbbell className="h-4 w-4" />}
              >
                {tokens.length > 0 && (
                  <LinhaDeTokens>
                    {tokens.map((t) => (
                      <TokenDose key={t.label} label={t.label} value={t.value} />
                    ))}
                  </LinhaDeTokens>
                )}
              </LinhaDeDose>
            );
          })}
        </ul>
      )}
      {sessao.fecho && (
        <p className="rounded-control border border-l-2 border-border border-l-primary bg-surface-soft p-2.5 text-xs text-ink-2">
          {sessao.fecho}
        </p>
      )}
      {rodape}
    </div>
  );
}

function Avatar({
  marca,
  realizada,
  complemento,
  recente,
}: {
  marca: string;
  realizada: boolean;
  complemento?: boolean;
  /** a sessão feita mais recente leva o avatar escuro; as anteriores, o claro */
  recente?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid h-9 w-9 shrink-0 place-items-center rounded-[11px] font-display text-[13px] font-bold",
        realizada
          ? complemento
            ? "bg-analysis-tint text-analysis-text"
            : recente
              ? "bg-ink text-surface"
              : "bg-bg text-ink"
          : "border-[1.5px] border-dashed border-ink-3/25 text-ink-2",
      )}
    >
      {marca}
    </span>
  );
}

/**
 * Uma sessão feita. Só a MAIS RECENTE ganha o fundo e o avatar escuro, como no protótipo:
 * com todas destacadas, nenhuma estava, e o olho não achava a última sessão da semana.
 */
function SessaoRealizada({ s, recente }: { s: SessaoDaSemana; recente?: boolean }) {
  const nota = s.feedback?.observacao;
  return (
    <li className="border-b border-surface-mute">
      <div className={cn("flex flex-wrap items-center gap-3 px-5 py-3.5", recente && "bg-surface-soft")}>
        <Avatar marca={s.marca} realizada complemento={s.sessao.complemento} recente={recente} />
        <div className="min-w-0 flex-1 basis-48">
          <p className="truncate text-[14.5px] font-bold text-ink">{s.sessao.nome}</p>
          <p className="text-[12.5px] text-ink-2">
            {s.quando != null ? diaDaSessao(s.quando) : "data não registrada"}
            {s.feedback?.duracaoMin != null && ` · ${s.feedback.duracaoMin} min`}
            {s.sessao.complemento && " · complemento"}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {s.feedback?.pse != null && <PseBadge pse={s.feedback.pse} prefixo className="px-[9px] py-1 text-[11.5px]" />}
          {s.abaixo > 0 ? (
            <span className="inline-flex items-center rounded-full bg-warning-tint px-[9px] py-1 text-[11.5px] font-bold text-warning">
              {s.abaixo} abaixo do prescrito
            </span>
          ) : s.completa ? (
            <span className="inline-flex items-center rounded-full bg-success-tint px-[9px] py-1 text-[11.5px] font-bold text-success">
              em dia
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-surface px-[9px] py-1 text-[11.5px] font-bold text-ink-2 ring-1 ring-inset ring-border">
              registro parcial
            </span>
          )}
        </div>
      </div>

      <div className="px-5 pb-3.5">
        {/* Quatro colunas a partir de sm; no celular, o executado leva o prescrito e a
            diferença embaixo dele, como no protótipo, em vez de espremer quatro colunas. */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 border-b border-surface-mute py-1.5 text-2xs font-semibold uppercase tracking-[0.06em] text-ink-2 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_88px]">
          <span>Exercício</span>
          <span className="text-right sm:hidden">Executado · Δ</span>
          <span className="hidden sm:block">Prescrito</span>
          <span className="hidden sm:block">Executado</span>
          <span className="hidden text-right sm:block">
            <abbr title="Diferença entre o executado e o prescrito" className="no-underline">Δ</abbr>
          </span>
        </div>
        <ul>
          {s.linhas.map((l) => (
            <li
              key={l.bloco.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 border-b border-surface-mute/60 py-[9px] text-[13px] last:border-b-0 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_88px]"
            >
              <span className="min-w-0">
                <span className="block truncate font-semibold text-ink">{l.nome}</span>
                <span className="block truncate text-[11.5px] text-ink-2">{l.detalhe}</span>
              </span>
              <span className="tabular hidden text-ink-2 sm:block">{l.prescrito}</span>
              <span className={cn("tabular hidden font-semibold sm:block", l.executado ? "text-ink" : "font-normal text-ink-3")}>
                {l.executado ?? "não registrado"}
              </span>
              <span className={cn("tabular hidden whitespace-nowrap text-right font-bold sm:block", COR_DELTA[l.delta.tom])}>{l.delta.texto}</span>
              <span className="tabular text-right sm:hidden">
                <span className={cn("block font-semibold", l.executado ? "text-ink" : "font-normal text-ink-3")}>
                  {l.executado ?? "não registrado"}
                </span>
                <span className="block text-[11.5px] text-ink-2">
                  de {l.prescrito} · <b className={cn("font-bold", COR_DELTA[l.delta.tom])}>{l.delta.texto}</b>
                </span>
              </span>
            </li>
          ))}
        </ul>
        {nota && (
          <blockquote className="mt-3 rounded-r-[10px] border-l-[3px] border-primary bg-primary-tint/50 px-3 py-2.5 text-[13px] leading-normal text-ink">
            “{nota}”
            <span className="mt-1 block text-[11.5px] text-ink-2">recado do aluno</span>
          </blockquote>
        )}
      </div>
    </li>
  );
}

function SessaoPendente({
  titulo,
  subtitulo,
  marca,
  aberta,
  onAlternar,
  children,
}: {
  titulo: string;
  subtitulo: string;
  marca: string;
  aberta: boolean;
  onAlternar: () => void;
  children: React.ReactNode;
}) {
  const id = React.useId();
  return (
    <li className="border-b border-surface-mute">
      <div className="flex flex-wrap items-center gap-3 px-5 py-3.5">
        <Avatar marca={marca} realizada={false} />
        <div className="min-w-0 flex-1 basis-48">
          <p className="truncate text-[14.5px] font-semibold text-ink">{titulo}</p>
          <p className="text-[12.5px] text-ink-2">{subtitulo}</p>
        </div>
        <button
          type="button"
          onClick={onAlternar}
          aria-expanded={aberta}
          aria-controls={id}
          className="inline-flex min-h-[36px] items-center gap-1 rounded-control px-2 text-[12.5px] font-semibold text-primary hover:bg-primary-tint"
        >
          {aberta ? "Esconder" : "Ver o que está prescrito"}
          <ChevronDown className={cn("h-4 w-4 transition-transform", aberta && "rotate-180")} aria-hidden />
        </button>
      </div>
      {aberta && (
        <div id={id} className="px-5 pb-4">
          {children}
        </div>
      )}
    </li>
  );
}

export function SemanaExecutada({
  plano,
  execucoes,
  feedbacks,
  rodapeDaProxima,
}: {
  plano: PlanoTreino;
  /** registros do aluno (a função separa os deste plano) */
  execucoes: Execucao[];
  feedbacks: SessaoFeedback[];
  /** o que acompanha a próxima sessão quando ela é aberta (as escalas do dia) */
  rodapeDaProxima?: React.ReactNode;
}) {
  const atual = semanaAtual(plano);
  const [semana, setSemana] = React.useState(atual);
  const [abertas, setAbertas] = React.useState<Set<string>>(() => new Set());
  // Trocar de plano (outro aluno, plano regerado) volta para a semana corrente.
  React.useEffect(() => setSemana(semanaAtual(plano)), [plano.id]);

  const r = React.useMemo(() => resumoDaSemana(plano, semana, execucoes, feedbacks), [plano, semana, execucoes, feedbacks]);
  const alternar = (k: string) =>
    setAbertas((s) => {
      const n = new Set(s);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });

  const feitas = r.sessoes.filter((s) => s.realizada).sort((a, b) => (b.quando ?? 0) - (a.quando ?? 0));
  const pendentes = r.sessoes.filter((s) => !s.realizada && !s.sessao.complemento);
  const complementosPendentes = r.sessoes.filter((s) => !s.realizada && s.sessao.complemento);
  const nadaFeito = feitas.length === 0;
  const corrente = semana === atual;
  const repsTexto =
    r.repsPct == null ? "sem dado" : Math.abs(r.repsPct) < 1 ? "em dia" : `${r.repsPct > 0 ? "+" : MENOS}${Math.abs(r.repsPct)}%`;
  const repsTom = r.repsPct == null ? "text-ink-3" : r.repsPct <= -5 ? "text-warning" : r.repsPct >= 0 ? "text-success" : "text-ink";
  const nComplementos = complementosDe(r.sessoes.map((s) => s.sessao)).length;

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-surface-mute px-5 pb-4 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <h2 className="font-display text-[17px] font-bold text-ink">O que o aluno executou</h2>
          {/* A navegação de semanas É o histórico: a semana passada fica a um toque, com a
              mesma leitura, em vez de uma lista corrida de registros soltos. */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSemana((s) => Math.max(1, s - 1))}
              disabled={semana <= 1}
              aria-label="Semana anterior"
              className="grid h-9 w-9 place-items-center rounded-control text-ink-2 hover:bg-surface-soft hover:text-ink disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="tabular min-w-0 text-[12.5px] text-ink-2">
              <b className="font-semibold text-ink">Semana {semana}</b> · {faixaDeDatas(r.inicio, r.fim)}
            </span>
            <button
              type="button"
              onClick={() => setSemana((s) => Math.min(atual, s + 1))}
              disabled={semana >= atual}
              aria-label="Próxima semana"
              className="grid h-9 w-9 place-items-center rounded-control text-ink-2 hover:bg-surface-soft hover:text-ink disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {nadaFeito ? (
          <p className="mt-3 text-sm text-ink-2">
            {corrente ? "Nada registrado nesta semana ainda." : "Nenhuma sessão registrada nesta semana."}
            {semana > 1 && (
              <button
                type="button"
                onClick={() => setSemana(semana - 1)}
                className="ml-1.5 font-semibold text-primary hover:underline"
              >
                Ver a semana {semana - 1}
              </button>
            )}
          </p>
        ) : (
          <div className="mt-3.5 grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-4">
            <Numero rotulo="Sessões" valor={String(r.principaisFeitas)} sufixo={`de ${r.principaisTotal}`} />
            <Numero
              rotulo="Séries"
              valor={r.seriesPrescritas ? String(r.seriesFeitas) : "sem dado"}
              sufixo={r.seriesPrescritas ? `de ${r.seriesPrescritas}` : undefined}
              tom={r.seriesPrescritas && r.seriesFeitas < r.seriesPrescritas ? "text-warning" : undefined}
            />
            <Numero rotulo="Reps vs prescrito" valor={repsTexto} tom={repsTom} />
            <Numero rotulo="Esforço médio" valor={r.pseMedio != null ? fmtVirgula(r.pseMedio) : "sem dado"} sufixo={r.pseMedio != null ? "PSE" : undefined} />
          </div>
        )}

        <div className="mt-4 grid grid-cols-7 gap-1.5">
          {r.dias.map((d) => {
            const data = new Date(d.ts);
            return (
              <div
                key={d.ts}
                className={cn(
                  "rounded-control border px-1 py-2 text-center",
                  d.hoje ? "border-primary bg-primary-tint/50" : d.feito ? "border-success-fill/20 bg-success-tint/60" : "border-border bg-surface",
                )}
              >
                <span className="block text-2xs font-bold tracking-wide text-ink-2">{DIAS[data.getDay()]}</span>
                <b className="tabular mt-0.5 block text-sm text-ink">{data.getDate()}</b>
                <span
                  className={cn(
                    "mt-0.5 block truncate text-2xs font-bold",
                    d.feito ? "text-success" : d.hoje ? "text-primary" : "text-ink-3",
                  )}
                >
                  {d.feito ? "feita" : d.hoje ? "hoje" : " "}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <ul>
        {feitas.map((s, i) => (
          <SessaoRealizada key={s.sessao.id} s={s} recente={i === 0} />
        ))}
        {pendentes.map((s) => (
          <SessaoPendente
            key={s.sessao.id}
            titulo={s.sessao.nome}
            subtitulo={s.proxima ? "próxima sessão, é a que o app do aluno abre" : corrente ? "ainda não realizada" : "não realizada"}
            marca={s.marca}
            aberta={abertas.has(s.sessao.id)}
            onAlternar={() => alternar(s.sessao.id)}
          >
            <PrescricaoDaSessao sessao={s.sessao} rodape={s.proxima ? rodapeDaProxima : undefined} />
          </SessaoPendente>
        ))}
        {complementosPendentes.length > 0 && (
          <SessaoPendente
            titulo={
              complementosPendentes.length === 1
                ? complementosPendentes[0].sessao.nome
                : `${complementosPendentes.length} complementos da semana`
            }
            subtitulo={[
              complementosPendentes.length === nComplementos ? "cabem no dia de uma sessão principal" : "",
              `${corrente ? "ainda não " : "não "}${complementosPendentes.length === 1 ? "realizado" : "realizados"}`,
            ]
              .filter(Boolean)
              .join(" · ")}
            marca={complementosPendentes.length === 1 ? complementosPendentes[0].marca : "+"}
            aberta={abertas.has("complementos")}
            onAlternar={() => alternar("complementos")}
          >
            <div className="space-y-3">
              {complementosPendentes.map((s) => (
                <div key={s.sessao.id}>
                  {complementosPendentes.length > 1 && <p className="mb-1 text-xs font-semibold text-ink">{s.sessao.nome}</p>}
                  <PrescricaoDaSessao sessao={s.sessao} />
                </div>
              ))}
            </div>
          </SessaoPendente>
        )}
      </ul>

      <p className="border-t border-surface-mute px-5 pb-4 pt-3 text-xs text-ink-2">
        Δ compara o executado com o prescrito da semana, em séries e repetições. O plano não prescreve quilos, então a
        carga aparece como dado.
      </p>
    </Card>
  );
}

/**
 * ATENÇÃO DA SEMANA: o aviso que só aparece quando há o que conferir. Lê o mesmo resumo do
 * cartão da execução, então a frase e a tabela nunca discordam.
 */
export function AtencaoDaSemana({ resumo }: { resumo: ResumoSemana }) {
  const n = resumo.abaixoDoPrescrito.length;
  if (n === 0) return null;
  const pse = resumo.pseMedio;
  const alto = pse != null && pse >= 6;
  const nomes = resumo.abaixoDoPrescrito.slice(0, 3).join(", ") + (n > 3 ? ` e mais ${n - 3}` : "");
  return (
    <div className="rounded-card border border-warning-fill/40 bg-warning-tint p-5">
      <p className="text-2xs font-bold uppercase tracking-[0.12em] text-warning">Atenção da semana {resumo.semana}</p>
      <p className="mt-2 text-[13.5px] leading-normal text-ink">
        O executado ficou <b>abaixo do prescrito em {n} {n === 1 ? "exercício" : "exercícios"}</b>
        {alto && (
          <>
            , com esforço médio de {fmtVirgula(pse!)} ({rotuloFaixaPse(pse!).rotulo.toLowerCase()})
          </>
        )}
        : {nomes}. Vale conferir se a dose da semana está adequada antes de progredir.
      </p>
    </div>
  );
}
