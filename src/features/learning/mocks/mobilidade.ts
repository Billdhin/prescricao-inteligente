import type { Lesson, Module } from "../types";
import { deepLesson, deepModule, q } from "./authoring";

/** MOBILIDADE E FLEXIBILIDADE, disciplina autorada em profundidade. */

const DISC = "mobilidade-e-flexibilidade";
const DISC_ID = "d-mobilidade";
const K = "Mobilidade e flexibilidade";

const flexVsMob = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-conceitos-mobilidade`, moduleSlug: "conceitos-mobilidade",
  slug: `${DISC}--flexibilidade-vs-mobilidade`, title: "Flexibilidade e mobilidade não são a mesma coisa",
  subtitle: "Conceitos de mobilidade", description: "Alcançar uma amplitude passiva é diferente de controlá-la ativamente. A distinção muda o que se treina.",
  level: "fundamental", minutes: 10, type: "conceito", kicker: K, tags: ["mobilidade", "flexibilidade", "amplitude ativa"],
  hero: "Tocar os pés com as mãos não é o mesmo que agachar fundo com controle. Flexibilidade é a amplitude que se alcança de forma passiva; mobilidade é a que se controla ativamente. Treinar a diferença muda a conduta.",
  question: "Um aluno tem muita flexibilidade passiva de quadril, mas não consegue agachar fundo com controle. O que falta treinar?",
  concepts: [
    { term: "Flexibilidade", definition: "Amplitude de movimento passiva de uma articulação, alcançada com ajuda externa ou relaxamento, sem necessidade de controle ativo." },
    { term: "Mobilidade", definition: "Amplitude ativa e controlada de uma articulação: a faixa que a pessoa consegue usar com força e coordenação, não apenas alcançar." },
  ],
  apply: "Priorize a amplitude que o aluno controla, não só a que alcança. Se falta controle ativo na amplitude, trabalhe força e coordenação nessa faixa, não apenas alongamento passivo. Responder à abertura: com boa flexibilidade passiva mas pouco controle, falta mobilidade ativa; treine força e controle na amplitude do agachamento.",
  special: [
    "Idosos: mobilidade ativa (controlar a amplitude) protege mais a função e o equilíbrio do que ganhar amplitude passiva.",
    "Hipermóveis: amplitude passiva de sobra pede foco em controle e força, não em mais flexibilidade.",
    "Iniciantes: usar a amplitude que controlam com segurança vale mais do que buscar a máxima.",
  ],
  mistake: {
    mistake: "Perseguir amplitude passiva máxima (alongar sempre mais) achando que isso melhora o movimento, sem treinar controle.",
    instead: "Trabalhe a amplitude que o aluno controla ativamente. Força e coordenação na faixa útil transferem para o movimento; flexibilidade passiva sozinha, nem sempre.",
  },
  professionalCase: {
    prompt: "Aluna faz espacate com facilidade, mas perde o controle do quadril no agachamento profundo. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Treinar força e controle na amplitude do agachamento, já que a flexibilidade passiva não é o limitante.", tone: "recomendada", feedback: "Coerente. O que falta é mobilidade ativa; força e coordenação na faixa útil resolvem melhor do que mais alongamento." },
      { id: "c2", label: "Prescrever mais alongamento passivo de quadril.", tone: "cautela", feedback: "A flexibilidade passiva já é ampla; o limitante é o controle ativo, não a amplitude alcançada." },
      { id: "c3", label: "Reduzir a amplitude do agachamento indefinidamente.", tone: "aceitavel", feedback: "Reduzir pode ser adaptação temporária, mas o objetivo é ganhar controle na amplitude, não evitá-la para sempre." },
    ],
  },
  quiz: [
    q("q1", "variavel", "A amplitude que a pessoa controla ativamente, com força e coordenação, é a:", [
      { id: "a", label: "Mobilidade." }, { id: "b", label: "Flexibilidade." },
    ], "a", "Mobilidade é a amplitude ativa e controlada; flexibilidade é a amplitude passiva alcançada."),
    q("q2", "conduta", "Com boa flexibilidade passiva mas pouco controle na amplitude, o foco deve ser:", [
      { id: "a", label: "Força e controle ativo na faixa útil." },
      { id: "b", label: "Mais alongamento passivo." },
    ], "a", "O limitante é a mobilidade ativa; treinar controle na amplitude transfere para o movimento."),
  ],
  uncertainty: "A relação entre flexibilidade, mobilidade e desempenho é complexa e depende da tarefa. Priorize a amplitude útil e controlada, ajustando ao objetivo do aluno.",
  related: [
    { title: "Amplitude útil", href: `/aprender/conteudos/${DISC}--amplitude-util`, type: "conceito" },
    { title: "Trabalho de mobilidade", href: `/aprender/conteudos/${DISC}--mobilidade-articular`, type: "mecanismo" },
    { title: "Estabilidade e mobilidade", href: "/aprender/conteudos/anatomia-funcional--estabilidade-vs-mobilidade", type: "conceito" },
  ],
  refs: ["ref-diretriz-forca", "ref-acsm-getp11"],
  applyRx: "Priorize a amplitude que o aluno controla ativamente; se falta controle, treine força e coordenação na faixa útil, não apenas alongamento passivo.",
});

const amplitudeUtil = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-conceitos-mobilidade`, moduleSlug: "conceitos-mobilidade",
  slug: `${DISC}--amplitude-util`, title: "Amplitude útil: quanto mover, e por quê",
  subtitle: "Conceitos de mobilidade", description: "A faixa que entrega o estímulo desejado com tolerância adequada, que nem sempre é a máxima.",
  level: "fundamental", minutes: 9, type: "conceito", kicker: K, tags: ["amplitude útil", "adaptação", "tolerância"],
  hero: "Mais amplitude nem sempre é melhor. A amplitude útil é a que entrega o estímulo desejado com boa tolerância. Reduzir amplitude pode ser uma adaptação legítima, não uma falha.",
  question: "Um aluno com ombro sensível não tolera a amplitude completa no supino. Reduzir a amplitude é 'fazer errado'?",
  concepts: [
    { term: "Amplitude útil", definition: "Faixa de movimento que entrega o estímulo pretendido com tolerância adequada. Depende do objetivo, da anatomia e da condição do aluno." },
    { term: "Amplitude como variável", definition: "A amplitude é uma variável ajustável, como carga e volume. Reduzi-la de forma intencional é uma adaptação a serviço do objetivo e do conforto." },
  ],
  apply: "Escolha a amplitude que serve ao objetivo com boa tolerância, não a máxima por princípio. Reduzir amplitude para respeitar uma condição é adaptação, desde que preserve o estímulo. Responder à abertura: para o ombro sensível, ajustar a amplitude do supino ao conforto mantém o estímulo com segurança; não é fazer errado.",
  special: [
    "Ombro e joelho sensíveis: ajustar amplitude ao conforto mantém o treino sem provocar.",
    "Iniciantes: começar em amplitude controlada e ampliar com o domínio técnico é prudente.",
    "Hipertrofia: em geral amplitudes maiores são um bom estímulo, mas a tolerância individual pondera.",
  ],
  mistake: {
    mistake: "Tratar a amplitude máxima como sempre certa e a reduzida como sempre errada, ignorando objetivo e tolerância.",
    instead: "Ajuste a amplitude ao objetivo e à tolerância. Reduzir de forma intencional, preservando o estímulo, é uma adaptação legítima.",
  },
  professionalCase: {
    prompt: "Aluno sente desconforto no ombro no fim da descida do supino, sem sinais de alerta. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Ajustar a amplitude ao trecho tolerado, mantendo o estímulo, e ampliar conforme a tolerância melhora.", tone: "recomendada", feedback: "Coerente. A amplitude útil respeita o conforto e preserva o estímulo; ampliar depois é possível." },
      { id: "c2", label: "Insistir na amplitude completa para 'não fazer errado'.", tone: "cautela", feedback: "Forçar a amplitude dolorosa desrespeita a tolerância; a amplitude máxima não é um objetivo em si." },
      { id: "c3", label: "Remover o supino do programa.", tone: "aceitavel", feedback: "Antes de remover, ajustar a amplitude costuma manter o estímulo com segurança." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Diante de desconforto sem alerta no fim da amplitude, o mais coerente é:", [
      { id: "a", label: "Ajustar para a amplitude tolerada, preservando o estímulo." },
      { id: "b", label: "Insistir na amplitude máxima sempre." },
    ], "a", "A amplitude útil serve ao objetivo com tolerância; reduzir de forma intencional é adaptação legítima."),
    q("q2", "verdadeiro-falso", "Reduzir a amplitude de um exercício é sempre um erro de execução.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "f", "Reduzir amplitude pode ser adaptação a serviço do objetivo e da tolerância; não é erro por si."),
  ],
  uncertainty: "A amplitude ideal varia por objetivo, exercício e indivíduo, e a evidência favorece amplitudes maiores em vários casos, com exceções. Ajuste pela tolerância e pelo objetivo.",
  related: [
    { title: "Flexibilidade e mobilidade", href: `/aprender/conteudos/${DISC}--flexibilidade-vs-mobilidade`, type: "conceito" },
    { title: "Amplitude e demanda", href: "/aprender/conteudos/amplitude-e-demanda", type: "mecanismo" },
    { title: "Adaptar sem esvaziar", href: "/aprender/conteudos/prescricao-para-grupos-especiais--adaptar-sem-esvaziar", type: "conceito" },
  ],
  refs: ["ref-diretriz-forca", "ref-acsm-getp11"],
  applyRx: "Escolha a amplitude que serve ao objetivo com boa tolerância, não a máxima por princípio; reduzir de forma intencional, preservando o estímulo, é uma adaptação válida.",
});

const alongamento = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-metodos-mobilidade`, moduleSlug: "metodos-mobilidade",
  slug: `${DISC}--alongamento`, title: "Alongamento: efeitos dependem de dose e contexto",
  subtitle: "Métodos de trabalho", description: "O alongamento aumenta a tolerância ao estiramento e a amplitude, com efeitos que variam com tipo, dose e momento.",
  level: "intermediario", minutes: 9, type: "conceito", kicker: K, tags: ["alongamento", "amplitude", "dose"],
  hero: "O alongamento tem seu lugar, mas os efeitos dependem de tipo, dose e quando é feito. Entender isso evita tanto o exagero quanto o abandono do recurso.",
  question: "Faz sentido alongar longamente e de forma passiva logo antes de um treino de força máxima?",
  concepts: [
    { term: "Alongamento", definition: "Estímulo que aumenta a tolerância ao estiramento e, com o tempo, a amplitude. Os efeitos dependem do tipo (estático, dinâmico), da dose e do contexto." },
    { term: "Efeito agudo e crônico", definition: "De forma aguda, alongamento estático intenso e prolongado pode reduzir momentaneamente a força; de forma crônica, o trabalho regular pode aumentar a amplitude." },
  ],
  apply: "Use alongamento conforme o objetivo e o momento: dinâmico no aquecimento, estático mais em momentos de recuperação ou para ganho de amplitude ao longo do tempo. Responder à abertura: alongamento estático longo logo antes de força máxima pode reduzir momentaneamente o desempenho; prefira aquecimento dinâmico antes de treinar força.",
  special: [
    "Idosos: trabalho de amplitude regular ajuda a manter função; escolher o tipo conforme o objetivo.",
    "Antes de esforço de força ou potência: preferir mobilização dinâmica ao alongamento estático prolongado.",
    "Recuperação e relaxamento: alongamento suave pode ter papel, sem expectativa de prevenir lesões por si só.",
  ],
  mistake: {
    mistake: "Fazer alongamento estático longo e passivo imediatamente antes de treino de força, esperando melhorar o desempenho.",
    instead: "Reserve o estático prolongado para fora do aquecimento de força; antes do esforço, prefira mobilização dinâmica que prepara o movimento.",
  },
  professionalCase: {
    prompt: "Aluno alonga estaticamente por vários minutos antes de tentar cargas máximas e reclama que 'fica fraco'. Qual conduta é mais coerente?",
    choices: [
      { id: "c1", label: "Trocar por aquecimento dinâmico específico antes do esforço e deixar o estático para outro momento.", tone: "recomendada", feedback: "Coerente. O alongamento estático longo pode reduzir a força aguda; o aquecimento dinâmico prepara melhor." },
      { id: "c2", label: "Aumentar ainda mais o tempo de alongamento estático.", tone: "cautela", feedback: "Mais estático prolongado tende a piorar o desempenho agudo de força." },
      { id: "c3", label: "Remover qualquer preparação antes do treino.", tone: "aceitavel", feedback: "Alguma preparação é útil; o ajuste é o tipo, não eliminar o aquecimento." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Antes de um treino de força máxima, a preparação mais coerente é:", [
      { id: "a", label: "Aquecimento dinâmico específico." },
      { id: "b", label: "Alongamento estático longo e passivo." },
    ], "a", "O estático prolongado pode reduzir a força aguda; o aquecimento dinâmico prepara o movimento."),
    q("q2", "verdadeiro-falso", "Os efeitos do alongamento dependem do tipo, da dose e do momento em que é feito.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "v", "Tipo, dose e contexto determinam os efeitos agudos e crônicos do alongamento."),
  ],
  uncertainty: "As evidências sobre alongamento e prevenção de lesões são limitadas e específicas por contexto. Use-o pelos efeitos de amplitude e conforto, sem prometer o que não se sustenta.",
  related: [
    { title: "Mobilidade articular", href: `/aprender/conteudos/${DISC}--mobilidade-articular`, type: "mecanismo" },
    { title: "Amplitude útil", href: `/aprender/conteudos/${DISC}--amplitude-util`, type: "conceito" },
    { title: "Incerteza científica", href: "/aprender/conteudos/leitura-critica-de-evidencias--incerteza", type: "conceito" },
  ],
  refs: ["ref-diretriz-forca", "ref-acsm-getp11"],
  applyRx: "Use alongamento conforme objetivo e momento: dinâmico no aquecimento, estático para recuperação ou ganho de amplitude ao longo do tempo, evitando estático prolongado logo antes de força ou potência.",
});

const mobilidadeArticular = deepLesson({
  disciplineSlug: DISC, moduleId: `m-${DISC}-metodos-mobilidade`, moduleSlug: "metodos-mobilidade",
  slug: `${DISC}--mobilidade-articular`, title: "Trabalho de mobilidade: amplitude com controle",
  subtitle: "Métodos de trabalho", description: "Exercícios ativos que ampliam o movimento controlado da articulação, integrados ao aquecimento e ao próprio treino.",
  level: "intermediario", minutes: 9, type: "mecanismo", kicker: K, tags: ["mobilidade articular", "controle", "aquecimento"],
  hero: "Ganhar amplitude que se controla vale mais do que amplitude solta. O trabalho de mobilidade usa exercícios ativos para ampliar o movimento com controle, e costuma render mais integrado ao treino do que isolado.",
  question: "Como melhorar a mobilidade de tornozelo de um aluno para agachar melhor, sem transformar o treino numa sessão só de alongamento?",
  concepts: [
    { term: "Trabalho de mobilidade", definition: "Exercícios ativos que ampliam a amplitude controlada de uma articulação, combinando alcance de amplitude com força e coordenação nessa faixa." },
    { term: "Integração ao treino", definition: "Inserir mobilidade no aquecimento específico e nos próprios exercícios (por exemplo, agachar na amplitude tolerada) costuma transferir melhor do que trabalhá-la isolada." },
  ],
  mechanism: {
    title: "Como a mobilidade se desenvolve",
    steps: [
      { label: "Alcançar a amplitude", detail: "Ativar a articulação até o limite tolerado, sem forçar dor." },
      { label: "Adicionar controle", detail: "Trabalhar força e coordenação na faixa nova, para que ela se torne utilizável." },
      { label: "Integrar ao movimento", detail: "Usar a amplitude nos próprios exercícios, transferindo para a tarefa." },
      { label: "Progredir aos poucos", detail: "Ampliar gradualmente, respeitando a tolerância e a resposta." },
    ],
  },
  apply: "Trabalhe a mobilidade da articulação-alvo com exercícios ativos no aquecimento e dentro dos próprios movimentos, adicionando controle à amplitude nova. Responder à abertura: para o tornozelo, mobilizações ativas no aquecimento mais agachar na amplitude tolerada melhoram a mobilidade sem virar uma sessão de alongamento isolado.",
  special: [
    "Idosos: mobilidade ativa integrada ao treino melhora função e equilíbrio.",
    "Restrições articulares: progredir a amplitude pela tolerância, dentro do conforto.",
    "Pouco tempo: integrar a mobilidade ao aquecimento e aos exercícios é mais eficiente do que sessões à parte.",
  ],
  mistake: {
    mistake: "Fazer longas sessões de mobilidade isolada esperando transferência automática para o movimento.",
    instead: "Integre a mobilidade ao aquecimento e aos próprios exercícios, adicionando controle à amplitude. A amplitude controlada e usada transfere melhor.",
  },
  professionalCase: {
    prompt: "Aluno quer agachar mais fundo e faz muita mobilidade de tornozelo isolada, sem transferir para o agachamento. Qual ajuste é mais coerente?",
    choices: [
      { id: "c1", label: "Integrar mobilizações ativas ao aquecimento e treinar o agachamento na amplitude tolerada, adicionando controle.", tone: "recomendada", feedback: "Coerente. Amplitude controlada e usada no movimento transfere melhor do que mobilidade isolada." },
      { id: "c2", label: "Aumentar o tempo de mobilidade isolada.", tone: "cautela", feedback: "Mais mobilidade isolada sem integração tende a transferir pouco para a tarefa." },
      { id: "c3", label: "Desistir de aprofundar o agachamento.", tone: "aceitavel", feedback: "Antes de desistir, integrar a mobilidade ao movimento costuma resolver." },
    ],
  },
  quiz: [
    q("q1", "conduta", "Para a mobilidade transferir para o movimento, o mais eficaz é:", [
      { id: "a", label: "Integrá-la ao aquecimento e aos próprios exercícios, com controle na amplitude." },
      { id: "b", label: "Fazer longas sessões de mobilidade isolada." },
    ], "a", "Amplitude controlada e usada no movimento transfere melhor do que mobilidade isolada."),
    q("q2", "verdadeiro-falso", "Adicionar controle (força e coordenação) à amplitude nova ajuda a torná-la utilizável.", [
      { id: "v", label: "Verdadeiro" }, { id: "f", label: "Falso" },
    ], "v", "A amplitude que se controla é a que se usa; força e coordenação na faixa nova a tornam utilizável."),
  ],
  uncertainty: "A dose e os métodos ideais de mobilidade variam por articulação e objetivo, com evidência ainda em construção. Priorize amplitude controlada e integração ao treino.",
  related: [
    { title: "Flexibilidade e mobilidade", href: `/aprender/conteudos/${DISC}--flexibilidade-vs-mobilidade`, type: "conceito" },
    { title: "Alongamento", href: `/aprender/conteudos/${DISC}--alongamento`, type: "conceito" },
    { title: "Padrão agachar", href: "/aprender/conteudos/padrao-agachar", type: "aplicacao" },
  ],
  refs: ["ref-diretriz-forca", "ref-acsm-getp11"],
  applyRx: "Trabalhe a mobilidade da articulação-alvo com exercícios ativos no aquecimento e dentro dos próprios movimentos, adicionando controle à amplitude nova e progredindo pela tolerância.",
});

export const mobilidadeModules: Module[] = [
  deepModule({ id: `m-${DISC}-conceitos-mobilidade`, disciplineId: DISC_ID, slug: "conceitos-mobilidade", title: "Conceitos de mobilidade", objective: "Diferenciar flexibilidade, mobilidade e amplitude útil.", order: 1, level: "fundamental", lessons: [flexVsMob, amplitudeUtil], applications: ["Priorizar amplitude controlada e útil ao objetivo"] }),
  deepModule({ id: `m-${DISC}-metodos-mobilidade`, disciplineId: DISC_ID, slug: "metodos-mobilidade", title: "Métodos de trabalho", objective: "Escolher a estratégia de amplitude conforme o objetivo.", order: 2, level: "intermediario", prerequisites: [`m-${DISC}-conceitos-mobilidade`], lessons: [alongamento, mobilidadeArticular], applications: ["Escolher alongamento e mobilidade conforme objetivo e momento"] }),
];

export const mobilidadeLessons: Lesson[] = [flexVsMob, amplitudeUtil, alongamento, mobilidadeArticular];
