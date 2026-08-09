/**
 * BANCADA DO APP DO ALUNO.
 *
 * A última área do core sem teste. O que o aluno vê é o fim da linha: se a dose chegar
 * ilegível, vazia ou com o rótulo clínico dele, nenhuma das bancadas anteriores teria
 * percebido, porque todas param no que o profissional vê.
 *
 * Roda à mão: `npx tsx scripts/bancada-aluno.ts`.
 */
import { gerarPlano } from "@/lib/gps/periodizacao";
import { sessoesDaSemana } from "@/lib/gps/semear";
import { doseCurta, tokensDoBloco } from "@/components/student/blocoRegistro";
import { specialGroups, getSpecialGroup } from "@/data/specialGroups";
import type { PlanoTreino } from "@/data/periodizacao";
import type { Nivel } from "@/data/types";

type Achado = { classe: string; cen: string; detalhe: string };
const achados: Achado[] = [];
const anotar = (classe: string, cen: string, detalhe: string) => achados.push({ classe, cen, detalhe });

const OBJETIVOS = ["Hipertrofia", "Emagrecimento", "Força", "Resistência muscular"] as const;
const NIVEIS: Nivel[] = ["Iniciante", "Intermediário", "Avançado"];

let blocos = 0;

for (const grupo of [undefined, ...specialGroups.map((s) => s.slug)])
  for (const objetivo of OBJETIVOS)
    for (const nivel of NIVEIS) {
      const semanas = 12;
      const cen = `${grupo ?? "sem"}/${objetivo}/${nivel}`;
      const g = gerarPlano({ objetivo, nivel, semanas, frequencia: 3, grupoEspecial: grupo });
      const plano: PlanoTreino = {
        id: "t",
        alunoId: "a",
        data: 0,
        titulo: g.titulo,
        objetivo,
        nivel,
        semanas,
        frequenciaSemanal: 3,
        modeloId: g.modeloId,
        macrociclo: g.principal,
        refIds: g.refIds,
        raciocinio: g.raciocinio,
        grupoEspecial: grupo,
      };
      const nomeClinico = grupo ? getSpecialGroup(grupo)?.nome : undefined;
      const rotuloAluno = grupo ? getSpecialGroup(grupo)?.rotuloAluno : undefined;

      /* 1. SEMANA FORA DO PLANO não pode explodir nem inventar sessão. */
      for (const fora of [0, -1, semanas + 1, 999]) {
        const s = sessoesDaSemana(plano, fora);
        if (s.length) anotar("SEMANA INEXISTENTE COM SESSAO", cen, `semana ${fora} devolveu ${s.length} sessoes`);
      }

      /* 2. TODA SEMANA DO PLANO ENTREGA SESSÃO AO ALUNO. */
      for (let sem = 1; sem <= semanas; sem++) {
        const sessoes = sessoesDaSemana(plano, sem);
        if (!sessoes.length) {
          anotar("SEMANA SEM SESSAO", cen, `semana ${sem} nao entrega nada ao aluno`);
          continue;
        }

        for (const s of sessoes)
          for (const b of s.blocos) {
            blocos++;

            /* 3. A DOSE CURTA É LEGÍVEL: nada de vazio nem de lixo na tela do aluno. */
            const dose = doseCurta(b);
            if (!dose || !dose.trim()) anotar("DOSE VAZIA", cen, `bloco "${b.nome ?? b.tipo}" sem dose para o aluno`);
            if (/NaN|undefined|null|\[object/.test(dose))
              anotar("DOSE COM LIXO", cen, `bloco "${b.nome ?? b.tipo}" -> "${dose.slice(0, 50)}"`);

            /* 4. OS TOKENS TÊM RÓTULO E VALOR, sempre. Meia informação confunde mais que nenhuma. */
            for (const t of tokensDoBloco(b)) {
              if (!t.label?.trim() || !t.value?.trim())
                anotar("TOKEN PELA METADE", cen, `label="${t.label}" value="${t.value}"`);
              if (/NaN|undefined|\[object/.test(`${t.label}${t.value}`))
                anotar("TOKEN COM LIXO", cen, `${t.label}=${t.value}`);
              /*
               * A regra da casa sobre métrica: ativação é relativa ao próprio músculo e se
               * exibe como "NN/100 · Faixa", nunca como porcentagem. O app do aluno não deve
               * inventar um "%" que o resto do produto proíbe.
               */
              if (/^\d+\s*%$/.test(t.value.trim()) && /ativa/i.test(t.label))
                anotar("METRICA COMO PORCENTAGEM", cen, `${t.label}=${t.value}`);
            }

            /* 5. O RÓTULO CLÍNICO NÃO CHEGA AO ALUNO. */
            const texto = `${b.nome ?? ""} ${b.observacao ?? ""} ${b.intensidade ?? ""} ${dose}`;
            if (nomeClinico && nomeClinico !== rotuloAluno && texto.includes(nomeClinico))
              anotar("ROTULO CLINICO NO APP DO ALUNO", cen, `bloco traz "${nomeClinico}"`);
          }
      }
    }

/* ------------------------------- relatório -------------------------------- */
console.log(`\nBANCADA DO APP DO ALUNO: ${blocos} blocos conferidos.\n`);
if (!achados.length) {
  console.log("Nenhum achado nas 5 classes varridas.\n");
} else {
  const porClasse = new Map<string, Achado[]>();
  for (const a of achados) porClasse.set(a.classe, [...(porClasse.get(a.classe) ?? []), a]);
  for (const [classe, lista] of porClasse) {
    console.log(`${classe}: ${lista.length} ocorrência(s)`);
    for (const a of lista.slice(0, 4)) console.log(`   ${a.cen}  ->  ${a.detalhe}`);
    if (lista.length > 4) console.log(`   ... e mais ${lista.length - 4}`);
    console.log("");
  }
}
