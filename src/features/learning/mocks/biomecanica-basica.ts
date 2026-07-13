import type { Lesson, Module } from "../types";
import { deepLesson, deepModule, q } from "./authoring";

/** BIOMECÂNICA BÁSICA, disciplina autorada em profundidade. */

const DISC = "biomecanica-basica";
const DISC_ID = "d-biomecanica-basica";
const K = "Biomecânica básica";

const forcas = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-forcas`, moduleSlug: "forcas",
  slug: `${DISC}--forca-peso-atrito`, title: "Peso, reação do solo e atrito",
  subtitle: "Forças e equilíbrio", description: "As forças externas que agem sobre o corpo formam a base para analisar a resistência de um exercício.",
  level: "fundamental", minutes: 10, type: "conceito", kicker: K, tags: ["forças externas", "peso", "atrito"],
  hero: "Todo exercício é uma conversa entre forças. Peso, reação do solo e atrito agem sobre o corpo o tempo todo. Entender essas forças é o ponto de partida para analisar qualquer resistência.",
  question: "Por que empurrar um trenó no piso liso é diferente de empurrá-lo na grama, mesmo com o mesmo peso?",
  concepts: [
    { term: "Força externa", definition: "Força que age sobre o corpo a partir de fora: peso (gravidade), reação do solo, atrito, resistência de cargas, elásticos ou da água." },
    { term: "Atrito", definition: "Força que se opõe ao deslizamento entre superfícies. Depende dos materiais e da força que as pressiona; muda a resistência de arrastar ou empurrar objetos." },
  ],
  apply: "Ao analisar um exercício, identifique as forças externas em jogo: o peso da carga, a reação do solo, o atrito. Isso explica por que a mesma carga rende diferente em contextos distintos. Responder à abertura: na grama, o maior atrito aumenta a resistência ao deslizamento; no piso liso, o atrito é menor e o trenó desliza mais fácil, com o mesmo peso.",
  special: [
    "Treino com trenó e arrasto: a superfície muda a resistência tanto quanto a carga.",
    "Exercícios na água: a resistência vem do meio, não do peso; a velocidade define a carga.",
    "Reabilitação: ambientes de menor resistência (água, deslizamento) permitem começar com menos exigência.",
  ],
  mistake: {
    mistake: "Analisar a dificuldade de um exercício só pela carga, ignorando atrito, superfície e reação do solo.",
    instead: "Considere todas as forças externas em jogo. A mesma carga produz exigências diferentes conforme atrito, meio e superfície.",
  },
  professionalCase: {
    prompt: "Aluno acha o empurrar de trenó muito mais fácil no ginásio (piso liso) do que no gramado, com a mesma carga. Como explicar?",
    choices: [
      { id: "c1", label: "O atrito maior na grama aumenta a resistência ao deslizamento; a força necessária cresce mesmo com o mesmo peso.", tone: "recomendada", feedback: "Coerente. O atrito, e não só o peso, determina a resistência de arrastar ou empurrar." },
      { id: "c2", label: "O peso do trenó muda entre as superfícies.", tone: "cautela", feedback: "O peso é o mesmo; o que muda é o atrito da superfície." },
      { id: "c3", label: "A diferença é só psicológica.", tone: "aceitavel", feedback: "Há diferença física real de atrito; não é apenas percepção." },
    ],
  },
  quiz: [
    q("q1", "conduta", "A diferença de esforço para empurrar a mesma carga em superfícies distintas se explica sobretudo por:", [
      { id: "a", label: "Diferença de atrito entre as superfícies." },
      { id: "b", label: "Mudança do peso da carga." },
    ], "a", "O atrito depende das superfícies e altera a resistência ao deslizamento, com o mesmo peso."),
    q("q2", "verdadeiro-falso", "Peso, reação do solo e atrito são forças externas que agem sobre o corpo.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "v", "Essas são forças externas que compõem a resistência analisada em um exercício."),
  ],
  uncertainty: "A análise de forças simplifica situações reais com muitas variáveis. Use-a para entender tendências de resistência, ajustando ao contexto do exercício.",
  related: [
    { title: "Equilíbrio e base", href: `/aprender/conteudos/${DISC}--equilibrio`, type: "conceito" },
    { title: "Força externa e interna", href: "/aprender/conteudos/forca-externa-e-interna", type: "conceito" },
    { title: "Curvas de resistência", href: "/aprender/conteudos/curvas-de-resistencia", type: "comparacao" },
  ],
  refs: ["ref-escamilla-agachamento", "ref-diretriz-forca"],
  applyRx: "Ao analisar um exercício, identifique as forças externas (peso, reação do solo, atrito, meio); a mesma carga produz exigências diferentes conforme atrito e superfície.",
});

const equilibrio = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-forcas`, moduleSlug: "forcas",
  slug: `${DISC}--equilibrio`, title: "Equilíbrio e base de suporte",
  figure: { id: "centro-gravidade" },
  subtitle: "Forças e equilíbrio", description: "A relação entre o centro de massa e a base de suporte define a estabilidade e a exigência de equilíbrio.",
  level: "fundamental", minutes: 9, type: "conceito", kicker: K, tags: ["equilíbrio", "base de suporte", "estabilidade"],
  hero: "Estabilidade não é sorte: é a relação entre onde o peso do corpo se concentra e a área que o sustenta. Ajustar essa relação muda a exigência de equilíbrio sem mudar o objetivo do exercício.",
  question: "Por que um agachamento unilateral desafia muito mais o equilíbrio do que o bilateral, mesmo com menos carga?",
  concepts: [
    { term: "Base de suporte", definition: "Área de contato que sustenta o corpo (os pés, as mãos, os apoios). Quanto maior e mais bem posicionada, mais estável tende a ser a postura." },
    { term: "Centro de massa", definition: "Ponto onde se concentra o peso do corpo. A estabilidade depende de manter a projeção do centro de massa dentro da base de suporte." },
  ],
  apply: "Ajuste a base de suporte para regular a exigência de equilíbrio: reduzir a base (apoio unilateral, pés juntos) aumenta o desafio; ampliá-la facilita. Isso muda a demanda de equilíbrio sem alterar o alvo principal. Responder à abertura: no unilateral, a base é menor e o centro de massa fica mais difícil de manter sobre ela, exigindo muito mais equilíbrio, mesmo com menos carga.",
  special: [
    "Idosos: treinar equilíbrio reduzindo a base de forma progressiva e segura tem valor na prevenção de quedas.",
    "Iniciantes: ampliar a base facilita o aprendizado antes de aumentar o desafio.",
    "Instabilidade não é sempre melhor: reduzir a base pode tirar carga do músculo-alvo em troca de equilíbrio.",
  ],
  mistake: {
    mistake: "Assumir que aumentar a instabilidade sempre melhora o estímulo do músculo-alvo.",
    instead: "Ajuste a base conforme o objetivo. Reduzir a base treina equilíbrio, mas pode reduzir a carga no músculo-alvo; nem sempre é o que se quer.",
  },
  professionalCase: {
    prompt: "Aluno quer mais estímulo para os glúteos e passou tudo para exercícios muito instáveis, sentindo mais equilíbrio do que músculo. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Usar uma base estável que permita carregar os glúteos, reservando a instabilidade para objetivos de equilíbrio.", tone: "recomendada", feedback: "Coerente. Para carregar o músculo-alvo, a estabilidade permite mais carga; a instabilidade desloca a exigência para o equilíbrio." },
      { id: "c2", label: "Aumentar ainda mais a instabilidade para 'ativar mais'.", tone: "cautela", feedback: "Mais instabilidade tende a reduzir a carga no alvo e a aumentar a demanda de equilíbrio, não o estímulo do glúteo." },
      { id: "c3", label: "Manter tudo instável e aceitar o resultado.", tone: "aceitavel", feedback: "Se o objetivo é carregar o glúteo, a base estável serve melhor; a instabilidade tem outro propósito." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Para aumentar a exigência de equilíbrio de um exercício, pode-se:", [
      { id: "a", label: "Reduzir a base de suporte (apoio unilateral, pés juntos)." },
      { id: "b", label: "Ampliar a base de suporte." },
    ], "a", "Reduzir a base torna mais difícil manter o centro de massa sobre ela, aumentando o desafio de equilíbrio."),
    q("q2", "verdadeiro-falso", "Aumentar a instabilidade sempre aumenta o estímulo do músculo-alvo.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "f", "A instabilidade pode reduzir a carga no alvo e aumentar a demanda de equilíbrio; nem sempre é o objetivo."),
  ],
  uncertainty: "A relação entre instabilidade, ativação muscular e resultado depende do exercício e do objetivo, com evidência variada. Ajuste a base ao propósito, não por princípio.",
  related: [
    { title: "Centro de gravidade", href: `/aprender/conteudos/${DISC}--centro-de-gravidade`, type: "conceito" },
    { title: "Centro de massa e base", href: "/aprender/conteudos/centro-de-massa-e-base", type: "conceito" },
    { title: "Estabilidade, velocidade e fadiga", href: "/aprender/conteudos/estabilidade-velocidade-e-fadiga", type: "conceito" },
  ],
  refs: ["ref-escamilla-agachamento", "ref-diretriz-forca"],
  applyRx: "Ajuste a base de suporte para regular a exigência de equilíbrio: reduzir a base desafia o equilíbrio; ampliá-la facilita. Para carregar o músculo-alvo, prefira base estável.",
});

const torqueBasico = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-momentos`, moduleSlug: "momentos",
  slug: `${DISC}--torque-basico`, title: "Torque: por que a mesma carga pesa diferente em cada ângulo",
  figure: { id: "torque-momento" },
  subtitle: "Momentos e torque", description: "Torque é o efeito rotacional de uma força: depende da força e do braço de momento, e explica onde o exercício mais exige.",
  level: "intermediario", minutes: 10, type: "mecanismo", kicker: K, tags: ["torque", "braço de momento", "ângulo"],
  hero: "A mesma carga pode ser leve num ângulo e brutal em outro. A chave é o torque: o efeito rotacional de uma força, que depende não só do peso, mas da distância dele ao eixo articular.",
  question: "Por que a rosca de bíceps é mais difícil com o antebraço paralelo ao chão do que no início ou no fim do movimento?",
  concepts: [
    { term: "Torque", definition: "Efeito rotacional de uma força sobre um eixo. É o produto da força pelo braço de momento; determina o quanto a força tende a girar a articulação." },
    { term: "Braço de momento", definition: "Distância perpendicular entre a linha de ação da força e o eixo articular. Quanto maior o braço de momento, maior o torque para a mesma força." },
  ],
  mechanism: {
    title: "Como o torque varia no movimento",
    steps: [
      { label: "A força é o peso da carga", detail: "A gravidade puxa a carga para baixo com força constante." },
      { label: "O braço de momento muda com o ângulo", detail: "A distância perpendicular entre essa força e a articulação varia ao longo do movimento." },
      { label: "O torque acompanha o braço", detail: "Onde o braço de momento é maior, o torque é maior e o exercício exige mais." },
      { label: "O ponto mais exigente", detail: "É onde o braço de momento é máximo, geralmente com o segmento paralelo ao chão." },
    ],
  },
  apply: "Entenda que a exigência muda com o ângulo porque o braço de momento muda, mesmo com a carga fixa. O ponto de maior torque costuma ser o trecho mais exigente. Responder à abertura: com o antebraço paralelo ao chão, o braço de momento do peso é máximo, gerando o maior torque; no início e no fim, o braço é menor e o exercício fica mais fácil.",
  special: [
    "Progressão: mudar o ângulo ou o equipamento altera onde está o pico de torque e a dificuldade.",
    "Reabilitação: trabalhar em ângulos de menor torque reduz a exigência para começar com segurança.",
    "Seleção de exercícios: saber onde está o pico de torque ajuda a combinar exercícios com picos diferentes.",
  ],
  mistake: {
    mistake: "Explicar a variação de dificuldade ao longo do movimento apenas pelo peso, sem considerar o braço de momento.",
    instead: "Considere o torque: a mesma carga exige mais onde o braço de momento é maior. A posição, não só o peso, determina a dificuldade em cada ângulo.",
  },
  professionalCase: {
    prompt: "Aluna sente a elevação frontal muito mais pesada quando os braços chegam à horizontal. Qual explicação é mais coerente?",
    choices: [
      { id: "c1", label: "Na horizontal, o braço de momento do peso em relação ao ombro é máximo, gerando o maior torque e a maior exigência.", tone: "recomendada", feedback: "Coerente. O torque acompanha o braço de momento, que é máximo com o segmento paralelo ao chão." },
      { id: "c2", label: "O peso do halter aumenta ao subir.", tone: "cautela", feedback: "O peso é constante; o que muda é o braço de momento e, com ele, o torque." },
      { id: "c3", label: "A aluna perde força de repente na horizontal.", tone: "aceitavel", feedback: "A força pode variar por ângulo, mas o principal aqui é o aumento do braço de momento e do torque." },
    ],
  },
  quiz: [
    q("q1", "variavel", "O torque de uma força sobre uma articulação depende da força e do:", [
      { id: "a", label: "Braço de momento (distância perpendicular ao eixo)." },
      { id: "b", label: "Comprimento total do osso." },
    ], "a", "Torque é força vezes braço de momento; o braço de momento é a distância perpendicular ao eixo."),
    q("q2", "verdadeiro-falso", "A mesma carga gera mais torque no ângulo em que o braço de momento é maior.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "v", "Com a força constante, o torque cresce onde o braço de momento é maior, tornando o trecho mais exigente."),
  ],
  uncertainty: "A análise de torque simplifica músculos e ângulos reais; é uma aproximação útil. Use-a para entender onde o exercício mais exige, ajustando ao aluno.",
  related: [
    { title: "Centro de gravidade", href: `/aprender/conteudos/${DISC}--centro-de-gravidade`, type: "conceito" },
    { title: "Torque na prática", href: "/aprender/conteudos/torque-na-pratica", type: "mecanismo" },
    { title: "Vantagem mecânica", href: "/aprender/conteudos/cinesiologia--vantagem-mecanica", type: "mecanismo" },
  ],
  refs: ["ref-escamilla-agachamento", "ref-diretriz-forca"],
  applyRx: "Entenda a dificuldade por ângulo pelo torque: a mesma carga exige mais onde o braço de momento é maior. Use o pico de torque para escolher e combinar exercícios.",
});

const centroGravidade = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-momentos`, moduleSlug: "momentos",
  slug: `${DISC}--centro-de-gravidade`, title: "Centro de gravidade e estabilidade",
  subtitle: "Momentos e torque", description: "A posição do centro de massa em relação ao apoio define estabilidade e demanda em muitos exercícios.",
  level: "intermediario", minutes: 9, type: "conceito", kicker: K, tags: ["centro de gravidade", "estabilidade", "postura"],
  hero: "Onde o peso do corpo se concentra, e como ele se relaciona com o apoio, decide boa parte da estabilidade e da demanda de um exercício. Mover o centro de gravidade muda tudo.",
  question: "Por que inclinar o tronco à frente no agachamento muda a exigência do quadril e da coluna?",
  concepts: [
    { term: "Centro de gravidade", definition: "Ponto onde se pode considerar concentrado o peso do corpo. Sua posição em relação à base e às articulações determina estabilidade e distribuição de demanda." },
    { term: "Deslocamento do centro de massa", definition: "Mudanças de postura (inclinar o tronco, avançar o joelho) deslocam o centro de massa, alterando os braços de momento nas articulações e, com eles, a demanda." },
  ],
  apply: "Observe como a postura desloca o centro de gravidade e muda a demanda: inclinar o tronco à frente afasta o peso do quadril, aumentando a exigência de quadril e coluna. Responder à abertura: no agachamento com tronco mais inclinado, o centro de massa se afasta do quadril, aumentando o braço de momento ali e a demanda de quadril e coluna, e reduzindo a do joelho.",
  special: [
    "Antropometria: pessoas com tronco ou fêmur mais longos deslocam naturalmente o centro de massa, mudando a postura ideal.",
    "Dor lombar: entender o deslocamento do centro de massa ajuda a escolher posições que reduzem a demanda da coluna.",
    "Idosos: manter o centro de massa sobre a base é chave para segurança em exercícios em pé.",
  ],
  mistake: {
    mistake: "Padronizar uma única postura 'certa' para todos, ignorando como o centro de gravidade e a antropometria mudam a demanda.",
    instead: "Leia o deslocamento do centro de massa e ajuste a postura ao aluno. Diferentes corpos distribuem a demanda de formas distintas na mesma tarefa.",
  },
  professionalCase: {
    prompt: "Aluno de fêmur longo inclina bastante o tronco no agachamento e sente mais a lombar. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Reconhecer que a antropometria desloca o centro de massa e ajustar variação e postura (por exemplo, agachamento com apoio ou box) para distribuir melhor a demanda.", tone: "recomendada", feedback: "Coerente. O deslocamento do centro de massa explica a maior demanda lombar; ajustar a variação distribui melhor." },
      { id: "c2", label: "Exigir tronco totalmente vertical, contra a alavanca dele.", tone: "cautela", feedback: "Forçar a postura contra a antropometria costuma piorar o desconforto; a posição deve servir ao aluno." },
      { id: "c3", label: "Remover o agachamento sem tentar adaptar.", tone: "aceitavel", feedback: "Antes de remover, ajustar variação e postura costuma manter o estímulo com conforto." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Inclinar mais o tronco no agachamento tende a:", [
      { id: "a", label: "Aumentar a demanda de quadril e coluna, ao afastar o centro de massa do quadril." },
      { id: "b", label: "Reduzir a demanda de quadril e aumentar só a do joelho." },
    ], "a", "O tronco mais inclinado afasta o centro de massa do quadril, aumentando o braço de momento e a demanda ali."),
    q("q2", "verdadeiro-falso", "A antropometria do aluno influencia a postura ideal ao deslocar o centro de massa.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "v", "Tronco e fêmur de comprimentos diferentes deslocam o centro de massa, mudando a postura mais adequada."),
  ],
  uncertainty: "A postura ótima depende de antropometria, objetivo e tolerância, e a análise é aproximada. Ajuste ao aluno em vez de impor um padrão único.",
  related: [
    { title: "Torque", href: `/aprender/conteudos/${DISC}--torque-basico`, type: "mecanismo" },
    { title: "Por que o joelho ultrapassar a ponta do pé", href: "/aprender/conteudos/por-que-joelho-ultrapassa-o-pe", type: "mecanismo" },
    { title: "Posição corporal e equipamento", href: "/aprender/conteudos/posicao-corporal-e-equipamento", type: "comparacao" },
  ],
  refs: ["ref-escamilla-agachamento", "ref-diretriz-forca"],
  applyRx: "Observe como a postura desloca o centro de gravidade e muda a demanda; ajuste a variação e a posição à antropometria do aluno em vez de impor uma postura única.",
});

export const biomecanicaBasicaModules: Module[] = [
  deepModule({ id: `m-${DISC}-forcas`, disciplineId: DISC_ID, slug: "forcas", title: "Forças e equilíbrio", objective: "Entender as forças que agem no corpo e a estabilidade.", order: 1, level: "fundamental", lessons: [forcas, equilibrio], applications: ["Analisar resistência e ajustar equilíbrio pela base"] }),
  deepModule({ id: `m-${DISC}-momentos`, disciplineId: DISC_ID, slug: "momentos", title: "Momentos e torque", objective: "Aplicar torque e centro de gravidade à análise de exercícios.", order: 2, level: "intermediario", prerequisites: [`m-${DISC}-forcas`], lessons: [torqueBasico, centroGravidade], applications: ["Ler o pico de torque e o deslocamento do centro de massa"] }),
];

export const biomecanicaBasicaLessons: Lesson[] = [forcas, equilibrio, torqueBasico, centroGravidade];
