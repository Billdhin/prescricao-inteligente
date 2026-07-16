import type { Exercise, EficMetric } from "./types";

/**
 * Segunda expansão do catálogo (e24 a e34): fecha os buracos de cobertura
 * apontados pela auditoria do motor. O padrão do Brasil real (treino em casa
 * com peso corporal, halteres ou elástico) e as academias de condomínio (só
 * máquina) não tinham nenhum empurrar/puxar de tronco superior; peitorais,
 * ombros, costas e braços tinham pouquíssimas opções. Todos trazem as métricas
 * que o motor lê (Demanda lombar/joelho/ombro, Requisito de mobilidade,
 * Complexidade técnica) preenchidas, para nunca cair no "sem dado".
 * Mesma linguagem prudente e conteúdo em camadas dos demais.
 */

/**
 * Métricas nos eixos que o motor lê, sempre presentes.
 *
 * `musculo` é o nome do alvo principal e precisa ser EXATAMENTE o mesmo string do
 * `ativacao[].musculo` primário do exercício. Antes o rótulo era o genérico
 * "Ativação primária", e o card mostrava "Ativação primária 78" enquanto o mapa e o
 * slider, ao lado, mostravam "Deltoide médio 78". Mesmo número, dois nomes.
 * `npm run check:metricas` trava se os dois campos divergirem.
 */
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

export const extraExercises2: Exercise[] = [
  /* ------------------------------ FLEXÃO DE BRAÇO ------------------------------ */
  {
    id: "e24",
    slug: "flexao-de-braco",
    nome: "Flexão de braço",
    grupoMuscular: "Peitorais",
    equipamento: "Peso corporal",
    objetivo: ["Hipertrofia", "Resistência muscular", "Aprendizado técnico", "Emagrecimento"],
    nivel: "Iniciante",
    articulacaoPredominante: "Ombro e cotovelo",
    restricoes: ["Ombro sensível"],
    premium: false,
    resumoPratico:
      "Empurrar horizontal com o peso do corpo: em geral a porta de entrada de peitorais em casa, com regressão fácil apoiando os joelhos ou elevando as mãos numa bancada.",
    imagem: "/exercises/flexao-de-braco.webp",
    imagemAnalise: "/exercises/flexao-de-braco-analysis.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Peitoral maior", percentual: 75, papel: "primário" },
      { musculo: "Tríceps braquial", percentual: 62, papel: "sinergista" },
      { musculo: "Deltoide anterior", percentual: 52, papel: "sinergista" },
      { musculo: "Transverso do abdome", percentual: 38, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 78, metrics: m("Peitoral maior", 75, 38, 32, 10, 45, 25) },
    fases: [
      { nome: "Prancha", descricao: "Corpo em linha reta, mãos na largura dos ombros, abdômen firme." },
      { nome: "Descida", descricao: "Cotovelos a cerca de 45 graus do tronco enquanto o peito desce ao chão." },
      { nome: "Empurrada", descricao: "Empurra o chão até estender os cotovelos, sem deixar o quadril cair." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 40,
        titulo: "Cotovelos e ombro",
        camadas: {
          resumo: "Cotovelos a cerca de 45 graus poupam o ombro.",
          biomecanica: "Abrir os cotovelos a 90 graus aumenta o estresse na região anterior do ombro; mantê-los mais junto do tronco distribui melhor a carga.",
          fisiologia: "A tensão no peitoral se mantém alta ao longo da amplitude quando o tronco desce controlado.",
          evidencia: "Na prática, dor no ombro costuma melhorar ao aproximar os cotovelos e reduzir a amplitude.",
          cuidados: "Em ombro sensível, comece com as mãos elevadas numa bancada para reduzir a carga.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Peitorais em casa, sem nenhum equipamento.",
        "Base de empurrar antes de progredir para halteres ou barra.",
        "Circuitos de emagrecimento com grandes grupos musculares.",
      ],
      quandoEvitar: [
        "Dor no ombro que não melhora ao aproximar os cotovelos.",
        "Punho sensível sem apoio adaptado (use apoios ou halteres no chão).",
      ],
      errosComuns: [
        "Deixar o quadril cair (perde a prancha e sobrecarrega a lombar).",
        "Abrir os cotovelos a 90 graus, estressando o ombro.",
        "Reduzir a amplitude sem necessidade e encurtar o estímulo.",
      ],
      variacoes: [
        "Apoio nos joelhos: regressão para iniciantes.",
        "Mãos elevadas na bancada: reduz a carga e poupa o ombro.",
        "Pés elevados: aumenta a ênfase na porção superior do peito.",
      ],
    },
    conteudo: {
      visaoGeral:
        "A flexão de braço é o empurrar horizontal mais acessível: não exige nenhum equipamento e escala de muito fácil a muito difícil só mudando o apoio, o que a torna útil do iniciante ao avançado.",
      biomecanica:
        "O peitoral maior conduz a adução horizontal do braço, com tríceps e deltoide anterior como sinergistas. O abdômen estabiliza a prancha, o que transforma o exercício também num trabalho de core anti-extensão.",
      fisiologia:
        "De forma aguda, o esforço recruta as fibras do peitoral e do tríceps ao longo da série; de forma crônica, ajustar o apoio para manter as repetições numa faixa desafiadora tende a favorecer força e hipertrofia sem carga externa. Por escalar tão facilmente, é um recurso durável na progressão do aluno.",
      prescricaoPratica:
        "Em geral, escolha a variação que permita de 8 a 15 repetições com boa forma; progrida tornando o apoio mais exigente (dos joelhos ao solo, do solo aos pés elevados) antes de buscar volume.",
    },
    trustLevel: "regra pedagógica",
    temCena: false,
  },

  /* ------------------------------ SUPINO COM HALTERES ------------------------------ */
  {
    id: "e25",
    slug: "supino-halteres",
    nome: "Supino com halteres",
    grupoMuscular: "Peitorais",
    equipamento: "Halter",
    objetivo: ["Hipertrofia", "Força"],
    nivel: "Intermediário",
    articulacaoPredominante: "Ombro e cotovelo",
    restricoes: ["Ombro sensível"],
    premium: false,
    resumoPratico:
      "Empurrar horizontal com trajetória livre: tende a acomodar melhor ombros sensíveis que a barra; sem banco, a versão no solo (floor press) limita a amplitude e preserva o ombro.",
    imagem: "/exercises/supino-halteres.webp",
    imagemAnalise: "/exercises/supino-halteres-analysis.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Peitoral maior", percentual: 85, papel: "primário" },
      { musculo: "Deltoide anterior", percentual: 60, papel: "sinergista" },
      { musculo: "Tríceps braquial", percentual: 58, papel: "sinergista" },
      { musculo: "Serrátil anterior", percentual: 42, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 80, metrics: m("Peitoral maior", 85, 52, 25, 8, 55, 35) },
    fases: [
      { nome: "Preparação", descricao: "Deitado, halteres na linha do peito, escápulas retraídas no banco." },
      { nome: "Descida", descricao: "Desce os halteres controlando, cotovelos a cerca de 45 graus do tronco." },
      { nome: "Empurrada", descricao: "Empurra os halteres para cima e levemente para dentro, sem travar." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 45,
        titulo: "Amplitude livre",
        camadas: {
          resumo: "Os halteres permitem ajustar a trajetória ao ombro.",
          biomecanica: "Ao contrário da barra, cada braço encontra o caminho mais confortável, o que reduz a compensação em ombros assimétricos.",
          fisiologia: "A amplitude um pouco maior que a da máquina tende a aumentar o alongamento sob carga do peitoral.",
          evidencia: "Na prática, quem sente o ombro no supino reto com barra costuma tolerar melhor os halteres.",
          cuidados: "Sem observador, evite cargas máximas: retirar os halteres da posição inicial é o momento de maior risco.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Peitoral com trajetória adaptável ao ombro.",
        "Alternativa à barra quando falta observador.",
        "Trabalho unilateral para equilibrar os lados.",
      ],
      quandoEvitar: [
        "Dor aguda no ombro em qualquer amplitude.",
        "Cargas máximas sem segurança para posicionar e retirar os halteres.",
      ],
      errosComuns: [
        "Perder a retração das escápulas e rolar os ombros à frente.",
        "Descer os cotovelos abaixo do conforto do ombro.",
        "Bater os halteres no topo em vez de controlar.",
      ],
      variacoes: [
        "Floor press (no chão): limita a amplitude e poupa o ombro.",
        "Banco inclinado: desloca a ênfase para a porção superior.",
        "Unilateral: exige mais do core anti-rotação.",
      ],
    },
    conteudo: {
      visaoGeral:
        "O supino com halteres entrega alta ativação do peitoral com a vantagem de uma trajetória livre, que cada ombro ajusta ao próprio conforto. É uma escolha versátil quando a barra incomoda ou não há observador.",
      biomecanica:
        "O peitoral maior conduz a adução horizontal, com deltoide anterior e tríceps como sinergistas e o serrátil estabilizando a escápula. A independência dos halteres exige mais controle que a máquina, o que aumenta a demanda estabilizadora.",
      fisiologia:
        "De forma aguda, a amplitude ampla favorece tensão do peitoral inclusive na posição alongada; de forma crônica, o estímulo progressivo de tensão mecânica tende a favorecer força e hipertrofia (Schoenfeld, 2010). Trabalhar cada lado de forma independente ajuda a corrigir assimetrias ao longo do tempo.",
      prescricaoPratica:
        "Em geral, mantenha as escápulas retraídas e os cotovelos a cerca de 45 graus; use a versão no solo quando faltar banco ou quando o ombro pedir menos amplitude.",
    },
    trustLevel: "tendência prática",
    temCena: false,
  },

  /* ------------------------------ SUPINO NA MÁQUINA ------------------------------ */
  {
    id: "e26",
    slug: "supino-maquina",
    nome: "Supino na máquina (chest press)",
    grupoMuscular: "Peitorais",
    equipamento: "Máquina",
    objetivo: ["Hipertrofia", "Reabilitação/retorno", "Aprendizado técnico", "Resistência muscular"],
    nivel: "Iniciante",
    articulacaoPredominante: "Ombro e cotovelo",
    restricoes: [],
    premium: false,
    resumoPratico:
      "Empurrar horizontal guiado: em geral a entrada mais segura para peitorais em iniciantes e retorno, com amplitude ajustável ao conforto do ombro.",
    imagem: "/exercises/supino-maquina.webp",
    imagemAnalise: "/exercises/supino-maquina-analysis.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Peitoral maior", percentual: 80, papel: "primário" },
      { musculo: "Tríceps braquial", percentual: 60, papel: "sinergista" },
      { musculo: "Deltoide anterior", percentual: 55, papel: "sinergista" },
    ],
    indiceEficiencia: { score: 76, metrics: m("Peitoral maior", 80, 24, 15, 5, 42, 20) },
    fases: [
      { nome: "Ajuste", descricao: "Banco na altura em que as manoplas ficam na linha do peito." },
      { nome: "Empurrada", descricao: "Empurra as manoplas à frente sem travar os cotovelos." },
      { nome: "Retorno", descricao: "Volta controlando até sentir o peito alongar no conforto." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 45,
        titulo: "Trajetória guiada",
        camadas: {
          resumo: "A máquina fixa o caminho e reduz a exigência técnica.",
          biomecanica: "Com a trajetória guiada, o esforço de estabilização cai e o foco vai para o peitoral e o tríceps.",
          fisiologia: "Permite acumular volume com segurança mesmo quando padrões livres ainda geram desconforto.",
          evidencia: "Boa opção nas primeiras semanas e no retorno pós-lesão, conduzida pela equipe de reabilitação.",
          cuidados: "Ajuste a amplitude ao conforto do ombro; não force a manopla para trás além do confortável.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Primeiro contato com o empurrar horizontal.",
        "Retorno pós-lesão com amplitude controlada.",
        "Volume de peitoral com baixa demanda técnica.",
      ],
      quandoEvitar: [
        "Busca por transferência para padrões livres (halteres e barra pedem mais estabilização).",
      ],
      errosComuns: [
        "Travar os cotovelos com força no fim do movimento.",
        "Puxar a manopla para trás além do conforto do ombro.",
        "Elevar os ombros em vez de manter as escápulas apoiadas.",
      ],
      variacoes: [
        "Unilateral (um braço por vez), quando a máquina permite.",
        "Pegada mais fechada: aumenta a participação do tríceps.",
        "Amplitude parcial no retorno pós-lesão, conforme liberação.",
      ],
    },
    conteudo: {
      visaoGeral:
        "O supino na máquina entrega um bom estímulo de peitoral com a menor barreira técnica possível. A trajetória guiada faz dele a escolha natural para iniciantes e para o retorno gradual ao treino de empurrar.",
      biomecanica:
        "O peitoral maior conduz a adução horizontal, com tríceps e deltoide anterior como sinergistas. A máquina assume a estabilização, o que reduz a demanda de controle e concentra o esforço no músculo-alvo.",
      fisiologia:
        "De forma aguda, o esforço guiado recruta o peitoral com pouca fadiga coordenativa; de forma crônica, a possibilidade de progredir carga com segurança favorece força e hipertrofia (Schoenfeld, 2010). É um ponto de partida do qual se avança para os halteres à medida que a técnica amadurece.",
      prescricaoPratica:
        "Em geral, ajuste o banco para que as manoplas fiquem na linha do peito e controle a fase de retorno; use como base de volume antes de introduzir os padrões livres.",
    },
    trustLevel: "regra pedagógica",
    temCena: false,
  },

  /* ------------------------------ ELEVAÇÃO LATERAL ------------------------------ */
  {
    id: "e27",
    slug: "elevacao-lateral-halteres",
    nome: "Elevação lateral com halteres",
    grupoMuscular: "Ombros",
    equipamento: "Halter",
    objetivo: ["Hipertrofia", "Resistência muscular"],
    nivel: "Iniciante",
    articulacaoPredominante: "Ombro",
    restricoes: ["Ombro sensível"],
    premium: false,
    resumoPratico:
      "Isolamento do deltoide médio com carga leve: em geral basta subir até a linha dos ombros, sem impulso de tronco.",
    imagem: "/exercises/elevacao-lateral-halteres.webp",
    imagemAnalise: "/exercises/elevacao-lateral-halteres-analysis.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Deltoide médio", percentual: 78, papel: "primário" },
      { musculo: "Trapézio superior", percentual: 45, papel: "sinergista" },
      { musculo: "Deltoide anterior", percentual: 40, papel: "sinergista" },
    ],
    indiceEficiencia: { score: 72, metrics: m("Deltoide médio", 78, 30, 18, 5, 52, 20) },
    fases: [
      { nome: "Posição", descricao: "Em pé, halteres ao lado do corpo, cotovelos levemente flexionados." },
      { nome: "Elevação", descricao: "Sobe os braços pelos lados até a linha dos ombros, conduzindo pelos cotovelos." },
      { nome: "Descida", descricao: "Volta controlando, sem deixar os halteres caírem." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 35,
        titulo: "Até a linha dos ombros",
        camadas: {
          resumo: "Subir além da linha dos ombros recruta mais o trapézio.",
          biomecanica: "Conduzir pelos cotovelos e parar na horizontal mantém o foco no deltoide médio.",
          fisiologia: "Cargas leves com boa forma geram tensão suficiente para o deltoide, que responde bem a volume.",
          evidencia: "Na prática, impulso de tronco é sinal de carga excessiva para o objetivo.",
          cuidados: "Em ombro sensível, reduza a amplitude e evite subir acima da horizontal.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Volume dirigido ao deltoide médio (largura dos ombros).",
        "Complemento aos empurrões verticais.",
        "Trabalho leve e frequente para o ombro.",
      ],
      quandoEvitar: [
        "Dor no ombro ao elevar o braço pela lateral.",
        "Objetivo de força máxima (o exercício é de isolamento leve).",
      ],
      errosComuns: [
        "Usar impulso de tronco para lançar os halteres.",
        "Subir acima da linha dos ombros e transferir para o trapézio.",
        "Carga pesada demais que quebra a forma.",
      ],
      variacoes: [
        "Sentado: elimina o impulso de tronco.",
        "Com elástico: resistência crescente e articulações poupadas.",
        "Unilateral apoiado: mais controle e amplitude.",
      ],
    },
    conteudo: {
      visaoGeral:
        "A elevação lateral é o isolamento clássico do deltoide médio, o músculo que dá largura aos ombros. Por exigir cargas leves e boa forma, é acessível e cabe bem em qualquer rotina de tronco superior.",
      biomecanica:
        "O deltoide médio conduz a abdução do braço, com participação do trapézio superior na rotação da escápula. Conduzir o movimento pelos cotovelos e parar na horizontal mantém a ênfase no deltoide.",
      fisiologia:
        "De forma aguda, o deltoide médio é recrutado de maneira crescente ao longo do arco; de forma crônica, o volume leve e frequente tende a favorecer hipertrofia da porção lateral. É um trabalho de refinamento, não de carga máxima.",
      prescricaoPratica:
        "Em geral, priorize a forma sobre a carga: pare na linha dos ombros, controle a descida e evite o impulso de tronco. A versão sentada ajuda quem tende a compensar.",
    },
    trustLevel: "regra pedagógica",
    temCena: false,
  },

  /* ------------------------------ DESENVOLVIMENTO NA MÁQUINA ------------------------------ */
  {
    id: "e28",
    slug: "desenvolvimento-maquina",
    nome: "Desenvolvimento na máquina",
    grupoMuscular: "Ombros",
    equipamento: "Máquina",
    objetivo: ["Hipertrofia", "Força", "Reabilitação/retorno"],
    nivel: "Iniciante",
    articulacaoPredominante: "Ombro e cotovelo",
    restricoes: ["Ombro sensível"],
    premium: false,
    resumoPratico:
      "Empurrar vertical guiado com apoio de tronco: tende a reduzir a exigência de estabilização frente aos halteres, útil para aprender o padrão.",
    imagem: "/exercises/desenvolvimento-maquina.webp",
    imagemAnalise: "/exercises/desenvolvimento-maquina-analysis.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Deltoide anterior", percentual: 78, papel: "primário" },
      { musculo: "Deltoide médio", percentual: 62, papel: "sinergista" },
      { musculo: "Tríceps braquial", percentual: 55, papel: "sinergista" },
      { musculo: "Trapézio superior", percentual: 40, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 74, metrics: m("Deltoide anterior", 78, 28, 20, 5, 58, 40) },
    fases: [
      { nome: "Ajuste", descricao: "Banco na altura em que as manoplas ficam próximas dos ombros." },
      { nome: "Empurrada", descricao: "Empurra para cima sem travar os cotovelos nem elevar os ombros." },
      { nome: "Retorno", descricao: "Desce controlando até a manopla voltar à linha do ombro." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 30,
        titulo: "Empurrar acima da cabeça",
        camadas: {
          resumo: "O apoio de tronco reduz a exigência de estabilização.",
          biomecanica: "A máquina guia o caminho vertical e diminui a compensação lombar comum no desenvolvimento em pé.",
          fisiologia: "Permite treinar o padrão acima da cabeça com segurança antes de progredir para halteres.",
          evidencia: "Costuma ser dos últimos padrões liberados após lesão de ombro; respeite a amplitude tolerada.",
          cuidados: "Em ombro sensível, limite a amplitude ao conforto e evite descer a manopla muito abaixo.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Aprender o empurrar vertical com segurança.",
        "Volume de ombro com baixa demanda de estabilização.",
        "Retorno gradual conforme liberação da equipe de saúde.",
      ],
      quandoEvitar: [
        "Dor no ombro na amplitude acima da cabeça.",
        "Fase inicial pós-lesão sem liberação para movimentos overhead.",
      ],
      errosComuns: [
        "Elevar os ombros em direção às orelhas ao empurrar.",
        "Descer a manopla muito abaixo do conforto do ombro.",
        "Travar os cotovelos no topo.",
      ],
      variacoes: [
        "Amplitude parcial no retorno pós-lesão.",
        "Pegada neutra, quando a máquina permite (poupa o ombro).",
        "Progressão para halteres à medida que a estabilização melhora.",
      ],
    },
    conteudo: {
      visaoGeral:
        "O desenvolvimento na máquina ensina o empurrar acima da cabeça com o mínimo de exigência de equilíbrio. É uma opção prudente para iniciantes e para quem retorna de lesão, quando o padrão overhead precisa ser reintroduzido com cuidado.",
      biomecanica:
        "O deltoide anterior conduz o empurrar vertical, com deltoide médio e tríceps como sinergistas e o trapézio participando da rotação da escápula. O apoio de tronco reduz a compensação lombar típica da versão em pé.",
      fisiologia:
        "De forma aguda, cargas moderadas geram tensão elevada no deltoide; de forma crônica, o estímulo progressivo tende a aumentar força e volume do ombro e a estabilidade em posições elevadas, relevante para tarefas do dia a dia acima da cabeça. Consolidar amplitude e controle antes de progredir carga costuma reduzir desconforto.",
      prescricaoPratica:
        "Em geral, ajuste o banco para começar na linha dos ombros e respeite a amplitude confortável; use a pegada neutra quando disponível para poupar o ombro.",
    },
    trustLevel: "cuidado de segurança",
    temCena: false,
  },

  /* ------------------------------ REMADA CURVADA COM HALTERES ------------------------------ */
  {
    id: "e29",
    slug: "remada-curvada-halteres",
    nome: "Remada curvada com halteres",
    grupoMuscular: "Costas",
    equipamento: "Halter",
    objetivo: ["Força", "Hipertrofia"],
    nivel: "Intermediário",
    articulacaoPredominante: "Cotovelo e escápula",
    restricoes: ["Dor lombar"],
    premium: false,
    resumoPratico:
      "Puxar horizontal com carga em casa ou na academia: exige dobradiça de quadril estável, o que em geral pede o padrão dominado antes de progredir carga.",
    imagem: "/exercises/remada-curvada-halteres.webp",
    imagemAnalise: "/exercises/remada-curvada-halteres-analysis.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Latíssimo do dorso", percentual: 78, papel: "primário" },
      { musculo: "Romboides", percentual: 65, papel: "sinergista" },
      { musculo: "Eretores da espinha", percentual: 55, papel: "estabilizador" },
      { musculo: "Bíceps braquial", percentual: 50, papel: "sinergista" },
    ],
    indiceEficiencia: { score: 80, metrics: m("Latíssimo do dorso", 78, 62, 62, 15, 38, 45) },
    fases: [
      { nome: "Dobradiça", descricao: "Quadril para trás, tronco inclinado, coluna neutra e joelhos leves." },
      { nome: "Puxada", descricao: "Conduz os cotovelos para trás, aproximando as escápulas." },
      { nome: "Descida", descricao: "Estende os braços controlando, sem arredondar a lombar." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 55,
        titulo: "Coluna neutra sob carga",
        camadas: {
          resumo: "A lombar sustenta a posição inclinada durante toda a série.",
          biomecanica: "A inclinação de tronco exige forte trabalho isométrico dos eretores; arredondar a coluna sob carga aumenta o risco.",
          fisiologia: "O latíssimo e os romboides conduzem a puxada; a estabilização do tronco é o gargalo em cargas altas.",
          evidencia: "Na prática, quem não domina a dobradiça de quadril tende a compensar na lombar.",
          cuidados: "Em dor lombar, prefira a remada apoiada (máquina ou tronco no banco) que retira a carga da coluna.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Puxar horizontal com carga usando apenas halteres.",
        "Fortalecer a musculatura de puxada e a estabilização do tronco.",
        "Equilibrar o volume de empurrar com o de puxar.",
      ],
      quandoEvitar: [
        "Dor lombar aguda ou dobradiça de quadril ainda não dominada.",
        "Objetivo de isolar as costas sem estressar a coluna (prefira apoiada).",
      ],
      errosComuns: [
        "Arredondar a lombar para puxar mais carga.",
        "Usar impulso de tronco (subir e descer o corpo) em vez dos braços.",
        "Puxar só com o bíceps, sem aproximar as escápulas.",
      ],
      variacoes: [
        "Unilateral com apoio de uma mão no banco: reduz a carga na lombar.",
        "Tronco menos inclinado: diminui a demanda dos eretores.",
        "Remada apoiada no banco inclinado: retira a coluna da equação.",
      ],
    },
    conteudo: {
      visaoGeral:
        "A remada curvada é um dos exercícios de puxar mais completos com pesos livres, mas cobra uma dobradiça de quadril estável. Bem executada, constrói costas e estabilização de tronco ao mesmo tempo.",
      biomecanica:
        "O latíssimo e os romboides conduzem a puxada horizontal, enquanto os eretores da espinha sustentam isometricamente o tronco inclinado. Essa dupla função é o que gera o estímulo, e também o que exige cautela na coluna.",
      fisiologia:
        "De forma aguda, manter o tronco estável e conduzir pela escápula direciona o esforço às costas, em vez de transferi-lo ao balanço lombar; de forma crônica, o fortalecimento tende a melhorar a capacidade de estabilizar a cintura escapular sob carga. A qualidade da posição pesa mais que a carga absoluta.",
      prescricaoPratica:
        "Em geral, domine a dobradiça de quadril sem carga antes de progredir; em histórico de dor lombar, prefira as versões apoiadas, que preservam a coluna.",
    },
    trustLevel: "cuidado de segurança",
    temCena: false,
  },

  /* ------------------------------ REMADA NA MÁQUINA ------------------------------ */
  {
    id: "e30",
    slug: "remada-maquina",
    nome: "Remada na máquina (apoio de peito)",
    grupoMuscular: "Costas",
    equipamento: "Máquina",
    objetivo: ["Hipertrofia", "Reabilitação/retorno", "Aprendizado técnico", "Resistência muscular"],
    nivel: "Iniciante",
    articulacaoPredominante: "Cotovelo e escápula",
    restricoes: [],
    premium: false,
    resumoPratico:
      "Puxar horizontal com o tronco apoiado: em geral a opção de costas mais amigável à lombar, boa para iniciantes e retorno.",
    imagem: "/exercises/remada-maquina.webp",
    imagemAnalise: "/exercises/remada-maquina-analysis.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Latíssimo do dorso", percentual: 80, papel: "primário" },
      { musculo: "Romboides", percentual: 68, papel: "sinergista" },
      { musculo: "Trapézio médio", percentual: 60, papel: "sinergista" },
      { musculo: "Bíceps braquial", percentual: 48, papel: "sinergista" },
    ],
    indiceEficiencia: { score: 76, metrics: m("Latíssimo do dorso", 80, 26, 18, 5, 32, 22) },
    fases: [
      { nome: "Ajuste", descricao: "Peito apoiado na almofada, manoplas ao alcance dos braços estendidos." },
      { nome: "Puxada", descricao: "Puxa conduzindo os cotovelos para trás e aproximando as escápulas." },
      { nome: "Retorno", descricao: "Estende os braços controlando, mantendo o peito apoiado." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 50,
        titulo: "Apoio de peito",
        camadas: {
          resumo: "O apoio retira a lombar da equação.",
          biomecanica: "Com o tronco sustentado pela almofada, não há trabalho isométrico dos eretores, e o foco fica nas costas.",
          fisiologia: "Permite puxar com carga sem o gargalo de estabilização do tronco, útil para volume e para o retorno.",
          evidencia: "É a opção de costas mais recomendada quando a lombar precisa ser poupada.",
          cuidados: "Conduza pela escápula; puxar só com o bíceps reduz o estímulo do dorso.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Costas com a lombar poupada (dor lombar ou retorno).",
        "Primeiro contato com o puxar horizontal.",
        "Volume dirigido ao dorso com baixa exigência técnica.",
      ],
      quandoEvitar: [
        "Busca por transferência ao padrão livre (remada curvada exige mais estabilização).",
      ],
      errosComuns: [
        "Descolar o peito da almofada para puxar mais carga.",
        "Puxar só com os braços, sem aproximar as escápulas.",
        "Encolher os ombros em direção às orelhas.",
      ],
      variacoes: [
        "Pegada aberta: mais ênfase no trapézio médio e romboides.",
        "Pegada neutra ou fechada: mais latíssimo e bíceps.",
        "Unilateral, quando a máquina permite.",
      ],
    },
    conteudo: {
      visaoGeral:
        "A remada com apoio de peito entrega alta ativação das costas sem cobrar da lombar, porque a almofada sustenta o tronco. É uma escolha de baixo risco para iniciantes e para o retorno ao treino.",
      biomecanica:
        "O latíssimo, os romboides e o trapézio médio conduzem a puxada e a retração escapular, com o bíceps como sinergista. Como o tronco fica apoiado, não há a demanda estabilizadora dos eretores presente na remada curvada.",
      fisiologia:
        "De forma aguda, conduzir pela escápula direciona o esforço ao dorso; de forma crônica, o trabalho progressivo tende a aumentar força e volume das costas e a melhorar a estabilidade da cintura escapular. Por poupar a coluna, permite acumular volume com conforto.",
      prescricaoPratica:
        "Em geral, mantenha o peito apoiado e conduza o movimento pelas escápulas; varie a pegada para deslocar a ênfase entre latíssimo e músculos da região média das costas.",
    },
    trustLevel: "regra pedagógica",
    temCena: false,
  },

  /* ------------------------------ TRÍCEPS FRANCÊS ------------------------------ */
  {
    id: "e31",
    slug: "triceps-frances-halter",
    nome: "Tríceps francês com halter",
    grupoMuscular: "Braços",
    equipamento: "Halter",
    objetivo: ["Hipertrofia", "Resistência muscular"],
    nivel: "Iniciante",
    articulacaoPredominante: "Cotovelo",
    restricoes: ["Ombro sensível"],
    premium: false,
    resumoPratico:
      "Extensão de cotovelo acima da cabeça: fecha o trabalho de braços em casa, respeitando a amplitude tolerável do ombro.",
    imagem: "/exercises/triceps-frances-halter.webp",
    imagemAnalise: "/exercises/triceps-frances-halter-analysis.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Tríceps braquial", percentual: 82, papel: "primário" },
      { musculo: "Ancôneo", percentual: 40, papel: "sinergista" },
      { musculo: "Transverso do abdome", percentual: 25, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 68, metrics: m("Tríceps braquial", 82, 34, 15, 5, 48, 45) },
    fases: [
      { nome: "Posição", descricao: "Sentado ou em pé, halter atrás da cabeça, cotovelos apontados para cima." },
      { nome: "Extensão", descricao: "Estende os cotovelos levando o halter para cima, braços fixos." },
      { nome: "Flexão", descricao: "Desce controlando atrás da cabeça, dentro do conforto do ombro." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 30,
        titulo: "Cotovelos fixos",
        camadas: {
          resumo: "Manter os cotovelos apontados para cima isola o tríceps.",
          biomecanica: "A posição acima da cabeça alonga a cabeça longa do tríceps, aumentando o estímulo nessa porção.",
          fisiologia: "A tensão localizada acumula trabalho no tríceps com pouca fadiga sistêmica.",
          evidencia: "Na prática, abrir os cotovelos transfere esforço e reduz o estímulo.",
          cuidados: "Em ombro sensível, reduza a amplitude atrás da cabeça ou use a versão na polia.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Volume dirigido ao tríceps em casa, com um único halter.",
        "Ênfase na cabeça longa (porção interna do braço).",
        "Complemento aos empurradores.",
      ],
      quandoEvitar: [
        "Dor no ombro na posição acima da cabeça.",
        "Objetivo de força máxima (é um isolamento leve).",
      ],
      errosComuns: [
        "Abrir os cotovelos para os lados.",
        "Usar amplitude excessiva que force o ombro.",
        "Balançar o tronco para ajudar a subir.",
      ],
      variacoes: [
        "Sentado com apoio de encosto: estabiliza o tronco.",
        "Tríceps na polia (corda): mantém tensão e poupa o ombro.",
        "Unilateral: corrige diferenças entre os braços.",
      ],
    },
    conteudo: {
      visaoGeral:
        "O tríceps francês fecha o trabalho de braços com o mínimo de equipamento. A posição acima da cabeça dá ênfase à cabeça longa do tríceps, difícil de alcançar em outros isolamentos.",
      biomecanica:
        "O tríceps braquial conduz a extensão do cotovelo; na posição overhead, a cabeça longa fica alongada e recebe estímulo extra. Manter os cotovelos fixos e apontados para cima é o que isola o músculo.",
      fisiologia:
        "De forma aguda, a tensão localizada recruta o tríceps de maneira progressiva; de forma crônica, o volume dirigido tende a favorecer hipertrofia do músculo que responde pela maior parte do braço (Schoenfeld, 2010). Como acessório leve, rende mais pela consistência que pela carga.",
      prescricaoPratica:
        "Em geral, mantenha os cotovelos apontados para cima e controle a descida; em ombro sensível, reduza a amplitude atrás da cabeça ou migre para a versão na polia.",
    },
    trustLevel: "regra pedagógica",
    temCena: false,
  },

  /* ------------------------------ REMADA INVERTIDA ------------------------------ */
  {
    id: "e32",
    slug: "remada-invertida",
    nome: "Remada invertida (barra baixa ou mesa firme)",
    grupoMuscular: "Costas",
    equipamento: "Peso corporal",
    objetivo: ["Força", "Resistência muscular", "Aprendizado técnico"],
    nivel: "Intermediário",
    articulacaoPredominante: "Cotovelo e escápula",
    restricoes: [],
    premium: false,
    resumoPratico:
      "Puxar horizontal com o peso do corpo sob um apoio firme: a carga se ajusta pelo ângulo do tronco, sem nenhum equipamento além de um ponto de pegada.",
    imagem: "/exercises/remada-invertida.webp",
    imagemAnalise: "/exercises/remada-invertida-analysis.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Latíssimo do dorso", percentual: 75, papel: "primário" },
      { musculo: "Romboides", percentual: 70, papel: "sinergista" },
      { musculo: "Bíceps braquial", percentual: 55, papel: "sinergista" },
      { musculo: "Transverso do abdome", percentual: 45, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 77, metrics: m("Latíssimo do dorso", 75, 55, 35, 10, 45, 30) },
    fases: [
      { nome: "Posição", descricao: "Suspenso sob a barra, corpo em linha reta, calcanhares no chão." },
      { nome: "Puxada", descricao: "Puxa o peito em direção à barra, aproximando as escápulas." },
      { nome: "Descida", descricao: "Estende os braços controlando, mantendo o corpo firme." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 50,
        titulo: "Ângulo do tronco = carga",
        camadas: {
          resumo: "Quanto mais horizontal o corpo, mais difícil a remada.",
          biomecanica: "O apoio dos pés determina a fração do peso corporal sustentada pelos braços e costas.",
          fisiologia: "Ajustar o ângulo permite progredir a resistência sem trocar de equipamento.",
          evidencia: "Na prática, é uma das melhores portas de entrada para a barra fixa.",
          cuidados: "Garanta que o apoio seja firme e estável antes de suspender o corpo.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Puxar horizontal sem nenhum peso, apenas com um apoio firme.",
        "Construir força de puxada antes da barra fixa.",
        "Equilibrar o volume de empurrar em treinos de peso corporal.",
      ],
      quandoEvitar: [
        "Apoio instável ou frágil (risco de queda).",
        "Ainda sem controle de tronco para manter o corpo em linha.",
      ],
      errosComuns: [
        "Deixar o quadril cair e perder a linha do corpo.",
        "Puxar só com os braços, sem aproximar as escápulas.",
        "Não encostar o peito no apoio e encurtar a amplitude.",
      ],
      variacoes: [
        "Joelhos flexionados com pés no chão: regressão mais fácil.",
        "Pés elevados: aumenta a fração do peso e a dificuldade.",
        "Pegada supinada: mais participação do bíceps.",
      ],
    },
    conteudo: {
      visaoGeral:
        "A remada invertida é o puxar horizontal do treino sem equipamento: basta uma barra baixa ou uma mesa firme. A carga se ajusta pelo ângulo do corpo, o que a torna escalável do iniciante ao avançado.",
      biomecanica:
        "O latíssimo e os romboides conduzem a puxada e a retração escapular, com o bíceps como sinergista e o core mantendo a linha do corpo. O ângulo do tronco define quanto do peso corporal é sustentado.",
      fisiologia:
        "De forma aguda, aproximar o peito do apoio recruta a musculatura de puxada de forma completa; de forma crônica, tornar o corpo mais horizontal progride a resistência sem carga externa, construindo a base para a barra fixa (Andersen et al., 2014). É um recurso durável no treino de peso corporal.",
      prescricaoPratica:
        "Em geral, escolha o ângulo que permita de 6 a 12 repetições com o peito tocando o apoio; progrida elevando os pés antes de buscar volume, e confirme sempre a estabilidade do ponto de pegada.",
    },
    trustLevel: "cuidado de segurança",
    temCena: false,
  },

  /* ------------------------------ DESENVOLVIMENTO COM ELÁSTICO ------------------------------ */
  {
    id: "e33",
    slug: "desenvolvimento-elastico",
    nome: "Desenvolvimento com elástico",
    grupoMuscular: "Ombros",
    equipamento: "Elástico",
    objetivo: ["Resistência muscular", "Reabilitação/retorno", "Aprendizado técnico"],
    nivel: "Iniciante",
    articulacaoPredominante: "Ombro e cotovelo",
    restricoes: ["Ombro sensível"],
    premium: false,
    resumoPratico:
      "Empurrar vertical contra a banda presa sob os pés: a resistência cresce no fim do arco, o que em geral perdoa o início do movimento e ensina o padrão.",
    imagem: "/exercises/desenvolvimento-elastico.webp",
    imagemAnalise: "/exercises/desenvolvimento-elastico-analysis.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Deltoide", percentual: 70, papel: "primário" },
      { musculo: "Tríceps braquial", percentual: 52, papel: "sinergista" },
      { musculo: "Trapézio superior", percentual: 38, papel: "estabilizador" },
      { musculo: "Transverso do abdome", percentual: 30, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 70, metrics: m("Deltoide", 70, 30, 22, 8, 50, 38) },
    fases: [
      { nome: "Ancoragem", descricao: "Banda sob os pés, mãos na linha dos ombros, cotovelos à frente." },
      { nome: "Empurrada", descricao: "Empurra as mãos para cima contra a resistência crescente da banda." },
      { nome: "Retorno", descricao: "Desce controlando até as mãos voltarem à linha dos ombros." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 30,
        titulo: "Resistência crescente",
        camadas: {
          resumo: "A banda pesa mais no fim do movimento que no início.",
          biomecanica: "O perfil de resistência do elástico alivia o começo do arco, onde o ombro costuma ser mais sensível.",
          fisiologia: "Permite treinar o padrão overhead com baixa carga inicial, útil no retorno pós-lesão.",
          evidencia: "Bandas são recurso comum em reabilitação de ombro por serem articulações-amigáveis.",
          cuidados: "Escolha uma banda que permita boa forma em toda a amplitude tolerada.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Ombro em casa ou em viagem, só com uma banda.",
        "Reintroduzir o padrão overhead com carga baixa.",
        "Aprender o empurrar vertical antes dos halteres.",
      ],
      quandoEvitar: [
        "Dor no ombro que persiste mesmo com banda leve.",
        "Objetivo de força máxima (a resistência do elástico é limitada).",
      ],
      errosComuns: [
        "Banda curta demais que impede completar a amplitude.",
        "Arquear a lombar para empurrar contra a resistência.",
        "Soltar a volta em vez de controlar a fase excêntrica.",
      ],
      variacoes: [
        "Sentado com a banda sob a cadeira: estabiliza o tronco.",
        "Unilateral: corrige diferenças entre os lados.",
        "Pegada neutra: poupa o ombro.",
      ],
    },
    conteudo: {
      visaoGeral:
        "O desenvolvimento com elástico leva o empurrar vertical para qualquer lugar. O perfil de resistência crescente da banda alivia o início do movimento, o que costuma ser bem tolerado por ombros sensíveis e útil no retorno ao treino.",
      biomecanica:
        "O deltoide conduz o empurrar vertical, com tríceps como sinergista e o trapézio participando da estabilização da escápula. A resistência do elástico aumenta com o alongamento da banda, deslocando o pico de esforço para o fim do arco.",
      fisiologia:
        "De forma aguda, a carga leve no início do movimento permite treinar o padrão com conforto; de forma crônica, o volume constante tende a melhorar a resistência do ombro e a consolidar o controle escapular. É um recurso frequente em reabilitação por poupar as articulações.",
      prescricaoPratica:
        "Em geral, escolha uma banda que permita boa forma em toda a amplitude tolerada e controle a volta; a versão sentada ajuda quem tende a arquear a lombar.",
    },
    trustLevel: "cuidado de segurança",
    temCena: false,
  },

  /* ------------------------------ MERGULHO NO BANCO ------------------------------ */
  {
    id: "e35",
    slug: "mergulho-no-banco",
    nome: "Mergulho no banco (tríceps)",
    grupoMuscular: "Braços",
    equipamento: "Peso corporal",
    objetivo: ["Hipertrofia", "Resistência muscular", "Aprendizado técnico"],
    nivel: "Iniciante",
    articulacaoPredominante: "Cotovelo e ombro",
    restricoes: ["Ombro sensível"],
    premium: false,
    resumoPratico:
      "Extensão de cotovelo com o peso do corpo apoiado num banco ou cadeira firme: fecha o trabalho de tríceps em casa, com a carga ajustada pela posição dos pés.",
    imagem: "/exercises/mergulho-no-banco.webp",
    imagemAnalise: "/exercises/mergulho-no-banco-analysis.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Tríceps braquial", percentual: 80, papel: "primário" },
      { musculo: "Peitoral maior", percentual: 45, papel: "sinergista" },
      { musculo: "Deltoide anterior", percentual: 42, papel: "sinergista" },
    ],
    indiceEficiencia: { score: 72, metrics: m("Tríceps braquial", 80, 40, 18, 8, 58, 40) },
    fases: [
      { nome: "Apoio", descricao: "Mãos na borda do banco, quadril à frente, cotovelos apontados para trás." },
      { nome: "Descida", descricao: "Dobra os cotovelos descendo o quadril, sem afundar os ombros." },
      { nome: "Empurrada", descricao: "Estende os cotovelos empurrando o corpo de volta para cima." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 45,
        titulo: "Amplitude e ombro",
        camadas: {
          resumo: "Descer demais estressa a frente do ombro.",
          biomecanica: "A extensão do cotovelo recruta o tríceps; descer o quadril muito abaixo do banco aumenta a tensão na cápsula anterior do ombro.",
          fisiologia: "A carga se ajusta pela posição dos pés: joelhos dobrados alivia, pernas estendidas ou pés elevados aumenta.",
          evidencia: "Na prática, quem sente o ombro deve reduzir a amplitude e manter os cotovelos apontados para trás.",
          cuidados: "Em ombro sensível, limite a descida ao conforto e evite afundar os ombros.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Tríceps em casa, com um banco, cama firme ou cadeira estável.",
        "Complemento aos empurradores de tronco superior.",
        "Progressão de carga só mudando a posição das pernas.",
      ],
      quandoEvitar: [
        "Dor na frente do ombro que piora ao descer.",
        "Apoio instável (risco de escorregar).",
      ],
      errosComuns: [
        "Descer o quadril muito abaixo do banco, estressando o ombro.",
        "Afastar o quadril do banco e transferir para as pernas.",
        "Encolher os ombros em direção às orelhas.",
      ],
      variacoes: [
        "Joelhos dobrados, pés perto: regressão mais fácil.",
        "Pernas estendidas: aumenta a carga.",
        "Pés elevados noutro apoio: versão mais difícil.",
      ],
    },
    conteudo: {
      visaoGeral:
        "O mergulho no banco leva o trabalho de tríceps para qualquer lugar com uma superfície firme. A carga se ajusta pela posição das pernas, o que o torna escalável do iniciante ao avançado sem nenhum peso externo.",
      biomecanica:
        "O tríceps braquial conduz a extensão do cotovelo, com peitoral e deltoide anterior participando como sinergistas. A profundidade da descida define quanto a região anterior do ombro é solicitada, ponto de atenção para ombros sensíveis.",
      fisiologia:
        "De forma aguda, o esforço recruta o tríceps de forma progressiva ao longo da série; de forma crônica, avançar a posição das pernas mantém as repetições numa faixa desafiadora e tende a favorecer força e hipertrofia do tríceps sem carga externa (Schoenfeld, 2010). É um recurso prático quando não há halteres nem polia.",
      prescricaoPratica:
        "Em geral, mantenha os cotovelos apontados para trás e limite a descida ao conforto do ombro; progrida estendendo as pernas antes de buscar volume, e garanta que o apoio seja estável.",
    },
    trustLevel: "cuidado de segurança",
    temCena: false,
  },

  /* ------------------------------ EMPURRAR E PUXAR NA ÁGUA ------------------------------ */
  {
    id: "e34",
    slug: "empurra-puxa-aquatico",
    nome: "Empurrar e puxar na água (halteres de espuma)",
    grupoMuscular: "Corpo todo",
    equipamento: "Piscina",
    objetivo: ["Resistência muscular", "Reabilitação/retorno", "Emagrecimento"],
    nivel: "Iniciante",
    articulacaoPredominante: "Ombro e tronco",
    restricoes: [],
    premium: false,
    resumoPratico:
      "Trabalho de tronco superior contra a resistência da água: a velocidade do gesto define a carga, complementando a marcha aquática nos perfis que treinam só na piscina.",
    imagem: "/exercises/empurra-puxa-aquatico.webp",
    imagemAnalise: "/exercises/empurra-puxa-aquatico-analysis.webp",
    modalidade: "m-hidro",
    ativacao: [
      { musculo: "Deltoide", percentual: 45, papel: "primário" },
      { musculo: "Transverso do abdome", percentual: 45, papel: "estabilizador" },
      { musculo: "Peitoral maior", percentual: 42, papel: "sinergista" },
      { musculo: "Latíssimo do dorso", percentual: 40, papel: "sinergista" },
    ],
    indiceEficiencia: { score: 72, metrics: m("Deltoide", 45, 18, 12, 10, 30, 18) },
    fases: [
      { nome: "Base", descricao: "Em pé na água na altura do peito, joelhos leves, tronco firme." },
      { nome: "Empurrar", descricao: "Empurra os halteres de espuma para frente e para baixo contra a água." },
      { nome: "Puxar", descricao: "Traz de volta contra a resistência, sem deixar o tronco girar." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 45,
        titulo: "Velocidade como carga",
        camadas: {
          resumo: "Mais rápido na água significa mais resistência.",
          biomecanica: "A água resiste ao movimento nas duas direções, então empurrar e puxar trabalham grupos opostos sem carga que caia sobre a articulação.",
          fisiologia: "O empuxo reduz o peso sobre as articulações, permitindo volume com baixo impacto.",
          evidencia: "Meio aquático é escolha frequente para dor articular e retorno ao exercício.",
          cuidados: "Mantenha o tronco estável para o esforço não escapar para a lombar; observe conforto respiratório.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Tronco superior em quem treina só na piscina.",
        "Baixo impacto para dor articular e retorno ao exercício.",
        "Complemento à marcha aquática para envolver braços e costas.",
      ],
      quandoEvitar: [
        "Insuficiência cardíaca descompensada (a imersão aumenta o retorno venoso): conduza com a equipe de saúde.",
        "Feridas abertas ou infecções de pele.",
      ],
      errosComuns: [
        "Deixar o tronco girar a cada gesto (perde a estabilização).",
        "Manter velocidade baixa demais e reduzir o estímulo.",
        "Prender a respiração durante o esforço.",
      ],
      variacoes: [
        "Só empurrar (à frente): ênfase em peito e ombro.",
        "Só puxar (para o corpo): ênfase nas costas.",
        "Com mais velocidade e amplitude: aumenta a resistência.",
      ],
    },
    conteudo: {
      visaoGeral:
        "O empurrar e puxar na água leva o trabalho de tronco superior para o meio aquático, onde a resistência vem do próprio movimento e não de uma carga que cai sobre a articulação. Complementa a marcha aquática para quem treina só na piscina.",
      biomecanica:
        "A água oferece resistência proporcional à velocidade nas duas direções, então empurrar recruta peito e ombro e puxar recruta as costas, com o core estabilizando o tronco contra a rotação. O empuxo alivia o peso sobre as articulações.",
      fisiologia:
        "De forma aguda, a resistência contínua da água mantém a musculatura em trabalho sem picos de carga articular; de forma crônica, o volume de baixo impacto tende a melhorar a resistência muscular e o condicionamento, útil em perfis com dor articular ou em retorno ao exercício. A imersão altera a hemodinâmica, o que pede atenção em condições cardíacas.",
      prescricaoPratica:
        "Em geral, regule a intensidade pela velocidade e amplitude do gesto e mantenha o tronco estável; em condições cardíacas, conduza a progressão junto à equipe de saúde.",
    },
    trustLevel: "cuidado de segurança",
    temCena: false,
  },
];
