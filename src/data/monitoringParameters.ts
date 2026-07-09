/**
 * Parâmetros de monitoramento (fisiológicos, perceptivos, funcionais, de segurança e de
 * adesão) usados para APOIAR a decisão do profissional de Educação Física — não são condutas
 * clínicas. Linguagem prudente. Números específicos de diretrizes ficam para revisão posterior
 * ("validar com diretriz específica").
 */

export type ParamCategoria =
  | "fisiológico"
  | "perceptivo"
  | "funcional"
  | "segurança"
  | "adesão";

export interface MonitoringParameter {
  id: string;
  nome: string;
  sigla?: string;
  categoria: ParamCategoria;
  /** o que é / para que serve, em uma linha */
  resumo: string;
  quandoUsar: string;
  /** situações em que o parâmetro é menos confiável ou pouco viável */
  menosConfiavel: string;
  /** como interpretar de forma prudente (sem número clínico fixo) */
  comoInterpretar: string;
  /** o que considerar se estiver alterado — linguagem segura, não clínica */
  seAlterado: string;
  /** slugs de grupos especiais em que tende a ser mais relevante */
  gruposRelevantes: string[];
  /** ids de modalidades em que tende a ser mais útil */
  modalidadesUteis: string[];
  /** passo a passo prático de aplicação do parâmetro/teste */
  comoAplicar?: string[];
  /** escala de referência (quando o parâmetro tem uma) */
  escala?: { valor: string; rotulo: string }[];
  /** referência bibliográfica/base do teste (sem substituir a diretriz local) */
  referencia?: string;
  /** ids de referencias.ts (bibliografia numerada do Prontuário) */
  refIds?: string[];
  /** ficha imprimível disponível: escala de bolso ou ficha semanal de adesão */
  ficha?: "escala" | "adesao";
}

export const monitoringParameters: MonitoringParameter[] = [
  {
    id: "p-rpe",
    nome: "Percepção subjetiva de esforço",
    sigla: "PSE / RPE",
    categoria: "perceptivo",
    resumo: "O quanto o aluno sente que está se esforçando (ex.: escala de 0–10).",
    quandoUsar:
      "Quase sempre útil, especialmente quando medir frequência cardíaca não é viável (meio aquático, iniciantes, ausência de equipamento).",
    menosConfiavel:
      "Pode variar com humor, sono e experiência; iniciantes às vezes têm dificuldade de calibrar.",
    comoInterpretar:
      "Em geral, esforços leves a moderados tendem a ser mais prudentes nas fases iniciais; picos altos pedem cautela.",
    seAlterado:
      "PSE muito alta de forma recorrente sugere reduzir volume/intensidade e reavaliar a progressão.",
    gruposRelevantes: ["obesidade-grave", "hipertensao", "idoso-destreinado", "diabetes-tipo-2"],
    modalidadesUteis: ["m-hidro", "m-natacao", "m-caminhada", "m-musculacao", "m-bike"],
    comoAplicar: [
      "Apresente a escala antes da sessão: 0 = repouso total, 10 = esforço máximo.",
      "Ao fim da série ou do bloco, pergunte: “De 0 a 10, quão intenso foi?”",
      "Registre o número junto do exercício/bloco e acompanhe a tendência entre sessões.",
      "Nas fases iniciais, mire esforços percebidos leves a moderados (em geral 3–5).",
    ],
    escala: [
      { valor: "0", rotulo: "Repouso" },
      { valor: "1", rotulo: "Muito leve" },
      { valor: "2–3", rotulo: "Leve" },
      { valor: "4–5", rotulo: "Moderado: faixa comum de trabalho inicial" },
      { valor: "6–7", rotulo: "Intenso" },
      { valor: "8–9", rotulo: "Muito intenso" },
      { valor: "10", rotulo: "Máximo" },
    ],
    referencia:
      "Adaptada da escala de percepção de esforço de Borg (CR10). Borg G., 1982: Psychophysical bases of perceived exertion. Valide as faixas com a diretriz do seu contexto.",
    refIds: ["borg-1982", "foster-2001"],
    ficha: "escala",
  },
  {
    id: "p-fala",
    nome: "Teste da fala",
    categoria: "perceptivo",
    resumo: "Capacidade de manter uma conversa curta durante o esforço.",
    quandoUsar:
      "Prático em caminhada, bicicleta e meio aquático quando não há como medir a frequência cardíaca.",
    menosConfiavel: "Menos preciso em esforços muito intermitentes ou em ambientes muito ruidosos.",
    comoInterpretar:
      "Conseguir falar frases curtas costuma indicar intensidade leve a moderada, em geral adequada para começar.",
    seAlterado:
      "Se o aluno não consegue falar nem frases curtas, tende a ser prudente reduzir o ritmo.",
    gruposRelevantes: ["obesidade-grave", "hipertensao", "idoso-destreinado"],
    modalidadesUteis: ["m-caminhada", "m-bike", "m-hidro", "m-eliptico"],
    comoAplicar: [
      "Durante o esforço contínuo, peça uma frase curta (ex.: contar de 1 a 10 em voz alta).",
      "Classifique: fala confortável em frases completas → intensidade leve.",
      "Frases curtas com pausas para respirar → moderada (alvo comum nas fases iniciais).",
      "Palavras soltas ou incapaz de falar → intensidade alta: reduza o ritmo.",
    ],
    escala: [
      { valor: "Fala confortável", rotulo: "Leve: dá para progredir tempo/ritmo" },
      { valor: "Frases curtas", rotulo: "Moderada: faixa comum de trabalho inicial" },
      { valor: "Palavras soltas / sem falar", rotulo: "Alta: reduza o ritmo" },
    ],
    referencia:
      "Talk Test: método consagrado na prescrição aeróbia (ex.: Persinger et al., 2004). Valide com a diretriz do seu contexto.",
    refIds: ["persinger-2004"],
    ficha: "escala",
  },
  {
    id: "p-fc",
    nome: "Frequência cardíaca",
    sigla: "FC",
    categoria: "fisiológico",
    resumo: "Batimentos por minuto durante e após o esforço.",
    quandoUsar:
      "Útil quando há monitor confiável e o aluno não usa medicações que alterem a resposta cronotrópica.",
    menosConfiavel:
      "Pouco prática ou pouco confiável no meio aquático, com certas medicações (ex.: alguns anti-hipertensivos) e sem equipamento. Nesses casos, priorize PSE e teste da fala.",
    comoInterpretar:
      "Serve como uma referência de tendência ao longo das sessões, não como número absoluto isolado (validar faixas com diretriz específica).",
    seAlterado:
      "Respostas desproporcionais ao esforço sugerem cautela e podem indicar necessidade de reavaliação.",
    gruposRelevantes: ["hipertensao", "diabetes-tipo-2", "idoso-destreinado"],
    modalidadesUteis: ["m-caminhada", "m-bike", "m-eliptico", "m-musculacao"],
    comoAplicar: [
      "Meça em repouso, sentado, antes da sessão: é a referência do dia.",
      "Durante blocos contínuos, use monitor/cinta confiável; anote média e pico.",
      "Compare a resposta ao MESMO esforço ao longo das semanas (tendência, não número isolado).",
      "Com betabloqueadores ou no meio aquático a FC é pouco confiável: combine com PSE e teste da fala.",
    ],
    referencia:
      "Uso de tendência de FC conforme diretrizes de prescrição de exercício (ex.: ACSM, edição vigente). Faixas-alvo devem ser validadas com a diretriz do seu contexto.",
    refIds: ["acsm-getp11", "garber-2011"],
  },
  {
    id: "p-pa",
    nome: "Pressão arterial",
    sigla: "PA",
    categoria: "segurança",
    resumo: "Medida de contexto de segurança, quando disponível e indicada.",
    quandoUsar:
      "Como parâmetro de contexto em grupos com risco cardiovascular, quando houver equipamento e orientação adequada.",
    menosConfiavel: "Depende de técnica e equipamento; medição durante o esforço é limitada.",
    comoInterpretar:
      "Use como sinal de contexto e segurança, não para orientar conduta clínica (validar com diretriz específica).",
    seAlterado:
      "Valores muito alterados ou sintomas associados sugerem interromper a sessão e podem indicar necessidade de encaminhamento.",
    gruposRelevantes: ["hipertensao", "diabetes-tipo-2", "obesidade-grave"],
    modalidadesUteis: ["m-musculacao", "m-caminhada", "m-bike"],
    comoAplicar: [
      "Quando disponível e indicado: aluno sentado, ~5 min de repouso, braço apoiado na altura do coração.",
      "Registre antes da sessão como contexto de segurança, não como conduta clínica.",
      "Valores muito alterados ou sintomas associados → não inicie a sessão e oriente reavaliação.",
    ],
    referencia:
      "Técnica padrão de aferição conforme diretrizes de hipertensão vigentes. Decisões clínicas pertencem ao médico.",
    refIds: ["sbc-2020"],
  },
  {
    id: "p-dispneia",
    nome: "Dispneia percebida",
    categoria: "perceptivo",
    resumo: "Sensação de falta de ar durante o esforço.",
    quandoUsar: "Útil em obesidade, baixa aptidão e meio aquático.",
    menosConfiavel: "Subjetiva; pode ser confundida com ansiedade ou desconforto do ambiente.",
    comoInterpretar:
      "Dispneia leve que melhora com a pausa costuma ser esperada; falta de ar intensa ou que não cede pede atenção.",
    seAlterado:
      "Dispneia desproporcional ou persistente sugere interromper e reavaliar; pode indicar necessidade de encaminhamento.",
    gruposRelevantes: ["obesidade-grave", "hipertensao"],
    modalidadesUteis: ["m-hidro", "m-natacao", "m-caminhada"],
    comoAplicar: [
      "Apresente a escala: 0 = nenhuma falta de ar, 10 = máxima.",
      "Pergunte durante e logo após os blocos de esforço.",
      "Observe se a falta de ar cede com 1–2 minutos de pausa.",
      "Registre o pico da sessão e compare entre sessões.",
    ],
    escala: [
      { valor: "0", rotulo: "Nenhuma" },
      { valor: "1–2", rotulo: "Leve: esperada no esforço" },
      { valor: "3–4", rotulo: "Moderada: observe a recuperação na pausa" },
      { valor: "5–6", rotulo: "Intensa: reduza o ritmo" },
      { valor: "7–9", rotulo: "Muito intensa: pausa imediata" },
      { valor: "10", rotulo: "Máxima: interromper e reavaliar" },
    ],
    referencia:
      "Escala de dispneia adaptada de Borg (CR10 modificada), amplamente usada em reabilitação. Valide com a diretriz do seu contexto.",
    ficha: "escala",
  },
  {
    id: "p-dor",
    nome: "Dor percebida",
    categoria: "funcional",
    resumo: "Presença e intensidade de dor (ex.: articular) durante/ após o exercício.",
    quandoUsar: "Central em dor lombar, osteoartrite e retorno ao exercício.",
    menosConfiavel: "Percepção individual varia muito; medo pode amplificar a dor relatada.",
    comoInterpretar:
      "Dor leve que não piora ao longo da sessão costuma ser tolerável; dor que aumenta ou muda o padrão de movimento pede ajuste.",
    seAlterado:
      "Dor crescente sugere reduzir amplitude/carga, trocar a modalidade ou reavaliar; dor aguda intensa indica interromper.",
    gruposRelevantes: ["dor-lombar-inespecifica", "osteoartrite-joelho", "obesidade-grave"],
    modalidadesUteis: ["m-hidro", "m-mobilidade", "m-musculacao", "m-bike"],
    comoAplicar: [
      "Pergunte antes, durante e depois: “De 0 a 10, quanto dói agora?”",
      "Registre onde dói e em qual movimento/exercício apareceu.",
      "Compare com as 24–48h seguintes: dor que aumenta depois da sessão também conta.",
      "Regra prática prudente: dor leve (≤3) que não piora tende a ser tolerável; dor crescente pede ajuste.",
    ],
    escala: [
      { valor: "0", rotulo: "Sem dor" },
      { valor: "1–3", rotulo: "Leve: em geral tolerável se não piora" },
      { valor: "4–6", rotulo: "Moderada: ajuste amplitude/carga" },
      { valor: "7–9", rotulo: "Intensa: interrompa o exercício que provoca" },
      { valor: "10", rotulo: "Pior dor imaginável: interromper e reavaliar" },
    ],
    referencia:
      "Escala numérica de dor 0–10 (END/NRS), amplamente usada em reabilitação. Valide com a diretriz do seu contexto.",
    ficha: "escala",
  },
  {
    id: "p-fadiga",
    nome: "Fadiga pós-sessão",
    categoria: "funcional",
    resumo: "Quão cansado o aluno fica horas/ dias após a sessão.",
    quandoUsar: "Bom indicador de dose adequada em iniciantes e grupos frágeis.",
    menosConfiavel: "Influenciada por sono, trabalho e alimentação.",
    comoInterpretar:
      "Fadiga que se recupera até a próxima sessão sugere dose adequada; fadiga acumulada sugere excesso.",
    seAlterado:
      "Fadiga persistente entre sessões tende a pedir redução de volume e mais recuperação.",
    gruposRelevantes: ["idoso-destreinado", "obesidade-grave", "diabetes-tipo-2"],
    modalidadesUteis: ["m-musculacao", "m-combinado", "m-caminhada"],
    comoAplicar: [
      "Na sessão seguinte, pergunte: “Como ficou o cansaço nas 24–48h depois do treino?”",
      "Classifique em 3 níveis: recuperado · cansado mas treinável · exausto.",
      "Fadiga que não se resolve até a próxima sessão sugere reduzir a dose (volume/intensidade).",
    ],
  },
  {
    id: "p-recuperacao",
    nome: "Recuperação entre sessões",
    categoria: "funcional",
    resumo: "Disposição e prontidão para treinar na sessão seguinte.",
    quandoUsar: "Útil para decidir se avança, mantém ou regride o volume.",
    menosConfiavel: "Autorrelato; depende de rotina e contexto do aluno.",
    comoInterpretar:
      "Boa recuperação abre espaço para progressão; recuperação ruim sugere manter ou reduzir.",
    seAlterado: "Recuperação insuficiente recorrente sugere regressão temporária da carga.",
    gruposRelevantes: ["idoso-destreinado", "obesidade-grave"],
    modalidadesUteis: ["m-musculacao", "m-combinado"],
    comoAplicar: [
      "No início da sessão, pergunte: “De 0 a 10, quão recuperado você chegou hoje?”",
      "Cruze com a carga da sessão anterior para decidir: progredir, manter ou regredir.",
      "Registre: a tendência ao longo das semanas informa a dose ideal.",
    ],
  },
  {
    id: "p-adesao",
    nome: "Adesão / frequência semanal",
    categoria: "adesão",
    resumo: "Quantas sessões o aluno de fato realiza por semana.",
    quandoUsar: "Sempre: é um dos preditores práticos de resultado e de abandono.",
    menosConfiavel: "Pode ser superestimada no autorrelato.",
    comoInterpretar:
      "Consistência costuma valer mais que intensidade nas fases iniciais; baixa adesão pede simplificar o plano.",
    seAlterado:
      "Queda de adesão sugere reduzir barreiras (tempo, complexidade, deslocamento) antes de aumentar carga.",
    gruposRelevantes: ["obesidade-grave", "idoso-destreinado", "diabetes-tipo-2", "hipertensao"],
    modalidadesUteis: ["m-caminhada", "m-hidro", "m-musculacao"],
    comoAplicar: [
      "Combine com o aluno uma meta semanal realista (ex.: 2–3 sessões).",
      "Registre TODA sessão realizada na ficha semanal, inclusive as feitas sem supervisão.",
      "Reveja a cada 2–4 semanas: se a adesão cair, simplifique o plano antes de intensificar.",
      "Imprima a ficha de registro (botão abaixo) e use como combinado visível com o aluno.",
    ],
    referencia:
      "Na prática, a adesão é um dos preditores mais fortes de resultado e de abandono a longo prazo.",
    ficha: "adesao",
  },
  {
    id: "p-volume",
    nome: "Volume semanal / tempo de sessão",
    categoria: "funcional",
    resumo: "Duração e quantidade total de trabalho ao longo da semana.",
    quandoUsar: "Para dosar progressões graduais, especialmente em iniciantes.",
    menosConfiavel: "Volume alto não significa qualidade; precisa ser lido junto com fadiga e dor.",
    comoInterpretar:
      "Aumentos pequenos e graduais tendem a ser mais prudentes que saltos grandes de volume.",
    seAlterado:
      "Sintomas ou fadiga ao subir volume sugerem estabilizar antes de progredir novamente.",
    gruposRelevantes: ["idoso-destreinado", "obesidade-grave", "dor-lombar-inespecifica"],
    modalidadesUteis: ["m-caminhada", "m-bike", "m-musculacao", "m-combinado"],
    comoAplicar: [
      "Some os minutos de todas as sessões da semana (a ficha de adesão ajuda).",
      "Progrida em degraus pequenos (na prática, ~10%/semana) apenas se dor e fadiga permitirem.",
      "Ao subir volume, segure a intensidade: um degrau de cada vez.",
    ],
  },
];

export function getParam(id: string) {
  return monitoringParameters.find((p) => p.id === id);
}

export const paramCategoriaTone: Record<ParamCategoria, "primary" | "analysis" | "cta" | "success" | "warning"> = {
  "fisiológico": "primary",
  "perceptivo": "analysis",
  "funcional": "success",
  "segurança": "warning",
  "adesão": "cta",
};
