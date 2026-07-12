import type { Lesson, Module } from "../types";
import { deepLesson, deepModule, q } from "./authoring";

/** AVALIAÇÃO FÍSICA E FUNCIONAL, disciplina autorada em profundidade. */

const DISC = "avaliacao-fisica-e-funcional";
const DISC_ID = "d-avaliacao";
const K = "Avaliação física e funcional";

const composicao = deepLesson({
  disciplineSlug: DISC,
  moduleId: `m-${DISC}-medidas`,
  moduleSlug: "medidas",
  slug: `${DISC}--composicao-corporal`,
  title: "Composição corporal: medir com propósito",
  subtitle: "Medidas e interpretação",
  description: "Estimar frações de massa é útil, mas cada método tem erro. Saber o que a medida responde evita conclusões falsas.",
  level: "fundamental",
  minutes: 11,
  type: "conceito",
  kicker: K,
  tags: ["composição corporal", "erro de medida", "acompanhamento"],
  hero: "Toda estimativa de composição corporal é uma aproximação com erro. O valor está menos no número exato e mais em acompanhar a mudança pelo mesmo método ao longo do tempo.",
  question: "O aluno perdeu 2 kg, mas a dobra cutânea 'aumentou' entre duas avaliações. O que isso realmente diz sobre a gordura corporal?",
  concepts: [
    { term: "Composição corporal", definition: "Estimativa das frações de massa (gordura, magra) por métodos como dobras cutâneas, bioimpedância e outros. Cada método tem premissas e erro próprios." },
    { term: "Erro de medida", definition: "Toda medida carrega imprecisão do instrumento e do avaliador. Comparar resultados só faz sentido pelo mesmo método, protocolo e, idealmente, mesmo avaliador." },
  ],
  comparison: {
    title: "O que a medida entrega e o que ela não entrega",
    leftTitle: "O que ajuda",
    rightTitle: "O que enganaria",
    leftItems: [
      "Acompanhar a tendência ao longo de semanas.",
      "Comparar o aluno com ele mesmo, mesmo protocolo.",
      "Complementar peso, perímetros e desempenho.",
    ],
    rightItems: [
      "Tratar o percentual como valor exato e definitivo.",
      "Comparar métodos diferentes entre avaliações.",
      "Concluir muito a partir de uma única medida.",
    ],
    note: "Responder à abertura: uma variação pequena numa dobra pode estar dentro do erro do método e do avaliador. Só a tendência, medida do mesmo jeito, permite concluir sobre a gordura.",
  },
  apply: "Escolha um método viável, padronize o protocolo (pontos, postura, avaliador, horário) e acompanhe a tendência, não valores isolados. Comunique ao aluno que o número tem erro e que o que importa é a direção da mudança ao longo do tempo, junto de peso, perímetros e desempenho.",
  special: [
    "Obesidade: alguns métodos perdem precisão; priorize consistência do protocolo e medidas simples como perímetros.",
    "Idosos e gestantes: interprete com cautela e foque em função e bem-estar, não só em percentuais.",
    "A conduta clínica e diagnóstica é do profissional de saúde; a avaliação aqui é de acompanhamento do treino.",
  ],
  mistake: {
    mistake: "Trocar de método entre avaliações (dobra numa, bioimpedância noutra) e comparar os percentuais como se fossem equivalentes.",
    instead: "Fixe o método e o protocolo, e compare sempre com a própria linha de base. Mudou o método, recomeçou a série histórica.",
  },
  professionalCase: {
    prompt: "Aluno ansioso com o percentual de gordura, que oscila entre avaliações feitas por métodos diferentes. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Padronizar um único método e protocolo e acompanhar a tendência, explicando o erro de medida.", tone: "recomendada", feedback: "Coerente. A consistência do método e o foco na tendência reduzem a ansiedade e informam melhor." },
      { id: "c2", label: "Buscar o método 'mais exato' e confiar no valor absoluto de uma medida.", tone: "cautela", feedback: "Nenhum método de campo é isento de erro; um valor isolado não sustenta conclusões." },
      { id: "c3", label: "Abandonar a avaliação de composição e usar só o peso.", tone: "aceitavel", feedback: "O peso ajuda, mas perde nuance; padronizar a composição ainda agrega quando bem conduzida." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Para comparar composição corporal entre avaliações, o essencial é:", [
      { id: "a", label: "Usar o mesmo método e protocolo e acompanhar a tendência." },
      { id: "b", label: "Buscar sempre o método mais moderno em cada avaliação." },
    ], "a", "A comparação só é válida pelo mesmo método e protocolo; a tendência informa mais do que um valor isolado."),
    q("q2", "verdadeiro-falso", "Uma pequena variação numa dobra cutânea entre duas medidas prova mudança real de gordura.", [
      { id: "v", label: "Verdadeiro" },
      { id: "f", label: "Falso" },
    ], "f", "Pequenas variações podem estar dentro do erro do método e do avaliador; só a tendência permite concluir."),
  ],
  uncertainty: "Os métodos de campo estimam, não medem diretamente, a composição, e têm margens de erro conhecidas. Trate os resultados como aproximações de acompanhamento.",
  related: [
    { title: "Perimetria", href: `/aprender/conteudos/${DISC}--perimetria`, type: "conceito" },
    { title: "Interpretar um resultado", href: `/aprender/conteudos/${DISC}--interpretar-resultado`, type: "mecanismo" },
    { title: "Níveis de evidência e viés", href: "/aprender/conteudos/leitura-critica-de-evidencias--hierarquia", type: "conceito" },
  ],
  refs: ["ref-acsm-getp11", "ref-a-validar-antropometria"],
  applyRx: "Padronize um método e protocolo de composição corporal e acompanhe a tendência com o aluno, comunicando o erro de medida e combinando com peso, perímetros e desempenho.",
});

const perimetria = deepLesson({
  disciplineSlug: DISC,
  moduleId: `m-${DISC}-medidas`,
  moduleSlug: "medidas",
  slug: `${DISC}--perimetria`,
  title: "Perimetria: simples, útil e sensível ao protocolo",
  subtitle: "Medidas e interpretação",
  description: "Circunferências acompanham mudanças ao longo do tempo quando medidas com padronização.",
  level: "fundamental",
  minutes: 9,
  type: "conceito",
  kicker: K,
  tags: ["perímetros", "circunferência", "padronização"],
  hero: "Uma fita métrica bem usada é uma das ferramentas mais acessíveis de acompanhamento. O que a torna confiável é a padronização, não o equipamento.",
  question: "Como acompanhar mudanças na cintura e no braço de um aluno de forma que os números realmente signifiquem algo entre avaliações?",
  concepts: [
    { term: "Perímetros", definition: "Medidas de circunferência de segmentos (cintura, quadril, braço, coxa) que acompanham mudanças estruturais ao longo do tempo com baixo custo." },
    { term: "Padronização", definition: "Medir sempre no mesmo ponto anatômico, com a mesma postura, tensão de fita e momento do dia. É o que reduz o erro entre avaliações." },
  ],
  apply: "Defina e registre os pontos exatos de medida (referências anatômicas), a postura e o lado, e repita igual em cada avaliação. Perímetros combinam bem com composição, peso e desempenho para contar a história da evolução, especialmente quando a balança não se move mas o corpo muda.",
  special: [
    "Emagrecimento: a cintura costuma refletir mudanças relevantes mesmo quando o peso varia pouco.",
    "Hipertrofia: perímetros de membros ajudam a evidenciar ganho quando a balança sobe devagar.",
    "Obesidade: perímetros são acessíveis e menos sujeitos a premissas do que alguns métodos de composição.",
  ],
  mistake: {
    mistake: "Medir 'mais ou menos' no mesmo lugar, sem referência anatômica fixa, e comparar valores entre dias e posturas diferentes.",
    instead: "Registre pontos, postura e lado, e reproduza igual. A padronização é o que transforma a fita numa medida confiável de tendência.",
  },
  professionalCase: {
    prompt: "Aluna frustrada porque 'o peso não desce', mas as roupas estão mais folgadas. Como evidenciar objetivamente o progresso?",
    choices: [
      { id: "c1", label: "Mostrar a redução padronizada da cintura ao longo das semanas, junto de composição e desempenho.", tone: "recomendada", feedback: "Coerente. A perimetria padronizada capta a mudança de forma que a balança não mostra, e motiva." },
      { id: "c2", label: "Concluir que não houve progresso porque o peso não caiu.", tone: "cautela", feedback: "Ignora mudanças reais de composição e circunferências; desmotiva sem base." },
      { id: "c3", label: "Pesar todos os dias em busca de queda.", tone: "aceitavel", feedback: "O peso diário oscila muito; a perimetria e a tendência informam melhor." },
    ],
  },
  quiz: [
    q("q1", "conduta", "O que mais aumenta a confiabilidade da perimetria entre avaliações?", [
      { id: "a", label: "Padronizar pontos, postura, lado e momento da medida." },
      { id: "b", label: "Usar uma fita mais cara." },
    ], "a", "A padronização do protocolo, não o equipamento, é o que reduz o erro e torna a comparação válida."),
    q("q2", "verdadeiro-falso", "A perimetria pode evidenciar progresso mesmo quando o peso na balança não muda.", [
      { id: "v", label: "Verdadeiro" },
      { id: "f", label: "Falso" },
    ], "v", "Mudanças de composição e circunferência ocorrem sem grande variação de peso; a perimetria as capta."),
  ],
  uncertainty: "Perímetros refletem mudanças estruturais, mas não separam por si só gordura de massa magra. Interprete no conjunto das medidas.",
  related: [
    { title: "Composição corporal", href: `/aprender/conteudos/${DISC}--composicao-corporal`, type: "conceito" },
    { title: "Interpretar um resultado", href: `/aprender/conteudos/${DISC}--interpretar-resultado`, type: "mecanismo" },
    { title: "Comunicação e adesão", href: "/aprender/conteudos/comunicacao-e-adesao--linguagem", type: "conceito" },
  ],
  refs: ["ref-acsm-getp11", "ref-a-validar-antropometria"],
  applyRx: "Padronize pontos, postura e lado da perimetria e acompanhe a tendência, combinando com composição, peso e desempenho para evidenciar progresso quando a balança não conta a história toda.",
});

const escolherTeste = deepLesson({
  disciplineSlug: DISC,
  moduleId: `m-${DISC}-testes-funcionais`,
  moduleSlug: "testes-funcionais",
  slug: `${DISC}--escolher-teste`,
  title: "Escolher o teste certo: comece pela pergunta",
  subtitle: "Testes funcionais",
  description: "Um teste só vale se responder à pergunta que se quer investigar. Definir a pergunta vem antes de escolher o teste.",
  level: "intermediario",
  minutes: 10,
  type: "conceito",
  kicker: K,
  tags: ["testes funcionais", "validade", "avaliação"],
  hero: "Testar por testar acumula números sem decisão. Um bom teste começa por uma pergunta clara e escolhe o instrumento que de fato a responde, com segurança para o aluno.",
  question: "Antes de aplicar um teste de força ou de aptidão, o que você precisa definir para que o resultado seja útil?",
  concepts: [
    { term: "Validade do teste", definition: "O grau em que o teste mede de fato o que se quer investigar. Um teste válido para força máxima pode não responder sobre resistência ou mobilidade." },
    { term: "Pergunta antes do teste", definition: "Definir o que se quer saber (e para que decisão) orienta qual teste aplicar, com qual esforço e risco, e como interpretar." },
  ],
  decisionTree: {
    title: "Da pergunta ao teste",
    root: "O que você precisa decidir com o resultado?",
    branches: [
      { condition: "Ajustar carga de treino", outcome: "Testes de força submáxima ou estimativa por repetições, com segurança e sem necessidade de máximos arriscados." },
      { condition: "Acompanhar aptidão aeróbia", outcome: "Testes de campo padronizados e seguros, guiados por percepção e, quando confiável, frequência cardíaca." },
      { condition: "Observar mobilidade e controle", outcome: "Testes de movimento simples e reprodutíveis, focados na tarefa que importa para o objetivo." },
    ],
  },
  apply: "Antes de testar, escreva a pergunta e a decisão que ela apoia. Escolha o teste válido para essa pergunta, seguro para o aluno e reprodutível. Responder à abertura: defina objetivo, o que quer saber, o risco aceitável e como vai interpretar, antes de escolher o instrumento.",
  special: [
    "Iniciantes e populações sensíveis: evite testes máximos; estimativas submáximas respondem bem com menos risco.",
    "Sinais de alerta ou dúvidas de saúde: triagem e liberação vêm antes de qualquer teste de esforço.",
  ],
  mistake: {
    mistake: "Aplicar uma bateria de testes padrão em todo aluno, sem pergunta clara, gerando dados que não mudam a conduta.",
    instead: "Parta da pergunta e da decisão. Menos testes, bem escolhidos e reprodutíveis, informam mais do que uma bateria genérica.",
  },
  professionalCase: {
    prompt: "Aluno iniciante quer 'saber sua força'. Você precisa ajustar a carga do treino com segurança. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Usar teste submáximo ou estimativa por repetições para orientar a carga, sem buscar o máximo real.", tone: "recomendada", feedback: "Coerente. Responde à pergunta prática (ajustar carga) com segurança, sem o risco de um máximo em iniciante." },
      { id: "c2", label: "Testar 1RM real no primeiro dia para ter o número exato.", tone: "cautela", feedback: "Máximo em iniciante sem base técnica eleva risco e não é necessário para ajustar a carga inicial." },
      { id: "c3", label: "Aplicar vários testes de aptidão além do de força.", tone: "aceitavel", feedback: "Testes extras sem pergunta associada geram dados que não mudam a conduta imediata." },
    ],
  },
  quiz: [
    q("q1", "conduta", "O primeiro passo para escolher um teste é:", [
      { id: "a", label: "Definir a pergunta e a decisão que o resultado vai apoiar." },
      { id: "b", label: "Aplicar a bateria padrão de testes." },
    ], "a", "A pergunta orienta qual teste é válido, seguro e interpretável; sem ela, os dados não geram decisão."),
    q("q2", "conduta", "Para ajustar a carga de um iniciante, o teste mais coerente é:", [
      { id: "a", label: "Estimativa submáxima ou por repetições, com segurança." },
      { id: "b", label: "Teste de 1RM máximo no primeiro dia." },
    ], "a", "A estimativa submáxima responde à pergunta prática com menos risco do que um máximo em iniciante."),
  ],
  uncertainty: "Nenhum teste é perfeito; validade e confiabilidade dependem do protocolo e do avaliador. Escolha o teste pela pergunta e interprete com margem.",
  related: [
    { title: "Interpretar um resultado", href: `/aprender/conteudos/${DISC}--interpretar-resultado`, type: "mecanismo" },
    { title: "Estimar 1RM (Epley)", href: "/aprender/conteudos/forca-intensidade-e-volume", type: "conceito" },
    { title: "Triagem e segurança", href: "/aprender/conteudos/seguranca-e-limites-de-atuacao--triagem-parq", type: "conceito" },
  ],
  refs: ["ref-acsm-getp11", "ref-parq-2011"],
  applyRx: "Comece pela pergunta e pela decisão; escolha o teste válido, seguro e reprodutível para ela. Prefira estimativas submáximas em iniciantes e faça triagem antes de testes de esforço.",
});

const interpretar = deepLesson({
  disciplineSlug: DISC,
  moduleId: `m-${DISC}-testes-funcionais`,
  moduleSlug: "testes-funcionais",
  slug: `${DISC}--interpretar-resultado`,
  title: "Interpretar o resultado no contexto",
  subtitle: "Testes funcionais",
  description: "Um número só vira informação quando lido no contexto do aluno e da variação esperada.",
  level: "intermediario",
  minutes: 10,
  type: "mecanismo",
  kicker: K,
  tags: ["interpretação", "linha de base", "variação"],
  hero: "O mesmo resultado significa coisas diferentes para pessoas diferentes. Interpretar é comparar com a própria linha de base e considerar a variação normal, antes de mudar a conduta.",
  question: "Um teste piorou levemente de uma avaliação para a outra. Isso pede mudar o programa ou pode ser variação normal?",
  concepts: [
    { term: "Interpretação contextual", definition: "Ler o resultado à luz do objetivo, do histórico e do momento do aluno, não apenas contra tabelas populacionais." },
    { term: "Variação esperada", definition: "Toda medida oscila por fatores do dia (sono, alimentação, estresse, calor). Diferenças pequenas podem ser ruído, não sinal." },
  ],
  apply: "Compare o resultado com a própria linha de base do aluno e pergunte se a diferença supera a variação esperada e o erro do teste. Só mude a conduta diante de tendência consistente, não de uma oscilação isolada. Responder à abertura: uma piora leve isolada costuma ser variação normal; observe a tendência antes de reagir.",
  special: [
    "Idosos: pequenas variações podem refletir o dia; valorize a tendência e a função no cotidiano.",
    "Alta carga de vida (sono ruim, estresse): resultados piores podem espelhar recuperação, não perda de capacidade.",
  ],
  mistake: {
    mistake: "Reagir a cada oscilação de teste mudando o programa, criando instabilidade e perdendo a leitura de tendência.",
    instead: "Espere confirmar uma tendência antes de alterar a conduta. Registrar e comparar com a linha de base separa sinal de ruído.",
  },
  professionalCase: {
    prompt: "Resultado de um teste caiu um pouco após uma semana de sono ruim e trabalho intenso. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Considerar contexto e variação, manter o plano e reavaliar após recuperação.", tone: "recomendada", feedback: "Coerente. A queda pode refletir fadiga e sono, não perda real; a tendência dirá mais do que uma medida." },
      { id: "c2", label: "Mudar todo o programa por causa da queda isolada.", tone: "cautela", feedback: "Reagir a uma oscilação isolada gera instabilidade e ignora o contexto de recuperação." },
      { id: "c3", label: "Aumentar a carga para compensar a 'perda'.", tone: "aceitavel", feedback: "Sobre fadiga e sono ruim, aumentar carga tende a piorar; primeiro recupere e reavalie." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Uma piora leve e isolada num teste, após semana de sono ruim, pede:", [
      { id: "a", label: "Considerar contexto e variação e reavaliar após recuperação." },
      { id: "b", label: "Mudar o programa imediatamente." },
    ], "a", "Oscilações isoladas costumam ser variação ou fadiga; a tendência, no contexto, orienta a conduta."),
    q("q2", "verdadeiro-falso", "Comparar o resultado com a própria linha de base do aluno informa mais do que comparar só com tabelas gerais.", [
      { id: "v", label: "Verdadeiro" },
      { id: "f", label: "Falso" },
    ], "v", "A linha de base individual capta a mudança relevante para aquele aluno melhor do que uma tabela populacional."),
  ],
  uncertainty: "A magnitude da variação normal varia por teste e por pessoa e nem sempre é conhecida com precisão. Na dúvida, valorize a tendência e o contexto sobre a medida isolada.",
  related: [
    { title: "Escolher o teste", href: `/aprender/conteudos/${DISC}--escolher-teste`, type: "conceito" },
    { title: "FC de recuperação", href: "/aprender/conteudos/treinamento-cardiorrespiratorio--fc-recuperacao", type: "mecanismo" },
    { title: "Incerteza científica", href: "/aprender/conteudos/leitura-critica-de-evidencias--incerteza", type: "conceito" },
  ],
  refs: ["ref-acsm-getp11", "ref-borg-pse", "ref-foster-srpe-2001"],
  applyRx: "Interprete cada resultado contra a própria linha de base e a variação esperada; mude a conduta apenas diante de tendência consistente, considerando sono, estresse e recuperação.",
});

export const avaliacaoModules: Module[] = [
  deepModule({
    id: `m-${DISC}-medidas`,
    disciplineId: DISC_ID,
    slug: "medidas",
    title: "Medidas e interpretação",
    objective: "Escolher e interpretar medidas com propósito e padronização.",
    order: 1,
    level: "fundamental",
    lessons: [composicao, perimetria],
    applications: ["Acompanhar mudança pela tendência, com protocolo padronizado"],
  }),
  deepModule({
    id: `m-${DISC}-testes-funcionais`,
    disciplineId: DISC_ID,
    slug: "testes-funcionais",
    title: "Testes funcionais",
    objective: "Responder a perguntas com o teste certo e interpretar no contexto.",
    order: 2,
    level: "intermediario",
    prerequisites: [`m-${DISC}-medidas`],
    lessons: [escolherTeste, interpretar],
    applications: ["Definir a pergunta antes do teste e ler o resultado no contexto"],
  }),
];

export const avaliacaoLessons: Lesson[] = [composicao, perimetria, escolherTeste, interpretar];
