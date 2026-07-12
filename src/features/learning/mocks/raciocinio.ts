import type { Lesson, Module } from "../types";
import { deepLesson, deepModule, q } from "./authoring";

/** RACIOCÍNIO DE PRESCRIÇÃO, disciplina autorada em profundidade (núcleo do produto). */

const DISC = "raciocinio-de-prescricao";
const DISC_ID = "d-raciocinio";
const K = "Raciocínio de prescrição";

const criterios = deepLesson({
  disciplineSlug: DISC,
  moduleId: `m-${DISC}-decisao`,
  moduleSlug: "decisao",
  slug: `${DISC}--criterios-decisao`,
  title: "Critérios de decisão: transformar dados em escolha",
  subtitle: "Como decidir",
  description: "Objetivo, nível, restrição, equipamento e tolerância são os critérios que convertem a avaliação em uma prescrição defensável.",
  level: "intermediario",
  minutes: 12,
  type: "mecanismo",
  kicker: K,
  tags: ["critérios", "decisão", "prescrição"],
  hero: "Prescrever não é escolher exercícios pelo hábito; é aplicar critérios explícitos ao contexto do aluno. Tornar esses critérios visíveis é o que separa uma escolha profissional de um palpite.",
  question: "Diante de um aluno novo, quais informações precisam pesar na decisão antes de você escolher o primeiro exercício?",
  concepts: [
    { term: "Critérios de decisão", definition: "Fatores que orientam a escolha: objetivo, nível, restrições e sinais de saúde, equipamentos disponíveis e tolerância individual. Cada um restringe ou favorece opções." },
    { term: "Decisão explícita", definition: "Tornar visível por que uma opção foi escolhida, à luz dos critérios. Uma decisão explícita pode ser revisada, ensinada e defendida; uma decisão implícita, não." },
  ],
  mechanism: {
    title: "Dos critérios à escolha",
    steps: [
      { label: "Objetivo", detail: "Define a faixa de intensidade, o volume e a modalidade predominante (força, hipertrofia, emagrecimento, saúde)." },
      { label: "Nível e experiência", detail: "Orienta a complexidade dos exercícios e a agressividade da progressão." },
      { label: "Restrições e sinais de saúde", detail: "Filtram opções e acionam cuidados; alguns sinais pedem liberação ou encaminhamento." },
      { label: "Equipamento disponível", detail: "Restringe o que é possível prescrever de fato, no contexto real do aluno." },
      { label: "Tolerância individual", detail: "Ajusta amplitude, carga e escolha conforme a resposta e o conforto do aluno." },
    ],
  },
  apply: "Antes de montar o treino, levante e pondere os critérios. No app, é exatamente o que o fluxo Prescrever faz: coleta objetivo, nível, restrição e equipamento e ordena os exercícios com uma justificativa por critério. Responder à abertura: objetivo, nível, restrições e sinais de saúde, equipamento e tolerância precisam pesar antes da primeira escolha.",
  special: [
    "Grupos especiais: os critérios de saúde ganham peso; alguns acionam o Semáforo de Liberação antes da sessão.",
    "Iniciantes: o critério de nível puxa para exercícios mais simples e progressão conservadora.",
    "Contexto limitado (casa, poucos equipamentos): o critério de equipamento molda toda a prescrição.",
  ],
  mistake: {
    mistake: "Prescrever o mesmo pacote de exercícios para todos, sem tornar explícito por que cada escolha serve àquele aluno.",
    instead: "Aplique os critérios ao caso e registre o porquê. Uma prescrição que se explica pelos critérios é individualizada e defensável.",
  },
  professionalCase: {
    prompt: "Aluno iniciante, objetivo hipertrofia, com dor lombar e treinando em casa com halteres. Qual é o primeiro passo do raciocínio?",
    choices: [
      { id: "c1", label: "Cruzar os critérios (objetivo, nível, restrição lombar, equipamento) e escolher exercícios que atendam todos, com progressão conservadora.", tone: "recomendada", feedback: "Coerente. A decisão nasce do cruzamento dos critérios; cada um filtra ou favorece opções para aquele contexto." },
      { id: "c2", label: "Aplicar um programa padrão de hipertrofia sem considerar a lombar e o equipamento.", tone: "cautela", feedback: "Ignora restrição e contexto; a prescrição deixa de ser individualizada e pode ser inadequada." },
      { id: "c3", label: "Focar só no equipamento disponível, sem pesar objetivo e restrição.", tone: "aceitavel", feedback: "O equipamento importa, mas sozinho não decide; objetivo e restrição também precisam pesar." },
    ],
  },
  quiz: [
    q("q1", "conduta", "O primeiro passo para transformar avaliação em prescrição é:", [
      { id: "a", label: "Cruzar os critérios (objetivo, nível, restrição, equipamento, tolerância)." },
      { id: "b", label: "Escolher os exercícios preferidos e ajustar depois." },
    ], "a", "Os critérios convertem a avaliação em escolha individualizada; sem eles, a prescrição vira hábito."),
    q("q2", "verdadeiro-falso", "Tornar a decisão explícita permite que ela seja revisada, ensinada e defendida.", [
      { id: "v", label: "Verdadeiro" },
      { id: "f", label: "Falso" },
    ], "v", "A decisão explícita, ancorada nos critérios, pode ser auditada e justificada; a implícita, não."),
  ],
  uncertainty: "O peso relativo de cada critério muda com o caso e envolve julgamento profissional. Os critérios organizam a decisão, mas não a automatizam; o contexto individual sempre pondera.",
  related: [
    { title: "Descartar opções", href: `/aprender/conteudos/${DISC}--descartar-opcoes`, type: "conceito" },
    { title: "Documentar a decisão", href: `/aprender/conteudos/${DISC}--documentar`, type: "aplicacao" },
    { title: "Triagem e segurança", href: "/aprender/conteudos/seguranca-e-limites-de-atuacao--triagem-parq", type: "conceito" },
  ],
  refs: ["ref-diretriz-forca", "ref-acsm-getp11", "ref-parq-2011"],
  applyRx: "Levante e pondere os critérios (objetivo, nível, restrição e saúde, equipamento, tolerância) antes de escolher; registre o porquê de cada opção. É o que o fluxo Prescrever faz e o que torna a decisão defensável.",
});

const descartar = deepLesson({
  disciplineSlug: DISC,
  moduleId: `m-${DISC}-decisao`,
  moduleSlug: "decisao",
  slug: `${DISC}--descartar-opcoes`,
  title: "Descartar opções: o porquê do que ficou de fora",
  subtitle: "Como decidir",
  description: "Registrar por que uma opção não foi escolhida é parte do raciocínio e fortalece a justificativa.",
  level: "intermediario",
  minutes: 10,
  type: "conceito",
  kicker: K,
  tags: ["descartes", "justificativa", "prontuário"],
  hero: "Uma boa decisão mostra não só o que foi escolhido, mas por que outras opções razoáveis ficaram de fora. O descarte justificado é o que transforma uma escolha em raciocínio auditável.",
  question: "Por que registrar que você considerou e descartou o agachamento livre pode ser tão importante quanto registrar o que prescreveu?",
  concepts: [
    { term: "Descarte justificado", definition: "Registro de que uma opção foi considerada e por qual critério não foi escolhida (por exemplo, alta demanda lombar diante de uma restrição). Mostra que a decisão foi ponderada." },
    { term: "Raciocínio auditável", definition: "Uma linha de decisão que outra pessoa (ou você no futuro) consegue reconstruir: o que foi escolhido, o que foi descartado e por quê." },
  ],
  apply: "Ao prescrever, registre não só os exercícios escolhidos, mas as opções fortes que você descartou e o motivo principal de cada descarte. No app, o Prontuário de Decisão faz isso: lista escolhidos com o porquê e considerados e descartados com o critério que pesou. Responder à abertura: o descarte justificado mostra que a escolha não foi por acaso, e protege a conduta.",
  special: [
    "Grupos especiais: registrar por que uma modalidade de maior risco foi descartada evidencia o cuidado tomado.",
    "Retorno de lesão: documentar o descarte de exercícios provocativos, e o porquê, sustenta a progressão gradual.",
  ],
  mistake: {
    mistake: "Registrar apenas o que foi prescrito, deixando invisível o raciocínio sobre as alternativas.",
    instead: "Anote as opções relevantes descartadas e o critério que as descartou. O porquê do que ficou de fora fortalece a justificativa tanto quanto o que ficou dentro.",
  },
  professionalCase: {
    prompt: "Aluno com dor lombar recebeu leg press em vez de agachamento livre. Como deixar a decisão defensável?",
    choices: [
      { id: "c1", label: "Registrar o agachamento como considerado e descartado por maior demanda lombar diante da restrição, com o leg press como alternativa que mantém o estímulo.", tone: "recomendada", feedback: "Coerente. O descarte justificado mostra ponderação e protege a conduta, além de ensinar o raciocínio." },
      { id: "c2", label: "Registrar só o leg press, sem mencionar o que foi descartado.", tone: "cautela", feedback: "Deixa o raciocínio invisível; a decisão fica menos defensável e menos didática." },
      { id: "c3", label: "Não registrar nada, confiando na memória.", tone: "cautela", feedback: "Sem registro, o raciocínio se perde e a conduta fica frágil de sustentar depois." },
    ],
  },
  quiz: [
    q("q1", "verdadeiro-falso", "Registrar por que uma opção foi descartada faz parte do raciocínio de prescrição.", [
      { id: "v", label: "Verdadeiro" },
      { id: "f", label: "Falso" },
    ], "v", "O descarte justificado mostra que a decisão foi ponderada e fortalece a justificativa da conduta."),
    q("q2", "conduta", "Para deixar defensável a troca de um exercício por outro em um aluno com restrição, o ideal é:", [
      { id: "a", label: "Registrar o que foi descartado e por qual critério, além do que foi escolhido." },
      { id: "b", label: "Registrar apenas o exercício final." },
    ], "a", "Documentar o descarte e o critério torna a decisão auditável e protege a conduta."),
  ],
  uncertainty: "Nem toda opção precisa ser registrada; o bom senso define quais descartes relevantes documentar. O objetivo é um raciocínio reconstruível, não uma lista exaustiva.",
  related: [
    { title: "Critérios de decisão", href: `/aprender/conteudos/${DISC}--criterios-decisao`, type: "mecanismo" },
    { title: "Documentar a decisão", href: `/aprender/conteudos/${DISC}--documentar`, type: "aplicacao" },
    { title: "Incerteza científica", href: "/aprender/conteudos/leitura-critica-de-evidencias--incerteza", type: "conceito" },
  ],
  refs: ["ref-diretriz-forca", "ref-acsm-getp11"],
  applyRx: "Registre as opções fortes descartadas e o critério que as descartou, junto do que foi escolhido. O Prontuário de Decisão do app estrutura isso: escolhidos com o porquê e descartados com o motivo principal.",
});

const documentar = deepLesson({
  disciplineSlug: DISC,
  moduleId: `m-${DISC}-justificar`,
  moduleSlug: "justificar",
  slug: `${DISC}--documentar`,
  title: "Documentar: o registro que sustenta a conduta",
  subtitle: "Justificar a decisão",
  description: "Um registro do raciocínio que embasou a prescrição dá segurança ao profissional e valor à decisão.",
  level: "avancado",
  minutes: 11,
  type: "aplicacao",
  kicker: K,
  tags: ["documentação", "prontuário", "raciocínio clínico documentado"],
  hero: "A prescrição que você defende é a que você consegue explicar depois. Documentar o raciocínio transforma uma escolha do dia em um registro que sustenta a conduta ao longo do tempo.",
  question: "Se meses depois alguém perguntar por que aquele aluno recebeu aquele treino, o que precisa estar registrado para você responder com segurança?",
  concepts: [
    { term: "Prontuário de decisão", definition: "Registro do raciocínio que embasou a prescrição: critérios, escolhidos com o porquê, descartados com o motivo, cuidados e referências. É a memória defensável da conduta." },
    { term: "Rastro auditável", definition: "Conjunto de registros que permite reconstruir a decisão. Reduz o risco profissional e cria um histórico que vale como ativo técnico." },
  ],
  apply: "Ao concluir uma prescrição, gere e guarde o registro do raciocínio: contexto do aluno, critérios que pesaram, escolhidos e descartados com o porquê, cuidados e referências. No app, o Prontuário de Decisão Técnica monta esse documento assinável a partir do que o motor computou. Responder à abertura: para responder com segurança no futuro, o registro precisa conter os critérios, as escolhas e os descartes justificados.",
  special: [
    "Grupos especiais e sinais de saúde: registrar o Semáforo do dia e os cuidados considerados reforça a conduta segura.",
    "Encaminhamentos: documentar quando e por que se encaminhou é parte da conduta responsável e do escopo.",
  ],
  mistake: {
    mistake: "Confiar na memória e não deixar registro do raciocínio, o que fragiliza a conduta e apaga o histórico técnico.",
    instead: "Documente a decisão no momento em que a toma, com os critérios e os descartes. Um registro assinável dá segurança e vira patrimônio do seu trabalho.",
  },
  professionalCase: {
    prompt: "Aluno de grupo especial teve o treino ajustado após o Semáforo indicar cautela. Como documentar de forma defensável?",
    choices: [
      { id: "c1", label: "Registrar o resultado do Semáforo, os ajustes feitos, os critérios e os descartes, gerando o prontuário assinável.", tone: "recomendada", feedback: "Coerente. O registro completo do raciocínio e da liberação sustenta a conduta e cria o rastro auditável." },
      { id: "c2", label: "Anotar só o treino final, sem o Semáforo nem os ajustes.", tone: "cautela", feedback: "Perde o raciocínio de segurança; a conduta fica menos defensável se questionada." },
      { id: "c3", label: "Não registrar, por confiar que vai lembrar.", tone: "cautela", feedback: "Sem registro, o histórico e a proteção se perdem; a documentação é parte da conduta profissional." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Para sustentar a conduta meses depois, o registro precisa conter:", [
      { id: "a", label: "Critérios, escolhidos e descartados com o porquê, cuidados e referências." },
      { id: "b", label: "Apenas a lista de exercícios prescritos." },
    ], "a", "O prontuário do raciocínio permite reconstruir e defender a decisão; a lista sozinha não explica o porquê."),
    q("q2", "verdadeiro-falso", "Documentar o raciocínio reduz o risco profissional e cria um histórico técnico com valor.", [
      { id: "v", label: "Verdadeiro" },
      { id: "f", label: "Falso" },
    ], "v", "O rastro auditável protege a conduta e vira um ativo de defesa técnica e de continuidade do trabalho."),
  ],
  uncertainty: "O nível de detalhe do registro se ajusta ao contexto e ao risco; nem toda decisão pede o mesmo rigor. O objetivo é um registro suficiente para reconstruir e defender a conduta.",
  related: [
    { title: "Comunicar a decisão", href: `/aprender/conteudos/${DISC}--comunicar-decisao`, type: "conceito" },
    { title: "Descartar opções", href: `/aprender/conteudos/${DISC}--descartar-opcoes`, type: "conceito" },
    { title: "Escopo e encaminhamento", href: "/aprender/conteudos/seguranca-e-limites-de-atuacao--escopo-atuacao", type: "conceito" },
  ],
  refs: ["ref-acsm-getp11", "ref-parq-2011", "ref-diretriz-forca"],
  applyRx: "Ao concluir a prescrição, gere e guarde o registro do raciocínio (critérios, escolhidos e descartados com o porquê, cuidados e referências). O Prontuário de Decisão Técnica do app produz esse documento assinável.",
});

const comunicar = deepLesson({
  disciplineSlug: DISC,
  moduleId: `m-${DISC}-justificar`,
  moduleSlug: "justificar",
  slug: `${DISC}--comunicar-decisao`,
  title: "Comunicar a decisão ao aluno",
  subtitle: "Justificar a decisão",
  description: "Explicar o porquê das escolhas, em linguagem clara, aumenta a confiança e a adesão.",
  level: "intermediario",
  minutes: 9,
  type: "conceito",
  kicker: K,
  tags: ["comunicação", "adesão", "linguagem"],
  hero: "Uma decisão bem tomada rende mais quando o aluno entende o porquê. Comunicar a lógica das escolhas, sem jargão, transforma o aluno em parceiro do próprio processo.",
  question: "Por que dizer ao aluno 'confia em mim' costuma render menos do que explicar em uma frase o motivo da escolha?",
  concepts: [
    { term: "Comunicação da decisão", definition: "Traduzir o raciocínio técnico em uma explicação simples e conectada ao objetivo do aluno. Não é ensinar fisiologia; é dar sentido à escolha." },
    { term: "Adesão", definition: "A constância com que o aluno segue o plano. Entender o porquê das escolhas aumenta a confiança e a probabilidade de manter a rotina." },
  ],
  apply: "Ao entregar a prescrição, explique em poucas frases por que cada bloco existe e como ele serve ao objetivo do aluno, conectando ao que ele valoriza. Responder à abertura: o aluno que entende o motivo tende a aderir mais do que o que apenas obedece; a compreensão sustenta a constância nos dias difíceis.",
  special: [
    "Grupos especiais: explicar os cuidados aumenta a segurança percebida e a colaboração do aluno.",
    "Baixa adesão: conectar as escolhas ao que o aluno quer (autonomia, estética, saúde) fortalece o vínculo com o plano.",
    "Iniciantes: explicações simples e uma de cada vez evitam sobrecarga de informação.",
  ],
  mistake: {
    mistake: "Explicar demais com termos técnicos, ou não explicar nada e pedir confiança cega.",
    instead: "Dê uma explicação curta, clara e ligada ao objetivo do aluno. O suficiente para dar sentido, sem transformar a sessão numa aula de fisiologia.",
  },
  professionalCase: {
    prompt: "Aluno resistente a fazer trabalho de mobilidade, que acha 'perda de tempo'. Qual conduta comunica melhor a decisão?",
    choices: [
      { id: "c1", label: "Explicar em uma frase como a mobilidade sustenta o objetivo dele (por exemplo, agachar mais fundo com conforto) e combinar uma dose pequena.", tone: "recomendada", feedback: "Coerente. Conectar a escolha ao objetivo dá sentido e aumenta a adesão sem impor." },
      { id: "c2", label: "Dizer apenas que é importante e que ele deve confiar.", tone: "cautela", feedback: "Pedir confiança sem sentido raramente convence; a resistência tende a permanecer." },
      { id: "c3", label: "Retirar a mobilidade para evitar conflito.", tone: "aceitavel", feedback: "Ceder sem explicar abre mão de algo útil; comunicar o porquê costuma resolver melhor do que remover." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Para aumentar a adesão de um aluno resistente a uma parte do treino, o mais eficaz é:", [
      { id: "a", label: "Explicar, em linguagem simples, como aquilo serve ao objetivo dele." },
      { id: "b", label: "Pedir que confie sem dar o motivo." },
    ], "a", "Conectar a escolha ao objetivo do aluno dá sentido e sustenta a adesão melhor do que a confiança cega."),
    q("q2", "verdadeiro-falso", "Entender o porquê das escolhas tende a aumentar a adesão do aluno ao plano.", [
      { id: "v", label: "Verdadeiro" },
      { id: "f", label: "Falso" },
    ], "v", "A compreensão do motivo aumenta a confiança e a constância, sobretudo nos dias difíceis."),
  ],
  uncertainty: "O quanto explicar varia com o perfil do aluno; alguns querem detalhes, outros só o essencial. Ajuste a dose de explicação à pessoa, mantendo clareza e conexão com o objetivo.",
  related: [
    { title: "Documentar a decisão", href: `/aprender/conteudos/${DISC}--documentar`, type: "aplicacao" },
    { title: "Linguagem acessível", href: "/aprender/conteudos/comunicacao-e-adesao--linguagem", type: "conceito" },
    { title: "Alinhamento de expectativa", href: "/aprender/conteudos/comunicacao-e-adesao--expectativa", type: "conceito" },
  ],
  refs: ["ref-borg-pse", "ref-acsm-getp11"],
  applyRx: "Explique em poucas frases, sem jargão, por que cada bloco do treino existe e como serve ao objetivo do aluno. A compreensão sustenta a adesão melhor do que pedir confiança cega.",
});

export const raciocinioModules: Module[] = [
  deepModule({
    id: `m-${DISC}-decisao`,
    disciplineId: DISC_ID,
    slug: "decisao",
    title: "Como decidir",
    objective: "Transformar avaliação e contexto em decisão explícita.",
    order: 1,
    level: "intermediario",
    lessons: [criterios, descartar],
    applications: ["Tornar explícitos os critérios e os descartes da prescrição"],
  }),
  deepModule({
    id: `m-${DISC}-justificar`,
    disciplineId: DISC_ID,
    slug: "justificar",
    title: "Justificar a decisão",
    objective: "Documentar e comunicar a decisão de forma defensável.",
    order: 2,
    level: "avancado",
    prerequisites: [`m-${DISC}-decisao`],
    lessons: [documentar, comunicar],
    applications: ["Gerar o registro do raciocínio e comunicá-lo ao aluno"],
  }),
];

export const raciocinioLessons: Lesson[] = [criterios, descartar, documentar, comunicar];
