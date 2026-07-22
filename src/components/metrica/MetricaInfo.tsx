import * as React from "react";
import { HelpCircle, X } from "lucide-react";
import { getMetrica, faixaDe, type DefinicaoMetrica } from "@/data/metricasGlossario";
import { bibliografia } from "@/data/referencias";
import { useDialog } from "@/lib/useDialog";
import { cn } from "@/lib/utils";

/**
 * Rótulo de métrica que explica a si mesmo.
 *
 * O número sozinho não defende ninguém: "Complexidade técnica 12" não diz nada
 * até saber que a escala é comparativa entre os exercícios da base e que 12 cai
 * na faixa "Simples: aprende na primeira sessão". Quem clica no rótulo recebe
 * o que é, qual a escala, relativo a quê, e o que o valor quer dizer na prática.
 */
export function MetricaInfo({
  nome,
  valor,
  className,
}: {
  /** rótulo exibido, ex.: "Demanda lombar" */
  nome: string;
  /** valor atual, para destacar a faixa em que ele cai */
  valor?: number;
  className?: string;
}) {
  const [aberto, setAberto] = React.useState(false);
  const def = getMetrica(nome);
  if (!def) return <span className={className}>{nome}</span>;

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className={cn(
          "inline-flex items-center gap-1 rounded text-left underline decoration-dotted decoration-[#5b6472]/60 underline-offset-2 transition-colors hover:text-ink hover:decoration-ink-2",
          className,
        )}
        aria-label={`${nome}: o que este número significa`}
      >
        {nome}
        {/* opacity em vez de cor fixa: o mesmo rótulo aparece sobre card claro e
            sobre a imagem escura do slider, e precisa funcionar nos dois */}
        <HelpCircle aria-hidden className="h-3.5 w-3.5 shrink-0 opacity-60" />
      </button>
      {aberto && <MetricaDialog def={def} valor={valor} onClose={() => setAberto(false)} />}
    </>
  );
}

function MetricaDialog({
  def,
  valor,
  onClose,
}: {
  def: DefinicaoMetrica;
  valor?: number;
  onClose: () => void;
}) {
  const ref = useDialog<HTMLDivElement>(onClose);
  const faixaAtual = valor !== undefined ? faixaDe(def, valor) : undefined;
  const melhorTxt =
    def.melhor === "maior" ? "Maior é melhor." : def.melhor === "menor" ? "Menor é melhor." : "Depende do objetivo.";

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={def.nome}
        className="w-full max-w-md rounded-card bg-surface p-5 shadow-elevated outline-none md:p-6"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-ink">{def.nome}</h2>
            {valor !== undefined && (
              <p className="tabular text-sm font-semibold text-primary">
                Valor atual: {valor}/100
                {faixaAtual ? ` · ${faixaAtual.rotulo}` : ""}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="shrink-0 rounded-md p-2.5 text-ink-3 hover:bg-surface-soft"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-ink-3">O que é</dt>
            <dd className="text-ink-2">{def.oQueE}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-ink-3">Escala</dt>
            <dd className="text-ink-2">
              {def.escala} {melhorTxt}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-ink-3">Relativo a quê</dt>
            <dd className="text-ink-2">{def.referencial}</dd>
          </div>
        </dl>

        <div className="mt-4">
          <div className="mb-1.5 text-xs font-bold uppercase tracking-wider text-ink-3">
            O que o número quer dizer na prática
          </div>
          <ul className="space-y-1.5">
            {def.faixas.map((f, i) => {
              const de = i === 0 ? 0 : def.faixas[i - 1].ate + 1;
              const ativa = faixaAtual === f;
              return (
                <li
                  key={f.rotulo}
                  className={cn(
                    "rounded-lg border p-2.5 text-xs",
                    ativa ? "border-primary bg-primary-tint" : "border-border",
                  )}
                >
                  <span className={cn("tabular font-bold", ativa ? "text-primary" : "text-ink")}>
                    {de} a {f.ate}, {f.rotulo}.
                  </span>{" "}
                  <span className="text-ink-2">{f.significado}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {def.refs?.length ? (
          <div className="mt-4 border-t border-border pt-3">
            <div className="mb-1.5 text-xs font-bold uppercase tracking-wider text-ink-3">Base científica</div>
            <ol className="list-decimal space-y-1 pl-4 text-[11px] leading-snug text-ink-3">
              {bibliografia(def.refs).map((b) => (
                <li key={b.ref.id}>
                  {/* autores como "... et al." já terminam em ponto; não dobrar */}
                  {b.ref.autores}
                  {b.ref.autores.endsWith(".") ? "" : "."} {b.ref.titulo}. {b.ref.fonte}, {b.ref.ano}.
                  {b.ref.doi && (
                    <>
                      {" "}
                      <a
                        href={`https://doi.org/${b.ref.doi}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline"
                      >
                        doi:{b.ref.doi}
                      </a>
                    </>
                  )}
                </li>
              ))}
            </ol>
          </div>
        ) : null}
        <p className="mt-3 border-t border-border pt-3 text-[11px] text-ink-3">
          Valor estimado para comparar exercícios entre si. Não é medição do seu aluno; a leitura
          final é sua.
        </p>
      </div>
    </div>
  );
}
