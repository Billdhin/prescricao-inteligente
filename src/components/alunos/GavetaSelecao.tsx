import * as React from "react";
import { createPortal } from "react-dom";
import { X, Search, Check } from "lucide-react";
import { useDialog } from "@/lib/useDialog";
import { cn } from "@/lib/utils";

export interface ItemGaveta {
  id: string;
  grupo: string;
  titulo: string;
  descricao: string;
  /** o que MUDA se isto for marcado, derivado do catálogo (nunca escrito na tela) */
  consequencia?: string;
  /** marcar este item desmarca todos os outros (ex.: "Nenhuma restrição física") */
  exclusivo?: boolean;
}

export interface GrupoGaveta {
  id: string;
  /** rótulo curto do filtro (ex.: "Região") */
  filtro: string;
  /** rótulo por extenso, usado no título da gaveta e no "outras ..." */
  titulo: string;
}

/**
 * GAVETA DE SELEÇÃO: onde as listas longas foram morar.
 *
 * Restrições físicas são 30 itens em 4 grupos; medicamentos são 8 classes em 4.
 * Enquanto isso vivia como accordion DENTRO do formulário, escolher uma restrição
 * empurrava o resto da página para baixo, o profissional perdia de vista o que
 * estava preenchendo e a seção parecia infinita. A gaveta resolve as três coisas
 * de uma vez: abre por cima, o contexto continua atrás dela, e o formulário só
 * recebe o resultado.
 *
 * Duas decisões que valem a leitura:
 *
 * 1. **A seleção é um rascunho até "Aplicar".** Fechar no X ou no Escape descarta.
 *    Sem isso, marcar para ler a descrição já mudaria o perfil do aluno, e desfazer
 *    exigiria lembrar do que foi tocado.
 * 2. **A busca atravessa os grupos.** Digitar "joelho" acha em Região e em
 *    Movimento; o filtro ativo ordena, não esconde, e o que ficou fora aparece
 *    como pílula em "outras". Um catálogo dividido em quatro caixas só ajuda quem
 *    já sabe em qual caixa procurar.
 */
export function GavetaSelecao({
  titulo,
  instrucao,
  grupos,
  itens,
  grupoInicial,
  selecionados,
  rotuloAplicar,
  aviso,
  onAplicar,
  onFechar,
}: {
  titulo: string;
  instrucao: string;
  grupos: GrupoGaveta[];
  itens: ItemGaveta[];
  grupoInicial?: string;
  selecionados: string[];
  /** singular e plural do que se aplica (ex.: ["restrição", "restrições"]) */
  rotuloAplicar: [string, string];
  aviso: string;
  onAplicar: (ids: string[]) => void;
  onFechar: () => void;
}) {
  const [busca, setBusca] = React.useState("");
  const [grupo, setGrupo] = React.useState(grupoInicial ?? grupos[0]?.id);
  const [draft, setDraft] = React.useState<string[]>(selecionados);
  const dialogRef = useDialog<HTMLDivElement>(onFechar);

  const q = busca.trim().toLowerCase();
  const casa = (it: ItemGaveta) =>
    !q || it.titulo.toLowerCase().includes(q) || it.descricao.toLowerCase().includes(q);

  const achados = itens.filter(casa);
  /*
   * O ITEM EXCLUSIVO ("nenhuma") APARECE EM QUALQUER FILTRO, E NO TOPO.
   *
   * Ele mora num grupo como qualquer outro item do catálogo, e no de restrições esse grupo é
   * "Histórico", o quarto filtro, com ele abaixo de seis vizinhos. Só que "não tenho nada a
   * declarar" não é um item do assunto Histórico: é a resposta à pergunta inteira, e ela vale
   * esteja o profissional em que aba estiver. Enquanto ficou dentro do grupo, a única forma
   * de responder "não tem" era adivinhar a aba certa e rolar até o fim.
   *
   * Ele sai da lista comum para não aparecer duas vezes, e nunca é oferecido como "também em
   * outros grupos", porque não é de outro grupo: é de todos.
   */
  const exclusivo = achados.find((it) => it.exclusivo);
  const comuns = achados.filter((it) => !it.exclusivo);
  const noGrupo = comuns.filter((it) => it.grupo === grupo);
  const foraDoGrupo = comuns.filter((it) => it.grupo !== grupo);

  const alternar = (it: ItemGaveta) => {
    setDraft((prev) => {
      if (prev.includes(it.id)) return prev.filter((x) => x !== it.id);
      if (it.exclusivo) return [it.id];
      // Marcar qualquer outra coisa derruba a exclusiva ("nenhuma" e "alguma"
      // não podem coexistir sem virar contradição no prontuário).
      const exclusivas = new Set(itens.filter((x) => x.exclusivo).map((x) => x.id));
      return [...prev.filter((x) => !exclusivas.has(x)), it.id];
    });
  };

  const n = draft.length;
  const rotuloGrupoAtual = grupos.find((g) => g.id === grupo)?.titulo.toLowerCase() ?? "";

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm" onClick={onFechar}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="flex h-full w-full max-w-xl flex-col bg-surface shadow-overlay outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-3 border-b border-border p-5">
          <div className="min-w-0">
            <h2 className="font-display text-xl font-bold text-ink">{titulo}</h2>
            <p className="mt-0.5 text-sm text-ink-2">
              {instrucao}{" "}
              <strong className="font-semibold text-ink">
                {n} selecionada{n === 1 ? "" : "s"}.
              </strong>
            </p>
          </div>
          <button
            onClick={onFechar}
            aria-label="Fechar"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-soft text-ink-3 hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Busca e filtros */}
        <div className="space-y-3 border-b border-border p-5">
          <label className="relative block">
            <span className="sr-only">Buscar em {titulo}</span>
            <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar"
              className="h-12 w-full rounded-control border border-border bg-surface pl-10 pr-24 text-base text-ink outline-none placeholder:text-ink-3 focus-visible:border-primary"
            />
            {q && (
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-2">
                {achados.length} resultado{achados.length === 1 ? "" : "s"}
              </span>
            )}
          </label>
          <div className="flex flex-wrap gap-2">
            {grupos.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGrupo(g.id)}
                aria-pressed={g.id === grupo}
                className={cn(
                  "min-h-[40px] rounded-full border px-4 text-sm font-medium transition-colors",
                  g.id === grupo
                    ? "border-ink bg-ink font-bold text-surface"
                    : "border-border bg-surface text-ink-2 hover:bg-surface-soft hover:text-ink",
                )}
              >
                {g.filtro}
              </button>
            ))}
          </div>
        </div>

        {/* Lista */}
        <div className="min-h-0 flex-1 space-y-3 overflow-auto p-5">
          {noGrupo.length === 0 && foraDoGrupo.length === 0 && !exclusivo && (
            <p className="py-8 text-center text-sm text-ink-2">
              Nada encontrado para "{busca}". Tente outra palavra ou troque o filtro.
            </p>
          )}

          {/* A resposta "não tenho nada a declarar", fixa no topo de qualquer filtro. */}
          {exclusivo && (
            <div className="border-b border-dashed border-border pb-3">
              <CartaoItem
                item={exclusivo}
                marcado={draft.includes(exclusivo.id)}
                onToggle={() => alternar(exclusivo)}
              />
            </div>
          )}

          {noGrupo.map((it) => (
            <CartaoItem key={it.id} item={it} marcado={draft.includes(it.id)} onToggle={() => alternar(it)} />
          ))}

          {/* O que a busca achou nos outros grupos: pílula, para trocar de filtro
              sem perder a busca (e para deixar claro que o catálogo não acabou aqui). */}
          {foraDoGrupo.length > 0 && (
            <div className="border-t border-dashed border-border pt-4">
              <div className="mb-2 text-2xs font-bold uppercase tracking-wider text-ink-3">
                {q ? "Também em outros grupos" : `Outras ${rotuloGrupoAtual}`}
              </div>
              <div className="flex flex-wrap gap-2">
                {foraDoGrupo.map((it) => (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => setGrupo(it.grupo)}
                    className={cn(
                      "min-h-[40px] rounded-full border px-4 text-sm font-medium transition-colors",
                      draft.includes(it.id)
                        ? "border-primary bg-primary-tint font-semibold text-primary"
                        : "border-border bg-surface text-ink-2 hover:bg-surface-soft hover:text-ink",
                    )}
                  >
                    {draft.includes(it.id) && <span aria-hidden>✓ </span>}
                    {it.titulo}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Prudência: a mesma frase do catálogo, no lugar onde a escolha acontece */}
        <p className="border-t border-border bg-surface-soft px-5 py-3 text-xs leading-relaxed text-ink-2">{aviso}</p>

        {/* Rodapé */}
        <div className="flex items-center justify-between gap-3 border-t border-border p-5">
          <button
            type="button"
            onClick={() => setDraft([])}
            disabled={n === 0}
            className="text-sm font-semibold text-ink-2 hover:text-ink disabled:opacity-40"
          >
            Limpar
          </button>
          <button
            type="button"
            onClick={() => onAplicar(draft)}
            className="min-h-[48px] rounded-full bg-ink px-6 text-sm font-bold text-surface transition-opacity hover:opacity-90"
          >
            Aplicar {n} {n === 1 ? rotuloAplicar[0] : rotuloAplicar[1]}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function CartaoItem({
  item,
  marcado,
  onToggle,
}: {
  item: ItemGaveta;
  marcado: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={marcado}
      onClick={onToggle}
      className={cn(
        "flex w-full items-start gap-3 rounded-card border p-4 text-left transition-colors",
        marcado ? "border-2 border-primary bg-primary-tint" : "border-border bg-surface hover:bg-surface-soft",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-2",
          marcado ? "border-primary bg-primary text-on-primary" : "border-ink-3/50 bg-surface",
        )}
      >
        {marcado && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </span>
      <span className="min-w-0">
        <span className="block font-semibold text-ink">{item.titulo}</span>
        <span className="mt-0.5 block text-sm leading-relaxed text-ink-2">{item.descricao}</span>
        {item.consequencia && (
          <span className="mt-1.5 block text-sm font-semibold text-primary">{item.consequencia}</span>
        )}
      </span>
    </button>
  );
}
