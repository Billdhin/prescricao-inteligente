import type { Exercise, EficMetric } from "./types";

/**
 * Sétima expansão do catálogo (e91 em diante): LOTES H, J, K e L.
 *
 * O fecho da matriz de cobertura. Escápula (serrátil e trapézio inferior), tornozelo
 * e pé (tibial anterior e propriocepção), antebraço e pegada, pescoço e respiração.
 * Depois destes onze, nenhum músculo da matriz do `check:catalogo` fica em zero,
 * salvo os de baixa prioridade declarados em `docs/catalogo-completude.md`.
 *
 * São os exercícios de menor apelo e de maior consequência: ninguém procura
 * "protração escapular", mas é o que falta quando o ombro do aluno não sobe.
 */

/** Métricas nos eixos que o motor lê. `musculo` precisa bater com o primário de `ativacao`. */
const m = (
  musculo: string,
  ativ: number,
  complex: number,
  lombar: number,
  joelho: number,
  ombro: number,
  mobil: number,
): EficMetric[] => [
  { nome: musculo, valor: ativ, tipo: "positivo" },
  { nome: "Complexidade técnica", valor: complex, tipo: "cautela" },
  { nome: "Demanda lombar", valor: lombar, tipo: "cautela" },
  { nome: "Demanda de joelho", valor: joelho, tipo: "cautela" },
  { nome: "Demanda de ombro", valor: ombro, tipo: "cautela" },
  { nome: "Requisito de mobilidade", valor: mobil, tipo: "cautela" },
];

export const extraExercises7: Exercise[] = [
  /* ======================= LOTE H: ESCÁPULA ======================= */
  {
    id: "e91",
    slug: "serratus-punch",
    nome: "Protração escapular com elástico",
    grupoMuscular: "Ombros",
    equipamento: "Elástico",
    objetivo: ["Retorno ao treino", "Aprendizado técnico"],
    nivel: "Iniciante",
    articulacaoPredominante: "Ombro e escápula",
    restricoes: ["Ombro sensível"],
    premium: false,
    resumoPratico:
      "Empurrar à frente e continuar empurrando com a escápula: o serrátil anterior nunca aparece como alvo em treino comum, e é ele que gira a escápula para o braço subir.",
    anguloArticular: "Ombro a 90 graus de flexão, protração escapular",
    modalidade: "m-funcional",
    ativacao: [
      { musculo: "Serrátil anterior", percentual: 65, papel: "primário" },
      { musculo: "Peitoral maior", percentual: 30, papel: "sinergista" },
      { musculo: "Deltoide anterior", percentual: 28, papel: "sinergista" },
    ],
    indiceEficiencia: { score: 72, metrics: m("Serrátil anterior", 65, 30, 10, 5, 25, 22) },
    fases: [
      { nome: "Posição", descricao: "Elástico preso atrás do corpo, braço estendido à frente na altura do ombro." },
      { nome: "Protração", descricao: "Empurra a mão mais para frente afastando a escápula da coluna, sem dobrar o cotovelo." },
      { nome: "Retorno", descricao: "Deixa a escápula voltar devagar, sem soltar de uma vez." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 34,
        titulo: "O braço já está estendido",
        camadas: {
          resumo: "O movimento acontece depois que o cotovelo já está reto: quem se move é a escápula.",
          biomecanica:
            "O serrátil anterior puxa a escápula contra a caixa torácica e a gira para cima. Sem ele, a escápula descola e o braço não completa a elevação.",
          fisiologia:
            "É um músculo que quase nunca recebe estímulo direto, e a fraqueza dele aparece como dificuldade de levantar o braço acima da cabeça.",
          evidencia:
            "Ekstrom e colaboradores mediram exercícios para trapézio e serrátil anterior por eletromiografia e descrevem quais posições recrutam cada porção.",
          cuidados: "Se o cotovelo dobra, o exercício virou empurrar e o serrátil saiu.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Dificuldade de levantar o braço acima da cabeça sem compensar.",
        "Escápula que descola da caixa torácica ao empurrar.",
        "Aquecimento antes de desenvolvimento e de supino.",
      ],
      quandoEvitar: [
        "Dor no ombro que aparece já na posição inicial.",
        "Fixação instável atrás do corpo.",
      ],
      errosComuns: [
        "Dobrar o cotovelo e transformar em empurrar comum.",
        "Encolher o ombro na direção da orelha durante a protração.",
        "Usar elástico grosso, que impede o movimento fino da escápula.",
      ],
      variacoes: [
        "Deitado com halter leve: mais fácil de sentir o movimento.",
        "Na parede com bola: dá referência tátil.",
        "Com pausa de 2 s protraído: reforça o fim da amplitude.",
      ],
    },
    conteudo: {
      visaoGeral:
        "O serrátil aparecia em dois exercícios do catálogo, sempre como estabilizador. Este é o primeiro em que ele é o alvo, e ele importa porque é quem permite o braço subir.",
      biomecanica:
        "A protração escapular acontece com o braço já estendido à frente. É um movimento de amplitude curta e de percepção difícil, o que exige carga leve e atenção.",
      fisiologia:
        "Trabalho de controle motor e resistência. O resultado aparece como melhora do ritmo entre escápula e úmero, não como aumento de carga.",
      prescricaoPratica:
        "Em geral, 2 a 3 séries de 12 a 15 repetições com elástico leve e pausa de 2 s no fim. Elástico grosso impede o movimento que se quer treinar.",
    },
    trustLevel: "princípio biomecânico",
    temCena: false,
  },

  {
    id: "e92",
    slug: "wall-slide",
    nome: "Deslizamento na parede",
    grupoMuscular: "Ombros",
    equipamento: "Peso corporal",
    objetivo: ["Aprendizado técnico", "Retorno ao treino"],
    nivel: "Iniciante",
    articulacaoPredominante: "Ombro e escápula",
    restricoes: ["Ombro sensível"],
    premium: false,
    resumoPratico:
      "Subir os antebraços pela parede mantendo o contato: ensina a escápula a girar junto com o braço, sem carga nenhuma.",
    anguloArticular: "Elevação de ombro com rotação escapular acompanhando",
    modalidade: "m-funcional",
    ativacao: [
      { musculo: "Serrátil anterior", percentual: 55, papel: "primário" },
      { musculo: "Trapézio inferior", percentual: 50, papel: "sinergista" },
      { musculo: "Trapézio médio", percentual: 35, papel: "sinergista" },
      { musculo: "Deltoide anterior", percentual: 25, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 70, metrics: m("Serrátil anterior", 55, 25, 8, 5, 20, 30) },
    fases: [
      { nome: "Posição", descricao: "De frente para a parede, antebraços encostados na altura do peito, cotovelos a 90 graus." },
      { nome: "Subida", descricao: "Desliza os antebraços para cima mantendo o contato com a parede e as costelas baixas." },
      { nome: "Descida", descricao: "Desce devagar pelo mesmo caminho, sem perder o contato." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 30,
        titulo: "As costelas ficam baixas",
        camadas: {
          resumo: "Se as costelas sobem, quem ganhou amplitude foi a lombar, não o ombro.",
          biomecanica:
            "Para o braço subir acima da cabeça, a escápula precisa girar para cima. Quando essa rotação falta, o corpo compensa arqueando a coluna torácica e as costelas se projetam.",
          fisiologia:
            "É trabalho de coordenação entre serrátil e trapézio inferior, e não de força: por isso não leva carga.",
          evidencia:
            "Ekstrom e colaboradores documentam por eletromiografia quais exercícios recrutam o trapézio inferior e o serrátil anterior.",
          cuidados: "Amplitude só até onde o contato com a parede se mantiver.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Aluno que compensa com a lombar ao levantar o braço.",
        "Aquecimento antes de desenvolvimento e de puxada.",
        "Retorno ao treino de ombro, antes de qualquer carga.",
      ],
      quandoEvitar: [
        "Dor no ombro já na posição inicial.",
        "Aluno que não mantém o contato dos antebraços nem no primeiro terço.",
      ],
      errosComuns: [
        "Projetar as costelas para frente para subir mais.",
        "Perder o contato dos antebraços com a parede.",
        "Encolher os ombros na direção da orelha.",
      ],
      variacoes: [
        "Amplitude curta: primeira etapa.",
        "Com elástico entre os punhos: acrescenta demanda de rotação externa.",
        "Com pausa de 2 s no alto: reforça o fim da amplitude.",
      ],
    },
    conteudo: {
      visaoGeral:
        "É o exercício mais simples do catálogo e um dos mais úteis: sem carga, sem equipamento, e resolve o problema de quem não consegue levantar o braço sem compensar.",
      biomecanica:
        "A parede dá referência tátil constante. Manter os antebraços em contato obriga a escápula a girar de verdade, em vez de deixar a coluna compensar.",
      fisiologia:
        "Ganho de coordenação, não de força. O efeito aparece como melhora da amplitude de ombro em outros exercícios.",
      prescricaoPratica:
        "Em geral, 2 séries de 8 a 12 repetições lentas, como aquecimento. Amplitude só até onde o contato se mantiver, e nunca até a dor.",
    },
    trustLevel: "princípio biomecânico",
    temCena: false,
  },

  {
    id: "e93",
    slug: "y-raise-banco",
    nome: "Elevação em Y no banco inclinado",
    grupoMuscular: "Ombros",
    equipamento: "Halter",
    objetivo: ["Hipertrofia", "Aprendizado técnico"],
    nivel: "Intermediário",
    articulacaoPredominante: "Ombro e escápula",
    restricoes: ["Ombro sensível"],
    premium: false,
    resumoPratico:
      "Deitado de bruços no banco inclinado, os braços sobem em Y: a posição que recruta o trapézio inferior, que estava em zero no catálogo.",
    anguloArticular: "Elevação a cerca de 120 graus na diagonal do corpo",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Trapézio inferior", percentual: 62, papel: "primário" },
      { musculo: "Trapézio médio", percentual: 45, papel: "sinergista" },
      { musculo: "Deltoide posterior", percentual: 40, papel: "sinergista" },
      { musculo: "Serrátil anterior", percentual: 30, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 74, metrics: m("Trapézio inferior", 62, 35, 15, 5, 32, 35) },
    fases: [
      { nome: "Posição", descricao: "De bruços no banco a cerca de 30 graus, halteres leves pendurados, polegares para cima." },
      { nome: "Elevação", descricao: "Sobe os braços na diagonal formando um Y, sem encolher os ombros." },
      { nome: "Descida", descricao: "Desce em 3 segundos pelo mesmo caminho." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 34,
        titulo: "Y, não T",
        camadas: {
          resumo: "A diagonal do Y é o que coloca o trapézio inferior em vantagem.",
          biomecanica:
            "As fibras inferiores do trapézio correm na diagonal, de baixo para cima em direção à escápula. Elevar o braço nessa mesma linha as coloca na direção de tração.",
          fisiologia:
            "Encolher o ombro durante o movimento troca o trapézio inferior pelo superior, que é justamente o já bem servido.",
          evidencia:
            "Ekstrom e colaboradores mediram por eletromiografia os exercícios que recrutam o trapézio inferior e descrevem a elevação em diagonal entre os mais eficazes.",
          cuidados: "Carga muito leve é a regra: halter pesado devolve o movimento ao trapézio superior.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Trapézio inferior como alvo, que nenhum outro exercício do catálogo cobre.",
        "Aluno com ombro que compensa subindo na direção da orelha.",
        "Complemento de saúde do ombro em quem faz muito volume de empurrar.",
      ],
      quandoEvitar: [
        "Dor no ombro que aparece na elevação em diagonal.",
        "Aluno que não consegue subir sem encolher o ombro nem sem carga.",
      ],
      errosComuns: [
        "Encolher o ombro na direção da orelha durante a subida.",
        "Usar carga alta e transformar em elevação de trapézio superior.",
        "Subir em T em vez de Y, mudando o músculo alvo.",
      ],
      variacoes: [
        "Sem carga: primeira etapa, para achar a linha.",
        "No solo, de bruços: alternativa quando não há banco.",
        "Com pausa de 2 s no alto: reforça o fim da amplitude.",
      ],
    },
    conteudo: {
      visaoGeral:
        "O trapézio inferior estava em zero na matriz de cobertura, e ele é peça central do ritmo entre escápula e úmero. Sem ele, o ombro compensa e a dor aparece.",
      biomecanica:
        "A linha do Y coincide com a direção das fibras inferiores do trapézio, que puxam a escápula para baixo e a ajudam a girar para cima quando o braço sobe.",
      fisiologia:
        "É trabalho de baixa carga e volume moderado. O objetivo é reequilibrar o ritmo escapular, não ganhar força bruta.",
      prescricaoPratica:
        "Em geral, 2 a 3 séries de 12 a 15 repetições com halter muito leve, às vezes sem carga nenhuma. Se o ombro encolhe, tire o peso.",
    },
    trustLevel: "princípio biomecânico",
    temCena: false,
  },

  {
    id: "e94",
    slug: "retracao-escapular-polia",
    nome: "Retração escapular na polia",
    grupoMuscular: "Costas",
    equipamento: "Polia",
    objetivo: ["Aprendizado técnico", "Retorno ao treino", "Resistência muscular"],
    nivel: "Iniciante",
    articulacaoPredominante: "Ombro e escápula",
    restricoes: [],
    premium: false,
    resumoPratico:
      "Só juntar as escápulas, sem dobrar o cotovelo: separa o movimento de escápula do movimento de braço, que é o que a remada mistura.",
    anguloArticular: "Retração escapular pura, cotovelo estendido",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Trapézio médio", percentual: 65, papel: "primário" },
      { musculo: "Romboides", percentual: 60, papel: "sinergista" },
      { musculo: "Trapézio inferior", percentual: 35, papel: "sinergista" },
    ],
    indiceEficiencia: { score: 73, metrics: m("Trapézio médio", 65, 20, 12, 5, 20, 20) },
    fases: [
      { nome: "Posição", descricao: "Sentado de frente para a polia, braços estendidos segurando a barra na altura do peito." },
      { nome: "Retração", descricao: "Junta as escápulas mantendo os cotovelos estendidos, sem inclinar o tronco." },
      { nome: "Retorno", descricao: "Deixa as escápulas se afastarem devagar, sem soltar a carga." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 40,
        titulo: "O cotovelo fica reto",
        camadas: {
          resumo: "Se o cotovelo dobra, virou remada e a escápula deixou de ser o alvo.",
          biomecanica:
            "Na remada, a retração escapular e a flexão de cotovelo acontecem juntas, e o aluno pode fazer a maior parte com o braço. Aqui a escápula não tem como se esconder.",
          fisiologia:
            "É o exercício de aprendizado da retração, e serve de preparação para que a remada e a puxada sejam bem executadas.",
          evidencia:
            "Ekstrom e colaboradores documentam por eletromiografia os exercícios de trapézio médio e romboides e a diferença entre retração isolada e remada.",
          cuidados: "Amplitude é pequena de propósito: mais que isso é o tronco compensando.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Aluno que puxa só com o braço em toda remada.",
        "Aquecimento antes de remada e de puxada.",
        "Retorno ao treino de tronco superior, com carga leve.",
      ],
      quandoEvitar: [
        "Aluno que já executa a remada com retração clara, porque então é redundante.",
        "Carga que só permite executar dobrando o cotovelo.",
      ],
      errosComuns: [
        "Dobrar o cotovelo e transformar em remada.",
        "Inclinar o tronco para trás para ganhar amplitude.",
        "Encolher os ombros na direção da orelha durante a retração.",
      ],
      variacoes: [
        "Com elástico: mais fácil de fazer em casa.",
        "Um braço por vez: expõe assimetria escapular.",
        "Com pausa de 2 s retraído: reforça a percepção do movimento.",
      ],
    },
    conteudo: {
      visaoGeral:
        "Romboides e trapézio médio apareciam sempre como sinergistas de remada, nunca como alvo. Este exercício isola o movimento e serve principalmente para ensinar.",
      biomecanica:
        "A retração escapular aproxima as escápulas da coluna. Com o cotovelo estendido, nenhuma parte do movimento pode ser feita pelo braço.",
      fisiologia:
        "A amplitude é pequena e a carga é baixa. O valor está na transferência: quem aprende a retrair executa melhor todas as remadas e puxadas do plano.",
      prescricaoPratica:
        "Em geral, 2 a 3 séries de 12 a 15 repetições com pausa de 2 s. Use como aquecimento antes do trabalho de costas, e não como exercício principal.",
    },
    trustLevel: "princípio biomecânico",
    temCena: false,
  },

  /* ==================== LOTE J: TORNOZELO E PÉ ==================== */
  {
    id: "e95",
    slug: "dorsiflexao-elastico",
    nome: "Dorsiflexão com elástico",
    grupoMuscular: "Tornozelo e pé",
    equipamento: "Elástico",
    objetivo: ["Retorno ao treino", "Resistência muscular"],
    nivel: "Iniciante",
    articulacaoPredominante: "Tornozelo",
    restricoes: [],
    premium: false,
    resumoPratico:
      "Puxar a ponta do pé para cima contra o elástico: o tibial anterior é o antagonista da panturrilha e estava em zero no catálogo.",
    anguloArticular: "Dorsiflexão de tornozelo em amplitude completa",
    modalidade: "m-funcional",
    ativacao: [
      { musculo: "Tibial anterior", percentual: 65, papel: "primário" },
      { musculo: "Fibulares (estabilizadores do tornozelo)", percentual: 30, papel: "sinergista" },
    ],
    indiceEficiencia: { score: 68, metrics: m("Tibial anterior", 65, 10, 5, 8, 5, 15) },
    fases: [
      { nome: "Posição", descricao: "Sentado com a perna estendida, elástico preso à frente e passando pelo peito do pé." },
      { nome: "Dorsiflexão", descricao: "Puxa a ponta do pé na direção da canela até a amplitude máxima." },
      { nome: "Retorno", descricao: "Solta devagar até a posição inicial, sem deixar o elástico puxar." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 82,
        titulo: "O músculo que segura o pé na caminhada",
        camadas: {
          resumo: "O tibial anterior impede o pé de bater no chão a cada passo.",
          biomecanica:
            "Na fase de balanço da marcha, o tibial anterior mantém a ponta do pé levantada. Quando ele falha, o pé arrasta ou bate, o que aumenta o risco de tropeço.",
          fisiologia:
            "É um dos músculos mais associados a quedas em idosos, e não recebia estímulo nenhum no catálogo.",
          evidencia:
            "O ACSM inclui o trabalho de tornozelo e o de equilíbrio entre os componentes da prescrição para idosos, junto com força e aeróbio.",
          cuidados: "Cãibra na canela nas primeiras sessões é comum e cede com séries mais curtas.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Idoso com histórico de tropeço ou de queda.",
        "Retorno ao treino depois de entorse de tornozelo, com liberação.",
        "Equilíbrio do trabalho de panturrilha, que sem isso fica só de um lado.",
      ],
      quandoEvitar: [
        "Dor aguda na frente da perna sem avaliação.",
        "Entorse recente sem liberação.",
      ],
      errosComuns: [
        "Girar o pé para dentro ou para fora em vez de puxar reto.",
        "Amplitude curta, que anula o exercício.",
        "Deixar o elástico puxar o pé de volta sem controle.",
      ],
      variacoes: [
        "Sem elástico: primeira sessão, só com o peso do pé.",
        "Com pausa de 2 s no alto: mais tempo sob tensão.",
        "Em pé com o calcanhar apoiado: alternativa quando sentar é difícil.",
      ],
    },
    conteudo: {
      visaoGeral:
        "O catálogo tinha quatro exercícios de panturrilha e nenhum do lado oposto do tornozelo. O tibial anterior estava em zero, e ele é o músculo que evita tropeço.",
      biomecanica:
        "A dorsiflexão levanta a ponta do pé. É o movimento oposto ao da panturrilha, e por isso o desequilíbrio entre os dois passa despercebido em qualquer treino comum.",
      fisiologia:
        "Trabalho de resistência com carga muito baixa. O ganho relevante é funcional, na fase de balanço da marcha.",
      prescricaoPratica:
        "Em geral, 2 a 3 séries de 15 a 20 repetições por pé com elástico leve. Amplitude completa vale mais que carga.",
    },
    trustLevel: "princípio biomecânico",
    temCena: false,
  },

  {
    id: "e96",
    slug: "equilibrio-unipodal",
    nome: "Equilíbrio em um pé",
    grupoMuscular: "Tornozelo e pé",
    equipamento: "Peso corporal",
    objetivo: ["Retorno ao treino", "Aprendizado técnico"],
    nivel: "Iniciante",
    articulacaoPredominante: "Tornozelo",
    restricoes: [],
    premium: false,
    resumoPratico:
      "Ficar sobre um pé só, com progressão de dificuldade: o único trabalho de equilíbrio do catálogo, e o mais citado na prevenção de quedas.",
    anguloArticular: "Apoio unipodal com joelho em leve flexão",
    modalidade: "m-funcional",
    ativacao: [
      { musculo: "Fibulares (estabilizadores do tornozelo)", percentual: 55, papel: "primário" },
      { musculo: "Tibial anterior", percentual: 45, papel: "sinergista" },
      { musculo: "Glúteo médio", percentual: 42, papel: "sinergista" },
      { musculo: "Quadríceps", percentual: 30, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 71, metrics: m("Fibulares (estabilizadores do tornozelo)", 55, 20, 10, 15, 5, 25) },
    fases: [
      { nome: "Posição", descricao: "Em pé perto de uma parede ou cadeira, peso sobre um pé só, joelho em leve flexão." },
      { nome: "Sustentação", descricao: "Mantém o equilíbrio com o mínimo de oscilação, olhando para frente." },
      { nome: "Troca", descricao: "Apoia o outro pé e repete do outro lado." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 70,
        titulo: "A progressão é tirar informação",
        camadas: {
          resumo: "Fechar os olhos ou pisar em superfície macia é mais difícil que ficar mais tempo.",
          biomecanica:
            "O equilíbrio combina visão, sistema vestibular e sensação do pé. Retirar a visão ou alterar a superfície força os outros dois a compensar.",
          fisiologia:
            "É treino de controle motor, e a progressão útil vem da dificuldade da tarefa, não do tempo acumulado.",
          evidencia:
            "As diretrizes de atividade física para idosos incluem treino de equilíbrio como componente próprio, ao lado de força e aeróbio.",
          cuidados: "Sempre perto de um apoio, sobretudo nas versões de olhos fechados.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Idoso com histórico de queda ou medo de cair.",
        "Retorno ao treino depois de entorse de tornozelo.",
        "Aquecimento antes de exercícios unilaterais.",
      ],
      quandoEvitar: [
        "Tontura ou vertigem em investigação.",
        "Ambiente sem apoio próximo.",
      ],
      errosComuns: [
        "Fazer longe de qualquer apoio.",
        "Progredir só o tempo em vez da dificuldade da tarefa.",
        "Olhar para o chão em vez de manter o olhar à frente.",
      ],
      variacoes: [
        "Com dois dedos na parede: primeira etapa.",
        "De olhos fechados: retira a informação visual.",
        "Sobre um tapete dobrado: altera a superfície de apoio.",
      ],
    },
    conteudo: {
      visaoGeral:
        "Equilíbrio é componente próprio da prescrição para idosos e não existia no catálogo. Este item resolve, e é o exercício de menor custo de execução de toda a base.",
      biomecanica:
        "No apoio unipodal, os estabilizadores do tornozelo corrigem a oscilação a todo momento, e o glúteo médio sustenta a bacia nivelada.",
      fisiologia:
        "O ganho é neuromuscular e específico da tarefa: melhora aparece na condição treinada, o que justifica variar as versões.",
      prescricaoPratica:
        "Em geral, 3 séries de 20 a 30 s por pé, sempre perto de um apoio. Progrida retirando informação (olhos, superfície) antes de aumentar o tempo.",
    },
    trustLevel: "regra pedagógica",
    temCena: false,
  },

  /* ============ LOTE K: ANTEBRAÇO, PEGADA E CARREGAMENTO ============ */
  {
    id: "e97",
    slug: "punho-halter",
    nome: "Flexão e extensão de punho com halter",
    grupoMuscular: "Braços",
    equipamento: "Halter",
    objetivo: ["Hipertrofia", "Resistência muscular", "Retorno ao treino"],
    nivel: "Iniciante",
    articulacaoPredominante: "Cotovelo",
    restricoes: [],
    premium: false,
    resumoPratico:
      "Antebraço apoiado no banco, só o punho se move: os dois grupos do antebraço estavam em zero no catálogo.",
    anguloArticular: "Flexão e extensão de punho em amplitude completa",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Flexores do punho", percentual: 65, papel: "primário" },
      { musculo: "Extensores do punho", percentual: 60, papel: "primário" },
      { musculo: "Braquiorradial", percentual: 30, papel: "sinergista" },
    ],
    indiceEficiencia: { score: 66, metrics: m("Flexores do punho", 65, 10, 5, 5, 8, 12) },
    fases: [
      { nome: "Posição", descricao: "Sentado com o antebraço apoiado na coxa ou no banco, punho para fora da borda." },
      { nome: "Flexão", descricao: "Sobe o punho com a palma para cima, em amplitude completa." },
      { nome: "Extensão", descricao: "Vira a palma para baixo e repete o movimento no sentido oposto." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 42,
        titulo: "Os dois lados, não só um",
        camadas: {
          resumo: "Treinar só a flexão aumenta o desequilíbrio que já existe.",
          biomecanica:
            "Toda pegada treina os flexores do punho de forma indireta. Os extensores só recebem estímulo quando são treinados de propósito.",
          fisiologia:
            "O desequilíbrio entre os dois grupos é comum em quem usa teclado e em quem faz muito volume de pegada, e costuma aparecer como desconforto no cotovelo.",
          evidencia:
            "Boeckh-Behrens e Buskies documentam por eletromiografia os exercícios de antebraço e a separação entre flexores e extensores.",
          cuidados: "Carga muito leve é a regra: o punho não tolera alavanca alta.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Desconforto no cotovelo em quem faz muito volume de pegada.",
        "Retorno ao treino depois de queixa de punho, com liberação.",
        "Complemento de pegada num plano com farmer walk e barra fixa.",
      ],
      quandoEvitar: [
        "Dor aguda no punho sem avaliação.",
        "Amplitude que provoca formigamento na mão.",
      ],
      errosComuns: [
        "Treinar só a flexão e ignorar a extensão.",
        "Usar carga alta, que o punho não suporta com esse braço de alavanca.",
        "Mover o cotovelo em vez de mover só o punho.",
      ],
      variacoes: [
        "Só extensores: quando o desequilíbrio é claro.",
        "Com elástico: mais fácil de fazer em casa.",
        "Com pausa de 2 s no fim: mais tempo sob tensão.",
      ],
    },
    conteudo: {
      visaoGeral:
        "Flexores e extensores do punho estavam ambos em zero na matriz. Este item cobre os dois no mesmo exercício, o que é raro e é o motivo do formato escolhido.",
      biomecanica:
        "Com o antebraço apoiado, a única articulação livre é o punho. Girar a palma muda qual grupo trabalha, e é por isso que o exercício tem duas metades.",
      fisiologia:
        "É o trabalho mais direto de antebraço do catálogo, e o único que dá aos extensores um estímulo próprio.",
      prescricaoPratica:
        "Em geral, 2 a 3 séries de 15 a 20 repetições em cada sentido, com carga muito leve. Se o punho incomodar, reduza a amplitude antes de reduzir as repetições.",
    },
    trustLevel: "regra pedagógica",
    temCena: false,
  },

  {
    id: "e98",
    slug: "farmer-walk",
    nome: "Caminhada do fazendeiro",
    grupoMuscular: "Corpo todo",
    equipamento: "Halter",
    objetivo: ["Força", "Resistência muscular"],
    nivel: "Intermediário",
    articulacaoPredominante: "Ombro e tronco",
    restricoes: ["Dor lombar"],
    premium: false,
    resumoPratico:
      "Caminhar segurando peso nas duas mãos: pegada, trapézio e core na mesma tarefa, e o exercício mais parecido com carregar compras.",
    anguloArticular: "Postura ereta com carga suspensa nas mãos",
    imagem: "/exercises/farmer-walk.webp",
    modalidade: "m-funcional",
    ativacao: [
      { musculo: "Flexores do punho", percentual: 70, papel: "primário" },
      { musculo: "Trapézio superior", percentual: 55, papel: "sinergista" },
      { musculo: "Eretores da espinha", percentual: 50, papel: "sinergista" },
      { musculo: "Transverso do abdome", percentual: 45, papel: "estabilizador" },
      { musculo: "Glúteo médio", percentual: 35, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 80, metrics: m("Flexores do punho", 70, 20, 45, 15, 30, 15) },
    fases: [
      { nome: "Pegada", descricao: "Halteres ao lado do corpo, ombros para trás e tronco ereto." },
      { nome: "Caminhada", descricao: "Passos curtos e firmes por uma distância definida, sem inclinar o tronco." },
      { nome: "Descarga", descricao: "Desce os halteres com o quadril, não com a coluna." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 46,
        titulo: "O tronco não balança",
        camadas: {
          resumo: "Carga igual nas duas mãos, tronco parado: o core trabalha o tempo todo.",
          biomecanica:
            "A carga suspensa puxa os ombros para baixo e para frente. Manter o tronco ereto exige contração contínua de eretores e abdômen durante toda a distância.",
          fisiologia:
            "É um dos poucos exercícios que treinam pegada, postura e core na mesma tarefa, e o mais transferível para carregar peso na vida real.",
          evidencia:
            "McGill descreve os exercícios de carregamento como treino de estabilidade de tronco com transferência funcional alta.",
          cuidados: "A pegada costuma falhar primeiro, e é isso que define a distância.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Quando o plano precisa de pegada e de core na mesma tarefa.",
        "Transferência para carregar peso no dia a dia.",
        "Fim de sessão, como trabalho de estabilidade sob fadiga.",
      ],
      quandoEvitar: [
        "Dor lombar que aparece ao segurar peso em pé.",
        "Piso escorregadio ou espaço sem distância livre.",
      ],
      errosComuns: [
        "Inclinar o tronco para o lado durante a caminhada.",
        "Dar passos longos, que aumentam a oscilação.",
        "Descer os halteres arredondando a coluna no fim.",
      ],
      variacoes: [
        "Distância curta com carga alta: ênfase em pegada.",
        "Distância longa com carga moderada: ênfase em resistência de tronco.",
        "Com halteres acima da cabeça: versão avançada, muito mais exigente.",
      ],
    },
    conteudo: {
      visaoGeral:
        "Pegada estava em zero na matriz de cobertura e é um dos preditores mais citados de capacidade funcional. Este exercício resolve isso e ainda treina postura e core.",
      biomecanica:
        "A carga vertical nas mãos comprime a coluna e puxa os ombros. Eretores, abdômen e trapézio trabalham em isometria enquanto as pernas caminham.",
      fisiologia:
        "A pegada costuma ser o fator limitante, e é ela que determina quando a série acaba. Isso é característica, não defeito.",
      prescricaoPratica:
        "Em geral, 3 a 4 percursos de 20 a 40 m com carga que permita chegar ao fim sem inclinar o tronco. Se a mão abre antes, reduza a carga.",
    },
    trustLevel: "princípio biomecânico",
    temCena: false,
  },

  {
    id: "e99",
    slug: "suitcase-carry",
    nome: "Carregamento unilateral",
    grupoMuscular: "Core (tronco)",
    equipamento: "Halter",
    objetivo: ["Força", "Resistência muscular"],
    nivel: "Intermediário",
    articulacaoPredominante: "Quadril e coluna",
    restricoes: ["Dor lombar"],
    premium: false,
    resumoPratico:
      "Caminhar com peso em uma mão só: o quadrado lombar do lado oposto trabalha o percurso inteiro para o tronco não tombar.",
    anguloArticular: "Postura ereta com carga assimétrica",
    imagem: "/exercises/suitcase-carry.webp",
    modalidade: "m-funcional",
    ativacao: [
      { musculo: "Quadrado lombar", percentual: 60, papel: "primário" },
      { musculo: "Oblíquos", percentual: 55, papel: "sinergista" },
      { musculo: "Glúteo médio", percentual: 45, papel: "sinergista" },
      { musculo: "Flexores do punho", percentual: 55, papel: "estabilizador" },
      { musculo: "Eretores da espinha", percentual: 40, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 79, metrics: m("Quadrado lombar", 60, 30, 45, 12, 25, 15) },
    fases: [
      { nome: "Pegada", descricao: "Halter em uma mão só, ombros nivelados e tronco ereto." },
      { nome: "Caminhada", descricao: "Percorre a distância sem inclinar o tronco para nenhum lado." },
      { nome: "Troca", descricao: "Descarrega com o quadril e repete com a outra mão." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 46,
        titulo: "O lado que trabalha é o que está vazio",
        camadas: {
          resumo: "A musculatura do lado SEM peso é a que impede o tronco de tombar.",
          biomecanica:
            "A carga de um lado cria um momento de flexão lateral. O quadrado lombar e os oblíquos do lado oposto resistem, o que faz deste um exercício anti-flexão lateral em pé.",
          fisiologia:
            "É o mesmo padrão da prancha lateral, com a vantagem de acontecer em pé e de treinar a pegada junto.",
          evidencia:
            "McGill descreve o carregamento unilateral entre os exercícios de estabilidade de tronco com transferência funcional alta.",
          cuidados: "Inclinar para o lado do peso anula o exercício por completo.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Anti-flexão lateral em pé, complementando a prancha lateral.",
        "Transferência para carregar bolsa ou sacola de um lado só.",
        "Correção de assimetria de tronco.",
      ],
      quandoEvitar: [
        "Dor lombar que aparece com carga assimétrica.",
        "Piso escorregadio ou espaço sem distância livre.",
      ],
      errosComuns: [
        "Inclinar o tronco para o lado do peso.",
        "Elevar o ombro do lado carregado.",
        "Fazer distâncias diferentes de cada lado.",
      ],
      variacoes: [
        "Distância curta com carga alta: ênfase em pegada e em resistência lateral.",
        "Parado em pé por tempo: versão isométrica.",
        "Com halter acima do ombro: versão avançada.",
      ],
    },
    conteudo: {
      visaoGeral:
        "O quadrado lombar aparecia só na prancha lateral. Este exercício o treina em pé, no padrão exato de quem carrega bolsa de um lado só todos os dias.",
      biomecanica:
        "A assimetria de carga é o exercício. Quanto maior o peso, maior o momento que o lado oposto precisa anular para o tronco ficar ereto.",
      fisiologia:
        "Treina tronco, pegada e postura numa tarefa só, com transferência direta para a vida cotidiana.",
      prescricaoPratica:
        "Em geral, 3 percursos de 20 a 30 m por lado, com a mesma distância dos dois lados. Se o tronco inclina, a carga está alta.",
    },
    trustLevel: "princípio biomecânico",
    temCena: false,
  },

  /* ================== LOTE L: CERVICAL E RESPIRAÇÃO ================== */
  {
    id: "e100",
    slug: "chin-tuck",
    nome: "Retração cervical",
    grupoMuscular: "Pescoço",
    equipamento: "Peso corporal",
    objetivo: ["Aprendizado técnico", "Retorno ao treino"],
    nivel: "Iniciante",
    articulacaoPredominante: "Coluna cervical",
    restricoes: [],
    premium: false,
    resumoPratico:
      "Levar o queixo para trás sem inclinar a cabeça: controle motor dos flexores profundos do pescoço, sem carga nenhuma.",
    anguloArticular: "Retração cervical em amplitude curta",
    modalidade: "m-funcional",
    ativacao: [
      { musculo: "Flexores profundos do pescoço", percentual: 45, papel: "primário" },
    ],
    indiceEficiencia: { score: 64, metrics: m("Flexores profundos do pescoço", 45, 20, 5, 5, 8, 12) },
    fases: [
      { nome: "Posição", descricao: "Sentado ou em pé, olhar à frente e ombros relaxados." },
      { nome: "Retração", descricao: "Leva o queixo para trás, como se fizesse papada, sem baixar a cabeça." },
      { nome: "Retorno", descricao: "Solta devagar até a posição neutra." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 16,
        titulo: "Para trás, não para baixo",
        camadas: {
          resumo: "Baixar o queixo é flexão de pescoço, e é outro movimento.",
          biomecanica:
            "A retração desliza a cabeça para trás sobre o pescoço. Baixar o queixo inclina a cabeça, o que envolve músculos diferentes e não treina os profundos.",
          fisiologia:
            "Os flexores profundos são músculos de resistência postural, e por isso o trabalho é de tempo e de repetição, nunca de carga.",
          evidencia:
            "O produto trata este item como controle motor: carga cervical direta pede avaliação específica que a ferramenta não faz.",
          cuidados: "Qualquer tontura ou formigamento durante o movimento encerra a série e pede encaminhamento.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Aluno com queixa postural de cabeça projetada à frente.",
        "Pausas ao longo do dia em quem trabalha sentado.",
        "Retorno ao treino de tronco superior, como parte do aquecimento.",
      ],
      quandoEvitar: [
        "Dor cervical em investigação.",
        "Tontura, formigamento ou alteração visual durante o movimento.",
      ],
      errosComuns: [
        "Baixar o queixo em vez de levar a cabeça para trás.",
        "Fazer com força, quando o exercício é de precisão.",
        "Contrair os ombros junto com o pescoço.",
      ],
      variacoes: [
        "Deitado de costas: a cabeça apoiada dá referência.",
        "Encostado na parede: referência tátil na nuca.",
        "Com pausa de 5 s: aumenta o componente de resistência.",
      ],
    },
    conteudo: {
      visaoGeral:
        "Único item de pescoço do catálogo, e de propósito: treino cervical com carga pede avaliação que o produto não faz. Este é controle motor puro.",
      biomecanica:
        "A retração cervical desliza a cabeça sobre a coluna sem inclinar. É um movimento de amplitude curta e de percepção difícil, e por isso a referência tátil ajuda.",
      fisiologia:
        "Os flexores profundos sustentam a cabeça o dia inteiro. O ganho relevante é de resistência postural, e aparece ao longo de semanas.",
      prescricaoPratica:
        "Em geral, 2 séries de 10 repetições com pausa de 3 a 5 s, várias vezes ao dia. Qualquer sintoma neurológico encerra a série e pede encaminhamento.",
    },
    trustLevel: "cuidado de segurança",
    temCena: false,
  },

  {
    id: "e101",
    slug: "respiracao-360",
    nome: "Respiração diafragmática 360 graus",
    grupoMuscular: "Core (tronco)",
    equipamento: "Peso corporal",
    objetivo: ["Aprendizado técnico", "Retorno ao treino"],
    nivel: "Iniciante",
    articulacaoPredominante: "Coluna (estabilidade) + quadril e ombro",
    restricoes: [],
    premium: false,
    resumoPratico:
      "Respirar expandindo as costelas para todos os lados: o diafragma é parte do core e nenhum exercício do catálogo o alcançava.",
    anguloArticular: "Expansão torácica sem movimento de coluna",
    modalidade: "m-funcional",
    ativacao: [
      { musculo: "Diafragma", percentual: 55, papel: "primário" },
      { musculo: "Transverso do abdome", percentual: 40, papel: "sinergista" },
      { musculo: "Oblíquos", percentual: 25, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 66, metrics: m("Diafragma", 55, 25, 5, 5, 5, 10) },
    fases: [
      { nome: "Posição", descricao: "Deitado de costas com os joelhos dobrados, mãos nas laterais das costelas." },
      { nome: "Inspiração", descricao: "Puxa o ar pelo nariz sentindo as costelas se abrirem para os lados e para trás." },
      { nome: "Expiração", descricao: "Solta o ar devagar pela boca, sentindo as costelas descerem." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 42,
        titulo: "As costelas abrem para os lados",
        camadas: {
          resumo: "Se só a barriga sobe, a respiração ainda não é diafragmática de verdade.",
          biomecanica:
            "O diafragma desce e as costelas inferiores giram para fora, aumentando o volume da caixa em todas as direções. Elevar os ombros indica respiração superior.",
          fisiologia:
            "O diafragma participa da estabilização do tronco junto com o transverso do abdome. Quando a respiração é só superior, essa contribuição se perde.",
          evidencia:
            "McGill descreve a relação entre padrão respiratório e estabilidade de tronco no treino de core.",
          cuidados: "Tontura durante a série indica hiperventilação: reduza o ritmo.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Aluno que prende a respiração em todo exercício de core.",
        "Retorno ao treino, como primeiro passo do trabalho de tronco.",
        "Início de sessão, para organizar o padrão respiratório.",
      ],
      quandoEvitar: [
        "Aluno com dificuldade respiratória em investigação.",
        "Ambiente que não permita deitar com conforto, na versão inicial.",
      ],
      errosComuns: [
        "Elevar os ombros na inspiração.",
        "Empurrar só a barriga para cima, sem abrir as costelas.",
        "Respirar rápido demais e provocar tontura.",
      ],
      variacoes: [
        "Sentado: quando deitar não é opção.",
        "Com elástico em volta das costelas: dá referência tátil.",
        "Em quatro apoios: acrescenta a demanda de manter a posição.",
      ],
    },
    conteudo: {
      visaoGeral:
        "O diafragma estava em zero na matriz de cobertura. Não é exercício de força e não pretende ser: é o pré-requisito para que os demais exercícios de core sejam feitos sem prender a respiração.",
      biomecanica:
        "A expansão em todas as direções acontece quando o diafragma desce e as costelas inferiores giram para fora. A mão nas laterais é a forma mais simples de conferir.",
      fisiologia:
        "O diafragma trabalha junto com o transverso do abdome na estabilização do tronco, e o padrão respiratório superior desfaz essa parceria.",
      prescricaoPratica:
        "Em geral, 2 séries de 8 a 10 respirações lentas no início da sessão de core. Serve também como recurso entre séries em quem prende a respiração.",
    },
    trustLevel: "regra pedagógica",
    temCena: false,
  },
];
