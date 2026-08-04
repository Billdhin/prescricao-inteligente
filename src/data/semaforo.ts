/**
 * SEMÁFORO DE LIBERAÇÃO — gate de segurança pré-sessão do Motor RCD.
 * Checklist de 30–60 segundos, específico por grupo/condição, com resultado
 * determinístico: VERDE (liberado) · AMARELO (liberado com ajuste) · VERMELHO
 * (não liberado hoje — reavaliar/considerar encaminhamento).
 *
 * Conteúdo EDUCACIONAL de apoio à decisão do profissional habilitado (CREF):
 * as regras são prudentes e citam a base (referencias.ts), mas a decisão final
 * é SEMPRE do profissional — o semáforo documenta, não decide por ele.
 * Números de diretriz devem ser validados com a edição vigente no contexto local.
 */

import {
  CATALOGO_FARMACOS,
  farmacosAtivos,
  type FarmacoClasseId,
  type FarmacoSelecionado,
  type ItemGatePreSessao,
} from "@/data/farmacos";

export type CorSemaforo = "verde" | "amarelo" | "vermelho";

export interface OpcaoSemaforo {
  valor: string;
  rotulo: string;
  cor: CorSemaforo;
  /** ação sugerida quando esta opção pinta amarelo/vermelho */
  acao?: string;
}

export interface ItemSemaforo {
  id: string;
  pergunta: string;
  /** contexto curto de por que a pergunta importa */
  porque: string;
  opcoes: OpcaoSemaforo[];
  /** ids de referencias.ts */
  refs?: string[];
}

export interface ChecklistSemaforo {
  grupoSlug: string;
  itens: ItemSemaforo[];
}

/* Opções binárias padrão */
const simNao = (
  corSim: CorSemaforo,
  corNao: CorSemaforo,
  acaoProblema?: string,
): OpcaoSemaforo[] => [
  { valor: "sim", rotulo: "Sim", cor: corSim, acao: corSim !== "verde" ? acaoProblema : undefined },
  { valor: "nao", rotulo: "Não", cor: corNao, acao: corNao !== "verde" ? acaoProblema : undefined },
];

/**
 * Checklist de obesidade por GRAU (I/II/III). A estrutura é a mesma; a conduta fica
 * progressivamente mais conservadora conforme o grau sobe (teto de esforço menor no
 * grau III). Cortes de grau: seidell-flegal-1997 e who-imc-2004.
 */
function mkObesidadeSemaforo(slug: string, grau: 1 | 2 | 3): ChecklistSemaforo {
  const pseTeto = grau === 3 ? 3 : 4; // grau III adota teto de esforço menor
  return {
    grupoSlug: slug,
    itens: [
      {
        id: "dispneia-repouso",
        pergunta: "Há falta de ar em repouso ou mal-estar/dor no peito agora?",
        porque: "Dispneia em repouso não é ponto de partida de sessão: é sinal de investigação.",
        opcoes: simNao("vermelho", "verde", "Não inicie e oriente avaliação médica antes de retomar."),
        refs: ["acsm-getp11"],
      },
      {
        id: "dor-articular",
        pergunta: "Dor articular (joelho/lombar) hoje, de 0 a 10?",
        porque: "A dor do dia decide o impacto tolerável: a modalidade se adapta ao corpo, não o contrário.",
        opcoes: [
          { valor: "leve", rotulo: "0–3 (leve)", cor: "verde" },
          {
            valor: "moderada",
            rotulo: "4–6 (moderada)",
            cor: "amarelo",
            acao:
              grau === 1
                ? "Reduza volume e prefira baixo impacto (bike, meio aquático); reavalie a dor ao final."
                : "Migre para baixo impacto (bike, meio aquático) e reduza volume; reavalie a dor ao final.",
          },
          {
            valor: "alta",
            rotulo: "7–10 (intensa)",
            cor: "vermelho",
            acao: "Não carregue essa articulação hoje; considere sessão só de mobilidade/aquático e reavaliação.",
          },
        ],
        refs: ["oarsi-2019", "acr-2019"],
      },
      {
        id: "sono-hidratacao",
        pergunta: "Dormiu razoavelmente e está hidratado hoje?",
        porque: "Sono ruim + desidratação derrubam a tolerância: dose menor rende mais que insistência.",
        opcoes: [
          { valor: "sim", rotulo: "Sim", cor: "verde" },
          {
            valor: "nao",
            rotulo: "Não",
            cor: "amarelo",
            acao: `Reduza a dose da sessão (PSE ≤${pseTeto}, menos blocos) e priorize completar com conforto.`,
          },
        ],
      },
    ],
  };
}

/**
 * CHECKLIST DA HIPERTENSÃO, NOS DOIS ESTÁGIOS.
 *
 * ## O que estava errado, e por quê
 *
 * A versão anterior pintava VERMELHO de 160/100 para cima e, no estágio 2, também quando não
 * havia liberação médica e quando o aluno não tinha tomado a medicação do dia. Some as três: o
 * hipertenso estágio 2 é, por definição, quem vive na faixa de 160/100 a 179/109. O produto
 * cancelava a sessão da pessoa por ela ter exatamente a condição que ela declarou ter.
 *
 * E isso contraria a direção da própria evidência que o grupo cita. O position stand do ACSM
 * (pescatello-2004) diz, com todas as letras, que ENQUANTO a avaliação formal e o manejo
 * acontecem é razoável que a maioria dos pacientes comece exercício de intensidade moderada,
 * como caminhada. A revisão guarda-chuva de 594 mil adultos (pescatello-pa-2019) mostra
 * evidência forte de que a atividade física reduz a pressão e reduz a progressão de doença
 * cardiovascular em quem já é hipertenso, com benefício MAIOR justamente em quem parte de
 * pressão mais alta. Cancelar a sessão dessa pessoa não é cautela: é tirar dela o tratamento.
 *
 * ## O que passa a valer
 *
 * O vermelho fica reservado a duas coisas, e as duas são defensáveis:
 *   1. SINTOMA ATIVO (dor no peito, tontura, dor de cabeça intensa, visão turva). Aí não é dia
 *      de treinar, é dia de investigar, em qualquer pressão.
 *   2. PRESSÃO A PARTIR DE 180/110, que é o estágio 3 da SBC e a faixa que, sustentada e com
 *      lesão aguda de órgão-alvo, caracteriza emergência hipertensiva (tocci-emergencia-2018).
 *
 * Faltar liberação médica ou faltar a medicação do dia passa a ser AMARELO: a sessão acontece
 * em intensidade moderada, sem esforço máximo e sem apneia, e o que fica condicionado à
 * liberação é a PROGRESSÃO para intensidade vigorosa. É exatamente o desenho que o position
 * stand descreve, e continua sendo mais conservador do que ele em um ponto de propósito: a
 * casa mantém a recomendação de buscar a avaliação, só não usa a sessão como refém dela.
 *
 * A diferença entre estágio 1 e estágio 2 deixa de ser "quem trava" e passa a ser o TETO de
 * esforço e a vigilância: o estágio 2 trabalha mais leve e remede a pressão depois do
 * aquecimento. É o que a diferença de risco justifica, sem cancelar o cuidado.
 */
function mkHipertensaoSemaforo(estagio: 1 | 2): ChecklistSemaforo {
  const pseTeto = estagio === 2 ? 4 : 5;
  const vigia =
    estagio === 2
      ? " Remeça a PA depois do aquecimento e observe sintomas durante toda a sessão."
      : "";
  return {
    grupoSlug: `hipertensao-estagio-${estagio}`,
    itens: [
      {
        id: "pa-repouso",
        pergunta: "Pressão arterial de repouso medida agora (após ~5 min sentado)",
        porque:
          estagio === 2
            ? "A medida do dia calibra a dose, não decide se o aluno merece treinar. Quem tem estágio 2 vive na faixa de 160/100: é ali que o exercício de intensidade moderada é o tratamento, e o que muda com a pressão mais alta é o teto de esforço."
            : "A medida do dia calibra a dose. Pressão dentro da faixa habitual do estágio não é motivo para cancelar: é a condição que o exercício trata.",
        opcoes: [
          { valor: "ok", rotulo: "Abaixo de 140/90 mmHg", cor: "verde" },
          {
            valor: "estagio1",
            rotulo: "140/90 a 159/99 mmHg (estágio 1)",
            cor: "verde",
            acao: undefined,
          },
          {
            valor: "estagio2",
            rotulo: "160/100 a 179/109 mmHg (estágio 2)",
            cor: "amarelo",
            acao: `Sessão de intensidade moderada (PSE ≤${pseTeto}), respiração contínua, sem apneia, sem isometria sustentada e sem esforço máximo.${vigia} Se essa faixa for nova para este aluno, oriente remedir em repouso e procurar avaliação médica.`,
          },
          {
            valor: "crise",
            rotulo: "180/110 mmHg ou acima (estágio 3)",
            cor: "vermelho",
            acao: "Não inicie a sessão. Oriente remedir em repouso após alguns minutos e, se confirmar, procurar avaliação médica antes de retomar; com dor no peito, falta de ar, déficit neurológico ou visão turva junto, o encaminhamento é imediato.",
          },
          {
            valor: "sem-medida",
            rotulo: "Não foi possível medir",
            cor: "amarelo",
            acao: `Sem medida do dia: mantenha esforço leve a moderado (PSE ≤${pseTeto}), sem apneia, e observe sinais durante toda a sessão.`,
          },
        ],
        refs: ["sbc-2020", "tocci-emergencia-2018", "pescatello-pa-2019"],
      },
      {
        id: "sintomas",
        pergunta: "Apresenta agora dor de cabeça intensa, tontura, dor no peito ou visão turva?",
        porque:
          "Este é o item que de fato trava a sessão, e trava em qualquer pressão: sintoma ativo deixa de ser caso de treino e passa a ser caso de investigação.",
        opcoes: simNao("vermelho", "verde", "Interrompa o atendimento e oriente avaliação médica antes de retomar."),
        refs: ["sbc-2020", "acsm-getp11"],
      },
      {
        id: "medicacao",
        pergunta: "Tomou a medicação anti-hipertensiva habitual hoje (se prescrita)?",
        porque:
          "Sem a medicação do dia a resposta pressórica ao esforço fica menos previsível. Isso pede dose menor e vigilância, não cancelamento: a sessão perdida também tem custo.",
        opcoes: [
          { valor: "sim", rotulo: "Sim", cor: "verde" },
          {
            valor: "nao",
            rotulo: "Não",
            cor: "amarelo",
            acao: `Reduza a intensidade (PSE ≤${pseTeto}), evite picos de esforço e apneia, prefira contínuo leve e registre no prontuário. Oriente o aluno a alinhar o horário da medicação com quem a prescreveu.`,
          },
          { valor: "na", rotulo: "Não usa medicação", cor: "verde" },
        ],
        refs: ["pescatello-2004"],
      },
      {
        id: "autorizacao",
        pergunta: "Há liberação/avaliação médica válida para exercício?",
        porque:
          "A liberação é o lastro documental do profissional e a porta para progredir a intensidade. Enquanto ela não sai, o position stand do ACSM diz que é razoável começar em intensidade moderada, como caminhada: é isso que o app faz.",
        opcoes: [
          { valor: "sim", rotulo: "Sim, em dia", cor: "verde" },
          {
            valor: "vencida",
            rotulo: "Sim, mas antiga (>12 meses)",
            cor: "amarelo",
            acao: "Prossiga em intensidade leve a moderada e oriente atualizar a avaliação médica antes de progredir para esforço vigoroso.",
          },
          {
            valor: "nao",
            rotulo: "Não",
            cor: "amarelo",
            acao: `Faça a sessão em intensidade moderada (PSE ≤${pseTeto}), sem esforço máximo e sem apneia, e condicione a PROGRESSÃO para intensidade vigorosa à liberação médica. Encaminhe para a avaliação e registre o encaminhamento.`,
          },
        ],
        refs: ["pescatello-2004", "warburton-2011", "acsm-getp11"],
      },
    ],
  };
}

/**
 * A FAMÍLIA CARDIOMETABÓLICA: pré-diabetes, síndrome metabólica, dislipidemia e esteatose
 * hepática. São quatro condições que compartilham o mesmo risco de fundo e o mesmo gate de
 * porta (sintoma em repouso), e diferem no ITEM DO MEIO, que é o que cada uma tem de próprio.
 *
 * O consenso do grupo EXPERT (hansen-expert-2018) trata justamente da COMBINAÇÃO desses
 * fatores, que é a situação real do aluno: raramente eles vêm sozinhos. Por isso o checklist
 * é o mesmo esqueleto, e não quatro checklists que se contradizem em três palavras.
 */
type FocoCardiometabolico = "glicemia" | "pressao" | "estatina" | "fadiga";

function itemProprioCardiometabolico(foco: FocoCardiometabolico): ItemSemaforo {
  switch (foco) {
    case "glicemia":
      return {
        id: "glicemia",
        pergunta: "Se mede a glicemia: o valor de hoje está dentro do habitual do aluno, e ele se alimentou nas últimas horas?",
        porque:
          "No pré-diabetes sem medicação hipoglicemiante o risco de hipoglicemia é baixo, mas jejum prolongado ainda derruba a sessão. A pergunta serve para calibrar a dose, não para assustar.",
        opcoes: [
          { valor: "ok", rotulo: "Sim, dentro do habitual", cor: "verde" },
          {
            valor: "fora",
            rotulo: "Fora do habitual ou com mal-estar",
            cor: "vermelho",
            acao: "Não inicie a sessão. Oriente seguir o plano de saúde do aluno e retome quando estabilizar.",
          },
          {
            valor: "jejum",
            rotulo: "Não se alimentou",
            cor: "amarelo",
            acao: "Ofereça um lanche leve antes ou reduza volume e intensidade da sessão.",
          },
          { valor: "na", rotulo: "Não mede glicemia", cor: "verde" },
        ],
        refs: ["colberg-2016", "hansen-expert-2018"],
      };
    case "pressao":
      return {
        id: "pa-hoje",
        pergunta: "Se foi possível medir: a pressão de repouso de hoje está abaixo de 180/110 mmHg?",
        porque:
          "Pressão alta faz parte do diagnóstico de síndrome metabólica, então medir é rotina aqui. O corte que tira a sessão do campo do treino é o mesmo do semáforo da hipertensão: 180 por 110.",
        opcoes: [
          { valor: "ok", rotulo: "Sim, abaixo de 180/110", cor: "verde" },
          {
            valor: "alta",
            rotulo: "180/110 mmHg ou acima",
            cor: "vermelho",
            acao: "Não inicie a sessão. Oriente remedir em repouso e, se confirmar, procurar avaliação médica antes de retomar.",
          },
          { valor: "sem-medida", rotulo: "Não foi possível medir", cor: "verde" },
        ],
        refs: ["sbc-2020", "tocci-emergencia-2018"],
      };
    case "estatina":
      return {
        id: "queixa-muscular",
        pergunta: "Há dor, fraqueza ou sensibilidade muscular DIFUSA, sem relação com o treino recente?",
        porque:
          "É a queixa muscular associada às estatinas, e a marca dela é não seguir o que foi treinado. Confundi-la com dor de treino troca um encaminhamento por um ajuste de série.",
        opcoes: simNao(
          "amarelo",
          "verde",
          "Registre a queixa com localização e intensidade, mantenha a sessão em intensidade leve e oriente conversar com quem prescreveu a medicação. Não sugira interromper medicação.",
        ),
        refs: ["parker-estatina-2013", "mikus-estatina-2013"],
      };
    case "fadiga":
      return {
        id: "fadiga-desproporcional",
        pergunta: "A fadiga de hoje está desproporcional ao que a rotina explicaria?",
        porque:
          "Fadiga fora do padrão é o sinal que o aluno costuma normalizar e o profissional consegue notar. Não trava a sessão: muda o tamanho dela e entra no registro.",
        opcoes: simNao(
          "amarelo",
          "verde",
          "Reduza volume e intensidade, registre o padrão e, se ele se repetir por semanas, oriente reavaliação com quem acompanha o caso.",
        ),
        refs: ["hansen-expert-2018"],
      };
  }
}

function mkCardiometabolicoSemaforo(slug: string, foco: FocoCardiometabolico): ChecklistSemaforo {
  return {
    grupoSlug: slug,
    itens: [
      {
        id: "mal-estar",
        pergunta: "Apresenta agora dor no peito, palpitação, tontura ou falta de ar em repouso?",
        porque:
          "É o gate de porta desta família inteira: o risco cardiovascular está acumulado, e sintoma em repouso deixa de ser caso de treino e passa a ser caso de avaliação.",
        opcoes: simNao("vermelho", "verde", "Não inicie a sessão hoje e oriente avaliação médica antes de retomar."),
        refs: ["hansen-expert-2018", "acsm-getp11"],
      },
      itemProprioCardiometabolico(foco),
      {
        id: "medicacao-alterada",
        pergunta: "Começou medicação nova ou mudou dose nos últimos dias?",
        porque:
          "Medicações cardiometabólicas mexem em frequência cardíaca, pressão e disposição; a resposta ao esforço muda até o corpo se acomodar.",
        opcoes: simNao(
          "amarelo",
          "verde",
          "Sessão conservadora, atenção a tontura e fadiga, e registro da mudança no prontuário.",
        ),
        refs: ["acsm-getp11", "hansen-expert-2018"],
      },
    ],
  };
}

export const semaforos: ChecklistSemaforo[] = [
  /* --------------------- HIPERTENSÃO ESTÁGIO 1 · ESTÁGIO 2 ---------------- */
  mkHipertensaoSemaforo(1),
  mkHipertensaoSemaforo(2),

  /* ---------------------------- DIABETES TIPO 2 --------------------------- */
  {
    grupoSlug: "diabetes-tipo-2",
    itens: [
      {
        id: "hipoglicemia",
        pergunta: "Apresenta agora tremor, sudorese fria, confusão ou fome súbita?",
        porque: "São sinais compatíveis com hipoglicemia: exercício agora pode agravar.",
        opcoes: simNao(
          "vermelho",
          "verde",
          "Não inicie. Ofereça carboidrato de rápida absorção, reavalie em 15 min e oriente contato médico se persistir.",
        ),
        refs: ["colberg-2016", "sbd-2023"],
      },
      {
        id: "alimentacao",
        pergunta: "Alimentou-se nas últimas 2–3 horas?",
        porque: "Treinar em jejum prolongado aumenta o risco de hipoglicemia durante a sessão.",
        opcoes: [
          { valor: "sim", rotulo: "Sim", cor: "verde" },
          {
            valor: "nao",
            rotulo: "Não",
            cor: "amarelo",
            acao: "Ofereça um lanche leve antes de começar ou reduza volume/intensidade; tenha carboidrato rápido à mão.",
          },
        ],
        refs: ["colberg-2016"],
      },
      {
        id: "pes",
        pergunta: "Os pés estão íntegros (sem bolha, ferida ou dor nova)?",
        porque: "Lesões nos pés pioram silenciosamente no diabetes: checar antes do volume de passos.",
        opcoes: [
          { valor: "sim", rotulo: "Sim", cor: "verde" },
          {
            valor: "nao",
            rotulo: "Há lesão/desconforto",
            cor: "amarelo",
            acao: "Troque para modalidade sem descarga nos pés (bike, meio aquático, força sentado) e oriente avaliação da lesão.",
          },
        ],
        refs: ["colberg-2016", "sbd-2023"],
      },
      {
        id: "glicemia",
        pergunta: "Se mediu a glicemia hoje: o valor está dentro da faixa habitual do aluno?",
        porque: "Extremos relatados (muito baixa ou muito alta com mal-estar) pedem prudência, não heroísmo.",
        opcoes: [
          { valor: "ok", rotulo: "Sim, habitual", cor: "verde" },
          {
            valor: "fora",
            rotulo: "Fora do habitual / com mal-estar",
            cor: "vermelho",
            acao: "Não inicie a sessão. Oriente seguir o plano médico do aluno e retome quando estabilizar.",
          },
          { valor: "sem-medida", rotulo: "Não mediu", cor: "verde" },
        ],
        refs: ["sbd-2023"],
      },
    ],
  },

  /* -------------------- OBESIDADE GRAU I · II · III ----------------------- */
  // Mesma estrutura por grau; a conduta fica mais conservadora do I ao III
  // (ver mkObesidadeSemaforo, teto de esforço menor no grau III).
  mkObesidadeSemaforo("obesidade-grau-1", 1),
  mkObesidadeSemaforo("obesidade-grau-2", 2),
  mkObesidadeSemaforo("obesidade-grau-3", 3),

  /* -------------------------- IDOSO DESTREINADO --------------------------- */
  {
    grupoSlug: "idoso-destreinado",
    itens: [
      {
        id: "tontura-queda",
        pergunta: "Teve tontura hoje ou queda nos últimos 7 dias?",
        porque: "Tontura do dia e queda recente mudam a prioridade: segurança e causa antes de carga.",
        opcoes: [
          { valor: "nao", rotulo: "Não", cor: "verde" },
          {
            valor: "queda",
            rotulo: "Queda recente, sem lesão",
            cor: "amarelo",
            acao: "Sessão com apoio constante, exercícios sentados/estáveis; investigue o contexto da queda.",
          },
          {
            valor: "tontura",
            rotulo: "Tontura hoje",
            cor: "vermelho",
            acao: "Não inicie. Oriente avaliação (pressão, medicação, ouvido interno) antes de retomar.",
          },
        ],
        refs: ["chodzko-2009"],
      },
      {
        id: "medicacao-alterada",
        pergunta: "Alguma medicação foi alterada nos últimos 7 dias?",
        porque: "Ajustes recentes (pressão, glicemia, sono) mudam a resposta ao esforço até o corpo se adaptar.",
        opcoes: [
          { valor: "nao", rotulo: "Não", cor: "verde" },
          {
            valor: "sim",
            rotulo: "Sim",
            cor: "amarelo",
            acao: "Sessão conservadora (PSE ≤4) e observação de tontura/fadiga até estabilizar a nova medicação.",
          },
        ],
        refs: ["acsm-getp11"],
      },
      {
        id: "dor-nova",
        pergunta: "Alguma dor NOVA desde a última sessão?",
        porque: "Dor nova em idoso merece respeito: ajustar hoje evita afastamento amanhã.",
        opcoes: [
          { valor: "nao", rotulo: "Não", cor: "verde" },
          {
            valor: "sim",
            rotulo: "Sim",
            cor: "amarelo",
            acao: "Evite carregar a região dolorida; se a dor persistir por mais de uma semana, oriente avaliação.",
          },
        ],
        refs: ["fragala-2019"],
      },
    ],
  },

  /* ----------------------- DOR LOMBAR INESPECÍFICA ------------------------ */
  {
    grupoSlug: "dor-lombar-inespecifica",
    itens: [
      {
        id: "red-flags",
        pergunta:
          "Há algum sinal de alerta: dificuldade ou perda de controle para urinar ou evacuar, dormência na região da sela (períneo/entrepernas), perda de força ou dormência nas duas pernas, dor noturna que não alivia com mudança de posição, febre ou perda de peso inexplicada?",
        porque:
          "São as red flags clássicas da NICE, incluindo os sinais de síndrome da cauda equina (alteração para urinar/evacuar e anestesia em sela): deixam de ser caso de treino e passam a ser caso de investigação médica.",
        opcoes: simNao(
          "vermelho",
          "verde",
          "Não trate como lombalgia comum. Diante de alteração para urinar/evacuar ou dormência na sela, oriente procura de atendimento médico com urgência; nos demais sinais, avaliação médica antes de qualquer sessão.",
        ),
        refs: ["nice-ng59"],
      },
      {
        id: "dor-agora",
        pergunta: "Dor lombar agora, de 0 a 10?",
        porque: "A dor do dia calibra amplitude e carga: movimento tolerável costuma ajudar na recuperação; dor crescente atrapalha.",
        opcoes: [
          { valor: "leve", rotulo: "0–3 (leve)", cor: "verde" },
          {
            valor: "moderada",
            rotulo: "4–6 (moderada)",
            cor: "amarelo",
            acao: "Reduza amplitude/carga nos padrões que provocam; priorize exercícios que aliviam (ex.: core no solo).",
          },
          {
            valor: "alta",
            rotulo: "7–10 (intensa)",
            cor: "vermelho",
            acao: "Sessão de alívio apenas (mobilidade suave, posições confortáveis); se persistir, oriente avaliação.",
          },
        ],
        refs: ["nice-ng59"],
      },
      {
        id: "piora",
        pergunta: "A dor piorou desde a última sessão?",
        porque: "Tendência importa mais que o número: piora consistente pede regressão da dose.",
        opcoes: [
          { valor: "nao", rotulo: "Não (igual ou melhor)", cor: "verde" },
          {
            valor: "sim",
            rotulo: "Sim, piorou",
            cor: "amarelo",
            acao: "Regrida volume/carga para o nível da última sessão bem tolerada e reavalie em 48h.",
          },
        ],
        refs: ["nice-ng59"],
      },
    ],
  },

  /* ------------------------- OSTEOARTRITE DE JOELHO ----------------------- */
  {
    grupoSlug: "osteoartrite-joelho",
    itens: [
      {
        id: "inflamacao",
        pergunta: "O joelho está visivelmente inchado ou quente hoje?",
        porque: "Sinais inflamatórios agudos pedem repouso relativo da articulação, não carga.",
        opcoes: simNao(
          "vermelho",
          "verde",
          "Não carregue o joelho hoje; sessão alternativa (membros superiores, aquático) e reavaliação se persistir.",
        ),
        refs: ["oarsi-2019", "acr-2019"],
      },
      {
        id: "dor-joelho",
        pergunta: "Dor no joelho agora, de 0 a 10?",
        porque: "A dor do dia escolhe a modalidade: baixo impacto quando ela sobe, progressão quando dá trégua.",
        opcoes: [
          { valor: "leve", rotulo: "0–3 (leve)", cor: "verde" },
          {
            valor: "moderada",
            rotulo: "4–6 (moderada)",
            cor: "amarelo",
            acao: "Troque para baixo impacto (bike, aquático, força sentado) e reduza amplitude nos ângulos que doem.",
          },
          {
            valor: "alta",
            rotulo: "7–10 (intensa)",
            cor: "vermelho",
            acao: "Sem descarga no joelho hoje; considere sessão alternativa e reavaliação se recorrente.",
          },
        ],
        refs: ["oarsi-2019"],
      },
      {
        id: "resposta-24h",
        pergunta: "Após a última sessão, a dor voltou ao normal em até 24–48h?",
        porque: "É a régua clássica de dose na OA: dor que não assenta em 24–48h = dose alta demais.",
        opcoes: [
          { valor: "sim", rotulo: "Sim", cor: "verde" },
          {
            valor: "nao",
            rotulo: "Não, ficou pior por mais tempo",
            cor: "amarelo",
            acao: "Regrida a dose (volume/carga/impacto) em relação à última sessão e reavalie a resposta.",
          },
        ],
        refs: ["acr-2019"],
      },
    ],
  },

  /* ======================================================================
   * AS CONDIÇÕES QUE NÃO TINHAM GATE PRÓPRIO (04/08/2026)
   *
   * Catorze condições do catálogo caíam no checklist geral. Cada uma delas já
   * DECLARAVA os próprios sinais de alerta em `specialGroups.sinaisAlerta`, e
   * esses sinais nunca eram perguntados: a gestante respondia sobre dor nova e
   * sono, e nunca sobre sangramento ou contração. Era o mesmo defeito da escada
   * de joelho que não disparava, só que num lugar onde custa mais caro: dado de
   * segurança escrito no produto, sem caminho até a pergunta.
   *
   * Cada checklist abaixo tem no máximo quatro itens, para caber nos 30 a 60
   * segundos de porta de sessão, e cada item que faz afirmação clínica cita a
   * referência que a sustenta.
   * ====================================================================== */

  /* ------------------------------- GESTANTE ------------------------------- */
  {
    grupoSlug: "gestante",
    itens: [
      {
        id: "contraindicacao-absoluta",
        pergunta:
          "O obstetra registrou alguma destas condições: descolamento prematuro da placenta, vasa prévia, insuficiência cervical, trabalho de parto prematuro em curso, pré-eclâmpsia grave, restrição de crescimento intrauterino, doença cardiorrespiratória grave ou diabetes tipo 1 descontrolado?",
        porque:
          "Esta é a lista curta que a revisão sistemática de Meah (2020) sustenta como contraindicação ABSOLUTA, por forte potencial de dano materno ou fetal. A mesma revisão mostrou que a maior parte das outras contraindicações que circulam vinha de opinião de especialista: hipertensão gestacional e gestação gemelar, por exemplo, são casos em que a gestante tende a se beneficiar da atividade regular. Por isso a pergunta é fechada nessas oito, e não numa lista maior.",
        opcoes: simNao(
          "vermelho",
          "verde",
          "Não conduza sessão de exercício. A conduta é do obstetra: registre, encaminhe e só retome com orientação escrita dele.",
        ),
        refs: ["meah-contraindicacoes-2020", "acog-804-2020"],
      },
      {
        id: "sinais-obstetricos",
        pergunta:
          "Apresenta agora sangramento vaginal, perda de líquido, contrações regulares e dolorosas, dor no peito, tontura ou desmaio, dor de cabeça persistente, ou dor e inchaço na panturrilha?",
        porque:
          "São os sinais de alerta da diretriz canadense de atividade física na gestação. Nenhum deles é ajuste de sessão: qualquer um tira o caso do campo do treino e manda para avaliação obstétrica no mesmo dia.",
        opcoes: simNao(
          "vermelho",
          "verde",
          "Interrompa imediatamente e oriente procurar o serviço obstétrico hoje. Registre o sinal observado e a hora no prontuário.",
        ),
        refs: ["mottola-gestacao-2019"],
      },
      {
        id: "liberacao-obstetrica",
        pergunta: "Há liberação obstétrica válida para exercício nesta gestação?",
        porque:
          "Na ausência de complicação obstétrica ou clínica, a atividade física na gestação é segura e desejável (ACOG 804): a liberação existe para IDENTIFICAR a complicação, não para pôr o exercício em dúvida. Enquanto ela não existe, o profissional não tem como saber em qual dos dois cenários está.",
        opcoes: [
          { valor: "sim", rotulo: "Sim, em dia", cor: "verde" },
          {
            valor: "nao",
            rotulo: "Não",
            cor: "vermelho",
            acao: "Não inicie a prescrição sem a liberação obstétrica. Encaminhe, explique que o exercício é recomendado na gestação sem complicação, e retome com o documento em mãos.",
          },
        ],
        refs: ["acog-804-2020", "mottola-gestacao-2019"],
      },
      {
        id: "calor-hidratacao",
        pergunta: "O ambiente está fresco e arejado e a aluna está hidratada hoje?",
        porque:
          "Superaquecimento e desidratação são as cautelas de ambiente da gestação, e são as que o profissional controla dentro da sala.",
        opcoes: [
          { valor: "sim", rotulo: "Sim", cor: "verde" },
          {
            valor: "nao",
            rotulo: "Não",
            cor: "amarelo",
            acao: "Reduza a duração e a intensidade, aumente as pausas, garanta água disponível e prefira o horário mais fresco do dia.",
          },
        ],
        refs: ["mottola-gestacao-2019"],
      },
    ],
  },

  /* ------------------------------ PÓS-PARTO ------------------------------- */
  {
    grupoSlug: "pos-parto",
    itens: [
      {
        id: "liberacao-pos-parto",
        pergunta: "Há liberação do profissional de saúde para retomar exercício após este parto?",
        porque:
          "A retomada depende do tipo de parto e da recuperação, e quem tem esse dado é quem acompanhou o puerpério.",
        opcoes: [
          { valor: "sim", rotulo: "Sim", cor: "verde" },
          {
            valor: "nao",
            rotulo: "Não",
            cor: "vermelho",
            acao: "Não inicie a progressão de carga sem a liberação. Encaminhe e registre.",
          },
        ],
        refs: ["acog-804-2020"],
      },
      {
        id: "sinais-puerperio",
        pergunta: "Apresenta agora sangramento aumentado, dor pélvica nova, febre ou dor em cicatriz cirúrgica?",
        porque: "São sinais de que a recuperação não está seguindo o curso esperado; a sessão não resolve nenhum deles.",
        opcoes: simNao(
          "vermelho",
          "verde",
          "Não inicie a sessão e oriente avaliação com o profissional que acompanha o puerpério.",
        ),
        refs: ["acog-804-2020"],
      },
      {
        id: "assoalho-pelvico",
        pergunta: "Tem perdas urinárias, sensação de peso vaginal ou desconforto ao esforço?",
        porque:
          "São queixas de assoalho pélvico. Não travam a sessão, mas mudam o que se faz nela e pedem encaminhamento para quem avalia a região.",
        opcoes: simNao(
          "amarelo",
          "verde",
          "Evite impacto e aumento de pressão intra-abdominal hoje, priorize respiração e força guiada, e encaminhe para avaliação de assoalho pélvico.",
        ),
        refs: ["acog-804-2020"],
      },
      {
        id: "sono-puerperio",
        pergunta: "A noite foi de sono muito fragmentado?",
        porque:
          "Sono picado é a regra no puerpério e derruba a tolerância ao esforço. Dose menor que se cumpre vale mais que a planejada que não acontece.",
        opcoes: simNao(
          "amarelo",
          "verde",
          "Reduza volume e intensidade, mantenha a sessão curta e priorize sair dela melhor do que entrou.",
        ),
        refs: ["singh-saudemental-2023"],
      },
    ],
  },

  /* --------------------- OSTEOPENIA E OSTEOPOROSE ------------------------- */
  {
    grupoSlug: "osteoporose",
    itens: [
      {
        id: "dor-ossea-nova",
        pergunta: "Há dor nova nas costas ou dor óssea localizada desde a última sessão?",
        porque:
          "Dor dorsal nova em quem tem osso frágil levanta a hipótese de fratura vertebral, que costuma acontecer sem trauma evidente. O consenso Too Fit To Fracture é explícito em que NÃO há evidência suficiente para quantificar o risco do exercício nessa população: por isso o caminho é perguntar e encaminhar, não estimar um teto de carga seguro.",
        opcoes: simNao(
          "vermelho",
          "verde",
          "Não carregue a coluna hoje e oriente avaliação médica antes de retomar a progressão.",
        ),
        refs: ["giangregorio-2014", "beck-essa-2017"],
      },
      {
        id: "flexao-carregada",
        pergunta: "A sessão de hoje tem flexão de coluna com carga (abdominal com peso, remada curvada, terra pesado)?",
        porque:
          "A flexão de coluna CARREGADA é o padrão que o posicionamento da ESSA não recomenda nessa população. O resto do programa continua: o osso responde a impacto e a treino resistido progressivo.",
        opcoes: simNao(
          "amarelo",
          "verde",
          "Troque o padrão por variação sem flexão carregada da coluna (dobradiça de quadril com coluna neutra, força guiada, apoio) e mantenha o restante do programa.",
        ),
        refs: ["beck-essa-2017"],
      },
      {
        id: "risco-queda",
        pergunta: "Teve tontura hoje, queda nos últimos 7 dias ou está em piso escorregadio ou calçado inadequado?",
        porque:
          "Otimizar força, equilíbrio e mobilidade reduz queda e, por consequência, fratura. O contrário também vale: o risco de queda do dia manda no formato da sessão.",
        opcoes: simNao(
          "amarelo",
          "verde",
          "Sessão com apoio constante e exercícios estáveis, sem tarefa de equilíbrio sem suporte; resolva calçado e piso antes de progredir.",
        ),
        refs: ["beck-essa-2017", "chodzko-2009"],
      },
    ],
  },

  /* --------------------------- ASMA CONTROLADA ---------------------------- */
  {
    grupoSlug: "asma-controlada",
    itens: [
      {
        id: "sintomas-respiratorios",
        pergunta: "Apresenta agora chiado, tosse, aperto no peito ou falta de ar em repouso?",
        porque: "Sintoma respiratório em repouso não é ponto de partida de sessão: é sinal de que o controle escapou.",
        opcoes: simNao(
          "vermelho",
          "verde",
          "Não inicie. Siga a conduta prescrita pelo médico do aluno e oriente reavaliação se os sintomas persistirem.",
        ),
        refs: ["parsons-broncoespasmo-2013"],
      },
      {
        id: "medicacao-resgate",
        pergunta: "A medicação prescrita para antes do exercício e a de resgate estão disponíveis agora?",
        porque:
          "A diretriz da ATS faz recomendação FORTE de uso de broncodilatador de curta ação antes do exercício em quem tem broncoconstrição induzida pelo esforço. Quem prescreve é o médico; o profissional de educação física apenas confere que está à mão.",
        opcoes: [
          { valor: "sim", rotulo: "Sim", cor: "verde" },
          {
            valor: "nao",
            rotulo: "Não",
            cor: "amarelo",
            acao: "Mantenha a sessão em intensidade leve a moderada, com aquecimento gradual e sem picos de esforço, e oriente trazer a medicação prescrita nas próximas sessões.",
          },
          { valor: "na", rotulo: "Não tem medicação prescrita", cor: "verde" },
        ],
        refs: ["parsons-broncoespasmo-2013"],
      },
      {
        id: "ambiente",
        pergunta: "O ar está muito frio ou muito seco no local da sessão?",
        porque: "Ar frio e seco somado a esforço abrupto é o gatilho clássico do broncoespasmo do exercício.",
        opcoes: simNao(
          "amarelo",
          "verde",
          "Alongue o aquecimento, suba a intensidade em degraus pequenos e, quando possível, troque para ambiente coberto e mais úmido.",
        ),
        refs: ["parsons-broncoespasmo-2013"],
      },
    ],
  },

  /* --------------------- APNEIA OBSTRUTIVA DO SONO ------------------------ */
  {
    grupoSlug: "apneia-sono",
    itens: [
      {
        id: "sonolencia",
        pergunta: "Está com sonolência a ponto de cochilar sentado ou de perder atenção agora?",
        porque:
          "Sonolência diurna é a manifestação da apneia que vira risco DENTRO da sala: cochilar em esteira ou sob carga é acidente, não fadiga.",
        opcoes: simNao(
          "vermelho",
          "verde",
          "Não use esteira, escada ou carga livre hoje. Ofereça sessão curta sem risco de queda ou remarque, e reforce o acompanhamento do tratamento do sono.",
        ),
        refs: ["iftikhar-apneia-2014"],
      },
      {
        id: "mal-estar-cardio",
        pergunta: "Apresenta agora dor no peito, palpitação ou falta de ar desproporcional em repouso?",
        porque: "A apneia anda junto com risco cardiometabólico; sintoma em repouso pede investigação, não treino.",
        opcoes: simNao("vermelho", "verde", "Não inicie a sessão e oriente avaliação médica antes de retomar."),
        refs: ["hansen-expert-2018", "acsm-getp11"],
      },
      {
        id: "tratamento-sono",
        pergunta: "Está usando o tratamento do sono prescrito (por exemplo CPAP), quando houver?",
        porque:
          "O treino reduz a gravidade da apneia (menos 6,27 eventos por hora na metanálise), mas soma ao tratamento e não substitui: noite sem tratamento significa sessão com menos reserva.",
        opcoes: [
          { valor: "sim", rotulo: "Sim", cor: "verde" },
          {
            valor: "nao",
            rotulo: "Não / interrompeu",
            cor: "amarelo",
            acao: "Reduza volume e intensidade hoje e oriente retomar contato com quem acompanha o tratamento do sono.",
          },
          { valor: "na", rotulo: "Não tem tratamento prescrito", cor: "verde" },
        ],
        refs: ["iftikhar-apneia-2014"],
      },
    ],
  },

  /* ------------------ ANSIEDADE E SINTOMAS DEPRESSIVOS -------------------- */
  {
    grupoSlug: "ansiedade-depressao",
    itens: [
      {
        id: "risco-seguranca",
        pergunta:
          "Houve piora importante do quadro, ou o aluno relatou pensamentos de se machucar, desde a última sessão?",
        porque:
          "Este é o único item aqui que tira o caso do campo do treino. A atividade física é abordagem central no manejo de depressão e ansiedade, com efeito médio sobre os sintomas; o que não é do profissional de educação física é o risco à segurança.",
        opcoes: simNao(
          "vermelho",
          "verde",
          "Acolha sem julgamento, não conduza a sessão como se fosse um dia comum e encaminhe ao profissional de saúde mental que acompanha o aluno no mesmo dia. Registre o encaminhamento.",
        ),
        refs: ["singh-saudemental-2023"],
      },
      {
        id: "energia-hoje",
        pergunta: "Como está a disposição hoje, de 0 a 10?",
        porque:
          "Nos dias ruins o objetivo muda: a meta passa a ser a sessão ACONTECER. Intensidade maior tende a dar mais benefício sintomático, mas só na sessão que o aluno faz.",
        opcoes: [
          { valor: "ok", rotulo: "6 a 10 (dá para o planejado)", cor: "verde" },
          {
            valor: "baixa",
            rotulo: "3 a 5 (baixa)",
            cor: "amarelo",
            acao: "Reduza para a versão mínima da sessão e combine explicitamente que concluir já é a vitória do dia.",
          },
          {
            valor: "muito-baixa",
            rotulo: "0 a 2 (muito baixa)",
            cor: "amarelo",
            acao: "Troque por caminhada leve ou mobilidade, mantenha o vínculo e o horário, e não cobre desempenho hoje.",
          },
        ],
        refs: ["singh-saudemental-2023"],
      },
      {
        id: "medicacao-mudou",
        pergunta: "Começou ou mudou medicação psiquiátrica nos últimos dias?",
        porque: "Ajuste recente muda sono, disposição e tolerância ao esforço até o corpo se acomodar.",
        opcoes: simNao(
          "amarelo",
          "verde",
          "Sessão conservadora, atenção a tontura e sonolência, e registro da mudança no prontuário.",
        ),
        refs: ["acsm-getp11"],
      },
    ],
  },

  /* ------------------------------ SARCOPENIA ------------------------------ */
  {
    grupoSlug: "sarcopenia",
    itens: [
      {
        id: "tontura-queda",
        pergunta: "Teve tontura hoje ou queda nos últimos 7 dias?",
        porque: "Massa e força baixas somadas a queda recente mudam a prioridade da sessão: estabilidade antes de carga.",
        opcoes: [
          { valor: "nao", rotulo: "Não", cor: "verde" },
          {
            valor: "queda",
            rotulo: "Queda recente, sem lesão",
            cor: "amarelo",
            acao: "Sessão com apoio constante e exercícios estáveis; investigue o contexto da queda antes de voltar a progredir.",
          },
          {
            valor: "tontura",
            rotulo: "Tontura hoje",
            cor: "vermelho",
            acao: "Não inicie. Oriente avaliação (pressão, medicação, hidratação) antes de retomar.",
          },
        ],
        refs: ["fragala-2019", "chodzko-2009"],
      },
      {
        id: "dor-nova",
        pergunta: "Alguma dor NOVA desde a última sessão?",
        porque: "Dor nova aqui custa caro: uma semana parada em quem já perde massa não se recupera em uma semana.",
        opcoes: simNao(
          "amarelo",
          "verde",
          "Evite carregar a região dolorida, mantenha o resto do programa e reavalie; se persistir mais de uma semana, encaminhe.",
        ),
        refs: ["fragala-2019"],
      },
      {
        id: "alimentacao",
        pergunta: "Fez as refeições habituais nas últimas horas?",
        porque:
          "Treino de força sem aporte alimentar rende menos em quem já está em déficit de massa. O que é do profissional aqui é observar e encaminhar, não prescrever dieta.",
        opcoes: simNao(
          "amarelo",
          "verde",
          "Reduza o volume da sessão e encaminhe para avaliação nutricional; registre o padrão se ele se repetir.",
        ),
        refs: ["fragala-2019"],
      },
    ],
  },

  /* ------------------------ CLIMATÉRIO / MENOPAUSA ------------------------ */
  {
    grupoSlug: "climaterio",
    itens: [
      {
        id: "mal-estar",
        pergunta: "Apresenta agora palpitação, tontura, dor no peito ou falta de ar em repouso?",
        porque:
          "O risco cardiometabólico sobe na transição hormonal, e sintoma em repouso deixa de ser caso de treino em qualquer idade.",
        opcoes: simNao("vermelho", "verde", "Não inicie a sessão e oriente avaliação médica antes de retomar."),
        refs: ["acsm-getp11", "hansen-expert-2018"],
      },
      {
        id: "sono-fogacho",
        pergunta: "A noite foi ruim por fogachos ou insônia?",
        porque:
          "Sono ruim derruba a tolerância do dia. A força continua sendo a prioridade da fase: o que se ajusta é a dose, não o plano.",
        opcoes: simNao(
          "amarelo",
          "verde",
          "Reduza volume e mantenha a força do dia com carga menor; priorize concluir com técnica boa.",
        ),
        refs: ["foster-2001"],
      },
      {
        id: "dor-articular",
        pergunta: "Alguma dor articular nova ou persistente?",
        porque: "Queixa articular é comum na transição e responde melhor a ajuste precoce que a insistência.",
        opcoes: simNao(
          "amarelo",
          "verde",
          "Ajuste amplitude e carga na articulação envolvida e reavalie ao fim da sessão; se persistir, encaminhe.",
        ),
        refs: ["oarsi-2019"],
      },
    ],
  },

  /* -------------------- INICIANTE SEDENTÁRIO · RETORNO -------------------- */
  {
    grupoSlug: "iniciante-sedentario",
    itens: [
      {
        id: "sintomas-esforco",
        pergunta:
          "Já sentiu dor no peito, falta de ar desproporcional, palpitação ou desmaio ao fazer esforço, ou sente algum desses agora?",
        porque:
          "É a pergunta central da triagem pré-participação: sintoma no esforço é o achado que muda a conduta de quem nunca treinou, muito antes de qualquer teste.",
        opcoes: simNao(
          "vermelho",
          "verde",
          "Não inicie a sessão. Encaminhe para avaliação médica antes de começar o programa e registre o encaminhamento.",
        ),
        refs: ["warburton-2011", "acsm-getp11"],
      },
      {
        id: "orientacao-medica",
        pergunta: "Algum profissional de saúde já disse a este aluno para só fazer exercício sob supervisão médica?",
        porque:
          "Quando essa orientação existe, ela é anterior ao produto e vale mais que qualquer checklist. Perguntar é rápido e evita descobrir depois.",
        opcoes: simNao(
          "vermelho",
          "verde",
          "Não inicie sem alinhar com quem deu a orientação. Encaminhe e registre.",
        ),
        refs: ["warburton-2011"],
      },
      {
        id: "expectativa",
        pergunta: "A sessão de hoje cabe na rotina e na disposição do aluno?",
        porque:
          "Na largada, o inimigo não é a intensidade baixa demais, é a sessão que não acontece. Ajustar o tamanho é o que sustenta a adesão.",
        opcoes: simNao(
          "verde",
          "amarelo",
          "Reduza para a versão mínima da sessão e combine o próximo encontro antes de o aluno sair.",
        ),
        refs: ["oms-2020"],
      },
    ],
  },
  {
    grupoSlug: "retorno-inatividade",
    itens: [
      {
        id: "sintomas-esforco",
        pergunta:
          "Já sentiu dor no peito, falta de ar desproporcional, palpitação ou desmaio ao fazer esforço, ou sente algum desses agora?",
        porque:
          "Quem volta depois de muito tempo parado costuma comparar-se com quem foi um dia. A triagem por sintoma no esforço é a que separa cautela de suposição.",
        opcoes: simNao(
          "vermelho",
          "verde",
          "Não inicie a sessão. Encaminhe para avaliação médica antes de retomar o programa e registre o encaminhamento.",
        ),
        refs: ["warburton-2011", "acsm-getp11"],
      },
      {
        id: "motivo-da-parada",
        pergunta: "A parada teve como motivo uma lesão, cirurgia ou doença ainda em acompanhamento?",
        porque:
          "O motivo da interrupção manda no retorno. Voltar ao volume antigo em cima de uma questão ainda aberta é a recaída mais comum.",
        opcoes: simNao(
          "amarelo",
          "verde",
          "Retome bem abaixo do volume anterior, evite os padrões ligados ao motivo da parada e alinhe com quem acompanha o caso.",
        ),
        refs: ["acsm-getp11"],
      },
      {
        id: "dor-nova",
        pergunta: "Alguma dor nova desde a última sessão?",
        porque: "Dor nova na retomada quase sempre é dose, não fragilidade: ajustar cedo mantém a sequência viva.",
        opcoes: simNao(
          "amarelo",
          "verde",
          "Reduza volume e amplitude nos padrões que provocam a dor e reavalie na próxima sessão.",
        ),
        refs: ["foster-2001"],
      },
    ],
  },

  /* ------- FAMÍLIA CARDIOMETABÓLICA (pré-diabetes · síndrome · lipídeos) --- */
  mkCardiometabolicoSemaforo("pre-diabetes", "glicemia"),
  mkCardiometabolicoSemaforo("sindrome-metabolica", "pressao"),
  mkCardiometabolicoSemaforo("dislipidemia", "estatina"),
  mkCardiometabolicoSemaforo("esteatose-hepatica", "fadiga"),

  /* --------------------------- CHECKLIST GERAL ---------------------------- */
  // Para aluno SEM grupo especial: o gate pré-sessão vale para qualquer pessoa
  // (dor nova, mal-estar, recuperação e medicação mudam a sessão do dia).
  {
    grupoSlug: "geral",
    itens: [
      {
        id: "mal-estar",
        pergunta:
          "Sinais de mal-estar agora: febre, tontura, dor no peito, palpitação ou falta de ar em repouso?",
        porque:
          "Sintomas sistêmicos em repouso deixam de ser caso de treino e passam a ser caso de avaliação médica.",
        opcoes: simNao(
          "vermelho",
          "verde",
          "Não inicie a sessão hoje. Oriente avaliação médica se os sinais persistirem.",
        ),
        refs: ["warburton-2011", "acsm-getp11"],
      },
      {
        id: "dor-nova",
        pergunta: "Alguma dor nova ou desconforto incomum desde a última sessão?",
        porque: "Dor nova muda a sessão do dia: melhor adaptar cedo do que insistir no padrão que provoca.",
        opcoes: simNao(
          "amarelo",
          "verde",
          "Evite os padrões que provocam a dor, reduza amplitude e carga na região e reavalie ao fim da sessão.",
        ),
      },
      {
        id: "recuperacao",
        pergunta: "Noite de sono muito ruim, cansaço fora do comum ou dores musculares intensas da sessão anterior?",
        porque: "Recuperação incompleta reduz a qualidade do estímulo e aumenta o risco de erro técnico.",
        opcoes: simNao(
          "amarelo",
          "verde",
          "Reduza volume e intensidade nesta sessão e priorize técnica e exercícios já dominados.",
        ),
        refs: ["foster-2001"],
      },
      {
        id: "medicacao",
        pergunta: "Começou medicação nova ou mudou dose nos últimos dias?",
        porque: "Alguns medicamentos alteram frequência cardíaca, pressão e disposição; a resposta ao esforço muda.",
        opcoes: simNao(
          "amarelo",
          "verde",
          "Sessão conservadora: monitore PSE e sinais, e alinhe com quem prescreveu a medicação quando houver dúvida.",
        ),
        refs: ["acsm-getp11"],
      },
    ],
  },
];

export function getSemaforo(grupoSlug: string) {
  return semaforos.find((s) => s.grupoSlug === grupoSlug);
}

/* --------------------- checklist condicional por fármaco ------------------ */

const PREFIXO_FARMACO = "farmaco:";

/** O sufixo do id de um item de medicação (`farmaco:estatina:queixa` vira `queixa`). */
const sufixoDoItem = (id: string) => (id.startsWith(PREFIXO_FARMACO) ? id.split(":").slice(2).join(":") : id);

/**
 * Quais itens de checklist de GRUPO já cobrem cada gate de medicação. Quando o checklist do
 * aluno traz TODOS os itens listados, o gate da classe é descartado: perguntar duas vezes a
 * mesma coisa, com duas redações, ensina o profissional a passar batido pelas duas.
 *
 * O mapa mora aqui, e não no catálogo de fármacos, porque é conhecimento desta camada: o
 * catálogo não sabe (nem deve saber) o que o checklist de diabetes já pergunta.
 *
 * O gate da estatina NÃO entra: o item "dor nova" do checklist geral é outra pergunta (dor
 * ligada ao treino recente, com ação de adaptar a sessão), e o da estatina é queixa muscular
 * difusa SEM relação com o treino, com ação de registrar e encaminhar. Fundir os dois trocaria
 * o encaminhamento por um ajuste de sessão, que é exatamente o erro que a classe pede para não
 * cometer.
 */
export const GATE_JA_COBERTO_POR: Record<string, string[]> = {
  // o checklist de diabetes já pergunta sinais de hipoglicemia E alimentação, separadamente
  "sinais-hipoglicemia": ["hipoglicemia", "alimentacao"],
};

/**
 * Converte o gate do catálogo em item de checklist. O id ganha o prefixo `farmaco:<classe>:`
 * de forma OBRIGATÓRIA: é ele que deixa a resposta rastreável dentro de `Liberacao.respostas`
 * (que já é jsonb e já vai para a nuvem) sem precisar de coluna nova, e é ele que garante que
 * um item de medicação nunca se passe por item do grupo.
 */
function itemDoGate(classe: FarmacoClasseId, gate: ItemGatePreSessao): ItemSemaforo {
  const vermelhoNoSim = gate.respostaVermelha === "sim";
  return {
    id: `${PREFIXO_FARMACO}${classe}:${gate.id}`,
    pergunta: gate.pergunta,
    porque: gate.porque,
    opcoes: simNao(vermelhoNoSim ? "vermelho" : "verde", vermelhoNoSim ? "verde" : "vermelho", gate.acao),
    refs: gate.refs,
  };
}

/**
 * Os itens que cada classe de medicação ACRESCENTA ao checklist do dia, DERIVADOS do catálogo
 * (`ConsequenciaTreino.gate`), e não escritos aqui de novo. O texto do gate já passa pelo
 * `check:farmacos` (denylist de dose, de posologia e de imperativo sobre medicação), então
 * derivar em vez de copiar é o que impede um segundo catálogo de nascer com regra mais frouxa.
 *
 * Só entram consequências APROVADAS e que não são de teoria: uma expectativa de adaptação
 * jamais vira pergunta de checklist.
 */
export const ITENS_SEMAFORO_POR_FARMACO: { classe: FarmacoClasseId; itens: ItemSemaforo[] }[] =
  CATALOGO_FARMACOS.map((item) => ({
    classe: item.classe,
    itens: item.consequencias
      .filter((c) => c.aprovacao === "aprovada" && !c.somenteTeoria && c.gate)
      .map((c) => itemDoGate(item.classe, c.gate!)),
  })).filter((e) => e.itens.length > 0);

/**
 * O checklist do dia deste aluno: o do grupo (ou o geral, quando o grupo não tem um próprio)
 * mais os itens que as classes declaradas acrescentam, na ordem do catálogo.
 *
 * Duas travas que valem a leitura:
 *
 * 1. **Item já perguntado não repete.** Um aluno de diabetes que usa insulina já responde sobre
 *    sinais de hipoglicemia e sobre alimentação pelo checklist do grupo, então o gate da classe
 *    é descartado (ver `GATE_JA_COBERTO_POR`). O mesmo aluno cadastrado por obesidade, que não
 *    tem esses itens, recebe o gate: é o ESCOPO que muda, não o cuidado.
 * 2. **Sem classe declarada, devolve o MESMO objeto de antes.** Nenhum aluno sem medicação vê
 *    o checklist mudar de forma, de ordem ou de identidade.
 *
 * `avaliarSemaforo` não muda e não precisa mudar: já é comutativa, associativa e fail-closed,
 * então acrescentar item é acrescentar chance de amarelo e vermelho, nunca de verde.
 */
export function montarChecklist(
  grupoSlug: string,
  farmacos?: FarmacoSelecionado[],
): ChecklistSemaforo | undefined {
  const base = getSemaforo(grupoSlug) ?? (grupoSlug ? getSemaforo("geral") : undefined);
  if (!base) return undefined;

  const ativos = farmacosAtivos(farmacos);
  if (!ativos.length) return base;

  const jaPerguntado = new Set(base.itens.map((i) => sufixoDoItem(i.id)));
  const extras: ItemSemaforo[] = [];
  for (const { classe, itens } of ITENS_SEMAFORO_POR_FARMACO) {
    if (!ativos.some((f) => f.classe === classe)) continue;
    for (const item of itens) {
      const sufixo = sufixoDoItem(item.id);
      if (jaPerguntado.has(sufixo)) continue;
      const cobrem = GATE_JA_COBERTO_POR[sufixo];
      if (cobrem?.length && cobrem.every((id) => jaPerguntado.has(id))) continue;
      jaPerguntado.add(sufixo);
      extras.push(item);
    }
  }
  if (!extras.length) return base;
  return { grupoSlug: base.grupoSlug, itens: [...base.itens, ...extras] };
}

/**
 * O checklist que FOI respondido numa liberação já registrada, reconstruído pelas chaves
 * gravadas em `respostas`. Serve ao Prontuário e ao histórico: uma liberação antiga continua
 * legível com os itens que ela de fato fez, mesmo que o aluno tenha trocado de medicação
 * depois. É a rastreabilidade que o prefixo compra de graça, sem coluna nova no banco.
 */
export function checklistRespondido(
  grupoSlug: string,
  respostas: Record<string, string>,
): ChecklistSemaforo | undefined {
  const base = getSemaforo(grupoSlug) ?? (grupoSlug ? getSemaforo("geral") : undefined);
  if (!base) return undefined;
  const extras = ITENS_SEMAFORO_POR_FARMACO.flatMap((e) => e.itens).filter(
    (i) => respostas[i.id] !== undefined,
  );
  if (!extras.length) return base;
  return { grupoSlug: base.grupoSlug, itens: [...base.itens, ...extras] };
}

/* ------------------------------ avaliação ------------------------------- */

export interface ResultadoSemaforo {
  cor: CorSemaforo;
  rotulo: string;
  /** ações sugeridas (só amarelo/vermelho) */
  ajustes: { pergunta: string; acao: string }[];
  refs: string[];
}

const ROTULOS: Record<CorSemaforo, string> = {
  verde: "Liberado",
  amarelo: "Liberado com ajuste",
  vermelho: "Não liberado hoje",
};

/** Avalia as respostas {itemId: valor} — a pior cor vence; ações acumulam. */
export function avaliarSemaforo(
  checklist: ChecklistSemaforo,
  respostas: Record<string, string>,
): ResultadoSemaforo {
  let cor: CorSemaforo = "verde";
  const ajustes: { pergunta: string; acao: string }[] = [];
  const refs: string[] = [];
  const peso: Record<CorSemaforo, number> = { verde: 0, amarelo: 1, vermelho: 2 };
  let faltamRespostas = false;

  for (const item of checklist.itens) {
    const opcao = item.opcoes.find((o) => o.valor === respostas[item.id]);
    if (!opcao) {
      // Item sem resposta NAO pode contar como "verde" (falha aberta). Marca a
      // pendencia para o resultado falhar fechado por seguranca.
      faltamRespostas = true;
      continue;
    }
    if (peso[opcao.cor] > peso[cor]) cor = opcao.cor;
    if (opcao.cor !== "verde" && opcao.acao) ajustes.push({ pergunta: item.pergunta, acao: opcao.acao });
    for (const r of item.refs ?? []) if (!refs.includes(r)) refs.push(r);
  }

  // Fail-closed: com item pendente, nunca libera direto; pede completar o checklist.
  if (faltamRespostas && cor === "verde") {
    cor = "amarelo";
    ajustes.push({ pergunta: "Checklist incompleto", acao: "Responda todos os itens antes de liberar a sessão." });
  }

  return { cor, rotulo: ROTULOS[cor], ajustes, refs };
}
