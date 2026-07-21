import * as React from "react";
import { Wallet, Check, Pencil, X } from "lucide-react";
import { Card, Pill, buttonClasses } from "@/components/ui/primitives";
import type { Aluno } from "@/data/alunos";
import {
  type CobrancaAluno,
  type StatusCobranca,
  ROTULO_STATUS_COBRANCA,
  formatBRL,
  paraCentavos,
  competenciaDe,
  statusEfetivo,
} from "@/data/cobranca";

const TONE: Record<StatusCobranca, "success" | "warning" | "neutral"> = {
  pago: "success",
  pendente: "warning",
  isento: "neutral",
};

/**
 * Financeiro do aluno (lado do profissional): registra a mensalidade, o meio de
 * pagamento do próprio profissional e marca o recebimento. O app não movimenta
 * dinheiro; é controle. O aluno vê o valor e o status no portal dele.
 */
export function FinanceiroCard({
  aluno,
  onUpdate,
}: {
  aluno: Aluno;
  onUpdate: (patch: Partial<Aluno>) => void;
}) {
  const c = aluno.cobranca;
  const [editando, setEditando] = React.useState(!c);

  if (editando) {
    return <FinanceiroForm inicial={c} onCancel={c ? () => setEditando(false) : undefined} onSave={(nova) => { onUpdate({ cobranca: nova }); setEditando(false); }} />;
  }

  const efetivo = statusEfetivo(c!);
  const marcar = (status: StatusCobranca) =>
    onUpdate({
      cobranca: {
        ...c!,
        statusAtual: status,
        competencia: competenciaDe(Date.now()),
        pagoEm: status === "pago" ? Date.now() : undefined,
      },
    });

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary-tint text-primary">
            <Wallet className="h-5 w-5" />
          </span>
          <h2 className="font-display text-base font-bold text-ink">Financeiro</h2>
        </div>
        <button onClick={() => setEditando(true)} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
          <Pencil className="h-3.5 w-3.5" /> Editar
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <div>
          <div className="text-xs text-ink-3">Mensalidade</div>
          <div className="font-display text-xl font-bold text-ink">{formatBRL(c!.valorCentavos)}</div>
        </div>
        <div>
          <div className="text-xs text-ink-3">Vencimento</div>
          <div className="text-sm font-semibold text-ink">dia {c!.diaVencimento}</div>
        </div>
        <div>
          <div className="text-xs text-ink-3">Status do mês</div>
          <Pill tone={TONE[efetivo]}>{ROTULO_STATUS_COBRANCA[efetivo]}</Pill>
        </div>
      </div>

      {c!.linkPagamento && (
        <p className="mt-3 truncate text-xs text-ink-3">
          Meio de pagamento: <span className="text-ink-2">{c!.linkPagamento}</span>
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {efetivo !== "pago" ? (
          <button onClick={() => marcar("pago")} className={buttonClasses("primary", "sm")}>
            <Check className="h-4 w-4" /> Marcar como pago
          </button>
        ) : (
          <button onClick={() => marcar("pendente")} className={buttonClasses("secondary", "sm")}>
            Marcar pendente
          </button>
        )}
        {efetivo !== "isento" && (
          <button onClick={() => marcar("isento")} className={buttonClasses("ghost", "sm")}>
            Isentar
          </button>
        )}
      </div>
      <p className="mt-3 text-xs text-ink-3">
        O app registra o combinado. O pagamento acontece pelo seu meio (PIX ou link); você confirma o recebimento aqui.
      </p>
    </Card>
  );
}

function FinanceiroForm({
  inicial,
  onSave,
  onCancel,
}: {
  inicial?: CobrancaAluno;
  onSave: (c: CobrancaAluno) => void;
  onCancel?: () => void;
}) {
  const [valor, setValor] = React.useState(inicial ? String(inicial.valorCentavos / 100).replace(".", ",") : "");
  const [dia, setDia] = React.useState(inicial ? String(inicial.diaVencimento) : "5");
  const [link, setLink] = React.useState(inicial?.linkPagamento ?? "");

  const salvar = () => {
    const valorCentavos = paraCentavos(valor);
    if (valorCentavos <= 0) return;
    const diaNum = Math.min(28, Math.max(1, parseInt(dia, 10) || 5));
    onSave({
      valorCentavos,
      diaVencimento: diaNum,
      linkPagamento: link.trim() || undefined,
      statusAtual: inicial?.statusAtual ?? "pendente",
      competencia: inicial?.competencia ?? competenciaDe(Date.now()),
      pagoEm: inicial?.pagoEm,
    });
  };

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary-tint text-primary">
            <Wallet className="h-5 w-5" />
          </span>
          <h2 className="font-display text-base font-bold text-ink">Financeiro</h2>
        </div>
        {onCancel && (
          <button onClick={onCancel} aria-label="Cancelar" className="rounded-md p-2 text-ink-3 hover:bg-surface-soft">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-ink">Mensalidade (R$)</span>
            <input value={valor} onChange={(e) => setValor(e.target.value)} inputMode="decimal" placeholder="Ex.: 150,00" className="input" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-ink">Vence dia</span>
            <input value={dia} onChange={(e) => setDia(e.target.value.replace(/\D/g, "").slice(0, 2))} inputMode="numeric" placeholder="5" className="input" />
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-ink">PIX ou link de pagamento (opcional)</span>
          <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Chave PIX copia-e-cola ou URL do seu checkout" className="input" />
          <span className="mt-1 block text-xs text-ink-3">É o seu meio de recebimento. O aluno paga por ele; o app só mostra o botão.</span>
        </label>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        {onCancel && (
          <button onClick={onCancel} className={buttonClasses("secondary", "sm")}>
            Cancelar
          </button>
        )}
        <button onClick={salvar} className={buttonClasses("primary", "sm")}>
          Salvar mensalidade
        </button>
      </div>
    </Card>
  );
}
