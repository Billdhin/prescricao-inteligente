/**
 * Geometria postural a partir dos marcos detectados. Cada medida é uma conta
 * explícita sobre os pontos que o modelo achou, não um número clínico inventado.
 *
 * HONESTIDADE: são estimativas 2D de uma foto única, sem calibração nem plano de
 * referência. Servem de RASTREIO e de ponto de partida editável, não de medição
 * clínica de gold standard. Os limiares abaixo são a heurística de triagem do
 * app (declarada), não pontos de corte validados da literatura. O profissional
 * confirma ou corrige tudo.
 */
import type { Marco, NomeMarco } from "./vision";
import type { VistaPostural } from "@/data/postural";

/** Limiares de triagem (transparentes, do app). */
export const LIMIARES = {
  /** graus de inclinação a partir dos quais marcamos desvio (nivelamento) */
  inclinacaoGraus: 2.5,
  /** confiança mínima do ponto para arriscar uma classificação automática */
  confiancaMin: 0.3,
  /** razão de deslocamento horizontal (sobre a altura do tronco) para anteriorização/protração */
  deslocamentoTronco: 0.12,
  /** razão de desvio do joelho (sobre a altura da coxa+perna) para valgo/varo */
  desvioJoelho: 0.06,
} as const;

export interface MedidaPostural {
  /** id do checkpoint do roteiro que esta medida preenche */
  checkpointId: string;
  /** rótulo curto da medida */
  rotulo: string;
  /** valor legível (ex.: "inclinação 3,4°") */
  valor: string;
  /** classificação sugerida (deve casar com uma opção do checkpoint) ou null se inconclusivo */
  classificacao: string | null;
  /** confiança 0..1 (menor score dos pontos envolvidos) */
  confianca: number;
  /** true quando a confiança ficou abaixo do mínimo (pede ajuste manual) */
  baixaConfianca: boolean;
}

type Mapa = Partial<Record<NomeMarco, Marco>>;

function indexar(marcos: Marco[]): Mapa {
  const m: Mapa = {};
  for (const k of marcos) m[k.nome as NomeMarco] = k;
  return m;
}

const grau = (rad: number) => (rad * 180) / Math.PI;
const fmtGraus = (g: number) => `${g.toFixed(1).replace(".", ",")}°`;

/** Inclinação (em graus) de um segmento em relação à horizontal, sempre positiva. */
function inclinacao(a: Marco, b: Marco): number {
  return Math.abs(grau(Math.atan2(b.y - a.y, Math.abs(b.x - a.x))));
}

function minScore(...ps: (Marco | undefined)[]): number {
  const ss = ps.map((p) => p?.score ?? 0);
  return ss.length ? Math.min(...ss) : 0;
}

/** Altura do tronco (ombro->quadril) para normalizar deslocamentos. */
function alturaTronco(m: Mapa): number {
  const so = medioY(m.left_shoulder, m.right_shoulder);
  const qu = medioY(m.left_hip, m.right_hip);
  return Math.max(1e-3, Math.abs(qu - so));
}
function medioY(a?: Marco, b?: Marco): number {
  const ys = [a?.y, b?.y].filter((v): v is number => v != null);
  return ys.length ? ys.reduce((s, v) => s + v, 0) / ys.length : 0;
}
function medioX(a?: Marco, b?: Marco): number {
  const xs = [a?.x, b?.x].filter((v): v is number => v != null);
  return xs.length ? xs.reduce((s, v) => s + v, 0) / xs.length : 0;
}

/** Medida de nivelamento (cabeça/ombros/pelve na vista frontal). */
function nivelamento(
  checkpointId: string,
  rotulo: string,
  esq: Marco | undefined,
  dir: Marco | undefined,
  rotulos: { nivelado: string; direitaAlta: string; esquerdaAlta: string },
): MedidaPostural | null {
  if (!esq || !dir) return null;
  const ang = inclinacao(esq, dir);
  const conf = minScore(esq, dir);
  const baixa = conf < LIMIARES.confiancaMin;
  let classificacao: string | null;
  if (baixa) classificacao = null;
  else if (ang <= LIMIARES.inclinacaoGraus) classificacao = rotulos.nivelado;
  // menor y = mais alto na imagem
  else classificacao = dir.y < esq.y ? rotulos.direitaAlta : rotulos.esquerdaAlta;
  return { checkpointId, rotulo, valor: `inclinação ${fmtGraus(ang)}`, classificacao, confianca: conf, baixaConfianca: baixa };
}

/* ------------------------------- Por vista -------------------------------- */

function medidasAnterior(m: Mapa): MedidaPostural[] {
  const out: (MedidaPostural | null)[] = [];

  // Cabeça: inclinação pela linha dos olhos
  out.push(
    nivelamento("ant-cabeca", "Cabeça", m.left_eye, m.right_eye, {
      nivelado: "Alinhada",
      // inclinar a cabeça à direita baixa o lado direito
      direitaAlta: "Inclinada à esquerda",
      esquerdaAlta: "Inclinada à direita",
    }),
  );
  out.push(
    nivelamento("ant-ombros", "Ombros", m.left_shoulder, m.right_shoulder, {
      nivelado: "Nivelados",
      direitaAlta: "Direito mais alto",
      esquerdaAlta: "Esquerdo mais alto",
    }),
  );
  out.push(
    nivelamento("ant-pelve", "Pelve", m.left_hip, m.right_hip, {
      nivelado: "Nivelada",
      direitaAlta: "Elevada à direita",
      esquerdaAlta: "Elevada à esquerda",
    }),
  );

  // Joelhos: valgo/varo pela média do desvio de cada joelho em relação à linha quadril->tornozelo
  const joelhos = medidaJoelhos(m);
  out.push(joelhos);

  return out.filter((x): x is MedidaPostural => !!x);
}

function medidaJoelhos(m: Mapa): MedidaPostural | null {
  const linha = m.left_hip && m.right_hip && m.left_knee && m.right_knee && m.left_ankle && m.right_ankle;
  if (!linha) return null;
  const midX = medioX(m.left_hip, m.right_hip);
  const escala = Math.max(1e-3, Math.abs(medioY(m.left_hip, m.right_hip) - medioY(m.left_ankle, m.right_ankle)));
  // desvio medial (para dentro) do joelho relativo à reta quadril->tornozelo, por perna
  const desvioPerna = (hip: Marco, knee: Marco, ankle: Marco, ladoDireito: boolean) => {
    const t = (knee.y - hip.y) / (ankle.y - hip.y || 1e-3);
    const esperadoX = hip.x + t * (ankle.x - hip.x);
    const dev = knee.x - esperadoX; // + = joelho mais à direita na imagem
    // medial = em direção à linha média do corpo
    const medial = ladoDireito ? -dev : dev; // no lado direito (x maior), medial é para a esquerda (dev negativo)
    return medial / escala;
  };
  const dEsq = desvioPerna(m.left_hip!, m.left_knee!, m.left_ankle!, m.left_hip!.x > midX);
  const dDir = desvioPerna(m.right_hip!, m.right_knee!, m.right_ankle!, m.right_hip!.x > midX);
  const medialMedio = (dEsq + dDir) / 2;
  const conf = minScore(m.left_knee, m.right_knee, m.left_hip, m.right_hip, m.left_ankle, m.right_ankle);
  const baixa = conf < LIMIARES.confiancaMin;
  let classificacao: string | null;
  if (baixa || Math.abs(medialMedio) <= LIMIARES.desvioJoelho) classificacao = baixa ? null : "Alinhados";
  else classificacao = medialMedio > 0 ? "Valgo aparente (para dentro)" : "Varo aparente (para fora)";
  return {
    checkpointId: "ant-joelhos",
    rotulo: "Joelhos",
    valor: `desvio ${(medialMedio * 100).toFixed(0)}%`,
    classificacao,
    confianca: conf,
    baixaConfianca: baixa,
  };
}

function deslocamentoHorizontal(
  checkpointId: string,
  rotulo: string,
  ref: Marco | undefined,
  base: Marco | undefined,
  escala: number,
  rotulos: { neutro: string; desvio: string },
): MedidaPostural | null {
  if (!ref || !base) return null;
  const razao = Math.abs(ref.x - base.x) / escala;
  const conf = minScore(ref, base);
  const baixa = conf < LIMIARES.confiancaMin;
  const classificacao = baixa ? null : razao > LIMIARES.deslocamentoTronco ? rotulos.desvio : rotulos.neutro;
  return {
    checkpointId,
    rotulo,
    valor: `deslocamento ${(razao * 100).toFixed(0)}%`,
    classificacao,
    confianca: conf,
    baixaConfianca: baixa,
  };
}

function medidasLateral(m: Mapa): MedidaPostural[] {
  const tronco = alturaTronco(m);
  // usa o lado de maior confiança (a pessoa está de perfil; um lado aparece melhor)
  const lado = minScore(m.left_shoulder, m.left_hip) >= minScore(m.right_shoulder, m.right_hip) ? "left" : "right";
  const ear = lado === "left" ? m.left_ear : m.right_ear;
  const shoulder = lado === "left" ? m.left_shoulder : m.right_shoulder;
  const hip = lado === "left" ? m.left_hip : m.right_hip;

  const out: (MedidaPostural | null)[] = [];
  out.push(
    deslocamentoHorizontal("lat-cabeca", "Cabeça (anteriorização)", ear, shoulder, tronco, {
      neutro: "Alinhada",
      desvio: "Anteriorização aparente",
    }),
  );
  out.push(
    deslocamentoHorizontal("lat-ombros", "Ombros (protração)", shoulder, hip, tronco, {
      neutro: "Alinhados",
      desvio: "Protração aparente (à frente)",
    }),
  );
  return out.filter((x): x is MedidaPostural => !!x);
}

function medidasPosterior(m: Mapa): MedidaPostural[] {
  const out: (MedidaPostural | null)[] = [];
  out.push(
    nivelamento("post-escapulas", "Escápulas", m.left_shoulder, m.right_shoulder, {
      nivelado: "Niveladas",
      direitaAlta: "Direita mais elevada",
      esquerdaAlta: "Esquerda mais elevada",
    }),
  );
  out.push(
    nivelamento("post-pelve", "Pelve", m.left_hip, m.right_hip, {
      nivelado: "Nivelada",
      direitaAlta: "Elevada à direita",
      esquerdaAlta: "Elevada à esquerda",
    }),
  );
  // Coluna: deslocamento lateral do centro dos ombros vs centro dos quadris
  const so = m.left_shoulder && m.right_shoulder ? { x: medioX(m.left_shoulder, m.right_shoulder), y: 0, nome: "so", score: minScore(m.left_shoulder, m.right_shoulder) } as Marco : undefined;
  const qu = m.left_hip && m.right_hip ? { x: medioX(m.left_hip, m.right_hip), y: 0, nome: "qu", score: minScore(m.left_hip, m.right_hip) } as Marco : undefined;
  if (so && qu) {
    const tronco = alturaTronco(m);
    const razao = (so.x - qu.x) / tronco; // + = ombros à direita na imagem
    const conf = minScore(so, qu);
    const baixa = conf < LIMIARES.confiancaMin;
    let classificacao: string | null;
    if (baixa || Math.abs(razao) <= LIMIARES.deslocamentoTronco) classificacao = baixa ? null : "Alinhada";
    else classificacao = razao > 0 ? "Desvio lateral aparente à direita" : "Desvio lateral aparente à esquerda";
    out.push({ checkpointId: "post-coluna", rotulo: "Coluna (alinhamento)", valor: `desvio ${(razao * 100).toFixed(0)}%`, classificacao, confianca: conf, baixaConfianca: baixa });
  }
  return out.filter((x): x is MedidaPostural => !!x);
}

/** Calcula as medidas de uma vista a partir dos marcos detectados. */
export function medidasDaVista(vista: VistaPostural, marcos: Marco[]): MedidaPostural[] {
  const m = indexar(marcos);
  if (vista === "anterior") return medidasAnterior(m);
  if (vista === "lateral") return medidasLateral(m);
  return medidasPosterior(m);
}

/** Pares de marcos que ligamos com linha no esqueleto sobreposto. */
export const CONEXOES: [NomeMarco, NomeMarco][] = [
  ["left_shoulder", "right_shoulder"],
  ["left_hip", "right_hip"],
  ["left_shoulder", "left_hip"],
  ["right_shoulder", "right_hip"],
  ["left_shoulder", "left_elbow"],
  ["left_elbow", "left_wrist"],
  ["right_shoulder", "right_elbow"],
  ["right_elbow", "right_wrist"],
  ["left_hip", "left_knee"],
  ["left_knee", "left_ankle"],
  ["right_hip", "right_knee"],
  ["right_knee", "right_ankle"],
  ["left_ear", "left_shoulder"],
  ["right_ear", "right_shoulder"],
];
