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
import { getReferencia } from "@/data/referencias";
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
      // Sustentado (prancha, equilíbrio) é trabalho da semana; só o protocolo de condição fica fora.
      if (b.tipo === "aerobio" || (b.tipo === "isometrico" && !(b as { sustentado?: boolean }).sustentado)) continue;
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

/*
 * SUSTENTADO NUNCA SAI EM REPETIÇÕES, E O EQUILÍBRIO ENTRA ONDE A CONDIÇÃO INDICA (09/09/2026).
 *
 * Dois defeitos de "a tela promete, o motor não entrega", ambos medidos:
 *  - prancha e equilíbrio em um pé saíam como "3 x 15, reserva 4" enquanto o texto deles diz
 *    "15 a 40 s" (1.704 de 3.888 planos em 18/08). Agora nascem como bloco sustentado, com
 *    séries e TEMPO, pelo trilho do isométrico;
 *  - a regra do idoso destreinado dizia que equilíbrio é a ênfase que mais reduz queda, e o
 *    plano não tinha nenhum exercício de equilíbrio, porque a restrição `equilibrio_reduzido`
 *    penalizava justamente o apoio unipodal. Agora a condição indica (`GroupGpsRule.equilibrio`)
 *    e o motor coloca o bloco ao fim das sessões principais, 2 por semana.
 */
{
  const falhasS: string[] = [];
  type Bl = { tipo?: string; exercicioSlug?: string; repsAlvo?: number; series?: string; duracao?: string; sustentado?: boolean; equilibrio?: boolean };
  /** O que reprova um bloco: sustentado em repetição, ou bloco sustentado sem tempo. */
  const defeitoDoBloco = (b: Bl): string | undefined => {
    const ex = b.exercicioSlug ? getExercise(b.exercicioSlug) : undefined;
    if (!ex?.sustentado) return undefined;
    if (b.tipo !== "isometrico" || !b.sustentado) return `"${ex.nome}" saiu como ${b.tipo} em repetições, e é exercício sustentado (tempo)`;
    if (!b.series || !b.duracao) return `"${ex.nome}" sustentado sem séries ou sem tempo`;
    if (b.repsAlvo != null) return `"${ex.nome}" sustentado carrega alvo de repetições`;
    return undefined;
  };
  // Autoverificação: o bloco falso em repetições precisa ser reprovado.
  const falso: Bl = { tipo: "forca", exercicioSlug: "prancha-frontal", repsAlvo: 15 };
  if (!defeitoDoBloco(falso)) {
    console.error("[check:padroes] AUTOVERIFICAÇÃO FALHOU: uma prancha em 'forca' com 15 repetições deveria ser reprovada.");
    process.exit(1);
  }
  let blocosSustentados = 0;
  for (const objetivo of OBJETIVOS)
    for (const frequencia of [2, 3])
      for (const grupoEspecial of CONDICOES) {
        let g;
        try {
          g = gerarPlano({ objetivo: objetivo as never, nivel: "Iniciante" as never, semanas: 8, frequencia, idade: 40, grupoEspecial } as never);
        } catch {
          continue;
        }
        for (const m of g.principal.mesociclos)
          for (const w of m.microciclos)
            for (const s of w.sessoes)
              for (const b of s.blocos as Bl[]) {
                const d = defeitoDoBloco(b);
                if (d) falhasS.push(`${objetivo}/${frequencia}x/${grupoEspecial ?? "sem condição"}: ${d}.`);
                if (b.sustentado) blocosSustentados++;
              }
      }
  // Equilíbrio: entra em quem indica, com a quantidade prometida, e só ali.
  const indicam = ["idoso-destreinado", "osteoporose"];
  const naoIndicam = [undefined, "hipertensao-estagio-1", "gestante", "pos-parto"];
  for (const grupoEspecial of [...indicam, ...naoIndicam])
    for (const frequencia of [2, 3, 5]) {
      const g = gerarPlano({ objetivo: "Retorno ao treino" as never, nivel: "Iniciante" as never, semanas: 8, frequencia, idade: 70, grupoEspecial } as never);
      const w = g.principal.mesociclos[0]?.microciclos[0];
      const principais = (w?.sessoes ?? []).filter((s) => !(s as { complemento?: boolean }).complemento);
      const comEquilibrio = principais.filter((s) => (s.blocos as Bl[]).some((b) => b.equilibrio)).length;
      const rot = `Retorno/${frequencia}x/${grupoEspecial ?? "sem condição"}`;
      if (indicam.includes(grupoEspecial ?? "")) {
        const esperado = Math.min(2, frequencia);
        if (comEquilibrio < esperado) falhasS.push(`${rot}: a condição indica equilíbrio e a semana tem ${comEquilibrio} sessão(ões) com o bloco (esperado ${esperado}).`);
        if (!/Sobre o equilíbrio/.test(g.raciocinio)) falhasS.push(`${rot}: o bloco de equilíbrio entrou e o raciocínio não o explica.`);
        if (!g.refIds.includes("sherrington-quedas-2019")) falhasS.push(`${rot}: a bibliografia do plano não traz a fonte do bloco de equilíbrio.`);
        // A string no plano não basta: cada id precisa EXISTIR na bibliografia. A primeira versão
        // desta régua passou verde com o plano citando um id que não tinha entrada (09/09/2026).
        for (const id of g.refIds)
          if (!getReferencia(id)) falhasS.push(`${rot}: o plano cita "${id}" e a bibliografia não tem essa entrada.`);
      } else if (comEquilibrio > 0) {
        falhasS.push(`${rot}: recebeu bloco de equilíbrio por indicação sem a condição indicar.`);
      }
    }
  if (falhasS.length) {
    console.error(`\n[check:padroes] FALHOU no sustentado/equilíbrio: ${falhasS.length} caso(s).\n`);
    for (const f of falhasS.slice(0, 30)) console.error("  • " + f);
    process.exit(1);
  }
  console.log(`[check:padroes] ok: ${blocosSustentados} blocos sustentados saíram por tempo (nenhuma prancha em repetições), e o bloco de equilíbrio entra 2x/semana só onde a condição indica, com raciocínio e bibliografia.`);
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
