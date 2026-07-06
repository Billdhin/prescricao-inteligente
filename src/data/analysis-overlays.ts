/**
 * Camada vetorial de biomecânica desenhada por cima da imagem de ANÁLISE (img2img — a
 * musculatura em raio-x já vem alinhada à pose da foto de execução). Aqui só entram os
 * marcadores que controlo com precisão determinística, autorados olhando cada imagem:
 *   - `force`: linha de força (direção do empurrão concêntrico / linha de ação da carga)
 *   - `angle`: ângulo da articulação predominante + posição do chip
 * Coordenadas em % (0–100) da caixa da imagem. Sem IA, sem teste-e-erro: valores fixos.
 */

export interface AnalysisOverlayData {
  angle?: { x: number; y: number; value: string };
  force?: { x1: number; y1: number; x2: number; y2: number };
}

export const analysisOverlays: Record<string, AnalysisOverlayData> = {
  // --- Membros inferiores -------------------------------------------------
  "leg-press-45": {
    angle: { x: 68, y: 47, value: "95°" },
    force: { x1: 64, y1: 42, x2: 78, y2: 24 },
  },
  "agachamento-livre": {
    angle: { x: 67, y: 64, value: "115°" },
    force: { x1: 52, y1: 58, x2: 52, y2: 40 },
  },
  "cadeira-extensora": {
    // sentada, pernas estendendo p/ a esquerda; quadríceps na coxa. Joelho ~(42,58).
    angle: { x: 40, y: 51, value: "150°" },
    force: { x1: 44, y1: 58, x2: 26, y2: 54 },
  },
  "mesa-flexora": {
    // prona, flexão de joelho; isquiotibiais na coxa posterior. Joelho ~(63,52).
    angle: { x: 66, y: 44, value: "45°" },
    force: { x1: 62, y1: 53, x2: 82, y2: 41 },
  },
  "levantamento-terra-romeno": {
    // dobradiça de quadril, vista lateral; isquios + glúteos + eretores. Quadril ~(60,34).
    angle: { x: 64, y: 30, value: "110°" },
    force: { x1: 53, y1: 58, x2: 53, y2: 40 },
  },
  "hip-thrust": {
    // supino no banco, extensão de quadril; glúteos sob o quadril. Joelho ~(26,54).
    angle: { x: 28, y: 48, value: "90°" },
    force: { x1: 46, y1: 52, x2: 46, y2: 36 },
  },
  "afundo-passada": {
    // afundo lateral virado p/ esquerda; quadríceps + glúteo da perna da frente. Joelho ~(35,63).
    angle: { x: 31, y: 60, value: "90°" },
    force: { x1: 37, y1: 64, x2: 42, y2: 48 },
  },

  // --- Empurrar (superiores) ---------------------------------------------
  "supino-reto-barra": {
    angle: { x: 60, y: 31, value: "80°" },
    force: { x1: 60, y1: 45, x2: 57, y2: 29 },
  },
  "desenvolvimento-ombros": {
    // sentado, desenvolvimento; deltoides nos dois ombros. Ombro D ~(63,33).
    angle: { x: 58, y: 34, value: "90°" },
    force: { x1: 63, y1: 33, x2: 66, y2: 12 },
  },
  "triceps-polia": {
    // vista lateral virado p/ polia; tríceps no braço posterior. Cotovelo ~(50,37).
    angle: { x: 46, y: 40, value: "90°" },
    force: { x1: 50, y1: 36, x2: 53, y2: 47 },
  },

  // --- Puxar (costas, vista traseira) ------------------------------------
  "puxada-alta": {
    // sentado de costas p/ a câmera; dorsais em vermelho. Cotovelo D ~(84,40).
    // força = adução/depressão do úmero (puxar a barra p/ baixo) sobre o dorsal.
    angle: { x: 85, y: 40, value: "100°" },
    force: { x1: 64, y1: 44, x2: 61, y2: 61 },
  },
  "remada-baixa": {
    // sentado de costas; trapézio médio/romboides + dorsais em vermelho. Cotovelo D ~(85,38).
    // força = retração escapular (puxar em direção à coluna).
    angle: { x: 86, y: 40, value: "90°" },
    force: { x1: 75, y1: 42, x2: 60, y2: 45 },
  },

  // --- Flexão de cotovelo -------------------------------------------------
  "rosca-direta": {
    // em pé, rosca; bíceps nos dois braços. Cotovelo D ~(60,37).
    angle: { x: 56, y: 40, value: "90°" },
    force: { x1: 60, y1: 38, x2: 64, y2: 27 },
  },
};
