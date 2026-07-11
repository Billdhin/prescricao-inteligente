export interface LibEntry {
  id: string;
  termo: string;
  categoria: string;
  /** definição clássica, curta e correta, no estilo de dicionário técnico/livro-texto */
  definicao: string;
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
    definicao: "A tendência de uma força produzir rotação de um corpo em torno de um eixo.",
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
    definicao:
      "A distância perpendicular entre a linha de ação de uma força e o eixo de rotação.",
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
    definicao:
      "O volume máximo de oxigênio que o organismo consegue captar, transportar e utilizar por unidade de tempo durante o exercício máximo.",
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
    definicao:
      "A faixa de frequência cardíaca que corresponde à intensidade pretendida para o exercício.",
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
    definicao: "O maior número de batimentos cardíacos por minuto atingível em esforço máximo.",
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
    definicao: "A força que o sangue exerce sobre as paredes das artérias.",
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
    definicao: "O aumento do volume de um músculo por crescimento da área de secção transversa de suas fibras.",
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
    definicao:
      "A capacidade do sistema neuromuscular de produzir tensão contra uma resistência. Em física, a grandeza que altera o estado de movimento de um corpo (F = massa × aceleração).",
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
    definicao: "A quantidade de trabalho realizado por unidade de tempo (ou a força multiplicada pela velocidade).",
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
    definicao: "A maior carga que se consegue mover uma única vez com técnica adequada em um dado exercício.",
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
    definicao:
      "A avaliação subjetiva da intensidade do esforço percebido durante o exercício, expressa em uma escala numérica.",
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
    definicao:
      "A perda de capacidade de gerar tensão de um músculo biarticular quando ele se encurta ao máximo nas duas articulações que cruza.",
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
    definicao:
      "A limitação da amplitude de movimento causada pela tensão passiva de um músculo biarticular alongado ao máximo nas duas articulações que cruza.",
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
    definicao:
      "O conjunto de segmentos corporais ligados por articulações que atuam de forma interdependente; é fechada quando o segmento distal está fixo e aberta quando está livre.",
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
    definicao:
      "O princípio de aumentar gradualmente a exigência do treino ao longo do tempo para manter o estímulo acima do nível já adaptado.",
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
    definicao: "A quantidade total de trabalho realizado, geralmente expressa em séries, repetições e carga por período.",
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
    definicao: "A extensão total do movimento possível em uma articulação, do início ao fim do arco.",
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
    definicao: "A magnitude da queda da frequência cardíaca nos primeiros minutos após a interrupção do exercício.",
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
    definicao: "O princípio de que a meta do aluno é o critério primário que orienta a seleção do exercício.",
    resumo: "A meta do aluno é o primeiro filtro de seleção do exercício.",
    detalhe:
      "Antes de escolher entre variações, defina o objetivo (hipertrofia, força, resistência, retorno, aprendizado). Ele orienta a direção do movimento, a faixa de esforço e o quanto a técnica pesa. Em geral, meio (exercício) deve servir ao fim (objetivo), não o contrário.",
  },
  {
    id: "b2",
    termo: "Adequação ao nível técnico",
    categoria: "Princípios de decisão",
    definicao: "O princípio de ajustar a complexidade do exercício à capacidade atual de execução do aluno.",
    resumo: "O melhor exercício também é o que a pessoa consegue executar bem hoje.",
    detalhe:
      "Um padrão avançado mal executado tende a render menos e a expor mais do que uma variação simples bem feita. Ajuste a complexidade ao nível atual e progrida conforme o controle melhora.",
  },
  {
    id: "b3",
    termo: "Equipamento na decisão",
    categoria: "Princípios de decisão",
    definicao: "O princípio de que a escolha do exercício deve respeitar o equipamento disponível no contexto.",
    resumo: "A melhor recomendação precisa ser executável com o que há disponível.",
    detalhe:
      "De nada adianta a variação 'ideal' se o equipamento não existe na sala. Considere o disponível e escolha a melhor opção viável: às vezes a segunda melhor executável supera a primeira inacessível.",
  },
  {
    id: "b4",
    termo: "Dobradiça de quadril",
    categoria: "Biomecânica",
    definicao:
      "O padrão de flexão e extensão do quadril com a coluna mantida em posição neutra, dissociando o movimento do quadril do da lombar.",
    resumo: "Movimento que vem do quadril indo para trás, com coluna neutra.",
    detalhe:
      "A dissociação entre quadril e coluna permite trabalhar a cadeia posterior reduzindo a carga passiva na lombar. É a base de exercícios como o levantamento terra romeno (stiff).",
    verExercicio: "levantamento-terra-romeno",
  },
  {
    id: "b5",
    termo: "Valgo dinâmico do joelho",
    categoria: "Biomecânica",
    definicao: "O desvio medial do joelho em relação à linha do pé durante um movimento sob carga.",
    resumo: "Colapso do joelho para dentro sob carga.",
    detalhe:
      "Quando o joelho foge da linha do pé em direção medial, aumenta o estresse em estruturas mediais. Em geral, treinar o controle (joelho acompanhando o pé) tende a reduzir desconforto relatado.",
    verExercicio: "afundo-passada",
  },
  {
    id: "b6",
    termo: "Controle escapular",
    categoria: "Biomecânica",
    definicao: "A capacidade de posicionar e estabilizar as escápulas de forma voluntária durante os movimentos do ombro.",
    resumo: "Estabilizar as escápulas dá base segura para empurrar e puxar.",
    detalhe:
      "Retração e depressão escapular ('encaixe') criam uma base estável no supino e melhoram o recrutamento nas puxadas. É um pré-requisito de segurança para o ombro.",
    verExercicio: "supino-reto-barra",
  },
  {
    id: "b7",
    termo: "Ativação vs. eficiência",
    categoria: "Fisiologia",
    definicao:
      "A distinção entre o grau de recrutamento de um músculo (ativação) e o balanço entre estímulo e custo do exercício (eficiência).",
    resumo: "Recrutar muito um músculo não é o único critério de um bom exercício.",
    detalhe:
      "Alta ativação de um alvo é desejável, mas eficiência considera também demanda articular, complexidade e transferência. Um índice combina esses fatores para orientar a decisão.",
  },
  {
    id: "b8",
    termo: "Tempo sob tensão",
    categoria: "Fisiologia",
    definicao: "A duração total em que o músculo permanece sob carga durante uma série.",
    resumo: "A cadência influencia o estímulo, não só a carga.",
    detalhe:
      "Controlar a fase excêntrica aumenta o tempo sob tensão e, em geral, favorece o aprendizado técnico e o estímulo de hipertrofia com cargas mais conservadoras.",
  },
  {
    id: "b9",
    termo: "Demanda lombar",
    categoria: "Segurança",
    definicao: "A magnitude da carga mecânica imposta à coluna lombar durante um exercício.",
    resumo: "Quanto o exercício exige da coluna lombar sob carga.",
    detalhe:
      "Exercícios com alta demanda lombar pedem mais controle e podem não ser a primeira escolha em contextos de dor. Variações guiadas tendem a reduzir essa demanda.",
    verExercicio: "leg-press-45",
  },
  {
    id: "b10",
    termo: "Amplitude indolor",
    categoria: "Segurança",
    definicao: "A faixa de movimento que a pessoa consegue percorrer sem provocar dor.",
    resumo: "No retorno pós-lesão, a amplitude tolerável guia a progressão.",
    detalhe:
      "Trabalhar dentro de amplitudes sem dor, progredindo gradualmente e monitorando a resposta, em geral respeita o estágio do retorno. A resposta do tecido guia, não o calendário.",
  },
  {
    id: "b11",
    termo: "Anti-movimento (core)",
    categoria: "Biomecânica",
    definicao: "A função do core de resistir ao movimento da coluna (anti-flexão, anti-extensão, anti-rotação, anti-inclinação) em vez de produzi-lo.",
    resumo: "Resistir ao movimento costuma treinar o core melhor que flexioná-lo.",
    detalhe:
      "Padrões de estabilização e anti-rotação treinam a função do core de resistir a forças, em geral mais transferível ao esporte do que grandes volumes de flexão repetida de coluna.",
  },
  {
    id: "b12",
    termo: "Linguagem prudente",
    categoria: "Glossário",
    definicao: "O uso de expressões que comunicam tendência e probabilidade, não certeza absoluta, ao descrever respostas ao exercício.",
    resumo: "'Tende a', 'em geral', 'depende do contexto': por quê.",
    detalhe:
      "Respostas em ciências do exercício dependem do indivíduo e da execução. A linguagem prudente comunica tendência, não certeza absoluta, e reforça que o conteúdo é educacional: não substitui avaliação profissional individualizada.",
  },

  /* ===================================================================== */
  /* ============== AMPLIAÇÃO: PRINCÍPIOS DE DECISÃO / CARGA ============== */
  /* ===================================================================== */
  {
    id: "p-intensidade",
    termo: "Intensidade",
    categoria: "Princípios de decisão",
    definicao: "O grau de exigência de um esforço em relação à capacidade máxima do indivíduo.",
    resumo: "O quão pesado ou exigente está o esforço, não o quanto se faz.",
    detalhe:
      "Na musculação, costuma ser expressa como percentual de 1RM ou pela proximidade da falha; no aeróbio, como percentual da FC máxima, do VO₂máx ou pela percepção de esforço. É diferente de volume: dá para ter muito volume em baixa intensidade e vice-versa.",
    formula: "Ex.: % de 1RM, % da FCmáx, % do VO₂máx",
    aplicacao:
      "Intensidade alta com volume alto ao mesmo tempo satura a recuperação. Em geral, ajusta-se uma quando se sobe a outra.",
    sinonimos: "carga relativa",
  },
  {
    id: "p-carga",
    termo: "Carga",
    categoria: "Princípios de decisão",
    definicao: "A magnitude do estímulo imposto ao organismo pelo exercício.",
    resumo: "O tanto de exigência do treino, seja pelo peso, seja pelo esforço total.",
    detalhe:
      "Distingue-se carga externa (o que é mensurável fora do corpo, como o peso ou a distância) de carga interna (a resposta do organismo, como FC e percepção de esforço). Uma mesma carga externa gera cargas internas diferentes conforme o dia e a pessoa.",
    formula: "Carga interna (sRPE) = PSE × duração (min)",
    aplicacao:
      "Monitorar carga interna ajuda a explicar por que o mesmo treino às vezes pesa mais: sono, estresse e recuperação mudam a resposta.",
    sinonimos: "carga externa, carga interna",
  },
  {
    id: "p-peso",
    termo: "Peso",
    categoria: "Princípios de decisão",
    definicao: "A força com que a gravidade atrai um corpo, igual à massa multiplicada pela aceleração da gravidade.",
    resumo: "O quanto a gravidade puxa a massa que você move.",
    detalhe:
      "No treino, 'peso' costuma ser usado de forma prática para a carga externa (halteres, anilhas). Fisicamente, peso não é o mesmo que massa: a massa é a quantidade de matéria, e o peso é a força gravitacional sobre ela.",
    formula: "Peso (P) = massa (m) × gravidade (g)",
    aplicacao:
      "Aumentar o peso é só uma das formas de progredir. Repetições, séries, cadência e amplitude também alteram o estímulo.",
    sinonimos: "carga externa",
  },
  {
    id: "p-resistencia",
    termo: "Resistência",
    categoria: "Princípios de decisão",
    definicao: "Qualquer força que se opõe ao movimento; também, a capacidade de sustentar um esforço ao longo do tempo.",
    resumo: "Aquilo contra o que o músculo trabalha, ou a capacidade de aguentar o esforço.",
    detalhe:
      "O termo tem dois sentidos. Como oposição ao movimento, é a carga a vencer (peso, elástico, água). Como capacidade, é a aptidão de manter um esforço por tempo prolongado (resistência muscular ou cardiorrespiratória), o que aproxima o termo de endurance.",
    aplicacao:
      "Vale checar em qual sentido a palavra está sendo usada: a fonte da oposição ou a capacidade de sustentar o trabalho.",
    sinonimos: "endurance, oposição ao movimento",
  },
  {
    id: "p-repeticao",
    termo: "Repetição",
    categoria: "Princípios de decisão",
    definicao: "A execução completa de um movimento, do início ao fim do arco e retorno.",
    resumo: "Um ciclo completo do exercício.",
    detalhe:
      "Uma repetição inclui, em geral, uma fase concêntrica e uma excêntrica. O número de repetições por série, associado à carga, define parte do estímulo (mais repetições com carga menor tende a resistência; menos com carga maior tende a força).",
    aplicacao:
      "Contar repetições até certa proximidade da falha é uma forma prática de padronizar o esforço entre sessões.",
    sinonimos: "rep",
  },
  {
    id: "p-serie",
    termo: "Série",
    categoria: "Princípios de decisão",
    definicao: "Um conjunto de repetições executadas de forma contínua, seguido de um intervalo.",
    resumo: "Um bloco de repetições sem pausa.",
    detalhe:
      "As séries por grupo muscular na semana são uma das principais formas de contabilizar volume. Estruturas como séries simples, compostas (bi-set), drop-sets e séries até a falha mudam a densidade e o estresse da sessão.",
    aplicacao:
      "Somar as séries semanais efetivas por grupo muscular é um jeito prático de comparar o volume entre programas.",
    sinonimos: "set",
  },
  {
    id: "p-frequencia",
    termo: "Frequência",
    categoria: "Princípios de decisão",
    definicao: "O número de sessões de treino, ou de estímulos a um mesmo grupo, dentro de um período.",
    resumo: "Quantas vezes se treina (ou se treina algo) por semana.",
    detalhe:
      "Pode se referir à frequência semanal geral de treinos ou à frequência com que cada grupo muscular é estimulado. Distribuir o volume em mais sessões costuma facilitar a qualidade de cada uma e a recuperação.",
    aplicacao:
      "Para o mesmo volume semanal, dividir em mais dias pode melhorar a execução das últimas séries de cada grupo.",
  },
  {
    id: "p-intervalo",
    termo: "Intervalo (descanso entre séries)",
    categoria: "Princípios de decisão",
    definicao: "O tempo de pausa entre séries ou esforços.",
    resumo: "Quanto se descansa entre uma série e outra.",
    detalhe:
      "O intervalo influencia a recuperação da força para a série seguinte. Intervalos mais longos favorecem manter a carga em treinos de força; mais curtos elevam a densidade e o componente metabólico, mas podem reduzir as repetições possíveis.",
    aplicacao:
      "Se as repetições caem muito de uma série para a outra, aumentar o intervalo costuma preservar melhor o estímulo de força.",
    sinonimos: "descanso, pausa",
  },
  {
    id: "p-recuperacao",
    termo: "Recuperação",
    categoria: "Princípios de decisão",
    definicao: "O processo de restauração do organismo após o esforço até o retorno à condição de base ou acima dela.",
    resumo: "O tempo e os processos que devolvem o corpo ao ponto de treinar bem de novo.",
    detalhe:
      "Envolve reposição de substratos, reparo de tecidos e normalização de sistemas nervoso e hormonal. Sono, alimentação e manejo do estresse são pilares. Sem recuperação suficiente, o acúmulo de estímulos não se converte em adaptação.",
    aplicacao:
      "Quando o desempenho não sobe apesar de bom treino, a recuperação (sono, dieta, estresse) costuma ser o elo a investigar.",
  },
  {
    id: "p-cadencia",
    termo: "Cadência",
    categoria: "Princípios de decisão",
    definicao: "O ritmo de execução de uma repetição, definido pela duração de cada fase do movimento.",
    resumo: "A velocidade controlada de cada fase da repetição.",
    detalhe:
      "Costuma ser anotada em quatro números (excêntrica, pausa embaixo, concêntrica, pausa em cima). Cadências mais lentas aumentam o tempo sob tensão e o controle; mais rápidas favorecem potência quando a técnica permite.",
    formula: "Notação: 4 dígitos (ex.: 3-1-1-0)",
    aplicacao:
      "Desacelerar a fase excêntrica é um recurso simples para aumentar o estímulo sem precisar de mais carga.",
    sinonimos: "tempo (tempo de execução)",
  },
  {
    id: "p-densidade",
    termo: "Densidade",
    categoria: "Princípios de decisão",
    definicao: "A quantidade de trabalho realizado por unidade de tempo de sessão.",
    resumo: "Quanto trabalho você encaixa no tempo de treino.",
    detalhe:
      "Relaciona o trabalho total ao tempo total (incluindo intervalos). Reduzir intervalos ou usar séries combinadas aumenta a densidade e o desafio metabólico, geralmente com trade-off na carga que se consegue manter.",
    formula: "Densidade ≈ trabalho total ÷ tempo total de sessão",
    aplicacao:
      "Encurtar intervalos aos poucos é uma forma de progredir sem mexer na carga, útil quando o tempo é limitado.",
  },
  {
    id: "p-esforco",
    termo: "Esforço",
    categoria: "Princípios de decisão",
    definicao: "O grau de empenho aplicado em relação ao máximo possível naquele momento.",
    resumo: "O quanto você está se dedicando dentro do que consegue hoje.",
    detalhe:
      "É frequentemente monitorado pela proximidade da falha (repetições em reserva) ou pela percepção subjetiva. Distingue-se de intensidade absoluta: pode-se aplicar esforço alto com carga moderada quando se chega perto da falha.",
    aplicacao:
      "Padronizar o esforço (por exemplo, parar com 1 a 3 repetições em reserva) ajuda a comparar séries entre dias diferentes.",
    sinonimos: "empenho",
  },
  {
    id: "p-falha-muscular",
    termo: "Falha muscular",
    categoria: "Princípios de decisão",
    definicao: "O ponto em que o músculo não consegue completar mais uma repetição com a técnica proposta.",
    resumo: "Quando não sai mais nenhuma repetição válida.",
    detalhe:
      "A falha concêntrica é a incapacidade de vencer a fase de subida. Treinar próximo da falha é um estímulo potente, mas treinar sempre até a falha eleva a fadiga e o tempo de recuperação, nem sempre com ganho proporcional.",
    aplicacao:
      "Reservar a falha para as últimas séries ou exercícios isolados equilibra estímulo e recuperação melhor do que buscá-la em tudo.",
    sinonimos: "falha concêntrica",
  },
  {
    id: "p-proximidade-falha",
    termo: "Proximidade da falha",
    categoria: "Princípios de decisão",
    definicao: "A distância entre o fim de uma série e o ponto de falha muscular, medida em repetições em reserva.",
    resumo: "Quantas repetições você ainda teria antes de travar.",
    detalhe:
      "É expressa em repetições em reserva (RIR): parar com 2 RIR significa que restavam cerca de duas repetições. É uma forma de regular o esforço com precisão, mais estável entre dias do que fixar só carga e repetições.",
    formula: "RIR = repetições que ainda restavam ao encerrar a série",
    aplicacao:
      "Prescrever por RIR (ex.: 1 a 3 em reserva) mantém o estímulo consistente mesmo quando a energia do dia varia.",
    sinonimos: "RIR, repetições em reserva",
  },
  {
    id: "p-sobrecarga",
    termo: "Sobrecarga",
    categoria: "Princípios de decisão",
    definicao: "A imposição de um estímulo superior ao que o organismo está habituado, necessário para gerar adaptação.",
    resumo: "Dar ao corpo um desafio acima do que ele já suporta com folga.",
    detalhe:
      "É a base do princípio da sobrecarga: sem um estímulo que exceda o hábito, não há razão fisiológica para adaptar. A sobrecarga precisa ser dosada, pois em excesso e sem recuperação vira fonte de fadiga e risco.",
    aplicacao:
      "A sobrecarga é o 'porquê' da progressão: ela justifica aumentar carga, volume ou densidade ao longo do tempo.",
    sinonimos: "estímulo sobrecarregante",
  },
  {
    id: "p-progressao",
    termo: "Progressão",
    categoria: "Princípios de decisão",
    definicao: "O aumento planejado da exigência do treino ao longo do tempo.",
    resumo: "Como a exigência sobe, semana a semana, de forma organizada.",
    detalhe:
      "Pode ocorrer por carga, repetições, séries, densidade, amplitude ou complexidade. Progressões lineares somam de forma constante; onduladas variam a exigência dentro da semana. A escolha depende do nível e do objetivo.",
    aplicacao:
      "Progredir uma variável por vez e observar a resposta reduz o risco de trocar resultado por dor e desistência.",
  },
  {
    id: "p-especificidade",
    termo: "Especificidade",
    categoria: "Princípios de decisão",
    definicao: "O princípio de que as adaptações ao treino são específicas ao tipo de estímulo aplicado.",
    resumo: "Você melhora naquilo que treina, do jeito que treina.",
    detalhe:
      "Adaptações refletem a via metabólica, os padrões de movimento, as velocidades e as amplitudes treinadas. Por isso, o treino deve se assemelhar à demanda do objetivo (princípio SAID: adaptação específica à demanda imposta).",
    aplicacao:
      "Se a meta é uma tarefa específica, incluir movimentos e velocidades próximos dela melhora a transferência.",
    sinonimos: "princípio SAID",
  },
  {
    id: "p-variacao",
    termo: "Variação",
    categoria: "Princípios de decisão",
    definicao: "A alteração planejada de variáveis do treino ao longo do tempo para sustentar o estímulo.",
    resumo: "Mudar exercícios ou variáveis para o corpo continuar respondendo.",
    detalhe:
      "Variar exercícios, ângulos, cargas ou faixas de repetição ajuda a evitar estagnação, distribuir o estresse e manter a motivação. Variação em excesso, porém, atrapalha a progressão, que precisa de repetição para medir evolução.",
    aplicacao:
      "Variar o suficiente para renovar o estímulo, mas manter exercícios-chave por tempo bastante para medir progresso.",
  },
  {
    id: "p-dose-treinamento",
    termo: "Dose de treinamento",
    categoria: "Princípios de decisão",
    definicao: "A quantidade total de estímulo prescrito, combinando volume, intensidade e frequência.",
    resumo: "O 'tamanho' total do estímulo que você prescreve.",
    detalhe:
      "Segue a lógica dose-resposta: existe uma faixa em que mais estímulo gera mais adaptação, até um ponto em que o excesso reduz o retorno e aumenta o risco. A dose mínima eficaz é a menor que ainda produz a resposta desejada.",
    aplicacao:
      "Buscar a menor dose que ainda progride poupa recuperação e deixa margem para aumentar quando o platô chegar.",
    sinonimos: "dose-resposta",
  },
  {
    id: "p-periodizacao",
    termo: "Periodização",
    categoria: "Princípios de decisão",
    definicao: "A organização planejada do treino em ciclos, com variação sistemática de volume e intensidade ao longo do tempo.",
    resumo: "O planejamento do treino em fases com metas diferentes.",
    detalhe:
      "Divide o treino em macrociclos, mesociclos e microciclos, alternando ênfases (base, força, potência, pico) e prevendo fases de recuperação. Modelos lineares reduzem volume e sobem intensidade progressivamente; ondulatórios variam dentro da semana.",
    aplicacao:
      "Periodizar ajuda a chegar preparado a um objetivo em uma data e a intercalar cargas para reduzir estagnação e overtraining.",
    sinonimos: "planejamento periodizado",
  },
  {
    id: "p-tolerancia-esforco",
    termo: "Tolerância ao esforço",
    categoria: "Princípios de decisão",
    definicao: "A capacidade individual de sustentar e suportar determinado nível de esforço.",
    resumo: "O quanto a pessoa aguenta de esforço com segurança e sem sintomas.",
    detalhe:
      "Depende de condicionamento, saúde, medicação e experiência. Guiar a progressão pela tolerância (sintomas, recuperação, qualidade de execução) respeita o indivíduo mais do que seguir apenas metas de carga.",
    aplicacao:
      "Ajustar a exigência à tolerância observada, e não a um número fixo, reduz recaídas e abandono, sobretudo em iniciantes e retorno.",
  },
  {
    id: "p-percepcao-esforco",
    termo: "Percepção de esforço",
    categoria: "Princípios de decisão",
    definicao: "A avaliação subjetiva do quanto um esforço é exigente, integrada pelo sistema nervoso a partir de múltiplos sinais.",
    resumo: "A leitura interna de quão difícil está o esforço.",
    detalhe:
      "É a base das escalas de PSE. Reúne sinais cardiorrespiratórios, musculares e centrais em uma nota única. É prática e válida para regular intensidade quando medidas objetivas não estão disponíveis ou não são confiáveis.",
    aplicacao:
      "Escalas de percepção guiam bem a intensidade em populações com FC pouco confiável (medicação, arritmia).",
    sinonimos: "PSE, RPE",
  },

  /* ===================================================================== */
  /* ===================== AMPLIAÇÃO: BIOMECÂNICA ======================== */
  /* ===================================================================== */
  {
    id: "bm-forca-fisica",
    termo: "Força (grandeza física)",
    categoria: "Biomecânica",
    definicao: "A interação capaz de alterar o estado de movimento ou a forma de um corpo, igual à massa vezes a aceleração.",
    resumo: "O empurra ou puxa que muda o movimento de um corpo.",
    detalhe:
      "É uma grandeza vetorial, com intensidade, direção e sentido. No corpo, forças musculares, gravitacionais e de contato se combinam para produzir ou frear movimentos. É a base para entender torque, impulso e trabalho.",
    formula: "Força (F) = massa (m) × aceleração (a); unidade: newton (N)",
    aplicacao:
      "Pensar em direção e ponto de aplicação da força ajuda a prever qual articulação será mais exigida em cada posição.",
  },
  {
    id: "bm-aceleracao",
    termo: "Aceleração",
    categoria: "Biomecânica",
    definicao: "A taxa de variação da velocidade de um corpo em relação ao tempo.",
    resumo: "O quão rápido a velocidade está mudando.",
    detalhe:
      "Pode aumentar ou diminuir a velocidade. Para acelerar um corpo é preciso aplicar força; quanto maior a massa, mais força para a mesma aceleração. É central na fase de arranque de saltos e sprints.",
    formula: "Aceleração (a) = variação da velocidade ÷ tempo; unidade: m/s²",
    aplicacao:
      "Movimentos explosivos buscam alta aceleração na fase concêntrica, respeitando técnica e carga que permitam velocidade.",
  },
  {
    id: "bm-desaceleracao",
    termo: "Desaceleração",
    categoria: "Biomecânica",
    definicao: "A redução da velocidade de um corpo ao longo do tempo, ou seja, aceleração de sentido oposto ao movimento.",
    resumo: "O freio: reduzir a velocidade de forma controlada.",
    detalhe:
      "Frear um movimento exige força, muitas vezes com atuação muscular excêntrica. A capacidade de desacelerar é decisiva em mudanças de direção e aterrissagens, e sua deficiência associa-se a maior estresse articular.",
    aplicacao:
      "Treinar aterrissagens e freadas controladas costuma reduzir o estresse de pico ao mudar de direção.",
    sinonimos: "frenagem",
  },
  {
    id: "bm-velocidade",
    termo: "Velocidade",
    categoria: "Biomecânica",
    definicao: "A taxa de variação da posição de um corpo em relação ao tempo, com direção e sentido.",
    resumo: "O quão rápido e em que direção algo se move.",
    detalhe:
      "Difere de rapidez (o valor sem direção). No treino, a velocidade de execução influencia o estímulo: mover rápido a carga desenvolve potência; controlar a velocidade aumenta o tempo sob tensão. Monitorar a velocidade da barra é uma forma de regular esforço.",
    formula: "Velocidade = deslocamento ÷ tempo; unidade: m/s",
    aplicacao:
      "A queda de velocidade dentro da série indica aproximação da fadiga e pode ser usada para encerrar no ponto planejado.",
  },
  {
    id: "bm-deslocamento",
    termo: "Deslocamento",
    categoria: "Biomecânica",
    definicao: "A mudança de posição de um corpo, definida pela distância e direção entre o ponto inicial e o final.",
    resumo: "O quanto e para onde algo mudou de lugar.",
    detalhe:
      "É uma grandeza vetorial e difere de distância percorrida (que soma todo o caminho). Na análise de exercícios, o deslocamento vertical da carga ajuda a estimar o trabalho mecânico realizado.",
    formula: "Trabalho ≈ peso × deslocamento vertical",
    aplicacao:
      "Amplitudes maiores aumentam o deslocamento da carga e, com ele, o trabalho mecânico por repetição.",
  },
  {
    id: "bm-trajetoria",
    termo: "Trajetória",
    categoria: "Biomecânica",
    definicao: "O caminho descrito por um corpo ou segmento durante o movimento.",
    resumo: "A linha que o peso ou o segmento percorre no espaço.",
    detalhe:
      "A trajetória de uma carga afeta a distância dela ao eixo articular ao longo do movimento e, portanto, o torque exigido em cada ponto. Trajetórias eficientes tendem a manter a carga próxima do centro de massa nos padrões de levantamento.",
    aplicacao:
      "No agachamento e no terra, manter a barra próxima do corpo encurta o braço de momento e reduz a demanda lombar.",
    sinonimos: "caminho do movimento",
  },
  {
    id: "bm-alavanca",
    termo: "Alavanca",
    categoria: "Biomecânica",
    definicao: "Uma barra rígida que gira em torno de um ponto de apoio para transmitir força.",
    resumo: "O sistema osso-articulação-músculo que multiplica ou vence força.",
    detalhe:
      "No corpo, os ossos são as alavancas, as articulações os pontos de apoio e os músculos as forças aplicadas. A maioria das alavancas humanas favorece amplitude e velocidade em troca de exigir mais força muscular. A relação entre os braços de força e de resistência define a vantagem mecânica.",
    formula: "Vantagem mecânica = braço da força ÷ braço da resistência",
    aplicacao:
      "Entender qual braço de alavanca cresce em cada ângulo explica onde o exercício fica mais difícil.",
    sinonimos: "sistema de alavanca",
  },
  {
    id: "bm-centro-massa",
    termo: "Centro de massa",
    categoria: "Biomecânica",
    definicao: "O ponto no qual toda a massa de um corpo pode ser considerada concentrada para efeitos de análise do movimento.",
    resumo: "O ponto de equilíbrio médio de toda a massa do corpo.",
    detalhe:
      "No ser humano em pé, situa-se aproximadamente à frente da coluna, na altura da pelve, e se desloca conforme a posição dos segmentos. Sua posição em relação à base de suporte determina o equilíbrio.",
    aplicacao:
      "Manter o centro de massa dentro da base de suporte é a chave para a estabilidade em exercícios em pé e transições.",
    sinonimos: "centro de gravidade",
  },
  {
    id: "bm-base-suporte",
    termo: "Base de suporte",
    categoria: "Biomecânica",
    definicao: "A área delimitada pelos pontos de contato do corpo com a superfície de apoio.",
    resumo: "A área entre e sob seus pontos de apoio no chão.",
    detalhe:
      "Bases maiores facilitam o equilíbrio, pois ampliam a região sobre a qual o centro de massa pode se projetar sem perda de estabilidade. Reduzir a base (apoio unipodal) aumenta a demanda de controle.",
    aplicacao:
      "Afastar os apoios amplia a base e estabiliza; reduzi-la de propósito é uma forma de progredir o desafio de equilíbrio.",
  },
  {
    id: "bm-impacto",
    termo: "Impacto",
    categoria: "Biomecânica",
    definicao: "A força de grande magnitude aplicada em um intervalo de tempo muito curto, como em uma colisão.",
    resumo: "O choque de uma força forte e rápida, como ao aterrissar.",
    detalhe:
      "Em corridas e saltos, a força de impacto ao tocar o solo pode superar várias vezes o peso corporal. Distribuir esse impacto no tempo (aterrissagem suave, absorção com flexão articular) reduz os picos de força sobre os tecidos.",
    aplicacao:
      "Ensinar aterrissagem amortecida e progredir volume de saltos aos poucos ajuda a tolerar o impacto com segurança.",
  },
  {
    id: "bm-impulso",
    termo: "Impulso",
    categoria: "Biomecânica",
    definicao: "O produto de uma força pelo tempo durante o qual ela atua, igual à variação da quantidade de movimento.",
    resumo: "O efeito acumulado de aplicar uma força por um tempo.",
    detalhe:
      "Aplicar mais força ou aplicá-la por mais tempo aumenta o impulso e, com ele, a mudança de velocidade do corpo. Em saltos, um impulso maior contra o solo gera maior velocidade de decolagem.",
    formula: "Impulso (J) = força (F) × tempo (t) = variação da quantidade de movimento",
    aplicacao:
      "Para saltar mais alto, o objetivo é maximizar o impulso vertical dentro do tempo de contato disponível.",
  },
  {
    id: "bm-tensao",
    termo: "Tensão (esforço mecânico)",
    categoria: "Biomecânica",
    definicao: "O esforço interno que surge quando forças tendem a alongar ou tracionar um material ao longo de seu eixo.",
    resumo: "O 'esticar' interno de um tecido puxado nas duas pontas.",
    detalhe:
      "Tecidos como tendões e músculos suportam bem a tensão longitudinal, que é o principal estímulo mecânico do treino de força (tensão mecânica). É diferente de compressão, cisalhamento e tração como carregamentos distintos sobre os tecidos.",
    aplicacao:
      "A tensão mecânica gerada por cargas adequadas em boa amplitude é um dos motores centrais da hipertrofia.",
    sinonimos: "tensão de tração, tensão mecânica",
  },
  {
    id: "bm-compressao",
    termo: "Compressão",
    categoria: "Biomecânica",
    definicao: "O esforço mecânico que surge quando forças tendem a aproximar e comprimir as partes de um corpo.",
    resumo: "O 'apertar' de forças que empurram uma estrutura de encontro a si mesma.",
    detalhe:
      "Ossos e discos intervertebrais suportam bem cargas compressivas dentro de limites. Em exercícios com carga axial, como agachamento, a compressão sobre a coluna é esperada e tolerável quando bem dosada e com boa técnica.",
    aplicacao:
      "Distribuir a carga e manter a coluna neutra ajuda a lidar com forças compressivas de forma segura.",
  },
  {
    id: "bm-cisalhamento",
    termo: "Cisalhamento",
    categoria: "Biomecânica",
    definicao: "O esforço mecânico gerado por forças paralelas e opostas que tendem a deslizar as partes de um corpo entre si.",
    resumo: "Forças que 'deslizam' uma camada sobre a outra.",
    detalhe:
      "No corpo, forças de cisalhamento atuam, por exemplo, entre vértebras ou no joelho entre fêmur e tíbia. Estruturas como ligamentos ajudam a resistir a esse deslizamento. Certos ângulos e posições aumentam o cisalhamento e pedem controle.",
    aplicacao:
      "Ajustar o ângulo do tronco e o controle da técnica ajuda a modular forças de cisalhamento em coluna e joelho.",
  },
  {
    id: "bm-tracao",
    termo: "Tração",
    categoria: "Biomecânica",
    definicao: "A força que puxa e tende a alongar uma estrutura ao longo de seu eixo, afastando suas extremidades.",
    resumo: "O puxão que estica uma estrutura pelas pontas.",
    detalhe:
      "Tendões transmitem a tração gerada pelo músculo ao osso para produzir movimento. Como carregamento, tração e compressão são opostos: uma afasta, a outra aproxima as partes do material.",
    aplicacao:
      "Movimentos de puxar aplicam tração à musculatura das costas e aos tendões envolvidos, dentro de amplitudes toleráveis.",
    sinonimos: "força de tração",
  },
  {
    id: "bm-contracao",
    termo: "Contração muscular",
    categoria: "Biomecânica",
    definicao: "O processo pelo qual o músculo gera tensão ativa a partir da formação e ciclagem das pontes cruzadas entre actina e miosina, que deslizam os filamentos; a tensão pode ocorrer com ou sem encurtamento do músculo.",
    resumo: "O músculo produzindo tensão, mudando ou não de comprimento.",
    detalhe:
      "Apesar do nome, uma contração nem sempre encurta o músculo: a tensão pode ocorrer com encurtamento (concêntrica), alongamento (excêntrica) ou comprimento constante (isométrica). O termo se refere à ativação, não necessariamente ao encurtamento.",
    aplicacao:
      "Reconhecer os três tipos de ação ajuda a escolher o estímulo certo para força, controle ou tolerância a carga.",
    sinonimos: "ação muscular",
  },
  {
    id: "bm-concentrica",
    termo: "Ação concêntrica",
    categoria: "Biomecânica",
    definicao: "A ação muscular em que o músculo gera tensão enquanto se encurta, vencendo a resistência.",
    resumo: "A fase em que o músculo encurta e move a carga contra a resistência.",
    detalhe:
      "É a fase de 'subida' na maioria dos exercícios (empurrar a barra, subir do agachamento). A força que o músculo produz supera a resistência, produzindo movimento no sentido da contração.",
    aplicacao:
      "A explosão na fase concêntrica é onde se treina potência, quando a carga permite velocidade com técnica.",
    sinonimos: "fase concêntrica, fase positiva",
  },
  {
    id: "bm-excentrica",
    termo: "Ação excêntrica",
    categoria: "Biomecânica",
    definicao: "A ação muscular em que o músculo gera tensão enquanto se alonga, controlando a resistência.",
    resumo: "A fase em que o músculo alonga freando a carga.",
    detalhe:
      "É a fase de 'descida' controlada (baixar a barra, descer no agachamento). O músculo produz força enquanto cede, atuando como freio. Costuma permitir cargas maiores que a concêntrica e associa-se a mais dor muscular tardia quando pouco habituado.",
    aplicacao:
      "Enfatizar a fase excêntrica (descidas lentas) aumenta o estímulo com a mesma carga e ajuda no controle técnico.",
    sinonimos: "fase excêntrica, fase negativa",
  },
  {
    id: "bm-isometrica",
    termo: "Ação isométrica",
    categoria: "Biomecânica",
    definicao: "A ação muscular em que o músculo gera tensão sem alteração perceptível de seu comprimento.",
    resumo: "O músculo trabalha sem que a articulação se mova.",
    detalhe:
      "A força produzida iguala a resistência, e não há movimento articular (prancha, sustentar uma posição). É útil para estabilização, para trabalhar ângulos específicos e como recurso quando o movimento provoca dor.",
    aplicacao:
      "Isometrias em posições toleráveis são um recurso útil no início do retorno, quando amplitudes móveis ainda incomodam.",
    sinonimos: "isometria, contração estática",
  },
  {
    id: "bm-cae",
    termo: "Ciclo alongamento-encurtamento",
    categoria: "Biomecânica",
    definicao: "A sequência em que uma ação excêntrica rápida precede imediatamente uma ação concêntrica, potencializando a força produzida.",
    resumo: "Alongar rápido e logo encurtar para saltar mais, como uma mola.",
    detalhe:
      "O pré-alongamento armazena energia elástica e ativa reflexos que aumentam a força na fase concêntrica seguinte, desde que a transição seja rápida. É a base do treino pliométrico e de gestos como saltos e arremessos.",
    aplicacao:
      "Exercícios pliométricos exploram esse ciclo; a transição curta entre descer e subir é o que o torna eficiente.",
    sinonimos: "CAE, stretch-shortening cycle",
  },
  {
    id: "bm-rigidez",
    termo: "Rigidez",
    categoria: "Biomecânica",
    definicao: "A resistência de um corpo ou tecido à deformação quando submetido a uma força.",
    resumo: "O quanto um tecido resiste a se deformar sob carga.",
    detalhe:
      "Quanto maior a rigidez, menor a deformação para a mesma força. No corpo, certa rigidez muscular e tendínea é desejável para transmitir força com eficiência; rigidez em excesso ou insuficiente pode prejudicar movimento e absorção de impacto.",
    formula: "Rigidez (k) = força aplicada ÷ deformação",
    aplicacao:
      "Uma rigidez adequada do complexo músculo-tendão melhora o aproveitamento do ciclo alongamento-encurtamento.",
    sinonimos: "stiffness",
  },
  {
    id: "bm-elasticidade",
    termo: "Elasticidade",
    categoria: "Biomecânica",
    definicao: "A propriedade de um material de retornar à forma original após cessar a força que o deformou.",
    resumo: "A capacidade de um tecido de voltar ao normal depois de esticado.",
    detalhe:
      "Tendões e fáscias armazenam energia elástica ao serem alongados e a devolvem em parte na fase seguinte do movimento. Essa energia contribui para a economia e a potência em gestos cíclicos como correr e saltar.",
    aplicacao:
      "O reaproveitamento de energia elástica ajuda a explicar por que movimentos rápidos e encadeados são mais econômicos.",
  },
  {
    id: "bm-eficiencia-mecanica",
    termo: "Eficiência mecânica",
    categoria: "Biomecânica",
    definicao: "A razão entre o trabalho mecânico útil produzido e a energia total gasta para produzi-lo.",
    resumo: "Quanto do esforço vira movimento útil, sem desperdício.",
    detalhe:
      "Boa técnica, trajetórias eficientes e uso de energia elástica aumentam a eficiência, entregando o mesmo resultado com menor custo energético. É diferente da eficiência de seleção de exercício, ligada ao balanço entre estímulo e demanda articular.",
    formula: "Eficiência (%) = (trabalho útil ÷ energia gasta) × 100",
    aplicacao:
      "Refinar a técnica costuma melhorar a eficiência, permitindo mais trabalho útil com o mesmo gasto.",
  },
  {
    id: "bm-equilibrio",
    termo: "Equilíbrio",
    categoria: "Biomecânica",
    definicao: "O estado em que as forças e os torques que atuam sobre um corpo se anulam, mantendo o centro de massa sobre a base de suporte.",
    resumo: "Manter o corpo sem cair, com a massa sobre a base de apoio.",
    detalhe:
      "Pode ser estático (parado) ou dinâmico (em movimento). Depende da integração de informações visuais, vestibulares e proprioceptivas com ajustes musculares contínuos. É um resultado do controle, distinto de estabilidade.",
    aplicacao:
      "Reduzir a base, fechar os olhos ou adicionar tarefas são formas de progredir o desafio de equilíbrio com segurança.",
  },
  {
    id: "bm-estabilidade",
    termo: "Estabilidade",
    categoria: "Biomecânica",
    definicao: "A capacidade de manter ou retornar a uma posição de equilíbrio diante de perturbações.",
    resumo: "A capacidade de resistir a ser tirado da posição e voltar a ela.",
    detalhe:
      "É mais ligada à capacidade de controle e resistência a perturbações do que ao estado momentâneo. Depende de fatores estruturais (formato articular, ligamentos) e do controle neuromuscular. Equilíbrio é o estado; estabilidade é a capacidade de mantê-lo.",
    aplicacao:
      "Treinar a estabilidade envolve resistir a forças (anti-movimento) e recuperar posições após perturbações controladas.",
  },
  {
    id: "bm-mobilidade",
    termo: "Mobilidade",
    categoria: "Biomecânica",
    definicao: "A capacidade de mover ativamente uma articulação por sua amplitude com controle.",
    resumo: "O quanto você consegue mover uma articulação por conta própria, com controle.",
    detalhe:
      "Difere de flexibilidade porque inclui o controle ativo e a força para usar a amplitude, não só a extensibilidade passiva do tecido. Uma boa mobilidade combina amplitude disponível com capacidade de gerar força nela.",
    aplicacao:
      "Trabalhar força nos fins de amplitude costuma transformar amplitude passiva em mobilidade utilizável.",
  },
  {
    id: "bm-flexibilidade",
    termo: "Flexibilidade",
    categoria: "Biomecânica",
    definicao: "A capacidade de um músculo e dos tecidos periarticulares de se alongarem, permitindo amplitude de movimento passiva.",
    resumo: "O quanto um músculo consegue alongar, medido de forma passiva.",
    detalhe:
      "É um componente da mobilidade, mas se refere à extensibilidade passiva do tecido, sem exigir controle ativo. Ter flexibilidade não garante conseguir usar essa amplitude com força, o que a distingue de mobilidade.",
    aplicacao:
      "Ganhos de flexibilidade rendem mais quando acompanhados de trabalho de força na nova amplitude.",
  },
  {
    id: "bm-coordenacao",
    termo: "Coordenação",
    categoria: "Biomecânica",
    definicao: "A organização temporal e espacial das ações musculares para produzir um movimento eficiente e preciso.",
    resumo: "Os músculos certos agindo na hora e na medida certas.",
    detalhe:
      "Envolve a sequência e a graduação da ativação de vários músculos e segmentos. Melhora com a prática e é responsável por parte dos ganhos iniciais de desempenho, antes de mudanças estruturais grandes.",
    aplicacao:
      "Praticar o padrão com boa técnica e carga adequada desenvolve a coordenação específica daquele movimento.",
  },
  {
    id: "bm-controle-motor",
    termo: "Controle motor",
    categoria: "Biomecânica",
    definicao: "O processo pelo qual o sistema nervoso planeja, executa e ajusta os movimentos.",
    resumo: "Como o sistema nervoso comanda e corrige o movimento.",
    detalhe:
      "Integra a intenção, o feedback sensorial e a correção contínua para produzir movimentos precisos e adaptáveis. É a base do aprendizado de habilidades e da estabilização articular, e melhora com prática orientada.",
    aplicacao:
      "Progredir a complexidade conforme o controle melhora rende mais do que insistir em padrões avançados mal executados.",
  },
  {
    id: "bm-tecnica",
    termo: "Técnica",
    categoria: "Biomecânica",
    definicao: "O padrão de execução de um movimento considerado eficiente e seguro para um dado objetivo.",
    resumo: "O jeito bem executado de fazer o movimento.",
    detalhe:
      "Boa técnica otimiza a eficiência mecânica, direciona o estímulo ao alvo pretendido e distribui a carga de forma tolerável. Não existe técnica única universal: ela se ajusta a proporções corporais, objetivo e contexto.",
    aplicacao:
      "Consolidar a técnica com cargas moderadas antes de progredir pesado reduz risco e melhora a transferência do estímulo.",
  },
  {
    id: "bm-postura",
    termo: "Postura",
    categoria: "Biomecânica",
    definicao: "A disposição relativa dos segmentos corporais em uma posição estática ou durante uma tarefa.",
    resumo: "Como os segmentos do corpo estão organizados numa posição.",
    detalhe:
      "Não existe uma única postura 'correta' universal; o que importa é adequá-la à tarefa e distribuir a carga de forma tolerável. Variar de posição ao longo do tempo costuma ser mais protetor do que buscar uma postura fixa perfeita.",
    aplicacao:
      "Em vez de perseguir uma postura ideal única, priorize posições que distribuam bem a carga e permitam variação.",
  },
  {
    id: "bm-alinhamento",
    termo: "Alinhamento",
    categoria: "Biomecânica",
    definicao: "A relação de posicionamento entre segmentos e eixos articulares durante uma posição ou movimento.",
    resumo: "Como articulações e segmentos se posicionam entre si sob carga.",
    detalhe:
      "O alinhamento influencia como as forças se distribuem pelas articulações. Certos alinhamentos aproximam a carga do eixo e reduzem o braço de momento; outros aumentam a demanda. É um recurso de dosagem, não um dogma de 'certo e errado' absoluto.",
    aplicacao:
      "Ajustar o alinhamento (dos pés, do tronco, das mãos) redistribui a demanda entre articulações conforme o objetivo.",
  },

  /* ===================================================================== */
  /* ====================== AMPLIAÇÃO: FISIOLOGIA ======================== */
  /* ===================================================================== */
  {
    id: "fi-fadiga",
    termo: "Fadiga",
    categoria: "Fisiologia",
    definicao: "A redução transitória da capacidade de produzir força ou sustentar um esforço, decorrente do próprio esforço.",
    resumo: "A queda temporária de desempenho causada pelo esforço.",
    detalhe:
      "Tem componentes periféricos (no músculo, por acúmulo de metabólitos e depleção de substratos) e centrais (redução do comando nervoso). É reversível com recuperação. Certa fadiga é necessária ao estímulo; em excesso e sem recuperação, prejudica adaptação.",
    aplicacao:
      "Distinguir fadiga aguda esperada de fadiga acumulada excessiva orienta quando progredir e quando recuar o volume.",
  },
  {
    id: "fi-trabalho",
    termo: "Trabalho (mecânico)",
    categoria: "Fisiologia",
    definicao: "O produto de uma força pelo deslocamento realizado na direção dessa força.",
    resumo: "Força aplicada ao longo de uma distância: o que efetivamente foi movido.",
    detalhe:
      "Se não há deslocamento na direção da força, não há trabalho mecânico, mesmo com muito esforço (como sustentar uma isometria). É a base para calcular potência e se relaciona ao gasto energético da tarefa.",
    formula: "Trabalho (W) = força (F) × deslocamento (d); unidade: joule (J)",
    aplicacao:
      "Mais carga ou mais amplitude aumentam o trabalho por repetição, o que se reflete em maior demanda energética.",
  },
  {
    id: "fi-adaptacao",
    termo: "Adaptação",
    categoria: "Fisiologia",
    definicao: "A modificação funcional ou estrutural do organismo em resposta a um estímulo repetido.",
    resumo: "A mudança do corpo para lidar melhor com o que foi treinado.",
    detalhe:
      "É a resposta que torna o organismo mais apto à demanda imposta (mais força, mais fibras, melhor economia). Segue a especificidade do estímulo e depende de sobrecarga adequada e recuperação. Sem novidade de estímulo, a adaptação estaciona.",
    aplicacao:
      "As adaptações justificam a progressão: quando o corpo se ajusta ao estímulo atual, é hora de aumentar a exigência.",
  },
  {
    id: "fi-estimulo",
    termo: "Estímulo",
    categoria: "Fisiologia",
    definicao: "O agente ou evento que provoca uma resposta do organismo.",
    resumo: "O 'gatilho' do treino que dispara a resposta do corpo.",
    detalhe:
      "No treino, o estímulo é a combinação de exercício, carga, volume e esforço que perturba a homeostase e sinaliza a necessidade de adaptação. Precisa ser suficiente para gerar resposta, mas recuperável para virar adaptação, não só fadiga.",
    aplicacao:
      "Ajustar o estímulo (não sempre aumentá-lo) conforme a resposta observada é o cerne da boa prescrição.",
  },
  {
    id: "fi-adaptacao-aguda",
    termo: "Adaptação aguda",
    categoria: "Fisiologia",
    definicao: "A resposta imediata e transitória do organismo durante e logo após uma sessão de exercício.",
    resumo: "As respostas que acontecem na hora do treino e passam depois.",
    detalhe:
      "Inclui aumento de frequência cardíaca, ventilação, temperatura e fluxo sanguíneo muscular. São reversíveis e voltam ao basal com o repouso. A repetição dessas respostas ao longo do tempo é o que leva às adaptações crônicas.",
    aplicacao:
      "Reconhecer respostas agudas normais evita confundir sinais esperados do esforço com problemas.",
    sinonimos: "resposta aguda",
  },
  {
    id: "fi-adaptacao-cronica",
    termo: "Adaptação crônica",
    categoria: "Fisiologia",
    definicao: "A modificação estável do organismo resultante da exposição repetida ao treino ao longo de semanas e meses.",
    resumo: "As mudanças duradouras que o treino consistente produz.",
    detalhe:
      "Inclui hipertrofia, aumento de VO₂máx, maior densidade mitocondrial, adaptações neurais e ósseas. Diferem das respostas agudas por serem persistentes enquanto o estímulo é mantido. Regridem com destreinamento.",
    aplicacao:
      "As adaptações crônicas são o objetivo do programa; elas exigem consistência e progressão ao longo do tempo.",
    sinonimos: "adaptação a longo prazo",
  },
  {
    id: "fi-supercompensacao",
    termo: "Supercompensação",
    categoria: "Fisiologia",
    definicao: "O aumento da capacidade funcional acima do nível inicial após a recuperação de um estímulo de treino.",
    resumo: "O corpo se recupera e fica um pouco melhor do que antes.",
    detalhe:
      "Após o esforço, há queda temporária de desempenho, seguida de recuperação e de um período em que a capacidade supera o ponto de partida. Aplicar o próximo estímulo nessa janela tende a somar ganhos; muito cedo acumula fadiga, muito tarde perde o efeito.",
    aplicacao:
      "Distribuir os estímulos com recuperação suficiente busca encadear supercompensações em vez de acumular fadiga.",
  },
  {
    id: "fi-destreinamento",
    termo: "Destreinamento",
    categoria: "Fisiologia",
    definicao: "A perda parcial ou total das adaptações ao treino em decorrência da redução ou interrupção do estímulo.",
    resumo: "O que o corpo perde quando o treino para ou diminui muito.",
    detalhe:
      "Adaptações cardiorrespiratórias tendem a regredir mais rápido que as neuromusculares. Uma parte dos ganhos, sobretudo neurais, retorna com rapidez ao reiniciar (memória muscular). Pequenas doses de manutenção reduzem bastante a perda.",
    aplicacao:
      "Em pausas, manter uma dose mínima de treino preserva boa parte das adaptações e facilita o retorno.",
  },
  {
    id: "fi-demanda-metabolica",
    termo: "Demanda metabólica",
    categoria: "Fisiologia",
    definicao: "A quantidade de energia que uma tarefa exige do metabolismo por unidade de tempo.",
    resumo: "O quanto de energia por minuto a atividade exige do corpo.",
    detalhe:
      "Quanto mais intensa e volumosa a atividade, maior a demanda metabólica e a mobilização de substratos. É frequentemente expressa em equivalentes metabólicos (MET) ou em consumo de oxigênio, servindo para comparar o custo de diferentes atividades.",
    formula: "1 MET ≈ 3,5 mL de O₂ / kg / min (gasto de repouso)",
    aplicacao:
      "Estimar a demanda em MET ajuda a graduar atividades conforme a capacidade e a tolerância do aluno.",
    sinonimos: "custo metabólico",
  },
  {
    id: "fi-gasto-energetico",
    termo: "Gasto energético",
    categoria: "Fisiologia",
    definicao: "A quantidade total de energia despendida pelo organismo em determinado período.",
    resumo: "Quanta energia o corpo gasta, em repouso e em atividade.",
    detalhe:
      "Soma o metabolismo basal, o efeito térmico dos alimentos e o gasto com atividade física (exercício e movimento do dia a dia). O exercício aumenta o gasto durante e, em menor grau, após a sessão. Costuma ser expresso em quilocalorias.",
    formula: "Gasto total = metabolismo basal + efeito dos alimentos + atividade física",
    aplicacao:
      "O componente mais variável e treinável do gasto é a atividade física, incluindo o movimento fora do treino.",
    sinonimos: "dispêndio energético",
  },
  {
    id: "fi-consumo-energia",
    termo: "Consumo de energia",
    categoria: "Fisiologia",
    definicao: "A utilização de energia química pelas células para sustentar as funções e o trabalho muscular.",
    resumo: "A energia que as células realmente usam para funcionar e se contrair.",
    detalhe:
      "A moeda energética imediata é o ATP, ressintetizado por vias que usam diferentes substratos conforme a intensidade e a duração do esforço. Em termos práticos, aproxima-se do gasto energético, mas enfatiza o uso celular da energia.",
    aplicacao:
      "Entender que o ATP é reposto por vias distintas ajuda a explicar por que a intensidade muda o combustível predominante.",
    sinonimos: "utilização de energia",
  },
  {
    id: "fi-substrato",
    termo: "Substrato energético",
    categoria: "Fisiologia",
    definicao: "A fonte de energia utilizada pelas células para ressintetizar ATP, como carboidratos, gorduras e fosfatos.",
    resumo: "O 'combustível' que o corpo usa para produzir energia.",
    detalhe:
      "Fosfocreatina alimenta esforços muito curtos e intensos; os carboidratos predominam em intensidades altas; as gorduras contribuem mais em intensidades baixas a moderadas e esforços prolongados. A mistura varia com intensidade, duração e condicionamento.",
    aplicacao:
      "A intensidade do esforço é o principal fator que define qual substrato predomina em cada momento.",
    sinonimos: "combustível energético",
  },
  {
    id: "fi-aquecimento",
    termo: "Aquecimento",
    categoria: "Fisiologia",
    definicao: "O conjunto de atividades preparatórias que elevam gradualmente a prontidão fisiológica antes do esforço principal.",
    resumo: "A preparação que deixa o corpo pronto para o esforço.",
    detalhe:
      "Eleva a temperatura muscular, a frequência cardíaca e o fluxo sanguíneo, melhora a condução nervosa e prepara articulações e padrões de movimento. Um bom aquecimento tende a melhorar o desempenho e a preparar o gesto que será treinado.",
    aplicacao:
      "Um aquecimento específico, com o próprio padrão em cargas crescentes, prepara melhor do que apenas atividade genérica.",
    sinonimos: "warm-up",
  },
  {
    id: "fi-desaquecimento",
    termo: "Desaquecimento",
    categoria: "Fisiologia",
    definicao: "A redução gradual da intensidade ao final da sessão para facilitar a transição ao repouso.",
    resumo: "A volta à calma que encerra o treino de forma gradual.",
    detalhe:
      "Diminuir a intensidade aos poucos ajuda no retorno da frequência cardíaca e da circulação a valores de repouso e pode reduzir a sensação de tontura ao parar de súbito após esforço intenso. Seus efeitos sobre dor muscular tardia são modestos.",
    aplicacao:
      "Reduzir o ritmo por alguns minutos após esforço intenso torna a transição ao repouso mais confortável.",
    sinonimos: "volta à calma, cool-down",
  },
  {
    id: "fi-resistencia-muscular",
    termo: "Resistência muscular",
    categoria: "Fisiologia",
    definicao: "A capacidade de um músculo ou grupo muscular de sustentar contrações repetidas ou uma contração por tempo prolongado.",
    resumo: "A capacidade de repetir ou sustentar o esforço muscular por mais tempo.",
    detalhe:
      "Melhora com treinos de repetições mais altas e intervalos menores, favorecendo adaptações que retardam a fadiga local. É distinta de força máxima, que privilegia cargas altas e poucas repetições.",
    aplicacao:
      "Faixas de repetições mais altas com bom esforço desenvolvem a resistência muscular local.",
    sinonimos: "endurance muscular, RML",
  },
  {
    id: "fi-forca-maxima",
    termo: "Força máxima",
    categoria: "Fisiologia",
    definicao: "A maior quantidade de força que o sistema neuromuscular consegue produzir em uma ação voluntária.",
    resumo: "O teto de força que a pessoa consegue gerar num esforço máximo.",
    detalhe:
      "Expressa-se, na prática, pela 1RM. Depende de fatores estruturais (secção transversa) e neurais (recrutamento, frequência de disparo, coordenação). Treina-se com cargas altas e poucas repetições, com intervalos longos.",
    aplicacao:
      "Ganhos iniciais de força máxima vêm bastante da adaptação neural antes de aumentos grandes de massa muscular.",
    sinonimos: "força dinâmica máxima",
  },
  {
    id: "fi-forca-explosiva",
    termo: "Força explosiva",
    categoria: "Fisiologia",
    definicao: "A capacidade de desenvolver força no menor tempo possível, ou seja, a taxa de produção de força.",
    resumo: "O quão rápido você consegue produzir força.",
    detalhe:
      "É quantificada pela taxa de desenvolvimento de força (RFD): não é só quanta força, mas quão rapidamente ela sobe. É decisiva em gestos curtos e rápidos, como saltos e arranques, onde não há tempo para atingir a força máxima.",
    formula: "RFD = variação da força ÷ variação do tempo",
    aplicacao:
      "Treina-se com intenção de mover rápido, seja com cargas leves em velocidade, seja com cargas altas com esforço explosivo.",
    sinonimos: "taxa de desenvolvimento de força, RFD",
  },
  {
    id: "fi-potencia-muscular",
    termo: "Potência muscular",
    categoria: "Fisiologia",
    definicao: "O produto da força pela velocidade em uma ação muscular, ou seja, o trabalho muscular realizado por unidade de tempo.",
    resumo: "Força e velocidade juntas: mover carga com rapidez.",
    detalhe:
      "A potência é máxima em cargas intermediárias, onde há bom equilíbrio entre força e velocidade (nem tão leve que sobra velocidade sem força, nem tão pesada que a velocidade despenca). É central em desempenho esportivo e em tarefas como reagir para não cair.",
    formula: "Potência = força × velocidade",
    aplicacao:
      "Escolher cargas que permitam mover rápido com boa técnica costuma otimizar o treino de potência.",
    sinonimos: "potência mecânica muscular",
  },
  {
    id: "fi-condicionamento",
    termo: "Condicionamento",
    categoria: "Fisiologia",
    definicao: "O conjunto de adaptações que melhora a capacidade do organismo de realizar e sustentar esforço.",
    resumo: "O nível de preparo geral para aguentar e repetir o esforço.",
    detalhe:
      "É um termo amplo que reúne aptidão cardiorrespiratória, resistência muscular e tolerância ao esforço. Melhora com treino regular e regride com inatividade. Costuma ser monitorado por respostas como a frequência cardíaca de recuperação.",
    aplicacao:
      "Progredir de forma gradual e consistente é o caminho mais confiável para elevar o condicionamento geral.",
    sinonimos: "aptidão física",
  },
  {
    id: "fi-capacidade-aerobia",
    termo: "Capacidade aeróbia",
    categoria: "Fisiologia",
    definicao: "A capacidade do organismo de produzir energia por vias que utilizam oxigênio para sustentar esforços prolongados.",
    resumo: "A aptidão para esforços longos usando oxigênio como base.",
    detalhe:
      "Depende da eficiência dos sistemas cardiovascular e respiratório e da capacidade oxidativa dos músculos. O VO₂máx é um de seus indicadores. Predomina em atividades de intensidade baixa a moderada e longa duração.",
    aplicacao:
      "Treinos contínuos e intervalados desenvolvem a capacidade aeróbia; o intervalado tende a elevar o VO₂máx com menos tempo total.",
    sinonimos: "aptidão aeróbia, resistência cardiorrespiratória",
  },
  {
    id: "fi-capacidade-anaerobia",
    termo: "Capacidade anaeróbia",
    categoria: "Fisiologia",
    definicao: "A capacidade do organismo de produzir energia por vias que não dependem de oxigênio para sustentar esforços intensos e curtos.",
    resumo: "A aptidão para esforços curtos e muito intensos, sem depender do oxigênio na hora.",
    detalhe:
      "Envolve os sistemas de fosfocreatina (esforços de poucos segundos) e glicolítico (dezenas de segundos até cerca de dois minutos), este último associado ao acúmulo de lactato. Predomina em sprints e séries curtas e intensas.",
    aplicacao:
      "Esforços curtos e máximos com recuperação adequada entre eles desenvolvem a capacidade anaeróbia.",
    sinonimos: "aptidão anaeróbia",
  },
];

/* ======================================================================= */
/* ==================== COMPARADOR DE DEFINIÇÕES ========================= */
/* ======================================================================= */

/**
 * Grupos curados de termos próximos entre si, para o comparador lado a lado.
 * `ids` referencia ids de verbetes em `biblioteca`. `distincao` resume, em uma
 * linha, o que separa os termos (sem travessão no texto visível).
 */
export interface GrupoComparavel {
  titulo: string;
  ids: string[];
  distincao?: string;
}

export const gruposComparaveis: GrupoComparavel[] = [
  {
    titulo: "Força máxima × Força explosiva × Potência muscular",
    ids: ["fi-forca-maxima", "fi-forca-explosiva", "fi-potencia-muscular"],
    distincao:
      "Força máxima é quanta força (independe do tempo); força explosiva é quão rápido a força sobe; potência muscular é força vezes velocidade (o produto dos dois).",
  },
  {
    titulo: "Ação concêntrica × excêntrica × isométrica",
    ids: ["bm-concentrica", "bm-excentrica", "bm-isometrica"],
    distincao:
      "Na concêntrica o músculo encurta e vence a carga; na excêntrica ele alonga e freia a carga; na isométrica gera tensão sem mudar de comprimento.",
  },
  {
    titulo: "Tensão × compressão × cisalhamento × tração",
    ids: ["bm-tensao", "bm-compressao", "bm-cisalhamento", "bm-tracao"],
    distincao:
      "Tração e tensão puxam e afastam (esticam); compressão empurra e aproxima (aperta); cisalhamento desliza uma parte sobre a outra em sentidos opostos.",
  },
  {
    titulo: "Carga × Intensidade × Volume",
    ids: ["p-carga", "p-intensidade", "t-volume"],
    distincao:
      "Intensidade é o quão pesado está em relação ao máximo; volume é o quanto de trabalho total; carga é o estímulo global, que combina os dois (e pode ser externa ou interna).",
  },
  {
    titulo: "Mobilidade × Flexibilidade",
    ids: ["bm-mobilidade", "bm-flexibilidade"],
    distincao:
      "Flexibilidade é a amplitude passiva do tecido; mobilidade é usar essa amplitude de forma ativa e com controle e força.",
  },
  {
    titulo: "Equilíbrio × Estabilidade",
    ids: ["bm-equilibrio", "bm-estabilidade"],
    distincao:
      "Equilíbrio é o estado de não cair (massa sobre a base); estabilidade é a capacidade de manter esse estado e voltar a ele após uma perturbação.",
  },
  {
    titulo: "Adaptação aguda × crônica",
    ids: ["fi-adaptacao-aguda", "fi-adaptacao-cronica"],
    distincao:
      "A aguda é a resposta imediata da sessão e passa com o repouso; a crônica é a mudança estável que se acumula com semanas de treino.",
  },
  {
    titulo: "Capacidade aeróbia × anaeróbia",
    ids: ["fi-capacidade-aerobia", "fi-capacidade-anaerobia"],
    distincao:
      "A aeróbia produz energia com oxigênio para esforços longos; a anaeróbia produz energia sem depender de oxigênio para esforços curtos e intensos.",
  },
  {
    titulo: "Braço de momento × Alavanca × Torque",
    ids: ["t-braco-momento", "bm-alavanca", "t-torque"],
    distincao:
      "A alavanca é o sistema (osso, apoio e força); o braço de momento é a distância da força ao eixo; o torque é o efeito de rotação que resulta (força vezes braço de momento).",
  },
  {
    titulo: "Falha muscular × Proximidade da falha × Esforço",
    ids: ["p-falha-muscular", "p-proximidade-falha", "p-esforco"],
    distincao:
      "Falha é o ponto em que não sai mais repetição; proximidade da falha mede em repetições em reserva o quanto faltava; esforço é o empenho aplicado em relação ao possível no dia.",
  },
  {
    titulo: "Rigidez × Elasticidade",
    ids: ["bm-rigidez", "bm-elasticidade"],
    distincao:
      "Rigidez é o quanto o tecido resiste a se deformar sob carga; elasticidade é a capacidade de voltar à forma original e devolver energia depois de deformado.",
  },
  {
    titulo: "Sobrecarga × Progressão × Sobrecarga progressiva",
    ids: ["p-sobrecarga", "p-progressao", "t-sobrecarga-progressiva"],
    distincao:
      "Sobrecarga é o estímulo acima do habitual; progressão é aumentar a exigência ao longo do tempo; sobrecarga progressiva é o princípio que une os dois de forma planejada.",
  },
];
