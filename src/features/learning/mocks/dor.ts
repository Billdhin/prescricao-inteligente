import type { Lesson, Module } from "../types";
import { deepLesson, deepModule, q } from "./authoring";

/**
 * DOR, LIMITAÇÕES E ADAPTAÇÃO, disciplina autorada em profundidade.
 * Linguagem prudente: ler a dor no contexto, sem diagnosticar; encaminhar diante de alerta.
 */

const DISC = "dor-limitacoes-e-adaptacao";
const DISC_ID = "d-dor";
const K = "Dor, limitações e adaptação";

const dorNaoEDano = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-entender-dor`, moduleSlug: "entender-dor",
  slug: `${DISC}--dor-nao-e-dano`, title: "Dor nem sempre é dano",
  figure: { id: "dor-nao-e-dano" },
  subtitle: "Entender a dor", description: "A dor é uma experiência multifatorial que nem sempre corresponde a lesão tecidual. Ler isso no contexto muda a conduta.",
  level: "intermediario", minutes: 11, type: "conceito", kicker: K, tags: ["dor", "dano", "tolerância"],
  hero: "Dor e dano não são a mesma coisa. A dor é uma resposta complexa, influenciada por sono, estresse, medo e contexto, e nem sempre indica lesão. Entender isso evita alarmar e afastar o aluno sem necessidade.",
  question: "Um aluno sente desconforto ao agachar, sem sinais de lesão. Isso significa que ele deve parar de treinar pernas?",
  concepts: [
    { term: "Dor", definition: "Experiência multifatorial de proteção, influenciada por fatores físicos, emocionais e de contexto. Nem sempre corresponde ao grau de dano tecidual." },
    { term: "Sensibilização", definition: "Estado em que o sistema de dor fica mais reativo, de modo que estímulos normais podem doer mais. Ajuda a explicar dor persistente sem lesão proporcional." },
  ],
  apply: "Ao encontrar dor sem sinais de alerta, evite alarmar e observe o comportamento dela durante, após e no dia seguinte. Muitas vezes é possível manter o aluno em movimento com carga e amplitude toleradas. Responder à abertura: desconforto sem sinais de lesão raramente pede parar de treinar pernas; costuma pedir adaptar e progredir pela tolerância.",
  special: [
    "Dor lombar: frequentemente não corresponde a dano estrutural; movimento adaptado costuma ajudar.",
    "Osteoartrite: dor não é sinônimo de estar 'gastando' a articulação; exercício dosado tende a melhorar função e sintomas.",
    "Medo do movimento: explicar que dor nem sempre é dano reduz o medo e favorece a recuperação da função.",
  ],
  mistake: {
    mistake: "Tratar toda dor como sinal de lesão, alarmar o aluno e retirar exercícios por precaução excessiva.",
    instead: "Leia a dor no contexto e observe seu comportamento. Sem sinais de alerta, manter o movimento adaptado costuma ser melhor do que o repouso e o medo.",
  },
  professionalCase: {
    prompt: "Aluno com desconforto leve ao agachar, sem sinais de alerta, quer parar de treinar pernas por medo de 'piorar'. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Explicar que dor nem sempre é dano, adaptar carga e amplitude ao conforto e progredir pela tolerância.", tone: "recomendada", feedback: "Coerente. Sem sinais de alerta, manter o movimento adaptado costuma melhorar função e reduzir o medo." },
      { id: "c2", label: "Suspender todo treino de perna até a dor sumir.", tone: "cautela", feedback: "Repouso por precaução pode aumentar o medo e piorar a função; adaptar costuma ser melhor." },
      { id: "c3", label: "Ignorar o desconforto e manter a mesma carga.", tone: "cautela", feedback: "Ignorar a tolerância pode agravar; a conduta é adaptar e progredir pela resposta." },
    ],
  },
  quiz: [
    q("q1", "verdadeiro-falso", "A intensidade da dor sempre corresponde ao grau de dano tecidual.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "f", "A dor é multifatorial e nem sempre reflete dano; fatores como sono, estresse e medo a influenciam."),
    q("q2", "conduta", "Diante de desconforto sem sinais de alerta, a conduta mais coerente costuma ser:", [
      { id: "a", label: "Adaptar carga e amplitude ao conforto e progredir pela tolerância." },
      { id: "b", label: "Suspender o exercício da região por precaução." },
    ], "a", "Sem sinais de alerta, manter o movimento adaptado tende a melhorar função e reduzir o medo."),
  ],
  uncertainty: "A relação entre dor, dano e adaptação é complexa e individual, e alguns quadros pedem avaliação. Leia a dor no contexto e encaminhe diante de sinais de alerta.",
  related: [
    { title: "Sinais de alerta na dor", href: `/aprender/conteudos/${DISC}--red-flags`, type: "conceito" },
    { title: "Amplitude tolerada", href: `/aprender/conteudos/${DISC}--amplitude-tolerada`, type: "mecanismo" },
    { title: "Cuidado musculoesquelético", href: "/aprender/conteudos/prescricao-para-grupos-especiais--musculoesqueletico", type: "conceito" },
  ],
  refs: ["ref-a-validar-dor", "ref-acsm-getp11"],
  applyRx: "Leia a dor no contexto e observe seu comportamento; sem sinais de alerta, mantenha o aluno em movimento com carga e amplitude toleradas, evitando alarmar. Encaminhe diante de sinais de alerta.",
});

const redFlags = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-entender-dor`, moduleSlug: "entender-dor",
  slug: `${DISC}--red-flags`, title: "Sinais de alerta na dor: quando encaminhar",
  subtitle: "Entender a dor", description: "Alguns sinais associados à dor sugerem avaliação do profissional de saúde antes de continuar.",
  level: "intermediario", minutes: 9, type: "conceito", kicker: K, tags: ["red flags", "encaminhamento", "dor"],
  hero: "A maioria das dores é benigna e responde ao movimento adaptado. Mas alguns sinais de alerta pedem avaliação do profissional de saúde. Reconhecê-los é parte da conduta segura.",
  question: "Que sinais, junto de uma dor, indicam que você deve encaminhar em vez de apenas adaptar o treino?",
  concepts: [
    { term: "Sinais de alerta (red flags)", definition: "Manifestações associadas à dor que sugerem investigação clínica: dor noturna que não alivia, déficit neurológico (perda de força ou sensibilidade), febre, perda de peso inexplicada, trauma importante." },
    { term: "Encaminhar por segurança", definition: "Diante de sinais de alerta, direcionar o aluno ao profissional de saúde antes de continuar ou intensificar o treino." },
  ],
  apply: "Fique atento aos sinais de alerta associados à dor e, diante deles, encaminhe ao profissional de saúde, seguindo apoiando o aluno no que é do treino. Responder à abertura: dor noturna que não alivia, déficit neurológico, febre, perda de peso inexplicada ou trauma importante são sinais que pedem encaminhar.",
  special: [
    "Idosos: dor com perda de força ou de sensibilidade merece atenção e encaminhamento.",
    "Dor lombar: a maioria é benigna, mas os sinais de alerta mudam a conduta para encaminhamento.",
    "Qualquer condição não avaliada com sintomas sistêmicos: priorize o encaminhamento.",
  ],
  mistake: {
    mistake: "Continuar adaptando o treino diante de sinais de alerta, sem encaminhar para avaliação.",
    instead: "Reconheça os sinais de alerta e encaminhe. Na presença deles, adaptar o treino não substitui a avaliação clínica.",
  },
  professionalCase: {
    prompt: "Aluno com dor associada a febre e perda de peso recente sem explicação. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Encaminhar ao profissional de saúde pelos sinais de alerta, antes de continuar o treino intenso.", tone: "recomendada", feedback: "Coerente. Febre e perda de peso inexplicada com dor são sinais de alerta que pedem avaliação clínica." },
      { id: "c2", label: "Adaptar o treino e observar mais algumas semanas.", tone: "cautela", feedback: "Diante desses sinais, adaptar e observar sem encaminhar pode atrasar uma avaliação necessária." },
      { id: "c3", label: "Manter o treino, assumindo que é fadiga.", tone: "cautela", feedback: "Sinais de alerta não devem ser atribuídos à fadiga; a conduta é encaminhar." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Dor acompanhada de febre e perda de peso inexplicada indica:", [
      { id: "a", label: "Encaminhar ao profissional de saúde antes de continuar." },
      { id: "b", label: "Apenas adaptar o treino e observar." },
    ], "a", "Esses são sinais de alerta que pedem avaliação clínica; adaptar o treino não substitui o encaminhamento."),
    q("q2", "verdadeiro-falso", "Déficit neurológico (perda de força ou sensibilidade) associado à dor é um sinal de alerta.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "v", "Déficit neurológico é um sinal de alerta que pede avaliação do profissional de saúde."),
  ],
  uncertainty: "Listas de sinais de alerta orientam, mas o julgamento é do profissional no contexto. Na presença de qualquer sinal de alerta, prefira encaminhar.",
  related: [
    { title: "Dor nem sempre é dano", href: `/aprender/conteudos/${DISC}--dor-nao-e-dano`, type: "conceito" },
    { title: "Encaminhamento", href: "/aprender/conteudos/seguranca-e-limites-de-atuacao--encaminhamento", type: "conceito" },
    { title: "Monitorar a resposta à carga", href: `/aprender/conteudos/${DISC}--monitorar-resposta`, type: "conceito" },
  ],
  refs: ["ref-a-validar-dor", "ref-acsm-getp11", "ref-parq-2011"],
  applyRx: "Fique atento aos sinais de alerta associados à dor (noturna que não alivia, déficit neurológico, febre, perda de peso, trauma) e encaminhe diante deles, seguindo apoiando o aluno no que é do treino.",
});

const amplitudeTolerada = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-adaptar-dor`, moduleSlug: "adaptar-dor",
  slug: `${DISC}--amplitude-tolerada`, title: "Exposição gradual: treinar dentro da tolerância",
  subtitle: "Adaptar com dor", description: "Aumentar carga e amplitude conforme a tolerância melhora mantém o estímulo sem provocar dor crescente.",
  level: "intermediario", minutes: 10, type: "mecanismo", kicker: K, tags: ["exposição gradual", "tolerância", "amplitude"],
  hero: "Diante de dor sem sinais de alerta, o caminho costuma ser o meio termo entre evitar e forçar: expor o corpo de forma gradual, dentro de um nível tolerado, ampliando conforme melhora.",
  question: "Um aluno tem dor no ombro em certa amplitude. Como manter o treino de ombro sem provocar a dor nem abandonar o estímulo?",
  concepts: [
    { term: "Exposição gradual", definition: "Aumentar carga e amplitude de forma progressiva, dentro de um nível de dor tolerado e não crescente, para restaurar capacidade e reduzir a sensibilidade." },
    { term: "Nível tolerado", definition: "Faixa de esforço e amplitude em que a dor, se presente, é leve e não aumenta ao longo das séries, da sessão e do dia seguinte." },
  ],
  mechanism: {
    title: "Como progredir com tolerância",
    steps: [
      { label: "Encontrar a entrada tolerada", detail: "Definir carga e amplitude em que a dor é leve e estável, sem crescer." },
      { label: "Manter o estímulo", detail: "Trabalhar nessa faixa preserva capacidade e reduz o medo do movimento." },
      { label: "Progredir conforme melhora", detail: "Ampliar carga ou amplitude aos poucos, guiado pela resposta da dor." },
      { label: "Recuar diante de piora", detail: "Se a dor cresce durante, após ou no dia seguinte, reduzir e reconstruir." },
    ],
  },
  apply: "Encontre a entrada tolerada (carga e amplitude com dor leve e estável), mantenha o estímulo ali e progrida conforme a tolerância melhora, recuando se a dor crescer. Responder à abertura: para o ombro, trabalhe em amplitude e carga toleradas, ampliando aos poucos, em vez de evitar o padrão ou forçar até a dor.",
  special: [
    "Osteoartrite e dor lombar: a exposição gradual costuma melhorar função e reduzir sintomas ao longo do tempo.",
    "Retorno de lesão: reconstruir carga e amplitude pela tolerância, guiado pela resposta, é a base da progressão.",
    "Medo do movimento: trabalhar em faixa tolerada, com sucesso, reduz o medo e amplia a confiança.",
  ],
  mistake: {
    mistake: "Cair nos extremos: evitar totalmente o movimento por causa da dor, ou forçar até a dor forte 'para vencer'.",
    instead: "Trabalhe no nível tolerado e progrida pela resposta. Nem evitar nem forçar: expor de forma gradual é o que costuma reconstruir a capacidade.",
  },
  professionalCase: {
    prompt: "Aluna com dor no ombro em elevações acima de certa altura, sem sinais de alerta, objetivo manter treino de ombro. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Trabalhar na amplitude e carga toleradas (dor leve e estável) e ampliar aos poucos pela resposta.", tone: "recomendada", feedback: "Coerente. A exposição gradual mantém o estímulo e reconstrói a tolerância sem provocar." },
      { id: "c2", label: "Evitar todo trabalho de ombro até a dor sumir.", tone: "cautela", feedback: "Evitar por completo tende a manter o medo e a perda de função; adaptar é melhor." },
      { id: "c3", label: "Insistir na amplitude dolorosa para 'liberar' o movimento.", tone: "cautela", feedback: "Forçar a amplitude dolorosa pode agravar; a progressão é pela tolerância." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Diante de dor sem alerta em certa amplitude, a exposição gradual significa:", [
      { id: "a", label: "Trabalhar em carga e amplitude toleradas e progredir conforme a dor permite." },
      { id: "b", label: "Evitar o movimento ou forçar até a dor forte." },
    ], "a", "A exposição gradual fica entre evitar e forçar: mantém o estímulo no nível tolerado e progride pela resposta."),
    q("q2", "verdadeiro-falso", "Trabalhar num nível de dor leve e estável, que não cresce, pode fazer parte da progressão.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "v", "Uma dor leve e não crescente costuma ser tolerável e compatível com progressão; o que se evita é a dor crescente."),
  ],
  uncertainty: "O nível de dor aceitável e o ritmo de progressão variam por pessoa e condição, e alguns quadros pedem avaliação. Guie-se pela resposta e encaminhe diante de sinais de alerta.",
  related: [
    { title: "Monitorar a resposta à carga", href: `/aprender/conteudos/${DISC}--monitorar-resposta`, type: "conceito" },
    { title: "Amplitude e demanda", href: "/aprender/conteudos/amplitude-e-demanda", type: "mecanismo" },
    { title: "Adaptar sem esvaziar", href: "/aprender/conteudos/prescricao-para-grupos-especiais--adaptar-sem-esvaziar", type: "conceito" },
  ],
  refs: ["ref-a-validar-dor", "ref-acsm-getp11", "ref-diretriz-forca"],
  applyRx: "Encontre a entrada tolerada (dor leve e estável), mantenha o estímulo ali e progrida conforme a tolerância melhora, recuando se a dor crescer. Nem evitar, nem forçar: exponha de forma gradual.",
});

const monitorar = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-adaptar-dor`, moduleSlug: "adaptar-dor",
  slug: `${DISC}--monitorar-resposta`, title: "Monitorar a resposta à carga",
  subtitle: "Adaptar com dor", description: "Acompanhar a dor durante, após e no dia seguinte guia a progressão, no lugar do calendário.",
  level: "intermediario", minutes: 9, type: "conceito", kicker: K, tags: ["monitorar", "resposta à carga", "progressão"],
  hero: "A resposta da dor à carga é a melhor bússola da progressão em quem tem limitações. Acompanhá-la durante, após e no dia seguinte diz quando avançar e quando recuar.",
  question: "Como decidir se pode aumentar a carga de um aluno com dor, sem ir rápido demais nem parar sem necessidade?",
  concepts: [
    { term: "Resposta à carga", definition: "Comportamento da dor em relação ao exercício: durante a sessão, logo após e no dia seguinte. Guia se o estímulo foi tolerado ou excessivo." },
    { term: "Progressão guiada pela resposta", definition: "Avançar carga ou amplitude quando a dor se mantém leve e estável, e recuar quando ela cresce, em vez de seguir um cronograma fixo." },
  ],
  apply: "Combine com o aluno como acompanhar a dor: se durante e após a sessão ela fica leve e estável, e no dia seguinte não piora, pode-se progredir; se cresce, recua-se. Responder à abertura: a resposta da dor à carga, e não o calendário, diz quando avançar. Registre para enxergar a tendência.",
  special: [
    "Osteoartrite e dor lombar: a resposta ao longo dos dias orienta a dose melhor do que uma regra fixa.",
    "Retorno de lesão: monitorar durante, após e no dia seguinte protege contra a progressão rápida demais.",
    "Alta variabilidade de sintomas: acompanhar a tendência, não um dia isolado, evita reações exageradas.",
  ],
  mistake: {
    mistake: "Progredir por calendário (subir carga toda semana) ignorando como a dor respondeu, ou parar por causa de um único dia pior.",
    instead: "Deixe a resposta da dor guiar a progressão: avance com dor leve e estável, recue se ela cresce, e olhe a tendência, não um dia isolado.",
  },
  professionalCase: {
    prompt: "Aluno com dor no joelho tolerou bem a carga atual por duas semanas, dor leve e estável, sem piora no dia seguinte. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Progredir levemente a carga ou amplitude e continuar monitorando a resposta.", tone: "recomendada", feedback: "Coerente. Dor leve, estável e sem piora indica tolerância; progredir aos poucos e seguir monitorando é adequado." },
      { id: "c2", label: "Manter tudo igual indefinidamente por medo de piorar.", tone: "aceitavel", feedback: "Com boa tolerância, não progredir perde a chance de reconstruir capacidade; pode-se avançar com cautela." },
      { id: "c3", label: "Aumentar bastante a carga de uma vez, já que tolerou.", tone: "cautela", feedback: "Saltos grandes ignoram a lógica de progressão pela resposta e podem provocar piora." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Para decidir se progride a carga de um aluno com dor, o guia mais coerente é:", [
      { id: "a", label: "A resposta da dor durante, após e no dia seguinte (leve e estável permite avançar)." },
      { id: "b", label: "Um cronograma fixo de aumento semanal." },
    ], "a", "A resposta da dor à carga guia melhor a progressão do que o calendário."),
    q("q2", "verdadeiro-falso", "Um único dia de dor pior deve fazer o profissional mudar todo o plano imediatamente.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "f", "A tendência importa mais do que um dia isolado; observe a resposta ao longo do tempo antes de mudar o plano."),
  ],
  uncertainty: "A resposta da dor varia com muitos fatores e nem sempre é linear; alguns quadros pedem avaliação. Use a tendência como guia e encaminhe diante de sinais de alerta.",
  related: [
    { title: "Exposição gradual", href: `/aprender/conteudos/${DISC}--amplitude-tolerada`, type: "mecanismo" },
    { title: "Sinais de fadiga", href: "/aprender/conteudos/controle-de-carga-e-recuperacao--sinais-fadiga", type: "mecanismo" },
    { title: "Interpretar um resultado", href: "/aprender/conteudos/avaliacao-fisica-e-funcional--interpretar-resultado", type: "mecanismo" },
  ],
  refs: ["ref-a-validar-dor", "ref-foster-srpe-2001", "ref-acsm-getp11"],
  applyRx: "Deixe a resposta da dor guiar a progressão: avance com dor leve e estável e sem piora no dia seguinte, recue se ela cresce, e olhe a tendência, não um dia isolado. Registre para enxergar o padrão.",
});

export const dorModules: Module[] = [
  deepModule({ id: `m-${DISC}-entender-dor`, disciplineId: DISC_ID, slug: "entender-dor", title: "Entender a dor", objective: "Ler a dor no contexto, sem diagnosticar, reconhecendo sinais de alerta.", order: 1, level: "intermediario", lessons: [dorNaoEDano, redFlags], applications: ["Ler a dor no contexto e encaminhar diante de sinais de alerta"] }),
  deepModule({ id: `m-${DISC}-adaptar-dor`, disciplineId: DISC_ID, slug: "adaptar-dor", title: "Adaptar com dor", objective: "Manter estímulo dentro da tolerância, guiado pela resposta.", order: 2, level: "intermediario", prerequisites: [`m-${DISC}-entender-dor`], lessons: [amplitudeTolerada, monitorar], applications: ["Progredir pela resposta da dor, dentro da tolerância"] }),
];

export const dorLessons: Lesson[] = [dorNaoEDano, redFlags, amplitudeTolerada, monitorar];
