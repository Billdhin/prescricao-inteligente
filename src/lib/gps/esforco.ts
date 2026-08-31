/**
 * ESCALA DE ESFORÇO UNIFICADA, e a camada de dose por IDADE que ela torna possível.
 *
 * Decisão do Filipe, 14/08/2026: *"Você deve montar uma escala de esforço unificada para o
 * motor poder reduzir a dose sozinho por idade [...] levando em consideração as
 * características do paciente"*.
 *
 * ## O que a rodada de PubMed mudou no desenho
 *
 * A proposta original era traduzir os "70 a 79% de 1RM" da metanálise de idosos em reserva
 * de repetições, para o motor poder apertar a dose dos objetivos que treinam por reserva.
 * **A evidência não sustenta essa ponte**, e é melhor saber disso antes de construí-la:
 *
 * - Rodríguez-Rosell 2020 (doi 10.1519/JSC.0000000000002881): o número de repetições que a
 *   pessoa completa NUM MESMO %1RM varia muito entre indivíduos, com CV de 15 a 22% no
 *   supino e de 26 a 34% no agachamento. Mesma carga relativa, número de repetições
 *   diferente. Uma tabela %1RM para RIR seria precisão inventada.
 * - Zourdos 2021 (doi 10.1519/JSC.0000000000002995): a precisão do próprio RIR PIORA quanto
 *   mais longe da falha e quanto mais repetições tem a série. Erro medido: 2,05 ± 1,73
 *   repetições no RPE 9, 3,65 ± 2,46 no RPE 7 e 5,15 ± 2,92 no RPE 5. Mais repetições por
 *   série previu imprecisão; tempo de treino NÃO previu (p > 0,05).
 *
 * A alternativa objetiva existe e é boa (perda de velocidade prevê o percentual de
 * repetições feitas com R = 0,97 no supino, González-Badillo 2017, doi 10.1055/s-0042-120324),
 * mas exige encoder de velocidade. Fica fora por INSTRUMENTO, não por evidência.
 *
 * ## Então o que "unificada" quer dizer aqui
 *
 * Não uma tradução nova, e sim o reconhecimento de que o produto já tem UM instrumento de
 * esforço, a escala de reserva de repetições, e que ele estava faltando num objetivo. A
 * escada que já existia, toda declarada como escolha prudente da casa:
 *
 *     Hipertrofia ............ 1 a 3 de reserva     (carga moderada, mais perto da falha)
 *     Força .................. 2 a 4 de reserva     (carga absoluta maior, mais margem)
 *     Resistência muscular ... 3 a 5 de reserva     (ESTE ARQUIVO fecha o degrau que faltava)
 *
 * O degrau novo segue o mesmo espaçamento e a mesma direção dos dois que já estavam lá, e
 * tem uma razão a mais, que é medida: em série de MUITAS repetições o RIR é justamente onde
 * erra mais (5,15 rep no RPE 5), então ficar mais longe da falha é o que a imprecisão do
 * próprio instrumento recomenda.
 *
 * A ponte com o aeróbio não é estimada, é DEFINIÇÃO da escala de Zourdos: `RPE = 10 − RIR`.
 * Por isso `rpeDeRir` não cita evidência de conversão: não há o que converter.
 *
 * ## A camada de idade
 *
 * `groupRules.ts` já registrava, na regra do idoso destreinado, por que a evidência de dose
 * por faixa etária não tinha virado regra: *"exige uma camada nova, uma modulação por IDADE
 * ao lado da modulação por condição, com a mesma lei de fusão conservadora [...] idade não é
 * condição: o aluno de 70 anos pode não ter nenhuma"*. É esta camada.
 *
 * O que ela NÃO faz, e o porquê importa: não aplica os 70 a 79% de 1RM de Borde 2015 como
 * teto de carga. Foi conferido no catálogo de objetivos: **nenhum objetivo declara faixa de
 * %1RM acima de 79** (Resistência muscular cita 40 a 60 e os demais não expressam %1RM),
 * então um `cargaRelativaMax: 79` não morderia em lugar nenhum. Seria regra morta com cara
 * de segurança, que é um defeito que este motor já pagou caro.
 *
 * O que ela faz é agir no eixo de esforço, que é o único que alcança todos os objetivos.
 */
import type { ModDose, GroupGpsRule } from "./groupRules";
import { doseDoPerfil, fundirModDose } from "./groupRules";

/** Definição da escala de reserva (Zourdos): esforço percebido é o complemento da reserva. */
export const rpeDeRir = (rir: number): number => Math.min(10, Math.max(0, 10 - rir));
/** O inverso, pela mesma definição. */
export const rirDeRpe = (rpe: number): number => Math.min(10, Math.max(0, 10 - rpe));

/**
 * A idade a partir da qual a dose aperta sozinha, e de onde ela vem.
 *
 * 65 anos é o corte da população da metanálise de Borde 2015 (PMID 26420238,
 * doi 10.1007/s40279-015-0385-9), que estudou adultos com média de 65 anos ou mais. Um
 * segundo corte (75, 80) seria invenção: a evidência citada tem UMA população.
 */
export const IDADE_DOSE_PROPRIA = 65;

/**
 * O piso de reserva aplicado a partir dessa idade.
 *
 * É ESCOLHA PRUDENTE DA CASA, não número de diretriz, exatamente como as faixas de reserva
 * da Hipertrofia e da Força já são, e precisa continuar rotulado assim onde aparecer ao
 * usuário. O que a evidência sustenta é a DIREÇÃO, não o número: Borde 2015 encontrou o
 * maior efeito sobre força nesta população em intensidade de 70 a 79% de 1RM, ou seja
 * moderada a alta, e não máxima. Manter pelo menos 3 repetições de reserva é a forma de
 * dizer isso no único vocabulário que alcança todos os objetivos.
 *
 * As limitações que os próprios autores declaram pesam e por isso o passo é de UM degrau, e
 * não de vários: PEDro médio 4,6, I² de 80%, e eles escrevem que os resultados podem não
 * representar uma única relação dose-resposta porque as interações entre as variáveis não
 * puderam ser estimadas.
 */
export const RIR_MINIMO_IDADE = 3;

/**
 * A dose que a IDADE impõe, no formato dos modificadores clínicos, ou nada.
 *
 * Devolve `ModDose` de propósito: assim ela funde com a da condição pela lei que já existe,
 * sem caminho paralelo. Em quem tem condição declarada mais conservadora, a condição vence,
 * porque a fusão pega o `Math.max` do piso de reserva.
 */
export function modDosePorIdade(idade?: number): ModDose | undefined {
  if (idade == null || idade < IDADE_DOSE_PROPRIA) return undefined;
  return {
    rirMinimo: RIR_MINIMO_IDADE,
    motivo: `A partir de ${IDADE_DOSE_PROPRIA} anos a dose guarda pelo menos ${RIR_MINIMO_IDADE} repetições de reserva nas séries principais. A faixa etária tem dose própria na literatura, com maior efeito sobre força em intensidade moderada a alta e não máxima; a reserva é escolha prudente da casa para dizer isso na escala que o aluno consegue usar.`,
    refId: ["borde-idoso-dose-2015"],
  };
}

/**
 * A dose do perfil COM a idade junto: é o que o motor deve consumir.
 *
 * Substitui `doseDoPerfil` nos pontos em que o plano monta o contexto do alvo. Quando não há
 * idade informada nem condição, devolve `undefined` e nada muda, que é o comportamento de
 * quem não declarou nada.
 */
export function doseDoPerfilComIdade(regra: GroupGpsRule | undefined, idade?: number): ModDose | undefined {
  const daCondicao = doseDoPerfil(regra);
  // "idade" é uma origem legítima e precisa se identificar como as outras: o profissional
  // que lê "teto de 80%" merece saber quando quem pediu foi a idade, e não uma condição.
  const bruta = modDosePorIdade(idade);
  const daIdade = bruta ? { ...bruta, de: "idade" } : undefined;
  if (!daCondicao && !daIdade) return undefined;
  // Passa pela fusão mesmo com um só: é ela que calcula a procedência (ver fundirModDose).
  return fundirModDose([daCondicao, daIdade].filter((m): m is ModDose => Boolean(m)));
}
