import type { Lesson, Module } from "../types";
import { deepLesson, deepModule, q } from "./authoring";

/** ANATOMIA FUNCIONAL, disciplina autorada em profundidade. */

const DISC = "anatomia-funcional";
const DISC_ID = "d-anatomia";
const K = "Anatomia funcional";

const musculosPorFuncao = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-sistema-muscular`, moduleSlug: "sistema-muscular",
  slug: `${DISC}--musculos-por-funcao`, title: "Músculos por função, não só por nome",
  subtitle: "Sistema muscular na prática", description: "Reconhecer o papel de um músculo no movimento (agonista, antagonista, sinergista, estabilizador) importa mais do que decorar nomes.",
  level: "fundamental", minutes: 10, type: "conceito", kicker: K, tags: ["função muscular", "agonista", "sinergista"],
  hero: "Decorar o nome de um músculo diz pouco. Saber o papel que ele exerce em um movimento é o que liga a anatomia à escolha do exercício. O mesmo músculo muda de papel conforme a tarefa.",
  question: "No agachamento, o glúteo máximo é agonista, estabilizador ou depende do momento do movimento?",
  concepts: [
    { term: "Ação muscular", definition: "O papel que um músculo desempenha em um movimento: agonista (produz a ação), antagonista (opõe-se), sinergista (auxilia) ou estabilizador (mantém a postura)." },
    { term: "Papel dependente da tarefa", definition: "Um mesmo músculo pode ser agonista em um exercício e estabilizador em outro. O papel é definido pela ação exigida, não fixo pelo músculo." },
  ],
  apply: "Ao analisar um exercício, pergunte qual o papel de cada músculo naquela ação, não só o nome. Isso liga o exercício ao que ele treina. Responder à abertura: no agachamento, o glúteo máximo atua como agonista na extensão de quadril, sobretudo na subida; classificar pelo papel esclarece o que o exercício desenvolve.",
  special: [
    "Hipertrofia dirigida: escolher pela função garante treinar o músculo pretendido no papel de agonista.",
    "Estabilidade e core: reconhecer estabilizadores orienta o trabalho de anti-movimento.",
    "Reabilitação: identificar o papel do músculo na tarefa orienta o fortalecimento seguro.",
  ],
  mistake: {
    mistake: "Estudar músculos apenas por nome e localização, sem entender o papel deles nos movimentos treinados.",
    instead: "Classifique pela função na ação: agonista, antagonista, sinergista, estabilizador. O papel liga a anatomia à escolha e à análise do exercício.",
  },
  professionalCase: {
    prompt: "Aluno pergunta qual exercício 'trabalha o glúteo'. Como raciocinar a partir da função?",
    choices: [
      { id: "c1", label: "Buscar exercícios em que o glúteo máximo é agonista da ação (extensão de quadril), como dobradiça e hip thrust.", tone: "recomendada", feedback: "Coerente. Escolher pela função (glúteo como agonista da extensão de quadril) alinha o exercício ao alvo." },
      { id: "c2", label: "Sugerir qualquer exercício de perna, já que 'tudo pega glúteo'.", tone: "cautela", feedback: "Nem todo exercício de perna tem o glúteo como agonista; a extensão de joelho, por exemplo, foca o quadríceps." },
      { id: "c3", label: "Focar só em exercícios de isolamento pelo nome.", tone: "aceitavel", feedback: "O nome ajuda, mas o papel na ação é o que garante treinar o alvo pretendido." },
    ],
  },
  quiz: [
    q("q1", "variavel", "O músculo que produz a ação principal de um movimento é o:", [
      { id: "a", label: "Agonista." }, { id: "b", label: "Antagonista." },
    ], "a", "O agonista produz a ação; o antagonista se opõe, o sinergista auxilia e o estabilizador mantém a postura."),
    q("q2", "verdadeiro-falso", "Um mesmo músculo pode ter papéis diferentes em exercícios diferentes.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "v", "O papel depende da ação exigida; o mesmo músculo pode ser agonista num exercício e estabilizador em outro."),
  ],
  uncertainty: "A classificação por papel simplifica ações musculares complexas e compartilhadas. Use-a para orientar a análise e a escolha, sem tratar como exclusividade rígida.",
  related: [
    { title: "Músculos biarticulares", href: `/aprender/conteudos/${DISC}--biarticulares`, type: "conceito" },
    { title: "Ações articulares", href: "/aprender/conteudos/cinesiologia--acoes-articulares", type: "conceito" },
    { title: "Cadeia posterior", href: `/aprender/conteudos/${DISC}--cadeia-posterior`, type: "mecanismo" },
  ],
  refs: ["ref-escamilla-agachamento", "ref-diretriz-forca"],
  applyRx: "Ao analisar um exercício, classifique cada músculo pelo papel na ação (agonista, sinergista, estabilizador), não só pelo nome; escolha pelo músculo que é agonista da ação-alvo.",
});

const biarticulares = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-sistema-muscular`, moduleSlug: "sistema-muscular",
  slug: `${DISC}--biarticulares`, title: "Músculos biarticulares: por que a posição importa",
  subtitle: "Sistema muscular na prática", description: "Músculos que cruzam duas articulações têm o comprimento e a força dependentes da posição de ambas.",
  level: "intermediario", minutes: 10, type: "conceito", kicker: K, tags: ["biarticular", "insuficiência", "posição"],
  hero: "Alguns músculos cruzam duas articulações ao mesmo tempo. Isso faz sua força depender da posição das duas, e explica truques práticos como mudar a ênfase de um exercício só ajustando um ângulo.",
  question: "Por que o isquiotibial parece mais fraco na flexão de joelho quando o quadril já está muito flexionado, ou vice-versa?",
  concepts: [
    { term: "Músculo biarticular", definition: "Músculo que cruza duas articulações (como isquiotibiais, reto femoral, gastrocnêmio). Seu comprimento e sua capacidade de força dependem da posição de ambas as articulações." },
    { term: "Insuficiência ativa e passiva", definition: "Quando um biarticular está muito encurtado nas duas articulações, perde força (insuficiência ativa); quando muito alongado nas duas, limita o movimento (insuficiência passiva)." },
  ],
  apply: "Use a posição das articulações para modular a participação de músculos biarticulares. Mudar o ângulo de uma articulação altera a força e a ênfase na outra. Responder à abertura: o isquiotibial, sendo biarticular, fica em desvantagem de comprimento quando encurtado em quadril e joelho ao mesmo tempo; ajustar a posição do quadril muda sua participação na flexão de joelho.",
  special: [
    "Seleção de exercícios: variar a posição do quadril muda a ênfase entre porções e entre biarticulares e monoarticulares.",
    "Reabilitação: entender insuficiências ajuda a escolher posições seguras e eficazes.",
    "Cãibras e desconforto de biarticulares: a posição das duas articulações influencia; ajustar costuma ajudar.",
  ],
  mistake: {
    mistake: "Explicar a força de um exercício só pela articulação que se move, ignorando a posição da outra articulação cruzada por um biarticular.",
    instead: "Considere as duas articulações que o biarticular cruza. A posição de ambas define força e ênfase; ajustá-la é uma ferramenta de prescrição.",
  },
  professionalCase: {
    prompt: "Aluno quer enfatizar mais os isquiotibiais na mesa flexora e sente pouco. Qual ajuste, pela lógica biarticular, é mais coerente?",
    choices: [
      { id: "c1", label: "Ajustar a posição do quadril (por exemplo, flexão de joelho com quadril mais estendido, como na flexora deitada) para colocar o isquiotibial em melhor comprimento.", tone: "recomendada", feedback: "Coerente. A posição do quadril muda o comprimento do isquiotibial biarticular e sua participação na flexão de joelho." },
      { id: "c2", label: "Só aumentar a carga na mesma posição.", tone: "aceitavel", feedback: "Pode ajudar, mas ignora a variável biarticular; ajustar a posição do quadril muda a ênfase de forma mais direta." },
      { id: "c3", label: "Trocar por extensão de joelho.", tone: "cautela", feedback: "A extensão de joelho recruta o quadríceps, não os isquiotibiais; não atende o objetivo." },
    ],
  },
  quiz: [
    q("q1", "variavel", "Um músculo que cruza duas articulações e cuja força depende da posição de ambas é chamado de:", [
      { id: "a", label: "Biarticular." }, { id: "b", label: "Monoarticular." },
    ], "a", "Biarticulares cruzam duas articulações; comprimento e força dependem da posição das duas."),
    q("q2", "verdadeiro-falso", "Mudar a posição de uma articulação pode alterar a força de um músculo biarticular na outra articulação.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "v", "Como o biarticular cruza as duas, a posição de uma influencia sua força e ênfase na outra."),
  ],
  uncertainty: "A magnitude dos efeitos de comprimento varia entre pessoas e exercícios. Use a lógica biarticular como ferramenta de ajuste, observando a resposta do aluno.",
  related: [
    { title: "Músculos por função", href: `/aprender/conteudos/${DISC}--musculos-por-funcao`, type: "conceito" },
    { title: "Posição corporal e equipamento", href: "/aprender/conteudos/posicao-corporal-e-equipamento", type: "comparacao" },
    { title: "Cadeia posterior", href: `/aprender/conteudos/${DISC}--cadeia-posterior`, type: "mecanismo" },
  ],
  refs: ["ref-escamilla-agachamento", "ref-diretriz-forca"],
  applyRx: "Use a posição das duas articulações que um biarticular cruza para modular sua força e ênfase; ajustar o ângulo de uma articulação muda a participação do músculo na outra.",
});

const tiposArticulacao = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-articulacoes`, moduleSlug: "articulacoes",
  slug: `${DISC}--tipos-de-articulacao`, title: "Tipos de articulação e os movimentos possíveis",
  subtitle: "Articulações e amplitude", description: "A forma da articulação define quais movimentos ela permite e onde a amplitude é naturalmente limitada.",
  level: "fundamental", minutes: 9, type: "conceito", kicker: K, tags: ["articulação", "amplitude", "forma"],
  hero: "A forma de uma articulação decide o que ela pode fazer. Uma esférica como o ombro se move em muitas direções; uma em dobradiça como o cotovelo, em poucas. Isso orienta o que treinar e onde a amplitude tem limite natural.",
  question: "Por que faz sentido treinar o ombro em várias direções e o cotovelo essencialmente em flexão e extensão?",
  concepts: [
    { term: "Articulação sinovial", definition: "Articulação móvel cuja forma define os movimentos possíveis: esférica (muitas direções, como o ombro), gínglimo ou dobradiça (uma direção principal, como o cotovelo), entre outras." },
    { term: "Amplitude conforme a forma", definition: "A forma articular orienta a amplitude natural: onde há muita mobilidade, treina-se variedade de direções; onde a forma limita, insistir em amplitudes que ela não oferece não é o objetivo." },
  ],
  apply: "Use a forma articular para orientar o que treinar e onde a amplitude tem limite natural. Articulações de muita mobilidade pedem variedade e controle; as de dobradiça, foco nas direções que permitem. Responder à abertura: o ombro é esférico e se beneficia de trabalho multidirecional; o cotovelo é dobradiça, então flexão e extensão são as ações que ele oferece.",
  special: [
    "Ombro: por ser muito móvel, pede trabalho de controle e estabilidade, não só amplitude.",
    "Reabilitação: respeitar a forma articular evita buscar amplitudes que a articulação não oferece.",
    "Idosos: manter amplitude funcional nas direções que a articulação permite tem valor no cotidiano.",
  ],
  mistake: {
    mistake: "Tentar ganhar amplitude em direções que a forma da articulação não permite, ou ignorar a variedade que uma articulação móvel oferece.",
    instead: "Respeite a forma: treine variedade e controle onde há mobilidade, e foque nas direções possíveis onde a forma limita. A anatomia orienta o objetivo.",
  },
  professionalCase: {
    prompt: "Aluno quer 'ganhar mobilidade lateral' no cotovelo. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Explicar que o cotovelo é uma articulação em dobradiça (flexão e extensão) e direcionar o trabalho para o que ele permite, incluindo a rotação do antebraço quando o objetivo é essa.", tone: "recomendada", feedback: "Coerente. A forma do cotovelo não oferece movimento lateral; respeitar a anatomia direciona o objetivo corretamente." },
      { id: "c2", label: "Prescrever alongamentos laterais forçados do cotovelo.", tone: "cautela", feedback: "Forçar uma direção que a forma articular não permite não ganha amplitude e pode incomodar." },
      { id: "c3", label: "Ignorar o pedido sem explicar.", tone: "aceitavel", feedback: "Explicar a forma articular educa o aluno e redireciona o objetivo de forma útil." },
    ],
  },
  quiz: [
    q("q1", "variavel", "Uma articulação esférica, como o ombro, permite:", [
      { id: "a", label: "Movimento em muitas direções." },
      { id: "b", label: "Movimento em uma única direção principal." },
    ], "a", "A forma esférica permite movimento multidirecional; a dobradiça permite uma direção principal."),
    q("q2", "verdadeiro-falso", "A forma da articulação define quais movimentos ela permite.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "v", "A forma articular orienta os movimentos possíveis e a amplitude natural."),
  ],
  uncertainty: "A anatomia articular varia entre pessoas e a função envolve tecidos além da forma óssea. Use a forma como guia geral, ajustando ao indivíduo.",
  related: [
    { title: "Estabilidade e mobilidade", href: `/aprender/conteudos/${DISC}--estabilidade-vs-mobilidade`, type: "conceito" },
    { title: "Flexibilidade e mobilidade", href: "/aprender/conteudos/mobilidade-e-flexibilidade--flexibilidade-vs-mobilidade", type: "conceito" },
    { title: "Planos de movimento", href: "/aprender/conteudos/cinesiologia--planos-movimento", type: "conceito" },
  ],
  refs: ["ref-escamilla-agachamento", "ref-diretriz-forca"],
  applyRx: "Use a forma articular para orientar o que treinar: variedade e controle onde há mobilidade, foco nas direções possíveis onde a forma limita, sem buscar amplitudes que a articulação não oferece.",
});

const estabilidadeMobilidade = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-articulacoes`, moduleSlug: "articulacoes",
  slug: `${DISC}--estabilidade-vs-mobilidade`, title: "Estabilidade e mobilidade em cadeia",
  subtitle: "Articulações e amplitude", description: "Regiões do corpo tendem a priorizar mais mobilidade ou mais estabilidade; entender isso orienta onde buscar amplitude e onde reforçar controle.",
  level: "fundamental", minutes: 9, type: "conceito", kicker: K, tags: ["estabilidade", "mobilidade", "cadeia"],
  hero: "O corpo alterna, ao longo da cadeia, regiões que pedem mais mobilidade e regiões que pedem mais estabilidade. Reconhecer esse padrão ajuda a decidir onde treinar amplitude e onde reforçar controle.",
  question: "Se um aluno tem dor lombar e pouca mobilidade de quadril, faz sentido buscar mais mobilidade na coluna lombar?",
  concepts: [
    { term: "Trade-off mobilidade e estabilidade", definition: "Ideia de que regiões vizinhas do corpo tendem a priorizar uma qualidade: por exemplo, o quadril e a torácica costumam pedir mais mobilidade; a lombar e o joelho, mais estabilidade e controle." },
    { term: "Compensação em cadeia", definition: "Quando uma região que deveria ser móvel está rígida, uma vizinha que deveria ser estável pode compensar em excesso, virando fonte de desconforto." },
  ],
  apply: "Ao ler uma queixa, considere o padrão de mobilidade e estabilidade em cadeia: buscar mobilidade onde ela é desejável (quadril, torácica) e controle onde a estabilidade é a prioridade (lombar, joelho). Responder à abertura: com quadril rígido e dor lombar, costuma fazer mais sentido melhorar a mobilidade do quadril e o controle da lombar do que buscar amplitude na coluna lombar.",
  special: [
    "Dor lombar: reforçar controle da lombar e mobilidade do quadril costuma ser mais coerente do que mobilizar a lombar.",
    "Ombro e torácica: mobilidade torácica ajuda o ombro; estabilidade escapular sustenta o movimento.",
    "Idosos: manter mobilidade de quadril e tornozelo e controle de tronco apoia a função e o equilíbrio.",
  ],
  mistake: {
    mistake: "Buscar amplitude em regiões que se beneficiam mais de estabilidade (como forçar mobilidade da lombar), esperando aliviar desconforto.",
    instead: "Reconheça o padrão em cadeia: mobilize onde a mobilidade é desejável e reforce controle onde a estabilidade é a prioridade. Isso costuma reduzir compensações.",
  },
  professionalCase: {
    prompt: "Aluno com dor lombar e quadris rígidos pede exercícios para 'soltar a lombar'. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Trabalhar mobilidade de quadril e controle do tronco, em vez de buscar amplitude na coluna lombar.", tone: "recomendada", feedback: "Coerente. O padrão em cadeia sugere mobilizar o quadril e estabilizar a lombar, reduzindo compensações." },
      { id: "c2", label: "Prescrever muitas rotações e flexões forçadas da lombar.", tone: "cautela", feedback: "Forçar amplitude numa região que se beneficia de controle pode aumentar o desconforto." },
      { id: "c3", label: "Repousar até a dor passar.", tone: "aceitavel", feedback: "O repouso prolongado tende a não resolver; movimento dirigido, respeitando o padrão em cadeia, costuma ajudar mais." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Com quadril rígido e dor lombar, a conduta mais coerente costuma ser:", [
      { id: "a", label: "Melhorar a mobilidade do quadril e o controle da lombar." },
      { id: "b", label: "Buscar mais amplitude na coluna lombar." },
    ], "a", "O padrão em cadeia sugere mobilizar o quadril e estabilizar a lombar, reduzindo compensações."),
    q("q2", "verdadeiro-falso", "Quando uma região que deveria ser móvel está rígida, uma vizinha que deveria ser estável pode compensar em excesso.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "v", "A compensação em cadeia explica por que rigidez de uma região pode sobrecarregar a vizinha."),
  ],
  uncertainty: "O padrão de mobilidade e estabilidade é um modelo didático útil, com exceções e variação individual. Use-o como guia de raciocínio, não como regra absoluta.",
  related: [
    { title: "Tipos de articulação", href: `/aprender/conteudos/${DISC}--tipos-de-articulacao`, type: "conceito" },
    { title: "Core funcional", href: `/aprender/conteudos/${DISC}--core-funcional`, type: "mecanismo" },
    { title: "Trabalho de mobilidade", href: "/aprender/conteudos/mobilidade-e-flexibilidade--mobilidade-articular", type: "mecanismo" },
  ],
  refs: ["ref-diretriz-forca", "ref-acsm-getp11"],
  applyRx: "Leia as queixas pelo padrão de mobilidade e estabilidade em cadeia: mobilize onde a mobilidade é desejável (quadril, torácica) e reforce controle onde a estabilidade é a prioridade (lombar, joelho).",
});

const cadeiaPosterior = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-cadeia-muscular`, moduleSlug: "cadeia-muscular",
  slug: `${DISC}--cadeia-posterior`, title: "Cadeia posterior: como os segmentos cooperam",
  subtitle: "Trabalho em cadeia", description: "Dorso, glúteos e isquiotibiais atuam juntos nos padrões de quadril; entender isso fundamenta terra, hip thrust e remadas.",
  level: "intermediario", minutes: 10, type: "mecanismo", kicker: K, tags: ["cadeia posterior", "quadril", "dobradiça"],
  hero: "Muitos movimentos não são feitos por um músculo, e sim por um time. A cadeia posterior reúne dorso, glúteos e isquiotibiais nos padrões de quadril, e entender essa cooperação fundamenta boa parte da prescrição.",
  question: "Por que a dobradiça de quadril (como no levantamento terra) treina tantos músculos ao mesmo tempo?",
  concepts: [
    { term: "Cadeia posterior", definition: "Conjunto de músculos do dorso, glúteos e isquiotibiais que atuam de forma coordenada, sobretudo nos padrões de extensão de quadril (dobradiça)." },
    { term: "Trabalho em cadeia", definition: "Em movimentos multiarticulares, vários músculos cooperam para produzir e estabilizar a ação. Analisar a cadeia explica o que o exercício realmente treina." },
  ],
  mechanism: {
    title: "Como a cadeia posterior atua na dobradiça",
    steps: [
      { label: "Quadril inicia o movimento", detail: "A extensão de quadril, comandada por glúteos e isquiotibiais, é o motor da dobradiça." },
      { label: "Dorso estabiliza a coluna", detail: "Os eretores mantêm a coluna firme para transferir a força com segurança." },
      { label: "Isquiotibiais participam", detail: "Como extensores de quadril e flexores de joelho, contribuem conforme a posição." },
      { label: "Força transferida", detail: "A cooperação dos segmentos permite levantar cargas maiores com a coluna controlada." },
    ],
  },
  apply: "Ao prescrever padrões de quadril, entenda que treina a cadeia posterior como um time. Escolha entre terra, stiff, hip thrust e remadas conforme a ênfase desejada e a tolerância. Responder à abertura: a dobradiça treina muitos músculos porque a extensão de quadril mobiliza glúteos e isquiotibiais enquanto o dorso estabiliza a coluna.",
  special: [
    "Dor lombar: adaptar a dobradiça (amplitude, carga, variação) mantém o estímulo da cadeia posterior com controle.",
    "Idosos: padrões de quadril treinam força funcional (levantar objetos, sentar e levantar).",
    "Hipertrofia: variar entre dobradiça e ênfase em glúteo ou isquiotibial distribui o estímulo na cadeia.",
  ],
  mistake: {
    mistake: "Analisar exercícios multiarticulares como se treinassem um músculo só, perdendo a lógica da cadeia.",
    instead: "Pense na cadeia: nos padrões de quadril, glúteos, isquiotibiais e dorso cooperam. Isso orienta a escolha e a ênfase entre os exercícios.",
  },
  professionalCase: {
    prompt: "Aluno quer fortalecer glúteos e posterior de coxa de forma integrada e funcional. Qual escolha é mais coerente?",
    choices: [
      { id: "c1", label: "Incluir padrões de dobradiça de quadril (terra, stiff, hip thrust) que treinam a cadeia posterior de forma coordenada, ajustando à tolerância.", tone: "recomendada", feedback: "Coerente. A dobradiça treina a cadeia posterior como um time, atendendo ao objetivo funcional." },
      { id: "c2", label: "Fazer só isolados de glúteo e de posterior separadamente.", tone: "aceitavel", feedback: "Isolados têm papel, mas os padrões de cadeia treinam a cooperação funcional que o aluno busca." },
      { id: "c3", label: "Focar só em extensão de joelho.", tone: "cautela", feedback: "A extensão de joelho recruta o quadríceps; não treina a cadeia posterior pretendida." },
    ],
  },
  quiz: [
    q("q1", "variavel", "A cadeia posterior, nos padrões de quadril, reúne principalmente:", [
      { id: "a", label: "Dorso, glúteos e isquiotibiais." },
      { id: "b", label: "Quadríceps e peitorais." },
    ], "a", "Dorso, glúteos e isquiotibiais cooperam nos padrões de extensão de quadril (dobradiça)."),
    q("q2", "verdadeiro-falso", "Movimentos multiarticulares treinam vários músculos cooperando, não um músculo isolado.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "v", "Em movimentos multiarticulares, os músculos cooperam para produzir e estabilizar a ação."),
  ],
  uncertainty: "A ênfase exata entre músculos da cadeia varia com a técnica, a antropometria e a variação. Use o conceito para orientar a escolha, ajustando à resposta.",
  related: [
    { title: "Core funcional", href: `/aprender/conteudos/${DISC}--core-funcional`, type: "mecanismo" },
    { title: "Padrão levantar e avançar", href: "/aprender/conteudos/padrao-levantar-e-avancar", type: "aplicacao" },
    { title: "Músculos biarticulares", href: `/aprender/conteudos/${DISC}--biarticulares`, type: "conceito" },
  ],
  refs: ["ref-escamilla-agachamento", "ref-diretriz-forca"],
  applyRx: "Nos padrões de quadril, prescreva pensando na cadeia posterior (dorso, glúteos, isquiotibiais) como um time; escolha entre terra, stiff, hip thrust e remadas conforme a ênfase e a tolerância.",
});

const coreFuncional = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-cadeia-muscular`, moduleSlug: "cadeia-muscular",
  slug: `${DISC}--core-funcional`, title: "Core funcional: estabilizar e transferir força",
  subtitle: "Trabalho em cadeia", description: "A musculatura do tronco estabiliza a coluna e transfere força entre membros; isso prioriza padrões de anti-movimento.",
  level: "intermediario", minutes: 10, type: "mecanismo", kicker: K, tags: ["core", "anti-movimento", "estabilidade"],
  hero: "O core não é só 'fazer abdominal'. A musculatura do tronco existe, em grande parte, para estabilizar a coluna e transferir força entre pernas e braços. Isso muda o que faz sentido treinar.",
  question: "Para um aluno agachar e levantar cargas com segurança, faz mais sentido treinar muitos abdominais ou a capacidade de manter o tronco firme?",
  concepts: [
    { term: "Core", definition: "Musculatura do tronco (abdominais, paravertebrais, entre outros) que estabiliza a coluna e transfere força entre os membros durante os movimentos." },
    { term: "Anti-movimento", definition: "Função central do core: resistir a movimentos indesejados da coluna (anti-extensão, anti-rotação, anti-flexão lateral), mantendo o tronco firme enquanto os membros trabalham." },
  ],
  apply: "Priorize, na maioria dos objetivos, exercícios de anti-movimento (prancha, dead bug, pallof) que treinam a função real do core de estabilizar e transferir força. Responder à abertura: para agachar e levantar com segurança, manter o tronco firme (estabilidade) importa mais do que muitos abdominais; o core estabiliza enquanto as pernas produzem força.",
  special: [
    "Dor lombar: exercícios de controle e anti-movimento costumam ser mais úteis do que flexões repetidas de tronco.",
    "Idosos: estabilidade de tronco apoia o equilíbrio e as tarefas do dia.",
    "Performance: a transferência de força pelo core sustenta levantamentos e gestos esportivos.",
  ],
  mistake: {
    mistake: "Reduzir o treino de core a muitas repetições de flexão de tronco, ignorando a função de estabilizar e transferir força.",
    instead: "Priorize padrões de anti-movimento (anti-extensão, anti-rotação) que treinam a função real do core. Estabilidade e transferência sustentam os grandes movimentos.",
  },
  professionalCase: {
    prompt: "Aluno faz centenas de abdominais e ainda 'perde o tronco' ao agachar pesado. Qual ajuste é mais coerente?",
    choices: [
      { id: "c1", label: "Incluir exercícios de anti-movimento (prancha, dead bug, pallof press) que treinam a estabilidade do tronco usada no agachamento.", tone: "recomendada", feedback: "Coerente. A função de estabilizar e transferir força, treinada por anti-movimento, é o que sustenta o tronco sob carga." },
      { id: "c2", label: "Aumentar ainda mais o número de abdominais.", tone: "cautela", feedback: "Mais flexão de tronco não treina a estabilidade que falta ao agachar pesado." },
      { id: "c3", label: "Remover o agachamento pesado.", tone: "aceitavel", feedback: "Antes de remover, treinar a estabilidade do tronco costuma resolver a perda de controle." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Para sustentar o tronco ao agachar e levantar cargas, o mais coerente é treinar:", [
      { id: "a", label: "Anti-movimento (estabilidade do tronco), como prancha e anti-rotação." },
      { id: "b", label: "Muitas repetições de flexão de tronco (abdominais)." },
    ], "a", "A função de estabilizar e transferir força, treinada por anti-movimento, sustenta os grandes movimentos."),
    q("q2", "verdadeiro-falso", "A principal função do core nos grandes movimentos é estabilizar a coluna e transferir força entre os membros.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "v", "O core estabiliza a coluna e transfere força; por isso o anti-movimento é tão treinado."),
  ],
  uncertainty: "A melhor seleção de exercícios de core depende do objetivo e do indivíduo, com evidência em construção. Priorize a função de estabilidade e transferência, ajustando ao caso.",
  related: [
    { title: "Estabilidade e mobilidade", href: `/aprender/conteudos/${DISC}--estabilidade-vs-mobilidade`, type: "conceito" },
    { title: "Cadeia posterior", href: `/aprender/conteudos/${DISC}--cadeia-posterior`, type: "mecanismo" },
    { title: "Padrão agachar", href: "/aprender/conteudos/padrao-agachar", type: "aplicacao" },
  ],
  refs: ["ref-diretriz-forca", "ref-acsm-getp11"],
  applyRx: "Priorize exercícios de anti-movimento (prancha, dead bug, anti-rotação) que treinam a função real do core de estabilizar a coluna e transferir força; estabilidade sustenta os grandes movimentos.",
});

export const anatomiaModules: Module[] = [
  deepModule({ id: `m-${DISC}-sistema-muscular`, disciplineId: DISC_ID, slug: "sistema-muscular", title: "Sistema muscular na prática", objective: "Reconhecer músculos por função, não só pelo nome.", order: 1, level: "fundamental", lessons: [musculosPorFuncao, biarticulares], applications: ["Classificar músculos por papel e usar a lógica biarticular"] }),
  deepModule({ id: `m-${DISC}-articulacoes`, disciplineId: DISC_ID, slug: "articulacoes", title: "Articulações e amplitude", objective: "Relacionar o tipo de articulação com amplitude e estabilidade.", order: 2, level: "fundamental", prerequisites: [`m-${DISC}-sistema-muscular`], lessons: [tiposArticulacao, estabilidadeMobilidade], applications: ["Decidir onde buscar amplitude e onde reforçar controle"] }),
  deepModule({ id: `m-${DISC}-cadeia-muscular`, disciplineId: DISC_ID, slug: "cadeia-muscular", title: "Trabalho em cadeia", objective: "Entender como os segmentos cooperam em um padrão de movimento.", order: 3, level: "intermediario", prerequisites: [`m-${DISC}-articulacoes`], lessons: [cadeiaPosterior, coreFuncional], applications: ["Prescrever padrões de quadril e core pela lógica de cadeia"] }),
];

export const anatomiaLessons: Lesson[] = [musculosPorFuncao, biarticulares, tiposArticulacao, estabilidadeMobilidade, cadeiaPosterior, coreFuncional];
