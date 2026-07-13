import type { Lesson, Module } from "../types";
import { deepLesson, deepModule, q } from "./authoring";

/** BIOQUÍMICA E METABOLISMO, disciplina autorada em profundidade. */

const DISC = "bioquimica-metabolismo";
const DISC_ID = "d-bioquimica";
const K = "Bioquímica e metabolismo";

const sistemas = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-vias-energeticas`, moduleSlug: "vias-energeticas",
  slug: `${DISC}--sistemas-energeticos`, title: "Sistemas de energia: como o corpo repõe ATP",
  subtitle: "Vias energéticas", description: "Fosfagênio, glicolítico e oxidativo repõem ATP em ritmos diferentes; a duração e a intensidade definem o predominante.",
  level: "fundamental", minutes: 11, type: "conceito", kicker: K, tags: ["sistemas energéticos", "ATP", "intensidade"],
  hero: "Toda contração muscular gasta ATP, e o corpo o repõe por três vias com velocidades diferentes. Saber qual predomina em cada esforço explica por que um tiro curto e uma corrida longa usam combustíveis distintos.",
  question: "Por que um aluno consegue sustentar uma caminhada por horas, mas um sprint máximo só por segundos?",
  concepts: [
    { term: "Sistemas de energia", definition: "Vias que ressintetizam ATP: fosfagênio (rápido, curtíssima duração), glicolítico (rápido, curta duração, com acúmulo de metabólitos) e oxidativo (mais lento, sustentável por muito tempo)." },
    { term: "ATP", definition: "Moeda de energia da célula. É gasto e reposto continuamente; o sistema que repõe muda com a intensidade e a duração do esforço." },
  ],
  figure: { id: "vias-energeticas" },
  chart: {
    title: "Sistema predominante por duração do esforço (ilustrativo)",
    points: [
      { label: "Segundos (força máxima)", value: 95 },
      { label: "Até ~1 min (intenso)", value: 70 },
      { label: "Minutos (moderado)", value: 45 },
      { label: "Prolongado (leve)", value: 20 },
    ],
    explanation: "Esforços curtíssimos e máximos dependem mais do fosfagênio e da glicólise; esforços prolongados dependem do sistema oxidativo. As vias atuam juntas; muda a predominância. Valores ilustrativos.",
  },
  apply: "Relacione a duração e a intensidade do que você prescreve ao sistema predominante. Esforços curtos e intensos usam fosfagênio e glicólise; contínuos e longos, o oxidativo. Responder à abertura: o sprint máximo esgota rápido as vias rápidas (fosfagênio e glicólise); a caminhada é sustentada pelo sistema oxidativo, que repõe ATP de forma contínua.",
  special: [
    "Condicionamento aeróbio: o sistema oxidativo se desenvolve com treino contínuo e intervalado bem dosados.",
    "Força e potência: dependem das vias rápidas; intervalos suficientes permitem repor o fosfagênio entre séries.",
    "Emagrecimento: o gasto ao longo do tempo (volume) importa mais do que a via usada em uma sessão isolada.",
  ],
  mistake: {
    mistake: "Assumir que um único sistema energético atua isolado em cada esforço, ou tirar conclusões fortes sobre 'queima de gordura' por sessão.",
    instead: "Entenda que as vias atuam juntas, com predominância que muda pela intensidade e duração. Para resultados, pense no acúmulo ao longo do tempo, não numa sessão isolada.",
  },
  professionalCase: {
    prompt: "Aluno quer melhorar a capacidade de sustentar corridas longas. Qual estímulo prioriza o sistema energético adequado?",
    choices: [
      { id: "c1", label: "Treino contínuo e intervalado dosados, que desenvolvem o sistema oxidativo, base da resistência.", tone: "recomendada", feedback: "Coerente. A resistência prolongada depende do sistema oxidativo, desenvolvido por treino aeróbio bem dosado." },
      { id: "c2", label: "Somente sprints máximos curtos.", tone: "cautela", feedback: "Sprints priorizam as vias rápidas; sozinhos, desenvolvem pouco a base oxidativa da resistência longa." },
      { id: "c3", label: "Somente musculação pesada.", tone: "aceitavel", feedback: "A força ajuda, mas o estímulo aeróbio específico é o que mais desenvolve o sistema oxidativo." },
    ],
  },
  quiz: [
    q("q1", "variavel", "Um esforço prolongado e de baixa intensidade depende sobretudo do sistema:", [
      { id: "a", label: "Oxidativo." }, { id: "b", label: "Fosfagênio." },
    ], "a", "O sistema oxidativo repõe ATP de forma sustentável, predominando em esforços prolongados."),
    q("q2", "verdadeiro-falso", "Em cada esforço, apenas um sistema energético atua, isolado dos demais.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "f", "As vias atuam juntas; o que muda é a predominância conforme intensidade e duração."),
  ],
  uncertainty: "A contribuição relativa das vias varia com intensidade, duração, treino e indivíduo, e as transições são graduais. Use o conceito para orientar o estímulo, não como cálculo exato.",
  related: [
    { title: "Substratos", href: `/aprender/conteudos/${DISC}--substratos`, type: "conceito" },
    { title: "Consumo de oxigênio", href: "/aprender/conteudos/fisiologia-humana--consumo-oxigenio", type: "mecanismo" },
    { title: "Intervalos entre séries", href: "/aprender/conteudos/forca-repeticoes-em-reserva", type: "mecanismo" },
  ],
  refs: ["ref-diretriz-forca", "ref-oms-atividade", "ref-acsm-getp11"],
  applyRx: "Relacione duração e intensidade ao sistema energético predominante: esforços curtos e intensos usam vias rápidas; contínuos e longos, o oxidativo. Para resultados, pense no acúmulo ao longo do tempo.",
});

const substratos = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-vias-energeticas`, moduleSlug: "vias-energeticas",
  slug: `${DISC}--substratos`, title: "Substratos: quais combustíveis o corpo usa",
  subtitle: "Vias energéticas", description: "Fosfocreatina, carboidrato e gordura são combustíveis com papéis diferentes conforme a intensidade.",
  level: "fundamental", minutes: 9, type: "conceito", kicker: K, tags: ["substratos", "carboidrato", "gordura"],
  hero: "O corpo escolhe o combustível conforme a demanda. Fosfocreatina para o pico, carboidrato para o intenso, gordura para o prolongado e leve. Entender isso evita conclusões simplistas sobre 'zona de queima de gordura'.",
  question: "Treinar em intensidade baixa 'na zona de queima de gordura' emagrece mais do que treinar mais intenso?",
  concepts: [
    { term: "Substrato energético", definition: "Fonte usada para gerar energia: fosfocreatina (esforços máximos e curtíssimos), carboidrato (esforços intensos) e gordura (esforços leves e prolongados, e em repouso)." },
    { term: "Uso proporcional", definition: "Em intensidade baixa, a proporção de gordura usada é maior; em intensidade alta, o carboidrato predomina. Proporção não é o mesmo que quantidade total gasta." },
  ],
  apply: "Leia esforços pela intensidade: baixa favorece a proporção de gordura; alta, o carboidrato. Mas o que emagrece é o gasto total e a adesão ao longo do tempo, não a proporção de uma sessão. Responder à abertura: a intensidade baixa usa proporcionalmente mais gordura, porém a intensidade maior costuma gastar mais energia total; o emagrecimento depende do balanço ao longo do tempo, não da 'zona' de uma sessão.",
  special: [
    "Emagrecimento: priorize volume, adesão e gasto total; a 'zona de queima de gordura' é um conceito mal interpretado.",
    "Esforços intensos: dependem de carboidrato disponível; alimentação e recuperação importam.",
    "Diabetes: a interação entre exercício e glicose pede cuidados e conduta do profissional de saúde.",
  ],
  mistake: {
    mistake: "Prescrever só intensidade baixa 'para queimar gordura', ignorando que o gasto total e a adesão determinam o emagrecimento.",
    instead: "Foque no gasto total e na adesão ao longo do tempo, escolhendo intensidades que o aluno sustenta. A proporção de substrato de uma sessão não determina o resultado.",
  },
  professionalCase: {
    prompt: "Aluna insiste em treinar sempre muito leve 'para queimar gordura' e não progride no emagrecimento. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Explicar que o emagrecimento depende do gasto total e da adesão, e variar intensidades que ela sustente para aumentar o gasto e o prazer.", tone: "recomendada", feedback: "Coerente. A 'zona de queima' engana; o resultado vem do balanço energético ao longo do tempo, com adesão." },
      { id: "c2", label: "Reduzir ainda mais a intensidade para 'usar mais gordura'.", tone: "cautela", feedback: "Menor intensidade aumenta a proporção de gordura, mas tende a reduzir o gasto total; não é o caminho." },
      { id: "c3", label: "Impor treinos muito intensos que ela não sustenta.", tone: "aceitavel", feedback: "Intensidade alta gasta mais, mas sem adesão não se sustenta; equilibrar com o que ela mantém é melhor." },
    ],
  },
  quiz: [
    q("q1", "verdadeiro-falso", "Treinar 'na zona de queima de gordura' (baixa intensidade) garante mais emagrecimento do que treinos mais intensos.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "f", "A baixa intensidade usa proporcionalmente mais gordura, mas o emagrecimento depende do gasto total e da adesão."),
    q("q2", "conduta", "Para o emagrecimento, o mais importante é:", [
      { id: "a", label: "O gasto total e a adesão ao longo do tempo." },
      { id: "b", label: "A proporção de gordura usada em uma sessão isolada." },
    ], "a", "O balanço energético ao longo do tempo determina o emagrecimento, não a proporção de substrato de uma sessão."),
  ],
  uncertainty: "A relação entre substratos, intensidade e composição corporal é complexa e individual. Use o conceito para orientar, priorizando gasto total e adesão sobre a 'zona' de uma sessão.",
  related: [
    { title: "Sistemas energéticos", href: `/aprender/conteudos/${DISC}--sistemas-energeticos`, type: "conceito" },
    { title: "Gasto energético", href: `/aprender/conteudos/${DISC}--gasto-energetico`, type: "conceito" },
    { title: "Alinhamento de expectativa", href: "/aprender/conteudos/comunicacao-e-adesao--expectativa", type: "conceito" },
  ],
  refs: ["ref-oms-atividade", "ref-diretriz-forca", "ref-acsm-getp11"],
  applyRx: "Leia esforços pela intensidade (baixa favorece proporção de gordura, alta o carboidrato), mas priorize o gasto total e a adesão ao longo do tempo, que são o que de fato determina o emagrecimento.",
});

const gasto = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-metabolismo-treino`, moduleSlug: "metabolismo-treino",
  slug: `${DISC}--gasto-energetico`, title: "Gasto energético: onde a energia realmente vai",
  subtitle: "Metabolismo e treino", description: "A energia gasta no dia inclui repouso, atividade e digestão; entender isso orienta o papel do treino no emagrecimento.",
  level: "intermediario", minutes: 10, type: "conceito", kicker: K, tags: ["gasto energético", "metabolismo", "emagrecimento"],
  hero: "O treino é uma peça do gasto energético, não a única. Repouso, atividades do dia e digestão somam muito. Entender essa conta ajuda a colocar o exercício no lugar certo do emagrecimento.",
  question: "Uma hora de academia por dia é suficiente para emagrecer se o resto do dia é sedentário?",
  concepts: [
    { term: "Gasto energético total", definition: "Soma da energia gasta em repouso (a maior parte na maioria das pessoas), na atividade física (treino e movimento do dia) e na digestão dos alimentos." },
    { term: "Atividade não estruturada", definition: "O movimento fora do treino (caminhar, subir escadas, tarefas do dia) pode representar uma parcela relevante do gasto e é frequentemente subestimado." },
  ],
  apply: "Coloque o treino no contexto do gasto total: ele contribui, mas o movimento do dia inteiro e o repouso somam muito. Incentive atividade não estruturada e sustente a adesão. Responder à abertura: uma hora de treino ajuda, mas um dia sedentário limita o gasto total; somar mais movimento ao dia potencializa o emagrecimento.",
  special: [
    "Emagrecimento: aumentar o movimento do dia (passos, escadas) soma ao treino e sustenta o gasto.",
    "Rotinas sedentárias: pequenas mudanças de hábito no dia têm impacto no gasto total.",
    "A conduta nutricional específica é do profissional de nutrição; oriente movimento dentro do escopo.",
  ],
  mistake: {
    mistake: "Depositar todo o emagrecimento na hora de treino, ignorando o sedentarismo do resto do dia.",
    instead: "Trate o gasto total: treino mais movimento do dia mais hábitos. Incentivar atividade não estruturada amplia o resultado sem depender só da sessão.",
  },
  professionalCase: {
    prompt: "Aluno treina uma hora por dia mas passa o resto sentado e não emagrece como esperava. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Incentivar mais movimento ao longo do dia (passos, escadas, pausas ativas) para aumentar o gasto total, além do treino.", tone: "recomendada", feedback: "Coerente. O gasto do dia inteiro importa; somar atividade não estruturada potencializa o emagrecimento." },
      { id: "c2", label: "Dobrar o tempo de treino sem mudar o resto do dia.", tone: "aceitavel", feedback: "Mais treino ajuda, mas mudar o sedentarismo do dia costuma somar mais e ser sustentável." },
      { id: "c3", label: "Concluir que exercício não emagrece.", tone: "cautela", feedback: "O exercício contribui; o ponto é o gasto total, incluindo o movimento do dia e a adesão." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Para aumentar o gasto energético de quem treina uma hora e é sedentário no resto do dia, o mais eficaz costuma ser:", [
      { id: "a", label: "Aumentar o movimento não estruturado ao longo do dia." },
      { id: "b", label: "Apenas alongar mais no fim do treino." },
    ], "a", "O movimento do dia inteiro soma ao treino; incentivá-lo amplia o gasto total de forma sustentável."),
    q("q2", "verdadeiro-falso", "Na maioria das pessoas, o gasto em repouso é uma parcela grande do gasto energético total.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "v", "O gasto de repouso costuma ser a maior fração; treino e movimento somam a ele."),
  ],
  uncertainty: "As proporções do gasto variam entre pessoas e com o contexto, e a resposta ao treino é individual. Use o conceito para posicionar o exercício, com conduta nutricional do profissional de nutrição.",
  related: [
    { title: "EPOC", href: `/aprender/conteudos/${DISC}--epoc`, type: "mecanismo" },
    { title: "Substratos", href: `/aprender/conteudos/${DISC}--substratos`, type: "conceito" },
    { title: "Barreiras à prática", href: "/aprender/conteudos/comunicacao-e-adesao--barreiras", type: "conceito" },
  ],
  refs: ["ref-oms-atividade", "ref-diretriz-forca", "ref-acsm-getp11"],
  applyRx: "Coloque o treino no contexto do gasto total (repouso, atividade e digestão) e incentive movimento não estruturado ao longo do dia; o gasto do dia inteiro, mais adesão, determina o emagrecimento.",
});

const epoc = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-metabolismo-treino`, moduleSlug: "metabolismo-treino",
  slug: `${DISC}--epoc`, title: "EPOC: o gasto depois do exercício, sem exagero",
  subtitle: "Metabolismo e treino", description: "O consumo de oxigênio fica elevado após o esforço para restaurar o equilíbrio; é real, mas costuma ser superestimado.",
  level: "intermediario", minutes: 9, type: "mecanismo", kicker: K, tags: ["EPOC", "pós-exercício", "gasto"],
  hero: "Depois de um esforço intenso, o corpo segue consumindo mais oxigênio para voltar ao normal. Esse gasto extra existe, mas é frequentemente vendido como um milagre que ele não é.",
  question: "Um treino intenso 'continua queimando calorias por 48 horas' o suficiente para dispensar cuidado com o resto do dia?",
  concepts: [
    { term: "EPOC", definition: "Consumo de oxigênio elevado após o exercício, usado para restaurar reservas, remover metabólitos e voltar à homeostase. Maior após esforços mais intensos." },
    { term: "Magnitude realista", definition: "O gasto extra do EPOC é real, mas na maioria dos casos representa uma fração modesta do gasto total, não um valor que compense excessos ou dispense o restante." },
  ],
  mechanism: {
    title: "Por que o gasto continua após o treino",
    steps: [
      { label: "Esforço perturba o equilíbrio", detail: "Reservas são consumidas e metabólitos se acumulam durante o exercício intenso." },
      { label: "Recuperação consome energia", detail: "Repor reservas, remover metabólitos e restaurar a temperatura e a respiração gasta oxigênio." },
      { label: "Gasto elevado por um tempo", detail: "O consumo fica acima do repouso por um período, maior após esforços mais intensos." },
      { label: "Contribuição modesta", detail: "Somado, esse extra costuma ser uma fração pequena do gasto total do dia." },
    ],
  },
  apply: "Considere o EPOC como um bônus modesto de esforços intensos, não como o motor do emagrecimento. Use-o para valorizar a intensidade quando cabe, sem prometer efeitos exagerados. Responder à abertura: o EPOC existe, mas é modesto; ele não compensa um dia de excessos nem dispensa o cuidado com o gasto total e a adesão.",
  special: [
    "Emagrecimento: o EPOC ajuda um pouco; o essencial segue sendo gasto total e adesão.",
    "Marketing de treinos: desconfie de promessas de 'queima por 48 horas' como argumento principal.",
    "Populações sensíveis: a intensidade que gera mais EPOC pede triagem e cuidados de segurança.",
  ],
  mistake: {
    mistake: "Vender o EPOC como um efeito que compensa excessos alimentares ou dispensa o gasto do resto do dia.",
    instead: "Trate o EPOC como um bônus modesto de esforços intensos. O que emagrece é o gasto total e a adesão ao longo do tempo, não a promessa de queima prolongada.",
  },
  professionalCase: {
    prompt: "Aluno acredita que, por fazer treinos intensos, pode comer à vontade porque 'queima por dois dias'. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Explicar que o EPOC é modesto e que o resultado depende do gasto total e da adesão, alinhando expectativa realista.", tone: "recomendada", feedback: "Coerente. O EPOC contribui pouco; comunicar isso evita expectativa irreal e frustração." },
      { id: "c2", label: "Confirmar que o EPOC compensa os excessos.", tone: "cautela", feedback: "O EPOC é modesto; não compensa excessos de forma significativa." },
      { id: "c3", label: "Só aumentar a intensidade para 'queimar mais depois'.", tone: "aceitavel", feedback: "Intensidade tem valor, mas o EPOC não é o motor; o gasto total e a adesão pesam mais." },
    ],
  },
  quiz: [
    q("q1", "verdadeiro-falso", "O EPOC (gasto pós-exercício) costuma ser uma fração modesta do gasto total do dia.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "v", "O EPOC é real, mas na maioria dos casos representa uma parcela pequena do gasto total."),
    q("q2", "conduta", "Sobre o EPOC de treinos intensos, a comunicação mais honesta é:", [
      { id: "a", label: "É um bônus modesto; o resultado depende do gasto total e da adesão." },
      { id: "b", label: "Ele queima calorias suficientes para compensar excessos." },
    ], "a", "Comunicar a magnitude realista do EPOC evita expectativa irreal; o essencial é o balanço ao longo do tempo."),
  ],
  uncertainty: "A magnitude do EPOC varia com intensidade, duração e indivíduo, e é frequentemente superestimada. Use-o como bônus, não como argumento central de emagrecimento.",
  related: [
    { title: "Gasto energético", href: `/aprender/conteudos/${DISC}--gasto-energetico`, type: "conceito" },
    { title: "Incerteza científica", href: "/aprender/conteudos/leitura-critica-de-evidencias--incerteza", type: "conceito" },
    { title: "Treino intervalado", href: "/aprender/conteudos/treinamento-cardiorrespiratorio--intervalado", type: "conceito" },
  ],
  refs: ["ref-oms-atividade", "ref-diretriz-forca", "ref-acsm-getp11"],
  applyRx: "Trate o EPOC como um bônus modesto de esforços intensos, sem prometer efeitos exagerados; o emagrecimento depende do gasto total e da adesão ao longo do tempo.",
});

export const bioquimicaModules: Module[] = [
  deepModule({ id: `m-${DISC}-vias-energeticas`, disciplineId: DISC_ID, slug: "vias-energeticas", title: "Vias energéticas", objective: "Relacionar duração e intensidade ao sistema e ao substrato predominante.", order: 1, level: "fundamental", lessons: [sistemas, substratos], applications: ["Ler esforços pela via e pelo substrato, sem simplificar 'queima de gordura'"] }),
  deepModule({ id: `m-${DISC}-metabolismo-treino`, disciplineId: DISC_ID, slug: "metabolismo-treino", title: "Metabolismo e treino", objective: "Entender o gasto e a recuperação metabólica com realismo.", order: 2, level: "intermediario", prerequisites: [`m-${DISC}-vias-energeticas`], lessons: [gasto, epoc], applications: ["Posicionar o treino no gasto total e comunicar o EPOC com realismo"] }),
];

export const bioquimicaLessons: Lesson[] = [sistemas, substratos, gasto, epoc];
