/**
 * Instrumento de medida da rodada de evidência: **quanto a condição do aluno muda o
 * treino que ele recebe.**
 *
 * O Filipe descreveu o sintoma ("a prescrição sai pobre, aparecem sempre as mesmas
 * referências") e a auditoria localizou a causa: o motor tem poucas alavancas de
 * modulação, então condições clinicamente muito diferentes saem com a mesma dose. Isto
 * aqui transforma esse diagnóstico em número, para a rodada poder ser cobrada.
 *
 * Não é guardrail e não reprova nada. É régua: roda antes e depois e a diferença entre as
 * duas saídas é o resultado da rodada. O guardrail que TRAVA a regressão é
 * `check:distintividade`, e ele nasce depois, com a meta já atingida.
 *
 * Método: fixa objetivo, nível, horizonte e frequência, varia SÓ a condição, e compara a
 * dose prescrita. Duas condições que produzem a mesma assinatura recebem, na prática, o
 * mesmo treino.
 */
import { gerarPlano } from "@/lib/gps/periodizacao";
import { specialGroups } from "@/data/specialGroups";

/** Dose de uma semana, reduzida ao que o aluno de fato executa. */
interface Assinatura {
  series: string;
  reps: string;
  intervalo: string;
  intensidade: string;
  rir: string;
  aerobio: string;
}

/*
 * Configurável por variável de ambiente, e isso não é conveniência: é correção de um ponto
 * cego. Medindo só em Iniciante, a régua não enxergou o `rirMinimo` da hipertensão passar a
 * valer, porque o iniciante já recebe o extremo conservador de toda faixa. Uma cautela
 * clínica que só aparece em quem já treina fica invisível num corte de iniciante, e concluir
 * dali que ela não funciona seria erro de medida, não de motor.
 */
const OBJETIVO = (process.env.MD_OBJETIVO ?? "Hipertrofia") as "Hipertrofia";
const NIVEL = (process.env.MD_NIVEL ?? "Iniciante") as "Iniciante";
const SEMANAS = Number(process.env.MD_SEMANAS ?? 12);
const FREQ = Number(process.env.MD_FREQ ?? 3);

/**
 * Reduz o plano a uma assinatura de dose. Só entram variáveis que chegam ao aluno; a
 * ordem da lista de exercícios fica de fora de propósito, porque trocar a ordem dos
 * exercícios não é prescrever diferente, e contar isso como diferença mascararia
 * exatamente o defeito que estamos medindo.
 */
function assinatura(grupo?: string): Assinatura {
  const plano = gerarPlano({
    objetivo: OBJETIVO,
    nivel: NIVEL,
    semanas: SEMANAS,
    frequencia: FREQ,
    grupoEspecial: grupo,
  });

  /*
   * A assinatura é a SEQUÊNCIA semana a semana, não o conjunto de valores.
   *
   * A primeira versão usava conjunto e foi cega à primeira correção da rodada: ligar a
   * cadência de descarga da condição muda EM QUAIS semanas o aluno descarrega, e o
   * conjunto de valores continua o mesmo. Duas prescrições com os mesmos números em
   * semanas diferentes não são a mesma prescrição, e uma régua que não vê isso mede a
   * coisa errada.
   */
  const porSemana: string[][] = [[], [], [], [], [], []];

  for (const meso of plano.principal.mesociclos)
    for (const micro of meso.microciclos) {
      const blocos = micro.sessoes.flatMap((s) => s.blocos);
      const forca = blocos.find((b) => b.seriesAlvo != null);
      const aer = blocos.find((b) => b.duracaoAlvo != null || b.formato);
      porSemana[0].push(String(forca?.seriesAlvo ?? "-"));
      porSemana[1].push(String(forca?.repsAlvo ?? "-"));
      porSemana[2].push(String(forca?.intervaloAlvo ?? "-"));
      porSemana[3].push(String(forca?.cargaRelativaAlvo ?? "-"));
      porSemana[4].push(String(forca?.rirAlvo ?? "-"));
      porSemana[5].push(`${aer?.formato ?? "-"}/${aer?.modalidade ?? "-"}/${aer?.duracaoAlvo ?? "-"}/${aer?.rpeAlvo ?? "-"}`);
    }

  const seq = (xs: string[]) => xs.join(">");
  return {
    series: seq(porSemana[0]),
    reps: seq(porSemana[1]),
    intervalo: seq(porSemana[2]),
    intensidade: seq(porSemana[3]),
    rir: seq(porSemana[4]),
    aerobio: seq(porSemana[5]),
  };
}

const chave = (a: Assinatura) => Object.values(a).join(" | ");

const base = assinatura(undefined);
const linhas: { slug: string; a: Assinatura; difs: string[] }[] = [];

for (const g of specialGroups) {
  const a = assinatura(g.slug);
  const difs = (Object.keys(a) as (keyof Assinatura)[]).filter((k) => a[k] !== base[k]);
  linhas.push({ slug: g.slug, a, difs });
}

/* ------------------------------- relatório -------------------------------- */

const iguaisAoBase = linhas.filter((l) => l.difs.length === 0);
const grupos = new Map<string, string[]>();
for (const l of linhas) {
  const k = chave(l.a);
  grupos.set(k, [...(grupos.get(k) ?? []), l.slug]);
}
const empatados = [...grupos.values()].filter((v) => v.length > 1);

console.log(`\nRÉGUA DE DISTINTIVIDADE  (${OBJETIVO} / ${NIVEL} / ${SEMANAS} semanas / ${FREQ}x)\n`);
console.log(`condições avaliadas ............... ${linhas.length}`);
console.log(`doses distintas entre si .......... ${grupos.size} de ${linhas.length}`);
console.log(`idênticas a NENHUMA condição ...... ${iguaisAoBase.length}`);
if (iguaisAoBase.length) console.log(`  ${iguaisAoBase.map((l) => l.slug).join(", ")}`);

console.log(`\nvariáveis de dose que cada condição move (de 6):`);
for (const l of [...linhas].sort((x, y) => x.difs.length - y.difs.length))
  console.log(`  ${String(l.difs.length).padStart(2)}  ${l.slug.padEnd(28)} ${l.difs.join(", ") || "(nenhuma)"}`);

if (empatados.length) {
  console.log(`\nempates, condições que recebem dose idêntica entre si:`);
  for (const e of empatados) console.log(`  ${e.join("  =  ")}`);
}

const media = linhas.reduce((s, l) => s + l.difs.length, 0) / linhas.length;
console.log(`\nmédia de variáveis movidas por condição: ${media.toFixed(2)} de 6\n`);
