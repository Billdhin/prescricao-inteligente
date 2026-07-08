import type { Exercise } from "./types";
import { extraExercises } from "./exercises-extra";

export const exercises: Exercise[] = [
  /* ------------------------------- LEG PRESS ------------------------------ */
  {
    id: "e1",
    slug: "leg-press-45",
    nome: "Leg press 45°",
    grupoMuscular: "Membros inferiores",
    equipamento: "Máquina",
    objetivo: ["Hipertrofia", "Força", "Aprendizado técnico", "Reabilitação/retorno", "Emagrecimento"],
    nivel: "Iniciante",
    articulacaoPredominante: "Joelho e quadril",
    restricoes: [],
    premium: false,
    resumoPratico:
      "Alternativa guiada ao agachamento — em geral favorece aprendizado inicial e reduz demanda sobre a coluna lombar quando a execução respeita a amplitude confortável.",
    anguloArticular: "95°",
    imagem: "/exercises/leg-press-45.webp",
    imagemAnalise: "/exercises/leg-press-45-analysis.webp",
    ativacao: [
      { musculo: "Quadríceps", percentual: 92, papel: "primário" },
      { musculo: "Glúteo máximo", percentual: 76, papel: "sinergista" },
      { musculo: "Posteriores de coxa", percentual: 58, papel: "sinergista" },
      { musculo: "Adutores", percentual: 44, papel: "estabilizador" },
    ],
    indiceEficiencia: {
      score: 82,
      metrics: [
        { nome: "Quadríceps", valor: 92, tipo: "positivo" },
        { nome: "Glúteos", valor: 76, tipo: "positivo" },
        { nome: "Estabilidade", valor: 78, tipo: "positivo" },
        { nome: "Demanda de joelho", valor: 72, tipo: "positivo" },
        { nome: "Demanda lombar", valor: 34, tipo: "cautela" },
        { nome: "Complexidade técnica", valor: 41, tipo: "cautela" },
      ],
    },
    fases: [
      { nome: "Excêntrica", descricao: "Descida controlada com quadris e joelhos flexionando em conjunto." },
      { nome: "Transição", descricao: "Ponto mais baixo confortável, sem perder contato lombar com o encosto." },
      { nome: "Concêntrica", descricao: "Empurra a plataforma sem travar (hiperestender) os joelhos no fim." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 58,
        y: 43,
        titulo: "Alinhamento do joelho",
        camadas: {
          resumo: "O joelho tende a acompanhar a linha do pé, sem colapsar para dentro.",
          biomecanica: "Valgo dinâmico aumenta o estresse em estruturas mediais do joelho.",
          fisiologia: "Boa distribuição de força melhora o recrutamento do quadríceps e glúteo.",
          evidencia: "Observações práticas associam controle do valgo a menor desconforto relatado.",
          cuidados: "Ajuste a largura dos pés na plataforma se houver tendência ao colapso.",
        },
      },
      {
        id: "h2",
        x: 30,
        y: 56,
        titulo: "Contato lombar",
        camadas: {
          resumo: "A lombar deve permanecer em contato com o encosto durante a descida.",
          biomecanica: "Perder o contato gera flexão lombar sob carga, elevando a demanda na coluna.",
          fisiologia: "Manter neutralidade reduz a sobrecarga passiva em estruturas posteriores.",
          evidencia: "Reduzir amplitude ao ponto de manter o contato tende a ser mais prudente.",
          cuidados: "Se a bacia 'enrola', diminua a amplitude antes de aumentar a carga.",
        },
      },
      {
        id: "h3",
        x: 68,
        y: 32,
        titulo: "Trajetória de força",
        camadas: {
          resumo: "A força se dirige ao longo do eixo da plataforma, distribuída nos dois pés.",
          biomecanica: "Empurrar mais com um lado cria assimetria de carga entre os membros.",
          fisiologia: "Distribuição simétrica favorece adaptação equilibrada de força.",
          evidencia: "Percepção de esforço equilibrada é um bom indicador prático.",
          cuidados: "Corrija assimetrias com cadência e amplitude antes de progredir carga.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Aprendizado inicial do padrão de agachamento com carga guiada.",
        "Situações em que se busca reduzir a demanda sobre a coluna lombar.",
        "Volumes maiores com menor custo técnico.",
      ],
      quandoEvitar: [
        "Objetivo específico de transferência para levantamento livre com barra.",
        "Desconforto agudo em joelho ou quadril na amplitude escolhida.",
      ],
      errosComuns: [
        "Descer além do ponto em que a pelve começa a se retroverter.",
        "Travar completamente os joelhos ao final da fase concêntrica.",
        "Escolher amplitude única sem considerar a mobilidade individual.",
      ],
      variacoes: [
        "Leg press horizontal — perfil de carga diferente.",
        "Leg press unilateral — corrige assimetrias.",
        "Leg press com pés altos — desloca ênfase para glúteos e posteriores.",
      ],
    },
    conteudo: {
      visaoGeral:
        "O leg press 45° é frequentemente utilizado como porta de entrada ao trabalho de membros inferiores, oferecendo um padrão guiado que tende a facilitar o aprendizado da mecânica do agachamento.",
      biomecanica:
        "A máquina fixa a trajetória, o que reduz a exigência de estabilização de tronco e tende a diminuir a demanda sobre a coluna lombar em comparação ao agachamento livre.",
      fisiologia:
        "Com boa amplitude e cadência, o exercício permite acumular volume de quadríceps e glúteos com menor custo técnico e coordenativo.",
      prescricaoPratica:
        "Em geral, comece pela amplitude confortável que mantém o contato lombar, priorize a cadência excêntrica e progrida carga apenas quando a execução estiver consistente.",
    },
    trustLevel: "tendência prática",
    temCena: true,
  },

  /* ---------------------------- AGACHAMENTO LIVRE ------------------------- */
  {
    id: "e2",
    slug: "agachamento-livre",
    imagem: "/exercises/agachamento-livre.webp",
    imagemAnalise: "/exercises/agachamento-livre-analysis.webp",
    nome: "Agachamento livre",
    grupoMuscular: "Membros inferiores",
    equipamento: "Barra",
    objetivo: ["Força", "Hipertrofia", "Aprendizado técnico", "Emagrecimento"],
    nivel: "Avançado",
    articulacaoPredominante: "Quadril, joelho e tornozelo",
    restricoes: ["Requer mobilidade de tornozelo e quadril"],
    premium: true,
    resumoPratico:
      "Padrão global multiarticular — em geral favorece força integrada e coordenação, exigindo mais controle técnico e mobilidade que variações guiadas.",
    anguloArticular: "115°",
    ativacao: [
      { musculo: "Quadríceps", percentual: 88, papel: "primário" },
      { musculo: "Glúteo máximo", percentual: 82, papel: "primário" },
      { musculo: "Eretores da espinha", percentual: 70, papel: "estabilizador" },
      { musculo: "Posteriores de coxa", percentual: 60, papel: "sinergista" },
    ],
    indiceEficiencia: {
      score: 88,
      metrics: [
        { nome: "Quadríceps", valor: 88, tipo: "positivo" },
        { nome: "Glúteos", valor: 82, tipo: "positivo" },
        { nome: "Padrão funcional", valor: 90, tipo: "positivo" },
        { nome: "Demanda lombar", valor: 62, tipo: "cautela" },
        { nome: "Complexidade técnica", valor: 74, tipo: "cautela" },
        { nome: "Requisito de mobilidade", valor: 68, tipo: "cautela" },
      ],
    },
    fases: [
      { nome: "Excêntrica", descricao: "Descida com quadril e joelhos flexionando de forma coordenada." },
      { nome: "Buraco", descricao: "Ponto mais baixo com tronco firme e coluna em posição neutra." },
      { nome: "Concêntrica", descricao: "Subida conduzida por quadril e joelhos ao mesmo tempo." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 56,
        y: 46,
        titulo: "Inclinação de tronco",
        camadas: {
          resumo: "Certa inclinação do tronco é natural e varia com as proporções do indivíduo.",
          biomecanica: "A inclinação equilibra os momentos no quadril e no joelho.",
          fisiologia: "Ajusta a divisão de trabalho entre quadríceps e cadeia posterior.",
          evidencia: "Não existe um ângulo único ideal — depende da antropometria.",
          cuidados: "Evite flexão lombar acentuada sob carga elevada.",
        },
      },
      {
        id: "h2",
        x: 44,
        y: 62,
        titulo: "Trajetória do joelho",
        camadas: {
          resumo: "Os joelhos avançam sobre os pés, acompanhando a direção deles.",
          biomecanica: "Restringir excessivamente o avanço pode aumentar a flexão de tronco.",
          fisiologia: "O avanço adequado distribui a demanda entre joelho e quadril.",
          evidencia: "Mobilidade de tornozelo influencia diretamente esse padrão.",
          cuidados: "Não force amplitude à custa de perder a posição neutra da coluna.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Desenvolvimento de força integrada e padrão funcional.",
        "Quando há mobilidade suficiente de tornozelo, quadril e coluna torácica.",
        "Programas com foco em transferência para tarefas do dia a dia e esporte.",
      ],
      quandoEvitar: [
        "Dor lombar aguda ou episódios recentes.",
        "Restrição significativa de mobilidade que force compensações desconfortáveis.",
      ],
      errosComuns: [
        "Flexão lombar acentuada no ponto mais baixo sob carga elevada.",
        "Descolamento dos calcanhares por falta de mobilidade de tornozelo.",
        "Escolher amplitude e carga incompatíveis com o nível técnico.",
      ],
      variacoes: [
        "Front squat — enfatiza tronco vertical e quadríceps.",
        "Box squat — controla amplitude e pausa.",
        "Goblet squat — versão didática com halter à frente.",
      ],
    },
    conteudo: {
      visaoGeral:
        "O agachamento livre é um padrão global multiarticular amplamente utilizado para desenvolvimento de força e hipertrofia de membros inferiores.",
      biomecanica:
        "Por não ter trajetória guiada, exige estabilização ativa de tronco e coordenação entre quadril, joelho e tornozelo — o que aumenta a demanda técnica.",
      fisiologia:
        "O alto envolvimento de grandes grupos e da musculatura estabilizadora tende a favorecer respostas de força e transferência funcional.",
      prescricaoPratica:
        "Em geral, priorize domínio técnico e amplitude controlada antes de progredir carga; adapte a variação à mobilidade e ao histórico do indivíduo.",
    },
    trustLevel: "princípio biomecânico",
    temCena: true,
  },

  /* --------------------------- SUPINO RETO BARRA ------------------------- */
  {
    id: "e3",
    slug: "supino-reto-barra",
    imagem: "/exercises/supino-reto-barra.webp",
    imagemAnalise: "/exercises/supino-reto-barra-analysis.webp",
    nome: "Supino reto com barra",
    grupoMuscular: "Peitorais",
    equipamento: "Barra",
    objetivo: ["Força", "Hipertrofia", "Emagrecimento"],
    nivel: "Intermediário",
    articulacaoPredominante: "Ombro e cotovelo",
    restricoes: ["Ombro sensível"],
    premium: true,
    resumoPratico:
      "Empurrar horizontal com barra — em geral favorece força de tronco superior, exigindo controle escapular e amplitude adaptada ao ombro.",
    anguloArticular: "80°",
    ativacao: [
      { musculo: "Peitoral maior", percentual: 90, papel: "primário" },
      { musculo: "Tríceps", percentual: 68, papel: "sinergista" },
      { musculo: "Deltoide anterior", percentual: 62, papel: "sinergista" },
      { musculo: "Serrátil anterior", percentual: 40, papel: "estabilizador" },
    ],
    indiceEficiencia: {
      score: 80,
      metrics: [
        { nome: "Peitoral", valor: 90, tipo: "positivo" },
        { nome: "Tríceps", valor: 68, tipo: "positivo" },
        { nome: "Estabilidade escapular", valor: 64, tipo: "positivo" },
        { nome: "Demanda de ombro", valor: 66, tipo: "cautela" },
        { nome: "Complexidade técnica", valor: 58, tipo: "cautela" },
      ],
    },
    fases: [
      { nome: "Excêntrica", descricao: "Descida da barra até o peito com cotovelos controlados." },
      { nome: "Toque", descricao: "Leve pausa no peito sem quicar a barra." },
      { nome: "Concêntrica", descricao: "Empurra a barra em trajetória levemente diagonal." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 58,
        y: 47,
        titulo: "Posição do ombro",
        camadas: {
          resumo: "As escápulas permanecem retraídas e deprimidas ('encaixadas').",
          biomecanica: "O encaixe escapular oferece base estável e protege a articulação.",
          fisiologia: "Melhora a transmissão de força do tronco para a barra.",
          evidencia: "Amplitude excessiva pode aumentar desconforto em ombros sensíveis.",
          cuidados: "Ajuste a amplitude e a abertura de cotovelos conforme a tolerância.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Desenvolvimento de força de empurrar horizontal.",
        "Base para progressões de tronco superior.",
      ],
      quandoEvitar: [
        "Desconforto agudo de ombro na amplitude escolhida.",
        "Ausência de controle escapular básico.",
      ],
      errosComuns: [
        "Abrir demais os cotovelos, elevando a demanda no ombro.",
        "Perder a retração escapular ao empurrar.",
        "Quicar a barra no peito para vencer a carga.",
      ],
      variacoes: [
        "Supino com halteres — maior liberdade articular.",
        "Supino inclinado — ênfase na porção clavicular.",
        "Supino fechado — mais tríceps.",
      ],
    },
    conteudo: {
      visaoGeral:
        "O supino reto com barra é um dos principais exercícios de empurrar horizontal para tronco superior.",
      biomecanica:
        "A barra impõe uma trajetória comum aos dois lados; o controle escapular define a estabilidade e a segurança do ombro.",
      fisiologia:
        "O alto envolvimento do peitoral e sinergistas favorece ganhos de força e hipertrofia da região.",
      prescricaoPratica:
        "Em geral, adapte amplitude e abertura de cotovelos ao ombro do indivíduo e priorize consistência antes de cargas máximas.",
    },
    trustLevel: "tendência prática",
    temCena: true,
  },

  /* --------------------------- CADEIRA EXTENSORA -------------------------- */
  {
    id: "e4",
    slug: "cadeira-extensora",
    imagem: "/exercises/cadeira-extensora.webp",
    imagemAnalise: "/exercises/cadeira-extensora-analysis.webp",
    nome: "Cadeira extensora",
    grupoMuscular: "Membros inferiores",
    equipamento: "Máquina",
    objetivo: ["Hipertrofia", "Reabilitação/retorno", "Resistência muscular"],
    nivel: "Iniciante",
    articulacaoPredominante: "Joelho",
    restricoes: [],
    premium: false,
    resumoPratico:
      "Isolamento de quadríceps guiado — em geral útil para volume localizado e para retorno progressivo com baixa demanda técnica.",
    ativacao: [
      { musculo: "Quadríceps", percentual: 94, papel: "primário" },
      { musculo: "Reto femoral", percentual: 70, papel: "sinergista" },
    ],
    indiceEficiencia: {
      score: 70,
      metrics: [
        { nome: "Quadríceps", valor: 94, tipo: "positivo" },
        { nome: "Isolamento", valor: 88, tipo: "positivo" },
        { nome: "Demanda de joelho", valor: 58, tipo: "cautela" },
        { nome: "Demanda lombar", valor: 12, tipo: "positivo" },
        { nome: "Complexidade técnica", valor: 22, tipo: "positivo" },
      ],
    },
    fases: [
      { nome: "Concêntrica", descricao: "Estende o joelho até quase a extensão completa, sem travar." },
      { nome: "Pico", descricao: "Breve contração no topo." },
      { nome: "Excêntrica", descricao: "Retorno controlado sem deixar o peso 'cair'." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 45,
        y: 63,
        titulo: "Amplitude no joelho",
        camadas: {
          resumo: "Trabalhe a amplitude confortável, evitando hiperextensão forçada.",
          biomecanica: "A extensão terminal aumenta a força na articulação femoropatelar.",
          fisiologia: "Amplitude adequada favorece tensão no quadríceps sem desconforto.",
          evidencia: "Em retorno, amplitudes parciais indolores tendem a ser bem toleradas.",
          cuidados: "Reduza amplitude se houver desconforto anterior no joelho.",
        },
      },
    ],
    blocos: {
      quandoUsar: [
        "Volume adicional de quadríceps com baixa exigência técnica.",
        "Retorno progressivo com controle de carga.",
      ],
      quandoEvitar: ["Desconforto femoropatelar na amplitude final."],
      errosComuns: ["Usar impulso e soltar o peso na descida.", "Buscar amplitude à custa de dor."],
      variacoes: ["Unilateral para assimetrias.", "Ênfase excêntrica com cadência lenta."],
    },
    conteudo: {
      visaoGeral: "Exercício de isolamento do quadríceps em máquina, com trajetória guiada.",
      biomecanica: "Concentra o trabalho na extensão do joelho, com mínima demanda de tronco.",
      fisiologia: "Permite volume localizado de quadríceps com baixo custo coordenativo.",
      prescricaoPratica: "Em geral, ajuste amplitude ao conforto e controle a fase excêntrica.",
    },
    trustLevel: "regra pedagógica",
    temCena: false,
  },

  /* ------------------------------ MESA FLEXORA --------------------------- */
  {
    id: "e5",
    slug: "mesa-flexora",
    imagem: "/exercises/mesa-flexora.webp",
    imagemAnalise: "/exercises/mesa-flexora-analysis.webp",
    nome: "Mesa flexora",
    grupoMuscular: "Membros inferiores",
    equipamento: "Máquina",
    objetivo: ["Hipertrofia", "Resistência muscular"],
    nivel: "Iniciante",
    articulacaoPredominante: "Joelho",
    restricoes: [],
    premium: false,
    resumoPratico:
      "Isolamento de posteriores de coxa guiado — em geral complementa o trabalho de membros inferiores com baixa demanda lombar.",
    ativacao: [
      { musculo: "Isquiotibiais", percentual: 92, papel: "primário" },
      { musculo: "Panturrilha", percentual: 40, papel: "estabilizador" },
    ],
    indiceEficiencia: {
      score: 68,
      metrics: [
        { nome: "Posteriores", valor: 92, tipo: "positivo" },
        { nome: "Isolamento", valor: 86, tipo: "positivo" },
        { nome: "Demanda lombar", valor: 18, tipo: "positivo" },
        { nome: "Complexidade técnica", valor: 24, tipo: "positivo" },
      ],
    },
    fases: [
      { nome: "Concêntrica", descricao: "Flexiona o joelho trazendo o calcanhar em direção ao glúteo." },
      { nome: "Pico", descricao: "Contração breve no ponto de maior flexão." },
      { nome: "Excêntrica", descricao: "Retorno controlado à posição inicial." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 48,
        y: 50,
        titulo: "Estabilidade da pelve",
        camadas: {
          resumo: "Mantenha o quadril apoiado, sem 'levantar' para ajudar o movimento.",
          biomecanica: "Levantar a pelve transfere trabalho para a lombar.",
          fisiologia: "Estabilizar a pelve concentra o esforço nos isquiotibiais.",
          evidencia: "Cadência controlada melhora a percepção do músculo-alvo.",
          cuidados: "Reduza a carga se a pelve se descolar do apoio.",
        },
      },
    ],
    blocos: {
      quandoUsar: ["Volume de posteriores com baixa exigência técnica.", "Equilíbrio entre anterior e posterior de coxa."],
      quandoEvitar: ["Desconforto na parte posterior do joelho na amplitude final."],
      errosComuns: ["Levantar a pelve para ajudar.", "Retorno sem controle."],
      variacoes: ["Unilateral.", "Ênfase excêntrica."],
    },
    conteudo: {
      visaoGeral: "Isolamento dos isquiotibiais em máquina.",
      biomecanica: "Trabalha a flexão do joelho com mínima demanda de tronco.",
      fisiologia: "Complementa o trabalho de quadríceps, ajudando o equilíbrio da coxa.",
      prescricaoPratica: "Em geral, controle a cadência e mantenha a pelve estável.",
    },
    trustLevel: "regra pedagógica",
    temCena: false,
  },

  /* ------------------------- LEVANTAMENTO TERRA ROMENO ------------------- */
  {
    id: "e6",
    slug: "levantamento-terra-romeno",
    imagem: "/exercises/levantamento-terra-romeno.webp",
    imagemAnalise: "/exercises/levantamento-terra-romeno-analysis.webp",
    nome: "Levantamento terra romeno (stiff)",
    grupoMuscular: "Membros inferiores",
    equipamento: "Barra",
    objetivo: ["Força", "Hipertrofia", "Emagrecimento"],
    nivel: "Avançado",
    articulacaoPredominante: "Quadril",
    restricoes: ["Dor lombar"],
    premium: true,
    resumoPratico:
      "Dobradiça de quadril com barra — em geral desenvolve cadeia posterior, exigindo controle lombar e boa dissociação quadril-coluna.",
    ativacao: [
      { musculo: "Isquiotibiais", percentual: 90, papel: "primário" },
      { musculo: "Glúteo máximo", percentual: 80, papel: "primário" },
      { musculo: "Eretores da espinha", percentual: 74, papel: "estabilizador" },
    ],
    indiceEficiencia: {
      score: 82,
      metrics: [
        { nome: "Posteriores", valor: 90, tipo: "positivo" },
        { nome: "Glúteos", valor: 80, tipo: "positivo" },
        { nome: "Demanda lombar", valor: 70, tipo: "cautela" },
        { nome: "Complexidade técnica", valor: 76, tipo: "cautela" },
        { nome: "Requisito de mobilidade", valor: 55, tipo: "cautela" },
      ],
    },
    fases: [
      { nome: "Excêntrica", descricao: "Empurra o quadril para trás mantendo a coluna neutra." },
      { nome: "Alongamento", descricao: "Sente o estiramento dos posteriores sem arredondar a lombar." },
      { nome: "Concêntrica", descricao: "Estende o quadril trazendo a barra de volta ao topo." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 60,
        y: 38,
        titulo: "Dobradiça de quadril",
        camadas: {
          resumo: "O movimento vem do quadril indo para trás, não da flexão da lombar.",
          biomecanica: "A dissociação quadril-coluna reduz a carga passiva na lombar.",
          fisiologia: "Coloca os isquiotibiais em bom comprimento de trabalho.",
          evidencia: "Coluna neutra sob carga é um princípio amplamente adotado.",
          cuidados: "Interrompa a descida quando a lombar começar a arredondar.",
        },
      },
    ],
    blocos: {
      quandoUsar: ["Desenvolvimento da cadeia posterior.", "Quem já domina a dobradiça de quadril."],
      quandoEvitar: ["Dor lombar aguda.", "Sem controle da coluna neutra sob carga."],
      errosComuns: ["Arredondar a lombar ao descer.", "Transformar em agachamento flexionando muito os joelhos."],
      variacoes: ["Com halteres.", "Unilateral.", "Déficit para maior amplitude (avançado)."],
    },
    conteudo: {
      visaoGeral: "Exercício de dobradiça de quadril focado em cadeia posterior.",
      biomecanica: "Exige dissociação entre quadril e coluna para manter a lombar protegida.",
      fisiologia: "Trabalha isquiotibiais e glúteos em amplitude alongada.",
      prescricaoPratica: "Em geral, domine o padrão com carga leve antes de progredir.",
    },
    trustLevel: "cuidado de segurança",
    temCena: false,
  },

  /* -------------------------------- HIP THRUST --------------------------- */
  {
    id: "e7",
    slug: "hip-thrust",
    imagem: "/exercises/hip-thrust.webp",
    imagemAnalise: "/exercises/hip-thrust-analysis.webp",
    nome: "Hip thrust (elevação pélvica)",
    grupoMuscular: "Membros inferiores",
    equipamento: "Barra",
    objetivo: ["Hipertrofia", "Força", "Emagrecimento"],
    nivel: "Intermediário",
    articulacaoPredominante: "Quadril",
    restricoes: [],
    premium: false,
    resumoPratico:
      "Extensão de quadril com apoio — em geral maximiza tensão no glúteo com baixa demanda de mobilidade.",
    ativacao: [
      { musculo: "Glúteo máximo", percentual: 95, papel: "primário" },
      { musculo: "Isquiotibiais", percentual: 62, papel: "sinergista" },
      { musculo: "Quadríceps", percentual: 40, papel: "estabilizador" },
    ],
    indiceEficiencia: {
      score: 80,
      metrics: [
        { nome: "Glúteos", valor: 95, tipo: "positivo" },
        { nome: "Extensão de quadril", valor: 90, tipo: "positivo" },
        { nome: "Demanda lombar", valor: 42, tipo: "cautela" },
        { nome: "Complexidade técnica", valor: 46, tipo: "cautela" },
        { nome: "Requisito de mobilidade", valor: 25, tipo: "positivo" },
      ],
    },
    fases: [
      { nome: "Concêntrica", descricao: "Estende o quadril até o tronco ficar paralelo ao solo." },
      { nome: "Topo", descricao: "Contrai o glúteo sem hiperestender a lombar." },
      { nome: "Excêntrica", descricao: "Desce controlado sem apoiar totalmente o quadril." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 52,
        y: 44,
        titulo: "Posição no topo",
        camadas: {
          resumo: "Termine com quadril estendido e costelas para baixo, sem 'jogar' a lombar.",
          biomecanica: "Hiperestender a lombar transfere carga da região do glúteo para a coluna.",
          fisiologia: "O encaixe de tronco melhora a contração do glúteo no topo.",
          evidencia: "Queixo levemente para dentro ajuda a manter a posição.",
          cuidados: "Se sentir a lombar 'estalar', reduza a amplitude no topo.",
        },
      },
    ],
    blocos: {
      quandoUsar: ["Ênfase em glúteo com baixa demanda de mobilidade.", "Complemento a padrões de agachamento/dobradiça."],
      quandoEvitar: ["Hiperextensão lombar recorrente no topo."],
      errosComuns: ["Empurrar com a lombar em vez do quadril.", "Amplitude curta demais no topo."],
      variacoes: ["Unilateral.", "Com pausa isométrica.", "Com faixa elástica nos joelhos."],
    },
    conteudo: {
      visaoGeral: "Exercício de extensão de quadril focado no glúteo máximo.",
      biomecanica: "O apoio das costas permite alta tensão no glúteo com pouca exigência de equilíbrio.",
      fisiologia: "Bom para volume de glúteo com baixa demanda coordenativa.",
      prescricaoPratica: "Em geral, priorize a posição neutra do tronco no topo.",
    },
    trustLevel: "tendência prática",
    temCena: false,
  },

  /* -------------------------------- AFUNDO ------------------------------- */
  {
    id: "e8",
    slug: "afundo-passada",
    imagem: "/exercises/afundo-passada.webp",
    imagemAnalise: "/exercises/afundo-passada-analysis.webp",
    nome: "Afundo (passada)",
    grupoMuscular: "Membros inferiores",
    equipamento: "Halter",
    objetivo: ["Hipertrofia", "Força", "Aprendizado técnico", "Emagrecimento"],
    nivel: "Intermediário",
    articulacaoPredominante: "Quadril e joelho",
    restricoes: ["Dor no joelho"],
    premium: false,
    resumoPratico:
      "Padrão unilateral — em geral trabalha força e estabilidade de forma funcional, expondo assimetrias.",
    ativacao: [
      { musculo: "Quadríceps", percentual: 84, papel: "primário" },
      { musculo: "Glúteo máximo", percentual: 78, papel: "primário" },
      { musculo: "Estabilizadores do quadril", percentual: 60, papel: "estabilizador" },
    ],
    indiceEficiencia: {
      score: 76,
      metrics: [
        { nome: "Quadríceps", valor: 84, tipo: "positivo" },
        { nome: "Glúteos", valor: 78, tipo: "positivo" },
        { nome: "Estabilidade unilateral", valor: 80, tipo: "positivo" },
        { nome: "Demanda de joelho", valor: 58, tipo: "cautela" },
        { nome: "Complexidade técnica", valor: 62, tipo: "cautela" },
      ],
    },
    fases: [
      { nome: "Descida", descricao: "Flexiona os dois joelhos até a coxa da frente ficar próxima da paralela." },
      { nome: "Base", descricao: "Ponto baixo com tronco estável e joelho alinhado ao pé." },
      { nome: "Subida", descricao: "Empurra pelo calcanhar da frente para voltar." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 30,
        y: 66,
        titulo: "Controle do joelho",
        camadas: {
          resumo: "O joelho da frente segue a linha do pé, sem colapsar para dentro.",
          biomecanica: "O valgo dinâmico aumenta o estresse medial do joelho.",
          fisiologia: "Bom controle recruta melhor glúteo e quadríceps.",
          evidencia: "Assimetrias entre lados tendem a aparecer neste padrão.",
          cuidados: "Ajuste a amplitude da passada ao conforto do joelho.",
        },
      },
    ],
    blocos: {
      quandoUsar: ["Trabalho unilateral e correção de assimetrias.", "Transferência funcional para marcha e esporte."],
      quandoEvitar: ["Dor no joelho na amplitude escolhida.", "Sem controle de equilíbrio básico."],
      errosComuns: ["Joelho colapsando para dentro.", "Passada curta demais.", "Tronco desabando à frente."],
      variacoes: ["Afundo estático.", "Passada caminhando.", "Búlgaro (pé traseiro elevado)."],
    },
    conteudo: {
      visaoGeral: "Padrão unilateral de membros inferiores com halteres.",
      biomecanica: "Exige estabilização do quadril e controle do joelho de apoio.",
      fisiologia: "Bom para força funcional e correção de desequilíbrios entre lados.",
      prescricaoPratica: "Em geral, comece estático e progrida para caminhada e cargas maiores.",
    },
    trustLevel: "tendência prática",
    temCena: false,
  },

  /* ------------------------------ PUXADA ALTA ---------------------------- */
  {
    id: "e9",
    slug: "puxada-alta",
    imagem: "/exercises/puxada-alta.webp",
    imagemAnalise: "/exercises/puxada-alta-analysis.webp",
    nome: "Puxada alta (pulldown)",
    grupoMuscular: "Costas",
    equipamento: "Polia",
    objetivo: ["Hipertrofia", "Aprendizado técnico", "Resistência muscular", "Emagrecimento"],
    nivel: "Iniciante",
    articulacaoPredominante: "Ombro e cotovelo",
    restricoes: [],
    premium: false,
    resumoPratico:
      "Puxar vertical guiado — em geral porta de entrada para o trabalho de dorsais antes da barra fixa.",
    ativacao: [
      { musculo: "Latíssimo do dorso", percentual: 88, papel: "primário" },
      { musculo: "Bíceps", percentual: 60, papel: "sinergista" },
      { musculo: "Romboides", percentual: 55, papel: "sinergista" },
    ],
    indiceEficiencia: {
      score: 74,
      metrics: [
        { nome: "Dorsais", valor: 88, tipo: "positivo" },
        { nome: "Controle escapular", valor: 70, tipo: "positivo" },
        { nome: "Demanda de ombro", valor: 38, tipo: "positivo" },
        { nome: "Complexidade técnica", valor: 34, tipo: "positivo" },
      ],
    },
    fases: [
      { nome: "Concêntrica", descricao: "Puxa a barra em direção ao peito iniciando pelas escápulas." },
      { nome: "Contração", descricao: "Cotovelos apontando para baixo e escápulas deprimidas." },
      { nome: "Excêntrica", descricao: "Retorno controlado com os braços quase estendidos." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 52,
        y: 46,
        titulo: "Início pela escápula",
        camadas: {
          resumo: "O movimento começa deprimindo/retraindo as escápulas, não puxando com o braço.",
          biomecanica: "A ação escapular melhora o recrutamento dos dorsais.",
          fisiologia: "Reduz a dominância do bíceps na puxada.",
          evidencia: "Cadência controlada ajuda a sentir o músculo-alvo.",
          cuidados: "Evite jogar o tronco para trás para vencer a carga.",
        },
      },
    ],
    blocos: {
      quandoUsar: ["Aprendizado do padrão de puxar vertical.", "Volume de dorsais com carga ajustável."],
      quandoEvitar: ["Desconforto de ombro em amplitude ampla."],
      errosComuns: ["Puxar só com os braços.", "Balançar o tronco.", "Puxar a barra atrás da nuca sem necessidade."],
      variacoes: ["Pegada supinada.", "Pegada neutra.", "Unilateral na polia."],
    },
    conteudo: {
      visaoGeral: "Exercício de puxar vertical em polia alta.",
      biomecanica: "A polia guia a trajetória, facilitando o aprendizado do controle escapular.",
      fisiologia: "Trabalha dorsais e sinergistas com carga graduável.",
      prescricaoPratica: "Em geral, inicie o movimento pelas escápulas e controle a volta.",
    },
    trustLevel: "regra pedagógica",
    temCena: false,
  },

  /* ------------------------------ REMADA BAIXA --------------------------- */
  {
    id: "e10",
    slug: "remada-baixa",
    imagem: "/exercises/remada-baixa.webp",
    imagemAnalise: "/exercises/remada-baixa-analysis.webp",
    nome: "Remada baixa",
    grupoMuscular: "Costas",
    equipamento: "Polia",
    objetivo: ["Hipertrofia", "Força", "Emagrecimento"],
    nivel: "Intermediário",
    articulacaoPredominante: "Ombro e cotovelo",
    restricoes: ["Dor lombar"],
    premium: true,
    resumoPratico:
      "Puxar horizontal sentado — em geral desenvolve espessura de costas, exigindo tronco estável.",
    ativacao: [
      { musculo: "Dorsais e romboides", percentual: 86, papel: "primário" },
      { musculo: "Trapézio médio", percentual: 66, papel: "sinergista" },
      { musculo: "Bíceps", percentual: 55, papel: "sinergista" },
    ],
    indiceEficiencia: {
      score: 78,
      metrics: [
        { nome: "Costas (espessura)", valor: 86, tipo: "positivo" },
        { nome: "Trapézio médio", valor: 66, tipo: "positivo" },
        { nome: "Demanda lombar", valor: 44, tipo: "cautela" },
        { nome: "Complexidade técnica", valor: 40, tipo: "cautela" },
      ],
    },
    fases: [
      { nome: "Concêntrica", descricao: "Puxa o cabo em direção ao abdômen retraindo as escápulas." },
      { nome: "Contração", descricao: "Cotovelos próximos ao tronco e escápulas juntas." },
      { nome: "Excêntrica", descricao: "Retorna deixando as escápulas se afastarem sob controle." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 51,
        y: 55,
        titulo: "Tronco estável",
        camadas: {
          resumo: "Mantenha o tronco firme, sem balançar para frente e para trás.",
          biomecanica: "Balançar transfere trabalho para a lombar e reduz o foco nas costas.",
          fisiologia: "Estabilizar o tronco concentra o esforço nos músculos-alvo.",
          evidencia: "Cadência controlada melhora a qualidade da contração.",
          cuidados: "Evite excesso de carga que force o balanço do tronco.",
        },
      },
    ],
    blocos: {
      quandoUsar: ["Espessura de costas.", "Complemento ao padrão de puxar vertical."],
      quandoEvitar: ["Balançar o tronco por carga excessiva.", "Dor lombar ao estabilizar."],
      errosComuns: ["Usar impulso de tronco.", "Encolher os ombros.", "Amplitude curta."],
      variacoes: ["Pegada aberta.", "Barra reta.", "Unilateral."],
    },
    conteudo: {
      visaoGeral: "Exercício de puxar horizontal sentado na polia.",
      biomecanica: "Exige estabilização de tronco para isolar as costas.",
      fisiologia: "Trabalha a espessura da região dorsal e o trapézio médio.",
      prescricaoPratica: "Em geral, mantenha o tronco estável e retraia as escápulas.",
    },
    trustLevel: "tendência prática",
    temCena: false,
  },

  /* -------------------------- DESENVOLVIMENTO OMBROS --------------------- */
  {
    id: "e11",
    slug: "desenvolvimento-ombros",
    imagem: "/exercises/desenvolvimento-ombros.webp",
    imagemAnalise: "/exercises/desenvolvimento-ombros-analysis.webp",
    nome: "Desenvolvimento de ombros",
    grupoMuscular: "Ombros",
    equipamento: "Halter",
    objetivo: ["Hipertrofia", "Força"],
    nivel: "Intermediário",
    articulacaoPredominante: "Ombro",
    restricoes: ["Ombro sensível"],
    premium: false,
    resumoPratico:
      "Empurrar vertical — em geral desenvolve deltoides, exigindo controle escapular e amplitude tolerável ao ombro.",
    ativacao: [
      { musculo: "Deltoide", percentual: 88, papel: "primário" },
      { musculo: "Tríceps", percentual: 60, papel: "sinergista" },
      { musculo: "Trapézio superior", percentual: 45, papel: "estabilizador" },
    ],
    indiceEficiencia: {
      score: 76,
      metrics: [
        { nome: "Deltoides", valor: 88, tipo: "positivo" },
        { nome: "Tríceps", valor: 60, tipo: "positivo" },
        { nome: "Demanda de ombro", valor: 64, tipo: "cautela" },
        { nome: "Complexidade técnica", valor: 52, tipo: "cautela" },
      ],
    },
    fases: [
      { nome: "Concêntrica", descricao: "Empurra os halteres acima da cabeça sem travar bruscamente." },
      { nome: "Topo", descricao: "Braços quase estendidos, costelas para baixo." },
      { nome: "Excêntrica", descricao: "Desce até a altura tolerável do ombro." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 43,
        y: 33,
        titulo: "Amplitude do ombro",
        camadas: {
          resumo: "Desça até uma amplitude confortável, sem forçar o ombro sensível.",
          biomecanica: "Amplitude excessiva sob carga aumenta o estresse articular.",
          fisiologia: "Controle escapular protege a articulação durante o empurrar.",
          evidencia: "Ombros sensíveis costumam tolerar melhor amplitudes parciais.",
          cuidados: "Ajuste amplitude e carga conforme a resposta do ombro.",
        },
      },
    ],
    blocos: {
      quandoUsar: ["Desenvolvimento de deltoides.", "Padrão de empurrar vertical."],
      quandoEvitar: ["Desconforto agudo de ombro.", "Sem controle escapular básico."],
      errosComuns: ["Hiperestender a lombar para empurrar.", "Amplitude excessiva desconfortável."],
      variacoes: ["Sentado com apoio.", "Na máquina.", "Arnold press."],
    },
    conteudo: {
      visaoGeral: "Exercício de empurrar vertical para os deltoides.",
      biomecanica: "Exige estabilização de tronco e controle escapular.",
      fisiologia: "Trabalha os deltoides com participação do tríceps.",
      prescricaoPratica: "Em geral, adapte a amplitude ao ombro e evite compensar com a lombar.",
    },
    trustLevel: "cuidado de segurança",
    temCena: false,
  },

  /* ------------------------------ ROSCA DIRETA --------------------------- */
  {
    id: "e12",
    slug: "rosca-direta",
    imagem: "/exercises/rosca-direta.webp",
    imagemAnalise: "/exercises/rosca-direta-analysis.webp",
    nome: "Rosca direta",
    grupoMuscular: "Braços",
    equipamento: "Halter",
    objetivo: ["Hipertrofia", "Resistência muscular"],
    nivel: "Iniciante",
    articulacaoPredominante: "Cotovelo",
    restricoes: [],
    premium: false,
    resumoPratico:
      "Isolamento de bíceps — em geral usado para volume localizado com baixa demanda técnica.",
    ativacao: [
      { musculo: "Bíceps braquial", percentual: 90, papel: "primário" },
      { musculo: "Braquial", percentual: 60, papel: "sinergista" },
    ],
    indiceEficiencia: {
      score: 66,
      metrics: [
        { nome: "Bíceps", valor: 90, tipo: "positivo" },
        { nome: "Isolamento", valor: 82, tipo: "positivo" },
        { nome: "Demanda lombar", valor: 14, tipo: "positivo" },
        { nome: "Complexidade técnica", valor: 20, tipo: "positivo" },
      ],
    },
    fases: [
      { nome: "Concêntrica", descricao: "Flexiona o cotovelo elevando o halter sem balançar." },
      { nome: "Pico", descricao: "Contração breve no topo." },
      { nome: "Excêntrica", descricao: "Desce controlado até quase a extensão." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 45,
        y: 30,
        titulo: "Cotovelo fixo",
        camadas: {
          resumo: "O cotovelo permanece junto ao tronco, sem 'jogar' para frente.",
          biomecanica: "Mover o cotovelo transfere parte do trabalho para o ombro.",
          fisiologia: "Cotovelo estável isola melhor o bíceps.",
          evidencia: "Balançar o tronco reduz a tensão no músculo-alvo.",
          cuidados: "Reduza a carga se precisar balançar para levantar.",
        },
      },
    ],
    blocos: {
      quandoUsar: ["Volume de bíceps.", "Baixa exigência técnica."],
      quandoEvitar: ["Necessidade de balançar o tronco por carga excessiva."],
      errosComuns: ["Balançar o corpo.", "Mover o cotovelo para frente."],
      variacoes: ["Alternada.", "Rosca martelo.", "Na polia."],
    },
    conteudo: {
      visaoGeral: "Isolamento de bíceps com halteres.",
      biomecanica: "Concentra o trabalho na flexão do cotovelo.",
      fisiologia: "Permite volume localizado com baixo custo coordenativo.",
      prescricaoPratica: "Em geral, mantenha o cotovelo fixo e controle a descida.",
    },
    trustLevel: "regra pedagógica",
    temCena: false,
  },

  /* ------------------------------ TRÍCEPS POLIA -------------------------- */
  {
    id: "e13",
    slug: "triceps-polia",
    imagem: "/exercises/triceps-polia.webp",
    imagemAnalise: "/exercises/triceps-polia-analysis.webp",
    nome: "Tríceps na polia",
    grupoMuscular: "Braços",
    equipamento: "Polia",
    objetivo: ["Hipertrofia", "Resistência muscular"],
    nivel: "Iniciante",
    articulacaoPredominante: "Cotovelo",
    restricoes: [],
    premium: false,
    resumoPratico:
      "Isolamento de tríceps guiado — em geral usado para volume com tensão constante da polia.",
    ativacao: [
      { musculo: "Tríceps braquial", percentual: 90, papel: "primário" },
      { musculo: "Ancôneo", percentual: 45, papel: "sinergista" },
    ],
    indiceEficiencia: {
      score: 66,
      metrics: [
        { nome: "Tríceps", valor: 90, tipo: "positivo" },
        { nome: "Tensão constante", valor: 80, tipo: "positivo" },
        { nome: "Demanda de ombro", valor: 22, tipo: "positivo" },
        { nome: "Complexidade técnica", valor: 22, tipo: "positivo" },
      ],
    },
    fases: [
      { nome: "Concêntrica", descricao: "Estende os cotovelos empurrando a barra para baixo." },
      { nome: "Extensão", descricao: "Cotovelos quase estendidos, sem travar bruscamente." },
      { nome: "Excêntrica", descricao: "Retorna controlado sem que os cotovelos abram." },
    ],
    hotspots: [
      {
        id: "h1",
        x: 44,
        y: 42,
        titulo: "Cotovelos junto ao corpo",
        camadas: {
          resumo: "Os cotovelos ficam junto ao tronco durante todo o movimento.",
          biomecanica: "Abrir os cotovelos recruta o peitoral e reduz o foco no tríceps.",
          fisiologia: "Cotovelos estáveis concentram a tensão no tríceps.",
          evidencia: "Cadência controlada melhora a percepção do músculo-alvo.",
          cuidados: "Evite usar o peso do corpo para empurrar.",
        },
      },
    ],
    blocos: {
      quandoUsar: ["Volume de tríceps com tensão constante.", "Baixa exigência técnica."],
      quandoEvitar: ["Usar impulso do tronco por carga excessiva."],
      errosComuns: ["Abrir os cotovelos.", "Curvar o corpo para empurrar."],
      variacoes: ["Corda.", "Barra reta.", "Unilateral."],
    },
    conteudo: {
      visaoGeral: "Isolamento de tríceps na polia alta.",
      biomecanica: "A polia mantém tensão ao longo da amplitude.",
      fisiologia: "Bom para volume de tríceps com baixo custo coordenativo.",
      prescricaoPratica: "Em geral, mantenha os cotovelos fixos e controle a volta.",
    },
    trustLevel: "regra pedagógica",
    temCena: false,
  },
  ...extraExercises,
];

export function getExercise(slug: string) {
  return exercises.find((e) => e.slug === slug);
}

export const equipamentosDisponiveis = Array.from(
  new Set(exercises.map((e) => e.equipamento)),
);
export const gruposDisponiveis = Array.from(
  new Set(exercises.map((e) => e.grupoMuscular)),
);
