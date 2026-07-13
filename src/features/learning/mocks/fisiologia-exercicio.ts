import type { Lesson, Module } from "../types";
import { deepLesson, deepModule, q } from "./authoring";

/**
 * FISIOLOGIA DO EXERCÍCIO, disciplina autorada em profundidade.
 * Slugs seguem o padrão do currículo (fisiologia-do-exercicio--<sub>) para preservar
 * as conexões já feitas por outras disciplinas. Substitui os stubs do currículo.
 */

const DISC = "fisiologia-do-exercicio";
const DISC_ID = "d-fisio-exercicio";
const K = "Fisiologia do exercício";

/* ------------------------------ Módulo 1: aptidão aeróbia ------------------------------ */

const vo2max = deepLesson({
  disciplineSlug: DISC,
  moduleId: `m-${DISC}-aptidao-aerobia`,
  moduleSlug: "aptidao-aerobia",
  slug: `${DISC}--vo2max-limitantes`,
  title: "O que limita o VO2máx",
  subtitle: "Aptidão aeróbia",
  description: "O consumo máximo de oxigênio e por que ele é, na maioria das pessoas, uma questão de entrega central de oxigênio.",
  level: "intermediario",
  minutes: 12,
  type: "mecanismo",
  kicker: K,
  tags: ["VO2máx", "débito cardíaco", "aptidão aeróbia"],
  hero: "O VO2máx resume a capacidade do corpo de captar, transportar e usar oxigênio. Saber o que o limita orienta o que treinar para melhorar o condicionamento.",
  question: "Para elevar o VO2máx de um aluno, você deveria focar mais no coração e na circulação ou no músculo que consome o oxigênio?",
  concepts: [
    { term: "VO2máx", definition: "Maior taxa de consumo de oxigênio que o organismo alcança em esforço máximo. Depende de entregar oxigênio aos músculos (débito cardíaco e transporte) e de extraí-lo (diferença arteriovenosa)." },
    { term: "Débito cardíaco", definition: "Volume de sangue bombeado por minuto, produto da frequência cardíaca pelo volume sistólico. É o principal determinante da entrega de oxigênio." },
  ],
  figure: { id: "dissociacao-o2" },
  mechanism: {
    title: "Da respiração ao músculo",
    steps: [
      { label: "Ventilação e difusão pulmonar", detail: "O ar entra e o oxigênio passa para o sangue. Em pessoas saudáveis ao nível do mar, raramente é o passo limitante." },
      { label: "Transporte pelo sangue", detail: "A hemoglobina carrega o oxigênio. Anemia ou baixa concentração reduzem a entrega." },
      { label: "Bombeamento pelo coração", detail: "O débito cardíaco leva o sangue oxigenado aos músculos. Aqui costuma estar o principal limite (Bassett e Howley, 2000)." },
      { label: "Extração pelo músculo", detail: "Capilares e mitocôndrias retiram e usam o oxigênio. O treino aumenta essa capacidade de extração." },
    ],
  },
  apply: "O treino aeróbio melhora tanto a entrega central (o coração ejeta mais por batimento) quanto a extração periférica. Para elevar o VO2máx, trabalhe a base contínua e acrescente estímulos intervalados de intensidade suficiente para desafiar o débito cardíaco, respeitando a progressão e a recuperação do aluno.",
  special: [
    "Idosos: ganhos de aptidão aeróbia preservam autonomia e reduzem risco cardiovascular; progrida volume antes de intensidade.",
    "Hipertensão: prefira predominância aeróbia de intensidade moderada, evite apneia e monitore a resposta pressórica; a conduta clínica é do profissional de saúde.",
    "Iniciantes destreinados: mesmo caminhada regular eleva a aptidão nas primeiras semanas.",
  ],
  mistake: {
    mistake: "Buscar sempre alta intensidade achando que só o intervalado 'no talo' melhora o VO2máx, ignorando a base aeróbia e a recuperação.",
    instead: "Construa primeiro uma base contínua e insira intervalos de forma dosada. Volume e consistência sustentam o progresso; intensidade em excesso sem base aumenta risco e abandono.",
  },
  professionalCase: {
    prompt: "Aluno sedentário, objetivo melhorar o condicionamento para subir escadas sem cansar. Qual é o primeiro passo mais coerente?",
    choices: [
      { id: "c1", label: "Construir base com caminhadas contínuas em intensidade que permita conversar, progredindo a duração.", tone: "recomendada", feedback: "Coerente. Para um destreinado, a base contínua já eleva a aptidão com segurança e adesão; o intervalado entra depois." },
      { id: "c2", label: "Iniciar direto com tiros máximos para subir o VO2máx rápido.", tone: "cautela", feedback: "Alta intensidade sem base aumenta o risco e o desconforto, prejudicando a adesão de quem está começando." },
      { id: "c3", label: "Focar só em musculação, esperando melhora aeróbia indireta.", tone: "aceitavel", feedback: "A força ajuda a função, mas o estímulo aeróbio específico é o que mais eleva o VO2máx. Combine, não substitua." },
    ],
  },
  quiz: [
    q("q1", "variavel", "Na maioria das pessoas saudáveis ao nível do mar, o principal fator limitante do VO2máx é:", [
      { id: "a", label: "A entrega central de oxigênio (débito cardíaco)." },
      { id: "b", label: "A capacidade dos pulmões de captar oxigênio." },
    ], "a", "A entrega central, ligada ao débito cardíaco, costuma ser o limite; os pulmões raramente limitam em pessoas saudáveis."),
    q("q2", "conduta", "Para um destreinado melhorar a aptidão aeróbia, o primeiro passo mais seguro é:", [
      { id: "a", label: "Base contínua em intensidade moderada, progredindo a duração." },
      { id: "b", label: "Sessões intervaladas máximas desde o início." },
    ], "a", "A base contínua constrói aptidão com segurança e adesão; o intervalado entra sobre essa base."),
  ],
  uncertainty: "O peso relativo dos fatores centrais e periféricos varia com o nível de treino, a idade e o tipo de esforço, e é objeto de debate. Use a distinção como guia, não como regra fixa.",
  related: [
    { title: "Limiares: onde o metabolismo muda", href: `/aprender/conteudos/${DISC}--limiares`, type: "conceito" },
    { title: "Ventilação e esforço", href: "/aprender/conteudos/fisiologia-humana--ventilacao", type: "conceito" },
    { title: "Métodos aeróbios: contínuo e intervalado", href: "/aprender/conteudos/treinamento-cardiorrespiratorio--continuo", type: "conceito" },
  ],
  refs: ["ref-bassett-howley-2000", "ref-macinnis-gibala-2017", "ref-oms-atividade"],
  applyRx: "Para elevar a aptidão aeróbia, construa base contínua e some intervalos dosados; progrida volume antes de intensidade e monitore recuperação. O objetivo é desafiar entrega e extração de oxigênio dentro da tolerância do aluno.",
});

const limiares = deepLesson({
  disciplineSlug: DISC,
  moduleId: `m-${DISC}-aptidao-aerobia`,
  moduleSlug: "aptidao-aerobia",
  slug: `${DISC}--limiares`,
  title: "Limiares: onde o metabolismo muda de marcha",
  subtitle: "Aptidão aeróbia",
  description: "Os pontos de transição da intensidade que organizam zonas de treino e guiam a progressão do condicionamento.",
  level: "intermediario",
  minutes: 12,
  type: "conceito",
  kicker: K,
  tags: ["limiar", "lactato", "zonas", "teste da fala"],
  hero: "Conforme a intensidade sobe, o metabolismo muda de padrão em pontos identificáveis, os limiares. Eles organizam as zonas de treino melhor do que qualquer percentual fixo.",
  question: "Como definir a intensidade de um treino aeróbio para um aluno sem laboratório nem medidor de lactato?",
  concepts: [
    { term: "Limiar (transição metabólica)", definition: "Intensidade em que a resposta do corpo muda de forma marcada. O primeiro limiar separa o esforço leve do moderado; o segundo separa o que é sustentável por muito tempo do que fadiga rápido." },
    { term: "Zonas de intensidade", definition: "Faixas de esforço delimitadas pelos limiares. Treinar em zonas diferentes gera adaptações diferentes; a maior parte do volume costuma ficar abaixo do segundo limiar." },
  ],
  figure: { id: "ventilacao-troca" },
  chart: {
    title: "Sustentabilidade do esforço por zona (ilustrativo)",
    points: [
      { label: "Leve (abaixo do 1º limiar)", value: 100 },
      { label: "Moderado", value: 78 },
      { label: "Intenso (perto do 2º)", value: 45 },
      { label: "Máximo", value: 18 },
    ],
    explanation: "Quanto mais acima dos limiares, menos tempo o esforço se sustenta. Distribuir a maior parte do volume em zonas mais baixas e reservar as altas para estímulos pontuais é uma estratégia comum e segura. Valores ilustrativos.",
  },
  apply: "Sem laboratório, o teste da fala é um guia prático dos limiares: conseguir falar frases confortavelmente indica esforço abaixo do primeiro limiar; falar só palavras soltas indica proximidade do segundo. Prescreva a maior parte do volume em intensidade conversável e use trechos mais intensos de forma dosada.",
  special: [
    "Hipertensão e cardiopatias: manter a maior parte do treino em intensidade conversável é prudente; individualize com o profissional de saúde.",
    "Iniciantes: o teste da fala é acessível e não exige equipamento; ensine a referência já nas primeiras sessões.",
  ],
  mistake: {
    mistake: "Prescrever intensidade só por percentual de frequência cardíaca máxima estimada por fórmula, que erra bastante entre pessoas.",
    instead: "Combine a percepção de esforço e o teste da fala com a frequência cardíaca quando ela for confiável. Os limiares individualizam melhor do que um percentual único.",
  },
  professionalCase: {
    prompt: "Aluna quer melhorar o fôlego para uma corrida de 5 km. Como distribuir a intensidade da semana?",
    choices: [
      { id: "c1", label: "Maior parte do volume em ritmo conversável e uma a duas sessões com trechos mais intensos.", tone: "recomendada", feedback: "Coerente com a distribuição polarizada e segura: base ampla em baixa intensidade e estímulos intensos pontuais." },
      { id: "c2", label: "Todo treino perto do limite para acostumar ao desconforto.", tone: "cautela", feedback: "Volume alto em intensidade elevada acumula fadiga e risco, com pouca margem de progressão sustentável." },
      { id: "c3", label: "Só treino leve para não se cansar.", tone: "aceitavel", feedback: "A base leve é essencial, mas algum estímulo intenso é necessário para melhorar o desempenho na prova." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Sem medidor de lactato, um guia prático para a zona abaixo do primeiro limiar é:", [
      { id: "a", label: "Conseguir falar frases completas confortavelmente durante o esforço." },
      { id: "b", label: "Chegar ao ponto de não conseguir falar nada." },
    ], "a", "Falar frases confortavelmente indica intensidade leve a moderada, abaixo do primeiro limiar; é a base do teste da fala."),
    q("q2", "verdadeiro-falso", "A frequência cardíaca máxima estimada por fórmula (por exemplo, 220 menos a idade) é precisa para todos.", [
      { id: "v", label: "Verdadeiro" },
      { id: "f", label: "Falso" },
    ], "f", "As fórmulas têm erro grande entre indivíduos; use-as com cautela e combine com percepção de esforço e teste da fala."),
  ],
  uncertainty: "Os nomes e os métodos de identificar limiares variam entre autores (ventilatório, de lactato) e a resposta é individual. Trate as zonas como ferramenta prática, não como fronteiras exatas.",
  related: [
    { title: "O que limita o VO2máx", href: `/aprender/conteudos/${DISC}--vo2max-limitantes`, type: "mecanismo" },
    { title: "Zonas e monitoramento (FC)", href: "/aprender/conteudos/treinamento-cardiorrespiratorio--zonas-fc", type: "conceito" },
    { title: "Percepção de esforço e carga interna", href: "/aprender/conteudos/controle-de-carga-e-recuperacao--srpe", type: "conceito" },
  ],
  refs: ["ref-macinnis-gibala-2017", "ref-borg-pse", "ref-oms-atividade"],
  applyRx: "Guie a intensidade aeróbia pelos limiares usando teste da fala e percepção de esforço: maior parte do volume conversável, estímulos intensos pontuais. Reserve a frequência cardíaca como apoio quando confiável.",
});

/* ------------------------------ Módulo 2: respostas à força ------------------------------ */

const adaptacaoNeural = deepLesson({
  disciplineSlug: DISC,
  moduleId: `m-${DISC}-respostas-forca`,
  moduleSlug: "respostas-forca",
  slug: `${DISC}--adaptacao-neural`,
  title: "Adaptação neural: por que a força vem antes do músculo",
  subtitle: "Respostas ao treino de força",
  description: "Nas primeiras semanas, o iniciante fica bem mais forte sem crescer visivelmente. Entenda por que, e o que isso muda na prescrição.",
  level: "intermediario",
  minutes: 11,
  type: "mecanismo",
  kicker: K,
  tags: ["adaptação neural", "recrutamento", "iniciante"],
  hero: "O ganho de força inicial de um iniciante é, em grande parte, o sistema nervoso aprendendo a usar melhor o músculo que já existe. A hipertrofia visível vem depois.",
  question: "Um aluno ganhou 30 por cento de carga no agachamento em seis semanas, mas as pernas quase não mudaram de tamanho. Isso faz sentido?",
  concepts: [
    { term: "Adaptação neural", definition: "Melhora na capacidade do sistema nervoso de recrutar unidades motoras, aumentar a frequência de disparo e coordenar músculos. Responde por boa parte do ganho de força nas primeiras semanas (Folland e Williams, 2007)." },
    { term: "Unidade motora", definition: "Um neurônio motor e todas as fibras que ele inerva. Recrutar mais unidades e dispará-las mais rápido aumenta a força produzida." },
  ],
  timeline: {
    title: "Como força e tamanho evoluem no iniciante",
    items: [
      { time: "Semanas 1 a 4", title: "Aprendizado do movimento", detail: "Melhora rápida da técnica e da coordenação; a carga sobe sem hipertrofia significativa." },
      { time: "Semanas 4 a 8", title: "Ganho neural predominante", detail: "Mais unidades motoras recrutadas e melhor sincronização; a força cresce bem à frente do tamanho." },
      { time: "A partir de ~8 semanas", title: "Hipertrofia assume", detail: "Com estímulo e volume adequados, o aumento da secção muscular passa a contribuir cada vez mais para a força." },
    ],
  },
  apply: "Nas primeiras semanas de um iniciante, priorize aprendizado técnico e progressão simples de carga, com volume moderado. Grande parte do resultado inicial é neural; não é necessário volume alto nem exercícios avançados para progredir. Espere que a mudança de tamanho apareça mais tarde e comunique isso ao aluno para alinhar expectativa.",
  special: [
    "Idosos: a adaptação neural também ocorre e melhora força e equilíbrio rapidamente, com ganho funcional antes da hipertrofia.",
    "Retorno de lesão: parte da força perdida volta rápido por via neural quando o movimento é retomado com segurança.",
  ],
  mistake: {
    mistake: "Achar que um iniciante precisa de programas complexos e altíssimo volume para progredir, ou concluir que 'não funciona' porque o músculo ainda não cresceu.",
    instead: "Mantenha simples: bons padrões, progressão de carga e volume moderado bastam no início. Explique que a força vem antes do tamanho para não frustrar a expectativa.",
  },
  professionalCase: {
    prompt: "Iniciante frustrado porque 'está mais forte mas não vê diferença no espelho' após um mês. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Explicar a adaptação neural, manter a progressão simples e ajustar a expectativa de tempo.", tone: "recomendada", feedback: "Coerente. Entender que a força inicial é neural evita frustração e sustenta a adesão enquanto a hipertrofia se constrói." },
      { id: "c2", label: "Dobrar imediatamente o volume para 'forçar' o crescimento.", tone: "cautela", feedback: "Saltar o volume cedo aumenta a fadiga e o risco sem necessidade; o iniciante ainda responde a estímulos modestos." },
      { id: "c3", label: "Trocar todo o programa por métodos avançados de hipertrofia.", tone: "aceitavel", feedback: "Métodos avançados raramente são necessários no início e podem atrapalhar o aprendizado técnico." },
    ],
  },
  quiz: [
    q("q1", "verdadeiro-falso", "O ganho de força nas primeiras semanas de um iniciante é explicado principalmente por hipertrofia.", [
      { id: "v", label: "Verdadeiro" },
      { id: "f", label: "Falso" },
    ], "f", "No início predomina a adaptação neural; a hipertrofia contribui mais a partir de algumas semanas."),
    q("q2", "conduta", "Para um iniciante nas primeiras semanas, o mais coerente é:", [
      { id: "a", label: "Priorizar técnica e progressão simples com volume moderado." },
      { id: "b", label: "Aplicar já alto volume e métodos avançados de intensidade." },
    ], "a", "O iniciante responde bem a estímulos simples; o foco é aprender os padrões e progredir a carga."),
  ],
  uncertainty: "A divisão exata entre contribuição neural e hipertrófica ao longo do tempo é uma estimativa e varia entre pessoas e exercícios. Use a ideia como guia de expectativa, não como cronograma rígido.",
  related: [
    { title: "Mecanismos de hipertrofia", href: `/aprender/conteudos/${DISC}--hipertrofia-mecanismos`, type: "mecanismo" },
    { title: "Unidade motora e recrutamento", href: "/aprender/conteudos/neurofisiologia-do-movimento--unidade-motora", type: "conceito" },
    { title: "Intensidade e volume", href: "/aprender/conteudos/forca-intensidade-e-volume", type: "conceito" },
  ],
  refs: ["ref-folland-williams-2007", "ref-diretriz-forca", "ref-acsm-progressao-2009"],
  applyRx: "No iniciante, mantenha o programa simples (bons padrões, progressão de carga, volume moderado) e alinhe a expectativa: a força cresce antes do tamanho porque a adaptação inicial é neural.",
});

const hipertrofia = deepLesson({
  disciplineSlug: DISC,
  moduleId: `m-${DISC}-respostas-forca`,
  moduleSlug: "respostas-forca",
  slug: `${DISC}--hipertrofia-mecanismos`,
  title: "Mecanismos da hipertrofia",
  subtitle: "Respostas ao treino de força",
  description: "O que realmente faz o músculo crescer, e como cada variável do treino se conecta a esses mecanismos.",
  level: "intermediario",
  minutes: 13,
  type: "mecanismo",
  kicker: K,
  tags: ["hipertrofia", "tensão mecânica", "síntese proteica"],
  hero: "Hipertrofia é o saldo positivo, repetido por semanas, entre síntese e degradação de proteínas musculares. A tensão mecânica do treino é o principal gatilho desse saldo.",
  question: "Se dois programas têm o mesmo volume, o que decide qual gera mais hipertrofia: a carga, o número de exercícios ou a proximidade da falha?",
  concepts: [
    { term: "Tensão mecânica", definition: "Força que as fibras musculares suportam durante a contração sob carga. É considerada o principal gatilho da hipertrofia; cresce com carga alta e com séries levadas para perto da falha (Schoenfeld, 2010)." },
    { term: "Síntese proteica muscular", definition: "Processo de construção de novas proteínas contráteis. O treino a eleva por horas a dias; quando supera a degradação de forma repetida, o músculo cresce." },
  ],
  mechanism: {
    title: "Do estímulo ao crescimento",
    steps: [
      { label: "Tensão sobre as fibras", detail: "A carga e o esforço próximo da falha impõem tensão elevada, o sinal central da hipertrofia." },
      { label: "Sinalização anabólica", detail: "A tensão e o estresse metabólico ativam vias (entre elas a via mTOR) que estimulam a síntese proteica." },
      { label: "Síntese elevada", detail: "A construção de proteínas contráteis sobe após a sessão, dependente também de proteína alimentar suficiente." },
      { label: "Recuperação", detail: "Com descanso adequado, o saldo fica positivo; sem recuperação, o estímulo não se consolida." },
      { label: "Acúmulo semanal", detail: "Muitas sessões com saldo positivo aumentam a secção transversa do músculo ao longo de semanas." },
    ],
  },
  apply: "Traduza os mecanismos em variáveis: garanta tensão mecânica com carga adequada e esforço próximo da falha; acumule volume semanal suficiente; permita recuperação. Responda à pergunta de abertura: com volume equiparado, a proximidade da falha e a carga que gera tensão pesam mais do que somar exercícios diferentes.",
  special: [
    "Idosos: a hipertrofia é possível e combate a sarcopenia; requer carga progressiva e proteína adequada, com amplitude confortável.",
    "Iniciantes: respondem com cargas moderadas e volume modesto; não é preciso treinar à exaustão para crescer.",
    "Populações com restrição articular: priorize amplitude tolerada e variações de menor impacto sem abrir mão da tensão suficiente.",
  ],
  mistake: {
    mistake: "Perseguir 'sentir a queimação' e a fadiga metabólica como se fossem o principal motor da hipertrofia, negligenciando carga e volume efetivo.",
    instead: "Priorize tensão mecânica (carga adequada, esforço próximo da falha) e volume semanal. O estresse metabólico contribui, mas não substitui uma boa dose de tensão e volume.",
  },
  professionalCase: {
    prompt: "Aluno de hipertrofia faz muitas repetições leves 'para sentir o músculo' e não progride. Qual ajuste é mais coerente?",
    choices: [
      { id: "c1", label: "Aumentar a carga para uma faixa que gere tensão real e aproximar as séries da falha, garantindo volume efetivo.", tone: "recomendada", feedback: "Coerente. A tensão mecânica insuficiente é a causa provável; ajustar carga e esforço restabelece o estímulo." },
      { id: "c2", label: "Adicionar ainda mais repetições leves para compensar.", tone: "cautela", feedback: "Mais volume com tensão baixa acumula fadiga sem estimular; não resolve o problema central." },
      { id: "c3", label: "Focar só em exercícios que causem muita queimação.", tone: "aceitavel", feedback: "O estresse metabólico ajuda, mas sem carga suficiente o estímulo fica incompleto." },
    ],
  },
  quiz: [
    q("q1", "variavel", "O principal gatilho proposto da hipertrofia é:", [
      { id: "a", label: "A tensão mecânica sobre as fibras." },
      { id: "b", label: "A queimação (estresse metabólico) por si só." },
    ], "a", "A tensão mecânica é considerada o principal driver; o estresse metabólico contribui, mas não substitui carga e volume."),
    q("q2", "conduta", "Com volume equiparado entre dois programas, o que mais influencia a hipertrofia?", [
      { id: "a", label: "Proximidade da falha e carga que gera tensão adequada." },
      { id: "b", label: "Apenas a quantidade de exercícios diferentes." },
    ], "a", "Com volume igual, a qualidade do estímulo (tensão e proximidade da falha) pesa mais do que a variedade de exercícios."),
  ],
  uncertainty: "O peso relativo de tensão mecânica, estresse metabólico e dano muscular ainda é debatido, e a resposta varia entre pessoas. Trate a tensão como prioridade prática, sem descartar os demais fatores.",
  related: [
    { title: "Adaptação neural", href: `/aprender/conteudos/${DISC}--adaptacao-neural`, type: "mecanismo" },
    { title: "Intensidade e volume", href: "/aprender/conteudos/forca-intensidade-e-volume", type: "conceito" },
    { title: "Repetições em reserva (RIR)", href: "/aprender/conteudos/forca-repeticoes-em-reserva", type: "mecanismo" },
  ],
  refs: ["ref-schoenfeld-hipertrofia-2010", "ref-schoenfeld-volume-2017", "ref-diretriz-forca"],
  applyRx: "Para hipertrofia, garanta tensão mecânica (carga adequada, esforço próximo da falha), acumule volume semanal suficiente e permita recuperação. Priorize esses fatores sobre a busca de queimação.",
});

/* ------------------------------ Módulo 3: fadiga e recuperação ------------------------------ */

const fadiga = deepLesson({
  disciplineSlug: DISC,
  moduleId: `m-${DISC}-fadiga-recuperacao`,
  moduleSlug: "fadiga-recuperacao",
  slug: `${DISC}--fadiga-central-periferica`,
  title: "Fadiga central e periférica",
  subtitle: "Fadiga e recuperação",
  description: "Nem toda fadiga é igual. Distinguir a origem ajuda a dosar volume, intensidade e descanso com mais critério.",
  level: "intermediario",
  minutes: 11,
  type: "conceito",
  kicker: K,
  tags: ["fadiga", "recuperação", "volume"],
  hero: "A queda de desempenho durante e após o treino tem origens diferentes: parte no sistema nervoso (central) e parte no próprio músculo (periférica). Ler qual predomina orienta o ajuste.",
  question: "Seu aluno terminou o treino de perna arrastando e no dia seguinte está exausto de corpo inteiro, não só com a perna dolorida. O que isso sugere sobre a carga?",
  concepts: [
    { term: "Fadiga periférica", definition: "Redução da capacidade do próprio músculo de gerar força, ligada a fatores locais como depleção de substratos e acúmulo de metabólitos. Tende a se recuperar em horas a poucos dias." },
    { term: "Fadiga central", definition: "Redução do comando do sistema nervoso para o músculo, influenciada por esforço acumulado, sono, estresse e nutrição. Sinais sistêmicos (cansaço geral, disposição baixa) apontam para ela." },
  ],
  comparison: {
    title: "Como diferenciar na prática",
    leftTitle: "Mais periférica",
    rightTitle: "Mais central e sistêmica",
    leftItems: [
      "Dor e cansaço localizados no grupo treinado.",
      "Desempenho volta em um a três dias.",
      "Responde bem ao descanso local e à rotação de grupos.",
    ],
    rightItems: [
      "Cansaço de corpo inteiro, disposição e humor baixos.",
      "Sono ruim, irritabilidade, queda geral de desempenho.",
      "Pede redução de volume e intensidade e atenção a sono e estresse.",
    ],
    note: "No caso da abertura, o cansaço sistêmico no dia seguinte sugere componente central e acúmulo de carga, não só fadiga local da perna. A conduta muda: aqui o corpo pede recuperação global, não apenas descanso da perna.",
  },
  apply: "Use a origem da fadiga para ajustar: fadiga local responde à distribuição de grupos e ao descanso entre sessões; sinais sistêmicos pedem reduzir volume e intensidade e cuidar de sono e estresse. Registrar a percepção de esforço da sessão ajuda a enxergar acúmulo antes que vire estagnação.",
  special: [
    "Idosos: a recuperação costuma ser mais lenta; distribua o volume e valorize o sono.",
    "Rotinas de alto estresse (trabalho, sono ruim): a fadiga central pesa mais; ajuste a carga à vida real do aluno.",
  ],
  mistake: {
    mistake: "Tratar toda queda de desempenho como falta de esforço e responder com mais volume e intensidade.",
    instead: "Leia os sinais: se são sistêmicos, o caminho é recuperar, não forçar. Ajustar volume e cuidar de sono e estresse costuma restaurar o desempenho mais rápido.",
  },
  professionalCase: {
    prompt: "Aluno relata cansaço geral, sono ruim e queda de desempenho em todos os exercícios há duas semanas. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Reduzir volume e intensidade por alguns dias e observar sono e estresse.", tone: "recomendada", feedback: "Coerente. Sinais sistêmicos indicam fadiga central acumulada; recuperar é o caminho mais direto." },
      { id: "c2", label: "Aumentar a intensidade para 'quebrar a estagnação'.", tone: "cautela", feedback: "Forçar sobre fadiga sistêmica tende a piorar o desempenho e o risco. A estagnação aqui é falta de recuperação." },
      { id: "c3", label: "Manter tudo igual e esperar passar.", tone: "aceitavel", feedback: "Pode melhorar sozinho, mas ajustar a carga e cuidar do sono costuma resolver mais rápido." },
    ],
  },
  quiz: [
    q("q1", "variavel", "Cansaço de corpo inteiro, sono ruim e queda geral de desempenho apontam mais para:", [
      { id: "a", label: "Fadiga central e sistêmica." },
      { id: "b", label: "Fadiga periférica localizada." },
    ], "a", "Sinais sistêmicos sugerem componente central; a fadiga periférica é mais localizada e de recuperação mais rápida."),
    q("q2", "conduta", "Diante de sinais claros de fadiga sistêmica acumulada, o mais coerente é:", [
      { id: "a", label: "Reduzir volume e intensidade e cuidar de sono e estresse." },
      { id: "b", label: "Aumentar a carga para superar a fase." },
    ], "a", "A recuperação global é o que restaura o desempenho; forçar carga agrava o quadro."),
  ],
  uncertainty: "As fronteiras entre fadiga central e periférica se sobrepõem e a mensuração exata é complexa. Use a distinção como guia de conduta, apoiada na observação do aluno.",
  related: [
    { title: "Supercompensação", href: `/aprender/conteudos/${DISC}--supercompensacao`, type: "mecanismo" },
    { title: "Sobrecarga progressiva", href: "/aprender/conteudos/forca-sobrecarga-progressiva", type: "conceito" },
    { title: "Sinais de fadiga e recuperação", href: "/aprender/conteudos/controle-de-carga-e-recuperacao--sinais-fadiga", type: "mecanismo" },
  ],
  refs: ["ref-foster-srpe-2001", "ref-borg-pse", "ref-diretriz-forca"],
  applyRx: "Leia a origem da fadiga: local pede distribuição e descanso entre sessões; sistêmica pede reduzir carga e cuidar de sono e estresse. Registrar a percepção de esforço ajuda a antecipar acúmulo.",
});

const supercompensacao = deepLesson({
  disciplineSlug: DISC,
  moduleId: `m-${DISC}-fadiga-recuperacao`,
  moduleSlug: "fadiga-recuperacao",
  slug: `${DISC}--supercompensacao`,
  title: "Supercompensação: estímulo, recuperação e progresso",
  subtitle: "Fadiga e recuperação",
  description: "O modelo que explica por que treino e descanso, juntos, produzem melhora, e por que faltar recuperação estanca o resultado.",
  level: "intermediario",
  minutes: 11,
  type: "mecanismo",
  kicker: K,
  tags: ["supercompensação", "recuperação", "sobrecarga"],
  hero: "O treino, sozinho, gera fadiga e queda momentânea de desempenho. É na recuperação que o corpo se reconstrói um pouco mais capaz. Progresso é o encaixe repetido entre estímulo e descanso.",
  question: "Por que treinar o mesmo grupo com muita intensidade todos os dias, sem descanso, tende a piorar o desempenho em vez de melhorar?",
  concepts: [
    { term: "Supercompensação", definition: "Após um estímulo suficiente e recuperação adequada, o organismo se restabelece acima do nível inicial, ficando um pouco mais apto. É a base da progressão." },
    { term: "Sobrecarga e recuperação", definition: "A adaptação exige um estímulo que desafie a homeostase e tempo de recuperação suficiente. Estímulo sem recuperação acumula fadiga; recuperação sem estímulo não gera progresso." },
  ],
  timeline: {
    title: "O ciclo em uma sessão",
    items: [
      { time: "Durante e logo após", title: "Queda de desempenho", detail: "A fadiga reduz momentaneamente a capacidade; é esperado e faz parte do processo." },
      { time: "Horas a dias", title: "Recuperação", detail: "Com sono, nutrição e descanso, o corpo restaura e reconstrói as estruturas exigidas." },
      { time: "Após recuperar", title: "Supercompensação", detail: "O desempenho retorna acima do nível anterior; é a janela para o próximo estímulo." },
      { time: "Se não houver descanso", title: "Acúmulo de fadiga", detail: "Novos estímulos sobre fadiga não recuperada empilham cansaço e estancam ou revertem o progresso." },
    ],
  },
  apply: "Programe o próximo estímulo respeitando a recuperação: distribua a frequência para que cada grupo seja treinado quando já se recuperou o suficiente, e insira semanas de menor carga diante de fadiga acumulada. Responder à pergunta de abertura: treinar o mesmo grupo intensamente todo dia impede a supercompensação, pois nunca há tempo de reconstruir.",
  special: [
    "Idosos: janelas de recuperação mais longas pedem frequência bem distribuída e atenção ao sono.",
    "Alto estresse de vida: a recuperação fica comprometida; ajuste volume e intensidade à realidade, não ao ideal.",
  ],
  mistake: {
    mistake: "Assumir que mais treino é sempre mais resultado e encaixar sessões intensas sem espaço para recuperar.",
    instead: "Trate a recuperação como parte do treino, não como ausência dele. O progresso mora no encaixe entre estímulo e descanso; sem o segundo, o primeiro não rende.",
  },
  professionalCase: {
    prompt: "Aluno dedicado insiste em treinar pesado o mesmo grupo seis vezes por semana e reclama que 'está piorando'. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Reorganizar a frequência para dar recuperação entre estímulos e ajustar o volume por sessão.", tone: "recomendada", feedback: "Coerente. Sem recuperação não há supercompensação; distribuir e recuperar restabelece o progresso." },
      { id: "c2", label: "Aumentar ainda mais a intensidade para vencer a piora.", tone: "cautela", feedback: "Adicionar estímulo sobre fadiga não recuperada aprofunda o problema. O corpo pede descanso, não mais carga." },
      { id: "c3", label: "Trocar os exercícios mantendo a frequência diária.", tone: "aceitavel", feedback: "Variar não resolve a falta de recuperação; a raiz é o intervalo insuficiente entre estímulos." },
    ],
  },
  quiz: [
    q("q1", "verdadeiro-falso", "A melhora do desempenho acontece durante o próprio treino, não no descanso.", [
      { id: "v", label: "Verdadeiro" },
      { id: "f", label: "Falso" },
    ], "f", "O treino gera fadiga; a melhora se consolida na recuperação, quando ocorre a supercompensação."),
    q("q2", "conduta", "Diante de fadiga acumulada por frequência excessiva, o passo mais coerente é:", [
      { id: "a", label: "Distribuir a frequência e permitir recuperação entre estímulos." },
      { id: "b", label: "Manter a frequência diária e aumentar a intensidade." },
    ], "a", "Recuperação suficiente entre estímulos é o que permite a supercompensação e o progresso."),
  ],
  uncertainty: "O modelo de supercompensação é uma simplificação didática; a resposta real é mais complexa e individual, com múltiplas capacidades se recuperando em ritmos diferentes. Use-o como guia, não como cronômetro exato.",
  related: [
    { title: "Fadiga central e periférica", href: `/aprender/conteudos/${DISC}--fadiga-central-periferica`, type: "conceito" },
    { title: "Frequência: distribuir o volume", href: "/aprender/conteudos/forca-frequencia", type: "conceito" },
    { title: "Recuperação: sono e estresse", href: "/aprender/conteudos/controle-de-carga-e-recuperacao--sono-estresse", type: "conceito" },
  ],
  refs: ["ref-diretriz-forca", "ref-foster-srpe-2001", "ref-acsm-progressao-2009"],
  applyRx: "Programe o próximo estímulo respeitando a recuperação: distribua a frequência para treinar cada grupo já recuperado e insira descargas diante de fadiga acumulada. Recuperação é parte do treino, não pausa dele.",
});

/* ---------------------------------- módulos e export --------------------------------- */

export const fisiologiaExercicioModules: Module[] = [
  deepModule({
    id: `m-${DISC}-aptidao-aerobia`,
    disciplineId: DISC_ID,
    slug: "aptidao-aerobia",
    title: "Aptidão aeróbia",
    objective: "Entender e treinar a capacidade cardiorrespiratória com critério.",
    order: 1,
    level: "intermediario",
    lessons: [vo2max, limiares],
    applications: ["Definir intensidade aeróbia por limiares e teste da fala"],
  }),
  deepModule({
    id: `m-${DISC}-respostas-forca`,
    disciplineId: DISC_ID,
    slug: "respostas-forca",
    title: "Respostas ao treino de força",
    objective: "Distinguir adaptações neurais e estruturais e ligá-las à prescrição.",
    order: 2,
    level: "intermediario",
    prerequisites: [`m-${DISC}-aptidao-aerobia`],
    lessons: [adaptacaoNeural, hipertrofia],
    applications: ["Alinhar expectativa de força e tamanho na progressão do iniciante"],
  }),
  deepModule({
    id: `m-${DISC}-fadiga-recuperacao`,
    disciplineId: DISC_ID,
    slug: "fadiga-recuperacao",
    title: "Fadiga e recuperação",
    objective: "Ler a fadiga para dosar volume, intensidade e descanso.",
    order: 3,
    level: "intermediario",
    prerequisites: [`m-${DISC}-respostas-forca`],
    lessons: [fadiga, supercompensacao],
    applications: ["Ajustar carga e recuperação pelos sinais de fadiga"],
  }),
];

export const fisiologiaExercicioLessons: Lesson[] = [
  vo2max,
  limiares,
  adaptacaoNeural,
  hipertrofia,
  fadiga,
  supercompensacao,
];
