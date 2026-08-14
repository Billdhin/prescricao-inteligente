/**
 * FAMÍLIA ISOMÉTRICA: a terceira família de dose do produto.
 *
 * ## Por que ela existe, e por que a ordem das frases importa
 *
 * Decisão do Filipe, 14/08/2026: *"Com certeza os treinos isométricos devem constar na
 * plataforma. Agora, lembre que treinos isométricos são os que mais elevam a pressão
 * arterial também, além de ser o que mais gera adaptações de melhoria na pressão. Ou seja,
 * a cautela tem que vir antes do foco apenas no que gera mais adaptações."*
 *
 * As duas pontas são verdadeiras e as duas estão citadas aqui. O benefício crônico:
 * `edwards-exercicio-pa-2023` põe o isométrico em primeiro lugar entre todos os modos, com
 * −8,24 mmHg de sistólica em 270 ensaios, e nomeia o AGACHAMENTO NA PAREDE como o submodo
 * mais efetivo. O custo agudo: em `lea-escala-isometrica-2021` e no estudo irmão dos mesmos
 * autores, a pressão sistólica foi medida DURANTE a contração e sobe de forma proporcional
 * à carga (r = 0,77 contra a percepção de esforço). Não é folclore, é medida.
 *
 * Por isso `quandoEvitar` de cada um destes exercícios começa pela pressão descontrolada, e
 * não termina nela.
 *
 * ## Por que a dose NÃO é interpolada pelo motor
 *
 * Todo o resto do catálogo recebe faixa (séries, repetições, intervalo) e o motor escolhe o
 * ponto da semana dentro dela. Aqui não: o isométrico para pressão é um PROTOCOLO publicado,
 * com número fechado, e interpolar dentro dele seria inventar um protocolo que ninguém
 * testou. `wiles-agachamento-parede-2016` dá o protocolo inteiro: 4 séries de 2 minutos de
 * contração, 2 minutos de descanso, 3 vezes por semana, 48 h entre sessões.
 *
 * A marca `doseIsometrica` garante que estes exercícios nunca entrem na seleção de força e
 * nunca recebam série e repetição, do mesmo jeito que a bicicleta não recebe. Ver
 * `Exercise.doseIsometrica` em `types.ts` e `ehForca` em `lib/gps/periodizacao.ts`.
 *
 * ## O que o protocolo pede e o produto não tem
 *
 * A intensidade original é dada pelo ÂNGULO DE JOELHO individualizado para 95% da frequência
 * cardíaca de pico, o que exige teste incremental e monitor de FC. `lea-escala-isometrica-2021`
 * é o que torna isso executável em campo: a percepção de esforço é medida válida da
 * intensidade do agachamento na parede (r = 0,967 contra Borg CR-10). É o mesmo eixo de
 * esforço que `lib/gps/esforco.ts` já usa no resto do produto, e é por isso que estes
 * exercícios se encaixam sem vocabulário novo.
 *
 * Fica declarado o que NÃO temos: quem usa betabloqueador não pode ancorar em FC (o produto
 * já sabe disso, ver a camada de fármacos), e nesse caso a percepção de esforço deixa de ser
 * um atalho e passa a ser o único instrumento.
 *
 * ## Sem imagem, de propósito, por enquanto
 *
 * Nenhum dos dois declara `imagem`. A regra do projeto é que ausência é melhor que imagem
 * que ensina o movimento errado, e o cartão assume a ausência em palavras. As fotos entram
 * na rodada de imagens, com verificação olho a olho.
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

export const exerciciosIsometricos: Exercise[] = [
  /* --------------- AGACHAMENTO ISOMÉTRICO NA PAREDE (wall squat) --------------- */
  {
    id: "iso1",
    slug: "agachamento-isometrico-parede",
    nome: "Agachamento isométrico na parede",
    grupoMuscular: "Membros inferiores",
    equipamento: "Peso corporal",
    objetivo: ["Resistência muscular", "Aprendizado técnico"],
    nivel: "Iniciante",
    articulacaoPredominante: "Joelho e quadril",
    premium: false,
    doseIsometrica: true,
    resumoPratico:
      "Contração sustentada com as costas apoiadas na parede e os joelhos dobrados, mantida por tempo. É o submodo isométrico com maior efeito sobre a pressão sistólica na metanálise em rede, e não precisa de nenhum equipamento.",
    modalidade: "m-musculacao",
    ativacao: [
      { musculo: "Quadríceps", percentual: 72, papel: "primário" },
      { musculo: "Glúteo máximo", percentual: 45, papel: "sinergista" },
      { musculo: "Eretores da espinha", percentual: 32, papel: "estabilizador" },
    ],
    indiceEficiencia: { score: 78, metrics: m("Quadríceps", 72, 20, 25, 40, 10, 30) },
    /*
     * O guardrail do catálogo diz "um movimento tem pelo menos início e fim", e num
     * isométrico isso continua valendo, só que as fases não são do movimento e sim da
     * SÉRIE: entrar na posição, sustentar e sair. A terceira não é enfeite: sair devagar
     * evita a queda de pressão ao levantar depois de dois minutos de contração.
     */
    fases: [
      { nome: "Entrada", descricao: "Costas apoiadas na parede, pés à frente do quadril, desce deslizando até o ângulo de joelho escolhido." },
      { nome: "Sustentação", descricao: "Mantém o ângulo pelo tempo prescrito, respiração solta, sem apoiar as mãos nas coxas." },
      { nome: "Saída", descricao: "Sobe deslizando pela parede, sem pressa, e fica em pé alguns segundos antes de andar." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 50,
        y: 55,
        titulo: "O ângulo é a carga",
        camadas: {
          resumo: "Joelho mais dobrado é mais carga. O ângulo certo é o que deixa completar o tempo inteiro.",
          biomecanica:
            "Fechar o ângulo de joelho aumenta o braço de alavanca sobre o quadríceps, e a percepção de esforço distingue diferenças de 10 graus, o que torna o ajuste fino possível sem equipamento.",
          fisiologia:
            "Quanto maior a carga sustentada, maior a elevação de pressão arterial durante a contração; a relação entre percepção de esforço e pressão sistólica medida durante o exercício é forte.",
          evidencia:
            "O protocolo publicado usa o ângulo individualizado para 95% da frequência cardíaca de pico; a percepção de esforço é a medida válida quando não há como fazer esse teste.",
          cuidados:
            "Se o tempo prescrito não fecha, abra o ângulo em vez de encurtar a série. Respiração solta do começo ao fim.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Alvo de pressão arterial: é o submodo isométrico com maior efeito sobre a sistólica na metanálise em rede.",
        "Aluno sem equipamento e sem espaço, porque só precisa de uma parede.",
        "Quando a articulação não tolera bem a fase de descida e subida do agachamento livre.",
      ],
      quandoEvitar: [
        "Pressão arterial descontrolada ou sem liberação: a contração sustentada ELEVA a pressão durante o esforço, de forma proporcional à carga.",
        "Aluno orientado a evitar manobra de Valsalva ou apneia: a respiração tem que seguir solta durante toda a contração.",
        "Dor de joelho que aumenta com o ângulo escolhido: abra o ângulo antes de insistir.",
      ],
      errosComuns: [
        "Prender a respiração durante a contração, o que soma o efeito da Valsalva à elevação de pressão que o exercício já causa.",
        "Escolher um ângulo tão fechado que a contração não chega aos 2 minutos.",
        "Apoiar as mãos nas coxas e transferir parte do peso, o que muda a carga no meio da série.",
      ],
      variacoes: [
        "Ângulo mais aberto (joelho menos dobrado): reduz a carga e é a regressão natural.",
        "Ângulo mais fechado: aumenta a carga, e a percepção de esforço distingue variações de 10 graus.",
        "Apoio unilateral parcial: só depois do domínio bilateral, e fora do protocolo de pressão.",
      ],
    },
    conteudo: {
      visaoGeral:
        "O agachamento na parede é sustentar a posição, não repetir movimento. As costas ficam apoiadas, os pés à frente do quadril e os joelhos dobrados num ângulo escolhido, e a série termina pelo relógio.",
      biomecanica:
        "O quadríceps trabalha em contração sustentada para manter o ângulo de joelho, com o glúteo e os eretores estabilizando o tronco contra a parede. Sem fase de descida e subida, não há pico de carga articular na transição, o que costuma ser tolerado por quem tem incômodo no movimento completo.",
      fisiologia:
        "De forma aguda, a contração sustentada comprime a circulação no músculo ativo e a pressão arterial SOBE durante o esforço, proporcional à carga escolhida. De forma crônica, o efeito medido é o oposto: nas metanálises, este é o modo com maior redução de pressão de repouso. As duas coisas convivem, e é por isso que o critério de segurança vem antes da escolha do ângulo.",
      prescricaoPratica:
        "O protocolo publicado é 4 séries de 2 minutos de contração, com 2 minutos de descanso entre elas, 3 vezes por semana, com pelo menos 48 horas entre as sessões. A intensidade original é o ângulo de joelho individualizado para 95% da frequência cardíaca de pico; sem esse teste, a percepção de esforço é medida válida e é o que o aluno consegue usar. A respiração fica solta durante toda a contração.",
    },
    trustLevel: "cuidado de segurança",
    temCena: false,
  },

  /* ---------------------- PREENSÃO ISOMÉTRICA (handgrip) ---------------------- */
  {
    id: "iso2",
    slug: "preensao-isometrica-handgrip",
    nome: "Preensão isométrica (handgrip)",
    grupoMuscular: "Braços",
    equipamento: "Elástico",
    objetivo: ["Resistência muscular"],
    nivel: "Iniciante",
    articulacaoPredominante: "Punho e dedos",
    premium: false,
    doseIsometrica: true,
    resumoPratico:
      "Apertar e sustentar um dinamômetro ou aparelho de preensão por tempo. É o formato isométrico mais estudado para pressão arterial e o mais fácil de fazer sentado, sem carga sobre articulação de membro inferior.",
    modalidade: "m-musculacao",
    ativacao: [
      // UM músculo só, e é honesto: a preensão sustentada é o exercício mais isolado do
      // catálogo. O glossário de métricas não tem entrada separada para os flexores dos
      // dedos, e inventar uma para preencher a lista seria anatomia decorativa.
      { musculo: "Flexores do punho", percentual: 70, papel: "primário" },
    ],
    indiceEficiencia: { score: 74, metrics: m("Flexores do punho", 70, 15, 5, 5, 15, 10) },
    fases: [
      { nome: "Entrada", descricao: "Sentado, cotovelo apoiado e confortável, pega firme no aparelho de preensão." },
      { nome: "Sustentação", descricao: "Aperta e mantém a força pelo tempo prescrito, respiração solta, sem contrair o resto do corpo." },
      { nome: "Saída", descricao: "Solta a preensão devagar e descansa a mão até a próxima série." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 62,
        y: 40,
        titulo: "Só a mão trabalha",
        camadas: {
          resumo: "Ombro, pescoço e mandíbula soltos. Se o corpo inteiro contrai junto, a pressão sobe mais que o necessário.",
          biomecanica:
            "A força de preensão vem dos flexores dos dedos e do punho; recrutar tronco e pescoço junto não aumenta a carga no alvo e aumenta a resposta pressórica.",
          fisiologia:
            "Contração sustentada de qualquer massa muscular eleva a pressão durante o esforço. Quanto menor a massa envolvida, menor essa elevação para o mesmo efeito de treino.",
          evidencia:
            "É o formato isométrico mais estudado para pressão arterial, e o que menos carrega articulação de membro inferior.",
          cuidados: "Nunca prender a respiração. Respeite o descanso integral entre as séries.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Alvo de pressão arterial em quem não pode carregar os membros inferiores.",
        "Aluno sentado, com mobilidade reduzida ou em recuperação de membro inferior.",
        "Quando o espaço e o equipamento disponíveis são mínimos.",
      ],
      quandoEvitar: [
        "Pressão arterial descontrolada ou sem liberação: a contração sustentada ELEVA a pressão durante o esforço.",
        "Aluno orientado a evitar manobra de Valsalva ou apneia.",
        "Dor ou lesão em punho, mão ou cotovelo do lado que vai trabalhar.",
      ],
      errosComuns: [
        "Prender a respiração durante a contração.",
        "Contrair o corpo inteiro junto, em vez de isolar a preensão.",
        "Trocar de mão sem respeitar o descanso previsto entre as séries.",
      ],
      variacoes: [
        "Alternar as mãos entre as séries, que é como a maioria dos protocolos aplica.",
        "Aparelho de preensão regulável, quando não há dinamômetro para calibrar a carga.",
      ],
    },
    conteudo: {
      visaoGeral:
        "A preensão isométrica é apertar e sustentar, sem repetição. Foi o formato usado na maior parte dos estudos que estabeleceram o efeito do isométrico sobre a pressão arterial.",
      biomecanica:
        "Os flexores dos dedos e do punho sustentam a força de preensão contra um aparelho que não cede. Como não há deslocamento, não há carga sobre coluna nem sobre joelho, o que torna este o isométrico de menor demanda articular do catálogo.",
      fisiologia:
        "Vale aqui a mesma dupla verdade do agachamento na parede: a pressão sobe durante a contração e a pressão de repouso cai ao longo de semanas de treino. Numa metanálise restrita a pessoas já hipertensas, a queda foi de cerca de 7 mmHg na sistólica de consultório, com a ressalva de que a medida ambulatorial de 24 horas não acompanhou.",
      prescricaoPratica:
        "Siga o protocolo declarado no plano, mantendo a respiração solta durante toda a contração e o descanso integral entre as séries. A carga deve permitir sustentar a contração inteira sem queda visível de força no fim.",
    },
    trustLevel: "cuidado de segurança",
    temCena: false,
  },
];
