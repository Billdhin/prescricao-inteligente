/**
 * Mapas musculares por exercício — imagem já GERADA com os músculos marcados (Lovable
 * img2img sobre a figura cinza), com a intensidade por tom de azul. Cada uma verificada
 * cientificamente. Quando um slug não está aqui, o componente mostra a figura cinza neutra.
 * Arquivos em public/anatomy/mm/<slug>-{front,back}.webp
 */
export const muscleMapImages: Record<string, { front: string; back: string }> = {
  "leg-press-45": { front: "/anatomy/mm/leg-press-45-front.webp", back: "/anatomy/mm/leg-press-45-back.webp" },
};

export function getMuscleMapImages(slug?: string) {
  return slug ? muscleMapImages[slug] : undefined;
}
