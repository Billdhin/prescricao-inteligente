/**
 * check:cobertura — a semana prescrita cobre o corpo, não só a família mais segura.
 *
 * ORIGEM. Um professor amigo do Filipe testou a plataforma e relatou que os planos puxavam
 * para membros inferiores, em perfis muito diferentes, "uns 70%". Medido em 12 perfis
 * (homem e mulher, de 22 a 60 anos, com e sem condição, academia e peso do corpo): eram 67%
 * dos blocos de força, contra os ~31% que seriam a fatia proporcional do catálogo. O caso
 * pior era mais grave que a média: uma semana de HIPERTROFIA para homem de 28 anos vinha
 * com leg press, cadeira extensora, mesa flexora, hip thrust e um supino. Nenhum exercício
 * de costas, de ombro ou de braço.
 *
 * A CAUSA, e por que ela é sorrateira. O seletor ordenava por segurança, condição e
 * objetivo, e cortava o topo da fila. `grupoMuscular` não era consultado em lugar nenhum do
 * gerador. Como os exercícios de perna guiados são dos mais seguros em TODAS as métricas,
 * eles ocupavam o topo inteiro. É a mesma classe do defeito do aeróbio já documentado em
 * periodizacao.ts: ordenar por segurança e cortar no topo elege sempre a mesma família, e
 * nada quebra, o plano só fica errado.
 *
 * Nenhum teste pegava isso porque nenhum olhava o plano como um professor olha: de longe,
 * perguntando "isso aqui é um treino?".
 *
 * Roda em `npm run check`.
 */
import { gerarPlano } from "@/lib/gps/periodizacao";
import { getExercise } from "@/data/exercises";
import type { Sessao } from "@/data/periodizacao";

type Perfil = {
  rotulo: string;
  objetivo: string;
  nivel: string;
  idade?: number;
  grupoEspecial?: string;
  equipamentos?: string[];
  /** o plano deste perfil precisa conter um exercício de puxar (costas)? */
  exigePuxar?: boolean;
};

const PERFIS: Perfil[] = [
  { rotulo: "Hipertrofia, homem 28, intermediário", objetivo: "Hipertrofia", nivel: "Intermediário", idade: 28, exigePuxar: true },
  { rotulo: "Hipertrofia, mulher 30, intermediário", objetivo: "Hipertrofia", nivel: "Intermediário", idade: 30, exigePuxar: true },
  { rotulo: "Hipertrofia, homem 40, avançado", objetivo: "Hipertrofia", nivel: "Avançado", idade: 40, exigePuxar: true },
  { rotulo: "Emagrecimento, mulher 45, iniciante", objetivo: "Emagrecimento", nivel: "Iniciante", idade: 45, exigePuxar: true },
  { rotulo: "Emagrecimento, homem 35, iniciante", objetivo: "Emagrecimento", nivel: "Iniciante", idade: 35, exigePuxar: true },
  { rotulo: "Resistência muscular, homem 52", objetivo: "Resistência muscular", nivel: "Iniciante", idade: 52 },
  { rotulo: "Retorno ao treino, mulher 60", objetivo: "Retorno ao treino", nivel: "Iniciante", idade: 60 },
  { rotulo: "Osteoartrite de joelho, mulher 55", objetivo: "Emagrecimento", nivel: "Iniciante", idade: 55, grupoEspecial: "osteoartrite-joelho" },
  { rotulo: "Hipertensão estágio 1, homem 45", objetivo: "Emagrecimento", nivel: "Iniciante", idade: 45, grupoEspecial: "hipertensao-estagio-1" },
  { rotulo: "Só peso do corpo, homem 33", objetivo: "Hipertrofia", nivel: "Iniciante", idade: 33, equipamentos: ["Peso do corpo"] },
];

/**
 * Teto de participação de UM grupo muscular na semana. O defeito original media 67% a 75%.
 * O teto fica acima do que o motor hoje produz (51% no agregado) para nao reprovar variacao
 * legitima, e bem abaixo do defeito, que e o que ele existe para pegar.
 */
const TETO_POR_GRUPO = 0.6;

/**
 * PISO de membros inferiores, e por que ele tambem precisa existir.
 *
 * A primeira versao desta correcao so tinha teto, e a consequencia foi o excesso contrario:
 * uma sessao de hipertrofia com quatro exercicios e UM de perna. Um professor critica os
 * dois desvios. Guardrail que so trava um lado do erro convida a corrigir demais.
 */
const PISO_INFERIORES = 0.3;
/** Mínimo de grupos musculares distintos numa semana de força. */
const MIN_GRUPOS = 3;

const SUPERIORES = ["Peitorais", "Costas", "Ombros", "Braços"];

const sessoesDe = (macro: { mesociclos: { microciclos: { sessoes: Sessao[] }[] }[] }): Sessao[] =>
  macro.mesociclos.flatMap((m) => m.microciclos.flatMap((w) => w.sessoes));

const falhas: string[] = [];

for (const p of PERFIS) {
  let g;
  try {
    g = gerarPlano({
      objetivo: p.objetivo as never,
      nivel: p.nivel as never,
      semanas: 8,
      frequencia: 3,
      idade: p.idade,
      grupoEspecial: p.grupoEspecial,
      equipamentos: p.equipamentos,
    } as never);
  } catch (e) {
    falhas.push(`${p.rotulo}: o gerador falhou (${(e as Error).message.slice(0, 60)})`);
    continue;
  }

  // A primeira semana, que é o que o profissional olha na tela ao publicar.
  const semana = sessoesDe(g.principal).slice(0, 3);
  const grupos: Record<string, number> = {};
  let forca = 0;
  for (const s of semana)
    for (const b of s.blocos) {
      if (b.tipo === "aerobio") continue;
      const ex = b.exercicioSlug ? getExercise(b.exercicioSlug) : undefined;
      if (!ex) continue;
      forca++;
      grupos[ex.grupoMuscular] = (grupos[ex.grupoMuscular] ?? 0) + 1;
    }

  if (forca === 0) {
    falhas.push(`${p.rotulo}: a semana não tem bloco de força nenhum.`);
    continue;
  }

  // 1) Nenhum grupo pode dominar a semana.
  for (const [grupo, n] of Object.entries(grupos))
    if (n / forca > TETO_POR_GRUPO)
      falhas.push(
        `${p.rotulo}: ${grupo} ocupa ${Math.round((100 * n) / forca)}% dos ${forca} blocos de força (teto ${TETO_POR_GRUPO * 100}%).`,
      );

  // 2) Perna nao pode sumir. Toda sessao de corpo inteiro tem trabalho de membro inferior,
  //    e um plano que ficou so com tronco esta tao errado quanto o que so tinha perna.
  const inferiores = grupos["Membros inferiores"] ?? 0;
  if (inferiores / forca < PISO_INFERIORES)
    falhas.push(
      `${p.rotulo}: membros inferiores ficaram com ${Math.round((100 * inferiores) / forca)}% da semana (piso ${PISO_INFERIORES * 100}%).`,
    );

  // 3) A semana precisa tocar em mais de dois grupos, ou não é um treino, é um bloco só.
  const distintos = Object.keys(grupos).length;
  if (distintos < MIN_GRUPOS)
    falhas.push(`${p.rotulo}: a semana toca em só ${distintos} grupo(s) muscular(es); o mínimo é ${MIN_GRUPOS}.`);

  // 4) Todo plano com acesso a superiores precisa ter ao menos um. Era literalmente o que
  //    faltava: semana de hipertrofia sem costas, sem ombro e sem braço.
  const temSuperior = SUPERIORES.some((s) => grupos[s]);
  if (!temSuperior)
    falhas.push(`${p.rotulo}: a semana não tem NENHUM exercício de membros superiores.`);

  // 5) Quem tem acesso ao catálogo cheio precisa de um PUXAR. Empurrar sem puxar é o
  //    desequilíbrio clássico, e era o que o motor entregava.
  if (p.exigePuxar && !grupos["Costas"])
    falhas.push(`${p.rotulo}: a semana não tem exercício de puxar (nenhum de Costas).`);
}

if (falhas.length) {
  console.error(`\n[check:cobertura] FALHOU: ${falhas.length} problema(s).\n`);
  for (const f of falhas) console.error("  • " + f);
  console.error(
    "\n  A seleção ordena por segurança, condição e objetivo. Quando ela corta o topo da fila\n" +
      "  sem rodízio por grupo muscular, a família mais segura ocupa o plano inteiro.\n",
  );
  process.exit(1);
}

console.log(
  `[check:cobertura] ok: ${PERFIS.length} perfis, nenhum grupo passa de ${TETO_POR_GRUPO * 100}% nem membros inferiores caem abaixo de ${PISO_INFERIORES * 100}%, todos tocam ao menos ${MIN_GRUPOS} grupos e nenhum plano fica sem membros superiores.`,
);
