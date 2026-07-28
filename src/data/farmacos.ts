/**
 * Camada de fármacos: o que muda na LEITURA do treino quando o aluno usa medicação.
 *
 * O produto não modela fármacos. Modela a consequência de treino que a presença de uma classe
 * justifica: qual instrumento deixa de guiar a intensidade, qual entra no lugar, qual gate
 * pré-sessão passa a fazer sentido e o que o profissional deve apenas registrar e encaminhar.
 * Por isso o sujeito da frase, em todo texto deste arquivo, é a resposta, o parâmetro, o aluno
 * ou o profissional, e nunca o fármaco.
 *
 * O que este arquivo NÃO comporta, por construção e não por esquecimento:
 * - quantidade, unidade, apresentação, horário ou esquema de uso (o tipo do dado do aluno não
 *   tem onde guardar isso, e um campo que ninguém lê é um campo que alguém vai imprimir);
 * - nome comercial (só princípio ativo, e só da lista fechada PRINCIPIOS_ATIVOS_PERMITIDOS);
 * - qualquer verbo dirigido à medicação. A conduta sobre a medicação é sempre devolvida ao
 *   profissional de saúde que a prescreveu (ver DEVOLUCOES).
 *
 * Arquitetura (espelha src/lib/gps/restricoes.ts e src/data/regrasProgressao.ts):
 * - a UNIDADE DE EVIDÊNCIA é a consequência, não a classe. Assim a mesma classe pode ter uma
 *   consequência aprovada e outra pendente, que é exatamente o caso da estatina (queixa
 *   muscular aprovada, expectativa de adaptação pendente);
 * - o dado do aluno (FarmacoSelecionado) espelha RestricaoSelecionada: id da classe mais os
 *   metadados de contexto, com carimbo de tempo;
 * - a lei de fusão é a mesma do resto do motor: o mais CONSERVADOR vence, e nenhuma classe
 *   pode afrouxar o que a condição clínica já apertou.
 *
 * ESTADO NESTA ONDA (F1): o catálogo nasce DESLIGADO. Nada aqui é lido pelo motor, pelo
 * semáforo ou pelo Prontuário ainda. Este arquivo é a fonte de verdade que as ondas seguintes
 * passam a consultar.
 *
 * NENHUM fármaco altera teto de esforço nem passo de carga nesta versão: Mitchell 2019 mostra
 * percepção de esforço preservada para uma dada intensidade relativa sob betabloqueio, então
 * baixar o teto seria inventar. Os campos existem, ficam null, e só saem de null com evidência.
 *
 * Guardrail: scripts/check-farmacos.ts (npm run check:farmacos).
 */

import type { ParamMonitorId } from "./monitoringParameters";
import type { Aprovacao, Confianca } from "./regrasProgressao";

/* ------------------------------- Identidade ------------------------------- */

/**
 * Classes declaráveis. São CLASSES de conduta de treino, não categorias farmacológicas:
 * "outros redutores de resposta cronotrópica" existe porque o efeito de leitura é o mesmo do
 * betabloqueador, ainda que o mecanismo não seja.
 *
 * Nenhum destes ids pode coincidir com um slug de grupo especial (specialGroups.ts): declarar
 * uma classe NUNCA infere uma condição clínica no aluno. O check trava a colisão.
 */
export type FarmacoClasseId =
  | "betabloqueador"
  | "cronotropico-outros"
  | "diuretico"
  | "insulina-secretagogo"
  | "metformina"
  | "agonista-glp1"
  | "estatina"
  | "anti-inflamatorio-regular";

export type FarmacoGrupo = "cardiovascular" | "glicemia" | "lipidios" | "dor_inflamacao";

export const GRUPOS_FARMACO: { id: FarmacoGrupo; titulo: string; abertoInicial: boolean }[] = [
  { id: "cardiovascular", titulo: "Coração e pressão", abertoInicial: true },
  { id: "glicemia", titulo: "Glicemia e peso", abertoInicial: false },
  { id: "lipidios", titulo: "Colesterol e triglicerídeos", abertoInicial: false },
  { id: "dor_inflamacao", titulo: "Dor e inflamação", abertoInicial: false },
];

/* --------------------------- O dado do aluno ----------------------------- */

/** De onde veio a informação. Serve para calibrar a confiança, não para validar nada. */
export type FonteInformacaoFarmaco = "receita" | "relato_aluno" | "relato_responsavel" | "nao_sei";

export const FONTE_INFORMACAO_OPCOES: { id: FonteInformacaoFarmaco; rotulo: string }[] = [
  { id: "receita", rotulo: "Vi na receita ou no relatório médico" },
  { id: "relato_aluno", rotulo: "O aluno relatou" },
  { id: "relato_responsavel", rotulo: "Um responsável ou familiar relatou" },
  { id: "nao_sei", rotulo: "Não sei informar a origem" },
];

/** Se houve mudança recente no tratamento. Só marca que a resposta ao esforço pode estar mudando. */
export type MudancaRecente = "sim" | "nao" | "nao_sei";

export const MUDANCA_RECENTE_OPCOES: { id: MudancaRecente; rotulo: string }[] = [
  { id: "sim", rotulo: "Houve mudança recente no tratamento" },
  { id: "nao", rotulo: "Sem mudança recente" },
  { id: "nao_sei", rotulo: "Não sei informar" },
];

/**
 * Uma classe declarada para o aluno. Espelha RestricaoSelecionada em estrutura e em carimbo
 * de tempo, e propositalmente NÃO tem campo de quantidade, de esquema de uso nem texto livre:
 * o que não existe no tipo não vaza para a tela nem para o PDF.
 */
export interface FarmacoSelecionado {
  classe: FarmacoClasseId;
  fonte?: FonteInformacaoFarmaco;
  mudancaRecente?: MudancaRecente;
  criadoEm: string;
  atualizadoEm: string;
}

/* -------------------- Efeito sobre o monitoramento ------------------------ */

/**
 * A afirmação central da camada: qual instrumento deixa de guiar a intensidade e qual entra
 * no lugar. Não é penalidade nem passo de carga, é troca de instrumento.
 *
 * `invalidam` não vazio OBRIGA `substituem` não vazio: tirar o instrumento sem devolver outro
 * deixaria o profissional sem forma de dosar, que é pior do que a leitura imprecisa.
 */
export interface EfeitoMonitoramento {
  /** parâmetros que deixam de guiar a intensidade neste contexto */
  invalidam: ParamMonitorId[];
  /** parâmetros que passam a guiar no lugar; obrigatório quando invalidam não é vazio */
  substituem: ParamMonitorId[];
  /** parâmetros que ganham vigilância, sem deixar de valer */
  reforcam?: ParamMonitorId[];
  /** por que a leitura muda, na voz do produto (sujeito = a resposta, não o fármaco) */
  motivo: string;
  /** ids de referencias.ts que sustentam a troca */
  refId?: string[];
}

/** Parâmetro que continua valendo, mas com confiabilidade menor como termômetro de carga. */
export interface EfeitoVigilancia {
  reforcam: ParamMonitorId[];
  confiabilidadeReduzida?: ParamMonitorId[];
}

/**
 * Item de checklist pré-sessão que a classe justifica. Forma própria e mínima, mapeada para
 * ItemSemaforo só quando o semáforo condicional entrar (onda F5), para não acoplar dois
 * catálogos que evoluem em ritmos diferentes.
 */
export interface ItemGatePreSessao {
  /** id local; o semáforo o prefixa com farmaco:<classe>: ao montar o checklist */
  id: string;
  pergunta: string;
  porque: string;
  /** qual resposta pinta vermelho */
  respostaVermelha: "sim" | "nao";
  /** o que fazer quando pinta vermelho (ação de treino, nunca de medicação) */
  acao: string;
  refs?: string[];
}

/* ------------------- A unidade de evidência: a consequência ---------------- */

/**
 * Natureza da consequência. O tipo decide onde ela pode aparecer:
 * - "monitoramento" e "gate-pre-sessao" chegam à tela de sessão e ao Prontuário;
 * - "vigilancia" e "prioridade-treino" chegam ao profissional como cuidado;
 * - "expectativa-adaptacao" NUNCA vira card de ação, nunca entra no Prontuário e nunca aparece
 *   na tela de sessão (campo somenteTeoria). O pior desfecho desta feature não é a sessão ruim,
 *   é o profissional repassar ao aluno uma expectativa de adaptação e o aluno interromper por
 *   conta própria o que foi prescrito. Se parecer excesso de zelo, é, e é intencional.
 */
export type ConsequenciaTipo =
  | "monitoramento"
  | "gate-pre-sessao"
  | "vigilancia"
  | "prioridade-treino"
  | "expectativa-adaptacao";

/**
 * Espelha RegraProgressao: id estável, aprovação, confiança, referência, ano de curadoria e
 * versão. Mudou qualquer afirmação, sobe a versão. Consequência "pendente" é DECLARADA e não
 * crava nada: sem número e sem invalidar parâmetro.
 */
export interface ConsequenciaTreino {
  id: string;
  tipo: ConsequenciaTipo;
  /** o que muda no treino, em linguagem do profissional */
  descricao: string;

  /* ---- campos específicos por tipo (o check exige o campo do próprio tipo) ---- */
  /** tipo "monitoramento": qual instrumento sai e qual entra */
  monitoramento?: EfeitoMonitoramento;
  /** tipo "gate-pre-sessao": item que o checklist do dia passa a fazer */
  gate?: ItemGatePreSessao;
  /** tipo "vigilancia": o que ganha atenção, sem invalidar nada */
  vigilancia?: EfeitoVigilancia;

  /**
   * Teto de esforço percebido que a classe justificaria. null em TODAS as classes nesta versão:
   * a evidência disponível mostra percepção de esforço preservada para a mesma intensidade
   * relativa, então cravar um teto seria inventar. O campo existe para quando houver evidência.
   */
  tetoEsforco: number | null;
  /**
   * Fração do passo de carga normal (0 a 1) que a classe justificaria. null em TODAS as classes
   * nesta versão, pela mesma razão do teto. Só pode sair de null para APERTAR (fração menor).
   */
  passoCarga: number | null;

  aprovacao: Aprovacao;
  confianca: Confianca;
  /** ids de referencias.ts; obrigatório quando aprovacao é "aprovada" */
  refId: string[];
  /** ano de curadoria desta consequência neste catálogo, não o ano da referência */
  ano: number;
  versao: number;
  /** ressalva de honestidade científica: limite da amostra, do desenho ou da transferência */
  observacao?: string;
  /** true quando a consequência vive só na aba de teoria (ver ConsequenciaTipo) */
  somenteTeoria?: boolean;
}

/* ------------------------------ O catálogo -------------------------------- */

export interface FarmacoCatalogoItem {
  classe: FarmacoClasseId;
  grupo: FarmacoGrupo;
  titulo: string;
  /** o que a classe é, em uma linha, para o profissional reconhecer */
  descricao: string;
  /** princípios ativos que ajudam a reconhecer a classe; só da lista fechada */
  exemplos: string[];
  /** o que muda no treino, exibido no card (linguagem do profissional) */
  efeitos: string[];
  /**
   * O que o produto NUNCA afirma sobre esta classe. Obrigatório e não vazio: é a lista que
   * impede a próxima pessoa (ou o próximo modelo) de "completar" o catálogo com um número que
   * ninguém verificou.
   */
  naoAfirmar: string[];
  /** frase canônica que devolve a conduta ao profissional de saúde (uma de DEVOLUCOES) */
  devolucao: string;
  consequencias: ConsequenciaTreino[];
  /** slugs de specialGroups.ts em que a classe tende a aparecer; NÃO infere condição */
  gruposRelevantes: string[];
}

/**
 * Lista FECHADA de princípios ativos citáveis. Whitelist positiva, e não denylist: o risco não
 * é alguém escrever um nome proibido, é alguém colar um nome comercial por descuido. Só entra
 * aqui princípio ativo, em português, minúsculo, e todo item precisa ser usado por alguma
 * classe (o check recusa item órfão).
 */
export const PRINCIPIOS_ATIVOS_PERMITIDOS: string[] = [
  // resposta cronotrópica
  "atenolol",
  "bisoprolol",
  "carvedilol",
  "metoprolol",
  "nebivolol",
  "propranolol",
  "diltiazem",
  "verapamil",
  "ivabradina",
  "digoxina",
  // pressão e volume
  "clortalidona",
  "espironolactona",
  "furosemida",
  "hidroclorotiazida",
  "indapamida",
  // glicemia e peso
  "insulina",
  "glibenclamida",
  "gliclazida",
  "glimepirida",
  "repaglinida",
  "metformina",
  "dulaglutida",
  "exenatida",
  "liraglutida",
  "semaglutida",
  // lipídios
  "atorvastatina",
  "rosuvastatina",
  "sinvastatina",
  "pravastatina",
  // dor e inflamação
  "ibuprofeno",
  "naproxeno",
  "diclofenaco",
  "cetoprofeno",
  "celecoxibe",
];

/**
 * Frases canônicas de devolução. Toda cautela deste arquivo termina em uma delas, e todas
 * terminam na mesma sentença final: é ela que mantém a fronteira de escopo visível na tela,
 * e não só no código.
 */
export const DEVOLUCOES = {
  conduta: "A conduta sobre a medicação é do profissional de saúde que a prescreveu.",
  registrar:
    "Registre o que observou e encaminhe. A conduta sobre a medicação é do profissional de saúde que a prescreveu.",
  semAfirmar:
    "O produto registra o uso e não afirma nada sobre a resposta ao treino. A conduta sobre a medicação é do profissional de saúde que a prescreveu.",
  teoria:
    "Este achado fica na teoria e não muda a conduta do treino nem é assunto para levar ao aluno. A conduta sobre a medicação é do profissional de saúde que a prescreveu.",
} as const;

export const CATALOGO_FARMACOS: FarmacoCatalogoItem[] = [
  /* ===================== Coração e pressão ===================== */
  {
    classe: "betabloqueador",
    grupo: "cardiovascular",
    titulo: "Betabloqueador",
    descricao:
      "Classe frequente em hipertensão e em acompanhamento cardiológico. Com ela em uso, a frequência cardíaca deixa de acompanhar a intensidade da forma esperada.",
    exemplos: ["atenolol", "bisoprolol", "carvedilol", "metoprolol", "nebivolol", "propranolol"],
    efeitos: [
      "A frequência cardíaca deixa de guiar a intensidade: a zona-alvo sai do plano",
      "A percepção de esforço e o teste da fala passam a guiar no lugar",
      "O teto de esforço NÃO muda: a percepção de esforço se mantém válida para a mesma intensidade relativa",
    ],
    naoAfirmar: [
      "percentual de queda da frequência cardíaca",
      "frequência cardíaca máxima corrigida para quem usa a classe",
      "qualquer correção ou deslocamento da fórmula de reserva cardíaca",
      "janela em horas entre o uso e o treino",
      "que a classe impeça, atrase ou reduza o resultado do treino",
    ],
    devolucao: DEVOLUCOES.conduta,
    gruposRelevantes: [
      "hipertensao-estagio-1",
      "hipertensao-estagio-2",
      "idoso-destreinado",
      "sindrome-metabolica",
    ],
    consequencias: [
      {
        id: "bb-troca-instrumento-intensidade",
        tipo: "monitoramento",
        descricao:
          "A intensidade passa a ser guiada por percepção de esforço e teste da fala, e a zona de frequência cardíaca sai da prescrição em vez de ser corrigida por um fator.",
        monitoramento: {
          invalidam: ["p-fc"],
          substituem: ["p-rpe", "p-fala"],
          motivo:
            "Com esta classe em uso, a frequência cardíaca medida no esforço fica menor em todos os pontos do teste e os percentuais de máxima se deslocam, então ela deixa de ser um bom termômetro de intensidade. A percepção de esforço para a mesma intensidade relativa se mantém.",
          refId: ["mitchell-betabloq-2019", "wonisch-betabloq-2003"],
        },
        tetoEsforco: null,
        passoCarga: null,
        aprovacao: "aprovada",
        confianca: "moderada",
        refId: ["mitchell-betabloq-2019", "wonisch-betabloq-2003"],
        ano: 2026,
        versao: 1,
        observacao:
          "Dois ensaios cruzados pequenos (16 e 10 participantes) em adultos saudáveis, convergentes e diretamente sobre prescrição. A troca de instrumento é o que os autores sugerem; nenhum dos dois sustenta corrigir a frequência cardíaca por um fator, e por isso o produto não crava teto de esforço nem passo de carga aqui.",
      },
    ],
  },
  {
    classe: "cronotropico-outros",
    grupo: "cardiovascular",
    titulo: "Outros redutores de resposta cronotrópica",
    descricao:
      "Outras classes usadas no controle da frequência cardíaca, fora dos betabloqueadores. O efeito sobre a leitura tende a ser parecido, mas sem estudo de prescrição verificado.",
    exemplos: ["diltiazem", "verapamil", "ivabradina", "digoxina"],
    efeitos: [
      "Fica registrado que a leitura da frequência cardíaca pode não acompanhar a intensidade",
      "Nenhuma mudança automática no plano nesta versão",
      "Combinar percepção de esforço e teste da fala segue sendo a leitura mais robusta",
    ],
    naoAfirmar: [
      "qualquer percentual de mudança na frequência cardíaca",
      "equivalência de efeito com o betabloqueador",
      "que a zona de frequência cardíaca deva ser recalculada por um fator",
    ],
    devolucao: DEVOLUCOES.semAfirmar,
    gruposRelevantes: ["hipertensao-estagio-1", "hipertensao-estagio-2", "idoso-destreinado"],
    consequencias: [
      {
        id: "cro-declarado-sem-numero",
        tipo: "vigilancia",
        descricao:
          "O uso fica registrado e a leitura da intensidade merece conferência cruzada com percepção de esforço, sem que nada mude automaticamente no plano.",
        vigilancia: { reforcam: ["p-rpe", "p-fala"] },
        tetoEsforco: null,
        passoCarga: null,
        aprovacao: "pendente",
        confianca: "fraca",
        refId: [],
        ano: 2026,
        versao: 1,
        observacao:
          "Declarada sem número de propósito: a busca não devolveu ensaio de prescrição de exercício com estas classes comparável ao dos betabloqueadores. Enquanto não houver, o produto registra e não afirma.",
      },
    ],
  },
  {
    classe: "diuretico",
    grupo: "cardiovascular",
    titulo: "Diurético",
    descricao: "Classe comum no controle da pressão arterial.",
    exemplos: ["clortalidona", "espironolactona", "furosemida", "hidroclorotiazida", "indapamida"],
    efeitos: [
      "Fica registrado no perfil do aluno",
      "Nenhuma mudança no plano, no monitoramento ou no checklist do dia",
    ],
    naoAfirmar: [
      "qualquer efeito sobre a resposta ao treino",
      "qualquer orientação sobre hidratação, calor ou reposição",
      "qualquer efeito sobre câimbras, tontura ou tolerância ao esforço",
    ],
    devolucao: DEVOLUCOES.semAfirmar,
    gruposRelevantes: ["hipertensao-estagio-1", "hipertensao-estagio-2", "idoso-destreinado"],
    consequencias: [
      {
        id: "diu-apenas-registro",
        tipo: "vigilancia",
        descricao:
          "O uso fica registrado no perfil e nada muda no treino. Esta classe entra no catálogo sem NENHUMA referência: por isso o produto não afirma coisa alguma sobre a resposta ao esforço.",
        vigilancia: { reforcam: [] },
        tetoEsforco: null,
        passoCarga: null,
        aprovacao: "pendente",
        confianca: "fraca",
        refId: [],
        ano: 2026,
        versao: 1,
        observacao:
          "Sem nenhuma referência verificada: a busca não devolveu trabalho utilizável ligando esta classe à prescrição ou à leitura do esforço. Ela existe no catálogo apenas para que o profissional registre o uso, e continuará assim enquanto não houver evidência. Nenhum texto do produto pode ir além do registro.",
      },
    ],
  },

  /* ===================== Glicemia e peso ===================== */
  {
    classe: "insulina-secretagogo",
    grupo: "glicemia",
    titulo: "Insulina e secretagogos",
    descricao:
      "Tratamentos do diabetes que aumentam o risco de hipoglicemia durante e depois do esforço, independentemente do grupo em que o aluno foi cadastrado.",
    exemplos: ["insulina", "glibenclamida", "gliclazida", "glimepirida", "repaglinida"],
    efeitos: [
      "O checklist do dia passa a incluir alimentação e sinais de hipoglicemia, mesmo fora do grupo de diabetes",
      "Sintomas antes da sessão viram motivo de não iniciar e registrar",
      "Nenhum parâmetro de monitoramento sai do plano",
    ],
    naoAfirmar: [
      "probabilidade de hipoglicemia",
      "qualquer valor de glicemia como corte de liberação",
      "qualquer orientação de alimentação, quantidade ou horário",
      "janela em horas entre o uso e o treino",
    ],
    devolucao: DEVOLUCOES.registrar,
    gruposRelevantes: ["diabetes-tipo-2", "sindrome-metabolica"],
    consequencias: [
      {
        id: "ins-gate-hipoglicemia",
        tipo: "gate-pre-sessao",
        descricao:
          "O gate glicêmico deixa de ser exclusivo do checklist de diabetes e passa a valer para qualquer aluno que use a classe, inclusive um cadastrado por obesidade.",
        gate: {
          id: "sinais-hipoglicemia",
          pergunta:
            "O aluno se alimentou como de costume e está sem sinais de hipoglicemia agora (tremor, suor frio, tontura, confusão, fraqueza súbita)?",
          porque:
            "Nesta classe o risco de hipoglicemia acompanha o esforço, e o sinal aparece antes de a sessão começar. É gate de segurança, não avaliação clínica.",
          respostaVermelha: "nao",
          acao:
            "Não inicie a sessão. Registre o relato e siga o plano combinado com o profissional de saúde que acompanha o aluno.",
          refs: ["colberg-2016", "sbd-2023"],
        },
        tetoEsforco: null,
        passoCarga: null,
        aprovacao: "aprovada",
        confianca: "forte",
        refId: ["colberg-2016", "sbd-2023"],
        ano: 2026,
        versao: 1,
        observacao:
          "Reusa a base já citada do diabetes, sem referência nova: o que muda não é o cuidado, é o ESCOPO em que ele vale. Nesta onda a consequência está declarada e ainda não ligada; o checklist condicional entra em onda posterior.",
      },
    ],
  },
  {
    classe: "metformina",
    grupo: "glicemia",
    titulo: "Metformina",
    descricao: "Tratamento de primeira linha no diabetes tipo 2, também usado em outras condições metabólicas.",
    exemplos: ["metformina"],
    efeitos: [
      "Fica registrado no perfil do aluno",
      "Nenhuma mudança no plano, no monitoramento ou no checklist do dia",
      "A resposta individual medida no aluno é o dado que vale, porque ela varia muito",
    ],
    naoAfirmar: [
      "percentual de perda de adaptação",
      "que o aluno vá responder menos ao treino",
      "qualquer efeito sobre glicemia durante a sessão",
    ],
    devolucao: DEVOLUCOES.teoria,
    gruposRelevantes: ["diabetes-tipo-2", "pre-diabetes", "sindrome-metabolica", "esteatose-hepatica"],
    consequencias: [
      {
        id: "met-expectativa-adaptacao",
        tipo: "expectativa-adaptacao",
        descricao:
          "Em um ensaio com adultos por volta dos 62 anos, o ganho de sensibilidade à insulina e de VO2 máximo foi menor no grupo com a classe, com respondedores positivos e negativos convivendo. A variabilidade é o achado, e ela reforça acompanhar a resposta medida em vez de prever.",
        tetoEsforco: null,
        passoCarga: null,
        aprovacao: "pendente",
        confianca: "moderada",
        refId: ["konopka-metformina-2019"],
        ano: 2026,
        versao: 1,
        somenteTeoria: true,
        observacao:
          "Ensaio único, e o próprio resultado é a variabilidade individual. Não vira card de ação, não entra no Prontuário e não aparece na tela de sessão.",
      },
    ],
  },
  {
    classe: "agonista-glp1",
    grupo: "glicemia",
    titulo: "Agonista de GLP-1",
    descricao: "Classe usada no diabetes tipo 2 e no tratamento da obesidade, com perda de peso associada.",
    exemplos: ["dulaglutida", "exenatida", "liraglutida", "semaglutida"],
    efeitos: [
      "O treino ganha prioridade no plano em vez de ser reduzido durante a perda de peso",
      "O trabalho de força se mantém no plano ao longo de todo o período",
      "Nenhum parâmetro de monitoramento sai do plano",
    ],
    naoAfirmar: [
      "percentual de perda de massa magra",
      "qualquer número de composição corporal esperado para este aluno",
      "qualquer orientação sobre alimentação, náusea ou tolerância digestiva",
    ],
    devolucao: DEVOLUCOES.conduta,
    gruposRelevantes: [
      "obesidade-grau-1",
      "obesidade-grau-2",
      "obesidade-grau-3",
      "diabetes-tipo-2",
      "sindrome-metabolica",
    ],
    consequencias: [
      {
        id: "glp1-manter-treino-no-plano",
        tipo: "prioridade-treino",
        descricao:
          "Durante a perda de peso, o treino continua no plano com a mesma prioridade: no ensaio de um ano, só o braço que combinou exercício e tratamento melhorou hemoglobina glicada, sensibilidade à insulina e aptidão cardiorrespiratória, e reduziu mais o percentual de gordura (3,9 pontos, contra 1,7 do exercício isolado e 1,9 do braço com o fármaco isolado).",
        tetoEsforco: null,
        passoCarga: null,
        aprovacao: "aprovada",
        confianca: "moderada",
        refId: ["lundgren-glp1-2021"],
        ano: 2026,
        versao: 1,
        observacao:
          "Ensaio único, 195 adultos com obesidade e sem diabetes, com uma única molécula da classe. Sustenta MANTER o treino, e não prever composição corporal: o estudo não traz número de massa magra e o produto não inventa um.",
      },
    ],
  },

  /* ===================== Colesterol e triglicerídeos ===================== */
  {
    classe: "estatina",
    grupo: "lipidios",
    titulo: "Estatina",
    descricao: "Classe muito frequente no controle de lipídios, comum em dislipidemia e em risco cardiovascular.",
    exemplos: ["atorvastatina", "rosuvastatina", "sinvastatina", "pravastatina"],
    efeitos: [
      "Queixa muscular difusa nova entra no checklist do dia como sinal de registrar e encaminhar",
      "Queixa muscular NÃO é motivo para reduzir carga por conta própria",
      "Nenhum parâmetro de monitoramento sai do plano",
    ],
    naoAfirmar: [
      "que a queixa muscular venha da medicação",
      "qualquer valor de enzima muscular como corte de liberação",
      "percentual de perda de força ou de capacidade de exercício",
      "que o aluno vá responder menos ao treino",
    ],
    devolucao: DEVOLUCOES.registrar,
    gruposRelevantes: ["dislipidemia", "sindrome-metabolica", "diabetes-tipo-2", "esteatose-hepatica"],
    consequencias: [
      {
        id: "est-queixa-muscular-encaminha",
        tipo: "gate-pre-sessao",
        descricao:
          "Queixa muscular difusa nova vira sinal de REGISTRAR e ENCAMINHAR. No ensaio controlado com 420 adultos, força e capacidade de exercício não pioraram, então reduzir carga por causa da queixa trataria o sintoma errado e ainda esconderia o achado do profissional de saúde.",
        gate: {
          id: "queixa-muscular-difusa",
          pergunta: "Surgiu dor ou fraqueza muscular difusa nova, sem relação com o treino recente?",
          porque:
            "Queixa muscular nova merece registro e encaminhamento, e não ajuste de carga: no ensaio controlado, força e capacidade de exercício se mantiveram.",
          respostaVermelha: "sim",
          acao:
            "Registre onde e desde quando a queixa aparece e oriente avaliação com o profissional de saúde que acompanha o aluno. Mantenha o plano enquanto a avaliação não indicar outra coisa.",
          refs: ["parker-estatina-2013"],
        },
        vigilancia: { reforcam: ["p-dor", "p-fadiga"] },
        tetoEsforco: null,
        passoCarga: null,
        aprovacao: "aprovada",
        confianca: "moderada",
        refId: ["parker-estatina-2013"],
        ano: 2026,
        versao: 1,
        observacao:
          "No ensaio, mais participantes do braço ativo desenvolveram mialgia (19 contra 10, P=0,05), com a estatística no limite, enquanto força e capacidade de exercício não mudaram de forma significativa. O produto usa isso para direcionar o encaminhamento, nunca para atribuir a queixa à medicação.",
      },
      {
        id: "est-expectativa-adaptacao",
        tipo: "expectativa-adaptacao",
        descricao:
          "Em um ensaio com 37 adultos sedentários, a aptidão cardiorrespiratória subiu menos no grupo que combinou treino aeróbio e a classe do que no grupo só com treino. Achado de teoria, e não de conduta.",
        tetoEsforco: null,
        passoCarga: null,
        aprovacao: "pendente",
        confianca: "fraca",
        refId: ["mikus-estatina-2013"],
        ano: 2026,
        versao: 1,
        somenteTeoria: true,
        observacao:
          "Ensaio único, amostra pequena, uma única molécula. Declarada PENDENTE e mantida fora do card de ação, da tela de sessão e do Prontuário: o pior desfecho desta feature é o profissional repassar este achado ao aluno e o aluno interromper por conta própria o que foi prescrito.",
      },
    ],
  },

  /* ===================== Dor e inflamação ===================== */
  {
    classe: "anti-inflamatorio-regular",
    grupo: "dor_inflamacao",
    titulo: "Anti-inflamatório de uso regular",
    descricao:
      "Uso continuado, e não pontual, de anti-inflamatório não esteroidal. É o uso regular que interessa aqui, porque ele acompanha o aluno ao longo do bloco de treino.",
    exemplos: ["ibuprofeno", "naproxeno", "diclofenaco", "cetoprofeno", "celecoxibe"],
    efeitos: [
      "A dor percebida fica menos informativa como termômetro de carga",
      "Fadiga pós-sessão e recuperação entre sessões ganham peso na leitura da carga de treino",
      "Nenhum parâmetro sai do plano e nenhuma carga muda automaticamente",
    ],
    naoAfirmar: [
      "percentual de redução de hipertrofia neste aluno",
      "que o aluno deva treinar sem a medicação para render mais",
      "qualquer relação entre o uso e a dor que ele sente na sessão",
      "que a força ganhe menos com o uso, já que no ensaio a força melhorou de forma semelhante nos dois grupos no treino convencional",
    ],
    devolucao: DEVOLUCOES.registrar,
    gruposRelevantes: ["osteoartrite-joelho", "dor-lombar-inespecifica"],
    consequencias: [
      {
        id: "aine-vigilancia-dor",
        tipo: "vigilancia",
        descricao:
          "A dor percebida continua sendo perguntada, mas passa a ser lida junto de fadiga pós-sessão e recuperação entre sessões, que não dependem do alívio do sintoma para informar o quanto de treino coube na semana.",
        vigilancia: { reforcam: ["p-fadiga", "p-recuperacao"], confiabilidadeReduzida: ["p-dor"] },
        tetoEsforco: null,
        passoCarga: null,
        aprovacao: "pendente",
        confianca: "fraca",
        refId: [],
        ano: 2026,
        versao: 1,
        observacao:
          "Declarada sem referência de propósito: a busca não devolveu estudo verificado sobre a confiabilidade do relato de dor durante o treino sob uso regular desta classe. Por isso a consequência REFORÇA outros parâmetros e não invalida nenhum: ninguém perde instrumento com base em raciocínio não verificado.",
      },
      {
        id: "aine-expectativa-adaptacao",
        tipo: "expectativa-adaptacao",
        descricao:
          "Em jovens saudáveis treinando 8 semanas, o aumento de volume do quadríceps foi maior no braço de comparação (7,5% contra 3,7%); o protocolo dos dois braços está na referência. Precisão que costuma se perder na leitura: no treino convencional a força melhorou de forma semelhante nos dois grupos (11 a 20%), e a diferença de ganho apareceu na perna do ergômetro inercial.",
        tetoEsforco: null,
        passoCarga: null,
        aprovacao: "aprovada",
        confianca: "moderada",
        refId: ["lilja-aine-2018"],
        ano: 2026,
        versao: 1,
        somenteTeoria: true,
        observacao:
          "Ensaio real e bem conduzido, por isso a consequência é aprovada e não pendente. A trava aqui não é rebaixar a evidência, é o campo somenteTeoria: população jovem e saudável buscando maximizar hipertrofia não é o aluno que usa a medicação por uma condição sob prescrição, e transferir o achado para ele seria inventar.",
      },
    ],
  },
];

/* ------------------------------- Helpers ---------------------------------- */

const POR_CLASSE = new Map(CATALOGO_FARMACOS.map((i) => [i.classe, i]));

export function itemDaClasse(classe: FarmacoClasseId): FarmacoCatalogoItem | undefined {
  return POR_CLASSE.get(classe);
}

export function rotuloFarmaco(classe: FarmacoClasseId): string {
  return POR_CLASSE.get(classe)?.titulo ?? classe;
}

export function agora(): string {
  return new Date().toISOString();
}

export function criarFarmaco(
  classe: FarmacoClasseId,
  extras: Partial<FarmacoSelecionado> = {},
): FarmacoSelecionado {
  const ts = agora();
  return { classe, criadoEm: ts, atualizadoEm: ts, ...extras };
}

/**
 * Seleções que de fato valem: descarta classe desconhecida (dado antigo ou vindo da nuvem com
 * um id que não existe mais) e duplicata da mesma classe, mantendo a primeira ocorrência. A
 * ordem de saída é a do CATÁLOGO, e não a da digitação, para que tudo que derive daqui seja
 * determinístico.
 */
export function farmacosAtivos(farmacos: FarmacoSelecionado[] | undefined): FarmacoSelecionado[] {
  if (!farmacos?.length) return [];
  const escolhidos = new Map<FarmacoClasseId, FarmacoSelecionado>();
  for (const f of farmacos) {
    if (!POR_CLASSE.has(f.classe)) continue;
    if (!escolhidos.has(f.classe)) escolhidos.set(f.classe, f);
  }
  return CATALOGO_FARMACOS.map((i) => escolhidos.get(i.classe)).filter(
    (f): f is FarmacoSelecionado => Boolean(f),
  );
}

/** Ordem canônica dos parâmetros: a do catálogo de monitoramento, para saída determinística. */
const ORDEM_PARAM: ParamMonitorId[] = [
  "p-rpe",
  "p-fala",
  "p-fc",
  "p-pa",
  "p-dispneia",
  "p-dor",
  "p-fadiga",
  "p-recuperacao",
  "p-adesao",
  "p-volume",
];

const ordenarParams = (ids: ParamMonitorId[]): ParamMonitorId[] =>
  ORDEM_PARAM.filter((id) => ids.includes(id));

/**
 * Funde os efeitos de monitoramento de VÁRIAS classes no mais conservador, na mesma lei de
 * fundirRegras: quem invalida vence.
 *
 * - `invalidam` é a UNIÃO: se qualquer classe tira o instrumento, ele sai;
 * - um substituto que outra classe invalidou NÃO entra, senão a fusão devolveria como guia
 *   exatamente o parâmetro que acabou de perder a validade;
 * - `reforcam` segue a mesma regra do substituto.
 *
 * A saída é ordenada pelo catálogo de parâmetros e os textos são ordenados de forma estável,
 * então a função é comutativa e associativa de fato, e não só "na prática".
 */
export function fundirMonitoramento(
  efeitos: EfeitoMonitoramento[],
): EfeitoMonitoramento | undefined {
  if (efeitos.length === 0) return undefined;

  const invalidam: ParamMonitorId[] = [];
  for (const e of efeitos) for (const id of e.invalidam) if (!invalidam.includes(id)) invalidam.push(id);

  const substituem: ParamMonitorId[] = [];
  for (const e of efeitos) {
    for (const id of e.substituem) {
      if (invalidam.includes(id) || substituem.includes(id)) continue;
      substituem.push(id);
    }
  }

  const reforcam: ParamMonitorId[] = [];
  for (const e of efeitos) {
    for (const id of e.reforcam ?? []) {
      if (invalidam.includes(id) || reforcam.includes(id)) continue;
      reforcam.push(id);
    }
  }

  const motivos = [...new Set(efeitos.map((e) => e.motivo).filter(Boolean))].sort();
  const refId = [...new Set(efeitos.flatMap((e) => e.refId ?? []))].sort();

  return {
    invalidam: ordenarParams(invalidam),
    substituem: ordenarParams(substituem),
    reforcam: reforcam.length ? ordenarParams(reforcam) : undefined,
    motivo: motivos.join(" "),
    refId: refId.length ? refId : undefined,
  };
}

/** Todas as consequências do catálogo, achatadas (usado pelo guardrail e pela aba de teoria). */
export function todasConsequencias(): { item: FarmacoCatalogoItem; consequencia: ConsequenciaTreino }[] {
  return CATALOGO_FARMACOS.flatMap((item) =>
    item.consequencias.map((consequencia) => ({ item, consequencia })),
  );
}

/** Classes que de fato mudam alguma decisão de treino (têm ao menos uma consequência aprovada). */
export function classesQueAgem(): FarmacoClasseId[] {
  return CATALOGO_FARMACOS.filter((i) => i.consequencias.some((c) => c.aprovacao === "aprovada")).map(
    (i) => i.classe,
  );
}
