/**
 * Imagens das abas "Erros comuns" e "Variações".
 * Erros: boneco cinza 3D na posição do exercício com o ERRO postural exagerado e a
 * região que sofre destacada em vermelho (img2img do mesmo boneco do mapa muscular,
 * verificado um a um). Quadrado; exibido com object-contain para mostrar a figura inteira.
 * Variações: usa a foto de execução como "Movimento base" (fallback em MovementLabDetail).
 * Quando o slug não está na lista, a aba mostra só o texto (nada quebra).
 *
 * Arquivos em public/exercises/erros/<slug>.webp
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
const SLUGS_COM_VARIACAO_IMG: string[] = [];

export function getErroImagem(slug?: string): string | undefined {
  return slug && SLUGS_COM_ERRO_IMG.includes(slug) ? `/exercises/erros/${slug}.webp` : undefined;
}

export function getVariacaoImagem(slug?: string): string | undefined {
  return slug && SLUGS_COM_VARIACAO_IMG.includes(slug) ? `/exercises/variacoes/${slug}.webp` : undefined;
}
