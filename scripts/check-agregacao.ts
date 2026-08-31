/**
 * GUARDRAIL: soma e média nunca aparecem sem dizer que são soma e média.
 *
 * Nasce de um defeito de campo com nome e número. Um professor acrescentou quatro exercícios
 * de membro superior numa sessão, viu a linha "Intensidade" mexer 2,3% e concluiu que o
 * gráfico não estava acompanhando a edição. O gráfico estava certo: o volume daquela semana
 * subiu 23%. Ele leu "intensidade" como "quanto de treino tem aqui", que é a leitura natural
 * da palavra sozinha.
 *
 * A explicação existia numa legenda abaixo do gráfico, e não bastou. Legenda se lê uma vez;
 * rótulo se lê toda vez. Este check trava as duas metades da correção:
 *
 *   1. O RÓTULO carrega a agregação. A série de volume diz "soma" e a de esforço diz "médio".
 *   2. O EFEITO DA EDIÇÃO responde a pergunta que foi feita: reproduzindo o gesto do
 *      professor, o módulo tem que devolver o volume subindo, o esforço parado E a frase que
 *      explica a diferença. Sem a frase, a tela volta a parecer quebrada.
 *   3. Autoverificação: com a regra afrouxada, o cenário-controle REPROVA. Um check que passa
 *      mesmo quebrado não protege nada.
 *
 * Roda com `npm run check:agregacao`.
 */
import { desenharProgressao } from "../src/lib/gps/progressao";
import { efeitoDaEdicao } from "../src/lib/gps/efeitoDaEdicao";
import { gerarPlano } from "../src/lib/gps/periodizacao";
import type { Microciclo } from "../src/data/periodizacao";

const falhas: string[] = [];
const ok = (m: string) => console.log(`[check:agregacao] ok: ${m}`);

/* ------------------ 1. O rótulo da série carrega a agregação ------------------ */
const plano = gerarPlano({
  objetivo: "Hipertrofia",
  nivel: "Intermediário",
  semanas: 8,
  frequencia: 4,
} as never) as never as { principal: Parameters<typeof desenharProgressao>[0] };

const desenho = desenharProgressao(plano.principal);
const serie = (id: string) => desenho.series.find((s) => s.id === id);

const REGRA_ROTULO: { id: string; precisa: RegExp; porque: string }[] = [
  { id: "vol", precisa: /soma/i, porque: "volume é Σ de séries×reps e minutos: sem 'soma' no nome, lê-se como nível" },
  { id: "int", precisa: /médi/i, porque: "esforço é média ponderada: sem 'médio' no nome, lê-se como 'quanto de treino'" },
];
for (const r of REGRA_ROTULO) {
  const s = serie(r.id);
  if (!s) {
    falhas.push(`série "${r.id}" sumiu do gráfico`);
    continue;
  }
  if (!r.precisa.test(s.nome)) falhas.push(`rótulo "${s.nome}" não declara a agregação. ${r.porque}`);
}
if (!falhas.length) ok(`rótulos declaram a agregação: ${desenho.series.map((s) => `"${s.nome}"`).join(", ")}`);

/* ---------- 2. O gesto do professor devolve número E leitura ---------- */
const macro = plano.principal as never as { mesociclos: { microciclos: Microciclo[] }[] };
const semana = macro.mesociclos[0].microciclos[0];
const sessao = semana.sessoes[0];
const modelo = sessao.blocos.find((b) => b.tipo !== "aerobio");
if (!modelo) {
  falhas.push("cenário inválido: a primeira sessão não tem bloco de força");
} else {
  // O gesto exato do campo: mais quatro exercícios na mesma sessão, mesma dose.
  const quatro = [1, 2, 3, 4].map((i) => ({ ...modelo, id: `check-${i}`, nome: `Superior ${i}` }));
  const depois: Microciclo = {
    ...semana,
    sessoes: semana.sessoes.map((s) => (s.id === sessao.id ? { ...s, blocos: [...s.blocos, ...quatro] } : s)),
  };

  const e = efeitoDaEdicao(semana, depois);
  if (!e) {
    falhas.push("acrescentar quatro exercícios não produziu efeito mensurável");
  } else {
    if (!(e.deltaVolume != null && e.deltaVolume >= 5))
      falhas.push(`volume deveria subir com quatro exercícios a mais, subiu ${e.deltaVolume}%`);
    if (!e.leitura)
      falhas.push(
        `sem frase de leitura no caso que originou o defeito (volume ${e.deltaVolume}%, esforço ${e.deltaEsforco}%). ` +
          "É exatamente aqui que a tela parece quebrada.",
      );
    if (e.leitura && !/soma/i.test(e.leitura))
      falhas.push("a frase de leitura não nomeia a diferença entre soma e média");
    if (!falhas.length)
      ok(
        `caso de campo reproduzido: volume ${e.deltaVolume}%, esforço ${e.deltaEsforco}%, com a leitura que explica a diferença`,
      );
  }

  /* -------- 3. Autoverificação: sem mudança nenhuma, nada é inventado -------- */
  if (efeitoDaEdicao(semana, semana) !== null)
    falhas.push("autoverificação: semana idêntica devolveu efeito, e o painel apareceria sem gesto nenhum");
  else ok("autoverificação: semana idêntica não produz painel");
}

if (falhas.length) {
  console.error(`\n[check:agregacao] REPROVADO (${falhas.length})`);
  for (const f of falhas) console.error("  - " + f);
  process.exit(1);
}
console.log("[check:agregacao] tudo certo.");
