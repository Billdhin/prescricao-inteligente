/**
 * PRONTIDÃO PARA PRESCREVER: o que precisa estar decidido antes de o sistema
 * gerar treino para um aluno.
 *
 * ## Por que isto existe
 *
 * O cadastro virou um modal de quatro campos e a saúde foi para o perfil. Isso
 * resolveu o formulário que ninguém terminava e abriu um buraco maior: dava para
 * gerar um plano de 12 semanas para um aluno de quem NINGUÉM tinha perguntado
 * condição, restrição nem medicação. Verificado no motor real: `gerarPlano` com
 * `restricoes: []` e sem `grupoEspecial` devolve macrociclo completo, com leg press
 * e cadeira extensora na primeira sessão, e o raciocínio não menciona uma palavra
 * sobre saúde. Não é o motor que está errado: ele recebeu silêncio e leu silêncio
 * como "não há nada". É a PORTA que faltava.
 *
 * É a mesma família do bug que o fundador reportou (aluna com obesidade grau II
 * recebendo elevação de quadril): lá a condição estava declarada e o gerador não
 * olhava; aqui o gerador olha, e não há o que olhar.
 *
 * ## A regra, em uma linha
 *
 * **Perfil incompleto não impede AVALIAR. Impede PRESCREVER.**
 *
 * A porta de entrada continua aberta: dá para cadastrar em 20 segundos e avaliar
 * um aluno de quem só se sabe o nome, e é assim que tem que ser, porque a avaliação
 * é onde os dados aparecem. O que não dá é pular da avaliação para a prescrição sem
 * passar pelas três perguntas que mudam o que o motor escolhe.
 *
 * ## Por que bloquear não é hostil aqui
 *
 * Cada bloqueio tem saída de UM clique, e a saída é uma DECLARAÇÃO, não um atalho:
 * "Sem condição", "Nenhuma restrição física", "Não sei / não informar". Declarar
 * que não sabe é uma resposta legítima que deixa o sistema mais conservador
 * (`parametrosInvalidosDe`); o que não é resposta é o silêncio. Um bloqueio que se
 * resolve em um clique e ensina o porquê custa segundos; um plano gerado no escuro
 * custa a confiança do profissional que assina embaixo.
 */

import type { Aluno, Avaliacao } from "@/data/alunos";
import { avaliarSeguranca, condicionaisPendentes, restricoesAtivas } from "@/lib/gps/restricoes";
import { farmacosAtivos } from "@/data/farmacos";
import { classificarGrupos } from "@/lib/gps/classificador";
import type { SecaoPerfilId } from "@/lib/gps/perfilAluno";

export type MotivoBloqueio =
  | "sem-avaliacao"
  | "saude-nao-declarada"
  | "restricoes-nao-decididas"
  | "medicacao-nao-decidida"
  | "sem-equipamento"
  | "detalhe-pendente"
  | "seguranca"
  | "encaminhamento";

export type MotivoAviso = "sem-idade" | "sugestao-pendente";

export interface ItemProntidao<T extends string> {
  motivo: T;
  /** o que falta, na voz do profissional */
  titulo: string;
  /** por que isso muda a prescrição (nunca "porque o sistema exige") */
  porque: string;
  /** para onde ir para resolver, quando é o perfil que resolve */
  secao?: SecaoPerfilId;
  /** rótulo do atalho, quando existe */
  acao?: string;
}

export interface Prontidao {
  /** pode gerar treino para este aluno? (só RISCO trava; ver DUROS) */
  ok: boolean;
  /** o que TRAVA: risco clínico e impossibilidade técnica */
  bloqueios: ItemProntidao<MotivoBloqueio>[];
  /** o que FALTA mas não trava: as declarações de completude do perfil */
  pendencias: ItemProntidao<MotivoBloqueio>[];
  avisos: ItemProntidao<MotivoAviso>[];
  /** o primeiro bloqueio, que é o que a tela mostra em uma linha */
  primeiro?: ItemProntidao<MotivoBloqueio>;
}

/**
 * O que de fato TRAVA a prescrição, depois do feedback de campo (31/07/2026): o
 * Herivaldo achou o fluxo "preso a uma sequência rígida", e o Filipe decidiu que
 * as verificações continuam existindo, mas sem serem pré-requisito.
 *
 * Ficam travando só dois tipos de coisa:
 *  - RISCO CLÍNICO (`seguranca`, `encaminhamento`): cirurgia recente sem liberação
 *    ou pressão que pede encaminhamento não viram treino hoje. Destravar isso seria
 *    contrariar a tese do produto, não a rigidez dele.
 *  - IMPOSSIBILIDADE TÉCNICA (`sem-equipamento`): sem nenhum equipamento o catálogo
 *    fica vazio e não existe plano a gerar; não é rigidez, é aritmética.
 *
 * Todo o resto (avaliação, condição, restrições, medicação, detalhe pendente) virou
 * PENDÊNCIA: aparece, explica o que muda, e deixa seguir. O profissional decide.
 */
const DUROS = new Set<MotivoBloqueio>(["seguranca", "encaminhamento", "sem-equipamento"]);

export interface CtxProntidao {
  avaliacoes: Avaliacao[];
}

/**
 * A regra. Ordem dos bloqueios = ordem em que o profissional resolve na prática:
 * primeiro a avaliação (que é o gate do trilho), depois as três declarações de
 * saúde, depois o local de treino, e por fim os dois que dependem do que ele
 * acabou de declarar (detalhe pendente e segurança).
 */
export function prontidaoParaPrescrever(aluno: Aluno, ctx: CtxProntidao): Prontidao {
  const bloqueios: ItemProntidao<MotivoBloqueio>[] = [];
  const avisos: ItemProntidao<MotivoAviso>[] = [];

  const minhas = ctx.avaliacoes.filter((a) => a.alunoId === aluno.id);

  /* 1. Avaliação: o gate do trilho, decisão do fundador ("o treino nasce dela"). */
  if (minhas.length === 0) {
    bloqueios.push({
      motivo: "sem-avaliacao",
      titulo: "Registre a avaliação",
      porque: "O treino nasce da avaliação: é dela que saem peso, pressão, perímetros e testes.",
      acao: "Registrar avaliação",
    });
  }

  /* 2. Condição de saúde: declarada, ou declaradamente ausente. */
  if (!aluno.grupoEspecial && aluno.semCondicaoDeclarada !== true) {
    bloqueios.push({
      motivo: "saude-nao-declarada",
      titulo: "Declare a condição de saúde",
      porque:
        "A condição liga o semáforo diário e as regras do motor. Em branco, o sistema trata o aluno como se não houvesse nada, e essa é a suposição que ninguém quer assinar.",
      secao: "saude",
      acao: "Abrir Saúde e restrições",
    });
  }

  /* 3. Restrições: ao menos uma marcada, e "Nenhuma restrição física" conta. */
  if (aluno.restricoes.length === 0) {
    bloqueios.push({
      motivo: "restricoes-nao-decididas",
      titulo: "Decida as restrições físicas",
      porque:
        "Restrição muda o que o motor escolhe, a amplitude e o apoio. Lista vazia é a ausência da pergunta, não a ausência de restrição.",
      secao: "saude",
      acao: "Abrir Saúde e restrições",
    });
  }

  /* 4. Medicação: classe declarada, ou "não sei / não informar" declarado. */
  if (farmacosAtivos(aluno.farmacos).length === 0 && aluno.farmacosNaoInformado !== true) {
    bloqueios.push({
      motivo: "medicacao-nao-decidida",
      titulo: "Pergunte sobre medicação",
      porque:
        "A classe muda como ler frequência cardíaca e glicemia. Betabloqueador, por exemplo, tira a zona de FC da prescrição. Responder \"não sei\" já basta e deixa o sistema mais conservador.",
      secao: "medicamentos",
      acao: "Abrir Medicamentos",
    });
  }

  /* 5. Equipamentos: sem nenhum, o catálogo inteiro fica fora e não há o que gerar. */
  if (aluno.equipamentos.length === 0) {
    bloqueios.push({
      motivo: "sem-equipamento",
      titulo: "Marque os equipamentos do local",
      porque: "Sem nenhum equipamento disponível, o catálogo fica vazio e não há exercício a prescrever.",
      secao: "equipamentos",
      acao: "Abrir Equipamentos",
    });
  }

  /* 6. Detalhe obrigatório de restrição marcada (cirurgia sem liberação informada,
        "outra restrição" sem texto). Já era regra do wizard; agora vale no plano. */
  if (condicionaisPendentes(aluno.restricoes)) {
    bloqueios.push({
      motivo: "detalhe-pendente",
      titulo: "Complete o detalhe da restrição",
      porque: "Uma restrição marcada ficou sem a resposta obrigatória, e ela é o que decide o corte.",
      secao: "saude",
      acao: "Abrir Saúde e restrições",
    });
  }

  /* 7. Segurança: cirurgia recente sem liberação, lesão com dor importante. */
  const seg = avaliarSeguranca(aluno.restricoes);
  if (seg.bloqueado) {
    bloqueios.push({
      motivo: "seguranca",
      titulo: "Confirme a liberação antes de gerar",
      porque: seg.motivos.join(" "),
      secao: "saude",
      acao: "Abrir Saúde e restrições",
    });
  }

  /* 8. Encaminhamento: pressão muito elevada na última avaliação não vira treino hoje. */
  const sugestoes = classificarGrupos(aluno, ctx.avaliacoes);
  const encaminha = sugestoes.find((s) => s.encaminhamento);
  if (encaminha) {
    bloqueios.push({
      motivo: "encaminhamento",
      titulo: "Não prescreva hoje",
      porque: encaminha.motivo,
      acao: "Ver o semáforo",
    });
  }

  /* ------------------------------- avisos --------------------------------- */

  if (aluno.idade == null) {
    avisos.push({
      motivo: "sem-idade",
      titulo: "Idade não informada",
      porque:
        "Sem idade, a zona de frequência cardíaca do aeróbio não é estimada e o direcionamento por faixa etária não é sugerido. O plano sai, guiado por percepção de esforço.",
      secao: "basicos",
      acao: "Abrir Básicos",
    });
  }

  const pendente = sugestoes.find((s) => !s.encaminhamento);
  if (pendente) {
    avisos.push({
      motivo: "sugestao-pendente",
      titulo: `A avaliação sugere ${pendente.rotulo}`,
      porque: `${pendente.motivo} Confirmar muda as regras que o motor aplica.`,
      secao: "saude",
      acao: "Abrir Saúde e restrições",
    });
  }

  // Separa o que é RISCO do que é COMPLETUDE (ver DUROS, acima). Só o risco trava.
  const duros = bloqueios.filter((b) => DUROS.has(b.motivo));
  const pendencias = bloqueios.filter((b) => !DUROS.has(b.motivo));
  return { ok: duros.length === 0, bloqueios: duros, pendencias, avisos, primeiro: duros[0] };
}

/**
 * Só o gate da avaliação, que é o que a ESPINHA do cuidado usa para dizer qual é o
 * próximo passo. Mora aqui, e não em `proximoPasso`, para existir uma fonte só do
 * assunto "pode prescrever": esta função é o subconjunto, `prontidaoParaPrescrever`
 * é o conjunto, e as duas nunca podem discordar porque uma deriva da outra.
 */
export function podeMontarTreino(aluno: Aluno, ctx: CtxProntidao): { ok: boolean; motivo?: string } {
  const p = prontidaoParaPrescrever(aluno, ctx);
  // Risco/impossibilidade travam; falta de avaliação virou recomendação forte, não
  // porta trancada (o profissional decide se prescreve antes de avaliar).
  if (!p.ok) return { ok: false, motivo: p.primeiro?.titulo };
  const semAval = p.pendencias.some((b) => b.motivo === "sem-avaliacao");
  if (semAval) return { ok: true, motivo: "Sem avaliação registrada: o treino nasce dela, e sem ela o plano sai mais conservador." };
  return { ok: true };
}

/** Uma linha para o topo das telas: "faltam 3 coisas", ou o motivo único. */
export function resumoBloqueio(p: Prontidao): string {
  if (p.ok) return "";
  if (p.bloqueios.length === 1) return p.bloqueios[0].titulo;
  return `Faltam ${p.bloqueios.length} definições antes de prescrever`;
}
