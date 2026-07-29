/**
 * A RÉGUA DA COMPLETUDE DO PERFIL DO ALUNO.
 *
 * O cadastro deixou de ser um formulário único e virou dois momentos: um modal
 * mínimo (nome, idade, nível, objetivo) e a página de perfil, onde a saúde é
 * preenchida e, depois, editada. Isso só funciona se existir UMA resposta para
 * "o que falta neste aluno" que a barra de seções, o rodapé, o card da lateral,
 * a lista de alunos e o guardrail leiam juntos. É esta função.
 *
 * Duas regras que valem a leitura:
 *
 * 1. **Silêncio não é resposta.** Uma seção só conta como feita quando houve
 *    DECISÃO. "Sem condição de saúde" é uma decisão (`semCondicaoDeclarada`);
 *    `grupoEspecial` ausente é ausência de pergunta. "Nenhuma restrição física" é
 *    uma decisão (a tag `nenhuma_restricao` do catálogo); lista vazia é ausência.
 *    Sem isso, um aluno recém-criado apareceria com o perfil quase pronto e o
 *    profissional prescreveria em cima de um vazio que parece um preenchimento.
 *
 * 2. **Perfil incompleto não impede AVALIAR. Impede PRESCREVER.** A porta de
 *    entrada continua aberta: dá para cadastrar em 20 segundos e avaliar um aluno
 *    de quem só se sabe o nome, e é assim que tem que ser, porque a avaliação é
 *    onde os dados aparecem. O que não dá é pular da avaliação para a prescrição
 *    sem passar pelas perguntas que mudam o que o motor escolhe. Quem decide isso
 *    é `prontidaoParaPrescrever` (src/lib/gps/prontidao.ts), e esta régua é uma das
 *    fontes dele.
 *
 *    A primeira versão deste arquivo dizia "perfil incompleto NUNCA bloqueia o
 *    cuidado", e estava errada: dava para gerar plano de 12 semanas para um aluno
 *    de quem ninguém tinha perguntado condição, restrição nem medicação. A régua
 *    estava certa, o limite entre o que ela informa e o que ela tranca é que
 *    estava no lugar errado.
 */

import type { Aluno } from "@/data/alunos";
import { restricoesAtivas } from "@/lib/gps/restricoes";
import { farmacosAtivos } from "@/data/farmacos";

export type SecaoPerfilId = "basicos" | "objetivo" | "saude" | "medicamentos" | "equipamentos" | "notas";

export interface SecaoPerfil {
  id: SecaoPerfilId;
  /** rótulo curto, o da barra de seções */
  titulo: string;
  /** o que esta seção decide, em uma linha */
  resumo: string;
  /**
   * A seção fecha sozinha quando o DADO existe (`dado`), ou depende de confirmação
   * explícita do profissional (`confirmacao`), porque o que ela guarda é um padrão
   * e não uma afirmação sobre o aluno.
   */
  fecha: "dado" | "confirmacao";
}

export const SECOES_PERFIL: SecaoPerfil[] = [
  {
    id: "basicos",
    titulo: "Básicos",
    resumo: "Nome, idade e nível: a idade entra nas faixas de referência e na sugestão de grupo.",
    fecha: "dado",
  },
  {
    id: "objetivo",
    titulo: "Objetivo",
    resumo: "O que este aluno persegue, e se há um segundo objetivo que soma ou cobra um preço.",
    fecha: "dado",
  },
  {
    id: "saude",
    // O resumo não repete o que os dois cards da seção já dizem de si mesmos; ele
    // responde à pergunta que o profissional tem ao chegar aqui, que é "preciso
    // terminar isto agora?".
    titulo: "Saúde e restrições",
    resumo: "Só o que muda a prescrição. Pode parar quando quiser.",
    fecha: "dado",
  },
  {
    id: "medicamentos",
    titulo: "Medicamentos",
    resumo: "Só a classe. Muda como ler frequência cardíaca e glicemia, e o checklist do dia.",
    fecha: "dado",
  },
  {
    id: "equipamentos",
    titulo: "Equipamentos",
    resumo: "O que existe no local de treino. Filtra o catálogo antes de qualquer escolha.",
    fecha: "confirmacao",
  },
  {
    id: "notas",
    titulo: "Notas",
    resumo: "Contexto que nenhum campo cobre: histórico, rotina, combinados.",
    fecha: "confirmacao",
  },
];

export const TITULO_SECAO: Record<SecaoPerfilId, string> = Object.fromEntries(
  SECOES_PERFIL.map((s) => [s.id, s.titulo]),
) as Record<SecaoPerfilId, string>;

export function ehSecaoPerfil(v: string): v is SecaoPerfilId {
  return SECOES_PERFIL.some((s) => s.id === v);
}

/** O dado daquela seção existe? (só para as seções que fecham por dado) */
function temDado(aluno: Aluno, id: SecaoPerfilId): boolean {
  switch (id) {
    case "basicos":
      // Nome e nível nascem com o aluno; a idade é o que de fato pode faltar, e ela
      // alimenta a classificação por faixa etária e as escalas de referência.
      return Boolean(aluno.nome.trim()) && aluno.idade != null;
    case "objetivo":
      // O objetivo primário é obrigatório no modal; o secundário é opcional por desenho.
      return Boolean(aluno.objetivo);
    case "saude":
      // Condição: declarada OU declaradamente ausente. Restrições: ao menos uma
      // marcada, e "Nenhuma restrição física" conta como marcada (é uma decisão).
      return (
        (Boolean(aluno.grupoEspecial) || aluno.semCondicaoDeclarada === true) && aluno.restricoes.length > 0
      );
    case "medicamentos":
      return farmacosAtivos(aluno.farmacos).length > 0 || aluno.farmacosNaoInformado === true;
    case "equipamentos":
      return false;
    case "notas":
      return false;
  }
}

export interface EstadoSecaoPerfil {
  secao: SecaoPerfil;
  feita: boolean;
  /** o que exatamente falta, na voz do profissional (vazio quando feita) */
  falta: string;
}

export interface CompletudePerfil {
  secoes: EstadoSecaoPerfil[];
  feitas: number;
  total: number;
  /** inteiro de 0 a 100, para a barra e o rótulo */
  pct: number;
  /** a próxima seção a preencher, ou undefined quando o perfil está completo */
  proxima?: SecaoPerfilId;
  /** "medicamentos e equipamentos", já com a vírgula e o "e" ("" quando completo) */
  faltaTexto: string;
}

const O_QUE_FALTA: Record<SecaoPerfilId, (a: Aluno) => string> = {
  basicos: () => "a idade",
  objetivo: () => "o objetivo",
  saude: (a) =>
    !(a.grupoEspecial || a.semCondicaoDeclarada) && a.restricoes.length === 0
      ? "a condição de saúde e as restrições"
      : !(a.grupoEspecial || a.semCondicaoDeclarada)
        ? "a condição de saúde"
        : "as restrições físicas",
  medicamentos: () => "os medicamentos",
  equipamentos: () => "os equipamentos",
  notas: () => "as notas",
};

/** Junta uma lista em "a, b e c" (sem travessão, sem oxford). */
function listar(itens: string[]): string {
  if (itens.length === 0) return "";
  if (itens.length === 1) return itens[0];
  return `${itens.slice(0, -1).join(", ")} e ${itens[itens.length - 1]}`;
}

export function completudeAluno(aluno: Aluno): CompletudePerfil {
  const confirmadas = new Set(aluno.perfilConfirmado ?? []);
  const secoes: EstadoSecaoPerfil[] = SECOES_PERFIL.map((secao) => {
    // Confirmar vale para qualquer seção (o profissional pode dar por encerrada a
    // saúde de um aluno que ele conhece); o dado fecha sozinho só onde ele afirma algo.
    const feita = (secao.fecha === "dado" && temDado(aluno, secao.id)) || confirmadas.has(secao.id);
    return { secao, feita, falta: feita ? "" : O_QUE_FALTA[secao.id](aluno) };
  });
  const feitas = secoes.filter((s) => s.feita).length;
  const pendentes = secoes.filter((s) => !s.feita);
  return {
    secoes,
    feitas,
    total: secoes.length,
    pct: Math.round((feitas / secoes.length) * 100),
    proxima: pendentes[0]?.secao.id,
    faltaTexto: listar(pendentes.map((s) => s.secao.titulo.toLowerCase())),
  };
}

/**
 * A seção onde a página deve abrir: a primeira pendente, ou a primeira de todas
 * quando o perfil está completo (aí a visita é para editar, não para preencher).
 */
export function secaoInicial(aluno: Aluno): SecaoPerfilId {
  return completudeAluno(aluno).proxima ?? "basicos";
}

/** Vizinhas na ordem do trilho (o rodapé "‹ anterior" e "próxima ›"). */
export function vizinhasDaSecao(id: SecaoPerfilId): { anterior?: SecaoPerfil; proxima?: SecaoPerfil } {
  const i = SECOES_PERFIL.findIndex((s) => s.id === id);
  return { anterior: SECOES_PERFIL[i - 1], proxima: SECOES_PERFIL[i + 1] };
}

/**
 * As restrições marcadas que ainda AGEM no motor (fora "nenhuma"). É o número que
 * a seção mostra como "N marcada": contar a decisão "nenhuma" como restrição diria
 * ao profissional que existe algo limitando quando não existe.
 */
export function restricoesQueAgem(aluno: Aluno) {
  return restricoesAtivas(aluno.restricoes);
}
