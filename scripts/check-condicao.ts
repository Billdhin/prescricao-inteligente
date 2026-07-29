/**
 * GUARDRAIL: o plano gerado respeita a CONDIÇÃO do aluno.
 *
 * Nasce de um erro real relatado pelo fundador: uma aluna com obesidade grau II
 * recebeu, no plano de 12 semanas, um exercício deitada no banco com barra. O
 * gerador escolhia exercício só por objetivo e nível; nada no caminho olhava a
 * condição. O Treino do dia já excluía esses casos, o plano não.
 *
 * O que este check trava, plano a plano, no cartesiano de objetivo x nível x
 * condição x duração:
 *   1. Nenhum exercício EXCLUÍDO pelas restrições da condição pode aparecer.
 *   2. As restrições estruturais declaradas em groupRules valem de fato (o
 *      efeito por tag é o mesmo que o Treino do dia usa).
 *   3. Autoverificação: com o filtro desligado, o cenário-controle REPROVA. Um
 *      check que passa mesmo quebrado não protege nada.
 *
 * Roda com `npm run check:condicao`.
 */
import { gerarPlano } from "../src/lib/gps/periodizacao";
import { groupGpsRules } from "../src/lib/gps/groupRules";
import { exercises } from "../src/data/exercises";
import { EFEITO_POR_TAG, criarRestricao, rotuloRestricao } from "../src/lib/gps/restricoes";
import { OBJETIVOS, type GpsObjetivo } from "../src/lib/gps/engine";
import type { Nivel } from "../src/data/types";

const NIVEIS: Nivel[] = ["Iniciante", "Intermediário", "Avançado"];
const DURACOES = [4, 12, 24];
const FREQUENCIAS = [2, 3, 5];

const problemas: string[] = [];
let planos = 0;
let blocosForca = 0;
const semCatalogo: string[] = [];

/** Exercícios que a condição EXCLUI, pelo mesmo avaliador do Treino do dia. */
function excluidosPor(slugCondicao: string): Map<string, string> {
  const tags = groupGpsRules[slugCondicao]?.restricoesEstruturais ?? [];
  const fora = new Map<string, string>();
  for (const tag of tags) {
    const avaliar = EFEITO_POR_TAG[tag];
    if (!avaliar) continue;
    const sel = criarRestricao(tag);
    for (const ex of exercises) {
      if (avaliar(ex, sel).acao === "excluir") {
        fora.set(ex.slug, `${rotuloRestricao(tag)}: ${avaliar(ex, sel).motivo}`);
      }
    }
  }
  return fora;
}

const condicoes = Object.keys(groupGpsRules).filter(
  (s) => (groupGpsRules[s].restricoesEstruturais ?? []).length > 0,
);

if (condicoes.length === 0) {
  console.error("check:condicao FALHOU: nenhuma condição declara restricoesEstruturais.");
  process.exit(1);
}

for (const grupoEspecial of condicoes) {
  const proibidos = excluidosPor(grupoEspecial);
  for (const objetivo of OBJETIVOS as GpsObjetivo[]) {
    for (const nivel of NIVEIS) {
      for (const semanas of DURACOES) {
        for (const frequencia of FREQUENCIAS) {
          const g = gerarPlano({ objetivo, nivel, semanas, frequencia, grupoEspecial });
          planos++;
          const macros = [g.principal, g.alternativa].filter(Boolean);
          for (const macro of macros) {
            for (const meso of macro!.mesociclos) {
              for (const micro of meso.microciclos) {
                for (const sessao of micro.sessoes) {
                  for (const bloco of sessao.blocos) {
                    if (bloco.tipo !== "forca" || !bloco.exercicioSlug) continue;
                    blocosForca++;
                    const motivo = proibidos.get(bloco.exercicioSlug);
                    if (motivo) {
                      problemas.push(
                        `${grupoEspecial} / ${objetivo} / ${nivel} / ${semanas}sem: "${bloco.exercicioSlug}" nao deveria entrar. ${motivo}`,
                      );
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

/* --------------------------- Cobertura do catálogo -------------------------- */
// Quantos exercícios sobram por condição. Não reprova: informa, porque catálogo
// curto é decisão de produto, não bug. Mas fica VISÍVEL, para nunca virar um
// plano que se completa com o que sobrou.
for (const grupoEspecial of condicoes) {
  const fora = excluidosPor(grupoEspecial);
  const sobram = exercises.filter((e) => !fora.has(e.slug)).length;
  if (sobram < 8) {
    semCatalogo.push(`${grupoEspecial}: ${sobram} de ${exercises.length} exercicios seguros`);
  }
}

/* ----------------------------- Autoverificação ----------------------------- */
/*
 * Prova que o check tem dentes, em duas partes:
 *
 *   (a) as tags de fato EXCLUEM alguém do catálogo (se não excluíssem nada, o
 *       check acima passaria trivialmente e não protegeria coisa nenhuma);
 *   (b) o COMPORTAMENTO ANTIGO reprovaria. Reproduzo aqui a seleção antiga
 *       (filtrar por objetivo e nível, cortar os primeiros N) e confirmo que ela
 *       traria um exercício proibido, no mesmo cenário em que o gerador atual
 *       não traz.
 *
 * A parte (b) é a que importa: sem ela, eu estaria afirmando que consertei algo
 * sem demonstrar que estava quebrado.
 */
const NIVEL_ORDEM_LOCAL: Record<Nivel, number> = { Iniciante: 0, "Intermediário": 1, "Avançado": 2 };
function selecaoAntiga(objetivo: GpsObjetivo, nivel: Nivel, n: number): string[] {
  const teto = NIVEL_ORDEM_LOCAL[nivel];
  const noNivel = (e: (typeof exercises)[number]) =>
    NIVEL_ORDEM_LOCAL[(e.nivel as Nivel) ?? "Iniciante"] <= teto;
  let pool = exercises.filter((e) => e.objetivo?.includes(objetivo) && noNivel(e));
  if (pool.length < n) pool = exercises.filter(noNivel);
  return pool.slice(0, Math.max(n, 1)).map((e) => e.slug);
}

const comExclusao = condicoes.filter((c) => excluidosPor(c).size > 0);
if (comExclusao.length === 0) {
  console.error(
    "check:condicao FALHOU na autoverificacao (a): nenhuma condicao exclui exercicio nenhum do catalogo. As tags estruturais nao estao mordendo.",
  );
  process.exit(1);
}

let provaAntiga: string | null = null;
for (const cond of comExclusao) {
  const proibidos = excluidosPor(cond);
  for (const objetivo of OBJETIVOS as GpsObjetivo[]) {
    for (const nivel of NIVEIS) {
      for (const frequencia of FREQUENCIAS) {
        const antiga = selecaoAntiga(objetivo, nivel, Math.max(4, frequencia + 2));
        const vazando = antiga.find((s) => proibidos.has(s));
        if (vazando) {
          provaAntiga = `${cond} / ${objetivo} / ${nivel} / ${frequencia}x: a selecao antiga traria "${vazando}".`;
          break;
        }
      }
      if (provaAntiga) break;
    }
    if (provaAntiga) break;
  }
  if (provaAntiga) break;
}

if (!provaAntiga) {
  console.error(
    "check:condicao FALHOU na autoverificacao (b): a selecao antiga nao traria exercicio proibido em cenario nenhum, entao este check nao demonstra o conserto.",
  );
  process.exit(1);
}
console.log(`[check:condicao] autoverificacao OK: ${provaAntiga} O gerador atual nao traz.`);

if (semCatalogo.length > 0) {
  console.log("[check:condicao] cobertura curta do catalogo (informativo, nao reprova):");
  for (const l of semCatalogo) console.log("   - " + l);
}

if (problemas.length > 0) {
  console.error(`\ncheck:condicao FALHOU (${problemas.length} ocorrencia(s)):`);
  for (const p of problemas.slice(0, 20)) console.error("  - " + p);
  if (problemas.length > 20) console.error(`  ... e mais ${problemas.length - 20}.`);
  process.exit(1);
}

console.log(
  `[check:condicao] ok: ${planos} planos e ${blocosForca} blocos de forca, nenhum exercicio incompativel com a condicao do aluno.`,
);
