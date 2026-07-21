/**
 * Retenção: quem está esfriando e como retomar o contato.
 *
 * O produto só sabe se o aluno treinou porque ele registra a execução no portal.
 * Aqui a gente lê essas execuções e transforma silêncio em ação: aponta o aluno
 * que sumiu e entrega o texto pronto de WhatsApp para o profissional enviar (ele
 * envia, não a gente). Nada de número inventado: os dias são contados do último
 * registro real; sem registro, contamos do cadastro e dizemos isso.
 */
import type { Aluno } from "@/data/alunos";
import type { Execucao } from "@/data/execucao";

const DIA = 24 * 60 * 60 * 1000;

export type StatusRetencao = "em-dia" | "esfriando" | "sumido" | "novo-sem-registro";

export interface LimiaresRetencao {
  /** a partir de quantos dias sem treinar consideramos "esfriando" */
  esfriando: number;
  /** a partir de quantos dias sem treinar consideramos "sumido" */
  sumido: number;
}

export const LIMIARES_PADRAO: LimiaresRetencao = { esfriando: 5, sumido: 10 };

export interface SinalRetencao {
  aluno: Aluno;
  status: StatusRetencao;
  /** dias desde o último registro de execução (ou desde o cadastro, se nunca registrou) */
  diasSemTreinar: number;
  /** verdadeiro quando o aluno nunca registrou nenhuma execução */
  semRegistro: boolean;
  /** momento do último registro, se houver */
  ultimoEm?: number;
}

/** Último momento em que o aluno registrou execução (ou undefined). */
export function ultimoTreino(alunoId: string, execucoes: Execucao[]): number | undefined {
  let ultimo: number | undefined;
  for (const e of execucoes) {
    if (e.alunoId !== alunoId) continue;
    if (ultimo === undefined || e.concluidoEm > ultimo) ultimo = e.concluidoEm;
  }
  return ultimo;
}

/**
 * Classifica um aluno pelo tempo de silêncio. `agora` é injetável para teste.
 */
export function sinalDoAluno(
  aluno: Aluno,
  execucoes: Execucao[],
  agora: number = Date.now(),
  limiares: LimiaresRetencao = LIMIARES_PADRAO,
): SinalRetencao {
  const ultimoEm = ultimoTreino(aluno.id, execucoes);
  const semRegistro = ultimoEm === undefined;
  const base = ultimoEm ?? aluno.criadoEm;
  const diasSemTreinar = Math.max(0, Math.floor((agora - base) / DIA));

  let status: StatusRetencao;
  if (semRegistro) {
    // Aluno recém-cadastrado que ainda não registrou nada não é "sumido"; é novo.
    status = diasSemTreinar >= limiares.sumido ? "sumido" : "novo-sem-registro";
  } else if (diasSemTreinar >= limiares.sumido) {
    status = "sumido";
  } else if (diasSemTreinar >= limiares.esfriando) {
    status = "esfriando";
  } else {
    status = "em-dia";
  }

  return { aluno, status, diasSemTreinar, semRegistro, ultimoEm };
}

/**
 * Lista os alunos ativos que precisam de atenção (esfriando ou sumido),
 * do mais crítico para o menos crítico.
 */
export function alunosParaReativar(
  alunos: Aluno[],
  execucoes: Execucao[],
  agora: number = Date.now(),
  limiares: LimiaresRetencao = LIMIARES_PADRAO,
): SinalRetencao[] {
  return alunos
    .filter((a) => a.status === "ativo")
    .map((a) => sinalDoAluno(a, execucoes, agora, limiares))
    .filter((s) => s.status === "esfriando" || s.status === "sumido")
    .sort((a, b) => b.diasSemTreinar - a.diasSemTreinar);
}

export const ROTULO_STATUS: Record<StatusRetencao, string> = {
  "em-dia": "Em dia",
  esfriando: "Esfriando",
  sumido: "Sumido",
  "novo-sem-registro": "Sem registro ainda",
};

function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] || nome;
}

export interface MensagemRetencao {
  titulo: string;
  texto: string;
}

/**
 * Textos prontos de WhatsApp para retomar o contato. Tom profissional e sem
 * pressão: o objetivo é reabrir a conversa, não cobrar. O profissional escolhe,
 * ajusta e envia. Nenhuma promessa clínica.
 */
export function mensagensDeRetorno(sinal: SinalRetencao, nomeProfissional?: string): MensagemRetencao[] {
  const nome = primeiroNome(sinal.aluno.nome);
  const assino = nomeProfissional ? `\n\n${nomeProfissional}` : "";

  if (sinal.semRegistro) {
    return [
      {
        titulo: "Primeiro treino",
        texto: `Oi, ${nome}! Seu treino já está montado no app. Quando fizer o primeiro, é só registrar as cargas por lá que eu acompanho a sua evolução daqui e vou ajustando com você.${assino}`,
      },
      {
        titulo: "Tirar dúvida",
        texto: `Oi, ${nome}! Vi que você ainda não começou a registrar os treinos. Ficou alguma dúvida sobre como usar o app ou sobre algum exercício? Me chama que a gente resolve.${assino}`,
      },
    ];
  }

  if (sinal.status === "sumido") {
    return [
      {
        titulo: "Retomar sem cobrança",
        texto: `Oi, ${nome}! Faz uns dias que a gente não se fala. Sem cobrança, só quero saber como você está e se dá pra retomar os treinos essa semana. Se algo mudou na sua rotina, a gente adapta o plano.${assino}`,
      },
      {
        titulo: "Reagendar",
        texto: `Oi, ${nome}! Que tal a gente marcar um horário pra rever seu treino e encaixar de novo na sua semana? Me diz os dias que ficam melhores pra você.${assino}`,
      },
    ];
  }

  // esfriando
  return [
    {
      titulo: "Incentivo leve",
      texto: `Oi, ${nome}! Notei uma pausa nos seus registros. Tudo certo por aí? Se precisar ajustar algum exercício ou o horário, me avisa que a gente encaixa.${assino}`,
    },
    {
      titulo: "Foco na próxima sessão",
      texto: `Oi, ${nome}! Bora manter o ritmo? Sua próxima sessão já está no app. Qualquer dificuldade em algum movimento, me chama antes que eu te oriento.${assino}`,
    },
  ];
}

/** Só dígitos, com DDI 55 na frente quando o número parece nacional sem DDI. */
function normalizarTelefone(tel: string): string {
  const digitos = tel.replace(/\D/g, "");
  if (!digitos) return "";
  if (digitos.startsWith("55")) return digitos;
  if (digitos.length <= 11) return `55${digitos}`;
  return digitos;
}

/** Link wa.me com o texto já preenchido, ou null se o aluno não tem telefone. */
export function linkWhatsApp(telefone: string | undefined, texto: string): string | null {
  if (!telefone) return null;
  const num = normalizarTelefone(telefone);
  if (!num) return null;
  return `https://wa.me/${num}?text=${encodeURIComponent(texto)}`;
}
