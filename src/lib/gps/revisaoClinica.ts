/**
 * A REVISÃO CLÍNICA DAS 23 CONDIÇÕES, feita pelo Filipe em 09/09/2026.
 *
 * ## Por que este arquivo existe
 *
 * O documento de validação do motor imprime uma tabela chamada "Aeróbio e camadas por
 * indicação", lida direto de `groupGpsRules`. Ela saiu quase toda vazia, e o Filipe leu a
 * tabela e devolveu duas versões corrigidas, cada uma cobrindo metade das condições. A tabela
 * estava vazia porque o motor só DECLARA o que ele APLICA: célula vazia ali significa "o motor
 * não impõe nada neste item", e não "não há orientação para este item".
 *
 * As duas coisas precisam conviver, e separadas:
 *
 * - `groupGpsRules` é o que o MOTOR FAZ. Todo campo de lá muda o plano gerado, e por isso todo
 *   campo de lá precisa de evidência publicada e verificada, com `refId`.
 * - este arquivo é a ORIENTAÇÃO CLÍNICA que o profissional lê ao lado do plano. Ela é a leitura
 *   do Filipe (doutor e professor de Educação Física, autoridade de domínio deste produto)
 *   sobre a literatura de cada condição, e está declarada como tal. Ela não move nenhum número
 *   do plano.
 *
 * Misturar as duas seria o defeito que este projeto já cometeu antes com outro nome: cautela
 * declarada que ninguém aplica, ou pior, texto de orientação virando regra automática. Uma
 * frase como "equilíbrio se houver limitação funcional" é orientação para quem avalia o aluno,
 * não condição booleana que o motor tem como avaliar sozinho.
 *
 * ## Como ler as células
 *
 * O texto é o do Filipe, com duas alterações de forma e nenhuma de conteúdo: travessão não
 * entra em texto visível (regra da casa) e o campo simplesmente fica ausente, e as abreviações
 * viraram frase inteira. Onde ele escreveu duas leituras para a mesma condição (ansiedade e
 * sintomas depressivos chegaram em linhas separadas e o motor tem uma condição só), as duas
 * estão no texto, nomeadas.
 *
 * ## O que esta revisão MUDOU no motor
 *
 * Duas células contradiziam o código, e nos dois casos o código cedeu (ver `groupRules.ts`):
 *  1. gestante declarava veto ao isométrico. Ele escreveu, com todas as letras, que "não existe
 *     veto geral a isométricos"; o que existe é evitar esforço máximo prolongado, manobra de
 *     Valsalva e situações obstétricas de risco. O veto derrubava também a indicação de quem
 *     tem hipertensão, porque `evitar` de uma condição vence `indicado` de todas.
 *  2. ansiedade e sintomas depressivos declaravam intervalado INDICADO. Para ele, o intervalado
 *     ali é opcional. O teto de banda vigorosa continua, porque teto e obrigação são coisas
 *     diferentes e ele diz o mesmo ("vigoroso não deve ser obrigatório").
 */

/** Uma linha da revisão. Todo campo é opcional: ausente significa "ele não escreveu nada aqui". */
export interface RevisaoClinica {
  /** prioridade da prescrição: o que vem primeiro nesta condição */
  prioridade?: string;
  /** intensidade e volume do aeróbio, ou o teto de banda que ele registrou */
  aerobio?: string;
  /** o que ele escreveu sobre o treino resistido */
  resistido?: string;
  /** modalidade preferida */
  modalidades?: string;
  /** intervalado e HIIT */
  intervalado?: string;
  /** exercício isométrico */
  isometrico?: string;
  /** equilíbrio e impacto */
  equilibrio?: string;
  /** assoalho pélvico */
  assoalho?: string;
  /** a cautela específica desta condição */
  cautela?: string;
}

export const revisaoClinicaPorCondicao: Record<string, RevisaoClinica> = {
  /* ---------------- Tabela 2 da revisão (13 condições) ---------------- */
  "obesidade-grau-1": {
    prioridade: "Aeróbio e resistido combinados",
    aerobio: "Sem teto específico; a progressão segue a capacidade do aluno",
    modalidades: "Aeróbio moderado e resistido, respeitando a preferência do aluno",
    intervalado: "Opcional, recomendado depois da adaptação",
    assoalho: "Se houver disfunção",
  },
  "obesidade-grau-2": {
    prioridade: "Aeróbio e resistido combinados",
    aerobio: "Individualizar",
    modalidades: "Aeróbio e resistido, de baixo impacto quando necessário",
    intervalado: "Opcional e condicional",
    assoalho: "Se houver disfunção",
  },
  "obesidade-grau-3": {
    prioridade: "Aeróbio e resistido combinados",
    aerobio: "Iniciar de forma conservadora, sem limitar a prescrição apenas pelo IMC",
    modalidades: "Baixo impacto (bicicleta, elíptico, caminhada tolerada, aquático) somado ao resistido",
    intervalado: "Condicional",
    equilibrio: "Se houver limitação funcional",
    assoalho: "Se houver disfunção",
  },
  "hipertensao-estagio-1": {
    prioridade: "Aeróbio e resistido combinados",
    aerobio: "Moderada, podendo chegar a vigorosa se a pressão estiver controlada",
    modalidades: "Aeróbio e resistido",
    intervalado: "Permitido se a pressão estiver controlada",
    isometrico: "Recomendado como adjuvante",
  },
  "hipertensao-estagio-2": {
    prioridade: "Aeróbio e resistido combinados",
    aerobio: "Progressão mais cautelosa",
    modalidades: "Aeróbio e resistido",
    intervalado: "Condicional",
    isometrico: "Recomendado se a pressão estiver controlada",
  },
  "diabetes-tipo-2": {
    prioridade: "Aeróbio e resistido combinados",
    aerobio: "Moderada a vigorosa",
    modalidades: "Aeróbio e resistido",
    intervalado: "Opcional, recomendado em quem está apto",
    equilibrio: "Se idoso, com neuropatia ou com risco de queda",
  },
  "idoso-destreinado": {
    prioridade: "Multicomponente",
    aerobio: "Baixa a moderada no início",
    modalidades: "Multicomponente: aeróbio, força e trabalho funcional",
    intervalado: "Não é prioridade no início",
    isometrico: "Opcional",
    equilibrio: "Prioridade",
    assoalho: "Se houver indicação",
  },
  "dor-lombar-inespecifica": {
    prioridade: "Aeróbio, força de tronco e exercício funcional",
    aerobio: "Conforme os sintomas e a tolerância",
    modalidades: "Não há modalidade única: aeróbio, força de tronco e exercício funcional e motor",
    intervalado: "Opcional",
    isometrico: "Pode compor",
    equilibrio: "Opcional",
  },
  "osteoartrite-joelho": {
    prioridade: "Aeróbio, força e trabalho neuromuscular",
    aerobio: "Conforme os sintomas e a tolerância",
    modalidades: "Aeróbio, força e neuromuscular; bicicleta, caminhada e aquático",
    intervalado: "Opcional",
    isometrico: "Pode compor a força",
    equilibrio: "Recomendado, condicional",
  },
  "iniciante-sedentario": {
    prioridade: "Adesão antes de tudo",
    aerobio: "Baixa a moderada, progressiva",
    modalidades: "A modalidade de maior adesão para este aluno",
    intervalado: "Posteriormente",
    equilibrio: "Se necessário",
  },
  "retorno-inatividade": {
    prioridade: "Retomada progressiva",
    aerobio: "Reduzir no início e progredir",
    modalidades: "A modalidade habitual do aluno, com progressão gradual",
    intervalado: "Posteriormente",
    equilibrio: "Se necessário",
  },
  "pre-diabetes": {
    prioridade: "Aeróbio e resistido combinados",
    aerobio: "Predominantemente moderada, podendo progredir",
    modalidades: "Aeróbio e resistido",
    intervalado: "Opcional",
  },
  "sindrome-metabolica": {
    prioridade: "Aeróbio e resistido combinados",
    aerobio: "Moderada a vigorosa conforme o risco",
    modalidades: "Aeróbio e resistido",
    intervalado: "Opcional e condicional",
  },

  /* ---------------- Tabela 1 da revisão (11 linhas, 10 condições) ---------------- */
  dislipidemia: {
    prioridade: "Aeróbio e resistido",
    aerobio: "150 minutos ou mais por semana, de moderada a vigorosa",
    resistido: "Recomendado, 2 ou mais vezes por semana",
    intervalado: "Opcional",
    cautela: "A intensidade pode progredir conforme o risco cardiovascular",
  },
  "esteatose-hepatica": {
    prioridade: "Aeróbio e resistido",
    aerobio: "Mais de 150 minutos moderados ou 75 minutos vigorosos por semana",
    resistido: "Recomendado",
    intervalado: "Permitido, sem superioridade sobre o contínuo",
    cautela: "O benefício hepático ocorre mesmo sem perda de peso",
  },
  sarcopenia: {
    prioridade: "Resistido progressivo",
    aerobio: "Complementar",
    resistido: "Prioridade máxima",
    intervalado: "Secundário",
    equilibrio: "Recomendado, sobretudo em idosos e em quem tem risco de queda",
    cautela: "Incluir trabalho de potência quando a capacidade permitir",
  },
  osteoporose: {
    prioridade: "Força, carga óssea e equilíbrio",
    aerobio: "Complementar",
    resistido: "Prioridade",
    intervalado: "Não é prioridade",
    equilibrio: "Prioridade",
    cautela: "Adaptar o impacto e os movimentos da coluna ao risco de fratura",
  },
  gestante: {
    prioridade: "Aeróbio e força",
    aerobio: "Cerca de 150 minutos por semana em intensidade moderada",
    resistido: "Recomendado",
    intervalado: "Condicional",
    equilibrio: "Evitar atividades com alto risco de queda",
    assoalho: "Recomendado",
    cautela:
      "Não existe veto geral a exercício isométrico; o que se evita é esforço máximo prolongado, manobra de Valsalva e situações obstétricas de risco",
  },
  "pos-parto": {
    prioridade: "Retorno progressivo e força",
    aerobio: "120 minutos ou mais por semana de atividade moderada a vigorosa, de forma progressiva",
    resistido: "Recomendado",
    intervalado: "Progressão posterior",
    equilibrio: "Conforme os sintomas e o retorno esportivo",
    assoalho: "Prioridade",
    cautela: "A progressão é guiada por cicatrização, sangramento e sintomas pélvicos",
  },
  climaterio: {
    prioridade: "Força, aeróbio e carga óssea",
    aerobio: "Moderada a vigorosa conforme a capacidade",
    resistido: "Prioridade",
    intervalado: "Opcional",
    equilibrio: "Recomendado, principalmente após a menopausa e com risco ósseo",
    assoalho: "Se houver sintomas ou disfunção",
    cautela: "Não existe uma modalidade da menopausa",
  },
  "apneia-sono": {
    prioridade: "Aeróbio e resistido",
    aerobio: "Aeróbio regular",
    resistido: "Recomendado",
    intervalado: "Opcional",
    cautela: "O exercício é adjuvante e não substitui o CPAP quando ele está indicado",
  },
  "asma-controlada": {
    prioridade: "Aeróbio e força, conforme a preferência",
    aerobio: "Moderada a vigorosa, permitida se a asma estiver controlada",
    resistido: "Recomendado",
    intervalado: "Pode ser útil, não é obrigatório",
    cautela: "Aquecimento e plano para a broncoconstrição induzida pelo exercício",
  },
  /*
   * DUAS LINHAS DA REVISÃO PARA UMA CONDIÇÃO SÓ. O motor tem `ansiedade-depressao`, e ele
   * revisou ansiedade e sintomas depressivos separados. As duas leituras estão aqui nomeadas,
   * porque resumi-las numa só apagaria justamente onde elas divergem: a intensidade.
   */
  "ansiedade-depressao": {
    prioridade: "Na ansiedade, aeróbio ou força conforme a preferência; nos sintomas depressivos, aeróbio e força",
    aerobio: "Na ansiedade, a moderada costuma ser muito adequada; nos sintomas depressivos, moderada a vigorosa",
    resistido: "Recomendado nas duas",
    intervalado: "Opcional nas duas",
    equilibrio: "Ioga e tai chi aparecem como opção nas duas, com evidência também nos sintomas depressivos",
    cautela:
      "Adesão e tolerabilidade são fundamentais; intensidades mais altas podem produzir efeito maior, mas o vigoroso não deve ser obrigatório",
  },
};
