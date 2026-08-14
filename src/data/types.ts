export type Nivel = "Iniciante" | "Intermediário" | "Avançado";
export type Papel = "primário" | "sinergista" | "estabilizador";

export type TrustLevel =
  | "princípio biomecânico"
  | "tendência prática"
  | "regra pedagógica"
  | "cuidado de segurança"
  | "depende do contexto";

export interface MuscleActivation {
  musculo: string;
  /**
   * Ativação RELATIVA AO PRÓPRIO MÚSCULO, de 0 a 100. Estimativa a partir de
   * literatura de EMG comparada (%MVIC).
   *
   * ATENÇÃO: não é distribuição. Os percentuais dos músculos de um exercício NÃO
   * somam 100 (na base atual somam de 132 a 300). "Quadríceps 78" quer dizer que o
   * quadríceps trabalha perto de 78% da capacidade dele, e não que 78% do esforço
   * vai para o quadríceps. Ver `metricasGlossario.ts` (id "ativacao").
   */
  percentual: number;
  papel: Papel;
}

export interface EficMetric {
  /** Rótulo da métrica. Cada um deve ter definição em `metricasGlossario.ts`. */
  nome: string;
  /** 0 a 100, COMPARATIVO entre os exercícios desta base (não é medida absoluta nem do aluno). */
  valor: number;
  tipo: "positivo" | "cautela";
}

export interface IndiceEficiencia {
  /** 0 a 100, comparativo entre exercícios. Ver `metricasGlossario.ts` (id "eficiencia"). */
  score: number;
  metrics: EficMetric[];
}

export interface Fase {
  nome: string;
  descricao: string;
}

export interface HotspotCamadas {
  resumo: string;
  biomecanica: string;
  fisiologia: string;
  evidencia: string;
  cuidados: string;
}

export interface Hotspot {
  id: string;
  x: number; // % 0..100
  y: number; // % 0..100
  titulo: string;
  camadas: HotspotCamadas;
}

export interface Blocos {
  quandoUsar: string[];
  quandoEvitar: string[];
  errosComuns: string[];
  variacoes: string[];
}

export interface Conteudo {
  visaoGeral: string;
  biomecanica: string;
  fisiologia: string;
  prescricaoPratica: string;
}

/**
 * Perfil do exercício frente às restrições físicas do aluno (etapa 4 do Prescrever).
 *
 * São FATOS estruturais do movimento, autorados por inspeção (posição do corpo, se
 * exige ajoelhar, se leva o peso às mãos, se há apoio de equipamento). Não são notas
 * biomecânicas inventadas: onde a decisão precisa de carga articular fina, o motor
 * usa as demandas já medidas (Demanda lombar/joelho/ombro) em vez de um número novo.
 *
 * O `impacto` é a única classificação de julgamento e segue a literatura de forças de
 * reação do solo (corrida/salto = alto; caminhada/bike/água = baixo). Ver
 * `referencias.ts` (boyer-2014, wallace-2002, dossantos-2021).
 */
export interface RestricaoPerfilExercicio {
  /** posição predominante do corpo durante a execução */
  posicao: "em pé" | "sentado" | "deitado" | "ajoelhado" | "quatro apoios";
  /** força de impacto/aterrissagem: corrida e saltos = alto; caminhada/bike/água = baixo */
  impacto: "baixo" | "moderado" | "alto";
  /** o movimento leva os braços acima da linha da cabeça sob carga */
  movimentoAcimaCabeca: boolean;
  /** a execução exige apoiar-se sobre os joelhos */
  exigeAjoelhar: boolean;
  /** a execução começa/termina no solo (deitar, levantar do chão, quatro apoios) */
  exigeIrAoChao: boolean;
  /** trabalha um lado do corpo por vez (afundo, unilateral) */
  unilateral: boolean;
  /** o peso do corpo recai sobre punhos/mãos (flexão, prancha alta) */
  apoioNasMaos: boolean;
  /** dá para ajustar facilmente a amplitude (máquina, banco, altura regulável) */
  amplitudeAjustavel: boolean;
  /** oferece apoio externo estável (encosto, banco, máquina, corrimão) */
  possuiApoio: boolean;
  /**
   * O MOVIMENTO LEVA A COLUNA À FLEXÃO SOB CARGA EXTERNA.
   *
   * Enrolar o tronco contra uma resistência que progride (abdominal na polia, abdominal
   * com anilha no peito). NÃO é dobradiça de quadril com coluna neutra: levantamento
   * terra, terra romeno, good morning, agachamento e remada curvada mantêm a coluna
   * neutra e ficam FALSE, por mais que carreguem a região lombar.
   *
   * Existe porque a distinção é literalmente a que a fonte faz. O posicionamento da ESSA
   * (Beck 2017) diz que a flexão de coluna CARREGADA não é recomendada na osteoporose, e
   * no mesmo parágrafo diz que o osso responde a impacto e a treino resistido progressivo
   * de ALTA INTENSIDADE. A regra do produto usava a métrica "Demanda lombar >= 60" como
   * substituta, e ela erra nos dois sentidos: pegava os cinco levantamentos de coluna
   * neutra (terra 70, terra romeno 70, good morning 65, agachamento livre 62, remada
   * curvada 62), que são exatamente o estímulo recomendado, e NÃO pegava o abdominal na
   * polia alta, que tem Demanda lombar 40 e é o único caso de flexão carregada do
   * catálogo.
   */
  flexaoColunaCarregada: boolean;
  /**
   * OS MEMBROS TRABALHAM ACIMA DO NIVEL DO CORACAO, CONTRA CARGA EXTERNA.
   *
   * Fato OBSERVAVEL da execucao, nao afirmacao clinica: no leg press 45 graus o encosto
   * e reclinado e os pes empurram a plataforma acima da linha do tronco. Na cadeira
   * extensora, no leg press horizontal, no agachamento e na subida no step, nao.
   *
   * Existe porque a logica de INDICACAO precisa de um fato para comparar alternativas que
   * treinam o mesmo musculo. Ver GroupGpsRule.evitarMembrosAcimaDoCoracao.
   */
  membrosAcimaDoCoracao: boolean;
}

export interface Exercise {
  id: string;
  slug: string;
  nome: string;
  grupoMuscular: string;
  equipamento: string;
  objetivo: string[];
  nivel: Nivel;
  articulacaoPredominante: string;
  /*
   * REMOVIDO: `restricoes: string[]`.
   *
   * Era um rótulo livre em 58 dos 97 exercícios, com quatro valores ("Ombro sensível",
   * "Dor lombar", "Dor no joelho", "Requer mobilidade de tornozelo e quadril"), e NENHUM
   * consumidor: nenhuma tela, nenhum documento e nenhuma parte do motor o lia.
   *
   * Não foi removido só por ser morto, e sim porque MISTURAVA DOIS SENTIDOS OPOSTOS.
   * Medido contra os avaliadores estruturados: dos 29 marcados "Ombro sensível", 10 o
   * motor não acusa, e são as rotações externas, a rotação interna, o scaption, o face
   * pull e o serratus punch, ou seja, exercícios INDICADOS para o ombro sensível. Dos 21
   * marcados "Dor lombar", 11 são prancha lateral, pallof press, bird dog e companhia,
   * que são o que se prescreve PARA dor lombar.
   *
   * Um campo chamado "restricoes" que às vezes quer dizer "indicado para" e às vezes
   * "cuidado com" é pior que campo nenhum: a primeira funcionalidade que o lesse
   * inverteria a conduta. O que o motor precisa saber sobre adequação já vem de
   * `restricaoPerfil` (fatos estruturais) e das métricas de demanda por região, com
   * avaliador declarado em src/lib/gps/restricoes.ts.
   */
  premium: boolean;
  resumoPratico: string;
  anguloArticular?: string;
  /** Foto real opcional (ex.: "/exercises/leg-press-45.webp" em public/). Se ausente, usa o SVG. */
  imagem?: string;
  /** Render anatômico opcional (músculos destacados) para a camada de análise. */
  imagemAnalise?: string;
  /** id da modalidade (src/data/modalities.ts) a que o exercício pertence */
  modalidade?: string;
  /**
   * A DOSE DESTE EXERCÍCIO É TEMPO, NÃO SÉRIE E REPETIÇÃO.
   *
   * Existe porque o gerador de plano escolhia exercício de FORÇA por objetivo, nível e
   * segurança, e nada no caminho perguntava se aquilo era um exercício de força. Numa
   * prescrição de emagrecimento para aluno com condição, os aparelhos de cardio subiam ao
   * topo da fila justamente por serem os mais seguros em todas as métricas, e o plano saía
   * mandando "Bicicleta ergométrica 3 séries de 13 repetições". Quanto mais frágil o aluno,
   * mais absurda ficava a sessão dele.
   *
   * Vale para esteira, bicicleta, elíptico, exercício aquático e ergômetros de remo e
   * escada: todos se prescrevem em minutos. `ehDoseAerobia` é a leitura única desta marca.
   */
  doseAerobia?: boolean;
  /**
   * A DOSE DESTE EXERCÍCIO É TEMPO DE CONTRAÇÃO SUSTENTADA, EM SEGUNDOS.
   *
   * Mesma ideia de `doseAerobia`, terceira família de dose do produto: o isométrico não tem
   * repetição, porque não há fase concêntrica nem excêntrica para contar. Prescrever "3 x 12"
   * num agachamento isométrico na parede é o mesmo tipo de absurdo que "Bicicleta ergométrica
   * 3 séries de 13 repetições" era, e por isso a marca existe ANTES do primeiro isométrico
   * entrar no catálogo, e não depois.
   *
   * Quem lê esta marca é `ehExercicioDeSerie` em `lib/gps/periodizacao.ts`, leitura única:
   * exercício marcado aqui nunca entra na seleção de força, do mesmo jeito que o aeróbio não
   * entra. O `check:core` trava a regressão.
   *
   * A dose própria (séries, duração da contração e descanso) vive em `doseIsometrica` nos
   * dados do exercício, com a referência ao lado, porque protocolo isométrico é PROTOCOLO
   * publicado, não faixa que o motor possa interpolar.
   */
  doseIsometrica?: boolean;
  ativacao: MuscleActivation[];
  indiceEficiencia: IndiceEficiencia;
  fases: Fase[];
  hotspots: Hotspot[];
  blocos: Blocos;
  conteudo: Conteudo;
  trustLevel: TrustLevel;
  /** true = tem cena/silhueta dedicada; false = usa ilustração genérica */
  temCena: boolean;
  /** perfil frente às restrições físicas do aluno (ver RestricaoPerfilExercicio) */
  restricaoPerfil?: RestricaoPerfilExercicio;
}

export interface CaseOption {
  id: string;
  texto: string;
  correta: boolean;
  /** por que a alternativa funciona ou não */
  analise: string;
  /** qual critério de decisão foi considerado/ignorado */
  criterio: string;
  /** o que levar para a próxima situação */
  lembrar: string;
}

export interface PracticeCase {
  id: string;
  slug: string;
  titulo: string;
  tema: string;
  dificuldade: Nivel;
  premium: boolean;
  contexto: string;
  pergunta: string;
  opcoes: CaseOption[];
  /** id da alternativa mais prudente */
  melhorOpcaoId: string;
  trustLevel: TrustLevel;
}

export type LessonTipo = "conceito" | "lab" | "caso";

export interface Lesson {
  id: string;
  titulo: string;
  tipo: LessonTipo;
  duracao: string;
  /** slug do exercício (lab) ou do caso (caso) para link */
  ref?: string;
}

export interface Track {
  id: string;
  slug: string;
  nome: string;
  descricao: string;
  nivel: Nivel;
  lessons: Lesson[];
  concluidas: number;
}
