/**
 * Fotos das fases do movimento (poses humanas reais, geradas via Lovable img2img a partir
 * da foto de EXECUÇÃO de cada exercício — mesma pessoa/câmera/cenário, só muda a posição).
 * 3 fotos por exercício, na ordem das `fases` do seed. Quando um slug não está na lista,
 * a Timeline cai no esquema vetorial do músculo (FaseFigure sem `src`).
 *
 * Arquivos em public/fases/<slug>-<n>.webp (n = índice da fase + 1, 1..3).
 * Para adicionar um exercício: gere as 3 webp e inclua o slug em SLUGS_COM_FASES.
 */
const SLUGS_COM_FASES = [
  "agachamento-livre",
  "leg-press-45",
  "cadeira-extensora",
  "mesa-flexora",
  "supino-reto-barra",
  "levantamento-terra-romeno",
  "hip-thrust",
  "afundo-passada",
  "puxada-alta",
  "remada-baixa",
  "desenvolvimento-ombros",
  "rosca-direta",
  "triceps-polia",
  "caminhada-esteira",
  "bicicleta-ergometrica",
  "eliptico",
  "sentar-levantar",
];

export const fasePoses: Record<string, string[]> = Object.fromEntries(
  SLUGS_COM_FASES.map((s) => [s, [1, 2, 3].map((n) => `/fases/${s}-${n}.webp`)]),
);

export function getFasePose(slug: string, faseIndex: number): string | undefined {
  return fasePoses[slug]?.[faseIndex];
}
