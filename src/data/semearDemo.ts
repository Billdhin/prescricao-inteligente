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
 *    prescreve carga absoluta; quem registra quilos é o aluno. Os números daqui são
 *    plausíveis e determinísticos (derivados do slug), sobem nas semanas de carga e caem na
 *    descarga, como um registro real se pareceria.
 *
 * O espelho na nuvem: alunos, avaliações, planos e liberações sobem pela conta logada no
 * clique de "Carregar exemplos" (mesmo caminho de sempre). Execuções e PSE ficam locais,
 * porque o espelho deles na nuvem pertence à conta do ALUNO, que não existe para um demo.
 */
import type { Aluno, Avaliacao, Liberacao } from "@/data/alunos";
import type { BlocoSessao, PlanoTreino } from "@/data/periodizacao";
import type { Execucao, SessaoFeedback } from "@/data/execucao";
import type { FarmacoSelecionado } from "@/data/farmacos";
import { gerarPlano } from "@/lib/gps/periodizacao";
import { parametrosInvalidosDe } from "@/lib/gps/farmacos";
import { criarRestricao } from "@/lib/gps/restricoes";
import { avaliarSemaforo, montarChecklist, type ChecklistSemaforo } from "@/data/semaforo";

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
function planoDoAluno(
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
 * O histórico de execução: as semanas já vividas do plano, série a série.
 *
 * A carga-base vem do slug (determinística), sobe ~2,5% a cada semana de CARGA já cumprida
 * e cai 30% na descarga, que é o desenho da própria descarga. Repetições seguem o alvo da
 * semana (`repsAlvo`), com o tropeço ocasional de uma repetição a menos, porque histórico
 * perfeito demais não parece histórico.
 */
function executarSemanas(
  plano: PlanoTreino,
  semanasConcluidas: number,
  esforcoBase: number,
): { execucoes: Execucao[]; feedbacks: SessaoFeedback[] } {
  const execucoes: Execucao[] = [];
  const feedbacks: SessaoFeedback[] = [];
  let cargasVividas = 0;
  for (const meso of plano.macrociclo.mesociclos) {
    for (const micro of meso.microciclos) {
      if (micro.semana > semanasConcluidas) continue;
      const deload = micro.tipo !== "carga";
      if (!deload) cargasVividas++;
      micro.sessoes.forEach((sessao, si) => {
        // Dias alternados dentro da semana (seg/qua/sex), fim de tarde. A sessão cujo dia
        // natural ainda não chegou NÃO ganha registro: clampar para "agora" empilhava três
        // treinos em "hoje" na linha do tempo, e sessão futura sem registro é exatamente o
        // que um histórico real teria.
        const diaDaSessao = plano.data + (micro.semana - 1) * 7 * DIA + si * 2 * DIA + 18 * 60 * 60 * 1000;
        if (diaDaSessao > Date.now() - 12 * 60 * 60 * 1000) return;
        const forca = sessao.blocos.filter((b: BlocoSessao) => b.tipo !== "aerobio" && b.exercicioSlug);
        for (const b of forca) {
          const base = 8 + (hash(b.exercicioSlug!) % 15) * 2; // 8 a 36 kg, estável por exercício
          const fator = deload ? 0.7 : 1 + 0.025 * Math.max(0, cargasVividas - 1);
          const tropeco = (hash(b.id) + micro.semana) % 5 === 0 ? 1 : 0;
          execucoes.push({
            id: `exec-${plano.alunoId}-${micro.semana}-${b.id}`,
            alunoId: plano.alunoId,
            planoId: plano.id,
            semana: micro.semana,
            sessaoRef: sessao.id,
            blocoRef: b.id,
            exercicioSlug: b.exercicioSlug,
            cargaFeita: Math.max(4, Math.round(base * fator)),
            repsFeitas: Math.max(4, (b.repsAlvo ?? 10) - tropeco),
            rpe: deload ? 6 : esforcoBase + ((hash(b.id) + micro.semana) % 2),
            concluidoEm: diaDaSessao,
          });
        }
        feedbacks.push({
          id: `fb-${plano.alunoId}-${micro.semana}-${sessao.id}`,
          alunoId: plano.alunoId,
          planoId: plano.id,
          semana: micro.semana,
          sessaoRef: sessao.id,
          pse: deload ? 4 : Math.min(8, esforcoBase - 1 + ((hash(sessao.id) + micro.semana) % 3)),
          duracaoMin: 46 + (hash(sessao.id) % 16),
          observacao:
            micro.semana === semanasConcluidas && si === 0 ? "Semana boa. Senti firmeza nos exercícios guiados." : undefined,
          concluidaEm: diaDaSessao + 55 * 60 * 1000,
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
function responderSemaforo(
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

export function semearDemoVSL(): DemoVSL {
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
  const planoHelena = planoDoAluno(helena, avaliacoesHelena, {
    semanas: 12,
    frequencia: 3,
    dataMs: dias(-63),
    disponibilidade: "Seg, qua e sex, cerca de 55 min",
  });
  const vividoHelena = executarSemanas(planoHelena, 9, 7);

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

  const planoAntonio = planoDoAluno(antonio, avaliacoesAntonio, {
    semanas: 12,
    frequencia: 3,
    dataMs: dias(-35),
    disponibilidade: "Ter, qui e sáb pela manhã, 50 min",
  });
  const vividoAntonio = executarSemanas(planoAntonio, 5, 6);

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
