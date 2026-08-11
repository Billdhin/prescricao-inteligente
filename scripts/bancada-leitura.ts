/*
 * BANCADA DE LEITURA: gera planos de alunos inventados e IMPRIME, para serem lidos com
 * olho clínico. As outras cinco bancadas afirmam propriedades e falham sozinhas; esta não
 * afirma nada, ela mostra.
 *
 * ## Por que ela existe
 *
 * Guardrail prova o que alguém já pensou. Esta bancada existe para o que ninguém pensou, e
 * se pagou duas vezes com os 25 checks VERDES o tempo todo:
 *
 * - a semana de DESCARGA trocava os exercícios do plano, porque a frequência menor
 *   encolhia o `n` da seleção. No pior caso medido, o resumo declarava "Leg press 45°
 *   evitado (membros acima do coração)" e a semana 12 o prescrevia;
 * - a DURAÇÃO DO CARDIO herdava a tendência de volume da força e, no modelo linear,
 *   nascia no teto da faixa e encolhia (40 min na semana 1 de um iniciante).
 *
 * ## Como ler o que ela imprime
 *
 * As duas classes acima só aparecem COMPARANDO SEMANAS do mesmo plano, e é por isso que a
 * saída traz três semanas de cada cenário (primeira, do meio e última) em vez de só a
 * primeira. Defeito de rampa não aparece em foto, só em filme.
 *
 * Rodar: npx tsx scripts/bancada-leitura.ts
 */
import { gerarPlano, type GerarPlanoInput } from "@/lib/gps/periodizacao";
import { consequenciasDoPlano } from "@/lib/gps/periodizacao";

const CENARIOS: { rotulo: string; input: GerarPlanoInput }[] = [
  {
    rotulo: "1. Hipertensão 2, 68 anos, betabloqueador, emagrecer",
    input: { objetivo: "Emagrecimento", nivel: "Iniciante", semanas: 12, frequencia: 3, grupoEspecial: "hipertensao-estagio-2", idade: 68, fcRepouso: 62, parametrosInvalidos: ["p-fc"], equipamentos: ["Máquina", "Halter", "Esteira", "Peso corporal"] },
  },
  {
    rotulo: "2. Diabetes 2 + obesidade II, 55 anos, emagrecer 16sem",
    input: { objetivo: "Emagrecimento", nivel: "Iniciante", semanas: 16, frequencia: 4, grupoEspecial: "diabetes-tipo-2", condicoesAtencao: ["obesidade-grau-2"], idade: 55, equipamentos: ["Máquina", "Polia", "Esteira", "Bicicleta ergométrica", "Peso corporal"] },
  },
  {
    rotulo: "3. Osteoartrite joelho + obesidade I, hipertrofia, com bike",
    input: { objetivo: "Hipertrofia", nivel: "Intermediário", semanas: 12, frequencia: 3, grupoEspecial: "osteoartrite-joelho", condicoesAtencao: ["obesidade-grau-1"], idade: 49, equipamentos: ["Máquina", "Halter", "Bicicleta ergométrica", "Peso corporal"] },
  },
  {
    rotulo: "4. Gestante, 31 anos, resistência muscular",
    input: { objetivo: "Resistência muscular", nivel: "Iniciante", semanas: 12, frequencia: 2, grupoEspecial: "gestante", idade: 31 },
  },
  {
    rotulo: "5. Osteoporose, 72 anos, força, halter+elástico em casa",
    input: { objetivo: "Força", nivel: "Iniciante", semanas: 16, frequencia: 2, grupoEspecial: "osteoporose", idade: 72, equipamentos: ["Halter", "Elástico", "Peso corporal"] },
  },
  {
    rotulo: "6. Ansiedade/depressão, 29 anos, emagrecer",
    input: { objetivo: "Emagrecimento", nivel: "Iniciante", semanas: 12, frequencia: 3, grupoEspecial: "ansiedade-depressao", idade: 29 },
  },
  {
    rotulo: "7. Sem condição, 25 anos, hipertrofia avançado 5x",
    input: { objetivo: "Hipertrofia", nivel: "Avançado", semanas: 12, frequencia: 5, idade: 25 },
  },
  {
    rotulo: "8. Hipertensão 1 + diabetes 2 + joelho, 60 anos, piscina",
    input: { objetivo: "Emagrecimento", nivel: "Iniciante", semanas: 12, frequencia: 3, grupoEspecial: "hipertensao-estagio-1", condicoesAtencao: ["diabetes-tipo-2", "osteoartrite-joelho"], idade: 60, fcRepouso: 70, equipamentos: ["Máquina", "Piscina", "Peso corporal"] },
  },
  {
    rotulo: "9. Sarcopenia, 78 anos, hipertrofia 2x",
    input: { objetivo: "Hipertrofia", nivel: "Iniciante", semanas: 16, frequencia: 2, grupoEspecial: "sarcopenia", idade: 78 },
  },
  {
    rotulo: "10. Dor lombar inespecífica, força intermediário",
    input: { objetivo: "Força", nivel: "Intermediário", semanas: 12, frequencia: 3, grupoEspecial: "dor-lombar-inespecifica", idade: 42 },
  },
  {
    rotulo: "11. Apneia do sono + obesidade III, emagrecer",
    input: { objetivo: "Emagrecimento", nivel: "Iniciante", semanas: 12, frequencia: 3, grupoEspecial: "apneia-sono", condicoesAtencao: ["obesidade-grau-3"], idade: 51 },
  },
  {
    rotulo: "12. Pós-parto, 33 anos, resistência 2x",
    input: { objetivo: "Resistência muscular", nivel: "Iniciante", semanas: 8, frequencia: 2, grupoEspecial: "pos-parto", idade: 33 },
  },
];

const fmtBloco = (b: Record<string, unknown>) => {
  if (b.tipo === "aerobio")
    return `    [AER] ${b.nome} | ${b.formato} | ${b.duracao} (alvo ${b.duracaoAlvoMin ?? "?"}min) | ${String(b.intensidade).slice(0, 60)}${b.zonaFC ? " | FC " + b.zonaFC : ""}`;
  return `    [FOR] ${b.nome} | ${b.series} x ${b.reps} | ${String(b.intensidade).slice(0, 46)} | alvo ${b.seriesAlvo}x${b.repsAlvo}${b.rirAlvo != null ? " RIR " + b.rirAlvo : ""}`;
};

for (const { rotulo, input } of CENARIOS) {
  const p = gerarPlano(input);
  const cons = consequenciasDoPlano(input);
  console.log("\n============================================================");
  console.log(rotulo);
  console.log(`Modelo: ${p.modeloId} | ${p.titulo}`);
  console.log("RACIOCÍNIO:");
  for (const linha of p.raciocinio.split("\n")) console.log("  " + linha);
  const semanas = p.principal.mesociclos.flatMap((m) => m.microciclos.map((w) => ({ m, w })));
  const alvos = [0, Math.floor(semanas.length / 2), semanas.length - 1];
  for (const idx of alvos) {
    const { m, w } = semanas[idx];
    const s = w.sessoes[0];
    console.log(`  SEMANA ${idx + 1} (${m.nome} · ${w.tipo ?? w.nome ?? ""}) · ${s?.nome}:`);
    for (const b of s?.blocos ?? []) console.log(fmtBloco(b as never));
  }
  console.log(`  Evitados: ${cons.evitados.length ? cons.evitados.map((e) => `${e.nome} (${e.motivo.slice(0, 50)})`).join("; ") : "nenhum"}`);
  console.log(`  Elegíveis: ${cons.elegiveis} | faltouCatalogo: ${cons.faltouCatalogo} | refs: ${p.refIds.length}`);
}
