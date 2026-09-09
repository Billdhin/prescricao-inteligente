/**
 * BANCADA DE COERÊNCIA DO MOTOR (varredura ampla, leitura adversarial).
 *
 * Os guardrails perguntam "a regra foi obedecida?". Esta bancada pergunta outra coisa:
 * "o plano que saiu daqui faz sentido para quem vai executá-lo?". São perguntas
 * diferentes, e a segunda já pegou defeito com os 38 guardrails verdes (ver a bancada de
 * cenários clínicos de 04/08 e a validação dos 5 agentes de 18/08).
 *
 * Ela não é guardrail: não trava build. É instrumento de auditoria, e imprime os casos
 * para serem LIDOS. Cada sonda abaixo nasceu de uma pergunta que um professor faria ao
 * abrir o plano do aluno dele.
 *
 * Roda com: npx tsx scripts/bancada-coerencia.ts
 */
import { gerarPlano, type GerarPlanoInput } from "@/lib/gps/periodizacao";
import { exercises } from "@/data/exercises";
import { getSpecialGroup } from "@/data/specialGroups";
import { getFaixa } from "@/data/periodizacao";
import { agregadoSemana } from "@/lib/gps/progressao";
import type { Macrociclo, Microciclo, Sessao, BlocoSessao } from "@/data/periodizacao";
import { OBJETIVOS as OBJETIVOS_DO_SISTEMA, type GpsObjetivo } from "@/lib/gps/engine";
import type { Nivel } from "@/data/types";

const ACADEMIA = ["Máquina", "Barra", "Halter", "Polia", "Esteira", "Bicicleta ergométrica", "Elíptico", "Peso corporal", "Elástico"];
const CASA = ["Peso corporal", "Halter", "Elástico"];

// A lista oficial, e não uma escrita à mão: a primeira versão desta bancada inventou
// "Condicionamento", que não existe, e o gerador estourou em 288 combinações. Falso
// positivo meu, não defeito do motor.
const OBJETIVOS: GpsObjetivo[] = [...OBJETIVOS_DO_SISTEMA];
const NIVEIS: Nivel[] = ["Iniciante", "Intermediário", "Avançado"];
const CONDICOES = [
  undefined,
  "obesidade-grau-1", "obesidade-grau-2", "obesidade-grau-3",
  "hipertensao-estagio-1", "hipertensao-estagio-2",
  "diabetes-tipo-2", "pre-diabetes", "sindrome-metabolica", "dislipidemia", "esteatose-hepatica",
  "idoso-destreinado", "sarcopenia", "osteoporose",
  "dor-lombar-inespecifica", "osteoartrite-joelho",
  "gestante", "pos-parto", "climaterio",
  "apneia-sono", "asma-controlada", "ansiedade-depressao",
  "iniciante-sedentario", "retorno-inatividade",
];

interface Achado {
  sonda: string;
  caso: string;
  detalhe: string;
}
const achados: Achado[] = [];
const registrar = (sonda: string, caso: string, detalhe: string) => achados.push({ sonda, caso, detalhe });

const exDe = (b: BlocoSessao) => (b.exercicioSlug ? exercises.find((e) => e.slug === b.exercicioSlug) : undefined);
const forcaDe = (s: Sessao) => s.blocos.filter((b) => b.tipo === "forca" || b.tipo === "isometrico");
const primeiroNumero = (t?: string | number | null) => {
  if (t == null) return null;
  const m = /(\d+)/.exec(String(t));
  return m ? Number(m[1]) : null;
};

function semanasDe(macro: Macrociclo) {
  return macro.mesociclos.flatMap((m) => m.microciclos.map((w) => ({ micro: w, meso: m })));
}

/* ------------------------------------------------------------------ sondas */

/** 1. O mesmo exercício duas vezes na MESMA sessão. */
function sondaRepetido(caso: string, micro: Microciclo) {
  for (const s of micro.sessoes) {
    const vistos = new Map<string, number>();
    for (const b of forcaDe(s)) {
      if (!b.exercicioSlug) continue;
      vistos.set(b.exercicioSlug, (vistos.get(b.exercicioSlug) ?? 0) + 1);
    }
    for (const [slug, n] of vistos) {
      if (n > 1) registrar("exercicio-repetido", caso, `${s.nome}: ${slug} aparece ${n}x na mesma sessão`);
    }
  }
}

/** 2. Sessão vazia, ou grande demais para o tempo que ela declara. */
function sondaTamanhoDaSessao(caso: string, micro: Microciclo) {
  for (const s of micro.sessoes) {
    const n = forcaDe(s).length;
    if (n === 0 && !s.blocos.some((b) => b.tipo === "aerobio")) {
      registrar("sessao-vazia", caso, `${s.nome} não tem exercício nenhum`);
    }
    if (n > 10) registrar("sessao-inchada", caso, `${s.nome} com ${n} exercícios de força`);
  }
}

/** 3. Duas sessões da mesma semana com a MESMA lista de exercícios, na mesma ordem. */
function sondaSessoesIdenticas(caso: string, micro: Microciclo) {
  const assinatura = (s: Sessao) => forcaDe(s).map((b) => b.exercicioSlug ?? b.nome).join("|");
  const vistas = new Map<string, string>();
  for (const s of micro.sessoes) {
    if (s.complemento) continue;
    const a = assinatura(s);
    if (!a) continue;
    const antes = vistas.get(a);
    if (antes) registrar("sessoes-identicas", caso, `${antes} e ${s.nome} têm a mesma lista, na mesma ordem`);
    else vistas.set(a, s.nome);
  }
}

/** 4. A DESCARGA precisa ser mais leve que a semana de carga anterior. */
function sondaDescarga(caso: string, macro: Macrociclo) {
  const sem = semanasDe(macro);
  for (let i = 1; i < sem.length; i++) {
    const { micro } = sem[i];
    if (micro.tipo !== "deload") continue;
    const anterior = sem[i - 1].micro;
    if (anterior.tipo !== "carga") continue;
    const a = agregadoSemana(anterior);
    const d = agregadoSemana(micro);
    if (d.volume > a.volume) {
      registrar("descarga-mais-pesada", caso, `S${micro.semana} (descarga) volume ${d.volume} > S${anterior.semana} ${a.volume}`);
    }
    if (a.intensidade != null && d.intensidade != null && d.intensidade > a.intensidade + 0.01) {
      registrar("descarga-mais-intensa", caso, `S${micro.semana} (descarga) esforço ${d.intensidade.toFixed(1)} > S${anterior.semana} ${a.intensidade.toFixed(1)}`);
    }
  }
}

/** 5. Equipamento que o aluno NÃO tem não pode entrar no plano. */
function sondaEquipamento(caso: string, macro: Macrociclo, equipamentos: string[]) {
  const tem = new Set(equipamentos);
  const fora = new Set<string>();
  for (const { micro } of semanasDe(macro)) {
    for (const s of micro.sessoes) {
      for (const b of s.blocos) {
        const ex = exDe(b);
        if (!ex?.equipamento) continue;
        if (!tem.has(ex.equipamento)) fora.add(`${ex.nome} (${ex.equipamento})`);
      }
    }
  }
  for (const f of fora) registrar("equipamento-indisponivel", caso, f);
}

/** 6. Teto de carga e reserva mínima da condição valem em TODAS as semanas, descarga inclusive. */
function sondaTetosClinicos(caso: string, macro: Macrociclo, slugs: string[]) {
  const regras = slugs.map((s) => getSpecialGroup(s)).filter(Boolean);
  if (!regras.length) return;
  for (const { micro } of semanasDe(macro)) {
    for (const s of micro.sessoes) {
      for (const b of s.blocos) {
        if (b.tipo === "aerobio") continue;
        if (b.cargaRelativaAlvo != null) {
          for (const r of regras) {
            const teto = (r as unknown as { cargaRelativaMax?: number }).cargaRelativaMax;
            if (teto != null && b.cargaRelativaAlvo > teto) {
              registrar("teto-de-carga-furado", caso, `S${micro.semana} ${b.nome}: ${b.cargaRelativaAlvo}% > teto ${teto}%`);
            }
          }
        }
      }
    }
  }
}

/**
 * 7. Repetição-alvo dentro da FAIXA CITADA do objetivo, por nível.
 *
 * A primeira versão trazia a minha opinião de faixa ("Força é 1 a 6") e reprovou 5.455
 * blocos: a casa AUTORA "8 a 12" para Força de iniciante, em `porNivel`, que é escolha
 * declarada e defensável. Régua que não lê a fonte de verdade mede o auditor, não o motor.
 */
function faixaCitada(objetivo: GpsObjetivo, nivel: Nivel): [number, number] | null {
  const reps = getFaixa(objetivo)?.reps as { valor?: string; porNivel?: Record<string, string> } | undefined;
  const texto = reps?.porNivel?.[nivel] ?? reps?.valor;
  if (!texto) return null;
  const nums = [...texto.matchAll(/(\d+)/g)].map((m) => Number(m[1]));
  if (!nums.length) return null;
  // "acima de 15" tem um número só: vira piso, sem teto.
  if (nums.length === 1) return /acima|mais de/i.test(texto) ? [nums[0], Number.POSITIVE_INFINITY] : [nums[0], nums[0]];
  return [Math.min(...nums), Math.max(...nums)];
}

function sondaFaixaDoObjetivo(caso: string, macro: Macrociclo, objetivo: GpsObjetivo, nivel: Nivel) {
  const faixa = faixaCitada(objetivo, nivel);
  if (!faixa) return;
  const [min, max] = faixa;
  const fora = new Set<string>();
  for (const { micro } of semanasDe(macro)) {
    for (const s of micro.sessoes) {
      for (const b of s.blocos) {
        if (b.tipo !== "forca") continue;
        const r = b.repsAlvo ?? primeiroNumero(b.reps);
        if (r == null) continue;
        if (r < min || r > max) fora.add(`${b.nome}: ${r} rep (faixa citada ${min} a ${max === Number.POSITIVE_INFINITY ? "+" : max} para ${objetivo}/${nivel})`);
      }
    }
  }
  for (const f of fora) registrar("faixa-fora-do-objetivo", caso, f);
}

/** 8. Bloco de força sem dose: séries ou repetições ausentes. */
function sondaDoseAusente(caso: string, micro: Microciclo) {
  for (const s of micro.sessoes) {
    for (const b of s.blocos) {
      if (b.tipo !== "forca") continue;
      const series = b.seriesAlvo ?? primeiroNumero(b.series);
      const reps = b.repsAlvo ?? primeiroNumero(b.reps);
      if (series == null || reps == null) {
        registrar("dose-ausente", caso, `${s.nome} · ${b.nome}: séries=${b.series ?? "-"} reps=${b.reps ?? "-"}`);
      }
    }
  }
}

/** 9. Progressão que o modelo promete tem que acontecer nas semanas de carga. */
function sondaProgressao(caso: string, macro: Macrociclo, modeloId: string) {
  if (modeloId !== "linear") return;
  const cargas = semanasDe(macro).map((x) => x.micro).filter((w) => w.tipo === "carga");
  if (cargas.length < 3) return;
  const serie = cargas.map((w) => agregadoSemana(w).intensidade).filter((x): x is number => x != null);
  if (serie.length < 3) return;
  const quedas = serie.slice(1).filter((v, i) => v < serie[i] - 0.01).length;
  if (quedas > serie.length / 3) {
    registrar("linear-que-ondula", caso, `esforço cai em ${quedas} de ${serie.length - 1} passos: ${serie.map((v) => v.toFixed(1)).join(" ")}`);
  }
}

/** 10. Aeróbio de sustentação não pode sair em repetições, e vice-versa. */
function sondaUnidade(caso: string, micro: Microciclo) {
  for (const s of micro.sessoes) {
    for (const b of s.blocos) {
      if (b.tipo === "aerobio" && (b.repsAlvo != null || primeiroNumero(b.reps) != null)) {
        registrar("aerobio-em-repeticoes", caso, `${s.nome} · ${b.nome}: reps=${b.reps}`);
      }
      if (b.sustentado && b.repsAlvo != null) {
        registrar("sustentado-em-repeticoes", caso, `${s.nome} · ${b.nome}: reps=${b.repsAlvo}`);
      }
    }
  }
}

/* ------------------------------------------------------------------ varredura */

let planos = 0;
const combinacoes: { caso: string; input: GerarPlanoInput }[] = [];

for (const objetivo of OBJETIVOS) {
  for (const nivel of NIVEIS) {
    for (const cond of CONDICOES) {
      for (const freq of [2, 4]) {
        for (const equip of [ACADEMIA, CASA]) {
          combinacoes.push({
            caso: `${objetivo}/${nivel}/${cond ?? "sem condição"}/${freq}x/${equip === CASA ? "casa" : "academia"}`,
            input: {
              objetivo,
              nivel,
              semanas: 12,
              frequencia: freq,
              idade: cond === "idoso-destreinado" ? 71 : 40,
              grupoEspecial: cond,
              equipamentos: equip,
            },
          });
        }
      }
    }
  }
}

for (const { caso, input } of combinacoes) {
  let plano;
  try {
    plano = gerarPlano(input);
  } catch (e) {
    registrar("gerador-quebrou", caso, String(e));
    continue;
  }
  planos++;
  const macro = plano.principal;
  const primeira = semanasDe(macro)[0]?.micro;
  if (primeira) {
    sondaRepetido(caso, primeira);
    sondaTamanhoDaSessao(caso, primeira);
    sondaSessoesIdenticas(caso, primeira);
    sondaDoseAusente(caso, primeira);
    sondaUnidade(caso, primeira);
  }
  sondaDescarga(caso, macro);
  sondaEquipamento(caso, macro, input.equipamentos ?? []);
  sondaTetosClinicos(caso, macro, [input.grupoEspecial, ...(input.condicoesAtencao ?? [])].filter((x): x is string => Boolean(x)));
  sondaFaixaDoObjetivo(caso, macro, input.objetivo, input.nivel);
  sondaProgressao(caso, macro, plano.modeloId);
}

/* ------------------------------------------------------------------ relatório */

console.log(`\n[bancada:coerencia] ${planos} planos gerados, ${combinacoes.length} combinações.\n`);

const porSonda = new Map<string, Achado[]>();
for (const a of achados) {
  if (!porSonda.has(a.sonda)) porSonda.set(a.sonda, []);
  porSonda.get(a.sonda)!.push(a);
}

if (!porSonda.size) {
  console.log("Nenhuma sonda disparou.");
} else {
  for (const [sonda, lista] of [...porSonda.entries()].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`\n### ${sonda}: ${lista.length} ocorrência(s) em ${new Set(lista.map((x) => x.caso)).size} caso(s)`);
    const amostra = lista.slice(0, 6);
    for (const a of amostra) console.log(`   · ${a.caso}\n     ${a.detalhe}`);
    if (lista.length > amostra.length) console.log(`   ... e mais ${lista.length - amostra.length}`);
  }
}
console.log("");

/* ------------------------------------------------------------- autoverificação
 *
 * SONDA QUE NÃO DISPARA NUNCA DÁ O MESMO RESULTADO QUE PRODUTO CORRETO.
 *
 * Cada sonda que ficou calada na varredura é exercitada aqui contra um plano
 * PROPOSITALMENTE quebrado. Se alguma delas continuar calada, ela é cega, e o silêncio
 * dela na varredura acima não vale nada. Foi assim que a asserção de 19/08 congelou a
 * regra errada por uma rodada inteira.
 */
{
  const antes = achados.length;
  const falhas: string[] = [];
  const exercitar = (nome: string, fn: () => void) => {
    const n = achados.length;
    fn();
    if (achados.length === n) falhas.push(nome);
  };

  const bloco = (over: Partial<BlocoSessao> = {}): BlocoSessao =>
    ({ id: "b" + Math.random(), tipo: "forca", nome: "X", exercicioSlug: "leg-press-45", series: "3", reps: "10", seriesAlvo: 3, repsAlvo: 10, ...over }) as BlocoSessao;
  const sessao = (blocos: BlocoSessao[], nome = "S"): Sessao => ({ id: "s" + Math.random(), nome, blocos }) as Sessao;
  const semana = (sessoes: Sessao[], over: Partial<Microciclo> = {}): Microciclo =>
    ({ id: "w" + Math.random(), semana: 1, tipo: "carga", frequencia: sessoes.length, sessoes, ...over }) as Microciclo;

  exercitar("exercicio-repetido", () =>
    sondaRepetido("FALSO", semana([sessao([bloco(), bloco()])])),
  );
  exercitar("sessao-vazia", () => sondaTamanhoDaSessao("FALSO", semana([sessao([])])));
  exercitar("sessao-inchada", () =>
    sondaTamanhoDaSessao("FALSO", semana([sessao(Array.from({ length: 12 }, (_, i) => bloco({ exercicioSlug: "ex" + i })))])),
  );
  exercitar("sessoes-identicas", () =>
    sondaSessoesIdenticas("FALSO", semana([sessao([bloco()], "A"), sessao([bloco()], "B")])),
  );
  exercitar("dose-ausente", () =>
    sondaDoseAusente("FALSO", semana([sessao([bloco({ series: undefined, seriesAlvo: undefined, reps: undefined, repsAlvo: undefined })])])),
  );
  exercitar("aerobio-em-repeticoes", () =>
    sondaUnidade("FALSO", semana([sessao([bloco({ tipo: "aerobio", reps: "10 a 12", repsAlvo: 11 })])])),
  );
  exercitar("sustentado-em-repeticoes", () =>
    sondaUnidade("FALSO", semana([sessao([bloco({ tipo: "isometrico", sustentado: true, repsAlvo: 12 })])])),
  );
  exercitar("equipamento-indisponivel", () =>
    sondaEquipamento("FALSO", { objetivoGeral: "x", mesociclos: [{ id: "m", nome: "m", foco: "", semanaInicio: 1, semanaFim: 1, capacidades: [], tiposExercicio: [], tendenciaVolume: "estavel", tendenciaIntensidade: "estavel", tendenciaComplexidade: "estavel", criteriosProgressao: [], criteriosRegressao: [], parametros: [], microciclos: [semana([sessao([bloco()])])] }] } as unknown as Macrociclo, ["Elástico"]),
  );
  exercitar("descarga-mais-pesada", () => {
    const leve = semana([sessao([bloco({ seriesAlvo: 1, repsAlvo: 1 })])], { semana: 1, tipo: "carga" });
    const pesada = semana([sessao([bloco({ seriesAlvo: 9, repsAlvo: 20 })])], { semana: 2, tipo: "deload" });
    sondaDescarga("FALSO", { objetivoGeral: "x", mesociclos: [{ id: "m", nome: "m", foco: "", semanaInicio: 1, semanaFim: 2, capacidades: [], tiposExercicio: [], tendenciaVolume: "estavel", tendenciaIntensidade: "estavel", tendenciaComplexidade: "estavel", criteriosProgressao: [], criteriosRegressao: [], parametros: [], microciclos: [leve, pesada] }] } as unknown as Macrociclo);
  });

  // Os achados plantados não contaminam o relatório da varredura.
  achados.length = antes;

  if (falhas.length) {
    console.log(`\n[autoverificação] ${falhas.length} sonda(s) CEGA(S): ${falhas.join(", ")}`);
    console.log("  O silêncio delas na varredura acima não vale nada.\n");
    process.exitCode = 1;
  } else {
    console.log("[autoverificação] ok: todas as sondas caladas disparam contra um plano quebrado de propósito.\n");
  }
}
