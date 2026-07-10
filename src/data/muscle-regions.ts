/**
 * Regiões musculares INTERATIVAS sobre a imagem de análise (hover/tap → nome,
 * % de ativação e papel). Coordenadas em % (0–100) da caixa 4:3 da imagem,
 * autoradas à mão olhando cada imagem de análise — determinístico, sem IA.
 *
 * `musculo` DEVE bater com `ativacao[].musculo` do exercício (exercises.ts):
 * é de lá que vêm o percentual e o papel exibidos no tooltip.
 * Um músculo pode ter várias elipses (ex.: os dois braços/coxas destacam juntos).
 *
 * REGRA DE RIGOR ANATÔMICO (`rotularNoCorpo`): só recebe um RÓTULO fixado no
 * corpo o músculo que está VISÍVEL, destacado (vermelho) e corretamente
 * localizado NAQUELA imagem/ângulo. Ex.: em vista frontal (agachamento) o
 * glúteo máximo é posterior e NÃO aparece — fica só no card "Contribuição
 * muscular" (que lista nome + % dos músculos trabalhados, sem afirmar posição
 * visual, e por isso é sempre correto). Cada flag abaixo foi auditada imagem a
 * imagem. Sem a flag, nenhum marcador é desenhado sobre o corpo — nunca se
 * afirma uma localização anatômica falsa.
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
  /** lado do rótulo fino no slider: 1 = direita, -1 = esquerda (override do
   *  heurístico por cy — autorado quando o padrão colide com algo na imagem) */
  labelSide?: 1 | -1;
  /** true = o músculo está visível/destacado e corretamente localizado nesta
   *  imagem → pode ter marcador no corpo. Sem a flag: só aparece no card. */
  rotularNoCorpo?: boolean;
}

export const muscleRegions: Record<string, MuscleRegion[]> = {
  /* ------------------------- Membros inferiores ------------------------- */

  // Reclinada; coxa sobe da pelve (≈46,64) ao joelho (≈58,43). Vermelho = só o
  // quadríceps (frente da coxa). Glúteo/posteriores/adutores não visíveis → card.
  "leg-press-45": [
    { musculo: "Quadríceps", rotularNoCorpo: true, shapes: [{ cx: 51, cy: 50, rx: 11, ry: 6, rot: -38 }] },
    { musculo: "Glúteo máximo", shapes: [{ cx: 46, cy: 66, rx: 6, ry: 5, rot: -15 }] },
    { musculo: "Posteriores de coxa", shapes: [{ cx: 55, cy: 58, rx: 8, ry: 4.5, rot: -32 }] },
    { musculo: "Adutores", shapes: [{ cx: 47, cy: 57, rx: 4, ry: 3.5, rot: -35 }] },
  ],

  // Agachamento profundo em 3/4 ANTERIOR; vermelho = só as coxas (quadríceps).
  // Glúteo/eretores/posteriores são posteriores e NÃO aparecem de frente → card.
  "agachamento-livre": [
    {
      musculo: "Quadríceps",
      rotularNoCorpo: true,
      shapes: [
        { cx: 40, cy: 66, rx: 7, ry: 5.5, rot: -15 },
        { cx: 59, cy: 62, rx: 7, ry: 5.5, rot: 10 },
      ],
    },
    { musculo: "Glúteo máximo", shapes: [{ cx: 66, cy: 60, rx: 5, ry: 4.5 }] },
    { musculo: "Eretores da espinha", shapes: [{ cx: 63, cy: 51, rx: 3.5, ry: 4 }] },
    { musculo: "Posteriores de coxa", shapes: [{ cx: 64, cy: 66, rx: 5, ry: 3.5, rot: 10 }] },
  ],

  // Sentada; pernas estendidas p/ a esquerda; vermelho = quadríceps (frente da
  // coxa). Reto femoral é parte do quadríceps no mesmo ponto → card (evita 2
  // rótulos sobre o mesmo local).
  "cadeira-extensora": [
    { musculo: "Vastos do quadríceps", rotularNoCorpo: true, shapes: [{ cx: 55, cy: 62, rx: 12, ry: 5.5, rot: -8 }] },
    { musculo: "Reto femoral", shapes: [{ cx: 56, cy: 57, rx: 10, ry: 3, rot: -8 }] },
  ],

  // Prona; vermelho = isquiotibiais (posterior da coxa), visível. Panturrilha
  // menor → card.
  "mesa-flexora": [
    { musculo: "Isquiotibiais", rotularNoCorpo: true, shapes: [{ cx: 56, cy: 54, rx: 9, ry: 8, rot: -20 }] },
    { musculo: "Panturrilha", shapes: [{ cx: 72, cy: 44, rx: 5, ry: 6, rot: 30 }] },
  ],

  // Vista LATERAL em dobradiça; vermelho = isquiotibiais (post. da coxa) +
  // eretores da espinha (lombar) — ambos visíveis de lado.
  "levantamento-terra-romeno": [
    { musculo: "Isquiotibiais", rotularNoCorpo: true, shapes: [{ cx: 58, cy: 51, rx: 5.5, ry: 11, rot: 8 }] },
    { musculo: "Glúteo máximo", shapes: [{ cx: 64, cy: 38, rx: 5.5, ry: 5 }] },
    { musculo: "Eretores da espinha", rotularNoCorpo: true, shapes: [{ cx: 55, cy: 27, rx: 8, ry: 3.5, rot: -25 }] },
  ],

  // Ponte no banco; vermelho = glúteo máximo sob o quadril (visível). Post/quad → card.
  "hip-thrust": [
    { musculo: "Glúteo máximo", rotularNoCorpo: true, labelSide: -1, shapes: [{ cx: 46, cy: 54, rx: 7, ry: 7 }] },
    { musculo: "Isquiotibiais", shapes: [{ cx: 36, cy: 52, rx: 8, ry: 4, rot: 8 }] },
    { musculo: "Quadríceps", shapes: [{ cx: 36, cy: 45, rx: 9, ry: 3.5, rot: 5 }] },
  ],

  // Afundo LATERAL; vermelho = quadríceps (frente das coxas), visível. Glúteo/
  // estabilizadores → card.
  "afundo-passada": [
    {
      musculo: "Quadríceps",
      rotularNoCorpo: true,
      shapes: [
        { cx: 35, cy: 61, rx: 10, ry: 4.5, rot: -5 },
        { cx: 51, cy: 70, rx: 4, ry: 9, rot: 5 },
      ],
    },
    { musculo: "Glúteo máximo", shapes: [{ cx: 47, cy: 60, rx: 5, ry: 5 }] },
    { musculo: "Estabilizadores do quadril", shapes: [{ cx: 45, cy: 55, rx: 4, ry: 3 }] },
  ],

  /* ------------------------ Empurrar (superiores) ----------------------- */

  // Deitado, cabeça à direita; vermelho = peitoral (centro) + tríceps (braços).
  "supino-reto-barra": [
    { musculo: "Peitoral maior", rotularNoCorpo: true, shapes: [{ cx: 52, cy: 49, rx: 8, ry: 5, rot: -8 }] },
    {
      musculo: "Tríceps",
      rotularNoCorpo: true,
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

  // Sentado, halteres acima; vermelho = deltoides nos 2 ombros (visíveis).
  "desenvolvimento-ombros": [
    {
      musculo: "Deltoide",
      rotularNoCorpo: true,
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

  // Vista lateral; vermelho = tríceps no braço posterior (visível).
  "triceps-polia": [
    { musculo: "Tríceps braquial", rotularNoCorpo: true, shapes: [{ cx: 43, cy: 37, rx: 3, ry: 8, rot: 5 }] },
    { musculo: "Ancôneo", shapes: [{ cx: 44.5, cy: 44, rx: 2, ry: 2 }] },
  ],

  /* ---------------------- Puxar (vista traseira) ------------------------ */

  // De costas; vermelho = as duas lâminas do latíssimo (dorsais). Bíceps/romboides → card.
  "puxada-alta": [
    {
      musculo: "Latíssimo do dorso",
      rotularNoCorpo: true,
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

  // remada-baixa: foto refeita (nova pose); overlay antigo removido para não desalinhar.
  "remada-baixa": [],

  /* -------------------------- Flexão de cotovelo ------------------------ */

  // Em pé, de frente; vermelho = bíceps nos dois braços (visível). Braquial (profundo) → card.
  "rosca-direta": [
    {
      musculo: "Bíceps braquial",
      rotularNoCorpo: true,
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

  /* --------------------- Expansão: cardio/funcional/core ------------------ */

  // Lateral; vermelho = glúteo (nádega, visível de lado) + panturrilha (perna
  // de trás em propulsão). Quad/posteriores → card.
  "caminhada-esteira": [
    { musculo: "Glúteo máximo", rotularNoCorpo: true, shapes: [{ cx: 51.5, cy: 47, rx: 3, ry: 5 }] },
    { musculo: "Quadríceps", shapes: [{ cx: 56, cy: 55, rx: 3.5, ry: 8, rot: 15 }] },
    { musculo: "Posteriores de coxa", shapes: [{ cx: 53, cy: 56, rx: 2.5, ry: 7, rot: 15 }] },
    { musculo: "Panturrilha", rotularNoCorpo: true, shapes: [{ cx: 48.5, cy: 63, rx: 2.5, ry: 5, rot: -12 }] },
  ],

  // Lateral pedalando; vermelho = quadríceps (coxa). Glúteo contra o banco/post → card.
  "bicicleta-ergometrica": [
    { musculo: "Quadríceps", rotularNoCorpo: true, shapes: [{ cx: 60, cy: 44, rx: 8, ry: 4.5, rot: -10 }] },
    { musculo: "Glúteo máximo", shapes: [{ cx: 67.5, cy: 41, rx: 4, ry: 6.5, rot: -15 }] },
    { musculo: "Posteriores de coxa", shapes: [{ cx: 60, cy: 52, rx: 4.5, ry: 3.5, rot: -8 }] },
    { musculo: "Panturrilha", shapes: [{ cx: 60, cy: 64, rx: 2.5, ry: 5 }] },
  ],

  // 3/4; vermelho = pernas na base (quadríceps) + deltoide no ombro. shapes[0]
  // do quad = âncora mais alta do rótulo (evita o rodapé).
  eliptico: [
    {
      musculo: "Quadríceps",
      rotularNoCorpo: true,
      shapes: [
        { cx: 63, cy: 86, rx: 4, ry: 5 },
        { cx: 61, cy: 92, rx: 5, ry: 7 },
      ],
    },
    { musculo: "Glúteo máximo", shapes: [{ cx: 79, cy: 85, rx: 6, ry: 9 }] },
    { musculo: "Posteriores de coxa", shapes: [{ cx: 74, cy: 92, rx: 4, ry: 7 }] },
    { musculo: "Deltoide", rotularNoCorpo: true, shapes: [{ cx: 76, cy: 45, rx: 5.5, ry: 6.5 }] },
  ],

  // Frontal na piscina; vermelho = coxas (quadríceps) + abdômen (core). shapes[0]
  // = coxa direita + labelSide dir (a água à direita é a única área livre).
  "marcha-aquatica": [
    {
      musculo: "Quadríceps",
      labelSide: 1,
      rotularNoCorpo: true,
      shapes: [
        { cx: 66, cy: 74, rx: 4, ry: 8, rot: -5 },
        { cx: 51, cy: 75, rx: 3.5, ry: 6, rot: 10 },
      ],
    },
    { musculo: "Core", labelSide: 1, rotularNoCorpo: true, shapes: [{ cx: 58, cy: 62, rx: 4, ry: 5 }] },
  ],

  // Lateral em pé; vermelho = glúteo (nádega, grande e visível de lado) +
  // quadríceps (frente da coxa). labelSide esq (área livre à esquerda).
  "sentar-levantar": [
    { musculo: "Glúteo máximo", rotularNoCorpo: true, labelSide: -1, shapes: [{ cx: 47, cy: 43, rx: 4, ry: 6 }] },
    { musculo: "Quadríceps", rotularNoCorpo: true, labelSide: -1, shapes: [{ cx: 46.5, cy: 58, rx: 3.5, ry: 8, rot: 5 }] },
    { musculo: "Posteriores de coxa", shapes: [{ cx: 43.5, cy: 55, rx: 2.5, ry: 7, rot: 5 }] },
  ],

  // Lateral no topo da ponte; vermelho = glúteo (quadril) + posteriores (coxa),
  // ambos visíveis de lado.
  "ponte-gluteos": [
    { musculo: "Glúteo máximo", rotularNoCorpo: true, shapes: [{ cx: 45.5, cy: 60, rx: 5, ry: 7 }] },
    { musculo: "Posteriores de coxa", rotularNoCorpo: true, shapes: [{ cx: 36, cy: 51, rx: 7, ry: 4.5, rot: 25 }] },
  ],

  // Lateral em prancha; vermelho = parede abdominal (reto abdominal), visível.
  "prancha-frontal": [
    { musculo: "Core", shapes: [{ cx: 50, cy: 58, rx: 7, ry: 8 }] },
    { musculo: "Reto abdominal", rotularNoCorpo: true, shapes: [{ cx: 49, cy: 56, rx: 5.5, ry: 7, rot: -10 }] },
    { musculo: "Oblíquos", shapes: [{ cx: 53, cy: 60, rx: 3.5, ry: 5 }] },
  ],

  // dead-bug: foto refeita (nova pose); overlay antigo removido para não desalinhar.
  "dead-bug": [],

  // remada-elastica: foto refeita (nova pose); overlay antigo removido para não desalinhar.
  "remada-elastica": [],

  // panturrilha-em-pe: foto refeita (nova pose); overlay antigo removido para não desalinhar.
  "panturrilha-em-pe": [],
};
