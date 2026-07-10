export interface LibEntry {
  id: string;
  termo: string;
  categoria: string;
  resumo: string;
  detalhe: string;
  /** fórmula/expressão do termo, quando ajuda a fixar (glossário técnico) */
  formula?: string;
  /** como o conceito aparece na prática do treino */
  aplicacao?: string;
  /** sinônimos/termos relacionados */
  sinonimos?: string;
  /** slug de exercício relacionado, se houver */
  verExercicio?: string;
}

export const bibliotecaCategorias = [
  "Termos técnicos",
  "Princípios de decisão",
  "Biomecânica",
  "Fisiologia",
  "Segurança",
  "Glossário",
];

export const biblioteca: LibEntry[] = [
  /* --------------------------- TERMOS TÉCNICOS --------------------------- */
  {
    id: "t-torque",
    termo: "Torque (momento de força)",
    categoria: "Termos técnicos",
    resumo: "O efeito de rotação que uma força gera em torno de uma articulação.",
    detalhe:
      "Torque é a tendência de uma força girar um segmento ao redor de um eixo articular. Não depende só de quanta força existe, mas também da distância entre a linha dessa força e o eixo (o braço de momento). Por isso a mesma carga pode exigir muito ou pouco de uma articulação conforme o ângulo e a posição.",
    formula: "Torque (τ) = Força (F) × braço de momento (d)",
    aplicacao:
      "É o que explica por que um exercício fica mais difícil em certos ângulos: onde o braço de momento da resistência é maior, o torque exigido do músculo é maior.",
    sinonimos: "momento de força, momento articular",
  },
  {
    id: "t-braco-momento",
    termo: "Braço de momento (alavanca)",
    categoria: "Termos técnicos",
    resumo: "A distância que transforma força em exigência articular.",
    detalhe:
      "É a distância perpendicular entre a linha de ação de uma força e o eixo da articulação. Quanto maior o braço de momento da resistência, maior o torque que o músculo precisa produzir para vencê-la. Mudar o ângulo, a pegada ou a posição do corpo altera esse braço e, com ele, a demanda.",
    formula: "d = distância perpendicular da linha de força ao eixo articular",
    aplicacao:
      "Inclinar o tronco, afastar os pés ou mudar a pegada reposiciona o braço de momento e redistribui a demanda entre as articulações.",
    sinonimos: "alavanca, braço de alavanca",
  },
  {
    id: "t-vo2max",
    termo: "VO₂máx",
    categoria: "Termos técnicos",
    resumo: "A capacidade máxima de captar, transportar e usar oxigênio no esforço.",
    detalhe:
      "É o volume máximo de oxigênio que o organismo consegue consumir por minuto durante o exercício intenso. Reflete a aptidão cardiorrespiratória e é limitado principalmente pela capacidade do sistema cardiovascular de entregar oxigênio aos músculos. Costuma ser expresso relativo ao peso corporal para comparar pessoas.",
    formula: "Unidade usual: mL de O₂ / kg / min",
    aplicacao:
      "Melhora com treino aeróbio contínuo e intervalado. É uma referência de condicionamento, não um alvo obrigatório para todo aluno.",
    sinonimos: "consumo máximo de oxigênio, potência aeróbia máxima",
  },
  {
    id: "t-fc-treino",
    termo: "FC de treino (frequência cardíaca-alvo)",
    categoria: "Termos técnicos",
    resumo: "A faixa de batimentos que corresponde à intensidade pretendida.",
    detalhe:
      "É a faixa de frequência cardíaca usada para guiar a intensidade do exercício aeróbio. Uma forma comum de estimar é pela frequência cardíaca de reserva (método de Karvonen), que considera a FC de repouso e um percentual da reserva entre repouso e a FC máxima.",
    formula: "Karvonen: FC-alvo = ((FCmáx − FCrepouso) × %intensidade) + FCrepouso",
    aplicacao:
      "Útil quando a FC é confiável. Quando não é (medicação, arritmia), o teste da fala e a percepção de esforço são alternativas práticas.",
    sinonimos: "zona-alvo de FC, FC de reserva",
  },
  {
    id: "t-fc-max",
    termo: "FC máxima",
    categoria: "Termos técnicos",
    resumo: "O maior número de batimentos por minuto atingível no esforço máximo.",
    detalhe:
      "É a frequência cardíaca mais alta que a pessoa alcança em esforço máximo. O ideal é medir em teste; quando não é possível, usam-se equações de estimativa, que trazem margem de erro individual e por isso pedem prudência.",
    formula: "Estimativa (Tanaka): FCmáx ≈ 208 − 0,7 × idade",
    aplicacao:
      "Serve de base para calcular zonas de intensidade. Trate o valor estimado como referência, não como um limite exato.",
    sinonimos: "FCmáx",
  },
  {
    id: "t-pressao-arterial",
    termo: "Pressão arterial",
    categoria: "Termos técnicos",
    resumo: "A força que o sangue exerce sobre a parede das artérias.",
    detalhe:
      "É medida em dois valores: a sistólica (durante a contração do coração) e a diastólica (durante o relaxamento). No exercício, a sistólica tende a subir com o esforço e a diastólica costuma variar pouco. Valores de repouso muito elevados pedem atenção e conduta do profissional de saúde responsável.",
    formula: "Registro: sistólica / diastólica (mmHg), ex.: 120/80",
    aplicacao:
      "Evitar apneia e manobra de Valsalva reduz picos pressóricos. A liberação e os limites em hipertensão seguem o profissional de saúde do aluno.",
    sinonimos: "PA, pressão sistólica/diastólica",
  },
  {
    id: "t-hipertrofia",
    termo: "Hipertrofia",
    categoria: "Termos técnicos",
    resumo: "O aumento do tamanho do músculo pelo crescimento das fibras.",
    detalhe:
      "É o aumento da área de secção transversa do músculo, resultado do crescimento das fibras existentes. Os principais estímulos são a tensão mecânica (carregar o músculo em amplitude adequada) e um volume de treino suficiente, com recuperação e progressão ao longo do tempo.",
    aplicacao:
      "Depende mais do volume com boa carga e da progressão do que de um exercício específico. Séries próximas da fadiga com técnica são o eixo.",
    sinonimos: "aumento de massa muscular",
  },
  {
    id: "t-forca",
    termo: "Força",
    categoria: "Termos técnicos",
    resumo: "A capacidade de gerar tensão para vencer ou resistir a uma resistência.",
    detalhe:
      "É a capacidade do sistema neuromuscular de produzir tensão contra uma carga. Depende de fatores musculares (secção transversa) e neurais (recrutamento e coordenação). Treinos de força costumam usar cargas mais altas e repetições mais baixas do que os de hipertrofia.",
    aplicacao:
      "Ganhos iniciais de força em iniciantes vêm bastante da adaptação neural, antes de mudanças grandes de tamanho muscular.",
  },
  {
    id: "t-potencia",
    termo: "Potência",
    categoria: "Termos técnicos",
    resumo: "Força aplicada com velocidade: trabalho realizado por unidade de tempo.",
    detalhe:
      "Potência combina força e velocidade. Não basta ser forte: é preciso aplicar a força rapidamente. É relevante em saltos, arranques e em tarefas do dia a dia como reagir para não cair.",
    formula: "Potência = Força × velocidade",
    aplicacao:
      "Treina-se com movimentos executados de forma explosiva em cargas que permitam velocidade, respeitando a técnica e o contexto do aluno.",
  },
  {
    id: "t-1rm",
    termo: "1RM (repetição máxima)",
    categoria: "Termos técnicos",
    resumo: "A maior carga que se consegue levantar uma única vez com boa técnica.",
    detalhe:
      "É a carga máxima para uma repetição em um exercício. Serve de referência para prescrever percentuais de intensidade. Pode ser medida diretamente (com cautela) ou estimada a partir de uma série submáxima.",
    formula: "Estimativa (Epley): 1RM ≈ carga × (1 + repetições / 30)",
    aplicacao:
      "Prescrever a % de 1RM ajuda a padronizar a intensidade. Em iniciantes, estimar por repetições costuma ser mais seguro que testar o máximo.",
    sinonimos: "carga máxima, RM",
  },
  {
    id: "t-pse",
    termo: "PSE (percepção subjetiva de esforço)",
    categoria: "Termos técnicos",
    resumo: "O quanto o aluno sente que está se esforçando, numa escala.",
    detalhe:
      "É uma escala em que a pessoa classifica o próprio esforço (por exemplo, de 0 a 10 na escala CR-10 de Borg). É simples, barata e se correlaciona com a intensidade real, sendo útil quando a frequência cardíaca não é confiável.",
    formula: "Escala CR-10 de Borg: 0 (repouso) a 10 (esforço máximo)",
    aplicacao:
      "Combinada com o tempo de sessão, gera a carga interna (sRPE = PSE × minutos), útil para monitorar o volume ao longo das semanas.",
    sinonimos: "RPE, escala de Borg",
  },
  {
    id: "t-insuficiencia-ativa",
    termo: "Insuficiência ativa",
    categoria: "Termos técnicos",
    resumo: "Quando um músculo biarticular perde força por estar muito encurtado.",
    detalhe:
      "Ocorre quando um músculo que cruza duas articulações se encurta ao máximo nas duas ao mesmo tempo e, por isso, não consegue gerar tensão eficiente. Um exemplo é a flexão de joelho com o quadril já estendido, que reduz a força dos isquiotibiais.",
    aplicacao:
      "Explica por que certas posições enfraquecem um movimento; ajustar o ângulo de uma articulação pode devolver força à tarefa.",
  },
  {
    id: "t-insuficiencia-passiva",
    termo: "Insuficiência passiva",
    categoria: "Termos técnicos",
    resumo: "Quando um músculo biarticular limita a amplitude por estar muito alongado.",
    detalhe:
      "É o oposto da ativa: um músculo biarticular alongado ao máximo nas duas articulações restringe a amplitude do movimento por tensão passiva. Um exemplo é a dificuldade de flexionar totalmente o quadril com o joelho estendido, pela tensão dos isquiotibiais.",
    aplicacao:
      "Ajuda a entender limites de amplitude que não são fraqueza nem lesão, mas tensão passiva de um músculo que cruza duas articulações.",
  },
  {
    id: "t-cadeia-cinetica",
    termo: "Cadeia cinética (aberta e fechada)",
    categoria: "Termos técnicos",
    resumo: "Se a extremidade que se move está livre ou apoiada muda o exercício.",
    detalhe:
      "Na cadeia cinética fechada, o segmento distal está apoiado (como os pés no chão no agachamento) e as articulações se movem de forma interdependente. Na aberta, a extremidade está livre (como a perna na cadeira extensora). Cada uma distribui a demanda de forma diferente.",
    aplicacao:
      "Cadeia fechada tende a distribuir a carga entre várias articulações; aberta permite isolar mais um movimento. A escolha depende do objetivo e da tolerância.",
    verExercicio: "cadeira-extensora",
  },
  {
    id: "t-sobrecarga-progressiva",
    termo: "Sobrecarga progressiva",
    categoria: "Termos técnicos",
    resumo: "Aumentar a exigência ao longo do tempo para o corpo continuar adaptando.",
    detalhe:
      "É o princípio de que, para continuar evoluindo, o estímulo precisa aumentar gradualmente, respeitando a recuperação. Pode-se progredir por carga, repetições, séries, amplitude, cadência ou redução de intervalo, conforme o objetivo.",
    aplicacao:
      "Progrida uma variável por vez e observe a resposta. Progressão abrupta troca resultado por risco de dor e abandono.",
  },
  {
    id: "t-volume",
    termo: "Volume de treino",
    categoria: "Termos técnicos",
    resumo: "A quantidade total de trabalho realizado no treino.",
    detalhe:
      "É a quantidade total de trabalho, geralmente estimada por séries por grupo muscular na semana ou por séries × repetições × carga. O volume é um dos principais motores da hipertrofia, dentro do que a pessoa consegue recuperar.",
    formula: "Estimativa: séries × repetições × carga (ou séries semanais por grupo)",
    aplicacao:
      "Aumentar volume ajuda até o ponto em que a recuperação acompanha. Volume demais sem recuperação vira fadiga, não resultado.",
  },
  {
    id: "t-adm",
    termo: "Amplitude de movimento (ADM)",
    categoria: "Termos técnicos",
    resumo: "O quanto uma articulação se move em uma tarefa.",
    detalhe:
      "É a faixa de movimento percorrida por uma articulação. A amplitude útil é a que entrega o estímulo desejado com tolerância adequada. Reduzir amplitude é uma adaptação legítima quando serve a um objetivo, não uma falha de execução.",
    aplicacao:
      "Trabalhar em amplitude confortável e progredir conforme a tolerância costuma render mais do que forçar amplitude com dor.",
  },
  {
    id: "t-fc-recuperacao",
    termo: "Frequência cardíaca de recuperação",
    categoria: "Termos técnicos",
    resumo: "O quanto a FC cai logo após o fim do esforço.",
    detalhe:
      "É a queda da frequência cardíaca no primeiro ou nos dois primeiros minutos após interromper o exercício. Uma recuperação mais rápida costuma acompanhar melhor condicionamento e boa regulação autonômica.",
    aplicacao:
      "Acompanhar essa queda ao longo das semanas dá uma pista simples da evolução do condicionamento aeróbio.",
  },

  {
    id: "b1",
    termo: "Objetivo orienta a escolha",
    categoria: "Princípios de decisão",
    resumo: "A meta do aluno é o primeiro filtro de seleção do exercício.",
    detalhe:
      "Antes de escolher entre variações, defina o objetivo (hipertrofia, força, resistência, retorno, aprendizado). Ele orienta a direção do movimento, a faixa de esforço e o quanto a técnica pesa. Em geral, meio (exercício) deve servir ao fim (objetivo), não o contrário.",
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
      "De nada adianta a variação 'ideal' se o equipamento não existe na sala. Considere o disponível e escolha a melhor opção viável: às vezes a segunda melhor executável supera a primeira inacessível.",
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
      "Trabalhar dentro de amplitudes sem dor, progredindo gradualmente e monitorando a resposta, em geral respeita o estágio do retorno. A resposta do tecido guia, não o calendário.",
  },
  {
    id: "b11",
    termo: "Anti-movimento (core)",
    categoria: "Biomecânica",
    resumo: "Resistir ao movimento costuma treinar o core melhor que flexioná-lo.",
    detalhe:
      "Padrões de estabilização e anti-rotação treinam a função do core de resistir a forças, em geral mais transferível ao esporte do que grandes volumes de flexão repetida de coluna.",
  },
  {
    id: "b12",
    termo: "Linguagem prudente",
    categoria: "Glossário",
    resumo: "'Tende a', 'em geral', 'depende do contexto': por quê.",
    detalhe:
      "Respostas em ciências do exercício dependem do indivíduo e da execução. A linguagem prudente comunica tendência, não certeza absoluta, e reforça que o conteúdo é educacional: não substitui avaliação profissional individualizada.",
  },
];
