/**
 * Guardrail: nenhuma regra de progressão entra no motor sem referência real.
 *
 * Roda com `npm run check:regras`. O rulepack (src/data/regrasProgressao.ts) é a fonte
 * única de todo número de progressão do treino; este check garante que a fonte não minta:
 *
 * 1. TODO refId aponta para uma referência que existe em referencias.ts. Citar um estudo
 *    que não está na bibliografia é o mesmo que inventar a fonte do número.
 * 2. TODA regra "aprovada" (a que vai ao ar com número) tem ao menos uma referência.
 * 3. TODA regra tem versao >= 1 e confiança válida. O versionamento é o contrato de
 *    "mudou número, subiu versão"; sem ele o rastro de evidência se perde.
 * 4. NENHUMA regra "aprovada" tem confiança "fraca": evidência fraca é DECLARADA como
 *    "pendente" e não cravada, nunca vendida como aprovada.
 *
 * O check também recusa um rulepack vazio: sem regra, as verificações acima passariam
 * por vazio e a proteção sumiria inteira.
 */
import { REGRAS_PROGRESSAO } from "../src/data/regrasProgressao";
import { getReferencia } from "../src/data/referencias";
import { scoreExercise, rankExercises } from "../src/lib/gps/engine";
import { EFEITO_POR_TAG, type AcaoRestricao } from "../src/lib/gps/restricoes";
import { exercises } from "../src/data/exercises";
import { groupGpsRules } from "../src/lib/gps/groupRules";
import { specialGroups } from "../src/data/specialGroups";
import type { Nivel } from "../src/data/types";

const CONFIANCAS = ["forte", "moderada", "fraca"];
const erros: string[] = [];

if (REGRAS_PROGRESSAO.length === 0) {
  erros.push("rulepack vazio: sem regra, este guardrail passaria por vazio.");
}

for (const regra of REGRAS_PROGRESSAO) {
  // 1. cada refId aponta para uma referência real
  for (const id of regra.refId) {
    if (!getReferencia(id)) {
      erros.push(`refId inexistente: a regra "${regra.id}" cita "${id}", que não está em referencias.ts.`);
    }
  }
  // 2. regra aprovada tem pelo menos um refId
  if (regra.aprovacao === "aprovada" && regra.refId.length === 0) {
    erros.push(`regra aprovada sem referência: "${regra.id}" está "aprovada" mas não cita nenhum refId.`);
  }
  // 3. versao válida e confiança válida
  if (!(regra.versao >= 1)) {
    erros.push(`versao inválida: a regra "${regra.id}" tem versao ${regra.versao} (esperado >= 1).`);
  }
  if (!CONFIANCAS.includes(regra.confianca)) {
    erros.push(`confiança inválida: a regra "${regra.id}" tem confianca "${regra.confianca}".`);
  }
  // 4. nenhuma regra aprovada com confiança fraca
  if (regra.aprovacao === "aprovada" && regra.confianca === "fraca") {
    erros.push(`aprovada com confiança fraca: "${regra.id}" deve ser declarada como "pendente" enquanto a evidência for fraca.`);
  }
}

/*
 * OS CINCO NÍVEIS DE AÇÃO DE RESTRIÇÃO PRECISAM SER DISTINGUÍVEIS NO RANQUEAMENTO.
 *
 * `preferir` era código morto no motor de ranqueamento: a razão começava em 1, o nível mais
 * alto valia 1, e a agregação era `Math.min`, que nunca sobe. O exercício marcado como
 * PREFERIDO para a restrição declarada do aluno pontuava exatamente igual a um exercício sem
 * relação nenhuma com ela. E `adaptar` ficava ABAIXO do neutro, apesar de ser o próprio
 * sentinela neutro dos avaliadores (restricoes.ts: `NEUTRO = { acao: "adaptar" }`).
 *
 * A asserção exige a ORDEM entre os níveis e não fixa valor nenhum, então ela continua
 * valendo se a casa recalibrar a escala.
 */
{
  const alvo = exercises[0];
  if (!alvo) {
    erros.push("controle positivo: o catálogo de exercícios está vazio; a asserção de restrição não testa nada.");
  } else {
    const TAG = "__teste_ordem__" as never;
    const razaoCom = (acao: AcaoRestricao | null): number => {
      if (acao) (EFEITO_POR_TAG as Record<string, unknown>)[TAG] = () => ({ acao, motivo: "caso de teste" });
      const r = scoreExercise(alvo, {
        objetivo: "Hipertrofia",
        grupoMuscular: alvo.grupoMuscular,
        nivel: alvo.nivel,
        equipamentos: [alvo.equipamento],
        restricoes: acao ? [{ tag: TAG } as never] : [],
      });
      const b = r.breakdown.find((c) => c.criterio === "Restrição")!;
      return +(b.peso / b.pontosPossiveis).toFixed(4);
    };

    const semRestricao = razaoCom(null);
    const ordem: AcaoRestricao[] = ["preferir", "adaptar", "penalizar_moderado", "penalizar_forte"];
    const razoes = ordem.map((a) => razaoCom(a));

    if (!(razoes[0] > semRestricao))
      erros.push(
        `"preferir" não levanta o ranqueamento: razão ${razoes[0]} contra ${semRestricao} sem restrição declarada. ` +
          `O nível mais alto do vocabulário fica inerte.`,
      );
    if (razoes[1] !== semRestricao)
      erros.push(
        `"adaptar" não empata com o neutro: razão ${razoes[1]} contra ${semRestricao}. ` +
          `adaptar é o próprio sentinela neutro dos avaliadores de restrição.`,
      );
    for (let i = 1; i < ordem.length - 1; i++)
      if (!(razoes[i] > razoes[i + 1]))
        erros.push(`"${ordem[i]}" não pontua acima de "${ordem[i + 1]}": ${razoes[i]} contra ${razoes[i + 1]}.`);
    delete (EFEITO_POR_TAG as Record<string, unknown>)[TAG];
  }
}

/*
 * A REGRA CLÍNICA TEM QUE APLICAR O QUE A FONTE DIZ, E NÃO UM SUBSTITUTO PARECIDO.
 *
 * Caso concreto que originou este bloco, na osteoporose. O posicionamento da ESSA
 * (`beck-essa-2017`) diz duas coisas no mesmo parágrafo: o osso responde a impacto e a
 * treino resistido progressivo de ALTA INTENSIDADE, e a flexão de coluna CARREGADA não é
 * recomendada. A regra do produto não tinha o fato "flexão carregada" e usava a métrica
 * "Demanda lombar >= 60" como substituta. Medido no ranqueamento de Força para osteoporose,
 * ANTES da correção:
 *
 *   abdominal na polia alta (flexão de tronco contra carga)  ....  #16
 *   levantamento terra (dobradiça de quadril, coluna neutra)  ...  #47
 *
 * Ou seja, o exercício que a fonte desaconselha nominalmente vinha 31 posições À FRENTE do
 * exercício que a fonte recomenda. O substituto não era impreciso: era invertido.
 */
{
  const rule = groupGpsRules["osteoporose"];
  if (!rule) {
    erros.push("controle positivo: a regra de osteoporose sumiu; o bloco clínico não testa nada.");
  } else {
    if (!rule.evitarFlexaoColunaCarregada)
      erros.push(
        'osteoporose não aplica "evitar flexão de coluna carregada", que é o padrão que beck-essa-2017 desaconselha nominalmente.',
      );
    if (rule.penalidades.some((p) => p.metrica === "Demanda lombar"))
      erros.push(
        'osteoporose voltou a penalizar a métrica "Demanda lombar": ela rebaixa a dobradiça de quadril com coluna neutra, que é o treino resistido que a fonte RECOMENDA, e não alcança o abdominal na polia (demanda lombar 40).',
      );
    for (const ref of ["beck-essa-2017", "giangregorio-2014"])
      if (!rule.refs?.includes(ref))
        erros.push(`a regra de osteoporose não cita "${ref}", que é a fonte específica da condição e estava só no semáforo.`);

    // O fato precisa existir no catálogo, senão a regra acima é decorativa.
    const carregados = exercises.filter((e) => e.restricaoPerfil?.flexaoColunaCarregada);
    if (carregados.length === 0)
      erros.push("nenhum exercício do catálogo está marcado como flexão de coluna carregada: a regra da osteoporose não tem o que evitar.");

    // E o ranqueamento tem que refletir: o padrão desaconselhado abaixo do recomendado.
    const ans = {
      objetivo: "Força" as const,
      grupoMuscular: "Corpo todo",
      nivel: "Intermediário" as Nivel,
      restricoes: [],
      equipamentos: exercises.map((e) => e.equipamento),
    };
    const rank = rankExercises(exercises, ans, rule);
    const posDe = (slug: string) => rank.findIndex((r) => r.exercise.slug === slug);
    const flexao = posDe("abdominal-polia-alta");
    const resistido = posDe("levantamento-terra");
    if (flexao < 0 || resistido < 0) {
      erros.push("controle positivo: os exercícios de referência do teste de osteoporose não estão no ranking.");
    } else if (flexao < resistido) {
      erros.push(
        `na osteoporose o abdominal na polia (flexão carregada, desaconselhado) aparece em #${flexao + 1}, à frente do levantamento terra (coluna neutra, recomendado) em #${resistido + 1}.`,
      );
    }
  }
}

/*
 * A APNEIA DO SONO NÃO PODE CONDICIONAR O BENEFÍCIO À PERDA DE PESO.
 *
 * `iftikhar-apneia-2014` conclui redução do índice de apneia e hipopneia de 6,27 eventos/h
 * COM MUDANÇA MÍNIMA DE PESO: o IMC caiu 1,37 com IC 95% de -2,81 a 0,07 e p = 0,06, ou
 * seja, não significativo. O produto dizia que "aeróbio + força apoiam a perda de peso, que
 * reduz a gravidade" e listava como erro comum "programa sem componente de perda de peso",
 * que é exatamente o contrário do que a metanálise que ele cita mostra.
 */
{
  const rule = groupGpsRules["apneia-sono"];
  const grupo = specialGroups.find((g) => g.slug === "apneia-sono");
  if (!rule || !grupo) {
    erros.push("controle positivo: a condição apneia-sono sumiu; o bloco não testa nada.");
  } else {
    if (!rule.refs?.includes("iftikhar-apneia-2014"))
      erros.push('a regra de apneia do sono não cita "iftikhar-apneia-2014", que é a fonte do efeito na apneia.');
    const textos = [...rule.cuidados, grupo.perfil, grupo.comoComecar, ...grupo.objetivos, ...grupo.errosComuns].join(" ");
    if (/perda de peso, que reduz a gravidade|peso.{0,20}reduz a gravidade/i.test(textos))
      erros.push("a apneia do sono volta a atribuir a redução da gravidade à perda de peso, que a metanálise citada não sustenta.");
    if (/sem componente de perda de peso/i.test(textos))
      erros.push('"programa sem componente de perda de peso" voltou como erro comum, e é o inverso do que a evidência mostra.');
  }
}

if (erros.length) {
  console.error(`\n[check:regras] ${erros.length} problema(s):\n`);
  for (const e of erros) console.error(`  - ${e}`);
  console.error("");
  process.exit(1);
}
console.log(`[check:regras] ok: ${REGRAS_PROGRESSAO.length} regras, todas com referência real.`);
