/**
 * check:registro — o que o aluno executou chega inteiro, e o silêncio dele aparece.
 *
 * Três invariantes que nasceram da auditoria de 01/09/2026, em que cada promessa dos
 * anúncios virou asserção contra o motor. As três reprovaram na primeira passada:
 *
 *  1. REGISTRO POR SÉRIE. O modelo guardava UMA execução por exercício. O contador de
 *     séries da tela avançava sem gravar, e só a última série chegava ao banco: quem
 *     baixasse a carga na terceira apagava as duas primeiras. O produto vende justamente
 *     a comparação entre prescrito e executado, que não existe sem as séries separadas.
 *
 *  2. O SILÊNCIO DO ALUNO. `CicloCtx.execucoes` chegava ao seletor do próximo passo e
 *     nunca era lido: aluno que parava de registrar não gerava sinal nenhum na carteira.
 *     Reavaliação vencida avisava; sumiço, não.
 *
 *  3. CADÊNCIA DE DESCARGA QUE NÃO MUDA NADA. Cinco condições declaravam
 *     `descargaCadaSemanas: 4`, que é exatamente o padrão do motor, e duas delas ainda
 *     prometiam "descarga mais frequente" no próprio motivo. Regra que não muda o plano é
 *     texto, não regra.
 *
 * Roda em `npm run check`.
 */
import fs from "node:fs";
import path from "node:path";
import type { Execucao } from "@/data/execucao";
import type { Aluno } from "@/data/alunos";
import type { PlanoTreino } from "@/data/periodizacao";
import { proximoPasso, diasDeSilencioQueAvisam, type CicloCtx } from "@/lib/gps/proximoPasso";
import { rotaDoDia } from "@/lib/gps/rotaDoDia";
import { gerarPlano } from "@/lib/gps/periodizacao";
import { groupGpsRules } from "@/lib/gps/groupRules";

const falhas: string[] = [];
const ok = (m: string) => console.log(`[check:registro] ok: ${m}`);
const falha = (m: string) => falhas.push(m);

const DIA = 86_400_000;

/* ============================ 1. Registro por série ============================ */
{
  const fonte = fs.readFileSync(path.resolve(process.cwd(), "src/lib/store.ts"), "utf8");

  /*
   * A SÉRIE PRECISA ESTAR NA CHAVE DO UPSERT. Sem ela, gravar a série 2 apaga a série 1 e
   * o exercício inteiro guarda só os últimos valores digitados. Este é o defeito original,
   * e ele volta com uma linha a menos no filtro.
   */
  const inicio = fonte.indexOf("addExecucao: (e) =>");
  const bloco = fonte.slice(inicio, fonte.indexOf("removeExecucao:", inicio));
  if (!/x\.serie \?\? null\) === \(e\.serie \?\? null/.test(bloco))
    falha("o upsert de execução não considera a série: gravar a série 2 vai apagar a série 1");
  else ok("o upsert de execução tem a série na chave (série 2 não apaga a série 1)");

  /* O id carrega a série, que é como ela sobrevive à ida e volta da nuvem sem coluna nova. */
  const registro = fs.readFileSync(path.resolve(process.cwd(), "src/components/student/blocoRegistro.tsx"), "utf8");
  if (!/-r\$\{serieAtual\}/.test(registro))
    falha("o id da execução não carrega a série: cada série sobrescreveria a anterior na nuvem");
  else ok("o id da execução carrega a série (`-r<n>`), e cada série é uma linha própria");

  const repo = fs.readFileSync(path.resolve(process.cwd(), "src/lib/backend/supabaseRepo.ts"), "utf8");
  if (!/serie: serieDoId\(r\.id\)/.test(repo))
    falha("a leitura da nuvem não recupera a série do id: o dado volta achatado do servidor");
  else ok("a leitura da nuvem recupera a série a partir do id");

  /*
   * O BOTÃO NÃO PODE MAIS SÓ AVANÇAR O CONTADOR. Era este o coração do defeito: o clique
   * em "Registrar série 2" chamava `setSerie(s => s + 1)` e não gravava nada.
   */
  if (/onClick=\{ultimaSerie \? registrar/.test(registro))
    falha("o botão de registrar voltou a só avançar o contador nas séries que não são a última");
  else ok("cada toque em “Registrar série N” grava aquela série");
}

/* ------- O bloco só fecha quando todas as séries prescritas foram registradas ------- */
{
  // Importado por caminho relativo porque é .tsx: o mesmo módulo que a tela usa, para a
  // régua não testar uma cópia da regra.
  const { totalSeriesDe, blocoCompleto, seriesFeitas, resumoDasSeries } = await import("@/components/student/blocoRegistro");

  const plano = gerarPlano({ objetivo: "Hipertrofia", nivel: "Intermediário", semanas: 4, frequencia: 3 });
  const bloco = plano.principal.mesociclos[0].microciclos[0].sessoes[0].blocos.find((b) => b.seriesAlvo != null);
  if (!bloco) {
    falha("o motor não produziu bloco de força com alvo de séries: o resto do teste não tem sobre o que rodar");
  } else {
    const total = totalSeriesDe(bloco);
    if (total < 2) falha(`o bloco de teste pede ${total} série(s); o caso interessante precisa de pelo menos 2`);

    const serieEm = (n: number, carga: number): Execucao => ({
      id: `ex-${bloco.id}-s1-r${n}`,
      alunoId: "a1",
      planoId: plano.principal.id,
      semana: 1,
      sessaoRef: "s1",
      blocoRef: bloco.id,
      serie: n,
      cargaFeita: carga,
      repsFeitas: 12,
      concluidoEm: Date.now(),
    });

    const parcial = [serieEm(1, 60)];
    if (blocoCompleto(bloco, parcial, 1)) falha("uma série registrada já fecha um bloco de várias séries");
    else ok(`bloco de ${total} séries não fecha com 1 registrada`);

    const todas = Array.from({ length: total }, (_, i) => serieEm(i + 1, i === total - 1 ? 55 : 60));
    if (!blocoCompleto(bloco, todas, 1)) falha("o bloco não fecha nem com todas as séries registradas");
    else ok(`bloco fecha com as ${total} séries registradas`);

    /*
     * A CENA QUE O PRODUTO PROMETE: três séries, a última mais leve. O registro tem que
     * preservar as três cargas, porque é essa diferença que decide a dose da semana
     * seguinte. Com um registro por exercício, ela era indistinguível de "três iguais".
     */
    const cargas = seriesFeitas(todas, 1, bloco.id).map((e) => e.cargaFeita);
    if (new Set(cargas).size < 2)
      falha("as cargas das séries não sobrevivem ao registro: a queda da última série se perde");
    else ok(`as cargas de cada série sobrevivem separadas (${cargas.join(", ")} kg)`);

    const resumo = resumoDasSeries(todas);
    if (!resumo.includes("55")) falha(`o resumo do bloco não mostra a série mais leve: "${resumo}"`);
    else ok(`o resumo mostra o que aconteceu em cada série: "${resumo}"`);

    /* Registro antigo, sem série, continua fechando o bloco: histórico não vira pendência. */
    const legado: Execucao[] = [{ ...serieEm(1, 60), id: `ex-${bloco.id}-s1`, serie: undefined }];
    if (!blocoCompleto(bloco, legado, 1))
      falha("registro antigo (sem série) deixou de fechar o bloco: histórico concluído virou pendência");
    else ok("registro anterior ao modelo por série continua fechando o bloco");
  }
}

/* ======================== 2. O silêncio do aluno aparece ======================== */
{
  const agora = Date.now();
  const aluno = { id: "a1", nome: "Aluno de teste", status: "ativo" } as Aluno;
  const macro = gerarPlano({ objetivo: "Hipertrofia", nivel: "Iniciante", semanas: 12, frequencia: 3 }).principal;
  const plano = {
    id: "p1",
    alunoId: "a1",
    status: "ativo",
    data: agora - 60 * DIA,
    frequenciaSemanal: 3,
    semanas: 12,
    macrociclo: macro,
  } as unknown as PlanoTreino;

  const limite = diasDeSilencioQueAvisam(3);
  const ctxCom = (ultimoRegistroHa: number): CicloCtx => ({
    avaliacoes: [{ alunoId: "a1", data: agora - 50 * DIA } as never],
    prescricoes: [],
    planos: [plano],
    liberacoes: [{ alunoId: "a1", data: agora, resultado: "liberado" } as never],
    execucoes: [{ alunoId: "a1", concluidoEm: agora - ultimoRegistroHa * DIA }],
  });

  const calado = proximoPasso(aluno, ctxCom(limite + 3));
  if (!calado.chip || !/registrar/i.test(calado.chip.label))
    falha(`aluno sem registro há ${limite + 3} dias não gerou sinal (chip: ${calado.chip?.label ?? "nenhum"})`);
  else ok(`aluno calado há ${limite + 3} dias recebe o chip “${calado.chip.label}”`);

  const emDia = proximoPasso(aluno, ctxCom(1));
  if (emDia.chip && /registrar/i.test(emDia.chip.label))
    falha("aluno que registrou ontem foi marcado como parado: o limiar dispara cedo demais");
  else ok("aluno que registrou ontem não é marcado como parado");

  /* O sinal precisa chegar à FILA, não só ao chip: é isso que o produto promete. */
  const rota = rotaDoDia([aluno], ctxCom(limite + 3));
  const naFila = rota.paradas.find((p) => p.aluno.id === "a1");
  if (!naFila) falha("o aluno que parou de registrar não entrou na rota do dia");
  else if (!naFila.acao) falha("a parada do aluno calado não traz a próxima ação ao lado");
  else ok(`o aluno calado entra na fila com a ação “${naFila.acao}”`);

  /* Plano recém-publicado não nasce alarmado. */
  const novo = { ...plano, data: agora - 2 * DIA } as PlanoTreino;
  const semNada = proximoPasso(aluno, {
    ...ctxCom(0),
    planos: [novo],
    execucoes: [],
  });
  if (semNada.chip && /registrar/i.test(semNada.chip.label))
    falha("plano publicado há 2 dias, ainda sem registro, já apareceu como aluno parado");
  else ok("plano recém-publicado sem registro ainda não alarma");

  /* O limiar acompanha a frequência: quem treina 2x por semana tem mais folga que 5x. */
  if (!(diasDeSilencioQueAvisam(2) > diasDeSilencioQueAvisam(5)))
    falha("o limiar de silêncio não acompanha a frequência do plano");
  else ok(`limiar por frequência: 2x = ${diasDeSilencioQueAvisam(2)} dias, 5x = ${diasDeSilencioQueAvisam(5)} dias`);
}

/* ============ 3. Cadência de descarga declarada tem que mudar o plano ============ */
{
  const PADRAO = 4; // CADENCIA_DELOAD, em src/lib/gps/periodizacao.ts
  const contarDescargas = (slug?: string) =>
    gerarPlano({ objetivo: "Hipertrofia", nivel: "Intermediário", semanas: 12, frequencia: 4, grupoEspecial: slug })
      .principal.mesociclos.flatMap((m) => m.microciclos)
      .filter((m) => m.tipo === "deload").length;

  const base = contarDescargas();
  for (const [slug, regra] of Object.entries(groupGpsRules)) {
    const cadencia = regra.modProgressao?.descargaCadaSemanas;
    const motivo = regra.modProgressao?.motivo ?? "";
    const prometeFrequencia = /descarga (mais )?frequente|alívio a cada/i.test(motivo);

    if (cadencia != null && cadencia >= PADRAO && prometeFrequencia)
      falha(`${slug}: o motivo promete alívio mais frequente e a cadência declarada (${cadencia}) é a do padrão`);

    if (prometeFrequencia) {
      const n = contarDescargas(slug);
      if (n <= base)
        falha(`${slug}: promete alívio mais frequente e produz ${n} descargas, o mesmo que um plano sem condição (${base})`);
    }
  }
  if (!falhas.length) ok("toda condição que promete alívio mais frequente entrega mais descargas que o plano sem condição");

  /* A promessa do roteiro C17, nominal: a hipertensão alivia mais que quem não tem queixa. */
  const ht1 = contarDescargas("hipertensao-estagio-1");
  if (!(ht1 > base))
    falha(`hipertensão estágio 1 produz ${ht1} descargas em 12 semanas, o mesmo que sem condição (${base})`);
  else ok(`hipertensão estágio 1: ${ht1} descargas em 12 semanas contra ${base} sem condição`);
}

/* --------------------------------- Veredito --------------------------------- */
if (falhas.length) {
  console.error(`\n[check:registro] ${falhas.length} falha(s):`);
  for (const f of falhas) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log("[check:registro] tudo certo.");
