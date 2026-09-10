import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Plus } from "lucide-react";
import { Card } from "@/components/ui/primitives";
import { AvaliacaoModal } from "@/components/app/AvaliacaoModal";
import { METRICAS_EVOLUCAO, type DirMetrica } from "@/components/app/EvolucaoMini";
import { useAlunos } from "@/lib/store";
import { dataReavaliacao } from "@/lib/gps/proximoPasso";
import { toast } from "@/lib/toast";
import type { Aluno, Avaliacao } from "@/data/alunos";
import { cn } from "@/lib/utils";

const DIA = 86_400_000;
/** "29 ago", como no protótipo: dia + mês curto, sem "de" e sem ponto. */
const fmtDataCurta = (ts: number) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" })
    .format(new Date(ts))
    .replace(/ de /g, " ")
    .replace(".", "");
const diasAte = (ts: number) => Math.round((ts - Date.now()) / DIA);
const fmtNum = (n: number) => String(Math.round(n * 10) / 10).replace(".", ",");
/**
 * Variação com sinal de verdade (o hífen não é sinal de menos e some na leitura rápida) e,
 * nas medidas contínuas, SEMPRE com uma casa: "−2,0" ao lado de "−1,6" alinha a leitura, e
 * "−2" solto parece arredondamento de outra escala. A dor é inteira por natureza.
 */
const fmtVar = (n: number, casas = 1) =>
  `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toFixed(casas).replace(".", ",")}`;

/**
 * Tinta do avatar quadrado por FAMÍLIA de cor, como no protótipo (fundo tint +
 * texto da família). A escolha é determinística pelo id, para o mesmo aluno
 * carregar sempre a mesma tinta em todas as listas desta tela.
 */
const TINTAS_AVATAR = [
  "bg-primary-tint text-primary",
  "bg-analysis-tint text-analysis-text",
  "bg-warning-tint text-warning",
] as const;
const tintaDe = (id: string) =>
  TINTAS_AVATAR[[...id].reduce((s, c) => s + c.charCodeAt(0), 0) % TINTAS_AVATAR.length];

/**
 * A pílula do objetivo. Emagrecimento em azul e Resistência em turquesa, como o protótipo; o
 * roxo que ele usa para Hipertrofia não existe na paleta do produto, e criar um token só para
 * uma pílula pediria validar contraste nos dois temas por nada, então ela usa a família quente.
 */
const PILULA_OBJETIVO: Record<string, string> = {
  Emagrecimento: "bg-primary-tint text-primary",
  Hipertrofia: "bg-cta-tint text-cta-text",
  "Resistência muscular": "bg-analysis-tint text-analysis-text",
};
const ROTULO_OBJETIVO: Record<string, string> = { "Resistência muscular": "Resistência" };

/* ============================ A leitura da evolução ============================ */

/**
 * A MESMA VARIAÇÃO SIGNIFICA COISAS OPOSTAS CONFORME O OBJETIVO.
 *
 * Esta tela mostrava o delta NEUTRO de propósito, com um comentário honesto: sem leitura de
 * objetivo, pintar de verde diria "melhorou" sem saber o que o aluno busca. O protótipo pede a
 * leitura ("lida contra o objetivo de cada aluno"), e ela só é honesta com a regra à vista:
 *
 *  - GORDURA e DOR: cair é a favor em qualquer objetivo. A direção da gordura vem da tabela de
 *    métricas do produto (`METRICAS_EVOLUCAO`), não de uma cópia.
 *  - PESO: depende. Emagrecimento (ou condição de obesidade declarada) quer menos; Hipertrofia
 *    quer mais; nos outros objetivos o peso não tem direção, e a tela não inventa uma. É por
 *    isso que a tabela de métricas o marca como neutro: a direção do peso é do OBJETIVO.
 *
 * TOLERÂNCIA DE LEITURA, e não número clínico: abaixo de 1 kg e de 1 ponto percentual a tela
 * diz "estável", porque variação desse tamanho cabe na oscilação normal entre duas medidas de
 * balança ou de gordura, e pintar isso de verde ou de âmbar seria ler ruído como resultado.
 */
type Leitura = "favor" | "atencao" | "estavel";
const TOLERANCIA_PESO_KG = 1;
const TOLERANCIA_GORDURA_PP = 1;
const DIR_GORDURA: DirMetrica = METRICAS_EVOLUCAO.find((m) => m.key === "percentualGordura")?.dir ?? "menor";

function direcaoDoPeso(a: Aluno): DirMetrica {
  if (a.objetivo === "Emagrecimento" || (a.grupoEspecial ?? "").startsWith("obesidade")) return "menor";
  if (a.objetivo === "Hipertrofia") return "maior";
  return "neutro";
}

function ler(delta: number, dir: DirMetrica, tolerancia: number): Leitura {
  if (dir === "neutro" || Math.abs(delta) < tolerancia) return "estavel";
  return (dir === "menor" ? delta < 0 : delta > 0) ? "favor" : "atencao";
}

interface Medida {
  rotulo: string;
  valor: string;
  variacao: string;
  leitura: Leitura;
}

interface LinhaEvolucao {
  aluno: Aluno;
  n: number;
  dias: number;
  medidas: Medida[];
  /** série de peso, da primeira à última avaliação que tem peso */
  pesos: number[];
  leituraPeso?: Leitura;
}

function lerEvolucao(a: Aluno, avs: Avaliacao[]): LinhaEvolucao | null {
  if (avs.length < 2) return null;
  const primeira = avs[0];
  const ultima = avs[avs.length - 1];
  const medidas: Medida[] = [];
  const pesos = avs.map((av) => av.medidas.peso).filter((p): p is number => p != null);

  let leituraPeso: Leitura | undefined;
  if (primeira.medidas.peso != null && ultima.medidas.peso != null) {
    const d = ultima.medidas.peso - primeira.medidas.peso;
    leituraPeso = ler(d, direcaoDoPeso(a), TOLERANCIA_PESO_KG);
    medidas.push({ rotulo: "Peso", valor: `${fmtNum(ultima.medidas.peso)} kg`, variacao: fmtVar(d), leitura: leituraPeso });
  }
  const g0 = primeira.medidas.percentualGordura;
  const g1 = ultima.medidas.percentualGordura;
  if (g0 != null && g1 != null) {
    const d = g1 - g0;
    medidas.push({ rotulo: "Gordura", valor: `${fmtNum(g1)}%`, variacao: `${fmtVar(d)} pp`, leitura: ler(d, DIR_GORDURA, TOLERANCIA_GORDURA_PP) });
  }
  // Dor: a última registrada contra a primeira registrada, na escala de 0 a 10.
  const dores = avs.map((av) => av.dorEscala).filter((d): d is number => d != null);
  if (dores.length >= 1) {
    const d0 = dores[0];
    const d1 = dores[dores.length - 1];
    const d = d1 - d0;
    medidas.push({
      rotulo: "Dor",
      valor: `${d1}/10`,
      variacao: d1 === 0 ? "sem dor" : d === 0 ? "estável" : fmtVar(d, 0),
      leitura: d1 === 0 ? "favor" : d === 0 ? "estavel" : d < 0 ? "favor" : "atencao",
    });
  }
  if (!medidas.length) return null;
  return {
    aluno: a,
    n: avs.length,
    dias: Math.max(1, Math.round((ultima.data - primeira.data) / DIA)),
    medidas,
    pesos,
    leituraPeso,
  };
}

const COR_LEITURA: Record<Leitura, { caixa: string; variacao: string; ponto: string }> = {
  favor: { caixa: "border-success/25 bg-success-tint", variacao: "text-success", ponto: "bg-success-fill" },
  atencao: { caixa: "border-warning/30 bg-warning-tint", variacao: "text-warning", ponto: "bg-warning-fill" },
  estavel: { caixa: "border-border bg-surface", variacao: "text-ink-3", ponto: "bg-ink-3" },
};

type Filtro = "favor" | "atencao" | "todos";
const LINHAS_VISIVEIS = 4;

/* =================================== A tela =================================== */

export function Avaliacoes() {
  const { alunos, avaliacoes, planos, addAvaliacao } = useAlunos();
  // null = fechado. String vazia = escolhendo o aluno. Id = modal aberto naquele aluno.
  const [avaliando, setAvaliando] = React.useState<string | null>(null);
  const [filtro, setFiltro] = React.useState<Filtro>("favor");
  const [carteiraToda, setCarteiraToda] = React.useState(false);
  const ativos = alunos.filter((a) => a.status === "ativo");
  const alunoEmAvaliacao = ativos.find((a) => a.id === avaliando);
  const avalsDoAluno = React.useMemo(
    () =>
      alunoEmAvaliacao
        ? avaliacoes.filter((av) => av.alunoId === alunoEmAvaliacao.id).sort((x, y) => x.data - y.data)
        : [],
    [avaliacoes, alunoEmAvaliacao],
  );
  const nomeAluno = (id: string) => alunos.find((a) => a.id === id)?.nome ?? "aluno removido";
  const iniciais = (id: string) => alunos.find((a) => a.id === id)?.iniciais ?? "?";

  /**
   * QUEM PRECISA AGORA. Três situações, na ordem de urgência do mockup:
   * reavaliação vencida, reavaliação chegando, e quem nunca foi avaliado.
   *
   * A data vem de `dataReavaliacao`, a MESMA fonte do perfil do aluno e da rota
   * do dia. Antes esta tela lia `aluno.proximaReavaliacaoEm` cru e ignorava o
   * macrociclo, então com plano ativo ela mostrava uma data e o perfil do aluno
   * mostrava outra.
   */
  const precisamAgora = ativos
    .map((a) => {
      const planoAtivo = planos.find((p) => p.alunoId === a.id && p.status === "ativo");
      const temAval = avaliacoes.some((av) => av.alunoId === a.id);
      const reav = dataReavaliacao(a, planoAtivo);
      if (!temAval) return { aluno: a, tipo: "primeira" as const, em: 0, acao: "Avaliar" };
      if (!reav) return null;
      const dias = diasAte(reav.em);
      if (dias < 0) return { aluno: a, tipo: "vencida" as const, em: reav.em, acao: "Reavaliar" };
      if (dias <= 14) return { aluno: a, tipo: "chegando" as const, em: reav.em, acao: "Reavaliar" };
      return null;
    })
    .filter(Boolean)
    .sort((x, y) => {
      const peso = { vencida: 0, chegando: 1, primeira: 2 } as const;
      return peso[x!.tipo] - peso[y!.tipo] || x!.em - y!.em;
    }) as { aluno: Aluno; tipo: "primeira" | "vencida" | "chegando"; em: number; acao: string }[];

  // Cinco bastam para "o que aconteceu por último"; o histórico inteiro vive na ficha.
  const recentes = [...avaliacoes].sort((a, b) => b.data - a.data).slice(0, 5);

  const evolucao = React.useMemo(
    () =>
      ativos
        .map((a) =>
          lerEvolucao(
            a,
            avaliacoes.filter((av) => av.alunoId === a.id).sort((x, y) => x.data - y.data),
          ),
        )
        .filter((x): x is LinhaEvolucao => x != null),
    // `ativos` é derivado de `alunos` a cada render; a dependência real é a lista de alunos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [alunos, avaliacoes],
  );
  /*
   * As abas contam por MEDIDA, não por aluno inteiro: um aluno pode ter o peso a favor e a dor
   * pedindo conversa, e ele aparece nas duas abas. Escondê-lo de "Atenção" porque o peso foi
   * bem seria justamente perder a medida que pede conversa.
   */
  const temLeitura = (l: LinhaEvolucao, leitura: Leitura) => l.medidas.some((m) => m.leitura === leitura);
  const contagem = {
    favor: evolucao.filter((l) => temLeitura(l, "favor")).length,
    atencao: evolucao.filter((l) => temLeitura(l, "atencao")).length,
    todos: evolucao.length,
  };
  const filtradas = evolucao.filter((l) => filtro === "todos" || temLeitura(l, filtro));
  const visiveis = carteiraToda ? filtradas : filtradas.slice(0, LINHAS_VISIVEIS);

  /**
   * ESTE MÊS: contagens REAIS de avaliações dos últimos 6 meses, derivadas de
   * `avaliacoes` (nada decorativo). O mês corrente é a última coluna.
   */
  const meses = React.useMemo(() => {
    const agora = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(agora.getFullYear(), agora.getMonth() - (5 - i), 1);
      const ini = d.getTime();
      const fim = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
      const total = avaliacoes.filter((av) => av.data >= ini && av.data < fim).length;
      const label = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(d).replace(".", "");
      return { label, total, atual: i === 5 };
    });
  }, [avaliacoes]);
  const noMes = meses[5].total;
  const maxMes = Math.max(...meses.map((m) => m.total));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Cabeçalho do protótipo: sobretítulo, título grande e a ação escura à direita. */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Atendimento</p>
          <h1 className="mt-2 font-display text-[clamp(26px,3vw,36px)] font-bold leading-[1.05] tracking-[-0.03em] text-ink">
            Avaliar e reavaliar
          </h1>
        </div>
        {ativos.length > 0 && (
          <button
            type="button"
            onClick={() => setAvaliando("")}
            className="inline-flex h-11 items-center gap-1.5 rounded-control bg-ink px-4 text-sm font-semibold text-surface transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" aria-hidden /> Registrar avaliação
          </button>
        )}
      </div>

      {avaliando === "" && (
        <Card className="border-2 border-ink p-5 md:p-6">
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <h2 className="font-display text-lg font-bold tracking-[-0.02em] text-ink">De qual aluno?</h2>
            <p className="m-0 text-sm text-ink-2">
              A avaliação entra no perfil dele e passa a valer como gate para a próxima prescrição.
            </p>
          </div>
          <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
            {ativos.map((a) => (
              <button
                key={a.id}
                onClick={() => setAvaliando(a.id)}
                className="rounded-full border border-border bg-surface px-3.5 py-2 text-sm font-semibold text-ink-2 transition-colors hover:bg-surface-soft hover:text-ink"
              >
                {a.nome}
              </button>
            ))}
            <button
              onClick={() => setAvaliando(null)}
              className="rounded-full px-3.5 py-2 text-sm font-semibold text-ink-3 hover:text-ink"
            >
              Cancelar
            </button>
          </div>
        </Card>
      )}

      {alunoEmAvaliacao && (
        <AvaliacaoModal
          onClose={() => setAvaliando(null)}
          onSave={(av) => {
            addAvaliacao(av);
            setAvaliando(null);
            toast(`Avaliação registrada para ${alunoEmAvaliacao.nome}`);
          }}
          alunoId={alunoEmAvaliacao.id}
          alunoNome={alunoEmAvaliacao.nome}
          alunoSexo={alunoEmAvaliacao.sexo}
          alunoIdade={alunoEmAvaliacao.idade}
          anterior={avalsDoAluno[avalsDoAluno.length - 1]}
          historico={avalsDoAluno}
        />
      )}

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {/* ---------------- Coluna principal ---------------- */}
        <div className="grid gap-5">
          {/* Quem precisa agora */}
          <Card className="p-5 md:p-6">
            <h2 className="font-display text-lg font-bold tracking-[-0.02em] text-ink">Quem precisa agora</h2>
            {precisamAgora.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-sm text-ink-2">
                  Ninguém com avaliação pendente ou reavaliação nas próximas duas semanas.
                </p>
              </div>
            ) : (
              <div className="mt-3.5 space-y-2">
                {precisamAgora.map(({ aluno: a, tipo, em, acao }) => {
                  const d = tipo === "primeira" ? 0 : diasAte(em);
                  // A frase diz o MOTIVO, como no mockup, não só um contador solto.
                  const motivo =
                    tipo === "primeira"
                      ? "Primeira avaliação pendente"
                      : tipo === "vencida"
                        ? `Vencida há ${Math.abs(d)} ${Math.abs(d) === 1 ? "dia" : "dias"}`
                        : `Reavaliação em ${d} ${d === 1 ? "dia" : "dias"} · ${fmtDataCurta(em)}`;
                  // Filete 4px na cor da urgência + avatar tintado pela mesma família.
                  const filete =
                    tipo === "vencida" ? "var(--danger-fill)" : tipo === "chegando" ? "var(--warning-fill)" : "var(--primary)";
                  return (
                    <div
                      key={a.id}
                      className="grid grid-cols-[4px_40px_minmax(0,1fr)_auto] items-center gap-3.5 overflow-hidden rounded-[14px] border border-border pr-3 transition-colors hover:bg-surface-soft"
                    >
                      <span aria-hidden className="self-stretch rounded-r-[3px]" style={{ background: filete }} />
                      <Link
                        to={`/alunos/${a.id}?aba=avaliacoes`}
                        className="col-span-2 grid min-w-0 grid-cols-[40px_minmax(0,1fr)] items-center gap-3.5 py-3"
                      >
                        <span
                          className={cn(
                            "grid h-10 w-10 shrink-0 place-items-center rounded-control font-display text-xs font-bold",
                            tipo === "chegando" && "bg-analysis-tint text-analysis-text",
                            tipo === "primeira" && "bg-primary-tint text-primary",
                          )}
                          style={tipo === "vencida" ? { background: "#E8A317", color: "#0B1628" } : undefined}
                        >
                          {a.iniciais}
                        </span>
                        <span className="min-w-0">
                          <b className="block truncate text-sm font-semibold text-ink">{a.nome}</b>
                          <span className={cn("block truncate text-sm", tipo === "vencida" ? "text-danger" : "text-ink-2")}>
                            {motivo}
                          </span>
                        </span>
                      </Link>
                      {/* ação direta: registrar sem caçar o botão dentro do perfil */}
                      <Link
                        to={`/alunos/${a.id}?avaliar=1`}
                        className={cn(
                          "rounded-full px-3.5 py-2 text-sm font-semibold transition-[background-color,filter]",
                          tipo === "vencida" ? "bg-ink text-surface hover:brightness-[1.15]" : "bg-bg text-ink hover:bg-surface-mute",
                        )}
                      >
                        {acao}
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Evolução da carteira */}
          <Card className="overflow-hidden p-0">
            <div className="p-5 pb-4 md:p-6 md:pb-4">
              <h2 className="font-display text-lg font-bold tracking-[-0.02em] text-ink">Evolução da carteira</h2>
              <p className="mt-1 text-sm text-ink-2">
                Variação da primeira à última avaliação, lida contra o objetivo de cada aluno
              </p>
              {evolucao.length > 0 && (
                <div role="tablist" aria-label="Filtrar a evolução" className="mt-4 inline-flex gap-1 rounded-full bg-surface-soft p-1">
                  {(
                    [
                      ["favor", "A favor"],
                      ["atencao", "Atenção"],
                      ["todos", "Todos"],
                    ] as const
                  ).map(([id, rotulo]) => (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      aria-selected={filtro === id}
                      onClick={() => {
                        setFiltro(id);
                        setCarteiraToda(false);
                      }}
                      className={cn(
                        "rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors",
                        filtro === id ? "bg-surface text-ink shadow-sm" : "text-ink-2 hover:text-ink",
                      )}
                    >
                      {rotulo}
                      {/* A contagem de Atenção fica sempre à vista: o filtro padrão é "A favor",
                          como no protótipo, e quem pede conversa não pode sumir sem aviso. */}
                      {id === "atencao" && contagem.atencao > 0 && (
                        <span className="tabular ml-1.5 rounded-full bg-warning-tint px-1.5 text-2xs font-bold text-warning">
                          {contagem.atencao}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {evolucao.length === 0 ? (
              <p className="border-t border-border px-5 py-6 text-center text-sm text-ink-2">
                A evolução aparece quando um aluno tiver 2 ou mais avaliações registradas.
              </p>
            ) : filtradas.length === 0 ? (
              <p className="border-t border-border px-5 py-6 text-center text-sm text-ink-2">
                {filtro === "atencao"
                  ? "Nenhuma medida andando contra o objetivo na carteira."
                  : "Nenhuma medida a favor do objetivo por enquanto."}
              </p>
            ) : (
              <ol>
                {visiveis.map((l) => (
                  <li key={l.aluno.id} className="border-t border-border even:bg-surface-soft/60">
                    <Link
                      to={`/alunos/${l.aluno.id}?aba=avaliacoes`}
                      className="block px-5 py-4 transition-colors hover:bg-surface-soft md:px-6"
                    >
                      <div className="flex items-center gap-3.5">
                        <span
                          className="grid h-10 w-10 shrink-0 place-items-center rounded-control font-display text-xs font-bold"
                          style={{ background: "#0B1628", color: "#F3F1EA" }}
                        >
                          {l.aluno.iniciais}
                        </span>
                        <div className="min-w-0 flex-1">
                          <b className="block truncate text-[15px] font-semibold text-ink">{l.aluno.nome}</b>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-3">
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 font-semibold",
                                PILULA_OBJETIVO[l.aluno.objetivo] ?? "bg-surface-mute text-ink-2",
                              )}
                            >
                              {ROTULO_OBJETIVO[l.aluno.objetivo] ?? l.aluno.objetivo}
                            </span>
                            <span className="tabular">
                              {l.n} avaliações · {l.dias} dias
                            </span>
                          </div>
                        </div>
                        {l.pesos.length >= 2 && <SeriePeso pesos={l.pesos} leitura={l.leituraPeso ?? "estavel"} />}
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-2.5">
                        {l.medidas.map((m) => (
                          <div key={m.rotulo} className={cn("min-w-0 rounded-xl border px-3 py-2.5", COR_LEITURA[m.leitura].caixa)}>
                            <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-ink-3">{m.rotulo}</p>
                            <p className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5">
                              <b className="tabular text-base font-bold text-ink">{m.valor}</b>
                              <span className={cn("tabular text-xs font-semibold", COR_LEITURA[m.leitura].variacao)}>
                                {m.variacao}
                              </span>
                            </p>
                          </div>
                        ))}
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            )}

            {evolucao.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3.5 md:px-6">
                <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-2" aria-label="Legenda das cores">
                  {(
                    [
                      ["favor", "a favor do objetivo"],
                      ["atencao", "merece conversa"],
                      ["estavel", "estável"],
                    ] as const
                  ).map(([id, rotulo]) => (
                    <li key={id} className="flex items-center gap-1.5">
                      <span aria-hidden className={cn("h-2 w-2 rounded-full", COR_LEITURA[id].ponto)} />
                      {rotulo}
                    </li>
                  ))}
                </ul>
                {filtradas.length > LINHAS_VISIVEIS && (
                  <button
                    type="button"
                    onClick={() => setCarteiraToda((v) => !v)}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                  >
                    {carteiraToda ? "Mostrar menos" : `Ver carteira completa (${filtradas.length})`}
                    {!carteiraToda && <ArrowRight className="h-4 w-4" aria-hidden />}
                  </button>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* ---------------- Coluna lateral ---------------- */}
        <div className="grid gap-5">
          {/* Este mês: contagem real do mês corrente + colunas dos últimos 6 meses */}
          <div className="relative overflow-hidden rounded-card p-5 md:p-6" style={{ background: "#0B1628", color: "#F3F1EA" }}>
            <div
              aria-hidden
              className="pointer-events-none absolute -right-[60px] -top-[80px] h-[220px] w-[220px] rounded-full"
              style={{ background: "radial-gradient(circle,rgba(232,163,23,.3),rgba(232,163,23,0) 65%)" }}
            />
            <p className="relative m-0 text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "#7FE3D8" }}>
              Este mês
            </p>
            <p className="relative mb-0 mt-2.5 font-display text-5xl font-bold leading-none tracking-[-0.03em]">
              {noMes}{" "}
              <span className="text-base font-medium tracking-normal" style={{ color: "#8FA0B5" }}>
                {noMes === 1 ? "avaliação" : "avaliações"}
              </span>
            </p>
            {maxMes > 0 && (
              <>
                <div className="relative mt-4 flex h-12 items-end gap-[3px]">
                  {meses.map((m, i) => (
                    <span
                      key={i}
                      className="flex-1 rounded-[3px]"
                      style={
                        m.total === 0
                          ? { height: 3, background: "#24406A", opacity: 0.5 }
                          : { height: `${Math.round((m.total / maxMes) * 100)}%`, background: m.atual ? "#7FE3D8" : "#24406A" }
                      }
                      title={`${m.label}: ${m.total}`}
                    />
                  ))}
                </div>
                <p className="relative mb-0 mt-2 text-xs" style={{ color: "#8FA0B5" }}>
                  {meses.map((m, i) => (
                    <React.Fragment key={i}>
                      {m.atual ? <b style={{ color: "#7FE3D8" }}>{m.label}</b> : m.label}
                      {i < meses.length - 1 && " · "}
                    </React.Fragment>
                  ))}
                </p>
              </>
            )}
          </div>

          {/* Últimas avaliações */}
          <Card className="p-5">
            <h2 className="font-display text-base font-bold tracking-[-0.02em] text-ink">Últimas avaliações</h2>
            {recentes.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <CheckCircle2 className="h-6 w-6 text-success" />
                <p className="text-sm text-ink-2">Nenhuma avaliação registrada ainda.</p>
              </div>
            ) : (
              <ol className="mt-2">
                {recentes.map((av) => {
                  // Só campos que EXISTEM no registro entram na linha.
                  const partes = [fmtDataCurta(av.data)];
                  if (av.medidas.peso != null) partes.push(`${fmtNum(av.medidas.peso)} kg`);
                  if (av.medidas.percentualGordura != null) partes.push(`${fmtNum(av.medidas.percentualGordura)}% gordura`);
                  if (av.dorEscala != null) partes.push(`dor ${av.dorEscala}`);
                  return (
                    <li key={av.id} className="border-b border-surface-mute last:border-b-0">
                      <Link
                        /* A AVALIAÇÃO CLICADA É O DESTINO, e não a ficha do aluno.
                           O Filipe: "se eu cliquei para ver a última avaliação quero ver os detalhes
                           dessa última avaliação". Sem `?aba=`, o destino caía na Visão, que é o
                           padrão, e a avaliação que ele acabou de clicar ficava duas ações adiante.
                           `?av=` leva o link até o registro exato, não só até a aba dele. */
                        to={`/alunos/${av.alunoId}?aba=avaliacoes&av=${av.id}`}
                        className="flex items-center gap-2.5 rounded-[10px] py-3 transition-colors hover:bg-surface-soft"
                      >
                        <span
                          className={cn(
                            "grid h-9 w-9 shrink-0 place-items-center rounded-[10px] font-display text-2xs font-bold",
                            tintaDe(av.alunoId),
                          )}
                        >
                          {iniciais(av.alunoId)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <b className="block truncate text-sm font-semibold text-ink">{nomeAluno(av.alunoId)}</b>
                          <span className="block truncate text-xs text-ink-3">{partes.join(" · ")}</span>
                        </span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-ink-3" />
                      </Link>
                    </li>
                  );
                })}
              </ol>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

/**
 * A série de peso em barrinhas, como o protótipo desenha ao lado do nome, com a primeira e a
 * última medida escritas: "78,5 → 75,2 kg". A escala é a do PRÓPRIO aluno (do menor ao maior
 * valor dele), porque o que se lê aqui é a forma da trajetória, não a comparação entre alunos.
 * Só a última barra ganha cor, na mesma leitura do quadro de peso logo abaixo.
 */
function SeriePeso({ pesos, leitura }: { pesos: number[]; leitura: Leitura }) {
  const serie = pesos.slice(-5);
  const min = Math.min(...serie);
  const max = Math.max(...serie);
  const altura = (v: number) => (max === min ? 60 : 30 + ((v - min) / (max - min)) * 70);
  const corUltima = leitura === "favor" ? "bg-success-fill" : leitura === "atencao" ? "bg-warning-fill" : "bg-ink-3";
  return (
    <div className="flex shrink-0 items-end gap-2.5" aria-label={`Peso de ${fmtNum(pesos[0])} para ${fmtNum(pesos[pesos.length - 1])} kg`}>
      <div aria-hidden className="flex h-9 items-end gap-[3px]">
        {serie.map((v, i) => (
          <span
            key={i}
            className={cn("w-[7px] rounded-[2px]", i === serie.length - 1 ? corUltima : "bg-surface-mute")}
            style={{ height: `${altura(v)}%` }}
          />
        ))}
      </div>
      <span className="tabular hidden whitespace-nowrap text-xs text-ink-3 sm:inline">
        {fmtNum(pesos[0])} → {fmtNum(pesos[pesos.length - 1])} kg
      </span>
    </div>
  );
}
