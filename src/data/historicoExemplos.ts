/**
 * O HISTÓRICO INTEIRO DOS ALUNOS DE EXEMPLO, ATÉ HOJE.
 *
 * "Carregar exemplos" põe os alunos na carteira com o que eles tinham no dia do clique. Uma
 * semana depois a carteira já parece abandonada: reavaliação vencida, "parou de registrar",
 * plano que ninguém executa, perfil pela metade. Para quem usa os exemplos para gravar,
 * apresentar ou simplesmente explorar, isso mostra um produto vazio.
 *
 * Esta função completa, para cada aluno de exemplo, o que um acompanhamento real de alguns
 * meses deixaria: o perfil respondido nos seis passos, avaliações em série com medidas,
 * perímetros e testes, um plano gerado pelo MOTOR (quando o aluno ainda não tem), cada sessão
 * vivida registrada série a série com carga, repetições e esforço, a PSE de cada sessão e o
 * semáforo respondido antes das sessões de quem tem condição de saúde.
 *
 * TRÊS REGRAS, e os porquês:
 *
 * 1. SÓ ALUNO DE EXEMPLO. A função ignora qualquer aluno que não seja um dos exemplos (ids
 *    de `seedAlunos` e dos casos do VSL). Inventar histórico para um aluno real seria forjar
 *    prontuário, e é exatamente o que este produto existe para impedir.
 * 2. O QUE JÁ EXISTE MANDA. Nenhuma resposta, medida ou registro existente é trocado: o perfil
 *    só ganha o que falta, a avaliação existente só ganha as medidas que não tinha, e a sessão
 *    que já tem registro não ganha outro. Rodar de novo não duplica nada (ids fixos) e só
 *    acrescenta o que o tempo passado desde a última vez criou.
 * 3. O PLANO É DO MOTOR, os números são do aluno. O plano sai de `planoDoAluno`, o mesmo
 *    caminho da demo do VSL e da tela de prescrição. Cargas, medidas e testes são dado de
 *    aluno fictício: plausíveis, determinísticos (derivados do id) e com a direção que o
 *    objetivo daria, e nunca afirmação do produto sobre o que o treino produz.
 */
import type { Aluno, Avaliacao, AvaliacaoPerimetro, AvaliacaoTeste, Liberacao } from "@/data/alunos";
import { seedAlunos } from "@/data/alunos";
import type { BlocoSessao, PlanoTreino } from "@/data/periodizacao";
import { totalSeriesDe, type Execucao, type SessaoFeedback } from "@/data/execucao";
import { criarFarmaco, type FarmacoClasseId, type FarmacoSelecionado } from "@/data/farmacos";
import { getExercise } from "@/data/exercises";
import { montarChecklist } from "@/data/semaforo";
import { criarRestricao } from "@/lib/gps/restricoes";
import { planoDoAluno, responderSemaforo } from "@/data/semearDemo";

const MIN = 60_000;
const HORA = 60 * MIN;
const DIA = 24 * HORA;
const MES = 30 * DIA;

/** Os alunos que esta função pode tocar: os exemplos, e nenhum outro. */
const IDS_DOS_EXEMPLOS = new Set([...seedAlunos.map((a) => a.id), "al-vsl-helena", "al-vsl-antonio"]);
export const ehAlunoDeExemplo = (id: string) => IDS_DOS_EXEMPLOS.has(id);

/** Hash pequeno e estável: o mesmo aluno sempre recebe as mesmas medidas e cargas. */
const hash = (s: string) => {
  let h = 5381;
  for (const c of s) h = ((h * 33) ^ c.charCodeAt(0)) >>> 0;
  return h;
};
/** Ruído determinístico em [-1, 1]. */
const ruido = (s: string) => ((hash(s) % 201) - 100) / 100;
const arred = (v: number, casas: number) => Math.round(v * 10 ** casas) / 10 ** casas;
const entre = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export interface EstadoDaCarteira {
  alunos: Aluno[];
  avaliacoes: Avaliacao[];
  planos: PlanoTreino[];
  liberacoes: Liberacao[];
  execucoes: Execucao[];
  sessaoFeedbacks: SessaoFeedback[];
}

/** Só o que precisa ser gravado: registros novos e registros existentes que ganharam campo. */
export interface HistoricoGerado {
  alunos: Aluno[];
  avaliacoes: Avaliacao[];
  planos: PlanoTreino[];
  liberacoes: Liberacao[];
  execucoes: Execucao[];
  feedbacks: SessaoFeedback[];
}

export function completarHistoricoDosExemplos(
  estado: EstadoDaCarteira,
  opts: { reavaliacaoDias: number; agora?: number },
): HistoricoGerado {
  const agora = opts.agora ?? Date.now();
  const saida: HistoricoGerado = { alunos: [], avaliacoes: [], planos: [], liberacoes: [], execucoes: [], feedbacks: [] };

  for (const original of estado.alunos) {
    if (!ehAlunoDeExemplo(original.id) || original.status !== "ativo") continue;
    const perfil = completarPerfil(original);

    const avsExistentes = estado.avaliacoes.filter((a) => a.alunoId === perfil.id);

    let plano = estado.planos.find((p) => p.alunoId === perfil.id && p.status === "ativo");
    if (!plano) {
      plano = planoDoAluno(perfil, avsExistentes, {
        semanas: 12,
        frequencia: 3,
        dataMs: inicioDoPlano(perfil, agora),
        disponibilidade: DISPONIBILIDADE[hash(perfil.id) % DISPONIBILIDADE.length],
      });
      saida.planos.push(plano);
    }

    // As datas que o próprio plano marca para avaliar: a véspera do início e o fim de cada
    // mesociclo com reavaliação que já passou. "Fiz todas as avaliações" quer dizer estas.
    const marcos = [
      plano.data - 2 * DIA,
      ...plano.macrociclo.mesociclos
        .filter((m) => m.reavaliacao)
        .map((m) => plano!.data + m.semanaFim * 7 * DIA - DIA)
        .filter((t) => t < agora - DIA),
    ];
    const avs = completarAvaliacoes(perfil, avsExistentes, agora, marcos);
    saida.avaliacoes.push(...avs.gravar);

    const vivido = viverPlano(perfil, plano, estado, agora);
    saida.execucoes.push(...vivido.execucoes);
    saida.feedbacks.push(...vivido.feedbacks);
    saida.liberacoes.push(...semaforosDasSessoes(perfil, vivido.sessoes, estado, agora));

    const ultima = Math.max(...avs.todas.map((a) => a.data));
    saida.alunos.push({
      ...perfil,
      ultimaAvaliacaoEm: ultima,
      proximaReavaliacaoEm: ultima + opts.reavaliacaoDias * DIA,
    });
  }
  return saida;
}

/* ================================ Perfil ================================= */

/**
 * Os seis passos do perfil respondidos, sem trocar nenhuma resposta dada. Onde o exemplo
 * nunca foi perguntado, entra a resposta que um profissional daria para aquele caso: quem tem
 * hipertensão declara a classe do anti-hipertensivo; quem não tem condição nem restrição
 * declara isso; quem não tem medicação a declarar fica em "não informado", que é a única
 * resposta de "nada" que o perfil aceita para medicação.
 */
function completarPerfil(a: Aluno): Aluno {
  const grupos = [a.grupoEspecial, ...(a.condicoesAtencao ?? [])].filter(Boolean) as string[];
  const temCondicao = grupos.length > 0;

  let farmacos: FarmacoSelecionado[] | undefined = a.farmacos?.map((f) => ({
    ...f,
    fonte: f.fonte ?? "receita",
    mudancaRecente: f.mudancaRecente ?? "nao",
  }));
  let farmacosNaoInformado = a.farmacosNaoInformado;
  if (!farmacos?.length && !farmacosNaoInformado) {
    const classe: FarmacoClasseId | undefined = grupos.some((g) => g.startsWith("hipertensao"))
      ? hash(a.id) % 2
        ? "bra"
        : "ieca"
      : grupos.some((g) => g.includes("diabetes"))
        ? "metformina"
        : undefined;
    if (classe) farmacos = [criarFarmaco(classe, { fonte: "receita", mudancaRecente: "nao" })];
    else farmacosNaoInformado = true;
  }

  return {
    ...a,
    restricoes: a.restricoes.length ? a.restricoes : [criarRestricao("nenhuma_restricao")],
    semCondicaoDeclarada: temCondicao ? a.semCondicaoDeclarada : true,
    farmacos: farmacos?.length ? farmacos : undefined,
    farmacosNaoInformado: farmacos?.length ? undefined : farmacosNaoInformado,
    perfilConfirmado: [...new Set([...(a.perfilConfirmado ?? []), "equipamentos", "notas"])],
    nivelDesde: a.nivelDesde ?? a.criadoEm,
    observacoes: a.observacoes?.trim() ? a.observacoes : `Acompanhamento com foco em ${a.objetivo.toLowerCase()}.`,
  };
}

/* ============================== Avaliações =============================== */

type Chave =
  | "peso"
  | "percentualGordura"
  | "altura"
  | "fcRepouso"
  | "pressaoSistolica"
  | "pressaoDiastolica"
  | "fadiga"
  | "sono";

interface Tendencia {
  base: number;
  /** variação por mês de acompanhamento */
  porMes: number;
  casas: number;
  ruido: number;
  min: number;
  max: number;
}

/** A direção de cada medida vem do objetivo e das condições do aluno. */
function tendencias(a: Aluno): Record<Chave, Tendencia> {
  const f = a.sexo === "F";
  const h = hash(a.id);
  const grupos = [a.grupoEspecial, ...(a.condicoesAtencao ?? [])].filter(Boolean) as string[];
  const hipertenso = grupos.some((g) => g.startsWith("hipertensao"));
  const pesoPorMes: Record<string, number> = {
    Emagrecimento: -1.2,
    Hipertrofia: 0.3,
    Força: 0.2,
    "Resistência muscular": -0.5,
    "Retorno ao treino": -0.4,
  };
  const gorduraPorMes: Record<string, number> = { Emagrecimento: -0.9, Hipertrofia: -0.5, Força: -0.3 };
  return {
    peso: { base: (f ? 66 : 84) + ((h % 13) - 6), porMes: pesoPorMes[a.objetivo] ?? -0.2, casas: 1, ruido: 0.3, min: 45, max: 140 },
    percentualGordura: {
      base: (f ? 30 : 24) + ((h % 7) - 3),
      porMes: gorduraPorMes[a.objetivo] ?? -0.4,
      casas: 1,
      ruido: 0.3,
      min: f ? 16 : 9,
      max: 50,
    },
    altura: { base: (f ? 163 : 176) + ((h % 11) - 5), porMes: 0, casas: 0, ruido: 0, min: 140, max: 210 },
    fcRepouso: { base: 63 + (h % 10) + ((a.idade ?? 40) > 55 ? 2 : 0), porMes: -0.6, casas: 0, ruido: 1, min: 55, max: 95 },
    pressaoSistolica: hipertenso
      ? { base: 138 + (h % 6), porMes: -1.6, casas: 0, ruido: 1.5, min: 124, max: 170 }
      : { base: 114 + (h % 8), porMes: -0.2, casas: 0, ruido: 1.5, min: 100, max: 135 },
    pressaoDiastolica: hipertenso
      ? { base: 88 + (h % 4), porMes: -0.9, casas: 0, ruido: 1, min: 78, max: 105 }
      : { base: 73 + (h % 6), porMes: -0.1, casas: 0, ruido: 1, min: 62, max: 85 },
    fadiga: { base: 5, porMes: -0.5, casas: 0, ruido: 0.6, min: 2, max: 8 },
    sono: { base: 6, porMes: 0.3, casas: 0, ruido: 0.6, min: 5, max: 9 },
  };
}

/**
 * O valor de uma medida numa data: segue as medidas que o exemplo JÁ TEM (interpolando entre
 * elas) e, fora delas, a tendência do objetivo a partir da mais próxima. Assim a avaliação
 * nova continua a curva que o gráfico de evolução já desenhava, em vez de começar outra.
 */
function valorNaData(chave: Chave, t: number, tend: Tendencia, ancoras: { data: number; valor: number }[], inicio: number, semente: string): number {
  let v: number;
  if (!ancoras.length) v = tend.base + (tend.porMes * (t - inicio)) / MES;
  else if (t <= ancoras[0].data) v = ancoras[0].valor + (tend.porMes * (t - ancoras[0].data)) / MES;
  else if (t >= ancoras[ancoras.length - 1].data) {
    const u = ancoras[ancoras.length - 1];
    v = u.valor + (tend.porMes * (t - u.data)) / MES;
  } else {
    const i = ancoras.findIndex((p) => p.data >= t);
    const [p, q] = [ancoras[i - 1], ancoras[i]];
    v = p.valor + ((q.valor - p.valor) * (t - p.data)) / (q.data - p.data);
  }
  return arred(entre(v + ruido(`${semente}|${chave}|${t}`) * tend.ruido, tend.min, tend.max), tend.casas);
}

const CHAVES: Chave[] = ["peso", "percentualGordura", "altura", "fcRepouso", "pressaoSistolica", "pressaoDiastolica", "fadiga", "sono"];

function medidasNaData(a: Aluno, t: number, existentes: Avaliacao[], inicio: number): Avaliacao["medidas"] {
  const tend = tendencias(a);
  const m: Record<string, number> = {};
  for (const k of CHAVES) {
    const ancoras = existentes
      .filter((av) => typeof av.medidas[k] === "number")
      .map((av) => ({ data: av.data, valor: av.medidas[k] as number }))
      .sort((x, y) => x.data - y.data);
    m[k] = valorNaData(k, t, tend[k], ancoras, inicio, a.id);
  }
  // Derivadas das medidas acima, para nunca se contradizerem.
  const f = a.sexo === "F";
  const magra = m.peso * (1 - m.percentualGordura / 100);
  m.massaMuscular = arred(magra * 0.52, 1);
  m.cintura = arred(
    f ? 0.42 * m.altura + (m.percentualGordura - 25) * 0.8 + (m.peso - 62) * 0.4 : 0.47 * m.altura + (m.percentualGordura - 20) * 0.8 + (m.peso - 78) * 0.4,
    1,
  );
  m.quadril = arred(f ? 0.58 * m.altura + (m.peso - 62) * 0.5 + (m.percentualGordura - 25) * 0.3 : 0.55 * m.altura + (m.peso - 78) * 0.45, 1);
  m.imc = arred(m.peso / (m.altura / 100) ** 2, 1);
  return m;
}

/** Dor percebida: quem tem restrição ou condição dolorosa começa com dor e melhora. */
function dorNaData(a: Aluno, t: number, inicio: number, existentes: Avaliacao[]): { dor: number; regioes?: string[] } {
  const tags = a.restricoes.map((r) => r.tag as string);
  const regioes: string[] = [];
  if (tags.some((t) => t.startsWith("joelho")) || a.grupoEspecial === "osteoartrite-joelho") regioes.push("Joelho direito");
  if (tags.some((t) => t.startsWith("lombar")) || a.condicoesAtencao?.includes("dor-lombar-inespecifica") || a.grupoEspecial === "dor-lombar-inespecifica")
    regioes.push("Região lombar");
  if (tags.some((t) => t.startsWith("ombro"))) regioes.push("Ombro direito");
  if (!regioes.length) return { dor: 0 };
  const tendencia = Math.round(entre(4 - (0.7 * (t - inicio)) / MES, 1, 6));
  // a dor nunca volta a subir acima da última que o exemplo já registrou antes desta data
  const anterior = existentes
    .filter((e) => e.data < t && e.dorEscala != null)
    .sort((x, y) => y.data - x.data)[0]?.dorEscala;
  return { dor: anterior != null ? Math.min(anterior, tendencia) : tendencia, regioes };
}

function perimetrosNaData(a: Aluno, m: Avaliacao["medidas"], meses: number): AvaliacaoPerimetro[] {
  const f = a.sexo === "F";
  const ganho = a.objetivo === "Hipertrofia" || a.objetivo === "Força" ? 0.15 : 0.05;
  const braco = arred((f ? 27.5 : 33.5) + ((m.peso ?? 70) - (f ? 66 : 84)) * 0.12 + ganho * meses, 1);
  const coxa = arred((f ? 54 : 56) + ((m.peso ?? 70) - (f ? 66 : 84)) * 0.25 + ganho * meses, 1);
  return [
    { regiao: "Braço contraído", lado: "Ambos", valor: braco, valorEsq: arred(braco - 0.4, 1) },
    { regiao: "Coxa medial", lado: "Ambos", valor: coxa, valorEsq: arred(coxa - 0.3, 1) },
    { regiao: "Abdômen", lado: "NA", valor: arred((m.cintura ?? 85) + 3.5, 1) },
    { regiao: "Panturrilha", lado: "Ambos", valor: arred((f ? 35 : 37.5) + ganho * meses * 0.5, 1), valorEsq: arred((f ? 35 : 37.5) - 0.2, 1) },
  ];
}

function testesNaData(a: Aluno, meses: number): AvaliacaoTeste[] {
  const f = a.sexo === "F";
  const idade = a.idade ?? 40;
  const h = hash(a.id);
  const joelho = a.restricoes.some((r) => (r.tag as string).startsWith("joelho"));
  const testes: AvaliacaoTeste[] = [
    {
      categoria: "Força",
      nome: "Dinamometria de preensão manual",
      resultado: String(arred((f ? 26 : 40) - (idade > 60 ? 6 : 0) + (h % 5) + 0.3 * meses, 1)),
      unidade: "kg",
      lado: "D",
    },
    {
      categoria: "Flexibilidade",
      nome: "Sentar e alcançar",
      resultado: String(Math.round((f ? 24 : 18) + (h % 6) + 0.6 * meses)),
      unidade: "centímetros",
      lado: "NA",
    },
  ];
  if (idade >= 45) {
    testes.push({
      categoria: "Funcionalidade",
      nome: "Sentar e levantar em 30 segundos",
      resultado: String(Math.round((idade >= 65 ? 11 : 13) + (h % 3) + 0.7 * meses)),
      unidade: "repetições",
      lado: "NA",
    });
  }
  if (idade >= 45 || a.objetivo === "Emagrecimento" || a.objetivo === "Resistência muscular") {
    testes.push({
      categoria: "Capacidade cardiorrespiratória",
      nome: "Teste de caminhada de 6 minutos",
      resultado: String(Math.round(((idade >= 65 ? 430 : 485) + (h % 40) + 12 * meses) / 5) * 5),
      unidade: "metros",
      lado: "NA",
    });
  }
  if ((a.objetivo === "Força" || a.objetivo === "Hipertrofia") && !joelho) {
    testes.push({
      categoria: "Força",
      nome: "Teste de 5RM",
      resultado: String(Math.round(((f ? 90 : 140) * (a.nivel === "Intermediário" ? 1.25 : 1) + 4 * meses) / 5) * 5),
      unidade: "kg",
      lado: "NA",
      obs: "Leg press 45°",
    });
  }
  if (idade < 45) {
    testes.push({
      categoria: "Resistência muscular",
      nome: "Prancha isométrica",
      resultado: String(Math.round(40 + (h % 20) + 6 * meses)),
      unidade: "segundos",
      lado: "NA",
    });
  }
  return testes;
}

const OBS_REAVALIACAO = [
  "Boa aderência ao plano no período.",
  "Evolução consistente nos testes funcionais.",
  "Relata mais disposição no dia a dia.",
  "Mantém a frequência combinada. Segue o plano.",
];

/**
 * Avaliações a cada ~30 dias desde a entrada do aluno, a última há poucos dias. As datas que
 * caem perto de uma avaliação existente são puladas: ela já é o registro daquele momento.
 */
function completarAvaliacoes(
  a: Aluno,
  existentes: Avaliacao[],
  agora: number,
  marcos: number[],
): { gravar: Avaliacao[]; todas: Avaliacao[] } {
  // Quando a primeira avaliação existente já se declara o início do acompanhamento, a série
  // começa nela: uma "inicial" inventada antes dela desmentiria o que o exemplo já contava.
  const primeiraExistente = [...existentes].sort((x, y) => x.data - y.data)[0];
  const declaraInicio =
    primeiraExistente && (primeiraExistente.tipo === "inicial" || /início do acompanhamento|primeira avaliação/i.test(primeiraExistente.observacoes ?? ""));
  const inicio = declaraInicio ? primeiraExistente.data : a.criadoEm + 2 * DIA;
  // Antes do plano, uma avaliação por mês; do plano em diante, as datas que ele marca.
  const primeiroMarco = marcos.length ? Math.min(...marcos) : agora;
  const datas: number[] = [];
  for (let t = inicio; t <= Math.min(agora - 6 * DIA, primeiroMarco - 20 * DIA); t += 30 * DIA + (hash(`${a.id}${t}`) % 5) * DIA)
    datas.push(t);
  datas.push(...marcos.filter((t) => t >= inicio - DIA));
  const livres: number[] = [];
  for (const t of datas.sort((x, y) => x - y))
    if (existentes.every((e) => Math.abs(e.data - t) > 12 * DIA) && livres.every((l) => Math.abs(l - t) > 12 * DIA)) livres.push(t);
  // A mais recente, contando as existentes, tem de ser dos últimos dias: é o que põe a
  // reavaliação em dia. A conta vem DEPOIS do filtro, senão uma data descartada por cair
  // perto de uma existente passaria por "recente" e o aluno ficaria com a última vencida.
  const maisRecente = Math.max(0, ...livres, ...existentes.map((e) => e.data));
  if (maisRecente < agora - 14 * DIA) livres.push(agora - (2 + (hash(a.id) % 5)) * DIA);

  // O id carrega o DIA, e não a posição na lista: numa segunda rodada a lista muda (as de
  // antes viram existentes) e um id por posição sobrescreveria a avaliação de outro dia.
  const idDoDia = (t: number) => new Date(t).toISOString().slice(0, 10).replace(/-/g, "");
  const novas: Avaliacao[] = livres.map((t) => ({ id: `av-hist-${a.id}-${idDoDia(t)}`, alunoId: a.id, data: t, medidas: {} }));
  const todas = [...existentes, ...novas].sort((x, y) => x.data - y.data);
  const primeira = todas[0]?.data;

  const gravar: Avaliacao[] = [];
  const completas: Avaliacao[] = [];
  for (const av of todas) {
    const nova = novas.includes(av);
    const meses = (av.data - inicio) / MES;
    const m = medidasNaData(a, av.data, existentes, inicio);
    const dor = dorNaData(a, av.data, inicio, existentes);
    const completa: Avaliacao = {
      ...av,
      // o que a avaliação existente mediu fica; as medidas que faltavam entram
      medidas: { ...m, ...av.medidas },
      dorEscala: av.dorEscala ?? dor.dor,
      regioesDor: av.regioesDor ?? (dor.dor > 0 ? dor.regioes : undefined),
      tipo: av.tipo ?? (av.data === primeira ? "inicial" : "reavaliacao"),
      condicao: av.condicao ?? "Em repouso",
      perimetros: av.perimetros?.length ? av.perimetros : perimetrosNaData(a, { ...m, ...av.medidas }, meses),
      testes: av.testes?.length ? av.testes : testesNaData(a, meses),
      observacoes:
        av.observacoes ??
        (nova ? (av.data === primeira ? "Início do acompanhamento." : OBS_REAVALIACAO[hash(`${a.id}${av.data}`) % OBS_REAVALIACAO.length]) : undefined),
    };
    if (nova || JSON.stringify(completa) !== JSON.stringify(av)) gravar.push(completa);
    completas.push(completa);
  }
  return { gravar, todas: completas };
}

/* ================================= Plano ================================= */

const DISPONIBILIDADE = ["Seg, qua e sex, cerca de 60 min", "Ter, qui e sáb pela manhã, 50 min", "Seg, qua e sex no fim da tarde, 55 min"];

/** Quando o plano novo começa: cedo o bastante para ter história, dentro das 12 semanas. */
function inicioDoPlano(a: Aluno, agora: number): number {
  const semanasAtras = 6 + (hash(a.id) % 5); // entre a 7ª e a 11ª semana hoje
  const inicio = Math.max(a.criadoEm + 4 * DIA, agora - semanasAtras * 7 * DIA);
  const d = new Date(Math.min(inicio, agora - 7 * DIA));
  d.setHours(8, 0, 0, 0);
  return d.getTime();
}

/** Dias da semana (a partir do primeiro dia do plano) em que cada sessão cai. */
const DIAS_DA_SESSAO: Record<number, number[]> = { 1: [0], 2: [0, 3], 3: [0, 2, 4], 4: [0, 1, 3, 4], 5: [0, 1, 2, 3, 4] };

const OBS_SESSAO = [
  "Consegui manter a carga em todas as séries.",
  "Hoje rendeu bem.",
  "Dormi pouco, fiz com menos intensidade.",
  "Cheguei com pouca energia, mas completei.",
  "Subi a carga no último exercício.",
  "Treino tranquilo, sem desconforto.",
];

const numeroDaFaixa = (txt?: string) => {
  const m = /(\d+)/.exec(txt ?? "");
  return m ? Number(m[1]) : undefined;
};

/** Carga-base por equipamento, estável por aluno e exercício. Peso corporal não tem kg. */
function cargaBase(a: Aluno, slug: string, equipamento?: string): number | undefined {
  if (!equipamento || equipamento === "Peso corporal") return undefined;
  const f = a.sexo === "F";
  const escala = (f ? 0.7 : 1) * (a.nivel === "Intermediário" ? 1.3 : a.nivel === "Avançado" ? 1.6 : 1) * ((a.idade ?? 40) > 60 ? 0.8 : 1);
  const h = hash(`${a.id}|${slug}`);
  const faixa: Record<string, [number, number]> = { Máquina: [25, 60], Barra: [20, 50], Halter: [6, 16], Polia: [10, 30] };
  const [min, max] = faixa[equipamento] ?? [8, 24];
  return (min + (h % (max - min + 1))) * escala;
}

const passoDaCarga = (equipamento?: string) => (equipamento === "Halter" ? 1 : equipamento === "Máquina" ? 5 : 2.5);

interface SessaoVivida {
  quando: number;
  semana: number;
  sessaoId: string;
}

/**
 * As semanas já vividas do plano, série a série, até agora. Sessão com qualquer registro
 * existente fica como está. Uma sessão em doze falha (fora das duas últimas semanas), porque
 * histórico sem nenhuma falta não parece histórico.
 */
function viverPlano(
  a: Aluno,
  plano: PlanoTreino,
  estado: EstadoDaCarteira,
  agora: number,
): { execucoes: Execucao[]; feedbacks: SessaoFeedback[]; sessoes: SessaoVivida[] } {
  const execucoes: Execucao[] = [];
  const feedbacks: SessaoFeedback[] = [];
  const sessoes: SessaoVivida[] = [];
  const dia0 = new Date(plano.data);
  dia0.setHours(0, 0, 0, 0);
  const hora = (hash(a.id) % 2 ? 7 : 18) * HORA + (hash(a.id) % 3) * 30 * MIN;
  const execPorId = new Map(estado.execucoes.map((e) => [e.id, e] as const));
  const fbPorId = new Map(estado.sessaoFeedbacks.map((f) => [f.id, f] as const));
  // Comparação sem depender da ordem das chaves nem de campo `undefined`: o registro que volta
  // da nuvem é remontado campo a campo por outro código.
  const canon = (o: object) =>
    JSON.stringify(
      Object.entries(o)
        .filter(([, v]) => v !== undefined)
        .sort(([x], [y]) => x.localeCompare(y)),
    );
  const mudou = (novo: object, velho?: object) => !velho || canon(novo) !== canon(velho);

  let cargasVividas = 0;
  for (const meso of plano.macrociclo.mesociclos) {
    for (const micro of meso.microciclos) {
      const descarga = micro.tipo !== "carga";
      if (!descarga) cargasVividas++;
      /*
       * COMPLEMENTO É O QUE CABE NO DIA DE OUTRA SESSÃO. Plano novo marca isso em `complemento`;
       * plano gerado antes do campo não marca, e a sessão isométrica da pressão (só blocos
       * isométricos de protocolo) virava um dia de treino próprio: Antônio e Helena saíram
       * com "6 treinos, prevê 3". A regra de reconhecer a sessão isométrica é a mesma de
       * `rotuloFrequencia` em periodizacao.ts.
       */
      const ehComplemento = (s: (typeof micro.sessoes)[number]) =>
        Boolean(s.complemento) || (s.blocos.length > 0 && s.blocos.every((b) => b.tipo === "isometrico" && !b.sustentado));
      const principais = micro.sessoes.filter((s) => !ehComplemento(s));
      const dias = DIAS_DA_SESSAO[principais.length] ?? principais.map((_, i) => i);
      micro.sessoes.forEach((sessao) => {
        const complemento = ehComplemento(sessao);
        // o complemento cabe no dia da primeira sessão principal da semana
        const idx = complemento ? 0 : principais.indexOf(sessao);
        const quando = dia0.getTime() + ((micro.semana - 1) * 7 + (dias[idx] ?? idx)) * DIA + hora + (complemento ? 70 * MIN : 0);
        if (quando > agora - 2 * HORA) return;
        const faltou = hash(`${a.id}|${micro.semana}|${sessao.id}`) % 12 === 0 && quando < agora - 14 * DIA;
        if (faltou) return;
        sessoes.push({ quando, semana: micro.semana, sessaoId: sessao.id });

        const execucoesDaSessao: Execucao[] = [];
        const rpes: number[] = [];
        sessao.blocos.forEach((b: BlocoSessao, bi) => {
          const inicioBloco = quando + bi * 7 * MIN;
          if (b.tipo === "aerobio") {
            // O aeróbio se conclui, não se dosa: o app grava só que ele foi feito, sem série,
            // carga nem esforço, e o registro daqui é igual ao do app.
            rpes.push(descarga ? 5 : 6);
            execucoesDaSessao.push({
              id: `ex-${b.id}-s${micro.semana}`,
              alunoId: a.id,
              planoId: plano.id,
              semana: micro.semana,
              sessaoRef: sessao.id,
              blocoRef: b.id,
              exercicioSlug: b.exercicioSlug,
              concluidoEm: inicioBloco + 20 * MIN,
            });
            return;
          }
          if (!b.exercicioSlug) return;
          const ex = getExercise(b.exercicioSlug);
          // a mesma contagem do app: dose em faixa se registra de uma vez, sem série inventada
          const series = totalSeriesDe(b);
          const reps = b.repsAlvo ?? numeroDaFaixa(b.reps) ?? 10;
          const base = cargaBase(a, b.exercicioSlug, ex?.equipamento);
          const fator = descarga ? 0.85 : 1 + 0.02 * Math.max(0, cargasVividas - 1);
          const passo = passoDaCarga(ex?.equipamento);
          for (let s = 1; s <= series; s++) {
            const tropeco = s === series && hash(`${b.id}|${micro.semana}`) % 4 === 0 ? 1 : 0;
            const rpe = entre(10 - (b.rirAlvo ?? 3) + (s === series ? 1 : 0) - (descarga ? 1 : 0), 5, 10);
            rpes.push(rpe);
            execucoesDaSessao.push({
              id: `ex-${b.id}-s${micro.semana}` + (series > 1 ? `-r${s}` : ""),
              alunoId: a.id,
              planoId: plano.id,
              semana: micro.semana,
              sessaoRef: sessao.id,
              blocoRef: b.id,
              exercicioSlug: b.exercicioSlug,
              serie: series > 1 ? s : undefined,
              cargaFeita: base != null ? Math.max(passo, Math.round((base * fator) / passo) * passo) : undefined,
              repsFeitas: Math.max(1, reps - tropeco),
              rpe,
              concluidoEm: inicioBloco + s * 2 * MIN,
            });
          }
        });
        if (!rpes.length) return;
        const media = rpes.reduce((x, y) => x + y, 0) / rpes.length;
        const temRecado = hash(`${sessao.id}|${micro.semana}|obs`) % 6 === 0;
        const feedback: SessaoFeedback = {
          id: `fb-${sessao.id}-s${micro.semana}`,
          alunoId: a.id,
          planoId: plano.id,
          semana: micro.semana,
          sessaoRef: sessao.id,
          pse: entre(Math.round(media - 1 + ruido(`${sessao.id}${micro.semana}`)), 3, 9),
          duracaoMin: complemento ? 12 + (hash(sessao.id) % 6) : 46 + (hash(`${sessao.id}${micro.semana}`) % 18),
          observacao: temRecado ? OBS_SESSAO[hash(`${a.id}${micro.semana}${sessao.id}`) % OBS_SESSAO.length] : undefined,
          concluidaEm: quando + (complemento ? 15 : 60) * MIN,
        };

        /*
         * O QUE JÁ EXISTE NESTA SESSÃO. Registro com id que esta função NÃO geraria é de outra
         * fonte (a demo do VSL, ou o próprio app), e a sessão fica como está. Registro com o id
         * que esta função gera é dela mesma numa rodada anterior: ele é reescrito quando a regra
         * mudou (foi assim que o dia errado das sessões isométricas se corrigiu) e ignorado
         * quando já está igual, para a segunda rodada seguir vazia.
         */
        const nossos = new Set([...execucoesDaSessao.map((e) => e.id), feedback.id]);
        const deOutraFonte =
          estado.execucoes.some((e) => e.planoId === plano.id && e.semana === micro.semana && e.sessaoRef === sessao.id && !nossos.has(e.id)) ||
          estado.sessaoFeedbacks.some((f) => f.planoId === plano.id && f.semana === micro.semana && f.sessaoRef === sessao.id && !nossos.has(f.id));
        if (deOutraFonte) return;
        execucoes.push(...execucoesDaSessao.filter((e) => mudou(e, execPorId.get(e.id))));
        if (mudou(feedback, fbPorId.get(feedback.id))) feedbacks.push(feedback);
      });
    }
  }
  return { execucoes, feedbacks, sessoes };
}

/**
 * O semáforo respondido minutos antes de cada sessão das últimas cinco semanas, para quem tem
 * condição de saúde (é quem tem checklist). O resultado sai de `avaliarSemaforo` pelas
 * respostas, como na tela: uma sessão em sete responde um item amarelo.
 */
function semaforosDasSessoes(a: Aluno, sessoes: SessaoVivida[], estado: EstadoDaCarteira, agora: number): Liberacao[] {
  if (!a.grupoEspecial) return [];
  const checklist = montarChecklist(a.grupoEspecial, a.farmacos);
  if (!checklist) return [];
  const dias = new Set<string>();
  const saida: Liberacao[] = [];
  for (const s of sessoes) {
    if (s.quando < agora - 35 * DIA) continue;
    const dia = new Date(s.quando).toDateString();
    if (dias.has(dia)) continue; // complemento no mesmo dia não pede outro semáforo
    dias.add(dia);
    const quando = s.quando - 10 * MIN;
    const jaTem = estado.liberacoes.some((l) => l.alunoId === a.id && new Date(l.data).toDateString() === dia);
    if (jaTem) continue;
    saida.push(responderSemaforo(checklist, a.id, quando, hash(`${a.id}${s.semana}${s.sessaoId}`) % 7 === 0));
  }
  return saida;
}
