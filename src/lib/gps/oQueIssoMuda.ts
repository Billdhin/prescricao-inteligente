/**
 * "O QUE ISSO MUDA": a consequência de cada coisa declarada no perfil, DERIVADA
 * dos mesmos motores que decidem de verdade.
 *
 * A tentação, numa coluna dessas, é escrever o texto à mão: fica bonito e fica
 * mentiroso no dia em que uma regra muda e a frase não. Aqui não existe nenhuma
 * afirmação autorada sobre o aluno. Cada item vem de:
 *
 * - condição de saúde  → `groupGpsRules[slug]` (cuidados, restrições estruturais,
 *                        modificador de progressão) e `montarChecklist` (quantas
 *                        perguntas o dia terá, e qual medida abre o checklist)
 * - restrição física   → `CATALOGO_RESTRICOES[tag].efeitos`, autorados junto com a
 *                        semântica que o motor aplica
 * - medicação          → `regraDoPerfil` e `monitoramentoDoPerfil`, que são as
 *                        MESMAS funções que o gerador consulta
 * - protocolo sugerido → a jornada do grupo em `specialGroups`
 *
 * Quando nada foi declarado, a função devolve lista vazia e a tela mostra o vazio
 * honesto. Ela nunca completa a frase com um palpite.
 */

import type { Aluno } from "@/data/alunos";
import { groupGpsRules } from "@/lib/gps/groupRules";
import { getSpecialGroup } from "@/data/specialGroups";
import { montarChecklist } from "@/data/semaforo";
import { CATALOGO_RESTRICOES, restricoesAtivas, rotuloRestricao } from "@/lib/gps/restricoes";
import { itemDaClasse, farmacosAtivos, rotuloFarmaco } from "@/data/farmacos";
import { regraDoPerfil, monitoramentoDoPerfil } from "@/lib/gps/farmacos";
import { getParam } from "@/data/monitoringParameters";

export type OrigemMudanca = "condicao" | "restricao" | "medicacao";

export interface ItemMudanca {
  id: string;
  origem: OrigemMudanca;
  /** de onde veio, na voz do profissional (ex.: "Dor no joelho") */
  fonte: string;
  /** o que muda, já em consequência (ex.: "sem impacto alto") */
  efeitos: string[];
}

export interface DestaqueSemaforo {
  /** o grupo que liga o semáforo (rótulo clínico) */
  grupo: string;
  /** quantas perguntas o checklist do dia terá para este aluno */
  perguntas: number;
  /** a primeira pergunta, que é a medida que abre o dia (ex.: pressão arterial) */
  primeira: string;
}

export interface ProtocoloSugerido {
  slug: string;
  nome: string;
  /** primeira fase da jornada: é por onde este aluno entraria */
  fase: string;
  estrutura: string;
}

export interface OQueIssoMuda {
  semaforo?: DestaqueSemaforo;
  /**
   * As consequências CLÍNICAS do que foi declarado. Lista vazia é o estado vazio
   * de verdade da coluna, e é por isso que equipamento não entra aqui: ele existe
   * desde o primeiro segundo do aluno (nasce com o kit típico) e, se contasse como
   * item, a coluna nunca diria "nada declarado ainda" para ninguém. Um painel que
   * nunca fica vazio é um painel que não informa quando enche.
   */
  itens: ItemMudanca[];
  protocolo?: ProtocoloSugerido;
  /** o que o app do aluno passa a mostrar por causa do que foi declarado */
  noAppDoAluno: string[];
  /** o recorte do catálogo pelos equipamentos do local (contexto, não consequência) */
  catalogo?: string;
}

/** Primeira frase de um texto longo (os cuidados vêm em parágrafo). */
function primeiraFrase(texto: string): string {
  const corte = texto.indexOf(": ");
  const base = corte > 0 && corte < 60 ? texto.slice(0, corte) : texto.split(/(?<=\.)\s/)[0];
  return base.replace(/\.$/, "");
}

export function oQueIssoMuda(aluno: Aluno): OQueIssoMuda {
  const itens: ItemMudanca[] = [];
  const noAppDoAluno: string[] = [];

  /* ------------------------------- condição ------------------------------- */
  const slug = aluno.grupoEspecial;
  const grupo = slug ? getSpecialGroup(slug) : undefined;
  const regra = slug ? groupGpsRules[slug] : undefined;

  let semaforo: DestaqueSemaforo | undefined;
  if (slug && grupo) {
    const checklist = montarChecklist(slug, aluno.farmacos);
    if (checklist?.itens.length) {
      semaforo = {
        grupo: grupo.nome,
        perguntas: checklist.itens.length,
        primeira: checklist.itens[0].pergunta,
      };
      noAppDoAluno.push(`O aluno vê o cuidado do dia antes de começar a sessão.`);
    }
  }

  if (regra) {
    const efeitos: string[] = [];
    // Os cuidados do grupo já vêm escritos como conduta; a coluna mostra os dois
    // primeiros, porque a lista inteira mora na página do grupo.
    for (const c of regra.cuidados.slice(0, 2)) efeitos.push(primeiraFrase(c));
    const estruturais = regra.restricoesEstruturais ?? [];
    if (estruturais.length) {
      // As estruturais são as mesmas tags do catálogo de restrições, então o rótulo
      // que o profissional lê aqui é o mesmo que ele veria se tivesse marcado à mão.
      efeitos.push(`Já entra limitado por ${estruturais.map(rotuloRestricao).join(", ").toLowerCase()}`);
    }
    if (regra.modProgressao) {
      efeitos.push("Progressão mais conservadora que o passo padrão");
    }
    if (efeitos.length) {
      itens.push({ id: `condicao:${slug}`, origem: "condicao", fonte: grupo?.nome ?? slug!, efeitos });
    }
  }

  /* ------------------------------ restrições ------------------------------ */
  for (const r of restricoesAtivas(aluno.restricoes)) {
    const cat = CATALOGO_RESTRICOES.find((c) => c.tag === r.tag);
    if (!cat?.efeitos.length) continue;
    itens.push({
      id: `restricao:${r.tag}`,
      origem: "restricao",
      fonte: rotuloRestricao(r.tag),
      efeitos: cat.efeitos.slice(0, 3),
    });
  }

  /* ------------------------------- medicação ------------------------------ */
  const ativos = farmacosAtivos(aluno.farmacos);
  if (ativos.length) {
    const perfil = { farmacos: ativos, naoInformado: false };
    const regraFarmaco = regraDoPerfil(perfil);
    const monitor = monitoramentoDoPerfil(perfil);
    for (const f of ativos) {
      const cat = itemDaClasse(f.classe);
      const efeitos = (cat?.consequencias ?? [])
        // "expectativa-adaptacao" e tudo que é `somenteTeoria` NUNCA vira card de ação:
        // a trava está declarada em ConsequenciaTipo e é respeitada aqui também.
        // Consequência não aprovada é declaradamente pendente e não crava nada.
        .filter((c) => c.aprovacao === "aprovada" && !c.somenteTeoria && c.tipo !== "expectativa-adaptacao")
        .map((c) => c.descricao)
        .slice(0, 2);
      if (!efeitos.length) continue;
      itens.push({
        id: `medicacao:${f.classe}`,
        origem: "medicacao",
        fonte: rotuloFarmaco(f.classe),
        efeitos,
      });
    }
    if (monitor?.invalidam.length) {
      // O caso do betabloqueador: a zona de frequência cardíaca deixa de guiar e outra
      // coisa entra no lugar. Isso é decisão do motor, não recado de tela.
      const sai = monitor.invalidam.map((id) => getParam(id)?.nome ?? id).join(", ");
      const entra = monitor.substituem.map((id) => getParam(id)?.nome ?? id).join(", ");
      noAppDoAluno.push(`${sai} deixa de guiar a intensidade; entra ${entra.toLowerCase()}.`);
    }
    if (regraFarmaco?.cuidados.length) {
      noAppDoAluno.push(primeiraFrase(regraFarmaco.cuidados[0]) + ".");
    }
  }

  /* ----------------------------- equipamentos ----------------------------- */
  const catalogo = aluno.equipamentos.length
    ? aluno.equipamentos.length === 1
      ? "O catálogo entra filtrado por 1 equipamento disponível."
      : `O catálogo entra filtrado pelos ${aluno.equipamentos.length} equipamentos disponíveis.`
    : undefined;

  /* ------------------------- protocolo sugerido --------------------------- */
  const protocolo: ProtocoloSugerido | undefined =
    grupo && grupo.fases.length
      ? {
          slug: grupo.slug,
          nome: grupo.nome,
          fase: grupo.fases[0].nome,
          estrutura: grupo.fases[0].estruturaSemanal,
        }
      : undefined;

  return { semaforo, itens, protocolo, noAppDoAluno, catalogo };
}
