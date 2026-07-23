import type { Liberacao } from "@/data/alunos";

/**
 * Estado do SEMÁFORO DIÁRIO de um aluno, derivado só das liberações registradas.
 *
 * Fonte única do "como está a liberação deste aluno hoje", reusada em três lugares
 * (aba Semáforo do aluno, aviso do Painel do profissional e alerta no app do aluno),
 * para os três nunca discordarem.
 *
 * Regra do fundador para o alerta persistente: um "não liberado" (vermelho) segue
 * pendente ENQUANTO não houver um novo semáforo depois dele ("não houve nova
 * avaliação"). Qualquer registro posterior, de QUALQUER cor (verde, amarelo ou um
 * novo vermelho), substitui o estado e limpa a pendência. A ausência de semáforo
 * NÃO é pendência: registrar por dia é opcional e não gera alerta.
 */
export interface EstadoSemaforo {
  /** a liberação mais recente do aluno (qualquer cor), se houver */
  ultimo?: Liberacao;
  /** a liberação registrada hoje, se houver (registro do dia é opcional) */
  hoje?: Liberacao;
  /** "não liberado" ainda em aberto: o último semáforo do aluno é vermelho */
  vermelhoPendente?: Liberacao;
}

// Mesma noção de "mesmo dia" do trilho (proximoPasso.ts): compara ano/mês/dia no
// fuso local. Duplicada de propósito para semaforoDiario.ts não depender do core do
// trilho (evita ciclo de import: proximoPasso.ts é quem importa daqui).
function mesmoDia(a: number, b: number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}

export function estadoSemaforo(alunoId: string, liberacoes: Liberacao[]): EstadoSemaforo {
  // Só as liberações DESTE aluno, da mais recente para a mais antiga.
  const doAluno = liberacoes.filter((l) => l.alunoId === alunoId).sort((a, b) => b.data - a.data);
  const ultimo = doAluno[0];
  if (!ultimo) return {};

  const agora = Date.now();
  const hoje = doAluno.find((l) => mesmoDia(l.data, agora));

  // Como `doAluno` está ordenado do mais recente para o mais antigo, basta o MAIS
  // RECENTE ser vermelho: qualquer semáforo posterior já seria o `ultimo` e teria
  // limpado a pendência. Assim o alerta persiste até um novo registro.
  const vermelhoPendente = ultimo.resultado === "vermelho" ? ultimo : undefined;

  return { ultimo, hoje, vermelhoPendente };
}

const DIA_MS = 86_400_000;

/**
 * Resultado do semáforo por dia da SEMANA CIVIL atual (segunda a domingo), como um
 * array de 7 posições (0 = segunda, 6 = domingo). Cada posição traz a cor do semáforo
 * daquele dia, ou undefined quando não houve registro. Regra: o registro MAIS RECENTE
 * do dia vence (igual à régua do profissional em AlunoDetail).
 *
 * Fonte única da "aderência por dia": alimenta a faixa da semana no app do aluno
 * (SemanaStrip) e a régua SEG a DOM da aba Semáforo, para as duas nunca discordarem.
 */
export function semaforoPorDiaDaSemana(
  alunoId: string,
  liberacoes: Liberacao[],
  agora = Date.now(),
): (Liberacao["resultado"] | undefined)[] {
  // Segunda-feira 00:00 da semana de hoje, como o Painel do profissional.
  const diaSemana = (new Date(agora).getDay() + 6) % 7;
  const inicioSemana = new Date(agora).setHours(0, 0, 0, 0) - diaSemana * DIA_MS;
  const fimSemana = inicioSemana + 7 * DIA_MS;

  // Do aluno, do mais recente para o mais antigo, para o mais recente do dia vencer.
  const doAluno = liberacoes.filter((l) => l.alunoId === alunoId).sort((a, b) => b.data - a.data);
  const porDia: (Liberacao["resultado"] | undefined)[] = Array(7).fill(undefined);
  for (const l of doAluno) {
    if (l.data >= inicioSemana && l.data < fimSemana) {
      const idx = (new Date(l.data).getDay() + 6) % 7;
      if (porDia[idx] === undefined) porDia[idx] = l.resultado; // 1º visto = mais recente do dia
    }
  }
  return porDia;
}
