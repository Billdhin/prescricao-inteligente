/**
 * BANCADA DE JORNADA: alunos plausíveis, o plano inteiro, e as regras conferidas no RESULTADO.
 *
 * A `bancada-cenarios` varre o espaço de parâmetros (grupo × objetivo × nível × semanas ×
 * frequência) com o resto no padrão. Isso encontra o defeito que mora em UMA dimensão, e é
 * cego para o que só aparece quando as dimensões se encontram: o aluno de 68 anos que também
 * toma betabloqueador, treina em casa com halteres e não pode ajoelhar.
 *
 * Um aluno de verdade chega assim, com tudo ao mesmo tempo. Esta bancada monta perfis
 * COMPLETOS (idade, FC de repouso, condição principal + condições de atenção, medicação,
 * restrições estruturadas e o equipamento que ele realmente tem) e confere, no plano gerado,
 * as promessas que o produto faz.
 *
 * ## CONTROLE POSITIVO EM CADA REGRA, e por quê
 *
 * A primeira versão desta bancada tinha doze regras e devolveu três achados. Duas das doze
 * NUNCA RODARAM: liam `e.regiao` e `e.complexidade`, campos que o catálogo não tem (são
 * `grupoMuscular` e a métrica "Complexidade técnica"). Uma regra que lê campo inexistente
 * não reprova nunca, e o relatório limpo parece prova de saúde.
 *
 * Por isso cada regra aqui conta quantas vezes ela CONSEGUIU avaliar, e a bancada reprova
 * quando alguma fica em zero. Mesma disciplina dos guardrails do repositório.
 *
 * Roda à mão: `npx tsx scripts/bancada-jornada.ts`.
 */
import { gerarPlano, metricaDoExercicio, type GerarPlanoInput } from "@/lib/gps/periodizacao";
import { groupGpsRules } from "@/lib/gps/groupRules";
import { EFEITO_POR_TAG } from "@/lib/gps/restricoes";
import { exercises } from "@/data/exercises";
import type { BlocoSessao, Macrociclo, Microciclo } from "@/data/periodizacao";
import type { RestricaoSelecionada } from "@/lib/gps/restricoes";
import { faixaDeReps } from "@/lib/gps/autorregulacao";

/* ------------------------------- os achados ------------------------------- */

type Gravidade = "ALTA" | "MEDIA";
type Achado = { aluno: string; classe: string; gravidade: Gravidade; detalhe: string };
const achados: Achado[] = [];
const anotar = (aluno: string, classe: string, gravidade: Gravidade, detalhe: string) =>
  achados.push({ aluno, classe, gravidade, detalhe });

/** Quantas vezes cada regra conseguiu avaliar alguma coisa. Zero = regra decorativa. */
const avaliou = new Map<string, number>();
const contar = (regra: string, n = 1) => avaliou.set(regra, (avaliou.get(regra) ?? 0) + n);
const REGRAS = [
  "sessão vazia", "equipamento", "reserva por idade", "zona de FC invalidada", "zona de FC ausente",
  "descarga alivia", "alvo na faixa", "salto de volume", "concentração muscular", "fusão conservadora",
  "restrição penalizada no plano", "frequência", "determinismo", "progresso ao longo do macro",
  "dose por objetivo", "direção com origem",
];

/* ------------------------------- os alunos -------------------------------- */

type Perfil = { nome: string; entrada: GerarPlanoInput; paraQue: string };

const r = (tag: string, extra: Partial<RestricaoSelecionada> = {}): RestricaoSelecionada =>
  ({ tag, grupo: "dor_regiao", gravidade: "moderada", ...extra }) as RestricaoSelecionada;

const ACADEMIA = ["Barra", "Halter", "Máquina", "Polia", "Peso corporal", "Esteira", "Bicicleta ergométrica", "Elíptico"];
const CASA = ["Halter", "Peso corporal"];
const CONDOMINIO = ["Halter", "Peso corporal", "Esteira"];

const PERFIS: Perfil[] = [
  { nome: "Helena, 58, hipertensa em betabloqueador, academia", paraQue: "condição + fármaco que invalida a FC",
    entrada: { objetivo: "Emagrecimento", nivel: "Iniciante", semanas: 12, frequencia: 3, grupoEspecial: "hipertensao-estagio-1",
      idade: 58, fcRepouso: 72, parametrosInvalidos: ["p-fc"], equipamentos: ACADEMIA, restricoes: [] } },
  { nome: "Antônio, 68, sarcopenia + osteoporose, academia", paraQue: "duas condições e idade que aperta a reserva",
    entrada: { objetivo: "Força", nivel: "Iniciante", semanas: 12, frequencia: 3, grupoEspecial: "sarcopenia",
      condicoesAtencao: ["osteoporose"], idade: 68, equipamentos: ACADEMIA, restricoes: [] } },
  { nome: "Marcos, 41, obesidade grau 2 + apneia, em casa", paraQue: "condição pesada com equipamento mínimo",
    entrada: { objetivo: "Emagrecimento", nivel: "Iniciante", semanas: 12, frequencia: 3, grupoEspecial: "obesidade-grau-2",
      condicoesAtencao: ["apneia-sono"], idade: 41, equipamentos: CASA,
      restricoes: [r("joelho_dor"), r("baixa_tolerancia_impacto", { grupo: "impacto_equilibrio" })] } },
  { nome: "Cláudia, 72, idosa destreinada, medo de cair", paraQue: "idade avançada + equilíbrio + equipamento limitado",
    entrada: { objetivo: "Retorno ao treino", nivel: "Iniciante", semanas: 12, frequencia: 2, grupoEspecial: "idoso-destreinado",
      idade: 72, equipamentos: CONDOMINIO,
      restricoes: [r("equilibrio_reduzido", { grupo: "impacto_equilibrio" }), r("medo_cair", { grupo: "impacto_equilibrio" })] } },
  { nome: "Rafael, 29, hipertrofia sem condição, academia", paraQue: "o caso limpo: nada pode ser cortado sem motivo",
    entrada: { objetivo: "Hipertrofia", nivel: "Intermediário", semanas: 12, frequencia: 4, idade: 29, fcRepouso: 58,
      equipamentos: ACADEMIA, restricoes: [] } },
  { nome: "Juliana, 34, pós-parto liberada, em casa 2x", paraQue: "condição + frequência baixa + equipamento mínimo",
    entrada: { objetivo: "Retorno ao treino", nivel: "Iniciante", semanas: 8, frequencia: 2, grupoEspecial: "pos-parto",
      idade: 34, equipamentos: CASA, restricoes: [r("lombar_sensivel", { gravidade: "importante" })] } },
  { nome: "Paulo, 55, diabetes + dislipidemia + dor lombar", paraQue: "três condições e restrição importante",
    entrada: { objetivo: "Emagrecimento", nivel: "Iniciante", semanas: 24, frequencia: 4, grupoEspecial: "diabetes-tipo-2",
      condicoesAtencao: ["dislipidemia", "dor-lombar-inespecifica"], idade: 55, fcRepouso: 78, equipamentos: ACADEMIA,
      restricoes: [r("lombar_sensivel", { gravidade: "importante" })] } },
  { nome: "Beatriz, 26, gestante liberada, academia", paraQue: "condição com mais vetos do catálogo",
    entrada: { objetivo: "Resistência muscular", nivel: "Iniciante", semanas: 12, frequencia: 3, grupoEspecial: "gestante",
      idade: 26, equipamentos: ACADEMIA, restricoes: [] } },
  { nome: "Sérgio, 63, osteoartrite de joelho, não agacha", paraQue: "restrição que exclui a família do agachamento",
    entrada: { objetivo: "Força", nivel: "Intermediário", semanas: 12, frequencia: 3, grupoEspecial: "osteoartrite-joelho",
      idade: 63, equipamentos: ACADEMIA,
      restricoes: [r("joelho_dor", { gravidade: "importante" }), r("dificuldade_agachar", { grupo: "limitacao_movimento" }), r("dificuldade_ajoelhar", { grupo: "limitacao_movimento" })] } },
  { nome: "Larissa, 19, iniciante sedentária, 5x", paraQue: "frequência alta com nível iniciante",
    entrada: { objetivo: "Hipertrofia", nivel: "Iniciante", semanas: 12, frequencia: 5, grupoEspecial: "iniciante-sedentario",
      idade: 19, equipamentos: ACADEMIA, restricoes: [] } },
  { nome: "Ricardo, 47, hipertensão 2 + obesidade 1", paraQue: "a fusão tem que ficar com o teto do estágio 2",
    entrada: { objetivo: "Emagrecimento", nivel: "Iniciante", semanas: 12, frequencia: 3, grupoEspecial: "hipertensao-estagio-2",
      condicoesAtencao: ["obesidade-grau-1"], idade: 47, fcRepouso: 80, parametrosInvalidos: ["p-fc"], equipamentos: ACADEMIA, restricoes: [] } },
  { nome: "Fernanda, 38, ansiedade, ombro sensível", paraQue: "restrição estrutural de membro superior",
    entrada: { objetivo: "Hipertrofia", nivel: "Intermediário", semanas: 12, frequencia: 4, grupoEspecial: "ansiedade-depressao",
      idade: 38, equipamentos: ACADEMIA,
      restricoes: [r("ombro_sensivel", { gravidade: "importante" }), r("dificuldade_elevar_bracos", { grupo: "limitacao_movimento" })] } },
];

/* ------------------------------ utilidades -------------------------------- */

const porSlug = new Map(exercises.map((e) => [e.slug, e]));
const blocosDe = (m: Macrociclo): BlocoSessao[] =>
  m.mesociclos.flatMap((me) => me.microciclos.flatMap((mi) => mi.sessoes.flatMap((s) => s.blocos)));
const semanasDe = (m: Macrociclo): Microciclo[] => m.mesociclos.flatMap((me) => me.microciclos);

function volumeSemana(mi: Microciclo): number {
  let v = 0;
  for (const s of mi.sessoes) for (const b of s.blocos) {
    if (b.tipo === "aerobio") continue;
    v += (b.seriesAlvo ?? faixaDeReps(b.series)?.min ?? 0) * (b.repsAlvo ?? faixaDeReps(b.reps)?.min ?? 0);
  }
  return v;
}
/** Assinatura textual do plano, para comparar duas gerações. */
const assinatura = (m: Macrociclo) =>
  blocosDe(m).map((b) => `${b.exercicioSlug ?? b.modalidade ?? b.nome}:${b.seriesAlvo}x${b.repsAlvo}@${b.rirAlvo}/${b.duracaoAlvoMin}`).join("|");

const complexidadeDe = (slug?: string) => {
  const e = slug ? porSlug.get(slug) : undefined;
  return e ? metricaDoExercicio(e, "Complexidade técnica") : undefined;
};

/* ------------------------------- as regras -------------------------------- */

for (const p of PERFIS) {
  let plano;
  try {
    plano = gerarPlano(p.entrada);
  } catch (e) {
    anotar(p.nome, "EXPLODIU", "ALTA", String(e).slice(0, 160));
    continue;
  }
  const macro = plano.principal;
  const blocos = blocosDe(macro);
  const semanas = semanasDe(macro);
  const forca = blocos.filter((b) => b.tipo !== "aerobio");
  const aerobio = blocos.filter((b) => b.tipo === "aerobio");

  /* --- 1. Nenhuma sessão pode sair vazia --- */
  for (const mi of semanas) for (const s of mi.sessoes) {
    contar("sessão vazia");
    if (s.blocos.length === 0) anotar(p.nome, "SESSÃO VAZIA", "ALTA", `semana ${mi.semana}, "${s.nome}"`);
  }

  /* --- 2. O equipamento declarado é o teto --- */
  if (p.entrada.equipamentos?.length) {
    const tem = new Set(p.entrada.equipamentos.map((e) => e.toLowerCase()));
    for (const b of forca) {
      const ex = b.exercicioSlug ? porSlug.get(b.exercicioSlug) : undefined;
      const eq = ex?.equipamento;
      if (!eq) continue;
      contar("equipamento");
      if (!tem.has(eq.toLowerCase()))
        anotar(p.nome, "EQUIPAMENTO QUE NÃO TEM", "ALTA", `${ex?.nome}: exige "${eq}"`);
    }
  }

  /* --- 3. A partir de 65 anos, a reserva não pode ficar abaixo de 3 --- */
  if ((p.entrada.idade ?? 0) >= 65) {
    for (const b of forca) {
      if (b.rirAlvo == null) continue;
      contar("reserva por idade");
      if (b.rirAlvo < 3)
        anotar(p.nome, "RESERVA CURTA PARA A IDADE", "ALTA", `${b.nome ?? b.exercicioSlug}: RIR ${b.rirAlvo} com ${p.entrada.idade} anos`);
    }
  }

  /* --- 4. Parâmetro invalidado não volta como zona de FC --- */
  if (p.entrada.parametrosInvalidos?.includes("p-fc")) {
    for (const b of aerobio) {
      contar("zona de FC invalidada");
      if (b.zonaFC) anotar(p.nome, "ZONA DE FC INVALIDADA", "ALTA", `bloco "${b.modalidade ?? b.nome}" traz ${b.zonaFC}`);
    }
  }

  /* --- 5. Com idade + FCrep e sem invalidação, a zona existe --- */
  if (p.entrada.idade && p.entrada.fcRepouso && !p.entrada.parametrosInvalidos?.length && aerobio.length) {
    contar("zona de FC ausente");
    if (!aerobio.some((b) => b.zonaFC))
      anotar(p.nome, "ZONA DE FC AUSENTE", "MEDIA", `idade ${p.entrada.idade} e FCrep ${p.entrada.fcRepouso}, nenhum bloco com zona`);
  }

  /* --- 6. Descarga alivia: volume não sobe E a reserva não encurta --- */
  for (let i = 1; i < semanas.length; i++) {
    const atual = semanas[i], anterior = semanas[i - 1];
    if (atual.tipo !== "deload" || anterior.tipo === "deload") continue;
    contar("descarga alivia");
    const vA = volumeSemana(atual), vB = volumeSemana(anterior);
    if (vA > vB)
      anotar(p.nome, "DESCARGA MAIS PESADA", "ALTA", `semana ${atual.semana} volume ${vA} > semana ${anterior.semana} volume ${vB}`);
    const rir = (mi: Microciclo) => {
      const v = mi.sessoes.flatMap((s) => s.blocos).map((b) => b.rirAlvo).filter((x): x is number => x != null);
      return v.length ? v.reduce((a, b) => a + b, 0) / v.length : undefined;
    };
    const rA = rir(atual), rB = rir(anterior);
    if (rA != null && rB != null && rA < rB)
      anotar(p.nome, "DESCARGA MAIS PERTO DA FALHA", "ALTA", `semana ${atual.semana} RIR médio ${rA.toFixed(1)} < semana ${anterior.semana} ${rB.toFixed(1)}`);
  }

  /* --- 7. O alvo cabe na faixa citada ao lado dele --- */
  for (const b of forca) {
    const fs = faixaDeReps(b.series), fr = faixaDeReps(b.reps);
    if (b.seriesAlvo != null && fs) {
      contar("alvo na faixa");
      if (b.seriesAlvo < fs.min || b.seriesAlvo > fs.max)
        anotar(p.nome, "ALVO FORA DA FAIXA", "ALTA", `${b.nome ?? b.exercicioSlug}: séries ${b.seriesAlvo} fora de "${b.series}"`);
    }
    if (b.repsAlvo != null && fr) {
      contar("alvo na faixa");
      if (b.repsAlvo < fr.min || b.repsAlvo > fr.max)
        anotar(p.nome, "ALVO FORA DA FAIXA", "ALTA", `${b.nome ?? b.exercicioSlug}: reps ${b.repsAlvo} fora de "${b.reps}"`);
    }
  }

  /* --- 8. Salto de volume entre semanas de carga --- */
  for (let i = 1; i < semanas.length; i++) {
    const atual = semanas[i], anterior = semanas[i - 1];
    if (atual.tipo === "deload" || anterior.tipo === "deload") continue;
    const vA = volumeSemana(atual), vB = volumeSemana(anterior);
    if (vB <= 0) continue;
    contar("salto de volume");
    if (vA / vB > 1.35)
      anotar(p.nome, "SALTO DE VOLUME", "MEDIA", `semana ${anterior.semana}→${atual.semana}: ${vB}→${vA} (+${Math.round((vA / vB - 1) * 100)}%)`);
  }

  /* --- 9. Hipertrofia não concentra a semana numa região só --- */
  if (p.entrada.objetivo === "Hipertrofia") {
    for (const mi of semanas) {
      const regioes = new Map<string, number>();
      let n = 0;
      for (const s of mi.sessoes) for (const b of s.blocos) {
        const g = b.exercicioSlug ? porSlug.get(b.exercicioSlug)?.grupoMuscular : undefined;
        if (!g) continue;
        regioes.set(g, (regioes.get(g) ?? 0) + 1);
        n++;
      }
      if (n < 6) continue;
      contar("concentração muscular");
      for (const [reg, c] of regioes)
        if (c / n > 0.6) anotar(p.nome, "SEMANA CONCENTRADA", "MEDIA", `semana ${mi.semana}: ${Math.round((c / n) * 100)}% em "${reg}"`);
    }
  }

  /* --- 10. A fusão de condições fica com o teto mais baixo --- */
  const slugs = [p.entrada.grupoEspecial, ...(p.entrada.condicoesAtencao ?? [])].filter(Boolean) as string[];
  if (slugs.length > 1) {
    const tetos = slugs.map((s) => groupGpsRules[s]?.complexidadeMax).filter((t): t is number => t != null);
    if (tetos.length) {
      const menor = Math.min(...tetos);
      const acima = forca
        .map((b) => ({ nome: porSlug.get(b.exercicioSlug ?? "")?.nome, c: complexidadeDe(b.exercicioSlug) }))
        .filter((x): x is { nome?: string; c: number } => x.c != null && x.c > menor);
      contar("fusão conservadora");
      if (acima.length)
        anotar(p.nome, "FUSÃO NÃO CONSERVADORA", "ALTA",
          `teto fundido ${menor}; ${acima.length} bloco(s) acima (máx ${Math.max(...acima.map((a) => a.c))}, ex: ${acima[0].nome})`);
    }
  }

  /* --- 11. Exercício fortemente penalizado pela restrição só entra se não houver saída ---
   * A versão anterior comparava com um plano "sem restrição", e isso não mede nada quando a
   * própria CONDIÇÃO já impõe a mesma tag (dor-lombar-inespecífica impõe lombar_sensivel).
   * O que interessa é: sobrou no plano algo penalizado forte, havendo alternativa livre no
   * mesmo grupo muscular e no mesmo equipamento? */
  for (const rest of p.entrada.restricoes ?? []) {
    const av = EFEITO_POR_TAG[rest.tag];
    if (!av) continue;
    const tem = new Set((p.entrada.equipamentos ?? []).map((e) => e.toLowerCase()));
    for (const b of forca) {
      const ex = b.exercicioSlug ? porSlug.get(b.exercicioSlug) : undefined;
      if (!ex) continue;
      contar("restrição penalizada no plano");
      const acao = (av(ex, rest) as { acao?: string } | undefined)?.acao;
      if (acao !== "penalizar_forte") continue;
      const saida = exercises.find(
        (alt) =>
          alt.slug !== ex.slug &&
          alt.grupoMuscular === ex.grupoMuscular &&
          (!tem.size || tem.has(String(alt.equipamento ?? "").toLowerCase())) &&
          (av(alt, rest) as { acao?: string } | undefined)?.acao !== "penalizar_forte",
      );
      if (saida)
        anotar(p.nome, "PENALIZADO FORTE COM ALTERNATIVA", "ALTA",
          `${ex.nome} (${rest.tag}) ficou no plano; "${saida.nome}" atende o mesmo grupo sem penalidade`);
    }
  }

  /* --- 12. O plano cabe na frequência declarada --- */
  for (const mi of semanas) {
    contar("frequência");
    const principais = mi.sessoes.filter((s) => !s.complemento).length;
    if (principais > p.entrada.frequencia)
      anotar(p.nome, "FREQUÊNCIA ESTOURADA", "ALTA", `semana ${mi.semana}: ${principais} sessões para frequência ${p.entrada.frequencia}`);
  }

  /* --- 13. Determinismo: documento assinável não pode mudar entre duas gerações --- */
  contar("determinismo");
  if (assinatura(macro) !== assinatura(gerarPlano(p.entrada).principal))
    anotar(p.nome, "PLANO NÃO DETERMINÍSTICO", "ALTA", "duas gerações com a mesma entrada devolveram planos diferentes");

  /* --- 14. O macro progride em ALGUM eixo ---
   * A primeira versão desta regra media só séries × repetições e acusou 9 dos 12 alunos. Ela
   * estava errada, e errada pelo mesmo motivo que já derrubou a leitura de um professor em
   * campo: neste motor REPETIÇÃO É DOSE DE CARGA, não de volume (ver o comentário em
   * alvo.ts, "REPETIÇÃO É DOSE DE CARGA"). Num objetivo puxado por intensidade, a repetição
   * CAI de propósito enquanto a reserva aperta, e o produto de séries por repetições cai
   * junto sem que nada tenha regredido.
   *
   * A regra certa é: no fim do macro, ALGUMA variável tem que ter andado para o lado de mais
   * estímulo. Se nenhuma andou, aí sim o plano de doze semanas é o mesmo da primeira. */
  {
    const carga = semanas.filter((s) => s.tipo !== "deload");
    if (carga.length >= 4) {
      contar("progresso ao longo do macro");
      const a = carga[0], z = carga[carga.length - 1];
      const med = (mi: Microciclo, f: (b: BlocoSessao) => number | undefined) => {
        const v = mi.sessoes.flatMap((s) => s.blocos).map(f).filter((x): x is number => x != null);
        return v.length ? v.reduce((x, y) => x + y, 0) / v.length : undefined;
      };
      const subiu = (x?: number, y?: number) => x != null && y != null && y > x + 1e-9;
      const caiu = (x?: number, y?: number) => x != null && y != null && y < x - 1e-9;
      const eixos = [
        subiu(volumeSemana(a), volumeSemana(z)),                                   // mais volume
        caiu(med(a, (b) => b.rirAlvo), med(z, (b) => b.rirAlvo)),                  // menos reserva
        subiu(med(a, (b) => b.cargaRelativaAlvo), med(z, (b) => b.cargaRelativaAlvo)), // mais carga
        caiu(med(a, (b) => b.repsAlvo), med(z, (b) => b.repsAlvo)),                // repetição como dose de carga
        subiu(med(a, (b) => b.duracaoAlvoMin), med(z, (b) => b.duracaoAlvoMin)),   // mais aeróbio
      ];
      if (!eixos.some(Boolean))
        anotar(p.nome, "MACRO SEM PROGRESSO", "ALTA",
          `da semana ${a.semana} à ${z.semana} nenhuma variável andou: volume, reserva, carga, repetição e duração aeróbia iguais`);
    }
  }

  /* --- 16. Direção da semana sem regra que a fundamente ---
   * O alvo muda de uma semana para a outra, e o painel "por que este número" (alvoResumo,
   * porQueNumero) só tem o que mostrar quando o bloco carrega `origemRegraId`. O rulepack
   * fundamenta Força, Hipertrofia e descarga; nos outros objetivos a direção anda sem regra
   * citada, e o painel fica vazio na semana de carga. */
  {
    const carga = semanas.filter((s) => s.tipo !== "deload");
    for (let i = 1; i < carga.length; i++) {
      const antes = new Map(carga[i - 1].sessoes.flatMap((s) => s.blocos).map((b) => [b.exercicioSlug ?? b.nome ?? "", b]));
      for (const s of carga[i].sessoes) for (const b of s.blocos) {
        if (b.tipo === "aerobio") continue;
        const ant = antes.get(b.exercicioSlug ?? b.nome ?? "");
        if (!ant) continue;
        const mudou = ant.repsAlvo !== b.repsAlvo || ant.seriesAlvo !== b.seriesAlvo || ant.rirAlvo !== b.rirAlvo;
        if (!mudou) continue;
        contar("direção com origem");
        if (!b.origemRegraId)
          anotar(p.nome, "DIREÇÃO SEM REGRA CITADA", "MEDIA",
            `${b.nome ?? b.exercicioSlug} muda da semana ${carga[i - 1].semana} para a ${carga[i].semana} (${ant.seriesAlvo}x${ant.repsAlvo} RIR ${ant.rirAlvo} → ${b.seriesAlvo}x${b.repsAlvo} RIR ${b.rirAlvo}) sem origemRegraId: o painel "por que este número" fica vazio`);
      }
    }
  }

  /* --- 15. A dose responde ao objetivo (força = menos reps e mais intervalo) --- */
  {
    const reps = forca.map((b) => b.repsAlvo).filter((x): x is number => x != null);
    const inter = forca.map((b) => b.intervaloAlvoSeg).filter((x): x is number => x != null);
    if (reps.length) {
      contar("dose por objetivo");
      const media = reps.reduce((a, b) => a + b, 0) / reps.length;
      if (p.entrada.objetivo === "Força" && media > 12)
        anotar(p.nome, "DOSE FORA DO OBJETIVO", "MEDIA", `objetivo Força com média de ${media.toFixed(1)} repetições`);
      if (p.entrada.objetivo === "Resistência muscular" && media < 10)
        anotar(p.nome, "DOSE FORA DO OBJETIVO", "MEDIA", `objetivo Resistência muscular com média de ${media.toFixed(1)} repetições`);
    }
    if (inter.length && p.entrada.objetivo === "Força") {
      const media = inter.reduce((a, b) => a + b, 0) / inter.length;
      if (media < 60) anotar(p.nome, "DOSE FORA DO OBJETIVO", "MEDIA", `objetivo Força com intervalo médio de ${media.toFixed(0)} s`);
    }
  }
}

/* -------------------------------- relatório ------------------------------- */

const mortas = REGRAS.filter((x) => !avaliou.get(x));
const ordem: Record<Gravidade, number> = { ALTA: 0, MEDIA: 1 };
achados.sort((a, b) => ordem[a.gravidade] - ordem[b.gravidade] || a.classe.localeCompare(b.classe));

console.log(`\n[bancada-jornada] ${PERFIS.length} alunos, plano completo gerado para cada um.\n`);
console.log("Controle positivo (quantas vezes cada regra conseguiu avaliar):");
for (const nome of REGRAS) console.log(`   ${String(avaliou.get(nome) ?? 0).padStart(6)}  ${nome}`);
if (mortas.length) {
  console.error(`\n✗ REGRA DECORATIVA: ${mortas.join(", ")} não avaliou nada. Corrija a regra antes de ler o resto.\n`);
}

if (!achados.length) {
  console.log(`\nNenhum achado nas ${REGRAS.length} regras.\n`);
} else {
  const porClasse = new Map<string, Achado[]>();
  for (const a of achados) porClasse.set(a.classe, [...(porClasse.get(a.classe) ?? []), a]);
  console.log(`\n${achados.length} achado(s) em ${porClasse.size} classe(s):\n`);
  for (const [classe, lista] of porClasse) {
    console.log(`  ${lista[0].gravidade}  ${classe}  (${lista.length})`);
    const vistos = new Set<string>();
    for (const a of lista) {
      if (vistos.has(a.aluno)) continue;
      vistos.add(a.aluno);
      if (vistos.size > 4) break;
      console.log(`      · ${a.aluno}\n        ${a.detalhe}`);
    }
    if (lista.length > vistos.size) console.log(`      · e mais ${lista.length - vistos.size} ocorrência(s)`);
    console.log("");
  }
}
if (mortas.length) process.exit(1);
