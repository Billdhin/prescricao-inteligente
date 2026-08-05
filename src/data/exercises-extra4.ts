import type { Exercise, EficMetric } from "./types";

/**
 * Quarta expansão do catálogo (e53 em diante): LOTES B e C do plano de expansão.
 *
 * Estes 16 não vêm da matriz muscular, e sim dos GARGALOS DE PRESCRIÇÃO medidos em
 * `docs/catalogo-expansao.md`: elástico tinha 2 itens (é o equipamento de quem treina
 * em casa, que é justamente o aluno de retorno ao treino e o de pós-parto), bíceps
 * tinha 1, e deltoide posterior não existia. O efeito prático era um plano de 12
 * semanas repetir o mesmo exercício e o botão "Trocar" não ter o que oferecer.
 *
 * Regra de número mantida: percentual só existe onde há literatura que o sustente, e
 * ausência de EMG se resolve não listando o músculo, nunca escrevendo 0.
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

export const extraExercises4: Exercise[] = [
  /* ============== LOTE B: ELÁSTICO E PESO CORPORAL (treino em casa) ============== */
  {
    id: "e53",
    slug: "agachamento-elastico",
    nome: "Agachamento com elástico",
    grupoMuscular: "Membros inferiores",
    equipamento: "Elástico",
    objetivo: ["Emagrecimento", "Retorno ao treino", "Resistência muscular"],
    nivel: "Iniciante",
    articulacaoPredominante: "Joelho e quadril",
    premium: false,
    resumoPratico:
      "Agachamento com o elástico sob os pés e nas mãos: a resistência cresce conforme o aluno sobe, que é onde ele é mais forte.",
    anguloArticular: "Flexão de joelho conforme a tolerância, tronco levemente inclinado",
    imagem: "/exercises/agachamento-elastico.webp",
    imagemAnalise: "/exercises/agachamento-elastico-analysis.webp",
    modalidade: "m-funcional",
    ativacao: [
      { musculo: "Quadríceps", percentual: 68, papel: "primário" },
      { musculo: "Glúteo máximo", percentual: 55, papel: "sinergista" },
      { musculo: "Isquiotibiais", percentual: 40, papel: "sinergista" },
      { musculo: "Eretores da espinha", percentual: 30, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 76, metrics: m("Quadríceps", 68, 28, 25, 35, 8, 40) },
    fases: [
      { nome: "Posição", descricao: "Pés na largura dos ombros sobre o elástico, alças nas mãos junto aos ombros." },
      { nome: "Descida", descricao: "Desce empurrando o quadril para trás até onde o joelho tolerar, tronco firme." },
      { nome: "Subida", descricao: "Sobe empurrando o chão, vencendo a tração crescente do elástico." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 58,
        titulo: "A resistência cresce na hora certa",
        camadas: {
          resumo: "O elástico puxa mais no fim da subida, que é onde a alavanca ajuda o aluno.",
          biomecanica:
            "Com barra, a carga é constante e o ponto mais difícil é o fundo. Com elástico, a tensão é menor embaixo e maior em cima, o que casa com a curva de força do agachamento.",
          fisiologia:
            "O perfil de resistência crescente permite treinar perto da falha em cima sem sobrecarregar o fundo do movimento, que é o que costuma incomodar o joelho.",
          evidencia:
            "Escamilla e colaboradores descrevem como a técnica muda a distribuição do esforço entre joelho e quadril no agachamento, e a profundidade define o pico de carga articular.",
          cuidados: "Elástico sob a parte média do pé, nunca sob a ponta, para não escapar.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Membros inferiores em casa, sem nenhum peso livre.",
        "Retorno ao treino, quando a carga externa ainda é cedo.",
        "Circuitos de emagrecimento com grandes grupos musculares.",
      ],
      quandoEvitar: [
        "Dor no joelho que aparece mesmo em amplitude curta.",
        "Elástico gasto ou com sinal de rasgo, pelo risco de estalo no rosto.",
      ],
      errosComuns: [
        "Deixar o elástico sob a ponta do pé, de onde ele escapa.",
        "Descer com o tronco desabando à frente para compensar a tração.",
        "Usar elástico grosso e perder a amplitude útil.",
      ],
      variacoes: [
        "Com apoio de cadeira à frente: para quem ainda busca equilíbrio.",
        "Meio agachamento: amplitude reduzida no joelho sensível.",
        "Com pausa de 2 s embaixo: mais tempo sob tensão sem trocar de elástico.",
      ],
    },
    conteudo: {
      visaoGeral:
        "É o agachamento de quem treina em casa. Existe porque o catálogo tinha oito exercícios de peso corporal e só dois de elástico, e o aluno sem academia ficava com um plano que se repetia semana após semana.",
      biomecanica:
        "O padrão é o mesmo do agachamento livre: quadril para trás, joelho acompanhando a ponta do pé, tronco firme. O que muda é a fonte da resistência, que aqui cresce com o alongamento do elástico.",
      fisiologia:
        "A tensão crescente permite chegar perto do esforço máximo na parte alta com carga baixa no fundo, o que costuma ser mais tolerável para o joelho do que a carga constante.",
      prescricaoPratica:
        "Em geral, 3 séries de 12 a 20 repetições. Progrida a espessura do elástico ou passe a segurar as alças mais alto, que aumenta a tração sem trocar de material.",
    },
    trustLevel: "regra pedagógica",
    temCena: false,
  },

  {
    id: "e54",
    slug: "puxada-elastico",
    nome: "Puxada alta com elástico",
    grupoMuscular: "Costas",
    equipamento: "Elástico",
    objetivo: ["Hipertrofia", "Retorno ao treino", "Resistência muscular"],
    nivel: "Iniciante",
    articulacaoPredominante: "Ombro e cotovelo",
    premium: false,
    resumoPratico:
      "Puxada vertical presa numa porta ou barra alta: o único jeito de treinar o padrão de puxar de cima para baixo sem academia.",
    anguloArticular: "Ombro da elevação até a altura do peito",
    imagem: "/exercises/puxada-elastico.webp",
    imagemAnalise: "/exercises/puxada-elastico-analysis.webp",
    modalidade: "m-funcional",
    ativacao: [
      { musculo: "Latíssimo do dorso", percentual: 70, papel: "primário" },
      { musculo: "Bíceps braquial", percentual: 48, papel: "sinergista" },
      { musculo: "Trapézio médio", percentual: 42, papel: "sinergista" },
      { musculo: "Romboides", percentual: 40, papel: "sinergista" },
      { musculo: "Deltoide posterior", percentual: 32, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 78, metrics: m("Latíssimo do dorso", 70, 26, 12, 5, 30, 30) },
    fases: [
      { nome: "Posição", descricao: "Ajoelhado ou sentado sob a fixação alta, braços estendidos para cima segurando as alças." },
      { nome: "Puxada", descricao: "Traz as mãos até a altura do peito levando os cotovelos para baixo e para trás." },
      { nome: "Retorno", descricao: "Sobe controlando a tração, sem deixar o elástico puxar os ombros para cima." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 34,
        titulo: "O cotovelo desce antes da mão",
        camadas: {
          resumo: "Pensar em levar o cotovelo para o bolso ativa o dorsal, não o bíceps.",
          biomecanica:
            "O latíssimo faz a adução e a extensão do ombro. Quando a atenção vai para a mão, o movimento vira flexão de cotovelo e o bíceps assume o trabalho.",
          fisiologia:
            "O padrão de puxada vertical é o que mais falta em treino domiciliar, e sem ele o programa fica desequilibrado para o lado do empurrar.",
          evidencia:
            "Andersen e colaboradores compararam exercícios de puxada com resistência elástica e com aparelho, e encontraram atividade muscular comparável entre os dois.",
          cuidados: "Fixação alta precisa ser conferida antes de cada série.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Puxada vertical em casa, quando não há barra fixa nem polia.",
        "Retorno ao treino, antes de a barra ficar viável.",
        "Equilibrar um plano que já tem flexão de braço e desenvolvimento.",
      ],
      quandoEvitar: [
        "Fixação instável, que solta durante a série.",
        "Ombro sensível que dói com o braço acima da cabeça.",
      ],
      errosComuns: [
        "Puxar com a mão e dobrar só o cotovelo, transformando em rosca.",
        "Deixar os ombros subirem na direção da orelha no retorno.",
        "Inclinar o tronco para trás para ganhar amplitude.",
      ],
      variacoes: [
        "Ajoelhado: mais estável e mais fácil de manter o tronco parado.",
        "Um braço por vez: expõe e corrige assimetria.",
        "Pegada mais aberta: muda a ênfase entre dorsal e escápula.",
      ],
    },
    conteudo: {
      visaoGeral:
        "Fecha o buraco mais visível do treino domiciliar: sem puxada vertical, o aluno de casa acumula empurrar e nunca puxa de cima, o que desequilibra o ombro ao longo das semanas.",
      biomecanica:
        "O latíssimo leva o braço de cima para baixo e para junto do corpo, com romboides e trapézio médio organizando a escápula. O elástico entrega tensão crescente, então a parte final da puxada é a mais carregada.",
      fisiologia:
        "Trabalho de resistência e hipertrofia com carga acessível. Estudos de resistência elástica mostram ativação comparável à de aparelhos em padrões de puxada.",
      prescricaoPratica:
        "Em geral, 3 séries de 10 a 15 repetições com pausa de 1 s na retração. Progrida por espessura de elástico e por afastamento da fixação.",
    },
    trustLevel: "tendência prática",
    temCena: false,
  },

  {
    id: "e55",
    slug: "rosca-elastico",
    nome: "Rosca direta com elástico",
    grupoMuscular: "Braços",
    equipamento: "Elástico",
    objetivo: ["Hipertrofia", "Resistência muscular"],
    nivel: "Iniciante",
    articulacaoPredominante: "Cotovelo",
    premium: false,
    resumoPratico:
      "Rosca com os pés sobre o elástico: o segundo exercício de bíceps do catálogo, e o primeiro que cabe em casa.",
    anguloArticular: "Flexão de cotovelo até cerca de 130 graus",
imagem: "/exercises/rosca-elastico.webp",
    imagemAnalise: "/exercises/rosca-elastico-analysis.webp",
    modalidade: "m-funcional",
    ativacao: [
      { musculo: "Bíceps braquial", percentual: 68, papel: "primário" },
      { musculo: "Braquial", percentual: 52, papel: "sinergista" },
      { musculo: "Braquiorradial", percentual: 40, papel: "sinergista" },
    ],
    indiceEficiencia: { score: 70, metrics: m("Bíceps braquial", 68, 15, 10, 5, 12, 12) },
    fases: [
      { nome: "Posição", descricao: "Em pé sobre o elástico, braços estendidos ao lado do corpo, palmas para frente." },
      { nome: "Subida", descricao: "Dobra os cotovelos mantendo-os junto ao tronco, sem balançar o corpo." },
      { nome: "Descida", descricao: "Desce em 3 segundos até estender, sem soltar a tensão de uma vez." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 40,
        titulo: "Cotovelo parado",
        camadas: {
          resumo: "Se o cotovelo vai para frente, o ombro entrou no movimento.",
          biomecanica:
            "A rosca é flexão de cotovelo. Levar o cotovelo à frente acrescenta flexão de ombro e tira tensão do bíceps justamente no fim, onde ele deveria estar mais curto.",
          fisiologia:
            "O elástico dá pouca tensão embaixo e muita em cima, o que complementa bem o halter, que é o inverso.",
          evidencia:
            "Schoenfeld descreve que o estímulo de hipertrofia depende mais do esforço próximo da falha do que do tipo de resistência empregada.",
          cuidados: "Balançar o tronco a cada repetição indica elástico grosso demais.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Bíceps em casa, sem halteres.",
        "Segunda opção de bíceps num plano que só tinha rosca direta.",
        "Fim de sessão de tronco superior, com volume alto e carga baixa.",
      ],
      quandoEvitar: [
        "Elástico gasto ou com sinal de rasgo.",
        "Dor no cotovelo que piora ao longo da série.",
      ],
      errosComuns: [
        "Levar o cotovelo à frente e transformar em elevação de ombro.",
        "Balançar o tronco para vencer a tração.",
        "Soltar a descida em vez de controlar os 3 segundos.",
      ],
      variacoes: [
        "Um braço por vez: mais tensão com o mesmo elástico.",
        "Pegada neutra: desloca a ênfase para o braquiorradial.",
        "Com pausa de 2 s no alto: mais tempo sob tensão.",
      ],
    },
    conteudo: {
      visaoGeral:
        "O catálogo tinha um único exercício de bíceps, e sem alternativa qualquer plano com bíceps repetia rosca direta por 12 semanas. Este resolve isso e ainda funciona sem equipamento de academia.",
      biomecanica:
        "O bíceps flexiona o cotovelo e supina o antebraço. Com o cotovelo preso ao tronco, o movimento fica restrito à articulação certa, e o braquial e o braquiorradial acompanham.",
      fisiologia:
        "A tensão crescente do elástico deixa a parte encurtada do movimento como a mais carregada, o que é o oposto do halter. Alternar os dois ao longo do macrociclo cobre a curva inteira.",
      prescricaoPratica:
        "Em geral, 3 séries de 12 a 20 repetições com descida de 3 s. Progrida para um braço por vez antes de trocar por elástico mais grosso.",
    },
    trustLevel: "regra pedagógica",
    temCena: false,
  },

  {
    id: "e56",
    slug: "abducao-quadril-elastico",
    nome: "Abdução de quadril em pé com elástico",
    grupoMuscular: "Membros inferiores",
    equipamento: "Elástico",
    objetivo: ["Retorno ao treino", "Resistência muscular"],
    nivel: "Iniciante",
    articulacaoPredominante: "Quadril",
    premium: false,
    resumoPratico:
      "Levar a perna para o lado contra o elástico, em pé: glúteo médio dos dois lados ao mesmo tempo, o que trabalha e o que sustenta.",
    anguloArticular: "Abdução de quadril até cerca de 30 graus",
    imagem: "/exercises/abducao-quadril-elastico.webp",
    imagemAnalise: "/exercises/abducao-quadril-elastico-analysis.webp",
    modalidade: "m-funcional",
    ativacao: [
      { musculo: "Glúteo médio", percentual: 45, papel: "primário" },
      { musculo: "Glúteo máximo", percentual: 30, papel: "sinergista" },
      { musculo: "Oblíquos", percentual: 22, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 71, metrics: m("Glúteo médio", 45, 20, 12, 10, 5, 20) },
    fases: [
      { nome: "Posição", descricao: "Em pé, elástico no tornozelo, mão apoiada numa parede ou cadeira." },
      { nome: "Abdução", descricao: "Leva a perna para o lado sem inclinar o tronco nem girar o pé para fora." },
      { nome: "Retorno", descricao: "Volta devagar, sem deixar o elástico puxar a perna de volta." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 62,
        titulo: "Os dois lados trabalham",
        camadas: {
          resumo: "A perna que fica no chão trabalha tanto quanto a que se move.",
          biomecanica:
            "O glúteo médio do lado de apoio impede a bacia de cair enquanto o outro lado se afasta. É o mesmo trabalho da caminhada lateral, com uma perna por vez.",
          fisiologia:
            "Em pé, o exercício reproduz a exigência da marcha, que é sustentar o corpo sobre uma perna.",
          evidencia:
            "Distefano e colaboradores mediram 81% da contração máxima do glúteo médio na abdução deitado de lado, a maior entre 12 exercícios; a versão em pé troca parte dessa intensidade pela vantagem de não precisar ir ao chão.",
          cuidados: "Inclinar o tronco para o lado oposto anula o exercício.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Glúteo médio em quem não desce ao chão com facilidade.",
        "Aquecimento antes de agachamento, afundo e caminhada.",
        "Complemento de dor de joelho e de quadril.",
      ],
      quandoEvitar: [
        "Aluno sem equilíbrio para ficar sobre uma perna, mesmo com apoio.",
        "Dor no quadril que aparece ao apoiar em uma perna só.",
      ],
      errosComuns: [
        "Inclinar o tronco para o lado oposto para levantar mais a perna.",
        "Girar o pé para fora e transformar em rotação de quadril.",
        "Levar a perna para trás em vez de para o lado.",
      ],
      variacoes: [
        "Com elástico acima do joelho: braço de alavanca menor, mais fácil.",
        "Sem apoio de mão: acrescenta exigência de equilíbrio.",
        "Com pausa de 2 s aberto: mais tempo sob tensão.",
      ],
    },
    conteudo: {
      visaoGeral:
        "Terceira porta de entrada para o glúteo médio, ao lado da concha e da caminhada lateral, e a única que trabalha um lado por vez em pé, o que expõe assimetria.",
      biomecanica:
        "A abdução de quadril afasta a perna da linha média. Em pé, o lado de apoio precisa sustentar a bacia nivelada, o que dobra o valor do exercício.",
      fisiologia:
        "Trabalho de resistência com carga leve. O ganho aparece como controle de bacia em movimentos maiores antes de aparecer como força medida.",
      prescricaoPratica:
        "Em geral, 2 a 3 séries de 12 a 20 repetições por lado. Suba o elástico do joelho para o tornozelo antes de trocar por um mais grosso.",
    },
    trustLevel: "princípio biomecânico",
    temCena: false,
  },

  {
    id: "e57",
    slug: "extensao-quadril-elastico",
    nome: "Extensão de quadril em pé com elástico",
    grupoMuscular: "Membros inferiores",
    equipamento: "Elástico",
    objetivo: ["Retorno ao treino", "Resistência muscular", "Hipertrofia"],
    nivel: "Iniciante",
    articulacaoPredominante: "Quadril",
    premium: false,
    resumoPratico:
      "Levar a perna para trás contra o elástico: glúteo máximo sem precisar deitar no chão nem carregar peso na coluna.",
    anguloArticular: "Extensão de quadril até cerca de 15 graus além da linha do corpo",
    imagem: "/exercises/extensao-quadril-elastico.webp",
    imagemAnalise: "/exercises/extensao-quadril-elastico-analysis.webp",
    modalidade: "m-funcional",
    ativacao: [
      { musculo: "Glúteo máximo", percentual: 55, papel: "primário" },
      { musculo: "Isquiotibiais", percentual: 42, papel: "sinergista" },
      { musculo: "Eretores da espinha", percentual: 28, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 73, metrics: m("Glúteo máximo", 55, 20, 22, 8, 5, 22) },
    fases: [
      { nome: "Posição", descricao: "Em pé de frente para a fixação, elástico no tornozelo, mão apoiada numa parede." },
      { nome: "Extensão", descricao: "Leva a perna para trás pelo quadril, sem arquear a lombar." },
      { nome: "Retorno", descricao: "Volta devagar até a linha do corpo, mantendo o tronco parado." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 58,
        titulo: "A lombar não é o quadril",
        camadas: {
          resumo: "Se a lombar arqueia, o movimento saiu do quadril e virou extensão de coluna.",
          biomecanica:
            "A extensão útil de quadril é pequena, cerca de 10 a 20 graus além da linha do corpo. Além disso, quem se move é a coluna, e o glúteo para de trabalhar.",
          fisiologia:
            "O glúteo máximo é o principal extensor de quadril e responde bem a estímulos com o quadril já estendido, que é a posição em que o elástico traciona mais.",
          evidencia:
            "Contreras e colaboradores compararam exercícios de extensão de quadril e mostraram que a posição do quadril define onde o glúteo é mais exigido.",
          cuidados: "Uma mão na lombar durante as primeiras séries denuncia o arqueamento na hora.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Glúteo em quem tem dificuldade de deitar e levantar do chão.",
        "Retorno ao treino, antes de hip thrust e de levantamento terra.",
        "Treino em casa que precisa de cadeia posterior.",
      ],
      quandoEvitar: [
        "Dor lombar que aparece ao levar a perna para trás.",
        "Aluno sem equilíbrio mesmo com apoio de mão.",
      ],
      errosComuns: [
        "Arquear a lombar para levar a perna mais para trás.",
        "Girar a bacia para o lado durante a extensão.",
        "Dobrar o joelho e transformar em trabalho de isquiotibiais.",
      ],
      variacoes: [
        "Com joelho estendido: mais glúteo, menos isquiotibiais.",
        "Em quatro apoios: quando o chão é possível e o equilíbrio não.",
        "Com pausa de 2 s atrás: mais tempo sob tensão.",
      ],
    },
    conteudo: {
      visaoGeral:
        "Resolve um caso frequente: o aluno precisa de glúteo, mas hip thrust e ponte exigem deitar e levantar do chão, e é exatamente isso que a obesidade grau II e o idoso frágil não toleram bem.",
      biomecanica:
        "O elástico resiste à extensão do quadril e traciona mais no fim do movimento, que é onde o glúteo está mais curto. O tronco precisa ficar imóvel para que a extensão venha do quadril.",
      fisiologia:
        "Trabalho de resistência com progressão contínua. É degrau, não destino: quando o aluno tolerar o chão, hip thrust e ponte rendem mais.",
      prescricaoPratica:
        "Em geral, 3 séries de 12 a 20 repetições por lado com pausa de 1 s atrás. Migre para hip thrust assim que deitar e levantar deixar de ser problema.",
    },
    trustLevel: "princípio biomecânico",
    temCena: false,
  },

  {
    id: "e58",
    slug: "remada-unilateral-elastico",
    nome: "Remada unilateral com elástico",
    grupoMuscular: "Costas",
    equipamento: "Elástico",
    objetivo: ["Hipertrofia", "Resistência muscular", "Retorno ao treino"],
    nivel: "Iniciante",
    articulacaoPredominante: "Ombro e cotovelo",
    premium: false,
    resumoPratico:
      "Puxada horizontal com um braço por vez: expõe a assimetria que a remada com os dois braços esconde, e cabe em casa.",
    anguloArticular: "Extensão de ombro até a linha do tronco",
imagem: "/exercises/remada-unilateral-elastico.webp",
    imagemAnalise: "/exercises/remada-unilateral-elastico-analysis.webp",
    modalidade: "m-funcional",
    ativacao: [
      { musculo: "Latíssimo do dorso", percentual: 62, papel: "primário" },
      { musculo: "Romboides", percentual: 48, papel: "sinergista" },
      { musculo: "Trapézio médio", percentual: 45, papel: "sinergista" },
      { musculo: "Bíceps braquial", percentual: 40, papel: "sinergista" },
      { musculo: "Oblíquos", percentual: 25, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 76, metrics: m("Latíssimo do dorso", 62, 24, 18, 5, 22, 22) },
    fases: [
      { nome: "Posição", descricao: "Em pé, elástico preso à frente na altura do peito, um braço estendido segurando a alça." },
      { nome: "Puxada", descricao: "Traz o cotovelo para trás junto ao tronco, sem girar os ombros." },
      { nome: "Retorno", descricao: "Estende o braço devagar, mantendo o tronco parado." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 40,
        titulo: "O tronco não gira",
        camadas: {
          resumo: "Girar o tronco a cada puxada troca costas por rotação de coluna.",
          biomecanica:
            "Puxar com um braço cria um momento de rotação sobre o tronco. Resistir a esse giro é parte do exercício, e por isso ele também treina o core sem custo extra.",
          fisiologia:
            "A versão unilateral costuma revelar diferença entre os lados que a remada com os dois braços compensa em silêncio.",
          evidencia:
            "Andersen e colaboradores encontraram ativação comparável entre resistência elástica e aparelho em exercícios de puxada.",
          cuidados: "Se o ombro roda para frente no fim, a tração está alta.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Quando se suspeita de assimetria entre os lados.",
        "Costas em casa, com o elástico preso numa maçaneta.",
        "Complemento antirrotação sem acrescentar um exercício de core.",
      ],
      quandoEvitar: [
        "Fixação instável, que solta durante a série.",
        "Dor no ombro que aparece na fase de retorno.",
      ],
      errosComuns: [
        "Girar o tronco a cada repetição para ganhar amplitude.",
        "Encolher o ombro na direção da orelha na puxada.",
        "Soltar o retorno em vez de controlar.",
      ],
      variacoes: [
        "Com o tronco inclinado à frente: muda o ângulo de puxada.",
        "Pegada neutra: mais confortável para o ombro sensível.",
        "Com pausa de 1 s atrás: reforça a retração escapular.",
      ],
    },
    conteudo: {
      visaoGeral:
        "Segunda opção de puxada horizontal em casa, e a primeira unilateral do catálogo nesse padrão. Serve tanto como trabalho de costas quanto como avaliação prática de assimetria.",
      biomecanica:
        "O latíssimo estende o ombro e os romboides com o trapézio médio retraem a escápula. Como a carga vem de um lado só, os oblíquos entram para impedir o tronco de girar.",
      fisiologia:
        "Trabalho de resistência e hipertrofia com carga acessível, com o bônus do componente antirrotação.",
      prescricaoPratica:
        "Em geral, 3 séries de 10 a 15 repetições por lado. Comece pelo lado mais fraco e iguale o número de repetições pelo que ele aguentar.",
    },
    trustLevel: "tendência prática",
    temCena: false,
  },

  {
    id: "e59",
    slug: "panturrilha-sentado",
    nome: "Elevação de panturrilha sentado",
    grupoMuscular: "Membros inferiores",
    equipamento: "Máquina",
    objetivo: ["Hipertrofia", "Resistência muscular"],
    nivel: "Iniciante",
    articulacaoPredominante: "Tornozelo",
    premium: false,
    resumoPratico:
      "Com o joelho dobrado, o sóleo assume o trabalho: é o exercício que o catálogo não tinha, porque a versão em pé enfatiza o gastrocnêmio.",
    anguloArticular: "Joelho a 90 graus, tornozelo em amplitude total",
imagem: "/exercises/panturrilha-sentado.webp",
    imagemAnalise: "/exercises/panturrilha-sentado-analysis.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Sóleo", percentual: 70, papel: "primário" },
      { musculo: "Gastrocnêmio", percentual: 35, papel: "sinergista" },
      { musculo: "Fibulares (estabilizadores do tornozelo)", percentual: 25, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 72, metrics: m("Sóleo", 70, 12, 8, 12, 5, 20) },
    fases: [
      { nome: "Posição", descricao: "Sentado com o apoio sobre as coxas e a ponta dos pés na plataforma." },
      { nome: "Subida", descricao: "Empurra a ponta do pé até o calcanhar subir ao máximo, com pausa no topo." },
      { nome: "Descida", descricao: "Desce até sentir o alongamento, sem deixar cair de uma vez." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 78,
        titulo: "Joelho dobrado muda o músculo",
        camadas: {
          resumo: "Com o joelho a 90 graus, o gastrocnêmio encurta e sai de cena.",
          biomecanica:
            "O gastrocnêmio cruza o joelho e o tornozelo. Dobrar o joelho o deixa curto demais para produzir força, e o sóleo, que cruza só o tornozelo, assume.",
          fisiologia:
            "O sóleo tem predominância de fibras lentas e responde bem a séries longas com pausa, o que é diferente da versão em pé.",
          evidencia:
            "A separação entre gastrocnêmio e sóleo por posição do joelho é anatômica e descrita na literatura de biomecânica do tornozelo.",
          cuidados: "Amplitude curta é o erro mais comum, e é o que anula o exercício.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Quando o plano precisa de panturrilha com ênfase no sóleo.",
        "Complemento da versão em pé, que enfatiza o gastrocnêmio.",
        "Aluno com dor no tendão de calcâneo, sob orientação, pela carga controlada.",
      ],
      quandoEvitar: [
        "Dor aguda no tendão de calcâneo sem avaliação.",
        "Amplitude que provoca cãibra repetida.",
      ],
      errosComuns: [
        "Fazer com amplitude curta, sem subir nem descer completo.",
        "Apoiar o peso muito à frente e escorregar a ponta do pé.",
        "Fazer rápido, sem pausa no topo nem controle na descida.",
      ],
      variacoes: [
        "Com pausa de 2 s no topo: mais tempo sob tensão.",
        "Um pé por vez: expõe assimetria.",
        "Descida lenta de 4 s: ênfase na fase excêntrica.",
      ],
    },
    conteudo: {
      visaoGeral:
        "A matriz de cobertura mostrou que o catálogo usava o rótulo genérico Panturrilha em quatro exercícios e nunca distinguia gastrocnêmio de sóleo. Este item existe para separar os dois, porque a posição do joelho decide qual deles trabalha.",
      biomecanica:
        "Sentado, o joelho fica a 90 graus. O gastrocnêmio, que é biarticular, perde comprimento útil, e o sóleo passa a ser o principal flexor plantar.",
      fisiologia:
        "O sóleo é predominantemente de fibras lentas e sustenta a postura em pé o dia inteiro, o que justifica séries longas e pausas.",
      prescricaoPratica:
        "Em geral, 3 a 4 séries de 12 a 20 repetições com pausa de 1 a 2 s no topo e amplitude completa. Amplitude vale mais que carga aqui.",
    },
    trustLevel: "princípio biomecânico",
    temCena: false,
  },

  {
    id: "e60",
    slug: "subida-step",
    nome: "Subida no step",
    grupoMuscular: "Membros inferiores",
    equipamento: "Peso corporal",
    objetivo: ["Emagrecimento", "Retorno ao treino", "Resistência muscular"],
    nivel: "Iniciante",
    articulacaoPredominante: "Joelho e quadril",
    premium: false,
    resumoPratico:
      "Subir e descer de um degrau, uma perna por vez: unilateral com carga baixa e altura regulável, que é o jeito mais simples de dosar.",
    anguloArticular: "Flexão de joelho conforme a altura do degrau",
    imagem: "/exercises/subida-step.webp",
    imagemAnalise: "/exercises/subida-step-analysis.webp",
    modalidade: "m-funcional",
    ativacao: [
      { musculo: "Quadríceps", percentual: 65, papel: "primário" },
      { musculo: "Glúteo máximo", percentual: 55, papel: "sinergista" },
      { musculo: "Glúteo médio", percentual: 42, papel: "sinergista" },
      { musculo: "Isquiotibiais", percentual: 35, papel: "sinergista" },
    ],
    indiceEficiencia: { score: 77, metrics: m("Quadríceps", 65, 25, 18, 40, 5, 32) },
    fases: [
      { nome: "Posição", descricao: "De frente para o degrau, um pé inteiro apoiado em cima." },
      { nome: "Subida", descricao: "Empurra o degrau com a perna de cima até estender o quadril, sem impulso da perna de baixo." },
      { nome: "Descida", descricao: "Desce controlado com a mesma perna, tocando o chão de leve." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 60,
        titulo: "A perna de baixo não empurra",
        camadas: {
          resumo: "Se o pé de baixo dá impulso, o exercício vira meio pulo.",
          biomecanica:
            "O trabalho é da perna de cima, que estende joelho e quadril para levantar o corpo. O impulso da perna de baixo transfere parte do esforço e mascara a assimetria.",
          fisiologia:
            "A altura do degrau é a variável de dose: quanto mais alto, maior a flexão de joelho e a exigência.",
          evidencia:
            "Ekstrom e colaboradores mediram o step-up entre 9 exercícios de reabilitação e o descrevem como estímulo relevante para quadril e coxa.",
          cuidados: "Joelho passando muito à frente da ponta do pé pede degrau mais baixo.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Unilateral de membros inferiores com carga baixa e altura ajustável.",
        "Retorno ao treino, antes do afundo e do agachamento búlgaro.",
        "Circuitos de emagrecimento em casa ou na rua.",
      ],
      quandoEvitar: [
        "Degrau instável ou escorregadio.",
        "Dor no joelho que aparece já no degrau mais baixo.",
      ],
      errosComuns: [
        "Dar impulso com a perna de baixo em vez de empurrar com a de cima.",
        "Apoiar só a ponta do pé no degrau.",
        "Descer de qualquer jeito, sem controlar a chegada ao chão.",
      ],
      variacoes: [
        "Degrau mais baixo: regressão imediata.",
        "Degrau mais alto: progressão sem carga externa.",
        "Com halteres nas mãos: acrescenta carga quando a altura já é suficiente.",
      ],
    },
    conteudo: {
      visaoGeral:
        "É o exercício unilateral mais fácil de dosar do catálogo, porque a carga é a altura do degrau e ela é contínua. Serve de degrau entre o agachamento com apoio e o afundo.",
      biomecanica:
        "A perna de cima produz extensão de joelho e de quadril, enquanto o glúteo médio do mesmo lado impede a bacia de cair. É trabalho de força e de controle na mesma repetição.",
      fisiologia:
        "Com séries longas e ritmo contínuo, vira estímulo aeróbio. Com degrau alto e poucas repetições, vira estímulo de força unilateral.",
      prescricaoPratica:
        "Em geral, 3 séries de 10 a 15 repetições por perna. Comece com degrau na altura do meio da canela e suba só quando a subida sair sem impulso da perna de baixo.",
    },
    trustLevel: "regra pedagógica",
    temCena: false,
  },

  /* ================= LOTE C: BRAÇOS E OMBROS ================= */
  {
    id: "e61",
    slug: "rosca-martelo",
    nome: "Rosca martelo com halteres",
    grupoMuscular: "Braços",
    equipamento: "Halter",
    objetivo: ["Hipertrofia", "Resistência muscular"],
    nivel: "Iniciante",
    articulacaoPredominante: "Cotovelo",
    premium: false,
    resumoPratico:
      "Rosca com a palma virada para dentro: tira parte do bíceps e coloca o braquiorradial e o braquial no comando.",
    anguloArticular: "Flexão de cotovelo com antebraço em posição neutra",
    imagem: "/exercises/rosca-martelo.webp",
    imagemAnalise: "/exercises/rosca-martelo-analysis.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Braquiorradial", percentual: 62, papel: "primário" },
      { musculo: "Braquial", percentual: 58, papel: "sinergista" },
      { musculo: "Bíceps braquial", percentual: 45, papel: "sinergista" },
    ],
    indiceEficiencia: { score: 72, metrics: m("Braquiorradial", 62, 14, 10, 5, 12, 10) },
    fases: [
      { nome: "Posição", descricao: "Em pé, halteres ao lado do corpo com as palmas viradas para dentro." },
      { nome: "Subida", descricao: "Dobra o cotovelo mantendo a palma neutra o tempo todo." },
      { nome: "Descida", descricao: "Desce em 3 segundos até estender, sem balançar o tronco." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 40,
        titulo: "A palma decide o músculo",
        camadas: {
          resumo: "Palma neutra tira o bíceps de vantagem e chama o braquiorradial.",
          biomecanica:
            "O bíceps é mais eficiente com o antebraço supinado, porque também é supinador. Na posição neutra ele perde vantagem mecânica e o braquiorradial, que só flexiona, assume mais.",
          fisiologia:
            "O braquial fica sob o bíceps e não aparece no espelho, mas empurra o bíceps para cima quando cresce, o que muda o contorno do braço.",
          evidencia:
            "Boeckh-Behrens e Buskies compararam variações de rosca por eletromiografia e mostram como a posição do antebraço redistribui o esforço.",
          cuidados: "Girar a palma no meio da subida devolve o trabalho ao bíceps.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Quando o plano já tem rosca supinada e precisa de variedade real.",
        "Cotovelo que incomoda na rosca com a palma para cima.",
        "Trabalho de antebraço junto com o de braço.",
      ],
      quandoEvitar: [
        "Dor no punho que aparece na pegada neutra.",
        "Halter pesado que só sobe com balanço de tronco.",
      ],
      errosComuns: [
        "Girar a palma para cima durante a subida.",
        "Levar o cotovelo à frente e transformar em elevação de ombro.",
        "Balançar o tronco a cada repetição.",
      ],
      variacoes: [
        "Cruzando à frente do corpo: muda a linha de tração.",
        "Alternado: permite carga um pouco maior por braço.",
        "Sentado com apoio de tronco: elimina o balanço.",
      ],
    },
    conteudo: {
      visaoGeral:
        "Entra por dois motivos: o catálogo tinha só uma opção de bíceps e o braquiorradial estava em zero na matriz de cobertura.",
      biomecanica:
        "Com o antebraço neutro, o bíceps perde parte da vantagem mecânica e o braquiorradial e o braquial assumem a flexão. O cotovelo precisa ficar junto ao tronco para o movimento não virar elevação de ombro.",
      fisiologia:
        "Como o braquial e o braquiorradial cansam em ritmo diferente do bíceps, alternar rosca supinada e martelo ao longo do macrociclo distribui melhor o estímulo do braço.",
      prescricaoPratica:
        "Em geral, 3 séries de 10 a 15 repetições com descida de 3 s. Carga um pouco maior que a rosca supinada costuma ser possível, mas nunca à custa do cotovelo parado.",
    },
    trustLevel: "princípio biomecânico",
    temCena: false,
  },

  {
    id: "e62",
    slug: "rosca-banco-inclinado",
    nome: "Rosca no banco inclinado",
    grupoMuscular: "Braços",
    equipamento: "Halter",
    objetivo: ["Hipertrofia"],
    nivel: "Intermediário",
    articulacaoPredominante: "Cotovelo",
    premium: false,
    resumoPratico:
      "Deitado num banco inclinado, o braço fica atrás da linha do tronco: o bíceps começa a repetição já alongado.",
    anguloArticular: "Banco a cerca de 45 graus, ombro em leve extensão",
    imagem: "/exercises/rosca-banco-inclinado.webp",
    imagemAnalise: "/exercises/rosca-banco-inclinado-analysis.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Bíceps braquial", percentual: 72, papel: "primário" },
      { musculo: "Braquial", percentual: 50, papel: "sinergista" },
      { musculo: "Braquiorradial", percentual: 35, papel: "sinergista" },
    ],
    indiceEficiencia: { score: 74, metrics: m("Bíceps braquial", 72, 22, 10, 5, 28, 25) },
    fases: [
      { nome: "Posição", descricao: "Deitado no banco a cerca de 45 graus, braços pendurados ao lado do corpo." },
      { nome: "Subida", descricao: "Dobra os cotovelos sem trazer o ombro à frente." },
      { nome: "Descida", descricao: "Desce até estender completamente, sentindo o alongamento." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 42,
        titulo: "O bíceps cruza o ombro",
        camadas: {
          resumo: "Com o braço atrás do tronco, o bíceps começa mais alongado.",
          biomecanica:
            "A cabeça longa do bíceps cruza a articulação do ombro. Levar o braço para trás a alonga antes mesmo de a repetição começar, o que aumenta a amplitude útil.",
          fisiologia:
            "Trabalhar um músculo em maior comprimento tende a favorecer o estímulo de hipertrofia, especialmente na porção alongada.",
          evidencia:
            "Schoenfeld descreve o papel do comprimento muscular e da amplitude na resposta de hipertrofia ao treino de força.",
          cuidados: "Ombro sensível pode não tolerar a posição; nesse caso, a rosca em pé serve.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Quando o objetivo é bíceps em maior comprimento.",
        "Variação de estímulo dentro de um mesociclo de hipertrofia.",
        "Aluno que já domina a rosca em pé sem balanço.",
      ],
      quandoEvitar: [
        "Ombro sensível que dói com o braço atrás do tronco.",
        "Aluno iniciante que ainda não controla a rosca em pé.",
      ],
      errosComuns: [
        "Trazer o ombro à frente para facilitar a subida.",
        "Não estender completamente na descida, perdendo o motivo do exercício.",
        "Usar carga da rosca em pé, que aqui costuma ser demais.",
      ],
      variacoes: [
        "Banco mais deitado: alonga ainda mais, mais difícil.",
        "Banco mais em pé: regressão, mais parecido com a rosca comum.",
        "Um braço por vez: melhor controle da posição do ombro.",
      ],
    },
    conteudo: {
      visaoGeral:
        "Terceira opção de bíceps do catálogo e a única que ataca a porção alongada, o que dá ao plano de hipertrofia uma variação de estímulo de verdade, e não só de nome.",
      biomecanica:
        "Com o ombro em leve extensão, a cabeça longa do bíceps parte de um comprimento maior. A amplitude cresce e o pico de tensão se desloca para o começo da subida.",
      fisiologia:
        "Treinar na porção alongada tem respaldo crescente na literatura de hipertrofia, e é um estímulo que a rosca em pé e a rosca scott não oferecem.",
      prescricaoPratica:
        "Em geral, 3 séries de 8 a 12 repetições com carga menor que a da rosca em pé. Estender completamente na descida é o exercício; encurtar anula o motivo dele existir.",
    },
    trustLevel: "tendência prática",
    temCena: false,
  },

  {
    id: "e63",
    slug: "rosca-scott-maquina",
    nome: "Rosca scott na máquina",
    grupoMuscular: "Braços",
    equipamento: "Máquina",
    objetivo: ["Hipertrofia", "Aprendizado técnico"],
    nivel: "Iniciante",
    articulacaoPredominante: "Cotovelo",
    premium: false,
    resumoPratico:
      "Com o braço apoiado no banco inclinado, não há como balançar: é a versão de bíceps mais fácil de ensinar.",
    anguloArticular: "Flexão de cotovelo com braço apoiado a cerca de 45 graus",
    imagem: "/exercises/rosca-scott-maquina.webp",
    imagemAnalise: "/exercises/rosca-scott-maquina-analysis.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Bíceps braquial", percentual: 66, papel: "primário" },
      { musculo: "Braquial", percentual: 55, papel: "sinergista" },
      { musculo: "Braquiorradial", percentual: 30, papel: "sinergista" },
    ],
    indiceEficiencia: { score: 71, metrics: m("Bíceps braquial", 66, 12, 8, 5, 15, 15) },
    fases: [
      { nome: "Posição", descricao: "Sentado com a parte de trás do braço apoiada no banco e os punhos alinhados." },
      { nome: "Subida", descricao: "Dobra os cotovelos até a metade da amplitude, sem descolar o braço do apoio." },
      { nome: "Descida", descricao: "Desce em 3 segundos até quase estender, sem soltar a carga no fim." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 44,
        titulo: "O apoio é o professor",
        camadas: {
          resumo: "Com o braço apoiado, não existe balanço para compensar.",
          biomecanica:
            "O apoio fixa o úmero, então a única articulação livre é o cotovelo. Isso torna o exercício ideal para ensinar o padrão, mesmo que renda menos carga.",
          fisiologia:
            "A posição carrega mais o começo da subida, que é onde o bíceps está alongado.",
          evidencia:
            "Boeckh-Behrens e Buskies compararam variações de rosca por eletromiografia e descrevem a diferença de perfil entre as versões com e sem apoio.",
          cuidados: "Estender totalmente no fim com carga alta incomoda o cotovelo em alguns alunos.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Ensino do padrão de rosca em aluno iniciante.",
        "Quando o aluno balança o tronco em toda rosca em pé.",
        "Fim de sessão de braço, com carga menor e controle maior.",
      ],
      quandoEvitar: [
        "Dor no cotovelo ao estender com carga.",
        "Banco que não permite ajustar a altura ao braço do aluno.",
      ],
      errosComuns: [
        "Descolar o braço do apoio para subir mais.",
        "Estender de uma vez no fim da descida, com solavanco no cotovelo.",
        "Sentar torto e apoiar um braço mais que o outro.",
      ],
      variacoes: [
        "Um braço por vez: expõe assimetria.",
        "Com pausa de 2 s no alto: mais tempo sob tensão.",
        "Descida lenta de 4 s: ênfase excêntrica.",
      ],
    },
    conteudo: {
      visaoGeral:
        "Quarta opção de bíceps, escolhida para o iniciante: o apoio elimina o balanço, que é o erro mais comum e o mais difícil de corrigir só com aviso verbal.",
      biomecanica:
        "Com o úmero fixo no apoio inclinado, a resistência é maior na parte inicial da subida. O bíceps trabalha numa faixa mais curta de amplitude, com menos chance de compensação.",
      fisiologia:
        "Rende menos carga que a rosca em pé, e é justamente esse o ponto: a qualidade do padrão vale mais no aprendizado do que o número no aparelho.",
      prescricaoPratica:
        "Em geral, 3 séries de 10 a 15 repetições com descida de 3 s. Evite estender de forma brusca no fim, o que costuma incomodar o cotovelo.",
    },
    trustLevel: "regra pedagógica",
    temCena: false,
  },

  {
    id: "e64",
    slug: "triceps-testa-barra",
    nome: "Tríceps testa com barra",
    grupoMuscular: "Braços",
    equipamento: "Barra",
    objetivo: ["Hipertrofia", "Força"],
    nivel: "Intermediário",
    articulacaoPredominante: "Cotovelo",
    premium: false,
    resumoPratico:
      "Deitado, a barra desce até a testa com o cotovelo apontando para cima: alcança a cabeça longa do tríceps, que a polia não alcança.",
    anguloArticular: "Ombro em leve flexão, cotovelo em amplitude completa",
    imagem: "/exercises/triceps-testa-barra.webp",
    imagemAnalise: "/exercises/triceps-testa-barra-analysis.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Tríceps braquial", percentual: 78, papel: "primário" },
      { musculo: "Ancôneo", percentual: 40, papel: "sinergista" },
      { musculo: "Deltoide anterior", percentual: 22, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 78, metrics: m("Tríceps braquial", 78, 32, 12, 5, 35, 28) },
    fases: [
      { nome: "Posição", descricao: "Deitado no banco, barra acima do peito com os braços estendidos e cotovelos levemente à frente." },
      { nome: "Descida", descricao: "Dobra os cotovelos levando a barra até perto da testa, mantendo os cotovelos apontados para cima." },
      { nome: "Extensão", descricao: "Estende os cotovelos sem deixá-los abrir para os lados." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 38,
        titulo: "A cabeça longa cruza o ombro",
        camadas: {
          resumo: "Só com o braço à frente ou acima da cabeça a cabeça longa do tríceps alonga.",
          biomecanica:
            "Das três cabeças do tríceps, só a longa cruza a articulação do ombro. Na polia com o braço junto ao corpo, ela fica curta; aqui, com o braço à frente, ela é alongada e recebe mais estímulo.",
          fisiologia:
            "É a cabeça de maior massa do tríceps, e treiná-la em maior comprimento tende a render mais em hipertrofia do braço.",
          evidencia:
            "Schoenfeld descreve a influência do comprimento muscular e da amplitude na resposta ao treino de força.",
          cuidados: "Cotovelo aberto para os lados tira o tríceps e sobrecarrega a articulação.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Quando o plano já tem tríceps na polia e precisa alcançar a cabeça longa.",
        "Mesociclo de hipertrofia de braço.",
        "Aluno intermediário que já controla o movimento com halteres.",
      ],
      quandoEvitar: [
        "Dor no cotovelo que aparece com o braço acima da cabeça.",
        "Aluno sem quem observe, pela posição da barra sobre o rosto.",
      ],
      errosComuns: [
        "Abrir os cotovelos para os lados durante a descida.",
        "Mover os ombros para transformar em supino fechado.",
        "Descer rápido demais com a barra perto do rosto.",
      ],
      variacoes: [
        "Com halteres: pegada neutra, mais confortável para o cotovelo.",
        "Barra W: reduz o estresse no punho.",
        "Descendo atrás da cabeça: alonga mais a cabeça longa.",
      ],
    },
    conteudo: {
      visaoGeral:
        "O catálogo tinha três exercícios de tríceps, e todos com o braço junto ao corpo. Nenhum alongava a cabeça longa, que é a de maior massa. Este entra exatamente por isso.",
      biomecanica:
        "Com o braço à frente e o cotovelo apontando para cima, a cabeça longa parte alongada. Manter os cotovelos apontados na mesma direção durante toda a série é o que separa o exercício de um supino fechado.",
      fisiologia:
        "Treinar a cabeça longa em maior comprimento amplia o estímulo total do tríceps ao longo do macrociclo, o que a extensão na polia sozinha não faz.",
      prescricaoPratica:
        "Em geral, 3 séries de 8 a 12 repetições com descida controlada. A barra W costuma ser mais gentil com o punho, e halteres com o cotovelo.",
    },
    trustLevel: "princípio biomecânico",
    temCena: false,
  },

  {
    id: "e65",
    slug: "elevacao-frontal",
    nome: "Elevação frontal com halteres",
    grupoMuscular: "Ombros",
    equipamento: "Halter",
    objetivo: ["Hipertrofia", "Resistência muscular"],
    nivel: "Iniciante",
    articulacaoPredominante: "Ombro",
    premium: false,
    resumoPratico:
      "Levantar os halteres à frente até a altura do ombro: deltoide anterior isolado, sem a participação do tríceps que o desenvolvimento traz.",
    anguloArticular: "Flexão de ombro até 90 graus",
    imagem: "/exercises/elevacao-frontal.webp",
    imagemAnalise: "/exercises/elevacao-frontal-analysis.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Deltoide anterior", percentual: 70, papel: "primário" },
      { musculo: "Deltoide médio", percentual: 35, papel: "sinergista" },
      { musculo: "Serrátil anterior", percentual: 28, papel: "estabilizador" },
      { musculo: "Transverso do abdome", percentual: 22, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 68, metrics: m("Deltoide anterior", 70, 18, 18, 5, 35, 20) },
    fases: [
      { nome: "Posição", descricao: "Em pé, halteres à frente das coxas, palmas voltadas para o corpo." },
      { nome: "Elevação", descricao: "Sobe os braços à frente até a altura do ombro, cotovelos quase estendidos." },
      { nome: "Descida", descricao: "Desce em 3 segundos sem deixar os halteres baterem nas coxas." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 32,
        titulo: "Parar na altura do ombro",
        camadas: {
          resumo: "Acima do ombro o trabalho vai para o trapézio superior.",
          biomecanica:
            "Até 90 graus, a flexão de ombro é conduzida pelo deltoide anterior. Além disso, a escápula precisa girar e o trapézio superior assume a maior parte.",
          fisiologia:
            "É um exercício de isolamento com braço de alavanca longo, e por isso carga baixa já produz esforço alto.",
          evidencia:
            "Boeckh-Behrens e Buskies documentam o perfil de ativação do deltoide em exercícios de elevação por eletromiografia.",
          cuidados: "Jogar o tronco para trás no começo indica carga alta demais.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Quando se quer deltoide anterior sem envolver tríceps.",
        "Complemento de um plano que já tem desenvolvimento e elevação lateral.",
        "Fim de sessão de ombro, com carga leve.",
      ],
      quandoEvitar: [
        "Dor à frente do ombro durante a elevação.",
        "Aluno que já faz muito volume de empurrar, porque o deltoide anterior costuma estar bem servido.",
      ],
      errosComuns: [
        "Subir acima da altura do ombro e transferir o trabalho para o trapézio.",
        "Jogar o tronco para trás para iniciar o movimento.",
        "Soltar a descida em vez de controlar.",
      ],
      variacoes: [
        "Alternado: permite carga um pouco maior por braço.",
        "Com barra: mantém as mãos alinhadas.",
        "Com elástico: resistência crescente, mais fácil em casa.",
      ],
    },
    conteudo: {
      visaoGeral:
        "Completa o trio de deltoide do catálogo: elevação lateral para o médio, crucifixo inverso para o posterior e elevação frontal para o anterior.",
      biomecanica:
        "O deltoide anterior flexiona o ombro. Com os cotovelos quase estendidos, o braço de alavanca é longo, e por isso a carga necessária é baixa.",
      fisiologia:
        "Em quem já faz muito supino e desenvolvimento, o deltoide anterior costuma estar bem estimulado. Este exercício rende mais quando o plano tem pouco volume de empurrar.",
      prescricaoPratica:
        "Em geral, 2 a 3 séries de 12 a 15 repetições com halter leve, parando na altura do ombro. Carga que obriga a jogar o tronco anula o exercício.",
    },
    trustLevel: "tendência prática",
    temCena: false,
  },

  {
    id: "e66",
    slug: "crucifixo-inverso",
    nome: "Crucifixo inverso",
    grupoMuscular: "Ombros",
    equipamento: "Halter",
    objetivo: ["Hipertrofia", "Aprendizado técnico", "Retorno ao treino"],
    nivel: "Iniciante",
    articulacaoPredominante: "Ombro e escápula",
    premium: false,
    resumoPratico:
      "Tronco inclinado, braços abrindo para os lados: o primeiro exercício do catálogo que tem o deltoide posterior como alvo.",
    anguloArticular: "Abdução horizontal de ombro com tronco inclinado",
    imagem: "/exercises/crucifixo-inverso.webp",
    imagemAnalise: "/exercises/crucifixo-inverso-analysis.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Deltoide posterior", percentual: 68, papel: "primário" },
      { musculo: "Trapézio médio", percentual: 55, papel: "sinergista" },
      { musculo: "Romboides", percentual: 50, papel: "sinergista" },
      { musculo: "Infraespinal", percentual: 35, papel: "sinergista" },
      { musculo: "Eretores da espinha", percentual: 28, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 79, metrics: m("Deltoide posterior", 68, 28, 30, 5, 25, 25) },
    fases: [
      { nome: "Posição", descricao: "Tronco inclinado à frente, halteres pendurados sob o peito, cotovelos levemente dobrados." },
      { nome: "Abertura", descricao: "Abre os braços para os lados até a altura dos ombros, juntando as escápulas." },
      { nome: "Retorno", descricao: "Desce em 3 segundos até a posição inicial, sem soltar de uma vez." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 36,
        titulo: "O músculo que ninguém treina",
        camadas: {
          resumo: "Deltoide posterior estava em ZERO na matriz de cobertura do catálogo.",
          biomecanica:
            "A abdução horizontal com o tronco inclinado coloca o deltoide posterior como motor principal, com romboides e trapézio médio organizando a escápula.",
          fisiologia:
            "Em quem faz muito supino e flexão de braço, o desequilíbrio entre a frente e o fundo do ombro é a regra, e este exercício é a correção mais direta.",
          evidencia:
            "Reinold e colaboradores mediram 88% da contração máxima do deltoide posterior na abdução horizontal em decúbito ventral com rotação externa, que é a versão deitada deste padrão.",
          cuidados: "Dor lombar pede a versão sentado com o tronco apoiado nas coxas.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Sempre que o plano tiver supino, flexão ou desenvolvimento.",
        "Saúde do ombro em quem trabalha muito tempo sentado.",
        "Retorno ao treino, com halter leve e foco na escápula.",
      ],
      quandoEvitar: [
        "Dor lombar que aparece ao inclinar o tronco à frente.",
        "Aluno que ainda não mantém a coluna neutra na inclinação.",
      ],
      errosComuns: [
        "Usar carga alta e puxar com o cotovelo, transformando em remada.",
        "Arredondar a coluna na posição inclinada.",
        "Subir os ombros na direção da orelha durante a abertura.",
      ],
      variacoes: [
        "Sentado com o tronco apoiado nas coxas: tira a exigência lombar.",
        "Deitado de bruços no banco inclinado: elimina a carga na coluna.",
        "Com elástico à frente do corpo: mais fácil de fazer em casa.",
      ],
    },
    conteudo: {
      visaoGeral:
        "A matriz de cobertura apontou o deltoide posterior em zero, e este é o exercício mais direto para resolver. Era um buraco visível: o catálogo tinha quatro exercícios de ombro e nenhum para o fundo dele.",
      biomecanica:
        "Com o tronco inclinado, a gravidade resiste à abertura dos braços em todo o trajeto. O deltoide posterior conduz, e romboides e trapézio médio retraem a escápula.",
      fisiologia:
        "É trabalho de baixa carga e volume alto. Carga alta transforma o movimento em remada, o que muda o músculo alvo sem que ninguém perceba.",
      prescricaoPratica:
        "Em geral, 3 séries de 12 a 20 repetições com halter leve e pausa de 1 s no alto. Se o cotovelo dobra para puxar, a carga está alta.",
    },
    trustLevel: "princípio biomecânico",
    temCena: false,
  },

  {
    id: "e67",
    slug: "face-pull-polia",
    nome: "Face pull na polia",
    grupoMuscular: "Ombros",
    equipamento: "Polia",
    objetivo: ["Aprendizado técnico", "Retorno ao treino", "Resistência muscular"],
    nivel: "Iniciante",
    articulacaoPredominante: "Ombro e escápula",
    premium: false,
    resumoPratico:
      "Puxar a corda na direção do rosto girando os ombros para fora: junta deltoide posterior, escápula e rotadores externos num movimento só.",
    anguloArticular: "Abdução horizontal com rotação externa de ombro",
    imagem: "/exercises/face-pull-polia.webp",
    imagemAnalise: "/exercises/face-pull-polia-analysis.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Deltoide posterior", percentual: 60, papel: "primário" },
      { musculo: "Trapézio médio", percentual: 55, papel: "sinergista" },
      { musculo: "Infraespinal", percentual: 45, papel: "sinergista" },
      { musculo: "Romboides", percentual: 42, papel: "sinergista" },
      { musculo: "Trapézio inferior", percentual: 30, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 81, metrics: m("Deltoide posterior", 60, 30, 12, 5, 22, 25) },
    fases: [
      { nome: "Posição", descricao: "Em pé de frente para a polia alta, corda segurada com as palmas voltadas para dentro." },
      { nome: "Puxada", descricao: "Puxa na direção do rosto abrindo os cotovelos e girando os antebraços para fora." },
      { nome: "Retorno", descricao: "Estende os braços devagar, sem deixar os ombros irem à frente." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 32,
        titulo: "Três coisas de uma vez",
        camadas: {
          resumo: "Deltoide posterior, retração escapular e rotação externa no mesmo movimento.",
          biomecanica:
            "A puxada na altura do rosto combina abdução horizontal com rotação externa, que são justamente os dois movimentos que faltam em quem só empurra.",
          fisiologia:
            "Por juntar três funções, rende bem como aquecimento de tronco superior e como trabalho de saúde do ombro em volume alto.",
          evidencia:
            "Reinold e colaboradores mediram a abdução horizontal com rotação externa entre os exercícios de maior atividade de deltoide posterior e de supraespinal.",
          cuidados: "Carga alta transforma o movimento em remada alta, que estressa o ombro.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Aquecimento antes de supino e de desenvolvimento.",
        "Saúde do ombro em quem tem muito volume de empurrar.",
        "Retorno ao treino de ombro, com carga leve e volume alto.",
      ],
      quandoEvitar: [
        "Dor no ombro que aparece na fase final da rotação externa.",
        "Aluno que só consegue executar puxando com carga alta.",
      ],
      errosComuns: [
        "Puxar com carga alta e levar a corda ao peito em vez do rosto.",
        "Deixar os cotovelos caírem abaixo da linha dos ombros.",
        "Encolher os ombros na direção da orelha.",
      ],
      variacoes: [
        "Com elástico preso alto: mesma ideia, sem academia.",
        "Ajoelhado: tira a compensação de quadril.",
        "Com pausa de 2 s no fim: reforça a rotação externa.",
      ],
    },
    conteudo: {
      visaoGeral:
        "É o exercício de saúde de ombro mais completo do catálogo, porque cobre em um movimento o que o crucifixo inverso e a rotação externa cobrem em dois.",
      biomecanica:
        "A corda permite que as mãos se separem no fim, o que possibilita a rotação externa junto com a abertura. Manter os cotovelos na altura dos ombros é o que garante a linha correta.",
      fisiologia:
        "Trabalho de resistência com carga leve. O valor está na frequência: rende mais feito em toda sessão de tronco superior do que uma vez por semana com carga alta.",
      prescricaoPratica:
        "Em geral, 2 a 3 séries de 15 a 20 repetições com carga leve e pausa de 1 s no fim. Se a corda chega ao peito em vez do rosto, reduza a carga.",
    },
    trustLevel: "princípio biomecânico",
    temCena: false,
  },

  {
    id: "e68",
    slug: "encolhimento-halteres",
    nome: "Encolhimento de ombros com halteres",
    grupoMuscular: "Ombros",
    equipamento: "Halter",
    objetivo: ["Hipertrofia", "Força"],
    nivel: "Iniciante",
    articulacaoPredominante: "Escápula",
    premium: false,
    resumoPratico:
      "Elevar os ombros na direção das orelhas com halteres nas mãos: trapézio superior direto, e um estímulo de pegada de graça.",
    anguloArticular: "Elevação escapular em amplitude completa",
imagem: "/exercises/encolhimento-halteres.webp",
    imagemAnalise: "/exercises/encolhimento-halteres-analysis.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Trapézio superior", percentual: 75, papel: "primário" },
      { musculo: "Romboides", percentual: 35, papel: "sinergista" },
      { musculo: "Flexores do punho", percentual: 40, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 70, metrics: m("Trapézio superior", 75, 12, 20, 5, 18, 12) },
    fases: [
      { nome: "Posição", descricao: "Em pé, halteres ao lado do corpo, braços estendidos e ombros relaxados." },
      { nome: "Elevação", descricao: "Sobe os ombros na direção das orelhas, sem dobrar os cotovelos." },
      { nome: "Descida", descricao: "Desce devagar até o alongamento, sem deixar cair de uma vez." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 26,
        titulo: "Sobe reto, não gira",
        camadas: {
          resumo: "Rodar os ombros para trás não acrescenta trabalho e estressa a articulação.",
          biomecanica:
            "O trapézio superior eleva a escápula. O movimento útil é vertical; girar o ombro acrescenta um trajeto que a articulação não precisa fazer sob carga.",
          fisiologia:
            "O trapézio superior aparece como sinergista em quatro exercícios do catálogo, mas nunca como alvo, e sem estímulo direto ele fica sem progressão.",
          evidencia:
            "Boeckh-Behrens e Buskies documentam por eletromiografia o perfil do trapézio nos exercícios de elevação escapular.",
          cuidados: "Pescoço tenso durante a série pede carga menor e ombros mais soltos no fim.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Quando o plano precisa de trapézio superior como alvo.",
        "Complemento de pegada, porque segurar os halteres já é estímulo.",
        "Aluno com queixa postural de ombros caídos, junto com trabalho escapular.",
      ],
      quandoEvitar: [
        "Dor cervical em investigação.",
        "Aluno com muito volume de trapézio superior em outros exercícios.",
      ],
      errosComuns: [
        "Girar os ombros para trás no alto do movimento.",
        "Dobrar os cotovelos e transformar em remada alta.",
        "Usar carga que só permite meia amplitude.",
      ],
      variacoes: [
        "Com barra à frente: mantém as mãos alinhadas.",
        "Com pausa de 2 s no alto: mais tempo sob tensão.",
        "Um lado por vez: expõe assimetria e aumenta o estímulo de pegada.",
      ],
    },
    conteudo: {
      visaoGeral:
        "O trapézio superior aparecia em quatro exercícios do catálogo, sempre como sinergista e nunca como alvo. Este item existe para dar a ele progressão própria.",
      biomecanica:
        "A elevação da escápula é um movimento curto e vertical. A carga costuma ser alta porque a amplitude é pequena, e é por isso que a pegada vira fator limitante.",
      fisiologia:
        "Além do trapézio, a sustentação dos halteres exige preensão mantida, que é um dos poucos estímulos de pegada do catálogo nesta fase.",
      prescricaoPratica:
        "Em geral, 3 séries de 10 a 15 repetições com pausa de 1 a 2 s no alto e amplitude completa. Se a mão abrir antes do trapézio cansar, use alça de pegada ou reduza a carga.",
    },
    trustLevel: "regra pedagógica",
    temCena: false,
  },
];
