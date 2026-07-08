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

  // Funcional / core / idoso
  "sentar-levantar": ["ekstrom-2007", "chodzko-2009", "fragala-2019"],
  "ponte-gluteos": ["ekstrom-2007", "contreras-2015"],
  "prancha-frontal": ["mcgill-2010", "ekstrom-2007"],
  "dead-bug": ["mcgill-2010", "ekstrom-2007"],
};

export function getExercicioRefs(slug: string): string[] {
  return exerciseReferencias[slug] ?? [];
}
