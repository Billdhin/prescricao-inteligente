/**
 * Validação leve do registro CREF. O formato usual é NNNNNN-G/UF
 * (número, categoria e UF), por exemplo "012345-G/SP". Aceita a categoria G
 * (graduado) ou P (provisionado) e as 27 UFs. Não consulta o Conselho: só
 * confere o formato, para o Prontuário não sair com uma "assinatura" malformada.
 */
const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

const CREF_RE = /^(\d{4,6})-([GP])\/([A-Z]{2})$/;

export function crefValido(cref: string): boolean {
  const m = cref.trim().toUpperCase().match(CREF_RE);
  if (!m) return false;
  return UFS.includes(m[3]);
}

/** Normaliza o que o usuário digita para o padrão NNNNNN-G/UF quando possível. */
export function normalizarCref(cref: string): string {
  return cref.trim().toUpperCase();
}
