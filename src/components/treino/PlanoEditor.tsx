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
  Pencil,
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
  fraseDeSessoes,
} from "@/data/periodizacao";
import { recalcularAlvosDoMeso } from "@/lib/gps/travas";
import { parametrosInvalidosDe } from "@/lib/gps/farmacos";
import { efeitoDaEdicao, formatarDelta, type EfeitoDaEdicao } from "@/lib/gps/efeitoDaEdicao";
import type { FarmacoSelecionado } from "@/data/farmacos";
import { conferirFaixa, faixaSugerida, type CampoFaixa } from "@/lib/gps/faixas";
import {
  agregadoSemana,
  desenharProgressao,
  posicoesFocos,
  estadoSemana,
  ESTADO_LABEL,
  type EstadoSemana,
} from "@/lib/gps/progressao";
import {
  temAlvoForca,
  tokensAlvoForca,
  temAlvoAerobio,
  tokensAlvoAerobio,
  compararAlvos,
  regrasDaSessao,
  decisaoDoBloco,
  blocoAnteriorDe,
  type TokenAlvo,
  type DecisaoDoBloco,
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
/**
 * As cores das três séries sobre o navy do macrociclo. A superfície é FIXA (fora
 * do tema claro/escuro), como o herói do Meu dia e a lateral: por isso os valores
 * são literais verificados uma vez, e não tokens. Sobre #0B1628: o teal dá 11,1:1,
 * o âmbar 8,3:1 e o cinza da complexidade 6,4:1.
 */
const SERIE_NAVY: Record<string, string> = { vol: "#7FE3D8", int: "#E8A317", cpx: "#8FA0B5" };

/** Famílias das faixas de fase, cicladas na ordem do protótipo. */
const FAIXA_FASE = [
  { bg: "rgba(20,179,186,.18)", borda: "rgba(20,179,186,.4)", tinta: "#7FE3D8" },
  { bg: "rgba(32,100,236,.22)", borda: "rgba(32,100,236,.5)", tinta: "#9DBAFF" },
  { bg: "rgba(232,163,23,.16)", borda: "rgba(232,163,23,.4)", tinta: "#F0B429" },
] as const;

export function GraficoProgressao({
  macro,
  nivel,
  modeloId,
  semanaAtual,
}: {
  macro: Macrociclo;
  nivel?: Nivel;
  modeloId?: ModeloPeriodizacaoId;
  /** semana corrente do plano; só quem tem plano SALVO passa (senão "você está aqui" mentiria) */
  semanaAtual?: number;
}) {
  const ordemAberta = modeloId === "flexivel" || modeloId === "autorregulada";
  // 1200x200 é o enquadramento do protótipo. As contas não mudam: `desenharProgressao`
  // projeta a mesma série em qualquer moldura.
  const g = desenharProgressao(macro, 1200, 200, nivel);
  const gid = React.useId().replace(/:/g, "");

  /*
   * O SVG desenha SÓ a geometria do plot, esticada na largura (preserveAspectRatio
   * "none", como no protótipo). Todo TEXTO e todo marcador redondo vive em HTML por
   * cima, posicionado em porcentagem: dentro de um SVG esticado, letra e círculo
   * sairiam deformados. `pontos` (progressao.ts) dá a coordenada já projetada de
   * cada semana, então a bandeira e os pontos caem exatamente sobre a curva.
   */
  const vbTop = g.plot.top - 12;
  const vbAltura = g.plot.bottom - g.plot.top + 24;
  const pctX = (x: number) => (x / g.largura) * 100;
  const pctY = (y: number) => ((y - vbTop) / vbAltura) * 100;

  const atual = semanaAtual != null ? g.pontos.find((p) => p.semana === semanaAtual) : undefined;
  const grade = [0.25, 0.5, 0.75].map((f) => g.plot.top + (g.plot.bottom - g.plot.top) * f);
  const passoSemana = g.microTicks.length > 1 ? g.microTicks[1].x - g.microTicks[0].x : 24;
  const larguraChip = Math.max(pctX(passoSemana) - 0.35, 0.6);
  // Só os tipos de semana que aparecem no plano entram na legenda (nunca "Teste" quando
  // não há semana de teste).
  const tiposPresentes = new Set(g.microTicks.map((t) => t.tipo));
  const tiposSemana = (["carga", "deload", "teste"] as TipoMicrociclo[]).filter((t) => tiposPresentes.has(t));

  return (
    <section
      className="relative overflow-hidden rounded-[24px] p-4 md:p-6"
      style={{ background: "#0B1628", color: "#F3F1EA" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "linear-gradient(180deg,transparent,#000 40%)",
          WebkitMaskImage: "linear-gradient(180deg,transparent,#000 40%)",
        }}
      />
      <div className="relative flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <p className="m-0 flex items-center gap-2 text-2xs font-semibold uppercase tracking-[0.12em]" style={{ color: "#7FE3D8" }}>
          <TrendingUp className="h-3.5 w-3.5" aria-hidden />
          Macrociclo · volume, esforço e complexidade por semana
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs" style={{ color: "#B9C6D6" }}>
          {g.series.map((s) => (
            <span key={s.id} className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="w-3.5"
                style={
                  s.id === "cpx"
                    ? { borderTop: `2px dashed ${SERIE_NAVY.cpx}` }
                    : { height: 3, borderRadius: 2, background: SERIE_NAVY[s.id] ?? s.cor }
                }
              />
              {s.nome}
            </span>
          ))}
        </div>
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
      <p className="relative mt-2 text-xs leading-relaxed" style={{ color: "#B9C6D6" }}>
        Valores relativos, calculados das sessões (sem unidade absoluta). O nome de cada linha já diz como
        ela é calculada: <b style={{ color: "#F3F1EA" }}>volume é soma</b>, então acrescentar exercício ou série sobe a linha;{" "}
        <b style={{ color: "#F3F1EA" }}>esforço médio é média</b>, então ele sobe quando o treino fica mais pesado, e não quando fica mais
        longo. As faixas acima do gráfico mostram cada fase e quantas semanas ela dura.
      </p>
      {/*
        POR QUE A CURVA NÃO MUDOU, dito antes de o profissional olhar para ela.
        O Filipe: "se deixa só o mesmo gráfico para o profissional é como se você não alterou
        nada". A curva é a mesma DE PROPÓSITO, e uma nota de rodapé não sustenta essa
        afirmação. O aviso vem antes do gráfico, com o achado do ensaio que a justifica, e
        aponta onde a diferença ESTÁ para ser conferida.
      */}
      {ordemAberta && (
        <div
          className="relative mt-3 rounded-[14px] border p-3"
          style={{ background: "rgba(255,255,255,.06)", borderColor: "rgba(255,255,255,.1)" }}
        >
          <p className="text-xs font-semibold" style={{ color: "#F3F1EA" }}>
            Por que esta curva é igual à da periodização ondulatória
          </p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: "#B9C6D6" }}>
            Porque neste modelo ela tem que ser. O volume e a intensidade da semana são os mesmos; o que muda é a ORDEM
            das sessões dentro da semana, escolhida no dia conforme a agenda e a resposta do aluno. No ensaio que
            compara os dois modelos de frente (Colquhoun, 2017), intensidade e volume não diferiram entre os grupos, e
            os ganhos foram semelhantes. Uma curva diferente aqui seria um modelo que ninguém estudou.
          </p>
          <p className="mt-1.5 text-xs leading-relaxed" style={{ color: "#B9C6D6" }}>
            A diferença está em outros dois lugares, e é neles que vale comparar: as sessões vêm por LETRA (A, B, C) e
            não por número, porque a semana é um conjunto e não uma sequência; e a marca de cada semana na régua vem
            tracejada, para lembrar que a dose da semana está fechada e a sequência dela não. Quando um dia cair, a
            escolha de qual sessão manter é sua.
          </p>
        </div>
      )}
      {/* FAIXAS DE FASE, acima do plot e alinhadas por porcentagem com as curvas.
          Cada faixa é um mesociclo real: nome, intervalo de semanas e os ícones do
          que se treina mais nela (só quando a faixa é larga o bastante para eles
          não espremerem o nome). */}
      <div className="relative mt-4 h-8 min-w-[560px]" aria-hidden>
        {g.fases.map((f) => {
          const fam = FAIXA_FASE[f.indice % FAIXA_FASE.length];
          const largura = pctX(f.x1) - pctX(f.x0);
          const focos = largura > 14 ? posicoesFocos(f, 0, 12, 5) : [];
          return (
            <div
              key={f.indice}
              className="absolute inset-y-0 flex items-center gap-2 overflow-hidden rounded-[8px] border px-2.5"
              style={{
                left: `${pctX(f.x0)}%`,
                width: `calc(${largura}% - 3px)`,
                background: fam.bg,
                borderColor: fam.borda,
                color: fam.tinta,
              }}
            >
              {/* Só o NOME na faixa: o intervalo de semanas já está escrito na régua
                  logo abaixo, e repeti-lo aqui truncava o nome da fase. */}
              <span className="min-w-0 flex-1 truncate text-2xs font-semibold" title={`${f.nome} · ${f.spanSemanas}`}>
                {f.nome}
              </span>
              {focos.length > 0 && (
                <span className="flex shrink-0 items-center gap-1">
                  {focos.map((p, i) => (
                    <svg key={i} width={12} height={12} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <title>{p.foco.label}</title>
                      {p.foco.glifo.paths.map((d, j) => (
                        <path key={j} d={d} />
                      ))}
                      {p.foco.glifo.circles?.map((c, j) => (
                        <circle key={`c${j}`} cx={c.cx} cy={c.cy} r={c.r} />
                      ))}
                    </svg>
                  ))}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* O PLOT. O SVG leva só geometria (esticada na largura); texto, bandeira e
          pontos são HTML por cima, posicionados pelas coordenadas reais de cada
          semana. */}
      <div className="relative mt-2 h-[200px] min-w-[560px]">
        <svg
          viewBox={`0 ${vbTop} ${g.largura} ${vbAltura}`}
          preserveAspectRatio="none"
          className="h-full w-full"
          role="img"
          aria-label={`Progressão de volume, esforço médio e complexidade ao longo de ${g.microTicks.length} semanas, com as fases do plano${atual ? `, semana atual ${atual.semana}` : ""}`}
        >
          <defs>
            <linearGradient id={`vol-${gid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={SERIE_NAVY.vol} stopOpacity="0.35" />
              <stop offset="100%" stopColor={SERIE_NAVY.vol} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* semanas de descarga: coluna âmbar discreta atrás das curvas */}
          {g.alivios.map((a, i) => (
            <rect key={i} x={a.x - a.w / 2} y={vbTop} width={a.w} height={vbAltura} fill="rgba(232,163,23,.10)" />
          ))}
          {/* a semana de hoje, quando o plano já está rodando */}
          {atual && (
            <rect x={atual.x - passoSemana / 2} y={vbTop} width={passoSemana} height={vbAltura} fill="rgba(255,255,255,.06)" />
          )}
          {grade.map((y, i) => (
            <line key={i} x1={0} y1={y} x2={g.largura} y2={y} stroke="rgba(255,255,255,.07)" vectorEffect="non-scaling-stroke" />
          ))}

          <path d={g.areaVolume} fill={`url(#vol-${gid})`} stroke="none" />
          {g.series.map((s) => (
            <path
              key={s.id}
              d={s.d}
              fill="none"
              stroke={SERIE_NAVY[s.id] ?? s.cor}
              strokeWidth={s.id === "cpx" ? 2 : 3}
              strokeDasharray={s.id === "cpx" ? "6 6" : undefined}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        {/* eixo qualitativo: os valores são relativos, então o que orienta é o sentido */}
        <span className="absolute left-0 top-1 text-2xs" style={{ color: "#8FA0B5" }}>
          maior
        </span>
        <span className="absolute bottom-1 left-0 text-2xs" style={{ color: "#8FA0B5" }}>
          menor
        </span>

        {atual && (
          <>
            {/* os dois pontos do protótipo, sobre volume e esforço da semana de hoje */}
            <span
              aria-hidden
              className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ left: `${pctX(atual.x)}%`, top: `${pctY(atual.vol)}%`, background: "#0B1628", boxShadow: `0 0 0 3px ${SERIE_NAVY.vol}` }}
            />
            <span
              aria-hidden
              className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ left: `${pctX(atual.x)}%`, top: `${pctY(atual.int)}%`, background: "#0B1628", boxShadow: `0 0 0 3px ${SERIE_NAVY.int}` }}
            />
            <span
              className="absolute -translate-x-1/2 whitespace-nowrap rounded-[8px] px-2 py-1 text-2xs font-bold"
              style={{ left: `${pctX(atual.x)}%`, top: 0, background: "#FFFFFF", color: "#0B1628" }}
            >
              Você está aqui · S{atual.semana}
            </span>
          </>
        )}
      </div>

      {/* RÉGUA DE SEMANAS: um chip por microciclo, alinhado com a curva. O rótulo
          "S1..Sn" é espaçado (num plano anual, um a cada quatro) e o tipo só
          aparece quando a semana NÃO é de carga, que é o que muda a leitura. */}
      <div className="relative mt-3 h-9 min-w-[560px]">
        {g.microTicks.map((t, i) => {
          const ehAtual = atual != null && t.semana === atual.semana;
          const fundo =
            t.tipo === "deload"
              ? "rgba(232,163,23,.2)"
              : t.tipo === "teste"
                ? "rgba(20,179,186,.2)"
                : "rgba(255,255,255,.06)";
          const tinta = t.tipo === "deload" ? "#F0B429" : t.tipo === "teste" ? "#7FE3D8" : "#B9C6D6";
          return (
            <div
              key={i}
              className="absolute top-0 -translate-x-1/2 text-center"
              style={{ left: `${pctX(t.x)}%`, width: `${larguraChip}%` }}
            >
              <span
                className="tabular block truncate rounded-[6px] py-0.5 text-2xs font-semibold"
                style={
                  ehAtual
                    ? { background: "#F3F1EA", color: "#0B1628" }
                    : { background: fundo, color: tinta, ...(ordemAberta ? { border: `1px dashed ${tinta}` } : null) }
                }
                title={`Semana ${t.semana} · ${TIPO_LABEL[t.tipo]}`}
              >
                {t.rotular ? `S${t.semana}` : " "}
              </span>
              {t.tipo !== "carga" && t.rotular && (
                <span className="mt-0.5 block truncate text-2xs" style={{ color: "#8FA0B5" }}>
                  {TIPO_LABEL[t.tipo]}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {tiposSemana.length > 1 && (
        <div className="relative mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-2xs font-semibold uppercase tracking-wide" style={{ color: "#8FA0B5" }}>
            Semanas
          </span>
          {tiposSemana.map((t) => (
            <span key={t} className="flex items-center gap-1.5 text-xs" style={{ color: "#B9C6D6" }}>
              <span
                aria-hidden
                className="h-2 w-3.5 rounded-full"
                style={{
                  background:
                    t === "deload" ? "rgba(232,163,23,.55)" : t === "teste" ? "rgba(20,179,186,.55)" : "rgba(255,255,255,.25)",
                }}
              />
              {TIPO_LABEL[t]}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

/* ================================ Mesociclo ================================ */

/**
 * O QUE O BLOCO PESA, agregado das semanas dele pela MESMA fonte do gráfico e da régua
 * (`agregadoSemana`). Volume é SOMA (a dose total do bloco) e esforço é MÉDIA, e é por isso
 * que os dois rótulos carregam a agregação: soma e média reagem de formas opostas ao mesmo
 * gesto de edição.
 *
 * A complexidade fica de fora de propósito. O motor não tem magnitude para ela: o único sinal
 * por bloco é a contagem de métodos avançados, e o que a fase declara é a DIREÇÃO. Barra de
 * complexidade seria uma escala inventada, então ela continua palavra.
 */
export interface MagnitudeMeso {
  /** Σ do volume das semanas do bloco (séries×reps da força + minutos de aeróbio). */
  volume: number;
  /** média do esforço médio das semanas parseáveis; null quando nenhuma tem %1RM, RIR nem PSE. */
  esforco: number | null;
}

export function magnitudeDoMeso(meso: Mesociclo): MagnitudeMeso {
  let volume = 0;
  let soma = 0;
  let n = 0;
  for (const w of meso.microciclos) {
    const a = agregadoSemana(w);
    volume += a.volume;
    if (a.intensidade != null) {
      soma += a.intensidade;
      n++;
    }
  }
  return { volume, esforco: n > 0 ? soma / n : null };
}

/**
 * Os tetos do PLANO. A barra de um cartão só quer dizer alguma coisa se ela comparar bloco
 * com bloco: normalizar cada bloco contra ele mesmo daria três barras cheias e nenhuma
 * informação. É o mesmo raciocínio do teto da régua de semanas.
 */
export interface TetosDoPlano {
  volume: number;
  esforco: number;
}

export function tetosDoPlano(macro: Macrociclo): TetosDoPlano {
  const mags = macro.mesociclos.map(magnitudeDoMeso);
  return {
    volume: Math.max(1, ...mags.map((m) => m.volume)),
    esforco: Math.max(1, ...mags.map((m) => m.esforco ?? 0)),
  };
}

/** Quanto este bloco ocupa do maior do plano, com piso visível para bloco pequeno não sumir. */
function pctDoTeto(valor: number, teto: number): number {
  if (!(teto > 0)) return 0;
  return Math.max(6, Math.min(100, Math.round((valor / teto) * 100)));
}

/** Rótulo de exibição das variáveis traváveis (o motor chama de "intensidade", a tela de esforço). */
export const VARIAVEL_LABEL: Record<VariavelTravavel, string> = {
  volume: "Volume",
  intensidade: "Esforço",
  complexidade: "Complexidade",
};

/** Famílias da faixa do topo do cartão, na mesma ordem das faixas de fase do gráfico. */
const TOPO_FASE = ["bg-analysis-fill", "bg-primary", "bg-warning-fill"] as const;

/** Uma linha "rótulo, barra, tendência". A barra é proporcional; o número não é impresso
 *  porque ele não tem unidade: o que se lê é a comparação com o maior bloco do plano. */
function LinhaMagnitude({
  rotulo,
  pct,
  tendencia,
  fill,
}: {
  rotulo: string;
  pct: number;
  tendencia: string;
  fill: string;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,auto)_minmax(2.5rem,1fr)_auto] items-center gap-2">
      <span className="text-xs text-ink-2">{rotulo}</span>
      <span
        role="img"
        aria-label={`${rotulo} deste bloco: ${pct}% do maior bloco deste plano`}
        className="block h-1.5 overflow-hidden rounded-full bg-surface-mute"
      >
        <span className={cn("block h-full rounded-full", fill)} style={{ width: `${pct}%` }} />
      </span>
      <b className="text-xs text-ink">{tendencia}</b>
    </div>
  );
}

/**
 * Linha de variável SEM magnitude: mesma grade das outras, com um TRAÇO no lugar da barra.
 *
 * O traço é o ponto: ele diz "esta variável não tem escala aqui" na mesma linha em que as
 * outras duas mostram a delas, em vez de deixar o leitor supor que a barra ficou faltando.
 * O porquê vive no title e no aria-label, uma vez por linha, e não como um parágrafo
 * repetido em cada um dos três cartões.
 */
function LinhaSemBarra({ rotulo, tendencia, porque }: { rotulo: string; tendencia: string; porque: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,auto)_minmax(2.5rem,1fr)_auto] items-center gap-2">
      <span className="text-xs text-ink-2">{rotulo}</span>
      <span
        role="img"
        aria-label={`${rotulo}: sem barra, ${porque}`}
        title={porque}
        className="flex h-1.5 items-center"
      >
        <span aria-hidden className="block h-px w-full rounded-full bg-border" />
      </span>
      <b className="text-xs text-ink">{tendencia}</b>
    </div>
  );
}

/**
 * O CARTÃO DO BLOCO É UM SELETOR, E NÃO UMA GAVETA.
 *
 * ## O que estava errado
 *
 * O cartão abria no lugar. Numa coluna de 280px isso era ilegível, então ele passou a ocupar
 * a linha inteira quando aberto (`col-span-full`) e aí virou outra coisa: como a grade
 * reorganiza o que sobra, abrir o primeiro cartão o deixava sozinho em cima e empurrava os
 * outros dois para baixo; abrir o terceiro deixava os dois primeiros em cima e o painel
 * embaixo. O mesmo gesto colocava o conteúdo em lugares diferentes da tela. O Filipe:
 * "abre em toda tela, mas quando é o segundo ele abre embaixo, está muito esquisito".
 *
 * ## O desenho agora
 *
 * Os cartões são a fileira de seleção e o detalhe é UM painel, sempre no mesmo lugar, logo
 * abaixo dela (`PainelDoBloco`). Clicar num cartão não abre nada: ele move o foco do plano
 * para aquele bloco, e o painel, a semana em foco e o trilho passam a falar dele. Um foco
 * só na tela inteira, em vez de dois (o bloco aberto de um lado, a semana escolhida do
 * outro) que podiam apontar para pontos diferentes do plano ao mesmo tempo.
 *
 * A face continua carregando a assinatura do bloco (as três direções e as duas barras),
 * porque é ela que permite COMPARAR os blocos entre si; o painel é o detalhe de um.
 */
export function MesocicloCard({
  meso,
  indice,
  emFoco,
  atual,
  tetos,
  onFocar,
}: {
  meso: Mesociclo;
  indice: number;
  /** este é o bloco que o resto da tela está mostrando */
  emFoco?: boolean;
  /** este é o bloco em que o plano está hoje (pelo calendário) */
  atual?: boolean;
  /**
   * Os tetos do plano inteiro (`tetosDoPlano`), para as barras compararem bloco com bloco.
   * Sem eles não há com o que comparar, e o cartão volta às tendências em palavra: barra
   * sem referência declarada seria número decorativo.
   */
  tetos?: TetosDoPlano;
  onFocar: (meso: Mesociclo) => void;
}) {
  // O que este bloco pesa, da MESMA fonte do gráfico e do calendário.
  const mag = React.useMemo(() => magnitudeDoMeso(meso), [meso]);

  return (
    <button
      type="button"
      onClick={() => onFocar(meso)}
      aria-pressed={emFoco}
      className={cn(
        "flex w-full flex-col rounded-card border bg-surface p-4 text-left transition-colors",
        emFoco ? "border-ink shadow-soft" : "border-border hover:bg-surface-soft",
      )}
    >
      <div className="flex items-start gap-3">
        {/* Identidade de fase: quadrado navy com o número, no vocabulário do redesign. */}
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-control font-display text-sm font-bold"
          style={{ background: "#0B1628", color: "#F3F1EA" }}
        >
          {indice + 1}
        </span>
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
      </div>

      {/*
        A ASSINATURA DO BLOCO. As duas barras comparam ESTE bloco com o maior bloco do MESMO
        plano, que é a única comparação que quer dizer alguma coisa: normalizar cada bloco
        contra ele mesmo daria três barras cheias. O rótulo carrega a agregação (soma x
        média), porque as duas reagem de formas opostas ao mesmo gesto de edição.
      */}
      {tetos && (
        <div className="mt-3 space-y-2 border-t border-border pt-3">
          <LinhaMagnitude
            rotulo="Volume (soma)"
            pct={pctDoTeto(mag.volume, tetos.volume)}
            tendencia={TEND_LABEL[meso.tendenciaVolume]}
            fill="bg-analysis-fill"
          />
          {mag.esforco != null ? (
            <LinhaMagnitude
              rotulo="Esforço médio"
              pct={pctDoTeto(mag.esforco, tetos.esforco)}
              tendencia={TEND_LABEL[meso.tendenciaIntensidade]}
              fill="bg-primary"
            />
          ) : (
            <LinhaSemBarra
              rotulo="Esforço médio"
              tendencia={TEND_LABEL[meso.tendenciaIntensidade]}
              porque="as semanas deste bloco não declaram carga relativa, reserva de repetições nem esforço percebido, então não há o que medir"
            />
          )}
          <LinhaSemBarra
            rotulo="Complexidade"
            tendencia={TEND_LABEL[meso.tendenciaComplexidade]}
            porque="o plano declara a direção da complexidade, e o motor não produz uma magnitude por bloco para ela"
          />
        </div>
      )}
    </button>
  );
}

/**
 * O PAINEL DO BLOCO EM FOCO: as regras da fase, e só elas.
 *
 * ## O que saiu daqui, e por quê
 *
 * Este painel listava as SEMANAS do bloco, cada uma abrindo o editor completo de cada
 * sessão. Três problemas de uma vez: o editor aparecia duas vezes na mesma tela (aqui e na
 * semana em foco, logo abaixo), a lista de semanas repetia o calendário que está logo acima,
 * e a semana em foco repetia de novo a semana que este painel já mostrava aberta. O Filipe:
 * "está replicando informações, pois logo abaixo tem a informação da semana em foco".
 *
 * A divisão agora é por PERGUNTA, e cada uma tem um lugar só:
 *   · o calendário responde "que semanas existem e onde estou";
 *   · este painel responde "o que esta fase faz e por quais regras";
 *   · a semana em foco responde "o que tem nesta semana";
 *   · o editor responde "com que dose".
 *
 * As três colunas daqui não são estética: são as três decisões que se toma sobre uma fase.
 * O que treinar, quando avançar ou recuar, e o que vigiar enquanto ela corre.
 */
export function PainelDoBloco({
  meso,
  indice,
  ctx,
  editavel,
  onChange,
  reavaliarHref,
  semanaCorrente,
}: {
  meso: Mesociclo;
  indice: number;
  ctx: ContextoFaixa;
  editavel: boolean;
  onChange?: (m: Mesociclo) => void;
  /** destino do "Registrar reavaliação" (só quando há aluno com plano) */
  reavaliarHref?: string;
  /** semana corrente do plano, para saber se a reavaliação deste bloco já está à porta */
  semanaCorrente?: number;
}) {
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

  const parametros = meso.parametros.flatMap((id) => {
    const p = getParam(id);
    return p ? [p] : [];
  });

  return (
    <Card className="p-4 md:p-5">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <Eyebrow>Bloco em foco</Eyebrow>
        <span className="font-display text-base font-bold text-ink">
          {indice + 1}. {rotuloMeso(meso, indice)}
        </span>
        <span className="text-xs text-ink-3">
          semanas {meso.semanaInicio} a {meso.semanaFim}
        </span>
      </div>

      <div className="mt-4 grid gap-x-6 gap-y-5 lg:grid-cols-3">
        <section>
          <Eyebrow className="mb-2">O que treinar</Eyebrow>
          <div className="space-y-3">
            <ListaChips titulo="Capacidades priorizadas" itens={meso.capacidades} />
            <ListaChips
              titulo="Modalidades em foco"
              itens={(meso.modalidades ?? []).map((id) => getModalidade(id)?.nome ?? id)}
            />
            <ListaChips titulo="Tipos de exercício" itens={meso.tiposExercicio} />
          </div>
        </section>

        <section>
          <Eyebrow className="mb-2">Quando avançar ou recuar</Eyebrow>
          <div className="space-y-3">
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
            {editavel ? (
              <label className="flex items-center gap-2 rounded-[14px] bg-surface-soft p-2.5 text-sm text-ink-2">
                <input
                  type="checkbox"
                  checked={Boolean(meso.reavaliacao)}
                  onChange={(e) => onChange?.({ ...meso, reavaliacao: e.target.checked })}
                  className="h-4 w-4 accent-[var(--primary)]"
                />
                <CalendarCheck className="h-4 w-4 shrink-0 text-analysis" aria-hidden />
                Reavaliar ao fim deste bloco (semana {meso.semanaFim})
              </label>
            ) : (
              meso.reavaliacao && (
                <p className="flex items-center gap-2 text-sm text-ink-2">
                  <CalendarCheck className="h-4 w-4 shrink-0 text-analysis" aria-hidden />
                  Reavaliar ao fim deste bloco (semana {meso.semanaFim}).
                </p>
              )
            )}
            {mostrarReavaliar && (
              <Link to={reavaliarHref!} className={buttonClasses("secondary", "sm")}>
                <CalendarCheck className="h-4 w-4" /> Registrar reavaliação
              </Link>
            )}
          </div>
        </section>

        <section>
          <Eyebrow className="mb-2">Acompanhar e travar</Eyebrow>
          <div className="space-y-3">
            {parametros.length > 0 && (
              <div>
                <p className="mb-1 text-2xs font-semibold uppercase tracking-wide text-ink-3">Parâmetros do bloco</p>
                <div className="flex flex-wrap gap-1.5">
                  {parametros.map((p) => (
                    <Pill key={p.id} tone="neutral">
                      {p.sigla ?? p.nome}
                    </Pill>
                  ))}
                </div>
              </div>
            )}

            {/*
              CONTROLE E CONSEQUÊNCIA NO MESMO LUGAR. A trava tinha o botão aqui e a
              explicação num cartão âmbar do trilho, do outro lado da tela: quem ligava não
              lia, e quem lia não sabia onde desligar.
            */}
            <div className="rounded-[14px] border border-border bg-surface-soft p-3">
              {editavel ? (
                <>
                  <p className="mb-1.5 text-2xs font-semibold uppercase tracking-wide text-ink-3">
                    Travar (não deixa progredir)
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(["volume", "intensidade", "complexidade"] as VariavelTravavel[]).map((v) => {
                      const on = travadas.includes(v);
                      return (
                        <button
                          key={v}
                          type="button"
                          onClick={() => toggleTrava(v)}
                          aria-pressed={on}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors",
                            on ? "border-primary bg-primary-tint text-primary" : "border-border text-ink-2 hover:bg-surface",
                          )}
                        >
                          {on ? <Lock className="h-3 w-3" aria-hidden /> : <LockOpen className="h-3 w-3" aria-hidden />}
                          {VARIAVEL_LABEL[v]}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                travadas.length > 0 && (
                  <p className="flex items-start gap-1.5 text-xs font-medium text-ink-2">
                    <Lock className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
                    Sem progressão neste bloco: {travadas.map((v) => VARIAVEL_LABEL[v].toLowerCase()).join(", ")}.
                  </p>
                )
              )}
              {travadas.length > 0 && (
                <p className="mt-2 text-2xs leading-snug text-ink-3">
                  O alvo destas variáveis fica no patamar da primeira semana de carga até você destravar.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </Card>
  );
}

/* ================================ Microciclo (semana) ================================ */

/**
 * Resumo dos métodos de série usados na semana ("2x Bi-set · 1x Drop-set"), para o método
 * ficar visível no nível do microciclo sem abrir cada sessão. Cada grupo (bi/tri/super-set)
 * conta UMA vez, e não uma por exercício.
 */
function variacoesDoMicro(micro: Microciclo): { metodo: MetodoSerie; n: number }[] {
  const conta = new Map<MetodoSerie, number>();
  for (const s of micro.sessoes) {
    for (const seg of agruparBlocosPorMetodo(s.blocos)) {
      const m = seg.tipo === "grupo" ? seg.metodo : seg.bloco.metodo;
      if (!m || m === "tradicional") continue;
      conta.set(m, (conta.get(m) ?? 0) + 1);
    }
  }
  return [...conta.entries()].map(([metodo, n]) => ({ metodo, n }));
}

/**
 * OS CONTROLES DA SEMANA, na tela do editor.
 *
 * Eram a cabeça de uma linha sanfonada dentro do cartão do bloco, no meio de outras três ou
 * quatro semanas, cada uma carregando o editor inteiro de cada sessão. Tudo o que é DA
 * SEMANA passou a viver na tela da semana: o tipo (carga, descarga, teste), o que mudou em
 * relação à anterior, a faixa da diretriz e a porta de adicionar sessão.
 */
export function ControlesDaSemana({
  micro,
  microAnterior,
  ctx,
  editavel,
  onChange,
}: {
  micro: Microciclo;
  /** a semana anterior no mesmo bloco: alimenta o selo de estado e o "o que mudou" */
  microAnterior?: Microciclo;
  ctx: ContextoFaixa;
  editavel: boolean;
  onChange: (m: Microciclo) => void;
}) {
  const variacoes = variacoesDoMicro(micro);

  // Estado da semana (progressão/manutenção/regressão/descarga/teste), derivado do agregado
  // real vs a semana anterior. Descarga e teste já aparecem no tipo; para as de carga, o selo
  // de estado diz para onde a dose foi. "o que mudou" lista as diferenças.
  const estado = estadoSemana(micro, microAnterior);
  const mostrarSeloEstado = micro.tipo === "carga" && estado !== "inicio";
  const mudancas = microAnterior ? compararAlvos(microAnterior, micro) : null;

  return (
    <div className="space-y-2.5 rounded-card border border-border bg-surface-soft p-3">
      <div className="flex flex-wrap items-center gap-2">
        {editavel ? (
          <>
            <Eyebrow>Tipo da semana</Eyebrow>
            {/* Segmentado do protótipo: trilho branco com borda; o segmento ativo é a
                pílula escura (bg-ink), os inativos ficam em texto. */}
            <div className="inline-flex gap-0.5 rounded-full border border-border bg-surface p-0.5">
              {(["carga", "deload", "teste"] as TipoMicrociclo[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() =>
                    onChange({
                      ...micro,
                      tipo: t,
                      nota: t === "deload" ? "Semana de descarga: reduza volume e intensidade para recuperar." : undefined,
                    })
                  }
                  aria-pressed={micro.tipo === t}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                    micro.tipo === t ? "bg-ink text-surface" : "text-ink-2 hover:bg-surface-soft",
                  )}
                >
                  {TIPO_LABEL[t]}
                </button>
              ))}
            </div>
          </>
        ) : (
          <Pill tone={micro.tipo === "deload" ? "warning" : micro.tipo === "teste" ? "analysis" : "neutral"}>
            {TIPO_LABEL[micro.tipo]}
          </Pill>
        )}
        <span className="text-xs text-ink-2">{fraseDeSessoes(micro.sessoes)}</span>
        {/*
          O SELO DE ESTADO É O ÚLTIMO DA LINHA, e isso não é ordem de importância: é o que
          impede a linha de dançar. Ele existe só em algumas semanas (a primeira do bloco não
          tem com o que comparar, e descarga e teste já se dizem no tipo). No meio da linha,
          aparecer e sumir empurrava "3 sessões + 3 complementos" uns 90 px para o lado a cada
          troca de semana, e o profissional trocava de semana o tempo todo. Ancorado à direita
          com `ml-auto`, ele entra e sai sem mover nada que já estava lá.
        */}
        {mostrarSeloEstado && (
          <span className="ml-auto shrink-0">
            <Pill tone={ESTADO_TONE[estado]}>{ESTADO_LABEL[estado]}</Pill>
          </span>
        )}
      </div>

      {variacoes.length > 0 && (
        <p className="text-2xs text-ink-3">
          Variações: {variacoes.map((v) => `${v.n}x ${getMetodo(v.metodo)?.nome}`).join(" · ")}
        </p>
      )}

      {/* O que mudou em relação à semana anterior. No editor os campos mudam à mão, então a
          lista só serve a quem está lendo o plano, não a quem o está reescrevendo. */}
      {!editavel && mudancas && (
        <div className="rounded-[14px] border border-dashed border-border bg-surface p-2.5">
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
    </div>
  );
}

/**
 * O EFEITO DA ÚLTIMA EDIÇÃO, na hora e em número.
 *
 * Sem isto, a única resposta ao gesto era a curva se redesenhar, e ninguém guarda de memória
 * onde ela estava dois segundos atrás. Foi assim que um professor concluiu que a edição dele
 * não tinha pegado (ver efeitoDaEdicao.ts). Mora na tela do editor, que é onde o gesto
 * acontece.
 */
export function EfeitoDaEdicaoCard({ efeito, onDispensar }: { efeito: EfeitoDaEdicao; onDispensar: () => void }) {
  return (
    <div className="rounded-card border border-analysis/30 bg-analysis-tint/40 p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-ink">O que a sua edição mudou na semana {efeito.semana}</p>
        <button
          onClick={onDispensar}
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
        {/* O gesto foi num dia; o número acima é da semana. O dia aparece ao lado, com
            o nome da sessão, para quem dobrou o treino de terça ler que dobrou. */}
        {efeito.sessao && (
          <span>
            <b className="text-ink">Nesta sessão ({efeito.sessao.nome})</b> volume {formatarDelta(efeito.sessao.deltaVolume)}
            {efeito.sessao.exerciciosAntes !== efeito.sessao.exerciciosDepois
              ? `, ${efeito.sessao.exerciciosAntes} para ${efeito.sessao.exerciciosDepois} exercícios`
              : ""}
          </span>
        )}
      </div>
      {efeito.leitura && <p className="mt-1.5 text-xs leading-relaxed text-ink-2">{efeito.leitura}</p>}
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
    <details className="rounded-[14px] border border-dashed border-border bg-surface-soft text-xs">
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
  chave: "series" | "reps" | "intensidade" | "intervalo" | "formato" | "duracao" | "recuperacao" | "tiros" | "modalidade";
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
/*
 * A ATIVIDADE VEM PRIMEIRO, e por muito tempo ela não vinha de jeito nenhum.
 *
 * O bloco aeróbio sempre teve `modalidade` (é ela que o cartão de leitura imprime como título
 * e que o app do aluno usa para a foto), e o editor não oferecia campo nenhum para trocá-la:
 * quem acrescentava cardio recebia caminhada e caminhada ficava, mesmo com bicicleta e
 * piscina declaradas na etapa de equipamentos. Editar "Formato" e "Duração" de uma atividade
 * que não dá para mudar é o formulário respondendo a pergunta errada.
 *
 * Ela é o primeiro campo porque é a que manda nas outras: trocar caminhada por bicicleta muda
 * o que "moderada" quer dizer na prática, e ninguém escolhe a duração antes de escolher o quê.
 */
const CAMPOS_AEROBIO: CampoBloco[] = [
  { chave: "modalidade", rotulo: "Atividade" },
  { chave: "formato", rotulo: "Formato" },
  { chave: "duracao", rotulo: "Duração" },
  { chave: "intensidade", rotulo: "Intensidade" },
  { chave: "recuperacao", rotulo: "Recuperação" },
];
const CAMPOS_AEROBIO_COM_TIROS: CampoBloco[] = [
  { chave: "modalidade", rotulo: "Atividade" },
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

/**
 * AS ATIVIDADES AERÓBIAS QUE ESTE ALUNO TEM COMO EXECUTAR.
 *
 * Derivada do catálogo, não de uma lista de rótulos: modalidade aeróbia é a que tem exercício
 * com `doseAerobia`, exatamente o critério que o motor usa em `modalidadeAerobia`. Duas listas
 * escritas à mão para a mesma pergunta divergem no dia em que o catálogo cresce.
 *
 * A regra de disponibilidade é a MESMA do resto do produto (peso corporal sempre disponível,
 * o resto precisa estar declarado). Sem ela, o seletor ofereceria hidroginástica a quem não
 * declarou piscina, que é o defeito que o próprio motor já teve e corrigiu: prescrever o
 * inexequível é pior que oferecer menos opção.
 *
 * O valor ATUAL entra na lista mesmo quando o filtro o excluiria. Um plano gerado antes, ou
 * com outro conjunto de equipamentos, não pode perder a modalidade dele só por abrir o editor.
 */
function modalidadesAerobias(equipamentos: string[] | undefined, atual?: string): { id: string; nome: string }[] {
  const ids = new Set<string>();
  for (const e of exercises) {
    if (!e.doseAerobia || !e.modalidade) continue;
    const temEquip = !equipamentos?.length || e.equipamento === "Peso corporal" || equipamentos.includes(e.equipamento);
    if (temEquip) ids.add(e.modalidade);
  }
  if (atual) ids.add(atual);
  return [...ids]
    .map((id) => ({ id, nome: getModalidade(id)?.nome ?? id }))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}
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
    <div className="overflow-hidden rounded-[14px] border border-border bg-surface">
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
    <div className="overflow-hidden rounded-[14px] border border-border bg-surface">
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
        <details className="rounded-[14px] border border-dashed border-border bg-surface-soft text-2xs">
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
  microAnterior,
  tipoSemana = "carga",
  ocultarCabecalho,
}: {
  sessao: Sessao;
  ctx: ContextoFaixa;
  editavel: boolean;
  onChange: (s: Sessao) => void;
  /**
   * Ausente = sem lixeira. O Treino do dia passava `() => {}` e a tela exibia um botão de
   * remover que não removia nada; controle que existe e não faz é pior que controle que
   * falta, porque ensina a desconfiar dos outros.
   */
  onRemover?: () => void;
  /**
   * A semana imediatamente anterior DO PLANO (não a do bloco): o selo promete "em relação à
   * semana anterior", e no primeiro microciclo de cada bloco a comparação com o bloco deixaria
   * quatro exercícios sem resposta justamente onde a fase muda.
   */
  microAnterior?: Microciclo;
  tipoSemana?: Microciclo["tipo"];
  /**
   * Esconde a linha de nome e ações da sessão. No editor da semana quem nomeia e troca a
   * sessão são as pílulas logo acima, e repetir o nome como título fazia a mesma sessão
   * aparecer duas vezes na mesma tela, com dois lugares diferentes para renomeá-la.
   */
  ocultarCabecalho?: boolean;
}) {
  const faixa = getFaixa(ctx.objetivo);

  const addBloco = (slug: string) => {
    if (!slug) return;
    const ex = exercises.find((e) => e.slug === slug);
    const id = nid("blk");
    onChange({
      ...sessao,
      blocos: [
        ...sessao.blocos,
        {
          id,
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
    revelar(id);
  };

  /*
   * ACRESCENTAR CARDIO ABRE O CARDIO.
   *
   * Este botão despejava um bloco de caminhada no FIM da lista e não dizia nada. Numa sessão
   * de cinco exercícios o bloco novo nascia fora da tela, e a única resposta ao clique era
   * nenhuma: parecia que o botão não tinha funcionado. Quem descobria que funcionara ainda
   * tinha que caçar a linha e abri-la para chegar nas opções.
   *
   * Agora ele entra JÁ ABERTO, com atividade, formato, duração e intensidade à mão, e a lista
   * rola até ele. É o mesmo contrato de "Adicionar exercício", que passa pelo seletor e
   * portanto sempre teve uma resposta ao gesto.
   *
   * O id da modalidade é o CANÔNICO (`m-caminhada`). Aqui estava gravado "caminhada", sem o
   * prefixo, e `getModalidade` não resolvia: o cartão de leitura caía no rótulo genérico
   * "Aeróbio" e o app do aluno ficava sem a foto da atividade. O mesmo defeito já tinha sido
   * corrigido no motor (ver o comentário em data/periodizacao.ts); a porta do editor ficou
   * para trás.
   */
  const addCardio = () => {
    const id = nid("blk");
    // Caminhada é o padrão porque é de peso corporal, ou seja, nunca fica inexequível: é a
    // mesma escolha (e o mesmo motivo) que o motor faz em `modalidadeAerobia`. Só cai na
    // primeira da lista se um dia a caminhada sair do catálogo.
    const disponiveis = modalidadesAerobias(ctx.equipamentos);
    const modalidade = disponiveis.find((m) => m.id === "m-caminhada")?.id ?? disponiveis[0]?.id ?? "m-caminhada";
    onChange({
      ...sessao,
      blocos: [
        ...sessao.blocos,
        {
          id,
          tipo: "aerobio",
          modalidade,
          nome: getModalidade(modalidade)?.nome ?? "Aeróbio",
          formato: "Contínuo",
          duracao: "20 a 30 min",
          intensidade: "Moderada (teste da conversa; RPE 4 a 6)",
          recuperacao: "-",
        },
      ],
    });
    revelar(id);
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

  // Número de ordem do exercício NA SESSÃO (a ordem é parte da prescrição: aquecimento,
  // principal, acessório). Alimenta o quadrado numerado do protótipo; nada decorativo.
  const numeroDoBloco = (id: string) => sessao.blocos.findIndex((x) => x.id === id) + 1;

  /*
   * UMA LINHA ABERTA POR VEZ.
   *
   * Cada exercício mostrava, o tempo todo, quatro campos rotulados, o seletor de método de
   * série e a fileira "agrupar com o próximo". Cinco exercícios davam trinta controles
   * empilhados, e para saber o que a sessão prescreve era preciso ler o formulário inteiro.
   * A dose agora se lê em fichas na própria linha (protótipo do editor), e os controles
   * aparecem no exercício que está sendo mexido. Nada saiu: tudo está a um clique.
   */
  const [abertoId, setAbertoId] = React.useState<string | null>(null);
  const alternar = (id: string) => setAbertoId((a) => (a === id ? null : id));
  /*
   * REVELAR: abre a linha nova e leva o olho até ela.
   *
   * O bloco entra no FIM da lista, que numa sessão cheia é abaixo da dobra. Abrir sem rolar
   * resolveria metade do problema (a resposta existe, mas fora da tela). `block: "nearest"`
   * não rola nada quando a linha já está visível, então acrescentar na sessão curta não
   * sacode a página. O id novo espera o React pintar a lista antes de ser procurado.
   */
  const listaRef = React.useRef<HTMLUListElement>(null);
  const [revelarId, setRevelarId] = React.useState<string | null>(null);
  const revelar = (id: string) => {
    setAbertoId(id);
    setRevelarId(id);
  };
  React.useEffect(() => {
    if (!revelarId) return;
    listaRef.current?.querySelector(`[data-bloco="${revelarId}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    setRevelarId(null);
  }, [revelarId]);
  /*
   * ADICIONAR EXERCÍCIO PASSA PELA MESMA PORTA DE TROCAR.
   *
   * Era um <select> de 108 opções agrupadas dentro da caixa tracejada: escolher ali é rolar
   * uma lista de sistema, sem busca, sem o ranking do perfil do aluno e sem o motivo de um
   * exercício ser desaconselhado. A tela já tinha a porta boa, o seletor ranqueado usado em
   * "Trocar", e ela ficava a um clique de distância de quem trocava e inalcançável para quem
   * adicionava. O botão tracejado do protótipo abre essa porta.
   */
  const [adicionando, setAdicionando] = React.useState(false);
  // O fecho de flexibilidade só vira campo quando alguém pede (ou quando já existe um).
  const [fechoAberto, setFechoAberto] = React.useState(false);
  React.useEffect(() => setFechoAberto(false), [sessao.id]);

  return (
    /*
     * SEM BANDEJA. Os exercícios eram cartões brancos dentro de uma caixa cinza, e a caixa
     * não carregava informação nenhuma: só empilhava um nível de moldura entre a página e a
     * linha que interessa, encolhendo o respiro de cada cartão para caber. No protótipo os
     * cartões assentam direto na página, com ar entre eles. Cartão dentro de cartão é o
     * andaime que sobra quando o agrupamento já está dito pelo título e pelas pílulas.
     */
    <div className="space-y-2.5">
      {!ocultarCabecalho && (
        <div className="flex items-center gap-1.5">
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
          {editavel && onRemover && (
            <button onClick={onRemover} aria-label={`Remover ${sessao.nome}`} className="rounded p-1 text-ink-3 hover:bg-surface hover:text-[color:var(--cta-text)]">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {!editavel ? (
        <SessaoQuadro sessao={sessao} ctx={ctx} />
      ) : (
        <>
          {sessao.blocos.length === 0 && <p className="px-1 py-2 text-xs text-ink-3">Sessão sem exercícios. Adicione abaixo.</p>}

          <ul ref={listaRef} className="space-y-2.5">
            {segmentos.map((seg, si) => {
              if (seg.tipo === "grupo") {
                const info = getMetodo(seg.metodo);
                return (
                  <li key={seg.grupoId}>
                    {/* Colchete: as linhas do grupo ficam numa moldura única com a badge do
                        método e a instrução do catálogo; o método é do grupo, não de cada bloco. */}
                    <div className="rounded-[14px] border border-primary bg-primary-tint p-1.5">
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
                      <ul className="space-y-2">
                        {seg.blocos.map((b) => (
                          <li key={b.id} data-bloco={b.id}>
                            <BlocoRow
                              bloco={b}
                              numero={numeroDoBloco(b.id)}
                              ctx={ctx}
                              decisao={decisaoDoBloco(b, blocoAnteriorDe(microAnterior, b), tipoSemana, microAnterior?.tipo)}
                              ocultarMetodo
                              aberto={abertoId === b.id}
                              onAlternar={() => alternar(b.id)}
                              onChange={trocarBloco}
                              onRemover={() => removerBloco(b.id)}
                            />
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
                <li key={b.id} data-bloco={b.id}>
                  <BlocoRow
                    bloco={b}
                    numero={numeroDoBloco(b.id)}
                    ctx={ctx}
                    decisao={decisaoDoBloco(b, blocoAnteriorDe(microAnterior, b), tipoSemana, microAnterior?.tipo)}
                    aberto={abertoId === b.id}
                    onAlternar={() => alternar(b.id)}
                    onChange={trocarBloco}
                    onRemover={() => removerBloco(b.id)}
                  />
                  {podeBi && abertoId === b.id && (
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

          {/* "+ Adicionar exercício" do protótipo: um alvo de clique de largura cheia, e a
              escolha acontece no seletor ranqueado, com busca e com o motivo de cada
              exclusão. O cardio fica ao lado, menor, porque é a exceção. */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setAdicionando(true)}
              className="inline-flex min-h-[46px] flex-1 items-center justify-center gap-1.5 rounded-card border-2 border-dashed border-border text-sm font-semibold text-ink-2 transition-colors hover:border-primary hover:bg-primary-tint hover:text-primary"
            >
              <Plus className="h-4 w-4" aria-hidden /> Adicionar exercício
            </button>
            <button
              type="button"
              onClick={addCardio}
              className="inline-flex min-h-[46px] shrink-0 items-center gap-1.5 rounded-card border border-border px-3 text-sm font-semibold text-ink-2 transition-colors hover:bg-surface-soft hover:text-ink"
            >
              <HeartPulse className="h-4 w-4 text-analysis" aria-hidden /> Cardio
            </button>
          </div>

          {adicionando && (
            <SeletorExercicioSheet
              ctx={ctx}
              titulo="Adicionar exercício"
              onClose={() => setAdicionando(false)}
              onEscolher={(ex) => {
                addBloco(ex.slug);
                setAdicionando(false);
              }}
            />
          )}
        </>
      )}

      {/*
        Fecho de flexibilidade da sessão (onda F): editável no editor, nota no modo leitura.

        VAZIO ELE É UM LINK, NÃO UM FORMULÁRIO. É opcional e quase sempre fica em branco, e
        mesmo assim toda sessão terminava numa caixa de texto de duas linhas com rótulo em
        versalete: a última coisa que se via ao rolar a sessão era um campo por preencher que
        ninguém pediu. Como link ele ocupa uma linha, continua achável, e some do caminho de
        quem não usa. Quem já tem fecho escrito vê o campo aberto, como antes.
      */}
      {editavel ? (
        sessao.fecho == null && !fechoAberto ? (
          <button
            type="button"
            onClick={() => setFechoAberto(true)}
            className="inline-flex items-center gap-1 text-2xs font-semibold text-ink-3 transition-colors hover:text-primary"
          >
            <Plus className="h-3 w-3" aria-hidden /> Fecho de flexibilidade (opcional)
          </button>
        ) : (
          <div>
            <label
              htmlFor={`fecho-${sessao.id}`}
              className="mb-0.5 block text-2xs font-semibold uppercase tracking-wide text-ink-3"
            >
              Fecho de flexibilidade
            </label>
            <textarea
              id={`fecho-${sessao.id}`}
              autoFocus={fechoAberto && !sessao.fecho}
              value={sessao.fecho ?? ""}
              onChange={(e) => onChange({ ...sessao, fecho: e.target.value || undefined })}
              onBlur={() => !sessao.fecho && setFechoAberto(false)}
              rows={2}
              placeholder="Alongamento ao final da sessão (opcional)"
              className="w-full rounded-md border border-border bg-surface px-2 py-1 text-xs text-ink placeholder:text-ink-3/60 focus:border-primary focus:outline-none"
            />
          </div>
        )
      ) : (
        sessao.fecho && (
          <p className="rounded-md border border-border bg-surface-soft px-2 py-1 text-2xs text-ink-2">
            {sessao.fecho}
          </p>
        )
      )}
    </div>
  );
}

/* ================================ Bloco (exercício) ================================ */

/**
 * AS FICHAS DA LINHA FECHADA: o ALVO desta semana, e a faixa só quando não há alvo.
 *
 * A linha fechada imprimia a FAIXA de cada campo ("Séries 2 a 3", "Repetições 10 a 15",
 * "Intensidade leve a moderada"): três fichas longas, IDÊNTICAS em todos os exercícios da
 * sessão, que dizem o que o objetivo dosa e não o que este exercício faz nesta semana. A
 * faixa é constante do plano e já está impressa uma vez, logo acima (ver FaixaReferencia);
 * o que varia de linha para linha é o alvo, e é ele que a ficha passa a carregar. Abrir a
 * linha continua mostrando os dois, campo a campo, com a faixa como pista.
 */
function fichasDoBloco(b: BlocoSessao): TokenAlvo[] {
  if (b.tipo === "aerobio") {
    if (temAlvoAerobio(b)) return tokensAlvoAerobio(b).slice(0, 3);
  } else if (temAlvoForca(b)) {
    return tokensAlvoForca(b).slice(0, 3);
  }
  return camposDoBloco(b)
    .map((c) => ({ label: c.rotulo, value: (b[c.chave] as string | undefined) ?? "" }))
    .filter((c) => c.value)
    .slice(0, 3);
}

/** Tom do selo de decisão: progredir é ganho, aliviar é cuidado, ajustar é as duas coisas. */
const TOM_DECISAO: Record<DecisaoDoBloco["tom"], PillTone> = {
  progride: "success",
  mantem: "neutral",
  alivia: "warning",
  ajusta: "analysis",
};

function BlocoRow({
  bloco,
  numero,
  ctx,
  aberto,
  onAlternar,
  onChange,
  onRemover,
  ocultarMetodo,
  decisao,
}: {
  bloco: BlocoSessao;
  /** posição do bloco na sessão (1-based): vira o quadrado numerado do protótipo */
  numero?: number;
  ctx: ContextoFaixa;
  /** o que muda neste exercício em relação à semana anterior (ver decisaoDoBloco) */
  decisao?: DecisaoDoBloco | null;
  /** esta é a linha que está sendo mexida: só ela mostra campos e controles */
  aberto: boolean;
  onAlternar: () => void;
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
    <div className={cn("rounded-[18px] border bg-surface", aberto ? "border-primary" : "border-border")}>
      {/*
        A LINHA DO EXERCÍCIO (protótipo do editor): número, nome, grupo muscular e a dose em
        fichas. Fechada ela se LÊ; aberta ela se edita. Era só a forma aberta, sempre, para
        todos os exercícios ao mesmo tempo.
      */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3.5">
        {numero != null && (
          <span
            className={cn(
              "grid h-[38px] w-[38px] shrink-0 place-items-center rounded-control font-display text-sm font-bold",
              aerobio ? "bg-analysis-tint text-analysis-text" : "bg-primary-tint text-primary",
            )}
            aria-hidden
          >
            {numero}
          </span>
        )}
        {aerobio && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-analysis-tint px-2 py-0.5 text-2xs font-semibold uppercase tracking-wide text-analysis-text">
            <HeartPulse className="h-3 w-3" aria-hidden /> Cardio
          </span>
        )}
        {aberto ? (
          <span className="min-w-[9rem] flex-1">
            <input
              value={bloco.nome ?? ""}
              onChange={(e) => onChange({ ...bloco, nome: e.target.value })}
              aria-label={aerobio ? "Nome do bloco de cardio" : "Nome do exercício"}
              className="w-full min-w-0 rounded border border-transparent bg-transparent px-1 py-0.5 text-sm font-semibold text-ink hover:border-border focus:border-primary focus:outline-none"
            />
            {/* Grupo muscular do catálogo sob o nome, como no protótipo (dado real). */}
            {!aerobio && exAtual?.grupoMuscular && (
              <span className="block px-1 text-2xs text-ink-3">{exAtual.grupoMuscular}</span>
            )}
          </span>
        ) : (
          <button
            type="button"
            onClick={onAlternar}
            aria-expanded={aberto}
            // Piso de largura, e não min-w-0: sem ele o nome encolhia até "Remada na ..."
            // para caber as fichas na mesma linha. Com piso, as fichas é que descem de linha.
            className="min-w-[9rem] flex-1 rounded-control px-1 py-0.5 text-left"
          >
            <span className="block truncate text-sm font-semibold text-ink">{bloco.nome}</span>
            {!aerobio && exAtual?.grupoMuscular && (
              <span className="block truncate text-2xs text-ink-3">{exAtual.grupoMuscular}</span>
            )}
          </button>
        )}
        {/* A dose em fichas sai dos MESMOS campos que o formulário edita: uma fonte só,
            então o que se lê fechado é exatamente o que se muda aberto. */}
        {!aberto && (
          <LinhaDeTokens className="shrink-0">
            {fichasDoBloco(bloco)
              .map((c) => ({ chave: c.label, rotulo: c.label, valor: c.value }))
              .map((c) => (
                <TokenRotulado
                  key={c.chave}
                  label={c.rotulo}
                  // A intensidade do cardio tem frase inteira dentro ("Moderada: cerca de 64 a
                  // 76% da FCmáx (teste da conversa; RPE 5 a 6 de 10)"), e uma ficha com uma
                  // frase deixa de ser ficha. Ela é cortada À VISTA, com o valor inteiro no
                  // title e a um clique de distância no campo.
                  value={
                    <span className="block max-w-[11rem] truncate" title={c.valor}>
                      {c.valor}
                    </span>
                  }
                />
              ))}
          </LinhaDeTokens>
        )}
        {/* O SELO DE DECISÃO (protótipo: a etiqueta à direita de cada exercício). Diz o que
            muda aqui em relação à semana anterior, com a diferença medida entre os alvos.
            Some na primeira semana do bloco, onde não há com o que comparar. */}
        {decisao && !aberto && (
          // O VEREDITO é a pílula, curta e colorida; a DIFERENÇA vem ao lado, em texto
          // quieto, e pode quebrar para a linha de baixo quando a coluna aperta. Os dois
          // juntos dentro da pílula faziam uma etiqueta de 28 caracteres competindo com o
          // nome do exercício.
          <span className="ml-auto flex min-w-0 items-center gap-2" title={decisao.completo}>
            <Pill tone={TOM_DECISAO[decisao.tom]}>{decisao.rotulo}</Pill>
            {decisao.detalhe && <span className="text-2xs leading-tight text-ink-3">{decisao.detalhe}</span>}
          </span>
        )}
        <SeloOrigem ctx={ctx} bloco={bloco} />
        <button
          type="button"
          onClick={onAlternar}
          aria-expanded={aberto}
          aria-label={aberto ? `Fechar ${bloco.nome}` : `Ajustar ${bloco.nome}`}
          className="shrink-0 rounded-control p-1 text-ink-3 hover:bg-surface-soft hover:text-ink"
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform", aberto && "rotate-180")} aria-hidden />
        </button>
      </div>

      {aberto && (
      <div className="space-y-1.5 border-t border-border p-3">
      <div className="flex flex-wrap items-center justify-end gap-3">
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
          /*
           * A ATIVIDADE grava modalidade E nome juntos, pelo mesmo motivo que "Trocar
           * exercício" grava slug e nome juntos: o cartão de leitura imprime o nome da
           * modalidade e a linha fechada imprime `nome`. Gravar só um dos dois faz a mesma
           * tela dizer "Caminhada" em cima e "Bicicleta ergométrica" embaixo.
           *
           * O nome só é reescrito quando ele ainda era o da modalidade anterior. Quem digitou
           * "Caminhada no parque, ritmo confortável" não perde a frase por trocar a atividade.
           */
          if (aerobio && chave === "modalidade") {
            return (
              <CampoModalidadeInline
                key={chave}
                rotulo={rotulo}
                valor={valor}
                equipamentos={ctx.equipamentos}
                onChange={(id) => {
                  const anterior = valor ? getModalidade(valor)?.nome : undefined;
                  const nome = !bloco.nome || bloco.nome === anterior || bloco.nome === "Aeróbio";
                  onChange({ ...bloco, modalidade: id, nome: nome ? (getModalidade(id)?.nome ?? bloco.nome) : bloco.nome });
                }}
              />
            );
          }
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
          // Chip de dose do protótipo: fundo mute, radius 8, valor em peso forte. Continua
          // sendo um input editável; o aviso de fora da faixa mantém o tratamento âmbar.
          "w-full rounded-[8px] border px-2 py-1 text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-primary",
          aviso ? "border-warning bg-warning-tint" : "border-transparent bg-surface-mute hover:border-border focus:bg-surface",
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

/** Atividade do bloco aeróbio: as modalidades que o aluno tem como executar (ver
 *  `modalidadesAerobias`), com a atual sempre presente mesmo quando o filtro a excluiria. */
function CampoModalidadeInline({
  rotulo,
  valor,
  equipamentos,
  onChange,
}: {
  rotulo: string;
  valor: string;
  equipamentos?: string[];
  onChange: (v: string) => void;
}) {
  const id = React.useId();
  const opcoes = modalidadesAerobias(equipamentos, valor || undefined);
  return (
    <div>
      <label htmlFor={id} className="mb-0.5 block text-2xs font-semibold uppercase tracking-wide text-ink-3">
        {rotulo}
      </label>
      <select
        id={id}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-[8px] border border-transparent bg-surface-mute px-2 py-1 text-xs font-semibold text-ink hover:border-border focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {!valor && <option value="">Escolher</option>}
        {opcoes.map((m) => (
          <option key={m.id} value={m.id}>
            {m.nome}
          </option>
        ))}
      </select>
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
        className="w-full rounded-[8px] border border-transparent bg-surface-mute px-2 py-1 text-xs font-semibold text-ink hover:border-border focus:outline-none focus:ring-2 focus:ring-primary"
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
          <span key={i} className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-ink">
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
