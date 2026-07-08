/**
 * Camada vetorial de biomecânica desenhada por cima da imagem de ANÁLISE (img2img — a
 * musculatura em raio-x já vem alinhada à pose da foto de execução). Aqui só entram os
 * marcadores que controlo com precisão determinística, autorados olhando cada imagem:
 *   - `force`: linha de força (direção do empurrão concêntrico / linha de ação da carga)
 *   - `angle`: ângulo da articulação predominante + posição do chip
 * Coordenadas em % (0–100) da caixa da imagem. Sem IA, sem teste-e-erro: valores fixos.
 */

export interface AnalysisOverlayData {
  /** vértice do ângulo (articulação). Com `rays`, o valor exibido é CALCULADO
   *  da geometria (segmento A = ex. coxa, segmento B = ex. canela) e o glifo
   *  desenha raios + arco na articulação — nada de chip solto. */
  angle?: { x: number; y: number; value: string; rays?: { ax: number; ay: number; bx: number; by: number } };
  force?: { x1: number; y1: number; x2: number; y2: number };
}

export const analysisOverlays: Record<string, AnalysisOverlayData> = {
  // --- Membros inferiores -------------------------------------------------
  "leg-press-45": {
    // Vértice no joelho (58,43); raio A → quadril, raio B → tornozelo. O valor
    // exibido é calculado da geometria (pose quase estendida neste frame).
    angle: { x: 58, y: 43, value: "95°", rays: { ax: 47, ay: 63, bx: 73, by: 29 } },
    force: { x1: 63, y1: 39, x2: 75, y2: 27 },
  },
  "agachamento-livre": {
    angle: { x: 67, y: 64, value: "115°" },
    force: { x1: 52, y1: 58, x2: 52, y2: 40 },
  },
  "cadeira-extensora": {
    // sentada, pernas estendendo p/ a esquerda; quadríceps na coxa. Joelho ≈(45,64).
    angle: { x: 39, y: 70, value: "150°" },
    force: { x1: 44, y1: 63, x2: 28, y2: 60 },
  },
  "mesa-flexora": {
    // prona, flexão de joelho; isquiotibiais na coxa posterior. Joelho ≈(63,58).
    angle: { x: 63, y: 55, value: "45°" },
    force: { x1: 64, y1: 55, x2: 74, y2: 40 },
  },
  "levantamento-terra-romeno": {
    // dobradiça de quadril, vista lateral; isquios + glúteos + eretores. Quadril ~(60,34).
    angle: { x: 69, y: 32, value: "110°" },
    force: { x1: 53, y1: 58, x2: 53, y2: 40 },
  },
  "hip-thrust": {
    // supino no banco, extensão de quadril; glúteos sob o quadril. Joelho ~(26,54).
    angle: { x: 28, y: 48, value: "90°" },
    force: { x1: 46, y1: 52, x2: 46, y2: 36 },
  },
  "afundo-passada": {
    // afundo lateral virado p/ esquerda; quadríceps + glúteo da perna da frente. Joelho ~(35,63).
    angle: { x: 25, y: 57, value: "90°" },
    force: { x1: 37, y1: 64, x2: 42, y2: 48 },
  },

  // --- Empurrar (superiores) ---------------------------------------------
  "supino-reto-barra": {
    // Cotovelo D ≈(64,52); força do peito à barra (vertical).
    angle: { x: 64, y: 50, value: "80°" },
    force: { x1: 54, y1: 47, x2: 53, y2: 31 },
  },
  "desenvolvimento-ombros": {
    // sentado, desenvolvimento; deltoides nos dois ombros. Ombro D ~(63,33).
    angle: { x: 58, y: 34, value: "90°" },
    force: { x1: 63, y1: 33, x2: 66, y2: 12 },
  },
  "triceps-polia": {
    // vista lateral virado p/ polia; tríceps no braço posterior. Cotovelo ~(50,37).
    angle: { x: 36, y: 45, value: "90°" },
    force: { x1: 46, y1: 40, x2: 51, y2: 52 },
  },

  // --- Puxar (costas, vista traseira) ------------------------------------
  "puxada-alta": {
    // sentado de costas p/ a câmera; dorsais em vermelho. Cotovelo D ~(84,40).
    // força = adução/depressão do úmero (puxar a barra p/ baixo) sobre o dorsal.
    angle: { x: 68, y: 42, value: "100°" },
    force: { x1: 60, y1: 46, x2: 58, y2: 62 },
  },
  "remada-baixa": {
    // sentado de costas; trapézio médio/romboides + dorsais em vermelho. Cotovelo D ~(85,38).
    // força = retração escapular (puxar em direção à coluna).
    angle: { x: 72, y: 38, value: "90°" },
    force: { x1: 72, y1: 42, x2: 58, y2: 44 },
  },

  // --- Flexão de cotovelo -------------------------------------------------
  "rosca-direta": {
    // em pé, rosca; bíceps nos dois braços. Cotovelo D ~(60,37).
    angle: { x: 57, y: 30, value: "90°" },
    force: { x1: 58, y1: 32, x2: 62, y2: 24 },
  },

  // --- Expansão: cardio / funcional / core --------------------------------
  "caminhada-esteira": {
    // propulsão para a frente ao longo da esteira
    force: { x1: 50, y1: 58, x2: 62, y2: 52 },
  },
  "bicicleta-ergometrica": {
    // vértice no joelho alto; A→quadril, B→tornozelo (flexão no topo do pedal)
    angle: { x: 52.5, y: 48.5, value: "75°", rays: { ax: 67, ay: 41, bx: 57, by: 65 } },
    force: { x1: 55, y1: 52, x2: 57.5, y2: 64 },
  },
  eliptico: {
    // empurrar do pedal em arco descendente
    force: { x1: 62, y1: 84, x2: 66, y2: 96 },
  },
  "marcha-aquatica": {
    // marcha contra a resistência da água (avança para a esquerda)
    force: { x1: 58, y1: 73, x2: 46, y2: 69 },
  },
  "sentar-levantar": {
    // subida: extensão de quadril/joelho, força vertical
    force: { x1: 44, y1: 50, x2: 45, y2: 36 },
    angle: { x: 52, y: 62, value: "90°" },
  },
  "ponte-gluteos": {
    // vértice no quadril; A→joelho, B→ombro (extensão ≈ alinhamento no topo)
    angle: { x: 45, y: 58, value: "165°", rays: { ax: 27, ay: 41, bx: 72, by: 71 } },
    force: { x1: 46, y1: 55, x2: 45, y2: 42 },
  },
  "dead-bug": {
    // vértice no quadril flexionado; A→joelho dobrado, B→ombro (≈90°)
    angle: { x: 60, y: 55, value: "90°", rays: { ax: 47, ay: 36, bx: 78, by: 60 } },
    force: { x1: 33, y1: 53, x2: 18, y2: 57 },
  },
  "remada-elastica": {
    // retração: puxada em direção à coluna (vista traseira)
    angle: { x: 68, y: 26, value: "90°" },
    force: { x1: 67, y1: 44, x2: 56, y2: 43 },
  },
  "panturrilha-em-pe": {
    // flexão plantar: empurra o corpo verticalmente
    force: { x1: 47, y1: 70, x2: 47, y2: 58 },
  },
};
