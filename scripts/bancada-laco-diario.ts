/**
 * BANCADA DO LAÇO DIÁRIO: o que acontece DEPOIS que o plano existe.
 *
 * O plano é gerado uma vez; o laço da semana roda toda sessão, e é onde o produto encosta na
 * segurança: o aluno registra série a série, a autorregulação lê esse registro e sugere subir,
 * manter, descarregar ou encaminhar, e o gate clínico decide se a sugestão pode valer hoje.
 *
 * As histórias abaixo são de aluno, não de teste: quem cumpre o topo com folga, quem baixa a
 * carga na última série, quem some por três semanas e volta, quem treina com dor. Cada uma
 * declara o que o produto DEVERIA responder, e a bancada confere a resposta de verdade.
 *
 * Roda à mão: `npx tsx scripts/bancada-laco-diario.ts`.
 */
import { ajustarCarga, faixaDeReps, type AcaoCarga, type CtxSeguranca, type OpcoesAjuste } from "@/lib/gps/autorregulacao";
import type { Execucao } from "@/data/execucao";

type Serie = { reps: number; carga: number; rpe?: number; semana?: number };
type Historia = {
  nome: string;
  /** o que um profissional responderia olhando esta história */
  esperado: AcaoCarga;
  porque: string;
  faixa: string;
  series: Serie[];
  opts?: OpcoesAjuste;
};

let n = 0;
const falhas: string[] = [];

const exec = (s: Serie, i: number): Execucao =>
  ({
    id: `e${i}`, alunoId: "a1", planoId: "p1", semana: s.semana ?? 1,
    sessaoRef: "s1", blocoRef: "b1", exercicioSlug: "supino-reto-com-barra",
    serie: i + 1, repsFeitas: s.reps, cargaFeita: s.carga, rpe: s.rpe,
    concluidoEm: 1_700_000_000_000 + i * 60_000,
  }) as Execucao;

/* ---------------------------- as histórias ---------------------------- */

const SEGURO_HIPERTENSO: CtxSeguranca = { amareloHoje: true };
const COM_DOR: CtxSeguranca = { dor: 6 };
const DOR_FORTE: CtxSeguranca = { dor: 8 };
const VERMELHO_COM_SINTOMA: CtxSeguranca = { vermelhoPendente: true, sintomas: ["tontura"] };

const HISTORIAS: Historia[] = [
  {
    nome: "Cumpriu o topo nas três séries, esforço 7",
    esperado: "subir", porque: "dupla progressão fechada com esforço controlado",
    faixa: "8 a 12",
    series: [{ reps: 12, carga: 40, rpe: 7 }, { reps: 12, carga: 40, rpe: 7 }, { reps: 12, carga: 40, rpe: 7 }],
  },
  {
    nome: "Cumpriu o topo, mas não registrou o esforço",
    esperado: "manter", porque: "sem PSE não dá para afirmar que sobrou margem",
    faixa: "8 a 12",
    series: [{ reps: 12, carga: 40 }, { reps: 12, carga: 40 }, { reps: 12, carga: 40 }],
  },
  {
    nome: "Cumpriu o topo, mas com esforço 9",
    esperado: "descarregar", porque: "chegou ao topo no limite, não com margem",
    faixa: "8 a 12",
    series: [{ reps: 12, carga: 40, rpe: 9 }, { reps: 12, carga: 40, rpe: 9 }, { reps: 12, carga: 40, rpe: 9 }],
  },
  {
    nome: "Caiu abaixo da faixa na terceira série",
    esperado: "descarregar", porque: "não sustentou a faixa prescrita",
    faixa: "8 a 12",
    series: [{ reps: 10, carga: 40, rpe: 7 }, { reps: 9, carga: 40, rpe: 8 }, { reps: 6, carga: 40, rpe: 9 }],
  },
  {
    nome: "Dentro da faixa, sem chegar ao topo",
    esperado: "manter", porque: "acumular repetição antes de subir carga",
    faixa: "8 a 12",
    series: [{ reps: 10, carga: 40, rpe: 7 }, { reps: 10, carga: 40, rpe: 7 }, { reps: 9, carga: 40, rpe: 8 }],
  },
  {
    nome: "Baixou a carga só na última série (60, 60, 55)",
    esperado: "manter", porque: "a base tem que ser a carga que representou o trabalho, não a última",
    faixa: "8 a 12",
    series: [{ reps: 11, carga: 60, rpe: 7 }, { reps: 10, carga: 60, rpe: 8 }, { reps: 10, carga: 55, rpe: 8 }],
  },
  {
    nome: "Semana antiga ruim, semana atual boa",
    esperado: "subir", porque: "a dupla progressão decide pelo microciclo corrente",
    faixa: "8 a 12",
    series: [
      { reps: 6, carga: 40, rpe: 9, semana: 1 }, { reps: 6, carga: 40, rpe: 9, semana: 1 },
      { reps: 12, carga: 45, rpe: 7, semana: 4 }, { reps: 12, carga: 45, rpe: 7, semana: 4 },
    ],
  },
  {
    nome: "Nunca registrou nada",
    esperado: "sem-dado", porque: "não há o que sugerir sem execução",
    faixa: "8 a 12", series: [],
  },
  {
    nome: "Cumpriu o topo, mas o semáforo do dia está amarelo",
    esperado: "manter", porque: "o gate clínico não deixa subir em dia de ressalva",
    faixa: "8 a 12",
    series: [{ reps: 12, carga: 40, rpe: 7 }, { reps: 12, carga: 40, rpe: 7 }],
    opts: { seguranca: SEGURO_HIPERTENSO },
  },
  {
    nome: "Cumpriu o topo, mas relatou dor 6 de 10",
    esperado: "descarregar", porque: "dor relevante rebaixa a sugestão",
    faixa: "8 a 12",
    series: [{ reps: 12, carga: 40, rpe: 7 }, { reps: 12, carga: 40, rpe: 7 }],
    opts: { seguranca: COM_DOR },
  },
  {
    nome: "Dor 8 de 10",
    esperado: "encaminhar", porque: "passou do ajuste de carga",
    faixa: "8 a 12",
    series: [{ reps: 10, carga: 40, rpe: 7 }, { reps: 10, carga: 40, rpe: 7 }],
    opts: { seguranca: DOR_FORTE },
  },
  {
    nome: "Não liberado hoje, com tontura relatada",
    esperado: "encaminhar", porque: "vermelho com sintoma é quadro para reavaliar, não para ajustar",
    faixa: "8 a 12",
    series: [{ reps: 10, carga: 40, rpe: 7 }, { reps: 10, carga: 40, rpe: 7 }],
    opts: { seguranca: VERMELHO_COM_SINTOMA },
  },
  {
    nome: "Uma série só, no topo, com esforço controlado",
    esperado: "subir", porque: "registro pequeno ainda é registro; a regra é a mesma",
    faixa: "8 a 12", series: [{ reps: 12, carga: 40, rpe: 7 }],
  },
];

/* ------------------------------ a conferência ----------------------------- */

console.log("\n[bancada-laço-diário] o que a autorregulação responde a cada história de aluno\n");
for (const h of HISTORIAS) {
  n++;
  const faixa = faixaDeReps(h.faixa)!;
  const r = ajustarCarga(h.series.map(exec), faixa, h.opts);
  const ok = r.acao === h.esperado;
  if (!ok) falhas.push(`${h.nome}: esperado "${h.esperado}", veio "${r.acao}"`);
  console.log(`${ok ? "  ok  " : "  ✗   "}${h.nome}`);
  console.log(`        esperado ${h.esperado} (${h.porque})`);
  console.log(`        veio     ${r.acao}${r.cargaBase != null ? ` · base ${r.cargaBase} kg` : ""}${r.proximaCarga != null ? ` → ${r.proximaCarga} kg` : ""}`);
  console.log(`        motivo   ${r.motivo}\n`);
}

/* Um contra-caso, para a bancada não virar decoração: se a regra do topo sumir, esta
 * história tem que deixar de sugerir "subir". */
const controle = ajustarCarga(
  [{ reps: 12, carga: 40, rpe: 7 }, { reps: 12, carga: 40, rpe: 7 }].map(exec),
  faixaDeReps("8 a 12")!,
);
if (controle.acao !== "subir") falhas.push("controle positivo: o caso canônico de subir não sobe; a bancada não está medindo nada");

console.log(`${n} histórias · ${falhas.length} divergência(s)`);
for (const f of falhas) console.log(`   ✗ ${f}`);
if (falhas.length) process.exit(1);
