import type { Lesson, Module } from "../types";
import { deepLesson, deepModule, q } from "./authoring";

/** FISIOLOGIA HUMANA, disciplina autorada em profundidade. */

const DISC = "fisiologia-humana";
const DISC_ID = "d-fisiologia";
const K = "Fisiologia humana";

const debito = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-sistema-cardiovascular`, moduleSlug: "sistema-cardiovascular",
  slug: `${DISC}--debito-cardiaco`, title: "Débito cardíaco: o motor da entrega de oxigênio",
  subtitle: "Sistema cardiovascular", description: "Frequência cardíaca vezes volume sistólico define quanto sangue o coração bombeia; explica a resposta ao esforço e a melhora com o treino.",
  level: "fundamental", minutes: 10, type: "conceito", kicker: K, tags: ["débito cardíaco", "frequência cardíaca", "volume sistólico"],
  hero: "Quando o esforço aumenta, os músculos pedem mais oxigênio, e o coração responde bombeando mais sangue. Entender o débito cardíaco explica por que a frequência sobe e como o treino torna o coração mais eficiente.",
  question: "Por que, com o tempo de treino, a frequência cardíaca de repouso de um aluno tende a cair?",
  concepts: [
    { term: "Débito cardíaco", definition: "Volume de sangue bombeado por minuto, resultado da frequência cardíaca vezes o volume sistólico (quanto o coração ejeta por batimento). É o principal determinante da entrega de oxigênio." },
    { term: "Volume sistólico", definition: "Quantidade de sangue ejetada a cada batimento. O treino aeróbio tende a aumentá-lo, permitindo bombear o mesmo sangue com menos batimentos." },
  ],
  figure: { id: "debito-cardiaco" },
  apply: "Entenda a frequência cardíaca como uma das formas de aumentar o débito; com o treino, o coração ejeta mais por batimento e precisa bater menos para o mesmo trabalho. Responder à abertura: a frequência de repouso cai porque o treino aeróbio aumenta o volume sistólico, e o coração entrega o mesmo sangue com menos batimentos.",
  special: [
    "Aptidão aeróbia: o aumento do volume sistólico é uma adaptação central do treino de resistência.",
    "Hipertensão: a resposta cardiovascular ao esforço pede cuidados de intensidade e monitoramento.",
    "Idosos: o treino melhora a eficiência cardiovascular e a capacidade funcional.",
  ],
  mistake: {
    mistake: "Interpretar uma frequência cardíaca de repouso mais baixa como problema, quando costuma refletir melhor condicionamento.",
    instead: "Considere o débito cardíaco: com mais volume sistólico, o coração bate menos para o mesmo trabalho. Frequência de repouso menor, em pessoa saudável, costuma indicar boa aptidão.",
  },
  professionalCase: {
    prompt: "Aluno nota que a frequência cardíaca de repouso caiu após meses de treino aeróbio e se preocupa. Como explicar?",
    choices: [
      { id: "c1", label: "Explicar que o treino aumenta o volume sistólico, então o coração entrega o mesmo sangue com menos batimentos, sinal de melhor condicionamento.", tone: "recomendada", feedback: "Coerente. A queda da FC de repouso, em pessoa saudável, costuma refletir a adaptação cardiovascular ao treino." },
      { id: "c2", label: "Recomendar parar o treino por precaução.", tone: "cautela", feedback: "Sem sinais de alerta, a queda é uma adaptação positiva; parar seria desnecessário." },
      { id: "c3", label: "Ignorar e mudar de assunto.", tone: "aceitavel", feedback: "Explicar a fisiologia tranquiliza e educa o aluno; vale a pena." },
    ],
  },
  quiz: [
    q("q1", "variavel", "O débito cardíaco é o produto da frequência cardíaca pelo:", [
      { id: "a", label: "Volume sistólico." }, { id: "b", label: "Consumo de oxigênio." },
    ], "a", "Débito cardíaco é frequência cardíaca vezes volume sistólico, o principal determinante da entrega de oxigênio."),
    q("q2", "verdadeiro-falso", "Em pessoa saudável, uma frequência cardíaca de repouso mais baixa após treino costuma indicar melhor condicionamento.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "v", "Com maior volume sistólico, o coração bate menos para o mesmo trabalho, sinal de adaptação aeróbia."),
  ],
  uncertainty: "A resposta cardiovascular varia com idade, medicação e condição; a frequência isolada não é diagnóstico. Interprete no contexto e encaminhe diante de sinais de alerta.",
  related: [
    { title: "Pressão no exercício", href: `/aprender/conteudos/${DISC}--pressao-no-exercicio`, type: "conceito" },
    { title: "O que limita o VO2máx", href: "/aprender/conteudos/fisiologia-do-exercicio--vo2max-limitantes", type: "mecanismo" },
    { title: "FC de recuperação", href: "/aprender/conteudos/treinamento-cardiorrespiratorio--fc-recuperacao", type: "mecanismo" },
  ],
  refs: ["ref-bassett-howley-2000", "ref-acsm-getp11", "ref-oms-atividade"],
  applyRx: "Entenda a frequência cardíaca como parte do débito cardíaco; o treino aumenta o volume sistólico, reduzindo os batimentos para o mesmo trabalho. Interprete a FC no contexto do aluno.",
});

const pressao = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-sistema-cardiovascular`, moduleSlug: "sistema-cardiovascular",
  slug: `${DISC}--pressao-no-exercicio`, title: "Pressão arterial no exercício",
  subtitle: "Sistema cardiovascular", description: "O comportamento da pressão durante e após o esforço orienta cuidados com respiração e intensidade, sobretudo na hipertensão.",
  level: "fundamental", minutes: 10, type: "conceito", kicker: K, tags: ["pressão arterial", "Valsalva", "hipertensão"],
  hero: "A pressão arterial sobe com o esforço, e como ela sobe depende do tipo de exercício e da respiração. Entender isso orienta cuidados importantes, especialmente para quem tem hipertensão.",
  question: "Por que prender a respiração ao fazer força pesada pode ser arriscado para um hipertenso?",
  concepts: [
    { term: "Resposta pressórica", definition: "Comportamento da pressão arterial durante e após o esforço. Ela sobe de forma controlada em esforços aeróbios; picos acentuados ocorrem em esforços de força com apneia." },
    { term: "Manobra de Valsalva", definition: "Prender a respiração e fazer força contra a glote, o que eleva a pressão de forma aguda e acentuada. Deve ser evitada, sobretudo na hipertensão." },
  ],
  apply: "Oriente respiração contínua e intensidade adequada, evitando a apneia em cargas altas, sobretudo em hipertensos. Após o esforço, a pressão tende a cair; monitore quando indicado. Responder à abertura: prender a respiração (Valsalva) eleva a pressão de forma aguda; num hipertenso, isso soma-se a uma pressão de base já alta, aumentando o risco.",
  special: [
    "Hipertensão: predominância aeróbia moderada; evitar apneia e cargas máximas; monitorar (Pescatello et al., 2004).",
    "Cardiopatias: cuidados de intensidade e conduta do profissional de saúde.",
    "Após o exercício aeróbio, a pressão costuma ficar reduzida por um tempo (efeito hipotensor), um benefício relevante.",
  ],
  mistake: {
    mistake: "Permitir apneia (Valsalva) em cargas altas com hipertensos, ou ignorar sintomas durante o esforço.",
    instead: "Ensine respiração contínua, use intensidade moderada e monitore sinais. Evitar a apneia protege a resposta pressórica em quem tem pressão alta.",
  },
  professionalCase: {
    prompt: "Aluno hipertenso quer fazer agachamento pesado prendendo a respiração para 'estabilizar'. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Ensinar respiração contínua, usar cargas moderadas sem levar à falha e monitorar sinais, dentro dos cuidados do grupo.", tone: "recomendada", feedback: "Coerente. Evitar a apneia e a carga máxima protege a resposta pressórica do hipertenso." },
      { id: "c2", label: "Permitir a apneia por 'melhorar a estabilidade'.", tone: "cautela", feedback: "A Valsalva eleva a pressão de forma aguda; em hipertenso, aumenta o risco." },
      { id: "c3", label: "Proibir todo treino de força.", tone: "aceitavel", feedback: "A força é possível e benéfica com cuidados; o ajuste é evitar apneia e cargas máximas, não proibir." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Para um hipertenso no treino de força, um cuidado central é:", [
      { id: "a", label: "Evitar a apneia (Valsalva) e usar intensidade moderada com monitoramento." },
      { id: "b", label: "Priorizar cargas máximas com apneia para estabilizar." },
    ], "a", "A apneia eleva a pressão de forma aguda; hipertensão pede respiração contínua e intensidade moderada."),
    q("q2", "verdadeiro-falso", "Após exercício aeróbio, a pressão arterial costuma ficar reduzida por um período (efeito hipotensor).", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "v", "O exercício aeróbio costuma produzir uma redução da pressão após a sessão, um benefício relevante."),
  ],
  uncertainty: "As respostas de pressão variam com a medicação e a condição individual; a conduta clínica é do profissional de saúde. Individualize dentro dos cuidados do grupo.",
  related: [
    { title: "Débito cardíaco", href: `/aprender/conteudos/${DISC}--debito-cardiaco`, type: "conceito" },
    { title: "Risco cardiometabólico", href: "/aprender/conteudos/prescricao-para-grupos-especiais--cardiometabolico", type: "conceito" },
    { title: "Triagem pré-participação", href: "/aprender/conteudos/prescricao-para-grupos-especiais--triagem", type: "conceito" },
  ],
  refs: ["ref-pescatello-hipertensao-2004", "ref-acsm-getp11", "ref-oms-atividade"],
  applyRx: "Oriente respiração contínua e intensidade adequada, evitando apneia em cargas altas, sobretudo em hipertensos, e monitore sinais. A conduta clínica e a medicação são do profissional de saúde.",
});

const ventilacao = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-sistema-respiratorio`, moduleSlug: "sistema-respiratorio",
  slug: `${DISC}--ventilacao`, title: "Ventilação e esforço: o teste da fala",
  subtitle: "Sistema respiratório", description: "A ventilação sobe com a intensidade e, num ponto, de forma desproporcional; isso sustenta o teste da fala como guia prático.",
  level: "fundamental", minutes: 9, type: "conceito", kicker: K, tags: ["ventilação", "limiar ventilatório", "teste da fala"],
  hero: "Conforme o esforço aumenta, a respiração acompanha, até um ponto em que sobe de forma desproporcional. Esse ponto tem uso prático: é a base do teste da fala para guiar a intensidade sem equipamento.",
  question: "Como saber, sem aparelhos, se um aluno passou de uma intensidade leve para uma mais exigente durante a caminhada?",
  concepts: [
    { term: "Limiar ventilatório", definition: "Intensidade a partir da qual a ventilação sobe de forma desproporcional ao aumento do esforço, refletindo mudanças no metabolismo." },
    { term: "Teste da fala", definition: "Guia prático de intensidade: conseguir falar frases confortavelmente indica esforço abaixo do primeiro limiar; falar só palavras soltas indica proximidade de um limiar mais alto." },
  ],
  figure: { id: "ventilacao-troca" },
  apply: "Use a respiração e a fala como guia de intensidade: fala confortável indica esforço leve a moderado; dificuldade para falar indica intensidade maior. Responder à abertura: quando o aluno deixa de conseguir falar frases confortavelmente e passa a palavras soltas, cruzou para uma intensidade mais exigente.",
  special: [
    "Hipertensão e cardiopatias: manter a maior parte do treino em intensidade conversável é prudente.",
    "Iniciantes: o teste da fala é acessível e não exige equipamento; ensine já nas primeiras sessões.",
    "Idosos: guiar intensidade pela fala é simples e seguro, sem depender de fórmulas de FC.",
  ],
  mistake: {
    mistake: "Depender só de fórmulas de frequência cardíaca para intensidade, ignorando pistas simples como a respiração e a fala.",
    instead: "Combine o teste da fala com a percepção de esforço, e use a frequência cardíaca como apoio quando confiável. As pistas respiratórias individualizam bem a intensidade.",
  },
  professionalCase: {
    prompt: "Aluna quer treinar aeróbio em intensidade moderada, mas não tem monitor de frequência. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Guiar pela fala: manter um ritmo em que ela consegue falar frases com algum esforço, sem chegar ao ponto de só palavras soltas.", tone: "recomendada", feedback: "Coerente. O teste da fala guia a intensidade moderada de forma prática, sem equipamento." },
      { id: "c2", label: "Insistir numa zona calculada por fórmula sem medir a FC.", tone: "cautela", feedback: "Sem medir a FC e com fórmula imprecisa, a estimativa é frágil; a fala guia melhor aqui." },
      { id: "c3", label: "Deixar a intensidade totalmente livre, sem referência.", tone: "aceitavel", feedback: "Alguma referência ajuda; o teste da fala é simples e eficaz." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Um guia prático de intensidade moderada, sem equipamento, é:", [
      { id: "a", label: "Conseguir falar frases com algum esforço (teste da fala)." },
      { id: "b", label: "Uma zona calculada por fórmula sem medir a FC." },
    ], "a", "O teste da fala reflete a intensidade de forma prática e individual, sem depender de equipamento."),
    q("q2", "verdadeiro-falso", "A ventilação sobe de forma desproporcional ao esforço a partir de um limiar ventilatório.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "v", "A partir do limiar ventilatório, a ventilação sobe desproporcionalmente, base do teste da fala."),
  ],
  uncertainty: "O teste da fala é uma aproximação e sofre influência de fatores individuais. Use-o com a percepção de esforço, ajustando ao aluno.",
  related: [
    { title: "Consumo de oxigênio", href: `/aprender/conteudos/${DISC}--consumo-oxigenio`, type: "mecanismo" },
    { title: "Limiares", href: "/aprender/conteudos/fisiologia-do-exercicio--limiares", type: "conceito" },
    { title: "Zonas de FC", href: "/aprender/conteudos/treinamento-cardiorrespiratorio--zonas-fc", type: "conceito" },
  ],
  refs: ["ref-oms-atividade", "ref-acsm-getp11", "ref-borg-pse"],
  applyRx: "Use a respiração e o teste da fala para guiar a intensidade: fala confortável indica esforço leve a moderado; dificuldade para falar indica intensidade maior. Combine com a percepção de esforço.",
});

const consumo = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-sistema-respiratorio`, moduleSlug: "sistema-respiratorio",
  slug: `${DISC}--consumo-oxigenio`, title: "Consumo de oxigênio: a demanda da tarefa",
  subtitle: "Sistema respiratório", description: "O VO2 reflete a demanda metabólica do esforço e é a base para entender aptidão aeróbia e progressão de volume.",
  level: "intermediario", minutes: 9, type: "mecanismo", kicker: K, tags: ["VO2", "demanda metabólica", "aptidão"],
  hero: "Quanto oxigênio uma tarefa consome reflete o quão exigente ela é para o metabolismo. O consumo de oxigênio liga o esforço à demanda e fundamenta como progredir o volume aeróbio.",
  question: "Por que caminhar rápido consome mais oxigênio do que caminhar devagar, e o que isso diz sobre a progressão?",
  concepts: [
    { term: "VO2 (consumo de oxigênio)", definition: "Quantidade de oxigênio consumida por unidade de tempo; reflete a demanda metabólica da tarefa. Aumenta com a intensidade e com a massa muscular envolvida." },
    { term: "Economia de movimento", definition: "Quanto oxigênio uma pessoa consome para realizar a mesma tarefa. Com o treino, a economia melhora: o mesmo esforço custa menos oxigênio." },
  ],
  mechanism: {
    title: "Do esforço à demanda de oxigênio",
    steps: [
      { label: "A tarefa exige energia", detail: "Mais intensidade e mais músculos envolvidos aumentam a demanda metabólica." },
      { label: "O metabolismo consome oxigênio", detail: "O sistema oxidativo usa oxigênio para repor ATP; o VO2 reflete essa demanda." },
      { label: "O corpo entrega mais oxigênio", detail: "Respiração e débito cardíaco aumentam para atender à demanda." },
      { label: "O treino melhora a economia", detail: "Com adaptação, a mesma tarefa passa a custar menos oxigênio e esforço." },
    ],
  },
  apply: "Entenda o VO2 como a demanda da tarefa: aumentar a intensidade ou o volume eleva o consumo de oxigênio e o estímulo aeróbio. Progrida de forma gradual, e espere que, com o treino, o mesmo esforço fique mais fácil. Responder à abertura: caminhar rápido exige mais energia, logo mais oxigênio; a progressão consiste em aumentar gradualmente a demanda que o aluno tolera.",
  special: [
    "Aptidão aeróbia: melhorar a economia e a capacidade de sustentar VO2 alto é o alvo do treino de resistência.",
    "Iniciantes: pequenas progressões de intensidade e duração já elevam a demanda com segurança.",
    "Reabilitação: aumentar a demanda de forma gradual respeita a tolerância e a recuperação.",
  ],
  mistake: {
    mistake: "Progredir a demanda aeróbia bruscamente, elevando muito intensidade e volume de uma vez.",
    instead: "Aumente a demanda de oxigênio de forma gradual (intensidade ou volume, um por vez) e observe a resposta. O corpo se adapta melhor a incrementos progressivos.",
  },
  professionalCase: {
    prompt: "Aluno quer melhorar o condicionamento e pergunta como progredir a caminhada. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Aumentar gradualmente a demanda (duração e depois intensidade, um por vez), observando a resposta ao longo das semanas.", tone: "recomendada", feedback: "Coerente. Elevar a demanda de oxigênio de forma progressiva estimula a aptidão com segurança." },
      { id: "c2", label: "Aumentar muito intensidade e volume de uma vez.", tone: "cautela", feedback: "Saltos bruscos de demanda elevam o risco e a fadiga; a progressão deve ser gradual." },
      { id: "c3", label: "Manter tudo igual por meses.", tone: "aceitavel", feedback: "Sem aumentar a demanda, o estímulo estagna; é preciso progredir gradualmente." },
    ],
  },
  quiz: [
    q("q1", "variavel", "O consumo de oxigênio (VO2) reflete principalmente:", [
      { id: "a", label: "A demanda metabólica da tarefa." },
      { id: "b", label: "A força máxima do músculo." },
    ], "a", "O VO2 reflete a demanda metabólica; aumenta com intensidade e massa muscular envolvida."),
    q("q2", "verdadeiro-falso", "Com o treino, a mesma tarefa tende a custar menos oxigênio (melhor economia).", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "v", "A economia de movimento melhora com o treino: o mesmo esforço passa a consumir menos oxigênio."),
  ],
  uncertainty: "A relação entre VO2, desempenho e saúde é complexa e individual. Use o conceito para orientar a progressão do volume e da intensidade, ajustando à resposta.",
  related: [
    { title: "Ventilação e esforço", href: `/aprender/conteudos/${DISC}--ventilacao`, type: "conceito" },
    { title: "O que limita o VO2máx", href: "/aprender/conteudos/fisiologia-do-exercicio--vo2max-limitantes", type: "mecanismo" },
    { title: "Sistemas energéticos", href: "/aprender/conteudos/bioquimica-metabolismo--sistemas-energeticos", type: "conceito" },
  ],
  refs: ["ref-bassett-howley-2000", "ref-oms-atividade", "ref-acsm-getp11"],
  applyRx: "Entenda o VO2 como a demanda da tarefa e progrida de forma gradual (intensidade ou volume, um por vez); com o treino, o mesmo esforço fica mais fácil, sinal de melhor economia e aptidão.",
});

const agudaCronica = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-adaptacoes`, moduleSlug: "adaptacoes",
  slug: `${DISC}--aguda-vs-cronica`, title: "Resposta aguda e adaptação crônica",
  subtitle: "Adaptações ao treino", description: "Distinguir o efeito imediato de uma sessão da mudança que se consolida ao longo de semanas evita conclusões precipitadas.",
  level: "intermediario", minutes: 9, type: "conceito", kicker: K, tags: ["resposta aguda", "adaptação crônica", "progressão"],
  hero: "O cansaço de hoje não é o resultado de amanhã. A resposta aguda é o que o corpo faz durante e logo após a sessão; a adaptação crônica é a mudança que se consolida ao longo de semanas. Confundi-las gera decisões erradas.",
  question: "Um aluno se sente exausto e 'pior' logo após um treino intenso. Isso significa que o treino não está funcionando?",
  concepts: [
    { term: "Resposta aguda", definition: "Alterações imediatas durante e logo após uma sessão: fadiga, elevação da frequência cardíaca, dor tardia. São temporárias e esperadas." },
    { term: "Adaptação crônica", definition: "Mudança estrutural ou funcional que se consolida com o treino repetido ao longo de semanas: mais força, mais aptidão, hipertrofia. É o resultado que importa." },
  ],
  apply: "Separe a resposta aguda (cansaço e dor do dia) da adaptação crônica (o resultado das semanas). Não julgue o programa por como o aluno se sente logo após uma sessão. Responder à abertura: exaustão logo após um treino intenso é resposta aguda esperada; o resultado se mede pela adaptação ao longo das semanas, não pelo mal-estar imediato.",
  special: [
    "Iniciantes: dor tardia nas primeiras semanas é resposta aguda comum, não sinal de que o treino é ruim.",
    "Emagrecimento e força: os resultados são crônicos; comunicar isso alinha a expectativa.",
    "Fadiga persistente por semanas, ao contrário, pede atenção à recuperação.",
  ],
  mistake: {
    mistake: "Julgar o programa pela sensação imediata pós-sessão, mudando tudo porque o aluno ficou cansado ou dolorido.",
    instead: "Avalie pela adaptação ao longo das semanas. Cansaço e dor agudos são esperados; o resultado é crônico e se mede no tempo.",
  },
  professionalCase: {
    prompt: "Aluno quer trocar todo o programa porque ficou muito cansado e dolorido após as primeiras sessões. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Explicar que cansaço e dor iniciais são resposta aguda esperada, ajustar a dose se necessário e avaliar o resultado nas próximas semanas.", tone: "recomendada", feedback: "Coerente. A resposta aguda não define o programa; o resultado é crônico e se mede no tempo." },
      { id: "c2", label: "Trocar todo o programa imediatamente.", tone: "cautela", feedback: "Reagir à resposta aguda reinicia o processo e impede avaliar a adaptação crônica." },
      { id: "c3", label: "Aumentar muito a carga para 'acelerar'.", tone: "cautela", feedback: "Aumentar a dose diante de fadiga aguda alta tende a piorar; ajuste com bom senso." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Cansaço e dor logo após as primeiras sessões devem ser interpretados como:", [
      { id: "a", label: "Resposta aguda esperada; o resultado se avalia nas semanas seguintes." },
      { id: "b", label: "Sinal de que o programa está errado e precisa mudar já." },
    ], "a", "A resposta aguda é temporária e esperada; a adaptação crônica é o que mede o resultado."),
    q("q2", "verdadeiro-falso", "A adaptação crônica é a mudança que se consolida ao longo de semanas de treino repetido.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "v", "A adaptação crônica se constrói no tempo; é o resultado que importa, distinto da resposta aguda."),
  ],
  uncertainty: "A linha entre fadiga aguda normal e acúmulo excessivo depende do contexto e do indivíduo. Use a distinção como guia, atento a fadiga que persiste por semanas.",
  related: [
    { title: "Homeostase e estímulo", href: `/aprender/conteudos/${DISC}--homeostase`, type: "mecanismo" },
    { title: "Supercompensação", href: "/aprender/conteudos/fisiologia-do-exercicio--supercompensacao", type: "mecanismo" },
    { title: "Sinais de fadiga", href: "/aprender/conteudos/controle-de-carga-e-recuperacao--sinais-fadiga", type: "mecanismo" },
  ],
  refs: ["ref-diretriz-forca", "ref-acsm-progressao-2009", "ref-oms-atividade"],
  applyRx: "Separe a resposta aguda (cansaço e dor do dia) da adaptação crônica (resultado das semanas); não julgue o programa pela sensação imediata, e avalie o resultado ao longo do tempo.",
});

const homeostase = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-adaptacoes`, moduleSlug: "adaptacoes",
  slug: `${DISC}--homeostase`, title: "Homeostase e estímulo: por que o corpo se adapta",
  subtitle: "Adaptações ao treino", description: "O corpo se adapta quando o estímulo desafia o equilíbrio e há recuperação suficiente; isso fundamenta a progressão gradual.",
  level: "intermediario", minutes: 9, type: "mecanismo", kicker: K, tags: ["homeostase", "estímulo", "recuperação"],
  hero: "O corpo tende a manter o equilíbrio. Um estímulo que o desafia, seguido de recuperação, faz o organismo se reconstruir um pouco mais capaz. Esse é o princípio que sustenta toda progressão.",
  question: "Por que um treino que nunca muda deixa de gerar resultado com o tempo?",
  concepts: [
    { term: "Homeostase", definition: "Tendência do organismo a manter o equilíbrio interno. O exercício perturba esse equilíbrio, e a recuperação o restabelece num nível um pouco mais capaz." },
    { term: "Estímulo e recuperação", definition: "A adaptação exige um estímulo que desafie a homeostase e recuperação suficiente. Estímulo sem recuperação acumula fadiga; estímulo que não desafia mais deixa de gerar adaptação." },
  ],
  mechanism: {
    title: "O ciclo da adaptação",
    steps: [
      { label: "Estímulo desafia o equilíbrio", detail: "Um treino suficientemente exigente perturba a homeostase." },
      { label: "Recuperação restabelece", detail: "Com descanso e nutrição, o corpo se reconstrói um pouco mais capaz." },
      { label: "O antigo estímulo fica fácil", detail: "O que antes desafiava passa a estar dentro da capacidade e deixa de gerar adaptação." },
      { label: "Nova exigência é necessária", detail: "Progredir o estímulo restabelece o desafio e mantém a adaptação." },
    ],
  },
  apply: "Aplique o princípio: para continuar adaptando, o estímulo precisa desafiar a homeostase e haver recuperação. Por isso a progressão gradual e o descanso são essenciais. Responder à abertura: um treino que nunca muda deixa de desafiar a homeostase; sem novo estímulo, o corpo não tem motivo para se adaptar mais.",
  special: [
    "Iniciantes: mesmo pequenos estímulos desafiam a homeostase; a progressão pode ser simples.",
    "Idosos: respeitar a recuperação, mais lenta, sustenta a adaptação ao longo do tempo.",
    "Estagnação: costuma indicar estímulo insuficiente ou recuperação inadequada; ajuste um dos dois.",
  ],
  mistake: {
    mistake: "Manter o mesmo estímulo indefinidamente esperando progresso contínuo, ou não respeitar a recuperação.",
    instead: "Progrida o estímulo de forma gradual e garanta recuperação. A adaptação exige desafiar a homeostase e dar tempo para o corpo se reconstruir.",
  },
  professionalCase: {
    prompt: "Aluno mantém exatamente o mesmo treino há meses e parou de evoluir, apesar de treinar direito. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Progredir o estímulo (carga, volume ou dificuldade) de forma gradual, garantindo recuperação, para voltar a desafiar a homeostase.", tone: "recomendada", feedback: "Coerente. Sem novo estímulo, o corpo não se adapta mais; progredir gradualmente retoma o desafio." },
      { id: "c2", label: "Manter tudo igual e esperar o resultado voltar.", tone: "cautela", feedback: "Sem novo estímulo, a estagnação tende a continuar; é preciso progredir." },
      { id: "c3", label: "Aumentar tudo de uma vez ao máximo.", tone: "cautela", feedback: "Saltos bruscos comprometem a recuperação; a progressão deve ser gradual." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Para continuar gerando adaptação, o estímulo precisa:", [
      { id: "a", label: "Desafiar a homeostase de forma progressiva, com recuperação suficiente." },
      { id: "b", label: "Permanecer exatamente o mesmo ao longo do tempo." },
    ], "a", "A adaptação exige um estímulo que desafie o equilíbrio e recuperação; o mesmo estímulo deixa de desafiar."),
    q("q2", "verdadeiro-falso", "Estímulo sem recuperação suficiente tende a acumular fadiga em vez de gerar adaptação.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "v", "A adaptação depende de estímulo mais recuperação; sem recuperação, acumula-se fadiga."),
  ],
  uncertainty: "A dose ideal de estímulo e recuperação varia muito entre pessoas e ao longo do tempo. Use o princípio como guia, ajustando pela resposta individual.",
  related: [
    { title: "Resposta aguda e crônica", href: `/aprender/conteudos/${DISC}--aguda-vs-cronica`, type: "conceito" },
    { title: "Sobrecarga progressiva", href: "/aprender/conteudos/forca-sobrecarga-progressiva", type: "conceito" },
    { title: "Especificidade", href: "/aprender/conteudos/planejamento-e-periodizacao--especificidade", type: "conceito" },
  ],
  refs: ["ref-diretriz-forca", "ref-acsm-progressao-2009", "ref-oms-atividade"],
  applyRx: "Para continuar adaptando, progrida o estímulo de forma gradual e garanta recuperação; um treino que nunca muda deixa de desafiar a homeostase e a adaptação estagna.",
});

/* =============== Aprofundamentos: fundamentos da regulação =============== */

const homeostaseControle = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-adaptacoes`, moduleSlug: "adaptacoes",
  slug: `${DISC}--homeostase-e-controle`, title: "Homeostase e controle fisiológico",
  subtitle: "Integração e adaptação", description: "A variável regulada é mantida dentro de uma faixa funcional por sensores, um centro integrador, efetores e feedback, não em um valor rígido.",
  level: "fundamental", minutes: 11, type: "mecanismo", kicker: K, tags: ["homeostase", "feedback", "set point"],
  hero: "Frequência cardíaca, glicemia, temperatura e pressão oscilam o tempo todo. Homeostase não é imobilidade: é a capacidade de detectar desvios e mobilizar respostas que mantêm a variável dentro de uma faixa compatível com a função.",
  question: "Se a temperatura, a pressão e a glicemia variam o tempo todo, o que significa dizer que o corpo está em equilíbrio?",
  concepts: [
    { term: "Homeostase", definition: "Manutenção dinâmica de condições internas compatíveis com a função. A variável regulada oscila dentro de uma faixa funcional, e o organismo corrige desvios relevantes conforme o contexto." },
    { term: "Circuito de controle", definition: "Estímulo que desvia a variável, sensor que detecta, centro integrador que compara ao set point e efetor que produz a resposta. O feedback negativo reduz o desvio; o feedforward antecipa a demanda." },
  ],
  figure: { id: "homeostase-circuito" },
  apply: "Use o raciocínio homeostático para ler qualquer variável do aluno: identifique a variável regulada, quem a detecta, qual é a resposta e a consequência funcional. Responder à abertura: o corpo não fica imóvel; ele mantém cada variável dentro de uma faixa, ajustando continuamente por feedback conforme postura, horário, nutrição e atividade.",
  special: [
    "Antes do esforço, sinais centrais já elevam ventilação e frequência cardíaca (feedforward), antecipando a demanda.",
    "Frequência cardíaca, pressão, glicemia, temperatura e hidratação são variáveis reguladas: leia-as sempre no contexto.",
    "Exposição prolongada ou desalinhada aumenta a carga alostática; o corpo prioriza, não mantém tudo perfeitamente estável.",
  ],
  mistake: {
    mistake: "Tratar valores fisiológicos como números fixos e iguais para todos, sem considerar contexto, horário e estado do aluno.",
    instead: "Interprete cada variável como uma faixa funcional regulada. O mesmo valor pode ter significados diferentes conforme o momento, a postura, a nutrição e o esforço.",
  },
  professionalCase: {
    prompt: "Aluno mede a frequência de repouso alta em um dia estressado e se assusta. Como raciocinar?",
    choices: [
      { id: "c1", label: "Explicar que a FC é uma variável regulada que oscila com estresse, sono, cafeína e horário; interpretar a tendência ao longo dos dias, não um valor isolado.", tone: "recomendada", feedback: "Coerente. O raciocínio homeostático lê a variável no contexto e observa a tendência, evitando conclusões por um dado isolado." },
      { id: "c2", label: "Concluir doença cardíaca a partir de uma única medida.", tone: "cautela", feedback: "Uma medida isolada não diagnostica; diante de sinais de alerta, encaminhe ao profissional de saúde." },
      { id: "c3", label: "Ignorar completamente o dado.", tone: "aceitavel", feedback: "O dado é útil como tendência; o exagero é interpretá-lo isoladamente." },
    ],
  },
  quiz: [
    q("q1", "verdadeiro-falso", "Homeostase significa que a variável regulada permanece exatamente no mesmo valor o tempo todo.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "f", "Homeostase é estabilidade dinâmica: a variável oscila dentro de uma faixa funcional, corrigida por feedback."),
    q("q2", "conduta", "Em um circuito homeostático, o feedback negativo:", [
      { id: "a", label: "Reduz o desvio da variável regulada, reaproximando-a da faixa funcional." },
      { id: "b", label: "Amplifica o desvio até um valor máximo." },
    ], "a", "O feedback negativo reduz o erro entre o estado atual e o desejado; o positivo amplifica (ex.: coagulação, parto)."),
  ],
  uncertainty: "Set points podem variar com o contexto (febre, treino, aclimatação). Use a lógica do circuito como guia, sem tratar faixas como valores absolutos.",
  related: [
    { title: "Transporte pela membrana", href: `/aprender/conteudos/${DISC}--transporte-membrana`, type: "conceito" },
    { title: "Homeostase e estímulo (treino)", href: `/aprender/conteudos/${DISC}--homeostase`, type: "mecanismo" },
    { title: "Integração do movimento", href: `/aprender/conteudos/${DISC}--integracao-movimento`, type: "mecanismo" },
  ],
  refs: ["ref-billman-homeostase-2020", "ref-silverthorn-2026", "ref-guyton-2025"],
  applyRx: "Leia cada variável (FC, pressão, glicemia, temperatura, hidratação) como uma faixa funcional regulada; observe a tendência no contexto e encaminhe diante de sinais de alerta.",
});

const transporteMembrana = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-sistema-nervoso`, moduleSlug: "sistema-nervoso",
  slug: `${DISC}--transporte-membrana`, title: "Transporte pela membrana: como a célula troca com o meio",
  subtitle: "Sistema nervoso", description: "Difusão, osmose, carreadores e bombas determinam seletividade e direção do transporte; base para hidratação, volume e excitabilidade.",
  level: "fundamental", minutes: 10, type: "conceito", kicker: K, tags: ["membrana", "difusão", "bomba de sódio e potássio"],
  hero: "A membrana separa a célula do meio e escolhe o que entra e o que sai. Difusão, osmose, carreadores e bombas explicam desde a hidratação até a excitabilidade que permite a contração muscular.",
  question: "Por que a bomba de sódio e potássio precisa gastar energia o tempo todo, mesmo com a célula em repouso?",
  concepts: [
    { term: "Gradiente eletroquímico", definition: "Diferença de concentração e de carga de um íon entre os dois lados da membrana. Ele sustenta volume celular, transporte acoplado e sinalização elétrica." },
    { term: "Transporte ativo", definition: "Movimento de solutos contra o gradiente, com gasto de energia. A bomba Na⁺/K⁺-ATPase mantém sódio baixo e potássio alto dentro da célula, base do potencial de repouso." },
    { term: "Quantidade, fluxo e capacidade", title: "Conceito 3: as três leituras de qualquer transporte", definition: "Quantidade é massa ou conteúdo total, e pode ficar estável enquanto a concentração muda por alteração de volume. Fluxo é quantidade transferida por unidade de tempo, e depende de gradiente, resistência e capacidade. Capacidade é um limite observado em um protocolo específico, não uma propriedade absoluta fora do teste. Confundir as três é a origem de boa parte das interpretações erradas." },
  ],
  figure: { id: "transporte-membrana" },
  mechanism: {
    title: "O mecanismo em sequência causal",
    steps: [
      { label: "Existe um gradiente a ser explorado ou vencido", detail: "A distribuição desigual de íons e a permeabilidade seletiva criam a força eletroquímica. É ela que define se o soluto tende a entrar ou sair, antes de qualquer proteína entrar em cena." },
      { label: "A barreira decide quem passa", detail: "Bicamada, canais e carreadores impõem seletividade. O fluxo depende de gradiente, resistência e capacidade: mais gradiente com o caminho fechado não move nada." },
      { label: "A bomba paga a conta continuamente", detail: "A Na+/K+-ATPase repõe o que vaza pelos canais. Por isso o gasto existe mesmo em repouso: manter gradiente é trabalho contínuo, não um evento." },
      { label: "A água acompanha o soluto efetivo", detail: "A osmose segue a osmolaridade efetiva e a permeabilidade da barreira. Daí saem volume celular, hidratação e a leitura correta de sódio, que reflete a relação entre soluto e água, não o estoque total." },
    ],
  },
  comparison: {
    title: "A favor do gradiente ou contra o gradiente",
    leftTitle: "A favor do gradiente (passivo)",
    rightTitle: "Contra o gradiente (ativo)",
    leftItems: ["Difusão simples: O₂ e CO₂ atravessam a bicamada", "Canal: íons passam por poros seletivos", "Difusão facilitada: glicose via carreador GLUT", "Sem gasto direto de ATP"],
    rightItems: ["Bomba Na⁺/K⁺-ATPase usa ATP", "Cotransporte Na⁺/glicose usa o gradiente do sódio", "Mantém composições iônicas diferentes", "Essencial mesmo em repouso"],
    note: "Osmose é o movimento de água conforme a osmolaridade efetiva e a permeabilidade da barreira, não simplesmente porque a água segue o sal.",
  },
  apply: "Use esses princípios para explicar hidratação, edema e reposição de eletrólitos sem simplificações: diferencie concentração, osmolaridade, tonicidade e volume dos compartimentos. Responder à abertura: a bomba gasta energia continuamente porque os íons vazam de volta pelos canais; sem ela, os gradientes se dissipariam e a célula perderia volume e excitabilidade.",
  special: [
    "Hidratação e sudorese só fazem sentido quando se separa osmolaridade de volume de compartimentos.",
    "A distribuição de Na⁺, K⁺ e água entre plasma, interstício e células é a base da homeostase hidroeletrolítica.",
    "Limite didático: protocolos de reposição e cálculo de taxa de suor pertencem à Fisiologia do Exercício e à Nutrição.",
  ],
  mistake: {
    mistake: "Explicar deslocamentos de água dizendo apenas que 'a água segue o sal'.",
    instead: "A água responde à osmolaridade efetiva e à permeabilidade da barreira. Nem todo soluto exerce o mesmo efeito osmótico em todos os compartimentos.",
  },
  professionalCase: {
    prompt: "Aluno pergunta se tomar muita água pura durante um esforço longo e com muito suor é sempre o melhor. Como orientar em termos de princípio?",
    choices: [
      { id: "c1", label: "Explicar que volume e osmolaridade são coisas diferentes: repor só água pura em grandes perdas com suor pode diluir o sódio; orientar de forma geral e encaminhar para nutrição quando necessário.", tone: "recomendada", feedback: "Coerente com o princípio. A reposição envolve água e eletrólitos; protocolos específicos são da nutrição esportiva." },
      { id: "c2", label: "Afirmar que basta beber o máximo de água possível sempre.", tone: "cautela", feedback: "Em grandes perdas, repor só água pode reduzir a osmolaridade; a orientação precisa considerar eletrólitos." },
      { id: "c3", label: "Dizer que hidratação não importa no exercício.", tone: "cautela", feedback: "A hidratação importa; o cuidado é não simplificar volume e osmolaridade." },
    ],
  },
  quiz: [
    q("q1", "verdadeiro-falso", "A bomba de sódio e potássio consome ATP mesmo com a célula em repouso.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "v", "Os íons vazam de volta pelos canais; a bomba gasta energia continuamente para manter os gradientes."),
    q("q2", "variavel", "A glicose entra na célula a favor do gradiente por meio de:", [
      { id: "a", label: "Carreador (difusão facilitada por GLUT)." },
      { id: "b", label: "Bomba que gasta ATP contra o gradiente." },
    ], "a", "GLUT é um carreador que transporta glicose a favor do gradiente, sem gasto direto de ATP."),
  ],
  uncertainty: "O efeito osmótico de cada soluto depende do compartimento e da permeabilidade. Trate hidratação como princípio geral e encaminhe a nutrição para protocolos.",
  related: [
    { title: "Homeostase e controle", href: `/aprender/conteudos/${DISC}--homeostase-e-controle`, type: "mecanismo" },
    { title: "Bioeletricidade", href: `/aprender/conteudos/${DISC}--bioeletricidade`, type: "mecanismo" },
    { title: "Rim e néfron", href: `/aprender/conteudos/${DISC}--sistema-renal`, type: "mecanismo" },
  ],
  refs: ["ref-boron-2016", "ref-silverthorn-2026", "ref-guyton-2025"],
  applyRx: "Explique hidratação e eletrólitos diferenciando concentração, osmolaridade, tonicidade e volume; oriente de forma geral e encaminhe protocolos específicos à nutrição esportiva.",
});

const bioeletricidade = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-sistema-nervoso`, moduleSlug: "sistema-nervoso",
  slug: `${DISC}--bioeletricidade`, title: "Bioeletricidade: o potencial de ação",
  subtitle: "Sistema nervoso", description: "Gradientes iônicos viram sinais rápidos: o potencial de ação é um evento tudo-ou-nada que inicia o comando motor.",
  level: "intermediario", minutes: 10, type: "mecanismo", kicker: K, tags: ["potencial de ação", "limiar", "excitabilidade"],
  hero: "Toda contração voluntária começa como eletricidade. O potencial de ação converte gradientes iônicos em um sinal rápido e organizado, base para entender comando motor, recrutamento e fadiga.",
  question: "Por que um estímulo um pouco mais forte não gera um potencial de ação 'maior', e sim mais potenciais?",
  concepts: [
    { term: "Potencial de repouso", definition: "Interior da célula negativo, mantido pela maior permeabilidade ao potássio e pela bomba Na⁺/K⁺. É o ponto de partida para a excitabilidade." },
    { term: "Potencial de ação", definition: "Evento regenerativo tudo-ou-nada: ao atingir o limiar, canais de sódio abrem (despolarização); depois inativam e o potássio sai (repolarização). Períodos refratários garantem direção e limitam a frequência." },
  ],
  figure: { id: "potencial-de-acao" },
  mechanism: {
    title: "O mecanismo em sequência causal (núcleo 1 do capítulo 01)",
    steps: [
      { label: "Gradientes de Na+, K+, Cl- e Ca2+", detail: "A voltagem de membrana resulta da distribuição desigual de íons e da permeabilidade seletiva. A Na+/K+-ATPase mantém os gradientes; canais de vazamento definem o repouso. A força que move cada íon é eletroquímica: força = Vm menos o potencial de equilíbrio do íon." },
      { label: "Abertura sequencial de canais", detail: "Canais dependentes de voltagem determinam a resposta instantânea. Ao atingir o limiar, o sódio abre e a despolarização se autoalimenta; é o ponto sem volta do evento tudo-ou-nada." },
      { label: "Despolarização, repolarização e refratariedade", detail: "O sódio inativa e o potássio sai, repolarizando. Os períodos refratários garantem direção da propagação e impõem um teto à frequência de disparo, que é justamente onde a informação é codificada." },
      { label: "Propagação regenerativa pelo axônio", detail: "O potencial se regenera ao longo do axônio, chegando ao terminal com a mesma amplitude. Por isso a intensidade nunca é codificada pelo tamanho do sinal, e sim pela frequência e pelo número de fibras recrutadas." },
    ],
  },
  timeline: {
    title: "Em que tempo cada coisa acontece",
    items: [
      { time: "Milissegundos", title: "O evento", detail: "Despolarização, repolarização e refratariedade acontecem em milissegundos, fibra a fibra." },
      { time: "Segundos", title: "A força", detail: "Recrutamento e frequência de disparo somam-se e produzem a força que se vê no movimento." },
      { time: "Minutos", title: "O contexto", detail: "Temperatura, eletrólitos, perfusão e fármacos alteram a excitabilidade e o tempo de reação durante o exercício." },
      { time: "Semanas", title: "A adaptação", detail: "A prática modifica a eficiência das redes motoras: economia neural e melhor coordenação, sem que a fibra mude a amplitude do seu potencial." },
    ],
  },
  apply: "Use o conceito para interpretar comando motor e fadiga sem antecipar toda a fisiologia do exercício: a força é graduada por quantos neurônios disparam e com que frequência, não por potenciais 'maiores'. Responder à abertura: o potencial de ação é tudo-ou-nada; um estímulo mais forte, acima do limiar, aumenta a frequência de disparos, não a amplitude de cada um.",
  special: [
    "Como medir: potencial de membrana, limiar, velocidade de condução e frequência de disparo exigem protocolo e contexto; fora disso, não significam muito.",
    "Limiar, recrutamento e frequência de disparo são pré-requisitos para entender controle motor e eletromiografia.",
    "Temperatura, eletrólitos, perfusão e fármacos podem alterar a excitabilidade e o tempo de reação durante o exercício.",
    "A comunicação entre células pode ser sináptica, endócrina, parácrina ou elétrica, com alcances e velocidades diferentes.",
  ],
  mistake: {
    mistake: "Imaginar que um estímulo mais intenso gera um potencial de ação de maior amplitude na mesma fibra.",
    instead: "O potencial de ação é tudo-ou-nada. A intensidade do sinal é codificada pela frequência de disparos e pelo número de unidades recrutadas, não pela amplitude de cada potencial.",
  },
  professionalCase: {
    prompt: "Ao ensinar técnica, um aluno acha que 'pensar mais forte' aumenta o sinal elétrico de cada fibra. Como corrigir o conceito?",
    choices: [
      { id: "c1", label: "Explicar que a força cresce por recrutar mais unidades motoras e aumentar a frequência de disparo, não por potenciais 'maiores' na mesma fibra.", tone: "recomendada", feedback: "Coerente. A graduação da força é por recrutamento e frequência, base do controle motor." },
      { id: "c2", label: "Concordar que cada fibra gera um sinal proporcional à vontade.", tone: "cautela", feedback: "O potencial é tudo-ou-nada; a fibra não gradua a amplitude do próprio potencial." },
      { id: "c3", label: "Dizer que eletricidade não tem relação com força.", tone: "cautela", feedback: "A contração começa como atividade elétrica; a relação existe, o detalhe é como a força é graduada." },
    ],
  },
  quiz: [
    q("q1", "verdadeiro-falso", "O potencial de ação é um evento tudo-ou-nada.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "v", "Atingido o limiar, o potencial dispara de forma completa; abaixo do limiar, não dispara."),
    q("q2", "variavel", "A fase ascendente (despolarização) do potencial de ação deve-se principalmente à entrada de:", [
      { id: "a", label: "Sódio (Na⁺)." }, { id: "b", label: "Potássio (K⁺)." },
    ], "a", "A entrada de Na⁺ despolariza; a saída de K⁺ repolariza a membrana."),
  ],
  uncertainty: "A relação entre atividade elétrica, recrutamento e força é a base; a eletromiografia sem contexto mecânico não mede força diretamente.",
  related: [
    { title: "Transporte pela membrana", href: `/aprender/conteudos/${DISC}--transporte-membrana`, type: "conceito" },
    { title: "Do comando à força (sarcômero)", href: `/aprender/conteudos/${DISC}--musculo-esqueletico`, type: "mecanismo" },
    { title: "Unidade motora", href: "/aprender/conteudos/neurofisiologia-do-movimento--unidade-motora", type: "mecanismo" },
  ],
  refs: ["ref-boron-2016", "ref-ganong-2025", "ref-guyton-2025"],
  applyRx: "Explique a graduação da força por recrutamento e frequência de disparo, não por potenciais maiores; use limiar e excitabilidade como base para técnica e fadiga.",
});

/* =============== Aprofundamentos: controle endócrino =============== */

const endocrino = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-controle-endocrino`, moduleSlug: "controle-endocrino",
  slug: `${DISC}--sistema-endocrino`, title: "Sistema endócrino: hormônios como rede",
  subtitle: "Controle e integração hormonal", description: "Eixos hipotálamo-hipófise-glândula e feedback negativo coordenam metabolismo, estresse e água; nenhum hormônio age sozinho.",
  level: "intermediario", minutes: 11, type: "conceito", kicker: K, tags: ["hormônios", "eixo endócrino", "feedback"],
  hero: "Hormônios coordenam metabolismo, crescimento, estresse e balanço de água como uma rede regulada por feedback. Entender isso evita explicações populares que atribuem desempenho ou composição corporal a um único hormônio.",
  question: "Por que dizer que um hormônio isolado 'constrói' ou 'destrói' músculo é uma explicação incompleta?",
  concepts: [
    { term: "Eixo endócrino", definition: "Hipotálamo libera um hormônio que estimula a hipófise, que estimula uma glândula-alvo. O hormônio final produz efeito e, por feedback negativo, freia hipotálamo e hipófise." },
    { term: "Determinantes do efeito", definition: "A resposta depende de concentração livre, proteína transportadora, ritmo de secreção, meia-vida e sensibilidade do receptor. Densidade de receptores e estado energético modulam o efeito." },
  ],
  figure: { id: "eixo-endocrino" },
  apply: "Interprete o sistema endócrino como rede: insulina e glucagon regulam substratos, catecolaminas e cortisol organizam a resposta ao estresse, ADH e aldosterona ajustam água e sódio. Responder à abertura: rótulos como 'anabólico' e 'catabólico' são incompletos porque o efeito depende de dose, tempo, tecido, receptor e disponibilidade de substrato, além da interação com outros sinais.",
  special: [
    "Cortisol e catecolaminas mobilizam energia no estresse agudo; exposição prolongada aumenta a carga alostática.",
    "GH, insulina, hormônios tireoidianos e sexuais atuam em conjunto sobre metabolismo e tecidos, nunca isolados.",
    "Uma dosagem hormonal isolada não descreve toda a função endócrina; interprete no contexto.",
  ],
  mistake: {
    mistake: "Atribuir desempenho, composição corporal ou fadiga a um único hormônio ('é o cortisol', 'é a testosterona').",
    instead: "Pense em rede: dose, tempo, tecido, receptor, substrato e interação entre sinais determinam o efeito. Rótulos isolados enganam.",
  },
  professionalCase: {
    prompt: "Aluno diz que só vai evoluir se 'aumentar a testosterona' e pergunta sobre suplementos hormonais. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Explicar que a resposta é de rede e depende de treino, alimentação, sono e recuperação; orientar dentro da atuação e encaminhar questões hormonais a médico.", tone: "recomendada", feedback: "Coerente e prudente. O efeito hormonal é integrado; conduta hormonal é clínica." },
      { id: "c2", label: "Sugerir manipulação hormonal para acelerar.", tone: "cautela", feedback: "Conduta hormonal é médica; recomendar manipulação foge da atuação do profissional de Educação Física." },
      { id: "c3", label: "Dizer que hormônios não têm nenhuma relação com treino.", tone: "cautela", feedback: "Hormônios participam, mas como rede; o exagero é reduzir tudo a um único hormônio." },
    ],
  },
  quiz: [
    q("q1", "conduta", "A explicação mais correta para o efeito de um hormônio é que ele depende de:", [
      { id: "a", label: "Dose, tempo, tecido, receptor e interação com outros sinais." },
      { id: "b", label: "Apenas a concentração total no sangue." },
    ], "a", "O efeito é multifatorial; a concentração isolada não descreve a função endócrina."),
    q("q2", "verdadeiro-falso", "No feedback negativo de um eixo, o hormônio final reduz a estimulação do hipotálamo e da hipófise.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "v", "O hormônio-alvo freia os níveis acima do eixo, estabilizando o sistema."),
  ],
  uncertainty: "Respostas hormonais ao exercício são transitórias e individuais; não servem como explicação única de resultado. Conduta hormonal é clínica.",
  related: [
    { title: "Vias energéticas", href: `/aprender/conteudos/${DISC}--vias-energeticas`, type: "conceito" },
    { title: "Sono, ritmos e estresse", href: `/aprender/conteudos/${DISC}--integracao-movimento`, type: "mecanismo" },
    { title: "Bioquímica e metabolismo", href: "/aprender/conteudos/bioquimica-metabolismo--sistemas-energeticos", type: "conceito" },
  ],
  refs: ["ref-vander-2023", "ref-costanzo-2026", "ref-endotext-stress-2020"],
  applyRx: "Interprete hormônios como rede regulada por feedback; oriente treino, sono e alimentação, e encaminhe qualquer conduta hormonal ao profissional de saúde.",
});

/* =============== Aprofundamentos: cardiorrespiratório =============== */

const cicloCardiaco = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-sistema-cardiovascular`, moduleSlug: "sistema-cardiovascular",
  slug: `${DISC}--ciclo-cardiaco`, title: "Ciclo cardíaco: pressões e válvulas",
  subtitle: "Sistema cardiovascular", description: "A coordenação entre pressão, válvulas e fluxo explica sístole e diástole; as válvulas abrem por gradiente de pressão, não por contração própria.",
  level: "intermediario", minutes: 10, type: "mecanismo", kicker: K, tags: ["ciclo cardíaco", "sístole", "diástole", "válvulas"],
  hero: "O coração enche e ejeta de forma coordenada. Durante a diástole os ventrículos relaxam e enchem; na sístole elevam a pressão e ejetam. As válvulas apenas seguem os gradientes de pressão.",
  question: "O que faz uma válvula cardíaca abrir ou fechar em cada momento do ciclo?",
  concepts: [
    { term: "Sístole e diástole", definition: "Sístole é a contração e ejeção ventricular; diástole é o relaxamento e enchimento. A sequência elétrica (nó sinoatrial, atrioventricular, His e Purkinje) coordena o enchimento e a ejeção." },
    { term: "Válvulas por gradiente", definition: "As válvulas abrem e fecham conforme a diferença de pressão entre as câmaras e os grandes vasos, não por contração própria. Elas garantem fluxo em sentido único." },
  ],
  figure: { id: "ciclo-cardiaco" },
  apply: "Use as curvas de pressão para entender por que a pressão aórtica se mantém alta na diástole (reservatório elástico) e por que o enchimento depende do retorno venoso. Responder à abertura: a válvula abre quando a pressão a montante supera a a jusante e fecha quando o gradiente se inverte; é a pressão que comanda, não a válvula.",
  special: [
    "Pré-carga (enchimento), contratilidade e pós-carga determinam o volume sistólico.",
    "O barorreflexo ajusta rapidamente frequência, contratilidade e tônus vascular diante de mudanças de pressão.",
    "A bomba muscular e a bomba respiratória favorecem o retorno venoso durante o exercício.",
  ],
  mistake: {
    mistake: "Explicar que as válvulas 'se contraem' para abrir ou fechar.",
    instead: "As válvulas são passivas: seguem os gradientes de pressão. Quem gera pressão é o miocárdio; as válvulas apenas garantem o sentido do fluxo.",
  },
  professionalCase: {
    prompt: "Aluno pergunta por que a pressão arterial não cai a zero entre um batimento e outro. Como explicar em termos fisiológicos?",
    choices: [
      { id: "c1", label: "Explicar que a aorta é elástica e funciona como reservatório: acumula na sístole e devolve na diástole, mantendo a pressão diastólica.", tone: "recomendada", feedback: "Coerente. A complacência aórtica sustenta a pressão entre os batimentos." },
      { id: "c2", label: "Dizer que o coração bate rápido demais para a pressão cair.", tone: "aceitavel", feedback: "A frequência ajuda, mas o mecanismo central é a elasticidade arterial que sustenta a diástole." },
      { id: "c3", label: "Afirmar que a pressão realmente cai a zero.", tone: "cautela", feedback: "A pressão diastólica se mantém acima de zero pela complacência arterial." },
    ],
  },
  quiz: [
    q("q1", "conduta", "O que abre e fecha as válvulas cardíacas?", [
      { id: "a", label: "O gradiente de pressão entre as câmaras e os vasos." },
      { id: "b", label: "A contração das próprias válvulas." },
    ], "a", "As válvulas são passivas e seguem os gradientes de pressão."),
    q("q2", "verdadeiro-falso", "Durante a diástole, os ventrículos relaxam e se enchem.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "v", "Diástole é relaxamento e enchimento; sístole é contração e ejeção."),
  ],
  uncertainty: "As curvas são esquemáticas e variam com frequência, volume e condição. Use-as para o raciocínio, não como valores fixos.",
  related: [
    { title: "Débito cardíaco", href: `/aprender/conteudos/${DISC}--debito-cardiaco`, type: "conceito" },
    { title: "Pressão no exercício", href: `/aprender/conteudos/${DISC}--pressao-no-exercicio`, type: "conceito" },
    { title: "Transporte de gases", href: `/aprender/conteudos/${DISC}--transporte-gases`, type: "mecanismo" },
  ],
  refs: ["ref-guyton-2025", "ref-costanzo-2026", "ref-openstax-ap-2022"],
  applyRx: "Explique sístole e diástole pelas pressões e pelo papel passivo das válvulas; ligue pré-carga, contratilidade e pós-carga ao volume sistólico e ao retorno venoso no esforço.",
});

const transporteGases = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-sistema-respiratorio`, moduleSlug: "sistema-respiratorio",
  slug: `${DISC}--transporte-gases`, title: "Transporte de oxigênio e o efeito Bohr",
  subtitle: "Sistema respiratório", description: "A hemoglobina liga O₂ de forma cooperativa; CO₂, H⁺, temperatura e 2,3-BPG deslocam a curva e ajustam a entrega ao tecido ativo.",
  level: "intermediario", minutes: 10, type: "mecanismo", kicker: K, tags: ["hemoglobina", "efeito Bohr", "transporte de O2"],
  hero: "O sangue não carrega oxigênio de forma passiva. A hemoglobina o libera exatamente onde o tecido mais precisa, porque o próprio metabolismo local desloca a curva de dissociação.",
  question: "Por que o músculo em atividade recebe mais oxigênio da hemoglobina do que um músculo em repouso, para a mesma pressão de O₂?",
  concepts: [
    { term: "Curva de dissociação em S", definition: "A ligação do O₂ à hemoglobina é cooperativa, gerando uma curva sigmoide. No pulmão (PO₂ alta) a saturação é alta; no tecido (PO₂ mais baixa) a hemoglobina libera oxigênio." },
    { term: "Efeito Bohr", definition: "Aumento de CO₂, H⁺ (queda do pH), temperatura e 2,3-BPG desloca a curva à direita, reduzindo a afinidade e liberando mais O₂ justamente nos tecidos metabolicamente ativos." },
  ],
  figure: { id: "dissociacao-o2" },
  apply: "Use o efeito Bohr para explicar por que o exercício melhora a entrega de oxigênio ao músculo ativo: o próprio metabolismo local cria as condições que liberam O₂. Responder à abertura: o músculo ativo produz mais CO₂, H⁺ e calor, que deslocam a curva à direita e liberam mais oxigênio na mesma pressão parcial.",
  special: [
    "A maior parte do CO₂ é transportada como bicarbonato, após conversão pela anidrase carbônica.",
    "Em pessoas saudáveis ao nível do mar, a saturação de O₂ costuma ser preservada no esforço; ela não é a melhor medida de intensidade.",
    "Sensação de falta de ar depende de ventilação, CO₂, trabalho dos músculos respiratórios e expectativa, não só da saturação.",
  ],
  mistake: {
    mistake: "Achar que uma queda de desempenho no esforço reflete 'falta de oxigênio no sangue' em pessoa saudável.",
    instead: "Em saudáveis ao nível do mar, a saturação costuma ser mantida. A sensação de esforço respiratório envolve CO₂, ventilação e trabalho muscular, não apenas O₂.",
  },
  professionalCase: {
    prompt: "Aluno saudável relata falta de ar ao correr e teme estar com pouca oxigenação. Como raciocinar?",
    choices: [
      { id: "c1", label: "Explicar que, em pessoa saudável ao nível do mar, a saturação costuma ser mantida; a falta de ar reflete ventilação e CO₂, e a intensidade pode ser guiada pela fala.", tone: "recomendada", feedback: "Coerente. A sensação respiratória não equivale a baixa saturação em saudáveis." },
      { id: "c2", label: "Concluir que há doença pulmonar só pela falta de ar no esforço.", tone: "cautela", feedback: "Falta de ar no esforço é comum; diante de sinais de alerta, encaminhe, sem diagnosticar." },
      { id: "c3", label: "Mandar parar toda atividade por precaução.", tone: "cautela", feedback: "Sem sinais de alerta, ajustar a intensidade costuma bastar; parar tudo é desproporcional." },
    ],
  },
  quiz: [
    q("q1", "variavel", "O desvio da curva de dissociação à direita (efeito Bohr) é favorecido por:", [
      { id: "a", label: "Aumento de CO₂, H⁺, temperatura e 2,3-BPG." },
      { id: "b", label: "Queda de CO₂ e de temperatura." },
    ], "a", "As condições do tecido ativo deslocam a curva à direita e liberam mais O₂."),
    q("q2", "verdadeiro-falso", "A maior parte do CO₂ é transportada no sangue como bicarbonato.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "v", "A anidrase carbônica converte CO₂ em bicarbonato, a principal forma de transporte."),
  ],
  uncertainty: "A curva é influenciada por múltiplos fatores individuais. Use-a para o raciocínio de entrega de O₂, não como número fixo.",
  related: [
    { title: "Ventilação e esforço", href: `/aprender/conteudos/${DISC}--ventilacao`, type: "conceito" },
    { title: "Consumo de oxigênio", href: `/aprender/conteudos/${DISC}--consumo-oxigenio`, type: "mecanismo" },
    { title: "O que limita o VO2máx", href: "/aprender/conteudos/fisiologia-do-exercicio--vo2max-limitantes", type: "mecanismo" },
  ],
  refs: ["ref-statpearls-lung-2023", "ref-guyton-2025", "ref-kenney-2024"],
  applyRx: "Explique a entrega de O₂ pelo efeito Bohr e lembre que, em saudáveis, a saturação não é medida de intensidade; guie a intensidade pela fala e pela percepção de esforço.",
});

/* =============== Aprofundamentos: tecidos do movimento =============== */

const musculo = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-tecidos-movimento`, moduleSlug: "tecidos-do-movimento",
  slug: `${DISC}--musculo-esqueletico`, title: "Do comando à força: o sarcômero",
  subtitle: "Tecidos do movimento", description: "A força emerge da interação entre ativação neural, cálcio, pontes cruzadas e propriedades mecânicas; tamanho do músculo não é tudo.",
  level: "intermediario", minutes: 11, type: "mecanismo", kicker: K, tags: ["sarcômero", "pontes cruzadas", "força"],
  hero: "A força não vem só do tamanho do músculo. Ela nasce no sarcômero: o cálcio libera a actina, a miosina puxa o filamento e o ATP permite recomeçar o ciclo. Arquitetura, comprimento e ativação também decidem a força externa.",
  question: "Por que dois alunos com músculos de tamanho parecido podem produzir forças bem diferentes?",
  concepts: [
    { term: "Acoplamento excitação-contração", definition: "O potencial de ação percorre o sarcolema e os túbulos T; o cálcio é liberado do retículo sarcoplasmático, liga-se à troponina, desloca a tropomiosina e libera os sítios da actina para a miosina." },
    { term: "Ciclo de pontes cruzadas", definition: "A miosina liga a actina, executa o golpe de força que puxa o filamento e, com um novo ATP, se desliga. A SERCA recaptura o cálcio e favorece o relaxamento." },
  ],
  figure: { id: "sarcomero-pontes" },
  apply: "Explique a força além do tamanho: arquitetura muscular, comprimento (relação comprimento-tensão), velocidade (relação força-velocidade), ativação neural, alavancas e propriedades do tendão. Responder à abertura: dois músculos de tamanho parecido podem diferir em arquitetura, ativação neural, comprimento operacional e alavancas, produzindo forças externas diferentes.",
  special: [
    "Ações excêntricas podem suportar forças elevadas com menor custo energético relativo que as concêntricas.",
    "Tipos de fibra (I, IIa, IIx) formam um continuum plástico; não devem rotular pessoas de forma determinista.",
    "Este é o núcleo fisiológico para força, potência e fadiga; métodos de treino pertencem às disciplinas aplicadas.",
  ],
  mistake: {
    mistake: "Reduzir a força externa apenas ao tamanho (área) do músculo.",
    instead: "A força depende também de arquitetura, comprimento, velocidade, ativação neural, alavancas e do tendão. Tamanho é um fator, não o único.",
  },
  professionalCase: {
    prompt: "Aluno iniciante ganha força rápido nas primeiras semanas quase sem mudar o tamanho do músculo. Como explicar?",
    choices: [
      { id: "c1", label: "Explicar que os ganhos iniciais são muito neurais (mais recrutamento e coordenação); a hipertrofia aparece de forma mais consistente ao longo do tempo.", tone: "recomendada", feedback: "Coerente. Adaptação neural predomina no início; hipertrofia se consolida depois." },
      { id: "c2", label: "Dizer que sem hipertrofia não há ganho de força.", tone: "cautela", feedback: "Ganho de força inicial é bastante neural, mesmo com pouca mudança de tamanho." },
      { id: "c3", label: "Concluir que o aluno está exagerando.", tone: "aceitavel", feedback: "O ganho é real e explicado pela adaptação neural; vale educar sobre isso." },
    ],
  },
  quiz: [
    q("q1", "variavel", "Qual é o papel do cálcio na contração muscular?", [
      { id: "a", label: "Liga-se à troponina, desloca a tropomiosina e libera os sítios da actina." },
      { id: "b", label: "Fornece diretamente a energia do golpe de força." },
    ], "a", "O cálcio libera os sítios de ligação; o ATP energiza o ciclo de pontes."),
    q("q2", "verdadeiro-falso", "A força externa depende apenas do tamanho (área) do músculo.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "f", "Também dependem arquitetura, comprimento, velocidade, ativação neural, alavancas e tendão."),
  ],
  uncertainty: "Tipos de fibra existem num continuum plástico; classificações não devem rotular pessoas. Métodos de hipertrofia e força pertencem às disciplinas aplicadas.",
  related: [
    { title: "Bioeletricidade", href: `/aprender/conteudos/${DISC}--bioeletricidade`, type: "mecanismo" },
    { title: "Comprimento, tensão e força", href: `/aprender/conteudos/${DISC}--relacao-forca`, type: "mecanismo" },
    { title: "Princípio do tamanho", href: "/aprender/conteudos/neurofisiologia-do-movimento--recrutamento", type: "mecanismo" },
  ],
  refs: ["ref-lieber-musculo-2010", "ref-guyton-2025", "ref-kenney-2024"],
  applyRx: "Explique a força além do tamanho (arquitetura, comprimento, velocidade, ativação neural, alavancas e tendão) e diferencie ganhos neurais iniciais da hipertrofia que se consolida no tempo.",
});

const relacaoForca = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-tecidos-movimento`, moduleSlug: "tecidos-do-movimento",
  slug: `${DISC}--relacao-forca`, title: "Comprimento, tensão e velocidade",
  subtitle: "Tecidos do movimento", description: "A tensão que o músculo produz depende do comprimento (sobreposição dos filamentos) e da velocidade; por isso a força muda ao longo da amplitude.",
  level: "intermediario", minutes: 9, type: "mecanismo", kicker: K, tags: ["comprimento-tensão", "força-velocidade", "amplitude"],
  hero: "O mesmo músculo não produz a mesma força em toda a amplitude. Perto do comprimento ótimo, a sobreposição entre actina e miosina é ideal; muito curto ou muito longo, a força ativa cai.",
  question: "Por que um exercício costuma parecer mais difícil em certos pontos da amplitude do que em outros?",
  concepts: [
    { term: "Relação comprimento-tensão", definition: "A tensão ativa depende da sobreposição entre actina e miosina. Há um comprimento ótimo; muito curto ou muito longo, menos pontes cruzadas úteis se formam e a força ativa diminui." },
    { term: "Componente passivo e força-velocidade", definition: "Elementos elásticos (como a titina) contribuem mais quando o músculo é alongado. Na relação força-velocidade, a força concêntrica cai com o aumento da velocidade, enquanto ações excêntricas suportam forças altas." },
  ],
  figure: { id: "comprimento-tensao" },
  apply: "Use a relação comprimento-tensão para entender pontos de menor força (sticking points) e a escolha de amplitude, sem transformar isso em regra rígida. Responder à abertura: o exercício parece mais difícil onde a sobreposição dos filamentos e as alavancas produzem menor força ativa naquele ângulo.",
  special: [
    "A curva total (ativa mais passiva) explica por que músculos alongados ainda produzem tensão pela porção passiva.",
    "Ações excêntricas toleram cargas altas com menor custo energético relativo; isso tem implicações para o treino.",
    "Amplitude ideal depende do objetivo, da articulação e da tolerância, não de uma regra única.",
  ],
  mistake: {
    mistake: "Assumir que o músculo produz a mesma força em qualquer ponto da amplitude.",
    instead: "A força ativa varia com o comprimento e a velocidade. Há um comprimento ótimo, e a porção passiva soma tensão nos alongamentos.",
  },
  professionalCase: {
    prompt: "Aluno trava sempre no mesmo ponto do agachamento e acha que 'está fraco'. Como raciocinar em termos fisiológicos?",
    choices: [
      { id: "c1", label: "Explicar que a força varia ao longo da amplitude (comprimento-tensão e alavancas); o ponto de menor força é esperado e pode ser trabalhado com técnica e progressão.", tone: "recomendada", feedback: "Coerente. O sticking point reflete a mecânica muscular e articular, não simples 'fraqueza'." },
      { id: "c2", label: "Concluir que o músculo está atrofiado.", tone: "cautela", feedback: "O ponto de menor força é normal na curva; não indica atrofia por si só." },
      { id: "c3", label: "Mandar aumentar muito a carga para 'forçar a passagem'.", tone: "cautela", feedback: "Aumentar a carga no ponto mais fraco tende a piorar a técnica; progrida com critério." },
    ],
  },
  quiz: [
    q("q1", "verdadeiro-falso", "O músculo produz a mesma força ativa em qualquer comprimento.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "f", "A força ativa depende da sobreposição dos filamentos; há um comprimento ótimo, e cai nos extremos."),
    q("q2", "variavel", "Na relação força-velocidade, a força concêntrica tende a:", [
      { id: "a", label: "Cair conforme a velocidade de encurtamento aumenta." },
      { id: "b", label: "Aumentar conforme a velocidade de encurtamento aumenta." },
    ], "a", "A força concêntrica diminui com a velocidade; ações excêntricas suportam forças elevadas."),
  ],
  uncertainty: "As curvas são esquemáticas e variam com a arquitetura e a articulação. Use-as como raciocínio, não como regra fixa de amplitude.",
  related: [
    { title: "Do comando à força (sarcômero)", href: `/aprender/conteudos/${DISC}--musculo-esqueletico`, type: "mecanismo" },
    { title: "Vantagem mecânica", href: "/aprender/conteudos/cinesiologia--vantagem-mecanica", type: "mecanismo" },
    { title: "Sobrecarga progressiva", href: "/aprender/conteudos/forca-sobrecarga-progressiva", type: "conceito" },
  ],
  refs: ["ref-lieber-musculo-2010", "ref-guyton-2025", "ref-kenney-2024"],
  applyRx: "Explique variações de força ao longo da amplitude pela relação comprimento-tensão e força-velocidade; escolha a amplitude por objetivo e tolerância, não por regra fixa.",
});

/* =============== Aprofundamentos: metabolismo e excreção =============== */

const viasEnergeticas = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-sistema-digestorio`, moduleSlug: "sistema-digestorio",
  slug: `${DISC}--vias-energeticas`, title: "Vias energéticas: como o corpo faz ATP",
  subtitle: "Sistema digestório e hepatobiliar", description: "Carboidratos, gorduras e proteínas convergem para a produção de ATP; aeróbio e anaeróbio descrevem processos que operam juntos, não exercícios opostos.",
  level: "intermediario", minutes: 11, type: "conceito", kicker: K, tags: ["ATP", "glicólise", "fosforilação oxidativa"],
  hero: "Toda contração gasta ATP. Glicólise, beta-oxidação, ciclo de Krebs e fosforilação oxidativa convergem para repor essa energia. Entender isso derruba o mito de que 'aeróbio' e 'anaeróbio' são exercícios opostos.",
  question: "Por que dizer que um exercício é 'só aeróbio' ou 'só anaeróbio' é uma simplificação enganosa?",
  concepts: [
    { term: "ATP como moeda de energia", definition: "O ATP conecta reações que liberam energia a processos que a consomem (transporte ativo, síntese, contração). A maior parte do ATP aeróbio vem da fosforilação oxidativa." },
    { term: "Vias que convergem", definition: "A glicólise ocorre no citosol; beta-oxidação, ciclo de Krebs e fosforilação oxidativa, na mitocôndria. Acetil-CoA é o ponto de convergência dos substratos." },
  ],
  figure: { id: "vias-energeticas" },
  apply: "Use as vias para orientar a progressão sem rótulos rígidos: a contribuição relativa muda com intensidade, disponibilidade de substrato, oxigênio, duração e estado de treino. Responder à abertura: as vias operam simultaneamente; o que muda é a contribuição relativa. Um exercício nunca é 'puramente' aeróbio ou anaeróbio.",
  special: [
    "Em alta intensidade e curta duração, cresce a contribuição glicolítica; em baixa intensidade e longa duração, a oxidativa.",
    "O fígado mantém a glicemia por glicogenólise e gliconeogênese conforme a demanda.",
    "Método de treino não é o mesmo que via metabólica; 'aeróbio' descreve um processo, não uma categoria de exercício.",
  ],
  mistake: {
    mistake: "Afirmar que 'aeróbio usa só gordura' e 'anaeróbio usa só glicose', como se fossem exclusivos.",
    instead: "As vias funcionam juntas. O que muda é a contribuição relativa, condicionada por intensidade, substrato, oxigênio, duração e treino.",
  },
  professionalCase: {
    prompt: "Aluno quer 'entrar na zona de queima de gordura' e evitar qualquer intensidade mais alta. Como orientar em termos fisiológicos?",
    choices: [
      { id: "c1", label: "Explicar que o gasto total e o contexto importam mais que uma 'zona' fixa; combinar intensidades conforme objetivo e tolerância, sem rótulos rígidos.", tone: "recomendada", feedback: "Coerente. As vias operam juntas; o resultado depende do gasto total e da adesão, não de uma zona mágica." },
      { id: "c2", label: "Prescrever apenas intensidade muito baixa por ser 'a única que queima gordura'.", tone: "cautela", feedback: "As vias não são exclusivas; restringir a uma zona limita o resultado sem base fisiológica sólida." },
      { id: "c3", label: "Dizer que intensidade não faz diferença nenhuma.", tone: "aceitavel", feedback: "A intensidade altera a contribuição relativa; o exagero é tratar zonas como categorias absolutas." },
    ],
  },
  quiz: [
    q("q1", "verdadeiro-falso", "Vias aeróbias e anaeróbias operam simultaneamente, mudando a contribuição relativa.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "v", "As vias coexistem; intensidade, substrato, oxigênio e duração mudam a proporção."),
    q("q2", "variavel", "A maior parte do ATP em condições aeróbias é produzida na:", [
      { id: "a", label: "Fosforilação oxidativa (mitocôndria)." },
      { id: "b", label: "Glicólise (citosol)." },
    ], "a", "A fosforilação oxidativa gera a maior parte do ATP aeróbio; a glicólise gera piruvato, ATP e NADH no citosol."),
  ],
  uncertainty: "A partição de substratos varia com intensidade, dieta, treino e indivíduo. Use o conceito para progredir, sem prometer 'zonas' fixas de queima.",
  related: [
    { title: "Sistema endócrino", href: `/aprender/conteudos/${DISC}--sistema-endocrino`, type: "conceito" },
    { title: "Consumo de oxigênio", href: `/aprender/conteudos/${DISC}--consumo-oxigenio`, type: "mecanismo" },
    { title: "Sistemas energéticos (bioquímica)", href: "/aprender/conteudos/bioquimica-metabolismo--sistemas-energeticos", type: "conceito" },
  ],
  refs: ["ref-kenney-2024", "ref-guyton-2025", "ref-statpearls-exphys-2024"],
  applyRx: "Trate as vias como um contínuo que opera junto; progrida intensidade e volume por objetivo e tolerância, sem prometer zonas fixas de 'queima de gordura'.",
});

const renal = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-sistema-renal`, moduleSlug: "sistema-renal",
  slug: `${DISC}--sistema-renal`, title: "Rim e néfron: ajustando o meio interno",
  subtitle: "Sistema renal e urinário", description: "O rim filtra o plasma e ajusta seletivamente água, eletrólitos, ácido-base e resíduos; central para hidratação e pressão arterial.",
  level: "intermediario", minutes: 10, type: "mecanismo", kicker: K, tags: ["rim", "néfron", "hidratação"],
  hero: "O rim é o grande ajustador do meio interno. Ele filtra o plasma e depois decide, segmento por segmento, o que recupera e o que elimina, ligando hidratação, sódio e pressão arterial.",
  question: "Se o glomérulo filtra litros de plasma por hora, por que não urinamos litros por hora?",
  concepts: [
    { term: "Filtração, reabsorção e secreção", definition: "O glomérulo filtra água e solutos pequenos; o túbulo reabsorve o que é útil de volta ao sangue e secreta o que precisa sair. Excreção = filtração menos reabsorção mais secreção." },
    { term: "Controle de volume e pressão", definition: "ADH ajusta a reabsorção de água conforme a osmolaridade; o sistema renina-angiotensina-aldosterona ajusta sódio e volume conforme a perfusão. A autorregulação protege o néfron." },
  ],
  figure: { id: "nefron" },
  apply: "Use o néfron para entender hidratação e pressão: a perda de água pelo suor altera os sinais que modulam ADH, sede, tônus vascular e reabsorção. Responder à abertura: a maior parte do filtrado é reabsorvida ao longo do túbulo; só uma fração pequena vira urina, ajustada às necessidades do corpo.",
  special: [
    "O rim é central para compreender hidratação e pressão arterial durante e após o esforço.",
    "A concentração de sódio plasmático reflete a relação entre soluto e água, não o estoque total de sódio isoladamente.",
    "Limite didático: alterações de creatinina, proteinúria, edema ou pressão exigem avaliação clínica. Reconheça sinais de alerta e encaminhe.",
  ],
  mistake: {
    mistake: "Interpretar variações de peso agudas após o treino como mudança de gordura.",
    instead: "Grande parte da variação aguda de peso é água. O rim ajusta volume e eletrólitos; peso agudo não mede composição corporal.",
  },
  professionalCase: {
    prompt: "Aluno comemora ter 'perdido 1,5 kg' após um treino intenso e quente. Como orientar em termos fisiológicos?",
    choices: [
      { id: "c1", label: "Explicar que a maior parte dessa variação é água perdida pelo suor, que será reposta; mudança de composição corporal é um processo mais lento.", tone: "recomendada", feedback: "Coerente. Peso agudo reflete água; composição muda no tempo." },
      { id: "c2", label: "Confirmar que foram 1,5 kg de gordura.", tone: "cautela", feedback: "Variação aguda é sobretudo água, não gordura." },
      { id: "c3", label: "Recomendar não repor líquidos para 'manter o peso'.", tone: "cautela", feedback: "Não repor água por estética é arriscado; a reidratação é necessária." },
    ],
  },
  quiz: [
    q("q1", "variavel", "A relação que resume a excreção renal de uma substância é:", [
      { id: "a", label: "Filtração menos reabsorção mais secreção." },
      { id: "b", label: "Filtração mais reabsorção menos secreção." },
    ], "a", "Excreção = filtração − reabsorção + secreção."),
    q("q2", "verdadeiro-falso", "A maior parte do filtrado glomerular é reabsorvida antes de virar urina.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "v", "O túbulo reabsorve a maior parte da água e dos solutos úteis; só uma fração é excretada."),
  ],
  uncertainty: "Sinais renais (creatinina, edema, pressão) são de avaliação clínica. O papel do profissional é reconhecer mecanismos e sinais de alerta, não diagnosticar.",
  related: [
    { title: "Transporte pela membrana", href: `/aprender/conteudos/${DISC}--transporte-membrana`, type: "conceito" },
    { title: "Pressão no exercício", href: `/aprender/conteudos/${DISC}--pressao-no-exercicio`, type: "conceito" },
    { title: "Homeostase e controle", href: `/aprender/conteudos/${DISC}--homeostase-e-controle`, type: "mecanismo" },
  ],
  refs: ["ref-statpearls-renal-2023", "ref-costanzo-2026", "ref-guyton-2025"],
  applyRx: "Ligue o rim à hidratação e à pressão; explique que peso agudo reflete água, não gordura, e encaminhe sinais renais de alerta ao profissional de saúde.",
});

/* =============== Aprofundamentos: integração e adaptação =============== */

const integracao = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-adaptacoes`, moduleSlug: "adaptacoes",
  slug: `${DISC}--integracao-movimento`, title: "Integração fisiológica do movimento",
  subtitle: "Integração e adaptação", description: "Movimento é uma perturbação homeostática organizada: vários sistemas mudam em tempos e magnitudes diferentes, e nenhuma variável isolada resume a carga.",
  level: "intermediario", minutes: 11, type: "mecanismo", kicker: K, tags: ["integração", "resposta ao movimento", "carga"],
  hero: "Nenhum sistema trabalha sozinho no movimento. Comando motor, energia, circulação, ventilação e termorregulação se ajustam juntos, em tempos diferentes. Por isso nenhuma medida isolada resume a carga fisiológica.",
  question: "Por que a frequência cardíaca, sozinha, não descreve toda a carga de um treino?",
  concepts: [
    { term: "Perturbação organizada", definition: "O movimento desafia a homeostase de forma coordenada: intenção e comando motor, ativação neuromuscular, demanda metabólica, transporte, troca gasosa, regulação hidroeletrolítica e dissipação de calor." },
    { term: "Variável regulada x variável de resposta", definition: "Algumas variáveis são mantidas (pressão, pH, temperatura central); outras respondem para sustentar a tarefa (frequência cardíaca, ventilação, débito). Confundir as duas leva a interpretações erradas." },
  ],
  figure: { id: "sistemas-integrados" },
  apply: "Construa explicações causais que integram sistemas, sem reduzir tudo a um deles: leia a frequência cardíaca como resposta, junto de percepção de esforço, ventilação e contexto. Responder à abertura: a frequência é uma variável de resposta influenciada por calor, hidratação, sono, cafeína e emoção; sozinha, não resume a carga.",
  special: [
    "Resposta aguda, recuperação e adaptação ocorrem em escalas de tempo diferentes; não as confunda.",
    "Frequência cardíaca, lactato, suor e uma citocina isolada são pistas parciais, não medidas universais de carga ou de 'imunidade'.",
    "Este é o elo final para a Fisiologia do Exercício, que aprofunda consumo de oxigênio, limiares, fadiga e prescrição.",
  ],
  mistake: {
    mistake: "Resumir a carga fisiológica a uma única variável (só a frequência cardíaca, ou só o lactato).",
    instead: "Integre múltiplos sinais e o contexto. Cada variável isolada é uma pista parcial; a carga emerge da resposta conjunta dos sistemas.",
  },
  professionalCase: {
    prompt: "Em um dia muito quente, a frequência cardíaca do aluno está mais alta que o habitual na mesma corrida leve. Como interpretar?",
    choices: [
      { id: "c1", label: "Considerar que o calor e a hidratação elevam a FC para a mesma tarefa; ajustar a intensidade pela percepção de esforço e pela fala, não só pela FC.", tone: "recomendada", feedback: "Coerente. A FC é uma resposta influenciada pelo contexto; a leitura integrada orienta melhor." },
      { id: "c2", label: "Concluir que o condicionamento piorou porque a FC subiu.", tone: "cautela", feedback: "A FC mais alta no calor não indica perda de condicionamento; é uma resposta ao contexto." },
      { id: "c3", label: "Ignorar o calor e manter a intensidade planejada rigidamente.", tone: "cautela", feedback: "Ignorar o contexto térmico aumenta o risco; ajuste a intensidade conforme a resposta." },
    ],
  },
  quiz: [
    q("q1", "verdadeiro-falso", "A frequência cardíaca, sozinha, resume toda a carga fisiológica de qualquer treino.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "f", "A FC é uma variável de resposta influenciada pelo contexto; a carga emerge da integração dos sistemas."),
    q("q2", "conduta", "Resposta aguda, recuperação e adaptação são:", [
      { id: "a", label: "Escalas de tempo diferentes que não devem ser confundidas." },
      { id: "b", label: "Sinônimos que descrevem o mesmo fenômeno." },
    ], "a", "Aguda é durante e logo após; recuperação é o retorno e reparo; adaptação é a mudança persistente."),
  ],
  uncertainty: "A integração é complexa e individual; nenhum marcador isolado a resume. Use a leitura conjunta como guia e aprofunde na Fisiologia do Exercício.",
  related: [
    { title: "Homeostase e controle", href: `/aprender/conteudos/${DISC}--homeostase-e-controle`, type: "mecanismo" },
    { title: "Resposta aguda e crônica", href: `/aprender/conteudos/${DISC}--aguda-vs-cronica`, type: "conceito" },
    { title: "Fisiologia do Exercício", href: "/aprender/disciplinas/fisiologia-do-exercicio", type: "conceito" },
  ],
  refs: ["ref-kenney-2024", "ref-statpearls-exphys-2024", "ref-silverthorn-2026"],
  applyRx: "Leia a carga de forma integrada (percepção de esforço, fala, FC e contexto como calor e sono); distinga resposta aguda, recuperação e adaptação ao avaliar o treino.",
});

/* ===================================================================== *
 * AULAS-CAPÍTULO: edição fiel do "Manual de Fisiologia Humana Aplicada   *
 * à Educação Física" (Ribeiro, 2026). Uma aula por sistema, com os 6     *
 * núcleos mecanísticos, escalas de tempo, medida e interpretação, caso   *
 * de integração e leituras-base reais. Linguagem prudente e não          *
 * diagnóstica; a ferramenta apoia a decisão do profissional habilitado.  *
 * ===================================================================== */

const REF_BASE = ["ref-ribeiro-fisiologia-2026", "ref-guyton-2025", "ref-silverthorn-2026"];

const capSistemaNervoso = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-sistema-nervoso`, moduleSlug: "sistema-nervoso",
  slug: `${DISC}--mapa-sistema-nervoso`, title: "Sistema nervoso: da excitabilidade ao controle do movimento",
  subtitle: "Capítulo 01 do manual", description: "O sistema nervoso converte energia física e química em sinais elétricos, seleciona informações, constrói percepções e organiza respostas motoras e autonômicas.",
  level: "intermediario", minutes: 14, type: "mecanismo", kicker: K, tags: ["sistema nervoso", "unidade motora", "controle motor", "fadiga central"],
  hero: "O sistema nervoso explica por que técnica, atenção, motivação, dor, fadiga e aprendizagem mudam o desempenho mesmo quando a capacidade do músculo não mudou. Ele transforma sinais em percepção e comando.",
  question: "Um aluno perde estabilidade no agachamento ao fechar os olhos e melhora após seis semanas de prática. O que mudou, se a força de perna é a mesma?",
  concepts: [
    { term: "Potencial de ação: tudo ou nada", definition: "Na mesma fibra, um estímulo mais forte não gera um potencial maior. A informação é codificada pela frequência de disparo e pelo número de fibras recrutadas, não pelo tamanho do impulso." },
    { term: "Unidade motora e recrutamento", definition: "Um motoneurônio e todas as fibras que ele inerva. A força depende de recrutamento (quantas unidades), frequência de disparo e coordenação, não só do tamanho do músculo." },
  ],
  mechanism: {
    title: "Os seis núcleos mecanísticos",
    steps: [
      {
        label: "Membrana, potencial de repouso e excitabilidade",
        detail:
          "A voltagem de membrana resulta da distribuição desigual de íons e da permeabilidade seletiva. A Na+/K+-ATPase mantém os gradientes, enquanto canais de vazamento e canais dependentes de voltagem determinam a resposta instantânea. O potencial de ação é tudo ou nada, mas a intensidade da informação é codificada pela frequência de disparo e pelo número de fibras recrutadas. Sequência: (1) gradientes de Na+, K+, Cl- e Ca2+; (2) abertura sequencial de canais; (3) despolarização, repolarização e refratariedade; (4) propagação regenerativa pelo axônio. Relação: força eletroquímica = Vm menos Eíon. Aplicação ao exercício: temperatura, eletrólitos, perfusão e fármacos podem alterar excitabilidade e tempo de reação. Como medir: potencial de membrana, limiar, velocidade de condução e frequência de disparo, sempre com protocolo e contexto. Erro frequente: achar que um estímulo mais forte produz um potencial maior na mesma fibra; ele aumenta a frequência ou o recrutamento.",
      },
      {
        label: "Sinapses, neurotransmissores e plasticidade",
        detail:
          "Na sinapse química, a entrada de Ca2+ no terminal pré-sináptico acopla o potencial de ação à exocitose vesicular. A resposta pós-sináptica depende do receptor, da condutância ativada e do estado elétrico da célula; potenciais excitatórios e inibitórios somam-se no espaço e no tempo. Mudanças duradouras na eficácia sináptica sustentam memória motora e aprendizagem. Sequência: (1) chegada do potencial ao terminal; (2) abertura de canais de Ca2+; (3) liberação e ligação do transmissor; (4) remoção, recaptação e modulação. Relação: saída neural = soma de entradas excitatórias menos inibitórias. Aplicação ao exercício: a prática deliberada modifica o peso das entradas sensoriais e a eficiência das redes motoras. Como medir: latência, amplitude pós-sináptica, probabilidade de liberação e retenção da habilidade. Erro frequente: tratar inibição apenas como hiperpolarização; o shunt reduz o efeito de entradas excitatórias sem hiperpolarizar.",
      },
      {
        label: "Sensação, propriocepção e controle postural",
        detail:
          "Receptores cutâneos, vestibulares, articulares, fusos musculares e órgãos tendinosos transduzem diferentes formas de energia. O sistema nervoso estima posição e movimento combinando sinais que têm ruído, atraso e pesos variáveis. Quando a visão é retirada, a estabilidade passa a depender mais da informação vestibular e somatossensorial. Sequência: (1) transdução periférica; (2) vias ascendentes e mapas centrais; (3) fusão multissensorial; (4) ajustes reflexos e antecipatórios. Relação: estabilidade = previsão + feedback sensorial + estratégia mecânica. Aplicação ao exercício: superfície, visão, velocidade e fadiga podem ser manipuladas para treinar equilíbrio, sem confundir instabilidade com especificidade esportiva. Como medir: oscilação postural, tempo de reação, erro de posição, latência reflexa e base de suporte. Erro frequente: explicar controle postural por um único reflexo ou por um único músculo.",
      },
      {
        label: "Planejamento, comando motor e unidades motoras",
        detail:
          "Áreas associativas definem o objetivo; córtex pré-motor e suplementar organizam sequências; córtex motor e vias descendentes modulam interneurônios e motoneurônios. Gânglios da base participam da seleção e do vigor da ação, e o cerebelo compara previsão e consequência sensorial. A força final depende do recrutamento e da frequência das unidades motoras. Sequência: (1) definição do objetivo; (2) seleção do programa motor; (3) comando descendente; (4) correção por erro sensorial. Relação: comando motor = previsão + seleção + feedback. Aplicação ao exercício: a intenção de mover rapidamente pode aumentar a taxa inicial de desenvolvimento de força mesmo com carga submáxima. Como medir: EMG, tempo de reação, precisão, variabilidade e taxa de desenvolvimento de força. Erro frequente: procurar um movimento complexo em um ponto isolado do córtex; ele emerge de redes distribuídas.",
      },
      {
        label: "Sistema nervoso autônomo e exercício",
        detail:
          "O controle autonômico é regional e dinâmico. No início do exercício ocorre retirada vagal, seguida por maior atividade simpática, liberação de catecolaminas e redefinição do barorreflexo. O objetivo não é apenas elevar a frequência cardíaca, e sim redistribuir fluxo, sustentar pressão arterial, mobilizar substratos e regular temperatura. Sequência: (1) comando central antecipatório; (2) feedback de músculos e quimiorreceptores; (3) ajuste cardíaco e vascular; (4) reativação vagal na recuperação. Relação: PAM ≈ débito cardíaco × resistência vascular. Aplicação ao exercício: a recuperação da frequência cardíaca deve ser interpretada com postura, ambiente, hidratação, medicamentos e condicionamento. Como medir: FC, PA, variabilidade da FC, recuperação em 1 a 2 min e sintomas. Erro frequente: tratar simpático e parassimpático como dois interruptores globais e sempre opostos.",
      },
      {
        label: "Fadiga central, dor e aprendizagem motora",
        detail:
          "O desempenho voluntário depende da integração entre esforço percebido, motivação, ameaça, feedback aferente e capacidade periférica. Fadiga central descreve redução do comando motor voluntário, não cansaço subjetivo isolado. Dor é uma experiência construída pelo sistema nervoso e pode alterar a estratégia motora sem indicar dano proporcional. Sequência: (1) aferências informam o estado periférico; (2) centros superiores ajustam o esforço; (3) estratégias motoras mudam com ameaça; (4) repetição consolida modelos internos. Relação: desempenho = capacidade periférica × comando voluntário × estratégia. Aplicação ao exercício: variabilidade dosada e feedback relevante favorecem transferência; repetição sem objetivo pode consolidar compensações. Como medir: RPE, ativação voluntária, erro, retenção, transferência e qualidade técnica. Erro frequente: usar lactato, dor ou sensação de esforço isoladamente para localizar a origem da fadiga.",
      },
    ],
  },
  timeline: {
    title: "Da resposta aguda à adaptação",
    items: [
      { time: "Segundos", title: "Ativação imediata", detail: "Retirada vagal, comando central e recrutamento motor iniciam a resposta." },
      { time: "Minutos", title: "Ajuste", detail: "Reponderação sensorial, barorreflexo e aumento simpático estabilizam o esforço." },
      { time: "Horas", title: "Fadiga e consolidação", detail: "Fadiga neural transitória e consolidação inicial da habilidade." },
      { time: "Semanas", title: "Adaptação", detail: "Economia neural, melhor coordenação e refinamento dos modelos internos." },
    ],
  },
  apply: "Trate técnica, atenção e ambiente como parte da dose. Ao treinar equilíbrio, manipule superfície, visão, velocidade e fadiga sem confundir instabilidade com especificidade esportiva. Responder à abertura: a melhora vem da reponderação sensorial e de ajustes antecipatórios aprendidos (plasticidade e cerebelo), não de mais força de perna.",
  specialTitle: "Medida e interpretação: o que cada variável informa e onde ela cala",
  special: [
    "Potencial, ECG e EMG representam sinal elétrico e dependem de eletrodos, filtros e posição. Limite: não equivalem diretamente à força.",
    "Tempo de reação representa o intervalo entre estímulo e resposta. Limite: inclui detecção, decisão e execução, então não isola o mecanismo.",
    "Variabilidade da FC representa a oscilação dos intervalos cardíacos. Limite: é sensível a respiração, postura e registro.",
    "Equilíbrio representa oscilação e limites de estabilidade. Limite: é resultado de múltiplos sistemas, não de um só.",
    "RPE (Borg) representa a percepção global de esforço. Limite: só é válida quando instrução e escala são padronizadas.",
    "Regra de ouro do manual: uma medida não revela automaticamente o mecanismo. Ela restringe hipóteses quando método, unidade, condição basal, tempo, ambiente e tendência individual são conhecidos.",
    "Sinal de segurança: dor torácica, síncope, confusão, déficit neurológico, dispneia desproporcional, sangramento relevante ou piora rápida exigem interrupção e avaliação apropriada.",
  ],
  mistake: {
    mistake: "Achar que um estímulo mais forte gera um potencial de ação maior na mesma fibra, ou usar lactato, dor e esforço isolados para localizar a origem da fadiga.",
    instead: "Na mesma fibra, mais estímulo aumenta a frequência ou o recrutamento, não a amplitude. E distinga fadiga central de periférica combinando ativação voluntária, técnica, RPE e recuperação.",
  },
  professionalCase: {
    prompt: "Aquele aluno que perde estabilidade no agachamento de olhos fechados e melhora em seis semanas pergunta se 'ficou mais forte'. Como explicar em termos fisiológicos?",
    choices: [
      { id: "c1", label: "Explicar que o sistema nervoso reaprendeu a estimar posição sem a visão, ajustando previsão e feedback; a força pode nem ter mudado.", tone: "recomendada", feedback: "Coerente. É reponderação sensorial e aprendizagem motora (cerebelo e ajustes antecipatórios), não necessariamente ganho de força." },
      { id: "c2", label: "Afirmar que a força de perna aumentou porque o equilíbrio melhorou.", tone: "cautela", feedback: "Equilíbrio melhor não prova mais força; a mudança é sobretudo neural e sensorial." },
      { id: "c3", label: "Concluir que o aluno tinha um problema neurológico que se resolveu sozinho.", tone: "cautela", feedback: "Perder equilíbrio sem visão é esperado; melhora com prática é aprendizagem, não cura de doença." },
    ],
  },
  quiz: [
    q("q1", "verdadeiro-falso", "Na mesma fibra, um estímulo mais forte produz um potencial de ação de maior amplitude.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "f", "O potencial de ação é tudo ou nada; mais estímulo aumenta frequência de disparo ou recrutamento, não a amplitude."),
    q("q2", "conduta", "A força produzida por um músculo depende principalmente de:", [
      { id: "a", label: "Recrutamento de unidades motoras, frequência de disparo e coordenação." },
      { id: "b", label: "Apenas do tamanho (perímetro) do músculo." },
    ], "a", "A saída de força neural combina recrutamento, frequência e coordenação; tamanho não é sinônimo de força específica."),
    q("q3", "variavel", "Quando a visão é retirada, a estabilidade postural passa a depender mais de:", [
      { id: "a", label: "Informação vestibular e somatossensorial." },
      { id: "b", label: "Um único reflexo espinhal." },
    ], "a", "O sistema funde sinais com ruído e atraso; sem visão, o peso das entradas vestibular e somatossensorial aumenta."),
    q("q4", "conduta", "Qual conjunto ajuda a distinguir fadiga central de fadiga periférica?", [
      { id: "a", label: "Ativação voluntária, qualidade técnica, RPE e recuperação, lidos em conjunto." },
      { id: "b", label: "O valor de lactato isolado." },
    ], "a", "Fadiga central é redução do comando voluntário; lactato, dor ou esforço isolados não localizam a origem da fadiga."),
    q("q5", "verdadeiro-falso", "Simpático e parassimpático funcionam como dois interruptores globais e sempre opostos.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "f", "O controle autonômico é regional e dinâmico; a resposta ao exercício redistribui fluxo e sustenta pressão, não apenas eleva a FC."),
  ],
  uncertainty: "O conhecimento fisiológico organiza a observação e a decisão de exercício; não substitui diagnóstico, investigação de doença ou atendimento de urgência. Medidas neurais (EMG, tempo de reação, variabilidade da FC) restringem hipóteses apenas com método, condição basal e contexto conhecidos.",
  related: [
    { title: "Bioeletricidade da célula", href: `/aprender/conteudos/${DISC}--bioeletricidade`, type: "conceito" },
    { title: "Sistema muscular", href: `/aprender/conteudos/${DISC}--mapa-sistema-muscular`, type: "mecanismo" },
    { title: "Integração fisiológica do movimento", href: `/aprender/conteudos/${DISC}--integracao-movimento`, type: "mecanismo" },
  ],
  refs: [...REF_BASE, "ref-kandel-neural-2021", "ref-latash-motor-2012", "ref-vander-2023"],
  applyRx: "Leia técnica, atenção, sono e ambiente como parte da carga neural. Progrida equilíbrio e habilidade com variabilidade dosada e feedback claro, e interprete a FC de recuperação no contexto do aluno.",
});

const capSistemaMuscular = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-tecidos-movimento`, moduleSlug: "tecidos-do-movimento",
  slug: `${DISC}--mapa-sistema-muscular`, title: "Sistema muscular: arquitetura, força, potência e fadiga",
  subtitle: "Capítulo 02 do manual", description: "O músculo transforma energia química em força, mas a função não se reduz ao sarcômero: arquitetura, tendão, inervação, metabolismo e alavancas determinam a tensão produzida e convertida em desempenho.",
  level: "intermediario", minutes: 14, type: "mecanismo", kicker: K, tags: ["força", "hipertrofia", "unidades motoras", "torque"],
  hero: "A força que aparece no exercício não vem só do tamanho do músculo. Arquitetura, tendão, tipo de fibra, comprimento e alavanca articular decidem quanta tensão é gerada, transmitida e transformada em movimento.",
  question: "Dois exercícios usam a mesma carga e as mesmas repetições, mas um gera muito mais esforço na posição alongada. Por quê?",
  concepts: [
    { term: "Torque = força × braço de momento", definition: "O que a articulação sente não é só a força do músculo, mas a força multiplicada pela alavanca. A mesma carga externa muda de exigência conforme o ângulo e o braço de momento." },
    { term: "Potência = força × velocidade", definition: "A potência máxima costuma ocorrer em combinações intermediárias de força e velocidade, não na força máxima. Por isso potência não é sinônimo de 1RM." },
  ],
  mechanism: {
    title: "Os seis núcleos mecanísticos",
    steps: [
      { label: "Arquitetura muscular e transmissão de força", detail: "Comprimento fascicular favorece velocidade; área de secção favorece força; penação acomoda mais fibras em paralelo. Parte da força é transmitida lateralmente pela matriz, e o tendão armazena energia." },
      { label: "Acoplamento excitação-contração", detail: "O potencial nos túbulos T ativa DHPR-RyR1 e libera Ca2+; a força ativada depende de Ca2+ e da sensibilidade miofibrilar. A perda de força em séries pode vir de menos Ca2+ antes de qualquer depleção de ATP." },
      { label: "Ciclo das pontes cruzadas e custo energético", detail: "A força macroscópica depende do número de pontes ligadas e do tempo de ligação. Ações excêntricas toleram forças altas com menor custo metabólico, mas mais estresse mecânico em quem não está adaptado." },
      { label: "Unidades motoras e tipos de fibra", detail: "Força neural = recrutamento + frequência + coordenação. Fibras I, IIa e IIx diferem em velocidade e fadiga, com plasticidade; intenção explosiva pode recrutar unidades de alto limiar sem carga máxima." },
      { label: "Comprimento-tensão, força-velocidade e potência", detail: "A força ativa varia com a sobreposição dos filamentos; a passiva cresce com o alongamento de titina e tendão. A escolha de amplitude muda a região de maior tensão mesmo com carga e repetições iguais." },
      { label: "Fadiga, dano e hipertrofia", detail: "Balanço proteico = síntese menos degradação. Dano estrutural não é requisito para hipertrofia: tensão mecânica e trabalho próximo da capacidade recrutam sinalização, modulada por proteína, energia e sono." },
    ],
  },
  timeline: {
    title: "Da repetição à adaptação",
    items: [
      { time: "Repetição", title: "Produção de torque", detail: "Ativação, Ca2+ e pontes cruzadas geram força a cada movimento." },
      { time: "Série", title: "Acúmulo de fadiga", detail: "Redução de velocidade e mudança de recrutamento ao longo das repetições." },
      { time: "Horas", title: "Reposição e sinalização", detail: "Reposição de fosfocreatina e glicogênio e sinalização anabólica." },
      { time: "Semanas", title: "Remodelamento", detail: "Adaptações neurais, hipertrofia, mudança de arquitetura e rigidez tendínea." },
    ],
  },
  apply: "Manipule amplitude, intensidade, proximidade da falha e recuperação, não apenas 'sentir dor'. A escolha do exercício e da amplitude muda a região de maior tensão. Responder à abertura: o exercício com pico na posição alongada combina maior força passiva, braço de momento e comprimento de fibra diferentes, mudando a exigência mesmo com carga igual.",
  special: [
    "Progressão deve manipular volume, intensidade, amplitude e proximidade da falha, com recuperação suficiente.",
    "Ações excêntricas e cargas pesadas são úteis, mas em não adaptados exigem introdução gradual pelo maior estresse mecânico.",
    "Lactato e dor tardia não medem a qualidade do estímulo nem devem guiar sozinhos a progressão.",
  ],
  mistake: {
    mistake: "Tratar tamanho muscular como sinônimo de força em todas as amplitudes, ou usar dor tardia como medida da qualidade do treino.",
    instead: "Force específica e torque dependem de arquitetura, alavanca e técnica. Avalie o estímulo por carga, velocidade, proximidade da falha e recuperação, não pela dor.",
  },
  professionalCase: {
    prompt: "Um aluno diz que só progride quando 'sente muita dor no dia seguinte' e quer aumentar a dor a cada treino. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Explicar que hipertrofia depende de tensão mecânica e trabalho próximo da capacidade, não de dano; progredir por volume, carga e proximidade da falha, com recuperação.", tone: "recomendada", feedback: "Coerente. Dano não é requisito de hipertrofia; a dor tardia não mede a qualidade do estímulo." },
      { id: "c2", label: "Aumentar a dor a cada sessão para 'garantir' o estímulo.", tone: "cautela", feedback: "Buscar dano crescente atrapalha recuperação e não melhora a adaptação; a sinalização ocorre sem microlesão relevante." },
      { id: "c3", label: "Manter volume e intensidade fixos por meses para evitar qualquer dor.", tone: "aceitavel", feedback: "Evitar dor é razoável, mas sem progressão de estímulo a adaptação estagna; progrida de forma controlada." },
    ],
  },
  quiz: [
    q("q1", "verdadeiro-falso", "Dano muscular (dor tardia) é requisito necessário para haver hipertrofia.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "f", "Tensão mecânica e trabalho próximo da capacidade recrutam a sinalização anabólica sem exigir microlesão relevante."),
    q("q2", "variavel", "A potência máxima costuma ocorrer:", [
      { id: "a", label: "Em combinações intermediárias de força e velocidade." },
      { id: "b", label: "Exatamente na força máxima (1RM)." },
    ], "a", "Potência = força × velocidade; o pico aparece em combinações intermediárias, não no 1RM."),
  ],
  uncertainty: "Curvas musculares isoladas não se aplicam ao exercício sem considerar braço de momento e técnica. EMG não mede força diretamente, e ultrassom é sensível a posição, hidratação e técnica.",
  related: [
    { title: "Músculo esquelético", href: `/aprender/conteudos/${DISC}--musculo-esqueletico`, type: "conceito" },
    { title: "Relação força-comprimento", href: `/aprender/conteudos/${DISC}--relacao-forca`, type: "mecanismo" },
    { title: "Sistema esquelético e tecido conjuntivo", href: `/aprender/conteudos/${DISC}--mapa-sistema-esqueletico`, type: "mecanismo" },
  ],
  refs: [...REF_BASE, "ref-lieber-musculo-2010", "ref-zatsiorsky-biomecanica-2012", "ref-costanzo-2026"],
  applyRx: "Escolha exercício e amplitude pensando onde fica o pico de tensão. Progrida por volume, carga, proximidade da falha e recuperação, e não use a dor tardia como medida do estímulo.",
});

const capSistemaCardiovascular = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-sistema-cardiovascular`, moduleSlug: "sistema-cardiovascular",
  slug: `${DISC}--mapa-sistema-cardiovascular`, title: "Sistema cardiovascular: ritmo, bomba, vasos e pressão",
  subtitle: "Capítulo 03 do manual", description: "Coração, sangue e vasos formam um circuito que ajusta o fluxo regional de segundo a segundo. Nenhuma variável isolada representa a capacidade circulatória.",
  level: "intermediario", minutes: 14, type: "mecanismo", kicker: K, tags: ["débito cardíaco", "pressão arterial", "endotélio", "deriva cardiovascular"],
  hero: "Frequência cardíaca, volume sistólico, resistência vascular, retorno venoso e conteúdo de oxigênio interagem o tempo todo. Por isso a leitura cardiovascular precisa integrar mecânica cardíaca, endotélio e controle autonômico.",
  question: "Numa corrida em calor, a frequência cardíaca sobe mesmo com a velocidade constante. O condicionamento piorou?",
  concepts: [
    { term: "Débito cardíaco = FC × volume sistólico", definition: "O débito é o principal determinante da entrega de oxigênio. O treino aumenta o volume sistólico, então o coração entrega o mesmo sangue com menos batimentos." },
    { term: "Fluxo = ΔP / R", definition: "O fluxo depende do gradiente de pressão e da resistência. Pequenas mudanças no raio das arteríolas produzem grande efeito sobre a resistência e a distribuição do fluxo." },
  ],
  mechanism: {
    title: "Os seis núcleos mecanísticos",
    steps: [
      { label: "Automatismo, condução e ECG", detail: "O nó sinoatrial domina o ritmo; o nó AV atrasa; His-Purkinje sincroniza os ventrículos. O ECG registra direção e tempo da despolarização, não força mecânica: o tamanho do QRS não mede contração." },
      { label: "Ciclo cardíaco, válvulas e pressões", detail: "Volume sistólico = volume diastólico final menos volume sistólico final. Frequências muito altas reduzem o tempo de enchimento; condicionamento e retorno venoso ajudam a preservar o volume sistólico." },
      { label: "Débito, retorno venoso e Frank-Starling", detail: "A força se ajusta ao enchimento dentro da faixa fisiológica. Calor e desidratação reduzem o volume central e produzem deriva cardiovascular: a FC sobe para sustentar o débito enquanto o volume sistólico cai." },
      { label: "Vasos, resistência e função endotelial", detail: "O endotélio detecta o cisalhamento e libera NO e outros mediadores, modulando tônus e inflamação. A vasodilatação do músculo ativo vem de metabólitos e sinais locais, não de simples 'desligamento simpático'." },
      { label: "Microcirculação e troca capilar", detail: "VO2 = débito × diferença arteriovenosa de O2. Capilares oferecem grande área e baixa velocidade para a troca; o recrutamento capilar melhora a difusão e a distribuição do fluxo." },
      { label: "Pressão arterial, reflexos e adaptações", detail: "Barorreflexo, rim e controle local sustentam a pressão. No exercício dinâmico o débito sobe e a resistência total cai; no resistido, compressão e apneia podem elevar a pressão de forma transitória." },
    ],
  },
  timeline: {
    title: "Da resposta aguda à adaptação",
    items: [
      { time: "Início", title: "Ativação", detail: "Retirada vagal, aumento de FC e vasodilatação muscular." },
      { time: "Estável", title: "Ajuste à demanda", detail: "Débito e extração de O2 acompanham a intensidade." },
      { time: "Calor/prolongado", title: "Deriva", detail: "Deriva cardiovascular e redistribuição cutânea do fluxo." },
      { time: "Treinamento", title: "Adaptação", detail: "Maior volume sistólico, melhor função endotelial e economia cardíaca." },
    ],
  },
  apply: "Leia a FC como uma variável de resposta, junto de percepção de esforço, ventilação e contexto. No treino de força com hipertensos, oriente respiração contínua e intensidade moderada, evitando apneia. Responder à abertura: no calor, a deriva cardiovascular eleva a FC para a mesma tarefa; isso não indica piora do condicionamento.",
  special: [
    "Calor e desidratação reduzem o volume central; ajuste a intensidade pela percepção de esforço e pela fala, não só pela FC.",
    "História, sintomas e trajetória informam mais que um valor isolado ao diferenciar adaptação fisiológica de condição clínica.",
    "Dor torácica, síncope ou dispneia desproporcional exigem interrupção e avaliação apropriada.",
  ],
  mistake: {
    mistake: "Concluir que o condicionamento piorou porque a FC subiu no calor, ou tratar fração de ejeção normal como prova de função cardiovascular global normal.",
    instead: "A FC mais alta no calor é deriva cardiovascular, uma resposta ao contexto. E nenhum índice isolado descreve toda a função; integre história, sintomas e trajetória.",
  },
  professionalCase: {
    prompt: "No mesmo percurso leve, num dia quente, a FC do aluno está mais alta que o habitual. Como interpretar e conduzir?",
    choices: [
      { id: "c1", label: "Considerar deriva cardiovascular por calor e hidratação; ajustar a intensidade pela percepção de esforço e pela fala, e reforçar hidratação.", tone: "recomendada", feedback: "Coerente. A FC é resposta ao contexto; a leitura integrada orienta melhor a intensidade." },
      { id: "c2", label: "Concluir que o condicionamento regrediu porque a FC subiu.", tone: "cautela", feedback: "FC mais alta no calor não indica perda de condicionamento; é resposta térmica e hídrica." },
      { id: "c3", label: "Manter a intensidade planejada rigidamente, ignorando o calor.", tone: "cautela", feedback: "Ignorar o contexto térmico aumenta o risco; ajuste pela resposta do dia." },
    ],
  },
  quiz: [
    q("q1", "variavel", "O débito cardíaco é o produto da frequência cardíaca pelo:", [
      { id: "a", label: "Volume sistólico." }, { id: "b", label: "Consumo de oxigênio." },
    ], "a", "Débito = FC × volume sistólico, o principal determinante da entrega de oxigênio."),
    q("q2", "verdadeiro-falso", "No calor, uma FC mais alta na mesma tarefa costuma indicar piora do condicionamento.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "f", "É deriva cardiovascular: com menos volume central, a FC sobe para manter o débito."),
  ],
  uncertainty: "Pressão e FC dependem de técnica, manguito, postura, medicação e condição individual; a conduta clínica é do profissional de saúde. Uma mesma FC pode representar débitos diferentes.",
  related: [
    { title: "Débito cardíaco", href: `/aprender/conteudos/${DISC}--debito-cardiaco`, type: "conceito" },
    { title: "Pressão arterial no exercício", href: `/aprender/conteudos/${DISC}--pressao-no-exercicio`, type: "conceito" },
    { title: "Sistema respiratório", href: `/aprender/conteudos/${DISC}--mapa-sistema-respiratorio`, type: "mecanismo" },
  ],
  refs: [...REF_BASE, "ref-klabunde-cardio-2021", "ref-kenney-2024", "ref-pescatello-hipertensao-2004"],
  applyRx: "Leia a FC como resposta, junto de percepção de esforço, fala e contexto (calor, sono, hidratação). Em hipertensos, priorize aeróbio moderado e respiração contínua, evitando apneia e cargas máximas.",
});

const capSistemaRespiratorio = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-sistema-respiratorio`, moduleSlug: "sistema-respiratorio",
  slug: `${DISC}--mapa-sistema-respiratorio`, title: "Sistema respiratório: ventilação, difusão e controle",
  subtitle: "Capítulo 04 do manual", description: "A respiração conecta ventilação, difusão, perfusão e transporte sanguíneo. A ventilação aumenta antes de grandes mudanças nos gases, por comando central e feedback muscular.",
  level: "intermediario", minutes: 13, type: "mecanismo", kicker: K, tags: ["ventilação", "limiar ventilatório", "trocas gasosas", "teste da fala"],
  hero: "A ventilação sobe no exercício antes mesmo de os gases arteriais mudarem muito, graças ao comando central. Entender o sistema respiratório sustenta guias práticos como o teste da fala.",
  question: "Como saber, sem aparelhos, se um aluno passou de uma intensidade leve para uma mais exigente?",
  concepts: [
    { term: "Ventilação alveolar: VA = (VT − VD) × f", definition: "Só a fração do ar que chega a alvéolos perfundidos participa da troca. Aumentar o volume corrente costuma ser mais eficiente que só elevar a frequência, até limites mecânicos." },
    { term: "Saturação não é conteúdo", definition: "A maior parte do O2 é transportada ligada à hemoglobina. Anemia pode manter a SpO2 normal com menor transporte total de O2; saturação e conteúdo são coisas diferentes." },
  ],
  mechanism: {
    title: "Os seis núcleos mecanísticos",
    steps: [
      { label: "Mecânica ventilatória e pressões", detail: "A inspiração torna a pressão pleural mais negativa; a expiração tranquila é passiva. Complacência = ΔV/ΔP. O ar se move por gradientes de pressão, não porque a gente 'puxa oxigênio'." },
      { label: "Volumes, ventilação minuto e espaço morto", detail: "Ventilação minuto é frequência × volume corrente, mas o espaço morto torna a ventilação alveolar menor que a total. Ventilação alta não garante oxigenação se perfusão ou difusão falham." },
      { label: "Difusão e relação ventilação-perfusão", detail: "O fluxo pela membrana depende de área, espessura e gradiente. Unidades com V/Q baixo recebem sangue com pouca ventilação; o pulmão saudável reduz desigualdades por recrutamento e vasoconstrição hipóxica." },
      { label: "Transporte de O2 e CO2", detail: "A curva sigmoide permite alta saturação nos pulmões e liberação nos tecidos. O exercício desloca a curva para a direita nos tecidos, favorecendo a entrega de O2 sem impedir a saturação pulmonar." },
      { label: "Controle neural e químico da ventilação", detail: "Centros bulbares integram quimiorreceptores, mecanorreceptores e comando central. No início do exercício a ventilação sobe por antecipação; quimiorreceptores respondem a CO2 e pH, não medem 'falta de ar'." },
      { label: "Limiar ventilatório, economia e adaptação", detail: "O tamponamento de H+ aumenta o CO2 e acelera a ventilação de forma não linear. O limiar é uma estimativa de transição, não um ponto único; o treino melhora economia e capacidade oxidativa." },
    ],
  },
  timeline: {
    title: "Da resposta aguda à adaptação",
    items: [
      { time: "Primeiros segundos", title: "Antecipação", detail: "O comando central eleva a ventilação antes de grande alteração química." },
      { time: "Minutos", title: "Estabilização", detail: "Feedback de CO2, H+, temperatura e músculos ajusta a resposta." },
      { time: "Alta intensidade", title: "Hiperventilação", detail: "Elevação desproporcional da ventilação e maior trabalho respiratório." },
      { time: "Treinamento", title: "Economia", detail: "Menor ventilação para a mesma carga e maior capacidade máxima." },
    ],
  },
  apply: "Use a respiração e a fala como guia de intensidade sem equipamento: fala confortável indica esforço leve a moderado; falar só palavras soltas indica proximidade de um limiar mais alto. Responder à abertura: quando o aluno deixa de conseguir falar frases confortavelmente, cruzou para uma intensidade mais exigente.",
  special: [
    "Zonas de treino podem usar fala, percepção de esforço, limiares ou teste cardiopulmonar, conforme objetivo e recursos.",
    "Respiração voluntariamente lenta muda a sensação, mas não substitui a resposta necessária ao CO2 em intensidades altas.",
    "Manter a maior parte do treino em intensidade conversável é prudente em hipertensos e cardiopatas.",
  ],
  mistake: {
    mistake: "Dizer que respiramos para 'puxar oxigênio', ou tratar SpO2 normal como prova de que não há grande trabalho ventilatório.",
    instead: "O ar se move por gradientes de pressão. E SpO2 normal não exclui alto trabalho respiratório; em sensor óptico, valores baixos podem ser artefato de movimento.",
  },
  professionalCase: {
    prompt: "Um aluno quer saber, sem relógio nem aparelho, se está treinando 'leve' ou 'forte' na caminhada. Como orientar?",
    choices: [
      { id: "c1", label: "Ensinar o teste da fala: conseguir falar frases confortáveis indica leve a moderado; só palavras soltas indica intensidade maior.", tone: "recomendada", feedback: "Coerente. A ventilação e a fala refletem a intensidade e servem como guia prático." },
      { id: "c2", label: "Mandar respirar bem devagar para 'baixar' a intensidade percebida.", tone: "cautela", feedback: "Respiração lenta muda a sensação, mas não substitui a resposta ao CO2 em intensidades altas." },
      { id: "c3", label: "Dizer que sem aparelho é impossível estimar a intensidade.", tone: "aceitavel", feedback: "Aparelhos ajudam, mas fala e percepção de esforço são guias válidos e acessíveis." },
    ],
  },
  quiz: [
    q("q1", "conduta", "O teste da fala indica proximidade de um limiar mais alto quando a pessoa:", [
      { id: "a", label: "Consegue falar apenas palavras soltas, não frases confortáveis." },
      { id: "b", label: "Consegue cantar sem esforço." },
    ], "a", "Falar só palavras soltas sinaliza que a ventilação subiu de forma desproporcional, perto de um limiar mais alto."),
    q("q2", "verdadeiro-falso", "Saturação (SpO2) normal significa necessariamente conteúdo de oxigênio adequado no sangue.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "f", "Saturação não é conteúdo: anemia pode manter SpO2 normal com menor transporte total de O2."),
  ],
  uncertainty: "Espirometria e trocas gasosas dependem de esforço, técnica e calibração. Dispneia é percepção e precisa de escala e contexto padronizados; a conduta clínica pulmonar é do profissional de saúde.",
  related: [
    { title: "Ventilação e esforço", href: `/aprender/conteudos/${DISC}--ventilacao`, type: "conceito" },
    { title: "Transporte de gases", href: `/aprender/conteudos/${DISC}--transporte-gases`, type: "mecanismo" },
    { title: "Consumo de oxigênio", href: `/aprender/conteudos/${DISC}--consumo-oxigenio`, type: "mecanismo" },
  ],
  refs: [...REF_BASE, "ref-west-respiratoria-2021", "ref-powers-howley-2024", "ref-kenney-2024"],
  applyRx: "Guie a intensidade pela fala e pela percepção de esforço quando não houver equipamento, e explique que SpO2 e ventilação isoladas não descrevem toda a oxigenação.",
});

const capSistemaHematologico = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-sistema-hematologico`, moduleSlug: "sistema-hematologico",
  slug: `${DISC}--mapa-sistema-hematologico`, title: "Sangue, linfa e imunidade: transporte, defesa e recuperação",
  subtitle: "Capítulo 05 do manual", description: "Sangue e linfa transportam e conectam tecidos, enquanto hemostasia e imunidade preservam integridade. A interpretação deve separar concentração, redistribuição e mudança real de massa.",
  level: "intermediario", minutes: 13, type: "mecanismo", kicker: K, tags: ["volume plasmático", "hemoglobina", "ferro", "inflamação"],
  hero: "O exercício muda volume plasmático, distribuição de células, mediadores inflamatórios e demanda de ferro. Ler o sangue exige separar o que é concentração, o que é redistribuição e o que é mudança real de massa.",
  question: "Após treino intenso em calor, o hematócrito aumenta e o peso cai. O aluno 'produziu mais sangue'?",
  concepts: [
    { term: "Concentração = quantidade / volume", definition: "Postura, suor e trocas capilares mudam o volume plasmático em minutos. Hematócrito e hemoglobina podem subir por hemoconcentração, sem aumento de massa total." },
    { term: "Conteúdo de O2 depende de Hb × saturação", definition: "A massa de hemoglobina determina grande parte do transporte de O2; a concentração depende também do volume plasmático. Endurance pode expandir o plasma e reduzir a concentração de Hb sem anemia verdadeira." },
  ],
  mechanism: {
    title: "Os seis núcleos mecanísticos",
    steps: [
      { label: "Plasma, volume sanguíneo e concentração", detail: "Água, eletrólitos, proteínas e mediadores compõem o plasma. Maior concentração pós-exercício não significa produção imediata do componente; costuma ser hemoconcentração." },
      { label: "Eritrócitos, hemoglobina e ferro", detail: "A eritropoetina renal estimula a medula; ferro, folato, B12 e proteína são necessários. Ferritina sobe na inflamação, então um valor isolado não descreve todo o estado de ferro." },
      { label: "Plaquetas, coagulação e fibrinólise", detail: "Hemostasia = formação controlada menos remoção do coágulo. O exercício agudo altera transitoriamente a atividade hemostática; o risco depende de condição clínica, intensidade, imobilização e hidratação." },
      { label: "Imunidade inata e inflamação", detail: "Resposta = intensidade × duração × contexto. Inflamação organiza contenção e reparo; suprimi-la de forma indiscriminada pode atrapalhar o reparo. A resolução é um programa ativo." },
      { label: "Imunidade adaptativa e memória", detail: "Linfócitos B e T reconhecem antígenos e formam memória. A queda de algumas células no sangue após exercício pode ser redistribuição para os tecidos, e não imunossupressão global." },
      { label: "Sistema linfático, edema e exercício", detail: "Balanço intersticial = filtração menos drenagem linfática. Contração muscular e movimento favorecem o fluxo linfático; edema persistente, assimétrico ou doloroso requer avaliação." },
    ],
  },
  timeline: {
    title: "Da resposta aguda à adaptação",
    items: [
      { time: "Minutos", title: "Hemoconcentração", detail: "Redução de volume plasmático e mobilização de leucócitos e plaquetas." },
      { time: "Horas", title: "Redistribuição", detail: "Redistribuição imune e mediadores de reparo entram em cena." },
      { time: "Dias", title: "Resolução", detail: "Resolução inflamatória e restauração do volume plasmático." },
      { time: "Treinamento", title: "Adaptação", detail: "Expansão plasmática e melhor regulação imune e metabólica." },
    ],
  },
  apply: "Padronize horário, postura, hidratação e intervalo após o exercício antes de comparar exames. Integre sintomas e marcadores de ferro em vez de reagir a um valor isolado. Responder à abertura: o hematócrito subiu por hemoconcentração (perda de água pelo suor); não houve produção imediata de mais sangue.",
  special: [
    "Carga alta com pouco sono, déficit energético e exposição a patógenos pode aumentar o risco de sintomas respiratórios.",
    "A contagem sanguínea é uma fotografia de um compartimento, não do sistema imune inteiro.",
    "Ferritina isolada não descreve todo o estado de ferro, pois sobe na inflamação; integre com sintomas e outros marcadores.",
  ],
  mistake: {
    mistake: "Concluir que o aluno 'produziu mais sangue' porque o hematócrito subiu após treino em calor, ou tratar edema como simples 'retenção de líquido'.",
    instead: "Maior concentração após exercício costuma ser hemoconcentração, não produção. E no edema, causa e distribuição importam mais que o rótulo 'retenção'.",
  },
  professionalCase: {
    prompt: "Um aluno comemora que o exame pós-treino em calor mostrou 'hemoglobina mais alta' e conclui que ficou mais saudável. Como orientar?",
    choices: [
      { id: "c1", label: "Explicar que a perda de água pelo suor concentrou o sangue; repetir o exame padronizando horário, hidratação e repouso antes de concluir algo.", tone: "recomendada", feedback: "Coerente. Hemoconcentração eleva a concentração sem mudar a massa; padronizar a coleta é essencial." },
      { id: "c2", label: "Confirmar que a massa de hemoglobina aumentou de imediato com um treino.", tone: "cautela", feedback: "Produzir hemoglobina leva tempo; a variação aguda reflete volume plasmático." },
      { id: "c3", label: "Recomendar evitar hidratação para 'manter' os valores altos.", tone: "cautela", feedback: "Restringir água por estética laboratorial é arriscado; a reidratação é necessária." },
    ],
  },
  quiz: [
    q("q1", "verdadeiro-falso", "Um aumento de hematócrito logo após treino intenso em calor prova aumento da massa de hemácias.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "f", "É hemoconcentração: a perda de água reduz o volume plasmático e eleva a concentração sem mudar a massa."),
    q("q2", "conduta", "Uma queda de linfócitos no sangue logo após exercício intenso indica principalmente:", [
      { id: "a", label: "Possível redistribuição das células para os tecidos, não imunossupressão global." },
      { id: "b", label: "Falência imune que contraindica todo exercício." },
    ], "a", "A contagem é uma fotografia de um compartimento; a redistribuição é comum e transitória."),
  ],
  uncertainty: "Ferritina, PCR e leucograma são pouco específicos e mudam com volume e redistribuição. Alterações persistentes ou sintomas exigem avaliação clínica; o papel do profissional é reconhecer mecanismos e sinais de alerta.",
  related: [
    { title: "Sistema cardiovascular", href: `/aprender/conteudos/${DISC}--mapa-sistema-cardiovascular`, type: "mecanismo" },
    { title: "Sistema renal e urinário", href: `/aprender/conteudos/${DISC}--mapa-sistema-renal`, type: "mecanismo" },
    { title: "Sistema tegumentar e termorregulação", href: `/aprender/conteudos/${DISC}--mapa-sistema-tegumentar`, type: "mecanismo" },
  ],
  refs: [...REF_BASE, "ref-hoffbrand-hematologia-2019", "ref-janeway-imuno-2022", "ref-vander-2023"],
  applyRx: "Padronize a coleta de exames e leia concentração, redistribuição e massa como coisas diferentes. Trate carga, sono e energia como fatores de recuperação imune, e encaminhe sinais de alerta.",
});

const capSistemaRenal = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-sistema-renal`, moduleSlug: "sistema-renal",
  slug: `${DISC}--mapa-sistema-renal`, title: "Rins: filtração, água, eletrólitos e equilíbrio ácido-base",
  subtitle: "Capítulo 06 do manual", description: "Os rins estabilizam volume, osmolaridade, eletrólitos, pH e pressão ao filtrar o plasma e ajustar reabsorção e secreção. No exercício, mudam a interpretação de urina e biomarcadores.",
  level: "intermediario", minutes: 13, type: "mecanismo", kicker: K, tags: ["rim", "hidratação", "sódio", "ácido-base"],
  hero: "O rim é o grande ajustador do meio interno: filtra litros de plasma e decide, segmento por segmento, o que recupera e o que elimina, ligando hidratação, sódio, pH e pressão arterial.",
  question: "Numa prova longa em calor, um atleta bebe água em excesso e desenvolve cefaleia e confusão. O que está acontecendo?",
  concepts: [
    { term: "Excreção = filtração − reabsorção + secreção", definition: "O glomérulo filtra água e solutos pequenos; o túbulo reabsorve o que é útil e secreta o que precisa sair. A maior parte do filtrado é reabsorvida, por isso não urinamos litros por hora." },
    { term: "Osmolaridade, ADH e sódio", definition: "O ADH ajusta a reabsorção de água conforme a osmolaridade; o eixo renina-angiotensina-aldosterona ajusta sódio e volume conforme a perfusão. Sódio plasmático reflete a relação entre soluto e água, não o estoque total." },
  ],
  mechanism: {
    title: "Os seis núcleos mecanísticos",
    steps: [
      { label: "Fluxo renal e filtração glomerular", detail: "TFG = Kf × pressão líquida de filtração. Autorregulação e feedback túbulo-glomerular estabilizam o fluxo. Desidratação e calor podem reduzir o fluxo renal sem representar lesão, mas sintomas e persistência importam." },
      { label: "Transporte tubular e depuração", detail: "O túbulo proximal reabsorve grande parte de água, Na+, glicose e bicarbonato; segmentos seguintes refinam. Glicosúria ou proteinúria transitória após esforço intenso precisa de contexto e repetição." },
      { label: "Osmolaridade, concentração urinária e ADH", detail: "O gradiente medular e o ADH permitem concentrar a urina. Durante exercício prolongado, água em excesso sem sódio e sem respeitar a sede pode favorecer hiponatremia, sobretudo com ADH elevado." },
      { label: "Sódio, RAAS e pressão arterial", detail: "O conteúdo de Na+ regula o volume extracelular. O RAAS não é só um mecanismo de hipertensão: é essencial para defender volume e perfusão. A resposta ao sal e ao exercício varia entre pessoas." },
      { label: "Potássio, cálcio e outros eletrólitos", detail: "K+ é majoritariamente intracelular e influencia a excitabilidade. O exercício libera K+ do músculo, mas bombas e perfusão restauram o gradiente na recuperação. Concentração sérica não representa o estoque total." },
      { label: "Equilíbrio ácido-base e exercício", detail: "pH depende da relação HCO3-/CO2: os pulmões ajustam CO2 em minutos; os rins reabsorvem bicarbonato e excretam ácido em horas. O treino melhora o transporte e o uso de lactato e a capacidade tampão." },
    ],
  },
  timeline: {
    title: "Da resposta aguda à adaptação",
    items: [
      { time: "Início", title: "Redistribuição", detail: "Ativação simpática e redução relativa do fluxo renal." },
      { time: "Prolongado", title: "Conservação", detail: "ADH e RAAS conservam água e sódio." },
      { time: "Alta intensidade", title: "Carga ácido-base", detail: "Aumento da carga ácida e redistribuição de K+." },
      { time: "Recuperação", title: "Restauração", detail: "Restauração de volume, eletrólitos e excreção de metabólitos." },
    ],
  },
  apply: "Ligue o rim à hidratação e à pressão: planos de hidratação devem partir de experiência, sede, taxa de suor e duração, evitando tanto o déficit excessivo quanto o ganho de massa por excesso de água. Responder à abertura: beber água em excesso pode diluir o sódio (hiponatremia), sobretudo com ADH alto; cefaleia e confusão são sinais que exigem interrupção e atendimento.",
  special: [
    "Peso agudo após o treino reflete sobretudo água, não gordura; o rim ajusta volume e eletrólitos.",
    "Urina escura não quantifica sozinha a desidratação; dieta, horário e solutos interferem.",
    "Cefaleia, confusão, edema, creatinina alterada ou proteinúria persistente exigem avaliação clínica.",
  ],
  mistake: {
    mistake: "Tratar variação aguda de peso como mudança de gordura, ou incentivar beber muita água 'preventivamente' em provas longas sem considerar sódio.",
    instead: "A variação aguda é sobretudo água. E excesso de água sem sódio pode causar hiponatremia; a reposição considera água, sódio e duração, guiada pela sede.",
  },
  professionalCase: {
    prompt: "Numa prova longa e quente, um aluno bebe água a cada posto 'para não desidratar', ganha peso e reclama de cefaleia e enjoo. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Interromper, buscar atendimento e, na prevenção futura, orientar reposição guiada pela sede com água e sódio, evitando ganho de massa.", tone: "recomendada", feedback: "Coerente. Ganho de peso com cefaleia e enjoo sugere diluição de sódio; confusão exige atendimento." },
      { id: "c2", label: "Recomendar beber ainda mais água para 'compensar o calor'.", tone: "cautela", feedback: "Mais água sem sódio agrava a diluição; o quadro pode piorar." },
      { id: "c3", label: "Ignorar os sintomas e mandar continuar a prova.", tone: "cautela", feedback: "Confusão é sinal de alerta; a prioridade é interromper e avaliar." },
    ],
  },
  quiz: [
    q("q1", "variavel", "A relação que resume a excreção renal de uma substância é:", [
      { id: "a", label: "Filtração menos reabsorção mais secreção." },
      { id: "b", label: "Filtração mais reabsorção menos secreção." },
    ], "a", "Excreção = filtração − reabsorção + secreção."),
    q("q2", "verdadeiro-falso", "Beber muita água pura em prova longa é sempre seguro e nunca causa problema.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "f", "Excesso de água sem sódio pode diluir o sódio plasmático (hiponatremia), sobretudo com ADH elevado."),
  ],
  uncertainty: "Creatinina varia com massa muscular, dieta e exercício; densidade e sódio urinários têm limites de interpretação. Sinais renais (creatinina, edema, proteinúria, pressão) são de avaliação clínica.",
  related: [
    { title: "Rim e néfron (aprofundamento)", href: `/aprender/conteudos/${DISC}--sistema-renal`, type: "mecanismo" },
    { title: "Sistema tegumentar e termorregulação", href: `/aprender/conteudos/${DISC}--mapa-sistema-tegumentar`, type: "mecanismo" },
    { title: "Transporte pela membrana", href: `/aprender/conteudos/${DISC}--transporte-membrana`, type: "conceito" },
  ],
  refs: [...REF_BASE, "ref-eaton-renal-2018", "ref-costanzo-2026", "ref-nas-dri-agua-2005"],
  applyRx: "Oriente hidratação guiada pela sede, taxa de suor e duração (água e sódio), explique que peso agudo é água e encaminhe sinais renais e neurológicos de alerta.",
});

const capSistemaEndocrino = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-controle-endocrino`, moduleSlug: "controle-endocrino",
  slug: `${DISC}--mapa-sistema-endocrino`, title: "Sistema endócrino: sinalização, eixos e integração metabólica",
  subtitle: "Capítulo 07 do manual", description: "Hormônios coordenam respostas de segundos a semanas. O efeito depende de concentração livre, pulsos, ritmos, receptores e estado do tecido-alvo, não só da concentração no sangue.",
  level: "avancado", minutes: 13, type: "mecanismo", kicker: K, tags: ["hormônios", "cortisol", "insulina", "eixos"],
  hero: "No exercício, sinais neurais, mecânicos e metabólicos convergem com catecolaminas, insulina, glucagon, cortisol, hormônios tireoidianos e mioquinas. O efeito depende de muito mais que a concentração no sangue.",
  question: "Um praticante com pouco sono e dieta hipocalórica vê o cortisol elevado após o treino. É 'falha adrenal' ou overtraining?",
  concepts: [
    { term: "Resposta = exposição × sensibilidade do tecido", definition: "Uma mesma concentração hormonal produz efeitos diferentes conforme receptor, tecido, estado energético e treinamento. Mais hormônio não é mais efeito quando receptores ou vias estão saturados." },
    { term: "Ritmos e pulsos importam", definition: "Eixos hormonais têm pulsos e ritmos circadianos. Uma coleta única pode perder o pulso ou o ritmo e não representar a atividade do eixo; horário, sono e exercício recente mudam o valor." },
  ],
  mechanism: {
    title: "Os seis núcleos mecanísticos",
    steps: [
      { label: "Princípios de sinalização hormonal", detail: "Peptídeos agem em receptores de membrana; esteroides e tireoidianos modulam a expressão gênica. Afinidade, ocupação, eficácia e amplificação são conceitos distintos, e proteínas transportadoras mudam a fração livre." },
      { label: "Hipotálamo, hipófise e feedback", detail: "Saída do eixo = drive central menos feedback periférico. O hipotálamo integra sinais neurais, luz, sono, estresse e energia; horário de coleta e exercício recente podem mudar hormônios sem indicar doença." },
      { label: "Insulina, glucagon e controle da glicose", detail: "A contração muscular aumenta a captação de glicose por vias parcialmente independentes de insulina. O exercício melhora a sensibilidade à insulina por horas e, com repetição, aumenta a capacidade de transporte e oxidação." },
      { label: "Tireoide e taxa metabólica", detail: "O eixo tireoidiano responde lentamente. Déficit energético prolongado pode reduzir T3 como adaptação; sintomas e contexto são essenciais antes de atribuir fadiga à tireoide, e 'metabolismo lento' não se infere só da dificuldade de perder peso." },
      { label: "Adrenais, catecolaminas e cortisol", detail: "Carga hormonal = magnitude × duração × frequência. A elevação aguda de cortisol é parte da resposta adaptativa; excesso crônico com pouca recuperação é diferente de um pico após o treino. Cortisol não é 'hormônio ruim' isolado." },
      { label: "Tecido adiposo, mioquinas e integração", detail: "Fenótipo metabólico = energia + tecido + sinalização + comportamento. Leptina informa a disponibilidade energética ao cérebro; o treino melhora a comunicação metabólica mesmo antes de grandes mudanças de peso." },
    ],
  },
  timeline: {
    title: "Da resposta aguda à adaptação",
    items: [
      { time: "Segundos", title: "Catecolaminas", detail: "Ajuste rápido de substratos pela ativação simpática." },
      { time: "Minutos", title: "Glicose", detail: "Insulina cai enquanto glucagon e cortisol ajustam a produção hepática." },
      { time: "Horas", title: "Sensibilidade", detail: "Melhora da sensibilidade à insulina e sinalização de recuperação." },
      { time: "Semanas", title: "Adaptação", detail: "Mudanças de receptores, enzimas, adipocinas e composição corporal." },
    ],
  },
  apply: "Interprete hormônios com horário, sono, alimentação, estresse e carga de treino, nunca por um valor isolado. Use o exercício como potente modulador da sensibilidade à insulina. Responder à abertura: um cortisol elevado com pouco sono e déficit energético tem várias explicações (ritmo circadiano, restrição, carga); um único resultado não define 'falha adrenal' nem overtraining.",
  special: [
    "Hipertrofia não depende de picos transitórios isolados de hormônios após o treino.",
    "Baixa disponibilidade energética prolongada pode reduzir T3, GnRH e leptina; peso estável não a exclui.",
    "Conduta hormonal, diagnóstico e medicação são do profissional de saúde; o papel aqui é reconhecer mecanismos e sinais.",
  ],
  mistake: {
    mistake: "Tratar cortisol elevado após um treino como prova de overtraining, ou creditar o ganho muscular a picos hormonais agudos.",
    instead: "Cortisol agudo é parte da resposta adaptativa e depende de horário, sono e carga. A hipertrofia acompanha tensão mecânica e recuperação ao longo de semanas, não picos isolados.",
  },
  professionalCase: {
    prompt: "Um aluno dormindo mal e em dieta muito restrita mede cortisol alto pós-treino e quer 'parar tudo por causa das adrenais'. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Explicar que sono, restrição e horário elevam o cortisol; revisar energia, sono e carga antes de concluir qualquer coisa, e encaminhar se necessário.", tone: "recomendada", feedback: "Coerente. Um resultado isolado não define falha adrenal; contexto e recuperação orientam a decisão." },
      { id: "c2", label: "Confirmar que as adrenais 'falharam' e proibir exercício.", tone: "cautela", feedback: "Cortisol elevado agudo não define falha adrenal; a conduta clínica é do profissional de saúde." },
      { id: "c3", label: "Ignorar sono e dieta e apenas aumentar a carga de treino.", tone: "cautela", feedback: "Ignorar déficit energético e sono tende a piorar a recuperação; ajuste esses fatores primeiro." },
    ],
  },
  quiz: [
    q("q1", "verdadeiro-falso", "Uma concentração hormonal maior sempre produz um efeito biológico maior.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "f", "O efeito depende de exposição × sensibilidade do tecido; com receptores ou vias saturados, mais hormônio não gera mais efeito."),
    q("q2", "conduta", "Diante de um cortisol elevado após um treino, a leitura mais prudente é:", [
      { id: "a", label: "Integrar horário, sono, alimentação e carga antes de qualquer conclusão." },
      { id: "b", label: "Diagnosticar overtraining a partir desse único valor." },
    ], "a", "Cortisol tem forte ritmo circadiano; um valor isolado não define overtraining nem falha adrenal."),
  ],
  uncertainty: "Hormônios total e livre, glicemia e HbA1c têm limites de interpretação (ligação a proteínas, momento, variabilidade). Diagnóstico e conduta hormonal são do profissional de saúde.",
  related: [
    { title: "Sistema endócrino (aprofundamento)", href: `/aprender/conteudos/${DISC}--sistema-endocrino`, type: "conceito" },
    { title: "Vias energéticas", href: `/aprender/conteudos/${DISC}--vias-energeticas`, type: "mecanismo" },
    { title: "Sistema reprodutor", href: `/aprender/conteudos/${DISC}--mapa-sistema-reprodutor`, type: "mecanismo" },
  ],
  refs: [...REF_BASE, "ref-melmed-williams-2024", "ref-endotext-stress-2020", "ref-colberg-diabetes-2016"],
  applyRx: "Leia hormônios com horário, sono, alimentação e carga; use o exercício como modulador da glicose e da sensibilidade à insulina, e encaminhe conduta hormonal ao profissional de saúde.",
});

const capSistemaDigestorio = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-sistema-digestorio`, moduleSlug: "sistema-digestorio",
  slug: `${DISC}--mapa-sistema-digestorio`, title: "Sistema digestório e hepatobiliar: da refeição ao substrato",
  subtitle: "Capítulo 08 do manual", description: "O digestório transforma alimentos em moléculas absorvíveis e regula o ritmo de entrega ao organismo. O fígado recebe nutrientes pela veia porta e decide entre oxidar, armazenar, converter e exportar.",
  level: "intermediario", minutes: 13, type: "mecanismo", kicker: K, tags: ["digestão", "absorção", "fígado", "disponibilidade energética"],
  hero: "Comer é só o começo: motilidade, secreção, absorção e fígado decidem o ritmo com que a energia chega ao corpo. O exercício muda fluxo esplâncnico, esvaziamento e tolerância gastrointestinal.",
  question: "Numa corrida longa, uma pessoa toma um gel concentrado com pouca água e tem náusea, distensão e diarreia. Por quê?",
  concepts: [
    { term: "Digestão efetiva = enzimas + superfície + tempo de contato", definition: "Composição e volume da refeição alteram o esvaziamento. Gordura, fibra e alta osmolaridade reduzem a velocidade de entrega durante o exercício, mudando a tolerância." },
    { term: "Disponibilidade energética", definition: "É a energia que sobra para as funções corporais após o gasto do exercício, relativa à massa livre de gordura. Cronicamente baixa, pode alterar eixos endócrinos, osso, imunidade e desempenho." },
  ],
  mechanism: {
    title: "Os seis núcleos mecanísticos",
    steps: [
      { label: "Motilidade e sistema nervoso entérico", detail: "Fluxo luminal = propulsão menos resistência segmentar. Exercício leve pode favorecer o trânsito, enquanto alta intensidade e estresse podem retardar o esvaziamento ou aumentar a urgência." },
      { label: "Secreções e digestão química", detail: "Saliva, ácido gástrico, enzimas pancreáticas e bile preparam os nutrientes. A bile não é enzima e não 'quebra' gordura: ela dispersa e permite a formação de micelas." },
      { label: "Absorção e transporte epitelial", detail: "Fluxo absorvido = área × permeabilidade × gradiente. A absorção não é ilimitada; transportadores, esvaziamento e perfusão podem limitar. Treinar a estratégia de ingestão aumenta a tolerância a carboidratos no endurance." },
      { label: "Barreira intestinal, microbiota e imunidade", detail: "Barreira = integridade epitelial + muco + imunidade + perfusão. Calor, hipoperfusão e exercício prolongado podem aumentar transitoriamente a permeabilidade; uma única análise de microbiota não define saúde." },
      { label: "Fígado e integração metabólica", detail: "Produção hepática de glicose = glicogenólise + gliconeogênese. Durante o exercício, o fígado sustenta a glicemia conforme duração e intensidade. Enzimas hepáticas elevadas após treino podem incluir contribuição muscular." },
      { label: "Pâncreas, balanço energético e exercício", detail: "Sinais como GLP-1 e GIP antecipam a resposta pós-prandial; saciedade depende de distensão, nutrientes, hormônios e cérebro. Nenhum hormônio isolado controla saciedade e gasto." },
    ],
  },
  timeline: {
    title: "Da resposta aguda à adaptação",
    items: [
      { time: "Pré-exercício", title: "Preparo", detail: "Esvaziamento e distribuição do conteúdo alimentar." },
      { time: "Durante", title: "Redistribuição", detail: "Redução do fluxo esplâncnico em alta intensidade e absorção de água e substratos." },
      { time: "Pós", title: "Processamento", detail: "Reposição, resposta incretínica e processamento hepático." },
      { time: "Treinamento", title: "Tolerância", detail: "Maior tolerância gastrointestinal e melhor flexibilidade metabólica." },
    ],
  },
  apply: "Ajuste a estratégia nutricional ao objetivo, ao horário e à tolerância; treine a ingestão em provas longas em vez de improvisar no dia. Responder à abertura: um gel muito concentrado com pouca água eleva a osmolaridade luminal, atrasa o esvaziamento e supera a capacidade de transporte, gerando os sintomas; diluir e treinar a estratégia ajuda.",
  special: [
    "Sintomas gastrointestinais têm escala e timing que importam; não tratar sintomas persistentes como simples 'falta de adaptação'.",
    "Progressão de volume, hidratação e prática nutricional reduz o risco gastrointestinal em provas longas.",
    "Disponibilidade energética cronicamente baixa afeta eixos endócrinos, osso e desempenho, mesmo com peso estável.",
  ],
  mistake: {
    mistake: "Dizer que a bile 'quebra' a gordura, ou tratar sintomas gastrointestinais persistentes no exercício como só 'falta de adaptação'.",
    instead: "A bile dispersa a gordura e forma micelas, sem ser enzima. E sintomas persistentes pedem revisão de estratégia, hidratação e, quando indicado, avaliação.",
  },
  professionalCase: {
    prompt: "Um corredor tem náusea e diarreia sempre que usa géis concentrados sem água em provas longas. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Treinar a estratégia de ingestão, diluir o carboidrato com água e progredir a dose ao longo das semanas, monitorando sintomas.", tone: "recomendada", feedback: "Coerente. Osmolaridade, esvaziamento e capacidade de transporte explicam o quadro; a estratégia é treinável." },
      { id: "c2", label: "Manter o gel concentrado sem água e 'aguentar' os sintomas.", tone: "cautela", feedback: "Ignorar a osmolaridade luminal tende a manter náusea e diarreia; diluir e treinar a ingestão ajuda." },
      { id: "c3", label: "Cortar todo carboidrato durante a prova para evitar sintomas.", tone: "aceitavel", feedback: "Reduzir ajuda a curto prazo, mas em provas longas o carboidrato tem papel; treine a tolerância em vez de eliminar." },
    ],
  },
  quiz: [
    q("q1", "verdadeiro-falso", "A bile é uma enzima que quebra quimicamente a gordura.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "f", "A bile não é enzima: ela emulsifica a gordura e permite a formação de micelas para a absorção."),
    q("q2", "conduta", "Sintomas gastrointestinais recorrentes com géis concentrados em provas longas sugerem:", [
      { id: "a", label: "Excesso de osmolaridade luminal e limite de transporte; treinar e diluir a estratégia." },
      { id: "b", label: "Que a pessoa nunca deve ingerir carboidrato em exercício." },
    ], "a", "A absorção não é ilimitada; a estratégia de ingestão é treinável e a diluição reduz sintomas."),
  ],
  uncertainty: "Glicemia não descreve toda a absorção, e enzimas hepáticas podem refletir contribuição muscular após o treino. Disponibilidade energética exige estimativas cuidadosas; sintomas persistentes pedem avaliação.",
  related: [
    { title: "Vias energéticas", href: `/aprender/conteudos/${DISC}--vias-energeticas`, type: "mecanismo" },
    { title: "Sistema endócrino", href: `/aprender/conteudos/${DISC}--mapa-sistema-endocrino`, type: "mecanismo" },
    { title: "Sistema esquelético e tecido conjuntivo", href: `/aprender/conteudos/${DISC}--mapa-sistema-esqueletico`, type: "mecanismo" },
  ],
  refs: [...REF_BASE, "ref-barrett-gi-2014", "ref-vander-2023", "ref-kenney-2024"],
  applyRx: "Trate a estratégia nutricional como algo treinável: ajuste composição, volume e concentração ao objetivo e à tolerância, e leve baixa disponibilidade energética a sério mesmo com peso estável.",
});

const capSistemaEsqueletico = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-sistema-esqueletico`, moduleSlug: "sistema-esqueletico",
  slug: `${DISC}--mapa-sistema-esqueletico`, title: "Osso, cartilagem e tendão: carga, remodelamento e adaptação",
  subtitle: "Capítulo 09 do manual", description: "Osso, cartilagem, tendão, ligamento e fáscia formam um sistema mecânico vivo. As células sentem a carga e ajustam síntese e degradação, com tempos de adaptação diferentes por tecido.",
  level: "intermediario", minutes: 13, type: "mecanismo", kicker: K, tags: ["osso", "tendão", "mecanotransdução", "progressão de carga"],
  hero: "Osso, tendão e cartilagem não são estruturas inertes: são tecidos vivos que leem magnitude, taxa, direção e frequência da carga e se remodelam. E cada um adapta em um tempo diferente do músculo.",
  question: "Uma pessoa ganha força muscular rápido, mas passa a sentir dor no tendão ao aumentar volume e velocidade de corrida. Por quê?",
  concepts: [
    { term: "Adaptação específica ao tecido limitante", definition: "A capacidade muscular pode aumentar antes da tolerância de tendão, cartilagem ou osso. Músculo adapta em dias a semanas; tendão, cartilagem e osso exigem progressões e tempos maiores." },
    { term: "Mecanotransdução", definition: "Integrinas, canais mecanossensíveis e citoesqueleto convertem deformação em sinalização. Adaptação ≈ estímulo específico menos custo de recuperação; estímulos muito baixos não passam do limiar, e excesso sem recuperação aumenta dano." },
  ],
  mechanism: {
    title: "Os seis núcleos mecanísticos",
    steps: [
      { label: "Estrutura óssea e propriedades mecânicas", detail: "Osso cortical dá rigidez; trabecular distribui cargas. Geometria e distribuição do material importam tanto quanto a densidade: densidade mineral isolada não descreve toda a resistência do osso." },
      { label: "Remodelamento, cálcio e hormônios", detail: "Balanço ósseo = formação menos reabsorção. O corpo prioriza o cálcio sérico, então alterações ósseas ocorrem sem grande mudança no sangue. Baixa disponibilidade energética e alterações menstruais reduzem a formação óssea." },
      { label: "Articulações, cartilagem e líquido sinovial", detail: "A cartilagem é avascular; compressão e movimento contribuem para a nutrição. 'Desgaste' descreve mal um tecido vivo com capacidade de adaptação e reparo limitado; carga moderada e movimento são necessários." },
      { label: "Tendões e transmissão de energia", detail: "Rigidez = Δforça/Δcomprimento. Complacência permite armazenar energia; a resposta depende de tensão, taxa e tempo. Isometrias, excêntricos e cargas pesadas progressivas são úteis, respeitando dor e recuperação." },
      { label: "Ligamentos, fáscia e estabilidade", detail: "Estabilidade = estrutura + controle + contexto. Ligamentos limitam extremos e informam; a estabilidade não se atribui a um único ligamento nem à 'fáscia presa'. Treino evolui de controle previsível para perturbações específicas." },
      { label: "Mecanotransdução e adaptação ao treinamento", detail: "Magnitude, taxa, duração, frequência e recuperação formam a assinatura mecânica. A sinalização ocorre com deformação fisiológica, sem exigir microlesão relevante; progrida considerando o tecido limitante." },
    ],
  },
  timeline: {
    title: "Da carga única à adaptação",
    items: [
      { time: "Carga única", title: "Sinalização", detail: "Deformação, movimento de fluido e sinalização celular." },
      { time: "Horas", title: "Matriz", detail: "Mudança de síntese e degradação da matriz." },
      { time: "Semanas", title: "Rigidez", detail: "Ajustes de rigidez, conteúdo mineral e organização." },
      { time: "Meses", title: "Remodelamento", detail: "Remodelamento estrutural e maior tolerância específica." },
    ],
  },
  apply: "Progrida a carga considerando o tecido mais lento, não só a força muscular: combine amplitude, velocidade, volume e tolerância, com progressão gradual. Responder à abertura: a força muscular subiu mais rápido que a tolerância do tendão; a dor sinaliza que a assinatura mecânica (volume e velocidade) avançou além da capacidade atual do tendão, que adapta mais devagar.",
  special: [
    "Impacto, tração muscular e variedade de direções oferecem estímulos osteogênicos distintos de exercícios sem carga.",
    "Ausência de dor em uma sessão não prova que o tecido tolerou toda a carga acumulada na semana.",
    "Dor persistente, derrame articular ou sinais de fratura por estresse mudam a decisão e podem exigir encaminhamento.",
  ],
  mistake: {
    mistake: "Progredir volume e velocidade só pela força muscular, ou tratar a dor tendínea como simples 'fraqueza' a ser vencida com mais carga.",
    instead: "Respeite o tecido limitante: tendão e osso adaptam mais devagar. Ajuste a assinatura mecânica (volume, taxa, impacto) e a recuperação, sem tratar dor tendínea como fraqueza.",
  },
  professionalCase: {
    prompt: "Um aluno que ganhou força rápido aumentou muito o volume de corrida e agora tem dor no tendão de Aquiles. Ele quer 'fortalecer mais' para resolver. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Ajustar a assinatura mecânica (reduzir volume e velocidade), introduzir carga progressiva ao tendão respeitando dor e recuperação, e monitorar.", tone: "recomendada", feedback: "Coerente. O tendão adapta mais devagar; progressão específica e recuperação orientam o retorno." },
      { id: "c2", label: "Aumentar ainda mais a carga e o volume para 'fortalecer o tendão rápido'.", tone: "cautela", feedback: "Acelerar sem respeitar o tempo de adaptação do tendão tende a agravar a dor." },
      { id: "c3", label: "Parar completamente qualquer atividade por tempo indefinido.", tone: "aceitavel", feedback: "Repouso total costuma ser desnecessário; carga progressiva controlada favorece a adaptação do tendão." },
    ],
  },
  quiz: [
    q("q1", "verdadeiro-falso", "Densidade mineral óssea isolada descreve toda a resistência do osso.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "f", "Geometria e distribuição do material importam tanto quanto a densidade; a resistência não se resume à DMO."),
    q("q2", "conduta", "Ao ganhar força muscular muito mais rápido que a tolerância do tendão, o mais prudente é:", [
      { id: "a", label: "Progredir a carga respeitando o tecido mais lento, ajustando volume, velocidade e recuperação." },
      { id: "b", label: "Progredir só pela força muscular, ignorando o tendão." },
    ], "a", "Tendão, cartilagem e osso adaptam mais devagar; a progressão deve considerar o tecido limitante."),
  ],
  uncertainty: "DXA não mede toda a geometria e qualidade; ultrassom depende de operador; dor é experiência e sinal de tolerância, não medida direta de dano. Fraturas por estresse e derrames pedem avaliação.",
  related: [
    { title: "Sistema muscular", href: `/aprender/conteudos/${DISC}--mapa-sistema-muscular`, type: "mecanismo" },
    { title: "Relação força-comprimento", href: `/aprender/conteudos/${DISC}--relacao-forca`, type: "mecanismo" },
    { title: "Sistema reprodutor", href: `/aprender/conteudos/${DISC}--mapa-sistema-reprodutor`, type: "mecanismo" },
  ],
  refs: [...REF_BASE, "ref-boron-2016", "ref-costanzo-2026", "ref-vander-2023"],
  applyRx: "Progrida a carga pensando no tecido mais lento (tendão, cartilagem, osso), varie a assinatura mecânica e trate dor persistente como sinal de ajuste, não de mais carga.",
});

const capSistemaReprodutor = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-sistema-reprodutor`, moduleSlug: "sistema-reprodutor",
  slug: `${DISC}--mapa-sistema-reprodutor`, title: "Sistema reprodutor: eixos, ciclo, gestação e energia",
  subtitle: "Capítulo 10 do manual", description: "A fisiologia reprodutiva integra hipotálamo, hipófise, gônadas e tecidos-alvo. Exercício geralmente beneficia a saúde reprodutiva, mas carga alta com baixa disponibilidade energética pode suprimir o eixo.",
  level: "avancado", minutes: 12, type: "mecanismo", kicker: K, tags: ["eixo gonadal", "ciclo menstrual", "gestação", "disponibilidade energética"],
  hero: "Pulsos de GnRH, feedback dos hormônios sexuais e estado energético regulam o eixo reprodutivo. Entender isso ajuda a apoiar a prática com segurança em diferentes fases da vida.",
  question: "Uma atleta aumenta o volume de treino, mantém o peso estável, mas passa a ter ciclos irregulares, piora do sono e uma fratura por estresse. O que conecta esses achados?",
  concepts: [
    { term: "Disponibilidade energética (EA)", definition: "EA = (ingestão − gasto do exercício) / massa livre de gordura. Quando a energia restante é insuficiente, o corpo reduz sinais como leptina, T3 e pulsos de GnRH, com consequências ósseas e metabólicas." },
    { term: "Uma coleta hormonal é uma fotografia", definition: "Hormônios sexuais variam ao longo do ciclo e do dia; uma única coleta pode ser insuficiente. Uma medida pós-treino não explica diretamente o ganho muscular de longo prazo." },
  ],
  mechanism: {
    title: "Os seis núcleos mecanísticos",
    steps: [
      { label: "Eixo hipotálamo-hipófise-gônadas", detail: "Saída gonadal = drive pulsátil menos feedback. GnRH pulsátil controla LH e FSH; a frequência e a amplitude dos pulsos mudam com energia, sono, estresse e idade. Energia disponível e recuperação preservam a função." },
      { label: "Sistema reprodutor masculino", detail: "LH estimula testosterona; FSH e testosterona sustentam a espermatogênese. A testosterona circula ligada a proteínas, com pequena fração livre; uma medida hormonal pós-treino não explica o ganho muscular de longo prazo." },
      { label: "Ciclo ovariano e menstrual", detail: "Fase folicular com estradiol crescente leva ao pico de LH e à ovulação; o corpo lúteo produz progesterona na fase lútea. O desempenho médio varia pouco entre fases, mas sintomas individuais podem justificar ajustes." },
      { label: "Gestação e exercício", detail: "A gestação aumenta volume plasmático, débito, ventilação e demanda energética, e muda o centro de massa. Sem contraindicações, o exercício adaptado pode ser benéfico; sinais de alerta e a orientação obstétrica têm prioridade." },
      { label: "Menopausa, envelhecimento e composição corporal", detail: "A queda de estradiol altera termorregulação e acelera a perda óssea; com a idade, massa muscular e aptidão tendem a cair. Treino de força e endurance preserva função: envelhecer não elimina a capacidade de adaptação." },
      { label: "Disponibilidade energética e função reprodutiva", detail: "Déficit energético persistente suprime eixos e pode coexistir com alterações menstruais, pior saúde óssea e desempenho. Ocorre em qualquer sexo, e peso estável não exclui baixa disponibilidade energética." },
    ],
  },
  timeline: {
    title: "Da sessão ao ciclo de vida",
    items: [
      { time: "Sessão", title: "Transitório", detail: "Mudanças passageiras de catecolaminas e hormônios sexuais." },
      { time: "Dias", title: "Variação normal", detail: "Variação ao longo do ciclo e da recuperação." },
      { time: "Meses", title: "Adaptação do eixo", detail: "Adaptação do eixo à energia, ao sono e à carga." },
      { time: "Ciclo de vida", title: "Fases", detail: "Puberdade, gestação, menopausa e envelhecimento." },
    ],
  },
  apply: "Trate energia, sono e recuperação como determinantes da saúde reprodutiva, não detalhes. Ajuste modalidade, impacto, posição e intensidade ao trimestre na gestação, com orientação obstétrica. Responder à abertura: os achados conectam-se por baixa disponibilidade energética, que suprime o eixo gonadal e prejudica o osso; peso estável não exclui o problema, e a solução revisa ingestão, carga e recuperação, com encaminhamento.",
  special: [
    "Na gestação sem contraindicações, exercício adaptado pode ser benéfico; FC-alvo rígida não substitui percepção, sintomas e orientação.",
    "No envelhecimento, força, impacto apropriado, proteína e sono são pilares de saúde funcional.",
    "Baixa disponibilidade energética pede revisar ingestão, carga e recuperação, e encaminhamento quando necessário, não apenas 'treinar menos' sem avaliação.",
  ],
  mistake: {
    mistake: "Concluir que, com peso estável, não há baixa disponibilidade energética, ou creditar hipertrofia a picos de testosterona pós-treino.",
    instead: "Peso estável não exclui déficit energético; ciclos, sono, osso e desempenho contam. E a hipertrofia acompanha tensão mecânica e recuperação, não picos hormonais agudos.",
  },
  professionalCase: {
    prompt: "Uma corredora com peso estável relata ciclos irregulares, sono pior e uma fratura por estresse após aumentar muito o volume. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Considerar baixa disponibilidade energética, revisar ingestão, carga e recuperação e encaminhar para avaliação de saúde e nutrição.", tone: "recomendada", feedback: "Coerente. Os achados conectam-se por déficit energético que suprime o eixo e afeta o osso; peso estável não exclui isso." },
      { id: "c2", label: "Atribuir tudo ao acaso e manter o volume alto.", tone: "cautela", feedback: "Ciclos irregulares com fratura por estresse são sinais de alerta; manter a carga tende a agravar." },
      { id: "c3", label: "Apenas mandar 'treinar menos' sem avaliar ingestão nem encaminhar.", tone: "aceitavel", feedback: "Reduzir carga ajuda, mas sem revisar energia e sem avaliação de saúde a causa pode persistir." },
    ],
  },
  quiz: [
    q("q1", "verdadeiro-falso", "Peso corporal estável exclui a possibilidade de baixa disponibilidade energética.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "f", "A disponibilidade energética depende da energia que sobra após o exercício; pode estar baixa mesmo com peso estável."),
    q("q2", "conduta", "Na gestação sem contraindicações, a orientação de intensidade deve:", [
      { id: "a", label: "Usar percepção, sintomas e orientação obstétrica, não uma FC-alvo rígida." },
      { id: "b", label: "Seguir uma FC-alvo fixa, ignorando sintomas." },
    ], "a", "FC-alvo rígida não substitui percepção, sintomas e acompanhamento pré-natal."),
  ],
  uncertainty: "Calendário menstrual não confirma ovulação sozinho, e hormônios dependem de fase e horário. Diagnóstico, gestação e conduta clínica são do profissional de saúde; o papel aqui é reconhecer mecanismos e sinais.",
  related: [
    { title: "Sistema endócrino", href: `/aprender/conteudos/${DISC}--mapa-sistema-endocrino`, type: "mecanismo" },
    { title: "Osso, cartilagem e tendão", href: `/aprender/conteudos/${DISC}--mapa-sistema-esqueletico`, type: "mecanismo" },
    { title: "Sistema digestório e hepatobiliar", href: `/aprender/conteudos/${DISC}--mapa-sistema-digestorio`, type: "mecanismo" },
  ],
  refs: [...REF_BASE, "ref-yen-jaffe-repro-2019", "ref-acog-gestacao-2020", "ref-melmed-williams-2024"],
  applyRx: "Trate energia, sono e recuperação como pilares reprodutivos; na gestação, ajuste ao trimestre com orientação obstétrica, e leve a sério baixa disponibilidade energética mesmo com peso estável.",
});

const capSistemaTegumentar = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-sistema-tegumentar`, moduleSlug: "sistema-tegumentar",
  slug: `${DISC}--mapa-sistema-tegumentar`, title: "Pele e termorregulação: calor, suor, hidratação e aclimatação",
  subtitle: "Capítulo 11 do manual", description: "A pele é barreira, órgão sensorial, imune, vascular e termorregulatório. No exercício, o calor precisa ir do núcleo à pele e ao ambiente; a aclimatação amplia a tolerância, mas não elimina riscos.",
  level: "intermediario", minutes: 13, type: "mecanismo", kicker: K, tags: ["termorregulação", "suor", "hidratação", "aclimatação"],
  hero: "Toda a energia que não vira trabalho aparece como calor. Transferir esse calor do núcleo para a pele e para o ambiente decide a segurança e o desempenho, e depende de temperatura, umidade, vento, roupa e água.",
  question: "Numa sessão quente e úmida, o aluno tem FC crescente, pele muito quente, piora de coordenação e confusão. O que priorizar?",
  concepts: [
    { term: "Suor produzido não é suor evaporado", definition: "Só a evaporação resfria de fato; gotas que escorrem pouco resfriam. Em ambiente quente e úmido, os gradientes secos diminuem e a evaporação vira a via principal, ficando mais difícil dissipar calor." },
    { term: "% perda de massa", definition: "% perda de massa = (pré − pós + ingestão − urina) / pré × 100. É uma estimativa de balanço hídrico útil, mas não deve virar meta rígida de repor 100% durante toda a atividade." },
  ],
  mechanism: {
    title: "Os seis núcleos mecanísticos",
    steps: [
      { label: "Pele como barreira e órgão fisiológico", detail: "Epiderme reduz perda de água; derme tem vasos, nervos e glândulas. A pele participa de circulação, imunidade e percepção; atrito, umidade e equipamento podem causar lesões que alteram tolerância e técnica." },
      { label: "Balanço térmico e produção de calor", detail: "Armazenamento de calor = produção menos trabalho menos perdas. A troca ocorre por radiação, convecção, condução e evaporação; intensidade, roupa e ambiente são parte da dose de exercício." },
      { label: "Fluxo sanguíneo cutâneo e controle neural", detail: "O hipotálamo aumenta a vasodilatação cutânea para transferir calor, mas isso compete com o retorno venoso e a pressão, sobretudo com desidratação. A aclimatação melhora a distribuição cardiovascular." },
      { label: "Sudorese, sódio e individualidade", detail: "Taxa de suor alta reduz o tempo de reabsorção e eleva o sal perdido. Genética, aclimatação, intensidade e ambiente geram grande variabilidade; manchas de sal não quantificam com precisão a reposição." },
      { label: "Hidratação, osmolaridade e desempenho", detail: "A perda de água reduz o volume plasmático e aumenta a osmolaridade, estimulando sede e ADH. Excesso de água pode diluir o sódio; a reposição considera água, sódio e carboidrato conforme a tarefa." },
      { label: "Aclimatação, frio e ambientes extremos", detail: "Risco ambiental = estresse externo × carga interna / capacidade. A aclimatação ao calor expande o plasma e antecipa o suor, mas regride sem exposição e não torna ninguém imune a ambientes extremos." },
    ],
  },
  timeline: {
    title: "Da resposta aguda à aclimatação",
    items: [
      { time: "Minutos", title: "Início do suor", detail: "Vasodilatação cutânea e começo da sudorese." },
      { time: "Prolongado", title: "Deriva térmica", detail: "Perda de água e sódio, deriva cardiovascular e aumento de temperatura." },
      { time: "Recuperação", title: "Restauração", detail: "Reposição de volume, resfriamento e restauração eletrolítica." },
      { time: "Aclimatação", title: "Adaptação", detail: "Maior volume plasmático, suor mais eficiente e menor custo cardiovascular." },
    ],
  },
  apply: "Trate o ambiente térmico como parte da dose: reduza a carga inicial em calor, aumente a exposição gradualmente e monitore sinais. Guie a hidratação por experiência, sede, taxa de suor e duração. Responder à abertura: pele muito quente com piora de coordenação e confusão sugere falha de dissipação de calor; a prioridade é interromper, resfriar e buscar atendimento.",
  special: [
    "Pesagem antes e depois estima o balanço hídrico, mas não deve virar meta rígida de repor 100% durante toda a atividade.",
    "Confusão, náusea e sintomas inespecíficos em ambiente quente exigem interrupção e atendimento; desidratação e hiponatremia podem coexistir.",
    "A aclimatação reduz o risco, mas não elimina o perigo em ambientes extremos.",
  ],
  mistake: {
    mistake: "Tratar suor visível como sinônimo de resfriamento, ou confiar que a aclimatação torna o aluno imune ao calor.",
    instead: "Só a evaporação resfria; gotas que escorrem pouco ajudam. E a aclimatação reduz, mas não elimina o risco: mantenha monitoramento individual em ambientes extremos.",
  },
  professionalCase: {
    prompt: "Em treino externo quente e úmido, um aluno fica com pele muito quente, confuso e com piora de coordenação. Qual conduta é prioritária?",
    choices: [
      { id: "c1", label: "Interromper imediatamente, iniciar resfriamento e buscar atendimento; confusão em ambiente quente é sinal de alerta.", tone: "recomendada", feedback: "Coerente. O quadro sugere falha de dissipação de calor; a prioridade é interromper, resfriar e avaliar." },
      { id: "c2", label: "Reduzir só um pouco a intensidade e seguir o treino.", tone: "cautela", feedback: "Com confusão e pele muito quente, continuar aumenta o risco; a conduta é interromper e resfriar." },
      { id: "c3", label: "Oferecer bastante água pura rapidamente e continuar.", tone: "cautela", feedback: "Água pura em excesso pode diluir o sódio; o essencial é interromper, resfriar e buscar atendimento." },
    ],
  },
  quiz: [
    q("q1", "verdadeiro-falso", "Suar bastante, com gotas escorrendo, é sinal de resfriamento eficiente.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "f", "Só a evaporação resfria; suor que escorre pouco contribui para dissipar calor."),
    q("q2", "conduta", "Pele muito quente com confusão e piora de coordenação em ambiente quente pede:", [
      { id: "a", label: "Interrupção, resfriamento e atendimento." },
      { id: "b", label: "Apenas reduzir a intensidade e continuar." },
    ], "a", "Confusão em ambiente quente é sinal de alerta e exige interromper, resfriar e avaliar."),
  ],
  uncertainty: "WBGT e temperatura têm limites de método e não substituem o monitoramento individual. Variação de massa inclui ingestão, urina e substratos; a conduta em doença pelo calor é de urgência.",
  related: [
    { title: "Rins: filtração e equilíbrio", href: `/aprender/conteudos/${DISC}--mapa-sistema-renal`, type: "mecanismo" },
    { title: "Sistema cardiovascular", href: `/aprender/conteudos/${DISC}--mapa-sistema-cardiovascular`, type: "mecanismo" },
    { title: "Sangue, linfa e imunidade", href: `/aprender/conteudos/${DISC}--mapa-sistema-hematologico`, type: "mecanismo" },
  ],
  refs: [...REF_BASE, "ref-nas-dri-agua-2005", "ref-kenney-2024", "ref-costanzo-2026"],
  applyRx: "Trate calor, umidade, roupa e água como parte da dose; aclimate de forma gradual, guie a hidratação pela sede e taxa de suor, e interrompa diante de sinais de doença pelo calor.",
});

/**
 * Módulos na ordem dos capítulos do manual (Ribeiro, 2026): um módulo por
 * sistema, aberto pela aula-capítulo (visão completa, 6 núcleos, caso de
 * integração) e seguido pelos aprofundamentos já autorados.
 */
export const fisiologiaHumanaModules: Module[] = [
  deepModule({ id: `m-${DISC}-sistema-nervoso`, disciplineId: DISC_ID, slug: "sistema-nervoso", title: "Sistema nervoso", objective: "Relacionar excitabilidade, comando motor, controle autonômico e fadiga central à decisão de exercício.", order: 1, level: "intermediario", lessons: [capSistemaNervoso, bioeletricidade, transporteMembrana], applications: ["Tratar técnica, atenção e ambiente como parte da dose neural"] }),
  deepModule({ id: `m-${DISC}-tecidos-movimento`, disciplineId: DISC_ID, slug: "tecidos-do-movimento", title: "Sistema muscular", objective: "Explicar como a força emerge de arquitetura, pontes cruzadas, unidades motoras e alavancas, e como fadiga e hipertrofia se organizam.", order: 2, level: "intermediario", prerequisites: [`m-${DISC}-sistema-nervoso`], lessons: [capSistemaMuscular, musculo, relacaoForca], applications: ["Explicar força além do tamanho e escolher amplitude pelo pico de tensão"] }),
  deepModule({ id: `m-${DISC}-sistema-cardiovascular`, disciplineId: DISC_ID, slug: "sistema-cardiovascular", title: "Sistema cardiovascular", objective: "Compreender ritmo, bomba, vasos, pressão e distribuição do fluxo no esforço.", order: 3, level: "fundamental", lessons: [capSistemaCardiovascular, debito, cicloCardiaco, pressao], applications: ["Interpretar FC e pressão como resposta e cuidar da hipertensão"] }),
  deepModule({ id: `m-${DISC}-sistema-respiratorio`, disciplineId: DISC_ID, slug: "sistema-respiratorio", title: "Sistema respiratório", objective: "Relacionar mecânica ventilatória, difusão, V/Q, transporte de gases e controle da ventilação.", order: 4, level: "fundamental", prerequisites: [`m-${DISC}-sistema-cardiovascular`], lessons: [capSistemaRespiratorio, ventilacao, transporteGases, consumo], applications: ["Guiar intensidade pela fala e explicar a entrega de O2"] }),
  deepModule({ id: `m-${DISC}-sistema-hematologico`, disciplineId: DISC_ID, slug: "sistema-hematologico", title: "Sistema hematológico, linfático e imunológico", objective: "Separar concentração, redistribuição e mudança real de massa ao ler sangue, imunidade e edema.", order: 5, level: "intermediario", prerequisites: [`m-${DISC}-sistema-cardiovascular`], lessons: [capSistemaHematologico], applications: ["Padronizar exames e não confundir hemoconcentração com produção"] }),
  deepModule({ id: `m-${DISC}-sistema-renal`, disciplineId: DISC_ID, slug: "sistema-renal", title: "Sistema renal e urinário", objective: "Explicar filtração, transporte tubular, água, sódio, potássio e equilíbrio ácido-base aplicados ao exercício.", order: 6, level: "intermediario", lessons: [capSistemaRenal, renal], applications: ["Ligar rim à hidratação e à pressão e reconhecer hiponatremia"] }),
  deepModule({ id: `m-${DISC}-controle-endocrino`, disciplineId: DISC_ID, slug: "controle-endocrino", title: "Sistema endócrino", objective: "Interpretar hormônios como rede de eixos, pulsos, ritmos e sensibilidade do tecido.", order: 7, level: "avancado", lessons: [capSistemaEndocrino, endocrino], applications: ["Evitar explicações de um hormônio só e encaminhar conduta hormonal"] }),
  deepModule({ id: `m-${DISC}-sistema-digestorio`, disciplineId: DISC_ID, slug: "sistema-digestorio", title: "Sistema digestório e hepatobiliar", objective: "Relacionar motilidade, secreção, absorção, fígado e disponibilidade energética ao exercício.", order: 8, level: "intermediario", prerequisites: [`m-${DISC}-controle-endocrino`], lessons: [capSistemaDigestorio, viasEnergeticas], applications: ["Treinar a estratégia de ingestão e progredir sem zonas mágicas"] }),
  deepModule({ id: `m-${DISC}-sistema-esqueletico`, disciplineId: DISC_ID, slug: "sistema-esqueletico", title: "Sistema esquelético, articular e tecido conjuntivo", objective: "Aplicar mecanotransdução e tempos de adaptação de osso, cartilagem e tendão à progressão de carga.", order: 9, level: "intermediario", prerequisites: [`m-${DISC}-tecidos-movimento`], lessons: [capSistemaEsqueletico], applications: ["Progredir pelo tecido limitante, não só pela força muscular"] }),
  deepModule({ id: `m-${DISC}-sistema-reprodutor`, disciplineId: DISC_ID, slug: "sistema-reprodutor", title: "Sistema reprodutor", objective: "Integrar eixo gonadal, ciclo, gestação, envelhecimento e disponibilidade energética à prática.", order: 10, level: "avancado", prerequisites: [`m-${DISC}-controle-endocrino`], lessons: [capSistemaReprodutor], applications: ["Reconhecer baixa disponibilidade energética e ajustar na gestação"] }),
  deepModule({ id: `m-${DISC}-sistema-tegumentar`, disciplineId: DISC_ID, slug: "sistema-tegumentar", title: "Sistema tegumentar e termorregulação", objective: "Explicar balanço térmico, fluxo cutâneo, sudorese, hidratação e aclimatação com segurança ambiental.", order: 11, level: "intermediario", prerequisites: [`m-${DISC}-sistema-cardiovascular`], lessons: [capSistemaTegumentar], applications: ["Tratar calor e hidratação como parte da dose e reconhecer sinais de alerta"] }),
  deepModule({ id: `m-${DISC}-adaptacoes`, disciplineId: DISC_ID, slug: "adaptacoes", title: "Integração e adaptação", objective: "Integrar os sistemas no movimento, distinguir resposta de adaptação e ler cada variável como faixa regulada.", order: 12, level: "intermediario", prerequisites: [`m-${DISC}-sistema-digestorio`], lessons: [integracao, homeostaseControle, agudaCronica, homeostase], applications: ["Ler a carga de forma integrada e progredir o estímulo"] }),
];

export const fisiologiaHumanaLessons: Lesson[] = [
  capSistemaNervoso, bioeletricidade, transporteMembrana,
  capSistemaMuscular, musculo, relacaoForca,
  capSistemaCardiovascular, debito, cicloCardiaco, pressao,
  capSistemaRespiratorio, ventilacao, transporteGases, consumo,
  capSistemaHematologico,
  capSistemaRenal, renal,
  capSistemaEndocrino, endocrino,
  capSistemaDigestorio, viasEnergeticas,
  capSistemaEsqueletico,
  capSistemaReprodutor,
  capSistemaTegumentar,
  integracao, homeostaseControle, agudaCronica, homeostase,
];
