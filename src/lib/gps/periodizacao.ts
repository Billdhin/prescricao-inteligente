/**
 * Motor de geração da periodização ("Prescrever treino").
 *
 * Determinístico: escolhe o(s) modelo(s) por objetivo, nível, duração e grupo especial, e
 * monta o macrociclo (mesociclos -> microciclos -> sessões) com as FAIXAS citadas de
 * src/data/periodizacao (nunca um número inventado). Quando o aluno tem grupo especial, as
 * fases da jornada já autorada viram o esqueleto do macrociclo, e os cuidados sobrepõem.
 *
 * A ferramenta APOIA a decisão do profissional habilitado; o plano é editável em tudo.
 */

import type { GpsObjetivo } from "@/lib/gps/engine";
import type { Nivel } from "@/data/types";
import {
  getFaixa,
  getModelo,
  valorFaixa,
  type Macrociclo,
  type Mesociclo,
  type Microciclo,
  type ModeloPeriodizacaoId,
  type Sessao,
  type BlocoSessao,
  type Tendencia,
  type FaixaObjetivo,
  type EnfaseSessao,
  type BandaAerobia,
  BANDAS_AEROBIAS,
  ORDEM_BANDA,
  MODELOS_PERIODIZACAO,
} from "@/data/periodizacao";
import { exercises } from "@/data/exercises";
import { getModalidade } from "@/data/modalities";
import { getSpecialGroup } from "@/data/specialGroups";
import { combineRules, groupGpsRules, type GroupGpsRule } from "@/lib/gps/groupRules";
import { doseDoPerfilComIdade, IDADE_DOSE_PROPRIA, RIR_MINIMO_IDADE } from "@/lib/gps/esforco";
import {
  restricoesAtivas,
  rotuloRestricao,
  criarRestricao,
  EFEITO_POR_TAG,
  type RestricaoSelecionada,
  type RestricaoTag,
  type AcaoRestricao,
} from "@/lib/gps/restricoes";
import type { ParamMonitorId } from "@/data/monitoringParameters";
import { alvoSemana, alvoAerobioSemana, objetivoDaSemana, lerFaixaRIR, type AlvoForca, type CtxAlvo } from "@/lib/gps/alvo";
import { intervaloDe } from "@/lib/gps/faixasParse";

export interface GerarPlanoInput {
  objetivo: GpsObjetivo;
  nivel: Nivel;
  /** duração total do acompanhamento, em semanas */
  semanas: number;
  /** sessões por semana */
  frequencia: number;
  grupoEspecial?: string;
  /**
   * As DEMAIS condições declaradas do aluno (`Aluno.condicoesAtencao`), além da principal.
   *
   * Existe porque o campo já era gravado (confirmar uma sugestão do classificador escreve
   * nele) e o motor o ignorava por completo: um aluno com hipertensão estágio 2 confirmada
   * por ali recebia plano genérico, e o feedback de campo do Filipe foi exatamente esse.
   *
   * A principal continua dando o ESQUELETO de fases do macrociclo, porque uma jornada
   * clínica não se funde com outra. Todo o resto (restrições estruturais, teto de
   * complexidade, penalidades e modificador de progressão) sai da regra FUNDIDA de todas
   * elas, e a fusão é sempre pela mais conservadora (ver `fundirRegras`).
   */
  condicoesAtencao?: string[];
  /**
   * Segundo objetivo do aluno (src/lib/gps/objetivos.ts). O primario continua mandando
   * na faixa e na dose; o secundario so DESEMPATA a selecao de exercicios, depois da
   * seguranca. Ausente = plano byte-identico ao de antes.
   */
  objetivoSecundario?: GpsObjetivo;
  disponibilidade?: string;
  /**
   * Modelo escolhido pelo profissional (por exemplo, vindo de uma aula do Aprender).
   * A escolha vale, porque quem decide é ele; mas o que o motor escolheria continua
   * visível como alternativa e é dito no raciocínio, para a decisão ser informada.
   */
  modeloPreferido?: ModeloPeriodizacaoId;
  /**
   * Fase da jornada (grupo especial) em que o macrociclo começa: o aluno que já está na
   * fase 3 recebe o macro nascendo na fase 3, não do zero. Ausente = comportamento
   * byte-idêntico ao atual (o macro genérico ignora; o de grupo começa na fase 1).
   * Ranking nunca entra aqui (decisão travada 14): `rankExercises` só opera em edição.
   */
  faseInicial?: 1 | 2 | 3 | 4;
  /**
   * Dados do aluno usados SÓ para personalizar a zona de FC do aeróbio (MP-4): idade estima
   * a FCmax (208 - 0.7*idade) e a FCrep MEDIDA fecha a zona de Karvonen. Ambos opcionais: o
   * uso avulso/estudo e os guardrails não os passam, e aí o aeróbio guia por duração + PSE,
   * sem inventar zona. Não alteram a força nem o restante da geração A idade TAMBÉM entra na dose de força desde 30/08/2026, pela fusão
   * conservadora de `doseDoPerfilComIdade` (reserva mínima a partir de 65 anos); o que segue
   * determinístico é o resto da geração.
   */
  idade?: number;
  fcRepouso?: number;
  /**
   * Parâmetros de monitoramento que DEIXAM de guiar a intensidade neste aluno, vindos do perfil
   * clínico mais as classes de medicação declaradas (`parametrosInvalidosDe`, em
   * src/lib/gps/farmacos.ts). Com "p-fc" aqui, a zona de frequência cardíaca não é calculada e o
   * bloco aeróbio explica por qual instrumento guiar. Ausente/vazio = plano byte-idêntico ao de
   * antes desta camada.
   */
  parametrosInvalidos?: ParamMonitorId[];
  /**
   * Restrições declaradas no perfil do aluno. Somam com as que a condição impõe
   * (groupRules.restricoesEstruturais) e FILTRAM a seleção de exercícios do plano.
   * Ausente = plano sem filtro por restrição (uso avulso e estudo).
   */
  restricoes?: RestricaoSelecionada[];
  /**
   * Equipamentos do local de treino do aluno. Moldam a modalidade aeróbia (a preferida
   * por evidência só vence se houver como executá-la) e a seleção de FORÇA (exercício
   * cujo equipamento o aluno não declarou não entra no plano). A regra de disponibilidade
   * é a mesma do engine: peso corporal está sempre disponível. Ausente = sem filtro,
   * para o uso avulso e as bancadas seguirem como sempre foram.
   */
  equipamentos?: string[];
}

export interface PlanoGerado {
  principal: Macrociclo;
  alternativa?: Macrociclo;
  modeloId: ModeloPeriodizacaoId;
  modeloAltId?: ModeloPeriodizacaoId;
  /** título padrão do plano, já com linguagem de documento (o profissional pode reescrever) */
  titulo: string;
  raciocinio: string;
  refIds: string[];
}

const NIVEL_ORDEM: Record<Nivel, number> = { Iniciante: 0, "Intermediário": 1, "Avançado": 2 };

let _seq = 0;
const nid = (p: string) => `${p}-${Date.now().toString(36)}-${(_seq++).toString(36)}`;

/* --------------------------- Escolha do(s) modelo(s) --------------------------- */

function escolherModelos(input: GerarPlanoInput): {
  principal: ModeloPeriodizacaoId;
  alternativa?: ModeloPeriodizacaoId;
  /** o que o motor escolheria sozinho, quando o profissional escolheu outro */
  sugeridoPeloMotor?: ModeloPeriodizacaoId;
} {
  // O profissional escolheu: a escolha dele manda, e a do motor vira a alternativa.
  // Trocar a escolha dele em silêncio seria decidir por ele; escondê-la seria pior.
  if (input.modeloPreferido) {
    const doMotor = escolherModelos({ ...input, modeloPreferido: undefined });
    return {
      principal: input.modeloPreferido,
      /*
       * Concordar com o motor NÃO pode custar a alternativa.
       *
       * Aqui estava só `doMotor !== preferido ? doMotor : undefined`, e o efeito medido era
       * perverso: o profissional que abre a tela e escolhe EXPLICITAMENTE o mesmo modelo que
       * o motor escolheria perdia a alternativa autorregulada que a condição do aluno tinha
       * aberto. Medido com hipertensão estágio 2 em hipertrofia/intermediário: no automático
       * saía principal=ondulatoria e alternativa=flexivel; escolhendo "ondulatoria" à mão,
       * a alternativa sumia.
       *
       * É a mesma família de "declarar mais deixa o sistema pior" que já apareceu na fusão de
       * restrições e na de regras clínicas. Quando as escolhas coincidem, vale a alternativa
       * que o próprio motor ofereceria.
       */
      alternativa:
        doMotor.principal !== input.modeloPreferido ? doMotor.principal : doMotor.alternativa,
      sugeridoPeloMotor: doMotor.principal,
    };
  }

  const { objetivo, nivel, grupoEspecial } = input;
  const treinado = NIVEL_ORDEM[nivel] >= 1;

  /*
   * O MODELO SEGUE OBJETIVO E NÍVEL. A CONDIÇÃO NÃO ESCOLHE O MODELO.
   *
   * Antes, qualquer aluno com condição declarada caía em "linear", fosse ele
   * iniciante ou avançado, com qualquer objetivo. O efeito prático era um aluno
   * intermediário de hipertrofia com obesidade receber linear e a tela anunciar
   * "Periodização linear" onde a decisão correta seria ondulatória.
   *
   * O erro era conceitual: confundir MODELO (como as variáveis se distribuem no
   * tempo) com CAUTELA (quão rápido e até onde progredir). Distribuir ênfase de
   * repetições entre as sessões não é mais arriscado do que subir carga em linha
   * reta. Quem cuida da segurança são as outras camadas, e elas já existem:
   * `modProgressao` (teto de PSE e passo reduzido por perfil), as penalidades de
   * ranqueamento e, desde agora, o filtro de exercícios por condição.
   *
   * O que a condição faz aqui é UMA coisa: entra como a ALTERNATIVA
   * autorregulada, porque tolerância variável dia a dia é justamente o caso em
   * que autorregular ajuda.
   */
  // Qualquer condição declarada abre a alternativa autorregulada, não só a principal:
  // tolerância variável dia a dia é o caso em que autorregular ajuda, e ela não deixa de
  // variar porque a condição foi registrada como secundária.
  const alternativaDaCondicao =
    grupoEspecial || (input.condicoesAtencao?.length ?? 0) > 0 ? "flexivel" : undefined;

  // Retorno ao treino é uma FASE, não um objetivo de desempenho: o previsível
  // vence, porque o propósito é reconstruir tolerância antes de buscar ganho.
  if (objetivo === "Retorno ao treino") {
    return { principal: "linear", alternativa: "flexivel" };
  }
  // Iniciante: a progressão linear simples costuma bastar (a ondulatória não rende mais).
  if (!treinado) {
    return { principal: "linear", alternativa: alternativaDaCondicao ?? "ondulatoria" };
  }
  // Força/hipertrofia em treinados: ondulatória tende a render mais para força.
  if (objetivo === "Hipertrofia" || objetivo === "Força") {
    return {
      principal: "ondulatoria",
      alternativa: alternativaDaCondicao ?? (nivel === "Avançado" ? "blocos" : "linear"),
    };
  }
  // Demais objetivos em treinados: linear como base, ondulatória como alternativa.
  return { principal: "linear", alternativa: alternativaDaCondicao ?? "ondulatoria" };
}

/* ------------------------------ Condição clínica do plano ------------------------------ */

/**
 * TODAS as condições declaradas do aluno, na ordem em que mandam: a principal primeiro.
 *
 * Fonte única. Antes cada consumidor lia `input.grupoEspecial` por conta própria, e foi por
 * isso que `condicoesAtencao` pôde existir no cadastro sem nunca chegar ao plano.
 */
export function slugsClinicosDoPlano(input: {
  grupoEspecial?: string;
  condicoesAtencao?: string[];
}): string[] {
  const todos = [input.grupoEspecial, ...(input.condicoesAtencao ?? [])].filter(
    (s): s is string => Boolean(s),
  );
  return Array.from(new Set(todos));
}

/**
 * A regra clínica que vale para este plano: a fusão CONSERVADORA de todas as condições
 * declaradas. Com uma condição só, `fundirRegras` devolve a própria instância, então o
 * caminho de aluno com uma condição continua byte-idêntico ao de antes.
 */
export function regraClinicaDoPlano(input: GerarPlanoInput) {
  return combineRules(slugsClinicosDoPlano(input));
}

/**
 * A frase do raciocínio que declara quantos perfis de cuidado entraram na geração e qual é
 * a lei quando eles divergem.
 *
 * **Nomeia pelo `rotuloAluno`, nunca pelo rótulo clínico.** O raciocínio é impresso no
 * documento que chega ao aluno, e `check:documentos` trava diagnóstico ali, com razão: um
 * plano entregue em mãos não é lugar de "hipertensão estágio 2". O nome clínico das
 * condições segue à vista do PROFISSIONAL, na tela de Prescrever treino e no perfil.
 *
 * Um programa só já era declarado na frase anterior; esta existe para o caso de DOIS ou
 * mais, que era exatamente o silêncio que o Filipe encontrou.
 */
/*
 * PISO DE RESERVA QUE O PRÓPRIO OBJETIVO JÁ PEDE, lido do texto citado (nunca um número
 * cravado aqui).
 *
 * Existe por causa de um defeito de honestidade medido em 18/08/2026: o parágrafo de faixa
 * etária afirmava "o plano já entra mais conservador" para todo aluno de 65 anos ou mais, e
 * em Resistência muscular, Retorno ao treino e Aprendizado técnico o plano saía
 * BYTE-IDÊNTICO ao de um aluno de 40. Nesses três a faixa citada já é "3 a 5 de reserva",
 * ou seja, o piso de reserva da faixa etária não tem o que apertar. Afirmar mudança
 * onde não houve mudança é a mesma assinatura que este motor já pagou caro: a tela dizendo
 * uma coisa e o motor fazendo outra.
 *
 * Lê a menor reserva alcançável pelo objetivo (a base e as ênfases da semana ondulatória),
 * porque é o piso alcançável que decide se a camada de idade morde.
 */
function pisoDeReservaDoObjetivo(faixa: FaixaObjetivo): number | null {
  const textos = [
    faixa.intensidade.valor,
    faixa.intensidade.nota ?? "",
    ...(faixa.enfases ?? []).map((e) => e.intensidade),
  ];
  const minimos = textos
    .map((t) => lerFaixaRIR(t)?.min)
    .filter((n): n is number => typeof n === "number");
  return minimos.length ? Math.min(...minimos) : null;
}

function frasePerfilClinico(input: GerarPlanoInput): string {
  const slugs = slugsClinicosDoPlano(input);
  /*
   * QUANTAS CONDIÇÕES PRECISAM EXISTIR PARA O PLANO DIZER QUE CONSIDEROU ALGUMA.
   *
   * O corte era 2, fixo, e isso abria um silêncio exato: o aluno cuja ÚNICA condição está em
   * `condicoesAtencao`, e não em `grupoEspecial`. Ali a frase da jornada não sai (ela depende
   * de `grupoEspecial`) e esta também não saía. Medido em hipertensão estágio 2 declarada só
   * por atenção, hipertrofia/intermediário/12 semanas:
   *
   *   dose sem condição : 3x8 RIR2 | 4x7 RIR1 | 3x7 RIR2 | ...
   *   dose só-atenção   : 3x8 RIR2 | 3x7 RIR2 | 3x8 RIR2 | ...   (a condição FOI aplicada)
   *   raciocínio        : "Escolha por objetivo (Hipertrofia) e nível (Intermediário)."
   *
   * Ou seja, a condição mudava a dose e o documento não dizia que existia perfil de cuidado
   * nenhum. É exatamente o que o comentário do chamador chama de não auditável, e a razão de
   * `condicoesAtencao` ter sido ligada ao motor em primeiro lugar.
   *
   * Com `grupoEspecial`, a frase da jornada já anuncia o programa, e esta continua sendo a
   * frase do CONJUNTO (2 ou mais). Sem ele, uma condição já basta para o plano se declarar.
   */
  const minimo = input.grupoEspecial ? 2 : 1;
  if (slugs.length < minimo) return "";
  const rotulos = slugs
    .map((s) => getSpecialGroup(s)?.rotuloAluno)
    .filter((r): r is string => Boolean(r));
  const regra = regraClinicaDoPlano(input);
  const teto =
    regra?.complexidadeMax != null
      ? ` O teto de complexidade técnica dos exercícios deste plano é ${regra.complexidadeMax} de 100.`
      : "";
  const lista = rotulos.length === slugs.length ? ` (${rotulos.join(", ")})` : "";
  if (slugs.length === 1) {
    return `Sobre os perfis de cuidado: este plano considerou um perfil de cuidado${lista}, e as faixas de dose foram ajustadas por ele.${teto}`;
  }
  return `Sobre os perfis de cuidado: este plano considerou ${slugs.length} perfis de cuidado ao mesmo tempo${lista}, e onde eles divergem vale sempre o mais conservador.${teto}`;
}

/* ------------------------------ Seleção de exercícios ------------------------------ */

/**
 * As restrições que valem para ESTE plano: as que o profissional declarou no
 * perfil do aluno MAIS as que as condições impõem por si (groupRules
 * `restricoesEstruturais`, já fundidas). Deduplicadas por tag; a mais estrita
 * manda depois, no avaliador.
 */
export function restricoesDoPlano(input: GerarPlanoInput): RestricaoSelecionada[] {
  const declaradas = input.restricoes ?? [];
  // Antes: só `groupGpsRules[input.grupoEspecial]`. Duas condições no mesmo aluno e as
  // restrições estruturais da segunda sumiam do plano inteiro.
  const daCondicao = slugsClinicosDoPlano(input).flatMap(
    (slug) => groupGpsRules[slug]?.restricoesEstruturais ?? [],
  );
  const porTag = new Map<RestricaoTag, RestricaoSelecionada>();
  for (const r of declaradas) porTag.set(r.tag, r);
  for (const tag of daCondicao) if (!porTag.has(tag)) porTag.set(tag, criarRestricao(tag));
  return [...porTag.values()];
}

/**
 * SELEÇÃO DE EXERCÍCIOS DO PLANO, agora ciente da condição.
 *
 * Antes esta função via só objetivo e nível, e por isso um plano de 12 semanas
 * para obesidade grau II podia trazer exercício deitado no banco ou que exige ir
 * ao chão: nada no caminho olhava a condição. O Treino do dia já excluía esses
 * casos; o plano não. Agora os dois passam pelo MESMO avaliador por tag
 * (EFEITO_POR_TAG), que é a fonte única de "este exercício cabe neste aluno".
 *
 * Ordem de preferência: primeiro os que o avaliador PREFERE, depois os neutros,
 * depois os adaptáveis. Excluídos nunca entram, nem para completar a lista.
 *
 * Devolve também quantos foram descartados e por quê, para a tela poder dizer
 * "o catálogo não tem exercício suficiente para este perfil" em vez de completar
 * com o que sobrou (que é como o erro apareceria de novo, só que silencioso).
 */
export interface SelecaoExercicios {
  escolhidos: { slug: string; nome: string }[];
  /** exercícios retirados pela condição/restrição, com o motivo (para o Prontuário) */
  descartados: { slug: string; nome: string; motivo: string }[];
  /**
   * Exercícios que NÃO saíram do catálogo, mas foram para o fim da fila por peso da
   * condição: posição que ela evita, flexão de coluna carregada, complexidade acima do teto
   * ou métrica acima do limite declarado. É o "os limítrofes entram rebaixados" que a tela
   * afirmava sem ter de onde tirar.
   */
  rebaixados: { slug: string; nome: string; motivo: string }[];
  /** quantos exercícios de força sobraram elegíveis no total (a fila, não a fatia usada) */
  elegiveis: number;
  /** true quando o catálogo não tinha exercícios seguros suficientes para o pedido */
  faltouCatalogo: boolean;
  /**
   * Nomes dos exercícios ESCOLHIDOS que não são do objetivo pedido.
   *
   * Não vazio significa que o pool específico do objetivo era pequeno demais e a seleção
   * caiu para o catálogo do nível. É diferente de `faltouCatalogo`, que olha o pool FINAL e
   * fica `false` justamente nesse caso, porque o fallback o infla.
   */
  foraDoObjetivo: string[];
}

/** Valor de uma métrica do índice de eficiência, pelo nome. Mesmo acesso do engine. */
export function metricaDoExercicio(e: (typeof exercises)[number], nome: string): number | undefined {
  return e.indiceEficiencia.metrics.find((m) => m.nome.toLowerCase() === nome.toLowerCase())?.valor;
}

function selecionarExercicios(
  objetivo: GpsObjetivo,
  nivel: Nivel,
  n: number,
  restricoes: RestricaoSelecionada[] = [],
  objetivoSecundario?: GpsObjetivo,
  /** regra clínica FUNDIDA de todas as condições do aluno; ausente = sem peso de condição */
  regraClinica?: GroupGpsRule,
  /** equipamentos do aluno; ausente = sem filtro (uso avulso, estudo e bancadas) */
  equipamentos?: string[],
): SelecaoExercicios {
  const teto = NIVEL_ORDEM[nivel];
  const noNivel = (e: (typeof exercises)[number]) => NIVEL_ORDEM[(e.nivel as Nivel) ?? "Iniciante"] <= teto;

  /*
   * APARELHO DE CARDIO NÃO É EXERCÍCIO DE FORÇA.
   *
   * Este seletor monta os blocos de FORÇA, e ele escolhia por objetivo, nível e segurança,
   * sem nunca perguntar se aquilo se prescreve em série e repetição. O efeito era perverso e
   * silencioso: os aparelhos de cardio são os mais seguros em TODAS as métricas (joelho,
   * lombar, complexidade), então quanto mais estrita a regra clínica do aluno, mais alto eles
   * subiam na fila. Um plano de emagrecimento para hipertenso estágio 2 com obesidade grau II
   * saía com "Bicicleta ergométrica 3 séries de 13 repetições" e "Caminhada inclinada
   * (esteira) 3 x 13" no lugar do treino de força. O aluno mais frágil recebia a sessão mais
   * absurda, e o profissional é quem assinava embaixo.
   *
   * O aeróbio continua no plano, no bloco dele, prescrito em minutos, como sempre esteve.
   */
  /*
   * O ISOMÉTRICO ENTRA PELA MESMA PORTA, E PELO MESMO MOTIVO.
   *
   * A regra acima nasceu do aeróbio, mas o que ela de fato afirma é mais geral: só entra na
   * seleção de FORÇA quem se prescreve em SÉRIE E REPETIÇÃO. O isométrico não tem
   * repetição, e um agachamento isométrico na parede prescrito como "3 x 12" seria a mesma
   * classe de absurdo que a bicicleta com 13 repetições. A marca foi criada antes do
   * primeiro isométrico entrar no catálogo, exatamente para que essa regressão nunca chegue
   * a existir.
   */
  const ehForca = (e: (typeof exercises)[number]) => !e.doseAerobia && !e.doseIsometrica;

  /*
   * EXERCÍCIO QUE O ALUNO NÃO TEM COMO EXECUTAR NÃO ENTRA NO PLANO.
   *
   * A seleção do plano nunca tinha olhado equipamentos: medido, um plano prescrevia
   * Máquina, Polia e Halter sem saber o que o aluno declarou. O Treino do dia já filtrava
   * (engine.ts), e a regra daqui é a MESMA de lá, copiada e não reinventada: peso corporal
   * está sempre disponível, todo o resto precisa estar declarado. Sem lista, sem filtro,
   * que é o caminho do uso avulso e das bancadas, byte-idêntico ao de antes.
   *
   * É EXCLUSÃO, não rebaixamento, de propósito: indisponível não é "menos preferido", é
   * impossível, e rebaixar deixaria o exercício entrar quando o resto da fila acabasse.
   */
  const equipOk = (e: (typeof exercises)[number]) =>
    !equipamentos?.length || e.equipamento === "Peso corporal" || equipamentos.includes(e.equipamento);

  // Pool base: do objetivo quando houver o bastante; senão, todo o catálogo no nível.
  const doObjetivo = exercises.filter((e) => e.objetivo?.includes(objetivo) && noNivel(e) && ehForca(e) && equipOk(e));
  const noCatalogo = exercises.filter((e) => noNivel(e) && ehForca(e) && equipOk(e));
  /*
   * AS FAMÍLIAS QUE O OBJETIVO NÃO MARCA ENTRAM PELO CATÁLOGO.
   *
   * O catálogo marca poucos grupos para alguns objetivos: Emagrecimento tem perna, costas,
   * peito e corpo todo, e nenhum ombro, braço ou core. Com o pool restrito ao objetivo, um
   * plano de 12 semanas saía sem um único exercício dessas três famílias, e a sessão que
   * sobrava era "perna, perna, perna". Não é decisão de treino: é a marcação do catálogo
   * virando prescrição por omissão.
   *
   * O pool continua sendo o do objetivo (ele vem primeiro na fila, pelo bônus de primário),
   * acrescido dos exercícios das famílias que o objetivo não tem. Eles só entram no plano
   * pela vaga de cobertura, e são declarados em `foraDoObjetivo`, como qualquer exercício
   * de outro objetivo sempre foi.
   */
  const familiasDoObjetivo = new Set(doObjetivo.map((e) => e.grupoMuscular));
  const complementoDeFamilia = noCatalogo.filter((e) => !familiasDoObjetivo.has(e.grupoMuscular));
  const pool = doObjetivo.length >= n ? [...doObjetivo, ...complementoDeFamilia] : noCatalogo;

  const ativas = restricoesAtivas(restricoes);
  const descartados: SelecaoExercicios["descartados"] = [];
  /*
   * Nota por exercício: 0 = excluído, e o resto é a ação mais estrita entre as tags.
   *
   * "ADAPTAR" NÃO REBAIXA, E ISSO É O CONSERTO DE UM DEFEITO REAL.
   *
   * `adaptar` valia 2, abaixo do baseline neutro de 2,5. Só que `adaptar` é o resultado
   * NEUTRO deste módulo (`const NEUTRO = { acao: "adaptar", motivo: "" }` em restricoes.ts) e
   * é também o que os avaliadores puramente informativos devolvem para TODOS os exercícios,
   * quando só querem deixar uma nota de conduta. O efeito, medido: um aluno com
   * "assimetria funcional" recebia o exercício unilateral com nota 3 (preferido, que é o que
   * a restrição pede); bastava declarar TAMBÉM "cãibras frequentes", que é uma nota
   * informativa e não desaconselha nada, para o mesmo exercício cair para 2 e empatar com
   * quem ninguém preferiu. A segunda restrição, que não desaconselhava nada, apagava a
   * preferência da primeira.
   *
   * É a mesma família do defeito da fusão de regras clínicas: declarar MAIS sobre o aluno
   * deixava o sistema pior. Agora `adaptar` empata com o neutro (ela carrega um MOTIVO para a
   * tela, não uma reordenação), e quem rebaixa continua rebaixando: penalizar e excluir.
   */
  // Baseline neutro: sem tag ativa, todos empatam e a ordem do catálogo decide.
  const NEUTRO = 2.5;
  const PESO_ACAO: Record<AcaoRestricao, number> = {
    preferir: 3,
    adaptar: NEUTRO,
    penalizar_moderado: 1,
    penalizar_forte: 0.5,
    excluir: 0,
  };
  const avaliados = pool.map((e) => {
    // Segurança PRIMEIRO: o rebaixamento mais estrito entre as tags domina (min),
    // e é o que exclui/penaliza. A preferência do avaliador é registrada à parte e
    // só conta quando NADA rebaixou o exercício: um "preferir" nunca sobe algo que
    // outra restrição penalizou. Antes, `nota` começava em 2.5 e o laço só baixava,
    // então "preferir" (peso 3) nunca era aplicado e a preferência prometida no
    // docstring era código morto (empatava com o neutro).
    let rebaixamento = Infinity;
    let prefere = false;
    let motivo = "";
    for (const sel of ativas) {
      const avaliar = EFEITO_POR_TAG[sel.tag];
      if (!avaliar) continue;
      const efeito = avaliar(e, sel);
      if (efeito.acao === "preferir") {
        prefere = true;
        continue;
      }
      const peso = PESO_ACAO[efeito.acao];
      if (peso < rebaixamento) {
        rebaixamento = peso;
        motivo = `${rotuloRestricao(sel.tag)}: ${efeito.motivo}`;
      }
    }
    const nota =
      rebaixamento < NEUTRO
        ? rebaixamento // adaptar/penalizar/excluir dominam
        : prefere
          ? PESO_ACAO.preferir // sem rebaixamento e com preferência: sobe acima do neutro
          : NEUTRO;
    return { e, nota, motivo };
  });

  for (const a of avaliados) {
    if (a.nota === 0) {
      descartados.push({ slug: a.e.slug, nome: a.e.nome ?? a.e.slug, motivo: a.motivo });
    }
  }

  // Ordenação ESTÁVEL: segurança primeiro (nota da restrição), depois o objetivo
  // SECUNDÁRIO como desempate, e por fim a ordem do catálogo, para o mesmo input
  // gerar sempre o mesmo plano (a impressão digital depende disso).
  //
  // O secundário entra DEPOIS da segurança, nunca antes: nenhum objetivo justifica
  // subir um exercício que a restrição do aluno penalizou. E sem secundário o
  // desempate é 0 para todos, o que deixa a ordem byte-idêntica à de antes.
  const bonusSecundario = (e: (typeof exercises)[number]) =>
    objetivoSecundario && objetivoSecundario !== objetivo && e.objetivo?.includes(objetivoSecundario) ? 1 : 0;

  /*
   * O OBJETIVO PRIMÁRIO TAMBÉM DESEMPATA, e só importa quando o fallback entra.
   *
   * Quando `doObjetivo` basta, o pool inteiro é do objetivo e este bônus é constante: a ordem
   * fica byte-idêntica. Mas quando o pool cai para o catálogo inteiro (poucos exercícios do
   * objetivo com o que o aluno tem), a ordem do catálogo decidia sozinha e atropelava o
   * objetivo. Medido: aluno só com Elástico, objetivo Força, existem 4 exercícios de Força
   * executáveis e o plano usava 1, preterindo os outros 3 por exercícios de outros objetivos
   * que aparecem antes no catálogo. Entra DEPOIS da segurança e da condição, nunca antes:
   * objetivo nenhum sobe exercício que a restrição ou a regra clínica rebaixou.
   */
  const bonusPrimario = (e: (typeof exercises)[number]) => (e.objetivo?.includes(objetivo) ? 1 : 0);

  // PESO DA CONDIÇÃO no plano, o que faltava para o treino "nascer da condição".
  //
  // O Treino do dia já cobrava o teto de complexidade e as penalidades por métrica da regra
  // clínica (src/lib/gps/engine.ts); a PERIODIZAÇÃO não cobrava nada disso, e por isso um
  // plano para hipertensão estágio 2 podia abrir com o exercício mais exigente do catálogo.
  //
  // Entra como REBAIXAMENTO de ordem, nunca como exclusão: quem exclui é a restrição
  // estrutural, que já rodou acima. Assim o exercício exigente vai para o fim da fila e só
  // é escolhido se não houver alternativa, em vez de sumir do catálogo do aluno.
  /*
   * O peso da condição, agora com o MOTIVO junto.
   *
   * O número já existia e ordenava a fila; o motivo não existia em lugar nenhum, e por isso
   * a tela do plano afirmava "os limítrofes entram rebaixados" sem ter como dizer QUAIS nem
   * POR QUÊ. Quem lê um plano assinado tem direito à segunda metade da frase.
   */
  const pesoDaCondicao = (e: (typeof exercises)[number]): { peso: number; motivos: string[] } => {
    if (!regraClinica) return { peso: 0, motivos: [] };
    let p = 0;
    const motivos: string[] = [];
    for (const pen of regraClinica.penalidades) {
      const val = metricaDoExercicio(e, pen.metrica);
      if (val !== undefined && val >= pen.limite) {
        p += 1;
        motivos.push(`${pen.metrica.toLowerCase()} alta para o perfil`);
      }
    }
    const complexidade = metricaDoExercicio(e, "Complexidade técnica");
    if (complexidade !== undefined && regraClinica.complexidadeMax !== undefined && complexidade > regraClinica.complexidadeMax) {
      p += 1;
      motivos.push(`complexidade técnica acima do teto do perfil (${regraClinica.complexidadeMax} de 100)`);
    }
    // Posição que a condição pede para evitar (ver GroupGpsRule.posicoesEvitar): peso alto o
    // bastante para ir ao fim da fila atrás de QUALQUER alternativa, sem sumir do catálogo.
    const posicao = e.restricaoPerfil?.posicao;
    if (posicao && regraClinica.posicoesEvitar?.includes(posicao)) {
      p += 10;
      motivos.push("posição que esta condição pede para evitar");
    }
    // Flexão de coluna carregada, quando a condição pede para evitar. Mesmo peso da posição,
    // porque é da mesma natureza: fato do exercício que a condição conhece.
    if (regraClinica.evitarFlexaoColunaCarregada && e.restricaoPerfil?.flexaoColunaCarregada) {
      p += 10;
      motivos.push("flexão de coluna sob carga");
    }
    // Membros acima do coracao: peso MENOR que os outros dois de propósito. E preferencia
    // entre equivalentes, nao contraindicacao, entao ele cede a vez sem sumir do plano.
    if (regraClinica.evitarMembrosAcimaDoCoracao && e.restricaoPerfil?.membrosAcimaDoCoracao) {
      p += 3;
      motivos.push("membros acima do coração");
    }
    return { peso: p, motivos };
  };

  const comPeso = avaliados
    .filter((a) => a.nota > 0)
    .map((a, i) => {
      const cond = pesoDaCondicao(a.e);
      return {
        ...a,
        i,
        bonus: bonusSecundario(a.e),
        primario: bonusPrimario(a.e),
        pesoCond: cond.peso,
        motivosCond: cond.motivos,
      };
    })
    // Segurança, depois a condição, depois o objetivo primário, o secundário e a ordem do catálogo.
    .sort((x, y) => y.nota - x.nota || x.pesoCond - y.pesoCond || y.primario - x.primario || y.bonus - x.bonus || x.i - y.i);

  const seguros = comPeso.map((a) => ({ slug: a.e.slug, nome: a.e.nome ?? a.e.slug }));

  /*
   * COBERTURA MUSCULAR: rodízio entre grupos, em vez de cortar o topo da fila.
   *
   * "Limpo" é o exercício que nenhuma restrição rebaixou e que a condição não penalizou.
   * Só entre eles há rodízio, para a cobertura nunca custar segurança. Os grupos entram na
   * ordem em que aparecem na fila de mérito, então o primeiro de cada grupo continua sendo
   * o melhor daquele grupo para este aluno.
   */
  const limpos = comPeso.filter((a) => a.nota >= NEUTRO && a.pesoCond === 0);

  /*
   * O rodízio roda DENTRO da faixa do objetivo, nunca por cima dela.
   *
   * A primeira versão desta correção ignorava isso e o `check:core` reprovou na hora, com a
   * mensagem certa: "FALLBACK ATROPELA O OBJETIVO". Quando o pool cai no catálogo inteiro
   * (porque só o objetivo não tinha exercícios suficientes), um exercício de outro objetivo
   * entrava na frente de um do objetivo do aluno só por ser de um grupo ainda não coberto.
   * Cobertura é desempate, e desempate não promove quem já tinha perdido antes.
   */
  /*
   * COTA POR RODADA, e por que ela não é 1 para todo mundo.
   *
   * O rodízio em cota igual corrigiu o excesso de perna e criou o excesso contrário: uma
   * sessão de hipertrofia com quatro exercícios saía com UM de membro inferior. Um professor
   * criticaria isso tanto quanto criticou o inverso.
   *
   * A causa não é princípio de treino, é GRANULARIDADE DO CATÁLOGO. `grupoMuscular` divide o
   * tronco e os braços em quatro rótulos (Peitorais, Costas, Ombros, Braços) e junta a perna
   * inteira em um só. Cota igual por rótulo dá 1/5 das vagas ao segmento que, no corpo, tem
   * pelo menos dois padrões distintos de movimento: dominante de joelho e dominante de
   * quadril. Duas vagas por rodada apenas devolvem a proporção que o rótulo único escondia.
   *
   * Por que não subdividir de verdade: `articulacaoPredominante` existe, mas dentro de
   * membros inferiores ela traz "Joelho e quadril" e "Quadril e joelho" como rótulos
   * separados para a mesma ideia. Inferir dominância da ORDEM das palavras seria adivinhar
   * num motor clínico. Enquanto o catálogo não tiver o padrão de movimento como campo
   * próprio, a cota é a aproximação honesta.
   */
  const COTA_POR_RODADA: Record<string, number> = { "Membros inferiores": 2 };

  const rodizioDe = (lista: typeof limpos) => {
    const porGrupo = new Map<string, typeof limpos>();
    for (const a of lista) {
      const g = a.e.grupoMuscular ?? "sem grupo";
      const atual = porGrupo.get(g);
      if (atual) atual.push(a);
      else porGrupo.set(g, [a]);
    }
    const saida: typeof limpos = [];
    const cursor = new Map<string, number>();
    for (let volta = 0; saida.length < lista.length; volta++) {
      let entrouAlgum = false;
      for (const [nome, grupo] of porGrupo) {
        const cota = COTA_POR_RODADA[nome] ?? 1;
        let i = cursor.get(nome) ?? 0;
        for (let k = 0; k < cota && i < grupo.length; k++, i++) {
          saida.push(grupo[i]);
          entrouAlgum = true;
        }
        cursor.set(nome, i);
      }
      // Cinto de segurança contra laço infinito se algum grupo vier vazio.
      if (!entrouAlgum) break;
    }
    return saida;
  };
  const rodizio = [
    ...rodizioDe(limpos.filter((a) => a.primario === 1)),
    ...rodizioDe(limpos.filter((a) => a.primario !== 1)),
  ];
  // O rodízio primeiro; o resto da fila de mérito depois, para as vagas fecharem mesmo
  // quando não há exercício limpo suficiente (perfil muito restrito, pouco equipamento).
  const jaNoRodizio = new Set(rodizio.map((a) => a.e.slug));
  const ordemFinal = [...rodizio, ...comPeso.filter((a) => !jaNoRodizio.has(a.e.slug))];
  /*
   * O CORTE DO POOL GARANTE UMA VAGA POR FAMÍLIA, e só depois segue a fila.
   *
   * Cortar os primeiros `n` da fila de mérito parecia neutro e não era. O rodízio roda
   * primeiro entre os exercícios DO OBJETIVO, e o catálogo marca poucos grupos para alguns
   * objetivos: Emagrecimento tem perna, costas, peito e corpo todo, e nada de ombro, braço
   * ou core. Os `n` primeiros vinham todos dessas quatro famílias, e um plano de 12 semanas
   * saía sem um único exercício de ombro ou de braço. Não é decisão de treino: é a marcação
   * do catálogo virando prescrição por omissão.
   *
   * Agora a primeira ocorrência de cada família na fila entra antes do corte, e o resto das
   * vagas segue a ordem de mérito. Quem já tinha perdido por segurança continua fora
   * (`limpos` decide isso, não este corte), e o exercício de outro objetivo que entra por
   * cobertura é declarado em `foraDoObjetivo`, como sempre foi.
   */
  /*
   * A VAGA POR FAMÍLIA SÓ SAI DOS LIMPOS. A primeira versão procurava na fila inteira, e o
   * check:core reprovou na hora: para a gestante, os únicos exercícios de peito e de tríceps
   * limpos não existiam, e a garantia de família promoveu "Flexão de braço" e "Tríceps testa",
   * os dois na posição deitada que a condição pede para evitar. Cobertura nunca custa
   * segurança: família sem exercício limpo fica de fora, e o plano diz menos, mas não mente.
   */
  const FAMILIAS = ["Membros inferiores", "Peitorais", "Costas", "Ombros", "Braços", "Core (tronco)", "Corpo todo"];
  const primeiroDeCadaFamilia = FAMILIAS.map((f) => rodizio.find((a) => a.e.grupoMuscular === f)).filter(
    (a): a is (typeof rodizio)[number] => a != null,
  );
  const garantidos = new Set(primeiroDeCadaFamilia.map((a) => a.e.slug));
  const ordemComCobertura = [...primeiroDeCadaFamilia, ...ordemFinal.filter((a) => !garantidos.has(a.e.slug))];
  const escolhidos = ordemComCobertura
    .slice(0, Math.max(n, 1))
    .map((a) => ({ slug: a.e.slug, nome: a.e.nome ?? a.e.slug, limpo: jaNoRodizio.has(a.e.slug) }));

  /*
   * A RESTRIÇÃO DO ALUNO REBAIXAVA EM SILÊNCIO.
   *
   * `rebaixados` só coletava quem a CONDIÇÃO penalizou (`pesoCond > 0`). A restrição física
   * da etapa 4 age por outro caminho, baixando a `nota` acima, e ninguém a coletava. O painel
   * de consequências ficava mudo sobre ela.
   *
   * Medido na varredura: num plano de Hipertrofia intermediário, declarar "dor de joelho"
   * tirava Leg press, Cadeira extensora, Mesa flexora e Hip thrust, e o painel dizia
   * "nenhum exercício evitado". O painel existe exatamente para responder o que a restrição
   * fez com o catálogo deste aluno, e nasceu de um pedido do Filipe: "a ideia seria só
   * apontar as restrições do paciente e quais exercícios evitados pelo motivo da condição
   * dele". Ele respondia metade.
   *
   * O motivo já era calculado ali em cima; o que faltava era guardá-lo.
   */
  const rebaixadosPorRestricao = comPeso
    .filter((a) => a.nota < NEUTRO && a.motivo)
    .map((a) => ({ slug: a.e.slug, nome: a.e.nome ?? a.e.slug, motivo: a.motivo }));

  /*
   * O FALLBACK DO POOL TROCAVA O OBJETIVO EM SILÊNCIO.
   *
   * Duas linhas acima, quando o pool específico do objetivo não alcança `n`, a seleção cai
   * para o catálogo inteiro do nível. A queda é certa: plano tem que ser gerado, e é melhor
   * um exercício seguro fora do objetivo que uma sessão vazia.
   *
   * O que estava errado era o SILÊNCIO. `faltouCatalogo` só olha o tamanho do pool FINAL, e
   * o fallback justamente o infla, então ele ficava `false` exatamente quando a troca tinha
   * acontecido. Medido na varredura: em 6 de 18 combinações de objetivo e equipamento o
   * plano prescrevia exercício fora do objetivo sem sinal nenhum, e no pior caso (Força só
   * com elástico) eram 4 dos 5 exercícios, num plano intitulado Força.
   *
   * Agora a troca é declarada. Quem consome é o raciocínio do plano, que já é o lugar onde
   * o motor diz o que considerou.
   */
  const foraDoObjetivo = escolhidos
    .filter((s) => {
      const ex = exercises.find((e) => e.slug === s.slug);
      return ex != null && !ex.objetivo?.includes(objetivo);
    })
    .map((s) => s.nome);

  return {
    escolhidos,
    descartados,
    rebaixados: [
      ...comPeso.filter((a) => a.pesoCond > 0).map((a) => ({ slug: a.e.slug, nome: a.e.nome ?? a.e.slug, motivo: a.motivosCond.join("; ") })),
      // A restrição do aluno entra na MESMA lista da condição, porque para quem lê as duas
      // são a mesma coisa: o exercício foi evitado e existe um motivo escrito.
      ...rebaixadosPorRestricao,
    ],
    elegiveis: seguros.length,
    faltouCatalogo: seguros.length < n,
    foraDoObjetivo,
  };
}

/**
 * O QUE A CONDIÇÃO FEZ COM O CATÁLOGO DESTE ALUNO.
 *
 * ## Por que isto existe
 *
 * `selecionarExercicios` sempre calculou quais exercícios saíram do plano, por qual motivo,
 * e se o catálogo tinha exercícios seguros suficientes. Nada disso chegava a lugar nenhum:
 * `montarSessoes` usava só a lista escolhida e jogava o resto fora, e uma varredura por
 * consumidores não achou NENHUM. Era a assinatura de defeito mais comum deste motor, o dado
 * declarado e inerte, agora do lado de fora do alvo.
 *
 * O efeito na tela foi o Filipe quem viu, e a frase dele vale inteira: o resumo do plano
 * mostrava "Restrição de Erbênio: Nenhuma restrição física" para um aluno de 70 anos com
 * obesidade, diabetes e hipertensão estágio 2. Ele estava certo em duas coisas de uma vez.
 * Primeiro, o bloco ecoava o CAMPO que o profissional preencheu, e não o que o motor fez.
 * Segundo, e mais importante, ali o que interessa não são as restrições do corpo do aluno:
 * são as restrições AO EXECUTAR OS EXERCÍCIOS que as condições dele impõem.
 *
 * ## O que devolve
 *
 * A seleção é determinística e igual em todas as semanas (mesmo objetivo, nível, restrições
 * e regra clínica), então roda UMA vez aqui em vez de ser costurada por toda a árvore de
 * mesociclos. O `n` é o mesmo de `montarSessoes`, senão `faltouCatalogo` responderia sobre
 * um pedido que o plano não faz.
 */
export interface ConsequenciasDoPlano {
  /** os rótulos das restrições que valeram para este plano (as do perfil e as da condição) */
  restricoes: string[];
  /**
   * Os exercícios que NÃO entraram no plano por causa da condição ou da restrição, com o
   * motivo. Junta as duas formas de ficar de fora, porque para quem lê elas são a mesma
   * coisa: o exercício foi evitado.
   */
  evitados: { slug: string; nome: string; motivo: string }[];
  /** quantos exercícios de força sobraram elegíveis para este aluno */
  elegiveis: number;
  /** o catálogo não tinha exercícios seguros suficientes para a frequência pedida */
  faltouCatalogo: boolean;
  /**
   * Exercícios que entraram no plano SEM serem do objetivo pedido.
   *
   * Acontece quando o pool específico do objetivo é pequeno demais para a frequência e a
   * seleção cai para o catálogo do nível. É diferente de `faltouCatalogo`: aquele olha o
   * pool FINAL, que o próprio fallback infla, e por isso fica `false` justamente aqui.
   */
  foraDoObjetivo: string[];
}

/**
 * ## Por que isto deixou de falar em "rebaixado"
 *
 * A primeira versão devolvia duas listas, `foraDoPlano` e `rebaixados`, e a tela imprimia
 * "1 exercício entrou rebaixado". O Filipe leu e respondeu: "se ele é rebaixado, por que ele
 * gerou então? A ideia seria só apontar as restrições do paciente e quais exercícios evitados
 * pelo motivo da condição dele".
 *
 * Ele estava certo duas vezes. "Rebaixado" é vocabulário do MOTOR (peso na ordenação da
 * fila), não do profissional, e não diz nada a quem lê. E a frase era FALSA na prática:
 * rebaixar joga o exercício para o fim da fila, e o plano usa só os primeiros. Medido em
 * obesidade grau III com resistência muscular: 34 elegíveis, 1 rebaixado (cadeira extensora,
 * demanda de joelho) e o plano escolhe cerca de 5. O rebaixado estava na posição 34 de 34, ou
 * seja NÃO entrou. A tela afirmava que tinha entrado.
 *
 * Agora existe uma lista só, `evitados`, com o que de fato ficou de fora, e as restrições
 * consideradas ao lado. É o que ele pediu, e é o que é verdade.
 */
export function consequenciasDoPlano(input: GerarPlanoInput): ConsequenciasDoPlano {
  // O MESMO pedido que montarSessoes faz (sessões x vagas), senão as consequências
  // descrevem uma seleção que não é a do plano: com `frequência + 2` aqui e a semana inteira
  // lá, o raciocínio dizia "nenhum exercício fora do objetivo" para um plano que tinha três.
  const porSessao = input.objetivo === "Emagrecimento" ? 3 : 4;
  const sel = selecionarExercicios(
    input.objetivo,
    input.nivel,
    Math.max(4, input.frequencia * porSessao),
    restricoesDoPlano(input),
    input.objetivoSecundario,
    regraClinicaDoPlano(input),
    input.equipamentos,
  );
  const entraram = new Set(sel.escolhidos.map((e) => e.slug));
  // Penalizado que ENTROU mesmo assim não é "evitado": ele está no plano, e dizer o contrário
  // seria o mesmo erro ao contrário. Só conta quem a condição de fato manteve de fora.
  const penalizadosForaDoPlano = sel.rebaixados.filter((r) => !entraram.has(r.slug));
  return {
    restricoes: restricoesDoPlano(input).map((r) => rotuloRestricao(r.tag)),
    evitados: [...sel.descartados, ...penalizadosForaDoPlano],
    elegiveis: sel.elegiveis,
    faltouCatalogo: sel.faltouCatalogo,
    foraDoObjetivo: sel.foraDoObjetivo,
  };
}

/* --------------------------------- Dose de força --------------------------------- */

/**
 * Dose de um bloco de força (séries, repetições, intensidade, intervalo) a partir da faixa
 * citada do objetivo. Com `enfase` (semana ondulatória), repetições e intensidade seguem a
 * ênfase do dia; sem ela, seguem a base do objetivo/nível.
 *
 * Helper puro extraído de `montarSessoes` para ser reusado na semeadura de blocos vindos de
 * uma Prescricao (src/lib/gps/semear.ts) SEM copiar `PrescricaoItem.series`. Os campos-texto
 * são idênticos aos do trecho original (check:faixas byte-idêntico).
 *
 * Com `ctx` (a semeadura não passa), delega a src/lib/gps/alvo.ts e acrescenta o ALVO
 * concreto da semana (seriesAlvo, repsAlvo, rirAlvo, cargaRelativaAlvo, intervaloAlvoSeg,
 * origemRegraId), sempre DENTRO da faixa. Sem `ctx`, devolve só o texto (byte-idêntico).
 */
export interface DoseForca {
  series: string;
  reps: string;
  intensidade: string;
  intervalo: string;
}
export function doseForca(
  faixa: FaixaObjetivo,
  nivel: Nivel,
  enfase?: EnfaseSessao,
  ctx?: CtxAlvo,
): DoseForca & Partial<AlvoForca> {
  // Todas as quatro variáveis passam pelo resolvedor de nível. `reps` já passava e as
  // outras liam `.valor` direto, o que fazia o `porNivel` do intervalo ser código morto no
  // dia em que alguém o declarasse. Foi o que aconteceu: a faixa de Força move o iniciante
  // para 8 a 12 repetições e o descanso ficava em 3 a 5 min, que é de série de 1 a 6.
  /*
   * A ÊNFASE NÃO PODE ENGOLIR O PISO DE RESERVA DO PERFIL.
   *
   * Medido na varredura de consistência: na Hipertrofia de nível intermediário e avançado a
   * ênfase "pesado" estreita a intensidade para "alta, 1 a 2 repetições de reserva". O
   * `aplicarDoseDoPerfil` fecha o alvo dentro do TETO da faixa vigente, e com teto 2 o piso
   * de 3 pedido pela camada de idade era silenciosamente reduzido a 2. Em 48 blocos de um
   * único plano, um aluno de 70 anos recebia exatamente a dose de um de 40.
   *
   * O piso continua sem furar a faixa citada, porque a saída não é prescrever 3 embaixo de
   * um texto que diz "1 a 2": isso faria o bloco dizer uma coisa e o alvo fazer outra, que é
   * o defeito que este motor mais paga caro. A saída é DESCARTAR A ÊNFASE naquele bloco e
   * voltar à faixa do próprio objetivo (1 a 3 na Hipertrofia), que comporta o piso e
   * continua sendo texto citado.
   *
   * Descarta a ênfase INTEIRA, e não só a intensidade dela, porque ela é um pacote: "pesado"
   * é menos repetição COM mais intensidade, e ficar com metade produziria uma combinação que
   * nenhuma faixa declarou.
   */
  const enfaseCabeNoPiso = (() => {
    if (!enfase || ctx?.rirMinimo == null) return true;
    const iv = lerFaixaRIR(enfase.intensidade, faixa.intensidade.nota);
    return !iv || Math.round(iv.max) >= ctx.rirMinimo;
  })();
  const enfaseUsada = enfaseCabeNoPiso ? enfase : undefined;

  const texto: DoseForca = {
    series: valorFaixa(faixa.series, nivel),
    reps: enfaseUsada?.reps ?? valorFaixa(faixa.reps, nivel),
    intensidade: enfaseUsada?.intensidade ?? valorFaixa(faixa.intensidade, nivel),
    intervalo: valorFaixa(faixa.intervalo, nivel),
  };
  if (!ctx) return texto;
  const alvo = alvoSemana({ ...texto, intensidadeNota: faixa.intensidade.nota }, ctx);
  return { ...texto, ...alvo };
}

/* --------------------------------- Sessões da semana --------------------------------- */

/**
 * Explicação acrescentada à NOTA do bloco aeróbio (o campo `observacao`, que é onde vive a
 * nota do bloco) quando a frequência cardíaca deixou de guiar a intensidade deste aluno. O
 * texto de `intensidade` NÃO é reescrito: ele é a faixa citada da diretriz, lida pelo
 * check:faixas, e continua valendo como referência ao lado.
 *
 * A frase não nomeia classe de medicação nem condição clínica de propósito: este bloco é
 * impresso no documento que chega ao aluno, e o porquê clínico é assunto do profissional, no
 * Prontuário. Ela diz o que fazer, que é o que muda a sessão.
 */
const NOTA_SEM_ZONA_FC =
  "Neste plano a intensidade é guiada pela percepção de esforço e pelo teste da fala, e a zona de frequência cardíaca não entra: use esses dois no lugar dela.";

/**
 * `semFC` existe para a nota não se contradizer: a base sugere ajustar pelo recurso do
 * equipamento, e a FCmáx da esteira é um desses recursos. Mandar usá-la na mesma nota que diz
 * que a frequência cardíaca não guia seria pior que não explicar nada. Sem `semFC`, o texto é
 * o mesmo; e sem "p-fc" invalidado, a nota sai byte-idêntica à de sempre.
 */
function notaAerobio(ctx: CtxAlvo, base: string, semFC: string = base): string {
  return (ctx.parametrosInvalidos ?? []).includes("p-fc") ? `${semFC} ${NOTA_SEM_ZONA_FC}` : base;
}

/**
 * O TEXTO da intensidade também perde a frequência cardíaca quando ela não guia.
 *
 * Este era o buraco: `alvoAerobioSemana` já suprimia a zona CALCULADA (o campo
 * `zonaFC` em bpm) e a nota já explicava a troca, mas o campo `intensidade`
 * continuava com a faixa-texto literal "Moderada: cerca de 64 a 76% da FCmáx". O
 * bloco dizia as duas coisas ao mesmo tempo, e a que vai para o PDF e para o app do
 * aluno é justamente o `intensidade`. Um aluno com betabloqueador lia "64 a 76% da
 * FCmáx" no documento assinado.
 *
 * A limpeza é textual de propósito e conservadora: tira a cláusula de percentual da
 * FCmáx e preserva o resto da frase, que já traz teste da conversa e RPE, que são
 * exatamente os guias que entram no lugar. Se um dia a faixa-texto mudar de forma e
 * a expressão não casar, o `check:progressao` reprova (ele passou a ler o texto, não
 * só o campo), em vez de deixar passar calado.
 */
function intensidadeAerobia(ctx: CtxAlvo, texto: string): string {
  if (!(ctx.parametrosInvalidos ?? []).includes("p-fc")) return texto;
  return texto
    // "Moderada: cerca de 64 a 76% da FCmáx (teste da conversa; RPE 5 a 6 de 10)"
    // vira "Moderada: teste da conversa; RPE 4 a 6 de 10"
    .replace(/:\s*cerca de\s*\d+\s*a\s*\d+\s*%\s*da\s*FCm[áa]x\s*\((.*?)\)/i, ": $1")
    // formas sem parênteses: remove só a cláusula da FC, preservando o que sobrar
    .replace(/,?\s*cerca de\s*\d+\s*a\s*\d+\s*%\s*da\s*FCm[áa]x\s*/i, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * O PROTOCOLO ISOMÉTRICO, LITERAL.
 *
 * Números de `wiles-agachamento-parede-2016`, não interpolados e não progressivos: 4
 * contrações de 2 minutos, 2 minutos de descanso entre elas, 3 vezes por semana. É o que foi
 * testado, e mexer em qualquer um dos quatro números produz um protocolo sem estudo atrás.
 */

/** Letras das sessões quando a semana não tem ordem fixa (flexível e autorregulada). */
const LETRAS_SESSAO = ["A", "B", "C", "D", "E", "F", "G"] as const;

/*
 * O ISOMÉTRICO NÃO É CONDUTA EXCLUSIVA DE HIPERTENSO.
 *
 * Ele nascia SÓ em hipertensão estágio 1 e 2, porque foi por ali que entrou no produto, e o
 * Filipe cobrou: contração sustentada se aplica em contextos diferentes, e quem decide isso é
 * a literatura, não o histórico de implementação. Fui ao PubMed e o que sustenta a abertura é
 * o próprio desfecho de pressão, medido em quem NÃO tem hipertensão:
 *
 * - `loaiza-isometrico-normotensos-2020`: metanálise de 6 ensaios em adultos NORMOTENSOS,
 *   com queda de 2,83 mmHg na sistólica, 2,73 na diastólica e 3,07 na média, e conclusão
 *   explícita de que serve à PREVENÇÃO da hipertensão.
 * - `carlson-isometrico-pa-2014`: metanálise de 9 ensaios, SEIS deles em normotensos, com
 *   queda de 6,77 na sistólica, e o registro de que a magnitude supera a do aeróbio dinâmico.
 * - `barbosa-isometrico-normotensos-2025`: revisão sistemática que descreve o protocolo nessa
 *   população (20 a 34% da CVM, 4 séries de 2 a 3 min, 2 a 5 vezes por semana).
 *
 * TRÊS PORTAS DE FORÇA DIFERENTE, e a diferença aparece na dose (ver INDICACOES_ISOMETRICAS):
 *
 * - TRATAMENTO: a condição declara a indicação (hoje, hipertensão). Dose de 3 sessões, que é
 *   a de `wiles-agachamento-parede-2016`, o ensaio do protocolo.
 * - PREVENÇÃO: perfil que DECLARA risco cardiometabólico (`isometrico.prevencao` na regra da
 *   condição). Dose de 2 sessões, que é a PONTA BAIXA da faixa de 2 a 5 relatada na revisão
 *   sistemática. Ponta baixa porque a indicação é de prevenção e não de tratamento, e porque a
 *   contração sustentada eleva a pressão durante a execução: onde o benefício esperado é
 *   menor, a exposição também tem que ser.
 * - DESEMPENHO: objetivo Força, do Intermediário para cima. Nada a ver com pressão: aqui o
 *   alvo é tendão e produção rápida de força, e a dose é o OPOSTO da de pressão, curta e
 *   máxima (`bogdanis-isometrico-angulo-2018`, `kubo-isometrico-tendao-2017`).
 *
 * E QUEM NÃO CASA COM NENHUMA NÃO RECEBE SESSÃO. Antes a prevenção era o `else` de todo mundo,
 * e um atleta de Força sem condição alguma abria o plano com duas sessões rotuladas "para
 * prevenção da pressão arterial". Ausência com critério é resposta; `else` não é.
 *
 * O QUE NÃO ENTROU, e por quê. Procurei sustentação para outros contextos e ela não apareceu:
 * na rede de 217 ensaios sobre exercício em osteoartrite de joelho (`yan-artrose-joelho-2025`)
 * o aeróbio é o mais efetivo e o isométrico não é sequer um nó da rede; na síntese do NIHR com
 * 555 estudos sobre exercício em tendinopatia (`cooper-tendinopatia-2023`) o que se sustenta é
 * combinar concêntrico e excêntrico. Indicação sem evidência seria regra morta com cara de
 * segurança, que é o defeito que este motor já pagou caro.
 *
 * O veto de qualquer condição fundida continua vencendo tudo (gestante, hoje).
 */
/**
 * QUEM RECEBE A SESSÃO ISOMÉTRICA, POR QUÊ, E COM QUE DOSE.
 *
 * Aqui existia um if de duas linhas cujo último caso era `return prevencao` para TODO MUNDO.
 * O Filipe montou um atleta avançado de Força, sem condição nenhuma, e o plano abriu com duas
 * sessões chamadas "Protocolo isométrico para prevenção da pressão arterial". Nem o rótulo nem
 * a dose tinham qualquer relação com aquele aluno.
 *
 * O erro não era a evidência de prevenção, que existe e está citada. Era o desenho: uma camada
 * inteira com UM propósito só, aplicada por descarte. Contração sustentada é um MEIO, e o meio
 * serve a alvos diferentes com protocolos diferentes.
 *
 * Cada indicação carrega o pacote fechado: o motivo (que vira o nome da sessão na tela), a
 * dose, a intensidade, o exercício que consegue entregar aquela dose e o que a evidência NÃO
 * garante. A ordem é de força decrescente, e a PRIMEIRA que casar manda: tratar uma condição
 * vem antes de prevenir, e prevenir vem antes de desempenho. Nenhuma casou? NÃO HÁ SESSÃO
 * ISOMÉTRICA, e isso é resposta legítima, não buraco.
 *
 * A DOSE MUDA JUNTO COM O ALVO, e é esse o ponto que faltava. O protocolo de pressão é
 * contração LONGA e SUBMÁXIMA (4 x 2 min); o de desempenho é o oposto, contração CURTA e
 * MÁXIMA (5 a 7 x 3 s). Prescrever 2 minutos de agachamento na parede e chamar de trabalho de
 * tendão seria a doença de sempre desta casa: a tela dizendo uma coisa e a dose fazendo outra.
 */
interface CtxIsometrico {
  objetivo: GpsObjetivo;
  nivel: Nivel;
  regraClinica?: GroupGpsRule;
}

export interface IndicacaoIsometrica {
  id: "pressao-controle" | "pressao-prevencao" | "tendao-forca-rapida";
  /** vira o `foco` da sessão: diz, na tela, para que ESTE aluno recebeu ESTA sessão */
  foco: string;
  protocolo: { series: string; contracao: string; descanso: string; sessoes: number };
  intensidade: string;
  /**
   * Exercícios que conseguem entregar ESTA dose, em ordem de preferência. A seleção ainda
   * filtra por equipamento e por posição que a condição evita, e quando NENHUM passa a sessão
   * não nasce. Nada de cair num exercício qualquer: um agachamento na parede com o peso do
   * corpo não tem como ser uma contração máxima, então servi-lo sob o rótulo de desempenho
   * seria entregar o protocolo errado com o nome certo.
   */
  exerciciosAceitos: readonly string[];
  /** o que o profissional precisa ler antes de assinar, inclusive o que a evidência não sustenta */
  nota: string;
  /**
   * A frase desta indicação no RACIOCÍNIO do plano.
   *
   * Vive aqui, e não num if do gerador de texto, pelo mesmo motivo do resto: o raciocínio
   * imprimia a explicação de PREVENÇÃO sempre que a semana tivesse 2 sessões isométricas, e a
   * sessão de desempenho também tem 2. O texto acertava por coincidência aritmética.
   *
   * Não nomeia a condição, porque este texto também é impresso ao aluno e documento de aluno
   * não carrega rótulo clínico. Falar de pressão arterial onde ela é o alvo não é rótulo: é o
   * que o aluno precisa saber para executar com segurança.
   */
  raciocinio: string;
  refIds: readonly string[];
  quando: (c: CtxIsometrico) => boolean;
}

const ISO_AVISO_PRESSAO =
  "A pressão arterial SOBE durante a contração sustentada, proporcional à carga: respiração solta do começo ao fim, sem prender o ar. Só aplique com a liberação do dia em ordem. Sessão curta e separada do treino, como o protocolo foi testado: deixe pelo menos 48 h entre duas sessões isométricas.";

export const INDICACOES_ISOMETRICAS: readonly IndicacaoIsometrica[] = [
  {
    id: "pressao-controle",
    foco: "Isométrico para o controle da pressão arterial",
    protocolo: { series: "4", contracao: "2 min", descanso: "2 min", sessoes: 3 },
    intensidade:
      "Pela percepção de esforço: a contração inteira precisa fechar sem queda visível de força no fim. Ajuste o ângulo (ou a pega) em vez de encurtar o tempo.",
    exerciciosAceitos: ["agachamento-isometrico-parede", "preensao-isometrica-handgrip"],
    nota: ISO_AVISO_PRESSAO,
    raciocinio:
      "A indicação aqui é de CONTROLE da pressão arterial, e a dose é a do ensaio que testou o protocolo: 3 sessões por semana. A contração sustentada ELEVA a pressão durante o esforço, então a respiração fica solta do começo ao fim e vale a liberação do dia, como no resto do plano.",
    refIds: [
      "wiles-agachamento-parede-2016",
      "edwards-exercicio-pa-2023",
      "baffour-isometrico-hipertensos-2023",
      "fecchio-handgrip-2023",
    ],
    quando: (c) => Boolean(c.regraClinica?.isometrico?.indicado),
  },
  {
    id: "pressao-prevencao",
    foco: "Isométrico para prevenção da pressão arterial",
    protocolo: { series: "4", contracao: "2 min", descanso: "2 min", sessoes: 2 },
    intensidade:
      "Pela percepção de esforço: a contração inteira precisa fechar sem queda visível de força no fim. Ajuste o ângulo (ou a pega) em vez de encurtar o tempo.",
    exerciciosAceitos: ["agachamento-isometrico-parede", "preensao-isometrica-handgrip"],
    nota:
      ISO_AVISO_PRESSAO +
      " Aqui a indicação é de PREVENÇÃO, e não de tratamento: ela entra porque a condição declarada deste aluno carrega risco cardiometabólico, e não porque ele tenha pressão alta. Em adultos sem hipertensão a queda medida é de cerca de 3 mmHg na sistólica, menor que a de quem já tem pressão alta, e por isso a dose entra na ponta baixa da faixa relatada, com 2 sessões por semana. Um ensaio com hipertensos tratados não achou efeito nenhum da preensão isométrica, então trate o benefício como plausível e não como garantido.",
    raciocinio:
      "A indicação aqui é de PREVENÇÃO da pressão arterial, e não de tratamento: ela entra pelo perfil deste aluno, e não porque ele tenha pressão alta. Em adultos sem hipertensão as metanálises medem queda de cerca de 3 mmHg na sistólica de repouso, menor que a de quem já tem pressão alta, e por isso a dose entra em 2 sessões, a ponta baixa da faixa de 2 a 5 relatada. Um ensaio com hipertensos tratados não encontrou efeito da preensão isométrica, então o benefício é plausível e não garantido. A contração sustentada ELEVA a pressão durante o esforço, então a respiração fica solta do começo ao fim e vale a liberação do dia.",
    refIds: [
      "yan-isometrico-pa-2026",
      "loaiza-isometrico-normotensos-2020",
      "carlson-isometrico-pa-2014",
      "barbosa-isometrico-normotensos-2025",
      "wiles-agachamento-parede-2016",
      "fecchio-handgrip-2023",
    ],
    quando: (c) => Boolean(c.regraClinica?.isometrico?.prevencao),
  },
  {
    /*
     * A PORTA QUE FALTAVA, e a razão de a camada existir fora da hipertensão.
     *
     * Entra por OBJETIVO, não por condição, e só a partir do Intermediário: contração máxima
     * exige que o aluno já saiba produzir força com técnica estável, e no Iniciante o que falta
     * não é rigidez de tendão.
     */
    id: "tendao-forca-rapida",
    foco: "Isométrico máximo para tendão e produção rápida de força",
    protocolo: { series: "5 a 7", contracao: "3 s", descanso: "4 min", sessoes: 2 },
    intensidade:
      "MÁXIMA, com intenção de acelerar: trave a plataforma no ângulo escolhido (ou use uma carga acima do que o aluno consegue mover) e peça para empurrar o mais forte e o mais rápido possível desde o primeiro instante, mesmo que nada se mova. São 3 segundos, não é para segurar a posição. O ângulo é variável da prescrição: escolha o mais parecido com o do exercício principal deste aluno, porque a adaptação é específica ao ângulo treinado.",
    /*
     * O VEÍCULO É O PRÓPRIO LEG PRESS, e não um exercício isométrico novo.
     *
     * Bogdanis (2018) mediu exatamente isto: leg press isométrico máximo. E Blazevich (2020)
     * mostra que o padrão de movimento ESPECÍFICO ao que se quer melhorar é uma das três
     * condições que de fato subiram a produção rápida de força. Criar um exercício separado
     * seria afastar a sessão do movimento do aluno justo onde a evidência pede aproximação.
     *
     * A cadeira extensora entra como alternativa por ser a outra máquina em que dá para travar
     * o ângulo e empurrar contra resistência que não cede. Sem nenhuma das duas no acervo do
     * aluno, a sessão não nasce: contração máxima com peso do corpo não existe.
     */
    exerciciosAceitos: ["leg-press-45", "leg-press-horizontal", "cadeira-extensora"],
    nota:
      "POR QUE ESTA SESSÃO EXISTE: no desenho unilateral de Kubo (2017), 12 semanas, a rigidez do TENDÃO subiu na perna que treinou isométrico e não na que treinou pliometria, e Oranchuk (2019) registra que contrações de 70% ou mais são NECESSÁRIAS para mudar estrutura e função do tendão. Os números da dose são os de Bogdanis (2018): 5 a 7 séries de 3 s de contração máxima com 4 min de recuperação. " +
      "POR QUE CURTA E MÁXIMA, e não sustentada: na metanálise de 54 estudos de Blazevich (2020), o que subiu a produção rápida de força foi velocidade alta, ou velocidade lenta COM A INTENÇÃO de acelerar, ou padrão de movimento específico ao testado; contração lenta SEM intenção de acelerar e exercício NÃO específico não tiveram efeito claro. Segurar posição sem intenção de acelerar é justamente o que a evidência não sustenta aqui. " +
      "O QUE NÃO ESTÁ PROMETIDO: Saeterbakken (2025), 43 estudos e 1.660 participantes, conclui que força dinâmica e força isométrica são DOMÍNIOS NEUROMUSCULARES DIFERENTES, com transferência pequena entre elas. Esta sessão trabalha tendão e taxa de produção de força, e não é um atalho para o 1RM. " +
      "DOSE DA CASA: o ensaio usou 3 sessões por semana; o plano entra com 2, porque aqui o isométrico é COMPLEMENTO de um programa de força completo e não o programa. Subir para 3 é decisão sua. " +
      "A pressão arterial também sobe na contração máxima, e ela é breve mas intensa: respiração solta, sem prender o ar, e nunca com a liberação do dia em aberto.",
    raciocinio:
      "Esta sessão isométrica NÃO é de pressão arterial: ela entra pelo objetivo deste plano. O alvo é a rigidez do TENDÃO e a produção rápida de força, que num desenho de 12 semanas subiram com contração isométrica e não com pliometria. Por isso a dose é curta e máxima, de 3 segundos com intenção de acelerar, e não uma posição segurada por minutos. O que ela não promete é força dinâmica: a maior revisão sobre o assunto trata força isométrica e força dinâmica como domínios diferentes, com transferência pequena entre eles. A contração máxima também eleva a pressão, e por isso a respiração fica solta e vale a liberação do dia.",
    refIds: [
      "kubo-isometrico-tendao-2017",
      "oranchuk-isometrico-2019",
      "bogdanis-isometrico-angulo-2018",
      "blazevich-rfd-2020",
      "saeterbakken-especificidade-2025",
    ],
    quando: (c) => c.objetivo === "Força" && c.nivel !== "Iniciante",
  },
];

/**
 * A indicação que DE FATO disparou neste plano, lida de volta do macrociclo montado.
 *
 * Recalcular a indicação aqui a partir das entradas duplicaria a decisão, e duas cópias da
 * mesma regra é como esta camada errou da primeira vez. O foco da sessão é escrito pela
 * indicação, então ele é a assinatura dela: basta procurar quem o escreveu.
 */
function indicacaoDoMacro(m: Macrociclo): IndicacaoIsometrica | undefined {
  const focos = new Set(
    (m.mesociclos[0]?.microciclos[0]?.sessoes ?? [])
      .filter((se) => se.blocos.some((bl) => bl.tipo === "isometrico"))
      .map((se) => se.foco)
      .filter((f): f is string => Boolean(f)),
  );
  return focos.size ? INDICACOES_ISOMETRICAS.find((i) => focos.has(i.foco)) : undefined;
}

function indicacaoIsometrica(c: CtxIsometrico): IndicacaoIsometrica | undefined {
  // O veto de qualquer condição fundida vence todas as portas, inclusive a de desempenho.
  if (c.regraClinica?.isometrico?.evitar) return undefined;
  return INDICACOES_ISOMETRICAS.find((i) => i.quando(c));
}

/**
 * Objetivos que NÃO recebem o protocolo isométrico, mesmo com a condição indicando.
 *
 * A indicação vem da condição e não do objetivo, e é por isso que o isométrico aparecia até
 * num plano de Aprendizado técnico, cujo propósito declarado é o oposto do protocolo: ali a
 * dose existe para servir à execução ("a técnica manda, não a carga"), e o isométrico é
 * tempo sob tensão sem movimento, que não ensina padrão motor nenhum.
 *
 * Decisão do Filipe. Não é questão de segurança, e sim de coerência do plano: um horizonte
 * de aprendizado que abre com 14 minutos de contração sustentada contradiz o que a própria
 * tela promete àquele aluno.
 *
 * Fica como LISTA declarada, e não como `if` no meio do gerador, para o dia em que outro
 * objetivo entrar aqui não virar mais uma condição escondida no fluxo.
 */
const ISO_OBJETIVOS_FORA: readonly GpsObjetivo[] = ["Aprendizado técnico"];

/**
 * Qual isométrico oferecer, se algum sobreviver aos filtros de sempre.
 *
 * Não há atalho: equipamento precisa estar declarado (peso corporal sempre está) e a posição
 * do exercício não pode ser uma das que a condição pede para evitar. Entre os que passam,
 * vence a ORDEM DA PRÓPRIA INDICAÇÃO, e não uma preferência global: para pressão arterial o
 * primeiro da lista é o AGACHAMENTO NA PAREDE, porque é o submodo que a rede de
 * `edwards-exercicio-pa-2023` aponta como mais efetivo para a sistólica, com a preensão como
 * alternativa quando ele não passa (condição que evita a posição em pé, por exemplo).
 *
 * A LISTA É FECHADA, e essa é a mudança que importa. Antes a função caía em `elegiveis[0]`,
 * qualquer isométrico do acervo. Isso funcionava enquanto a camada tinha um propósito só;
 * com a porta de desempenho passa a ser um erro, porque o agachamento na parede com o peso do
 * corpo NÃO consegue ser uma contração máxima. Servi-lo ali entregaria o protocolo de pressão
 * sob o rótulo de tendão. Sem exercício capaz, a sessão não nasce.
 */
function exercicioIsometrico(
  aceitos: readonly string[],
  equipamentos: string[] | undefined,
  regraClinica: GroupGpsRule | undefined,
): (typeof exercises)[number] | undefined {
  /*
   * A MARCA `doseIsometrica` NÃO É MAIS O FILTRO. Ela diz "este exercício nunca entra na
   * seleção de força", que é uma propriedade do agachamento na parede e da preensão, e não um
   * requisito para servir de veículo a um bloco isométrico. Quem decide o veículo é a lista da
   * indicação; aqui só se confere se o aluno tem o equipamento e se a posição está liberada.
   */
  const passa = (e: (typeof exercises)[number]) => {
    const equipOk = !equipamentos?.length || e.equipamento === "Peso corporal" || equipamentos.includes(e.equipamento);
    if (!equipOk) return false;
    const posicao = e.restricaoPerfil?.posicao;
    if (posicao && regraClinica?.posicoesEvitar?.includes(posicao)) return false;
    if (regraClinica?.evitarMembrosAcimaDoCoracao && e.restricaoPerfil?.membrosAcimaDoCoracao) return false;
    return true;
  };
  for (const slug of aceitos) {
    const ex = exercises.find((e) => e.slug === slug);
    if (ex && passa(ex)) return ex;
  }
  return undefined;
}

/**
 * AS FAMÍLIAS QUE UMA SEMANA DE FORÇA PRECISA TOCAR, e a ordem em que as vagas giram.
 *
 * Membros inferiores têm cota própria por sessão (metade das vagas, arredondada para baixo:
 * 2 de 4, 1 de 3), porque o rótulo único esconde dois padrões de movimento (dominante de
 * joelho e de quadril). As outras vagas giram por estas famílias, nesta ordem, atravessando
 * as sessões da semana: quem treina 3x com 4 exercícios tem 6 vagas de superior por semana,
 * e as 5 famílias cabem. "Corpo todo" fecha a fila como coringa, não como obrigação.
 */
const FAMILIAS_SUPERIORES = ["Peitorais", "Costas", "Ombros", "Braços", "Core (tronco)", "Corpo todo"] as const;

/**
 * DISTRIBUI OS ESCOLHIDOS PELAS SESSÕES DA SEMANA COBRINDO AS FAMÍLIAS.
 *
 * ## O defeito que isto corrige
 *
 * O gerador pedia `frequência + 2` exercícios para a semana INTEIRA (5, para quem treina 3x)
 * e cada sessão girava essa lista pelo módulo. Com a cota de 2 de perna no rodízio de
 * seleção, sobravam 3 vagas, que peito, costas e ombro ocupavam. Braço e core nunca entravam,
 * em semana nenhuma: um plano de hipertrofia de 12 semanas para um homem de 28 anos saía sem
 * um único exercício de braço. Passava no guardrail de cobertura (3 grupos por semana) e
 * qualquer professor olhando de longe perguntava "cadê o braço?". Um amigo do Filipe
 * perguntou exatamente isso.
 *
 * ## Como funciona
 *
 * Cada sessão recebe primeiro a cota de membros inferiores, depois as vagas de superior
 * andam por FAMILIAS_SUPERIORES com um cursor que atravessa as sessões (a sessão 2 continua
 * de onde a 1 parou), para a semana cobrir o máximo de famílias que as vagas permitirem.
 * Família sem exercício no pool (equipamento, restrição) é pulada, não inventada. Exercício
 * não se repete dentro da semana enquanto o pool tiver outro; quando acaba, repete, na ordem
 * de mérito, que é o comportamento antigo e é o que garante que a sessão nunca sai curta.
 *
 * A lista de entrada JÁ VEM ranqueada por segurança e mérito (selecionarExercicios), e a
 * primeira ocorrência de cada família na lista é a melhor daquela família para o aluno.
 * Esta função só decide ONDE cada um cai; não reordena o mérito.
 */
function distribuirPorFamilia(
  escolhidos: { slug: string; nome: string; limpo?: boolean }[],
  frequencia: number,
  porSessao: number,
): { slug: string; nome: string }[][] {
  const grupoDe = (slug: string) => exercises.find((e) => e.slug === slug)?.grupoMuscular ?? "outro";
  // As famílias e a cota de perna só escolhem entre os LIMPOS (nenhuma restrição rebaixou,
  // condição não penalizou). O que a seleção deixou na cauda por segurança só entra quando
  // não sobrou nada limpo, que é o mesmo papel que a cauda sempre teve.
  const ehLimpo = (e: { limpo?: boolean }) => e.limpo !== false;
  const porGrupo = new Map<string, { slug: string; nome: string }[]>();
  for (const e of escolhidos) {
    if (!ehLimpo(e)) continue;
    const g = grupoDe(e.slug);
    if (!porGrupo.has(g)) porGrupo.set(g, []);
    porGrupo.get(g)!.push(e);
  }
  const usados = new Set<string>();
  const reuso = new Map<string, number>();
  // O próximo exercício de um grupo: um que ainda não entrou na semana; se o grupo já foi
  // todo usado e `repetir` está ligado, cicla pela ordem de mérito do grupo.
  const proximo = (grupo: string, repetir: boolean) => {
    const lista = porGrupo.get(grupo) ?? [];
    const livre = lista.find((x) => !usados.has(x.slug));
    if (livre) {
      usados.add(livre.slug);
      return livre;
    }
    if (!repetir || !lista.length) return undefined;
    const i = reuso.get(grupo) ?? 0;
    reuso.set(grupo, i + 1);
    return lista[i % lista.length];
  };
  const inferioresPorSessao = Math.max(1, Math.floor(porSessao / 2));
  let cursor = 0;
  const sessoes: { slug: string; nome: string }[][] = [];
  for (let i = 0; i < frequencia; i++) {
    const sessao: { slug: string; nome: string }[] = [];
    // Perna sempre entra, repetindo o exercício se o pool acabou: treinar perna toda sessão
    // com o mesmo leg press é rotina, sessão sem perna é reclamação.
    for (let k = 0; k < inferioresPorSessao; k++) {
      const it = proximo("Membros inferiores", true);
      if (it && !sessao.some((x) => x.slug === it.slug)) sessao.push(it);
    }
    // Superiores giram pelas famílias; uma volta inteira sem achar nada encerra a busca.
    let semAchar = 0;
    while (sessao.length < porSessao && semAchar < FAMILIAS_SUPERIORES.length) {
      const fam = FAMILIAS_SUPERIORES[cursor % FAMILIAS_SUPERIORES.length];
      cursor++;
      const it = proximo(fam, false);
      if (it) {
        sessao.push(it);
        semAchar = 0;
      } else semAchar++;
    }
    // Vaga que sobrou: o melhor ainda não usado, primeiro de qualquer grupo que NÃO seja
    // perna (a cota de perna já entrou), depois perna. Sem esta ordem, um pool magro em
    // superiores devolvia a sessão "perna + perna + perna", que é a reclamação original com
    // outro rosto.
    // Ordem de preferência: limpo de superior, limpo de perna, e só então a cauda penalizada.
    for (const [soLimpo, preferirSuperior] of [
      [true, true],
      [true, false],
      [false, false],
    ] as const) {
      for (const e of escolhidos) {
        if (sessao.length >= porSessao) break;
        if (usados.has(e.slug)) continue;
        if (soLimpo && !ehLimpo(e)) continue;
        if (preferirSuperior && grupoDe(e.slug) === "Membros inferiores") continue;
        usados.add(e.slug);
        sessao.push(e);
      }
    }
    // Pool esgotado: repete pela ordem de mérito, sem duplicar dentro da mesma sessão.
    for (let j = 0; sessao.length < porSessao && escolhidos.length > 0 && j < escolhidos.length; j++) {
      const e = escolhidos[j];
      if (!sessao.some((x) => x.slug === e.slug)) sessao.push(e);
    }
    sessoes.push(sessao);
  }
  return sessoes;
}

function montarSessoes(
  objetivo: GpsObjetivo,
  nivel: Nivel,
  frequencia: number,
  modelo: ModeloPeriodizacaoId,
  // Restrições já fundidas (perfil + condição): filtram a seleção de exercícios.
  restricoes: RestricaoSelecionada[],
  // Contexto da semana (posição no meso + tendências): faz a dose de força ganhar o ALVO
  // concreto que progride. Mesmo para todas as sessões da semana; o que muda por sessão é a
  // ênfase (ondulatória), que já entra na dose antes do alvo.
  ctx: CtxAlvo,
  // Segundo objetivo do aluno, quando existe: so desempata a selecao.
  objetivoSecundario?: GpsObjetivo,
  // Regra clínica fundida de TODAS as condições: rebaixa o exercício exigente demais.
  regraClinica?: GroupGpsRule,
  // Equipamentos do aluno: moldam a escolha da modalidade aeróbia (ver modalidadeAerobia).
  equipamentos?: string[],
  /*
   * DESCARGA REDUZ DOSE, NÃO TROCA EXERCÍCIO.
   *
   * A frequência da semana de descarga é menor (frequencia - 1), e o `n` da seleção era
   * derivado DELA: com `n` menor, o pool podia virar de "catálogo inteiro" para "só do
   * objetivo", e a semana de descarga saía com exercícios DIFERENTES das semanas de carga.
   * Medido: hipertenso + diabetes + joelho com piscina tinha Cadeira extensora nas semanas
   * de carga e Leg press 45° na descarga, sendo que o resumo do plano declarava o Leg press
   * EVITADO (membros acima do coração). O documento afirmava uma coisa e a semana 12 fazia
   * outra. A seleção agora usa sempre a frequência DO PLANO, a mesma de
   * `consequenciasDoPlano`; a frequência reduzida segue valendo só para o número de sessões.
   */
  frequenciaDoPlano?: number,
): Sessao[] {
  const faixa = getFaixa(objetivo);
  // 3 a 4 exercícios de força por sessão. O POOL pede a semana inteira (sessões x vagas), e
  // não `frequência + 2`: com 5 exercícios para 3 sessões, as vagas giravam os mesmos cinco
  // e duas famílias nunca entravam (ver distribuirPorFamilia).
  const porSessao = objetivo === "Emagrecimento" ? 3 : 4;
  const selecao = selecionarExercicios(objetivo, nivel, Math.max(4, (frequenciaDoPlano ?? frequencia) * porSessao), restricoes, objetivoSecundario, regraClinica, equipamentos);
  const escolhidos = selecao.escolhidos;
  const porSessaoDaSemana = distribuirPorFamilia(escolhidos, frequencia, porSessao);
  const sessoes: Sessao[] = [];

  // A variação diária só entra quando o modelo pede E o objetivo tem ênfases autoradas
  // dentro da própria faixa. Emagrecimento e retorno ao treino não herdam repetições de força.
  const ondula = modelo === "ondulatoria" || modelo === "flexivel";
  /*
   * INICIANTE NÃO RECEBE ÊNFASE, EM MODELO NENHUM.
   *
   * A ênfase era chaveada só pelo MODELO, e por isso atropelava o `porNivel` que a própria
   * faixa declara. O efeito concreto, medido: um INICIANTE de Força em modelo ondulatório
   * recebia blocos de "3 a 5 repetições", quando o `porNivel` do objetivo diz "8 a 12" para
   * ele. E o caminho não era exótico: o iniciante recebe a ondulatória como ALTERNATIVA
   * (linha ~178), e o iniciante COM CONDIÇÃO DECLARADA recebe a flexível (linha ~168), que
   * também ondula. Ou seja, o aluno mais frágil era justamente quem recebia o plano
   * alternativo com repetições de força máxima.
   *
   * Fonte: ACSM Position Stand 2009 (PMID 19204579), literal: "For novice (untrained
   * individuals with no RT experience or who have not trained for several years) training,
   * it is recommended that loads correspond to a repetition range of an 8-12 repetition
   * maximum (RM)."
   *
   * Distribuir ênfase entre as sessões pressupõe técnica consolidada. Para o iniciante, o
   * modelo continua sendo o que ele é (a periodização segue ondulando volume e intensidade
   * ao longo das semanas); o que não acontece mais é descer a faixa de repetições abaixo do
   * que a diretriz recomenda para quem está começando.
   */
  const enfases = ondula && nivel !== "Iniciante" ? faixa.enfases : undefined;
  // A ordem da semana é ABERTA na flexível e na autorregulada: nas duas quem decide o que fazer
  // no dia é a leitura do dia, e não o calendário. Ver o comentário no nome da sessão.
  const ordemAberta = modelo === "flexivel" || modelo === "autorregulada";

  /*
   * NA SEMANA DE DESCARGA, A ÊNFASE MAIS LEVE VEM PRIMEIRO.
   *
   * A rotação é `i % enfases.length` e a descarga roda com `frequencia - 1` sessões, então a
   * sessão que SEMPRE sobrevive ao corte é a de índice 0, que é a "pesado". A semana rotulada
   * como alívio era justamente a composta pela ênfase mais pesada do objetivo, e o efeito
   * ficava medível: na ondulatória de Hipertrofia a descarga saía "3x8 com 2 de reserva"
   * contra "3x7 com 2 de reserva" da carga anterior, ou seja, sem folga nenhuma a mais.
   *
   * Invertendo a ordem só na descarga, quem sobrevive ao corte é a ênfase mais controlada
   * (mais repetição, carga mais leve, mais reserva). Nenhuma ênfase nova entra: são as mesmas
   * do objetivo, na ordem que a semana pede. A leitura de "mais leve" é o PISO de repetições
   * da própria ênfase, porque com a mesma reserva mais repetição é menos carga, que é a
   * mesma leitura que o resto do motor usa.
   */
  const enfasesDaSemana = (() => {
    if (!enfases || ctx?.tipoSemana !== "deload") return enfases;
    const pisoReps = (e: EnfaseSessao) => intervaloDe(e.reps)?.min ?? 0;
    return [...enfases].sort((a, b) => pisoReps(b) - pisoReps(a));
  })();

  for (let i = 0; i < frequencia; i++) {
    const enfase = enfasesDaSemana?.[i % enfasesDaSemana.length];
    const blocos: BlocoSessao[] = [];

    // Aeróbio entra quando o objetivo é emagrecimento (força de corpo todo + cardio).
    // Cardio se prescreve por formato, duração e intensidade, não por séries e carga.
    // Zona moderada e teste da conversa seguem a diretriz do ACSM (garber-2011, acsm-getp11).
    if (objetivo === "Emagrecimento") {
      // As faixas-texto (duração e intensidade) seguem como REFERÊNCIA ao lado; o alvo concreto
      // da semana (duração, PSE e, com idade + FCrep, a zona de FC) vem de alvoAerobioSemana,
      // no mesmo padrão da dose de força: alvo dentro da faixa citada, progredindo por posição.
      const doseAero = {
        duracao: "20 a 40 min",
        intensidade: intensidadeDaBanda("Moderada: cerca de 64 a 76% da FCmáx (teste da conversa; RPE 5 a 6 de 10)", regraClinica),
      };
      blocos.push({
        id: nid("blk"),
        tipo: "aerobio",
        // Id CANONICO da modalidade. Sem o prefixo, getModalidade nao resolve, e o mesmo bloco
    // saia como "Caminhada" no app do aluno e como "Aerobio" no PDF e no editor.
    modalidade: modalidadeAerobia("m-caminhada", regraClinica, equipamentos),
        /*
         * O BLOCO DIZ QUAL CARDIO E, e nao so que existe um.
         *
         * O nome era a palavra "Aerobio", e o Filipe leu um plano e perguntou: "no Cardio
         * ele nao especifica se sera uma corrida, um ciclismo, uma natacao". A modalidade
         * sempre esteve no bloco (m-caminhada), so nao chegava ao nome, entao o PDF a
         * resolvia e a tela nao. Agora o nome vem da modalidade, fonte unica.
         *
         * Isto resolve METADE do que ele pediu: o profissional passa a ver o que vai ser
         * feito. A outra metade, escolher a modalidade IDEAL para as condicoes do aluno,
         * depende de evidencia por condicao e segue aberta.
         */
        nome: getModalidade(modalidadeAerobia("m-caminhada", regraClinica, equipamentos))?.nome ?? "Aeróbio",
        formato: formatoAerobio(regraClinica),
        duracao: doseAero.duracao,
        intensidade: intensidadeAerobia(ctx, doseAero.intensidade),
        recuperacao: "-",
        observacao: notaAerobio(
          ctx,
          `Ajuste a intensidade pelo recurso do equipamento: FCmáx na esteira, watts na bike ou pace na corrida. ${fraseDoFormato(regraClinica)}`,
          `Ajuste a intensidade pelo recurso do equipamento: watts na bike ou pace na corrida. ${fraseDoFormato(regraClinica)}`,
        ),
        ...alvoAerobioSemana(doseAero, ctx),
      });
    }

    /*
     * Os exercícios desta sessão vêm da distribuição por família (ver distribuirPorFamilia).
     * Pool vazio não pode derrubar a geração: com uma lista de equipamentos excêntrica (só
     * Piscina, por exemplo) a força zera, o plano sai com o aeróbio que couber e
     * `faltouCatalogo` acende, que é o sinal que a tela usa para mandar rever equipamentos.
     */
    for (const ex of porSessaoDaSemana[i] ?? []) {
      blocos.push({
        id: nid("blk"),
        tipo: "forca",
        exercicioSlug: ex.slug,
        nome: ex.nome,
        ...doseForca(faixa, nivel, enfase, ctx),
      });
    }

    // Aeróbio COMPLEMENTAR (princípio da variabilidade): todos os objetivos MENOS o
    // Emagrecimento (onde o aeróbio já é BASE, acima) ganham um componente aeróbio em 1 a 2
    // sessões da semana, com dose MENOR e ALVO progressivo por semana. Usa a MESMA mecânica da
    // base (alvoAerobioSemana), então entra na assinaturaSemana/agregadoSemana como os aeróbios
    // de hoje (fonte única do gráfico). Fica ao FINAL da sessão: o foco do objetivo (carga na
    // força, reps na resistência) vem primeiro. Dose e frequência saem da faixa citada
    // (garber-2011), nunca inventadas.
    const comp = faixa.complementoAerobio;
    /*
     * ÊNFASE DE MODALIDADE. A condição pode acrescentar UMA sessão de complemento aeróbio na
     * semana, e só isso. Ver `GroupGpsRule.enfaseModalidade` para por que este efeito é
     * pequeno e de uma via só: ele nunca tira aeróbio nem tira força.
     *
     * O teto é a própria frequência do plano: se o aluno treina 2x e o objetivo já põe
     * aeróbio nas 2, não há terceira sessão para acrescentar, e a ênfase simplesmente não
     * tem efeito naquele horizonte, em vez de inventar uma sessão que o aluno não vai fazer.
     *
     * CASO QUE A BANCADA DE CENÁRIOS REVELOU e que vale escrito, porque parece defeito e não
     * é: no objetivo EMAGRECIMENTO a ênfase aeróbia é inerte em qualquer frequência. O
     * motivo é que ali o aeróbio é a BASE do objetivo e não um complemento, então toda
     * sessão já nasce com um bloco aeróbio e não sobra espaço. Uma condição que pede ênfase
     * aeróbia num plano de emagrecimento já está atendida antes de a ênfase existir.
     */
    const sessoesAerobias =
      comp && regraClinica?.enfaseModalidade?.prioridade === "aerobio"
        ? Math.min(frequencia, comp.sessoesPorSemana + 1)
        : comp?.sessoesPorSemana;
    if (comp && sessoesAerobias != null && i < sessoesAerobias) {
      const doseAero = { duracao: comp.duracao, intensidade: intensidadeDaBanda(comp.intensidade, regraClinica) };
      blocos.push({
        id: nid("blk"),
        tipo: "aerobio",
        modalidade: modalidadeAerobia(comp.modalidade, regraClinica, equipamentos),
        nome: `${getModalidade(modalidadeAerobia(comp.modalidade, regraClinica, equipamentos))?.nome ?? "Aeróbio"} (complementar)`,
        formato: formatoAerobio(regraClinica),
        duracao: doseAero.duracao,
        intensidade: intensidadeAerobia(ctx, doseAero.intensidade),
        recuperacao: "-",
        observacao: notaAerobio(
          ctx,
          "Complemento aeróbio ao treino principal; o foco da sessão segue o objetivo. Guie a intensidade pelo teste da conversa e pela percepção de esforço.",
        ),
        ...alvoAerobioSemana(doseAero, ctx),
      });
    }

    sessoes.push({
      id: nid("ses"),
      /*
       * NA FLEXÍVEL A SESSÃO NÃO TEM DIA, TEM LETRA.
       *
       * O Filipe trocou o plano para "Periodização flexível", leu ao lado a explicação do que
       * é a flexível, e o treino continuou o mesmo da ondulatória. Ele estava certo: o modelo
       * dizia uma coisa e o plano entregava outra.
       *
       * O que a flexível É, segundo o único ensaio que compara os dois de frente
       * (`colquhoun-flexivel-2017`, 25 homens treinados, 9 semanas): as MESMAS sessões, com o
       * aluno escolhendo a ORDEM. O estudo registra, com todas as letras, que não houve
       * diferença de intensidade nem de volume entre os grupos. Ou seja, a dose semanal é
       * equiparada POR DEFINIÇÃO, e inventar uma diferença nela seria inventar um modelo que
       * ninguém estudou.
       *
       * O que muda, então, é o que o plano PROMETE: numerar as sessões de 1 a N afirma uma
       * ordem que a flexível não tem. Com letra, a semana vira um conjunto, que é o que ela é.
       */
      nome: enfase
        ? ordemAberta
          ? `Sessão ${LETRAS_SESSAO[i] ?? i + 1} (${enfase.rotulo})`
          : `Sessão ${i + 1} (${enfase.rotulo})`
        : ordemAberta
          ? `Sessão ${LETRAS_SESSAO[i] ?? i + 1}`
          : `Sessão ${i + 1}`,
      foco: enfase ? `Ênfase ${enfase.rotulo}` : faixa.capacidades[0],
      blocos,
      // Fecho de flexibilidade da sessão (variabilidade), citado; o texto vem do objetivo.
      fecho: faixa.flexibilidade?.texto,
    });
  }

  /*
   * ISOMÉTRICO PARA PRESSÃO ARTERIAL: SESSÃO PRÓPRIA, e não um bloco no fim do treino.
   *
   * Entra por CONDIÇÃO (`GroupGpsRule.isometrico`), nunca por objetivo, porque a evidência é
   * específica de pressão arterial.
   *
   * ## Por que separado, e não anexado
   *
   * Primeiro porque é assim que ele foi testado: `wiles-agachamento-parede-2016` aplicou o
   * protocolo como sessão isolada, 3 vezes por semana, com 48 h entre elas. Anexá-lo ao fim
   * de um treino mudava o contexto do que a evidência mediu.
   *
   * Segundo porque a conta é grande e ficava escondida: 4 contrações de 2 min mais 3
   * descansos de 2 min somam 14 MINUTOS, empilhados sobre o aeróbio e os exercícios de
   * força. A varredura de consistência mediu isso e o Filipe decidiu separar.
   *
   * Terceiro porque separado ele fica honesto no calendário: o profissional vê uma sessão a
   * mais na semana, que é o que o aluno de fato vai fazer, em vez de um treino que ficou 14
   * minutos mais longo sem avisar.
   *
   * ## Por que a dose é literal e não passa pelo motor de alvo
   *
   * Todo o resto do plano recebe faixa e o motor escolhe o ponto da semana. Aqui não: o
   * protocolo é FECHADO, e interpolar dentro dele inventaria um protocolo que ninguém
   * testou. Por isso o bloco não chama `alvoSemana` e não progride: ele repete o protocolo.
   *
   * ## As portas, nesta ordem
   *
   * 1. A condição precisa DECLARAR indicação, e o `evitar` de qualquer condição fundida
   *    derruba (a fusão já resolveu isso antes de chegar aqui).
   * 2. O OBJETIVO precisa comportar o protocolo. Ver `ISO_OBJETIVOS_FORA`: a indicação vem
   *    da condição, então sem esta porta o isométrico entrava até onde ele contradiz o
   *    propósito do plano.
   * 3. O exercício precisa sobreviver aos MESMOS filtros de todo mundo: equipamento
   *    declarado e restrição do perfil. Não há atalho para o isométrico.
   * 4. O texto do bloco diz que a pressão SOBE durante a contração e que a respiração fica
   *    solta, porque é o que a medida mostra e é o que o profissional precisa ler antes de
   *    aplicar.
   *
   * A frequência do protocolo (3x/semana) é o teto, e a do plano é o outro: quem treina 2x
   * não recebe 3 sessões isométricas, porque a semana dele não comporta.
   */
  const indicacaoIso = ISO_OBJETIVOS_FORA.includes(objetivo)
    ? undefined
    : indicacaoIsometrica({ objetivo, nivel, regraClinica });
  if (indicacaoIso) {
    const ex = exercicioIsometrico(indicacaoIso.exerciciosAceitos, equipamentos, regraClinica);
    if (ex) {
      const quantas = Math.min(indicacaoIso.protocolo.sessoes, frequencia);
      for (let k = 0; k < quantas; k++) {
        sessoes.push({
          id: nid("ses"),
          nome: `Sessão isométrica ${k + 1}`,
          // Cabe no dia de treino, não é dia a mais: ver Sessao.complemento.
          complemento: true,
          // O foco sai da INDICAÇÃO que de fato disparou, e não de um texto fixo da camada:
          // é ele que responde, na tela, por que este aluno recebeu esta sessão.
          foco: indicacaoIso.foco,
          blocos: [
            {
              id: nid("blk"),
              tipo: "isometrico",
              exercicioSlug: ex.slug,
              nome: ex.nome,
              series: indicacaoIso.protocolo.series,
              duracao: indicacaoIso.protocolo.contracao,
              intervalo: indicacaoIso.protocolo.descanso,
              intensidade: indicacaoIso.intensidade,
              recuperacao: indicacaoIso.protocolo.descanso,
              observacao: indicacaoIso.nota,
            },
          ],
        });
      }
    }
  }
  return sessoes;
}

/* ---------------------------------- Microciclos ---------------------------------- */

/**
 * Dados do aluno que chegam até o alvo da semana. Todos opcionais: o uso avulso, o estudo e
 * os guardrails não os passam, e o alvo cai no caminho honesto (duração mais PSE) em vez de
 * inventar número.
 */
interface DadosDoAlunoNoAlvo {
  /** estima a FCmax para a zona de FC do aeróbio */
  idade?: number;
  /** FCrep MEDIDA, fecha a zona de Karvonen */
  fcRepouso?: number;
  /** parâmetros que deixaram de guiar a intensidade neste aluno (ver src/lib/gps/farmacos.ts) */
  parametrosInvalidos?: ParamMonitorId[];
  /** restrições já fundidas (perfil + condição): filtram a seleção de exercícios */
  restricoes?: RestricaoSelecionada[];
  /** segundo objetivo do aluno: desempata a seleção DEPOIS da segurança */
  objetivoSecundario?: GpsObjetivo;
  /** regra clínica FUNDIDA de todas as condições declaradas (ver `regraClinicaDoPlano`) */
  regraClinica?: GroupGpsRule;
  /**
   * RAMPA NO MACRO (só o modelo linear passa): posição da primeira semana de carga deste
   * mesociclo dentro do macrociclo, e o total de semanas de carga do macro. É o que faz a
   * progressão linear ser uma rampa única do começo ao fim, em vez de reiniciar a cada bloco.
   */
  cargaAntesDesteMeso?: number;
  semanasDeCargaNoMacro?: number;
  /** piso da faixa para esta ONDA do modelo de blocos (ver CtxAlvo.pisoDoCiclo) */
  pisoDoCiclo?: number;
  /** passo de progressao deste perfil clinico, ja fundido (ver CtxAlvo.fatorProgressao) */
  fatorProgressao?: number;
  /** teto de PSE deste perfil clinico, ja fundido (ver CtxAlvo.pseTeto) */
  pseTeto?: number;
  /** dose modificada pelo perfil clinico, ja fundida (ver CtxAlvo e ModDose) */
  cargaRelativaMax?: number;
  intervaloFolgado?: boolean;
  rirMinimo?: number;
  partirDoPiso?: boolean;
  /** fase de continuação: segura a dose no patamar alcançado (ver CtxAlvo.patamarCongelado) */
  patamarCongelado?: boolean;
  /** equipamentos do aluno: moldam a escolha da modalidade aeróbia */
  equipamentos?: string[];
}

function montarMicrociclos(
  objetivo: GpsObjetivo,
  nivel: Nivel,
  modelo: ModeloPeriodizacaoId,
  frequencia: number,
  semanaInicio: number,
  duracao: number,
  // Semanas de descarga do MACROCICLO, por número absoluto. Antes isto era um booleano
  // por mesociclo ("este bloco fecha com descarga?"), e era ele que sumia no caminho
  // clínico, onde o bloco é uma fase da jornada e quase nunca chega a 4 semanas.
  descargas: Set<number>,
  // Tendências do mesociclo dono destas semanas: mandam a DIREÇÃO do alvo semana a semana.
  tendenciaVolume: Tendencia,
  tendenciaIntensidade: Tendencia,
  // Dados do aluno que personalizam o alvo. Ficam num objeto, e não em posicionais, porque
  // esta lista cresce: hoje idade e FCrep (zona de FC do aeróbio, MP-4), amanhã o perfil
  // clínico que decide qual parâmetro guia a intensidade. Ausente = comportamento de sempre.
  dadosDoAluno: DadosDoAlunoNoAlvo = {},
): Microciclo[] {
  const { idade, fcRepouso, parametrosInvalidos, restricoes: restricoesPlano = [], objetivoSecundario, regraClinica, cargaAntesDesteMeso, semanasDeCargaNoMacro, pisoDoCiclo, fatorProgressao, pseTeto, cargaRelativaMax, intervaloFolgado, rirMinimo, partirDoPiso, patamarCongelado, equipamentos } = dadosDoAluno;
  const semanas: Microciclo[] = [];
  const ordemAbertaNaSemana = modelo === "flexivel" || modelo === "autorregulada";
  // Semanas de carga do meso (as descargas ficam fora desta conta). Agora são contadas,
  // e não deduzidas de "a última é descarga": com cadência absoluta, a descarga pode cair
  // no meio de um mesociclo, e um mesociclo curto pode não ter nenhuma.
  const semanasDeCargaNoMeso = Math.max(1, cargasDoMeso(semanaInicio, duracao, descargas));
  // Posição da semana entre as semanas de CARGA deste meso: é ela que anda o alvo. Sem
  // isto, uma descarga no meio do bloco empurraria o alvo da semana seguinte um degrau
  // além do previsto, porque o índice bruto `s` conta a semana que não teve carga.
  let cargasAntes = 0;
  for (let s = 0; s < duracao; s++) {
    const semana = semanaInicio + s;
    const ehDeload = descargas.has(semana);
    if (!ehDeload) cargasAntes++;
    const freqSemana = ehDeload ? Math.max(1, frequencia - 1) : frequencia;
    const ctx: CtxAlvo = {
      // A descarga se ancora no teto do meso (última carga) e reduz a partir dele.
      semanaNoMeso: ehDeload ? semanasDeCargaNoMeso : cargasAntes,
      semanasDeCargaNoMeso,
      // Rampa no macro: a posição desta semana de carga contada desde o início do plano.
      semanaNoMacro:
        cargaAntesDesteMeso != null ? cargaAntesDesteMeso + (ehDeload ? semanasDeCargaNoMeso : cargasAntes) : undefined,
      semanasDeCargaNoMacro,
      pisoDoCiclo,
      fatorProgressao,
      pseTeto,
      cargaRelativaMax,
      intervaloFolgado,
      rirMinimo,
      partirDoPiso,
      patamarCongelado,
      tipoSemana: ehDeload ? "deload" : "carga",
      tendenciaVolume,
      tendenciaIntensidade,
      nivel,
      objetivo,
      idade,
      fcRepouso,
      parametrosInvalidos,
    };
    const sessoesDaSemana = montarSessoes(
      objetivo,
      nivel,
      freqSemana,
      modelo,
      restricoesPlano,
      ctx,
      objetivoSecundario,
      regraClinica,
      equipamentos,
      frequencia,
    );
    /*
     * A descarga alivia a DOSE ou só a FREQUÊNCIA? A frase da semana precisa saber.
     *
     * Compara a assinatura de cada bloco de força desta descarga com a da semana de carga
     * imediatamente anterior. Se todos os blocos aparecem lá idênticos (séries, repetições,
     * reserva, carga relativa e intervalo), a dose por sessão não mudou e o alívio é a sessão
     * a menos, que o motor sempre aplica. Sem semana anterior visível neste mesociclo, não
     * afirma nada e cai na frase genérica.
     */
    const anterior = semanas[semanas.length - 1];
    const soFrequencia = (() => {
      if (!ehDeload || !anterior || anterior.tipo === "deload") return false;
      const assina = (b: BlocoSessao) =>
        `${b.nome}::${b.seriesAlvo}x${b.repsAlvo}|rir${b.rirAlvo}|pct${b.cargaRelativaAlvo}|int${b.intervaloAlvoSeg}`;
      const forcaDe = (ss: Sessao[]) => ss.flatMap((se) => se.blocos.filter((b) => b.tipo !== "aerobio" && b.tipo !== "isometrico"));
      const agora = forcaDe(sessoesDaSemana).map(assina);
      if (!agora.length) return false;
      const antes = new Set(forcaDe(anterior.sessoes).map(assina));
      return agora.every((x) => antes.has(x));
    })();

    semanas.push({
      id: nid("mic"),
      semana,
      tipo: ehDeload ? "deload" : "carga",
      // `frequencia` do microciclo é a CONTAGEM DE SESSÕES da semana, e não a frequência de
      // treino que o aluno declarou. As duas eram o mesmo número até o isométrico virar
      // sessão própria; agora não são, e o editor já tratava este campo como contagem
      // (ele o reescreve como `sessoes.length` a cada edição). Deixar a frequência de treino
      // aqui faria o editor mostrar "3 sessões" numa semana com 6.
      frequencia: sessoesDaSemana.length,
      sessoes: sessoesDaSemana,
      nota: ehDeload
        ? soFrequencia
          ? "Semana de descarga: a sessão sai igual à da semana anterior porque a faixa citada já está na ponta mais leve; o que alivia é a sessão a menos."
          : "Semana de descarga: reduza volume e intensidade para recuperar."
        : ordemAbertaNaSemana
          ? "Ordem aberta: as sessões desta semana podem ser feitas em qualquer ordem, conforme o dia do aluno. Se um dia cair, a escolha de qual manter é sua, pela ênfase que mais protege o resultado deste aluno."
          : undefined,
      objetivo: objetivoDaSemana(ctx.tipoSemana, tendenciaVolume, tendenciaIntensidade, soFrequencia),
    });
  }
  return semanas;
}

/* ------------------------- Macrociclo por objetivo/nível ------------------------- */

// Arquétipos de FASE de uma onda de treino (progressão da base à realização). Prática comum
// de periodização por blocos; a divisão exata é ajustável pelo profissional. Uma onda é
// acúmulo -> intensificação -> realização: primeiro acumula volume, depois transfere para
// intensidade, depois expressa o ganho com o volume enxuto.
const FASES_ONDA = [
  { nome: "Acúmulo", foco: "Construir a base: acumular volume e consolidar a técnica.", tv: "sobe" as Tendencia, ti: "estavel" as Tendencia },
  { nome: "Intensificação", foco: "Elevar a intensidade sobre a base construída, enxugando um pouco o volume.", tv: "estavel" as Tendencia, ti: "sobe" as Tendencia },
  { nome: "Realização", foco: "Expressar o ganho da fase com o volume mais enxuto e a intensidade em foco.", tv: "reduz" as Tendencia, ti: "sobe" as Tendencia },
];

/**
 * O foco de um mesociclo pela sua POSIÇÃO no ano, para o horizonte anual EVOLUIR em vez de
 * repetir o mesmo quarteto trimestral quatro vezes. O ano se organiza em ONDAS sucessivas
 * (acúmulo -> intensificação -> realização); a cada onda, o programa retoma a fase num
 * patamar mais alto de complexidade. Assim o trimestral (uma onda) segue coerente, e o anual
 * (várias ondas) sobe de nível ao longo do calendário.
 *
 * - `fase = m % 3` escolhe o arquétipo (acúmulo/intensificação/realização);
 * - `ciclo = floor(m / 3)` é a onda do ano (0 = primeira); a partir da 2ª, o nome ganha o
 *   ordinal do ciclo e a complexidade sobe, para os mesociclos do ano não serem idênticos.
 */
function focoDoMeso(m: number): {
  nome: string;
  foco: string;
  tv: Tendencia;
  ti: Tendencia;
  tc: Tendencia;
  ciclo: number;
} {
  const fase = ((m % 3) + 3) % 3;
  const ciclo = Math.floor(m / 3);
  const arq = FASES_ONDA[fase];
  const nome = ciclo === 0 ? arq.nome : `${arq.nome} (${ciclo + 1}º ciclo)`;
  const foco =
    ciclo === 0
      ? arq.foco
      : `${arq.foco} Ciclo ${ciclo + 1} do ano: retoma a fase num patamar de complexidade mais alto.`;
  // A complexidade sobe a cada onda: no primeiro ciclo o acúmulo entra estável (assentar a
  // base) e a realização segura a complexidade para expressar o pico; do 2º ciclo em diante o
  // acúmulo já retoma num patamar maior. É o que faz a média do ano subir, não repetir.
  const tc: Tendencia =
    fase === 2 ? "estavel" : fase === 0 && ciclo === 0 ? "estavel" : "sobe";
  return { nome, foco, tv: arq.tv, ti: arq.ti, tc, ciclo };
}

/*
 * AS MODALIDADES DO CARTÃO SÃO DERIVADAS DOS BLOCOS, não declaradas à parte.
 *
 * Existiam duas fontes paralelas dizendo quais modalidades o mesociclo tem: uma função que
 * respondia pelo objetivo (musculação mais caminhada, fixa) e, no caminho clínico, a lista
 * autorada da fase da jornada. Nenhuma das duas olhava o plano montado. Enquanto o cardio
 * foi sempre caminhada, a mentira não aparecia; no dia em que a osteoartrite de joelho
 * passou a receber hidroginástica por evidência, o cartão continuou prometendo caminhada.
 * Medido: com joelho em atenção, cartão [m-musculacao, m-caminhada] e blocos [m-hidro].
 *
 * É a mesma classe do "diz linear e o gráfico ondula" que o Filipe pegou duas vezes, e o
 * conserto é o mesmo de lá: o cartão descreve o que o plano FAZ. A derivação vive em
 * `sincronizarTendencias`, que já existe exatamente para esse contrato. A lista autorada da
 * jornada continua nos dados do grupo, intacta, para as telas da própria jornada.
 */
function modalidadesReaisDoMeso(meso: Mesociclo): string[] {
  const aerobias = new Set<string>();
  let temForca = false;
  for (const w of meso.microciclos)
    for (const s of w.sessoes)
      for (const b of s.blocos) {
        if (b.tipo === "forca") temForca = true;
        else if (b.modalidade) aerobias.add(b.modalidade);
      }
  return [...(temForca ? ["m-musculacao"] : []), ...aerobias];
}

/**
 * As tendências de volume e intensidade de um mesociclo, A PARTIR DO MODELO ESCOLHIDO.
 *
 * Existe porque o modelo era ignorado aqui, e o Filipe pegou a contradição: escolheu
 * periodização LINEAR e o gráfico saiu ondulando. O motivo era que, fora dos modelos
 * ondulatórios, as tendências vinham direto de `focoDoMeso`, cujo ciclo de ondas
 * (acúmulo -> intensificação -> realização) faz o volume subir e descer de bloco em bloco.
 * O rótulo dizia uma coisa e o gráfico mostrava outra.
 *
 * Agora cada modelo faz o que o nome dele promete:
 *
 * - **linear**: rampa contínua no macrociclo inteiro. Volume desce, intensidade sobe, do
 *   começo ao fim, com a descarga de cada bloco preservada. É a definição clássica, e é o
 *   que o gráfico agregado passa a mostrar.
 * - **ondulatória, flexível, autorregulada**: variam de propósito, dentro da semana.
 * - **blocos**: mantém as ondas de `focoDoMeso`, porque ondular de bloco em bloco É o
 *   modelo de blocos. Aqui o nome e o comportamento sempre bateram.
 */
function tendenciasDoModelo(
  modelo: ModeloPeriodizacaoId,
  foco: { tv: Tendencia; ti: Tendencia },
): { tv: Tendencia; ti: Tendencia } {
  if (modelo === "ondulatoria" || modelo === "flexivel" || modelo === "autorregulada") {
    return { tv: "varia", ti: "varia" };
  }
  if (modelo === "linear") return { tv: "reduz", ti: "sobe" };
  return { tv: foco.tv, ti: foco.ti };
}

/**
 * A contagem de semanas de CARGA por mesociclo, e o acumulado antes de cada um.
 *
 * Serve para o alvo medir a posição no MACROCICLO inteiro em vez de reiniciar a cada bloco.
 *
 * - No **linear** é a rampa: sem isso, "reduz" descia dentro do bloco e voltava ao topo no
 *   bloco seguinte, e o gráfico do plano "linear" saía em serrote.
 * - Na **ondulatória** (e nas primas flexível e autorregulada) é a LINHA DE BASE da onda.
 *   A onda alternava semana sim, semana não, em torno de um centro fixo, e nada mais: em seis
 *   semanas, as semanas 4, 5 e 6 saíam idênticas às semanas 1, 2 e 3, e um plano de meio ano
 *   era a mesma quinzena repetida doze vezes. Ondular é variar em torno de uma base, e a base
 *   tem que andar; senão não é periodização, é repetição com nome bonito.
 * - **Blocos** fica de fora de propósito: ali o movimento é de bloco em bloco, pelas ondas de
 *   `focoDoMeso`, e é assim que o modelo se define.
 */
/**
 * CADÊNCIA DE DESCARGA, EM SEMANAS DE CALENDÁRIO.
 *
 * Quatro semanas é a escolha da casa que já vinha sendo aplicada no caminho genérico
 * (blocos de ~4 semanas, a última de descarga). O que muda aqui é o ANCORAMENTO: a
 * descarga passa a contar a partir do início do plano, e não do tamanho do bloco.
 *
 * ## Por que isso era um defeito de segurança, e invertido
 *
 * A regra antiga era `comDeload = dur >= 4`, com `dur` sendo a duração do mesociclo.
 * No caminho genérico o mesociclo é montado com ~4 semanas por construção, então a
 * descarga sempre acontecia. No caminho de GRUPO ESPECIAL o mesociclo é uma FASE DA
 * JORNADA, e o número de mesociclos é fixo no número de fases (tipicamente 4). Logo
 * `dur = semanas / 4`, que é menor que 4 em qualquer horizonte abaixo de 16 semanas.
 *
 * Medido antes da correção, com hipertensão estágio 2 e com obesidade grau II:
 *
 *   horizonte | sem condição       | com condição clínica
 *   4 semanas | descarga na 4      | NENHUMA
 *   8 semanas | descarga na 4 e 8  | NENHUMA
 *   12 semanas| descarga 4, 8, 12  | NENHUMA
 *
 * Ou seja, exatamente quem tem mais motivo para recuperar era quem nunca recuperava, e
 * em três dos cinco horizontes oferecidos, incluindo o trimestral, que é o mais usado.
 * Não era uma regra clínica ausente: era uma regra de recuperação que existia e que a
 * aritmética do caminho clínico desligava em silêncio.
 *
 * A correção não inventa cadência nova nem trata o aluno clínico de forma diferente:
 * aplica a MESMA cadência que o aluno sem condição já recebia. Nos horizontes de
 * catálogo (4, 8, 12, 24 e 48 semanas) o caminho genérico sai idêntico ao de antes,
 * porque lá os blocos já eram de 4 semanas.
 */
/**
 * Formato do bloco aeróbio: contínuo por padrão, intervalado onde a CONDIÇÃO tem evidência
 * de benefício nesse formato.
 *
 * Era a string fixa "Contínuo" nos dois pontos em que o motor monta bloco aeróbio, o que
 * significa que o produto era INCAPAZ de prescrever intervalado para qualquer aluno. Pior
 * que a ausência: o texto da observação já descrevia a alternativa intervalada ao
 * profissional, ou seja, o sistema contava uma opção que ele mesmo nunca montava.
 *
 * A porta é estreita de propósito. Só vira intervalado quando a condição declara
 * `intervaladoIndicado` com referência, e a fusão conservadora já derrubou o pedido se
 * QUALQUER condição do aluno desaconselhar. Aluno sem condição continua recebendo contínuo,
 * byte-idêntico ao de antes.
 */
function formatoAerobio(regraClinica?: GroupGpsRule): string {
  const mod = regraClinica?.modAerobio;
  return mod?.intervaladoIndicado && !mod.intervaladoEvitar ? "Intervalado" : "Contínuo";
}

/**
 * A frase de formato da NOTA do bloco aeróbio, coerente com o formato que o bloco tem.
 *
 * A nota era uma constante que oferecia o intervalado como alternativa, escrita quando o
 * motor só sabia montar contínuo. Depois que `formatoAerobio` passou a poder devolver
 * "Intervalado", o bloco começou a se contradizer para quem tem a condição que o indica:
 * o campo `formato` dizia Intervalado e a nota logo abaixo oferecia "alternativa
 * intervalada", como se ainda não fosse. Medido em `ansiedade-depressao`.
 *
 * É a mesma classe do defeito que abriu a porta do intervalado (o produto descrevia uma
 * opção que ele nunca montava), agora ao contrário: o produto monta e continua descrevendo
 * como se não montasse. Quando o bloco JÁ é intervalado, a nota diz como executá-lo e
 * oferece o contínuo como a alternativa que de fato sobrou.
 */
function fraseDoFormato(regraClinica?: GroupGpsRule): string {
  return formatoAerobio(regraClinica) === "Intervalado"
    ? "Formato intervalado: alterne 1 a 2 min mais forte com 2 a 3 min leves, mantendo o tempo total. Se preferir, o contínuo no mesmo tempo total é alternativa."
    : "Alternativa intervalada: alterne 1 a 2 min mais forte com 2 a 3 min leves, mantendo o tempo total.";
}

/**
 * A MODALIDADE AERÓBIA DESTE ALUNO.
 *
 * O bloco saía sempre em caminhada, e o Filipe perguntou, lendo o plano de alguém com três
 * condições: "no Cardio ele não especifica se será uma corrida, um ciclismo, uma natação. O
 * paciente tem 3 condições patológicas e o ideal seria indicar o cardio mais ideal".
 *
 * A condição agora declara quais modalidades a evidência coloca à frente
 * (`ModAerobio.modalidadesPreferidas`, já fundida pela interseção). Aqui vence a primeira que
 * existir de fato no catálogo de cardio. Sem declaração, ou sem exercício daquela modalidade
 * no catálogo, fica o padrão do objetivo, byte-idêntico ao de antes.
 */
function modalidadeAerobia(padrao: string, regraClinica?: GroupGpsRule, equipamentos?: string[]): string {
  const preferidas = regraClinica?.modAerobio?.modalidadesPreferidas ?? [];
  /*
   * A PREFERIDA SÓ VENCE SE O ALUNO TIVER COMO EXECUTÁ-LA.
   *
   * A primeira versão desta função filtrava só por "existe no catálogo", e "Piscina" está na
   * lista de equipamentos do produto desde sempre: um aluno com osteoartrite SEM piscina
   * declarada recebia um plano inteiro de hidroginástica que não tinha como fazer. É a
   * mesma classe de impossibilidade técnica que a prontidão já trata na força (o bloqueio
   * "sem-equipamento"), reintroduzida por mim na porta nova.
   *
   * Com a lista de equipamentos presente, a modalidade só se qualifica se AO MENOS UM
   * exercício de cardio dela for executável com o que o aluno tem. Sem a lista (uso avulso,
   * bancadas, chamadas antigas), o comportamento é o de antes. A lista de preferência segue
   * em ordem: joelho sem piscina e com bicicleta cai para a bicicleta, que é a segunda que a
   * mesma evidência coloca à frente.
   *
   * A seleção de FORÇA lê o mesmo campo desde a rodada seguinte (ver `selecionarExercicios`);
   * a dívida que este comentário registrava está paga.
   */
  // A regra de disponibilidade é a MESMA do resto do produto (engine.ts e o seletor de
  // força): peso corporal sempre disponível, o resto precisa estar declarado. Como a
  // caminhada em piso plano é de peso corporal, o padrão nunca fica inexequível.
  const executaveis = new Set(
    exercises
      .filter(
        (e) =>
          e.doseAerobia &&
          e.modalidade &&
          (!equipamentos?.length || e.equipamento === "Peso corporal" || equipamentos.includes(e.equipamento)),
      )
      .map((e) => e.modalidade as string),
  );
  return preferidas.find((m) => executaveis.has(m)) ?? padrao;
}

/** A banda a que um texto de intensidade corresponde, quando ele é um dos textos canônicos. */
function bandaDoTexto(texto: string): BandaAerobia | undefined {
  return (Object.keys(BANDAS_AEROBIAS) as BandaAerobia[]).find(
    (b) => BANDAS_AEROBIAS[b].intensidade === texto,
  );
}

/**
 * Texto de intensidade do bloco aeróbio, pela banda que a condição admite.
 *
 * ## `bandaMax` É TETO, E POR UM TEMPO ELE FOI VALOR
 *
 * Esta função devolvia a banda da condição direto, sem comparar com o padrão do objetivo. O
 * campo se chama `bandaMax`, a fusão entre condições pega a MENOR, e o comentário da
 * declaração diz com todas as letras "admitir e não obrigar: a banda é um TETO". O código
 * fazia o contrário do que os três diziam.
 *
 * Medido antes da correção, no único caso que existe hoje (`ansiedade-depressao`, que
 * declara `vigorosa` porque a evidência associa intensidade maior a mais melhora dos
 * sintomas):
 *
 *   sem a condição: "Moderada: cerca de 64 a 76% da FCmáx (...)"  rpeAlvo 5
 *   com a condição: "Vigorosa: cerca de 77 a 95% da FCmáx (...)"  rpeAlvo 7
 *
 * Ou seja, DECLARAR uma condição de saúde deixava o plano mais pesado, e já na primeira
 * semana. Isso quebra a lei que o motor inteiro segue e que está escrita no topo deste
 * arquivo e no de groupRules: cada camada só APERTA, nenhuma afrouxa o que a anterior
 * definiu. É a mesma família do defeito de "declarar mais sobre o aluno piora o resultado"
 * que já apareceu na fusão de restrições.
 *
 * Agora vence a MENOR entre a banda da condição e a do objetivo. Consequência assumida: uma
 * banda declarada ACIMA do padrão não muda a dose, porque um teto não levanta piso. A
 * evidência que sustenta a intensidade maior não se perde: ela já vive em `cuidados`, que é
 * a camada do PROFISSIONAL, e é ele quem decide subir, com o plano editável em tudo.
 *
 * Texto autorado pelo objetivo (que não casa com nenhuma banda canônica) não é atropelado:
 * sem saber a que banda ele corresponde, a comparação não é possível e o padrão prevalece.
 */
function intensidadeDaBanda(padrao: string, regraClinica?: GroupGpsRule): string {
  const banda = regraClinica?.modAerobio?.bandaMax;
  if (!banda) return padrao;
  const bandaPadrao = bandaDoTexto(padrao);
  if (!bandaPadrao) return padrao;
  const menor = ORDEM_BANDA[banda] < ORDEM_BANDA[bandaPadrao] ? banda : bandaPadrao;
  return BANDAS_AEROBIAS[menor].intensidade;
}

const CADENCIA_DELOAD = 4;

/**
 * Semanas de descarga do macrociclo, por número ABSOLUTO da semana no plano.
 *
 * A cadência é 4 por padrão, e a CONDIÇÃO pode encurtá-la. Seis condições já declaravam
 * `modProgressao.descargaCadaSemanas` (obesidade grau 3 pede a cada 3 semanas, grau 2 a
 * cada 4, grau 1 a cada 5), e por muito tempo esse campo foi lido por ninguém: existia a
 * declaração, a fusão pelo mínimo, e nenhum consumidor. Quem tinha obesidade grau 3
 * descansava na mesma cadência de quem não tinha condição alguma.
 *
 * É o mesmo defeito que o cabeçalho de `alvo.ts` chama de o mais comum deste motor, a
 * cautela declarada e não aplicada, e é a razão de a régua de distintividade encontrar
 * dez condições com dose idêntica.
 *
 * Só encurta, nunca alonga: `Math.min` com o padrão. Uma condição não pode fazer o aluno
 * descansar MENOS que o plano genérico, do mesmo jeito que a camada de fármacos só aperta.
 */
function semanasDeDescarga(semanasTotais: number, cadenciaDaCondicao?: number): Set<number> {
  const passo = Math.max(2, Math.min(CADENCIA_DELOAD, cadenciaDaCondicao ?? CADENCIA_DELOAD));
  const set = new Set<number>();
  for (let s = passo; s <= semanasTotais; s += passo) set.add(s);
  return set;
}

/*
 * A DESCARGA FECHA UM BLOCO, ELA NÃO ABRE UM.
 *
 * `semanasDeDescarga` posiciona pelo CALENDÁRIO (a cada 3 ou 4 semanas, conforme a
 * `descargaCadaSemanas` da condição), enquanto no caminho clínico o mesociclo é uma fase da
 * jornada e dura `semanas / nFases`. Quando as duas cadências não fecham, a descarga nasce
 * como PRIMEIRA semana de um mesociclo, e aí ela se ancora em semanas de carga que ainda não
 * aconteceram: medido em 18/08/2026, 4.320 descargas caíam nessa posição e 222 delas saíam
 * com dose por bloco MAIOR que a semana de carga anterior. Um alívio que ainda não viu
 * esforço nenhum não é alívio.
 *
 * O ajuste puxa essa descarga uma semana para TRÁS, onde ela fecha o bloco anterior. Puxar
 * para trás e nunca para frente é a escolha conservadora: a descarga chega no máximo na
 * cadência que a condição declarou, nunca depois dela.
 *
 * Não mexe quando a semana 1 do plano seria a descarga, quando a anterior já é descarga (não
 * empilha duas) e quando o bloco anterior tem uma única semana (ele ficaria sem nenhuma
 * semana de carga).
 */
function descargaFechaOBloco(descargas: Set<number>, duracoes: number[]): Set<number> {
  const inicio = new Map<number, number>(); // semana inicial do meso -> duração do meso ANTERIOR
  let cursor = 1;
  duracoes.forEach((d, m) => {
    inicio.set(cursor, m === 0 ? 0 : duracoes[m - 1]);
    cursor += d;
  });
  const ajustado = new Set(descargas);
  for (const s of [...descargas].sort((a, b) => a - b)) {
    const durAnterior = inicio.get(s);
    if (durAnterior == null || durAnterior < 2) continue; // não é abertura de bloco, ou o bloco anterior é curto demais
    if (s === 1 || ajustado.has(s - 1)) continue;
    ajustado.delete(s);
    ajustado.add(s - 1);
  }
  return ajustado;
}

/** Quantas semanas de CARGA (não descarga) o mesociclo que começa em `ini` contém. */
function cargasDoMeso(ini: number, dur: number, descargas: Set<number>): number {
  let n = 0;
  for (let s = ini; s < ini + dur; s++) if (!descargas.has(s)) n++;
  return n;
}

/**
 * `duracoes` são as durações REAIS, sempre. Quem não progride entra por `progride`, e
 * não zerando a duração: agora que a descarga é posicional no calendário, zerar um
 * mesociclo deslocaria o número absoluto de todas as semanas seguintes, e a rampa
 * passaria a olhar a semana errada para saber se ela é de carga.
 */
function rampaNoMacro(
  modelo: ModeloPeriodizacaoId,
  duracoes: number[],
  descargas: Set<number>,
  progride?: boolean[],
): { antes: number[]; total?: number } {
  // A contagem de semanas de carga usa a MESMA fonte que decide a descarga, senão a
  // rampa acha que progrediu numa semana que o plano entregou como descarga.
  let ini = 1;
  const cargas = duracoes.map((d, m) => {
    const c = progride && !progride[m] ? 0 : cargasDoMeso(ini, d, descargas);
    ini += d;
    return c;
  });
  const antes: number[] = [];
  let acc = 0;
  for (const c of cargas) {
    antes.push(acc);
    acc += c;
  }
  const usaMacro =
    modelo === "linear" || modelo === "ondulatoria" || modelo === "flexivel" || modelo === "autorregulada";
  return usaMacro ? { antes, total: acc } : { antes: duracoes.map(() => 0), total: undefined };
}

function montarMacrocicloGenerico(
  input: GerarPlanoInput,
  modelo: ModeloPeriodizacaoId,
): Macrociclo {
  const { objetivo, nivel, semanas, frequencia } = input;
  const faixa = getFaixa(objetivo);

  // Blocos de ~4 semanas: um mesociclo a cada 4 semanas, sem teto (o horizonte anual pede
  // ~12). Os focos vêm de `focoDoMeso`: o ano se organiza em ONDAS (acúmulo -> intensificação
  // -> realização) que EVOLUEM de ciclo em ciclo, em vez do quarteto trimestral repetido; cada
  // mesociclo de 4+ semanas fecha com a própria descarga.
  const nMeso = Math.max(1, Math.round(semanas / 4));
  const base = Math.floor(semanas / nMeso);
  const resto = semanas - base * nMeso;

  const duracoes = Array.from({ length: nMeso }, (_, m) => base + (m < resto ? 1 : 0));
  const descargas = descargaFechaOBloco(
    semanasDeDescarga(semanas, regraClinicaDoPlano(input)?.modProgressao?.descargaCadaSemanas),
    duracoes,
  );
  const rampa = rampaNoMacro(modelo, duracoes, descargas);
  // Ondas do modelo de blocos (acúmulo -> intensificação -> realização se repetem a cada 3
  // mesociclos). A onda seguinte lê a MESMA faixa a partir de um piso mais alto, senão o plano
  // de 24 semanas sai com as semanas 13 a 24 idênticas às 1 a 12. Ver CtxAlvo.pisoDoCiclo.
  const ondas = Math.ceil(nMeso / FASES_ONDA.length);
  const pisoDaOnda = (m: number) =>
    modelo === "blocos" && ondas > 1 ? (Math.floor(m / FASES_ONDA.length) / ondas) * 0.5 : undefined;
  const mesociclos: Mesociclo[] = [];
  let cursor = 1;
  for (let m = 0; m < nMeso; m++) {
    const dur = duracoes[m];
    const ini = cursor;
    const fim = cursor + dur - 1;
    cursor = fim + 1;
    const foco = focoDoMeso(m);
    // O selo de descarga do mesociclo agora diz se ELE CONTEM alguma semana de descarga,
    // em vez de "este bloco tem 4 ou mais semanas", que era o que apagava a descarga do
    // caminho clinico inteiro. Ver CADENCIA_DELOAD.
    const comDeload = cargasDoMeso(ini, dur, descargas) < dur;
    // As tendências do meso mandam a direção do alvo; a mesma fonte alimenta o gráfico e o alvo.
    const { tv, ti } = tendenciasDoModelo(modelo, foco);

    mesociclos.push({
      id: nid("mes"),
      nome: foco.nome,
      foco: foco.foco,
      semanaInicio: ini,
      semanaFim: fim,
      capacidades: faixa.capacidades,
      tiposExercicio: faixa.tiposExercicio,
      // Valor provisorio: a lista final e derivada dos blocos em sincronizarTendencias.
      modalidades: [],
      tendenciaVolume: tv,
      tendenciaIntensidade: ti,
      // A complexidade sobe a cada onda do ano (ver focoDoMeso): é parte do que faz o anual
      // evoluir, não repetir. No modelo ondulatório o alvo já varia dentro da semana.
      tendenciaComplexidade: foco.tc,
      deload: comDeload,
      reavaliacao: true,
      criteriosProgressao: [
        "Sessões concluídas com boa técnica e esforço dentro do previsto",
        "Sem dor relevante nem sinais de alerta",
        "Recuperação adequada entre as sessões",
      ],
      criteriosRegressao: [
        "Dor, perda de função ou sinais de alerta",
        "Fadiga acumulada ou queda de desempenho persistente",
        "Baixa adesão ou sono ruim mantidos",
      ],
      parametros: faixa.parametros,
      microciclos: montarMicrociclos(objetivo, nivel, modelo, frequencia, ini, dur, descargas, tv, ti, {
        idade: input.idade,
        fcRepouso: input.fcRepouso,
        parametrosInvalidos: input.parametrosInvalidos,
        restricoes: restricoesDoPlano(input),
        equipamentos: input.equipamentos,
        objetivoSecundario: input.objetivoSecundario,
        regraClinica: regraClinicaDoPlano(input),
        // O perfil clinico progride no passo dele: fundido pelo mais conservador (ver comPasso).
        fatorProgressao: regraClinicaDoPlano(input)?.modProgressao?.fatorIncremento,
        // O teto de PSE do perfil chegava ao texto do semaforo e a autorregulacao da
        // execucao, mas nunca ao alvo PRESCRITO. Ver CtxAlvo.pseTeto.
        pseTeto: regraClinicaDoPlano(input)?.modProgressao?.pseTeto,
        // A dose nasce do PERFIL e da IDADE, nao so do objetivo. Ver ModDose, doseDoPerfil e
        // doseDoPerfilComIdade: idade nao e condicao, mas funde pela mesma lei conservadora.
        cargaRelativaMax: doseDoPerfilComIdade(regraClinicaDoPlano(input), input.idade)?.cargaRelativaMax,
        intervaloFolgado: doseDoPerfilComIdade(regraClinicaDoPlano(input), input.idade)?.intervaloFolgado,
        rirMinimo: doseDoPerfilComIdade(regraClinicaDoPlano(input), input.idade)?.rirMinimo,
        partirDoPiso: doseDoPerfilComIdade(regraClinicaDoPlano(input), input.idade)?.partirDoPiso,
        cargaAntesDesteMeso: rampa.total != null ? rampa.antes[m] : undefined,
        semanasDeCargaNoMacro: rampa.total,
        pisoDoCiclo: pisoDaOnda(m),
      }),
    });
  }

  return sincronizarTendencias({ objetivoGeral: `${objetivo} (${nivel})`, semanas, mesociclos });
}

/* ------------------- O rótulo do mesociclo tem que bater com a dose ------------------- */

/**
 * INTENSIDADE DE UMA SEMANA, do jeito que o aluno sente: RIR primeiro, repetição como
 * desempate. Menos repetição com o mesmo RIR é mais carga na barra, então as duas entram
 * numa escada lexicográfica só. Semana sem alvo numérico devolve null e não é comparada.
 */
function intensidadeDaSemana(w: Microciclo): number | null {
  const vals: number[] = [];
  for (const s of w.sessoes)
    for (const b of s.blocos) {
      if (b.tipo !== "forca") continue;
      if (b.cargaRelativaAlvo != null) vals.push(b.cargaRelativaAlvo);
      else if (b.rirAlvo != null) vals.push(-(b.rirAlvo * 100 + (b.repsAlvo ?? 0)));
    }
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

/** Volume de força da semana: séries x repetições somadas. */
function volumeDaSemana(w: Microciclo): number | null {
  let total = 0;
  let achou = false;
  for (const s of w.sessoes)
    for (const b of s.blocos) {
      if (b.tipo !== "forca" || b.seriesAlvo == null || b.repsAlvo == null) continue;
      total += b.seriesAlvo * b.repsAlvo;
      achou = true;
    }
  return achou ? total : null;
}

/**
 * O MESOCICLO NÃO PROMETE O QUE NÃO ENTREGA.
 *
 * A rampa contínua do modelo linear percorre o macrociclo inteiro (decisão do fundador, para
 * o linear parar de sair ondulado no gráfico). Em horizonte longo isso esbarra num limite de
 * aritmética, não de programação: um plano anual tem 44 semanas de carga e a faixa citada do
 * objetivo tem 7 valores de repetição e 3 de RIR. A rampa então anda de mesociclo em
 * mesociclo, e há mesociclo em que a dose prescrita fica igual à do anterior. Quem carrega o
 * incremento naquelas semanas é a CARGA, pela dupla progressão, que o plano já prevê.
 *
 * O defeito nisso não é a dose: é o CARTÃO do mesociclo dizer "intensidade sobe" numa janela
 * em que ela não sobe. Numa ferramenta que o profissional assina, rótulo que promete demais é
 * o mesmo problema que o fundador trouxe do campo ("diz linear e o gráfico sai ondulado"),
 * só que ao contrário.
 *
 * Então, depois de montar o macrociclo, o rótulo é conferido contra o que as semanas de carga
 * de fato fazem, e SÓ REBAIXA: "sobe" ou "reduz" que não acontecem viram "estavel". Nada aqui
 * altera uma série, uma repetição ou um RIR: a dose sai idêntica, muda o que o cartão diz
 * dela. "varia" (ondulatória) é preservado, porque ali o movimento é dentro da semana.
 */
function sincronizarTendencias(macro: Macrociclo): Macrociclo {
  const mesos = macro.mesociclos;
  const cargasDo = (m: Mesociclo) => m.microciclos.filter((w) => w.tipo === "carga");

  for (const meso of mesos) {
    // O cartão de modalidades descreve o que o mesociclo CONTÉM (ver modalidadesReaisDoMeso).
    meso.modalidades = modalidadesReaisDoMeso(meso);
    const c = cargasDo(meso);
    if (c.length < 2) continue;
    // A janela é o próprio mesociclo, porque é dele que o cartão fala: da primeira à última
    // semana de CARGA (a descarga é exceção de propósito e não conta).
    const fimDaJanela = c[c.length - 1];

    for (const [campo, medir] of [
      ["tendenciaIntensidade", intensidadeDaSemana],
      ["tendenciaVolume", volumeDaSemana],
    ] as const) {
      const atual = meso[campo];
      if (atual !== "sobe" && atual !== "reduz") continue;
      const ini = medir(c[0]);
      const fim = medir(fimDaJanela);
      if (ini == null || fim == null) continue; // sem alvo numérico: não dá para conferir
      const aconteceu = atual === "sobe" ? fim > ini : fim < ini;
      if (!aconteceu) meso[campo] = "estavel";
    }
  }
  return macro;
}

/* --------------------- Macrociclo com jornada do grupo especial --------------------- */

function montarMacrocicloGrupo(input: GerarPlanoInput, modelo: ModeloPeriodizacaoId): Macrociclo | null {
  if (!input.grupoEspecial) return null;
  const grupo = getSpecialGroup(input.grupoEspecial);
  if (!grupo || !grupo.fases?.length) return null;

  const { objetivo, nivel, semanas, frequencia } = input;
  const faixa = getFaixa(objetivo);
  // O aluno que já está na fase 3 recebe o macro nascendo na fase 3: itera das fases a
  // partir de `faseInicial`. Ausente = 1 = todas as fases = comportamento byte-idêntico.
  const inicio = Math.min(grupo.fases.length, Math.max(1, input.faseInicial ?? 1)) - 1;
  const fasesUsadas = grupo.fases.slice(inicio);

  // Um mesociclo por fase basta até ~8 semanas por fase. Num horizonte longo (anual), em
  // que cada fase ficaria com mais de 8 semanas, a ÚLTIMA fase (consolidação/manutenção) se
  // REPETE, sem inventar fase nova: o programa sustenta os ganhos até o fim do calendário.
  const MAX_SEM_POR_FASE = 8;
  const precisaEstender = fasesUsadas.length > 0 && semanas / fasesUsadas.length > MAX_SEM_POR_FASE;
  const nMeso = precisaEstender
    ? Math.max(fasesUsadas.length, Math.ceil(semanas / MAX_SEM_POR_FASE))
    : fasesUsadas.length;
  // Sequência de fases: as reais primeiro; depois repetições honestas da última fase.
  const sequencia = Array.from({ length: nMeso }, (_, m) => {
    const idx = Math.min(m, fasesUsadas.length - 1);
    return { fase: fasesUsadas[idx], estendida: m >= fasesUsadas.length };
  });
  const base = Math.floor(semanas / nMeso);
  const resto = semanas - base * nMeso;

  const duracoes = sequencia.map((_, m) => base + (m < resto ? 1 : 0));
  /*
   * A FASE DE ENTRADA É O COMEÇO DA RAMPA, NÃO UM PLATÔ NO MEIO DA FAIXA.
   *
   * Antes, a primeira fase era marcada como "estável" junto com as fases de manutenção. E
   * "estável" lê o MEIO da faixa citada, enquanto a fase seguinte, que progride, começa no
   * PISO dela. O resultado, visível numa bancada de cenários clínicos: um plano de 12 semanas
   * para hipertenso estágio 2 com obesidade grau II saía 4x9 com RIR 2 nas semanas 1 a 3,
   * caía para 4x12 com RIR 3 (mais leve) na semana 4, e só voltava ao patamar da semana 1 na
   * semana 11. A fase chamada "Entrada, segurança e adaptação" era o segundo trecho mais
   * pesado do macrociclo, e o plano terminava na dose em que tinha começado.
   *
   * Agora a fase de entrada participa da rampa como o primeiro trecho dela: começa no piso e
   * sobe, sem degrau na passagem para a fase 2. Quem continua estável são só as fases
   * ESTENDIDAS, que são repetição da última fase para sustentar ganho em horizonte longo, e
   * ali o platô é o objetivo declarado. O passo dessa subida já é o do perfil clínico, pelo
   * `fatorProgressao` fundido: quem precisa progredir devagar progride devagar, e não
   * "progride do meio da faixa para o meio da faixa".
   */
  const progride = sequencia.map(({ estendida }) => !estendida);
  // A descarga é do CALENDÁRIO do plano, não da fase: no caminho clínico o mesociclo é
  // uma fase da jornada e quase nunca chega a 4 semanas, que era a condição antiga.
  const descargas = descargaFechaOBloco(
    semanasDeDescarga(semanas, regraClinicaDoPlano(input)?.modProgressao?.descargaCadaSemanas),
    duracoes,
  );
  const rampa = rampaNoMacro(modelo, duracoes, descargas, progride);
  const mesociclos: Mesociclo[] = [];
  let cursor = 1;
  sequencia.forEach(({ fase, estendida }, m) => {
    const dur = duracoes[m];
    const ini = cursor;
    const fim = cursor + dur - 1;
    cursor = fim + 1;
    // O selo de descarga do mesociclo agora diz se ELE CONTEM alguma semana de descarga,
    // em vez de "este bloco tem 4 ou mais semanas", que era o que apagava a descarga do
    // caminho clinico inteiro. Ver CADENCIA_DELOAD.
    const comDeload = cargasDoMeso(ini, dur, descargas) < dur;
    /*
     * MANUTENÇÃO É SEGURAR NO PATAMAR ALCANÇADO, E NÃO VOLTAR AO MEIO DA FAIXA.
     *
     * As repetições da última fase eram marcadas "estavel", e "estavel" lê o MEIO da faixa
     * citada. Como o meio não tem relação nenhuma com o ponto a que a rampa das fases reais
     * tinha chegado, a fase cujo cartão promete "sustentar os ganhos" entregava dose MENOR
     * que a fase que ela continua: em 48 semanas de hipertrofia, obesidade grau 2 fechava a
     * Fase 4 em 4x7 RIR 1 e terminava o plano em 4x7 RIR 2. E as duas continuações saíam
     * idênticas entre si, semana a semana.
     *
     * Agora a continuação usa as MESMAS tendências das fases reais e congela a posição na
     * rampa no fim dela (ver CtxAlvo.patamarCongelado). Duas consequências boas de graça:
     * a ondulatória continua ondulando dentro da semana em torno do patamar, e o cartão se
     * corrige sozinho, porque `sincronizarTendencias` mede a janela e rebaixa "sobe" que
     * não sobe para "estavel". O rótulo passa a dizer o que a dose faz, sem prometer mais.
     */
    const doModelo = tendenciasDoModelo(modelo, { tv: "sobe", ti: "sobe" });
    const tv: Tendencia = doModelo.tv;
    const ti: Tendencia = doModelo.ti;
    /*
     * O CARTÃO DA CONTINUAÇÃO NÃO PROMETE SUBIDA, PORQUE ELA NÃO SOBE.
     *
     * As tendências acima são o que o ALVO precisa saber para congelar no lugar certo da
     * rampa (com "sobe" o topo, com "reduz" o piso). O que o CARTÃO descreve é outra coisa:
     * o que a dose faz ao longo daquele bloco, e num patamar congelado ela não faz nada.
     *
     * `sincronizarTendencias` rebaixa sozinha o rótulo que não se cumpre, e cobriu quase
     * tudo aqui. Não cobriu "Retorno ao treino", cuja faixa não expressa nem %1RM nem RIR:
     * sem alvo numérico ela não tem o que medir, e por isso deixa passar. O cartão saía
     * "intensidade sobe" sobre uma dose parada, que é a mesma classe do defeito que o
     * fundador trouxe do campo ("diz linear e o gráfico sai ondulado"), ao contrário.
     *
     * "varia" é preservado: na ondulatória o movimento é DENTRO da semana, e ele continua
     * acontecendo em torno do patamar.
     */
    const noCartao = (t: Tendencia): Tendencia => (estendida && t !== "varia" ? "estavel" : t);
    mesociclos.push({
      id: nid("mes"),
      // A repetição da última fase é nomeada com honestidade ("continuação"): não é uma
      // fase clínica nova, é a mesma fase sustentada ao longo do horizonte.
      nome: estendida ? `Fase ${fase.numero}: ${fase.nome} (continuação)` : `Fase ${fase.numero}: ${fase.nome}`,
      foco: estendida ? `Continuação da fase para sustentar os ganhos ao longo do horizonte. ${fase.foco}` : fase.foco,
      semanaInicio: ini,
      semanaFim: fim,
      capacidades: [fase.objetivo, ...faixa.capacidades].slice(0, 4),
      tiposExercicio: faixa.tiposExercicio,
      // Valor provisorio: a lista final e derivada dos blocos em sincronizarTendencias. A
      // lista autorada da fase (fase.modalidades) segue nos dados da jornada, intacta.
      modalidades: [],
      // `faseJornada` autoriza a palavra "Fase" na tela e alimenta a reconciliação com a
      // fase clínica do aluno (o número real da fase, não a posição no macro recortado).
      faseJornada: fase.numero,
      // As repetições da última fase são manutenção: a dose segura no patamar alcançado, e o
      // cartão diz isso (ver `noCartao`), em vez de prometer uma subida que não acontece.
      tendenciaVolume: noCartao(tv),
      tendenciaIntensidade: noCartao(ti),
      tendenciaComplexidade: m === 0 || estendida ? "estavel" : "sobe",
      deload: comDeload,
      reavaliacao: true,
      criteriosProgressao: fase.criteriosAvancar,
      criteriosRegressao: fase.criteriosRegredir,
      parametros: fase.parametros?.length ? fase.parametros : faixa.parametros,
      microciclos: montarMicrociclos(objetivo, nivel, modelo, frequencia, ini, dur, descargas, tv, ti, {
        idade: input.idade,
        fcRepouso: input.fcRepouso,
        parametrosInvalidos: input.parametrosInvalidos,
        restricoes: restricoesDoPlano(input),
        equipamentos: input.equipamentos,
        objetivoSecundario: input.objetivoSecundario,
        regraClinica: regraClinicaDoPlano(input),
        // O perfil clinico progride no passo dele: fundido pelo mais conservador (ver comPasso).
        fatorProgressao: regraClinicaDoPlano(input)?.modProgressao?.fatorIncremento,
        // O teto de PSE do perfil chegava ao texto do semaforo e a autorregulacao da
        // execucao, mas nunca ao alvo PRESCRITO. Ver CtxAlvo.pseTeto.
        pseTeto: regraClinicaDoPlano(input)?.modProgressao?.pseTeto,
        // A dose nasce do PERFIL e da IDADE, nao so do objetivo. Ver ModDose, doseDoPerfil e
        // doseDoPerfilComIdade: idade nao e condicao, mas funde pela mesma lei conservadora.
        cargaRelativaMax: doseDoPerfilComIdade(regraClinicaDoPlano(input), input.idade)?.cargaRelativaMax,
        intervaloFolgado: doseDoPerfilComIdade(regraClinicaDoPlano(input), input.idade)?.intervaloFolgado,
        rirMinimo: doseDoPerfilComIdade(regraClinicaDoPlano(input), input.idade)?.rirMinimo,
        partirDoPiso: doseDoPerfilComIdade(regraClinicaDoPlano(input), input.idade)?.partirDoPiso,
        cargaAntesDesteMeso: rampa.total != null && progride[m] ? rampa.antes[m] : undefined,
        semanasDeCargaNoMacro: progride[m] ? rampa.total : undefined,
        // A fase que não progride é a de continuação: ela não recomeça a rampa, segura onde
        // a última fase real parou. É o mesmo `progride`, lido pela outra ponta.
        patamarCongelado: !progride[m] || undefined,
      }),
    });
  });

  // `rotuloAluno` e não `nome`: o macrociclo vai impresso no documento que chega ao aluno,
  // e ali ele é um programa ("Fortalecimento com cuidado lombar"), não um diagnóstico.
  return sincronizarTendencias({
    objetivoGeral: `${objetivo} (${nivel}): ${grupo.rotuloAluno}`,
    semanas,
    mesociclos,
  });
}

/* ----------------------------------- Entrada pública ----------------------------------- */

export function gerarPlano(input: GerarPlanoInput): PlanoGerado {
  const { principal, alternativa, sugeridoPeloMotor } = escolherModelos(input);

  const macroPrincipal =
    montarMacrocicloGrupo(input, principal) ?? montarMacrocicloGenerico(input, principal);
  /*
   * A ALTERNATIVA SÓ EXISTE SE ELA FOR OUTRO PLANO.
   *
   * O Filipe trocou para a alternativa, viu o título, o resumo e a explicação mudarem, e o
   * GRÁFICO continuar igual. O gráfico estava certo: o plano é que era o mesmo. Medido em
   * 18/08/2026, no cartesiano de objetivo x nível x condição, 138 de 540 pares de modelos
   * saem BYTE-IDÊNTICOS, e todos os 138 estão dentro do trio ondulatória, flexível e
   * autorregulada, que hoje recebem as mesmas tendências e a mesma rotação de ênfase. Como
   * "flexivel" é a alternativa padrão de quem tem condição clínica e "ondulatoria" é a
   * principal de força e hipertrofia em treinados, o par que o Filipe viu era exatamente
   * esse.
   *
   * Oferecer como "uma alternativa que a evidência sustenta" um plano idêntico ao principal é
   * afirmar uma escolha que não existe. Enquanto os três modelos não forem diferenciados de
   * verdade (decisão clínica, não de código), a alternativa cai para o próximo modelo que
   * PRODUZA outro plano, e some quando nenhum produzir.
   */
  const assinaturaDoMacro = (m: Macrociclo) =>
    m.mesociclos
      .flatMap((me) => me.microciclos)
      .map(
        (w) =>
          `${w.semana}:${w.tipo}:` +
          w.sessoes
            .map((se) =>
              se.blocos
                .map(
                  (b) =>
                    `${b.nome}|${b.seriesAlvo}x${b.repsAlvo}r${b.rirAlvo}i${b.intervaloAlvoSeg}d${b.duracaoAlvoMin}p${b.rpeAlvo}`,
                )
                .join(","),
            )
            .join(";"),
      )
      .join(String.fromCharCode(10));

  const alternativaQueDifere = (() => {
    if (!alternativa) return undefined;
    const daPrincipal = assinaturaDoMacro(macroPrincipal);
    // Ordem de tentativa: a escolhida primeiro, depois os demais modelos na ordem do catálogo,
    // sem repetir a principal. Determinístico, como todo o resto do motor.
    const candidatos = [alternativa, ...MODELOS_PERIODIZACAO.map((m) => m.id)].filter(
      (id, i, arr) => id !== principal && arr.indexOf(id) === i,
    );
    for (const id of candidatos) {
      const macro = montarMacrocicloGrupo(input, id) ?? montarMacrocicloGenerico(input, id);
      if (assinaturaDoMacro(macro) !== daPrincipal) return { id, macro };
    }
    return undefined;
  })();

  const macroAlt = alternativaQueDifere?.macro;
  const modeloAlternativo = alternativaQueDifere?.id;

  const modP = getModelo(principal);
  const faixa = getFaixa(input.objetivo);
  const grupo = input.grupoEspecial ? getSpecialGroup(input.grupoEspecial) : undefined;

  /*
   * A ESCOLHA DA MODALIDADE DO CARDIO É AUDITÁVEL, como toda decisão deste motor.
   *
   * A primeira versão de `modalidadesPreferidas` trocava a caminhada pela modalidade que a
   * evidência da condição coloca à frente e NÃO DIZIA NADA: o raciocínio não explicava a
   * troca e a referência que a sustenta não entrava na bibliografia do plano. A frase que
   * está escrita neste mesmo arquivo, "um plano que a aplica em silêncio não é auditável",
   * valia contra a própria feature.
   *
   * O porquê vem da CONDIÇÃO QUE DECLAROU a modalidade vencedora, e não do motivo fundido de
   * todas: a fusão concatena os motivos de quem declara qualquer campo aeróbio (formato,
   * banda), e imprimir esse aglomerado explicaria a decisão errada. O texto não nomeia a
   * condição, porque o raciocínio é impresso no documento do aluno.
   */
  const regraDoPlano = regraClinicaDoPlano(input);
  // Uma leitura só, usada pela bibliografia e pelo raciocínio: as duas precisam concordar.
  const indicacaoIsoDoPlano = indicacaoDoMacro(macroPrincipal);
  const modalidadeEscolhida = modalidadeAerobia("m-caminhada", regraDoPlano, input.equipamentos);
  const trocaDeCardio =
    modalidadeEscolhida !== "m-caminhada"
      ? slugsClinicosDoPlano(input)
          .map((s) => groupGpsRules[s]?.modAerobio)
          .find((m) => m?.modalidadesPreferidas?.includes(modalidadeEscolhida))
      : undefined;
  // O formato intervalado também é decisão com fonte: quando o bloco sai intervalado, quem
  // indicou entra na bibliografia, pelo mesmo princípio.
  const refsDoFormato =
    formatoAerobio(regraDoPlano) === "Intervalado"
      ? slugsClinicosDoPlano(input).flatMap((s) => {
          const m = groupGpsRules[s]?.modAerobio;
          return m?.intervaladoIndicado ? (m.refId ?? []) : [];
        })
      : [];

  const refIds = Array.from(
    new Set([
      ...modP.refIds,
      ...faixa.refIds,
      // Onda F: o complemento aeróbio e a flexibilidade citam garber-2011; entram na
      // bibliografia do plano para a referência aparecer resolvida no PDF e na tela.
      ...(faixa.complementoAerobio?.refIds ?? []),
      ...(faixa.flexibilidade?.refIds ?? []),
      // O aviso de dose por faixa etária cita a metanálise no raciocínio; a referência entra
      // na bibliografia do plano para o PDF resolver, com as limitações na própria nota.
      ...(input.idade != null && input.idade >= 65 ? ["borde-idoso-dose-2015"] : []),
      // A evidencia que escolheu o cardio e o formato deste plano, resolvida no PDF.
      ...(trocaDeCardio?.refId ?? []),
      ...refsDoFormato,
      // O ensaio que define a flexível entra na bibliografia dos modelos de ordem aberta: é ele
      // que sustenta que a dose semanal é equiparada e que o que muda é quem escolhe a ordem.
      ...(principal === "flexivel" || principal === "autorregulada" || alternativa === "flexivel" || alternativa === "autorregulada"
        ? ["colquhoun-flexivel-2017"]
        : []),
      /*
       * As referências do isométrico vêm da INDICAÇÃO que disparou, e não de uma lista fixa.
       *
       * Aqui havia as quatro referências de pressão arterial, cravadas, para qualquer sessão
       * isométrica. Com a porta de desempenho isso passaria a citar metanálise de pressão
       * embaixo de uma sessão de tendão. Cada indicação já declara o que a sustenta, incluindo
       * o contrapeso negativo: um plano que cita só o que confirma não é auditável.
       */
      ...(indicacaoIsoDoPlano?.refIds ?? []),
    ]),
  );

  const raciocinio = [
    `Modelo principal: ${modP.nome}. ${modP.resumo}`,
    /*
     * O MODELO DE ORDEM ABERTA EXPLICA POR QUE O GRÁFICO NÃO MUDA.
     *
     * O Filipe: "se deixa só o mesmo gráfico para o profissional é como se você não alterou
     * nada". Ele tem razão. A curva semanal da flexível é igual à da ondulatória de PROPÓSITO,
     * porque no ensaio que compara os dois de frente (`colquhoun-flexivel-2017`) intensidade
     * e volume não diferiram entre os grupos: é isso que a flexível é. Mas uma igualdade
     * deliberada que ninguém explica se lê como uma troca que não aconteceu.
     *
     * A frase entra no RACIOCÍNIO, e não só na tela, porque é ele que vai para o PDF assinado
     * e para o documento do aluno. O gráfico tem o mesmo aviso ao lado dele.
     */
    principal === "flexivel" || principal === "autorregulada"
      ? `Sobre a leitura do gráfico neste modelo: a curva semanal de volume e intensidade é a MESMA da periodização ondulatória, e isso é do modelo, não uma troca que faltou. O que muda aqui é a ORDEM das sessões dentro da semana, escolhida no dia conforme a agenda e a resposta do aluno; no ensaio que compara os dois de frente, intensidade e volume não diferiram entre os grupos e os ganhos foram semelhantes. A diferença aparece nas sessões, que vêm por letra em vez de número porque a semana é um conjunto e não uma sequência, e na nota de cada semana. Se um dia cair, a escolha de qual sessão manter é sua, pela ênfase que mais protege o resultado deste aluno.`
      : "",
    // Quando a escolha foi do profissional e difere da do motor, o plano diz as duas.
    // Silenciar a divergência transformaria a ferramenta em carimbo da escolha dele.
    sugeridoPeloMotor && sugeridoPeloMotor !== principal
      ? `Sobre a escolha do modelo: este modelo foi escolhido por você. Pelo objetivo, nível e condição, o ponto de partida do sistema seria ${getModelo(sugeridoPeloMotor).nome}, que fica como alternativa para comparar.`
      : "",
    grupo
      ? // O raciocínio também é impresso para o aluno, então ele nomeia o programa, não a
        // condição. A condição segue à vista do profissional no selo do plano e no perfil.
        `Sobre a base do plano: a jornada de fases do programa ${grupo.rotuloAluno} é o esqueleto do macrociclo, e os cuidados e parâmetros dessa jornada são sobrepostos.`
      : `Sobre a base do plano: escolha por objetivo (${input.objetivo}) e nível (${input.nivel}).`,
    // O plano DIZ o que considerou. O Filipe cadastrou hipertensão estágio 2 e não achou a
    // condição em lugar nenhum do plano; o motor de fato a ignorava, e mesmo depois de
    // passar a usá-la, um plano que a aplica em silêncio não é auditável.
    frasePerfilClinico(input),
    trocaDeCardio
      ? `Sobre o cardio: ${getModalidade(modalidadeEscolhida)?.nome ?? "a modalidade escolhida"} vem à frente neste perfil. ${trocaDeCardio.motivo}`
      : "",
    /*
     * O PLANO DIZ QUANDO SAIU DO OBJETIVO, porque antes ele saía calado.
     *
     * Quando o pool específico do objetivo não alcança a frequência pedida, a seleção cai
     * para o catálogo do nível (ver `foraDoObjetivo` na seleção). Medido na varredura: em 6
     * de 18 combinações de objetivo e equipamento isso acontecia sem sinal nenhum, e no pior
     * caso quatro dos cinco exercícios de um plano de Força não eram de força.
     *
     * A frase não muda o plano, e é de propósito: a alternativa seria gerar sessão vazia. O
     * que ela faz é devolver a decisão a quem assina, dizendo o que faltou e por quê, na
     * mesma linha do aviso de horizonte curto logo abaixo.
     */
    (() => {
      const cons = consequenciasDoPlano(input);
      const fora = cons.foraDoObjetivo;
      if (!fora.length) return "";
      // Dois motivos diferentes para um exercício de outro objetivo entrar, e a frase precisa
      // dizer qual foi: faltou catálogo (o pool do objetivo não alcançava as vagas) ou
      // cobertura de família (o catálogo não marca ombro, braço ou core para este objetivo, e
      // uma semana de força sem essas famílias é a reclamação "cadê o braço?").
      const cabeca = `Sobre a seleção: ${fora.length === 1 ? "um exercício não é específico" : `${fora.length} exercícios não são específicos`} do objetivo (${fora.join(", ")}). `;
      if (cons.faltouCatalogo)
        return (
          cabeca +
          `O catálogo disponível para este objetivo, neste nível e com os equipamentos declarados não alcançava a frequência pedida, ` +
          `então entraram exercícios seguros do nível para completar a sessão. Ampliar os equipamentos declarados costuma resolver.`
        );
      return (
        cabeca +
        `Entraram para a semana cobrir as famílias musculares que o catálogo não marca para este objetivo, ` +
        `porque uma semana de força sem ombro, braço ou core não é um treino completo. Passaram pelos mesmos filtros de segurança, equipamento e restrição de todos os outros.`
      );
    })(),
    /*
     * O PLANO ACRESCENTOU SESSÕES E O TEXTO NÃO CONTAVA.
     *
     * Achado na segunda varredura de consistência: o protocolo isométrico entrava com três
     * sessões por semana, com dose fechada e uma cautela de pressão arterial, e o raciocínio
     * (que é o que o profissional lê para entender e assinar o plano, e que também vai
     * impresso ao aluno) não dizia uma palavra sobre ele. A maior mudança estrutural do
     * plano era a única que o texto não explicava.
     *
     * A frase conta o número REAL de sessões, lido do macrociclo já construído, e não a
     * intenção do gerador: é a mesma disciplina do resto deste raciocínio.
     *
     * Não nomeia a condição, porque este texto também chega ao aluno, e a regra da casa é
     * que documento de aluno não carrega rótulo clínico. Falar de pressão arterial é
     * necessário para a segurança e não é rótulo: é o que o aluno precisa saber para
     * executar.
     */
    (() => {
      const porSemana = macroPrincipal.mesociclos[0]?.microciclos[0]?.sessoes.filter((s) =>
        s.blocos.some((b) => b.tipo === "isometrico"),
      ).length;
      if (!porSemana) return "";
      const ind = indicacaoIsoDoPlano;
      if (!ind) return "";
      return (
        `Sobre a sessão isométrica: ela entra em ${porSemana} ${porSemana === 1 ? "sessão própria" : "sessões próprias"} por semana, ` +
        `separadas do treino, com ${ind.protocolo.series} contrações de ${ind.protocolo.contracao} e ${ind.protocolo.descanso} de descanso entre elas, ` +
        `porque foi assim que o protocolo foi testado. ` +
        ind.raciocinio
      );
    })(),
    /*
     * Horizonte abaixo do que a evidência da jornada mediu.
     *
     * A frase NÃO nomeia a condição, porque este texto também é impresso para o aluno, e a
     * regra da casa é que documento de aluno não carrega rótulo clínico. Ela também não
     * muda o plano: quem decide o horizonte é o profissional, e alongar em silêncio seria
     * decidir no lugar dele. O motor só avisa.
     */
    (() => {
      const min = regraClinicaDoPlano(input)?.horizonteMinimoSemanas;
      return min && input.semanas < min
        ? `Sobre a duração: nesta jornada, o efeito no desfecho principal foi medido em acompanhamentos de ${min} semanas ou mais, e este plano tem ${input.semanas}. A dose continua correta; o que muda é o tempo de exposição, então considere encadear um novo ciclo ao fim deste.`
        : "";
    })(),
    /*
     * A FAIXA ETÁRIA CHEGA AO RACIOCÍNIO, do mesmo jeito que o horizonte: informa, cita e
     * não muda a dose em silêncio.
     *
     * Este parágrafo ERA um aviso, e virou um RELATO, porque o motor mudou embaixo dele.
     *
     * Quando foi escrito, a idade não tocava a dose de força: a evidência
     * (`borde-idoso-dose-2015`) entrava "ditada ao profissional", e a decisão de calibrar
     * ficava com ele. Desde a camada de dose por idade (`lib/gps/esforco.ts`), o plano JÁ
     * aperta sozinho: a partir dos 65 ele guarda pelo menos 3 repetições de reserva, e a
     * varredura mediu o efeito (Força de intermediário sai RIR 3 a 4 aos 70 anos contra 2 a
     * 4 aos 40).
     *
     * Manter o texto antigo seria pedir ao profissional que fizesse uma redução que o motor
     * já fez, e ele poderia aplicá-la duas vezes. Agora a frase diz o que aconteceu ANTES de
     * dizer o que ele decide, que é a ordem honesta.
     *
     * O corte é 65 porque foi a população MEDIDA pelo estudo; a faixa "pessoa idosa" da tela
     * começa aos 60, e esticar um achado para quem o estudo não cobriu seria outra invenção.
     */
    (() => {
      if (input.idade == null || input.idade < IDADE_DOSE_PROPRIA) return "";
      const evidencia = `Numa metanálise de 25 ensaios com pessoas de ${IDADE_DOSE_PROPRIA} anos ou mais, o maior ganho de força veio com intensidade em torno de 70 a 79% de 1RM, ou seja, moderada a alta e não máxima.`;
      const piso = pisoDeReservaDoObjetivo(faixa);
      return piso != null && piso >= RIR_MINIMO_IDADE
        ? `Sobre a dose nesta faixa etária: a faixa citada deste objetivo já pede pelo menos ${piso} repetições de reserva nas séries principais, ou seja, já cumpre o piso de ${RIR_MINIMO_IDADE} da faixa etária, então o piso da idade não teve o que apertar e esta dose é a mesma que sairia para um aluno mais novo. ${evidencia} A folga já está na faixa; a calibragem da carga dentro dela segue sendo sua.`
        : `Sobre a dose nesta faixa etária: o plano já entra mais conservador, guardando pelo menos ${RIR_MINIMO_IDADE} repetições de reserva nas séries principais, porque a partir de ${IDADE_DOSE_PROPRIA} anos essa faixa tem dose própria na literatura. ${evidencia} A reserva já vem ajustada; a calibragem da carga dentro dela segue sendo sua.`;
    })(),
    `Sobre os números do plano: as faixas de séries, repetições, intensidade e intervalo seguem as diretrizes citadas, sempre como faixa e sob o seu critério. ${faixa.ressalva}`,
    alternativa
      ? `Sobre a alternativa: ${getModelo(alternativa).nome} é oferecida como segunda estratégia porque a evidência sustenta mais de uma; as diferenças costumam ser pequenas quando o volume é equiparado.`
      : "",
  ]
    .filter(Boolean)
    /*
     * CADA PARTE É UM TÓPICO, E O SEPARADOR É QUEM DIZ ISSO.
     *
     * O raciocínio sempre foi uma LISTA de assuntos independentes (o modelo, o perfil de
     * cuidado, o cardio, o isométrico, a duração, a dose por idade). Coladas por um espaço,
     * as doze viravam um bloco corrido de vinte linhas na aba "Na prática", e o Filipe pegou:
     * o conteúdo estava certo e ninguém achava nada dentro dele.
     *
     * A linha em branco entre as partes não muda uma palavra do texto: ela só devolve ao
     * leitor a estrutura que o gerador já tinha. Quem imprime (PDF do plano, prontuário) e a
     * tela quebram nela, e cada parte já começa pelo próprio assunto ("Sobre o cardio:",
     * "Sobre a duração:"), que vira o título do tópico. Ver `topicosDoRaciocinio`.
     */
    .join("\n\n");

  return {
    principal: macroPrincipal,
    alternativa: macroAlt,
    modeloId: principal,
    modeloAltId: modeloAlternativo,
    // O título vive aqui, junto do resto do texto que vai impresso, para que a regra de
    // linguagem do documento (programa, nunca diagnóstico) seja verificável num lugar só.
    titulo: grupo
      ? `${grupo.rotuloAluno}: ${input.semanas} semanas`
      : `${input.objetivo}: ${input.semanas} semanas`,
    raciocinio,
    refIds,
  };
}