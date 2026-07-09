/**
 * Imagens das abas "Erros comuns" e "Variações" (geradas via img2img da foto de execução:
 * a MESMA pessoa fazendo o movimento ERRADO / a variação — verificadas uma a uma).
 * Exibidas como miniaturas compactas ao lado da lista. Quando o slug não está na lista,
 * a aba mostra só o texto (nada quebra).
 *
 * Arquivos em public/exercises/erros/<slug>.webp e public/exercises/variacoes/<slug>.webp
 */
const SLUGS_COM_ERRO_IMG: string[] = [];
const SLUGS_COM_VARIACAO_IMG: string[] = [];

export function getErroImagem(slug?: string): string | undefined {
  return slug && SLUGS_COM_ERRO_IMG.includes(slug) ? `/exercises/erros/${slug}.webp` : undefined;
}

export function getVariacaoImagem(slug?: string): string | undefined {
  return slug && SLUGS_COM_VARIACAO_IMG.includes(slug) ? `/exercises/variacoes/${slug}.webp` : undefined;
}
