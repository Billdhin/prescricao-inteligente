/**
 * BANCADA DOS CRIATIVOS: cada promessa de anúncio virada em asserção contra o motor.
 *
 * As 19 peças que vão para a gravação prometem comportamento específico ("a zona de FC sai",
 * "o teto vem do estudo", "a descarga se move"). Anúncio é promessa pública: se o produto não
 * fizer exatamente aquilo, o defeito não é de copy, é de entrega. Esta bancada roda o motor de
 * verdade com o perfil de cada peça e lê o resultado.
 *
 * ATENÇÃO ao mexer aqui: a primeira versão desta bancada reprovou quatro promessas por usar
 * nome de campo errado (`duracaoAlvo` em vez de `duracaoAlvoMin`, `equipamento` no bloco, que
 * não existe, e string em vez de `FarmacoSelecionado`). Régua com campo errado reprova produto
 * certo e aprova produto quebrado. Antes de confiar num "OK", confira que o caminho leu dado.
 *
 * Não substitui guardrail: eles protegem regra conhecida, esta lê a promessa do anúncio.
 * Roda à mão: `npx tsx scripts/bancada-criativos.ts`
 */
import { gerarPlano, type PlanoGerado } from "@/lib/gps/periodizacao";
import { groupGpsRules } from "@/lib/gps/groupRules";
import { doseDoPerfilComIdade } from "@/lib/gps/esforco";
import { parametrosInvalidosDe } from "@/lib/gps/farmacos";
import { agregadoSemana, serieSemanal } from "@/lib/gps/progressao";
import { exercises } from "@/data/exercises";

type Veredito = "OK" | "FALHA" | "PARCIAL";
const linhas: { peca: string; claim: string; v: Veredito; nota: string }[] = [];
const diz = (peca: string, claim: string, v: Veredito, nota: string) => linhas.push({ peca, claim, v, nota });

const blocos = (p: PlanoGerado) =>
  p.principal.mesociclos.flatMap((m) => m.microciclos.flatMap((mi) => mi.sessoes.flatMap((s) => s.blocos)));
const micros = (p: PlanoGerado) => p.principal.mesociclos.flatMap((m) => m.microciclos);
const aerobios = (p: PlanoGerado) => blocos(p).filter((b) => b.tipo === "aerobio");
const forcas = (p: PlanoGerado) => blocos(p).filter((b) => b.tipo === "forca");
const AGORA = new Date("2026-01-01").toISOString();

/* ---------- C13: o betabloqueador tira a zona de FC e troca o instrumento ---------- */
{
  const inv = parametrosInvalidosDe([{ classe: "betabloqueador", criadoEm: AGORA, atualizadoEm: AGORA }]);
  const base = { objetivo: "Emagrecimento" as const, nivel: "Iniciante" as const, semanas: 12, frequencia: 3, idade: 58, fcRepouso: 70 };
  const sem = gerarPlano(base);
  const com = gerarPlano({ ...base, parametrosInvalidos: inv });
  const zSem = aerobios(sem).filter((b) => b.zonaFC).length;
  const zCom = aerobios(com).filter((b) => b.zonaFC).length;
  diz("C13", "medicação declarada retira a zona de FC", zSem > 0 && zCom === 0 ? "OK" : "FALHA",
    `controle: ${zSem}/${aerobios(sem).length} com zona sem o fármaco, ${zCom} com ele`);
  const txt = aerobios(com).map((b) => `${b.intensidade ?? ""} ${b.observacao ?? ""}`).join(" ");
  diz("C13", "entra esforço percebido no lugar", /percepção de esforço|RPE/i.test(txt) ? "OK" : "FALHA", "citado no bloco aeróbio");
  diz("C13", "e o teste da fala, como diz a tela", /teste da fala|teste da conversa/i.test(txt) ? "OK" : "FALHA",
    /teste da fala/i.test(txt) ? "“teste da fala” literal" : "só “teste da conversa”");
}

/* ---------- C21: o teto da hipertensão vem do estudo, com fonte rastreável ---------- */
{
  const r = groupGpsRules["hipertensao-estagio-1"];
  const d = doseDoPerfilComIdade(r, undefined);
  diz("C21", "hipertensão impõe teto de carga relativa", d?.cargaRelativaMax != null ? "OK" : "FALHA", `teto=${d?.cargaRelativaMax}%`);
  diz("C21", "com referência citável", (r?.refs?.length ?? 0) > 0 ? "OK" : "FALHA", (r?.refs ?? []).slice(0, 3).join(", "));
  const proc = d?.procedencia?.cargaRelativaMax;
  diz("C21", "e a origem do número rastreável na tela", proc?.de ? "OK" : "FALHA", `de=${proc?.de} ref=${(proc?.refId ?? []).join("/")}`);
}

/* ---------- C16: alvo por semana, descarga posicionada, curva = agregado ---------- */
{
  const p = gerarPlano({ objetivo: "Hipertrofia", nivel: "Intermediário", semanas: 12, frequencia: 4 });
  const ms = micros(p);
  const comAlvo = ms.filter((m) => m.sessoes.some((s) => s.blocos.some((b) => b.seriesAlvo != null)));
  diz("C16", "cada semana com alvo concreto", comAlvo.length === ms.length ? "OK" : "PARCIAL", `${comAlvo.length}/${ms.length} semanas`);
  const dl = ms.filter((m) => m.tipo === "deload");
  diz("C16", "descarga posicionada no plano", dl.length > 0 ? "OK" : "FALHA", `semanas ${dl.map((d) => d.semana).join(", ")}`);

  /* A promessa "editou a sessão, a curva move": o gráfico lê agregadoSemana, então
   * mexer numa dose tem que mover o ponto daquela semana. Editamos de verdade. */
  const antes = serieSemanal(p.principal)[0]?.vol;
  const alvo = p.principal.mesociclos[0].microciclos[0].sessoes[0].blocos.find((b) => b.seriesAlvo != null);
  if (alvo) alvo.seriesAlvo = (alvo.seriesAlvo ?? 3) + 3;
  const depois = serieSemanal(p.principal)[0]?.vol;
  diz("C16", "editar a sessão move a curva", antes !== depois ? "OK" : "FALHA", `vol normalizado ${antes} → ${depois}`);
}

/* ---------- C17: a descarga do perfil reativo é mais frequente ---------- */
{
  const base = { objetivo: "Hipertrofia" as const, nivel: "Intermediário" as const, semanas: 12, frequencia: 4 };
  const conta = (g?: string) => micros(gerarPlano({ ...base, grupoEspecial: g })).filter((m) => m.tipo === "deload").length;
  const semCond = conta();
  const ht1 = conta("hipertensao-estagio-1"), ht2 = conta("hipertensao-estagio-2"), ob3 = conta("obesidade-grau-3");
  diz("C17", "hipertensão dá descarga mais frequente (o exemplo do roteiro)", ht1 > semCond || ht2 > semCond ? "OK" : "FALHA",
    `sem condição ${semCond} · estágio 1: ${ht1} · estágio 2: ${ht2}`);
  diz("C17", "algum perfil aumenta a frequência da descarga", ob3 > semCond ? "OK" : "FALHA", `obesidade grau 3: ${ob3} vs ${semCond}`);
}

/* ---------- C20: a dose sai com os três elementos juntos ---------- */
{
  const p = gerarPlano({ objetivo: "Força", nivel: "Intermediário", semanas: 8, frequencia: 3 });
  const f = forcas(p);
  const completos = f.filter((b) => b.seriesAlvo != null && b.repsAlvo != null && b.rirAlvo != null && b.intervaloAlvoSeg != null);
  diz("C20", "séries/reps + reserva + intervalo no mesmo bloco", completos.length === f.length ? "OK" : "PARCIAL",
    `${completos.length}/${f.length} blocos de força`);
}

/* ---------- C12: a idade sozinha muda a dose ---------- */
{
  const base = { objetivo: "Hipertrofia" as const, nivel: "Iniciante" as const, semanas: 12, frequencia: 3 };
  const rirMin = (p: PlanoGerado) => Math.min(...forcas(p).map((b) => b.rirAlvo!).filter((n) => Number.isFinite(n)));
  const j = rirMin(gerarPlano({ ...base, idade: 28 })), i = rirMin(gerarPlano({ ...base, idade: 72 }));
  diz("C12", "idade muda a dose sem condição declarada", i > j ? "OK" : "FALHA", `RIR mínimo: 28 anos = ${j} · 72 anos = ${i}`);
  const proc = doseDoPerfilComIdade(undefined, 72)?.procedencia?.rirMinimo;
  diz("C12", "com procedência própria (“idade”)", proc?.de ? "OK" : "FALHA", `de=${proc?.de}`);
}

/* ---------- C10: o objetivo secundário desempata ---------- */
{
  const OBJ = ["Hipertrofia", "Emagrecimento", "Força", "Resistência muscular"] as const;
  const sel = (p: PlanoGerado) => forcas(p).map((b) => b.nome).join("|");
  let mudou = 0, pares = 0;
  for (const a of OBJ) for (const b of OBJ) {
    if (a === b) continue;
    pares++;
    const so = gerarPlano({ objetivo: a, nivel: "Iniciante", semanas: 8, frequencia: 3 });
    const du = gerarPlano({ objetivo: a, nivel: "Iniciante", semanas: 8, frequencia: 3, objetivoSecundario: b });
    if (sel(so) !== sel(du)) mudou++;
  }
  diz("C10", "o secundário desempata a seleção", mudou > 0 ? (mudou === pares ? "OK" : "PARCIAL") : "FALHA",
    `muda em ${mudou} de ${pares} pares de objetivo`);
}

/* ---------- C10 e C23: o equipamento filtra o catálogo ---------- */
{
  const casa = gerarPlano({ objetivo: "Hipertrofia", nivel: "Iniciante", semanas: 8, frequencia: 3, equipamentos: ["Halteres", "Elástico"] });
  const eq = new Set(forcas(casa).map((b) => exercises.find((e) => e.slug === b.exercicioSlug)?.equipamento ?? "?"));
  const fora = [...eq].filter((e) => !["Peso corporal", "Halteres", "Elástico"].includes(e));
  diz("C23", "catálogo filtrado pelo equipamento declarado", fora.length === 0 ? "OK" : "FALHA",
    fora.length ? `apareceu: ${fora.join(", ")}` : `usou: ${[...eq].join(", ")}`);
  diz("C23", "a periodização continua no plano de casa",
    micros(casa).every((m) => m.sessoes.some((s) => s.blocos.some((b) => b.seriesAlvo != null))) ? "OK" : "PARCIAL",
    `${micros(casa).length} semanas com alvo`);
}

/* ---------- C29 e C28: perfis próprios ---------- */
for (const [peca, slug, nome] of [["C29", "retorno-inatividade", "retorno após inatividade"], ["C28", "gestante", "gestante"]] as const) {
  const r = groupGpsRules[slug];
  diz(peca, `${nome} é perfil com regra própria`, r ? "OK" : "FALHA", r?.nome ?? "ausente");
  diz(peca, "ajusta a progressão", r?.modProgressao ? "OK" : "PARCIAL", r?.modProgressao ? "modProgressao presente" : "sem modProgressao");
  diz(peca, "com referência citável", (r?.refs?.length ?? 0) > 0 ? "OK" : "FALHA", (r?.refs ?? []).slice(0, 3).join(", "));
}

/* ---------- C02: o plano nasce montado e a alternativa existe ---------- */
{
  const p = gerarPlano({ objetivo: "Hipertrofia", nivel: "Iniciante", semanas: 12, frequencia: 3, idade: 40, equipamentos: ["Halteres"] });
  diz("C02", "o plano nasce montado com periodização", micros(p).length === 12 && forcas(p).length > 0 ? "OK" : "FALHA",
    `${micros(p).length} semanas, ${forcas(p).length} blocos de força`);
  diz("C02", "existe periodização alternativa para trocar", p.alternativa ? "OK" : "PARCIAL",
    p.alternativa ? `alternativa: ${p.modeloAltId}` : "sem alternativa neste perfil (o motor a esconde quando o plano sairia idêntico)");
  const semAlt = ["Hipertrofia", "Emagrecimento", "Força", "Resistência muscular"].filter((o) =>
    !gerarPlano({ objetivo: o as never, nivel: "Iniciante", semanas: 12, frequencia: 3 }).alternativa).length;
  diz("C02", "e ela aparece na maioria dos perfis", semAlt === 0 ? "OK" : "PARCIAL", `${4 - semAlt} de 4 objetivos com alternativa`);
}

/* ---------- C26: o agregado da semana é o que a progressão lê ---------- */
{
  const p = gerarPlano({ objetivo: "Hipertrofia", nivel: "Intermediário", semanas: 8, frequencia: 3 });
  const a = agregadoSemana(p.principal.mesociclos[0].microciclos[0]);
  diz("C26", "a semana tem volume e esforço agregados (base do prescrito)", a.volume > 0 ? "OK" : "FALHA",
    `volume=${a.volume} esforço=${a.intensidade ?? "n/d"}`);
}

/* ------------------------------- Relatório ------------------------------- */
const cor = { OK: "\x1b[32m", FALHA: "\x1b[31m", PARCIAL: "\x1b[33m" };
let falhas = 0, parciais = 0;
for (const l of linhas) {
  if (l.v === "FALHA") falhas++;
  if (l.v === "PARCIAL") parciais++;
  console.log(`${cor[l.v]}${l.v.padEnd(7)}\x1b[0m ${l.peca}  ${l.claim.padEnd(54)} ${l.nota}`);
}
console.log(`\n${linhas.length} promessas testadas · ${linhas.length - falhas - parciais} OK · ${parciais} parciais · ${falhas} falhas.`);
