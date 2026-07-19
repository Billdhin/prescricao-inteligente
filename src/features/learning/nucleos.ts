/**
 * Parser dos "núcleos mecanísticos" do manual de Fisiologia.
 *
 * No manual (Ribeiro, 2026) cada núcleo tem uma estrutura FIXA: descrição, quatro
 * passos (a "Sequência"), uma relação/fórmula, "Aplicação ao exercício", "Como medir"
 * e "Erro frequente". Na digitalização isso virou um parágrafo corrido por núcleo,
 * com marcadores consistentes. Este parser separa esse parágrafo de volta nas seis
 * partes, para o app mostrar cada núcleo como uma prancha de atlas (esquema + tabela)
 * em vez de texto corrido. NÃO inventa nada: só reorganiza o que já está escrito e
 * já é referenciado. Quando o texto não segue o padrão, devolve null e o app cai no
 * formato antigo (acordeão), sem quebrar.
 */

export type NucleoParsed = {
  descricao: string;
  passos: string[];
  relacao: string;
  aplicacao: string;
  comoMedir: string;
  erroFrequente: string;
};

const MARCADORES = {
  seq: "Sequência:",
  rel: "Relação:",
  apl: "Aplicação ao exercício:",
  med: "Como medir:",
  err: "Erro frequente:",
} as const;

/** Remove pontuação solta no começo/fim de um trecho, sem mexer no miolo. */
function limpar(s: string): string {
  return s.trim().replace(/^[.;,\s]+/, "").replace(/[;,\s]+$/, "").trim();
}

export function parseNucleo(detail: string): NucleoParsed | null {
  if (!detail) return null;
  const iSeq = detail.indexOf(MARCADORES.seq);
  const iRel = detail.indexOf(MARCADORES.rel);
  const iApl = detail.indexOf(MARCADORES.apl);
  const iMed = detail.indexOf(MARCADORES.med);
  const iErr = detail.indexOf(MARCADORES.err);
  // Todos os marcadores presentes e na ordem do manual.
  if (iSeq < 0 || iRel < 0 || iApl < 0 || iMed < 0 || iErr < 0) return null;
  if (!(iSeq < iRel && iRel < iApl && iApl < iMed && iMed < iErr)) return null;

  const descricao = limpar(detail.slice(0, iSeq));
  const seqRaw = detail.slice(iSeq + MARCADORES.seq.length, iRel);
  const relacao = limpar(detail.slice(iRel + MARCADORES.rel.length, iApl));
  const aplicacao = limpar(detail.slice(iApl + MARCADORES.apl.length, iMed));
  const comoMedir = limpar(detail.slice(iMed + MARCADORES.med.length, iErr));
  const erroFrequente = limpar(detail.slice(iErr + MARCADORES.err.length));

  const passos = seqRaw
    .split(/\(\d+\)\s*/)
    .map((p) => limpar(p))
    .filter(Boolean);

  // Uma prancha de atlas honesta precisa das seis partes e de passos de verdade.
  if (!descricao || !relacao || !aplicacao || !comoMedir || !erroFrequente) return null;
  if (passos.length < 2) return null;

  return { descricao, passos, relacao, aplicacao, comoMedir, erroFrequente };
}

/** true quando TODO passo do bloco segue o padrão do manual (vira prancha de atlas). */
export function ehBlocoDeNucleos(steps: { detail: string }[]): boolean {
  return steps.length > 0 && steps.every((s) => parseNucleo(s.detail) !== null);
}
