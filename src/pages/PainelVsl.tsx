import * as React from "react";
import { Card, SectionHeader, buttonClasses } from "@/components/ui/primitives";
import { tryGetSupabase } from "@/lib/backend/supabaseClient";
import { VSL_APRESENTACAO } from "@/vsl/videos";
import { cn } from "@/lib/utils";

/**
 * PAINEL DO VSL: o "Analytics" da VTurb para o player próprio.
 *
 * Lê `vsl_painel` e exporta por `vsl_exportar` (migrações 0014 e 0015), que só respondem para
 * e-mails em `vsl_admins`. Definições, as mesmas da VTurb:
 * - Play rate: quem ativou o som, sobre quem abriu a página.
 * - Engajamento: a fração média do vídeo assistida por quem deu play.
 * - Retenção: dos que deram play, quantos estavam assistindo em cada ponto (quem retomou pelo
 *   "continuar assistindo" conta a partir de onde retomou).
 * - Conversão: clique no botão (a VTurb também conta o clique como o momento da conversão).
 */

type Dim = "variante" | "aparelho" | "sistema" | "navegador" | "origem" | "midia" | "campanha" | "conteudo" | "fuso";
type Grupo = { dim: Dim; chave: string; sessoes: number; plays: number; pitch: number; cta: number; engajamento: number | null };
type Serie = { sessoes: number; plays: number; cta: number; pitch?: number };
type Painel = {
  sessoes: number;
  visitantes: number;
  autoplay: number;
  plays: number;
  plays_unicos: number;
  retomadas: number;
  pitch: number;
  cta: number;
  terminaram: number;
  ao_vivo: number;
  engajamento: number | null;
  tempo_medio: number | null;
  horas_assistidas: number | null;
  carregamento_mediana: number | null;
  travamentos_por_play: number | null;
  pausas_por_play: number | null;
  cta_mediana: number | null;
  tela_cheia: number;
  mini_player: number;
  retencao: number[];
  por_dia: (Serie & { dia: string })[];
  por_hora: (Serie & { hora: number })[];
  por_semana: (Serie & { dia: number })[];
  grupos: Grupo[];
};

const PERIODOS = [7, 30, 90] as const;
const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)}%` : "sem dados");
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const DIAS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

export function PainelVsl() {
  const [dias, setDias] = React.useState<(typeof PERIODOS)[number]>(30);
  const [dados, setDados] = React.useState<Painel | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);
  const [carregando, setCarregando] = React.useState(true);
  const [exportando, setExportando] = React.useState(false);

  React.useEffect(() => {
    let vivo = true;
    const sb = tryGetSupabase();
    if (!sb) {
      setErro("Este aparelho está sem conexão com o banco. As métricas só existem na versão em nuvem.");
      setCarregando(false);
      return;
    }
    setCarregando(true);
    void sb
      .rpc("vsl_painel", { p_video: VSL_APRESENTACAO.id, p_duracao: VSL_APRESENTACAO.duracao, p_dias: dias })
      .then(({ data, error }) => {
        if (!vivo) return;
        if (error) {
          setDados(null);
          setErro(traduzirErro(error));
        } else {
          setErro(null);
          setDados(data as Painel);
        }
        setCarregando(false);
      });
    return () => {
      vivo = false;
    };
  }, [dias]);

  const exportar = async () => {
    const sb = tryGetSupabase();
    if (!sb) return;
    setExportando(true);
    const { data, error } = await sb.rpc("vsl_exportar", { p_video: VSL_APRESENTACAO.id, p_dias: dias });
    setExportando(false);
    if (error) return setErro(traduzirErro(error));
    baixarCsv(`vsl-sessoes-${dias}-dias.csv`, (data ?? []) as Record<string, unknown>[]);
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <SectionHeader
        eyebrow="Vídeo de apresentação"
        title="Métricas do VSL"
        subtitle="Quantos abrem, quantos ativam o som, até onde assistem, de onde vêm e quantos clicam no botão."
        right={
          <div className="flex flex-wrap items-center gap-2">
            <div role="group" aria-label="Período" className="flex gap-1 rounded-control bg-surface-soft p-1">
              {PERIODOS.map((p) => (
                <button
                  key={p}
                  type="button"
                  aria-pressed={dias === p}
                  onClick={() => setDias(p)}
                  className={cn(
                    "min-h-[40px] rounded-control px-3 text-sm font-semibold",
                    dias === p ? "bg-surface text-ink shadow-soft" : "text-ink-2 hover:text-ink",
                  )}
                >
                  {p} dias
                </button>
              ))}
            </div>
            <button type="button" onClick={exportar} disabled={!dados || exportando} className={buttonClasses("outline", "sm")}>
              {exportando ? "Exportando…" : "Exportar planilha"}
            </button>
          </div>
        }
      />

      {erro && (
        <Card className="p-5">
          <p className="font-semibold text-ink">{erro}</p>
          <p className="mt-1 text-sm text-ink-2">
            A página do vídeo continua funcionando normalmente; só a leitura das métricas fica indisponível até isso ser resolvido.
          </p>
        </Card>
      )}

      {carregando && !dados && !erro && <p className="text-sm text-ink-2">Carregando as métricas…</p>}

      {dados && <Conteudo d={dados} />}

      <p className="text-sm text-ink-2">
        Para ver a página como o visitante vê:{" "}
        <a className="font-semibold text-primary-texto underline" href="/apresentacao?previa=1" target="_blank" rel="noreferrer">
          abrir a apresentação
        </a>
        . Links de anúncio com <code className="rounded bg-surface-soft px-1">utm_source</code>,{" "}
        <code className="rounded bg-surface-soft px-1">utm_medium</code>, <code className="rounded bg-surface-soft px-1">utm_campaign</code> e{" "}
        <code className="rounded bg-surface-soft px-1">utm_content</code> aparecem separados nas tabelas abaixo.
      </p>
    </div>
  );
}

function traduzirErro(error: { message: string; code?: string }) {
  if (/sem_acesso/.test(error.message)) return "O seu e-mail não está na lista de quem vê este painel.";
  if (error.code === "PGRST202" || /function|função|column|coluna/i.test(error.message))
    return "As métricas completas ainda não foram ativadas no banco (migração 0015).";
  return "Não foi possível carregar as métricas agora. Tente de novo em instantes.";
}

/** Planilha no formato que o Excel brasileiro abre direto (ponto e vírgula, BOM em UTF-8). */
function baixarCsv(nome: string, linhas: Record<string, unknown>[]) {
  if (!linhas.length) return;
  const colunas = Object.keys(linhas[0]);
  const cel = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [colunas.join(";"), ...linhas.map((l) => colunas.map((c) => cel(l[c])).join(";"))].join("\r\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Conteudo({ d }: { d: Painel }) {
  const tiles: { rotulo: string; valor: string; nota: string }[] = [
    { rotulo: "Visitas", valor: String(d.sessoes), nota: `${d.visitantes} pessoas diferentes` },
    { rotulo: "Play rate", valor: pct(d.plays, d.sessoes), nota: `${d.plays} ativaram o som (${d.plays_unicos} pessoas)` },
    {
      rotulo: "Engajamento",
      valor: d.engajamento != null ? `${Math.round(d.engajamento)}%` : "sem dados",
      nota: d.tempo_medio != null ? `do vídeo, em média · ${mmss(d.tempo_medio)} assistidos` : "do vídeo, em média",
    },
    { rotulo: "Retenção no pitch", valor: pct(d.pitch, d.plays), nota: `${d.pitch} chegaram ao preço (${mmss(VSL_APRESENTACAO.pitch)})` },
    {
      rotulo: "Conversão",
      valor: pct(d.cta, d.plays),
      nota: `${d.cta} cliques no botão${d.cta_mediana != null ? ` · metade até ${mmss(d.cta_mediana)}` : ""}`,
    },
    { rotulo: "Até o fim", valor: pct(d.terminaram, d.plays), nota: `${d.terminaram} assistiram inteiro · ${d.retomadas} retomaram` },
    {
      rotulo: "Carregamento",
      valor: d.carregamento_mediana != null ? `${(d.carregamento_mediana / 1000).toFixed(1)} s` : "sem dados",
      nota: `até o 1º quadro · ${d.travamentos_por_play ?? 0} travamentos por play`,
    },
    { rotulo: "Ao vivo agora", valor: String(d.ao_vivo), nota: `assistindo nos últimos 2 min · ${d.horas_assistidas ?? 0} h no total` },
  ];
  const grupo = (dim: Dim, n = 8) => d.grupos.filter((g) => g.dim === dim).slice(0, n);
  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {tiles.map((t) => (
          <Card key={t.rotulo} className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-3">{t.rotulo}</p>
            <p className="mt-2 font-display text-3xl font-bold tabular-nums text-ink">{t.valor}</p>
            <p className="mt-1 text-xs text-ink-2">{t.nota}</p>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <h2 className="font-display text-lg font-bold text-ink">Retenção</h2>
        <p className="mt-1 text-sm text-ink-2">
          Dos que ativaram o som, a parte que continuava assistindo em cada momento do vídeo. Os pontos onde a curva cai
          mais rápido são os candidatos a mini-gancho.
        </p>
        <GraficoRetencao serie={d.retencao} duracao={VSL_APRESENTACAO.duracao} pitch={VSL_APRESENTACAO.pitch} />
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-display text-base font-bold text-ink">Plays por dia</h2>
          <Barras
            itens={d.por_dia.map((x) => ({
              rotulo: x.dia.slice(8, 10) + "/" + x.dia.slice(5, 7),
              valor: x.plays,
              detalhe: `${x.sessoes} visitas · ${x.plays} plays · ${x.cta} cliques`,
            }))}
          />
        </Card>
        <Card className="p-5">
          <h2 className="font-display text-base font-bold text-ink">Melhores horários</h2>
          <p className="mt-1 text-xs text-ink-2">Plays por hora do dia, no horário de Brasília.</p>
          <Barras
            itens={Array.from({ length: 24 }, (_, h) => {
              const x = d.por_hora.find((y) => y.hora === h);
              return { rotulo: String(h).padStart(2, "0"), valor: x?.plays ?? 0, detalhe: x ? `${h}h · ${x.plays} plays · ${pct(x.cta, x.plays)} de conversão` : `${h}h · sem visitas` };
            })}
          />
          <p className="mt-4 text-xs text-ink-2">Plays por dia da semana.</p>
          <Barras
            itens={DIAS.map((nome, w) => {
              const x = d.por_semana.find((y) => y.dia === w);
              return { rotulo: nome, valor: x?.plays ?? 0, detalhe: x ? `${nome} · ${x.plays} plays · ${pct(x.cta, x.plays)} de conversão` : `${nome} · sem visitas` };
            })}
          />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <TabelaGrupo titulo="Origem (utm_source)" grupos={grupo("origem")} />
        <TabelaGrupo titulo="Mídia (utm_medium)" grupos={grupo("midia")} />
        <TabelaGrupo titulo="Campanha (utm_campaign)" grupos={grupo("campanha")} />
        <TabelaGrupo titulo="Criativo (utm_content)" grupos={grupo("conteudo")} />
        <TabelaGrupo titulo="Teste A/B" grupos={grupo("variante")} />
        <TabelaGrupo titulo="Aparelho" grupos={grupo("aparelho")} />
        <TabelaGrupo titulo="Sistema" grupos={grupo("sistema")} />
        <TabelaGrupo titulo="Navegador" grupos={grupo("navegador")} />
        <TabelaGrupo titulo="Fuso horário" grupos={grupo("fuso")} />
      </div>

      <p className="text-xs text-ink-3">
        Tela cheia usada em {d.tela_cheia} plays · mini player em {d.mini_player} · {d.pausas_por_play ?? 0} pausas por play ·{" "}
        {d.autoplay} visitas com autoplay sem som funcionando.
      </p>
    </>
  );
}

/** Barras de uma série só, com o valor no hover (a legenda é o título do cartão). */
function Barras({ itens }: { itens: { rotulo: string; valor: number; detalhe: string }[] }) {
  const [mira, setMira] = React.useState<number | null>(null);
  if (!itens.length || itens.every((i) => !i.valor)) return <p className="mt-3 text-sm text-ink-2">Sem dados no período.</p>;
  const W = 640, H = 150, M = { e: 8, d: 8, t: 8, b: 22 };
  const max = Math.max(...itens.map((i) => i.valor), 1);
  const passo = (W - M.e - M.d) / itens.length;
  const largura = Math.max(2, passo - 2);
  const mostrarRotulo = (i: number) => itens.length <= 12 || i % Math.ceil(itens.length / 12) === 0;
  return (
    <div className="relative mt-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={itens.map((i) => i.detalhe).join("; ")} onPointerLeave={() => setMira(null)}>
        <line x1={M.e} x2={W - M.d} y1={H - M.b} y2={H - M.b} stroke="var(--border)" strokeWidth={1} />
        {itens.map((it, i) => {
          const h = ((H - M.t - M.b) * it.valor) / max;
          const x = M.e + i * passo + 1;
          return (
            <g key={it.rotulo + i} onPointerEnter={() => setMira(i)}>
              <rect x={x - 1} y={M.t} width={passo} height={H - M.t - M.b} fill="transparent" />
              {it.valor > 0 && <rect x={x} y={H - M.b - h} width={largura} height={h} rx={Math.min(4, largura / 2)} fill="var(--primary)" opacity={mira == null || mira === i ? 1 : 0.45} />}
              {mostrarRotulo(i) && (
                <text x={x + largura / 2} y={H - 6} textAnchor="middle" fontSize={10} fill="var(--ink-3)">
                  {it.rotulo}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {mira != null && (
        <div
          className="pointer-events-none absolute top-0 rounded-control bg-surface px-3 py-2 text-xs text-ink shadow-lift ring-1 ring-border"
          style={{ left: `${Math.min(70, Math.max(0, ((M.e + mira * passo) / W) * 100))}%` }}
        >
          {itens[mira].detalhe}
        </div>
      )}
    </div>
  );
}

/** Uma série só (o nome vem no título do cartão), área + linha de 2 px, marca do pitch e mira no hover. */
function GraficoRetencao({ serie, duracao, pitch }: { serie: number[]; duracao: number; pitch: number }) {
  const [mira, setMira] = React.useState<number | null>(null);
  const W = 760, H = 240, M = { e: 44, d: 12, t: 12, b: 28 };
  const base = Math.max(0, ...serie);
  if (!base) return <p className="mt-4 text-sm text-ink-2">Ainda não há plays neste período.</p>;
  const x = (i: number) => M.e + (i / 100) * (W - M.e - M.d);
  const y = (v: number) => M.t + (1 - Math.min(v, base) / base) * (H - M.t - M.b);
  const linha = serie.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
  const area = `${linha}L${x(100)},${y(0)}L${x(0)},${y(0)}Z`;
  const ip = Math.round((pitch / duracao) * 100);
  const mover = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    setMira(Math.max(0, Math.min(100, Math.round(((px - M.e) / (W - M.e - M.d)) * 100))));
  };
  return (
    <div className="relative mt-4">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full touch-none"
        role="img"
        aria-label={`Retenção: ${pct(serie[ip] ?? 0, base)} chegam ao pitch e ${pct(serie[100] ?? 0, base)} ao fim.`}
        onPointerMove={mover}
        onPointerLeave={() => setMira(null)}
      >
        {[0, 25, 50, 75, 100].map((g) => (
          <g key={g}>
            <line x1={M.e} x2={W - M.d} y1={y((base * g) / 100)} y2={y((base * g) / 100)} stroke="var(--border)" strokeWidth={1} />
            <text x={M.e - 8} y={y((base * g) / 100) + 4} textAnchor="end" fontSize={11} fill="var(--ink-3)">
              {g}%
            </text>
          </g>
        ))}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <text key={f} x={x(f * 100)} y={H - 8} textAnchor="middle" fontSize={11} fill="var(--ink-3)">
            {mmss(f * duracao)}
          </text>
        ))}
        <path d={area} fill="var(--primary)" opacity={0.14} />
        <path d={linha} fill="none" stroke="var(--primary)" strokeWidth={2} strokeLinejoin="round" />
        <line x1={x(ip)} x2={x(ip)} y1={M.t} y2={H - M.b} stroke="var(--ink-3)" strokeWidth={1} strokeDasharray="4 4" />
        <text x={x(ip) - 6} y={M.t + 12} textAnchor="end" fontSize={11} fill="var(--ink-2)">
          Pitch {mmss(pitch)}
        </text>
        {mira != null && (
          <g>
            <line x1={x(mira)} x2={x(mira)} y1={M.t} y2={H - M.b} stroke="var(--ink-2)" strokeWidth={1} />
            <circle cx={x(mira)} cy={y(serie[mira])} r={5} fill="var(--primary)" stroke="var(--surface)" strokeWidth={2} />
          </g>
        )}
      </svg>
      {mira != null && (
        <div
          className="pointer-events-none absolute top-2 rounded-control bg-surface px-3 py-2 text-xs shadow-lift ring-1 ring-border"
          style={{ left: `${Math.min(80, Math.max(2, (x(mira) / W) * 100))}%` }}
        >
          <p className="font-semibold text-ink">{mmss((mira / 100) * duracao)}</p>
          <p className="text-ink-2">
            {pct(serie[mira], base)} dos plays · {serie[mira]} pessoas
          </p>
        </div>
      )}
    </div>
  );
}

function TabelaGrupo({ titulo, grupos }: { titulo: string; grupos: Grupo[] }) {
  return (
    <Card className="overflow-x-auto p-5">
      <h2 className="font-display text-base font-bold text-ink">{titulo}</h2>
      {grupos.length === 0 ? (
        <p className="mt-2 text-sm text-ink-2">Sem dados no período.</p>
      ) : (
        <table className="mt-3 w-full text-left text-sm tabular-nums">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-ink-3">
              <th className="py-1 pr-2 font-semibold">Grupo</th>
              <th className="py-1 pr-2 font-semibold">Visitas</th>
              <th className="py-1 pr-2 font-semibold">Play</th>
              <th className="py-1 pr-2 font-semibold">Engaj.</th>
              <th className="py-1 pr-2 font-semibold">Pitch</th>
              <th className="py-1 font-semibold">Clique</th>
            </tr>
          </thead>
          <tbody>
            {grupos.map((g) => (
              <tr key={g.chave} className="border-t border-border text-ink">
                <td className="max-w-[12rem] truncate py-2 pr-2 font-semibold" title={g.chave}>
                  {g.chave}
                </td>
                <td className="py-2 pr-2">{g.sessoes}</td>
                <td className="py-2 pr-2">{pct(g.plays, g.sessoes)}</td>
                <td className="py-2 pr-2">{g.engajamento != null ? `${Math.round(g.engajamento)}%` : "·"}</td>
                <td className="py-2 pr-2">{pct(g.pitch, g.plays)}</td>
                <td className="py-2">{pct(g.cta, g.plays)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}
