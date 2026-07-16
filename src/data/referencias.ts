/**
 * Bibliografia curada do Motor RCD (Raciocínio Clínico Documentado).
 * Referências reais e clássicas da área — são a base citável das regras de
 * grupo, do Semáforo de Liberação e dos parâmetros de monitoramento, e são
 * impressas como bibliografia numerada no Prontuário de Decisão.
 *
 * Curadoria editorial (IP do produto): cada referência traz uma NOTA de
 * aplicação prudente — como o RCD a utiliza, sem transformá-la em conduta
 * clínica. Sempre validar a edição vigente da diretriz no contexto local.
 */

export interface Referencia {
  id: string;
  autores: string;
  titulo: string;
  fonte: string;
  ano: number;
  /** DOI verificado (PubMed), quando o trabalho tem um. Torna a citação verificável em 1 clique. */
  doi?: string;
  /** como o Motor RCD aplica esta referência (linguagem prudente) */
  nota?: string;
}

export const referencias: Referencia[] = [
  {
    id: "oms-2020",
    autores: "World Health Organization",
    titulo: "WHO guidelines on physical activity and sedentary behaviour",
    fonte: "Genebra: WHO",
    ano: 2020,
    nota: "Base das metas semanais de atividade (150–300 min moderada) usadas como referência de volume nas jornadas.",
  },
  {
    id: "acsm-getp11",
    autores: "American College of Sports Medicine",
    titulo: "ACSM's Guidelines for Exercise Testing and Prescription, 11ª ed.",
    fonte: "Filadélfia: Wolters Kluwer",
    ano: 2021,
    nota: "Referência geral de triagem pré-participação e prescrição por população; base do racional de liberação.",
  },
  {
    id: "garber-2011",
    autores: "Garber CE, Blissmer B, Deschenes MR, et al.",
    titulo:
      "Quantity and quality of exercise for developing and maintaining cardiorespiratory, musculoskeletal, and neuromotor fitness in apparently healthy adults (ACSM Position Stand)",
    fonte: "Medicine & Science in Sports & Exercise",
    ano: 2011,
    doi: "10.1249/MSS.0b013e318213fefb",
    nota: "Sustenta as faixas de séries/repetições e a progressão gradual sugeridas por objetivo.",
  },
  {
    id: "sbc-2020",
    autores: "Barroso WKS, Rodrigues CIS, Bortolotto LA, et al.",
    titulo: "Diretrizes Brasileiras de Hipertensão Arterial – 2020",
    fonte: "Arquivos Brasileiros de Cardiologia (Sociedade Brasileira de Cardiologia)",
    ano: 2021,
    nota: "Base dos limites prudentes de pressão arterial pré-sessão e da recomendação de evitar apneia/Valsalva.",
  },
  {
    id: "pescatello-2004",
    autores: "Pescatello LS, Franklin BA, Fagard R, et al.",
    titulo: "Exercise and Hypertension (ACSM Position Stand)",
    fonte: "Medicine & Science in Sports & Exercise",
    ano: 2004,
    nota: "Clássico sobre exercício e hipertensão: cargas leves a moderadas, respiração contínua, resposta pressórica.",
  },
  {
    id: "colberg-2016",
    autores: "Colberg SR, Sigal RJ, Yardley JE, et al.",
    titulo: "Physical Activity/Exercise and Diabetes: A Position Statement of the American Diabetes Association",
    fonte: "Diabetes Care",
    ano: 2016,
    doi: "10.2337/dc16-1728",
    nota: "Base dos cuidados de hipoglicemia, alimentação pré-sessão e inspeção dos pés no diabetes tipo 2.",
  },
  {
    id: "sbd-2023",
    autores: "Sociedade Brasileira de Diabetes",
    titulo: "Diretriz da SBD: Atividade física e exercício no diabetes",
    fonte: "Diretriz da Sociedade Brasileira de Diabetes (ed. vigente)",
    ano: 2023,
    nota: "Referência nacional para os sinais de alerta glicêmicos e a progressão segura no DM2.",
  },
  {
    id: "chodzko-2009",
    autores: "Chodzko-Zajko WJ, Proctor DN, Fiatarone Singh MA, et al.",
    titulo: "Exercise and Physical Activity for Older Adults (ACSM Position Stand)",
    fonte: "Medicine & Science in Sports & Exercise",
    ano: 2009,
    nota: "Base do racional de força, equilíbrio e progressões pequenas e frequentes para idosos destreinados.",
  },
  {
    id: "fragala-2019",
    autores: "Fragala MS, Cadore EL, Dorgo S, et al.",
    titulo: "Resistance Training for Older Adults: Position Statement From the NSCA",
    fonte: "Journal of Strength and Conditioning Research",
    ano: 2019,
    doi: "10.1519/JSC.0000000000003230",
    nota: "Sustenta a prioridade do treino de força em idosos (função e autonomia), com técnica antes de carga.",
  },
  {
    id: "nice-ng59",
    autores: "National Institute for Health and Care Excellence (NICE)",
    titulo: "Low back pain and sciatica in over 16s: assessment and management (NG59)",
    fonte: "Londres: NICE (2016, atualização 2020)",
    ano: 2020,
    nota: "Base das red flags de dor lombar (encaminhar) e do incentivo ao exercício na lombalgia inespecífica.",
  },
  {
    id: "oarsi-2019",
    autores: "Bannuru RR, Osani MC, Vaysbrot EE, et al.",
    titulo:
      "OARSI guidelines for the non-surgical management of knee, hip, and polyarticular osteoarthritis",
    fonte: "Osteoarthritis and Cartilage, 27(11):1578-1589",
    ano: 2019,
    doi: "10.1016/j.joca.2019.06.011",
    nota: "Sustenta exercício como tratamento central da osteoartrite e a modulação por dor/inflamação aguda.",
  },
  {
    id: "acr-2019",
    autores: "Kolasinski SL, Neogi T, Hochberg MC, et al.",
    titulo:
      "2019 American College of Rheumatology/Arthritis Foundation Guideline for the Management of Osteoarthritis of the Hand, Hip, and Knee",
    fonte: "Arthritis & Rheumatology, 72(2):220-233",
    ano: 2020,
    doi: "10.1002/art.41142",
    nota: "Reforça exercício e controle de carga na OA de joelho; base das trocas por baixo impacto.",
  },
  {
    id: "donnelly-2009",
    autores: "Donnelly JE, Blair SN, Jakicic JM, et al.",
    titulo:
      "Appropriate physical activity intervention strategies for weight loss and prevention of weight regain (ACSM Position Stand)",
    fonte: "Medicine & Science in Sports & Exercise, 41(2):459-471",
    ano: 2009,
    doi: "10.1249/MSS.0b013e3181949333",
    nota: "Volume de atividade física e emagrecimento: >250 min/sem para perda clinicamente significativa e manutenção; a força não maximiza a perda de peso, mas preserva massa magra. Base do eixo aeróbio + força.",
  },
  {
    id: "borg-1982",
    autores: "Borg GA",
    titulo: "Psychophysical bases of perceived exertion",
    fonte: "Medicine & Science in Sports & Exercise",
    ano: 1982,
    nota: "Origem da escala de percepção de esforço (PSE/CR10) usada nos parâmetros e fichas.",
  },
  {
    id: "persinger-2004",
    autores: "Persinger R, Foster C, Gibson M, et al.",
    titulo: "Consistency of the talk test for exercise prescription",
    fonte: "Medicine & Science in Sports & Exercise",
    ano: 2004,
    nota: "Valida o teste da fala como guia prático de intensidade quando a FC não é confiável.",
  },
  {
    id: "foster-2001",
    autores: "Foster C, Florhaug JA, Franklin J, et al.",
    titulo: "A new approach to monitoring exercise training",
    fonte: "Journal of Strength and Conditioning Research",
    ano: 2001,
    nota: "Base do sRPE (PSE × tempo) para estimar carga interna de sessão.",
  },
  {
    id: "warburton-2011",
    autores: "Warburton DER, Jamnik VK, Bredin SSD, Gledhill N",
    titulo: "The Physical Activity Readiness Questionnaire for Everyone (PAR-Q+)",
    fonte: "Health & Fitness Journal of Canada",
    ano: 2011,
    nota: "Inspiração do gate de triagem pré-sessão (Semáforo): perguntas simples antes de liberar o esforço.",
  },
  {
    id: "confef-254",
    autores: "Conselho Federal de Educação Física (CONFEF)",
    titulo: "Código de Ética dos Profissionais de Educação Física (Resolução CONFEF nº 307/2015)",
    fonte: "CONFEF",
    ano: 2015,
    nota: "Fundamenta o dever de diligência do profissional habilitado: o RCD documenta, o profissional decide.",
  },

  /* ---- EMG / biomecânica: base da contribuição muscular estimada ---- */
  {
    id: "boeckh-behrens-2000",
    autores: "Boeckh-Behrens WU, Buskies W",
    titulo: "Fitness-Krafttraining: die besten Übungen und Methoden für Sport und Gesundheit (estudos comparativos de EMG)",
    fonte: "Reinbek: Rowohlt",
    ano: 2000,
    nota: "Atlas de EMG comparado clássico: base das faixas relativas de ativação por exercício de musculação.",
  },
  {
    id: "schoenfeld-2010",
    autores: "Schoenfeld BJ",
    titulo: "The mechanisms of muscle hypertrophy and their application to resistance training",
    fonte: "Journal of Strength and Conditioning Research, 24(10):2857-2872",
    ano: 2010,
    doi: "10.1519/JSC.0b013e3181e840f3",
    nota: "Tensão mecânica, estresse metabólico e dano muscular como mecanismos da hipertrofia: sustenta a leitura fisiológica de volume e ênfase muscular.",
  },
  {
    id: "schoenfeld-2017-volume",
    autores: "Schoenfeld BJ, Ogborn D, Krieger JW",
    titulo: "Dose-response relationship between weekly resistance training volume and increases in muscle mass: a systematic review and meta-analysis",
    fonte: "Journal of Sports Sciences, 35(11):1073-1082",
    ano: 2017,
    doi: "10.1080/02640414.2016.1210197",
    nota: "Relação dose-resposta entre volume semanal e hipertrofia: sustenta a lógica de volume por grupo muscular nas ênfases regionais.",
  },
  {
    id: "schoenfeld-grgic-adm-2020",
    autores: "Schoenfeld BJ, Grgic J",
    titulo: "Effects of range of motion on muscle development during resistance training interventions: a systematic review",
    fonte: "SAGE Open Medicine, 8:2050312120901559",
    ano: 2020,
    doi: "10.1177/2050312120901559",
    nota: "Revisão sobre amplitude de movimento e desenvolvimento muscular: para membros inferiores, a amplitude completa tende a favorecer a hipertrofia (evidência limitada e conflitante em membros superiores).",
  },
  {
    id: "contreras-2015",
    autores: "Contreras B, Vigotsky AD, Schoenfeld BJ, et al.",
    titulo:
      "A comparison of gluteus maximus, biceps femoris, and vastus lateralis EMG activity in the back squat and barbell hip thrust",
    fonte: "Journal of Applied Biomechanics, 31(6):452-458",
    ano: 2015,
    doi: "10.1123/jab.2014-0301",
    nota: "EMG comparado glúteo/isquios/quadríceps no agachamento vs hip thrust: o hip thrust ativou mais glúteo e isquiotibiais; base da ênfase glútea.",
  },
  {
    id: "escamilla-1998",
    autores: "Escamilla RF, Fleisig GS, Zheng N, et al.",
    titulo:
      "Biomechanics of the knee during closed kinetic chain and open kinetic chain exercises",
    fonte: "Medicine & Science in Sports & Exercise, 30(4):556-569",
    ano: 1998,
    doi: "10.1097/00005768-199804000-00014",
    nota: "Cadeia fechada (leg press/agachamento) vs aberta (cadeira extensora): distribuição da carga no joelho e do recrutamento do quadríceps ao longo da flexão.",
  },
  {
    id: "escamilla-2001",
    autores: "Escamilla RF, Fleisig GS, Zheng N, et al.",
    titulo: "Effects of technique variations on knee biomechanics during the squat and leg press",
    fonte: "Medicine & Science in Sports & Exercise, 33(9):1552-1566",
    ano: 2001,
    doi: "10.1097/00005768-200109000-00020",
    nota: "Posição do pé (alta/baixa) e largura da base alteram a demanda de joelho e o recrutamento no agachamento e leg press; as forças crescem com a flexão do joelho.",
  },
  {
    id: "gullett-2009",
    autores: "Gullett JC, Tillman MD, Gutierrez GM, Chow JW",
    titulo: "A biomechanical comparison of back and front squats in healthy trained individuals",
    fonte: "Journal of Strength and Conditioning Research, 23(1):284-292",
    ano: 2009,
    doi: "10.1519/JSC.0b013e31818546bb",
    nota: "Agachamento frontal x posterior: o frontal gerou menores forças compressivas e momento extensor no joelho com recrutamento semelhante; base da leitura biomecânica do padrão.",
  },
  {
    id: "andersen-2014",
    autores: "Andersen V, Fimland MS, Wiik E, et al.",
    titulo: "Effects of grip width on muscle strength and activation in the lat pull-down",
    fonte: "Journal of Strength and Conditioning Research, 28(4):1135-1142",
    ano: 2014,
    doi: "10.1097/JSC.0000000000000232",
    nota: "EMG do latíssimo na puxada vertical: a ativação do dorsal foi semelhante entre pegadas de 1 a 2x a distância biacromial (a largura da pegada tem efeito pequeno). Base da ênfase dorsal no puxar vertical.",
  },
  {
    id: "ekstrom-2007",
    autores: "Ekstrom RA, Donatelli RA, Carp KC",
    titulo:
      "Electromyographic analysis of core trunk, hip, and thigh muscles during 9 rehabilitation exercises",
    fonte: "Journal of Orthopaedic & Sports Physical Therapy, 37(12):754-762",
    ano: 2007,
    doi: "10.2519/jospt.2007.2471",
    nota: "EMG de core, quadril e coxa em 9 exercícios (ponte, prancha, quatro apoios, afundo, step-up): quais servem mais para força e quais para estabilização/resistência.",
  },
  {
    id: "rodriguez-ridao-2020",
    autores: "Rodríguez-Ridao D, Antequera-Vique JA, Martín-Fuentes I, Muyor JM",
    titulo:
      "Effect of five bench inclinations on the electromyographic activity of the pectoralis major, anterior deltoid, and triceps brachii during the bench press exercise",
    fonte: "International Journal of Environmental Research and Public Health, 17(19):7339",
    ano: 2020,
    doi: "10.3390/ijerph17197339",
    nota: "EMG de peitoral/deltoide/tríceps no supino por inclinação: o supino horizontal ativa bem o peitoral, 30° enfatiza a porção superior e acima de 45° cresce o deltoide anterior. Base da ênfase no empurrar horizontal.",
  },
  {
    id: "mcgill-2010",
    autores: "McGill SM",
    titulo: "Core training: evidence translating to better performance and injury prevention",
    fonte: "Strength and Conditioning Journal",
    ano: 2010,
    nota: "Estabilidade de tronco e resistência ao movimento: base da prancha e do dead bug (anti-extensão).",
  },
  {
    id: "boyer-2014",
    autores: "Boyer ER, Rooney BD, Derrick TR",
    titulo: "Rearfoot and midfoot or forefoot impacts in habitually shod runners",
    fonte: "Medicine & Science in Sports & Exercise, 46(7):1384-1391",
    ano: 2014,
    doi: "10.1249/MSS.0000000000000234",
    nota: "Forças de reação e taxa de carga no impacto da corrida: base para classificar impacto alto (corrida/salto) x baixo (caminhada, bike, água) na etapa de restrições.",
  },
  {
    id: "wallace-2002",
    autores: "Wallace DA, Salem GJ, Salinas R, Powers CM",
    titulo: "Patellofemoral joint kinetics while squatting with and without an external load",
    fonte: "Journal of Orthopaedic & Sports Physical Therapy, 32(4):141-148",
    ano: 2002,
    doi: "10.2519/jospt.2002.32.4.141",
    nota: "O estresse femoropatelar cresce com o ângulo de flexão do joelho e com a carga: base do cuidado com profundidade e carga na queixa de joelho.",
  },
  {
    id: "dossantos-2021",
    autores: "Dos Santos JJ, Nagy RO, Souza MA, Intelangelo L, Barbosa MA, Silveira-Nunes G, Barbosa AC",
    titulo: "Scapular retraction under adduction load: an alternative to overhead exercises",
    fonte: "International Journal of Environmental Research and Public Health, 18(17):9251",
    ano: 2021,
    doi: "10.3390/ijerph18179251",
    nota: "Exercícios acima da cabeça geram forças compressivas no espaço subacromial: base para reduzir movimento overhead na queixa de ombro e preferir alternativas.",
  },
];

export function getReferencia(id: string) {
  return referencias.find((r) => r.id === id);
}

/** Formato curto para citação inline: "Autor (ano)". */
export function refCurta(id: string) {
  const r = getReferencia(id);
  if (!r) return "";
  const primeiro = r.autores.split(",")[0].split(" e ")[0];
  return `${primeiro} (${r.ano})`;
}

/** Bibliografia numerada estável (ordem de aparição) a partir de uma lista de ids. */
export function bibliografia(ids: string[]): { n: number; ref: Referencia }[] {
  const vistos: string[] = [];
  for (const id of ids) if (!vistos.includes(id) && getReferencia(id)) vistos.push(id);
  return vistos.map((id, i) => ({ n: i + 1, ref: getReferencia(id)! }));
}
