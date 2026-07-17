import type { Lesson, Module } from "../types";
import { deepLesson, deepModule, q } from "./authoring";

/**
 * PRESCRIÇÃO PARA GRUPOS ESPECIAIS, disciplina autorada em profundidade.
 * Linguagem prudente e educacional: a ferramenta APOIA a decisão do profissional;
 * a conduta clínica e diagnóstica é do profissional de saúde.
 */

const DISC = "prescricao-para-grupos-especiais";
const DISC_ID = "d-grupos-especiais";
const K = "Prescrição para grupos especiais";

const triagem = deepLesson({
  disciplineSlug: DISC,
  moduleId: `m-${DISC}-principios-grupos`,
  moduleSlug: "principios-grupos",
  slug: `${DISC}--triagem`,
  title: "Triagem pré-participação: liberar com segurança",
  subtitle: "Princípios gerais",
  description: "Um levantamento simples de sinais e condições antes do esforço orienta a liberação e os cuidados da sessão.",
  level: "intermediario",
  minutes: 11,
  type: "conceito",
  kicker: K,
  tags: ["triagem", "PAR-Q", "segurança", "liberação"],
  hero: "Antes de aumentar a demanda sobre um aluno, vale saber, em poucos minutos, se há sinais que pedem cuidado, ajuste ou liberação do profissional de saúde. A triagem é esse filtro inicial.",
  question: "Antes da primeira sessão de um aluno com histórico de hipertensão, o que você precisa verificar para liberar o treino de hoje com segurança?",
  concepts: [
    { term: "Triagem pré-participação", definition: "Levantamento de sinais, sintomas e condições antes de iniciar ou intensificar o esforço, com instrumentos simples como o PAR-Q+ (Warburton et al., 2011). Orienta liberar, ajustar ou encaminhar." },
    { term: "Semáforo de liberação", definition: "Aplicação prática da triagem por sessão: um checklist rápido que resulta em liberado, liberado com ajuste ou não liberado hoje, sempre com a decisão final do profissional." },
  ],
  decisionTree: {
    title: "O que a triagem orienta",
    root: "O aluno apresenta sinais de alerta hoje?",
    branches: [
      { condition: "Nenhum sinal de alerta", outcome: "Liberado: seguir com o plano, monitorando a resposta durante a sessão." },
      { condition: "Sinais leves ou parâmetros no limite", outcome: "Liberado com ajuste: reduzir intensidade, evitar apneia, monitorar mais de perto." },
      { condition: "Sinais importantes (dor no peito, PA muito alta, sintomas)", outcome: "Não liberado hoje: adiar o esforço e considerar avaliação do profissional de saúde." },
    ],
  },
  apply: "Faça a triagem no início do vínculo e um checklist rápido por sessão em grupos de risco. No app, o Semáforo de Liberação estrutura isso por grupo. Responder à abertura: para o hipertenso, verificar sinais e a pressão em repouso e ausência de sintomas orienta liberar, ajustar ou adiar, sempre respeitando a conduta do profissional de saúde.",
  special: [
    "Hipertensão: pressão de repouso muito alta ou sintomas pedem cautela ou adiamento; evite apneia e cargas máximas.",
    "Diabetes: sinais de hipoglicemia pedem conduta antes do esforço; alimentação e monitoramento importam (Colberg et al., 2016).",
    "Idosos e cardiopatas: tontura, dor no peito e falta de ar desproporcional são sinais de interromper e reavaliar.",
  ],
  mistake: {
    mistake: "Iniciar ou intensificar o treino de um grupo de risco sem qualquer triagem, confiando que 'vai dar tudo certo'.",
    instead: "Aplique uma triagem simples e um checklist por sessão nos grupos de risco. É rápido, orienta a conduta e protege o aluno e o profissional.",
  },
  professionalCase: {
    prompt: "Aluno hipertenso chega para treinar relatando dor de cabeça forte e mal-estar hoje. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Não liberar o esforço intenso hoje, registrar e orientar avaliação do profissional de saúde.", tone: "recomendada", feedback: "Coerente. Sintomas em um hipertenso pedem cautela; adiar e encaminhar é a conduta segura." },
      { id: "c2", label: "Treinar normalmente, assumindo que passa durante o exercício.", tone: "cautela", feedback: "Ignorar sintomas em grupo de risco pode ser perigoso; a triagem existe justamente para isso." },
      { id: "c3", label: "Fazer só um treino leve sem verificar nada.", tone: "aceitavel", feedback: "Reduzir a intensidade ajuda, mas sem checar os sinais a decisão fica incompleta; triagem primeiro." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Sinais importantes na triagem (dor no peito, PA muito alta, sintomas) indicam:", [
      { id: "a", label: "Não liberar o esforço hoje e considerar avaliação do profissional de saúde." },
      { id: "b", label: "Treinar normalmente para não perder a sessão." },
    ], "a", "Sinais importantes pedem adiar o esforço e encaminhar; a triagem orienta essa decisão de segurança."),
    q("q2", "verdadeiro-falso", "A triagem pré-participação substitui a avaliação médica.", [
      { id: "v", label: "Verdadeiro" },
      { id: "f", label: "Falso" },
    ], "f", "A triagem orienta liberar, ajustar ou encaminhar; a conduta clínica e diagnóstica é do profissional de saúde."),
  ],
  uncertainty: "Instrumentos de triagem reduzem risco, mas não o eliminam, e não são diagnósticos. Na dúvida, prefira encaminhar; a decisão final é sempre do profissional habilitado.",
  related: [
    { title: "Adaptar sem esvaziar", href: `/aprender/conteudos/${DISC}--adaptar-sem-esvaziar`, type: "conceito" },
    { title: "Triagem e segurança (PAR-Q)", href: "/aprender/conteudos/seguranca-e-limites-de-atuacao--triagem-parq", type: "conceito" },
    { title: "Risco cardiometabólico", href: `/aprender/conteudos/${DISC}--cardiometabolico`, type: "conceito" },
  ],
  refs: ["ref-parq-2011", "ref-acsm-getp11", "ref-pescatello-hipertensao-2004"],
  applyRx: "Faça a triagem no início do vínculo e um checklist rápido por sessão nos grupos de risco (o Semáforo do app estrutura isso). Diante de sinais importantes, adie o esforço e encaminhe; a decisão final é do profissional.",
});

const adaptar = deepLesson({
  disciplineSlug: DISC,
  moduleId: `m-${DISC}-principios-grupos`,
  moduleSlug: "principios-grupos",
  slug: `${DISC}--adaptar-sem-esvaziar`,
  title: "Adaptar sem esvaziar o estímulo",
  subtitle: "Princípios gerais",
  description: "Ajustar carga, amplitude e modalidade para uma condição é diferente de retirar o estímulo. Adaptar preserva o objetivo.",
  level: "intermediario",
  minutes: 10,
  type: "conceito",
  kicker: K,
  tags: ["adaptação", "grupos especiais", "estímulo"],
  hero: "Diante de uma condição especial, o reflexo comum é tirar exercícios. Mas adaptar é ajustar o como, preservando o estímulo que o aluno precisa. Retirar por medo costuma custar resultado sem ganhar segurança.",
  question: "Um aluno com dor no joelho não pode simplesmente parar de treinar pernas. Como manter o estímulo de forma segura?",
  concepts: [
    { term: "Adaptação", definition: "Ajuste de carga, amplitude, velocidade ou modalidade para respeitar uma condição, mantendo o objetivo do treino. Adaptar é diferente de remover." },
    { term: "Estímulo preservado", definition: "A ideia de que, mesmo com restrições, é quase sempre possível manter algum estímulo útil ao objetivo, escolhendo variações toleradas." },
  ],
  comparison: {
    title: "Adaptar e retirar não são a mesma coisa",
    leftTitle: "Adaptar (recomendado)",
    rightTitle: "Retirar por padrão (a evitar)",
    leftItems: [
      "Troca por variação tolerada que mantém o estímulo.",
      "Ajusta amplitude, carga e velocidade à condição.",
      "Progride conforme a tolerância melhora.",
    ],
    rightItems: [
      "Remove o padrão inteiro por precaução excessiva.",
      "Perde estímulo importante sem ganho claro de segurança.",
      "Fragiliza a região que se queria proteger, por desuso.",
    ],
    note: "Responder à abertura: para o joelho dolorido, adaptar amplitude, carga e escolher variações toleradas (por exemplo, leg press em amplitude confortável) mantém o estímulo. Parar de treinar pernas costuma enfraquecer a região que se quer proteger.",
  },
  apply: "Diante de uma restrição, pergunte o que pode ser adaptado antes de remover: amplitude, carga, velocidade, apoio, modalidade. Escolha variações toleradas que mantenham o objetivo e progrida pela resposta. A conduta clínica sobre a condição segue o profissional de saúde; a adaptação do treino é do profissional de Educação Física.",
  special: [
    "Osteoartrite: movimento gradual e carga controlada costumam ser aliados; ajustar amplitude e impacto preserva o estímulo.",
    "Dor lombar: adaptar padrões e amplitude, modulando pela tolerância, mantém o treino sem provocar.",
    "Cardiometabólico: adaptar intensidade e modalidade permite treinar com segurança dentro dos cuidados do grupo.",
  ],
  mistake: {
    mistake: "Remover exercícios ou padrões inteiros ao primeiro sinal de restrição, esvaziando o estímulo por precaução.",
    instead: "Adapte primeiro: mude o como, não o objetivo. A maioria das condições permite manter estímulo útil com variações toleradas e progressão pela resposta.",
  },
  professionalCase: {
    prompt: "Aluna com dor no ombro em exercícios acima da cabeça, objetivo hipertrofia de ombros. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Substituir os movimentos provocativos por variações toleradas (amplitude e ângulo ajustados) que mantenham o estímulo, progredindo pela tolerância.", tone: "recomendada", feedback: "Coerente. Adaptar preserva o objetivo de ombros com segurança, em vez de abandonar o grupo." },
      { id: "c2", label: "Retirar todo o trabalho de ombro até a dor sumir sozinha.", tone: "cautela", feedback: "Remover o padrão inteiro perde estímulo e pode enfraquecer a região; adaptar costuma ser melhor." },
      { id: "c3", label: "Manter os mesmos exercícios provocativos, ignorando a dor.", tone: "cautela", feedback: "Insistir no que provoca dor desrespeita a tolerância e pode agravar; adaptar é o caminho." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Diante de uma restrição articular, o primeiro passo mais coerente é:", [
      { id: "a", label: "Adaptar amplitude, carga e variação para manter estímulo tolerado." },
      { id: "b", label: "Remover o padrão inteiro por precaução." },
    ], "a", "Adaptar preserva o objetivo com segurança; remover por padrão perde estímulo sem ganho claro."),
    q("q2", "verdadeiro-falso", "Adaptar o treino a uma condição é o mesmo que retirar o estímulo.", [
      { id: "v", label: "Verdadeiro" },
      { id: "f", label: "Falso" },
    ], "f", "Adaptar ajusta o como mantendo o objetivo; retirar por padrão esvazia o estímulo."),
  ],
  uncertainty: "O limite entre adaptar e evitar depende da condição, da tolerância e da orientação do profissional de saúde. Na dúvida sobre segurança, encaminhe e adapte de forma conservadora.",
  related: [
    { title: "Triagem pré-participação", href: `/aprender/conteudos/${DISC}--triagem`, type: "conceito" },
    { title: "Amplitude tolerada", href: "/aprender/conteudos/dor-limitacoes-e-adaptacao--amplitude-tolerada", type: "mecanismo" },
    { title: "Cuidado musculoesquelético", href: `/aprender/conteudos/${DISC}--musculoesqueletico`, type: "conceito" },
  ],
  refs: ["ref-acsm-getp11", "ref-diretriz-forca"],
  applyRx: "Diante de uma restrição, adapte antes de remover: ajuste amplitude, carga, velocidade e modalidade, escolhendo variações toleradas que mantenham o objetivo, e progrida pela resposta. A conduta clínica é do profissional de saúde.",
});

const cardiometabolico = deepLesson({
  disciplineSlug: DISC,
  moduleId: `m-${DISC}-condicoes`,
  moduleSlug: "condicoes",
  slug: `${DISC}--cardiometabolico`,
  title: "Risco cardiometabólico: hipertensão, diabetes e obesidade",
  subtitle: "Condições frequentes",
  description: "Cuidados de intensidade, respiração e monitoramento para as condições cardiometabólicas mais comuns.",
  level: "avancado",
  minutes: 12,
  type: "conceito",
  kicker: K,
  tags: ["hipertensão", "diabetes", "obesidade", "cardiometabólico"],
  hero: "Hipertensão, diabetes e obesidade são frequentes e respondem bem ao exercício, com cuidados específicos de intensidade, respiração e monitoramento. A indicação é ampla; a conduta clínica é do profissional de saúde.",
  question: "Quais cuidados gerais orientam a prescrição para um aluno com hipertensão e sobrepeso que quer começar a treinar?",
  concepts: [
    { term: "Risco cardiometabólico", definition: "Conjunto de condições (hipertensão, diabetes, obesidade, síndrome metabólica) que pedem cuidados de intensidade, respiração e monitoramento, com benefício consistente do exercício regular." },
    { term: "Manobra de Valsalva", definition: "Prender a respiração e fazer força contra a glote, o que eleva a pressão de forma aguda. Deve ser evitada, sobretudo na hipertensão, preferindo respiração contínua." },
  ],
  figure: { id: "eixo-endocrino" },
  apply: "Para o perfil cardiometabólico, comece com predominância aeróbia de intensidade moderada e força com cargas moderadas, evite apneia, não leve toda série à falha e monitore sinais e, quando indicado, a pressão. Combine com boa progressão e triagem por sessão. Responder à abertura: hipertensão e sobrepeso pedem começar moderado, sem apneia, com monitoramento e progressão gradual, dentro dos cuidados do grupo.",
  special: [
    "Hipertensão: predominância aeróbia moderada; evitar apneia e cargas máximas; monitorar a resposta (Pescatello et al., 2004).",
    "Diabetes: combinar aeróbio e força; atenção a hipoglicemia, alimentação e pés; monitorar (Colberg et al., 2016).",
    "Obesidade: priorizar baixo impacto para poupar articulações e sustentar volume; progressão gradual.",
  ],
  mistake: {
    mistake: "Aplicar treino intenso com apneia e cargas máximas a um hipertenso, ou ignorar sinais de hipoglicemia em um diabético.",
    instead: "Respeite os cuidados do grupo: intensidade moderada, respiração contínua, monitoramento e triagem por sessão. A segurança vem antes da intensidade nesses perfis.",
  },
  professionalCase: {
    prompt: "Aluno com diabetes tipo 2, iniciando musculação, relata tremores e tontura antes da sessão. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Suspeitar de hipoglicemia, não iniciar o esforço, orientar conduta imediata e seguir a orientação do profissional de saúde.", tone: "recomendada", feedback: "Coerente. Sinais de hipoglicemia pedem conduta antes do esforço; segurança primeiro, dentro do escopo e com encaminhamento." },
      { id: "c2", label: "Iniciar o treino normalmente, assumindo que os sintomas passam.", tone: "cautela", feedback: "Ignorar sinais de hipoglicemia é perigoso; a conduta segura é não iniciar e resolver o sinal primeiro." },
      { id: "c3", label: "Fazer só aeróbio leve sem verificar os sintomas.", tone: "cautela", feedback: "Reduzir a intensidade não resolve um possível quadro de hipoglicemia; os sintomas precisam de conduta antes." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Na prescrição para hipertensão, um cuidado central é:", [
      { id: "a", label: "Evitar a apneia (Valsalva) e priorizar intensidade moderada com monitoramento." },
      { id: "b", label: "Priorizar cargas máximas com apneia para eficiência." },
    ], "a", "A apneia eleva a pressão de forma aguda; hipertensão pede respiração contínua e intensidade moderada."),
    q("q2", "conduta", "Sinais de hipoglicemia antes do treino de um diabético pedem:", [
      { id: "a", label: "Não iniciar o esforço e resolver o sinal primeiro, seguindo orientação de saúde." },
      { id: "b", label: "Treinar para 'melhorar a glicose'." },
    ], "a", "Sinais de hipoglicemia exigem conduta antes do esforço; a segurança vem primeiro."),
  ],
  uncertainty: "As respostas ao exercício variam entre indivíduos e com a medicação; as diretrizes orientam, mas a conduta clínica é do profissional de saúde. Individualize dentro dos cuidados do grupo.",
  related: [
    { title: "Triagem pré-participação", href: `/aprender/conteudos/${DISC}--triagem`, type: "conceito" },
    { title: "Pressão no exercício", href: "/aprender/conteudos/fisiologia-humana--pressao-no-exercicio", type: "conceito" },
    { title: "Métodos aeróbios", href: "/aprender/conteudos/treinamento-cardiorrespiratorio--continuo", type: "conceito" },
  ],
  refs: ["ref-pescatello-hipertensao-2004", "ref-colberg-diabetes-2016", "ref-acsm-getp11"],
  applyRx: "Para o perfil cardiometabólico, comece moderado, evite apneia, não leve toda série à falha, monitore sinais e triagem por sessão, e progrida gradualmente. A conduta clínica e a medicação são do profissional de saúde.",
});

const musculoesqueletico = deepLesson({
  disciplineSlug: DISC,
  moduleId: `m-${DISC}-condicoes`,
  moduleSlug: "condicoes",
  slug: `${DISC}--musculoesqueletico`,
  title: "Cuidado musculoesquelético: dor lombar e osteoartrite",
  subtitle: "Condições frequentes",
  description: "Carga controlada e modulação pela dor mantêm o estímulo em condições articulares comuns.",
  level: "avancado",
  minutes: 11,
  type: "conceito",
  kicker: K,
  tags: ["dor lombar", "osteoartrite", "carga controlada"],
  hero: "Dor lombar e osteoartrite não pedem repouso, e sim movimento bem dosado. Carga controlada e progressão guiada pela tolerância costumam ser aliadas, dentro dos cuidados de cada caso.",
  question: "Um aluno com osteoartrite de joelho pode e deve treinar pernas. Como fazer isso sem provocar a articulação?",
  concepts: [
    { term: "Carga controlada", definition: "Dose de exercício ajustada à tolerância, aumentada de forma gradual. Em condições articulares, movimento controlado costuma reduzir sintomas e melhorar a função." },
    { term: "Modulação pela dor", definition: "Usar a resposta da dor (durante, após e no dia seguinte) para ajustar carga e amplitude, mantendo o esforço dentro de um nível tolerado e não crescente." },
  ],
  apply: "Em condições articulares, mantenha o aluno em movimento com carga controlada e amplitude tolerada, progredindo pela resposta da dor, não pelo calendário. Escolha variações e impactos que a articulação tolera. A diretriz posiciona o exercício como intervenção de primeira linha em muitas dessas condições, sempre com conduta clínica do profissional de saúde. Responder à abertura: para o joelho com osteoartrite, treinar com amplitude confortável, carga progressiva e impacto ajustado costuma melhorar dor e função.",
  special: [
    "Osteoartrite: inchaço, calor e dor aguda pedem cautela e possível troca por baixo impacto; fora das crises, o movimento é aliado.",
    "Dor lombar: adaptar padrões e amplitude, progredir gradual e evitar alarmar; a maioria dos casos não pede repouso.",
    "Sinais de alerta (dor noturna que não alivia, déficit neurológico, febre): encaminhar ao profissional de saúde.",
  ],
  mistake: {
    mistake: "Recomendar repouso e evitar treinar a região dolorida, o que costuma piorar a função por desuso.",
    instead: "Mantenha o movimento com carga controlada e progressão pela tolerância. O exercício bem dosado é, em geral, parte da solução, não do problema.",
  },
  professionalCase: {
    prompt: "Aluno com osteoartrite de joelho, sem crise, evita qualquer exercício de perna por medo de piorar. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Introduzir carga controlada em amplitude confortável e baixo impacto, progredindo pela tolerância, explicando que o movimento tende a ajudar.", tone: "recomendada", feedback: "Coerente. Fora de crise, o exercício dosado costuma melhorar dor e função; educar reduz o medo." },
      { id: "c2", label: "Recomendar repouso da região até a dor sumir.", tone: "cautela", feedback: "O repouso prolongado tende a piorar a função por desuso; o movimento controlado é aliado." },
      { id: "c3", label: "Carga alta e amplitude máxima logo para 'fortalecer rápido'.", tone: "cautela", feedback: "Progressão agressiva pode provocar sintomas; a carga deve ser controlada e guiada pela tolerância." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Para osteoartrite de joelho fora de crise, a conduta mais coerente é:", [
      { id: "a", label: "Movimento com carga controlada e amplitude tolerada, progredindo pela resposta." },
      { id: "b", label: "Repouso da região até a dor desaparecer." },
    ], "a", "O exercício dosado costuma melhorar dor e função; o repouso prolongado piora por desuso."),
    q("q2", "verdadeiro-falso", "Dor lombar comum geralmente exige repouso e evitar treinar a região.", [
      { id: "v", label: "Verdadeiro" },
      { id: "f", label: "Falso" },
    ], "f", "A maioria dos casos de dor lombar se beneficia de movimento adaptado e progressão gradual, não de repouso."),
  ],
  uncertainty: "A tolerância e a resposta variam muito entre pessoas e ao longo do tempo, e alguns sinais pedem encaminhamento. Progrida pela resposta individual, com conduta clínica do profissional de saúde.",
  related: [
    { title: "Adaptar sem esvaziar", href: `/aprender/conteudos/${DISC}--adaptar-sem-esvaziar`, type: "conceito" },
    { title: "Dor e dano", href: "/aprender/conteudos/dor-limitacoes-e-adaptacao--dor-nao-e-dano", type: "conceito" },
    { title: "Monitorar a resposta à carga", href: "/aprender/conteudos/dor-limitacoes-e-adaptacao--monitorar-resposta", type: "conceito" },
  ],
  refs: ["ref-acsm-getp11", "ref-diretriz-forca"],
  applyRx: "Em dor lombar e osteoartrite, mantenha o movimento com carga controlada e amplitude tolerada, progredindo pela resposta da dor, com variações de impacto ajustadas. Encaminhe diante de sinais de alerta; a conduta clínica é do profissional de saúde.",
});

export const gruposEspeciaisModules: Module[] = [
  deepModule({
    id: `m-${DISC}-principios-grupos`,
    disciplineId: DISC_ID,
    slug: "principios-grupos",
    title: "Princípios gerais",
    objective: "Adaptar cuidados sem esvaziar o estímulo, com triagem de segurança.",
    order: 1,
    level: "intermediario",
    lessons: [triagem, adaptar],
    applications: ["Triar por sessão e adaptar preservando o objetivo"],
  }),
  deepModule({
    id: `m-${DISC}-condicoes`,
    disciplineId: DISC_ID,
    slug: "condicoes",
    title: "Condições frequentes",
    objective: "Reconhecer cuidados por condição, dentro do escopo.",
    order: 2,
    level: "avancado",
    prerequisites: [`m-${DISC}-principios-grupos`],
    lessons: [cardiometabolico, musculoesqueletico],
    applications: ["Aplicar cuidados por condição, com conduta clínica do profissional de saúde"],
  }),
];

export const gruposEspeciaisLessons: Lesson[] = [triagem, adaptar, cardiometabolico, musculoesqueletico];
