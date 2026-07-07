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
      "Conseguir falar frases curtas costuma indicar intensidade leve a moderada — em geral adequada para começar.",
    seAlterado:
      "Se o aluno não consegue falar nem frases curtas, tende a ser prudente reduzir o ritmo.",
    gruposRelevantes: ["obesidade-grave", "hipertensao", "idoso-destreinado"],
    modalidadesUteis: ["m-caminhada", "m-bike", "m-hidro", "m-eliptico"],
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
      "Pouco prática ou pouco confiável no meio aquático, com certas medicações (ex.: alguns anti-hipertensivos) e sem equipamento — nesses casos, priorize PSE e teste da fala.",
    comoInterpretar:
      "Serve como uma referência de tendência ao longo das sessões, não como número absoluto isolado (validar faixas com diretriz específica).",
    seAlterado:
      "Respostas desproporcionais ao esforço sugerem cautela e podem indicar necessidade de reavaliação.",
    gruposRelevantes: ["hipertensao", "diabetes-tipo-2", "idoso-destreinado"],
    modalidadesUteis: ["m-caminhada", "m-bike", "m-eliptico", "m-musculacao"],
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
  },
  {
    id: "p-adesao",
    nome: "Adesão / frequência semanal",
    categoria: "adesão",
    resumo: "Quantas sessões o aluno de fato realiza por semana.",
    quandoUsar: "Sempre — é um dos preditores práticos de resultado e de abandono.",
    menosConfiavel: "Pode ser superestimada no autorrelato.",
    comoInterpretar:
      "Consistência costuma valer mais que intensidade nas fases iniciais; baixa adesão pede simplificar o plano.",
    seAlterado:
      "Queda de adesão sugere reduzir barreiras (tempo, complexidade, deslocamento) antes de aumentar carga.",
    gruposRelevantes: ["obesidade-grave", "idoso-destreinado", "diabetes-tipo-2", "hipertensao"],
    modalidadesUteis: ["m-caminhada", "m-hidro", "m-musculacao"],
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
