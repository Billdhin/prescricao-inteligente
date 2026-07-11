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
 * Índices de variação (na ordem do array `variacoes` do exercício) que têm foto
 * DEDICADA em public/exercises/variacoes/<slug>-<i>.webp. Variações puramente de
 * cadência/tensão (sem pose distinta) ficam de fora e caem na foto do movimento
 * base, sem gerar imagem quase idêntica.
 */
const VARIACAO_IMGS: Record<string, number[]> = {
  "agachamento-livre": [0, 1, 2],
  "levantamento-terra-romeno": [0, 1, 2],
  "hip-thrust": [0, 1, 2],
  "afundo-passada": [0, 1, 2],
  // variações com foto DEDICADA; índices ausentes caem na foto do movimento base
  // (nuances de pegada quase idênticas ficam de fora, em vez de foto errada).
  "puxada-alta": [1, 2],
  "remada-baixa": [2],
  "desenvolvimento-ombros": [0, 1],
  "rosca-direta": [0, 1, 2],
  "triceps-polia": [0, 1, 2],
  "leg-press-45": [0, 1, 2],
  "supino-reto-barra": [0],
  "supino-halteres": [0, 1, 2],
  "flexao-de-braco": [1, 2],
  "prancha-frontal": [0, 1],
  "mergulho-no-banco": [0, 1, 2],
  "sentar-levantar": [0, 1],
  "caminhada-esteira": [0, 1, 2],
  "bicicleta-ergometrica": [0, 1, 2],
  "eliptico": [0, 1, 2],
  "marcha-aquatica": [1, 2],
  "ponte-gluteos": [0, 1, 2],
  "dead-bug": [0, 1, 2],
  "remada-elastica": [0, 1, 2],
  "panturrilha-em-pe": [0, 1, 2],
};

export function getErroImagem(slug?: string): string | undefined {
  return slug && SLUGS_COM_ERRO_IMG.includes(slug) ? `/exercises/erros/${slug}.webp` : undefined;
}

/** true quando o exercício tem ao menos uma foto de variação dedicada. */
export function temVariacaoImagens(slug?: string): boolean {
  return Boolean(slug && VARIACAO_IMGS[slug]?.length);
}

/** Foto dedicada da i-ésima variação, se existir (senão o chamador usa o movimento base). */
export function getVariacaoImagemPorIndice(slug: string | undefined, i: number): string | undefined {
  if (!slug) return undefined;
  return VARIACAO_IMGS[slug]?.includes(i) ? `/exercises/variacoes/${slug}-${i}.webp` : undefined;
}
