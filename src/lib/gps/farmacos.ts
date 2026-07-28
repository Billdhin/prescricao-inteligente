/**
 * A PORTA da camada de fármacos para o motor (distinta de src/data/farmacos.ts, que é o
 * catálogo). Aqui moram as funções puras que transformam o perfil do aluno (grupos clínicos
 * mais classes de medicação declaradas) no que o motor já sabe consumir:
 *
 * - `regraDoPerfil`: uma GroupGpsRule só, com os cuidados e as referências das duas fontes;
 * - `modProgressaoDoPerfil`: o modificador de progressão combinado;
 * - `monitoramentoDoPerfil`: qual instrumento deixa de guiar a intensidade e qual entra;
 * - `parametrosInvalidosDe`: o atalho que o gerador do plano consome.
 *
 * REGRA DE OURO desta camada: fármaco é CONTRIBUINTE de regra, não motor novo. Nenhuma
 * decisão nova nasce aqui; o que nasce é uma regra com a MESMA forma das regras de grupo, que
 * entra pela fusão que já existe (fundirRegras/fundirModProgressao em groupRules.ts,
 * fundirMonitoramento no catálogo) e herda de graça o ranking, os cuidados do prontuário e o
 * passo de carga. Por isso um aluno SEM fármaco declarado tem saída byte-idêntica à de antes
 * desta camada existir: sem classe, nenhuma regra nova entra na fusão.
 *
 * Nesta versão NENHUMA classe altera teto de esforço nem passo de carga (ver a observação no
 * catálogo): as regras de fármaco nascem sem `modProgressao`, sem penalidade e sem
 * complexidadeMax, então a fusão só pode APERTAR, nunca afrouxar o que a condição definiu.
 */

import {
  CATALOGO_FARMACOS,
  farmacosAtivos,
  fundirMonitoramento,
  itemDaClasse,
  type ConsequenciaTreino,
  type EfeitoMonitoramento,
  type FarmacoCatalogoItem,
  type FarmacoSelecionado,
} from "@/data/farmacos";
import type { ParamMonitorId } from "@/data/monitoringParameters";
import {
  combineRules,
  fundirModProgressao,
  fundirRegras,
  getGroupRule,
  type GroupGpsRule,
  type ModProgressao,
} from "@/lib/gps/groupRules";

/** O perfil que a camada lê: as condições clínicas e o que foi declarado de medicação. */
export interface PerfilFarmacos {
  /** slugs de grupos especiais do aluno (principal + condições de atenção) */
  grupos?: (string | undefined)[];
  /** classes declaradas; ausente ou vazio = nenhuma classe entra na fusão */
  farmacos?: FarmacoSelecionado[];
  /** o profissional declarou que não sabe ou prefere não informar (ver o fail-safe abaixo) */
  farmacosNaoInformado?: boolean;
}

/** Consequência que pode chegar ao profissional como conduta (a teoria fica de fora). */
function agePorConduta(c: ConsequenciaTreino): boolean {
  return c.aprovacao === "aprovada" && !c.somenteTeoria;
}

/**
 * A regra de UMA classe, na forma de GroupGpsRule. Só entram as consequências APROVADAS e que
 * não são de teoria: "expectativa de adaptação" nunca vira cuidado, card de ação nem prontuário
 * (o pior desfecho desta feature é o profissional repassar uma expectativa de adaptação ao
 * aluno e o aluno interromper por conta própria o que foi prescrito).
 *
 * Sem penalidade, sem complexidadeMax e sem modProgressao de propósito: a classe acrescenta
 * cuidado e bibliografia, e não mexe no que o perfil clínico já apertou.
 */
function regraDaClasse(item: FarmacoCatalogoItem): GroupGpsRule | undefined {
  const agem = item.consequencias.filter(agePorConduta);
  if (!agem.length) return undefined;
  const cuidados: string[] = [];
  for (const c of agem) if (!cuidados.includes(c.descricao)) cuidados.push(c.descricao);
  if (!cuidados.includes(item.devolucao)) cuidados.push(item.devolucao);
  const refs: string[] = [];
  for (const c of agem) for (const r of c.refId) if (!refs.includes(r)) refs.push(r);
  return {
    // prefixo `farmaco:` para nenhum consumidor confundir isto com slug de grupo especial:
    // declarar uma classe NUNCA infere condição clínica no aluno.
    slug: `farmaco:${item.classe}`,
    nome: item.titulo,
    cuidados,
    penalidades: [],
    refs,
  };
}

/** As regras das classes declaradas, na ordem do catálogo (saída determinística). */
function regrasDosFarmacos(farmacos: FarmacoSelecionado[] | undefined): GroupGpsRule[] {
  return farmacosAtivos(farmacos)
    .map((f) => itemDaClasse(f.classe))
    .filter((i): i is FarmacoCatalogoItem => Boolean(i))
    .map(regraDaClasse)
    .filter((r): r is GroupGpsRule => Boolean(r));
}

/**
 * A regra combinada do perfil: condições clínicas primeiro, classes declaradas depois, tudo
 * pela mesma lei de conservadorismo de `fundirRegras`. Sem classe declarada, o resultado é
 * exatamente `combineRules(grupos)`, que é o que mantém o caminho sem fármaco intacto.
 */
export function regraDoPerfil(perfil: PerfilFarmacos): GroupGpsRule | undefined {
  const slugs = (perfil.grupos ?? []).filter((s): s is string => Boolean(s));
  const doFarmaco = regrasDosFarmacos(perfil.farmacos);
  if (!doFarmaco.length) return combineRules(slugs);
  const doGrupo = slugs.map(getGroupRule).filter((r): r is GroupGpsRule => Boolean(r));
  return fundirRegras([...doGrupo, ...doFarmaco]);
}

/**
 * O modificador de progressão do perfil. Hoje nenhuma classe declara modificador, então o
 * resultado é o das condições clínicas; a função existe para que, quando houver evidência para
 * uma classe apertar o passo, ela entre pela mesma fusão por mínimo, sem caminho novo.
 */
export function modProgressaoDoPerfil(perfil: PerfilFarmacos): ModProgressao | undefined {
  const slugs = (perfil.grupos ?? []).filter((s): s is string => Boolean(s));
  const mods: ModProgressao[] = [];
  for (const s of slugs) {
    const m = getGroupRule(s)?.modProgressao;
    if (m) mods.push(m);
  }
  for (const r of regrasDosFarmacos(perfil.farmacos)) if (r.modProgressao) mods.push(r.modProgressao);
  return fundirModProgressao(mods);
}

/**
 * Grupos em que uma classe que INVALIDA a frequência cardíaca costuma aparecer. Derivado do
 * próprio catálogo (`gruposRelevantes` das classes com consequência aprovada de monitoramento
 * que invalida `p-fc`), e não de uma lista escrita à mão: assim a lista não envelhece sozinha
 * quando o catálogo mudar, e ninguém precisa adivinhar quais condições "são cardiovasculares".
 */
function gruposDeRiscoParaFC(): string[] {
  const out: string[] = [];
  for (const item of CATALOGO_FARMACOS) {
    const invalidaFC = item.consequencias.some(
      (c) => agePorConduta(c) && (c.monitoramento?.invalidam ?? []).includes("p-fc"),
    );
    if (!invalidaFC) continue;
    for (const g of item.gruposRelevantes) if (!out.includes(g)) out.push(g);
  }
  return out;
}

/**
 * FAIL-SAFE DO DESCONHECIDO (decisão do fundador).
 *
 * Quando o profissional declara que NÃO SABE ou prefere não informar a medicação, e o perfil
 * tem condição em que as classes que alteram a leitura da frequência cardíaca são frequentes
 * (hipertensão estágio 1 ou 2 e os demais grupos derivados acima), o sistema trata a frequência
 * cardíaca como pouco confiável e guia a intensidade por esforço percebido e teste da fala.
 *
 * O ponto delicado: isto NÃO afirma nada sobre o aluno. O produto não diz que ele usa alguma
 * classe, nem qual, nem infere condição a partir de medicação. Ele apenas deixa de usar um
 * instrumento cuja confiabilidade não pode ser garantida com a informação que tem, e cai no
 * caminho honesto que já existia antes de qualquer fármaco (duração mais percepção de esforço).
 * É a mesma lógica fail-closed do semáforo: na dúvida, o lado seguro é o que custa menos.
 */
function efeitoFailSafe(perfil: PerfilFarmacos): EfeitoMonitoramento | undefined {
  if (!perfil.farmacosNaoInformado) return undefined;
  const slugs = (perfil.grupos ?? []).filter((s): s is string => Boolean(s));
  const risco = gruposDeRiscoParaFC();
  if (!slugs.some((s) => risco.includes(s))) return undefined;
  return {
    invalidam: ["p-fc"],
    substituem: ["p-rpe", "p-fala"],
    motivo:
      "A medicação em uso não foi informada e o perfil tem condição em que classes que mudam a resposta da frequência cardíaca ao esforço são frequentes. Enquanto a informação não vier, a intensidade é guiada por percepção de esforço e teste da fala, sem que o produto afirme nada sobre este aluno.",
    // Sem refId: as referências do catálogo sustentam a troca de instrumento SOB uma classe em
    // uso, e não uma decisão tomada na ausência de informação. Citá-las aqui seria empurrar
    // evidência para uma afirmação que ela não faz.
  };
}

/**
 * O efeito de monitoramento combinado do perfil: o que sai de guia, o que entra no lugar e o
 * que ganha vigilância. União pela lei do catálogo (quem invalida vence; substituto invalidado
 * por outra classe não entra). Devolve undefined quando nada muda, que é o caso da esmagadora
 * maioria dos alunos.
 */
export function monitoramentoDoPerfil(perfil: PerfilFarmacos): EfeitoMonitoramento | undefined {
  const efeitos: EfeitoMonitoramento[] = [];
  for (const f of farmacosAtivos(perfil.farmacos)) {
    const item = itemDaClasse(f.classe);
    if (!item) continue;
    for (const c of item.consequencias) {
      if (!agePorConduta(c) || !c.monitoramento) continue;
      efeitos.push(c.monitoramento);
    }
  }
  const failSafe = efeitoFailSafe(perfil);
  if (failSafe) efeitos.push(failSafe);
  return fundirMonitoramento(efeitos);
}

/**
 * Os parâmetros que DEIXAM de guiar a intensidade neste perfil. É o que o gerador do plano
 * consome (`GerarPlanoInput.parametrosInvalidos`) para suprimir a zona de frequência cardíaca
 * em vez de corrigi-la por um fator inventado.
 *
 * Recebe as classes soltas mais as opções de contexto para caber tanto na tela do aluno quanto
 * no editor do plano, sem que cada chamador tenha que montar o perfil inteiro.
 */
export function parametrosInvalidosDe(
  farmacos: FarmacoSelecionado[] | undefined,
  opcoes: Omit<PerfilFarmacos, "farmacos"> = {},
): ParamMonitorId[] {
  return monitoramentoDoPerfil({ ...opcoes, farmacos })?.invalidam ?? [];
}
