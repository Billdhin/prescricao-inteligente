/**
 * Grupos especiais e suas JORNADAS de prescrição (fases). Conteúdo EDUCACIONAL e prudente
 * para apoiar a decisão do profissional de Educação Física — não é conduta clínica,
 * diagnóstica ou terapêutica e não substitui avaliação médica. Faixas/valores específicos
 * de diretrizes ficam para revisão posterior ("validar com diretriz específica").
 */

export type Complexidade = "Baixa" | "Moderada" | "Alta";

export interface JourneyPhase {
  numero: 1 | 2 | 3 | 4;
  nome: string;
  foco: string;
  objetivo: string;
  /** ids de modalities prioritárias na fase */
  modalidades: string[];
  /** ids de monitoringParameters a acompanhar */
  parametros: string[];
  criteriosAvancar: string[];
  criteriosRegredir: string[];
  estruturaSemanal: string;
  justificativa: string;
}

export interface SpecialGroup {
  slug: string;
  nome: string;
  /** Nome do PROGRAMA como aparece nos documentos entregues ao aluno.
   *  O rótulo clínico ("Idoso frágil", "Obesidade mórbida") serve ao profissional,
   *  mas constrange o aluno num PDF assinado; aqui vai um nome digno e descritivo. */
  rotuloAluno: string;
  descricaoCurta: string;
  perfil: string;
  objetivos: string[];
  riscosCautelas: string[];
  /** sinais que sugerem interromper, reavaliar ou encaminhar */
  sinaisAlerta: string[];
  modalidadesIndicadas: string[];
  modalidadesCautela: string[];
  parametros: string[];
  comoComecar: string;
  errosComuns: string[];
  casosRelacionados: string[];
  complexidade: Complexidade;
  premium: boolean;
  fases: JourneyPhase[];
}

const NOMES_FASE = [
  "Entrada · segurança · adaptação",
  "Construção de capacidade",
  "Desenvolvimento",
  "Autonomia · manutenção avançada",
] as const;

const FOCO_FASE = [
  "Tolerância ao exercício, aderência, controle de sinais e sintomas, técnica básica, baixo impacto.",
  "Aumento gradual de volume, melhora cardiorrespiratória, força básica, controle do esforço percebido.",
  "Maior diversidade de modalidades, progressão de intensidade, mais autonomia, força + aeróbio.",
  "Manutenção dos resultados, progressão individualizada, prevenção de abandono, melhora compatível com o perfil.",
] as const;

/**
 * Constrói uma condição adicional com jornada de 4 fases a partir de uma
 * especificação compacta. A jornada usa uma progressão base (entrada, construção,
 * desenvolvimento, manutenção) adaptada às modalidades e parâmetros da condição.
 * Conteúdo educacional e prudente, NÃO diagnóstico: apoia a decisão do profissional
 * habilitado (CREF) e, quando indicado, a liberação do profissional de saúde.
 */
function mkCondicao(s: {
  slug: string;
  nome: string;
  rotuloAluno: string;
  descricaoCurta: string;
  perfil: string;
  objetivos: string[];
  riscosCautelas: string[];
  sinaisAlerta: string[];
  modIndicadas: string[];
  modCautela: string[];
  parametros: string[];
  comoComecar: string;
  errosComuns: string[];
  complexidade: Complexidade;
  premium?: boolean;
  /** condições em que a orientação prudente é MANTER intensidade moderada e
   *  estável (ex.: gestação), sem buscar progressão de intensidade nas fases. */
  manterIntensidade?: boolean;
}): SpecialGroup {
  const objetivoFase = s.manterIntensidade
    ? [
        "Tolerar o exercício, criar o hábito e completar as sessões com segurança e conforto.",
        "Manter a aptidão e a força em intensidade moderada, controlando o esforço.",
        "Sustentar a rotina em intensidade moderada, ajustando ao contexto e aos sinais.",
        "Manter os resultados e a autonomia, prevenindo o abandono.",
      ]
    : [
        "Tolerar o exercício, criar o hábito e completar as sessões com segurança e conforto.",
        "Aumentar o volume de forma gradual e introduzir força básica guiada, controlando o esforço.",
        "Diversificar modalidades e progredir a intensidade com mais autonomia, mantendo o controle de sinais.",
        "Manter os resultados, individualizar a rotina e prevenir o abandono.",
      ];
  const estrutura = s.manterIntensidade
    ? [
        "2 a 3 sessões curtas das modalidades indicadas, mais mobilidade; esforço leve a moderado guiado por PSE e teste da fala.",
        "2 a 3 sessões aeróbias moderadas e estáveis, 1 a 2 sessões de força guiada e mobilidade.",
        "Rotina combinada moderada e estável, guiada pelo teste da fala, sem buscar picos de intensidade.",
        "Rotina moderada individualizada, com variação para manter o engajamento.",
      ]
    : [
        "2 a 3 sessões curtas das modalidades indicadas, mais mobilidade; esforço leve guiado por PSE e teste da fala.",
        "2 a 3 sessões aeróbias de tempo crescente, 1 a 2 sessões de força guiada e mobilidade.",
        "Combinar força e aeróbio; introduzir modalidades adicionais toleradas; blocos um pouco mais intensos e controlados.",
        "Rotina combinada individualizada, com variação para manter o engajamento e prevenir lesões.",
      ];
  const avancar = [
    ["Completa as sessões sem piora de sintomas", "Esforço percebido sob controle e teste da fala confortável", "Boa adesão por algumas semanas"],
    ["Aumenta o tempo total sem piora dos sintomas", "Executa a força com técnica estável", "Recuperação adequada entre as sessões"],
    ["Tolera as novas modalidades sem sintomas relevantes", "Progride a carga com boa técnica", "Boa recuperação com mais volume"],
    ["Autonomia para conduzir parte do treino", "Metas de longo prazo estáveis"],
  ];
  const regredir = [
    ["Sintomas ou dor aumentando entre as sessões", "Fadiga ou dispneia desproporcionais", "Adesão caindo pela dificuldade"],
    ["Fadiga acumulada", "Piora de sintomas ao subir o volume", "Recuperação insuficiente"],
    ["Retorno de sintomas com as novas modalidades", "Queda de recuperação ou de adesão"],
    ["Sinais de sobrecarga", "Perda de adesão"],
  ];
  const fases: JourneyPhase[] = [0, 1, 2, 3].map((i) => ({
    numero: (i + 1) as 1 | 2 | 3 | 4,
    nome: NOMES_FASE[i],
    foco: FOCO_FASE[i],
    objetivo: objetivoFase[i],
    modalidades: i === 0 ? Array.from(new Set([...s.modIndicadas.slice(0, 2), "m-mobilidade"])) : s.modIndicadas,
    parametros: s.parametros,
    criteriosAvancar: avancar[i],
    criteriosRegredir: regredir[i],
    estruturaSemanal: estrutura[i],
    justificativa: "Progressão gradual respeitando a tolerância e os sinais, com a adesão como base de qualquer avanço.",
  }));
  return {
    slug: s.slug,
    nome: s.nome,
    rotuloAluno: s.rotuloAluno,
    descricaoCurta: s.descricaoCurta,
    perfil: s.perfil,
    objetivos: s.objetivos,
    riscosCautelas: s.riscosCautelas,
    sinaisAlerta: s.sinaisAlerta,
    modalidadesIndicadas: s.modIndicadas,
    modalidadesCautela: s.modCautela,
    parametros: s.parametros,
    comoComecar: s.comoComecar,
    errosComuns: s.errosComuns,
    casosRelacionados: [],
    complexidade: s.complexidade,
    premium: s.premium ?? false,
    fases,
  };
}

const specialGroupsBase: SpecialGroup[] = [
  {
    slug: "obesidade-grave",
    nome: "Obesidade grave / mórbida",
    rotuloAluno: "Recondicionamento de baixo impacto",
    descricaoCurta: "Baixa tolerância a impacto e a volume; prioridade em adesão e segurança.",
    perfil:
      "Pessoa com obesidade grave, em geral destreinada, que costuma cansar rápido, tolera pouco tempo de caminhada e pode ter desconforto articular. Autoconfiança e adesão são pontos sensíveis.",
    objetivos: [
      "Criar tolerância ao exercício e hábito (adesão)",
      "Melhorar capacidade cardiorrespiratória com baixo impacto",
      "Ganhar força e função para o dia a dia",
      "Reduzir desconforto articular e risco de abandono",
    ],
    riscosCautelas: [
      "Sobrecarga articular com impacto/volume altos",
      "Dispneia e baixa tolerância inicial",
      "Termorregulação e conforto no ambiente",
      "Risco cardiovascular associado: exige contexto e cautela",
    ],
    sinaisAlerta: [
      "Dor torácica, tontura, palidez ou mal-estar → interromper",
      "Dispneia desproporcional que não cede com a pausa → interromper e reavaliar",
      "Dor articular aguda e crescente → ajustar/trocar modalidade",
      "Sinais que fogem do esperado → pode indicar necessidade de encaminhamento",
    ],
    modalidadesIndicadas: ["m-hidro", "m-bike", "m-musculacao", "m-mobilidade"],
    modalidadesCautela: ["m-caminhada", "m-natacao", "m-funcional", "m-combinado"],
    parametros: ["p-rpe", "p-fala", "p-dispneia", "p-dor", "p-adesao", "p-recuperacao"],
    comoComecar:
      "Priorize baixo impacto (meio aquático ou bicicleta), sessões curtas e frequentes, esforço leve guiado por PSE e teste da fala. O objetivo inicial é o aluno completar a sessão e voltar.",
    errosComuns: [
      "Começar com muito volume/impacto e gerar dor e abandono",
      "Exigir intensidade alta cedo demais",
      "Depender só da FC, pouco confiável na água ou sem equipamento",
      "Ignorar a adesão como principal métrica inicial",
    ],
    casosRelacionados: ["caso-obesidade-grave-inicio"],
    complexidade: "Alta",
    premium: false,
    fases: [
      {
        numero: 1,
        nome: NOMES_FASE[0],
        foco: FOCO_FASE[0],
        objetivo: "Tolerar o exercício, criar hábito e completar sessões sem dor relevante.",
        modalidades: ["m-hidro", "m-bike", "m-mobilidade"],
        parametros: ["p-rpe", "p-fala", "p-dispneia", "p-dor", "p-adesao"],
        criteriosAvancar: [
          "Completa as sessões sem dor crescente",
          "PSE leve e teste da fala confortável",
          "Boa adesão (2–3x/semana) por algumas semanas",
        ],
        criteriosRegredir: [
          "Dor articular aumentando entre sessões",
          "Dispneia/fadiga desproporcionais",
          "Adesão caindo por dificuldade da sessão",
        ],
        estruturaSemanal:
          "2–3 sessões curtas de baixo impacto (ex.: hidroginástica ou bike) + mobilidade; blocos leves com pausas.",
        justificativa:
          "Baixo impacto reduz sobrecarga articular e dispneia, favorecendo adesão, a base de qualquer progressão.",
      },
      {
        numero: 2,
        nome: NOMES_FASE[1],
        foco: FOCO_FASE[1],
        objetivo: "Aumentar volume aeróbio gradual e introduzir força básica guiada.",
        modalidades: ["m-hidro", "m-bike", "m-musculacao"],
        parametros: ["p-rpe", "p-fala", "p-dor", "p-fadiga", "p-adesao"],
        criteriosAvancar: [
          "Aumenta tempo total sem piora de sintomas",
          "Executa força em máquinas com técnica estável",
          "Recuperação adequada entre sessões",
        ],
        criteriosRegredir: ["Fadiga acumulada", "Dor ao subir volume", "Recuperação insuficiente"],
        estruturaSemanal:
          "2–3 aeróbios de baixo impacto (tempo crescente) + 1–2 sessões de força em máquinas guiadas + mobilidade.",
        justificativa:
          "Volume gradual melhora a capacidade sem picos de intensidade; força em máquinas dá função com baixo risco.",
      },
      {
        numero: 3,
        nome: NOMES_FASE[2],
        foco: FOCO_FASE[2],
        objetivo: "Diversificar modalidades e progredir intensidade com mais autonomia.",
        modalidades: ["m-musculacao", "m-caminhada", "m-bike", "m-combinado"],
        parametros: ["p-rpe", "p-fc", "p-dor", "p-fadiga", "p-recuperacao"],
        criteriosAvancar: [
          "Tolera caminhada/solo sem dor relevante",
          "Progride carga na força com técnica",
          "Boa recuperação com maior volume",
        ],
        criteriosRegredir: ["Retorno de dor articular no solo", "Queda de recuperação/adesão"],
        estruturaSemanal:
          "Combinar força + aeróbio; introduzir caminhada se tolerada; blocos um pouco mais intensos e controlados.",
        justificativa:
          "Com base construída, dá para diversificar e elevar intensidade mantendo o controle de sinais e da dor.",
      },
      {
        numero: 4,
        nome: NOMES_FASE[3],
        foco: FOCO_FASE[3],
        objetivo: "Manter resultados, individualizar e prevenir abandono.",
        modalidades: ["m-musculacao", "m-combinado", "m-caminhada"],
        parametros: ["p-rpe", "p-adesao", "p-recuperacao", "p-volume"],
        criteriosAvancar: ["Autonomia para conduzir parte do treino", "Metas de longo prazo estáveis"],
        criteriosRegredir: ["Sinais de sobrecarga", "Perda de adesão"],
        estruturaSemanal:
          "Rotina combinada individualizada, com variação para manter engajamento e prevenir lesões.",
        justificativa:
          "A manutenção depende mais de adesão e individualização do que de intensidade máxima.",
      },
    ],
  },

  {
    slug: "hipertensao",
    nome: "Hipertensão",
    rotuloAluno: "Condicionamento com monitoramento da pressão",
    descricaoCurta: "Aeróbio + força bem conduzidos; atenção à apneia e a sintomas.",
    perfil:
      "Pessoa com hipertensão (frequentemente também sedentária), que se beneficia de exercício regular bem dosado. Muitas vezes usa medicação que altera a resposta de frequência cardíaca.",
    objetivos: [
      "Melhorar aptidão cardiorrespiratória",
      "Ganhar força com técnica segura",
      "Criar consistência de longo prazo",
    ],
    riscosCautelas: [
      "Manobra de Valsalva (apneia) na força",
      "FC pouco confiável com alguns anti-hipertensivos",
      "Picos de esforço sem preparo",
    ],
    sinaisAlerta: [
      "Dor torácica, tontura, cefaleia intensa, visão turva → interromper",
      "Mal-estar desproporcional → interromper e reavaliar",
      "Sintomas recorrentes → pode indicar necessidade de encaminhamento",
    ],
    modalidadesIndicadas: ["m-caminhada", "m-bike", "m-musculacao", "m-eliptico"],
    modalidadesCautela: ["m-funcional", "m-combinado"],
    parametros: ["p-rpe", "p-fala", "p-pa", "p-fc", "p-adesao"],
    comoComecar:
      "Aeróbio leve a moderado guiado por PSE/teste da fala, e força em máquinas com respiração contínua (evitar apneia). PA como parâmetro de contexto quando disponível.",
    errosComuns: [
      "Focar só em força e esquecer o aeróbio",
      "Permitir apneia/Valsalva nas séries",
      "Confiar apenas na FC sob medicação",
    ],
    casosRelacionados: ["caso-hipertensao-monitoramento"],
    complexidade: "Moderada",
    premium: false,
    fases: [
      {
        numero: 1,
        nome: NOMES_FASE[0],
        foco: FOCO_FASE[0],
        objetivo: "Adaptar ao esforço leve-moderado e ensinar respiração contínua na força.",
        modalidades: ["m-caminhada", "m-bike", "m-musculacao"],
        parametros: ["p-rpe", "p-fala", "p-pa", "p-adesao"],
        criteriosAvancar: ["Esforço leve confortável", "Força sem apneia", "Sem sintomas de alerta"],
        criteriosRegredir: ["Sintomas ao esforço", "PA de contexto muito alterada"],
        estruturaSemanal: "2–3 aeróbios leves + 1–2 sessões de força em máquinas com respiração guiada.",
        justificativa: "Adaptação gradual e técnica respiratória reduzem picos de esforço.",
      },
      {
        numero: 2,
        nome: NOMES_FASE[1],
        foco: FOCO_FASE[1],
        objetivo: "Aumentar volume aeróbio e força básica.",
        modalidades: ["m-caminhada", "m-bike", "m-musculacao"],
        parametros: ["p-rpe", "p-fala", "p-fc", "p-adesao"],
        criteriosAvancar: ["Tolera mais tempo e carga leve", "Sem sintomas"],
        criteriosRegredir: ["Sintomas ao subir intensidade", "Adesão em queda"],
        estruturaSemanal: "3 aeróbios moderados + 2 sessões de força; incluir mobilidade.",
        justificativa: "Combinar aeróbio e força tende a favorecer o objetivo, com esforço controlado.",
      },
      {
        numero: 3,
        nome: NOMES_FASE[2],
        foco: FOCO_FASE[2],
        objetivo: "Progredir intensidade com blocos controlados e mais variedade.",
        modalidades: ["m-musculacao", "m-bike", "m-eliptico", "m-combinado"],
        parametros: ["p-rpe", "p-fc", "p-fadiga", "p-adesao"],
        criteriosAvancar: ["Boa tolerância a blocos moderados", "Recuperação adequada"],
        criteriosRegredir: ["Sintomas", "Fadiga acumulada"],
        estruturaSemanal: "Aeróbio com blocos moderados + força progressiva + mobilidade.",
        justificativa: "Progressão gradual mantém segurança enquanto melhora a aptidão.",
      },
      {
        numero: 4,
        nome: NOMES_FASE[3],
        foco: FOCO_FASE[3],
        objetivo: "Manter consistência e individualizar a longo prazo.",
        modalidades: ["m-combinado", "m-musculacao", "m-caminhada"],
        parametros: ["p-rpe", "p-adesao", "p-recuperacao"],
        criteriosAvancar: ["Autonomia e metas estáveis"],
        criteriosRegredir: ["Sinais de sobrecarga", "Queda de adesão"],
        estruturaSemanal: "Rotina combinada sustentável e variada.",
        justificativa: "Regularidade de longo prazo é o que sustenta os benefícios.",
      },
    ],
  },

  {
    slug: "diabetes-tipo-2",
    nome: "Diabetes tipo 2 / risco metabólico",
    rotuloAluno: "Condicionamento com controle metabólico",
    descricaoCurta: "Regularidade e combinação força + aeróbio; atenção a sintomas e adesão.",
    perfil:
      "Pessoa com diabetes tipo 2 ou risco metabólico, que se beneficia de regularidade e da combinação de força e aeróbio. Sensações de hipoglicemia podem aparecer sobretudo em quem usa insulina ou secretagogos; com metformina isolada ou só dieta, o risco costuma ser baixo.",
    objetivos: [
      "Aumentar gasto e sensibilidade ao esforço com regularidade",
      "Combinar força e aeróbio",
      "Melhorar composição corporal e função",
    ],
    riscosCautelas: [
      "Sintomas de hipoglicemia, sobretudo em quem usa insulina ou secretagogos (tremor, sudorese, confusão)",
      "Cuidado com os pés (calçado, atrito): considerar impacto",
      "Adesão como fator crítico",
    ],
    sinaisAlerta: [
      "Sinais de hipoglicemia (tremor, sudorese, confusão) → interromper e, se o aluno estiver consciente, oferecer o carboidrato de ação rápida que ele carrega; observar a recuperação e acionar ajuda se não melhorar. Episódios recorrentes pedem reavaliação com a equipe de saúde",
      "Feridas/lesões nos pés → ajustar modalidade e encaminhar quando necessário",
      "Mal-estar desproporcional → interromper",
    ],
    modalidadesIndicadas: ["m-musculacao", "m-caminhada", "m-bike", "m-combinado"],
    modalidadesCautela: ["m-natacao", "m-funcional"],
    parametros: ["p-rpe", "p-fala", "p-adesao", "p-volume", "p-fadiga"],
    comoComecar:
      "Regularidade acima de intensidade: aeróbio moderado + força em máquinas, esforço guiado por PSE. Glicemia capilar apenas como parâmetro de contexto quando aplicável, sem orientar conduta clínica.",
    errosComuns: [
      "Priorizar intensidade em vez de consistência",
      "Ignorar cuidados com os pés",
      "Não combinar força com aeróbio",
    ],
    casosRelacionados: [],
    complexidade: "Moderada",
    premium: true,
    fases: [
      {
        numero: 1,
        nome: NOMES_FASE[0],
        foco: FOCO_FASE[0],
        objetivo: "Criar regularidade e tolerância com esforço moderado.",
        modalidades: ["m-caminhada", "m-bike", "m-musculacao"],
        parametros: ["p-rpe", "p-fala", "p-adesao"],
        criteriosAvancar: ["Consistência semanal", "Esforço confortável", "Sem sintomas"],
        criteriosRegredir: ["Sintomas de hipoglicemia recorrentes", "Adesão baixa"],
        estruturaSemanal: "2–3 aeróbios moderados + 1–2 sessões de força em máquinas.",
        justificativa: "A regularidade é o principal motor de resultado neste perfil.",
      },
      {
        numero: 2,
        nome: NOMES_FASE[1],
        foco: FOCO_FASE[1],
        objetivo: "Aumentar volume e consolidar a combinação força + aeróbio.",
        modalidades: ["m-musculacao", "m-caminhada", "m-bike"],
        parametros: ["p-rpe", "p-volume", "p-fadiga", "p-adesao"],
        criteriosAvancar: ["Tolera mais volume", "Recupera bem"],
        criteriosRegredir: ["Fadiga acumulada", "Sintomas"],
        estruturaSemanal: "3 aeróbios + 2 força; incluir mobilidade.",
        justificativa: "Combinar estímulos tende a favorecer composição corporal e função.",
      },
      {
        numero: 3,
        nome: NOMES_FASE[2],
        foco: FOCO_FASE[2],
        objetivo: "Progredir intensidade e variar modalidades.",
        modalidades: ["m-combinado", "m-musculacao", "m-bike"],
        parametros: ["p-rpe", "p-fadiga", "p-recuperacao"],
        criteriosAvancar: ["Boa recuperação com blocos moderados"],
        criteriosRegredir: ["Sinais de sobrecarga"],
        estruturaSemanal: "Treino combinado + força progressiva.",
        justificativa: "Variedade e progressão sustentam a evolução com engajamento.",
      },
      {
        numero: 4,
        nome: NOMES_FASE[3],
        foco: FOCO_FASE[3],
        objetivo: "Manter regularidade e autonomia a longo prazo.",
        modalidades: ["m-combinado", "m-musculacao", "m-caminhada"],
        parametros: ["p-adesao", "p-rpe", "p-recuperacao"],
        criteriosAvancar: ["Autonomia e metas estáveis"],
        criteriosRegredir: ["Queda de adesão", "Sintomas"],
        estruturaSemanal: "Rotina combinada individualizada e sustentável.",
        justificativa: "Consistência a longo prazo é o que preserva os benefícios.",
      },
    ],
  },

  {
    slug: "idoso-destreinado",
    nome: "Idoso frágil / destreinado",
    rotuloAluno: "Força, equilíbrio e autonomia",
    descricaoCurta: "Força e função primeiro; equilíbrio e prevenção de quedas.",
    perfil:
      "Pessoa idosa destreinada ou frágil, com risco de perda de força, equilíbrio e autonomia. Prioridade em segurança, função e prevenção de quedas.",
    objetivos: [
      "Ganhar força e potência funcional",
      "Melhorar equilíbrio e reduzir risco de quedas",
      "Preservar autonomia e melhorar aptidão geral",
    ],
    riscosCautelas: [
      "Risco de queda em exercícios instáveis",
      "Recuperação mais lenta",
      "Progressão precisa ser individualizada",
    ],
    sinaisAlerta: [
      "Tontura, desequilíbrio importante → interromper e apoiar",
      "Dor nova e persistente → reavaliar",
      "Piora funcional inesperada → pode indicar necessidade de encaminhamento",
    ],
    modalidadesIndicadas: ["m-musculacao", "m-caminhada", "m-mobilidade", "m-bike"],
    modalidadesCautela: ["m-funcional", "m-eliptico", "m-combinado"],
    parametros: ["p-rpe", "p-dor", "p-fadiga", "p-recuperacao", "p-adesao"],
    comoComecar:
      "Força em máquinas guiadas e exercícios de equilíbrio com apoio; volume baixo e progressão lenta. Esforço por PSE e observação da qualidade do movimento.",
    errosComuns: [
      "Focar só em caminhada e negligenciar força",
      "Progredir rápido demais",
      "Expor a exercícios instáveis cedo",
    ],
    casosRelacionados: ["caso-idoso-progressao"],
    complexidade: "Alta",
    premium: true,
    fases: [
      {
        numero: 1,
        nome: NOMES_FASE[0],
        foco: FOCO_FASE[0],
        objetivo: "Adaptar à força guiada e ao equilíbrio com apoio, com segurança.",
        modalidades: ["m-musculacao", "m-mobilidade"],
        parametros: ["p-rpe", "p-dor", "p-adesao"],
        criteriosAvancar: ["Executa força com técnica e sem dor", "Equilíbrio com apoio estável"],
        criteriosRegredir: ["Dor nova", "Desequilíbrio", "Fadiga excessiva"],
        estruturaSemanal: "2–3 sessões de força em máquinas + equilíbrio com apoio + mobilidade.",
        justificativa: "Força e equilíbrio são o alicerce da função e da prevenção de quedas.",
      },
      {
        numero: 2,
        nome: NOMES_FASE[1],
        foco: FOCO_FASE[1],
        objetivo: "Aumentar carga de força gradual e adicionar aeróbio leve.",
        modalidades: ["m-musculacao", "m-caminhada", "m-bike"],
        parametros: ["p-rpe", "p-fadiga", "p-recuperacao", "p-adesao"],
        criteriosAvancar: ["Progride carga com técnica", "Recupera bem"],
        criteriosRegredir: ["Recuperação ruim", "Dor"],
        estruturaSemanal: "Força progressiva + caminhada/bike leve + equilíbrio.",
        justificativa: "Ganho de força sustenta autonomia; aeróbio leve melhora a aptidão geral.",
      },
      {
        numero: 3,
        nome: NOMES_FASE[2],
        foco: FOCO_FASE[2],
        objetivo: "Introduzir potência funcional e desafios de equilíbrio controlados.",
        modalidades: ["m-musculacao", "m-funcional", "m-caminhada"],
        parametros: ["p-rpe", "p-dor", "p-recuperacao"],
        criteriosAvancar: ["Boa base de força e equilíbrio"],
        criteriosRegredir: ["Instabilidade", "Dor"],
        estruturaSemanal: "Força + tarefas funcionais seguras + equilíbrio progressivo.",
        justificativa: "Potência e função transferem para as atividades do dia a dia.",
      },
      {
        numero: 4,
        nome: NOMES_FASE[3],
        foco: FOCO_FASE[3],
        objetivo: "Manter força/função e prevenir abandono e quedas.",
        modalidades: ["m-musculacao", "m-caminhada", "m-mobilidade"],
        parametros: ["p-adesao", "p-rpe", "p-recuperacao"],
        criteriosAvancar: ["Autonomia funcional estável"],
        criteriosRegredir: ["Perda de força/adesão"],
        estruturaSemanal: "Rotina de força + aeróbio + equilíbrio, individualizada.",
        justificativa: "Manutenção de força e equilíbrio preserva a independência.",
      },
    ],
  },

  {
    slug: "dor-lombar-inespecifica",
    nome: "Dor lombar inespecífica",
    rotuloAluno: "Fortalecimento com cuidado lombar",
    descricaoCurta: "Movimento gradual e tolerância à dor; evitar repouso excessivo.",
    perfil:
      "Pessoa com dor lombar inespecífica (sem sinal de gravidade), muitas vezes com medo de se mover. Costuma responder bem a exercício gradual e controle da dor percebida.",
    objetivos: [
      "Recuperar confiança no movimento",
      "Melhorar tolerância a carga e volume",
      "Fortalecer de forma progressiva e reduzir recorrências",
    ],
    riscosCautelas: [
      "Medo do movimento (evitar repouso excessivo)",
      "Progressão guiada pela dor percebida",
      "Amplitude e carga adaptadas",
    ],
    sinaisAlerta: [
      "Dor irradiada com perda de força/sensibilidade → reavaliar e encaminhar",
      "Sintomas de gravidade (febre, perda de controle) → encaminhamento",
      "Dor aguda intensa e crescente → interromper",
    ],
    modalidadesIndicadas: ["m-mobilidade", "m-musculacao", "m-bike", "m-caminhada"],
    modalidadesCautela: ["m-funcional", "m-combinado"],
    parametros: ["p-dor", "p-rpe", "p-volume", "p-adesao"],
    comoComecar:
      "Exposição gradual ao movimento com amplitude e carga confortáveis; usar a dor percebida como guia (dor leve tolerável, sem picos). Evitar repouso prolongado.",
    errosComuns: [
      "Repouso excessivo por medo",
      "Progredir carga ignorando a dor",
      "Exercícios agressivos cedo demais",
    ],
    casosRelacionados: ["caso-lombar-iniciante"],
    complexidade: "Moderada",
    premium: true,
    fases: [
      {
        numero: 1,
        nome: NOMES_FASE[0],
        foco: FOCO_FASE[0],
        objetivo: "Retomar o movimento com confiança e dor controlada.",
        modalidades: ["m-mobilidade", "m-bike", "m-caminhada"],
        parametros: ["p-dor", "p-rpe", "p-adesao"],
        criteriosAvancar: ["Movimenta-se com dor leve e estável", "Sem picos de dor"],
        criteriosRegredir: ["Dor crescente", "Padrão de movimento alterado"],
        estruturaSemanal: "Mobilidade + aeróbio leve + exposição gradual a padrões básicos.",
        justificativa: "Reduzir o medo e manter movimento tende a favorecer a recuperação.",
      },
      {
        numero: 2,
        nome: NOMES_FASE[1],
        foco: FOCO_FASE[1],
        objetivo: "Introduzir força progressiva com amplitude confortável.",
        modalidades: ["m-musculacao", "m-mobilidade", "m-bike"],
        parametros: ["p-dor", "p-rpe", "p-volume"],
        criteriosAvancar: ["Tolera carga leve sem piora", "Confiança crescente"],
        criteriosRegredir: ["Dor ao aumentar carga/volume"],
        estruturaSemanal: "Força guiada + mobilidade + aeróbio leve.",
        justificativa: "Força progressiva melhora tolerância e reduz recorrências.",
      },
      {
        numero: 3,
        nome: NOMES_FASE[2],
        foco: FOCO_FASE[2],
        objetivo: "Progredir carga e diversificar padrões de movimento.",
        modalidades: ["m-musculacao", "m-funcional", "m-caminhada"],
        parametros: ["p-dor", "p-rpe", "p-recuperacao"],
        criteriosAvancar: ["Boa tolerância a carga e volume"],
        criteriosRegredir: ["Retorno de dor com progressão"],
        estruturaSemanal: "Força progressiva + padrões funcionais seguros + aeróbio.",
        justificativa: "Diversidade e carga controlada constroem robustez.",
      },
      {
        numero: 4,
        nome: NOMES_FASE[3],
        foco: FOCO_FASE[3],
        objetivo: "Manter capacidade e prevenir recorrências.",
        modalidades: ["m-musculacao", "m-combinado", "m-mobilidade"],
        parametros: ["p-adesao", "p-dor", "p-rpe"],
        criteriosAvancar: ["Autonomia e confiança estáveis"],
        criteriosRegredir: ["Recidiva de dor"],
        estruturaSemanal: "Rotina de força + aeróbio + mobilidade sustentável.",
        justificativa: "Manter-se ativo e forte é a melhor prevenção de recorrência.",
      },
    ],
  },

  {
    slug: "osteoartrite-joelho",
    nome: "Osteoartrite / dor no joelho",
    rotuloAluno: "Fortalecimento com proteção do joelho",
    descricaoCurta: "Baixo impacto e força de membros inferiores; amplitude tolerável.",
    perfil:
      "Pessoa com osteoartrite ou dor no joelho, que costuma tolerar mal o impacto mas responde bem a força de membros inferiores em amplitude confortável.",
    objetivos: [
      "Fortalecer a musculatura de suporte do joelho",
      "Melhorar função com baixo impacto",
      "Reduzir dor percebida e melhorar tolerância",
    ],
    riscosCautelas: [
      "Impacto e amplitude dolorosa",
      "Progressão guiada pela dor",
      "Volume alto em modalidades de impacto",
    ],
    sinaisAlerta: [
      "Edema/derrame articular após a sessão → reduzir e reavaliar",
      "Dor aguda intensa e travamento → interromper e encaminhar",
      "Piora funcional progressiva → pode indicar necessidade de encaminhamento",
    ],
    modalidadesIndicadas: ["m-musculacao", "m-bike", "m-hidro", "m-mobilidade"],
    modalidadesCautela: ["m-caminhada", "m-funcional", "m-eliptico"],
    parametros: ["p-dor", "p-rpe", "p-volume", "p-adesao"],
    comoComecar:
      "Força de membros inferiores em amplitude confortável (máquinas), aeróbio de baixo impacto (bike/água). Dor leve tolerável, sem picos; evitar impacto no início.",
    errosComuns: [
      "Insistir em caminhada dolorosa",
      "Trabalhar amplitude que gera dor",
      "Evitar totalmente o joelho (fraqueza piora a função)",
    ],
    casosRelacionados: ["caso-osteoartrite-modalidade"],
    complexidade: "Moderada",
    premium: true,
    fases: [
      {
        numero: 1,
        nome: NOMES_FASE[0],
        foco: FOCO_FASE[0],
        objetivo: "Fortalecer com baixo impacto e amplitude confortável.",
        modalidades: ["m-musculacao", "m-bike", "m-hidro"],
        parametros: ["p-dor", "p-rpe", "p-adesao"],
        criteriosAvancar: ["Força sem dor crescente", "Aeróbio de baixo impacto tolerado"],
        criteriosRegredir: ["Dor/edema após a sessão", "Amplitude dolorosa"],
        estruturaSemanal: "Força de MMII em máquinas + bike/água + mobilidade.",
        justificativa: "Fortalecer o suporte do joelho com baixo impacto tende a reduzir a dor.",
      },
      {
        numero: 2,
        nome: NOMES_FASE[1],
        foco: FOCO_FASE[1],
        objetivo: "Aumentar carga e amplitude conforme tolerância.",
        modalidades: ["m-musculacao", "m-bike", "m-hidro"],
        parametros: ["p-dor", "p-rpe", "p-volume"],
        criteriosAvancar: ["Tolera mais carga/amplitude sem piora"],
        criteriosRegredir: ["Dor ao progredir"],
        estruturaSemanal: "Força progressiva + aeróbio de baixo impacto + mobilidade.",
        justificativa: "Ganho de força e amplitude melhora a função com segurança.",
      },
      {
        numero: 3,
        nome: NOMES_FASE[2],
        foco: FOCO_FASE[2],
        objetivo: "Introduzir mais função e, se tolerado, impacto leve.",
        modalidades: ["m-musculacao", "m-caminhada", "m-funcional"],
        parametros: ["p-dor", "p-rpe", "p-recuperacao"],
        criteriosAvancar: ["Boa tolerância à carga e à caminhada leve"],
        criteriosRegredir: ["Retorno de dor/edema"],
        estruturaSemanal: "Força + tarefas funcionais + impacto leve se tolerado.",
        justificativa: "Progressão para função amplia a autonomia respeitando a dor.",
      },
      {
        numero: 4,
        nome: NOMES_FASE[3],
        foco: FOCO_FASE[3],
        objetivo: "Manter força e função com baixo risco de piora.",
        modalidades: ["m-musculacao", "m-bike", "m-mobilidade"],
        parametros: ["p-adesao", "p-dor", "p-rpe"],
        criteriosAvancar: ["Função estável e dor controlada"],
        criteriosRegredir: ["Piora funcional"],
        estruturaSemanal: "Rotina de força + baixo impacto + mobilidade.",
        justificativa: "Manter força de suporte preserva a função articular.",
      },
    ],
  },
];

/* --------- Condições adicionais (jornada base + cuidados; ver mkCondicao) --------- */

const condicoesAdicionais: SpecialGroup[] = [
  mkCondicao({
    slug: "iniciante-sedentario",
    nome: "Iniciante / sedentário",
    rotuloAluno: "Início guiado do condicionamento",
    descricaoCurta: "Base de adesão e técnica com progressão suave para quem está começando.",
    perfil:
      "Pessoa saudável começando a se exercitar, com baixa aptidão inicial. O principal risco é excesso de volume e intensidade cedo demais, que gera dor tardia e abandono.",
    objetivos: ["Criar o hábito e a tolerância ao exercício (adesão)", "Aprender a técnica dos movimentos básicos", "Melhorar a aptidão geral com progressão suave"],
    riscosCautelas: ["Volume e intensidade altos cedo demais geram dor e desânimo", "Expectativa de resultado rápido pode frustrar", "A técnica ainda está em construção"],
    sinaisAlerta: ["Dor articular aguda e crescente, ajustar", "Fadiga que não recupera entre as sessões", "Sinais que fogem do esperado, reavaliar"],
    modIndicadas: ["m-caminhada", "m-musculacao", "m-bike", "m-mobilidade"],
    modCautela: ["m-funcional", "m-combinado"],
    parametros: ["p-rpe", "p-fala", "p-adesao", "p-recuperacao", "p-dor"],
    comoComecar:
      "Poucos exercícios simples, esforço leve a moderado guiado por PSE, foco em completar as sessões e criar rotina. Progrida uma variável por vez.",
    errosComuns: ["Começar com volume e intensidade de treinado", "Cobrar resultado rápido em vez de adesão", "Ignorar a técnica"],
    complexidade: "Baixa",
  }),
  mkCondicao({
    slug: "retorno-inatividade",
    nome: "Retorno após inatividade",
    rotuloAluno: "Retomada gradual do treino",
    descricaoCurta: "Retomada gradual para quem ficou parado, evitando lesão pela pressa.",
    perfil:
      "Pessoa que já treinou mas ficou parada por semanas ou meses. Costuma superestimar a capacidade inicial e tentar voltar onde parou.",
    objetivos: ["Retomar de forma gradual, evitando lesão pela pressa", "Reconstruir a base aeróbia e de força", "Recuperar a consistência"],
    riscosCautelas: ["Voltar no volume ou carga anterior gera dor e lesão", "Dor muscular tardia intensa nas primeiras semanas", "Frustração com a perda de condicionamento"],
    sinaisAlerta: ["Dor articular ou muscular aguda e crescente", "Fadiga desproporcional", "Sinais que fogem do esperado, reavaliar"],
    modIndicadas: ["m-caminhada", "m-musculacao", "m-bike", "m-mobilidade"],
    modCautela: ["m-funcional", "m-combinado"],
    parametros: ["p-rpe", "p-fala", "p-recuperacao", "p-dor", "p-adesao"],
    comoComecar:
      "Recomece com cerca de metade do volume e da carga que fazia antes e progrida ao longo de poucas semanas. A dor tardia inicial é esperada; a lesão pela pressa não.",
    errosComuns: ["Voltar direto no ponto onde parou", "Ignorar a recuperação", "Aumentar tudo de uma vez"],
    complexidade: "Baixa",
  }),
  mkCondicao({
    slug: "pre-diabetes",
    nome: "Pré-diabetes",
    rotuloAluno: "Condicionamento metabólico preventivo",
    descricaoCurta: "Aeróbio e força regulares para melhorar a sensibilidade à insulina.",
    perfil:
      "Pessoa com glicemia acima do normal, ainda sem diagnóstico de diabetes, com frequência sobrepeso e sedentária. O exercício regular é um dos pilares da prevenção.",
    objetivos: ["Apoiar a sensibilidade à insulina com regularidade", "Combinar aeróbio e força", "Apoiar o controle de peso e da composição"],
    riscosCautelas: ["Risco cardiometabólico associado pede contexto e progressão", "A consistência semanal importa mais que picos de intensidade", "Cautela com apneia em cargas altas quando há pressão elevada"],
    sinaisAlerta: ["Tontura, sudorese fria ou confusão, pausar e reavaliar", "Dor torácica ou mal-estar, interromper", "Sinais que fogem do esperado, encaminhar"],
    modIndicadas: ["m-caminhada", "m-bike", "m-eliptico", "m-musculacao"],
    modCautela: ["m-funcional", "m-combinado"],
    parametros: ["p-rpe", "p-fala", "p-fc", "p-adesao", "p-recuperacao"],
    comoComecar:
      "Combine aeróbio quase diário de intensidade moderada com força 2 a 3 vezes por semana. A regularidade é o que mais melhora a sensibilidade à insulina.",
    errosComuns: ["Focar só no aeróbio e esquecer a força", "Buscar intensidade alta sem base", "Ignorar o cuidado cardiometabólico"],
    complexidade: "Moderada",
  }),
  mkCondicao({
    slug: "sindrome-metabolica",
    nome: "Síndrome metabólica",
    rotuloAluno: "Condicionamento cardiometabólico",
    descricaoCurta: "Aeróbio e força atuando sobre vários fatores de risco ao mesmo tempo.",
    perfil:
      "Conjunto de fatores de risco somados (gordura abdominal, pressão, glicemia e lipídios alterados). O exercício atua sobre vários deles simultaneamente.",
    objetivos: ["Reduzir o risco cardiometabólico com aeróbio e força", "Melhorar a composição corporal", "Sustentar a adesão de longo prazo"],
    riscosCautelas: ["Vários fatores de risco somados pedem progressão e monitoramento", "Evitar apneia em cargas altas (pressão)", "Atenção a sinais de hipoglicemia quando há alteração glicêmica"],
    sinaisAlerta: ["Dor torácica, tontura ou mal-estar, interromper", "Sinais de hipoglicemia, pausar", "Dispneia desproporcional, reavaliar"],
    modIndicadas: ["m-caminhada", "m-bike", "m-eliptico", "m-musculacao"],
    modCautela: ["m-funcional", "m-combinado"],
    parametros: ["p-rpe", "p-fala", "p-fc", "p-pa", "p-adesao"],
    comoComecar:
      "Priorize a regularidade: aeróbio moderado na maioria dos dias e força 2 a 3 vezes por semana, com respiração contínua e progressão gradual.",
    errosComuns: ["Intensidade alta sem base", "Ignorar a pressão e a apneia", "Programa sem força"],
    complexidade: "Moderada",
  }),
  mkCondicao({
    slug: "dislipidemia",
    nome: "Dislipidemia",
    rotuloAluno: "Condicionamento para saúde cardiovascular",
    descricaoCurta: "Aeróbio regular e força para apoiar o perfil lipídico.",
    perfil:
      "Alteração de colesterol ou triglicerídeos. O exercício regular, sobretudo aeróbio, contribui para o perfil lipídico junto de dieta e conduta médica.",
    objetivos: ["Melhorar o perfil com aeróbio regular", "Somar força para composição e metabolismo", "Adesão de longo prazo"],
    riscosCautelas: ["O benefício depende de regularidade e volume, não de picos", "Risco cardiovascular associado quando presente", "A conduta medicamentosa é do profissional de saúde"],
    sinaisAlerta: ["Dor torácica ou mal-estar, interromper", "Dispneia desproporcional, reavaliar", "Sinais que fogem do esperado, encaminhar"],
    modIndicadas: ["m-caminhada", "m-bike", "m-eliptico", "m-musculacao"],
    modCautela: ["m-funcional", "m-combinado"],
    parametros: ["p-rpe", "p-fala", "p-fc", "p-adesao", "p-recuperacao"],
    comoComecar:
      "Volume aeróbio moderado consistente (na maior parte dos dias) mais força 2 a 3 vezes por semana. O efeito vem da regularidade ao longo das semanas.",
    errosComuns: ["Esperar efeito de poucas sessões", "Só aeróbio de baixo volume", "Ignorar dieta e conduta médica (encaminhar)"],
    complexidade: "Moderada",
  }),
  mkCondicao({
    slug: "esteatose-hepatica",
    nome: "Esteatose hepática metabólica",
    rotuloAluno: "Condicionamento metabólico com controle de peso",
    descricaoCurta: "Aeróbio, força e controle de peso para reduzir a gordura hepática.",
    perfil:
      "Acúmulo de gordura no fígado associado a fatores metabólicos. Exercício regular e perda de peso gradual tendem a reduzir a gordura hepática.",
    objetivos: ["Apoiar a redução da gordura hepática com aeróbio e força regulares", "Apoiar a perda de peso gradual", "Melhorar a aptidão e o metabolismo"],
    riscosCautelas: ["Sobrepeso e risco cardiometabólico associados", "Perda de peso agressiva não é o alvo do treino (encaminhar nutrição)", "Progressão gradual"],
    sinaisAlerta: ["Dor torácica ou mal-estar, interromper", "Tontura ou sinais de hipoglicemia, pausar", "Sinais que fogem do esperado, encaminhar"],
    modIndicadas: ["m-caminhada", "m-bike", "m-eliptico", "m-musculacao"],
    modCautela: ["m-funcional", "m-combinado"],
    parametros: ["p-rpe", "p-fala", "p-adesao", "p-recuperacao"],
    comoComecar:
      "Combine aeróbio moderado frequente com força 2 a 3 vezes por semana. A redução da gordura hepática acompanha a regularidade e a perda de peso ao longo do tempo.",
    errosComuns: ["Buscar emagrecimento rápido", "Programa sem força", "Ignorar o acompanhamento nutricional e médico"],
    complexidade: "Moderada",
  }),
  mkCondicao({
    slug: "sarcopenia",
    nome: "Sarcopenia / baixa força muscular",
    rotuloAluno: "Fortalecimento e função muscular",
    descricaoCurta: "Força progressiva para recuperar massa, força e função.",
    perfil:
      "Perda de massa e força muscular, comum com o envelhecimento ou o desuso. A força é o principal estímulo para reverter o quadro; a nutrição proteica é coadjuvante (encaminhar).",
    objetivos: ["Ganhar força e massa com treino de força progressivo", "Melhorar a função e a autonomia", "Reduzir o risco de quedas"],
    riscosCautelas: ["Baixa força inicial pede progressão cuidadosa", "Técnica antes de carga", "A recuperação pode ser mais lenta"],
    sinaisAlerta: ["Dor articular aguda, ajustar", "Fadiga desproporcional", "Instabilidade ou risco de queda, priorizar apoio"],
    modIndicadas: ["m-musculacao", "m-funcional", "m-caminhada", "m-mobilidade"],
    modCautela: ["m-combinado"],
    parametros: ["p-rpe", "p-carga", "p-recuperacao", "p-dor", "p-adesao"],
    comoComecar:
      "Priorize a força em máquinas guiadas 2 a 3 vezes por semana, com progressão pequena e frequente, mais caminhada e mobilidade. Encaminhe para avaliação nutricional.",
    errosComuns: ["Focar só no aeróbio", "Carga alta sem técnica", "Ignorar a ingestão proteica (encaminhar)"],
    complexidade: "Moderada",
  }),
  mkCondicao({
    slug: "osteoporose",
    nome: "Osteopenia / osteoporose",
    rotuloAluno: "Fortalecimento com estímulo ósseo",
    descricaoCurta: "Força e impacto controlado para estimular o osso, com liberação de saúde.",
    perfil:
      "Redução da densidade óssea, com maior risco de fratura. A força e o impacto controlado estimulam o osso; flexão brusca da coluna e alto risco de queda pedem cautela. Requer liberação e acompanhamento do profissional de saúde.",
    objetivos: ["Estimular o osso com força e impacto controlado", "Melhorar o equilíbrio e reduzir o risco de quedas", "Ganhar força funcional"],
    riscosCautelas: ["Flexão brusca ou carga axial mal controlada da coluna: cautela", "Alto risco de queda: priorizar equilíbrio e apoio", "Liberação médica recomendada antes de progredir o impacto"],
    sinaisAlerta: ["Dor óssea ou nas costas nova ou persistente, interromper e encaminhar", "Instabilidade ou risco de queda", "Sinais que fogem do esperado, reavaliar"],
    modIndicadas: ["m-musculacao", "m-caminhada", "m-funcional", "m-mobilidade"],
    modCautela: ["m-combinado", "m-hidro"],
    parametros: ["p-rpe", "p-carga", "p-dor", "p-adesao", "p-recuperacao"],
    comoComecar:
      "Comece com força guiada e caminhada, evitando flexão brusca da coluna e movimentos de alto risco de queda. Progrida o impacto de forma gradual, com liberação e acompanhamento do profissional de saúde.",
    errosComuns: ["Evitar toda carga por medo (o osso precisa de estímulo)", "Impacto alto sem progressão", "Ignorar o risco de queda"],
    complexidade: "Alta",
    premium: true,
  }),
  mkCondicao({
    slug: "gestante",
    nome: "Gestante sem contraindicação",
    rotuloAluno: "Condicionamento na gestação",
    descricaoCurta: "Cuidados específicos por trimestre, com liberação obstétrica.",
    perfil:
      "Gestação sem contraindicação e com liberação obstétrica. O exercício é benéfico, mas exige cuidados específicos por trimestre. A liberação e as contraindicações são do médico obstetra.",
    objetivos: ["Manter a aptidão e a força com segurança", "Reduzir desconfortos e apoiar a saúde na gestação", "Preparar para o pós-parto"],
    riscosCautelas: ["Decúbito dorsal prolongado após o 1º trimestre: cautela", "Evitar superaquecimento, desidratação e esforço máximo", "Risco de queda em atividades de equilíbrio; liberação obstétrica obrigatória"],
    sinaisAlerta: ["Sangramento, dor abdominal, contrações, perda de líquido, tontura ou falta de ar desproporcional: interromper e encaminhar imediatamente", "Qualquer sinal fora do esperado, encaminhar", "As orientações do obstetra prevalecem"],
    modIndicadas: ["m-caminhada", "m-musculacao", "m-hidro", "m-mobilidade"],
    modCautela: ["m-funcional", "m-combinado", "m-bike"],
    parametros: ["p-rpe", "p-fala", "p-fc", "p-adesao", "p-recuperacao"],
    comoComecar:
      "Com liberação obstétrica, priorize intensidade moderada guiada pelo teste da fala, força guiada e mobilidade, evitando esforço máximo, superaquecimento e posições de risco. Ajuste por trimestre.",
    errosComuns: ["Prescrever sem liberação obstétrica", "Manter intensidade alta ou esforço máximo", "Ignorar sinais de alerta"],
    complexidade: "Alta",
    premium: true,
    manterIntensidade: true,
  }),
  mkCondicao({
    slug: "pos-parto",
    nome: "Pós-parto com liberação",
    rotuloAluno: "Retomada pós-parto",
    descricaoCurta: "Retomada gradual com atenção ao assoalho pélvico, com liberação.",
    perfil:
      "Retorno ao exercício após o parto, com liberação do profissional de saúde. A retomada é gradual e considera o assoalho pélvico e o tipo de parto.",
    objetivos: ["Retomar força e aptidão de forma progressiva", "Cuidar do assoalho pélvico e do core", "Sustentar a adesão com rotina realista"],
    riscosCautelas: ["Retomar cedo demais ou com carga alta: cautela", "Sinais de disfunção do assoalho pélvico (perdas, sensação de peso): encaminhar", "Liberação do profissional de saúde antes de progredir"],
    sinaisAlerta: ["Sangramento aumentado, dor pélvica, perdas urinárias ou sensação de peso: ajustar e encaminhar", "Fadiga desproporcional (sono fragmentado)", "Sinais fora do esperado, reavaliar"],
    modIndicadas: ["m-caminhada", "m-musculacao", "m-mobilidade", "m-hidro"],
    modCautela: ["m-funcional", "m-combinado"],
    parametros: ["p-rpe", "p-adesao", "p-recuperacao", "p-dor"],
    comoComecar:
      "Com liberação, retome de forma gradual: mobilidade, respiração e assoalho pélvico, caminhada e força guiada leve, progredindo conforme a recuperação e a rotina de sono.",
    errosComuns: ["Retomar no ritmo pré-gestacional", "Ignorar o assoalho pélvico", "Cobrar resultado rápido"],
    complexidade: "Alta",
    premium: true,
  }),
  mkCondicao({
    slug: "climaterio",
    nome: "Climatério / menopausa",
    rotuloAluno: "Condicionamento na transição hormonal",
    descricaoCurta: "Força e aeróbio para músculo, osso, humor e sono na transição hormonal.",
    perfil:
      "Fase de transição hormonal (perimenopausa ou menopausa), com mudanças na composição corporal, no osso e no sono. Força e aeróbio ajudam em vários desses aspectos.",
    objetivos: ["Preservar massa muscular e óssea com força", "Apoiar a composição corporal e o humor", "Melhorar a aptidão e o sono"],
    riscosCautelas: ["Tendência à perda de massa e osso: a força é prioridade", "Fogachos e sono podem afetar a sessão", "O risco cardiometabólico aumenta na transição"],
    sinaisAlerta: ["Tontura, palpitações ou mal-estar, pausar", "Dor articular nova ou persistente, ajustar", "Sinais fora do esperado, encaminhar"],
    modIndicadas: ["m-musculacao", "m-caminhada", "m-bike", "m-mobilidade"],
    modCautela: ["m-funcional", "m-combinado"],
    parametros: ["p-rpe", "p-carga", "p-adesao", "p-recuperacao"],
    comoComecar:
      "Priorize a força 2 a 3 vezes por semana (preserva músculo e osso) mais aeróbio moderado, ajustando ao sono e aos sintomas do dia.",
    errosComuns: ["Só aeróbio, sem força", "Ignorar a saúde óssea", "Não ajustar ao sono e aos sintomas"],
    complexidade: "Moderada",
  }),
  mkCondicao({
    slug: "apneia-sono",
    nome: "Apneia obstrutiva do sono",
    rotuloAluno: "Condicionamento e controle de peso",
    descricaoCurta: "Aeróbio, força e perda de peso, com acompanhamento do tratamento.",
    perfil:
      "Apneia obstrutiva do sono, com frequência associada a sobrepeso e sonolência diurna. Exercício e perda de peso podem reduzir a gravidade; o tratamento é conduzido pelo profissional de saúde.",
    objetivos: ["Apoiar a perda de peso e a aptidão com aeróbio e força", "Melhorar a disposição e reduzir a sonolência", "Sustentar a adesão apesar da fadiga"],
    riscosCautelas: ["Sonolência e fadiga diurna afetam a sessão e a segurança", "Risco cardiometabólico associado", "O tratamento (por exemplo, CPAP) é do profissional de saúde"],
    sinaisAlerta: ["Sonolência excessiva ou risco de dormir em equipamento, interromper", "Dor torácica ou mal-estar, interromper", "Sinais fora do esperado, encaminhar"],
    modIndicadas: ["m-caminhada", "m-bike", "m-eliptico", "m-musculacao"],
    modCautela: ["m-funcional", "m-combinado"],
    parametros: ["p-rpe", "p-fala", "p-fc", "p-adesao"],
    comoComecar:
      "Combine aeróbio moderado frequente com força, ajustando horário e intensidade à sonolência do dia. A perda de peso costuma reduzir a gravidade. Diante do risco cardiometabólico associado, considere a liberação do profissional de saúde antes de progredir a intensidade e mantenha o acompanhamento médico.",
    errosComuns: ["Ignorar a sonolência na segurança", "Programa sem componente de perda de peso", "Substituir o tratamento médico pelo treino"],
    complexidade: "Moderada",
    premium: true,
  }),
  mkCondicao({
    slug: "asma-controlada",
    nome: "Asma controlada",
    rotuloAluno: "Condicionamento respiratório seguro",
    descricaoCurta: "Aquecimento e progressão que reduzem sintomas respiratórios.",
    perfil:
      "Asma bem controlada, sem crises frequentes. O exercício é recomendado; aquecimento e ambiente adequados reduzem o broncoespasmo induzido pelo esforço.",
    objetivos: ["Melhorar a aptidão sem desencadear sintomas", "Aumentar a tolerância ao esforço", "Sustentar a adesão"],
    riscosCautelas: ["Ar frio ou seco e esforço abrupto podem desencadear broncoespasmo", "Ter a medicação de resgate disponível (conforme o médico)", "O aquecimento gradual é protetor"],
    sinaisAlerta: ["Chiado, tosse, aperto no peito ou falta de ar que não cede com a pausa, interromper e seguir a conduta médica", "Sintomas desproporcionais, reavaliar", "Sinais fora do esperado, encaminhar"],
    modIndicadas: ["m-caminhada", "m-bike", "m-musculacao", "m-natacao"],
    modCautela: ["m-funcional", "m-combinado"],
    parametros: ["p-rpe", "p-fala", "p-dispneia", "p-adesao"],
    comoComecar:
      "Faça aquecimento gradual, prefira ambientes sem ar muito frio ou seco e progrida a intensidade aos poucos, com a medicação de resgate disponível conforme a orientação médica.",
    errosComuns: ["Pular o aquecimento", "Intensidade abrupta em ar frio", "Treinar sem a medicação de resgate quando indicada"],
    complexidade: "Moderada",
  }),
  mkCondicao({
    slug: "ansiedade-depressao",
    nome: "Ansiedade / sintomas depressivos",
    rotuloAluno: "Movimento para bem-estar e disposição",
    descricaoCurta: "Rotina regular e realista de exercício como apoio ao humor.",
    perfil:
      "Pessoa com sintomas de ansiedade ou depressão, em acompanhamento de saúde. O exercício regular tende a ter efeito positivo no humor; a adesão é o principal desafio.",
    objetivos: ["Usar o exercício regular como apoio ao humor", "Construir uma rotina realista e sustentável", "Melhorar a aptidão e o sono"],
    riscosCautelas: ["Baixa energia e motivação afetam a adesão", "Metas irreais frustram: comece pequeno", "O treino apoia, não substitui o acompanhamento de saúde"],
    sinaisAlerta: ["Piora importante do humor ou risco à segurança, encaminhar ao profissional de saúde", "Fadiga desproporcional", "Sinais fora do esperado, reavaliar"],
    modIndicadas: ["m-caminhada", "m-musculacao", "m-bike", "m-mobilidade"],
    modCautela: ["m-funcional", "m-combinado"],
    parametros: ["p-rpe", "p-adesao", "p-recuperacao"],
    comoComecar:
      "Comece com metas pequenas e alcançáveis (caminhada regular e força leve), priorizando a constância sobre a intensidade. Combine com o acompanhamento de saúde do aluno.",
    errosComuns: ["Metas grandes demais no início", "Focar em intensidade em vez de constância", "Tratar o treino como substituto do cuidado de saúde"],
    complexidade: "Moderada",
  }),
];

/** Ordem de apresentação no seletor de prescrição (aproxima a lista sugerida). */
const ORDEM_CONDICOES = [
  "iniciante-sedentario", "retorno-inatividade", "obesidade-grave", "hipertensao",
  "pre-diabetes", "diabetes-tipo-2", "sindrome-metabolica", "dislipidemia", "esteatose-hepatica",
  "idoso-destreinado", "sarcopenia", "osteoporose", "osteoartrite-joelho", "dor-lombar-inespecifica",
  "gestante", "pos-parto", "climaterio", "apneia-sono", "asma-controlada", "ansiedade-depressao",
];

export const specialGroups: SpecialGroup[] = [...specialGroupsBase, ...condicoesAdicionais].sort(
  (a, b) => {
    const ia = ORDEM_CONDICOES.indexOf(a.slug);
    const ib = ORDEM_CONDICOES.indexOf(b.slug);
    return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
  },
);

export function getSpecialGroup(slug: string) {
  return specialGroups.find((g) => g.slug === slug);
}

// Laranja (cta) reservado p/ AÇÃO. Complexidade alta usa âmbar (warning); moderada, neutro.
export const complexidadeTone: Record<Complexidade, "success" | "neutral" | "warning"> = {
  Baixa: "success",
  Moderada: "neutral",
  Alta: "warning",
};

/** Aviso padrão de segurança/escopo, para reuso nas telas do eixo. */
export const AVISO_SEGURANCA =
  "Conteúdo educacional de apoio à decisão do profissional de Educação Física. Não é conduta médica, diagnóstica ou terapêutica e não substitui avaliação médica. Ajuste sempre ao aluno e ao contexto.";

/* ------------------------- Conhecimento científico ------------------------- */
// Base teórica da condição aplicada ao exercício (o que é, fisiologia aplicada,
// evidência). Linguagem prudente: apoia a decisão do profissional habilitado e
// respeita o escopo (não diagnostica nem trata). Referências em referencias.ts.

export interface TeoriaGrupo {
  /** o que é a condição, em termos aplicados ao exercício */
  oQueE: string;
  /** fisiopatologia/fisiologia relevante para a resposta ao treino */
  fisiologia: string;
  /** o que a evidência sugere sobre o exercício nesta condição */
  evidencia: string;
  refIds: string[];
}

export const teoriaGrupo: Record<string, TeoriaGrupo> = {
  "obesidade-grave": {
    oQueE:
      "Excesso de massa corporal que aumenta a sobrecarga mecânica sobre as articulações e a demanda cardiorrespiratória para uma mesma tarefa. O foco do exercício é função, saúde e adesão, não apenas a perda de peso.",
    fisiologia:
      "O maior peso eleva o gasto e a percepção de esforço em atividades com sustentação do corpo (caminhar, subir), e aumenta a carga em joelhos e coluna. A termorregulação e a dispneia limitam o volume inicial. Modalidades sem impacto (água, bicicleta) reduzem a carga articular mantendo o estímulo aeróbio.",
    evidencia:
      "As diretrizes posicionam o volume aeróbio como eixo do gasto energético, com a força preservando massa magra; a progressão prioriza adesão e tolerância antes de intensidade. A resposta é individual e a conduta segue o profissional habilitado.",
    refIds: ["donnelly-2009", "oms-2020", "garber-2011"],
  },
  hipertensao: {
    oQueE:
      "Pressão arterial de repouso persistentemente elevada. O exercício é aliado no controle pressórico, mas a intensidade, a respiração e o monitoramento pedem atenção.",
    fisiologia:
      "No esforço, a pressão sistólica sobe com a intensidade; a manobra de Valsalva (prender a respiração) provoca picos pressóricos que convém evitar. Após sessões aeróbias há tendência de queda pressórica (hipotensão pós-exercício). Cargas leves a moderadas com respiração contínua são mais prudentes.",
    evidencia:
      "As diretrizes de cardiologia e os consensos de exercício e hipertensão apoiam o treino aeróbio e de força bem conduzidos, com respiração contínua e progressão gradual. A liberação, a medicação e os limites são conduta do profissional de saúde responsável.",
    refIds: ["sbc-2020", "pescatello-2004", "acsm-getp11"],
  },
  "diabetes-tipo-2": {
    oQueE:
      "Alteração no controle da glicose ligada à resistência à insulina. O exercício melhora a sensibilidade à insulina e o controle glicêmico, com cuidados quanto a hipoglicemia e aos pés.",
    fisiologia:
      "A contração muscular capta glicose por vias independentes de insulina, reduzindo a glicemia durante e após o exercício; por isso há risco de hipoglicemia, sobretudo em quem usa insulina ou secretagogos. A combinação de aeróbio e força potencializa o efeito. Inspeção dos pés e calçado adequado reduzem o risco de lesões despercebidas.",
    evidencia:
      "Os posicionamentos de diabetes e exercício recomendam a combinação de aeróbio e força com regularidade, atenção aos sinais de hipoglicemia e alimentação adequada antes da sessão. A conduta clínica e a medicação seguem o profissional de saúde.",
    refIds: ["colberg-2016", "sbd-2023", "garber-2011"],
  },
  "idoso-destreinado": {
    oQueE:
      "Pessoa idosa com baixa reserva de força e função, muitas vezes com receio de quedas. O treino de força e equilíbrio é prioridade para autonomia.",
    fisiologia:
      "Com o envelhecimento há perda de massa e força muscular (sarcopenia) e queda do controle de equilíbrio, o que compromete marcha, subir escadas e levantar da cadeira. O treino de força reverte parte dessa perda e o trabalho de equilíbrio reduz o risco de quedas; ganhos iniciais vêm bastante da adaptação neural.",
    evidencia:
      "Os posicionamentos para idosos priorizam força e função, com progressões pequenas e frequentes e técnica antes de carga. O treino resistido é seguro e eficaz quando bem conduzido e supervisionado.",
    refIds: ["chodzko-2009", "fragala-2019", "garber-2011"],
  },
  "dor-lombar-inespecifica": {
    oQueE:
      "Dor na região lombar sem causa estrutural específica identificada. O movimento gradual costuma ser aliado; o repouso prolongado tende a piorar o quadro.",
    fisiologia:
      "A dor lombar inespecífica é multifatorial (sensibilização, medo do movimento, descondicionamento) e nem sempre corresponde a dano tecidual. Exposição gradual à carga e ao movimento, respeitando a tolerância, costuma reduzir a sensibilidade e devolver confiança. Sinais de alerta (red flags) pedem encaminhamento.",
    evidencia:
      "As diretrizes de lombalgia incentivam manter-se ativo e o exercício como parte central do manejo, evitando repouso excessivo, e alertam para sinais que exigem avaliação de profissional de saúde (dor noturna que não alivia, déficit neurológico, febre).",
    refIds: ["nice-ng59", "garber-2011"],
  },
  "osteoartrite-joelho": {
    oQueE:
      "Desgaste articular do joelho com dor e rigidez que variam com a carga e a inflamação. As diretrizes posicionam o exercício como intervenção de primeira linha no manejo, com a intensidade modulada pela dor.",
    fisiologia:
      "Na osteoartrite, a dor e a inflamação variam ao longo do tempo; o fortalecimento do quadríceps e do quadril melhora a estabilidade e reduz a sobrecarga percebida. A carga controlada estimula a articulação sem necessariamente 'gastar' a cartilagem; períodos de inflamação aguda pedem modulação e baixo impacto.",
    evidencia:
      "As diretrizes de osteoartrite posicionam o exercício e o controle de carga como tratamento de primeira linha, com fortalecimento e atividade de baixo impacto; a intensidade é ajustada pela dor e por sinais inflamatórios.",
    refIds: ["oarsi-2019", "acr-2019", "garber-2011"],
  },
};

export function getTeoriaGrupo(slug: string): TeoriaGrupo | undefined {
  return teoriaGrupo[slug];
}
