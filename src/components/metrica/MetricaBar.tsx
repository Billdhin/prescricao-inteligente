import { BarTrack, type BarTone } from "@/components/ui/primitives";
import { getMetrica, faixaDe } from "@/data/metricasGlossario";
import { cn } from "@/lib/utils";
import { MetricaInfo } from "./MetricaInfo";

/**
 * A forma canônica de mostrar um número desta base na interface.
 *
 * Três coisas que a barra crua não fazia e que o Filipe cobrou, uma a uma:
 * 1. dizia "70%" sem dizer 70% de quê. Aqui a escala é explícita: 70/100.
 * 2. o número vinha sozinho. "Complexidade 12" não decide nada; "12/100, Simples:
 *    aprende na primeira sessão" decide. A faixa vem junto do valor, sempre.
 * 3. o rótulo não explicava a si mesmo. Aqui ele é clicável (MetricaInfo) e abre
 *    o que é, a escala, o referencial e as faixas.
 *
 * Dado ausente NUNCA vira número: sem valor, a linha diz que não há dado medido.
 * Chutar um fallback e depois comparar em cima do chute já causou bug real no
 * Comparador (coroava "melhor" com valor inventado).
 */
export function MetricaBar({
  nome,
  valor,
  tone = "primary",
  rotuloTexto,
  className,
}: {
  /** nome da métrica, como em `metricasGlossario.ts` (ou um apelido conhecido) */
  nome: string;
  /** 0 a 100. `undefined` = sem dado medido, e a linha diz isso. */
  valor?: number;
  tone?: BarTone;
  /**
   * Quando a linha é uma entre várias da MESMA métrica (comparação entre exercícios),
   * o rótulo clicável já está no cabeçalho do bloco: aqui entra o nome do exercício.
   */
  rotuloTexto?: string;
  className?: string;
}) {
  const def = getMetrica(nome);
  const faixa = def && valor !== undefined ? faixaDe(def, valor) : undefined;

  return (
    <div className={cn("min-w-0", className)}>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        {rotuloTexto ? (
          <span className="min-w-0 truncate text-xs text-ink-2" title={rotuloTexto}>
            {rotuloTexto}
          </span>
        ) : (
          <MetricaInfo nome={nome} valor={valor} className="text-sm font-semibold text-ink" />
        )}
        {valor === undefined ? (
          <span className="shrink-0 text-xs text-ink-3">sem dado medido</span>
        ) : (
          <span className="tabular shrink-0 text-xs">
            <span className="font-bold text-ink">{valor}</span>
            <span className="text-ink-3">/100</span>
            {faixa ? <span className="font-semibold text-ink-2"> · {faixa.rotulo}</span> : null}
          </span>
        )}
      </div>
      {valor === undefined ? (
        <div className="h-2 rounded-full border border-dashed border-border" />
      ) : (
        <BarTrack
          value={valor}
          tone={tone}
          srLabel={`${rotuloTexto ? `${rotuloTexto}, ` : ""}${nome}: ${valor} de 100${faixa ? `, ${faixa.rotulo}` : ""}`}
        />
      )}
    </div>
  );
}
