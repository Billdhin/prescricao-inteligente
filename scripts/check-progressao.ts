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
import { agregadoSemana } from "../src/lib/gps/progressao";
import { assinaturaCarga } from "../src/lib/gps/assinaturaSemana";
import { OBJETIVOS } from "../src/lib/gps/engine";
import { specialGroups } from "../src/data/specialGroups";
import { MODELOS_PERIODIZACAO } from "../src/data/periodizacao";
import { groupGpsRules } from "../src/lib/gps/groupRules";
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
 * - `rirAlvo` (reps de reserva): menor = mais intenso, então entra como -rir. O RIR é INTEIRO,
 *   e num objetivo cuja faixa vai de 3 a 1 ele só tem três degraus para percorrer o macrociclo
 *   inteiro. Quando a rampa é contínua no macro (modelo linear), duas semanas seguidas caem no
 *   mesmo degrau de RIR e a diferença real aparece nas REPETIÇÕES: menos repetições com o mesmo
 *   RIR é mais carga na barra, que é o que intensidade quer dizer aqui. Por isso o proxy é
 *   lexicográfico, RIR primeiro e repetições como desempate: -(rir x 100 + reps). Ele não
 *   perdoa nada que o proxy antigo pegava (RIR parado E repetição parada continua reprovando);
 *   só passa a enxergar o degrau fino que o antigo não via.
 * - sem alvo numérico, cai no meio da faixa de intensidade textual (null em "moderada a alta").
 */
function intensidadeDoBloco(b: BlocoSessao): number | null {
  if (b.cargaRelativaAlvo != null) return b.cargaRelativaAlvo;
  if (b.rirAlvo != null) return -(b.rirAlvo * 100 + (b.repsAlvo ?? 0));
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

/**
 * 4. Intensidade sobe -> real: em meso "intensidade sobe", a intensidade tem que subir de
 * verdade. O QUE MUDOU AQUI, e por quê:
 *
 * A janela continua sendo o próprio mesociclo (última semana de carga > primeira), porque é
 * dele que o cartão do plano fala. O que mudou foi do outro lado: o gerador passou a REBAIXAR
 * o rótulo do meso que não entrega (`sincronizarTendencias`), então este critério deixou de
 * pegar o caso do horizonte anual e passou a valer como trava de dessincronização: se alguém
 * escrever "sobe" à mão num meso que não sobe, aqui fica vermelho.
 *
 * Sozinho isso não bastaria (um plano todo rotulado "estavel" passaria por vazio), e é por
 * isso que existe o critério 21 logo abaixo: ele não olha rótulo nenhum, olha a dose das
 * pontas do macrociclo.
 */
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

/**
 * 21. A SEGUNDA METADE DO PLANO NÃO É CÓPIA DA PRIMEIRA. Este critério não lê rótulo nenhum:
 * compara a dose das semanas de carga da primeira metade do macrociclo com a das semanas
 * correspondentes da segunda.
 *
 * Foi ele que pegou o defeito que o critério 1 não pegava: na ondulatória a onda alternava em
 * torno de um centro FIXO, então as semanas 4, 5 e 6 saíam idênticas às semanas 1, 2 e 3, e um
 * plano de seis meses era a mesma quinzena repetida doze vezes. O critério 1 passava, porque
 * as semanas não eram todas iguais entre si; e o critério 4 passava, porque a tendência era
 * "varia" e não "sobe". A dose repetida ficava exatamente no ponto cego dos dois.
 *
 * Terminar perto de onde começou NÃO reprova aqui, de propósito: no modelo de blocos o plano
 * fecha em pico, com o volume voltando ao piso na semana de realização. Isso é taper, não
 * estagnação. O que reprova é o caminho inteiro se repetir.
 */
function criterioMacroProgride(macro: Macrociclo): string | null {
  if (macro.mesociclos.length < 2) return null;
  const c = macro.mesociclos.flatMap((m) => cargas(m.microciclos));
  if (c.length < 4) return null;
  const meio = Math.floor(c.length / 2);
  const primeira = c.slice(0, meio).map(assinaturaCarga);
  const segunda = c.slice(meio, meio * 2).map(assinaturaCarga);
  if (primeira.every((a, i) => a === segunda[i])) {
    return `a segunda metade do macrociclo repete a primeira semana a semana (${meio} semanas de carga idênticas)`;
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
  { id: 21, nome: "o macrociclo progride de ponta a ponta", fn: criterioMacroProgride },
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

/* -------------------- Supressão da zona de FC (camada de fármacos) -------------------- */

/**
 * O perfil clínico mais as classes de medicação declaradas podem decidir que a frequência
 * cardíaca NÃO guia a intensidade deste aluno (`parametrosInvalidos`). Quando isso acontece, o
 * caminho é SUPRIMIR a zona e cair no fallback honesto que já existe (duração mais percepção de
 * esforço), e nunca corrigir a frequência cardíaca por um fator que referência nenhuma sustenta.
 *
 * Este bloco trava as duas metades da afirmação:
 * 1. com "p-fc" invalidado, ZERO blocos com zonaFC ou percentFCRAlvo, a nota do bloco aeróbio
 *    explica por qual instrumento guiar, e a dose de FORÇA fica intacta (suprimir a zona não
 *    pode mexer no resto do plano);
 * 2. sem o campo, a saída NÃO muda: a zona volta com os mesmos bpm, e um `parametrosInvalidos`
 *    vazio produz um plano idêntico ao gerado sem o campo (aluno sem fármaco não paga nada
 *    por esta camada existir).
 */
function planoSemIds(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(planoSemIds);
  if (v && typeof v === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      if (k === "id") continue;
      out[k] = planoSemIds(val);
    }
    return out;
  }
  return v;
}

function todosOsBlocos(macro: Macrociclo): BlocoSessao[] {
  return macro.mesociclos.flatMap((m) => m.microciclos.flatMap((w) => w.sessoes.flatMap((s) => s.blocos)));
}

function verificarSupressaoDeFC(): string[] {
  const problemas: string[] = [];
  // Emagrecimento tem aeróbio de BASE em toda sessão, e idade + FCrep medida fazem a zona
  // existir: é o caso em que a supressão é visível.
  const base = { objetivo: "Emagrecimento" as GpsObjetivo, nivel: "Iniciante" as Nivel, semanas: 12, frequencia: FREQ, idade: 52, fcRepouso: 62 };

  const comFC = gerarPlano(base);
  const blocosComFC = todosOsBlocos(comFC.principal);
  const zonasAntes = blocosComFC.filter((b) => b.zonaFC != null).length;
  if (zonasAntes === 0)
    problemas.push("o plano de referência (com idade e FCrep, sem parâmetro invalidado) deveria ter zona de FC, e não tem: o caso perdeu o sentido");

  const semFC = gerarPlano({ ...base, parametrosInvalidos: ["p-fc"] });
  const blocosSemFC = todosOsBlocos(semFC.principal);
  const zonasDepois = blocosSemFC.filter((b) => b.zonaFC != null);
  const reservasDepois = blocosSemFC.filter((b) => b.percentFCRAlvo != null);
  if (zonasDepois.length)
    problemas.push(`com "p-fc" invalidado, ${zonasDepois.length} bloco(s) ainda trazem zonaFC (ex.: ${zonasDepois[0].zonaFC})`);
  if (reservasDepois.length)
    problemas.push(`com "p-fc" invalidado, ${reservasDepois.length} bloco(s) ainda trazem percentFCRAlvo`);

  const aerobiosSemFC = blocosSemFC.filter(ehAerobio);
  const semExplicacao = aerobiosSemFC.filter((b) => !(b.observacao ?? "").includes("percepção de esforço"));
  if (aerobiosSemFC.length === 0) problemas.push("o plano sem zona de FC não tem bloco aeróbio: nada a explicar, e o caso perdeu o sentido");
  if (semExplicacao.length)
    problemas.push(`${semExplicacao.length} bloco(s) aeróbio(s) suprimiram a zona sem explicar por qual instrumento guiar`);

  /*
   * O TEXTO VISÍVEL também não pode citar a frequência cardíaca.
   *
   * Este check só olhava os campos ESTRUTURADOS (`zonaFC`, `percentFCRAlvo`) e ficava
   * verde enquanto o campo `intensidade` do mesmo bloco dizia, com todas as letras,
   * "Moderada: cerca de 64 a 76% da FCmáx". O bloco afirmava as duas coisas ao mesmo
   * tempo, e a que vai para o PDF e para o app do aluno é o `intensidade`. Um aluno
   * com betabloqueador lia a zona de FC no documento assinado.
   *
   * Guardrail que valida só o campo interno e ignora a frase impressa valida a metade
   * que ninguém lê.
   */
  const CITA_FC = /FCm[áa]x|frequ[êe]ncia card[íi]aca|\bFCR\b|bpm/i;
  const textoComFC = aerobiosSemFC.filter((b) => CITA_FC.test(b.intensidade ?? ""));
  if (textoComFC.length)
    problemas.push(
      `com "p-fc" invalidado, ${textoComFC.length} bloco(s) aeróbio(s) ainda CITAM a frequência cardíaca no texto de intensidade (ex.: "${textoComFC[0].intensidade}")`,
    );
  // ...e o texto tem que continuar dizendo por onde guiar, senão a limpeza virou lacuna.
  const textoSemGuia = aerobiosSemFC.filter((b) => !/convers|RPE|esfor/i.test(b.intensidade ?? ""));
  if (textoSemGuia.length)
    problemas.push(
      `${textoSemGuia.length} bloco(s) aeróbio(s) ficaram sem NENHUM guia no texto de intensidade depois de tirar a FC`,
    );

  // Suprimir a zona não pode mexer na dose de força nem no alvo de duração/esforço do aeróbio.
  const forcaAntes = JSON.stringify(planoSemIds(blocosComFC.filter(ehForca)));
  const forcaDepois = JSON.stringify(planoSemIds(blocosSemFC.filter(ehForca)));
  if (forcaAntes !== forcaDepois) problemas.push("suprimir a zona de FC mudou a dose de FORÇA, e não deveria mexer em nada além do aeróbio");
  const durAntes = blocosComFC.filter(ehAerobio).map((b) => `${b.duracaoAlvoMin}/${b.rpeAlvo}`).join(",");
  const durDepois = aerobiosSemFC.map((b) => `${b.duracaoAlvoMin}/${b.rpeAlvo}`).join(",");
  if (durAntes !== durDepois) problemas.push("suprimir a zona de FC mudou a duração-alvo ou o PSE-alvo do aeróbio, e não deveria");

  // Aluno sem fármaco: lista vazia tem que produzir o MESMO plano que a ausência do campo.
  const vazio = gerarPlano({ ...base, parametrosInvalidos: [] });
  if (JSON.stringify(planoSemIds(vazio)) !== JSON.stringify(planoSemIds(comFC)))
    problemas.push("gerar com parametrosInvalidos vazio mudou a saída: o caminho sem fármaco deixou de ser idêntico");

  return problemas;
}

/**
 * A DESCARGA CHEGA A QUEM TEM CONDIÇÃO CLÍNICA.
 *
 * A regra antiga era `comDeload = dur >= 4`, com `dur` sendo a duração do mesociclo. No
 * caminho de grupo especial o mesociclo é uma FASE DA JORNADA e o número de mesociclos é
 * fixo no número de fases, então `dur = semanas / 4`, menor que 4 em todo horizonte
 * abaixo de 16 semanas. O aluno sem condição recebia descarga a cada 4 semanas; o
 * hipertenso estágio 2 e o obeso grau II não recebiam NENHUMA em 4, 8 e 12 semanas.
 *
 * A asserção compara os dois caminhos em vez de exigir um número: o plano clínico tem
 * que receber, no mínimo, a mesma cadência de recuperação do plano sem condição. Assim
 * ela continua válida se a casa mudar a cadência.
 */
function verificarDescargaClinica(): string[] {
  const problemas: string[] = [];
  const GRUPOS = ["hipertensao-estagio-2", "obesidade-grau-2", "gestante", "idoso-destreinado"];
  const base = { objetivo: "Hipertrofia" as GpsObjetivo, nivel: "Iniciante" as Nivel, frequencia: FREQ };
  const descargasDe = (p: ReturnType<typeof gerarPlano>) =>
    p.principal.mesociclos.flatMap((m) => m.microciclos.filter((w) => w.tipo === "deload").map((w) => w.semana));

  for (const semanas of [4, 8, 12, 24]) {
    const generico = descargasDe(gerarPlano({ ...base, semanas }));
    // Controle positivo: se o caminho genérico deixar de ter descarga, a comparação abaixo
    // fica satisfeita por vacuidade e o teste passa a não proteger nada.
    if (!generico.length) {
      problemas.push(`controle positivo: o plano genérico de ${semanas} semanas não tem NENHUMA descarga; a comparação perdeu o sentido`);
      continue;
    }
    for (const grupo of GRUPOS) {
      const clinico = descargasDe(gerarPlano({ ...base, semanas, grupoEspecial: grupo }));
      if (clinico.length < generico.length)
        problemas.push(
          `${semanas} semanas com "${grupo}": ${clinico.length} semana(s) de descarga contra ${generico.length} do plano sem condição ` +
            `(genérico nas semanas ${generico.join(",")}; clínico ${clinico.length ? "nas " + clinico.join(",") : "NENHUMA"})`,
        );
    }
  }
  return problemas;
}

/**
 * O TETO DE PSE DO PERFIL CHEGA AO ALVO PRESCRITO.
 *
 * `modProgressao.pseTeto` existia e era consumido em dois lugares: o texto do semáforo e a
 * autorregulação da execução. Não chegava ao alvo do plano. Medido antes da correção, num
 * plano de 12 semanas para hipertensão estágio 2, cujo teto é 5: 15 dos 33 blocos aeróbios
 * saíam com PSE-alvo 6, enquanto o semáforo do MESMO aluno dizia "PSE ≤5".
 *
 * A varredura cobre todos os grupos que declaram teto, e não só o caso encontrado.
 */
function verificarTetoDePSE(): string[] {
  const problemas: string[] = [];
  const comTeto = Object.entries(groupGpsRules).filter(([, r]) => r?.modProgressao?.pseTeto != null);

  // Controle positivo: se nenhum grupo declarar teto, o laço abaixo não testa nada.
  if (comTeto.length < 5)
    problemas.push(`controle positivo: só ${comTeto.length} grupo(s) declaram pseTeto; a varredura perdeu o sentido`);

  let blocosConferidos = 0;
  for (const [grupo, regra] of comTeto) {
    const teto = regra!.modProgressao!.pseTeto!;
    // Emagrecimento tem aeróbio de base em toda sessão: é onde o PSE-alvo aparece.
    const p = gerarPlano({
      objetivo: "Emagrecimento" as GpsObjetivo, nivel: "Iniciante" as Nivel,
      semanas: 12, frequencia: FREQ, grupoEspecial: grupo, idade: 55, fcRepouso: 72,
    });
    const acima: number[] = [];
    for (const m of p.principal.mesociclos)
      for (const w of m.microciclos)
        for (const s of w.sessoes)
          for (const b of s.blocos) {
            if (b.rpeAlvo == null) continue;
            blocosConferidos++;
            if (b.rpeAlvo > teto) acima.push(b.rpeAlvo);
          }
    if (acima.length)
      problemas.push(
        `"${grupo}" declara pseTeto ${teto} e o plano prescreve PSE-alvo ${[...new Set(acima)].sort().join(",")} ` +
          `em ${acima.length} bloco(s): a cautela está declarada e não é aplicada`,
      );
  }
  if (blocosConferidos === 0)
    problemas.push("controle positivo: nenhum bloco com PSE-alvo foi encontrado; a varredura não leu o plano");
  return problemas;
}

/**
 * A DESCARGA TEM QUE DESCARREGAR A SESSÃO, NÃO SÓ O CARTÃO.
 *
 * A descarga ancorava na suposição "a última semana de carga é o teto do mesociclo". Vale
 * para "sobe" e "reduz"; não vale para "varia", onde o nível oscila e a última semana pode
 * ser um vale. Medido em 12 semanas de hipertrofia para intermediário, volume por SESSÃO:
 *
 *   ondulatória  96 112 84 [84] 84 112 84 [84] 84 96 112 [84]
 *
 * A sessão de descarga saía idêntica à sessão de carga que veio antes dela. No semanal havia
 * redução, mas só porque a descarga tira uma sessão: a sessão em si não aliviava nada, e é a
 * sessão que o aluno abre e executa.
 *
 * A asserção é comparativa e não fixa magnitude: a sessão de descarga precisa ficar abaixo da
 * sessão de carga MAIS LEVE do próprio mesociclo, em qualquer modelo.
 */
function verificarDescargaNaSessao(): string[] {
  const problemas: string[] = [];
  const volSessao = (s: { blocos: BlocoSessao[] }) =>
    s.blocos.filter((b) => b.tipo !== "aerobio").reduce((a, b) => a + (b.seriesAlvo ?? 0) * (b.repsAlvo ?? 0), 0);

  let mesosAvaliados = 0;
  for (const modelo of MODELOS_PERIODIZACAO.map((m) => m.id)) {
    const p = gerarPlano({
      objetivo: "Hipertrofia" as GpsObjetivo, nivel: "Intermediário" as Nivel,
      semanas: 12, frequencia: FREQ, modeloPreferido: modelo,
    });
    for (const meso of p.principal.mesociclos) {
      const descargas = meso.microciclos.filter((w) => w.tipo === "deload");
      const cargas = meso.microciclos.filter((w) => w.tipo === "carga");
      if (!descargas.length || !cargas.length) continue;
      mesosAvaliados++;
      // RIR da sessão, quando existe: mais RIR = mais folga = mais leve.
      const rirDe = (w: (typeof cargas)[number]) => {
        const rs = w.sessoes[0].blocos.filter((b) => b.tipo !== "aerobio").map((b) => b.rirAlvo).filter((r): r is number => r != null);
        return rs.length ? Math.min(...rs) : null;
      };
      const todas = meso.microciclos;
      for (const d of descargas) {
        // A comparação é com a semana de CARGA imediatamente anterior, que é o que a descarga
        // existe para aliviar. Comparar com a semana mais leve do bloco inteiro mistura eixos:
        // no modelo de blocos a semana de acúmulo tem RIR folgado E volume alto, e exigir que a
        // descarga fosse mais folgada QUE ELA no RIR reprovaria uma descarga que corta o volume
        // a um terço, que é alívio de sobra.
        const i = todas.indexOf(d);
        const anterior = [...todas.slice(0, i)].reverse().find((w) => w.tipo === "carga");
        if (!anterior) continue;
        const vD = volSessao(d.sessoes[0]);
        const vA = volSessao(anterior.sessoes[0]);
        if (vD < vA) continue;
        // Volume igual só é aceitável quando a carga anterior JÁ está no piso das faixas
        // citadas: cortar mais sairia da faixa publicada, linha que a casa não cruza. Aí o
        // alívio tem que vir por RIR, e a asserção cobra isso em vez de exigir o impossível.
        const rD = rirDe(d);
        const rA = rirDe(anterior);
        if (rD != null && rA != null && rD > rA) continue;
        problemas.push(
          `modelo "${modelo}", meso "${meso.nome}": a sessão de descarga da semana ${d.semana} não alivia nada ` +
            `em relação à semana ${anterior.semana} de carga (volume ${vD} contra ${vA}, RIR ${rD ?? "-"} contra ${rA ?? "-"})`,
        );
      }
    }
  }
  // Controle positivo: sem mesociclo com carga E descarga, o laço acima não testa nada.
  if (mesosAvaliados < 5)
    problemas.push(`controle positivo: só ${mesosAvaliados} mesociclo(s) tinham carga e descarga; a asserção perdeu o sentido`);
  return problemas;
}

/**
 * A DOSE NASCE DO PERFIL, NÃO SÓ DO OBJETIVO.
 *
 * Medido antes desta camada, na semana 1, mesmo objetivo (Emagrecimento) e mesmo nível
 * (Iniciante): sem condição, obesidade grau I, obesidade grau III, hipertensão estágio 1 e
 * hipertensão estágio 2 recebiam TODOS 3x15 com intervalo de 30 s, que é o piso da faixa e
 * o extremo mais metabólico dela, e 40 min contínuos de aeróbio, que é o TETO da faixa
 * "20 a 40 min". Cinco perfis clinicamente distintos, uma dose só.
 *
 * A asserção é comparativa e não fixa número: exige que o perfil com cautela declarada
 * receba descanso não menor e volume aeróbio inicial não maior que o perfil sem condição.
 */
function verificarDoseVemDoPerfil(): string[] {
  const problemas: string[] = [];
  const base = { objetivo: "Emagrecimento" as GpsObjetivo, nivel: "Iniciante" as Nivel, semanas: 12, frequencia: FREQ, idade: 45, fcRepouso: 70 };
  const doseDe = (grupo?: string) => {
    const p = gerarPlano({ ...base, grupoEspecial: grupo });
    const s = p.principal.mesociclos[0].microciclos[0].sessoes[0];
    const forca = s.blocos.find((b) => b.tipo !== "aerobio");
    const aer = s.blocos.find((b) => b.tipo === "aerobio");
    return { intervalo: forca?.intervaloAlvoSeg ?? null, duracao: aer?.duracaoAlvoMin ?? null, pse: aer?.rpeAlvo ?? null };
  };
  const semCondicao = doseDe();
  if (semCondicao.intervalo == null || semCondicao.duracao == null)
    return ["controle positivo: o plano de referência não traz intervalo nem duração; a asserção não testa nada."];

  const COM_CAUTELA = ["obesidade-grau-3", "hipertensao-estagio-1", "hipertensao-estagio-2", "idoso-destreinado"];
  let diferiuAlgum = false;
  for (const g of COM_CAUTELA) {
    const regra = groupGpsRules[g];
    if (!regra?.modProgressao?.cautela && !regra?.modDose) continue;
    const d = doseDe(g);
    if (d.intervalo != null && d.intervalo < semCondicao.intervalo)
      problemas.push(`"${g}" recebe descanso MENOR que quem não tem condição (${d.intervalo}s contra ${semCondicao.intervalo}s)`);
    if (d.duracao != null && d.duracao > semCondicao.duracao)
      problemas.push(`"${g}" começa com volume aeróbio MAIOR que quem não tem condição (${d.duracao} min contra ${semCondicao.duracao} min)`);
    if (d.intervalo !== semCondicao.intervalo || d.duracao !== semCondicao.duracao) diferiuAlgum = true;
  }
  // O coração da asserção: se NADA diferir, a dose voltou a nascer só do objetivo.
  if (!diferiuAlgum)
    problemas.push(
      "nenhum perfil com cautela declarada recebeu dose diferente de quem não tem condição nenhuma: " +
        "a dose voltou a nascer só do objetivo e do nível",
    );
  return problemas;
}

/**
 * NENHUM PLANO ENTREGA A MESMA SEMANA DOZE VEZES, E O DESCANSO SEGUE O NÍVEL.
 *
 * Dois achados da bateria de 432 planos, ambos medidos:
 *
 * 1. ESTAGNAÇÃO em 36 planos, todos de Resistência muscular com iniciante e condição: a
 *    dose de força saía "3x15, 90 s" em TODAS as semanas de carga. A faixa cita repetições
 *    "acima de 15" e intervalo "até 90 s", pontas abertas que degeneram num valor único, e
 *    a série já nascia no teto de "2 a 3". Sem piso, não havia para onde progredir.
 *
 * 2. DESCANSO QUE IGNORAVA O NÍVEL em 720 blocos: a faixa de Força move o iniciante para
 *    "8 a 12" repetições via `porNivel` e o intervalo ficava em "3 a 5 min", que é descanso
 *    de série de 1 a 6. Saía 5x12 com 180 s, e com cautela declarada 240 s. A causa era
 *    `doseForca` ler `faixa.intervalo.valor` direto, ignorando o resolvedor `valorFaixa`
 *    que já existia: o `porNivel` do intervalo era código morto esperando ser declarado.
 */
function verificarProgressaoEDescanso(): string[] {
  const problemas: string[] = [];
  const NIVEIS_T: Nivel[] = ["Iniciante", "Intermediário", "Avançado"];
  let avaliados = 0;

  for (const objetivo of OBJETIVOS as GpsObjetivo[])
    for (const nivel of NIVEIS_T)
      // TODOS os grupos, e não uma amostra: a primeira versão desta asserção testava cinco
      // grupos e passava verde enquanto 12 planos de Resistência muscular ficavam parados,
      // porque nenhum deles estava na amostra. Guardrail com amostra mente por omissão.
      for (const grupo of [undefined, ...specialGroups.map((g) => g.slug)]) {
        const p = gerarPlano({ objetivo, nivel, semanas: 12, frequencia: FREQ, grupoEspecial: grupo });
        const cargas = p.principal.mesociclos.flatMap((m) => m.microciclos).filter((w) => w.tipo === "carga");
        if (cargas.length < 4) continue;
        avaliados++;
        const id = `${objetivo}/${nivel}/${grupo ?? "sem condição"}`;
        // A SESSÃO INTEIRA, força e aeróbio. Onde a faixa do objetivo tem ponta aberta
        // ("acima de 15", "até 90 s") a dose de força degenera num valor único e, com cautela
        // declarada, legitimamente se sustenta. O que NÃO pode acontecer é a sessão inteira
        // ser idêntica nas doze semanas: aí o plano promete progressão e não entrega nada.
        const dose = (w: (typeof cargas)[number]) =>
          w.sessoes[0].blocos
            .map((b) => (b.tipo === "aerobio" ? `AER${b.duracaoAlvoMin}/${b.rpeAlvo}` : ""))
            .join(",") +
          w.sessoes[0].blocos
            .filter((b) => b.tipo !== "aerobio")
            .map((b) => `${b.seriesAlvo}x${b.repsAlvo}/${b.rirAlvo ?? "-"}/${b.intervaloAlvoSeg}`)
            .join(",");
        if (new Set(cargas.map(dose)).size === 1)
          problemas.push(`${id}: dose de força IDÊNTICA nas ${cargas.length} semanas de carga (${dose(cargas[0])})`);

        // O descanso do bloco tem que sair da faixa que vale PARA ESTE NÍVEL.
        for (const b of cargas[0].sessoes[0].blocos) {
          if (b.tipo === "aerobio" || b.intervaloAlvoSeg == null) continue;
          const iv = intervaloDe(b.intervalo ?? "");
          const un = b.intervalo?.includes("min") ? 60 : 1;
          if (!iv) continue;
          const min = iv.min * un;
          const max = (iv.max === Infinity ? iv.min : iv.max) * un;
          if (b.intervaloAlvoSeg < min - 1 || b.intervaloAlvoSeg > max + 1)
            problemas.push(`${id}: intervalo-alvo ${b.intervaloAlvoSeg}s fora da faixa exibida "${b.intervalo}"`);
          // A incoerência concreta: muitas repetições com descanso de carga máxima.
          if ((b.repsAlvo ?? 0) >= 10 && b.intervaloAlvoSeg >= 180)
            problemas.push(`${id}: ${b.seriesAlvo}x${b.repsAlvo} com ${b.intervaloAlvoSeg}s de descanso (faixa "${b.intervalo}")`);
        }
      }
  if (avaliados < 20) problemas.push(`controle positivo: só ${avaliados} planos avaliados; a asserção perdeu o sentido`);
  return problemas;
}

/**
 * A LINHA DE INTENSIDADE DO GRÁFICO NÃO PODE SER UMA RETA.
 *
 * O Filipe mandou o print: plano semestral de Emagrecimento para hipertensão estágio 2,
 * periodização linear, e a barra de intensidade saía RETA nas 24 semanas.
 *
 * A causa não era o motor: era o AGREGADO que alimenta o gráfico. `esforcoDoBloco` lia
 * %1RM, RIR e PSE, e devolvia null para intensidade em TEXTO. Emagrecimento e Força
 * expressam intensidade como "moderada" e "alta", então os três blocos de força saíam
 * inteiros da conta e a linha virava o PSE do aeróbio sozinho. Com o teto de PSE do perfil
 * clínico prendendo esse PSE em 5, sobrava um único valor nas 24 semanas.
 *
 * Medido antes: Emagrecimento com hipertensão estágio 2 tinha UM valor distinto de
 * intensidade em 24 semanas. Força, que é o objetivo definido POR intensidade, tinha dois.
 *
 * A asserção cobre o gráfico, não o motor: é sobre o que o profissional VÊ.
 */
function verificarCurvaDeIntensidade(): string[] {
  const problemas: string[] = [];
  const NIVEIS_T: Nivel[] = ["Iniciante", "Intermediário", "Avançado"];
  let avaliados = 0;

  for (const objetivo of OBJETIVOS as GpsObjetivo[])
    for (const nivel of NIVEIS_T)
      for (const grupo of [undefined, "hipertensao-estagio-2", "obesidade-grau-3"]) {
        const p = gerarPlano({ objetivo, nivel, semanas: 24, frequencia: FREQ, grupoEspecial: grupo, modeloPreferido: "linear" });
        const semanas = p.principal.mesociclos.flatMap((m) => m.microciclos);
        if (semanas.length < 8) continue;
        avaliados++;
        const id = `${objetivo}/${nivel}/${grupo ?? "sem condição"}`;
        const ints = semanas.map((w) => agregadoSemana(w).intensidade).filter((n): n is number => n != null);

        if (!ints.length) {
          problemas.push(`${id}: o gráfico não tem NENHUM valor de intensidade nas ${semanas.length} semanas`);
          continue;
        }
        // Uma reta é o defeito exato do print. Duas casas em 24 semanas também não é curva.
        const distintos = new Set(ints.map((n) => Math.round(n * 100) / 100)).size;
        if (distintos < 3)
          problemas.push(
            `${id}: a linha de intensidade tem só ${distintos} valor(es) distinto(s) em ${semanas.length} semanas (${[...new Set(ints)].slice(0, 4).join(", ")})`,
          );
      }
  if (avaliados < 20) problemas.push(`controle positivo: só ${avaliados} planos avaliados; a asserção perdeu o sentido`);
  return problemas;
}

/* ----------------------------------- Execução ------------------------------------- */

const falhaCurva = verificarCurvaDeIntensidade();
if (falhaCurva.length) {
  console.error("\n[check:progressao] LINHA DE INTENSIDADE CHAPADA NO GRÁFICO:\n");
  for (const p of falhaCurva.slice(0, 10)) console.error(`  - ${p}`);
  if (falhaCurva.length > 10) console.error(`  ... e mais ${falhaCurva.length - 10}`);
  console.error(
    "\n  O gráfico é a leitura que o profissional faz do plano. Intensidade reta ali significa\n" +
      "  que o agregado não enxerga a variação que o motor produziu. Ver esforcoDoBloco.\n",
  );
  process.exit(1);
}

const falhaProgDesc = verificarProgressaoEDescanso();
if (falhaProgDesc.length) {
  console.error("\n[check:progressao] PLANO QUE NÃO PROGRIDE OU DESCANSO FORA DO NÍVEL:\n");
  for (const p of falhaProgDesc.slice(0, 12)) console.error(`  - ${p}`);
  if (falhaProgDesc.length > 12) console.error(`  ... e mais ${falhaProgDesc.length - 12}`);
  console.error(
    "\n  Um plano de 12 semanas com a mesma dose em todas elas promete progressão e não entrega.\n" +
      "  E o descanso tem que sair da faixa que vale para o NÍVEL, não da faixa base.\n",
  );
  process.exit(1);
}

const falhaPerfil = verificarDoseVemDoPerfil();
if (falhaPerfil.length) {
  console.error("\n[check:progressao] A DOSE NÃO NASCE DO PERFIL:\n");
  for (const p of falhaPerfil) console.error(`  - ${p}`);
  console.error(
    "\n  Perfil e condição pesam mais que o objetivo na construção das variáveis do treino.\n" +
      "  Ver GroupGpsRule.modDose e doseDoPerfil.\n",
  );
  process.exit(1);
}

const falhaDescargaSessao = verificarDescargaNaSessao();
if (falhaDescargaSessao.length) {
  console.error("\n[check:progressao] DESCARGA QUE NÃO ALIVIA A SESSÃO:\n");
  for (const p of falhaDescargaSessao) console.error(`  - ${p}`);
  console.error(
    "\n  Tirar uma sessão da semana não é descarregar a sessão. A sessão de descarga tem que ficar\n" +
      "  abaixo da sessão de carga mais leve do próprio bloco, em qualquer modelo.\n",
  );
  process.exit(1);
}

const falhaTeto = verificarTetoDePSE();
if (falhaTeto.length) {
  console.error("\n[check:progressao] TETO DE PSE DECLARADO E NÃO APLICADO:\n");
  for (const p of falhaTeto) console.error(`  - ${p}`);
  console.error(
    "\n  O teto do perfil clínico tem que rebaixar o alvo PRESCRITO, não só o texto do semáforo" +
      " e a autorregulação da execução. Ver CtxAlvo.pseTeto.\n",
  );
  process.exit(1);
}

const falhaDescarga = verificarDescargaClinica();
if (falhaDescarga.length) {
  console.error("\n[check:progressao] DESCARGA AUSENTE NO PLANO CLÍNICO:\n");
  for (const p of falhaDescarga) console.error(`  - ${p}`);
  console.error(
    "\n  Quem tem condição clínica não pode receber MENOS recuperação que quem não tem." +
      " Se a cadência da casa mudar, mude nos dois caminhos: esta asserção compara um com o outro.\n",
  );
  process.exit(1);
}

const falhaSupressao = verificarSupressaoDeFC();
if (falhaSupressao.length) {
  console.error("\n[check:progressao] SUPRESSÃO DA ZONA DE FC QUEBRADA:\n");
  for (const p of falhaSupressao) console.error(`  - ${p}`);
  console.error(
    "\n  Quando a frequência cardíaca não guia este aluno, a zona SAI do plano e o alvo cai em duração" +
      " mais percepção de esforço. Corrigir a FC por um fator seria inventar número clínico.\n",
  );
  process.exit(1);
}

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
console.log(
  `[check:progressao] supressão da zona de FC OK: com "p-fc" invalidado nenhum bloco traz zona, a nota explica, e sem o campo a saída não muda.`,
);
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
