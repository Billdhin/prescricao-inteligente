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
import { agregadoSemana, serieSemanal } from "../src/lib/gps/progressao";
import { classificarGrupos } from "../src/lib/gps/classificador";
import { alvoSemana } from "../src/lib/gps/alvo";
import { aplicarPrescricaoNoPlano, sessoesDaSemana } from "../src/lib/gps/semear";
import { sugerirTroca } from "../src/lib/gps/sugerirTroca";
import { recalcularAlvosDoMeso } from "../src/lib/gps/travas";
import { doseCurta, tokensDoBloco } from "../src/components/student/blocoRegistro";
import { EFEITO_POR_TAG, criarRestricao, rotuloRestricao } from "../src/lib/gps/restricoes";
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

/* ===========================================================================
 * BANCADA DE CENÁRIOS CLÍNICOS (04/08/2026): quatro defeitos que passaram por
 * TODOS os guardrails e só apareceram quando eu li plano por plano, de um aluno
 * inventado de cada vez. Nenhum dava erro, nenhum quebrava tipo, e os três
 * primeiros eram visíveis para o profissional na primeira sessão.
 * ========================================================================= */

/*
 * (D) APARELHO DE CARDIO NÃO ENTRA EM BLOCO DE FORÇA.
 *
 * Os aparelhos de cardio são os mais seguros em todas as métricas, então quanto mais estrita
 * a regra clínica do aluno, mais alto eles subiam na fila do seletor de força. O plano de
 * emagrecimento de um hipertenso estágio 2 com obesidade grau II saía com "Bicicleta
 * ergométrica 3 séries de 13 repetições". Quanto mais frágil o aluno, mais absurda a sessão.
 */
const AEROBIOS = new Set(exercises.filter((e) => e.doseAerobia).map((e) => e.slug));
if (AEROBIOS.size === 0) erro("Nenhum exercício marcado com doseAerobia: esta verificação passaria por vazio.");
for (const objetivo of OBJETIVOS) {
  for (const grupo of [undefined, "hipertensao-estagio-2", "obesidade-grau-3", "dor-lombar-inespecifica"]) {
    const p = gerarPlano({ objetivo, nivel: "Iniciante", semanas: 12, frequencia: 3, grupoEspecial: grupo });
    for (const macro of [p.principal, p.alternativa]) {
      for (const m of macro?.mesociclos ?? [])
        for (const w of m.microciclos)
          for (const s of w.sessoes)
            for (const b of s.blocos) {
              if (b.tipo === "aerobio" || !b.exercicioSlug) continue;
              if (AEROBIOS.has(b.exercicioSlug)) {
                erro(
                  `CARDIO COMO FORÇA: ${objetivo}/${grupo ?? "sem grupo"} prescreveu "${b.nome}" em bloco de força, com ${b.series} séries de ${b.reps}. A dose desse exercício é tempo.`,
                );
              }
            }
    }
  }
}

/*
 * (E) FUNDIR CONDIÇÕES NUNCA DEIXA O PLANO MENOS SEGURO.
 *
 * `fundirRegras` simplesmente não copiava `restricoesEstruturais` nem `posicoesEvitar` para o
 * objeto fundido. Declarar a SEGUNDA condição do aluno apagava as limitações estruturais da
 * primeira, o contrário do que o plano promete por escrito ao profissional.
 */
for (const [a, b] of [
  ["hipertensao-estagio-2", "obesidade-grau-2"],
  ["dor-lombar-inespecifica", "obesidade-grau-3"],
  ["osteoartrite-joelho", "idoso-destreinado"],
  ["gestante", "obesidade-grau-1"],
] as const) {
  const ra = groupGpsRules[a];
  const rb = groupGpsRules[b];
  const fundida = combineRules([a, b]);
  for (const t of [...(ra?.restricoesEstruturais ?? []), ...(rb?.restricoesEstruturais ?? [])]) {
    if (!fundida?.restricoesEstruturais?.includes(t)) {
      erro(`FUSÃO PERDEU SEGURANÇA: "${a}"+"${b}" descartou a limitação estrutural "${t}", que uma das duas condições declara sozinha.`);
    }
  }
  for (const pos of [...(ra?.posicoesEvitar ?? []), ...(rb?.posicoesEvitar ?? [])]) {
    if (!fundida?.posicoesEvitar?.includes(pos)) {
      erro(`FUSÃO PERDEU SEGURANÇA: "${a}"+"${b}" descartou a posição a evitar "${pos}".`);
    }
  }
}

/*
 * (F) A CONDIÇÃO QUE PEDE PARA EVITAR UMA POSIÇÃO NÃO RECEBE EXERCÍCIO NAQUELA POSIÇÃO.
 *
 * A gestante declarava, no próprio texto de cuidados, "evitar decúbito dorsal prolongado após
 * o 1º trimestre", e o plano dela abria com supino com halteres, deitada.
 */
for (const [slug, regra] of Object.entries(groupGpsRules)) {
  if (!regra.posicoesEvitar?.length) continue;
  for (const objetivo of OBJETIVOS) {
    const p = gerarPlano({ objetivo, nivel: "Intermediário", semanas: 12, frequencia: 3, grupoEspecial: slug });
    for (const m of p.principal.mesociclos)
      for (const w of m.microciclos)
        for (const s of w.sessoes)
          for (const b of s.blocos) {
            if (b.tipo === "aerobio" || !b.exercicioSlug) continue;
            const pos = exercises.find((e) => e.slug === b.exercicioSlug)?.restricaoPerfil?.posicao;
            if (pos && regra.posicoesEvitar.includes(pos)) {
              erro(`POSIÇÃO EVITADA NO PLANO: ${slug}/${objetivo} prescreveu "${b.nome}", que é executado na posição "${pos}".`);
            }
          }
  }
}

/*
 * (G) A FASE DE ENTRADA É A MAIS LEVE DO PLANO, E O PERFIL CLÍNICO PROGRIDE NO PASSO DELE.
 *
 * A primeira fase da jornada clínica era marcada "estável", e estável lê o MEIO da faixa,
 * enquanto a fase seguinte começa no PISO. O plano saía mais pesado na semana 1 do que na
 * semana 4, e terminava na dose em que tinha começado: a fase chamada "Entrada, segurança e
 * adaptação" era o segundo trecho mais pesado do macrociclo. Junto disso, o `modProgressao`
 * fundido (o quanto ESTE perfil progride mais devagar) era calculado, aparecia no raciocínio
 * e não chegava à geração: idoso obeso hipertenso recebia a mesma rampa de um adulto saudável.
 */
for (const slug of ["hipertensao-estagio-2", "obesidade-grau-3", "idoso-destreinado", "gestante", "pos-parto"]) {
  const p = gerarPlano({ objetivo: "Hipertrofia", nivel: "Iniciante", semanas: 12, frequencia: 3, grupoEspecial: slug });
  const cargas = p.principal.mesociclos.flatMap((m) => m.microciclos.filter((w) => w.tipo === "carga"));
  const dose = (w: (typeof cargas)[number]) => {
    const b = w.sessoes[0]?.blocos.find((x) => x.tipo !== "aerobio");
    return b?.rirAlvo != null ? -(b.rirAlvo * 100 + (b.repsAlvo ?? 0)) : null;
  };
  const primeira = dose(cargas[0]);
  const ultima = dose(cargas[cargas.length - 1]);
  if (primeira == null || ultima == null) continue;
  const maisPesadaQueODepois = cargas.slice(1).some((w) => (dose(w) ?? 0) < primeira);
  if (maisPesadaQueODepois) {
    erro(`ENTRADA PESADA DEMAIS: no plano de "${slug}" existe semana POSTERIOR mais leve que a semana 1, ou seja, a fase de entrada não é a mais leve do macrociclo.`);
  }
  if (!(ultima > primeira)) {
    erro(`PLANO CLÍNICO NÃO PROGRIDE: "${slug}" termina na mesma dose em que começou (intensidade ${primeira} -> ${ultima}).`);
  }
}

/*
 * O PASSO DO PERFIL CLÍNICO CHEGA AO ALVO.
 *
 * Comparar dois PLANOS não serve de prova aqui: o macrociclo com condição tem outra
 * quantidade de fases e outras semanas de descarga, então a diferença poderia vir daí e a
 * asserção passaria por vazio (foi o que aconteceu na primeira versão dela). A prova honesta
 * é chamar o alvo duas vezes com o MESMO contexto, mudando só o fator, e exigir que a versão
 * com passo reduzido caminhe menos e comece no mesmo lugar.
 */
{
  const dose = { series: "3 a 4", reps: "6 a 12", intensidade: "moderada a alta, 1 a 3 repetições de reserva", intervalo: "1 a 2 min" };
  const base = {
    semanasDeCargaNoMeso: 6,
    tipoSemana: "carga" as const,
    tendenciaVolume: "reduz" as const,
    tendenciaIntensidade: "sobe" as const,
    nivel: "Iniciante" as Nivel,
    objetivo: "Hipertrofia" as const,
  };
  const cheio1 = alvoSemana(dose, { ...base, semanaNoMeso: 1 });
  const cheio6 = alvoSemana(dose, { ...base, semanaNoMeso: 6 });
  const curto1 = alvoSemana(dose, { ...base, semanaNoMeso: 1, fatorProgressao: 0.5 });
  const curto6 = alvoSemana(dose, { ...base, semanaNoMeso: 6, fatorProgressao: 0.5 });

  if (curto1.repsAlvo !== cheio1.repsAlvo || curto1.rirAlvo !== cheio1.rirAlvo) {
    erro(`PASSO CLÍNICO: o fator mudou o PONTO DE PARTIDA (${cheio1.repsAlvo}x rir ${cheio1.rirAlvo} virou ${curto1.repsAlvo}x rir ${curto1.rirAlvo}); ele só deve encurtar o caminho.`);
  }
  const caminhouCheio = Math.abs((cheio6.repsAlvo ?? 0) - (cheio1.repsAlvo ?? 0));
  const caminhouCurto = Math.abs((curto6.repsAlvo ?? 0) - (curto1.repsAlvo ?? 0));
  if (!(caminhouCurto < caminhouCheio)) {
    erro(
      `PASSO CLÍNICO IGNORADO: com fatorProgressao 0,5 a rampa andou ${caminhouCurto} repetições, e sem fator andou ${caminhouCheio}. O modificador do perfil não está chegando ao alvo.`,
    );
  }
  if (caminhouCurto === 0) {
    erro("PASSO CLÍNICO EXAGERADO: com fator 0,5 a rampa parou de andar; progredir devagar não é deixar de progredir.");
  }
}

/*
 * (H) O ALVO DA SEMANA SOBREVIVE AO "APLICAR NO TREINO".
 *
 * Achado de uma bateria de fluxo: `blocosDePrescricao` devolvia só o TEXTO da faixa. Aplicar
 * uma prescrição na semana 5 trocava quatro blocos que diziam "3x7, RIR 2" por dois que
 * diziam apenas "3 a 4 x 6 a 8". A sessão que o profissional acabou de editar voltava a ser
 * faixa enquanto as vizinhas seguiam com número, no mesmo plano e na mesma semana. Nenhum
 * guardrail via, porque todos olhavam o plano RECÉM-GERADO, e este defeito só existe depois
 * que alguém mexe nele.
 */
for (const objetivo of OBJETIVOS) {
  for (const grupo of [undefined, "hipertensao-estagio-2"]) {
    for (const escopo of ["semana", "bloco"] as const) {
      const g = gerarPlano({ objetivo, nivel: "Intermediário", semanas: 12, frequencia: 3, grupoEspecial: grupo });
      const plano = {
        id: "p", alunoId: "a", titulo: g.titulo, objetivo, nivel: "Intermediário" as Nivel, semanas: 12,
        frequencia: 3, modeloId: g.modeloId, macrociclo: g.principal, criadoEm: 1, atualizadoEm: 1,
        semanaAtual: 1, status: "ativo", raciocinio: g.raciocinio, refIds: g.refIds, grupoEspecial: grupo,
      } as never as Parameters<typeof aplicarPrescricaoNoPlano>[0];

      const antes = sessoesDaSemana(plano, 5)[0]?.blocos.find((b) => b.tipo === "forca");
      if (antes?.repsAlvo == null) {
        erro(`AUTOVERIFICAÇÃO (H): a semana 5 de ${objetivo}/${grupo ?? "sem grupo"} já nasce sem alvo; esta asserção passaria por vazio.`);
        continue;
      }
      const r = aplicarPrescricaoNoPlano(
        plano,
        { id: "pr", alunoId: "a", objetivo, nivel: "Intermediário", criadoEm: 1, itens: [{ slug: "supino-maquina" }] } as never as Parameters<typeof aplicarPrescricaoNoPlano>[1],
        { semanaCorrente: 5, sessaoIndex: 0, escopo, modo: "substituir" } as never as Parameters<typeof aplicarPrescricaoNoPlano>[2],
      );
      const depois = sessoesDaSemana(r.plano, 5)[0]?.blocos.find((b) => b.tipo === "forca");
      if (depois?.repsAlvo == null) {
        erro(`ALVO PERDIDO AO APLICAR: ${objetivo}/${grupo ?? "sem grupo"} (${escopo}) ficou só com a faixa, sem número da semana.`);
      } else if (depois.seriesAlvo !== antes.seriesAlvo || depois.repsAlvo !== antes.repsAlvo || depois.rirAlvo !== antes.rirAlvo) {
        erro(
          `ALVO DIVERGENTE AO APLICAR: ${objetivo}/${grupo ?? "sem grupo"} (${escopo}) tinha ${antes.seriesAlvo}x${antes.repsAlvo} rir ${antes.rirAlvo} e virou ${depois.seriesAlvo}x${depois.repsAlvo} rir ${depois.rirAlvo}.`,
        );
      }
    }
  }
}

/*
 * (I) A TROCA DE EXERCÍCIO DO EDITOR SEGUE AS MESMAS REGRAS DO GERADOR.
 *
 * Achado de uma bateria funcional: as correções de cardio e de posição evitada tinham ido só
 * para o gerador de plano. No diálogo "Trocar", que mostra as DEZ primeiras sugestões, uma
 * caminhada aparecia entre elas em todos os casos testados, inclusive para substituir um
 * exercício de peitorais, e a gestante recebia quatro exercícios executados deitado no topo.
 *
 * Aqui o tratamento é o do módulo: cardio REBAIXA (continua na lista, sai do topo) e posição
 * evitada vai para os EXCLUÍDOS com o motivo escrito, que é onde a tela já sabe mostrá-los.
 */
{
  const AEROBIOS_TROCA = new Set(exercises.filter((e) => e.doseAerobia).map((e) => e.slug));
  const GRUPOS_ALVO = ["Peitorais", "Costas", "Membros inferiores", "Ombros", "Braços"];
  let avaliadas = 0;
  for (const grupo of [undefined, "gestante", "hipertensao-estagio-2", "obesidade-grau-3"]) {
    const regra = grupo ? combineRules([grupo]) : undefined;
    for (const objetivo of OBJETIVOS) {
      for (const alvo of GRUPOS_ALVO) {
        const recs = sugerirTroca(
          { objetivo, nivel: "Intermediário", restricoes: [], equipamentos: [], grupoEspecial: grupo },
          alvo,
        );
        avaliadas++;
        const incluidos = recs.filter((r) => !r.excluido);
        for (const r of incluidos.slice(0, 10)) {
          if (AEROBIOS_TROCA.has(r.exercise.slug)) {
            erro(`TROCA COM CARDIO NO TOPO: ${objetivo}/${grupo ?? "sem grupo"}/alvo ${alvo} sugere "${r.exercise.nome}" entre as 10 primeiras de um bloco de força.`);
          }
        }
        for (const r of incluidos) {
          const pos = r.exercise.restricaoPerfil?.posicao;
          if (pos && regra?.posicoesEvitar?.includes(pos)) {
            erro(`TROCA OFERECE POSIÇÃO EVITADA: ${objetivo}/${grupo}/alvo ${alvo} lista "${r.exercise.nome}" (posição "${pos}") como sugestão, e não como evitado com motivo.`);
          }
        }
        const evitadosSemMotivo = recs.filter((r) => r.excluido && !r.motivoExclusao);
        if (evitadosSemMotivo.length) {
          erro(`TROCA SEM MOTIVO: ${objetivo}/${grupo ?? "sem grupo"}/alvo ${alvo} tem ${evitadosSemMotivo.length} evitado(s) sem explicação.`);
        }
      }
    }
  }
  if (avaliadas === 0) erro("AUTOVERIFICAÇÃO (I): nenhuma troca avaliada; a asserção passaria por vazio.");
}

/*
 * (J) TRAVAR UMA VARIÁVEL CONGELA AQUELA VARIÁVEL, E NÃO REESCREVE O BLOCO.
 *
 * `recalcularAlvosDoMeso` re-derivava o alvo de TODAS as semanas a partir dos textos-faixa, e
 * o cabeçalho do módulo prometia que, sem trava, o resultado seria idêntico ao do gerador. A
 * promessa quebrou quando o gerador ganhou contexto que aquele módulo não carrega (rampa no
 * macrociclo, piso da onda de blocos, passo do perfil clínico). Medido: a fase de entrada de
 * um plano de hipertensão estágio 2 com obesidade grau II saía do gerador como
 * "4x12 RIR 3 · 4x12 RIR 3 · 4x11 RIR 3" e voltava como "4x12 RIR 3 · 4x9 RIR 2 · 3x6 RIR 1".
 * Travar (ou destravar) uma variável reescrevia o bloco inteiro numa progressão bem mais
 * agressiva, terminando a fase de ADAPTAÇÃO perto da falha.
 */
{
  const ctxT = { objetivo: "Força" as const, nivel: "Avançado" as Nivel };
  const gT = gerarPlano({ objetivo: "Força", nivel: "Avançado", semanas: 12, frequencia: 3, modeloPreferido: "blocos" });
  const doseT = (m: Mesociclo) =>
    m.microciclos.filter((w) => w.tipo === "carga").map((w) => {
      const b = w.sessoes[0]?.blocos.find((x) => x.tipo !== "aerobio");
      return { s: b?.seriesAlvo, r: b?.repsAlvo, i: b?.intervaloAlvoSeg };
    });

  let algumVariou = false;
  for (const m of gT.principal.mesociclos) {
    const orig = doseT(m);
    if (new Set(orig.map((d) => JSON.stringify(d))).size > 1) algumVariou = true;

    // Sem trava: idêntico ao gerador, byte a byte.
    const sem = doseT(recalcularAlvosDoMeso({ ...m, variaveisTravadas: [] }, ctxT));
    if (JSON.stringify(sem) !== JSON.stringify(orig)) {
      erro(`TRAVA REESCREVEU SEM TRAVA: o meso "${m.nome}" voltou diferente do gerador (${JSON.stringify(orig)} -> ${JSON.stringify(sem)}).`);
    }
    // Travado: a variável para de mudar.
    const tv = doseT(recalcularAlvosDoMeso({ ...m, variaveisTravadas: ["volume"] }, ctxT));
    if (new Set(tv.map((d) => `${d.s}|${d.r}`)).size > 1) {
      erro(`TRAVA DE VOLUME NÃO CONGELOU: "${m.nome}" segue com séries/repetições variando (${tv.map((d) => `${d.s}x${d.r}`).join(",")}).`);
    }
    const ti = doseT(recalcularAlvosDoMeso({ ...m, variaveisTravadas: ["intensidade"] }, ctxT));
    if (new Set(ti.map((d) => `${d.r}|${d.i}`)).size > 1) {
      erro(`TRAVA DE INTENSIDADE NÃO CONGELOU: "${m.nome}" segue com repetição/intervalo variando (${ti.map((d) => `${d.r}@${d.i}`).join(",")}).`);
    }
  }
  if (!algumVariou) {
    erro("AUTOVERIFICAÇÃO (J): nenhum mesociclo do plano de teste tem dose variável, então a verificação das travas passaria por vazio.");
  }
}

/*
 * (K) O GRÁFICO NÃO CONTRARIA A DOSE, E O CLASSIFICADOR ACERTA OS CORTES.
 *
 * Duas superfícies que nunca tinham sido testadas e que passaram limpas; a asserção entra
 * para que continuem assim.
 *
 * O gráfico é a queixa que abriu esta obra toda ("disse linear e apareceu ondulatório") e o
 * motor de dose mudou muito desde então. Ele é RELATIVO de propósito (a própria tela diz "sem
 * unidade absoluta"), então o que se confere não é o valor e sim a ORDEM: se a semana A tem
 * mais volume que a B na dose, tem que ter no gráfico também.
 *
 * O classificador é quem ESCREVE condição no aluno a partir da avaliação. Errar um corte aqui
 * contamina tudo que vem depois: o gate do semáforo, a regra clínica fundida e o plano.
 */
{
  for (const objetivo of OBJETIVOS) {
    for (const modelo of ["linear", "ondulatoria", "blocos"] as const) {
      const gK = gerarPlano({ objetivo, nivel: "Intermediário", semanas: 12, frequencia: 3, modeloPreferido: modelo });
      const micros = gK.principal.mesociclos.flatMap((m) => m.microciclos);
      const pontos = serieSemanal(gK.principal);
      if (pontos.length !== micros.length) {
        erro(`GRÁFICO COM SEMANAS A MENOS: ${objetivo}/${modelo} tem ${micros.length} semanas e ${pontos.length} pontos.`);
        continue;
      }
      for (let i = 0; i < pontos.length; i++) {
        if (pontos[i].semana !== micros[i].semana) {
          erro(`GRÁFICO FORA DE ORDEM: ${objetivo}/${modelo} ponto ${i} diz semana ${pontos[i].semana} e a semana é ${micros[i].semana}.`);
        }
        for (let j = i + 1; j < pontos.length; j++) {
          const va = agregadoSemana(micros[i]).volume;
          const vb = agregadoSemana(micros[j]).volume;
          if (Math.abs(va - vb) < 0.001) continue;
          if (va > vb !== pontos[i].vol > pontos[j].vol) {
            erro(
              `GRÁFICO CONTRARIA A DOSE: ${objetivo}/${modelo}, semanas ${micros[i].semana} e ${micros[j].semana}: dose ${va} contra ${vb}, gráfico ${pontos[i].vol} contra ${pontos[j].vol}.`,
            );
          }
        }
      }
    }
  }

  const alunoK = { id: "a", nome: "T", iniciais: "T", status: "ativo", objetivo: "Emagrecimento", nivel: "Iniciante", restricoes: [], equipamentos: [], criadoEm: 1 } as never as Parameters<typeof classificarGrupos>[0];
  const avK = (medidas: Record<string, number>) => [{ id: "av", alunoId: "a", data: 1, medidas }] as never as Parameters<typeof classificarGrupos>[1];
  // Cortes da SBC 2020 e das faixas de IMC: o de baixo NÃO sugere, o de cima sugere.
  const CORTES: { rot: string; medidas: Record<string, number>; esperado?: string }[] = [
    { rot: "IMC 29,9", medidas: { imc: 29.9 } },
    { rot: "IMC 30,1", medidas: { imc: 30.1 }, esperado: "obesidade-grau-1" },
    { rot: "IMC 35,2", medidas: { imc: 35.2 }, esperado: "obesidade-grau-2" },
    { rot: "IMC 41,0", medidas: { imc: 41 }, esperado: "obesidade-grau-3" },
    { rot: "PA 138/88", medidas: { pressaoSistolica: 138, pressaoDiastolica: 88 } },
    { rot: "PA 142/88", medidas: { pressaoSistolica: 142, pressaoDiastolica: 88 }, esperado: "hipertensao-estagio-1" },
    { rot: "PA 138/92", medidas: { pressaoSistolica: 138, pressaoDiastolica: 92 }, esperado: "hipertensao-estagio-1" },
    { rot: "PA 165/95", medidas: { pressaoSistolica: 165, pressaoDiastolica: 95 }, esperado: "hipertensao-estagio-2" },
    { rot: "PA 145/105", medidas: { pressaoSistolica: 145, pressaoDiastolica: 105 }, esperado: "hipertensao-estagio-2" },
  ];
  let sugeriuAlgo = false;
  for (const c of CORTES) {
    const slugs = classificarGrupos(alunoK, avK(c.medidas)).map((s) => s.grupoSlug);
    if (slugs.length) sugeriuAlgo = true;
    if (c.esperado && !slugs.includes(c.esperado)) {
      erro(`CLASSIFICADOR ERROU O CORTE: ${c.rot} deveria sugerir "${c.esperado}" e sugeriu [${slugs.join(", ") || "nada"}].`);
    }
    if (!c.esperado && slugs.length) {
      erro(`CLASSIFICADOR SUGERIU DEMAIS: ${c.rot} está abaixo do corte e sugeriu [${slugs.join(", ")}].`);
    }
  }
  if (!sugeriuAlgo) {
    erro("AUTOVERIFICAÇÃO (K): o classificador não sugeriu NADA em nenhum caso; a verificação dos cortes passaria por vazio.");
  }
}

/*
 * (L) O ALUNO VÊ O ALVO DA SEMANA, NÃO A FAIXA DA DIRETRIZ.
 *
 * Achado de bateria funcional, e era o defeito mais caro do app do aluno. Um plano de 12
 * semanas progride de "4 x 12, RIR 3" até "3 x 6, RIR 1", com descarga nas semanas 4, 8 e 12,
 * e o aluno recebia nas DOZE semanas a mesma frase: "3 a 4 x 6 a 12 · 1 a 2 min". Nem a
 * progressão nem a descarga chegavam a quem executa. A onda inteira do alvo semanal chegava
 * ao editor do profissional e ao PDF, e parava antes do app.
 */
{
  const gL = gerarPlano({ objetivo: "Hipertrofia", nivel: "Iniciante", semanas: 12, frequencia: 3 });
  const vistos = new Set<string>();
  let comAlvo = 0;
  for (const m of gL.principal.mesociclos)
    for (const w of m.microciclos)
      for (const b of w.sessoes[0]?.blocos ?? []) {
        if (b.tipo === "aerobio" || b.repsAlvo == null) continue;
        comAlvo++;
        const linha = doseCurta(b);
        vistos.add(linha);
        // O número da semana precisa aparecer para o aluno, não a faixa.
        if (!linha.includes(`${b.seriesAlvo} x ${b.repsAlvo}`)) {
          erro(`APP DO ALUNO SEM O ALVO: semana ${w.semana}, "${b.nome}" tem alvo ${b.seriesAlvo}x${b.repsAlvo} e o aluno lê "${linha}".`);
        }
        if (b.rirAlvo != null && !linha.includes(`RIR ${b.rirAlvo}`)) {
          erro(`APP DO ALUNO SEM O RIR: semana ${w.semana}, "${b.nome}" tem RIR ${b.rirAlvo} e o aluno lê "${linha}".`);
        }
        for (const t of tokensDoBloco(b)) {
          if (!t.value || t.value.includes("undefined") || t.value.includes("NaN")) {
            erro(`APP DO ALUNO COM TOKEN VAZIO: semana ${w.semana}, "${b.nome}", token "${t.label}" saiu "${t.value}".`);
          }
        }
      }
  if (comAlvo === 0) erro("AUTOVERIFICAÇÃO (L): nenhum bloco com alvo no plano de teste; a asserção passaria por vazio.");
  // E o aluno tem que ver o plano MUDAR: uma frase só nas 12 semanas é o defeito de origem.
  if (vistos.size <= 1) {
    erro(`APP DO ALUNO CHAPADO: as 12 semanas mostram a MESMA dose ao aluno ("${[...vistos][0]}").`);
  }
}

/*
 * (M) RESTRIÇÃO PURAMENTE INFORMATIVA NÃO REORDENA O CATÁLOGO.
 *
 * Várias das 30 restrições físicas são avisos de conduta: "cãibras frequentes" e "torácica
 * sensível", por exemplo, não desaconselham exercício nenhum, só deixam uma nota para o
 * profissional. Elas devolvem a ação `adaptar` para os 97 exercícios.
 *
 * Só que `adaptar` valia 2 e o baseline neutro do seletor é 2,5, então uma restrição que não
 * desaconselha NADA rebaixava tudo abaixo do neutro e, com isso, anulava a preferência que
 * outra restrição tinha estabelecido. Medido: um aluno com "assimetria funcional" recebia
 * exercícios unilaterais (afundo, clam shell, rotação externa, prancha lateral); marcar
 * TAMBÉM "cãibras frequentes" trocava a lista inteira por leg press, ponte de glúteos e
 * puxada alta. Declarar mais sobre o aluno piorava o plano dele, que é a mesma família do
 * defeito da fusão de regras clínicas.
 */
{
  const tagsInformativas = (Object.keys(EFEITO_POR_TAG) as (keyof typeof EFEITO_POR_TAG)[]).filter((tag) => {
    const avaliar = EFEITO_POR_TAG[tag]!;
    const sel = criarRestricao(tag, { gravidade: "moderada" });
    return exercises.every((ex) => avaliar(ex, sel).acao === "adaptar");
  });
  if (!tagsInformativas.length) {
    erro("AUTOVERIFICAÇÃO (M): nenhuma restrição puramente informativa no catálogo; a asserção passaria por vazio.");
  }

  const listaDe = (restricoes: ReturnType<typeof criarRestricao>[], objetivo: (typeof OBJETIVOS)[number]) => {
    const p = gerarPlano({ objetivo, nivel: "Intermediário", semanas: 8, frequencia: 3, restricoes });
    const s = new Set<string>();
    for (const m of p.principal.mesociclos)
      for (const w of m.microciclos)
        for (const se of w.sessoes)
          for (const b of se.blocos) if (b.tipo !== "aerobio" && b.exercicioSlug) s.add(b.exercicioSlug);
    return [...s].sort().join(",");
  };

  // Uma restrição que PREFERE alguma coisa, para a preferência ter o que perder.
  const comPreferencia = criarRestricao("assimetria_funcional", { gravidade: "moderada" });
  for (const objetivo of OBJETIVOS) {
    const base = listaDe([comPreferencia], objetivo);
    for (const tag of tagsInformativas) {
      const somada = listaDe([comPreferencia, criarRestricao(tag, { gravidade: "moderada" })], objetivo);
      if (base !== somada) {
        erro(
          `RESTRIÇÃO INFORMATIVA REORDENOU: em ${objetivo}, acrescentar "${rotuloRestricao(tag)}" (que não desaconselha exercício nenhum) trocou a seleção de [${base}] para [${somada}].`,
        );
      }
    }
  }
}

/* ============================================================================
 * A CAMADA CLÍNICA SÓ APERTA: declarar uma condição NUNCA deixa o plano mais pesado.
 *
 * É a lei escrita no topo de periodizacao.ts e de groupRules.ts, e ela foi quebrada em
 * silêncio por um campo que se chama `bandaMax`, cuja fusão pega a MENOR e cujo comentário
 * diz "admitir e não obrigar: a banda é um TETO". O consumidor devolvia a banda da condição
 * direto, sem comparar com o padrão do objetivo, e o efeito medido em `ansiedade-depressao`
 * era o aeróbio sair de "Moderada, RPE 5 a 6" para "Vigorosa, RPE 7 a 8": declarar a
 * condição SUBIA o esforço prescrito, já na primeira semana.
 *
 * Nenhuma trava olhava para isso. As que existiam cobrem "a condição CHEGA ao plano" e "a
 * mais conservadora manda entre duas condições"; nenhuma cobria a direção do efeito de UMA.
 *
 * A comparação é por EXTREMO do plano inteiro, e não semana a semana, de propósito: a
 * cadência de descarga da condição muda quantas semanas de carga existem, então uma semana
 * isolada pode cair em outro ponto da rampa sem que nada tenha afrouxado. O que não pode é
 * o plano com condição alcançar um pico de esforço que o plano sem condição não alcança.
 *
 * Volume não entra aqui: `enfaseModalidade` pode ACRESCENTAR uma sessão aeróbia na semana,
 * e isso é aumento de volume declarado e de via única, não de intensidade.
 * ========================================================================== */
{
  const OBJ = OBJETIVOS;
  const NIV: Nivel[] = ["Iniciante", "Intermediário", "Avançado"];
  const blocosDe = (p: ReturnType<typeof gerarPlano>) =>
    p.principal.mesociclos.flatMap((m) => m.microciclos.flatMap((mi) => mi.sessoes.flatMap((s) => s.blocos)));
  /** Os três extremos de ESFORÇO do plano. RIR é invertido: menos reserva é mais esforço. */
  const picos = (p: ReturnType<typeof gerarPlano>) => {
    const bs = blocosDe(p);
    const aer = bs.filter((b) => b.tipo === "aerobio");
    const forca = bs.filter((b) => b.tipo === "forca");
    return {
      rpe: Math.max(-1, ...aer.map((b) => b.rpeAlvo ?? -1)),
      rir: Math.min(99, ...forca.map((b) => b.rirAlvo ?? 99)),
      carga: Math.max(-1, ...forca.map((b) => b.cargaRelativaAlvo ?? -1)),
    };
  };

  for (const objetivo of OBJ)
    for (const nivel of NIV)
      for (const semanas of [8, 12, 24]) {
        const base = picos(gerarPlano({ objetivo, nivel, semanas, frequencia: 3 }));
        for (const g of specialGroups.map((s) => s.slug)) {
          const com = picos(gerarPlano({ objetivo, nivel, semanas, frequencia: 3, grupoEspecial: g }));
          const cen = `${g}/${objetivo}/${nivel}/${semanas}sem`;
          if (com.rpe > base.rpe)
            problemas.push(`A CONDIÇÃO AUMENTOU O ESFORÇO AERÓBIO em ${cen}: pico de RPE ${base.rpe} sem ela e ${com.rpe} com ela.`);
          if (base.rir < 99 && com.rir < base.rir)
            problemas.push(`A CONDIÇÃO REDUZIU A RESERVA DE REPETIÇÕES em ${cen}: RIR mínimo ${base.rir} sem ela e ${com.rir} com ela.`);
          if (base.carga >= 0 && com.carga > base.carga)
            problemas.push(`A CONDIÇÃO AUMENTOU A CARGA RELATIVA em ${cen}: pico ${base.carga}% sem ela e ${com.carga}% com ela.`);
        }
      }
}

/* ============================================================================
 * A FASE DE CONTINUAÇÃO SUSTENTA O PATAMAR, NÃO ALIVIA.
 *
 * Em horizonte longo o caminho clínico repete a última fase da jornada, e o cartão dela diz
 * "continuação da fase para sustentar os ganhos". Essas repetições eram marcadas "estavel", e
 * "estavel" lê o MEIO da faixa citada, sem relação nenhuma com o ponto a que a rampa das
 * fases reais tinha chegado. Medido em 48 semanas de hipertrofia para intermediário:
 *
 *   obesidade grau 2   fim da Fase 4: 4x7 RIR 1   fim da continuação: 4x7 RIR 2
 *   diabetes tipo 2    fim da Fase 4: 4x6 RIR 1   fim da continuação: 4x7 RIR 2
 *
 * O plano terminava mais leve do que estava na semana 32, prometendo sustentação no cartão.
 *
 * A trava compara o PICO de esforço da continuação com a ÚLTIMA semana de carga da última
 * fase real. Pico, e não a última semana da continuação, porque na ondulatória o movimento é
 * dentro da semana e a última pode ser um vale legítimo da onda.
 * ========================================================================== */
{
  const semanas = 48;
  const cargasDe = (m: Mesociclo) => m.microciclos.filter((w) => w.tipo === "carga");
  const forcaDe = (w: ReturnType<typeof cargasDe>[number]) =>
    w.sessoes.flatMap((s) => s.blocos).filter((b) => b.tipo === "forca");

  for (const grupo of specialGroups.filter((g) => g.fases?.length))
    for (const objetivo of OBJETIVOS)
      for (const nivel of ["Iniciante", "Intermediário"] as Nivel[]) {
        const p = gerarPlano({ objetivo, nivel, semanas, frequencia: 3, grupoEspecial: grupo.slug });
        const conts = p.principal.mesociclos.filter((m) => m.nome.includes("continuação"));
        const reais = p.principal.mesociclos.filter((m) => !m.nome.includes("continuação"));
        if (!conts.length || !reais.length) continue;
        const ultima = cargasDe(reais[reais.length - 1]).at(-1);
        if (!ultima) continue;
        const cen = `${grupo.slug}/${objetivo}/${nivel}/${semanas}sem`;

        const rirReal = Math.min(99, ...forcaDe(ultima).map((b) => b.rirAlvo ?? 99));
        const cargaReal = Math.max(-1, ...forcaDe(ultima).map((b) => b.cargaRelativaAlvo ?? -1));
        const semanasCont = conts.flatMap(cargasDe);
        const rirCont = Math.min(99, ...semanasCont.flatMap((w) => forcaDe(w).map((b) => b.rirAlvo ?? 99)));
        const cargaCont = Math.max(-1, ...semanasCont.flatMap((w) => forcaDe(w).map((b) => b.cargaRelativaAlvo ?? -1)));

        if (rirReal < 99 && rirCont > rirReal)
          erro(`CONTINUAÇÃO ALIVIOU em ${cen}: a última fase real fechou com RIR ${rirReal} e o pico da continuação é RIR ${rirCont} (mais folgado).`);
        if (cargaReal >= 0 && cargaCont < cargaReal)
          erro(`CONTINUAÇÃO ALIVIOU em ${cen}: a última fase real fechou com ${cargaReal}% de 1RM e o pico da continuação é ${cargaCont}%.`);

        // O cartão da continuação não pode prometer subida sobre um patamar congelado.
        for (const c of conts)
          for (const campo of ["tendenciaVolume", "tendenciaIntensidade"] as const)
            if (c[campo] === "sobe" || c[campo] === "reduz")
              erro(`CARTÃO DA CONTINUAÇÃO PROMETE MOVIMENTO em ${cen}: ${campo}="${c[campo]}" numa fase que segura o patamar.`);
      }
}

/* ============================================================================
 * FORÇA TEM INSTRUMENTO NUMÉRICO DE INTENSIDADE, E ELE PROGRIDE.
 *
 * A Força foi, até 09/08/2026, o único objetivo sem número de intensidade: Hipertrofia
 * controlava por reserva de repetições, Resistência muscular por %1RM, e a Força só dizia
 * "alta". Consequência dupla: o alvo semanal não progredia intensidade no objetivo de carga
 * mais pesada do produto, e o rirMinimo das condições clínicas não tinha onde morder ali.
 *
 * O instrumento vive na NOTA da faixa ("2 a 4 de reserva", robinson-rir-2024), e o motor o
 * lê por regex. É exatamente a classe de acoplamento que morre em silêncio: uma reescrita
 * inocente do texto da nota desliga o parser e a Força volta a ficar sem número, sem nenhum
 * erro de compilação. Esta trava transforma esse silêncio em reprovação.
 * ========================================================================== */
{
  for (const nivel of ["Iniciante", "Intermediário", "Avançado"] as Nivel[]) {
    const p = gerarPlano({ objetivo: "Força", nivel, semanas: 12, frequencia: 3 });
    const blocos = p.principal.mesociclos
      .flatMap((m) => m.microciclos.filter((w) => w.tipo === "carga"))
      .flatMap((w) => w.sessoes.flatMap((s) => s.blocos))
      .filter((b) => b.tipo === "forca");
    const semRir = blocos.filter((b) => b.rirAlvo == null).length;
    if (semRir > 0)
      erro(
        `FORÇA SEM INSTRUMENTO em ${nivel}: ${semRir} de ${blocos.length} blocos sem alvo de reserva. A nota da faixa deixou de declarar o RIR ou o parser deixou de lê-la.`,
      );
    const fora = blocos.filter((b) => b.rirAlvo != null && (b.rirAlvo < 2 || b.rirAlvo > 4)).length;
    if (fora > 0)
      erro(`FORÇA FORA DA RESERVA DECLARADA em ${nivel}: ${fora} blocos com RIR fora de 2 a 4.`);
    const distintos = new Set(blocos.map((b) => b.rirAlvo).filter((v) => v != null));
    if (blocos.length > 0 && distintos.size < 2)
      erro(
        `FORÇA COM INTENSIDADE CHAPADA em ${nivel}: um único valor de reserva (${[...distintos].join(",")}) em 12 semanas. O instrumento existe e não progride.`,
      );
  }
}

/* ============================================================================
 * O CARTÃO DE MODALIDADES DO MESOCICLO DESCREVE O QUE O PLANO CONTÉM.
 *
 * Existiam duas fontes paralelas (uma função por objetivo e a lista autorada da fase da
 * jornada) e nenhuma olhava o plano montado. Quando a osteoartrite de joelho passou a
 * receber hidroginástica por evidência, o cartão seguiu prometendo caminhada: com joelho em
 * atenção, cartão [m-musculacao, m-caminhada] e blocos [m-hidro]. É a mesma classe do "diz
 * linear e o gráfico ondula", e a trava cobre a mesma direção: nenhuma modalidade prometida
 * pode estar ausente dos blocos, e o cartão nunca sai vazio.
 * ========================================================================== */
{
  for (const grupo of [undefined, "osteoartrite-joelho", "obesidade-grau-3"])
    for (const objetivo of ["Emagrecimento", "Hipertrofia"] as const) {
      const p = gerarPlano({ objetivo, nivel: "Iniciante", semanas: 12, frequencia: 3, grupoEspecial: grupo });
      for (const meso of p.principal.mesociclos) {
        const nosBlocos = new Set<string>(["m-musculacao"]);
        for (const w of meso.microciclos)
          for (const s of w.sessoes)
            for (const b of s.blocos) if (b.tipo === "aerobio" && b.modalidade) nosBlocos.add(b.modalidade);
        const cen = `${grupo ?? "sem"}/${objetivo}/${meso.nome}`;
        if (meso.modalidades.length === 0) erro(`CARTÃO DE MODALIDADES VAZIO em ${cen}.`);
        for (const m of meso.modalidades)
          if (!nosBlocos.has(m))
            erro(`CARTÃO PROMETE MODALIDADE AUSENTE em ${cen}: "${m}" não existe em nenhum bloco do mesociclo.`);
      }
    }
}

/* ============================================================================
 * O CARDIO PREFERIDO SÓ VENCE SE O ALUNO TIVER COMO EXECUTÁ-LO.
 *
 * "Piscina" está na lista de equipamentos do produto, e a primeira versão da escolha de
 * modalidade ignorava equipamentos: um aluno com osteoartrite SEM piscina declarada recebia
 * um plano inteiro de hidroginástica. É a mesma impossibilidade técnica que a prontidão já
 * trata na força, reintroduzida pela porta nova.
 *
 * A trava percorre a lista de preferência do joelho degrau a degrau: com piscina vence o
 * aquático; sem piscina e com bicicleta vence a bicicleta; sem as duas volta à caminhada, e
 * aí a frase de auditoria NÃO pode aparecer, porque troca nenhuma aconteceu.
 * ========================================================================== */
{
  const casos: [string[], string, boolean][] = [
    [["Máquina", "Piscina"], "m-hidro", true],
    [["Máquina", "Bicicleta ergométrica"], "m-bike", true],
    [["Máquina", "Esteira"], "m-caminhada", false],
  ];
  for (const [equipamentos, esperada, comFrase] of casos) {
    const p = gerarPlano({
      objetivo: "Emagrecimento",
      nivel: "Iniciante",
      semanas: 12,
      frequencia: 3,
      grupoEspecial: "osteoartrite-joelho",
      equipamentos,
    });
    const aer = p.principal.mesociclos[0]?.microciclos[0]?.sessoes[0]?.blocos.find((b) => b.tipo === "aerobio");
    const cen = `joelho com [${equipamentos.join(", ")}]`;
    if (aer?.modalidade !== esperada)
      erro(`CARDIO SEM EQUIPAMENTO em ${cen}: saiu "${aer?.modalidade}" e o executável era "${esperada}".`);
    const temFrase = /Sobre o cardio/.test(p.raciocinio);
    if (temFrase !== comFrase)
      erro(
        `AUDITORIA DO CARDIO ERRADA em ${cen}: a frase "Sobre o cardio" ${temFrase ? "aparece sem troca" : "sumiu com troca"}.`,
      );
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
  `[check:core] ok: linear sai linear, o cardio varia, as condições chegam ao plano e a mais conservadora manda, ${HORIZONTES_PLANO.length} horizontes geram a duração pedida, o par de objetivos é único no sistema, nenhuma regra clínica é letra morta, o iniciante nunca recebe repetição abaixo da faixa dele, nenhuma estimativa devolve VO₂ impossível, nenhum aparelho de cardio entra em bloco de força, fundir condições nunca perde limitação, a posição que a condição evita não vai ao plano e a fase de entrada é a mais leve, com o passo do perfil clínico chegando ao alvo, o alvo da semana sobrevive ao "Aplicar no treino" a troca de exercicio segue as mesmas regras do gerador travar variavel congela so aquela variavel, o grafico nao contraria a dose, o classificador acerta os cortes o aluno ve o alvo da semana e restricao informativa nao reordena o catalogo.`,
);
