/**
 * BANCADA DO CAMINHO DE EDIÇÃO.
 *
 * As duas bancadas anteriores testam o plano NO MOMENTO EM QUE NASCE. Só que o profissional
 * passa mais tempo depois disso: travando variável, renovando o microciclo com o que o aluno
 * de fato executou, aplicando prescrição no plano. Cada uma dessas operações reescreve alvo,
 * e alvo reescrito errado é dose errada assinada por ele.
 *
 * Roda à mão: `npx tsx scripts/bancada-edicao.ts`.
 */
import { gerarPlano } from "@/lib/gps/periodizacao";
import { recalcularAlvosDoMeso } from "@/lib/gps/travas";
import { renovarMicrociclo, aplicarRenovacao } from "@/lib/gps/renovarMicrociclo";
import { specialGroups } from "@/data/specialGroups";
import { getFaixa, valorFaixa, type PlanoTreino, type Mesociclo, type VariavelTravavel } from "@/data/periodizacao";
import { intervaloDe } from "@/lib/gps/faixasParse";
import type { Nivel } from "@/data/types";

type Achado = { classe: string; cen: string; detalhe: string };
const achados: Achado[] = [];
const anotar = (classe: string, cen: string, detalhe: string) => achados.push({ classe, cen, detalhe });

const OBJETIVOS = ["Hipertrofia", "Emagrecimento", "Força", "Resistência muscular"] as const;
const NIVEIS: Nivel[] = ["Iniciante", "Intermediário", "Avançado"];

const forcaDo = (m: Mesociclo) =>
  m.microciclos.flatMap((w) => w.sessoes.flatMap((s) => s.blocos)).filter((b) => b.tipo === "forca");

/** Um PlanoTreino mínimo a partir do macrociclo gerado, que é o que as funções de edição pedem. */
const comoPlano = (g: ReturnType<typeof gerarPlano>, o: (typeof OBJETIVOS)[number], n: Nivel, sem: number, freq: number): PlanoTreino => ({
  id: "t",
  alunoId: "a",
  data: 0,
  titulo: g.titulo,
  objetivo: o,
  nivel: n,
  semanas: sem,
  frequenciaSemanal: freq,
  modeloId: g.modeloId,
  macrociclo: g.principal,
  refIds: g.refIds,
  raciocinio: g.raciocinio,
});

let casos = 0;

for (const grupo of [undefined, ...specialGroups.slice(0, 8).map((s) => s.slug)])
  for (const objetivo of OBJETIVOS)
    for (const nivel of NIVEIS) {
      const semanas = 12;
      const frequencia = 3;
      const cen = `${grupo ?? "sem"}/${objetivo}/${nivel}`;
      const g = gerarPlano({ objetivo, nivel, semanas, frequencia, grupoEspecial: grupo });
      const plano = comoPlano(g, objetivo, nivel, semanas, frequencia);
      const faixa = getFaixa(objetivo);
      const serIv = intervaloDe(faixa.series.valor);
      /*
       * A FAIXA DE REPETIÇÕES DO OBJETIVO NÃO É SÓ `reps.valor`.
       *
       * Primeira execução desta bancada: 1904 "alvos fora da faixa", todos do tipo
       * `repsAlvo=14 fora de 6-12`. Era a sonda, não o motor. No modelo ondulatório a
       * repetição vem da ÊNFASE da sessão, e as ênfases da hipertrofia são "pesado: 6 a 8",
       * "moderado: 8 a 12" e "controlado: 12 a 15". Quatorze repetições estão dentro da faixa
       * citada daquela sessão; o que estava errado era eu comparar tudo contra a base.
       *
       * A referência certa é a UNIÃO do que o objetivo cita: a base do nível mais todas as
       * ênfases. É a terceira vez nesta sequência de rodadas que a ferramenta de auditoria
       * erra antes do código, e por isso o motivo fica escrito aqui.
       */
      const faixasDeReps = [
        intervaloDe(valorFaixa(faixa.reps, nivel)),
        ...(faixa.enfases ?? []).map((e) => intervaloDe(e.reps)),
      ].filter(Boolean) as { min: number; max: number }[];
      const repIv = faixasDeReps.length
        ? { min: Math.min(...faixasDeReps.map((f) => f.min)), max: Math.max(...faixasDeReps.map((f) => f.max)) }
        : null;

      /* ---------- 1. TRAVAR VARIÁVEL CONGELA SÓ AQUELA VARIÁVEL ---------- */
      for (const trava of ["volume", "intensidade"] as VariavelTravavel[]) {
        casos++;
        const meso0 = g.principal.mesociclos[0];
        const antes = forcaDo(meso0).map((b) => ({ s: b.seriesAlvo, r: b.repsAlvo, rir: b.rirAlvo }));
        const travado = recalcularAlvosDoMeso({ ...meso0, variaveisTravadas: [trava] }, { objetivo, nivel });
        const dep = forcaDo(travado);

        if (dep.length !== antes.length) {
          anotar("TRAVA MUDOU A ESTRUTURA", `${cen}/${trava}`, `${antes.length} blocos viraram ${dep.length}`);
          continue;
        }
        // A variável travada tem de ficar CONSTANTE ao longo das semanas de carga do meso.
        const cargas = travado.microciclos.filter((w) => w.tipo === "carga");
        const valores = new Set(
          cargas.map((w) => {
            const b = w.sessoes[0]?.blocos.find((x) => x.tipo === "forca");
            return trava === "volume" ? `${b?.seriesAlvo}x${b?.repsAlvo}` : `${b?.rirAlvo}|${b?.cargaRelativaAlvo}`;
          }),
        );
        if (cargas.length > 1 && valores.size > 1)
          anotar("TRAVA NAO SEGUROU", `${cen}/${trava}`, `${trava} travado e mesmo assim variou: ${[...valores].join(" ")}`);

        // E o alvo continua dentro da faixa citada depois do recálculo.
        for (const b of dep) {
          if (b.seriesAlvo != null && serIv && (b.seriesAlvo < serIv.min || b.seriesAlvo > serIv.max))
            anotar("TRAVA SAIU DA FAIXA", `${cen}/${trava}`, `seriesAlvo=${b.seriesAlvo} fora de ${serIv.min}-${serIv.max}`);
          if (b.repsAlvo != null && repIv && (b.repsAlvo < repIv.min || b.repsAlvo > repIv.max))
            anotar("TRAVA SAIU DA FAIXA", `${cen}/${trava}`, `repsAlvo=${b.repsAlvo} fora de ${repIv.min}-${repIv.max}`);
          if (b.seriesAlvo != null && !Number.isFinite(b.seriesAlvo))
            anotar("TRAVA GEROU LIXO", `${cen}/${trava}`, `seriesAlvo=${b.seriesAlvo}`);
        }
      }

      /* ---------- 2. RENOVAR MICROCICLO SEM EXECUÇÃO NENHUMA ---------- */
      // O caso real mais comum: o profissional abre a semana seguinte antes de o aluno
      // registrar qualquer coisa. Nada pode explodir nem inventar alvo do nada.
      casos++;
      try {
        const sug = renovarMicrociclo(plano, 1, [], [], undefined, {});
        const aplicado = aplicarRenovacao(plano, sug);
        const semanasDepois = aplicado.macrociclo.mesociclos.flatMap((m) => m.microciclos).length;
        const semanasAntes = plano.macrociclo.mesociclos.flatMap((m) => m.microciclos).length;
        if (semanasDepois !== semanasAntes)
          anotar("RENOVACAO MUDOU O CALENDARIO", cen, `${semanasAntes} semanas viraram ${semanasDepois}`);

        // Nenhum alvo pode sair da faixa por causa da renovação.
        for (const m of aplicado.macrociclo.mesociclos)
          for (const b of forcaDo(m)) {
            if (b.seriesAlvo != null && serIv && (b.seriesAlvo < serIv.min || b.seriesAlvo > serIv.max))
              anotar("RENOVACAO SAIU DA FAIXA", cen, `seriesAlvo=${b.seriesAlvo} fora de ${serIv.min}-${serIv.max}`);
            if (b.repsAlvo != null && repIv && (b.repsAlvo < repIv.min || b.repsAlvo > repIv.max))
              anotar("RENOVACAO SAIU DA FAIXA", cen, `repsAlvo=${b.repsAlvo} fora de ${repIv.min}-${repIv.max}`);
            if (b.rirAlvo != null && (b.rirAlvo < 0 || b.rirAlvo > 10))
              anotar("RENOVACAO ABSURDA", cen, `rirAlvo=${b.rirAlvo}`);
          }
      } catch (e) {
        anotar("RENOVACAO EXPLODIU", cen, String(e).slice(0, 110));
      }

      /* ---------- 3. RENOVAR NA ÚLTIMA SEMANA (não existe semana seguinte) ---------- */
      casos++;
      try {
        const sug = renovarMicrociclo(plano, semanas, [], [], undefined, {});
        aplicarRenovacao(plano, sug);
      } catch (e) {
        anotar("RENOVACAO NA BORDA EXPLODIU", cen, `semana ${semanas} (ultima): ${String(e).slice(0, 90)}`);
      }

      /* ---------- 4. RECALCULAR SEM TRAVA NENHUMA É IDEMPOTENTE ---------- */
      // Recalcular um mesociclo sem variável travada não pode mudar a dose: o alvo já veio
      // do mesmo motor. Se mudar, as duas contas discordam, e a tela mostraria uma delas.
      casos++;
      const meso = g.principal.mesociclos[0];
      const chave = (m: Mesociclo) =>
        forcaDo(m).map((b) => `${b.seriesAlvo}x${b.repsAlvo}r${b.rirAlvo}c${b.cargaRelativaAlvo}`).join("|");
      const recalc = recalcularAlvosDoMeso(meso, { objetivo, nivel });
      if (chave(meso) !== chave(recalc))
        anotar("RECALCULO NAO IDEMPOTENTE", cen, `antes ${chave(meso).slice(0, 60)} / depois ${chave(recalc).slice(0, 60)}`);
    }

/* ------------------------------- relatório -------------------------------- */
console.log(`\nBANCADA DE EDIÇÃO: ${casos} operações de edição exercitadas.\n`);
if (!achados.length) {
  console.log("Nenhum achado nas 4 classes varridas.\n");
} else {
  const porClasse = new Map<string, Achado[]>();
  for (const a of achados) porClasse.set(a.classe, [...(porClasse.get(a.classe) ?? []), a]);
  for (const [classe, lista] of porClasse) {
    console.log(`${classe}: ${lista.length} ocorrência(s)`);
    for (const a of lista.slice(0, 3)) console.log(`   ${a.cen}  ->  ${a.detalhe}`);
    if (lista.length > 3) console.log(`   ... e mais ${lista.length - 3}`);
    console.log("");
  }
}
