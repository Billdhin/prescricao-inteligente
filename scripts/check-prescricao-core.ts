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
import { alvoSemana } from "../src/lib/gps/alvo";
import { aplicarPrescricaoNoPlano, sessoesDaSemana } from "../src/lib/gps/semear";
import { sugerirTroca } from "../src/lib/gps/sugerirTroca";
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

/* --------------------------------- veredito --------------------------------- */

if (problemas.length) {
  console.error(`\n[check:core] REPROVOU (${problemas.length}):`);
  for (const p of problemas) console.error("  - " + p);
  console.error("");
  process.exit(1);
}
console.log(
  `[check:core] ok: linear sai linear, o cardio varia, as condições chegam ao plano e a mais conservadora manda, ${HORIZONTES_PLANO.length} horizontes geram a duração pedida, o par de objetivos é único no sistema, nenhuma regra clínica é letra morta, o iniciante nunca recebe repetição abaixo da faixa dele, nenhuma estimativa devolve VO₂ impossível, nenhum aparelho de cardio entra em bloco de força, fundir condições nunca perde limitação, a posição que a condição evita não vai ao plano e a fase de entrada é a mais leve, com o passo do perfil clínico chegando ao alvo, o alvo da semana sobrevive ao "Aplicar no treino" e a troca de exercicio segue as mesmas regras do gerador.`,
);
