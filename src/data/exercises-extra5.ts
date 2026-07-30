import type { Exercise, EficMetric } from "./types";

/**
 * Quinta expansão do catálogo (e69 em diante): LOTE E, membros inferiores.
 *
 * Membros inferiores já era o grupo mais profundo do catálogo, com 12 itens, mas os
 * PADRÕES estavam desequilibrados: nenhum unilateral com carga, nenhum trabalho de
 * adutor, nenhuma flexora sem deitar e nenhuma entrada de leg press mais fácil para
 * quem tem dificuldade de sentar e levantar. São essas oito lacunas.
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

export const extraExercises5: Exercise[] = [
  {
    id: "e69",
    slug: "agachamento-bulgaro",
    nome: "Agachamento búlgaro",
    grupoMuscular: "Membros inferiores",
    equipamento: "Halter",
    objetivo: ["Hipertrofia", "Força"],
    nivel: "Intermediário",
    articulacaoPredominante: "Joelho e quadril",
    restricoes: ["Dor no joelho", "Requer mobilidade de tornozelo e quadril"],
    premium: false,
    resumoPratico:
      "Com o pé de trás apoiado num banco, quase todo o peso vai para a perna da frente: unilateral com carga, que o catálogo não tinha.",
    anguloArticular: "Flexão profunda de joelho e quadril na perna da frente",
    imagem: "/exercises/agachamento-bulgaro.webp",
    imagemAnalise: "/exercises/agachamento-bulgaro-analysis.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Quadríceps", percentual: 75, papel: "primário" },
      { musculo: "Glúteo máximo", percentual: 68, papel: "primário" },
      { musculo: "Glúteo médio", percentual: 48, papel: "sinergista" },
      { musculo: "Isquiotibiais", percentual: 42, papel: "sinergista" },
      { musculo: "Eretores da espinha", percentual: 30, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 84, metrics: m("Quadríceps", 75, 55, 25, 50, 8, 60) },
    fases: [
      { nome: "Posição", descricao: "Pé de trás sobre um banco, pé da frente afastado o suficiente para o joelho não passar muito da ponta." },
      { nome: "Descida", descricao: "Desce em linha reta até a coxa da frente ficar próxima do paralelo, tronco levemente inclinado." },
      { nome: "Subida", descricao: "Empurra o chão com o pé da frente até estender quadril e joelho." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 60,
        titulo: "A distância do banco decide tudo",
        camadas: {
          resumo: "Pé mais à frente é mais glúteo; mais perto do banco é mais quadríceps.",
          biomecanica:
            "Afastar o pé da frente aumenta a flexão de quadril e o braço de alavanca do glúteo. Aproximar aumenta a flexão de joelho e a exigência do quadríceps.",
          fisiologia:
            "É o exercício unilateral de maior carga do catálogo, e o glúteo médio da perna de apoio trabalha o tempo todo para manter a bacia nivelada.",
          evidencia:
            "Distefano e colaboradores mediram 59 a 64% da contração máxima de glúteo médio e máximo em agachamento e terra unilaterais, acima de todos os exercícios deitados comparados.",
          cuidados: "Instabilidade no começo é normal; começar sem carga resolve.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Quando o plano precisa de unilateral com carga real.",
        "Correção de assimetria entre as pernas.",
        "Alternativa ao agachamento em quem não tolera carga axial na coluna.",
      ],
      quandoEvitar: [
        "Dor no joelho da frente que aparece já sem carga.",
        "Aluno sem equilíbrio para sustentar a posição por 10 s.",
        "Mobilidade de quadril insuficiente para a posição do pé de trás.",
      ],
      errosComuns: [
        "Pé da frente perto demais do banco, levando o joelho muito à frente.",
        "Empurrar com o pé de trás em vez de usá-lo só como apoio.",
        "Girar a bacia para o lado durante a descida.",
      ],
      variacoes: [
        "Sem carga: primeira etapa, até o equilíbrio aparecer.",
        "Com halteres nas mãos: progressão natural de carga.",
        "Com o pé de trás no chão (afundo estático): regressão de equilíbrio.",
      ],
    },
    conteudo: {
      visaoGeral:
        "É o unilateral mais forte do catálogo. Existe porque afundo e subida no step chegam a um teto de carga, e o plano de hipertrofia precisava de um unilateral que continuasse progredindo.",
      biomecanica:
        "Com o pé de trás elevado, a maior parte do peso recai sobre a perna da frente. O glúteo médio dessa perna sustenta a bacia enquanto quadríceps e glúteo máximo produzem o movimento.",
      fisiologia:
        "Permite carga alta por perna com pouca carga sobre a coluna, o que o torna uma alternativa útil quando o agachamento com barra não é opção.",
      prescricaoPratica:
        "Em geral, 3 séries de 8 a 12 repetições por perna. Comece sem carga por duas semanas: o fator limitante costuma ser o equilíbrio, não a força.",
    },
    trustLevel: "princípio biomecânico",
    temCena: false,
  },

  {
    id: "e70",
    slug: "agachamento-goblet",
    nome: "Agachamento goblet",
    grupoMuscular: "Membros inferiores",
    equipamento: "Halter",
    objetivo: ["Emagrecimento", "Aprendizado técnico", "Resistência muscular"],
    nivel: "Iniciante",
    articulacaoPredominante: "Joelho e quadril",
    restricoes: ["Dor no joelho"],
    premium: false,
    resumoPratico:
      "Halter segurado junto ao peito: o contrapeso à frente ajuda o aluno a manter o tronco ereto, o que faz dele o agachamento mais fácil de ensinar.",
    anguloArticular: "Flexão de joelho e quadril conforme a tolerância",
    imagem: "/exercises/agachamento-goblet.webp",
    imagemAnalise: "/exercises/agachamento-goblet-analysis.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Quadríceps", percentual: 70, papel: "primário" },
      { musculo: "Glúteo máximo", percentual: 58, papel: "sinergista" },
      { musculo: "Eretores da espinha", percentual: 40, papel: "estabilizador" },
      { musculo: "Transverso do abdome", percentual: 35, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 80, metrics: m("Quadríceps", 70, 25, 28, 35, 12, 42) },
    fases: [
      { nome: "Posição", descricao: "Em pé, halter segurado na vertical junto ao peito com as duas mãos." },
      { nome: "Descida", descricao: "Desce entre os joelhos mantendo o tronco ereto e os cotovelos por dentro das coxas." },
      { nome: "Subida", descricao: "Empurra o chão até estender, sem deixar o quadril subir antes do peito." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 55,
        titulo: "O peso à frente endireita o tronco",
        camadas: {
          resumo: "O contrapeso à frente obriga o tronco a ficar ereto sozinho.",
          biomecanica:
            "Segurar carga à frente desloca o centro de massa e o corpo compensa mantendo o tronco mais vertical. É correção mecânica, não instrução verbal.",
          fisiologia:
            "Com o tronco mais ereto, a distribuição do esforço tende ao joelho e ao quadríceps, e a carga sobre a coluna cai.",
          evidencia:
            "Escamilla e colaboradores descrevem como as variações de técnica no agachamento redistribuem a carga entre joelho e quadril.",
          cuidados: "Se o calcanhar sobe, falta mobilidade de tornozelo e um calço resolve.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Ensino do padrão de agachamento em iniciante.",
        "Quando o aluno inclina demais o tronco no agachamento livre.",
        "Circuitos de emagrecimento com carga moderada.",
      ],
      quandoEvitar: [
        "Dor no joelho que aparece já sem carga.",
        "Aluno que não consegue segurar o halter junto ao peito por toda a série.",
      ],
      errosComuns: [
        "Afastar o halter do peito, o que anula o contrapeso.",
        "Levantar os calcanhares por falta de mobilidade de tornozelo.",
        "Subir o quadril antes do peito, transformando em bom dia.",
      ],
      variacoes: [
        "Com calço sob os calcanhares: resolve a falta de mobilidade de tornozelo.",
        "Até uma caixa: define a profundidade e dá segurança.",
        "Com pausa de 2 s embaixo: mais controle e mais tempo sob tensão.",
      ],
    },
    conteudo: {
      visaoGeral:
        "É o agachamento que se ensina sozinho. Onde o agachamento livre exige correção verbal constante, aqui a posição do peso faz o trabalho de instrução.",
      biomecanica:
        "O halter à frente funciona como contrapeso: para não cair para trás, o aluno mantém o tronco ereto e desce entre os joelhos. Os cotovelos por dentro das coxas ainda servem de referência de profundidade.",
      fisiologia:
        "A carga fica moderada por limitação de pegada, o que é uma vantagem no aprendizado: é difícil errar com peso excessivo.",
      prescricaoPratica:
        "Em geral, 3 séries de 10 a 15 repetições. Quando a pegada virar o fator limitante, migre para o agachamento livre ou para o búlgaro, que continuam progredindo.",
    },
    trustLevel: "regra pedagógica",
    temCena: false,
  },

  {
    id: "e71",
    slug: "cadeira-adutora",
    nome: "Cadeira adutora",
    grupoMuscular: "Membros inferiores",
    equipamento: "Máquina",
    objetivo: ["Hipertrofia", "Retorno ao treino"],
    nivel: "Iniciante",
    articulacaoPredominante: "Quadril",
    restricoes: [],
    premium: false,
    resumoPratico:
      "Fechar as pernas contra a resistência da máquina: o único trabalho direto de adutor do catálogo, com amplitude controlada e trajetória guiada.",
    anguloArticular: "Adução de quadril em amplitude regulável",
    imagem: "/exercises/cadeira-adutora.webp",
    imagemAnalise: "/exercises/cadeira-adutora-analysis.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Adutores", percentual: 72, papel: "primário" },
      { musculo: "Glúteo máximo", percentual: 25, papel: "sinergista" },
      { musculo: "Transverso do abdome", percentual: 20, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 70, metrics: m("Adutores", 72, 10, 12, 10, 5, 35) },
    fases: [
      { nome: "Posição", descricao: "Sentado com as coxas apoiadas nos braços da máquina, abertura ajustada ao confortável." },
      { nome: "Fechamento", descricao: "Junta as coxas de forma controlada, sem impulso." },
      { nome: "Abertura", descricao: "Abre em 3 segundos até a posição inicial, sem deixar a placa bater." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 62,
        titulo: "A abertura inicial é a dose",
        camadas: {
          resumo: "A regulagem de abertura decide o alongamento, e é onde mora o risco.",
          biomecanica:
            "Os adutores são alongados na abertura. Começar de uma abertura maior que a tolerância transforma a primeira repetição na mais arriscada da série.",
          fisiologia:
            "É um grupo com histórico de lesão em esportes de mudança de direção, e treiná-lo de forma controlada tem valor preventivo.",
          evidencia:
            "Boeckh-Behrens e Buskies documentam o perfil de ativação dos exercícios de adução em aparelho por eletromiografia.",
          cuidados: "Em queixa na virilha, comece com abertura curta e amplie ao longo das semanas.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Adutores como alvo, que nenhum outro exercício do catálogo cobre.",
        "Retorno ao treino depois de queixa na virilha, com liberação.",
        "Complemento de membros inferiores em plano de hipertrofia.",
      ],
      quandoEvitar: [
        "Dor aguda na virilha sem avaliação.",
        "Abertura inicial que já provoca desconforto antes de a série começar.",
      ],
      errosComuns: [
        "Regular a abertura além da tolerância e forçar na primeira repetição.",
        "Fechar com impulso e soltar a volta.",
        "Segurar a respiração durante todo o esforço.",
      ],
      variacoes: [
        "Abertura reduzida: primeira fase e retorno de queixa.",
        "Com pausa de 2 s fechado: mais tempo sob tensão.",
        "Abertura em 4 s: ênfase na fase excêntrica, que é onde o grupo costuma falhar.",
      ],
    },
    conteudo: {
      visaoGeral:
        "Os adutores apareciam em um único exercício do catálogo, sempre como sinergista. Este item existe para dar ao grupo trabalho direto e progressão própria.",
      biomecanica:
        "A máquina guia a trajetória, o que permite carga com pouca exigência de equilíbrio. A regulagem de abertura define o comprimento em que o músculo começa a trabalhar.",
      fisiologia:
        "O trabalho excêntrico controlado na abertura é o que mais interessa: é nesse momento que o grupo costuma ser exigido em esporte, e é onde a lesão costuma acontecer.",
      prescricaoPratica:
        "Em geral, 3 séries de 12 a 15 repetições com abertura em 3 s. Comece com abertura curta e amplie ao longo das semanas, antes de subir carga.",
    },
    trustLevel: "regra pedagógica",
    temCena: false,
  },

  {
    id: "e72",
    slug: "cadeira-abdutora",
    nome: "Cadeira abdutora",
    grupoMuscular: "Membros inferiores",
    equipamento: "Máquina",
    objetivo: ["Hipertrofia", "Retorno ao treino"],
    nivel: "Iniciante",
    articulacaoPredominante: "Quadril",
    restricoes: [],
    premium: false,
    resumoPratico:
      "Abrir as pernas contra a resistência da máquina: glúteo médio com carga progressiva, que os elásticos não conseguem entregar.",
    anguloArticular: "Abdução de quadril em amplitude regulável",
    imagem: "/exercises/cadeira-abdutora.webp",
    imagemAnalise: "/exercises/cadeira-abdutora-analysis.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Glúteo médio", percentual: 65, papel: "primário" },
      { musculo: "Glúteo máximo", percentual: 40, papel: "sinergista" },
      { musculo: "Transverso do abdome", percentual: 20, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 74, metrics: m("Glúteo médio", 65, 10, 15, 10, 5, 30) },
    fases: [
      { nome: "Posição", descricao: "Sentado com as coxas apoiadas nos braços da máquina, tronco encostado." },
      { nome: "Abertura", descricao: "Abre as coxas de forma controlada até a amplitude confortável." },
      { nome: "Fechamento", descricao: "Fecha em 3 segundos sem deixar a placa bater." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 62,
        titulo: "Carga que o elástico não dá",
        camadas: {
          resumo: "É o único jeito de progredir carga em glúteo médio dentro do catálogo.",
          biomecanica:
            "Sentado, o glúteo médio produz a abdução com o tronco estabilizado pelo encosto. Sai a exigência de equilíbrio e entra a possibilidade de carga.",
          fisiologia:
            "Concha e caminhada lateral ensinam o padrão; a cadeira abdutora é onde ele ganha força mensurável.",
          evidencia:
            "Distefano e colaboradores mostram que exercícios de abdução geram a maior atividade de glúteo médio entre 12 exercícios comparados.",
          cuidados: "Inclinar o tronco para trás muda a parte do glúteo que trabalha; encoste e mantenha.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Quando o glúteo médio já domina concha e caminhada lateral e precisa de carga.",
        "Retorno ao treino com trajetória guiada e sem exigência de equilíbrio.",
        "Complemento de dor de joelho e de quadril em plano de hipertrofia.",
      ],
      quandoEvitar: [
        "Dor no quadril que aparece já na abertura sem carga.",
        "Aluno com dificuldade de entrar e sair do aparelho.",
      ],
      errosComuns: [
        "Abrir com impulso e soltar o fechamento.",
        "Inclinar o tronco para trás durante a abertura.",
        "Usar amplitude curta com carga alta.",
      ],
      variacoes: [
        "Com o tronco inclinado à frente: muda a ênfase dentro do glúteo.",
        "Com pausa de 2 s aberto: mais tempo sob tensão.",
        "Fechamento em 4 s: ênfase excêntrica.",
      ],
    },
    conteudo: {
      visaoGeral:
        "Terceiro degrau da linha de glúteo médio: concha para aprender, caminhada lateral para levar à posição em pé, cadeira abdutora para carregar.",
      biomecanica:
        "O encosto estabiliza o tronco e a máquina guia a trajetória, então toda a atenção fica na abdução. O ângulo do tronco muda qual porção do glúteo é mais exigida.",
      fisiologia:
        "É o único exercício do catálogo em que o glúteo médio recebe progressão de carga com precisão, o que importa em plano de hipertrofia e de força.",
      prescricaoPratica:
        "Em geral, 3 séries de 12 a 15 repetições com fechamento em 3 s. Amplitude confortável e completa vale mais que carga com meia amplitude.",
    },
    trustLevel: "princípio biomecânico",
    temCena: false,
  },

  {
    id: "e73",
    slug: "flexora-em-pe",
    nome: "Flexora em pé unilateral",
    grupoMuscular: "Membros inferiores",
    equipamento: "Máquina",
    objetivo: ["Hipertrofia", "Retorno ao treino"],
    nivel: "Iniciante",
    articulacaoPredominante: "Joelho",
    restricoes: [],
    premium: false,
    resumoPratico:
      "Isquiotibiais uma perna por vez, em pé: o mesmo trabalho da mesa flexora para quem não deita de bruços com conforto.",
    anguloArticular: "Flexão de joelho em amplitude completa",
    imagem: "/exercises/flexora-em-pe.webp",
    imagemAnalise: "/exercises/flexora-em-pe-analysis.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Isquiotibiais", percentual: 72, papel: "primário" },
      { musculo: "Gastrocnêmio", percentual: 35, papel: "sinergista" },
      { musculo: "Glúteo máximo", percentual: 25, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 73, metrics: m("Isquiotibiais", 72, 15, 15, 25, 5, 25) },
    fases: [
      { nome: "Posição", descricao: "Em pé de frente para o aparelho, apoio no tornozelo e mãos segurando a estrutura." },
      { nome: "Flexão", descricao: "Dobra o joelho levando o calcanhar na direção do glúteo, sem mover o quadril." },
      { nome: "Retorno", descricao: "Estende em 3 segundos até quase a extensão completa." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 68,
        titulo: "O quadril fica parado",
        camadas: {
          resumo: "Se o quadril vai para trás, o exercício deixou de ser de joelho.",
          biomecanica:
            "Os isquiotibiais flexionam o joelho e estendem o quadril. Deixar o quadril recuar acrescenta extensão e reduz a exigência do joelho, que é o alvo aqui.",
          fisiologia:
            "Trabalhar uma perna por vez expõe assimetria, que é comum depois de lesão de joelho.",
          evidencia:
            "Boeckh-Behrens e Buskies descrevem o perfil de ativação dos isquiotibiais nos exercícios de flexão de joelho em aparelho.",
          cuidados: "Cãibra na panturrilha durante a série costuma indicar carga alta demais.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Isquiotibiais em quem não deita de bruços com conforto.",
        "Correção de assimetria depois de lesão de joelho.",
        "Complemento da mesa flexora num plano de hipertrofia.",
      ],
      quandoEvitar: [
        "Cãibra repetida na panturrilha durante a série.",
        "Aluno que não consegue manter o quadril parado nem sem carga.",
      ],
      errosComuns: [
        "Levar o quadril para trás para completar a flexão.",
        "Fazer com amplitude curta e carga alta.",
        "Soltar o retorno em vez de controlar os 3 segundos.",
      ],
      variacoes: [
        "Com pausa de 2 s flexionado: mais tempo sob tensão.",
        "Retorno em 4 s: ênfase excêntrica.",
        "Com a ponta do pé puxada para cima: muda a participação da panturrilha.",
      ],
    },
    conteudo: {
      visaoGeral:
        "Todo trabalho de isquiotibiais do catálogo exigia deitar, e isso exclui parte dos alunos. Este item resolve mantendo o mesmo padrão de flexão de joelho.",
      biomecanica:
        "Em pé, o quadril fica estendido e os isquiotibiais partem de um comprimento menor que na mesa flexora, o que muda levemente o perfil de força ao longo da amplitude.",
      fisiologia:
        "A execução unilateral dobra o tempo de sessão, mas é o que permite igualar os lados quando existe diferença.",
      prescricaoPratica:
        "Em geral, 3 séries de 10 a 15 repetições por perna com retorno em 3 s. Comece pelo lado mais fraco e iguale as repetições pelo que ele aguentar.",
    },
    trustLevel: "regra pedagógica",
    temCena: false,
  },

  {
    id: "e74",
    slug: "hip-thrust-unilateral",
    nome: "Elevação pélvica unilateral",
    grupoMuscular: "Membros inferiores",
    equipamento: "Peso corporal",
    objetivo: ["Hipertrofia", "Resistência muscular"],
    nivel: "Intermediário",
    articulacaoPredominante: "Quadril",
    restricoes: ["Dor lombar"],
    premium: false,
    resumoPratico:
      "Elevação pélvica com uma perna só: dobra a carga sobre o glúteo sem acrescentar peso, e expõe a assimetria que a versão com as duas pernas esconde.",
    anguloArticular: "Extensão de quadril até a linha do corpo",
    imagem: "/exercises/hip-thrust-unilateral.webp",
    imagemAnalise: "/exercises/hip-thrust-unilateral-analysis.webp",
    modalidade: "m-funcional",
    ativacao: [
      { musculo: "Glúteo máximo", percentual: 72, papel: "primário" },
      { musculo: "Glúteo médio", percentual: 50, papel: "sinergista" },
      { musculo: "Isquiotibiais", percentual: 45, papel: "sinergista" },
      { musculo: "Eretores da espinha", percentual: 30, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 79, metrics: m("Glúteo máximo", 72, 38, 28, 20, 5, 30) },
    fases: [
      { nome: "Posição", descricao: "Costas apoiadas num banco, um pé no chão e o outro joelho levantado." },
      { nome: "Subida", descricao: "Estende o quadril até a linha do corpo, sem arquear a lombar." },
      { nome: "Descida", descricao: "Desce controlado até quase encostar, mantendo a bacia nivelada." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 55,
        titulo: "A bacia nivelada é a metade do exercício",
        camadas: {
          resumo: "Com uma perna só, a bacia tende a cair para o lado livre.",
          biomecanica:
            "O glúteo máximo estende o quadril e o glúteo médio do mesmo lado impede a bacia de cair. Por isso o unilateral treina os dois de uma vez.",
          fisiologia:
            "Dobra a exigência sobre o glúteo sem acrescentar carga externa, o que é útil quando não há barra nem anilha disponível.",
          evidencia:
            "Contreras e colaboradores documentam o perfil de ativação do glúteo na elevação pélvica e sua diferença frente ao agachamento e ao terra.",
          cuidados: "Arquear a lombar para subir mais tira o glúteo e carrega a coluna.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Progressão da ponte de glúteos quando ela fica fácil.",
        "Correção de assimetria de glúteo.",
        "Treino em casa que precisa de mais carga sem equipamento.",
      ],
      quandoEvitar: [
        "Dor lombar que aparece na extensão de quadril.",
        "Aluno com dificuldade de descer ao chão e levantar.",
      ],
      errosComuns: [
        "Arquear a lombar no topo em vez de estender o quadril.",
        "Deixar a bacia cair para o lado da perna levantada.",
        "Empurrar com a ponta do pé em vez do calcanhar.",
      ],
      variacoes: [
        "Com o pé mais afastado: mais isquiotibiais.",
        "Com pausa de 2 s no topo: mais tempo sob tensão.",
        "Com halter sobre o quadril: acrescenta carga quando o unilateral já é fácil.",
      ],
    },
    conteudo: {
      visaoGeral:
        "É a progressão que faltava entre a ponte de glúteos e o hip thrust com barra: dobra a carga sem exigir equipamento nenhum.",
      biomecanica:
        "A extensão de quadril com uma perna só concentra o esforço num lado, enquanto o glúteo médio desse mesmo lado sustenta a bacia. É trabalho de força e de controle na mesma repetição.",
      fisiologia:
        "O glúteo máximo responde bem a estímulos com o quadril estendido, que é a posição de pico deste exercício, diferente do agachamento, cujo pico é no fundo.",
      prescricaoPratica:
        "Em geral, 3 séries de 10 a 15 repetições por perna com pausa de 1 s no topo. Se a bacia cai para o lado, volte à ponte com as duas pernas até o controle aparecer.",
    },
    trustLevel: "princípio biomecânico",
    temCena: false,
  },

  {
    id: "e75",
    slug: "good-morning",
    nome: "Bom dia com barra",
    grupoMuscular: "Membros inferiores",
    equipamento: "Barra",
    objetivo: ["Força", "Hipertrofia"],
    nivel: "Avançado",
    articulacaoPredominante: "Quadril e coluna",
    restricoes: ["Dor lombar", "Requer mobilidade de tornozelo e quadril"],
    premium: false,
    resumoPratico:
      "Dobradiça de quadril com a barra nas costas: exige mais dos eretores e dos isquiotibiais do que o terra romeno, e por isso pede aluno avançado.",
    anguloArticular: "Flexão de quadril com joelho em leve flexão e coluna neutra",
    imagem: "/exercises/good-morning.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Isquiotibiais", percentual: 75, papel: "primário" },
      { musculo: "Eretores da espinha", percentual: 70, papel: "primário" },
      { musculo: "Glúteo máximo", percentual: 62, papel: "sinergista" },
      { musculo: "Transverso do abdome", percentual: 35, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 78, metrics: m("Isquiotibiais", 75, 70, 65, 15, 25, 60) },
    fases: [
      { nome: "Posição", descricao: "Barra apoiada no trapézio, pés na largura do quadril, joelhos em leve flexão." },
      { nome: "Descida", descricao: "Empurra o quadril para trás inclinando o tronco, coluna neutra o tempo todo." },
      { nome: "Subida", descricao: "Volta empurrando o quadril à frente até ficar em pé." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 48,
        titulo: "Coluna neutra ou nada",
        camadas: {
          resumo: "Este é o exercício do catálogo com maior carga sobre a coluna.",
          biomecanica:
            "Com a barra nas costas e o tronco inclinado, o braço de alavanca sobre a lombar é o maior de todos os exercícios da base. Qualquer arredondamento acontece sob essa carga.",
          fisiologia:
            "É estímulo forte para isquiotibiais e eretores, e por isso ocupa o topo da progressão de dobradiça, não a entrada.",
          evidencia:
            "McGill documenta o custo de compressão e cisalhamento da flexão lombar sob carga, o que sustenta a exigência de coluna neutra aqui.",
          cuidados: "Carga leve por várias semanas é a norma; este não é exercício para buscar recorde.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Aluno avançado que já domina terra romeno com carga.",
        "Mesociclo de força de cadeia posterior.",
        "Quando o objetivo é eretor da espinha com carga, não só como estabilizador.",
      ],
      quandoEvitar: [
        "Qualquer histórico recente de dor lombar.",
        "Aluno que ainda arredonda a coluna no terra romeno.",
        "Mobilidade de quadril insuficiente para a dobradiça.",
      ],
      errosComuns: [
        "Arredondar a coluna no fim da descida.",
        "Dobrar demais os joelhos e transformar em agachamento.",
        "Descer além da amplitude que a mobilidade permite.",
      ],
      variacoes: [
        "Com barra vazia: aprendizado, por várias sessões.",
        "Sentado no banco: reduz a exigência de equilíbrio.",
        "Com elástico no lugar da barra: regressão de carga.",
      ],
    },
    conteudo: {
      visaoGeral:
        "Fecha o topo da linha de dobradiça de quadril do catálogo. É o item mais exigente da base e existe para dar destino ao aluno avançado, não para ser prescrito cedo.",
      biomecanica:
        "A barra nas costas e o tronco inclinado criam o maior momento sobre a lombar de todos os exercícios da base. Isquiotibiais e glúteo controlam a descida e produzem a subida, com os eretores mantendo a coluna neutra sob carga.",
      fisiologia:
        "O estímulo é alto para a cadeia posterior inteira. A contrapartida é que o custo de um erro técnico também é alto, e é por isso que ele é classificado como avançado.",
      prescricaoPratica:
        "Em geral, 3 séries de 6 a 10 repetições com carga conservadora. Se a coluna arredonda em qualquer repetição, a série acabou.",
    },
    trustLevel: "cuidado de segurança",
    temCena: false,
  },

  {
    id: "e76",
    slug: "leg-press-horizontal",
    nome: "Leg press horizontal",
    grupoMuscular: "Membros inferiores",
    equipamento: "Máquina",
    objetivo: ["Hipertrofia", "Retorno ao treino", "Resistência muscular"],
    nivel: "Iniciante",
    articulacaoPredominante: "Joelho e quadril",
    restricoes: ["Dor no joelho"],
    premium: false,
    resumoPratico:
      "Leg press com o assento na horizontal: mesma prensa do 45 graus, com entrada e saída muito mais fáceis para quem tem dificuldade de sentar e levantar.",
    anguloArticular: "Flexão de joelho e quadril com amplitude regulável",
    imagem: "/exercises/leg-press-horizontal.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Quadríceps", percentual: 72, papel: "primário" },
      { musculo: "Glúteo máximo", percentual: 52, papel: "sinergista" },
      { musculo: "Isquiotibiais", percentual: 35, papel: "sinergista" },
    ],
    indiceEficiencia: { score: 78, metrics: m("Quadríceps", 72, 12, 15, 35, 5, 25) },
    fases: [
      { nome: "Posição", descricao: "Sentado com as costas apoiadas, pés na plataforma na largura do quadril." },
      { nome: "Flexão", descricao: "Deixa a plataforma se aproximar até onde o joelho tolerar, sem descolar a lombar." },
      { nome: "Extensão", descricao: "Empurra até quase estender, sem travar o joelho no fim." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 58,
        titulo: "Entrar e sair também é prescrição",
        camadas: {
          resumo: "O assento na horizontal resolve o problema que o 45 graus cria.",
          biomecanica:
            "No leg press 45 graus, o aluno entra e sai de uma posição semideitada, o que exige força de tronco e mobilidade de quadril antes mesmo de a série começar.",
          fisiologia:
            "O estímulo de quadríceps e glúteo é equivalente; a diferença é de acesso, e acesso decide se o exercício acontece.",
          evidencia:
            "Escamilla e colaboradores descrevem a biomecânica do leg press e como a posição do pé e a amplitude redistribuem a carga entre joelho e quadril.",
          cuidados: "Lombar descolando do encosto no fim da flexão indica amplitude além da tolerância.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Aluno com obesidade ou idoso, para quem entrar no 45 graus é o obstáculo.",
        "Retorno ao treino com trajetória guiada e amplitude regulável.",
        "Alternativa ao agachamento quando não há carga axial possível.",
      ],
      quandoEvitar: [
        "Dor no joelho que aparece já na menor amplitude.",
        "Aluno que não consegue manter a lombar apoiada em nenhuma amplitude.",
      ],
      errosComuns: [
        "Descer além do ponto em que a lombar descola do encosto.",
        "Travar os joelhos na extensão final.",
        "Apoiar só a ponta do pé na plataforma.",
      ],
      variacoes: [
        "Amplitude reduzida: primeira fase e joelho sensível.",
        "Pés mais altos na plataforma: mais glúteo e menos joelho.",
        "Unilateral: expõe assimetria, com carga reduzida.",
      ],
    },
    conteudo: {
      visaoGeral:
        "Existe por um motivo de acesso, não de estímulo: o leg press 45 graus é excelente, mas entrar e sair dele é justamente o que trava o aluno com obesidade grau II e o idoso frágil.",
      biomecanica:
        "O padrão é o mesmo do 45 graus: empurrar a plataforma estendendo joelho e quadril, com a lombar apoiada. A diferença está no ângulo do assento e, portanto, na facilidade de entrar e sair.",
      fisiologia:
        "Rende estímulo equivalente de quadríceps e glúteo com trajetória guiada, o que reduz a exigência técnica e permite carga desde as primeiras sessões.",
      prescricaoPratica:
        "Em geral, 3 séries de 10 a 15 repetições com amplitude em que a lombar não descole. Amplie a amplitude antes de subir carga.",
    },
    trustLevel: "regra pedagógica",
    temCena: false,
  },
];
