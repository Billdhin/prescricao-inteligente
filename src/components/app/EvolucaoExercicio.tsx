import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Card, TokenRotulado } from "@/components/ui/primitives";
import { exercises } from "@/data/exercises";
import type { Execucao } from "@/data/execucao";
import { rotuloMeso, semanaAtual as semanaCorrenteDoPlano, type PlanoTreino } from "@/data/periodizacao";

/**
 * EVOLUÇÃO DE CARGA POR EXERCÍCIO (aba Visão da tela do aluno).
 *
 * O que este gráfico afirma, e o que ele se recusa a afirmar:
 *
 * 1. A LINHA AZUL É O QUE ACONTECEU. Cada ponto é a MAIOR carga registrada naquela semana,
 *    entre todas as séries do exercício. A agregação está escrita no rótulo e na legenda
 *    (regra da casa: rótulo carrega a agregação), porque "carga da semana" sozinho é ambíguo:
 *    quem lê média entende uma coisa, quem lê pico entende outra.
 *
 *    Por que o MAIOR e não a média das séries: a média se move quando muda o NÚMERO de séries
 *    ou quando o método pede carga menor de propósito (drop-set, série de retorno). Nesses dois
 *    casos a média desce sem o aluno ter ficado mais fraco, e a linha diria o contrário do que
 *    aconteceu. O maior da semana é invariante ao número de séries e ao método.
 *
 * 2. SEMANA SEM REGISTRO NÃO VIRA ZERO. Ela vira vão: sem ponto e sem segmento de linha.
 *    Zero é uma afirmação ("ele levantou nada"), e o que existe é ausência de dado.
 *
 * 3. A LINHA PRESCRITA SÓ EXISTE SE O PLANO TROUXER CARGA EM KG. Este motor prescreve séries,
 *    repetições, reserva de repetições e percentual de 1RM: nenhum desses é quilo, e converter
 *    percentual em quilo exigiria um 1RM que o plano não guarda. Então, no caso comum, a linha
 *    tracejada, a legenda dela e as barras de diferença simplesmente não são desenhadas, e o
 *    cartão diz em uma frase que o plano prescreve esforço, não carga. Quando o profissional
 *    escreve o quilo à mão no campo de intensidade do bloco, aí a linha aparece, porque aí o
 *    dado existe de verdade.
 */

const FMT = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
const fmtKg = (v: number) => `${FMT.format(v)} kg`;
const nomeDoExercicio = (slug: string) => exercises.find((e) => e.slug === slug)?.nome ?? slug;

/** O nome da agregação, em UM lugar: o subtítulo, a legenda e o aria-label leem daqui. */
const AGREGACAO = "maior carga da semana";

/* ------------------------------- Geometria ------------------------------- */

const W = 600;
const H = 200;
const PLOT_TOP = 12;
/** Sem barras de diferença o plot ocupa a caixa inteira; com elas, cede a base. */
const PLOT_BOT_COM_DELTA = 138;
const PLOT_BOT_SEM_DELTA = 186;
const DELTA_ZERO = 172;
const DELTA_MEIA = 26;

/** Famílias das faixas de fase, cicladas, sobre PAPEL (fundo lavado, tinta AA). */
const FASE = [
  { fundo: "rgb(var(--analysis-fill-rgb) / 0.08)", tinta: "var(--analysis)" },
  { fundo: "rgb(var(--primary-rgb) / 0.06)", tinta: "var(--primary)" },
  { fundo: "rgb(var(--warning-fill-rgb) / 0.08)", tinta: "var(--warning)" },
] as const;

type Ponto = { semana: number; executado: number; prescrito?: number };
type XY = { x: number; y: number };

const caminho = (pts: XY[]) => pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

/** Quebra a série em trechos CONTÍGUOS: onde falta semana, a linha não atravessa. */
function trechos<T>(itens: (T | undefined)[]): T[][] {
  const out: T[][] = [];
  let atual: T[] = [];
  for (const i of itens) {
    if (i === undefined) {
      if (atual.length) out.push(atual);
      atual = [];
    } else atual.push(i);
  }
  if (atual.length) out.push(atual);
  return out;
}

/* ------------------------- Carga prescrita em kg ------------------------- */

/** "20 a 30 kg" é FAIXA, não uma carga: o meio dela seria número inventado. */
const FAIXA_KG = /\d\s*(?:a|até)\s*\d+(?:[.,]\d+)?\s*kg/i;

/**
 * O quilo que o profissional escreveu à mão no campo de intensidade do bloco, quando escreveu.
 * Devolve valor só quando o texto carrega UM quilo inequívoco: faixa e valores em conflito
 * saem sem resposta, porque nenhum dos dois é "a carga prescrita da semana".
 */
export function kgPrescritoDeTexto(texto?: string): number | undefined {
  if (!texto || FAIXA_KG.test(texto)) return undefined;
  const achados = [...texto.matchAll(/(\d+(?:[.,]\d+)?)\s*kg/gi)].map((m) => Number(m[1].replace(",", ".")));
  const unicos = [...new Set(achados.filter((n) => Number.isFinite(n) && n > 0))];
  return unicos.length === 1 ? unicos[0] : undefined;
}

/* --------------------------------- Tela --------------------------------- */

export function EvolucaoExercicio({
  plano,
  execucoes,
  primeiroNome,
}: {
  /** plano ATIVO do aluno; sem ele não há semanas nem fases para comparar */
  plano?: PlanoTreino;
  /** execuções do aluno (a filtragem pelo plano acontece aqui dentro) */
  execucoes: Execucao[];
  /** primeiro nome do aluno, só para o estado vazio falar dele */
  primeiroNome?: string;
}) {
  const [escolhido, setEscolhido] = React.useState<string | null>(null);

  const dados = React.useMemo(() => {
    if (!plano) return null;
    // Só registro DESTE plano, COM carga e COM exercício catalogado: bloco aeróbio e
    // isométrico não têm quilo, e registro sem slug não teria nome para nomear a linha.
    const regs = execucoes.filter(
      (e) => e.planoId === plano.id && e.cargaFeita != null && e.cargaFeita > 0 && !!e.exercicioSlug,
    );
    if (!regs.length) return null;

    // slug -> semana -> MAIOR carga da semana
    const porSlug = new Map<string, Map<number, number>>();
    const ultimoTs = new Map<string, number>();
    for (const e of regs) {
      const slug = e.exercicioSlug as string;
      const m = porSlug.get(slug) ?? new Map<number, number>();
      const atual = m.get(e.semana);
      if (atual == null || (e.cargaFeita as number) > atual) m.set(e.semana, e.cargaFeita as number);
      porSlug.set(slug, m);
      ultimoTs.set(slug, Math.max(ultimoTs.get(slug) ?? 0, e.concluidoEm));
    }

    // Onde cada exercício é prescrito no plano, semana a semana (só quando há kg escrito).
    const microciclos = plano.macrociclo.mesociclos.flatMap((m) => m.microciclos);
    const prescritoDe = (slug: string, semana: number): number | undefined => {
      const micro = microciclos.find((mc) => mc.semana === semana);
      if (!micro) return undefined;
      const kgs = micro.sessoes
        .flatMap((s) => s.blocos)
        .filter((b) => b.exercicioSlug === slug)
        .map((b) => kgPrescritoDeTexto(b.intensidade))
        .filter((n): n is number => n != null);
      const unicos = [...new Set(kgs)];
      return unicos.length === 1 ? unicos[0] : undefined;
    };

    const tipoDaSemana = new Map(microciclos.map((mc) => [mc.semana, mc.tipo]));

    const resumos = [...porSlug.entries()]
      .map(([slug, semanas]) => {
        const ordenadas = [...semanas.entries()].sort((a, b) => a[0] - b[0]);
        const ultima = ordenadas[ordenadas.length - 1];
        /*
         * A VARIAÇÃO COMPARA SEMANA DE CARGA COM SEMANA DE CARGA.
         *
         * Medido na bancada com os dois alunos da demo: a última semana registrada caía numa
         * DESCARGA, e a conta ingênua (primeira contra última) devolvia "cai 5 kg" para um
         * aluno que subiu 2 kg em todas as semanas de carga. A carga menor da descarga é o
         * desenho do plano, não queda de desempenho; comparar as duas é comparar coisas
         * diferentes. Com menos de duas semanas de carga registradas, a conta volta a ser
         * primeira contra última, e o rótulo diz qual das duas está em uso.
         */
        const cargas = ordenadas.filter(([s]) => tipoDaSemana.get(s) === "carga");
        const base = cargas.length > 1 ? cargas : ordenadas;
        const ini = base[0];
        const fim = base[base.length - 1];
        return {
          slug,
          nome: nomeDoExercicio(slug),
          semanas,
          registros: ordenadas.length,
          atual: ultima[1],
          ultimaSemana: ultima[0],
          ultimaEmAlivio: tipoDaSemana.get(ultima[0]) !== "carga",
          primeiraSemana: ordenadas[0][0],
          soCarga: cargas.length > 1,
          compIni: ini[0],
          compFim: fim[0],
          variacao: base.length > 1 ? fim[1] - ini[1] : undefined,
          ultimoTs: ultimoTs.get(slug) ?? 0,
        };
      })
      // Quem tem mais semanas registradas abre o gráfico; empate desempata pelo mais recente.
      .sort((a, b) => b.registros - a.registros || b.ultimoTs - a.ultimoTs || a.nome.localeCompare(b.nome, "pt-BR"));

    return { resumos, prescritoDe, semanas: plano.semanas };
  }, [plano, execucoes]);

  const resumos = dados?.resumos ?? [];
  const alvo = resumos.find((r) => r.slug === escolhido) ?? resumos[0];

  const serie = React.useMemo(() => {
    if (!plano || !dados || !alvo) return null;
    const total = Math.max(1, plano.semanas);
    const pontos: (Ponto | undefined)[] = [];
    for (let s = 1; s <= total; s++) {
      const executado = alvo.semanas.get(s);
      if (executado == null) {
        pontos.push(undefined);
        continue;
      }
      pontos.push({ semana: s, executado, prescrito: dados.prescritoDe(alvo.slug, s) });
    }
    const cheios = pontos.filter((p): p is Ponto => p != null);
    const temPrescrito = cheios.some((p) => p.prescrito != null);
    const valores = cheios.flatMap((p) => (p.prescrito != null ? [p.executado, p.prescrito] : [p.executado]));
    return { total, pontos, cheios, temPrescrito, vMax: Math.max(...valores), vMin: Math.min(...valores) };
  }, [plano, dados, alvo]);

  if (!plano || !dados || !alvo || !serie) {
    return <SemGrafico temPlano={!!plano} primeiroNome={primeiroNome} />;
  }

  const { total, pontos, cheios, temPrescrito, vMax, vMin } = serie;
  const plotBot = temPrescrito ? PLOT_BOT_COM_DELTA : PLOT_BOT_SEM_DELTA;
  const span = vMax - vMin;
  const y = (v: number) => (span === 0 ? (PLOT_TOP + plotBot) / 2 : plotBot - ((v - vMin) / span) * (plotBot - PLOT_TOP));
  const x = (semana: number) => (W * (semana - 0.5)) / total;
  const pctX = (v: number) => (v / W) * 100;
  const pctY = (v: number) => (v / H) * 100;
  const larguraSemana = W / total;

  const grade = [0, 1, 2, 3].map((i) => PLOT_TOP + ((plotBot - PLOT_TOP) * i) / 3);
  const semanaHoje = semanaCorrenteDoPlano(plano);
  const pontoHoje = cheios.find((p) => p.semana === semanaHoje);

  const executados = trechos(pontos.map((p) => (p ? { x: x(p.semana), y: y(p.executado) } : undefined)));
  const prescritos = trechos(
    pontos.map((p) => (p && p.prescrito != null ? { x: x(p.semana), y: y(p.prescrito) } : undefined)),
  );

  const diffs = cheios
    .filter((p) => p.prescrito != null)
    .map((p) => ({ semana: p.semana, valor: p.executado - (p.prescrito as number) }));
  const maiorDiff = Math.max(1, ...diffs.map((d) => Math.abs(d.valor)));

  // Semanas que NÃO são de carga (descarga e teste): coluna âmbar ao fundo.
  const aliviadas = plano.macrociclo.mesociclos
    .flatMap((m) => m.microciclos)
    .filter((mc) => mc.tipo !== "carga")
    .map((mc) => ({ semana: mc.semana, tipo: mc.tipo }));
  const aliviada = new Set(aliviadas.map((a) => a.semana));

  const fases = plano.macrociclo.mesociclos.map((m, i) => ({
    nome: rotuloMeso(m, i),
    x0: (W * (m.semanaInicio - 1)) / total,
    x1: (W * m.semanaFim) / total,
    fam: FASE[i % FASE.length],
  }));

  const passoRotulo = Math.max(1, Math.ceil(total / 12));
  const gid = `evx-${alvo.slug.replace(/[^a-z0-9]/gi, "")}`;

  const resumoAria =
    `Evolução de carga de ${alvo.nome} ao longo de ${total} ${total === 1 ? "semana" : "semanas"} do plano, ` +
    `por ${AGREGACAO}. ${cheios.length} ${cheios.length === 1 ? "semana registrada" : "semanas registradas"}, ` +
    `de ${fmtKg(alvo.semanas.get(alvo.primeiraSemana) as number)} na semana ${alvo.primeiraSemana} ` +
    `a ${fmtKg(alvo.atual)} na semana ${alvo.ultimaSemana}` +
    (alvo.variacao != null
      ? `. A carga ${alvo.variacao === 0 ? "ficou igual" : variacaoTexto(alvo.variacao)} entre a semana ${alvo.compIni} e a semana ${alvo.compFim}` +
        (alvo.soCarga ? ", contando só as semanas de carga" : "")
      : "") +
    (temPrescrito ? ", comparada com a carga prescrita no plano." : ". O plano não prescreve carga em quilos.");

  return (
    <Card className="p-5 md:p-6">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
        <h2 className="font-display text-lg font-bold text-ink">Evolução · {alvo.nome}</h2>
        {alvo.variacao != null && (
          <TokenRotulado
            label={
              alvo.soCarga
                ? `Variação nas semanas de carga, S${alvo.compIni} a S${alvo.compFim}`
                : `Variação da S${alvo.compIni} à S${alvo.compFim}`
            }
            value={variacaoTexto(alvo.variacao)}
            tone={alvo.variacao > 0 ? "analysis" : alvo.variacao < 0 ? "danger" : "neutral"}
          />
        )}
      </div>
      <p className="mt-1.5 text-sm text-ink-2">
        Cada ponto é a <b className="font-semibold text-ink">{AGREGACAO}</b>, entre todas as séries registradas deste
        exercício. Semana sem registro fica sem ponto, e não vira zero.
        {alvo.soCarga && (
          <>
            {" "}
            A variação compara semana de carga com semana de carga: a carga menor da descarga é o desenho do plano, não
            queda de desempenho.
          </>
        )}
      </p>
      {!temPrescrito && (
        <p className="mt-1.5 text-sm text-ink-2">
          Não há linha de prescrito aqui: o plano prescreve esforço (séries, repetições e reserva de repetições), não
          carga em quilos.
        </p>
      )}

      <div className="mt-4 overflow-x-auto">
        {/* A faixa de 28px no topo é da bandeira "Hoje": ela vive FORA do plot porque o
            contêiner rola na horizontal, e um elemento puxado para cima por translate
            seria decepado pelo overflow. */}
        <div className="relative min-w-[520px] pl-11 pt-7">
          {/* A bandeira usa TOKENS invertidos (tinta como fundo, papel como texto), e não
              o navy literal: este mesmo gráfico é servido ao aluno na pele escura, onde
              navy sobre navy sumiria. Assim ela fica escura no papel claro do profissional
              e clara no navy do aluno, sem um segundo componente. */}
          <span
            className="absolute top-0 -translate-x-1/2 whitespace-nowrap rounded-[8px] bg-ink px-2 py-1 text-2xs font-bold text-surface"
            style={{
              left: `calc(2.75rem + (100% - 2.75rem) * ${(x(semanaHoje) / W).toFixed(4)})`,
            }}
          >
            Hoje · S{semanaHoje}
            {pontoHoje ? ` · ${fmtKg(pontoHoje.executado)}` : ""}
          </span>
          <div className="relative h-[220px]">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              preserveAspectRatio="none"
              className="h-full w-full"
              role="img"
              aria-label={resumoAria}
            >
              <defs>
                <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* fases do plano, ao fundo */}
              {fases.map((f, i) => (
                <rect key={i} x={f.x0} y={0} width={Math.max(0, f.x1 - f.x0)} height={plotBot} fill={f.fam.fundo} />
              ))}
              {/* semanas de descarga e de teste */}
              {[...aliviada].map((s) => (
                <rect
                  key={`al-${s}`}
                  x={(W * (s - 1)) / total}
                  y={0}
                  width={larguraSemana}
                  height={plotBot}
                  fill="rgb(var(--warning-fill-rgb) / 0.16)"
                />
              ))}

              {grade.map((gy, i) => (
                <line
                  key={i}
                  x1={0}
                  y1={gy}
                  x2={W}
                  y2={gy}
                  stroke={i === grade.length - 1 ? "var(--border)" : "var(--surface-mute)"}
                  vectorEffect="non-scaling-stroke"
                />
              ))}

              {executados.map((t, i) =>
                t.length > 1 ? (
                  <path
                    key={`a-${i}`}
                    d={`${caminho(t)} L${t[t.length - 1].x.toFixed(1)} ${plotBot} L${t[0].x.toFixed(1)} ${plotBot} Z`}
                    fill={`url(#${gid})`}
                    stroke="none"
                  />
                ) : null,
              )}
              {prescritos.map((t, i) =>
                t.length > 1 ? (
                  <path
                    key={`p-${i}`}
                    d={caminho(t)}
                    fill="none"
                    stroke="var(--analysis-fill)"
                    strokeWidth={2.5}
                    strokeDasharray="6 6"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                  />
                ) : null,
              )}
              {executados.map((t, i) =>
                t.length > 1 ? (
                  <path
                    key={`e-${i}`}
                    d={caminho(t)}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                ) : null,
              )}

              {/* a semana de hoje */}
              <line
                x1={x(semanaHoje)}
                y1={0}
                x2={x(semanaHoje)}
                y2={plotBot}
                stroke="var(--ink)"
                strokeWidth={1.5}
                strokeDasharray="3 4"
                vectorEffect="non-scaling-stroke"
              />

              {temPrescrito && (
                <>
                  <line
                    x1={0}
                    y1={DELTA_ZERO}
                    x2={W}
                    y2={DELTA_ZERO}
                    stroke="var(--border)"
                    vectorEffect="non-scaling-stroke"
                  />
                  {diffs.map((d) => {
                    const alt = (Math.abs(d.valor) / maiorDiff) * DELTA_MEIA;
                    if (alt <= 0) return null;
                    const larg = Math.max(3, larguraSemana * 0.34);
                    return (
                      <rect
                        key={`d-${d.semana}`}
                        x={x(d.semana) - larg / 2}
                        y={d.valor >= 0 ? DELTA_ZERO - alt : DELTA_ZERO}
                        width={larg}
                        height={alt}
                        rx={2}
                        fill={d.valor >= 0 ? "var(--analysis-fill)" : "var(--danger-fill)"}
                      />
                    );
                  })}
                </>
              )}
            </svg>

            {/* pontos do executado: HTML por cima, para o círculo não deformar */}
            {cheios.map((p) => (
              <span
                key={p.semana}
                aria-hidden
                className="absolute h-[9px] w-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] bg-surface"
                style={{ left: `${pctX(x(p.semana))}%`, top: `${pctY(y(p.executado))}%`, borderColor: "var(--primary)" }}
              />
            ))}

            {/* eixo de valor: os extremos reais da série, à esquerda */}
            <span
              className="tabular absolute -left-11 w-10 -translate-y-1/2 text-right text-2xs text-ink-3"
              style={{ top: `${pctY(y(vMax))}%` }}
            >
              {fmtKg(vMax)}
            </span>
            {span > 0 && (
              <span
                className="tabular absolute -left-11 w-10 -translate-y-1/2 text-right text-2xs text-ink-3"
                style={{ top: `${pctY(y(vMin))}%` }}
              >
                {fmtKg(vMin)}
              </span>
            )}
            {temPrescrito && (
              <span
                className="absolute -left-11 w-10 -translate-y-1/2 text-right text-2xs font-semibold text-ink-3"
                style={{ top: `${pctY(DELTA_ZERO)}%` }}
                title="Diferença entre executado e prescrito"
              >
                Dif.
              </span>
            )}

            {/* nome de cada fase, na tinta da família */}
            {fases.map((f, i) =>
              pctX(f.x1 - f.x0) > 12 ? (
                <span
                  key={`fn-${i}`}
                  // O nome da fase e mais largo que a faixa dela no celular, entao ele
                  // trunca. O title devolve o nome inteiro, que sem isso ficaria perdido.
                  title={f.nome}
                  className="absolute top-1 truncate text-2xs font-bold uppercase tracking-[0.06em]"
                  style={{ left: `calc(${pctX(f.x0)}% + 6px)`, maxWidth: `calc(${pctX(f.x1 - f.x0)}% - 12px)`, color: f.fam.tinta }}
                >
                  {f.nome}
                </span>
              ) : null,
            )}

          </div>

          {/* régua de semanas, alinhada com as colunas do plot */}
          <div
            className="mt-2 grid text-center text-2xs text-ink-3"
            style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: total }, (_, i) => i + 1).map((s) => {
              const rotular = (s - 1) % passoRotulo === 0 || s === semanaHoje || s === total;
              return (
                <span
                  key={s}
                  className={
                    s === semanaHoje
                      ? "tabular font-bold text-ink"
                      : aliviada.has(s)
                        ? "tabular font-semibold text-warning"
                        : "tabular"
                  }
                  title={`Semana ${s}`}
                >
                  {rotular ? `S${s}` : " "}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-2">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="h-[3px] w-3.5 rounded-sm" style={{ background: "var(--primary)" }} />
          Executado ({AGREGACAO})
        </span>
        {temPrescrito && (
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="w-3.5" style={{ borderTop: "3px dashed var(--analysis-fill)" }} />
            Prescrito no plano
          </span>
        )}
        {aliviada.size > 0 && (
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="h-3 w-3 rounded-sm"
              style={{ background: "rgb(var(--warning-fill-rgb) / 0.3)" }}
            />
            {aliviadas.some((a) => a.tipo === "teste") ? "Descarga e teste" : "Descarga"}
          </span>
        )}
        {temPrescrito && (
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="h-2.5 w-2 rounded-sm" style={{ background: "var(--analysis-fill)" }} />
            <span aria-hidden className="-ml-1 h-2.5 w-2 rounded-sm" style={{ background: "var(--danger-fill)" }} />
            Diferença entre executado e prescrito
          </span>
        )}
      </div>

      {/* Os cartões-resumo SÃO a navegação do gráfico: um por exercício com registro. */}
      <div className="mt-4 border-t border-border pt-4">
        <h3 className="text-2xs font-bold uppercase tracking-[0.14em] text-ink-3">
          Exercícios com carga registrada neste plano
        </h3>
        <div className="mt-2.5 grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
          {resumos.map((r) => {
            const ativo = r.slug === alvo.slug;
            return (
              <button
                key={r.slug}
                type="button"
                aria-pressed={ativo}
                onClick={() => setEscolhido(r.slug)}
                className="rounded-control border bg-surface p-2.5 text-left transition hover:border-ink"
                style={{ borderColor: ativo ? "var(--ink)" : "var(--border)" }}
              >
                <span className="block truncate text-xs text-ink-2" title={r.nome}>
                  {r.nome}
                </span>
                {/* Valor e a semana dele COLADOS: "18 kg na S9" nunca vira um 18 solto.
                    O qualificador PODE quebrar linha e nunca trunca: era ele que
                    aparecia cortado ("na S9 (descar…") no cartão estreito, e é ele
                    que explica por que o número está mais baixo. */}
                <span className="mt-0.5 flex flex-wrap items-baseline gap-x-1">
                  <b className="tabular font-display text-base font-bold text-ink">{fmtKg(r.atual)}</b>
                  <span className="text-xs text-ink-3">
                    na S{r.ultimaSemana}
                    {r.ultimaEmAlivio ? " (descarga)" : ""}
                  </span>
                </span>
                <span
                  className="block text-xs font-semibold"
                  title={
                    r.variacao == null
                      ? "Uma única semana com registro deste exercício: ainda não há dois pontos para comparar."
                      : r.soCarga
                        ? "Comparação entre semanas de carga; as semanas de descarga ficam de fora."
                        : "Comparação entre a primeira e a última semana com registro."
                  }
                  style={{
                    color:
                      r.variacao == null || r.variacao === 0
                        ? "var(--ink-2)"
                        : r.variacao > 0
                          ? "var(--analysis)"
                          : "var(--danger)",
                  }}
                >
                  {r.variacao == null
                    ? "1 semana registrada"
                    : `${variacaoTexto(r.variacao)} de S${r.compIni} a S${r.compFim}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

/** "sobe 5 kg" / "cai 2,5 kg" / "sem variação": nunca um sinal solto sem o sentido. */
function variacaoTexto(v: number): string {
  if (v === 0) return "sem variação";
  return `${v > 0 ? "sobe" : "cai"} ${fmtKg(Math.abs(v))}`;
}

/**
 * ESTADO VAZIO HONESTO: sem plano ativo, ou sem nenhuma execução com carga, não se desenha
 * eixo nenhum. Um eixo vazio sugere que o dado existe e está em zero; o que existe é a
 * ausência dele, e o cartão diz o que precisa acontecer para o gráfico nascer.
 */
function SemGrafico({ temPlano, primeiroNome }: { temPlano: boolean; primeiroNome?: string }) {
  const quem = primeiroNome ? primeiroNome : "o aluno";
  return (
    <Card className="p-5 md:p-6">
      <div className="flex items-center gap-2">
        <span aria-hidden className="grid h-8 w-8 place-items-center rounded-lg bg-primary-tint text-primary">
          <TrendingUp className="h-4 w-4" />
        </span>
        <h2 className="font-display text-lg font-bold text-ink">Evolução por exercício</h2>
      </div>
      <p className="mt-2 text-sm text-ink-2">
        {temPlano
          ? `Ainda não há treino com carga registrada neste plano. O gráfico nasce quando ${quem} registrar as séries no app do celular, com o peso usado em cada uma.`
          : "Sem plano ativo. O gráfico compara semana a semana, dentro de um plano, o que foi levantado em cada exercício."}
      </p>
    </Card>
  );
}
