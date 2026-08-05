import type { Exercise, EficMetric } from "./types";

/**
 * Terceira expansão do catálogo (e40 em diante): MUSCULATURA DE APOIO.
 *
 * Nasceu de uma busca do fundador por "manguito rotador" que não devolveu nada. A
 * matriz de cobertura do `check:catalogo` confirmou o buraco e mostrou que ele era
 * maior: manguito, glúteo médio, trapézio inferior, quadrado lombar e antebraço
 * estavam todos em ZERO, e músculo em zero significa que o motor nunca escolhe um
 * exercício por causa dele. Um aluno com dor de ombro, de joelho ou de lombar não
 * tinha o que receber.
 *
 * Este lote é o P1 da fila: o que destrava caso clínico no mesmo dia.
 *
 * NÚMERO DE ATIVAÇÃO. Onde existe EMG publicado, o valor vem dele e a referência
 * está em `exercise-referencias.ts` (Reinold 2004 e 2007 para ombro, Distefano 2009
 * para glúteo, Ekstrom 2007 e McGill 2010 para core). Onde não existe, o valor é
 * estimativa relativa sintetizada dessa mesma literatura, que é o contrato já
 * declarado no cabeçalho de `exercise-referencias.ts`, e o texto do exercício diz
 * quando a medição exigiria eletrodo de fio fino. O que NUNCA se faz é escrever 0:
 * zero é a afirmação de que o músculo não trabalha, e o `check:catalogo` trava isso.
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

export const extraExercises3: Exercise[] = [
  /* ==================== LOTE G: MANGUITO ROTADOR E OMBRO ==================== */
  {
    id: "e40",
    slug: "rotacao-externa-elastico",
    nome: "Rotação externa com elástico",
    grupoMuscular: "Ombros",
    equipamento: "Elástico",
    objetivo: ["Retorno ao treino", "Aprendizado técnico", "Resistência muscular"],
    nivel: "Iniciante",
    articulacaoPredominante: "Ombro",
    premium: false,
    resumoPratico:
      "Rotação externa com o cotovelo junto ao tronco: o exercício de manguito mais fácil de ensinar e de fazer em casa, porque o próprio corpo limita a compensação.",
    anguloArticular: "0 graus de abdução, cotovelo a 90 graus",
imagem: "/exercises/rotacao-externa-elastico.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Infraespinal", percentual: 55, papel: "primário" },
      { musculo: "Redondo menor", percentual: 48, papel: "sinergista" },
      { musculo: "Deltoide posterior", percentual: 30, papel: "sinergista" },
      { musculo: "Trapézio médio", percentual: 26, papel: "estabilizador" },
      { musculo: "Trapézio inferior", percentual: 22, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 74, metrics: m("Infraespinal", 55, 30, 8, 5, 25, 20) },
    fases: [
      { nome: "Posição", descricao: "Em pé, elástico preso na altura do cotovelo, braço junto ao tronco e cotovelo dobrado a 90 graus." },
      { nome: "Rotação", descricao: "Gira o antebraço para fora sem afastar o cotovelo do corpo, até onde o ombro permitir sem dor." },
      { nome: "Retorno", descricao: "Volta devagar, controlando a tração do elástico, sem deixar o ombro rodar para frente." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 46,
        y: 32,
        titulo: "O cotovelo é o professor",
        camadas: {
          resumo: "Cotovelo colado ao tronco: se ele abre, quem gira é o corpo, não o ombro.",
          biomecanica:
            "Com o braço junto ao corpo, a rotação externa acontece na articulação do ombro. Afastar o cotovelo transfere o movimento para o tronco e para a escápula, e o manguito deixa de ser o motor.",
          fisiologia:
            "O infraespinal e o redondo menor são músculos de resistência, com fibras predominantemente lentas: respondem melhor a séries longas e carga leve do que a carga alta.",
          evidencia:
            "Reinold e colaboradores mediram sete exercícios de rotação externa com eletrodo intramuscular e encontraram a maior atividade do infraespinal (62% da contração máxima) e do redondo menor (67%) na versão deitado de lado.",
          cuidados: "Uma toalha enrolada entre o cotovelo e o tronco resolve sozinha o erro mais comum.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Primeira entrada de manguito rotador em quem tem dor de ombro.",
        "Aquecimento antes de empurrar ou puxar acima da cabeça.",
        "Aluno que treina em casa e só tem elástico.",
      ],
      quandoEvitar: [
        "Dor que aparece já no primeiro terço da amplitude, mesmo com carga mínima.",
        "Pós-operatório de ombro sem liberação escrita de quem operou.",
      ],
      errosComuns: [
        "Afastar o cotovelo do tronco e girar o corpo inteiro no lugar do ombro.",
        "Puxar rápido e soltar o elástico de volta, perdendo a fase de controle.",
        "Buscar amplitude além do confortável achando que mais é melhor.",
      ],
      variacoes: [
        "Com toalha enrolada sob o cotovelo: garante o braço junto ao corpo.",
        "Em pé com o elástico à frente: mais fácil de montar em casa.",
        "Sentado com apoio de tronco: tira a compensação de quadril.",
      ],
    },
    conteudo: {
      visaoGeral:
        "É o exercício que faltava no catálogo para quem tem ombro sensível. O manguito rotador não é um músculo de espelho, é o que mantém a cabeça do úmero centrada enquanto o resto do ombro empurra e puxa, e ele quase nunca recebe estímulo direto num treino comum.",
      biomecanica:
        "Com o braço junto ao tronco, o infraespinal e o redondo menor giram o úmero para fora e, ao fazer isso, empurram a cabeça do úmero para baixo e para trás, o que abre o espaço por onde o supraespinal passa. O elástico oferece resistência crescente, o que combina bem com um movimento cuja parte final é a mais fraca.",
      fisiologia:
        "De forma aguda, a série ensina o padrão de rotação sem compensar com o tronco. De forma crônica, ganhar resistência nos rotadores externos costuma melhorar a tolerância do ombro nos exercícios de empurrar, que é onde a dor costuma aparecer.",
      prescricaoPratica:
        "Em geral, 2 a 3 séries de 12 a 20 repetições com elástico leve, todos os dias de treino de tronco superior. Progrida a espessura do elástico só depois que 20 repetições saírem sem dor e sem o cotovelo abrir.",
    },
    trustLevel: "princípio biomecânico",
    temCena: false,
  },

  {
    id: "e41",
    slug: "rotacao-externa-deitado",
    nome: "Rotação externa deitado de lado",
    grupoMuscular: "Ombros",
    equipamento: "Halter",
    objetivo: ["Retorno ao treino", "Resistência muscular", "Aprendizado técnico"],
    nivel: "Iniciante",
    articulacaoPredominante: "Ombro",
    premium: false,
    resumoPratico:
      "A posição com maior atividade medida do infraespinal e do redondo menor: deitado de lado, o peso do halter resiste exatamente onde o manguito trabalha.",
    anguloArticular: "0 graus de abdução, cotovelo a 90 graus",
imagem: "/exercises/rotacao-externa-deitado.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Infraespinal", percentual: 62, papel: "primário" },
      { musculo: "Redondo menor", percentual: 67, papel: "primário" },
      { musculo: "Deltoide posterior", percentual: 26, papel: "sinergista" },
      { musculo: "Trapézio médio", percentual: 22, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 79, metrics: m("Infraespinal", 62, 28, 10, 5, 22, 25) },
    fases: [
      { nome: "Posição", descricao: "Deitado de lado, braço de cima junto ao tronco, cotovelo a 90 graus e antebraço sobre a barriga." },
      { nome: "Rotação", descricao: "Gira o antebraço para cima até apontar à frente, sem deixar o ombro subir na direção da orelha." },
      { nome: "Descida", descricao: "Desce em 3 segundos até a barriga, controlando o peso o tempo todo." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 36,
        titulo: "Por que deitado rende mais",
        camadas: {
          resumo: "Deitado de lado, a gravidade resiste ao movimento na amplitude inteira.",
          biomecanica:
            "Em pé com halter, a resistência da gravidade quase desaparece na rotação externa, porque o peso desce em linha reta. Deitado de lado, o braço de alavanca se mantém do começo ao fim.",
          fisiologia:
            "Foi nessa posição que se mediu a maior atividade do infraespinal e do redondo menor entre sete exercícios de rotação externa comparados no mesmo estudo.",
          evidencia:
            "Reinold e colaboradores, 2004, com eletrodo intramuscular: infraespinal 62% e redondo menor 67% da contração isométrica voluntária máxima.",
          cuidados: "Se o ombro sobe na direção da orelha, o peso está alto para o estágio.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Quando o objetivo é a maior atividade de manguito com o menor risco.",
        "Segundo passo depois que a versão com elástico ficou fácil.",
        "Aluno com ombro sensível que já tolera deitar de lado.",
      ],
      quandoEvitar: [
        "Aluno que não consegue deitar de lado com conforto.",
        "Dor durante o movimento mesmo sem peso na mão.",
      ],
      errosComuns: [
        "Deixar o ombro subir na direção da orelha durante a rotação.",
        "Descolar o cotovelo do tronco e rolar o corpo para trás para ganhar amplitude.",
        "Usar halter pesado demais, que transforma o movimento em impulso.",
      ],
      variacoes: [
        "Com toalha sob o cotovelo: mantém a posição sem esforço de atenção.",
        "Só com o peso do braço: primeira sessão, para aprender o caminho.",
        "Com pausa de 2 s no alto: aumenta o tempo sob tensão sem subir carga.",
      ],
    },
    conteudo: {
      visaoGeral:
        "É a versão de manguito com maior respaldo de medição do catálogo. O ganho vem da posição, não da carga: um halter leve deitado de lado exige mais dos rotadores externos do que um halter pesado em pé.",
      biomecanica:
        "Deitado de lado, o antebraço gira contra a gravidade em toda a amplitude, e o cotovelo apoiado no tronco impede a compensação do tronco. O trapézio médio entra como estabilizador da escápula, e é por isso que o ombro subir na direção da orelha denuncia carga excessiva.",
      fisiologia:
        "O trabalho é de resistência, com carga baixa e volume alto. Ganhos aparecem mais como tolerância ao movimento e menos como aumento de força máxima, o que é coerente com a função do grupo.",
      prescricaoPratica:
        "Em geral, 2 a 3 séries de 10 a 15 repetições por lado, com descida de 3 s. Um halter de 1 a 2 kg costuma bastar por semanas, e trocar por um mais pesado cedo demais devolve a compensação de tronco.",
    },
    trustLevel: "princípio biomecânico",
    temCena: false,
  },

  {
    id: "e42",
    slug: "rotacao-interna-elastico",
    nome: "Rotação interna com elástico",
    grupoMuscular: "Ombros",
    equipamento: "Elástico",
    objetivo: ["Retorno ao treino", "Resistência muscular"],
    nivel: "Iniciante",
    articulacaoPredominante: "Ombro",
    premium: false,
    resumoPratico:
      "O lado de dentro do manguito, que quase nunca é treinado: o subescapular é o único rotador interno profundo e faz par com os rotadores externos.",
    anguloArticular: "0 graus de abdução, cotovelo a 90 graus",
imagem: "/exercises/rotacao-interna-elastico.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Subescapular", percentual: 50, papel: "primário" },
      { musculo: "Peitoral maior", percentual: 32, papel: "sinergista" },
      { musculo: "Latíssimo do dorso", percentual: 26, papel: "sinergista" },
      { musculo: "Trapézio médio", percentual: 20, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 68, metrics: m("Subescapular", 50, 28, 8, 5, 24, 20) },
    fases: [
      { nome: "Posição", descricao: "Em pé de lado para a fixação, cotovelo junto ao tronco e antebraço apontando para fora." },
      { nome: "Rotação", descricao: "Traz o antebraço até a barriga girando só o ombro, sem puxar o cotovelo para trás." },
      { nome: "Retorno", descricao: "Deixa o elástico levar o antebraço de volta em 3 segundos, sem soltar." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 52,
        y: 34,
        titulo: "Um músculo que não dá para ver",
        camadas: {
          resumo: "O subescapular fica na face interna da escápula: ninguém o enxerga nem o apalpa.",
          biomecanica:
            "É o único rotador interno do manguito e trabalha contra a tendência da cabeça do úmero de deslizar para frente. Quando ele falta, sobra para o peitoral e para o latíssimo, que giram o ombro para dentro mas não o centram.",
          fisiologia:
            "Por ser profundo, sua medição confiável exige eletrodo de fio fino. O valor exibido aqui é estimativa relativa a partir da literatura de rotação de ombro, não medição direta deste movimento.",
          evidencia:
            "Os estudos de eletromiografia de superfície do ombro não conseguem isolá-lo, e é por isso que este exercício entra no catálogo sem citar número medido.",
          cuidados: "Se o cotovelo vai para trás, quem trabalhou foi o latíssimo, não o subescapular.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Junto com a rotação externa, para não treinar só um lado do manguito.",
        "Aluno com sensação de instabilidade à frente do ombro.",
        "Aquecimento de tronco superior em quem já teve dor de ombro.",
      ],
      quandoEvitar: [
        "Pós-operatório de ombro sem liberação escrita de quem operou.",
        "Dor à frente do ombro que piora ao longo da série.",
      ],
      errosComuns: [
        "Puxar o cotovelo para trás e transformar o movimento numa remada curta.",
        "Girar o tronco para ganhar amplitude em vez de girar o ombro.",
        "Usar elástico grosso, que faz o peitoral tomar o lugar do subescapular.",
      ],
      variacoes: [
        "Com toalha sob o cotovelo: mantém o braço junto ao corpo.",
        "Sentado com apoio de tronco: elimina a compensação de quadril.",
        "Com pausa de 2 s no fim: reforça o controle na parte mais curta.",
      ],
    },
    conteudo: {
      visaoGeral:
        "Existe porque treinar só a rotação externa é meia conta. O subescapular é o rotador interno profundo e participa da centragem da cabeça do úmero, e nenhum exercício comum de peito o alcança de forma direta.",
      biomecanica:
        "Com o cotovelo junto ao tronco, a rotação interna acontece no ombro. Solto, o cotovelo recua e o movimento vira extensão de ombro, que é trabalho de latíssimo. É a mesma armadilha da rotação externa, espelhada.",
      fisiologia:
        "Trabalho de resistência com carga leve, na mesma lógica do restante do manguito. O objetivo é tolerância e controle, não força máxima.",
      prescricaoPratica:
        "Em geral, 2 a 3 séries de 12 a 20 repetições com elástico leve, sempre na mesma sessão da rotação externa. Manter as duas em volume parecido é mais importante do que a carga de qualquer uma delas.",
    },
    trustLevel: "princípio biomecânico",
    temCena: false,
  },

  {
    id: "e43",
    slug: "scaption",
    nome: "Elevação no plano da escápula",
    grupoMuscular: "Ombros",
    equipamento: "Halter",
    objetivo: ["Retorno ao treino", "Aprendizado técnico", "Hipertrofia"],
    nivel: "Iniciante",
    articulacaoPredominante: "Ombro e escápula",
    premium: false,
    resumoPratico:
      "Elevar o braço a cerca de 30 graus à frente do corpo, polegar para cima: a posição em que o supraespinal trabalha com a menor participação do deltoide.",
    anguloArticular: "Elevação até a altura do ombro, cerca de 30 graus à frente do plano frontal",
    // Sem `imagemAnalise` de propósito: o primário é o supraespinal, que corre
    // por baixo do deltoide e do trapézio e não aparece em superfície nenhuma.
    imagem: "/exercises/scaption.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Supraespinal", percentual: 60, papel: "primário" },
      { musculo: "Deltoide médio", percentual: 52, papel: "sinergista" },
      { musculo: "Deltoide anterior", percentual: 40, papel: "sinergista" },
      { musculo: "Trapézio inferior", percentual: 30, papel: "estabilizador" },
      { musculo: "Serrátil anterior", percentual: 28, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 76, metrics: m("Supraespinal", 60, 32, 12, 5, 34, 30) },
    fases: [
      { nome: "Posição", descricao: "Em pé, halteres ao lado do corpo, polegares apontando para cima." },
      { nome: "Elevação", descricao: "Sobe os braços num plano cerca de 30 graus à frente do corpo, até a altura do ombro." },
      { nome: "Descida", descricao: "Desce em 3 segundos pelo mesmo caminho, sem deixar os ombros subirem." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 30,
        titulo: "Polegar para cima, não para baixo",
        camadas: {
          resumo: "A versão com o polegar para cima recruta o supraespinal com menos deltoide.",
          biomecanica:
            "No plano da escápula, o úmero sobe alinhado com a orientação natural da articulação, o que reduz o pinçamento das estruturas sob o acrômio. Girar o polegar para baixo aumenta a compressão sem ganho de manguito.",
          fisiologia:
            "As três versões comparadas produziram atividade semelhante do supraespinal, e a com polegar para cima gerou atividade significativamente menor dos deltoides, o que a torna a mais seletiva.",
          evidencia:
            "Reinold e colaboradores, 2007: deltoide médio 52% da contração máxima na versão polegar para cima contra 77% na versão polegar para baixo.",
          cuidados: "Parar na altura do ombro. Acima disso o trabalho passa a ser de trapézio superior.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Quando se quer supraespinal com a menor compensação possível do deltoide.",
        "Alternativa à elevação lateral em aluno com ombro sensível.",
        "Aquecimento antes de desenvolvimento ou supino.",
      ],
      quandoEvitar: [
        "Dor no arco médio da elevação que não melhora reduzindo a amplitude.",
        "Aluno que não consegue subir sem levantar o ombro na direção da orelha.",
      ],
      errosComuns: [
        "Girar o polegar para baixo, o que aumenta a compressão sem ganho.",
        "Subir acima da altura do ombro e transferir o trabalho para o trapézio superior.",
        "Usar halter pesado e jogar o tronco para trás no começo do movimento.",
      ],
      variacoes: [
        "Um braço por vez com apoio da outra mão: melhor controle no aprendizado.",
        "Com elástico no lugar do halter: resistência crescente, mais fácil em casa.",
        "Parando na altura do peito: amplitude reduzida para o ombro sensível.",
      ],
    },
    conteudo: {
      visaoGeral:
        "É a alternativa técnica à elevação lateral clássica. Muda o plano do movimento em cerca de 30 graus e, com isso, troca compressão por espaço, mantendo o estímulo no supraespinal, que é o músculo do manguito mais associado a dor de ombro.",
      biomecanica:
        "A escápula não fica no plano frontal do corpo, e sim rodada para frente. Elevar o braço nesse plano mantém a cabeça do úmero congruente com a cavidade, em vez de empurrá-la contra a borda anterior do acrômio.",
      fisiologia:
        "O supraespinal inicia a abdução e depois divide o trabalho com o deltoide. Trabalhar na faixa em que ele é o motor exige parar na altura do ombro, e não buscar a amplitude total.",
      prescricaoPratica:
        "Em geral, 2 a 3 séries de 10 a 15 repetições com halter leve, descida em 3 s, parando na altura do ombro. Carga que obriga a jogar o tronco anula o propósito do exercício.",
    },
    trustLevel: "princípio biomecânico",
    temCena: false,
  },

  /* ================= LOTE I: ESTABILIZADORES DO QUADRIL ================= */
  {
    id: "e44",
    slug: "clam-shell",
    nome: "Concha deitado de lado",
    grupoMuscular: "Membros inferiores",
    equipamento: "Elástico",
    objetivo: ["Retorno ao treino", "Aprendizado técnico", "Resistência muscular"],
    nivel: "Iniciante",
    articulacaoPredominante: "Quadril",
    premium: false,
    resumoPratico:
      "Abrir o joelho de cima com os pés juntos: a entrada mais simples de glúteo médio e rotadores externos, sem carga sobre a coluna nem sobre o joelho.",
    anguloArticular: "Quadril e joelho a cerca de 45 e 90 graus",
    imagem: "/exercises/clam-shell.webp",
    imagemAnalise: "/exercises/clam-shell-analysis.webp",
    modalidade: "m-funcional",
    ativacao: [
      { musculo: "Glúteo médio", percentual: 40, papel: "primário" },
      { musculo: "Rotadores externos do quadril", percentual: 35, papel: "sinergista" },
      { musculo: "Glúteo máximo", percentual: 34, papel: "sinergista" },
      { musculo: "Oblíquos", percentual: 20, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 70, metrics: m("Glúteo médio", 40, 22, 10, 8, 5, 25) },
    fases: [
      { nome: "Posição", descricao: "Deitado de lado, quadris e joelhos dobrados, pés juntos, elástico acima dos joelhos." },
      { nome: "Abertura", descricao: "Abre o joelho de cima girando o quadril, mantendo os pés encostados e a bacia parada." },
      { nome: "Retorno", descricao: "Fecha devagar, sem deixar o elástico puxar de volta." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 48,
        y: 55,
        titulo: "A bacia não pode rolar para trás",
        camadas: {
          resumo: "Se a bacia gira, o movimento sai do quadril e some o glúteo médio.",
          biomecanica:
            "A concha é rotação externa do quadril com o joelho dobrado. Rolar a bacia para trás transforma o movimento em rotação de tronco, e o glúteo médio deixa de resistir a coisa alguma.",
          fisiologia:
            "É um exercício de baixa carga: serve para aprender o padrão e para os primeiros dias, não para força de glúteo médio.",
          evidencia:
            "Distefano e colaboradores, 2009: concha 38 a 40% da contração máxima do glúteo médio, contra 81% na abdução deitado de lado com a perna estendida.",
          cuidados: "Uma mão na bacia durante as primeiras séries mostra na hora se ela está girando.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Primeira semana de trabalho de glúteo médio em dor de joelho ou de lombar.",
        "Aluno que ainda não tolera ficar em pé sobre uma perna só.",
        "Aquecimento antes de agachamento e de afundo.",
      ],
      quandoEvitar: [
        "Aluno com dificuldade de descer ao chão e levantar sozinho.",
        "Dor no quadril que aparece já na abertura sem elástico.",
      ],
      errosComuns: [
        "Rolar a bacia para trás para abrir mais o joelho.",
        "Separar os pés durante a abertura, o que muda o movimento.",
        "Usar elástico grosso cedo demais e perder a posição da bacia.",
      ],
      variacoes: [
        "Sem elástico: primeira sessão, só para achar o movimento.",
        "Com pausa de 2 s aberto: aumenta o tempo sob tensão.",
        "Com o quadril mais estendido: muda a ênfase dentro do glúteo médio.",
      ],
    },
    conteudo: {
      visaoGeral:
        "O glúteo médio é o estabilizador que aparece em quase toda dor de joelho e de lombar, e o catálogo não tinha nenhum exercício para ele. A concha é a porta de entrada: baixa exigência técnica, nenhuma carga na coluna e fácil de fazer em casa.",
      biomecanica:
        "Deitado de lado com os joelhos dobrados, abrir o joelho de cima é rotação externa de quadril. O glúteo médio e os rotadores profundos produzem o movimento, e o oblíquo do lado de baixo impede a bacia de girar junto.",
      fisiologia:
        "É um estímulo de baixa intensidade. A literatura de eletromiografia mostra a concha bem abaixo dos exercícios em pé e da abdução com a perna estendida, o que faz dela um degrau, não um destino.",
      prescricaoPratica:
        "Em geral, 2 a 3 séries de 15 a 20 repetições por lado. Assim que a bacia se mantiver parada com facilidade, migre para a caminhada lateral e depois para exercícios em apoio unipodal, que rendem mais.",
    },
    trustLevel: "princípio biomecânico",
    temCena: false,
  },

  {
    id: "e45",
    slug: "caminhada-lateral-elastico",
    nome: "Caminhada lateral com elástico",
    grupoMuscular: "Membros inferiores",
    equipamento: "Elástico",
    objetivo: ["Retorno ao treino", "Resistência muscular", "Aprendizado técnico"],
    nivel: "Iniciante",
    articulacaoPredominante: "Quadril",
    premium: false,
    resumoPratico:
      "Passos laterais contra a resistência do elástico, em pé: glúteo médio já na posição em que ele é usado de verdade, que é sustentando a bacia sobre uma perna.",
    anguloArticular: "Quadril e joelho em semiflexão",
    imagem: "/exercises/caminhada-lateral-elastico.webp",
    imagemAnalise: "/exercises/caminhada-lateral-elastico-analysis.webp",
    modalidade: "m-funcional",
    ativacao: [
      { musculo: "Glúteo médio", percentual: 38, papel: "primário" },
      { musculo: "Glúteo máximo", percentual: 27, papel: "sinergista" },
      { musculo: "Quadríceps", percentual: 22, papel: "estabilizador" },
      { musculo: "Oblíquos", percentual: 18, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 72, metrics: m("Glúteo médio", 38, 24, 12, 15, 5, 22) },
    fases: [
      { nome: "Posição", descricao: "Em pé, elástico acima dos joelhos ou nos tornozelos, joelhos em leve flexão e tronco ereto." },
      { nome: "Passo", descricao: "Dá um passo lateral mantendo os pés apontados para frente e a bacia nivelada." },
      { nome: "Aproximação", descricao: "Traz o outro pé devagar, sem deixar o elástico puxar a perna de volta." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 60,
        titulo: "A bacia nivelada é o exercício",
        camadas: {
          resumo: "Quem trabalha é o quadril da perna que está no chão, não a que dá o passo.",
          biomecanica:
            "Enquanto um pé sai do chão, o glúteo médio do lado de apoio impede a bacia de cair para o lado livre. É essa resistência, e não o passo em si, que treina o estabilizador.",
          fisiologia:
            "Em pé, o exercício reproduz a exigência real da marcha e da corrida, que é sustentar a bacia sobre uma perna só.",
          evidencia:
            "Distefano e colaboradores, 2009, mediram 27% da contração máxima do glúteo máximo na caminhada lateral com elástico. O valor do glúteo médio aqui é estimativa relativa, apoiada na hierarquia entre exercícios do mesmo estudo.",
          cuidados: "Tronco jogando para o lado a cada passo indica elástico grosso demais.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Progressão natural depois da concha, quando a bacia já se mantém parada.",
        "Aquecimento antes de agachamento, afundo e corrida.",
        "Aluno com dor de joelho ao descer escada, em que o controle da bacia costuma faltar.",
      ],
      quandoEvitar: [
        "Dor no quadril que aparece ao apoiar em uma perna só.",
        "Aluno sem equilíbrio para caminhar de lado sem apoio de parede.",
      ],
      errosComuns: [
        "Jogar o tronco para o lado a cada passo em vez de manter a bacia nivelada.",
        "Apontar os pés para fora e transformar o passo em rotação de quadril.",
        "Estender os joelhos e perder a posição de semiflexão.",
      ],
      variacoes: [
        "Com o elástico nos tornozelos: mais difícil, braço de alavanca maior.",
        "Em semiagachamento: aumenta a exigência do quadril de apoio.",
        "Com a mão na parede: apoio para quem ainda não tem equilíbrio.",
      ],
    },
    conteudo: {
      visaoGeral:
        "É o passo seguinte da concha e o primeiro exercício do catálogo que treina glúteo médio na posição em que ele é usado, de pé e sustentando a bacia. Não precisa de máquina e cabe em qualquer lugar.",
      biomecanica:
        "O elástico puxa as pernas uma na direção da outra. Para dar o passo lateral, o quadril de apoio precisa manter a bacia nivelada enquanto o outro lado se afasta, o que é exatamente a função do glúteo médio na marcha.",
      fisiologia:
        "É trabalho de resistência com carga baixa. O ganho aparece primeiro como controle da bacia em movimentos maiores, e não como aumento de força medida.",
      prescricaoPratica:
        "Em geral, 2 a 3 séries de 10 a 15 passos para cada lado, com elástico leve. Progrida descendo o elástico dos joelhos para os tornozelos antes de trocar por um mais grosso.",
    },
    trustLevel: "princípio biomecânico",
    temCena: false,
  },

  /* ============ LOTE A: CORE ANTI-ROTAÇÃO E SEM DESCER AO CHÃO ============ */
  {
    id: "e46",
    slug: "prancha-lateral",
    nome: "Prancha lateral",
    grupoMuscular: "Core (tronco)",
    equipamento: "Peso corporal",
    objetivo: ["Resistência muscular", "Aprendizado técnico"],
    nivel: "Intermediário",
    articulacaoPredominante: "Quadril e coluna",
    premium: false,
    resumoPratico:
      "Sustentar o corpo apoiado num antebraço e no lado do pé: o único exercício do catálogo que treina o core contra a flexão lateral, junto com o glúteo médio.",
    anguloArticular: "Coluna neutra, ombro a 90 graus de apoio",
    imagem: "/exercises/prancha-lateral.webp",
    imagemAnalise: "/exercises/prancha-lateral-analysis.webp",
    modalidade: "m-funcional",
    ativacao: [
      { musculo: "Oblíquos", percentual: 70, papel: "primário" },
      { musculo: "Quadrado lombar", percentual: 55, papel: "sinergista" },
      { musculo: "Glúteo médio", percentual: 45, papel: "sinergista" },
      { musculo: "Transverso do abdome", percentual: 40, papel: "estabilizador" },
      { musculo: "Eretores da espinha", percentual: 30, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 80, metrics: m("Oblíquos", 70, 45, 30, 8, 42, 30) },
    fases: [
      { nome: "Montagem", descricao: "Deitado de lado, cotovelo sob o ombro, pés empilhados, joelhos estendidos." },
      { nome: "Sustentação", descricao: "Sobe a bacia até o corpo formar uma linha reta e mantém, respirando normalmente." },
      { nome: "Saída", descricao: "Desce a bacia controlada até o chão, sem deixar cair." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 48,
        titulo: "A bacia é o placar",
        camadas: {
          resumo: "Quando a bacia começa a descer, a série acabou, não importa o cronômetro.",
          biomecanica:
            "A prancha lateral resiste à flexão lateral da coluna. O oblíquo e o quadrado lombar do lado de baixo sustentam a bacia, e o glúteo médio do mesmo lado entra porque o quadril também está suspenso.",
          fisiologia:
            "É trabalho isométrico de resistência. O critério de progressão é o tempo com a linha mantida, não o tempo total até desabar.",
          evidencia:
            "McGill descreve a prancha lateral como um dos exercícios de maior estabilidade de tronco com menor carga de compressão sobre a coluna, o que a torna adequada em histórico de dor lombar.",
          cuidados: "Ombro do apoio doendo é sinal de escápula solta, e aí a versão com joelhos apoiados é a certa.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Quando o plano precisa de core que não seja anti-extensão, que é o que a prancha frontal já faz.",
        "Aluno com histórico de dor lombar que tolera apoio no antebraço.",
        "Junto com trabalho de glúteo médio, porque os dois se somam nesta posição.",
      ],
      quandoEvitar: [
        "Ombro sensível que dói ao sustentar o peso no antebraço.",
        "Aluno com dificuldade de descer ao chão e levantar sozinho.",
      ],
      errosComuns: [
        "Deixar a bacia descer devagar e continuar contando o tempo.",
        "Girar o tronco para frente e transformar em prancha frontal torta.",
        "Prender a respiração durante toda a sustentação.",
      ],
      variacoes: [
        "Com joelhos apoiados: reduz o braço de alavanca pela metade.",
        "Com o braço de cima estendido para o teto: aumenta a exigência de controle.",
        "Com elevação do quadril repetida: versão dinâmica, mais difícil.",
      ],
    },
    conteudo: {
      visaoGeral:
        "Fecha o buraco mais evidente do core no catálogo. Prancha frontal e dead bug treinam resistir à extensão; nada treinava resistir à flexão lateral, que é o padrão de quem carrega peso de um lado só e de quem tem dor lombar unilateral.",
      biomecanica:
        "Com o corpo suspenso entre o antebraço e o pé, a gravidade tenta dobrar o tronco para baixo. Os oblíquos e o quadrado lombar do lado de apoio impedem, e o glúteo médio sustenta a bacia, que é o mesmo trabalho da caminhada lateral em outra posição.",
      fisiologia:
        "Isometria de resistência: o ganho é a capacidade de manter a posição, e a progressão é por tempo e por braço de alavanca, não por carga externa.",
      prescricaoPratica:
        "Em geral, 3 séries de 15 a 40 s por lado, com respiração contínua. Progrida dos joelhos apoiados para as pernas estendidas antes de aumentar o tempo, porque tempo longo em posição ruim não treina nada.",
    },
    trustLevel: "princípio biomecânico",
    temCena: false,
  },

  {
    id: "e47",
    slug: "prancha-apoio-banco",
    nome: "Prancha com apoio no banco",
    grupoMuscular: "Core (tronco)",
    equipamento: "Peso corporal",
    objetivo: ["Resistência muscular", "Retorno ao treino", "Aprendizado técnico"],
    nivel: "Iniciante",
    articulacaoPredominante: "Coluna (isometria)",
    premium: false,
    resumoPratico:
      "A prancha com as mãos num banco ou numa bancada: mesmo trabalho de core, sem precisar descer ao chão nem levantar dele.",
    anguloArticular: "Coluna neutra, tronco inclinado conforme a altura do apoio",
    imagem: "/exercises/prancha-apoio-banco.webp",
    imagemAnalise: "/exercises/prancha-apoio-banco-analysis.webp",
    modalidade: "m-funcional",
    ativacao: [
      { musculo: "Transverso do abdome", percentual: 45, papel: "primário" },
      { musculo: "Reto abdominal", percentual: 40, papel: "sinergista" },
      { musculo: "Oblíquos", percentual: 32, papel: "sinergista" },
      { musculo: "Eretores da espinha", percentual: 25, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 74, metrics: m("Transverso do abdome", 45, 20, 22, 8, 30, 15) },
    fases: [
      { nome: "Montagem", descricao: "Mãos no banco na largura dos ombros, pés recuados até o corpo formar uma linha." },
      { nome: "Sustentação", descricao: "Mantém a posição com o abdômen firme e a bacia levemente encaixada, respirando." },
      { nome: "Saída", descricao: "Caminha com os pés para frente até ficar em pé, sem desfazer a posição de uma vez." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 45,
        titulo: "A altura do apoio é a carga",
        camadas: {
          resumo: "Quanto mais alto o apoio, mais fácil. É assim que se regula a dificuldade.",
          biomecanica:
            "Elevar as mãos reduz a parcela do peso do corpo que o core precisa sustentar. Do chão até uma bancada alta existe uma escala contínua, o que dispensa qualquer equipamento de carga.",
          fisiologia:
            "O trabalho continua sendo anti-extensão: impedir a lombar de arquear enquanto o quadril tende a cair.",
          evidencia:
            "McGill descreve a prancha como exercício de resistência de tronco com baixa carga de compressão, e a versão inclinada preserva o padrão com menos exigência.",
          cuidados: "Se a lombar arqueia, subir o apoio resolve na hora.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Aluno com obesidade ou dificuldade de descer ao chão e levantar.",
        "Retorno ao treino, quando a prancha no chão ainda é dura demais.",
        "Treino em casa usando a bancada da cozinha como apoio.",
      ],
      quandoEvitar: [
        "Punho sensível sem apoio adaptado.",
        "Apoio instável, que transforma o exercício em risco de queda.",
      ],
      errosComuns: [
        "Deixar a lombar arquear e continuar contando o tempo.",
        "Subir a bacia para o alto e transformar em posição de descanso.",
        "Prender a respiração durante toda a sustentação.",
      ],
      variacoes: [
        "Apoio mais alto: regressão imediata para quem está começando.",
        "Apoio mais baixo: progressão sem mudar nada além do móvel.",
        "Com um pé fora do chão alternando: acrescenta o componente antirrotação.",
      ],
    },
    conteudo: {
      visaoGeral:
        "Resolve o problema apontado pela cobertura por condição: quem tem dificuldade de ir ao chão perdia o core inteiro do catálogo de uma vez. Aqui o padrão é o mesmo da prancha frontal, e a única diferença é a altura das mãos.",
      biomecanica:
        "Com as mãos elevadas, o tronco fica inclinado e parte do peso vai para os pés. A exigência de impedir a lombar de arquear continua, com intensidade proporcional à inclinação.",
      fisiologia:
        "Isometria de resistência, com a mesma lógica de progressão da prancha do chão: primeiro a posição, depois o tempo, depois a alavanca.",
      prescricaoPratica:
        "Em geral, 3 séries de 20 a 40 s. Escolha a altura em que o aluno mantenha a linha o tempo todo e baixe o apoio quando 40 s ficarem confortáveis.",
    },
    trustLevel: "regra pedagógica",
    temCena: false,
  },

  {
    id: "e48",
    slug: "pallof-press-polia",
    nome: "Pallof press na polia",
    grupoMuscular: "Core (tronco)",
    equipamento: "Polia",
    objetivo: ["Resistência muscular", "Força", "Aprendizado técnico"],
    nivel: "Intermediário",
    articulacaoPredominante: "Coluna (antirrotação)",
    premium: false,
    resumoPratico:
      "Empurrar a polia à frente do peito enquanto ela puxa para o lado: o core trabalha impedindo a rotação, em pé e sem carga sobre a coluna.",
    anguloArticular: "Coluna neutra, ombros a 90 graus na extensão dos braços",
    imagem: "/exercises/pallof-press-polia.webp",
    imagemAnalise: "/exercises/pallof-press-polia-analysis.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Oblíquos", percentual: 55, papel: "primário" },
      { musculo: "Transverso do abdome", percentual: 45, papel: "sinergista" },
      { musculo: "Reto abdominal", percentual: 35, papel: "sinergista" },
      { musculo: "Glúteo médio", percentual: 25, papel: "estabilizador" },
      { musculo: "Deltoide anterior", percentual: 22, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 82, metrics: m("Oblíquos", 55, 35, 18, 10, 25, 20) },
    fases: [
      { nome: "Posição", descricao: "Em pé de lado para a polia, pés na largura dos ombros, mãos juntas no peito." },
      { nome: "Extensão", descricao: "Estende os braços à frente do peito enquanto o cabo puxa para o lado, sem girar o tronco." },
      { nome: "Retorno", descricao: "Traz as mãos de volta ao peito devagar, mantendo os pés e a bacia parados." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 44,
        titulo: "O trabalho é não girar",
        camadas: {
          resumo: "O core aqui é medido pelo que ele impede, não pelo que ele move.",
          biomecanica:
            "Com os braços estendidos, o cabo cria um momento de rotação sobre o tronco. Os oblíquos e o transverso resistem, e por isso a carga certa é a maior que o aluno segura sem girar nem um grau.",
          fisiologia:
            "É trabalho antirrotação em pé, que é o padrão que falta na maioria dos programas: quase todo core de academia é feito deitado.",
          evidencia:
            "McGill defende exercícios que treinam o tronco a resistir ao movimento, em vez de produzi-lo, especialmente em histórico de dor lombar.",
          cuidados: "Se o pé de trás desliza ou o ombro recua, a carga está alta.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Quando o plano precisa de core em pé, sem descer ao chão.",
        "Aluno com dor lombar, porque o padrão antirrotação carrega pouco a coluna.",
        "Progressão de carga real de core, que a prancha não oferece.",
      ],
      quandoEvitar: [
        "Ombro sensível que não tolera manter os braços estendidos à frente.",
        "Aluno que ainda não mantém a bacia parada nas versões sem carga.",
      ],
      errosComuns: [
        "Girar o tronco junto com o cabo e chamar isso de repetição.",
        "Empurrar com os braços em vez de resistir com o tronco.",
        "Aumentar carga antes de o tronco ficar imóvel na carga atual.",
      ],
      variacoes: [
        "Ajoelhado: tira a compensação de quadril e isola mais o tronco.",
        "Com pausa de 3 s estendido: aumenta muito a exigência sem subir carga.",
        "Meio ajoelhado: acrescenta exigência de estabilidade do quadril.",
      ],
    },
    conteudo: {
      visaoGeral:
        "Introduz no catálogo o padrão antirrotação, que não existia. É o exercício de core que mais se parece com a vida real, porque quase todo esforço do dia a dia pede que o tronco resista a girar enquanto os braços trabalham.",
      biomecanica:
        "A distância entre as mãos e o corpo define o braço de alavanca: quanto mais estendidos os braços, maior o momento de rotação que o tronco precisa anular. É por isso que a versão com pausa no fim é tão mais difícil.",
      fisiologia:
        "Trabalho de resistência com carga progressiva. Diferente da prancha, aqui dá para subir carga de verdade, o que faz dele o degrau seguinte quando as isometrias ficam fáceis.",
      prescricaoPratica:
        "Em geral, 3 séries de 8 a 12 repetições por lado com pausa de 2 s na extensão. A carga certa é a maior em que o tronco não gira, e não a maior que o aluno consegue empurrar.",
    },
    trustLevel: "princípio biomecânico",
    temCena: false,
  },

  {
    id: "e49",
    slug: "pallof-press-elastico",
    nome: "Pallof press com elástico",
    grupoMuscular: "Core (tronco)",
    equipamento: "Elástico",
    objetivo: ["Resistência muscular", "Retorno ao treino", "Aprendizado técnico"],
    nivel: "Iniciante",
    articulacaoPredominante: "Coluna (antirrotação)",
    premium: false,
    resumoPratico:
      "O mesmo padrão antirrotação da polia, com um elástico preso numa maçaneta: core em pé para quem treina em casa.",
    anguloArticular: "Coluna neutra, ombros a 90 graus na extensão dos braços",
    imagem: "/exercises/pallof-press-elastico.webp",
    imagemAnalise: "/exercises/pallof-press-elastico-analysis.webp",
    modalidade: "m-funcional",
    ativacao: [
      { musculo: "Oblíquos", percentual: 48, papel: "primário" },
      { musculo: "Transverso do abdome", percentual: 42, papel: "sinergista" },
      { musculo: "Reto abdominal", percentual: 30, papel: "sinergista" },
      { musculo: "Glúteo médio", percentual: 22, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 76, metrics: m("Oblíquos", 48, 30, 16, 10, 22, 18) },
    fases: [
      { nome: "Posição", descricao: "Em pé de lado para a fixação, elástico na altura do peito, mãos juntas no esterno." },
      { nome: "Extensão", descricao: "Estende os braços à frente sem deixar o tronco girar na direção da fixação." },
      { nome: "Retorno", descricao: "Traz as mãos de volta ao peito devagar, sem soltar a tensão de uma vez." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 44,
        titulo: "A distância regula a carga",
        camadas: {
          resumo: "Afastar-se da fixação aumenta a tensão sem trocar de elástico.",
          biomecanica:
            "O elástico dá resistência crescente: quanto mais esticado, mais ele puxa. Isso torna a parte final do movimento, que é a mais exigente para o tronco, também a mais carregada.",
          fisiologia:
            "Mesmo padrão antirrotação da polia, com progressão contínua em vez de degraus de placa.",
          evidencia:
            "McGill defende exercícios que treinam o tronco a resistir ao movimento, em vez de produzi-lo, especialmente em histórico de dor lombar.",
          cuidados: "Fixação na maçaneta precisa ser conferida antes de cada série.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Treino em casa que precisa de core em pé.",
        "Retorno ao treino, como primeira exposição ao padrão antirrotação.",
        "Aquecimento antes de agachamento e de levantamento terra.",
      ],
      quandoEvitar: [
        "Fixação instável, que solta no meio da série.",
        "Ombro sensível que não tolera os braços estendidos à frente.",
      ],
      errosComuns: [
        "Girar o tronco na direção do elástico durante a extensão.",
        "Ficar perto demais da fixação, o que deixa o exercício sem tensão.",
        "Soltar o retorno de uma vez em vez de controlar.",
      ],
      variacoes: [
        "Ajoelhado: tira a compensação do quadril.",
        "Com pausa de 3 s estendido: mais difícil sem trocar de elástico.",
        "Um passo mais longe da fixação: progressão contínua de carga.",
      ],
    },
    conteudo: {
      visaoGeral:
        "É a versão do Pallof press para quem não tem polia, e o elástico é o equipamento de quem treina em casa, que é justamente o aluno de retorno ao treino e o de pós-parto.",
      biomecanica:
        "A resistência do elástico cresce com o alongamento, o que casa bem com este movimento: a posição de braços estendidos, que é a mais exigente para o tronco, coincide com o ponto de maior tensão.",
      fisiologia:
        "Trabalho antirrotação de resistência. A progressão é por distância da fixação, por espessura do elástico e por tempo de pausa, nessa ordem.",
      prescricaoPratica:
        "Em geral, 2 a 3 séries de 10 a 15 repetições por lado com pausa de 2 s. Afaste-se um passo da fixação antes de trocar por um elástico mais grosso.",
    },
    trustLevel: "princípio biomecânico",
    temCena: false,
  },

  {
    id: "e50",
    slug: "chop-elastico",
    nome: "Rotação de tronco com elástico",
    grupoMuscular: "Core (tronco)",
    equipamento: "Elástico",
    objetivo: ["Resistência muscular", "Força"],
    nivel: "Intermediário",
    articulacaoPredominante: "Coluna e quadril",
    premium: false,
    resumoPratico:
      "Levar as mãos na diagonal, de cima para baixo, girando pelo quadril: o padrão de rotação controlada, em pé, que faltava ao lado dos antirrotação.",
    anguloArticular: "Rotação de tronco e quadril, coluna sem flexão",
imagem: "/exercises/chop-elastico.webp",
    imagemAnalise: "/exercises/chop-elastico-analysis.webp",
    modalidade: "m-funcional",
    ativacao: [
      { musculo: "Oblíquos", percentual: 58, papel: "primário" },
      { musculo: "Transverso do abdome", percentual: 42, papel: "sinergista" },
      { musculo: "Latíssimo do dorso", percentual: 35, papel: "sinergista" },
      { musculo: "Deltoide anterior", percentual: 30, papel: "estabilizador" },
      { musculo: "Glúteo máximo", percentual: 25, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 75, metrics: m("Oblíquos", 58, 42, 28, 12, 28, 32) },
    fases: [
      { nome: "Posição", descricao: "Em pé, elástico preso alto de um lado, mãos juntas na altura do ombro oposto." },
      { nome: "Diagonal", descricao: "Leva as mãos na diagonal até a altura do quadril do lado contrário, girando pelo quadril." },
      { nome: "Retorno", descricao: "Volta pelo mesmo caminho controlando a tração, sem deixar o elástico puxar." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 46,
        titulo: "Gira o quadril, não a lombar",
        camadas: {
          resumo: "Os pés giram junto: a lombar não é feita para rodar muito.",
          biomecanica:
            "A coluna lombar tem pouca amplitude de rotação. O giro precisa vir do quadril e da coluna torácica, e os pés acompanhando o movimento são o que garante isso na prática.",
          fisiologia:
            "É o único padrão do lote que produz rotação em vez de resistir a ela, e por isso pede mais controle e menos carga.",
          evidencia:
            "McGill alerta para o custo da rotação lombar repetida sob carga, e recomenda que a rotação venha do quadril com o tronco firme.",
          cuidados: "Em dor lombar aguda, prefira os Pallof press antes deste.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Quando o aluno já domina os antirrotação e o plano pede variedade.",
        "Preparação para esportes e trabalhos com giro de tronco.",
        "Complemento de core em pé, sem descer ao chão.",
      ],
      quandoEvitar: [
        "Dor lombar aguda ou em fase de irritação.",
        "Aluno que ainda gira a lombar em vez do quadril.",
      ],
      errosComuns: [
        "Girar pela lombar com os pés fixos no chão.",
        "Dobrar o tronco para frente no fim da diagonal.",
        "Usar elástico grosso e transformar o movimento em impulso de braço.",
      ],
      variacoes: [
        "De baixo para cima: mesmo padrão na diagonal inversa.",
        "Ajoelhado: reduz a participação do quadril e isola o tronco.",
        "Com pausa de 2 s no fim: mais controle, menos velocidade.",
      ],
    },
    conteudo: {
      visaoGeral:
        "Completa o conjunto de core em pé: com ele, o catálogo passa a ter anti-extensão, anti-flexão lateral, antirrotação e rotação controlada, que são os quatro padrões de tronco.",
      biomecanica:
        "A diagonal de cima para baixo combina rotação e extensão de ombro, com os oblíquos produzindo o giro e o latíssimo acompanhando o trajeto do braço. O giro precisa vir do quadril, com os pés pivotando.",
      fisiologia:
        "Trabalho dinâmico com carga leve e velocidade controlada. O objetivo é qualidade do padrão, e por isso a progressão é por amplitude e controle antes de ser por tensão.",
      prescricaoPratica:
        "Em geral, 2 a 3 séries de 10 a 12 repetições por lado com elástico leve. Se a lombar for quem gira, volte para o Pallof press até o padrão de quadril aparecer.",
    },
    trustLevel: "cuidado de segurança",
    temCena: false,
  },

  {
    id: "e51",
    slug: "bird-dog",
    nome: "Bird dog em quatro apoios",
    grupoMuscular: "Core (tronco)",
    equipamento: "Peso corporal",
    objetivo: ["Aprendizado técnico", "Retorno ao treino", "Resistência muscular"],
    nivel: "Iniciante",
    articulacaoPredominante: "Coluna e quadril",
    premium: false,
    resumoPratico:
      "Estender braço e perna opostos em quatro apoios sem deixar a bacia girar: o par do dead bug pela cadeia posterior, com custo mínimo para a coluna.",
    anguloArticular: "Coluna neutra, quadril e ombro em extensão",
    imagem: "/exercises/bird-dog.webp",
    imagemAnalise: "/exercises/bird-dog-analysis.webp",
    modalidade: "m-funcional",
    ativacao: [
      { musculo: "Eretores da espinha", percentual: 40, papel: "primário" },
      { musculo: "Glúteo máximo", percentual: 35, papel: "sinergista" },
      { musculo: "Transverso do abdome", percentual: 32, papel: "sinergista" },
      { musculo: "Trapézio inferior", percentual: 25, papel: "estabilizador" },
      { musculo: "Oblíquos", percentual: 22, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 77, metrics: m("Eretores da espinha", 40, 28, 15, 10, 20, 25) },
    fases: [
      { nome: "Montagem", descricao: "Quatro apoios, mãos sob os ombros e joelhos sob os quadris, coluna neutra." },
      { nome: "Extensão", descricao: "Estende um braço e a perna oposta até a altura do tronco, sem girar a bacia." },
      { nome: "Retorno", descricao: "Traz os dois de volta devagar, tocando o chão antes da próxima repetição." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 42,
        titulo: "Um copo de água nas costas",
        camadas: {
          resumo: "A imagem clássica: a lombar deveria equilibrar um copo sem derramar.",
          biomecanica:
            "Levantar braço e perna opostos cria uma tendência de girar a bacia e de arquear a lombar. O trabalho é anular as duas, com o tronco imóvel enquanto os membros se movem.",
          fisiologia:
            "É um dos exercícios de tronco com melhor relação entre estímulo de estabilização e carga de compressão sobre a coluna.",
          evidencia:
            "Ekstrom e colaboradores mediram core, quadril e coxa em 9 exercícios de reabilitação, entre eles o quatro apoios com elevação de braço e perna, e McGill o descreve como parte da tríade de baixa carga.",
          cuidados: "Joelho sensível pede um tapete dobrado, não a retirada do exercício.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Aprendizado do controle de tronco em quem tem dor lombar.",
        "Complemento do dead bug, para cobrir a cadeia posterior.",
        "Aquecimento antes de levantamento terra e de agachamento.",
      ],
      quandoEvitar: [
        "Aluno com dificuldade de descer ao chão e levantar sozinho.",
        "Punho sensível sem apoio adaptado.",
      ],
      errosComuns: [
        "Girar a bacia junto com a perna que sobe.",
        "Subir a perna acima da linha do tronco e arquear a lombar.",
        "Fazer rápido, transformando controle em balanço.",
      ],
      variacoes: [
        "Só o braço: primeira etapa para quem ainda gira a bacia.",
        "Só a perna: segunda etapa, antes de juntar os dois.",
        "Com pausa de 3 s estendido: aumenta a exigência sem acrescentar carga.",
      ],
    },
    conteudo: {
      visaoGeral:
        "O catálogo tinha o dead bug, que trabalha deitado de costas, e nada equivalente pela cadeia posterior. O bird dog fecha esse par e é um dos exercícios de tronco mais citados em programas de dor lombar.",
      biomecanica:
        "Em quatro apoios, tirar um braço e a perna oposta do chão deixa o corpo apoiado em dois pontos diagonais. Os eretores impedem a lombar de arquear, o glúteo estende o quadril e os oblíquos impedem a bacia de rodar.",
      fisiologia:
        "Trabalho de resistência e de controle motor, com carga baixa. O valor está na qualidade do padrão, e é por isso que a progressão passa por dividir o movimento antes de juntá-lo.",
      prescricaoPratica:
        "Em geral, 2 a 3 séries de 8 a 12 repetições lentas por lado, com pausa de 2 s na extensão. Se a bacia gira, volte a treinar só o braço ou só a perna até parar de girar.",
    },
    trustLevel: "princípio biomecânico",
    temCena: false,
  },

  {
    id: "e52",
    slug: "elevacao-joelhos-suspenso",
    nome: "Elevação de joelhos suspenso",
    grupoMuscular: "Core (tronco)",
    equipamento: "Peso corporal",
    objetivo: ["Hipertrofia", "Força", "Resistência muscular"],
    nivel: "Avançado",
    articulacaoPredominante: "Quadril e coluna",
    premium: false,
    resumoPratico:
      "Pendurado na barra, subir os joelhos na direção do peito: a progressão de core mais exigente do catálogo, que ainda treina a pegada.",
    anguloArticular: "Flexão de quadril até cerca de 90 graus, coluna sem hiperextensão",
    imagem: "/exercises/elevacao-joelhos-suspenso.webp",
    imagemAnalise: "/exercises/elevacao-joelhos-suspenso-analysis.webp",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Reto abdominal", percentual: 65, papel: "primário" },
      { musculo: "Iliopsoas", percentual: 55, papel: "sinergista" },
      { musculo: "Oblíquos", percentual: 45, papel: "sinergista" },
      { musculo: "Flexores do punho", percentual: 35, papel: "estabilizador" },
      { musculo: "Latíssimo do dorso", percentual: 30, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 78, metrics: m("Reto abdominal", 65, 55, 35, 8, 55, 40) },
    fases: [
      { nome: "Suspensão", descricao: "Pendurado na barra com pegada na largura dos ombros, ombros ativos e corpo parado." },
      { nome: "Subida", descricao: "Traz os joelhos na direção do peito enrolando a bacia, sem balançar." },
      { nome: "Descida", descricao: "Desce em 3 segundos até as pernas estendidas, sem deixar o corpo oscilar." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 40,
        titulo: "Enrolar a bacia é o que faz o abdômen trabalhar",
        camadas: {
          resumo: "Subir o joelho sem enrolar a bacia é trabalho de flexor de quadril, não de abdômen.",
          biomecanica:
            "O reto abdominal aproxima a bacia das costelas. Se a bacia fica parada e só o fêmur sobe, quem produz o movimento é o iliopsoas, e o abdômen apenas segura a posição.",
          fisiologia:
            "A suspensão acrescenta demanda de pegada e de cintura escapular, que é um efeito colateral bem-vindo em um catálogo sem exercício de preensão.",
          evidencia:
            "McGill descreve a hierarquia de exercícios de tronco por carga de compressão sobre a coluna, e as versões suspensas ficam no topo, o que as coloca como progressão e não como ponto de partida.",
          cuidados: "Balançar o corpo transfere o trabalho para o impulso e aumenta a carga na lombar.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Aluno avançado cujo core já não é desafiado por prancha nem por Pallof press.",
        "Quando se quer core e pegada no mesmo exercício.",
        "Progressão final da linha de core do plano.",
      ],
      quandoEvitar: [
        "Ombro sensível que dói na suspensão, mesmo sem elevar as pernas.",
        "Dor lombar em fase de irritação.",
        "Aluno que ainda não sustenta a barra por 20 s.",
      ],
      errosComuns: [
        "Balançar o corpo e subir os joelhos no impulso.",
        "Subir o joelho sem enrolar a bacia, deixando o trabalho para o flexor de quadril.",
        "Descer as pernas de uma vez, o que puxa a lombar para a hiperextensão.",
      ],
      variacoes: [
        "Com apoio de costas no aparelho: tira o balanço e a exigência de pegada.",
        "Joelhos dobrados: braço de alavanca menor, primeira etapa.",
        "Pernas estendidas: progressão final, muito mais exigente.",
      ],
    },
    conteudo: {
      visaoGeral:
        "É o teto da linha de core do catálogo. Existe porque um plano de 12 semanas precisa ter para onde progredir, e prancha por mais tempo não é progressão de verdade.",
      biomecanica:
        "Suspenso, o corpo inteiro é a carga. A subida combina flexão de quadril, produzida pelo iliopsoas, com retroversão da bacia, produzida pelo reto abdominal. É a segunda parte que separa o exercício de abdômen do exercício de flexor de quadril.",
      fisiologia:
        "Além do tronco, a suspensão exige preensão sustentada, que costuma ser o fator limitante antes do abdômen nas primeiras semanas. Isso não é defeito: é a única exposição de pegada que o catálogo tem nesta fase.",
      prescricaoPratica:
        "Em geral, 3 séries de 8 a 12 repetições com descida de 3 s. Comece com joelhos dobrados e só estenda as pernas quando 12 repetições saírem sem balanço nenhum.",
    },
    trustLevel: "cuidado de segurança",
    temCena: false,
  },
];
