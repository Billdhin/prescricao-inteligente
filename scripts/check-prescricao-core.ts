/**
 * GUARDRAIL do CORE: o que o motor de prescrição promete na tela, ele faz.
 *
 * Este arquivo nasceu de um áudio de campo. O fundador conversou com um professor que usa
 * um app concorrente em consultoria, testou o nosso e trouxe seis pontos. Quatro deles não
 * eram falta de recurso: eram o produto **dizendo uma coisa e fazendo outra**, que numa
 * ferramenta de decisão clínica é o pior tipo de defeito, porque quem assina embaixo é o
 * profissional.
 *
 * Cada bloco aqui trava um desses pontos. Se um deles voltar, o CI para.
 *
 *   1. LINEAR SAI LINEAR. "Ele falou que tava me dando uma periodização linear, mas no
 *      gráfico apareceu um ondulatório." Estava certo: as tendências do mesociclo vinham do
 *      ciclo de ondas de `focoDoMeso` e o modelo escolhido não mandava em nada.
 *   2. O CARDIO VARIA. "Não tava variando o tempo, o volume, a intensidade do cardio."
 *      Estava certo: `nivelDaTendencia` devolvia 0,5 fixo para tendência estável, e todo
 *      plano de grupo especial começa estável.
 *   3. A CONDIÇÃO CHEGA AO PLANO. "Cadastrei uma pessoa com hipertensão grau 2 e não consta
 *      no treino." Estava certo: `condicoesAtencao` era gravado pelo app e o motor lia só
 *      `grupoEspecial`.
 *   4. DUAS CONDIÇÕES = A MAIS CONSERVADORA. Consequência do 3: com mais de uma, o plano
 *      tem que ficar mais restrito, nunca menos.
 *
 * Roda com `npm run check:core`.
 */
import { gerarPlano, slugsClinicosDoPlano, metricaDoExercicio } from "../src/lib/gps/periodizacao";
import { agregadoSemana } from "../src/lib/gps/progressao";
import { combineRules, groupGpsRules } from "../src/lib/gps/groupRules";
import { rotuloObjetivoPar, parAtende } from "../src/lib/gps/objetivos";
import { OBJETIVOS } from "../src/lib/gps/engine";
import { specialGroups } from "../src/data/specialGroups";
import { exercises } from "../src/data/exercises";
import { estimativas } from "../src/lib/avaliacao/estimativas";
import { HORIZONTES_PLANO, rotuloHorizonte, getFaixa, type Mesociclo } from "../src/data/periodizacao";
import type { Nivel } from "../src/data/types";

const problemas: string[] = [];
const erro = (m: string) => problemas.push(m);
const NIVEIS: Nivel[] = ["Iniciante", "Intermediário", "Avançado"];

/** Média do agregado das semanas de CARGA de um mesociclo (a descarga é exceção de propósito). */
function mediaDeCarga(m: Mesociclo): { volume: number; intensidade: number } {
  const carga = m.microciclos.filter((w) => w.tipo === "carga");
  if (!carga.length) return { volume: 0, intensidade: 0 };
  let v = 0;
  let i = 0;
  let nInt = 0;
  for (const w of carga) {
    const a = agregadoSemana(w);
    v += a.volume;
    if (a.intensidade != null) {
      i += a.intensidade;
      nInt++;
    }
  }
  return { volume: v / carga.length, intensidade: nInt ? i / nInt : 0 };
}

/* ---------------------------- 1. Linear sai linear ---------------------------- */

for (const objetivo of OBJETIVOS) {
  for (const nivel of NIVEIS) {
    const plano = gerarPlano({ objetivo, nivel, semanas: 12, frequencia: 3, modeloPreferido: "linear" });
    const mesos = plano.principal.mesociclos;
    if (mesos.length < 2) continue;
    const ini = mediaDeCarga(mesos[0]);
    const fim = mediaDeCarga(mesos[mesos.length - 1]);
    // Rampa clássica: o volume desce e a intensidade sobe do começo ao fim do macrociclo.
    if (fim.volume > ini.volume + 0.001) {
      erro(
        `LINEAR ONDULOU: ${objetivo}/${nivel} termina com MAIS volume (${fim.volume.toFixed(2)}) do que começa (${ini.volume.toFixed(2)}).`,
      );
    }
    if (fim.intensidade < ini.intensidade - 0.001) {
      erro(
        `LINEAR INVERTIDO: ${objetivo}/${nivel} termina com MENOS intensidade (${fim.intensidade.toFixed(2)}) do que começa (${ini.intensidade.toFixed(2)}).`,
      );
    }
  }
}

/*
 * O MESMO, no caminho de grupo especial, que é o que o professor de fato usou.
 *
 * Aqui o PRIMEIRO mesociclo fica de fora da conta de propósito: ele é a fase de entrada e
 * adaptação da jornada clínica, deliberadamente mais leve, e a rampa progressiva começa
 * depois dela. Do segundo bloco em diante, linear é linear.
 */
for (const grupo of specialGroups.filter((g) => g.fases?.length)) {
  const plano = gerarPlano({
    objetivo: "Hipertrofia",
    nivel: "Iniciante",
    semanas: 12,
    frequencia: 3,
    grupoEspecial: grupo.slug,
    modeloPreferido: "linear",
  });
  const progressivos = plano.principal.mesociclos.slice(1);
  if (progressivos.length < 2) continue;
  const vols = progressivos.map((m) => mediaDeCarga(m).volume);
  const subiu = vols.findIndex((v, i) => i > 0 && v > vols[i - 1] + 0.001);
  if (subiu > 0) {
    erro(
      `LINEAR ONDULOU (grupo ${grupo.slug}): o bloco ${subiu + 2} tem MAIS volume (${vols[subiu].toFixed(1)}) que o anterior (${vols[subiu - 1].toFixed(1)}).`,
    );
  }
}

/*
 * AUTOVERIFICAÇÃO da asserção acima: ela precisa DISCRIMINAR, e não passar sempre.
 *
 * O discriminador tem que ondular ENTRE mesociclos, que é a escala em que este teste mede.
 * A ondulatória não serve: ela alterna de semana em semana, e a média do bloco achata a
 * oscilação (foi a própria autoverificação que apontou isso). Quem ondula entre blocos é o
 * modelo de BLOCOS, que mantém o ciclo acúmulo -> intensificação -> realização de
 * `focoDoMeso` — exatamente o comportamento que o modelo linear tinha por engano.
 *
 * Se nem o modelo de blocos violar a regra da rampa, o critério virou vácuo e não pegaria
 * a regressão.
 */
{
  let algumBlocoOndulou = false;
  for (const objetivo of OBJETIVOS) {
    for (const nivel of NIVEIS) {
      const p = gerarPlano({ objetivo, nivel, semanas: 12, frequencia: 3, modeloPreferido: "blocos" });
      const ms = p.principal.mesociclos;
      if (ms.length < 2) continue;
      const w = ms.map(mediaDeCarga);
      // Ondulação entre blocos = a série de volume não é monotônica não-crescente.
      if (w.some((x, i) => i > 0 && x.volume > w[i - 1].volume + 0.001)) algumBlocoOndulou = true;
    }
  }
  if (!algumBlocoOndulou) {
    erro(
      "AUTOVERIFICAÇÃO: nem o modelo de blocos violou a regra da rampa. O teste do modelo linear está passando por vacuidade e não detectaria a regressão.",
    );
  }
}

/* ------------------------------- 2. O cardio varia ------------------------------- */

for (const grupo of specialGroups.filter((g) => g.fases?.length)) {
  const plano = gerarPlano({
    objetivo: "Hipertrofia",
    nivel: "Iniciante",
    semanas: 12,
    frequencia: 3,
    grupoEspecial: grupo.slug,
  });
  const doses = new Set<string>();
  for (const m of plano.principal.mesociclos) {
    for (const w of m.microciclos) {
      for (const s of w.sessoes) {
        for (const b of s.blocos) {
          if (b.tipo === "aerobio") doses.add(`${b.duracaoAlvoMin}|${b.rpeAlvo}`);
        }
      }
    }
  }
  if (doses.size === 1) {
    erro(
      `CARDIO CHAPADO: plano de 12 semanas para ${grupo.slug} traz a MESMA dose aeróbia em todas as semanas (${[...doses][0]}).`,
    );
  }
}

/* --------------------- 3 e 4. As condições chegam, e a pior manda --------------------- */

const COM_REGRA = specialGroups.filter((g) => combineRules([g.slug]));
if (COM_REGRA.length < 2) erro("Catálogo com menos de 2 condições com regra: o teste de fusão não roda.");

for (let i = 0; i + 1 < Math.min(COM_REGRA.length, 8); i++) {
  const a = COM_REGRA[i].slug;
  const b = COM_REGRA[i + 1].slug;
  const base = { objetivo: "Hipertrofia" as const, nivel: "Iniciante" as Nivel, semanas: 12, frequencia: 3 };

  // (3) o campo chega ao motor: com a condição SÓ em `condicoesAtencao`, a regra tem que valer.
  const soAtencao = combineRules(slugsClinicosDoPlano({ condicoesAtencao: [b] }));
  if (!soAtencao) {
    erro(`CONDIÇÃO IGNORADA: "${b}" declarada só em condicoesAtencao não produziu regra clínica.`);
  }

  // (4) a fusão é sempre para o lado mais restrito, nunca para o mais frouxo.
  const so = combineRules([a]);
  const fundida = combineRules([a, b]);
  if (so?.complexidadeMax != null && fundida?.complexidadeMax != null && fundida.complexidadeMax > so.complexidadeMax) {
    erro(`FUSÃO AFROUXOU: ${a}+${b} tem teto de complexidade ${fundida.complexidadeMax}, maior que ${so.complexidadeMax} de ${a} sozinha.`);
  }
  if (fundida && so && fundida.cuidados.length < so.cuidados.length) {
    erro(`FUSÃO PERDEU CUIDADO: ${a}+${b} tem menos cuidados que ${a} sozinha.`);
  }

  // O plano com duas condições nomeia as duas para o profissional e não fica mais permissivo.
  const p1 = gerarPlano({ ...base, grupoEspecial: a });
  const p2 = gerarPlano({ ...base, grupoEspecial: a, condicoesAtencao: [b] });
  if (p2.principal.mesociclos.length === 0) erro(`Plano com duas condições (${a}+${b}) saiu sem mesociclos.`);
  if (p1.raciocinio === p2.raciocinio && combineRules([b])) {
    erro(`PLANO MUDO: acrescentar a condição "${b}" não mudou uma vírgula do raciocínio de ${a}.`);
  }
}

/* ------------------- 5. Horizontes: o de 8 semanas existe e gera ------------------- */

const bimestral = HORIZONTES_PLANO.find((h) => h.semanas === 8);
if (!bimestral) erro("HORIZONTE AUSENTE: não há opção de 8 semanas (pedido de campo: planos bimestrais).");
if (rotuloHorizonte(8) !== "Bimestral") erro(`rotuloHorizonte(8) devolveu "${rotuloHorizonte(8)}", esperado "Bimestral".`);
for (const h of HORIZONTES_PLANO) {
  const p = gerarPlano({ objetivo: "Hipertrofia", nivel: "Iniciante", semanas: h.semanas, frequencia: 3 });
  const total = p.principal.mesociclos.reduce((n, m) => n + m.microciclos.length, 0);
  if (total !== h.semanas) {
    erro(`HORIZONTE ${h.rotulo}: pediu ${h.semanas} semanas e o macrociclo veio com ${total}.`);
  }
}

/* ------------------- 6. O par de objetivos é uma coisa só no sistema ------------------- */

if (rotuloObjetivoPar("Hipertrofia") !== "Hipertrofia") {
  erro("rotuloObjetivoPar sem secundário deixou de ser byte-idêntico ao primário.");
}
if (rotuloObjetivoPar("Hipertrofia", "Hipertrofia") !== "Hipertrofia") {
  erro("rotuloObjetivoPar repetiu o objetivo quando primário e secundário são iguais.");
}
if (!rotuloObjetivoPar("Hipertrofia", "Força").includes("Força")) {
  erro("rotuloObjetivoPar não mostra o segundo objetivo.");
}
if (!parAtende("Força", "Hipertrofia", "Força")) erro("parAtende não reconheceu o objetivo secundário.");
if (parAtende("Emagrecimento", "Hipertrofia", "Força")) erro("parAtende aceitou um objetivo que não está no par.");

// As saídas que chegam ao profissional e ao aluno imprimem o PAR, e não só o primário.
// Formatar o par à mão em cada arquivo foi como o secundário sumiu dos três PDFs.
import { readFileSync } from "node:fs";
const SAIDAS = [
  "src/lib/exportPlano.ts",
  "src/lib/exportPrescricao.ts",
  "src/lib/exportProntuario.ts",
  "src/components/student/StudentApp.tsx",
];
for (const arq of SAIDAS) {
  const src = readFileSync(arq, "utf8");
  if (!src.includes("rotuloObjetivoPar")) {
    erro(`SAÍDA SEM O PAR: ${arq} imprime objetivo sem passar por rotuloObjetivoPar.`);
  }
}

// E as telas onde se escolhe objetivo oferecem o par, sem exceção: era a incoerência
// apontada ("num lugar dá para escolher 2 objetivos e em outro não").
const TELAS_DE_OBJETIVO = [
  "src/components/app/AlunoFormModal.tsx",
  "src/pages/AlunoPerfil.tsx",
  "src/pages/Gps.tsx",
  "src/pages/PrescreverTreino.tsx",
];
for (const arq of TELAS_DE_OBJETIVO) {
  const src = readFileSync(arq, "utf8");
  if (!src.includes("ObjetivoDuplo")) {
    erro(`TELA COM UM OBJETIVO SÓ: ${arq} escolhe objetivo sem oferecer o secundário.`);
  }
}

/* ===========================================================================
 * AUDITORIA DE EVIDÊNCIA (04/08/2026): quatro auditores conferiram o motor
 * contra o PubMed. Estas asserções travam as classes de defeito que acharam.
 * ========================================================================= */

/*
 * (A) REGRA CLÍNICA QUE NUNCA DISPARA É BUG.
 *
 * A escada de cautela de joelho na obesidade era 65/60/55 numa métrica cujo MAIOR valor no
 * catálogo é 58: os graus I e II prometiam cautela articular e não rebaixavam exercício
 * nenhum. Não dava erro, não dava tipo, e ninguém veria pela tela. Penalidade ou teto que
 * nenhum exercício alcança é código morto com aparência de segurança.
 */
for (const [slug, r] of Object.entries(groupGpsRules)) {
  for (const p of r.penalidades ?? []) {
    const atinge = exercises.filter((e) => {
      const v = metricaDoExercicio(e, p.metrica);
      return v !== undefined && v >= p.limite;
    }).length;
    if (atinge === 0) {
      erro(
        `REGRA MORTA: ${slug} penaliza "${p.metrica}" >= ${p.limite} e NENHUM dos ${exercises.length} exercícios alcança esse limite.`,
      );
    }
  }
  if (r.complexidadeMax != null) {
    const acima = exercises.filter((e) => {
      const v = metricaDoExercicio(e, "Complexidade técnica");
      return v !== undefined && v > r.complexidadeMax;
    }).length;
    if (acima === 0) {
      erro(`REGRA MORTA: ${slug} tem complexidadeMax ${r.complexidadeMax} e nenhum exercício passa disso.`);
    }
  }
}

/*
 * (B) INICIANTE NUNCA RECEBE REPETIÇÕES ABAIXO DA FAIXA DO PRÓPRIO NÍVEL.
 *
 * A ênfase da ondulatória era chaveada só pelo MODELO e atropelava o `porNivel`: um
 * INICIANTE de Força recebia blocos de "3 a 5" repetições, quando o ACSM Position Stand
 * 2009 (PMID 19204579) recomenda 8 a 12 RM para novato. Pior: o iniciante COM condição
 * declarada recebe justamente a alternativa flexível, que também ondula, ou seja, o aluno
 * mais frágil era quem pegava a dose mais pesada.
 */
for (const objetivo of OBJETIVOS) {
  const porNivel = getFaixa(objetivo).reps.porNivel?.Iniciante;
  const pisoDoNivel = Number(porNivel?.match(/\d+/)?.[0] ?? 0);
  if (!pisoDoNivel) continue;
  for (const modelo of ["linear", "ondulatoria", "flexivel", "blocos", "autorregulada"] as const) {
    const p = gerarPlano({ objetivo, nivel: "Iniciante", semanas: 12, frequencia: 3, modeloPreferido: modelo });
    for (const macro of [p.principal, p.alternativa]) {
      for (const m of macro?.mesociclos ?? []) {
        for (const w of m.microciclos) {
          for (const s of w.sessoes) {
            for (const b of s.blocos) {
              if (b.tipo !== "forca" || !b.reps) continue;
              const piso = Number(b.reps.match(/\d+/)?.[0] ?? 0);
              if (piso && piso < pisoDoNivel) {
                erro(
                  `INICIANTE ABAIXO DA FAIXA: ${objetivo}/${modelo} entregou bloco de "${b.reps}" repetições, e o porNivel do iniciante é "${porNivel}".`,
                );
              }
            }
          }
        }
      }
    }
  }
}

/*
 * (C) ESTIMATIVA NUNCA DEVOLVE NÚMERO FISIOLOGICAMENTE IMPOSSÍVEL.
 *
 * O piso do teste de 12 minutos era 800 m e a equação devolvia 6,6 mL/kg/min ali: menos de
 * 2 METs, abaixo do custo de ficar em pé. O app aceitava, imprimia com uma casa decimal e
 * gravava no histórico do aluno como se fosse um teste.
 */
for (const est of estimativas.filter((e) => e.unidade === "mL/kg/min")) {
  const numericos = est.campos.filter((c) => c.tipo === "numero");
  for (const c of numericos) {
    const v: Record<string, number> = {};
    for (const cc of est.campos) v[cc.chave] = cc.tipo === "sexo" ? 1 : (cc.min + cc.max) / 2;
    for (const extremo of [c.min, c.max]) {
      v[c.chave] = extremo;
      const r = est.calcular(v);
      if (r.valor != null && r.valor < 15) {
        erro(
          `VO2 IMPLAUSÍVEL: ${est.id} devolveu ${r.valor} mL/kg/min com ${c.chave}=${extremo}, abaixo do que um adulto que caminha tem em repouso.`,
        );
      }
    }
  }
}

/* --------------------------------- veredito --------------------------------- */

if (problemas.length) {
  console.error(`\n[check:core] REPROVOU (${problemas.length}):`);
  for (const p of problemas) console.error("  - " + p);
  console.error("");
  process.exit(1);
}
console.log(
  `[check:core] ok: linear sai linear, o cardio varia, as condições chegam ao plano e a mais conservadora manda, ${HORIZONTES_PLANO.length} horizontes geram a duração pedida, o par de objetivos é único no sistema, nenhuma regra clínica é letra morta, o iniciante nunca recebe repetição abaixo da faixa dele e nenhuma estimativa devolve VO₂ impossível.`,
);
