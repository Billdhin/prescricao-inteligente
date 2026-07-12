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

export const fisiologiaHumanaModules: Module[] = [
  deepModule({ id: `m-${DISC}-sistema-cardiovascular`, disciplineId: DISC_ID, slug: "sistema-cardiovascular", title: "Sistema cardiovascular", objective: "Compreender a resposta cardiovascular ao esforço.", order: 1, level: "fundamental", lessons: [debito, pressao], applications: ["Interpretar FC e pressão no esforço e cuidados na hipertensão"] }),
  deepModule({ id: `m-${DISC}-sistema-respiratorio`, disciplineId: DISC_ID, slug: "sistema-respiratorio", title: "Sistema respiratório", objective: "Relacionar ventilação, esforço e demanda de oxigênio.", order: 2, level: "fundamental", prerequisites: [`m-${DISC}-sistema-cardiovascular`], lessons: [ventilacao, consumo], applications: ["Guiar intensidade pela fala e progredir a demanda de oxigênio"] }),
  deepModule({ id: `m-${DISC}-adaptacoes`, disciplineId: DISC_ID, slug: "adaptacoes", title: "Adaptações ao treino", objective: "Distinguir respostas agudas de adaptações crônicas.", order: 3, level: "intermediario", prerequisites: [`m-${DISC}-sistema-respiratorio`], lessons: [agudaCronica, homeostase], applications: ["Avaliar o resultado pela adaptação crônica e progredir o estímulo"] }),
];

export const fisiologiaHumanaLessons: Lesson[] = [debito, pressao, ventilacao, consumo, agudaCronica, homeostase];
