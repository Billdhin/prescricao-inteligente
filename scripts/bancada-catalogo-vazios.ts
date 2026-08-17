/*
 * BANCADA DO CATÁLOGO: onde ele está vazio demais para o motor.
 *
 * ## Por que ela existe
 *
 * Quando o pool de exercícios de um OBJETIVO, no NÍVEL do aluno e com os EQUIPAMENTOS que
 * ele declarou, fica menor que o pedido do plano, o seletor cai para o catálogo do nível e
 * o plano sai com exercício fora do objetivo. Desde 1c66c6b o raciocínio avisa quando isso
 * acontece, mas o aviso resolve a HONESTIDADE, não a lacuna.
 *
 * Esta bancada mostra a lacuna: quais combinações estão vazias, quanto falta em cada uma, e
 * quais exercícios JÁ EXISTENTES poderiam fechar parte do buraco só com a marcação de
 * objetivo corrigida, sem produzir conteúdo novo.
 *
 * Ela não afirma nada e não reprova: é para ser LIDA, como a bancada de leitura. Rodar de
 * novo depois de cada lote de exercícios novos, porque a lista muda com o catálogo.
 *
 * Rodar: npx tsx scripts/bancada-catalogo-vazios.ts
 */
import { exercises } from "@/data/exercises";
import { OBJETIVOS } from "@/lib/gps/engine";
import type { Nivel } from "@/data/types";

const NIVEL_ORDEM: Record<Nivel, number> = { Iniciante: 1, Intermediário: 2, Avançado: 3 };
const NIVEIS: Nivel[] = ["Iniciante", "Intermediário", "Avançado"];

const AMBIENTES: { nome: string; equip?: string[] }[] = [
  { nome: "casa: so peso corporal", equip: ["Peso corporal"] },
  { nome: "casa: peso corporal + elastico", equip: ["Peso corporal", "Elástico"] },
  { nome: "casa: peso corporal + halter", equip: ["Peso corporal", "Halter"] },
  { nome: "casa completa (corpo+elastico+halter)", equip: ["Peso corporal", "Elástico", "Halter"] },
  { nome: "aquatico: so piscina", equip: ["Piscina"] },
  { nome: "academia basica (maquina+halter)", equip: ["Peso corporal", "Máquina", "Halter"] },
  { nome: "academia completa", equip: ["Peso corporal", "Máquina", "Halter", "Barra", "Polia", "Elástico"] },
  { nome: "nada declarado (catalogo inteiro)", equip: undefined },
];

const N_PEDIDO = Math.max(4, 3 + 2); // frequencia 3, que e a mais comum

const pool = (objetivo: string, nivel: Nivel, equip?: string[]) =>
  exercises.filter(
    (e) =>
      e.objetivo?.includes(objetivo as never) &&
      NIVEL_ORDEM[(e.nivel as Nivel) ?? "Iniciante"] <= NIVEL_ORDEM[nivel] &&
      !e.doseAerobia &&
      !e.doseIsometrica &&
      (!equip?.length || e.equipamento === "Peso corporal" || equip.includes(e.equipamento)),
  );

const buracos: { objetivo: string; nivel: Nivel; ambiente: string; tem: number; falta: number }[] = [];

console.log(`PEDIDO DO MOTOR: ${N_PEDIDO} exercicios por plano (frequencia 3). Abaixo disso ele troca o objetivo.\n`);
console.log("ambiente".padEnd(38), NIVEIS.map((n) => n.slice(0, 5).padEnd(7)).join("") + " (por objetivo, o MENOR pool)");
for (const amb of AMBIENTES) {
  const linha: string[] = [];
  for (const nivel of NIVEIS) {
    let pior = Infinity;
    for (const objetivo of OBJETIVOS) {
      const n = pool(objetivo, nivel, amb.equip).length;
      if (n < N_PEDIDO) buracos.push({ objetivo, nivel, ambiente: amb.nome, tem: n, falta: N_PEDIDO - n });
      pior = Math.min(pior, n);
    }
    linha.push(String(pior).padEnd(7));
  }
  console.log(amb.nome.padEnd(38), linha.join(""));
}

console.log(`\n\nBURACOS (pool < ${N_PEDIDO}), do mais vazio para o menos:\n`);
buracos.sort((a, b) => a.tem - b.tem || a.objetivo.localeCompare(b.objetivo));
console.log("objetivo".padEnd(22), "nivel".padEnd(15), "ambiente".padEnd(38), "tem  falta");
for (const b of buracos)
  console.log(b.objetivo.padEnd(22), b.nivel.padEnd(15), b.ambiente.padEnd(38), String(b.tem).padEnd(5), b.falta);
console.log(`\n${buracos.length} combinacoes com buraco, de ${AMBIENTES.length * NIVEIS.length * OBJETIVOS.length} testadas.`);

console.log("\n\nONDE DOI MAIS: soma do que falta, por objetivo e por equipamento\n");
const porObjetivo = new Map<string, number>();
for (const b of buracos) porObjetivo.set(b.objetivo, (porObjetivo.get(b.objetivo) ?? 0) + b.falta);
for (const [o, f] of [...porObjetivo.entries()].sort((a, b) => b[1] - a[1])) console.log(`  ${o.padEnd(22)} faltam ${f} vagas somadas`);

console.log("\nEQUIPAMENTOS do catalogo, por quantos exercicios de forca cada um tem:\n");
const porEquip = new Map<string, number>();
for (const e of exercises) {
  if (e.doseAerobia || e.doseIsometrica) continue;
  porEquip.set(e.equipamento, (porEquip.get(e.equipamento) ?? 0) + 1);
}
for (const [q, n] of [...porEquip.entries()].sort((a, b) => b[1] - a[1])) console.log(`  ${q.padEnd(24)} ${n}`);


const ORD: Record<Nivel, number> = { Iniciante: 1, Intermediário: 2, Avançado: 3 };
const forca = exercises.filter((e) => !e.doseAerobia && !e.doseIsometrica);

console.log("A. QUEM SAO OS POUCOS DE 'FORCA' HOJE (o objetivo mais vazio)\n");
const daForca = forca.filter((e) => e.objetivo?.includes("Força" as never));
console.log(`  ${daForca.length} exercicios marcados como Força no catalogo inteiro:\n`);
for (const e of daForca.sort((a, b) => ORD[(a.nivel as Nivel) ?? "Iniciante"] - ORD[(b.nivel as Nivel) ?? "Iniciante"]))
  console.log(`    ${(e.nivel ?? "?").padEnd(14)} ${e.equipamento.padEnd(16)} ${e.nome}`);

console.log("\n\nB. FORCA POR NIVEL ACUMULADO (o motor usa nivel do exercicio <= nivel do aluno)\n");
for (const nivel of ["Iniciante", "Intermediário", "Avançado"] as Nivel[]) {
  const n = daForca.filter((e) => ORD[(e.nivel as Nivel) ?? "Iniciante"] <= ORD[nivel]);
  const semPesoLivre = n.filter((e) => e.equipamento === "Peso corporal" || e.equipamento === "Elástico").length;
  console.log(`  ${nivel.padEnd(15)} ${String(n.length).padEnd(3)} exercicios  |  em casa (corpo/elastico): ${semPesoLivre}`);
}

console.log("\n\nC. O QUE JA EXISTE E PODERIA SER MARCADO COMO FORCA");
console.log("   (peso corporal ou elastico, padrao de forca, hoje SEM a marca)\n");
const candidatos = forca.filter(
  (e) =>
    !e.objetivo?.includes("Força" as never) &&
    (e.equipamento === "Peso corporal" || e.equipamento === "Elástico") &&
    /agach|flex|remada|puxada|terra|afundo|ponte|eleva|supino|desenvolv|abdu|adu|passada|step|bulgaro|mergulho|barra/i.test(e.nome),
);
for (const e of candidatos.sort((a, b) => a.equipamento.localeCompare(b.equipamento)))
  console.log(`    ${(e.nivel ?? "?").padEnd(14)} ${e.equipamento.padEnd(16)} ${e.nome.padEnd(34)} objetivos: ${(e.objetivo ?? []).join(", ")}`);
console.log(`\n  ${candidatos.length} candidatos que ja tem foto, ficha e mapa muscular: marcar custa uma linha cada.`);

console.log("\n\nD. EMAGRECIMENTO EM CASA E NA PISCINA (o segundo mais vazio)\n");
for (const [rot, filtro] of [
  ["so peso corporal", (e: (typeof forca)[number]) => e.equipamento === "Peso corporal"],
  ["so piscina", (e: (typeof forca)[number]) => e.equipamento === "Piscina"],
] as const) {
  const n = forca.filter((e) => e.objetivo?.includes("Emagrecimento" as never) && filtro(e));
  console.log(`  ${rot.padEnd(20)} ${n.length}: ${n.map((e) => e.nome).join(", ") || "(nenhum)"}`);
}
