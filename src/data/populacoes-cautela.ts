/**
 * Populações e casos clínicos que pedem cautela por exercício.
 * Conteúdo autorado com base em diretrizes (ACSM, OMS, SBC) e em
 * contraindicações conhecidas da biomecânica clínica. A linguagem é
 * deliberadamente prudente: a decisão final é sempre do profissional
 * habilitado (CREF), em conjunto com a equipe médica quando indicado.
 * Nada aqui é diagnóstico ou tratamento.
 */

export interface PopulacaoCautela {
  /** perfil/condição (curto, ex.: "Hipertensão não controlada") */
  perfil: string;
  /** por que pede cautela + o que fazer (evitar, adaptar como, ou liberar com critério) */
  orientacao: string;
}

export const populacoesCautela: Record<string, PopulacaoCautela[]> = {
  /* ------------------------------- LEG PRESS ------------------------------ */
  "leg-press-45": [
    {
      perfil: "Hipertensão não controlada",
      orientacao:
        "Cargas altas com bloqueio respiratório (Valsalva) tendem a elevar muito a pressão arterial. Prefira cargas moderadas com expiração contínua no esforço e exija liberação médica quando a pressão de repouso estiver fora dos critérios das diretrizes (SBC/ACSM).",
    },
    {
      perfil: "Hérnia discal lombar sintomática",
      orientacao:
        "A descida profunda tende a retroverter a pelve e flexionar a lombar sob carga. Limite a amplitude ao ponto em que a lombar mantém contato com o encosto e avalie com a equipe de saúde antes de progredir em fase dolorosa.",
    },
    {
      perfil: "Dor femoropatelar ou artrose de joelho com dor ativa",
      orientacao:
        "A flexão profunda aumenta a compressão femoropatelar. Trabalhe amplitudes parciais indolores, posicione os pés mais altos na plataforma e progrida carga apenas com o joelho assintomático.",
    },
    {
      perfil: "Pós-operatório recente de quadril (artroplastia)",
      orientacao:
        "A flexão de quadril acima de 90 graus pode violar as precauções cirúrgicas. Respeite a amplitude liberada pelo cirurgião e prefira o assento mais reclinado até a liberação plena.",
    },
    {
      perfil: "Gestação no 2º e 3º trimestres",
      orientacao:
        "A flexão profunda comprime o abdome e o assento semirreclinado pode favorecer hipotensão supina. Reduza amplitude e carga, evite o reclínio muito baixo, monitore o conforto e avalie a prescrição com o obstetra.",
    },
    {
      perfil: "Retinopatia diabética proliferativa (ou pós-laser recente)",
      orientacao:
        "Esforço máximo com Valsalva eleva a pressão intraocular e o risco de sangramento. Use cargas moderadas com expiração contínua, evite bloqueio respiratório e condicione progressões à liberação do oftalmologista.",
    },
  ],

  /* ---------------------------- AGACHAMENTO LIVRE ------------------------- */
  "agachamento-livre": [
    {
      perfil: "Lombalgia aguda ou hérnia discal sintomática",
      orientacao:
        "A carga axial somada à inclinação de tronco tende a reagudizar quadros dolorosos. Prefira leg press com amplitude controlada ou goblet squat leve até a remissão, com retorno gradual à barra.",
    },
    {
      perfil: "Osteoporose com fratura vertebral prévia",
      orientacao:
        "Carga axial elevada sobre a coluna pede muito critério. Prefira variações com carga leve e tronco mais vertical (goblet, agachamento no caixote) e exija liberação médica antes de progressões com barra.",
    },
    {
      perfil: "Hipertensão não controlada",
      orientacao:
        "Cargas próximas da máxima induzem Valsalva e picos pressóricos importantes. Mantenha cargas submáximas com respiração controlada até a pressão estar estabilizada com a equipe médica.",
    },
    {
      perfil: "Artrose de joelho com dor na descida",
      orientacao:
        "A flexão profunda sob carga tende a agravar o desconforto. Use box squat para limitar a amplitude ao arco indolor e progrida profundidade antes de progredir carga.",
    },
    {
      perfil: "Restrição importante de mobilidade de tornozelo ou quadril",
      orientacao:
        "A falta de amplitude força compensações lombares sob carga. Trabalhe a mobilidade em paralelo, eleve os calcanhares em apoio estável e prefira variações guiadas até o padrão melhorar.",
    },
    {
      perfil: "Retinopatia diabética proliferativa (ou pós-laser recente)",
      orientacao:
        "Cargas próximas da máxima com apneia elevam a pressão intraocular e o risco de sangramento. Mantenha cargas submáximas com expiração no esforço, sem bloqueio respiratório, e condicione progressões à liberação do oftalmologista.",
    },
  ],

  /* --------------------------- SUPINO RETO BARRA ------------------------- */
  "supino-reto-barra": [
    {
      perfil: "Instabilidade glenoumeral ou luxação recorrente de ombro",
      orientacao:
        "O fundo do movimento coloca o ombro em abdução com rotação externa, posição típica de apreensão. Limite a descida (barra longe do peito), prefira halteres com pegada neutra e avalie com a equipe de saúde antes de amplitudes completas.",
    },
    {
      perfil: "Pós-operatório recente de ombro (manguito, labrum)",
      orientacao:
        "Empurrar horizontal com barra exige liberação explícita do cirurgião ou fisioterapeuta. Até lá, mantenha o trabalho na progressão liberada e reintroduza o supino com carga leve e amplitude parcial.",
    },
    {
      perfil: "Hipertensão não controlada",
      orientacao:
        "Séries pesadas com Valsalva elevam de forma acentuada a resposta pressórica. Use cargas moderadas com expiração no esforço e exija controle pressórico documentado antes de trabalhos máximos.",
    },
    {
      perfil: "Dor acromioclavicular (artrose ou lesão da articulação AC)",
      orientacao:
        "O ponto final da descida tende a comprimir a articulação acromioclavicular. Encurte a amplitude (toque interrompido antes do peito ou floor press) e ajuste a abertura dos cotovelos pela tolerância.",
    },
    {
      perfil: "Gestação a partir do 2º trimestre",
      orientacao:
        "O decúbito dorsal prolongado pode provocar hipotensão supina. Prefira banco levemente inclinado, séries curtas e avalie o programa com o obstetra.",
    },
  ],

  /* --------------------------- CADEIRA EXTENSORA -------------------------- */
  "cadeira-extensora": [
    {
      perfil: "Dor femoropatelar ou condromalacia sintomática",
      orientacao:
        "O estresse femoropatelar em cadeia aberta cresce perto da extensão final. Trabalhe o arco de 90 a 45 graus, com carga leve e progressão guiada pela dor nas 24 horas seguintes.",
    },
    {
      perfil: "Pós-reconstrução de LCA em fase inicial",
      orientacao:
        "A extensão terminal resistida em cadeia aberta aumenta a translação anterior da tíbia. Siga o protocolo do fisioterapeuta e restrinja o arco de movimento conforme a fase, priorizando cadeia fechada.",
    },
    {
      perfil: "Instabilidade ou luxação recorrente de patela",
      orientacao:
        "Arcos que geram apreensão ou sensação de falseio pedem ajuste imediato. Reduza amplitude e carga, fortaleça em ângulos estáveis e avalie com a equipe de saúde antes de amplitudes completas.",
    },
    {
      perfil: "Artrose de joelho com dor ativa",
      orientacao:
        "Cargas altas em arcos dolorosos tendem a piorar o quadro. Prefira cargas leves em amplitude indolor, ou isometrias em ângulos confortáveis, progredindo pela resposta do joelho.",
    },
  ],

  /* ------------------------------ MESA FLEXORA --------------------------- */
  "mesa-flexora": [
    {
      perfil: "Estiramento recente de isquiotibiais",
      orientacao:
        "A flexão resistida pode reagudizar a lesão nas primeiras semanas. Reintroduza com carga leve, amplitude parcial e cadência lenta, progredindo apenas com execução indolor.",
    },
    {
      perfil: "Dor na região posterior do joelho (ex.: cisto de Baker)",
      orientacao:
        "A flexão máxima tende a comprimir a região poplítea. Interrompa a amplitude antes do ponto de desconforto e avalie com a equipe de saúde se a dor persistir.",
    },
    {
      perfil: "Gestação",
      orientacao:
        "A versão deitada exige decúbito ventral, inviável com o abdome gestacional. Prefira flexora sentada, flexão de joelho em pé com caneleira ou no cabo.",
    },
    {
      perfil: "Dor lombar que piora com extensão do tronco",
      orientacao:
        "Levantar a pelve durante o esforço estende a lombar sob tensão. Reduza a carga até conseguir manter a pelve apoiada, ou migre para a versão sentada, que estabiliza melhor o tronco.",
    },
    {
      perfil: "Obesidade grave com desconforto em decúbito ventral",
      orientacao:
        "A posição deitada de bruços pode restringir a respiração e o conforto. Prefira a flexora sentada ou em pé, mantendo o mesmo objetivo muscular.",
    },
  ],

  /* ------------------------- LEVANTAMENTO TERRA ROMENO ------------------- */
  "levantamento-terra-romeno": [
    {
      perfil: "Lombalgia aguda ou radiculopatia (dor irradiada para a perna)",
      orientacao:
        "A inclinação de tronco sob carga tende a reagudizar quadros sintomáticos. Prefira ponte de glúteos ou hip thrust até a remissão e retorne com bastão ou carga muito leve, priorizando o padrão.",
    },
    {
      perfil: "Osteoporose vertebral",
      orientacao:
        "A flexão de tronco sob carga aumenta a compressão anterior das vértebras, mecanismo associado a fraturas. Prefira dobradiça com carga leve e amplitude reduzida, e exija liberação médica antes de progressões com barra.",
    },
    {
      perfil: "Hérnia discal sintomática",
      orientacao:
        "A combinação de flexão de quadril com braço de momento longo eleva a carga discal. Evite em fase sintomática; no retorno, encurte a amplitude (barra até o joelho) e progrida guiado pela dor.",
    },
    {
      perfil: "Isquiotibiais recém-lesionados",
      orientacao:
        "O grande alongamento sob tensão excêntrica reproduz o mecanismo típico de lesão. Reintroduza com amplitude parcial e carga leve apenas quando o alongamento passivo estiver indolor, progredindo de forma gradual.",
    },
    {
      perfil: "Hipertensão não controlada",
      orientacao:
        "O tronco inclinado com carga e preensão intensa eleva a resposta pressórica. Use cargas moderadas com respiração contínua e condicione progressões ao controle pressórico com a equipe médica.",
    },
    {
      perfil: "Retinopatia diabética proliferativa (ou pós-laser recente)",
      orientacao:
        "A posição de tronco baixo com esforço e Valsalva eleva a pressão intraocular. Trabalhe com carga leve, expiração contínua e amplitude reduzida, e condicione progressões à liberação do oftalmologista.",
    },
  ],

  /* -------------------------------- HIP THRUST --------------------------- */
  "hip-thrust": [
    {
      perfil: "Dor lombar que piora em extensão (ex.: espondilolistese)",
      orientacao:
        "A hiperextensão lombar no topo tende a agravar esses quadros. Termine o movimento na extensão neutra do quadril, com costelas para baixo, e reduza a amplitude se o desconforto persistir.",
    },
    {
      perfil: "Gestação a partir do 2º trimestre",
      orientacao:
        "A barra apoiada sobre o baixo ventre é inadequada e o posicionamento fica desconfortável. Substitua por ponte de glúteos com elástico acima dos joelhos e avalie o programa com o obstetra.",
    },
    {
      perfil: "Pubalgia ou dor na região do púbis",
      orientacao:
        "A pressão da barra sobre a pelve tende a incomodar. Use acolchoamento generoso, reduza a carga ou migre temporariamente para ponte de glúteos e extensões no cabo.",
    },
    {
      perfil: "Pós-operatório recente de quadril",
      orientacao:
        "A extensão terminal carregada pede progressão conforme o protocolo cirúrgico. Comece sem carga externa, respeite a amplitude liberada e progrida com aval da equipe de reabilitação.",
    },
    {
      perfil: "Retinopatia diabética proliferativa (ou pós-laser recente)",
      orientacao:
        "Empurrar cargas altas com apneia eleva a pressão intraocular e o risco de sangramento. Use cargas moderadas com expiração no esforço, sem Valsalva, e condicione progressões à liberação do oftalmologista.",
    },
  ],

  /* -------------------------------- AFUNDO ------------------------------- */
  "afundo-passada": [
    {
      perfil: "Dor femoropatelar",
      orientacao:
        "O joelho da frente recebe alta demanda compressiva, sobretudo em passadas curtas. Alongue a passada, limite a profundidade ao arco indolor e considere leg press com amplitude controlada enquanto houver dor.",
    },
    {
      perfil: "Idosos com equilíbrio limitado ou risco de queda",
      orientacao:
        "O padrão unilateral exige controle postural que pode faltar no início. Comece com afundo estático segurando em apoio firme e progrida para a passada apenas com estabilidade consolidada.",
    },
    {
      perfil: "Entorse recente de tornozelo ou joelho",
      orientacao:
        "A instabilidade residual compromete o alinhamento do joelho na descida. Retorne com afundo estático apoiado e amplitude parcial, progredindo conforme o controle e a ausência de dor.",
    },
    {
      perfil: "Artroplastia de joelho ou quadril",
      orientacao:
        "A amplitude e a carga toleradas variam com o tipo de prótese e o tempo de cirurgia. Adapte profundidade e apoio conforme a orientação da equipe de reabilitação antes de progressões com carga.",
    },
  ],

  /* ------------------------------ PUXADA ALTA ---------------------------- */
  "puxada-alta": [
    {
      perfil: "Síndrome do impacto ou dor de ombro em elevação máxima",
      orientacao:
        "A posição de braços totalmente elevados pode provocar sintomas. Encurte a fase de alongamento no topo, prefira pegada neutra mais fechada e progrida a amplitude conforme a tolerância.",
    },
    {
      perfil: "Instabilidade glenoumeral (luxação anterior recorrente)",
      orientacao:
        "Evite a puxada atrás da nuca, que leva o ombro à posição de apreensão. Prefira a puxada à frente com pegada neutra ou supinada e amplitude controlada, com avaliação da equipe de saúde.",
    },
    {
      perfil: "Pós-operatório de ombro",
      orientacao:
        "A tração vertical com braço elevado costuma entrar tarde nos protocolos. Exija liberação do cirurgião ou fisioterapeuta e reintroduza com carga leve, amplitude parcial e cadência lenta.",
    },
    {
      perfil: "Epicondilite ou dor de cotovelo com pegada pronada",
      orientacao:
        "A tração repetida tende a irritar os tendões do cotovelo. Troque para pegada neutra, reduza a carga e monitore a resposta nas 24 horas seguintes antes de progredir.",
    },
  ],

  /* ------------------------------ REMADA BAIXA --------------------------- */
  "remada-baixa": [
    {
      perfil: "Lombalgia aguda ou hérnia discal sintomática",
      orientacao:
        "A posição sentada com quadril flexionado somada ao balanço de tronco eleva a carga lombar. Prefira remada com apoio de peito ou unilateral apoiada no banco, com carga que permita tronco estável.",
    },
    {
      perfil: "Hérnia inguinal ou umbilical não corrigida",
      orientacao:
        "A tração com Valsalva aumenta a pressão intra-abdominal. Use cargas leves com expiração contínua no esforço e avalie a correção cirúrgica antes de trabalhos pesados.",
    },
    {
      perfil: "Pós-operatório abdominal recente",
      orientacao:
        "O esforço de tração exige forte ativação da parede abdominal. Aguarde a liberação da equipe cirúrgica e retorne com resistências leves, progredindo pela resposta local.",
    },
    {
      perfil: "Encurtamento importante de isquiotibiais com dor ao sentar estendido",
      orientacao:
        "A posição de pernas estendidas tende a puxar a pelve em retroversão e arredondar a lombar. Flexione levemente os joelhos, use apoio para os pés mais próximo e priorize o tronco neutro.",
    },
  ],

  /* -------------------------- DESENVOLVIMENTO OMBROS --------------------- */
  "desenvolvimento-ombros": [
    {
      perfil: "Síndrome do impacto subacromial",
      orientacao:
        "Empurrar acima da cabeça em dor tende a perpetuar o quadro. Trabalhe amplitude parcial indolor, pegada neutra com halteres ou landmine press, e progrida a elevação conforme a tolerância.",
    },
    {
      perfil: "Instabilidade glenoumeral",
      orientacao:
        "A posição alta e abduzida desafia a estabilidade da articulação. Prefira trajetória mais à frente do corpo (scapular plane), amplitude limitada e cargas moderadas, com avaliação da equipe de saúde.",
    },
    {
      perfil: "Hipertensão não controlada",
      orientacao:
        "Trabalhar com os braços acima da cabeça eleva a resposta pressórica, sobretudo com Valsalva. Use cargas moderadas com respiração fluida e exija controle pressórico antes de progressões pesadas.",
    },
    {
      perfil: "Dor cervical ou radiculopatia cervical",
      orientacao:
        "A carga acima da cabeça com compensações posturais tende a agravar sintomas. Prefira versão sentada com apoio de tronco, cargas leves e interrompa se houver irradiação para o braço.",
    },
    {
      perfil: "Pós-operatório de ombro",
      orientacao:
        "O empurrar vertical costuma ser dos últimos padrões liberados. Reintroduza somente com liberação explícita da equipe, começando com amplitude parcial e carga leve.",
    },
  ],

  /* ------------------------------ ROSCA DIRETA --------------------------- */
  "rosca-direta": [
    {
      perfil: "Epicondilite medial (dor na face interna do cotovelo)",
      orientacao:
        "A flexão resistida repetida tende a irritar os tendões flexores. Reduza carga e volume, prefira pegada neutra (rosca martelo) e cadência lenta, progredindo pela resposta nas 24 horas.",
    },
    {
      perfil: "Tendinopatia do bíceps (dor anterior de ombro)",
      orientacao:
        "A tensão na porção longa do bíceps pode reproduzir a dor. Encurte a amplitude no fundo, mantenha o cotovelo junto ao corpo e ajuste a carga pelo limiar de desconforto.",
    },
    {
      perfil: "Dor de punho ou síndrome do túnel do carpo",
      orientacao:
        "A pegada supinada fixa e a preensão prolongada podem agravar sintomas. Prefira halteres com leve rotação livre do punho ou pegada neutra, e evite barras retas rígidas em fase sintomática.",
    },
    {
      perfil: "Lombalgia com tendência a balançar o tronco",
      orientacao:
        "O impulso de tronco transfere carga à lombar. Encoste as costas na parede ou use banco com apoio, e reduza a carga até eliminar o balanço.",
    },
  ],

  /* ------------------------------ TRÍCEPS POLIA -------------------------- */
  "triceps-polia": [
    {
      perfil: "Tendinopatia do tríceps ou dor no olécrano",
      orientacao:
        "A extensão terminal sob carga concentra tensão na inserção do tríceps. Evite travar o cotovelo, trabalhe o arco médio do movimento e progrida a carga pela resposta local.",
    },
    {
      perfil: "Epicondilite lateral (cotovelo de tenista)",
      orientacao:
        "Estabilizar o punho contra a barra tende a irritar os extensores do antebraço. Prefira a corda com punho neutro, reduza a carga e monitore a dor nas 24 horas seguintes.",
    },
    {
      perfil: "Dor de punho em pronação",
      orientacao:
        "A barra reta força uma pronação fixa que pode incomodar. Troque por corda ou barra V, que permitem posição mais neutra do punho.",
    },
    {
      perfil: "Hipermobilidade com hiperextensão de cotovelo",
      orientacao:
        "Travar o cotovelo em hiperextensão sob carga estressa estruturas passivas. Ensine a parar na extensão quase completa e priorize cadência controlada em vez de carga.",
    },
  ],

  /* --------------------------- CAMINHADA INCLINADA ------------------------ */
  "caminhada-esteira": [
    {
      perfil: "Doença coronariana ou cardiopatia conhecida",
      orientacao:
        "Exercício aeróbio estruturado exige estratificação de risco e liberação médica prévia (ACSM). Guie a intensidade por PSE e teste da fala e interrompa diante de dor torácica, tontura ou dispneia desproporcional.",
    },
    {
      perfil: "Doença arterial periférica (claudicação)",
      orientacao:
        "A dor na panturrilha ao caminhar é esperada e o treino intervalado de caminhada é conduta reconhecida. Caminhe até dor moderada, pause até aliviar e repita, sempre com avaliação médica prévia do quadro vascular.",
    },
    {
      perfil: "Neuropatia diabética com perda de sensibilidade plantar",
      orientacao:
        "A descarga repetida pode gerar lesões que o aluno não sente. Exija calçado adequado e inspeção diária dos pés; com úlcera plantar ativa, prefira bicicleta ou meio aquático até cicatrizar.",
    },
    {
      perfil: "Risco de queda ou equilíbrio muito limitado",
      orientacao:
        "A esteira em movimento pode surpreender quem tem controle postural frágil. Comece em velocidade baixa com supervisão próxima e apoio leve das mãos, ou prefira bicicleta até ganhar confiança.",
    },
    {
      perfil: "Artrose de joelho ou quadril com dor que piora ao passo",
      orientacao:
        "O volume de passos pode agravar a dor articular. Reduza tempo e velocidade, priorize inclinação leve em vez de velocidade e considere bicicleta ou marcha aquática enquanto a dor limitar.",
    },
  ],

  /* --------------------------- BICICLETA ERGOMÉTRICA ---------------------- */
  "bicicleta-ergometrica": [
    {
      perfil: "Cardiopatia instável ou descompensada",
      orientacao:
        "Qualquer trabalho aeróbio exige estabilidade clínica documentada. Condicione o início à liberação do cardiologista e mantenha intensidade leve guiada por PSE e teste da fala.",
    },
    {
      perfil: "Dor lombar que piora na postura sentada",
      orientacao:
        "A flexão de tronco prolongada no selim tende a agravar o desconforto. Eleve o guidão para um tronco mais ereto, use sessões mais curtas e considere a bicicleta horizontal com apoio de encosto.",
    },
    {
      perfil: "Dor perineal ou pós-operatório recente de próstata e períneo",
      orientacao:
        "A pressão do selim sobre o períneo pode ser inadequada nessas condições. Aguarde a liberação médica, use selim largo e acolchoado ou prefira a bicicleta horizontal.",
    },
    {
      perfil: "Prótese de quadril com precauções de flexão",
      orientacao:
        "O topo da pedalada pode ultrapassar a flexão de quadril permitida. Suba o banco para reduzir o pico de flexão e confirme a amplitude liberada com a equipe de reabilitação.",
    },
  ],

  /* --------------------------------- ELÍPTICO ----------------------------- */
  "eliptico": [
    {
      perfil: "Equilíbrio limitado ou risco de queda",
      orientacao:
        "A plataforma em movimento contínuo exige controle postural em pé. Prefira a bicicleta nesses casos, ou use o elíptico apenas com supervisão próxima e mãos firmes nas alças.",
    },
    {
      perfil: "Tontura, labirintopatia ou vertigem posicional",
      orientacao:
        "O movimento cíclico em pé pode desencadear sintomas. Em fase sintomática prefira a bicicleta; no retorno, comece com sessões curtas segurando as alças fixas.",
    },
    {
      perfil: "Dor femoropatelar que piora com flexão sustentada",
      orientacao:
        "O joelho trabalha em flexão contínua durante todo o ciclo. Reduza a resistência, encurte a sessão e monitore a resposta; se a dor persistir, alterne com caminhada plana ou bicicleta com banco alto.",
    },
    {
      perfil: "Destreinamento grave sem avaliação prévia",
      orientacao:
        "A coordenação de braços e pernas somada ao esforço de corpo todo pode superar a capacidade inicial. Comece com resistência mínima e poucos minutos, após triagem de risco (ACSM) e com o teste da fala como teto.",
    },
  ],

  /* ------------------------------ MARCHA AQUÁTICA ------------------------- */
  "marcha-aquatica": [
    {
      perfil: "Feridas abertas, úlceras ou infecções de pele",
      orientacao:
        "O meio aquático é contraindicado até a cicatrização completa, pelo risco de infecção. Mantenha o trabalho no solo com baixo impacto (bicicleta) e retorne à piscina com a pele íntegra.",
    },
    {
      perfil: "Insuficiência cardíaca",
      orientacao:
        "A imersão até o peito aumenta o retorno venoso e a pré-carga cardíaca. Exija liberação do cardiologista; quando liberado, prefira água mais rasa (altura do umbigo) e intensidades leves.",
    },
    {
      perfil: "Epilepsia não controlada",
      orientacao:
        "Crises dentro da água envolvem risco grave. Condicione a prática ao controle clínico documentado e à supervisão constante de profissional à beira da piscina.",
    },
    {
      perfil: "Incontinência urinária ou fecal não manejada",
      orientacao:
        "Por higiene coletiva e conforto do aluno, avalie o manejo adequado (dispositivos, esvaziamento prévio) com a equipe de saúde antes das sessões em piscina.",
    },
    {
      perfil: "Otite ou infecção ativa de ouvido",
      orientacao:
        "A imersão tende a agravar o quadro. Aguarde a resolução com o médico e, no retorno, considere proteção auricular se houver recorrência.",
    },
  ],

  /* ------------------------------ SENTAR E LEVANTAR ----------------------- */
  "sentar-levantar": [
    {
      perfil: "Hipotensão ortostática ou tontura ao levantar",
      orientacao:
        "As transições repetidas podem provocar sintomas. Use ritmo lento com pausa breve no topo, mantenha apoio de mãos ao alcance e interrompa diante de escurecimento visual ou tontura.",
    },
    {
      perfil: "Prótese de quadril recente com precauções de flexão",
      orientacao:
        "Assentos baixos levam a flexão de quadril além do permitido. Use assento alto (quadril acima da linha dos joelhos) e reduza a altura apenas com liberação da equipe de reabilitação.",
    },
    {
      perfil: "Artrose de joelho com dor na subida",
      orientacao:
        "A demanda do quadríceps cresce quanto mais baixo o assento. Eleve o assento com almofadas até o arco indolor e permita apoio das mãos nos joelhos como regressão válida.",
    },
    {
      perfil: "Fragilidade grave (não levanta sem ajuda)",
      orientacao:
        "O exercício segue valioso, mas exige assistência. Use assento bem alto, apoio de braços firme e auxílio externo, reduzindo a ajuda de forma progressiva conforme a força melhora.",
    },
  ],

  /* ------------------------------- PONTE DE GLÚTEOS ----------------------- */
  "ponte-gluteos": [
    {
      perfil: "Dor lombar que piora em extensão (ex.: espondilolistese)",
      orientacao:
        "Arquear além do alinhamento no topo tende a agravar. Ensine a terminar quando joelho, quadril e ombro se alinham, com glúteo contraído e costelas para baixo, sem buscar altura extra.",
    },
    {
      perfil: "Gestação a partir do 2º trimestre",
      orientacao:
        "O decúbito dorsal prolongado pode provocar hipotensão supina. Use séries curtas com pausas sentada, incline o tronco em cunha e avalie com o obstetra a permanência do exercício no programa.",
    },
    {
      perfil: "Pós-operatório abdominal ou cesárea recente",
      orientacao:
        "A cocontração do core pode tensionar a região operada. Aguarde a liberação da equipe cirúrgica e retorne com amplitude parcial e poucas repetições.",
    },
    {
      perfil: "Hipertensos que prendem a respiração na pausa isométrica",
      orientacao:
        "A isometria no topo com apneia eleva a resposta pressórica. Ensine a expirar durante a pausa e mantenha pausas curtas (1 a 2 segundos) até o padrão respiratório estar automático.",
    },
  ],

  /* -------------------------------- PRANCHA FRONTAL ----------------------- */
  "prancha-frontal": [
    {
      perfil: "Hipertensão não controlada",
      orientacao:
        "Isometria prolongada com apneia eleva de forma acentuada a pressão arterial. Use séries curtas (10 a 20 segundos) com respiração contínua audível e condicione progressões de tempo ao controle pressórico com a equipe médica.",
    },
    {
      perfil: "Gestação avançada",
      orientacao:
        "O decúbito ventral prolongado e a pressão intra-abdominal são inadequados. Substitua por prancha inclinada com as mãos no banco ou na parede e avalie o programa com o obstetra.",
    },
    {
      perfil: "Diástase abdominal significativa no pós-parto",
      orientacao:
        "A carga sobre a linha alba pode agravar o abaulamento. Observe a parede abdominal durante o esforço; se houver protrusão, regrida para versões inclinadas e progrida com acompanhamento especializado.",
    },
    {
      perfil: "Dor de punho ou síndrome do túnel do carpo",
      orientacao:
        "A prancha alta carrega os punhos em extensão máxima. Migre para a prancha nos antebraços ou use halteres hexagonais como apoio para manter o punho neutro.",
    },
    {
      perfil: "Lombalgia sem controle da posição neutra",
      orientacao:
        "O quadril caído coloca a lombar em hiperextensão passiva sob carga. Regrida para prancha com joelhos apoiados ou inclinada até o aluno sustentar a linha neutra com folga.",
    },
  ],

  /* ---------------------------------- DEAD BUG ---------------------------- */
  "dead-bug": [
    {
      perfil: "Gestação a partir do 2º trimestre",
      orientacao:
        "O decúbito dorsal prolongado pode causar hipotensão supina. Prefira o bird dog (quatro apoios), que treina o mesmo controle contralateral, e avalie com o obstetra.",
    },
    {
      perfil: "Pós-operatório abdominal ou cesárea recente",
      orientacao:
        "A ativação do core contra o torque dos membros tensiona a parede abdominal. Aguarde a liberação cirúrgica e retorne com amplitude reduzida (só pernas, joelhos dobrados).",
    },
    {
      perfil: "Dor cervical com tensão ao deitar",
      orientacao:
        "Alguns alunos tensionam o pescoço tentando manter a cabeça posicionada. Apoie a cabeça em almofada baixa e oriente o queixo levemente recolhido, sem esforço cervical.",
    },
    {
      perfil: "Dor de quadril em flexão a 90 graus (ex.: impacto femoroacetabular)",
      orientacao:
        "A posição inicial mantém o quadril flexionado próximo do arco sintomático. Reduza o ângulo de partida dos joelhos e a amplitude da extensão, progredindo pelo conforto.",
    },
  ],

  /* ------------------------------- REMADA ELÁSTICA ------------------------ */
  "remada-elastica": [
    {
      perfil: "Alergia ao látex",
      orientacao:
        "A maioria das bandas é de látex e o contato repetido pode desencadear reações. Use bandas de TPE ou tecido (sem látex) e verifique a composição antes da primeira sessão.",
    },
    {
      perfil: "Dor aguda de ombro na trajetória da puxada",
      orientacao:
        "A dor durante o arco indica necessidade de ajuste imediato. Mude o ângulo de ancoragem, encurte a amplitude e reduza a tensão da banda; se a dor persistir, avalie com a equipe de saúde.",
    },
    {
      perfil: "Pós-operatório de ombro em fase inicial",
      orientacao:
        "O elástico é ferramenta comum de reabilitação, mas a fase importa. Siga a resistência e a amplitude definidas pelo fisioterapeuta e não antecipe progressões por conta própria.",
    },
    {
      perfil: "Equilíbrio limitado na posição em pé",
      orientacao:
        "A tração do elástico pode desestabilizar quem tem controle postural frágil. Execute sentado em cadeira firme ou com apoio lateral, mantendo o mesmo padrão de retração escapular.",
    },
  ],

  /* --------------------------- PANTURRILHA EM PÉ -------------------------- */
  "panturrilha-em-pe": [
    {
      perfil: "Suspeita ou diagnóstico de trombose venosa profunda ativa",
      orientacao:
        "Dor e edema unilateral recente na panturrilha exigem avaliação médica imediata antes de qualquer exercício local. Não prescreva bombeamento de panturrilha até a exclusão ou liberação do quadro.",
    },
    {
      perfil: "Tendinopatia do calcâneo (Aquiles) em fase reativa",
      orientacao:
        "O alongamento no degrau e as cargas altas tendem a irritar o tendão nessa fase. Comece com isometrias e a versão sentada, no solo plano, progredindo carga e amplitude guiado pela dor nas 24 horas.",
    },
    {
      perfil: "Pós-operatório ou ruptura recente do tendão calcâneo",
      orientacao:
        "A progressão de flexão plantar carregada segue protocolo rígido de reabilitação. Reintroduza somente conforme a fase liberada pela equipe, começando bilateral, no solo e sem carga extra.",
    },
    {
      perfil: "Fascite plantar dolorosa",
      orientacao:
        "A descida profunda no degrau tensiona a fáscia e pode agravar a dor, sobretudo pela manhã. Execute no solo plano com amplitude confortável e reintroduza o degrau de forma gradual.",
    },
    {
      perfil: "Equilíbrio limitado no degrau",
      orientacao:
        "A borda do degrau adiciona risco de queda desnecessário. Execute no solo com as mãos em apoio firme; o degrau é progressão, não requisito.",
    },
  ],
};

export function getPopulacoesCautela(slug: string): PopulacaoCautela[] {
  return populacoesCautela[slug] ?? [];
}
