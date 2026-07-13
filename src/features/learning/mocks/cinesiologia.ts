import type { Lesson, Module } from "../types";
import { deepLesson, deepModule, q } from "./authoring";

/** CINESIOLOGIA, disciplina autorada em profundidade. */

const DISC = "cinesiologia";
const DISC_ID = "d-cinesiologia";
const K = "Cinesiologia";

const planos = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-planos-e-eixos`, moduleSlug: "planos-e-eixos",
  slug: `${DISC}--planos-movimento`, title: "Planos de movimento: o mapa do corpo em ação",
  subtitle: "Planos, eixos e ações", description: "Sagital, frontal e transverso: descrever o movimento em planos ajuda a compor um programa equilibrado.",
  level: "fundamental", minutes: 9, type: "conceito", kicker: K, tags: ["planos", "sagital", "frontal", "transverso"],
  hero: "Descrever para onde o corpo se move é o primeiro passo para analisar e prescrever. Os três planos organizam essa descrição e revelam o que um programa treina, e o que ele esquece.",
  question: "Um programa só de agachamento, supino e remada cobre bem os três planos de movimento?",
  concepts: [
    { term: "Plano de movimento", definition: "Superfície imaginária que organiza a direção do movimento: sagital (frente e trás), frontal (lados) e transverso (rotações e movimentos horizontais)." },
    { term: "Equilíbrio entre planos", definition: "Um programa completo distribui estímulos pelos três planos; a maioria dos exercícios de academia é sagital, deixando frontal e transverso subtreinados." },
  ],
  apply: "Classifique os exercícios pelo plano predominante e verifique se o programa cobre os três. Acrescente trabalho frontal (afundo lateral, elevação lateral) e transverso (rotações, anti-rotação) quando fizerem sentido para o objetivo. Responder à abertura: agachamento, supino e remada são sobretudo sagitais; o programa se beneficia de algum trabalho frontal e transverso.",
  special: [
    "Idosos: trabalho frontal e de equilíbrio (mudanças de direção) tem valor funcional para prevenir quedas.",
    "Esportes com rotação e mudança de direção: o plano transverso ganha importância específica.",
    "Saúde geral: variar os planos torna o programa mais completo sem complicar demais.",
  ],
  mistake: {
    mistake: "Montar todo o programa no plano sagital e assumir que ele é completo por incluir muitos exercícios.",
    instead: "Cheque os três planos e inclua estímulos frontais e transversos conforme o objetivo. Muitos exercícios no mesmo plano não substituem a variedade de direções.",
  },
  professionalCase: {
    prompt: "Aluno com programa só de exercícios sagitais quer melhorar a função geral e o equilíbrio. Qual ajuste é mais coerente?",
    choices: [
      { id: "c1", label: "Incluir estímulos nos planos frontal e transverso (afundo lateral, anti-rotação) conforme o objetivo.", tone: "recomendada", feedback: "Coerente. Cobrir os três planos torna o programa mais completo e funcional." },
      { id: "c2", label: "Adicionar mais exercícios sagitais para 'reforçar'.", tone: "cautela", feedback: "Mais do mesmo plano não cobre as direções que faltam; o programa segue incompleto." },
      { id: "c3", label: "Trocar tudo por exercícios de rotação.", tone: "aceitavel", feedback: "Exagerar no transverso desequilibra na outra direção; o objetivo é equilíbrio entre planos." },
    ],
  },
  quiz: [
    q("q1", "variavel", "Flexão e extensão de quadril e joelho, como no agachamento, ocorrem no plano:", [
      { id: "a", label: "Sagital." }, { id: "b", label: "Frontal." },
    ], "a", "Movimentos de frente e trás ocorrem no plano sagital; o agachamento é predominantemente sagital."),
    q("q2", "verdadeiro-falso", "Um programa com muitos exercícios, todos sagitais, cobre bem os três planos.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "f", "Muitos exercícios no mesmo plano não cobrem frontal e transverso; falta variedade de direções."),
  ],
  uncertainty: "A ênfase ideal entre planos depende do objetivo e do esporte; não há proporção única. Use os planos como checklist de completude, ajustando ao caso.",
  related: [
    { title: "Ações articulares", href: `/aprender/conteudos/${DISC}--acoes-articulares`, type: "conceito" },
    { title: "Planos, eixos e movimentos", href: "/aprender/conteudos/planos-eixos-e-movimentos", type: "conceito" },
    { title: "Padrão agachar", href: "/aprender/conteudos/padrao-agachar", type: "aplicacao" },
  ],
  refs: ["ref-escamilla-agachamento", "ref-diretriz-forca"],
  applyRx: "Classifique os exercícios pelo plano e verifique se o programa cobre sagital, frontal e transverso; acrescente estímulos frontais e transversos conforme o objetivo para um programa mais completo.",
});

const acoes = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-planos-e-eixos`, moduleSlug: "planos-e-eixos",
  slug: `${DISC}--acoes-articulares`, title: "Ações articulares: nomear para escolher",
  subtitle: "Planos, eixos e ações", description: "Nomear a ação de cada articulação ajuda a escolher o exercício certo para o alvo pretendido.",
  level: "fundamental", minutes: 9, type: "conceito", kicker: K, tags: ["ações articulares", "flexão", "extensão", "alvo"],
  hero: "Saber que ação uma articulação realiza é o que liga o músculo ao exercício. Nomear a ação transforma 'trabalhar perna' em 'estender o joelho' ou 'estender o quadril', e isso muda a escolha.",
  question: "Se você quer enfatizar os glúteos, deve escolher um exercício de extensão de joelho ou de extensão de quadril?",
  concepts: [
    { term: "Ação articular", definition: "Movimento específico de uma articulação, como flexão, extensão, abdução, adução e rotação. Cada músculo produz ações definidas nas articulações que cruza." },
    { term: "Ação e alvo muscular", definition: "Escolher o exercício pelo alvo exige saber qual ação recruta o músculo desejado: o glúteo máximo estende o quadril; o quadríceps estende o joelho." },
  ],
  apply: "Antes de escolher um exercício, defina a ação articular que recruta o músculo-alvo. Isso evita escolher um movimento que não treina o que se quer. Responder à abertura: para enfatizar glúteos, escolha extensão de quadril (dobradiça, hip thrust); a extensão de joelho foca o quadríceps.",
  special: [
    "Reabilitação: nomear a ação a fortalecer orienta a seleção segura dos exercícios.",
    "Hipertrofia dirigida: escolher pela ação garante que o exercício treine o músculo pretendido.",
    "Idosos: priorizar ações do cotidiano (extensão de quadril e joelho para levantar) tem valor funcional.",
  ],
  mistake: {
    mistake: "Escolher exercícios por hábito ou aparência, sem checar se a ação articular recruta o músculo-alvo.",
    instead: "Parta da ação articular que treina o alvo e escolha o exercício por ela. Nomear a ação alinha a escolha ao objetivo.",
  },
  professionalCase: {
    prompt: "Aluna quer desenvolver os glúteos e faz principalmente cadeira extensora. Qual ajuste é mais coerente?",
    choices: [
      { id: "c1", label: "Incluir exercícios de extensão de quadril (dobradiça, hip thrust, elevação de pelve), que recrutam os glúteos.", tone: "recomendada", feedback: "Coerente. A cadeira extensora foca o quadríceps (extensão de joelho); os glúteos respondem à extensão de quadril." },
      { id: "c2", label: "Aumentar a carga da cadeira extensora para 'chegar no glúteo'.", tone: "cautela", feedback: "A extensão de joelho recruta o quadríceps; mais carga ali não muda o alvo para os glúteos." },
      { id: "c3", label: "Adicionar mais séries de extensão de joelho.", tone: "aceitavel", feedback: "Continua treinando o quadríceps; para glúteos, é preciso a ação de extensão de quadril." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Para enfatizar os glúteos, a ação articular a escolher é:", [
      { id: "a", label: "Extensão de quadril." }, { id: "b", label: "Extensão de joelho." },
    ], "a", "O glúteo máximo estende o quadril; a extensão de joelho recruta principalmente o quadríceps."),
    q("q2", "verdadeiro-falso", "Nomear a ação articular ajuda a escolher o exercício certo para o músculo-alvo.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "v", "A ação liga o músculo ao exercício; escolher pela ação alinha a seleção ao alvo pretendido."),
  ],
  uncertainty: "Muitos exercícios envolvem várias ações e músculos ao mesmo tempo; a ênfase é uma tendência, não uma exclusividade. Use a ação como guia principal de seleção.",
  related: [
    { title: "Planos de movimento", href: `/aprender/conteudos/${DISC}--planos-movimento`, type: "conceito" },
    { title: "Músculos por função", href: "/aprender/conteudos/anatomia-funcional--musculos-por-funcao", type: "conceito" },
    { title: "Padrão levantar e avançar", href: "/aprender/conteudos/padrao-levantar-e-avancar", type: "aplicacao" },
  ],
  refs: ["ref-escamilla-agachamento", "ref-diretriz-forca"],
  applyRx: "Antes de escolher o exercício, defina a ação articular que recruta o músculo-alvo e selecione por ela; assim o movimento treina de fato o que se pretende.",
});

const alavancas = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-alavancas`, moduleSlug: "alavancas",
  slug: `${DISC}--tipos-alavanca`, title: "Alavancas do corpo",
  figure: { id: "alavancas" },
  subtitle: "Alavancas do corpo", description: "Força, resistência e eixo formam alavancas; o corpo usa os três tipos, o que explica vantagens mecânicas.",
  level: "intermediario", minutes: 10, type: "conceito", kicker: K, tags: ["alavanca", "eixo", "vantagem mecânica"],
  hero: "O corpo é uma máquina de alavancas. Ossos, articulações e músculos formam sistemas de força, resistência e eixo. Entender o tipo de alavanca explica por que certos movimentos são mais fortes que outros.",
  question: "Por que é mais difícil segurar um peso com o braço estendido à frente do que perto do corpo?",
  concepts: [
    { term: "Alavanca", definition: "Sistema formado por um eixo (articulação), uma força (músculo) e uma resistência (carga). O corpo usa os três tipos de alavanca conforme a articulação e a tarefa." },
    { term: "Braço de alavanca", definition: "Distância entre o ponto de aplicação da força ou da resistência e o eixo. Quanto maior o braço da resistência, maior o esforço necessário para movê-la ou sustentá-la." },
  ],
  apply: "Use o conceito de alavanca para entender por que a posição muda a dificuldade: afastar a resistência do eixo aumenta o braço de alavanca e a exigência. Responder à abertura: com o braço estendido, a distância do peso ao ombro é grande, aumentando o braço de resistência e o esforço; perto do corpo, o braço diminui e fica mais fácil.",
  special: [
    "Reabilitação: aproximar a resistência do eixo reduz a exigência, útil para começar com segurança.",
    "Progressão: afastar a carga do eixo (braço mais estendido) aumenta a dificuldade sem mudar o peso.",
    "Idosos: entender alavancas ajuda a escolher posições mais seguras para as mesmas ações.",
  ],
  mistake: {
    mistake: "Explicar a dificuldade de um exercício só pelo peso, ignorando o braço de alavanca criado pela posição.",
    instead: "Considere a posição e o braço de alavanca. A mesma carga exige muito mais quando afastada do eixo articular.",
  },
  professionalCase: {
    prompt: "Aluno acha a elevação lateral com braços estendidos pesada demais mesmo com pouca carga. Qual explicação e ajuste são mais coerentes?",
    choices: [
      { id: "c1", label: "O braço estendido cria um grande braço de alavanca; flexionar levemente o cotovelo reduz a exigência para a mesma carga.", tone: "recomendada", feedback: "Coerente. Encurtar o braço de alavanca (cotovelo menos estendido) reduz o esforço sem mudar o peso." },
      { id: "c2", label: "Só reduzir a carga, sem considerar a posição.", tone: "aceitavel", feedback: "Funciona, mas entender a alavanca permite ajustar a dificuldade também pela posição." },
      { id: "c3", label: "Aumentar a carga para 'acostumar'.", tone: "cautela", feedback: "Com braço de alavanca grande e exigência já alta, aumentar a carga pode comprometer a técnica." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Para reduzir a exigência de um exercício sem mudar o peso, pode-se:", [
      { id: "a", label: "Aproximar a resistência do eixo articular (encurtar o braço de alavanca)." },
      { id: "b", label: "Afastar ainda mais a resistência do eixo." },
    ], "a", "Encurtar o braço de alavanca reduz o esforço para a mesma carga; afastar aumenta a exigência."),
    q("q2", "verdadeiro-falso", "Afastar a carga do eixo articular aumenta a dificuldade mesmo mantendo o mesmo peso.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "v", "Um braço de resistência maior aumenta a exigência para o mesmo peso, pela alavanca."),
  ],
  uncertainty: "A análise de alavancas simplifica sistemas complexos com muitos músculos e ângulos. Use-a para entender tendências de dificuldade, não como cálculo exato.",
  related: [
    { title: "Vantagem mecânica", href: `/aprender/conteudos/${DISC}--vantagem-mecanica`, type: "mecanismo" },
    { title: "Braço de momento na prática", href: "/aprender/conteudos/braco-de-momento", type: "mecanismo" },
    { title: "Torque na prática", href: "/aprender/conteudos/torque-na-pratica", type: "mecanismo" },
  ],
  refs: ["ref-escamilla-agachamento", "ref-diretriz-forca"],
  applyRx: "Use o conceito de alavanca para ajustar a dificuldade pela posição: aproximar a resistência do eixo reduz a exigência; afastá-la aumenta, sem mudar o peso.",
});

const vantagem = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-alavancas`, moduleSlug: "alavancas",
  slug: `${DISC}--vantagem-mecanica`, title: "Vantagem mecânica: por que certos ângulos são mais fortes",
  figure: { id: "curva-resistencia" },
  subtitle: "Alavancas do corpo", description: "A relação entre os braços de força e de resistência explica por que a força varia ao longo do movimento.",
  level: "intermediario", minutes: 9, type: "mecanismo", kicker: K, tags: ["vantagem mecânica", "ângulo", "curva de força"],
  hero: "Ninguém é igualmente forte em todos os ângulos de um exercício. A vantagem mecânica muda ao longo do movimento, criando pontos mais fortes e mais fracos. Isso orienta onde o exercício mais exige.",
  question: "Por que muita gente 'trava' no meio da subida do supino ou do agachamento, e não no início ou no fim?",
  concepts: [
    { term: "Vantagem mecânica", definition: "Relação entre o braço de força (do músculo) e o braço de resistência (da carga). Quando o braço de força é relativamente maior, o movimento é mecanicamente mais fácil naquele ângulo." },
    { term: "Ponto de aderência (sticking point)", definition: "O trecho do movimento com pior vantagem mecânica, onde a exigência é maior e a barra tende a desacelerar ou travar." },
  ],
  apply: "Entenda que a dificuldade varia com o ângulo por causa da vantagem mecânica, e que o ponto mais difícil costuma ser onde o braço de resistência é maior em relação ao de força. Responder à abertura: o travamento no meio ocorre porque ali a vantagem mecânica é pior; é o ponto de aderência do movimento, o trecho mais exigente.",
  special: [
    "Progressão: exercícios e equipamentos com curvas de resistência diferentes alteram onde está o ponto mais difícil.",
    "Reabilitação: escolher ângulos de melhor vantagem mecânica permite trabalhar com menos exigência no início.",
    "Hipertrofia: variar a curva de resistência (peso livre, polia, elástico) muda onde o músculo é mais exigido.",
  ],
  mistake: {
    mistake: "Interpretar o travamento no meio do movimento como falta de esforço, sem considerar a vantagem mecânica.",
    instead: "Reconheça que o ponto de aderência reflete a pior vantagem mecânica do movimento. Ajustar carga, ângulo ou curva de resistência é mais útil do que só cobrar esforço.",
  },
  professionalCase: {
    prompt: "Aluno completa o início e o fim do supino, mas trava sempre no meio. Qual explicação e conduta são mais coerentes?",
    choices: [
      { id: "c1", label: "O meio é o ponto de pior vantagem mecânica (aderência); ajustar carga e trabalhar esse trecho específico ajuda.", tone: "recomendada", feedback: "Coerente. O travamento no meio reflete a mecânica do movimento; trabalhar o ponto de aderência é a conduta." },
      { id: "c2", label: "Concluir que ele não se esforça no meio.", tone: "cautela", feedback: "O ponto de aderência é mecânico, não falta de esforço; a leitura deve considerar a vantagem mecânica." },
      { id: "c3", label: "Aumentar a carga para vencer o travamento.", tone: "cautela", feedback: "Aumentar a carga no ponto mais fraco tende a piorar o travamento; ajustar é mais coerente." },
    ],
  },
  quiz: [
    q("q1", "variavel", "O trecho de um exercício com pior vantagem mecânica, onde a barra tende a travar, é chamado de:", [
      { id: "a", label: "Ponto de aderência (sticking point)." },
      { id: "b", label: "Amplitude útil." },
    ], "a", "O ponto de aderência é o trecho de pior vantagem mecânica, o mais exigente do movimento."),
    q("q2", "verdadeiro-falso", "A força que conseguimos aplicar é igual em todos os ângulos de um exercício.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "f", "A vantagem mecânica muda com o ângulo, criando pontos mais fortes e mais fracos ao longo do movimento."),
  ],
  uncertainty: "A curva de força individual varia com antropometria e técnica, e a análise é uma aproximação. Use o conceito para entender onde o exercício mais exige, ajustando ao aluno.",
  related: [
    { title: "Tipos de alavanca", href: `/aprender/conteudos/${DISC}--tipos-alavanca`, type: "conceito" },
    { title: "Curvas de resistência", href: "/aprender/conteudos/curvas-de-resistencia", type: "comparacao" },
    { title: "Torque na prática", href: "/aprender/conteudos/torque-na-pratica", type: "mecanismo" },
  ],
  refs: ["ref-escamilla-agachamento", "ref-diretriz-forca"],
  applyRx: "Considere que a dificuldade varia com o ângulo pela vantagem mecânica; o ponto de aderência é o trecho mais exigente. Ajuste carga, ângulo ou curva de resistência em vez de só cobrar esforço.",
});

export const cinesiologiaModules: Module[] = [
  deepModule({ id: `m-${DISC}-planos-e-eixos`, disciplineId: DISC_ID, slug: "planos-e-eixos", title: "Planos, eixos e ações", objective: "Descrever movimentos com precisão e escolher pela ação.", order: 1, level: "fundamental", lessons: [planos, acoes], applications: ["Compor programa equilibrado entre planos e escolher pela ação"] }),
  deepModule({ id: `m-${DISC}-alavancas`, disciplineId: DISC_ID, slug: "alavancas", title: "Alavancas do corpo", objective: "Aplicar alavancas e vantagem mecânica à análise do exercício.", order: 2, level: "intermediario", prerequisites: [`m-${DISC}-planos-e-eixos`], lessons: [alavancas, vantagem], applications: ["Ajustar dificuldade pela posição e ler o ponto de aderência"] }),
];

export const cinesiologiaLessons: Lesson[] = [planos, acoes, alavancas, vantagem];
