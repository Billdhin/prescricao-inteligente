/**
 * Cobrança do aluno: camada de GESTÃO financeira, não um gateway.
 *
 * O app não movimenta dinheiro. O profissional registra a mensalidade e cola o
 * próprio meio de pagamento (PIX copia-e-cola ou um link de checkout dele). O
 * aluno vê o valor, o vencimento e o botão para pagar por ESSE meio; quem
 * confirma o recebimento e marca "pago" é o profissional. Assim ninguém precisa
 * confiar dados financeiros ao nosso app, e o fluxo continua honesto.
 */

export type StatusCobranca = "pendente" | "pago" | "isento";

export interface CobrancaAluno {
  /** valor da mensalidade em centavos (evita erro de ponto flutuante) */
  valorCentavos: number;
  /** dia do vencimento no mês (1 a 28, para caber em todo mês) */
  diaVencimento: number;
  /** PIX copia-e-cola ou URL de checkout que o PRÓPRIO profissional cola */
  linkPagamento?: string;
  /** status do ciclo atual, controlado pelo profissional */
  statusAtual: StatusCobranca;
  /** competência do status atual, no formato "AAAA-MM" */
  competencia?: string;
  /** quando foi marcado como pago (se pago) */
  pagoEm?: number;
}

export const ROTULO_STATUS_COBRANCA: Record<StatusCobranca, string> = {
  pendente: "Pendente",
  pago: "Pago",
  isento: "Isento",
};

/** Competência (mês) de referência para um instante. */
export function competenciaDe(ts: number): string {
  const d = new Date(ts);
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  return `${d.getFullYear()}-${mes}`;
}

/** Formata centavos como moeda brasileira. */
export function formatBRL(centavos: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(centavos / 100);
}

/** Converte um texto digitado ("120", "120,50", "R$ 120") em centavos. */
export function paraCentavos(texto: string): number {
  const limpo = texto.replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  const n = parseFloat(limpo);
  if (!isFinite(n) || n < 0) return 0;
  return Math.round(n * 100);
}

/**
 * Resolve o status "efetivo" na competência atual. Se o status guardado é de uma
 * competência antiga (o mês virou), a mensalidade volta a "pendente" para o novo
 * ciclo, sem apagar o registro do profissional.
 */
export function statusEfetivo(c: CobrancaAluno, agora: number = Date.now()): StatusCobranca {
  if (c.statusAtual === "isento") return "isento";
  const atual = competenciaDe(agora);
  if (c.competencia && c.competencia !== atual && c.statusAtual === "pago") return "pendente";
  return c.statusAtual;
}
