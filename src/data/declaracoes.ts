import type { Aluno, Sexo } from "@/data/alunos";
import type { GpsObjetivo } from "@/lib/gps/engine";
import { EQUIPAMENTOS } from "@/lib/gps/engine";
import { CATALOGO_FARMACOS, type FarmacoSelecionado } from "@/data/farmacos";

/**
 * O QUE O ALUNO INFORMA SOBRE SI, ANTES DE O PROFISSIONAL CONFIRMAR.
 *
 * Pedido de campo (colega do Filipe, personal): o aluno preencher os próprios dados em vez
 * de o professor digitar tudo. A regra que o produto já tinha para o classificador vale
 * aqui: o sistema (agora o aluno) SUGERE, o profissional CONFIRMA.
 *
 * O aluno responde sobre a própria vida, em linguagem de aluno: quantos anos tem, o que
 * quer, onde treina, que remédio toma (pelo nome da caixa), o que já lhe disseram que tem.
 * A tradução disso em nível, condição clínica, restrição estruturada e classe de fármaco é
 * decisão de quem tem CREF. Por isso a declaração é um registro próprio, com status, e
 * `aplicarDeclaracao` é a ÚNICA porta pela qual ela toca a ficha, sempre depois de
 * confirmada e sempre carimbando de onde veio.
 *
 * "Não sei" é resposta, distinta de campo vazio: silêncio não é resposta.
 */

export type CampoDeclaracao =
  | "idade"
  | "sexo"
  | "telefone"
  | "objetivo"
  | "disponibilidade"
  | "equipamentos"
  | "remedios"
  | "saude"
  | "liberacao";

export type StatusDeclaracao = "pendente" | "confirmada" | "dispensada";

export interface DeclaracaoAluno {
  /** determinístico: `decl-<alunoId>-<campo>`, uma linha por campo por aluno */
  id: string;
  alunoId: string;
  campo: CampoDeclaracao;
  /** a resposta, em texto; listas vão em JSON (equipamentos) */
  valor: string;
  /** o aluno disse que não sabe informar (é resposta, não vazio) */
  naoSei?: boolean;
  status: StatusDeclaracao;
  declaradaEm: number;
  revisadaEm?: number;
}

export const idDeclaracao = (alunoId: string, campo: CampoDeclaracao) => `decl-${alunoId}-${campo}`;

/* ------------------------------ As perguntas ------------------------------ */

/** Objetivo na voz do aluno, mapeado para o objetivo do motor. */
export const OBJETIVOS_DO_ALUNO: { id: GpsObjetivo; rotulo: string }[] = [
  { id: "Emagrecimento", rotulo: "Emagrecer" },
  { id: "Hipertrofia", rotulo: "Ganhar massa muscular" },
  { id: "Força", rotulo: "Ficar mais forte" },
  { id: "Resistência muscular", rotulo: "Ganhar resistência" },
  { id: "Retorno ao treino", rotulo: "Voltar a treinar depois de um tempo parado" },
  { id: "Aprendizado técnico", rotulo: "Aprender a treinar direito" },
];

/** Equipamento na voz do aluno, com o id que o catálogo usa. */
export const EQUIPAMENTOS_DO_ALUNO: { id: (typeof EQUIPAMENTOS)[number]; rotulo: string }[] = [
  { id: "Máquina", rotulo: "Máquinas de academia" },
  { id: "Barra", rotulo: "Barra e anilhas" },
  { id: "Halter", rotulo: "Halteres" },
  { id: "Polia", rotulo: "Polia (cabo)" },
  { id: "Elástico", rotulo: "Elástico" },
  { id: "Peso corporal", rotulo: "Só o peso do corpo" },
  { id: "Esteira", rotulo: "Esteira" },
  { id: "Bicicleta ergométrica", rotulo: "Bicicleta" },
  { id: "Elíptico", rotulo: "Elíptico" },
  { id: "Piscina", rotulo: "Piscina" },
];

/** As cinco telas, uma pergunta principal por tela. A ordem é do fácil ao sensível. */
export const TELAS_SOBRE_VOCE: { titulo: string; campos: CampoDeclaracao[] }[] = [
  { titulo: "Sobre você", campos: ["idade", "sexo", "telefone"] },
  { titulo: "O que você quer", campos: ["objetivo"] },
  { titulo: "Sua semana", campos: ["disponibilidade"] },
  { titulo: "Onde você treina", campos: ["equipamentos"] },
  { titulo: "Sua saúde", campos: ["remedios", "saude", "liberacao"] },
];

export const ROTULO_CAMPO: Record<CampoDeclaracao, string> = {
  idade: "Idade",
  sexo: "Sexo",
  telefone: "Telefone",
  objetivo: "Objetivo",
  disponibilidade: "Dias e tempo por semana",
  equipamentos: "Onde treina e o que tem",
  remedios: "Remédios de uso contínuo",
  saude: "Diagnósticos, dores, cirurgias e histórico",
  liberacao: "Liberação médica",
};

/* --------------------------- Leitura do que veio --------------------------- */

const fmtData = (ts: number) => new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(ts));

/** As declarações de um aluno, a mais nova de cada campo. */
export const declaracoesDe = (todas: DeclaracaoAluno[], alunoId: string): DeclaracaoAluno[] =>
  todas.filter((d) => d.alunoId === alunoId).sort((a, b) => b.declaradaEm - a.declaradaEm);

export const pendentesDe = (todas: DeclaracaoAluno[], alunoId: string): DeclaracaoAluno[] =>
  declaracoesDe(todas, alunoId).filter((d) => d.status === "pendente");

/** O valor legível de uma declaração, para a tela do profissional e para o app do aluno. */
export function valorLegivel(d: DeclaracaoAluno): string {
  if (d.naoSei) return "Não soube informar";
  switch (d.campo) {
    case "objetivo":
      return OBJETIVOS_DO_ALUNO.find((o) => o.id === d.valor)?.rotulo ?? d.valor;
    case "equipamentos": {
      const ids = listaDe(d.valor);
      return ids.length ? ids.map((id) => EQUIPAMENTOS_DO_ALUNO.find((e) => e.id === id)?.rotulo ?? id).join(", ") : "Nenhum";
    }
    case "sexo":
      return d.valor === "F" ? "Feminino" : d.valor === "M" ? "Masculino" : d.valor;
    case "idade":
      return `${d.valor} anos`;
    default:
      return d.valor;
  }
}

const listaDe = (valor: string): string[] => {
  try {
    const v = JSON.parse(valor);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return valor ? valor.split(",").map((s) => s.trim()).filter(Boolean) : [];
  }
};

/* ------------------------- Remédio pelo nome da caixa ------------------------- */

const semAcento = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/**
 * O aluno escreve "atenolol" ou "losartana"; o catálogo de classes já lista os exemplos de
 * cada uma. Só mapeia o que o catálogo reconhece: nome desconhecido NÃO vira classe
 * inventada, vira nota para o profissional classificar.
 */
export function classesDosRemedios(texto: string): { reconhecidos: { nome: string; classe: FarmacoSelecionado["classe"] }[]; desconhecidos: string[] } {
  const nomes = texto.split(/[,;\n]| e /i).map((s) => s.trim()).filter(Boolean);
  const reconhecidos: { nome: string; classe: FarmacoSelecionado["classe"] }[] = [];
  const desconhecidos: string[] = [];
  for (const nome of nomes) {
    const n = semAcento(nome);
    const item = CATALOGO_FARMACOS.find((c) => (c.exemplos ?? []).some((ex) => n.includes(semAcento(ex)) || semAcento(ex).includes(n)));
    if (item) reconhecidos.push({ nome, classe: item.classe });
    else desconhecidos.push(nome);
  }
  return { reconhecidos, desconhecidos };
}

/* ------------------------ A única porta para a ficha ------------------------ */

/**
 * O que confirmar uma declaração MUDA na ficha. É a única função que traduz declaração
 * em campo do aluno, e ela nunca toca no que é decisão do profissional: nível, condição
 * clínica confirmada, restrição estruturada, objetivo secundário. O que não tem campo
 * próprio (saúde, liberação, disponibilidade, remédio que o catálogo não reconhece) entra
 * nas notas com a marca de origem e a data, para o profissional ler e decidir na seção
 * certa do perfil.
 */
export function aplicarDeclaracao(aluno: Aluno, d: DeclaracaoAluno, agora = Date.now()): Partial<Aluno> {
  const origem = `informado pelo aluno em ${fmtData(d.declaradaEm)}`;
  const nota = (texto: string): Partial<Aluno> => ({
    observacoes: [aluno.observacoes?.trim(), `${texto} (${origem}).`].filter(Boolean).join("\n"),
  });
  if (d.naoSei) return nota(`${ROTULO_CAMPO[d.campo]}: não soube informar`);

  switch (d.campo) {
    case "idade": {
      const n = parseInt(d.valor, 10);
      return Number.isFinite(n) && n > 0 && n < 120 ? { idade: n } : {};
    }
    case "sexo":
      return d.valor === "F" || d.valor === "M" || d.valor === "Outro" ? { sexo: d.valor as Sexo } : {};
    case "telefone":
      return d.valor.trim() ? { telefone: d.valor.trim() } : {};
    case "objetivo":
      return OBJETIVOS_DO_ALUNO.some((o) => o.id === d.valor) ? { objetivo: d.valor as GpsObjetivo } : {};
    case "equipamentos": {
      const ids = listaDe(d.valor).filter((id) => (EQUIPAMENTOS as readonly string[]).includes(id));
      return { equipamentos: ids };
    }
    case "remedios": {
      const { reconhecidos, desconhecidos } = classesDosRemedios(d.valor);
      const iso = new Date(agora).toISOString();
      const jaTem = new Set((aluno.farmacos ?? []).map((f) => f.classe));
      const novos: FarmacoSelecionado[] = reconhecidos
        .filter((r) => !jaTem.has(r.classe))
        .map((r) => ({ classe: r.classe, fonte: "relato_aluno", criadoEm: iso, atualizadoEm: iso }));
      const patch: Partial<Aluno> = {};
      if (novos.length || reconhecidos.length) {
        patch.farmacos = [...(aluno.farmacos ?? []), ...novos];
        patch.farmacosNaoInformado = false;
      }
      const partes = [
        reconhecidos.length ? `Remédios ${origem}: ${reconhecidos.map((r) => r.nome).join(", ")}` : "",
        desconhecidos.length ? `Remédios que o catálogo não reconheceu, a classificar: ${desconhecidos.join(", ")} (${origem})` : "",
      ].filter(Boolean);
      if (partes.length) patch.observacoes = [aluno.observacoes?.trim(), partes.join(". ") + "."].filter(Boolean).join("\n");
      return patch;
    }
    case "disponibilidade":
      return nota(`Disponibilidade: ${d.valor}`);
    case "saude":
      return nota(`Saúde relatada: ${d.valor}`);
    case "liberacao":
      return nota(`Liberação médica: ${d.valor}`);
  }
}
