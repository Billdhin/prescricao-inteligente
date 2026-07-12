import type { Lesson, Module } from "../types";
import { deepLesson, deepModule, q } from "./authoring";

/** COMUNICAÇÃO E ADESÃO, disciplina autorada em profundidade. */

const DISC = "comunicacao-e-adesao";
const DISC_ID = "d-comunicacao";
const K = "Comunicação e adesão";

const linguagem = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-comunicar`, moduleSlug: "comunicar",
  slug: `${DISC}--linguagem`, title: "Linguagem acessível: explicar sem jargão",
  subtitle: "Comunicação clara", description: "Traduzir o técnico em linguagem simples, conectada ao objetivo do aluno, aumenta a confiança e a adesão.",
  level: "fundamental", minutes: 9, type: "conceito", kicker: K, tags: ["linguagem", "clareza", "adesão"],
  hero: "O melhor plano falha se o aluno não entende o que fazer nem por quê. Explicar em linguagem simples, ligada ao que ele quer, é o que transforma instrução em ação.",
  question: "Por que dizer 'vamos trabalhar a cadeia posterior com dobradiça de quadril' pode afastar um aluno iniciante?",
  concepts: [
    { term: "Linguagem acessível", definition: "Explicar sem jargão, com palavras que o aluno reconhece, conectando cada orientação ao objetivo dele. Não é simplificar a ciência; é comunicar com clareza." },
    { term: "Carga cognitiva", definition: "A quantidade de informação nova que a pessoa processa de uma vez. Excesso de termos e instruções ao mesmo tempo atrapalha o aprendizado e a execução." },
  ],
  apply: "Fale o que o aluno reconhece, uma instrução por vez, ligando ao objetivo. Troque termos técnicos por descrições do movimento e do porquê. Responder à abertura: para o iniciante, 'empurrar o quadril para trás mantendo as costas firmes, para trabalhar glúteo e posterior de coxa' comunica melhor do que o jargão.",
  special: [
    "Iniciantes: uma correção por vez evita sobrecarga; acrescente detalhes conforme o aluno domina o básico.",
    "Idosos: conectar o exercício ao cotidiano (levantar da cadeira, subir escada) dá sentido e motivação.",
    "Grupos especiais: explicar os cuidados em linguagem simples aumenta a segurança percebida e a colaboração.",
  ],
  mistake: {
    mistake: "Demonstrar conhecimento com termos técnicos que o aluno não domina, gerando confusão em vez de clareza.",
    instead: "Use o jargão só quando ajuda o aluno; na dúvida, descreva o movimento e o objetivo com palavras do dia a dia.",
  },
  professionalCase: {
    prompt: "Aluno iniciante não executa bem o agachamento após explicações cheias de termos técnicos. Qual conduta comunica melhor?",
    choices: [
      { id: "c1", label: "Dar uma instrução simples por vez, com uma referência concreta (sentar numa cadeira imaginária) e o porquê.", tone: "recomendada", feedback: "Coerente. Reduz a carga cognitiva e conecta ao familiar, facilitando a execução." },
      { id: "c2", label: "Repetir os mesmos termos técnicos mais devagar.", tone: "cautela", feedback: "O problema não é a velocidade, é o vocabulário; repetir jargão não resolve." },
      { id: "c3", label: "Assumir que ele aprende sozinho com o tempo.", tone: "aceitavel", feedback: "Alguns aprendem, mas boa comunicação acelera e reduz frustração e risco." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Para um iniciante executar melhor, a comunicação mais eficaz é:", [
      { id: "a", label: "Uma instrução simples por vez, ligada ao objetivo, com referência concreta." },
      { id: "b", label: "Explicar toda a biomecânica com termos técnicos de uma vez." },
    ], "a", "Reduzir a carga cognitiva e usar linguagem familiar facilita o aprendizado e a execução."),
    q("q2", "verdadeiro-falso", "Usar mais termos técnicos sempre demonstra competência e ajuda o aluno.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "f", "O jargão só ajuda quando o aluno o domina; caso contrário, atrapalha a clareza."),
  ],
  uncertainty: "O nível ideal de detalhe varia com o aluno; alguns querem entender a fundo, outros só o essencial. Ajuste a linguagem à pessoa mantendo a clareza.",
  related: [
    { title: "Alinhamento de expectativa", href: `/aprender/conteudos/${DISC}--expectativa`, type: "conceito" },
    { title: "Comunicar a decisão", href: "/aprender/conteudos/raciocinio-de-prescricao--comunicar-decisao", type: "conceito" },
    { title: "Feedback na aprendizagem motora", href: "/aprender/conteudos/neurofisiologia-do-movimento--feedback", type: "conceito" },
  ],
  refs: ["ref-borg-pse", "ref-acsm-getp11"],
  applyRx: "Explique em linguagem simples, uma instrução por vez, ligada ao objetivo do aluno; use jargão só quando ajuda. Clareza aumenta a confiança, a execução e a adesão.",
});

const expectativa = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-comunicar`, moduleSlug: "comunicar",
  slug: `${DISC}--expectativa`, title: "Alinhamento de expectativa: metas e tempo realistas",
  subtitle: "Comunicação clara", description: "Combinar metas realistas e o tempo esperado de resultado reduz frustração e abandono.",
  level: "fundamental", minutes: 9, type: "conceito", kicker: K, tags: ["expectativa", "metas", "abandono"],
  hero: "Boa parte do abandono vem de expectativa desalinhada: resultado rápido demais, esforço subestimado. Combinar metas e tempo realistas no início protege a jornada.",
  question: "Um aluno quer perder 10 kg em um mês. Como alinhar a expectativa sem desmotivar?",
  concepts: [
    { term: "Alinhamento de expectativa", definition: "Combinar, no início, metas realistas e o tempo provável de resultado, para que o progresso real seja percebido como sucesso, não como fracasso." },
    { term: "Metas de processo", definition: "Metas sobre o que o aluno controla (frequência, execução, hábito), que sustentam a motivação melhor do que metas só de resultado, que dependem de fatores variados." },
  ],
  apply: "No início, transforme o desejo do aluno em metas realistas de resultado e, principalmente, de processo (comparecer, progredir a carga, dormir melhor). Explique o tempo provável. Responder à abertura: reoriente para uma meta saudável e sustentável, valorizando frequência e mudanças de hábito, para que o progresso real seja vivido como vitória.",
  special: [
    "Emagrecimento: expectativas irreais de velocidade são fonte comum de abandono; metas de processo ajudam a sustentar.",
    "Iniciantes: comemorar pequenas conquistas (constância, técnica) mantém a motivação enquanto o resultado se constrói.",
    "Retorno de lesão: alinhar o tempo de progressão evita frustração e pressa que provocam recaída.",
  ],
  mistake: {
    mistake: "Prometer resultados rápidos para engajar no começo, criando expectativa que a realidade não cumpre e leva ao abandono.",
    instead: "Combine metas realistas e valorize o processo. A satisfação com o progresso real sustenta a adesão melhor do que a promessa que decepciona.",
  },
  professionalCase: {
    prompt: "Aluna espera resultado estético grande em poucas semanas e ameaça desistir se não ver. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Alinhar metas realistas de resultado e de processo, definir marcos de curto prazo e comemorá-los.", tone: "recomendada", feedback: "Coerente. Metas de processo e marcos próximos mantêm a motivação enquanto o resultado maior se constrói." },
      { id: "c2", label: "Prometer o resultado no prazo dela para não perder a aluna.", tone: "cautela", feedback: "Promessa irreal gera decepção e abandono quando não se cumpre." },
      { id: "c3", label: "Dizer que ela precisa ter paciência, sem oferecer marcos.", tone: "aceitavel", feedback: "Pedir paciência sem metas concretas raramente sustenta a motivação." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Para sustentar a motivação de quem quer resultado rápido, o mais eficaz é:", [
      { id: "a", label: "Combinar metas realistas e valorizar metas de processo, com marcos próximos." },
      { id: "b", label: "Prometer o resultado no prazo desejado." },
    ], "a", "Metas de processo e marcos próximos mantêm a adesão; promessas irreais geram abandono."),
    q("q2", "verdadeiro-falso", "Metas de processo (frequência, execução, hábito) ajudam a sustentar a adesão.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "v", "Focar no que o aluno controla mantém a motivação enquanto o resultado, que depende de mais fatores, se constrói."),
  ],
  uncertainty: "O tempo de resultado varia muito entre pessoas; comunique faixas e tendências, não certezas. Ajuste as metas conforme a resposta e a vida do aluno.",
  related: [
    { title: "Linguagem acessível", href: `/aprender/conteudos/${DISC}--linguagem`, type: "conceito" },
    { title: "Barreiras à prática", href: `/aprender/conteudos/${DISC}--barreiras`, type: "conceito" },
    { title: "Construção de hábito", href: `/aprender/conteudos/${DISC}--habito`, type: "mecanismo" },
  ],
  refs: ["ref-oms-atividade", "ref-acsm-getp11"],
  applyRx: "Transforme o desejo do aluno em metas realistas de resultado e de processo, com marcos de curto prazo, e explique o tempo provável. Expectativa alinhada reduz frustração e abandono.",
});

const barreiras = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-adesao`, moduleSlug: "adesao",
  slug: `${DISC}--barreiras`, title: "Barreiras à prática: identificar e reduzir",
  subtitle: "Sustentar a adesão", description: "Tempo, dor, cansaço e motivação são barreiras comuns; reconhecê-las permite ajustar o plano para a vida real.",
  level: "intermediario", minutes: 9, type: "conceito", kicker: K, tags: ["barreiras", "adesão", "frequência"],
  hero: "A frequência é o que faz o treino funcionar, e ela esbarra em barreiras reais: falta de tempo, cansaço, dor, desânimo. O plano que ignora essas barreiras não é seguido.",
  question: "Um aluno some sempre nas semanas de trabalho intenso. O problema é falta de disciplina ou de um plano que caiba na vida dele?",
  concepts: [
    { term: "Barreiras à prática", definition: "Fatores que dificultam a constância: tempo, cansaço, dor, deslocamento, motivação, contexto. Reconhecê-las é o primeiro passo para reduzi-las." },
    { term: "Plano viável", definition: "Programa desenhado para caber na rotina real do aluno, com opções de sessão curta e de baixo atrito nos dias difíceis, para preservar a frequência." },
  ],
  apply: "Pergunte quais barreiras o aluno enfrenta e desenhe o plano em torno delas: sessões mais curtas para semanas cheias, opções em casa quando falta deslocamento, exercícios prazerosos para manter a motivação. Responder à abertura: com frequência caindo em semanas intensas, a solução costuma ser um plano flexível que cabe nesses períodos, não cobrar mais disciplina.",
  special: [
    "Rotinas de plantão ou pais de recém-nascidos: ter uma versão mínima da sessão preserva o hábito nos períodos difíceis.",
    "Dor como barreira: adaptar o treino à tolerância mantém o aluno em movimento em vez de afastá-lo.",
    "Baixa motivação: escolher atividades que o aluno gosta sustenta a frequência melhor do que o treino ideal que ele evita.",
  ],
  mistake: {
    mistake: "Interpretar a falta de frequência como falta de disciplina e cobrar mais do aluno, sem ajustar o plano à vida dele.",
    instead: "Identifique as barreiras e desenhe o plano em torno delas, com versões mínimas para os dias difíceis. Frequência sustentada vale mais do que o treino perfeito abandonado.",
  },
  professionalCase: {
    prompt: "Aluno falta sempre nas semanas de trabalho pesado e se sente culpado. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Criar uma versão curta e de baixo atrito da sessão para essas semanas, preservando o hábito.", tone: "recomendada", feedback: "Coerente. Um plano que cabe nas semanas difíceis mantém a frequência e reduz a culpa." },
      { id: "c2", label: "Reforçar que ele precisa de mais disciplina.", tone: "cautela", feedback: "Cobrar disciplina sem ajustar o plano raramente resolve barreiras reais de tempo e cansaço." },
      { id: "c3", label: "Manter o mesmo volume e aceitar as faltas.", tone: "aceitavel", feedback: "Aceitar sem oferecer alternativa deixa o aluno perder o ritmo e a motivação." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Diante de faltas nas semanas cheias, o mais eficaz costuma ser:", [
      { id: "a", label: "Oferecer uma versão curta da sessão que caiba nesses períodos." },
      { id: "b", label: "Cobrar mais disciplina do aluno." },
    ], "a", "Ajustar o plano às barreiras preserva a frequência; cobrar disciplina sem ajuste raramente funciona."),
    q("q2", "verdadeiro-falso", "Frequência sustentada com um plano viável vale mais do que o treino perfeito que é abandonado.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "v", "A constância é o motor do resultado; um plano que cabe na vida do aluno sustenta essa constância."),
  ],
  uncertainty: "As barreiras e as soluções são muito individuais; o que funciona para um aluno pode não servir a outro. Ajuste pela conversa e pela resposta ao longo do tempo.",
  related: [
    { title: "Construção de hábito", href: `/aprender/conteudos/${DISC}--habito`, type: "mecanismo" },
    { title: "Alinhamento de expectativa", href: `/aprender/conteudos/${DISC}--expectativa`, type: "conceito" },
    { title: "sRPE e carga interna", href: "/aprender/conteudos/controle-de-carga-e-recuperacao--srpe", type: "conceito" },
  ],
  refs: ["ref-oms-atividade", "ref-acsm-getp11"],
  applyRx: "Identifique as barreiras do aluno e desenhe o plano em torno delas, com versões mínimas para os dias difíceis. Preservar a frequência importa mais do que o treino ideal.",
});

const habito = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-adesao`, moduleSlug: "adesao",
  slug: `${DISC}--habito`, title: "Construção de hábito: tornar o treino automático",
  subtitle: "Sustentar a adesão", description: "A repetição consistente em contextos estáveis transforma o treino em parte da rotina.",
  level: "intermediario", minutes: 9, type: "mecanismo", kicker: K, tags: ["hábito", "rotina", "consistência"],
  hero: "O treino que vira hábito depende menos de motivação e mais de rotina. Repetir em horários e contextos estáveis reduz o atrito e torna a prática quase automática.",
  question: "Como ajudar um aluno a treinar de forma consistente sem depender de estar sempre motivado?",
  concepts: [
    { term: "Construção de hábito", definition: "Processo pelo qual uma ação repetida em um contexto estável passa a exigir menos esforço e decisão, tornando-se parte da rotina." },
    { term: "Gatilho de contexto", definition: "Sinal do ambiente ou da rotina (horário, local, ação anterior) que dispara o comportamento. Associar o treino a um gatilho estável facilita a constância." },
  ],
  mechanism: {
    title: "Como um hábito se forma",
    steps: [
      { label: "Gatilho estável", detail: "Um horário ou contexto fixo (por exemplo, logo após o trabalho) sinaliza a hora de treinar." },
      { label: "Ação de baixo atrito", detail: "Quanto mais fácil começar (roupa separada, academia no caminho), maior a chance de acontecer." },
      { label: "Recompensa percebida", detail: "Sensação de bem-estar, progresso ou prazer reforça a repetição." },
      { label: "Repetição", detail: "Com o tempo e a consistência, a ação passa a exigir menos motivação e decisão." },
    ],
  },
  apply: "Ajude o aluno a ancorar o treino em um gatilho estável, reduzir o atrito para começar e perceber uma recompensa. Sessões viáveis e prazerosas, repetidas no mesmo contexto, constroem o hábito. Responder à abertura: a consistência vem de rotina e baixo atrito, não de motivação constante, que oscila.",
  special: [
    "Iniciantes: começar pequeno e fácil favorece a formação do hábito antes de aumentar a exigência.",
    "Rotinas instáveis: ancorar em gatilhos que existem mesmo nos dias cheios protege a constância.",
    "Idosos: rotina previsível e prazer na atividade sustentam a prática ao longo do tempo.",
  ],
  mistake: {
    mistake: "Contar com a motivação para garantir a frequência, ignorando rotina, gatilhos e atrito.",
    instead: "Construa rotina: ancore o treino num gatilho estável, reduza o atrito e reforce a recompensa. O hábito sustenta a frequência quando a motivação falta.",
  },
  professionalCase: {
    prompt: "Aluno treina bem quando está motivado, mas some por semanas quando a motivação cai. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Ancorar o treino num horário ou contexto fixo e reduzir o atrito para começar, construindo rotina.", tone: "recomendada", feedback: "Coerente. Rotina e baixo atrito sustentam a frequência independentemente da motivação do dia." },
      { id: "c2", label: "Tentar mantê-lo sempre motivado com metas cada vez maiores.", tone: "cautela", feedback: "A motivação oscila; depender dela deixa a frequência instável." },
      { id: "c3", label: "Aceitar os sumiços como parte do processo.", tone: "aceitavel", feedback: "Sem estrutura de hábito, os sumiços tendem a se repetir; vale intervir na rotina." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Para tornar o treino consistente sem depender de motivação, o mais eficaz é:", [
      { id: "a", label: "Ancorar em um gatilho estável e reduzir o atrito para começar." },
      { id: "b", label: "Aumentar as metas para manter a motivação alta." },
    ], "a", "Rotina, gatilhos e baixo atrito constroem o hábito e sustentam a frequência quando a motivação oscila."),
    q("q2", "verdadeiro-falso", "Reduzir o atrito para começar aumenta a chance de o treino acontecer.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "v", "Quanto mais fácil iniciar, maior a probabilidade de repetição, o que favorece a formação do hábito."),
  ],
  uncertainty: "A velocidade de formação de hábito varia muito entre pessoas e comportamentos. Trate rotina e atrito como alavancas práticas, ajustando ao aluno.",
  related: [
    { title: "Barreiras à prática", href: `/aprender/conteudos/${DISC}--barreiras`, type: "conceito" },
    { title: "Alinhamento de expectativa", href: `/aprender/conteudos/${DISC}--expectativa`, type: "conceito" },
    { title: "Comunicar a decisão", href: "/aprender/conteudos/raciocinio-de-prescricao--comunicar-decisao", type: "conceito" },
  ],
  refs: ["ref-oms-atividade", "ref-acsm-getp11"],
  applyRx: "Ancore o treino num gatilho estável, reduza o atrito para começar e reforce a recompensa. Sessões viáveis e prazerosas, repetidas no mesmo contexto, constroem o hábito que sustenta a frequência.",
});

export const comunicacaoModules: Module[] = [
  deepModule({ id: `m-${DISC}-comunicar`, disciplineId: DISC_ID, slug: "comunicar", title: "Comunicação clara", objective: "Explicar decisões de forma acessível e alinhar expectativas.", order: 1, level: "fundamental", lessons: [linguagem, expectativa], applications: ["Explicar com clareza e combinar metas realistas"] }),
  deepModule({ id: `m-${DISC}-adesao`, disciplineId: DISC_ID, slug: "adesao", title: "Sustentar a adesão", objective: "Manter o aluno engajado reduzindo barreiras e construindo hábito.", order: 2, level: "intermediario", prerequisites: [`m-${DISC}-comunicar`], lessons: [barreiras, habito], applications: ["Reduzir barreiras e ancorar o treino em rotina"] }),
];

export const comunicacaoLessons: Lesson[] = [linguagem, expectativa, barreiras, habito];
