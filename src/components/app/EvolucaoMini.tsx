import * as React from "react";
import type { Avaliacao } from "@/data/alunos";
import { cn } from "@/lib/utils";

/**
 * Evolução do aluno em uma métrica ao longo das avaliações: seletor de métrica,
 * resumo do delta e mini-gráfico da série. Vivia embutido no AlunoDetail; virou
 * componente reutilizável para servir também ao painel "Como estava antes" da
 * reavaliação (AvaliacaoModal), sem duplicar a lógica da série nem do desenho.
 */

// `dir` = direção desejável da métrica: "menor" (cair é bom), "maior" (subir é
// bom), "neutro" (sem juízo de valor). Colore o delta pela direção certa, então
// ganhar massa muscular aparece como positivo, não como alerta.
export type DirMetrica = "menor" | "maior" | "neutro";
export type MetricaEvolucao = { key: string; label: string; unit: string; dir: DirMetrica };

export const METRICAS_EVOLUCAO: MetricaEvolucao[] = [
  { key: "peso", label: "Peso", unit: "kg", dir: "neutro" },
  { key: "percentualGordura", label: "% gordura", unit: "%", dir: "menor" },
  { key: "cintura", label: "Cintura", unit: "cm", dir: "menor" },
  { key: "quadril", label: "Quadril", unit: "cm", dir: "neutro" },
  { key: "massaMuscular", label: "Massa muscular", unit: "kg", dir: "maior" },
  { key: "imc", label: "IMC", unit: "", dir: "neutro" },
  { key: "fcRepouso", label: "FC repouso", unit: "bpm", dir: "menor" },
  { key: "pressaoSistolica", label: "PA sistólica", unit: "mmHg", dir: "menor" },
];

// Subconjunto-chave para o painel "Como estava antes" da reavaliação: peso, IMC e
// % de gordura são as três leituras que orientam a maioria das decisões de rumo.
export const METRICAS_CHAVE: MetricaEvolucao[] = METRICAS_EVOLUCAO.filter((m) =>
  ["peso", "imc", "percentualGordura"].includes(m.key),
);

/** Classe de cor do delta segundo a direção desejável da métrica. */
export function corDelta(dir: DirMetrica, delta: number): string {
  if (dir === "neutro" || delta === 0) return "text-ink-2";
  const bom = dir === "menor" ? delta < 0 : delta > 0;
  return bom ? "text-success" : "text-[color:var(--cta-text)]";
}

export function EvolucaoMini({
  avals,
  metricas = METRICAS_EVOLUCAO,
  valorUnico = false,
}: {
  avals: Avaliacao[];
  /** subconjunto de métricas a oferecer no seletor (padrão: todas as disponíveis) */
  metricas?: MetricaEvolucao[];
  /** com só 1 avaliação, mostra o valor anterior no lugar do aviso de curva
   *  (usado no painel "Como estava antes" da reavaliação) */
  valorUnico?: boolean;
}) {
  const disponiveis = metricas.filter((m) => avals.some((a) => a.medidas[m.key] != null));
  const [metric, setMetric] = React.useState(disponiveis[0]?.key ?? metricas[0]?.key ?? "peso");

  if (avals.length === 0) {
    return <p className="py-6 text-center text-sm text-ink-2">Registre avaliações para ver a evolução.</p>;
  }

  const cfg = metricas.find((m) => m.key === metric) ?? metricas[0];
  const serie = avals.map((a) => a.medidas[cfg.key]).filter((v): v is number => v != null);
  const primeiro = serie[0];
  const ultimo = serie[serie.length - 1];
  const delta = ultimo != null && primeiro != null ? +(ultimo - primeiro).toFixed(1) : 0;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5">
          {disponiveis.map((m) => (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
              className={cn(
                "rounded-full px-3 py-1 text-sm font-medium",
                metric === m.key ? "bg-primary-tint text-primary" : "text-ink-2 hover:bg-surface-soft",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        {serie.length >= 2 && (
          <span className="text-sm text-ink-2">
            {cfg.label}: {ultimo}
            {cfg.unit} ·{" "}
            <span className={cn("font-semibold", corDelta(cfg.dir, delta))}>
              {delta > 0 ? "+" : ""}
              {delta}
              {cfg.unit}
            </span>{" "}
            no período
          </span>
        )}
      </div>
      {serie.length >= 2 ? (
        <MiniLine values={serie} />
      ) : valorUnico && ultimo != null ? (
        <p className="py-2 text-sm text-ink-2">
          {cfg.label} na última avaliação:{" "}
          <span className="font-semibold text-ink">
            {ultimo}
            {cfg.unit}
          </span>
        </p>
      ) : (
        <p className="py-4 text-center text-sm text-ink-3">Ao menos duas avaliações para traçar a curva.</p>
      )}
    </div>
  );
}

export function MiniLine({ values }: { values: number[] }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const coord = (v: number, i: number) => {
    const x = (i / (values.length - 1)) * 100;
    const y = 40 - ((v - min) / range) * 34 - 3;
    return { x, y };
  };
  const pts = values.map((v, i) => {
    const c = coord(v, i);
    return `${c.x},${c.y}`;
  });
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-28 w-full">
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      {values.map((v, i) => {
        const c = coord(v, i);
        return <circle key={i} cx={c.x} cy={c.y} r={3} fill="var(--primary)" vectorEffect="non-scaling-stroke" />;
      })}
    </svg>
  );
}
