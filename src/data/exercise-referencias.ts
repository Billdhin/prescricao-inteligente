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

  // Lote P3: profundidade em peitorais e costas, aeróbio, escápula e apoio
  "supino-inclinado-halteres": ["rodriguez-ridao-2020", "schoenfeld-2010"],
  "crucifixo-maquina": ["boeckh-behrens-2000"],
  "crossover-polia": ["boeckh-behrens-2000", "schoenfeld-2010"],
  "flexao-apoio-elevado": ["rodriguez-ridao-2020"],
  "puxada-supinada": ["andersen-2014", "boeckh-behrens-2000"],
  "pullover-polia": ["boeckh-behrens-2000"],
  "remada-cavalinho": ["boeckh-behrens-2000", "mcgill-2010"],
  "levantamento-terra": ["mcgill-2010", "contreras-2015", "escamilla-2001"],
  "remo-ergometro": ["acsm-getp11", "garber-2011"],
  "escada-ergometrica": ["acsm-getp11", "garber-2011"],
  "caminhada-plana": ["oms-2020", "acsm-getp11", "garber-2011"],
  "corrida-aquatica": ["acsm-getp11", "donnelly-2009"],
  "bicicleta-reclinada": ["acsm-getp11", "garber-2011"],
  "abdominal-polia-alta": ["mcgill-2010"],
  "serratus-punch": ["ekstrom-2007"],
  "wall-slide": ["ekstrom-2007"],
  "y-raise-banco": ["ekstrom-2007"],
  "retracao-escapular-polia": ["ekstrom-2007"],
  "dorsiflexao-elastico": ["acsm-getp11", "chodzko-2009"],
  "equilibrio-unipodal": ["chodzko-2009", "acsm-getp11"],
  "punho-halter": ["boeckh-behrens-2000"],
  "farmer-walk": ["mcgill-2010"],
  "suitcase-carry": ["mcgill-2010"],
  "respiracao-360": ["mcgill-2010"],
  // "chin-tuck" fica sem referência: o produto o trata como controle motor e NÃO
  // prescreve carga cervical, que pediria avaliação que a ferramenta não faz.

  // Funcional / core / idoso
  "sentar-levantar": ["ekstrom-2007", "chodzko-2009", "fragala-2019"],
  "ponte-gluteos": ["ekstrom-2007", "contreras-2015"],
  "prancha-frontal": ["mcgill-2010", "ekstrom-2007"],
  "dead-bug": ["mcgill-2010", "ekstrom-2007"],

  // Lote base (extra2): peito, ombro, costas, tríceps e aquático. As atribuições
  // seguem a precedência já usada acima para cada padrão de movimento (empurrar
  // horizontal = rodriguez-ridao-2020; puxar/remar = andersen-2014 + atlas de EMG;
  // ombro/braço = boeckh-behrens-2000/schoenfeld-2010; aquático = acsm/donnelly).
  "flexao-de-braco": ["rodriguez-ridao-2020", "boeckh-behrens-2000"],
  "supino-halteres": ["rodriguez-ridao-2020", "boeckh-behrens-2000", "schoenfeld-2010"],
  "supino-maquina": ["rodriguez-ridao-2020", "boeckh-behrens-2000"],
  "elevacao-lateral-halteres": ["boeckh-behrens-2000", "schoenfeld-2010"],
  "desenvolvimento-maquina": ["boeckh-behrens-2000", "schoenfeld-2010"],
  "remada-curvada-halteres": ["andersen-2014", "boeckh-behrens-2000"],
  "remada-maquina": ["andersen-2014", "boeckh-behrens-2000"],
  "triceps-frances-halter": ["schoenfeld-2010", "boeckh-behrens-2000"],
  "remada-invertida": ["andersen-2014", "boeckh-behrens-2000"],
  "desenvolvimento-elastico": ["boeckh-behrens-2000"],
  "mergulho-no-banco": ["boeckh-behrens-2000", "schoenfeld-2010"],
  "empurra-puxa-aquatico": ["acsm-getp11", "donnelly-2009"],
};

export function getExercicioRefs(slug: string): string[] {
  return exerciseReferencias[slug] ?? [];
}
