/**
 * O QUE MUDA PARA O ALUNO, comparado ao treino que ele já está fazendo.
 *
 * O Filipe: "ao clicar em publicar no app de aluno, o sistema deveria apresentar quem sabe um
 * modal indicando o que muda do plano anterior... para que o professor não fique totalmente no
 * escuro sobre o que está prescrevendo".
 *
 * O gesto de maior consequência da tela era o único sem antessala: o botão publicava direto, e
 * entre o clique e o aluno receber outro treino no celular não havia nada. Isto aqui é a peça
 * que responde a pergunta certa, que NÃO é "resumo do plano novo" e sim "o que muda".
 *
 * Duas escolhas que valem estar escritas:
 *
 *  - A comparação é por EXERCÍCIO e por ESTRUTURA (frequência, duração, modelo, sessões
 *    isométricas), e não por dose semana a semana. Dose muda em toda semana por desenho, num
 *    plano periodizado; listar isso seria ruído que esconde o que importa.
 *  - A SEMANA em que o aluno está entra no resultado, porque é o dado que faz alguém desistir
 *    de publicar. Trocar o plano na semana 2 e na semana 11 são decisões diferentes, e só uma
 *    delas joga fora dois meses e meio de progressão.
 */
import type { Macrociclo, PlanoTreino } from "@/data/periodizacao";
import { getModelo, semanaAtual } from "@/data/periodizacao";

export interface DiferencaDePlano {
  /** exercícios que saem do treino do aluno */
  saem: string[];
  /** exercícios que entram */
  entram: string[];
  /** quantos continuam iguais */
  mantidos: number;
  frequencia?: { de: number; para: number };
  duracao?: { de: number; para: number };
  modelo?: { de: string; para: string };
  /** sessões isométricas por semana, quando o número muda */
  isometrico?: { de: number; para: number };
  /** em que semana do plano anterior o aluno está */
  semanaDoAluno: number;
  totalDoAnterior: number;
  /** true quando nada estrutural mudou: o profissional está republicando o mesmo desenho */
  semMudancaEstrutural: boolean;
}

/** Nomes distintos dos exercícios de força do macrociclo inteiro. */
function exerciciosDo(macro: Macrociclo): Set<string> {
  const nomes = new Set<string>();
  for (const meso of macro.mesociclos)
    for (const micro of meso.microciclos)
      for (const sessao of micro.sessoes)
        for (const bloco of sessao.blocos)
          if (bloco.tipo !== "aerobio" && bloco.tipo !== "isometrico" && bloco.nome) nomes.add(bloco.nome);
  return nomes;
}

/** Quantas sessões da primeira semana têm bloco isométrico (a dose semanal do protocolo). */
function isometricasPorSemana(macro: Macrociclo): number {
  const semana = macro.mesociclos[0]?.microciclos[0];
  if (!semana) return 0;
  return semana.sessoes.filter((s) => s.blocos.some((b) => b.tipo === "isometrico")).length;
}

export function diferencaDePlano(anterior: PlanoTreino, novo: PlanoTreino): DiferencaDePlano {
  const exAntes = exerciciosDo(anterior.macrociclo);
  const exDepois = exerciciosDo(novo.macrociclo);
  const saem = [...exAntes].filter((n) => !exDepois.has(n));
  const entram = [...exDepois].filter((n) => !exAntes.has(n));
  const mantidos = [...exDepois].filter((n) => exAntes.has(n)).length;

  const isoAntes = isometricasPorSemana(anterior.macrociclo);
  const isoDepois = isometricasPorSemana(novo.macrociclo);

  const d: DiferencaDePlano = {
    saem,
    entram,
    mantidos,
    semanaDoAluno: semanaAtual(anterior),
    totalDoAnterior: anterior.semanas,
    semMudancaEstrutural: false,
  };
  if (anterior.frequenciaSemanal !== novo.frequenciaSemanal)
    d.frequencia = { de: anterior.frequenciaSemanal, para: novo.frequenciaSemanal };
  if (anterior.semanas !== novo.semanas) d.duracao = { de: anterior.semanas, para: novo.semanas };
  if (anterior.modeloId !== novo.modeloId)
    d.modelo = { de: getModelo(anterior.modeloId).nome, para: getModelo(novo.modeloId).nome };
  if (isoAntes !== isoDepois) d.isometrico = { de: isoAntes, para: isoDepois };

  d.semMudancaEstrutural =
    saem.length === 0 && entram.length === 0 && !d.frequencia && !d.duracao && !d.modelo && !d.isometrico;
  return d;
}
