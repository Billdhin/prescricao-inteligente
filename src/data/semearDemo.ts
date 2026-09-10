/**
 * OS DOIS CASOS DO VSL, SEMEADOS COMO DADOS DE EXEMPLO COMPLETOS.
 *
 * O vídeo de vendas mostra dois alunos: a mulher de 58 anos com hipertensão, artrose de
 * joelho e betabloqueador (a demo de abertura), e o homem de 72 anos com hipertensão (o
 * painel "de onde vem cada limite", onde a idade vence a disputa da reserva). Este módulo
 * faz os dois existirem de verdade no sistema, com a história inteira: plano de 12 semanas
 * gerado pelo MOTOR, semanas já executadas com carga, repetição e esforço por série, PSE de
 * cada sessão, semáforos respondidos e avaliações em série para os gráficos de evolução.
 *
 * DUAS DECISÕES DE DESENHO, e os porquês:
 *
 * 1. O PLANO É GERADO NA HORA DO CLIQUE, pelo mesmo `gerarPlano` e com as MESMAS entradas
 *    que a tela de prescrição monta (idade, equipamentos, restrições, condições, fármacos).
 *    Um plano copiado num literal envelheceria em silêncio a cada mudança do motor, e a
 *    demo passaria a mostrar um comportamento que o produto não tem mais. Gerando na hora,
 *    a demo É o produto.
 *
 * 2. AS CARGAS EM KG SÃO DADO DO ALUNO DE EXEMPLO, não afirmação do produto. O motor não
 *    prescreve carga absoluta; quem registra quilos é o aluno, e só onde existe carga externa
 *    (peso do corpo, elástico e isométrico não têm kg). Os números são plausíveis e
 *    determinísticos (derivados do aluno e do exercício), sobem nas semanas de carga e caem
 *    na descarga, como um registro real se pareceria.
 *
 * O espelho na nuvem: alunos, avaliações, planos e liberações sobem pela conta logada no
 * clique de "Carregar exemplos" (mesmo caminho de sempre). Execuções e PSE ficam locais,
 * porque o espelho deles na nuvem pertence à conta do ALUNO, que não existe para um demo.
 */
import type { Aluno, Avaliacao, Liberacao } from "@/data/alunos";
import { semanaAtual, type BlocoSessao, type PlanoTreino } from "@/data/periodizacao";
import type { Execucao, SessaoFeedback } from "@/data/execucao";
import type { FarmacoSelecionado } from "@/data/farmacos";
import { gerarPlano } from "@/lib/gps/periodizacao";
import { parametrosInvalidosDe } from "@/lib/gps/farmacos";
import { criarRestricao } from "@/lib/gps/restricoes";
import { avaliarSemaforo, montarChecklist, type ChecklistSemaforo } from "@/data/semaforo";
import { getExercise } from "@/data/exercises";
import { agendaDaSemana, cargaPlausivel, fatorDaSemana, registrosDoBloco } from "@/data/registroSimulado";

const DIA = 24 * 60 * 60 * 1000;
const dias = (n: number) => Date.now() + n * DIA;

/** Hash pequeno e estável: o mesmo exercício sempre recebe a mesma carga-base. */
const hash = (s: string) => {
  let h = 5381;
  for (const c of s) h = ((h * 33) ^ c.charCodeAt(0)) >>> 0;
  return h;
};

export interface DemoVSL {
  alunos: Aluno[];
  avaliacoes: Avaliacao[];
  planos: PlanoTreino[];
  liberacoes: Liberacao[];
  execucoes: Execucao[];
  feedbacks: SessaoFeedback[];
}

/** Fármaco declarado no formato do catálogo (classe, nunca dose). */
const betabloqueador = (declaradoEmMs: number): FarmacoSelecionado => ({
  classe: "betabloqueador",
  criadoEm: new Date(declaradoEmMs).toISOString(),
  atualizadoEm: new Date(declaradoEmMs).toISOString(),
});

/**
 * Gera o plano do aluno demo pelo MESMO caminho da tela de prescrição: as linhas espelham
 * o `montar` de PrescreverTreino de propósito, para a demo não divergir do produto.
 */
export function planoDoAluno(
  aluno: Aluno,
  avaliacoes: Avaliacao[],
  cfg: { semanas: number; frequencia: number; dataMs: number; disponibilidade: string },
): PlanoTreino {
  const ultimaAval = avaliacoes
    .filter((a) => a.alunoId === aluno.id)
    .sort((a, b) => b.data - a.data)[0];
  const g = gerarPlano({
    objetivo: aluno.objetivo,
    nivel: aluno.nivel,
    semanas: cfg.semanas,
    frequencia: cfg.frequencia,
    grupoEspecial: aluno.grupoEspecial,
    idade: aluno.idade,
    equipamentos: aluno.equipamentos,
    fcRepouso: ultimaAval?.medidas.fcRepouso,
    restricoes: aluno.restricoes,
    condicoesAtencao: aluno.condicoesAtencao,
    objetivoSecundario: aluno.objetivoSecundario,
    parametrosInvalidos: parametrosInvalidosDe(aluno.farmacos, {
      farmacosNaoInformado: aluno.farmacosNaoInformado,
      grupos: [aluno.grupoEspecial, ...(aluno.condicoesAtencao ?? [])],
    }),
  });
  return {
    id: `plano-demo-${aluno.id}`,
    alunoId: aluno.id,
    data: cfg.dataMs,
    titulo: g.titulo,
    objetivo: aluno.objetivo,
    objetivoSecundario: aluno.objetivoSecundario,
    nivel: aluno.nivel,
    semanas: cfg.semanas,
    frequenciaSemanal: cfg.frequencia,
    disponibilidade: cfg.disponibilidade,
    modeloId: g.modeloId,
    modeloAltId: g.modeloAltId,
    grupoEspecial: aluno.grupoEspecial,
    condicoesAtencao: aluno.condicoesAtencao,
    macrociclo: g.principal,
    alternativa: g.alternativa,
    raciocinio: g.raciocinio,
    refIds: g.refIds,
    status: "ativo",
  };
}

/**
 * O histórico de execução: as semanas já vividas do plano, série a série, com os MESMOS campos
 * que o app grava (registroSimulado.ts): o aeróbio como conclusão, o isométrico e a prancha
 * com o esforço de cada série, o peso do corpo com repetições, e quilos só onde existe carga
 * externa. A carga plausível vem do aluno e do exercício, sobe a cada semana de carga e cai
 * na descarga. Cada sessão cai num dia da semana do plano, com o complemento no dia de uma
 * sessão principal.
 *
 * Até 10/09/2026 esta função gravava um registro por exercício com quilos em tudo (flexão de
 * braço com 28 kg, prancha com "26 kg x 10"), pulava o aeróbio e espalhava as seis sessões da
 * semana em dias alternados, empurrando a sessão isométrica para a semana seguinte.
 */
function executarSemanas(
  aluno: Aluno,
  plano: PlanoTreino,
  semanasConcluidas: number,
): { execucoes: Execucao[]; feedbacks: SessaoFeedback[] } {
  const execucoes: Execucao[] = [];
  const feedbacks: SessaoFeedback[] = [];
  const dia0 = new Date(plano.data);
  dia0.setHours(0, 0, 0, 0);
  const HORA = 60 * 60 * 1000;
  let cargasVividas = 0;
  for (const meso of plano.macrociclo.mesociclos) {
    for (const micro of meso.microciclos) {
      if (micro.semana > semanasConcluidas) continue;
      const descarga = micro.tipo !== "carga";
      if (!descarga) cargasVividas++;
      const agenda = agendaDaSemana(micro);
      micro.sessoes.forEach((sessao, si) => {
        const lugar = agenda.get(sessao.id)!;
        // Fim de tarde. A sessão cujo dia ainda não chegou NÃO ganha registro: clampar para
        // "agora" empilhava treinos em "hoje", e sessão futura sem registro é o que um
        // histórico real teria.
        const quando = dia0.getTime() + ((micro.semana - 1) * 7 + lugar.dia) * DIA + 18 * HORA + lugar.depoisMin * 60_000;
        if (quando > Date.now() - 12 * HORA) return;
        const rpes: number[] = [];
        sessao.blocos.forEach((b: BlocoSessao, bi) => {
          const ex = b.exercicioSlug ? getExercise(b.exercicioSlug) : undefined;
          const base = b.exercicioSlug ? cargaPlausivel(aluno, b.exercicioSlug, ex?.equipamento) : undefined;
          const r = registrosDoBloco({
            bloco: b,
            alunoId: plano.alunoId,
            planoId: plano.id,
            semana: micro.semana,
            sessaoRef: sessao.id,
            idBase: `exec-${plano.alunoId}-${micro.semana}-${b.id}`,
            inicio: quando + bi * 7 * 60_000,
            descarga,
            carga: base != null ? base * fatorDaSemana(descarga, cargasVividas) : undefined,
          });
          execucoes.push(...r.execucoes);
          rpes.push(...r.rpes);
        });
        if (!rpes.length) return;
        const media = rpes.reduce((x, y) => x + y, 0) / rpes.length;
        feedbacks.push({
          id: `fb-${plano.alunoId}-${micro.semana}-${sessao.id}`,
          alunoId: plano.alunoId,
          planoId: plano.id,
          semana: micro.semana,
          sessaoRef: sessao.id,
          // A PSE da sessão acompanha o esforço das séries (um ponto abaixo da média, com
          // variação de semana para semana), e não um número à parte.
          pse: Math.min(9, Math.max(3, Math.round(media - 1) + ((hash(sessao.id) + micro.semana) % 3) - 1)),
          duracaoMin: lugar.complemento ? 12 + (hash(sessao.id) % 6) : 46 + (hash(sessao.id) % 16),
          observacao:
            micro.semana === semanasConcluidas && si === 0 ? "Semana boa. Senti firmeza nos exercícios guiados." : undefined,
          concluidaEm: quando + (lugar.complemento ? 15 : 55) * 60_000,
        });
      });
    }
  }
  return { execucoes, feedbacks };
}

/**
 * Um semáforo RESPONDIDO de verdade: escolhe a opção pedida em cada item do checklist do
 * grupo e deixa `avaliarSemaforo` computar o resultado e os ajustes, exatamente como a tela
 * faz. Nada de resultado gravado à mão que o motor não produziria.
 */
export function responderSemaforo(
  checklist: ChecklistSemaforo,
  alunoId: string,
  dataMs: number,
  pintarUmAmarelo: boolean,
): Liberacao {
  const respostas: Record<string, string> = {};
  let amareloUsado = false;
  for (const item of checklist.itens) {
    const verde = item.opcoes.find((o) => o.cor === "verde");
    const amarelo = item.opcoes.find((o) => o.cor === "amarelo");
    const escolhida = pintarUmAmarelo && !amareloUsado && amarelo ? amarelo : (verde ?? item.opcoes[0]);
    if (escolhida === amarelo) amareloUsado = true;
    respostas[item.id] = escolhida.valor;
  }
  const r = avaliarSemaforo(checklist, respostas);
  return {
    id: `lib-${alunoId}-${dataMs}`,
    alunoId,
    grupoSlug: checklist.grupoSlug,
    data: dataMs,
    respostas,
    resultado: r.cor,
    ajustes: r.ajustes,
  };
}

/**
 * `planosExistentes`: os planos que a conta JÁ tem. Os ids dos blocos de um plano gerado mudam a
 * cada geração, então o treino da demo tem de ser registrado sobre o plano que a conta guarda,
 * senão cada registro novo apontaria para um bloco que não existe nela. Sem plano da demo na
 * conta, o plano nasce aqui, pelo motor.
 */
export function semearDemoVSL(opts: { planosExistentes?: PlanoTreino[] } = {}): DemoVSL {
  const jaNaConta = (alunoId: string) =>
    opts.planosExistentes?.find((p) => p.id === `plano-demo-${alunoId}` && p.alunoId === alunoId);
  // As semanas vividas são as que já passaram no calendário do plano.
  const vividas = (p: PlanoTreino) => Math.min(p.semanas, semanaAtual(p) - 1);
  /* ------------------- Helena, o caso de abertura do VSL ------------------- */
  const helena: Aluno = {
    id: "al-vsl-helena",
    nome: "Helena Duarte",
    iniciais: "HD",
    idade: 58,
    sexo: "F",
    objetivo: "Emagrecimento",
    nivel: "Iniciante",
    restricoes: [criarRestricao("joelho_dor")],
    farmacos: [betabloqueador(dias(-70))],
    equipamentos: ["Máquina", "Polia", "Halter", "Peso corporal", "Esteira", "Bicicleta ergométrica"],
    observacoes: "Hipertensão em acompanhamento médico. Refere dor no joelho direito ao descer escadas.",
    status: "ativo",
    criadoEm: dias(-72),
    grupoEspecial: "hipertensao-estagio-1",
    condicoesAtencao: ["osteoartrite-joelho"],
    ultimaAvaliacaoEm: dias(-1),
    proximaReavaliacaoEm: dias(27),
  };

  const avaliacoesHelena: Avaliacao[] = [
    {
      id: "av-vsl-h1",
      alunoId: helena.id,
      data: dias(-70),
      medidas: { peso: 78.5, percentualGordura: 36.2, pressaoSistolica: 138, pressaoDiastolica: 88, fcRepouso: 68 },
      dorEscala: 4,
      observacoes: "Início do acompanhamento. Liberação médica apresentada.",
    },
    {
      id: "av-vsl-h2",
      alunoId: helena.id,
      data: dias(-42),
      medidas: { peso: 77.1, percentualGordura: 35.1, pressaoSistolica: 134, pressaoDiastolica: 86, fcRepouso: 67 },
      dorEscala: 3,
    },
    {
      id: "av-vsl-h3",
      alunoId: helena.id,
      data: dias(-14),
      medidas: { peso: 76.0, percentualGordura: 34.4, pressaoSistolica: 130, pressaoDiastolica: 84, fcRepouso: 66 },
      dorEscala: 2,
      observacoes: "Menos dor ao descer escadas. Aderência ótima ao registro.",
    },
    {
      id: "av-vsl-h4",
      alunoId: helena.id,
      data: dias(-1),
      medidas: { peso: 75.2, percentualGordura: 33.8, pressaoSistolica: 128, pressaoDiastolica: 82, fcRepouso: 66 },
      dorEscala: 2,
    },
  ];

  // 12 semanas geradas há 9: a demo abre com o plano VIVO, na semana 10.
  const planoHelena = jaNaConta(helena.id) ?? planoDoAluno(helena, avaliacoesHelena, {
    semanas: 12,
    frequencia: 3,
    dataMs: dias(-63),
    disponibilidade: "Seg, qua e sex, cerca de 55 min",
  });
  const vividoHelena = executarSemanas(helena, planoHelena, vividas(planoHelena));

  const checklistHelena = montarChecklist(helena.grupoEspecial!, helena.farmacos);
  const liberacoesHelena = checklistHelena
    ? [
        responderSemaforo(checklistHelena, helena.id, dias(-8), false),
        responderSemaforo(checklistHelena, helena.id, dias(-4), true),
        responderSemaforo(checklistHelena, helena.id, dias(-1), false),
      ]
    : [];

  /* --------------- Antônio, o painel "de onde vem cada limite" --------------- */
  const antonio: Aluno = {
    id: "al-vsl-antonio",
    nome: "Antônio Ribeiro",
    iniciais: "AR",
    idade: 72,
    sexo: "M",
    objetivo: "Resistência muscular",
    nivel: "Iniciante",
    restricoes: [],
    equipamentos: ["Máquina", "Halter", "Peso corporal", "Esteira"],
    observacoes: "Hipertensão controlada com acompanhamento. Sem outras queixas.",
    status: "ativo",
    criadoEm: dias(-50),
    grupoEspecial: "hipertensao-estagio-1",
    ultimaAvaliacaoEm: dias(-2),
    proximaReavaliacaoEm: dias(26),
  };

  const avaliacoesAntonio: Avaliacao[] = [
    {
      id: "av-vsl-a1",
      alunoId: antonio.id,
      data: dias(-49),
      medidas: { peso: 81.0, percentualGordura: 27.5, pressaoSistolica: 136, pressaoDiastolica: 86, fcRepouso: 64 },
      dorEscala: 1,
      observacoes: "Primeira avaliação. Ativo no dia a dia, sem treino estruturado prévio.",
    },
    {
      id: "av-vsl-a2",
      alunoId: antonio.id,
      data: dias(-21),
      medidas: { peso: 80.4, percentualGordura: 27.0, pressaoSistolica: 132, pressaoDiastolica: 84, fcRepouso: 64 },
      dorEscala: 0,
    },
    {
      id: "av-vsl-a3",
      alunoId: antonio.id,
      data: dias(-2),
      medidas: { peso: 80.1, percentualGordura: 26.6, pressaoSistolica: 130, pressaoDiastolica: 82, fcRepouso: 63 },
      dorEscala: 0,
      observacoes: "Equilíbrio e disposição visivelmente melhores.",
    },
  ];

  const planoAntonio = jaNaConta(antonio.id) ?? planoDoAluno(antonio, avaliacoesAntonio, {
    semanas: 12,
    frequencia: 3,
    dataMs: dias(-35),
    disponibilidade: "Ter, qui e sáb pela manhã, 50 min",
  });
  const vividoAntonio = executarSemanas(antonio, planoAntonio, vividas(planoAntonio));

  const checklistAntonio = montarChecklist(antonio.grupoEspecial!, antonio.farmacos);
  const liberacoesAntonio = checklistAntonio
    ? [
        responderSemaforo(checklistAntonio, antonio.id, dias(-6), false),
        responderSemaforo(checklistAntonio, antonio.id, dias(-2), false),
      ]
    : [];

  return {
    alunos: [helena, antonio],
    avaliacoes: [...avaliacoesHelena, ...avaliacoesAntonio],
    planos: [planoHelena, planoAntonio],
    liberacoes: [...liberacoesHelena, ...liberacoesAntonio],
    execucoes: [...vividoHelena.execucoes, ...vividoAntonio.execucoes],
    feedbacks: [...vividoHelena.feedbacks, ...vividoAntonio.feedbacks],
  };
}
