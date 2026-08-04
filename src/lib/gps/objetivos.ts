/**
 * Objetivo PRIMÁRIO e SECUNDÁRIO, e a compatibilidade entre os dois.
 *
 * O pedido do fundador foi "poder escolher mais de um objetivo, com regras que
 * façam sentido; por exemplo, não tem como uma pessoa querer emagrecer e engordar
 * ao mesmo tempo. Valide isso cientificamente."
 *
 * Duas observações honestas antes das regras.
 *
 * 1. "Engordar" NÃO é objetivo deste catálogo. Os seis objetivos são emagrecimento,
 *    hipertrofia, força, resistência muscular, retorno ao treino e aprendizado
 *    técnico. O par mais próximo do exemplo dele é emagrecimento com hipertrofia.
 * 2. Esse par NÃO é impossível, e dizer que é seria mentir para o profissional.
 *    Longland (2016), ensaio randomizado com 40 homens jovens em déficit energético
 *    acentuado por 4 semanas, mediu ganho de massa magra de 1,2 kg com perda de
 *    4,8 kg de gordura no grupo com maior ingestão proteica. Ou seja: é POSSÍVEL e
 *    CONDICIONADO (treino de força mantido, ingestão proteica adequada, ganho de
 *    massa magra modesto), não incompatível. É isso que a matriz diz.
 *
 * Por isso a compatibilidade tem TRÊS estados, não dois:
 *
 *   soma        os dois objetivos se somam; a mesma sessão serve aos dois.
 *   condicional possível, com custo declarado e condição explícita.
 *   incompativel não combine; a matriz diz o porquê e o que fazer no lugar.
 *
 * Toda linha "condicional" cita referência VERIFICADA no PubMed (id em
 * src/data/referencias.ts, com DOI). Nenhuma linha inventa número de série, de
 * minuto ou de proteína: a matriz declara a CONDIÇÃO, não a dose.
 *
 * A matriz é ORIENTADA: o par (primário, secundário) não é simétrico, porque quem
 * manda na sessão é o primário. O guardrail check:objetivos trava a cobertura.
 */

import type { GpsObjetivo } from "@/lib/gps/engine";

export type EstadoCompat = "soma" | "condicional" | "incompativel";

export interface Compatibilidade {
  estado: EstadoCompat;
  /** Uma frase, na língua do profissional, dizendo o que acontece ao combinar. */
  resumo: string;
  /** O que precisa ser verdade para a combinação valer (só em "condicional"). */
  condicao?: string;
  /** O que fazer no lugar (só em "incompativel"). */
  emVezDisso?: string;
  /** Ids de src/data/referencias.ts. Vazio quando a regra é estrutural, não empírica. */
  refIds: string[];
}

/**
 * Objetivos que descrevem uma FASE do cuidado, não um alvo a perseguir em paralelo.
 * Valem como PRIMÁRIO (o aluno está voltando a treinar) e nunca como secundário
 * (ninguém "também quer retornar"). É a única assimetria proposital da matriz, e o
 * guardrail check:objetivos a verifica em vez de tolerá-la.
 */
export const DE_TRANSICAO: GpsObjetivo[] = ["Retorno ao treino"];

const SOMA = (resumo: string, refIds: string[] = []): Compatibilidade => ({
  estado: "soma",
  resumo,
  refIds,
});

/**
 * A matriz, por objetivo PRIMÁRIO. Ausência de par na tabela = "soma" com a frase
 * genérica: são objetivos que não disputam a mesma variável da sessão.
 */
const MATRIZ: Partial<Record<GpsObjetivo, Partial<Record<GpsObjetivo, Compatibilidade>>>> = {
  Emagrecimento: {
    Hipertrofia: {
      estado: "condicional",
      resumo:
        "Dá para perder gordura e ganhar massa magra no mesmo ciclo, mas o ganho de massa é modesto e não é o que manda no plano.",
      condicao:
        "Manter o treino de força durante o déficit e garantir ingestão proteica adequada (a parte alimentar é conduta de nutricionista). Sem isso, o déficit come também a massa magra.",
      refIds: ["longland-recomposicao-2016", "wilson-concorrente-2012"],
    },
    Força: {
      estado: "condicional",
      resumo:
        "Manter e até subir força durante o emagrecimento é realista; bater recorde de força não é o alvo deste ciclo.",
      condicao:
        "Preservar a carga nas séries principais e não trocar força por volume de aeróbio. O aeróbio entra depois da força na mesma sessão.",
      refIds: ["longland-recomposicao-2016", "eddens-ordem-2018"],
    },
  },

  Hipertrofia: {
    Emagrecimento: {
      estado: "condicional",
      resumo:
        "Hipertrofia com emagrecimento secundário significa treinar para crescer enquanto o aeróbio entra como apoio, e o crescimento fica mais lento.",
      condicao:
        "Controlar o volume e a modalidade do aeróbio. Na metanálise de Wilson (2012), correr concorrente reduziu hipertrofia e força de forma significativa e pedalar não, e frequência e duração maiores do aeróbio se associaram a perdas maiores.",
      refIds: ["wilson-concorrente-2012", "longland-recomposicao-2016"],
    },
    Força: SOMA(
      "A mesma sessão serve aos dois: mudam a ênfase de carga e a faixa de repetições, não os exercícios.",
      ["schoenfeld-carga-2016"],
    ),
  },

  "Força": {
    Emagrecimento: {
      estado: "condicional",
      resumo:
        "Força como alvo e emagrecimento como apoio funciona, com atenção ao quanto de aeróbio entra na semana.",
      condicao:
        "Força antes do aeróbio na mesma sessão (a ordem favoreceu a força dinâmica de membros inferiores em Eddens, 2018) e volume de aeróbio contido.",
      refIds: ["eddens-ordem-2018", "wilson-concorrente-2012"],
    },
    Hipertrofia: SOMA(
      "Somam-se: a base de exercícios é a mesma e a diferença é de ênfase, carga mais alta para força e mais volume para hipertrofia.",
      ["schoenfeld-carga-2016"],
    ),
    "Resistência muscular": {
      estado: "condicional",
      resumo:
        "São as duas pontas do mesmo eixo carga e repetição: perseguir as duas ao mesmo tempo divide a sessão em vez de somar.",
      condicao:
        "Separar em blocos ou em dias diferentes, com a força ficando com a carga alta. Cargas até 50% de 1RM produzem ganho de força em destreinados, mas a carga alta levou vantagem na metanálise de Schoenfeld (2016).",
      refIds: ["schoenfeld-carga-2016"],
    },
  },

  "Resistência muscular": {
    "Força": {
      estado: "condicional",
      resumo:
        "Resistência com força secundária é possível, com a força entrando em poucas séries pesadas e não na sessão inteira.",
      condicao:
        "Reservar a carga alta para os exercícios principais e manter o resto na faixa de repetições altas.",
      refIds: ["schoenfeld-carga-2016"],
    },
  },

  "Retorno ao treino": {
    Hipertrofia: {
      estado: "condicional",
      resumo:
        "No retorno, o alvo primeiro é reconstruir tolerância; a ênfase de crescimento entra quando a base estiver de pé.",
      condicao:
        "Progredir por tolerância (sem dor, sem piora de sintoma) antes de perseguir volume de hipertrofia. Reavaliar antes de mudar a ênfase.",
      refIds: ["acsm-progressao-2009"],
    },
    "Força": {
      estado: "condicional",
      resumo:
        "No retorno, subir carga é consequência da tolerância recuperada, não a meta da primeira fase.",
      condicao:
        "Progredir por tolerância antes de perseguir carga. Reavaliar antes de mudar a ênfase.",
      refIds: ["acsm-progressao-2009"],
    },
  },
};

/** Frase genérica quando o par não disputa nada. */
const SOMA_PADRAO =
  "Somam-se: não disputam a mesma variável da sessão, então um não atrapalha o outro.";

/**
 * Compatibilidade do par ORIENTADO (o primário manda na sessão).
 * Sem secundário, não há o que checar.
 */
export function compatibilidadeObjetivos(
  primario: GpsObjetivo,
  secundario?: GpsObjetivo,
): Compatibilidade | undefined {
  if (!secundario) return undefined;

  if (secundario === primario) {
    return {
      estado: "incompativel",
      resumo: "O secundário é o mesmo objetivo do primário, então ele não acrescenta nada.",
      emVezDisso: "Deixe sem objetivo secundário, ou escolha outro que some ao primeiro.",
      refIds: [],
    };
  }

  // "Retorno ao treino" descreve o MOMENTO do aluno, não um alvo paralelo: ninguém
  // "também quer retornar" enquanto persegue outra coisa. Como secundário, ele
  // sempre reprova, e a saída é trocar o primário.
  if (DE_TRANSICAO.includes(secundario)) {
    return {
      estado: "incompativel",
      resumo: `"${secundario}" descreve a fase em que o aluno está, não um alvo a perseguir junto de outro.`,
      emVezDisso: `Se o aluno está voltando a treinar, coloque "${secundario}" como objetivo PRINCIPAL e o outro como secundário.`,
      refIds: [],
    };
  }

  return MATRIZ[primario]?.[secundario] ?? SOMA(SOMA_PADRAO);
}

/** Os secundários oferecíveis para um primário, já com o veredito de cada um. */
export function secundariosDe(
  primario: GpsObjetivo,
  todos: GpsObjetivo[],
): { objetivo: GpsObjetivo; compat: Compatibilidade }[] {
  return todos
    .filter((o) => o !== primario && !DE_TRANSICAO.includes(o))
    .map((o) => ({ objetivo: o, compat: compatibilidadeObjetivos(primario, o)! }));
}

/** O par pode ser gravado? Só "incompativel" barra; "condicional" é decisão do profissional. */
export function parValido(primario: GpsObjetivo, secundario?: GpsObjetivo): boolean {
  const c = compatibilidadeObjetivos(primario, secundario);
  return !c || c.estado !== "incompativel";
}

/** Rótulo curto do estado, para pill e para o PDF. */
export const ROTULO_COMPAT: Record<EstadoCompat, string> = {
  soma: "Somam",
  condicional: "Com condição",
  incompativel: "Não combine",
};

/**
 * Linha única para documento (prontuário, plano, PDF): o par e o que ele implica.
 * Devolve undefined quando não há secundário, para o documento simplesmente não
 * imprimir a linha em vez de imprimir "nenhum".
 */
export function linhaObjetivos(
  primario: GpsObjetivo,
  secundario?: GpsObjetivo,
): string | undefined {
  const c = compatibilidadeObjetivos(primario, secundario);
  if (!c || !secundario) return undefined;
  const base = `${primario} (principal) com ${secundario} (secundário): ${c.resumo}`;
  return c.condicao ? `${base} Condição: ${c.condicao}` : base;
}

/**
 * O par de objetivos em UMA linha curta, para cabeçalho, documento e app do aluno.
 *
 * ## Por que virou helper
 *
 * O par primário + secundário existia no cadastro, no perfil, no Prescrever exercício e no
 * Prescrever treino, e sumia em tudo o que era saída: os três PDFs, o app do aluno e o
 * cabeçalho do plano imprimiam só o primário, cada um formatando à mão. O efeito prático é
 * o que o Filipe apontou, e a regra que ele deu vale para o sistema inteiro: **se em algum
 * lugar dá para escolher dois objetivos, isso tem que ser verdade em todas as ações daquele
 * aluno**. Um documento que esconde o segundo objetivo desmente a tela onde ele foi
 * escolhido.
 *
 * Fonte única de formatação. Sem secundário, devolve exatamente o primário, então todo
 * ponto que já imprimia `objetivo` continua byte-idêntico.
 */
export function rotuloObjetivoPar(primario: GpsObjetivo, secundario?: GpsObjetivo): string {
  if (!secundario || secundario === primario) return primario;
  return `${primario} + ${secundario}`;
}

/**
 * O objetivo `alvo` é atendido por este par? Serve para não acusar divergência onde o
 * profissional prescreveu justamente para o segundo objetivo do aluno.
 */
export function parAtende(
  alvo: GpsObjetivo,
  primario: GpsObjetivo,
  secundario?: GpsObjetivo,
): boolean {
  return alvo === primario || alvo === secundario;
}
