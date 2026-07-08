/**
 * Camada vetorial de biomecânica desenhada por cima da imagem de ANÁLISE (écorché
 * alinhado à pose da foto). Só entram marcadores determinísticos, autorados olhando
 * cada imagem:
 *   - `force`: linha de força / sentido do movimento concêntrico. Fica SEMPRE numa
 *     margem vazia (fora da anatomia) apontando o sentido do movimento — nunca por
 *     cima do corpo.
 *   - `angle`: ângulo articular. SÓ é exibido em vistas claramente LATERAIS (sagitais),
 *     onde a goniometria 2D é válida, e SEMPRE com `rays` — o valor é CALCULADO da
 *     geometria da pose (arredondado a 5°), não digitado. Em vistas frontais/traseiras
 *     ou quando a articulação está em posição pouco informativa, o ângulo é omitido
 *     (medir um ângulo 2D fora do plano sagital induziria erro).
 * Coordenadas em % (0–100) da caixa da imagem.
 */

export interface AnalysisOverlayData {
  /** vértice do ângulo (articulação). Exige `rays` (segmento A e B a partir do
   *  vértice) — o valor exibido é CALCULADO da geometria e o glifo desenha raios
   *  finos + arco na articulação. Sem `rays`, o ângulo não é mostrado. */
  angle?: { x: number; y: number; value: string; rays?: { ax: number; ay: number; bx: number; by: number } };
  force?: { x1: number; y1: number; x2: number; y2: number };
}

export const analysisOverlays: Record<string, AnalysisOverlayData> = {
  // --- Membros inferiores -------------------------------------------------
  "leg-press-45": {
    // LATERAL. Joelho quase estendido (topo do empurrão) → ângulo calculado ≈160°.
    angle: { x: 58, y: 43, value: "160°", rays: { ax: 47, ay: 63, bx: 73, by: 29 } },
    // movimento: pernas empurram a plataforma p/ cima-direita; seta na parede vazia acima.
    force: { x1: 38, y1: 24, x2: 52, y2: 14 },
  },
  "agachamento-livre": {
    // vista quase FRONTAL: ângulo de joelho 2D não é medível de forma confiável → sem ângulo.
    // movimento: subir (extensão) — seta vertical na margem escura à esquerda, fora do corpo.
    force: { x1: 14, y1: 73, x2: 14, y2: 54 },
  },
  "cadeira-extensora": {
    // LATERAL. Joelho perto da extensão máxima (topo) → ≈170°.
    angle: { x: 46, y: 56, value: "170°", rays: { ax: 66, ay: 54, bx: 24, by: 64 } },
    // movimento: canela sobe (extensão) — seta na margem esquerda, à frente dos pés.
    force: { x1: 15, y1: 66, x2: 15, y2: 48 },
  },
  "mesa-flexora": {
    // LATERAL (prono). Flexão de joelho no meio da amplitude → calculado da pose.
    angle: { x: 76, y: 55, value: "135°", rays: { ax: 56, ay: 52, bx: 90, by: 40 } },
    // movimento: calcanhares sobem em direção aos glúteos — seta no topo-direito vazio.
    force: { x1: 90, y1: 40, x2: 90, y2: 25 },
  },
  "levantamento-terra-romeno": {
    // LATERAL. Dobradiça de quadril (fundo) → ângulo tronco×coxa ≈115°.
    angle: { x: 64, y: 43, value: "115°", rays: { ax: 47, ay: 24, bx: 60, by: 61 } },
    // movimento: subir (extensão de quadril) — seta vertical na margem esquerda.
    force: { x1: 24, y1: 60, x2: 24, y2: 42 },
  },
  "hip-thrust": {
    // LATERAL. Quadril perto do bloqueio no topo → extensão ≈160°.
    angle: { x: 48, y: 45, value: "160°", rays: { ax: 70, ay: 33, bx: 28, by: 44 } },
    // movimento: quadril sobe — seta vertical na parede vazia acima, à esquerda do tronco.
    force: { x1: 40, y1: 30, x2: 40, y2: 15 },
  },
  "afundo-passada": {
    // LATERAL. Joelho da frente flexionado → calculado da pose.
    angle: { x: 33, y: 61, value: "120°", rays: { ax: 52, ay: 54, bx: 28, by: 86 } },
    // movimento: subir da passada — seta vertical na margem direita (área escura aberta).
    force: { x1: 82, y1: 60, x2: 82, y2: 43 },
  },

  // --- Empurrar (superiores) ---------------------------------------------
  "supino-reto-barra": {
    // vista oblíqua (deitado) — ângulo de cotovelo 2D pouco confiável → sem ângulo.
    // movimento: empurrar a barra p/ cima — seta vertical na margem esquerda.
    force: { x1: 18, y1: 44, x2: 18, y2: 27 },
  },
  "desenvolvimento-ombros": {
    // vista FRONTAL — sem ângulo (não medível no plano frontal).
    // movimento: empurrar acima da cabeça — seta vertical na margem esquerda.
    force: { x1: 20, y1: 42, x2: 20, y2: 24 },
  },
  "triceps-polia": {
    // LATERAL. Extensão de cotovelo (empurrar p/ baixo) → calculado da pose.
    angle: { x: 51, y: 42, value: "105°", rays: { ax: 54, ay: 27, bx: 58, by: 47 } },
    // movimento: antebraço estende p/ baixo — seta vertical (p/ baixo) na margem esquerda.
    force: { x1: 22, y1: 40, x2: 22, y2: 56 },
  },

  // --- Puxar (costas, vista traseira) ------------------------------------
  "puxada-alta": {
    // vista TRASEIRA — sem ângulo (cotovelo não medível de costas).
    // movimento: puxar a barra p/ baixo — seta vertical (p/ baixo) na margem esquerda.
    force: { x1: 16, y1: 40, x2: 16, y2: 57 },
  },
  "remada-baixa": {
    // vista TRASEIRA — sem ângulo.
    // movimento: retração / puxar em direção ao tronco — seta (p/ baixo) na margem esquerda.
    force: { x1: 16, y1: 40, x2: 16, y2: 54 },
  },

  // --- Flexão de cotovelo -------------------------------------------------
  "rosca-direta": {
    // vista FRONTAL — sem ângulo (cotovelo encurtado no plano frontal).
    // movimento: flexionar (subir o peso) — seta vertical na margem esquerda.
    force: { x1: 20, y1: 42, x2: 20, y2: 26 },
  },

  // --- Expansão: cardio / funcional / core --------------------------------
  "caminhada-esteira": {
    // propulsão p/ a frente — seta horizontal no topo vazio.
    force: { x1: 40, y1: 20, x2: 56, y2: 18 },
  },
  "bicicleta-ergometrica": {
    // LATERAL. Vértice no joelho alto; flexão no topo do pedal → calculado.
    angle: { x: 52.5, y: 48.5, value: "90°", rays: { ax: 67, ay: 41, bx: 57, by: 65 } },
    // movimento: empurrar o pedal p/ baixo — seta na margem esquerda.
    force: { x1: 22, y1: 46, x2: 22, y2: 60 },
  },
  eliptico: {
    // passada — seta na margem direita, arco descendente.
    force: { x1: 86, y1: 62, x2: 86, y2: 78 },
  },
  "marcha-aquatica": {
    // marcha contra a água (avança) — seta na margem direita.
    force: { x1: 84, y1: 66, x2: 84, y2: 51 },
  },
  "sentar-levantar": {
    // quase em pé (joelho ~estendido, pouco informativo) → sem ângulo.
    // movimento: levantar (extensão de quadril/joelho) — seta vertical na margem esquerda.
    force: { x1: 20, y1: 58, x2: 20, y2: 41 },
  },
  "ponte-gluteos": {
    // LATERAL. Vértice no quadril; extensão ≈ alinhamento no topo → calculado.
    angle: { x: 45, y: 58, value: "165°", rays: { ax: 27, ay: 41, bx: 72, by: 71 } },
    // movimento: quadril sobe — seta vertical na parede vazia acima.
    force: { x1: 32, y1: 34, x2: 32, y2: 19 },
  },
  "dead-bug": {
    // core (anti-extensão): o ponto não é um ângulo articular de treino → sem ângulo.
    // movimento: membros estendem — seta na margem esquerda.
    force: { x1: 30, y1: 44, x2: 15, y2: 44 },
  },
  "remada-elastica": {
    // vista TRASEIRA — sem ângulo.
    // movimento: retração (puxar) — seta (p/ baixo) na margem esquerda.
    force: { x1: 18, y1: 34, x2: 18, y2: 48 },
  },
  "panturrilha-em-pe": {
    // flexão plantar: empurra o corpo p/ cima — seta vertical na margem esquerda.
    force: { x1: 18, y1: 68, x2: 18, y2: 52 },
  },
};
