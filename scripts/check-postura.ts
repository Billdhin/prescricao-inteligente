/**
 * Autoteste determinístico da geometria postural (scripts/check-postura.ts).
 * Alimenta marcos sintéticos e confere a classificação. Roda com `npx tsx`.
 * metrics.ts só tem imports de tipo, então carrega sem resolver alias.
 */
import { medidasDaVista } from "../src/lib/postura/metrics";
import type { Marco } from "../src/lib/postura/vision";

const P = (nome: string, x: number, y: number, score = 0.9): Marco => ({ nome, x, y, score });

let falhas = 0;
function conferir(rotulo: string, achado: string | null | undefined, esperado: string) {
  const ok = achado === esperado;
  if (!ok) {
    falhas++;
    console.error(`  FALHA [${rotulo}] esperado "${esperado}", veio "${achado}"`);
  } else {
    console.log(`  ok [${rotulo}] ${esperado}`);
  }
}
function classe(medidas: { checkpointId: string; classificacao: string | null }[], id: string) {
  return medidas.find((m) => m.checkpointId === id)?.classificacao;
}

// Caso 1: ombros nivelados
{
  const m = medidasDaVista("anterior", [
    P("left_eye", 0.55, 0.2), P("right_eye", 0.45, 0.2),
    P("left_shoulder", 0.6, 0.3), P("right_shoulder", 0.4, 0.3),
    P("left_hip", 0.57, 0.6), P("right_hip", 0.43, 0.6),
    P("left_knee", 0.57, 0.75), P("right_knee", 0.43, 0.75),
    P("left_ankle", 0.57, 0.92), P("right_ankle", 0.43, 0.92),
  ]);
  conferir("ombros nivelados", classe(m, "ant-ombros"), "Nivelados");
  conferir("pelve nivelada", classe(m, "ant-pelve"), "Nivelada");
  conferir("joelhos alinhados", classe(m, "ant-joelhos"), "Alinhados");
}

// Caso 2: ombro direito mais alto (menor y no lado direito)
{
  const m = medidasDaVista("anterior", [
    P("left_shoulder", 0.6, 0.33), P("right_shoulder", 0.4, 0.27),
    P("left_hip", 0.57, 0.6), P("right_hip", 0.43, 0.6),
  ]);
  conferir("ombro direito alto", classe(m, "ant-ombros"), "Direito mais alto");
}

// Caso 3: pelve elevada à esquerda (menor y no lado esquerdo)
{
  const m = medidasDaVista("anterior", [
    P("left_hip", 0.57, 0.55), P("right_hip", 0.43, 0.62),
  ]);
  conferir("pelve elevada esq", classe(m, "ant-pelve"), "Elevada à esquerda");
}

// Caso 4: joelhos em valgo (puxados para a linha média)
{
  const m = medidasDaVista("anterior", [
    P("left_hip", 0.6, 0.5), P("right_hip", 0.4, 0.5),
    P("left_knee", 0.55, 0.7), P("right_knee", 0.45, 0.7),
    P("left_ankle", 0.6, 0.9), P("right_ankle", 0.4, 0.9),
  ]);
  conferir("joelhos valgo", classe(m, "ant-joelhos"), "Valgo aparente (para dentro)");
}

// Caso 5: cabeça anteriorizada (vista lateral)
{
  const m = medidasDaVista("lateral", [
    P("left_ear", 0.55, 0.2), P("left_shoulder", 0.45, 0.3), P("left_hip", 0.45, 0.6),
    P("right_ear", 0.5, 0.2, 0.1), P("right_shoulder", 0.5, 0.3, 0.1), P("right_hip", 0.5, 0.6, 0.1),
  ]);
  conferir("cabeça anteriorizada", classe(m, "lat-cabeca"), "Anteriorização aparente");
}

// Caso 6: desvio lateral da coluna (vista posterior)
{
  const m = medidasDaVista("posterior", [
    P("left_shoulder", 0.6, 0.3), P("right_shoulder", 0.4, 0.3),
    P("left_hip", 0.55, 0.6), P("right_hip", 0.35, 0.6),
  ]);
  conferir("coluna desvio dir", classe(m, "post-coluna"), "Desvio lateral aparente à direita");
}

// Caso 7: baixa confiança não arrisca classificação
{
  const m = medidasDaVista("anterior", [
    P("left_shoulder", 0.6, 0.33, 0.1), P("right_shoulder", 0.4, 0.27, 0.1),
  ]);
  const c = classe(m, "ant-ombros");
  conferir("baixa confiança -> null", c === null ? "null" : String(c), "null");
}

if (falhas) {
  console.error(`[check:postura] ${falhas} falha(s).`);
  process.exit(1);
}
console.log("[check:postura] ok: geometria postural classifica os casos sintéticos corretamente.");
