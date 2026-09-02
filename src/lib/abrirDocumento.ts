/**
 * Abre um documento HTML gerado pelo produto (plano, prontuário, evolução, fichas, semáforo)
 * numa aba nova, de um jeito que funciona no celular.
 *
 * Os sete geradores faziam `window.open("", "_blank")` seguido de `document.write`. No
 * desktop funciona; no celular do ALUNO, que desde 01/09/2026 baixa o próprio documento de
 * evolução, o Safari do iOS abre a aba vazia e recusa o `document.write` de outra origem, e
 * bloqueadores de pop-up derrubam a janela em branco antes de ela ter conteúdo. O caminho
 * robusto é dar ao navegador uma URL DE VERDADE: o HTML vira um Blob, a aba abre já com o
 * conteúdo, e se a aba for bloqueada o documento abre na própria aba (o botão voltar do
 * navegador devolve o app). Nenhum `alert` pedindo para liberar pop-up.
 *
 * O objeto do Blob é revogado depois de um minuto: tempo de sobra para a aba carregar, e
 * curto o bastante para não acumular memória em quem exporta dez documentos seguidos.
 */
export function abrirDocumento(html: string): void {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const aba = window.open(url, "_blank");
  if (!aba) window.location.assign(url);
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
