import type { Lesson, Module } from "../types";
import { deepLesson, deepModule, q } from "./authoring";

/** TREINAMENTO CARDIORRESPIRATÓRIO, disciplina autorada em profundidade. */

const DISC = "treinamento-cardiorrespiratorio";
const DISC_ID = "d-cardio";
const K = "Treinamento cardiorrespiratório";

const continuo = deepLesson({
  disciplineSlug: DISC,
  moduleId: `m-${DISC}-metodos-cardio`,
  moduleSlug: "metodos-cardio",
  slug: `${DISC}--continuo`,
  title: "Treino contínuo: a base do condicionamento",
  subtitle: "Métodos aeróbios",
  description: "O esforço sustentado em intensidade estável que constrói a fundação aeróbia com segurança.",
  level: "fundamental",
  minutes: 11,
  type: "conceito",
  kicker: K,
  tags: ["contínuo", "base aeróbia", "volume"],
  hero: "Antes de correr atrás de intensidade, quase todo aluno precisa de base. O treino contínuo constrói essa fundação com baixo risco e boa adesão.",
  question: "Para um aluno destreinado que quer melhorar o fôlego, começar por tiros intensos ou por caminhadas e trotes contínuos?",
  concepts: [
    { term: "Treino contínuo", definition: "Esforço mantido em intensidade relativamente estável por um período, tipicamente em zona leve a moderada. Constrói capacidade aeróbia e hábito com baixo risco." },
    { term: "Base aeróbia", definition: "Fundação de condicionamento sobre a qual estímulos mais intensos rendem melhor e com menos risco. Volume e regularidade a constroem." },
  ],
  comparison: {
    title: "Contínuo leve e contínuo moderado",
    leftTitle: "Contínuo leve",
    rightTitle: "Contínuo moderado",
    leftItems: ["Conversa confortável durante o esforço.", "Ideal para iniciar, recuperar e acumular volume.", "Baixo desgaste, alta sustentabilidade."],
    rightItems: ["Conversa possível, mas com mais esforço.", "Estímulo aeróbio mais robusto sobre base já existente.", "Exige um mínimo de condicionamento prévio."],
    note: "Responder à abertura: o destreinado começa pelo contínuo, priorizando leve e progredindo a duração. O intervalado intenso entra depois, sobre essa base.",
  },
  apply: "Prescreva a maior parte do volume aeróbio em intensidade conversável, progredindo primeiro a duração e a frequência antes da intensidade. Para iniciantes, caminhadas regulares já elevam a aptidão; a regularidade importa mais do que a intensidade no começo.",
  special: [
    "Hipertensão: predominância aeróbia moderada é recomendada; evite apneia e monitore a resposta, com conduta clínica do profissional de saúde.",
    "Obesidade: contínuo de baixo impacto (bike, caminhada, hidro) poupa articulações e sustenta o volume.",
    "Idosos: base contínua melhora fôlego e disposição com segurança; progrida a duração gradualmente.",
  ],
  mistake: {
    mistake: "Colocar o iniciante direto em alta intensidade por parecer 'mais eficiente', gerando desconforto, risco e abandono.",
    instead: "Construa base contínua primeiro. Eficiência sem adesão não entrega resultado; o intervalado rende mais quando há fundação.",
  },
  professionalCase: {
    prompt: "Aluno sedentário, sobrepeso, quer melhorar o condicionamento. Qual início é mais coerente?",
    choices: [
      { id: "c1", label: "Caminhadas contínuas em ritmo conversável, progredindo a duração ao longo das semanas.", tone: "recomendada", feedback: "Coerente: base contínua de baixo impacto constrói aptidão com segurança e adesão." },
      { id: "c2", label: "Sessões intervaladas máximas para acelerar resultados.", tone: "cautela", feedback: "Alta intensidade sem base aumenta risco e desconforto, prejudicando a continuidade." },
      { id: "c3", label: "Somente musculação, esperando melhora aeróbia indireta.", tone: "aceitavel", feedback: "A força ajuda, mas o estímulo aeróbio específico é necessário para o objetivo." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Para um destreinado melhorar o fôlego com segurança, comece por:", [
      { id: "a", label: "Treino contínuo em intensidade conversável, progredindo a duração." },
      { id: "b", label: "Intervalado máximo desde a primeira semana." },
    ], "a", "A base contínua constrói aptidão com segurança e adesão antes de introduzir intensidade."),
    q("q2", "verdadeiro-falso", "No início, a regularidade importa mais do que a intensidade para melhorar a aptidão aeróbia.", [
      { id: "v", label: "Verdadeiro" },
      { id: "f", label: "Falso" },
    ], "v", "Consistência e volume constroem a base; a intensidade ganha peso depois, sobre essa fundação."),
  ],
  uncertainty: "A proporção ideal entre volume leve e estímulos intensos varia com objetivo, tempo disponível e nível. Use a base contínua como ponto de partida e ajuste pela resposta.",
  related: [
    { title: "Treino intervalado", href: `/aprender/conteudos/${DISC}--intervalado`, type: "conceito" },
    { title: "Limiares", href: "/aprender/conteudos/fisiologia-do-exercicio--limiares", type: "conceito" },
    { title: "O que limita o VO2máx", href: "/aprender/conteudos/fisiologia-do-exercicio--vo2max-limitantes", type: "mecanismo" },
  ],
  refs: ["ref-oms-atividade", "ref-macinnis-gibala-2017", "ref-acsm-getp11"],
  applyRx: "Comece pela base contínua em intensidade conversável, progredindo duração e frequência antes de intensidade. Para iniciantes e populações sensíveis, priorize baixo impacto e regularidade.",
});

const intervalado = deepLesson({
  disciplineSlug: DISC,
  moduleId: `m-${DISC}-metodos-cardio`,
  moduleSlug: "metodos-cardio",
  slug: `${DISC}--intervalado`,
  title: "Treino intervalado: estímulo potente sobre base",
  subtitle: "Métodos aeróbios",
  description: "Alternar esforço intenso e recuperação gera adaptação eficiente, desde que haja fundação e dose adequada.",
  level: "intermediario",
  minutes: 12,
  type: "conceito",
  kicker: K,
  tags: ["intervalado", "intensidade", "eficiência"],
  hero: "Alternar trechos intensos com recuperação permite acumular tempo em alta intensidade que seria insustentável de forma contínua. É um estímulo potente, que pede base e dose.",
  question: "Um aluno com boa base quer melhorar o desempenho com pouco tempo disponível. Como estruturar o intervalado sem exagerar na dose?",
  concepts: [
    { term: "Treino intervalado", definition: "Alternância entre esforços intensos e períodos de recuperação. Permite tempo maior em alta intensidade e adaptações eficientes, com o papel central da intensidade (MacInnis e Gibala, 2017)." },
    { term: "Relação esforço e recuperação", definition: "Proporção entre o tempo intenso e o de recuperação. Define o quão exigente é a sessão; ajustá-la controla a dose sem mudar o método." },
  ],
  decisionTree: {
    title: "Escolher o formato pelo objetivo e tempo",
    root: "Qual o objetivo e o tempo do aluno?",
    branches: [
      { condition: "Base ainda em construção", outcome: "Priorizar contínuo; introduzir intervalos curtos e leves aos poucos." },
      { condition: "Melhorar aptidão com pouco tempo", outcome: "Intervalos moderados a intensos com recuperação suficiente, uma a duas vezes por semana." },
      { condition: "Desempenho específico", outcome: "Formatos mais estruturados, sempre sobre base sólida e com recuperação planejada." },
    ],
  },
  apply: "Introduza o intervalado sobre base existente, começando com poucos estímulos e recuperação generosa, uma a duas sessões por semana. Responder à abertura: com pouco tempo, poucas sessões intervaladas bem dosadas rendem, desde que intercaladas com contínuo e descanso, sem transformar toda semana em alta intensidade.",
  special: [
    "Hipertensão e cardiopatias: o intervalado intenso exige avaliação e liberação do profissional de saúde; muitos casos vão bem com intensidade moderada.",
    "Iniciantes: adiar o intervalado intenso até haver base reduz risco e desconforto.",
    "Articulações sensíveis: escolher modalidades de baixo impacto para os trechos intensos.",
  ],
  mistake: {
    mistake: "Fazer intervalado intenso quase todos os dias, achando que mais intensidade é sempre melhor.",
    instead: "Limite as sessões intensas a uma ou duas por semana e mantenha o restante em base contínua. O excesso de alta intensidade acumula fadiga e risco.",
  },
  professionalCase: {
    prompt: "Aluno com boa base pede para 'só fazer intervalado' cinco vezes por semana para evoluir rápido. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Limitar o intervalado a uma ou duas sessões e manter contínuo e descanso nos demais dias.", tone: "recomendada", feedback: "Coerente. Concentrar alta intensidade demais acumula fadiga; a base e a recuperação sustentam o progresso." },
      { id: "c2", label: "Aceitar o intervalado diário para aproveitar a motivação.", tone: "cautela", feedback: "Alta intensidade diária eleva risco e fadiga, tendendo a estagnar ou lesionar." },
      { id: "c3", label: "Alternar intervalado e musculação intensa todos os dias, sem base leve.", tone: "aceitavel", feedback: "Ainda falta espaço para recuperação e base; o total de estresse fica alto demais." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Ao introduzir intervalado em quem tem base, uma dose inicial prudente é:", [
      { id: "a", label: "Uma a duas sessões por semana, com recuperação suficiente." },
      { id: "b", label: "Diariamente, para maximizar o estímulo." },
    ], "a", "Poucas sessões intensas por semana, sobre base contínua, equilibram estímulo e recuperação."),
    q("q2", "verdadeiro-falso", "O intervalado intenso é a melhor primeira escolha para qualquer iniciante destreinado.", [
      { id: "v", label: "Verdadeiro" },
      { id: "f", label: "Falso" },
    ], "f", "Sem base, o intervalado intenso aumenta risco e desconforto; o contínuo vem primeiro."),
  ],
  uncertainty: "Formatos ótimos de intervalado (duração, intensidade, recuperação) variam por objetivo e indivíduo, e há muitos protocolos. Use os princípios (base, dose, recuperação) mais do que uma receita fixa.",
  related: [
    { title: "Treino contínuo", href: `/aprender/conteudos/${DISC}--continuo`, type: "conceito" },
    { title: "Zonas de FC", href: `/aprender/conteudos/${DISC}--zonas-fc`, type: "conceito" },
    { title: "Supercompensação", href: "/aprender/conteudos/fisiologia-do-exercicio--supercompensacao", type: "mecanismo" },
  ],
  refs: ["ref-macinnis-gibala-2017", "ref-oms-atividade", "ref-acsm-getp11"],
  applyRx: "Use o intervalado sobre base sólida, uma a duas vezes por semana, com recuperação suficiente, e mantenha o restante em contínuo. Ajuste a relação esforço e recuperação para controlar a dose.",
});

const zonasFc = deepLesson({
  disciplineSlug: DISC,
  moduleId: `m-${DISC}-zonas`,
  moduleSlug: "zonas",
  slug: `${DISC}--zonas-fc`,
  title: "Zonas de frequência cardíaca: usar sem se enganar",
  subtitle: "Zonas e monitoramento",
  description: "A frequência cardíaca é um guia útil de intensidade, com limites que o profissional precisa conhecer.",
  level: "intermediario",
  minutes: 10,
  type: "conceito",
  kicker: K,
  tags: ["frequência cardíaca", "zonas", "monitoramento"],
  hero: "A frequência cardíaca ajuda a guiar a intensidade, mas erra quando a estimativa da máxima é imprecisa ou quando o dia muda a resposta. Saber ler seus limites é o que a torna confiável.",
  question: "Quando confiar na zona-alvo de frequência cardíaca e quando preferir a percepção de esforço e o teste da fala?",
  concepts: [
    { term: "Zona-alvo", definition: "Faixa de frequência cardíaca correspondente à intensidade pretendida. Serve como guia objetivo quando a frequência é medida de forma confiável." },
    { term: "Limites da estimativa", definition: "A frequência cardíaca máxima estimada por fórmula tem erro grande entre pessoas, e fatores como cafeína, calor, sono e medicação alteram a resposta do dia." },
  ],
  apply: "Use a zona de frequência cardíaca como um dos guias, não o único. Confie mais nela quando a máxima foi medida ou quando o aluno já conhece sua resposta; nos demais casos, cruze com a percepção de esforço e o teste da fala. Responder à abertura: a frequência é útil de apoio, mas a percepção manda quando a estimativa é frágil ou o dia está atípico.",
  special: [
    "Uso de betabloqueadores e algumas cardiopatias: a frequência cardíaca pode não refletir a intensidade; priorize percepção de esforço, com conduta do profissional de saúde.",
    "Idosos: a variabilidade da resposta é maior; combine sempre com a percepção.",
  ],
  mistake: {
    mistake: "Tratar a zona calculada por fórmula como verdade absoluta e ignorar sinais de esforço excessivo ou insuficiente.",
    instead: "Cruze a frequência cardíaca com percepção de esforço e teste da fala. Se os sinais divergem, confie no conjunto e no aluno, não só no número.",
  },
  professionalCase: {
    prompt: "Aluno em uso de medicação que reduz a frequência cardíaca insiste em treinar 'na zona' calculada. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Guiar a intensidade pela percepção de esforço e teste da fala, tratando a FC como apoio.", tone: "recomendada", feedback: "Coerente. A medicação torna a FC pouco confiável como guia; a percepção reflete melhor a intensidade." },
      { id: "c2", label: "Aumentar a intensidade até a FC 'bater' a zona-alvo.", tone: "cautela", feedback: "Forçar a FC alvo pode levar a esforço excessivo, já que a resposta está alterada pela medicação." },
      { id: "c3", label: "Suspender o treino aeróbio por causa da medicação.", tone: "aceitavel", feedback: "O treino segue possível e benéfico; muda-se o guia de intensidade, não a indicação." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Quando a frequência cardíaca é pouco confiável (medicação, dia atípico), o guia mais robusto é:", [
      { id: "a", label: "Percepção de esforço e teste da fala." },
      { id: "b", label: "Insistir na zona calculada por fórmula." },
    ], "a", "A percepção reflete a intensidade real quando a FC está distorcida; a fórmula erra ainda mais nesses casos."),
    q("q2", "verdadeiro-falso", "A zona-alvo por fórmula é sempre o método mais preciso de guiar a intensidade.", [
      { id: "v", label: "Verdadeiro" },
      { id: "f", label: "Falso" },
    ], "f", "A estimativa por fórmula tem erro grande; a FC é um apoio, cruzada com percepção e teste da fala."),
  ],
  uncertainty: "As fórmulas de FC máxima e as faixas de zona são aproximações populacionais. Use-as com margem e priorize medidas individuais quando possível.",
  related: [
    { title: "FC de recuperação", href: `/aprender/conteudos/${DISC}--fc-recuperacao`, type: "mecanismo" },
    { title: "Limiares", href: "/aprender/conteudos/fisiologia-do-exercicio--limiares", type: "conceito" },
    { title: "Percepção de esforço e carga interna", href: "/aprender/conteudos/controle-de-carga-e-recuperacao--srpe", type: "conceito" },
  ],
  refs: ["ref-borg-pse", "ref-acsm-getp11", "ref-foster-srpe-2001"],
  applyRx: "Use a zona de FC como um dos guias, confiando mais quando a máxima foi medida. Cruze sempre com percepção de esforço e teste da fala, sobretudo com medicação ou dias atípicos.",
});

const fcRecuperacao = deepLesson({
  disciplineSlug: DISC,
  moduleId: `m-${DISC}-zonas`,
  moduleSlug: "zonas",
  slug: `${DISC}--fc-recuperacao`,
  title: "FC de recuperação: um sinal de progresso",
  subtitle: "Zonas e monitoramento",
  description: "A rapidez com que a frequência cardíaca cai após o esforço é uma pista simples de condicionamento ao longo das semanas.",
  level: "intermediario",
  minutes: 9,
  type: "mecanismo",
  kicker: K,
  tags: ["FC de recuperação", "monitoramento", "progresso"],
  hero: "Depois de um esforço, a frequência cardíaca cai. A velocidade dessa queda tende a melhorar com o condicionamento, oferecendo um sinal prático e barato de evolução.",
  question: "Como mostrar a um aluno que ele está condicionando melhor, sem depender só da carga levantada ou da distância percorrida?",
  concepts: [
    { term: "FC de recuperação", definition: "Queda da frequência cardíaca no primeiro minuto (ou minutos) após interromper ou reduzir o esforço. Uma queda mais rápida costuma acompanhar melhor condicionamento." },
    { term: "Linha de base individual", definition: "Referência própria do aluno, medida sempre do mesmo jeito. Comparar com a própria linha de base vale mais do que comparar com tabelas gerais." },
  ],
  apply: "Meça a FC de recuperação de forma padronizada (mesmo esforço, mesmo momento de medida) e acompanhe a tendência ao longo das semanas. Uma queda que fica mais rápida é um sinal encorajador de progresso para mostrar ao aluno, complementando carga, distância e percepção.",
  special: [
    "Medicação que altera a FC e algumas cardiopatias: o sinal perde valor; use com cautela e conduta do profissional de saúde.",
    "Idosos e iniciantes: acompanhar a própria evolução motiva e reforça a adesão.",
  ],
  mistake: {
    mistake: "Comparar a FC de recuperação do aluno com tabelas gerais e tirar conclusões absolutas de uma única medida.",
    instead: "Compare com a própria linha de base, padronizando a medida, e observe a tendência ao longo do tempo, não um valor isolado.",
  },
  professionalCase: {
    prompt: "Aluno desanimado porque a carga da musculação 'travou', mas o condicionamento aeróbio vem melhorando. Como evidenciar o progresso?",
    choices: [
      { id: "c1", label: "Mostrar a FC de recuperação ficando mais rápida ao longo das semanas, comparando com a própria linha de base.", tone: "recomendada", feedback: "Coerente. É um sinal simples e objetivo de progresso aeróbio que complementa outras métricas e motiva." },
      { id: "c2", label: "Dizer que a estagnação da carga significa que não houve evolução.", tone: "cautela", feedback: "Ignora o progresso aeróbio real; desmotiva sem base." },
      { id: "c3", label: "Trocar todo o programa por não estar 'funcionando'.", tone: "aceitavel", feedback: "Precipitado: há progresso mensurável; mudar tudo descarta o que vem dando certo." },
    ],
  },
  quiz: [
    q("q1", "variavel", "Uma queda mais rápida da frequência cardíaca após o esforço, ao longo das semanas, sugere:", [
      { id: "a", label: "Melhora do condicionamento." },
      { id: "b", label: "Piora do condicionamento." },
    ], "a", "A FC de recuperação tende a ficar mais rápida com melhor condicionamento; é um sinal encorajador."),
    q("q2", "conduta", "Para a FC de recuperação ser útil, o mais importante é:", [
      { id: "a", label: "Padronizar a medida e comparar com a própria linha de base ao longo do tempo." },
      { id: "b", label: "Comparar um único valor com tabelas gerais." },
    ], "a", "A tendência individual padronizada informa mais do que um valor isolado versus tabelas."),
  ],
  uncertainty: "A FC de recuperação sofre influência de muitos fatores (calor, hidratação, medicação) e não é diagnóstico. Trate-a como pista de acompanhamento, não como medida exata.",
  related: [
    { title: "Zonas de FC", href: `/aprender/conteudos/${DISC}--zonas-fc`, type: "conceito" },
    { title: "Interpretar um resultado", href: "/aprender/conteudos/avaliacao-fisica-e-funcional--interpretar-resultado", type: "mecanismo" },
    { title: "Sinais de fadiga e recuperação", href: "/aprender/conteudos/controle-de-carga-e-recuperacao--sinais-fadiga", type: "mecanismo" },
  ],
  refs: ["ref-acsm-getp11", "ref-borg-pse", "ref-oms-atividade"],
  applyRx: "Acompanhe a FC de recuperação de forma padronizada e compare com a própria linha de base ao longo das semanas, como sinal complementar de progresso aeróbio para motivar o aluno.",
});

export const cardioModules: Module[] = [
  deepModule({
    id: `m-${DISC}-metodos-cardio`,
    disciplineId: DISC_ID,
    slug: "metodos-cardio",
    title: "Métodos aeróbios",
    objective: "Diferenciar contínuo e intervalado e escolher pelo contexto do aluno.",
    order: 1,
    level: "fundamental",
    lessons: [continuo, intervalado],
    applications: ["Escolher o método aeróbio pela base e pelo objetivo"],
  }),
  deepModule({
    id: `m-${DISC}-zonas`,
    disciplineId: DISC_ID,
    slug: "zonas",
    title: "Zonas e monitoramento",
    objective: "Guiar e acompanhar a intensidade com ferramentas práticas e seus limites.",
    order: 2,
    level: "intermediario",
    prerequisites: [`m-${DISC}-metodos-cardio`],
    lessons: [zonasFc, fcRecuperacao],
    applications: ["Guiar intensidade cruzando FC, percepção e teste da fala"],
  }),
];

export const cardioLessons: Lesson[] = [continuo, intervalado, zonasFc, fcRecuperacao];
