/**
 * Guardrail TEST-FIRST da progressão real (onda MP-2). NASCE VERMELHO de propósito.
 *
 * Hoje o gerador (gerarPlano) repete a MESMA dose toda semana: séries, repetições,
 * intensidade e intervalo saem de faixas estáticas indexadas só por (objetivo, nível,
 * modelo), sem termo temporal. Um mesociclo com tendência "volume sobe" não sobe volume
 * nenhum; a descarga só tira uma sessão; o aeróbio é "20 a 40 min" reconstruído igual em
 * toda sessão. Este script mede isso com PROXIES por semana e cobra os critérios de aceite
 * do fundador.
 *
 * Por isso ele SAI COM ERRO (exit 1) contra o gerador atual, e isso é o SUCESSO desta onda:
 * o vermelho é o alvo que as ondas MP-3 (dose de força progressiva) e MP-4 (aeróbio
 * progressivo + anual que evolui) vão perseguir até ficar verde. NÃO está ligado a nenhum
 * agregado de build/CI (roda isolado via `npm run check:progressao`).
 *
 * Como o check:faixas, ele se AUTOVERIFICA: monta em memória um plano PROGRESSIVO e um
 * CHAPADO e exige aprovar o primeiro e reprovar o segundo. Um verificador que aprova
 * qualquer coisa é pior que nenhum: some com a proteção inteira sem avisar.
 */

import { gerarPlano } from "../src/lib/gps/periodizacao";
import { intervaloDe } from "../src/lib/gps/faixasParse";
import { assinaturaCarga } from "../src/lib/gps/assinaturaSemana";
import { OBJETIVOS } from "../src/lib/gps/engine";
import { specialGroups } from "../src/data/specialGroups";
import type { GpsObjetivo } from "../src/lib/gps/engine";
import type { Nivel } from "../src/data/types";
import type { Macrociclo, Microciclo, BlocoSessao, Tendencia } from "../src/data/periodizacao";

const NIVEIS: Nivel[] = ["Iniciante", "Intermediário", "Avançado"];
// Inclui uma duração curta (6) que NÃO gera descarga (mesociclos de 3 semanas): nela todas
// as semanas ficam de carga, e a repetição total da dose fica visível para o critério 1 e 6.
// Inclui 48 (anual, ~12 mesociclos) para o critério do anual ver o horizonte longo.
const SEMANAS = [6, 8, 12, 24, 48];
const FREQ = 4;

/* ------------------------------------- Proxies ------------------------------------- */

/**
 * Meio da faixa de um texto ("3 a 4" -> 3.5; "6 a 12" -> 9). Heurística nas pontas abertas:
 * "acima de 15" usa o piso (15); "até 90" usa o teto (90). Sem número, devolve null.
 */
function meio(texto?: string): number | null {
  if (!texto) return null;
  const iv = intervaloDe(texto);
  if (!iv) return null;
  if (iv.max === Infinity) return iv.min; // "acima de N": progressão só teria piso
  if (iv.min === 0) return iv.max; // "até N": progressão só teria teto
  return (iv.min + iv.max) / 2;
}

const ehForca = (b: BlocoSessao) => b.tipo !== "aerobio";
const ehAerobio = (b: BlocoSessao) => b.tipo === "aerobio";
const blocos = (m: Microciclo) => m.sessoes.flatMap((s) => s.blocos);

/**
 * proxyVolumeForca = Σ (séries × reps) sobre os blocos de força da semana, LENDO O ALVO
 * quando presente (`seriesAlvo ?? meio(series)`, `repsAlvo ?? meio(reps)`). Assim a semana
 * que progrediu o alvo vira volume maior de verdade. Número absoluto não vale nada; o que
 * importa é COMPARAR semanas do mesmo plano. Sem alvo (plano antigo/sintético), cai no meio
 * da faixa como antes.
 */
function proxyVolumeForca(m: Microciclo): number {
  let total = 0;
  for (const b of blocos(m)) {
    if (!ehForca(b)) continue;
    const series = b.seriesAlvo ?? meio(b.series) ?? 0;
    const reps = b.repsAlvo ?? meio(b.reps) ?? 0;
    total += series * reps;
  }
  return total;
}

/**
 * Intensidade de UM bloco de força, lendo o ALVO quando presente. Escalas diferentes, mas o
 * critério só compara semanas do MESMO meso (mesmo objetivo, mesmo campo presente), então a
 * comparação é válida:
 * - `cargaRelativaAlvo` (%1RM): maior = mais intenso;
 * - `rirAlvo` (reps de reserva): menor = mais intenso, então entra como -rir;
 * - sem alvo numérico, cai no meio da faixa de intensidade textual (null em "moderada a alta").
 */
function intensidadeDoBloco(b: BlocoSessao): number | null {
  if (b.cargaRelativaAlvo != null) return b.cargaRelativaAlvo;
  if (b.rirAlvo != null) return -b.rirAlvo;
  return meio(b.intensidade);
}

/**
 * proxyIntensidadeForca = média da intensidade parseável dos blocos de força (via alvo ou
 * texto). Se a semana inteira tem intensidade textual sem alvo ("moderada a alta"), devolve
 * null e o critério não avalia (como antes). Com o alvo de %1RM/RIR, passa a avaliar de fato.
 */
function proxyIntensidadeForca(m: Microciclo): number | null {
  const vals: number[] = [];
  for (const b of blocos(m)) {
    if (!ehForca(b)) continue;
    const v = intensidadeDoBloco(b);
    if (v != null) vals.push(v);
  }
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

/**
 * proxyVolumeAerobio = Σ minutos dos blocos aeróbios da semana, LENDO O ALVO quando presente
 * (`duracaoAlvoMin ?? meio(duracao)`). Assim a semana que progrediu a duração-alvo vira volume
 * aeróbio maior de verdade. Sem alvo (plano antigo/sintético), cai no meio da faixa como antes.
 */
function proxyVolumeAerobio(m: Microciclo): number {
  let total = 0;
  for (const b of blocos(m)) {
    if (!ehAerobio(b)) continue;
    total += b.duracaoAlvoMin ?? meio(b.duracao) ?? 0;
  }
  return total;
}

const cargas = (micros: Microciclo[]) => micros.filter((mc) => mc.tipo === "carga");

/* ------------------------------------ Critérios ------------------------------------ */
/**
 * Cada critério recebe um macrociclo e devolve o MOTIVO da reprovação (string) ou null
 * quando passa ou quando não há o que avaliar. Rodam iguais no gerador real e nos planos
 * sintéticos da autoverificação, para o verificador provar que sabe distinguir os dois.
 */

/** 1. Não repetir: um plano com mais de uma semana não pode ter a dose idêntica em TODAS. */
function criterio1(macro: Macrociclo): string | null {
  const micros = macro.mesociclos.flatMap((m) => m.microciclos);
  if (micros.length <= 1) return null;
  const assinaturas = new Set(micros.map(assinaturaCarga));
  // (A exceção de "microciclo intencional" ainda não tem campo no modelo; por ora,
  // repetição total = falha, como manda a spec da MP-2.)
  if (assinaturas.size === 1) return `dose idêntica nas ${micros.length} semanas (uma única assinaturaCarga)`;
  return null;
}

/** 3. Volume sobe -> real: em meso "volume sobe", a última semana de carga > a primeira. */
function criterio3(macro: Macrociclo): string | null {
  for (const meso of macro.mesociclos) {
    if (meso.tendenciaVolume !== "sobe") continue;
    const c = cargas(meso.microciclos);
    if (c.length < 2) continue;
    const ini = proxyVolumeForca(c[0]);
    const fim = proxyVolumeForca(c[c.length - 1]);
    if (!(fim > ini)) return `meso "${meso.nome}" (volume sobe): volume de força ${ini} -> ${fim}, não aumentou`;
  }
  return null;
}

/** 4. Intensidade sobe -> real: em meso "intensidade sobe", última carga > primeira (quando parseável). */
function criterio4(macro: Macrociclo): string | null {
  for (const meso of macro.mesociclos) {
    if (meso.tendenciaIntensidade !== "sobe") continue;
    const c = cargas(meso.microciclos);
    if (c.length < 2) continue;
    const ini = proxyIntensidadeForca(c[0]);
    const fim = proxyIntensidadeForca(c[c.length - 1]);
    if (ini == null || fim == null) continue; // intensidade textual: não avalia
    if (!(fim > ini)) return `meso "${meso.nome}" (intensidade sobe): intensidade ${ini} -> ${fim}, não aumentou`;
  }
  return null;
}

/** 5. Descarga reduz: cada semana "deload" tem volume (força OU aeróbio) menor que a última carga anterior. */
function criterio5(macro: Macrociclo): string | null {
  for (const meso of macro.mesociclos) {
    const micros = meso.microciclos;
    for (let i = 0; i < micros.length; i++) {
      if (micros[i].tipo !== "deload") continue;
      let anterior: Microciclo | undefined;
      for (let j = i - 1; j >= 0; j--)
        if (micros[j].tipo === "carga") {
          anterior = micros[j];
          break;
        }
      if (!anterior) continue;
      const df = proxyVolumeForca(micros[i]);
      const cf = proxyVolumeForca(anterior);
      const da = proxyVolumeAerobio(micros[i]);
      const ca = proxyVolumeAerobio(anterior);
      const reduziuForca = cf > 0 && df < cf;
      const reduziuAero = ca > 0 && da < ca;
      if (!reduziuForca && !reduziuAero)
        return `meso "${meso.nome}" semana ${micros[i].semana} (descarga): força ${cf}->${df}, aeróbio ${ca}->${da}, não reduziu`;
    }
  }
  return null;
}

/**
 * 6. Aeróbio não constante: em plano com aeróbio, o volume aeróbio não pode ser idêntico em
 * todas as semanas de CARGA. Restrito à carga de propósito: a descarga tira uma sessão e já
 * baixaria o total do aeróbio por tabela, mascarando o que interessa aqui, que é a DOSE por
 * sessão nunca progredir ("20 a 40 min" reconstruído igual toda semana).
 */
function criterio6(macro: Macrociclo): string | null {
  const c = cargas(macro.mesociclos.flatMap((m) => m.microciclos)).filter((mc) => proxyVolumeAerobio(mc) > 0);
  if (c.length < 2) return null; // não é plano com aeróbio (ou só uma semana de carga com aeróbio)
  const vals = new Set(c.map(proxyVolumeAerobio));
  if (vals.size === 1) return `aeróbio constante (${[...vals][0]} min) nas ${c.length} semanas de carga com aeróbio`;
  return null;
}

/**
 * Assinatura NÚCLEO de um mesociclo para o critério do anual: nome do foco + tendências de
 * volume e intensidade. É a "identidade do bloco". O quarteto trimestral repetido tem essa
 * assinatura periódica com período 4 (Base/Desenvolvimento/Intensificação/Consolidação
 * girando); um anual que EVOLUI, não.
 */
function nucleoMeso(m: Macrociclo["mesociclos"][number]): string {
  return `${m.nome}|${m.tendenciaVolume}|${m.tendenciaIntensidade}`;
}

/** A sequência se repete com período p? (mesma assinatura a cada p mesociclos, do p-ésimo em diante). */
function ehPeriodico(sigs: string[], p: number): boolean {
  if (sigs.length <= p) return false;
  for (let i = p; i < sigs.length; i++) if (sigs[i] !== sigs[i - p]) return false;
  return true;
}

/** Média da intensidade de força das semanas de carga de um mesociclo (null se não parseável). */
function intensidadeMediaMeso(meso: Macrociclo["mesociclos"][number]): number | null {
  const vals: number[] = [];
  for (const mc of cargas(meso.microciclos)) {
    const v = proxyIntensidadeForca(mc);
    if (v != null) vals.push(v);
  }
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

/** A intensidade média por mesociclo TENDE a subir ao longo do ano? (2ª metade > 1ª metade). */
function intensidadeSobeNoAno(macro: Macrociclo): boolean {
  const medias = macro.mesociclos.map(intensidadeMediaMeso).filter((v): v is number => v != null);
  if (medias.length < 4) return false;
  const meio = Math.floor(medias.length / 2);
  const media = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
  return media(medias.slice(meio)) > media(medias.slice(0, meio));
}

/**
 * Anual evolui (critérios 18/19/20): um plano de horizonte anual (>= 8 mesociclos) NÃO pode
 * ser o quarteto trimestral repetido 4x. Passa quando a assinatura dos mesos do ano tem MAIS
 * variação que um período-4 puro OU quando a intensidade média por mesociclo tende a subir ao
 * longo do ano. Falha (só repetição) quando é período-4 E a intensidade não sobe.
 */
function criterioAnual(macro: Macrociclo): string | null {
  const mesos = macro.mesociclos;
  if (mesos.length < 8) return null; // não é horizonte anual
  const sigs = mesos.map(nucleoMeso);
  const soRepeticao = ehPeriodico(sigs, 4);
  if (soRepeticao && !intensidadeSobeNoAno(macro)) {
    const distintas = new Set(sigs).size;
    return `anual é o quarteto trimestral repetido (assinatura de meso periódica com período 4, só ${distintas} blocos distintos girando) e a intensidade média não sobe ao longo do ano`;
  }
  return null;
}

const CRITERIOS: { id: number; nome: string; fn: (m: Macrociclo) => string | null }[] = [
  { id: 1, nome: "não repetir a dose toda semana", fn: criterio1 },
  { id: 3, nome: "volume sobe vira volume real", fn: criterio3 },
  { id: 4, nome: "intensidade sobe vira intensidade real", fn: criterio4 },
  { id: 5, nome: "descarga reduz o volume", fn: criterio5 },
  { id: 6, nome: "aeróbio não fica constante", fn: criterio6 },
  { id: 19, nome: "anual evolui (não repete o quarteto trimestral)", fn: criterioAnual },
];

/* -------------------------------- Autoverificação --------------------------------- */
/** Constrói um microciclo de teste com um bloco de força e (opcional) um de aeróbio. */
function semanaTeste(
  semana: number,
  tipo: Microciclo["tipo"],
  d: { series: string; reps: string; intensidade: string; aerobio?: string },
): Microciclo {
  const bs: BlocoSessao[] = [
    { id: `f-${semana}`, tipo: "forca", nome: "Agachamento", series: d.series, reps: d.reps, intensidade: d.intensidade, intervalo: "2 min" },
  ];
  if (d.aerobio) bs.push({ id: `a-${semana}`, tipo: "aerobio", nome: "Aeróbio", formato: "Contínuo", duracao: d.aerobio, recuperacao: "-" });
  return { id: `mic-${semana}`, semana, tipo, frequencia: 1, sessoes: [{ id: `ses-${semana}`, nome: "Sessão A", blocos: bs }] };
}

function mesoTeste(micros: Microciclo[]): Macrociclo {
  return {
    objetivoGeral: "teste",
    semanas: micros.length,
    mesociclos: [
      {
        id: "mes-1",
        nome: "Bloco de teste",
        foco: "teste",
        semanaInicio: micros[0].semana,
        semanaFim: micros[micros.length - 1].semana,
        capacidades: [],
        tiposExercicio: [],
        tendenciaVolume: "sobe",
        tendenciaIntensidade: "sobe",
        tendenciaComplexidade: "sobe",
        criteriosProgressao: [],
        criteriosRegressao: [],
        parametros: [],
        microciclos: micros,
      },
    ],
  };
}

// Progressivo: dose que sobe semana a semana, descarga menor, aeróbio variando.
const PLANO_PROGRESSIVO = mesoTeste([
  semanaTeste(1, "carga", { series: "3", reps: "8", intensidade: "70", aerobio: "20 min" }),
  semanaTeste(2, "carga", { series: "3", reps: "10", intensidade: "75", aerobio: "25 min" }),
  semanaTeste(3, "carga", { series: "4", reps: "10", intensidade: "80", aerobio: "30 min" }),
  semanaTeste(4, "deload", { series: "2", reps: "8", intensidade: "70", aerobio: "15 min" }),
]);

// Chapado: a mesma dose e o mesmo aeróbio em toda semana (o vício que o gerador tem hoje).
const PLANO_CHAPADO = mesoTeste([
  semanaTeste(1, "carga", { series: "3", reps: "8", intensidade: "70", aerobio: "20 min" }),
  semanaTeste(2, "carga", { series: "3", reps: "8", intensidade: "70", aerobio: "20 min" }),
  semanaTeste(3, "carga", { series: "3", reps: "8", intensidade: "70", aerobio: "20 min" }),
]);

/** Macrociclo anual sintético a partir de assinaturas de mesociclo (nome + tendências). */
function macroAnualTeste(specs: { nome: string; tv: Tendencia; ti: Tendencia }[]): Macrociclo {
  return {
    objetivoGeral: "teste anual",
    semanas: specs.length,
    mesociclos: specs.map((s, i) => ({
      id: `ma-${i}`,
      nome: s.nome,
      foco: s.nome,
      semanaInicio: i + 1,
      semanaFim: i + 1,
      capacidades: [],
      tiposExercicio: [],
      tendenciaVolume: s.tv,
      tendenciaIntensidade: s.ti,
      tendenciaComplexidade: "estavel",
      criteriosProgressao: [],
      criteriosRegressao: [],
      parametros: [],
      microciclos: [semanaTeste(i + 1, "carga", { series: "3", reps: "8", intensidade: "moderada a alta" })],
    })),
  };
}

// Anual REPETIDO: o quarteto trimestral girando 4x (o vício que a MP-4 elimina). Assinatura de
// meso periódica com período 4 e intensidade textual (não sobe) -> deve reprovar no anual.
const QUARTETO = ["Base e adaptação", "Desenvolvimento", "Intensificação", "Consolidação"];
const ANUAL_REPETIDO = macroAnualTeste(
  Array.from({ length: 12 }, (_, i) => ({ nome: QUARTETO[i % 4], tv: "sobe" as Tendencia, ti: "sobe" as Tendencia })),
);

// Anual que EVOLUI: ondas (acúmulo/intensificação/realização) que retomam em ciclos, com o
// ordinal do ciclo no nome -> não é período-4 -> deve passar no anual.
const FASES3 = ["Acúmulo", "Intensificação", "Realização"];
const ANUAL_EVOLUI = macroAnualTeste(
  Array.from({ length: 12 }, (_, i) => {
    const fase = FASES3[i % 3];
    const ciclo = Math.floor(i / 3);
    return { nome: ciclo === 0 ? fase : `${fase} (${ciclo + 1}º ciclo)`, tv: "sobe" as Tendencia, ti: "sobe" as Tendencia };
  }),
);

function autoverificar(): string[] {
  const problemas: string[] = [];
  const reprovasProgressivo = CRITERIOS.map((c) => c.fn(PLANO_PROGRESSIVO)).filter(Boolean);
  if (reprovasProgressivo.length)
    problemas.push(`o plano PROGRESSIVO deveria passar em tudo, mas reprovou: ${reprovasProgressivo.join(" | ")}`);
  const reprovasChapado = CRITERIOS.map((c) => c.fn(PLANO_CHAPADO)).filter(Boolean);
  if (!reprovasChapado.length) problemas.push("o plano CHAPADO deveria reprovar (dose idêntica toda semana), mas passou em tudo");
  // O critério do anual precisa distinguir o quarteto repetido de um ano que evolui.
  if (criterioAnual(ANUAL_REPETIDO) == null)
    problemas.push("o anual REPETIDO (quarteto trimestral 4x) deveria reprovar no critério do anual, mas passou");
  const reprovaEvolui = criterioAnual(ANUAL_EVOLUI);
  if (reprovaEvolui) problemas.push(`o anual que EVOLUI deveria passar no critério do anual, mas reprovou: ${reprovaEvolui}`);
  return problemas;
}

/* ----------------------------------- Execução ------------------------------------- */

const falhaAuto = autoverificar();
if (falhaAuto.length) {
  console.error("\n[check:progressao] LÓGICA DO VERIFICADOR QUEBRADA (a autoverificação falhou):\n");
  for (const p of falhaAuto) console.error(`  - ${p}`);
  console.error("\n  Um verificador que não distingue progressivo de chapado não protege nada. Corrija o checker.\n");
  process.exit(1);
}

// Enumera o gerador real no cartesiano (objetivo x nível x grupo x semanas).
interface Falha {
  total: number;
  exemplo?: string;
}
const falhas = new Map<number, Falha>(CRITERIOS.map((c) => [c.id, { total: 0 }]));
let planosAvaliados = 0;

for (const objetivo of OBJETIVOS as GpsObjetivo[]) {
  for (const nivel of NIVEIS) {
    for (const grupoEspecial of [undefined, ...specialGroups.map((g) => g.slug)]) {
      for (const semanas of SEMANAS) {
        const plano = gerarPlano({ objetivo, nivel, semanas, frequencia: FREQ, grupoEspecial });
        const macros = [plano.principal, plano.alternativa].filter(Boolean) as Macrociclo[];
        for (const macro of macros) {
          planosAvaliados++;
          for (const c of CRITERIOS) {
            const motivo = c.fn(macro);
            if (!motivo) continue;
            const f = falhas.get(c.id)!;
            f.total++;
            if (!f.exemplo) f.exemplo = `${objetivo} / ${nivel} / ${grupoEspecial ?? "sem grupo"} / ${semanas} sem -> ${motivo}`;
          }
        }
      }
    }
  }
}

const vermelhos = CRITERIOS.filter((c) => falhas.get(c.id)!.total > 0);

console.log(`\n[check:progressao] autoverificação OK: o progressivo passa, o chapado reprova.`);
console.log(`[check:progressao] ${planosAvaliados} macrociclos avaliados no cartesiano (objetivo x nível x grupo x semanas).\n`);

if (!vermelhos.length) {
  console.log("[check:progressao] VERDE: o gerador já entrega progressão real em todos os critérios. Registre este check no agregado de CI.");
  process.exit(0);
}

console.error("[check:progressao] VERMELHO (esperado até MP-3/MP-4): o gerador ainda repete a dose. Critérios não atendidos:\n");
for (const c of vermelhos) {
  const f = falhas.get(c.id)!;
  console.error(`  Critério ${c.id} (${c.nome}): ${f.total} plano(s) falharam.`);
  console.error(`    ex.: ${f.exemplo}`);
}
console.error(
  "\n  Este vermelho é o alvo das ondas do motor: MP-3 faz a dose de força progredir de verdade" +
    " (critérios 1,3,4,5); MP-4 faz o aeróbio progredir (critério 6) e o anual evoluir em vez de" +
    " repetir o quarteto trimestral (critério 19). Quando tudo ficar verde, o check pode entrar no" +
    " agregado de CI.\n",
);
process.exit(1);
