/**
 * Regiões musculares INTERATIVAS sobre a imagem de análise (hover/tap → nome,
 * % de ativação e papel). Coordenadas em % (0–100) da caixa 4:3 da imagem,
 * autoradas à mão olhando cada imagem de análise — determinístico, sem IA.
 *
 * `musculo` DEVE bater com `ativacao[].musculo` do exercício (exercises.ts):
 * é de lá que vêm o percentual e o papel exibidos no tooltip.
 * Um músculo pode ter várias elipses (ex.: os dois braços/coxas destacam juntos).
 */

export interface RegionShape {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  /** rotação em graus (sentido horário) ao redor de (cx, cy) */
  rot?: number;
}

export interface MuscleRegion {
  musculo: string;
  shapes: RegionShape[];
}

export const muscleRegions: Record<string, MuscleRegion[]> = {
  /* ------------------------- Membros inferiores ------------------------- */

  // Reclinada; coxa sobe da pelve (≈46,64) ao joelho (≈58,43).
  "leg-press-45": [
    { musculo: "Quadríceps", shapes: [{ cx: 51, cy: 50, rx: 11, ry: 6, rot: -38 }] },
    { musculo: "Glúteo máximo", shapes: [{ cx: 46, cy: 66, rx: 6, ry: 5, rot: -15 }] },
    { musculo: "Posteriores de coxa", shapes: [{ cx: 55, cy: 58, rx: 8, ry: 4.5, rot: -32 }] },
    { musculo: "Adutores", shapes: [{ cx: 47, cy: 57, rx: 4, ry: 3.5, rot: -35 }] },
  ],

  // Agachamento profundo em 3/4; as duas coxas em vermelho.
  "agachamento-livre": [
    {
      musculo: "Quadríceps",
      shapes: [
        { cx: 40, cy: 66, rx: 7, ry: 5.5, rot: -15 },
        { cx: 59, cy: 62, rx: 7, ry: 5.5, rot: 10 },
      ],
    },
    { musculo: "Glúteo máximo", shapes: [{ cx: 66, cy: 60, rx: 5, ry: 4.5 }] },
    { musculo: "Eretores da espinha", shapes: [{ cx: 63, cy: 51, rx: 3.5, ry: 4 }] },
    { musculo: "Posteriores de coxa", shapes: [{ cx: 64, cy: 66, rx: 5, ry: 3.5, rot: 10 }] },
  ],

  // Sentada; pernas estendidas para a esquerda; joelho ≈(45,64).
  "cadeira-extensora": [
    { musculo: "Quadríceps", shapes: [{ cx: 55, cy: 62, rx: 12, ry: 5.5, rot: -8 }] },
    { musculo: "Reto femoral", shapes: [{ cx: 56, cy: 57, rx: 10, ry: 3, rot: -8 }] },
  ],

  // Prona; cabeça à esquerda, pernas flexionadas à direita.
  "mesa-flexora": [
    { musculo: "Isquiotibiais", shapes: [{ cx: 56, cy: 54, rx: 9, ry: 8, rot: -20 }] },
    { musculo: "Panturrilha", shapes: [{ cx: 72, cy: 44, rx: 5, ry: 6, rot: 30 }] },
  ],

  // Vista lateral em dobradiça; quadril ≈(61,37).
  "levantamento-terra-romeno": [
    { musculo: "Isquiotibiais", shapes: [{ cx: 58, cy: 51, rx: 5.5, ry: 11, rot: 8 }] },
    { musculo: "Glúteo máximo", shapes: [{ cx: 64, cy: 38, rx: 5.5, ry: 5 }] },
    { musculo: "Eretores da espinha", shapes: [{ cx: 55, cy: 27, rx: 8, ry: 3.5, rot: -25 }] },
  ],

  // Ponte no banco; cabeça à direita, joelhos à esquerda.
  "hip-thrust": [
    { musculo: "Glúteo máximo", shapes: [{ cx: 46, cy: 54, rx: 7, ry: 7 }] },
    { musculo: "Isquiotibiais", shapes: [{ cx: 36, cy: 52, rx: 8, ry: 4, rot: 8 }] },
    { musculo: "Quadríceps", shapes: [{ cx: 36, cy: 45, rx: 9, ry: 3.5, rot: 5 }] },
  ],

  // Afundo virado à esquerda; perna da frente à esquerda, joelho de trás no chão.
  "afundo-passada": [
    {
      musculo: "Quadríceps",
      shapes: [
        { cx: 35, cy: 61, rx: 10, ry: 4.5, rot: -5 },
        { cx: 51, cy: 70, rx: 4, ry: 9, rot: 5 },
      ],
    },
    { musculo: "Glúteo máximo", shapes: [{ cx: 47, cy: 60, rx: 5, ry: 5 }] },
    { musculo: "Estabilizadores do quadril", shapes: [{ cx: 45, cy: 55, rx: 4, ry: 3 }] },
  ],

  /* ------------------------ Empurrar (superiores) ----------------------- */

  // Deitado, cabeça à direita; peito em vermelho no centro.
  "supino-reto-barra": [
    { musculo: "Peitoral maior", shapes: [{ cx: 52, cy: 49, rx: 8, ry: 5, rot: -8 }] },
    {
      musculo: "Tríceps",
      shapes: [
        { cx: 63, cy: 55, rx: 4, ry: 4.5, rot: 20 },
        { cx: 38, cy: 39, rx: 3, ry: 3 },
      ],
    },
    {
      musculo: "Deltoide anterior",
      shapes: [
        { cx: 59, cy: 46, rx: 3, ry: 3 },
        { cx: 43, cy: 42, rx: 3, ry: 3 },
      ],
    },
    { musculo: "Serrátil anterior", shapes: [{ cx: 49, cy: 56, rx: 3.5, ry: 3 }] },
  ],

  // Sentado, halteres acima da cabeça; deltoides em vermelho nos 2 ombros.
  "desenvolvimento-ombros": [
    {
      musculo: "Deltoide",
      shapes: [
        { cx: 42, cy: 34, rx: 4, ry: 4.5 },
        { cx: 57, cy: 34, rx: 4, ry: 4.5 },
      ],
    },
    {
      musculo: "Tríceps",
      shapes: [
        { cx: 40, cy: 20, rx: 3, ry: 5, rot: 8 },
        { cx: 60, cy: 20, rx: 3, ry: 5, rot: -8 },
      ],
    },
    { musculo: "Trapézio superior", shapes: [{ cx: 50, cy: 28, rx: 5, ry: 2.5 }] },
  ],

  // Vista lateral, de frente para a polia; tríceps no braço posterior.
  "triceps-polia": [
    { musculo: "Tríceps braquial", shapes: [{ cx: 43, cy: 37, rx: 3, ry: 8, rot: 5 }] },
    { musculo: "Ancôneo", shapes: [{ cx: 44.5, cy: 44, rx: 2, ry: 2 }] },
  ],

  /* ---------------------- Puxar (vista traseira) ------------------------ */

  // De costas; as duas lâminas do dorsal em vermelho.
  "puxada-alta": [
    {
      musculo: "Latíssimo do dorso",
      shapes: [
        { cx: 44, cy: 63, rx: 4.5, ry: 10, rot: 8 },
        { cx: 56, cy: 63, rx: 4.5, ry: 10, rot: -8 },
      ],
    },
    {
      musculo: "Bíceps",
      shapes: [
        { cx: 32, cy: 42, rx: 3.5, ry: 4, rot: 30 },
        { cx: 68, cy: 42, rx: 3.5, ry: 4, rot: -30 },
      ],
    },
    { musculo: "Romboides", shapes: [{ cx: 51, cy: 50, rx: 5, ry: 4 }] },
  ],

  // De costas, braços à frente nos pegadores.
  "remada-baixa": [
    {
      musculo: "Dorsais e romboides",
      shapes: [
        { cx: 46, cy: 45, rx: 5, ry: 11, rot: 5 },
        { cx: 56, cy: 45, rx: 5, ry: 11, rot: -5 },
      ],
    },
    { musculo: "Trapézio médio", shapes: [{ cx: 51, cy: 29, rx: 10, ry: 4 }] },
    {
      musculo: "Bíceps",
      shapes: [
        { cx: 31, cy: 38, rx: 3.5, ry: 3, rot: 20 },
        { cx: 71, cy: 38, rx: 3.5, ry: 3, rot: -20 },
      ],
    },
  ],

  /* -------------------------- Flexão de cotovelo ------------------------ */

  // Em pé, de frente; bíceps em vermelho nos dois braços.
  "rosca-direta": [
    {
      musculo: "Bíceps braquial",
      shapes: [
        { cx: 43, cy: 25, rx: 3, ry: 5, rot: 12 },
        { cx: 58.5, cy: 25, rx: 3, ry: 4.5, rot: -20 },
      ],
    },
    {
      musculo: "Braquial",
      shapes: [
        { cx: 42.5, cy: 29.5, rx: 2.5, ry: 2.5 },
        { cx: 58, cy: 28.5, rx: 2.5, ry: 2.5 },
      ],
    },
  ],
};
