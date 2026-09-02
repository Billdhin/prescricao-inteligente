/**
 * check:acervo — escolher um exercício não pode virar rolagem às cegas.
 *
 * Pedido de campo (colega do Filipe, personal, 02/09/2026): filtro por grupamento muscular
 * no seletor "Escolher do acervo", que listava 101 itens sem cabeçalho nenhum. As
 * invariantes que a correção precisa manter:
 *
 *  1. TODO exercício continua alcançável. Agrupar não pode esconder item nenhum: o
 *     profissional que quer um exercício específico tem que achá-lo.
 *  2. O RANKING SOBREVIVE DENTRO DO GRUPO. A ordem nunca foi alfabética por acaso: é a
 *     recomendação de segurança e pertinência daquele aluno. Agrupar sem preservar a ordem
 *     jogaria fora a inteligência que o produto vende.
 *  3. A ORDEM DOS GRUPOS É FIXA. Seção que muda de lugar a cada aluno impede a memória de
 *     uso de quem abre o seletor vinte vezes por dia.
 *  4. O QUE O ALUNO NÃO TEM COMO EXECUTAR fica separado e dito. Para uma aluna com halteres
 *     e elástico em casa, 41 dos 101 itens eram de equipamento que ela não tem, misturados
 *     aos disponíveis.
 *
 * Roda em `npm run check`.
 */
import { exercises } from "@/data/exercises";
import { sugerirTroca } from "@/lib/gps/sugerirTroca";
import { GRUPOS_MUSCULARES } from "@/lib/gps/engine";
import { acervoRanqueadoAgrupado, acervoAlfabeticoAgrupado, ROTULO_SEM_EQUIPAMENTO } from "@/lib/gps/acervoAgrupado";

const falhas: string[] = [];
const ok = (m: string) => console.log(`[check:acervo] ok: ${m}`);
const falha = (m: string) => falhas.push(m);

/* O caso do pedido: aluna com hipertensão, dor no joelho, treinando em casa. */
const ctx = {
  objetivo: "Emagrecimento" as const,
  nivel: "Iniciante" as const,
  restricoes: [{ id: "dor-joelho", intensidade: "moderada" }] as never,
  equipamentos: ["Halter", "Elástico", "Peso corporal"],
  grupoEspecial: "hipertensao-estagio-1",
};
const recs = sugerirTroca(ctx as never);
const grupos = acervoRanqueadoAgrupado(recs);

/* 1. Nada some. */
{
  const listados = grupos.flatMap((g) => g.exercicios.map((e) => e.slug));
  const perdidos = recs.map((r) => r.exercise.slug).filter((s) => !listados.includes(s));
  if (perdidos.length) falha(`${perdidos.length} exercício(s) sumiram ao agrupar: ${perdidos.slice(0, 3).join(", ")}`);
  else if (new Set(listados).size !== listados.length) falha("o agrupamento duplicou exercício");
  else ok(`os ${listados.length} exercícios do acervo continuam alcançáveis, sem repetir`);
}

/* 2. O ranking sobrevive dentro do grupo. */
{
  const posicao = new Map(recs.map((r, i) => [r.exercise.slug, i]));
  const fora = grupos
    .flatMap((g) => g.exercicios.map((e, i) => ({ g: g.rotulo, e, i })))
    .filter(({ g, e, i }) => {
      const irmaos = grupos.find((x) => x.rotulo === g)!.exercicios;
      return i > 0 && posicao.get(irmaos[i - 1].slug)! > posicao.get(e.slug)!;
    });
  if (fora.length) falha(`o agrupamento embaralhou o ranking em ${fora.length} ponto(s): ${fora[0].g}`);
  else ok("dentro de cada grupo, a ordem continua sendo a do ranking do aluno");

  const primeiro = grupos[0]?.exercicios[0];
  const melhorDoGrupo = recs.find((r) => r.equipDisponivel && r.exercise.grupoMuscular === grupos[0]?.rotulo);
  if (primeiro && melhorDoGrupo && primeiro.slug !== melhorDoGrupo.exercise.slug)
    falha(`o primeiro item de "${grupos[0].rotulo}" não é o mais indicado do grupo`);
  else ok(`o primeiro item de "${grupos[0]?.rotulo}" é o mais indicado daquele grupo para o aluno`);
}

/* 3. A ordem dos grupos é a canônica, e não muda com o aluno. */
{
  const canonica = [...GRUPOS_MUSCULARES];
  const musculares = grupos.map((g) => g.rotulo).filter((r) => r !== ROTULO_SEM_EQUIPAMENTO);
  const conhecidos = musculares.filter((r) => canonica.includes(r));
  const ordenados = [...conhecidos].sort((a, b) => canonica.indexOf(a) - canonica.indexOf(b));
  if (conhecidos.join("|") !== ordenados.join("|")) falha(`a ordem dos grupos fugiu da canônica: ${conhecidos.join(", ")}`);
  else ok(`a ordem dos grupos é a do catálogo: ${conhecidos.join(", ")}`);

  const outro = acervoRanqueadoAgrupado(
    sugerirTroca({ ...ctx, objetivo: "Hipertrofia", grupoEspecial: undefined, restricoes: [] } as never),
  );
  const rotulosOutro = outro.map((g) => g.rotulo).filter((r) => canonica.includes(r));
  const mesmaOrdem = rotulosOutro.every((r, i) => canonica.indexOf(r) >= (i > 0 ? canonica.indexOf(rotulosOutro[i - 1]) : -1));
  if (!mesmaOrdem) falha("a ordem das seções mudou com outro aluno: o profissional perde a memória de uso");
  else ok("outro aluno recebe as mesmas seções na mesma ordem");
}

/* 4. O que ela não tem como executar fica separado e dito. */
{
  const semEquip = grupos.find((g) => g.rotulo === ROTULO_SEM_EQUIPAMENTO);
  const esperados = recs.filter((r) => !r.equipDisponivel).length;
  if (!esperados) falha("o caso de teste deixou de ter exercício fora do equipamento: ele não prova mais nada");
  else if (!semEquip) falha(`${esperados} exercícios fora do equipamento continuam misturados aos disponíveis`);
  else if (semEquip.exercicios.length !== esperados)
    falha(`grupo de equipamento com ${semEquip.exercicios.length} itens, esperados ${esperados}`);
  else ok(`os ${esperados} exercícios fora do equipamento declarado ficam num grupo próprio, no fim`);

  const disponiveis = grupos.filter((g) => g.rotulo !== ROTULO_SEM_EQUIPAMENTO).flatMap((g) => g.exercicios.map((e) => e.slug));
  const vazado = recs.filter((r) => !r.equipDisponivel && disponiveis.includes(r.exercise.slug));
  if (vazado.length) falha(`${vazado.length} exercício(s) sem equipamento vazaram para os grupos musculares`);
  else ok("nenhum exercício fora do equipamento aparece entre os disponíveis");
}

/* Plano avulso (sem perfil): alfabético dentro do grupo, e nada de grupo de equipamento. */
{
  const g = acervoAlfabeticoAgrupado(exercises);
  const total = g.flatMap((x) => x.exercicios).length;
  if (total !== exercises.length) falha(`o acervo avulso perdeu itens: ${total} de ${exercises.length}`);
  else if (g.some((x) => x.rotulo === ROTULO_SEM_EQUIPAMENTO)) falha("plano avulso criou grupo de equipamento sem ter perfil");
  else {
    const primeiro = g[0].exercicios;
    const alfabetico = [...primeiro].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    if (primeiro.map((e) => e.slug).join("|") !== alfabetico.map((e) => e.slug).join("|"))
      falha("no plano avulso a ordem dentro do grupo não é alfabética");
    else ok(`plano avulso: ${exercises.length} exercícios agrupados, alfabéticos dentro de cada grupo`);
  }
}

if (falhas.length) {
  console.error(`\n[check:acervo] ${falhas.length} falha(s):`);
  for (const f of falhas) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log("[check:acervo] tudo certo.");
