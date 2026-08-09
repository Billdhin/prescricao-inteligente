/**
 * BANCADA DE INTEGRIDADE: as invariantes que a bancada de cenários NÃO cobre.
 *
 * A `bancada-cenarios` procura incoerência entre o que o plano DIZ e o que ele PRESCREVE.
 * Esta procura outra coisa: se o plano é internamente consistente e se ele aguenta entrada
 * de borda. São as perguntas que ninguém tinha feito ao motor ainda.
 *
 * Roda à mão: `npx tsx scripts/bancada-integridade.ts`.
 */
import { gerarPlano } from "@/lib/gps/periodizacao";
import { specialGroups } from "@/data/specialGroups";
import { exercises } from "@/data/exercises";
import { getFaixa } from "@/data/periodizacao";
import { intervaloDe } from "@/lib/gps/faixasParse";

type Achado = { classe: string; cen: string; detalhe: string };
const achados: Achado[] = [];
const anotar = (classe: string, cen: string, detalhe: string) => achados.push({ classe, cen, detalhe });

const OBJETIVOS = ["Hipertrofia", "Emagrecimento", "Força", "Resistência muscular", "Retorno ao treino"] as const;
const NIVEIS = ["Iniciante", "Intermediário", "Avançado"] as const;
const SLUGS = new Set(exercises.map((e) => e.slug));

const semanasDe = (p: ReturnType<typeof gerarPlano>) =>
  p.principal.mesociclos.flatMap((m) => m.microciclos.map((w) => ({ meso: m, w })));

/** Assinatura de dose do plano inteiro, sem ids (que são únicos por construção). */
const assinatura = (p: ReturnType<typeof gerarPlano>) =>
  semanasDe(p)
    .map(({ w }) =>
      w.sessoes
        .map((s) =>
          s.blocos
            .map((b) =>
              b.tipo === "forca"
                ? `F:${b.exercicioSlug}:${b.seriesAlvo}x${b.repsAlvo}r${b.rirAlvo}c${b.cargaRelativaAlvo}i${b.intervaloAlvoSeg}`
                : `A:${b.modalidade}:${b.formato}:${b.duracaoAlvoMin}:${b.rpeAlvo}`,
            )
            .join(","),
        )
        .join("|"),
    )
    .join("//");

let planos = 0;

/* ---------------- matriz principal ---------------- */
for (const g of [undefined, ...specialGroups.map((s) => s.slug)])
  for (const objetivo of OBJETIVOS)
    for (const nivel of NIVEIS)
      for (const [semanas, frequencia] of [
        [1, 1],
        [2, 2],
        [4, 6],
        [12, 3],
        [48, 5],
      ] as const) {
        const cen = `${g ?? "sem"}/${objetivo}/${nivel}/${semanas}sem/${frequencia}x`;
        let p: ReturnType<typeof gerarPlano>;
        try {
          p = gerarPlano({ objetivo, nivel, semanas, frequencia, grupoEspecial: g });
        } catch (e) {
          anotar("EXPLODIU", cen, String(e).slice(0, 120));
          continue;
        }
        planos++;
        const faixa = getFaixa(objetivo);
        const serIv = intervaloDe(faixa.series.valor);
        const semanasPlano = semanasDe(p);

        /* A. DETERMINISMO: o mesmo pedido tem de dar o mesmo plano. */
        if (planos % 7 === 0) {
          const p2 = gerarPlano({ objetivo, nivel, semanas, frequencia, grupoEspecial: g });
          if (assinatura(p) !== assinatura(p2)) anotar("NAO DETERMINISTICO", cen, "duas geracoes iguais deram doses diferentes");
        }

        /* B. CALENDARIO: as semanas vao de 1 a N, sem buraco e sem repetida. */
        const nums = semanasPlano.map((x) => x.w.semana);
        const esperado = Array.from({ length: semanas }, (_, i) => i + 1);
        if (nums.length !== semanas || nums.some((n, i) => n !== esperado[i]))
          anotar("CALENDARIO QUEBRADO", cen, `semanas=[${nums.slice(0, 8).join(",")}...] esperado 1..${semanas}`);

        /* C. FREQUENCIA: carga tem a frequencia pedida; descarga tem uma a menos, nunca zero. */
        for (const { w } of semanasPlano) {
          const alvoFreq = w.tipo === "deload" ? Math.max(1, frequencia - 1) : frequencia;
          if (w.sessoes.length !== alvoFreq)
            anotar("FREQUENCIA ERRADA", cen, `semana ${w.semana} (${w.tipo}) tem ${w.sessoes.length} sessoes, esperado ${alvoFreq}`);
          if (w.sessoes.length === 0) anotar("SEMANA VAZIA", cen, `semana ${w.semana} sem sessao`);
        }

        for (const { w } of semanasPlano)
          for (const s of w.sessoes)
            for (const b of s.blocos) {
              /* D. EXERCICIO REAL: nenhum bloco aponta para slug que nao existe. */
              if (b.tipo === "forca" && b.exercicioSlug && !SLUGS.has(b.exercicioSlug))
                anotar("SLUG FANTASMA", cen, `bloco aponta para "${b.exercicioSlug}", que nao esta no catalogo`);

              /*
               * E. NADA DE NaN NEM "undefined" CHEGANDO AO TEXTO.
               *
               * O campo `id` fica de fora, e o motivo vale registrado porque foi o único
               * "achado" da primeira execução desta bancada: os ids são `blk-<base36>-<base36>`,
               * e 1.112.745 em base 36 é escrito exatamente "null". Com 1800 planos num
               * processo só, o contador chega lá e nasce um id terminado em "-null", que é
               * string válida e inofensiva. Era a sonda errada, não o motor.
               */
              for (const [campo, v] of Object.entries(b)) {
                if (campo === "id") continue;
                if (typeof v === "number" && !Number.isFinite(v)) anotar("NUMERO INVALIDO", cen, `${campo}=${v}`);
                if (typeof v === "string" && /\bNaN\b|\bundefined\b|\bnull\b/.test(v))
                  anotar("TEXTO COM LIXO", cen, `${campo}="${v.slice(0, 60)}"`);
              }

              /* F. ALVO DENTRO DA FAIXA CITADA (series). */
              if (b.tipo === "forca" && b.seriesAlvo != null && serIv) {
                if (b.seriesAlvo < serIv.min || b.seriesAlvo > serIv.max)
                  anotar("ALVO FORA DA FAIXA", cen, `seriesAlvo=${b.seriesAlvo} fora de ${serIv.min} a ${serIv.max}`);
              }
            }

        /* G. A DESCARGA REDUZ DE VERDADE: volume abaixo da carga mais leve do mesmo meso. */
        for (const m of p.principal.mesociclos) {
          const vol = (w: (typeof m.microciclos)[number]) => {
            let t = 0;
            for (const s of w.sessoes)
              for (const b of s.blocos)
                if (b.tipo === "forca" && b.seriesAlvo != null && b.repsAlvo != null) t += b.seriesAlvo * b.repsAlvo;
            return t;
          };
          const cargas = m.microciclos.filter((w) => w.tipo === "carga").map(vol).filter((v) => v > 0);
          const deloads = m.microciclos.filter((w) => w.tipo === "deload").map(vol).filter((v) => v > 0);
          if (!cargas.length || !deloads.length) continue;
          const maisLeve = Math.min(...cargas);
          for (const d of deloads)
            if (d > maisLeve)
              anotar("DESCARGA NAO REDUZ", cen, `${m.nome}: descarga com volume ${d} acima da carga mais leve (${maisLeve})`);
        }

        /* H. O PLANO TEM O QUE O ALUNO FAZ. */
        const totalBlocos = semanasPlano.reduce((n, x) => n + x.w.sessoes.reduce((k, s) => k + s.blocos.length, 0), 0);
        if (totalBlocos === 0) anotar("PLANO SEM BLOCO", cen, "nenhum bloco em nenhuma semana");
      }

/* ------------------------------- relatório -------------------------------- */
console.log(`\nBANCADA DE INTEGRIDADE: ${planos} planos gerados.\n`);
if (!achados.length) {
  console.log("Nenhum achado nas 8 classes varridas.\n");
} else {
  const porClasse = new Map<string, Achado[]>();
  for (const a of achados) porClasse.set(a.classe, [...(porClasse.get(a.classe) ?? []), a]);
  for (const [classe, lista] of porClasse) {
    console.log(`${classe}: ${lista.length} ocorrência(s)`);
    for (const a of lista.slice(0, 3)) console.log(`   ${a.cen}  ->  ${a.detalhe}`);
    if (lista.length > 3) console.log(`   ... e mais ${lista.length - 3}`);
    console.log("");
  }
}
