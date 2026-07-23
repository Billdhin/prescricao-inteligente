import * as React from "react";
import { Link } from "react-router-dom";
import { X, FileDown, Lock, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Pill, ChipRcd, buttonClasses } from "@/components/ui/primitives";
import type { ProntuarioSnapshot } from "@/data/alunos";
import { bibliografia } from "@/data/referencias";
import { getParam } from "@/data/monitoringParameters";
import { useDialog } from "@/lib/useDialog";
import { useUser } from "@/lib/store";
import { crefValido } from "@/lib/cref";
import { SeloRCD } from "./SeloRCD";
import { cn } from "@/lib/utils";

/**
 * Visualização in-app do Prontuário de Decisão Técnica: o rastro completo do
 * Motor RCD (escolhidos com o porquê, descartados com o porquê, semáforo,
 * cuidados do grupo e bibliografia). O PDF assinável é a versão exportada.
 */
export function ProntuarioView({
  prontuario,
  titulo,
  docId,
  onExportar,
  podeExportar,
  onClose,
}: {
  prontuario: ProntuarioSnapshot;
  titulo: string;
  docId?: string;
  onExportar?: () => void;
  podeExportar?: boolean;
  onClose: () => void;
}) {
  const dialogRef = useDialog<HTMLDivElement>(onClose);
  const biblio = bibliografia(prontuario.refIds);
  const { name: profNome, cref, empresa } = useUser();
  const crefOk = crefValido(cref);

  const SEM_ICON = {
    verde: <CheckCircle2 className="h-4 w-4 text-success" />,
    amarelo: <AlertTriangle className="h-4 w-4 text-warning" />,
    vermelho: <XCircle className="h-4 w-4 text-danger-fill" />,
  } as const;
  const SEM_TXT = {
    verde: "Liberado",
    amarelo: "Liberado com ajuste",
    vermelho: "Não liberado no dia",
  } as const;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`Prontuário de decisão: ${titulo}`}
        className="flex max-h-modal w-full max-w-2xl flex-col rounded-card bg-surface shadow-overlay outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-3 border-b border-border p-5 pb-3">
          <div className="min-w-0">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <SeloRCD compacto />
              {docId && <ChipRcd className="tabular">{docId}</ChipRcd>}
            </div>
            <h3 className="font-display text-lg font-bold text-ink">Prontuário de Decisão Técnica</h3>
            <p className="text-sm text-ink-2">{titulo}</p>
            {/* Assinatura do responsável: nome + CREF (a proposta central do documento). */}
            <p className="mt-1.5 text-sm text-ink">
              <span className="font-semibold">{profNome || "Profissional não identificado"}</span>
              {cref && (
                <span className={cn("ml-2", crefOk ? "text-ink-2" : "text-warning")}>CREF {cref}</span>
              )}
              {empresa && <span className="ml-2 text-ink-3">· {empresa}</span>}
            </p>
            {!cref && (
              <Link to="/account" className="text-xs font-semibold text-primary hover:underline">
                Adicione o seu CREF na Conta para assinar o documento →
              </Link>
            )}
            {cref && !crefOk && (
              <Link to="/account" className="text-xs font-semibold text-warning hover:underline">
                O CREF parece fora do formato (000000-G/UF). Ajuste na Conta →
              </Link>
            )}
          </div>
          <button onClick={onClose} aria-label="Fechar" className="rounded-md p-2.5 text-ink-3 hover:bg-surface-soft">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Corpo */}
        <div className="min-h-0 flex-1 space-y-5 overflow-auto p-5">
          {prontuario.semaforo && (
            <section>
              <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-analysis">Semáforo do dia</h4>
              <div className="flex flex-wrap items-center gap-2 text-sm text-ink">
                {SEM_ICON[prontuario.semaforo.resultado]}
                <span className="font-semibold">{SEM_TXT[prontuario.semaforo.resultado]}</span>
              </div>
              {prontuario.semaforo.ajustes.length > 0 && (
                <ul className="mt-1.5 space-y-1 text-sm text-ink-2">
                  {prontuario.semaforo.ajustes.map((a) => (
                    <li key={a} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                      {a}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {prontuario.cuidadosGrupo && (
            <section>
              <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-analysis">
                Cuidados do grupo considerados: {prontuario.cuidadosGrupo.nome}
              </h4>
              <ul className="space-y-1 text-sm text-ink-2">
                {prontuario.cuidadosGrupo.cuidados.map((c) => (
                  <li key={c} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-analysis" />
                    {c}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {prontuario.modalidades && prontuario.modalidades.length > 0 && (
            <section>
              <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-analysis">
                Base da semana: modalidades
              </h4>
              <ul className="space-y-1 text-sm text-ink-2">
                {prontuario.modalidades.map((m) => (
                  <li key={m.id}>
                    <span className="font-semibold text-ink">{m.nome}</span>: {m.motivo}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-analysis">
              Escolhidos: com o porquê de cada critério
            </h4>
            <div className="space-y-3">
              {prontuario.escolhidos.map((e, i) => (
                <div key={e.slug} className="rounded-xl border border-border p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="tabular grid h-6 w-6 place-items-center rounded-full bg-analysis text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="font-display font-bold text-ink">{e.nome}</span>
                    {e.series && <span className="text-xs text-ink-3">{e.series}</span>}
                    <span className="tabular ml-auto text-sm font-bold text-success">adequação {e.score}/100</span>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {e.breakdown.map((b) => (
                      <li key={b.criterio} className="flex gap-2 text-xs">
                        <span
                          className={cn(
                            "tabular w-16 shrink-0 text-right font-bold",
                            b.peso < 0 ? "text-[color:var(--cta-text)]" : "text-analysis",
                          )}
                        >
                          {b.peso > 0 ? "+" : ""}
                          {b.peso.toFixed(1)}
                        </span>
                        <span className="text-ink-2">
                          <span className="font-semibold text-ink">{b.criterio}:</span> {b.detalhe}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {e.cautions.length > 0 && (
                    <p className="mt-2 text-xs text-[color:var(--cta-text)]">{e.cautions.join(" · ")}</p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {prontuario.descartados.length > 0 && (
            <section>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-analysis">
                Considerados e descartados, e por quê
              </h4>
              <div className="overflow-hidden rounded-xl border border-border">
                {prontuario.descartados.map((d, i) => (
                  <div key={d.slug} className={cn("flex gap-3 px-3 py-2 text-sm", i % 2 === 0 && "bg-surface-soft")}>
                    <span className="w-40 shrink-0 font-semibold text-ink">{d.nome}</span>
                    <span className="tabular w-14 shrink-0 text-ink-3">{d.score}/100</span>
                    <span className="min-w-0 text-xs text-ink-2">{d.motivoPrincipal}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {prontuario.parametros.length > 0 && (
            <section>
              <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-analysis">
                Parâmetros de acompanhamento
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {prontuario.parametros.map((id) => {
                  const p = getParam(id);
                  return p ? (
                    <Pill key={id} tone="neutral">
                      {p.sigla ?? p.nome}
                    </Pill>
                  ) : null;
                })}
              </div>
            </section>
          )}

          {biblio.length > 0 && (
            <section>
              <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-analysis">Referências</h4>
              <ol className="list-decimal space-y-1 pl-5 text-xs text-ink-2">
                {biblio.map((b) => (
                  <li key={b.ref.id}>
                    {b.ref.autores}. {b.ref.titulo}. {b.ref.fonte}, {b.ref.ano}.
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
            </section>
          )}

          <p className="border-t border-border pt-3 text-xs text-ink-3">
            Registro de apoio à decisão ({prontuario.motorVersao}). O profissional habilitado é o
            responsável pela decisão; este documento existe para fundamentá-la e protegê-la.
          </p>
        </div>

        {/* Rodapé */}
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border p-4">
          {onExportar && (
            <button onClick={onExportar} className={buttonClasses("primary", "sm")}>
              <FileDown className="h-4 w-4" /> Exportar PDF assinável
            </button>
          )}
          <button onClick={onClose} className={buttonClasses("ghost", "sm")}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
