/**
 * Imagens das abas "Erros comuns" e "Variações".
 * Erros: boneco cinza 3D na posição do exercício com o ERRO postural exagerado e a
 * região que sofre destacada em vermelho (img2img do mesmo boneco do mapa muscular,
 * verificado um a um). Quadrado; exibido com object-contain para mostrar a figura inteira.
 * Variações: UMA foto por variação (public/exercises/variacoes/<slug>-<i>.webp,
 * na ordem do array `variacoes` do exercício, começando em 0), geradas no mesmo
 * estilo das fotos de execução. Quando o exercício não tem fotos de variação, a
 * aba cai no fallback (foto de execução como "Movimento base"), sem quebrar.
 *
 * Arquivos em public/exercises/erros/<slug>.webp e public/exercises/variacoes/<slug>-<i>.webp
 */
const SLUGS_COM_ERRO_IMG: string[] = [
  "agachamento-livre",
  "levantamento-terra-romeno",
  "supino-reto-barra",
  "afundo-passada",
  "desenvolvimento-ombros",
  "hip-thrust",
  "cadeira-extensora",
  "mesa-flexora",
  "puxada-alta",
  "remada-baixa",
  "rosca-direta",
  "sentar-levantar",
  "ponte-gluteos",
  "prancha-frontal",
  "remada-elastica",
  "panturrilha-em-pe",
  "caminhada-esteira",
  "bicicleta-ergometrica",
  "eliptico",
  "marcha-aquatica",
  "leg-press-45",
  "triceps-polia",
  "dead-bug",
];
/**
 * Quantas fotos de variação existem por exercício (uma por item de `variacoes`,
 * na ordem do array, de 0 a N-1). Só listar aqui quando os arquivos existirem em
 * public/exercises/variacoes/<slug>-<i>.webp.
 */
const VARIACAO_IMG_COUNT: Record<string, number> = {
  "agachamento-livre": 3,
};

export function getErroImagem(slug?: string): string | undefined {
  return slug && SLUGS_COM_ERRO_IMG.includes(slug) ? `/exercises/erros/${slug}.webp` : undefined;
}

/** true quando o exercício tem fotos por variação (mostra o mosaico em vez do fallback). */
export function temVariacaoImagens(slug?: string): boolean {
  return Boolean(slug && VARIACAO_IMG_COUNT[slug] > 0);
}

/** Foto da i-ésima variação (na ordem do array `variacoes`), se existir. */
export function getVariacaoImagemPorIndice(slug: string | undefined, i: number): string | undefined {
  if (!slug) return undefined;
  return i < (VARIACAO_IMG_COUNT[slug] ?? 0) ? `/exercises/variacoes/${slug}-${i}.webp` : undefined;
}
