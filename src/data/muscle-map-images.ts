/**
 * Mapas musculares por exercício — imagem já GERADA com os músculos marcados (Lovable
 * img2img sobre a MESMA figura cinza anatômica), com a intensidade codificada por tom de
 * azul (claro = baixa ativação → azul-marinho = ativação muito alta). Cada imagem foi
 * verificada cientificamente (músculo correto, sem "vazamento" para regiões não ativadas,
 * gradação de intensidade visível). Quando uma vista não existe (o exercício não recruta
 * a cadeia daquele lado — ex.: rosca só tem frente; terra romeno só tem costas), a figura
 * cinza neutra é usada como fallback pelo componente.
 * Arquivos em public/anatomy/mm/<slug>-{front,back}.webp
 */
export const muscleMapImages: Record<string, { front?: string; back?: string }> = {
  "leg-press-45": { front: "/anatomy/mm/leg-press-45-front.webp", back: "/anatomy/mm/leg-press-45-back.webp" },
  "agachamento-livre": { front: "/anatomy/mm/agachamento-livre-front.webp", back: "/anatomy/mm/agachamento-livre-back.webp" },
  "supino-reto-barra": { front: "/anatomy/mm/supino-reto-barra-front.webp", back: "/anatomy/mm/supino-reto-barra-back.webp" },
  "cadeira-extensora": { front: "/anatomy/mm/cadeira-extensora-front.webp" },
  "mesa-flexora": { front: "/anatomy/mm/mesa-flexora-front.webp", back: "/anatomy/mm/mesa-flexora-back.webp" },
  "levantamento-terra-romeno": { back: "/anatomy/mm/levantamento-terra-romeno-back.webp" },
  "hip-thrust": { front: "/anatomy/mm/hip-thrust-front.webp", back: "/anatomy/mm/hip-thrust-back.webp" },
  "afundo-passada": { front: "/anatomy/mm/afundo-passada-front.webp", back: "/anatomy/mm/afundo-passada-back.webp" },
  "puxada-alta": { front: "/anatomy/mm/puxada-alta-front.webp", back: "/anatomy/mm/puxada-alta-back.webp" },
  "remada-baixa": { front: "/anatomy/mm/remada-baixa-front.webp", back: "/anatomy/mm/remada-baixa-back.webp" },
  "desenvolvimento-ombros": { front: "/anatomy/mm/desenvolvimento-ombros-front.webp", back: "/anatomy/mm/desenvolvimento-ombros-back.webp" },
  "rosca-direta": { front: "/anatomy/mm/rosca-direta-front.webp" },
  "triceps-polia": { back: "/anatomy/mm/triceps-polia-back.webp" },
  "caminhada-esteira": { front: "/anatomy/mm/caminhada-esteira-front.webp", back: "/anatomy/mm/caminhada-esteira-back.webp" },
  "bicicleta-ergometrica": { front: "/anatomy/mm/bicicleta-ergometrica-front.webp", back: "/anatomy/mm/bicicleta-ergometrica-back.webp" },
  "eliptico": { front: "/anatomy/mm/eliptico-front.webp", back: "/anatomy/mm/eliptico-back.webp" },
  "marcha-aquatica": { front: "/anatomy/mm/marcha-aquatica-front.webp", back: "/anatomy/mm/marcha-aquatica-back.webp" },
  "sentar-levantar": { front: "/anatomy/mm/sentar-levantar-front.webp", back: "/anatomy/mm/sentar-levantar-back.webp" },
  "ponte-gluteos": { front: "/anatomy/mm/ponte-gluteos-front.webp", back: "/anatomy/mm/ponte-gluteos-back.webp" },
  "prancha-frontal": { front: "/anatomy/mm/prancha-frontal-front.webp", back: "/anatomy/mm/prancha-frontal-back.webp" },
  "dead-bug": { front: "/anatomy/mm/dead-bug-front.webp" },
  "remada-elastica": { front: "/anatomy/mm/remada-elastica-front.webp", back: "/anatomy/mm/remada-elastica-back.webp" },
  "panturrilha-em-pe": { front: "/anatomy/mm/panturrilha-em-pe-front.webp", back: "/anatomy/mm/panturrilha-em-pe-back.webp" },
  "flexao-de-braco": { front: "/anatomy/mm/flexao-de-braco-front.webp", back: "/anatomy/mm/flexao-de-braco-back.webp" },
  "supino-halteres": { front: "/anatomy/mm/supino-halteres-front.webp", back: "/anatomy/mm/supino-halteres-back.webp" },
  "supino-maquina": { front: "/anatomy/mm/supino-maquina-front.webp", back: "/anatomy/mm/supino-maquina-back.webp" },
  "remada-maquina": { front: "/anatomy/mm/remada-maquina-front.webp", back: "/anatomy/mm/remada-maquina-back.webp" },
  "elevacao-lateral-halteres": { front: "/anatomy/mm/elevacao-lateral-halteres-front.webp" },
  "agachamento-goblet": { front: "/anatomy/mm/agachamento-goblet-front.webp" },
  "agachamento-bulgaro": { front: "/anatomy/mm/agachamento-bulgaro-front.webp", back: "/anatomy/mm/agachamento-bulgaro-back.webp" },
  "subida-step": { front: "/anatomy/mm/subida-step-front.webp", back: "/anatomy/mm/subida-step-back.webp" },
  "desenvolvimento-maquina": { front: "/anatomy/mm/desenvolvimento-maquina-front.webp", back: "/anatomy/mm/desenvolvimento-maquina-back.webp" },
  "remada-curvada-halteres": { front: "/anatomy/mm/remada-curvada-halteres-front.webp", back: "/anatomy/mm/remada-curvada-halteres-back.webp" },
  "triceps-frances-halter": { back: "/anatomy/mm/triceps-frances-halter-back.webp" },
  /*
   * PADRÃO IDÊNTICO SE COPIA, NÃO SE GERA. Os pares abaixo têm a MESMA matriz de
   * ativação (mesmos músculos, mesmos papéis) de um exercício já aprovado, então o
   * arquivo é cópia byte a byte do mapa aprovado: determinístico, sem custo e sem risco
   * de o gerador inventar. Quando a matriz difere em qualquer músculo, gera-se de novo.
   */
  "flexao-apoio-elevado": { front: "/anatomy/mm/flexao-apoio-elevado-front.webp", back: "/anatomy/mm/flexao-apoio-elevado-back.webp" },
  "triceps-testa-barra": { back: "/anatomy/mm/triceps-testa-barra-back.webp" },
  "supino-inclinado-halteres": { front: "/anatomy/mm/supino-inclinado-halteres-front.webp", back: "/anatomy/mm/supino-inclinado-halteres-back.webp" },
  "leg-press-horizontal": { front: "/anatomy/mm/leg-press-horizontal-front.webp", back: "/anatomy/mm/leg-press-horizontal-back.webp" },
  "agachamento-elastico": { front: "/anatomy/mm/agachamento-elastico-front.webp", back: "/anatomy/mm/agachamento-elastico-back.webp" },
  // As três roscas dividem a mesma matriz (bíceps primário, braquial e braquiorradial
  // sinergistas): gerada uma vez para a rosca com elástico e copiada para as irmãs.
  "rosca-elastico": { front: "/anatomy/mm/rosca-elastico-front.webp" },
  "rosca-scott-maquina": { front: "/anatomy/mm/rosca-scott-maquina-front.webp" },
  "rosca-banco-inclinado": { front: "/anatomy/mm/rosca-banco-inclinado-front.webp" },
};

export function getMuscleMapImages(slug?: string) {
  return slug ? muscleMapImages[slug] : undefined;
}

/**
 * Boneco NA POSIÇÃO do exercício (mesma figura cinza com os músculos em azul, reposicionada
 * via img2img — verificada uma a uma). Quando o slug está na lista, o MuscleMap mostra o boneco
 * posado no lugar das vistas em pé. Arquivos em public/anatomy/mmp/<slug>.webp
 */
const SLUGS_COM_POSE: string[] = [
  "leg-press-45",
  "agachamento-livre",
  "supino-reto-barra",
  "cadeira-extensora",
  "mesa-flexora",
  "levantamento-terra-romeno",
  "hip-thrust",
  "afundo-passada",
  "puxada-alta",
  "remada-baixa",
  "desenvolvimento-ombros",
  "rosca-direta",
  "triceps-polia",
  "caminhada-esteira",
  "bicicleta-ergometrica",
  "eliptico",
  "marcha-aquatica",
  "sentar-levantar",
  "ponte-gluteos",
  "prancha-frontal",
  "prancha-lateral",
  "prancha-apoio-banco",
  "bird-dog",
  "puxada-elastico",
  "elevacao-joelhos-suspenso",
  "agachamento-elastico",
  "abducao-quadril-elastico",
  "rosca-elastico",
  "remada-unilateral-elastico",
  "extensao-quadril-elastico",
  "panturrilha-sentado",
  "subida-step",
  "rosca-martelo",
  "rosca-banco-inclinado",
  "rosca-scott-maquina",
  "triceps-testa-barra",
  "elevacao-frontal",
  "face-pull-polia",
  "encolhimento-halteres",
  "agachamento-bulgaro",
  "agachamento-goblet",
  "cadeira-abdutora",
  "flexora-em-pe",
  "hip-thrust-unilateral",
  "good-morning",
  "supino-inclinado-halteres",
  "leg-press-horizontal",
  "crucifixo-maquina",
  "crossover-polia",
  "flexao-apoio-elevado",
  "pullover-polia",
  "remada-cavalinho",
  "remo-ergometro",
  "escada-ergometrica",
  "caminhada-plana",
  "corrida-aquatica",
  "bicicleta-reclinada",
  "equilibrio-unipodal",
  "farmer-walk",
  "abdominal-polia-alta",
  "dorsiflexao-elastico",
  "punho-halter",
  "dead-bug",
  "remada-elastica",
  "panturrilha-em-pe",
  "empurra-puxa-aquatico",
  "flexao-de-braco",
  "supino-halteres",
  "supino-maquina",
  "desenvolvimento-maquina",
  "desenvolvimento-elastico",
  "elevacao-lateral-halteres",
  "remada-curvada-halteres",
  "remada-maquina",
  "remada-invertida",
  "triceps-frances-halter",
  "mergulho-no-banco",
];

export function getMuscleMapPose(slug?: string): string | undefined {
  return slug && SLUGS_COM_POSE.includes(slug) ? `/anatomy/mmp/${slug}.webp` : undefined;
}
