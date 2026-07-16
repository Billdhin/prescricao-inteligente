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
    id: "isolamento",
    nome: "Isolamento",
    oQueE: "O quanto o exercício concentra o esforço em um músculo só, em vez de distribuir entre vários.",
    escala: "0 a 100, comparativo entre os exercícios desta base.",
    referencial:
      "Relativo aos demais exercícios da base. Valor alto não quer dizer exercício melhor, quer dizer foco estreito: rende para corrigir um elo fraco específico e rende pouco como base do treino de quem tem pouco tempo.",
    melhor: "depende",
    faixas: [
      { ate: 39, rotulo: "Multiarticular", significado: "Distribui o esforço entre vários músculos: rende mais por série, mas não corrige um elo fraco específico." },
      { ate: 69, rotulo: "Misto", significado: "Tem um alvo claro, com ajuda de outros músculos." },
      { ate: 100, rotulo: "Isolado", significado: "Concentra em um músculo: útil em elo fraco, retorno controlado ou quando o multiarticular não é opção." },
    ],
  },
  {
    id: "acessibilidade",
    nome: "Acessibilidade",
    oQueE: "O quanto o exercício é fácil de montar: equipamento simples, pouco espaço, pouca dependência de estrutura de academia.",
    escala: "0 a 100, comparativo entre os exercícios desta base.",
    referencial:
      "Relativo aos demais exercícios da base. Alto quer dizer que dá para executar em casa, ao ar livre ou em academia pequena, sem depender de máquina específica.",
    melhor: "maior",
    faixas: [
      { ate: 39, rotulo: "Depende de estrutura", significado: "Precisa de máquina ou espaço específico: some do treino quando o aluno viaja ou troca de academia." },
      { ate: 69, rotulo: "Média", significado: "Pede algum equipamento, mas com alternativas fáceis." },
      { ate: 100, rotulo: "Alta", significado: "Executa em quase qualquer lugar: sustenta a continuidade de quem treina em casa." },
    ],
  },
  {
    id: "transferencia-funcional",
    nome: "Transferência funcional",
    oQueE: "O quanto o padrão de movimento se parece com tarefas do dia a dia, como levantar da cadeira, subir escada ou pegar peso do chão.",
    escala: "0 a 100, comparativo entre os exercícios desta base.",
    referencial:
      "Relativo aos demais exercícios da base, e é semelhança de padrão motor, não promessa de resultado. O ganho em autonomia depende de carga, progressão e da prática da própria tarefa.",
    melhor: "maior",
    faixas: [
      { ate: 39, rotulo: "Baixa", significado: "Padrão distante do dia a dia: treina o músculo, não a tarefa." },
      { ate: 69, rotulo: "Média", significado: "Tem elementos do padrão cotidiano." },
      { ate: 100, rotulo: "Alta", significado: "Repete um padrão que o aluno usa fora da academia: costuma render em autonomia, sobretudo no idoso." },
    ],
  },
  {
    id: "massa-envolvida",
    nome: "Massa muscular envolvida",
    oQueE: "Quanto do corpo participa do movimento, de um músculo só até pernas, tronco e braços ao mesmo tempo.",
    escala: "0 a 100, comparativo entre os exercícios desta base.",
    referencial:
      "Relativo aos demais exercícios da base. Envolver mais massa costuma elevar o gasto e a demanda cardiovascular. Não é sinônimo de melhor.",
    melhor: "depende",
    faixas: [
      { ate: 39, rotulo: "Localizada", significado: "Uma região só: pouca repercussão cardiovascular." },
      { ate: 69, rotulo: "Regional", significado: "Envolve um segmento inteiro." },
      { ate: 100, rotulo: "Global", significado: "Envolve grande parte do corpo: pesa no gasto da sessão e na resposta cardiovascular. Observe quem controla pressão." },
    ],
  },
  {
    id: "controle-motor",
    nome: "Controle motor",
    oQueE: "O quanto o exercício depende de coordenação fina e de sustentar uma posição sob controle, em vez de apenas mover carga.",
    escala: "0 a 100, comparativo entre os exercícios desta base.",
    referencial:
      "Relativo aos demais exercícios da base. Alto quer dizer que o controle é o próprio estímulo: é o que o exercício treina e, ao mesmo tempo, o que ele cobra. Não confunda com Complexidade técnica, que mede o quanto é difícil aprender a execução.",
    melhor: "depende",
    faixas: [
      { ate: 39, rotulo: "Pouco", significado: "O movimento se sustenta sozinho: dá para carregar sem pensar na posição." },
      { ate: 69, rotulo: "Médio", significado: "Pede atenção à posição durante a série." },
      { ate: 100, rotulo: "Muito", significado: "O controle é o estímulo principal: rende em consciência corporal e frustra quem só quer carga." },
    ],
  },
  {
    id: "tensao-constante",
    nome: "Tensão constante",
    oQueE: "O quanto a resistência se mantém ao longo de toda a amplitude, em vez de sumir em parte do movimento.",
    escala: "0 a 100, comparativo entre os exercícios desta base.",
    referencial:
      "Relativo aos demais exercícios da base, e depende do tipo de resistência: polia e elástico mantêm tensão em quase toda a amplitude; peso livre perde tensão onde a alavanca fica favorável.",
    melhor: "depende",
    faixas: [
      { ate: 39, rotulo: "Varia muito", significado: "A carga alivia em parte do movimento: sobra descanso dentro da própria repetição." },
      { ate: 69, rotulo: "Parcial", significado: "Mantém tensão na maior parte da amplitude." },
      { ate: 100, rotulo: "Constante", significado: "Tensão do início ao fim: mais tempo sob tensão pela mesma série." },
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
/**
 * Métricas cujo rótulo é o NOME DE UM MÚSCULO ("Glúteos 80", "Quadríceps 92").
 * Auditadas uma a uma contra o array `ativacao` do mesmo exercício: batem todas,
 * são a mesma ativação relativa dita com outro rótulo. Ficam como apelido para que
 * o rótulo continue nomeando o músculo (que é a informação útil) e o clique
 * explique a escala: relativa ao próprio músculo, não fatia de um todo.
 */
const MUSCULOS_COMO_ATIVACAO = [
  "quadríceps",
  "glúteos",
  "posteriores",
  "panturrilha",
  "peitoral",
  "dorsais",
  "costas",
  "costas (espessura)",
  "trapézio médio",
  "deltoides",
  "bíceps",
  "tríceps",
  "core",
];

// Nomes usados nos dados dos exercícios que apontam para a mesma definição.
const APELIDOS: Record<string, string> = {
  "ativação do músculo-alvo": "ativacao",
  "ativação primária": "ativacao",
  "contribuição muscular": "ativacao",
  ...Object.fromEntries(MUSCULOS_COMO_ATIVACAO.map((m) => [m, "ativacao"])),
  "estabilidade de tronco": "estabilidade",
  "estabilidade escapular": "estabilidade",
  "estabilidade unilateral": "estabilidade",
  // "controle escapular" e "equilíbrio" são o mesmo conceito de controle fino,
  // ditos com o nome da região onde ele aparece.
  "controle escapular": "controle-motor",
  equilíbrio: "controle-motor",
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
