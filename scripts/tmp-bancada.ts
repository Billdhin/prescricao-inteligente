/**
 * Bancada ampla (temporária): gera planos para perfis reais e mede o que um professor olha.
 * Não é guardrail; é instrumento de diagnóstico. O que ela achar vira check depois.
 */
import { gerarPlano } from "@/lib/gps/periodizacao";
import { exercises, getExercise } from "@/data/exercises";

type Bloco = {
  tipo: string;
  nome?: string;
  exercicioSlug?: string;
  seriesAlvo?: number;
  series?: string;
  repsAlvo?: number;
  reps?: string;
  rirAlvo?: number;
  cargaRelativaAlvo?: number;
  duracaoAlvoMin?: number;
  duracao?: string;
  intensidade?: string;
};
type Sessao = { nome?: string; foco?: string; complemento?: boolean; blocos: Bloco[] };

const PUSH = new Set(["Peitoral maior", "Deltoide", "Deltoide anterior", "Tríceps braquial"]);
const PULL = new Set(["Latíssimo do dorso", "Trapézio médio", "Trapézio inferior", "Romboides", "Bíceps braquial", "Deltoide posterior"]);
const JOELHO = new Set(["Quadríceps", "Reto femoral"]);
const QUADRIL = new Set(["Glúteo máximo", "Isquiotibiais"]);

const primario = (slug: string) => {
  const ex = getExercise(slug);
  if (!ex) return undefined;
  const p = ex.ativacao.filter((a) => a.papel === "primário").sort((a, b) => b.percentual - a.percentual)[0];
  return p?.musculo;
};

const REGIAO: Record<string, string> = {
  "Membros inferiores": "Inferiores",
  Peitorais: "Superiores",
  Costas: "Superiores",
  Ombros: "Superiores",
  Braços: "Superiores",
  "Core (tronco)": "Core",
  "Corpo todo": "Corpo todo",
};

type Perfil = {
  rotulo: string;
  objetivo: string;
  nivel: string;
  frequencia: number;
  semanas: number;
  idade: number;
  grupoEspecial?: string;
  condicoesAtencao?: string[];
  equipamentos?: string[];
  objetivoSecundario?: string;
};

const PERFIS: Perfil[] = [
  { rotulo: "Homem 28, hipertrofia, intermediário, academia, 4x", objetivo: "Hipertrofia", nivel: "Intermediário", frequencia: 4, semanas: 12, idade: 28 },
  { rotulo: "Mulher 30, hipertrofia, iniciante, academia, 3x", objetivo: "Hipertrofia", nivel: "Iniciante", frequencia: 3, semanas: 12, idade: 30 },
  { rotulo: "Mulher 34 pós-parto, retorno, 2x, casa", objetivo: "Retorno ao treino", nivel: "Iniciante", frequencia: 2, semanas: 8, idade: 34, grupoEspecial: "pos-parto", equipamentos: ["Peso corporal", "Halter", "Elástico"] },
  { rotulo: "Homem 45, hipertensão 1, emagrecimento, 3x", objetivo: "Emagrecimento", nivel: "Iniciante", frequencia: 3, semanas: 12, idade: 45, grupoEspecial: "hipertensao-estagio-1" },
  { rotulo: "Mulher 55, osteoartrite joelho, emagrecimento, 3x", objetivo: "Emagrecimento", nivel: "Iniciante", frequencia: 3, semanas: 12, idade: 55, grupoEspecial: "osteoartrite-joelho" },
  { rotulo: "Homem 62, idoso destreinado + diabetes, retorno, 2x", objetivo: "Retorno ao treino", nivel: "Iniciante", frequencia: 2, semanas: 12, idade: 62, grupoEspecial: "idoso-destreinado", condicoesAtencao: ["diabetes-tipo-2"] },
  { rotulo: "Mulher 40, dor lombar, hipertrofia, 4x", objetivo: "Hipertrofia", nivel: "Intermediário", frequencia: 4, semanas: 12, idade: 40, grupoEspecial: "dor-lombar-inespecifica" },
  { rotulo: "Homem 33, só peso do corpo, hipertrofia, 3x", objetivo: "Hipertrofia", nivel: "Iniciante", frequencia: 3, semanas: 12, idade: 33, equipamentos: ["Peso corporal"] },
  { rotulo: "Mulher 26, força, avançado, 5x", objetivo: "Força", nivel: "Avançado", frequencia: 5, semanas: 16, idade: 26 },
  { rotulo: "Homem 70, resistência muscular, 3x", objetivo: "Resistência muscular", nivel: "Iniciante", frequencia: 3, semanas: 12, idade: 70, grupoEspecial: "idoso-destreinado" },
  { rotulo: "Mulher 48, síndrome metabólica, emagrecimento, 4x", objetivo: "Emagrecimento", nivel: "Iniciante", frequencia: 4, semanas: 12, idade: 48, grupoEspecial: "sindrome-metabolica" },
  { rotulo: "Homem 38, obesidade 2 + apneia, emagrecimento, 3x", objetivo: "Emagrecimento", nivel: "Iniciante", frequencia: 3, semanas: 12, idade: 38, grupoEspecial: "obesidade-grau-2", condicoesAtencao: ["apneia-sono"] },
  { rotulo: "Mulher 52, hipertensão 2 + osteoartrite, retorno, 3x", objetivo: "Retorno ao treino", nivel: "Iniciante", frequencia: 3, semanas: 12, idade: 52, grupoEspecial: "hipertensao-estagio-2", condicoesAtencao: ["osteoartrite-joelho"] },
  { rotulo: "Homem 22, aprendizado técnico, iniciante, 3x", objetivo: "Aprendizado técnico", nivel: "Iniciante", frequencia: 3, semanas: 8, idade: 22 },
  { rotulo: "Mulher 35, hipertrofia + emagrecimento (2 objetivos), 4x", objetivo: "Hipertrofia", nivel: "Intermediário", frequencia: 4, semanas: 12, idade: 35, objetivoSecundario: "Emagrecimento" },
  { rotulo: "Homem 58, ansiedade/depressão, hipertrofia, 3x", objetivo: "Hipertrofia", nivel: "Iniciante", frequencia: 3, semanas: 12, idade: 58, grupoEspecial: "ansiedade-depressao" },
];

const achados: string[] = [];
const linhas: string[] = [];

for (const p of PERFIS) {
  let g;
  try {
    g = gerarPlano({
      objetivo: p.objetivo as never,
      nivel: p.nivel as never,
      semanas: p.semanas,
      frequencia: p.frequencia,
      idade: p.idade,
      grupoEspecial: p.grupoEspecial,
      condicoesAtencao: p.condicoesAtencao,
      equipamentos: p.equipamentos,
      objetivoSecundario: p.objetivoSecundario as never,
    } as never);
  } catch (e) {
    achados.push(`${p.rotulo}: GERADOR FALHOU (${(e as Error).message.slice(0, 80)})`);
    continue;
  }

  const micros = g.principal.mesociclos.flatMap((m) => m.microciclos) as { tipo: string; sessoes: Sessao[] }[];
  const semana = micros.find((w) => w.tipo === "carga") ?? micros[0];
  const sessoesPrincipais = semana.sessoes.filter((s) => !s.complemento);
  const forca = sessoesPrincipais.flatMap((s) => s.blocos.filter((b) => b.tipo === "forca"));

  const serieDe = (b: Bloco) => b.seriesAlvo ?? Number(/(\d+)/.exec(b.series ?? "")?.[1] ?? 0);

  let push = 0,
    pull = 0,
    joelho = 0,
    quadril = 0;
  const porRegiao = new Map<string, number>();
  const porMusculo = new Map<string, number>();
  const contagemSlug = new Map<string, number>();
  let totalSeries = 0;

  for (const b of forca) {
    const slug = b.exercicioSlug ?? "";
    const ex = getExercise(slug);
    if (!ex) continue;
    const n = serieDe(b);
    totalSeries += n;
    contagemSlug.set(slug, (contagemSlug.get(slug) ?? 0) + 1);
    const r = REGIAO[ex.grupoMuscular] ?? "Corpo todo";
    porRegiao.set(r, (porRegiao.get(r) ?? 0) + n);
    const prim = primario(slug);
    if (prim) {
      porMusculo.set(prim, (porMusculo.get(prim) ?? 0) + n);
      if (PUSH.has(prim)) push += n;
      if (PULL.has(prim)) pull += n;
      if (JOELHO.has(prim)) joelho += n;
      if (QUADRIL.has(prim)) quadril += n;
    }
  }

  const pct = (n: number) => (totalSeries ? Math.round((100 * n) / totalSeries) : 0);
  const inf = porRegiao.get("Inferiores") ?? 0;
  const sup = porRegiao.get("Superiores") ?? 0;
  const core = porRegiao.get("Core") ?? 0;

  linhas.push(
    `\n### ${p.rotulo}\n` +
      `  sessões: ${sessoesPrincipais.length} principais + ${semana.sessoes.length - sessoesPrincipais.length} complemento | séries de força: ${totalSeries}\n` +
      `  regiões: Inf ${pct(inf)}% · Sup ${pct(sup)}% · Core ${pct(core)}%\n` +
      `  empurrar ${push} x puxar ${pull} | joelho ${joelho} x quadril ${quadril}\n` +
      `  músculos primários: ${[...porMusculo.entries()].sort((a, b) => b[1] - a[1]).map(([m, n]) => `${m}:${n}`).join(", ")}`,
  );

  // ---- achados ----
  if (pull === 0 && push > 0) achados.push(`${p.rotulo}: EMPURRA SEM PUXAR (push ${push}, pull 0).`);
  if (push > 0 && pull > 0 && (push / pull > 2 || pull / push > 2))
    achados.push(`${p.rotulo}: desequilíbrio empurrar/puxar ${push}:${pull}.`);
  if (joelho > 0 && quadril === 0)
    achados.push(`${p.rotulo}: inferiores SÓ dominante de joelho (${joelho} séries), nenhuma de quadril/posterior.`);
  if (quadril > 0 && joelho === 0)
    achados.push(`${p.rotulo}: inferiores SÓ dominante de quadril (${quadril} séries), nenhuma de joelho.`);
  for (const [slug, vezes] of contagemSlug)
    if (vezes > 1) {
      const pool = exercises.filter((e) => e.grupoMuscular === getExercise(slug)?.grupoMuscular).length;
      achados.push(`${p.rotulo}: "${getExercise(slug)?.nome}" repete ${vezes}x na semana (grupo tem ${pool} no catálogo).`);
    }
  if (p.equipamentos?.length) {
    for (const b of forca) {
      const ex = getExercise(b.exercicioSlug ?? "");
      if (ex && ex.equipamento !== "Peso corporal" && !p.equipamentos.includes(ex.equipamento))
        achados.push(`${p.rotulo}: "${ex.nome}" exige ${ex.equipamento}, fora do declarado.`);
    }
  }
  for (const s of sessoesPrincipais) {
    const n = s.blocos.filter((b) => b.tipo === "forca").length;
    if (n === 0) achados.push(`${p.rotulo}: sessão "${s.nome}" sem nenhum bloco de força.`);
    if (n > 6) achados.push(`${p.rotulo}: sessão "${s.nome}" com ${n} exercícios de força.`);
  }
  // dose: reserva declarada
  const rirs = forca.map((b) => b.rirAlvo).filter((x): x is number => x != null);
  const reps = forca.map((b) => b.repsAlvo).filter((x): x is number => x != null);
  linhas.push(
    `  dose: RIR ${rirs.length ? `${Math.min(...rirs)} a ${Math.max(...rirs)}` : "não declarado"} | reps ${reps.length ? `${Math.min(...reps)} a ${Math.max(...reps)}` : "não declarado"}`,
  );
  // aeróbio
  const aer = sessoesPrincipais.flatMap((s) => s.blocos.filter((b) => b.tipo === "aerobio"));
  linhas.push(`  aeróbio: ${aer.length} bloco(s) em ${sessoesPrincipais.length} sessões`);
  if (p.objetivo === "Emagrecimento" && aer.length < sessoesPrincipais.length)
    achados.push(`${p.rotulo}: emagrecimento com aeróbio em só ${aer.length} de ${sessoesPrincipais.length} sessões.`);
  // descarga
  const descargas = micros.filter((w) => w.tipo !== "carga").length;
  if (p.semanas >= 12 && descargas === 0) achados.push(`${p.rotulo}: ${p.semanas} semanas sem nenhuma descarga.`);
}

console.log(linhas.join("\n"));
console.log(`\n\n===== ACHADOS (${achados.length}) =====`);
for (const a of achados) console.log("  • " + a);
