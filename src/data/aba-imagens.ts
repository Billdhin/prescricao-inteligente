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
  "remada-invertida": [1, 2],
  "triceps-frances-halter": [0, 1, 2],
  "elevacao-lateral-halteres": [0, 1, 2],
  "remada-curvada-halteres": [0, 1, 2],
  // máquinas e demais: índices ausentes (ex.: cadência/excêntrica) caem na foto do
  // movimento base — só entram fotos de poses visualmente distintas.
  "cadeira-extensora": [0],
  "mesa-flexora": [0],
  "supino-maquina": [0, 1, 2],
  "desenvolvimento-maquina": [0, 1, 2],
  "remada-maquina": [0, 1, 2],
  "desenvolvimento-elastico": [0, 1, 2],
  "empurra-puxa-aquatico": [0, 1, 2],
};

/**
 * Índices de erro (na ordem do array `errosComuns` do exercício) que já têm imagem
 * DEDICADA em public/exercises/erros/<slug>-<i>.webp.
 *
 * Por que existe: até aqui havia UMA imagem por exercício (`erros/<slug>.webp`)
 * servindo para os 2 a 4 erros daquele exercício. Uma figura não consegue mostrar
 * "joelho valgo" e "lombar em flexão" ao mesmo tempo, então ela não remetia a erro
 * nenhum. As variações acertaram justamente por terem uma foto por variação; os
 * erros seguem agora o mesmo padrão. Enquanto o índice não estiver aqui, a aba
 * mostra o texto do erro sem imagem, em vez de uma figura que não corresponde.
 */
const ERRO_IMGS: Record<string, number[]> = {
  "leg-press-45": [0, 1, 2],
  "agachamento-livre": [0, 1, 2],
  "supino-reto-barra": [0, 1, 2],
  "cadeira-extensora": [0, 1],
  "mesa-flexora": [0, 1],
  "levantamento-terra-romeno": [0, 1],
  "hip-thrust": [0, 1],
  "afundo-passada": [0, 1, 2],
  "puxada-alta": [0, 1, 2],
  "remada-baixa": [0, 1, 2],
  "desenvolvimento-ombros": [0, 1],
  "rosca-direta": [0, 1],
  "triceps-polia": [0, 1],
  "caminhada-esteira": [0, 1, 2],
  "bicicleta-ergometrica": [0, 1, 2],
  "eliptico": [0, 1, 2],
  "marcha-aquatica": [0, 1, 2],
  "sentar-levantar": [0, 1, 2],
  "ponte-gluteos": [0, 1, 2],
  "prancha-frontal": [0, 1, 2],
  "dead-bug": [0, 1, 2],
  "remada-elastica": [0, 1, 2],
  "panturrilha-em-pe": [0, 1, 2],
};

/** Imagem dedicada do i-ésimo erro comum, se existir. */
export function getErroImagemPorIndice(slug: string | undefined, i: number): string | undefined {
  if (!slug) return undefined;
  return ERRO_IMGS[slug]?.includes(i) ? `/exercises/erros/${slug}-${i}.webp` : undefined;
}

/** true quando o exercício tem ao menos uma imagem de erro dedicada. */
export function temErroImagens(slug?: string): boolean {
  return Boolean(slug && ERRO_IMGS[slug]?.length);
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
