import type { Lesson, Module } from "../types";
import { deepLesson, deepModule, q } from "./authoring";

/** SEGURANÇA E LIMITES DE ATUAÇÃO, disciplina autorada em profundidade. */

const DISC = "seguranca-e-limites-de-atuacao";
const DISC_ID = "d-seguranca";
const K = "Segurança e limites de atuação";

const sinaisAlerta = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-seguranca`, moduleSlug: "seguranca",
  slug: `${DISC}--sinais-alerta`, title: "Sinais de alerta: quando interromper",
  figure: { id: "sinais-alerta" },
  subtitle: "Segurança na sessão", description: "Reconhecer sinais que pedem interromper o esforço e reavaliar é parte central da conduta segura.",
  level: "fundamental", minutes: 9, type: "conceito", kicker: K, tags: ["sinais de alerta", "segurança", "interromper"],
  hero: "A maior parte das sessões é segura, mas alguns sinais pedem parar na hora. Reconhecê-los e agir rápido é uma responsabilidade básica de quem conduz o treino.",
  question: "Durante o treino, um aluno relata dor no peito e falta de ar desproporcional ao esforço. O que fazer imediatamente?",
  concepts: [
    { term: "Sinais de alerta", definition: "Manifestações que pedem interromper o esforço: dor no peito, tontura, falta de ar desproporcional, palpitações, mal-estar súbito, dor aguda incapacitante." },
    { term: "Conduta imediata", definition: "Diante de um sinal de alerta, interromper o esforço, acolher o aluno, avaliar a gravidade e, quando indicado, acionar ajuda e encaminhar ao profissional de saúde." },
  ],
  apply: "Ensine a você e ao aluno a reconhecer os sinais de alerta e interrompa o esforço diante deles, sem hesitar. Reavalie e encaminhe quando indicado. Responder à abertura: dor no peito e falta de ar desproporcional pedem parar imediatamente, acolher, avaliar e acionar ajuda conforme a gravidade.",
  special: [
    "Cardiopatas e hipertensos: os sinais cardiovasculares exigem atenção redobrada e limiar baixo para interromper.",
    "Idosos: tontura e desequilíbrio pedem cautela pelo risco de queda, além da causa de base.",
    "Diabéticos: sinais de hipoglicemia (tremor, confusão, sudorese) pedem conduta antes de qualquer esforço.",
  ],
  mistake: {
    mistake: "Minimizar sinais de alerta para não interromper a sessão ou por achar que 'vai passar'.",
    instead: "Interrompa diante de qualquer sinal de alerta e reavalie. Errar para o lado da cautela é sempre a conduta correta com sinais de risco.",
  },
  professionalCase: {
    prompt: "Aluno sente tontura forte e mal-estar súbito no meio do treino. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Interromper o esforço, sentar o aluno em segurança, avaliar e acionar ajuda ou encaminhar conforme a gravidade.", tone: "recomendada", feedback: "Coerente. Sinais de alerta pedem interromper e avaliar de imediato; a segurança vem antes de tudo." },
      { id: "c2", label: "Reduzir a intensidade e continuar para não perder a sessão.", tone: "cautela", feedback: "Sinais de alerta pedem parar, não apenas suavizar; continuar pode ser perigoso." },
      { id: "c3", label: "Esperar alguns minutos e retomar se melhorar.", tone: "cautela", feedback: "Retomar sem avaliar o motivo do mal-estar mantém o risco; avalie e encaminhe primeiro." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Diante de dor no peito durante o treino, a conduta correta é:", [
      { id: "a", label: "Interromper o esforço imediatamente, avaliar e acionar ajuda conforme a gravidade." },
      { id: "b", label: "Reduzir a carga e seguir a sessão." },
    ], "a", "Sinais como dor no peito pedem parar de imediato e avaliar; nunca apenas suavizar."),
    q("q2", "verdadeiro-falso", "Diante de sinais de alerta, é sempre correto errar para o lado da cautela.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "v", "Com sinais de risco, interromper e avaliar é a conduta segura; a cautela protege o aluno."),
  ],
  uncertainty: "Nem todo sinal indica gravidade, mas a avaliação de risco no momento é imperfeita. Na dúvida, interrompa e encaminhe; a decisão clínica é do profissional de saúde.",
  related: [
    { title: "Triagem (PAR-Q)", href: `/aprender/conteudos/${DISC}--triagem-parq`, type: "conceito" },
    { title: "Encaminhamento", href: `/aprender/conteudos/${DISC}--encaminhamento`, type: "conceito" },
    { title: "Risco cardiometabólico", href: "/aprender/conteudos/prescricao-para-grupos-especiais--cardiometabolico", type: "conceito" },
  ],
  refs: ["ref-acsm-getp11", "ref-parq-2011"],
  applyRx: "Reconheça os sinais de alerta e interrompa o esforço diante deles, acolhendo, avaliando e acionando ajuda ou encaminhando conforme a gravidade. Na dúvida, prefira a cautela.",
});

const triagemParq = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-seguranca`, moduleSlug: "seguranca",
  slug: `${DISC}--triagem-parq`, title: "Prontidão para atividade: a triagem inicial",
  subtitle: "Segurança na sessão", description: "Perguntas simples antes de liberar o esforço orientam quando seguir, ajustar ou encaminhar.",
  level: "fundamental", minutes: 9, type: "conceito", kicker: K, tags: ["PAR-Q", "prontidão", "triagem"],
  hero: "Antes de aumentar a demanda sobre alguém, algumas perguntas simples revelam se há condições que pedem cuidado ou liberação do profissional de saúde. É a prontidão para a atividade.",
  question: "Um aluno novo quer começar a treinar hoje. O que precisa ser verificado antes de liberar o esforço?",
  concepts: [
    { term: "Prontidão para atividade", definition: "Avaliação inicial, por instrumentos como o PAR-Q+, de condições e sinais que orientam liberar, ajustar ou encaminhar antes de iniciar ou intensificar o esforço (Warburton et al., 2011)." },
    { term: "Gate pré-sessão", definition: "Uso prático da triagem por sessão, sobretudo em grupos de risco, resultando em liberar, ajustar ou não liberar hoje, com a decisão final do profissional." },
  ],
  apply: "Aplique uma triagem simples no início do vínculo e um checklist por sessão em grupos de risco. No app, o Semáforo de Liberação estrutura esse gate por grupo. Responder à abertura: antes de liberar, verifique condições de saúde relevantes, sinais e sintomas do dia, para decidir seguir, ajustar ou encaminhar.",
  special: [
    "Grupos especiais: a triagem por sessão ganha peso; alguns achados pedem liberação do profissional de saúde.",
    "Iniciantes com fatores de risco: a triagem inicial pode indicar avaliação médica antes de esforços mais intensos.",
    "Idosos: incluir equilíbrio e risco de queda na triagem orienta a escolha dos exercícios.",
  ],
  mistake: {
    mistake: "Iniciar o treino sem nenhuma triagem, assumindo que todo aluno está apto a qualquer esforço.",
    instead: "Faça a triagem inicial e um checklist por sessão nos grupos de risco. É rápido, orienta a conduta e é parte da atuação responsável.",
  },
  professionalCase: {
    prompt: "Aluno novo, sedentário, com histórico familiar cardíaco, quer iniciar treino intenso. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Aplicar a triagem, iniciar de forma gradual e considerar avaliação do profissional de saúde antes de esforços mais intensos.", tone: "recomendada", feedback: "Coerente. A triagem orienta um início seguro e o encaminhamento quando os fatores de risco indicam." },
      { id: "c2", label: "Iniciar treino intenso hoje, já que ele quer.", tone: "cautela", feedback: "Sem triagem e com fatores de risco, o esforço intenso imediato é imprudente." },
      { id: "c3", label: "Recusar-se a treinar até ter laudo médico, sem qualquer atividade.", tone: "aceitavel", feedback: "Muitas vezes é possível iniciar gradual com segurança; a triagem define quando o laudo é necessário." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Antes de liberar o esforço de um aluno novo, o passo básico é:", [
      { id: "a", label: "Aplicar uma triagem de prontidão para orientar seguir, ajustar ou encaminhar." },
      { id: "b", label: "Iniciar o treino e observar durante a sessão." },
    ], "a", "A triagem inicial orienta a liberação segura; observar sem triar deixa o risco sem filtro."),
    q("q2", "verdadeiro-falso", "A triagem de prontidão substitui a avaliação médica quando necessária.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "f", "A triagem orienta e indica quando encaminhar; a avaliação e a conduta clínica são do profissional de saúde."),
  ],
  uncertainty: "Instrumentos de triagem reduzem, mas não eliminam o risco, e não são diagnósticos. Na dúvida, encaminhe; a decisão final é do profissional habilitado.",
  related: [
    { title: "Sinais de alerta", href: `/aprender/conteudos/${DISC}--sinais-alerta`, type: "conceito" },
    { title: "Escopo de atuação", href: `/aprender/conteudos/${DISC}--escopo-atuacao`, type: "conceito" },
    { title: "Triagem para grupos especiais", href: "/aprender/conteudos/prescricao-para-grupos-especiais--triagem", type: "conceito" },
  ],
  refs: ["ref-parq-2011", "ref-acsm-getp11"],
  applyRx: "Aplique a triagem de prontidão no início do vínculo e um checklist por sessão nos grupos de risco (o Semáforo do app estrutura isso), decidindo seguir, ajustar ou encaminhar. A conduta clínica é do profissional de saúde.",
});

const escopo = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-escopo`, moduleSlug: "escopo",
  slug: `${DISC}--escopo-atuacao`, title: "Escopo de atuação: o que compete a cada profissional",
  subtitle: "Escopo profissional", description: "Saber o que é da Educação Física e o que é da saúde protege o aluno e o profissional.",
  level: "intermediario", minutes: 10, type: "conceito", kicker: K, tags: ["escopo", "CREF", "atuação"],
  hero: "Atuar com segurança é também saber os próprios limites. O profissional de Educação Física prescreve e conduz o treino; diagnóstico, tratamento e conduta clínica são de outras profissões da saúde.",
  question: "Um aluno pede que você 'trate' a dor no joelho dele e ajuste a medicação para treinar melhor. O que responder?",
  concepts: [
    { term: "Escopo profissional", definition: "Conjunto de competências que cabem ao profissional de Educação Física (avaliar aptidão, prescrever e conduzir exercício, orientar hábitos de treino) em distinção às competências clínicas e diagnósticas da saúde." },
    { term: "Atuação em rede", definition: "Trabalhar em colaboração com outros profissionais (médico, fisioterapeuta, nutricionista), reconhecendo quando a demanda pertence a outra área e encaminhando." },
  ],
  apply: "Deixe claro, para você e para o aluno, o que compete a cada profissional. Você adapta o treino a uma condição; o diagnóstico, o tratamento e a medicação são da saúde. A ferramenta apoia a decisão do profissional habilitado, não decide por ele. Responder à abertura: você não trata a dor nem ajusta medicação; adapta o treino à tolerância e encaminha a conduta clínica ao profissional de saúde.",
  special: [
    "Grupos especiais: a conduta clínica permanece com o profissional de saúde; você adapta o treino dentro do escopo.",
    "Dor persistente ou sinais de alerta: encaminhar é parte da atuação responsável, não uma falha.",
    "Nutrição e medicação: orientações específicas cabem aos profissionais habilitados; mantenha-se no seu escopo.",
  ],
  mistake: {
    mistake: "Assumir condutas de outras profissões (diagnosticar, tratar dor, opinar sobre medicação) para agradar o aluno.",
    instead: "Atue no seu escopo: adapte o treino e encaminhe o que é clínico. Reconhecer limites protege o aluno e fortalece a sua credibilidade.",
  },
  professionalCase: {
    prompt: "Aluno insiste para você indicar um remédio para dor e diagnosticar a lesão dele. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Explicar que isso é conduta do profissional de saúde, encaminhar, e seguir adaptando o treino à tolerância dentro do seu escopo.", tone: "recomendada", feedback: "Coerente. Reconhecer o escopo protege o aluno e o profissional; você adapta o treino e encaminha o clínico." },
      { id: "c2", label: "Indicar um remédio comum para ajudar rápido.", tone: "cautela", feedback: "Indicar medicação está fora do escopo e é conduta de saúde; pode prejudicar o aluno." },
      { id: "c3", label: "Dar um diagnóstico provável para tranquilizá-lo.", tone: "cautela", feedback: "Diagnosticar não compete ao profissional de Educação Física; encaminhe para avaliação adequada." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Quando um aluno pede diagnóstico e indicação de medicação, o correto é:", [
      { id: "a", label: "Encaminhar ao profissional de saúde e seguir adaptando o treino no seu escopo." },
      { id: "b", label: "Atender ao pedido para não frustrar o aluno." },
    ], "a", "Diagnóstico e medicação são da saúde; o profissional de Educação Física adapta o treino e encaminha o clínico."),
    q("q2", "verdadeiro-falso", "Adaptar o treino a uma condição está dentro do escopo do profissional de Educação Física.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "v", "Adaptar carga, amplitude e modalidade é competência do profissional; a conduta clínica é de outras profissões."),
  ],
  uncertainty: "As fronteiras entre áreas às vezes se sobrepõem e variam por contexto e regulação. Na dúvida sobre o que é clínico, encaminhe e atue em colaboração.",
  related: [
    { title: "Encaminhamento", href: `/aprender/conteudos/${DISC}--encaminhamento`, type: "conceito" },
    { title: "Documentar a decisão", href: "/aprender/conteudos/raciocinio-de-prescricao--documentar", type: "aplicacao" },
    { title: "Adaptar sem esvaziar", href: "/aprender/conteudos/prescricao-para-grupos-especiais--adaptar-sem-esvaziar", type: "conceito" },
  ],
  refs: ["ref-acsm-getp11", "ref-parq-2011"],
  applyRx: "Atue no seu escopo: adapte o treino à condição e encaminhe diagnóstico, tratamento e medicação ao profissional de saúde. A ferramenta apoia a decisão do profissional habilitado, sem substituí-la.",
});

const encaminhamento = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-escopo`, moduleSlug: "escopo",
  slug: `${DISC}--encaminhamento`, title: "Encaminhamento: parte da conduta segura",
  subtitle: "Escopo profissional", description: "Direcionar o aluno a outro profissional diante de sinais de alerta é responsabilidade, não fraqueza.",
  level: "intermediario", minutes: 9, type: "conceito", kicker: K, tags: ["encaminhamento", "rede", "segurança"],
  hero: "Encaminhar não é admitir incompetência; é reconhecer que aquela demanda pertence a outra área. É uma das condutas mais profissionais que existem.",
  question: "Quando um aluno relata dor que não passa, com sinais que fogem do treino, qual é a conduta responsável?",
  concepts: [
    { term: "Encaminhamento", definition: "Direcionar o aluno a outro profissional (médico, fisioterapeuta, nutricionista) quando a demanda ou os sinais fogem do escopo do treino." },
    { term: "Sinais que pedem encaminhar", definition: "Dor persistente ou de alerta, sintomas sistêmicos, condições não avaliadas, ou qualquer situação clínica que ultrapasse a adaptação do treino." },
  ],
  apply: "Diante de sinais de alerta, dor persistente ou demandas clínicas, encaminhe ao profissional adequado e registre a orientação. Continue apoiando o aluno no que é do treino, em colaboração. Responder à abertura: dor que não passa com sinais fora do treino pede encaminhar para avaliação, seguindo adaptando o exercício dentro da tolerância enquanto isso.",
  special: [
    "Grupos especiais: manter contato com o profissional de saúde do aluno melhora a segurança e a conduta.",
    "Dor com sinais de alerta (noturna que não alivia, déficit neurológico, febre): encaminhamento prioritário.",
    "Saúde mental e nutrição: demandas específicas pedem os profissionais habilitados.",
  ],
  mistake: {
    mistake: "Evitar encaminhar por medo de parecer incapaz ou de perder o aluno, insistindo em resolver o que é clínico.",
    instead: "Encaminhe quando indicado e registre. Reconhecer o momento de encaminhar protege o aluno e reforça a sua credibilidade e a atuação em rede.",
  },
  professionalCase: {
    prompt: "Aluno com dor lombar que piora à noite, não alivia com repouso e vem acompanhada de formigamento na perna. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Encaminhar ao profissional de saúde por causa dos sinais de alerta e seguir apoiando dentro do escopo do treino.", tone: "recomendada", feedback: "Coerente. Esses sinais pedem avaliação clínica; encaminhar é a conduta responsável e segura." },
      { id: "c2", label: "Ajustar o treino e esperar a dor passar sozinha.", tone: "cautela", feedback: "Diante de sinais de alerta, apenas adaptar o treino não basta; a avaliação clínica é necessária." },
      { id: "c3", label: "Suspender toda atividade sem encaminhar.", tone: "aceitavel", feedback: "Parar pode ser prudente, mas sem encaminhar o problema clínico segue sem avaliação." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Dor lombar noturna que não alivia, com formigamento na perna, pede:", [
      { id: "a", label: "Encaminhar ao profissional de saúde e seguir apoiando dentro do escopo." },
      { id: "b", label: "Apenas ajustar o treino e aguardar." },
    ], "a", "Esses sinais de alerta pedem avaliação clínica; encaminhar é a conduta segura e responsável."),
    q("q2", "verdadeiro-falso", "Encaminhar um aluno a outro profissional é sinal de boa conduta, não de incompetência.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "v", "Reconhecer o que pertence a outra área e encaminhar é uma das condutas mais profissionais e seguras."),
  ],
  uncertainty: "Nem todo sinal exige encaminhamento imediato, e o julgamento é do profissional no contexto. Na dúvida diante de sinais de risco, encaminhe.",
  related: [
    { title: "Escopo de atuação", href: `/aprender/conteudos/${DISC}--escopo-atuacao`, type: "conceito" },
    { title: "Sinais de alerta", href: `/aprender/conteudos/${DISC}--sinais-alerta`, type: "conceito" },
    { title: "Sinais de alerta na dor", href: "/aprender/conteudos/dor-limitacoes-e-adaptacao--red-flags", type: "conceito" },
  ],
  refs: ["ref-acsm-getp11", "ref-parq-2011"],
  applyRx: "Diante de sinais de alerta, dor persistente ou demandas clínicas, encaminhe ao profissional adequado e registre, seguindo apoiando o aluno no que é do treino. Encaminhar é parte da conduta segura.",
});

export const segurancaModules: Module[] = [
  deepModule({ id: `m-${DISC}-seguranca`, disciplineId: DISC_ID, slug: "seguranca", title: "Segurança na sessão", objective: "Reconhecer sinais que pedem cautela e triar antes do esforço.", order: 1, level: "fundamental", lessons: [sinaisAlerta, triagemParq], applications: ["Interromper diante de sinais de alerta e triar por sessão"] }),
  deepModule({ id: `m-${DISC}-escopo`, disciplineId: DISC_ID, slug: "escopo", title: "Escopo profissional", objective: "Atuar dentro do escopo e encaminhar quando preciso.", order: 2, level: "intermediario", prerequisites: [`m-${DISC}-seguranca`], lessons: [escopo, encaminhamento], applications: ["Distinguir o que é do treino e do clínico, e encaminhar"] }),
];

export const segurancaLessons: Lesson[] = [sinaisAlerta, triagemParq, escopo, encaminhamento];
