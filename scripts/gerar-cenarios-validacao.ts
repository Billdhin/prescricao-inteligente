/**
 * Gera os cenários de validação do motor (alunos inventados, planos REAIS do gerador) e
 * despeja tudo em JSON para o documento Word. Nada aqui é escrito à mão: todo número vem do
 * plano gerado, da regra fundida e das faixas citadas.
 */
import { writeFileSync } from "node:fs";
import {
  gerarPlano,
  consequenciasDoPlano,
  regraClinicaDoPlano,
  restricoesDoPlano,
  type GerarPlanoInput,
} from "@/lib/gps/periodizacao";
import { exercises } from "@/data/exercises";
import { getReferencia } from "@/data/referencias";
import { getModelo, FAIXAS_TREINO, BANDAS_AEROBIAS, MODELOS_PERIODIZACAO } from "@/data/periodizacao";
import { getModalidade } from "@/data/modalities";
import { getSpecialGroup } from "@/data/specialGroups";
import { revisaoClinicaPorCondicao } from "@/lib/gps/revisaoClinica";
import { groupGpsRules } from "@/lib/gps/groupRules";
import { doseDoPerfilComIdade, IDADE_DOSE_PROPRIA, RIR_MINIMO_IDADE } from "@/lib/gps/esforco";
import { rotuloRestricao, criarRestricao } from "@/lib/gps/restricoes";
import { padraoDe, PADROES_ESSENCIAIS } from "@/lib/gps/padroes";
import { agregadoSemana } from "@/lib/gps/progressao";
import { topicosDoRaciocinio } from "@/lib/gps/raciocinioTopicos";

const ACADEMIA = ["Máquina", "Barra", "Halter", "Polia", "Esteira", "Bicicleta ergométrica", "Elíptico", "Peso corporal", "Elástico"];
const CASA = ["Peso corporal", "Halter", "Elástico"];

interface Cenario {
  n: number;
  nome: string;
  perfil: string;
  porQueEsteCenario: string;
  input: GerarPlanoInput;
}

const cenarios: Cenario[] = [
  {
    n: 1, nome: "Mariana, 34 anos", perfil: "Mulher, 34 anos, treina há 2 anos, sem condição de saúde declarada. Quer hipertrofia. Academia completa.",
    porQueEsteCenario: "Linha de base: sem condição, o motor só tem objetivo, nível e frequência para decidir. Serve para conferir a semana ondulatória, a cota de perna e a cobertura dos cinco padrões.",
    input: { objetivo: "Hipertrofia", nivel: "Intermediário", semanas: 12, frequencia: 4, idade: 34, equipamentos: ACADEMIA },
  },
  {
    n: 2, nome: "Carlos, 52 anos", perfil: "Homem, 52 anos, sedentário, hipertensão estágio 2 e dislipidemia confirmadas no perfil. Quer emagrecer. Academia completa.",
    porQueEsteCenario: "Hipertensão é a condição com mais regras próprias: reserva mínima, teto de carga, protocolo isométrico em sessão própria, banda aeróbia e descarga mais frequente. A dislipidemia entra como segunda condição e a fusão precisa valer a mais conservadora.",
    input: { objetivo: "Emagrecimento", nivel: "Iniciante", semanas: 12, frequencia: 3, idade: 52, grupoEspecial: "hipertensao-estagio-2", condicoesAtencao: ["dislipidemia"], equipamentos: ACADEMIA },
  },
  {
    n: 3, nome: "Dona Lourdes, 71 anos", perfil: "Mulher, 71 anos, idosa destreinada com osteoporose diagnosticada. Retorno ao treino. Treina em casa com elásticos.",
    porQueEsteCenario: "Duas condições que indicam equilíbrio, mais a dose própria por idade (reserva mínima a partir dos 65). Osteoporose ainda evita flexão de coluna sob carga. Em casa, sem ir ao chão: o catálogo precisa ter opção para cada padrão.",
    input: { objetivo: "Retorno ao treino", nivel: "Iniciante", semanas: 8, frequencia: 2, idade: 71, grupoEspecial: "idoso-destreinado", condicoesAtencao: ["osteoporose"], equipamentos: ["Peso corporal", "Elástico"] },
  },
  {
    n: 4, nome: "Ana, 29 anos", perfil: "Mulher, 29 anos, gestante com liberação obstétrica, já treinava antes. Retorno ao treino em casa (halteres e elásticos).",
    porQueEsteCenario: "A gestante evita a posição deitada, não recebe isométrico por conta própria e recebe o assoalho pélvico em toda sessão. O teto de complexidade técnica e o esforço percebido também mudam.",
    input: { objetivo: "Retorno ao treino", nivel: "Iniciante", semanas: 8, frequencia: 3, idade: 29, grupoEspecial: "gestante", equipamentos: CASA },
  },
  {
    n: 5, nome: "Juliana, 33 anos", perfil: "Mulher, 33 anos, pós-parto com liberação, 4 meses depois do parto. Quer emagrecer. Treina em casa.",
    porQueEsteCenario: "Pós-parto: baixa tolerância a impacto, assoalho pélvico como parte do plano, e o Emagrecimento traz o aeróbio como base de toda sessão. Confere se o aeróbio respeita o impacto e se o assoalho entra em toda sessão.",
    input: { objetivo: "Emagrecimento", nivel: "Iniciante", semanas: 12, frequencia: 3, idade: 33, grupoEspecial: "pos-parto", equipamentos: CASA },
  },
  {
    n: 6, nome: "Roberto, 45 anos", perfil: "Homem, 45 anos, obesidade grau 3 e diabetes tipo 2, com dor no joelho declarada. Quer emagrecer. Não tem nenhum equipamento: só o peso do corpo.",
    porQueEsteCenario: "O cenário mais restritivo do catálogo: a condição proíbe ir ao chão, o joelho pede baixa demanda, e só há peso do corpo. Até 09/09/2026 este aluno saía sem nenhuma dobradiça de quadril. Também testa a rampa a partir do piso e a descarga a cada 3 semanas.",
    input: { objetivo: "Emagrecimento", nivel: "Iniciante", semanas: 12, frequencia: 3, idade: 45, grupoEspecial: "obesidade-grau-3", condicoesAtencao: ["diabetes-tipo-2"], restricoes: [criarRestricao("joelho_dor")], equipamentos: ["Peso corporal"] },
  },
  {
    n: 7, nome: "Pedro, 26 anos", perfil: "Homem, 26 anos, treina há 6 anos, sem condição. Quer força máxima. Academia completa.",
    porQueEsteCenario: "Extremo oposto do Roberto: avançado, sem restrição, faixa de força (poucas repetições, carga alta, intervalo longo). Confere que nenhuma regra clínica vaza para quem não tem condição e que a semana de força é ondulatória.",
    input: { objetivo: "Força", nivel: "Avançado", semanas: 12, frequencia: 4, idade: 26, equipamentos: ACADEMIA },
  },
  {
    n: 8, nome: "Fernanda, 40 anos", perfil: "Mulher, 40 anos, dor lombar inespecífica há 8 meses, com a lombar marcada como sensível no perfil. Quer resistência muscular. Academia completa.",
    porQueEsteCenario: "Dor lombar: o tronco é o que mais se prescreve, a demanda lombar dos exercícios pesa no ranking, e a restrição declarada soma com a da condição. Confere se o plano tem core em toda semana e se os exercícios de alta demanda lombar ficaram para trás.",
    input: { objetivo: "Resistência muscular", nivel: "Iniciante", semanas: 8, frequencia: 3, idade: 40, grupoEspecial: "dor-lombar-inespecifica", restricoes: [criarRestricao("lombar_sensivel")], equipamentos: ACADEMIA },
  },
  {
    n: 9, nome: "Sr. Antônio, 63 anos", perfil: "Homem, 63 anos, osteoartrite de joelho e obesidade grau 1. Quer emagrecer. Academia com piscina.",
    porQueEsteCenario: "Osteoartrite prefere modalidade aeróbia na água e penaliza demanda de joelho; a obesidade grau 1 soma. Com piscina declarada, o aeróbio deve trocar de modalidade e o plano deve dizer por quê.",
    input: { objetivo: "Emagrecimento", nivel: "Iniciante", semanas: 12, frequencia: 3, idade: 63, grupoEspecial: "osteoartrite-joelho", condicoesAtencao: ["obesidade-grau-1"], equipamentos: [...ACADEMIA, "Piscina"] },
  },
  {
    n: 10, nome: "Luís, 58 anos", perfil: "Homem, 58 anos, parou de treinar há 5 anos, pré-diabetes. Quer reaprender a técnica. Academia completa, 2 vezes por semana.",
    porQueEsteCenario: "Frequência 2 com objetivo de aprendizado: poucas vagas na semana, então a cobertura dos padrões e a regra do trabalho miúdo (nada de flexão de punho em semana curta) são o que se testa. Pré-diabetes entra como prevenção no isométrico.",
    input: { objetivo: "Aprendizado técnico", nivel: "Iniciante", semanas: 8, frequencia: 2, idade: 58, grupoEspecial: "retorno-inatividade", condicoesAtencao: ["pre-diabetes"], equipamentos: ACADEMIA },
  },
  {
    n: 11, nome: "Beatriz, 24 anos", perfil: "Mulher, 24 anos, treina há 1 ano, sem condição. Quer emagrecer treinando 5 vezes por semana. Academia completa.",
    porQueEsteCenario: "Frequência alta: é onde a cota de perna mais tende a estourar (a semana de 5x já saiu com 64% de inferiores na tela do Filipe). Confere a cota semanal e o aeróbio como base em toda sessão.",
    input: { objetivo: "Emagrecimento", nivel: "Intermediário", semanas: 12, frequencia: 5, idade: 24, equipamentos: ACADEMIA },
  },
  {
    n: 12, nome: "Cláudio, 68 anos", perfil: "Homem, 68 anos, sarcopenia diagnosticada, já fez musculação. Quer ganhar força. Academia completa.",
    porQueEsteCenario: "Sarcopenia pede força e intensidade moderada a alta; a idade impõe reserva mínima de 3. Confere que a dose de força respeita o piso da idade sem virar treino leve, e como os dois se fundem.",
    input: { objetivo: "Força", nivel: "Iniciante", semanas: 12, frequencia: 3, idade: 68, grupoEspecial: "sarcopenia", equipamentos: ACADEMIA },
  },
];

const REGIAO: Record<string, string> = {
  "Membros inferiores": "Inferiores", Peitorais: "Superiores", Costas: "Superiores", Ombros: "Superiores", Braços: "Superiores",
  "Core (tronco)": "Core", "Corpo todo": "Corpo todo", "Tornozelo e pé": "Inferiores", Pescoço: "Superiores",
};

const nomeEx = (slug?: string) => exercises.find((e) => e.slug === slug)?.nome ?? slug ?? "";

function bloco(b: (typeof exercises)[number] extends never ? never : any) {
  const ex = b.exercicioSlug ? exercises.find((e) => e.slug === b.exercicioSlug) : undefined;
  const base = {
    tipo: b.tipo, nome: ex?.nome ?? b.nome ?? getModalidade(b.modalidade ?? "")?.nome ?? "?", slug: b.exercicioSlug,
    padrao: ex ? padraoDe(ex) : undefined, regiao: ex ? REGIAO[ex.grupoMuscular] : undefined, familia: ex?.grupoMuscular,
    sustentado: !!b.sustentado, equilibrio: !!b.equilibrio, assoalho: !!b.assoalho,
    observacao: b.observacao,
  };
  if (b.tipo === "aerobio")
    return { ...base, modalidade: getModalidade(b.modalidade ?? "")?.nome, formato: b.formato, duracao: b.duracao, intensidade: b.intensidade, tiros: b.tiros, duracaoAlvoMin: b.duracaoAlvoMin, intensidadeAlvo: b.intensidadeAlvo };
  if (b.tipo === "isometrico")
    return { ...base, series: b.series, duracao: b.duracao, intervalo: b.intervalo ?? b.recuperacao, intensidade: b.intensidade };
  return { ...base, series: b.series, reps: b.reps, intensidade: b.intensidade, intervalo: b.intervalo, seriesAlvo: b.seriesAlvo, repsAlvo: b.repsAlvo, rirAlvo: b.rirAlvo, cargaRelativaAlvo: b.cargaRelativaAlvo, intervaloAlvoSeg: b.intervaloAlvoSeg, metodo: b.metodo };
}

function equilibrioDaSemana(sessoes: any[]) {
  const porRegiao = new Map<string, number>();
  let series = 0, minutosAerobio = 0, sessoesIso = 0, sessoesAssoalho = 0, sessoesEquilibrio = 0;
  for (const s of sessoes) for (const b of s.blocos) {
    if (b.assoalho) { sessoesAssoalho++; continue; }
    if (b.equilibrio) { sessoesEquilibrio++; continue; }
    if (b.tipo === "aerobio") { const m = /(\d+)/.exec(b.duracaoAlvoMin != null ? String(b.duracaoAlvoMin) : (b.duracao ?? "")); if (m) minutosAerobio += Number(m[1]); continue; }
    if (b.tipo === "isometrico" && !b.sustentado) { if (s.complemento) sessoesIso++; continue; }
    const ex = b.exercicioSlug ? exercises.find((e) => e.slug === b.exercicioSlug) : undefined;
    const regiao = ex ? (REGIAO[ex.grupoMuscular] ?? "Corpo todo") : "Sem classificação";
    const n = b.seriesAlvo ?? Number(/(\d+)/.exec(b.series ?? "")?.[1] ?? 0);
    if (!n) continue;
    series += n; porRegiao.set(regiao, (porRegiao.get(regiao) ?? 0) + n);
  }
  return { series, minutosAerobio, sessoesIso, sessoesAssoalho, sessoesEquilibrio, linhas: [...porRegiao.entries()].map(([regiao, n]) => ({ regiao, n, pct: series ? Math.round((n / series) * 100) : 0 })).sort((a, b) => b.n - a.n) };
}

const saida: any[] = [];
for (const c of cenarios) {
  const g = gerarPlano(c.input);
  const regra = regraClinicaDoPlano(c.input);
  const dose = doseDoPerfilComIdade(regra, c.input.idade);
  const cons = consequenciasDoPlano(c.input);
  const restr = restricoesDoPlano(c.input);
  const macro = g.principal;
  const semanas = macro.mesociclos.flatMap((m) => m.microciclos.map((w) => ({ meso: m.nome, ...w })));
  const w1 = semanas[0];
  const principais = w1.sessoes.filter((s: any) => !s.complemento);
  const blocosForca = principais.flatMap((s: any) => s.blocos).filter((b: any) => b.tipo === "forca" || (b.tipo === "isometrico" && b.sustentado));
  const dinamicos = blocosForca.filter((b: any) => b.tipo === "forca");
  const padroes = new Set(blocosForca.map((b: any) => { const ex = exercises.find((e) => e.slug === b.exercicioSlug); return ex ? padraoDe(ex) : undefined; }));
  const DE_PERNA = new Set(["joelho", "quadril", "panturrilha", "quadril-acessorio"]);
  const perna = dinamicos.filter((b: any) => DE_PERNA.has(padraoDe(exercises.find((e) => e.slug === b.exercicioSlug)!))).length;
  const faixa = FAIXAS_TREINO[c.input.objetivo];
  const progressao = semanas.map((w: any) => {
    const f = w.sessoes.filter((s: any) => !s.complemento).flatMap((s: any) => s.blocos).find((b: any) => b.tipo === "forca");
    const a = w.sessoes.flatMap((s: any) => s.blocos).find((b: any) => b.tipo === "aerobio");
    const ag = agregadoSemana(w);
    return { semana: w.semana, meso: w.meso, tipo: w.tipo, objetivo: w.objetivo, nota: w.nota, primeiroForca: f ? { nome: nomeEx(f.exercicioSlug), seriesAlvo: f.seriesAlvo, repsAlvo: f.repsAlvo, rirAlvo: f.rirAlvo, cargaRelativaAlvo: f.cargaRelativaAlvo, intervaloAlvoSeg: f.intervaloAlvoSeg } : null, aerobio: a ? { duracaoAlvoMin: a.duracaoAlvoMin, intensidadeAlvo: a.intensidadeAlvo, duracao: a.duracao, intensidade: a.intensidade } : null, agregado: ag };
  });
  saida.push({
    n: c.n, nome: c.nome, perfil: c.perfil, porQueEsteCenario: c.porQueEsteCenario,
    input: { ...c.input, restricoes: (c.input.restricoes ?? []).map((r) => rotuloRestricao(r.tag)) },
    condicoes: [c.input.grupoEspecial, ...(c.input.condicoesAtencao ?? [])].filter(Boolean).map((s) => ({ slug: s, nome: groupGpsRules[s!]?.nome, rotuloAluno: getSpecialGroup(s!)?.rotuloAluno })),
    titulo: g.titulo,
    modelo: { principal: getModelo(g.modeloId).nome, resumo: getModelo(g.modeloId).resumo, alternativa: g.modeloAltId ? getModelo(g.modeloAltId).nome : null },
    faixa: { series: faixa.series.valor, reps: faixa.reps.porNivel?.[c.input.nivel] ?? faixa.reps.valor, intensidade: faixa.intensidade.porNivel?.[c.input.nivel] ?? faixa.intensidade.valor, intervalo: faixa.intervalo.valor, frequencia: faixa.frequencia[c.input.nivel], ressalva: faixa.ressalva, enfases: faixa.enfases, complemento: faixa.complementoAerobio },
    regra: regra ? {
      complexidadeMax: regra.complexidadeMax, restricoesEstruturais: (regra.restricoesEstruturais ?? []).map((t) => rotuloRestricao(t)),
      posicoesEvitar: regra.posicoesEvitar, evitarFlexaoColunaCarregada: regra.evitarFlexaoColunaCarregada, evitarMembrosAcimaDoCoracao: regra.evitarMembrosAcimaDoCoracao,
      modProgressao: regra.modProgressao, modAerobio: regra.modAerobio, isometrico: regra.isometrico, equilibrio: regra.equilibrio, assoalhoPelvico: regra.assoalhoPelvico,
      horizonteMinimoSemanas: regra.horizonteMinimoSemanas, cuidados: regra.cuidados, penalidades: regra.penalidades, enfaseModalidade: regra.enfaseModalidade,
    } : null,
    dose: dose ? { rirMinimo: dose.rirMinimo, cargaRelativaMax: dose.cargaRelativaMax, intervaloFolgado: dose.intervaloFolgado, partirDoPiso: dose.partirDoPiso, de: dose.de, procedencia: dose.procedencia, motivo: dose.motivo } : null,
    restricoesDoPlano: restr.map((r) => rotuloRestricao(r.tag)),
    mesociclos: macro.mesociclos.map((m) => ({ nome: m.nome, foco: m.foco, semanas: `${m.semanaInicio} a ${m.semanaFim}`, volume: m.tendenciaVolume, intensidade: m.tendenciaIntensidade, complexidade: m.tendenciaComplexidade, capacidades: m.capacidades })),
    semana1: w1.sessoes.map((s: any) => ({ nome: s.nome, foco: s.foco, complemento: !!s.complemento, fecho: s.fecho, blocos: s.blocos.map(bloco) })),
    equilibrio: equilibrioDaSemana(w1.sessoes),
    padroes: { cobertos: PADROES_ESSENCIAIS.filter((p) => padroes.has(p)), faltando: PADROES_ESSENCIAIS.filter((p) => !padroes.has(p)), perna, dinamicos: dinamicos.length, pct: Math.round((100 * perna) / Math.max(1, dinamicos.length)) },
    progressao,
    consequencias: { evitados: cons.evitados.slice(0, 12).map((e: any) => ({ nome: e.nome, motivo: e.motivo })), totalEvitados: cons.evitados.length, foraDoObjetivo: cons.foraDoObjetivo, faltouCatalogo: cons.faltouCatalogo },
    raciocinio: topicosDoRaciocinio(g.raciocinio),
    refs: g.refIds.map((id) => { const r = getReferencia(id); return { id, autores: r?.autores, titulo: r?.titulo, ano: r?.ano }; }),
  });
}

// Tabela das 23 regras, direto de groupGpsRules, para a seção de regras do documento.
const regras = Object.values(groupGpsRules).map((r) => {
  const d = doseDoPerfilComIdade(r, undefined);
  return {
    slug: r.slug, nome: r.nome,
    rirMinimo: d?.rirMinimo, cargaRelativaMax: d?.cargaRelativaMax, intervaloFolgado: d?.intervaloFolgado, partirDoPiso: d?.partirDoPiso,
    pseTeto: r.modProgressao?.pseTeto, fatorIncremento: r.modProgressao?.fatorIncremento, descargaCadaSemanas: r.modProgressao?.descargaCadaSemanas,
    complexidadeMax: r.complexidadeMax, posicoesEvitar: r.posicoesEvitar, flexao: r.evitarFlexaoColunaCarregada, coracao: r.evitarMembrosAcimaDoCoracao,
    restricoes: (r.restricoesEstruturais ?? []).map((t) => rotuloRestricao(t)),
    bandaMax: r.modAerobio?.bandaMax, intervalado: r.modAerobio?.intervaladoIndicado ? "indicado" : r.modAerobio?.intervaladoEvitar ? "evitar" : undefined, modalidades: r.modAerobio?.modalidadesPreferidas?.map((m) => getModalidade(m)?.nome ?? m),
    isometrico: r.isometrico?.evitar ? "veto" : r.isometrico?.indicado ? "indicado" : (r.isometrico as any)?.prevencao ? "prevenção" : undefined,
    equilibrio: !!r.equilibrio, assoalho: !!r.assoalhoPelvico, horizonte: r.horizonteMinimoSemanas,
    penalidades: (r.penalidades ?? []).map((p: any) => `${p.metrica} ≥ ${p.limite}`),
    refs: r.refs,
    // A leitura clínica do Filipe para esta condição (revisão de 09/09/2026). Vai ao
    // documento numa tabela PRÓPRIA, ao lado da tabela do que o motor aplica: as duas dizem
    // coisas diferentes e juntá-las numa só faria orientação parecer regra automática.
    revisao: revisaoClinicaPorCondicao[r.slug],
  };
});

// Toda condição do motor precisa de uma linha na revisão, senão a tabela do documento volta
// a sair com buraco, que foi exatamente a reclamação que originou este arquivo.
const semRevisao = Object.values(groupGpsRules).filter((r) => !revisaoClinicaPorCondicao[r.slug]);
if (semRevisao.length) {
  console.error(`revisão clínica faltando para: ${semRevisao.map((r) => r.slug).join(", ")}`);
  process.exit(1);
}

const faixas = Object.values(FAIXAS_TREINO).map((f) => ({ objetivo: f.objetivo, series: f.series.valor, reps: f.reps.porNivel ?? f.reps.valor, intensidade: f.intensidade.porNivel ?? f.intensidade.valor, intervalo: f.intervalo.valor, frequencia: f.frequencia, enfases: f.enfases, complemento: f.complementoAerobio, ressalva: f.ressalva, refIds: f.refIds }));
const modelos = MODELOS_PERIODIZACAO.map((m) => ({ id: m.id, nome: m.nome, resumo: m.resumo }));
const bandas = Object.entries(BANDAS_AEROBIAS).map(([k, v]) => ({ banda: k, intensidade: v.intensidade }));

const destino = process.argv[2];
writeFileSync(destino, JSON.stringify({ geradoEm: new Date().toISOString(), constantes: { IDADE_DOSE_PROPRIA, RIR_MINIMO_IDADE }, faixas, modelos, bandas, regras, cenarios: saida }, null, 1), "utf8");
console.log(`ok: ${saida.length} cenários, ${regras.length} regras -> ${destino}`);
