/** Mede a ESCALA de cada achado da bancada na grade inteira. Temporário. */
import { gerarPlano } from "@/lib/gps/periodizacao";
import { getExercise } from "@/data/exercises";

const primario = (slug: string) => {
  const ex = getExercise(slug);
  if (!ex) return undefined;
  return ex.ativacao.filter((a) => a.papel === "primário").sort((a, b) => b.percentual - a.percentual)[0]?.musculo;
};
const PUSH = new Set(["Peitoral maior", "Deltoide", "Deltoide anterior", "Tríceps braquial"]);
const PULL = new Set(["Latíssimo do dorso", "Trapézio médio", "Trapézio inferior", "Romboides", "Bíceps braquial", "Deltoide posterior"]);
const JOELHO = new Set(["Quadríceps", "Reto femoral"]);
const QUADRIL = new Set(["Glúteo máximo", "Isquiotibiais"]);
const MENOR = new Set(["Flexores do punho", "Extensores do punho", "Braquiorradial", "Ancôneo", "Flexores profundos do pescoço"]);

const objetivos = ["Hipertrofia", "Emagrecimento", "Força", "Resistência muscular", "Retorno ao treino", "Aprendizado técnico"];
const niveis = ["Iniciante", "Intermediário", "Avançado"];
const condicoes = [undefined, "hipertensao-estagio-1", "diabetes-tipo-2", "osteoartrite-joelho", "obesidade-grau-2", "dor-lombar-inespecifica", "idoso-destreinado", "pos-parto"];

let total = 0;
const semCore: string[] = [];
const semQuadril: string[] = [];
const semJoelho: string[] = [];
const semPuxar: string[] = [];
const desequilibrio: string[] = [];
const comMenor: string[] = [];
const repetido: string[] = [];

for (const objetivo of objetivos)
  for (const nivel of niveis)
    for (const frequencia of [2, 3, 4, 5])
      for (const grupoEspecial of condicoes) {
        let g;
        try {
          g = gerarPlano({ objetivo: objetivo as never, nivel: nivel as never, semanas: 12, frequencia, idade: 40, grupoEspecial } as never);
        } catch {
          continue;
        }
        const w = g.principal.mesociclos.flatMap((m) => m.microciclos).find((x) => x.tipo === "carga");
        if (!w) continue;
        const sess = w.sessoes.filter((s) => !(s as { complemento?: boolean }).complemento);
        const forca = sess.flatMap((s) => s.blocos.filter((b) => b.tipo === "forca"));
        if (!forca.length) continue;
        total++;
        const rot = `${objetivo}/${nivel}/${frequencia}x/${grupoEspecial ?? "sem cond"}`;
        let push = 0, pull = 0, joelho = 0, quadril = 0, core = 0, menor = 0;
        const vezes = new Map<string, number>();
        for (const b of forca) {
          const slug = (b as { exercicioSlug?: string }).exercicioSlug ?? "";
          const ex = getExercise(slug);
          if (!ex) continue;
          const n = (b as { seriesAlvo?: number }).seriesAlvo ?? 1;
          vezes.set(slug, (vezes.get(slug) ?? 0) + 1);
          const p = primario(slug) ?? "";
          if (ex.grupoMuscular === "Core (tronco)") core += n;
          if (PUSH.has(p)) push += n;
          if (PULL.has(p)) pull += n;
          if (ex.grupoMuscular === "Membros inferiores") {
            if (JOELHO.has(p)) joelho += n;
            if (QUADRIL.has(p)) quadril += n;
          }
          if (MENOR.has(p)) menor += n;
        }
        if (core === 0) semCore.push(rot);
        if (quadril === 0) semQuadril.push(rot);
        if (joelho === 0) semJoelho.push(rot);
        if (pull === 0) semPuxar.push(rot);
        else if (push / pull > 2 || pull / push > 2) desequilibrio.push(`${rot} (${push}:${pull})`);
        if (menor > 0 && frequencia <= 3) comMenor.push(rot);
        for (const [s, v] of vezes) if (v > 1) { repetido.push(`${rot} · ${getExercise(s)?.nome} ${v}x`); break; }
      }

const linha = (nome: string, lista: string[]) =>
  `${nome.padEnd(38)} ${String(lista.length).padStart(4)} de ${total} (${Math.round((100 * lista.length) / total)}%)`;

console.log(`\n===== ESCALA DOS ACHADOS (${total} planos) =====`);
console.log(linha("semana SEM core", semCore));
console.log(linha("semana SEM dominante de quadril", semQuadril));
console.log(linha("semana SEM dominante de joelho", semJoelho));
console.log(linha("semana SEM nenhum puxar", semPuxar));
console.log(linha("empurrar/puxar acima de 2:1", desequilibrio));
console.log(linha("exercício acessório menor em <=3x", comMenor));
console.log(linha("exercício repetido na semana", repetido));

const amostra = (nome: string, l: string[]) => l.length && console.log(`\n-- ${nome} (amostra) --\n  ` + l.slice(0, 12).join("\n  "));
amostra("sem core", semCore);
amostra("sem quadril", semQuadril);
amostra("desequilíbrio", desequilibrio);
amostra("acessório menor", comMenor);
