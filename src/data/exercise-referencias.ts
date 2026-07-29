/**
 * Respaldo científico por exercício — ids de referencias.ts que documentam o
 * PADRÃO de envolvimento muscular e a biomecânica de cada movimento. É a base
 * citável da "Contribuição muscular" e do "Índice de Eficiência".
 *
 * IMPORTANTE (honestidade científica): os percentuais exibidos são de ATIVAÇÃO
 * RELATIVA ESTIMADA, sintetizada desta literatura de EMG e biomecânica — não são
 * medições do aluno nem números extraídos de um único estudo. Servem para
 * comparar ênfase entre exercícios, não como valor absoluto. Sempre validar com
 * a diretriz e o contexto do aluno.
 */

export const exerciseReferencias: Record<string, string[]> = {
  // Musculação — EMG/biomecânica
  "leg-press-45": ["escamilla-1998", "escamilla-2001", "boeckh-behrens-2000"],
  "agachamento-livre": ["gullett-2009", "contreras-2015", "escamilla-2001"],
  "supino-reto-barra": ["rodriguez-ridao-2020", "boeckh-behrens-2000", "schoenfeld-2010"],
  "cadeira-extensora": ["escamilla-1998", "boeckh-behrens-2000"],
  "mesa-flexora": ["boeckh-behrens-2000", "schoenfeld-2010"],
  "levantamento-terra-romeno": ["ekstrom-2007", "contreras-2015", "boeckh-behrens-2000"],
  "hip-thrust": ["contreras-2015", "ekstrom-2007"],
  "afundo-passada": ["boeckh-behrens-2000", "schoenfeld-2010"],
  "puxada-alta": ["andersen-2014", "boeckh-behrens-2000"],
  "remada-baixa": ["boeckh-behrens-2000", "andersen-2014"],
  "desenvolvimento-ombros": ["boeckh-behrens-2000", "schoenfeld-2010"],
  "rosca-direta": ["boeckh-behrens-2000", "schoenfeld-2010"],
  "triceps-polia": ["boeckh-behrens-2000", "schoenfeld-2010"],
  "panturrilha-em-pe": ["boeckh-behrens-2000", "schoenfeld-2010"],
  "remada-elastica": ["andersen-2014", "boeckh-behrens-2000"],

  // Cardio / baixo impacto — prescrição aeróbia
  "caminhada-esteira": ["acsm-getp11", "garber-2011"],
  "bicicleta-ergometrica": ["acsm-getp11", "garber-2011"],
  eliptico: ["acsm-getp11", "garber-2011"],
  "marcha-aquatica": ["acsm-getp11", "donnelly-2009"],

  // Manguito rotador e ombro (lote P1 da expansão)
  "rotacao-externa-elastico": ["reinold-2004"],
  "rotacao-externa-deitado": ["reinold-2004"],
  scaption: ["reinold-2007", "reinold-2004"],
  // "rotacao-interna-elastico" fica SEM referência de propósito: o subescapular é
  // profundo e os estudos de eletromiografia de superfície não o isolam. Citar aqui o
  // estudo de rotação EXTERNA seria emprestar respaldo de um movimento para o outro.

  // Estabilizadores do quadril
  "clam-shell": ["distefano-2009"],
  "caminhada-lateral-elastico": ["distefano-2009"],

  // Core em pé e antirrotação
  "prancha-lateral": ["mcgill-2010", "ekstrom-2007"],
  "prancha-apoio-banco": ["mcgill-2010"],
  "pallof-press-polia": ["mcgill-2010"],
  "pallof-press-elastico": ["mcgill-2010"],
  "chop-elastico": ["mcgill-2010"],
  "bird-dog": ["ekstrom-2007", "mcgill-2010"],
  "elevacao-joelhos-suspenso": ["mcgill-2010"],

  // Lote P2: elástico, braços, ombros e membros inferiores
  "agachamento-elastico": ["escamilla-2001", "gullett-2009"],
  "puxada-elastico": ["andersen-2014"],
  "rosca-elastico": ["schoenfeld-2010", "boeckh-behrens-2000"],
  "abducao-quadril-elastico": ["distefano-2009"],
  "extensao-quadril-elastico": ["contreras-2015"],
  "remada-unilateral-elastico": ["andersen-2014", "boeckh-behrens-2000"],
  "subida-step": ["ekstrom-2007"],
  "rosca-martelo": ["boeckh-behrens-2000"],
  "rosca-banco-inclinado": ["schoenfeld-2010"],
  "rosca-scott-maquina": ["boeckh-behrens-2000"],
  "triceps-testa-barra": ["schoenfeld-2010", "boeckh-behrens-2000"],
  "elevacao-frontal": ["boeckh-behrens-2000"],
  "crucifixo-inverso": ["reinold-2004", "boeckh-behrens-2000"],
  "face-pull-polia": ["reinold-2004"],
  "encolhimento-halteres": ["boeckh-behrens-2000"],
  "agachamento-bulgaro": ["distefano-2009", "escamilla-2001"],
  "agachamento-goblet": ["escamilla-2001", "gullett-2009"],
  "cadeira-adutora": ["boeckh-behrens-2000"],
  "cadeira-abdutora": ["distefano-2009"],
  "flexora-em-pe": ["boeckh-behrens-2000"],
  "hip-thrust-unilateral": ["contreras-2015", "distefano-2009"],
  "good-morning": ["mcgill-2010", "contreras-2015"],
  "leg-press-horizontal": ["escamilla-1998", "escamilla-2001"],
  // "panturrilha-sentado" fica sem referência: a separação entre gastrocnêmio e sóleo
  // pela posição do joelho é fato anatômico, não achado de um estudo específico, e a
  // base não tem um trabalho de EMG de panturrilha verificado para citar aqui.

  // Funcional / core / idoso
  "sentar-levantar": ["ekstrom-2007", "chodzko-2009", "fragala-2019"],
  "ponte-gluteos": ["ekstrom-2007", "contreras-2015"],
  "prancha-frontal": ["mcgill-2010", "ekstrom-2007"],
  "dead-bug": ["mcgill-2010", "ekstrom-2007"],
};

export function getExercicioRefs(slug: string): string[] {
  return exerciseReferencias[slug] ?? [];
}
