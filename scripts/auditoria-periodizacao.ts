/**
 * AUDITORIA do motor de periodização: prova ou derruba cada suspeita MEDINDO a saída.
 *
 * Não é guardrail. É a bancada de investigação de uma rodada: cada bloco imprime o número
 * que sustenta (ou desmente) um achado, para nenhum item do relatório entrar por leitura de
 * código. Roda à mão: `npx tsx scripts/auditoria-periodizacao.ts`.
 */
import { gerarPlano } from "@/lib/gps/periodizacao";
import { groupGpsRules, combineRules } from "@/lib/gps/groupRules";
import { specialGroups } from "@/data/specialGroups";
import { getFaixa } from "@/data/periodizacao";

const OBJETIVOS = ["Hipertrofia", "Emagrecimento", "Força", "Resistência muscular", "Retorno ao treino"] as const;
const NIVEIS = ["Iniciante", "Intermediário", "Avançado"] as const;

const blocosDe = (p: ReturnType<typeof gerarPlano>) =>
  p.principal.mesociclos.flatMap((m) => m.microciclos.flatMap((mi) => mi.sessoes.flatMap((s) => s.blocos)));

const linha = (t: string) => console.log(`\n${"=".repeat(78)}\n${t}\n${"=".repeat(78)}`);

/* ---------------------------------------------------------------- A1 */
linha("A1. A BANDA AERÓBIA DA CONDIÇÃO É TETO OU É VALOR?");
{
  const comBanda = specialGroups
    .map((g) => ({ slug: g.slug, banda: groupGpsRules[g.slug]?.modAerobio?.bandaMax }))
    .filter((x) => x.banda);
  console.log("condições com bandaMax:", comBanda.map((x) => `${x.slug}=${x.banda}`).join(", ") || "nenhuma");

  for (const { slug, banda } of comBanda) {
    const sem = gerarPlano({ objetivo: "Emagrecimento", nivel: "Iniciante", semanas: 8, frequencia: 3 });
    const com = gerarPlano({ objetivo: "Emagrecimento", nivel: "Iniciante", semanas: 8, frequencia: 3, grupoEspecial: slug });
    const intSem = blocosDe(sem).find((b) => b.tipo === "aerobio")?.intensidade;
    const intCom = blocosDe(com).find((b) => b.tipo === "aerobio")?.intensidade;
    const rpeSem = blocosDe(sem).find((b) => b.tipo === "aerobio")?.rpeAlvo;
    const rpeCom = blocosDe(com).find((b) => b.tipo === "aerobio")?.rpeAlvo;
    console.log(`\n  ${slug} (banda declarada: ${banda})`);
    console.log(`    sem condição: ${intSem}  | rpeAlvo=${rpeSem}`);
    console.log(`    com condição: ${intCom}  | rpeAlvo=${rpeCom}`);
    if (rpeSem != null && rpeCom != null && rpeCom > rpeSem)
      console.log(`    >>> ACHADO: declarar a condição SUBIU o esforço prescrito (${rpeSem} -> ${rpeCom}).`);
  }
}

/* ---------------------------------------------------------------- A2 */
linha("A2. FASE ESTENDIDA (horizonte longo, caminho clínico): a dose CAI no platô?");
{
  const alvos = ["hipertensao-estagio-2", "obesidade-grau-2", "diabetes-tipo-2"].filter((s) => groupGpsRules[s]);
  for (const slug of alvos) {
    const p = gerarPlano({ objetivo: "Hipertrofia", nivel: "Intermediário", semanas: 48, frequencia: 3, grupoEspecial: slug });
    console.log(`\n  ${slug} / 48 semanas / ${p.principal.mesociclos.length} mesociclos`);
    const porMeso = p.principal.mesociclos.map((m) => {
      const cargas = m.microciclos.filter((w) => w.tipo === "carga");
      const alvo = (w: (typeof cargas)[number]) => {
        const b = w.sessoes.flatMap((s) => s.blocos).filter((x) => x.tipo === "forca");
        const rir = b.map((x) => x.rirAlvo).filter((n): n is number => n != null);
        const reps = b.map((x) => x.repsAlvo).filter((n): n is number => n != null);
        const ser = b.map((x) => x.seriesAlvo).filter((n): n is number => n != null);
        return `${ser[0] ?? "-"}x${reps[0] ?? "-"} RIR${rir[0] ?? "-"}`;
      };
      return { nome: m.nome, ini: cargas[0] ? alvo(cargas[0]) : "-", fim: cargas.at(-1) ? alvo(cargas.at(-1)!) : "-" };
    });
    for (const m of porMeso) console.log(`    ${m.nome.padEnd(46)} ${m.ini} -> ${m.fim}`);
  }
}

/* ---------------------------------------------------------------- A3 */
linha("A3. EXERCÍCIO REPETIDO DENTRO DA MESMA SESSÃO");
{
  let casos = 0;
  const exemplos: string[] = [];
  for (const g of [undefined, ...specialGroups.map((s) => s.slug)])
    for (const objetivo of OBJETIVOS)
      for (const nivel of NIVEIS)
        for (const frequencia of [2, 3, 5]) {
          const p = gerarPlano({ objetivo, nivel, semanas: 8, frequencia, grupoEspecial: g });
          for (const m of p.principal.mesociclos)
            for (const mi of m.microciclos)
              for (const s of mi.sessoes) {
                const slugs = s.blocos.filter((b) => b.tipo === "forca").map((b) => b.exercicioSlug);
                if (new Set(slugs).size !== slugs.length) {
                  casos++;
                  if (exemplos.length < 5) exemplos.push(`${g ?? "sem"}/${objetivo}/${nivel}/${frequencia}x -> ${slugs.join(", ")}`);
                }
              }
        }
  console.log(`sessões com exercício repetido: ${casos}`);
  exemplos.forEach((e) => console.log(`  ${e}`));
}

/* ---------------------------------------------------------------- A4 */
linha("A4. UNIDADES MISTURADAS em intensidadeDaSemana (cargaRelativa vs RIR no mesmo meso)");
{
  let mistos = 0;
  const exemplos: string[] = [];
  for (const g of [undefined, ...specialGroups.map((s) => s.slug)])
    for (const objetivo of OBJETIVOS)
      for (const nivel of NIVEIS) {
        const p = gerarPlano({ objetivo, nivel, semanas: 12, frequencia: 3, grupoEspecial: g });
        for (const m of p.principal.mesociclos)
          for (const mi of m.microciclos) {
            const forca = mi.sessoes.flatMap((s) => s.blocos).filter((b) => b.tipo === "forca");
            const comCarga = forca.filter((b) => b.cargaRelativaAlvo != null).length;
            const comRir = forca.filter((b) => b.cargaRelativaAlvo == null && b.rirAlvo != null).length;
            if (comCarga > 0 && comRir > 0) {
              mistos++;
              if (exemplos.length < 5) exemplos.push(`${g ?? "sem"}/${objetivo}/${nivel} sem.${mi.semana}: ${comCarga} com %1RM e ${comRir} com RIR`);
            }
          }
      }
  console.log(`semanas com as duas unidades no mesmo cálculo: ${mistos}`);
  exemplos.forEach((e) => console.log(`  ${e}`));
}

/* ---------------------------------------------------------------- A5 */
linha("A5. MODALIDADES DO CARTÃO batem com os blocos que a sessão monta?");
{
  const divergentes: string[] = [];
  for (const objetivo of OBJETIVOS) {
    const p = gerarPlano({ objetivo, nivel: "Intermediário", semanas: 8, frequencia: 3 });
    const noCartao = new Set(p.principal.mesociclos.flatMap((m) => m.modalidades));
    const nosBlocos = new Set(blocosDe(p).map((b) => b.modalidade).filter(Boolean) as string[]);
    const soNoCartao = [...noCartao].filter((x) => !nosBlocos.has(x) && x !== "m-musculacao");
    const soNosBlocos = [...nosBlocos].filter((x) => !noCartao.has(x));
    console.log(`  ${objetivo.padEnd(24)} cartão=[${[...noCartao].join(", ")}] blocos=[${[...nosBlocos].join(", ")}]`);
    if (soNoCartao.length || soNosBlocos.length)
      divergentes.push(`${objetivo}: cartão-só=[${soNoCartao}] blocos-só=[${soNosBlocos}]`);
  }
  console.log(divergentes.length ? `>>> ACHADO: ${divergentes.join(" | ")}` : "  nenhuma divergência");
}

/* ---------------------------------------------------------------- A6 */
linha("A6. FORMATO INTERVALADO x TEXTO DA OBSERVAÇÃO (o bloco se contradiz?)");
{
  for (const slug of specialGroups.map((s) => s.slug)) {
    const r = groupGpsRules[slug];
    if (!r?.modAerobio?.intervaladoIndicado) continue;
    const p = gerarPlano({ objetivo: "Emagrecimento", nivel: "Iniciante", semanas: 8, frequencia: 3, grupoEspecial: slug });
    const aer = blocosDe(p).find((b) => b.tipo === "aerobio");
    const contradiz = aer?.formato === "Intervalado" && /[Aa]lternativa intervalada/.test(aer?.observacao ?? "");
    console.log(`  ${slug.padEnd(28)} formato=${aer?.formato} observacao-oferece-intervalado=${contradiz}`);
    if (contradiz) console.log(`    >>> ACHADO: o bloco JÁ é intervalado e a nota oferece o intervalado como alternativa.`);
  }
}

/* ---------------------------------------------------------------- A7 */
linha("A7. PLANO TERMINA EM SEMANA DE DESCARGA?");
{
  for (const semanas of [4, 8, 12, 24, 48]) {
    const p = gerarPlano({ objetivo: "Hipertrofia", nivel: "Intermediário", semanas, frequencia: 3 });
    const todas = p.principal.mesociclos.flatMap((m) => m.microciclos);
    const ultima = todas.at(-1);
    console.log(`  ${String(semanas).padStart(2)} semanas -> última semana é ${ultima?.tipo}`);
  }
}

/* ---------------------------------------------------------------- A8 */
linha("A8. RIR MÍNIMO: a reserva declarada chapa o alvo?");
{
  for (const slug of specialGroups.map((s) => s.slug)) {
    const dose = combineRules([slug])?.modDose;
    if (dose?.rirMinimo == null) continue;
    const p = gerarPlano({ objetivo: "Hipertrofia", nivel: "Intermediário", semanas: 24, frequencia: 3, grupoEspecial: slug });
    const rirs = p.principal.mesociclos
      .flatMap((m) => m.microciclos.filter((w) => w.tipo === "carga"))
      .map((w) => w.sessoes[0]?.blocos.find((b) => b.tipo === "forca")?.rirAlvo)
      .filter((n): n is number => n != null);
    const distintos = new Set(rirs).size;
    console.log(`  ${slug.padEnd(28)} rirMinimo=${dose.rirMinimo} valores distintos em 24 sem: ${distintos} ${distintos <= 1 ? "<<< CHAPADO" : ""}`);
  }
}

/* ---------------------------------------------------------------- A9 */
linha("A9. FAIXAS COM complementoAerobio e o que o objetivo declara");
for (const objetivo of OBJETIVOS) {
  const f = getFaixa(objetivo);
  console.log(`  ${objetivo.padEnd(24)} complemento=${f.complementoAerobio ? `${f.complementoAerobio.sessoesPorSemana}x ${f.complementoAerobio.modalidade}` : "não"}`);
}

console.log("\nfim da auditoria.\n");

/* =========================== CONTROLES ===========================
 * Nenhum numero acima vira achado sem o par: "chapou" so existe contra o mesmo plano sem
 * a condicao, e "mais leve" so existe contra a fase que ela diz continuar.
 * ============================================================== */

const cargas = (p: ReturnType<typeof gerarPlano>) =>
  p.principal.mesociclos.flatMap((m) => m.microciclos.filter((w) => w.tipo === "carga").map((w) => ({ meso: m.nome, w })));
const doseDe = (w: { sessoes: { blocos: any[] }[] }) => {
  const b = w.sessoes.flatMap((s) => s.blocos).filter((x: any) => x.tipo === "forca");
  return { series: b[0]?.seriesAlvo, reps: b[0]?.repsAlvo, rir: b[0]?.rirAlvo, carga: b[0]?.cargaRelativaAlvo };
};
const chave = (d: ReturnType<typeof doseDe>) => `${d.series}x${d.reps} RIR${d.rir}${d.carga != null ? ` @${d.carga}%` : ""}`;

/* ------------------------------------------------------------------ C1 */
linha("C1. CONTROLE do RIR chapado: com condição x SEM condição, mesmo objetivo/nível");
{
  for (const objetivo of ["Hipertrofia", "Força"] as const) {
    const sem = gerarPlano({ objetivo, nivel: "Intermediário", semanas: 24, frequencia: 3 });
    const rirSem = new Set(cargas(sem).map((c) => doseDe(c.w).rir));
    console.log(`\n  ${objetivo} SEM condição: RIR distintos em 24 sem = ${rirSem.size}  valores=[${[...rirSem].join(", ")}]`);
    for (const slug of specialGroups.map((s) => s.slug)) {
      const dose = combineRules([slug])?.modDose;
      if (dose?.rirMinimo == null) continue;
      const com = gerarPlano({ objetivo, nivel: "Intermediário", semanas: 24, frequencia: 3, grupoEspecial: slug });
      const rirCom = new Set(cargas(com).map((c) => doseDe(c.w).rir));
      const veredito = rirSem.size > 1 && rirCom.size === 1 ? "  <<< A CONDIÇÃO CHAPOU" : "";
      console.log(`    ${slug.padEnd(26)} rirMinimo=${dose.rirMinimo} -> distintos=${rirCom.size} valores=[${[...rirCom].join(", ")}]${veredito}`);
    }
  }
}

/* ------------------------------------------------------------------ C2 */
linha("C2. FASE DE CONTINUAÇÃO: ela sustenta ou ela ALIVIA a fase que continua?");
{
  for (const slug of ["obesidade-grau-2", "diabetes-tipo-2", "hipertensao-estagio-2"]) {
    const p = gerarPlano({ objetivo: "Hipertrofia", nivel: "Intermediário", semanas: 48, frequencia: 3, grupoEspecial: slug });
    const mesos = p.principal.mesociclos;
    const reais = mesos.filter((m) => !m.nome.includes("continuação"));
    const conts = mesos.filter((m) => m.nome.includes("continuação"));
    if (!conts.length) continue;
    const ultimaReal = reais.at(-1)!;
    const fimUltimaReal = doseDe(ultimaReal.microciclos.filter((w) => w.tipo === "carga").at(-1)!);
    console.log(`\n  ${slug}`);
    console.log(`    fim da última fase REAL (${ultimaReal.nome}): ${chave(fimUltimaReal)}`);
    conts.forEach((c, i) => {
      const cs = c.microciclos.filter((w) => w.tipo === "carga");
      console.log(`    continuação ${i + 1}: ${chave(doseDe(cs[0]))} -> ${chave(doseDe(cs.at(-1)!))}`);
    });
    const todasIguais = conts.length > 1 && conts.every((c) => {
      const a = c.microciclos.filter((w) => w.tipo === "carga").map((w) => chave(doseDe(w))).join("|");
      const b = conts[0].microciclos.filter((w) => w.tipo === "carga").map((w) => chave(doseDe(w))).join("|");
      return a === b;
    });
    /*
     * Continuações idênticas entre si NÃO são mais achado, e isso é uma decisão, não um
     * relaxamento. Segurar no patamar alcançado é o que o fundador pediu para "manutenção"
     * significar: dois blocos de manutenção do mesmo tamanho, no mesmo patamar, saem iguais
     * por definição. O que continua sendo achado é o plano TERMINAR mais leve do que estava
     * quando a última fase real fechou, que era o defeito de verdade.
     */
    console.log(`    as ${conts.length} continuações são idênticas entre si? ${todasIguais ? "sim (esperado: é o patamar)" : "não"}`);
    const fimCont = doseDe(conts.at(-1)!.microciclos.filter((w) => w.tipo === "carga").at(-1)!);
    if (fimCont.rir != null && fimUltimaReal.rir != null && fimCont.rir > fimUltimaReal.rir)
      console.log(`    >>> ACHADO: o plano TERMINA mais leve (RIR ${fimUltimaReal.rir} -> ${fimCont.rir}) do que na semana em que a última fase real fechou.`);
    if (chave(fimCont) === chave(fimUltimaReal)) console.log(`    patamar mantido: ${chave(fimCont)}`);
  }
}

/* ------------------------------------------------------------------ C6 */
linha("C6. PATAMAR CONGELADO: o cardio chapou? e o modelo linear segura onde chegou?");
{
  for (const [rotulo, entrada] of [
    ["linear (iniciante)", { objetivo: "Hipertrofia", nivel: "Iniciante" }],
    ["linear (retorno)", { objetivo: "Retorno ao treino", nivel: "Intermediário" }],
    ["ondulatória", { objetivo: "Hipertrofia", nivel: "Intermediário" }],
  ] as const) {
    const p = gerarPlano({ ...(entrada as any), semanas: 48, frequencia: 3, grupoEspecial: "obesidade-grau-2" });
    const conts = p.principal.mesociclos.filter((m) => m.nome.includes("continuação"));
    const reais = p.principal.mesociclos.filter((m) => !m.nome.includes("continuação"));
    if (!conts.length) { console.log(`  ${rotulo}: sem fase de continuação neste horizonte`); continue; }
    const aerDe = (ms: typeof conts) =>
      new Set(ms.flatMap((m) => m.microciclos.filter((w) => w.tipo === "carga")).flatMap((w) => w.sessoes).flatMap((s) => s.blocos).filter((b) => b.tipo === "aerobio").map((b) => `${b.duracaoAlvoMin}|${b.rpeAlvo}`));
    const fimReal = doseDe(reais.at(-1)!.microciclos.filter((w) => w.tipo === "carga").at(-1)!);
    const picoCont = conts.flatMap((m) => m.microciclos.filter((w) => w.tipo === "carga")).map(doseDe);
    const melhor = picoCont.reduce((a, b) => ((b.rir ?? 99) < (a.rir ?? 99) ? b : a), picoCont[0]);
    console.log(`  ${rotulo}: modelo=${p.modeloId} | fim da fase real ${chave(fimReal)} | melhor da continuação ${chave(melhor)}`);
    console.log(`    doses aeróbias distintas na continuação: ${aerDe(conts).size} ${aerDe(conts).size <= 1 ? "<<< CARDIO CHAPADO" : ""}`);
    console.log(`    rótulos dos cartões de continuação: ${conts.map((m) => `${m.tendenciaVolume}/${m.tendenciaIntensidade}`).join(", ")}`);
  }
}

/* ------------------------------------------------------------------ C3 */
linha("C3. CONDIÇÃO SÓ EM condicoesAtencao: o plano APLICA e DIZ, ou aplica calado?");
{
  const slug = "hipertensao-estagio-2";
  const base = gerarPlano({ objetivo: "Hipertrofia", nivel: "Intermediário", semanas: 12, frequencia: 3 });
  const comoPrincipal = gerarPlano({ objetivo: "Hipertrofia", nivel: "Intermediário", semanas: 12, frequencia: 3, grupoEspecial: slug });
  const soAtencao = gerarPlano({ objetivo: "Hipertrofia", nivel: "Intermediário", semanas: 12, frequencia: 3, condicoesAtencao: [slug] });

  const seq = (p: ReturnType<typeof gerarPlano>) => cargas(p).map((c) => chave(doseDe(c.w))).join(" | ");
  console.log(`  dose base   : ${seq(base)}`);
  console.log(`  como principal: ${seq(comoPrincipal)}`);
  console.log(`  só em atenção : ${seq(soAtencao)}`);
  console.log(`\n  a dose mudou em relação à base? ${seq(soAtencao) !== seq(base) ? "SIM (a condição foi aplicada)" : "NÃO"}`);
  const mencao = /perf(il|is) de cuidado|programa/i.test(soAtencao.raciocinio);
  console.log(`  o raciocínio menciona algum perfil de cuidado? ${mencao ? "SIM" : "NÃO"}`);
  console.log(`  raciocínio (só-atenção): ${soAtencao.raciocinio.slice(0, 260)}...`);
  if (seq(soAtencao) !== seq(base) && !mencao)
    console.log(`\n  >>> ACHADO: a condição MUDOU a dose e o documento não diz que existe perfil de cuidado nenhum.`);
}

/* ------------------------------------------------------------------ C4 */
linha("C4. MODELO ESCOLHIDO PELO PROFISSIONAL apaga a alternativa que a condição abriria?");
{
  const slug = "hipertensao-estagio-2";
  const auto = gerarPlano({ objetivo: "Hipertrofia", nivel: "Intermediário", semanas: 12, frequencia: 3, grupoEspecial: slug });
  const forcado = gerarPlano({ objetivo: "Hipertrofia", nivel: "Intermediário", semanas: 12, frequencia: 3, grupoEspecial: slug, modeloPreferido: "ondulatoria" });
  console.log(`  automático: principal=${auto.modeloId} alternativa=${auto.modeloAltId}`);
  console.log(`  profissional escolheu 'ondulatoria' (= a mesma do motor): principal=${forcado.modeloId} alternativa=${forcado.modeloAltId}`);
  if (auto.modeloAltId && !forcado.modeloAltId)
    console.log(`  >>> ACHADO: escolher explicitamente o MESMO modelo do motor apaga a alternativa autorregulada que a condição abria.`);
}

/* ------------------------------------------------------------------ C5 */
linha("C5. DESCARTADOS por restrição: alguém recebe essa lista?");
{
  const p = gerarPlano({
    objetivo: "Hipertrofia",
    nivel: "Intermediário",
    semanas: 8,
    frequencia: 3,
    grupoEspecial: "obesidade-grau-3",
  });
  console.log(`  campos do PlanoGerado: ${Object.keys(p).join(", ")}`);
  console.log(`  existe algum campo de exercício descartado/faltou catálogo? ${Object.keys(p).some((k) => /descart|faltou|catalogo/i.test(k)) ? "SIM" : "NÃO"}`);
}

console.log("\nfim dos controles.\n");
