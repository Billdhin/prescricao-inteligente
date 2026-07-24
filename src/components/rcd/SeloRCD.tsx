import * as React from "react";
import { ShieldCheck, HelpCircle, X } from "lucide-react";
import { useDialog } from "@/lib/useDialog";
import { cn } from "@/lib/utils";

/**
 * Selo do mecanismo proprietário — "Motor RCD · Raciocínio Clínico Documentado".
 * A marca da tecnologia central do produto (exigência do estágio 3 de mercado:
 * nomear e ser dono do mecanismo). Usado no Prescrever, no Prontuário, na
 * landing e nos casos documentados.
 *
 * Na FERRAMENTA (Semáforo, Treino do dia, Prescrever treino, Prontuário), passe
 * `explicavel` para o selo virar botão e abrir uma explicação curta em português
 * (o fundador não entendia a sigla solta). No MARKETING e nos PDFs ele continua
 * estático: o documento já se explica por extenso.
 */
export function SeloRCD({
  variante = "claro",
  compacto = false,
  explicavel = false,
  className,
}: {
  /** claro = sobre fundo claro; escuro = sobre fundo escuro/imagem */
  variante?: "claro" | "escuro";
  /** só "Motor RCD" (sem o nome por extenso) */
  compacto?: boolean;
  /** na ferramenta: vira botão que abre a explicação do mecanismo */
  explicavel?: boolean;
  className?: string;
}) {
  const [aberto, setAberto] = React.useState(false);

  const base = cn(
    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
    variante === "claro"
      ? "border-analysis/30 bg-analysis-tint text-analysis-text"
      : "border-cyan-400/30 bg-slate-950/60 text-cyan-300 backdrop-blur-sm",
    className,
  );

  const conteudo = (
    <>
      <ShieldCheck aria-hidden className="h-3.5 w-3.5" />
      <span className="font-bold tracking-wide">Motor RCD</span>
      {!compacto && (
        <span className={cn("font-medium", variante === "claro" ? "text-analysis/80" : "text-cyan-300/80")}>
          · Raciocínio Clínico Documentado
        </span>
      )}
      {explicavel && (
        <HelpCircle aria-hidden className="h-3.5 w-3.5 shrink-0 opacity-70" />
      )}
    </>
  );

  if (!explicavel) {
    return <span className={base}>{conteudo}</span>;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        aria-label="Motor RCD: o que este mecanismo faz"
        className={cn(
          base,
          "cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-analysis/50",
          variante === "claro" ? "hover:bg-analysis-tint/70" : "hover:bg-slate-900/70",
        )}
      >
        {conteudo}
      </button>
      {aberto && <SeloRcdDialog onClose={() => setAberto(false)} />}
    </>
  );
}

function SeloRcdDialog({ onClose }: { onClose: () => void }) {
  const ref = useDialog<HTMLDivElement>(onClose);

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
      // sem isso, clicar no overlay podia fechar/disparar o dialog pai (Prontuário
      // e Semáforo abrem sobre um overlay fixed z-50)
      onClick={(e) => e.stopPropagation()}
    >
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Motor RCD"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-card bg-surface p-5 shadow-elevated outline-none md:p-6"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck aria-hidden className="h-5 w-5 text-analysis" />
            <div>
              <h2 className="font-display text-lg font-bold text-ink">Motor RCD</h2>
              <p className="text-sm font-semibold text-analysis-text">Raciocínio Clínico Documentado</p>
            </div>
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
            <dd className="text-ink-2">
              O mecanismo que registra o porquê de cada decisão do seu atendimento: o semáforo antes
              da sessão, os exercícios escolhidos e os descartados com o motivo, e as referências
              numeradas.
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-ink-3">O que vira</dt>
            <dd className="text-ink-2">
              Um documento que apoia e registra a SUA decisão, pronto para você assinar.
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

/** Nome oficial do mecanismo — usar em copy para consistência. */
export const RCD_NOME = "Raciocínio Clínico Documentado";
export const RCD_SIGLA = "RCD";
export const RCD_VERSAO = "RCD v1";
