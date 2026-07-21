/**
 * Detecção de pose no NAVEGADOR (visão computacional real, não número inventado).
 *
 * Usa o MoveNet (SinglePose Thunder) via TensorFlow.js. A foto NUNCA sai do
 * dispositivo: o modelo roda localmente. Devolve os marcos do corpo (17 pontos
 * COCO) já normalizados em 0..1 sobre a imagem, com a confiança de cada ponto.
 *
 * O TF.js é pesado, então tudo aqui é carregado sob demanda (import dinâmico):
 * o bundle principal não paga o custo de quem nunca abre o rastreio postural.
 */

export interface Marco {
  nome: string;
  /** posição normalizada 0..1 na largura da imagem */
  x: number;
  /** posição normalizada 0..1 na altura da imagem */
  y: number;
  /** confiança 0..1 do detector para este ponto */
  score: number;
}

/** Os 17 pontos do MoveNet/COCO, na ordem em que o modelo devolve. */
export const NOMES_MARCOS = [
  "nose",
  "left_eye",
  "right_eye",
  "left_ear",
  "right_ear",
  "left_shoulder",
  "right_shoulder",
  "left_elbow",
  "right_elbow",
  "left_wrist",
  "right_wrist",
  "left_hip",
  "right_hip",
  "left_knee",
  "right_knee",
  "left_ankle",
  "right_ankle",
] as const;

export type NomeMarco = (typeof NOMES_MARCOS)[number];

// Detector é caro de criar: mantém um só, criado na primeira detecção.
let detectorPromise: Promise<{
  estimatePoses: (img: HTMLImageElement) => Promise<
    Array<{ keypoints: Array<{ x: number; y: number; score?: number; name?: string }> }>
  >;
}> | null = null;

async function obterDetector() {
  if (detectorPromise) return detectorPromise;
  detectorPromise = (async () => {
    const tf = await import("@tensorflow/tfjs-core");
    await import("@tensorflow/tfjs-backend-webgl");
    const poseDetection = await import("@tensorflow-models/pose-detection");
    await tf.setBackend("webgl");
    await tf.ready();
    return poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
    });
  })();
  return detectorPromise;
}

/**
 * Detecta a pose numa imagem já carregada. Devolve os 17 marcos normalizados,
 * ou lança se o modelo não encontrar ninguém.
 */
export async function detectarPose(img: HTMLImageElement): Promise<Marco[]> {
  const detector = await obterDetector();
  const poses = await detector.estimatePoses(img);
  if (!poses.length) throw new Error("Nenhuma pessoa detectada na foto.");
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  return poses[0].keypoints.map((k, i) => ({
    nome: k.name ?? NOMES_MARCOS[i] ?? `p${i}`,
    x: w ? k.x / w : 0,
    y: h ? k.y / h : 0,
    score: k.score ?? 0,
  }));
}

/** Carrega uma data URL numa HTMLImageElement pronta para o detector. */
export function carregarImagem(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Não consegui carregar a imagem."));
    img.src = dataUrl;
  });
}
