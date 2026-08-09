/**
 * BANCADA DO DOCUMENTO ASSINADO (o PDF do plano).
 *
 * Este é o artefato que sai da ferramenta e vai para a mão do aluno com o nome e o CREF do
 * profissional em cima. Até agora ele nunca tinha sido testado: `exportPlanoPDF` terminava
 * em `window.open`, então fora do navegador nem rodava, e as regras mais duras do produto
 * (documento de aluno não carrega rótulo clínico, a dose impressa é a do plano) eram
 * verificadas contra o que o motor guarda ANTES de imprimir, nunca contra a saída real.
 *
 * Roda à mão: `npx tsx scripts/bancada-documento.ts`.
 */
import { gerarPlano } from "@/lib/gps/periodizacao";
import { exportPlanoPDF } from "@/lib/exportPlano";
import { specialGroups, getSpecialGroup } from "@/data/specialGroups";
import type { PlanoTreino } from "@/data/periodizacao";
import type { Aluno } from "@/data/alunos";
import type { Nivel } from "@/data/types";

type Achado = { classe: string; cen: string; detalhe: string };
const achados: Achado[] = [];
const anotar = (classe: string, cen: string, detalhe: string) => achados.push({ classe, cen, detalhe });

const OBJETIVOS = ["Hipertrofia", "Emagrecimento", "Força", "Resistência muscular"] as const;
const NIVEIS: Nivel[] = ["Iniciante", "Intermediário", "Avançado"];

let docs = 0;

for (const grupo of [undefined, ...specialGroups.map((s) => s.slug)])
  for (const objetivo of OBJETIVOS)
    for (const nivel of NIVEIS) {
      const semanas = 12;
      const frequencia = 3;
      const cen = `${grupo ?? "sem"}/${objetivo}/${nivel}`;
      const g = gerarPlano({ objetivo, nivel, semanas, frequencia, grupoEspecial: grupo });
      const plano: PlanoTreino = {
        id: "t",
        alunoId: "a",
        data: Date.parse("2026-08-01"),
        titulo: g.titulo,
        objetivo,
        nivel,
        semanas,
        frequenciaSemanal: frequencia,
        modeloId: g.modeloId,
        macrociclo: g.principal,
        refIds: g.refIds,
        raciocinio: g.raciocinio,
        grupoEspecial: grupo,
      };
      const aluno: Aluno = {
        id: "a",
        nome: "Erbênio Souza",
        iniciais: "ES",
        idade: 70,
        objetivo,
        nivel,
        restricoes: [],
        equipamentos: ["Máquina", "Barra", "Halter", "Polia", "Peso corporal"],
        status: "ativo",
        criadoEm: 0,
        nivelDesde: 0,
        grupoEspecial: grupo,
      };

      let html: string;
      try {
        html = exportPlanoPDF({ aluno, plano, profissional: "Filipe", cref: "000000-G/XX", apenasHtml: true }) as string;
      } catch (e) {
        anotar("PDF EXPLODIU", cen, String(e).slice(0, 110));
        continue;
      }
      docs++;

      if (!html || html.length < 2000) {
        anotar("DOCUMENTO VAZIO", cen, `html com ${html?.length ?? 0} caracteres`);
        continue;
      }

      /* 1. RÓTULO CLÍNICO NO DOCUMENTO DO ALUNO. É a regra mais dura do produto. */
      if (grupo) {
        const gp = getSpecialGroup(grupo);
        if (gp && gp.nome !== gp.rotuloAluno && html.includes(gp.nome))
          anotar("ROTULO CLINICO IMPRESSO", cen, `o documento traz "${gp.nome}" em vez do rótulo de programa`);
      }

      /* 2. LIXO IMPRESSO: nada de NaN, undefined ou "[object Object]" na folha. */
      for (const lixo of ["NaN", "undefined", "[object Object]"])
        if (html.includes(lixo)) anotar("LIXO IMPRESSO", cen, `o documento contém "${lixo}"`);

      /*
       * 3. AS SEÇÕES QUE O DOCUMENTO PROMETE.
       *
       * Os marcadores saem do que a fonte de fato imprime, e não do que eu lembrava que ela
       * imprimia. A primeira execução acusou 288 de 288 "faltou bibliografia" porque eu
       * procurava "Refer" e a seção se chama "Base científica". Foi o quarto marcador
       * chutado nesta sequência de bancadas, e a regra que fica é simples: achado que atinge
       * 100% dos casos é suspeita contra a sonda, nunca contra o produto.
       */
      for (const [rotulo, marca] of [
        ["identificação do profissional", "Filipe"],
        ["CREF", "000000-G/XX"],
        ["nome do aluno", "Erbênio"],
        ["base científica", "Base científica"],
      ] as const)
        if (!html.includes(marca)) anotar("SECAO AUSENTE", cen, `faltou ${rotulo} no documento`);

      /* 4. REFERÊNCIA CITADA E NÃO RESOLVIDA: id cru vazando para a folha. */
      for (const id of g.refIds)
        if (html.includes(`{${id}}`) || html.includes(`[${id}]`))
          anotar("REFERENCIA CRUA", cen, `id "${id}" apareceu sem resolver`);

      /* 5. A DOSE IMPRESSA É A DO PLANO: a primeira sessão da semana 1 tem de bater. */
      const primeira = g.principal.mesociclos[0]?.microciclos[0]?.sessoes[0];
      const bloco = primeira?.blocos.find((b) => b.tipo === "forca");
      if (bloco?.nome && !html.includes(bloco.nome))
        anotar("EXERCICIO NAO IMPRESSO", cen, `"${bloco.nome}" está no plano e não no documento`);

      /* 6. HTML MINIMAMENTE BEM FORMADO: abre e fecha o corpo. */
      if (!/<html/i.test(html) || !/<\/html>/i.test(html))
        anotar("HTML MALFORMADO", cen, "documento sem <html> de abertura ou fechamento");
    }

/* ------------------------------- relatório -------------------------------- */
console.log(`\nBANCADA DO DOCUMENTO: ${docs} PDFs montados.\n`);
if (!achados.length) {
  console.log("Nenhum achado nas 6 classes varridas.\n");
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
