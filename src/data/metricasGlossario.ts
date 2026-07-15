/**
 * O que cada número do produto significa.
 *
 * Existia um buraco sério: os tipos diziam só `percentual: number` e `valor: number`,
 * e nenhuma tela dizia qual era a escala nem o referencial. Um doutor em Educação
 * Física não consegue defender "Demanda lombar 34" se o 34 não tem definição.
 *
 * Duas regras que valem para tudo aqui:
 * 1. Toda escala é COMPARATIVA entre os exercícios desta base, não medição do aluno.
 * 2. Nenhum número é distribuição (nada aqui soma 100 entre si).
 */

export type MelhorQuando = "maior" | "menor" | "depende";

export interface FaixaMetrica {
  /** limite superior da faixa (inclusive) */
  ate: number;
  rotulo: string;
  /** o que esse valor quer dizer na prática, na hora de decidir */
  significado: string;
}

export interface DefinicaoMetrica {
  id: string;
  /** rótulo exibido na interface */
  nome: string;
  oQueE: string;
  escala: string;
  /** relativo a quê: a pergunta que o Filipe fez e que o código não respondia */
  referencial: string;
  melhor: MelhorQuando;
  faixas: FaixaMetrica[];
  /** ids de referencias.ts, quando a métrica se apoia em literatura */
  refs?: string[];
}

const FAIXAS_DEMANDA: FaixaMetrica[] = [
  { ate: 39, rotulo: "Baixa", significado: "Costuma ser tolerado mesmo com queixa nessa região; bom ponto de partida." },
  { ate: 59, rotulo: "Moderada", significado: "Dá para usar com queixa leve, controlando amplitude e carga, e observando a resposta." },
  { ate: 100, rotulo: "Alta", significado: "Com queixa ativa nessa região, tende a incomodar; troque ou adapte antes de insistir." },
];

export const METRICAS: DefinicaoMetrica[] = [
  {
    id: "ativacao",
    nome: "Ativação relativa",
    oQueE:
      "O quanto aquele músculo trabalha neste exercício, comparado com o máximo que ele mesmo consegue produzir.",
    escala: "0 a 100 (estimativa a partir de literatura de EMG comparada).",
    referencial:
      "É relativo ao próprio músculo, não ao esforço total do corpo. Quadríceps 78 significa que o quadríceps trabalha perto de 78% da capacidade dele neste exercício. NÃO significa que 78% do esforço vai para o quadríceps: os valores dos músculos não somam 100 e não são fatias de um bolo.",
    melhor: "depende",
    faixas: [
      { ate: 39, rotulo: "Baixa", significado: "Participa, mas não é o foco do exercício." },
      { ate: 69, rotulo: "Moderada", significado: "Trabalha de verdade, geralmente como sinergista." },
      { ate: 100, rotulo: "Alta", significado: "É um dos alvos principais do exercício." },
    ],
    refs: ["boeckh-behrens-2000", "contreras-2015", "andersen-2014"],
  },
  {
    id: "eficiencia",
    nome: "Índice de eficiência",
    oQueE:
      "Nota de síntese do custo-benefício do exercício: quanto ele entrega de estímulo no músculo-alvo em relação à exigência técnica e articular que impõe.",
    escala: "0 a 100, comparativo entre os exercícios desta base.",
    referencial:
      "É uma leitura editorial curada, não uma medida de laboratório. Serve para comparar exercícios entre si, não para prever o resultado de um aluno específico.",
    melhor: "maior",
    faixas: [
      { ate: 59, rotulo: "Discreto", significado: "Entrega menos estímulo pelo que cobra; costuma ser escolha de nicho." },
      { ate: 79, rotulo: "Bom", significado: "Relação favorável entre estímulo e exigência." },
      { ate: 100, rotulo: "Muito bom", significado: "Entrega bastante estímulo cobrando pouco em técnica e articulação." },
    ],
  },
  {
    id: "demanda-lombar",
    nome: "Demanda lombar",
    oQueE: "O quanto o exercício exige da coluna lombar (carga axial, alavanca do tronco, tendência a compensar).",
    escala: "0 a 100, comparativo entre os exercícios desta base.",
    referencial:
      "É relativo aos outros exercícios da base, não a um limite fisiológico absoluto. 20 é dos mais poupadores que temos; 80 é dos mais exigentes que temos.",
    melhor: "menor",
    faixas: FAIXAS_DEMANDA,
  },
  {
    id: "demanda-joelho",
    nome: "Demanda de joelho",
    oQueE: "O quanto o exercício exige da articulação do joelho (compressão, cisalhamento, amplitude sob carga).",
    escala: "0 a 100, comparativo entre os exercícios desta base.",
    referencial: "Relativo aos demais exercícios da base, não a um limite absoluto.",
    melhor: "menor",
    faixas: FAIXAS_DEMANDA,
  },
  {
    id: "demanda-ombro",
    nome: "Demanda de ombro",
    oQueE: "O quanto o exercício exige do complexo do ombro (amplitude, rotação, estabilidade escapular sob carga).",
    escala: "0 a 100, comparativo entre os exercícios desta base.",
    referencial: "Relativo aos demais exercícios da base, não a um limite absoluto.",
    melhor: "menor",
    faixas: FAIXAS_DEMANDA,
  },
  {
    id: "mobilidade",
    nome: "Requisito de mobilidade",
    oQueE: "Quanta amplitude articular o aluno precisa ter para executar o movimento com técnica aceitável.",
    escala: "0 a 100, comparativo entre os exercícios desta base.",
    referencial: "Relativo aos demais exercícios da base.",
    melhor: "menor",
    faixas: [
      { ate: 39, rotulo: "Pouca", significado: "Executável mesmo com mobilidade limitada." },
      { ate: 59, rotulo: "Média", significado: "Pede alguma amplitude; ajuste o setup antes de descartar." },
      { ate: 100, rotulo: "Muita", significado: "Sem a amplitude, o aluno compensa. Escolha outro ou reduza a exigência." },
    ],
  },
  {
    id: "estabilidade",
    nome: "Estabilidade",
    oQueE: "Quanto o exercício oferece de apoio externo (banco, encosto, máquina) em vez de exigir equilíbrio do aluno.",
    escala: "0 a 100, comparativo entre os exercícios desta base.",
    referencial: "Relativo aos demais exercícios da base. Valor alto significa mais apoio, não mais dificuldade.",
    melhor: "maior",
    faixas: [
      { ate: 39, rotulo: "Baixa", significado: "Muito livre: exige equilíbrio e controle do próprio aluno." },
      { ate: 69, rotulo: "Média", significado: "Apoio parcial; atenção ao cansaço no fim da série." },
      { ate: 100, rotulo: "Alta", significado: "Bem apoiado: sobra atenção para a musculatura-alvo." },
    ],
  },
  {
    id: "complexidade",
    nome: "Complexidade técnica",
    oQueE: "O quanto é difícil executar com técnica correta, e o quanto exige ensino e supervisão.",
    escala: "0 a 100, comparativo entre os exercícios desta base.",
    referencial: "Relativo aos demais exercícios da base.",
    melhor: "menor",
    faixas: [
      { ate: 30, rotulo: "Simples", significado: "Aprende na primeira sessão. Serve para iniciante e para quem treina sem supervisão direta." },
      { ate: 60, rotulo: "Intermediária", significado: "Precisa de instrução e de algumas sessões de prática até ficar consistente." },
      { ate: 100, rotulo: "Exigente", significado: "Pede supervisão de perto. Com iniciante ou grupo especial, simplifique ou troque." },
    ],
  },
  {
    id: "gasto-energetico",
    nome: "Gasto energético",
    oQueE: "O quanto o exercício tende a gastar energia, comparado com os outros exercícios da base.",
    escala: "0 a 100, comparativo entre os exercícios desta base.",
    referencial:
      "É uma ordenação relativa, não caloria. Para caloria estimada em kcal, use o comparador de aeróbicos, que calcula por MET, tempo, intensidade e peso.",
    melhor: "depende",
    faixas: [
      { ate: 39, rotulo: "Baixo", significado: "Gasto discreto: exercício localizado ou de pouca massa envolvida." },
      { ate: 69, rotulo: "Médio", significado: "Gasto moderado." },
      { ate: 100, rotulo: "Alto", significado: "Envolve muita massa muscular; pesa no gasto da sessão." },
    ],
  },
];

const PORNOME = new Map<string, DefinicaoMetrica>();
for (const m of METRICAS) {
  PORNOME.set(m.nome.toLowerCase(), m);
  PORNOME.set(m.id, m);
}
// Nomes usados nos dados dos exercícios que apontam para a mesma definição.
const APELIDOS: Record<string, string> = {
  "ativação do músculo-alvo": "ativacao",
  "ativação primária": "ativacao",
  "contribuição muscular": "ativacao",
  "estabilidade de tronco": "estabilidade",
  "estabilidade escapular": "estabilidade",
  "estabilidade unilateral": "estabilidade",
};

/** Definição de uma métrica pelo rótulo exibido (ou por um apelido usado nos dados). */
export function getMetrica(nomeOuId: string): DefinicaoMetrica | undefined {
  const k = nomeOuId.trim().toLowerCase();
  return PORNOME.get(k) ?? (APELIDOS[k] ? PORNOME.get(APELIDOS[k]) : undefined);
}

/** A faixa (e o significado prático) em que um valor cai. */
export function faixaDe(metrica: DefinicaoMetrica, valor: number): FaixaMetrica | undefined {
  return metrica.faixas.find((f) => valor <= f.ate);
}
