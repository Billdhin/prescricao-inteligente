import * as React from "react";
import { GitCompare, ArrowLeftRight } from "lucide-react";
import { Card, Pill } from "@/components/ui/primitives";
import { biblioteca, gruposComparaveis } from "@/data/library";
import { cn } from "@/lib/utils";

/**
 * Comparador de definições: o usuário escolhe um grupo de termos próximos e vê
 * as definições clássicas lado a lado, com uma linha do que os distingue.
 * Termos próximos são a queixa: dá para confundir força máxima com potência,
 * tensão com tração, mobilidade com flexibilidade. Aqui eles ficam em colunas.
 */
export function ComparadorDefinicoes() {
  const [grupoIdx, setGrupoIdx] = React.useState(0);
  const grupo = gruposComparaveis[grupoIdx];

  // Resolve os ids do grupo para verbetes; ignora ids que porventura não existam.
  const termos = React.useMemo(
    () => grupo.ids.map((id) => biblioteca.find((e) => e.id === id)).filter(Boolean),
    [grupo],
  ) as typeof biblioteca;

  // 2 colunas em telas médias; até 3 quando o grupo tem 3+ termos, para caber
  // lado a lado no desktop sem espremer demais. 4 termos: 2x2 no md, 4 no xl.
  const cols = termos.length >= 4 ? "sm:grid-cols-2 xl:grid-cols-4" : termos.length === 3 ? "lg:grid-cols-3" : "sm:grid-cols-2";

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Pill tone="analysis" icon={<GitCompare className="h-3 w-3" />}>
          Comparador de definições
        </Pill>
        <span className="text-sm text-ink-2">Termos próximos, lado a lado.</span>
      </div>

      <p className="mt-2 text-sm text-ink-2">
        Alguns termos são vizinhos e fáceis de confundir. Escolha um par ou trio para ver as definições
        clássicas juntas e o que muda entre eles.
      </p>

      {/* Seletor de grupo */}
      <div className="mt-4">
        <label htmlFor="comparador-grupo" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-3">
          Comparação
        </label>
        <select
          id="comparador-grupo"
          className="input"
          value={grupoIdx}
          onChange={(e) => setGrupoIdx(Number(e.target.value))}
        >
          {gruposComparaveis.map((g, i) => (
            <option key={g.titulo} value={i}>
              {g.titulo}
            </option>
          ))}
        </select>
      </div>

      {/* Colunas de definição */}
      <div className={cn("mt-4 grid grid-cols-1 gap-3", cols)}>
        {termos.map((e) => (
          <div key={e.id} className="flex flex-col rounded-xl border border-border bg-surface-soft p-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <h4 className="font-display text-sm font-bold text-ink">{e.termo}</h4>
              <Pill tone="neutral">{e.categoria}</Pill>
            </div>
            <p className="mt-2 text-sm font-medium text-ink">{e.definicao}</p>
            <p className="mt-2 text-xs text-ink-2">{e.resumo}</p>
          </div>
        ))}
      </div>

      {/* Linha do que os distingue */}
      {grupo.distincao && (
        <div className="mt-3 flex gap-2 rounded-xl border border-primary/20 bg-primary-tint p-3">
          <ArrowLeftRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          <p className="text-sm text-ink">
            <span className="font-semibold text-primary">O que muda. </span>
            {grupo.distincao}
          </p>
        </div>
      )}
    </Card>
  );
}
