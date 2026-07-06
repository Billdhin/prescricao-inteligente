export interface LibEntry {
  id: string;
  termo: string;
  categoria: string;
  resumo: string;
  detalhe: string;
  /** slug de exercício relacionado, se houver */
  verExercicio?: string;
}

export const bibliotecaCategorias = [
  "Princípios de decisão",
  "Biomecânica",
  "Fisiologia",
  "Segurança",
  "Glossário",
];

export const biblioteca: LibEntry[] = [
  {
    id: "b1",
    termo: "Objetivo orienta a escolha",
    categoria: "Princípios de decisão",
    resumo: "A meta do aluno é o primeiro filtro de seleção do exercício.",
    detalhe:
      "Antes de escolher entre variações, defina o objetivo (hipertrofia, força, resistência, retorno, aprendizado). Ele orienta a direção do movimento, a faixa de esforço e o quanto a técnica pesa. Em geral, meio (exercício) deve servir ao fim (objetivo) — não o contrário.",
  },
  {
    id: "b2",
    termo: "Adequação ao nível técnico",
    categoria: "Princípios de decisão",
    resumo: "O melhor exercício também é o que a pessoa consegue executar bem hoje.",
    detalhe:
      "Um padrão avançado mal executado tende a render menos e a expor mais do que uma variação simples bem feita. Ajuste a complexidade ao nível atual e progrida conforme o controle melhora.",
  },
  {
    id: "b3",
    termo: "Equipamento na decisão",
    categoria: "Princípios de decisão",
    resumo: "A melhor recomendação precisa ser executável com o que há disponível.",
    detalhe:
      "De nada adianta a variação 'ideal' se o equipamento não existe na sala. Considere o disponível e escolha a melhor opção viável — às vezes a segunda melhor executável supera a primeira inacessível.",
  },
  {
    id: "b4",
    termo: "Dobradiça de quadril",
    categoria: "Biomecânica",
    resumo: "Movimento que vem do quadril indo para trás, com coluna neutra.",
    detalhe:
      "A dissociação entre quadril e coluna permite trabalhar a cadeia posterior reduzindo a carga passiva na lombar. É a base de exercícios como o levantamento terra romeno (stiff).",
    verExercicio: "levantamento-terra-romeno",
  },
  {
    id: "b5",
    termo: "Valgo dinâmico do joelho",
    categoria: "Biomecânica",
    resumo: "Colapso do joelho para dentro sob carga.",
    detalhe:
      "Quando o joelho foge da linha do pé em direção medial, aumenta o estresse em estruturas mediais. Em geral, treinar o controle (joelho acompanhando o pé) tende a reduzir desconforto relatado.",
    verExercicio: "afundo-passada",
  },
  {
    id: "b6",
    termo: "Controle escapular",
    categoria: "Biomecânica",
    resumo: "Estabilizar as escápulas dá base segura para empurrar e puxar.",
    detalhe:
      "Retração e depressão escapular ('encaixe') criam uma base estável no supino e melhoram o recrutamento nas puxadas. É um pré-requisito de segurança para o ombro.",
    verExercicio: "supino-reto-barra",
  },
  {
    id: "b7",
    termo: "Ativação vs. eficiência",
    categoria: "Fisiologia",
    resumo: "Recrutar muito um músculo não é o único critério de um bom exercício.",
    detalhe:
      "Alta ativação de um alvo é desejável, mas eficiência considera também demanda articular, complexidade e transferência. Um índice combina esses fatores para orientar a decisão.",
  },
  {
    id: "b8",
    termo: "Tempo sob tensão",
    categoria: "Fisiologia",
    resumo: "A cadência influencia o estímulo, não só a carga.",
    detalhe:
      "Controlar a fase excêntrica aumenta o tempo sob tensão e, em geral, favorece o aprendizado técnico e o estímulo de hipertrofia com cargas mais conservadoras.",
  },
  {
    id: "b9",
    termo: "Demanda lombar",
    categoria: "Segurança",
    resumo: "Quanto o exercício exige da coluna lombar sob carga.",
    detalhe:
      "Exercícios com alta demanda lombar pedem mais controle e podem não ser a primeira escolha em contextos de dor. Variações guiadas tendem a reduzir essa demanda.",
    verExercicio: "leg-press-45",
  },
  {
    id: "b10",
    termo: "Amplitude indolor",
    categoria: "Segurança",
    resumo: "No retorno pós-lesão, a amplitude tolerável guia a progressão.",
    detalhe:
      "Trabalhar dentro de amplitudes sem dor, progredindo gradualmente e monitorando a resposta, em geral respeita o estágio do retorno. A resposta do tecido guia — não o calendário.",
  },
  {
    id: "b11",
    termo: "Anti-movimento (core)",
    categoria: "Biomecânica",
    resumo: "Resistir ao movimento costuma treinar o core melhor que flexioná-lo.",
    detalhe:
      "Padrões de estabilização e anti-rotação treinam a função do core de resistir a forças — em geral mais transferível ao esporte do que grandes volumes de flexão repetida de coluna.",
  },
  {
    id: "b12",
    termo: "Linguagem prudente",
    categoria: "Glossário",
    resumo: "'Tende a', 'em geral', 'depende do contexto' — por quê.",
    detalhe:
      "Respostas em ciências do exercício dependem do indivíduo e da execução. A linguagem prudente comunica tendência, não certeza absoluta, e reforça que o conteúdo é educacional — não substitui avaliação profissional individualizada.",
  },
];
