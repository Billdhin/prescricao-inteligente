import type { PracticeCase } from "./types";

export const cases: PracticeCase[] = [
  {
    id: "c1",
    slug: "caso-lombar-iniciante",
    titulo: "Aluna iniciante com histórico de dor lombar",
    tema: "Coluna e core",
    dificuldade: "Iniciante",
    premium: false,
    contexto:
      "Mariana, 34 anos, sedentária há 2 anos. Primeira semana de treino. Refere insegurança com barra livre. Sala equipada com máquinas, halteres e polias.",
    pergunta: "Qual escolha inicial para membros inferiores tende a ser mais prudente?",
    melhorOpcaoId: "b",
    trustLevel: "cuidado de segurança",
    opcoes: [
      {
        id: "a",
        texto: "Agachamento livre com barra desde a primeira sessão",
        correta: false,
        analise:
          "O agachamento livre é tecnicamente exigente e impõe demanda relevante sobre a coluna; introduzi-lo já na primeira semana, com insegurança relatada, tende a ser precoce.",
        criterio: "Ignora a adequação ao nível técnico e o histórico de dor lombar.",
        lembrar:
          "Padrões complexos costumam render mais depois que a base de controle e confiança está construída.",
      },
      {
        id: "b",
        texto: "Leg press 45° com amplitude confortável e cadência controlada",
        correta: true,
        analise:
          "O leg press guia a trajetória e, em geral, reduz a demanda lombar, permitindo aprender o padrão de agachar com menor custo técnico, o que é coerente com o nível e o histórico dela.",
        criterio: "Considera nível iniciante, insegurança e histórico lombar.",
        lembrar:
          "Começar por uma variação guiada não é 'menos': é construir base para progredir com segurança.",
      },
      {
        id: "c",
        texto: "Stiff com barra para fortalecer a lombar rapidamente",
        correta: false,
        analise:
          "O stiff exige boa dobradiça de quadril e controle de coluna sob carga; para uma iniciante com histórico lombar, tende a expor a região antes da hora.",
        criterio: "Ignora o pré-requisito técnico e o contexto de dor.",
        lembrar:
          "Fortalecer a cadeia posterior é útil, mas a escolha do exercício depende do preparo atual.",
      },
    ],
  },
  {
    id: "c2",
    slug: "caso-ombro-supino",
    titulo: "Ombro sensível pedindo peito",
    tema: "Ombro",
    dificuldade: "Intermediário",
    premium: false,
    contexto:
      "Diego, 41 anos, treina há 3 anos. Quer manter treino de peito. Já executa supino reto com barra há meses, mas relata desconforto pontual na descida.",
    pergunta: "Como ajustar o treino de peito respeitando o ombro?",
    melhorOpcaoId: "c",
    trustLevel: "tendência prática",
    opcoes: [
      {
        id: "a",
        texto: "Manter o supino reto com barra e aumentar a carga para 'fortalecer' o ombro",
        correta: false,
        analise:
          "Aumentar carga sobre um desconforto existente tende a agravar o quadro; a barra também fixa a trajetória, limitando o ajuste fino da amplitude.",
        criterio: "Ignora o sinal de desconforto e a liberdade articular necessária.",
        lembrar: "Dor não é sinal para adicionar carga: é sinal para investigar e ajustar.",
      },
      {
        id: "b",
        texto: "Suspender qualquer exercício de peito por tempo indeterminado",
        correta: false,
        analise:
          "Interromper tudo pode ser conservador demais quando há alternativas que respeitam a amplitude tolerável; nem sempre é necessário zerar o estímulo.",
        criterio: "Ignora que existe caminho intermediário entre 'forçar' e 'parar'.",
        lembrar: "Adaptar costuma ser mais sustentável do que simplesmente remover.",
      },
      {
        id: "c",
        texto: "Trocar para supino com halteres e ajustar amplitude ao conforto do ombro",
        correta: true,
        analise:
          "Os halteres dão liberdade articular e permitem regular a amplitude à tolerância do ombro, em geral mantendo o estímulo no peitoral com menor incômodo.",
        criterio: "Considera a liberdade de trajetória e a amplitude individual.",
        lembrar:
          "Quando a barra incomoda, variações com halteres costumam permitir treinar dentro do conforto.",
      },
    ],
  },
  {
    id: "c3",
    slug: "caso-idoso-forca",
    titulo: "Idoso ativo buscando força funcional",
    tema: "Idoso ativo",
    dificuldade: "Iniciante",
    premium: false,
    contexto:
      "Sr. Antônio, 68 anos, sem doenças de base relevantes. Treina 2x por semana. Já tolera bem exercícios em máquina e quer 'ter mais firmeza' no dia a dia.",
    pergunta: "Qual direção de prescrição tende a favorecer a funcionalidade?",
    melhorOpcaoId: "b",
    trustLevel: "regra pedagógica",
    opcoes: [
      {
        id: "a",
        texto: "Somente exercícios isolados em máquina, sem padrões multiarticulares",
        correta: false,
        analise:
          "Máquinas são úteis e seguras, mas restringir-se a isolados tende a limitar a transferência para tarefas do dia a dia, que envolvem padrões integrados.",
        criterio: "Ignora o objetivo de funcionalidade (transferência para a vida diária).",
        lembrar: "O objetivo do aluno orienta a seleção: funcionalidade pede padrões integrados.",
      },
      {
        id: "b",
        texto:
          "Introduzir padrões funcionais progressivos (ex.: sentar-levantar assistido, leg press) além de isolados",
        correta: true,
        analise:
          "Combinar padrões multiarticulares progressivos com isolados, respeitando a boa tolerância dele, em geral favorece força aplicável ao cotidiano.",
        criterio: "Alinha meio (exercícios) ao fim (funcionalidade) e ao nível dele.",
        lembrar: "Progressão funcional pode e deve começar simples: o importante é a direção.",
      },
      {
        id: "c",
        texto: "Priorizar cargas máximas para ganhar força o mais rápido possível",
        correta: false,
        analise:
          "Buscar cargas máximas de imediato tende a ser imprudente para um iniciante nesse contexto; a prioridade costuma ser padrão, controle e consistência.",
        criterio: "Ignora a progressão adequada e o perfil de risco.",
        lembrar: "Velocidade de progressão deve respeitar o preparo: pressa costuma custar caro.",
      },
    ],
  },
  {
    id: "c4",
    slug: "caso-hipertrofia-costas",
    titulo: "Hipertrofia de costas: puxada vs remada",
    tema: "Progressão de carga",
    dificuldade: "Intermediário",
    premium: true,
    contexto:
      "Rafaela, 27 anos, intermediária. Já domina remada baixa e puxada alta. Treino de 60 min com máquinas, barra, halteres e polias. Quer costas mais completas.",
    pergunta: "Como estruturar o estímulo para costas mais completas?",
    melhorOpcaoId: "c",
    trustLevel: "princípio biomecânico",
    opcoes: [
      {
        id: "a",
        texto: "Fazer só puxadas verticais, pois 'costas é dorsal'",
        correta: false,
        analise:
          "Puxadas verticais enfatizam a largura, mas negligenciar o puxar horizontal tende a deixar a espessura (região média) subestimulada.",
        criterio: "Ignora que direções diferentes de puxada estimulam regiões distintas.",
        lembrar: "Costas 'completas' pedem tanto puxar vertical quanto horizontal.",
      },
      {
        id: "b",
        texto: "Repetir o mesmo exercício de sempre com muito mais carga",
        correta: false,
        analise:
          "Só aumentar carga no mesmo padrão tende a ignorar o princípio da variação de estímulo e a lacuna de espessura que ela quer preencher.",
        criterio: "Ignora a especificidade do objetivo (regiões distintas das costas).",
        lembrar: "Mais carga nem sempre é mais resultado: a seleção do padrão importa.",
      },
      {
        id: "c",
        texto:
          "Combinar puxar vertical (largura) e puxar horizontal (espessura), progredindo carga com técnica",
        correta: true,
        analise:
          "Cobrir as duas direções de puxada, com progressão de carga preservando a técnica, em geral estimula largura e espessura de forma mais completa.",
        criterio: "Alinha a seleção de exercícios à especificidade do objetivo.",
        lembrar: "Pense em direções de movimento, não apenas em 'mais um exercício de costas'.",
      },
    ],
  },
  {
    id: "c5",
    slug: "caso-retorno-joelho",
    titulo: "Retorno pós-cirurgia de menisco",
    tema: "Retorno pós-lesão",
    dificuldade: "Avançado",
    premium: true,
    contexto:
      "Camila, 30 anos, corredora amadora. Fisioterapia concluída. Médico liberou fortalecimento progressivo respeitando amplitude. Sem dor em atividades diárias.",
    pergunta: "Como conduzir o fortalecimento de forma prudente?",
    melhorOpcaoId: "b",
    trustLevel: "cuidado de segurança",
    opcoes: [
      {
        id: "a",
        texto: "Retomar direto agachamento profundo com carga alta, já que 'está liberada'",
        correta: false,
        analise:
          "Liberação para fortalecimento progressivo não é sinônimo de carga máxima e amplitude total imediatas; pular etapas tende a ser arriscado no retorno.",
        criterio: "Ignora a progressão de amplitude e carga recomendada.",
        lembrar: "'Liberado' define um ponto de partida, não um atalho para o pico.",
      },
      {
        id: "b",
        texto:
          "Iniciar com amplitudes indolores e progressão gradual (ex.: leg press/cadeira extensora controlados), monitorando resposta",
        correta: true,
        analise:
          "Trabalhar dentro de amplitudes indolores, progredindo gradualmente e observando a resposta do joelho, em geral respeita a orientação médica e o estágio do retorno.",
        criterio: "Considera amplitude tolerável, progressão e monitoramento.",
        lembrar: "No retorno, a resposta do tecido guia a progressão, não o calendário nem o ego.",
      },
      {
        id: "c",
        texto: "Evitar qualquer exercício de perna por mais alguns meses por precaução",
        correta: false,
        analise:
          "Com liberação médica e ausência de dor, evitar todo estímulo tende a ser conservador demais e pode atrasar a readaptação de força.",
        criterio: "Ignora que o estímulo progressivo faz parte do retorno.",
        lembrar: "Cautela excessiva também tem custo: o meio-termo progressivo costuma ser melhor.",
      },
    ],
  },
  {
    id: "c6",
    slug: "caso-core-lombar-atleta",
    titulo: "Core para atleta com histórico lombar",
    tema: "Coluna e core",
    dificuldade: "Avançado",
    premium: true,
    contexto:
      "Bruno, 29 anos, jogador de futebol amador. Já treina há anos; sala completa disponível; sem quadro agudo, mas relata episódios antigos de lombalgia sob fadiga.",
    pergunta: "Que abordagem de core tende a ser mais adequada ao contexto dele?",
    melhorOpcaoId: "a",
    trustLevel: "tendência prática",
    opcoes: [
      {
        id: "a",
        texto:
          "Priorizar exercícios de estabilização e anti-movimento (ex.: prancha, anti-rotação), progredindo a demanda",
        correta: true,
        analise:
          "Para um histórico de lombalgia sob fadiga, treinar a capacidade de resistir a movimento (estabilização/anti-rotação) em geral favorece o controle sob demanda esportiva.",
        criterio: "Considera o histórico lombar e a função do core no esporte.",
        lembrar: "Core costuma render mais como 'estabilizador' do que como 'flexionador' repetitivo.",
      },
      {
        id: "b",
        texto: "Grandes volumes de abdominal com flexão repetida de coluna",
        correta: false,
        analise:
          "Volumes altos de flexão repetida de coluna tendem a não ser a melhor escolha para quem tem histórico de lombalgia, especialmente sob fadiga.",
        criterio: "Ignora o histórico e o tipo de demanda que o core cumpre no esporte.",
        lembrar: "Repetir flexão de coluna não é sinônimo de 'core forte'.",
      },
      {
        id: "c",
        texto: "Ignorar o core e focar apenas em força de membros",
        correta: false,
        analise:
          "Negligenciar o core tende a deixar uma lacuna importante para quem depende de estabilidade sob fadiga em campo.",
        criterio: "Ignora a demanda específica do esporte e o histórico.",
        lembrar: "Lacunas de estabilidade costumam aparecer justamente quando a fadiga chega.",
      },
    ],
  },

  /* --------------------------- Grupos especiais --------------------------- */
  {
    id: "c7",
    slug: "caso-obesidade-grave-inicio",
    titulo: "Obesidade grave querendo emagrecer",
    tema: "Grupos especiais",
    dificuldade: "Iniciante",
    premium: false,
    contexto:
      "Aluno com obesidade grave, iniciante, relata dor no joelho ao caminhar por mais de 8 minutos, quer emagrecer e tem baixa autoconfiança. Não há como medir a frequência cardíaca com precisão.",
    pergunta: "Qual seria a estratégia inicial mais prudente?",
    melhorOpcaoId: "b",
    trustLevel: "cuidado de segurança",
    opcoes: [
      {
        id: "a",
        texto: "Caminhada de 30 min em ritmo forte para acelerar a perda de peso",
        correta: false,
        analise:
          "Impacto e volume altos logo no início tendem a agravar a dor no joelho e a minar a adesão de quem já tem baixa autoconfiança.",
        criterio: "Ignora a tolerância ao impacto, a dor articular e o risco de abandono.",
        lembrar: "Nas fases iniciais, completar a sessão e voltar costuma valer mais que intensidade.",
      },
      {
        id: "b",
        texto: "Começar com baixo impacto (hidroginástica ou bike), sessões curtas, esforço leve por PSE/teste da fala",
        correta: true,
        analise:
          "Baixo impacto reduz a sobrecarga do joelho e a dispneia; sessões curtas e frequentes favorecem a adesão. Sem FC confiável, PSE e teste da fala guiam bem a intensidade.",
        criterio: "Considera dor articular, baixa tolerância, adesão e parâmetros viáveis.",
        lembrar: "Quando a FC não é confiável, parâmetros perceptivos apoiam a decisão de forma prudente.",
      },
      {
        id: "c",
        texto: "Só musculação pesada, evitando qualquer aeróbio",
        correta: false,
        analise:
          "Força é importante, mas abrir mão do componente aeróbio de baixo impacto tende a deixar uma lacuna relevante para este objetivo e perfil.",
        criterio: "Ignora a combinação de estímulos e a construção gradual de capacidade.",
        lembrar: "Força e aeróbio de baixo impacto costumam se complementar nas fases iniciais.",
      },
    ],
  },
  {
    id: "c8",
    slug: "caso-hipertensao-monitoramento",
    titulo: "Hipertenso e o monitoramento na força",
    tema: "Grupos especiais",
    dificuldade: "Intermediário",
    premium: true,
    contexto:
      "Aluno com hipertensão em uso de medicação que altera a resposta de frequência cardíaca. Quer treinar força. Você tem PSE e teste da fala disponíveis; FC pouco confiável.",
    pergunta: "Como conduzir e monitorar de forma mais prudente?",
    melhorOpcaoId: "a",
    trustLevel: "tendência prática",
    opcoes: [
      {
        id: "a",
        texto: "Força em máquinas com respiração contínua (sem apneia) e intensidade guiada por PSE",
        correta: true,
        analise:
          "Evitar a manobra de Valsalva reduz picos de esforço; com FC pouco confiável sob medicação, a PSE tende a ser um guia mais prático de intensidade.",
        criterio: "Considera a apneia como risco e a limitação da FC neste contexto.",
        lembrar: "Sob certas medicações, a FC perde valor como guia: parâmetros perceptivos ajudam.",
      },
      {
        id: "b",
        texto: "Guiar tudo pela frequência cardíaca-alvo calculada por fórmula",
        correta: false,
        analise:
          "A resposta de FC pode estar alterada pela medicação, tornando a meta calculada pouco confiável para dosar o esforço.",
        criterio: "Ignora o efeito da medicação sobre a FC.",
        lembrar: "Fórmulas de FC são estimativas: o contexto do aluno pode invalidá-las.",
      },
      {
        id: "c",
        texto: "Permitir séries até a falha com apneia para maximizar força",
        correta: false,
        analise:
          "A apneia (Valsalva) tende a gerar picos de esforço pouco prudentes neste perfil.",
        criterio: "Ignora a cautela com a respiração em hipertensos.",
        lembrar: "Respiração contínua é um cuidado simples e relevante na força.",
      },
    ],
  },
  {
    id: "c9",
    slug: "caso-idoso-progressao",
    titulo: "Idoso destreinado: por onde começar",
    tema: "Grupos especiais",
    dificuldade: "Intermediário",
    premium: true,
    contexto:
      "Idoso destreinado, com receio de cair, quer 'ficar mais firme'. Boa disposição, sem dor relevante. Sala com máquinas e espaço para equilíbrio com apoio.",
    pergunta: "Qual prioridade inicial tende a ser mais adequada?",
    melhorOpcaoId: "c",
    trustLevel: "regra pedagógica",
    opcoes: [
      {
        id: "a",
        texto: "Somente caminhada, por ser mais segura",
        correta: false,
        analise:
          "Caminhada ajuda a aptidão, mas isoladamente tende a não resolver a perda de força e o risco de queda deste perfil.",
        criterio: "Ignora a centralidade da força e do equilíbrio para autonomia.",
        lembrar: "Em idosos, força e equilíbrio costumam ser prioridade tão ou mais que o aeróbio.",
      },
      {
        id: "b",
        texto: "Exercícios instáveis avançados para desafiar o equilíbrio desde o início",
        correta: false,
        analise:
          "Desafios de equilíbrio sem base e sem apoio tendem a aumentar o risco de queda no início.",
        criterio: "Ignora a progressão segura do equilíbrio.",
        lembrar: "Equilíbrio também se progride: começa com apoio e evolui gradualmente.",
      },
      {
        id: "c",
        texto: "Força em máquinas guiadas + equilíbrio com apoio, progressão lenta",
        correta: true,
        analise:
          "Força guiada e equilíbrio com apoio constroem a base de função e reduzem o risco de queda, respeitando a recuperação mais lenta.",
        criterio: "Considera segurança, função e prevenção de quedas.",
        lembrar: "Base de força e equilíbrio primeiro; desafios maiores vêm depois.",
      },
    ],
  },
  {
    id: "c10",
    slug: "caso-osteoartrite-modalidade",
    titulo: "Dor no joelho e a escolha de modalidade",
    tema: "Grupos especiais",
    dificuldade: "Intermediário",
    premium: true,
    contexto:
      "Aluno com osteoartrite de joelho sente dor ao caminhar mais que alguns minutos, mas quer melhorar condicionamento e função. Sala com máquinas, bike e acesso à piscina.",
    pergunta: "Qual combinação inicial tende a ser mais prudente?",
    melhorOpcaoId: "b",
    trustLevel: "cuidado de segurança",
    opcoes: [
      {
        id: "a",
        texto: "Insistir na caminhada, empurrando a dor para 'condicionar'",
        correta: false,
        analise:
          "Insistir no impacto doloroso tende a gerar edema e piora funcional, além de minar a adesão.",
        criterio: "Ignora a intolerância ao impacto e a dor como guia.",
        lembrar: "Dor crescente e edema pós-sessão são sinais para ajustar, não para insistir.",
      },
      {
        id: "b",
        texto: "Força de membros inferiores em amplitude confortável + aeróbio de baixo impacto (bike/água)",
        correta: true,
        analise:
          "Fortalecer o suporte do joelho com baixo impacto costuma melhorar função e reduzir dor, mantendo o condicionamento por bike ou água.",
        criterio: "Considera baixo impacto, força de suporte e dor tolerável.",
        lembrar: "Baixo impacto + força de MMII em amplitude confortável é uma base prudente.",
      },
      {
        id: "c",
        texto: "Evitar totalmente qualquer exercício de joelho para 'não piorar'",
        correta: false,
        analise:
          "Evitar todo estímulo tende a enfraquecer o suporte do joelho e piorar a função a médio prazo.",
        criterio: "Ignora o papel da força na proteção articular.",
        lembrar: "Fugir do movimento costuma piorar a função; a chave é dosar, não evitar.",
      },
    ],
  },
];

export function getCase(slug: string) {
  return cases.find((c) => c.slug === slug);
}
