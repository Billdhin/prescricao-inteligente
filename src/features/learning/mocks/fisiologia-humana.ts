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

/* =============== Módulo 1 — Fundamentos da regulação =============== */

const homeostaseControle = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-fundamentos`, moduleSlug: "fundamentos",
  slug: `${DISC}--homeostase-e-controle`, title: "Homeostase e controle fisiológico",
  subtitle: "Fundamentos", description: "A variável regulada é mantida dentro de uma faixa funcional por sensores, um centro integrador, efetores e feedback, não em um valor rígido.",
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
  disciplineSlug: DISC, moduleId: `m-${DISC}-fundamentos`, moduleSlug: "fundamentos",
  slug: `${DISC}--transporte-membrana`, title: "Transporte pela membrana: como a célula troca com o meio",
  subtitle: "Fundamentos", description: "Difusão, osmose, carreadores e bombas determinam seletividade e direção do transporte; base para hidratação, volume e excitabilidade.",
  level: "fundamental", minutes: 10, type: "conceito", kicker: K, tags: ["membrana", "difusão", "bomba de sódio e potássio"],
  hero: "A membrana separa a célula do meio e escolhe o que entra e o que sai. Difusão, osmose, carreadores e bombas explicam desde a hidratação até a excitabilidade que permite a contração muscular.",
  question: "Por que a bomba de sódio e potássio precisa gastar energia o tempo todo, mesmo com a célula em repouso?",
  concepts: [
    { term: "Gradiente eletroquímico", definition: "Diferença de concentração e de carga de um íon entre os dois lados da membrana. Ele sustenta volume celular, transporte acoplado e sinalização elétrica." },
    { term: "Transporte ativo", definition: "Movimento de solutos contra o gradiente, com gasto de energia. A bomba Na⁺/K⁺-ATPase mantém sódio baixo e potássio alto dentro da célula, base do potencial de repouso." },
  ],
  figure: { id: "transporte-membrana" },
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
  disciplineSlug: DISC, moduleId: `m-${DISC}-fundamentos`, moduleSlug: "fundamentos",
  slug: `${DISC}--bioeletricidade`, title: "Bioeletricidade: o potencial de ação",
  subtitle: "Fundamentos", description: "Gradientes iônicos viram sinais rápidos: o potencial de ação é um evento tudo-ou-nada que inicia o comando motor.",
  level: "intermediario", minutes: 10, type: "mecanismo", kicker: K, tags: ["potencial de ação", "limiar", "excitabilidade"],
  hero: "Toda contração voluntária começa como eletricidade. O potencial de ação converte gradientes iônicos em um sinal rápido e organizado, base para entender comando motor, recrutamento e fadiga.",
  question: "Por que um estímulo um pouco mais forte não gera um potencial de ação 'maior', e sim mais potenciais?",
  concepts: [
    { term: "Potencial de repouso", definition: "Interior da célula negativo, mantido pela maior permeabilidade ao potássio e pela bomba Na⁺/K⁺. É o ponto de partida para a excitabilidade." },
    { term: "Potencial de ação", definition: "Evento regenerativo tudo-ou-nada: ao atingir o limiar, canais de sódio abrem (despolarização); depois inativam e o potássio sai (repolarização). Períodos refratários garantem direção e limitam a frequência." },
  ],
  figure: { id: "potencial-de-acao" },
  apply: "Use o conceito para interpretar comando motor e fadiga sem antecipar toda a fisiologia do exercício: a força é graduada por quantos neurônios disparam e com que frequência, não por potenciais 'maiores'. Responder à abertura: o potencial de ação é tudo-ou-nada; um estímulo mais forte, acima do limiar, aumenta a frequência de disparos, não a amplitude de cada um.",
  special: [
    "Limiar, recrutamento e frequência de disparo são pré-requisitos para entender controle motor e eletromiografia.",
    "A força de uma contração depende de quantas unidades motoras disparam e com que frequência.",
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

/* =============== Módulo 2 — Controle endócrino =============== */

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

/* =============== Módulo 3 — Cardiorrespiratório (novas aulas) =============== */

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

/* =============== Módulo 4 — Tecidos do movimento =============== */

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

/* =============== Módulo 5 — Metabolismo e excreção =============== */

const viasEnergeticas = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-metabolismo`, moduleSlug: "metabolismo-e-excrecao",
  slug: `${DISC}--vias-energeticas`, title: "Vias energéticas: como o corpo faz ATP",
  subtitle: "Metabolismo e excreção", description: "Carboidratos, gorduras e proteínas convergem para a produção de ATP; aeróbio e anaeróbio descrevem processos que operam juntos, não exercícios opostos.",
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
  disciplineSlug: DISC, moduleId: `m-${DISC}-metabolismo`, moduleSlug: "metabolismo-e-excrecao",
  slug: `${DISC}--sistema-renal`, title: "Rim e néfron: ajustando o meio interno",
  subtitle: "Metabolismo e excreção", description: "O rim filtra o plasma e ajusta seletivamente água, eletrólitos, ácido-base e resíduos; central para hidratação e pressão arterial.",
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

/* =============== Módulo 6 — Integração e adaptação =============== */

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

export const fisiologiaHumanaModules: Module[] = [
  deepModule({ id: `m-${DISC}-fundamentos`, disciplineId: DISC_ID, slug: "fundamentos", title: "Fundamentos da regulação", objective: "Explicar homeostase, transporte de membrana e bioeletricidade como base de todos os sistemas.", order: 1, level: "fundamental", lessons: [homeostaseControle, transporteMembrana, bioeletricidade], applications: ["Ler variáveis fisiológicas como faixas reguladas e entender excitabilidade"] }),
  deepModule({ id: `m-${DISC}-controle-endocrino`, disciplineId: DISC_ID, slug: "controle-endocrino", title: "Controle endócrino", objective: "Interpretar o sistema endócrino como rede de eixos e feedback.", order: 2, level: "intermediario", prerequisites: [`m-${DISC}-fundamentos`], lessons: [endocrino], applications: ["Evitar explicações de um hormônio só e encaminhar conduta hormonal"] }),
  deepModule({ id: `m-${DISC}-sistema-cardiovascular`, disciplineId: DISC_ID, slug: "sistema-cardiovascular", title: "Sistema cardiovascular", objective: "Compreender débito, ciclo cardíaco e pressão no esforço.", order: 3, level: "fundamental", prerequisites: [`m-${DISC}-fundamentos`], lessons: [debito, cicloCardiaco, pressao], applications: ["Interpretar FC, pressão e válvulas e cuidados na hipertensão"] }),
  deepModule({ id: `m-${DISC}-sistema-respiratorio`, disciplineId: DISC_ID, slug: "sistema-respiratorio", title: "Sistema respiratório", objective: "Relacionar ventilação, troca gasosa e demanda de oxigênio.", order: 4, level: "fundamental", prerequisites: [`m-${DISC}-sistema-cardiovascular`], lessons: [ventilacao, transporteGases, consumo], applications: ["Guiar intensidade pela fala e explicar a entrega de O2"] }),
  deepModule({ id: `m-${DISC}-tecidos-movimento`, disciplineId: DISC_ID, slug: "tecidos-do-movimento", title: "Tecidos do movimento", objective: "Explicar como a força emerge do sarcômero, do comprimento e da ativação neural.", order: 5, level: "intermediario", prerequisites: [`m-${DISC}-fundamentos`], lessons: [musculo, relacaoForca], applications: ["Explicar força além do tamanho, ganhos neurais e variação ao longo da amplitude"] }),
  deepModule({ id: `m-${DISC}-metabolismo`, disciplineId: DISC_ID, slug: "metabolismo-e-excrecao", title: "Metabolismo e excreção", objective: "Relacionar vias energéticas e função renal ao meio interno.", order: 6, level: "intermediario", prerequisites: [`m-${DISC}-sistema-respiratorio`], lessons: [viasEnergeticas, renal], applications: ["Progredir sem zonas mágicas e ligar rim à hidratação"] }),
  deepModule({ id: `m-${DISC}-adaptacoes`, disciplineId: DISC_ID, slug: "adaptacoes", title: "Integração e adaptação", objective: "Integrar os sistemas no movimento e distinguir resposta de adaptação.", order: 7, level: "intermediario", prerequisites: [`m-${DISC}-metabolismo`], lessons: [integracao, agudaCronica, homeostase], applications: ["Ler a carga de forma integrada e progredir o estímulo"] }),
];

export const fisiologiaHumanaLessons: Lesson[] = [
  homeostaseControle, transporteMembrana, bioeletricidade,
  endocrino,
  debito, cicloCardiaco, pressao,
  ventilacao, transporteGases, consumo,
  musculo, relacaoForca,
  viasEnergeticas, renal,
  integracao, agudaCronica, homeostase,
];
