/**
 * SETE EXERCÍCIOS QUE O MOTOR PEDIA E O CATÁLOGO NÃO TINHA (09/09/2026).
 *
 * A bancada de buracos (hoje o terceiro bloco do `check:padroes`: objetivo x 23 condições x
 * conjuntos de equipamento, nível Iniciante) mediu o pool de cada PADRÃO DE MOVIMENTO depois
 * dos filtros de condição, e não só por família. O resultado que decidiu este arquivo:
 *
 *   padrão SEM candidato ........ 18 combinações, todas de QUADRIL, todas só com o peso do
 *                                  corpo, em obesidade grau 2 e 3 e idoso destreinado
 *   padrão com candidato ÚNICO .. 310 combinações (quadril 144, puxar 144, core 22), quase
 *                                  todas só com o peso do corpo
 *   plano gerado SEM o padrão ... 24 semanas sem nenhuma dobradiça de quadril, em obesidade,
 *                                  idoso e gestante treinando em casa
 *
 * A causa é uma só e é estrutural: o único dominante de quadril com o peso do corpo era a
 * ponte de glúteos, que COMEÇA NO CHÃO. Quem tem dificuldade para deitar e levantar do chão
 * (obesidade grau 2 e 3, idoso destreinado) recebe essa restrição da própria condição, então
 * a ponte sai da lista, e o padrão fica vazio. O mesmo vale para o tronco: prancha, dead bug e
 * bird dog vão ao chão, e a gestante ainda evita a posição deitada. Sobrava a prancha no
 * banco, sozinha. E para puxar em casa sobrava a remada invertida com apoio alto, também
 * sozinha, então toda semana repetia o mesmo exercício.
 *
 * Os seis primeiros fecham esses buracos SEM ir ao chão: dois de quadril em pé, um de quadril
 * com apoio no banco, dois de tronco (sentado e em pé) e um de puxar. O sétimo é o treino do
 * assoalho pélvico, que a regra do pós-parto já declarava como "parte do plano" desde a
 * metanálise `lu-assoalho-2020` e que não existia como exercício: a regra prometia e o plano
 * não entregava. Ele entra por INDICAÇÃO da condição (ver GroupGpsRule.assoalhoPelvico), no
 * mesmo desenho do bloco de equilíbrio, e nunca pela fila de mérito.
 *
 * ## Sobre os números de ativação
 *
 * Os exercícios de quadril e de puxar têm EMG publicada para o padrão (ponte e hip thrust em
 * `contreras-2015` e `ekstrom-2007`; extensão de quadril em `distefano-2009`; remada em
 * `boeckh-behrens-2000`), e os valores seguem a ordem que essas fontes mostram. Os de tronco
 * e o do assoalho pélvico seguem a convenção que `respiracao-360` e `equilibrio-unipodal` já
 * usam: ordem pedagógica do que trabalha mais, com `trustLevel` "regra pedagógica", e não
 * medição. A ativação aqui é relativa ao próprio músculo, como em todo o catálogo.
 *
 * ## Sobre as imagens
 *
 * As 21 imagens (foto de execução, camada de análise e boneco posado) saíram no mesmo dia por
 * img2img no Lovable (projeto pi-fotos-k), cada uma a partir da foto ou do boneco do
 * exercício-primo já aprovado, e foram conferidas uma a uma antes de entrar. Duas ressalvas
 * registradas: a prancha na parede saiu na versão com as MÃOS na parede (o gerador não
 * dobrou os cotovelos em três tentativas), que é a primeira variação listada e a mais fácil, e
 * o texto das fases diz "mãos ou antebraços"; e o boneco da elevação de quadril precisou de
 * sete tentativas, porque o gerador insistia em deixar o quadril caído abaixo da linha do
 * banco. O que fechou foi trocar a SEMENTE (ponte no chão, que já tem o quadril no alto) em
 * vez de insistir no prompt, como a skill imagens-lovable já registrava.
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

export const exerciciosLacunas: Exercise[] = [
  /* ---------------------- ELEVAÇÃO DE QUADRIL COM APOIO NO BANCO ---------------------- */
  {
    id: "lc1",
    slug: "elevacao-quadril-apoio-banco",
    imagem: "/exercises/elevacao-quadril-apoio-banco.webp",
    imagemAnalise: "/exercises/elevacao-quadril-apoio-banco-analysis.webp",
    nome: "Elevação de quadril com apoio no banco (peso do corpo)",
    grupoMuscular: "Membros inferiores",
    equipamento: "Peso corporal",
    objetivo: ["Retorno ao treino", "Hipertrofia", "Força", "Emagrecimento", "Resistência muscular", "Aprendizado técnico"],
    nivel: "Iniciante",
    articulacaoPredominante: "Quadril",
    premium: false,
    resumoPratico:
      "A ponte de glúteos sem ir ao chão: costas apoiadas na borda de um banco, sofá ou cama firme, pés no chão, e o quadril sobe até o tronco ficar reto. É a dobradiça de quadril de quem não pode deitar no solo.",
    anguloArticular: "Extensão de quadril de cerca de 90 graus até a linha neutra",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Glúteo máximo", percentual: 70, papel: "primário" },
      { musculo: "Isquiotibiais", percentual: 45, papel: "sinergista" },
      { musculo: "Eretores da espinha", percentual: 25, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 78, metrics: m("Glúteo máximo", 70, 20, 15, 10, 0, 15) },
    fases: [
      { nome: "Posição", descricao: "Sentado à frente do banco, com a borda apoiada logo abaixo das escápulas, pés afastados na largura do quadril e joelhos dobrados." },
      { nome: "Subida", descricao: "Empurra o chão com os calcanhares e sobe o quadril até coxa e tronco ficarem na mesma linha, queixo recolhido." },
      { nome: "Descida", descricao: "Desce o quadril devagar até quase tocar o chão, sem perder o apoio das costas no banco." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 55,
        titulo: "Subir até a linha, e não além dela",
        camadas: {
          resumo: "O fim do movimento é coxa e tronco alinhados. Passar disso arqueia a lombar e tira o trabalho do glúteo.",
          biomecanica:
            "Com o apoio nas escápulas, o quadril descreve um arco maior que na ponte no solo, e o glúteo trabalha em amplitude completa até a extensão neutra.",
          fisiologia: "A extensão de quadril contra o peso do tronco e das pernas é a demanda que o glúteo máximo responde melhor.",
          evidencia: "A elevação de quadril com apoio elevado ativou mais o glúteo máximo e os isquiotibiais do que o agachamento no comparativo de EMG.",
          cuidados: "Queixo recolhido e olhar para os joelhos: pescoço em extensão no topo é o erro que mais aparece.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Aluno que não pode ou não consegue deitar e levantar do chão e precisa do padrão de dobradiça de quadril.",
        "Iniciante em casa, sem carga externa, para ensinar a extensão de quadril.",
        "Progressão natural para o hip thrust com barra.",
      ],
      quandoEvitar: [
        "Sem um apoio firme: sofá que afunda ou banco que desliza não servem.",
        "Dor lombar que aparece no topo do movimento e não some ao reduzir a amplitude.",
      ],
      errosComuns: [
        "Passar da linha neutra e arquear a lombar no topo.",
        "Empurrar com a ponta dos pés em vez do calcanhar, transferindo o trabalho para a panturrilha.",
        "Deixar os joelhos caírem para dentro na subida.",
      ],
      variacoes: [
        "Com pausa de 2 s no topo: mais tempo de tensão sem carga externa.",
        "Um pé só: progressão para o hip thrust unilateral.",
        "Com uma mochila ou halter sobre o quadril: primeira carga externa.",
      ],
    },
    conteudo: {
      visaoGeral:
        "Tira a ponte de glúteos do chão. As costas ficam apoiadas num banco ou sofá, e o quadril trabalha em amplitude maior que no solo, sem exigir deitar nem levantar.",
      biomecanica:
        "O glúteo máximo é o motor da extensão de quadril, com os isquiotibiais ajudando. Os eretores da espinha só estabilizam a coluna, e é isso que a regra de parar na linha neutra protege.",
      fisiologia:
        "Sem carga externa o estímulo vem da amplitude, da pausa no topo e do controle da descida. Por isso ele escala do iniciante à primeira carga com uma mochila.",
      prescricaoPratica:
        "Use a faixa de repetições do objetivo. Progrida primeiro com a pausa no topo, depois com um pé só, e só então com carga sobre o quadril.",
    },
    trustLevel: "princípio biomecânico",
    temCena: false,
    restricaoPerfil: { posicao: "sentado", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: true, flexaoColunaCarregada: false, membrosAcimaDoCoracao: false },
  },

  /* ---------------------- DOBRADIÇA DE QUADRIL EM PÉ ---------------------- */
  {
    id: "lc2",
    slug: "dobradica-quadril-peso-corpo",
    imagem: "/exercises/dobradica-quadril-peso-corpo.webp",
    imagemAnalise: "/exercises/dobradica-quadril-peso-corpo-analysis.webp",
    nome: "Dobradiça de quadril em pé (peso do corpo)",
    grupoMuscular: "Membros inferiores",
    equipamento: "Peso corporal",
    objetivo: ["Aprendizado técnico", "Retorno ao treino", "Resistência muscular", "Emagrecimento"],
    nivel: "Iniciante",
    articulacaoPredominante: "Quadril",
    premium: false,
    resumoPratico:
      "O levantamento terra romeno sem barra: em pé, joelhos levemente dobrados, o quadril vai para trás e o tronco inclina com a coluna reta até sentir a parte de trás da coxa esticar. É onde se aprende a dobrar pelo quadril, e não pela lombar.",
    anguloArticular: "Flexão de quadril até cerca de 45 a 70 graus de inclinação do tronco, joelhos em leve flexão",
    modalidade: "m-funcional",
    ativacao: [
      { musculo: "Isquiotibiais", percentual: 55, papel: "primário" },
      { musculo: "Glúteo máximo", percentual: 50, papel: "sinergista" },
      { musculo: "Eretores da espinha", percentual: 35, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 72, metrics: m("Isquiotibiais", 55, 35, 30, 5, 0, 30) },
    fases: [
      { nome: "Posição", descricao: "Em pé, pés na largura do quadril, joelhos levemente dobrados, mãos nas coxas ou um cabo de vassoura encostado na cabeça, nas costas e no sacro." },
      { nome: "Descida", descricao: "Leva o quadril para trás e inclina o tronco com a coluna reta, deslizando as mãos pelas coxas até sentir a parte de trás da coxa esticar." },
      { nome: "Subida", descricao: "Empurra o quadril para a frente e volta a ficar em pé, sem hiperestender no fim." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 50,
        titulo: "O quadril vai para trás, a coluna não muda",
        camadas: {
          resumo: "O movimento é do quadril. Se as costas arredondam, o exercício virou flexão de coluna.",
          biomecanica:
            "Com os joelhos quase estendidos, a inclinação do tronco alonga os isquiotibiais sob tensão, e são eles e o glúteo que trazem o tronco de volta.",
          fisiologia: "É exercício de aprendizado motor antes de ser exercício de força: o padrão que ele ensina é o mesmo do terra romeno e do terra com barra.",
          evidencia: "A dobradiça com coluna neutra é o padrão de extensão de quadril que a EMG dos exercícios de cadeia posterior descreve, com isquiotibiais e glúteo como motores.",
          cuidados: "Um cabo de vassoura tocando cabeça, costas e sacro o tempo todo é a forma mais simples de conferir a coluna.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Ensinar a dobradiça de quadril antes de qualquer terra ou dobradiça com carga.",
        "Aluno que treina em casa e precisa do padrão de quadril em pé, sem ir ao chão.",
        "Aquecimento específico para terra romeno e good morning.",
      ],
      quandoEvitar: [
        "Dor lombar que aparece na inclinação, mesmo com o cabo de vassoura mostrando a coluna reta.",
        "Tontura ao inclinar e levantar o tronco: reduza a amplitude ou troque pela elevação de quadril no banco.",
      ],
      errosComuns: [
        "Arredondar as costas em vez de levar o quadril para trás.",
        "Dobrar os joelhos demais e transformar o movimento num agachamento.",
        "Hiperestender a lombar no fim da subida.",
      ],
      variacoes: [
        "Com cabo de vassoura nas costas: versão de ensino, com feedback da coluna.",
        "Com uma perna só: progressão de equilíbrio e de carga.",
        "Com halter ou kettlebell nas mãos: vira o terra romeno.",
      ],
    },
    conteudo: {
      visaoGeral:
        "É o padrão de dobradiça de quadril na forma mais simples que existe: sem carga, em pé, com o quadril indo para trás e a coluna reta. Todo terra começa aqui.",
      biomecanica:
        "Os isquiotibiais e o glúteo máximo controlam a descida e produzem a subida. Os eretores da espinha mantêm a coluna neutra e não devem virar o motor do movimento.",
      fisiologia:
        "O estímulo principal é neuromuscular: aprender a separar o movimento de quadril do movimento de coluna. Sem carga, a resistência muscular vem de repetições e de pausa no ponto de alongamento.",
      prescricaoPratica:
        "Use a faixa de repetições do objetivo com o cabo de vassoura nas primeiras semanas. Progrida para uma perna só ou para o terra romeno com halter quando a coluna se mantiver reta em toda a série.",
    },
    trustLevel: "princípio biomecânico",
    temCena: false,
    restricaoPerfil: { posicao: "em pé", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: false, flexaoColunaCarregada: false, membrosAcimaDoCoracao: false },
  },

  /* ---------------------- EXTENSÃO DE QUADRIL EM PÉ COM APOIO ---------------------- */
  {
    id: "lc3",
    slug: "extensao-quadril-em-pe-apoio",
    imagem: "/exercises/extensao-quadril-em-pe-apoio.webp",
    imagemAnalise: "/exercises/extensao-quadril-em-pe-apoio-analysis.webp",
    nome: "Extensão de quadril em pé com apoio (peso do corpo)",
    grupoMuscular: "Membros inferiores",
    equipamento: "Peso corporal",
    objetivo: ["Retorno ao treino", "Resistência muscular", "Emagrecimento", "Aprendizado técnico"],
    nivel: "Iniciante",
    articulacaoPredominante: "Quadril",
    premium: false,
    resumoPratico:
      "Mãos no encosto de uma cadeira, tronco reto, uma perna leva o calcanhar para trás sem inclinar o corpo. É o exercício de glúteo mais acessível para quem precisa de apoio e não pode ir ao chão.",
    anguloArticular: "Extensão de quadril de 0 a cerca de 15 graus, joelho estendido",
    modalidade: "m-funcional",
    ativacao: [
      { musculo: "Glúteo máximo", percentual: 60, papel: "primário" },
      { musculo: "Isquiotibiais", percentual: 40, papel: "sinergista" },
      { musculo: "Eretores da espinha", percentual: 20, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 74, metrics: m("Glúteo máximo", 60, 15, 15, 5, 0, 10) },
    fases: [
      { nome: "Posição", descricao: "Em pé atrás de uma cadeira, mãos no encosto, peso sobre a perna de apoio com o joelho levemente dobrado." },
      { nome: "Extensão", descricao: "Leva o calcanhar da outra perna para trás, com o joelho reto e o tronco parado, até sentir o glúteo contrair." },
      { nome: "Retorno", descricao: "Volta a perna devagar até o pé quase tocar o chão e repete; ao terminar a série, troca de lado." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 60,
        titulo: "Pouca amplitude, muito glúteo",
        camadas: {
          resumo: "O quadril estende só uns 15 graus. Querer mais amplitude joga a lombar para a frente e tira o trabalho do glúteo.",
          biomecanica:
            "Com o tronco fixo, quem estende a perna é o glúteo máximo, com os isquiotibiais ajudando. Quando o tronco inclina, o movimento passa a vir da lombar.",
          fisiologia: "É exercício de ativação e resistência muscular local, com carga baixa e repetições altas, adequado a quem está começando ou voltando.",
          evidencia: "A extensão de quadril com joelho estendido está entre os exercícios terapêuticos de glúteo medidos por EMG, com o glúteo máximo como motor.",
          cuidados: "Se o quadril de apoio tombar para o lado, reduza a amplitude: a bacia precisa ficar nivelada.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Idoso ou aluno com obesidade que precisa de apoio nas mãos e não pode ir ao chão.",
        "Retorno ao treino, para reativar o glúteo antes de agachar e subir degrau.",
        "Aluno em casa, sem qualquer equipamento.",
      ],
      quandoEvitar: [
        "Dor lombar que aparece ao estender a perna, mesmo com amplitude pequena.",
        "Sem um apoio firme à frente: cadeira leve ou que desliza não serve.",
      ],
      errosComuns: [
        "Inclinar o tronco para a frente para levar a perna mais alto.",
        "Dobrar o joelho da perna que se move, transformando em flexão de joelho.",
        "Fazer rápido, balançando a perna, em vez de contrair e controlar.",
      ],
      variacoes: [
        "Com pausa de 2 s no ponto alto: mais tempo de tensão.",
        "Com elástico no tornozelo: vira a extensão de quadril com elástico.",
        "Sem as mãos no apoio: soma trabalho de equilíbrio.",
      ],
    },
    conteudo: {
      visaoGeral:
        "Extensão de quadril de pé, com apoio à frente. É o exercício de glúteo que cabe em qualquer condição e qualquer ambiente, e por isso fecha o buraco do padrão de quadril para quem não vai ao chão.",
      biomecanica:
        "O glúteo máximo leva a perna para trás com o joelho reto; os isquiotibiais ajudam e os eretores da espinha só mantêm o tronco. A bacia nivelada é o sinal de que o glúteo médio do lado de apoio está fazendo a parte dele.",
      fisiologia:
        "Trabalho de resistência muscular local, com carga baixa. Serve para reativar o glúteo e ensinar a separação entre movimento de quadril e movimento de coluna.",
      prescricaoPratica:
        "Use a faixa de repetições do objetivo por lado. Progrida com pausa no ponto alto, depois com elástico no tornozelo, e por último tirando as mãos do apoio.",
    },
    trustLevel: "princípio biomecânico",
    temCena: false,
    restricaoPerfil: { posicao: "em pé", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: true, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: true, flexaoColunaCarregada: false, membrosAcimaDoCoracao: false },
  },

  /* ---------------------- ELEVAÇÃO DE JOELHOS SENTADO ---------------------- */
  {
    id: "lc4",
    slug: "elevacao-joelho-sentado",
    imagem: "/exercises/elevacao-joelho-sentado.webp",
    imagemAnalise: "/exercises/elevacao-joelho-sentado-analysis.webp",
    nome: "Elevação de joelhos sentado na cadeira",
    grupoMuscular: "Core (tronco)",
    equipamento: "Peso corporal",
    objetivo: ["Retorno ao treino", "Resistência muscular", "Aprendizado técnico", "Emagrecimento"],
    nivel: "Iniciante",
    articulacaoPredominante: "Quadril e coluna lombar",
    premium: false,
    resumoPratico:
      "Sentado na beira da cadeira, tronco reto, um joelho sobe de cada vez enquanto o abdômen segura o tronco parado. Trabalho de tronco sem deitar e sem ir ao chão.",
    anguloArticular: "Flexão de quadril de 90 a cerca de 110 graus, coluna neutra",
    modalidade: "m-funcional",
    ativacao: [
      { musculo: "Reto abdominal", percentual: 50, papel: "primário" },
      { musculo: "Iliopsoas", percentual: 45, papel: "sinergista" },
      { musculo: "Transverso do abdome", percentual: 35, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 70, metrics: m("Reto abdominal", 50, 15, 20, 5, 0, 10) },
    fases: [
      { nome: "Posição", descricao: "Sentado na beira de uma cadeira firme, pés no chão, tronco reto e mãos ao lado do quadril ou nas laterais do assento." },
      { nome: "Elevação", descricao: "Contrai o abdômen e sobe um joelho alguns centímetros do chão, sem inclinar o tronco para trás." },
      { nome: "Retorno", descricao: "Desce o pé devagar e sobe o outro joelho; os dois ao mesmo tempo é a progressão." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 50,
        titulo: "O tronco não vai para trás",
        camadas: {
          resumo: "Quando o joelho sobe, o corpo quer cair para trás. Segurar isso é o exercício.",
          biomecanica:
            "O flexor do quadril levanta a perna e puxa a bacia; o reto abdominal e o transverso resistem a essa puxada e mantêm a lombar neutra.",
          fisiologia: "É trabalho de resistência do tronco contra a extensão, o mesmo papel da prancha, numa posição que qualquer aluno alcança.",
          evidencia: "A resistência do tronco ao movimento, e não a flexão repetida da coluna, é a base do treino de core proposta pela literatura de estabilidade lombar.",
          cuidados: "Se a lombar arredondar ou o tronco tombar para trás, diminua a altura do joelho.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Aluno que não deita nem vai ao chão e precisa de trabalho de tronco.",
        "Gestante, que evita a posição deitada, com trabalho de tronco sentada.",
        "Retorno ao treino, antes de progredir para a prancha.",
      ],
      quandoEvitar: [
        "Dor na virilha ou na frente do quadril ao subir o joelho.",
        "Cadeira com rodinhas ou assento que afunda.",
      ],
      errosComuns: [
        "Inclinar o tronco para trás para ajudar o joelho a subir.",
        "Prender a respiração durante a elevação.",
        "Subir o joelho com impulso em vez de contrair o abdômen antes.",
      ],
      variacoes: [
        "Os dois joelhos ao mesmo tempo: progressão.",
        "Com pausa de 2 s no alto: mais tempo de tensão.",
        "Com as mãos afastadas do assento: menos apoio, mais tronco.",
      ],
    },
    conteudo: {
      visaoGeral:
        "Trabalho de tronco sentado, para quem não vai ao chão nem deita. Ele existe porque o catálogo só tinha trabalho de tronco no solo ou em pé com apoio nas mãos.",
      biomecanica:
        "O reto abdominal e o transverso mantêm a lombar neutra enquanto o iliopsoas levanta a perna. O exercício é a resistência do tronco, e não a elevação em si.",
      fisiologia:
        "Resistência muscular do tronco com carga baixa: a progressão vem de subir os dois joelhos, de pausar no alto e de tirar o apoio das mãos, nunca de balançar o tronco.",
      prescricaoPratica:
        "Use a faixa de repetições do objetivo, alternando as pernas. Progrida para os dois joelhos juntos quando o tronco ficar parado em toda a série.",
    },
    trustLevel: "regra pedagógica",
    temCena: false,
    restricaoPerfil: { posicao: "sentado", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: true, flexaoColunaCarregada: false, membrosAcimaDoCoracao: false },
  },

  /* ---------------------- PRANCHA INCLINADA NA PAREDE ---------------------- */
  {
    id: "lc5",
    slug: "prancha-parede",
    imagem: "/exercises/prancha-parede.webp",
    imagemAnalise: "/exercises/prancha-parede-analysis.webp",
    // Dose por TEMPO, como a prancha no banco. Ver Exercise.sustentado.
    sustentado: { series: "3", tempo: "20 a 40 s" },
    nome: "Prancha inclinada na parede",
    grupoMuscular: "Core (tronco)",
    equipamento: "Peso corporal",
    objetivo: ["Retorno ao treino", "Resistência muscular", "Aprendizado técnico", "Emagrecimento"],
    nivel: "Iniciante",
    articulacaoPredominante: "Coluna lombar e ombro",
    premium: false,
    resumoPratico:
      "Antebraços ou mãos na parede, corpo reto e inclinado, pés afastados da parede. É a prancha mais fácil que existe, e a única que não precisa de banco nem de chão.",
    anguloArticular: "Corpo alinhado do ombro ao calcanhar, inclinação de 20 a 40 graus em relação à vertical",
    modalidade: "m-funcional",
    ativacao: [
      { musculo: "Transverso do abdome", percentual: 45, papel: "primário" },
      { musculo: "Reto abdominal", percentual: 40, papel: "sinergista" },
      { musculo: "Oblíquos", percentual: 30, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 68, metrics: m("Transverso do abdome", 45, 10, 10, 0, 15, 5) },
    fases: [
      { nome: "Posição", descricao: "De frente para a parede, mãos ou antebraços apoiados na altura do ombro, pés juntos e afastados da parede o suficiente para o corpo ficar inclinado e reto." },
      { nome: "Sustentação", descricao: "Contrai o abdômen e o glúteo, mantém o corpo numa linha só e respira normalmente pelo tempo prescrito." },
      { nome: "Saída", descricao: "Dá um passo à frente e sai da posição; descansa e repete." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 50,
        titulo: "A distância dos pés é a carga",
        camadas: {
          resumo: "Pés mais longe da parede, corpo mais inclinado, mais peso no tronco. É assim que se progride.",
          biomecanica:
            "Quanto mais horizontal o corpo, maior a fração do peso corporal que o tronco precisa segurar contra a gravidade.",
          fisiologia: "Contração sustentada de baixa intensidade, que treina a resistência do tronco sem carregar a coluna.",
          evidencia: "A prancha e suas regressões são os exercícios de anti-extensão da literatura de estabilidade do tronco.",
          cuidados: "Quadril caindo ou subindo é o sinal para encerrar a série antes do tempo.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Primeira prancha de quem não vai ao chão, não deita e ainda não sustenta a prancha no banco.",
        "Aluno com obesidade, gestante ou idoso que precisa de trabalho de tronco em pé.",
        "Progressão para a prancha no banco e depois para a prancha no solo.",
      ],
      quandoEvitar: [
        "Dor no ombro ao apoiar os antebraços, que não melhora ao aproximar os pés da parede.",
        "Piso que escorrega.",
      ],
      errosComuns: [
        "Deixar o quadril cair e a lombar arquear.",
        "Prender a respiração durante o tempo de sustentação.",
        "Encolher os ombros até as orelhas.",
      ],
      variacoes: [
        "Mãos em vez de antebraços: mais fácil.",
        "Pés mais longe da parede: progressão.",
        "Prancha no banco: próximo passo.",
      ],
    },
    conteudo: {
      visaoGeral:
        "Prancha em pé, apoiada na parede. É a regressão máxima da prancha e por isso cabe em qualquer condição, e a progressão é só afastar os pés.",
      biomecanica:
        "Transverso e reto abdominal seguram a coluna contra a gravidade; o glúteo ajuda a manter o quadril alinhado. A inclinação define a carga.",
      fisiologia:
        "Contração sustentada de baixa intensidade, dose por tempo: o ganho é de resistência do tronco, e o progresso é geométrico, não de repetições.",
      prescricaoPratica:
        "Em geral, 3 séries de 20 a 40 s, encerrando quando o quadril sair da linha. Progrida afastando os pés da parede antes de aumentar o tempo.",
    },
    trustLevel: "regra pedagógica",
    temCena: false,
    restricaoPerfil: { posicao: "em pé", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: true, amplitudeAjustavel: true, possuiApoio: true, flexaoColunaCarregada: false, membrosAcimaDoCoracao: false },
  },

  /* ---------------------- REMADA COM TOALHA NA PORTA ---------------------- */
  {
    id: "lc6",
    slug: "remada-toalha-porta",
    imagem: "/exercises/remada-toalha-porta.webp",
    imagemAnalise: "/exercises/remada-toalha-porta-analysis.webp",
    nome: "Remada com toalha na porta (peso do corpo)",
    grupoMuscular: "Costas",
    equipamento: "Peso corporal",
    objetivo: ["Retorno ao treino", "Resistência muscular", "Hipertrofia", "Emagrecimento", "Aprendizado técnico"],
    nivel: "Iniciante",
    articulacaoPredominante: "Cotovelo e escápula",
    premium: false,
    resumoPratico:
      "Uma toalha presa na maçaneta de uma porta fechada, pés perto da porta, corpo inclinado para trás com os braços esticados: puxa o peito na direção da porta. É a segunda opção de puxar de quem treina só com o peso do corpo.",
    anguloArticular: "Flexão de cotovelo até cerca de 90 graus com retração escapular, tronco inclinado para trás",
    modalidade: "m-funcional",
    ativacao: [
      { musculo: "Latíssimo do dorso", percentual: 60, papel: "primário" },
      { musculo: "Romboides", percentual: 55, papel: "sinergista" },
      { musculo: "Bíceps braquial", percentual: 45, papel: "sinergista" },
      { musculo: "Transverso do abdome", percentual: 30, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 70, metrics: m("Latíssimo do dorso", 60, 25, 15, 5, 25, 20) },
    fases: [
      { nome: "Posição", descricao: "Toalha enrolada na maçaneta dos dois lados de uma porta fechada e travada, uma ponta em cada mão, pés a um passo da porta, corpo inclinado para trás com os braços esticados." },
      { nome: "Puxada", descricao: "Puxa o peito na direção da porta, cotovelos rentes ao tronco e escápulas se aproximando, sem dobrar o quadril." },
      { nome: "Retorno", descricao: "Estende os cotovelos devagar até os braços ficarem retos, mantendo o corpo em linha." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 45,
        titulo: "A inclinação do corpo é a carga",
        camadas: {
          resumo: "Quanto mais inclinado para trás, mais peso as costas puxam. Pés mais perto da porta é mais difícil.",
          biomecanica:
            "O latíssimo e os romboides trazem o tronco na direção das mãos; o bíceps flexiona o cotovelo. O tronco em linha transforma o exercício também em prancha.",
          fisiologia: "Sem carga externa, a progressão vem da geometria: inclinar mais, desacelerar o retorno ou pausar no fim da puxada.",
          evidencia: "Mesma lógica de regressão da remada invertida com apoio alto, que já cobre o padrão de puxar em casa.",
          cuidados: "Confira a porta e a toalha antes de inclinar: a porta precisa estar travada e a toalha inteira.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Aluno em casa, sem barra nem elástico, que precisa de uma segunda opção de puxar para não repetir sempre a mesma.",
        "Retorno ao treino, para reaprender a retração de escápulas com carga baixa.",
        "Semana que já tem empurrar e nenhuma puxada.",
      ],
      quandoEvitar: [
        "Sem uma porta que trave com segurança ou sem uma toalha íntegra.",
        "Dor no ombro que aparece na puxada e não melhora ao inclinar menos.",
      ],
      errosComuns: [
        "Dobrar o quadril e sentar no ar em vez de manter o corpo em linha.",
        "Puxar com os cotovelos abertos, jogando a carga para a frente do ombro.",
        "Fazer o retorno rápido, soltando o corpo.",
      ],
      variacoes: [
        "Pés mais longe da porta: mais fácil.",
        "Pés mais perto da porta: progressão.",
        "Com uma mão só: versão unilateral.",
      ],
    },
    conteudo: {
      visaoGeral:
        "Puxada horizontal com o peso do corpo usando uma porta e uma toalha. Existe para que o aluno que só tem o peso do corpo não receba a mesma remada em toda sessão da semana.",
      biomecanica:
        "Latíssimo e romboides puxam o tronco na direção das mãos, com o bíceps flexionando o cotovelo. A inclinação define a fração do peso corporal vencida, como na remada invertida.",
      fisiologia:
        "Estímulo de resistência e de hipertrofia leve, ajustável pela inclinação e pela velocidade do retorno. Não substitui a remada com carga em quem já tem equipamento.",
      prescricaoPratica:
        "Escolha a inclinação que permita completar a faixa de repetições do objetivo com o corpo em linha. Progrida aproximando os pés da porta antes de aumentar as repetições.",
    },
    trustLevel: "princípio biomecânico",
    temCena: false,
    restricaoPerfil: { posicao: "em pé", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: true, flexaoColunaCarregada: false, membrosAcimaDoCoracao: false },
  },

  /* ---------------------- CONTRAÇÃO DO ASSOALHO PÉLVICO ---------------------- */
  {
    id: "lc7",
    slug: "contracao-assoalho-pelvico",
    imagem: "/exercises/contracao-assoalho-pelvico.webp",
    imagemAnalise: "/exercises/contracao-assoalho-pelvico-analysis.webp",
    /*
     * Dose por TEMPO. Os números são convenção de prática clínica (contrações de alguns
     * segundos, repetidas em poucas séries), e não medida de estudo: a revisão Cochrane
     * (`woodley-assoalho-2020`) registra que os programas variaram muito e foram muitas vezes
     * mal descritos. Por isso o `trustLevel` é "regra pedagógica" e a prescrição prática diz
     * isso com todas as letras.
     */
    sustentado: { series: "3", tempo: "5 a 8 s por contração, 8 a 12 vezes" },
    nome: "Contração do assoalho pélvico (sentada)",
    grupoMuscular: "Core (tronco)",
    equipamento: "Peso corporal",
    objetivo: ["Retorno ao treino", "Aprendizado técnico"],
    nivel: "Iniciante",
    articulacaoPredominante: "Pelve",
    premium: false,
    resumoPratico:
      "Sentada, contrair a musculatura que interrompe o jato de urina, segurar alguns segundos respirando normalmente e soltar por completo. É o treino do assoalho pélvico da gestação e do pós-parto, feito como exercício e não como aviso.",
    anguloArticular: "Sem movimento articular: contração voluntária isolada, coluna neutra",
    modalidade: "m-funcional",
    ativacao: [
      { musculo: "Assoalho pélvico", percentual: 60, papel: "primário" },
      { musculo: "Transverso do abdome", percentual: 30, papel: "sinergista" },
    ],
    indiceEficiencia: { score: 66, metrics: m("Assoalho pélvico", 60, 20, 0, 0, 0, 0) },
    fases: [
      { nome: "Posição", descricao: "Sentada numa cadeira firme, pés no chão, coluna neutra, glúteos e coxas relaxados." },
      { nome: "Contração", descricao: "Contrai e eleva a musculatura entre o púbis e o cóccix, como se fosse interromper o jato de urina, sem contrair glúteo, coxa nem prender a respiração." },
      { nome: "Relaxamento", descricao: "Solta por completo e descansa o mesmo tempo da contração antes da próxima." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 60,
        titulo: "Contrair o certo, e soltar por completo",
        camadas: {
          resumo: "Glúteo e coxa ficam soltos; a respiração continua. O relaxamento entre as contrações faz parte do exercício.",
          biomecanica:
            "O assoalho pélvico é um conjunto de músculos que fecha a pelve por baixo; a contração voluntária eleva a uretra e resiste ao aumento da pressão abdominal.",
          fisiologia: "O treino age de dois modos com evidência a favor: aprender a pré-contrair antes do esforço e ganhar força e volume muscular que dá suporte duradouro.",
          evidencia: "Em gestantes continentes, o treino estruturado na gestação reduziu o risco de incontinência urinária no fim da gravidez e nos meses após o parto (revisão Cochrane).",
          cuidados: "Dor pélvica durante a contração ou perda que persiste pedem encaminhamento; o exercício não substitui a avaliação.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Gestação com liberação, como prevenção, começando cedo e de forma estruturada.",
        "Pós-parto com liberação, como parte do plano de retorno.",
        "Aprender a pré-contrair o assoalho antes de tossir, levantar peso ou agachar.",
      ],
      quandoEvitar: [
        "Dor pélvica durante a contração.",
        "Sem liberação obstétrica ou médica quando ela é exigida.",
      ],
      errosComuns: [
        "Contrair o glúteo e as coxas no lugar do assoalho.",
        "Prender a respiração ou empurrar para baixo em vez de elevar.",
        "Não relaxar por completo entre as contrações.",
      ],
      variacoes: [
        "Em pé: a mesma contração na posição do dia a dia.",
        "Contrações rápidas de 1 s: complemento às sustentadas.",
        "Pré-contração antes de um esforço (levantar da cadeira, tossir): a transferência para a vida diária.",
      ],
    },
    conteudo: {
      visaoGeral:
        "A regra do pós-parto dizia que o treino do assoalho pélvico é parte do plano, e ele não existia como exercício. Agora existe, sentado, sem ir ao chão e sem a posição deitada que a gestante evita.",
      biomecanica:
        "A contração voluntária do assoalho pélvico eleva e fecha a base da pelve. O transverso do abdome tende a contrair junto, e isso é esperado; glúteo e coxas não devem participar.",
      fisiologia:
        "Duas explicações têm ensaios e anatomia funcional a favor: a pré-contração consciente antes do aumento de pressão abdominal e o ganho de força e volume muscular que dá suporte estrutural.",
      prescricaoPratica:
        "Em geral, 3 séries de 8 a 12 contrações de 5 a 8 s, com relaxamento igual entre elas; os protocolos dos estudos variam, e esta é uma convenção de prática, não uma dose medida. O efeito que a evidência sustenta é de prevenção, começando cedo na gestação; como tratamento de perda já instalada a evidência é incerta e o encaminhamento é o caminho.",
    },
    trustLevel: "regra pedagógica",
    temCena: false,
    restricaoPerfil: { posicao: "sentado", impacto: "baixo", movimentoAcimaCabeca: false, exigeAjoelhar: false, exigeIrAoChao: false, unilateral: false, apoioNasMaos: false, amplitudeAjustavel: true, possuiApoio: true, flexaoColunaCarregada: false, membrosAcimaDoCoracao: false },
  },
];
