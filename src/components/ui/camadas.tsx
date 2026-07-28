import * as React from "react";
import { BookOpen } from "lucide-react";
import { Tabs, type TabItem } from "@/components/ui/disclosure";
import { bibliografia } from "@/data/referencias";
import { cn } from "@/lib/utils";

/**
 * AS TRÊS CAMADAS DE PROFUNDIDADE, o padrão que o design aprovado manda repetir
 * em toda superfície de conteúdo (exercício, comparador, consultar, semáforo e
 * o wizard de prescrição):
 *
 *   Resumo      o quê, quando brilha, cuidado. Três frases, nunca mais.
 *   Na prática  quando usar e evitar, erros, doses.
 *   Ciência     as referências e o selo de confiança.
 *
 * O diagnóstico do design foi literal: "os textos atuais não estão errados,
 * estão longos". As camadas resolvem isso sem jogar conteúdo fora, que é o
 * ativo do produto: o texto continua ali, uma aba adiante.
 *
 * Embrulha o `Tabs` de disclosure.tsx em vez de reimplementar: aquele já tem
 * roving tabindex, setas, Home/End e `aria-controls` corretos.
 *
 * REGRA DURA: sem referência, a aba Ciência NÃO aparece. Uma aba "Ciência" vazia
 * é pior que aba nenhuma, porque promete respaldo e entrega branco.
 */
export function TresCamadas({
  resumo,
  pratica,
  /** ids de referência (referencias.ts). Vazio ou ausente = sem aba Ciência. */
  refs,
  /** nota metodológica acima da lista, quando a camada Ciência precisa avisar algo */
  notaCiencia,
  ariaLabel = "Camadas de profundidade",
  initial,
  className,
}: {
  resumo: React.ReactNode;
  pratica: React.ReactNode;
  refs?: string[];
  notaCiencia?: React.ReactNode;
  ariaLabel?: string;
  initial?: "resumo" | "pratica" | "ciencia";
  className?: string;
}) {
  const biblio = refs?.length ? bibliografia(refs) : [];

  const items: TabItem[] = [
    { id: "resumo", label: "Resumo", content: resumo },
    { id: "pratica", label: "Na prática", content: pratica },
  ];
  if (biblio.length > 0) {
    items.push({
      id: "ciencia",
      label: "Ciência",
      content: (
        <div className="space-y-3">
          {notaCiencia && <p className="text-xs leading-relaxed text-ink-2">{notaCiencia}</p>}
          <ListaReferencias ids={refs!} />
        </div>
      ),
    });
  }

  return (
    <div className={className}>
      <Tabs items={items} initial={initial} ariaLabel={ariaLabel} />
    </div>
  );
}

/**
 * A lista numerada de referências, extraída do `BaseCientifica` para poder ser
 * usada sozinha (a camada Ciência de qualquer superfície, não só a de exercício).
 * A numeração sai de `bibliografia()`, que é quem sabe a ordem canônica; nunca
 * do índice do array, senão duas telas citariam "2." falando de artigos
 * diferentes.
 */
export function ListaReferencias({ ids, className }: { ids: string[]; className?: string }) {
  const biblio = bibliografia(ids);
  if (biblio.length === 0) return null;
  return (
    <ol className={cn("space-y-1.5", className)}>
      {biblio.map((b) => (
        <li key={b.ref.id} className="flex gap-2 text-xs text-ink-2">
          <span className="tabular font-semibold text-analysis">{b.n}.</span>
          <span>
            <span className="font-medium text-ink">
              {b.ref.autores} ({b.ref.ano}).
            </span>{" "}
            {b.ref.titulo}. <span className="italic">{b.ref.fonte}</span>.
            {b.ref.nota ? <span className="block text-ink-2">{b.ref.nota}</span> : null}
          </span>
        </li>
      ))}
    </ol>
  );
}

/** Cabeçalho da camada Ciência quando ela aparece fora de abas (bloco solto). */
export function SeloCiencia({ children }: { children?: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <span className="grid h-7 w-7 place-items-center rounded-full bg-analysis-tint text-analysis">
        <BookOpen className="h-4 w-4" />
      </span>
      <h4 className="font-display text-sm font-bold text-ink">{children ?? "Base científica"}</h4>
    </div>
  );
}
