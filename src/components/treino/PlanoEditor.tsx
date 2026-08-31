import { FORMATOS_AEROBIOS_LISTA, aplicarFormatoAerobio, formatoPeloNome } from "@/lib/gps/formatoAerobio";
import { toastDesfazer } from "@/lib/toast";
import type { ModeloPeriodizacaoId } from "@/data/periodizacao";
import * as React from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  Repeat,
  TrendingUp,
  Target,
  Info,
  BookOpen,
  Plus,
  Trash2,
  AlertTriangle,
  CalendarCheck,
  Dumbbell,
  HeartPulse,
  Replace,
  Search,
  X,
  Lock,
  LockOpen,
  ExternalLink,
} from "lucide-react";
import { Card, Pill, buttonClasses, Eyebrow, TokenRotulado, LinhaDeTokens, type PillTone } from "@/components/ui/primitives";
import { TokenDose } from "@/components/gps/TermoDoseInfo";
import { cn, withBase } from "@/lib/utils";
import {
  getFaixa,
  getModelo,
  rotuloMeso,
  TEND_LABEL,
  valorFaixa,
  type Macrociclo,
  type Mesociclo,
  type Microciclo,
  type Sessao,
  type BlocoSessao,
  type TipoMicrociclo,
  type MetodoSerie,
  type VariavelTravavel,
  METODOS_SERIE,
  getMetodo,
  agruparBlocosPorMetodo,
} from "@/data/periodizacao";
import { recalcularAlvosDoMeso } from "@/lib/gps/travas";
import { parametrosInvalidosDe } from "@/lib/gps/farmacos";
import { efeitoDaEdicao, formatarDelta, type EfeitoDaEdicao } from "@/lib/gps/efeitoDaEdicao";
import type { FarmacoSelecionado } from "@/data/farmacos";
import { conferirFaixa, faixaSugerida, type CampoFaixa } from "@/lib/gps/faixas";
import { desenharProgressao, posicoesFocos, estadoSemana, ESTADO_LABEL, type EstadoSemana } from "@/lib/gps/progressao";
import {
  temAlvoForca,
  tokensAlvoForca,
  temAlvoAerobio,
  tokensAlvoAerobio,
  compararAlvos,
  regrasDaSessao,
} from "@/lib/gps/alvoResumo";
import { adequacaoLabel, EQUIPAMENTOS, type GpsObjetivo, type Recommendation } from "@/lib/gps/engine";
import { sugerirTroca, type ContextoTroca } from "@/lib/gps/sugerirTroca";
import type { RestricaoSelecionada } from "@/lib/gps/restricoes";
import type { Nivel } from "@/data/types";
import { getParam } from "@/data/monitoringParameters";
import { getModalidade } from "@/data/modalities";
import { refCurta } from "@/data/referencias";
import { exercises } from "@/data/exercises";
import { uid } from "@/lib/store";
import { useDialog } from "@/lib/useDialog";

/**
 * Visualização e edição do macrociclo.
 *
 * O mesmo componente mostra e edita: `editavel` liga os campos. Cada nível da árvore
 * recebe o seu pedaço e devolve o pedaço alterado (`onChange`), então a página não
 * precisa saber navegar até uma série dentro de uma sessão dentro de uma semana.
 *
 * As faixas da diretriz aparecem uma vez por semana aberta, e o aviso de fora da faixa
 * é inline e não trava nada: a decisão é do profissional habilitado.
 */

const TIPO_LABEL: Record<TipoMicrociclo, string> = { carga: "Carga", deload: "Descarga", teste: "Teste" };

// Tom do selo de estado da semana: progressão em verde, regressão/descarga em âmbar, o resto
// neutro. Só cor; o estado é derivado do agregado real (ver estadoSemana), nunca inventado.
const ESTADO_TONE: Record<EstadoSemana, PillTone> = {
  progressao: "success",
  manutencao: "neutral",
  regressao: "warning",
  descarga: "warning",
  teste: "analysis",
  inicio: "neutral",
};

const nid = (p: string) => `${p}-${uid()}`;

export interface ContextoFaixa {
  objetivo: GpsObjetivo;
  nivel: Nivel;
  /** perfil do aluno para a troca segura (Trocar/Adicionar); ausente = plano avulso */
  restricoes?: RestricaoSelecionada[];
  equipamentos?: string[];
  grupoEspecial?: string;
  /** grupos adicionais confirmados do aluno; combinam-se ao principal na troca segura */
  condicoesAtencao?: string[];
  /**
   * Classes de medicação declaradas e o estado "não sei ou prefiro não informar": decidem se a
   * frequência cardíaca ainda guia a intensidade deste aluno (src/lib/gps/farmacos.ts).
   */
  farmacos?: FarmacoSelecionado[];
  farmacosNaoInformado?: boolean;
  /**
   * Idade e FCrep MEDIDA do aluno. Chegam aqui porque o recálculo do alvo ao travar uma
   * variável precisa delas para reconstruir a zona de FC igual à da geração. Sem elas o
   * recálculo perdia a personalização em silêncio, e a preservação da zona antiga mascarava.
   */
  idade?: number;
  fcRepouso?: number;
  /** resolve a data de exibição de uma prescrição pela id (selo "da prescrição de …") */
  prescricaoData?: (id: string) => string | undefined;
}

/** Monta o contexto de ranqueamento a partir do ContextoFaixa (defaults do Gps sem aluno). */
function ctxTrocaDe(ctx: ContextoFaixa): ContextoTroca {
  return {
    objetivo: ctx.objetivo,
    nivel: ctx.nivel,
    restricoes: ctx.restricoes ?? [],
    equipamentos: ctx.equipamentos ?? [...EQUIPAMENTOS],
    grupoEspecial: ctx.grupoEspecial,
    condicoesAtencao: ctx.condicoesAtencao,
    farmacos: ctx.farmacos,
    farmacosNaoInformado: ctx.farmacosNaoInformado,
  };
}

/** Há perfil de aluno que justifique ranquear (senão a ordem alfabética é mais previsível). */
function temContextoDeAluno(ctx: ContextoFaixa): boolean {
  return Boolean(ctx.grupoEspecial) || (ctx.restricoes?.length ?? 0) > 0;
}

/** Selo pequeno "da prescrição de {data}" para blocos vindos do tubo Aplicar no treino. */
function SeloOrigem({ ctx, bloco }: { ctx: ContextoFaixa; bloco: BlocoSessao }) {
  if (!bloco.origemPrescricaoId) return null;
  const data = ctx.prescricaoData?.(bloco.origemPrescricaoId);
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-surface-soft px-1.5 py-0.5 text-2xs font-medium text-ink-3">
      <Repeat className="h-2.5 w-2.5" aria-hidden />
      da prescrição{data ? ` de ${data}` : ""}
    </span>
  );
}

/* ================================ Gráfico ================================ */

/*
 * O GRÁFICO PRECISA DIZER DE QUE MODELO ELE É.
 *
 * O Filipe trocou o plano para "Periodização flexível", leu ao lado a explicação da flexível,
 * e o gráfico continuou o da ondulatória. A curva SEMANAL está certa e não podia mudar: no
 * único ensaio que compara os dois de frente (`colquhoun-flexivel-2017`) a flexível é a mesma
 * sessão com o aluno escolhendo a ORDEM, e o estudo mede que não há diferença de volume nem de
 * intensidade entre elas. Inventar uma curva diferente seria inventar um modelo.
 *
 * O que estava errado era o gráfico AFIRMAR uma ordem que a flexível não tem: cada semana
 * aparecia como uma sequência fechada, igual à da ondulatória. Agora, quando a ordem é aberta,
 * a marca da semana é vazada em vez de sólida e a legenda diz por quê. A leitura muda porque a
 * promessa mudou, e não porque o número mudou.
 */
export function GraficoProgressao({
  macro,
  nivel,
  modeloId,
}: {
  macro: Macrociclo;
  nivel?: Nivel;
  modeloId?: ModeloPeriodizacaoId;
}) {
  const ordemAberta = modeloId === "flexivel" || modeloId === "autorregulada";
  const g = desenharProgressao(macro, undefined, undefined, nivel);
  const gid = React.useId().replace(/:/g, "");
  // Só os tipos de semana que aparecem no plano entram na legenda (nunca "Teste" quando
  // não há semana de teste).
  const tiposPresentes = new Set(g.microTicks.map((t) => t.tipo));
  const tiposSemana = (["carga", "deload", "teste"] as TipoMicrociclo[]).filter((t) => tiposPresentes.has(t));

  return (
    <Card className="p-4">
      <div className="mb-1 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-ink-3" />
        <h3 className="font-display text-base font-bold text-ink">Progressão ao longo das semanas</h3>
      </div>
      {/*
        AS TRÊS LINHAS NÃO SÃO A MESMA CONTA, e omitir isso já enganou um professor testando
        a plataforma. Ele acrescentou quatro exercícios de membro superior numa sessão e viu
        a intensidade mexer 2,3%, e concluiu, com razão do ponto de vista dele, que o gráfico
        não estava acompanhando a edição. Estava: o VOLUME daquela semana subiu 23% no mesmo
        teste. A intensidade é uma MÉDIA de esforço, e média não sobe porque você acrescentou
        mais trabalho no mesmo esforço.

        Dizer "editar uma sessão move a curva" sem dizer QUAL curva e por quê é o que produz
        essa leitura. Soma e média reagem de formas opostas ao mesmo gesto, e quem lê precisa
        saber disso antes de olhar.
      */}
      <p className="mb-3 text-xs text-ink-3">
        Valores relativos, calculados das sessões (sem unidade absoluta). O nome de cada linha já diz como
        ela é calculada: <b>volume é soma</b>, então acrescentar exercício ou série sobe a linha;{" "}
        <b>esforço médio é média</b>, então ele sobe quando o treino fica mais pesado, e não quando fica mais
        longo. As faixas ao pé mostram cada fase e quantas semanas ela dura.
      </p>
      {/*
        POR QUE A CURVA NÃO MUDOU, dito antes de o profissional olhar para ela.
        O Filipe: "se deixa só o mesmo gráfico para o profissional é como se você não alterou
        nada". A curva é a mesma DE PROPÓSITO, e uma nota de rodapé não sustenta essa
        afirmação. O aviso vem antes do gráfico, com o achado do ensaio que a justifica, e
        aponta onde a diferença ESTÁ para ser conferida.
      */}
      {ordemAberta && (
        <div className="mb-3 rounded-lg border border-border bg-surface-soft p-3">
          <p className="text-xs font-semibold text-ink">Por que esta curva é igual à da periodização ondulatória</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-2">
            Porque neste modelo ela tem que ser. O volume e a intensidade da semana são os mesmos; o que muda é a ORDEM
            das sessões dentro da semana, escolhida no dia conforme a agenda e a resposta do aluno. No ensaio que
            compara os dois modelos de frente (Colquhoun, 2017), intensidade e volume não diferiram entre os grupos, e
            os ganhos foram semelhantes. Uma curva diferente aqui seria um modelo que ninguém estudou.
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-ink-2">
            A diferença está em outros dois lugares, e é neles que vale comparar: as sessões vêm por LETRA (A, B, C) e
            não por número, porque a semana é um conjunto e não uma sequência; e a marca de cada semana no gráfico vem
            tracejada, para lembrar que a dose da semana está fechada e a sequência dela não. Quando um dia cair, a
            escolha de qual sessão manter é sua.
          </p>
        </div>
      )}
      <div className="relative overflow-x-auto">
        <svg
          viewBox={`0 0 ${g.largura} ${g.altura}`}
          className="h-56 w-full min-w-[560px]"
          role="img"
          aria-label="Gráfico de progressão de volume, intensidade e complexidade por semana, com as fases do plano"
        >
          <defs>
            <linearGradient id={`vol-${gid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.16" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* faixas de fase (identidade de fase, Onda 4): tint alternado + rótulo da
              fase NO TOPO + divisória sólida de 1px na fronteira. O tint sozinho é
              ~1.16:1 e não lê; quem marca onde uma fase começa é a divisória e o rótulo. */}
          {g.fases.map((f) => (
            <g key={f.indice}>
              <rect
                x={f.x0}
                y={g.bandTop}
                width={f.x1 - f.x0}
                height={g.faixaBottom - g.bandTop}
                fill={f.indice % 2 === 0 ? "var(--surface-soft)" : "transparent"}
                opacity={0.5}
              />
              {f.indice > 0 && (
                <line x1={f.x0} y1={g.bandTop} x2={f.x0} y2={g.faixaBottom} stroke="var(--border)" strokeWidth={1} />
              )}
              {/* rótulo da fase no topo da faixa (marca onde cada fase começa) */}
              <text x={f.cx} y={10} textAnchor="middle" className="fill-ink" style={{ fontSize: 10, fontWeight: 700 }}>
                {f.nome}
              </text>
              {/* ícones do que se treina mais na fase, no topo */}
              {posicoesFocos(f, g.iconRowY).map((p, i) => (
                <g key={i} transform={p.transform} stroke="var(--ink-2)" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <title>{p.foco.label}</title>
                  {p.foco.glifo.paths.map((d, j) => (
                    <path key={j} d={d} />
                  ))}
                  {p.foco.glifo.circles?.map((c, j) => (
                    <circle key={`c${j}`} cx={c.cx} cy={c.cy} r={c.r} />
                  ))}
                </g>
              ))}
              {/* ao pé: só o intervalo de semanas (o nome da fase subiu para o topo) */}
              <text x={f.cx} y={g.faixaTop + 12} textAnchor="middle" className="fill-ink-3" style={{ fontSize: 10 }}>
                {f.spanSemanas}
                {f.temDescarga ? " · descarga" : ""}
              </text>
            </g>
          ))}

          {/* semanas de descarga */}
          {g.alivios.map((a, i) => (
            <rect key={i} x={a.x - a.w / 2} y={g.plot.top} width={a.w} height={g.plot.bottom - g.plot.top} fill="var(--warning)" opacity={0.07} rx={2} />
          ))}

          {/* eixo qualitativo */}
          <text x={g.eixo.x} y={g.eixo.maiorY} textAnchor="end" className="fill-ink-3" style={{ fontSize: 9 }}>maior</text>
          <text x={g.eixo.x} y={g.eixo.menorY} textAnchor="end" className="fill-ink-3" style={{ fontSize: 9 }}>menor</text>

          {/* área sob o volume + curvas suaves */}
          <path d={g.areaVolume} fill={`url(#vol-${gid})`} stroke="none" />
          {g.series.map((s) => (
            <path key={s.nome} d={s.d} fill="none" stroke={s.cor} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          ))}

          {/* régua de semanas (camada micro): um tick por microciclo, colorido pelo tipo
              da semana (carga, descarga, teste), com rótulo "S1..Sn" espaçado para o
              horizonte anual não sobrepor 48 números. */}
          {g.microTicks.map((t, i) => (
            <g key={i}>
              <line
                x1={t.x}
                y1={g.weekTickTop}
                x2={t.x}
                y2={g.weekTickBottom}
                stroke={t.tipo === "deload" ? "var(--warning)" : t.tipo === "teste" ? "var(--analysis)" : "var(--primary)"}
                strokeWidth={t.tipo === "carga" ? 1.5 : 2.5}
                strokeLinecap="round"
                // Marca VAZADA quando a ordem da semana é escolhida no dia: o tracejado é a
                // leitura de "sequência não fechada", e não um estado de erro.
                strokeDasharray={ordemAberta ? "2 2" : undefined}
              />
              {t.rotular && (
                <text x={t.x} y={g.weekLabelY} textAnchor="middle" className="fill-ink-3" style={{ fontSize: 9 }}>
                  S{t.semana}
                </text>
              )}
            </g>
          ))}
        </svg>
        {/* Affordance de rolagem: um fade no canto direito sugere que o gráfico continua. */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-surface" />
      </div>
      <div className="mt-2 flex flex-wrap gap-3">
        {g.series.map((s) => (
          <span key={s.nome} className="flex items-center gap-1.5 text-xs text-ink-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.cor }} /> {s.nome}
          </span>
        ))}
      </div>

      {tiposSemana.length > 0 && (
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-2xs font-semibold uppercase tracking-wide text-ink-3">Semanas</span>
          {tiposSemana.map((t) => (
            <span key={t} className="flex items-center gap-1.5 text-xs text-ink-2">
              <span
                className="h-3 w-0.5 rounded-full"
                style={{ background: t === "deload" ? "var(--warning)" : t === "teste" ? "var(--analysis)" : "var(--primary)" }}
              />
              {TIPO_LABEL[t]}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}

/* ================================ Mesociclo ================================ */

export function MesocicloCard({
  meso,
  indice,
  ctx,
  editavel,
  onChange,
  atual,
  semanaCorrente,
  reavaliarHref,
}: {
  meso: Mesociclo;
  indice: number;
  ctx: ContextoFaixa;
  editavel: boolean;
  onChange?: (m: Mesociclo) => void;
  /** este é o bloco em que o plano está hoje (pelo calendário) */
  atual?: boolean;
  /** semana corrente do plano, para destacar a semana e disparar a reavaliação */
  semanaCorrente?: number;
  /** destino do "Registrar reavaliação" (só quando há aluno com plano) */
  reavaliarHref?: string;
}) {
  // O bloco corrente abre por padrão ("você está aqui"); sem essa informação, o primeiro.
  const [aberto, setAberto] = React.useState(atual ?? indice === 0);

  /*
   * O EFEITO DA ÚLTIMA EDIÇÃO, guardado para ser mostrado em número.
   *
   * Sem isto, a única resposta ao gesto era a curva se redesenhar, e ninguém guarda de
   * memória onde ela estava dois segundos atrás. Foi assim que um professor concluiu que a
   * edição dele não tinha pegado (ver efeitoDaEdicao.ts).
   */
  const [efeito, setEfeito] = React.useState<EfeitoDaEdicao | null>(null);

  // A descarga vive na semana (`tipo`), não num campo à parte: mover a descarga de semana
  // tem que mudar o selo do bloco junto, senão o card diz uma coisa e o plano faz outra.
  const trocarMicro = (m: Microciclo) => {
    const anterior = meso.microciclos.find((w) => w.id === m.id);
    if (anterior) setEfeito(efeitoDaEdicao(anterior, m));
    const microciclos = meso.microciclos.map((w) => (w.id === m.id ? m : w));
    onChange?.({ ...meso, microciclos, deload: microciclos.some((w) => w.tipo === "deload") });
  };

  // Cadeado por variável (onda MP-6): travar/destravar volume/intensidade/complexidade. Uma
  // variável travada NÃO progride; ao travar/destravar, recalcula os alvos das semanas do bloco
  // (src/lib/gps/travas.ts) para o plano exibido refletir a decisão na hora.
  const travadas = meso.variaveisTravadas ?? [];
  const toggleTrava = (v: VariavelTravavel) => {
    const proximas = travadas.includes(v) ? travadas.filter((x) => x !== v) : [...travadas, v];
    const base: Mesociclo = { ...meso, variaveisTravadas: proximas.length ? proximas : undefined };
    onChange?.(
      recalcularAlvosDoMeso(base, {
        objetivo: ctx.objetivo,
        nivel: ctx.nivel,
        // Idade e FCrep: sem elas o recálculo devolvia um alvo despersonalizado.
        idade: ctx.idade,
        fcRepouso: ctx.fcRepouso,
        // E o perfil de medicação: sem isto, travar uma variável ressuscitaria a zona de FC
        // que o sistema decidiu que não guia este aluno.
        parametrosInvalidos: parametrosInvalidosDe(ctx.farmacos, {
          farmacosNaoInformado: ctx.farmacosNaoInformado,
          grupos: [ctx.grupoEspecial, ...(ctx.condicoesAtencao ?? [])],
        }),
      }),
    );
  };

  // "Registrar reavaliação": só quando o bloco pede reavaliação e o calendário já está
  // na última (ou penúltima) semana dele, e só quando há aluno para reavaliar.
  const mostrarReavaliar =
    Boolean(reavaliarHref) && meso.reavaliacao && semanaCorrente != null && semanaCorrente >= meso.semanaFim - 1;

  // Identidade de fase (Onda 4): filete petróleo no topo do header + disco de fase
  // com gradiente da marca. Cada bloco lê como uma etapa do ciclo.
  return (
    <Card className="overflow-hidden border-t-2 border-t-primary">
      <button
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        className="flex w-full items-start gap-3 p-4 text-left hover:bg-surface-soft"
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full gradient-brand text-sm font-bold text-white">{indice + 1}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display font-bold text-ink">{rotuloMeso(meso, indice)}</span>
            <span className="text-xs text-ink-3">
              semanas {meso.semanaInicio} a {meso.semanaFim}
            </span>
            {/* Teto de 3 selos: "em curso", "com descarga", "reavaliar ao fim". */}
            {atual && <Pill tone="primary">em curso</Pill>}
            {meso.deload && <Pill tone="neutral">com descarga</Pill>}
            {meso.reavaliacao && <Pill tone="analysis">reavaliar ao fim</Pill>}
          </div>
          <p className="mt-0.5 text-sm text-ink-2">{meso.foco}</p>
        </div>
        <ChevronDown className={cn("mt-1 h-4 w-4 shrink-0 text-ink-3 transition-transform", aberto && "rotate-180")} />
      </button>

      {aberto && (
        <div className="space-y-4 border-t border-border px-4 pb-4 pt-3">
          {/*
            O EFEITO DA EDIÇÃO, na hora e em número.
            Aparece acima das semanas porque é resposta ao gesto que a pessoa acabou de fazer,
            e some sozinho quando ela edita outra coisa que não muda nada mensurável.
          */}
          {efeito && (
            <div className="rounded-xl border border-analysis/30 bg-analysis-tint/40 p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-semibold text-ink">O que a sua edição mudou na semana {efeito.semana}</p>
                <button
                  onClick={() => setEfeito(null)}
                  className="rounded p-0.5 text-ink-3 hover:bg-surface hover:text-ink"
                  aria-label="Dispensar o resumo da edição"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2">
                {efeito.exerciciosAntes !== efeito.exerciciosDepois && (
                  <span>
                    <b className="text-ink">Exercícios</b> {efeito.exerciciosAntes} para {efeito.exerciciosDepois}
                  </span>
                )}
                <span>
                  <b className="text-ink">Volume (soma)</b> {formatarDelta(efeito.deltaVolume)}
                </span>
                <span>
                  <b className="text-ink">Esforço médio</b> {formatarDelta(efeito.deltaEsforco)}
                </span>
              </div>
              {efeito.leitura && <p className="mt-1.5 text-xs leading-relaxed text-ink-2">{efeito.leitura}</p>}
            </div>
          )}

          {/* (1) Semanas primeiro: é o que decide o que fazer AGORA para o professor com pressa. */}
          <div>
            <Eyebrow className="mb-1.5">Semanas</Eyebrow>
            <div className="space-y-2">
              {meso.microciclos.map((w, wi) => (
                <MicrocicloRow
                  key={w.id}
                  micro={w}
                  microAnterior={wi > 0 ? meso.microciclos[wi - 1] : undefined}
                  ctx={ctx}
                  editavel={editavel}
                  onChange={trocarMicro}
                  atual={semanaCorrente != null && w.semana === semanaCorrente}
                />
              ))}
            </div>
          </div>

          {/* (2) Dinâmica: as três tendências da fase, num cartão só, com o cadeado por variável. */}
          <div className="rounded-xl border border-border bg-surface-soft p-3">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="mr-0.5 text-2xs font-semibold uppercase tracking-wide text-ink-3">Dinâmica</span>
              <Pill tone={meso.tendenciaVolume === "sobe" ? "analysis" : "neutral"}>Volume {TEND_LABEL[meso.tendenciaVolume]}</Pill>
              {/* Mesmo vocabulário da série do gráfico: aqui é a MÉDIA do esforço da fase. */}
              <Pill tone={meso.tendenciaIntensidade === "sobe" ? "analysis" : "neutral"}>Esforço médio {TEND_LABEL[meso.tendenciaIntensidade]}</Pill>
              <Pill tone={meso.tendenciaComplexidade === "sobe" ? "analysis" : "neutral"}>Complexidade {TEND_LABEL[meso.tendenciaComplexidade]}</Pill>
            </div>
            {editavel ? (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="mr-0.5 text-2xs text-ink-3">Travar (não deixa progredir):</span>
                {(["volume", "intensidade", "complexidade"] as VariavelTravavel[]).map((v) => {
                  const on = travadas.includes(v);
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => toggleTrava(v)}
                      aria-pressed={on}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-2xs font-semibold transition-colors",
                        on ? "border-primary bg-primary-tint text-primary" : "border-border text-ink-2 hover:bg-surface",
                      )}
                    >
                      {on ? <Lock className="h-3 w-3" aria-hidden /> : <LockOpen className="h-3 w-3" aria-hidden />}
                      <span className="capitalize">{v}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              travadas.length > 0 && (
                <p className="mt-2 flex items-center gap-1 text-2xs font-medium text-ink-3">
                  <Lock className="h-3 w-3" aria-hidden /> Travado (não progride): {travadas.join(", ")}
                </p>
              )
            )}
          </div>

          {/* (3) O que treinar: identidade da fase (capacidades e modalidades). */}
          <div>
            <Eyebrow className="mb-1.5">O que treinar</Eyebrow>
            <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
              <ListaChips titulo="Capacidades priorizadas" itens={meso.capacidades} />
              <ListaChips
                titulo="Modalidades em foco"
                itens={(meso.modalidades ?? []).map((id) => getModalidade(id)?.nome ?? id)}
              />
            </div>
          </div>

          {/* (4) Reavaliação e critérios de decisão. */}
          {editavel && (
            <label className="flex items-center gap-2 rounded-xl bg-surface-soft p-2.5 text-sm text-ink-2">
              <input
                type="checkbox"
                checked={Boolean(meso.reavaliacao)}
                onChange={(e) => onChange?.({ ...meso, reavaliacao: e.target.checked })}
                className="h-4 w-4 accent-[var(--primary)]"
              />
              <CalendarCheck className="h-4 w-4 text-analysis" />
              Reavaliar ao fim deste bloco (semana {meso.semanaFim})
            </label>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <CriterioLista
              titulo="Progredir quando"
              itens={meso.criteriosProgressao}
              tone="success"
              editavel={editavel}
              onChange={(itens) => onChange?.({ ...meso, criteriosProgressao: itens })}
            />
            <CriterioLista
              titulo="Regredir ou revisar se"
              itens={meso.criteriosRegressao}
              tone="warning"
              editavel={editavel}
              onChange={(itens) => onChange?.({ ...meso, criteriosRegressao: itens })}
            />
          </div>

          {mostrarReavaliar && (
            <Link to={reavaliarHref!} className={buttonClasses("secondary", "sm")}>
              <CalendarCheck className="h-4 w-4" /> Registrar reavaliação
            </Link>
          )}

          {/* (5) Detalhes da fase: o que desce da leitura de relance para quem quiser aprofundar. */}
          <details className="rounded-lg border border-dashed border-border bg-surface-soft p-3 text-xs">
            <summary className="cursor-pointer list-none font-semibold text-ink-2 [&::-webkit-details-marker]:hidden">
              Detalhes da fase
            </summary>
            <div className="mt-3 grid gap-x-4 gap-y-3 sm:grid-cols-2">
              <ListaChips titulo="Tipos de exercício" itens={meso.tiposExercicio} />
              {meso.parametros.length > 0 && (
                <div>
                  <p className="mb-1 text-2xs font-semibold uppercase tracking-wide text-ink-3">Acompanhar</p>
                  <div className="flex flex-wrap gap-1.5">
                    {meso.parametros.map((id) => {
                      const p = getParam(id);
                      return p ? (
                        <Pill key={id} tone="neutral">
                          {p.sigla ?? p.nome}
                        </Pill>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </details>
        </div>
      )}
    </Card>
  );
}

/* ================================ Microciclo (semana) ================================ */

/**
 * Resumo dos métodos de série usados na semana ("2x Bi-set · 1x Drop-set"), para o método
 * ficar visível no nível do microciclo sem abrir cada sessão. Cada grupo (bi/tri/super-set)
 * conta UMA vez (é um par/trio, não dois exercícios soltos); métodos por bloco (drop-set,
 * rest-pause...) contam por bloco.
 */
function variacoesDoMicro(micro: Microciclo): { metodo: MetodoSerie; n: number }[] {
  const contagem = new Map<MetodoSerie, number>();
  const gruposVistos = new Set<string>();
  for (const s of micro.sessoes) {
    for (const b of s.blocos) {
      if (!b.metodo || b.metodo === "tradicional") continue;
      if (b.grupoMetodo) {
        if (gruposVistos.has(b.grupoMetodo)) continue;
        gruposVistos.add(b.grupoMetodo);
      }
      contagem.set(b.metodo, (contagem.get(b.metodo) ?? 0) + 1);
    }
  }
  return [...contagem.entries()].map(([metodo, n]) => ({ metodo, n }));
}

function MicrocicloRow({
  micro,
  microAnterior,
  ctx,
  editavel,
  onChange,
  atual,
}: {
  micro: Microciclo;
  /** a semana anterior no mesmo bloco: alimenta o selo de estado e o "o que mudou" */
  microAnterior?: Microciclo;
  ctx: ContextoFaixa;
  editavel: boolean;
  onChange: (m: Microciclo) => void;
  /** a semana corrente do plano: ganha destaque e abre por padrão */
  atual?: boolean;
}) {
  const [aberto, setAberto] = React.useState(Boolean(atual));
  const variacoes = variacoesDoMicro(micro);

  // Estado da semana (progressão/manutenção/regressão/descarga/teste), derivado do agregado
  // real vs a semana anterior. Descarga e teste já aparecem no selo "Semana N"; para as de
  // carga, o selo de estado diz para onde a dose foi. "o que mudou" lista as diferenças.
  const estado = estadoSemana(micro, microAnterior);
  const mostrarSeloEstado = micro.tipo === "carga" && estado !== "inicio";
  const mudancas = microAnterior ? compararAlvos(microAnterior, micro) : null;

  // Frequência é quantas sessões a semana tem. Guardar o número separado das sessões
  // deixaria o plano dizer "4x" e entregar 3.
  const trocarSessoes = (sessoes: Sessao[]) => onChange({ ...micro, sessoes, frequencia: sessoes.length });

  const addSessao = () =>
    trocarSessoes([...micro.sessoes, { id: nid("ses"), nome: `Sessão ${micro.sessoes.length + 1}`, blocos: [] }]);

  return (
    <div className={cn("rounded-xl border", atual ? "border-primary bg-primary-tint" : "border-border")}>
      <button
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        className="flex w-full items-start gap-2 p-2.5 text-left text-sm hover:bg-surface-soft"
      >
        {/* Duas linhas: o selo da semana com a contagem em cima, os nomes das sessões embaixo. */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone={micro.tipo === "deload" ? "warning" : micro.tipo === "teste" ? "analysis" : "neutral"}>
              Semana {micro.semana}
              {micro.tipo !== "carga" ? ` · ${TIPO_LABEL[micro.tipo]}` : ""}
            </Pill>
            <span className="text-ink-2">
              {micro.sessoes.length} {micro.sessoes.length === 1 ? "sessão" : "sessões"}
            </span>
            {mostrarSeloEstado && <Pill tone={ESTADO_TONE[estado]}>{ESTADO_LABEL[estado]}</Pill>}
          </div>
          {micro.sessoes.length > 0 && (
            <p className="truncate text-xs text-ink-3">{micro.sessoes.map((s) => s.nome).join(" · ")}</p>
          )}
          {variacoes.length > 0 && (
            <p className="truncate text-2xs text-ink-3">
              Variações: {variacoes.map((v) => `${v.n}x ${getMetodo(v.metodo)?.nome}`).join(" · ")}
            </p>
          )}
        </div>
        <ChevronDown className={cn("mt-0.5 h-4 w-4 shrink-0 text-ink-3 transition-transform", aberto && "rotate-180")} />
      </button>

      {aberto && (
        <div className="space-y-2 border-t border-border p-2.5">
          {editavel && (
            <div className="flex flex-wrap items-center gap-2">
              <Eyebrow>Tipo da semana</Eyebrow>
              {(["carga", "deload", "teste"] as TipoMicrociclo[]).map((t) => (
                <button
                  key={t}
                  onClick={() =>
                    onChange({
                      ...micro,
                      tipo: t,
                      nota: t === "deload" ? "Semana de descarga: reduza volume e intensidade para recuperar." : undefined,
                    })
                  }
                  aria-pressed={micro.tipo === t}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs transition-colors",
                    micro.tipo === t ? "border-primary bg-primary-tint font-semibold text-primary" : "border-border text-ink-2 hover:bg-surface",
                  )}
                >
                  {TIPO_LABEL[t]}
                </button>
              ))}
            </div>
          )}

          {micro.nota && <p className="text-xs text-ink-3">{micro.nota}</p>}

          {/* Objetivo declarado da semana (derivado da fase e do tipo). */}
          {micro.objetivo && (
            <p className="flex items-start gap-1.5 text-xs text-ink-2">
              <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-analysis" aria-hidden />
              <span>
                <span className="font-semibold text-ink">Objetivo da semana:</span> {micro.objetivo}
              </span>
            </p>
          )}

          {/* O que mudou em relação à semana anterior (só leitura; no editor os campos mudam à mão). */}
          {!editavel && mudancas && (
            <div className="rounded-lg border border-dashed border-border bg-surface-soft p-2.5">
              <p className="mb-1 flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide text-ink-3">
                <TrendingUp className="h-3.5 w-3.5 text-primary" aria-hidden /> Em relação à semana anterior
              </p>
              <ul className="space-y-0.5">
                {mudancas.map((m, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-ink-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-3" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <FaixaReferencia ctx={ctx} />

          {micro.sessoes.map((s) => (
            <SessaoBloco
              key={s.id}
              sessao={s}
              ctx={ctx}
              editavel={editavel}
              onChange={(nova) => trocarSessoes(micro.sessoes.map((x) => (x.id === s.id ? nova : x)))}
              onRemover={() => trocarSessoes(micro.sessoes.filter((x) => x.id !== s.id))}
            />
          ))}

          {editavel && (
            <button onClick={addSessao} className={buttonClasses("ghost", "sm")}>
              <Plus className="h-3.5 w-3.5" /> Adicionar sessão nesta semana
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ================================ Faixa da diretriz ================================ */

function FaixaReferencia({ ctx }: { ctx: ContextoFaixa }) {
  const f = getFaixa(ctx.objetivo);
  const linhas: [string, string, string | undefined][] = [
    ["séries", faixaSugerida(f.series, ctx.nivel), f.series.nota],
    ["repetições", faixaSugerida(f.reps, ctx.nivel), f.reps.nota],
    ["intensidade", faixaSugerida(f.intensidade, ctx.nivel), f.intensidade.nota],
    ["intervalo", faixaSugerida(f.intervalo, ctx.nivel), f.intervalo.nota],
  ];
  const refs = f.refIds.map(refCurta).filter(Boolean).join(" · ");

  return (
    <details className="rounded-lg border border-dashed border-border bg-surface-soft text-xs">
      <summary className="cursor-pointer list-none px-2.5 py-2 text-ink-2 [&::-webkit-details-marker]:hidden">
        <span className="font-semibold">Faixa de referência</span> ({ctx.objetivo}, {ctx.nivel}):{" "}
        {/* Só os valores em negrito: a linha toda em bold virava ruído (o dado é o número). */}
        {linhas.map(([rot, val], i) => (
          <React.Fragment key={rot}>
            {i > 0 ? " · " : ""}
            {rot} <span className="font-semibold text-ink">{val}</span>
          </React.Fragment>
        ))}
      </summary>
      <div className="space-y-1 border-t border-border px-2.5 py-2">
        {linhas.map(([rot, val, nota]) => (
          <p key={rot} className="text-ink-2">
            <span className="font-semibold text-ink">{rot}</span> {val}
            {nota && <span className="text-ink-3"> ({nota})</span>}
          </p>
        ))}
        <p className="text-ink-3">{f.ressalva}</p>
        {refs && <p className="text-ink-3">Base: {refs}.</p>}
      </div>
    </details>
  );
}

/* ================================ Sessão ================================ */

// Força e aeróbio se editam por variáveis diferentes. `confere` liga o aviso de fora da
// faixa só nos campos de força que a diretriz cobre (séries, repetições, intervalo).
type CampoBloco = {
  chave: "series" | "reps" | "intensidade" | "intervalo" | "formato" | "duracao" | "recuperacao" | "tiros";
  rotulo: string;
  confere?: CampoFaixa;
};
const CAMPOS_FORCA: CampoBloco[] = [
  { chave: "series", rotulo: "Séries", confere: "series" },
  { chave: "reps", rotulo: "Repetições", confere: "reps" },
  { chave: "intensidade", rotulo: "Intensidade" },
  { chave: "intervalo", rotulo: "Intervalo", confere: "intervalo" },
];
/*
 * "Tiros" só aparece nos formatos que TÊM tiro cronometrado, e por isso a lista é montada por
 * função em vez de ser uma constante.
 *
 * Um campo "Tiros" vazio no Contínuo seria pior que não ter campo: sugere que falta preencher
 * uma coisa que aquele formato não tem. E "Tempo de trabalho" substitui "Duração" no
 * intervalado porque lá o número NÃO é o tempo da sessão: é a soma dos tiros, sem as
 * recuperações. Chamar os dois de "Duração" foi o que fez o Filipe ler 5 a 10 min e entender
 * sessão inteira.
 */
const CAMPOS_AEROBIO: CampoBloco[] = [
  { chave: "formato", rotulo: "Formato" },
  { chave: "duracao", rotulo: "Duração" },
  { chave: "intensidade", rotulo: "Intensidade" },
  { chave: "recuperacao", rotulo: "Recuperação" },
];
const CAMPOS_AEROBIO_COM_TIROS: CampoBloco[] = [
  { chave: "formato", rotulo: "Formato" },
  { chave: "tiros", rotulo: "Tiros" },
  { chave: "duracao", rotulo: "Tempo de trabalho" },
  { chave: "intensidade", rotulo: "Intensidade" },
  { chave: "recuperacao", rotulo: "Recuperação" },
];

/*
 * Os formatos de cardio saem de FORMATOS_AEROBIOS (lib/gps/formatoAerobio), e não de uma
 * lista de rótulos.
 *
 * Aqui existia um array de cinco strings, e trocar o formato gravava só a string: o cartão
 * passava a dizer "Intervalado de alta intensidade (HIIT)" e seguia prescrevendo "15 a 25
 * min, moderada, recuperação -", que é a prescrição do contínuo. Agora o formato traz junto a
 * banda de intensidade, o tempo total de trabalho, a recuperação e o aviso, e o editor aplica
 * tudo de uma vez.
 */
const FORMATOS_CARDIO = FORMATOS_AEROBIOS_LISTA.map((f) => f.nome);
/*
 * O ISOMÉTRICO TEM VARIÁVEIS PRÓPRIAS, e o editor precisava saber disso.
 *
 * O bloco isométrico caía em CAMPOS_FORCA. O resultado: o campo "Repetições" saía VAZIO (o
 * protocolo não tem repetição), o tempo de contração, que é a variável central dele, não
 * aparecia em lugar nenhum, e o aviso de "fora da faixa" disparava contra faixas de força que
 * não valem aqui. O profissional abria a sessão isométrica e não reconhecia o que era.
 */
const CAMPOS_ISOMETRICO: CampoBloco[] = [
  { chave: "series", rotulo: "Séries" },
  { chave: "duracao", rotulo: "Contração" },
  { chave: "intervalo", rotulo: "Intervalo" },
  { chave: "intensidade", rotulo: "Intensidade" },
];
const camposDoBloco = (b: BlocoSessao): CampoBloco[] =>
  b.tipo === "aerobio"
    ? b.tiros
      ? CAMPOS_AEROBIO_COM_TIROS
      : CAMPOS_AEROBIO
    : b.tipo === "isometrico"
      ? CAMPOS_ISOMETRICO
      : CAMPOS_FORCA;

/* ============================ Quadro da sessão (leitura) ============================ */

/**
 * A sessão vira um quadro glanceável: musculação e cardio em blocos separados, cada
 * informação em sua linha. O profissional (ou o aluno) bate o olho e sabe o que fazer,
 * sem ler linhas corridas. Força vai em tabela; cardio vai em ficha com rótulos empilhados,
 * porque as variáveis são outras (formato, duração e intensidade, não séries e carga).
 */
function QuadroForca({ blocos, ctx }: { blocos: BlocoSessao[]; ctx: ContextoFaixa }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex items-center gap-1.5 border-b border-border bg-surface-soft px-2.5 py-1.5">
        <Dumbbell className="h-3.5 w-3.5 text-primary" aria-hidden />
        <span className="text-2xs font-semibold uppercase tracking-wide text-ink-2">Musculação</span>
      </div>
      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-xs">
          <thead>
            <tr className="text-2xs uppercase tracking-wide text-ink-3">
              <th className="px-2.5 py-1 font-semibold">Exercício</th>
              <th className="px-1.5 py-1 font-semibold">Séries</th>
              <th className="px-1.5 py-1 font-semibold">Reps</th>
              <th className="px-1.5 py-1 font-semibold">Intensidade</th>
              <th className="px-1.5 py-1 font-semibold">Intervalo</th>
            </tr>
          </thead>
          <tbody>
            {blocos.map((b) => (
              <tr key={b.id} className="border-t border-border align-top">
                <td className="px-2.5 py-1.5 font-semibold text-ink">
                  <span className="inline-flex flex-wrap items-center gap-1.5">
                    {b.nome}
                    {b.metodo && b.metodo !== "tradicional" && (
                      <span className="rounded-full bg-primary-tint px-1.5 py-0.5 text-2xs font-bold text-primary">
                        {getMetodo(b.metodo)?.nome}
                      </span>
                    )}
                    <SeloOrigem ctx={ctx} bloco={b} />
                  </span>
                  {/* Alvo concreto da semana ao lado da faixa (as colunas continuam a referência). */}
                  {temAlvoForca(b) && (
                    <LinhaDeTokens className="mt-1">
                      {tokensAlvoForca(b).map((t, i) => (
                        <TokenDose key={i} label={t.label} value={t.value} tone="primary" />
                      ))}
                    </LinhaDeTokens>
                  )}
                </td>
                <td className="px-1.5 py-1.5 text-ink-2">{b.series}</td>
                <td className="px-1.5 py-1.5 text-ink-2">{b.reps}</td>
                <td className="px-1.5 py-1.5 text-ink-2">{b.intensidade}</td>
                <td className="px-1.5 py-1.5 text-ink-2">{b.intervalo && b.intervalo !== "-" ? b.intervalo : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Affordance de rolagem: um fade no canto direito sugere que a tabela continua. */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-surface" />
      </div>
    </div>
  );
}

function QuadroCardio({ blocos }: { blocos: BlocoSessao[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex items-center gap-1.5 border-b border-border bg-surface-soft px-2.5 py-1.5">
        <HeartPulse className="h-3.5 w-3.5 text-analysis" aria-hidden />
        <span className="text-2xs font-semibold uppercase tracking-wide text-ink-2">Cardio</span>
      </div>
      <div className="divide-y divide-border">
        {blocos.map((b) => {
          const atividade = b.modalidade ? getModalidade(b.modalidade)?.nome : undefined;
          const linhas: [string, string | undefined][] = [
            ["Formato", b.formato],
            ["Tiros", b.tiros],
            [b.tiros ? "Tempo de trabalho" : "Duração", b.duracao],
            ["Intensidade", b.intensidade],
            ["Recuperação", b.recuperacao && b.recuperacao !== "-" ? b.recuperacao : undefined],
          ];
          return (
            <div key={b.id} className="px-2.5 py-2">
              <p className="mb-1 text-xs font-semibold text-ink">{atividade ?? b.nome ?? "Aeróbio"}</p>
              <dl className="space-y-0.5">
                {linhas
                  .filter(([, v]) => v)
                  .map(([rot, v]) => (
                    <div key={rot} className="flex gap-2 text-xs">
                      <dt className="w-24 shrink-0 text-ink-3">{rot}</dt>
                      <dd className="flex-1 font-medium text-ink-2">{v}</dd>
                    </div>
                  ))}
              </dl>
              {/* Alvo concreto da semana ao lado da faixa (duração, PSE e zona quando houver). */}
              {temAlvoAerobio(b) && (
                <LinhaDeTokens className="mt-1">
                  {tokensAlvoAerobio(b).map((t, i) => (
                    <TokenDose key={i} label={t.label} value={t.value} tone="analysis" />
                  ))}
                </LinhaDeTokens>
              )}
              {b.observacao && <p className="mt-1 text-2xs leading-snug text-ink-3">{b.observacao}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SessaoQuadro({ sessao, ctx }: { sessao: Sessao; ctx: ContextoFaixa }) {
  if (sessao.blocos.length === 0) return <p className="px-1 py-2 text-xs text-ink-3">Sessão sem exercícios definidos.</p>;
  const forca = sessao.blocos.filter((b) => b.tipo !== "aerobio");
  const cardio = sessao.blocos.filter((b) => b.tipo === "aerobio");
  const duasColunas = forca.length > 0 && cardio.length > 0;
  // "Por que este número": as regras da progressão que fundamentaram os alvos desta sessão.
  const regras = regrasDaSessao(sessao.blocos);
  return (
    <div className="space-y-1.5">
      <div className={cn("grid gap-2", duasColunas && "md:grid-cols-2")}>
        {forca.length > 0 && <QuadroForca blocos={forca} ctx={ctx} />}
        {cardio.length > 0 && <QuadroCardio blocos={cardio} />}
      </div>
      {regras.length > 0 && (
        <details className="rounded-lg border border-dashed border-border bg-surface-soft text-2xs">
          <summary className="cursor-pointer list-none px-2.5 py-1.5 text-ink-3 [&::-webkit-details-marker]:hidden">
            <Info className="mr-1 inline h-3 w-3 align-[-2px]" aria-hidden /> Por que estes números
          </summary>
          <ul className="space-y-1 border-t border-border px-2.5 py-1.5">
            {regras.map((r, i) => (
              <li key={i} className="text-ink-2">
                {r.criterio}
                {r.base && <span className="text-ink-3"> Base: {r.base}.</span>}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

/**
 * Editor granular de UMA sessão: trocar exercício pelo ranking seguro do perfil,
 * adicionar/remover, mexer à mão em séries, repetições, intensidade e intervalo com
 * aviso de faixa, e escolher o método de série. Exportado porque o "Personalizar
 * treino" (Gps em modo dia) edita a sessão de hoje com ESTE mesmo editor: dois
 * editores de sessão em paralelo seriam duas verdades sobre a mesma dose.
 */
export function SessaoBloco({
  sessao,
  ctx,
  editavel,
  onChange,
  onRemover,
}: {
  sessao: Sessao;
  ctx: ContextoFaixa;
  editavel: boolean;
  onChange: (s: Sessao) => void;
  onRemover: () => void;
}) {
  const faixa = getFaixa(ctx.objetivo);

  // Com perfil de aluno, o "Adicionar" segue o mesmo ranking seguro do Prescrever exercício;
  // sem perfil, a ordem alfabética é a mais previsível para o plano avulso.
  const opcoesAdicionar = React.useMemo(
    () =>
      temContextoDeAluno(ctx)
        ? sugerirTroca(ctxTrocaDe(ctx)).map((r) => r.exercise)
        : [...exercises].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
    [ctx],
  );

  const addBloco = (slug: string) => {
    if (!slug) return;
    const ex = exercises.find((e) => e.slug === slug);
    onChange({
      ...sessao,
      blocos: [
        ...sessao.blocos,
        {
          id: nid("blk"),
          tipo: "forca",
          exercicioSlug: ex?.slug,
          nome: ex?.nome ?? "Novo exercício",
          series: faixa.series.valor,
          reps: valorFaixa(faixa.reps, ctx.nivel),
          intensidade: faixa.intensidade.valor,
          intervalo: faixa.intervalo.valor,
        },
      ],
    });
  };

  const addCardio = () => {
    onChange({
      ...sessao,
      blocos: [
        ...sessao.blocos,
        {
          id: nid("blk"),
          tipo: "aerobio",
          modalidade: "caminhada",
          nome: "Aeróbio",
          formato: "Contínuo",
          duracao: "20 a 30 min",
          intensidade: "Moderada (teste da conversa; RPE 4 a 6)",
          recuperacao: "-",
        },
      ],
    });
  };

  const trocarBloco = (nb: BlocoSessao) => onChange({ ...sessao, blocos: sessao.blocos.map((x) => (x.id === nb.id ? nb : x)) });
  // Remover exercício era sumiço instantâneo, sem sinal nenhum. O desfazer devolve o
  // bloco na POSIÇÃO original: recolocar no fim mudaria a ordem da sessão, e a ordem é
  // parte da prescrição (aquecimento, principal, acessório).
  const removerBloco = (id: string) => {
    const antes = sessao.blocos;
    const alvo = antes.find((x) => x.id === id);
    onChange({ ...sessao, blocos: antes.filter((x) => x.id !== id) });
    if (alvo) toastDesfazer(`${alvo.nome} removido da sessão.`, () => onChange({ ...sessao, blocos: antes }));
  };

  // Agrupar marca 2-3 blocos de FORÇA consecutivos com o mesmo grupoMetodo (id gerado) e o
  // método correspondente; desagrupar limpa o grupo e o método de bi/tri/super daqueles blocos.
  const agruparIds = (ids: string[], metodo: MetodoSerie) => {
    const grupoId = nid("grp");
    onChange({ ...sessao, blocos: sessao.blocos.map((b) => (ids.includes(b.id) ? { ...b, grupoMetodo: grupoId, metodo } : b)) });
  };
  const desagruparGrupo = (grupoId: string) => {
    const deGrupo = new Set<MetodoSerie>(["bi-set", "tri-set", "super-set"]);
    onChange({
      ...sessao,
      blocos: sessao.blocos.map((b) =>
        b.grupoMetodo === grupoId
          ? { ...b, grupoMetodo: undefined, metodo: b.metodo && deGrupo.has(b.metodo) ? undefined : b.metodo }
          : b,
      ),
    });
  };
  const segmentos = agruparBlocosPorMetodo(sessao.blocos);

  return (
    <div className="rounded-lg bg-surface-soft p-2.5">
      <div className="mb-1.5 flex items-center gap-1.5">
        <Repeat className="h-3.5 w-3.5 shrink-0 text-primary" />
        {editavel ? (
          <input
            value={sessao.nome}
            onChange={(e) => onChange({ ...sessao, nome: e.target.value })}
            aria-label="Nome da sessão"
            className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-1 py-0.5 text-sm font-semibold text-ink hover:border-border focus:border-primary focus:bg-surface focus:outline-none"
          />
        ) : (
          <span className="flex-1 text-sm font-semibold text-ink">{sessao.nome}</span>
        )}
        {editavel && (
          <button onClick={onRemover} aria-label={`Remover ${sessao.nome}`} className="rounded p-1 text-ink-3 hover:bg-surface hover:text-[color:var(--cta-text)]">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {!editavel ? (
        <SessaoQuadro sessao={sessao} ctx={ctx} />
      ) : (
        <>
          {sessao.blocos.length === 0 && <p className="px-1 py-2 text-xs text-ink-3">Sessão sem exercícios. Adicione abaixo.</p>}

          <ul className="space-y-1.5">
            {segmentos.map((seg, si) => {
              if (seg.tipo === "grupo") {
                const info = getMetodo(seg.metodo);
                return (
                  <li key={seg.grupoId}>
                    {/* Colchete: as linhas do grupo ficam numa moldura única com a badge do
                        método e a instrução do catálogo; o método é do grupo, não de cada bloco. */}
                    <div className="rounded-lg border border-primary bg-primary-tint p-1.5">
                      <div className="mb-1 flex flex-wrap items-center gap-2 px-1">
                        <span className="rounded-full bg-primary px-2 py-0.5 text-2xs font-bold text-white">{info?.nome}</span>
                        <span className="min-w-0 flex-1 text-2xs leading-tight text-ink-2">{info?.descricao}</span>
                        <button
                          type="button"
                          onClick={() => desagruparGrupo(seg.grupoId)}
                          className="shrink-0 text-2xs font-semibold text-ink-3 hover:text-primary hover:underline"
                        >
                          Desagrupar
                        </button>
                      </div>
                      <ul className="space-y-1.5">
                        {seg.blocos.map((b) => (
                          <li key={b.id}>
                            <BlocoRow bloco={b} ctx={ctx} ocultarMetodo onChange={trocarBloco} onRemover={() => removerBloco(b.id)} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                );
              }
              const b = seg.bloco;
              const ehForca = b.tipo !== "aerobio";
              const prox1 = segmentos[si + 1];
              const prox2 = segmentos[si + 2];
              const prox1Solo = prox1?.tipo === "solo" && prox1.bloco.tipo !== "aerobio" ? prox1.bloco : undefined;
              const prox2Solo = prox2?.tipo === "solo" && prox2.bloco.tipo !== "aerobio" ? prox2.bloco : undefined;
              const podeBi = ehForca && Boolean(prox1Solo);
              const podeTri = podeBi && Boolean(prox2Solo);
              return (
                <li key={b.id}>
                  <BlocoRow bloco={b} ctx={ctx} onChange={trocarBloco} onRemover={() => removerBloco(b.id)} />
                  {podeBi && (
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 pl-2">
                      <span className="text-2xs text-ink-3">Agrupar com o próximo:</span>
                      <BotaoAgrupar onClick={() => agruparIds([b.id, prox1Solo!.id], "bi-set")}>Bi-set</BotaoAgrupar>
                      <BotaoAgrupar onClick={() => agruparIds([b.id, prox1Solo!.id], "super-set")}>Super-set</BotaoAgrupar>
                      {podeTri && (
                        <BotaoAgrupar onClick={() => agruparIds([b.id, prox1Solo!.id, prox2Solo!.id], "tri-set")}>Tri-set</BotaoAgrupar>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <label className="text-xs text-ink-3" htmlFor={`add-${sessao.id}`}>
              Adicionar exercício
            </label>
            <select
              id={`add-${sessao.id}`}
              value=""
              onChange={(e) => {
                addBloco(e.target.value);
                e.target.value = "";
              }}
              className="input h-8 max-w-[220px] py-0 text-xs"
            >
              <option value="">Escolher do acervo</option>
              {opcoesAdicionar.map((e) => (
                <option key={e.slug} value={e.slug}>
                  {e.nome}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addCardio}
              className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 text-xs font-semibold text-ink-2 hover:bg-surface"
            >
              <HeartPulse className="h-3.5 w-3.5 text-analysis" /> Adicionar cardio
            </button>
          </div>
        </>
      )}

      {/* Fecho de flexibilidade da sessão (onda F): editável no editor, nota no modo leitura. */}
      {editavel ? (
        <div className="mt-2">
          <label
            htmlFor={`fecho-${sessao.id}`}
            className="mb-0.5 block text-2xs font-semibold uppercase tracking-wide text-ink-3"
          >
            Fecho de flexibilidade
          </label>
          <textarea
            id={`fecho-${sessao.id}`}
            value={sessao.fecho ?? ""}
            onChange={(e) => onChange({ ...sessao, fecho: e.target.value || undefined })}
            rows={2}
            placeholder="Alongamento ao final da sessão (opcional)"
            className="w-full rounded-md border border-border bg-surface px-2 py-1 text-xs text-ink placeholder:text-ink-3/60 focus:border-primary focus:outline-none"
          />
        </div>
      ) : (
        sessao.fecho && (
          <p className="mt-2 rounded-md border-l-2 border-primary bg-surface px-2 py-1 text-2xs text-ink-2">
            {sessao.fecho}
          </p>
        )
      )}
    </div>
  );
}

/* ================================ Bloco (exercício) ================================ */

function BlocoRow({
  bloco,
  ctx,
  onChange,
  onRemover,
  ocultarMetodo,
}: {
  bloco: BlocoSessao;
  ctx: ContextoFaixa;
  onChange: (b: BlocoSessao) => void;
  onRemover: () => void;
  /** quando o bloco está num grupo (bi/tri/super-set), o método é do grupo: some o select */
  ocultarMetodo?: boolean;
}) {
  const faixa = getFaixa(ctx.objetivo);
  const aerobio = bloco.tipo === "aerobio";
  const [trocar, setTrocar] = React.useState(false);
  const exAtual = bloco.exercicioSlug ? exercises.find((e) => e.slug === bloco.exercicioSlug) : undefined;

  return (
    <div className="rounded-lg border border-border bg-surface p-2">
      <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
        {aerobio && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded bg-analysis/10 px-1.5 py-0.5 text-2xs font-semibold uppercase tracking-wide text-analysis">
            <HeartPulse className="h-3 w-3" aria-hidden /> Cardio
          </span>
        )}
        <input
          value={bloco.nome ?? ""}
          onChange={(e) => onChange({ ...bloco, nome: e.target.value })}
          aria-label={aerobio ? "Nome do bloco de cardio" : "Nome do exercício"}
          className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-1 py-0.5 text-xs font-semibold text-ink hover:border-border focus:border-primary focus:outline-none"
        />
        <SeloOrigem ctx={ctx} bloco={bloco} />
        {!aerobio && (
          <button
            type="button"
            onClick={() => setTrocar(true)}
            className="inline-flex shrink-0 items-center gap-1 text-2xs font-semibold text-primary hover:underline"
            title="Trocar por outro exercício, ranqueado pelo perfil do aluno"
          >
            <Replace className="h-3.5 w-3.5" /> Trocar
          </button>
        )}
        {bloco.exercicioSlug && (
          // ABRE EM NOVA ABA de propósito. O plano gerado vive só em estado local
          // enquanto não é salvo; navegar para o Laboratório na MESMA aba e voltar
          // remontava a página e obrigava a gerar tudo de novo. Numa aba separada, a
          // periodização fica intacta e o profissional só fecha a aba para voltar.
          <a
            href={withBase(`/movement-lab/${bloco.exercicioSlug}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-0.5 text-2xs font-semibold text-primary hover:underline"
            title="Abrir a análise deste exercício em uma nova aba (a periodização fica aberta aqui)"
          >
            ver análise <ExternalLink className="h-3 w-3" />
          </a>
        )}
        <button onClick={onRemover} aria-label={`Remover ${bloco.nome}`} className="shrink-0 rounded p-1 text-ink-3 hover:bg-surface-soft hover:text-[color:var(--cta-text)]">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {trocar && (
        <SeletorExercicioSheet
          ctx={ctx}
          alvo={exAtual?.grupoMuscular}
          titulo="Trocar exercício"
          onClose={() => setTrocar(false)}
          onEscolher={(ex) => {
            // Grava slug E nome juntos: renomear sem trocar o slug fazia "ver análise"
            // apontar para o exercício errado (o drift que isto conserta).
            onChange({ ...bloco, exercicioSlug: ex.slug, nome: ex.nome });
            setTrocar(false);
          }}
        />
      )}
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {camposDoBloco(bloco).map(({ chave, rotulo, confere }) => {
          const valor = (bloco[chave] as string | undefined) ?? "";
          // O formato do cardio (contínuo, intervalado, HIIT...) vira um seletor: o
          // campo é texto livre no modelo, mas escolher de uma lista evita digitar e
          // padroniza o vocabulário. Continua aceitando um valor fora da lista (planos
          // antigos ou algo digitado pelo motor) sem perdê-lo.
          if (aerobio && chave === "formato") {
            return (
              <CampoFormatoInline
                key={chave}
                rotulo={rotulo}
                valor={valor}
                onChange={(v) => {
                  const f = formatoPeloNome(v);
                  onChange(f ? aplicarFormatoAerobio(bloco, f) : { ...bloco, formato: v });
                }}
              />
            );
          }
          const aviso = confere ? conferirFaixa(confere, valor, faixa, ctx.nivel) : null;
          // A faixa citada vem da MESMA fonte do aviso, então pista e repreensão nunca
          // divergem. Só nos campos que a diretriz de fato dosa.
          const pista = confere ? faixaSugerida(faixa[confere], ctx.nivel) : undefined;
          return (
            <CampoInline
              key={chave}
              rotulo={rotulo}
              valor={valor}
              aviso={aviso}
              pista={pista}
              onChange={(v) => onChange({ ...bloco, [chave]: v })}
            />
          );
        })}
      </div>
      {/* Bi-set e drop-set são métodos de série dinâmica; num protocolo isométrico fechado
          não existe a série para agrupar, então o seletor não é oferecido. */}
      {!aerobio && bloco.tipo !== "isometrico" && !ocultarMetodo && (
        <div className="mt-1.5">
          <label className="mb-0.5 block text-2xs font-semibold uppercase tracking-wide text-ink-3">Método de série</label>
          <select
            value={bloco.metodo ?? "tradicional"}
            onChange={(e) =>
              onChange({
                ...bloco,
                metodo: e.target.value === "tradicional" ? undefined : (e.target.value as MetodoSerie),
              })
            }
            aria-label="Método de série"
            className="input h-8 max-w-[220px] py-0 text-xs"
          >
            {METODOS_SERIE.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome}
              </option>
            ))}
          </select>
          {bloco.metodo && bloco.metodo !== "tradicional" && (
            <p className="mt-0.5 text-2xs leading-tight text-ink-3">{getMetodo(bloco.metodo)?.descricao}</p>
          )}
        </div>
      )}
    </div>
  );
}

function CampoInline({
  rotulo,
  valor,
  aviso,
  pista,
  onChange,
}: {
  rotulo: string;
  valor: string;
  aviso: string | null;
  /** A faixa citada pela diretriz para este campo. Pista, não trava. */
  pista?: string;
  onChange: (v: string) => void;
}) {
  const id = React.useId();
  return (
    <div>
      <label htmlFor={id} className="mb-0.5 flex flex-wrap items-baseline gap-x-1.5 text-2xs font-semibold uppercase tracking-wide text-ink-3">
        <span>{rotulo}</span>
        {pista && <span className="font-normal normal-case tracking-normal text-ink-3">faixa citada: {pista}</span>}
      </label>
      <input
        id={id}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={aviso ? `${id}-aviso` : undefined}
        aria-invalid={undefined}
        className={cn(
          "w-full rounded-md border bg-surface px-1.5 py-1 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary",
          aviso ? "border-warning bg-warning-tint" : "border-border",
        )}
      />
      {aviso && (
        <p id={`${id}-aviso`} className="mt-0.5 flex items-start gap-1 text-2xs leading-tight text-warning">
          <AlertTriangle className="mt-px h-3 w-3 shrink-0" />
          {aviso}
        </p>
      )}
    </div>
  );
}

/** Formato do cardio: seletor com os formatos padrão. Preserva um valor fora da lista
 *  (plano antigo ou texto do motor) mostrando-o como primeira opção, para não perdê-lo. */
function CampoFormatoInline({ rotulo, valor, onChange }: { rotulo: string; valor: string; onChange: (v: string) => void }) {
  const id = React.useId();
  const foraDaLista = Boolean(valor) && !FORMATOS_CARDIO.includes(valor);
  return (
    <div>
      <label htmlFor={id} className="mb-0.5 block text-2xs font-semibold uppercase tracking-wide text-ink-3">
        {rotulo}
      </label>
      <select
        id={id}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-border bg-surface px-1.5 py-1 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {!valor && <option value="">Escolher</option>}
        {foraDaLista && <option value={valor}>{valor}</option>}
        {FORMATOS_CARDIO.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ============================ Seletor de exercício (troca) ============================ */

/**
 * Lista ranqueada para trocar (ou adicionar) um exercício, com o mesmo motor seguro do
 * Prescrever exercício. Bottom sheet no mobile, modal estreito no desktop. Os excluídos pelo
 * perfil ficam num grupo colapsado ao fim, cada um com o motivo, nunca misturados na lista.
 * Score exibido com `adequacaoLabel`, nunca "%".
 */
function SeletorExercicioSheet({
  ctx,
  alvo,
  titulo,
  onEscolher,
  onClose,
}: {
  ctx: ContextoFaixa;
  /** grupo muscular do exercício que está saindo; sem ele, ranqueia de forma geral */
  alvo?: string;
  titulo: string;
  onEscolher: (ex: { slug: string; nome: string }) => void;
  onClose: () => void;
}) {
  const dialogRef = useDialog<HTMLDivElement>(onClose);
  const [busca, setBusca] = React.useState("");
  const recs = React.useMemo(() => sugerirTroca(ctxTrocaDe(ctx), alvo), [ctx, alvo]);
  const q = busca.trim().toLowerCase();
  const filtra = (r: Recommendation) => !q || r.exercise.nome.toLowerCase().includes(q);
  const incluidos = recs.filter((r) => !r.excluido).filter(filtra);
  const excluidos = recs.filter((r) => r.excluido).filter(filtra);
  // Top 10 quando não há busca; com busca, mostra todos os que casam.
  const topo = q ? incluidos : incluidos.slice(0, 10);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end bg-black/40 p-0 backdrop-blur-sm sm:place-items-center sm:p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="flex max-h-modal w-full max-w-md flex-col overflow-hidden rounded-t-card bg-surface shadow-overlay outline-none sm:rounded-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border p-4">
          <h2 className="font-display text-base font-bold text-ink">{titulo}</h2>
          <button onClick={onClose} aria-label="Fechar" className="rounded p-1 text-ink-3 hover:bg-surface-soft hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="border-b border-border p-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5">
            <Search className="h-4 w-4 shrink-0 text-ink-3" aria-hidden />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar exercício"
              aria-label="Buscar exercício"
              className="h-9 w-full bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none"
            />
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {topo.length === 0 && <p className="py-6 text-center text-sm text-ink-3">Nenhum exercício encontrado.</p>}
          <ul className="space-y-1.5">
            {topo.map((r) => (
              <li key={r.exercise.slug}>
                <button
                  onClick={() => onEscolher({ slug: r.exercise.slug, nome: r.exercise.nome })}
                  className="flex w-full items-center gap-2 rounded-card border border-border bg-surface p-2.5 text-left hover:border-primary hover:bg-surface-soft"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-ink">{r.exercise.nome}</div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-ink-3">
                      <span>{r.exercise.grupoMuscular}</span>
                      <span aria-hidden>·</span>
                      <span>{r.exercise.equipamento}</span>
                    </div>
                  </div>
                  <span className="shrink-0 text-right">
                    <span className="block text-xs font-semibold text-primary">{adequacaoLabel(r.score)}</span>
                    <span className="tabular block text-2xs text-ink-3">{r.score}/100</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {excluidos.length > 0 && (
            <details className="mt-3 rounded-lg border border-dashed border-border">
              <summary className="cursor-pointer list-none px-3 py-2 text-xs font-semibold text-ink-2 [&::-webkit-details-marker]:hidden">
                {excluidos.length} {excluidos.length === 1 ? "excluído" : "excluídos"} pelo perfil
              </summary>
              <ul className="space-y-1.5 border-t border-border p-2.5">
                {excluidos.map((r) => (
                  <li key={r.exercise.slug} className="rounded-lg bg-surface-soft p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink-2">{r.exercise.nome}</span>
                      <button
                        onClick={() => onEscolher({ slug: r.exercise.slug, nome: r.exercise.nome })}
                        className="shrink-0 text-xs font-semibold text-ink-3 hover:text-primary hover:underline"
                      >
                        Usar mesmo assim
                      </button>
                    </div>
                    {r.motivoExclusao && (
                      <p className="mt-1 flex items-start gap-1 text-2xs leading-snug text-warning">
                        <AlertTriangle className="mt-px h-3 w-3 shrink-0" aria-hidden />
                        {r.motivoExclusao}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================ Modelo ================================ */

export function ModeloExplicacao({ modelo }: { modelo: ReturnType<typeof getModelo> }) {
  return (
    <details className="group rounded-card border border-border bg-surface-soft">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-card px-4 py-3 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
        <Info className="h-4 w-4 shrink-0 text-ink-3" />
        Entenda o modelo: {modelo.nome}
        <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-ink-3 transition-transform group-open:rotate-180" />
      </summary>
      <div className="space-y-4 px-4 pb-4">
        <Bloco titulo="Como funciona" texto={modelo.comoFunciona} />
        <Bloco titulo="Racional científico" texto={modelo.racionalCientifico} />
        <div className="grid gap-4 sm:grid-cols-2">
          <ListaChips titulo="Indicado para" itens={modelo.perfisIndicados} />
          <ListaChips titulo="Variáveis a controlar" itens={modelo.variaveisControladas} />
          <CriterioLista titulo="Pontos fortes" itens={modelo.pontosFortes} tone="success" />
          <CriterioLista titulo="Limitações" itens={modelo.limitacoes} tone="warning" />
        </div>
        <CriterioLista titulo="Erros comuns" itens={modelo.errosComuns} tone="warning" />
        {modelo.aprenderHref && (
          <Link to={modelo.aprenderHref} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
            <BookOpen className="h-4 w-4" /> Aprofundar no Aprender
          </Link>
        )}
      </div>
    </details>
  );
}

/* ================================ Peças ================================ */

export function ListaChips({ titulo, itens }: { titulo: string; itens: string[] }) {
  if (!itens.length) return null;
  return (
    <div>
      <Eyebrow className="mb-1">{titulo}</Eyebrow>
      {/* Borda própria: chip sobre fundo soft/branco sem cápsula sumia na
          paleta pele clínica. Conserta MesocicloCard e ModeloExplicacao de uma vez. */}
      <div className="flex flex-wrap gap-1.5">
        {itens.map((it, i) => (
          <span key={i} className="rounded-lg border border-border bg-surface px-2 py-1 text-xs font-medium text-ink">
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}

export function CriterioLista({
  titulo,
  itens,
  tone,
  editavel,
  onChange,
}: {
  titulo: string;
  itens: string[];
  tone: "success" | "warning";
  editavel?: boolean;
  onChange?: (itens: string[]) => void;
}) {
  if (!itens.length && !editavel) return null;
  const dot = tone === "success" ? "bg-success" : "bg-warning-fill";

  if (!editavel) {
    return (
      <div>
        <Eyebrow className="mb-1">{titulo}</Eyebrow>
        <ul className="space-y-1">
          {itens.map((it, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-ink-2">
              <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", dot)} />
              {it}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div>
      <Eyebrow className="mb-1">{titulo}</Eyebrow>
      <ul className="space-y-1">
        {itens.map((it, i) => (
          <li key={i} className="flex items-start gap-1.5">
            <span className={cn("mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full", dot)} />
            <input
              value={it}
              onChange={(e) => onChange?.(itens.map((x, j) => (j === i ? e.target.value : x)))}
              aria-label={`${titulo}, critério ${i + 1}`}
              className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-1 py-0.5 text-sm text-ink-2 hover:border-border focus:border-primary focus:bg-surface focus:outline-none"
            />
            <button
              onClick={() => onChange?.(itens.filter((_, j) => j !== i))}
              aria-label={`Remover critério ${i + 1}`}
              className="mt-0.5 rounded p-1 text-ink-3 hover:text-[color:var(--cta-text)]"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </li>
        ))}
      </ul>
      <button onClick={() => onChange?.([...itens, ""])} className="mt-1 text-xs font-semibold text-primary hover:underline">
        + adicionar critério
      </button>
    </div>
  );
}

/** Botão-pílula compacto para agrupar blocos consecutivos (bi/tri/super-set). */
function BotaoAgrupar({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-border px-2 py-0.5 text-2xs font-semibold text-ink-2 transition-colors hover:border-primary hover:bg-surface hover:text-primary"
    >
      {children}
    </button>
  );
}

function Bloco({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div>
      <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-analysis">
        <Target className="h-3.5 w-3.5" /> {titulo}
      </p>
      <p className="text-sm text-ink-2">{texto}</p>
    </div>
  );
}
