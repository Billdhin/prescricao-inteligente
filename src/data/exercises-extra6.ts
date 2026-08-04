import type { Exercise, EficMetric } from "./types";

/**
 * Sexta expansão do catálogo (e77 em diante): LOTES D, F e o A8.
 *
 * Profundidade em peitorais e costas (o catálogo tinha 4 e 6, quase tudo remada),
 * mais opções aeróbias fora da esteira e da bicicleta, e o último item de core que
 * faltava do lote A. Não abre músculo novo na matriz: abre ESCOLHA, que é o que o
 * botão "Trocar" e um plano de 12 semanas precisam para não repetir.
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

export const extraExercises6: Exercise[] = [
  /* ==================== LOTE D: PEITORAIS E COSTAS ==================== */
  {
    id: "e77",
    slug: "supino-inclinado-halteres",
    nome: "Supino inclinado com halteres",
    grupoMuscular: "Peitorais",
    equipamento: "Halter",
    objetivo: ["Hipertrofia", "Força"],
    nivel: "Intermediário",
    articulacaoPredominante: "Ombro e cotovelo",
    restricoes: ["Ombro sensível"],
    premium: false,
    resumoPratico:
      "Banco a cerca de 30 graus: a inclinação desloca a ênfase para a porção superior do peitoral, que o supino horizontal alcança menos.",
    anguloArticular: "Banco a cerca de 30 graus, cotovelo a cerca de 45 graus do tronco",
    imagem: "/exercises/supino-inclinado-halteres.webp",
    imagemAnalise: "/exercises/supino-inclinado-halteres-analysis.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Peitoral maior", percentual: 74, papel: "primário" },
      { musculo: "Deltoide anterior", percentual: 58, papel: "sinergista" },
      { musculo: "Tríceps braquial", percentual: 50, papel: "sinergista" },
      { musculo: "Serrátil anterior", percentual: 25, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 81, metrics: m("Peitoral maior", 74, 35, 15, 5, 45, 30) },
    fases: [
      { nome: "Posição", descricao: "Deitado no banco a cerca de 30 graus, halteres na altura do peito, escápulas encaixadas." },
      { nome: "Empurrada", descricao: "Empurra os halteres para cima e levemente para dentro, sem travar os cotovelos." },
      { nome: "Descida", descricao: "Desce em 3 segundos até sentir o alongamento, cotovelos a cerca de 45 graus." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 38,
        titulo: "30 graus, não 60",
        camadas: {
          resumo: "Passar de 45 graus troca peitoral por deltoide anterior.",
          biomecanica:
            "A inclinação alinha a linha de empurrar com as fibras superiores do peitoral. Acima de 45 graus, a direção do movimento se aproxima do desenvolvimento e o deltoide assume.",
          fisiologia:
            "A porção clavicular do peitoral costuma receber menos estímulo no supino horizontal, e a inclinação moderada é a correção.",
          evidencia:
            "Rodríguez-Ridao e colaboradores compararam cinco inclinações de banco por eletromiografia: o horizontal ativa bem o peitoral, 30 graus enfatiza a porção superior e acima de 45 graus cresce o deltoide anterior.",
          cuidados: "Escápulas encaixadas no banco protegem o ombro em toda a série.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Quando o plano já tem supino horizontal e precisa de ênfase superior.",
        "Mesociclo de hipertrofia de peitoral.",
        "Aluno que prefere halteres pela liberdade de trajetória.",
      ],
      quandoEvitar: [
        "Ombro sensível que dói na descida com halteres.",
        "Aluno sem quem observe, na primeira vez com carga alta.",
      ],
      errosComuns: [
        "Inclinar o banco além de 45 graus e transformar em desenvolvimento.",
        "Soltar as escápulas do banco durante a empurrada.",
        "Bater os halteres um no outro no alto e perder tensão.",
      ],
      variacoes: [
        "Com barra: mais carga, menos liberdade de trajetória.",
        "Pegada neutra: mais confortável para o ombro sensível.",
        "Com pausa de 1 s embaixo: mais controle e mais tempo sob tensão.",
      ],
    },
    conteudo: {
      visaoGeral:
        "Segunda opção de empurrar com halteres do catálogo, com ênfase diferente da do supino horizontal. Existe para dar variação real dentro de um mesociclo de peitoral, e não só um nome novo.",
      biomecanica:
        "A inclinação muda a direção da adução horizontal, o que redistribui o esforço entre as porções do peitoral. Halteres permitem que as mãos convirjam no alto, o que aumenta a adução no fim.",
      fisiologia:
        "A ativação por inclinação foi medida em cinco ângulos, e 30 graus é o melhor compromisso entre ênfase superior e participação do deltoide.",
      prescricaoPratica:
        "Em geral, 3 séries de 8 a 12 repetições com descida de 3 s. Mantenha o banco em torno de 30 graus: além disso o exercício muda de músculo sem mudar de nome.",
    },
    trustLevel: "princípio biomecânico",
    temCena: false,
  },

  {
    id: "e78",
    slug: "crucifixo-maquina",
    nome: "Crucifixo na máquina",
    grupoMuscular: "Peitorais",
    equipamento: "Máquina",
    objetivo: ["Hipertrofia", "Aprendizado técnico"],
    nivel: "Iniciante",
    articulacaoPredominante: "Ombro",
    restricoes: ["Ombro sensível"],
    premium: false,
    resumoPratico:
      "Peitoral sem participação do tríceps: a máquina guia a trajetória e o cotovelo quase não se move.",
    anguloArticular: "Adução horizontal de ombro com cotovelo fixo",
    imagem: "/exercises/crucifixo-maquina.webp",
    imagemAnalise: "/exercises/crucifixo-maquina-analysis.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Peitoral maior", percentual: 72, papel: "primário" },
      { musculo: "Deltoide anterior", percentual: 40, papel: "sinergista" },
      { musculo: "Serrátil anterior", percentual: 22, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 74, metrics: m("Peitoral maior", 72, 12, 10, 5, 40, 30) },
    fases: [
      { nome: "Posição", descricao: "Sentado com as costas apoiadas, antebraços nos apoios e cotovelos na altura do ombro." },
      { nome: "Fechamento", descricao: "Junta os braços à frente do peito sem empurrar com as mãos." },
      { nome: "Abertura", descricao: "Abre em 3 segundos até sentir o alongamento, sem deixar a placa bater." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 38,
        titulo: "O cotovelo não dobra",
        camadas: {
          resumo: "Se o cotovelo dobra e estende, o tríceps entrou e virou supino.",
          biomecanica:
            "O crucifixo é adução horizontal pura de ombro. Manter o ângulo do cotovelo constante é o que isola o peitoral do resto do empurrar.",
          fisiologia:
            "Sem o tríceps como elo fraco, o peitoral chega mais perto da própria falha, o que é útil no fim da sessão.",
          evidencia:
            "Boeckh-Behrens e Buskies documentam o perfil de ativação dos exercícios de adução horizontal de peitoral por eletromiografia.",
          cuidados: "Abertura além do confortável estressa a frente do ombro.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Peitoral isolado no fim da sessão, depois de supino ou flexão.",
        "Aluno iniciante que ainda não controla halteres.",
        "Quando o tríceps já está fatigado e limitaria o empurrar.",
      ],
      quandoEvitar: [
        "Dor à frente do ombro na abertura.",
        "Aparelho que não regula a abertura inicial ao ombro do aluno.",
      ],
      errosComuns: [
        "Regular a abertura inicial além da tolerância do ombro.",
        "Dobrar e estender o cotovelo, transformando em supino.",
        "Deixar a placa bater no fim da abertura.",
      ],
      variacoes: [
        "Abertura inicial reduzida: para ombro sensível.",
        "Com pausa de 2 s fechado: mais tempo sob tensão.",
        "Um braço por vez: expõe assimetria.",
      ],
    },
    conteudo: {
      visaoGeral:
        "Peitoral tinha quatro exercícios no catálogo, todos com participação de tríceps. Este é o primeiro que isola de verdade, com trajetória guiada e baixa exigência técnica.",
      biomecanica:
        "A máquina fixa o cotovelo e conduz a adução horizontal. O peitoral trabalha do alongamento ao encurtamento sem o tríceps como elo intermediário.",
      fisiologia:
        "Rende bem como último exercício de peitoral da sessão, quando o tríceps já cansou e limitaria a carga em qualquer empurrar.",
      prescricaoPratica:
        "Em geral, 3 séries de 12 a 15 repetições com abertura em 3 s. Regule a abertura inicial pelo conforto do ombro, nunca pelo máximo do aparelho.",
    },
    trustLevel: "regra pedagógica",
    temCena: false,
  },

  {
    id: "e79",
    slug: "crossover-polia",
    nome: "Crossover na polia",
    grupoMuscular: "Peitorais",
    equipamento: "Polia",
    objetivo: ["Hipertrofia"],
    nivel: "Intermediário",
    articulacaoPredominante: "Ombro",
    restricoes: ["Ombro sensível"],
    premium: false,
    resumoPratico:
      "Cabos cruzando à frente do corpo: tensão constante do começo ao fim, o que nem halter nem barra conseguem entregar.",
    anguloArticular: "Adução horizontal de ombro com cotovelo em leve flexão",
    imagem: "/exercises/crossover-polia.webp",
    imagemAnalise: "/exercises/crossover-polia-analysis.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Peitoral maior", percentual: 70, papel: "primário" },
      { musculo: "Deltoide anterior", percentual: 42, papel: "sinergista" },
      { musculo: "Serrátil anterior", percentual: 25, papel: "estabilizador" },
      { musculo: "Transverso do abdome", percentual: 22, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 76, metrics: m("Peitoral maior", 70, 30, 18, 8, 38, 30) },
    fases: [
      { nome: "Posição", descricao: "Em pé entre as polias altas, um pé à frente, cotovelos em leve flexão." },
      { nome: "Fechamento", descricao: "Traz as mãos à frente do corpo cruzando levemente, sem dobrar mais o cotovelo." },
      { nome: "Abertura", descricao: "Abre em 3 segundos controlando a tração, sem deixar o ombro ir à frente." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 40,
        titulo: "Tensão que não some no topo",
        camadas: {
          resumo: "Com halteres, o topo do crucifixo perde quase toda a resistência.",
          biomecanica:
            "A gravidade puxa em linha reta para baixo, então no alto do crucifixo com halteres o braço de alavanca some. O cabo mantém a linha de tração horizontal do começo ao fim.",
          fisiologia:
            "A tensão constante mantém o peitoral carregado justamente na posição encurtada, que é onde as versões com peso livre ficam fáceis.",
          evidencia:
            "Boeckh-Behrens e Buskies comparam o perfil de ativação entre exercícios de peitoral com peso livre e com cabo.",
          cuidados: "Cruzar demais no fim aproxima o ombro do limite anterior.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Quando se quer tensão no fim do movimento, que o halter não dá.",
        "Fim de sessão de peitoral, com carga moderada.",
        "Aluno intermediário que já controla a posição do ombro.",
      ],
      quandoEvitar: [
        "Dor à frente do ombro na abertura.",
        "Aluno que ainda dobra o cotovelo para vencer a carga.",
      ],
      errosComuns: [
        "Dobrar o cotovelo durante o fechamento, transformando em empurrar.",
        "Inclinar o tronco à frente para ajudar com o peso do corpo.",
        "Cruzar as mãos além do confortável para o ombro.",
      ],
      variacoes: [
        "Polias baixas: ênfase na porção superior do peitoral.",
        "Polias na altura do ombro: linha mais neutra.",
        "Um braço por vez: expõe assimetria e acrescenta antirrotação.",
      ],
    },
    conteudo: {
      visaoGeral:
        "Terceira opção de isolamento de peitoral, e a única com tensão constante. Complementa o crucifixo na máquina, que carrega mais o alongamento.",
      biomecanica:
        "A linha de tração do cabo permanece aproximadamente horizontal durante toda a adução, então o peitoral fica carregado inclusive na posição encurtada.",
      fisiologia:
        "Cobrir a curva de força inteira ao longo do macrociclo pede exercícios com perfis diferentes: alongado na máquina, encurtado no crossover.",
      prescricaoPratica:
        "Em geral, 3 séries de 12 a 15 repetições com abertura em 3 s. Mantenha o ângulo do cotovelo fixo: essa é a diferença entre crucifixo e empurrar.",
    },
    trustLevel: "princípio biomecânico",
    temCena: false,
  },

  {
    id: "e80",
    slug: "flexao-apoio-elevado",
    nome: "Flexão de braço com apoio elevado",
    grupoMuscular: "Peitorais",
    equipamento: "Peso corporal",
    objetivo: ["Retorno ao treino", "Resistência muscular", "Aprendizado técnico"],
    nivel: "Iniciante",
    articulacaoPredominante: "Ombro e cotovelo",
    restricoes: ["Ombro sensível"],
    premium: false,
    resumoPratico:
      "Flexão com as mãos numa bancada: o mesmo padrão de empurrar sem precisar descer ao chão nem levantar dele.",
    anguloArticular: "Cotovelo a cerca de 45 graus do tronco, inclinação conforme a altura do apoio",
    imagem: "/exercises/flexao-apoio-elevado.webp",
    imagemAnalise: "/exercises/flexao-apoio-elevado-analysis.webp",
    modalidade: "m-funcional",
    ativacao: [
      { musculo: "Peitoral maior", percentual: 60, papel: "primário" },
      { musculo: "Tríceps braquial", percentual: 52, papel: "sinergista" },
      { musculo: "Deltoide anterior", percentual: 45, papel: "sinergista" },
      { musculo: "Transverso do abdome", percentual: 32, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 75, metrics: m("Peitoral maior", 60, 18, 20, 8, 35, 20) },
    fases: [
      { nome: "Posição", descricao: "Mãos no apoio elevado na largura dos ombros, corpo em linha reta dos pés à cabeça." },
      { nome: "Descida", descricao: "Desce o peito na direção do apoio com os cotovelos a cerca de 45 graus." },
      { nome: "Empurrada", descricao: "Empurra até estender, sem deixar o quadril cair nem subir." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 42,
        titulo: "A altura é a carga",
        camadas: {
          resumo: "Quanto mais alto o apoio, menor a parcela do peso do corpo que os braços sustentam.",
          biomecanica:
            "Elevar as mãos reduz a fração do peso corporal aplicada aos braços. Do balcão da cozinha até o chão existe uma escala contínua de dificuldade.",
          fisiologia:
            "Permite trabalhar na faixa de 8 a 15 repetições em qualquer nível de força, só mudando o móvel.",
          evidencia:
            "Rodríguez-Ridao e colaboradores documentam como o ângulo do tronco redistribui o esforço entre peitoral, deltoide e tríceps no empurrar.",
          cuidados: "Apoio precisa ser estável; bancada com rodas é risco de queda.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Aluno com obesidade ou dificuldade de descer ao chão e levantar.",
        "Retorno ao treino, antes de a flexão no chão ser viável.",
        "Treino em casa usando a bancada da cozinha.",
      ],
      quandoEvitar: [
        "Punho sensível sem apoio adaptado.",
        "Apoio instável ou escorregadio.",
      ],
      errosComuns: [
        "Deixar o quadril cair e perder a linha do corpo.",
        "Abrir os cotovelos a 90 graus, estressando o ombro.",
        "Descer pouco e encurtar o estímulo sem necessidade.",
      ],
      variacoes: [
        "Apoio mais alto: regressão imediata.",
        "Apoio mais baixo: progressão sem trocar de exercício.",
        "Com pausa de 1 s embaixo: mais controle.",
      ],
    },
    conteudo: {
      visaoGeral:
        "Resolve para o empurrar o mesmo problema que a prancha no banco resolveu para o core: quem não desce ao chão perdia o padrão inteiro.",
      biomecanica:
        "O padrão é o da flexão de braço: adução horizontal de ombro com extensão de cotovelo, e o abdômen sustentando a prancha. A altura do apoio decide a carga.",
      fisiologia:
        "Como a escala de dificuldade é contínua, dá para manter o aluno na faixa de repetições desejada por meses sem mudar de exercício.",
      prescricaoPratica:
        "Em geral, 3 séries de 8 a 15 repetições. Escolha a altura em que a última repetição ainda saia com a linha do corpo mantida, e baixe o apoio quando 15 ficarem fáceis.",
    },
    trustLevel: "regra pedagógica",
    temCena: false,
  },

  {
    id: "e81",
    slug: "puxada-supinada",
    nome: "Puxada com pegada supinada",
    grupoMuscular: "Costas",
    equipamento: "Máquina",
    objetivo: ["Hipertrofia"],
    nivel: "Iniciante",
    articulacaoPredominante: "Ombro e cotovelo",
    restricoes: ["Ombro sensível"],
    premium: false,
    resumoPratico:
      "Puxada com as palmas voltadas para o rosto: mesma máquina, mais bíceps e uma linha de puxada mais confortável para muitos ombros.",
    anguloArticular: "Adução de ombro com antebraço supinado",
    // Foto sem `imagemAnalise` de propósito: o primário é o latíssimo, que fica
    // nas COSTAS, e esta é uma vista frontal. Ver o terceiro estado do
    // MovementLabDetail.
    imagem: "/exercises/puxada-supinada.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Latíssimo do dorso", percentual: 72, papel: "primário" },
      { musculo: "Bíceps braquial", percentual: 60, papel: "sinergista" },
      { musculo: "Trapézio médio", percentual: 42, papel: "sinergista" },
      { musculo: "Romboides", percentual: 40, papel: "sinergista" },
    ],
    indiceEficiencia: { score: 79, metrics: m("Latíssimo do dorso", 72, 20, 15, 5, 32, 28) },
    fases: [
      { nome: "Posição", descricao: "Sentado com as coxas presas, pegada supinada na largura dos ombros." },
      { nome: "Puxada", descricao: "Traz a barra até a parte alta do peito levando os cotovelos para baixo." },
      { nome: "Retorno", descricao: "Sobe em 3 segundos até estender, sem deixar os ombros subirem." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 34,
        titulo: "A pegada muda o bíceps, não o dorsal",
        camadas: {
          resumo: "A supinada recruta mais bíceps; o dorsal trabalha parecido nas duas.",
          biomecanica:
            "Com o antebraço supinado, o bíceps ganha vantagem mecânica e contribui mais na flexão de cotovelo. A adução do ombro, que é o trabalho do latíssimo, muda pouco.",
          fisiologia:
            "Para quem tem ombro sensível, a supinada costuma ser mais confortável porque reduz a rotação interna na fase alta.",
          evidencia:
            "Andersen e colaboradores compararam variações de puxada por eletromiografia e descrevem a diferença de contribuição do bíceps por pegada.",
          cuidados: "Inclinar muito o tronco para trás transforma a puxada em remada.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Alternativa de puxada quando a pegada pronada incomoda o ombro.",
        "Quando se quer mais bíceps dentro do trabalho de costas.",
        "Variação dentro de um mesociclo que já usa a puxada aberta.",
      ],
      quandoEvitar: [
        "Dor no cotovelo que aparece na pegada supinada.",
        "Aluno que compensa jogando o tronco para trás em toda repetição.",
      ],
      errosComuns: [
        "Inclinar o tronco para trás e transformar a puxada em remada.",
        "Puxar a barra atrás da nuca, o que não tem vantagem e estressa o ombro.",
        "Soltar o retorno em vez de controlar os 3 segundos.",
      ],
      variacoes: [
        "Pegada neutra: meio termo entre supinada e pronada.",
        "Um braço por vez na polia: expõe assimetria.",
        "Com pausa de 1 s no peito: reforça a retração.",
      ],
    },
    conteudo: {
      visaoGeral:
        "Costas tinha seis exercícios e quase todos eram remada. Esta é a segunda puxada vertical do catálogo em aparelho, e a mais confortável para ombro sensível.",
      biomecanica:
        "O latíssimo aduz e estende o ombro; a pegada supinada muda a contribuição do bíceps e a rotação do úmero na fase alta, que é onde o desconforto costuma aparecer.",
      fisiologia:
        "Como o bíceps participa mais, a carga costuma ser um pouco maior que na pegada aberta, mas o estímulo de dorsal é comparável.",
      prescricaoPratica:
        "Em geral, 3 séries de 8 a 12 repetições com retorno em 3 s. Trocar de pegada entre mesociclos é uma variação útil sem mudar o padrão.",
    },
    trustLevel: "tendência prática",
    temCena: false,
  },

  {
    id: "e82",
    slug: "pullover-polia",
    nome: "Pullover na polia",
    grupoMuscular: "Costas",
    equipamento: "Polia",
    objetivo: ["Hipertrofia"],
    nivel: "Intermediário",
    articulacaoPredominante: "Ombro",
    restricoes: ["Ombro sensível"],
    premium: false,
    resumoPratico:
      "Braços quase estendidos puxando de cima para baixo: o único exercício de dorsal do catálogo sem participação do bíceps.",
    anguloArticular: "Extensão de ombro com cotovelo em leve flexão fixa",
    imagem: "/exercises/pullover-polia.webp",
    imagemAnalise: "/exercises/pullover-polia-analysis.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Latíssimo do dorso", percentual: 68, papel: "primário" },
      { musculo: "Tríceps braquial", percentual: 35, papel: "sinergista" },
      { musculo: "Transverso do abdome", percentual: 28, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 74, metrics: m("Latíssimo do dorso", 68, 30, 20, 5, 40, 35) },
    fases: [
      { nome: "Posição", descricao: "Em pé de frente para a polia alta, tronco levemente inclinado, cotovelos em leve flexão fixa." },
      { nome: "Puxada", descricao: "Leva a barra até as coxas mantendo o cotovelo no mesmo ângulo." },
      { nome: "Retorno", descricao: "Sobe em 3 segundos até sentir o alongamento do dorsal." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 38,
        titulo: "Cotovelo travado é o exercício",
        camadas: {
          resumo: "Se o cotovelo dobra, virou puxada e o bíceps entrou.",
          biomecanica:
            "O pullover é extensão de ombro com o cotovelo fixo. É o que permite carregar o latíssimo sem o bíceps como elo intermediário.",
          fisiologia:
            "Útil quando o bíceps é o fator limitante nas puxadas, o que é comum em quem tem braço pequeno em relação às costas.",
          evidencia:
            "Boeckh-Behrens e Buskies documentam o perfil de ativação do latíssimo em exercícios de extensão de ombro por eletromiografia.",
          cuidados: "A posição inicial com o braço acima da cabeça pede ombro com boa mobilidade.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Quando o bíceps cansa antes das costas nas puxadas.",
        "Variação de dorsal dentro de um mesociclo de hipertrofia.",
        "Complemento no fim da sessão de costas.",
      ],
      quandoEvitar: [
        "Ombro sensível que dói com o braço acima da cabeça.",
        "Aluno que não consegue manter o cotovelo fixo nem sem carga.",
      ],
      errosComuns: [
        "Dobrar e estender o cotovelo, transformando em extensão de tríceps.",
        "Balançar o tronco a cada repetição.",
        "Usar carga que só permite meia amplitude.",
      ],
      variacoes: [
        "Ajoelhado: elimina o balanço do tronco.",
        "Com corda: permite as mãos separarem no fim.",
        "Com pausa de 1 s embaixo: reforça o fim da amplitude.",
      ],
    },
    conteudo: {
      visaoGeral:
        "Preenche uma lacuna específica: todos os exercícios de costas do catálogo dobravam o cotovelo, então o bíceps sempre participava e às vezes limitava.",
      biomecanica:
        "Com o cotovelo travado em leve flexão, a única articulação que se move é o ombro. O latíssimo estende o braço de cima para baixo, que é a função pela qual ele existe.",
      fisiologia:
        "Como o bíceps sai da equação, o dorsal pode ser levado mais perto da própria falha sem que o braço desista antes.",
      prescricaoPratica:
        "Em geral, 3 séries de 10 a 15 repetições com retorno em 3 s. Se o cotovelo dobra em qualquer repetição, reduza a carga.",
    },
    trustLevel: "princípio biomecânico",
    temCena: false,
  },

  {
    id: "e83",
    slug: "remada-cavalinho",
    nome: "Remada cavalinho",
    grupoMuscular: "Costas",
    equipamento: "Barra",
    objetivo: ["Hipertrofia", "Força"],
    nivel: "Intermediário",
    articulacaoPredominante: "Ombro e cotovelo",
    restricoes: ["Dor lombar"],
    premium: false,
    resumoPratico:
      "Remada com a barra presa num ponto fixo e o tronco apoiado: carga alta de costas com menos exigência da lombar do que a remada curvada.",
    anguloArticular: "Extensão de ombro com tronco inclinado e apoiado",
    imagem: "/exercises/remada-cavalinho.webp",
    imagemAnalise: "/exercises/remada-cavalinho-analysis.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Latíssimo do dorso", percentual: 74, papel: "primário" },
      { musculo: "Trapézio médio", percentual: 60, papel: "sinergista" },
      { musculo: "Romboides", percentual: 55, papel: "sinergista" },
      { musculo: "Bíceps braquial", percentual: 45, papel: "sinergista" },
      { musculo: "Eretores da espinha", percentual: 35, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 82, metrics: m("Latíssimo do dorso", 74, 35, 40, 10, 30, 32) },
    fases: [
      { nome: "Posição", descricao: "Peito apoiado no suporte, joelhos em leve flexão, braços estendidos segurando a barra." },
      { nome: "Puxada", descricao: "Traz a barra até o abdômen levando os cotovelos para trás, juntando as escápulas." },
      { nome: "Retorno", descricao: "Estende os braços em 3 segundos, sem soltar a carga de uma vez." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 44,
        titulo: "O apoio tira a lombar da conta",
        camadas: {
          resumo: "Com o peito apoiado, a coluna não precisa sustentar o tronco inclinado.",
          biomecanica:
            "Na remada curvada livre, os eretores sustentam o tronco inclinado durante toda a série. Com apoio, essa exigência cai e sobra atenção para a puxada.",
          fisiologia:
            "É a forma de treinar costas com carga alta em quem tem histórico de dor lombar, sem abrir mão do padrão de remada.",
          evidencia:
            "McGill documenta o custo de sustentar a flexão de tronco sob carga, o que justifica a preferência pelo apoio quando existe queixa lombar.",
          cuidados: "Descolar o peito do apoio para puxar mais devolve a carga à lombar.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Costas com carga alta em quem tem histórico de dor lombar.",
        "Quando a remada curvada livre já não permite progredir com técnica.",
        "Mesociclo de força de puxada horizontal.",
      ],
      quandoEvitar: [
        "Dor lombar aguda, mesmo com o apoio.",
        "Suporte que não se ajusta à altura do aluno.",
      ],
      errosComuns: [
        "Descolar o peito do apoio para puxar mais carga.",
        "Puxar só com o braço, sem juntar as escápulas.",
        "Soltar o retorno em vez de controlar.",
      ],
      variacoes: [
        "Pegada neutra: mais confortável para o ombro.",
        "Pegada aberta: mais trapézio médio e romboides.",
        "Com pausa de 1 s no abdômen: reforça a retração.",
      ],
    },
    conteudo: {
      visaoGeral:
        "Terceira remada do catálogo e a única com apoio de tronco, o que a torna a escolha certa quando existe queixa lombar e ainda assim se quer carga.",
      biomecanica:
        "O apoio de peito remove a exigência isométrica dos eretores para sustentar a inclinação. O trabalho fica concentrado na extensão de ombro e na retração escapular.",
      fisiologia:
        "Permite carga comparável à da remada curvada com custo lombar menor, o que muda quem pode receber o exercício.",
      prescricaoPratica:
        "Em geral, 3 séries de 8 a 12 repetições com pausa de 1 s no fim. Se o peito descola do apoio, a carga está alta.",
    },
    trustLevel: "princípio biomecânico",
    temCena: false,
  },

  {
    id: "e84",
    slug: "levantamento-terra",
    nome: "Levantamento terra convencional",
    grupoMuscular: "Corpo todo",
    equipamento: "Barra",
    objetivo: ["Força", "Hipertrofia"],
    nivel: "Avançado",
    articulacaoPredominante: "Quadril e coluna",
    restricoes: ["Dor lombar", "Requer mobilidade de tornozelo e quadril"],
    premium: false,
    resumoPratico:
      "Tirar a barra do chão até ficar em pé: o padrão de dobradiça com maior carga possível, e o de maior custo técnico do catálogo.",
    anguloArticular: "Extensão de quadril e joelho a partir da flexão, coluna neutra",
    imagem: "/exercises/levantamento-terra.webp",
    imagemAnalise: "/exercises/levantamento-terra-analysis.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Glúteo máximo", percentual: 78, papel: "primário" },
      { musculo: "Isquiotibiais", percentual: 74, papel: "primário" },
      { musculo: "Eretores da espinha", percentual: 72, papel: "sinergista" },
      { musculo: "Quadríceps", percentual: 55, papel: "sinergista" },
      { musculo: "Latíssimo do dorso", percentual: 45, papel: "estabilizador" },
      { musculo: "Flexores do punho", percentual: 55, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 88, metrics: m("Glúteo máximo", 78, 75, 70, 30, 25, 65) },
    fases: [
      { nome: "Preparação", descricao: "Barra sobre o meio do pé, quadril acima do joelho, coluna neutra e ombros à frente da barra." },
      { nome: "Tirada", descricao: "Empurra o chão com os pés levando a barra rente às pernas, quadril e ombro subindo juntos." },
      { nome: "Descida", descricao: "Desce empurrando o quadril para trás, com a barra rente, até o chão." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 52,
        titulo: "Quadril e ombro sobem juntos",
        camadas: {
          resumo: "Se o quadril sobe primeiro, a barra se afasta e a lombar assume.",
          biomecanica:
            "Subir o quadril antes do ombro aumenta a inclinação do tronco e o braço de alavanca sobre a lombar, exatamente sob a maior carga da sessão.",
          fisiologia:
            "É o exercício de maior demanda sistêmica do catálogo, e por isso ocupa o topo da progressão de dobradiça.",
          evidencia:
            "McGill documenta a carga de compressão e cisalhamento sobre a coluna na flexão sob peso, base da exigência de coluna neutra aqui.",
          cuidados: "A pegada costuma falhar antes das pernas; alça resolve sem mudar o exercício.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Aluno avançado com objetivo de força e padrão de dobradiça consolidado.",
        "Mesociclo de força de cadeia posterior.",
        "Quando se quer o maior estímulo de corpo todo do catálogo.",
      ],
      quandoEvitar: [
        "Histórico recente de dor lombar.",
        "Aluno que ainda arredonda a coluna no terra romeno.",
        "Sessão em que o aluno chega com sono ruim ou dor declarada.",
      ],
      errosComuns: [
        "Subir o quadril antes do ombro no começo da tirada.",
        "Afastar a barra das pernas durante a subida.",
        "Arredondar a coluna no fim da descida por cansaço.",
      ],
      variacoes: [
        "Terra sumô: mais quadril, menos inclinação de tronco.",
        "Terra parcial em suporte: reduz a amplitude e a exigência de mobilidade.",
        "Com halteres: regressão de carga e de técnica.",
      ],
    },
    conteudo: {
      visaoGeral:
        "Fecha o topo da linha de força do catálogo. É o exercício com maior carga possível e maior custo de um erro técnico, e por isso vem depois do terra romeno e do bom dia, nunca antes.",
      biomecanica:
        "A tirada combina extensão de joelho e de quadril com a coluna mantida neutra por contração isométrica dos eretores. A barra precisa seguir rente às pernas para o braço de alavanca ficar curto.",
      fisiologia:
        "A demanda sistêmica é alta e a recuperação é mais lenta que a dos demais exercícios da base, o que pesa na hora de distribuir o volume da semana.",
      prescricaoPratica:
        "Em geral, 3 a 4 séries de 3 a 6 repetições com carga conservadora e técnica impecável. Uma repetição com a coluna arredondada encerra a série.",
    },
    trustLevel: "cuidado de segurança",
    temCena: false,
  },

  /* ==================== LOTE F: AERÓBIO E CORPO TODO ==================== */
  {
    id: "e85",
    slug: "remo-ergometro",
    nome: "Remo ergômetro",
    grupoMuscular: "Corpo todo",
    equipamento: "Máquina",
    objetivo: ["Emagrecimento", "Resistência muscular"],
    nivel: "Intermediário",
    articulacaoPredominante: "Quadril, joelho e ombro",
    restricoes: ["Dor lombar"],
    premium: false,
    resumoPratico:
      "Aeróbio de corpo todo sentado: pernas, tronco e braços na mesma remada, com impacto baixo e gasto alto.",
    anguloArticular: "Extensão sequencial de joelho, quadril e ombro",
    imagem: "/exercises/remo-ergometro.webp",
    imagemAnalise: "/exercises/remo-ergometro-analysis.webp",
    modalidade: "m-funcional",
    ativacao: [
      { musculo: "Quadríceps", percentual: 62, papel: "primário" },
      { musculo: "Latíssimo do dorso", percentual: 55, papel: "sinergista" },
      { musculo: "Glúteo máximo", percentual: 50, papel: "sinergista" },
      { musculo: "Eretores da espinha", percentual: 45, papel: "sinergista" },
      { musculo: "Bíceps braquial", percentual: 35, papel: "sinergista" },
    ],
    indiceEficiencia: { score: 83, metrics: m("Quadríceps", 62, 45, 45, 20, 25, 40) },
    fases: [
      { nome: "Ataque", descricao: "Joelhos dobrados, tronco levemente à frente, braços estendidos segurando a alça." },
      { nome: "Passada", descricao: "Empurra com as pernas, depois inclina o tronco para trás e por último puxa com os braços." },
      { nome: "Recuperação", descricao: "Devolve na ordem inversa: braços, tronco e joelhos." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 50,
        titulo: "Pernas, tronco, braços",
        camadas: {
          resumo: "A ordem importa: quem começa puxando com os braços erra a remada inteira.",
          biomecanica:
            "A força vem principalmente das pernas. O tronco transfere e os braços finalizam. Inverter a ordem sobrecarrega a lombar e reduz a potência.",
          fisiologia:
            "Por envolver massa muscular grande com impacto baixo, o gasto energético por minuto é alto sem carga de aterrissagem.",
          evidencia:
            "O ACSM descreve as modalidades aeróbias de baixo impacto e o critério de escolha por massa muscular envolvida e tolerância articular.",
          cuidados: "Dor lombar pede atenção redobrada à ordem do movimento e à amplitude do tronco.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Aeróbio de corpo todo com impacto baixo.",
        "Alternativa à esteira em quem tem dor de joelho.",
        "Blocos intervalados no plano de emagrecimento.",
      ],
      quandoEvitar: [
        "Dor lombar que aparece na inclinação do tronco.",
        "Aluno que não aprendeu a ordem do movimento e insiste em puxar primeiro.",
      ],
      errosComuns: [
        "Puxar com os braços antes de empurrar com as pernas.",
        "Inclinar demais o tronco para trás no fim da passada.",
        "Arredondar a coluna na recuperação.",
      ],
      variacoes: [
        "Ritmo contínuo: base aeróbia.",
        "Blocos de 500 m: estímulo intervalado.",
        "Só com as pernas: aprendizado da primeira parte do movimento.",
      ],
    },
    conteudo: {
      visaoGeral:
        "O catálogo tinha esteira, bicicleta e elíptico. O remo acrescenta a única opção aeróbia que envolve tronco superior de forma significativa.",
      biomecanica:
        "A sequência pernas, tronco e braços distribui a produção de força. É a ordem que protege a lombar e a que rende mais potência.",
      fisiologia:
        "A massa muscular envolvida é grande, o que eleva o gasto por minuto, e o impacto é baixo, o que preserva joelho e tornozelo.",
      prescricaoPratica:
        "Em geral, 15 a 30 min contínuos guiados por percepção de esforço e teste da fala, ou blocos de 500 m com pausa. Ensine a ordem do movimento antes de subir o ritmo.",
    },
    trustLevel: "regra pedagógica",
    temCena: false,
  },

  {
    id: "e86",
    slug: "escada-ergometrica",
    nome: "Escada ergométrica",
    grupoMuscular: "Membros inferiores",
    equipamento: "Máquina",
    objetivo: ["Emagrecimento", "Resistência muscular"],
    nivel: "Intermediário",
    articulacaoPredominante: "Quadril e joelho",
    restricoes: ["Dor no joelho"],
    premium: false,
    resumoPratico:
      "Subir degraus sem parar: gasto energético alto sem correr, com impacto menor que o da corrida.",
    anguloArticular: "Flexão e extensão de quadril e joelho em ciclo contínuo",
    imagem: "/exercises/escada-ergometrica.webp",
    imagemAnalise: "/exercises/escada-ergometrica-analysis.webp",
    modalidade: "m-funcional",
    ativacao: [
      { musculo: "Quadríceps", percentual: 65, papel: "primário" },
      { musculo: "Glúteo máximo", percentual: 60, papel: "sinergista" },
      { musculo: "Isquiotibiais", percentual: 40, papel: "sinergista" },
      { musculo: "Gastrocnêmio", percentual: 38, papel: "sinergista" },
    ],
    indiceEficiencia: { score: 80, metrics: m("Quadríceps", 65, 25, 20, 45, 8, 35) },
    fases: [
      { nome: "Entrada", descricao: "Sobe no aparelho segurando o corrimão até achar o ritmo." },
      { nome: "Subida contínua", descricao: "Pisa no degrau com o pé inteiro, tronco ereto e mão apenas apoiada." },
      { nome: "Saída", descricao: "Reduz o ritmo antes de parar e desce com o aparelho lento." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 56,
        titulo: "A mão apoia, não sustenta",
        camadas: {
          resumo: "Pendurar-se no corrimão reduz o gasto e muda o exercício.",
          biomecanica:
            "Sustentar parte do peso nos braços diminui a carga sobre as pernas e o custo energético, mesmo com o mesmo ritmo no visor.",
          fisiologia:
            "É uma modalidade de gasto alto por minuto porque levanta o corpo contra a gravidade sem a fase de aterrissagem da corrida.",
          evidencia:
            "O ACSM descreve o critério de escolha das modalidades aeróbias por massa envolvida e por tolerância articular.",
          cuidados: "Dor no joelho ao subir escada na vida real contraindica começar por aqui.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Gasto energético alto em quem não corre.",
        "Progressão de intensidade aeróbia depois da caminhada.",
        "Blocos intervalados no plano de emagrecimento.",
      ],
      quandoEvitar: [
        "Dor no joelho ao subir escada no dia a dia.",
        "Aluno sem equilíbrio para o movimento contínuo.",
      ],
      errosComuns: [
        "Pendurar-se no corrimão e reduzir o esforço real.",
        "Pisar só com a ponta do pé.",
        "Começar em ritmo alto sem aquecimento.",
      ],
      variacoes: [
        "Ritmo contínuo baixo: base aeróbia.",
        "Blocos de 1 min forte e 2 min leve: estímulo intervalado.",
        "Passo largo, pulando um degrau: mais glúteo.",
      ],
    },
    conteudo: {
      visaoGeral:
        "Acrescenta uma opção aeróbia de intensidade alta que não é corrida, útil para o aluno que precisa de gasto e não tolera impacto.",
      biomecanica:
        "Cada passo levanta o corpo contra a gravidade, com extensão de quadril e joelho. A ausência de fase de voo elimina a aterrissagem.",
      fisiologia:
        "Custo energético alto por minuto, e por isso a percepção de esforço sobe rápido nas primeiras sessões.",
      prescricaoPratica:
        "Em geral, 10 a 20 min guiados por percepção de esforço e teste da fala. Progrida o tempo antes do ritmo, e mantenha a mão só apoiada.",
    },
    trustLevel: "regra pedagógica",
    temCena: false,
  },

  {
    id: "e87",
    slug: "caminhada-plana",
    nome: "Caminhada em piso plano",
    grupoMuscular: "Corpo todo",
    equipamento: "Peso corporal",
    objetivo: ["Emagrecimento", "Retorno ao treino", "Resistência muscular"],
    nivel: "Iniciante",
    articulacaoPredominante: "Quadril, joelho e tornozelo",
    restricoes: [],
    premium: false,
    resumoPratico:
      "Caminhar na rua ou no parque: a modalidade aeróbia com menor barreira de entrada e a única que não depende de academia nem de aparelho.",
    anguloArticular: "Ciclo de marcha em amplitude natural",
    imagem: "/exercises/caminhada-plana.webp",
    imagemAnalise: "/exercises/caminhada-plana-analysis.webp",
    modalidade: "m-caminhada",
    ativacao: [
      { musculo: "Quadríceps", percentual: 40, papel: "primário" },
      { musculo: "Glúteo máximo", percentual: 38, papel: "sinergista" },
      { musculo: "Gastrocnêmio", percentual: 42, papel: "sinergista" },
      { musculo: "Glúteo médio", percentual: 35, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 76, metrics: m("Quadríceps", 40, 5, 10, 15, 5, 10) },
    fases: [
      { nome: "Início", descricao: "Primeiros minutos em ritmo confortável, para o corpo aquecer." },
      { nome: "Ritmo", descricao: "Passo firme em que ainda dá para falar frases inteiras, mas não cantar." },
      { nome: "Desaceleração", descricao: "Últimos minutos em ritmo leve, até a respiração normalizar." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 60,
        titulo: "O teste da fala resolve a intensidade",
        camadas: {
          resumo: "Se dá para falar frases inteiras mas não cantar, a intensidade é moderada.",
          biomecanica:
            "A marcha em piso plano tem impacto baixo e amplitude natural, o que a torna tolerável para quase todo perfil articular.",
          fisiologia:
            "Cumprir a meta semanal de atividade moderada só com caminhada é possível, e é o caminho de menor atrito para quem começa.",
          evidencia:
            "As diretrizes da OMS estabelecem 150 a 300 min semanais de atividade moderada, e a caminhada é a via mais acessível para atingi-los.",
          cuidados: "Calçado adequado importa mais aqui do que em qualquer aparelho.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Aluno sem academia, sem aparelho e sem dinheiro para mensalidade.",
        "Primeira semana de retorno ao treino.",
        "Volume aeróbio complementar em qualquer objetivo.",
      ],
      quandoEvitar: [
        "Sintoma cardiovascular em investigação, antes de liberação.",
        "Ambiente sem segurança para caminhar.",
      ],
      errosComuns: [
        "Começar rápido demais e cansar nos primeiros minutos.",
        "Contar só o tempo total e ignorar a intensidade.",
        "Parar de repente no fim, sem desacelerar.",
      ],
      variacoes: [
        "Com trechos de subida: aumenta a intensidade sem correr.",
        "Blocos de ritmo forte alternados com leve: estímulo intervalado.",
        "Com bastões de caminhada: envolve tronco superior.",
      ],
    },
    conteudo: {
      visaoGeral:
        "Todas as opções aeróbias do catálogo dependiam de aparelho ou de piscina. Esta é a única que o aluno faz saindo de casa, e é a que mais gente consegue sustentar.",
      biomecanica:
        "Ciclo de marcha com impacto baixo. O glúteo médio trabalha o tempo todo sustentando a bacia em cada apoio unipodal, o que passa despercebido.",
      fisiologia:
        "Volume acumulado ao longo da semana é o que produz o efeito, e a caminhada é a modalidade com melhor aderência de longo prazo na maioria dos perfis.",
      prescricaoPratica:
        "Em geral, 20 a 45 min guiados por percepção de esforço e teste da fala. Progrida primeiro a frequência semanal, depois a duração e por último o ritmo.",
    },
    trustLevel: "regra pedagógica",
    temCena: false,
  },

  {
    id: "e88",
    slug: "corrida-aquatica",
    nome: "Corrida estacionária na piscina",
    grupoMuscular: "Corpo todo",
    equipamento: "Piscina",
    objetivo: ["Emagrecimento", "Retorno ao treino"],
    nivel: "Iniciante",
    articulacaoPredominante: "Quadril, joelho e tornozelo",
    restricoes: [],
    premium: false,
    resumoPratico:
      "Correr no lugar dentro da água: o padrão da corrida sem nenhuma aterrissagem, com a água oferecendo resistência em todas as direções.",
    anguloArticular: "Ciclo de corrida em amplitude reduzida pela resistência da água",
    imagem: "/exercises/corrida-aquatica.webp",
    imagemAnalise: "/exercises/corrida-aquatica-analysis.webp",
    modalidade: "m-hidro",
    ativacao: [
      { musculo: "Quadríceps", percentual: 50, papel: "primário" },
      { musculo: "Iliopsoas", percentual: 45, papel: "sinergista" },
      { musculo: "Glúteo máximo", percentual: 42, papel: "sinergista" },
      { musculo: "Transverso do abdome", percentual: 35, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 78, metrics: m("Quadríceps", 50, 20, 12, 8, 12, 20) },
    fases: [
      { nome: "Entrada", descricao: "Na água na altura do peito, ritmo leve para achar o equilíbrio." },
      { nome: "Corrida", descricao: "Eleva os joelhos alternadamente com os braços acompanhando, tronco ereto." },
      { nome: "Saída", descricao: "Reduz o ritmo até a respiração normalizar antes de sair." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 50,
        titulo: "Sem aterrissagem nenhuma",
        camadas: {
          resumo: "A água elimina o impacto e ainda resiste ao movimento nos dois sentidos.",
          biomecanica:
            "A flutuação reduz a carga sobre as articulações e a resistência da água exige força tanto para levantar quanto para baixar a perna.",
          fisiologia:
            "Permite treinar o padrão de corrida em quem não pode receber impacto, mantendo demanda cardiovascular relevante.",
          evidencia:
            "As diretrizes do ACSM incluem a atividade aquática entre as opções de baixo impacto para populações com limitação articular.",
          cuidados: "A percepção de esforço na água costuma ser menor que a resposta real; guie por ela mesmo assim.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Aluno com dor articular que não tolera impacto.",
        "Obesidade, pela combinação de flutuação e gasto energético.",
        "Retorno ao treino depois de lesão de membros inferiores, com liberação.",
      ],
      quandoEvitar: [
        "Aluno sem segurança na água.",
        "Piscina sem profundidade adequada para o padrão em pé.",
      ],
      errosComuns: [
        "Inclinar o tronco à frente e perder a postura de corrida.",
        "Reduzir a amplitude a ponto de o movimento virar marcha lenta.",
        "Guiar só pelo tempo, sem observar a percepção de esforço.",
      ],
      variacoes: [
        "Com halteres aquáticos: envolve mais o tronco superior.",
        "Blocos de ritmo forte e leve: estímulo intervalado.",
        "Com colete de flutuação em água funda: elimina o contato com o fundo.",
      ],
    },
    conteudo: {
      visaoGeral:
        "Terceiro item aquático do catálogo e o de maior demanda cardiovascular dos três, útil quando marcha aquática já ficou fácil.",
      biomecanica:
        "O padrão é o da corrida, com a diferença de que a água resiste ao movimento em todas as direções e elimina a fase de aterrissagem.",
      fisiologia:
        "A resposta de frequência cardíaca na água tende a ser menor para a mesma percepção de esforço, o que reforça o uso da percepção como guia.",
      prescricaoPratica:
        "Em geral, 20 a 35 min em blocos de ritmo variado, guiados por percepção de esforço e teste da fala. Progrida amplitude e ritmo antes do tempo total.",
    },
    trustLevel: "regra pedagógica",
    temCena: false,
  },

  {
    id: "e89",
    slug: "bicicleta-reclinada",
    nome: "Bicicleta reclinada",
    grupoMuscular: "Membros inferiores",
    equipamento: "Bicicleta ergométrica",
    objetivo: ["Emagrecimento", "Retorno ao treino"],
    nivel: "Iniciante",
    articulacaoPredominante: "Quadril e joelho",
    restricoes: ["Dor lombar"],
    premium: false,
    resumoPratico:
      "Bicicleta com encosto e assento largo: para quem não tolera ficar sentado sem apoio de tronco por 20 minutos.",
    anguloArticular: "Ciclo de pedalada com tronco apoiado",
    imagem: "/exercises/bicicleta-reclinada.webp",
    imagemAnalise: "/exercises/bicicleta-reclinada-analysis.webp",
    modalidade: "m-bike",
    ativacao: [
      { musculo: "Quadríceps", percentual: 58, papel: "primário" },
      { musculo: "Glúteo máximo", percentual: 40, papel: "sinergista" },
      { musculo: "Isquiotibiais", percentual: 35, papel: "sinergista" },
      { musculo: "Gastrocnêmio", percentual: 28, papel: "sinergista" },
    ],
    indiceEficiencia: { score: 75, metrics: m("Quadríceps", 58, 8, 8, 20, 5, 15) },
    fases: [
      { nome: "Ajuste", descricao: "Assento regulado para o joelho manter cerca de 20 a 30 graus de flexão no ponto mais distante." },
      { nome: "Pedalada", descricao: "Cadência confortável de 60 a 80 rotações por minuto com carga leve a moderada." },
      { nome: "Desaceleração", descricao: "Reduz a carga e a cadência nos últimos minutos." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 55,
        titulo: "O encosto muda quem pode pedalar",
        camadas: {
          resumo: "Com apoio de tronco, quem tem dor lombar consegue sustentar a sessão inteira.",
          biomecanica:
            "Na bicicleta vertical, os eretores sustentam o tronco durante toda a sessão. O encosto elimina essa exigência isométrica.",
          fisiologia:
            "O estímulo cardiovascular é comparável ao da vertical para a mesma carga e cadência.",
          evidencia:
            "O ACSM inclui a bicicleta entre as modalidades de baixo impacto e recomenda a escolha do equipamento pela tolerância do aluno.",
          cuidados: "Assento muito distante estende demais o joelho e incomoda a parte de trás.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Dor lombar que impede sustentar o tronco por 20 min.",
        "Obesidade, pelo assento mais largo e pela entrada mais fácil.",
        "Idoso destreinado, pelo apoio e pela estabilidade.",
      ],
      quandoEvitar: [
        "Dor no joelho que aparece já em carga mínima.",
        "Aparelho sem regulagem de distância do assento.",
      ],
      errosComuns: [
        "Pedalar com o assento muito distante, estendendo demais o joelho.",
        "Usar carga alta e cadência baixa, o que carrega o joelho.",
        "Parar de repente sem desacelerar.",
      ],
      variacoes: [
        "Cadência mais alta com carga leve: mais cardiovascular, menos articular.",
        "Blocos de 1 min forte e 2 min leve: estímulo intervalado.",
        "Sessão contínua longa: base aeróbia.",
      ],
    },
    conteudo: {
      visaoGeral:
        "Existe pelo mesmo motivo do leg press horizontal: o estímulo já estava disponível, mas a posição excluía parte dos alunos.",
      biomecanica:
        "A pedalada é a mesma; o encosto retira a exigência isométrica dos eretores e o assento largo distribui melhor a pressão.",
      fisiologia:
        "Permite sessões mais longas em quem interrompia por desconforto de tronco, e é a duração que produz o efeito aeróbio.",
      prescricaoPratica:
        "Em geral, 15 a 30 min com cadência de 60 a 80 rotações por minuto e carga leve a moderada. Progrida a duração antes da carga.",
    },
    trustLevel: "regra pedagógica",
    temCena: false,
  },

  /* ==================== A8: o último core do lote A ==================== */
  {
    id: "e90",
    slug: "abdominal-polia-alta",
    nome: "Abdominal na polia alta",
    grupoMuscular: "Core (tronco)",
    equipamento: "Polia",
    objetivo: ["Hipertrofia", "Força"],
    nivel: "Intermediário",
    articulacaoPredominante: "Coluna",
    restricoes: ["Dor lombar"],
    premium: false,
    resumoPratico:
      "Ajoelhado sob a polia, enrolando o tronco: o único exercício de abdômen do catálogo com carga que progride placa a placa.",
    anguloArticular: "Flexão de coluna com quadril estável",
    imagem: "/exercises/abdominal-polia-alta.webp",
    imagemAnalise: "/exercises/abdominal-polia-alta-analysis.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Reto abdominal", percentual: 72, papel: "primário" },
      { musculo: "Oblíquos", percentual: 48, papel: "sinergista" },
      { musculo: "Transverso do abdome", percentual: 40, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 77, metrics: m("Reto abdominal", 72, 35, 40, 15, 25, 25) },
    fases: [
      { nome: "Posição", descricao: "Ajoelhado sob a polia alta, corda segurada ao lado da cabeça, quadril fixo." },
      { nome: "Enrolamento", descricao: "Enrola o tronco aproximando as costelas da bacia, sem mover o quadril." },
      { nome: "Retorno", descricao: "Desenrola em 3 segundos até a posição inicial, sem soltar a carga." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 44,
        titulo: "Costelas na direção da bacia",
        camadas: {
          resumo: "Se o quadril se dobra, virou flexão de quadril e o abdômen só segurou.",
          biomecanica:
            "O reto abdominal aproxima as costelas da bacia. Dobrar o quadril transfere o trabalho para o iliopsoas e reduz o estímulo abdominal.",
          fisiologia:
            "É o único exercício de abdômen do catálogo em que a carga progride de forma precisa, o que importa em objetivo de hipertrofia.",
          evidencia:
            "McGill documenta a hierarquia dos exercícios de tronco por carga de compressão sobre a coluna, e os de flexão repetida com carga ficam no grupo de maior custo.",
          cuidados: "Em histórico de dor lombar, os padrões antirrotação e isométricos são preferíveis.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Objetivo de hipertrofia abdominal com progressão de carga.",
        "Aluno sem histórico de dor lombar.",
        "Complemento dos padrões isométricos e antirrotação já prescritos.",
      ],
      quandoEvitar: [
        "Histórico de dor lombar, pela flexão repetida sob carga.",
        "Joelho sensível sem tapete adequado.",
      ],
      errosComuns: [
        "Dobrar o quadril em vez de enrolar o tronco.",
        "Puxar com os braços, transformando em pullover.",
        "Soltar o retorno em vez de controlar os 3 segundos.",
      ],
      variacoes: [
        "Com pausa de 2 s embaixo: mais tempo sob tensão.",
        "Com rotação alternada: acrescenta oblíquos.",
        "Sentado no banco: alternativa quando ajoelhar incomoda.",
      ],
    },
    conteudo: {
      visaoGeral:
        "Último item do lote de core. Existe para o caso específico de hipertrofia abdominal, em que os padrões isométricos param de progredir.",
      biomecanica:
        "A corda puxa para cima e o abdômen resiste enrolando o tronco. Manter o quadril imóvel é o que separa o exercício de uma flexão de quadril com peso.",
      fisiologia:
        "É o único abdominal do catálogo com progressão de carga precisa, e também o de maior custo de compressão sobre a coluna, o que define quem deve recebê-lo.",
      prescricaoPratica:
        "Em geral, 3 séries de 10 a 15 repetições com retorno em 3 s. Em histórico de dor lombar, prefira prancha lateral e Pallof press.",
    },
    trustLevel: "cuidado de segurança",
    temCena: false,
  },
];
