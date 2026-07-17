import type { Lesson, Module } from "../types";
import { deepLesson, deepModule, q } from "./authoring";

/** PLANEJAMENTO E PERIODIZAÇÃO, disciplina autorada em profundidade. */

const DISC = "planejamento-e-periodizacao";
const DISC_ID = "d-periodizacao";
const K = "Planejamento e periodização";

const especificidade = deepLesson({
  disciplineSlug: DISC,
  moduleId: `m-${DISC}-principios`,
  moduleSlug: "principios",
  slug: `${DISC}--especificidade`,
  title: "Especificidade: o treino reflete o estímulo",
  subtitle: "Princípios do planejamento",
  description: "As adaptações espelham o que se treina. Alinhar o estímulo ao objetivo é o primeiro princípio de qualquer plano.",
  level: "intermediario",
  minutes: 10,
  type: "conceito",
  kicker: K,
  tags: ["especificidade", "objetivo", "planejamento"],
  hero: "O corpo se adapta ao que é exigido dele, na direção em que é exigido. Um plano começa alinhando o estímulo ao objetivo, antes de qualquer sofisticação de método.",
  question: "Um aluno quer ficar mais forte no agachamento, mas o treino é cheio de circuitos leves e variados. Por que ele pode não progredir no que quer?",
  concepts: [
    { term: "Especificidade", definition: "As adaptações refletem o tipo de estímulo aplicado: treinar força pesada desenvolve força; treinar resistência desenvolve resistência. O plano precisa apontar para o objetivo." },
    { term: "Transferência", definition: "O quanto uma adaptação treinada se converte no resultado desejado. Estímulos mais parecidos com a meta costumam transferir melhor." },
  ],
  figure: { id: "homeostase-circuito" },
  apply: "Antes de escolher métodos, defina o objetivo e garanta que a maior parte do estímulo aponte para ele. Responder à abertura: para ficar forte no agachamento, o treino precisa incluir agachar com carga progressiva e boas margens, não apenas circuitos leves. Variedade é útil, mas não pode diluir o estímulo específico do objetivo.",
  special: [
    "Idosos: se o objetivo é autonomia, priorize força e padrões do cotidiano (sentar e levantar, subir escada).",
    "Reabilitação e retorno ao esporte: o estímulo se aproxima gradualmente das demandas específicas, conforme a tolerância.",
    "Saúde geral: mesmo aqui, alinhar o estímulo aos ganhos desejados (aeróbio, força, mobilidade) organiza o plano.",
  ],
  mistake: {
    mistake: "Encher o programa de variedade e novidade sem que o estímulo principal aponte para o objetivo do aluno.",
    instead: "Deixe a maior parte do trabalho específica ao objetivo e use a variação como tempero, não como prato principal.",
  },
  professionalCase: {
    prompt: "Aluno quer aumentar a força no supino, mas o treino atual é só circuito metabólico variado. Qual ajuste é mais coerente?",
    choices: [
      { id: "c1", label: "Incluir supino e empurrar com carga progressiva e boas margens como estímulo central, mantendo algum condicionamento.", tone: "recomendada", feedback: "Coerente. A especificidade pede treinar o padrão-alvo com carga; o circuito sozinho não desenvolve força máxima." },
      { id: "c2", label: "Manter só o circuito, esperando que a força venha do condicionamento.", tone: "cautela", feedback: "O estímulo não é específico ao objetivo; a transferência para força máxima é baixa." },
      { id: "c3", label: "Trocar de exercício toda semana para variar bastante.", tone: "aceitavel", feedback: "Variar demais dilui o estímulo específico e dificulta medir a progressão no supino." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Para desenvolver força máxima num padrão, o estímulo central deve ser:", [
      { id: "a", label: "Treinar esse padrão com carga progressiva e boas margens." },
      { id: "b", label: "Circuitos leves e muito variados." },
    ], "a", "A especificidade exige treinar o padrão-alvo com carga; circuitos leves têm baixa transferência para força."),
    q("q2", "verdadeiro-falso", "Muita variedade sempre melhora o resultado, independentemente do objetivo.", [
      { id: "v", label: "Verdadeiro" },
      { id: "f", label: "Falso" },
    ], "f", "Variedade em excesso dilui o estímulo específico; ela ajuda como complemento, não como base."),
  ],
  uncertainty: "O grau ideal de especificidade versus variação depende do objetivo, do nível e da fase; não há receita única. Use o objetivo como bússola do plano.",
  related: [
    { title: "Variação", href: `/aprender/conteudos/${DISC}--variacao`, type: "conceito" },
    { title: "Periodização linear e ondulatória", href: `/aprender/conteudos/${DISC}--linear-ondulatoria`, type: "comparacao" },
    { title: "Intensidade e volume", href: "/aprender/conteudos/forca-intensidade-e-volume", type: "conceito" },
  ],
  refs: ["ref-diretriz-forca", "ref-acsm-progressao-2009"],
  applyRx: "Defina o objetivo e faça a maior parte do estímulo apontar para ele; use a variação como complemento. Estímulos parecidos com a meta transferem melhor para o resultado desejado.",
});

const variacao = deepLesson({
  disciplineSlug: DISC,
  moduleId: `m-${DISC}-principios`,
  moduleSlug: "principios",
  slug: `${DISC}--variacao`,
  title: "Variação: sustentar o progresso e a adesão",
  subtitle: "Princípios do planejamento",
  description: "Alternar estímulos ajuda a evitar platôs e o tédio, desde que preserve a direção do objetivo.",
  level: "intermediario",
  minutes: 10,
  type: "conceito",
  kicker: K,
  tags: ["variação", "platô", "adesão"],
  hero: "Variar mantém o estímulo desafiador e o treino interessante. O segredo é variar sem perder o rumo: mudar detalhes que renovam o desafio, não o objetivo.",
  question: "O aluno estagnou e está entediado. Como variar o treino sem jogar fora a especificidade que ele precisa?",
  concepts: [
    { term: "Variação", definition: "Alternância planejada de estímulos (exercícios, faixas de repetição, ênfases) para renovar o desafio e sustentar o progresso e a adesão." },
    { term: "Variação com direção", definition: "Mudar o suficiente para renovar o estímulo mantendo a maior parte do trabalho alinhada ao objetivo. Variar não é trocar tudo." },
  ],
  apply: "Ao notar platô ou desânimo, varie de forma dirigida: troque um exercício acessório, ajuste a faixa de repetições ou a ênfase, mantendo os padrões centrais do objetivo. Responder à abertura: renove o desafio e o interesse mexendo em detalhes, sem abandonar o estímulo específico que o aluno precisa.",
  special: [
    "Iniciantes: precisam de pouca variação; a progressão simples já entrega resultado e aprendizado.",
    "Avançados: podem precisar de mais variação para seguir progredindo e manter a motivação.",
    "Baixa adesão: variar exercícios prazerosos ajuda a manter a frequência, o que importa mais do que o método perfeito.",
  ],
  mistake: {
    mistake: "Trocar todo o programa a cada estagnação ou tédio, reiniciando o aprendizado e impedindo medir a progressão.",
    instead: "Varie de forma cirúrgica: um ou poucos elementos por vez, preservando os padrões centrais. Assim você renova o estímulo sem perder o rumo nem a comparabilidade.",
  },
  professionalCase: {
    prompt: "Aluno intermediário estagnou no treino e reclama de tédio. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Variar acessórios e ajustar faixas de repetição, mantendo os exercícios centrais do objetivo.", tone: "recomendada", feedback: "Coerente. Renova o estímulo e o interesse sem abandonar a especificidade nem a progressão dos padrões principais." },
      { id: "c2", label: "Trocar todos os exercícios por novos.", tone: "cautela", feedback: "Reinicia o aprendizado, dificulta medir progresso e pode diluir o estímulo específico." },
      { id: "c3", label: "Manter tudo idêntico e insistir.", tone: "aceitavel", feedback: "Ignora o platô e o desânimo; alguma variação dirigida costuma ajudar a destravar." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Diante de platô e tédio, variar de forma coerente significa:", [
      { id: "a", label: "Ajustar poucos elementos por vez, mantendo os padrões centrais do objetivo." },
      { id: "b", label: "Trocar o programa inteiro." },
    ], "a", "A variação dirigida renova o estímulo sem perder a especificidade nem a possibilidade de medir progresso."),
    q("q2", "verdadeiro-falso", "Iniciantes precisam de muita variação para progredir.", [
      { id: "v", label: "Verdadeiro" },
      { id: "f", label: "Falso" },
    ], "f", "Iniciantes progridem com pouca variação; a progressão simples já entrega resultado e aprendizado."),
  ],
  uncertainty: "A quantidade ideal de variação varia com nível, objetivo e preferências; excesso atrapalha, escassez entedia. Ajuste pela resposta e pela adesão do aluno.",
  related: [
    { title: "Especificidade", href: `/aprender/conteudos/${DISC}--especificidade`, type: "conceito" },
    { title: "Mesociclo", href: `/aprender/conteudos/${DISC}--mesociclo`, type: "conceito" },
    { title: "Sobrecarga progressiva", href: "/aprender/conteudos/forca-sobrecarga-progressiva", type: "conceito" },
  ],
  refs: ["ref-diretriz-forca", "ref-acsm-progressao-2009"],
  applyRx: "Varie de forma dirigida diante de platô ou tédio: poucos elementos por vez, preservando os padrões centrais do objetivo. Priorize a adesão, que sustenta o resultado mais do que o método perfeito.",
});

const linearOndulatoria = deepLesson({
  disciplineSlug: DISC,
  moduleId: `m-${DISC}-modelos`,
  moduleSlug: "modelos",
  slug: `${DISC}--linear-ondulatoria`,
  title: "Periodização linear e ondulatória",
  subtitle: "Modelos de periodização",
  description: "Duas formas clássicas de distribuir volume e intensidade no tempo, e como escolher entre elas com bom senso.",
  level: "avancado",
  minutes: 12,
  type: "comparacao",
  kicker: K,
  tags: ["periodização", "linear", "ondulatória"],
  hero: "Periodizar é organizar o estímulo ao longo do tempo. Os modelos linear e ondulatório são referências úteis, desde que tratados como esqueleto ajustável, não como dogma.",
  question: "Para um aluno que treina três vezes por semana com objetivo de força e hipertrofia, faz diferença variar a intensidade dentro da semana ou ao longo dos meses?",
  concepts: [
    { term: "Periodização linear", definition: "Progressão gradual ao longo de blocos: começa com mais volume e menos intensidade e caminha para menos volume e mais intensidade ao longo de semanas a meses." },
    { term: "Periodização ondulatória", definition: "Variação mais frequente, muitas vezes dentro da mesma semana, alternando sessões com ênfases diferentes (por exemplo, um dia mais pesado, outro mais moderado)." },
  ],
  comparison: {
    title: "Quando cada modelo tende a caber",
    leftTitle: "Linear",
    rightTitle: "Ondulatória",
    leftItems: [
      "Estrutura simples, fácil de comunicar e acompanhar.",
      "Boa para iniciantes e para objetivos com um pico definido.",
      "Muda a ênfase de forma gradual ao longo dos blocos.",
    ],
    rightItems: [
      "Varia a ênfase com frequência, muitas vezes na semana.",
      "Útil para treinar força e hipertrofia em paralelo.",
      "Pede um pouco mais de organização e entendimento do aluno.",
    ],
    note: "Responder à abertura: variar a intensidade dentro da semana (ondulatória) permite estimular força e hipertrofia em paralelo, o que costuma servir bem a esse objetivo. Ambos os modelos funcionam; a resposta individual e a adesão guiam a escolha e os ajustes.",
  },
  apply: "Escolha o modelo pela clareza para o aluno e pelo objetivo. Para iniciantes, uma progressão linear simples costuma bastar. Para força e hipertrofia em paralelo com poucos dias, alternar ênfases na semana (ondulatória) aproveita bem o tempo. Trate o modelo como esqueleto e ajuste pela resposta.",
  special: [
    "Iniciantes: a progressão linear simples é suficiente e fácil de sustentar.",
    "Rotinas imprevisíveis: modelos mais flexíveis, ajustados sessão a sessão, protegem o resultado quando faltam dias.",
    "Idosos: priorize consistência e segurança sobre a sofisticação do modelo.",
  ],
  mistake: {
    mistake: "Seguir um modelo de periodização à risca como se fosse regra, ignorando a resposta e a vida real do aluno.",
    instead: "Use o modelo como referência e ajuste volume, intensidade e ênfase pela resposta individual e pela adesão. O plano serve ao aluno, não o contrário.",
  },
  professionalCase: {
    prompt: "Aluno com três dias na semana quer força e hipertrofia juntas. Qual organização tende a servir melhor?",
    choices: [
      { id: "c1", label: "Alternar ênfases na semana (mais pesado, moderado, controlado), ajustando pela resposta.", tone: "recomendada", feedback: "Coerente com a lógica ondulatória: estimula força e hipertrofia em paralelo aproveitando os três dias." },
      { id: "c2", label: "Fazer meses inteiros só de força e depois só de hipertrofia.", tone: "aceitavel", feedback: "Funciona, mas atrasa um dos objetivos; com poucos dias, alternar na semana costuma render mais para metas paralelas." },
      { id: "c3", label: "Não planejar e treinar por impulso a cada dia.", tone: "cautela", feedback: "Sem estrutura, fica difícil garantir estímulo e progressão consistentes; algum plano é necessário." },
    ],
  },
  quiz: [
    q("q1", "variavel", "A periodização que varia a ênfase com frequência, muitas vezes na mesma semana, é a:", [
      { id: "a", label: "Ondulatória." },
      { id: "b", label: "Linear." },
    ], "a", "A ondulatória alterna ênfases com frequência; a linear muda de forma gradual ao longo de blocos."),
    q("q2", "verdadeiro-falso", "Existe um modelo de periodização comprovadamente superior para todos os alunos.", [
      { id: "v", label: "Verdadeiro" },
      { id: "f", label: "Falso" },
    ], "f", "Os modelos funcionam; a escolha depende do objetivo, do contexto e da resposta individual, não de superioridade absoluta."),
  ],
  uncertainty: "As comparações entre modelos costumam mostrar diferenças pequenas quando volume e intensidade são equiparados. Priorize adesão, clareza e ajuste individual sobre a escolha do rótulo.",
  related: [
    { title: "Mesociclo", href: `/aprender/conteudos/${DISC}--mesociclo`, type: "conceito" },
    { title: "Especificidade", href: `/aprender/conteudos/${DISC}--especificidade`, type: "conceito" },
    { title: "Frequência", href: "/aprender/conteudos/forca-frequencia", type: "conceito" },
  ],
  refs: ["ref-acsm-progressao-2009", "ref-diretriz-forca"],
  applyRx: "Escolha o modelo pela clareza e pelo objetivo, tratando-o como esqueleto ajustável. Para força e hipertrofia com poucos dias, alternar ênfases na semana aproveita bem o tempo; ajuste pela resposta.",
});

const mesociclo = deepLesson({
  disciplineSlug: DISC,
  moduleId: `m-${DISC}-modelos`,
  moduleSlug: "modelos",
  slug: `${DISC}--mesociclo`,
  title: "Mesociclo: organizar semanas com foco",
  subtitle: "Modelos de periodização",
  description: "O bloco de semanas com um objetivo definido, incluindo quando aliviar a carga, é a unidade prática de planejamento.",
  level: "avancado",
  minutes: 10,
  type: "conceito",
  kicker: K,
  tags: ["mesociclo", "descarga", "progressão"],
  hero: "Pensar em blocos de algumas semanas com um foco claro, e uma janela para aliviar a carga, transforma um amontoado de treinos num plano que progride e se sustenta.",
  question: "Como organizar as próximas semanas de um aluno para que ele progrida sem acumular fadiga até estagnar?",
  concepts: [
    { term: "Mesociclo", definition: "Bloco de semanas (comumente três a seis) com um foco de treino definido, dentro do qual a carga progride e, ao final, costuma haver alívio para recuperar." },
    { term: "Semana de descarga", definition: "Semana planejada de menor volume ou intensidade, em geral ao fim do bloco ou diante de fadiga, que permite recuperar e sustentar a progressão seguinte." },
  ],
  timeline: {
    title: "Um mesociclo típico de quatro semanas",
    items: [
      { time: "Semana 1", title: "Introdução", detail: "Carga moderada, ajuste técnico, base para progredir." },
      { time: "Semanas 2 a 3", title: "Progressão", detail: "Aumento gradual de carga ou volume dentro do foco do bloco." },
      { time: "Semana 4", title: "Descarga", detail: "Volume e intensidade reduzidos para recuperar antes do próximo bloco." },
    ],
  },
  apply: "Organize o treino em blocos de algumas semanas com um foco claro, progredindo a carga e reservando uma semana mais leve ao final ou diante de sinais de fadiga. Responder à abertura: progressão dentro do bloco mais uma descarga planejada equilibra estímulo e recuperação, evitando o acúmulo que leva à estagnação.",
  special: [
    "Idosos: blocos com descargas mais frequentes respeitam a recuperação mais lenta.",
    "Iniciantes: a estrutura pode ser simples; o próprio ritmo de progressão já inclui semanas mais leves quando necessário.",
    "Rotinas instáveis: a descarga pode coincidir com semanas de vida mais cheia, aproveitando o que já seria menor.",
  ],
  mistake: {
    mistake: "Progredir a carga indefinidamente, sem nunca planejar alívio, até a fadiga acumulada forçar uma parada maior.",
    instead: "Inclua descargas no plano, ao fim do bloco ou diante de sinais de fadiga. Aliviar a tempo sustenta a progressão de longo prazo.",
  },
  professionalCase: {
    prompt: "Aluno vinha progredindo, mas as últimas semanas ficaram pesadas e o desempenho começou a cair. Como estruturar o próximo bloco?",
    choices: [
      { id: "c1", label: "Fechar o bloco com uma semana de descarga e iniciar o próximo com carga moderada, progredindo de novo.", tone: "recomendada", feedback: "Coerente. A descarga recupera e o novo bloco retoma a progressão a partir de uma base mais fresca." },
      { id: "c2", label: "Manter a progressão de carga sem alívio para não perder o ritmo.", tone: "cautela", feedback: "Sem descarga, a fadiga acumulada tende a estagnar ou lesionar; o ritmo se perde de qualquer forma." },
      { id: "c3", label: "Parar completamente por duas semanas.", tone: "aceitavel", feedback: "Uma parada longa nem sempre é necessária; uma descarga costuma bastar para recuperar sem perder condicionamento." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Ao fim de um bloco de progressão com sinais de fadiga, o passo mais coerente é:", [
      { id: "a", label: "Uma semana de descarga antes de iniciar o próximo bloco." },
      { id: "b", label: "Aumentar ainda mais a carga para manter o ritmo." },
    ], "a", "A descarga recupera e sustenta a progressão seguinte; insistir na carga agrava a fadiga."),
    q("q2", "verdadeiro-falso", "Um mesociclo é um bloco de semanas com um foco definido, que costuma incluir alívio de carga.", [
      { id: "v", label: "Verdadeiro" },
      { id: "f", label: "Falso" },
    ], "v", "O mesociclo organiza semanas com um foco e uma janela de descarga para equilibrar estímulo e recuperação."),
  ],
  uncertainty: "A duração ideal do bloco e a frequência de descargas variam com nível, idade e resposta. Use a estrutura como guia e ajuste pelos sinais do aluno.",
  related: [
    { title: "Periodização linear e ondulatória", href: `/aprender/conteudos/${DISC}--linear-ondulatoria`, type: "comparacao" },
    { title: "Sinais de fadiga", href: "/aprender/conteudos/controle-de-carga-e-recuperacao--sinais-fadiga", type: "mecanismo" },
    { title: "Supercompensação", href: "/aprender/conteudos/fisiologia-do-exercicio--supercompensacao", type: "mecanismo" },
  ],
  refs: ["ref-acsm-progressao-2009", "ref-diretriz-forca"],
  applyRx: "Organize o treino em blocos de algumas semanas com foco claro, progredindo a carga e reservando descargas ao final ou diante de fadiga, para equilibrar estímulo e recuperação no longo prazo.",
});

const blocos = deepLesson({
  disciplineSlug: DISC,
  moduleId: `m-${DISC}-modelos`,
  moduleSlug: "modelos",
  slug: `${DISC}--blocos`,
  title: "Periodização em blocos",
  subtitle: "Modelos de periodização",
  description: "Concentrar o estímulo em poucas qualidades por vez, e o que isso cobra em troca.",
  level: "avancado",
  minutes: 12,
  type: "conceito",
  kicker: K,
  tags: ["periodização", "blocos", "acúmulo"],
  hero: "A periodização em blocos nasceu de uma queixa concreta do alto rendimento: treinar muitas qualidades ao mesmo tempo gera respostas fisiológicas que competem entre si, e o estímulo de cada uma acaba diluído. A resposta foi concentrar.",
  question: "Se treinar tudo ao mesmo tempo dilui o estímulo, por que não concentrar cada qualidade em um bloco? E por que isso não é a resposta automática para o seu aluno da academia?",
  concepts: [
    { term: "Bloco (mesociclo concentrado)", definition: "Um período de algumas semanas com carga concentrada em um número mínimo de qualidades compatíveis entre si, em vez do desenvolvimento simultâneo de muitas." },
    { term: "Acúmulo, transformação, realização", definition: "A sequência clássica dos blocos: primeiro construir capacidade e volume, depois converter em força ou potência, depois afinar para o desempenho. Cada bloco prepara o seguinte." },
    { term: "Efeito residual", definition: "O que sobra de uma qualidade depois que ela deixa de ser o foco. É o que permite abandonar temporariamente uma qualidade sem perdê-la, e o que define quanto tempo um bloco pode durar." },
  ],
  comparison: {
    title: "Concentrar ou distribuir",
    leftTitle: "Blocos (concentrado)",
    rightTitle: "Tradicional (simultâneo)",
    leftItems: [
      "Poucas qualidades por vez, com carga alta em cada uma.",
      "Fadiga gerida entre blocos, não dentro de todos eles.",
      "Permite organizar picos em datas definidas.",
    ],
    rightItems: [
      "Muitas qualidades ao mesmo tempo, com carga média em cada.",
      "Estímulo mais diluído por qualidade.",
      "Mais simples de montar e de comunicar.",
    ],
    note: "Responder à abertura: concentrar realmente entrega mais estímulo por qualidade, e é por isso que o modelo existe. O preço é que a qualidade fora de foco depende do efeito residual para não cair, e o modelo pede um calendário e um nível de base que o aluno comum da academia raramente tem.",
  },
  apply: "Use blocos quando existir uma data e uma qualidade a priorizar: um avançado preparando uma competição, um aluno com um objetivo específico e prazo. Para a maioria, o ganho de concentrar não paga a complexidade. Se usar, garanta a manutenção mínima do que saiu de foco.",
  special: [
    "Iniciantes: não faz sentido; quase tudo melhora ao mesmo tempo, e concentrar não acrescenta.",
    "Grupos especiais e retorno: a previsibilidade vale mais que a concentração; a progressão linear serve melhor.",
    "Idosos: força e equilíbrio precisam de estímulo contínuo; abandonar uma delas por semanas cobra caro.",
  ],
  mistake: {
    mistake: "Montar blocos longos e esquecer a qualidade que saiu de foco, chegando ao bloco seguinte com ela já derrubada.",
    instead: "Mantenha um estímulo mínimo do que não está em foco. O modelo prevê a manutenção, não o abandono; sem ela, cada bloco reconstrói o que o anterior perdeu.",
  },
  professionalCase: {
    prompt: "Aluno intermediário de academia, sem competição, quer hipertrofia. Vale montar blocos concentrados?",
    choices: [
      { id: "c1", label: "Não; um modelo mais simples entrega o mesmo com menos complexidade.", tone: "recomendada", feedback: "Coerente com a evidência disponível: com volume equiparado, os modelos empatam para hipertrofia. A complexidade extra não compra resultado aqui." },
      { id: "c2", label: "Sim, porque é o modelo mais avançado e ele já é intermediário.", tone: "cautela", feedback: "Mais complexo não significa melhor. A base de blocos vem de atletas com calendário; sem data-alvo, o modelo resolve um problema que este aluno não tem." },
      { id: "c3", label: "Talvez, se ele tiver um objetivo com data e aceitar a estrutura.", tone: "aceitavel", feedback: "Defensável se houver data e adesão. Ainda assim, confira se o ganho justifica a complexidade de comunicar e acompanhar." },
    ],
  },
  quiz: [
    q("q1", "variavel", "A sequência clássica dos blocos é:", [
      { id: "a", label: "Acúmulo, transformação, realização." },
      { id: "b", label: "Realização, acúmulo, transformação." },
    ], "a", "Primeiro se constrói capacidade (acúmulo), depois se converte em força ou potência (transformação), depois se afina para o desempenho (realização)."),
    q("q2", "verdadeiro-falso", "A periodização em blocos tem evidência estabelecida de superioridade para o aluno de academia.", [
      { id: "v", label: "Verdadeiro" },
      { id: "f", label: "Falso" },
    ], "f", "A base do modelo vem de atletas. Nos estudos com volume equiparado, os modelos empatam para hipertrofia; transportar o achado para a academia é uma extrapolação, não um resultado."),
  ],
  uncertainty: "A revisão de Issurin encontrou vantagem do modelo em blocos multi-alvo em 28 estudos, mas em atletas de endurance, esportes coletivos e força/potência. O modelo unidirecional concentrado melhorou componentes de aptidão sem melhorar o desempenho específico. Nada disso foi testado no aluno comum de academia, e a meta-análise de volume equiparado não mostra diferença entre modelos para hipertrofia.",
  related: [
    { title: "Periodização linear e ondulatória", href: `/aprender/conteudos/${DISC}--linear-ondulatoria`, type: "comparacao" },
    { title: "Mesociclo", href: `/aprender/conteudos/${DISC}--mesociclo`, type: "conceito" },
    { title: "Especificidade", href: `/aprender/conteudos/${DISC}--especificidade`, type: "conceito" },
  ],
  refs: ["ref-issurin-blocos-2016", "ref-issurin-periodizacao-2010", "ref-acsm-progressao-2009"],
  applyRx: "Reserve os blocos para quem tem base e uma data a atingir. Se usar, sequencie acúmulo, transformação e realização, e garanta a manutenção mínima da qualidade que saiu de foco.",
});

const flexivel = deepLesson({
  disciplineSlug: DISC,
  moduleId: `m-${DISC}-modelos`,
  moduleSlug: "modelos",
  slug: `${DISC}--flexivel`,
  title: "Periodização flexível",
  subtitle: "Modelos de periodização",
  description: "Manter a estrutura quando a agenda do aluno não colabora, sem virar treino por impulso.",
  level: "intermediario",
  minutes: 10,
  type: "conceito",
  kicker: K,
  tags: ["periodização", "flexível", "adesão"],
  hero: "O plano perfeito que o aluno não cumpre perde para o plano razoável que ele cumpre. A periodização flexível trata a agenda real como uma variável do plano, e não como um defeito do aluno.",
  question: "O aluno faltou na terça, que era o dia pesado, e aparece na quinta. Você faz o treino pesado atrasado, pula ele, ou deixa o aluno escolher?",
  concepts: [
    { term: "Periodização flexível", definition: "As ênfases da semana ficam definidas, mas qual delas entra em cada dia se decide perto da sessão, conforme a disponibilidade e o estado do aluno. É a ondulatória com a ordem solta." },
    { term: "Estímulo mínimo da semana", definition: "O que precisa acontecer para a semana ter valido: cada qualidade prioritária recebendo pelo menos uma sessão. É o que separa flexibilidade de improviso." },
  ],
  timeline: {
    title: "A semana que não saiu como o planejado",
    items: [
      { time: "Segunda", title: "Sessão pesada", detail: "Acontece conforme o previsto." },
      { time: "Terça", title: "O aluno falta", detail: "Na ordem fixa, a sessão moderada simplesmente se perde, e é sempre a mesma que se perde." },
      { time: "Quinta", title: "Ele aparece", detail: "Na flexível, você escolhe a ênfase que ainda não aconteceu e que mais protege o objetivo." },
      { time: "Sábado", title: "A semana fecha", detail: "As ênfases prioritárias foram cumpridas, mesmo fora da ordem original." },
    ],
  },
  apply: "Defina as ênfases da semana e o estímulo mínimo de cada uma. Quando um dia cair, escolha na hora a ênfase que ainda falta e que mais protege o objetivo, em vez de repetir a sessão do dia ou de perder a semana.",
  special: [
    "Rotinas imprevisíveis: é onde o modelo rende, porque a falta de um dia deixa de derrubar a semana.",
    "Iniciantes: combina bem, desde que as ênfases estejam escritas; sem elas, flexível vira aleatório.",
    "Grupos especiais: a flexibilidade cabe na ordem das sessões, nunca nos cuidados de segurança, que não são negociáveis pela agenda.",
  ],
  mistake: {
    mistake: "Chamar de flexível o treino decidido no impulso do dia, sem ênfases escritas nem estímulo mínimo definido.",
    instead: "Flexível é escolher entre opções planejadas, não escolher do zero. Escreva as ênfases da semana e o mínimo de cada uma; a liberdade é de ordem, não de conteúdo.",
  },
  professionalCase: {
    prompt: "Aluno com agenda instável falta um treino por semana, em média, e o resultado estagnou. O que muda primeiro?",
    choices: [
      { id: "c1", label: "Deixar as ênfases da semana definidas e escolher a do dia conforme quem aparece.", tone: "recomendada", feedback: "Ataca a causa: com ordem fixa, a falta sempre derruba a mesma sessão, e aquela qualidade nunca recebe estímulo." },
      { id: "c2", label: "Aumentar o volume dos dias em que ele aparece para compensar.", tone: "cautela", feedback: "Compensar volume num dia só concentra fadiga e não resolve a qualidade que ficou sem estímulo. O problema é de distribuição, não de dose." },
      { id: "c3", label: "Reduzir o plano para dois dias fixos que ele consiga cumprir.", tone: "aceitavel", feedback: "Defensável e honesto. Menos dias cumpridos podem render mais que três planejados e dois cumpridos." },
    ],
  },
  quiz: [
    q("q1", "verdadeiro-falso", "Periodização flexível significa deixar o aluno treinar o que quiser no dia.", [
      { id: "v", label: "Verdadeiro" },
      { id: "f", label: "Falso" },
    ], "f", "A flexibilidade é na ordem das ênfases planejadas. Sem ênfases escritas e sem estímulo mínimo, deixa de ser um modelo e vira improviso."),
    q("q2", "variavel", "O que a flexibilidade protege quando o aluno falta um dia?", [
      { id: "a", label: "O estímulo das qualidades prioritárias da semana." },
      { id: "b", label: "A carga máxima do exercício principal." },
    ], "a", "Escolhendo a ênfase que ainda falta, a semana fecha com as qualidades prioritárias estimuladas, mesmo fora da ordem original."),
  ],
  uncertainty: "A evidência específica é pequena. O ensaio que sustenta o modelo randomizou 16 iniciantes por 12 semanas com volume equiparado: deixar o aluno escolher o dia melhorou mais o leg press, sem diferença no supino nem no salto. Isso sustenta a plausibilidade da flexibilidade, não uma superioridade estabelecida. O argumento mais forte do modelo continua sendo a adesão.",
  related: [
    { title: "Periodização linear e ondulatória", href: `/aprender/conteudos/${DISC}--linear-ondulatoria`, type: "comparacao" },
    { title: "Periodização autorregulada", href: `/aprender/conteudos/${DISC}--autorregulada`, type: "conceito" },
    { title: "Variação", href: `/aprender/conteudos/${DISC}--variacao`, type: "conceito" },
  ],
  refs: ["ref-mcnamara-flexivel-2010", "ref-acsm-progressao-2009"],
  applyRx: "Escreva as ênfases da semana e o estímulo mínimo de cada uma; deixe a ordem livre. Quando um dia cair, escolha a ênfase que falta em vez de perder a semana.",
});

const autorregulada = deepLesson({
  disciplineSlug: DISC,
  moduleId: `m-${DISC}-modelos`,
  moduleSlug: "modelos",
  slug: `${DISC}--autorregulada`,
  title: "Periodização autorregulada",
  subtitle: "Modelos de periodização",
  description: "Ajustar a carga do dia ao estado do aluno, com um instrumento que ele saiba usar.",
  level: "avancado",
  minutes: 12,
  type: "conceito",
  kicker: K,
  tags: ["periodização", "autorregulação", "repetições de reserva"],
  hero: "A carga que estava certa no papel na segunda-feira pode estar errada na quinta, depois de uma noite ruim. A autorregulação aceita isso e transforma o estado do dia em uma variável do plano, em vez de fingir que ele não existe.",
  question: "Se o plano diz 80% de 1RM e hoje o aluno dormiu quatro horas, você mantém a carga, reduz no olho, ou tem um jeito melhor de decidir?",
  concepts: [
    { term: "Autorregulação", definition: "Ajustar o treino com base na medida do desempenho do dia ou na capacidade percebida pelo aluno, dentro dos limites que o plano definiu." },
    { term: "Repetições de reserva", definition: "Quantas repetições ainda dariam para fazer ao fim da série. É o instrumento que traduz esforço em número: PSE 10 significa nenhuma de reserva, PSE 9 significa uma, e assim por diante." },
    { term: "Teto de esforço", definition: "O limite que o plano fixa (por exemplo, não passar de 2 repetições de reserva). A carga varia, o teto não; é ele que impede a autorregulação de virar treinar até a falha todo dia." },
  ],
  mechanism: {
    title: "Como a carga do dia é decidida",
    steps: [
      { label: "O plano fixa a faixa e o teto", detail: "Não é o aluno que decide o que treinar: o plano define a faixa de repetições e com quantas repetições de reserva a série deve terminar." },
      { label: "A série informa o estado", detail: "O aluno executa e relata quantas repetições ainda daria. Nos dados de Zourdos, essa percepção acompanha a velocidade da barra: quanto mais lenta a repetição, maior o esforço relatado." },
      { label: "A carga se ajusta", detail: "Se a série terminou com mais reserva que o previsto, a carga sobe; com menos, desce. O estímulo pretendido é mantido apesar do dia." },
      { label: "O teto protege", detail: "Como o limite de esforço é fixo, um dia ruim vira menos carga, e não uma série até a falha com uma carga que o aluno não tem hoje." },
    ],
  },
  apply: "Autorregule quando o aluno souber usar a escala. Calibre antes: peça a estimativa de reserva e confira com o que ele de fato consegue fazer. Sem calibração, o número relatado é um chute com aparência de medida.",
  special: [
    "Iniciantes: a percepção ainda é imprecisa; a autorregulação chega depois que a técnica e a leitura de esforço se consolidam.",
    "Grupos especiais: útil para respeitar o dia, mas o teto de esforço vem dos cuidados da condição, não da vontade do aluno.",
    "Fases de sono ou estresse variáveis: é onde o modelo mais protege, porque a carga acompanha o estado sem exigir carga fixa.",
  ],
  mistake: {
    mistake: "Confundir autorregular com treinar sempre até a falha, ou pedir a percepção de esforço sem nunca ter calibrado a escala com o aluno.",
    instead: "Autorregular é manter o esforço pretendido variando a carga. Ensine a escala, confira a estimativa contra o desempenho real e fixe um teto de reserva antes de usar o número para decidir.",
  },
  professionalCase: {
    prompt: "Aluno avançado, plano com 3 séries a 2 repetições de reserva. Hoje ele relata reserva 4 na carga prevista. O que fazer?",
    choices: [
      { id: "c1", label: "Subir a carga até a série terminar com cerca de 2 de reserva.", tone: "recomendada", feedback: "É exatamente o que o modelo propõe: a carga serve ao esforço pretendido, não o contrário. Hoje ele está bem e a carga do papel ficou leve." },
      { id: "c2", label: "Manter a carga do papel, porque o plano é o plano.", tone: "aceitavel", feedback: "Não é errado, mas desperdiça o dia bom. Se a intenção era 2 de reserva, o estímulo de hoje ficou abaixo do planejado." },
      { id: "c3", label: "Fazer até a falha, já que ele está bem.", tone: "cautela", feedback: "Isso rompe o teto que o plano definiu e troca autorregulação por fadiga extra, que é o erro mais comum do modelo." },
    ],
  },
  quiz: [
    q("q1", "variavel", "Numa série que termina com PSE 9 na escala de repetições de reserva, o aluno:", [
      { id: "a", label: "Ainda conseguiria fazer 1 repetição." },
      { id: "b", label: "Chegou à falha e não faria nenhuma." },
    ], "a", "A escala ancora o esforço no que sobra: PSE 10 é nenhuma repetição de reserva, PSE 9 é uma, PSE 8 são duas."),
    q("q2", "verdadeiro-falso", "A autorregulação tem evidência ampla e consolidada de superioridade sobre a carga fixa.", [
      { id: "v", label: "Verdadeiro" },
      { id: "f", label: "Falso" },
    ], "f", "A revisão de Greig aponta o contrário: apesar de existir como estrutura desde os anos 1940, a pesquisa sistemática sobre a utilidade ampla ainda é limitada, e até a terminologia é inconsistente entre estudos."),
  ],
  uncertainty: "A autorregulação é mais um bom princípio que um resultado fechado. A revisão de Greig mostra que os estudos usam definições diferentes de prontidão, fadiga e resposta, o que impede somar os achados. O que está bem apoiado é o instrumento: a escala de repetições de reserva se relaciona de forma inversa e forte com a velocidade da barra, o que a torna utilizável na sala.",
  related: [
    { title: "Periodização flexível", href: `/aprender/conteudos/${DISC}--flexivel`, type: "conceito" },
    { title: "Periodização linear e ondulatória", href: `/aprender/conteudos/${DISC}--linear-ondulatoria`, type: "comparacao" },
    { title: "Mesociclo", href: `/aprender/conteudos/${DISC}--mesociclo`, type: "conceito" },
  ],
  refs: ["ref-greig-autorregulacao-2020", "ref-zourdos-rir-2016", "ref-helms-rir-2016"],
  applyRx: "Fixe a faixa e o teto de repetições de reserva no plano e deixe a carga do dia acompanhar o estado do aluno. Calibre a escala antes de usá-la para decidir.",
});

export const periodizacaoModules: Module[] = [
  deepModule({
    id: `m-${DISC}-principios`,
    disciplineId: DISC_ID,
    slug: "principios",
    title: "Princípios do planejamento",
    objective: "Organizar estímulos no tempo em direção a um objetivo.",
    order: 1,
    level: "intermediario",
    lessons: [especificidade, variacao],
    applications: ["Alinhar o estímulo ao objetivo e variar sem perder o rumo"],
  }),
  deepModule({
    id: `m-${DISC}-modelos`,
    disciplineId: DISC_ID,
    slug: "modelos",
    title: "Modelos de periodização",
    objective: "Escolher a organização conforme o contexto e ajustar pela resposta.",
    order: 2,
    level: "avancado",
    prerequisites: [`m-${DISC}-principios`],
    lessons: [linearOndulatoria, blocos, mesociclo],
    applications: ["Escolher e ajustar o modelo pela resposta e pela adesão"],
  }),
  deepModule({
    id: `m-${DISC}-ajuste`,
    disciplineId: DISC_ID,
    slug: "ajuste-a-realidade",
    title: "Ajuste à realidade do aluno",
    objective: "Manter o plano de pé quando a agenda e o dia do aluno não colaboram.",
    order: 3,
    level: "avancado",
    prerequisites: [`m-${DISC}-modelos`],
    lessons: [flexivel, autorregulada],
    applications: ["Proteger o estímulo quando falta um dia", "Ajustar a carga ao estado do dia com um instrumento calibrado"],
  }),
];

export const periodizacaoLessons: Lesson[] = [
  especificidade,
  variacao,
  linearOndulatoria,
  blocos,
  mesociclo,
  flexivel,
  autorregulada,
];
