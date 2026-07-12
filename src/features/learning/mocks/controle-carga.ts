import type { Lesson, Module } from "../types";
import { deepLesson, deepModule, q } from "./authoring";

/** CONTROLE DE CARGA E RECUPERAÇÃO, disciplina autorada em profundidade. */

const DISC = "controle-de-carga-e-recuperacao";
const DISC_ID = "d-carga";
const K = "Controle de carga e recuperação";

const srpe = deepLesson({
  disciplineSlug: DISC,
  moduleId: `m-${DISC}-carga-interna`,
  moduleSlug: "carga-interna",
  slug: `${DISC}--srpe`,
  title: "sRPE: medir a carga interna sem equipamento",
  subtitle: "Carga interna e externa",
  description: "Percepção de esforço vezes duração dá uma medida simples e barata do quanto uma sessão custou ao aluno.",
  level: "intermediario",
  minutes: 11,
  type: "conceito",
  kicker: K,
  tags: ["sRPE", "carga interna", "monitoramento"],
  hero: "Duas pessoas podem fazer o mesmo treino prescrito e sair com desgastes muito diferentes. A carga interna captura esse custo real; a sRPE a estima com uma pergunta e um relógio.",
  question: "Como acompanhar se a semana de treino está pesada demais para um aluno, sem depender de equipamentos caros?",
  concepts: [
    { term: "Carga interna", definition: "O estresse que o treino de fato impôs ao organismo, que varia com condicionamento, sono e estado do dia, mesmo quando o treino prescrito é igual." },
    { term: "sRPE (carga da sessão)", definition: "Percepção de esforço da sessão (escala 0 a 10) multiplicada pela duração em minutos. Estima a carga interna de forma simples (Foster et al., 2001)." },
  ],
  chart: {
    title: "Exemplo de carga por sessão (sRPE)",
    points: [
      { label: "Leve, 40 min (PSE 3)", value: 120 },
      { label: "Moderada, 50 min (PSE 5)", value: 250 },
      { label: "Intensa, 45 min (PSE 8)", value: 360 },
    ],
    explanation: "A carga da sessão é PSE vezes minutos. Somando as sessões, obtém-se a carga semanal, útil para enxergar aumentos bruscos. Valores ilustrativos.",
  },
  apply: "Ao final de cada sessão, pergunte a percepção de esforço (0 a 10) e multiplique pela duração. Some ao longo da semana para acompanhar a carga interna e evitar saltos bruscos. É uma ferramenta acessível para dosar volume e antecipar fadiga, especialmente quando o aluno treina por conta em alguns dias.",
  special: [
    "Iniciantes: aumentos graduais da carga semanal reduzem dor excessiva e risco; a sRPE ajuda a enxergar o ritmo.",
    "Rotinas instáveis: a sRPE capta semanas mais pesadas por estresse ou sono, mesmo com treino igual.",
    "Idosos: acompanhar a carga interna ajuda a respeitar uma recuperação mais lenta.",
  ],
  mistake: {
    mistake: "Perguntar a percepção de esforço no meio da série ou logo no aquecimento, quando ela ainda não reflete a sessão inteira.",
    instead: "Colete a percepção alguns minutos após o término, referente à sessão como um todo. É assim que a sRPE representa a carga real.",
  },
  professionalCase: {
    prompt: "Aluno relata cansaço crescente. Ao revisar, você vê que a carga semanal por sRPE saltou muito de uma semana para a outra. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Suavizar a próxima semana e retomar aumentos graduais, observando a sRPE.", tone: "recomendada", feedback: "Coerente. O salto brusco de carga interna explica o cansaço; voltar a progredir gradual protege a recuperação." },
      { id: "c2", label: "Manter o aumento, assumindo que ele vai se adaptar.", tone: "cautela", feedback: "Saltos bruscos de carga elevam o risco de fadiga e lesão; insistir tende a piorar." },
      { id: "c3", label: "Reduzir a zero por uma semana completa.", tone: "aceitavel", feedback: "Nem sempre é preciso zerar; suavizar e retomar gradual costuma bastar." },
    ],
  },
  quiz: [
    q("q1", "variavel", "A carga da sessão por sRPE é calculada por:", [
      { id: "a", label: "Percepção de esforço (0 a 10) multiplicada pela duração em minutos." },
      { id: "b", label: "Apenas a carga levantada em quilos." },
    ], "a", "sRPE é PSE vezes duração; capta o custo interno da sessão, não só a carga externa."),
    q("q2", "conduta", "Diante de um salto brusco na carga semanal por sRPE e cansaço crescente, o mais coerente é:", [
      { id: "a", label: "Suavizar a semana seguinte e retomar aumentos graduais." },
      { id: "b", label: "Manter o aumento para forçar adaptação." },
    ], "a", "Aumentos graduais e uma semana mais leve restauram a recuperação; saltos bruscos elevam o risco."),
  ],
  uncertainty: "A sRPE é uma estimativa e sofre influência do estado do dia; não substitui o julgamento clínico. Use a tendência da carga, não valores isolados.",
  related: [
    { title: "Carga externa", href: `/aprender/conteudos/${DISC}--carga-externa`, type: "conceito" },
    { title: "Sinais de fadiga", href: `/aprender/conteudos/${DISC}--sinais-fadiga`, type: "mecanismo" },
    { title: "Percepção de esforço (Borg)", href: "/aprender/conteudos/treinamento-cardiorrespiratorio--zonas-fc", type: "conceito" },
  ],
  refs: ["ref-foster-srpe-2001", "ref-borg-pse", "ref-acsm-getp11"],
  applyRx: "Colete a percepção de esforço após cada sessão e multiplique pela duração; some na semana para acompanhar a carga interna e evitar saltos bruscos, ajustando o volume pela tendência.",
});

const cargaExterna = deepLesson({
  disciplineSlug: DISC,
  moduleId: `m-${DISC}-carga-interna`,
  moduleSlug: "carga-interna",
  slug: `${DISC}--carga-externa`,
  title: "Carga externa: o que foi prescrito",
  subtitle: "Carga interna e externa",
  description: "Séries, repetições, carga, distância e tempo descrevem o trabalho pedido. Comparar com a resposta interna fecha o ciclo.",
  level: "intermediario",
  minutes: 9,
  type: "conceito",
  kicker: K,
  tags: ["carga externa", "volume", "monitoramento"],
  hero: "A carga externa é o trabalho que você prescreveu: séries, repetições, quilos, quilômetros, minutos. Ela diz o que foi pedido; a carga interna diz o que custou. Juntas, orientam o ajuste.",
  question: "Dois alunos fizeram exatamente o mesmo treino no papel. Por que um progride e o outro estagna, e onde procurar a diferença?",
  concepts: [
    { term: "Carga externa", definition: "O trabalho objetivamente prescrito e realizado: séries, repetições, carga, distância, tempo. É o que se planeja e se registra." },
    { term: "Relação externa e interna", definition: "A mesma carga externa gera cargas internas diferentes conforme o aluno e o dia. Comparar as duas revela quem está tolerando bem e quem está sobrecarregado." },
  ],
  apply: "Registre a carga externa (o que foi feito) junto da interna (como custou, por sRPE e percepção). Quando a carga externa igual gera respostas internas muito diferentes entre alunos ou semanas, a diferença mora na recuperação, no sono, no estresse ou no condicionamento. Responder à abertura: o mesmo treino no papel pode ter custos internos distintos; é aí que se explica a diferença de progresso.",
  special: [
    "Iniciantes: pequenos aumentos de carga externa já geram carga interna alta; progrida devagar.",
    "Atletas e avançados: precisam de carga externa maior para o mesmo estímulo interno; individualize.",
  ],
  mistake: {
    mistake: "Planejar só a carga externa e nunca conferir a resposta interna, tratando todos como se reagissem igual ao mesmo treino.",
    instead: "Compare o prescrito com o custo real. Ajustar a carga externa pela resposta interna de cada aluno é o que individualiza a progressão.",
  },
  professionalCase: {
    prompt: "Dois alunos com o mesmo programa: um evolui, o outro reclama de cansaço e não progride. Onde investigar primeiro?",
    choices: [
      { id: "c1", label: "Comparar a carga interna (sRPE, sono, estresse) de cada um, já que a externa é igual.", tone: "recomendada", feedback: "Coerente. Com a externa igual, a diferença está na resposta interna e na recuperação de cada um." },
      { id: "c2", label: "Assumir que o segundo aluno não se esforça o suficiente.", tone: "cautela", feedback: "Conclusão precipitada; o custo interno e a recuperação podem explicar a diferença sem falta de esforço." },
      { id: "c3", label: "Aumentar a carga externa de ambos igualmente.", tone: "aceitavel", feedback: "Ignora que um já está sobrecarregado; aumentar para os dois pode piorar o segundo." },
    ],
  },
  quiz: [
    q("q1", "verdadeiro-falso", "A mesma carga externa produz sempre a mesma carga interna em pessoas diferentes.", [
      { id: "v", label: "Verdadeiro" },
      { id: "f", label: "Falso" },
    ], "f", "O custo interno varia com condicionamento, sono e estresse; por isso se compara externa e interna."),
    q("q2", "conduta", "Quando o mesmo programa gera respostas muito diferentes entre alunos, procure a diferença em:", [
      { id: "a", label: "Carga interna e recuperação (sono, estresse, condicionamento)." },
      { id: "b", label: "Apenas na carga externa prescrita." },
    ], "a", "Com a externa igual, a explicação está na resposta interna e nos fatores de recuperação."),
  ],
  uncertainty: "A tradução entre carga externa e interna é individual e variável no tempo. Use as duas juntas como guia, não uma isolada.",
  related: [
    { title: "sRPE", href: `/aprender/conteudos/${DISC}--srpe`, type: "conceito" },
    { title: "Sono e estresse", href: `/aprender/conteudos/${DISC}--sono-estresse`, type: "conceito" },
    { title: "Sobrecarga progressiva", href: "/aprender/conteudos/forca-sobrecarga-progressiva", type: "conceito" },
  ],
  refs: ["ref-foster-srpe-2001", "ref-diretriz-forca", "ref-acsm-progressao-2009"],
  applyRx: "Registre a carga externa junto da interna e compare-as por aluno e por semana. Individualize a progressão ajustando o prescrito à resposta real, sobretudo quando o mesmo treino gera custos diferentes.",
});

const sonoEstresse = deepLesson({
  disciplineSlug: DISC,
  moduleId: `m-${DISC}-recuperacao`,
  moduleSlug: "recuperacao",
  slug: `${DISC}--sono-estresse`,
  title: "Sono e estresse: os pilares invisíveis da recuperação",
  subtitle: "Recuperação",
  description: "O treino é só o estímulo. Sono, nutrição e estresse determinam quanto dele vira resultado.",
  level: "intermediario",
  minutes: 10,
  type: "conceito",
  kicker: K,
  tags: ["sono", "estresse", "recuperação"],
  hero: "Você prescreve o estímulo, mas a adaptação acontece fora da academia. Sono ruim e estresse alto reduzem o quanto o treino rende, mesmo com o programa perfeito no papel.",
  question: "O programa está bem montado, mas o aluno não progride e vive cansado. O que investigar além do treino?",
  concepts: [
    { term: "Recuperação", definition: "Conjunto de fatores fora do treino (sono, nutrição, estresse, rotina) que determina quanto do estímulo se converte em adaptação." },
    { term: "Estresse total", definition: "A soma das demandas de vida e treino. Quando ela excede a capacidade de recuperação, o desempenho estagna ou piora, independentemente da qualidade do programa." },
  ],
  apply: "Ao ler estagnação ou cansaço persistente, investigue sono, alimentação, rotina e estresse antes de mudar o treino. Ajustar volume e intensidade à vida real do aluno, e orientar hábitos de recuperação dentro do seu escopo, costuma destravar o progresso mais do que trocar exercícios. Responder à abertura: com o programa bom e o aluno cansado, o gargalo provável é a recuperação.",
  special: [
    "Rotinas de plantão ou pais de recém-nascidos: recuperação comprometida pede volume e intensidade ajustados ao momento.",
    "Idosos: recuperação mais lenta valoriza sono e distribuição do volume.",
    "A conduta clínica sobre sono e saúde mental é do profissional de saúde; oriente hábitos dentro do escopo e encaminhe quando necessário.",
  ],
  mistake: {
    mistake: "Responder à estagnação sempre com mais treino ou programa novo, ignorando sono, estresse e nutrição.",
    instead: "Investigue a recuperação primeiro. Muitas vezes ajustar a carga à vida do aluno e melhorar o sono rende mais do que qualquer mudança de exercícios.",
  },
  professionalCase: {
    prompt: "Aluno com bom programa, mas dormindo mal e sob forte estresse no trabalho, estagnou e vive exausto. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Ajustar volume e intensidade ao momento e orientar hábitos de sono, reavaliando depois.", tone: "recomendada", feedback: "Coerente. O gargalo é a recuperação; adaptar a carga e cuidar do sono destrava mais do que mudar o treino." },
      { id: "c2", label: "Aumentar o volume para 'quebrar a estagnação'.", tone: "cautela", feedback: "Adicionar carga sobre recuperação insuficiente aprofunda o cansaço e a estagnação." },
      { id: "c3", label: "Trocar todo o programa por um novo.", tone: "aceitavel", feedback: "O programa não é o problema; sem cuidar da recuperação, o novo também não vai render." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Diante de estagnação com bom programa e sono ruim, o primeiro passo é:", [
      { id: "a", label: "Investigar e ajustar recuperação (sono, estresse, carga)." },
      { id: "b", label: "Aumentar o volume de treino." },
    ], "a", "Com o programa adequado, o gargalo provável é a recuperação; ajustá-la costuma destravar o progresso."),
    q("q2", "verdadeiro-falso", "Sono e estresse influenciam o quanto o treino se converte em adaptação.", [
      { id: "v", label: "Verdadeiro" },
      { id: "f", label: "Falso" },
    ], "v", "A adaptação depende da recuperação; sono ruim e estresse alto reduzem o rendimento do mesmo estímulo."),
  ],
  uncertainty: "A relação entre recuperação e desempenho é multifatorial e individual, e boa parte foge ao controle do treino. Trate hábitos de recuperação como parte da conduta, dentro do escopo.",
  related: [
    { title: "Sinais de fadiga", href: `/aprender/conteudos/${DISC}--sinais-fadiga`, type: "mecanismo" },
    { title: "Supercompensação", href: "/aprender/conteudos/fisiologia-do-exercicio--supercompensacao", type: "mecanismo" },
    { title: "Fadiga central e periférica", href: "/aprender/conteudos/fisiologia-do-exercicio--fadiga-central-periferica", type: "conceito" },
  ],
  refs: ["ref-foster-srpe-2001", "ref-diretriz-forca", "ref-oms-atividade"],
  applyRx: "Diante de estagnação ou cansaço, investigue sono, nutrição, rotina e estresse antes de mudar o treino; ajuste a carga à vida real do aluno e oriente hábitos de recuperação dentro do escopo.",
});

const sinaisFadiga = deepLesson({
  disciplineSlug: DISC,
  moduleId: `m-${DISC}-recuperacao`,
  moduleSlug: "recuperacao",
  slug: `${DISC}--sinais-fadiga`,
  title: "Sinais de fadiga: ler antes de estagnar",
  subtitle: "Recuperação",
  description: "Reconhecer a fadiga acumulada cedo permite ajustar a carga antes que ela vire lesão ou estagnação.",
  level: "intermediario",
  minutes: 10,
  type: "mecanismo",
  kicker: K,
  tags: ["fadiga acumulada", "monitoramento", "descarga"],
  hero: "A fadiga acumulada raramente avisa de uma vez. Ela aparece em sinais discretos que, lidos a tempo, permitem ajustar a carga antes que o desempenho despenque.",
  question: "Quais sinais indicam que é hora de reduzir a carga, antes que a estagnação ou a lesão apareçam?",
  concepts: [
    { term: "Fadiga acumulada", definition: "Somatório de estímulos sem recuperação suficiente, que reduz desempenho e disposição de forma progressiva." },
    { term: "Sinais de alerta de carga", definition: "Pistas práticas de fadiga acumulada: queda de desempenho, sono pior, disposição e humor baixos, dores persistentes, percepção de esforço elevada para a mesma carga." },
  ],
  timeline: {
    title: "Como a fadiga costuma se instalar",
    items: [
      { time: "Início", title: "Percepção de esforço sobe", detail: "A mesma carga parece mais pesada; a sRPE aumenta sem mudança do treino prescrito." },
      { time: "Depois", title: "Desempenho e disposição caem", detail: "Menos repetições, menos vontade de treinar, sono pior." },
      { time: "Se ignorado", title: "Estagnação ou lesão", detail: "A fadiga não resolvida vira platô prolongado ou aumenta o risco de lesão." },
    ],
  },
  apply: "Acompanhe percepção de esforço, sono, disposição e desempenho. Ao notar vários sinais juntos, reduza volume e intensidade por alguns dias (descarga) e reavalie. Agir cedo, com uma semana mais leve, custa menos do que recuperar de uma estagnação prolongada ou de uma lesão.",
  special: [
    "Idosos: menor tolerância a acúmulos; antecipe descargas e valorize sinais precoces.",
    "Alta carga de vida: os sinais aparecem mais rápido; ajuste a expectativa de progressão ao momento.",
  ],
  mistake: {
    mistake: "Interpretar a queda de desempenho como falta de esforço e responder com mais carga, ignorando os sinais de fadiga.",
    instead: "Leia o conjunto de sinais. Vários juntos pedem descarga, não mais estímulo; recuperar restaura o desempenho mais rápido.",
  },
  professionalCase: {
    prompt: "Aluno com sono pior, humor baixo, percepção de esforço alta e queda de desempenho há uma semana. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Aplicar uma semana de descarga (menos volume e intensidade) e reavaliar.", tone: "recomendada", feedback: "Coerente. Vários sinais de fadiga acumulada pedem recuperação; a descarga restaura o desempenho." },
      { id: "c2", label: "Aumentar a intensidade para superar a fase.", tone: "cautela", feedback: "Adicionar estímulo sobre fadiga acumulada aprofunda o problema e eleva o risco." },
      { id: "c3", label: "Manter tudo igual e esperar melhorar sozinho.", tone: "aceitavel", feedback: "Pode melhorar, mas agir cedo com uma descarga costuma resolver mais rápido e evita agravar." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Vários sinais de fadiga acumulada juntos (sono pior, PSE alta, desempenho em queda) pedem:", [
      { id: "a", label: "Reduzir volume e intensidade por alguns dias e reavaliar." },
      { id: "b", label: "Aumentar a carga para forçar adaptação." },
    ], "a", "A descarga permite recuperar e restaurar o desempenho; insistir na carga agrava a fadiga."),
    q("q2", "variavel", "Um sinal precoce de fadiga acumulada é:", [
      { id: "a", label: "A mesma carga passar a exigir percepção de esforço mais alta." },
      { id: "b", label: "Aumento espontâneo do desempenho." },
    ], "a", "Percepção de esforço subindo para a mesma carga é uma pista precoce de fadiga acumulada."),
  ],
  uncertainty: "Não há um marcador único e infalível de fadiga; a leitura é do conjunto de sinais e do contexto. Prefira agir cedo diante de vários sinais a esperar por certeza.",
  related: [
    { title: "Sono e estresse", href: `/aprender/conteudos/${DISC}--sono-estresse`, type: "conceito" },
    { title: "sRPE", href: `/aprender/conteudos/${DISC}--srpe`, type: "conceito" },
    { title: "Sobrecarga progressiva", href: "/aprender/conteudos/forca-sobrecarga-progressiva", type: "conceito" },
  ],
  refs: ["ref-foster-srpe-2001", "ref-borg-pse", "ref-acsm-progressao-2009"],
  applyRx: "Acompanhe percepção de esforço, sono, disposição e desempenho; ao ver vários sinais juntos, aplique uma descarga breve e reavalie. Agir cedo custa menos do que recuperar de estagnação ou lesão.",
});

export const controleCargaModules: Module[] = [
  deepModule({
    id: `m-${DISC}-carga-interna`,
    disciplineId: DISC_ID,
    slug: "carga-interna",
    title: "Carga interna e externa",
    objective: "Monitorar a dose real do treino, além do que foi prescrito.",
    order: 1,
    level: "intermediario",
    lessons: [srpe, cargaExterna],
    applications: ["Acompanhar carga interna por sRPE e comparar com o prescrito"],
  }),
  deepModule({
    id: `m-${DISC}-recuperacao`,
    disciplineId: DISC_ID,
    slug: "recuperacao",
    title: "Recuperação",
    objective: "Equilibrar estímulo e recuperação lendo os sinais do aluno.",
    order: 2,
    level: "intermediario",
    prerequisites: [`m-${DISC}-carga-interna`],
    lessons: [sonoEstresse, sinaisFadiga],
    applications: ["Ajustar carga e programar descargas pelos sinais de fadiga"],
  }),
];

export const controleCargaLessons: Lesson[] = [srpe, cargaExterna, sonoEstresse, sinaisFadiga];
