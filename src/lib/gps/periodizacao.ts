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
} from "@/data/periodizacao";
import { exercises } from "@/data/exercises";
import { getModalidade } from "@/data/modalities";
import { getSpecialGroup } from "@/data/specialGroups";
import { combineRules, groupGpsRules, type GroupGpsRule } from "@/lib/gps/groupRules";
import { doseDoPerfilComIdade } from "@/lib/gps/esforco";
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
   * sem inventar zona. Não alteram a força nem o restante da geração (determinismo mantido).
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
    return `Este plano considerou um perfil de cuidado${lista}, e as faixas de dose foram ajustadas por ele.${teto}`;
  }
  return `Este plano considerou ${slugs.length} perfis de cuidado ao mesmo tempo${lista}, e onde eles divergem vale sempre o mais conservador.${teto}`;
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
  const pool = doObjetivo.length >= n ? doObjetivo : exercises.filter((e) => noNivel(e) && ehForca(e) && equipOk(e));

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

  return {
    escolhidos: seguros.slice(0, Math.max(n, 1)),
    descartados,
    rebaixados: comPeso
      .filter((a) => a.pesoCond > 0)
      .map((a) => ({ slug: a.e.slug, nome: a.e.nome ?? a.e.slug, motivo: a.motivosCond.join("; ") })),
    elegiveis: seguros.length,
    faltouCatalogo: seguros.length < n,
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
  const sel = selecionarExercicios(
    input.objetivo,
    input.nivel,
    Math.max(4, input.frequencia + 2),
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
const ISO_PROTOCOLO = { series: 4, contracao: "2 min", descanso: "2 min" } as const;
const ISO_SESSOES_POR_SEMANA = 3;

/**
 * Qual isométrico oferecer, se algum sobreviver aos filtros de sempre.
 *
 * Não há atalho: equipamento precisa estar declarado (peso corporal sempre está) e a posição
 * do exercício não pode ser uma das que a condição pede para evitar. Entre os que passam,
 * vence o AGACHAMENTO NA PAREDE quando ele estiver entre eles, porque é o submodo que a rede
 * de `edwards-exercicio-pa-2023` aponta como mais efetivo para a sistólica; os demais são
 * alternativa quando ele não passa (por exemplo, condição que evita a posição em pé).
 */
function exercicioIsometrico(
  equipamentos: string[] | undefined,
  regraClinica: GroupGpsRule | undefined,
): (typeof exercises)[number] | undefined {
  const elegiveis = exercises.filter((e) => {
    if (!e.doseIsometrica) return false;
    const equipOk = !equipamentos?.length || e.equipamento === "Peso corporal" || equipamentos.includes(e.equipamento);
    if (!equipOk) return false;
    const posicao = e.restricaoPerfil?.posicao;
    if (posicao && regraClinica?.posicoesEvitar?.includes(posicao)) return false;
    if (regraClinica?.evitarMembrosAcimaDoCoracao && e.restricaoPerfil?.membrosAcimaDoCoracao) return false;
    return true;
  });
  return elegiveis.find((e) => e.slug === "agachamento-isometrico-parede") ?? elegiveis[0];
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
  const selecao = selecionarExercicios(objetivo, nivel, Math.max(4, (frequenciaDoPlano ?? frequencia) + 2), restricoes, objetivoSecundario, regraClinica, equipamentos);
  const escolhidos = selecao.escolhidos;
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

  for (let i = 0; i < frequencia; i++) {
    const enfase = enfases?.[i % enfases.length];
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

    // 3 a 4 exercícios de força por sessão, girando a lista de escolhidos.
    const porSessao = objetivo === "Emagrecimento" ? 3 : 4;
    /*
     * Pool vazio não pode derrubar a geração. Antes do filtro de equipamentos isso era
     * inalcançável (o catálogo inteiro no nível sempre sobrava); com ele, uma lista
     * excêntrica (só Piscina, por exemplo) zera a força. O plano sai com o aeróbio que
     * couber e `faltouCatalogo` acende, que é o sinal que a tela usa para mandar rever
     * equipamentos, em vez de um índice por zero estourar aqui.
     */
    for (let j = 0; j < porSessao && escolhidos.length > 0; j++) {
      const ex = escolhidos[(i * porSessao + j) % escolhidos.length];
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

    /*
     * ISOMÉTRICO PARA PRESSÃO ARTERIAL, e a cautela vem antes do benefício.
     *
     * Entra por CONDIÇÃO (`GroupGpsRule.isometrico`), nunca por objetivo, porque a evidência
     * é específica de pressão arterial. Fica no FIM da sessão, somando ao que o objetivo já
     * mandou, do mesmo jeito que a ênfase de modalidade soma sem tirar nada.
     *
     * ## Por que a dose é literal e não passa pelo motor de alvo
     *
     * Todo o resto do plano recebe faixa e o motor escolhe o ponto da semana. Aqui não:
     * `wiles-agachamento-parede-2016` publicou um protocolo FECHADO (4 contrações de 2 min,
     * 2 min de descanso, 3 vezes por semana, 48 h entre sessões) e interpolar dentro dele
     * inventaria um protocolo que ninguém testou. Por isso o bloco não chama `alvoSemana` e
     * não progride: ele repete o protocolo, que é o que foi medido.
     *
     * ## As três portas de segurança, nesta ordem
     *
     * 1. A condição precisa DECLARAR indicação, e o `evitar` de qualquer condição fundida
     *    derruba (a fusão já resolveu isso antes de chegar aqui).
     * 2. O exercício precisa sobreviver aos MESMOS filtros de todo mundo: equipamento
     *    declarado e restrição do perfil. Não há atalho para o isométrico.
     * 3. O texto do bloco diz que a pressão SOBE durante a contração e que a respiração fica
     *    solta, porque é o que a medida mostra e é o que o profissional precisa ler antes de
     *    aplicar.
     *
     * A frequência do protocolo (3x/semana) é o teto: num plano de 5 sessões ele entra em 3.
     */
    const iso = regraClinica?.isometrico;
    if (iso?.indicado && !iso.evitar && i < ISO_SESSOES_POR_SEMANA) {
      const ex = exercicioIsometrico(equipamentos, regraClinica);
      if (ex) {
        blocos.push({
          id: nid("blk"),
          tipo: "isometrico",
          exercicioSlug: ex.slug,
          nome: ex.nome,
          series: String(ISO_PROTOCOLO.series),
          duracao: ISO_PROTOCOLO.contracao,
          intervalo: ISO_PROTOCOLO.descanso,
          intensidade:
            "Pela percepção de esforço: a contração inteira precisa fechar sem queda visível de força no fim. Ajuste o ângulo (ou a pega) em vez de encurtar o tempo.",
          recuperacao: ISO_PROTOCOLO.descanso,
          observacao:
            "A pressão arterial SOBE durante a contração sustentada, proporcional à carga: respiração solta do começo ao fim, sem prender o ar. Só aplique com a liberação do dia em ordem. O protocolo foi testado como sessão própria, então ele também pode ser feito em separado, 3 vezes por semana, com 48 h entre as sessões.",
        });
      }
    }

    sessoes.push({
      id: nid("ses"),
      nome: enfase ? `Sessão ${i + 1} (${enfase.rotulo})` : `Sessão ${i + 1}`,
      foco: enfase ? `Ênfase ${enfase.rotulo}` : faixa.capacidades[0],
      blocos,
      // Fecho de flexibilidade da sessão (variabilidade), citado; o texto vem do objetivo.
      fecho: faixa.flexibilidade?.texto,
    });
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
    semanas.push({
      id: nid("mic"),
      semana,
      tipo: ehDeload ? "deload" : "carga",
      frequencia: freqSemana,
      sessoes: montarSessoes(objetivo, nivel, freqSemana, modelo, restricoesPlano, ctx, objetivoSecundario, regraClinica, equipamentos, frequencia),
      nota: ehDeload ? "Semana de descarga: reduza volume e intensidade para recuperar." : undefined,
      objetivo: objetivoDaSemana(ctx.tipoSemana, tendenciaVolume, tendenciaIntensidade),
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
  const descargas = semanasDeDescarga(semanas, regraClinicaDoPlano(input)?.modProgressao?.descargaCadaSemanas);
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
  const descargas = semanasDeDescarga(semanas, regraClinicaDoPlano(input)?.modProgressao?.descargaCadaSemanas);
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
  const macroAlt = alternativa
    ? (montarMacrocicloGrupo(input, alternativa) ?? montarMacrocicloGenerico(input, alternativa))
    : undefined;

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
    ]),
  );

  const raciocinio = [
    `Modelo principal: ${modP.nome}. ${modP.resumo}`,
    // Quando a escolha foi do profissional e difere da do motor, o plano diz as duas.
    // Silenciar a divergência transformaria a ferramenta em carimbo da escolha dele.
    sugeridoPeloMotor && sugeridoPeloMotor !== principal
      ? `Este modelo foi escolhido por você. Pelo objetivo, nível e condição, o ponto de partida do sistema seria ${getModelo(sugeridoPeloMotor).nome}, que fica como alternativa para comparar.`
      : "",
    grupo
      ? // O raciocínio também é impresso para o aluno, então ele nomeia o programa, não a
        // condição. A condição segue à vista do profissional no selo do plano e no perfil.
        `A jornada de fases do programa ${grupo.rotuloAluno} é o esqueleto do macrociclo, e os cuidados e parâmetros dessa jornada são sobrepostos.`
      : `Escolha por objetivo (${input.objetivo}) e nível (${input.nivel}).`,
    // O plano DIZ o que considerou. O Filipe cadastrou hipertensão estágio 2 e não achou a
    // condição em lugar nenhum do plano; o motor de fato a ignorava, e mesmo depois de
    // passar a usá-la, um plano que a aplica em silêncio não é auditável.
    frasePerfilClinico(input),
    trocaDeCardio
      ? `Sobre o cardio: ${getModalidade(modalidadeEscolhida)?.nome ?? "a modalidade escolhida"} vem à frente neste perfil. ${trocaDeCardio.motivo}`
      : "",
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
     * Até aqui a idade só entrava na zona de frequência cardíaca do aeróbio, e um plano para
     * 70 anos saía com a mesma dose de força de um plano para 30. A rodada de evidência
     * (borde-idoso-dose-2015) achou dose-resposta específica para 65 anos ou mais, mas o
     * número dela fala %1RM, e os objetivos que treinam por reserva de repetições não têm
     * onde receber um teto de %1RM sem inventar conversão. Então a evidência entra do único
     * jeito honesto que o vocabulário atual permite: dita ao profissional, com a fonte na
     * bibliografia do plano, e a decisão de calibrar fica com ele.
     *
     * O corte é 65 porque foi a população MEDIDA pelo estudo; a faixa "pessoa idosa" da tela
     * começa aos 60, e esticar um achado para quem o estudo não cobriu seria outra invenção.
     */
    input.idade != null && input.idade >= 65
      ? `Sobre a dose nesta faixa etária: numa metanálise de 25 ensaios com pessoas de 65 anos ou mais, o maior ganho de força veio com intensidade em torno de 70 a 79% de 1RM. Use essa referência ao calibrar as cargas, junto com a reserva de repetições prescrita; a decisão segue sendo sua.`
      : "",
    `As faixas de séries, repetições, intensidade e intervalo seguem as diretrizes citadas, sempre como faixa e sob o seu critério. ${faixa.ressalva}`,
    alternativa
      ? `Uma alternativa (${getModelo(alternativa).nome}) é oferecida porque a evidência sustenta mais de uma estratégia; as diferenças costumam ser pequenas quando o volume é equiparado.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    principal: macroPrincipal,
    alternativa: macroAlt,
    modeloId: principal,
    modeloAltId: alternativa,
    // O título vive aqui, junto do resto do texto que vai impresso, para que a regra de
    // linguagem do documento (programa, nunca diagnóstico) seja verificável num lugar só.
    titulo: grupo
      ? `${grupo.rotuloAluno}: ${input.semanas} semanas`
      : `${input.objetivo}: ${input.semanas} semanas`,
    raciocinio,
    refIds,
  };
}
