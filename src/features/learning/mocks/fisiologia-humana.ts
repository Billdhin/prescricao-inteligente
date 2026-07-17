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
  figure: { id: "unidade-motora" },
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
  figure: { id: "sarcomero-pontes" },
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
      {
        label: "Arquitetura muscular e transmissão de força",
        detail:
          "Fibras formam fascículos e se conectam a uma rede contínua de endomísio, perimísio, epimísio e tendão. Comprimento fascicular favorece excursão e velocidade; área fisiológica de secção favorece força; penação permite acomodar mais fibras em paralelo. Parte da força é transmitida lateralmente pela matriz, e o braço de momento converte força muscular em torque articular. Sequência: (1) sarcômeros geram tensão; (2) miofibrilas somam em paralelo; (3) a matriz distribui a carga; (4) o tendão transmite e armazena energia. Relação: torque = força × braço de momento. Aplicação ao exercício: hipertrofia, arquitetura e coordenação podem alterar o desempenho de maneiras diferentes, mesmo com perímetro semelhante. Como medir: ultrassom, área de secção, comprimento fascicular, ângulo de penação e rigidez tendínea. Erro frequente: tratar tamanho muscular como equivalente a força específica ou a torque em todas as amplitudes.",
      },
      {
        label: "Acoplamento excitação-contração",
        detail:
          "O potencial de ação percorre o sarcolema e os túbulos T. O sensor de voltagem DHPR altera a conformação do RyR1 no retículo sarcoplasmático, liberando Ca2+. O Ca2+ liga-se à troponina C e desloca a tropomiosina, permitindo a interação actina-miosina. O relaxamento exige dissociação do Ca2+ e recaptação ativa pela SERCA. Sequência: (1) potencial nos túbulos T; (2) ativação DHPR-RyR1; (3) transiente de Ca2+; (4) recaptação por SERCA. Relação: a força ativada depende de Ca2+ × sensibilidade miofibrilar. Aplicação ao exercício: a perda de força em séries repetidas pode ocorrer por menor liberação de Ca2+ e menor sensibilidade miofibrilar, antes de qualquer depleção total de ATP. Como medir: transiente de Ca2+, taxa de relaxamento, potencial muscular e força evocada. Erro frequente: achar que o ATP serve apenas para produzir força; ele também separa pontes e sustenta bombas iônicas, por isso relaxar custa energia.",
      },
      {
        label: "Ciclo das pontes cruzadas e custo energético",
        detail:
          "A cabeça de miosina liga-se à actina, libera fosfato, realiza o golpe de força, desliga-se quando o ATP se liga e é recarregada após a hidrólise. A força macroscópica depende do número de pontes ligadas, do tempo de ligação e da deformação elástica. A economia varia entre tipos de fibra e modos de ação. Sequência: (1) exposição do sítio na actina; (2) formação da ponte; (3) golpe de força; (4) desligamento e recarga com ATP. Relação: potência = força × velocidade. Aplicação ao exercício: ações excêntricas toleram forças elevadas com menor custo metabólico relativo, mas podem produzir maior estresse mecânico em quem não está adaptado. Como medir: força, rigidez, consumo de O2, taxa de desenvolvimento de força e tempo sob tensão. Erro frequente: supor que a quantidade de ATP consumida se traduz linearmente em força produzida.",
      },
      {
        label: "Unidades motoras e tipos de fibra",
        detail:
          "Uma unidade motora inclui um motoneurônio e todas as fibras que ele inerva. Em muitas tarefas, unidades de menor limiar são recrutadas antes das de maior limiar, enquanto o aumento da frequência eleva a soma temporal da força. Fibras tipo I, IIa e IIx diferem em miosina, velocidade, metabolismo e resistência à fadiga, mas exibem plasticidade. Sequência: (1) recrutamento por limiar; (2) aumento da frequência de disparo; (3) coordenação entre unidades; (4) mudança fenotípica com o treinamento. Relação: força neural = recrutamento + frequência + coordenação. Aplicação ao exercício: a intenção explosiva pode recrutar unidades de alto limiar mais cedo, sem exigir que todas as séries usem cargas máximas. Como medir: EMG, interpolação de twitch, histologia, velocidade de contração e resistência à fadiga. Erro frequente: imaginar que as fibras rápidas só entram após falha completa das fibras lentas.",
      },
      {
        label: "Comprimento-tensão, força-velocidade e potência",
        detail:
          "A força ativa varia com a sobreposição dos filamentos e com a geometria do músculo; a força passiva cresce com o alongamento de titina, fáscia e tendão. Em ações concêntricas, maior velocidade reduz o tempo de formação de pontes; em ações excêntricas, a força pode superar a isométrica. A potência máxima costuma ocorrer em combinações intermediárias de força e velocidade. Sequência: (1) o comprimento define a sobreposição; (2) a velocidade altera o tempo de ligação; (3) o modo de ação muda força e custo; (4) as alavancas articulares modulam o torque. Relação: impulso = integral da força no tempo. Aplicação ao exercício: a escolha de amplitude e de exercício muda a região de maior tensão, mesmo quando carga externa e repetições são iguais. Como medir: comprimento fascicular, torque angular, velocidade, potência, impulso e perda de velocidade. Erro frequente: aplicar curvas musculares isoladas diretamente ao exercício sem considerar braço de momento e técnica.",
      },
      {
        label: "Fadiga, dano e hipertrofia",
        detail:
          "Fadiga é a redução da capacidade de produzir força ou potência e pode envolver comando neural, excitabilidade, Ca2+, fosfato inorgânico, pH, substratos e temperatura. Dano estrutural não é requisito para hipertrofia: tensão mecânica e trabalho próximos da capacidade recrutam sinalização por integrinas, FAK, mTORC1, ribossomos e células satélites, modulada por proteína, energia e sono. Sequência: (1) perturbação aguda e fadiga; (2) recuperação de íons e substratos; (3) síntese proteica e remodelamento; (4) adaptação específica à carga. Relação: balanço proteico = síntese menos degradação. Aplicação ao exercício: a progressão deve manipular volume, intensidade, amplitude, proximidade da falha e recuperação, não apenas 'sentir dor'. Como medir: perda de velocidade, força isométrica, dor, CK, espessura muscular e área de secção. Erro frequente: tratar lactato e dor tardia como causa única ou como medida suficiente da qualidade do estímulo.",
      },
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
  specialTitle: "Medida e interpretação: o que cada variável informa e onde ela cala",
  special: [
    "1RM e 5RM representam a carga máxima para um número de repetições. Limite: dependem de técnica e familiarização, então mudam sem que a capacidade tenha mudado.",
    "Velocidade representa a velocidade concêntrica da carga. Limite: é útil para estimar esforço e fadiga, não para afirmar hipertrofia.",
    "Torque representa o momento de força articular. Limite: exige conhecer o braço de momento; sem isso, a carga externa engana.",
    "EMG representa atividade elétrica superficial ou intramuscular. Limite: não mede força diretamente.",
    "Ultrassom representa espessura e arquitetura. Limite: é sensível a posição, hidratação e técnica do operador.",
    "Regra de ouro do manual: uma medida não revela automaticamente o mecanismo. Ela restringe hipóteses quando método, unidade, condição basal, tempo, ambiente e tendência individual são conhecidos.",
    "Sinal de segurança: dor torácica, síncope, confusão, déficit neurológico, dispneia desproporcional, sangramento relevante ou piora rápida exigem interrupção e avaliação apropriada.",
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
    q("q3", "variavel", "Por que o ATP é necessário para o músculo RELAXAR?", [
      { id: "a", label: "Porque ele separa as pontes cruzadas e sustenta as bombas que recaptam o Ca2+." },
      { id: "b", label: "Porque o relaxamento é totalmente passivo e não consome energia." },
    ], "a", "O ATP desliga a ponte e alimenta a SERCA; sem ele, a fibra não solta e não recapta o Ca2+."),
    q("q4", "conduta", "A perda de força ao longo de séries repetidas pode começar por:", [
      { id: "a", label: "Menor liberação de Ca2+ e menor sensibilidade miofibrilar, antes de qualquer depleção total de ATP." },
      { id: "b", label: "Depleção total de ATP já na primeira série." },
    ], "a", "O acoplamento excitação-contração falha antes: a força cai por Ca2+ e sensibilidade, não por ATP zerado."),
    q("q5", "verdadeiro-falso", "Duas pessoas com o mesmo perímetro de braço necessariamente produzem o mesmo torque.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "f", "Torque = força × braço de momento; arquitetura, penação, alavanca e coordenação mudam o resultado com o mesmo perímetro."),
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
  figure: { id: "debito-cardiaco" },
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
      {
        label: "Automatismo, condução e ECG",
        detail:
          "Células marca-passo despolarizam espontaneamente por correntes dependentes de tempo e Ca2+. O nó sinoatrial normalmente domina; o nó AV produz atraso; o sistema His-Purkinje sincroniza os ventrículos. O ECG registra diferenças de potencial na superfície corporal, refletindo direção e tempo da despolarização e da repolarização, não força mecânica. Sequência: (1) despolarização diastólica; (2) condução atrial e atraso AV; (3) ativação ventricular rápida; (4) repolarização e refratariedade. Relação: FC = 60 dividido pelo intervalo RR em segundos. Aplicação ao exercício: monitores ópticos estimam pulso; irregularidade, sintomas ou respostas inesperadas não equivalem a diagnóstico por ECG. Como medir: FC, ritmo, PR, QRS, QTc e recuperação da FC. Erro frequente: achar que o tamanho do QRS mede a força de contração ou que a onda T é o 'relaxamento mecânico'.",
      },
      {
        label: "Ciclo cardíaco, válvulas e pressões",
        detail:
          "Válvulas abrem e fecham conforme gradientes de pressão. O ciclo inclui enchimento, contração isovolumétrica, ejeção e relaxamento isovolumétrico. Volume diastólico final, volume sistólico final e complacência determinam o volume sistólico. Os sons cardíacos relacionam-se principalmente ao fechamento valvar e a vibrações do sistema. Sequência: (1) enchimento ventricular; (2) elevação isovolumétrica da pressão; (3) ejeção pelas semilunares; (4) relaxamento e reabertura AV. Relação: volume sistólico = VDF menos VSF. Aplicação ao exercício: frequências muito altas reduzem o tempo diastólico; condicionamento e retorno venoso ajudam a preservar o volume sistólico em esforços submáximos. Como medir: volumes ventriculares, fração de ejeção, pressões e tempo diastólico. Erro frequente: tratar fração de ejeção normal como prova de função cardiovascular global normal.",
      },
      {
        label: "Débito cardíaco, retorno venoso e Frank-Starling",
        detail:
          "O débito é a frequência cardíaca vezes o volume sistólico. O mecanismo de Frank-Starling ajusta a força ao enchimento dentro da faixa fisiológica; a contratilidade modifica o desempenho para um mesmo comprimento inicial. O retorno venoso depende do volume sanguíneo estressado, do tônus venoso, da bomba muscular, da respiração e da postura. Sequência: (1) bomba muscular e respiratória; (2) aumento do enchimento; (3) ejeção proporcional ao retorno; (4) ajuste simpático da contratilidade. Relação: DC = FC × VS. Aplicação ao exercício: calor e desidratação reduzem o volume central e podem produzir deriva cardiovascular, com a FC subindo para sustentar o débito enquanto o volume sistólico cai. Como medir: FC, volume sistólico, débito, pré-carga, contratilidade e recuperação. Erro frequente: confundir pré-carga com o volume total do corpo, e pós-carga com apenas a pressão sistólica.",
      },
      {
        label: "Vasos, resistência e função endotelial",
        detail:
          "O fluxo depende do gradiente de pressão e da resistência. Pequenas mudanças no raio arteriolar produzem grande efeito sobre a resistência. O endotélio detecta cisalhamento e libera NO, prostanoides e fatores constritores, modulando tônus, inflamação e hemostasia. Artérias elásticas amortecem pulsos; veias armazenam volume e influenciam o retorno. Sequência: (1) o gradiente impulsiona o fluxo; (2) as arteríolas ajustam a resistência; (3) o endotélio responde ao cisalhamento; (4) as veias controlam a capacitância. Relação: fluxo = ΔP dividido por R. Aplicação ao exercício: a vasodilatação ativa do músculo resulta de metabólitos, K+, adenosina, NO e sinais neurais, e não de simples 'desligamento simpático'. Como medir: pressão, fluxo, condutância, diâmetro, velocidade de onda de pulso e dilatação mediada por fluxo. Erro frequente: supor que pressão alta implica fluxo alto; se a resistência também subiu, o fluxo pode não ter aumentado.",
      },
      {
        label: "Microcirculação e troca capilar",
        detail:
          "Capilares oferecem grande área e baixa velocidade para as trocas. O movimento de água depende de pressões hidrostáticas, osmóticas e da permeabilidade, enquanto solutos atravessam por difusão, transporte e convecção. O sistema linfático devolve proteínas e líquido ao sangue, e o recrutamento capilar melhora a distância de difusão e a distribuição do fluxo. Sequência: (1) perfusão arteriolar; (2) difusão entre sangue e tecido; (3) filtração e reabsorção dinâmica; (4) drenagem linfática. Relação: VO2 = DC × (CaO2 menos CvO2). Aplicação ao exercício: edema, temperatura e congestão devem ser avaliados em conjunto; mudanças agudas de volume plasmático alteram a concentração de vários marcadores. Como medir: fluxo regional, extração de O2, volume plasmático, edema e pressão capilar. Erro frequente: usar a formulação clássica de 'filtração arterial e reabsorção venosa' como se fosse completa; o glicocálix e a drenagem linfática são centrais.",
      },
      {
        label: "Pressão arterial, reflexos e adaptações ao treino",
        detail:
          "Barorreceptores, quimiorreceptores, rim, hormônios e controle local sustentam a pressão. Durante o exercício dinâmico, o débito sobe e a resistência total costuma cair; no exercício resistido, compressão vascular e manobra de Valsalva podem elevar a pressão transitoriamente. O treinamento modifica volume plasmático, função endotelial, autonomia e remodelamento cardíaco. Sequência: (1) o barorreflexo redefine o ponto operacional; (2) o rim ajusta volume em longo prazo; (3) o exercício altera débito e resistência; (4) o treino remodela coração e vasos. Relação: PAM ≈ PAD + 1/3 (PAS menos PAD). Aplicação ao exercício: história, sintomas e trajetória são mais informativos que um valor isolado para diferenciar adaptação fisiológica de condição clínica. Como medir: PA padronizada, resposta ao esforço, FC de repouso, ecocardiografia e VO2. Erro frequente: rotular automaticamente como benigno todo aumento de espessura ventricular em atleta.",
      },
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
  specialTitle: "Medida e interpretação: o que cada variável informa e onde ela cala",
  special: [
    "Pressão arterial representa a força exercida sobre a parede arterial. Limite: técnica, manguito e postura alteram o valor.",
    "Frequência cardíaca representa eventos por minuto. Limite: a mesma FC pode representar débitos diferentes.",
    "Débito cardíaco representa volume por minuto. Limite: o método determina a precisão.",
    "Fração de ejeção representa a proporção ejetada do VDF. Limite: não descreve toda a função cardíaca.",
    "VO2 representa a captação sistêmica de oxigênio. Limite: integra circulação, pulmão e músculo, então não isola nenhum deles.",
    "Regra de ouro do manual: uma medida não revela automaticamente o mecanismo. Ela restringe hipóteses quando método, unidade, condição basal, tempo, ambiente e tendência individual são conhecidos.",
    "Sinal de segurança: dor torácica, síncope, confusão, déficit neurológico, dispneia desproporcional, sangramento relevante ou piora rápida exigem interrupção e avaliação apropriada.",
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
    q("q3", "variavel", "O que o ECG mede, de fato?", [
      { id: "a", label: "Direção e tempo da despolarização e repolarização na superfície do corpo." },
      { id: "b", label: "A força de contração do ventrículo." },
    ], "a", "O ECG é elétrico, não mecânico: o tamanho do QRS não mede força, e a onda T não é relaxamento mecânico."),
    q("q4", "conduta", "Por que o raio das arteríolas é tão decisivo para o fluxo?", [
      { id: "a", label: "Porque pequenas mudanças de raio produzem grande efeito sobre a resistência (fluxo = ΔP / R)." },
      { id: "b", label: "Porque as arteríolas armazenam a maior parte do volume sanguíneo." },
    ], "a", "As arteríolas ajustam a resistência; as veias é que controlam capacitância e armazenam volume."),
    q("q5", "verdadeiro-falso", "Pressão alta implica necessariamente fluxo alto no tecido.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "f", "Se a resistência subiu junto, o fluxo pode não aumentar: fluxo depende do gradiente dividido pela resistência."),
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
  figure: { id: "ventilacao-troca" },
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
      {
        label: "Mecânica ventilatória e pressões",
        detail:
          "A inspiração em repouso ocorre quando o diafragma e os músculos inspiratórios tornam a pressão pleural mais negativa, expandindo o pulmão e reduzindo a pressão alveolar. A expiração tranquila é majoritariamente passiva. Complacência descreve mudança de volume por pressão; a resistência depende fortemente do calibre das vias aéreas e do regime de fluxo. Sequência: (1) contração inspiratória; (2) queda da pressão alveolar; (3) entrada de ar; (4) recuo elástico expiratório. Relação: complacência = ΔV dividido por ΔP. Aplicação ao exercício: músculos acessórios e expiratórios ativos são recrutados, e a hiperinsuflação dinâmica pode aumentar o trabalho respiratório em indivíduos suscetíveis. Como medir: volumes pulmonares, pressão, fluxo, complacência e resistência. Erro frequente: explicar a ventilação como 'puxar oxigênio'; o ar se move por gradientes de pressão.",
      },
      {
        label: "Volumes, ventilação minuto e espaço morto",
        detail:
          "Ventilação minuto é a frequência respiratória vezes o volume corrente, mas apenas a fração que alcança alvéolos perfundidos participa das trocas. O espaço morto anatômico e o fisiológico tornam a ventilação alveolar inferior à ventilação total. Aumentar o volume corrente costuma ser mais eficiente do que elevar apenas a frequência, até os limites mecânicos. Sequência: (1) definição do volume corrente; (2) subtração do espaço morto; (3) distribuição regional; (4) ajuste de frequência e profundidade. Relação: VA = (VT menos VD) × f. Aplicação ao exercício: no exercício progressivo o volume corrente aumenta primeiro; em intensidades altas, a frequência assume maior contribuição. Como medir: VE, VT, frequência respiratória, ventilação alveolar e equivalente ventilatório. Erro frequente: supor que ventilação alta significa oxigenação adequada, mesmo com perfusão ou difusão comprometidas.",
      },
      {
        label: "Difusão e relação ventilação-perfusão",
        detail:
          "O fluxo de gases pela membrana alveolocapilar depende da área, da espessura, do gradiente de pressão e do coeficiente de difusão. Unidades com V/Q baixo recebem sangue com pouca ventilação; V/Q alto desperdiça ventilação em relação à perfusão. O pulmão saudável reduz desigualdades por recrutamento vascular e vasoconstrição hipóxica regional. Sequência: (1) a ventilação leva gás ao alvéolo; (2) a perfusão traz sangue venoso; (3) a difusão equilibra pressões; (4) o V/Q determina a eficiência regional. Relação: fluxo difusivo proporcional a área × gradiente dividido pela espessura. Aplicação ao exercício: maior débito recruta capilares e aumenta a capacidade de difusão; em atletas de elite, um tempo capilar muito curto pode contribuir para dessaturação em condições específicas. Como medir: SpO2, gases arteriais, DLCO, V/Q e gradiente alvéolo-arterial. Erro frequente: concluir que SpO2 normal exclui grande trabalho ventilatório; e SpO2 baixa em sensor óptico pode ser artefato.",
      },
      {
        label: "Transporte de oxigênio e dióxido de carbono",
        detail:
          "A maior parte do O2 é transportada ligada à hemoglobina; a parcela dissolvida determina a pressão parcial. A curva sigmoide permite alta saturação nos pulmões e liberação nos tecidos. O CO2 circula dissolvido, ligado a proteínas e principalmente como bicarbonato. Temperatura, pH e 2,3-BPG modulam a afinidade da hemoglobina. Sequência: (1) ligação do O2 à Hb; (2) transporte convectivo pelo débito; (3) extração tecidual; (4) conversão CO2-bicarbonato. Relação: CaO2 ≈ 1,34 × Hb × SaO2 + 0,003 × PaO2. Aplicação ao exercício: o exercício desloca a curva para a direita nos tecidos, favorecendo a liberação de O2 sem impedir saturação pulmonar adequada. Como medir: Hb, saturação, conteúdo arterial, diferença arteriovenosa e produção de CO2. Erro frequente: confundir saturação com conteúdo; a anemia pode manter SpO2 normal com menor transporte total de O2.",
      },
      {
        label: "Controle neural e químico da ventilação",
        detail:
          "Centros bulbares geram o ritmo e integram quimiorreceptores centrais e periféricos, mecanorreceptores, comando central e aferências musculares. CO2 e pH são fortes reguladores em repouso, mas no início do exercício a ventilação aumenta por mecanismos antecipatórios. A percepção de dispneia resulta do balanço entre o comando respiratório e a resposta mecânica. Sequência: (1) ritmo respiratório central; (2) sinal antecipatório do exercício; (3) feedback químico e mecânico; (4) ajuste fino da ventilação. Relação: PaCO2 proporcional à produção de CO2 dividida pela ventilação alveolar. Aplicação ao exercício: respirar voluntariamente devagar pode mudar a sensação e a ventilação, mas não substitui a resposta necessária à produção de CO2 em intensidades altas. Como medir: PaCO2, pH, VE, frequência, pressão inspiratória e dispneia. Erro frequente: dizer que quimiorreceptores 'medem falta de ar'; eles respondem a variáveis químicas específicas.",
      },
      {
        label: "Limiar ventilatório, economia e adaptação",
        detail:
          "À medida que a intensidade aumenta, a maior produção de CO2 pelo tamponamento de H+ acelera a ventilação de forma não linear. O limiar ventilatório é uma estimativa de transições metabólicas, não um ponto único e universal. O treinamento melhora economia, capacidade oxidativa e tolerância, enquanto o pulmão estrutural geralmente apresenta menor plasticidade que coração e músculo. Sequência: (1) aumento proporcional inicial; (2) excesso de CO2 pelo tamponamento; (3) hiperventilação compensatória; (4) a adaptação periférica reduz a demanda relativa. Relação: equivalente ventilatório = VE dividido por VO2. Aplicação ao exercício: zonas de treino podem usar fala, RPE, limiares ou teste cardiopulmonar, conforme objetivo e recursos. Como medir: VE/VO2, VE/VCO2, RER, limiares, VO2 e economia. Erro frequente: dizer que o lactato 'entra no pulmão'; a ventilação responde ao CO2, ao H+ e à integração neural.",
      },
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
  specialTitle: "Medida e interpretação: o que cada variável informa e onde ela cala",
  special: [
    "Espirometria representa volumes e fluxos forçados. Limite: depende de esforço e técnica, então um valor ruim pode ser execução, não pulmão.",
    "Ventilação minuto representa o volume total ventilado por minuto. Limite: inclui espaço morto, então não é o que chegou ao alvéolo.",
    "SpO2 representa uma estimativa periférica da saturação. Limite: é sensível a movimento e perfusão, e saturação não é conteúdo.",
    "VO2 e VCO2 representam as trocas gasosas sistêmicas. Limite: exigem calibração e protocolo.",
    "Dispneia representa a percepção respiratória. Limite: escala e contexto precisam ser padronizados.",
    "Regra de ouro do manual: uma medida não revela automaticamente o mecanismo. Ela restringe hipóteses quando método, unidade, condição basal, tempo, ambiente e tendência individual são conhecidos.",
    "Sinal de segurança: dor torácica, síncope, confusão, déficit neurológico, dispneia desproporcional, sangramento relevante ou piora rápida exigem interrupção e avaliação apropriada.",
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
    q("q3", "variavel", "Qual a diferença entre ventilação minuto (VE) e ventilação alveolar (VA)?", [
      { id: "a", label: "A VA desconta o espaço morto: só a fração que chega a alvéolos perfundidos troca gás." },
      { id: "b", label: "São sinônimos, medidos em unidades diferentes." },
    ], "a", "VA = (VT − VD) × f. Por isso ventilação alta não garante oxigenação adequada."),
    q("q4", "conduta", "No início do exercício, a ventilação aumenta principalmente por:", [
      { id: "a", label: "Comando central antecipatório, antes de grandes mudanças químicas." },
      { id: "b", label: "Queda imediata e acentuada da SpO2." },
    ], "a", "A ventilação sobe por antecipação; o feedback químico de CO2 e H+ estabiliza a resposta depois."),
    q("q5", "verdadeiro-falso", "O lactato chega ao pulmão e é isso que faz a ventilação subir de forma desproporcional.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "f", "O lactato não 'entra no pulmão': a ventilação responde ao CO2 gerado no tamponamento de H+ e à integração neural."),
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
  figure: { id: "dissociacao-o2" },
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
      {
        label: "Plasma, volume sanguíneo e concentração",
        detail:
          "O sangue combina células com plasma, que contém água, eletrólitos, proteínas, nutrientes e mediadores. Postura, suor, ingestão e trocas capilares podem alterar o volume plasmático em minutos. Assim, hematócrito, hemoglobina e proteínas podem aumentar por hemoconcentração, sem aumento de massa total. Sequência: (1) distribuição de água; (2) pressões capilares; (3) retenção por proteínas; (4) ajuste renal e hormonal. Relação: concentração = quantidade dividida por volume. Aplicação ao exercício: padronizar horário, postura, hidratação e intervalo após o exercício melhora a comparação de exames. Como medir: volume plasmático, hematócrito, albumina, osmolaridade e massa corporal. Erro frequente: interpretar maior concentração pós-exercício como produção imediata do componente.",
      },
      {
        label: "Eritrócitos, hemoglobina e ferro",
        detail:
          "Eritrócitos transportam hemoglobina e são produzidos na medula sob influência da eritropoetina renal. Ferro, folato, B12, proteína e ausência de inflamação limitante são necessários. A massa de hemoglobina determina grande parte do transporte de O2; a concentração depende também do volume plasmático. Sequência: (1) a hipóxia estimula a EPO; (2) a medula expande precursores; (3) o ferro é incorporado à Hb; (4) hemácias envelhecidas são removidas. Relação: o conteúdo de O2 depende de Hb × saturação. Aplicação ao exercício: o treinamento de endurance pode expandir o plasma e reduzir a concentração de Hb sem anemia verdadeira; sintomas e marcadores de ferro devem ser integrados. Como medir: Hb, hematócrito, ferritina, saturação de transferrina, reticulócitos e massa de Hb. Erro frequente: ler ferritina isolada, que sobe na inflamação e não descreve todo o estado de ferro.",
      },
      {
        label: "Plaquetas, coagulação e fibrinólise",
        detail:
          "A hemostasia envolve vasoconstrição, adesão e ativação plaquetária, geração de trombina, formação de fibrina e posterior fibrinólise. Endotélio, fluxo e anticoagulantes naturais restringem o processo ao local da lesão. O sistema busca estancar o sangramento sem ocluir vasos íntegros. Sequência: (1) exposição de matriz e fator tecidual; (2) adesão e agregação plaquetária; (3) trombina e fibrina; (4) fibrinólise e reparo. Relação: hemostasia = formação controlada menos remoção do coágulo. Aplicação ao exercício: o exercício agudo altera transitoriamente a atividade hemostática; o risco depende de condição clínica, intensidade, imobilização, hidratação e medicamentos. Como medir: plaquetas, TP/INR, TTPa, fibrinogênio e marcadores fibrinolíticos. Erro frequente: tratar a coagulação como uma cascata isolada do endotélio, das células e do fluxo.",
      },
      {
        label: "Imunidade inata e inflamação",
        detail:
          "Barreiras, neutrófilos, monócitos, macrófagos, células NK e complemento respondem rapidamente a dano ou microrganismos. A inflamação organiza contenção, remoção e reparo. A resolução é um programa ativo, não o simples desaparecimento dos mediadores. Citocinas podem agir localmente e no organismo. Sequência: (1) reconhecimento de padrões; (2) recrutamento celular; (3) remoção de agentes e detritos; (4) resolução e reparo. Relação: resposta = intensidade × duração × contexto. Aplicação ao exercício: sessões exigentes geram alterações transitórias; o treinamento regular tende a melhorar a regulação metabólica e inflamatória. Como medir: leucócitos, diferencial, PCR, citocinas, temperatura e sinais clínicos. Erro frequente: tratar a inflamação como sempre inimiga; suprimi-la indiscriminadamente pode interferir no reparo.",
      },
      {
        label: "Imunidade adaptativa e memória",
        detail:
          "Linfócitos B e T reconhecem antígenos específicos, expandem clones e formam memória. Anticorpos neutralizam ou marcam alvos; células T coordenam e eliminam células infectadas. Após o exercício, a queda de algumas células no sangue pode refletir redistribuição para os tecidos, e não imunossupressão global. Sequência: (1) apresentação de antígeno; (2) expansão clonal; (3) fase efetora; (4) contração e memória. Relação: memória = expansão específica + persistência de clones. Aplicação ao exercício: carga elevada combinada com pouco sono, déficit energético e exposição a patógenos pode aumentar o risco de sintomas respiratórios. Como medir: subpopulações linfocitárias, anticorpos, vacinação, sintomas e carga de treino. Erro frequente: ler a contagem sanguínea como retrato do sistema imune inteiro; ela é a fotografia de um compartimento.",
      },
      {
        label: "Sistema linfático, edema e exercício",
        detail:
          "Capilares linfáticos recolhem líquido, proteínas e células do interstício, transportando-os por vasos com válvulas e linfonodos até a circulação venosa. Contração muscular, respiração e movimento favorecem o fluxo linfático. Obstrução ou sobrecarga pode produzir edema e alterar mobilidade e tolerância ao esforço. Sequência: (1) entrada de líquido nos capilares; (2) propulsão por válvulas e músculos; (3) filtragem nos linfonodos; (4) retorno ao sistema venoso. Relação: balanço intersticial = filtração menos drenagem linfática. Aplicação ao exercício: a atividade física pode favorecer o retorno linfático, mas edema persistente, assimétrico ou doloroso requer avaliação. Como medir: perimetria, volume segmentar, sinal de cacifo, sintomas e evolução temporal. Erro frequente: interpretar edema apenas como 'retenção de líquido'; causa e distribuição importam.",
      },
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
  specialTitle: "Medida e interpretação: o que cada variável informa e onde ela cala",
  special: [
    "Hematócrito representa a fração do volume ocupada por eritrócitos. Limite: muda com o volume plasmático, sem que a massa tenha mudado.",
    "Hemoglobina representa a concentração de Hb. Limite: não é igual à massa total de Hb, que é o que sustenta o transporte de O2.",
    "Ferritina representa estoque e proteína de fase aguda. Limite: precisa ser interpretada junto da inflamação.",
    "PCR representa um marcador sistêmico de inflamação. Limite: é pouco específica.",
    "Leucograma representa as células circulantes. Limite: a redistribuição altera as contagens sem mudar a competência imune.",
    "Regra de ouro do manual: uma medida não revela automaticamente o mecanismo. Ela restringe hipóteses quando método, unidade, condição basal, tempo, ambiente e tendência individual são conhecidos.",
    "Sinal de segurança: dor torácica, síncope, confusão, déficit neurológico, dispneia desproporcional, sangramento relevante ou piora rápida exigem interrupção e avaliação apropriada.",
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
    q("q3", "variavel", "Um atleta de endurance com Hb no limite inferior, sem sintomas, sugere primeiro:", [
      { id: "a", label: "Expansão do volume plasmático diluindo a concentração, não anemia verdadeira." },
      { id: "b", label: "Anemia confirmada, que exige parar o treino." },
    ], "a", "O treino expande o plasma: a concentração cai sem que a massa de Hb tenha caído. Integre sintomas e ferro."),
    q("q4", "conduta", "Por que a ferritina isolada não descreve o estado de ferro?", [
      { id: "a", label: "Porque também é proteína de fase aguda e sobe na inflamação." },
      { id: "b", label: "Porque não tem relação alguma com os estoques de ferro." },
    ], "a", "Ela reflete estoque E inflamação; por isso precisa ser lida com o contexto e outros marcadores."),
    q("q5", "verdadeiro-falso", "A resolução da inflamação é o simples desaparecimento passivo dos mediadores.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "f", "A resolução é um programa ativo; suprimir a inflamação de forma indiscriminada pode atrapalhar o reparo."),
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
  figure: { id: "nefron" },
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
      {
        label: "Fluxo renal e filtração glomerular",
        detail:
          "O rim recebe grande fluxo sanguíneo para regular o meio interno. A taxa de filtração depende da pressão líquida de filtração e do coeficiente de filtração da barreira glomerular. Autorregulação miogênica e feedback túbulo-glomerular estabilizam fluxo e TFG em uma faixa de pressão. Sequência: (1) perfusão da arteríola aferente; (2) filtração pela barreira; (3) resistências aferente e eferente; (4) autorregulação do néfron. Relação: TFG = Kf × pressão líquida de filtração. Aplicação ao exercício: desidratação, calor e exercício intenso podem reduzir o fluxo renal sem representar necessariamente lesão, mas sintomas e persistência importam. Como medir: creatinina, TFG estimada, fluxo renal, pressão e albuminúria. Erro frequente: ler creatinina isolada, que varia com massa muscular, dieta e exercício.",
      },
      {
        label: "Transporte tubular e depuração",
        detail:
          "O túbulo proximal reabsorve grande parte de água, Na+, glicose, aminoácidos e bicarbonato. Alça de Henle, túbulo distal e ducto coletor refinam a composição. A secreção adiciona substâncias ao fluido tubular. A depuração expressa o volume virtual de plasma removido de uma substância por unidade de tempo. Sequência: (1) carga filtrada; (2) reabsorção segmentar; (3) secreção tubular; (4) excreção urinária. Relação: excreção = filtração menos reabsorção mais secreção. Aplicação ao exercício: glicosúria ou proteinúria transitória após esforço intenso precisa ser interpretada com contexto, repetição e avaliação apropriada. Como medir: fluxo urinário, concentração, depuração, fração excretada e carga filtrada. Erro frequente: concluir mecanismo a partir da excreção baixa, que pode vir de menor filtração ou de maior reabsorção.",
      },
      {
        label: "Osmolaridade, concentração urinária e ADH",
        detail:
          "O gradiente osmótico medular é criado pelo multiplicador de contracorrente da alça e mantido pelos vasos retos. O ADH aumenta aquaporinas no ducto coletor, permitindo a reabsorção de água. A sede e a liberação de ADH respondem à osmolaridade e ao volume circulante efetivo. Sequência: (1) formação do gradiente medular; (2) reciclagem de ureia; (3) inserção de aquaporinas; (4) ajuste do volume urinário. Relação: osmolaridade ≈ partículas osmoticamente ativas dividido por água. Aplicação ao exercício: durante exercício prolongado, água em excesso sem sódio e sem respeitar a sede pode favorecer hiponatremia, especialmente quando o ADH permanece elevado. Como medir: osmolaridade sérica e urinária, densidade urinária, sódio e variação de massa corporal. Erro frequente: usar urina escura para quantificar desidratação; dieta, horário e solutos interferem.",
      },
      {
        label: "Sódio, RAAS e pressão arterial",
        detail:
          "O sódio determina grande parte do volume extracelular. Baixa perfusão renal e sinal simpático estimulam a renina, gerando angiotensina II e aldosterona. O sistema aumenta a reabsorção de Na+, o tônus vascular e a sede. Peptídeos natriuréticos e a pressão de perfusão promovem excreção quando o volume aumenta. Sequência: (1) liberação de renina; (2) formação de angiotensina II; (3) a aldosterona aumenta Na+ distal; (4) a natriurese limita a expansão. Relação: o conteúdo de Na+ corporal regula o volume extracelular. Aplicação ao exercício: a resposta ao sal e ao exercício varia entre pessoas; pressão, medicamentos e doença renal exigem individualização. Como medir: sódio, PA, renina, aldosterona, peso e edema. Erro frequente: tratar o RAAS apenas como mecanismo de hipertensão; ele é essencial para defender volume e perfusão.",
      },
      {
        label: "Potássio, cálcio e outros eletrólitos",
        detail:
          "O potássio é majoritariamente intracelular e influencia a excitabilidade. Insulina e catecolaminas deslocam K+ para as células; a aldosterona aumenta a secreção distal. Os rins também regulam Ca2+, fosfato e Mg2+ em integração com PTH, vitamina D e osso. Pequenas alterações séricas podem ter efeitos elétricos importantes. Sequência: (1) redistribuição transcelular; (2) filtração e reabsorção; (3) secreção distal de K+; (4) controle hormonal mineral. Relação: balanço = entrada menos saída, mais ou menos redistribuição. Aplicação ao exercício: o exercício libera K+ do músculo ativo, mas bombas e perfusão normalmente restauram o gradiente durante a recuperação. Como medir: K+, Na+, Ca2+, Mg2+, ECG e sintomas neuromusculares. Erro frequente: supor que a concentração sérica representa diretamente o estoque corporal total.",
      },
      {
        label: "Equilíbrio ácido-base e exercício",
        detail:
          "O organismo regula o pH com tampões, ventilação e rins. Bicarbonato e CO2 formam um sistema aberto: os pulmões ajustam o CO2 em minutos; os rins reabsorvem bicarbonato e excretam ácido como NH4+ e ácidos tituláveis em horas a dias. No exercício intenso a produção de H+ aumenta, mas o lactato é um metabólito útil e não a única causa de acidose. Sequência: (1) tamponamento químico imediato; (2) ajuste ventilatório de CO2; (3) reabsorção de HCO3-; (4) excreção renal de ácido. Relação: pH proporcional a HCO3- dividido por CO2. Aplicação ao exercício: o treinamento melhora o transporte e o uso de lactato, a capacidade tampão e a tolerância, sem 'eliminar ácido lático' de forma simplista. Como medir: pH, HCO3-, PaCO2, ânion gap, lactato e ventilação. Erro frequente: diagnosticar distúrbios simples e compensações por uma medida isolada fora do contexto clínico.",
      },
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
  specialTitle: "Medida e interpretação: o que cada variável informa e onde ela cala",
  special: [
    "Creatinina representa um marcador endógeno usado para estimar a TFG. Limite: sofre influência de massa muscular e dieta.",
    "Densidade urinária representa a concentração relativa da urina. Limite: não é medida direta de osmolaridade.",
    "Sódio sérico representa a concentração relativa à água. Limite: não mede o estoque total de Na+ do corpo.",
    "Albuminúria representa a perda urinária de albumina. Limite: pode ser transitória após esforço.",
    "Variação de massa representa mudança aguda de água e conteúdo. Limite: não equivale a gordura.",
    "Regra de ouro do manual: uma medida não revela automaticamente o mecanismo. Ela restringe hipóteses quando método, unidade, condição basal, tempo, ambiente e tendência individual são conhecidos.",
    "Sinal de segurança: dor torácica, síncope, confusão, déficit neurológico, dispneia desproporcional, sangramento relevante ou piora rápida exigem interrupção e avaliação apropriada.",
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
    q("q3", "conduta", "Como pulmão e rim cooperam para regular o pH?", [
      { id: "a", label: "O pulmão ajusta o CO2 em minutos e o rim reabsorve bicarbonato e excreta ácido em horas a dias." },
      { id: "b", label: "Apenas o rim regula o pH; o pulmão não participa." },
    ], "a", "pH depende da relação HCO3-/CO2: é um sistema aberto, com um componente rápido e outro lento."),
    q("q4", "variavel", "Uma creatinina levemente alterada num praticante de força sugere primeiro:", [
      { id: "a", label: "Influência de massa muscular, dieta e exercício recente, a ser interpretada com contexto." },
      { id: "b", label: "Doença renal confirmada." },
    ], "a", "Creatinina isolada varia com músculo, dieta e exercício; a conduta clínica é do profissional de saúde."),
    q("q5", "verdadeiro-falso", "O sódio sérico mede o estoque total de sódio do corpo.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "f", "Ele reflete a relação entre soluto e água. É por isso que excesso de água derruba o sódio sem que o corpo tenha perdido sal."),
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
  figure: { id: "eixo-endocrino" },
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
      {
        label: "Princípios de sinalização hormonal",
        detail:
          "Hormônios peptídicos atuam principalmente em receptores de membrana e segundos mensageiros; esteroides e hormônios tireoidianos atravessam membranas e modulam a expressão gênica. Afinidade, ocupação, eficácia e amplificação são conceitos distintos. Proteínas transportadoras alteram meia-vida e fração livre. Sequência: (1) síntese e secreção; (2) transporte livre ou ligado; (3) ligação ao receptor; (4) terminação e dessensibilização. Relação: resposta = exposição × sensibilidade do tecido. Aplicação ao exercício: uma mesma concentração hormonal produz efeitos diferentes conforme receptor, tecido, estado energético e treinamento. Como medir: hormônio total e livre, ritmo, resposta do tecido e biomarcadores downstream. Erro frequente: supor que mais hormônio significa mais efeito quando receptores ou vias já estão saturados.",
      },
      {
        label: "Hipotálamo, hipófise e feedback",
        detail:
          "O hipotálamo integra sinais neurais, luz, sono, estresse e estado energético. Hormônios liberadores controlam a adeno-hipófise; a neuro-hipófise libera ADH e ocitocina sintetizados no hipotálamo. Os eixos apresentam pulsos, ritmos circadianos e feedback negativo. Sequência: (1) sinal hipotalâmico; (2) secreção hipofisária; (3) ação na glândula-alvo; (4) feedback ao eixo. Relação: saída do eixo = drive central menos feedback periférico. Aplicação ao exercício: horário de coleta, sono e exercício recente podem mudar hormônios sem indicar doença. Como medir: ACTH, cortisol, TSH, T4, LH, FSH, GH e ritmos temporais. Erro frequente: tirar conclusão de uma medida isolada, que pode perder o pulso ou o ritmo e não representar a atividade do eixo.",
      },
      {
        label: "Insulina, glucagon e controle da glicose",
        detail:
          "A insulina favorece captação e armazenamento de nutrientes, especialmente após refeições. O glucagon sustenta a produção hepática de glicose no jejum. Durante o exercício, a contração muscular aumenta a translocação de GLUT4 por vias parcialmente independentes de insulina, enquanto catecolaminas e glucagon ajudam a manter a glicemia. Sequência: (1) detecção pancreática de glicose; (2) secreção de insulina e glucagon; (3) captação muscular e produção hepática; (4) restauração pós-exercício. Relação: glicemia = entrada intestinal + produção hepática menos captação. Aplicação ao exercício: o exercício melhora a sensibilidade à insulina por horas e, com repetição, aumenta a capacidade de transporte e oxidação. Como medir: glicemia, insulina, HbA1c, HOMA-IR e resposta a refeição e exercício. Erro frequente: achar que a queda de insulina durante o exercício significa menor captação muscular de glicose.",
      },
      {
        label: "Tireoide e taxa metabólica",
        detail:
          "O TSH estimula a produção de T4 e T3; desiodases ajustam a conversão nos tecidos. Hormônios tireoidianos aumentam a expressão de proteínas relacionadas a metabolismo, coração e termogênese. O eixo responde lentamente e é modulado por disponibilidade energética, doença e ambiente. Sequência: (1) TRH e TSH; (2) síntese de T4 e T3; (3) conversão periférica; (4) efeitos nucleares e feedback. Relação: a taxa metabólica depende de massa ativa × controle hormonal × ambiente. Aplicação ao exercício: déficit energético prolongado pode reduzir T3 como adaptação; sintomas e contexto são essenciais antes de atribuir fadiga à tireoide. Como medir: TSH, T4 livre, T3, FC, temperatura e sintomas. Erro frequente: inferir 'metabolismo lento' apenas da dificuldade para perder peso.",
      },
      {
        label: "Adrenais, catecolaminas e cortisol",
        detail:
          "A medula adrenal libera adrenalina e noradrenalina rapidamente. O córtex produz cortisol, aldosterona e andrógenos. O cortisol mobiliza substratos e modula a imunidade; sua elevação aguda é parte da resposta adaptativa. Excesso crônico e recuperação insuficiente têm significado diferente de um pico após o treino. Sequência: (1) ativação simpática imediata; (2) eixo HPA em minutos; (3) mobilização de glicose e lipídios; (4) feedback e recuperação. Relação: carga hormonal = magnitude × duração × frequência. Aplicação ao exercício: interpretar cortisol exige horário, sono, alimentação, estresse psicológico e carga de treinamento. Como medir: catecolaminas, cortisol, PA, glicemia, sono e percepção de recuperação. Erro frequente: tratar o cortisol como 'hormônio ruim' ou como marcador isolado de overtraining.",
      },
      {
        label: "Tecido adiposo, mioquinas e integração do exercício",
        detail:
          "O tecido adiposo secreta leptina, adiponectina e mediadores inflamatórios; o músculo ativo libera mioquinas e metabólitos com efeitos locais e sistêmicos. A leptina informa a disponibilidade energética ao cérebro, enquanto a adiponectina associa-se a maior sensibilidade metabólica. O balanço entre sinais depende de composição corporal, sono e atividade. Sequência: (1) sinalização do estoque energético; (2) comunicação músculo-adiposo; (3) efeitos sobre fígado e cérebro; (4) adaptação ao treinamento. Relação: fenótipo metabólico = energia + tecido + sinalização + comportamento. Aplicação ao exercício: o treino regular melhora a comunicação metabólica mesmo antes de grandes mudanças de peso. Como medir: leptina, adiponectina, composição corporal, sensibilidade à insulina e aptidão. Erro frequente: isolar adipocinas e mioquinas; os resultados dependem de redes e contexto.",
      },
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
  specialTitle: "Medida e interpretação: o que cada variável informa e onde ela cala",
  special: [
    "Hormônio total ou livre representa a concentração circulante. Limite: a ligação a proteínas altera a interpretação.",
    "Glicemia representa a glicose no compartimento sanguíneo. Limite: momento e refeição importam.",
    "HbA1c representa a exposição glicêmica média. Limite: não descreve a variabilidade aguda.",
    "TSH e T4 livre representam o estado do eixo tireoidiano. Limite: requerem correlação clínica.",
    "Cortisol representa a saída do eixo HPA. Limite: tem forte ritmo circadiano, então o horário muda tudo.",
    "Regra de ouro do manual: uma medida não revela automaticamente o mecanismo. Ela restringe hipóteses quando método, unidade, condição basal, tempo, ambiente e tendência individual são conhecidos.",
    "Sinal de segurança: dor torácica, síncope, confusão, déficit neurológico, dispneia desproporcional, sangramento relevante ou piora rápida exigem interrupção e avaliação apropriada.",
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
    q("q3", "variavel", "Como o exercício aumenta a captação de glicose usando MENOS insulina?", [
      { id: "a", label: "A contração muscular transloca GLUT4 por vias parcialmente independentes de insulina." },
      { id: "b", label: "O pâncreas secreta mais insulina durante o esforço." },
    ], "a", "Por isso a insulina cai no exercício e a captação muscular continua: a contração é um estímulo próprio."),
    q("q4", "conduta", "Num déficit energético prolongado, um T3 mais baixo sugere primeiro:", [
      { id: "a", label: "Adaptação à baixa disponibilidade energética, a ser lida com sintomas e contexto." },
      { id: "b", label: "Doença da tireoide, já definida pelo exame." },
    ], "a", "O eixo responde à energia disponível; atribuir a fadiga à tireoide sem contexto é precipitado."),
    q("q5", "verdadeiro-falso", "Uma medida hormonal isolada representa bem a atividade de um eixo endócrino.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "f", "Os eixos têm pulsos e ritmos: uma coleta única pode perder o pulso e não representar o eixo."),
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
  figure: { id: "vias-energeticas" },
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
      {
        label: "Motilidade e sistema nervoso entérico",
        detail:
          "Plexos mioentérico e submucoso coordenam peristaltismo, segmentação, secreção e fluxo local, modulados por parassimpático, simpático e hormônios. Células intersticiais de Cajal geram ritmos elétricos. Esfíncteres organizam o trânsito e evitam refluxo entre segmentos. Sequência: (1) a distensão ativa circuitos locais; (2) contração atrás do conteúdo; (3) relaxamento à frente; (4) ajuste central e hormonal. Relação: fluxo luminal = propulsão menos resistência segmentar. Aplicação ao exercício: o exercício leve pode favorecer o trânsito, enquanto a alta intensidade e o estresse podem retardar o esvaziamento ou aumentar a urgência. Como medir: tempo de trânsito, esvaziamento gástrico, sintomas, frequência e consistência fecal. Erro frequente: reduzir motilidade a 'movimento do intestino'; ela inclui padrões segmentares e controle de esfíncteres.",
      },
      {
        label: "Secreções e digestão química",
        detail:
          "A saliva inicia o processamento e facilita a deglutição. O ácido gástrico desnatura proteínas e ativa a pepsina; muco e bicarbonato protegem a mucosa. O pâncreas fornece bicarbonato e enzimas para carboidratos, proteínas e lipídios. A bile emulsifica gorduras e permite a formação de micelas. Sequência: (1) preparação oral; (2) digestão gástrica; (3) neutralização e enzimas pancreáticas; (4) bile e micelas no intestino. Relação: digestão efetiva = enzimas + superfície + tempo de contato. Aplicação ao exercício: composição e volume da refeição alteram o esvaziamento; gordura, fibra e alta osmolaridade podem reduzir a velocidade de entrega durante o exercício. Como medir: pH, esvaziamento, enzimas, sintomas e tolerância alimentar. Erro frequente: dizer que a bile 'quebra' gordura; ela não é enzima, e sim facilita a dispersão e a absorção.",
      },
      {
        label: "Absorção e transporte epitelial",
        detail:
          "Vilosidades e microvilosidades ampliam a área. Glicose e galactose usam cotransporte com Na+; a frutose usa transporte facilitado; aminoácidos usam diversos carreadores; lipídios entram em micelas, são reesterificados e exportados em quilomícrons. A água acompanha gradientes osmóticos. Sequência: (1) digestão até unidades transportáveis; (2) entrada apical por canais e carreadores; (3) processamento intracelular; (4) saída para sangue ou linfa. Relação: fluxo absorvido = área × permeabilidade × gradiente. Aplicação ao exercício: treinar a estratégia de ingestão pode aumentar a tolerância e a capacidade de absorver carboidratos durante o endurance. Como medir: taxa de ingestão, sintomas, glicemia, hidratação e composição da refeição. Erro frequente: supor que a absorção é ilimitada; transportadores, esvaziamento e perfusão podem limitar.",
      },
      {
        label: "Barreira intestinal, microbiota e imunidade",
        detail:
          "Epitélio, muco, junções, microbiota e células imunes formam uma barreira dinâmica. Metabólitos microbianos, como ácidos graxos de cadeia curta, influenciam células locais e sistêmicas. Calor, hipoperfusão e exercício prolongado podem aumentar a permeabilidade transitória e os sintomas. Sequência: (1) o muco separa conteúdo e epitélio; (2) as junções controlam a passagem paracelular; (3) a microbiota metaboliza substratos; (4) a imunidade contém e tolera. Relação: barreira = integridade epitelial + muco + imunidade + perfusão. Aplicação ao exercício: progressão de volume, hidratação e prática nutricional reduzem o risco gastrointestinal em provas longas. Como medir: sintomas, marcadores de permeabilidade, microbiota e ingestão de fibra. Erro frequente: usar uma única análise de microbiota para definir saúde, diagnóstico ou resposta individual ao treino.",
      },
      {
        label: "Fígado e integração metabólica",
        detail:
          "O fígado recebe sangue portal rico em nutrientes e sangue arterial. Armazena glicogênio, produz glicose, sintetiza lipídios e proteínas plasmáticas, converte amônia em ureia, processa fármacos e secreta bile. Os fluxos mudam entre estado alimentado, jejum e exercício. Sequência: (1) captação portal; (2) armazenamento ou oxidação; (3) conversão entre substratos; (4) exportação e detoxificação. Relação: produção hepática de glicose = glicogenólise + gliconeogênese. Aplicação ao exercício: durante o exercício, a glicogenólise e a gliconeogênese hepáticas sustentam a glicemia conforme duração e intensidade. Como medir: glicemia, enzimas hepáticas, bilirrubina, ureia, triglicerídeos e glicogênio. Erro frequente: ler elevação de enzimas após treino como fígado; pode incluir contribuição muscular e precisa de contexto.",
      },
      {
        label: "Pâncreas, balanço energético e exercício",
        detail:
          "O pâncreas exócrino fornece enzimas; o endócrino regula nutrientes. Sinais intestinais, como GLP-1 e GIP, antecipam e amplificam a resposta pós-prandial. A saciedade depende de distensão, nutrientes, hormônios e cérebro. Disponibilidade energética cronicamente baixa pode alterar eixos endócrinos, osso, imunidade e desempenho. Sequência: (1) detecção do alimento; (2) sinais incretínicos; (3) secreção pancreática; (4) integração com cérebro e fígado. Relação: disponibilidade energética = (ingestão menos gasto do exercício) relativa à massa livre de gordura. Aplicação ao exercício: a prescrição deve considerar horário, tamanho das refeições, tolerância e objetivo, sem transformar sintomas persistentes em simples 'falta de adaptação'. Como medir: ingestão, energia disponível, glicemia, sintomas e desempenho. Erro frequente: atribuir saciedade e gasto energético ao controle de um único hormônio.",
      },
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
  specialTitle: "Medida e interpretação: o que cada variável informa e onde ela cala",
  special: [
    "Sintomas gastrointestinais representam dor, náusea, refluxo e urgência. Limite: escala e timing importam para significar algo.",
    "Glicemia representa a disponibilidade sistêmica de glicose. Limite: não descreve toda a absorção.",
    "Esvaziamento representa a velocidade de saída gástrica. Limite: depende de volume e composição da refeição.",
    "Enzimas hepáticas representam marcadores celulares. Limite: músculo e exercício podem interferir no valor.",
    "Energia disponível representa a energia restante para as funções corporais. Limite: exige estimativas cuidadosas.",
    "Regra de ouro do manual: uma medida não revela automaticamente o mecanismo. Ela restringe hipóteses quando método, unidade, condição basal, tempo, ambiente e tendência individual são conhecidos.",
    "Sinal de segurança: dor torácica, síncope, confusão, déficit neurológico, dispneia desproporcional, sangramento relevante ou piora rápida exigem interrupção e avaliação apropriada.",
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
    q("q3", "variavel", "Como o fígado mantém a glicemia durante o exercício prolongado?", [
      { id: "a", label: "Por glicogenólise e gliconeogênese, conforme duração e intensidade." },
      { id: "b", label: "Absorvendo glicose direto do intestino para o músculo." },
    ], "a", "Produção hepática de glicose = glicogenólise + gliconeogênese; o fígado é o tampão da glicemia no esforço."),
    q("q4", "conduta", "Enzimas hepáticas elevadas logo após um treino intenso sugerem primeiro:", [
      { id: "a", label: "Possível contribuição muscular; precisa de contexto antes de atribuir ao fígado." },
      { id: "b", label: "Lesão hepática confirmada." },
    ], "a", "Marcadores 'hepáticos' também sobem por origem muscular; contexto e repetição orientam."),
    q("q5", "verdadeiro-falso", "Peso corporal estável garante que a disponibilidade energética está adequada.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "f", "Disponibilidade energética é a energia que sobra após o exercício, relativa à massa livre de gordura; pode estar baixa com peso estável."),
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
      {
        label: "Estrutura óssea e propriedades mecânicas",
        detail:
          "O osso cortical oferece rigidez e resistência; o osso trabecular distribui cargas em múltiplas direções. O colágeno fornece tenacidade e o mineral aumenta a rigidez. Geometria e distribuição do material são tão importantes quanto a densidade. Periósteo, medula e vascularização participam da adaptação e do reparo. Sequência: (1) a carga deforma a matriz; (2) o fluido canalicular estimula os osteócitos; (3) a sinalização regula osteoblastos e osteoclastos; (4) a geometria é remodelada. Relação: tensão = força dividida por área; deformação = ΔL dividido por L. Aplicação ao exercício: impacto, tração muscular e variedade de direções podem oferecer estímulos osteogênicos distintos de exercícios sem carga. Como medir: densidade mineral, geometria, marcadores de remodelamento e histórico de carga. Erro frequente: tratar densidade mineral isolada como descrição de toda a resistência do osso.",
      },
      {
        label: "Remodelamento, cálcio e hormônios",
        detail:
          "Osteoclastos reabsorvem e osteoblastos formam osso em unidades de remodelamento. PTH, vitamina D, calcitonina, hormônios sexuais e carga mecânica regulam cálcio e tecido. O organismo prioriza a estabilidade do Ca2+ sérico, e alterações ósseas podem ocorrer sem grande mudança na concentração sanguínea. Sequência: (1) ativação de osteoclastos; (2) reabsorção; (3) formação osteoblástica; (4) mineralização. Relação: balanço ósseo = formação menos reabsorção. Aplicação ao exercício: baixa disponibilidade energética e alterações menstruais podem reduzir a formação óssea, aumentando o risco mesmo em pessoas ativas. Como medir: cálcio, vitamina D, PTH, densitometria e marcadores de formação e reabsorção. Erro frequente: concluir que cálcio sérico normal garante estoque ósseo adequado.",
      },
      {
        label: "Articulações, cartilagem e líquido sinovial",
        detail:
          "A cartilagem articular é avascular e combina colágeno com proteoglicanos que retêm água. A compressão expulsa fluido e o reingresso contribui para a nutrição. O líquido sinovial reduz o atrito, enquanto cápsula, ligamentos e músculos guiam a estabilidade. Carga moderada e movimento são necessários para a homeostase. Sequência: (1) a compressão redistribui fluido; (2) a matriz suporta carga; (3) o movimento favorece a nutrição; (4) os músculos controlam a trajetória articular. Relação: pressão articular = carga dividida por área de contato. Aplicação ao exercício: a progressão deve combinar amplitude, velocidade, volume e tolerância; dor persistente ou derrame mudam a decisão. Como medir: dor, amplitude, edema, força, função e imagem quando indicada. Erro frequente: usar 'desgaste' para descrever um tecido vivo, capaz de adaptação e de reparo limitado.",
      },
      {
        label: "Tendões e transmissão de energia",
        detail:
          "Tendões organizam colágeno em fascículos alinhados e transmitem força entre músculo e osso. A complacência permite armazenar energia; a rigidez adequada melhora a transmissão e a taxa de força. A resposta depende de tensão, taxa e tempo de exposição. A adaptação de matriz é mais lenta que a adaptação neural. Sequência: (1) estiramento do colágeno; (2) alinhamento e crimp; (3) sinalização dos tenócitos; (4) síntese e reorganização de matriz. Relação: rigidez = Δforça dividido por Δcomprimento. Aplicação ao exercício: isometrias, excêntricos e cargas pesadas podem ser usados de forma progressiva, mas a dose deve respeitar dor e recuperação. Como medir: rigidez, deformação, dor, função e ultrassom. Erro frequente: concluir que a ausência de dor em uma sessão prova que o tecido tolerou toda a carga acumulada.",
      },
      {
        label: "Ligamentos, fáscia e estabilidade",
        detail:
          "Ligamentos limitam movimentos extremos e fornecem informação sensorial. A fáscia conecta regiões e distribui carga, mas não substitui a função específica de músculos e articulações. A estabilidade emerge de geometria, tecidos passivos, controle neuromuscular e tarefa. Sequência: (1) restrição passiva; (2) a deformação ativa mecanorreceptores; (3) o controle muscular estabiliza; (4) a adaptação depende da direção da carga. Relação: estabilidade = estrutura + controle + contexto. Aplicação ao exercício: o treino de estabilidade deve evoluir de controle previsível para perturbações específicas, sem usar instabilidade como fim em si. Como medir: laxidez, amplitude, controle, força e testes funcionais. Erro frequente: atribuir a estabilidade de uma articulação a um único ligamento ou à 'fáscia presa'.",
      },
      {
        label: "Mecanotransdução e adaptação ao treinamento",
        detail:
          "Integrinas, canais mecanossensíveis, citoesqueleto e matriz convertem deformação em sinalização. Magnitude, taxa, duração, frequência e recuperação formam a assinatura mecânica. Estímulos muito baixos não ultrapassam o limiar; excesso sem recuperação aumenta o dano e reduz a qualidade da adaptação. Sequência: (1) a carga deforma o tecido; (2) os sensores mudam de conformação; (3) quinases e genes são ativados; (4) a matriz se reorganiza. Relação: adaptação ≈ estímulo específico menos custo de recuperação. Aplicação ao exercício: a progressão deve considerar o tecido limitante, porque a capacidade muscular pode aumentar antes da tolerância de tendão, cartilagem ou osso. Como medir: carga externa, taxa, impacto, dor, função e exposição semanal. Erro frequente: achar que a mecanotransdução exige microlesão relevante; a sinalização ocorre com deformação fisiológica.",
      },
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
  specialTitle: "Medida e interpretação: o que cada variável informa e onde ela cala",
  special: [
    "DXA representa a densidade mineral areal. Limite: não mede toda a geometria nem a qualidade do osso.",
    "Ultrassom representa espessura e estrutura do tendão. Limite: operador e posição importam.",
    "Dor representa experiência e sinal de tolerância. Limite: não é medida direta de dano.",
    "Salto e força representam capacidade funcional. Limite: integram múltiplos tecidos, então não isolam o limitante.",
    "Carga semanal representa a exposição mecânica acumulada. Limite: precisa de volume e intensidade juntos para significar algo.",
    "Regra de ouro do manual: uma medida não revela automaticamente o mecanismo. Ela restringe hipóteses quando método, unidade, condição basal, tempo, ambiente e tendência individual são conhecidos.",
    "Sinal de segurança: dor torácica, síncope, confusão, déficit neurológico, dispneia desproporcional, sangramento relevante ou piora rápida exigem interrupção e avaliação apropriada.",
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
    q("q3", "variavel", "Por que a cartilagem precisa de movimento?", [
      { id: "a", label: "Porque é avascular: a compressão expulsa fluido e o reingresso contribui para a nutrição." },
      { id: "b", label: "Porque o movimento aumenta o fluxo sanguíneo dentro da cartilagem." },
    ], "a", "A cartilagem não tem vasos; carga moderada e movimento são necessários para a homeostase."),
    q("q4", "verdadeiro-falso", "A mecanotransdução exige microlesão relevante para disparar a adaptação.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "f", "A sinalização ocorre com deformação fisiológica; excesso sem recuperação aumenta dano e piora a adaptação."),
    q("q5", "conduta", "Uma atleta ativa com baixa disponibilidade energética e ciclos irregulares tem risco ósseo porque:", [
      { id: "a", label: "O déficit energético reduz a formação óssea, mesmo com cálcio sérico normal." },
      { id: "b", label: "O cálcio sérico cai primeiro e avisa o problema." },
    ], "a", "O corpo prioriza o Ca2+ sérico: o osso muda sem que o sangue mude, por isso o exame normal não tranquiliza."),
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
      {
        label: "Eixo hipotálamo-hipófise-gônadas",
        detail:
          "O GnRH é liberado em pulsos e controla LH e FSH. As gônadas produzem gametas, esteroides sexuais e inibinas, que exercem feedback. A frequência e a amplitude dos pulsos mudam ao longo do ciclo e com energia, sono, estresse e idade. Sequência: (1) pulsos de GnRH; (2) secreção de LH e FSH; (3) produção gonadal; (4) feedback ao eixo. Relação: saída gonadal = drive pulsátil menos feedback. Aplicação ao exercício: o treino não deve ser interpretado isoladamente; energia disponível e recuperação são determinantes para preservar a função reprodutiva. Como medir: LH, FSH, estradiol, progesterona, testosterona, ciclos e sintomas. Erro frequente: concluir a partir de uma coleta única; hormônios sexuais variam no tempo e uma amostra pode ser insuficiente.",
      },
      {
        label: "Sistema reprodutor masculino",
        detail:
          "O LH estimula as células de Leydig a produzir testosterona; FSH e testosterona sustentam as células de Sertoli e a espermatogênese. Temperatura testicular, saúde sistêmica, medicamentos e energia afetam a produção. A testosterona circula ligada a SHBG e albumina, com pequena fração livre. Sequência: (1) estímulo de Leydig; (2) suporte de Sertoli; (3) maturação espermática; (4) feedback por testosterona e inibina. Relação: a testosterona livre depende da produção e das proteínas ligantes. Aplicação ao exercício: o treino de força pode produzir alterações agudas, mas a hipertrofia não depende de picos transitórios isolados de testosterona. Como medir: testosterona total e livre, SHBG, espermograma, sintomas e função. Erro frequente: usar uma medida hormonal pós-treino para explicar o ganho muscular de longo prazo.",
      },
      {
        label: "Ciclo ovariano e menstrual",
        detail:
          "Na fase folicular, o FSH apoia o crescimento folicular e o estradiol aumenta. Estradiol alto e sustentado favorece o pico de LH e a ovulação. O corpo lúteo produz progesterona na fase lútea, e sua regressão precede a menstruação. A temperatura basal sobe discretamente após a ovulação. Sequência: (1) recrutamento folicular; (2) produção de estradiol; (3) pico de LH e ovulação; (4) fase lútea e queda hormonal. Relação: ciclo = dinâmica folicular + ovulação + função lútea. Aplicação ao exercício: o desempenho médio varia pouco entre fases, mas sintomas individuais podem justificar ajustes de carga, hidratação e estratégia. Como medir: datas, sintomas, temperatura, ovulação, estradiol e progesterona. Erro frequente: usar o calendário como garantia de ovulação ou de fase hormonal exata em todos os ciclos.",
      },
      {
        label: "Gestação e exercício",
        detail:
          "A gestação aumenta volume plasmático, débito cardíaco, ventilação, demanda energética e a laxidade de alguns tecidos. O útero cresce e altera o centro de massa. Em gestação sem contraindicações, o exercício adaptado pode ser benéfico, mas sinais de alerta e a orientação obstétrica têm prioridade. Sequência: (1) expansão circulatória; (2) adaptação respiratória; (3) mudança musculoesquelética; (4) crescimento fetal e placentário. Relação: demanda = metabolismo materno + placenta + feto. Aplicação ao exercício: modalidade, impacto, posição, temperatura e intensidade devem ser ajustados ao trimestre, à experiência e à avaliação. Como medir: sintomas, RPE, PA, glicemia quando indicada e acompanhamento pré-natal. Erro frequente: substituir percepção, sintomas e orientação individual por uma FC-alvo rígida.",
      },
      {
        label: "Menopausa, envelhecimento e composição corporal",
        detail:
          "A redução da função ovariana diminui o estradiol, altera a termorregulação e acelera a perda óssea. Com a idade, massa muscular e capacidade aeróbia também tendem a cair, mas o treinamento de força e de endurance preserva função. Em homens, as mudanças androgênicas são geralmente mais graduais e heterogêneas. Sequência: (1) transição hormonal; (2) mudança de osso e músculo; (3) alteração vascular e metabólica; (4) a adaptação ao treinamento permanece possível. Relação: função = reserva biológica + treinamento menos carga de doença. Aplicação ao exercício: força, impacto apropriado, proteína, sono e manejo de sintomas são pilares para a saúde funcional no envelhecimento. Como medir: ciclos, sintomas vasomotores, densidade óssea, força e composição corporal. Erro frequente: usar o envelhecimento para justificar baixa dose crônica de exercício; ele não elimina a capacidade de adaptação.",
      },
      {
        label: "Disponibilidade energética e função reprodutiva",
        detail:
          "Quando a energia restante após o exercício é insuficiente para as funções corporais, o organismo pode reduzir sinais como leptina, T3 e os pulsos de GnRH. Alterações menstruais, baixa libido, pior saúde óssea e queda de desempenho podem coexistir. O fenômeno pode ocorrer em qualquer sexo e em diferentes corpos. Sequência: (1) déficit energético persistente; (2) sinalização central de escassez; (3) supressão de eixos; (4) consequências ósseas e metabólicas. Relação: EA = (ingestão menos gasto do exercício) dividido pela massa livre de gordura. Aplicação ao exercício: a solução exige revisar ingestão, carga, recuperação e encaminhamento quando necessário, e não apenas 'treinar menos' sem avaliação. Como medir: energia disponível, ciclos, libido, lesões, osso, sono e desempenho. Erro frequente: usar peso estável para excluir baixa disponibilidade energética.",
      },
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
  specialTitle: "Medida e interpretação: o que cada variável informa e onde ela cala",
  special: [
    "Calendário menstrual representa o registro de sangramento e sintomas. Limite: não confirma ovulação sozinho.",
    "Hormônios representam concentrações em um momento específico. Limite: fase e horário importam.",
    "Energia disponível representa a energia para as funções fisiológicas. Limite: a estimativa tem incerteza.",
    "Densidade óssea representa um componente da saúde esquelética. Limite: interpretar com idade e histórico.",
    "Sintomas representam sinais funcionais do eixo. Limite: requerem escuta e encaminhamento, não só número.",
    "Regra de ouro do manual: uma medida não revela automaticamente o mecanismo. Ela restringe hipóteses quando método, unidade, condição basal, tempo, ambiente e tendência individual são conhecidos.",
    "Sinal de segurança: dor torácica, síncope, confusão, déficit neurológico, dispneia desproporcional, sangramento relevante ou piora rápida exigem interrupção e avaliação apropriada.",
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
    q("q3", "variavel", "O que define as fases do ciclo ovariano?", [
      { id: "a", label: "Dinâmica folicular com estradiol crescente, pico de LH e ovulação, e função lútea com progesterona." },
      { id: "b", label: "Apenas a data do último sangramento." },
    ], "a", "Ciclo = dinâmica folicular + ovulação + função lútea; o calendário sozinho não confirma ovulação."),
    q("q4", "conduta", "A hipertrofia depende de picos de testosterona logo após o treino?", [
      { id: "a", label: "Não: ela acompanha tensão mecânica e recuperação ao longo de semanas." },
      { id: "b", label: "Sim: o pico pós-treino é o principal determinante." },
    ], "a", "Alterações agudas existem, mas não explicam o ganho muscular de longo prazo."),
    q("q5", "verdadeiro-falso", "Envelhecer elimina a capacidade de adaptação ao treinamento.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "f", "A adaptação permanece possível; força, impacto apropriado, proteína e sono preservam função."),
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
      {
        label: "Pele como barreira e órgão fisiológico",
        detail:
          "A epiderme reduz a perda de água e a entrada de agentes; a derme contém vasos, nervos, glândulas e matriz; o tecido subcutâneo armazena energia e isola. Queratinócitos, melanócitos e células imunes participam da proteção. A pele também produz vitamina D sob radiação adequada e comunica o estado térmico ao sistema nervoso. Sequência: (1) renovação epidérmica; (2) barreira lipídica; (3) perfusão dérmica; (4) sensação e defesa local. Relação: a perda transepidérmica depende da barreira × gradiente de vapor. Aplicação ao exercício: atrito, umidade, roupa e equipamento podem causar lesões cutâneas que alteram a tolerância e a técnica. Como medir: temperatura cutânea, integridade, hidratação da pele, sintomas e exposição solar. Erro frequente: tratar a pele como revestimento passivo; ela participa de circulação, imunidade e percepção.",
      },
      {
        label: "Balanço térmico e produção de calor",
        detail:
          "A energia química não convertida em trabalho aparece como calor. A temperatura central depende da produção metabólica e das trocas por radiação, convecção, condução e evaporação. Em ambiente quente, os gradientes secos diminuem e a evaporação torna-se a via principal. Sequência: (1) produção metabólica; (2) transporte do calor para a pele; (3) troca com o ambiente; (4) armazenamento quando a perda é insuficiente. Relação: armazenamento de calor = produção menos trabalho menos perdas. Aplicação ao exercício: intensidade, roupa, equipamento e ambiente devem ser tratados como partes da dose de exercício. Como medir: temperatura central e cutânea, carga, ambiente, vento e umidade. Erro frequente: confundir suor produzido com suor evaporado; gotas que escorrem pouco resfriam.",
      },
      {
        label: "Fluxo sanguíneo cutâneo e controle neural",
        detail:
          "O hipotálamo integra a temperatura central e a periférica e aumenta a vasodilatação cutânea. Isso transfere calor, mas compete com a manutenção do retorno venoso e da pressão, especialmente com desidratação. A aclimatação melhora a distribuição cardiovascular e reduz o custo relativo. Sequência: (1) detecção térmica; (2) comando simpático cutâneo; (3) vasodilatação e transferência de calor; (4) ajuste circulatório integrado. Relação: a transferência interna de calor é proporcional ao fluxo cutâneo × gradiente núcleo-pele. Aplicação ao exercício: pausas, resfriamento e redução de intensidade podem preservar a segurança quando a demanda cutânea ameaça a pressão e o desempenho. Como medir: fluxo cutâneo, FC, PA, temperatura e percepção térmica. Erro frequente: explicar o fluxo cutâneo apenas por 'vasodilatação local'; controle neural e estado circulatório são decisivos.",
      },
      {
        label: "Sudorese, sódio e individualidade",
        detail:
          "Glândulas écrinas secretam um fluido inicialmente semelhante ao plasma; o ducto reabsorve Na+ e Cl-. Uma taxa alta de suor reduz o tempo de reabsorção e eleva a concentração de sal. Genética, aclimatação, intensidade, tamanho corporal e ambiente produzem grande variabilidade individual. Sequência: (1) secreção glandular; (2) reabsorção ductal de eletrólitos; (3) evaporação na superfície; (4) reposição de água e sódio. Relação: taxa de suor ≈ perda de massa + ingestão menos urina. Aplicação ao exercício: planos de hidratação devem partir de experiência, sede, taxa de suor e duração, evitando tanto o déficit excessivo quanto o ganho de massa por excesso. Como medir: taxa de suor, variação de massa, sódio no suor e ingestão. Erro frequente: usar manchas de sal para quantificar com precisão a necessidade de reposição.",
      },
      {
        label: "Hidratação, osmolaridade e desempenho",
        detail:
          "A perda de água reduz o volume plasmático e aumenta a osmolaridade, estimulando sede e ADH. O impacto sobre o desempenho depende de calor, duração, intensidade e tolerância. O excesso de água pode diluir o sódio, especialmente quando a excreção está limitada. A reposição deve considerar água, sódio e carboidrato conforme a tarefa. Sequência: (1) perda de suor; (2) redução de volume e aumento de osmolaridade; (3) sede e conservação renal; (4) reposição e recuperação. Relação: perda de massa em porcentagem = (pré menos pós + ingestão menos urina) dividido pelo pré, vezes 100. Aplicação ao exercício: pesar antes e depois estima o balanço, mas não deve virar meta rígida de repor 100% durante toda a atividade. Como medir: massa corporal, sede, urina, sódio, sintomas e taxa de ingestão. Erro frequente: esquecer que desidratação e hiponatremia podem coexistir com sintomas inespecíficos; confusão exige atendimento.",
      },
      {
        label: "Aclimatação, frio e ambientes extremos",
        detail:
          "Exposições repetidas ao calor aumentam o volume plasmático, iniciam o suor mais cedo e reduzem a concentração de sal. No frio, vasoconstrição e tremor preservam a temperatura, mas vento e água elevam a perda. A altitude acrescenta hipóxia e modifica ventilação e circulação. A adaptação é específica e regride com a ausência de exposição. Sequência: (1) repetição do estresse ambiental; (2) ajustes circulatórios e sudoríparos; (3) mudança perceptiva e comportamental; (4) perda parcial com destreinamento. Relação: risco ambiental = estresse externo × carga interna dividido pela capacidade. Aplicação ao exercício: a progressão deve reduzir a carga inicial, aumentar a exposição gradualmente e monitorar sinais de doença pelo calor ou pelo frio. Como medir: índice térmico, WBGT, temperatura, FC, percepção e sintomas. Erro frequente: tratar a aclimatação como imunidade; ela reduz o risco, mas não elimina o perigo em ambientes extremos.",
      },
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
  specialTitle: "Medida e interpretação: o que cada variável informa e onde ela cala",
  special: [
    "WBGT e índices de ambiente representam a carga térmica externa. Limite: não substituem o monitoramento individual.",
    "Temperatura central representa o estado térmico interno. Limite: o método determina a validade.",
    "Taxa de suor representa a perda líquida por tempo. Limite: varia com ambiente e intensidade.",
    "Variação de massa representa uma estimativa de água perdida ou ganha. Limite: inclui ingestão, urina e substratos.",
    "Percepção térmica representa a experiência subjetiva de calor ou frio. Limite: é útil com escala padronizada.",
    "Regra de ouro do manual: uma medida não revela automaticamente o mecanismo. Ela restringe hipóteses quando método, unidade, condição basal, tempo, ambiente e tendência individual são conhecidos.",
    "Sinal de segurança: dor torácica, síncope, confusão, déficit neurológico, dispneia desproporcional, sangramento relevante ou piora rápida exigem interrupção e avaliação apropriada.",
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
    q("q3", "variavel", "Por que o fluxo cutâneo compete com o retorno venoso?", [
      { id: "a", label: "Porque a vasodilatação cutânea desloca volume para a pele, ameaçando pressão e enchimento." },
      { id: "b", label: "Porque a pele consome o oxigênio que iria para o músculo." },
    ], "a", "Transferir calor exige fluxo para a pele; com desidratação, isso compete com pressão e desempenho."),
    q("q4", "conduta", "Em ambiente quente e úmido, por que fica mais difícil dissipar calor?", [
      { id: "a", label: "Os gradientes secos diminuem e a evaporação, que vira a via principal, fica prejudicada pela umidade." },
      { id: "b", label: "O corpo para de produzir suor." },
    ], "a", "Radiação, convecção e condução perdem eficácia; sobra a evaporação, que a umidade limita."),
    q("q5", "verdadeiro-falso", "Quem está aclimatado ao calor está protegido e pode ignorar o monitoramento em ambiente extremo.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "f", "A aclimatação reduz o risco, mas não torna ninguém imune; ela também regride sem exposição."),
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
