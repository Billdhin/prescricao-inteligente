/**
 * Fotos das fases do movimento (poses humanas reais, geradas via Lovable como uma
 * SEQUÊNCIA consistente — mesma pessoa/câmera/cenário, só muda a posição). Uma foto por
 * fase, na ordem das `fases` do exercício. Quando um slug não tem fotos aqui, a Timeline
 * cai no esquema vetorial do músculo (FaseFigure sem `src`).
 *
 * Arquivos em public/fases/<slug>-<n>.webp (n = índice da fase + 1).
 */
export const fasePoses: Record<string, string[]> = {
  "agachamento-livre": [
    "/fases/agachamento-livre-1.webp",
    "/fases/agachamento-livre-2.webp",
    "/fases/agachamento-livre-3.webp",
  ],
  "leg-press-45": [
    "/fases/leg-press-45-1.webp",
    "/fases/leg-press-45-2.webp",
    "/fases/leg-press-45-3.webp",
  ],
  "cadeira-extensora": [
    "/fases/cadeira-extensora-1.webp",
    "/fases/cadeira-extensora-2.webp",
    "/fases/cadeira-extensora-3.webp",
  ],
  "mesa-flexora": [
    "/fases/mesa-flexora-1.webp",
    "/fases/mesa-flexora-2.webp",
    "/fases/mesa-flexora-3.webp",
  ],
};

export function getFasePose(slug: string, faseIndex: number): string | undefined {
  return fasePoses[slug]?.[faseIndex];
}
