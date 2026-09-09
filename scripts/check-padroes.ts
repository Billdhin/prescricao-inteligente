/**
 * check:padroes — a semana cobre os PADRÕES DE MOVIMENTO, e não só as famílias musculares.
 *
 * ## ORIGEM
 *
 * O `check:cobertura` já cobrava família muscular e proporção entre regiões, e passava verde
 * em planos que um professor reprovaria na hora. Bancada de 09/09/2026, 576 planos gerados no
 * cartesiano de objetivo x nível x frequência x condição, medindo o que se olha num treino:
 *
 *  - 24% das semanas não tinham NENHUM exercício dominante de quadril: nenhum glúteo, nenhum
 *    posterior de coxa. Só agachar, estender joelho e empurrar leg press. A família "Membros
 *    inferiores" estava lá em 100% deles, então nada acusava.
 *  - 9% não tinham NENHUM trabalho de tronco, inclusive planos de dor lombar inespecífica,
 *    onde o core é o que mais se prescreve.
 *  - 22% dos planos de até 3 sessões gastavam uma das poucas vagas com trabalho miúdo (flexão
 *    de punho, retração cervical). Um homem de 62 anos destreinado, 2x por semana, recebia
 *    flexão de punho como um dos oito exercícios da semana dele.
 *  - 23% fechavam com desequilíbrio de empurrar contra puxar acima de 2 para 1.
 *
 * ## A CAUSA
 *
 * `grupoMuscular` é rótulo de REGIÃO, não de movimento: junta agachamento e levantamento terra
 * em "Membros inferiores", e rosca, tríceps e flexão de punho em "Braços". Cobrir família não é
 * cobrir o corpo. Some-se a isso a marcação do catálogo por objetivo, que às vezes tem UM
 * representante de um padrão inteiro (Retorno ao treino marca um único exercício de Braços, a
 * flexão de punho), e o resgate anterior só socorria a família com ZERO.
 *
 * ## O QUE ESTE CHECK COBRA
 *
 * Os cinco padrões que fazem uma semana de corpo inteiro ser um treino: dominante de joelho,
 * dominante de quadril, empurrar, puxar e tronco. Mais dois limites de proporção e a regra de
 * pertinência do trabalho miúdo.
 *
 * Roda em `npm run check`.
 */
import { gerarPlano } from "@/lib/gps/periodizacao";
import { getExercise } from "@/data/exercises";
import { padraoDe, PADROES_ESSENCIAIS, type PadraoMovimento } from "@/lib/gps/padroes";

const OBJETIVOS = ["Hipertrofia", "Emagrecimento", "Força", "Resistência muscular", "Retorno ao treino", "Aprendizado técnico"];
const NIVEIS = ["Iniciante", "Intermediário", "Avançado"];
const CONDICOES = [
  undefined,
  "hipertensao-estagio-1",
  "diabetes-tipo-2",
  "osteoartrite-joelho",
  "obesidade-grau-2",
  "dor-lombar-inespecifica",
  "idoso-destreinado",
  "pos-parto",
];

/**
 * Teto da razão entre empurrar e puxar.
 *
 * Fica em 3 e não em 2 por honestidade sobre onde está o limite: a marcação do catálogo por
 * objetivo é hoje a restrição real (Emagrecimento não marca NENHUM exercício de ombro, de braço
 * nem de tronco, e marca só dois de peito), e um teto de 2 cobraria do motor uma variedade que o
 * conteúdo ainda não oferece. O que o teto garante é que nenhuma semana vire monocultura de um
 * lado só; fechar a diferença de vez depende de revisar a marcação, que é decisão de conteúdo.
 */
const RAZAO_MAX = 3;

type Bloco = { tipo: string; exercicioSlug?: string; seriesAlvo?: number; series?: string };
type Sessao = { nome?: string; complemento?: boolean; blocos: Bloco[] };

const falhas: string[] = [];
let planos = 0;

/** Séries por padrão na primeira semana de CARGA, que é a que o profissional revisa. */
function padroesDaSemana(g: ReturnType<typeof gerarPlano>) {
  const micros = g.principal.mesociclos.flatMap((m) => m.microciclos) as { tipo: string; sessoes: Sessao[] }[];
  const semana = micros.find((w) => w.tipo === "carga") ?? micros[0];
  if (!semana) return undefined;
  const principais = semana.sessoes.filter((s) => !s.complemento);
  const contagem = new Map<PadraoMovimento, number>();
  let series = 0;
  for (const s of principais)
    for (const b of s.blocos) {
      if (b.tipo !== "forca") continue;
      const ex = b.exercicioSlug ? getExercise(b.exercicioSlug) : undefined;
      if (!ex) continue;
      const n = b.seriesAlvo ?? Number(/(\d+)/.exec(b.series ?? "")?.[1] ?? 0);
      if (!n) continue;
      series += n;
      const p = padraoDe(ex);
      contagem.set(p, (contagem.get(p) ?? 0) + n);
    }
  return series ? { contagem, series, sessoes: principais } : undefined;
}

for (const objetivo of OBJETIVOS)
  for (const nivel of NIVEIS)
    for (const frequencia of [2, 3, 4, 5])
      for (const grupoEspecial of CONDICOES) {
        let g;
        try {
          g = gerarPlano({
            objetivo: objetivo as never,
            nivel: nivel as never,
            semanas: 12,
            frequencia,
            idade: 40,
            grupoEspecial,
          } as never);
        } catch (e) {
          falhas.push(`${objetivo}/${nivel}/${frequencia}x/${grupoEspecial ?? "sem condição"}: o gerador falhou (${(e as Error).message.slice(0, 60)}).`);
          continue;
        }
        const medida = padroesDaSemana(g);
        if (!medida) continue;
        planos++;
        const rot = `${objetivo}/${nivel}/${frequencia}x/${grupoEspecial ?? "sem condição"}`;
        const q = (p: PadraoMovimento) => medida.contagem.get(p) ?? 0;

        // 1) Os cinco padrões essenciais aparecem na semana.
        for (const p of PADROES_ESSENCIAIS)
          if (q(p) === 0) falhas.push(`${rot}: a semana não tem NENHUM exercício de padrão "${p}".`);

        // 2) Empurrar e puxar não viram monocultura.
        const emp = q("empurrar");
        const pux = q("puxar");
        if (emp && pux) {
          const razao = Math.max(emp / pux, pux / emp);
          if (razao > RAZAO_MAX)
            falhas.push(`${rot}: empurrar ${emp} contra puxar ${pux} (razão ${razao.toFixed(1)}, teto ${RAZAO_MAX}).`);
        }

        // 3) Trabalho miúdo não ocupa vaga em plano de poucas sessões.
        if (frequencia <= 3 && q("acessorio-menor") > 0)
          falhas.push(`${rot}: trabalho miúdo (punho, pescoço, tornozelo) ocupa vaga numa semana de ${frequencia} sessões.`);

        // 4) Nenhuma sessão principal repete outra por inteiro: duas sessões idênticas numa
        //    semana são uma sessão só escrita duas vezes.
        const assinaturas = medida.sessoes.map((s) =>
          s.blocos
            .filter((b) => b.tipo === "forca")
            .map((b) => b.exercicioSlug)
            .sort()
            .join("|"),
        );
        const repetida = assinaturas.find((a, i) => a && assinaturas.indexOf(a) !== i);
        if (repetida && medida.sessoes.length > 2)
          falhas.push(`${rot}: duas sessões da semana têm exatamente os mesmos exercícios.`);
      }

/*
 * AUTOVERIFICAÇÃO: a régua precisa reprovar o defeito que ela existe para pegar.
 *
 * Sem isto, um dia a derivação de padrão passa a devolver o mesmo rótulo para tudo, todo plano
 * "cobre" os cinco padrões e o check fica verde para sempre. Aqui a semana falsa tem seis
 * exercícios, todos dominantes de joelho, e as regras 1 e 2 precisam acusar.
 */
{
  const falsa = new Map<PadraoMovimento, number>([["joelho", 12], ["empurrar", 9], ["puxar", 1]]);
  const qf = (p: PadraoMovimento) => falsa.get(p) ?? 0;
  const acusou: string[] = [];
  for (const p of PADROES_ESSENCIAIS) if (qf(p) === 0) acusou.push(`falta ${p}`);
  const razaoFalsa = Math.max(qf("empurrar") / qf("puxar"), qf("puxar") / qf("empurrar"));
  if (razaoFalsa > RAZAO_MAX) acusou.push("razão empurrar/puxar");
  const esperado = ["falta quadril", "falta core", "razão empurrar/puxar"];
  const faltando = esperado.filter((e) => !acusou.includes(e));
  if (faltando.length) {
    console.error(
      `[check:padroes] AUTOVERIFICAÇÃO FALHOU: a semana falsa (12 séries de joelho, 9 de empurrar, 1 de puxar) precisa ser reprovada por ${esperado.join(", ")}; não acusou: ${faltando.join(", ")}.`,
    );
    process.exit(1);
  }
  console.log(`[check:padroes] autoverificação OK: a semana só de joelho e empurrar é reprovada por ${acusou.length} regras (${acusou.join(", ")}).`);
}

if (falhas.length) {
  console.error(`\n[check:padroes] FALHOU: ${falhas.length} problema(s) em ${planos} planos.\n`);
  for (const f of falhas.slice(0, 40)) console.error("  • " + f);
  if (falhas.length > 40) console.error(`  ... e mais ${falhas.length - 40}.`);
  console.error(
    "\n  Cobrir família muscular não é cobrir o corpo: 'Membros inferiores' junta agachamento e\n" +
      "  dobradiça de quadril, e 'Braços' junta rosca, tríceps e flexão de punho. A seleção garante\n" +
      "  um exercício por PADRÃO antes do corte do pool, e a distribuição escolhe a vaga de perna\n" +
      "  pelo padrão que está faltando na semana. Ver src/lib/gps/padroes.ts.\n",
  );
  process.exit(1);
}

console.log(
  `[check:padroes] ok: ${planos} planos (objetivo x nível x frequência x condição) cobrem joelho, quadril, empurrar, puxar e tronco, sem monocultura de empurrar ou puxar, sem trabalho miúdo em semana curta e sem duas sessões idênticas.`,
);
