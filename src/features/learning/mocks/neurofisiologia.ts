import type { Lesson, Module } from "../types";
import { deepLesson, deepModule, q } from "./authoring";

/** NEUROFISIOLOGIA DO MOVIMENTO, disciplina autorada em profundidade. */

const DISC = "neurofisiologia-do-movimento";
const DISC_ID = "d-neurofisiologia";
const K = "Neurofisiologia do movimento";

const unidadeMotora = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-controle-motor`, moduleSlug: "controle-motor",
  slug: `${DISC}--unidade-motora`, title: "Unidade motora: a base da força",
  subtitle: "Controle motor", description: "Um neurônio motor e as fibras que ele comanda formam a unidade básica de produção de força.",
  level: "fundamental", minutes: 10, type: "conceito", kicker: K, tags: ["unidade motora", "recrutamento", "força"],
  hero: "A força que um músculo produz nasce de quantas e quais unidades motoras ele ativa, e com que frequência. Entender essa unidade básica explica boa parte da adaptação ao treino.",
  question: "Por que um iniciante fica mais forte nas primeiras semanas antes de o músculo crescer visivelmente?",
  concepts: [
    { term: "Unidade motora", definition: "Um neurônio motor e todas as fibras musculares que ele inerva. É a menor unidade funcional de produção de força; ativá-la ativa todas as suas fibras." },
    { term: "Modulação da força", definition: "O sistema nervoso ajusta a força de duas formas: recrutando mais unidades motoras e aumentando a frequência de disparo delas." },
  ],
  apply: "Entenda a força como resultado de quantas unidades motoras são recrutadas e com que frequência disparam. O treino melhora essa capacidade, sobretudo no início. Responder à abertura: o iniciante fica forte cedo porque aprende a recrutar mais unidades motoras e a coordená-las, antes da hipertrofia.",
  special: [
    "Iniciantes: grande parte do ganho inicial de força é melhor uso das unidades motoras existentes.",
    "Idosos: o treino de força recupera capacidade de recrutamento, melhorando força e função.",
    "Reabilitação: reativar o recrutamento é etapa inicial da recuperação de força após desuso.",
  ],
  mistake: {
    mistake: "Assumir que só o tamanho do músculo determina a força, ignorando a contribuição neural do recrutamento.",
    instead: "Considere que força depende de músculo e de sistema nervoso. Recrutamento e coordenação explicam ganhos que a hipertrofia sozinha não explica.",
  },
  professionalCase: {
    prompt: "Aluno iniciante ganhou muita carga em semanas, quase sem mudar de tamanho. Como explicar?",
    choices: [
      { id: "c1", label: "O ganho inicial é neural: melhor recrutamento e coordenação das unidades motoras, antes da hipertrofia.", tone: "recomendada", feedback: "Coerente. A adaptação neural explica o ganho rápido de força antes da mudança de tamanho." },
      { id: "c2", label: "Houve hipertrofia grande que ainda não se vê.", tone: "cautela", feedback: "Em poucas semanas a hipertrofia é modesta; o ganho é predominantemente neural." },
      { id: "c3", label: "Foi só efeito psicológico.", tone: "aceitavel", feedback: "Há adaptação real, sobretudo neural; não é apenas percepção." },
    ],
  },
  quiz: [
    q("q1", "variavel", "A menor unidade funcional de produção de força é:", [
      { id: "a", label: "A unidade motora (neurônio motor e suas fibras)." },
      { id: "b", label: "A fibra muscular isolada." },
    ], "a", "A unidade motora comanda um conjunto de fibras; ativá-la ativa todas elas, produzindo força."),
    q("q2", "verdadeiro-falso", "O sistema nervoso ajusta a força recrutando mais unidades motoras e aumentando a frequência de disparo.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "v", "Recrutamento e frequência de disparo são os dois mecanismos de modulação da força."),
  ],
  uncertainty: "A divisão exata entre contribuição neural e hipertrófica ao longo do tempo é uma estimativa e varia entre pessoas. Use a ideia como guia de expectativa.",
  related: [
    { title: "Recrutamento", href: `/aprender/conteudos/${DISC}--recrutamento`, type: "mecanismo" },
    { title: "Adaptação neural", href: "/aprender/conteudos/fisiologia-do-exercicio--adaptacao-neural", type: "mecanismo" },
    { title: "Intensidade e volume", href: "/aprender/conteudos/forca-intensidade-e-volume", type: "conceito" },
  ],
  refs: ["ref-folland-williams-2007", "ref-diretriz-forca"],
  applyRx: "Entenda a força como recrutamento e frequência de disparo de unidades motoras; o treino melhora essa capacidade, sobretudo no início, o que explica ganhos rápidos de força em iniciantes.",
});

const recrutamento = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-controle-motor`, moduleSlug: "controle-motor",
  slug: `${DISC}--recrutamento`, title: "Princípio do tamanho: como a força é graduada",
  subtitle: "Controle motor", description: "As unidades motoras são recrutadas em ordem, das menores para as maiores, conforme a demanda cresce.",
  level: "intermediario", minutes: 10, type: "mecanismo", kicker: K, tags: ["princípio do tamanho", "recrutamento", "carga"],
  hero: "O corpo não liga tudo de uma vez. Conforme a força exigida aumenta, unidades motoras entram em cena em ordem, das menores para as maiores. Isso explica por que cargas maiores recrutam mais.",
  question: "Por que uma carga alta, ou uma série levada perto da falha com carga moderada, recruta as unidades motoras maiores?",
  concepts: [
    { term: "Princípio do tamanho", definition: "As unidades motoras são recrutadas em ordem crescente de tamanho: primeiro as menores (mais resistentes à fadiga), depois as maiores (mais potentes), conforme a demanda de força aumenta." },
    { term: "Recrutamento pela demanda", definition: "As unidades maiores entram quando a força exigida é alta, seja por carga elevada, seja por fadiga acumulada que exige mais unidades para manter a força." },
  ],
  apply: "Para recrutar as unidades motoras maiores (importantes para força e hipertrofia), o estímulo precisa exigir força alta: carga elevada, ou séries levadas para perto da falha com carga moderada. Responder à abertura: ambos os caminhos elevam a demanda de força, recrutando as unidades maiores; por isso proximidade da falha importa quando a carga é moderada.",
  special: [
    "Hipertrofia com cargas moderadas: chegar perto da falha garante o recrutamento das unidades maiores.",
    "Reabilitação com cargas leves: mais repetições até fadiga podem recrutar unidades maiores quando a carga alta não é possível.",
    "Idosos: estímulos que exigem força suficiente preservam as unidades maiores, ligadas à potência e à função.",
  ],
  mistake: {
    mistake: "Treinar com carga leve e longe da falha esperando estimular as unidades motoras maiores.",
    instead: "Garanta demanda de força suficiente: carga alta ou proximidade da falha com carga moderada. Sem isso, as unidades maiores ficam pouco estimuladas.",
  },
  professionalCase: {
    prompt: "Aluno faz muitas repetições com carga bem leve, sempre com folga, e não progride em força nem em tamanho. Qual ajuste é mais coerente?",
    choices: [
      { id: "c1", label: "Aumentar a carga ou aproximar as séries da falha, para exigir força suficiente e recrutar as unidades maiores.", tone: "recomendada", feedback: "Coerente. Sem demanda de força alta, as unidades motoras maiores ficam subestimuladas; ajustar carga ou esforço resolve." },
      { id: "c2", label: "Aumentar ainda mais as repetições com a mesma carga leve e folga.", tone: "cautela", feedback: "Sem chegar perto da falha, a demanda de força continua baixa e as unidades maiores seguem pouco recrutadas." },
      { id: "c3", label: "Trocar por exercícios diferentes com a mesma carga leve.", tone: "aceitavel", feedback: "Variar não resolve a falta de demanda de força; o ajuste é carga ou proximidade da falha." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Para recrutar as unidades motoras maiores com carga moderada, é preciso:", [
      { id: "a", label: "Levar a série para perto da falha." },
      { id: "b", label: "Parar sempre com folga grande." },
    ], "a", "Com carga moderada, a proximidade da falha eleva a demanda de força e recruta as unidades maiores."),
    q("q2", "verdadeiro-falso", "As unidades motoras são recrutadas das maiores para as menores conforme a demanda cresce.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "f", "É o contrário: das menores para as maiores (princípio do tamanho), conforme a força exigida aumenta."),
  ],
  uncertainty: "O recrutamento é influenciado por vários fatores além da carga, e a relação com hipertrofia ainda tem nuances. Use o princípio como guia da dose de esforço.",
  related: [
    { title: "Unidade motora", href: `/aprender/conteudos/${DISC}--unidade-motora`, type: "conceito" },
    { title: "Repetições em reserva (RIR)", href: "/aprender/conteudos/forca-repeticoes-em-reserva", type: "mecanismo" },
    { title: "Mecanismos de hipertrofia", href: "/aprender/conteudos/fisiologia-do-exercicio--hipertrofia-mecanismos", type: "mecanismo" },
  ],
  refs: ["ref-folland-williams-2007", "ref-schoenfeld-hipertrofia-2010", "ref-diretriz-forca"],
  applyRx: "Para estimular as unidades motoras maiores, garanta demanda de força suficiente: carga elevada ou séries perto da falha com carga moderada. Isso liga proximidade da falha ao recrutamento.",
});

const fasesAprendizagem = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-aprendizagem-motora`, moduleSlug: "aprendizagem-motora",
  slug: `${DISC}--fases-aprendizagem`, title: "Fases da aprendizagem motora",
  subtitle: "Aprendizagem motora", description: "Aprender um movimento passa por fases, e cada uma pede uma dose diferente de instrução e complexidade.",
  level: "intermediario", minutes: 10, type: "conceito", kicker: K, tags: ["aprendizagem motora", "instrução", "progressão"],
  hero: "Ninguém domina um movimento de imediato. A aprendizagem motora passa por fases, do esforço consciente ao automático, e a instrução do profissional deve mudar com elas.",
  question: "Quanta correção dar a um aluno que está aprendendo o agachamento pela primeira vez?",
  concepts: [
    { term: "Aprendizagem motora", definition: "Processo pelo qual um movimento se torna mais eficiente e automático com a prática, passando por fases de crescente controle e menor esforço consciente." },
    { term: "Fases da aprendizagem", definition: "Da fase inicial (muitos erros, muita atenção consciente) à intermediária (mais consistência) e à autônoma (execução quase automática, com atenção livre para o contexto)." },
  ],
  timeline: {
    title: "Como a aprendizagem evolui",
    items: [
      { time: "Fase inicial", title: "Muitos erros, muita atenção", detail: "O aluno pensa em cada parte do movimento; a execução é inconsistente." },
      { time: "Fase intermediária", title: "Mais consistência", detail: "Os erros diminuem; o movimento fica mais fluido com a prática." },
      { time: "Fase autônoma", title: "Quase automático", detail: "A execução exige pouca atenção consciente, liberando foco para carga e contexto." },
    ],
  },
  apply: "Ajuste a instrução à fase: no início, poucas pistas simples e uma de cada vez; com o domínio, menos correção e mais autonomia. Progrida a complexidade conforme a consistência melhora. Responder à abertura: no primeiro contato, dê uma ou duas pistas essenciais por vez, evitando sobrecarregar com correções.",
  special: [
    "Iniciantes: menos é mais na instrução; excesso de correção atrapalha a fase inicial.",
    "Idosos: progressão de complexidade respeitosa e segura favorece o aprendizado e a confiança.",
    "Retorno de lesão: reconstruir o padrão passa de novo pelas fases, com paciência.",
  ],
  mistake: {
    mistake: "Corrigir tudo ao mesmo tempo no início, sobrecarregando o aluno com informação que ele não consegue processar.",
    instead: "Dê poucas pistas essenciais por vez e reduza a correção conforme o aluno progride. A instrução deve acompanhar a fase da aprendizagem.",
  },
  professionalCase: {
    prompt: "Aluno no primeiro dia de agachamento recebe cinco correções simultâneas e fica travado. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Focar em uma ou duas pistas essenciais por vez e progredir conforme a consistência aparece.", tone: "recomendada", feedback: "Coerente. Na fase inicial, poucas pistas por vez respeitam a capacidade de processamento e aceleram o aprendizado." },
      { id: "c2", label: "Repetir as cinco correções mais devagar.", tone: "cautela", feedback: "O problema é a quantidade de informação, não a velocidade; reduzir as pistas é o caminho." },
      { id: "c3", label: "Deixar o aluno errar sem qualquer orientação.", tone: "aceitavel", feedback: "Alguma orientação essencial ajuda; o certo é dosar, não ausentar-se." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Na fase inicial da aprendizagem de um movimento, a instrução ideal é:", [
      { id: "a", label: "Poucas pistas essenciais, uma de cada vez." },
      { id: "b", label: "Muitas correções simultâneas para acelerar." },
    ], "a", "Na fase inicial, o excesso de informação sobrecarrega; poucas pistas por vez favorecem o aprendizado."),
    q("q2", "verdadeiro-falso", "Na fase autônoma, o movimento exige pouca atenção consciente.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "v", "Na fase autônoma, a execução é quase automática, liberando atenção para carga e contexto."),
  ],
  uncertainty: "As fases são um modelo didático; a transição é gradual e individual. Use-as para dosar instrução e complexidade, não como etapas rígidas.",
  related: [
    { title: "Feedback", href: `/aprender/conteudos/${DISC}--feedback`, type: "conceito" },
    { title: "Linguagem acessível", href: "/aprender/conteudos/comunicacao-e-adesao--linguagem", type: "conceito" },
    { title: "Graus de liberdade", href: "/aprender/conteudos/graus-de-liberdade", type: "conceito" },
  ],
  refs: ["ref-diretriz-forca", "ref-acsm-getp11"],
  applyRx: "Ajuste a instrução à fase da aprendizagem: no início, poucas pistas essenciais por vez; com o domínio, menos correção e mais autonomia, progredindo a complexidade conforme a consistência.",
});

const feedback = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-aprendizagem-motora`, moduleSlug: "aprendizagem-motora",
  slug: `${DISC}--feedback`, title: "Feedback: informação que guia o ajuste",
  subtitle: "Aprendizagem motora", description: "A informação sobre a execução orienta o ajuste do movimento; menos e melhor costuma favorecer a autonomia.",
  level: "intermediario", minutes: 9, type: "conceito", kicker: K, tags: ["feedback", "autonomia", "aprendizagem"],
  hero: "O feedback ajuda o aluno a ajustar o movimento, mas em excesso ele vira muleta. Dar a informação certa, na dose certa, favorece a autonomia e a retenção do aprendizado.",
  question: "Por que corrigir cada repetição de um aluno pode, a longo prazo, atrapalhar a autonomia dele?",
  concepts: [
    { term: "Feedback", definition: "Informação sobre a execução que orienta o ajuste do movimento, dada pelo profissional (externa) ou percebida pelo próprio aluno (intrínseca)." },
    { term: "Dependência de feedback", definition: "Quando o aluno passa a depender da correção externa constante para executar, o que reduz o desenvolvimento da própria percepção e da autonomia." },
  ],
  apply: "Dê feedback útil e dosado: destaque o essencial, dê espaço para o aluno perceber e se ajustar, e reduza a frequência conforme ele progride. Responder à abertura: corrigir cada repetição cria dependência da correção externa; espaçar o feedback desenvolve a percepção própria e a autonomia.",
  special: [
    "Iniciantes: um pouco mais de feedback ajuda no começo, mas já deixando espaço para a auto-percepção.",
    "Avançados: feedback pontual e específico, sob demanda, respeita a autonomia conquistada.",
    "Adesão: feedback que valoriza o progresso, não só o erro, motiva e sustenta a prática.",
  ],
  mistake: {
    mistake: "Corrigir constantemente cada detalhe, criando um aluno que só executa bem com o profissional ao lado.",
    instead: "Dose o feedback: destaque o essencial, dê espaço para o aluno sentir e ajustar, e espace a correção conforme ele evolui. Menos e melhor favorece a autonomia.",
  },
  professionalCase: {
    prompt: "Aluno já executa razoavelmente, mas o profissional corrige cada repetição, e o aluno não desenvolve percepção própria. Qual ajuste é mais coerente?",
    choices: [
      { id: "c1", label: "Reduzir a frequência do feedback, destacar o essencial e dar espaço para o aluno perceber e se ajustar.", tone: "recomendada", feedback: "Coerente. Espaçar o feedback desenvolve a auto-percepção e a autonomia, sem perder a qualidade." },
      { id: "c2", label: "Manter a correção a cada repetição para garantir a técnica.", tone: "cautela", feedback: "O excesso cria dependência da correção externa e limita a autonomia a longo prazo." },
      { id: "c3", label: "Parar totalmente de dar feedback.", tone: "aceitavel", feedback: "Algum feedback pontual ainda ajuda; o certo é dosar, não eliminar." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Para desenvolver a autonomia do aluno, o feedback deve ser:", [
      { id: "a", label: "Útil, dosado e espaçado conforme o aluno progride." },
      { id: "b", label: "Constante, a cada repetição." },
    ], "a", "Feedback dosado e espaçado desenvolve a auto-percepção; o excesso cria dependência."),
    q("q2", "verdadeiro-falso", "Corrigir cada repetição pode criar dependência da correção externa.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "v", "O feedback constante vira muleta e reduz o desenvolvimento da percepção própria e da autonomia."),
  ],
  uncertainty: "A dose ideal de feedback varia com a fase, a tarefa e o aluno. Use o princípio de menos e melhor, ajustando à resposta e à autonomia observada.",
  related: [
    { title: "Fases da aprendizagem", href: `/aprender/conteudos/${DISC}--fases-aprendizagem`, type: "conceito" },
    { title: "Comunicar a decisão", href: "/aprender/conteudos/raciocinio-de-prescricao--comunicar-decisao", type: "conceito" },
    { title: "Linguagem acessível", href: "/aprender/conteudos/comunicacao-e-adesao--linguagem", type: "conceito" },
  ],
  refs: ["ref-diretriz-forca", "ref-acsm-getp11"],
  applyRx: "Dê feedback útil e dosado: destaque o essencial, dê espaço para o aluno perceber e se ajustar, e reduza a frequência conforme ele progride. Menos e melhor favorece a autonomia.",
});

export const neurofisiologiaModules: Module[] = [
  deepModule({ id: `m-${DISC}-controle-motor`, disciplineId: DISC_ID, slug: "controle-motor", title: "Controle motor", objective: "Entender como o sistema nervoso comanda e gradua a força.", order: 1, level: "fundamental", lessons: [unidadeMotora, recrutamento], applications: ["Ligar demanda de força ao recrutamento na dose do treino"] }),
  deepModule({ id: `m-${DISC}-aprendizagem-motora`, disciplineId: DISC_ID, slug: "aprendizagem-motora", title: "Aprendizagem motora", objective: "Aplicar princípios de aprendizagem ao ensino de exercícios.", order: 2, level: "intermediario", prerequisites: [`m-${DISC}-controle-motor`], lessons: [fasesAprendizagem, feedback], applications: ["Dosar instrução e feedback conforme a fase da aprendizagem"] }),
];

export const neurofisiologiaLessons: Lesson[] = [unidadeMotora, recrutamento, fasesAprendizagem, feedback];
