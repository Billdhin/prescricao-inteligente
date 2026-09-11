import * as React from "react";
import { X } from "lucide-react";
import { Card, Pill, buttonClasses } from "@/components/ui/primitives";
import { linkWhatsApp } from "@/lib/retencao";
import { cn } from "@/lib/utils";
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
import { soNumero } from "@/lib/numeroDigitado";

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

  // Cobrar pelo WhatsApp só existe com telefone: sem número, o wa.me abre uma conversa em
  // branco, e o botão prometeria um contato que não sabe com quem é.
  const primeiro = aluno.nome.split(" ")[0];
  const whatsapp =
    efetivo === "pendente"
      ? linkWhatsApp(
          aluno.telefone,
          `Oi, ${primeiro}! Passando para lembrar da mensalidade de ${formatBRL(c!.valorCentavos)}, que vence no dia ${c!.diaVencimento}.` +
            (c!.linkPagamento ? ` Você pode pagar por aqui: ${c!.linkPagamento}` : ""),
        )
      : null;
  const fmtDiaMes = (ts: number) => new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(ts));

  /*
   * O cartão "Mensalidade" do protótipo: o valor grande, o selo do mês com o vencimento e as
   * ações lado a lado. Nada do que o protótipo mostra sem dado entra aqui: o produto não
   * manda lembrete automático e não guarda histórico mês a mês (só o status do mês corrente
   * e a data do último recebimento), então não há "lembrete no dia 8" nem lista de meses.
   */
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <h2 className="font-display text-[17px] font-bold text-ink">Mensalidade</h2>
        <Pill tone={TONE[efetivo]} className="px-[9px] py-1 text-[11.5px] font-bold">
          {ROTULO_STATUS_COBRANCA[efetivo]}
          {efetivo !== "isento" ? ` · vence dia ${c!.diaVencimento}` : ""}
        </Pill>
      </div>

      <div className="mt-3.5 flex flex-wrap items-end gap-x-4 gap-y-1.5">
        <p className="tabular font-display text-4xl font-bold leading-none tracking-[-0.03em] text-ink">
          {formatBRL(c!.valorCentavos)}
          <span className="font-sans text-sm font-medium tracking-normal text-ink-3">/mês</span>
        </p>
        {c!.linkPagamento && (
          <p className="min-w-0 max-w-full truncate text-[12.5px] text-ink-2">
            Meio de pagamento: <span className="font-semibold text-ink">{c!.linkPagamento}</span>
          </p>
        )}
      </div>
      {c!.pagoEm && (
        <p className="mt-2 text-[12.5px] text-ink-2">
          Último recebimento: <span className="tabular font-semibold text-ink">{fmtDiaMes(c!.pagoEm)}</span>
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {efetivo !== "pago" ? (
          <button onClick={() => marcar("pago")} className={cn(buttonClasses("primary", "sm"), BOTAO)}>
            Marcar como pago
          </button>
        ) : (
          <button onClick={() => marcar("pendente")} className={cn(buttonClasses("secondary", "sm"), BOTAO)}>
            Marcar pendente
          </button>
        )}
        {whatsapp && (
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={cn(buttonClasses("secondary", "sm"), BOTAO)}>
            Cobrar pelo WhatsApp
          </a>
        )}
        <button onClick={() => setEditando(true)} className={cn(buttonClasses("secondary", "sm"), BOTAO)}>
          Editar valor
        </button>
        {efetivo !== "isento" && (
          <button onClick={() => marcar("isento")} className={cn(buttonClasses("ghost", "sm"), BOTAO)}>
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

/** Os botões do cartão, na medida do protótipo: 38 px e 13 px. */
const BOTAO = "h-[38px] px-3.5 text-[13px]";

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
        <h2 className="font-display text-[17px] font-bold text-ink">Mensalidade</h2>
        {onCancel && (
          <button onClick={onCancel} aria-label="Cancelar" className="rounded-full p-2 text-ink-3 hover:bg-surface-soft">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-ink">Mensalidade (R$)</span>
            <input value={valor} onChange={(e) => setValor(soNumero(e.target.value))} inputMode="decimal" placeholder="Ex.: 150,00" className="input" />
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
