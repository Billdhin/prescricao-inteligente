import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import {
  classificarNaEscala,
  getEscala,
  type EscalaAvaliacao,
  type FaixaEscala,
  type TomFaixa,
} from "@/data/escalasAvaliacao";
import type { Sexo } from "@/data/alunos";
import { bibliografia } from "@/data/referencias";
import { useDialog } from "@/lib/useDialog";
import { cn } from "@/lib/utils";

/**
 * "0,82 é bom, ruim ou muito ruim? Qual é a escala?"
 *
 * O número medido passa a vir com a FAIXA em que ele cai e um caminho para a
 * escala inteira: as faixas, o que a medida mede, o LIMITE dela e a fonte com
 * DOI. O estado nunca é só cor: a faixa vem escrita por extenso ao lado.
 *
 * Onde não existe escala ancorada em fonte verificada, este componente não
 * renderiza nada. Preferir o silêncio a um veredito inventado é a regra da casa.
 */

const TOM: Record<TomFaixa, string> = {
  bom: "border-success/30 bg-success-tint text-success",
  atencao: "border-warning/30 bg-warning-tint text-warning",
  alerta: "border-danger/30 bg-danger-tint text-danger",
};

export function FaixaDoValor({
  escalaId,
  valor,
  sexo,
  className,
}: {
  escalaId: string;
  valor?: number;
  sexo?: Sexo;
  className?: string;
}) {
  const [aberto, setAberto] = React.useState(false);
  const escala = getEscala(escalaId);
  if (!escala || valor == null || Number.isNaN(valor)) return null;
  const faixa = classificarNaEscala(escala, valor, sexo);
  if (!faixa) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className={cn(
          "mt-1 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-2xs font-semibold transition-colors hover:brightness-95",
          TOM[faixa.tom],
          className,
        )}
        aria-label={`${escala.nome}: ${valor} ${escala.unidade} cai na faixa ${faixa.rotulo}. Ver a escala completa.`}
      >
        {faixa.rotulo}
        <span className="opacity-70">ver escala</span>
      </button>
      {aberto && <EscalaDialog escala={escala} valor={valor} sexo={sexo} onClose={() => setAberto(false)} />}
    </>
  );
}

function EscalaDialog({
  escala,
  valor,
  sexo,
  onClose,
}: {
  escala: EscalaAvaliacao;
  valor: number;
  sexo?: Sexo;
  onClose: () => void;
}) {
  const ref = useDialog<HTMLDivElement>(onClose);
  const faixas =
    escala.faixas.geral ?? (sexo === "M" ? escala.faixas.masculino : escala.faixas.feminino) ?? [];
  const atual = classificarNaEscala(escala, valor, sexo);
  const refs = bibliografia(escala.refIds);

  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`Escala de ${escala.nome}`}
        className="max-h-modal w-full max-w-md overflow-auto rounded-card bg-surface p-5 shadow-overlay outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-bold text-ink">{escala.nome}</h2>
            <p className="tabular text-sm text-ink-2">
              Medido: <span className="font-semibold text-ink">{valor}</span> {escala.unidade}
            </p>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="rounded-full p-2.5 text-ink-3 hover:bg-surface-soft">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-sm text-ink-2">{escala.oQueMede}</p>

        <ul className="mt-3 overflow-hidden rounded-control border border-border">
          {faixas.map((f) => (
            <LinhaFaixa key={f.rotulo} faixa={f} unidade={escala.unidade} atual={f === atual} />
          ))}
        </ul>

        <div className="mt-3 rounded-control border border-border bg-surface-soft p-3">
          <p className="text-2xs font-semibold uppercase tracking-wide text-ink-3">O limite desta escala</p>
          <p className="mt-0.5 text-sm text-ink-2">{escala.limite}</p>
        </div>

        {refs.length > 0 && (
          <ul className="mt-3 space-y-0.5 border-t border-border pt-3">
            {refs.map(({ n, ref: r }) => (
              <li key={r.id} className="text-2xs text-ink-3">
                [{n}] {r.autores.split(",")[0]} ({r.ano}), {r.fonte}.{" "}
                {r.doi && (
                  <a
                    href={`https://doi.org/${r.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-primary hover:underline"
                  >
                    doi:{r.doi}
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>,
    document.body,
  );
}

function LinhaFaixa({ faixa, unidade, atual }: { faixa: FaixaEscala; unidade: string; atual: boolean }) {
  // Intervalo por extenso, sem Infinity na cara do usuário.
  const de = Number.isFinite(faixa.de) ? faixa.de : undefined;
  const ate = Number.isFinite(faixa.ate) ? faixa.ate : undefined;
  const intervalo =
    de == null ? `abaixo de ${ate} ${unidade}` : ate == null ? `${de} ${unidade} ou mais` : `${de} a ${ate} ${unidade}`;

  return (
    <li
      className={cn(
        "flex flex-wrap items-baseline gap-x-2 gap-y-0.5 border-b border-border px-3 py-2 last:border-b-0",
        atual && "bg-primary-tint",
      )}
    >
      <span className={cn("text-sm font-semibold", atual ? "text-ink" : "text-ink-2")}>{faixa.rotulo}</span>
      <span className="tabular text-xs text-ink-3">{intervalo}</span>
      {atual && (
        <span className="rounded-full bg-primary px-2 py-0.5 text-2xs font-bold text-on-primary">
          onde este aluno está
        </span>
      )}
      {faixa.conduta && <span className="basis-full text-xs text-ink-2">{faixa.conduta}</span>}
    </li>
  );
}
