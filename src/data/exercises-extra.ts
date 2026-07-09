import type { Exercise } from "./types";

/**
 * Expansão do Laboratório além da musculação tradicional: cardio de baixo
 * impacto, meio aquático, funcional para idosos/destreinados, core para dor
 * lombar e treino com elástico. Mesmo padrão editorial dos 13 originais:
 * linguagem prudente, conteúdo em camadas, dados autorados (sem IA na
 * anatomia). Cada exercício aponta a MODALIDADE a que pertence — é o que
 * conecta o ranking de exercícios à "Base da semana" do Prescrever.
 */

export const extraExercises: Exercise[] = [
  /* --------------------------- CAMINHADA INCLINADA ------------------------- */
  {
    id: "e14",
    slug: "caminhada-esteira",
    nome: "Caminhada inclinada (esteira)",
    grupoMuscular: "Membros inferiores",
    equipamento: "Esteira",
    objetivo: ["Emagrecimento", "Resistência muscular", "Reabilitação/retorno"],
    nivel: "Iniciante",
    articulacaoPredominante: "Quadril e tornozelo",
    restricoes: [],
    premium: false,
    resumoPratico:
      "Aeróbio acessível e dose-controlável: a inclinação leve aumenta o trabalho de glúteos e panturrilhas sem exigir corrida, preservando as articulações.",
    imagem: "/exercises/caminhada-esteira.webp",
    imagemAnalise: "/exercises/caminhada-esteira-analysis.webp",
    modalidade: "m-caminhada",
    ativacao: [
      { musculo: "Glúteo máximo", percentual: 68, papel: "primário" },
      { musculo: "Panturrilha", percentual: 62, papel: "sinergista" },
      { musculo: "Quadríceps", percentual: 55, papel: "sinergista" },
      { musculo: "Posteriores de coxa", percentual: 48, papel: "estabilizador" },
    ],
    indiceEficiencia: {
      score: 78,
      metrics: [
        { nome: "Gasto energético", valor: 74, tipo: "positivo" },
        { nome: "Glúteos", valor: 68, tipo: "positivo" },
        { nome: "Estabilidade", valor: 82, tipo: "positivo" },
        { nome: "Demanda de joelho", valor: 38, tipo: "cautela" },
        { nome: "Demanda lombar", valor: 22, tipo: "cautela" },
        { nome: "Complexidade técnica", valor: 15, tipo: "cautela" },
      ],
    },
    fases: [
      { nome: "Apoio", descricao: "O pé toca do calcanhar ao antepé; o joelho amortece levemente." },
      { nome: "Propulsão", descricao: "Glúteo e panturrilha empurram o corpo à frente contra a inclinação." },
      { nome: "Balanço", descricao: "A perna avança relaxada; braços acompanham o ritmo, tronco ereto." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 45,
        titulo: "Inclinação como dose",
        camadas: {
          resumo: "Inclinar 3–6% aumenta o esforço sem precisar correr.",
          biomecanica: "A inclinação desloca trabalho para glúteos e panturrilha e reduz o impacto da passada em relação à corrida.",
          fisiologia: "Permite elevar a demanda cardiorrespiratória mantendo intensidade dosável por velocidade e inclinação.",
          evidencia: "Na prática, subir a inclinação antes da velocidade tende a preservar conforto articular.",
          cuidados: "Evite segurar firme no apoio: isso descarrega o peso e reduz o estímulo real.",
        },
      },
      {
        id: "h2",
        x: 45,
        y: 70,
        titulo: "Passada e conforto",
        camadas: {
          resumo: "Passadas confortáveis batem passadas longas.",
          biomecanica: "Passada excessiva aumenta forças de frenagem no joelho e no quadril.",
          fisiologia: "Cadência natural favorece economia de movimento e sessões mais longas.",
          evidencia: "Dor ou desconforto que aumenta com o volume pede reduzir tempo/inclinação.",
          cuidados: "Em joelhos sensíveis, prefira mais inclinação e menos velocidade.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Base aeróbia da semana em emagrecimento e saúde metabólica.",
        "Progressão a partir do meio aquático ou da bicicleta.",
        "Sessões dose-controláveis por tempo, velocidade e inclinação.",
      ],
      quandoEvitar: [
        "Dor articular que piora com o passo: considere bicicleta ou meio aquático.",
        "Equilíbrio muito limitado sem supervisão próxima.",
      ],
      errosComuns: [
        "Segurar no apoio o tempo todo (descarrega o peso corporal).",
        "Aumentar velocidade e inclinação ao mesmo tempo.",
        "Ignorar o teste da fala e progredir só pela velocidade.",
      ],
      variacoes: [
        "Caminhada plana: porta de entrada mais suave.",
        "Intervalado leve (2 min inclinado / 2 min plano).",
        "Caminhada ao ar livre: terreno e adesão diferentes.",
      ],
    },
    conteudo: {
      visaoGeral:
        "A caminhada inclinada é uma das formas mais acessíveis de construir base aeróbia: o esforço é fácil de dosar e a barreira técnica é mínima, o que favorece a adesão nas primeiras semanas.",
      biomecanica:
        "A inclinação aumenta o trabalho de extensores do quadril e flexores plantares sem o impacto da corrida. As forças de reação tendem a permanecer próximas às da caminhada plana.",
      fisiologia:
        "Sessões contínuas em intensidade leve a moderada (teste da fala confortável) desenvolvem a capacidade cardiorrespiratória e elevam o gasto energético semanal com baixa demanda de recuperação.",
      prescricaoPratica:
        "Em geral, comece por tempo (15–30 min) em ritmo confortável; progrida primeiro a duração, depois a inclinação e por último a velocidade, tudo guiado por PSE e teste da fala.",
    },
    trustLevel: "tendência prática",
    temCena: false,
  },

  /* --------------------------- BICICLETA ERGOMÉTRICA ----------------------- */
  {
    id: "e15",
    slug: "bicicleta-ergometrica",
    nome: "Bicicleta ergométrica",
    grupoMuscular: "Membros inferiores",
    equipamento: "Bicicleta ergométrica",
    objetivo: ["Emagrecimento", "Resistência muscular", "Reabilitação/retorno"],
    nivel: "Iniciante",
    articulacaoPredominante: "Joelho e quadril",
    restricoes: [],
    premium: false,
    resumoPratico:
      "Aeróbio de baixíssimo impacto com carga ajustável, em geral a melhor porta de entrada quando a caminhada incomoda joelhos ou lombar.",
    imagem: "/exercises/bicicleta-ergometrica.webp",
    imagemAnalise: "/exercises/bicicleta-ergometrica-analysis.webp",
    modalidade: "m-bike",
    ativacao: [
      { musculo: "Quadríceps", percentual: 78, papel: "primário" },
      { musculo: "Glúteo máximo", percentual: 52, papel: "sinergista" },
      { musculo: "Posteriores de coxa", percentual: 45, papel: "sinergista" },
      { musculo: "Panturrilha", percentual: 40, papel: "estabilizador" },
    ],
    indiceEficiencia: {
      score: 80,
      metrics: [
        { nome: "Gasto energético", valor: 70, tipo: "positivo" },
        { nome: "Quadríceps", valor: 78, tipo: "positivo" },
        { nome: "Estabilidade", valor: 90, tipo: "positivo" },
        { nome: "Demanda de joelho", valor: 30, tipo: "cautela" },
        { nome: "Demanda lombar", valor: 18, tipo: "cautela" },
        { nome: "Complexidade técnica", valor: 12, tipo: "cautela" },
      ],
    },
    fases: [
      { nome: "Empurrar", descricao: "Do topo do pedal, quadríceps e glúteo empurram até a extensão quase completa." },
      { nome: "Transição", descricao: "No ponto baixo, o joelho mantém leve flexão (banco na altura certa)." },
      { nome: "Recuperar", descricao: "A perna volta relaxada enquanto a outra assume o trabalho." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 55,
        titulo: "Altura do banco",
        camadas: {
          resumo: "No ponto mais baixo do pedal, o joelho mantém ~20–30° de flexão.",
          biomecanica: "Banco baixo aumenta a compressão patelofemoral; banco alto força báscula da pelve.",
          fisiologia: "O ajuste correto distribui o trabalho entre quadríceps e glúteos e melhora o conforto.",
          evidencia: "Desconforto anterior de joelho costuma responder à elevação discreta do banco.",
          cuidados: "Ajuste o banco ANTES de ajustar a carga: é o erro mais comum.",
        },
      },
      {
        id: "h2",
        x: 55,
        y: 40,
        titulo: "Carga e cadência",
        camadas: {
          resumo: "Cadência confortável (60–80 rpm) com carga leve a moderada.",
          biomecanica: "Carga alta em cadência baixa aproxima o pedal de um exercício de força, o que nem sempre é o objetivo.",
          fisiologia: "Cadências moderadas com carga leve favorecem o trabalho aeróbio contínuo.",
          evidencia: "O teste da fala funciona muito bem na bike para calibrar a zona de esforço.",
          cuidados: "Em joelhos sensíveis, aumente o tempo antes da carga.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Obesidade grave e dor articular que limitam a caminhada.",
        "Controle fino de intensidade (carga e cadência reguláveis).",
        "Base aeróbia segura para iniciantes destreinados.",
      ],
      quandoEvitar: [
        "Desconforto lombar por postura prolongada: ajuste o equipamento antes de evitar.",
        "Quando a meta específica é impacto ósseo (prefira exercícios em pé).",
      ],
      errosComuns: [
        "Banco baixo demais (joelho muito flexionado sob carga).",
        "Apoiar o peso nos punhos e tensionar os ombros.",
        "Progredir carga sem consolidar tempo de sessão.",
      ],
      variacoes: [
        "Bicicleta horizontal (reclinada): mais apoio de tronco.",
        "Intervalado leve (1 min mais forte / 2 min leve).",
        "Bicicleta ao ar livre: coordenação e ambiente diferentes.",
      ],
    },
    conteudo: {
      visaoGeral:
        "A bicicleta ergométrica é a opção clássica de baixo impacto: o peso corporal fica apoiado no banco, o que permite volume aeróbio com mínima sobrecarga articular, ideal para começar.",
      biomecanica:
        "O movimento cíclico de joelho e quadril acontece sem fase aérea nem impacto; a carga externa é ajustável em pequenos incrementos, o que dá controle fino da intensidade.",
      fisiologia:
        "Permite sessões contínuas ou intervaladas leves com demanda cardiorrespiratória dosável; a FC é utilizável, mas PSE e teste da fala funcionam muito bem.",
      prescricaoPratica:
        "Em geral: ajuste o banco, comece com 15–25 min em carga leve, progrida o tempo antes da carga e use blocos intervalados leves quando a sessão contínua ficar fácil.",
    },
    trustLevel: "tendência prática",
    temCena: false,
  },

  /* --------------------------------- ELÍPTICO ------------------------------ */
  {
    id: "e16",
    slug: "eliptico",
    nome: "Elíptico",
    grupoMuscular: "Corpo todo",
    equipamento: "Elíptico",
    objetivo: ["Emagrecimento", "Resistência muscular"],
    nivel: "Iniciante",
    articulacaoPredominante: "Quadril, joelho e ombro",
    restricoes: [],
    premium: true,
    resumoPratico:
      "Aeróbio de baixo impacto que envolve membros superiores e inferiores, com gasto maior que a bicicleta para quem tolera ficar em pé.",
    imagem: "/exercises/eliptico.webp",
    imagemAnalise: "/exercises/eliptico-analysis.webp",
    modalidade: "m-eliptico",
    ativacao: [
      { musculo: "Quadríceps", percentual: 65, papel: "primário" },
      { musculo: "Glúteo máximo", percentual: 58, papel: "sinergista" },
      { musculo: "Posteriores de coxa", percentual: 45, papel: "sinergista" },
      { musculo: "Deltoide", percentual: 35, papel: "estabilizador" },
    ],
    indiceEficiencia: {
      score: 76,
      metrics: [
        { nome: "Gasto energético", valor: 80, tipo: "positivo" },
        { nome: "Corpo todo", valor: 72, tipo: "positivo" },
        { nome: "Estabilidade", valor: 65, tipo: "positivo" },
        { nome: "Demanda de joelho", valor: 32, tipo: "cautela" },
        { nome: "Demanda lombar", valor: 24, tipo: "cautela" },
        { nome: "Complexidade técnica", valor: 28, tipo: "cautela" },
      ],
    },
    fases: [
      { nome: "Impulso", descricao: "A perna da frente empurra o pedal em arco enquanto o braço oposto puxa." },
      { nome: "Deslize", descricao: "Os pés permanecem apoiados: não há fase aérea nem impacto." },
      { nome: "Retorno", descricao: "O ciclo inverte com o tronco estável e o olhar à frente." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 50,
        titulo: "Sem fase aérea",
        camadas: {
          resumo: "Os pés nunca deixam os pedais: impacto próximo de zero.",
          biomecanica: "O padrão elíptico simula a corrida sem as forças de aterrissagem.",
          fisiologia: "Envolve corpo todo, elevando o gasto em relação à bike na mesma percepção de esforço.",
          evidencia: "Boa opção intermediária entre bike e caminhada/corrida.",
          cuidados: "Iniciantes podem estranhar a coordenação nos primeiros minutos: comece devagar.",
        },
      },
      {
        id: "h2",
        x: 55,
        y: 35,
        titulo: "Braços ativos",
        camadas: {
          resumo: "Puxar e empurrar as alças distribui o trabalho com o tronco.",
          biomecanica: "O empurrar/puxar alternado adiciona demanda de membros superiores e core.",
          fisiologia: "Mais massa muscular ativa → maior custo energético por minuto.",
          evidencia: "Soltar as alças e apoiar-se no console reduz bastante o estímulo real.",
          cuidados: "Em idosos com equilíbrio limitado, prefira a bicicleta.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Baixo impacto com gasto maior que o da bicicleta.",
        "Variação da base aeróbia para evitar monotonia.",
        "Quem tolera ficar em pé mas não tolera correr.",
      ],
      quandoEvitar: [
        "Equilíbrio muito limitado: prefira bicicleta.",
        "Primeiras sessões de muito destreinados sem supervisão.",
      ],
      errosComuns: [
        "Apoiar-se no console e 'desligar' o tronco.",
        "Resistência alta demais logo no início.",
        "Pedalar só com as pernas, sem usar as alças.",
      ],
      variacoes: [
        "Sem alças (mãos livres): mais demanda de equilíbrio.",
        "Intervalado leve por resistência.",
        "Reverso (pedalar para trás): ênfase diferente.",
      ],
    },
    conteudo: {
      visaoGeral:
        "O elíptico ocupa o espaço entre a bicicleta e a corrida: movimento cíclico em pé, sem impacto, envolvendo membros superiores e inferiores ao mesmo tempo.",
      biomecanica:
        "A trajetória elíptica dos pedais elimina a fase aérea; joelho e quadril trabalham em amplitudes moderadas e o tronco estabiliza o conjunto.",
      fisiologia:
        "Com mais massa muscular ativa que a bike, o custo energético por minuto tende a ser maior na mesma percepção de esforço, o que é útil no emagrecimento.",
      prescricaoPratica:
        "Comece com resistência baixa e 10–20 min; progrida tempo e depois resistência. PSE e teste da fala são os guias práticos.",
    },
    trustLevel: "tendência prática",
    temCena: false,
  },

  /* ------------------------------ MARCHA AQUÁTICA -------------------------- */
  {
    id: "e17",
    slug: "marcha-aquatica",
    nome: "Marcha aquática (hidro)",
    grupoMuscular: "Corpo todo",
    equipamento: "Piscina",
    objetivo: ["Emagrecimento", "Reabilitação/retorno", "Resistência muscular"],
    nivel: "Iniciante",
    articulacaoPredominante: "Quadril e joelho",
    restricoes: [],
    premium: false,
    resumoPratico:
      "Caminhada dentro da água: o empuxo reduz a carga articular e a resistência da água vira o 'peso'. A porta de entrada clássica para obesidade grave e dor articular.",
    imagem: "/exercises/marcha-aquatica.webp",
    imagemAnalise: "/exercises/marcha-aquatica-analysis.webp",
    modalidade: "m-hidro",
    ativacao: [
      { musculo: "Quadríceps", percentual: 55, papel: "primário" },
      { musculo: "Glúteo máximo", percentual: 50, papel: "sinergista" },
      { musculo: "Posteriores de coxa", percentual: 45, papel: "sinergista" },
      { musculo: "Core", percentual: 42, papel: "estabilizador" },
    ],
    indiceEficiencia: {
      score: 75,
      metrics: [
        { nome: "Conforto articular", valor: 95, tipo: "positivo" },
        { nome: "Gasto energético", valor: 60, tipo: "positivo" },
        { nome: "Estabilidade", valor: 70, tipo: "positivo" },
        { nome: "Demanda de joelho", valor: 15, tipo: "cautela" },
        { nome: "Demanda lombar", valor: 12, tipo: "cautela" },
        { nome: "Complexidade técnica", valor: 18, tipo: "cautela" },
      ],
    },
    fases: [
      { nome: "Passada", descricao: "Passos amplos contra a resistência da água, com o tronco ereto." },
      { nome: "Braçada", descricao: "Os braços varrem a água em oposição às pernas, aumentando o trabalho." },
      { nome: "Ritmo", descricao: "A velocidade da marcha define a intensidade: a água responde ao esforço." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 55,
        titulo: "Empuxo a favor",
        camadas: {
          resumo: "Com água na altura do peito, o peso aparente cai drasticamente.",
          biomecanica: "O empuxo reduz as forças articulares; a resistência da água cresce com a velocidade do movimento.",
          fisiologia: "Permite volume de trabalho em quem não tolera o próprio peso no solo.",
          evidencia: "Adesão inicial tende a ser maior quando a sessão não gera dor.",
          cuidados: "Profundidade ideal: entre o umbigo e o peito. Mais rasa = mais impacto.",
        },
      },
      {
        id: "h2",
        x: 50,
        y: 30,
        titulo: "Monitorar sem FC",
        camadas: {
          resumo: "Na água, use PSE, teste da fala e dispneia, não a FC.",
          biomecanica: "A imersão altera o retorno venoso e a resposta da frequência cardíaca.",
          fisiologia: "A FC subestima o esforço na água; escalas perceptivas são mais fiéis.",
          evidencia: "Guias práticos priorizam PSE/fala no meio aquático.",
          cuidados: "Dispneia desproporcional que não cede com pausa: interromper e reavaliar.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Obesidade grave com baixa tolerância ao solo (fase 1 da jornada).",
        "Dor articular de joelho/lombar que limita a caminhada.",
        "Reconstrução de confiança e adesão nas primeiras semanas.",
      ],
      quandoEvitar: [
        "Sem acesso seguro à piscina ou contraindicação ao meio aquático.",
        "Quando a meta específica é impacto ósseo/força máxima.",
      ],
      errosComuns: [
        "Água rasa demais (aumenta o impacto que se queria evitar).",
        "Andar 'passeando' sem usar braços nem ritmo: estímulo insuficiente.",
        "Tentar guiar a intensidade pela FC dentro da água.",
      ],
      variacoes: [
        "Marcha lateral e para trás: estímulos de quadril diferentes.",
        "Corrida aquática suspensa (deep water): zero impacto.",
        "Com halteres aquáticos: mais resistência para braços.",
      ],
    },
    conteudo: {
      visaoGeral:
        "A marcha aquática usa a física a favor do aluno: o empuxo tira carga das articulações enquanto a resistência da água transforma cada passo em trabalho. É a porta de entrada clássica quando o solo dói.",
      biomecanica:
        "Imerso até o peito, o corpo suporta uma fração do peso; a resistência hidrodinâmica cresce com a velocidade, tornando a intensidade autorregulada pelo próprio ritmo.",
      fisiologia:
        "O trabalho contínuo contra a água eleva a demanda cardiorrespiratória com mínimo estresse articular; a termorregulação facilitada aumenta o conforto de quem sua muito no solo.",
      prescricaoPratica:
        "Sessões de 20–35 min com blocos de marcha em ritmos variados; guie por PSE, teste da fala e dispneia. Progrida ritmo e variações antes de migrar ao solo.",
    },
    trustLevel: "tendência prática",
    temCena: false,
  },

  /* ------------------------------ SENTAR E LEVANTAR ------------------------ */
  {
    id: "e18",
    slug: "sentar-levantar",
    nome: "Sentar e levantar (banco)",
    grupoMuscular: "Membros inferiores",
    equipamento: "Peso corporal",
    objetivo: ["Reabilitação/retorno", "Aprendizado técnico", "Força", "Emagrecimento"],
    nivel: "Iniciante",
    articulacaoPredominante: "Quadril e joelho",
    restricoes: [],
    premium: false,
    resumoPratico:
      "O agachamento mais funcional que existe: levantar de uma cadeira. Base do treino de força para idosos e destreinados, com dose ajustável pela altura do assento.",
    imagem: "/exercises/sentar-levantar.webp",
    imagemAnalise: "/exercises/sentar-levantar-analysis.webp",
    modalidade: "m-funcional",
    ativacao: [
      { musculo: "Quadríceps", percentual: 72, papel: "primário" },
      { musculo: "Glúteo máximo", percentual: 65, papel: "sinergista" },
      { musculo: "Posteriores de coxa", percentual: 40, papel: "sinergista" },
      { musculo: "Core", percentual: 38, papel: "estabilizador" },
    ],
    indiceEficiencia: {
      score: 81,
      metrics: [
        { nome: "Transferência funcional", valor: 95, tipo: "positivo" },
        { nome: "Quadríceps", valor: 72, tipo: "positivo" },
        { nome: "Glúteos", valor: 65, tipo: "positivo" },
        { nome: "Demanda de joelho", valor: 40, tipo: "cautela" },
        { nome: "Demanda lombar", valor: 25, tipo: "cautela" },
        { nome: "Complexidade técnica", valor: 20, tipo: "cautela" },
      ],
    },
    fases: [
      { nome: "Preparo", descricao: "Pés firmes atrás dos joelhos, tronco inclina levemente à frente." },
      { nome: "Subida", descricao: "Quadris e joelhos estendem juntos; o peso sai dos pés, não do impulso." },
      { nome: "Descida", descricao: "Sentar controlado, 'freando' o corpo: a fase que mais ensina." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 55,
        titulo: "Altura do assento = carga",
        camadas: {
          resumo: "Assento mais alto facilita; mais baixo dificulta. É o seu ajuste de carga.",
          biomecanica: "Assentos baixos exigem maior amplitude de joelho e quadril e mais torque extensor.",
          fisiologia: "Progressão por altura permite ganho de força sem carga externa.",
          evidencia: "O teste de sentar-levantar é usado na prática como indicador funcional em idosos.",
          cuidados: "Comece com assento alto e almofadas; retire-as conforme a confiança cresce.",
        },
      },
      {
        id: "h2",
        x: 45,
        y: 35,
        titulo: "Tronco à frente, não curvado",
        camadas: {
          resumo: "Inclinar o tronco à frente é necessário. Curvar as costas, não.",
          biomecanica: "A inclinação leva o centro de massa sobre os pés, permitindo a extensão de quadril.",
          fisiologia: "O padrão correto distribui o trabalho entre quadríceps e glúteos.",
          evidencia: "Usar as mãos nos joelhos no início é regressão válida, não erro.",
          cuidados: "Evite 'despencar' na descida: controle é o objetivo.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Idosos e destreinados começando o trabalho de força.",
        "Reabilitação/retorno com dose finamente ajustável.",
        "Ensinar o padrão de agachamento com uma referência concreta.",
      ],
      quandoEvitar: [
        "Dor aguda de joelho na amplitude escolhida: eleve o assento antes de excluir.",
        "Quando o aluno já domina agachamentos carregados (estímulo insuficiente).",
      ],
      errosComuns: [
        "Usar impulso de tronco em vez de força de pernas.",
        "Pés distantes da cadeira (joelhos viram 'dobradiça' sobrecarregada).",
        "Descer sem controle, 'caindo' no assento.",
      ],
      variacoes: [
        "Com apoio das mãos nos joelhos: regressão.",
        "Com halteres junto ao corpo: progressão de carga.",
        "Unilateral assistido: progressão avançada.",
      ],
    },
    conteudo: {
      visaoGeral:
        "Sentar e levantar é o exercício de força com maior transferência direta para a autonomia: é literalmente o movimento que decide se uma pessoa idosa continua independente.",
      biomecanica:
        "É um agachamento com referência tátil: a altura do assento define amplitude e torque exigidos, permitindo progressão precisa sem carga externa.",
      fisiologia:
        "Trabalha os extensores de joelho e quadril: exatamente a musculatura cuja perda mais compromete a função com a idade.",
      prescricaoPratica:
        "Séries de 6–12 repetições controladas; progrida abaixando o assento, depois adicionando carga. A fase de descida lenta é onde está metade do valor.",
    },
    trustLevel: "regra pedagógica",
    temCena: false,
  },

  /* ------------------------------- PONTE DE GLÚTEOS ------------------------ */
  {
    id: "e19",
    slug: "ponte-gluteos",
    nome: "Ponte de glúteos (solo)",
    grupoMuscular: "Membros inferiores",
    equipamento: "Peso corporal",
    objetivo: ["Reabilitação/retorno", "Hipertrofia", "Aprendizado técnico"],
    nivel: "Iniciante",
    articulacaoPredominante: "Quadril",
    restricoes: [],
    premium: false,
    resumoPratico:
      "Extensão de quadril deitado no solo: ativa glúteos e posteriores com demanda lombar mínima. Amigo número um da dor lombar e a regressão natural do hip thrust.",
    imagem: "/exercises/ponte-gluteos.webp",
    imagemAnalise: "/exercises/ponte-gluteos-analysis.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Glúteo máximo", percentual: 80, papel: "primário" },
      { musculo: "Posteriores de coxa", percentual: 60, papel: "sinergista" },
      { musculo: "Eretores da espinha", percentual: 35, papel: "estabilizador" },
      { musculo: "Core", percentual: 32, papel: "estabilizador" },
    ],
    indiceEficiencia: {
      score: 79,
      metrics: [
        { nome: "Glúteos", valor: 80, tipo: "positivo" },
        { nome: "Segurança lombar", valor: 90, tipo: "positivo" },
        { nome: "Estabilidade", valor: 85, tipo: "positivo" },
        { nome: "Demanda de joelho", valor: 18, tipo: "cautela" },
        { nome: "Demanda lombar", valor: 20, tipo: "cautela" },
        { nome: "Complexidade técnica", valor: 16, tipo: "cautela" },
      ],
    },
    fases: [
      { nome: "Preparo", descricao: "Deitado, joelhos dobrados, pés firmes próximos aos glúteos." },
      { nome: "Elevação", descricao: "O quadril sobe pela contração dos glúteos até alinhar joelho-quadril-ombro." },
      { nome: "Descida", descricao: "Desce controlado, vértebra a vértebra, sem relaxar por completo." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 45,
        titulo: "Subir com o glúteo, não com a lombar",
        camadas: {
          resumo: "O movimento termina quando o quadril alinha: arquear mais é lombar, não glúteo.",
          biomecanica: "Hiperextender a lombar no topo transfere o trabalho para os eretores e estressa a coluna.",
          fisiologia: "A contração deliberada do glúteo no topo ('apertar') melhora o recrutamento.",
          evidencia: "Sentir a lombar em vez do glúteo é o sinal prático de padrão errado.",
          cuidados: "Pause 1–2 s no topo com o glúteo contraído antes de descer.",
        },
      },
      {
        id: "h2",
        x: 60,
        y: 60,
        titulo: "Posição dos pés",
        camadas: {
          resumo: "Pés perto dos glúteos = mais glúteo; longe = mais posteriores.",
          biomecanica: "A distância dos pés muda o braço de momento entre joelho e quadril.",
          fisiologia: "Ajustar a posição direciona o estímulo sem trocar de exercício.",
          evidencia: "Cãibra nos posteriores costuma indicar pés longe demais.",
          cuidados: "Calcanhares firmes no chão: empurrar pela ponta do pé muda o padrão.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Dor lombar: fortalecer glúteos com coluna apoiada.",
        "Regressão/porta de entrada para o hip thrust.",
        "Ativação de glúteos no aquecimento.",
      ],
      quandoEvitar: [
        "Quando o aluno já progrediu para hip thrust carregado (estímulo insuficiente).",
        "Desconforto agudo mesmo na amplitude parcial.",
      ],
      errosComuns: [
        "Hiperextender a lombar no topo do movimento.",
        "Empurrar pela ponta dos pés em vez dos calcanhares.",
        "Subir e descer rápido, sem pausa no topo.",
      ],
      variacoes: [
        "Ponte com pausa longa (3–5 s): mais tempo sob tensão.",
        "Ponte unilateral: progressão sem carga.",
        "Hip thrust no banco: progressão com carga.",
      ],
    },
    conteudo: {
      visaoGeral:
        "A ponte de glúteos entrega o essencial da extensão de quadril com o corpo apoiado no chão. Simplicidade, segurança e um alvo claro: aprender a usar o glúteo.",
      biomecanica:
        "Com o tronco apoiado, a coluna trabalha em posição neutra e estável; o torque concentra-se no quadril, com demanda mínima de joelho e lombar.",
      fisiologia:
        "O glúteo máximo atinge boa ativação no topo do movimento; pausas isométricas aumentam o tempo sob tensão sem precisar de carga.",
      prescricaoPratica:
        "Séries de 10–15 com pausa de 1–2 s no topo. Progrida para unilateral e depois hip thrust quando 15 repetições ficarem fáceis.",
    },
    trustLevel: "tendência prática",
    temCena: false,
  },

  /* -------------------------------- PRANCHA FRONTAL ------------------------ */
  {
    id: "e20",
    slug: "prancha-frontal",
    nome: "Prancha alta",
    grupoMuscular: "Core (tronco)",
    equipamento: "Peso corporal",
    objetivo: ["Resistência muscular", "Aprendizado técnico", "Reabilitação/retorno"],
    nivel: "Iniciante",
    articulacaoPredominante: "Coluna (isometria)",
    restricoes: [],
    premium: false,
    resumoPratico:
      "Isometria de core que ensina o tronco a resistir ao movimento, a base da estabilidade que protege a coluna em todos os outros exercícios.",
    imagem: "/exercises/prancha-frontal.webp",
    imagemAnalise: "/exercises/prancha-frontal-analysis.webp",
    modalidade: "m-funcional",
    ativacao: [
      { musculo: "Reto abdominal", percentual: 70, papel: "primário" },
      { musculo: "Oblíquos", percentual: 60, papel: "sinergista" },
      { musculo: "Core", percentual: 75, papel: "primário" },
      { musculo: "Deltoide", percentual: 30, papel: "estabilizador" },
    ],
    indiceEficiencia: {
      score: 77,
      metrics: [
        { nome: "Estabilidade de tronco", valor: 88, tipo: "positivo" },
        { nome: "Core", valor: 75, tipo: "positivo" },
        { nome: "Segurança lombar", valor: 82, tipo: "positivo" },
        { nome: "Demanda de ombro", valor: 35, tipo: "cautela" },
        { nome: "Demanda lombar", valor: 22, tipo: "cautela" },
        { nome: "Complexidade técnica", valor: 25, tipo: "cautela" },
      ],
    },
    fases: [
      { nome: "Montagem", descricao: "Mãos no chão sob os ombros, braços estendidos, corpo em linha reta." },
      { nome: "Sustentação", descricao: "Abdômen e glúteos contraídos; respiração contínua, sem prender o ar." },
      { nome: "Saída", descricao: "Joelhos ao chão de forma controlada, terminando antes de perder a linha." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 50,
        titulo: "Linha reta = quadril na altura certa",
        camadas: {
          resumo: "Nem quadril caído (lombar sofre) nem empinado (abdômen desliga).",
          biomecanica: "O quadril caído joga a coluna em hiperextensão passiva sob carga.",
          fisiologia: "A cocontração de abdômen e glúteos mantém a pelve neutra.",
          evidencia: "Tremer é esperado; perder a linha é o sinal de parar.",
          cuidados: "Melhor 3 × 20 s bem feitos que 1 min desmontando.",
        },
      },
      {
        id: "h2",
        x: 30,
        y: 45,
        titulo: "Respirar na isometria",
        camadas: {
          resumo: "Respiração contínua: prender o ar eleva a pressão arterial.",
          biomecanica: "É possível manter rigidez de tronco expirando com controle.",
          fisiologia: "A apneia (Valsalva) eleva a resposta pressórica: cautela em hipertensos.",
          evidencia: "Conseguir falar uma frase curta durante a prancha é um bom teste.",
          cuidados: "Hipertensos: séries curtas com respiração fluida, nunca no limite.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Construir estabilidade de tronco para todos os outros exercícios.",
        "Dor lombar: fortalecer o core sem movimento de coluna.",
        "Aquecimento e educação postural.",
      ],
      quandoEvitar: [
        "Hipertensos que ainda prendem a respiração: ensine a respirar antes.",
        "Dor de ombro ou punho no apoio das mãos: use os antebraços ou eleve o apoio.",
      ],
      errosComuns: [
        "Quadril caído (lombar em hiperextensão).",
        "Prender a respiração a série inteira.",
        "Buscar tempo máximo em vez de qualidade de posição.",
      ],
      variacoes: [
        "Prancha nos antebraços: clássica; menos demanda de punho.",
        "Prancha inclinada (mãos no banco): regressão.",
        "Prancha com joelhos apoiados: regressão.",
        "Prancha com toque de ombro: progressão dinâmica.",
      ],
    },
    conteudo: {
      visaoGeral:
        "A prancha ensina o core a fazer seu trabalho real: impedir movimento indesejado da coluna. É pré-requisito silencioso de quase tudo que se faz em pé com carga.",
      biomecanica:
        "Na isometria, abdômen, oblíquos e glúteos cocontraem para manter a pelve e a coluna neutras contra a gravidade: resistência ao movimento, não produção dele.",
      fisiologia:
        "O estímulo é de resistência muscular local e controle motor; séries curtas e frequentes consolidam o padrão melhor que testes de tempo máximo.",
      prescricaoPratica:
        "3–4 séries de 15–40 s com técnica impecável e respiração contínua. Progrida por instabilidade e variações dinâmicas, não só por tempo.",
    },
    trustLevel: "princípio biomecânico",
    temCena: false,
  },

  /* ---------------------------------- DEAD BUG ----------------------------- */
  {
    id: "e21",
    slug: "dead-bug",
    nome: "Dead bug (controle de core)",
    grupoMuscular: "Core (tronco)",
    equipamento: "Peso corporal",
    objetivo: ["Reabilitação/retorno", "Aprendizado técnico", "Resistência muscular"],
    nivel: "Iniciante",
    articulacaoPredominante: "Coluna (estabilidade) + quadril e ombro",
    restricoes: [],
    premium: true,
    resumoPratico:
      "Braços e pernas se movem enquanto a lombar permanece imóvel no chão. É o exercício-professor do controle de core, queridinho da dor lombar.",
    imagem: "/exercises/dead-bug.webp",
    imagemAnalise: "/exercises/dead-bug-analysis.webp",
    modalidade: "m-funcional",
    ativacao: [
      { musculo: "Core", percentual: 72, papel: "primário" },
      { musculo: "Reto abdominal", percentual: 62, papel: "primário" },
      { musculo: "Oblíquos", percentual: 55, papel: "sinergista" },
      { musculo: "Quadríceps", percentual: 25, papel: "estabilizador" },
    ],
    indiceEficiencia: {
      score: 78,
      metrics: [
        { nome: "Controle motor", valor: 92, tipo: "positivo" },
        { nome: "Core", valor: 72, tipo: "positivo" },
        { nome: "Segurança lombar", valor: 94, tipo: "positivo" },
        { nome: "Demanda de ombro", valor: 15, tipo: "cautela" },
        { nome: "Demanda lombar", valor: 10, tipo: "cautela" },
        { nome: "Complexidade técnica", valor: 35, tipo: "cautela" },
      ],
    },
    fases: [
      { nome: "Posição", descricao: "Deitado, quadris e joelhos a 90°, braços ao teto, lombar tocando o chão." },
      { nome: "Extensão", descricao: "Braço e perna OPOSTOS estendem devagar sem a lombar descolar do solo." },
      { nome: "Retorno", descricao: "Volta ao centro com controle e troca o lado, mantendo a respiração." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 45,
        y: 55,
        titulo: "Lombar colada no chão",
        camadas: {
          resumo: "A regra única do exercício: a lombar não descola nem arqueia.",
          biomecanica: "Estender braço e perna cria um torque de extensão que o abdômen precisa anular.",
          fisiologia: "É controle motor puro: o core aprende a estabilizar enquanto os membros se movem.",
          evidencia: "Colocar a mão sob a lombar dá feedback tátil imediato ao aluno.",
          cuidados: "Se a lombar descola, reduza a amplitude da extensão. Não insista.",
        },
      },
      {
        id: "h2",
        x: 55,
        y: 35,
        titulo: "Devagar é o nível difícil",
        camadas: {
          resumo: "A lentidão é a progressão: rápido é mais fácil e ensina menos.",
          biomecanica: "Movimentos lentos exigem estabilização contínua, não impulso.",
          fisiologia: "Mais tempo sob tensão do core por repetição.",
          evidencia: "Alunos que dominam o lento raramente perdem a posição no rápido.",
          cuidados: "Expire durante a extensão: facilita manter a pelve neutra.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Dor lombar: core forte sem nenhuma carga na coluna.",
        "Ensinar dissociação quadril-lombar antes de exercícios em pé.",
        "Ativação em aquecimentos de qualquer nível.",
      ],
      quandoEvitar: [
        "Quando o padrão já está dominado e o objetivo é força: progrida.",
        "Desconforto no pescoço: apoie a cabeça e reavalie.",
      ],
      errosComuns: [
        "Deixar a lombar arquear na extensão dos membros.",
        "Mover braço e perna do MESMO lado (perde o desafio rotacional).",
        "Fazer rápido demais, com impulso.",
      ],
      variacoes: [
        "Só pernas (mãos no chão): regressão.",
        "Com elástico entre mãos e pés: progressão.",
        "Isometria contralateral sustentada: variação de tempo.",
      ],
    },
    conteudo: {
      visaoGeral:
        "O dead bug inverte a lógica do abdominal tradicional: em vez de dobrar a coluna, o desafio é impedi-la de se mover enquanto braços e pernas trabalham, exatamente o que o core faz na vida real.",
      biomecanica:
        "Cada extensão contralateral cria um torque que tende a arquear a lombar; o abdômen anula esse torque mantendo a pelve em neutro, com carga compressiva mínima.",
      fisiologia:
        "Treina o timing de ativação do core (controle motor) mais que força bruta, a qualidade que costuma faltar em quadros de dor lombar inespecífica.",
      prescricaoPratica:
        "2–3 séries de 6–10 repetições LENTAS por lado, com expiração na extensão. A mão sob a lombar é o melhor professor nas primeiras sessões.",
    },
    trustLevel: "princípio biomecânico",
    temCena: false,
  },

  /* ------------------------------- REMADA ELÁSTICA ------------------------- */
  {
    id: "e22",
    slug: "remada-elastica",
    nome: "Remada com elástico",
    grupoMuscular: "Costas",
    equipamento: "Elástico",
    objetivo: ["Resistência muscular", "Aprendizado técnico", "Reabilitação/retorno"],
    nivel: "Iniciante",
    articulacaoPredominante: "Ombro e escápula",
    restricoes: [],
    premium: false,
    resumoPratico:
      "Puxada horizontal com banda elástica: costas e postura treinadas em casa, sem academia. A resistência progressiva do elástico perdoa e ensina.",
    imagem: "/exercises/remada-elastica.webp",
    imagemAnalise: "/exercises/remada-elastica-analysis.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Latíssimo do dorso", percentual: 65, papel: "primário" },
      { musculo: "Romboides", percentual: 62, papel: "primário" },
      { musculo: "Bíceps", percentual: 45, papel: "sinergista" },
      { musculo: "Deltoide", percentual: 35, papel: "estabilizador" },
    ],
    indiceEficiencia: {
      score: 74,
      metrics: [
        { nome: "Costas", valor: 65, tipo: "positivo" },
        { nome: "Acessibilidade", valor: 95, tipo: "positivo" },
        { nome: "Estabilidade", valor: 70, tipo: "positivo" },
        { nome: "Demanda de ombro", valor: 30, tipo: "cautela" },
        { nome: "Demanda lombar", valor: 20, tipo: "cautela" },
        { nome: "Complexidade técnica", valor: 22, tipo: "cautela" },
      ],
    },
    fases: [
      { nome: "Alongar", descricao: "Braços à frente, elástico já com leve tensão, ombros longe das orelhas." },
      { nome: "Puxar", descricao: "Cotovelos deslizam para trás rente ao corpo; as escápulas se aproximam." },
      { nome: "Retornar", descricao: "Devolve devagar, resistindo ao elástico, sem deixar ele 'ganhar'." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 40,
        titulo: "Escápulas primeiro",
        camadas: {
          resumo: "A remada começa aproximando as escápulas, não dobrando os cotovelos.",
          biomecanica: "A retração escapular ativa romboides e trapézio médio antes dos braços.",
          fisiologia: "Puxar só com os braços transfere o trabalho para o bíceps.",
          evidencia: "Sentir 'entre as escápulas' é o feedback prático correto.",
          cuidados: "Ombros encolhidos junto às orelhas = tensão indevida de trapézio superior.",
        },
      },
      {
        id: "h2",
        x: 60,
        y: 55,
        titulo: "A volta vale tanto quanto a ida",
        camadas: {
          resumo: "Resistir ao elástico no retorno dobra o valor de cada repetição.",
          biomecanica: "A fase excêntrica sob a tração crescente do elástico mantém tensão contínua.",
          fisiologia: "A resistência elástica cresce com o alongamento, com pico no fim da puxada.",
          evidencia: "Retornos 'chicoteados' são o erro mais comum com bandas.",
          cuidados: "Verifique o estado do elástico e a ancoragem antes de cada série.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Treino em casa ou sem acesso a academia.",
        "Contraponto postural ao dia inteiro sentado.",
        "Aprendizado do padrão de remada antes das cargas.",
      ],
      quandoEvitar: [
        "Quando há acesso a cargas e o elástico ficou leve (progrida).",
        "Dor de ombro na trajetória: ajuste ângulo e amplitude.",
      ],
      errosComuns: [
        "Puxar só com os braços, sem retração escapular.",
        "Devolver o elástico rápido, sem resistir.",
        "Tronco balançando para 'ajudar' a puxada.",
      ],
      variacoes: [
        "Remada unilateral: corrige assimetrias.",
        "Pegada aberta (puxada alta): ênfase em trapézio médio.",
        "Elástico mais forte ou duplo: progressão de carga.",
      ],
    },
    conteudo: {
      visaoGeral:
        "A remada elástica democratiza o treino de costas: uma banda e um ponto de ancoragem bastam para trabalhar a musculatura que sustenta a postura: em casa, em viagem, em qualquer lugar.",
      biomecanica:
        "A tração do elástico cresce ao longo da puxada, com pico exatamente na retração escapular completa, um perfil de resistência que favorece o fim do movimento.",
      fisiologia:
        "Ideal para resistência muscular e reeducação do padrão; a tensão contínua (ida e volta) compensa a carga absoluta menor.",
      prescricaoPratica:
        "2–4 séries de 12–20 repetições com pausa de 1 s na retração. Progrida por espessura da banda, tempo sob tensão e variações unilaterais.",
    },
    trustLevel: "tendência prática",
    temCena: false,
  },

  /* --------------------------- PANTURRILHA EM PÉ --------------------------- */
  {
    id: "e23",
    slug: "panturrilha-em-pe",
    nome: "Elevação de panturrilha em pé",
    grupoMuscular: "Membros inferiores",
    equipamento: "Peso corporal",
    objetivo: ["Hipertrofia", "Resistência muscular", "Reabilitação/retorno"],
    nivel: "Iniciante",
    articulacaoPredominante: "Tornozelo",
    restricoes: [],
    premium: true,
    resumoPratico:
      "Flexão plantar em pé: a 'segunda bomba' circulatória do corpo. Simples, sem equipamento e decisiva para caminhada, equilíbrio e saúde vascular de membros inferiores.",
    imagem: "/exercises/panturrilha-em-pe.webp",
    imagemAnalise: "/exercises/panturrilha-em-pe-analysis.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Panturrilha", percentual: 88, papel: "primário" },
      { musculo: "Tibial anterior", percentual: 30, papel: "estabilizador" },
      { musculo: "Core", percentual: 25, papel: "estabilizador" },
      { musculo: "Quadríceps", percentual: 20, papel: "estabilizador" },
    ],
    indiceEficiencia: {
      score: 75,
      metrics: [
        { nome: "Panturrilha", valor: 88, tipo: "positivo" },
        { nome: "Acessibilidade", valor: 92, tipo: "positivo" },
        { nome: "Equilíbrio", valor: 60, tipo: "positivo" },
        { nome: "Demanda de joelho", valor: 12, tipo: "cautela" },
        { nome: "Demanda lombar", valor: 8, tipo: "cautela" },
        { nome: "Complexidade técnica", valor: 14, tipo: "cautela" },
      ],
    },
    fases: [
      { nome: "Subida", descricao: "Eleva os calcanhares o máximo possível, peso sobre o hálux (dedão)." },
      { nome: "Pico", descricao: "Pausa de 1–2 s no topo, panturrilha contraída, sem pressa." },
      { nome: "Descida", descricao: "Baixa lentamente até o alongamento completo (no degrau, além da linha)." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 70,
        titulo: "Amplitude completa",
        camadas: {
          resumo: "Do alongamento total (no degrau) à ponta máxima: a amplitude é o exercício.",
          biomecanica: "Trabalhar só o meio do arco encurta o estímulo e o ganho de mobilidade de tornozelo.",
          fisiologia: "O sóleo e o gastrocnêmio respondem melhor ao arco completo com pausa no topo.",
          evidencia: "A pausa no pico elimina o 'quicar' elástico que rouba trabalho do músculo.",
          cuidados: "No degrau, segure em um apoio: equilíbrio não é o objetivo aqui.",
        },
      },
      {
        id: "h2",
        x: 45,
        y: 50,
        titulo: "Joelho esticado × dobrado",
        camadas: {
          resumo: "Joelho estendido enfatiza o gastrocnêmio; dobrado, o sóleo.",
          biomecanica: "O gastrocnêmio cruza o joelho: flexioná-lo o coloca em desvantagem.",
          fisiologia: "As duas versões se complementam para o volume total da panturrilha.",
          evidencia: "Panturrilhas costumam tolerar (e pedir) mais volume que outros grupos.",
          cuidados: "Em tendinopatias, comece pela versão sentada/dobrada, mais suave.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Suporte à caminhada e à corrida (absorção e propulsão).",
        "Idosos: força de tornozelo é peça-chave do equilíbrio.",
        "Saúde vascular de membros inferiores (retorno venoso).",
      ],
      quandoEvitar: [
        "Dor aguda no tendão calcâneo: regrida amplitude e carga.",
        "Como único trabalho de membros inferiores (é complemento).",
      ],
      errosComuns: [
        "Quicar no fundo usando o reflexo elástico.",
        "Amplitude parcial, sem alongamento nem pico.",
        "Pressa: a panturrilha responde a repetições lentas e completas.",
      ],
      variacoes: [
        "No degrau: amplitude ampliada.",
        "Unilateral: progressão de carga natural.",
        "Sentada (joelho a 90°): ênfase no sóleo.",
      ],
    },
    conteudo: {
      visaoGeral:
        "A elevação de panturrilha é discreta e subestimada: além da estética, a força de flexão plantar sustenta caminhada, corrida, equilíbrio e o retorno venoso das pernas.",
      biomecanica:
        "A flexão plantar contra o peso corporal move toda a carga sobre a articulação do tornozelo; o degrau amplia a amplitude e o estímulo de mobilidade.",
      fisiologia:
        "Gastrocnêmio e sóleo têm perfis mistos de fibras e toleram volume alto; a bomba muscular da panturrilha auxilia o retorno venoso, com relevância direta em diabetes e sedentarismo.",
      prescricaoPratica:
        "3–4 séries de 12–20 lentas, com pausa no topo e alongamento no fundo. Progrida para unilateral e depois carga externa.",
    },
    trustLevel: "tendência prática",
    temCena: false,
  },
];
