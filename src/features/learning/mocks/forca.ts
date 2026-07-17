import type { Lesson, LessonBlock, Module } from "../types";

/**
 * TREINAMENTO DE FORÇA, disciplina autorada em profundidade (padrão "livro-texto").
 *
 * Diferente do currículo curado (curriculo.ts), que gera aulas-esqueleto, aqui cada
 * aula é escrita bloco a bloco com a estrutura pedagógica completa: pergunta de
 * prescrição, conceitos, mecanismo, comparação, dado, aplicação prática, populações
 * especiais, erro comum, caso, quiz comentado, incerteza científica, conexões entre
 * disciplinas, referências reais e aplicação ao atendimento.
 *
 * Toda teoria termina respondendo: como isto muda a escolha de carga, séries,
 * frequência, intervalo e progressão? Linguagem prudente, sem travessão.
 */

const DISC_ID = "d-forca";
const DISC_SLUG = "treinamento-de-forca";

/** cria um bloco com id único e ordem sequencial dentro da aula. */
function makeB(prefix: string) {
  let n = 0;
  return (type: LessonBlock["type"], content: unknown, extra: Partial<LessonBlock> = {}): LessonBlock => ({
    id: `${prefix}-${++n}`,
    type,
    order: n,
    content,
    ...extra,
  });
}

/* ============================ AULA 1: INTENSIDADE E VOLUME ============================ */

const bIV = makeB("blk-forca-iv");
const intensidadeVolume: Lesson = {
  id: "l-forca-intensidade-e-volume",
  moduleId: "m-forca-variaveis",
  disciplineSlug: DISC_SLUG,
  moduleSlug: "variaveis-do-treino",
  slug: "forca-intensidade-e-volume",
  title: "Intensidade e volume: as duas variáveis mestras",
  subtitle: "Variáveis do treino de força",
  description:
    "Quanto peso e quanto trabalho. Entenda como intensidade e volume se combinam para produzir força ou hipertrofia, e como isso decide a carga que você prescreve.",
  level: "fundamental",
  estimatedMinutes: 14,
  type: "conceito",
  status: "nao-iniciado",
  progress: 0,
  reviewedAt: "2026-07-11",
  reviewedBy: "Equipe editorial",
  tags: ["intensidade", "volume", "hipertrofia", "força", "1RM"],
  blocks: [
    bIV("hero", {
      kicker: "Variáveis do treino de força",
      text: "Toda prescrição de musculação é, no fundo, uma decisão sobre duas variáveis: quanto peso (intensidade) e quanto trabalho (volume). Dominar a relação entre elas é o que separa copiar uma ficha de prescrever com critério.",
    }),
    bIV("prescription_question", {
      question:
        "Dois alunos com o mesmo objetivo de hipertrofia treinam peito. Um faz 3 séries de 5 repetições pesadas; outro, 3 séries de 12 repetições moderadas. Qual tende a hipertrofiar mais, e o que realmente decide isso?",
    }),
    bIV(
      "key_concept",
      {
        term: "Intensidade (carga relativa)",
        definition:
          "É o peso levantado em relação à capacidade máxima, expresso como percentual de 1RM (uma repetição máxima). 80% de 1RM é uma intensidade alta; 50% é baixa. A intensidade define, sobretudo, em que faixa de repetições o aluno consegue trabalhar.",
      },
      { title: "Conceito 1: o que é intensidade" },
    ),
    bIV(
      "key_concept",
      {
        term: "Volume (dose de trabalho)",
        definition:
          "É a quantidade total de trabalho realizado. Na prática moderna, a métrica mais útil é o número de séries dirigidas a cada grupo muscular por semana, feitas com esforço próximo o suficiente da falha. Séries por semana costuma prever melhor a hipertrofia do que o clássico séries vezes repetições vezes carga.",
      },
      { title: "Conceito 2: o que é volume" },
    ),
    bIV(
      "chart_explainer",
      {
        title: "Volume semanal por grupo muscular e hipertrofia (ilustrativo)",
        points: [
          { label: "~6 séries", value: 62 },
          { label: "~12 séries", value: 86 },
          { label: "~18 séries", value: 100 },
          { label: "~24 séries", value: 97 },
        ],
        explanation:
          "A literatura descreve uma relação dose-resposta: dentro de faixas toleradas, mais volume semanal tende a mais hipertrofia, com retornos decrescentes e um teto individual. Os valores são ilustrativos; o ponto ótimo varia com nível de treino, recuperação e adesão (Schoenfeld, Ogborn e Krieger, 2017).",
      },
      { title: "O que a dose de volume produz" },
    ),
    bIV(
      "mechanism_flow",
      {
        steps: [
          {
            label: "Tensão mecânica",
            detail:
              "Cargas altas e séries levadas para perto da falha geram tensão elevada nas fibras. A tensão mecânica é considerada o principal gatilho da hipertrofia (Schoenfeld, 2010).",
          },
          {
            label: "Sinalização celular",
            detail:
              "A tensão e o estresse metabólico ativam vias de sinalização (entre elas a via mTOR) que aumentam a síntese de proteínas musculares.",
          },
          {
            label: "Síntese proteica elevada",
            detail:
              "Após a sessão, a síntese de proteínas fica elevada por horas a dias, sobrepondo-se à degradação quando há estímulo e proteína suficientes.",
          },
          {
            label: "Recuperação e remodelamento",
            detail:
              "Com recuperação adequada, o saldo positivo repetido ao longo de semanas se traduz em aumento da secção transversa do músculo.",
          },
          {
            label: "Adaptação acumulada",
            detail:
              "Hipertrofia é o efeito somado de muitas sessões. Nenhuma série isolada constrói músculo; o programa constrói.",
          },
        ],
      },
      { title: "Como o estímulo vira adaptação" },
    ),
    bIV(
      "comparison",
      {
        leftTitle: "Ênfase em força máxima",
        rightTitle: "Ênfase em hipertrofia",
        leftItems: [
          "Intensidade alta, em geral acima de 80% de 1RM.",
          "Faixa de repetições baixa, cerca de 1 a 6 por série.",
          "Intervalos longos, de 2 a 5 minutos, para recuperar a força.",
          "Volume total menor por sessão; a qualidade da carga domina.",
        ],
        rightItems: [
          "Intensidade moderada a alta, faixa ampla de cerca de 6 a 20 repetições.",
          "Volume semanal é o principal driver; distribua séries suficientes.",
          "Intervalos moderados, de 1 a 3 minutos, conforme o exercício.",
          "Trabalhar próximo da falha importa mais quando a carga é mais leve.",
        ],
        note: "Voltando à pergunta de abertura: com séries equiparadas e esforço próximo da falha, 5 repetições pesadas e 12 moderadas produzem hipertrofia semelhante. A faixa de repetições é ampla; quem decide o resultado é o volume ao longo das semanas e a proximidade da falha, não um número mágico de repetições.",
      },
      { title: "Como as duas variáveis mudam conforme o objetivo" },
    ),
    bIV(
      "practical_application",
      {
        text:
          "Decida nesta ordem: primeiro o objetivo (força ou hipertrofia), que fixa a faixa de intensidade e de repetições; depois o volume semanal por grupo, começando conservador e progredindo. Para a maioria dos alunos de hipertrofia, iniciar em torno de 10 séries semanais por grupo e subir conforme a recuperação permite é uma referência segura. A carga de cada exercício é a consequência da faixa de repetições escolhida, não o ponto de partida.",
      },
      { title: "Aplicação à prescrição" },
    ),
    bIV(
      "short_text",
      {
        variant: "observe",
        items: [
          "Iniciantes: respondem a volumes menores e a cargas moderadas; priorize técnica e progressão simples antes de acumular séries.",
          "Idosos: força e potência preservam autonomia; cargas progressivas são seguras e recomendadas, com amplitude e velocidade ajustadas ao conforto.",
          "Hipertensão: cargas muito altas com apneia (manobra de Valsalva) elevam a pressão de forma aguda; prefira intensidades moderadas, evite a apneia e não leve toda série à falha. A conduta clínica é do profissional de saúde.",
          "Retorno de lesão: reduza volume e intensidade e reconstrua de forma gradual, guiando-se pela tolerância, não pelo calendário.",
        ],
      },
      { title: "Em populações especiais" },
    ),
    bIV(
      "common_mistake",
      {
        mistake:
          "Empilhar séries sem parar perto da falha (volume que não estimula) ou, no extremo oposto, levar toda série até a falha absoluta em todos os exercícios.",
        instead:
          "Busque um esforço próximo da falha, tipicamente de 1 a 3 repetições em reserva na maioria das séries, e conte como volume efetivo apenas as séries feitas com esse esforço. Reserve a falha absoluta para exercícios seguros e momentos pontuais.",
      },
      { title: "Erro frequente" },
    ),
    bIV(
      "professional_case",
      {
        prompt:
          "Aluna intermediária, objetivo hipertrofia de membros inferiores, faz há meses 3 séries de agachamento sempre com folga grande e não progride. Qual é o primeiro ajuste mais coerente?",
        choices: [
          {
            id: "c1",
            label: "Aumentar a proximidade da falha e depois acrescentar séries semanais, observando a recuperação.",
            tone: "recomendada",
            feedback:
              "Coerente. Séries com folga grande contam pouco como volume efetivo. Aproximar do esforço adequado e então progredir o volume ataca a causa provável da estagnação.",
          },
          {
            id: "c2",
            label: "Trocar todos os exercícios de perna para variar o estímulo.",
            tone: "cautela",
            feedback:
              "Variar pode ajudar a adesão, mas não corrige o problema central, que é o esforço insuficiente. Trocar tudo ainda reinicia o aprendizado técnico e dificulta medir a progressão.",
          },
          {
            id: "c3",
            label: "Subir muito a carga para forçar séries de 3 repetições.",
            tone: "aceitavel",
            feedback:
              "Cargas mais altas geram força, mas sozinhas não resolvem a falta de volume efetivo para hipertrofia. Pode ser parte da solução, não a primeira medida.",
          },
        ],
      },
      { title: "Mini caso" },
    ),
    bIV(
      "quiz",
      {
        questions: [
          {
            id: "q1",
            type: "verdadeiro-falso",
            prompt:
              "Para hipertrofia, existe uma faixa única de repetições ideal (por exemplo, 8 a 12) fora da qual o músculo não cresce.",
            options: [
              { id: "v", label: "Verdadeiro" },
              { id: "f", label: "Falso" },
            ],
            correctAnswer: "f",
            feedback:
              "A hipertrofia ocorre numa faixa ampla, de cerca de 6 a 20 repetições, desde que o esforço seja próximo da falha. O volume ao longo das semanas pesa mais do que a faixa exata.",
          },
          {
            id: "q2",
            type: "conduta",
            prompt:
              "Aluno de hipertrofia, recuperando bem e sem dor, estagnou. Qual variável ajustar primeiro?",
            options: [
              { id: "a", label: "Aumentar gradualmente o volume semanal por grupo muscular." },
              { id: "b", label: "Reduzir a frequência para descansar mais." },
            ],
            correctAnswer: "a",
            feedback:
              "Com boa recuperação, aumentar o volume semanal é o passo mais direto para retomar o estímulo, respeitando a resposta individual.",
          },
          {
            id: "q3",
            type: "variavel",
            prompt:
              "Qual métrica de volume costuma prever melhor a hipertrofia na prescrição atual?",
            options: [
              { id: "a", label: "Séries efetivas por grupo muscular por semana." },
              { id: "b", label: "Tonelagem total (séries x repetições x carga) de uma sessão." },
            ],
            correctAnswer: "a",
            feedback:
              "Séries semanais por grupo é a métrica mais prática e mais associada ao ganho de massa na literatura recente.",
          },
        ],
      },
      { title: "Verifique seu entendimento" },
    ),
    bIV(
      "scientific_uncertainty",
      {
        text:
          "O teto individual de volume, o ponto exato de retornos decrescentes e o impacto de longo prazo de treinar sempre muito perto da falha ainda têm incerteza e variam entre pessoas. Trate as faixas como pontos de partida e ajuste pela resposta do aluno ao longo das semanas.",
      },
      { title: "O que ainda é incerto" },
    ),
    bIV(
      "related_content",
      {
        items: [
          { title: "Mecanismos de hipertrofia", href: "/aprender/conteudos/fisiologia-do-exercicio--hipertrofia-mecanismos", type: "mecanismo" },
          { title: "Repetições em reserva (RIR)", href: "/aprender/conteudos/forca-repeticoes-em-reserva", type: "mecanismo" },
          { title: "Frequência: distribuir o volume", href: "/aprender/conteudos/forca-frequencia", type: "conceito" },
          { title: "Curvas de resistência", href: "/aprender/conteudos/curvas-de-resistencia", type: "comparacao" },
        ],
      },
      { title: "Revise também" },
    ),
    bIV(
      "references",
      { ids: ["ref-schoenfeld-hipertrofia-2010", "ref-schoenfeld-volume-2017", "ref-acsm-progressao-2009", "ref-diretriz-forca"] },
      { title: "Referências", isOptional: true },
    ),
    bIV(
      "apply_to_prescription",
      {
        summary:
          "Defina o objetivo, que fixa a faixa de intensidade e repetições; escolha o volume semanal por grupo começando conservador (cerca de 10 séries para hipertrofia) e progrida; garanta esforço próximo da falha para que as séries contem como volume efetivo.",
      },
      { title: "Aplicar no atendimento" },
    ),
  ],
  references: ["ref-schoenfeld-volume-2017", "ref-schoenfeld-hipertrofia-2010"],
  relatedContent: ["forca-frequencia", "forca-repeticoes-em-reserva"],
};

/* ================================ AULA 2: FREQUÊNCIA ================================= */

const bFR = makeB("blk-forca-fr");
const frequencia: Lesson = {
  id: "l-forca-frequencia",
  moduleId: "m-forca-variaveis",
  disciplineSlug: DISC_SLUG,
  moduleSlug: "variaveis-do-treino",
  slug: "forca-frequencia",
  title: "Frequência: como distribuir o volume na semana",
  subtitle: "Variáveis do treino de força",
  description:
    "Quantas vezes por semana treinar cada grupo. Entenda por que a frequência importa mais como forma de organizar o volume do que como estímulo independente.",
  level: "fundamental",
  estimatedMinutes: 12,
  type: "conceito",
  status: "nao-iniciado",
  progress: 0,
  reviewedAt: "2026-07-11",
  reviewedBy: "Equipe editorial",
  tags: ["frequência", "volume", "divisão de treino", "organização"],
  blocks: [
    bFR("hero", {
      kicker: "Variáveis do treino de força",
      text: "Treinar cada grupo uma, duas ou três vezes por semana é uma das perguntas mais repetidas na academia. A resposta moderna é menos sobre um número mágico e mais sobre como você distribui o volume que já decidiu aplicar.",
    }),
    bFR("prescription_question", {
      question:
        "Um aluno consegue 16 séries semanais de peito. Faz diferença fazer tudo numa sessão ou dividir em duas de 8? E se ele só puder treinar duas vezes na semana?",
    }),
    bFR(
      "key_concept",
      {
        term: "Frequência semanal",
        definition:
          "Número de sessões que estimulam um mesmo grupo muscular ao longo da semana. Um grupo treinado na segunda e na quinta tem frequência 2. É diferente do número de treinos na semana: pode-se treinar 5 dias e ainda assim atingir cada grupo 2 vezes.",
      },
      { title: "Conceito-chave" },
    ),
    bFR(
      "comparison",
      {
        leftTitle: "Concentrar o volume (frequência baixa)",
        rightTitle: "Distribuir o volume (frequência maior)",
        leftItems: [
          "Muitas séries do mesmo grupo numa sessão.",
          "As últimas séries chegam com mais fadiga, com queda de carga e de qualidade.",
          "Menos dias exigidos na semana; útil para quem tem pouca disponibilidade.",
        ],
        rightItems: [
          "O mesmo volume repartido em mais sessões.",
          "Cada sessão tem séries mais frescas, o que tende a preservar a qualidade.",
          "Exige mais dias, mas costuma facilitar volumes semanais altos.",
        ],
        note: "Com o volume semanal equiparado, a frequência por si só tem efeito pequeno sobre a hipertrofia e sobre a força (Schoenfeld et al., 2016; Grgic et al., 2018). O maior valor da frequência é permitir acumular e tolerar mais volume com qualidade.",
      },
      { title: "Duas formas de organizar o mesmo volume" },
    ),
    bFR(
      "mechanism_flow",
      {
        steps: [
          {
            label: "Volume semanal definido",
            detail: "Primeiro decide-se quantas séries por grupo a semana terá, com base no objetivo e na recuperação.",
          },
          {
            label: "Fadiga por sessão",
            detail:
              "Concentrar muitas séries num único dia acumula fadiga; as séries finais rendem menos carga e menos repetições efetivas.",
          },
          {
            label: "Distribuição em mais dias",
            detail:
              "Repartir o mesmo volume em duas ou três sessões mantém cada série mais próxima do desempenho pleno.",
          },
          {
            label: "Volume efetivo preservado",
            detail:
              "Mais séries realizadas com boa carga e esforço adequado significam mais volume que de fato estimula, sem aumentar o total.",
          },
        ],
      },
      { title: "Por que distribuir costuma ajudar" },
    ),
    bFR(
      "decision_tree",
      {
        root: "Quantos dias o aluno consegue treinar por semana?",
        branches: [
          { condition: "2 dias", outcome: "Corpo todo nas duas sessões: cada grupo é atingido 2 vezes com bom aproveitamento do tempo." },
          { condition: "3 dias", outcome: "Corpo todo ou uma divisão superior e inferior alternada, mantendo frequência 1,5 a 2 por grupo." },
          { condition: "4 dias", outcome: "Divisão superior e inferior duas vezes, frequência 2 por grupo, boa para volumes maiores." },
          { condition: "5 a 6 dias", outcome: "Divisões mais fracionadas; garanta frequência de pelo menos 2 e distribua o volume para não sobrecarregar um dia." },
        ],
      },
      { title: "Escolher a divisão pela disponibilidade" },
    ),
    bFR(
      "practical_application",
      {
        text:
          "Comece pela vida real do aluno: quantos dias ele sustenta na semana. A partir daí, escolha a divisão que entrega o volume-alvo com frequência de pelo menos 2 por grupo quando possível. Para quem tem poucos dias, treinos de corpo todo costumam ser mais eficientes do que divisões que deixam cada grupo uma vez só.",
      },
      { title: "Aplicação à prescrição" },
    ),
    bFR(
      "short_text",
      {
        variant: "observe",
        items: [
          "Iniciantes: corpo todo 2 a 3 vezes por semana aprende os padrões e distribui bem o volume inicial.",
          "Rotina instável (viagens, plantões): frequência menor com sessões de corpo todo protege o resultado quando faltam dias.",
          "Idosos: distribuir em mais sessões curtas pode ser mais tolerável do que poucas sessões longas.",
        ],
      },
      { title: "Em populações e contextos especiais" },
    ),
    bFR(
      "common_mistake",
      {
        mistake:
          "Perseguir alta frequência achando que treinar mais vezes, por si, gera mais resultado, mesmo sem aumentar o volume efetivo.",
        instead:
          "Trate a frequência como ferramenta para distribuir e sustentar o volume com qualidade. Se o volume não muda, subir a frequência traz ganho pequeno; ajuste a frequência para caber na rotina e preservar as séries.",
      },
      { title: "Erro frequente" },
    ),
    bFR(
      "professional_case",
      {
        prompt:
          "Aluno de hipertrofia só consegue treinar 3 vezes por semana e hoje faz uma divisão que atinge cada grupo apenas uma vez. Reclama de sessões muito longas e cansativas. Qual ajuste é mais coerente?",
        choices: [
          {
            id: "c1",
            label: "Migrar para corpo todo ou superior e inferior alternado, elevando a frequência por grupo para cerca de 2.",
            tone: "recomendada",
            feedback:
              "Coerente. Com 3 dias, distribuir o volume aumenta a frequência por grupo e encurta as sessões, preservando a qualidade das séries.",
          },
          {
            id: "c2",
            label: "Manter a divisão e apenas adicionar mais séries em cada dia.",
            tone: "cautela",
            feedback:
              "Isso alonga ainda mais sessões que já estão cansativas e concentra fadiga, o que reduz o volume efetivo. Não resolve a queixa.",
          },
          {
            id: "c3",
            label: "Reduzir para 2 dias para descansar mais.",
            tone: "aceitavel",
            feedback:
              "Pode funcionar se a rotina exigir, mas retira um dia disponível sem necessidade. Com 3 dias, a melhor saída costuma ser distribuir melhor, não treinar menos.",
          },
        ],
      },
      { title: "Mini caso" },
    ),
    bFR(
      "quiz",
      {
        questions: [
          {
            id: "q1",
            type: "verdadeiro-falso",
            prompt: "Com o volume semanal equiparado, aumentar a frequência garante, sozinho, mais hipertrofia.",
            options: [
              { id: "v", label: "Verdadeiro" },
              { id: "f", label: "Falso" },
            ],
            correctAnswer: "f",
            feedback:
              "Igualado o volume, o efeito independente da frequência é pequeno. Ela vale sobretudo por permitir distribuir e tolerar o volume com qualidade.",
          },
          {
            id: "q2",
            type: "conduta",
            prompt: "Aluno com 2 dias disponíveis por semana. Qual organização tende a aproveitar melhor o tempo?",
            options: [
              { id: "a", label: "Corpo todo nas duas sessões." },
              { id: "b", label: "Um dia de peito e braço, outro de perna, cada grupo uma vez." },
            ],
            correctAnswer: "a",
            feedback:
              "Com apenas 2 dias, corpo todo atinge cada grupo duas vezes e distribui melhor o volume do que uma divisão que deixa cada grupo uma vez só.",
          },
        ],
      },
      { title: "Verifique seu entendimento" },
    ),
    bFR(
      "scientific_uncertainty",
      {
        text:
          "Frequências muito altas (por exemplo, todo dia o mesmo grupo) foram menos estudadas em longo prazo, e a melhor distribuição pode variar por grupo muscular e por indivíduo. Use a frequência como variável de ajuste, observando recuperação e adesão.",
      },
      { title: "O que ainda é incerto" },
    ),
    bFR(
      "related_content",
      {
        items: [
          { title: "Intensidade e volume", href: "/aprender/conteudos/forca-intensidade-e-volume", type: "conceito" },
          { title: "Sobrecarga progressiva", href: "/aprender/conteudos/forca-sobrecarga-progressiva", type: "conceito" },
          { title: "Periodização linear e ondulatória", href: "/aprender/conteudos/planejamento-e-periodizacao--linear-ondulatoria", type: "comparacao" },
        ],
      },
      { title: "Revise também" },
    ),
    bFR(
      "references",
      { ids: ["ref-schoenfeld-frequencia-2016", "ref-grgic-frequencia-forca-2018", "ref-diretriz-forca"] },
      { title: "Referências", isOptional: true },
    ),
    bFR(
      "apply_to_prescription",
      {
        summary:
          "Escolha a divisão pela disponibilidade real do aluno, buscando frequência de pelo menos 2 por grupo quando possível. Com poucos dias, prefira corpo todo. A frequência serve para distribuir o volume-alvo com qualidade, não para substituí-lo.",
      },
      { title: "Aplicar no atendimento" },
    ),
  ],
  references: ["ref-schoenfeld-frequencia-2016", "ref-grgic-frequencia-forca-2018"],
  relatedContent: ["forca-intensidade-e-volume", "forca-sobrecarga-progressiva"],
};

/* ========================= AULA 3: SOBRECARGA PROGRESSIVA ========================== */

const bSP = makeB("blk-forca-sp");
const sobrecargaProgressiva: Lesson = {
  id: "l-forca-sobrecarga-progressiva",
  moduleId: "m-forca-progressao",
  disciplineSlug: DISC_SLUG,
  moduleSlug: "progressao-de-carga",
  slug: "forca-sobrecarga-progressiva",
  title: "Sobrecarga progressiva: como avançar sem quebrar",
  subtitle: "Progressão de carga",
  description:
    "O princípio que faz o treino continuar funcionando. Entenda o que progredir, quando e como, para evoluir de forma sustentável.",
  level: "intermediario",
  estimatedMinutes: 13,
  type: "mecanismo",
  status: "nao-iniciado",
  progress: 0,
  reviewedAt: "2026-07-11",
  reviewedBy: "Equipe editorial",
  tags: ["sobrecarga progressiva", "progressão", "dupla progressão", "deload"],
  blocks: [
    bSP("hero", {
      kicker: "Progressão de carga",
      text: "O corpo se adapta ao que é exigido dele. Se a exigência não cresce, a adaptação estaciona. Sobrecarga progressiva é o princípio que mantém o treino desafiando o aluno ao longo do tempo, sem transformar cada semana num salto arriscado.",
    }),
    bSP("prescription_question", {
      question:
        "Seu aluno faz 3 séries de 10 no supino com 40 kg há dois meses, com folga. O que exatamente você progride primeiro: carga, repetições, séries ou outra coisa?",
    }),
    bSP(
      "key_concept",
      {
        term: "Sobrecarga progressiva",
        definition:
          "Aumento gradual e planejado da exigência do treino ao longo do tempo, acompanhado de recuperação suficiente. Sem progressão, o mesmo estímulo deixa de ser desafio e as adaptações se estabilizam.",
      },
      { title: "Conceito-chave" },
    ),
    bSP("figure", { figureId: "supercompensacao" }),
    bSP(
      "mechanism_flow",
      {
        steps: [
          { label: "Estímulo desafia a homeostase", detail: "Uma sessão suficientemente exigente perturba o equilíbrio do organismo." },
          { label: "Recuperação e adaptação", detail: "Com descanso, nutrição e sono adequados, o corpo se reconstrói um pouco mais capaz." },
          { label: "O antigo estímulo fica fácil", detail: "O que antes desafiava agora está dentro da capacidade; deixa de gerar adaptação." },
          { label: "Nova exigência", detail: "Aumentar uma variável (carga, repetições, séries, amplitude, controle) restabelece o desafio." },
          { label: "Ciclo se repete", detail: "A progressão sustentada, semana a semana, é o que mantém o resultado avançando." },
        ],
      },
      { title: "Por que a progressão é necessária" },
    ),
    bSP(
      "short_text",
      {
        variant: "observe",
        items: [
          "Carga: aumentar o peso quando a faixa de repetições é atingida com técnica e esforço adequados.",
          "Repetições: fazer mais repetições com a mesma carga antes de subir o peso.",
          "Séries: acrescentar volume semanal quando a recuperação permite.",
          "Qualidade: melhorar amplitude, controle e proximidade da falha sem mudar carga.",
          "Densidade: reduzir levemente o intervalo, aumentando o trabalho por tempo.",
        ],
      },
      { title: "O que se pode progredir" },
    ),
    bSP(
      "key_concept",
      {
        term: "Dupla progressão",
        definition:
          "Método prático e seguro: dentro de uma faixa de repetições alvo (por exemplo, 8 a 12), o aluno primeiro progride as repetições com a mesma carga até o topo da faixa; ao atingir o topo em todas as séries com boa forma, aumenta a carga e recomeça pela base da faixa.",
      },
      { title: "A ferramenta mais útil no dia a dia" },
    ),
    bSP(
      "timeline",
      {
        items: [
          { time: "Semana 1", title: "Base da faixa", detail: "40 kg, 3 séries de 8. A carga permite chegar a 8 com 1 a 2 repetições em reserva." },
          { time: "Semanas 2 a 3", title: "Progressão de repetições", detail: "Mesma carga, subindo para 3 séries de 10, depois de 12, mantendo a técnica." },
          { time: "Semana 4", title: "Topo da faixa atingido", detail: "3 séries de 12 com boa forma em todas. É o gatilho para aumentar a carga." },
          { time: "Semana 5", title: "Aumento de carga", detail: "42,5 kg, retornando a 3 séries de 8. O ciclo recomeça um degrau acima." },
        ],
      },
      { title: "Dupla progressão na prática, exemplo do supino" },
    ),
    bSP(
      "key_concept",
      {
        term: "Semana de descarga (deload)",
        definition:
          "Período planejado de menor carga ou volume, em geral a cada poucas semanas ou diante de sinais de fadiga acumulada, para permitir recuperação e sustentar a progressão no médio prazo.",
      },
      { title: "Recuar para avançar" },
    ),
    bSP(
      "practical_application",
      {
        text:
          "Responda à pergunta de abertura: com 40 kg e folga grande, o primeiro passo não é necessariamente subir o peso, e sim aproximar o esforço da falha e progredir dentro da faixa por dupla progressão. Progrida uma variável por vez e observe a resposta antes de mudar outra. Quando a progressão trava por semanas, considere uma descarga antes de forçar.",
      },
      { title: "Aplicação à prescrição" },
    ),
    bSP(
      "common_mistake",
      {
        mistake:
          "Aumentar a carga toda semana por hábito, sacrificando a técnica, ou mudar várias variáveis ao mesmo tempo e não saber o que causou a resposta.",
        instead:
          "Progrida uma variável por vez, com critério de avanço claro (por exemplo, topo da faixa atingido com boa forma). Estabilizar antes de subir costuma render mais no médio prazo do que forçar saltos.",
      },
      { title: "Erro frequente" },
    ),
    bSP(
      "professional_case",
      {
        prompt:
          "Aluno intermediário vinha progredindo carga toda semana no agachamento, mas nas últimas duas semanas a barra travou, a técnica piorou e ele relata sono ruim e cansaço. Qual conduta é mais coerente?",
        choices: [
          {
            id: "c1",
            label: "Aplicar uma semana de descarga e depois retomar a progressão pela dupla progressão.",
            tone: "recomendada",
            feedback:
              "Coerente. Sinais de fadiga acumulada e queda de técnica indicam que a recuperação não está acompanhando. Descarregar e retomar de forma estruturada protege a progressão.",
          },
          {
            id: "c2",
            label: "Insistir no aumento de carga para vencer a estagnação.",
            tone: "cautela",
            feedback:
              "Forçar carga sobre fadiga acumulada e técnica em queda aumenta o risco e tende a piorar o desempenho. A estagnação aqui pede recuperação, não mais exigência.",
          },
          {
            id: "c3",
            label: "Manter a carga e focar em repetições e qualidade por algumas semanas.",
            tone: "aceitavel",
            feedback:
              "É uma opção razoável de curto prazo, mas os sinais de fadiga sistêmica (sono, cansaço) sugerem que uma descarga breve pode resolver mais rápido antes de retomar.",
          },
        ],
      },
      { title: "Mini caso" },
    ),
    bSP(
      "quiz",
      {
        questions: [
          {
            id: "q1",
            type: "conduta",
            prompt:
              "Aluno atinge o topo da faixa alvo (12 repetições) em todas as séries, com boa técnica. Pela dupla progressão, o próximo passo é:",
            options: [
              { id: "a", label: "Aumentar a carga e voltar à base da faixa de repetições." },
              { id: "b", label: "Continuar na mesma carga tentando passar de 12." },
            ],
            correctAnswer: "a",
            feedback:
              "Atingir o topo da faixa com boa forma é o gatilho para subir a carga e recomeçar pela base, mantendo o desafio dentro da faixa alvo.",
          },
          {
            id: "q2",
            type: "verdadeiro-falso",
            prompt: "Progredir bem significa aumentar a carga em toda sessão, sem exceção.",
            options: [
              { id: "v", label: "Verdadeiro" },
              { id: "f", label: "Falso" },
            ],
            correctAnswer: "f",
            feedback:
              "Progressão pode ser em repetições, séries, qualidade ou densidade, não só carga. E há momentos de descarga. Forçar carga sempre é insustentável.",
          },
        ],
      },
      { title: "Verifique seu entendimento" },
    ),
    bSP(
      "scientific_uncertainty",
      {
        text:
          "A frequência ideal de descargas e o melhor esquema de progressão variam com nível, idade e contexto, e não há um protocolo único validado para todos. Use os métodos como estrutura e ajuste pela resposta individual.",
      },
      { title: "O que ainda é incerto" },
    ),
    bSP(
      "related_content",
      {
        items: [
          { title: "Repetições em reserva (RIR)", href: "/aprender/conteudos/forca-repeticoes-em-reserva", type: "mecanismo" },
          { title: "Intensidade e volume", href: "/aprender/conteudos/forca-intensidade-e-volume", type: "conceito" },
          { title: "Fadiga e recuperação", href: "/aprender/conteudos/fisiologia-do-exercicio--fadiga-central-periferica", type: "conceito" },
          { title: "Supercompensação", href: "/aprender/conteudos/fisiologia-do-exercicio--supercompensacao", type: "mecanismo" },
        ],
      },
      { title: "Revise também" },
    ),
    bSP(
      "references",
      { ids: ["ref-acsm-progressao-2009", "ref-diretriz-forca"] },
      { title: "Referências", isOptional: true },
    ),
    bSP(
      "apply_to_prescription",
      {
        summary:
          "Use a dupla progressão dentro de uma faixa de repetições alvo: progrida repetições com a mesma carga até o topo, então suba a carga e recomece. Ajuste uma variável por vez, com critério claro, e programe descargas diante de fadiga acumulada.",
      },
      { title: "Aplicar no atendimento" },
    ),
  ],
  references: ["ref-acsm-progressao-2009", "ref-diretriz-forca"],
  relatedContent: ["forca-repeticoes-em-reserva", "forca-intensidade-e-volume"],
};

/* ========================= AULA 4: REPETIÇÕES EM RESERVA =========================== */

const bRIR = makeB("blk-forca-rir");
const repeticoesEmReserva: Lesson = {
  id: "l-forca-repeticoes-em-reserva",
  moduleId: "m-forca-progressao",
  disciplineSlug: DISC_SLUG,
  moduleSlug: "progressao-de-carga",
  slug: "forca-repeticoes-em-reserva",
  title: "Repetições em reserva (RIR): calibrar o esforço",
  subtitle: "Progressão de carga",
  description:
    "Como medir o esforço de uma série sem depender só do 1RM. Entenda a escala de repetições em reserva para autorregular a carga no dia a dia.",
  level: "intermediario",
  estimatedMinutes: 11,
  type: "mecanismo",
  status: "nao-iniciado",
  progress: 0,
  reviewedAt: "2026-07-11",
  reviewedBy: "Equipe editorial",
  tags: ["RIR", "RPE", "autorregulação", "proximidade da falha"],
  blocks: [
    bRIR("hero", {
      kicker: "Progressão de carga",
      text: "A carga certa não é a mesma todo dia. Sono, estresse e fadiga mudam o que o aluno rende. As repetições em reserva permitem calibrar o esforço de cada série pela sensação real, não apenas por um percentual fixo na planilha.",
    }),
    bRIR("prescription_question", {
      question:
        "Você prescreveu 3 séries de 10 a 70% de 1RM. No dia, o aluno dormiu mal e a segunda série já vem muito pesada. Como decidir se mantém, reduz ou encerra, sem chutar?",
    }),
    bRIR(
      "key_concept",
      {
        term: "Repetições em reserva (RIR)",
        definition:
          "Número de repetições que o aluno ainda conseguiria fazer, com boa técnica, ao encerrar a série. Terminar uma série com 2 RIR significa que dariam mais duas repetições. É uma medida direta da proximidade da falha (Helms et al., 2016).",
      },
      { title: "Conceito-chave" },
    ),
    bRIR(
      "chart_explainer",
      {
        title: "RIR e proximidade da falha",
        points: [
          { label: "0 RIR (falha)", value: 100 },
          { label: "1 RIR", value: 92 },
          { label: "2 RIR", value: 85 },
          { label: "3 RIR", value: 78 },
          { label: "4+ RIR", value: 65 },
        ],
        explanation:
          "Quanto menor o RIR, mais perto da falha e, em geral, maior o esforço por série. Para a maior parte do treino de hipertrofia, trabalhar entre 0 e 3 RIR costuma ser suficiente; reservar 1 a 3 RIR na maioria das séries equilibra estímulo e fadiga. Os valores são ilustrativos da relação, não medidas exatas.",
      },
      { title: "Ler o esforço pela reserva" },
    ),
    bRIR(
      "comparison",
      {
        leftTitle: "Carga fixa por percentual",
        rightTitle: "Autorregulação por RIR",
        leftItems: [
          "Simples de escrever na planilha.",
          "Ignora o dia: um percentual pode estar leve ou pesado demais conforme a recuperação.",
          "Depende de um 1RM que muda com o tempo e nem sempre foi testado.",
        ],
        rightItems: [
          "Ajusta a carga do dia à condição real do aluno.",
          "Dispensa testar 1RM com frequência.",
          "Exige alguma experiência para estimar bem a reserva, que melhora com a prática.",
        ],
        note: "As duas abordagens convivem: um bom plano define a faixa de repetições e um alvo de RIR, e a carga do dia é ajustada para bater esse alvo. Autorregular não é treinar sem plano; é cumprir o plano com sensibilidade ao contexto.",
      },
      { title: "Percentual fixo e autorregulação" },
    ),
    bRIR(
      "practical_application",
      {
        text:
          "Voltando ao caso da abertura: com a série vindo muito pesada num dia ruim, reduza um pouco a carga para bater o RIR alvo (por exemplo, encerrar com 2 na reserva) em vez de insistir na carga da planilha ou ir à falha. Prescreva a faixa de repetições e o RIR alvo juntos; a carga é o que se ajusta para caber nos dois.",
      },
      { title: "Aplicação à prescrição" },
    ),
    bRIR(
      "short_text",
      {
        variant: "observe",
        items: [
          "Iniciantes tendem a subestimar o esforço, achando que estão perto da falha quando ainda há várias repetições na reserva; ensine a referência com séries de teste.",
          "Em exercícios livres e arriscados (agachamento, terra), manter alguma reserva protege a técnica e a segurança.",
          "Em máquinas e isoladores seguros, aproximar mais da falha tem menos risco.",
          "A estimativa de RIR fica mais precisa perto da falha (0 a 3) do que longe dela.",
        ],
      },
      { title: "O que observar ao usar RIR" },
    ),
    bRIR(
      "common_mistake",
      {
        mistake:
          "Anotar RIR baixo (perto da falha) mas, na prática, encerrar as séries com folga grande, contando como volume efetivo algo que estimula pouco.",
        instead:
          "Calibre a percepção com séries ocasionais levadas à falha para aprender onde ela fica, e alinhe o RIR planejado com o esforço real. Reserva demais reduz o estímulo; reserva de menos, sempre à falha, acumula fadiga.",
      },
      { title: "Erro frequente" },
    ),
    bRIR(
      "professional_case",
      {
        prompt:
          "Aluno relata que segue o plano à risca, mas 'nunca sente o músculo trabalhar' e não progride. Ao observar, você vê que ele encerra as séries visivelmente longe da falha. Qual conduta é mais coerente?",
        choices: [
          {
            id: "c1",
            label: "Ensinar a referência de esforço com uma série de aproximação da falha e ajustar o alvo para 1 a 2 RIR.",
            tone: "recomendada",
            feedback:
              "Coerente. O aluno provavelmente superestima o esforço. Mostrar onde fica a falha recalibra a percepção e faz as séries passarem a estimular de verdade.",
          },
          {
            id: "c2",
            label: "Aumentar o número de séries para compensar.",
            tone: "cautela",
            feedback:
              "Adicionar séries com o mesmo esforço insuficiente aumenta o total sem aumentar o estímulo efetivo. Ataca o sintoma, não a causa.",
          },
          {
            id: "c3",
            label: "Trocar os exercícios para outros que ele 'sinta mais'.",
            tone: "aceitavel",
            feedback:
              "Pode ajudar a conexão em alguns casos, mas se o problema é esforço insuficiente, ele se repetirá nos novos exercícios. Calibrar o esforço vem primeiro.",
          },
        ],
      },
      { title: "Mini caso" },
    ),
    bRIR(
      "quiz",
      {
        questions: [
          {
            id: "q1",
            type: "variavel",
            prompt: "Encerrar uma série com 2 RIR significa que o aluno:",
            options: [
              { id: "a", label: "Ainda conseguiria fazer cerca de 2 repetições com boa técnica." },
              { id: "b", label: "Fez 2 repetições a menos do que o prescrito." },
            ],
            correctAnswer: "a",
            feedback:
              "RIR é a reserva ao final da série: 2 RIR significa que dariam mais duas repetições antes da falha.",
          },
          {
            id: "q2",
            type: "conduta",
            prompt: "Dia de sono ruim, a carga planejada vem pesada demais e o RIR alvo era 2. O mais coerente é:",
            options: [
              { id: "a", label: "Reduzir um pouco a carga para encerrar a série com o RIR alvo." },
              { id: "b", label: "Manter a carga e levar todas as séries à falha." },
            ],
            correctAnswer: "a",
            feedback:
              "Autorregular pelo RIR ajusta a carga do dia à condição do aluno, preservando o estímulo pretendido sem acumular fadiga desnecessária.",
          },
        ],
      },
      { title: "Verifique seu entendimento" },
    ),
    bRIR(
      "scientific_uncertainty",
      {
        text:
          "A precisão da estimativa de RIR varia entre pessoas e melhora com a experiência; longe da falha ela é menos confiável. Trate o RIR como guia de esforço treinável, não como número exato, e combine com a observação da técnica.",
      },
      { title: "O que ainda é incerto" },
    ),
    bRIR(
      "related_content",
      {
        items: [
          { title: "Sobrecarga progressiva", href: "/aprender/conteudos/forca-sobrecarga-progressiva", type: "conceito" },
          { title: "Intensidade e volume", href: "/aprender/conteudos/forca-intensidade-e-volume", type: "conceito" },
          { title: "Percepção de esforço e carga interna (sRPE)", href: "/aprender/conteudos/controle-de-carga-e-recuperacao--srpe", type: "conceito" },
        ],
      },
      { title: "Revise também" },
    ),
    bRIR(
      "references",
      { ids: ["ref-helms-rir-2016", "ref-borg-pse", "ref-acsm-progressao-2009"] },
      { title: "Referências", isOptional: true },
    ),
    bRIR(
      "apply_to_prescription",
      {
        summary:
          "Prescreva a faixa de repetições junto com um RIR alvo (em geral 1 a 3 na maioria das séries) e ajuste a carga do dia para bater esse alvo. Calibre a percepção do aluno com séries ocasionais próximas da falha e mantenha mais reserva nos exercícios de maior risco.",
      },
      { title: "Aplicar no atendimento" },
    ),
  ],
  references: ["ref-helms-rir-2016", "ref-acsm-progressao-2009"],
  relatedContent: ["forca-sobrecarga-progressiva", "forca-intensidade-e-volume"],
};

/* ================================== MÓDULOS ==================================== */

export const forcaModules: Module[] = [
  {
    id: "m-forca-variaveis",
    disciplineId: DISC_ID,
    slug: "variaveis-do-treino",
    title: "Variáveis do treino",
    description: "As alavancas que você regula em toda prescrição de força.",
    objective: "Manipular intensidade, volume e frequência conforme o objetivo do aluno.",
    order: 1,
    level: "fundamental",
    estimatedMinutes: intensidadeVolume.estimatedMinutes + frequencia.estimatedMinutes,
    lessonCount: 2,
    progress: 0,
    status: "nao-iniciado",
    lessonSlugs: [intensidadeVolume.slug, frequencia.slug],
    applications: ["Definir carga, séries e frequência a partir do objetivo do aluno"],
  },
  {
    id: "m-forca-progressao",
    disciplineId: DISC_ID,
    slug: "progressao-de-carga",
    title: "Progressão de carga",
    description: "Como fazer o treino continuar funcionando ao longo do tempo.",
    objective: "Progredir de forma sustentável e calibrar o esforço sessão a sessão.",
    order: 2,
    level: "intermediario",
    estimatedMinutes: sobrecargaProgressiva.estimatedMinutes + repeticoesEmReserva.estimatedMinutes,
    lessonCount: 2,
    progress: 0,
    status: "nao-iniciado",
    prerequisites: ["m-forca-variaveis"],
    lessonSlugs: [sobrecargaProgressiva.slug, repeticoesEmReserva.slug],
    applications: ["Decidir o que progredir e como calibrar a carga do dia"],
  },
];

export const forcaLessons: Lesson[] = [
  intensidadeVolume,
  frequencia,
  sobrecargaProgressiva,
  repeticoesEmReserva,
];
