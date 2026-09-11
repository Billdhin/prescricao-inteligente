import * as React from "react";
import { BookOpen, ChevronDown, ExternalLink } from "lucide-react";
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

/*
 * A LISTA NUMERADA DE REFERÊNCIAS da camada Ciência de qualquer superfície. A numeração sai de
 * `bibliografia()`, que é quem sabe a ordem canônica; nunca do índice do array, senão duas
 * telas citariam "2." falando de artigos diferentes.
 *
 * CADA REFERÊNCIA NUMA LINHA, O RESTO A UM TOQUE.
 *
 * A lista imprimia tudo de uma vez: autores completos, título, periódico e a nota de como o
 * motor aplica o trabalho. No trilho lateral do Prescrever treino, três referências viravam uma
 * coluna mais alta que a tela, e a pergunta "de onde vem isso?" se perdia num bloco de texto.
 * Agora a linha fechada diz QUEM e QUANDO, com o título numa linha só, e a seta abre o
 * periódico, a nota de aplicação e o link para conferir. Nada saiu: está um toque adiante.
 */

/** "Moesgaard L, Beck MM, ..." vira "Moesgaard L et al."; entidade sem vírgula fica como está. */
function autoriaCurta(autores: string): string {
  const semParenteses = autores.replace(/\s*\([^)]*\)\s*$/, "").trim();
  const [primeiro, ...resto] = semParenteses.split(",");
  return resto.length ? `${primeiro.trim()} et al.` : semParenteses;
}

/** Quantas referências aparecem antes do "Ver as outras": cinco linhas cabem num trilho lateral. */
const VISIVEIS = 5;

export function ListaReferencias({ ids, className }: { ids: string[]; className?: string }) {
  const biblio = bibliografia(ids);
  const [abertas, setAbertas] = React.useState<Set<string>>(() => new Set());
  // Lista curta (até uma a mais que o corte) aparece inteira: esconder uma só não economiza nada.
  const [todas, setTodas] = React.useState(false);
  if (biblio.length === 0) return null;
  const mostrarTodas = todas || biblio.length <= VISIVEIS + 1;
  const visiveis = mostrarTodas ? biblio : biblio.slice(0, VISIVEIS);
  const todasAbertas = abertas.size === biblio.length;
  const alternar = (id: string) =>
    setAbertas((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  return (
    <div className={className}>
      {biblio.length > 1 && (
        <div className="mb-1.5 flex justify-end">
          <button
            type="button"
            onClick={() => {
              setAbertas(todasAbertas ? new Set() : new Set(biblio.map((b) => b.ref.id)));
              if (!todasAbertas) setTodas(true);
            }}
            className="text-xs font-semibold text-primary hover:underline"
          >
            {todasAbertas ? "Recolher todas" : "Abrir todas"}
          </button>
        </div>
      )}
      <ol className="divide-y divide-border overflow-hidden rounded-control border border-border">
        {visiveis.map((b) => {
          const aberta = abertas.has(b.ref.id);
          const painel = `ref-${b.ref.id}`;
          return (
            <li key={b.ref.id} className="text-xs">
              <button
                type="button"
                onClick={() => alternar(b.ref.id)}
                aria-expanded={aberta}
                aria-controls={painel}
                className="flex w-full items-start gap-2 px-3 py-2.5 text-left transition-colors hover:bg-surface-soft"
              >
                <span className="tabular mt-px font-semibold text-analysis-text">{b.n}.</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-ink">
                    {autoriaCurta(b.ref.autores)}, {b.ref.ano}
                  </span>
                  <span className={cn("block text-ink-2", !aberta && "truncate")}>{b.ref.titulo}</span>
                </span>
                <ChevronDown
                  className={cn("mt-0.5 h-4 w-4 shrink-0 text-ink-2 transition-transform", aberta && "rotate-180")}
                  aria-hidden
                />
              </button>
              {aberta && (
                <div id={painel} className="space-y-1.5 px-3 pb-3 pl-8 leading-relaxed text-ink-2">
                  <p>
                    {b.ref.autores}. <span className="italic">{b.ref.fonte}</span>.
                  </p>
                  {b.ref.nota && (
                    <p className="rounded-control bg-surface-soft px-2.5 py-2 text-ink">{b.ref.nota}</p>
                  )}
                  {(b.ref.doi || b.ref.pmid) && (
                    <a
                      href={b.ref.doi ? `https://doi.org/${b.ref.doi}` : `https://pubmed.ncbi.nlm.nih.gov/${b.ref.pmid}/`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                    >
                      {b.ref.doi ? `doi:${b.ref.doi}` : `PubMed ${b.ref.pmid}`}
                      <ExternalLink className="h-3 w-3" aria-hidden />
                    </a>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      {!mostrarTodas && (
        <button
          type="button"
          onClick={() => setTodas(true)}
          className="mt-1.5 inline-flex min-h-[36px] items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          Ver as outras {biblio.length - VISIVEIS} referências
          <ChevronDown className="h-3.5 w-3.5" aria-hidden />
        </button>
      )}
    </div>
  );
}

/*
 * O MESMO "ABRE E FECHA" DA CIÊNCIA, PARA O RESTO DO TRILHO.
 *
 * A Ciência ficou enxuta (uma linha por referência, a seta abre o resto, "Abrir todas" no
 * alto), e o Resumo, o Na prática e o "De onde vem cada limite", logo ao lado, continuaram
 * imprimindo cada parágrafo inteiro: o trilho ficava mais alto que a coluna do plano e
 * deixava meia tela vazia do outro lado (pedido do Dilton, 10/09/2026). Agora cada item
 * mostra o título e a primeira linha do texto; a seta abre o resto.
 *
 * `GrupoRecolhivel` é o "Abrir todas / Recolher todas" do grupo; `ItemRecolhivel` é cada
 * linha. Os itens contam ao grupo se estão abertos, e o botão do grupo diz o que vai fazer.
 */
type ComandoDoGrupo = { abrir: boolean; n: number } | null;
const GrupoCtx = React.createContext<{
  comando: ComandoDoGrupo;
  informar: (id: string, aberto: boolean | null) => void;
} | null>(null);

export function GrupoRecolhivel({ children, className }: { children: React.ReactNode; className?: string }) {
  const [comando, setComando] = React.useState<ComandoDoGrupo>(null);
  const [estado, setEstado] = React.useState<Record<string, boolean>>({});
  const informar = React.useCallback((id: string, aberto: boolean | null) => {
    setEstado((s) => {
      if (aberto === null) {
        if (!(id in s)) return s;
        const { [id]: _saiu, ...resto } = s;
        return resto;
      }
      return s[id] === aberto ? s : { ...s, [id]: aberto };
    });
  }, []);
  const valor = React.useMemo(() => ({ comando, informar }), [comando, informar]);
  const ids = Object.keys(estado);
  const todasAbertas = ids.length > 0 && ids.every((k) => estado[k]);
  return (
    <GrupoCtx.Provider value={valor}>
      <div className={className}>
        {ids.length > 1 && (
          <div className="mb-1.5 flex justify-end">
            <button
              type="button"
              onClick={() => setComando((c) => ({ abrir: !todasAbertas, n: (c?.n ?? 0) + 1 }))}
              className="text-xs font-semibold text-primary hover:underline"
            >
              {todasAbertas ? "Recolher todas" : "Abrir todas"}
            </button>
          </div>
        )}
        {children}
      </div>
    </GrupoCtx.Provider>
  );
}

const BORDA_DO_TOM = {
  analysis: "border-analysis",
  primary: "border-primary",
  warning: "border-warning",
  danger: "border-danger",
} as const;

export function ItemRecolhivel({
  titulo,
  tom = "analysis",
  children,
}: {
  titulo: React.ReactNode;
  tom?: keyof typeof BORDA_DO_TOM;
  /** o texto do item: fechado, só a primeira linha aparece */
  children: React.ReactNode;
}) {
  const id = React.useId();
  const grupo = React.useContext(GrupoCtx);
  const [aberto, setAberto] = React.useState(false);
  const comando = grupo?.comando;
  React.useEffect(() => {
    if (comando) setAberto(comando.abrir);
  }, [comando]);
  const informar = grupo?.informar;
  React.useEffect(() => {
    informar?.(id, aberto);
  }, [informar, id, aberto]);
  React.useEffect(() => () => informar?.(id, null), [informar, id]);
  return (
    <li className={cn("border-l-2", BORDA_DO_TOM[tom])}>
      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        aria-expanded={aberto}
        aria-controls={`${id}-corpo`}
        className="flex w-full items-start gap-2 py-1 pl-3 pr-1 text-left transition-colors hover:bg-surface-soft"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-ink">{titulo}</span>
          {/* Fechado, a primeira linha do texto segue à vista como prévia, igual ao título da
              referência na Ciência. Aberto, o texto inteiro. O leitor de tela lê tudo nos dois. */}
          <span id={`${id}-corpo`} className={cn("block text-sm text-ink-2", !aberto && "line-clamp-1")}>
            {children}
          </span>
        </span>
        <ChevronDown
          className={cn("mt-0.5 h-4 w-4 shrink-0 text-ink-2 transition-transform", aberto && "rotate-180")}
          aria-hidden
        />
      </button>
    </li>
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
