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

  /* ---- Lote P1 da expansão: musculatura de apoio (manguito, quadril, core) ---- */
  "rotacao-externa-elastico": { posicao: "em pé", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: true, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: false },
  "rotacao-externa-deitado": { posicao: "deitado", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: true, unilateral: true, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: false },
  "rotacao-interna-elastico": { posicao: "em pé", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: true, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: false },
  // Scaption sobe até a ALTURA DO OMBRO de propósito: parar aí é o exercício. Por isso
  // movimentoAcimaCabeca é falso, e é o que permite prescrevê-lo a quem não pode elevar.
  scaption: { posicao: "em pé", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: false },
  "clam-shell": { posicao: "deitado", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: true, unilateral: true, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: false },
  "caminhada-lateral-elastico": { posicao: "em pé", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: false },
  "prancha-lateral": { posicao: "deitado", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: true, unilateral: true, apoioNasMaos: true, amplitudeAjustavel: true, possuiApoio: false },
  // O apoio elevado é justamente o que dispensa ir ao chão: é o motivo de existir do item.
  "prancha-apoio-banco": { posicao: "em pé", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: true, amplitudeAjustavel: true, possuiApoio: true },
  "pallof-press-polia": { posicao: "em pé", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: true, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: false },
  "pallof-press-elastico": { posicao: "em pé", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: true, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: false },
  "chop-elastico": { posicao: "em pé", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: true, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: false },
  "bird-dog": { posicao: "quatro apoios", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: true, exigeIrAoChao: true, unilateral: true, apoioNasMaos: true, amplitudeAjustavel: true, possuiApoio: false },
  // Suspenso na barra: o corpo fica vertical e todo o peso vai para as mãos.
  "elevacao-joelhos-suspenso": { posicao: "em pé", impacto: "baixo", movimentoAcimaCabeca: true, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: true, amplitudeAjustavel: true, possuiApoio: false },

  /* ---- Lote P2: elástico e peso corporal (gargalo do treino em casa) ---- */
  "agachamento-elastico": { posicao: "em pé", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: false },
  "puxada-elastico": { posicao: "ajoelhado", impacto: "baixo", movimentoAcimaCabeca: true, exigeAjoelhar: true, exigeIrAoChao: true, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: false },
  "rosca-elastico": { posicao: "em pé", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: false },
  "abducao-quadril-elastico": { posicao: "em pé", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: true, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: true },
  "extensao-quadril-elastico": { posicao: "em pé", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: true, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: true },
  "remada-unilateral-elastico": { posicao: "em pé", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: true, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: false },
  "panturrilha-sentado": { posicao: "sentado", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: true },
  "subida-step": { posicao: "em pé", impacto: "moderado", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: true, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: false },

  /* ---- Lote P2: braços e ombros ---- */
  "rosca-martelo": { posicao: "em pé", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: false, possuiApoio: false },
  "rosca-banco-inclinado": { posicao: "deitado", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: true },
  "rosca-scott-maquina": { posicao: "sentado", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: true },
  "triceps-testa-barra": { posicao: "deitado", impacto: "baixo", movimentoAcimaCabeca: true, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: false, possuiApoio: true },
  "elevacao-frontal": { posicao: "em pé", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: false },
  "crucifixo-inverso": { posicao: "em pé", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: false },
  "face-pull-polia": { posicao: "em pé", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: false },
  "encolhimento-halteres": { posicao: "em pé", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: false, possuiApoio: false },

  /* ---- Lote P2: membros inferiores ---- */
  "agachamento-bulgaro": { posicao: "em pé", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: true, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: true },
  "agachamento-goblet": { posicao: "em pé", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: false },
  "cadeira-adutora": { posicao: "sentado", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: true },
  "cadeira-abdutora": { posicao: "sentado", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: true },
  "flexora-em-pe": { posicao: "em pé", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: true, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: true },
  "hip-thrust-unilateral": { posicao: "sentado", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: true, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: true },
  "good-morning": { posicao: "em pé", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: false, possuiApoio: false },
  "leg-press-horizontal": { posicao: "sentado", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: true },
};
