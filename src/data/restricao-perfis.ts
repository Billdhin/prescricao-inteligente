import type { RestricaoPerfilExercicio } from "./types";

/**
 * Perfil de cada exercício frente às restrições físicas (etapa 4 do Prescrever).
 *
 * São FATOS estruturais do movimento, autorados por inspeção (posição do corpo, se
 * exige ajoelhar, se leva o peso às mãos, se há apoio). Determinístico, sem número
 * biomecânico inventado. A única classificação de julgamento é `impacto`, que segue a
 * literatura de forças de reação do solo: corrida e saltos = alto; caminhada, bicicleta,
 * elíptico, água e a maioria da musculação = baixo (ver referencias.ts: boyer-2014).
 * Esta base não tem exercícios de alto impacto, então uma restrição de impacto rebaixa
 * o que é moderado (afundo) e prioriza o baixo, sem precisar excluir nada por invenção.
 *
 * Ligado aos exercícios em exercises.ts por slug (map ao montar o array).
 */
export const RESTRICAO_PERFIS: Record<string, RestricaoPerfilExercicio> = {
  "leg-press-45": { posicao: "sentado", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: true },
  "agachamento-livre": { posicao: "em pé", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: false, possuiApoio: false },
  "supino-reto-barra": { posicao: "deitado", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: false, possuiApoio: true },
  "cadeira-extensora": { posicao: "sentado", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: true },
  "mesa-flexora": { posicao: "deitado", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: true },
  "levantamento-terra-romeno": { posicao: "em pé", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: false, possuiApoio: false },
  "hip-thrust": { posicao: "sentado", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: true },
  "afundo-passada": { posicao: "em pé", impacto: "moderado", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: true, apoioNasMaos: false, amplitudeAjustavel: false, possuiApoio: false },
  "puxada-alta": { posicao: "sentado", impacto: "baixo", movimentoAcimaCabeca: true, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: true },
  "remada-baixa": { posicao: "sentado", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: true },
  "desenvolvimento-ombros": { posicao: "sentado", impacto: "baixo", movimentoAcimaCabeca: true, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: false, possuiApoio: true },
  "rosca-direta": { posicao: "em pé", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: false, possuiApoio: false },
  "triceps-polia": { posicao: "em pé", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: false },
  "caminhada-esteira": { posicao: "em pé", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: true },
  "bicicleta-ergometrica": { posicao: "sentado", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: true },
  eliptico: { posicao: "em pé", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: true },
  "marcha-aquatica": { posicao: "em pé", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: false },
  "sentar-levantar": { posicao: "sentado", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: true },
  "ponte-gluteos": { posicao: "deitado", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: true, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: false },
  "prancha-frontal": { posicao: "deitado", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: true, unilateral: false, apoioNasMaos: true, amplitudeAjustavel: false, possuiApoio: false },
  "dead-bug": { posicao: "deitado", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: true, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: false },
  "remada-elastica": { posicao: "sentado", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: false },
  "panturrilha-em-pe": { posicao: "em pé", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: true },
  "flexao-de-braco": { posicao: "deitado", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: true, unilateral: false, apoioNasMaos: true, amplitudeAjustavel: true, possuiApoio: false },
  "supino-halteres": { posicao: "deitado", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: false, possuiApoio: true },
  "supino-maquina": { posicao: "sentado", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: true },
  "elevacao-lateral-halteres": { posicao: "em pé", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: false, possuiApoio: false },
  "desenvolvimento-maquina": { posicao: "sentado", impacto: "baixo", movimentoAcimaCabeca: true, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: true },
  "remada-curvada-halteres": { posicao: "em pé", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: false, possuiApoio: false },
  "remada-maquina": { posicao: "sentado", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: true },
  "triceps-frances-halter": { posicao: "sentado", impacto: "baixo", movimentoAcimaCabeca: true, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: false, possuiApoio: false },
  "remada-invertida": { posicao: "deitado", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: false },
  "desenvolvimento-elastico": { posicao: "em pé", impacto: "baixo", movimentoAcimaCabeca: true, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: false },
  "mergulho-no-banco": { posicao: "sentado", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: true, amplitudeAjustavel: true, possuiApoio: true },
  "empurra-puxa-aquatico": { posicao: "em pé", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: false },
};
