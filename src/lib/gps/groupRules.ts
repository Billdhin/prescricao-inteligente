/**
 * Regras do GPS por grupo/condição: quando um grupo especial está no contexto
 * da prescrição, ele já "traz" as próprias cautelas — restrição musculoesquelética
 * pré-selecionada (quando faz sentido) + cuidados automáticos exibidos na etapa
 * de restrições + penalizações determinísticas no ranqueamento (transparentes
 * no breakdown da justificativa). Conteúdo educacional e prudente — não é
 * conduta clínica.
 */

import type { GroupRuleInput } from "./engine";
import type { RestricaoTag } from "./restricoes";
import type { Exercise } from "@/data/types";
import { fundirMonitoramento, type EfeitoMonitoramento } from "@/data/farmacos";
import { ORDEM_BANDA, type BandaAerobia } from "@/data/periodizacao";

/**
 * MODIFICADOR de progressão por perfil clínico (onda MP-6, critério 11): o quanto este grupo
 * progride mais devagar e com teto de esforço menor. Aplicado pelo ajuste/tubo responsivo
 * (src/lib/gps/autorregulacao.ts) para que idoso/obeso/hipertenso, etc., subam com passo reduzido
 * e margem maior. A DIREÇÃO (teto menor, progressão gradual, sem esforço máximo) vem das
 * diretrizes citadas em `refs`; a MAGNITUDE (os números abaixo) é um padrão CONSERVADOR declarado
 * (`cautela: true`), no mesmo espírito das penalidades/complexidadeMax deste arquivo, sob a
 * palavra final do profissional. Não há RCT cravando estes multiplicadores.
 */
export interface ModProgressao {
  /**
   * Teto de RPE (escala 0 a 10) **DO BLOCO AERÓBIO**. Só é aplicado dentro de
   * `alvoAerobioSemana`; a dose de FORÇA é limitada por `modDose.rirMinimo` e
   * `modDose.cargaRelativaMax`, que são outros campos.
   *
   * A precisão importa e faltava. O campo se documentava como "teto de RPE" sem dizer de
   * qual modalidade, e o resultado foi que ninguém percebeu que este arquivo JÁ SABE
   * separar as duas coisas. O fundador levantou justamente isso: existe condição em que o
   * aeróbio pede intensidade contida e o resistido não pede, e ele achava que a plataforma
   * não conseguia expressar. Conseguia; estava escondido atrás de um nome ambíguo.
   *
   * Então, na prática: condição que declara `pseTeto` e NÃO declara `rirMinimo` está
   * dizendo "segure o aeróbio, deixe a força seguir a faixa do objetivo". É uma frase
   * clínica legítima e agora ela é dizível de propósito, e não por acidente.
   */
  pseTeto?: number;
  /** fração do incremento normal (0..1): perfil que progride num passo menor */
  fatorIncremento?: number;
  /** descarga mais frequente: sugerir descarga a cada N semanas (menor = mais frequente) */
  descargaCadaSemanas?: number;
  /** por que este perfil progride mais devagar (texto curto, sem travessão) */
  motivo: string;
  /** true quando a magnitude é cautela DECLARADA (a direção vem das refs; o número é conservador) */
  cautela?: boolean;
  /** ids de referencias.ts que sustentam a DIREÇÃO do modificador */
  refId?: string[];
}

/**
 * A DOSE DO TREINO NASCE DO PERFIL, NÃO SÓ DO OBJETIVO.
 *
 * Este é o modificador que faltava. Até aqui a condição clínica mudava QUAIS exercícios
 * entravam, o teto de PSE do aeróbio e o PASSO da progressão, e não tocava em série,
 * repetição, intervalo nem carga relativa. Medido, na semana 1, com o mesmo objetivo
 * (Emagrecimento) e o mesmo nível (Iniciante):
 *
 *   sem condição ......... 3x15, intervalo 30 s
 *   obesidade grau I ..... 3x15, intervalo 30 s
 *   obesidade grau III ... 3x15, intervalo 30 s
 *   hipertensão est. 1 ... 3x15, intervalo 30 s
 *   hipertensão est. 2 ... 3x15, intervalo 30 s
 *
 * Cinco perfis clinicamente distintos recebendo a mesma dose, com o intervalo no PISO da
 * faixa (30 s), que é o extremo mais metabólico dela. O consenso da EAPC com o Conselho de
 * Hipertensão da ESC (`hanssen-2022`) conclui justamente o contrário: a resposta difere
 * conforme o nível inicial de pressão, e há evidência para prescrever segundo ele.
 *
 * ## O que cada campo pode e não pode afirmar
 *
 * `cargaRelativaMax` carrega NÚMERO PUBLICADO. Só entra onde existe faixa medida: na
 * hipertensão é 80% de 1RM, teto da banda de 60 a 80% em que `henkin-2023` demonstrou a
 * queda de 6,98 mmHg de sistólica. Acima disso não há efeito medido, só risco.
 *
 * `intervaloFolgado` NÃO carrega número clínico novo, e é honesto sobre isso: é
 * consistência interna. Um perfil que declara teto de esforço não pode, na mesma
 * prescrição, receber o intervalo que MAXIMIZA o esforço para a mesma carga. Ele apenas
 * move o alvo para a metade superior da faixa que o objetivo já cita, sem sair dela.
 *
 * `rirMinimo` é a mesma ideia na dimensão da proximidade da falha.
 *
 * O que este modificador deliberadamente NÃO faz: criar uma segunda banda de %1RM para
 * separar hipertensão estágio 1 de estágio 2. `hanssen-2022` sustenta personalizar pelo
 * nível inicial mas declara lacunas de pesquisa consideráveis, e não fornece as duas
 * bandas. Inventar um percentual para parecer mais preciso seria o oposto do que este
 * produto promete, e isso continua valendo.
 *
 * O que ele passou a fazer: os dois estágios declaram reserva mínima de repetições, que é
 * o instrumento com que esta casa controla esforço. Antes disso, o teto de carga da
 * hipertensão era o único número publicado específico de condição do motor e não mordia em
 * plano nenhum, porque só uma faixa do produto expressa %1RM.
 *
 * E uma tentativa que a medição derrubou, registrada porque a lição vale para o próximo
 * campo: tentei reserva 3 no estágio 2, um degrau acima do estágio 1, para a escada de
 * gravidade aparecer também na força. O `check:progressao` reprovou. A faixa de reserva vai
 * de 1 a 3, então mínimo 3 prende o alvo no teto e a linha de intensidade do gráfico sai
 * reta. O degrau a mais não deixava o treino mais cauteloso, deixava o treino sem
 * progressão. **Reserva mínima só funciona como cautela enquanto sobra espaço de variação
 * dentro da faixa citada**, e essa é a condição de uso do campo.
 */
/**
 * MODULAÇÃO DO BLOCO AERÓBIO PELA CONDIÇÃO.
 *
 * Nasceu de um buraco medido: o formato do bloco aeróbio era a string fixa "Contínuo" em
 * `periodizacao.ts`, então o motor era INCAPAZ de prescrever intervalado, para qualquer
 * aluno e qualquer condição. O produto até descrevia a alternativa intervalada no texto da
 * observação, ou seja, contava ao profissional uma opção que ele mesmo nunca montava.
 *
 * Duas portas, e não uma, porque as duas direções existem na clínica: há condição com
 * evidência de benefício no intervalado e há condição em que ele é desaconselhado. A fusão
 * é conservadora como o resto do arquivo: `intervaladoEvitar` de QUALQUER condição vence
 * `intervaladoIndicado` de todas as outras.
 */
export interface ModAerobio {
  /** a condição tem evidência de benefício com formato intervalado */
  intervaladoIndicado?: boolean;
  /** a condição desaconselha intervalado; na fusão, isto vence */
  intervaladoEvitar?: boolean;
  /**
   * Banda de intensidade aeróbia MÁXIMA que esta condição admite (`BANDAS_AEROBIAS`).
   * Ausente = moderada, que é a banda única que o produto usava antes de existirem três, e
   * por isso a ausência mantém o plano byte-idêntico ao de antes.
   *
   * Serve nas duas direções: condição que precisa segurar declara `leve`, condição em que a
   * evidência mostra ganho com esforço maior declara `vigorosa`. Na fusão vence a MENOR.
   */
  bandaMax?: BandaAerobia;
  /** por que, em uma linha, sem travessão */
  motivo: string;
  /** ids de referencias.ts que sustentam a direção */
  refId?: string[];
}

export interface ModDose {
  /** teto de carga relativa em %1RM, onde a faixa do objetivo expressa %1RM */
  cargaRelativaMax?: number;
  /** o alvo de intervalo lê a metade SUPERIOR da faixa citada (descanso mais longo) */
  intervaloFolgado?: boolean;
  /** nunca chegar mais perto da falha do que este RIR */
  rirMinimo?: number;
  /**
   * A rampa PARTE DO PISO da faixa citada, em vez de comecar no ponto que a tendencia
   * daria. Nao e numero novo: e escolher o piso da faixa que o objetivo ja cita, que e o
   * que "progressao gradual" quer dizer, e essa frase ja esta escrita nos cuidados de
   * todas estas condicoes. Nasceu de um caso concreto: obesidade grau III recebia 40 min
   * continuos na SEMANA 1, o teto da faixa "20 a 40 min", igual a um adulto sem condicao.
   */
  partirDoPiso?: boolean;
  /** por que este perfil recebe outra dose (texto curto, sem travessão) */
  motivo: string;
  /** ids de referencias.ts que sustentam o modificador */
  refId?: string[];
}

export interface GroupGpsRule extends GroupRuleInput {
  slug: string;
  /** pré-seleciona a etapa "Alguma restrição?" (o usuário pode trocar) */
  restricaoSugerida?: RestricaoTag;
  /**
   * LIMITAÇÕES ESTRUTURAIS QUE A CONDIÇÃO JÁ IMPLICA, sempre, sem o profissional
   * precisar marcar nada.
   *
   * Existe porque o gerador do PLANO (periodizacao.ts) escolhia exercício só por
   * objetivo e nível: uma aluna com obesidade grau II recebia elevação de quadril
   * com barra, deitada no banco, porque nada no caminho olhou a condição. As
   * penalidades acima ranqueiam (demanda de joelho, demanda lombar); estas tags
   * FILTRAM pelo perfil estrutural do exercício (ir ao chão, impacto, apoio).
   *
   * A diferença entre isto e `restricaoSugerida`: aquela é uma SUGESTÃO que o
   * profissional confirma ou troca na tela; estas são consequência da própria
   * condição e entram sempre, porque um plano de 12 semanas é gerado de uma vez,
   * sem passar pela etapa de restrições.
   *
   * Elas somam com o que o profissional declarou; nunca substituem. A regra mais
   * estrita continua mandando, como no ranqueamento.
   */
  restricoesEstruturais?: RestricaoTag[];
  /**
   * POSIÇÕES DE EXECUÇÃO QUE ESTA CONDIÇÃO PEDE PARA EVITAR.
   *
   * Nasceu de um achado de bancada: a gestante declarava, no próprio campo `cuidados`,
   * "evitar decúbito dorsal prolongado após o 1º trimestre", e recebia supino com halteres
   * DEITADA na semana 1. O cuidado estava escrito, e nada no caminho o aplicava. As tags de
   * `restricoesEstruturais` não cobrem posição (elas falam de impacto, chão, apoio), e criar
   * uma restrição de aluno chamada "evitar decúbito dorsal" seria pedir ao profissional que
   * marcasse à mão o que a condição já sabe.
   *
   * Entra como REBAIXAMENTO forte, e não como exclusão, pela mesma razão das penalidades: o
   * exercício vai para o fim da fila e só aparece se o catálogo não tiver alternativa, em vez
   * de sumir e deixar o plano sem bloco.
   */
  posicoesEvitar?: NonNullable<Exercise["restricaoPerfil"]>["posicao"][];
  /**
   * A CONDIÇÃO PEDE PARA EVITAR FLEXÃO DE COLUNA SOB CARGA.
   *
   * Mesmo desenho de `posicoesEvitar`, e pela mesma razão: é um fato do EXERCÍCIO que a
   * condição conhece, não uma restrição que o profissional deveria marcar à mão.
   *
   * Nasceu de um erro invertido. A osteoporose penalizava "Demanda lombar >= 60" como
   * substituta da recomendação da fonte. O posicionamento da ESSA (Beck 2017) não fala de
   * demanda lombar: fala de FLEXÃO DE COLUNA CARREGADA, e no mesmo parágrafo diz que o
   * osso responde a impacto e a treino resistido progressivo de alta intensidade. O
   * substituto errava dos dois lados, e dá para medir: penalizava terra (70), terra
   * romeno (70), good morning (65), agachamento livre (62) e remada curvada (62), todos
   * de coluna NEUTRA e todos o estímulo recomendado, e deixava passar o abdominal na
   * polia alta, que enrola o tronco contra carga que progride placa a placa e tem Demanda
   * lombar 40, abaixo do próprio corte.
   *
   * Rebaixamento forte, não exclusão, como em `posicoesEvitar`: o exercício vai para o fim
   * da fila e só aparece se o catálogo não tiver alternativa.
   */
  evitarFlexaoColunaCarregada?: boolean;
  /**
   * A CONDICAO PREFERE ALTERNATIVA QUE NAO TRABALHE OS MEMBROS ACIMA DO CORACAO.
   *
   * Este e o campo que existe para a LOGICA DE INDICACAO, e nao para a de exclusao. A
   * diferenca importa: nao se trata de o exercicio ser proibido, e sim de existir, no
   * proprio catalogo, outro que treina o MESMO musculo primario sem a caracteristica.
   *
   * Caso concreto. O leg press 45 graus era o primeiro bloco de forca de um hipertenso
   * estagio 2 iniciante. Lentini 1993 mediu pressao intra-arterial no leg press ate a
   * falha a 95% de 1RM: sistolica de 160 para 270 mmHg, diastolica de 91 para 183, com
   * pressao intratoracica de 0,8 para 57,8 Torr. O catalogo tem, com Quadriceps tambem
   * como primario e sem o encosto reclinado: leg press horizontal, cadeira extensora,
   * agachamento goblet, sentar e levantar e subida no step.
   *
   * O LIMITE da evidencia entra na propria regra, porque e o que impede o exagero:
   * Lentini mediu carga quase maxima ate a falha em jovens saudaveis e NAO comparou o
   * leg press com outros exercicios em intensidade equivalente. Por isso o efeito e
   * REBAIXAR e nomear a alternativa, jamais excluir. Quem decide continua sendo o
   * profissional, e agora ele decide vendo o porque e a opcao.
   */
  evitarMembrosAcimaDoCoracao?: boolean;
  /** cuidados exibidos como "já considerados pelo grupo" */
  cuidados: string[];
  /** ids de referencias.ts que fundamentam as regras deste grupo (bibliografia do Prontuário) */
  refs?: string[];
  /** modificador de progressão do perfil (onda MP-6); ausente = progride no passo padrão */
  modProgressao?: ModProgressao;
  /** dose do treino modificada pelo perfil clínico (ver ModDose) */
  modDose?: ModDose;
  modAerobio?: ModAerobio;
  /**
   * Horizonte mínimo, em semanas, a partir do qual a evidência DESTA condição mediu efeito
   * no desfecho que importa para ela.
   *
   * É um eixo que não existia. Todos os modificadores deste arquivo apertam a DOSE, e havia
   * evidência específica de condição que não fala de dose nenhuma: em esteatose hepática, a
   * metanálise de Nam (2023) mediu redução de gordura hepática em intervenções acima de 3
   * meses e NÃO alcançou significância abaixo disso. Sem este campo, esse achado não teria
   * onde entrar, que é exatamente o motivo de o acervo do produto ser pequeno: faltava
   * superfície, não faltava artigo.
   *
   * Ele NÃO encurta nem alonga o plano por conta própria. Quem decide o horizonte é o
   * profissional; o motor apenas DIZ, no raciocínio, quando o plano está abaixo do que a
   * evidência da jornada mediu. Mudar o horizonte em silêncio seria decidir no lugar dele.
   */
  horizonteMinimoSemanas?: number;
  /**
   * Qual instrumento DEIXA de guiar a intensidade deste perfil e qual entra no lugar. Hoje
   * nenhum grupo especial declara isto (a condição em si não invalida um parâmetro); quem
   * declara são as classes de medicação, que produzem regras com esta mesma forma. O campo
   * mora aqui, e não num tipo paralelo, para que a fusão de cuidados e a fusão de instrumento
   * de monitoramento sejam a MESMA operação, e a ordem das fontes nunca mude o resultado.
   */
  monitoramento?: EfeitoMonitoramento;
}

export const groupGpsRules: Record<string, GroupGpsRule> = {
  "obesidade-grau-1": {
    slug: "obesidade-grau-1",
    restricoesEstruturais: ["baixa_tolerancia_impacto"],
    nome: "Obesidade grau I",
    cuidados: [
      "Impacto controlado com progressão gradual: caminhada e bicicleta toleradas, a musculação guiada entra como complemento.",
      "Baixa tolerância inicial em quem vem de sedentarismo: sessões curtas, esforço leve a moderado por PSE e teste da fala.",
      "Nas primeiras semanas, a adesão é a principal métrica de sucesso.",
    ],
    penalidades: [
      {
        metrica: "Demanda de joelho",
        // RECALIBRADO contra a escala real do catálogo. A escada era 65/60/55 e o MAIOR
        // valor de "Demanda de joelho" entre os 97 exercícios é 58: os graus I e II nunca
        // disparavam, ou seja, o produto prometia cautela articular na obesidade leve e
        // moderada e não fazia nada. A escada agora é 55/50/45, que preserva a ordem
        // (quanto mais grave o grau, mais cedo o rebaixamento) e de fato alcança
        // exercícios. Estes limites são calibração da casa nesta escala relativa, não
        // número de diretriz, como todo o resto de `penalidades`.
        limite: 55,
        motivo: "Alta demanda de joelho: em obesidade grau I ainda pede cautela articular cedo demais.",
      },
      {
        metrica: "Demanda lombar",
        limite: 65,
        motivo: "Alta demanda lombar: cautela com sobrecarga axial neste perfil.",
      },
    ],
    complexidadeMax: 60,
    modProgressao: {
      pseTeto: 7,
      // Estava 5, e 5 nunca poderia valer. O campo se documenta como "menor = mais
      // frequente", a fusão é por mínimo e o plano genérico já descarrega a cada 4: pedir
      // 5 significaria dar ao aluno com obesidade MENOS recuperação que ao aluno sem
      // condição, que é o oposto da escada que os três graus desenham. Fica no padrão; a
      // diferenciação real da escada mora no grau 3, que pede 3.
      descargaCadaSemanas: 4,
      fatorIncremento: 0.6,
      motivo: "Impacto controlado e adesão antes da intensidade: progride em passos pequenos, guiado por PSE.",
      cautela: true,
      refId: ["donnelly-2009", "acsm-getp11"],
    },
    refs: ["donnelly-2009", "acsm-getp11", "oms-2020", "seidell-flegal-1997"],
  },

  "obesidade-grau-2": {
    slug: "obesidade-grau-2",
    restricoesEstruturais: ["baixa_tolerancia_impacto", "dificuldade_chao", "fadiga_precoce"],
    nome: "Obesidade grau II",
    cuidados: [
      "Impacto e volume altos tendem a sobrecarregar joelhos e lombar: a base da semana são modalidades de baixo impacto; a musculação entra como complemento guiado.",
      "Dispneia e baixa tolerância inicial: sessões curtas, esforço leve, guiado por PSE e teste da fala.",
      "Nas primeiras semanas, a adesão é a principal métrica de sucesso.",
    ],
    penalidades: [
      {
        metrica: "Demanda de joelho",
        limite: 50, // ver a nota de recalibração no grau I
        motivo: "Alta demanda de joelho: em obesidade grau II tende a gerar desconforto articular.",
      },
      {
        metrica: "Demanda lombar",
        limite: 60,
        motivo: "Alta demanda lombar: cautela com sobrecarga axial neste perfil.",
      },
    ],
    complexidadeMax: 55,
    modProgressao: {
      pseTeto: 7,
      fatorIncremento: 0.5,
      descargaCadaSemanas: 4,
      motivo: "Baixa tolerância inicial e sobrecarga articular: progride em passos pequenos, guiado por PSE, com descarga mais frequente.",
      cautela: true,
      refId: ["donnelly-2009", "acsm-getp11"],
    },
    refs: ["donnelly-2009", "acsm-getp11", "oms-2020", "seidell-flegal-1997", "who-imc-2004"],
  },

  "obesidade-grau-3": {
    slug: "obesidade-grau-3",
    restricoesEstruturais: ["baixa_tolerancia_impacto", "dificuldade_chao", "dificuldade_sentar_levantar", "fadiga_precoce"],
    nome: "Obesidade grau III",
    cuidados: [
      "A base da semana é de baixo impacto (meio aquático ou bicicleta): impacto e volume altos sobrecarregam joelhos e lombar neste perfil.",
      "Dispneia e baixa tolerância importantes: sessões curtas, esforço leve, guiado por PSE e teste da fala.",
      "Nas primeiras semanas, completar a sessão e voltar (adesão) é a principal métrica de sucesso.",
    ],
    penalidades: [
      {
        metrica: "Demanda de joelho",
        limite: 45, // ver a nota de recalibração no grau I
        motivo: "Alta demanda de joelho: em obesidade grau III tende a gerar desconforto articular importante.",
      },
      {
        metrica: "Demanda lombar",
        limite: 55,
        motivo: "Alta demanda lombar: cautela reforçada com sobrecarga axial neste perfil.",
      },
    ],
    complexidadeMax: 50,
    modProgressao: {
      pseTeto: 6,
      fatorIncremento: 0.4,
      descargaCadaSemanas: 3,
      motivo: "Tolerância baixa e sobrecarga articular acentuadas: progride nos menores passos, guiado por PSE, com descarga frequente.",
      cautela: true,
      refId: ["donnelly-2009", "acsm-getp11"],
    },
    refs: ["donnelly-2009", "acsm-getp11", "oms-2020", "seidell-flegal-1997", "who-imc-2004"],
  },

  "hipertensao-estagio-1": {
    slug: "hipertensao-estagio-1",
    evitarMembrosAcimaDoCoracao: true,
    modDose: {
      // 80% de 1RM e o TETO da banda de 60 a 80% em que henkin-2023 mediu a queda de
      // 6,98 mmHg de sistolica e 3,64 de diastolica. Acima dela nao ha efeito medido.
      cargaRelativaMax: 80,
      /*
       * O teto acima NUNCA MORDIA, e a rodada de evidencia mediu isso: `cargaRelativaAlvo`
       * so e calculado quando a faixa do objetivo expressa %1RM, e a unica faixa do produto
       * inteiro que expressa e a de Resistencia muscular, "40 a 60%", ja menor que 80. O
       * unico numero publicado especifico de condicao do motor era letra morta.
       *
       * A tentacao era enfiar %1RM nas outras faixas para o teto passar a valer. Seria
       * errado: esta casa controla esforco por REPETICOES DE RESERVA de proposito, e
       * escrever "70 a 85% de 1RM" em hipertrofia inventaria precisao que a diretriz citada
       * nao da (acsm-progressao-2009 fala em 6 a 12 RM, nao em percentual).
       *
       * Entao o teto passa a morder pelo instrumento que a casa de fato usa: reserva minima.
       * ATENCAO ao que isto e e ao que nao e. A busca no PubMed nao encontrou trabalho
       * medindo resposta pressorica de serie levada a falha contra serie interrompida antes,
       * entao o NUMERO nao vem de estudo: e cautela da casa, marcada com `cautela` no
       * modProgressao, que e o mecanismo criado neste arquivo para "a direcao vem da
       * referencia e a magnitude e conservadora". A direcao vem de henkin-2023: o beneficio
       * foi medido em intensidade moderada, e levar a serie ao maximo sai da banda medida.
       */
      rirMinimo: 2,
      intervaloFolgado: true,
      motivo: "Carga relativa no teto da faixa em que a queda de pressao foi demonstrada, esforco com reserva para a serie nao terminar no maximo, e descanso na metade mais folgada da faixa citada.",
      refId: ["henkin-2023", "hanssen-2022", "sbc-2020"],
    },

    nome: "Hipertensão estágio 1",
    cuidados: [
      "Evitar apneia (manobra de Valsalva) e isometrias pesadas: respiração contínua em todas as séries.",
      "Preferir cargas leves a moderadas com progressão gradual; evitar esforços máximos.",
      "Alguns anti-hipertensivos alteram a resposta da FC: PSE e teste da fala tendem a ser guias mais confiáveis.",
    ],
    penalidades: [
      {
        metrica: "Demanda lombar",
        limite: 65,
        motivo: "Carga axial elevada favorece apneia/Valsalva: cautela em hipertensão estágio 1.",
      },
      {
        metrica: "Complexidade técnica",
        limite: 75,
        motivo: "Exercícios de alta exigência técnica tendem a elevar a resposta pressórica sob carga.",
      },
    ],
    modProgressao: {
      pseTeto: 6,
      fatorIncremento: 0.6,
      motivo: "Evitar esforços máximos e apneia (Valsalva): progride devagar e com teto de esforço mais baixo.",
      cautela: true,
      refId: ["pescatello-2004", "sbc-2020"],
    },
    refs: ["sbc-2020", "pescatello-2004", "acsm-getp11"],
  },

  "hipertensao-estagio-2": {
    slug: "hipertensao-estagio-2",
    evitarMembrosAcimaDoCoracao: true,
    modDose: {
      // 80% de 1RM e o TETO da banda de 60 a 80% em que henkin-2023 mediu a queda de
      // 6,98 mmHg de sistolica e 3,64 de diastolica. Acima dela nao ha efeito medido.
      cargaRelativaMax: 80,
      /*
       * MESMA reserva do estagio 1, e nao um degrau acima. Eu tentei 3, para a escada de
       * gravidade aparecer tambem na forca, e o `check:progressao` reprovou: a faixa de
       * reserva do produto vai de 1 a 3, entao exigir minimo 3 PRENDE o alvo no teto e a
       * linha de intensidade do grafico sai reta, com 2 valores distintos em 24 semanas.
       *
       * Ou seja, o degrau a mais nao deixava o treino mais cauteloso, deixava o treino sem
       * progressao, que e o defeito que o fundador reportou por captura de tela e que aquele
       * guardrail existe para travar. Reserva minima so funciona como cautela enquanto sobra
       * espaco de variacao dentro da faixa citada.
       *
       * A diferenca entre os dois estagios continua onde o arquivo ja a tinha: `pseTeto` 5
       * contra 6 e `complexidadeMax` 60 contra nenhum. Nao ha terceira banda inventada aqui.
       */
      rirMinimo: 2,
      intervaloFolgado: true,
      motivo: "Carga relativa no teto da faixa em que a queda de pressao foi demonstrada, reserva maior que a do estagio 1 para a serie ficar mais longe do maximo, e descanso na metade mais folgada da faixa citada.",
      refId: ["henkin-2023", "hanssen-2022", "sbc-2020"],
    },

    nome: "Hipertensão estágio 2",
    cuidados: [
      "Base de pressão mais alta que o estágio 1: respiração contínua obrigatória, sem isometrias pesadas nem apneia.",
      "Cargas leves com progressão condicionada à liberação médica formal; a PA aferida antes da sessão orienta o dia.",
      "Alguns anti-hipertensivos alteram a resposta da FC: PSE e teste da fala tendem a ser guias mais confiáveis.",
    ],
    penalidades: [
      {
        metrica: "Demanda lombar",
        limite: 60,
        motivo: "Carga axial elevada favorece apneia/Valsalva: cautela reforçada em hipertensão estágio 2.",
      },
      {
        metrica: "Complexidade técnica",
        limite: 70,
        motivo: "Exercícios de alta exigência técnica tendem a elevar a resposta pressórica sob carga, mais crítica no estágio 2.",
      },
    ],
    complexidadeMax: 60,
    modProgressao: {
      pseTeto: 5,
      fatorIncremento: 0.5,
      descargaCadaSemanas: 4,
      motivo: "Pressão de base mais alta e resposta mais reativa: progride nos menores passos, com teto de esforço mais baixo e descarga frequente.",
      cautela: true,
      refId: ["pescatello-2004", "sbc-2020"],
    },
    refs: ["sbc-2020", "pescatello-2004", "acsm-getp11"],
  },

  "diabetes-tipo-2": {
    slug: "diabetes-tipo-2",
    nome: "Diabetes tipo 2",
    /*
     * Esta condição era um RÓTULO: penalidades vazias, sem teto, sem modificador de dose e
     * sem modificador de progressão. A régua de distintividade mostrou o resultado disso
     * sem margem para discussão: quem tem DM2 recebia o mesmo plano de quem tem asma
     * controlada, de quem tem dislipidemia e de quem não tem condição nenhuma. Sete
     * condições dividiam uma única dose.
     *
     * O motivo não era descuido: é que faltava SUPERFÍCIE. A evidência forte de DM2 não
     * fala de teto de carga nem de penalidade por métrica, fala de COMPOSIÇÃO e de FORMATO,
     * e o motor não tinha onde receber isso. `modAerobio` existe por causa deste caso.
     */
    /*
     * A DOSE DESTA CONDIÇÃO É DIFERENTE POR MODALIDADE, e é o primeiro caso do arquivo a
     * dizer isso de propósito.
     *
     * `pseTeto` só age no bloco AERÓBIO (ver a documentação do campo). Declarar teto aqui e
     * NÃO declarar `rirMinimo` é a frase clínica "segure o aeróbio na faixa moderada e
     * deixe a força seguir a faixa do objetivo". O motor sempre soube dizer isso; nenhuma
     * condição usava.
     *
     * Por que moderado no aeróbio, com quatro trabalhos e não com um:
     * - `gajanand-dm2-2024` (ensaio, 69 pessoas): intervalado combinado e contínuo moderado
     *   combinado melhoraram a HbA1c de forma SEMELHANTE (-0,7 e -1,2).
     * - `magalhaes-dm2-2018` (ensaio de UM ANO, 80 pessoas): nenhum dos dois alterou HbA1c,
     *   e o contínuo moderado com resistido foi o único a melhorar composição corporal e
     *   aptidão cardiorrespiratória.
     * - `wang-hiit-dm2-2026` (metanálise, 20 ensaios): intervalado melhor que tratamento
     *   farmacológico de rotina, e SEM diferença contra o contínuo.
     * - `mannucci-dm2-2021` (metanálise em rede, 25 ensaios): o combinado supera aeróbio ou
     *   resistido isolados.
     *
     * Ou seja, o formato do aeróbio não decide o desfecho e o contínuo moderado é o que tem
     * o melhor lastro de duração. Eu tinha marcado o intervalado como "indicado" numa
     * versão anterior desta regra, com base em UMA metanálise; com os quatro na mesa, isso
     * era forte demais e virou equivalência.
     *
     * O que NÃO está escrito aqui, e não está porque não achei o trabalho: um teto de
     * intensidade para o RESISTIDO neste perfil. Enquanto ele não aparecer, a força segue a
     * faixa do objetivo, que é o que a ausência de `rirMinimo` significa.
     */
    /*
     * ATENÇÃO, DÉBITO CONHECIDO E MEDIDO: este teto NÃO MORDE hoje, e fica aqui declarado
     * com o aviso em vez de ser escondido.
     *
     * A faixa aeróbia do produto INTEIRO é uma só, "Moderada: cerca de 64 a 76% da FCmáx,
     * RPE 5 a 6 de 10", igual para todos os objetivos e todas as condições. Um teto de 6 não
     * corta nada porque 6 já é o máximo da banda, e um teto de 5 não seria cautela, seria
     * achatamento: prenderia o RPE num valor único e produziria a linha reta de intensidade
     * que o `check:progressao` reprova, exatamente como aconteceu com a reserva 3 da
     * hipertensão nesta mesma rodada.
     *
     * Ou seja, a impossibilidade de dizer "aeróbio leve a moderado nesta condição e mais
     * intenso naquela" não vem de falta de evidência: vem de o produto ter UMA banda
     * aeróbia. Enquanto as faixas não expressarem leve, moderada e vigorosa com fonte,
     * nenhuma condição consegue modular intensidade aeróbia, por mais artigo que se junte.
     *
     * O teto continua declarado porque as referências que o sustentam são reais e porque o
     * dia em que a banda abrir ele passa a valer sozinho.
     */
    modProgressao: {
      pseTeto: 6,
      motivo: "Aeróbio na faixa moderada, que é onde está o lastro de maior duração, sem travar a intensidade do treino resistido.",
      cautela: true,
      refId: ["magalhaes-dm2-2018", "gajanand-dm2-2024", "mannucci-dm2-2021"],
    },
    modAerobio: {
      motivo: "Formato contínuo ou intervalado, sem superioridade demonstrada de um sobre o outro; o que muda o desfecho é o treino ser combinado.",
      refId: ["gajanand-dm2-2024", "wang-hiit-dm2-2026", "mannucci-dm2-2021"],
    },
    cuidados: [
      "Atenção a sinais compatíveis com hipoglicemia (tontura, sudorese fria, confusão): pausar e reavaliar.",
      "Cuidado com os pés: calçado adequado e inspeção regular, especialmente com volume de caminhada.",
      "Consistência semanal tende a valer mais que picos de intensidade.",
    ],
    penalidades: [],
    refs: ["colberg-2016", "sbd-2023", "mannucci-dm2-2021", "wang-hiit-dm2-2026", "gajanand-dm2-2024", "magalhaes-dm2-2018"],
  },

  "idoso-destreinado": {
    slug: "idoso-destreinado",
    restricoesEstruturais: ["baixa_tolerancia_impacto", "equilibrio_reduzido", "dificuldade_chao"],
    nome: "Idoso destreinado",
    cuidados: [
      "Equilíbrio e segurança primeiro: apoio disponível e ambiente livre de obstáculos.",
      "Técnica antes de carga; progressões pequenas e frequentes.",
    ],
    penalidades: [
      {
        metrica: "Requisito de mobilidade",
        limite: 60,
        motivo: "Alto requisito de mobilidade: adapte a amplitude para este perfil.",
      },
    ],
    complexidadeMax: 50,
    modProgressao: {
      pseTeto: 7,
      fatorIncremento: 0.5,
      descargaCadaSemanas: 4,
      motivo: "Técnica antes de carga: progressões pequenas e frequentes, sem esforços máximos.",
      cautela: true,
      refId: ["fragala-2019", "chodzko-2009"],
    },
    refs: ["chodzko-2009", "fragala-2019"],
  },

  "dor-lombar-inespecifica": {
    slug: "dor-lombar-inespecifica",
    restricoesEstruturais: ["lombar_sensivel"],
    nome: "Dor lombar inespecífica",
    restricaoSugerida: "lombar_sensivel",
    cuidados: [
      "A restrição “Dor lombar” foi pré-selecionada: exercícios com alta demanda lombar são penalizados no ranking.",
      "Dor leve que não piora ao longo da sessão costuma ser tolerável; dor crescente pede ajuste de amplitude/carga.",
    ],
    // a penalização vem da restrição pré-selecionada (evita punir duas vezes)
    penalidades: [],
    modProgressao: {
      pseTeto: 6,
      fatorIncremento: 0.5,
      motivo: "Progressão guiada pela resposta de dor: passos pequenos, sem forçar quando a dor cresce.",
      cautela: true,
      refId: ["nice-ng59"],
    },
    refs: ["nice-ng59"],
  },

  "osteoartrite-joelho": {
    slug: "osteoartrite-joelho",
    restricoesEstruturais: ["baixa_tolerancia_impacto", "dificuldade_ajoelhar"],
    nome: "Osteoartrite de joelho",
    restricaoSugerida: "joelho_dor",
    cuidados: [
      "A restrição “Dor no joelho” foi pré-selecionada: alta demanda de joelho é penalizada no ranking.",
      "Amplitude confortável; progrida guiado pela resposta de dor nas 24–48h seguintes.",
    ],
    penalidades: [],
    modProgressao: {
      pseTeto: 6,
      fatorIncremento: 0.5,
      motivo: "Amplitude confortável e progressão guiada pela dor nas 24 a 48h seguintes.",
      cautela: true,
      refId: ["oarsi-2019", "acr-2019"],
    },
    refs: ["oarsi-2019", "acr-2019"],
  },

  /* --------- Condições adicionais (cuidados + adaptações do motor) --------- */

  "iniciante-sedentario": {
    slug: "iniciante-sedentario",
    nome: "Iniciante / sedentário",
    cuidados: [
      "Poucos exercícios simples e esforço leve a moderado: a adesão e a técnica vêm antes da carga.",
      "Progrida uma variável por vez; a dor tardia inicial é esperada, a lesão pela pressa não.",
    ],
    penalidades: [
      { metrica: "Complexidade técnica", limite: 65, motivo: "Exercícios muito técnicos cedo demais atrapalham a técnica e a adesão do iniciante." },
    ],
    complexidadeMax: 55,
    modProgressao: {
      pseTeto: 7,
      fatorIncremento: 0.5,
      motivo: "Adesão e técnica antes da carga: progride uma variável por vez, em passos pequenos.",
      cautela: true,
      refId: ["acsm-getp11", "oms-2020"],
    },
    refs: ["acsm-getp11", "oms-2020"],
  },
  "retorno-inatividade": {
    slug: "retorno-inatividade",
    restricoesEstruturais: ["fadiga_precoce"],
    nome: "Retorno após inatividade",
    cuidados: [
      "Recomece com cerca de metade do volume e da carga anteriores e progrida ao longo de poucas semanas.",
      "Respeite a recuperação: a dor muscular tardia inicial é esperada.",
    ],
    penalidades: [],
    complexidadeMax: 60,
    modProgressao: {
      pseTeto: 7,
      fatorIncremento: 0.5,
      motivo: "Retomada com cerca de metade do volume e da carga anteriores, progredindo ao longo de poucas semanas.",
      cautela: true,
      refId: ["acsm-getp11", "oms-2020"],
    },
    refs: ["acsm-getp11", "oms-2020"],
  },
  "pre-diabetes": {
    slug: "pre-diabetes",
    nome: "Pré-diabetes",
    /*
     * jadhav-pre-dm-2017 entra como a primeira referência específica de pré-diabetes deste
     * arquivo, no lugar de duas genéricas. Ela NÃO vira número de dose, e o motivo está na
     * própria metanálise: os intervalos de confiança dos dois desfechos glicêmicos
     * principais cruzam o zero (glicemia de jejum -0,05, IC 95% -0,14 a 0,04). Direção
     * favorável, precisão baixa. Sustenta orientar, não sustenta apertar parâmetro.
     *
     * O cuidado antigo afirmava que a regularidade melhora a sensibilidade à insulina "mais
     * que picos de intensidade". A comparação não tem fonte aqui, e a evidência específica
     * desta condição não a faz. Ficou a parte afirmável.
     */
    cuidados: [
      "A regularidade semanal (aeróbio quase diário mais força 2 a 3x) é o alvo do programa nesta fase.",
      "A atividade física favorece retardar a progressão para diabetes tipo 2, com efeito de direção consistente e precisão baixa nos estudos reunidos.",
      "Atenção a sinais compatíveis com hipoglicemia (tontura, sudorese fria, confusão): pausar e reavaliar.",
    ],
    penalidades: [],
    refs: ["jadhav-pre-dm-2017", "colberg-2016", "acsm-getp11"],
  },
  "sindrome-metabolica": {
    slug: "sindrome-metabolica",
    nome: "Síndrome metabólica",
    cuidados: [
      "Vários fatores de risco somados pedem respiração contínua (evitar apneia), progressão gradual e monitoramento.",
      "Combine aeróbio moderado frequente com força; atenção à pressão e a sinais de hipoglicemia.",
    ],
    penalidades: [
      { metrica: "Demanda lombar", limite: 65, motivo: "Carga axial elevada favorece apneia/Valsalva: cautela no perfil cardiometabólico." },
    ],
    modProgressao: {
      pseTeto: 7,
      fatorIncremento: 0.6,
      motivo: "Vários fatores de risco somados: respiração contínua, progressão gradual e teto de esforço mais baixo.",
      cautela: true,
      refId: ["pescatello-2004", "acsm-getp11"],
    },
    refs: ["colberg-2016", "pescatello-2004", "acsm-getp11"],
  },
  dislipidemia: {
    slug: "dislipidemia",
    nome: "Dislipidemia",
    cuidados: [
      "O efeito no perfil lipídico vem do volume aeróbio regular ao longo das semanas, não de poucas sessões.",
      "Some força para composição e metabolismo; a conduta medicamentosa é do profissional de saúde.",
    ],
    penalidades: [],
    refs: ["acsm-getp11", "oms-2020"],
  },
  "esteatose-hepatica": {
    slug: "esteatose-hepatica",
    nome: "Esteatose hepática metabólica",
    /*
     * Outra das sete condições que eram rótulo puro, e o caso que provou o argumento desta
     * rodada: não faltava artigo, faltava onde encaixá-lo.
     *
     * nam-nafld-2023, metanálise de 11 ensaios randomizados e 577 adultos com gordura
     * hepática medida por ressonância, não diz nada sobre teto de carga, penalidade por
     * métrica ou passo de progressão, que era todo o vocabulário disponível aqui. O achado
     * dela é de TEMPO: acima de 3 meses a gordura hepática caiu (-3,62) e abaixo de 3 meses
     * não alcançou significância (-1,23, p = 0,11). Por isso `horizonteMinimoSemanas`
     * existe, e por isso esta condição ficou anos sem parâmetro nenhum.
     *
     * O cuidado que já estava escrito aqui, "aeróbio regular mais força reduzem a gordura
     * hepática", segue verdadeiro e agora tem a metanálise por trás dele em vez de só a
     * diretriz geral de atividade física.
     */
    horizonteMinimoSemanas: 12,
    cuidados: [
      "Aeróbio regular + força reduzem a gordura hepática junto da perda de peso gradual (encaminhar nutrição).",
      "Perda de peso agressiva não é o alvo do treino; priorize a consistência.",
      "A gordura hepática respondeu em acompanhamentos acima de 3 meses; abaixo disso o efeito não foi significativo.",
    ],
    penalidades: [],
    refs: ["donnelly-2009", "acsm-getp11", "nam-nafld-2023"],
  },
  sarcopenia: {
    slug: "sarcopenia",
    nome: "Sarcopenia / baixa força muscular",
    cuidados: [
      "A força é o principal estímulo: máquinas guiadas 2 a 3x/semana com progressão pequena e frequente.",
      "Técnica antes de carga; recuperação pode ser mais lenta. Encaminhe para avaliação nutricional (proteína).",
    ],
    penalidades: [
      { metrica: "Requisito de mobilidade", limite: 60, motivo: "Alto requisito de mobilidade: adapte a amplitude para o perfil de baixa força." },
    ],
    complexidadeMax: 55,
    modProgressao: {
      pseTeto: 7,
      fatorIncremento: 0.5,
      descargaCadaSemanas: 4,
      motivo: "Força com progressão pequena e frequente; recuperação pode ser mais lenta.",
      cautela: true,
      refId: ["fragala-2019", "chodzko-2009"],
    },
    refs: ["fragala-2019", "chodzko-2009"],
  },
  osteoporose: {
    slug: "osteoporose",
    nome: "Osteopenia / osteoporose",
    cuidados: [
      // O primeiro cuidado dizia "força e impacto controlado estimulam o osso" e, na mesma
      // frase, "evite flexão brusca da coluna". Estava certo no texto e errado no motor: a
      // penalidade aplicada era "Demanda lombar >= 60", que rebaixava justamente os
      // levantamentos de coluna neutra que estimulam o osso. Agora o texto e a regra dizem
      // a mesma coisa, e é a coisa que a fonte diz.
      "Treino resistido progressivo e impacto controlado estimulam o osso: manter carga de verdade é o objetivo, não evitá-la.",
      "O que a evidência desaconselha é a flexão de coluna CARREGADA (enrolar o tronco contra carga), não a dobradiça de quadril com coluna neutra.",
      "Força, equilíbrio e mobilidade são o que reduz o risco de queda e, por consequência, de fratura: o programa é multicomponente, nunca só aeróbio.",
      "Liberação médica recomendada antes de progredir o impacto; a evidência não permite quantificar um teto de carga seguro para esta população.",
    ],
    // Sem penalidade por métrica. A métrica "Demanda lombar" não é substituta da flexão
    // carregada, e usá-la assim invertia a recomendação. O fato certo entra abaixo.
    penalidades: [],
    evitarFlexaoColunaCarregada: true,
    // Mantido em 55, e mantido de propósito sem número novo: `complexidadeMax` só REBAIXA
    // no ranqueamento (nunca exclui), e Giangregorio declara que não há evidência suficiente
    // para quantificar os riscos do exercício nesta população. Preferir a variação guiada
    // sem proibir a barra é o que cabe dizer com o que existe publicado.
    complexidadeMax: 55,
    modProgressao: {
      pseTeto: 7,
      fatorIncremento: 0.5,
      motivo: "Estímulo ao osso com treino resistido progressivo, sem esforço máximo e sem flexão de coluna carregada; progressão do impacto só com liberação médica.",
      cautela: true,
      refId: ["beck-essa-2017", "giangregorio-2014", "acsm-getp11"],
    },
    // As duas fontes específicas da condição estavam apenas no semáforo, e o motor citava
    // referências genéricas de idoso. Quem lê o prontuário via a bibliografia errada.
    refs: ["beck-essa-2017", "giangregorio-2014", "chodzko-2009", "acsm-getp11"],
  },
  gestante: {
    slug: "gestante",
    nome: "Gestante sem contraindicação",
    cuidados: [
      "Com liberação obstétrica: intensidade moderada pelo teste da fala, evitar esforço máximo, superaquecimento e decúbito dorsal prolongado após o 1º trimestre.",
      "Reduza atividades com risco de queda; sinais de alerta obstétricos pedem interrupção e encaminhamento imediato.",
    ],
    penalidades: [
      { metrica: "Complexidade técnica", limite: 65, motivo: "Exercícios de alta exigência técnica/equilíbrio aumentam o risco de queda na gestação." },
    ],
    complexidadeMax: 55,
    // O cuidado logo acima diz "evitar decúbito dorsal prolongado após o 1º trimestre". Antes
    // disto, ele era só texto: o plano entregava supino com halteres, deitada, na semana 1.
    posicoesEvitar: ["deitado"],
    modProgressao: {
      pseTeto: 6,
      fatorIncremento: 0.5,
      motivo: "Com liberação obstétrica: intensidade moderada pelo teste da fala, sem esforço máximo.",
      cautela: true,
      refId: ["acsm-getp11"],
    },
    refs: ["acsm-getp11", "mottola-gestacao-2019", "acog-804-2020"],
  },
  "pos-parto": {
    slug: "pos-parto",
    restricoesEstruturais: ["baixa_tolerancia_impacto"],
    nome: "Pós-parto com liberação",
    cuidados: [
      "Com liberação: retomada gradual com atenção ao assoalho pélvico e ao core; sinais de perdas ou peso pedem encaminhamento.",
      "Ajuste à recuperação e ao sono fragmentado; evite carga alta cedo demais.",
    ],
    penalidades: [],
    complexidadeMax: 60,
    modProgressao: {
      pseTeto: 7,
      fatorIncremento: 0.5,
      motivo: "Retomada gradual com atenção ao assoalho pélvico e ao core; sem carga alta cedo demais.",
      cautela: true,
      refId: ["acsm-getp11"],
    },
    refs: ["acsm-getp11"],
  },
  climaterio: {
    slug: "climaterio",
    nome: "Climatério / menopausa",
    cuidados: [
      "A força 2 a 3x/semana é prioridade (preserva músculo e osso); some aeróbio moderado.",
      "Ajuste ao sono e aos sintomas do dia; atenção ao risco cardiometabólico da transição.",
    ],
    penalidades: [],
    modProgressao: {
      pseTeto: 8,
      fatorIncremento: 0.6,
      motivo: "Força 2 a 3x/semana como prioridade, ajustada ao sono e aos sintomas do dia.",
      cautela: true,
      refId: ["chodzko-2009", "acsm-getp11"],
    },
    refs: ["chodzko-2009", "acsm-getp11"],
  },
  "apneia-sono": {
    slug: "apneia-sono",
    nome: "Apneia obstrutiva do sono",
    cuidados: [
      "Sonolência e fadiga diurna afetam a segurança: ajuste horário e intensidade ao dia.",
      // O cuidado anterior dizia "aeróbio + força apoiam a perda de peso, QUE REDUZ A
      // GRAVIDADE", atribuindo o benefício ao emagrecimento. A metanálise que o próprio
      // produto cita conclui o contrário: a redução do índice de apneia e hipopneia
      // aconteceu COM MUDANÇA MÍNIMA DE PESO (IMC -1,37; IC 95% -2,81 a 0,07; p = 0,06,
      // ou seja, não significativo). Condicionar o benefício ao ponteiro da balança faz o
      // profissional abandonar um programa que está funcionando.
      "O treino reduz a gravidade por si, sem depender de perda de peso: manter a constância vale mais que o número da balança.",
      // peng-aos-2022 confirmou a correção acima por outro caminho (índice caiu sem mudança
      // de IMC) e acrescentou o dado de COMPOSIÇÃO, que é o que muda a montagem do plano:
      // aeróbio combinado com resistido reduziu mais o índice (-7,36) que aeróbio isolado
      // (-4,36). Sem isso, a leitura natural de "apneia" seria mandar caminhar.
      "Aeróbio combinado com força reduz mais a gravidade que aeróbio isolado: não trocar a parte de força por mais caminhada.",
      "O tratamento da apneia (por exemplo, CPAP) é do profissional de saúde e não é substituído pelo treino.",
    ],
    penalidades: [],
    // `donnelly-2009` é o posicionamento sobre PESO, e sustentava a afirmação errada.
    // Continua útil para o componente de peso corporal, mas quem sustenta o efeito na
    // apneia é a metanálise específica.
    refs: ["iftikhar-apneia-2014", "peng-aos-2022", "donnelly-2009", "acsm-getp11"],
  },
  "asma-controlada": {
    slug: "asma-controlada",
    nome: "Asma controlada",
    /*
     * Esta condição se sustentava SÓ em referência genérica (`acsm-getp11` mais `oms-2020`),
     * que é exatamente a crítica que abriu esta rodada: uma diretriz geral respondendo por
     * uma realidade clínica específica.
     *
     * A revisão Cochrane de Osadnik (2022), 10 ensaios e 894 adultos com asma, entra aqui e
     * traz uma correção de EXPECTATIVA, não de dose. Com certeza moderada, treinar melhora
     * a capacidade funcional (79,8 m a mais na caminhada de 6 minutos, acima da diferença
     * minimamente importante) e a qualidade de vida. Mas o efeito sobre o CONTROLE da asma
     * foi pequeno e de baixa certeza.
     *
     * Por isso esta condição continua sem modificador de dose, e isso é resposta e não
     * omissão: a evidência verificada não sustenta uma dose distinta para quem tem asma
     * controlada, sustenta uma promessa distinta. Inventar aqui um teto ou uma penalidade
     * só para a condição "aparecer diferente" na régua de distintividade seria cometer, ao
     * contrário, o mesmo pecado de encaixar o aluno numa regra que ninguém mediu.
     */
    cuidados: [
      "Aquecimento gradual e ambientes sem ar muito frio ou seco reduzem o broncoespasmo induzido pelo esforço.",
      "Medicação de resgate disponível conforme o médico; sintomas que não cedem com a pausa pedem interrupção.",
      "O treino melhora condicionamento e qualidade de vida; o controle da asma em si melhora pouco e é assunto do tratamento médico.",
    ],
    penalidades: [],
    refs: ["osadnik-asma-2022", "acsm-getp11", "oms-2020"],
  },
  "ansiedade-depressao": {
    slug: "ansiedade-depressao",
    nome: "Ansiedade / sintomas depressivos",
    /*
     * Esta condição se sustentava só em `oms-2020` e `acsm-getp11`, duas referências
     * genéricas, e o cuidado escrito aqui dizia "a constância vale mais que a intensidade".
     *
     * A revisão guarda-chuva de Singh (2023), 97 revisões sistemáticas, 1.039 ensaios e
     * 128.119 participantes, DESMENTE essa frase na parte que ela tinha de comparação:
     * intensidade MAIOR associou-se a melhora maior, e a efetividade DIMINUIU em
     * intervenções mais longas. Não era uma imprecisão pequena; era o produto orientando o
     * profissional na direção oposta à do melhor conjunto de evidência que existe sobre o
     * assunto, e orientando com a autoridade de quem cita fonte.
     *
     * A frase foi reescrita, e o que ela tinha de correto (adesão importa) ficou, sem a
     * comparação que a evidência contraria.
     *
     * O `intervaladoIndicado` aqui é a consequência direta do achado de intensidade. Vem
     * com a limitação declarada na própria referência: 77 das 97 revisões tiveram qualidade
     * metodológica criticamente baixa, e por isso isto orienta uma opção, não uma regra.
     */
    modAerobio: {
      /*
       * PRIMEIRA condição a subir de banda, e ela sobe porque a evidência manda.
       *
       * Enquanto o produto teve uma banda aeróbia só, este achado de singh-saude-mental-2023
       * não tinha onde entrar: intensidade MAIOR associou-se a melhora maior dos sintomas.
       * Com as três bandas abertas, a condição passa a admitir a vigorosa (77 a 95% da
       * FCmáx), em vez de ficar presa na moderada como todo mundo.
       *
       * "Admitir" e não "obrigar": a banda é um TETO. A dose real continua progredindo de
       * dentro da faixa, e o profissional continua mandando. E a limitação da referência
       * anda junto onde ela é citada: 77 das 97 revisões tinham qualidade metodológica
       * criticamente baixa pelo AMSTAR.
       */
      bandaMax: "vigorosa",
      intervaladoIndicado: true,
      motivo: "Intensidade maior associou-se a melhora maior dos sintomas, num conjunto amplo de evidência de qualidade metodológica declaradamente baixa.",
      refId: ["singh-saude-mental-2023"],
    },
    cuidados: [
      "Metas pequenas e alcançáveis sustentam a adesão, que é o que faz o programa existir.",
      "Intensidade maior associou-se a mais melhora dos sintomas, e o efeito tende a ser maior em ciclos mais curtos: reavaliar cedo em vez de esperar o fim de um bloco longo.",
      "O treino apoia o humor, mas não substitui o acompanhamento de saúde do aluno.",
    ],
    penalidades: [],
    refs: ["singh-saude-mental-2023", "oms-2020", "acsm-getp11"],
  },
};

export function getGroupRule(slug?: string) {
  return slug ? groupGpsRules[slug] : undefined;
}

/**
 * Combina os cuidados/adaptações de VÁRIAS condições numa regra só. Assim uma
 * prescrição para, por exemplo, idoso + diabetes + osteoporose aplica ao mesmo
 * tempo as cautelas e penalizações das três, em vez de escolher uma categoria.
 * Para a mesma métrica, mantém a penalização mais estrita (menor limite);
 * complexidadeMax = a mais baixa; cuidados e refs sem duplicar.
 */
export function combineRules(slugs: string[]): GroupGpsRule | undefined {
  const rules = slugs.map((s) => groupGpsRules[s]).filter((r): r is GroupGpsRule => Boolean(r));
  return fundirRegras(rules);
}

/**
 * A fusão em si, separada da resolução de slugs. Recebe as regras JÁ materializadas, então
 * serve para qualquer fonte de cuidado clínico, não só para os grupos especiais do catálogo
 * (a camada de fármacos produz regras com esta mesma forma e entra por aqui, sem caminho
 * paralelo no motor). A lei é sempre a mesma: o mais CONSERVADOR vence.
 *
 * O atalho de uma regra só devolve a própria instância de propósito: é o que mantém o
 * caminho sem fusão byte-idêntico ao de antes desta extração.
 */
/**
 * Fusão de `modDose` pelo MAIS CONSERVADOR, na mesma régua do resto do arquivo: o menor
 * teto de carga, o maior RIR mínimo, e intervalo folgado se QUALQUER condição pedir.
 */
/**
 * Fusão de `modAerobio` pelo mais conservador: basta UMA condição desaconselhar o
 * intervalado para que a fusão o desaconselhe, e nesse caso o `intervaladoIndicado` das
 * outras não vale. É a mesma lei do resto do arquivo, e ela existe porque a combinação de
 * condições já perdeu limitação antes, por campo novo esquecido na fusão.
 */
function fundirModAerobio(mods: ModAerobio[]): ModAerobio | undefined {
  if (!mods.length) return undefined;
  const evitar = mods.some((m) => m.intervaladoEvitar);
  const refId: string[] = [];
  for (const m of mods) for (const r of m.refId ?? []) if (!refId.includes(r)) refId.push(r);
  // Banda: vence a MENOR entre as condições. Quem tem duas condições recebe o teto da mais
  // contida, pela mesma lei conservadora do resto do arquivo.
  const bandas = mods.map((m) => m.bandaMax).filter((b): b is BandaAerobia => Boolean(b));
  const bandaMax = bandas.length
    ? bandas.reduce((a, b) => (ORDEM_BANDA[b] < ORDEM_BANDA[a] ? b : a))
    : undefined;
  return {
    intervaladoEvitar: evitar || undefined,
    intervaladoIndicado: !evitar && mods.some((m) => m.intervaladoIndicado) ? true : undefined,
    bandaMax,
    motivo: mods.map((m) => m.motivo).join(" "),
    refId,
  };
}

function fundirModDose(mods: ModDose[]): ModDose | undefined {
  if (!mods.length) return undefined;
  if (mods.length === 1) return mods[0];
  const tetos = mods.map((m) => m.cargaRelativaMax).filter((n): n is number => typeof n === "number");
  const rirs = mods.map((m) => m.rirMinimo).filter((n): n is number => typeof n === "number");
  const refId: string[] = [];
  for (const m of mods) for (const r of m.refId ?? []) if (!refId.includes(r)) refId.push(r);
  return {
    cargaRelativaMax: tetos.length ? Math.min(...tetos) : undefined,
    rirMinimo: rirs.length ? Math.max(...rirs) : undefined,
    intervaloFolgado: mods.some((m) => m.intervaloFolgado) || undefined,
    partirDoPiso: mods.some((m) => m.partirDoPiso) || undefined,
    motivo: mods.map((m) => m.motivo).join(" "),
    refId,
  };
}

/**
 * A dose do perfil, já resolvida, incluindo o que é DERIVADO em vez de declarado.
 *
 * `intervaloFolgado` é derivado de `modProgressao.cautela` quando a condição não declara
 * `modDose` própria. É consistência interna, não número clínico novo: uma condição que já
 * declarou cautela na progressão não pode receber, na mesma prescrição, o intervalo que
 * maximiza o esforço para a mesma carga. Derivar em vez de listar à mão evita a tabela
 * paralela que envelhece em silêncio, que é como quase todo defeito deste motor nasceu.
 */
export function doseDoPerfil(regra: GroupGpsRule | undefined): ModDose | undefined {
  if (!regra) return undefined;
  const base = regra.modDose;
  const cautela = regra.modProgressao?.cautela === true;
  if (base) return { ...base, intervaloFolgado: base.intervaloFolgado ?? (cautela || undefined), partirDoPiso: base.partirDoPiso ?? (cautela || undefined) };
  if (!cautela) return undefined;
  return {
    intervaloFolgado: true,
    partirDoPiso: true,
    motivo: "Perfil com cautela declarada na progressão: o descanso entre séries lê a metade mais folgada da faixa citada, para não elevar o esforço da mesma carga.",
    refId: regra.modProgressao?.refId ?? [],
  };
}

export function fundirRegras(rules: GroupGpsRule[]): GroupGpsRule | undefined {
  if (rules.length === 0) return undefined;
  if (rules.length === 1) return rules[0];

  const cuidados: string[] = [];
  for (const r of rules) for (const c of r.cuidados) if (!cuidados.includes(c)) cuidados.push(c);

  // por métrica, mantém a penalidade de MENOR limite (mais rigorosa)
  const penMap = new Map<string, { metrica: string; limite: number; motivo: string }>();
  for (const r of rules) {
    for (const p of r.penalidades) {
      const cur = penMap.get(p.metrica);
      if (!cur || p.limite < cur.limite) penMap.set(p.metrica, p);
    }
  }

  const maxes = rules.map((r) => r.complexidadeMax).filter((n): n is number => typeof n === "number");
  const refs: string[] = [];
  for (const r of rules) for (const ref of r.refs ?? []) if (!refs.includes(ref)) refs.push(ref);

  /*
   * UNIÃO DAS LIMITAÇÕES ESTRUTURAIS, e não interseção nem descarte.
   *
   * Achado de bancada, e era grave: estes dois campos simplesmente NÃO ENTRAVAM no objeto
   * fundido. O efeito é o contrário do que o plano promete por escrito ao profissional
   * ("onde eles divergem vale sempre o mais conservador"): um aluno com hipertensão estágio 2
   * MAIS obesidade grau II perdia o `baixa_tolerancia_impacto` que a obesidade sozinha
   * aplicava. Declarar a segunda condição deixava o plano MENOS seguro que declarar só a
   * primeira, que é o pior incentivo possível num produto de decisão clínica.
   *
   * Restrição estrutural e posição a evitar não têm "mais estrita": ou a condição pede, ou
   * não pede. Somar é o conservador aqui, do mesmo jeito que o menor limite é o conservador
   * nas penalidades.
   */
  const estruturais: RestricaoTag[] = [];
  for (const r of rules) for (const t of r.restricoesEstruturais ?? []) if (!estruturais.includes(t)) estruturais.push(t);
  const posicoes: NonNullable<GroupGpsRule["posicoesEvitar"]> = [];
  for (const r of rules) for (const p of r.posicoesEvitar ?? []) if (!posicoes.includes(p)) posicoes.push(p);

  return {
    slug: rules.map((r) => r.slug).join("+"),
    nome: rules.map((r) => r.nome).join(" + "),
    cuidados,
    penalidades: [...penMap.values()],
    complexidadeMax: maxes.length ? Math.min(...maxes) : undefined,
    restricaoSugerida: rules.find((r) => r.restricaoSugerida)?.restricaoSugerida,
    restricoesEstruturais: estruturais.length ? estruturais : undefined,
    posicoesEvitar: posicoes.length ? posicoes : undefined,
    // Mesma lógica de união: basta UMA condição pedir para que a fusão peça.
    evitarFlexaoColunaCarregada: rules.some((r) => r.evitarFlexaoColunaCarregada) || undefined,
    evitarMembrosAcimaDoCoracao: rules.some((r) => r.evitarMembrosAcimaDoCoracao) || undefined,
    modDose: fundirModDose(rules.map((r) => r.modDose).filter((m): m is ModDose => Boolean(m))),
    modAerobio: fundirModAerobio(rules.map((r) => r.modAerobio).filter((m): m is ModAerobio => Boolean(m))),
    // Mais conservador aqui é o horizonte MAIOR: se uma condição precisa de 12 semanas e
    // outra de 24, o aluno que tem as duas precisa das 24 para o segundo desfecho aparecer.
    horizonteMinimoSemanas: (() => {
      const hs = rules.map((r) => r.horizonteMinimoSemanas).filter((n): n is number => typeof n === "number");
      return hs.length ? Math.max(...hs) : undefined;
    })(),
    refs,
    modProgressao: fundirModProgressao(
      rules.map((r) => r.modProgressao).filter((m): m is ModProgressao => Boolean(m)),
    ),
    monitoramento: fundirMonitoramento(
      rules.map((r) => r.monitoramento).filter((m): m is EfeitoMonitoramento => Boolean(m)),
    ),
  };
}

/**
 * Funde os modificadores de progressão de VÁRIAS condições no mais CONSERVADOR: menor teto de
 * esforço, menor fator de incremento (passo mais curto) e descarga mais frequente. Assim um aluno
 * idoso + hipertenso progride pelo mais rígido dos dois. Devolve undefined quando nenhuma condição
 * declara modificador (progride no passo padrão).
 *
 * Recebe os modificadores já extraídos, e não as regras, para que qualquer fonte possa
 * contribuir com um (a camada de fármacos usa o mesmo tipo). Um modificador só nunca
 * afrouxa nada: a fusão é sempre por mínimo.
 */
export function fundirModProgressao(mods: ModProgressao[]): ModProgressao | undefined {
  if (mods.length === 0) return undefined;
  if (mods.length === 1) return mods[0];
  const min = (xs: (number | undefined)[]) => {
    const nums = xs.filter((n): n is number => typeof n === "number");
    return nums.length ? Math.min(...nums) : undefined;
  };
  const motivos: string[] = [];
  const refId: string[] = [];
  for (const m of mods) {
    if (!motivos.includes(m.motivo)) motivos.push(m.motivo);
    for (const r of m.refId ?? []) if (!refId.includes(r)) refId.push(r);
  }
  return {
    pseTeto: min(mods.map((m) => m.pseTeto)),
    fatorIncremento: min(mods.map((m) => m.fatorIncremento)),
    descargaCadaSemanas: min(mods.map((m) => m.descargaCadaSemanas)),
    motivo: motivos.join(" "),
    cautela: mods.some((m) => m.cautela),
    refId: refId.length ? refId : undefined,
  };
}

/**
 * O modificador de progressão combinado de um aluno NÃO se pede aqui: peça a
 * `modProgressaoDoPerfil` (src/lib/gps/farmacos.ts), que soma as condições clínicas e as classes
 * de medicação declaradas na mesma fusão. A função `modProgressaoDe`, que só lia os grupos,
 * saiu de propósito: com a camada de fármacos no ar, uma porta que ignora a medicação é uma
 * porta que devolve um passo de carga desatualizado sem ninguém perceber.
 */
