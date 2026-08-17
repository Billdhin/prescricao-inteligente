/**
 * DOIS EXERCÍCIOS QUE O CATÁLOGO NÃO TINHA, e como se soube disso.
 *
 * A bancada `scripts/bancada-catalogo-vazios.ts` mede o pool de cada objetivo, nível e
 * ambiente de treino contra o que o motor pede. Depois de revisar a marcação de objetivo dos
 * exercícios que já existiam, sobraram QUATRO buracos, e os quatro tinham a mesma causa:
 *
 *   Emagrecimento / Iniciante / só peso corporal ....... 4, faltava 1
 *   Emagrecimento / Iniciante / só piscina ............. 4, faltava 1
 *   Hipertrofia   / Iniciante / só peso corporal ....... 4, faltava 1
 *   Hipertrofia   / Iniciante / só piscina ............. 4, faltava 1
 *
 * O aluno iniciante que treina em casa tinha agachar (sentar e levantar), empurrar (flexão),
 * subir no step e dobradiça (ponte de glúteos), e NÃO TINHA PUXAR. A remada invertida cobre
 * esse padrão, mas está classificada como Intermediário, então o iniciante ficava sem. Daí a
 * REMADA INVERTIDA COM APOIO ALTO, que é para a remada o que a "flexão com apoio elevado" já
 * é para a flexão: o mesmo padrão, com a alavanca mais fácil. Um exercício fecha os quatro
 * buracos de uma vez, porque a piscina conta o peso corporal junto.
 *
 * O AGACHAMENTO AQUÁTICO não fecha buraco de contagem nenhum, e existe por outro motivo: o
 * catálogo tinha TRÊS exercícios de piscina e os três eram dose aeróbia (marcha, corrida
 * estacionária, empurrar e puxar na água). Ou seja, o aluno que declara piscina como único
 * ambiente recebia, no bloco de força, apenas exercícios de solo. Isso não aparecia em
 * nenhuma contagem porque peso corporal sempre conta, e é justamente o tipo de buraco que
 * some do relatório e aparece na sala.
 *
 * ## O QUE ELE NÃO FAZ HOJE, medido antes de publicar
 *
 * Ele NÃO entra na seleção automática: em 54 planos com piscina (todo objetivo, todo nível,
 * três combinações de equipamento) ele apareceu em ZERO. A causa não é ele, é o seletor: a
 * regra da casa é que peso corporal está SEMPRE disponível, e os exercícios de solo
 * ranqueiam à frente por métricas de segurança, então o ambiente que o aluno declarou não
 * pesa na ordenação.
 *
 * Ele não é código morto, e isso também foi medido: aparece em 4º na sugestão de TROCA para
 * um aluno de piscina, e está no catálogo do Laboratório. O profissional alcança, o motor
 * não oferece.
 *
 * Fazer o seletor PREFERIR o equipamento declarado ao peso corporal é uma decisão de produto
 * com efeito amplo (mudaria a escolha de todo aluno que declara equipamento), então fica
 * escalada em vez de decidida aqui.
 *
 * ## O que estes textos são
 *
 * Descrição de execução e de conduta, no mesmo registro do resto do catálogo, e por isso
 * `trustLevel` é "princípio biomecânico" nos dois: eles não afirmam desfecho clínico nem
 * citam número de estudo. A dose continua vindo da faixa do objetivo, como em todo o resto.
 *
 * ## Sem imagem, por enquanto
 *
 * Nenhum dos dois declara `imagem`, e o `check:catalogo` já os imprime na fila de imagem
 * pendente. Ausência é melhor que imagem que ensina o movimento errado.
 */
import type { Exercise, EficMetric } from "./types";

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

export const exerciciosEmagrecimento: Exercise[] = [
  /* ------------------- REMADA INVERTIDA COM APOIO ALTO ------------------- */
  {
    id: "em1",
    slug: "remada-invertida-apoio-alto",
    nome: "Remada invertida com apoio alto",
    grupoMuscular: "Costas",
    equipamento: "Peso corporal",
    objetivo: ["Emagrecimento", "Hipertrofia", "Resistência muscular", "Retorno ao treino", "Aprendizado técnico"],
    nivel: "Iniciante",
    articulacaoPredominante: "Cotovelo e escápula",
    premium: false,
    resumoPratico:
      "Puxar horizontal com o peso do corpo numa barra ou bancada na altura do quadril: quanto mais alto o apoio, mais em pé fica o tronco e mais leve fica a puxada. É a porta de entrada do padrão de puxar para quem treina em casa.",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Latíssimo do dorso", percentual: 68, papel: "primário" },
      { musculo: "Romboides", percentual: 62, papel: "sinergista" },
      { musculo: "Bíceps braquial", percentual: 50, papel: "sinergista" },
      { musculo: "Transverso do abdome", percentual: 35, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 74, metrics: m("Latíssimo do dorso", 68, 35, 25, 10, 35, 25) },
    fases: [
      { nome: "Posição", descricao: "Pegada na barra ou na borda da bancada na altura do quadril, corpo reto do ombro ao calcanhar, calcanhares apoiados no chão." },
      { nome: "Puxada", descricao: "Puxa o peito na direção do apoio, cotovelos rentes ao tronco e escápulas se aproximando, sem quebrar a linha do quadril." },
      { nome: "Retorno", descricao: "Estende os cotovelos devagar até o braço ficar reto, mantendo o corpo em prancha." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 45,
        titulo: "A altura do apoio é a carga",
        camadas: {
          resumo: "Apoio mais alto deixa o tronco mais em pé e a puxada mais leve. É assim que se regula a dificuldade.",
          biomecanica:
            "Quanto mais próximo da vertical o tronco fica, menor a fração do peso corporal que os músculos das costas precisam vencer.",
          fisiologia: "Sem carga externa, a progressão vem de baixar o apoio, de aproximar os pés ou de desacelerar o retorno.",
          evidencia: "Mesma lógica de regressão que a flexão de braço com apoio elevado já usa no padrão de empurrar.",
          cuidados: "Se o quadril cair antes do peito chegar ao apoio, suba o apoio: a prancha do corpo vem antes da amplitude.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Iniciante que treina em casa e precisa do padrão de puxar, que costuma faltar sem equipamento.",
        "Equilibrar um treino que já tem agachar e empurrar mas nenhuma puxada.",
        "Preparar a progressão para a remada invertida com o tronco mais horizontal.",
      ],
      quandoEvitar: [
        "Dor no ombro que aparece na puxada e não melhora ao subir o apoio.",
        "Punho ou cotovelo sensível sem um apoio que permita pegada confortável.",
        "Ausência de um ponto de apoio firme: bancada que desliza ou mesa leve não servem.",
      ],
      errosComuns: [
        "Deixar o quadril cair e transformar a puxada em movimento só de braço.",
        "Puxar com os cotovelos muito abertos, jogando a carga para a frente do ombro.",
        "Encurtar a amplitude e parar antes de o peito se aproximar do apoio.",
      ],
      variacoes: [
        "Apoio mais alto: regressão, deixa o tronco quase em pé.",
        "Apoio mais baixo: progressão natural, aproxima do horizontal.",
        "Joelhos dobrados com os pés no chão: reduz a carga sem mudar a altura do apoio.",
      ],
    },
    conteudo: {
      visaoGeral:
        "É a remada invertida na versão mais fácil: o apoio fica na altura do quadril, o tronco fica mais em pé e só uma parte do peso do corpo é puxada. Serve para quem ainda não sustenta a versão horizontal.",
      biomecanica:
        "O latíssimo e os romboides puxam o tronco na direção do apoio, com o bíceps ajudando na flexão do cotovelo. O abdômen mantém a linha do corpo, o que transforma o exercício também num trabalho de prancha.",
      fisiologia:
        "Sem carga externa, o estímulo se ajusta pela geometria: mudar a altura do apoio muda a fração do peso corporal vencida. Por isso ele escala de muito fácil a difícil sem precisar de material novo.",
      prescricaoPratica:
        "Escolha a altura que permita completar a faixa de repetições do objetivo com o corpo reto do começo ao fim. Progrida baixando o apoio antes de aumentar as repetições.",
    },
    trustLevel: "princípio biomecânico",
    temCena: false,
  },

  /* ---------------------------- AGACHAMENTO AQUÁTICO ---------------------------- */
  {
    id: "em2",
    slug: "agachamento-aquatico",
    nome: "Agachamento na água",
    grupoMuscular: "Membros inferiores",
    equipamento: "Piscina",
    objetivo: ["Emagrecimento", "Resistência muscular", "Retorno ao treino", "Aprendizado técnico"],
    nivel: "Iniciante",
    articulacaoPredominante: "Joelho e quadril",
    premium: false,
    resumoPratico:
      "Agachar dentro da piscina, com a água na altura do peito: o empuxo tira parte do peso na descida e a resistência da água cobra na subida. É o padrão de agachar para quem só tem a piscina como ambiente.",
    modalidade: "m-hidro",
    ativacao: [
      { musculo: "Quadríceps", percentual: 65, papel: "primário" },
      { musculo: "Glúteo máximo", percentual: 55, papel: "sinergista" },
      { musculo: "Transverso do abdome", percentual: 35, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 76, metrics: m("Quadríceps", 65, 20, 15, 20, 10, 25) },
    fases: [
      { nome: "Posição", descricao: "Em pé no fundo da piscina, água na altura do peito, pés na largura dos ombros, braços soltos ou apoiados na borda." },
      { nome: "Descida", descricao: "Agacha até onde o joelho permitir sem dor, controlando a descida contra o empuxo, tronco ereto." },
      { nome: "Subida", descricao: "Empurra o chão e sobe, vencendo a resistência da água, sem travar o joelho no fim." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 55,
        titulo: "A água muda os dois sentidos do movimento",
        camadas: {
          resumo: "O empuxo alivia a descida e a resistência cobra a subida. É o contrário do agachamento no solo.",
          biomecanica:
            "Dentro da água parte do peso corporal é sustentada pelo empuxo, o que reduz a carga articular do joelho e do quadril na fase de descida.",
          fisiologia: "A resistência da água cresce com a velocidade do movimento, então acelerar a subida aumenta o esforço sem acrescentar carga externa.",
          evidencia: "É o mesmo princípio que o ambiente aquático já usa nas modalidades aeróbias do catálogo.",
          cuidados: "Água na altura do peito. Muito rasa perde o alívio articular; muito funda tira o apoio dos pés no chão.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Aluno cujo único ambiente disponível é a piscina e que precisa do padrão de agachar.",
        "Quando o agachamento no solo incomoda o joelho e a redução de carga do ambiente aquático ajuda.",
        "Início de programa com excesso de peso corporal, onde o alívio articular importa.",
      ],
      quandoEvitar: [
        "Sem liberação para atividade aquática, ou com lesão de pele ou ferida aberta.",
        "Piscina sem profundidade adequada, em que a água não chega ao peito ou passa do ombro.",
        "Dor de joelho que aparece dentro da água do mesmo jeito que fora dela.",
      ],
      errosComuns: [
        "Deixar os pés flutuarem e perder o apoio no fundo, o que transforma o exercício em outro movimento.",
        "Descer rápido demais aproveitando o empuxo e não controlar a fase de descida.",
        "Escolher água muito rasa, o que anula a vantagem articular do ambiente.",
      ],
      variacoes: [
        "Braços empurrando a água à frente: aumenta a resistência e envolve o tronco.",
        "Apoio de uma das mãos na borda: regressão para quem tem pouco equilíbrio.",
        "Subida mais rápida: aumenta o esforço sem mudar a amplitude.",
      ],
    },
    conteudo: {
      visaoGeral:
        "É o agachamento executado dentro da piscina, com a água na altura do peito. O ambiente aquático alivia a carga sobre as articulações na descida e cobra esforço na subida, pela resistência da água.",
      biomecanica:
        "O quadríceps e o glúteo conduzem a extensão de joelho e quadril, como no agachamento de solo. A diferença está no empuxo, que sustenta parte do peso do corpo e reduz a compressão articular.",
      fisiologia:
        "A resistência do meio aquático depende da velocidade: quanto mais rápido o movimento, maior o esforço. Isso dá uma forma de progredir a dose sem carga externa nenhuma.",
      prescricaoPratica:
        "Mantenha a água na altura do peito e os pés firmes no fundo. Progrida acelerando a subida ou empurrando a água com os braços antes de aumentar as repetições.",
    },
    trustLevel: "princípio biomecânico",
    temCena: false,
  },
];
