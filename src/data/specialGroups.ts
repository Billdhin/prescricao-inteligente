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

export const specialGroups: SpecialGroup[] = [
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
      "Pessoa com diabetes tipo 2 ou risco metabólico, que se beneficia de regularidade e da combinação de força e aeróbio. Sensações de hipoglicemia podem aparecer em alguns contextos.",
    objetivos: [
      "Aumentar gasto e sensibilidade ao esforço com regularidade",
      "Combinar força e aeróbio",
      "Melhorar composição corporal e função",
    ],
    riscosCautelas: [
      "Sintomas de hipoglicemia em alguns contextos (tremor, sudorese, confusão)",
      "Cuidado com os pés (calçado, atrito): considerar impacto",
      "Adesão como fator crítico",
    ],
    sinaisAlerta: [
      "Sinais de hipoglicemia → interromper e observar; pode indicar necessidade de reavaliação",
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
      "Desgaste articular do joelho com dor e rigidez que variam com a carga e a inflamação. O exercício é tratamento central, modulado pela dor.",
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
