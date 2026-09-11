import * as React from "react";
import { Card, SectionHeader } from "@/components/ui/primitives";
import { tryGetSupabase } from "@/lib/backend/supabaseClient";
import { VSL_APRESENTACAO } from "@/vsl/videos";
import { cn } from "@/lib/utils";

/**
 * PAINEL DO VSL: o "Analytics" da VTurb para o player próprio.
 *
 * Lê a função `vsl_painel` (migração 0014), que só responde para e-mails em `vsl_admins`.
 * Definições, as mesmas da VTurb:
 * - Play rate: quem clicou para ouvir, sobre quem abriu a página.
 * - Retenção: dos que deram play, quantos chegaram a cada ponto do vídeo.
 * - Conversão: clique no botão (a VTurb também conta o clique como o momento da conversão).
 */

type Grupo = { dim: "variante" | "aparelho" | "origem"; chave: string; sessoes: number; plays: number; pitch: number; cta: number };
type Painel = {
  sessoes: number;
  visitantes: number;
  autoplay: number;
  plays: number;
  retomadas: number;
  pitch: number;
  cta: number;
  terminaram: number;
  ao_vivo: number;
  retencao: number[];
  por_dia: { dia: string; sessoes: number; plays: number; cta: number }[];
  grupos: Grupo[];
};

const PERIODOS = [7, 30, 90] as const;
const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)}%` : "sem dados");
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export function PainelVsl() {
  const [dias, setDias] = React.useState<(typeof PERIODOS)[number]>(30);
  const [dados, setDados] = React.useState<Painel | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);
  const [carregando, setCarregando] = React.useState(true);

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
          if (/sem_acesso/.test(error.message)) setErro("O seu e-mail não está na lista de quem vê este painel.");
          else if (error.code === "PGRST202" || /function|função/i.test(error.message))
            setErro("As métricas ainda não foram ativadas no banco (migração 0014).");
          else setErro("Não foi possível carregar as métricas agora. Tente de novo em instantes.");
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

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <SectionHeader
        eyebrow="Vídeo de apresentação"
        title="Métricas do VSL"
        subtitle="Quantos abrem, quantos ativam o som, até onde assistem e quantos clicam no botão."
        right={
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
        }
      />

      {erro && (
        <Card className="p-5">
          <p className="font-semibold text-ink">{erro}</p>
          <p className="mt-1 text-sm text-ink-2">
            A página do vídeo continua funcionando normalmente; só a medição fica sem registro até isso ser resolvido.
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
        .
      </p>
    </div>
  );
}

function Conteudo({ d }: { d: Painel }) {
  const tiles: { rotulo: string; valor: string; nota: string }[] = [
    { rotulo: "Visitas", valor: String(d.sessoes), nota: `${d.visitantes} pessoas diferentes` },
    { rotulo: "Play rate", valor: pct(d.plays, d.sessoes), nota: `${d.plays} ativaram o som` },
    { rotulo: "Retenção no pitch", valor: pct(d.pitch, d.plays), nota: `${d.pitch} chegaram ao preço (${mmss(VSL_APRESENTACAO.pitch)})` },
    { rotulo: "Cliques no botão", valor: pct(d.cta, d.plays), nota: `${d.cta} cliques, sobre quem deu play` },
    { rotulo: "Até o fim", valor: pct(d.terminaram, d.plays), nota: `${d.terminaram} assistiram inteiro` },
    { rotulo: "Ao vivo agora", valor: String(d.ao_vivo), nota: "assistindo nos últimos 2 minutos" },
  ];
  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
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

      <div className="grid gap-4 lg:grid-cols-3">
        <TabelaGrupo titulo="Teste A/B" grupos={d.grupos.filter((g) => g.dim === "variante")} />
        <TabelaGrupo titulo="Aparelho" grupos={d.grupos.filter((g) => g.dim === "aparelho")} />
        <TabelaGrupo titulo="Origem" grupos={d.grupos.filter((g) => g.dim === "origem").slice(0, 8)} />
      </div>
    </>
  );
}

/** Uma série só (o nome vem no título do cartão), área + linha de 2 px, marca do pitch e mira no hover. */
function GraficoRetencao({ serie, duracao, pitch }: { serie: number[]; duracao: number; pitch: number }) {
  const [mira, setMira] = React.useState<number | null>(null);
  const W = 760, H = 240, M = { e: 44, d: 12, t: 12, b: 28 };
  const base = serie[0] ?? 0;
  if (!base) return <p className="mt-4 text-sm text-ink-2">Ainda não há plays neste período.</p>;
  const x = (i: number) => M.e + (i / 100) * (W - M.e - M.d);
  const y = (v: number) => M.t + (1 - v / base) * (H - M.t - M.b);
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
              <th className="py-1 pr-2 font-semibold">Pitch</th>
              <th className="py-1 font-semibold">Clique</th>
            </tr>
          </thead>
          <tbody>
            {grupos.map((g) => (
              <tr key={g.chave} className="border-t border-border text-ink">
                <td className="py-2 pr-2 font-semibold">{g.chave}</td>
                <td className="py-2 pr-2">{g.sessoes}</td>
                <td className="py-2 pr-2">{pct(g.plays, g.sessoes)}</td>
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
