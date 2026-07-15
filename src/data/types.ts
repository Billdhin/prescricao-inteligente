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

export interface Exercise {
  id: string;
  slug: string;
  nome: string;
  grupoMuscular: string;
  equipamento: string;
  objetivo: string[];
  nivel: Nivel;
  articulacaoPredominante: string;
  restricoes: string[];
  premium: boolean;
  resumoPratico: string;
  anguloArticular?: string;
  /** Foto real opcional (ex.: "/exercises/leg-press-45.webp" em public/). Se ausente, usa o SVG. */
  imagem?: string;
  /** Render anatômico opcional (músculos destacados) para a camada de análise. */
  imagemAnalise?: string;
  /** id da modalidade (src/data/modalities.ts) a que o exercício pertence */
  modalidade?: string;
  ativacao: MuscleActivation[];
  indiceEficiencia: IndiceEficiencia;
  fases: Fase[];
  hotspots: Hotspot[];
  blocos: Blocos;
  conteudo: Conteudo;
  trustLevel: TrustLevel;
  /** true = tem cena/silhueta dedicada; false = usa ilustração genérica */
  temCena: boolean;
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
