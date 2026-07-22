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

export const semaforos: ChecklistSemaforo[] = [
  /* ------------------------------ HIPERTENSÃO ----------------------------- */
  {
    grupoSlug: "hipertensao",
    itens: [
      {
        id: "pa-repouso",
        pergunta: "Pressão arterial de repouso medida agora (após ~5 min sentado)",
        porque:
          "O ponto de partida do dia define se o esforço é prudente. Valores muito elevados em repouso pedem adiar a sessão.",
        opcoes: [
          { valor: "ok", rotulo: "Abaixo de 140/90 mmHg", cor: "verde" },
          {
            valor: "moderada",
            rotulo: "Entre 140/90 e 159/104 mmHg",
            cor: "amarelo",
            acao: "Sessão leve: reduza intensidade, evite isometrias e monitore PSE; remeça a PA após o aquecimento.",
          },
          {
            valor: "alta",
            rotulo: "160/105 mmHg ou acima",
            cor: "vermelho",
            acao: "Não inicie a sessão hoje. Oriente remedir em repouso e procurar o médico se persistir.",
          },
          {
            valor: "sem-medida",
            rotulo: "Não foi possível medir",
            cor: "amarelo",
            acao: "Sem medida do dia: mantenha esforço leve (PSE ≤4), sem apneia, e observe sinais durante toda a sessão.",
          },
        ],
        refs: ["sbc-2020", "acsm-getp11"],
      },
      {
        id: "sintomas",
        pergunta: "Apresenta agora dor de cabeça intensa, tontura, dor no peito ou visão turva?",
        porque: "Sintomas ativos mudam o dia: não é dia de treinar, é dia de investigar.",
        opcoes: simNao("vermelho", "verde", "Interrompa o atendimento e oriente avaliação médica antes de retomar."),
        refs: ["sbc-2020"],
      },
      {
        id: "medicacao",
        pergunta: "Tomou a medicação anti-hipertensiva habitual hoje (se prescrita)?",
        porque: "Sem a medicação do dia, a resposta pressórica ao esforço fica menos previsível.",
        opcoes: [
          { valor: "sim", rotulo: "Sim", cor: "verde" },
          {
            valor: "nao",
            rotulo: "Não",
            cor: "amarelo",
            acao: "Reduza a intensidade (PSE ≤4), evite picos de esforço e priorize contínuo leve; registre no prontuário.",
          },
          { valor: "na", rotulo: "Não usa medicação", cor: "verde" },
        ],
        refs: ["pescatello-2004"],
      },
      {
        id: "autorizacao",
        pergunta: "Há liberação/avaliação médica válida para exercício?",
        porque: "Em hipertensão, a liberação médica formal é o lastro documental do trabalho do profissional.",
        opcoes: [
          { valor: "sim", rotulo: "Sim, em dia", cor: "verde" },
          {
            valor: "vencida",
            rotulo: "Sim, mas antiga (>12 meses)",
            cor: "amarelo",
            acao: "Prossiga com intensidade leve a moderada e oriente atualizar a avaliação médica.",
          },
          {
            valor: "nao",
            rotulo: "Não",
            cor: "amarelo",
            acao: "Trabalhe apenas em intensidade leve, sem esforços máximos, e condicione a progressão à liberação médica.",
          },
        ],
        refs: ["acsm-getp11", "warburton-2011"],
      },
    ],
  },

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

  /* --------------------------- OBESIDADE GRAVE ---------------------------- */
  {
    grupoSlug: "obesidade-grave",
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
            acao: "Migre para baixo impacto (bike, meio aquático) e reduza volume; reavalie a dor ao final.",
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
            acao: "Reduza a dose da sessão (PSE ≤4, menos blocos) e priorize completar com conforto.",
          },
        ],
      },
    ],
  },

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
