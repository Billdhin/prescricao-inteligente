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
import { gerarPlano, slugsClinicosDoPlano, metricaDoExercicio, consequenciasDoPlano } from "../src/lib/gps/periodizacao";
import { agregadoSemana, serieSemanal } from "../src/lib/gps/progressao";
import { classificarGrupos } from "../src/lib/gps/classificador";
import { alvoSemana } from "../src/lib/gps/alvo";
import { aplicarPrescricaoNoPlano, sessoesDaSemana } from "../src/lib/gps/semear";
import { doseCurta, tokensDoBloco } from "../src/components/student/blocoRegistro";
import { RIR_MINIMO_IDADE } from "../src/lib/gps/esforco";
import { rotuloFrequencia } from "../src/data/periodizacao";
import { sugerirTroca } from "../src/lib/gps/sugerirTroca";
import { recalcularAlvosDoMeso } from "../src/lib/gps/travas";
import { EFEITO_POR_TAG, criarRestricao, rotuloRestricao } from "../src/lib/gps/restricoes";
import { combineRules, groupGpsRules } from "../src/lib/gps/groupRules";
import { rotuloObjetivoPar, parAtende } from "../src/lib/gps/objetivos";
import { OBJETIVOS } from "../src/lib/gps/engine";
import { BANDAS_AEROBIAS } from "../src/data/periodizacao";
import { FORMATOS_AEROBIOS, FORMATOS_AEROBIOS_LISTA, aplicarFormatoAerobio } from "../src/lib/gps/formatoAerobio";
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
/*
 * O ISOMÉTRICO ENTROU NA MESMA ASSERÇÃO, e não numa asserção nova, porque o defeito é o
 * mesmo: exercício cuja dose é TEMPO recebendo série e repetição. O agachamento isométrico
 * na parede é peso corporal e tem métricas de segurança boas, ou seja, é exatamente o
 * perfil que sobe na fila do seletor de força quando a regra clínica aperta, que foi como a
 * bicicleta chegou lá.
 *
 * A partir da integração ao motor, o isométrico É prescrito de propósito, no bloco próprio
 * (`tipo: "isometrico"`), e por isso a asserção passou a olhar só o bloco de FORÇA: o que
 * ela proíbe é o exercício de dose por tempo aparecer onde se conta série e repetição.
 */
const DOSE_POR_TEMPO = new Set(exercises.filter((e) => e.doseAerobia || e.doseIsometrica).map((e) => e.slug));
const ISOMETRICOS = exercises.filter((e) => e.doseIsometrica);
if (!exercises.some((e) => e.doseAerobia)) erro("Nenhum exercício marcado com doseAerobia: esta verificação passaria por vazio.");
if (ISOMETRICOS.length === 0) erro("Nenhum exercício marcado com doseIsometrica: a metade isométrica desta verificação passaria por vazio.");
for (const objetivo of OBJETIVOS) {
  for (const grupo of [undefined, "hipertensao-estagio-2", "obesidade-grau-3", "dor-lombar-inespecifica"]) {
    const p = gerarPlano({ objetivo, nivel: "Iniciante", semanas: 12, frequencia: 3, grupoEspecial: grupo });
    for (const macro of [p.principal, p.alternativa]) {
      for (const m of macro?.mesociclos ?? [])
        for (const w of m.microciclos)
          for (const s of w.sessoes)
            for (const b of s.blocos) {
              if (b.tipo === "aerobio" || b.tipo === "isometrico" || !b.exercicioSlug) continue;
              if (DOSE_POR_TEMPO.has(b.exercicioSlug)) {
                erro(
                  `DOSE DE TEMPO COMO FORÇA: ${objetivo}/${grupo ?? "sem grupo"} prescreveu "${b.nome}" em bloco de força, com ${b.series} séries de ${b.reps}. A dose desse exercício é tempo.`,
                );
              }
            }
    }
  }
}

/*
 * A CAUTELA DO ISOMÉTRICO VEM ESCRITA, e antes do benefício.
 *
 * Decisão do Filipe: "treinos isométricos são os que mais elevam a pressão arterial também
 * [...] a cautela tem que vir antes do foco apenas no que gera mais adaptações". A elevação
 * aguda é medida, não folclore, então todo isométrico do catálogo precisa dizer isso onde o
 * profissional lê antes de prescrever, e precisa citar de onde vem.
 */
/*
 * A INTEGRAÇÃO AO MOTOR: quem declara indicação recebe, quem não declara não recebe, e o
 * bloco nunca vira série e repetição.
 *
 * Três coisas de uma vez, porque as três falham por caminhos diferentes: a regra pode não
 * chegar ao plano (era a lacuna de sempre neste motor), pode chegar em quem não pediu (que
 * seria prescrever contração sustentada para quem não tem indicação nenhuma), e o bloco
 * pode nascer com repetição (que é a marca de dose que este arquivo já protege).
 */
{
  const comIndicacao = specialGroups.filter((g) => combineRules([g.slug])?.isometrico?.indicado === true).map((g) => g.slug);
  if (!comIndicacao.length) erro("AUTOVERIFICAÇÃO (isométrico): nenhuma condição declara isometrico.indicado; a integração não teria como ser conferida.");
  const blocosIso = (grupo?: string) => {
    const p = gerarPlano({ objetivo: "Resistência muscular", nivel: "Iniciante", semanas: 12, frequencia: 3, grupoEspecial: grupo });
    return p.principal.mesociclos.flatMap((m) => m.microciclos).flatMap((w) => w.sessoes.flatMap((s) => s.blocos)).filter((b) => b.tipo === "isometrico");
  };
  for (const slug of comIndicacao) {
    const bs = blocosIso(slug);
    if (!bs.length) {
      erro(`ISOMÉTRICO NÃO CHEGOU AO PLANO (${slug}): a condição declara indicação e nenhum bloco isométrico foi prescrito. Regra que não alcança o plano é letra morta.`);
      continue;
    }
    /*
     * SESSÃO PRÓPRIA, e não um bloco no fim do treino. Decisão do Filipe depois que a
     * varredura mediu a conta escondida: o protocolo soma 14 minutos (4 contrações de 2 min
     * mais 3 descansos de 2 min) e eles vinham empilhados sobre o aeróbio e a musculação,
     * sem aparecer em lugar nenhum. Além disso é assim que ele foi testado, como sessão
     * isolada. A asserção é simples e dura: sessão que tem isométrico não tem mais nada.
     */
    const p = gerarPlano({ objetivo: "Resistência muscular", nivel: "Iniciante", semanas: 12, frequencia: 3, grupoEspecial: slug });
    for (const w of p.principal.mesociclos.flatMap((m) => m.microciclos))
      for (const s of w.sessoes) {
        const temIso = s.blocos.some((b) => b.tipo === "isometrico");
        const temOutro = s.blocos.some((b) => b.tipo !== "isometrico");
        if (temIso && temOutro)
          erro(
            `ISOMÉTRICO MISTURADO NA SESSÃO DE TREINO (${slug}, "${s.nome}"): a sessão tem bloco isométrico e ${s.blocos.filter((b) => b.tipo !== "isometrico").length} bloco(s) de outro tipo. O protocolo é sessão separada.`,
          );
      }

    for (const b of bs) {
      if (b.reps != null || (b as { repsAlvo?: number }).repsAlvo != null)
        erro(`ISOMÉTRICO COM REPETIÇÃO (${slug}): o bloco "${b.nome}" saiu com reps="${b.reps}". A dose dele é tempo de contração.`);
      if (!b.duracao) erro(`ISOMÉTRICO SEM TEMPO (${slug}): o bloco "${b.nome}" não declara duração da contração.`);
      if (!/press[ãa]o/i.test(b.observacao ?? ""))
        erro(`ISOMÉTRICO SEM A CAUTELA NO BLOCO (${slug}): a observação não fala da pressão arterial, e ela precisa vir antes do benefício.`);
    }
  }
  /*
   * A REGRA MUDOU EM 19/08/2026, E A ASSERÇÃO MUDA COM ELA.
   *
   * Antes: só recebia o protocolo quem tinha condição declarando indicação, o que na prática
   * era hipertensão estágio 1 e 2. O Filipe cobrou que contração sustentada não é conduta
   * exclusiva de hipertenso, e o PubMed sustenta: duas metanálises medem queda de pressão em
   * NORMOTENSOS (`loaiza-isometrico-normotensos-2020`, `carlson-isometrico-pa-2014`), com a
   * primeira concluindo por PREVENÇÃO da hipertensão.
   *
   * A asserção agora cobra as três coisas que a regra nova promete, e não a antiga:
   *   1. o VETO continua vencendo tudo (gestante não recebe, com ou sem outra condição);
   *   2. quem não tem veto RECEBE, na dose de prevenção;
   *   3. a dose de tratamento é MAIOR que a de prevenção, porque a evidência é mais forte.
   *
   * A porta 1 é a que protege; sem ela, abrir a indicação viraria abrir a exceção junto.
   */
  const sessoesIso = (grupo?: string, objetivo: GpsObjetivo = "Resistência muscular") =>
    gerarPlano({ objetivo, nivel: "Iniciante", semanas: 12, frequencia: 3, grupoEspecial: grupo } as never)
      .principal.mesociclos[0].microciclos[0].sessoes.filter((se) => se.blocos.some((b) => b.tipo === "isometrico")).length;

  for (const grupo of ["gestante"]) {
    if (sessoesIso(grupo)) erro(`VETO DO ISOMÉTRICO IGNORADO (${grupo}): a condição declara evitar e o plano prescreveu o protocolo mesmo assim.`);
  }
  for (const grupo of [undefined, "osteoporose", "diabetes-tipo-2"]) {
    if (!sessoesIso(grupo))
      erro(
        `ISOMÉTRICO NEGADO A QUEM PODE RECEBER (${grupo ?? "sem condição"}): nenhuma sessão isométrica no plano, e a indicação de prevenção não tem veto neste perfil.`,
      );
  }
  // O objetivo que está fora da lista continua fora, com ou sem a abertura da indicação.
  if (sessoesIso(undefined, "Aprendizado técnico"))
    erro("ISOMÉTRICO EM OBJETIVO FORA DA LISTA: Aprendizado técnico recebeu o protocolo.");
  // Tratamento pesa mais que prevenção, e isso tem que aparecer na dose.
  if (sessoesIso("hipertensao-estagio-2") <= sessoesIso(undefined))
    erro(
      `DOSE DE TRATAMENTO NÃO SUPERA A DE PREVENÇÃO: hipertensão estágio 2 recebeu ${sessoesIso("hipertensao-estagio-2")} sessões e o perfil sem condição recebeu ${sessoesIso(undefined)}.`,
    );
  {
  }

  /*
   * O OBJETIVO TAMBÉM É PORTA, e esta faltava.
   *
   * A indicação vem da CONDIÇÃO, então sem esta porta o protocolo entrava em qualquer plano
   * daquele aluno, inclusive no de Aprendizado técnico, cujo propósito declarado é o oposto:
   * ali a dose serve à execução ("a técnica manda, não a carga"), e contração sustentada sem
   * movimento não ensina padrão motor nenhum. Decisão do Filipe, por coerência do plano.
   *
   * A asserção é dos dois lados: o objetivo excluído não recebe, e os outros continuam
   * recebendo, senão bastaria excluir todo mundo para o teste ficar verde.
   */
  {
    const FORA = ["Aprendizado técnico"];
    for (const objetivo of OBJETIVOS) {
      const p = gerarPlano({ objetivo, nivel: "Iniciante", semanas: 12, frequencia: 3, grupoEspecial: comIndicacao[0] });
      const tem = p.principal.mesociclos
        .flatMap((m) => m.microciclos)
        .flatMap((w) => w.sessoes.flatMap((s) => s.blocos))
        .some((b) => b.tipo === "isometrico");
      if (FORA.includes(objetivo) && tem)
        erro(`ISOMÉTRICO EM OBJETIVO QUE NÃO O COMPORTA (${objetivo}): o protocolo entrou num plano cujo propósito é a execução, não a carga.`);
      if (!FORA.includes(objetivo) && !tem)
        erro(`ISOMÉTRICO SUMIU DE ${objetivo}: a condição indica e o objetivo não está na lista de exclusão, mas nenhum bloco foi prescrito.`);
    }
  }

  /*
   * O VETO VENCE A INDICAÇÃO NA FUSÃO, e este é o teste que faltava.
   *
   * A varredura mostrou que uma GESTANTE com hipertensão recebia o protocolo isométrico:
   * a indicação vinha da hipertensão e nada a barrava. A porta de veto existia desde o
   * começo, copiada do intervalado, mas nenhuma condição a usava, então ela nunca tinha sido
   * exercitada. Agora a gestante declara `evitar` por escopo de evidência, e este teste
   * garante que a fusão respeita isso mesmo quando a outra condição pede o contrário.
   */
  /*
   * A FRASE DA TELA PRECISA CONTAR AS SESSÕES QUE EXISTEM.
   *
   * Ao virar sessão própria, uma semana de plano 3x passou a ter SEIS sessões, e três telas
   * (portal do aluno, PDF e ficha) imprimiam "3x por semana" a partir de
   * `frequenciaSemanal`. Passariam a mentir juntas. `rotuloFrequencia` é a fonte única
   * dessa frase, e aqui se garante que ela conta a parte que estava escondida.
   */
  {
    const comIso = gerarPlano({ objetivo: "Emagrecimento", nivel: "Iniciante", semanas: 12, frequencia: 3, grupoEspecial: "hipertensao-estagio-2" });
    // O plano SEM isométrico agora é o de Aprendizado técnico, que é o objetivo fora da lista.
    // Antes bastava não declarar condição; desde a abertura da indicação para prevenção
    // (19/08/2026), perfil sem condição RECEBE o protocolo, e o fixture antigo virou um plano
    // com isométrico testando a ausência dele.
    const semIso = gerarPlano({ objetivo: "Aprendizado técnico", nivel: "Iniciante", semanas: 12, frequencia: 3 });
    const plano = (g: typeof comIso) => ({ semanas: 12, frequenciaSemanal: 3, macrociclo: g.principal }) as never;
    const rotComIso = rotuloFrequencia(plano(comIso));
    const rotSemIso = rotuloFrequencia(plano(semIso));
    if (!/isom[ée]tric/i.test(rotComIso))
      erro(`RÓTULO DE FREQUÊNCIA ESCONDE AS SESSÕES ISOMÉTRICAS: com o protocolo no plano a frase é "${rotComIso}", e a semana tem sessões isométricas que ela não conta.`);
    if (/isom[ée]tric/i.test(rotSemIso))
      erro(`RÓTULO DE FREQUÊNCIA INVENTA SESSÃO: sem o protocolo no plano a frase é "${rotSemIso}".`);
  }

  /*
   * O RACIOCÍNIO PRECISA CONTAR O QUE O PLANO FAZ.
   *
   * Achado na segunda varredura: o protocolo entrava com três sessões por semana, dose
   * fechada e cautela de pressão, e o raciocínio (que é o que o profissional lê para
   * assinar, e que também vai impresso ao aluno) não dizia uma palavra. A maior mudança
   * estrutural do plano era a única que o texto não explicava.
   *
   * Nos dois sentidos: quem tem o protocolo precisa ver a frase, e quem NÃO tem não pode
   * receber um texto falando de sessão que não existe.
   */
  for (const grupo of [...comIndicacao, undefined]) {
    const p = gerarPlano({ objetivo: "Emagrecimento", nivel: "Iniciante", semanas: 12, frequencia: 3, grupoEspecial: grupo });
    const tem = p.principal.mesociclos
      .flatMap((m) => m.microciclos)
      .flatMap((w) => w.sessoes.flatMap((s) => s.blocos))
      .some((b) => b.tipo === "isometrico");
    const cita = /isom[ée]tric/i.test(p.raciocinio);
    if (tem && !cita)
      erro(`RACIOCÍNIO OMITE O PROTOCOLO ISOMÉTRICO (${grupo ?? "sem condição"}): o plano tem sessões isométricas e o texto que o profissional assina não as menciona.`);
    if (!tem && cita)
      erro(`RACIOCÍNIO INVENTA O PROTOCOLO ISOMÉTRICO (${grupo ?? "sem condição"}): o texto fala de isométrico num plano que não tem nenhum.`);
    /*
     * A janela é a FRASE do protocolo, e não o raciocínio inteiro.
     *
     * A primeira versão testava "pressão" no texto todo e passava lisa com a cautela
     * removida, porque a palavra aparece adiante por outros motivos (o nome do programa do
     * aluno, por exemplo, é "Condicionamento com monitoramento da pressão"). É o mesmo erro
     * de janela que já tinha custado uma asserção decorativa no PDF.
     */
    if (tem) {
      const i = p.raciocinio.indexOf("Sobre o protocolo isométrico");
      const frase = i >= 0 ? p.raciocinio.slice(i, p.raciocinio.indexOf(".", p.raciocinio.indexOf("liberação do dia", i)) + 1) : "";
      if (!frase) erro(`RACIOCÍNIO SEM A FRASE DO PROTOCOLO (${grupo ?? "sem condição"}): o plano tem sessões isométricas e o parágrafo próprio não foi encontrado.`);
      else if (!/ELEVA a press[ãa]o/i.test(frase))
        erro(`RACIOCÍNIO CITA O PROTOCOLO SEM A CAUTELA (${grupo ?? "sem condição"}): a frase do isométrico não diz que a contração ELEVA a pressão durante o esforço.`);
    }
  }

  /*
   * E O TEXTO DA IDADE NÃO PODE PEDIR O QUE O MOTOR JÁ FEZ.
   *
   * A frase nasceu como AVISO, quando a idade não tocava a dose ("use essa referência ao
   * calibrar as cargas; a decisão segue sendo sua"). Depois da camada de dose por idade o
   * plano já aperta sozinho, e manter o aviso antigo pedia ao profissional uma redução que
   * ele poderia aplicar DUAS vezes.
   */
  {
    const p = gerarPlano({ objetivo: "Força", nivel: "Intermediário", semanas: 12, frequencia: 3, idade: 70 });
    if (!/j[áa] entra mais conservador|j[áa] vem ajustada/i.test(p.raciocinio))
      erro("RACIOCÍNIO DA IDADE NÃO DIZ QUE A DOSE JÁ FOI AJUSTADA: o motor aperta a reserva sozinho aos 65+, e o texto precisa relatar isso antes de falar do que o profissional decide.");
    const semIdade = gerarPlano({ objetivo: "Força", nivel: "Intermediário", semanas: 12, frequencia: 3, idade: 40 });
    if (/faixa et[áa]ria/i.test(semIdade.raciocinio))
      erro("RACIOCÍNIO DA IDADE APARECE EM QUEM NÃO TEM A IDADE: o parágrafo saiu num plano de 40 anos.");
  }

  /*
   * QUANDO O PLANO SAI DO OBJETIVO, ELE PRECISA DIZER.
   *
   * Achado na terceira varredura: quando o pool específico do objetivo não alcança a
   * frequência pedida, a seleção cai para o catálogo do nível. A queda é certa (melhor um
   * exercício seguro fora do objetivo que sessão vazia), mas era SILENCIOSA: `faltouCatalogo`
   * só olha o pool FINAL, que o próprio fallback infla, então ficava `false` exatamente
   * quando a troca acontecia. Medido: 6 de 18 combinações de objetivo e equipamento, e no
   * pior caso quatro dos cinco exercícios de um plano de Força não eram de força.
   */
  {
    /*
     * A frequência 5 entra na matriz porque o catálogo melhorou: na frequência 3 o motor
     * pede 5 exercícios e nenhuma combinação fica abaixo disso, então a troca de objetivo
     * deixou de acontecer e a asserção passaria por vazio. Com 7 pedidos ela volta a
     * acontecer, e o aviso continua sob teste.
     */
    const casos: { objetivo: (typeof OBJETIVOS)[number]; equipamentos?: string[]; frequencia: number }[] = [];
    for (const objetivo of OBJETIVOS)
      for (const equipamentos of [undefined, ["Elástico"], ["Piscina"], ["Peso corporal"]])
        for (const frequencia of [3, 5]) casos.push({ objetivo, equipamentos, frequencia });

    let comTroca = 0;
    for (const caso of casos) {
      const input = { ...caso, nivel: "Iniciante" as Nivel, semanas: 12 };
      const fora = consequenciasDoPlano(input).foraDoObjetivo;
      const cita = /Sobre a seleção/.test(gerarPlano(input).raciocinio);
      if (fora.length) comTroca++;
      if (fora.length && !cita)
        erro(
          `PLANO SAIU DO OBJETIVO EM SILÊNCIO (${caso.objetivo}, ${caso.equipamentos?.join("+") ?? "sem restrição"}, freq ${caso.frequencia}): ${fora.length} exercício(s) fora do objetivo e o raciocínio não avisa.`,
        );
      if (!fora.length && cita)
        erro(`RACIOCÍNIO INVENTA TROCA DE OBJETIVO (${caso.objetivo}, ${caso.equipamentos?.join("+") ?? "sem restrição"}): avisa sobre seleção sem nenhum exercício fora do objetivo.`);
    }
    if (!comTroca)
      erro("AUTOVERIFICAÇÃO (fora do objetivo): nenhuma combinação produziu troca de objetivo; a asserção acima passaria por vazio.");
  }

  /*
   * A RESTRIÇÃO DO ALUNO PRECISA APARECER NO PAINEL DE CONSEQUÊNCIAS.
   *
   * Achado na quarta varredura: `rebaixados` só coletava quem a CONDIÇÃO penalizou, e a
   * restrição física da etapa 4 age por outro caminho. Medido: declarar "dor de joelho" num
   * plano de Hipertrofia tirava Leg press, Cadeira extensora, Mesa flexora e Hip thrust, e o
   * painel dizia "nenhum exercício evitado". Esse painel nasceu de um pedido do Filipe para
   * mostrar "quais exercícios evitados pelo motivo da condição dele", e respondia metade.
   *
   * Nos dois sentidos: quem declara restrição vê o motivo, e quem não declara nada não
   * recebe lista inventada.
   */
  {
    const base = { objetivo: "Hipertrofia" as const, nivel: "Intermediário" as Nivel, semanas: 12, frequencia: 3 };
    const semRestricao = consequenciasDoPlano(base);
    if (semRestricao.evitados.length)
      erro(`PAINEL INVENTA EVITADOS: sem condição e sem restrição declarada, o painel listou ${semRestricao.evitados.length} exercício(s) evitado(s).`);

    for (const tag of ["joelho_dor", "lombar_sensivel", "ombro_sensivel"] as const) {
      const input = { ...base, restricoes: [{ tag, gravidade: "moderada" as const }] };
      const usados = new Set(
        gerarPlano(input)
          .principal.mesociclos[0].microciclos[0].sessoes.flatMap((s) => s.blocos)
          .filter((b) => b.tipo === "forca")
          .map((b) => b.nome),
      );
      const semUso = new Set(
        gerarPlano(base)
          .principal.mesociclos[0].microciclos[0].sessoes.flatMap((s) => s.blocos)
          .filter((b) => b.tipo === "forca")
          .map((b) => b.nome),
      );
      const mudou = [...semUso].some((n) => !usados.has(n));
      const c = consequenciasDoPlano(input);
      if (mudou && !c.evitados.length)
        erro(`RESTRIÇÃO REBAIXA EM SILÊNCIO (${tag}): a restrição mudou os exercícios do plano e o painel não lista nenhum evitado.`);
      const semMotivo = c.evitados.filter((e) => !e.motivo?.trim());
      if (semMotivo.length) erro(`EVITADO SEM MOTIVO (${tag}): ${semMotivo.length} exercício(s) na lista de evitados sem o porquê escrito.`);
    }
  }

  const comVeto = specialGroups.filter((g) => combineRules([g.slug])?.isometrico?.evitar === true).map((g) => g.slug);
  if (!comVeto.length) {
    erro("AUTOVERIFICAÇÃO (veto do isométrico): nenhuma condição declara isometrico.evitar; a porta de veto nunca é exercitada e a fusão não está sendo testada.");
  } else {
    for (const veto of comVeto) {
      for (const indicada of comIndicacao) {
        const p = gerarPlano({ objetivo: "Emagrecimento", nivel: "Iniciante", semanas: 12, frequencia: 3, grupoEspecial: indicada, condicoesAtencao: [veto] });
        const tem = p.principal.mesociclos
          .flatMap((m) => m.microciclos)
          .flatMap((w) => w.sessoes.flatMap((s) => s.blocos))
          .some((b) => b.tipo === "isometrico");
        if (tem)
          erro(
            `VETO DO ISOMÉTRICO PERDEU DA INDICAÇÃO (${indicada} + ${veto}): a condição que veta foi fundida e o bloco isométrico foi prescrito assim mesmo.`,
          );
      }
    }
  }
}

/*
 * A LINHA QUE O ALUNO LÊ PRECISA TER O TEMPO DE SEGURAR.
 *
 * Medido no dia da integração, antes de existir esta asserção: `doseCurta` caía no ramo da
 * força e devolvia **"4 · 2 min"** para o agachamento na parede, em que "2 min" é o
 * DESCANSO. O tempo de contração, que é o exercício inteiro, não aparecia em lugar nenhum
 * da tela. Quem executa lia um "4" sem unidade e um tempo que não era o de segurar.
 *
 * A asserção olha a saída da função de exibição, e não o bloco: o defeito vivia inteiramente
 * na camada de apresentação, e um teste sobre o bloco teria passado verde.
 */
{
  const p = gerarPlano({ objetivo: "Resistência muscular", nivel: "Iniciante", semanas: 12, frequencia: 3, grupoEspecial: "hipertensao-estagio-2" });
  const bloco = p.principal.mesociclos
    .flatMap((m) => m.microciclos)
    .flatMap((w) => w.sessoes.flatMap((s) => s.blocos))
    .find((b) => b.tipo === "isometrico");
  if (!bloco) {
    erro("AUTOVERIFICAÇÃO (linha do isométrico): nenhum bloco isométrico no plano de hipertensão; a asserção passaria por vazio.");
  } else {
    const linha = doseCurta(bloco);
    const rotulos = tokensDoBloco(bloco).map((t) => t.label);
    if (bloco.duracao && !linha.includes(bloco.duracao))
      erro(`LINHA DO ISOMÉTRICO SEM O TEMPO DE CONTRAÇÃO: doseCurta devolveu "${linha}", e o tempo de contração é "${bloco.duracao}".`);
    if (!/descanso/i.test(linha))
      erro(`LINHA DO ISOMÉTRICO SEM ROTULAR O DESCANSO: doseCurta devolveu "${linha}". Sem o rótulo, os dois tempos ficam lado a lado e o aluno não sabe qual é o de segurar.`);
    if (!rotulos.includes("Contração"))
      erro(`TOKENS DO ISOMÉTRICO SEM "Contração": vieram [${rotulos.join(", ")}]. A dose isométrica tem três números e os três precisam de rótulo.`);
  }
}

for (const e of ISOMETRICOS) {
  const evitar = e.blocos.quandoEvitar ?? [];
  if (!evitar.length) {
    erro(`ISOMÉTRICO SEM CAUTELA (${e.slug}): nenhum item em quandoEvitar.`);
    continue;
  }
  if (!/press[ãa]o/i.test(evitar[0]))
    erro(
      `CAUTELA DO ISOMÉTRICO FORA DE ORDEM (${e.slug}): o primeiro "quando evitar" é "${evitar[0].slice(0, 60)}", e a pressão arterial é a razão que precisa vir primeiro.`,
    );
  if (!/ELEVA|sobe/i.test(evitar.join(" ")))
    erro(`ISOMÉTRICO SEM O FATO AGUDO (${e.slug}): não diz em lugar nenhum que a contração sustentada ELEVA a pressão durante o esforço.`);
  if (!/valsalva|respira/i.test(evitar.join(" ") + e.blocos.errosComuns.join(" ")))
    erro(`ISOMÉTRICO SEM A REGRA DA RESPIRAÇÃO (${e.slug}): prender a respiração soma a Valsalva à elevação que o exercício já causa.`);
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

/* ============================================================================
 * A FORÇA DO PLANO SÓ PRESCREVE O QUE O ALUNO TEM COMO EXECUTAR.
 *
 * A seleção do plano nunca tinha olhado equipamentos (o Treino do dia sim): medido, um
 * plano prescrevia Máquina, Polia e Halter sem saber o que o aluno declarou. A regra agora
 * é a mesma do engine: peso corporal sempre disponível, o resto precisa estar declarado.
 * Sem lista, sem filtro, para o uso avulso seguir byte-idêntico.
 * ========================================================================== */
{
  const equipamentos = ["Halter", "Peso corporal"];
  for (const objetivo of ["Hipertrofia", "Emagrecimento"] as const) {
    const p = gerarPlano({ objetivo, nivel: "Iniciante", semanas: 8, frequencia: 3, equipamentos });
    const blocos = p.principal.mesociclos
      .flatMap((m) => m.microciclos.flatMap((w) => w.sessoes.flatMap((s) => s.blocos)))
      .filter((b) => b.tipo === "forca");
    if (!blocos.length) erro(`FORÇA SUMIU com equipamentos parciais em ${objetivo}: nenhum bloco gerado.`);
    for (const b of blocos) {
      const eq = exercises.find((e) => e.slug === b.exercicioSlug)?.equipamento;
      if (eq && eq !== "Peso corporal" && !equipamentos.includes(eq)) {
        erro(
          `PLANO PRESCREVE EQUIPAMENTO AUSENTE em ${objetivo}: "${b.nome}" exige ${eq} e o aluno declarou só [${equipamentos.join(", ")}].`,
        );
        break;
      }
    }
  }
}

/* ============================================================================
 * NO FALLBACK, O OBJETIVO DO ALUNO AINDA MANDA.
 *
 * Quando restam poucos exercícios do objetivo com o que o aluno tem, o pool cai para o
 * catálogo inteiro no nível, e ali a ordem do catálogo decidia sozinha: medido, aluno só com
 * Elástico e objetivo Força tinha 3 exercícios de Força executáveis no nível e o plano usava
 * 1, preterindo os outros 2 por exercícios de outros objetivos. A trava exige que TODO
 * exercício do objetivo, executável e no nível, entre no plano antes de qualquer um de fora
 * do objetivo (respeitada a segurança, que continua na frente).
 * ========================================================================== */
{
  /*
   * O CENÁRIO MUDOU DE OBJETIVO PORQUE O CATÁLOGO MELHOROU, e a autoverificação avisou.
   *
   * O caso original era Elástico + Força, que tinha 3 exercícios do objetivo no nível. Ao
   * revisar a marcação dos exercícios de peso corporal e elástico, o pool de Força subiu
   * para 13 e o cenário deixou de forçar o fallback: a asserção continuaria verde sem
   * testar nada. A própria autoverificação apontou isso e mandou trocar de equipamento.
   *
   * Emagrecimento + Elástico é o substituto, com pool 4, e a regra testada é a mesma: todo
   * exercício do objetivo, executável e no nível, entra antes de qualquer um de fora.
   */
  // Emagrecimento + Peso corporal: pool 6 contra pedido 7, o que ainda força o fallback
  // depois de o catálogo ter fechado os buracos da frequência 3.
  const equipamentos = ["Peso corporal"];
  const objetivo = "Emagrecimento" as const;
  const teto = { Iniciante: 0, Intermediário: 1, Avançado: 2 } as Record<string, number>;
  const doObjetivo = exercises.filter(
    (e) =>
      e.objetivo?.includes(objetivo) &&
      !e.doseAerobia &&
      (e.equipamento === "Peso corporal" || equipamentos.includes(e.equipamento ?? "")) &&
      teto[(e.nivel as string) ?? "Iniciante"] <= teto["Intermediário"],
  );
  /*
   * A FREQUÊNCIA SUBIU PARA 5 PORQUE O CATÁLOGO MELHOROU DE NOVO.
   *
   * Na frequência 3 o motor pede 5 exercícios, e depois de fechar os buracos do catálogo
   * NENHUMA combinação de objetivo e equipamento tem pool menor que isso: o fallback deixou
   * de existir naquele pedido, e a asserção ficaria verde sem testar nada. Na frequência 5 o
   * pedido sobe para 7, o fallback volta a acontecer e a regra continua sob teste.
   *
   * É a segunda vez que este cenário precisa ser refeito por melhora do catálogo, e as duas
   * vezes quem apontou foi a própria autoverificação. Ela vale mais que a asserção.
   */
  const FREQ = 5;
  const pedido = Math.max(4, FREQ + 2);
  if (doObjetivo.length < 2 || doObjetivo.length >= pedido) {
    erro(
      `AUTOVERIFICAÇÃO (fallback): o cenário precisa de um pool do objetivo menor que o pedido (${pedido}) para forçar o fallback; achou ${doObjetivo.length}. O catálogo mudou; suba a frequência ou escolha outro equipamento.`,
    );
  } else {
    const p = gerarPlano({ objetivo, nivel: "Intermediário", semanas: 8, frequencia: FREQ, equipamentos });
    const usados = new Set(
      p.principal.mesociclos
        .flatMap((m) => m.microciclos.flatMap((w) => w.sessoes.flatMap((s) => s.blocos)))
        .filter((b) => b.tipo === "forca")
        .map((b) => b.exercicioSlug),
    );
    for (const e of doObjetivo) {
      if (!usados.has(e.slug)) {
        erro(
          `FALLBACK ATROPELA O OBJETIVO: "${e.nome}" é de ${objetivo}, executável com [${equipamentos.join(", ")}], e ficou fora do plano enquanto exercícios de outros objetivos entraram.`,
        );
      }
    }
  }
}

/* ============================================================================
 * A DESCARGA REDUZ DOSE, NÃO TROCA EXERCÍCIO. E O "EVITADOS" NÃO MENTE.
 *
 * A frequência menor da semana de descarga encolhia o `n` da seleção, o pool virava de
 * "catálogo inteiro" para "só do objetivo", e a descarga saía com exercícios diferentes das
 * semanas de carga. Medido no pior sabor possível: o resumo declarava "Leg press 45° evitado
 * (membros acima do coração)" e a semana 12 o prescrevia. Aqui: a lista de exercícios de
 * força é a MESMA em toda semana do plano, e nenhum exercício da lista de evitados aparece
 * em semana nenhuma.
 * ========================================================================== */
{
  const input = {
    objetivo: "Emagrecimento",
    nivel: "Iniciante",
    semanas: 12,
    frequencia: 3,
    grupoEspecial: "hipertensao-estagio-1",
    condicoesAtencao: ["diabetes-tipo-2", "osteoartrite-joelho"],
    idade: 60,
    equipamentos: ["Máquina", "Piscina", "Peso corporal"],
  } as const;
  const p = gerarPlano({ ...input, condicoesAtencao: [...input.condicoesAtencao], equipamentos: [...input.equipamentos] });
  const porSemana = p.principal.mesociclos.flatMap((m) =>
    m.microciclos.map((w) => ({
      semana: w.semana,
      tipo: w.tipo,
      slugs: new Set(w.sessoes.flatMap((s) => s.blocos.filter((b) => b.tipo === "forca").map((b) => b.exercicioSlug))),
    })),
  );
  const base = porSemana[0];
  for (const w of porSemana) {
    for (const slug of w.slugs) {
      if (!base.slugs.has(slug)) {
        erro(
          `DESCARGA TROCOU EXERCÍCIO: a semana ${w.semana} (${w.tipo}) usa "${slug}", que não existe na semana 1. Descarga reduz dose, não muda a seleção.`,
        );
      }
    }
  }
  const cons = consequenciasDoPlano({ ...input, condicoesAtencao: [...input.condicoesAtencao], equipamentos: [...input.equipamentos] });
  const evitados = new Set(cons.evitados.map((e) => e.slug));
  for (const w of porSemana) {
    for (const slug of w.slugs) {
      if (slug && evitados.has(slug)) {
        erro(`O RESUMO MENTE: "${slug}" está na lista de evitados e a semana ${w.semana} o prescreve.`);
      }
    }
  }
  if (!evitados.size) {
    erro("AUTOVERIFICAÇÃO (descarga): o cenário deveria produzir evitados (joelho + hipertensão); a segunda asserção passaria por vazio.");
  }
}

/* ============================================================================
 * A DURAÇÃO DO CARDIO PARTE DO PISO E PROGRIDE, COMO A REGRA FITT-VP CITADA MANDA.
 *
 * A duração herdava a tendência de volume da força, e no linear ("reduz") o cardio nascia
 * no TETO da faixa e encolhia: 40 min na semana 1 de um iniciante com ansiedade/depressão,
 * caindo para 20 no fim de um plano de emagrecimento. Com partirDoPiso (hipertensão), o
 * produto (1 - t) * t fazia a corcova: 20, 25, 20. Aqui: primeira semana de carga no piso
 * citado, rampa que nunca desce entre semanas de carga, última semana de carga acima da
 * primeira, e descarga no piso.
 * ========================================================================== */
for (const grupo of ["ansiedade-depressao", "hipertensao-estagio-2"]) {
  const p = gerarPlano({ objetivo: "Emagrecimento", nivel: "Iniciante", semanas: 12, frequencia: 3, grupoEspecial: grupo });
  const cargas = p.principal.mesociclos
    .flatMap((m) => m.microciclos)
    .filter((w) => w.tipo !== "deload")
    .map((w) => ({ semana: w.semana, dur: w.sessoes[0]?.blocos.find((b) => b.tipo === "aerobio")?.duracaoAlvoMin }));
  if (cargas.some((c) => c.dur == null)) {
    erro(`AUTOVERIFICAÇÃO (cardio-rampa, ${grupo}): semana de carga sem alvo de duração; a asserção passaria por vazio.`);
    continue;
  }
  const primeira = cargas[0].dur as number;
  const ultima = cargas[cargas.length - 1].dur as number;
  if (primeira !== 20)
    erro(`CARDIO NASCE FORA DO PISO em ${grupo}: a primeira semana de carga tem ${primeira} min e a faixa citada começa em 20.`);
  if (ultima <= primeira)
    erro(`CARDIO NÃO PROGRIDE em ${grupo}: a última semana de carga (${ultima} min) não passa da primeira (${primeira} min).`);
  for (let i = 1; i < cargas.length; i++) {
    if ((cargas[i].dur as number) < (cargas[i - 1].dur as number)) {
      erro(
        `CORCOVA NO CARDIO em ${grupo}: a semana ${cargas[i].semana} (${cargas[i].dur} min) cai abaixo da semana de carga anterior (${cargas[i - 1].dur} min).`,
      );
      break;
    }
  }
}

/* ==========================================================================
 * A CAUTELA VENCE A DIREÇÃO DO MODELO (decisão do Filipe, 14/08/2026)
 *
 * "A cautela deve sempre vencer a direção, porque o foco da plataforma é
 * direcionamento seguro para condições clínicas delicadas."
 *
 * A regressão verdadeira: um perfil com cautela declarada abrindo o plano no
 * TETO das séries. Foi o que a bancada de leitura mostrou na osteoporose de 72
 * anos, iniciante: 5 séries de 12 na semana 1, numa fase chamada "Entrada ·
 * segurança · adaptação", porque nas jornadas LINEARES o partirDoPiso não agia.
 *
 * Vale para TODA condição que declara cautela, não só a osteoporose, e nos dois
 * sentidos: nunca abrir no teto, e nunca subir depois num modelo que reduz (que
 * é a corcova que a correção ingênua reintroduziria).
 * ========================================================================== */
{
  const COM_CAUTELA = specialGroups.filter((g) => combineRules([g.slug])?.modProgressao?.cautela === true);
  const tetoDaFaixa = (texto: string): number | null => {
    const ns = texto.match(/\d+/g);
    return ns?.length ? Math.max(...ns.map(Number)) : null;
  };
  let conferidos = 0;
  for (const g of COM_CAUTELA) {
    for (const objetivo of ["Força", "Hipertrofia", "Resistência muscular"] as const) {
      const p = gerarPlano({ objetivo, nivel: "Iniciante", semanas: 12, frequencia: 3, grupoEspecial: g.slug });
      const semanasCarga = p.principal.mesociclos.flatMap((m) => m.microciclos).filter((w) => w.tipo !== "deload");
      const serie = semanasCarga
        .map((w) => {
          const b = w.sessoes[0]?.blocos.find((x) => x.tipo !== "aerobio") as { series?: string; seriesAlvo?: number } | undefined;
          return b?.seriesAlvo != null && b.series ? { alvo: b.seriesAlvo, teto: tetoDaFaixa(b.series), semana: w.semana } : null;
        })
        .filter(Boolean) as { alvo: number; teto: number | null; semana: number }[];
      if (!serie.length) continue;
      const teto = serie[0].teto;
      // Faixa degenerada ("3 a 3") não tem teto de onde sair: a asserção não se aplica.
      if (teto == null || serie.every((s) => s.alvo === teto && s.teto === teto && teto === Math.min(...serie.map((x) => x.alvo)))) continue;
      conferidos++;
      if (serie[0].alvo >= teto)
        erro(
          `CAUTELA PERDEU DA DIREÇÃO (${g.slug}, ${objetivo}): a semana 1 abre em ${serie[0].alvo} séries, que é o teto da faixa citada. Perfil com cautela declarada não começa no teto.`,
        );
      for (let i = 1; i < serie.length; i++)
        if (serie[i].alvo > serie[i - 1].alvo && p.modeloId === "linear") {
          erro(
            `CORCOVA NAS SÉRIES (${g.slug}, ${objetivo}): a semana ${serie[i].semana} sobe para ${serie[i].alvo} séries depois de ${serie[i - 1].alvo}, num modelo linear que declara volume decrescente.`,
          );
          break;
        }
    }
  }
  /*
   * DESCARGA NUNCA PESA MAIS QUE A CARGA.
   *
   * Não veio de teoria: eu introduzi essa regressão nesta mesma rodada. Ao fazer a carga
   * arredondar para baixo esqueci que o ramo da descarga se ancora na carga mais leve do
   * bloco com o arredondamento ANTIGO, e a osteoporose passou a ter semanas de carga de 3
   * séries e semana de DESCARGA de 4. Achei lendo a sonda, não pelo guardrail, e é por isso
   * que a asserção passa a existir.
   */
  for (const g of COM_CAUTELA) {
    for (const objetivo of ["Força", "Hipertrofia", "Resistência muscular"] as const) {
      const p = gerarPlano({ objetivo, nivel: "Iniciante", semanas: 12, frequencia: 3, grupoEspecial: g.slug });
      for (const m of p.principal.mesociclos) {
        const series = (w: (typeof m.microciclos)[number]) =>
          (w.sessoes[0]?.blocos.find((x) => x.tipo !== "aerobio") as { seriesAlvo?: number } | undefined)?.seriesAlvo;
        const cargas = m.microciclos.filter((w) => w.tipo !== "deload").map(series).filter((s): s is number => s != null);
        const descargas = m.microciclos.filter((w) => w.tipo === "deload").map(series).filter((s): s is number => s != null);
        if (!cargas.length || !descargas.length) continue;
        const maisLeveDaCarga = Math.min(...cargas);
        const maisPesadaDaDescarga = Math.max(...descargas);
        if (maisPesadaDaDescarga > maisLeveDaCarga)
          erro(
            `DESCARGA MAIS PESADA QUE A CARGA (${g.slug}, ${objetivo}, ${m.nome.slice(0, 30)}): descarga com ${maisPesadaDaDescarga} séries contra ${maisLeveDaCarga} da semana de carga mais leve.`,
          );
      }
    }
  }

  // Controle positivo: sem condição cautelosa com faixa de séries que tenha folga, as duas
  // asserções acima não conferem nada e passariam por vazio.
  if (conferidos < 3)
    erro(`AUTOVERIFICAÇÃO (cautela vence direção): só ${conferidos} combinações tinham faixa de séries com folga; a asserção está passando por vazio.`);
}

/* ==========================================================================
 * ESCALA DE ESFORÇO UNIFICADA E DOSE POR IDADE (decisão do Filipe, 14/08/2026)
 *
 * "Você deve montar uma escala de esforço unificada para o motor poder reduzir
 * a dose sozinho por idade."
 * ========================================================================== */
{
  const OBJ_FORCA = ["Força", "Hipertrofia", "Resistência muscular"] as const;
  const blocosForca = (p: ReturnType<typeof gerarPlano>) =>
    p.principal.mesociclos.flatMap((m) => m.microciclos).flatMap((w) => w.sessoes.flatMap((s) => s.blocos)).filter((b) => b.tipo !== "aerobio");

  /*
   * 1. UNIFICADA quer dizer que NENHUM objetivo fica sem o instrumento.
   *
   * Esta é a asserção que teria pego o defeito real: a Resistência muscular controlava
   * intensidade só por %1RM, que exige 1RM testado, coisa que a gestante iniciante do
   * cenário 4 da bancada não tem. Na prática o objetivo não tinha instrumento usável em
   * campo, e nenhum teto clínico de reserva tinha onde morder nele.
   */
  /*
   * TODOS os objetivos, e não só os três de musculação clássica.
   *
   * A primeira versão desta asserção olhava só Força, Hipertrofia e Resistência muscular, e
   * foi por isso que o buraco sobreviveu: Emagrecimento, Retorno ao treino e Aprendizado
   * técnico não tinham reserva nenhuma, e neles o piso da condição e o da idade ficavam
   * inertes. Emagrecimento é o objetivo mais prescrito para o público clínico do produto,
   * ou seja, a lacuna estava exatamente onde mais importa. Guardrail que escolhe a dedo
   * quem conferir só protege quem foi escolhido.
   */
  for (const objetivo of OBJETIVOS) {
    for (const nivel of NIVEIS) {
      const p = gerarPlano({ objetivo, nivel, semanas: 12, frequencia: 3 });
      const bs = blocosForca(p).filter((b) => b.tipo === "forca");
      if (!bs.length) {
        erro(`AUTOVERIFICAÇÃO (esforço unificado): ${objetivo}/${nivel} não gerou bloco de força; a asserção passaria por vazio.`);
        continue;
      }
      const semInstrumento = bs.filter((b) => (b as { rirAlvo?: number }).rirAlvo == null);
      if (semInstrumento.length)
        erro(
          `OBJETIVO SEM INSTRUMENTO DE ESFORÇO (${objetivo}, ${nivel}): ${semInstrumento.length} de ${bs.length} blocos sem RIR-alvo. A escala de esforço é unificada: quem não tem reserva não recebe teto clínico nem dose por idade.`,
        );
    }
  }

  /*
   * E O PISO PRECISA CHEGAR AO ALVO, em todo objetivo e em todo nível.
   *
   * Achado na mesma varredura: na Hipertrofia de nível intermediário e avançado a ênfase
   * "pesado" estreita a faixa para "1 a 2 de reserva", e o teto dessa faixa reduzia o piso
   * de 3 pedido pela idade para 2, em 48 blocos de um único plano. Um aluno de 70 anos
   * recebia a dose de um de 40, e nenhum guardrail via, porque cada peça isolada estava
   * certa.
   */
  for (const objetivo of OBJETIVOS) {
    for (const nivel of NIVEIS) {
      const p = gerarPlano({ objetivo, nivel, semanas: 12, frequencia: 3, idade: 70 });
      const abaixo = blocosForca(p)
        .filter((b) => b.tipo === "forca")
        .filter((b) => {
          const r = (b as { rirAlvo?: number }).rirAlvo;
          return r != null && r < RIR_MINIMO_IDADE;
        });
      if (abaixo.length)
        erro(
          `PISO DE RESERVA DA IDADE ENGOLIDO (${objetivo}, ${nivel}): ${abaixo.length} blocos com reserva abaixo de ${RIR_MINIMO_IDADE} num aluno de 70 anos. Alguma faixa mais estreita está capando o piso do perfil.`,
        );
    }
  }

  /*
   * 2. A IDADE APERTA SOZINHA, sem condição declarada.
   *
   * Era a lacuna que `groupRules.ts` registrava por escrito: "um plano para 70 anos e um
   * para 30, com a mesma condição e o mesmo objetivo, saem com a MESMA dose de força".
   */
  let apertou = 0;
  for (const objetivo of OBJ_FORCA) {
    const jovem = blocosForca(gerarPlano({ objetivo, nivel: "Intermediário", semanas: 12, frequencia: 3, idade: 40 }));
    const idoso = blocosForca(gerarPlano({ objetivo, nivel: "Intermediário", semanas: 12, frequencia: 3, idade: 70 }));
    if (jovem.length !== idoso.length) {
      erro(`AUTOVERIFICAÇÃO (dose por idade, ${objetivo}): os dois planos têm número de blocos diferente; a comparação não é par a par.`);
      continue;
    }
    for (let i = 0; i < idoso.length; i++) {
      const rIdoso = (idoso[i] as { rirAlvo?: number }).rirAlvo;
      const rJovem = (jovem[i] as { rirAlvo?: number }).rirAlvo;
      if (rIdoso == null || rJovem == null) continue;
      // Uma mão só: a idade nunca pode aproximar da falha.
      if (rIdoso < rJovem)
        erro(`IDADE DEIXOU A DOSE MAIS AGRESSIVA (${objetivo}): aos 70 anos o alvo é RIR ${rIdoso} contra ${rJovem} aos 40, no mesmo bloco.`);
      if (rIdoso > rJovem) apertou++;
    }
  }
  if (!apertou)
    erro("AUTOVERIFICAÇÃO (dose por idade): nenhum bloco ficou mais conservador aos 70 anos; a camada de idade é inerte e a asserção acima não prova nada.");

  /*
   * 3. A FUSÃO CONTINUA CONSERVADORA quando idade e condição se encontram.
   *
   * Idade não é condição, mas obedece à mesma lei: no encontro das duas, vale a mais
   * conservadora, e nunca o contrário.
   */
  for (const g of ["osteoporose", "hipertensao-estagio-2", "gestante"]) {
    for (const objetivo of OBJ_FORCA) {
      const so = blocosForca(gerarPlano({ objetivo, nivel: "Intermediário", semanas: 12, frequencia: 3, grupoEspecial: g }));
      const com = blocosForca(gerarPlano({ objetivo, nivel: "Intermediário", semanas: 12, frequencia: 3, grupoEspecial: g, idade: 70 }));
      for (let i = 0; i < Math.min(so.length, com.length); i++) {
        const a = (so[i] as { rirAlvo?: number }).rirAlvo;
        const b = (com[i] as { rirAlvo?: number }).rirAlvo;
        if (a != null && b != null && b < a)
          erro(`IDADE AFROUXOU A CONDIÇÃO (${g}, ${objetivo}): com 70 anos o alvo é RIR ${b}, mais perto da falha que os ${a} da condição sozinha.`);
      }
    }
  }
}

/* ------------- 18. A frase da faixa etária só afirma mudança quando houve mudança ------------- */
/*
 * Achado da varredura de 18/08/2026: o raciocínio impresso ao profissional E AO ALUNO dizia
 * "o plano já entra mais conservador" para todo aluno de 65 anos ou mais, e em Resistência
 * muscular, Retorno ao treino e Aprendizado técnico o plano saía IDÊNTICO ao de um aluno de
 * 40, porque a faixa citada desses objetivos já pede 3 a 5 de reserva e o piso da idade não
 * tinha o que apertar.
 *
 * O teste não confere texto contra texto: ele MEDE a dose dos dois planos e cobra que a
 * frase concorde com a medição, nos dois sentidos. Afirmar mudança que não houve é a
 * assinatura que este motor já pagou caro; deixar de afirmar a que houve faria o
 * profissional aplicar a redução duas vezes.
 */
{
  const forcaDo = (pl: ReturnType<typeof gerarPlano>) =>
    pl.principal.mesociclos
      .flatMap((m) => m.microciclos)
      .flatMap((w) => w.sessoes.flatMap((se) => se.blocos))
      .filter((bl) => bl.tipo !== "aerobio");
  const doseDoPlano = (pl: ReturnType<typeof gerarPlano>) =>
    forcaDo(pl)
      .map((b) => {
        const x = b as { seriesAlvo?: number; repsAlvo?: number; rirAlvo?: number; cargaRelativaAlvo?: number };
        return `${x.seriesAlvo}x${x.repsAlvo}r${x.rirAlvo}c${x.cargaRelativaAlvo}`;
      })
      .join("|");

  for (const objetivo of OBJETIVOS) {
    const base = { objetivo, nivel: "Intermediário" as Nivel, semanas: 12, frequencia: 3 };
    const jovem = gerarPlano({ ...base, idade: 40 });
    const idoso = gerarPlano({ ...base, idade: 70 });
    const mudou = doseDoPlano(jovem) !== doseDoPlano(idoso);
    const afirma = /entra mais conservador/.test(idoso.raciocinio);
    if (afirma && !mudou)
      erro(
        `FRASE DE IDADE AFIRMA O QUE O MOTOR NÃO FEZ (${objetivo}): o raciocínio diz "entra mais conservador" aos 70 anos e a dose de força é idêntica à de 40.`,
      );
    if (mudou && !afirma)
      erro(
        `FRASE DE IDADE CALA A MUDANÇA (${objetivo}): a dose aos 70 anos é diferente da de 40 e o raciocínio não diz que o plano já entrou mais conservador.`,
      );
  }
}

/* --------- 19. A semana de descarga nunca sai mais pesada que a carga que ela alivia --------- */
/*
 * Achado da varredura de 18/08/2026, o de maior alcance da rodada: a descarga tirava uma
 * REPETIÇÃO quando as séries já estavam no piso, e neste motor repetição é dose de
 * INTENSIDADE. Com a mesma reserva, menos repetição é MAIS carga na barra: 54.164 blocos em
 * 2.847 planos do cartesiano saíam assim, e em 2.387 planos a linha de intensidade do
 * gráfico SUBIA na semana rotulada como alívio. No modelo de blocos a descarga ainda herdava
 * a intensidade do pico do mesociclo e saía MAIS PERTO DA FALHA que a carga anterior
 * (Força: sem7 3x6 RIR 4 seguida de sem8 4x1 RIR 3).
 *
 * A asserção compara bloco a bloco, casando SESSÃO PELA ÊNFASE e bloco pelo exercício, para
 * não confundir "a semana tem menos sessões" com "a sessão ficou mais leve". Ela cobra as
 * duas direções do dano: nunca menos repetição com reserva não maior, e nunca menos reserva.
 */
{
  type BlocoAlvo = {
    tipo?: string;
    nome?: string;
    seriesAlvo?: number;
    repsAlvo?: number;
    rirAlvo?: number;
  };
  const forcaDaSessao = (se: { blocos: BlocoAlvo[] }) =>
    se.blocos.filter((b) => b.tipo !== "aerobio" && b.tipo !== "isometrico");

  let comparados = 0;
  for (const objetivo of OBJETIVOS)
    for (const nivel of ["Iniciante", "Intermediário", "Avançado"] as Nivel[])
      for (const modeloPreferido of [undefined, "linear", "ondulatoria", "blocos"] as (string | undefined)[])
        for (const grupoEspecial of [undefined, "obesidade-grau-3", "hipertensao-estagio-2", "diabetes-tipo-2"])
          // Frequência 2 entra porque é nela que a descarga do modelo de blocos herdava a
          // intensidade do pico e saía MAIS PERTO DA FALHA; com 3 sessões o caso não aparece.
          for (const frequencia of [2, 3]) {
          const caso = `${objetivo}/${nivel}/${modeloPreferido ?? "modelo do motor"}/${grupoEspecial ?? "sem condição"}/${frequencia}x`;
          const plano = gerarPlano({ objetivo, nivel, semanas: 12, frequencia, grupoEspecial, modeloPreferido } as never);
          const semanas = plano.principal.mesociclos.flatMap((m) => m.microciclos);
          for (let i = 1; i < semanas.length; i++) {
            const d = semanas[i];
            const c = semanas[i - 1];
            if (d.tipo !== "deload" || c.tipo === "deload") continue;
            for (const sd of d.sessoes) {
              const sc = c.sessoes.find((x) => x.foco === sd.foco);
              if (!sc) continue;
              for (const bd of forcaDaSessao(sd) as BlocoAlvo[]) {
                const bc = (forcaDaSessao(sc) as BlocoAlvo[]).find((x) => x.nome === bd.nome);
                if (!bc || bd.repsAlvo == null || bc.repsAlvo == null) continue;
                comparados++;
                const rd = bd.rirAlvo;
                const rc = bc.rirAlvo;
                if (bd.repsAlvo < bc.repsAlvo && !(rd != null && rc != null && rd > rc))
                  erro(
                    `DESCARGA MAIS PESADA QUE A CARGA (${caso}, semana ${d.semana}, ${bd.nome}): carga ${bc.seriesAlvo}x${bc.repsAlvo} RIR ${rc ?? "-"} e descarga ${bd.seriesAlvo}x${bd.repsAlvo} RIR ${rd ?? "-"}. Menos repetição com a mesma reserva é mais carga na barra.`,
                  );
                if (rd != null && rc != null && rd < rc)
                  erro(
                    `DESCARGA MAIS PERTO DA FALHA (${caso}, semana ${d.semana}, ${bd.nome}): a carga pedia RIR ${rc} e a descarga pede RIR ${rd}.`,
                  );
              }
            }
          }
        }
  // Controle positivo: sem pares comparados a asserção acima passa por vacuidade.
  if (comparados < 500) erro(`CONTROLE POSITIVO DA DESCARGA: só ${comparados} blocos comparados; a asserção perdeu o sentido.`);
}

/* --------- 20. A alternativa oferecida é OUTRO plano, e o formato do cardio muda a dose --------- */
/*
 * Dois achados do Filipe em 18/08/2026, na mesma tela.
 *
 * (a) Ele trocou para a alternativa, viu título, resumo e explicação mudarem, e o GRÁFICO
 *     continuar igual. O gráfico estava certo: ondulatória, flexível e autorregulada recebem
 *     as mesmas tendências e a mesma rotação de ênfase, então 138 de 540 pares de modelos
 *     saem byte-idênticos. Como "flexivel" era a alternativa padrão de quem tem condição
 *     clínica, o par que ele viu era exatamente esse.
 *
 * (b) Trocar o formato do cardio para HIIT mudava só o rótulo: seguia "15 a 25 min,
 *     moderada, recuperação -", que é a prescrição do contínuo com outro nome.
 */
{
  const assinaturaDoMacro = (m: { mesociclos: { microciclos: { semana: number; tipo: string; sessoes: { blocos: { nome?: string; seriesAlvo?: number; repsAlvo?: number; rirAlvo?: number; intervaloAlvoSeg?: number; duracaoAlvoMin?: number; rpeAlvo?: number }[] }[] }[] }[] }) =>
    m.mesociclos
      .flatMap((me) => me.microciclos)
      .map(
        (w) =>
          `${w.semana}:${w.tipo}:` +
          w.sessoes
            .map((se) => se.blocos.map((b) => `${b.nome}|${b.seriesAlvo}x${b.repsAlvo}r${b.rirAlvo}i${b.intervaloAlvoSeg}d${b.duracaoAlvoMin}p${b.rpeAlvo}`).join(","))
            .join(";"),
      )
      .join(String.fromCharCode(10));

  let comAlternativa = 0;
  for (const objetivo of OBJETIVOS)
    for (const nivel of ["Iniciante", "Intermediário", "Avançado"] as Nivel[])
      for (const grupoEspecial of [undefined, "obesidade-grau-3", "hipertensao-estagio-2", "gestante"]) {
        const plano = gerarPlano({ objetivo, nivel, semanas: 12, frequencia: 3, grupoEspecial } as never);
        if (!plano.alternativa) continue;
        comAlternativa++;
        if (assinaturaDoMacro(plano.alternativa) === assinaturaDoMacro(plano.principal))
          erro(
            `ALTERNATIVA IDÊNTICA À PRINCIPAL (${objetivo}/${nivel}/${grupoEspecial ?? "sem condição"}): o plano oferece "${plano.modeloAltId}" ao lado de "${plano.modeloId}" e os dois macrociclos são iguais semana a semana. O gráfico não muda porque o plano não muda.`,
          );
      }
  if (comAlternativa < 20) erro(`CONTROLE POSITIVO DA ALTERNATIVA: só ${comAlternativa} planos tinham alternativa; a asserção perdeu o sentido.`);

  /*
   * O formato do cardio precisa mudar a dose, e não só o rótulo. Cada formato declara a banda
   * de intensidade e a recuperação; a asserção cobra que aplicá-lo de fato reescreva o bloco.
   */
  // "15 a 25" é o caso que importa: a metade arredondada para baixo dá "5 a 10", e DOBRAR isso
  // devolveria "10 a 20". Sem ele, a asserção de ida e volta passaria com a reconstrução errada.
  for (const faixaContinua of ["20 a 40 min", "15 a 25 min"]) {
  const blocoCardio = {
    tipo: "aerobio" as const,
    id: "b",
    nome: "Caminhada",
    formato: "Contínuo",
    duracao: faixaContinua,
    intensidade: BANDAS_AEROBIAS.moderada.intensidade,
    recuperacao: "-",
    duracaoAlvoMin: 20,
    rpeAlvo: 5,
    zonaFC: "129 a 153 bpm",
  };
  for (const f of FORMATOS_AEROBIOS_LISTA) {
    const depois = aplicarFormatoAerobio(blocoCardio as never, f);
    if (depois.formato !== f.nome) erro(`FORMATO NÃO GRAVADO (${f.nome}).`);
    if (depois.intensidade !== BANDAS_AEROBIAS[f.banda].intensidade)
      erro(`FORMATO SEM BANDA (${f.nome}): a intensidade não virou a banda "${f.banda}" que o formato declara.`);
    if (depois.recuperacao !== f.recuperacao)
      erro(`FORMATO SEM RECUPERAÇÃO (${f.nome}): o campo continuou "${depois.recuperacao}".`);
    if (f.metadeDoTempo) {
      if (depois.duracao === blocoCardio.duracao)
        erro(`FORMATO SEM TEMPO PRÓPRIO (${f.nome}): o tempo total de trabalho continuou "${depois.duracao}", igual ao do contínuo.`);
      if (depois.zonaFC != null)
        erro(`ZONA DE FC DA BANDA ANTIGA (${f.nome}): a zona foi derivada da banda moderada e ficou ao lado de um texto vigoroso.`);
    }
    // Ida e volta: voltar ao contínuo devolve o tempo cheio, e não metade da metade.
    const volta = aplicarFormatoAerobio(depois, FORMATOS_AEROBIOS.continuo);
    if (volta.duracao !== blocoCardio.duracao)
      erro(`IDA E VOLTA DO FORMATO (${f.nome}, faixa "${faixaContinua}"): voltar para Contínuo devolveu "${volta.duracao}" em vez de "${blocoCardio.duracao}".`);
  }
  }
}

/* --------- 21. O modelo de ordem aberta ENTREGA ordem aberta, e não só o texto ao lado --------- */
/*
 * O Filipe trocou o plano para "Periodização flexível", leu ao lado a explicação da flexível,
 * e o treino continuou o da ondulatória: mesmas sessões numeradas, mesma semana, mesmo
 * gráfico. O modelo dizia uma coisa e o plano entregava outra.
 *
 * A curva SEMANAL não podia mudar, e isso está citado: no único ensaio que compara os dois de
 * frente (`colquhoun-flexivel-2017`, 25 homens treinados, 9 semanas) a flexível é a MESMA
 * sessão com o aluno escolhendo a ORDEM, e o estudo mede que não houve diferença de volume nem
 * de intensidade. Inventar curva diferente seria inventar um modelo.
 *
 * O que o plano passa a entregar é a ordem aberta de verdade: sessão por LETRA, porque numerar
 * afirma uma sequência que este modelo não tem, e nota da semana dizendo que a ordem é
 * escolhida no dia. A asserção cobra os dois lados, senão bastaria marcar todo mundo como
 * aberto para ficar verde.
 */
{
  const semanaDe = (modeloPreferido: string) =>
    gerarPlano({
      objetivo: "Hipertrofia" as GpsObjetivo,
      nivel: "Intermediário" as Nivel,
      semanas: 12,
      frequencia: 3,
      modeloPreferido,
    } as never).principal.mesociclos[0].microciclos[0];

  for (const modelo of ["flexivel", "autorregulada"]) {
    const w = semanaDe(modelo);
    // Só as sessões de TREINO entram na conta: a sessão isométrica é protocolo fechado à parte,
    // não participa da rotação de ênfase e segue numerada em qualquer modelo.
    const deTreino = w.sessoes.filter((se) => !se.blocos.some((b) => b.tipo === "isometrico"));
    const porLetra = deTreino.filter((se) => /^Sessão [A-G]/.test(se.nome)).length;
    if (porLetra !== deTreino.length)
      erro(
        `MODELO DE ORDEM ABERTA COM SESSÃO NUMERADA (${modelo}): ${deTreino.length - porLetra} de ${deTreino.length} sessões de treino saíram como "Sessão N". Numerar afirma uma sequência que este modelo não tem.`,
      );
    if (!/ordem aberta/i.test(w.nota ?? ""))
      erro(`MODELO DE ORDEM ABERTA SEM DIZER (${modelo}): a nota da semana é "${w.nota ?? "(vazia)"}" e não declara que a ordem é escolhida no dia.`);
  }
  for (const modelo of ["ondulatoria", "linear", "blocos"]) {
    const w = semanaDe(modelo);
    if (w.sessoes.some((se) => /^Sessão [A-G]/.test(se.nome)))
      erro(`MODELO DE ORDEM FIXA COM SESSÃO POR LETRA (${modelo}): a letra é a marca da ordem aberta e não pode aparecer aqui.`);
    if (/ordem aberta/i.test(w.nota ?? ""))
      erro(`MODELO DE ORDEM FIXA DIZENDO QUE É ABERTA (${modelo}): a nota da semana promete escolha no dia num modelo de sequência fechada.`);
  }
  /*
   * A CURVA IGUAL PRECISA VIR EXPLICADA, e esta é a asserção que o Filipe pediu.
   *
   * "Se deixa só o mesmo gráfico para o profissional é como se você não alterou nada." A
   * igualdade é deliberada e citada, mas igualdade que ninguém explica se lê como troca que
   * não aconteceu. O raciocínio vai para o PDF assinado, então é nele que a explicação tem
   * que estar, e não só na tela.
   */
  for (const modelo of ["flexivel", "autorregulada"]) {
    const r = gerarPlano({
      objetivo: "Hipertrofia" as GpsObjetivo,
      nivel: "Intermediário" as Nivel,
      semanas: 12,
      frequencia: 3,
      modeloPreferido: modelo,
    } as never).raciocinio;
    if (!/curva semanal de volume e intensidade é a MESMA/.test(r))
      erro(
        `CURVA IGUAL SEM EXPLICAÇÃO (${modelo}): o raciocínio não diz ao profissional que a curva semanal é a mesma da ondulatória de propósito, e o gráfico sozinho se lê como se nada tivesse mudado.`,
      );
    if (!/ORDEM das sessões dentro da semana/.test(r))
      erro(`CURVA IGUAL SEM DIZER ONDE ESTÁ A DIFERENÇA (${modelo}): o raciocínio não aponta a ordem das sessões como o que muda.`);
  }
  for (const modelo of ["ondulatoria", "linear"]) {
    const r = gerarPlano({
      objetivo: "Hipertrofia" as GpsObjetivo,
      nivel: "Intermediário" as Nivel,
      semanas: 12,
      frequencia: 3,
      modeloPreferido: modelo,
    } as never).raciocinio;
    if (/curva semanal de volume e intensidade é a MESMA/.test(r))
      erro(`EXPLICAÇÃO DE ORDEM ABERTA EM MODELO FIXO (${modelo}): o raciocínio explica uma igualdade de curva que não se aplica aqui.`);
  }

  // A dose semanal É equiparada entre flexível e ondulatória, e o teste registra isso em vez de
  // esconder: se um dia elas divergirem, alguém inventou um modelo e precisa justificar.
  const doseDaSemana = (modelo: string) => {
    const w = semanaDe(modelo);
    return w.sessoes
      .flatMap((se) => se.blocos.filter((b) => b.tipo !== "aerobio" && b.tipo !== "isometrico"))
      .reduce((a, b) => a + (b.seriesAlvo ?? 0) * (b.repsAlvo ?? 0), 0);
  };
  if (doseDaSemana("flexivel") !== doseDaSemana("ondulatoria"))
    erro(
      `FLEXÍVEL DEIXOU DE SER EQUIPARADA À ONDULATÓRIA: volume semanal ${doseDaSemana("flexivel")} contra ${doseDaSemana("ondulatoria")}. O ensaio que define a flexível (colquhoun-flexivel-2017) mede as duas com volume e intensidade IGUAIS; divergir aqui é inventar um modelo.`,
    );
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
